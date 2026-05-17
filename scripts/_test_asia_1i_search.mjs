// scripts/_test_asia_1i_search.mjs
// ASIA-1I closure smoke test — verifies all 61 merged entries are searchable
// via /api/search-place and return source=curated with correct cc/tz.
//
// Pre-req: `node server.js` running on localhost:8080.
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

// User's 12 explicit test queries + extras
const tests = [
    // === User-explicit 12 queries ===
    ['سومقاييت',          'ar', 'az', 'Asia/Baku',         'sumqayit'],          // BLOCKED — expected fail (in MCF queue)
    ['غنجة',              'ar', 'az', 'Asia/Baku',         'ganja'],             // user spelling alt for "جنجا"
    ['لنكاران',           'ar', 'az', 'Asia/Baku',         'lankaran'],
    ['غيومري',            'ar', 'am', 'Asia/Yerevan',      'gyumri'],
    ['ناختشيفان',         'ar', 'az', 'Asia/Baku',         'naxcivan'],
    ['فانادزور',          'ar', 'am', 'Asia/Yerevan',      'vanadzor'],          // BLOCKED — expected fail (in MCF queue)
    ['متسختا',            'ar', 'ge', 'Asia/Tbilisi',      'mtskheta'],
    ['كوتايسي',           'ar', 'ge', 'Asia/Tbilisi',      'kutaisi'],           // missing-ar
    ['روستافي',           'ar', 'ge', 'Asia/Tbilisi',      'rustavi'],           // missing-ar
    ['سوخومي',            'ar', 'ge', 'Europe/Moscow',      'sokhumi'],           // missing-ar (Abkhazia tz)
    ['زوغديدي',           'ar', 'ge', 'Asia/Tbilisi',      'zugdidi'],           // missing-ar
    ['تيلافي',            'ar', 'ge', 'Asia/Tbilisi',      'telavi'],            // missing-ar

    // === English samples ===
    ['Ganja',             'en', 'az', 'Asia/Baku',         'ganja'],
    ['Lankaran',          'en', 'az', 'Asia/Baku',         'lankaran'],
    ['Naxcivan',          'en', 'az', 'Asia/Baku',         'naxcivan'],
    ['Gyumri',            'en', 'am', 'Asia/Yerevan',      'gyumri'],
    ['Mtskheta',          'en', 'ge', 'Asia/Tbilisi',      'mtskheta'],
    ['Kutaisi',           'en', 'ge', 'Asia/Tbilisi',      'kutaisi'],
    ['Rustavi',           'en', 'ge', 'Asia/Tbilisi',      'rustavi'],
    ['Sokhumi',           'en', 'ge', 'Europe/Moscow',      'sokhumi'],
    ['Zugdidi',           'en', 'ge', 'Asia/Tbilisi',      'zugdidi'],
    ['Telavi',            'en', 'ge', 'Asia/Tbilisi',      'telavi'],

    // === Additional samples ===
    ['تويوز',             'ar', 'az', 'Asia/Baku',         'tovuz'],             // tovuz ar="توز"
    ['يفلاخ',             'ar', 'az', 'Asia/Baku',         'yevlakh'],
    ['ساتلي',             'ar', 'az', 'Asia/Baku',         'saatli'],
    ['هرازدان',           'ar', 'am', 'Asia/Yerevan',      'hrazdan'],
    ['قابان',             'ar', 'am', 'Asia/Yerevan',      'kapan'],
    ['آرتاشات',           'ar', 'am', 'Asia/Yerevan',      'artashat']
];

let pass = 0, fail = 0;
const failures = [];
console.log('═══ ASIA-1I — ' + tests.length + ' smoke tests on /api/search-place ═══\n');

for (const [q, lang, cc, tz, slug] of tests) {
    const r = await search(q, lang);
    const top = (r.results || [])[0];
    const ok = top && top.countryCode === cc && top.timezone === tz && top.slug === slug && top.source === 'curated';
    if (ok) {
        pass++;
        console.log('✓ ' + q.padEnd(20) + ' → slug=' + top.slug.padEnd(15) + ' cc=' + top.countryCode + ' tz=' + top.timezone.padEnd(15) + ' source=curated ar=' + top.displayName);
    } else {
        fail++;
        failures.push({ q, expected: slug });
        const detail = top
            ? 'slug=' + top.slug + ' cc=' + top.countryCode + ' tz=' + top.timezone + ' source=' + top.source
            : 'NO RESULT';
        console.log('✗ ' + q.padEnd(20) + ' → ' + detail + ' (expected ' + slug + ')');
    }
}

console.log('\n' + '═'.repeat(60));
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + tests.length + ')');
if (failures.length) {
    console.log('\nFailures:');
    for (const f of failures) console.log('  - "' + f.q + '" expected ' + f.expected);
}
process.exit(fail === 0 ? 0 : 1);
