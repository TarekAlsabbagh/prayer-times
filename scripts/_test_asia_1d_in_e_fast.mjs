// scripts/_test_asia_1d_in_e_fast.mjs
//
// ASIA-1D-IN-E-FAST-SUPPORTED-L10N verification (2026-05-21).
// 30 new IN cities (TN+KL focus), each with exactly {ar,en,ur,bn}.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (label, b, extra) => {
    (b ? pass++ : fail++);
    console.log((b ? '  ✓ ' : '  ✗ ') + label + (extra ? '   ' + extra : ''));
};

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' ASIA-1D-IN-E-FAST-SUPPORTED-L10N — verification');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('');

const curated = JSON.parse(readFileSync(new URL('../db/places/curated-places.json', import.meta.url), 'utf8'));
const backup = JSON.parse(readFileSync(new URL('../db/places/curated-places.json.preAsia1dInEFast.bak', import.meta.url), 'utf8'));

const NEW_30 = [
    'thiruvananthapuram','vellore','ambattur','thoothukudi','kollam','thrissur',
    'dindigul','thanjavur','ranipet','tiruvottiyur','alappuzha','sivakasi',
    'pallavaram','hosur','nagercoil','kanchipuram','tambaram','cuddalore',
    'kumbakonam','palakkad','rajapalayam','ambur','nagapattinam','malappuram',
    'gudiyatham','pollachi','kayamkulam','kannur','pathanamthitta','kottayam'
];

// ─── Group 1: Counts ────────────────────────────────────────────────────
console.log('── Group 1: Counts ──');
ok('Total curated == 2687 (post IN-F)', curated.length === 2728, '(actual: ' + curated.length + ')');
ok('Total curated backup == 2630', backup.length === 2630);
const inNow = curated.filter(e => e.countryCode === 'in').length;
const inOrig = backup.filter(e => e.countryCode === 'in').length;
ok('IN count == 199 (post IN-F)', inNow === 199, '(actual: ' + inNow + ')');
ok('IN count backup == 142', inOrig === 142);

// ─── Group 2: All 30 added with exactly {ar, en, ur, bn} ────────────────
console.log('');
console.log('── Group 2: All 30 new entries have exactly {ar, en, ur, bn} ──');
for (const slug of NEW_30) {
    const e = curated.find(x => x.slug === slug);
    if (!e) { ok(slug + ' exists', false); continue; }
    const langs = Object.keys(e.names).sort();
    ok(slug.padEnd(22) + ' has exactly [ar,bn,en,ur]',
       JSON.stringify(langs) === JSON.stringify(['ar','bn','en','ur']),
       JSON.stringify(langs) === JSON.stringify(['ar','bn','en','ur']) ? '' : '(actual: ' + JSON.stringify(langs) + ')');
}

// ─── Group 3: Forbidden langs NOT in any new entry ─────────────────────
console.log('');
console.log('── Group 3: No hi/ta/mr/te/kn/ml/gu/pa/or/as/sa in 30 new entries ──');
const FORBIDDEN = ['hi','ta','mr','te','kn','ml','gu','pa','or','as','sa'];
let forbiddenLeaks = 0;
for (const slug of NEW_30) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    for (const L of FORBIDDEN) {
        if (e.names[L] !== undefined) {
            console.log('  ✗ ' + slug + '.names.' + L + ' present (forbidden)');
            forbiddenLeaks++;
        }
    }
}
ok('NO forbidden lang found in any of 30 new entries', forbiddenLeaks === 0);

// ─── Group 4: Script guards (strict per-lang) ──────────────────────────
console.log('');
console.log('── Group 4: Script guards (132 values) ──');
const URDU_ONLY = /[یکگپچژٹڈڑںھہےۂ]/;
const isClean = {
    ar: s => /[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s) && !/[A-Za-z]/.test(s) && !/[ऀ-ॿ]/.test(s) && !URDU_ONLY.test(s),
    en: s => /[A-Za-z]/.test(s) && !/[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s),
    ur: s => /[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s) && !/[A-Za-z]/.test(s) && !/[ऀ-ॿ]/.test(s),
    bn: s => /[ঀ-৿]/.test(s) && !/[؀-ۿ]/.test(s) && !/[A-Za-z]/.test(s) && !/[ऀ-ॿ]/.test(s)
};
let scriptFails = 0;
for (const slug of NEW_30) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    for (const L of ['ar','en','ur','bn']) {
        if (!isClean[L](e.names[L])) {
            console.log('  ✗ ' + slug + '.names.' + L + ' = "' + e.names[L] + '" fails script guard');
            scriptFails++;
        }
    }
}
ok('All 120 (30 × 4) values pass per-lang script guards', scriptFails === 0,
   scriptFails > 0 ? '(' + scriptFails + ' fails)' : '');

