// ASIA-1D-IN-F-FAST-SUPPORTED-L10N verification.
import { readFileSync } from 'node:fs';
let pass = 0, fail = 0;
const ok = (label, b, extra) => { (b ? pass++ : fail++); console.log((b ? '  ✓ ' : '  ✗ ') + label + (extra ? '   ' + extra : '')); };
console.log('═══ ASIA-1D-IN-F verification ═══\n');
const curated = JSON.parse(readFileSync(new URL('../db/places/curated-places.json', import.meta.url), 'utf8'));
const backup = JSON.parse(readFileSync(new URL('../db/places/curated-places.json.preAsia1dInFFast.bak', import.meta.url), 'utf8'));

const NEW_27 = ['bhilwara','gandhidham','sikar','sri-ganganagar','anand','madanapalle','surendranagar','veraval','navsari','bharuch','tonk','hanumangarh','porbandar','hindupur','beawar','bhuj','godhra','palanpur','valsad','botad','dharmavaram','adilabad','gudivada','narasaraopet','chittorgarh','banswara','kavali'];

console.log('── Group 1: Counts ──');
ok('Total curated == 2810 (post FR-DE wave)', curated.length === 2810, '(' + curated.length + ')');
ok('Backup curated == 2660', backup.length === 2660);
ok('IN count == 199 (was 172, +27)', curated.filter(e => e.countryCode === 'in').length === 199);
ok('IN backup == 172', backup.filter(e => e.countryCode === 'in').length === 172);

console.log('\n── Group 2: All 27 have exactly {ar,bn,en,ur} ──');
for (const slug of NEW_27) {
    const e = curated.find(x => x.slug === slug);
    if (!e) { ok(slug + ' exists', false); continue; }
    const langs = Object.keys(e.names).sort();
    ok(slug.padEnd(20) + ' = [ar,bn,en,ur]', JSON.stringify(langs) === JSON.stringify(['ar','bn','en','ur']));
}

console.log('\n── Group 3: No forbidden langs (hi/ta/mr/...) ──');
const FORBIDDEN = ['hi','ta','mr','te','kn','ml','gu','pa','or','as','sa'];
let leaks = 0;
for (const slug of NEW_27) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    for (const L of FORBIDDEN) if (e.names[L] !== undefined) leaks++;
}
ok('NO forbidden lang found in 27 new entries', leaks === 0);

console.log('\n── Group 4: Script guards (108 values) ──');
const URDU_ONLY = /[یکگپچژٹڈڑںھہےۂ]/;
const isClean = {
    ar: s => /[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s) && !/[A-Za-z]/.test(s) && !/[ऀ-ॿ]/.test(s) && !URDU_ONLY.test(s),
    en: s => /[A-Za-z]/.test(s) && !/[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s),
    ur: s => /[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s) && !/[A-Za-z]/.test(s) && !/[ऀ-ॿ]/.test(s),
    bn: s => /[ঀ-৿]/.test(s) && !/[؀-ۿ]/.test(s) && !/[A-Za-z]/.test(s) && !/[ऀ-ॿ]/.test(s)
};
let scriptFails = 0;
for (const slug of NEW_27) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    for (const L of ['ar','en','ur','bn']) {
        if (!isClean[L](e.names[L])) {
            console.log('  ✗ ' + slug + '.names.' + L + ' = "' + e.names[L] + '"');
            scriptFails++;
        }
    }
}
ok('All 108 (27 × 4) values pass per-lang script guards', scriptFails === 0);

console.log('\n── Group 5: Prior 172 IN entries byte-identical ──');
let priorMut = 0;
for (const o of backup.filter(e => e.countryCode === 'in')) {
    const n = curated.find(x => x.slug === o.slug);
    if (!n || JSON.stringify(n) !== JSON.stringify(o)) priorMut++;
}
ok('All 172 prior IN entries byte-identical', priorMut === 0);

console.log('\n── Group 6: PK/BD/non-IN byte-identical ──');
for (const cc of ['pk','bd','sa','af','ir','tr','my','id','de','fr','es']) {
    const oList = backup.filter(e => e.countryCode === cc);
    let mut = 0;
    for (const o of oList) {
        const n = curated.find(x => x.slug === o.slug);
        if (!n || JSON.stringify(n) !== JSON.stringify(o)) mut++;
    }
    ok(cc.toUpperCase().padEnd(3) + ' (' + oList.length + ') byte-identical', mut === 0);
}

console.log('\n── Group 7: No duplicates ──');
const slugs = curated.map(e => e.slug);
ok('No dup slug', slugs.filter((s,i,a) => a.indexOf(s) !== i).length === 0);
const srcs = curated.map(e => e.sourceId).filter(Boolean);
ok('No dup sourceId', srcs.filter((s,i,a) => a.indexOf(s) !== i).length === 0);

console.log('\n── Group 8: Spot-check values ──');
const SPOT = [
    ['bhuj', 'ar', 'بوج'], ['bhuj', 'ur', 'بھوج'], ['bhuj', 'bn', 'ভূজ'],
    ['anand', 'ar', 'آنند'], ['tonk', 'ar', 'تونك'], ['tonk', 'ur', 'ٹونک'],
    ['chittorgarh', 'ur', 'چتور گڑھ'], ['chittorgarh', 'bn', 'চিতোরগড়'],
    ['adilabad', 'ar', 'عادل آباد'], ['porbandar', 'ar', 'بوربندر']
];
for (const [slug, L, expected] of SPOT) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    ok(slug + '.names.' + L + ' = "' + expected + '"', e.names[L] === expected,
       e.names[L] === expected ? '' : '(actual: "' + e.names[L] + '")');
}

console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log(' Results: ' + pass + ' passed, ' + fail + ' failed (' + (pass + fail) + ' total)');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
