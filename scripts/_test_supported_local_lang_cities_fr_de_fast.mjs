// SUPPORTED-LOCAL-LANG-CITIES-FR-DE-FAST verification.
import { readFileSync } from 'node:fs';
let pass = 0, fail = 0;
const ok = (l, b, e) => { (b ? pass++ : fail++); console.log((b ? '  ✓ ' : '  ✗ ') + l + (e ? '   ' + e : '')); };
console.log('═══ SUPPORTED-LOCAL-LANG-CITIES-FR-DE-FAST verification ═══\n');

const curated = JSON.parse(readFileSync(new URL('../db/places/curated-places.json', import.meta.url), 'utf8'));
const backup = JSON.parse(readFileSync(new URL('../db/places/curated-places.json.preSupportedFrDeFast.bak', import.meta.url), 'utf8'));

const NEW_FR = [
    'strasbourg','montpellier','lille','reims','angers','nimes','brest','amiens',
    'limoges','mulhouse','avignon','poitiers','versailles','pau','la-rochelle',
    'antibes','cannes','calais','beziers','dunkirk','bourges','saint-nazaire',
    'colmar','valence','quimper'
];
const NEW_DE = [
    'dresden','leipzig','muenster','wiesbaden','braunschweig','magdeburg','oberhausen',
    'erfurt','hagen','rostock','potsdam','saarbruecken','muelheim','leverkusen','fuerth',
    'recklinghausen','ingolstadt','bottrop','offenbach','koblenz','siegen',
    'bergisch-gladbach','jena','gera','erlangen'
];

console.log('── Group 1: Counts ──');
ok('Total curated == 2947 (post TR)', curated.length === 2947, '(actual: ' + curated.length + ')');
ok('Backup == 2760', backup.length === 2760);
ok('FR count == 75 (post FR-DE-B)', curated.filter(e=>e.countryCode==='fr').length === 75,
   '(actual: ' + curated.filter(e=>e.countryCode==='fr').length + ')');
ok('DE count == 106 (post FR-DE-B)', curated.filter(e=>e.countryCode==='de').length === 106,
   '(actual: ' + curated.filter(e=>e.countryCode==='de').length + ')');
ok('FR backup == 25', backup.filter(e=>e.countryCode==='fr').length === 25);
ok('DE backup == 56', backup.filter(e=>e.countryCode==='de').length === 56);

console.log('\n── Group 2: All 25 new FR have exactly {ar,en,fr} ──');
for (const slug of NEW_FR) {
    const e = curated.find(x => x.slug === slug);
    if (!e) { ok(slug, false); continue; }
    const langs = Object.keys(e.names).sort();
    ok(slug.padEnd(18) + ' = [ar,en,fr]', JSON.stringify(langs) === JSON.stringify(['ar','en','fr']),
       JSON.stringify(langs) === JSON.stringify(['ar','en','fr']) ? '' : '(actual: ' + JSON.stringify(langs) + ')');
}

console.log('\n── Group 3: All 25 new DE have exactly {ar,en,de} ──');
for (const slug of NEW_DE) {
    const e = curated.find(x => x.slug === slug);
    if (!e) { ok(slug, false); continue; }
    const langs = Object.keys(e.names).sort();
    ok(slug.padEnd(18) + ' = [ar,de,en]', JSON.stringify(langs) === JSON.stringify(['ar','de','en']),
       JSON.stringify(langs) === JSON.stringify(['ar','de','en']) ? '' : '(actual: ' + JSON.stringify(langs) + ')');
}

console.log('\n── Group 4: No forbidden langs in any new entry ──');
const FORBIDDEN = ['ur','bn','hi','ta','mr','te','kn','ml','gu','pa','or','as','sa','id','es','tr','ms'];
let leaks = 0;
for (const slug of [...NEW_FR, ...NEW_DE]) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    for (const L of FORBIDDEN) if (e.names[L] !== undefined) {
        console.log('  ✗ ' + slug + '.names.' + L + ' present (forbidden)');
        leaks++;
    }
}
ok('NO forbidden lang in 50 new entries', leaks === 0);

console.log('\n── Group 5: Script guards (150 values) ──');
const URDU_ONLY = /[یکگپچژٹڈڑںھہےۂ]/;
const isC = {
    ar: s => /[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s) && !/[A-Za-z]/.test(s) && !URDU_ONLY.test(s),
    en: s => /[A-Za-z]/.test(s) && !/[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s),
    fr: s => /[A-Za-z]/.test(s) && !/[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s),
    de: s => /[A-Za-z]/.test(s) && !/[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s)
};
let sf = 0;
for (const slug of NEW_FR) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    for (const L of ['ar','en','fr']) if (!isC[L](e.names[L])) {
        console.log('  ✗ ' + slug + '.names.' + L + ' = "' + e.names[L] + '"'); sf++;
    }
}
for (const slug of NEW_DE) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    for (const L of ['ar','en','de']) if (!isC[L](e.names[L])) {
        console.log('  ✗ ' + slug + '.names.' + L + ' = "' + e.names[L] + '"'); sf++;
    }
}
ok('All 150 (50 × 3) values pass guards', sf === 0, sf > 0 ? '(' + sf + ' fails)' : '');