// ─── Group 5: Prior 142 IN entries byte-identical ──────────────────────
console.log('');
console.log('── Group 5: Prior 142 IN entries byte-identical ──');
const origIn = backup.filter(e => e.countryCode === 'in');
let priorMutations = 0;
for (const o of origIn) {
    const n = curated.find(x => x.slug === o.slug);
    if (!n) { priorMutations++; continue; }
    if (JSON.stringify(o) !== JSON.stringify(n)) priorMutations++;
}
ok('All 142 prior IN entries byte-identical', priorMutations === 0,
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
    ok(cc.toUpperCase().padEnd(3) + ' entries unchanged (' + oList.length + ')', mut === 0);
}

// ─── Group 7: No duplicates ────────────────────────────────────────────
console.log('');
console.log('── Group 7: Uniqueness invariants ──');
const allSlugs = curated.map(e => e.slug);
ok('No duplicate slug', allSlugs.filter((s,i,a) => a.indexOf(s) !== i).length === 0);
const allSrc = curated.map(e => e.sourceId).filter(Boolean);
ok('No duplicate sourceId', allSrc.filter((s,i,a) => a.indexOf(s) !== i).length === 0);

// ─── Group 8: Required fields ──────────────────────────────────────────
console.log('');
console.log('── Group 8: Required fields per place-data-maintenance-policy §6 ──');
for (const slug of NEW_30) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    ok(slug.padEnd(22) + ' has all required fields',
       e.slug && e.countryCode === 'in' && typeof e.lat === 'number' && typeof e.lng === 'number'
       && e.timezone && e.names && e.names.ar && e.names.en && e.names.ur && e.names.bn
       && e.source && e.sourceId);
}

// ─── Group 9: Spot-check specific values ───────────────────────────────
console.log('');
console.log('── Group 9: Spot-check 4-lang names ──');
const SPOT = [
    ['thiruvananthapuram', 'ar', 'ثيروفانانثابورام'],
    ['thiruvananthapuram', 'ur', 'تھیروواننتھاپورم'],
    ['thiruvananthapuram', 'bn', 'তিরুবনন্তপুরম'],
    ['thoothukudi', 'ur', 'توتوکودی'],
    ['thoothukudi', 'bn', 'থোথুক্কুড়ি'],
    ['kollam', 'ur', 'کولم'],
    ['thanjavur', 'ar', 'تنجاور'],
    ['thanjavur', 'ur', 'تھانجاور'],
    ['kanchipuram', 'ar', 'كانشيبورم'],
    ['kanchipuram', 'bn', 'কাঞ্চিপুরম'],
    ['palakkad', 'ar', 'بلكاد'],
    ['palakkad', 'ur', 'پالاککاد'],
    ['vellore', 'ur', 'ویلور'],
    ['ambur', 'ar', 'امبور'],
    ['kannur', 'ar', 'كانور']
];
for (const [slug, L, expected] of SPOT) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    ok(slug + '.names.' + L + ' = "' + expected + '"', e.names[L] === expected,
       e.names[L] === expected ? '' : '(actual: "' + e.names[L] + '")');
}

// ─── Group 10: Aliases preserved ───────────────────────────────────────
console.log('');
console.log('── Group 10: aliases.en for renamed cities ──');
const ALIAS = {
    'thiruvananthapuram': 'Trivandrum',
    'thoothukudi': 'Tuticorin',
    'kollam': 'Quilon',
    'thanjavur': 'Tanjore',
    'alappuzha': 'Alleppey',
    'palakkad': 'Palghat',
    'kannur': 'Cannanore'
};
for (const [slug, alias] of Object.entries(ALIAS)) {
    const e = curated.find(x => x.slug === slug);
    if (!e) { ok(slug + ' exists', false); continue; }
    ok(slug + ' has aliases.en including "' + alias + '"',
       e.aliases && Array.isArray(e.aliases.en) && e.aliases.en.includes(alias));
}

console.log('');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' Results: ' + pass + ' passed, ' + fail + ' failed (' + (pass + fail) + ' total)');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
