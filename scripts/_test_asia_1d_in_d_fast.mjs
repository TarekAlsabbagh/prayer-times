// scripts/_test_asia_1d_in_d_fast.mjs
//
// ASIA-1D-IN-D-FAST-SUPPORTED-L10N verification (2026-05-21).
// 33 new IN cities, each with exactly {ar, en, ur, bn} — no other langs.
//
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (label, b, extra) => {
    (b ? pass++ : fail++);
    console.log((b ? '  ✓ ' : '  ✗ ') + label + (extra ? '   ' + extra : ''));
};

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' ASIA-1D-IN-D-FAST-SUPPORTED-L10N — verification');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('');

const curated = JSON.parse(readFileSync(new URL('../db/places/curated-places.json', import.meta.url), 'utf8'));
const backup = JSON.parse(readFileSync(new URL('../db/places/curated-places.json.preAsia1dInDFast.bak', import.meta.url), 'utf8'));

const NEW_33 = [
    'jalgaon','akola','ballari','dhule','avadi','parbhani','hisar','sonipat',
    'ichalkaranji','jalna','satna','ratlam','etawah','bharatpur-in','hapur',
    'rewa','vizianagaram','murwara','eluru','bidar','ongole','sambhal','panvel',
    'ambala','machilipatnam','sambalpur','haridwar','adoni','proddatur','hassan',
    'haldwani','srikakulam','roorkee'
];

// ─── Group 1: Counts ────────────────────────────────────────────────────
console.log('── Group 1: Counts ──');
ok('Total curated == 2760 (post MY)', curated.length === 2760,
   '(actual: ' + curated.length + ')');
ok('Total curated backup == 2597', backup.length === 2597);
const inNow = curated.filter(e => e.countryCode === 'in').length;
const inOrig = backup.filter(e => e.countryCode === 'in').length;
ok('IN count == 199 (post IN-D+E+F)', inNow === 199, '(actual: ' + inNow + ')');
ok('IN count backup == 109', inOrig === 109);

// ─── Group 2: All 33 added with exactly {ar, en, ur, bn} ────────────────
console.log('');
console.log('── Group 2: All 33 new entries have exactly {ar, en, ur, bn} ──');
for (const slug of NEW_33) {
    const e = curated.find(x => x.slug === slug);
    if (!e) { ok(slug + ' exists', false); continue; }
    const langs = Object.keys(e.names).sort();
    const expected = ['ar','bn','en','ur'];
    ok(slug.padEnd(18) + ' has exactly [ar,bn,en,ur]',
       JSON.stringify(langs) === JSON.stringify(expected),
       JSON.stringify(langs) === JSON.stringify(expected) ? '' : '(actual: ' + JSON.stringify(langs) + ')');
}

// ─── Group 3: Forbidden langs (hi/ta/mr/etc.) NOT in any new entry ────
console.log('');
console.log('── Group 3: No hi/ta/mr/te/kn/ml/gu/pa/or/as/sa in 33 new entries ──');
const FORBIDDEN = ['hi','ta','mr','te','kn','ml','gu','pa','or','as','sa'];
let forbiddenLeaks = 0;
for (const slug of NEW_33) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    for (const L of FORBIDDEN) {
        if (e.names[L] !== undefined) {
            console.log('  ✗ ' + slug + '.names.' + L + ' present (forbidden)');
            forbiddenLeaks++;
        }
    }
}
ok('NO forbidden lang found in any of 33 new entries', forbiddenLeaks === 0,
   forbiddenLeaks > 0 ? '(' + forbiddenLeaks + ' leaks)' : '');

// ─── Group 4: Script guards ─────────────────────────────────────────────
console.log('');
console.log('── Group 4: Script guards for names.ar/en/ur/bn ──');
const isClean = {
    ar: s => /[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s) && !/[A-Za-z]/.test(s) && !/[ऀ-ॿ]/.test(s),
    en: s => /[A-Za-z]/.test(s) && !/[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s),
    ur: s => /[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s) && !/[A-Za-z]/.test(s) && !/[ऀ-ॿ]/.test(s),
    bn: s => /[ঀ-৿]/.test(s) && !/[؀-ۿ]/.test(s) && !/[A-Za-z]/.test(s) && !/[ऀ-ॿ]/.test(s)
};
let scriptFails = 0;
for (const slug of NEW_33) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    for (const L of ['ar','en','ur','bn']) {
        if (!isClean[L](e.names[L])) {
            console.log('  ✗ ' + slug + '.names.' + L + ' = "' + e.names[L] + '" fails script guard');
            scriptFails++;
        }
    }
}
ok('All 132 (33×4) values pass per-lang script guards', scriptFails === 0,
   scriptFails > 0 ? '(' + scriptFails + ' fails)' : '');

