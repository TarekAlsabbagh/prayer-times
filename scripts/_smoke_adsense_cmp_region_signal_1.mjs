// ADSENSE-CMP-REGIONAL-SUPPRESSION-SERVER-SIGNAL-1 §1 — region-signal diagnostic verification.
//
// The endpoint answers one question: does a trusted country header reach Node in production?
// This suite proves it is (a) admin-only via HEADER auth with the query-string form REJECTED,
// (b) privacy-minimal, and (c) able to DETECT a country header, report its ABSENCE, and report a
// client-supplied value VERBATIM — that last property is what makes the production spoof test
// meaningful: if the client's own value comes back, the header is not trusted.
//
//   node scripts/_smoke_adsense_cmp_region_signal_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN = 'region-signal-smoke-9c3f';
const FAKE_SERVICE_KEY = 'SUPABASE_SERVICE_ROLE_KEY_MUST_NOT_LEAK';
const REAL_LOOKING_IP = '203.0.113.77';
const SECOND_IP = '198.51.100.9';
const SECRET_COOKIE = 'sessionSecret=DO_NOT_ECHO_ME';
const ALLOWED_KEYS = ['trustedCountrySignal', 'countryHeaderPresent', 'source', 'candidateHeaderNames'];

let pass = 0, fail = 0;
const check = (l, ok, extra) => { ok ? pass++ : fail++; console.log((ok ? '✓ ' : '✗ ') + l + (extra ? '   ->  ' + extra : '')); };

function req(port, method, p, headers) {
    return new Promise(r => {
        const q = http.request({ host: '127.0.0.1', port, path: p, method, headers: headers || {} }, s => {
            let b = ''; s.on('data', c => b += c); s.on('end', () => r({ status: s.statusCode, headers: s.headers, body: b }));
        });
        q.on('error', e => r({ status: 0, headers: {}, body: '', err: String(e.code || e) }));
        q.end();
    });
}
const get = (port, p, h) => req(port, 'GET', p, h);
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function ready(port) { for (let i = 0; i < 120; i++) { if ((await get(port, '/health')).status === 200) return true; await sleep(400); } return false; }
function boot(port, env) {
    return spawn(process.execPath, ['server.js'], {
        cwd: ROOT,
        env: { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: FAKE_SERVICE_KEY, ...env },
        stdio: ['ignore', 'ignore', 'ignore']
    });
}
const collected = [];
const rec = b => collected.push(String(b || ''));
const RS = '/api/admin/region-signal';

