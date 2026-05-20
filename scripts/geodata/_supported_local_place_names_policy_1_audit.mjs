// scripts/geodata/_supported_local_place_names_policy_1_audit.mjs
//
// SUPPORTED-LOCAL-PLACE-NAMES-POLICY-1 — Phase A: AUDIT (read-only).
//
// For every curated entry in a country whose native/market language is
// in our 10 SUPPORTED_LANGS, classify the entry's `names[lang]` state:
//
//   * native       — names[lang] differs from names.en (real localized form)
//   * fillchain    — names[lang] === names.en (legacy fillchain copy)
//   * missing      — names[lang] not present at all
//   * polluted     — names[lang] in WRONG script (Latin in names.ur/bn/ar, etc.)
//
// Emits a per-country gap summary + slug-level detail file.
// NO mutations.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const CURATED_PATH = new URL('../../db/places/curated-places.json', import.meta.url);
const OUT_SUMMARY  = new URL('../../reports/supported-local-place-names-policy-1-audit.json', import.meta.url);
const OUT_DETAIL   = new URL('../../reports/supported-local-place-names-policy-1-audit-detail.json', import.meta.url);

// Country → required SUPPORTED_LANGS (beyond the universal ar+en baseline).
// Indexed by lowercase ISO-3166 alpha-2 country code.
const COUNTRY_REQUIRED_LANGS = {
    // Indonesian-speaking
    id: ['id'],
    // Malay-speaking
    my: ['ms'], sg: ['ms'], bn: ['ms'],
    // Turkish-speaking
    tr: ['tr'],
    // French-speaking
    fr: ['fr'],
    // German-speaking (de official OR co-official)
    de: ['de'], at: ['de'], ch: ['de'], li: ['de'], lu: ['de','fr'],
    // Spanish-speaking
    es: ['es'], mx: ['es'], ar: ['es'], cl: ['es'], co: ['es'], pe: ['es'],
    ve: ['es'], ec: ['es'], bo: ['es'], py: ['es'], uy: ['es'], gt: ['es'],
    hn: ['es'], sv: ['es'], ni: ['es'], cr: ['es'], pa: ['es'], cu: ['es'],
    do: ['es'], pr: ['es'],
    // Urdu-speaking
    pk: ['ur'],
    // Bengali-speaking
    bd: ['bn'],
    // India — special case: ur+bn (both supported), NOT hi (not supported)
    in: ['ur','bn'],
    // Belgium — fr + de (nl not in SUPPORTED_LANGS)
    be: ['fr','de']
};

// Per-lang strict script validation (mirrors server/place-l10n/index.js).
function isCleanScript(s, lang) {
    if (!s || typeof s !== 'string') return false;
    const hasArabic  = /[؀-ۿ]/.test(s);
    const hasBengali = /[ঀ-৿]/.test(s);
    const hasLatin   = /[A-Za-z]/.test(s);
    if (lang === 'ar') return hasArabic && !hasBengali && !hasLatin;
    if (lang === 'ur') return hasArabic && !hasBengali && !hasLatin;
    if (lang === 'bn') return hasBengali && !hasArabic && !hasLatin;
    return hasLatin && !hasArabic && !hasBengali; // en/fr/de/tr/id/es/ms
}

function classifyField(value, lang, enValue) {
    if (typeof value !== 'string' || !value.trim()) return 'missing';
    const v = value.trim();
    if (!isCleanScript(v, lang)) return 'polluted';
    if (lang !== 'en' && enValue && v === enValue) return 'fillchain';
    return 'native';
}

const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));

const summary = {};
const detail  = { native: [], fillchain: [], missing: [], polluted: [] };

for (const e of curated) {
    const cc = (e.countryCode || '').toLowerCase();
    const required = COUNTRY_REQUIRED_LANGS[cc];
    if (!required) continue;
    summary[cc] = summary[cc] || { total: 0, byLang: {} };
    summary[cc].total++;
    const en = (e.names && e.names.en) || '';
    for (const L of required) {
        summary[cc].byLang[L] = summary[cc].byLang[L] || { native: 0, fillchain: 0, missing: 0, polluted: 0 };
        const status = classifyField(e.names && e.names[L], L, en);
        summary[cc].byLang[L][status]++;
        if (status !== 'native') {
            detail[status].push({
                slug: e.slug,
                countryCode: cc,
                lang: L,
                currentValue: (e.names && e.names[L]) || null,
                enValue: en,
                slugCanonical: e.slug
            });
        }
    }
}

writeFileSync(OUT_SUMMARY, JSON.stringify(summary, null, 2), 'utf8');
writeFileSync(OUT_DETAIL,  JSON.stringify(detail,  null, 2), 'utf8');

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' SUPPORTED-LOCAL-PLACE-NAMES-POLICY-1 — AUDIT');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('');

const ccOrder = Object.keys(summary).sort((a, b) => summary[b].total - summary[a].total);
let totalCities = 0, totalNative = 0, totalFillchain = 0, totalMissing = 0, totalPolluted = 0;
for (const cc of ccOrder) {
    const s = summary[cc];
    totalCities += s.total;
    console.log('  ' + cc.toUpperCase() + ' — ' + s.total + ' cities');
    for (const L of Object.keys(s.byLang)) {
        const b = s.byLang[L];
        totalNative    += b.native;
        totalFillchain += b.fillchain;
        totalMissing   += b.missing;
        totalPolluted  += b.polluted;
        const gaps = b.fillchain + b.missing + b.polluted;
        const gapPct = s.total > 0 ? Math.round((gaps / s.total) * 100) : 0;
        console.log('    .' + L + ': native=' + b.native + ', fillchain=' + b.fillchain +
                    ', missing=' + b.missing + ', polluted=' + b.polluted +
                    '  →  ' + gapPct + '% gap');
    }
}

console.log('');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' Totals: ' + totalCities + ' cities, ' + totalNative + ' native, ' +
            totalFillchain + ' fillchain, ' + totalMissing + ' missing, ' +
            totalPolluted + ' polluted');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('');
console.log(' Outputs:');
console.log('   ' + OUT_SUMMARY.pathname);
console.log('   ' + OUT_DETAIL.pathname);
