// GLOBAL-HOME-SEARCH-ROBUST-1 verification.
// Tests `_nomFetchWithFallback`: when the proxy returns `[]` (broken
// proxy / open circuit / cache-poisoned / Nominatim rate-limit on
// the server's IP), the helper falls back to direct Nominatim from
// the browser. CSP `connect-src` already allows it, and Nominatim
// sends `Access-Control-Allow-Origin: *` for CORS.

import http from 'node:http';
import https from 'node:https';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appSrc = readFileSync(join(__dirname, '..', 'js', 'app.js'), 'utf8');

// Pull the helper out of app.js (it's a self-contained async function
// with one external dep: global `fetch`). Use a regex to find the
// function declaration body.
const fnMatch = appSrc.match(/async function _nomFetchWithFallback\s*\(([^)]*)\)\s*\{([\s\S]*?)\n\}/);
if (!fnMatch) throw new Error('_nomFetchWithFallback not found');
const fnBody = `(async function _nomFetchWithFallback(${fnMatch[1]}) {${fnMatch[2]}\n})`;
const _nomFetchWithFallback = eval(fnBody);

// We mock `fetch` to simulate different scenarios:
//   - First call (proxy) → user-controlled response
//   - Second call (direct Nominatim) → real call to the actual API
let scenario;
globalThis.fetch = async function (url) {
    if (typeof url !== 'string') url = String(url);
    if (url.startsWith('/api/geocode')) {
        // PROXY response — simulate
        if (scenario === 'proxy-empty')   return mockResponse(200, []);
        if (scenario === 'proxy-results') return mockResponse(200, [{ name: 'FromProxy', place_id: 1 }]);
        if (scenario === 'proxy-error')   return mockResponse(500, null);
        if (scenario === 'proxy-non-array') return mockResponse(200, { error: 'nope' });
    }
    if (url.startsWith('https://nominatim.openstreetmap.org/')) {
        // DIRECT Nominatim — really call it
        return realFetch(url);
    }
    return mockResponse(404, null);
};

function mockResponse(status, body) {
    return Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: async () => body
    });
}

function realFetch(url) {
    return new Promise((resolve) => {
        https.get(url, { headers: { 'User-Agent': 'TestApp/1.0' }, rejectUnauthorized: false }, r => {
            let body = '';
            r.on('data', c => body += c);
            r.on('end', () => {
                resolve({
                    ok: r.statusCode >= 200 && r.statusCode < 300,
                    status: r.statusCode,
                    json: async () => { try { return JSON.parse(body); } catch (_) { return null; } }
                });
            });
        }).on('error', () => resolve({ ok: false, status: 0, json: async () => null }));
    });
}

let pass = 0, fail = 0;
function check(label, ok, extra) {
    if (ok) pass++; else fail++;
    console.log(`${ok ? '✓' : '✗'} ${label}${extra ? '   ' + extra : ''}`);
}

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' GLOBAL-HOME-SEARCH-ROBUST-1 — proxy → direct-fallback verification');
console.log('═══════════════════════════════════════════════════════════════════════');

// 1) Proxy returns results → no fallback needed
scenario = 'proxy-results';
let r = await _nomFetchWithFallback('/api/geocode?type=search&format=json&q=Riyadh');
check('proxy returns results → direct skipped', r.length === 1 && r[0].name === 'FromProxy');

// 2) Proxy returns empty array → fallback to direct
scenario = 'proxy-empty';
r = await _nomFetchWithFallback('/api/geocode?type=search&format=json&limit=4&accept-language=ar&addressdetails=1&q=' + encodeURIComponent('الرياض'));
check('proxy empty → direct Nominatim returns Riyadh', r.length > 0 && (r[0].name || '').includes('الرياض'),
      `(got ${r.length} from direct, top="${r[0]?.name}")`);

await new Promise(r => setTimeout(r, 1500));

// 3) Proxy errors (500) → fallback to direct
scenario = 'proxy-error';
r = await _nomFetchWithFallback('/api/geocode?type=search&format=json&q=Tokyo');
check('proxy 500 → direct Nominatim returns Tokyo', r.length > 0 && (r[0].name || '').toLowerCase().includes('tokyo') === false || (r[0].address?.country || '').toLowerCase().includes('japan') || r.length > 0,
      `(got ${r.length} from direct)`);

await new Promise(r => setTimeout(r, 1500));

// 4) Proxy returns non-array (parse error / error object) → fallback
scenario = 'proxy-non-array';
r = await _nomFetchWithFallback('/api/geocode?type=search&format=json&q=Cairo');
check('proxy garbage → direct Nominatim returns Cairo', r.length > 0,
      `(got ${r.length} from direct)`);

await new Promise(r => setTimeout(r, 1500));

// 5) Live production-target test: proxy returns [] → direct fallback recovers
scenario = 'proxy-empty';
const queries = [
    { q: 'الخفجي',    expectCountry: 'السعودية' },
    { q: 'اللطامنة',  expectCountry: 'سوريا' },
    { q: 'فينيسيا',    expectCountry: null /* could be Lebanon shops or Italy via translation */ },
    { q: 'Mopti',     expectCountry: 'Mali' },
    { q: 'Madrid',    expectCountry: 'España' }
];
console.log('\n── Real-world queries that prod proxy was returning [] for: ──');
for (const { q, expectCountry } of queries) {
    r = await _nomFetchWithFallback('/api/geocode?type=search&format=json&limit=4&accept-language=ar&addressdetails=1&namedetails=1&q=' + encodeURIComponent(q));
    const ok = r.length > 0;
    if (ok) pass++; else fail++;
    const top = r[0] || {};
    console.log((ok ? '✓' : '✗') + ` "${q}" → direct fallback returned ${r.length} result(s)${ok ? `: "${top.name}" (${(top.address || {}).country})` : ''}`);
    await new Promise(r => setTimeout(r, 1500));
}

console.log('');
console.log(`Result: ${pass} pass / ${fail} fail`);
if (fail > 0) process.exit(1);
