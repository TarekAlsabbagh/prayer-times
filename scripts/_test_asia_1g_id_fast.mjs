// ASIA-1G-ID-FAST-SUPPORTED-L10N verification.
import { readFileSync } from 'node:fs';
let pass = 0, fail = 0;
const ok = (l,b,e) => { (b?pass++:fail++); console.log((b?'  ✓ ':'  ✗ ')+l+(e?'   '+e:'')); };
console.log('═══ ASIA-1G-ID verification ═══\n');
const curated = JSON.parse(readFileSync(new URL('../db/places/curated-places.json', import.meta.url), 'utf8'));
const backup = JSON.parse(readFileSync(new URL('../db/places/curated-places.json.preAsia1gIdFast.bak', import.meta.url), 'utf8'));

const NEW_41 = ['depok','tasikmalaya','serang','banjarmasin','cimahi','cilegon','palu','dumai','pekalongan','binjai','pematangsiantar','sorong','probolinggo','singkawang','pasuruan','ternate','madiun','salatiga','gorontalo','lhokseumawe','langsa','palopo','parepare','bima','blitar','mojokerto','payakumbuh','magelang','sibolga','subulussalam','solok','banjarbaru','padang-sidempuan','cilacap','purwokerto','banyuwangi','maumere','ende','sumbawa-besar','nabire','bengkalis'];

console.log('── Group 1: Counts ──');
ok('Total curated == 2860 (post FR-DE-B)', curated.length === 2860);
ok('Backup == 2687', backup.length === 2687);
ok('ID count == 82', curated.filter(e=>e.countryCode==='id').length === 82);
ok('ID backup == 41', backup.filter(e=>e.countryCode==='id').length === 41);

console.log('\n── Group 2: All 41 have exactly {ar,en,id} ──');
for (const slug of NEW_41) {
    const e = curated.find(x => x.slug === slug);
    if (!e) { ok(slug, false); continue; }
    const langs = Object.keys(e.names).sort();
    ok(slug.padEnd(20) + ' = [ar,en,id]', JSON.stringify(langs) === JSON.stringify(['ar','en','id']));
}

console.log('\n── Group 3: No forbidden langs ──');
const FORBIDDEN = ['ur','bn','hi','ta','mr','te','kn','ml','gu','pa','or','as','sa','fr','de','tr','es','ms'];
let leaks = 0;
for (const slug of NEW_41) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    for (const L of FORBIDDEN) if (e.names[L] !== undefined) leaks++;
}
ok('NO forbidden lang in 41 new entries', leaks === 0);

console.log('\n── Group 4: Script guards (123 values) ──');
const URDU_ONLY = /[یکگپچژٹڈڑںھہےۂ]/;
const isC = {
    ar: s => /[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s) && !/[A-Za-z]/.test(s) && !URDU_ONLY.test(s),
    en: s => /[A-Za-z]/.test(s) && !/[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s),
    id: s => /[A-Za-z]/.test(s) && !/[؀-ۿ]/.test(s) && !/[ঀ-৿]/.test(s)
};
let sf = 0;
for (const slug of NEW_41) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    for (const L of ['ar','en','id']) if (!isC[L](e.names[L])) { console.log('  ✗ '+slug+'.names.'+L+' = "'+e.names[L]+'"'); sf++; }
}
ok('All 123 (41 × 3) values pass guards', sf === 0);

console.log('\n── Group 5: Prior 41 ID entries byte-identical ──');
let pm = 0;
for (const o of backup.filter(e => e.countryCode === 'id')) {
    const n = curated.find(x => x.slug === o.slug);
    if (!n || JSON.stringify(n) !== JSON.stringify(o)) pm++;
}
ok('Prior 41 ID entries byte-identical', pm === 0);

console.log('\n── Group 6: IN/PK/BD/non-ID byte-identical ──');
for (const cc of ['in','pk','bd','sa','af','ir','tr','my','de','fr','es']) {
    const oL = backup.filter(e => e.countryCode === cc);
    let mut = 0;
    for (const o of oL) {
        const n = curated.find(x => x.slug === o.slug);
        if (!n || JSON.stringify(n) !== JSON.stringify(o)) mut++;
    }
    ok(cc.toUpperCase().padEnd(3) + ' (' + oL.length + ') byte-identical', mut === 0);
}

console.log('\n── Group 7: No duplicates ──');
const sl = curated.map(e=>e.slug);
ok('No dup slug', sl.filter((s,i,a)=>a.indexOf(s)!==i).length===0);
const sc = curated.map(e=>e.sourceId).filter(Boolean);
ok('No dup sourceId', sc.filter((s,i,a)=>a.indexOf(s)!==i).length===0);

console.log('\n── Group 8: Kota X distribution ──');
const kotaX = NEW_41.filter(slug => {
    const e = curated.find(x => x.slug === slug);
    return e && e.names.id && e.names.id.startsWith('Kota ');
});
ok('33 cities have Kota X form', kotaX.length === 33, '(actual: ' + kotaX.length + ')');
const plain = NEW_41.filter(slug => {
    const e = curated.find(x => x.slug === slug);
    return e && e.names.id && !e.names.id.startsWith('Kota ');
});
ok('8 cities have plain form (Kabupaten capitals)', plain.length === 8, '(actual: ' + plain.length + ')');

console.log('\n── Group 9: Spot-check values ──');
const SPOT = [
    ['depok', 'id', 'Kota Depok'],
    ['tasikmalaya', 'id', 'Kota Tasikmalaya'],
    ['banjarmasin', 'id', 'Kota Banjarmasin'],
    ['palu', 'id', 'Kota Palu'],
    ['gorontalo', 'id', 'Kota Gorontalo'],
    ['ternate', 'id', 'Kota Ternate'],
    ['sorong', 'id', 'Kota Sorong'],
    ['nabire', 'id', 'Nabire'],          // plain
    ['banyuwangi', 'id', 'Banyuwangi'],  // plain
    ['bengkalis', 'id', 'Bengkalis']     // plain
];
for (const [slug, L, expected] of SPOT) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    ok(slug + '.names.' + L + ' = "' + expected + '"', e.names[L] === expected,
       e.names[L] === expected ? '' : '(actual: "' + e.names[L] + '")');
}

console.log('\n══════════════════════════════════════');
console.log(' Results: ' + pass + ' passed, ' + fail + ' failed (' + (pass+fail) + ')');
console.log('══════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
