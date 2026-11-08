// MOON-MONTH-SHELL-MEMO-1 (perf/moon-monthly-render-cache-1) — local regression guard for the memoised stripped
//   shell of the nested moon MONTH page (/[lang/]moon/{country}/{city}/{yyyy}/{mm}). No network beyond loopback:
//   every server runs with the outbound guard, ADSENSE_CLIENT=off, Supabase / GA / LocationIQ keys empty, TZ=UTC,
//   SITE_URL=https://timesprayers.com, NODE_ENV=production, ports 9950-9999 only, and is killed at the end.
//   Servers (both from THIS tree, same TEST-ONLY clock: a preload written to a temp dir by this script, never in the
//   repo, inert unless TP_SMOKE_CLOCK_FILE is set; it pins Date to the instant in that file and follows its changes):
//     OFF = TP_MOON_SHELL_MEMO=0 (the previous path verbatim: decode the template, strip late)
//     ON  = default (the memoised shell)
//   [S] source: only server.js (+ this script) differ from the base; js/moon.js and db/hijri/umm-al-qura.json untouched;
//       the two replaced lines are exactly the template decode and the late-strip condition; CRLF kept.
//   [U] the memo code itself, extracted from server.js and run with stubs: hit / build / skip, the byte cap (no
//       re-strip while over it), the kill switch (no counter, no timer), one entry only, the [moon-shell] line format
//       (counts + one size; no path, slug, UA or id) and its silence without activity.
//   [R] the month regex is a subset of _isMoonCityPageSsr (so the late strip it replaces always applied) and matches
//       the month shape only (not hub / year / day / today / legacy).
//   [D] determinism first: OFF twice and ON twice give the same bytes after the nonce mask.
//   [E] equivalence gate: >= 300 month URLs that answer 200 (10 languages, curated + GeoNames db cities) x identity /
//       br x CF-IPCountry SA (outside the region) / DE (inside): OFF == ON byte for byte after the nonce mask
//       (status, the response headers and the decoded body).
//   [N] nonce: a fresh nonce per response on ON, the body nonces equal the CSP header's, no __TP_CSP_NONCE__ left,
//       the same number of nonce positions as OFF.
//   [T] time boundaries (Riyadh midnight, the Riyadh month change, the UTC year change): OFF == ON at each instant,
//       and the instant really changed the page (sanity: the clock moved).
//   [X] non-200 forms (301 wrong country, 404 bad month / out-of-window year, 410 day page) and a local 503 from the
//       shed gate when a burst triggers one: OFF == ON.
//   [P] info only: median client latency of identity month renders OFF vs ON (3 rounds, spaced under the shed refill).
//   node scripts/_smoke_moon_monthly_render_cache_1.mjs   (env TP_GUARD, TP_SMOKE_PORT (9950-9998), TP_BASE_REF)
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const BASE_REF = process.env.TP_BASE_REF || '35cf369';
const P0 = Number(process.env.TP_SMOKE_PORT || 9960);
if (!(P0 >= 9950 && P0 + 1 <= 9999)) throw new Error('TP_SMOKE_PORT must keep both ports inside 9950-9999');
if (!fs.existsSync(GUARD)) throw new Error('outbound guard not found: ' + GUARD);
const PORT = { off: P0, on: P0 + 1 };
const LANGS = ['', 'en/', 'fr/', 'tr/', 'ur/', 'de/', 'id/', 'es/', 'bn/', 'ms/'];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 smoke';
const T0 = '2026-11-08T12:00:00.000Z';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let pass = 0, fail = 0; const G = {};
const ok = (g, c, n, d) => {
    G[g] = G[g] || { p: 0, f: 0 };
    if (c) { pass++; G[g].p++; if (process.env.TP_SMOKE_VERBOSE) console.log('  ok ' + g + ' ' + n); }
    else { fail++; G[g].f++; console.log('  FAIL ' + g + ' ' + n + (d ? '  :: ' + String(d).slice(0, 1500) : '')); }
};

