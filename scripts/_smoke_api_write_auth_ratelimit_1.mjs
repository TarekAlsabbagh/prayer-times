// API-WRITE-AUTH-AND-RATELIMIT-HARDENING-1 — security regression suite (self-contained).
//
// Covers the twelve cases the ticket asks for:
//   1  unauthenticated POST /api/cities/add                    -> blocked (401 / 403 fail-closed)
//   2  oversized request body                                  -> 413, stream-time
//   3  spoofed X-Forwarded-For / CF-Connecting-IP              -> cannot mint rate-limit buckets
//   4  authorised request                                      -> still works end to end
//   5  existing public read APIs                               -> unchanged
//   6  city pages                                              -> unaffected
//   7  prayer pages                                            -> unaffected
//   8  SSR                                                     -> unaffected
//   9  SEO routes                                              -> unaffected
//  10  no secret in any error response
//  11  invalid JSON / malformed requests                       -> fail safely
//  12  authentication failure                                  -> zero data mutation
//  +   an oversized body is DROPPED, not buffered — proven under a bounded heap
//
// Every negative write case is paired with a filesystem assertion: the target db file must
// not come into existence. The one authorised write uses the reserved code `zz` (no such
// country) and the file it creates is removed again before the suite exits.
//
// Self-contained: spawns its own servers (Supabase OFF). Run:
//   node scripts/_smoke_api_write_auth_ratelimit_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { existsSync, rmSync, readdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN = 'apisec-smoke-token-4f2b';
const FAKE_SERVICE_KEY = 'SUPABASE_SERVICE_ROLE_KEY_MUST_NOT_LEAK';
const TEST_CC = 'zz';                                   // reserved: no such country ships in db/
const TEST_DB_FILE = path.join(ROOT, 'db', `cities-${TEST_CC}.json`);
const MAX_BODY = 64 * 1024;