console.log('=== ADSENSE-CMP-REGIONAL-SUPPRESSION-SERVER-SIGNAL-1 section 1 - region signal ===\n');
let exitCode = 1;
try {

// -- A. fail-closed when ADMIN_TOKEN is not configured -----------------------
console.log('-- A. fail-closed --');
const PA = 8401, sA = boot(PA, { ADMIN_TOKEN: '' });
try {
    if (!await ready(PA)) throw new Error('server A not ready');
    const r = await get(PA, RS, { Authorization: 'Bearer ' + TOKEN });
    rec(r.body);
    check('A1  no ADMIN_TOKEN -> 403, never open', r.status === 403, 'got ' + r.status);
} finally { sA.kill('SIGKILL'); }
await sleep(700);

// -- B. header-only auth, shape, detection, privacy --------------------------
console.log('\n-- B. header-only auth, shape, detection, privacy --');
const PB = 8402, sB = boot(PB, { ADMIN_TOKEN: TOKEN });
try {
    if (!await ready(PB)) throw new Error('server B not ready');
    const BEARER = { Authorization: 'Bearer ' + TOKEN };

    for (const [label, h] of [['no credentials', {}], ['wrong bearer', { Authorization: 'Bearer nope' }],
                              ['wrong X-Admin-Token', { 'X-Admin-Token': 'nope' }]]) {
        const r = await get(PB, RS, h); rec(r.body);
        check('B1  ' + label + ' -> 401', r.status === 401, 'got ' + r.status);
    }

    // THE required change: the query-string form must NOT authenticate, even with the right token.
    {
        const r = await get(PB, RS + '?token=' + TOKEN); rec(r.body);
        check('B2  ?token=<CORRECT token> is REJECTED 401 (no query-string auth)', r.status === 401, 'got ' + r.status);
        const r2 = await get(PB, RS + '?token=' + TOKEN, { Authorization: 'Bearer nope' }); rec(r2.body);
        check('B3  a correct ?token= cannot rescue a wrong header', r2.status === 401, 'got ' + r2.status);
    }
    // and the shared admin dashboard is deliberately NOT changed
    {
        const r = await get(PB, '/api/admin/discovered-cities?token=' + TOKEN);
        check('B4  the existing admin dashboard still accepts ?token= (helper untouched)', r.status === 200, 'got ' + r.status);
    }

    {
        const r = await get(PB, RS, { 'X-Admin-Token': TOKEN }); rec(r.body);
        check('B5  X-Admin-Token header authenticates -> 200', r.status === 200, 'got ' + r.status);
    }
    {
        const r = await req(PB, 'POST', RS, BEARER); rec(r.body);
        check('B6  POST -> 405 (read-only endpoint)', r.status === 405, 'got ' + r.status);
    }

    // (1) DETECTS a country header and returns its VALUE as the signal
    {
        const r = await get(PB, RS, { ...BEARER, 'CF-IPCountry': 'DE' }); rec(r.body);
        let j = null; try { j = JSON.parse(r.body); } catch (_) {}
        check('B7  200 with valid JSON', r.status === 200 && !!j, 'got ' + r.status);
        check('B8  trustedCountrySignal is the country VALUE', !!j && j.trustedCountrySignal === 'DE', j && String(j.trustedCountrySignal));
        check('B9  countryHeaderPresent true, source=cf-ipcountry',
            !!j && j.countryHeaderPresent === true && j.source === 'cf-ipcountry', j && (j.countryHeaderPresent + '/' + j.source));
        check('B10 candidateHeaderNames lists the name only', !!j && (j.candidateHeaderNames || []).includes('cf-ipcountry'),
            j && JSON.stringify(j.candidateHeaderNames));
        check('B11 response has EXACTLY the four allowed keys',
            !!j && JSON.stringify(Object.keys(j).sort()) === JSON.stringify([...ALLOWED_KEYS].sort()), j && Object.keys(j).join(','));
    }

    // (2) reports ABSENCE correctly - the production-relevant branch
    {
        const r = await get(PB, RS, BEARER); rec(r.body);
        let j = null; try { j = JSON.parse(r.body); } catch (_) {}
        check('B12 no country header -> trustedCountrySignal null', !!j && j.trustedCountrySignal === null, j && String(j.trustedCountrySignal));
        check('B13 countryHeaderPresent false, source null, never fabricated',
            !!j && j.countryHeaderPresent === false && j.source === null, j && (j.countryHeaderPresent + '/' + j.source));
    }

    // (3) not hard-wired to Cloudflare
    {
        const r = await get(PB, RS, { ...BEARER, 'X-Vercel-IP-Country': 'FR' }); rec(r.body);
        let j = null; try { j = JSON.parse(r.body); } catch (_) {}
        check('B14 a non-Cloudflare country header is detected, source=other',
            !!j && j.trustedCountrySignal === 'FR' && j.source === 'other', j && (j.trustedCountrySignal + '/' + j.source));
    }

    // (4) SPOOF-TEST SUPPORT: a client-supplied value comes back verbatim, which is exactly how
    //     production will reveal whether the edge overwrites it.
    {
        const a = await get(PB, RS, { ...BEARER, 'CF-IPCountry': 'DE' });
        const b = await get(PB, RS, { ...BEARER, 'CF-IPCountry': 'SA' });
        let ja = null, jb = null; try { ja = JSON.parse(a.body); jb = JSON.parse(b.body); } catch (_) {}
        check('B15 two different client-supplied values are reported distinctly (spoof test is meaningful)',
            !!ja && !!jb && ja.trustedCountrySignal === 'DE' && jb.trustedCountrySignal === 'SA',
            ja && jb && (ja.trustedCountrySignal + ' vs ' + jb.trustedCountrySignal));
    }

    // (5) PRIVACY - no IP, cookie, token or full header dump is ever echoed
    {
        const r = await get(PB, RS, {
            ...BEARER,
            'X-Forwarded-For': REAL_LOOKING_IP + ', ' + SECOND_IP,
            'CF-Connecting-IP': REAL_LOOKING_IP,
            'Cookie': SECRET_COOKIE,
            'CF-Ray': 'abc123def456-MRS'
        });
        rec(r.body);
        let j = null; try { j = JSON.parse(r.body); } catch (_) {}
        check('B16 response contains NO IP address value', !r.body.includes(REAL_LOOKING_IP) && !r.body.includes(SECOND_IP));
        check('B17 response contains NO cookie value', !r.body.includes('DO_NOT_ECHO_ME'));
        check('B18 response contains NO token value', !r.body.includes(TOKEN));
        check('B19 no full header dump - cookie/authorization names are absent',
            !!j && !(j.candidateHeaderNames || []).some(n => n === 'cookie' || n === 'authorization' || n === 'x-forwarded-for'),
            j && JSON.stringify(j.candidateHeaderNames));
        check('B20 cf-ray colo is not reported at all', !r.body.includes('MRS'));
    }

    // (6) response hygiene + rate-limit class
    {
        const r = await get(PB, RS, BEARER);
        check('B21 noindex + no-store headers',
            (r.headers['x-robots-tag'] || '').includes('noindex') && (r.headers['cache-control'] || '').includes('no-store'));
        check('B22 classified under the admin rate-limit tier', r.headers['x-ratelimit-tier'] === 'admin', r.headers['x-ratelimit-tier']);
    }

    // (7) nothing else moved - no behaviour change shipped in this step
    {
        const home = await get(PB, '/');
        const cities = await get(PB, '/api/cities?cc=sa');
        const city = await get(PB, '/prayer-times-in-riyadh');
        check('B23 homepage still 200', home.status === 200, 'got ' + home.status);
        check('B24 /api/cities still 200', cities.status === 200, 'got ' + cities.status);
        check('B25 a city page still 200 with canonical', city.status === 200 && city.body.includes('rel="canonical"'), 'got ' + city.status);
        check('B26 the custom cookie banner is STILL shipped (nothing suppressed yet)', home.body.includes('footer-cookie.js'));
        check('B27 the AdSense tag is STILL present and unchanged', home.body.includes('adsbygoogle.js?client=ca-pub-'));
        check('B28 no ad slot was introduced', !home.body.includes('<ins class="adsbygoogle"'));
        check('B29 Consent Mode defaults still ship unchanged',
            home.body.includes("gtag('consent','default'") && home.body.includes("'wait_for_update':500"));
    }
} finally { sB.kill('SIGKILL'); }

// -- C. disclosure sweep across every captured body --------------------------
console.log('\n-- C. disclosure --');
{
    const bad = [];
    for (const b of collected) {
        for (const needle of [TOKEN, FAKE_SERVICE_KEY, REAL_LOOKING_IP, 'DO_NOT_ECHO_ME']) if (b.includes(needle)) bad.push(needle);
        for (const re of [/\bat\s+\w+\s+\(.*:\d+:\d+\)/, /node_modules/, /[A-Za-z]:\\Users\\/]) if (re.test(b)) bad.push(String(re));
    }
    check('C1  ' + collected.length + ' captured responses leak nothing', bad.length === 0, bad.slice(0, 3).join(' | ') || 'clean');
    check('C2  the disclosure probe actually captured bodies', collected.length >= 10, 'n=' + collected.length);
}

exitCode = fail === 0 ? 0 : 1;
} catch (e) { console.error('\n✗ aborted: ' + (e && e.message || e)); exitCode = 1; }
console.log('\n=== ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(exitCode);
