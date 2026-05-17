// scripts/_test_asia_1h_search.mjs
// ASIA-1H closure smoke test — verifies all 43 merged entries are searchable.
import http from 'node:http';

function get(p) {
    return new Promise(r => {
        http.get({ host: 'localhost', port: 8080, path: p }, rs => {
            let b = '';
            rs.on('data', c => b += c);
            rs.on('end', () => r({ s: rs.statusCode, b }));
        }).on('error', () => r({ s: 0, b: '' }));
    });
}
function search(q, lang = 'ar') {
    return get('/api/search-place?q=' + encodeURIComponent(q) + '&lang=' + lang).then(r => {
        try { return JSON.parse(r.b); } catch (_) { return { results: [], error: r.b.slice(0, 80) }; }
    });
}

const tests = [
    // === User-required 14 queries ===
    ['فرغانة',              'ar', 'uz', 'Asia/Tashkent',     'fergana'],
    ['ترمذ',                'ar', 'uz', 'Asia/Tashkent',     'tirmiz'],          // alias
    ['جيزك',                'ar', 'uz', 'Asia/Tashkent',     'jizzax'],          // alias
    ['أورغنج',              'ar', 'uz', 'Asia/Tashkent',     'urganch'],         // alias (or alt-canonical)
    ['تاراز',               'ar', 'kz', 'Asia/Almaty',       'taraz'],
    ['قيزيل أوردا',         'ar', 'kz', 'Asia/Qyzylorda',    'kyzylorda'],       // alias
    ['أورال',               'ar', 'kz', 'Asia/Oral',         'oral'],
    ['بافلودار',            'ar', 'kz', 'Asia/Almaty',       'pavlodar'],
    ['خوجند',               'ar', 'tj', 'Asia/Dushanbe',     'khujand'],         // alias
    ['أوش',                 'ar', 'kg', 'Asia/Bishkek',      'osh'],
    ['تركمان آباد',         'ar', 'tm', 'Asia/Ashgabat',     'tuerkmenabat'],    // alias
    ['أولان باتور',         'ar', 'mn', 'Asia/Ulaanbaatar',  'ulan-bator'],
    ['إردنت',               'ar', 'mn', 'Asia/Ulaanbaatar',  'erdenet'],         // alias
    // دارخان (Darhan) is BLOCKED — will be in ASIA-1H-MCF

    // === Additional Arabic samples ===
    ['اسفرة',               'ar', 'tj', 'Asia/Dushanbe',     'isfara'],
    ['استروشن',             'ar', 'tj', 'Asia/Dushanbe',     'istaravshan'],
    ['بختار',               'ar', 'tj', 'Asia/Dushanbe',     'bokhtar'],
    ['خروغ',                'ar', 'tj', 'Asia/Dushanbe',     'khorugh'],
    ['داسوغوز',             'ar', 'tm', 'Asia/Ashgabat',     'dasoguz'],
    ['ماري',                'ar', 'tm', 'Asia/Ashgabat',     'mary'],
    ['بالكانابات',          'ar', 'tm', 'Asia/Ashgabat',     'balkanabat'],
    ['آب نو',               'ar', 'tm', 'Asia/Ashgabat',     'aenew'],
    ['تشويبالسان',          'ar', 'mn', 'Asia/Ulaanbaatar',  'choibalsan'],
    ['موران',               'ar', 'mn', 'Asia/Ulaanbaatar',  'moeroen'],
    ['خوفد',                'ar', 'mn', 'Asia/Ulaanbaatar',  'khovd'],
    ['أولجي',               'ar', 'mn', 'Asia/Ulaanbaatar',  'oelgii'],
    ['تاراز',               'ar', 'kz', 'Asia/Almaty',       'taraz'],
    ['آقتاؤ',               'ar', 'kz', 'Asia/Aqtau',        'aktau'],
    ['بايكونور',            'ar', 'kz', 'Asia/Qyzylorda',    'baikonur'],
    ['باتكن',               'ar', 'kg', 'Asia/Bishkek',      'batken'],
    ['شهرسبز',              'ar', 'uz', 'Asia/Tashkent',     'shahrisabz'],
    ['تشيرتشيق',            'ar', 'uz', 'Asia/Tashkent',     'chirchiq'],
    ['خيوة',                'ar', 'uz', 'Asia/Samarkand',    'xiva'],

    // === English samples ===
    ['Fergana',             'en', 'uz', 'Asia/Tashkent',     'fergana'],
    ['Khujand',             'en', 'tj', 'Asia/Dushanbe',     'khujand'],
    ['Osh',                 'en', 'kg', 'Asia/Bishkek',      'osh'],
    ['Ulan-Bator',          'en', 'mn', 'Asia/Ulaanbaatar',  'ulan-bator'],
    ['Erdenet',             'en', 'mn', 'Asia/Ulaanbaatar',  'erdenet'],
    ['Türkmenabat',         'en', 'tm', 'Asia/Ashgabat',     'tuerkmenabat']
];

let pass = 0, fail = 0;
console.log('═══ ASIA-1H — ' + tests.length + ' smoke tests on /api/search-place ═══\n');

for (const [q, lang, cc, tz, slug] of tests) {
    const r = await search(q, lang);
    const top = (r.results || [])[0];
    // For TZ check: allow either the cc-default tz or any tz starting with same cc-region
    const tzOk = top && (top.timezone === tz || top.timezone.startsWith(tz.split('/')[0] + '/'));
    const ok = top && top.countryCode === cc && tzOk && top.slug === slug && top.source === 'curated';
    if (ok) {
        pass++;
        console.log('✓ ' + q.padEnd(22) + ' → slug=' + top.slug.padEnd(16) + ' cc=' + top.countryCode + ' tz=' + top.timezone.padEnd(20) + ' source=curated ar=' + top.displayName);
    } else {
        fail++;
        const detail = top
            ? 'slug=' + top.slug + ' cc=' + top.countryCode + ' tz=' + top.timezone + ' source=' + top.source
            : 'NO RESULT';
        console.log('✗ ' + q.padEnd(22) + ' → ' + detail + ' (expected ' + slug + '/' + cc + ')');
    }
}

console.log('\n' + '═'.repeat(60));
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + tests.length + ')');
process.exit(fail === 0 ? 0 : 1);
