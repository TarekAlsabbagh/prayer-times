// scripts/_test_asia_1i_mcf_search.mjs
// ASIA-1I-MCF closure smoke test — verifies all 23 merged major-blocked
// Caucasus entries are searchable with correct cc/tz.
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
    // === User-required 10 Arabic queries ===
    ['سومقاييت',           'ar', 'az', 'Asia/Baku',         'sumqayit'],
    ['باتومي',             'ar', 'ge', 'Asia/Tbilisi',      'batumi'],
    ['مينغاشيفير',         'ar', 'az', 'Asia/Baku',         'mingachevir'],
    ['فانادزور',           'ar', 'am', 'Asia/Yerevan',      'vanadzor'],
    ['غوري',               'ar', 'ge', 'Asia/Tbilisi',      'gori'],
    ['أغجابيدي',           'ar', 'az', 'Asia/Baku',         'agdzhabedy'],
    ['غويتشاي',            'ar', 'az', 'Asia/Baku',         'goeycay'],
    ['فضولي',              'ar', 'az', 'Asia/Baku',         'fizuli'],
    ['صابر آباد',          'ar', 'az', 'Asia/Baku',         'sabirabad'],
    ['لاتشين',             'ar', 'az', 'Asia/Baku',         'lacin'],

    // === Additional Arabic samples (13 more) ===
    ['باردا',              'ar', 'az', 'Asia/Baku',         'barda'],
    ['أرمافير',            'ar', 'am', 'Asia/Yerevan',      'armavir'],
    ['أغداش',              'ar', 'az', 'Asia/Baku',         'agdas'],
    ['تارتار',             'ar', 'az', 'Asia/Baku',         'terter'],
    ['بوشكينو',            'ar', 'az', 'Asia/Baku',         'pushkino'],
    ['آخالتسيخه',          'ar', 'ge', 'Asia/Tbilisi',      'akhaltsikhe'],
    ['آستارا',             'ar', 'az', 'Asia/Baku',         'astara'],
    ['بيلوكاني',           'ar', 'az', 'Asia/Baku',         'belokany'],
    ['أوزورغيتي',          'ar', 'ge', 'Asia/Tbilisi',      'ozurgeti'],
    ['قابالا',             'ar', 'az', 'Asia/Baku',         'qabala'],
    ['غورانبوي',           'ar', 'az', 'Asia/Baku',         'goranboy'],
    ['يغيغنادزور',         'ar', 'am', 'Asia/Yerevan',      'yeghegnadzor'],
    ['آمبرولاوري',         'ar', 'ge', 'Asia/Tbilisi',      'ambrolauri'],

    // === English samples ===
    ['Sumqayıt',           'en', 'az', 'Asia/Baku',         'sumqayit'],
    ['Batumi',             'en', 'ge', 'Asia/Tbilisi',      'batumi'],
    ['Mingachevir',        'en', 'az', 'Asia/Baku',         'mingachevir'],
    ['Vanadzor',           'en', 'am', 'Asia/Yerevan',      'vanadzor'],
    ['Gori',               'en', 'ge', 'Asia/Tbilisi',      'gori'],
    ['Fizuli',             'en', 'az', 'Asia/Baku',         'fizuli'],
    ['Lacin',              'en', 'az', 'Asia/Baku',         'lacin'],
    ['Akhaltsikhe',        'en', 'ge', 'Asia/Tbilisi',      'akhaltsikhe'],
    ['Ozurgeti',           'en', 'ge', 'Asia/Tbilisi',      'ozurgeti'],
    ['Yeghegnadzor',       'en', 'am', 'Asia/Yerevan',      'yeghegnadzor']
];

let pass = 0, fail = 0;
console.log('═══ ASIA-1I-MCF — ' + tests.length + ' smoke tests on /api/search-place ═══');
console.log('(10 user-required Arabic + 13 additional Arabic + 10 English samples)\n');

for (const [q, lang, cc, tz, slug] of tests) {
    const r = await search(q, lang);
    const top = (r.results || [])[0];
    const ok = top && top.countryCode === cc && top.timezone === tz && top.slug === slug && top.source === 'curated';
    if (ok) {
        pass++;
        console.log('✓ ' + q.padEnd(22) + ' → slug=' + top.slug.padEnd(15) + ' cc=' + top.countryCode + ' tz=' + top.timezone.padEnd(15) + ' source=curated ar=' + top.displayName);
    } else {
        fail++;
        const detail = top
            ? 'slug=' + top.slug + ' cc=' + top.countryCode + ' tz=' + top.timezone + ' source=' + top.source
            : 'NO RESULT';
        console.log('✗ ' + q.padEnd(22) + ' → ' + detail + ' (expected ' + slug + ')');
    }
}

console.log('\n' + '═'.repeat(60));
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + tests.length + ')');
process.exit(fail === 0 ? 0 : 1);
