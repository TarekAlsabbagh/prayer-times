// SUPPORTED-LOCAL-LANG-CITIES-TR-FAST verification.
import { readFileSync } from 'node:fs';
let pass = 0, fail = 0;
const ok = (l, b, e) => { (b ? pass++ : fail++); console.log((b ? '  ✓ ' : '  ✗ ') + l + (e ? '   ' + e : '')); };
console.log('═══ SUPPORTED-LOCAL-LANG-CITIES-TR-FAST verification ═══\n');

const curated = JSON.parse(readFileSync(new URL('../db/places/curated-places.json', import.meta.url), 'utf8'));
const backup = JSON.parse(readFileSync(new URL('../db/places/curated-places.json.preSupportedTrFast.bak', import.meta.url), 'utf8'));

const NEW_TR = [
    'eskisehir','van','samsun','kahramanmaras','usak','denizli','corum','sivas',
    'afyonkarahisar','iskenderun','ordu','osmaniye','corlu','izmit','bolu',
    'malatya','batman','elazig','antakya','alanya','tarsus','aksaray','adiyaman',
    'adapazari','gebze','balikesir','kirikkale','kuetahya','edirne','karaman'
];

console.log('── Group 1: Counts ──');
ok('Total curated == 2947', curated.length === 2947, '(actual: ' + curated.length + ')');
ok('Backup == 2917', backup.length === 2917);
ok('TR == 44 (was 14, +30)', curated.filter(e=>e.countryCode==='tr').length === 44);
ok('TR backup == 14', backup.filter(e=>e.countryCode==='tr').length === 14);

console.log('\n── Group 2: All 30 new TR have exactly {ar,en,tr} ──');
for (const slug of NEW_TR) {
    const e = curated.find(x => x.slug === slug);
    if (!e) { ok(slug, false); continue; }
    const langs = Object.keys(e.names).sort();
    ok(slug.padEnd(18) + ' = [ar,en,tr]', JSON.stringify(langs) === JSON.stringify(['ar','en','tr']),
       JSON.stringify(langs) === JSON.stringify(['ar','en','tr']) ? '' : '(actual: ' + JSON.stringify(langs) + ')');
}

console.log('\n── Group 3: No forbidden langs ──');
const FORBIDDEN = ['ur','bn','hi','ta','mr','te','kn','ml','gu','pa','or','as','sa','id','fr','de','es','ms'];
let leaks = 0;
for (const slug of NEW_TR) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    for (const L of FORBIDDEN) if (e.names[L] !== undefined) { console.log('  ✗ ' + slug + '.' + L + ' present'); leaks++; }
}
ok('NO forbidden lang in 30 new entries', leaks === 0);

console.log('\n── Group 4: Strict Arabic guard (NO Urdu/Persian pollution) ──');
const URDU_ONLY = /[یکگپچژٹڈڑںھہےۂ]/;
const isCleanArabic = s => /[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s) && !/[A-Za-z]/.test(s) && !URDU_ONLY.test(s);
const isCleanLatin = s => /[A-Za-z]/.test(s) && !/[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s);
let arPoll = 0;
for (const slug of NEW_TR) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    if (!isCleanArabic(e.names.ar)) { console.log('  ✗ ' + slug + '.names.ar = "' + e.names.ar + '" has pollution'); arPoll++; }
}
ok('All 30 names.ar pass strict isCleanArabic (no Urdu/Persian)', arPoll === 0);

console.log('\n── Group 5: Latin guard for en + tr (90 values) ──');
let latinFail = 0;
for (const slug of NEW_TR) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    for (const L of ['en','tr']) if (!isCleanLatin(e.names[L])) { console.log('  ✗ ' + slug + '.names.' + L + ' = "' + e.names[L] + '"'); latinFail++; }
}
ok('All 60 (30 × 2) en/tr values pass Latin guard', latinFail === 0);

console.log('\n── Group 6: Prior 14 TR entries byte-identical ──');
let pm = 0;
for (const o of backup.filter(e => e.countryCode === 'tr')) {
    const n = curated.find(x => x.slug === o.slug);
    if (!n || JSON.stringify(n) !== JSON.stringify(o)) { console.log('  ✗ ' + o.slug + ' mutated'); pm++; }
}
ok('Prior 14 TR entries byte-identical', pm === 0);