let pass = 0, fail = 0;
const check = (label, ok, extra) => { ok ? pass++ : fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra ? '   →  ' + extra : ''}`); };

function reqRaw(port, method, p, headers, body) {
    return new Promise((resolve) => {
        const r = http.request({ host: '127.0.0.1', port, path: p, method, headers: headers || {} }, res => {
            let b = ''; res.on('data', c => b += c); res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: b }));
        });
        r.on('error', (e) => resolve({ status: 0, headers: {}, body: '', err: String(e && e.code || e) }));
        if (body != null) r.write(body);
        r.end();
    });
}
const get = (port, p, headers) => reqRaw(port, 'GET', p, headers, null);
const post = (port, p, headers, body) => reqRaw(port, 'POST', p, headers, body);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function waitReady(port, ms) {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) { const r = await get(port, '/health'); if (r.status === 200) return true; await sleep(400); }
    return false;
}
function spawnServer(port, env, nodeArgs) {
    return spawn(process.execPath, [...(nodeArgs || []), 'server.js'], {
        cwd: ROOT,
        env: { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: FAKE_SERVICE_KEY, ...env },
        stdio: ['ignore', 'ignore', 'ignore']
    });
}

// A fingerprint of every db/cities-*.json, so "no mutation" is proven against the whole
// directory and not just the one file the request named.
function dbFingerprint() {
    const h = createHash('sha256');
    for (const f of readdirSync(path.join(ROOT, 'db')).filter(n => /^cities-[a-z]{2,3}\.json$/.test(n)).sort()) {
        h.update(f).update('\0').update(readFileSync(path.join(ROOT, 'db', f)));
    }
    return h.digest('hex');
}

// Secrets that must never surface in a response body, whatever the status code.
// Secret VALUES only. `SUPABASE_SERVICE_ROLE_KEY` is deliberately NOT in this list: the
// public /api/supabase-status hint names that env var in a sentence telling an operator
// what to configure, and naming a variable is not disclosing its value. Putting the name
// here produced a false positive on the first run.
const SECRET_NEEDLES = [TOKEN, FAKE_SERVICE_KEY, 'service_role'];
const DISCLOSURE_NEEDLES = [/\bat\s+\w+\s+\(.*:\d+:\d+\)/, /node_modules/, /[A-Za-z]:\\Users\\/, /\/opt\/render\//, /ENOENT/, /\bstack\b/i];
const collected = [];                                    // every response body a probe saw
function recordBody(label, body) { collected.push({ label, body: String(body || '') }); }

console.log('═══ API-WRITE-AUTH-AND-RATELIMIT-HARDENING-1 — security regression suite ═══\n');

if (existsSync(TEST_DB_FILE)) { console.error(`✗ refusing to run: ${TEST_DB_FILE} already exists`); process.exit(1); }
const DB_BEFORE = dbFingerprint();

let exitCode = 1;
try {

// ─────────────────────────────────────────────────────────────────────────────
// PHASE A — ADMIN_TOKEN unset: the route must fail CLOSED, never fall open.
// ─────────────────────────────────────────────────────────────────────────────
console.log('── A. fail-closed when ADMIN_TOKEN is not configured ──');
const PORT_A = 8211;
const srvA = spawnServer(PORT_A, { ADMIN_TOKEN: '' });
try {
    if (!await waitReady(PORT_A, 30000)) throw new Error('server A never became ready');
    const r = await post(PORT_A, `/api/cities/add?cc=${TEST_CC}`, { 'Content-Type': 'application/json' },
        JSON.stringify([{ nameAr: 'اختراق', nameEn: 'Injected', lat: 1, lng: 1 }]));
    recordBody('A/no-token', r.body);
    check('A1  ADMIN_TOKEN unset → POST /api/cities/add is 403 (fail-closed, not open)', r.status === 403, 'got ' + r.status);
    check('A2  no db file was created', !existsSync(TEST_DB_FILE));
    check('A3  no db/cities-*.json changed at all', dbFingerprint() === DB_BEFORE);
} finally { srvA.kill('SIGKILL'); }
await sleep(700);

// ─────────────────────────────────────────────────────────────────────────────
// PHASE B — ADMIN_TOKEN configured: auth, body limit, malformed input, authorised flow.
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── B. authentication, body limit, malformed input, authorised write ──');
const PORT_B = 8212;
const srvB = spawnServer(PORT_B, { ADMIN_TOKEN: TOKEN });
try {
    if (!await waitReady(PORT_B, 30000)) throw new Error('server B never became ready');
    const JSONH = { 'Content-Type': 'application/json' };
    const AUTH = { ...JSONH, Authorization: 'Bearer ' + TOKEN };
    const payload = JSON.stringify([{ nameAr: 'مدينة الاختبار', nameEn: 'Testopolis', lat: 1.5, lng: 2.5, type: 'city' }]);

    // (1) unauthenticated / wrong credentials → blocked, and (12) nothing mutated
    for (const [label, hdrs] of [
        ['no credentials', JSONH],
        ['wrong bearer token', { ...JSONH, Authorization: 'Bearer not-the-token' }],
        ['bearer of the right LENGTH but wrong value', { ...JSONH, Authorization: 'Bearer ' + 'x'.repeat(TOKEN.length) }],
        ['token in the query string, wrong value', JSONH],
    ]) {
        const p = label.includes('query string') ? `/api/cities/add?cc=${TEST_CC}&token=wrong` : `/api/cities/add?cc=${TEST_CC}`;
        const r = await post(PORT_B, p, hdrs, payload);
        recordBody('B/' + label, r.body);
        check(`B1  ${label} → 401`, r.status === 401, 'got ' + r.status);
        check(`B2  ${label} → no db file created`, !existsSync(TEST_DB_FILE));
    }
    check('B3  after every rejected write, db/cities-*.json is byte-identical', dbFingerprint() === DB_BEFORE);

    // auth is evaluated BEFORE the body is even read: an oversized unauthenticated body
    // must still come back 401, never 413 — that is what "auth before processing" means.
    {
        const huge = 'x'.repeat(MAX_BODY + 8192);
        const r = await post(PORT_B, `/api/cities/add?cc=${TEST_CC}`, JSONH, huge);
        recordBody('B/oversized-unauth', r.body);
        check('B4  oversized body WITHOUT auth → 401, not 413 (auth runs first)', r.status === 401, 'got ' + r.status);
        check('B5  … and still no db file', !existsSync(TEST_DB_FILE));
    }

    // wrong method / wrong content-type
    {
        const g = await get(PORT_B, `/api/cities/add?cc=${TEST_CC}`);
        recordBody('B/GET', g.body);
        check('B6  GET /api/cities/add → 405', g.status === 405, 'got ' + g.status);
        const o = await reqRaw(PORT_B, 'OPTIONS', `/api/cities/add?cc=${TEST_CC}`, {}, null);
        check('B7  OPTIONS preflight is no longer answered 204 with ACAO:*',
            o.status === 405 && !o.headers['access-control-allow-origin'],
            'status ' + o.status + ' acao=' + (o.headers['access-control-allow-origin'] || 'none'));
        const t = await post(PORT_B, `/api/cities/add?cc=${TEST_CC}`, { 'Content-Type': 'text/plain', Authorization: 'Bearer ' + TOKEN }, payload);
        recordBody('B/text-plain', t.body);
        check('B8  authorised but Content-Type: text/plain → 415', t.status === 415, 'got ' + t.status);
        check('B9  … and no db file', !existsSync(TEST_DB_FILE));
    }

    // (2) oversized body WITH auth → 413, enforced while the stream is still arriving
    {
        const huge = JSON.stringify(Array.from({ length: 4000 }, (_, i) => ({ nameAr: 'ح'.repeat(20), nameEn: 'Flood' + i, lat: 1, lng: 1 })));
        check('B10 the oversize probe really is over the limit', huge.length > MAX_BODY, huge.length + ' B > ' + MAX_BODY + ' B');
        const r = await post(PORT_B, `/api/cities/add?cc=${TEST_CC}`, AUTH, huge);
        recordBody('B/oversized-auth', r.body);
        check('B11 authorised oversized body → 413', r.status === 413, 'got ' + r.status);
        check('B12 413 body says too_large and nothing else', /"error"\s*:\s*"too_large"/.test(r.body), r.body.slice(0, 120));
        check('B13 413 wrote no db file', !existsSync(TEST_DB_FILE));
    }
    // a body just UNDER the limit must be accepted — proves the cap is a ceiling, not a wall
    {
        const filler = Array.from({ length: 150 }, (_, i) => ({ nameAr: 'حشو' + i, nameEn: 'Filler' + i, lat: 1, lng: 1 }));
        const body = JSON.stringify(filler);
        check('B14 the under-limit probe really is under the limit', body.length < MAX_BODY, body.length + ' B < ' + MAX_BODY + ' B');
        const r = await post(PORT_B, `/api/cities/add?cc=${TEST_CC}`, AUTH, body);
        recordBody('B/under-limit', r.body);
        check('B15 authorised body under the limit → 200', r.status === 200, 'got ' + r.status);
        rmSync(TEST_DB_FILE, { force: true });
    }

    // (11) malformed input fails safely
    for (const [label, body, want] of [
        ['invalid JSON', '{not json at all', 400],
        ['JSON that is not an array', '{"a":1}', 400],
        ['empty array', '[]', 400],
        ['empty body', '', 400],
    ]) {
        const r = await post(PORT_B, `/api/cities/add?cc=${TEST_CC}`, AUTH, body);
        recordBody('B/' + label, r.body);
        check(`B16 ${label} → ${want}`, r.status === want, 'got ' + r.status);
        check(`B17 ${label} → no db file`, !existsSync(TEST_DB_FILE));
    }
    {
        const r = await post(PORT_B, `/api/cities/add?cc=TOO-LONG`, AUTH, payload);
        recordBody('B/bad-cc', r.body);
        check('B18 invalid country code → 400', r.status === 400, 'got ' + r.status);
    }

    // (4) the authorised flow still works end to end
    {
        const r = await post(PORT_B, `/api/cities/add?cc=${TEST_CC}`, AUTH, payload);
        recordBody('B/authorised', r.body);
        let j = null; try { j = JSON.parse(r.body); } catch (_) {}
        check('B19 authorised write → 200', r.status === 200, 'got ' + r.status);
        check('B20 authorised write reports the city as added', !!j && j.ok === true && j.added === 1, r.body.slice(0, 120));
        check('B21 authorised write really created the db file', existsSync(TEST_DB_FILE));
        const q = await post(PORT_B, `/api/cities/add?cc=${TEST_CC}&token=${TOKEN}`, JSONH, payload);
        check('B22 the ?token= form authenticates too', q.status === 200, 'got ' + q.status);
        rmSync(TEST_DB_FILE, { force: true });
        check('B23 test artefact removed again', !existsSync(TEST_DB_FILE));
    }

    // rate-limit classification
    {
        const w = await post(PORT_B, `/api/cities/add?cc=${TEST_CC}`, JSONH, '[]');
        check('B24 /api/cities/add is classified tier=write', w.headers['x-ratelimit-tier'] === 'write', 'got ' + w.headers['x-ratelimit-tier']);
        check('B25 the write tier is far tighter than the read tier', Number(w.headers['x-ratelimit-limit']) === 60, 'got ' + w.headers['x-ratelimit-limit']);
        const c = await get(PORT_B, '/api/cities?cc=sa');
        check('B26 /api/cities stays tier=cheap at 300', c.headers['x-ratelimit-tier'] === 'cheap' && Number(c.headers['x-ratelimit-limit']) === 300,
            c.headers['x-ratelimit-tier'] + '/' + c.headers['x-ratelimit-limit']);
        const s = await post(PORT_B, '/api/place-selected', JSONH, '{}');
        check('B27 /api/place-selected moved from cheap to tier=write', s.headers['x-ratelimit-tier'] === 'write', 'got ' + s.headers['x-ratelimit-tier']);
        const a = await get(PORT_B, '/api/admin/discovered-cities');
        check('B28 /api/admin/* is tier=admin and still 401 without a token',
            a.headers['x-ratelimit-tier'] === 'admin' && a.status === 401, a.headers['x-ratelimit-tier'] + '/' + a.status);
        const ah = await get(PORT_B, '/admin/discovered-cities');
        check('B29 /admin/* (HTML) is now rate-limited as tier=admin', ah.headers['x-ratelimit-tier'] === 'admin', 'got ' + ah.headers['x-ratelimit-tier']);
        recordBody('B/admin-401', a.body); recordBody('B/admin-html-401', ah.body);
    }

    // The other body-capped write routes must deliver a real 413 too — not an
    // ECONNRESET. This is the regression that the first run of this suite caught.
    {
        const flood = 'x'.repeat(512 * 1024);
        const r = await post(PORT_B, '/api/place-selected', JSONH, flood);
        recordBody('B/place-selected-oversized', r.body);
        check('B30 /api/place-selected oversized body → a real 413 reaches the client',
            r.status === 413, 'got ' + (r.status === 0 ? 'connection error ' + r.err : r.status));
        const a = await post(PORT_B, '/api/admin/discovered-cities/promote-preview', AUTH, flood);
        recordBody('B/admin-oversized', a.body);
        check('B31 admin promote-preview oversized body → a real 413 reaches the client',
            a.status === 413, 'got ' + (a.status === 0 ? 'connection error ' + a.err : a.status));
        const rv = await post(PORT_B, '/api/admin/discovered-cities/review', AUTH, flood);
        recordBody('B/admin-review-oversized', rv.body);
        check('B32 admin review oversized body → a real 413 reaches the client',
            rv.status === 413, 'got ' + (rv.status === 0 ? 'connection error ' + rv.err : rv.status));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // (3) forged forwarding headers must not mint rate-limit buckets.
    // The probe reproduces the PRODUCTION wire format: an edge proxy appends the peer it
    // accepted, so what the origin sees when a client behind Cloudflare tries to spoof is
    // "<client junk>, <real peer>". A resolver that reads the left-hand side sees a new
    // identity every request; one that reads the trusted side sees the same one.
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n── C. forged X-Forwarded-For / CF-Connecting-IP (trusted-proxy model) ──');
    const EDGE_PEER = '203.0.113.200';
    const rem = r => Number(r.headers['x-ratelimit-remaining']);
    const strictlyFalling = xs => xs.every((v, i) => i === 0 || v === xs[i - 1] - 1);

    async function series(makeHeaders, n) {
        const out = [];
        for (let i = 0; i < n; i++) out.push(rem(await get(PORT_B, '/api/cities?cc=sa', makeHeaders(i))));
        return out;
    }
    {
        const a = await series(i => ({ 'X-Forwarded-For': `198.51.100.${10 + i}, ${EDGE_PEER}` }), 6);
        check('C1  rotating the CLIENT half of X-Forwarded-For does not reset the counter',
            strictlyFalling(a), a.join(', '));
    }
    {
        const b = await series(i => ({ 'X-Forwarded-For': `198.51.100.${40 + i}`, 'CF-Connecting-IP': EDGE_PEER }), 6);
        check('C2  with CF-Connecting-IP present, X-Forwarded-For is ignored entirely',
            strictlyFalling(b), b.join(', '));
    }
    {
        const c = await series(i => ({ 'X-Forwarded-For': `${EDGE_PEER}, 10.0.0.${5 + i}` }), 5);
        check('C3  a private-range trailing hop is skipped, not used as the identity',
            strictlyFalling(c), c.join(', '));
    }
    {
        // A single-value X-Forwarded-For is the shape seen only when NOTHING appended to it,
        // i.e. the request did not traverse the edge. Documented as the residual risk; the
        // assertion here records the behaviour rather than claiming it is prevented.
        const d = await series(i => ({ 'X-Forwarded-For': `198.51.100.${80 + i}` }), 3);
        check('C4  [documented residual] a bare single-value XFF is still honoured in cloudflare mode',
            !strictlyFalling(d), d.join(', '));
    }

} finally { srvB.kill('SIGKILL'); rmSync(TEST_DB_FILE, { force: true }); }
await sleep(700);

// ─────────────────────────────────────────────────────────────────────────────
// PHASE D — TP_TRUSTED_PROXY=none: forwarding headers are ignored outright.
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── D. TP_TRUSTED_PROXY=none — no forwarding header is trusted at all ──');
const PORT_D = 8213;
const srvD = spawnServer(PORT_D, { ADMIN_TOKEN: TOKEN, TP_TRUSTED_PROXY: 'none' });
try {
    if (!await waitReady(PORT_D, 30000)) throw new Error('server D never became ready');
    const rem = r => Number(r.headers['x-ratelimit-remaining']);
    const falling = xs => xs.every((v, i) => i === 0 || v === xs[i - 1] - 1);
    const out = [];
    for (let i = 0; i < 6; i++) {
        out.push(rem(await get(PORT_D, '/api/cities?cc=sa', {
            'X-Forwarded-For': `198.51.100.${100 + i}`,
            'CF-Connecting-IP': `203.0.113.${100 + i}`,
        })));
    }
    check('D1  every forwarding header rotated at once still shares one bucket', falling(out), out.join(', '));
} finally { srvD.kill('SIGKILL'); }
await sleep(700);

// ─────────────────────────────────────────────────────────────────────────────
// PHASE E — nothing else moved: public reads, city/prayer pages, SSR, SEO.
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── E. regression: public reads, city pages, prayer pages, SSR, SEO ──');
const PORT_E = 8214;
const srvE = spawnServer(PORT_E, { ADMIN_TOKEN: TOKEN });
try {
    if (!await waitReady(PORT_E, 30000)) throw new Error('server E never became ready');

    // (5) existing public read APIs
    {
        const r = await get(PORT_E, '/api/cities?cc=sa');
        let arr = null; try { arr = JSON.parse(r.body); } catch (_) {}
        check('E1  GET /api/cities?cc=sa → 200 with a non-empty array', r.status === 200 && Array.isArray(arr) && arr.length > 0,
            r.status + ' n=' + (Array.isArray(arr) ? arr.length : 'n/a'));
        check('E2  /api/cities item shape is unchanged (slug/lat/lng/names/nameAr/nameEn/priority)',
            !!arr && arr[0] && ['slug', 'lat', 'lng', 'names', 'nameAr', 'nameEn', 'priority'].every(k => k in arr[0]),
            arr && arr[0] ? Object.keys(arr[0]).join(',') : 'n/a');
        check('E3  /api/cities exposes no internal field (_t, search_blob, id, source)',
            !!arr && arr[0] && !['_t', 'search_blob', 'id', 'source', 'source_id'].some(k => k in arr[0]),
            arr && arr[0] ? Object.keys(arr[0]).join(',') : 'n/a');
        const st = await get(PORT_E, '/api/supabase-status');
        check('E4  GET /api/supabase-status → 200', st.status === 200, 'got ' + st.status);
        const bs = await get(PORT_E, '/api/place-by-slug?slug=riyadh');
        check('E5  GET /api/place-by-slug → 200', bs.status === 200, 'got ' + bs.status);
        recordBody('E/cities', r.body); recordBody('E/status', st.body); recordBody('E/by-slug', bs.body);
    }
    // (6) city pages  /  (7) prayer pages  /  (8) SSR  /  (9) SEO
    for (const [label, route, needles] of [
        ['city page (ar)', '/prayer-times-in-riyadh', ['<h1', 'rel="canonical"', 'hreflang']],
        ['city page (en)', '/en/prayer-times-in-riyadh', ['<h1', 'rel="canonical"', 'hreflang']],
        ['country page', '/prayer-times-in-saudi-arabia', ['<h1', 'rel="canonical"']],
        ['prayer worldwide hub', '/prayer-times-worldwide', ['<h1', 'rel="canonical"']],
        ['qibla city page', '/qibla-in-riyadh', ['<h1', 'rel="canonical"']],
        ['moon hub', '/moon', ['<h1', 'rel="canonical"']],
        ['home', '/', ['rel="canonical"']],
    ]) {
        const r = await get(PORT_E, route);
        recordBody('E/' + route, r.body.slice(0, 4000));
        check(`E6  ${label} ${route} → 200`, r.status === 200, 'got ' + r.status);
        for (const n of needles) check(`E7  ${label} still contains ${n}`, r.body.includes(n));
        check(`E8  ${label} is not rate-limited (public HTML untouched)`, !r.headers['x-ratelimit-tier'],
            r.headers['x-ratelimit-tier'] || 'no header');
    }
    {
        // legacy moon routes must still 301 exactly where they did before
        const m1 = await get(PORT_E, '/moon-today');
        check('E9a /moon-today still 301s to /moon', m1.status === 301 && m1.headers.location === '/moon',
            m1.status + ' → ' + (m1.headers.location || 'none'));
        const m2 = await get(PORT_E, '/moon-today-in-riyadh');
        check('E9b /moon-today-in-riyadh still 301s to the nested moon route',
            m2.status === 301 && m2.headers.location === '/moon/saudi-arabia/riyadh/today',
            m2.status + ' → ' + (m2.headers.location || 'none'));
    }
    {
        const rb = await get(PORT_E, '/robots.txt');
        check('E9  /robots.txt → 200', rb.status === 200, 'got ' + rb.status);
        const sm = await get(PORT_E, '/sitemap.xml');
        check('E10 /sitemap.xml → 200 and is still a sitemap index', sm.status === 200 && sm.body.includes('<sitemapindex'), 'got ' + sm.status);
        check('E11 sitemap is not rate-limited', !sm.headers['x-ratelimit-tier'], sm.headers['x-ratelimit-tier'] || 'no header');
        recordBody('E/robots', rb.body); recordBody('E/sitemap', sm.body.slice(0, 2000));
    }
} finally { srvE.kill('SIGKILL'); }

// ─────────────────────────────────────────────────────────────────────────────
// PHASE H — the body ceiling must DROP what it refuses, not merely flag it.
//
// A reader that sets a "too big" flag and keeps concatenating still holds the whole body
// in memory; the 413 it eventually sends does not make that safe. The only way to observe
// the difference from outside is to bound the heap and then exceed it: a server that
// buffers a 400 MB upload inside a 192 MB heap cannot answer at all, while one that drops
// and drains answers 413 and stays up. Measured beforehand: the application itself boots
// and serves its heaviest routes comfortably under this cap, so a failure here is the
// body reader and nothing else.
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── H. oversized bodies are dropped, not buffered (192 MB heap, 400 MB upload) ──');
const PORT_H = 8215;
const srvH = spawnServer(PORT_H, { ADMIN_TOKEN: TOKEN }, ['--max-old-space-size=192']);
try {
    check('H1  the app boots under the bounded heap (so any failure below is the body reader)',
        await waitReady(PORT_H, 40000));
    const heavy = await get(PORT_H, '/prayer-times-in-riyadh');
    check('H2  … and still serves a heavy SSR route under that heap', heavy.status === 200, 'got ' + heavy.status);

    const FLOOD = 400 * 1024 * 1024;
    const flood = Buffer.alloc(FLOOD, 0x78).toString('latin1');
    const AUTHH = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN };

    const a = await post(PORT_H, '/api/cities/add?cc=' + TEST_CC, AUTHH, flood);
    check('H3  /api/cities/add: a 400 MB upload still answers 413 inside a 192 MB heap',
        a.status === 413, 'got ' + (a.status === 0 ? 'connection error ' + a.err : a.status));
    check('H4  … and created no db file', !existsSync(TEST_DB_FILE));

    const b = await post(PORT_H, '/api/admin/discovered-cities/promote-preview', AUTHH, flood);
    check('H5  admin promote-preview: same, 413 inside a 192 MB heap',
        b.status === 413, 'got ' + (b.status === 0 ? 'connection error ' + b.err : b.status));

    const c = await post(PORT_H, '/api/place-selected', { 'Content-Type': 'application/json' }, flood);
    check('H6  /api/place-selected: same, 413 inside a 192 MB heap',
        c.status === 413, 'got ' + (c.status === 0 ? 'connection error ' + c.err : c.status));

    const alive = await get(PORT_H, '/health');
    check('H7  the server is still alive and healthy after all three floods', alive.status === 200, 'got ' + alive.status);
} finally { srvH.kill('SIGKILL'); rmSync(TEST_DB_FILE, { force: true }); }
await sleep(700);

// ─────────────────────────────────────────────────────────────────────────────
// (10) no secret, no stack trace, no filesystem path in anything we were served.
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── F. information disclosure across every response captured above ──');
{
    let leaks = [];
    for (const { label, body } of collected) {
        for (const s of SECRET_NEEDLES) if (body.includes(s)) leaks.push(`${label}: secret needle`);
        for (const re of DISCLOSURE_NEEDLES) if (re.test(body)) leaks.push(`${label}: ${re}`);
    }
    check(`F1  ${collected.length} captured responses contain no secret, stack trace or absolute path`,
        leaks.length === 0, leaks.slice(0, 4).join(' | '));
    check('F2  the disclosure probe is wired to something (bodies really were captured)', collected.length >= 25, 'n=' + collected.length);
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── G. final state ──');
check('G1  the reserved test db file does not exist', !existsSync(TEST_DB_FILE));
check('G2  every db/cities-*.json is byte-identical to the start of the run', dbFingerprint() === DB_BEFORE);

exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('\n✗ suite aborted: ' + (e && e.message || e));
    exitCode = 1;
} finally {
    rmSync(TEST_DB_FILE, { force: true });
}

console.log(`\n═══ ${pass} passed, ${fail} failed ═══`);
process.exit(exitCode);
