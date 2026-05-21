// ASIA-1H-MY-FAST-SUPPORTED-L10N verification.
import { readFileSync } from 'node:fs';
let pass = 0, fail = 0;
const ok = (l,b,e) => { (b?pass++:fail++); console.log((b?'  ✓ ':'  ✗ ')+l+(e?'   '+e:'')); };
console.log('═══ ASIA-1H-MY verification ═══\n');
const curated = JSON.parse(readFileSync(new URL('../db/places/curated-places.json', import.meta.url), 'utf8'));
const backup = JSON.parse(readFileSync(new URL('../db/places/curated-places.json.preAsia1hMyFast.bak', import.meta.url), 'utf8'));

const NEW_32 = [
    'subang-jaya','iskandar-puteri','sungai-petani','kota-kuala-muda','puchong',
    'kluang','muar','klang','kajang','teluk-intan','pasir-mas','sungai-buloh',
    'taiping','sepang','rawang','sibu','kuala-kubu-baharu','kulim','batu-pahat',
    'sitiawan','bintulu','port-dickson','maran','butterworth','lahad-datu',
    'kuala-krai','seri-manjung','cyberjaya','semporna','temerloh','putrajaya',
    'bentong'
];

console.log('── Group 1: Counts ──');
ok('Total curated == 2947 (post TR)', curated.length === 2947, '(actual: ' + curated.length + ')');
ok('Backup == 2728', backup.length === 2728);
ok('MY count == 53', curated.filter(e=>e.countryCode==='my').length === 53,
   '(actual: ' + curated.filter(e=>e.countryCode==='my').length + ')');
ok('MY backup == 21', backup.filter(e=>e.countryCode==='my').length === 21);

console.log('\n── Group 2: All 32 have exactly {ar,en,ms} ──');
for (const slug of NEW_32) {
    const e = curated.find(x => x.slug === slug);
    if (!e) { ok(slug, false); continue; }
    const langs = Object.keys(e.names).sort();
    ok(slug.padEnd(20) + ' = [ar,en,ms]', JSON.stringify(langs) === JSON.stringify(['ar','en','ms']),
       JSON.stringify(langs) === JSON.stringify(['ar','en','ms']) ? '' : '(actual: ' + JSON.stringify(langs) + ')');
}

console.log('\n── Group 3: No forbidden langs ──');
const FORBIDDEN = ['ur','bn','hi','ta','mr','te','kn','ml','gu','pa','or','as','sa','fr','de','tr','es','id'];
let leaks = 0;
for (const slug of NEW_32) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    for (const L of FORBIDDEN) if (e.names[L] !== undefined) {
        console.log('  ✗ ' + slug + '.names.' + L + ' present (forbidden)');
        leaks++;
    }
}
ok('NO forbidden lang in 32 new entries', leaks === 0);

console.log('\n── Group 4: Script guards (96 values) ──');
const URDU_ONLY = /[یکگپچژٹڈڑںھہےۂ]/;
const isC = {
    ar: s => /[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s) && !/[A-Za-z]/.test(s) && !URDU_ONLY.test(s),
    en: s => /[A-Za-z]/.test(s) && !/[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s),
    ms: s => /[A-Za-z]/.test(s) && !/[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s)
};
let sf = 0;
for (const slug of NEW_32) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    for (const L of ['ar','en','ms']) if (!isC[L](e.names[L])) {
        console.log('  ✗ ' + slug + '.names.' + L + ' = "' + e.names[L] + '"');
        sf++;
    }
}
ok('All 96 (32 × 3) values pass guards', sf === 0, sf > 0 ? '(' + sf + ' fails)' : '');

console.log('\n── Group 5: Prior 21 MY entries byte-identical ──');
let pm = 0;
for (const o of backup.filter(e => e.countryCode === 'my')) {
    const n = curated.find(x => x.slug === o.slug);
    if (!n || JSON.stringify(n) !== JSON.stringify(o)) {
        console.log('  ✗ ' + o.slug + ' mutated');
        pm++;
    }
}
ok('Prior 21 MY entries byte-identical', pm === 0);

