// scripts/_test_asia_1g_ir_search.mjs
// ASIA-1G-IR clean-merge smoke test — verifies the 14 user-requested
// Iran queries return source=curated with countryCode=ir + clean Arabic.
// Critical check: قائم شهر → ir/qaem-shahr (NOT Shahabad or anything else).
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
    // ───── 14 user-required Arabic queries ─────
    ['كرج',             'ar', 'ir', 'Asia/Tehran', 'karaj'],
    ['زاهدان',          'ar', 'ir', 'Asia/Tehran', 'zahedan'],
    ['همدان',           'ar', 'ir', 'Asia/Tehran', 'hamadan'],
    ['أردبيل',          'ar', 'ir', 'Asia/Tehran', 'ardabil'],
    ['بندر عباس',       'ar', 'ir', 'Asia/Tehran', 'bandar-abbas'],
    ['زنجان',           'ar', 'ir', 'Asia/Tehran', 'zanjan'],
    ['سنندج',           'ar', 'ir', 'Asia/Tehran', 'sanandaj'],
    ['قزوين',           'ar', 'ir', 'Asia/Tehran', 'qazvin'],
    ['اراك',            'ar', 'ir', 'Asia/Tehran', 'arak'],
    ['خميني شهر',       'ar', 'ir', 'Asia/Tehran', 'khomeyni-shahr'],
    ['قرجك',            'ar', 'ir', 'Asia/Tehran', 'qarchak'],
    ['شهرك غلستان',     'ar', 'ir', 'Asia/Tehran', 'golestan'],
    ['بوكان',           'ar', 'ir', 'Asia/Tehran', 'bukan'],
    ['قائم شهر',        'ar', 'ir', 'Asia/Tehran', 'qaem-shahr'],   // 🚨 critical — must NOT return Shahabad

    // ───── English samples ─────
    ['Karaj',           'en', 'ir', 'Asia/Tehran', 'karaj'],
    ['Hamadan',         'en', 'ir', 'Asia/Tehran', 'hamadan'],
    ['Qaem Shahr',      'en', 'ir', 'Asia/Tehran', 'qaem-shahr'],   // 🚨 critical
    ['Arak',            'en', 'ir', 'Asia/Tehran', 'arak'],
    ['Bukan',           'en', 'ir', 'Asia/Tehran', 'bukan'],
];

let pass = 0, fail = 0;
const failures = [];
console.log('═══ ASIA-1G-IR — ' + tests.length + ' smoke tests on /api/search-place ═══\n');

for (const [q, lang, cc, tz, slug] of tests) {
    const r = await search(q, lang);
    const top = (r.results || [])[0];
    const tzOk = top && (top.timezone === tz || top.timezone.startsWith(tz.split('/')[0] + '/'));
    const ok = top && top.countryCode === cc && tzOk && top.slug === slug && top.source === 'curated';
    if (ok) {
        pass++;
        console.log('✓ ' + q.padEnd(22) + ' → slug=' + top.slug.padEnd(16) + ' cc=' + top.countryCode + ' tz=' + top.timezone.padEnd(14) + ' source=curated ar=' + top.displayName);
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

// CRITICAL: قائم شهر → ir/qaem-shahr (NOT Shahabad)
const qsResult = await search('قائم شهر', 'ar');
const qsTop = (qsResult.results || [])[0];
const qsGood = qsTop && qsTop.slug === 'qaem-shahr' && qsTop.countryCode === 'ir';
console.log('\n🚨 CRITICAL CHECK: قائم شهر → ir/qaem-shahr (NOT Shahabad)');
console.log(qsGood ? '  ✓ PASS: قائم شهر correctly returns ir/qaem-shahr (ar="' + qsTop.displayName + '")' : '  ✗ FAIL: قائم شهر returned ' + (qsTop ? JSON.stringify(qsTop) : 'NO RESULT'));

process.exit(fail === 0 && qsGood ? 0 : 1);
