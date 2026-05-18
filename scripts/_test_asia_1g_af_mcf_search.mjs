// scripts/_test_asia_1g_af_mcf_search.mjs
// ASIA-1G-AF-MCF closure smoke test — verifies the 9 user-required Arabic
// queries return source=curated cc=af + the canonical Arabic from the MCF
// approvals. Includes alias-search verification (جغجران → fayroz-koh, etc.).
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
    // ───── 9 user-required Arabic queries ─────
    ['قندهار',         'ar', 'af', 'Asia/Kabul', 'kandahar'],
    ['لشكر جاه',       'ar', 'af', 'Asia/Kabul', 'lashkar-gah'],
    ['فراه',           'ar', 'af', 'Asia/Kabul', 'farah'],
    ['فيروز كوه',      'ar', 'af', 'Asia/Kabul', 'fayroz-koh'],
    ['ترين كوت',       'ar', 'af', 'Asia/Kabul', 'tarinkot'],
    ['قلعة نو',        'ar', 'af', 'Asia/Kabul', 'qala-i-naw'],
    ['ميدان شهر',      'ar', 'af', 'Asia/Kabul', 'maydanshakhr'],
    ['بارون',          'ar', 'af', 'Asia/Kabul', 'parun'],
    ['جغجران',         'ar', 'af', 'Asia/Kabul', 'fayroz-koh'],     // historical alias

    // ───── Alias-based searches (preserved variants) ─────
    ['كندهار',         'ar', 'af', 'Asia/Kabul', 'kandahar'],       // k-variant alias
    ['لشكر غاه',       'ar', 'af', 'Asia/Kabul', 'lashkar-gah'],    // mechanical-clean alias preserved
    ['طرين كوت',       'ar', 'af', 'Asia/Kabul', 'tarinkot'],       // ط-variant alias
    ['قلعة ناو',       'ar', 'af', 'Asia/Kabul', 'qala-i-naw'],     // ناو variant
    ['قلعه نو',        'ar', 'af', 'Asia/Kabul', 'qala-i-naw'],     // ه variant

    // ───── English samples ─────
    ['Kandahar',       'en', 'af', 'Asia/Kabul', 'kandahar'],
    ['Lashkar Gah',    'en', 'af', 'Asia/Kabul', 'lashkar-gah'],
    ['Tarinkot',       'en', 'af', 'Asia/Kabul', 'tarinkot'],
    ['Qala i Naw',     'en', 'af', 'Asia/Kabul', 'qala-i-naw'],
];

let pass = 0, fail = 0;
const failures = [];
console.log('═══ ASIA-1G-AF-MCF — ' + tests.length + ' smoke tests on /api/search-place ═══\n');

for (const [q, lang, cc, tz, slug] of tests) {
    const r = await search(q, lang);
    const top = (r.results || [])[0];
    const tzOk = top && (top.timezone === tz || top.timezone.startsWith(tz.split('/')[0] + '/'));
    const ok = top && top.countryCode === cc && tzOk && top.slug === slug && top.source === 'curated';
    if (ok) {
        pass++;
        console.log('✓ ' + q.padEnd(20) + ' → slug=' + top.slug.padEnd(16) + ' cc=' + top.countryCode + ' tz=' + top.timezone.padEnd(14) + ' source=curated ar=' + top.displayName);
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

// CRITICAL: قندهار must map to af/kandahar (largest deferral, biggest user concern)
const kr = await search('قندهار', 'ar');
const kTop = (kr.results || [])[0];
const kandaharOk = kTop && kTop.slug === 'kandahar' && kTop.countryCode === 'af';
console.log('\n🚨 CRITICAL CHECK: قندهار → af/kandahar (largest AF deferral)');
console.log(kandaharOk ? '  ✓ PASS: قندهار correctly returns af/kandahar (ar="' + kTop.displayName + '")'
                       : '  ✗ FAIL: قندهار returned ' + (kTop ? JSON.stringify(kTop) : 'NO RESULT'));

// Also verify لشكر جاه returns lashkar-gah (NOT لشكر غاه or لشكر گاه)
const lr = await search('لشكر جاه', 'ar');
const lTop = (lr.results || [])[0];
const lashkarOk = lTop && lTop.slug === 'lashkar-gah' && lTop.countryCode === 'af';
console.log('\n🚨 CRITICAL CHECK: لشكر جاه → af/lashkar-gah (AR Wikipedia convention chosen over Persian/mechanical)');
console.log(lashkarOk ? '  ✓ PASS: لشكر جاه correctly returns af/lashkar-gah (ar="' + lTop.displayName + '")'
                      : '  ✗ FAIL: لشكر جاه returned ' + (lTop ? JSON.stringify(lTop) : 'NO RESULT'));

process.exit(fail === 0 && kandaharOk && lashkarOk ? 0 : 1);