console.log('\n── Group 6: IN/PK/BD/ID/non-MY byte-identical ──');
for (const cc of ['in','pk','bd','sa','af','ir','tr','id','de','fr','es','kr','jp','gb','us']) {
    const oL = backup.filter(e => e.countryCode === cc);
    let mut = 0;
    for (const o of oL) {
        const n = curated.find(x => x.slug === o.slug);
        if (!n || JSON.stringify(n) !== JSON.stringify(o)) mut++;
    }
    ok(cc.toUpperCase().padEnd(3) + ' (' + oL.length + ') byte-identical', mut === 0,
       mut > 0 ? '(' + mut + ' mutated)' : '');
}

console.log('\n── Group 7: No duplicates ──');
const sl = curated.map(e=>e.slug);
ok('No dup slug', sl.filter((s,i,a)=>a.indexOf(s)!==i).length===0);
const sc = curated.map(e=>e.sourceId).filter(Boolean);
ok('No dup sourceId', sc.filter((s,i,a)=>a.indexOf(s)!==i).length===0);

console.log('\n── Group 8: Required fields ──');
for (const slug of NEW_32) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    ok(slug.padEnd(20) + ' has required fields',
       e.slug && e.countryCode === 'my' && typeof e.lat === 'number' && typeof e.lng === 'number'
       && e.timezone === 'Asia/Kuala_Lumpur' && e.names && e.names.ar && e.names.en && e.names.ms
       && e.source === 'geonames' && e.sourceId);
}

console.log('\n── Group 9: Spot-check values ──');
const SPOT = [
    ['subang-jaya',       'ar', 'سوبانغ جايا'],
    ['subang-jaya',       'en', 'Subang Jaya'],
    ['subang-jaya',       'ms', 'Subang Jaya'],
    ['iskandar-puteri',   'ar', 'إسكندر بوتري'],
    ['klang',             'ar', 'كلانغ'],
    ['kajang',            'ar', 'كاجانغ'],
    ['putrajaya',         'ar', 'بوتراجايا'],
    ['cyberjaya',         'ar', 'سايبرجايا'],
    ['butterworth',       'ar', 'بترورث'],
    ['taiping',           'ar', 'تايبينغ'],
    ['kuala-kubu-baharu', 'ar', 'كوالا كوبو باهارو'],
    ['port-dickson',      'ar', 'بورت ديكسون'],
    ['lahad-datu',        'ar', 'لاهاد داتو'],
    ['semporna',          'ar', 'سيمبورنا'],
    ['temerloh',          'ar', 'تيميرلوه']
];
for (const [slug, L, expected] of SPOT) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    ok(slug + '.names.' + L + ' = "' + expected + '"', e.names[L] === expected,
       e.names[L] === expected ? '' : '(actual: "' + e.names[L] + '")');
}

console.log('\n── Group 10: names.ms == names.en (same-as-en proper nouns) ──');
let mismatch = 0;
for (const slug of NEW_32) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    if (e.names.ms !== e.names.en) {
        console.log('  ✗ ' + slug + ': ms="' + e.names.ms + '" en="' + e.names.en + '"');
        mismatch++;
    }
}
ok('All 32 names.ms == names.en (Malay proper-noun convention)', mismatch === 0);

console.log('\n── Group 11: GID uniqueness across all curated ──');
const allGids = curated.filter(e => e.sourceId && e.sourceId.startsWith('geonames:'))
    .map(e => e.sourceId.replace('geonames:', ''));
const gidDupes = allGids.filter((s,i,a) => a.indexOf(s) !== i);
ok('No dup geonameId across all 2760 entries', gidDupes.length === 0,
   gidDupes.length > 0 ? '(dupes: ' + gidDupes.slice(0,5).join(', ') + ')' : '');

console.log('\n══════════════════════════════════════');
console.log(' Results: ' + pass + ' passed, ' + fail + ' failed (' + (pass+fail) + ')');
console.log('══════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
