// SUPPORTED-LOCAL-LANG-CITIES-FR-DE-B-FAST verification.
import { readFileSync } from 'node:fs';
let pass = 0, fail = 0;
const ok = (l, b, e) => { (b ? pass++ : fail++); console.log((b ? '  ✓ ' : '  ✗ ') + l + (e ? '   ' + e : '')); };
console.log('═══ SUPPORTED-LOCAL-LANG-CITIES-FR-DE-B-FAST verification ═══\n');

const curated = JSON.parse(readFileSync(new URL('../db/places/curated-places.json', import.meta.url), 'utf8'));
const backup = JSON.parse(readFileSync(new URL('../db/places/curated-places.json.preSupportedFrDeBFast.bak', import.meta.url), 'utf8'));

const NEW_FR = [
    'montreuil','boulogne-billancourt','argenteuil','roubaix','tourcoing',
    'saint-denis-fr','nanterre','courbevoie','creteil','vitry-sur-seine',
    'aulnay-sous-bois','saint-maur-des-fosses','chambery','troyes','lorient',
    'evreux','beauvais','arles','cholet','frejus','narbonne','laval-fr',
    'annecy','grasse','bayonne'
];
const NEW_DE = [
    'zwickau','kaiserslautern','guetersloh','dueren','esslingen','tuebingen',
    'iserlohn','witten','ratingen','marl','luenen','giessen','hanau','velbert',
    'ludwigsburg','flensburg','cottbus','konstanz','luedenscheid','marburg',
    'bayreuth','landshut','lueneburg','bamberg','aschaffenburg'
];

console.log('── Group 1: Counts ──');
ok('Total curated == 2977 (post TR-B)', curated.length === 2977, '(actual: ' + curated.length + ')');
ok('Backup == 2810', backup.length === 2810);
ok('FR count == 75 (was 50, +25)', curated.filter(e=>e.countryCode==='fr').length === 75);
ok('DE count == 106 (was 81, +25)', curated.filter(e=>e.countryCode==='de').length === 106);
ok('FR backup == 50', backup.filter(e=>e.countryCode==='fr').length === 50);
ok('DE backup == 81', backup.filter(e=>e.countryCode==='de').length === 81);

console.log('\n── Group 2: All 25 new FR have exactly {ar,en,fr} ──');
for (const slug of NEW_FR) {
    const e = curated.find(x => x.slug === slug);
    if (!e) { ok(slug, false); continue; }
    const langs = Object.keys(e.names).sort();
    ok(slug.padEnd(24) + ' = [ar,en,fr]', JSON.stringify(langs) === JSON.stringify(['ar','en','fr']),
       JSON.stringify(langs) === JSON.stringify(['ar','en','fr']) ? '' : '(actual: ' + JSON.stringify(langs) + ')');
}

console.log('\n── Group 3: All 25 new DE have exactly {ar,en,de} ──');
for (const slug of NEW_DE) {
    const e = curated.find(x => x.slug === slug);
    if (!e) { ok(slug, false); continue; }
    const langs = Object.keys(e.names).sort();
    ok(slug.padEnd(20) + ' = [ar,de,en]', JSON.stringify(langs) === JSON.stringify(['ar','de','en']),
       JSON.stringify(langs) === JSON.stringify(['ar','de','en']) ? '' : '(actual: ' + JSON.stringify(langs) + ')');
}

console.log('\n── Group 4: No forbidden langs ──');
const FORBIDDEN = ['ur','bn','hi','ta','mr','te','kn','ml','gu','pa','or','as','sa','id','es','tr','ms'];
let leaks = 0;
for (const slug of [...NEW_FR, ...NEW_DE]) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    for (const L of FORBIDDEN) if (e.names[L] !== undefined) leaks++;
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
    for (const L of ['ar','en','fr']) if (!isC[L](e.names[L])) { console.log('  ✗ ' + slug + '.names.' + L + ' = "' + e.names[L] + '"'); sf++; }
}
for (const slug of NEW_DE) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    for (const L of ['ar','en','de']) if (!isC[L](e.names[L])) { console.log('  ✗ ' + slug + '.names.' + L + ' = "' + e.names[L] + '"'); sf++; }
}
ok('All 150 (50 × 3) values pass guards', sf === 0);

console.log('\n── Group 6: Prior 50 FR + 81 DE entries byte-identical ──');
let pmFr = 0, pmDe = 0;
for (const o of backup.filter(e => e.countryCode === 'fr')) {
    const n = curated.find(x => x.slug === o.slug);
    if (!n || JSON.stringify(n) !== JSON.stringify(o)) pmFr++;
}
for (const o of backup.filter(e => e.countryCode === 'de')) {
    const n = curated.find(x => x.slug === o.slug);
    if (!n || JSON.stringify(n) !== JSON.stringify(o)) pmDe++;
}
ok('Prior 50 FR entries byte-identical', pmFr === 0);
ok('Prior 81 DE entries byte-identical', pmDe === 0);