console.log('\n── Group 7: IN/ID/MY/PK/BD/FR/DE/ES/MX/AR/CO/PE/CL/VE byte-identical ──');
for (const cc of ['in','id','my','pk','bd','fr','de','es','mx','ar','co','pe','cl','ve','sa','af','ir','kr','jp','gb','us','ca','it']) {
    const oL = backup.filter(e => e.countryCode === cc);
    let mut = 0;
    for (const o of oL) {
        const n = curated.find(x => x.slug === o.slug);
        if (!n || JSON.stringify(n) !== JSON.stringify(o)) mut++;
    }
    ok(cc.toUpperCase().padEnd(3) + ' (' + oL.length + ') byte-identical', mut === 0, mut > 0 ? '(' + mut + ' mutated)' : '');
}

console.log('\n── Group 8: No duplicates ──');
const sl = curated.map(e=>e.slug);
ok('No dup slug across 2947', sl.filter((s,i,a)=>a.indexOf(s)!==i).length===0);
const sc = curated.map(e=>e.sourceId).filter(Boolean);
ok('No dup sourceId', sc.filter((s,i,a)=>a.indexOf(s)!==i).length===0);
const allGids = curated.filter(e => e.sourceId && e.sourceId.startsWith('geonames:'))
    .map(e => e.sourceId.replace('geonames:', ''));
ok('No dup geonameId', allGids.filter((s,i,a) => a.indexOf(s) !== i).length === 0);

console.log('\n── Group 9: Required fields per new entry ──');
for (const slug of NEW_TR) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    ok('tr/' + slug.padEnd(18) + ' has required fields',
       e.slug && e.countryCode === 'tr' && typeof e.lat === 'number' && typeof e.lng === 'number'
       && e.timezone === 'Europe/Istanbul' && e.names && e.names.ar && e.names.en && e.names.tr
       && e.source === 'geonames' && e.sourceId);
}

console.log('\n── Group 10: names.tr uses Turkish-specific chars where required ──');
const TR_CHARS = /[İıŞşĞğÇçÖöÜü]/;
const EXPECTED_TR_CHARS = ['eskisehir','kahramanmaras','usak','corum','iskenderun','corlu','izmit','elazig','adiyaman','adapazari','balikesir','kirikkale','kuetahya'];
for (const slug of EXPECTED_TR_CHARS) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    ok('tr/' + slug.padEnd(18) + '.names.tr has Turkish chars', TR_CHARS.test(e.names.tr),
       TR_CHARS.test(e.names.tr) ? '' : '(actual: "' + e.names.tr + '")');
}

console.log('\n── Group 11: Spot-check values ──');
const SPOT = [
    ['eskisehir',      'tr', 'Eskişehir'],
    ['eskisehir',      'en', 'Eskisehir'],
    ['eskisehir',      'ar', 'أسكي شهر'],
    ['kahramanmaras',  'tr', 'Kahramanmaraş'],
    ['kahramanmaras',  'ar', 'كهرمان مرعش'],
    ['malatya',        'ar', 'ملاطية'],
    ['batman',         'ar', 'باتمان'],
    ['antakya',        'ar', 'أنطاكيا'],
    ['alanya',         'ar', 'ألانيا'],
    ['tarsus',         'ar', 'طرسوس'],
    ['aksaray',        'ar', 'أق سراي'],
    ['gebze',          'ar', 'غبزة'],
    ['kirikkale',      'ar', 'كيريكالي'],
    ['kuetahya',       'tr', 'Kütahya'],
    ['kuetahya',       'ar', 'كوتاهية'],
    ['edirne',         'ar', 'أدرنة'],
    ['karaman',        'ar', 'قرمان']
];
for (const [slug, L, expected] of SPOT) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    ok('tr/' + slug + '.names.' + L + ' = "' + expected + '"', e.names[L] === expected,
       e.names[L] === expected ? '' : '(actual: "' + e.names[L] + '")');
}

console.log('\n── Group 12: NAME_AR_FIX targets actually fixed (no pollution leaked) ──');
const MANUAL_FIX_SLUGS = ['malatya','batman','elazig','antakya','alanya','tarsus','aksaray','adiyaman','adapazari','gebze','balikesir','kirikkale','kuetahya','edirne','karaman'];
for (const slug of MANUAL_FIX_SLUGS) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    const ar = e.names.ar;
    const hasPollution = URDU_ONLY.test(ar) || /[A-Za-z]/.test(ar);
    ok(slug.padEnd(18) + ' Arabic NOT polluted', !hasPollution,
       hasPollution ? '(found pollution in "' + ar + '")' : '');
}

console.log('\n══════════════════════════════════════');
console.log(' Results: ' + pass + ' passed, ' + fail + ' failed (' + (pass+fail) + ')');
console.log('══════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
