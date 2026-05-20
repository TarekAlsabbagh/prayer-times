// scripts/geodata/_place_names_bn_in_1_audit.mjs
// ─────────────────────────────────────────────────────────────────────────
// PLACE-NAMES-BN-IN-1-PLAN — read-only audit script
//
// Surveys all 40 IN curated entries against in-geonames-raw.json to find:
//   - existing names.bn (for SEED-18 already populated)
//   - candidate Bengali strings in GeoNames raw `alternatenames` field
//   - Reject Assamese-only forms (ৰ ৱ U+09F0 U+09F1)
//
// READ-ONLY: no mutation of any file. Output is text-only to stdout.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';

const CURATED = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json';
const RAW     = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/candidates/in-geonames-raw.json';

// ─── Bengali script guard ───────────────────────────────────────────────
const BENGALI_BLOCK    = /[ঀ-৿]/;        // U+0980-U+09FF — REQUIRED
const ASSAMESE_ONLY    = /[ৰৱ]/;          // U+09F0 ৰ + U+09F1 ৱ — reject
const LATIN            = /[A-Za-z]/;
const DEVANAGARI       = /[ऀ-ॿ]/;         // U+0900-U+097F — reject (Hindi)
const ARABIC           = /[؀-ۿ]/;         // U+0600-U+06FF — reject
const TAMIL            = /[஀-௿]/;         // U+0B80-U+0BFF — reject
const GURMUKHI         = /[਀-੿]/;          // U+0A00-U+0A7F — reject
const GUJARATI         = /[઀-૿]/;          // U+0A80-U+0AFF — reject
const TELUGU_KANNADA   = /[ఀ-ೞ]/;          // U+0C00-U+0CDE — reject
const MALAYALAM        = /[ഀ-ൿ]/;          // U+0D00-U+0D7F — reject

function classifyBengali(s) {
    if (!s) return { kind: 'empty', notes: [] };
    const notes = [];
    if (LATIN.test(s))           return { kind: 'reject-latin', notes };
    if (DEVANAGARI.test(s))      return { kind: 'reject-devanagari', notes };
    if (ARABIC.test(s))          return { kind: 'reject-arabic', notes };
    if (TAMIL.test(s))           return { kind: 'reject-tamil', notes };
    if (GURMUKHI.test(s))        return { kind: 'reject-gurmukhi', notes };
    if (GUJARATI.test(s))        return { kind: 'reject-gujarati', notes };
    if (TELUGU_KANNADA.test(s))  return { kind: 'reject-telugu-kannada', notes };
    if (MALAYALAM.test(s))       return { kind: 'reject-malayalam', notes };
    if (!BENGALI_BLOCK.test(s))  return { kind: 'reject-no-bengali-block', notes };
    if (ASSAMESE_ONLY.test(s)) {
        notes.push('contains Assamese ৰ/ৱ');
        return { kind: 'assamese-leak', notes };
    }
    return { kind: 'bengali-clean', notes };
}

function loadCurated() {
    const data = JSON.parse(fs.readFileSync(CURATED, 'utf8'));
    return data.filter(e => e.countryCode === 'in');
}

function streamRawByCoords(targetByCoords) {
    console.error('  [audit] loading raw 277 MB file (may take 10-20 s)...');
    const raw = JSON.parse(fs.readFileSync(RAW, 'utf8'));
    console.error('  [audit] loaded ' + raw.length + ' rows');
    const TOL = 0.02;
    const matchedBySlug = new Map();
    for (const r of raw) {
        if (r.country_code !== 'IN') continue;
        for (const [slug, t] of targetByCoords.entries()) {
            if (Math.abs(r.latitude - t.lat) < TOL &&
                Math.abs(r.longitude - t.lng) < TOL) {
                const prev = matchedBySlug.get(slug);
                if (!prev || (r.population || 0) > (prev.population || 0)) {
                    matchedBySlug.set(slug, r);
                }
            }
        }
    }
    return matchedBySlug;
}

function main() {
    const inEntries = loadCurated();
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log(' PLACE-NAMES-BN-IN-1-PLAN — Bengali coverage audit (read-only)');
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('Total IN entries: ' + inEntries.length);

    let withBn = 0, withoutBn = 0;
    for (const e of inEntries) {
        if (e.names && e.names.bn) withBn++;
        else withoutBn++;
    }
    console.log('  with names.bn:    ' + withBn);
    console.log('  without names.bn: ' + withoutBn);
    console.log('');

    const targetByCoords = new Map();
    for (const e of inEntries) {
        targetByCoords.set(e.slug, { lat: e.lat, lng: e.lng });
    }

    const matched = streamRawByCoords(targetByCoords);
    console.log('Matched ' + matched.size + '/' + inEntries.length + ' IN slugs in GeoNames raw');
    console.log('');

    console.log('═══ Per-slug audit ═══');
    console.log('');

    const SEED = new Set(['new-delhi','mumbai','kolkata','hyderabad-in','chennai','bengaluru','lucknow','ahmedabad','pune','jaipur','surat','kanpur','indore','nagpur','bhopal','patna','srinagar','kochi']);

    for (const e of inEntries) {
        const tier = SEED.has(e.slug) ? 'SEED' : 'BATCH';
        const currentBn = (e.names && e.names.bn) || null;
        const r = matched.get(e.slug);
        const gid = r ? r.geonameid : null;
        const alts = r && r.alternatenames ? r.alternatenames.split(',') : [];

        const bnCandidates = [];
        const assameseLeak = [];
        const rejected = [];
        for (const a of alts) {
            const trimmed = a.trim();
            if (!trimmed) continue;
            const c = classifyBengali(trimmed);
            if (c.kind === 'bengali-clean') bnCandidates.push({ s: trimmed, c });
            else if (c.kind === 'assamese-leak') assameseLeak.push({ s: trimmed, c });
            else if (c.kind.startsWith('reject-')) {
                if (c.kind !== 'reject-no-bengali-block') rejected.push({ s: trimmed, kind: c.kind });
            }
        }

        console.log('[' + tier + '] ' + e.slug.padEnd(22) + ' (gid=' + gid + ', pop=' + (r?.population||'?').toString().padStart(8) + ', fc=' + (r?.feature_code||'?') + ')');
        console.log('    names.en   = ' + (e.names?.en || ''));
        console.log('    names.ar   = ' + (e.names?.ar || ''));
        console.log('    names.hi   = ' + (e.names?.hi || ''));
        console.log('    names.ur   = ' + (e.names?.ur || ''));
        console.log('    names.bn   = ' + (currentBn || '<MISSING>'));
        if (bnCandidates.length) {
            console.log('    raw.bengali-clean   = ' + bnCandidates.map(x => x.s).join(' | '));
        }
        if (assameseLeak.length) {
            console.log('    raw.assamese-leak   = ' + assameseLeak.map(x => x.s).join(' | '));
        }
        if (rejected.length) {
            console.log('    raw.rejected        = ' + rejected.length + ' strings');
        }
        if (!bnCandidates.length && !assameseLeak.length) {
            console.log('    raw.NO-BENGALI-ALTS');
        }
        console.log('');
    }

    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log(' Audit complete — read-only, no mutation');
    console.log('═══════════════════════════════════════════════════════════════════════');
}

main();
