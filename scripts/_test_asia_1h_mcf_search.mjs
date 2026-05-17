// scripts/_test_asia_1h_mcf_search.mjs
// ASIA-1H-MCF closure smoke test — verifies all 33 merged + kg/manas semantic fix.
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
    // === User-required 16 Arabic queries ===
    ['شيمكنت',              'ar', 'kz', 'Asia/Almaty',       'shymkent'],
    ['أنديجان',             'ar', 'uz', 'Asia/Tashkent',     'andijon'],
    ['نمنغان',              'ar', 'uz', 'Asia/Tashkent',     'namangan'],
    ['أكتوبه',              'ar', 'kz', 'Asia/Aqtobe',       'aktobe'],
    ['كاراغاندا',           'ar', 'kz', 'Asia/Almaty',       'karagandy'],
    ['أوست كامينوغورسك',    'ar', 'kz', 'Asia/Almaty',       'ust-kamenogorsk'],
    ['سيمي',                'ar', 'kz', 'Asia/Almaty',       'semey'],
    ['أتيراو',              'ar', 'kz', 'Asia/Atyrau',       'atyrau'],
    ['كوستاناي',            'ar', 'kz', 'Asia/Qostanay',     'kostanay'],
    ['قارشي',               'ar', 'uz', 'Asia/Samarkand',    'qarshi'],
    ['أنغرين',              'ar', 'uz', 'Asia/Tashkent',     'angren'],
    ['نوائي',               'ar', 'uz', 'Asia/Samarkand',    'navoiy'],
    ['كاراكول',             'ar', 'kg', 'Asia/Bishkek',      'karakol'],
    ['نارين',               'ar', 'kg', 'Asia/Bishkek',      'naryn'],
    ['دارخان',              'ar', 'mn', 'Asia/Ulaanbaatar',  'darhan'],
    ['ماناس',               'ar', 'kg', 'Asia/Bishkek',      'manas'],     // 🚨 critical — must NOT return Jalal-Abad

    // === Additional Arabic samples ===
    ['نوكوس',               'ar', 'uz', 'Asia/Samarkand',    'nukus'],
    ['تركستان',             'ar', 'kz', 'Asia/Almaty',       'turkestan'],   // override
    ['إيكيباستوز',          'ar', 'kz', 'Asia/Almaty',       'ekibastuz'],
    ['تالديكورغان',         'ar', 'kz', 'Asia/Almaty',       'taldykorgan'],
    ['ألمالك',              'ar', 'uz', 'Asia/Tashkent',     'olmaliq'],
    ['غولستان',             'ar', 'uz', 'Asia/Tashkent',     'guliston'],
    ['تالاس',               'ar', 'kg', 'Asia/Bishkek',      'talas'],        // override
    ['كان بادام',           'ar', 'tj', 'Asia/Dushanbe',     'konibodom'],
    ['بايان هنغور',         'ar', 'mn', 'Asia/Ulaanbaatar',  'bayanhongor'],
    ['أرفايهير',            'ar', 'mn', 'Asia/Ulaanbaatar',  'arvayheer'],
    ['دالانزادغاد',         'ar', 'mn', 'Asia/Ulaanbaatar',  'dalandzadgad'],
    ['سوخباتر',             'ar', 'mn', 'Asia/Ulaanbaatar',  'suehbaatar'],
    ['سايانشاند',           'ar', 'mn', 'Asia/Ulaanbaatar',  'saynshand'],
    ['بارون أورت',          'ar', 'mn', 'Asia/Ulaanbaatar',  'baruun-urt'],
    ['بولغان',              'ar', 'mn', 'Asia/Ulaanbaatar',  'bulgan'],
    ['أوليسطاي',            'ar', 'mn', 'Asia/Hovd',         'uliastay'],
    ['ماندالغوفي',          'ar', 'mn', 'Asia/Ulaanbaatar',  'mandalgovi'],

    // === English samples ===
    ['Shymkent',            'en', 'kz', 'Asia/Almaty',       'shymkent'],
    ['Andijon',             'en', 'uz', 'Asia/Tashkent',     'andijon'],
    ['Manas',               'en', 'kg', 'Asia/Bishkek',      'manas'],     // 🚨 critical
    ['Karagandy',           'en', 'kz', 'Asia/Almaty',       'karagandy'],
    ['Atyrau',              'en', 'kz', 'Asia/Atyrau',       'atyrau'],
    ['Darhan',              'en', 'mn', 'Asia/Ulaanbaatar',  'darhan']
];

let pass = 0, fail = 0;
const failures = [];
console.log('═══ ASIA-1H-MCF — ' + tests.length + ' smoke tests on /api/search-place ═══\n');

for (const [q, lang, cc, tz, slug] of tests) {
    const r = await search(q, lang);
    const top = (r.results || [])[0];
    // Allow tz match by region prefix
    const tzOk = top && (top.timezone === tz || top.timezone.startsWith(tz.split('/')[0] + '/'));
    const ok = top && top.countryCode === cc && tzOk && top.slug === slug && top.source === 'curated';
    if (ok) {
        pass++;
        console.log('✓ ' + q.padEnd(22) + ' → slug=' + top.slug.padEnd(16) + ' cc=' + top.countryCode + ' tz=' + top.timezone.padEnd(18) + ' source=curated ar=' + top.displayName);
    } else {
        fail++;
        failures.push({ q, expected: slug });
        const detail = top
            ? 'slug=' + top.slug + ' cc=' + top.countryCode + ' tz=' + top.timezone + ' source=' + top.source
            : 'NO RESULT';
        console.log('✗ ' + q.padEnd(22) + ' → ' + detail + ' (expected ' + slug + ')');
    }
}

console.log('\n' + '═'.repeat(60));
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + tests.length + ')');

// Critical: verify ماناس → kg/manas (NOT Jalal-Abad)
const manasResult = await search('ماناس', 'ar');
const manasTop = (manasResult.results || [])[0];
const manasGood = manasTop && manasTop.slug === 'manas' && manasTop.countryCode === 'kg' && manasTop.displayName === 'ماناس';
console.log('\n🚨 CRITICAL CHECK: ماناس → kg/manas (NOT Jalal-Abad)');
console.log(manasGood ? '  ✓ PASS: ماناس correctly returns kg/manas with ar="ماناس"' : '  ✗ FAIL: ماناس returned ' + (manasTop ? JSON.stringify(manasTop) : 'NO RESULT'));

process.exit(fail === 0 && manasGood ? 0 : 1);
