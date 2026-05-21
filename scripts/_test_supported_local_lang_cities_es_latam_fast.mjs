// SUPPORTED-LOCAL-LANG-CITIES-ES-LATAM-FAST verification.
import { readFileSync } from 'node:fs';
let pass = 0, fail = 0;
const ok = (l, b, e) => { (b ? pass++ : fail++); console.log((b ? '  ✓ ' : '  ✗ ') + l + (e ? '   ' + e : '')); };
console.log('═══ SUPPORTED-LOCAL-LANG-CITIES-ES-LATAM-FAST verification ═══\n');

const curated = JSON.parse(readFileSync(new URL('../db/places/curated-places.json', import.meta.url), 'utf8'));
const backup = JSON.parse(readFileSync(new URL('../db/places/curated-places.json.preSupportedEsLatamFast.bak', import.meta.url), 'utf8'));

const NEW_ES = ['palma','las-palmas-de-gran-canaria','alicante','vigo','hospitalet-de-llobregat','vitoria-gasteiz','a-coruna','terrassa','jerez-de-la-frontera','sabadell','tarragona','lleida'];
const NEW_MX = ['leon-mx','chihuahua','san-luis-potosi','aguascalientes','saltillo','toluca','mexicali','tampico'];
const NEW_AR = ['cordoba-ar','rosario','mar-del-plata','san-miguel-de-tucuman','santa-fe','corrientes','bahia-blanca','resistencia','neuquen','la-plata','mendoza','san-juan'];
const NEW_CO = ['cali','medellin','barranquilla','cartagena-co','cucuta','bucaramanga','ibague','santa-marta','pereira','manizales'];
const NEW_PE = ['trujillo','huancayo','pucallpa','tacna','cajamarca'];
const NEW_CL = ['antofagasta','valparaiso','temuco','concepcion','rancagua','la-serena'];
const NEW_VE = ['maracaibo','valencia-ve','ciudad-guayana','maracay'];

const ALL_NEW = [...NEW_ES, ...NEW_MX, ...NEW_AR, ...NEW_CO, ...NEW_PE, ...NEW_CL, ...NEW_VE];

console.log('── Group 1: Counts ──');
ok('Total curated == 2947 (post TR)', curated.length === 2947, '(actual: ' + curated.length + ')');
ok('Backup == 2860', backup.length === 2860);
ok('ES == 57 (was 45, +12)', curated.filter(e=>e.countryCode==='es').length === 57);
ok('MX == 39 (was 31, +8)',  curated.filter(e=>e.countryCode==='mx').length === 39);
ok('AR == 22 (was 10, +12)', curated.filter(e=>e.countryCode==='ar').length === 22);
ok('CO == 19 (was 9, +10)',  curated.filter(e=>e.countryCode==='co').length === 19);
ok('PE == 18 (was 13, +5)',  curated.filter(e=>e.countryCode==='pe').length === 18);
ok('CL == 12 (was 6, +6)',   curated.filter(e=>e.countryCode==='cl').length === 12);
ok('VE == 13 (was 9, +4)',   curated.filter(e=>e.countryCode==='ve').length === 13);

console.log('\n── Group 2: All 57 new entries have exactly {ar,en,es} ──');
let langKeyFails = 0;
for (const slug of ALL_NEW) {
    const e = curated.find(x => x.slug === slug);
    if (!e) { ok(slug + ' exists', false); continue; }
    const langs = Object.keys(e.names).sort();
    const ok_ = JSON.stringify(langs) === JSON.stringify(['ar','en','es']);
    if (!ok_) { console.log('  ✗ ' + slug.padEnd(28) + ' actual: ' + JSON.stringify(langs)); langKeyFails++; }
}
ok('All 57 have [ar,en,es] only', langKeyFails === 0, langKeyFails > 0 ? '(' + langKeyFails + ' fails)' : '');

