// scripts/geodata/_geonames_common.mjs
// ─────────────────────────────────────────────────────────────────────────
// CURATED-GEODATA pipeline — shared helpers (country-agnostic)
//
// Data attribution:
//   GeoNames (https://www.geonames.org) — licensed CC-BY 4.0
//   Country dumps: https://download.geonames.org/export/dump/{XX}.zip
//
// This module is intentionally pure functions + small constants. No I/O
// outside what callers explicitly do. Easy to unit-test.
//
// Country-specific constants (BBOX, admin1 → region map, country names,
// timezone, URL) live in `./countries/{cc}.js` — loaded via
// `loadCountryConfig(cc)`.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Static project paths ───
export const BASE_PATHS = {
    projectRoot:   path.resolve(__dirname, '..', '..'),
    sourceDir:     path.resolve(__dirname, '..', '..', 'db', 'places', 'sources'),
    candidateDir:  path.resolve(__dirname, '..', '..', 'db', 'places', 'candidates'),
    reportDir:     path.resolve(__dirname, '..', '..', 'reports'),
    curatedPath:   path.resolve(__dirname, '..', '..', 'db', 'places', 'curated-places.json')
};

// Per-country paths. `cc` is lowercase 2-letter ISO code (e.g. 'sa', 'qa').
export function pathsFor(cc) {
    const C = String(cc || '').toLowerCase();
    const UC = C.toUpperCase();
    return {
        ...BASE_PATHS,
        cc:             C,
        zip:            path.join(BASE_PATHS.sourceDir,    UC + '.zip'),
        txt:            path.join(BASE_PATHS.sourceDir,    UC + '.txt'),
        rawJson:        path.join(BASE_PATHS.candidateDir, C + '-geonames-raw.json'),
        normalizedJson: path.join(BASE_PATHS.candidateDir, C + '-geonames-normalized.json'),
        candidatesJson: path.join(BASE_PATHS.candidateDir, C + '-geonames-candidates.json'),
        reportMd:       path.join(BASE_PATHS.reportDir,    C + '-geodata-import-report.md'),
        aliasReportMd:  path.join(BASE_PATHS.reportDir,    C + '-geodata-aliases-review.md')
    };
}

// Backward-compat alias for the old name (PATHS = pathsFor('sa')).
// Some external scripts may still import { PATHS }; left as `undefined`
// to surface accidental usage. To get paths, use `pathsFor(cc)`.
// export const PATHS = undefined;  // removed — callers must use pathsFor

// Dynamically load per-country config from ./countries/{cc}.mjs
// Returns the default export (config object). Throws if the country
// has no config file.
export async function loadCountryConfig(cc) {
    const C = String(cc || '').toLowerCase();
    const fp = path.join(__dirname, 'countries', C + '.mjs');
    if (!fs.existsSync(fp)) {
        throw new Error('No country config at ' + fp +
            ' — create scripts/geodata/countries/' + C + '.mjs first');
    }
    // Use file:// URL for cross-platform ESM dynamic import
    const fileUrl = new URL('file://' + fp.replace(/\\/g, '/')).href;
    const mod = await import(fileUrl);
    if (!mod || !mod.default) {
        throw new Error('Country config ' + fp + ' has no default export');
    }
    return mod.default;
}

export function ensureDirs() {
    for (const dir of [BASE_PATHS.sourceDir, BASE_PATHS.candidateDir, BASE_PATHS.reportDir]) {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }
}

// ─── GeoNames dump constants ───
// 19-field schema for the country-specific dump
export const GEONAMES_FIELDS = [
    'geonameid', 'name', 'asciiname', 'alternatenames',
    'latitude', 'longitude',
    'feature_class', 'feature_code',
    'country_code', 'cc2',
    'admin1_code', 'admin2_code', 'admin3_code', 'admin4_code',
    'population', 'elevation', 'dem',
    'timezone', 'modification_date'
];

// Feature codes we ACCEPT (populated places only)
export const ACCEPTED_FEATURE_CODES = new Set([
    'PPLC',  // national capital
    'PPLA',  // first-order admin seat
    'PPLA2', // second-order admin seat (governorate)
    'PPLA3', // third-order admin seat (markaz)
    'PPLA4', // fourth-order admin seat
    'PPL',   // generic populated place
    'PPLS',  // populated places (cluster)
    'PPLL'   // populated locality (small villages — Stage 3 may flag)
]);

