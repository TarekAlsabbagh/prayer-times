// MOON-DAY-PAGES-REMOVAL-1 — acceptance smoke (HTTP, 127.0.0.1 only).
//
// Owner decision under test: every standalone moon DAY page — nested /[lang/]moon/{country}/{city}/{yyyy}/{mm}/{dd},
// per-city /[lang/]moon/{country}/{city}/today, legacy /moon-in-{slug}[-{lat}-{lng}]/{yyyy-mm-dd},
// /moon-today-in-{slug}[-{lat}-{lng}], /moon-today-in-{slug}[coords]/{yyyy-mm-dd}, and the .html / trailing-slash / www /
// wrong-country forms that used to END at one of them — answers 410 Gone in ONE response. Everything that is 404 today
// stays 404 with the same body. /moon, /moon/{country}, hub, year and month pages are unchanged. No link (SSR, JSON-LD,
// inline script) points at a removed page. Sitemaps carry no /today and no day URL.
//
// Sections (each check prints one line; the summary lists every failure)
//   [A0] BASE ground truth: every [A] URL ends at a 200 #page-moon day/today page on BASE (≤ 6 hops), i.e. [A] lists only
//        pages that exist today (a 404 can never sneak into the 410 list)
//   [A]  410 matrix — 10 locales × {curated riyadh, curated an-nabiah, GeoNames-db buraydah (not curated), discovered fixture}
//        × shapes; full shape set for ar + en, a representative subset for the other 8 locales. Each row: ONE response,
//        status 410, no Location, the contract headers, body < 4 KB, data-tp-gone="moon-day", lang/dir, noindex meta,
//        <title>410</title>, no script/style/canonical, no #page-moon, no ssr-moon-year-range, no googlesyndication,
//        links = /[lang/]moon (+ the city hub when resolved, + the month page when the URL carried a supported year+month)
//   [A+] 410 body summary: per-locale messages distinct + right script; every body link resolves (200, or one 301 → 200)
//   [B]  stays 404: exact 404 on the subject AND on BASE, byte-identical body + same Content-Type / Cache-Control /
//        X-Robots-Tag as BASE (the union of the 404 lists of the retired day/today smokes + guardrails + legacy + IRSC)
//   [B2] chains that end at 404 on BASE still end at 404 (a 301 kept or a direct 404 — the owner's choice)
//   [C]  kept pages: 200, no redirect, self canonical, hreflang present, and canonical / robots / X-Robots-Tag / title /
//        meta description / hreflang pairs identical to BASE; kept 301s identical to BASE; robots.txt identical
//   [D1] raw SSR: 0 removed targets in any attribute value, JSON-LD string or inline-script string literal
//   [D2] markup contract on those pages (pickers without a day select, no "d.value" navigation, removed placeholders,
//        hub friendly links removed, month friendly links → hub, year today card → hub, country grid → hubs, other-cities)
//   [E]  sitemaps: /sitemap.xml children + /sitemap-main.xml + /sitemap-cities-N.xml carry 0 /today and 0 day URLs
//        (loc and xhtml:link); candidate loc sets === BASE loc sets minus exactly BASE's /today locs
//   [F]  month grid: 0 <a> in <ul class="moon-hub-cal-grid">, filled cells === days in month, one cell-body per cell,
//        cell text === BASE, Meeus 2026/06 (15 محاق + crescent watch, 30 بدر) cross-checked with BASE's day pages
//   [G]  cheap path: (1) source order in the request handler: the 410 gate precedes _shedReject( / _prefetchDiscoveredForSsr( /
//        serveHtmlWithSeo( and the security headers; (2) median of 200 sequential 410s < 2 ms vs 50 month renders;
//        (3) [moon-load] rows: every 410 counted with outcome 'gone' in the <25 ms bucket, [req-family] 'moon-gone',
//        and no day/today family ever rendered (2xx)
//   [V]  static: asset ?v bumps (app.js, moon-chart.js, site-search.js ×2, style.css when css changed), js/moon.js
//        byte-identical to BASE, index.html / prayer-times-cities.html / site-search.js carry no today/day builders,
//        CSS mirrors every .moon-hub-cal-cell a rule onto .moon-hub-cal-cell-body without a hover/pointer affordance
//   [N]  outbound guard: 0 non-loopback attempts logged by either server
//
// Boot (both servers, same env): node -r <guard.cjs> server.js with PORT, WEB_CONCURRENCY=1, TP_SSR_CACHE=0,
//   SITE_URL=https://timesprayers.com, SUPABASE_URL='', SUPABASE_SERVICE_ROLE_KEY='', ADSENSE_CLIENT=off,
//   DISCOVERED_SSR_TEST_FIXTURE=<temp json>, TP_MOON_LOAD_OBS_WINDOW_S=10, GUARD_OUT=<temp log>, and TP_MOON_DAY_SHED=0
//   (sequential month renders keep the event loop busy; the overload shed could then 503 a KEPT page and make [C]/[F]
//   flaky — set TP_SMOKE_KEEP_SHED=1 to keep the server default; the gate-before-shed order is proven statically in [G]).
//
// Usage
//   node scripts/_smoke_moon_day_pages_removal_1.mjs               candidate = this worktree (:8441) vs BASE (:8442)
//   node scripts/_smoke_moon_day_pages_removal_1.mjs --base-only   validate the smoke on BASE alone (:8443): every [A] row
//                                                                  must FAIL, [A0] / [B] / [B2] / [C] / [N] must pass
//   env TP_BASE_ROOT  BASE checkout (default C:/Users/Tarek/Downloads/timesprayers-mlobs2 = production main + latency histogram)
//       TP_GUARD      outbound guard (default C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs; path must have no spaces)
//       TP_SMOKE_ONLY comma list of sections to run (A0,A,B,C,D,E,F,G,V); default all
//       TP_DAYREMOVE_PORT first of the 3 ports (default 8441)
// Never run against production. No load: every request is sequential.
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_ROOT = process.env.TP_BASE_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-mlobs2';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const BASE_ONLY = process.argv.includes('--base-only');
const KEEP_SHED = process.env.TP_SMOKE_KEEP_SHED === '1';
const ONLY = new Set(String(process.env.TP_SMOKE_ONLY || '').split(',').map((s) => s.trim().toUpperCase()).filter(Boolean));
const want = (s) => !ONLY.size || ONLY.has(s);
const SITE = 'https://timesprayers.com';
const PORT0 = Number(process.env.TP_DAYREMOVE_PORT || 8441);   // ports PORT0..PORT0+2 (candidate, BASE, BASE-only)
const CAND_PORT = PORT0, BASE_PORT = BASE_ONLY ? PORT0 + 2 : PORT0 + 1;
const SUBJECT_ROOT = BASE_ONLY ? BASE_ROOT : ROOT;
const UA = 'tp-dayremove-smoke/1';
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const lp = (L) => (L === 'ar' ? '' : '/' + L);
const p2 = (n) => String(n).padStart(2, '0');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const range = (a, b) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);
const isLeap = (y) => new Date(Date.UTC(y, 2, 0)).getUTCDate() === 29;
const dimOf = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sha = (b) => crypto.createHash('sha1').update(b).digest('hex').slice(0, 12);
const median = (a) => { const s = [...a].sort((x, y) => x - y); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : NaN; };

// ── dates: the supported moon range is the current UTC year ±5 (server getSupportedMoonYearRange) ──
const NOW = new Date();
const CUR = NOW.getUTCFullYear();
const MIN = Math.max(1900, CUR - 5), MAX = Math.min(2100, CUR + 5);
const UTC_M = NOW.getUTCMonth() + 1, UTC_D = NOW.getUTCDate();
const T0 = Date.UTC(CUR, UTC_M - 1, UTC_D);
const ymdOf = (t) => { const d = new Date(t); return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]; };
const D_IN = ymdOf(T0 + 10 * 86400000);                    // inside the index window (UTC today -30..+90)
const D_PAST = [CUR - 3, 3, 10], D_FUT = [CUR + 3, 7, 20];  // outside the window, inside the supported years
const D_MIN = [MIN, 1, 1], D_MAX = [MAX, 12, 31];
const LEAP_Y = range(CUR + 1, MAX).concat(range(MIN, CUR)).find(isLeap);
const D_LEAP = [LEAP_Y, 2, 29];
const D_TODAY = [CUR, UTC_M, UTC_D];
const NONLEAP_Y = range(MIN, MAX).find((y) => !isLeap(y));
const dp = (d) => '/' + d[0] + '/' + p2(d[1]) + '/' + p2(d[2]);
const iso = (d) => d[0] + '-' + p2(d[1]) + '-' + p2(d[2]);
const MM = p2(UTC_M);
// Riyadh-local year/month (the grid marks the CITY-local today cell)
const [RIY_Y, RIY_M] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit' }).format(NOW).split('-').map(Number);

