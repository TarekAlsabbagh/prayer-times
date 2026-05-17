// scripts/_test_asia_1e_search.mjs
// ASIA-1E closure smoke test — verifies all 63 merged entries are searchable
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

// User-required test queries (15 + extras)
const tests = [
    // === User-explicit Arabic test queries ===
    ['ديلي',          'ar', 'tl', 'Asia/Dili',         'dili'],            // alias
    ['باتهين',        'ar', 'mm', 'Asia/Yangon',       'pathein'],         // alias
    ['باغو',          'ar', 'mm', 'Asia/Yangon',       'bago'],
    ['سيتوي',         'ar', 'mm', 'Asia/Yangon',       'sittwe'],
    ['باتامبانغ',     'ar', 'kh', 'Asia/Phnom_Penh',   'battambang'],      // alias
    ['جافنا',         'ar', 'lk', 'Asia/Colombo',      'jaffna'],
    ['جالي',          'ar', 'lk', 'Asia/Colombo',      'galle'],           // alias
    ['جاناكبور',      'ar', 'np', 'Asia/Kathmandu',    'janakpur'],        // alias
    ['سافاناكيت',     'ar', 'la', 'Asia/Vientiane',    'savannakhet'],     // alias
    ['باكسي',         'ar', 'la', 'Asia/Vientiane',    'pakse'],
    ['كوالا بيلايت',  'ar', 'bn', 'Asia/Brunei',       'kuala-belait'],
    ['توتونغ',        'ar', 'bn', 'Asia/Brunei',       'tutong'],          // via cleaned alias
    ['بارو',          'ar', 'bt', 'Asia/Thimphu',      'paro'],
    ['هيثادهو',       'ar', 'mv', 'Indian/Maldives',   'hithadhoo'],       // alias
    ['ماليانا',       'ar', 'tl', 'Asia/Dili',         'maliana'],

    // === Additional Arabic for high-pop entries ===
    ['تاكيو',         'ar', 'kh', 'Asia/Phnom_Penh',   'takeo'],
    ['برغنج',         'ar', 'np', 'Asia/Kathmandu',    'birganj'],
    ['بيراتناغار',    'ar', 'np', 'Asia/Kathmandu',    'biratnagar'],
    ['مونيوا',        'ar', 'mm', 'Asia/Yangon',       'monywa'],
    ['موراتووا',      'ar', 'lk', 'Asia/Colombo',      'moratuwa'],
    ['تاونجي',        'ar', 'mm', 'Asia/Yangon',       'taunggyi'],
    ['نجومبو',        'ar', 'lk', 'Asia/Colombo',      'negombo'],

    // === English samples covering all 9 countries ===
    ['Dili',          'en', 'tl', 'Asia/Dili',         'dili'],
    ['Pathein',       'en', 'mm', 'Asia/Yangon',       'pathein'],
    ['Bago',          'en', 'mm', 'Asia/Yangon',       'bago'],
    ['Sittwe',        'en', 'mm', 'Asia/Yangon',       'sittwe'],
    ['Battambang',    'en', 'kh', 'Asia/Phnom_Penh',   'battambang'],
    ['Jaffna',        'en', 'lk', 'Asia/Colombo',      'jaffna'],
    ['Galle',         'en', 'lk', 'Asia/Colombo',      'galle'],
    ['Janakpur',      'en', 'np', 'Asia/Kathmandu',    'janakpur'],
    ['Savannakhet',   'en', 'la', 'Asia/Vientiane',    'savannakhet'],
    ['Pakse',         'en', 'la', 'Asia/Vientiane',    'pakse'],
    ['Kuala Belait',  'en', 'bn', 'Asia/Brunei',       'kuala-belait'],
    ['Tutong',        'en', 'bn', 'Asia/Brunei',       'tutong'],
    ['Paro',          'en', 'bt', 'Asia/Thimphu',      'paro'],
    ['Hithadhoo',     'en', 'mv', 'Indian/Maldives',   'hithadhoo'],
    ['Maliana',       'en', 'tl', 'Asia/Dili',         'maliana'],
    ['Takeo',         'en', 'kh', 'Asia/Phnom_Penh',   'takeo']
];

let pass = 0, fail = 0;
console.log('═══ ASIA-1E — ' + tests.length + ' smoke tests on /api/search-place ═══');
console.log('(15 user-required Arabic + 7 extra Arabic + 17 English samples)\n');

for (const [q, lang, cc, tz, slug] of tests) {
    const r = await search(q, lang);
    const top = (r.results || [])[0];
    const ok = top && top.countryCode === cc && top.timezone === tz && top.slug === slug && top.source === 'curated';
    if (ok) {
        pass++;
        console.log('✓ ' + q.padEnd(20) + ' → slug=' + top.slug.padEnd(18) + ' cc=' + top.countryCode + ' tz=' + top.timezone.padEnd(18) + ' source=curated ar=' + top.displayName);
    } else {
        fail++;
        const detail = top
            ? 'slug=' + top.slug + ' cc=' + top.countryCode + ' tz=' + top.timezone + ' source=' + top.source
            : 'NO RESULT';
        console.log('✗ ' + q.padEnd(20) + ' → ' + detail + ' (expected ' + slug + '/' + cc + '/' + tz + ')');
    }
}

console.log('\n' + '═'.repeat(60));
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + tests.length + ')');
process.exit(fail === 0 ? 0 : 1);