console.log('\n── Group 3: No forbidden langs in 57 new entries ──');
const FORBIDDEN = ['ur','bn','hi','ta','mr','te','kn','ml','gu','pa','or','as','sa','id','fr','de','tr','ms'];
let leaks = 0;
for (const slug of ALL_NEW) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    for (const L of FORBIDDEN) if (e.names[L] !== undefined) { console.log('  ✗ ' + slug + '.names.' + L + ' present'); leaks++; }
}
ok('NO forbidden lang in 57 new entries', leaks === 0);

console.log('\n── Group 4: Script guards (171 values) ──');
const URDU_ONLY = /[یکگپچژٹڈڑںھہےۂ]/;
const isC = {
    ar: s => /[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s) && !/[A-Za-z]/.test(s) && !URDU_ONLY.test(s),
    en: s => /[A-Za-z]/.test(s) && !/[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s),
    es: s => /[A-Za-z]/.test(s) && !/[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s)
};
let sf = 0;
for (const slug of ALL_NEW) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    for (const L of ['ar','en','es']) if (!isC[L](e.names[L])) { console.log('  ✗ ' + slug + '.names.' + L + ' = "' + e.names[L] + '"'); sf++; }
}
ok('All 171 (57 × 3) values pass guards', sf === 0);

console.log('\n── Group 5: Prior 7 country entries byte-identical ──');
for (const cc of ['es','mx','ar','co','pe','cl','ve']) {
    let mut = 0;
    for (const o of backup.filter(e => e.countryCode === cc)) {
        const n = curated.find(x => x.slug === o.slug);
        if (!n || JSON.stringify(n) !== JSON.stringify(o)) mut++;
    }
    ok('Prior ' + cc.toUpperCase() + ' entries byte-identical (' + backup.filter(e=>e.countryCode===cc).length + ')', mut === 0);
}

console.log('\n── Group 6: IN/ID/MY/PK/BD/FR/DE + other countries byte-identical ──');
for (const cc of ['in','id','my','pk','bd','fr','de','sa','af','ir','tr','kr','jp','gb','us','it','nl','be','ch','at','ca']) {
    const oL = backup.filter(e => e.countryCode === cc);
    let mut = 0;
    for (const o of oL) {
        const n = curated.find(x => x.slug === o.slug);
        if (!n || JSON.stringify(n) !== JSON.stringify(o)) mut++;
    }
    ok(cc.toUpperCase().padEnd(3) + ' (' + oL.length + ') byte-identical', mut === 0, mut > 0 ? '(' + mut + ' mutated)' : '');
}

console.log('\n── Group 7: No duplicates ──');
const sl = curated.map(e=>e.slug);
ok('No dup slug across 2917', sl.filter((s,i,a)=>a.indexOf(s)!==i).length===0);
const sc = curated.map(e=>e.sourceId).filter(Boolean);
ok('No dup sourceId', sc.filter((s,i,a)=>a.indexOf(s)!==i).length===0);
const allGids = curated.filter(e => e.sourceId && e.sourceId.startsWith('geonames:'))
    .map(e => e.sourceId.replace('geonames:', ''));
ok('No dup geonameId', allGids.filter((s,i,a) => a.indexOf(s) !== i).length === 0);

console.log('\n── Group 8: Required fields per new entry (sample 1 per country) ──');
for (const cc of ['es','mx','ar','co','pe','cl','ve']) {
    const list = [NEW_ES, NEW_MX, NEW_AR, NEW_CO, NEW_PE, NEW_CL, NEW_VE]['esmxarcopeclve'.indexOf(cc)/2];
    for (const slug of list) {
        const e = curated.find(x => x.slug === slug);
        if (!e) { ok(cc + '/' + slug, false); continue; }
        ok(cc + '/' + slug.padEnd(28) + ' has required fields',
           e.slug && e.countryCode === cc && typeof e.lat === 'number' && typeof e.lng === 'number'
           && e.timezone && e.names && e.names.ar && e.names.en && e.names.es
           && e.source === 'geonames' && e.sourceId);
    }
}