// Feature codes we EXPLICITLY REJECT
export const REJECTED_FEATURE_CODES = new Set([
    'PPLF',  // farm
    'PPLH',  // historical
    'PPLQ',  // abandoned
    'PPLX',  // section of a populated place (district / sub-area)
    'PPLW',  // destroyed
    'PPLR',  // religious (likely overlap with PPL — caller can decide)
    'PPLG'   // seat of government (often duplicate)
]);

// Country-specific bounding boxes + admin1 maps live in
// `./countries/{cc}.js`. Use `loadCountryConfig(cc)` to access them.

// ─── HTTP download (Node built-in, no deps) ───
export function downloadFile(url, destPath, redirects = 5) {
    return new Promise((resolve, reject) => {
        const fn = (u, depth) => {
            https.get(u, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && depth > 0) {
                    return fn(new URL(res.headers.location, u).toString(), depth - 1);
                }
                if (res.statusCode !== 200) {
                    return reject(new Error('HTTP ' + res.statusCode + ' for ' + u));
                }
                const out = fs.createWriteStream(destPath);
                res.pipe(out);
                out.on('finish', () => out.close(resolve));
                out.on('error', reject);
            }).on('error', reject);
        };
        fn(url, redirects);
    });
}

// ─── ZIP reader (Central-Directory-based) ───
// GeoNames SA.zip uses the data descriptor flag (bit 3 of flags), which
// means compressed_size/uncompressed_size in the local file header are
// zero — sizes live in a data descriptor AFTER the compressed data.
// We solve this by reading the End-of-Central-Directory record at the
// end of the file (which always has reliable sizes) and using the
// Central Directory entries to locate each file's data.
//
// EOCD record signature: 0x06054b50, sits in the last ~64KB of the file.
// Central Directory entry signature: 0x02014b50, format:
//    0  signature             (4)
//    4  version_made_by       (2)
//    6  version_needed        (2)
//    8  flags                 (2)
//   10  method                (2)
//   12  mod_time              (2)
//   14  mod_date              (2)
//   16  crc32                 (4)
//   20  comp_size             (4)  ← reliable!
//   24  uncomp_size           (4)  ← reliable!
//   28  fnlen                 (2)
//   30  exlen                 (2)
//   32  comment_len           (2)
//   34  disk_number           (2)
//   36  internal_attrs        (2)
//   38  external_attrs        (4)
//   42  local_header_offset   (4)
//   46  filename
//   ...
export function extractZipSingleFile(zipPath, expectedInnerName, outPath) {
    const buf = fs.readFileSync(zipPath);

    // 1. Locate End-of-Central-Directory record (search backwards from end).
    const EOCD_SIG = 0x06054b50;
    let eocdOff = -1;
    const minSearch = Math.max(0, buf.length - 65557); // max EOCD + comment size
    for (let i = buf.length - 22; i >= minSearch; i--) {
        if (buf.readUInt32LE(i) === EOCD_SIG) {
            eocdOff = i;
            break;
        }
    }
    if (eocdOff < 0) throw new Error('ZIP: EOCD record not found');

    const cdEntries  = buf.readUInt16LE(eocdOff + 10);
    const cdSize     = buf.readUInt32LE(eocdOff + 12);
    const cdOffset   = buf.readUInt32LE(eocdOff + 16);

    // 2. Walk Central Directory entries.
    const CD_SIG = 0x02014b50;
    let off = cdOffset;
    for (let i = 0; i < cdEntries; i++) {
        const sig = buf.readUInt32LE(off);
        if (sig !== CD_SIG) {
            throw new Error('ZIP: bad CD signature at offset ' + off);
        }
        const method      = buf.readUInt16LE(off + 10);
        const compSize    = buf.readUInt32LE(off + 20);
        const uncompSize  = buf.readUInt32LE(off + 24);
        const fnLen       = buf.readUInt16LE(off + 28);
        const exLen       = buf.readUInt16LE(off + 30);
        const cmtLen      = buf.readUInt16LE(off + 32);
        const localOff    = buf.readUInt32LE(off + 42);
        const fileName    = buf.slice(off + 46, off + 46 + fnLen).toString('utf8');

        if (fileName === expectedInnerName) {
            // 3. Use Local File Header at localOff to locate actual data.
            // Local header format: ...fnlen at 26, exlen at 28, data after.
            const lfnLen = buf.readUInt16LE(localOff + 26);
            const lexLen = buf.readUInt16LE(localOff + 28);
            const dataStart = localOff + 30 + lfnLen + lexLen;
            const compressed = buf.slice(dataStart, dataStart + compSize);

            let decompressed;
            if (method === 0) {
                decompressed = compressed;
            } else if (method === 8) {
                decompressed = zlib.inflateRawSync(compressed);
            } else {
                throw new Error('ZIP: unsupported compression method ' + method);
            }
            if (decompressed.length !== uncompSize) {
                console.warn('[zip] inflated size mismatch — got', decompressed.length, 'expected', uncompSize);
            }
            fs.writeFileSync(outPath, decompressed);
            return outPath;
        }

        off += 46 + fnLen + exLen + cmtLen;
    }
    throw new Error('Inner file not found in zip: ' + expectedInnerName);
}

