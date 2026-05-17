// scripts/_test_asia_1c_search.mjs
// ASIA-1C closure smoke test — verifies all 71 merged entries are searchable
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

// User's explicit test list + samples from largest cities
const tests = [
    // === User-explicit test queries ===
    ['نارا',          'ar', 'jp', 'Asia/Tokyo',     'nara-shi'],
    ['توتوري',         'ar', 'jp', 'Asia/Tokyo',     'tottori-shi'],
    ['تشيونغجو',       'ar', 'kr', 'Asia/Seoul',     'cheongju-si'],
    ['دائجو',         'ar', 'kr', 'Asia/Seoul',     'daegu'],
    ['دائجئون',       'ar', 'kr', 'Asia/Seoul',     'daejeon'],
    ['تاي شانغ',      'ar', 'tw', 'Asia/Taipei',    'taichung'],
    ['تاينان',         'ar', 'tw', 'Asia/Taipei',    'tainan'],

    // === User-test-variant aliases (3 shi/si entries) ===
    ['نارا شي',        'ar', 'jp', 'Asia/Tokyo',     'nara-shi'],
    ['توتوري شي',      'ar', 'jp', 'Asia/Tokyo',     'tottori-shi'],
    ['تشيونغجو سي',    'ar', 'kr', 'Asia/Seoul',     'cheongju-si'],

    // === Largest JP cities (en) ===
    ['Kawasaki',     'en', 'jp', 'Asia/Tokyo',     'kawasaki'],
    ['Saitama',      'en', 'jp', 'Asia/Tokyo',     'saitama'],
    ['Chiba',        'en', 'jp', 'Asia/Tokyo',     'chiba'],
    ['Kitakyushu',   'en', 'jp', 'Asia/Tokyo',     'kitakyushu'],
    ['Hamamatsu',    'en', 'jp', 'Asia/Tokyo',     'hamamatsu'],
    ['Sagamihara',   'en', 'jp', 'Asia/Tokyo',     'sagamihara'],
    ['Shizuoka',     'en', 'jp', 'Asia/Tokyo',     'shizuoka'],

    // === Largest KR cities (en) ===
    ['Gwangju',      'en', 'kr', 'Asia/Seoul',     'gwangju'],
    ['Suwon',        'en', 'kr', 'Asia/Seoul',     'suwon'],
    ['Ulsan',        'en', 'kr', 'Asia/Seoul',     'ulsan'],
    ['Changwon',     'en', 'kr', 'Asia/Seoul',     'changwon'],
    ['Cheonan',      'en', 'kr', 'Asia/Seoul',     'cheonan'],
    ['Jeonju',       'en', 'kr', 'Asia/Seoul',     'jeonju'],

    // === TW + HK ===
    ['Hsinchu',      'en', 'tw', 'Asia/Taipei',    'hsinchu'],
    ['Keelung',      'en', 'tw', 'Asia/Taipei',    'keelung'],
    ['Central',      'en', 'hk', 'Asia/Hong_Kong', 'central'],

    // === Arabic queries for largest cities ===
    ['كاواساكي',       'ar', 'jp', 'Asia/Tokyo',     'kawasaki'],
    ['سايتاما',        'ar', 'jp', 'Asia/Tokyo',     'saitama'],
    ['غوانغجو',        'ar', 'kr', 'Asia/Seoul',     'gwangju'],
    ['سوون',          'ar', 'kr', 'Asia/Seoul',     'suwon'],
    ['ألسان',         'ar', 'kr', 'Asia/Seoul',     'ulsan']
];

let pass = 0, fail = 0;
console.log('═══ ASIA-1C — 30 smoke tests on /api/search-place ═══\n');

for (const [q, lang, cc, tz, slug] of tests) {
    const r = await search(q, lang);
    const top = (r.results || [])[0];
    const ok = top && top.countryCode === cc && top.timezone === tz && top.slug === slug && top.source === 'curated';
    if (ok) {
        pass++;
        console.log('✓ ' + q.padEnd(15) + ' → slug=' + top.slug.padEnd(15) + ' cc=' + top.countryCode + ' tz=' + top.timezone.padEnd(18) + ' source=curated ar=' + top.displayName);
    } else {
        fail++;
        const detail = top
            ? 'slug=' + top.slug + ' cc=' + top.countryCode + ' tz=' + top.timezone + ' source=' + top.source
            : 'NO RESULT';
        console.log('✗ ' + q.padEnd(15) + ' → ' + detail + ' (expected ' + slug + '/' + cc + '/' + tz + ')');
    }
}

console.log('\n' + '═'.repeat(50));
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + tests.length + ')');
process.exit(fail === 0 ? 0 : 1);
