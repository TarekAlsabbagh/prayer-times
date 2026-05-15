// EXTERNAL-PROVIDER-2 — LocationIQ adapter verification (2026-05-15)
//
// Tests the cascade: curated → discovered → Nominatim → LocationIQ.
// The user-facing /api/search-place envelope now includes a `provider`
// field indicating which external provider returned the rows when
// source==='external'.
//
// This script runs LOCALLY against http://localhost:8080. It does NOT
// require a LOCATIONIQ_API_KEY env var — it covers the no-key safety
// path, the header propagation, and the JSON shape additions. The
// actual LocationIQ fetch path is covered by production verification
// (the user will set the env var on Render after deploy).
//
// Pre-req: node server.js running on localhost:8080.

import http from 'node:http';

function getJson(path) {
    return new Promise((resolve) => {
        http.get({ host: 'localhost', port: 8080, path }, r => {
            let body = '';
            r.on('data', c => body += c);
            r.on('end', () => {
                try { resolve({ status: r.statusCode, headers: r.headers, json: JSON.parse(body) }); }
                catch (_) { resolve({ status: r.statusCode, headers: r.headers, json: null, body }); }
            });
        }).on('error', () => resolve({ status: 0, headers: {}, json: null }));
    });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

let pass = 0, fail = 0;
const ok = (label, b, extra) => { (b ? pass++ : fail++); console.log((b?'✓':'✗') + ' ' + label + (extra ? '   ' + extra : '')); };

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' EXTERNAL-PROVIDER-2 — LocationIQ adapter verification');
console.log('═══════════════════════════════════════════════════════════════════════');

// ── A. Response envelope shape ─────────────────────────────────────────
console.log('\n── A. Response envelope shape — `provider` field present ──');

// Curated query — provider should be empty (no external call needed)
{
    const r = await getJson('/api/search-place?q=Riyadh&lang=en');
    ok('curated query → 200 with status=ok',
        r.status === 200 && r.json && r.json.status === 'ok');
    ok('curated query → source=curated',
        r.json && r.json.source === 'curated');
    ok('curated query → provider="" (no external used)',
        r.json && r.json.provider === '',
        `(got "${r.json && r.json.provider}")`);
    ok('curated query → X-Search-Provider header is empty',
        r.headers['x-search-provider'] === '' || r.headers['x-search-provider'] === undefined);
}
await sleep(200);

// External query (Nominatim path, no LocationIQ key) — provider="nominatim"
{
    const r = await getJson('/api/search-place?q=Krasnodar&lang=en');
    ok('external query → 200',
        r.status === 200);
    ok('external query → source=external',
        r.json && r.json.source === 'external');
    ok('external query → provider="nominatim" (Nominatim returned ok)',
        r.json && r.json.provider === 'nominatim',
        `(got "${r.json && r.json.provider}")`);
    ok('external query → X-Search-Provider: nominatim header',
        r.headers['x-search-provider'] === 'nominatim',
        `(got "${r.headers['x-search-provider']}")`);
}
await sleep(200);

// Too-short query — provider="" since we never asked any provider
{
    const r = await getJson('/api/search-place?q=&lang=ar');
    ok('empty query → 200 (no crash)',
        r.status === 200);
    ok('empty query → provider="" (no external call)',
        r.json && r.json.provider === '',
        `(got "${r.json && r.json.provider}")`);
}
await sleep(200);

// ── B. No-key safety: LOCATIONIQ_API_KEY missing must NOT break anything
console.log('\n── B. No-key safety — server still works without LOCATIONIQ_API_KEY ──');

// Verify the system is still serving (sentinel check on /health)
{
    const r = await getJson('/health');
    ok('GET /health → 200',
        r.status === 200);
}
await sleep(50);

// External query when LocationIQ is disabled (no key in env). The cascade
// should still surface Nominatim's result — LocationIQ is silently skipped.
{
    const r = await getJson('/api/search-place?q=Volgograd&lang=en');
    ok('external Volgograd (no key) → returns Nominatim result',
        r.status === 200 && r.json && r.json.source === 'external'
        && (r.json.provider === 'nominatim' || r.json.provider === ''));
}
await sleep(200);

// ── C. Cache behavior: provider rows must be tagged correctly ─────────
console.log('\n── C. Cache tagging — provider differentiation in cache key ──');

// Hit the same external query twice → second call should be cache-hit
{
    const t0 = Date.now();
    const r1 = await getJson('/api/search-place?q=Tromso&lang=en');
    const t1 = Date.now() - t0;
    const t2 = Date.now();
    const r2 = await getJson('/api/search-place?q=Tromso&lang=en');
    const t3 = Date.now() - t2;
    ok('Tromso first call returns external result',
        r1.json && r1.json.source === 'external');
    ok('Tromso second call also returns external result (cached)',
        r2.json && r2.json.source === 'external');
    ok('Tromso provider field stable across calls',
        r1.json && r2.json && r1.json.provider === r2.json.provider,
        `(got "${r1.json && r1.json.provider}" then "${r2.json && r2.json.provider}")`);
    // Cache hit should be measurably faster (loose check — network can vary).
    // We use 3x slowdown as the floor — if r1 took 2000ms (Nominatim fetch),
    // r2 should be < 700ms (cache).
    if (t1 > 500) {
        ok('Tromso 2nd call is faster (cache hit)',
            t3 < t1 / 2,
            `(first: ${t1}ms, second: ${t3}ms)`);
    } else {
        // First call may have been a cache hit from a prior test run.
        console.log('  (first call was fast — both are cache hits; skipping speed check)');
    }
}

// ── D. provider field present in every external response ──────────────
console.log('\n── D. `provider` field always present + correct shape ──');

for (const q of ['Magdeburg', 'Saint-Etienne', 'Reykjavik']) {
    const r = await getJson('/api/search-place?q=' + encodeURIComponent(q) + '&lang=en');
    const hasProviderField = r.json && Object.prototype.hasOwnProperty.call(r.json, 'provider');
    ok(`${q} → response JSON has \`provider\` key`,
        hasProviderField,
        r.json ? `(provider="${r.json.provider}")` : '');
    if (r.json && r.json.source === 'external') {
        const validProvider = (r.json.provider === 'nominatim' || r.json.provider === 'locationiq' || r.json.provider === '');
        ok(`${q} → provider is valid enum value`,
            validProvider,
            `(got "${r.json.provider}")`);
    }
    await sleep(150);
}

// ── E. Curated never triggers external — silent skip path ─────────────
console.log('\n── E. Curated entries do NOT trigger external (no provider) ──');

const knownCurated = ['Riyadh', 'دمشق', 'بغداد', 'الجلفة', 'كيفة', 'شبرا الخيمة'];
for (const q of knownCurated) {
    const r = await getJson('/api/search-place?q=' + encodeURIComponent(q) + '&lang=ar');
    ok(`${q} → source=curated, provider=""`,
        r.json && r.json.source === 'curated' && r.json.provider === '',
        `(source=${r.json && r.json.source}, provider="${r.json && r.json.provider}")`);
    await sleep(100);
}

console.log('');
console.log(`Result: ${pass} pass / ${fail} fail`);
if (fail > 0) process.exit(1);