// List the inner filenames of a zip (for debugging).
export function listZipEntries(zipPath) {
    const buf = fs.readFileSync(zipPath);
    const EOCD_SIG = 0x06054b50;
    let eocdOff = -1;
    const minSearch = Math.max(0, buf.length - 65557);
    for (let i = buf.length - 22; i >= minSearch; i--) {
        if (buf.readUInt32LE(i) === EOCD_SIG) { eocdOff = i; break; }
    }
    if (eocdOff < 0) return [];
    const cdEntries = buf.readUInt16LE(eocdOff + 10);
    const cdOffset  = buf.readUInt32LE(eocdOff + 16);
    const out = [];
    let off = cdOffset;
    const CD_SIG = 0x02014b50;
    for (let i = 0; i < cdEntries; i++) {
        if (buf.readUInt32LE(off) !== CD_SIG) break;
        const compSize   = buf.readUInt32LE(off + 20);
        const uncompSize = buf.readUInt32LE(off + 24);
        const fnLen  = buf.readUInt16LE(off + 28);
        const exLen  = buf.readUInt16LE(off + 30);
        const cmtLen = buf.readUInt16LE(off + 32);
        const name = buf.slice(off + 46, off + 46 + fnLen).toString('utf8');
        out.push({ name, compSize, uncompSize });
        off += 46 + fnLen + exLen + cmtLen;
    }
    return out;
}

// ─── String helpers ───