console.log('\n── Group 7: IN/ID/MY/PK/BD + other countries byte-identical ──');
for (const cc of ['in','id','my','pk','bd','sa','af','ir','tr','es','kr','jp','gb','us','mx','it','nl','be','ch','at','ca']) {
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
ok('No dup slug across 2860', sl.filter((s,i,a)=>a.indexOf(s)!==i).length===0);
const sc = curated.map(e=>e.sourceId).filter(Boolean);
ok('No dup sourceId', sc.filter((s,i,a)=>a.indexOf(s)!==i).length===0);
const allGids = curated.filter(e => e.sourceId && e.sourceId.startsWith('geonames:'))
    .map(e => e.sourceId.replace('geonames:', ''));
ok('No dup geonameId', allGids.filter((s,i,a) => a.indexOf(s) !== i).length === 0);

console.log('\n── Group 9: Required fields per new entry ──');
for (const slug of NEW_FR) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    ok('fr/' + slug.padEnd(24) + ' has required fields',
       e.slug && e.countryCode === 'fr' && typeof e.lat === 'number' && typeof e.lng === 'number'
       && e.timezone === 'Europe/Paris' && e.names && e.names.ar && e.names.en && e.names.fr
       && e.source === 'geonames' && e.sourceId);
}
for (const slug of NEW_DE) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    ok('de/' + slug.padEnd(20) + ' has required fields',
       e.slug && e.countryCode === 'de' && typeof e.lat === 'number' && typeof e.lng === 'number'
       && e.timezone === 'Europe/Berlin' && e.names && e.names.ar && e.names.en && e.names.de
       && e.source === 'geonames' && e.sourceId);
}

console.log('\n── Group 10: Spot-check FR values ──');
const FR_SPOT = [
    ['boulogne-billancourt', 'ar', 'بولونيا بيانكور'],
    ['boulogne-billancourt', 'fr', 'Boulogne-Billancourt'],
    ['saint-denis-fr',       'ar', 'سان دوني'],
    ['saint-denis-fr',       'fr', 'Saint-Denis'],
    ['creteil',              'fr', 'Créteil'],
    ['creteil',              'en', 'Creteil'],
    ['chambery',             'fr', 'Chambéry'],
    ['chambery',             'en', 'Chambery'],
    ['evreux',               'fr', 'Évreux'],
    ['evreux',               'en', 'Evreux'],
    ['troyes',               'ar', 'تروا'],
    ['annecy',               'ar', 'أنيسي'],
    ['saint-maur-des-fosses','fr', 'Saint-Maur-des-Fossés']
];
for (const [slug, L, expected] of FR_SPOT) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    ok('fr/' + slug + '.names.' + L + ' = "' + expected + '"', e.names[L] === expected,
       e.names[L] === expected ? '' : '(actual: "' + e.names[L] + '")');
}

console.log('\n── Group 11: Spot-check DE values ──');
const DE_SPOT = [
    ['zwickau',         'ar', 'تسفيكاو'],
    ['kaiserslautern',  'ar', 'كايزرسلاوترن'],
    ['guetersloh',      'de', 'Gütersloh'],
    ['guetersloh',      'en', 'Gutersloh'],
    ['tuebingen',       'de', 'Tübingen'],
    ['tuebingen',       'en', 'Tubingen'],
    ['dueren',          'de', 'Düren'],
    ['giessen',         'de', 'Gießen'],
    ['hanau',           'en', 'Hanau'],
    ['hanau',           'de', 'Hanau am Main'],
    ['marburg',         'de', 'Marburg an der Lahn'],
    ['marburg',         'en', 'Marburg'],
    ['konstanz',        'ar', 'كونستانز'],
    ['bamberg',         'ar', 'بامبرغ']
];
for (const [slug, L, expected] of DE_SPOT) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    ok('de/' + slug + '.names.' + L + ' = "' + expected + '"', e.names[L] === expected,
       e.names[L] === expected ? '' : '(actual: "' + e.names[L] + '")');
}

console.log('\n── Group 12: Disambiguation slugs ──');
// saint-denis-fr is the FR commune (gid 2980916), not Réunion
const sdFr = curated.find(e => e.slug === 'saint-denis-fr');
ok('saint-denis-fr exists with cc=fr', sdFr && sdFr.countryCode === 'fr');
ok('saint-denis-fr lat is Paris-area (48.93)', sdFr && Math.abs(sdFr.lat - 48.93564) < 0.001);
// laval-fr is the FR city, not Canada Laval
const lavalFr = curated.find(e => e.slug === 'laval-fr');
const lavalCa = curated.find(e => e.slug === 'laval');
ok('laval-fr exists with cc=fr', lavalFr && lavalFr.countryCode === 'fr');
ok('laval (cc=ca) still exists unchanged', lavalCa && lavalCa.countryCode === 'ca');

console.log('\n══════════════════════════════════════');
console.log(' Results: ' + pass + ' passed, ' + fail + ' failed (' + (pass+fail) + ')');
console.log('══════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