console.log('\n── Group 9: Spot-check values ──');
const SPOT = [
    ['palma',                  'es', 'Palma'],
    ['las-palmas-de-gran-canaria','ar','لاس بالماس دي غران كاناريا'],
    ['hospitalet-de-llobregat','es', "L'Hospitalet de Llobregat"],
    ['hospitalet-de-llobregat','en', 'Hospitalet de Llobregat'],
    ['a-coruna',               'es', 'A Coruña'],
    ['a-coruna',               'en', 'A Coruna'],
    ['vitoria-gasteiz',        'es', 'Vitoria-Gasteiz'],
    ['leon-mx',                'cc', 'mx'],
    ['leon-mx',                'es', 'León'],
    ['chihuahua',              'ar', 'تشيواوا'],
    ['queretaro',              'EXISTS_NOT_NEW', null],  // already curated as santiago-de-queretaro
    ['cordoba-ar',             'cc', 'ar'],
    ['cordoba-ar',             'es', 'Córdoba'],
    ['cordoba-ar',             'ar', 'كوردوبا'],
    ['cartagena-co',           'cc', 'co'],
    ['cartagena-co',           'es', 'Cartagena'],
    ['cartagena-co',           'ar', 'كارتاخينا'],
    ['valencia-ve',            'cc', 've'],
    ['valencia-ve',            'es', 'Valencia'],
    ['medellin',               'es', 'Medellín'],
    ['trujillo',               'ar', 'تروخيو'],
    ['valparaiso',             'es', 'Valparaíso'],
    ['maracaibo',              'ar', 'ماراكايبو']
];
for (const [slug, L, expected] of SPOT) {
    if (L === 'EXISTS_NOT_NEW') {
        // Just verify the slug `queretaro` is NOT in curated (it's santiago-de-queretaro)
        ok(slug + ' is NOT a new entry (gid skipped)', !curated.find(e => e.slug === slug));
        continue;
    }
    const e = curated.find(x => x.slug === slug);
    if (!e) { ok(slug + ' exists', false); continue; }
    if (L === 'cc') {
        ok(slug + ' has cc=' + expected, e.countryCode === expected);
    } else {
        ok(slug + '.names.' + L + ' = "' + expected + '"', e.names[L] === expected,
           e.names[L] === expected ? '' : '(actual: "' + e.names[L] + '")');
    }
}

console.log('\n── Group 10: Disambiguation slugs ──');
const cordobaEs = curated.find(e => e.slug === 'cordoba');
const cordobaMx = curated.find(e => e.slug === 'cordoba-mx');
const cordobaAr = curated.find(e => e.slug === 'cordoba-ar');
ok('cordoba (ES) still exists', cordobaEs && cordobaEs.countryCode === 'es');
ok('cordoba-mx (MX) still exists', cordobaMx && cordobaMx.countryCode === 'mx');
ok('cordoba-ar (AR) is new', cordobaAr && cordobaAr.countryCode === 'ar' && cordobaAr.lat < 0);
const cartagenaEs = curated.find(e => e.slug === 'cartagena');
const cartagenaCo = curated.find(e => e.slug === 'cartagena-co');
ok('cartagena (ES) still exists', cartagenaEs && cartagenaEs.countryCode === 'es');
ok('cartagena-co (CO) is new', cartagenaCo && cartagenaCo.countryCode === 'co');
const valenciaEs = curated.find(e => e.slug === 'valencia');
const valenciaVe = curated.find(e => e.slug === 'valencia-ve');
ok('valencia (ES) still exists', valenciaEs && valenciaEs.countryCode === 'es');
ok('valencia-ve (VE) is new', valenciaVe && valenciaVe.countryCode === 've');
const leonEs = curated.find(e => e.slug === 'leon');
const leonMx = curated.find(e => e.slug === 'leon-mx');
ok('leon (ES) still exists', leonEs && leonEs.countryCode === 'es');
ok('leon-mx (MX) is new', leonMx && leonMx.countryCode === 'mx');

console.log('\n══════════════════════════════════════');
console.log(' Results: ' + pass + ' passed, ' + fail + ' failed (' + (pass+fail) + ')');
console.log('══════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