// Normalize Arabic for dedupe comparison:
//   - strip tatweel (ـ) and diacritics
//   - normalize ة↔ه, ى↔ي, alef variants
//   - strip ال prefix
//   - collapse whitespace, lowercase (no-op for Arabic but kept for safety)
export function normalizeArabic(s) {
    if (!s) return '';
    return String(s)
        .replace(/[ً-ْٰـ]/g, '')  // diacritics + tatweel
        .replace(/[إأآ]/g, 'ا')                       // alef variants → ا
        .replace(/ة/g, 'ه')                            // taa marbuta → ha
        .replace(/ى/g, 'ي')                            // alef maksura → ya
        .replace(/^ال/, '')                            // strip ال prefix
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

// Normalize Latin for dedupe comparison.
export function normalizeLatin(s) {
    if (!s) return '';
    return String(s)
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')   // strip combining diacritics
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

// URL-safe slug from ASCII name. Returns empty string if input is empty.
export function makeSlug(asciiname) {
    if (!asciiname) return '';
    return String(asciiname)
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/['']/g, '')               // strip apostrophes
        .replace(/[^a-z0-9]+/g, '-')        // non-alnum → hyphen
        .replace(/^-+|-+$/g, '')            // trim hyphens
        .slice(0, 80);                      // cap length
}

// Detect Arabic-script characters
const _AR_RE = /[؀-ۿ]/;
export function isArabicScript(s) {
    return _AR_RE.test(s || '');
}

// Detect basic Latin-script characters (and accented variants common in
// transliteration). Used to bucket alternatenames into ar / en aliases.
export function isMostlyLatin(s) {
    if (!s) return false;
    const stripped = String(s).replace(/[^A-Za-zÀ-ɏ]/g, '');
    return stripped.length >= Math.max(2, Math.floor(s.length * 0.5));
}

// Parse alternatenames field. GeoNames format is a comma-separated list of
// raw names. Some have language tags ("ar:القاهرة"), most don't.
// Returns { tagged: { lang: [values] }, untagged: [values] }.
export function parseAlternateNames(raw) {
    const tagged = {};
    const untagged = [];
    if (!raw) return { tagged, untagged };
    for (const part of String(raw).split(',')) {
        const p = part.trim();
        if (!p) continue;
        // Detect language tag: "<2-3 alpha>:<value>"
        const m = /^([a-z]{2,3}):(.+)$/i.exec(p);
        if (m) {
            const lang = m[1].toLowerCase();
            const val  = m[2].trim();
            if (val) {
                (tagged[lang] = tagged[lang] || []).push(val);
            }
        } else {
            untagged.push(p);
        }
    }
    return { tagged, untagged };
}

// Population-to-priority mapping (per plan spec, with one extra band).
export function priorityForPopulation(pop) {
    const n = Number(pop);
    if (!isFinite(n) || n <= 0) return 60;       // unknown / zero
    if (n >= 500_000) return 95;
    if (n >= 100_000) return 90;
    if (n >=  50_000) return 85;
    if (n >=  10_000) return 80;
    if (n >=   5_000) return 75;
    if (n >=   1_000) return 70;
    return 65;
}

// Type derivation from GeoNames feature_code + population.
export function typeForFeatureCode(featureCode, population) {
    const pop = Number(population) || 0;
    switch (featureCode) {
        case 'PPLC':                                       return 'city';
        case 'PPLA':                                       return 'city';
        case 'PPLA2':                                      return 'town';
        case 'PPLA3':
        case 'PPLA4':                                      return 'town';
        case 'PPLS':                                       return 'town';
        case 'PPL':
            return pop >= 5_000 ? 'town' : 'village';
        default:                                           return 'locality';
    }
}

// Coordinate bounds check against a country bbox.
export function isInBox(lat, lng, bbox) {
    if (!bbox) return false;
    const a = Number(lat), b = Number(lng);
    if (!isFinite(a) || !isFinite(b)) return false;
    return a >= bbox.minLat && a <= bbox.maxLat
        && b >= bbox.minLng && b <= bbox.maxLng;
}

// Haversine distance in kilometers.
export function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 +
              Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
              Math.sin(dLng/2)**2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

// 10-language map.
// PLACE-NAMES-L10N-PIPELINE-GUARD-1 (2026-05-18) — pipeline-guard redesign:
//   ONLY `en` is auto-filled from `fallback`. All other 9 langs are
//   present in the output IFF explicitly provided in `partial`.
//   "Missing means missing" — never produce `names.ur = "Charikar"`
//   (or `names.bn = "Charikar"`, etc.) just because the Urdu/Bengali
//   localized name is absent from the source data.
//
//   See: reports/place-names-ur-data-source-audit-1.md §8a.
//   The previous behavior (cascade `fallback` into all 10 lang slots)
//   was the root cause of the Charikar/Kandahar/Karaj/Pul-e-Khumri etc.
//   Urdu-leak: 1,755 GeoNames-pipeline-imported curated rows ended up
//   with `names.ur === names.en === <Latin English name>`, and the SSR
//   then read `names.ur` and rendered Latin as if it were the Urdu name.
//
//   `ar` is preserved when `partial.ar` is set (every Strategy-E
//   candidate carries a clean Arabic name from Stage 3.5). It is NOT
//   filled from the fallback — if Stage 2 didn't extract an Arabic
//   name, Stage 3 / Stage 3.5 will flag the row separately.
//
//   This change is a PIPELINE GUARD: it stops FUTURE waves from
//   producing fillchain rows. It does NOT modify the 1,755 existing
//   fillchain rows in `curated-places.json` — those will be addressed
//   later via per-country enrichment batches (e.g. PLACE-NAMES-UR-AF-1).
export const SUPPORTED_LANGS = ['ar','en','fr','de','tr','ur','id','es','bn','ms'];
export function fillLangMap(partial, fallback) {
    const out = {};
    // en is the canonical anchor — always present (filled from fallback if absent)
    out.en = (partial && partial.en) ? partial.en : fallback;
    // ar is the curated invariant — present only if `partial.ar` was provided.
    // Stage 3.5 enforces ar-presence on high-tier wave rows; absent ar at
    // this point is a Stage-2 input gap, not something Stage 2 should mask.
    if (partial && partial.ar) out.ar = partial.ar;
    // All 8 other langs (fr/de/tr/ur/id/es/bn/ms): present iff explicitly
    // provided. Missing means missing.
    for (const l of SUPPORTED_LANGS) {
        if (l === 'en' || l === 'ar') continue;
        if (partial && partial[l]) out[l] = partial[l];
    }
    return out;
}

// Country constants now live per-country in ./countries/{cc}.js
// Each config exports { cc, countryAr, countryEn, defaultTimezone, bbox,
// geonamesUrl, innerTxtName, admin1ToRegion, extraReligious, extraNonPlace }.
// Use `loadCountryConfig(cc)` to fetch.

// ─── Blocklist keywords (CURATED-SA-GEODATA-IMPORT-1B refinement) ───
//
// NOTE on regex word boundaries: JavaScript's \b uses ASCII-only word
// definition by default, so \b between Arabic letters never fires
// (Arabic letters are treated as non-word chars on both sides → no
// boundary). For Arabic patterns we therefore use plain substring
// matching. For English patterns we keep \b to avoid matching inside
// longer words (e.g. "mount" inside "Damountain").
//
// STRONG religious / landmark keywords → REJECTED (these are never
// populated places; e.g. مسجد القبلتين is a mosque, not a city).
export const RELIGIOUS_KEYWORDS = [
    // Arabic — substring match (no \b)
    /مسجد/, /جامع(?!ة)/,  // 'جامع' but not 'جامعة' (university)
    /القبلتين/, /قبلتين/, /كعبة/, /الكعبة/, /مصلى/,
    // English — \b is safe here
    /\bmosque\b/i, /\bqiblatayn?\b/i, /\bkaaba\b/i, /\bmasjid\b/i,
    /\bshrine\b/i, /\bmausoleum\b/i
];

// SOFT non-place keywords → status='needs_review' (might still be a real
// populated place after manual check, but never auto-approved or auto-
// shortlisted).
export const NON_PLACE_KEYWORDS = [
    // Arabic — geography (substring match)
    /جبل/, /وادي/, /شعب/, /بئر/, /آبار/, /عين/,
    // Arabic — infrastructure / admin sub-areas
    /محطة/, /مطار/, /مدرسة/, /مستشفى/, /جامعة/,
    /مزرعة/, /مزارع/, /مخطط/, /استراحة/, /معهد/,
    /^حي\s/, /\sحي\s/,  // "حي X" = neighborhood (but not place names that contain حي as substring)
    // English — \b safe
    /\bmount\b/i, /\bmountain\b/i, /\bwadi\b/i, /\bwell\b/i, /\bspring\b/i,
    /\bvalley\b/i,
    /\bstation\b/i, /\bairport\b/i, /\bschool\b/i, /\bhospital\b/i,
    /\bfarm\b/i, /\bcollege\b/i, /\buniversity\b/i,
    /\bdistrict\b/i, /\bquarter\b/i
];

// Strip Arabic diacritics + tatweel ONLY (keep base letters intact).
// Use this before keyword matching so /وادي/ matches "وَادي" etc.
export function stripArabicDiacritics(s) {
    if (!s) return '';
    return String(s).replace(/[ً-ْٰـ]/g, '');
}

// Test a string against an array of regexes. Returns the first match or null.
// Arabic diacritics in the input are stripped before testing so substring
// patterns like /وادي/ match diacritized variants like "وَادي".
export function matchAnyKeyword(text, keywords) {
    if (!text) return null;
    const stripped = stripArabicDiacritics(text);
    for (const re of keywords) {
        if (re.test(stripped)) return re.source;
    }
    return null;
}

// Combine cross-country defaults with per-country extensions from config.
// Both arrays may be empty for countries that have no extra keywords.
export function effectiveKeywords(baseList, extra) {
    if (!Array.isArray(extra) || extra.length === 0) return baseList;
    return baseList.concat(extra);
}
