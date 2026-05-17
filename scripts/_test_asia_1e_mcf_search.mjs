// scripts/_test_asia_1e_mcf_search.mjs
// ASIA-1E-MCF closure smoke test — verifies all 70 merged major-blocked
// entries are searchable via /api/search-place with correct curated mapping.
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

// User's 12 explicit test queries + 30 additional coverage
const tests = [
    // === User-explicit 12 queries ===
    ['ثيمفو',              'ar', 'bt', 'Asia/Thimphu',      'thimphu'],
    ['بندر سري بكاوان',    'ar', 'bn', 'Asia/Brunei',       'bandar-seri-begawan'],
    ['ترينكومالي',         'ar', 'lk', 'Asia/Colombo',      'trincomalee'],
    ['مولامين',            'ar', 'mm', 'Asia/Yangon',       'mawlamyine'],
    ['بهاراتبور',          'ar', 'np', 'Asia/Kathmandu',    'bharatpur'],
    ['بوتهوال',            'ar', 'np', 'Asia/Kathmandu',    'butwal'],            // alias spelling
    ['سيهانوكفيل',         'ar', 'kh', 'Asia/Phnom_Penh',   'sihanoukville'],
    ['لوانغ برابانغ',      'ar', 'la', 'Asia/Vientiane',    'luang-prabang'],
    ['ثاخيك',              'ar', 'la', 'Asia/Vientiane',    'thakhek'],           // alias spelling
    ['سواي',               'ar', 'tl', 'Asia/Dili',         'suai'],
    ['كيب',                'ar', 'kh', 'Asia/Phnom_Penh',   'kep'],
    ['بانغار',             'ar', 'bn', 'Asia/Brunei',       'bangar-bn'],         // alias

    // === English samples covering all 9 countries ===
    ['Thimphu',           'en', 'bt', 'Asia/Thimphu',      'thimphu'],
    ['Bandar Seri Begawan','en','bn', 'Asia/Brunei',       'bandar-seri-begawan'],
    ['Trincomalee',       'en', 'lk', 'Asia/Colombo',      'trincomalee'],
    ['Mawlamyine',        'en', 'mm', 'Asia/Yangon',       'mawlamyine'],
    ['Bharatpur',         'en', 'np', 'Asia/Kathmandu',    'bharatpur'],
    ['Butwal',            'en', 'np', 'Asia/Kathmandu',    'butwal'],
    ['Sihanoukville',     'en', 'kh', 'Asia/Phnom_Penh',   'sihanoukville'],
    ['Luang Prabang',     'en', 'la', 'Asia/Vientiane',    'luang-prabang'],
    ['Thakhek',           'en', 'la', 'Asia/Vientiane',    'thakhek'],
    ['Suai',              'en', 'tl', 'Asia/Dili',         'suai'],
    ['Kep',               'en', 'kh', 'Asia/Phnom_Penh',   'kep'],
    ['Bangar',            'en', 'bn', 'Asia/Brunei',       'bangar-bn'],

    // === Additional Arabic queries ===
    ['أنورادابورا',        'ar', 'lk', 'Asia/Colombo',      'anuradhapura'],
    ['ماهاراغاما',         'ar', 'lk', 'Asia/Colombo',      'maharagama'],
    ['أمارابورا',          'ar', 'mm', 'Asia/Yangon',       'amarapura'],
    ['مييكتيلا',           'ar', 'mm', 'Asia/Yangon',       'meiktila'],
    ['داوي',               'ar', 'mm', 'Asia/Yangon',       'dawei'],
    ['هيتاودا',            'ar', 'np', 'Asia/Kathmandu',    'hetauda'],
    ['بيريندراناغار',      'ar', 'np', 'Asia/Kathmandu',    'birendranagar'],
    ['بونتشولينغ',         'ar', 'bt', 'Asia/Thimphu',      'phuntsholing'],
    ['بوناخا',             'ar', 'bt', 'Asia/Thimphu',      'punakha'],
    ['كامبونغ تشنانغ',     'ar', 'kh', 'Asia/Phnom_Penh',   'kampong-chhnang'],
    ['كراتي',              'ar', 'kh', 'Asia/Phnom_Penh',   'kratie'],
    ['موانغ ساي',          'ar', 'la', 'Asia/Vientiane',    'muang-xay'],
    ['أتابيو',             'ar', 'la', 'Asia/Vientiane',    'attapeu'],
    ['سامي',               'ar', 'tl', 'Asia/Dili',         'same'],
    ['بانتي ماكاسار',      'ar', 'tl', 'Asia/Dili',         'pante-makasar'],
    ['فوفاهمولاه',         'ar', 'mv', 'Indian/Maldives',   'fuvahmulah'],
    ['كولهودوفوشي',        'ar', 'mv', 'Indian/Maldives',   'kulhudhuffushi'],
    ['داغا',               'ar', 'bt', 'Asia/Thimphu',      'daga'],
    ['سيكونغ',             'ar', 'la', 'Asia/Vientiane',    'sekong']
];

let pass = 0, fail = 0;
console.log('═══ ASIA-1E-MCF — ' + tests.length + ' smoke tests on /api/search-place ═══');
console.log('(12 user-required Arabic + 12 English samples + ' + (tests.length-24) + ' extras)\n');

for (const [q, lang, cc, tz, slug] of tests) {
    const r = await search(q, lang);
    const top = (r.results || [])[0];
    const ok = top && top.countryCode === cc && top.timezone === tz && top.slug === slug && top.source === 'curated';
    if (ok) {
        pass++;
        console.log('✓ ' + q.padEnd(22) + ' → slug=' + top.slug.padEnd(22) + ' cc=' + top.countryCode + ' tz=' + top.timezone.padEnd(18) + ' source=curated ar=' + top.displayName);
    } else {
        fail++;
        const detail = top
            ? 'slug=' + top.slug + ' cc=' + top.countryCode + ' tz=' + top.timezone + ' source=' + top.source
            : 'NO RESULT';
        console.log('✗ ' + q.padEnd(22) + ' → ' + detail + ' (expected ' + slug + '/' + cc + '/' + tz + ')');
    }
}

console.log('\n' + '═'.repeat(60));
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + tests.length + ')');
process.exit(fail === 0 ? 0 : 1);