// ── removed-target regexes (the ticket's own; used by [D1], [E], the 410 body links and the browser probe) ──
const RM_NESTED = /\/moon\/[a-z][a-z0-9-]*\/[a-z0-9][a-z0-9-]*\/(?:today|\d{4}\/\d{2}\/\d{2})(?:[?#"'\s]|$)/;
const RM_LEG_TODAY = /moon-today-in-/;
const RM_LEG_DAY = /\/moon-in-[^\/?#"'\s]+\/\d{4}-\d{2}-\d{2}/;
const isRemovedTarget = (s) => RM_NESTED.test(s) || RM_LEG_TODAY.test(s) || RM_LEG_DAY.test(s);
// a path that IS a removed page shape (used for BASE ground truth: the final URL of an [A] chain)
const REMOVED_PAGE_PATH = [
    /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon\/[a-z][a-z0-9-]+\/[a-z][a-z0-9-]+\/(?:today|\d{4}\/\d{2}\/\d{2})$/,
    /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-today-in-[a-z][a-z0-9.-]*?-(?:-?\d+(?:\.\d+)?)-(?:-?\d+(?:\.\d+)?)$/,
    /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-in-[a-z][a-z0-9.-]*?-(?:-?\d+(?:\.\d+)?)-(?:-?\d+(?:\.\d+)?)\/\d{4}-\d{2}-\d{2}$/,
];
const isRemovedPagePath = (p) => REMOVED_PAGE_PATH.some((re) => re.test(p.split('?')[0]));

// ── cities: curated famous, curated small, GeoNames db (not curated), discovered (Supabase fixture) ──
const CURATED = JSON.parse(fs.readFileSync(path.join(ROOT, 'db', 'places', 'curated-places.json'), 'utf8'));
const curatedBySlug = new Map(CURATED.map((e) => [e.slug, e]));
// the server's makeCitySlugSrv (server.js), reproduced to prove the db city resolves through db/cities-sa.json
const citySlug = (nameEn) => String(nameEn || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9\s]+/g, '').trim().replace(/\s+/g, '-');
const SA_DB = JSON.parse(fs.readFileSync(path.join(ROOT, 'db', 'cities-sa.json'), 'utf8'));
const DB_SLUG = 'buraydah';
const dbRow = SA_DB.find((c) => c && c.nameEn && c.nameAr && typeof c.lat === 'number' && citySlug(c.nameEn) === DB_SLUG);
const FIXTURE = {
    'orig-only-city': { slug: 'orig-only-city', lat: 20.5, lng: 49.5, timezone: 'Asia/Riyadh', country_code: 'sa', type: 'city',
                        names: { ar: 'مدينة الاسم الأصلي', en: 'Orig Only City' }, admin: { originalName: 'مدينة الاسم الأصلي' } },
    // cold probes: each is requested exactly once per server, so the discovered lookup is exercised with an empty cache
    'tp-disc-cold-a': { slug: 'tp-disc-cold-a', lat: 19.5, lng: 48.5, timezone: 'Asia/Riyadh', country_code: 'sa', type: 'city', names: { ar: 'مدينة باردة أ', en: 'Cold A' } },
    'tp-disc-cold-b': { slug: 'tp-disc-cold-b', lat: 19.0, lng: 47.5, timezone: 'Asia/Riyadh', country_code: 'sa', type: 'city', names: { ar: 'مدينة باردة ب', en: 'Cold B' } },
};
const CITY_LIST = [
    { key: 'riyadh', cls: 'curated', cs: 'saudi-arabia', slug: 'riyadh', lat: 24.7136, lng: 46.6753 },
    { key: 'an-nabiah', cls: 'curated-small', cs: 'saudi-arabia', slug: 'an-nabiah', lat: 26.4760, lng: 50.0067 },
    { key: DB_SLUG, cls: 'geonames-db', cs: 'saudi-arabia', slug: DB_SLUG, lat: dbRow ? dbRow.lat : 26.3592, lng: dbRow ? dbRow.lng : 43.9763 },
    { key: 'orig-only-city', cls: 'discovered', cs: 'saudi-arabia', slug: 'orig-only-city', lat: 20.5, lng: 49.5 },
];
const coordSlug = (c) => c.slug + '-' + c.lat.toFixed(2) + '-' + c.lng.toFixed(2);
const DISC_WARM = '/moon/saudi-arabia/orig-only-city';    // a KEPT page whose request fills the 5-min discovered cache

// ── output ──
let pass = 0, fail = 0; const fails = []; const SEC = {};
function ok(label, cond, name, detail) {
    const s = SEC[label] || (SEC[label] = { pass: 0, fail: 0 });
    const n = '[' + label + '] ' + name;
    if (cond) { pass++; s.pass++; console.log('  ✓ ' + n); }
    else { fail++; s.fail++; fails.push(n + (detail ? ' :: ' + detail : '')); console.log('  ✗ ' + n + (detail ? '  :: ' + detail : '')); }
}
const info = (s) => console.log('  · INFO ' + s);
const section = (s) => console.log('\n-- ' + s + ' --');

// ── HTTP ──
const STAT = new Map(); const LAST_REQ = new Map();
function get(port, urlPath, headers = {}, agent) {
    return new Promise((resolve) => {
        const t0 = performance.now();
        const done = (o) => { const m = STAT.get(port) || new Map(); m.set(o.status, (m.get(o.status) || 0) + 1); STAT.set(port, m); LAST_REQ.set(port, Date.now()); resolve(o); };
        const req = http.request({ host: '127.0.0.1', port, path: urlPath, method: 'GET', agent: agent || undefined,
            headers: { 'Accept-Encoding': 'identity', 'User-Agent': UA, ...headers } }, (res) => {
            const c = []; res.on('data', (x) => c.push(x));
            res.on('end', () => { const buf = Buffer.concat(c); done({ status: res.statusCode, headers: res.headers, buf, body: buf.toString('utf8'), ms: performance.now() - t0 }); });
            res.on('error', (e) => done({ status: 0, headers: {}, buf: Buffer.alloc(0), body: '', err: e.message, ms: performance.now() - t0 }));
        });
        req.setTimeout(300000, () => req.destroy(new Error('timeout')));
        req.on('error', (e) => done({ status: 0, headers: {}, buf: Buffer.alloc(0), body: '', err: e.message, ms: performance.now() - t0 }));
        req.end();
    });
}
const CACHE = new Map();
async function cget(port, p) { const k = port + '|' + p; if (!CACHE.has(k)) CACHE.set(k, await get(port, p)); return CACHE.get(k); }
async function follow(port, p, headers = {}, max = 6) {
    const hops = []; let cur = p, h = headers, r = null;
    for (let i = 0; i <= max; i++) {
        r = await get(port, cur, h);
        hops.push(r.status + ' ' + cur);
        if ([301, 302, 307, 308].includes(r.status) && r.headers.location) { cur = r.headers.location.replace(/^https?:\/\/[^/]+/, '') || '/'; h = {}; continue; }
        break;
    }
    return { final: cur, r, hops };
}
const brief = (r) => 'status=' + r.status + (r.headers && r.headers.location ? ' loc=' + r.headers.location : '') + ' len=' + (r.buf ? r.buf.length : 0) + (r.err ? ' err=' + r.err : '');

// ── servers ──
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-dayremove-'));
const FIXTURE_PATH = path.join(TMP, 'discovered-fixture.json');
fs.writeFileSync(FIXTURE_PATH, JSON.stringify(FIXTURE), 'utf8');
async function boot(root, port, tag) {
    const pre = await get(port, '/health');
    if (pre.status !== 0) throw new Error('port ' + port + ' already in use (a stale server would falsify results)');
    const guardOut = path.join(TMP, 'guard-' + tag + '.log');
    fs.writeFileSync(guardOut, '');
    const env = { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: SITE,
                  SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', ADSENSE_CLIENT: 'off', DISCOVERED_SSR_TEST_FIXTURE: FIXTURE_PATH,
                  TP_MOON_LOAD_OBS_WINDOW_S: '10', GUARD_OUT: guardOut };
    if (!KEEP_SHED) env.TP_MOON_DAY_SHED = '0';
    for (const k of ['TP_ENABLE_SEARCH_TEST', 'TP_MOON_RANGE_TEST_NOW', 'NODE_OPTIONS', 'TP_MOON_LOAD_OBS']) delete env[k];
    const child = spawn(process.execPath, ['-r', GUARD, 'server.js'], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
    child.tag = tag; child.guardOut = guardOut; child.lines = []; child.bootLog = '';
    let buf = '';
    child.stdout.on('data', (d) => {
        const s = d.toString('utf8');
        if (child.bootLog.length < 300000) child.bootLog += s;
        buf += s;
        let i;
        while ((i = buf.indexOf('\n')) >= 0) {
            const line = buf.slice(0, i).replace(/\r$/, ''); buf = buf.slice(i + 1);
            if (line.startsWith('[moon-load] {') || line.startsWith('[req-family] {')) child.lines.push({ t: Date.now(), line });
        }
    });
    child.stderr.on('data', (d) => { if (child.bootLog.length < 300000) child.bootLog += d.toString('utf8'); });
    for (let i = 0; i < 300; i++) {
        const r = await get(port, '/health');
        if (r.status === 200) return child;
        if (child.exitCode != null) break;
        await sleep(400);
    }
    stop(child); throw new Error('server did not become healthy: ' + root + ' :' + port + '\n' + child.bootLog.slice(-3000));
}
function stop(child) {
    if (!child) return;
    try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) { try { child.kill(); } catch (_) {} }
}

// ── HTML helpers ──
const noComments = (b) => String(b || '').replace(/<!--[\s\S]*?-->/g, '');
const attrOf = (tag, name) => { const m = tag.match(new RegExp('\\b' + name + '\\s*=\\s*("([^"]*)"|\'([^\']*)\')', 'i')); return m ? (m[2] ?? m[3]) : null; };
function metaRobots(b) { const m = noComments(b).match(/<meta\b[^>]*\bname=["']robots["'][^>]*>/i); return m ? attrOf(m[0], 'content') : null; }
function metaDesc(b) { const m = noComments(b).match(/<meta\b[^>]*\bname=["']description["'][^>]*>/i); return m ? attrOf(m[0], 'content') : null; }
function canonicalOf(b) { const m = noComments(b).match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i); return m ? attrOf(m[0], 'href') : null; }
const titleOf = (b) => (noComments(b).match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] ?? null;
function hreflangPairs(b) {
    return [...noComments(b).matchAll(/<link\b[^>]*\bhreflang=["'][^"']+["'][^>]*>/gi)].map((m) => attrOf(m[0], 'hreflang') + ' ' + attrOf(m[0], 'href')).sort();
}
const htmlTag = (b) => (String(b).match(/<html\b[^>]*>/i) || [''])[0];
function walkStrings(v, fn) {
    if (typeof v === 'string') fn(v);
    else if (Array.isArray(v)) v.forEach((x) => walkStrings(x, fn));
    else if (v && typeof v === 'object') Object.values(v).forEach((x) => walkStrings(x, fn));
}
// every string a browser or crawler could treat as a link: attribute values, JSON-LD strings, inline-script string literals
function linkCandidates(html) {
    const out = [];
    const b = noComments(html);
    const scripts = [];
    const outside = b.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (all, attrs, code) => { scripts.push({ attrs, code }); return '<script' + attrs + '></script>'; });
    for (const m of outside.matchAll(/\s([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)')/g)) out.push({ where: 'attr:' + m[1].toLowerCase(), v: (m[3] ?? m[4]).replace(/&amp;/g, '&') });
    for (const s of scripts) {
        if (/application\/ld\+json/i.test(s.attrs)) {
            try { walkStrings(JSON.parse(s.code), (v) => out.push({ where: 'jsonld', v })); }
            catch (_) { out.push({ where: 'jsonld-unparsed', v: s.code }); }
        } else {
            for (const m of s.code.matchAll(/'((?:[^'\\\r\n]|\\.)*)'|"((?:[^"\\\r\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)) {
                out.push({ where: 'script', v: (m[1] ?? m[2] ?? m[3]).replace(/\\\//g, '/') });
            }
        }
    }
    return out;
}
const removedHits = (html) => linkCandidates(html).filter((x) => isRemovedTarget(x.v));
// month grid (works on the old <a> wrapper and on the new <div class="moon-hub-cal-cell-body"> wrapper)
function gridOf(body) {
    const g = String(body).match(/<ul class="moon-hub-cal-grid">([\s\S]*?)<\/ul>/);
    if (!g) return null;
    const grid = g[1];
    const sp = (h, k) => { const m = h.match(new RegExp('<span class="moon-hub-cal-' + k + '"[^>]*>([^<]*)</span>')); return m ? m[1] : null; };
    const cells = [...grid.matchAll(/<li class="(moon-hub-cal-cell[^"]*)"[^>]*>([\s\S]*?)<\/li>/g)].map((m) => ({ cls: m[1], inner: m[2] }));
    const filled = cells.filter((c) => !/--empty/.test(c.cls)).map((c) => ({
        today: /--today/.test(c.cls), bodies: (c.inner.match(/<div class="moon-hub-cal-cell-body">/g) || []).length,
        rel: sp(c.inner, 'rel'), date: sp(c.inner, 'date'), hijri: sp(c.inner, 'hijri'), phase: sp(c.inner, 'phase'),
        name: sp(c.inner, 'phase-name'), watch: sp(c.inner, 'watch'), day: +(((sp(c.inner, 'date') || '').match(/\d+/) || ['0'])[0]),
    }));
    return { anchors: (grid.match(/<a\b/gi) || []).length, cellCount: cells.length, filled };
}
const cellText = (c) => [c.today, c.rel, c.date, c.hijri, c.phase, c.name, c.watch];

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// [A] matrix
function buildMatrix() {
    const rows = [];
    const add = (o) => rows.push({ hub: 'none', month: null, headers: {}, warm: null, ...o });
    // cold discovered probes FIRST (empty cache on the subject: exercises the one deferred lookup)
    add({ L: 'ar', city: 'tp-disc-cold-a', cls: 'discovered-cold', shape: 'nested-today (cold cache)', path: '/moon/saudi-arabia/tp-disc-cold-a/today', hub: '/moon/saudi-arabia/tp-disc-cold-a' });
    add({ L: 'ar', city: 'tp-disc-cold-b', cls: 'discovered-cold', shape: 'legacy-today (cold cache)', path: '/moon-today-in-tp-disc-cold-b', hub: '/moon/saudi-arabia/tp-disc-cold-b' });
    for (const L of LANGS) {
        const P = lp(L); const full = (L === 'ar' || L === 'en');
        for (const c of CITY_LIST) {
            const nb = P + '/moon/' + c.cs + '/' + c.slug;
            const mon = (d) => nb + '/' + d[0] + '/' + p2(d[1]);
            const warm = c.cls === 'discovered' ? DISC_WARM : null;
            const base = { L, city: c.key, cls: c.cls };
            add({ ...base, shape: 'nested-day in window ' + iso(D_IN), path: nb + dp(D_IN), hub: nb, month: mon(D_IN) });
            add({ ...base, shape: 'nested-today', path: nb + '/today', hub: nb });
            add({ ...base, shape: 'legacy-today', path: P + '/moon-today-in-' + c.slug, hub: nb });
            add({ ...base, shape: 'legacy-day', path: P + '/moon-in-' + c.slug + '/' + iso(D_IN), hub: nb, month: mon(D_IN), warm });
            if (full || c.key === 'riyadh') {
                add({ ...base, shape: 'nested today .html twin', path: nb + '/today.html', hub: nb });
                add({ ...base, shape: 'nested day trailing-slash twin', path: nb + dp(D_IN) + '/', hub: nb, month: mon(D_IN) });
            }
            if (!full) continue;
            for (const [nm, d] of [['out of window past', D_PAST], ['out of window future', D_FUT], ['MIN/01/01', D_MIN], ['MAX/12/31', D_MAX], ['leap day', D_LEAP], ['UTC today', D_TODAY]]) {
                add({ ...base, shape: 'nested-day ' + nm + ' ' + iso(d), path: nb + dp(d), hub: nb, month: mon(d) });
            }
            add({ ...base, shape: 'legacy-today coords', path: P + '/moon-today-in-' + coordSlug(c), hub: 'may' });
            add({ ...base, shape: 'legacy-day coords', path: P + '/moon-in-' + coordSlug(c) + '/' + iso(D_IN), hub: 'may', month: 'may' });
            add({ ...base, shape: 'legacy today+date', path: P + '/moon-today-in-' + c.slug + '/' + iso(D_IN), hub: nb, month: mon(D_IN), warm });
            add({ ...base, shape: 'nested day .html twin', path: nb + dp(D_IN) + '.html', hub: nb, month: mon(D_IN) });
            add({ ...base, shape: 'nested today trailing-slash twin', path: nb + '/today/', hub: nb });
            add({ ...base, shape: 'legacy-today trailing-slash twin', path: P + '/moon-today-in-' + c.slug + '/', hub: nb });
            add({ ...base, shape: 'legacy-day trailing-slash twin', path: P + '/moon-in-' + c.slug + '/' + iso(D_IN) + '/', hub: nb, month: mon(D_IN), warm });
            add({ ...base, shape: 'www Host on nested day', path: nb + dp(D_IN), headers: { Host: 'www.timesprayers.com' }, hub: nb, month: mon(D_IN) });
            add({ ...base, shape: 'nested today + query', path: nb + '/today?utm_source=x', hub: nb });
            // decided before compression: a br/gzip-capable client still gets the small identity body
            if (c.key === 'riyadh') add({ ...base, shape: 'nested day, Accept-Encoding br/gzip', path: nb + dp(D_IN), headers: { 'Accept-Encoding': 'gzip, deflate, br' }, hub: nb, month: mon(D_IN) });
            add({ ...base, shape: 'nested day + ?cal query', path: nb + dp(D_IN) + '?cal=' + D_IN[0] + '-' + p2(D_IN[1]), hub: nb, month: mon(D_IN) });
        }
        if (full) {
            const rb = P + '/moon/saudi-arabia/riyadh';
            const base = { L, city: 'riyadh', cls: 'curated' };
            add({ ...base, shape: 'country mismatch today', path: P + '/moon/united-states/riyadh/today', hub: rb });
            add({ ...base, shape: 'country mismatch day', path: P + '/moon/united-states/riyadh' + dp(D_IN), hub: rb, month: rb + '/' + D_IN[0] + '/' + p2(D_IN[1]) });
            add({ L, city: 'makkah', cls: 'curated-alias', shape: 'curated alias /moon-today-in-mecca', path: P + '/moon-today-in-mecca', hub: 'may' });
            add({ L, city: 'makkah', cls: 'curated-alias', shape: 'curated alias trailing slash', path: P + '/moon-today-in-mecca/', hub: 'may' });
            add({ L, city: 'makkah', cls: 'curated-alias', shape: 'nested alias /moon/saudi-arabia/mecca/today', path: P + '/moon/saudi-arabia/mecca/today', hub: 'may' });
            add({ ...base, shape: 'curated old slug /moon-today-in-riyadh-region', path: P + '/moon-today-in-riyadh-region', hub: 'may' });
            add({ ...base, shape: 'greedy integer coords today+date', path: P + '/moon-today-in-riyadh-24-46/' + iso(D_IN), hub: 'may', month: 'may' });
            // coordinate-only pages (the slug resolves to nothing: BASE rendered a 200 noindex coordinate day/today page)
            add({ L, city: 'zzqqnowhere', cls: 'coord-only', shape: 'coordinate-only today', path: P + '/moon-today-in-zzqqnowhere-10.00-10.00', hub: 'none' });
            add({ L, city: 'zzqqnowhere', cls: 'coord-only', shape: 'coordinate-only day', path: P + '/moon-in-zzqqnowhere-10.00-10.00/' + iso(D_IN), hub: 'none', month: 'may' });
        }
    }
    return rows;
}
// hub / month expectations: a path = exactly that link must be present; 'may' = optional (a kept page if present); 'none'/null = absent
function check410(r, row, dirOf) {
    const bad = [];
    if (r.status !== 410) { bad.push(brief(r)); return { bad, links: [] }; }
    const h = r.headers;
    const hv = (k) => (Array.isArray(h[k]) ? h[k].join(' | ') : h[k]);
    if (h.location) bad.push('Location=' + h.location);
    if (hv('content-type') !== 'text/html; charset=utf-8') bad.push('content-type=' + hv('content-type'));
    if (String(hv('content-length')) !== String(r.buf.length)) bad.push('content-length=' + hv('content-length') + ' vs body ' + r.buf.length);
    if (hv('cache-control') !== 'public, max-age=3600') bad.push('cache-control=' + hv('cache-control'));
    if (hv('x-robots-tag') !== 'noindex') bad.push('x-robots-tag=' + hv('x-robots-tag'));
    if (hv('x-content-type-options') !== 'nosniff') bad.push('nosniff=' + hv('x-content-type-options'));
    if (hv('x-frame-options') !== 'SAMEORIGIN') bad.push('x-frame-options=' + hv('x-frame-options'));
    if (hv('referrer-policy') !== 'strict-origin-when-cross-origin') bad.push('referrer-policy=' + hv('referrer-policy'));
    if (hv('content-security-policy') !== "default-src 'none'; frame-ancestors 'self'") bad.push('csp=' + hv('content-security-policy'));
    if (h['content-encoding']) bad.push('content-encoding=' + h['content-encoding']);
    const b = r.body;
    if (r.buf.length >= 4096) bad.push('body ' + r.buf.length + ' B ≥ 4 KB');
    const ht = htmlTag(b);
    if (!/\bdata-tp-gone="moon-day"/.test(ht)) bad.push('no <html data-tp-gone="moon-day">');
    if (attrOf(ht, 'lang') !== row.L) bad.push('lang=' + attrOf(ht, 'lang') + ' want ' + row.L);
    if (dirOf && dirOf[row.L] && attrOf(ht, 'dir') !== dirOf[row.L]) bad.push('dir=' + attrOf(ht, 'dir') + ' want ' + dirOf[row.L]);
    if (!/<meta name="robots" content="noindex">/.test(b)) bad.push('no <meta name="robots" content="noindex">');
    if (!/<title>410<\/title>/.test(b)) bad.push('no <title>410</title>');
    if (/<script\b/i.test(b)) bad.push('has <script');
    if (/<style\b/i.test(b) || /\sstyle=/i.test(b)) bad.push('has style');
    if (/rel=["']canonical["']/i.test(b)) bad.push('has canonical');
    if (/id="page-moon"/.test(b)) bad.push('has id="page-moon"');
    if (/ssr-moon-year-range/.test(b)) bad.push('has ssr-moon-year-range');
    if (/googlesyndication/.test(b)) bad.push('has googlesyndication');
    const links = [...b.matchAll(/\bhref="([^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
    const P = lp(row.L);
    if (!links.includes(P + '/moon')) bad.push('no link ' + (P + '/moon'));
    const hubRe = /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon\/[a-z][a-z0-9-]+\/[a-z][a-z0-9-]+$/;
    const monRe = /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon\/[a-z][a-z0-9-]+\/[a-z][a-z0-9-]+\/\d{4}\/\d{2}$/;
    const hubs = links.filter((x) => hubRe.test(x)), months = links.filter((x) => monRe.test(x));
    if (typeof row.hub === 'string' && row.hub !== 'may' && row.hub !== 'none' && !hubs.includes(row.hub)) bad.push('no hub link ' + row.hub + ' (hubs=' + JSON.stringify(hubs) + ')');
    if (row.hub === 'none' && hubs.length) bad.push('unexpected hub link ' + hubs.join(','));
    if (typeof row.month === 'string' && row.month !== 'may' && !months.includes(row.month)) bad.push('no month link ' + row.month + ' (months=' + JSON.stringify(months) + ')');
    if (row.month === null && months.length) bad.push('month link on a request without year+month: ' + months.join(','));
    const others = links.filter((x) => x !== P + '/moon' && !hubRe.test(x) && !monRe.test(x));
    if (others.length) bad.push('other links ' + JSON.stringify(others));
    const rm = links.filter(isRemovedTarget);
    if (rm.length) bad.push('links to removed pages ' + JSON.stringify(rm));
    for (const x of links) if (!x.startsWith(P + '/moon')) bad.push('link not in the request locale: ' + x);
    const text = b.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return { bad, links, text };
}

async function sectionA0(base, rows) {
    section('[A0] BASE ground truth — every [A] URL ends at a 200 #page-moon day/today page on BASE today');
    let good = 0;
    for (const row of rows) {
        if (row.warm) await get(base, row.warm);
        const h = { ...row.headers }; delete h['Accept-Encoding'];   // read BASE bodies uncompressed
        const f = await follow(base, row.path, h);
        const okRow = f.r.status === 200 && /id="page-moon"/.test(f.r.body) && isRemovedPagePath(f.final);
        if (okRow) good++;
        else ok('A0', false, 'BASE ends at a day/today page  ' + row.path + (row.headers.Host ? ' (Host ' + row.headers.Host + ')' : ''), f.hops.join(' → '));
        row.baseHops = f.hops.length - 1;
    }
    ok('A0', good === rows.length, good + '/' + rows.length + ' [A] URLs end at a 200 #page-moon day/today page on BASE (hops: ' +
        JSON.stringify(rows.reduce((m, r) => { m[r.baseHops] = (m[r.baseHops] || 0) + 1; return m; }, {})) + ')');
}

async function sectionA(subj, rows, dirOf) {
    section('[A] 410 matrix — ONE response each (' + rows.length + ' rows; dates in-window ' + iso(D_IN) + ', past ' + iso(D_PAST) + ', future ' + iso(D_FUT) + ', MIN ' + MIN + ', MAX ' + MAX + ', leap ' + iso(D_LEAP) + ')');
    const texts = new Map(); const allLinks = new Set();
    for (const row of rows) {
        if (row.warm) await get(subj, row.warm);
        const r = await get(subj, row.path, row.headers);
        const { bad, links, text } = check410(r, row, dirOf);
        links.forEach((x) => allLinks.add(x));
        if (r.status === 410) { const k = row.city + '|' + row.shape; if (!texts.has(k)) texts.set(k, {}); texts.get(k)[row.L] = text; }
        ok('A', bad.length === 0, '410 ' + row.L + ' ' + row.cls + ' ' + row.city + ' — ' + row.shape + '  ' + row.path + (row.headers.Host ? ' (Host ' + row.headers.Host + ')' : ''), bad.join(' ; '));
    }
    section('[A+] 410 body summary');
    const k0 = 'riyadh|nested-day in window ' + iso(D_IN);
    const t = texts.get(k0) || {};
    const got = LANGS.filter((L) => t[L]);
    ok('A+', got.length === 10 && new Set(got.map((L) => t[L])).size === 10, 'the 10 locale bodies of ' + k0 + ' carry 10 distinct messages', 'locales=' + got.join(','));
    const scriptOk = (L, s) => (L === 'ar' || L === 'ur') ? /[\u0600-\u06FF]/.test(s) : L === 'bn' ? /[\u0980-\u09FF]/.test(s) : (/[A-Za-z]{3,}/.test(s) && !/[\u0600-\u06FF\u0980-\u09FF]/.test(s));
    const badScript = got.filter((L) => !scriptOk(L, t[L]));
    ok('A+', got.length === 10 && badScript.length === 0, 'each locale message is written in its own script (ar/ur Arabic, bn Bengali, others Latin)', 'bad=' + badScript.join(',') + ' sample en=' + JSON.stringify((t.en || '').slice(0, 160)));
    info('ar message: ' + JSON.stringify((t.ar || '').slice(0, 200)));
    info('en message: ' + JSON.stringify((t.en || '').slice(0, 200)));
    let linkBad = [];
    for (const x of [...allLinks].sort()) {
        const f = await follow(subj, x, {}, 2);
        const okL = f.r.status === 200 && f.hops.length <= 2 && !isRemovedPagePath(f.final);
        if (!okL) linkBad.push(x + ' → ' + f.hops.join(' → '));
    }
    ok('A+', allLinks.size > 0 && linkBad.length === 0, 'every link in the 410 bodies (' + allLinks.size + ' unique) lands on a kept 200 page (≤ 1 redirect)', linkBad.slice(0, 8).join(' | '));
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// [B] stays 404
function build404() {
    const R = '/moon/saudi-arabia/riyadh';
    const dayIn = dp(D_IN), isoIn = iso(D_IN);
    const L = [
        // nested — retired MOON-CITY-DAY / MOON-CITY-TODAY smokes + guardrails + hub/year smokes
        R + '/today/test', R + '/today/' + CUR, R + '/Today', R + '/TODAY', '/en' + R + '/today/test',
        R + '/' + CUR + '-06', R + '/' + CUR + '-06-17', '/en' + R + '/' + CUR + '-06-17', R + '/' + CUR + '-06/17',
        R + '/' + CUR + '/6/17', R + '/' + CUR + '/06/7', R + '/' + CUR + '/6', R + '/' + CUR + '/00', R + '/' + CUR + '/13',
        R + '/' + CUR + '/06/00', R + '/' + CUR + '/06/32', R + '/' + CUR + '/02/30', R + '/' + CUR + '/13/01', R + '/' + CUR + '/00/10',
        R + '/' + CUR + '/04/31', R + '/' + NONLEAP_Y + '/02/29', R + '/' + CUR + '/06/17/extra', R + dayIn + '/extra',
        R + '/1899/06/17', R + '/2101/06/17', R + '/' + (MIN - 1) + '/12/31', R + '/' + (MAX + 1) + '/01/01',
        R + '/' + (MIN - 1) + '/12/31.html', R + '/' + (MAX + 1) + '/01/01.html', '/en' + R + '/' + (MAX + 1) + '/01/01.html',
        '/fr' + R + '/' + (MIN - 1) + '/12/31', '/ms' + R + '/' + (MAX + 1) + '/01/01',
        '/moon/saudi-arabia/notacity/today', '/moon/saudi-arabia/notacity' + dayIn, '/en/moon/saudi-arabia/notacity/today',
        '/moon/zzz-not-a-country/riyadh/today', '/moon/zzz-not-a-country/riyadh' + dayIn,
        '/moon/saudi-arabia/zz-unknown-disc-city/today', '/moon/saudi-arabia/zz-unknown-disc-city' + dayIn,
        '/moon/today', '/en/moon/today', '/moon/saudi-arabia/today', '/moon/zzz-not-a-country',
        '/moon/saudi-arabia/notacity', '/moon/zzz-not-a-country/riyadh',
        // case-sensitive like the router
        '/Moon/saudi-arabia/riyadh/today', '/moon/Saudi-Arabia/riyadh/today', '/moon/saudi-arabia/Riyadh/today', '/moon/SA/riyadh/today',
        '/MOON-TODAY-IN-RIYADH', '/Moon-in-riyadh/' + isoIn,
        // not a locale prefix / malformed
        '/ar' + R + '/today', '/ar' + R + dayIn, '/ar/moon-today-in-riyadh', '/xx' + R + '/today',
        R + '/today.html/', R + dayIn + '.html/', R + '/today.htm', R + '/today.html.html',
        '/' + R + '/today', '/' + R + dayIn,
        // legacy — unresolved clean slugs, invalid dates, unsupported / Hijri years, coords + unsupported year
        '/moon-today-in-notacity', '/moon-today-in-notacityxyz', '/en/moon-today-in-notacity', '/moon-today-in-zz-unknown-disc-city',
        '/moon-in-notacity/' + isoIn, '/moon-in-notacityxyz', '/moon-in-notacityxyz/' + CUR + '-06', '/moon-in-notacity/' + CUR + '-06',
        '/moon-in-riyadh/' + CUR + '-06-32', '/moon-in-riyadh/' + CUR + '-13', '/moon-in-riyadh/' + CUR + '-13-01', '/moon-in-riyadh/' + CUR + '-02-30',
        '/moon-in-riyadh/' + NONLEAP_Y + '-02-29', '/en/moon-in-riyadh/' + CUR + '-02-30',
        '/moon-in-riyadh/1447-10-03', '/moon-in-riyadh/1447-10', '/en/moon-in-riyadh/1447-10-03',
        '/moon-in-riyadh/' + (MIN - 1) + '-12-31', '/moon-in-riyadh/' + (MAX + 1) + '-01-01', '/moon-in-riyadh/' + (MIN - 1) + '-12',
        '/moon-in-riyadh/' + (MAX + 1) + '-01', '/moon-in-riyadh/2101-01-01', '/fr/moon-in-riyadh/' + (MAX + 1) + '-01-01',
        '/moon-today-in-riyadh/' + (MIN - 1) + '-12-31', '/moon-today-in-riyadh/' + (MAX + 1) + '-01-01', '/en/moon-today-in-riyadh/' + (MAX + 1) + '-01-01',
        '/moon-in-riyadh-24.71-46.68/1899-06-17', '/moon-in-riyadh-24.71-46.68/' + (MAX + 1) + '-01-01',
        '/moon-in-riyadh-24.71-46.68/' + CUR + '-02-30', '/moon-in-riyadh-24.71-46.68/' + CUR + '-13-01',   // resolving coords + impossible date
        '/moon-in-zzqqnowhere-10.00-10.00/1447-10-03', '/moon-in-zzqqnowhere-10.00-10.00/' + (MAX + 1) + '-01-01',
        '/moon-today-in-riyadh-24.71-46.68/',               // decimal + '/': the trailing-slash rule's extension guard keeps it 404
        '/moon-today-in-riyadh.html', '/moon-in-riyadh/' + isoIn + '.html', '/moon-today-in-riyadh/' + isoIn + '.html',
        '/en/moon-today-in-riyadh.html',
    ];
    return [...new Set(L)];
}
// chains that END at 404 on BASE (a 301 first): the 404 must survive (kept 301 or a direct 404)
function build404Chains() {
    const isoIn = iso(D_IN);
    return ['/moon-today-in-notacity/' + isoIn, '/moon-today-in-notacity/',
        '/moon/today/', '/moon/saudi-arabia/notacity/today/', '/moon/zzz-not-a-country/riyadh/today/', '/en/moon-today-in-notacity/' + isoIn,
        // an UNRESOLVED coordinate slug + an impossible date: BASE 301 → /moon-today-in-{clean slug} → 404 (the 301 is kept)
        '/moon-in-zzqqnowhere-10.00-10.00/' + CUR + '-02-30', '/en/moon-in-zzqqnowhere-10.00-10.00/' + CUR + '-13-01',
        '/moon-today-in-zzqqnowhere-10.00-10.00/' + CUR + '-02-30'];
}
async function sectionB(subj, base, dirOf) {
    section('[B] stays 404 — exact 404 on the subject and on BASE, byte-identical body and the same headers as BASE');
    const keyH = (r) => JSON.stringify([r.headers['content-type'] || null, r.headers['cache-control'] || null, r.headers['x-robots-tag'] || null]);
    for (const p of build404()) {
        const r = await get(subj, p), b = subj === base ? r : await get(base, p);
        const bad = [];
        if (r.status !== 404) bad.push('subject ' + brief(r));
        if (b.status !== 404) bad.push('BASE ' + brief(b));
        if (r.headers.location) bad.push('Location=' + r.headers.location);
        if (!r.buf.equals(b.buf)) bad.push('body differs from BASE (' + r.buf.length + ' B sha ' + sha(r.buf) + ' vs ' + b.buf.length + ' B sha ' + sha(b.buf) + ')');
        if (keyH(r) !== keyH(b)) bad.push('headers ' + keyH(r) + ' vs BASE ' + keyH(b));
        const kind = /noindex,nofollow/.test(String(r.headers['x-robots-tag'])) ? 'legacy-404' : /text\/plain/.test(String(r.headers['content-type'])) ? 'plain-404' : 'branded-404';
        ok('B', bad.length === 0, '404 (' + kind + ', same as BASE)  ' + p, bad.join(' ; '));
    }
    section('[B2] chains that end at 404 on BASE still end at 404');
    for (const p of build404Chains()) {
        const f = await follow(subj, p), g = subj === base ? f : await follow(base, p);
        const bad = [];
        if (f.r.status !== 404) bad.push('subject ' + f.hops.join(' → '));
        if (g.r.status !== 404) bad.push('BASE ' + g.hops.join(' → '));
        if (f.hops.length > g.hops.length) bad.push('more hops than BASE: ' + f.hops.join(' → '));
        if (f.r.status === 404 && g.r.status === 404 && !f.r.buf.equals(g.r.buf)) bad.push('final 404 body differs from BASE');
        ok('B2', bad.length === 0, 'ends at 404 (subject ' + (f.hops.length - 1) + ' hop(s), BASE ' + (g.hops.length - 1) + ')  ' + p, bad.join(' ; '));
    }
    // An UNRESOLVED coordinate slug + an impossible date keeps its BASE chain (301 → 404) in [B2] above: the chain
    //   ended at 404 before, so it must still end at 404. A RESOLVING coordinate slug + an impossible date stays the
    //   direct legacy 404 (in [B] above).
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// [C] kept pages + kept 301s
function keptPages() {
    const out = [];
    for (const L of ['ar', 'en', 'fr']) {
        const P = lp(L);
        out.push(P + '/moon', P + '/moon/saudi-arabia');
        for (const s of ['riyadh', DB_SLUG]) {
            const nb = P + '/moon/saudi-arabia/' + s;
            out.push(nb, nb + '/' + CUR, nb + '/' + CUR + '/' + MM);
        }
    }
    out.push('/moon/saudi-arabia/riyadh/' + MIN, '/moon/saudi-arabia/riyadh/' + MAX + '/12', '/moon/saudi-arabia/an-nabiah', '/moon/saudi-arabia/an-nabiah/' + CUR + '/' + MM,
        '/tr/moon/saudi-arabia/riyadh', '/ur/moon/saudi-arabia/riyadh/' + CUR + '/' + MM, '/bn/moon/saudi-arabia/riyadh/' + CUR, '/moon/saudi-arabia/orig-only-city');
    return out;
}
function kept301() {
    const R = '/moon/saudi-arabia/riyadh';
    return ['/moon-in-riyadh', '/en/moon-in-riyadh', '/fr/moon-in-riyadh', '/moon-in-riyadh/' + CUR + '-' + MM, '/en/moon-in-riyadh/' + CUR + '-' + MM,
        '/moon-in-' + DB_SLUG, '/moon-in-' + DB_SLUG + '/' + CUR + '-' + MM, '/moon-in-riyadh-24.71-46.68', '/moon-in-riyadh-24.71-46.68/' + CUR + '-' + MM,
        R + '?cal=' + CUR + '-' + MM, '/en' + R + '?cal-y=' + CUR + '&cal-m=' + UTC_M, '/moon-in-riyadh?cal=' + CUR + '-' + MM,
        '/moon-today', '/en/moon-today', '/fr/moon-today', '/moon-today/', '/moon/united-states/riyadh', R + '/', R + '/' + CUR + '/', R + '/' + CUR + '/' + MM + '/',
        R + '.html', R + '/' + CUR + '.html', R + '/' + CUR + '/' + MM + '.html', '/moon-in-orig-only-city', '/moon-in-riyadh-region', '/moon-in-mecca'];
}
async function sectionC(subj, base) {
    section('[C] kept pages — 200, self canonical, hreflang, SEO fields identical to BASE');
    const fields = (r) => ({ status: r.status, location: r.headers.location || null, canonical: canonicalOf(r.body), robots: metaRobots(r.body),
        xrt: r.headers['x-robots-tag'] || null, title: titleOf(r.body), description: metaDesc(r.body), hreflang: hreflangPairs(r.body) });
    for (const p of keptPages()) {
        const r = await cget(subj, p), b = subj === base ? r : await cget(base, p);
        const a = fields(r), z = fields(b);
        const bad = [];
        if (a.status !== 200 || a.location) bad.push('subject ' + brief(r));
        if (a.canonical !== SITE + p) bad.push('canonical=' + a.canonical);
        if (a.hreflang.length < 11) bad.push('hreflang pairs=' + a.hreflang.length);
        for (const k of Object.keys(a)) if (!eq(a[k], z[k])) bad.push(k + ': ' + JSON.stringify(a[k]).slice(0, 160) + ' vs BASE ' + JSON.stringify(z[k]).slice(0, 160));
        ok('C', bad.length === 0, 'kept 200 + SEO === BASE (robots ' + JSON.stringify(a.robots) + ')  ' + p, bad.join(' ; '));
    }
    section('[C] kept 301s identical to BASE (status, Location, Cache-Control)');
    for (const p of kept301()) {
        const r = await get(subj, p), b = subj === base ? r : await get(base, p);
        const f = (x) => [x.status, x.headers.location || null, x.headers['cache-control'] || null];
        const bad = [];
        if (!eq(f(r), f(b))) bad.push('subject ' + JSON.stringify(f(r)) + ' vs BASE ' + JSON.stringify(f(b)));
        if (r.status !== 301) bad.push('not a 301: ' + brief(r));
        if (r.headers.location && isRemovedTarget(r.headers.location)) bad.push('Location is a removed page');
        ok('C', bad.length === 0, '301 → ' + (r.headers.location || '-') + ' (=== BASE)  ' + p, bad.join(' ; '));
    }
    const rt = await get(subj, '/robots.txt'), rb = subj === base ? rt : await get(base, '/robots.txt');
    ok('C', rt.status === 200 && rt.buf.equals(rb.buf), 'robots.txt byte-identical to BASE', 'subject ' + sha(rt.buf) + ' vs ' + sha(rb.buf));
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// [D] links
function linkPages() {
    const pages = ['/', '/en', '/fr', '/prayer-times-in-riyadh', '/en/prayer-times-in-riyadh', '/qibla-in-riyadh', '/en/qibla-in-riyadh',
        '/next-prayer-in-riyadh', '/en/next-prayer-in-riyadh', '/time-left-until-next-prayer-in-riyadh', '/en/time-left-until-next-prayer-in-riyadh',
        '/prayer-times-in-' + DB_SLUG, '/today-hijri-date', '/en/today-hijri-date'];
    for (const L of ['ar', 'en']) {
        const P = lp(L);
        pages.push(P + '/moon', P + '/moon/saudi-arabia');
        for (const s of ['riyadh', DB_SLUG]) { const nb = P + '/moon/saudi-arabia/' + s; pages.push(nb, nb + '/' + CUR, nb + '/' + CUR + '/' + MM); }
    }
    pages.push('/moon/saudi-arabia/riyadh/2026/06', '/moon/saudi-arabia/orig-only-city', '/moon/egypt', '/moon/united-states/new-york');
    return [...new Set(pages)];
}
async function sectionD(subj, base) {
    section('[D1] raw SSR — 0 links to removed pages (attribute values, JSON-LD strings, inline-script string literals)');
    for (const p of linkPages()) {
        const r = await cget(subj, p);
        const hits = r.status === 200 ? removedHits(r.body) : [];
        let baseNote = '';
        if (subj !== base) { const b = await cget(base, p); baseNote = ' (BASE ' + removedHits(b.body).length + ')'; }
        ok('D1', r.status === 200 && !r.headers.location && hits.length === 0, '0 removed targets' + baseNote + '  ' + p,
            r.status !== 200 ? brief(r) : (hits.length + ' hit(s): ' + hits.slice(0, 6).map((x) => x.where + '=' + x.v.slice(0, 90)).join(' | ')));
    }
    section('[D2] markup contract on the kept pages');
    const R = '/moon/saudi-arabia/riyadh';
    for (const L of ['ar', 'en']) {
        const P = lp(L);
        const hubB = noComments((await cget(subj, P + R)).body);
        ok('D2', !/id="mc-exp-d"/.test(hubB) && /id="mc-exp-y"/.test(hubB) && /id="mc-exp-m"/.test(hubB), 'hub explore picker: year + month selects, no day select (#mc-exp-d)  ' + P + R);
        const inl = (b) => [...b.matchAll(/<script\b(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join('\n');
        ok('D2', !/\bd\.value\b/.test(inl(hubB)), 'hub: no inline script navigates with a day value (d.value)  ' + P + R);
        const exploreHrefs = [...((hubB.match(/<section[^>]*id="mc-explore"[\s\S]*?<\/section>/) || [''])[0]).matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
        ok('D2', exploreHrefs.length > 0 && exploreHrefs.every((x) => !isRemovedTarget(x) && x !== P + R), 'hub explore cards: no today card, no self link  ' + P + R, JSON.stringify(exploreHrefs));
        ok('D2', !/class="[^"]*\bmoon-hub-related-1\b/.test(hubB) && !/class="[^"]*\bmoon-city-hub-edu-link-today\b/.test(hubB),
            'hub: the .moon-hub-related-1 and .moon-city-hub-edu-link-today items are removed  ' + P + R);
        for (const p of [P + '/moon', P + R, P + R + '/' + CUR + '/' + MM, P + '/prayer-times-in-riyadh', P + '/']) {
            const b = noComments((await cget(subj, p.replace(/\/$/, '') || '/')).body);
            ok('D2', !/id="moon-date-nav"/.test(b) && !/id="moon-today-city-edu"/.test(b), 'no #moon-date-nav and no #moon-today-city-edu  ' + (p.replace(/\/$/, '') || '/'));
        }
        const monB = noComments((await cget(subj, P + R + '/' + CUR + '/' + MM)).body);
        const fl = (cls) => { const m = monB.match(new RegExp('<a\\b[^>]*class="[^"]*\\b' + cls + '\\b[^"]*"[^>]*>')); return m ? attrOf(m[0], 'href') : null; };
        const r1 = fl('moon-hub-related-1'), e1 = fl('moon-city-hub-edu-link-today');
        ok('D2', (r1 === null || r1 === P + R) && (e1 === null || e1 === P + R), 'month: .moon-hub-related-1 / .moon-city-hub-edu-link-today → the hub (or absent)  ' + P + R + '/' + CUR + '/' + MM, 'related-1=' + r1 + ' edu-today=' + e1);
        const cta = (monB.match(/<a\b[^>]*class="[^"]*\bmoon-hub-detail-cta\b[^>]*>/) || [null])[0];
        ok('D2', !cta || attrOf(cta, 'href') === P + R, 'month: the detail CTA (if any) links the hub', String(cta));
        const yB = noComments((await cget(subj, P + R + '/' + CUR)).body);
        const ytc = (yB.match(/<a\b[^>]*id="moon-year-today-cta"[^>]*>/) || [null])[0];
        ok('D2', !!ytc && attrOf(ytc, 'href') === P + R, 'year: #moon-year-today-cta links the hub  ' + P + R + '/' + CUR, String(ytc));
        const yTableDates = (yB.match(/<a\b[^>]*class="my-table-link"[^>]*href="[^"]*\/\d{4}\/\d{2}\/\d{2}"/g) || []).length;
        ok('D2', yTableDates === 0, 'year: no my-table-link to a day page', 'count=' + yTableDates);
        const cB = noComments((await cget(subj, P + '/moon/saudi-arabia')).body);
        ok('D2', !/id="mc-cap-d"/.test(cB) && /id="mc-cap-y"/.test(cB) && /id="mc-cap-m"/.test(cB) && !/\bd\.value\b/.test(inl(cB)), 'country capital picker: year + month, no #mc-cap-d, no d.value navigation  ' + P + '/moon/saudi-arabia');
        const cont = (cB.match(/id="cities-container"[\s\S]*?(?=<div class="pagination"|$)/) || [''])[0];
        const cards = [...cont.matchAll(/<a\b[^>]*class="[^"]*\bcity-link\b[^"]*"[^>]*>/g)].map((m) => attrOf(m[0], 'href'));
        const hubRe = new RegExp('^' + P.replace(/\//g, '\\/') + '\\/moon\\/saudi-arabia\\/[a-z0-9-]+$');
        ok('D2', cards.length > 0 && cards.every((x) => hubRe.test(x)), 'country grid: every SSR city card links a hub (' + cards.length + ' cards)  ' + P + '/moon/saudi-arabia', cards.filter((x) => !hubRe.test(x)).slice(0, 5).join(' '));
        for (const p of [P + '/moon', P + R]) {
            const b = noComments((await cget(subj, p)).body);
            const ul = (b.match(/<ul class="moon-cities-grid"[^>]*>([\s\S]*?)<\/ul>/) || [])[1];
            if (ul === undefined) { info('no .moon-cities-grid on ' + p); continue; }
            const hs = [...ul.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
            const re = new RegExp('^' + P.replace(/\//g, '\\/') + '\\/moon\\/[a-z-]+\\/[a-z0-9-]+$');
            ok('D2', hs.length >= 12 && hs.every((x) => re.test(x)), '.moon-cities-grid links are city hubs (' + hs.length + ')  ' + p, hs.filter((x) => !re.test(x)).slice(0, 5).join(' '));
        }
    }
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// [E] sitemaps
async function sitemapScan(port, label) {
    const idx = await get(port, '/sitemap.xml');
    const children = [...idx.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, ''));
    const res = { files: [], idxStatus: idx.status, childLocs: new Set(), legacyLocs: new Set(), children: children.length, legacy: 0 };
    const scan = (grp, p, r) => {
        const locs = [...r.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
        const hrefs = [...r.body.matchAll(/\shref="([^"]+)"/g)].map((m) => m[1]);
        const bad = [...locs, ...hrefs].filter((u) => isRemovedTarget(u.replace(/&amp;/g, '&')));
        const today = locs.filter((u) => /\/today$/.test(u)).length;
        const set = grp === 'index' ? res.childLocs : res.legacyLocs;
        locs.forEach((u) => set.add(u));
        res.files.push({ grp, p, status: r.status, locs: locs.length, hrefs: hrefs.length, bad: bad.length, today, sample: bad.slice(0, 3) });
    };
    for (const p of children) scan('index', p, await get(port, p));
    scan('legacy', '/sitemap-main.xml', await get(port, '/sitemap-main.xml')); res.legacy++;
    for (let n = 1; n <= 80; n++) {
        const p = '/sitemap-cities-' + n + '.xml';
        const r = await get(port, p);
        if (r.status !== 200) { info(label + ': ' + p + ' → ' + r.status + ' (end of the legacy shards)'); break; }
        scan('legacy', p, r); res.legacy++;
    }
    info(label + ': index children ' + children.length + ', legacy files ' + res.legacy + ', unique child locs ' + res.childLocs.size + ', unique legacy locs ' + res.legacyLocs.size);
    return res;
}
async function sectionE(subj, base) {
    section('[E] sitemaps — 0 /today and 0 day URLs (loc + xhtml:link) in every file');
    const s = await sitemapScan(subj, 'subject');
    ok('E', s.idxStatus === 200 && s.files.length > 2, '/sitemap.xml is 200 and lists children', 'status=' + s.idxStatus + ' files=' + s.files.length);
    let tot = 0, totBad = 0, totToday = 0;
    for (const f of s.files) {
        tot += f.locs; totBad += f.bad; totToday += f.today;
        ok('E', f.status === 200 && f.bad === 0, f.grp + ' ' + f.p + ': ' + f.locs + ' locs, ' + f.hrefs + ' alternates, 0 removed URLs', 'status=' + f.status + ' removed=' + f.bad + ' ' + f.sample.join(' '));
    }
    info('subject totals: ' + tot + ' locs across ' + s.files.length + ' files; removed URLs ' + totBad + '; /today locs ' + totToday);
    if (subj === base) return;
    const b = await sitemapScan(base, 'BASE');
    for (const [nm, A, B] of [['index children', s.childLocs, b.childLocs], ['legacy files', s.legacyLocs, b.legacyLocs]]) {
        const removed = [...B].filter((u) => !A.has(u)), added = [...A].filter((u) => !B.has(u));
        const baseToday = [...B].filter((u) => RM_NESTED.test(u) || RM_LEG_TODAY.test(u) || RM_LEG_DAY.test(u));
        const removedNonToday = removed.filter((u) => !(RM_NESTED.test(u) || RM_LEG_TODAY.test(u) || RM_LEG_DAY.test(u)));
        ok('E', added.length === 0 && removedNonToday.length === 0 && removed.length === baseToday.length,
            nm + ': subject loc set === BASE minus exactly BASE\'s ' + baseToday.length + ' today/day locs (BASE ' + B.size + ' → subject ' + A.size + ')',
            'added=' + added.length + ' ' + added.slice(0, 3).join(' ') + ' removedNonToday=' + removedNonToday.length + ' ' + removedNonToday.slice(0, 3).join(' '));
    }
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// [F] month grid
async function sectionF(subj, base) {
    section('[F] month grid — plain text cells, count === days in month, text === BASE, Meeus');
    const months = [['ar', 2026, 6], ['en', 2026, 6], ['ar', CUR, UTC_M], ['en', CUR, UTC_M], ['fr', CUR, UTC_M], ['ar', LEAP_Y, 2]];
    for (const [L, Y, M] of months) {
        if (Y < MIN || Y > MAX) { ok('F', false, 'month ' + Y + '/' + p2(M) + ' outside the supported years — update the smoke'); continue; }
        const p = lp(L) + '/moon/saudi-arabia/riyadh/' + Y + '/' + p2(M);
        const r = await cget(subj, p), b = subj === base ? r : await cget(base, p);
        const g = gridOf(r.body), gb = gridOf(b.body);
        const bad = [];
        if (r.status !== 200) bad.push(brief(r));
        if (!g) bad.push('no <ul class="moon-hub-cal-grid">');
        else {
            if (g.anchors !== 0) bad.push(g.anchors + ' <a> inside the grid');
            if (g.filled.length !== dimOf(Y, M)) bad.push('filled cells=' + g.filled.length + ' want ' + dimOf(Y, M));
            if (!eq(g.filled.map((c) => c.day), range(1, dimOf(Y, M)))) bad.push('day numbers not 1..' + dimOf(Y, M));
            const nb = g.filled.filter((c) => c.bodies !== 1).length;
            if (nb) bad.push(nb + ' cells without exactly one <div class="moon-hub-cal-cell-body">');
            const want = (Y === RIY_Y && M === RIY_M) ? 1 : 0;
            if (g.filled.filter((c) => c.today).length !== want) bad.push('--today cells=' + g.filled.filter((c) => c.today).length + ' want ' + want);
            if (gb && !eq(g.filled.map(cellText), gb.filled.map(cellText))) {
                const i = g.filled.findIndex((c, k) => !eq(cellText(c), gb.filled[k] && cellText(gb.filled[k])));
                bad.push('cell text differs from BASE at day ' + (i + 1) + ': ' + JSON.stringify(g.filled[i] && cellText(g.filled[i])) + ' vs ' + JSON.stringify(gb.filled[i] && cellText(gb.filled[i])));
            }
            if (!gb) bad.push('BASE has no grid');
        }
        ok('F', bad.length === 0, 'grid: 0 <a>, ' + dimOf(Y, M) + ' plain cells, cell text === BASE  ' + p, bad.join(' ; '));
    }
    const g = gridOf((await cget(subj, '/moon/saudi-arabia/riyadh/2026/06')).body);
    const cell = (d) => (g && g.filled.find((c) => c.day === d)) || {};
    ok('F', /محاق/.test(cell(15).name || '') && /يُتحرى هلال الشهر/.test(cell(15).watch || '') && /هلال متزايد/.test(cell(16).name || '')
        && /أحدب متزايد/.test(cell(29).name || '') && /بدر/.test(cell(30).name || ''),
        'Meeus 2026/06 via the cells: 15 محاق (+ crescent watch), 16 هلال متزايد, 29 أحدب متزايد, 30 بدر',
        JSON.stringify([15, 16, 29, 30].map((d) => [d, cell(d).name, cell(d).watch])));
    const d15 = await get(base, '/moon/saudi-arabia/riyadh/2026/06/15'), d30 = await get(base, '/moon/saudi-arabia/riyadh/2026/06/30');
    ok('F', d15.status === 200 && d15.body.includes('المحاق') && d30.status === 200 && d30.body.includes('البدر'),
        'BASE cross-check: BASE day pages 2026/06/15 = المحاق and 2026/06/30 = البدر (same engine as the cells)', 'base15=' + d15.status + ' base30=' + d30.status);
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// [G] cheap path
function staticOrder(root) {
    section('[G1] source order in the request handler (' + root + ')');
    const src = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
    const start = src.indexOf('http.createServer(async (req, res) => {');
    ok('G', start > 0, 'server.js has the request handler http.createServer(async (req, res) => {');
    if (start < 0) return;
    const code = src.slice(start).split(/\r?\n/).map((l) => l.replace(/\/\/.*$/, ''));
    const gateRe = process.env.TP_GONE_GATE_RE ? new RegExp(process.env.TP_GONE_GATE_RE) : /\b[A-Za-z_$][\w$]*[Gg]one[\w$]*\s*\(/;
    const first = (re) => code.findIndex((l) => re.test(l));
    const gate = first(gateRe), ml = first(/\b_mlStart\(/), shed = first(/\b_shedReject\(/), pre = first(/\b_prefetchDiscoveredForSsr\(/),
        ssr = first(/\bserveHtmlWithSeo\(/), hdr = first(/res\.setHeader\('X-Content-Type-Options'/), www = first(/startsWith\('www\.'\)/);
    info('handler-relative lines: gate ' + gate + ' (' + (gate >= 0 ? code[gate].trim().slice(0, 100) : '-') + '), _mlStart ' + ml + ', _shedReject ' + shed + ', security headers ' + hdr + ', www 301 ' + www + ', _prefetchDiscoveredForSsr ' + pre + ', serveHtmlWithSeo ' + ssr);
    ok('G', gate >= 0, 'a 410 gate call (identifier containing "gone") exists in the handler');
    ok('G', gate >= 0 && ml >= 0 && ml < gate, '_mlStart( runs before the gate (so [moon-load] counts the 410s)');
    for (const [nm, i] of [['_shedReject(', shed], ['the security headers / CSP nonce', hdr], ['the www 301', www], ['_prefetchDiscoveredForSsr(', pre], ['serveHtmlWithSeo(', ssr]]) {
        ok('G', gate >= 0 && i > gate, 'the 410 gate precedes ' + nm, 'gate=' + gate + ' ' + nm + '=' + i);
    }
}
// a minimal keep-alive HTTP/1.1 client on ONE raw socket: times request-write → last body byte, without the Node http
//   client's own parser/agent overhead (that overhead alone is ~1 ms on Windows and would dominate a 410 measurement)
function rawClient(port) {
    const net = awaitImportNet;
    const sock = net.connect(port, '127.0.0.1'); sock.setNoDelay(true);
    let buf = Buffer.alloc(0), pending = null;
    const tryDone = () => {
        if (!pending) return;
        const he = buf.indexOf('\r\n\r\n'); if (he < 0) return;
        const head = buf.slice(0, he).toString('latin1');
        const status = +((head.match(/^HTTP\/1\.1 (\d{3})/) || [])[1] || 0);
        const cl = head.match(/\r\ncontent-length:\s*(\d+)/i);
        let end = -1;
        if (cl) { if (buf.length >= he + 4 + +cl[1]) end = he + 4 + +cl[1]; }
        else if (/\r\ntransfer-encoding:\s*chunked/i.test(head)) { const z = buf.indexOf('\r\n0\r\n\r\n', he); if (z >= 0) end = z + 7; }
        else end = buf.length;
        if (end < 0) return;
        buf = buf.slice(end);
        const p = pending; pending = null; p.resolve({ status, ms: performance.now() - p.t0 });
    };
    sock.on('data', (d) => { buf = Buffer.concat([buf, d]); tryDone(); });
    const ready = new Promise((r) => sock.once('connect', r));
    return {
        async req(p) {
            await ready;
            return new Promise((resolve) => {
                pending = { resolve, t0: performance.now() };
                sock.write('GET ' + p + ' HTTP/1.1\r\nHost: 127.0.0.1:' + port + '\r\nUser-Agent: ' + UA + '\r\nAccept-Encoding: identity\r\nConnection: keep-alive\r\n\r\n');
            });
        },
        close() { try { sock.destroy(); } catch (_) {} },
    };
}
let awaitImportNet = null;
let RAW_410 = 0;   // 410s answered on the raw timing socket (not counted by get())
async function timing(subj) {
    section('[G2] latency — 200 sequential 410s vs 50 month renders (keep-alive, one socket)');
    awaitImportNet = await import('node:net');
    const agent = new http.Agent({ keepAlive: true, maxSockets: 1 });
    const goneUrls = ['/moon/saudi-arabia/riyadh' + dp(D_IN), '/moon/saudi-arabia/riyadh/today', '/moon-today-in-riyadh', '/moon-in-riyadh/' + iso(D_IN),
        '/en/moon/saudi-arabia/riyadh' + dp(D_PAST), '/moon-today-in-riyadh-24.71-46.68', '/fr/moon/saudi-arabia/an-nabiah/today', '/moon/saudi-arabia/' + DB_SLUG + dp(D_FUT)];
    // control + primary on a raw keep-alive socket: /health (the cheapest route) vs the 410s
    const raw = rawClient(subj);
    for (let i = 0; i < 10; i++) { await raw.req('/health'); await raw.req(goneUrls[i % goneUrls.length]); }
    const healthRaw = [], goneRaw = []; let rawNon410 = 0;
    for (let i = 0; i < 200; i++) { healthRaw.push((await raw.req('/health')).ms); const r = await raw.req(goneUrls[i % goneUrls.length]); goneRaw.push(r.ms); if (r.status !== 410) rawNon410++; }
    raw.close();
    RAW_410 += 200 + 10;
    info('raw socket: 410 median ' + median(goneRaw).toFixed(3) + ' ms (p90 ' + [...goneRaw].sort((a, b) => a - b)[179].toFixed(3) + ') vs /health median ' + median(healthRaw).toFixed(3) + ' ms');
    ok('G', rawNon410 === 0, 'raw socket: all 200 timing requests answered 410', 'non-410=' + rawNon410);
    // The ticket's bar is "< 2 ms median locally". On a machine whose loopback round trip for the cheapest route
    //   (/health) is itself ≥ 1.5 ms, the bar becomes "within 0.5 ms of /health" — both numbers are printed above.
    const g2 = Math.max(2, median(healthRaw) + 0.5);
    ok('G', median(goneRaw) < g2, '410 median < 2 ms locally (raw keep-alive socket, request write → last byte; bar ' + g2.toFixed(2) + ' ms, /health ' + median(healthRaw).toFixed(3) + ' ms)', median(goneRaw).toFixed(3) + ' ms');
    if (median(goneRaw) >= 2) info('410 median ' + median(goneRaw).toFixed(3) + ' ms is NOT below the absolute 2 ms: this machine\'s /health floor is ' + median(healthRaw).toFixed(3) + ' ms');
    ok('G', median(goneRaw) - median(healthRaw) < 1, '410 costs < 1 ms more than /health (median difference)', (median(goneRaw) - median(healthRaw)).toFixed(3) + ' ms');
    for (let i = 0; i < 5; i++) await get(subj, goneUrls[i % goneUrls.length], {}, agent);
    const goneMs = []; let non410 = 0;
    for (let i = 0; i < 200; i++) { const r = await get(subj, goneUrls[i % goneUrls.length], {}, agent); goneMs.push(r.ms); if (r.status !== 410) non410++; }
    const monthUrl = '/moon/saudi-arabia/riyadh/' + CUR + '/' + MM;
    await get(subj, monthUrl, {}, agent);
    const monMs = []; let non200 = 0;
    for (let i = 0; i < 50; i++) { const r = await get(subj, monthUrl, {}, agent); monMs.push(r.ms); if (r.status !== 200) non200++; }
    agent.destroy();
    const g = median(goneMs), m = median(monMs);
    info('410 median ' + g.toFixed(3) + ' ms (p90 ' + [...goneMs].sort((a, b) => a - b)[179].toFixed(3) + ' ms, max ' + Math.max(...goneMs).toFixed(3) + ' ms); month render median ' + m.toFixed(1) + ' ms; ratio ' + (m / g).toFixed(0) + 'x');
    ok('G', non410 === 0, 'all 200 timing requests answered 410', 'non-410=' + non410);
    ok('G', non200 === 0, 'all 50 month renders answered 200', 'non-200=' + non200);
    info('Node http client (keep-alive agent) 410 median ' + g.toFixed(3) + ' ms (includes the client parser; the < 2 ms gate above uses the raw socket)');
    ok('G', g * 10 < m, '410 median at least 10x cheaper than a month render', g.toFixed(3) + ' vs ' + m.toFixed(1) + ' ms');
}
async function moonLoad(child, subj) {
    section('[G3] [moon-load] / [req-family] — every 410 counted as outcome "gone" in the fastest bucket');
    const last = LAST_REQ.get(subj) || Date.now();
    const t0 = Date.now();
    while (Date.now() - t0 < 30000) {
        if (child.lines.some((x) => x.line.startsWith('[req-family] {') && x.t > last + 500)) break;
        await sleep(250);
    }
    const flushed = child.lines.some((x) => x.line.startsWith('[req-family] {') && x.t > last + 500);
    ok('G', flushed, 'a [moon-load] window flushed after the last request (TP_MOON_LOAD_OBS_WINDOW_S=10)', 'lines=' + child.lines.length);
    const rows = (prefix) => {
        const out = [];
        for (const { line } of child.lines) {
            if (!line.startsWith(prefix)) continue;
            try { const j = JSON.parse(line.slice(prefix.length)); const cols = String(j.cols).split(','); for (const r of j.rows) { const o = {}; cols.forEach((c, i) => { o[c] = r[i]; }); out.push(o); } } catch (_) { /* skip */ }
        }
        return out;
    };
    const ml = rows('[moon-load] '), rf = rows('[req-family] ');
    const n410 = ((STAT.get(subj) || new Map()).get(410) || 0) + RAW_410;
    const gone = ml.filter((r) => r.outcome === 'gone');
    const goneN = gone.reduce((s, r) => s + Number(r.n), 0);
    const bucketCols = ml.length ? Object.keys(ml[0]).filter((k) => /^(lt|ge)\d+$/.test(k)) : [];
    const fast = bucketCols[0] || 'lt25';
    const goneFast = gone.reduce((s, r) => s + Number(r[fast] || 0), 0);
    const byFam = gone.reduce((m, r) => { m[r.family] = (m[r.family] || 0) + Number(r.n); return m; }, {});
    info('subject answered ' + n410 + ' x 410; [moon-load] gone rows n=' + goneN + ' by family ' + JSON.stringify(byFam) + '; fastest bucket "' + fast + '" holds ' + goneFast + '; buckets ' + bucketCols.join(','));
    ok('G', n410 > 0 && goneN === n410, '[moon-load] outcome "gone" counts every 410 the subject answered', 'gone=' + goneN + ' 410s=' + n410);
    ok('G', fast === 'lt25', 'the [moon-load] histogram has a <25 ms bucket (lt25)', 'first bucket=' + fast);
    ok('G', goneN > 0 && goneFast / goneN >= 0.98, '≥ 98% of the "gone" rows sit in the <25 ms bucket', goneFast + '/' + goneN);
    const famGone = rf.filter((r) => r.family === 'moon-gone').reduce((s, r) => s + Number(r.n), 0);
    ok('G', famGone === n410, '[req-family] family "moon-gone" counts every 410', 'moon-gone=' + famGone + ' 410s=' + n410 + ' families=' + JSON.stringify([...new Set(rf.filter((r) => /gone/.test(String(r.family) + String(r.outcome))).map((r) => r.family + '|' + r.outcome))]));
    const rendered = ml.filter((r) => ['day', 'today', 'legacy-day', 'legacy-today', 'coord-day', 'coord-today'].includes(r.family) && r.outcome === '2xx');
    ok('G', rendered.length === 0, 'no day / today family was ever rendered (0 rows with outcome 2xx)', JSON.stringify(rendered.slice(0, 5)));
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// [V] static
function stripJsComments(s) { return String(s).replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\'"])\/\/.*$/gm, '$1'); }
function staticChecks(root) {
    section('[V] static — asset versions, untouched engine, templates, CSS (' + root + ')');
    const rd = (r, f) => fs.readFileSync(path.join(r, f), 'utf8');
    const idx = rd(root, 'index.html'), ptc = rd(root, 'prayer-times-cities.html');
    const ver = (s, f) => { const m = s.match(new RegExp(f.replace(/[.]/g, '\\.') + '\\?v=(\\d+)')); return m ? +m[1] : null; };
    const bIdx = rd(BASE_ROOT, 'index.html'), bPtc = rd(BASE_ROOT, 'prayer-times-cities.html');
    for (const [nm, s, b, f] of [['index.html', idx, bIdx, 'js/app.js'], ['index.html', idx, bIdx, 'js/moon-chart.js'], ['index.html', idx, bIdx, 'js/site-search.js'], ['prayer-times-cities.html', ptc, bPtc, 'js/site-search.js']]) {
        ok('V', ver(s, f) !== null && ver(s, f) > ver(b, f), nm + ' busts ' + f + '?v above BASE', ver(b, f) + ' → ' + ver(s, f));
    }
    const cssChanged = rd(root, 'css/style.css') !== rd(BASE_ROOT, 'css/style.css');
    if (cssChanged) ok('V', ver(idx, 'css/style.css') > ver(bIdx, 'css/style.css'), 'css/style.css changed → index.html busts style.css?v', ver(bIdx, 'css/style.css') + ' → ' + ver(idx, 'css/style.css'));
    else info('css/style.css unchanged vs BASE');
    ok('V', fs.readFileSync(path.join(root, 'js/moon.js')).equals(fs.readFileSync(path.join(BASE_ROOT, 'js/moon.js'))), 'js/moon.js byte-identical to BASE (Meeus untouched)');
    const idxCode = stripJsComments(idx);
    const todayHrefs = (idxCode.match(/href="[^"]*\/moon\/[a-z-]+\/[a-z0-9-]+\/today"/g) || []);
    ok('V', todayHrefs.length === 0, 'index.html: 0 static hrefs to /moon/{c}/{city}/today', todayHrefs.slice(0, 3).join(' '));
    ok('V', !/id="moon-date-nav"/.test(idxCode) && !/id="moon-today-city-edu"/.test(idxCode), 'index.html: #moon-date-nav and #moon-today-city-edu removed');
    ok('V', /id="mtc-cta"[^>]*href="\/moon\/saudi-arabia\/makkah"|href="\/moon\/saudi-arabia\/makkah"[^>]*id="mtc-cta"/.test(idx), 'index.html: #mtc-cta default href /moon/saudi-arabia/makkah');
    const ptcCode = stripJsComments(ptc);
    ok('V', !/moon-today-in-/.test(ptcCode) && !/['"]\/today['"]/.test(ptcCode), "prayer-times-cities.html: no '/moon-today-in-' and no '/today' in code");
    const ss = stripJsComments(rd(root, 'js/site-search.js'));
    ok('V', !/moon-today-in-/.test(ss) && !/['"]\/today['"]/.test(ss) && !/\/today['"]/.test(ss), "js/site-search.js: no '/moon-today-in-' and no '/today' builder in code");
    // CSS: every non-interactive `.moon-hub-cal-cell … a` rule is mirrored on `.moon-hub-cal-cell-body`; no hover/pointer on the body
    const css = rd(root, 'css/style.css').replace(/\/\*[\s\S]*?\*\//g, '');
    const sels = [];
    for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) for (const s of m[1].split(',')) sels.push({ sel: s.trim().replace(/\s+/g, ' '), body: m[2] });
    const normSel = (s) => s.replace(/\s*>\s*/g, ' ').replace(/\s+/g, ' ').trim();
    const all = new Set(sels.map((x) => normSel(x.sel)));
    const anchorSels = [...new Set(sels.map((x) => x.sel).filter((s) => /\.moon-hub-cal-cell\b/.test(s) && /(?:^| |>)a(?=$|[\s.\[>:])/.test(s) && !/:(?:hover|focus|active|focus-visible)/.test(s)))];
    const missing = anchorSels.filter((s) => !all.has(normSel(s.replace(/(\s*>\s*|\s+)a(?=$|[\s.\[>:])/, ' .moon-hub-cal-cell-body'))));
    ok('V', anchorSels.length === 0 || missing.length === 0, 'css: every .moon-hub-cal-cell … a rule has a .moon-hub-cal-cell-body twin (' + anchorSels.length + ' anchor selectors)', missing.slice(0, 6).join(' | '));
    const hov = sels.filter((x) => /moon-hub-cal-cell-body/.test(x.sel) && (/:(?:hover|focus)/.test(x.sel) || /cursor\s*:\s*pointer/.test(x.body)));
    ok('V', all.size > 0 && [...all].some((s) => /moon-hub-cal-cell-body/.test(s)) && hov.length === 0, 'css: .moon-hub-cal-cell-body is styled and has no :hover / cursor:pointer affordance', hov.slice(0, 4).map((x) => x.sel).join(' | '));
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
async function main() {
    console.log('MOON-DAY-PAGES-REMOVAL-1 smoke — ' + (BASE_ONLY ? 'BASE-ONLY validation' : 'candidate vs BASE') + ' — UTC ' + NOW.toISOString() + ', supported years ' + MIN + '..' + MAX);
    console.log('  subject root ' + SUBJECT_ROOT + '   BASE root ' + BASE_ROOT + '   guard ' + GUARD + '   shed ' + (KEEP_SHED ? 'server default' : 'TP_MOON_DAY_SHED=0'));
    section('[pre] fixtures');
    ok('pre', fs.existsSync(GUARD) && !/\s/.test(GUARD), 'outbound guard present at a path without spaces');
    ok('pre', !curatedBySlug.has(DB_SLUG) && !!dbRow, DB_SLUG + ' is NOT curated and resolves through db/cities-sa.json (first match ' + (dbRow ? dbRow.lat + ',' + dbRow.lng : '-') + ')');
    ok('pre', curatedBySlug.has('riyadh') && curatedBySlug.has('an-nabiah'), 'riyadh and an-nabiah are curated');
    ok('pre', !!LEAP_Y && !!NONLEAP_Y, 'leap year ' + LEAP_Y + ' and non-leap year ' + NONLEAP_Y + ' inside ' + MIN + '..' + MAX);
    let subjChild = null, baseChild = null;
    const subj = BASE_ONLY ? BASE_PORT : CAND_PORT, base = BASE_PORT;
    try {
        baseChild = await boot(BASE_ROOT, BASE_PORT, 'base');
        subjChild = BASE_ONLY ? baseChild : await boot(ROOT, CAND_PORT, 'candidate');
        const rows = buildMatrix();
        // locale → html dir, measured on BASE
        const dirOf = {};
        for (const L of LANGS) dirOf[L] = attrOf(htmlTag((await get(base, lp(L) + '/moon')).body), 'dir');
        info('html dir per locale on BASE: ' + JSON.stringify(dirOf));
        if (want('A')) await sectionA(subj, rows, dirOf);           // first: the subject's discovered cache is still cold
        if (want('A0')) await sectionA0(base, rows);
        if (want('B')) await sectionB(subj, base, dirOf);
        if (want('C')) await sectionC(subj, base);
        if (want('D')) await sectionD(subj, base);
        if (want('F')) await sectionF(subj, base);
        if (want('E')) await sectionE(subj, base);
        if (want('V')) staticChecks(SUBJECT_ROOT);
        if (want('G')) { staticOrder(SUBJECT_ROOT); await timing(subj); await moonLoad(subjChild, subj); }
    } catch (e) {
        ok('run', false, 'unexpected error', e && e.stack || String(e));
    } finally {
        stop(subjChild); if (baseChild !== subjChild) stop(baseChild);
    }
    section('[N] outbound guard');
    for (const c of [baseChild, BASE_ONLY ? null : subjChild]) {
        if (!c) continue;
        const log = fs.existsSync(c.guardOut) ? fs.readFileSync(c.guardOut, 'utf8').trim() : '';
        ok('N', log === '', c.tag + ' server: 0 non-loopback connect / DNS / fetch attempts', log.split('\n').slice(0, 5).join(' | '));
    }
    const st = (p) => JSON.stringify(Object.fromEntries([...(STAT.get(p) || new Map()).entries()].sort((a, b) => a[0] - b[0])));
    info('status counts — subject :' + subj + ' ' + st(subj) + (BASE_ONLY ? '' : '   BASE :' + base + ' ' + st(base)));
    console.log('\n== per section ==');
    for (const [k, v] of Object.entries(SEC)) console.log('  ' + k.padEnd(4) + ' pass ' + String(v.pass).padStart(4) + '  fail ' + String(v.fail).padStart(4));
    let code;
    if (BASE_ONLY) {
        const s = (k) => SEC[k] || { pass: 0, fail: 0 };
        const valid = s('A').fail > 0 && s('A').pass === 0 && s('A0').fail === 0 && s('A0').pass > 0 && s('B').fail === 0 && s('B').pass > 0
            && s('B2').fail === 0 && s('C').fail === 0 && s('C').pass > 0 && s('N').fail === 0 && s('pre').fail === 0 && !SEC.run;
        console.log('\nBASE-ONLY VALIDATION: ' + (valid ? 'OK' : 'NOT OK') + ' — [A] must fail on every row (' + s('A').fail + ' failed, ' + s('A').pass + ' passed), [A0] ' + s('A0').fail + ' fail, [B] ' + s('B').fail + ' fail, [B2] ' + s('B2').fail + ' fail, [C] ' + s('C').fail + ' fail, [N] ' + s('N').fail + ' fail. [A+]/[D]/[E]/[F]/[G]/[V] are expected to fail on BASE (informational).');
        code = valid ? 0 : 1;
    } else {
        console.log('\n' + (fail === 0 ? 'PASS' : 'FAIL') + '  ' + pass + ' passed, ' + fail + ' failed');
        if (fails.length) { console.log('\nFailures:'); for (const f of fails.slice(0, 400)) console.log('  - ' + f); }
        code = fail === 0 ? 0 : 1;
    }
    try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (_) { /* keep */ }
    process.exit(code);
}
main();
