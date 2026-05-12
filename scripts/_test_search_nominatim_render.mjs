// PT-SEARCH-AR-4 diagnostic.
// Simulates `fetchCitySuggestions` end-to-end (smart filter + render
// pipeline) for the user's reported failing queries. If results appear
// here, the search ENGINE is correct — the bug is purely UX timing
// (Enter pressed before Nominatim responds).
//
// Hits the LOCAL server's /api/geocode proxy directly so we measure
// the same code-path the browser sees, then runs the JS-side filter
// mirror so we can see which results pass.

import http from 'node:http';

function nomFetch(q, mode = 'q') {
    const param = mode === 'q' ? 'q' : 'city';
    const url = `/api/geocode?type=search&format=json&limit=8&accept-language=ar&addressdetails=1&namedetails=1&${param}=${encodeURIComponent(q)}`;
    return new Promise((resolve) => {
        http.get({ host: 'localhost', port: 8080, path: url }, r => {
            let body = '';
            r.on('data', c => body += c);
            r.on('end', () => {
                try { resolve({ status: r.statusCode, data: JSON.parse(body) }); }
                catch (_) { resolve({ status: r.statusCode, data: [] }); }
            });
        }).on('error', () => resolve({ status: 0, data: [] }));
    });
}

// Reproduce the production smart-filter EXACTLY (mirrors fetchCitySuggestions).
const SMART_ALLOWED_TYPES = new Set([
    'city', 'town', 'village', 'municipality',
    'province', 'governorate', 'state', 'county', 'district',
    'administrative', 'borough', 'hamlet', 'locality', 'region'
]);
const SMART_BLOCKED_TYPES = new Set([
    'country', 'road', 'street', 'highway', 'suburb',
    'neighbourhood', 'quarter', 'building', 'shop', 'amenity',
    'tourism', 'landmark', 'address', 'postcode',
    'office', 'leisure', 'historic', 'craft', 'man_made',
    'waterway', 'natural', 'landuse', 'aeroway', 'railway',
    'residential', 'hamlet_neighbourhood', 'isolated_dwelling',
    'farm', 'plot'
]);
function _isWardLike(s) {
    if (!s) return false;
    return /[-\s](ku|gu)$/i.test(s) || /\b(Ward|Bezirk|Arrondissement|Distrito|Kecamatan|Daerah)\b/i.test(s);
}
function smartFilter(p) {
    const lat = parseFloat(p.lat), lon = parseFloat(p.lon);
    if (!isFinite(lat) || !isFinite(lon)) return { ok: false, why: 'no-coords' };
    if (!p.name && !p.display_name) return { ok: false, why: 'no-name' };
    const firstPart = (p.display_name || '').split(',')[0] || '';
    if (_isWardLike(p.name) || _isWardLike(firstPart)) return { ok: false, why: 'ward-like' };
    if (SMART_ALLOWED_TYPES.has(p.addresstype)) return { ok: true, why: 'addrtype-allowed' };
    if (SMART_BLOCKED_TYPES.has(p.class)) return { ok: false, why: 'class-blocked' };
    if (SMART_BLOCKED_TYPES.has(p.type)) return { ok: false, why: 'type-blocked' };
    if (SMART_BLOCKED_TYPES.has(p.addresstype)) return { ok: false, why: 'addrtype-blocked' };
    return { ok: true, why: 'default-allow' };
}

const QUERIES = [
    'Holguin', 'هولغوين', 'الخفجي', 'الهفوف', 'المبرز',
    'نابولي', 'ميلانو', 'سانتا كلارا', 'Milan', 'Naples', 'Khafji'
];

let pass = 0, fail = 0;

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' PT-SEARCH-AR-4 — diagnose user-reported failing queries (full pipeline)');
console.log('═══════════════════════════════════════════════════════════════════════');

for (const q of QUERIES) {
    // Hit the proxy (same call the browser makes).
    const r1 = await nomFetch(q, 'q');
    await new Promise(r => setTimeout(r, 1200));
    const r2 = await nomFetch(q, 'city');
    await new Promise(r => setTimeout(r, 1200));

    const seen = new Set();
    const all = [...(r1.data || []), ...(r2.data || [])].filter(p => {
        if (!p || seen.has(p.place_id)) return false;
        seen.add(p.place_id);
        return true;
    });
    const filtered = all.map(p => ({ ...p, _verdict: smartFilter(p) }));
    const accepted = filtered.filter(p => p._verdict.ok);

    const accStr = accepted.length === 0 ? '0 (FAIL)' : `${accepted.length} ✓`;
    if (accepted.length > 0) pass++; else fail++;
    console.log(`\n${q.padEnd(20)} → Nominatim ${all.length} raw → smart-filter passed: ${accStr}`);
    if (filtered.length > 0 && accepted.length === 0) {
        console.log(`   REJECT REASONS:`);
        filtered.slice(0, 3).forEach(p => {
            console.log(`     "${p.name}" addrtype=${p.addresstype} type=${p.type} cls=${p.class} → ${p._verdict.why}`);
        });
    } else if (accepted.length > 0) {
        accepted.slice(0, 2).forEach(p => {
            console.log(`     accepted: "${p.name}" (${(p.address || {}).country}, addrtype=${p.addresstype})`);
        });
    }
}

console.log('');
console.log(`Diagnostic Result: ${pass} pipelines return ≥1 city / ${fail} fail to surface any`);
