// MOON-CITY-DAY-TITLE-META-ALL-LANGS-FIX-1 — PRE-PUSH SUPPLEMENT (read-only).
//
// Runs the NEW fitter (js/moon-day-seo.js) over EVERY real curated city × 10 langs, using each
// city's REAL per-lang display name (names[lang] with the same en fallback the server resolves for
// a missing lang) and a localized Gregorian date label (Intl, Latin digits — matching the server's
// _moonDateLabel). Confirms title∈[50,60] / meta∈[120,160] on real data — not just synthetic lengths
// — and surfaces any REAL exception caused by an extremely long city name. Pure-function only:
// touches NO app.js / moon.js / routes / sitemap and changes nothing.
//
// Run: node scripts/_supp_moon_day_seo_real_curated_cities.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const M = require(path.join(ROOT, 'js', 'moon-day-seo.js'));
const cp = M.cpLen;

const C = JSON.parse(fs.readFileSync(path.join(ROOT, 'db', 'places', 'curated-places.json'), 'utf8'));
const cities = Array.isArray(C) ? C : (C.places || C.cities || Object.values(C));
const langs = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
// Lowercase stems (case-insensitive); fr/es match both the noun (Lune/Luna) and the adjective
// over-form (lunaire/lunar) → "lun". tr "ay" is present in every Turkish form.
const moonTok = { ar: 'قمر', en: 'moon', fr: 'lun', tr: 'ay', ur: 'چاند', de: 'mond', id: 'bulan', es: 'lun', bn: 'চাঁদ', ms: 'bulan' };

// Localized Gregorian date label (Latin digits) for an in-range sample date — matches server output.
const sample = new Date(2026, 6, 14); // 14 July 2026 (in-range, mid-length month)
const dateLabel = {};
for (const l of langs) {
    try { dateLabel[l] = new Intl.DateTimeFormat(l + '-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }).format(sample); }
    catch { dateLabel[l] = '14 July 2026'; }
}

const nameFor = (city, l) => (city.names && (city.names[l] || city.names.en)) || city.slug || '';

let tIn = 0, tUnder = 0, tOver = 0, mIn = 0, mOut = 0, total = 0;
let fallbackHits = 0, cityDropped = 0, dateDropped = 0;
const tOverEx = [], mOutEx = [], fbEx = [];

for (const city of cities) {
    for (const l of langs) {
        const C0 = nameFor(city, l); if (!C0) continue;
        const D = dateLabel[l];
        const t = M.fitDayTitle(l, C0, D), d = M.fitDayDesc(l, C0, D);
        const tn = cp(t), dn = cp(d); total++;
        if (tn >= 50 && tn <= 60) tIn++; else if (tn > 60) { tOver++; if (tOverEx.length < 15) tOverEx.push(`${l} "${C0}"(${cp(C0)}cp) → T=${tn} "${t}"`); } else tUnder++;
        if (dn >= 120 && dn <= 160) mIn++; else { mOut++; if (mOutEx.length < 15) mOutEx.push(`${l} "${C0}" → M=${dn}`); }
        // no EN fallback: lang L output must contain L's native moon token (never silently English for ar/ur/bn/etc.)
        if (!t.toLowerCase().includes(moonTok[l])) { fallbackHits++; if (fbEx.length < 15) fbEx.push(`${l} "${C0}" → "${t}"`); }
        // city + date never dropped
        if (!t.includes(C0) || !d.includes(C0)) cityDropped++;
        const yr = D.match(/\d{4}/) ? D.match(/\d{4}/)[0] : '2026';
        if (!t.includes(yr) || !d.includes(yr)) dateDropped++;
    }
}

// Dimension spotlights: shortest, longest, with-spaces, special-char — by EN display name.
const byEn = cities.map(c => ({ slug: c.slug, en: (c.names && c.names.en) || c.slug || '', ar: (c.names && c.names.ar) || '' })).filter(c => c.en);
const sortedLen = [...byEn].sort((a, b) => cp(a.en) - cp(b.en));
const shortest = sortedLen.slice(0, 3);
const longest = sortedLen.slice(-3).reverse();
const withSpaces = byEn.filter(c => /\s/.test(c.en)).sort((a, b) => cp(b.en) - cp(a.en)).slice(0, 4);
const special = byEn.filter(c => /[éóíáúñçâ]/i.test(c.en)).slice(0, 4);
const show = (label, list, l) => {
    console.log(`\n• ${label} (${l}):`);
    for (const c of list) {
        const C0 = l === 'ar' ? (c.ar || c.en) : c.en;
        const t = M.fitDayTitle(l, C0, dateLabel[l]), d = M.fitDayDesc(l, C0, dateLabel[l]);
        console.log(`   "${C0}"(${cp(C0)}cp) → T=${cp(t)} M=${cp(d)}  | ${t}`);
    }
};

console.log(`Real curated cities: ${cities.length} × ${langs.length} langs = ${total} combos (date sample: 14 Jul 2026)\n`);
console.log(`TITLE  in[50,60]: ${tIn}/${total}  | <50: ${tUnder}  | >60 (long-city exceptions): ${tOver}`);
console.log(`META   in[120,160]: ${mIn}/${total}  | out: ${mOut}`);
console.log(`No-EN-fallback violations: ${fallbackHits}  | city dropped: ${cityDropped}  | date dropped: ${dateDropped}`);
if (tOverEx.length) { console.log('\n>60 TITLE examples (very long cities — documented exceptions):'); tOverEx.forEach(x => console.log('   ' + x)); }
if (tUnder) { console.log('\n✗ <50 TITLE present (unexpected) — see first examples:'); }
if (mOutEx.length) { console.log('\nMETA out examples:'); mOutEx.forEach(x => console.log('   ' + x)); }
if (fbEx.length) { console.log('\nfallback/lang examples:'); fbEx.forEach(x => console.log('   ' + x)); }

show('Shortest EN city names', shortest, 'en');
show('Longest EN city names', longest, 'en');
show('Longest EN city names (Arabic page)', longest, 'ar');
show('Cities WITH SPACES', withSpaces, 'en');
show('Special-char cities (é/ó/ñ…)', special, 'en');
// Santiago de Querétaro across a few langs
const sdq = byEn.find(c => c.slug === 'santiago-de-queretaro');
if (sdq) { console.log('\n• Santiago de Querétaro across langs:'); for (const l of ['ar','en','fr','es','tr','bn']) { const C0 = l==='ar'?(sdq.ar||sdq.en):sdq.en; const t=M.fitDayTitle(l,C0,dateLabel[l]); console.log(`   ${l}: T=${cp(t)} | ${t}`); } }

const hardFail = tUnder > 0 || fallbackHits > 0 || cityDropped > 0 || dateDropped > 0 || mOut > 0;
console.log(`\n${hardFail ? '❌ FAIL' : '✅ PASS'} — title<50:${tUnder} meta-out:${mOut} fallback:${fallbackHits} cityDropped:${cityDropped} dateDropped:${dateDropped} (title>60 long-city exceptions allowed: ${tOver})`);
process.exit(hardFail ? 1 : 0);
