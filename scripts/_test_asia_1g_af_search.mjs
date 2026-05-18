// scripts/_test_asia_1g_af_search.mjs
// ASIA-1G-AF clean-merge smoke test — verifies the 15 user-requested
// Afghan queries return source=curated cc=af + clean Arabic.
// Critical checks: 4 NAME_AR_FIXES return their fixed slugs (NOT the
// mechanical defaults from Stage 3.4).
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
    // ───── 15 user-required Arabic queries ─────
    ['كابل',            'ar', 'af', 'Asia/Kabul', 'kabul'],
    ['هرات',            'ar', 'af', 'Asia/Kabul', 'herat'],
    ['مزار شريف',       'ar', 'af', 'Asia/Kabul', 'mazar-e-sharif'],
    ['جلال آباد',       'ar', 'af', 'Asia/Kabul', 'jalalabad'],
    ['قندوز',           'ar', 'af', 'Asia/Kabul', 'kunduz'],
    ['غزنة',            'ar', 'af', 'Asia/Kabul', 'ghazni'],
    ['بلخ',             'ar', 'af', 'Asia/Kabul', 'balkh'],
    ['بغلان',           'ar', 'af', 'Asia/Kabul', 'baghlan'],
    ['بول خمري',        'ar', 'af', 'Asia/Kabul', 'pul-e-khumri'],   // 🚨 critical NAME_AR_FIX
    ['تشاريكار',        'ar', 'af', 'Asia/Kabul', 'charikar'],        // 🚨 critical NAME_AR_FIX
    ['سر بول',          'ar', 'af', 'Asia/Kabul', 'sar-e-pul'],       // 🚨 critical NAME_AR_FIX
    ['بول علم',         'ar', 'af', 'Asia/Kabul', 'pul-e-alam'],      // 🚨 critical NAME_AR_FIX
    ['شبرغان',          'ar', 'af', 'Asia/Kabul', 'shibirghan'],
    ['باميان',          'ar', 'af', 'Asia/Kabul', 'bamyan'],
    ['خوست',            'ar', 'af', 'Asia/Kabul', 'khost'],

    // ───── English samples ─────
    ['Kabul',           'en', 'af', 'Asia/Kabul', 'kabul'],
    ['Herat',           'en', 'af', 'Asia/Kabul', 'herat'],
    ['Mazar-e Sharif',  'en', 'af', 'Asia/Kabul', 'mazar-e-sharif'],
    ['Charikar',        'en', 'af', 'Asia/Kabul', 'charikar'],
    ['Sheberghan',      'en', 'af', 'Asia/Kabul', 'shibirghan'],     // 🚨 user-variant English spelling

    // ───── aliases.ar (mechanical-clean forms preserved as aliases) ─────
    ['شاريكار',         'ar', 'af', 'Asia/Kabul', 'charikar'],        // alias
    ['بل خمري',         'ar', 'af', 'Asia/Kabul', 'pul-e-khumri'],    // alias
    ['بل علم',          'ar', 'af', 'Asia/Kabul', 'pul-e-alam'],      // alias
    ['سر بل',           'ar', 'af', 'Asia/Kabul', 'sar-e-pul'],       // alias
];

let pass = 0, fail = 0;
const failures = [];
console.log('═══ ASIA-1G-AF — ' + tests.length + ' smoke tests on /api/search-place ═══\n');

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

// CRITICAL: the 4 semantic NAME_AR_FIXES must map to af/<slug>
const critical = [
    ['تشاريكار', 'charikar'],
    ['بول خمري', 'pul-e-khumri'],
    ['بول علم',  'pul-e-alam'],
    ['سر بول',   'sar-e-pul'],
];
let critPass = 0;
console.log('\n🚨 CRITICAL CHECKS (4 semantic NAME_AR_FIXES):');
for (const [q, expectedSlug] of critical) {
    const r = await search(q, 'ar');
    const top = (r.results || [])[0];
    const ok = top && top.slug === expectedSlug && top.countryCode === 'af';
    if (ok) { critPass++; console.log('  ✓ ' + q.padEnd(15) + ' → af/' + expectedSlug); }
    else    { console.log('  ✗ ' + q.padEnd(15) + ' → ' + (top ? top.countryCode + '/' + top.slug : 'NO RESULT')); }
}

process.exit(fail === 0 && critPass === 4 ? 0 : 1);