// ─── Group 5: Prior 109 IN entries byte-identical ───────────────────────
console.log('');
console.log('── Group 5: Prior 109 IN entries byte-identical (post-mutation) ──');
const origIn = backup.filter(e => e.countryCode === 'in');
let priorMutations = 0;
for (const o of origIn) {
    const n = curated.find(x => x.slug === o.slug);
    if (!n) { priorMutations++; continue; }
    if (JSON.stringify(o) !== JSON.stringify(n)) priorMutations++;
}
ok('All 109 prior IN entries byte-identical', priorMutations === 0,
   priorMutations > 0 ? '(' + priorMutations + ' mutated)' : '');

// ─── Group 6: PK + BD + non-IN unchanged ───────────────────────────────
console.log('');
console.log('── Group 6: PK / BD / non-IN entries byte-identical ──');
for (const cc of ['pk','bd','sa','eg','ir','tr','my','id','de','fr','es','kr','jp','gb','us']) {
    const oList = backup.filter(e => e.countryCode === cc);
    let mut = 0;
    for (const o of oList) {
        const n = curated.find(x => x.slug === o.slug);
        if (!n) { mut++; continue; }
        if (JSON.stringify(o) !== JSON.stringify(n)) mut++;
    }
    ok(cc.toUpperCase().padEnd(3) + ' entries unchanged (' + oList.length + ' total)',
       mut === 0, mut > 0 ? '(' + mut + ' mutated)' : '');
}

// ─── Group 7: No duplicate slug / sourceId ─────────────────────────────
console.log('');
console.log('── Group 7: Uniqueness invariants ──');
const allSlugs = curated.map(e => e.slug);
const slugDupes = allSlugs.filter((s, i, a) => a.indexOf(s) !== i);
ok('No duplicate slug across 2630 curated entries', slugDupes.length === 0,
   slugDupes.length > 0 ? '(dupes: ' + slugDupes.join(', ') + ')' : '');
const allSrc = curated.map(e => e.sourceId).filter(Boolean);
const srcDupes = allSrc.filter((s, i, a) => a.indexOf(s) !== i);
ok('No duplicate sourceId', srcDupes.length === 0,
   srcDupes.length > 0 ? '(dupes: ' + srcDupes.join(', ') + ')' : '');

// ─── Group 8: Required fields on every new entry ───────────────────────
console.log('');
console.log('── Group 8: Required fields per place-data-maintenance-policy §6 ──');
for (const slug of NEW_33) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    ok(slug.padEnd(18) + ' has all required fields',
       e.slug && e.countryCode === 'in' && typeof e.lat === 'number' && typeof e.lng === 'number'
       && e.timezone && e.names && e.names.ar && e.names.en && e.names.ur && e.names.bn
       && e.source && e.sourceId);
}

// ─── Group 9: Spot-check specific values ───────────────────────────────
console.log('');
console.log('── Group 9: Spot-check the 4-lang names for key cities ──');
const SPOT = [
    ['jalgaon',  'ar', 'جالغاون'],
    ['jalgaon',  'ur', 'جلگاؤں'],
    ['jalgaon',  'bn', 'জালগাঁও'],
    ['akola',    'bn', 'অকোলা'],
    ['ballari',  'en', 'Ballari'],
    ['ballari',  'bn', 'বেল্লারী'],
    ['bharatpur-in', 'ur', 'بھرت پور'],
    ['bharatpur-in', 'bn', 'ভরতপুর'],
    ['haridwar', 'ur', 'ہریدوار'],
    ['haridwar', 'bn', 'হরিদ্বার'],
    ['roorkee',  'ur', 'روڑکی'],
    ['roorkee',  'bn', 'রূড়কী'],
    ['eluru',    'ur', 'ایلورو'],
    ['ongole',   'ur', 'اونگول'],
    ['ongole',   'bn', 'অনগোলে']
];
for (const [slug, L, expected] of SPOT) {
    const e = curated.find(x => x.slug === slug);
    if (!e) { ok(slug + ' exists', false); continue; }
    ok(slug + '.names.' + L + ' = "' + expected + '"',
       e.names[L] === expected,
       e.names[L] === expected ? '' : '(actual: "' + e.names[L] + '")');
}

// ─── Final tally ────────────────────────────────────────────────────────
console.log('');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' Results: ' + pass + ' passed, ' + fail + ' failed (' + (pass + fail) + ' total)');
console.log('═══════════════════════════════════════════════════════════════════════');

process.exit(fail === 0 ? 0 : 1);
