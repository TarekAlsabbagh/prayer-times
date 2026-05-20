// scripts/geodata/_place_names_ta_in_1_audit.mjs
// ─────────────────────────────────────────────────────────────────────────
// PLACE-NAMES-TA-IN-1-PLAN — read-only audit script
//
// Surveys all 40 IN curated entries against in-geonames-raw.json to find
// Tamil alternatenames. Tamil block U+0B80-U+0BFF.
//
// READ-ONLY: no mutation of any file. Output to stdout only.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';

const CURATED = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json';
const RAW     = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/candidates/in-geonames-raw.json';

const TAMIL_BLOCK     = /[஀-௿]/;        // U+0B80-U+0BFF — REQUIRED
const LATIN           = /[A-Za-z]/;
const DEVANAGARI      = /[ऀ-ॿ]/;
const BENGALI         = /[ঀ-৿]/;
const ARABIC          = /[؀-ۿ]/;
const GURMUKHI        = /[਀-੿]/;
const GUJARATI        = /[઀-૿]/;
const TELUGU_KANNADA  = /[ఀ-ೞ]/;
const MALAYALAM       = /[ഀ-ൿ]/;

function classifyTamil(s) {
    if (!s) return { kind: 'empty' };
    if (LATIN.test(s))          return { kind: 'reject-latin' };
    if (DEVANAGARI.test(s))     return { kind: 'reject-devanagari' };
    if (BENGALI.test(s))        return { kind: 'reject-bengali' };
    if (ARABIC.test(s))         return { kind: 'reject-arabic' };
    if (GURMUKHI.test(s))       return { kind: 'reject-gurmukhi' };
    if (GUJARATI.test(s))       return { kind: 'reject-gujarati' };
    if (TELUGU_KANNADA.test(s)) return { kind: 'reject-telugu-kannada' };
    if (MALAYALAM.test(s))      return { kind: 'reject-malayalam' };
    if (!TAMIL_BLOCK.test(s))   return { kind: 'reject-no-tamil-block' };
    return { kind: 'tamil-clean' };
}

function main() {
    const data = JSON.parse(fs.readFileSync(CURATED, 'utf8'));
    const inEntries = data.filter(e => e.countryCode === 'in');
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log(' PLACE-NAMES-TA-IN-1-PLAN — Tamil coverage audit (read-only)');
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('Total IN entries: ' + inEntries.length);

    const targetByCoords = new Map();
    for (const e of inEntries) {
        targetByCoords.set(e.slug, { lat: e.lat, lng: e.lng });
    }

    console.error('  [audit] loading raw 277 MB file (may take 10-20 s)...');
    const raw = JSON.parse(fs.readFileSync(RAW, 'utf8'));
    console.error('  [audit] loaded ' + raw.length + ' rows');
    const TOL = 0.02;
    const matched = new Map();
    for (const r of raw) {
        if (r.country_code !== 'IN') continue;
        for (const [slug, t] of targetByCoords.entries()) {
            if (Math.abs(r.latitude - t.lat) < TOL &&
                Math.abs(r.longitude - t.lng) < TOL) {
                const prev = matched.get(slug);
                if (!prev || (r.population || 0) > (prev.population || 0)) {
                    matched.set(slug, r);
                }
            }
        }
    }
    console.log('Matched ' + matched.size + '/' + inEntries.length);
    console.log('');

    const SEED = new Set(['new-delhi','mumbai','kolkata','hyderabad-in','chennai','bengaluru','lucknow','ahmedabad','pune','jaipur','surat','kanpur','indore','nagpur','bhopal','patna','srinagar','kochi']);

    for (const e of inEntries) {
        const tier = SEED.has(e.slug) ? 'SEED' : 'BATCH';
        const r = matched.get(e.slug);
        const gid = r ? r.geonameid : null;
        const alts = r && r.alternatenames ? r.alternatenames.split(',') : [];

        const taCandidates = [];
        for (const a of alts) {
            const trimmed = a.trim();
            if (!trimmed) continue;
            const c = classifyTamil(trimmed);
            if (c.kind === 'tamil-clean') taCandidates.push(trimmed);
        }

        console.log('[' + tier + '] ' + e.slug.padEnd(22) + ' (gid=' + gid + ', pop=' + (r?.population||'?').toString().padStart(8) + ', fc=' + (r?.feature_code||'?') + ')');
        console.log('    names.en   = ' + (e.names?.en || ''));
        console.log('    names.hi   = ' + (e.names?.hi || ''));
        if (taCandidates.length) {
            console.log('    raw.tamil   = ' + taCandidates.join(' | '));
        } else {
            console.log('    raw.NO-TAMIL');
        }
        console.log('');
    }

    console.log('═══════════════════════════════════════════════════════════════════════');
}

main();
