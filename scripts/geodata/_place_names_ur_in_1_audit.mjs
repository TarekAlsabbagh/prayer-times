// scripts/geodata/_place_names_ur_in_1_audit.mjs
// ─────────────────────────────────────────────────────────────────────────
// PLACE-NAMES-UR-IN-1-PLAN — read-only audit script
//
// Surveys all 40 IN curated entries against in-geonames-raw.json to find:
//   - existing names.ur (for SEED-18 already populated)
//   - candidate Urdu strings in GeoNames raw `alternatenames` field
//   - Urdu-vs-Arabic differentiation (Urdu-specific letters present)
//
// READ-ONLY: no mutation of any file. Output is text-only to stdout.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';

const CURATED = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json';
const RAW     = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/candidates/in-geonames-raw.json';

// ─── Urdu-vs-Arabic script guard ─────────────────────────────────────────
const ARABIC_BLOCK    = /[؀-ۿ]/;        // U+0600-U+06FF (entire Arabic script block)
const URDU_DISTINCT   = /[پچژگٹڈڑںھےیہ]/; // U+067E,U+0686,U+0698,U+06AF,U+0679,U+0688,U+0691,U+06BA,U+06BE,U+06D2,U+06CC,U+06C1
const PERSIAN_DISTINCT = /[ێۆۇۈ]/;      // additional Persian / Kurdish letters
const LATIN           = /[A-Za-z]/;
const DEVANAGARI      = /[ऀ-ॿ]/;        // U+0900-U+097F (reject Hindi)
const BENGALI         = /[ঀ-৿]/;         // U+0980-U+09FF (reject)
const TAMIL           = /[஀-௿]/;         // U+0B80-U+0BFF (reject)
const GURMUKHI        = /[਀-੿]/;          // U+0A00-U+0A7F (reject)
const GUJARATI        = /[઀-૿]/;          // U+0A80-U+0AFF (reject)
const TELUGU_KANNADA  = /[ఀ-ೞ]/;          // U+0C00-U+0CDE (reject)
const MALAYALAM       = /[ഀ-ൿ]/;         // U+0D00-U+0D7F (reject)
const PURE_ARABIC_ONLY = /^[؀-ۿ\s]+$/; // only Arabic block + whitespace
const PURE_LATIN_LIKE = /^[A-Za-z0-9\s\-'.,()]+$/;

function classifyArabicScript(s) {
    if (!s) return { kind: 'empty', notes: [] };
    const notes = [];
    if (LATIN.test(s))           return { kind: 'reject-latin', notes };
    if (DEVANAGARI.test(s))      return { kind: 'reject-devanagari', notes };
    if (BENGALI.test(s))         return { kind: 'reject-bengali', notes };
    if (TAMIL.test(s))           return { kind: 'reject-tamil', notes };
    if (GURMUKHI.test(s))        return { kind: 'reject-gurmukhi', notes };
    if (GUJARATI.test(s))        return { kind: 'reject-gujarati', notes };
    if (TELUGU_KANNADA.test(s))  return { kind: 'reject-telugu-kannada', notes };
    if (MALAYALAM.test(s))       return { kind: 'reject-malayalam', notes };
    if (!ARABIC_BLOCK.test(s))   return { kind: 'reject-no-arabic-block', notes };

    const hasUrduDistinct    = URDU_DISTINCT.test(s);
    const hasPersianDistinct = PERSIAN_DISTINCT.test(s);
    if (hasUrduDistinct) {
        const letters = [];
        for (const m of s.matchAll(/[پچژگٹڈڑںھےیہ]/g)) letters.push(m[0]);
        notes.push('urdu-letters=' + [...new Set(letters)].join(''));
        return { kind: 'urdu-strong', notes };
    }
    if (hasPersianDistinct) {
        notes.push('persian-letters present');
        return { kind: 'persian-leak', notes };
    }
    // No Urdu/Persian distinguishing letters → could be pure Arabic
    return { kind: 'ambiguous-arabic', notes };
}

function loadCurated() {
    const data = JSON.parse(fs.readFileSync(CURATED, 'utf8'));
    return data.filter(e => e.countryCode === 'in');
}

function streamRawByCoords(targetByCoords) {
    // The file is 277MB JSON array — parse incrementally? Easier: read whole
    // file (Node can handle ~277 MB parse) and filter.
    console.error('  [audit] loading raw 277 MB file (may take 10-20 s)...');
    const raw = JSON.parse(fs.readFileSync(RAW, 'utf8'));
    console.error('  [audit] loaded ' + raw.length + ' rows');
    // Match by approximate lat/lng (within 0.02 degree = ~2 km)
    const TOL = 0.02;
    const matchedBySlug = new Map();
    for (const r of raw) {
        if (r.country_code !== 'IN') continue;
        for (const [slug, t] of targetByCoords.entries()) {
            if (Math.abs(r.latitude - t.lat) < TOL &&
                Math.abs(r.longitude - t.lng) < TOL) {
                // Pick the row with highest population for this slug
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
    console.log(' PLACE-NAMES-UR-IN-1-PLAN — Urdu coverage audit (read-only)');
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('Total IN entries: ' + inEntries.length);

    let withUr = 0, withoutUr = 0;
    for (const e of inEntries) {
        if (e.names && e.names.ur) withUr++;
        else withoutUr++;
    }
    console.log('  with names.ur:    ' + withUr);
    console.log('  without names.ur: ' + withoutUr);
    console.log('');

    // Build coord index
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
        const currentUr = (e.names && e.names.ur) || null;
        const r = matched.get(e.slug);
        const gid = r ? r.geonameid : null;
        const rawName = r ? r.name : null;
        const alts = r && r.alternatenames ? r.alternatenames.split(',') : [];

        // Filter alts for Urdu candidates (Arabic block + Urdu-distinct letters)
        const urCandidates = [];
        const arCandidates = [];
        const personLeak  = [];
        const rejected   = [];
        for (const a of alts) {
            const trimmed = a.trim();
            if (!trimmed) continue;
            const c = classifyArabicScript(trimmed);
            if (c.kind === 'urdu-strong') urCandidates.push({ s: trimmed, c });
            else if (c.kind === 'ambiguous-arabic') arCandidates.push({ s: trimmed, c });
            else if (c.kind === 'persian-leak') personLeak.push({ s: trimmed, c });
            else if (c.kind.startsWith('reject-')) rejected.push({ s: trimmed, kind: c.kind });
            else if (c.kind === 'reject-no-arabic-block') { /* skip */ }
        }

        console.log('[' + tier + '] ' + e.slug.padEnd(22) + ' (gid=' + gid + ', pop=' + (r?.population||'?').toString().padStart(8) + ', fc=' + (r?.feature_code||'?') + ')');
        console.log('    names.en   = ' + (e.names?.en || ''));
        console.log('    names.ar   = ' + (e.names?.ar || ''));
        console.log('    names.hi   = ' + (e.names?.hi || ''));
        console.log('    names.ur   = ' + (currentUr || '<MISSING>'));
        if (urCandidates.length) {
            console.log('    raw.ur-strong   = ' + urCandidates.map(x => x.s + ' [' + x.c.notes.join(',') + ']').join(' | '));
        }
        if (arCandidates.length) {
            console.log('    raw.ar-ambiguous = ' + arCandidates.map(x => x.s).join(' | '));
        }
        if (personLeak.length) {
            console.log('    raw.persian-leak = ' + personLeak.map(x => x.s).join(' | '));
        }
        if (rejected.length) {
            console.log('    raw.rejected    = ' + rejected.length + ' strings (Latin/Devanagari/etc.)');
        }
        if (!urCandidates.length && !arCandidates.length && !personLeak.length) {
            console.log('    raw.NO-ARABIC-SCRIPT-ALTS');
        }
        console.log('');
    }

    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log(' Audit complete — read-only, no mutation');
    console.log('═══════════════════════════════════════════════════════════════════════');
}

main();