console.log('\n── Group 6: Prior 25 FR + 56 DE entries byte-identical ──');
let pmFr = 0, pmDe = 0;
for (const o of backup.filter(e => e.countryCode === 'fr')) {
    const n = curated.find(x => x.slug === o.slug);
    if (!n || JSON.stringify(n) !== JSON.stringify(o)) { console.log('  ✗ fr/' + o.slug + ' mutated'); pmFr++; }
}
for (const o of backup.filter(e => e.countryCode === 'de')) {
    const n = curated.find(x => x.slug === o.slug);
    if (!n || JSON.stringify(n) !== JSON.stringify(o)) { console.log('  ✗ de/' + o.slug + ' mutated'); pmDe++; }
}
ok('Prior 25 FR entries byte-identical', pmFr === 0);
ok('Prior 56 DE entries byte-identical', pmDe === 0);

console.log('\n── Group 7: IN/ID/MY/PK/BD + other countries byte-identical ──');
for (const cc of ['in','id','my','pk','bd','sa','af','ir','tr','es','kr','jp','gb','us','mx','it','nl','be','ch','at']) {
    const oL = backup.filter(e => e.countryCode === cc);
    let mut = 0;
    for (const o of oL) {
        const n = curated.find(x => x.slug === o.slug);
        if (!n || JSON.stringify(n) !== JSON.stringify(o)) mut++;
    }
    ok(cc.toUpperCase().padEnd(3) + ' (' + oL.length + ') byte-identical', mut === 0,
       mut > 0 ? '(' + mut + ' mutated)' : '');
}

console.log('\n── Group 8: No duplicates ──');
const sl = curated.map(e=>e.slug);
ok('No dup slug across 2810', sl.filter((s,i,a)=>a.indexOf(s)!==i).length===0);
const sc = curated.map(e=>e.sourceId).filter(Boolean);
ok('No dup sourceId', sc.filter((s,i,a)=>a.indexOf(s)!==i).length===0);
const allGids = curated.filter(e => e.sourceId && e.sourceId.startsWith('geonames:'))
    .map(e => e.sourceId.replace('geonames:', ''));
ok('No dup geonameId', allGids.filter((s,i,a) => a.indexOf(s) !== i).length === 0);

console.log('\n── Group 9: Required fields per new entry ──');
for (const slug of NEW_FR) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    ok('fr/' + slug.padEnd(18) + ' has required fields',
       e.slug && e.countryCode === 'fr' && typeof e.lat === 'number' && typeof e.lng === 'number'
       && e.timezone === 'Europe/Paris' && e.names && e.names.ar && e.names.en && e.names.fr
       && e.source === 'geonames' && e.sourceId);
}
for (const slug of NEW_DE) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    ok('de/' + slug.padEnd(18) + ' has required fields',
       e.slug && e.countryCode === 'de' && typeof e.lat === 'number' && typeof e.lng === 'number'
       && e.timezone === 'Europe/Berlin' && e.names && e.names.ar && e.names.en && e.names.de
       && e.source === 'geonames' && e.sourceId);
}

console.log('\n── Group 10: Spot-check FR values ──');
const FR_SPOT = [
    ['strasbourg', 'ar', 'ستراسبورغ'],
    ['strasbourg', 'fr', 'Strasbourg'],
    ['nimes',      'en', 'Nimes'],
    ['nimes',      'fr', 'Nîmes'],
    ['beziers',    'fr', 'Béziers'],
    ['beziers',    'ar', 'بيزييه'],
    ['dunkirk',    'en', 'Dunkirk'],
    ['dunkirk',    'fr', 'Dunkerque'],
    ['versailles', 'ar', 'فرساي'],
    ['cannes',     'ar', 'كان'],
    ['lille',      'ar', 'ليل']
];
for (const [slug, L, expected] of FR_SPOT) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    ok('fr/' + slug + '.names.' + L + ' = "' + expected + '"', e.names[L] === expected,
       e.names[L] === expected ? '' : '(actual: "' + e.names[L] + '")');
}

console.log('\n── Group 11: Spot-check DE values ──');
const DE_SPOT = [
    ['dresden',           'ar', 'دريسدن'],
    ['leipzig',           'ar', 'لايبزغ'],
    ['muenster',          'en', 'Munster'],
    ['muenster',          'de', 'Münster'],
    ['saarbruecken',      'de', 'Saarbrücken'],
    ['saarbruecken',      'en', 'Saarbrucken'],
    ['fuerth',            'de', 'Fürth'],
    ['fuerth',            'en', 'Furth'],
    ['muelheim',          'de', 'Mülheim'],
    ['braunschweig',      'en', 'Brunswick'],
    ['braunschweig',      'de', 'Braunschweig'],
    ['bergisch-gladbach', 'ar', 'بيرغيش غلادباخ']
];
for (const [slug, L, expected] of DE_SPOT) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    ok('de/' + slug + '.names.' + L + ' = "' + expected + '"', e.names[L] === expected,
       e.names[L] === expected ? '' : '(actual: "' + e.names[L] + '")');
}

console.log('\n══════════════════════════════════════');
console.log(' Results: ' + pass + ' passed, ' + fail + ' failed (' + (pass+fail) + ')');
console.log('══════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
