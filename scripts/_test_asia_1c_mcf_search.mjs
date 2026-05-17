// scripts/_test_asia_1c_mcf_search.mjs
// ASIA-1C-MCF closure smoke test — verifies all 26 merged major-blocked
// entries are searchable via /api/search-place with correct curated mapping.
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

// User's explicit 15 queries (Arabic) — must ALL return curated
const userTests = [
    ['كاوهسيونغ',          'ar', 'tw', 'Asia/Taipei',    'kaohsiung'],
    ['ماكاو',              'ar', 'mo', 'Asia/Macau',     'macau'],
    ['هيغاشي أوساكا',      'ar', 'jp', 'Asia/Tokyo',     'higashiosaka'],
    ['جيجو',               'ar', 'kr', 'Asia/Seoul',     'jeju-city'],
    ['كوراشيكي',           'ar', 'jp', 'Asia/Tokyo',     'kurashiki'],
    ['فوكوياما',           'ar', 'jp', 'Asia/Tokyo',     'fukuyama'],
    ['هيراكاتا',           'ar', 'jp', 'Asia/Tokyo',     'hirakata'],
    ['سيجونغ',             'ar', 'kr', 'Asia/Seoul',     'sejong'],
    ['سويتا',              'ar', 'jp', 'Asia/Tokyo',     'suita'],
    ['تويوهاشي',           'ar', 'jp', 'Asia/Tokyo',     'toyohashi'],
    ['فوجي',               'ar', 'jp', 'Asia/Tokyo',     'fuji'],
    ['أندونغ',             'ar', 'kr', 'Asia/Seoul',     'andong'],
    ['يانغسان',            'ar', 'kr', 'Asia/Seoul',     'yangsan'],
    ['ماتسوي',             'ar', 'jp', 'Asia/Tokyo',     'matsue'],
    ['تشونغشينغ',          'ar', 'tw', 'Asia/Taipei',    'zhongxing-new-village']
];

// Plus additional samples covering remaining 11
const extraTests = [
    // English names
    ['Kaohsiung',          'en', 'tw', 'Asia/Taipei',    'kaohsiung'],
    ['Macau',              'en', 'mo', 'Asia/Macau',     'macau'],
    ['Higashiosaka',       'en', 'jp', 'Asia/Tokyo',     'higashiosaka'],
    ['Sejong',             'en', 'kr', 'Asia/Seoul',     'sejong'],
    ['Akita',              'en', 'jp', 'Asia/Tokyo',     'akita'],
    ['Asahikawa',          'en', 'jp', 'Asia/Tokyo',     'asahikawa'],
    ['Iksan',              'en', 'kr', 'Asia/Seoul',     'iksan'],
    ['Akashi',             'en', 'jp', 'Asia/Tokyo',     'akashi'],
    ['Tin Shui Wai',       'en', 'hk', 'Asia/Hong_Kong', 'tin-shui-wai'],
    ['Yeosu',              'en', 'kr', 'Asia/Seoul',     'yeosu'],
    ['Sasebo',             'en', 'jp', 'Asia/Tokyo',     'sasebo'],
    ['Atsugi',             'en', 'jp', 'Asia/Tokyo',     'atsugi'],
    ['Hongseong',          'en', 'kr', 'Asia/Seoul',     'hongseong'],
    ['Jincheng',           'en', 'tw', 'Asia/Taipei',    'jincheng'],
    ['Iwaki',              'en', 'jp', 'Asia/Tokyo',     'iwaki'],

    // Test the extra alias for zhongxing
    ['قرية تشونغشينغ الجديدة', 'ar', 'tw', 'Asia/Taipei', 'zhongxing-new-village'],

    // Test additional Arabic forms
    ['أكيتا',              'ar', 'jp', 'Asia/Tokyo',     'akita'],
    ['أساهيكاوا',          'ar', 'jp', 'Asia/Tokyo',     'asahikawa'],
    ['إكسان',              'ar', 'kr', 'Asia/Seoul',     'iksan'],
    ['أكاشي',              'ar', 'jp', 'Asia/Tokyo',     'akashi'],
    ['تين شوي واي',        'ar', 'hk', 'Asia/Hong_Kong', 'tin-shui-wai'],
    ['يوسو',               'ar', 'kr', 'Asia/Seoul',     'yeosu'],
    ['ساسيبو',             'ar', 'jp', 'Asia/Tokyo',     'sasebo'],
    ['أتسوغي',             'ar', 'jp', 'Asia/Tokyo',     'atsugi'],
    ['هونغسيونغ',          'ar', 'kr', 'Asia/Seoul',     'hongseong'],
    ['جينتشينغ',           'ar', 'tw', 'Asia/Taipei',    'jincheng'],
    ['إيواكي',             'ar', 'jp', 'Asia/Tokyo',     'iwaki']
];

const tests = [...userTests, ...extraTests];
let pass = 0, fail = 0;
console.log('═══ ASIA-1C-MCF — ' + tests.length + ' smoke tests on /api/search-place ═══');
console.log('(' + userTests.length + ' user-required + ' + extraTests.length + ' extras)\n');

for (const [q, lang, cc, tz, slug] of tests) {
    const r = await search(q, lang);
    const top = (r.results || [])[0];
    const ok = top && top.countryCode === cc && top.timezone === tz && top.slug === slug && top.source === 'curated';
    if (ok) {
        pass++;
        console.log('✓ ' + q.padEnd(28) + ' → slug=' + top.slug.padEnd(24) + ' cc=' + top.countryCode + ' tz=' + top.timezone.padEnd(18) + ' source=curated ar=' + top.displayName);
    } else {
        fail++;
        const detail = top
            ? 'slug=' + top.slug + ' cc=' + top.countryCode + ' tz=' + top.timezone + ' source=' + top.source
            : 'NO RESULT';
        console.log('✗ ' + q.padEnd(28) + ' → ' + detail + ' (expected ' + slug + '/' + cc + '/' + tz + ')');
    }
}

console.log('\n' + '═'.repeat(50));
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + tests.length + ')');
process.exit(fail === 0 ? 0 : 1);