// ---------------------------------------------------------------- [S] source
console.log('[S] source');
{
    const git = (...a) => execFileSync('git', ['-C', ROOT, ...a], { encoding: 'utf8' });
    const changed = git('diff', '--name-only', BASE_REF, '--').split('\n').filter(Boolean);
    const untracked = git('ls-files', '--others', '--exclude-standard', '--', 'server.js', 'js', 'db', 'index.html', 'css').split('\n').filter(Boolean);
    const allowed = new Set(['server.js', 'scripts/_smoke_moon_monthly_render_cache_1.mjs']);
    ok('S', changed.every((f) => allowed.has(f)), 'only server.js and this script differ from ' + BASE_REF, changed.join(', '));
    ok('S', untracked.length === 0, 'no untracked runtime file', untracked.join(', '));
    for (const f of ['js/moon.js', 'db/hijri/umm-al-qura.json', 'index.html', 'js/app.js', 'css/style.css']) {
        ok('S', git('diff', '--name-only', BASE_REF, '--', f).trim() === '', f + ' untouched');
    }
    const d = git('diff', '-U0', BASE_REF, '--', 'server.js').split('\n');
    const minus = d.filter((l) => l.startsWith('-') && !l.startsWith('---')).map((l) => l.slice(1).trim());
    ok('S', minus.length === 2 && minus[0] === "let html = htmlBuf.toString('utf8');" && minus[1] === 'if (_isMoonCityPageSsr) {',
        'exactly two lines replaced: the template decode and the late-strip condition', JSON.stringify(minus));
    const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
    ok('S', !/(^|[^\r])\n/.test(src), 'server.js keeps CRLF line endings');
    ok('S', (src.match(/_moonMonthShell\(/g) || []).length === 2, '_moonMonthShell defined once and called once');
    ok('S', /process\.env\.TP_MOON_SHELL_MEMO !== '0'/.test(src) && /TP_MOON_SHELL_MEMO_MAX_BYTES/.test(src), 'kill switch + byte cap env');
}

// ---------------------------------------------------------------- [U] memo unit (extracted)
console.log('[U] memo unit');
const SRC = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
{
    const a = SRC.indexOf('const _MSM_ON = ');
    const bMark = 'return shell;\r\n}';
    const b = SRC.indexOf(bMark, a);
    if (a < 0 || b < 0) throw new Error('memo block not found');
    const code = SRC.slice(a, b + bMark.length);
    const mk = (env) => {
        const logs = [], once = [], timers = [];
        let strips = 0;
        const cache = new Map();
        const fakeProcess = { env, once: (ev, fn) => once.push([ev, fn]) };
        const fakeConsole = { log: (s) => logs.push(String(s)) };
        const fakeSetInterval = (fn, ms) => { timers.push([fn, ms]); return { unref() {} }; };
        const strip = (h) => { strips++; return h.replace(/<div id="page-x">[\s\S]*?<\/div>/g, ''); };
        const f = new Function('process', 'console', 'setInterval', '_staticCache', 'path', 'ROOT', 'TP_WORKER_ID', '_stripHtmlForMoonCity', 'Buffer',
            code + '\nreturn { shell: _moonMonthShell, flush: _msmFlush, stat: _msmStat, on: _MSM_ON, max: _MSM_MAX_BYTES, re: _MSM_MONTH_RE };');
        const api = f(fakeProcess, fakeConsole, fakeSetInterval, cache, path, '/r', 3, strip, Buffer);
        return { api, logs, once, timers, cache, strips: () => strips };
    };
    const TPL = '<html><body><div id="page-x">gone</div><div id="page-moon">kept __TP_CSP_NONCE__</div></body></html>';
    const M = '/en/moon/saudi-arabia/riyadh/2026/11';
    const idx = path.join('/r', 'index.html');
    // default: ON
    {
        const t = mk({});
        const buf = Buffer.from(TPL);
        t.cache.set(idx, { data: buf });
        ok('U', t.api.on === true && t.api.max === 1048576, 'default ON, cap 1 MiB');
        ok('U', t.api.shell(buf, '/en/moon/saudi-arabia/riyadh') === null && t.api.shell(buf, '/moon/saudi-arabia/riyadh/2026') === null
            && t.api.shell(buf, '/') === null, 'non-month routes -> null');
        ok('U', t.api.stat.hit + t.api.stat.build + t.api.stat.skip === 0 && t.timers.length === 0, 'non-month routes count nothing, start no timer');
        const s1 = t.api.shell(buf, M);
        ok('U', s1 === '<html><body><div id="page-moon">kept __TP_CSP_NONCE__</div></body></html>', 'build = the strip of the template, nonce marker kept', s1);
        const s2 = t.api.shell(buf, '/moon/saudi-arabia/riyadh/2026/12');
        ok('U', s2 === s1 && t.strips() === 1, 'second month request is a hit without a strip');
        ok('U', t.api.shell(Buffer.from(TPL), M) === null, 'a buffer that is not the preloaded template -> null (old path)');
        ok('U', t.api.stat.build === 1 && t.api.stat.hit === 1 && t.api.stat.skip === 1, 'counters build=1 hit=1 skip=1', JSON.stringify(t.api.stat));
        ok('U', t.timers.length === 1 && t.timers[0][1] === 300000 && t.once.length === 1 && t.once[0][0] === 'SIGTERM', '5 min timer + SIGTERM final, started once');
        t.api.flush('5m');
        const line = t.logs[0] || '';
        ok('U', line === '[moon-shell] worker=3 window=5m hit=1 build=1 skip=1 bytes=' + Buffer.byteLength(s1), 'line format', line);
        ok('U', /^\[moon-shell\] worker=\d+ window=(5m|final) hit=\d+ build=\d+ skip=\d+ bytes=\d+$/.test(line) && !/[\/]|moon\/|riyadh|Mozilla/.test(line.slice(12)),
            'line carries counts and one size only', line);
        t.api.flush('5m');
        ok('U', t.logs.length === 1, 'no line without activity');
        t.api.shell(buf, M); t.once[0][1]();
        ok('U', t.logs[1] === '[moon-shell] worker=3 window=final hit=1 build=0 skip=0 bytes=' + Buffer.byteLength(s1), 'final flush on SIGTERM', t.logs[1]);
        // template replaced (a new preloaded buffer): one entry, rebuilt; the old buffer is no longer the template
        const buf2 = Buffer.from(TPL.replace('kept', 'kept2'));
        t.cache.set(idx, { data: buf2 });
        const s3 = t.api.shell(buf2, M);
        ok('U', s3.includes('kept2') && t.api.stat.build === 1 && t.api.shell(buf, M) === null, 'a new template replaces the single entry; the old buffer takes the old path');
    }
    // kill switch
    {
        const t = mk({ TP_MOON_SHELL_MEMO: '0' });
        const buf = Buffer.from(TPL); t.cache.set(idx, { data: buf });
        ok('U', t.api.on === false && t.api.shell(buf, M) === null && t.strips() === 0, 'TP_MOON_SHELL_MEMO=0 -> null, no strip');
        t.api.flush('5m');
        ok('U', t.timers.length === 0 && t.once.length === 0 && t.logs.length === 0, 'switched off: no timer, no counter, no line');
    }
    // byte cap
    {
        const t = mk({ TP_MOON_SHELL_MEMO_MAX_BYTES: '20' });
        const buf = Buffer.from(TPL); t.cache.set(idx, { data: buf });
        ok('U', t.api.max === 20 && t.api.shell(buf, M) === null && t.api.shell(buf, M) === null && t.strips() === 1, 'over the cap: null (old path), not re-stripped');
        ok('U', t.api.stat.skip === 2 && t.api.stat.build === 0, 'over the cap counts skip', JSON.stringify(t.api.stat));
        t.api.flush('5m');
        ok('U', /bytes=0$/.test(t.logs[0] || ''), 'over the cap: no shell kept (bytes=0)', t.logs[0]);
        const t2 = mk({ TP_MOON_SHELL_MEMO_MAX_BYTES: 'junk' });
        ok('U', t2.api.max === 1048576, 'invalid cap -> default');
    }
}

// ---------------------------------------------------------------- [R] route regex
console.log('[R] route regex');
const MSM_RE = (() => { const m = SRC.match(/const _MSM_MONTH_RE = (\/.*\/);\r\n/); return new Function('return ' + m[1])(); })();
const SSR_RE = (() => { const m = SRC.match(/const _isMoonCityPageSsr = (\/.*\/)\.test\(urlPath\);/); return new Function('return ' + m[1])(); })();
{
    const yes = ['/moon/saudi-arabia/riyadh/2026/11', '/en/moon/france/paris/2031/01', '/ms/moon/ab/b-c/2021/12','/moon/saudi-arabia/riyadh/2026/13'];
    const no = ['/moon/saudi-arabia/riyadh', '/moon/saudi-arabia/riyadh/2026', '/moon/saudi-arabia/riyadh/2026/11/08', '/moon/saudi-arabia/riyadh/today',
        '/moon-in-riyadh/2026-11', '/moon-today-in-riyadh', '/en/moon', '/moon/saudi-arabia/riyadh/2026/11.html', '/xx/moon/a/b/2026/11',
        '/moon/saudi-arabia/riyadh/2026/1', '/moon/saudi-arabia/riyadh/2026/11/', '/moon/Saudi/riyadh/2026/11'];
    for (const u of yes) ok('R', MSM_RE.test(u) && SSR_RE.test(u), 'month shape + late-strip route: ' + u);
    for (const u of no) ok('R', !MSM_RE.test(u), 'not the month shape: ' + u);
}

// ---------------------------------------------------------------- servers
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-smoke-msm-'));
const CLOCK_FILE = path.join(TMP, 'clock.txt');
const CLOCK_PRE = path.join(TMP, 'clock.cjs');
fs.writeFileSync(CLOCK_FILE, T0);
fs.writeFileSync(CLOCK_PRE, `'use strict';
// TEST-ONLY (written by scripts/_smoke_moon_monthly_render_cache_1.mjs to a temp dir; never deployed)
const fs = require('fs');
const F = process.env.TP_SMOKE_CLOCK_FILE;
if (F) {
    const RealDate = Date;
    let t = RealDate.parse(fs.readFileSync(F, 'utf8').trim());
    setInterval(() => { try { const v = RealDate.parse(fs.readFileSync(F, 'utf8').trim()); if (Number.isFinite(v)) t = v; } catch (_e) {} }, 25).unref();
    class FakeDate extends RealDate {
        constructor(...a) { if (a.length === 0) super(t); else super(...a); }
        static now() { return t; }
    }
    FakeDate.parse = RealDate.parse; FakeDate.UTC = RealDate.UTC;
    globalThis.Date = FakeDate;
}
`);
const setClock = async (iso) => { fs.writeFileSync(CLOCK_FILE, iso); await sleep(250); };
const procs = [];
function startServer(tag, port, extra) {
    const env = { ...process.env };
    for (const k of ['TP_MOON_SHELL_MEMO', 'TP_MOON_SHELL_MEMO_MAX_BYTES', 'GA_MEASUREMENT_ID', 'SUPABASE_ANON_KEY', 'LOCATIONIQ_KEY']) delete env[k];
    Object.assign(env, {
        PORT: String(port), WEB_CONCURRENCY: '1', ADSENSE_CLIENT: 'off', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', TZ: 'UTC',
        SITE_URL: 'https://timesprayers.com', NODE_ENV: 'production', TP_SSR_CACHE: '1', TP_REQUEST_OBSERVABILITY: '1',
        GUARD_OUT: path.join(TMP, 'guard-' + tag + '.jsonl'), TP_SMOKE_CLOCK_FILE: CLOCK_FILE,
    }, extra);
    const out = fs.openSync(path.join(TMP, 'server-' + tag + '.out.txt'), 'w');
    const p = spawn(process.execPath, ['-r', GUARD, '-r', CLOCK_PRE, 'server.js'], { cwd: ROOT, env, stdio: ['ignore', out, out], windowsHide: true });
    procs.push(p);
    return p;
}
function killAll() {
    for (const p of procs) {
        try {
            if (process.platform === 'win32') execFileSync('taskkill', ['/PID', String(p.pid), '/T', '/F'], { stdio: 'ignore' });
            else p.kill('SIGKILL');
        } catch (_e) { /* already gone */ }
    }
}
process.on('exit', killAll);
process.on('SIGINT', () => { killAll(); process.exit(130); });

const req = (port, p, { enc = 'identity', cc = 'SA' } = {}) => new Promise((res) => {
    const r = http.request({ host: '127.0.0.1', port, path: p, agent: false, headers: { 'accept-encoding': enc, 'user-agent': UA, 'cf-ipcountry': cc } }, (x) => {
        const c = []; x.on('data', (d) => c.push(d)); x.on('end', () => {
            let raw = Buffer.concat(c);
            try { if (x.headers['content-encoding'] === 'br') raw = zlib.brotliDecompressSync(raw); else if (x.headers['content-encoding'] === 'gzip') raw = zlib.gunzipSync(raw); } catch (_e) { /* compared raw */ }
            res({ st: x.statusCode, h: x.headers, b: raw.toString('utf8') });
        });
    });
    r.on('error', (e) => res({ st: 0, h: {}, b: String(e) })); r.setTimeout(60000, () => r.destroy()); r.end();
});
// one request per server per ~70 ms keeps both under the shed refill; a 503 is retried after Retry-After
const lastAt = {};
async function get(port, p, o) {
    for (let k = 0; k < 4; k++) {
        const wait = (lastAt[port] || 0) + 70 - Date.now();
        if (wait > 0) await sleep(wait);
        lastAt[port] = Date.now();
        const r = await req(port, p, o);
        if (r.st !== 503) return r;
        await sleep(1000 * (Number(r.h['retry-after']) || 2) + 200);
    }
    return req(port, p, o);
}
async function waitReady(port, p) {
    for (let i = 0; i < 480; i++) {
        if (p.exitCode !== null) throw new Error('server on ' + port + ' exited (see ' + TMP + ')');
        const r = await req(port, '/health');
        if (r.st === 200) return;
        await sleep(500);
    }
    throw new Error('server on ' + port + ' not ready');
}
const nonceOf = (h) => { const m = /'nonce-([A-Za-z0-9+/=_-]+)'/.exec(h['content-security-policy'] || ''); return m ? m[1] : null; };
const mask = (s, n) => (n ? s.split(n).join('{NONCE}') : s);
const SKIP_H = new Set(['date', 'etag', 'content-security-policy', 'content-length', 'connection', 'keep-alive']);
function cmp(A, B) {
    if (A.st !== B.st) return 'status ' + A.st + ' vs ' + B.st;
    const na = nonceOf(A.h), nb = nonceOf(B.h);
    const ka = Object.keys(A.h).filter((k) => !SKIP_H.has(k)).sort(), kb = Object.keys(B.h).filter((k) => !SKIP_H.has(k)).sort();
    if (ka.join() !== kb.join()) return 'header names ' + ka.join() + ' | ' + kb.join();
    for (const k of ka) if (mask(String(A.h[k]), na) !== mask(String(B.h[k]), nb)) return 'header ' + k + ': ' + A.h[k] + ' | ' + B.h[k];
    if (mask(String(A.h['content-security-policy'] || ''), na) !== mask(String(B.h['content-security-policy'] || ''), nb)) return 'csp differs';
    const ma = mask(A.b, na), mb = mask(B.b, nb);
    if (ma !== mb) {
        let i = 0; while (i < ma.length && ma[i] === mb[i]) i++;
        return 'body differs at ' + i + ' (' + ma.length + ' vs ' + mb.length + '): ' + JSON.stringify(ma.slice(Math.max(0, i - 120), i + 120)) + ' | ' + JSON.stringify(mb.slice(Math.max(0, i - 120), i + 120));
    }
    return null;
}

try {
    console.log('servers: OFF :' + PORT.off + ', ON :' + PORT.on + ' (logs in ' + TMP + ')');
    const pOff = startServer('off', PORT.off, { TP_MOON_SHELL_MEMO: '0' });
    const pOn = startServer('on', PORT.on, {});
    await Promise.all([waitReady(PORT.off, pOff), waitReady(PORT.on, pOn)]);

    // ------------------------------------------------------------ [D] determinism
    console.log('[D] determinism');
    const FIXED = ['/moon/saudi-arabia/riyadh/2026/11', '/en/moon/saudi-arabia/riyadh/2026/12', '/fr/moon/saudi-arabia/riyadh/2027/03',
        '/de/moon/france/paris/2026/11', '/en/moon/united-states/los-angeles/2026/11', '/ur/moon/saudi-arabia/riyadh/2021/05',
        '/tr/moon/turkey/istanbul/2026/11', '/id/moon/indonesia/jakarta/2026/11', '/bn/moon/bangladesh/dhaka/2026/11', '/ms/moon/malaysia/kuala-lumpur/2026/11',
        '/es/moon/spain/madrid/2026/11', '/moon/egypt/cairo/2026/11'];
    for (const port of [PORT.off, PORT.on]) {
        for (const u of FIXED.slice(0, 4)) {
            const A = await get(port, u), B = await get(port, u);
            const d = cmp(A, B);
            ok('D', A.st === 200 && d === null, (port === PORT.off ? 'OFF' : 'ON') + ' twice ' + u, d || A.st);
        }
    }

    // ------------------------------------------------------------ [N] nonce
    console.log('[N] nonce');
    for (const u of FIXED.slice(0, 6)) {
        const A = await get(PORT.on, u), B = await get(PORT.on, u), O = await get(PORT.off, u);
        const na = nonceOf(A.h), nb = nonceOf(B.h), no = nonceOf(O.h);
        ok('N', na && nb && na !== nb, 'fresh nonce per response ' + u);
        const occ = (r, n) => r.b.split(n).length - 1;
        const attrs = (r) => (r.b.match(/nonce="([^"]*)"/g) || []);
        ok('N', attrs(A).length > 0 && attrs(A).every((x) => x === 'nonce="' + na + '"'), 'every body nonce == CSP header nonce ' + u, attrs(A).slice(0, 3).join());
        ok('N', !A.b.includes('__TP_CSP_NONCE__') && !B.b.includes('__TP_CSP_NONCE__'), 'no nonce marker left ' + u);
        ok('N', occ(A, na) === occ(O, no) && occ(A, na) >= 15, 'same nonce positions as OFF (' + occ(A, na) + ') ' + u, occ(O, no));
    }

    // ------------------------------------------------------------ [E] equivalence gate
    console.log('[E] equivalence gate (this takes a few minutes)');
    const slugify = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const cpJ = JSON.parse(fs.readFileSync(path.join(ROOT, 'db/places/curated-places.json'), 'utf8'));
    const cur = (Array.isArray(cpJ) ? cpJ : (cpJ.places || Object.values(cpJ))).filter((p) => p && p.type === 'city' && p.slug && p.countryCode);
    const curSlugs = new Set(cur.map((p) => p.slug));
    const dbSlugs = [];
    for (const f of fs.readdirSync(path.join(ROOT, 'db')).filter((x) => /^cities-[a-z]{2}\.json$/.test(x)).sort()) {
        let j; try { j = JSON.parse(fs.readFileSync(path.join(ROOT, 'db', f), 'utf8')); } catch (_e) { continue; }
        for (const c of (Array.isArray(j) ? j : Object.values(j))) { const s = slugify(c && c.nameEn); if (s && /^[a-z]/.test(s) && !curSlugs.has(s)) dbSlugs.push(s); }
    }
    let seed = 20261108; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    const pick = (arr) => { const a = [...new Set(arr)]; const o = []; while (a.length) o.push(a.splice(Math.floor(rnd() * a.length), 1)[0]); return o; };
    const months = []; for (let y = 2021; y <= 2031; y++) for (let m = 1; m <= 12; m++) months.push(y + '/' + String(m).padStart(2, '0'));
    const VAR = [{ enc: 'identity', cc: 'SA' }, { enc: 'br', cc: 'SA' }, { enc: 'identity', cc: 'DE' }, { enc: 'br', cc: 'DE' }];
    const tally = { curated: 0, db: 0, pairs: 0, same: 0, langs: new Set(), firstDiffs: [] };
    async function runUrl(u, kind) {
        const r0 = await Promise.all([get(PORT.off, u, VAR[0]), get(PORT.on, u, VAR[0])]);
        if (r0[0].st !== 200) return null;   // not a sample (the non-200 forms are compared in [X])
        let allSame = true;
        for (let v = 0; v < VAR.length; v++) {
            const [A, B] = v === 0 ? r0 : await Promise.all([get(PORT.off, u, VAR[v]), get(PORT.on, u, VAR[v])]);
            const d = cmp(A, B);
            tally.pairs++;
            if (d === null) tally.same++; else { allSame = false; if (tally.firstDiffs.length < 5) tally.firstDiffs.push(u + ' [' + VAR[v].enc + '/' + VAR[v].cc + '] ' + d); }
        }
        tally[kind]++; tally.langs.add((u.match(/^\/([a-z]{2})\/moon\//) || [0, 'ar'])[1]);
        return allSame;
    }
    const countryOf = async (slug) => {
        const r = await get(PORT.off, '/moon/saudi-arabia/' + slug + '/2026/01');
        if (r.st === 200) return 'saudi-arabia';
        if (r.st === 301 && r.h.location) { const m = String(r.h.location).match(/^(?:https?:\/\/[^/]+)?\/moon\/([a-z0-9-]+)\//); return m ? m[1] : null; }
        return null;
    };
    let urlsSame = 0, urlsTotal = 0;
    for (const u of FIXED) { const same = await runUrl(u, 'curated'); if (same !== null) { urlsTotal++; if (same) urlsSame++; } }
    for (const [kind, pool, target] of [['curated', cur.map((p) => p.slug), 200], ['db', dbSlugs, 100]]) {
        for (const slug of pick(pool)) {
            if (tally[kind] >= target) break;
            const cs = await countryOf(slug);
            if (!cs) continue;
            for (let k = 0; k < 3 && tally[kind] < target; k++) {
                const u = '/' + LANGS[Math.floor(rnd() * LANGS.length)] + 'moon/' + cs + '/' + slug + '/' + months[Math.floor(rnd() * months.length)];
                const same = await runUrl(u, kind);
                if (same !== null) { urlsTotal++; if (same) urlsSame++; }
            }
        }
    }
    console.log('    urls=' + urlsTotal + ' (curated ' + tally.curated + ', db ' + tally.db + ', langs ' + tally.langs.size + ') pairs=' + tally.pairs + ' identical=' + tally.same);
    ok('E', urlsTotal >= 300 && tally.db >= 100 && tally.langs.size === 10, '>= 300 month URLs answering 200, >= 100 GeoNames db, 10 languages',
        urlsTotal + ' / db ' + tally.db + ' / langs ' + tally.langs.size);
    ok('E', urlsSame === urlsTotal && tally.same === tally.pairs, 'OFF == ON after the nonce mask: ' + urlsSame + '/' + urlsTotal + ' URLs, ' + tally.same + '/' + tally.pairs + ' pairs',
        tally.firstDiffs.join('\n'));

    // ------------------------------------------------------------ [T] time boundaries
    console.log('[T] time boundaries');
    const TU = ['/moon/saudi-arabia/riyadh/2026/11', '/en/moon/saudi-arabia/riyadh/2026/12', '/fr/moon/saudi-arabia/riyadh/2027/03',
        '/de/moon/france/paris/2026/11', '/en/moon/united-states/los-angeles/2026/11', '/ur/moon/saudi-arabia/riyadh/2021/05', '/moon/saudi-arabia/riyadh/2027/01'];
    const INSTANTS = [
        ['riyadh-midnight', '2026-11-08T20:59:00.000Z', '2026-11-08T21:01:00.000Z', '/moon/saudi-arabia/riyadh/2026/11'],
        ['riyadh-month', '2026-11-30T20:59:00.000Z', '2026-11-30T21:01:00.000Z', '/en/moon/saudi-arabia/riyadh/2026/12'],
        ['utc-year', '2026-12-31T23:59:00.000Z', '2027-01-01T00:01:00.000Z', '/moon/saudi-arabia/riyadh/2026/11'],
    ];
    const stampless = (s) => s.replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/g, 'ISO').replace(/nonce="[^"]*"/g, 'nonce=""');
    for (const [name, i1, i2, probe] of INSTANTS) {
        const seen = {};
        for (const inst of [i1, i2]) {
            await setClock(inst);
            for (const u of TU) {
                const [A, B] = await Promise.all([get(PORT.off, u), get(PORT.on, u)]);
                const d = cmp(A, B);
                ok('T', d === null, name + ' @' + inst + ' ' + u + ' (' + A.st + ')', d);
                if (u === probe) seen[inst] = A;
            }
        }
        ok('T', seen[i1] && seen[i2] && seen[i1].b.includes(i1) && seen[i2].b.includes(i2) && stampless(seen[i1].b) !== stampless(seen[i2].b),
            name + ': the instant changed the page (clock really moved) ' + probe);
    }
    await setClock(T0);

    // ------------------------------------------------------------ [X] non-200
    console.log('[X] non-200');
    const XU = [['/moon/france/riyadh/2026/11', 301], ['/en/moon/united-states/riyadh/2026/11', 301], ['/moon/saudi-arabia/riyadh/2026/13', 404],
        ['/moon/saudi-arabia/riyadh/2026/00', 404], ['/moon/saudi-arabia/riyadh/2040/01', 404], ['/fr/moon/saudi-arabia/riyadh/2015/06', 404],
        ['/moon/saudi-arabia/no-such-city-zz/2026/11', 404], ['/moon/saudi-arabia/riyadh/2026/11/08', 410], ['/en/moon/saudi-arabia/riyadh/2026/11/31', 404]];
    for (const [u, want] of XU) {
        const [A, B] = await Promise.all([get(PORT.off, u), get(PORT.on, u)]);
        ok('X', cmp(A, B) === null, u + ' OFF == ON (' + A.st + '/' + B.st + ')', cmp(A, B));
        if (A.st !== want) console.log('    note: ' + u + ' answered ' + A.st + ' (expected ' + want + '); still OFF == ON');
    }
    // a local burst, the same on both servers: compare the first 503 of each (if the gate refuses one)
    {
        const burstUrl = '/es/moon/somalia/ismail-diiriye/2026/11';
        const burst = async (port) => (await Promise.all(Array.from({ length: 120 }, () => req(port, burstUrl)))).find((r) => r.st === 503) || null;
        const s503off = await burst(PORT.off); await sleep(3000);
        const s503on = await burst(PORT.on); await sleep(3000);
        if (s503off && s503on) ok('X', cmp(s503off, s503on) === null, 'shed 503 OFF == ON (Retry-After ' + s503on.h['retry-after'] + ')', cmp(s503off, s503on));
        else console.log('    note: burst did not trigger a 503 on both servers (OFF ' + !!s503off + ', ON ' + !!s503on + '); not compared');
    }

    // ------------------------------------------------------------ [P] latency (info)
    console.log('[P] latency, info only');
    {
        const PU = FIXED.slice(0, 10);
        const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
        const rounds = { off: [], on: [] };
        for (let round = 0; round < 3; round++) {
            for (const [tag, port] of round % 2 ? [['on', PORT.on], ['off', PORT.off]] : [['off', PORT.off], ['on', PORT.on]]) {
                const t = [];
                for (let k = 0; k < 6; k++) for (const u of PU) { await sleep(90); const s = process.hrtime.bigint(); await req(port, u); t.push(Number(process.hrtime.bigint() - s) / 1e6); }
                rounds[tag].push(med(t));
            }
        }
        console.log('    median ms per round  OFF ' + rounds.off.map((x) => x.toFixed(2)).join(' / ') + '   ON ' + rounds.on.map((x) => x.toFixed(2)).join(' / ')
            + '   (median of rounds: OFF ' + med(rounds.off).toFixed(2) + ', ON ' + med(rounds.on).toFixed(2) + ')');
    }

    const guardHits = ['off', 'on'].map((t) => { try { return fs.readFileSync(path.join(TMP, 'guard-' + t + '.jsonl'), 'utf8').split('\n').filter(Boolean).length; } catch (_e) { return 0; } });
    console.log('    outbound attempts blocked by the guard: OFF ' + guardHits[0] + ', ON ' + guardHits[1]);
} finally {
    killAll();
}
for (const g of Object.keys(G)) console.log('  [' + g + '] ' + G[g].p + ' pass, ' + G[g].f + ' fail');
console.log((fail ? 'FAIL' : 'PASS') + '  ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
