// HIJRI-DAY-PAGES-REMOVAL-1 — acceptance smoke (HTTP, 127.0.0.1 only).
//
// Owner decision under test (2026-10-15): every standalone Hijri day page /[lang/]hijri-date/YYYY-MM-DD — past, current
// and future days, all 10 languages — and every form that used to END at one (query, trailing slashes, the ar/en .html
// twin, www / onrender / IP hosts, HEAD / POST) answers 410 Gone in ONE response, from an early gate (before the shed,
// the header build, the router, any calendar / prayer work, SSR and compression). Everything that was a 404 stays the
// same 404 (byte-identical), chains that ended at a 404 still end at a 404. /today-hijri-date, /hijri-calendar (hub,
// year, month) and /date-converter are kept; the month table keeps every day's data as plain text. No link (SSR,
// JSON-LD, inline script, sitemap) points at a removed page. robots.txt is unchanged (the 410 must stay crawlable).
//
// Sections
//   [A0] BASE ground truth: every [A] GET URL ends at a 200 day page on BASE (<html class="… hijri-day-page">, ≤ 6 hops)
//   [A]  410 matrix — 10 locales × dates {mid 1447-09-15, today (Asia/Riyadh via the table), past, future, table MIN,
//        table MAX, a valid day 30} × shapes; the full shape set for ar + en. Each row: ONE response, 410, no Location,
//        the contract headers, body < 4 KB, data-tp-gone="hijri-day", lang/dir, noindex, <title>410</title>,
//        no script / style / canonical / ads, links = calendar hub + the month page + /today-hijri-date, in the locale
//   [A+] the 10 locale bodies differ and use the right script; every body link lands on a 200 (≤ 1 redirect)
//   [B]  stays 404: exact 404 on the subject AND on BASE, byte-identical body, same Content-Type / Cache-Control /
//        X-Robots-Tag (table-invalid dates, malformed shapes, fr..ms .html, .html/, case, encoding, neighbours, HEAD)
//   [B2] chains that end at 404 on BASE still end at 404 with no more hops (slash / .html / www on invalid dates)
//   [C]  kept pages: 200, no redirect, canonical / robots / X-Robots-Tag / title / description / hreflang === BASE;
//        content: year-table text === BASE with 0 day links, month tbody byte-identical, today page without the
//        prev/next card; kept 301s === BASE; robots.txt byte-identical
//   [D1] raw SSR: 0 /hijri-date/Y-M-D in attribute values, JSON-LD strings or inline-script string literals
//   [E]  sitemaps: 0 day URLs (loc + xhtml:link) in every file; subject loc set === BASE minus exactly BASE's day locs
//   [G]  cheap path: the gate precedes _shedReject( / headers / serveHtmlWithSeo( in the handler; 410 median < 2 ms
//        (raw keep-alive socket) and ≥ 10× cheaper than a month render; [req-family] 'hijri-gone' counts every 410,
//        no 'hijri-date' 2xx row
//   [V]  static: app.js ?v bumped, js/moon.js byte-identical, removed emitters gone from index.html / app.js / CSS
//   [N]  outbound guard: 0 non-loopback attempts by either server
//
// Boot (both servers, same env): node -r <guard.cjs> server.js with PORT, WEB_CONCURRENCY=1, TP_SSR_CACHE=0,
//   SITE_URL=https://timesprayers.com, SUPABASE_URL='', SUPABASE_SERVICE_ROLE_KEY='', ADSENSE_CLIENT=off,
//   TP_MOON_LOAD_OBS_WINDOW_S=10, GUARD_OUT=<temp log>, TP_MOON_DAY_SHED=0 (sequential renders; the gate-before-shed
//   order is proven statically in [G]).
//
// Usage
//   node scripts/_smoke_hijri_day_pages_removal_1.mjs               candidate = this worktree (:8451) vs BASE (:8452)
//   node scripts/_smoke_hijri_day_pages_removal_1.mjs --base-only   validate the smoke on BASE alone (:8453): every [A]
//                                                                   row must FAIL, [A0] / [B] / [B2] / [C] / [N] must pass
//   env TP_BASE_ROOT  BASE checkout (default C:/Users/Tarek/Downloads/timesprayers-gptbot = production a6fb163 tree)
//       TP_GUARD      outbound guard (default C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs; no spaces)
//       TP_SMOKE_ONLY comma list of sections (A0,A,B,C,D,E,G,V); default all
//       TP_HREMOVE_PORT first of the 3 ports (default 8451)
// Never run against production. No load: every request is sequential.
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import net from 'node:net';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_ROOT = process.env.TP_BASE_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-gptbot';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const BASE_ONLY = process.argv.includes('--base-only');
const ONLY = new Set(String(process.env.TP_SMOKE_ONLY || '').split(',').map((s) => s.trim().toUpperCase()).filter(Boolean));
const want = (s) => !ONLY.size || ONLY.has(s);
const SITE = 'https://timesprayers.com';
const PORT0 = Number(process.env.TP_HREMOVE_PORT || 8451);
const CAND_PORT = PORT0, BASE_PORT = BASE_ONLY ? PORT0 + 2 : PORT0 + 1;
const SUBJECT_ROOT = BASE_ONLY ? BASE_ROOT : ROOT;
const UA = 'tp-hijriremove-smoke/1';
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const lp = (L) => (L === 'ar' ? '' : '/' + L);
const p2 = (n) => String(n).padStart(2, '0');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sha = (b) => crypto.createHash('sha1').update(b).digest('hex').slice(0, 12);
const median = (a) => { const s = [...a].sort((x, y) => x - y); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : NaN; };

// ── the Umm al-Qura table (the server's own source) ──
const TABLE = JSON.parse(fs.readFileSync(path.join(ROOT, 'db', 'hijri', 'umm-al-qura.json'), 'utf8'));
const T_MIN = TABLE.range.startYear, T_MAX = TABLE.range.endYear;
const mdays = (y, m) => (y >= T_MIN && y <= T_MAX && TABLE.years[String(y)] && TABLE.years[String(y)].months[m - 1]) || 0;
function g2jd(year, month, day) {
    if (month <= 2) { year--; month += 12; }
    const A = Math.floor(year / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524;
}
function hijriFromTable(y, m, d) {
    const jd = g2jd(y, m, d);
    for (const [k, v] of Object.entries(TABLE.years)) {
        const [sy, sm, sd] = v.yearStart.split('-').map(Number);
        const s = g2jd(sy, sm, sd);
        const len = typeof v.yearLength === 'number' ? v.yearLength : v.months.reduce((a, b) => a + b, 0);
        if (jd >= s && jd < s + len) { let c = s; for (let i = 0; i < 12; i++) { if (jd < c + v.months[i]) return [Number(k), i + 1, jd - c + 1]; c += v.months[i]; } }
    }
    return null;
}
const NOW = new Date();
const [RY, RM, RD] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(NOW).split('-').map(Number);
const H_TODAY = hijriFromTable(RY, RM, RD);
const HY = H_TODAY ? H_TODAY[0] : 1448, HM = H_TODAY ? H_TODAY[1] : 1;
const hd = (d) => d[0] + '-' + p2(d[1]) + '-' + p2(d[2]);
// a valid day 30 and an invalid day 30 (a 29-day month) in the current year, both read from the table
const M30 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].find((m) => mdays(HY, m) === 30);
const M29 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].find((m) => mdays(HY, m) === 29);
const D = {
    mid: [1447, 9, 15], today: H_TODAY || [1448, 5, 4], past: [1360, 3, 10], future: [1490, 6, 10],
    min: [T_MIN, 1, 1], max: [T_MAX, 12, mdays(T_MAX, 12)], day30: [HY, M30, 30],
};
const D_BAD30 = [HY, M29, 30];
const RM_DAY = /\/hijri-date\/\d{4}-\d{2}-\d{2}(?:[?#"'\s/.<]|$)/;
const isRemovedTarget = (s) => RM_DAY.test(String(s));
const DAY_PAGE_PATH = /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-date\/\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|30)$/;

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
function get(port, urlPath, headers = {}, agent, method = 'GET') {
    return new Promise((resolve) => {
        const t0 = performance.now();
        const done = (o) => { const m = STAT.get(port) || new Map(); m.set(o.status, (m.get(o.status) || 0) + 1); STAT.set(port, m); LAST_REQ.set(port, Date.now()); resolve(o); };
        const h = { 'Accept-Encoding': 'identity', 'User-Agent': UA, ...headers };
        if (method === 'POST' || method === 'PUT') h['Content-Length'] = '0';
        const req = http.request({ host: '127.0.0.1', port, path: urlPath, method, agent: agent || undefined, headers: h }, (res) => {
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
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-hijriremove-'));
async function boot(root, port, tag) {
    const pre = await get(port, '/health');
    if (pre.status !== 0) throw new Error('port ' + port + ' already in use (a stale server would falsify results)');
    const guardOut = path.join(TMP, 'guard-' + tag + '.log');
    fs.writeFileSync(guardOut, '');
    const env = { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: SITE,
                  SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', ADSENSE_CLIENT: 'off',
                  TP_MOON_LOAD_OBS_WINDOW_S: '10', GUARD_OUT: guardOut, TP_MOON_DAY_SHED: '0' };
    for (const k of ['TP_ENABLE_SEARCH_TEST', 'TP_MOON_RANGE_TEST_NOW', 'NODE_OPTIONS', 'TP_MOON_LOAD_OBS', 'DISCOVERED_SSR_TEST_FIXTURE']) delete env[k];
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
            if (line.startsWith('[req-family] {')) child.lines.push({ t: Date.now(), line });
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
function hreflangPairs(b) { return [...noComments(b).matchAll(/<link\b[^>]*\bhreflang=["'][^"']+["'][^>]*>/gi)].map((m) => attrOf(m[0], 'hreflang') + ' ' + attrOf(m[0], 'href')).sort(); }
const htmlTag = (b) => (String(b).match(/<html\b[^>]*>/i) || [''])[0];
function walkStrings(v, fn) {
    if (typeof v === 'string') fn(v);
    else if (Array.isArray(v)) v.forEach((x) => walkStrings(x, fn));
    else if (v && typeof v === 'object') Object.values(v).forEach((x) => walkStrings(x, fn));
}
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
            for (const m of s.code.matchAll(/'((?:[^'\\\r\n]|\\.)*)'|"((?:[^"\\\r\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)) out.push({ where: 'script', v: (m[1] ?? m[2] ?? m[3]).replace(/\\\//g, '/') });
        }
    }
    return out;
}
const removedHits = (html) => linkCandidates(html).filter((x) => isRemovedTarget(x.v));
const block = (b, re) => { const m = String(b).match(re); return m ? m[0] : null; };
const textOf = (h) => String(h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// [A] matrix
function buildMatrix() {
    const rows = [];
    const add = (o) => rows.push({ headers: {}, method: 'GET', ...o });
    for (const L of LANGS) {
        const P = lp(L);
        for (const [k, d] of Object.entries(D)) add({ L, d, shape: 'canonical ' + k, path: P + '/hijri-date/' + hd(d) });
        const d = D.mid, base = P + '/hijri-date/' + hd(d);
        add({ L, d, shape: 'query', path: base + '?utm_source=a&utm_medium=b' });
        add({ L, d, shape: 'empty query', path: base + '?' });
        add({ L, d, shape: 'trailing slash', path: base + '/' });
        add({ L, d, shape: 'trailing slash + query', path: base + '/?x=1' });
        add({ L, d, shape: 'slash run', path: base + '/////' });
        add({ L, d, shape: 'HEAD', path: base, method: 'HEAD' });
        add({ L, d, shape: 'onrender host', path: base, headers: { Host: 'prayer-times-d4w8.onrender.com' } });
    }
    for (const L of ['ar', 'en']) {
        const P = lp(L);
        const d = D.mid, base = P + '/hijri-date/' + hd(d);
        add({ L, d, shape: '.html', path: base + '.html' });
        add({ L, d: D.today, shape: '.html today', path: P + '/hijri-date/' + hd(D.today) + '.html' });
        add({ L, d, shape: '.html + query', path: base + '.html?a=1&b=2' });
        add({ L, d, shape: '.html//', path: base + '.html//' });
        add({ L, d, shape: 'www host', path: base, headers: { Host: 'www.timesprayers.com' } });
        add({ L, d, shape: 'www host .html', path: base + '.html', headers: { Host: 'WWW.timesprayers.com' } });
        add({ L, d, shape: 'www host slash', path: base + '/', headers: { Host: 'www.timesprayers.com' } });
        add({ L, d, shape: 'www host .html//', path: base + '.html//', headers: { Host: 'www.timesprayers.com' } });
        add({ L, d, shape: 'POST', path: base, method: 'POST' });
        add({ L, d, shape: 'OPTIONS', path: base, method: 'OPTIONS' });
    }
    return rows;
}
function check410(r, row, dirOf) {
    const bad = [];
    if (r.status !== 410) { bad.push(brief(r)); return { bad, links: [] }; }
    const h = r.headers;
    const hv = (k) => (Array.isArray(h[k]) ? h[k].join(' | ') : h[k]);
    if (h.location) bad.push('Location=' + h.location);
    if (hv('content-type') !== 'text/html; charset=utf-8') bad.push('content-type=' + hv('content-type'));
    if (hv('cache-control') !== 'public, max-age=3600') bad.push('cache-control=' + hv('cache-control'));
    if (hv('x-robots-tag') !== 'noindex') bad.push('x-robots-tag=' + hv('x-robots-tag'));
    if (hv('x-content-type-options') !== 'nosniff') bad.push('nosniff=' + hv('x-content-type-options'));
    if (hv('x-frame-options') !== 'SAMEORIGIN') bad.push('x-frame-options=' + hv('x-frame-options'));
    if (hv('referrer-policy') !== 'strict-origin-when-cross-origin') bad.push('referrer-policy=' + hv('referrer-policy'));
    if (hv('content-security-policy') !== "default-src 'none'; frame-ancestors 'self'") bad.push('csp=' + hv('content-security-policy'));
    if (h['content-encoding']) bad.push('content-encoding=' + h['content-encoding']);
    if (h['set-cookie']) bad.push('set-cookie present');
    if (row.method === 'HEAD') {
        if (r.buf.length !== 0) bad.push('HEAD with a body of ' + r.buf.length + ' B');
        if (!(Number(hv('content-length')) > 0)) bad.push('HEAD content-length=' + hv('content-length'));
        return { bad, links: [] };
    }
    if (String(hv('content-length')) !== String(r.buf.length)) bad.push('content-length=' + hv('content-length') + ' vs body ' + r.buf.length);
    const b = r.body;
    if (r.buf.length >= 4096) bad.push('body ' + r.buf.length + ' B ≥ 4 KB');
    const ht = htmlTag(b);
    if (!/\bdata-tp-gone="hijri-day"/.test(ht)) bad.push('no <html data-tp-gone="hijri-day">');
    if (attrOf(ht, 'lang') !== row.L) bad.push('lang=' + attrOf(ht, 'lang') + ' want ' + row.L);
    if (dirOf && dirOf[row.L] && attrOf(ht, 'dir') !== dirOf[row.L]) bad.push('dir=' + attrOf(ht, 'dir') + ' want ' + dirOf[row.L]);
    if (!/<meta name="robots" content="noindex">/.test(b)) bad.push('no <meta name="robots" content="noindex">');
    if (!/<title>410<\/title>/.test(b)) bad.push('no <title>410</title>');
    if (/<script\b/i.test(b)) bad.push('has <script');
    if (/<style\b/i.test(b) || /\sstyle=/i.test(b)) bad.push('has style');
    if (/rel=["']canonical["']/i.test(b)) bad.push('has canonical');
    if (/id="page-hijri/.test(b) || /hijri-day-page/.test(b)) bad.push('has day-page markup');
    if (/googlesyndication|googletagmanager/.test(b)) bad.push('has ad / analytics tag');
    const links = [...b.matchAll(/\bhref="([^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
    const P = lp(row.L);
    const want = [P + '/hijri-calendar', P + '/hijri-calendar/' + row.d[0] + '-' + p2(row.d[1]), P + '/today-hijri-date'];
    if (!eq(links, want)) bad.push('links ' + JSON.stringify(links) + ' want ' + JSON.stringify(want));
    const rm = links.filter(isRemovedTarget);
    if (rm.length) bad.push('links to removed pages ' + JSON.stringify(rm));
    return { bad, links, text: textOf(b) };
}
const rowLabel = (row) => row.method + ' ' + row.path + (row.headers.Host ? ' (Host ' + row.headers.Host + ')' : '');
async function sectionA0(base, rows) {
    section('[A0] BASE ground truth — every [A] URL ends at a 200 Hijri day page on BASE');
    let good = 0;
    for (const row of rows) {
        let okRow, detail;
        if (row.method === 'GET') {
            const f = await follow(base, row.path, row.headers);
            okRow = f.r.status === 200 && /hijri-day-page/.test(htmlTag(f.r.body)) && DAY_PAGE_PATH.test(f.final.split('?')[0]);
            detail = f.hops.join(' → '); row.baseHops = f.hops.length - 1;
        } else {
            const r = await get(base, row.path, row.headers, undefined, row.method);
            okRow = r.status === 200; detail = brief(r); row.baseHops = 0;
        }
        if (okRow) good++; else ok('A0', false, 'BASE ends at a day page  ' + rowLabel(row), detail);
    }
    ok('A0', good === rows.length, good + '/' + rows.length + ' [A] URLs end at a 200 day page on BASE (hops: ' +
        JSON.stringify(rows.reduce((m, r) => { m[r.baseHops] = (m[r.baseHops] || 0) + 1; return m; }, {})) + ')');
}
async function sectionA(subj, rows, dirOf) {
    section('[A] 410 matrix — ONE response each (' + rows.length + ' rows; today ' + hd(D.today) + ' (Riyadh ' + RY + '-' + p2(RM) + '-' + p2(RD) + '), table ' + T_MIN + '..' + T_MAX + ', valid day 30 ' + hd(D.day30) + ')');
    const texts = {}; const allLinks = new Set();
    for (const row of rows) {
        const r = await get(subj, row.path, row.headers, undefined, row.method);
        const { bad, links, text } = check410(r, row, dirOf);
        links.forEach((x) => allLinks.add(x));
        if (r.status === 410 && row.shape === 'canonical mid') texts[row.L] = text;
        ok('A', bad.length === 0, '410 ' + row.L + ' — ' + row.shape + '  ' + rowLabel(row), bad.join(' ; '));
    }
    section('[A+] 410 body summary');
    const got = LANGS.filter((L) => texts[L]);
    ok('A+', got.length === 10 && new Set(got.map((L) => texts[L])).size === 10, 'the 10 locale bodies carry 10 distinct messages', 'locales=' + got.join(','));
    const scriptOk = (L, s) => (L === 'ar' || L === 'ur') ? /[\u0600-\u06FF]/.test(s) : L === 'bn' ? /[\u0980-\u09FF]/.test(s) : (/[A-Za-z]{3,}/.test(s) && !/[\u0600-\u06FF\u0980-\u09FF]/.test(s));
    const badScript = got.filter((L) => !scriptOk(L, texts[L]));
    ok('A+', got.length === 10 && badScript.length === 0, 'each locale message is in its own script (ar/ur Arabic, bn Bengali, others Latin)', 'bad=' + badScript.join(','));
    info('ar message: ' + JSON.stringify((texts.ar || '').slice(0, 220)));
    info('en message: ' + JSON.stringify((texts.en || '').slice(0, 220)));
    const linkBad = [];
    for (const x of [...allLinks].sort()) {
        const f = await follow(subj, x, {}, 2);
        if (!(f.r.status === 200 && f.hops.length <= 2 && !DAY_PAGE_PATH.test(f.final))) linkBad.push(x + ' → ' + f.hops.join(' → '));
    }
    ok('A+', allLinks.size > 0 && linkBad.length === 0, 'every link in the 410 bodies (' + allLinks.size + ' unique) lands on a kept 200 page (≤ 1 redirect)', linkBad.slice(0, 8).join(' | '));
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// [B] stays 404
function build404() {
    const m = hd(D.mid);
    const out = [
        // shape-valid, not in the table
        '/hijri-date/' + (T_MIN - 1) + '-12-29', '/hijri-date/' + (T_MIN - 1) + '-01-01', '/hijri-date/' + (T_MAX + 1) + '-01-01', '/hijri-date/0000-01-01', '/hijri-date/9999-01-01',
        '/hijri-date/' + hd(D_BAD30), '/en/hijri-date/' + hd(D_BAD30), '/fr/hijri-date/' + (T_MAX + 1) + '-01-01', '/ms/hijri-date/' + hd(D_BAD30) + '?x=1',
        '/hijri-date/1447-13-01', '/hijri-date/1447-00-01', '/hijri-date/1447-01-00', '/hijri-date/1447-01-31', '/de/hijri-date/1447-01-31',
        // malformed
        '/hijri-date/1447-1-1', '/hijri-date/1447-01-1', '/hijri-date/1447-1-01', '/hijri-date/14470-01-01', '/hijri-date/1447-09', '/hijri-date/1447',
        '/hijri-date/abc', '/hijri-date/1447-09-15-01', '/hijri-date/15-09-1447', '/hijri-date/1447_09_15', '/hijri-date/1-muharram-1447', '/de/hijri-date/1447-1-1',
        // fr..ms .html twins (a plain 404 even for a valid day) and other suffixes
        '/fr/hijri-date/' + m + '.html', '/tr/hijri-date/' + m + '.html', '/ur/hijri-date/' + m + '.html', '/ms/hijri-date/' + m + '.html',
        '/hijri-date/' + m + '.html/', '/en/hijri-date/' + m + '.html/', '/hijri-date/' + m + '.HTML', '/hijri-date/' + m + '.htm', '/hijri-date/' + m + '.json',
        '/hijri-date/' + m + '.html.html', '/hijri-date/' + m + '/.html', '/hijri-date/' + m + '/index.html', '/hijri-date/' + m + '.', '/hijri-date/' + m + '-',
        '/hijri-date/' + m + ';jsessionid=1',
        // prefixes, case, encoding, dot / double slashes
        '/ar/hijri-date/' + m, '/Hijri-Date/' + m, '/HIJRI-DATE/' + m, '/EN/hijri-date/' + m, '/En/hijri-date/' + m,
        '/hijri-date%2F' + m, '/%68ijri-date/' + m, '/en%2Fhijri-date/' + m, '/hijri-date/1447%2D09%2D15', '/hijri-date/%31447-09-15', '/hijri-date/' + m + '%20',
        '//hijri-date/' + m, '/en//hijri-date/' + m, '/x/../hijri-date/' + m, '/hijri-date//' + m, '/hijri-date/./' + m,
        // bare + neighbours
        '/hijri-date', '/en/hijri-date', '/today-hijri-date/' + m, '/hijri-calendar/' + m,
    ];
    return out;
}
function build404Chains() {
    const m = hd(D.mid);
    return [
        { p: '/hijri-date/' + hd(D_BAD30) + '/' }, { p: '/hijri-date/' + (T_MIN - 1) + '-01-01/' }, { p: '/hijri-date/1447-1-1/' },
        { p: '/hijri-date/' + hd(D_BAD30) + '.html' }, { p: '/en/hijri-date/' + (T_MAX + 1) + '-01-01.html' }, { p: '/en/hijri-date/' + hd(D_BAD30) + '.html' },
        { p: '/hijri-date/' + hd(D_BAD30) + '.html//' }, { p: '/hijri-date/1447-13-01.html//' }, { p: '/fr/hijri-date/' + m + '.html//' },
        { p: '/ar/hijri-date/' + m + '/' }, { p: '/hijri-date/' }, { p: '/en/hijri-date/' },
        { p: '/hijri-date/' + hd(D_BAD30), h: { Host: 'www.timesprayers.com' } }, { p: '/hijri-date/1447-1-1', h: { Host: 'www.timesprayers.com' } },
        { p: '/hijri-date/' + hd(D_BAD30) + '.html', h: { Host: 'www.timesprayers.com' } }, { p: '/fr/hijri-date/' + m + '.html', h: { Host: 'www.timesprayers.com' } },
    ];
}
async function sectionB(subj, base) {
    section('[B] stays 404 — exact 404 on the subject and on BASE, byte-identical body and the same headers as BASE');
    const keyH = (r) => JSON.stringify([r.headers['content-type'] || null, r.headers['cache-control'] || null, r.headers['x-robots-tag'] || null]);
    const kinds = {};
    for (const p of build404()) {
        const r = await get(subj, p), b = subj === base ? r : await get(base, p);
        const bad = [];
        if (r.status !== 404) bad.push('subject ' + brief(r));
        if (b.status !== 404) bad.push('BASE ' + brief(b));
        if (r.headers.location) bad.push('Location=' + r.headers.location);
        if (!r.buf.equals(b.buf)) bad.push('body differs from BASE (' + r.buf.length + ' B sha ' + sha(r.buf) + ' vs ' + b.buf.length + ' B sha ' + sha(b.buf) + ')');
        if (keyH(r) !== keyH(b)) bad.push('headers ' + keyH(r) + ' vs BASE ' + keyH(b));
        const kind = /text\/plain/.test(String(r.headers['content-type'])) ? 'plain' : /<title>404<\/title><h1>Not found/.test(r.body) ? 'round11' : 'branded';
        kinds[kind] = (kinds[kind] || 0) + 1;
        ok('B', bad.length === 0, '404 (' + kind + ', same as BASE)  ' + p, bad.join(' ; '));
    }
    for (const L of ['ar', 'en']) {
        const p = lp(L) + '/hijri-date/' + hd(D_BAD30);
        const r = await get(subj, p, {}, undefined, 'HEAD'), b = subj === base ? r : await get(base, p, {}, undefined, 'HEAD');
        ok('B', r.status === 404 && b.status === 404 && r.buf.length === 0, 'HEAD on an invalid date stays 404 (no body)  ' + p, brief(r) + ' BASE ' + brief(b));
    }
    info('404 kinds: ' + JSON.stringify(kinds));
    section('[B2] chains that end at 404 on BASE still end at 404');
    for (const { p, h } of build404Chains()) {
        const f = await follow(subj, p, h || {}), g = subj === base ? f : await follow(base, p, h || {});
        const bad = [];
        if (f.r.status !== 404) bad.push('subject ' + f.hops.join(' → '));
        if (g.r.status !== 404) bad.push('BASE ' + g.hops.join(' → '));
        if (f.hops.length > g.hops.length) bad.push('more hops than BASE: ' + f.hops.join(' → '));
        if (f.r.status === 404 && g.r.status === 404 && !f.r.buf.equals(g.r.buf)) bad.push('final 404 body differs from BASE');
        ok('B2', bad.length === 0, 'ends at 404 (subject ' + (f.hops.length - 1) + ' hop(s), BASE ' + (g.hops.length - 1) + ')  ' + p + (h ? ' (Host ' + h.Host + ')' : ''), bad.join(' ; '));
    }
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// [C] kept pages
function keptPages() {
    const out = [];
    for (const L of LANGS) out.push(lp(L) + '/today-hijri-date');
    for (const L of ['ar', 'en', 'fr', 'ur', 'bn']) {
        const P = lp(L);
        out.push(P + '/hijri-calendar', P + '/hijri-calendar/' + HY, P + '/hijri-calendar/' + HY + '-' + p2(HM));
    }
    out.push('/hijri-calendar/' + (HY - 1) + '-01', '/hijri-calendar/' + (HY + 1) + '-12', '/hijri-calendar/' + (HY - 1), '/en/hijri-calendar/' + (HY + 1),
        '/hijri-calendar/1447-09', '/date-converter', '/en/date-converter', '/hijri-new-year-countdown', '/en/eid-al-fitr-countdown', '/eid-al-adha-countdown',
        '/ramadan-countdown', '/', '/en', '/prayer-times-in-riyadh', '/en/prayer-times-in-makkah');
    return out;
}
function kept301() {
    return ['/today-hijri-date.html', '/en/today-hijri-date.html', '/hijri-calendar/1447-09.html', '/en/hijri-calendar/1447-09.html', '/today-hijri-date/',
        '/en/today-hijri-date/', '/hijri-calendar/' + HY + '/', '/hijri-calendar/' + HY + '-' + p2(HM) + '/'];
}
async function sectionC(subj, base) {
    section('[C] kept pages — 200, SEO fields identical to BASE');
    const fields = (r) => ({ status: r.status, location: r.headers.location || null, canonical: canonicalOf(r.body), robots: metaRobots(r.body),
        xrt: r.headers['x-robots-tag'] || null, title: titleOf(r.body), description: metaDesc(r.body), hreflang: hreflangPairs(r.body) });
    for (const p of keptPages()) {
        const r = await cget(subj, p), b = subj === base ? r : await cget(base, p);
        const a = fields(r), z = fields(b);
        const bad = [];
        if (a.status !== 200 || a.location) bad.push('subject ' + brief(r));
        for (const k of Object.keys(a)) if (!eq(a[k], z[k])) bad.push(k + ': ' + JSON.stringify(a[k]).slice(0, 160) + ' vs BASE ' + JSON.stringify(z[k]).slice(0, 160));
        ok('C', bad.length === 0, 'kept 200 + SEO === BASE (canonical ' + a.canonical + ', robots ' + JSON.stringify(a.robots) + ')  ' + p, bad.join(' ; '));
    }
    section('[C] kept content — year table, month table, today page');
    for (const L of ['ar', 'en', 'ur']) {
        const P = lp(L);
        const yp = P + '/hijri-calendar/' + HY;
        const ys = (await cget(subj, yp)).body, yb = (await cget(base, yp)).body;
        const tb = (b) => block(b, /<tbody id="hyear-table-body"[\s\S]*?<\/tbody>/);
        const ts = tb(ys), tbb = tb(yb);
        const rowsS = ts ? (ts.match(/<tr\b/g) || []).length : 0;
        const dayLinks = ts ? (ts.match(/href="[^"]*\/hijri-date\//g) || []).length : -1;
        const monLinks = (x) => x ? (x.match(/href="[^"]*\/hijri-calendar\/\d{4}-\d{2}"/g) || []).length : -1;
        ok('C', !!ts && rowsS === 12 && dayLinks === 0 && monLinks(ts) === monLinks(tbb) && textOf(ts) === textOf(tbb) && /data-ssr-rendered="1"/.test(ts),
            'year table: 12 rows, 0 day links, month links === BASE (' + monLinks(ts) + '), visible text === BASE  ' + yp,
            'rows=' + rowsS + ' dayLinks=' + dayLinks + ' monLinks=' + monLinks(ts) + '/' + monLinks(tbb) + ' textEq=' + (textOf(ts) === textOf(tbb)));
        const mp = P + '/hijri-calendar/' + HY + '-' + p2(HM);
        const mb = (b) => block(b, /<tbody id="hmonth-table-body">[\s\S]*?<\/tbody>/);
        const ms = mb((await cget(subj, mp)).body), mbb = mb((await cget(base, mp)).body);
        ok('C', !!ms && ms === mbb && (ms.match(/<tr>/g) || []).length === mdays(HY, HM) && !/<a\b/.test(ms),
            'month table: ' + mdays(HY, HM) + ' rows of day data, no link, byte-identical to BASE  ' + mp, 'len ' + (ms || '').length + ' vs ' + (mbb || '').length);
        const tp = P + '/today-hijri-date';
        const tS = noComments((await cget(subj, tp)).body), tB = noComments((await cget(base, tp)).body);
        ok('C', !/id="hijri-today-nav-card"/.test(tS) && !/id="hijri-today-nav"/.test(tS) && /id="hijri-today-nav-card"/.test(tB),
            'today page: the prev/next day card is gone (present on BASE)  ' + tp);
        const ig = (b) => block(b, /<div[^>]*id="hijri-today-info-grid"[^>]*>[\s\S]*?<\/div>\s*<\/div>/);
        ok('C', ig(tS) !== null && ig(tS) === ig(tB), 'today page: #hijri-today-info-grid identical to BASE  ' + tp);
    }
    section('[C] kept 301s identical to BASE (status, Location, Cache-Control)');
    for (const p of kept301()) {
        const r = await get(subj, p), b = subj === base ? r : await get(base, p);
        const f = (x) => [x.status, x.headers.location || null, x.headers['cache-control'] || null];
        ok('C', eq(f(r), f(b)) && r.status === 301, '301 → ' + (r.headers.location || '-') + ' (=== BASE)  ' + p, 'subject ' + JSON.stringify(f(r)) + ' vs BASE ' + JSON.stringify(f(b)));
    }
    section('[C] the live moon 410 (MOON-DAY-PAGES-REMOVAL-1) is byte-identical to BASE (status, headers, body)');
    const hk = (r) => JSON.stringify(['content-type', 'content-length', 'cache-control', 'x-robots-tag', 'x-content-type-options', 'x-frame-options', 'referrer-policy', 'content-security-policy', 'location'].map((k) => r.headers[k] || null));
    for (const p of ['/moon/saudi-arabia/riyadh/2026/10/15', '/en/moon/saudi-arabia/riyadh/today', '/moon-today-in-riyadh', '/fr/moon-in-riyadh/2026-10-15', '/moon/saudi-arabia/riyadh/2026/10/15/']) {
        const r = await get(subj, p), b = subj === base ? r : await get(base, p);
        if (r.status === 410) MOON_410++;
        ok('C', r.status === 410 && b.status === 410 && r.buf.equals(b.buf) && hk(r) === hk(b), 'moon 410 === BASE  ' + p, brief(r) + ' vs BASE ' + brief(b) + (hk(r) === hk(b) ? '' : ' headers ' + hk(r) + ' vs ' + hk(b)));
    }
    const rt = await get(subj, '/robots.txt'), rb = subj === base ? rt : await get(base, '/robots.txt');
    ok('C', rt.status === 200 && rt.buf.equals(rb.buf) && !/hijri/i.test(rt.body), 'robots.txt byte-identical to BASE, no hijri rule (the 410 stays crawlable)', 'subject ' + sha(rt.buf) + ' vs ' + sha(rb.buf));
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// [D] links
function linkPages() {
    const pages = [];
    for (const L of LANGS) {
        const P = lp(L);
        pages.push(P + '/', P + '/today-hijri-date', P + '/hijri-calendar', P + '/hijri-calendar/' + HY, P + '/hijri-calendar/' + HY + '-' + p2(HM), P + '/date-converter',
            P + '/hijri-new-year-countdown', P + '/eid-al-fitr-countdown', P + '/eid-al-adha-countdown', P + '/prayer-times-in-riyadh');
    }
    pages.push('/ramadan-countdown', '/qibla-in-riyadh', '/next-prayer-in-riyadh', '/time-left-until-next-prayer-in-riyadh', '/moon', '/moon/saudi-arabia/riyadh',
        '/en/moon/saudi-arabia/riyadh', '/moon/saudi-arabia/riyadh/2026/10', '/prayer-times-in-saudi-arabia', '/msbaha', '/zakat-calculator', '/azkar', '/qibla',
        '/hijri-calendar/' + (HY - 1), '/hijri-calendar/' + (HY + 1) + '-06', '/prayer-times-worldwide', '/guides');
    return [...new Set(pages.map((p) => (p.length > 1 ? p.replace(/\/$/, '') : p)))];
}
async function sectionD(subj, base) {
    section('[D1] raw SSR — 0 links to removed day pages (attribute values, JSON-LD strings, inline-script string literals)');
    let baseTotal = 0;
    for (const p of linkPages()) {
        const r = await cget(subj, p);
        const hits = r.status === 200 ? removedHits(r.body) : [];
        let baseNote = '';
        if (subj !== base) { const b = await cget(base, p); const n = b.status === 200 ? removedHits(b.body).length : 0; baseTotal += n; baseNote = ' (BASE ' + n + ')'; }
        ok('D1', r.status === 200 && !r.headers.location && hits.length === 0, '0 removed targets' + baseNote + '  ' + p,
            r.status !== 200 ? brief(r) : (hits.length + ' hit(s): ' + hits.slice(0, 6).map((x) => x.where + '=' + x.v.slice(0, 90)).join(' | ')));
    }
    info('BASE carried ' + baseTotal + ' day-page targets across these pages');
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// [E] sitemaps
async function sitemapScan(port, label) {
    const idx = await get(port, '/sitemap.xml');
    const children = [...idx.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, ''));
    const res = { files: [], idxStatus: idx.status, childLocs: new Set(), legacyLocs: new Set(), children: children.length, legacy: 0, hijriFile: null };
    const scan = (grp, p, r) => {
        const locs = [...r.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
        const hrefs = [...r.body.matchAll(/\shref="([^"]+)"/g)].map((m) => m[1]);
        const bad = [...locs, ...hrefs].filter((u) => isRemovedTarget(u.replace(/&amp;/g, '&')));
        const set = grp === 'index' ? res.childLocs : res.legacyLocs;
        locs.forEach((u) => set.add(u));
        res.files.push({ grp, p, status: r.status, locs: locs.length, hrefs: hrefs.length, bad: bad.length, sample: bad.slice(0, 3) });
        if (p === '/sitemap-hijri.xml') res.hijriFile = { locs: locs.length, hrefs: hrefs.length };
    };
    for (const p of children) scan('index', p, await get(port, p));
    scan('legacy', '/sitemap-main.xml', await get(port, '/sitemap-main.xml')); res.legacy++;
    for (let n = 1; n <= 80; n++) {
        const p = '/sitemap-cities-' + n + '.xml';
        const r = await get(port, p);
        if (r.status !== 200) { info(label + ': ' + p + ' → ' + r.status + ' (end of the legacy shards)'); break; }
        scan('legacy', p, r); res.legacy++;
    }
    info(label + ': index children ' + children.length + ', legacy files ' + res.legacy + ', unique child locs ' + res.childLocs.size + ', unique legacy locs ' + res.legacyLocs.size + ', sitemap-hijri.xml ' + JSON.stringify(res.hijriFile));
    return res;
}
async function sectionE(subj, base) {
    section('[E] sitemaps — 0 day URLs (loc + xhtml:link) in every file');
    const s = await sitemapScan(subj, 'subject');
    ok('E', s.idxStatus === 200 && s.files.length > 2, '/sitemap.xml is 200 and lists children', 'status=' + s.idxStatus + ' files=' + s.files.length);
    for (const f of s.files) ok('E', f.status === 200 && f.bad === 0, f.grp + ' ' + f.p + ': ' + f.locs + ' locs, ' + f.hrefs + ' alternates, 0 day URLs', 'status=' + f.status + ' removed=' + f.bad + ' ' + f.sample.join(' '));
    ok('E', !!s.hijriFile && s.hijriFile.locs === 390, '/sitemap-hijri.xml = 390 locs (3 years + 36 months × 10 locales)', JSON.stringify(s.hijriFile));
    if (subj === base) return;
    const b = await sitemapScan(base, 'BASE');
    for (const [nm, A, B] of [['index children', s.childLocs, b.childLocs], ['legacy files', s.legacyLocs, b.legacyLocs]]) {
        const removed = [...B].filter((u) => !A.has(u)), added = [...A].filter((u) => !B.has(u));
        const baseDay = [...B].filter(isRemovedTarget);
        const removedNonDay = removed.filter((u) => !isRemovedTarget(u));
        ok('E', added.length === 0 && removedNonDay.length === 0 && removed.length === baseDay.length && baseDay.length > 0,
            nm + ': subject loc set === BASE minus exactly BASE\'s ' + baseDay.length + ' day locs (BASE ' + B.size + ' → subject ' + A.size + ')',
            'added=' + added.length + ' ' + added.slice(0, 3).join(' ') + ' removedNonDay=' + removedNonDay.length + ' ' + removedNonDay.slice(0, 3).join(' '));
    }
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// [G] cheap path
function staticOrder(root) {
    section('[G1] source order in the request handler (' + root + ')');
    const src = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
    const start = src.indexOf('http.createServer(async (req, res) => {');
    ok('G', start > 0, 'server.js has the request handler');
    if (start < 0) return;
    const code = src.slice(start).split(/\r?\n/).map((l) => l.replace(/\/\/.*$/, ''));
    const first = (re) => code.findIndex((l) => re.test(l));
    const gate = first(/\b_hijriGoneFor\s*\(/), ml = first(/\b_mlStart\(/), shed = first(/\b_shedReject\(/), pre = first(/\b_prefetchDiscoveredForSsr\(/),
        ssr = first(/\bserveHtmlWithSeo\(/), hdr = first(/res\.setHeader\('X-Content-Type-Options'/), www = first(/startsWith\('www\.'\)/);
    info('handler-relative lines: gate ' + gate + ', _mlStart ' + ml + ', _shedReject ' + shed + ', security headers ' + hdr + ', www 301 ' + www + ', _prefetchDiscoveredForSsr ' + pre + ', serveHtmlWithSeo ' + ssr);
    ok('G', gate >= 0, 'the hijri 410 gate (_hijriGoneFor) is called in the handler');
    ok('G', gate >= 0 && ml >= 0 && ml < gate, '_mlStart( runs before the gate (so [req-family] counts the 410s)');
    for (const [nm, i] of [['_shedReject(', shed], ['the security headers / CSP nonce', hdr], ['the www 301', www], ['_prefetchDiscoveredForSsr(', pre], ['serveHtmlWithSeo(', ssr]]) {
        ok('G', gate >= 0 && i > gate, 'the 410 gate precedes ' + nm, 'gate=' + gate + ' ' + nm + '=' + i);
    }
    // the gate itself: synchronous, no clock, no await
    const fnSrc = (src.match(/function _hijriGoneFor\(req\) \{[\s\S]*?\n\}/) || [''])[0];
    ok('G', !!fnSrc && !/\bawait\b|\bDate\b|_hijriNow|\bIntl\.|new Date/.test(fnSrc), '_hijriGoneFor is synchronous and uses no clock (validity = the table only)');
}
function rawClient(port) {
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
let RAW_410 = 0, MOON_410 = 0;   // MOON_410: the moon 410s requested by the [C] parity check (family moon-gone)
async function timing(subj) {
    section('[G2] latency — 200 sequential 410s vs 30 month renders (keep-alive, one socket)');
    const goneUrls = ['/hijri-date/' + hd(D.mid), '/en/hijri-date/' + hd(D.today), '/fr/hijri-date/' + hd(D.past) + '/', '/hijri-date/' + hd(D.future) + '.html',
        '/ms/hijri-date/' + hd(D.max) + '?x=1', '/ur/hijri-date/' + hd(D.min), '/hijri-date/' + hd(D.day30), '/bn/hijri-date/' + hd(D.mid)];
    const raw = rawClient(subj);
    for (let i = 0; i < 10; i++) { await raw.req('/health'); await raw.req(goneUrls[i % goneUrls.length]); }
    const healthRaw = [], goneRaw = []; let rawNon410 = 0;
    for (let i = 0; i < 200; i++) { healthRaw.push((await raw.req('/health')).ms); const r = await raw.req(goneUrls[i % goneUrls.length]); goneRaw.push(r.ms); if (r.status !== 410) rawNon410++; }
    raw.close();
    RAW_410 += 210;
    info('raw socket: 410 median ' + median(goneRaw).toFixed(3) + ' ms (p90 ' + [...goneRaw].sort((a, b) => a - b)[179].toFixed(3) + ') vs /health median ' + median(healthRaw).toFixed(3) + ' ms');
    ok('G', rawNon410 === 0, 'raw socket: all 200 timing requests answered 410', 'non-410=' + rawNon410);
    const g2 = Math.max(2, median(healthRaw) + 0.5);
    ok('G', median(goneRaw) < g2, '410 median < 2 ms locally (bar ' + g2.toFixed(2) + ' ms, /health ' + median(healthRaw).toFixed(3) + ' ms)', median(goneRaw).toFixed(3) + ' ms');
    ok('G', median(goneRaw) - median(healthRaw) < 1, '410 costs < 1 ms more than /health (median difference)', (median(goneRaw) - median(healthRaw)).toFixed(3) + ' ms');
    const agent = new http.Agent({ keepAlive: true, maxSockets: 1 });
    const monthUrl = '/hijri-calendar/' + HY + '-' + p2(HM);
    await get(subj, monthUrl, {}, agent);
    const monMs = []; let non200 = 0;
    for (let i = 0; i < 30; i++) { const r = await get(subj, monthUrl, {}, agent); monMs.push(r.ms); if (r.status !== 200) non200++; }
    agent.destroy();
    info('month render median ' + median(monMs).toFixed(1) + ' ms; ratio ' + (median(monMs) / median(goneRaw)).toFixed(0) + 'x');
    ok('G', non200 === 0, 'all 30 month renders answered 200', 'non-200=' + non200);
    ok('G', median(goneRaw) * 10 < median(monMs), '410 median at least 10x cheaper than a month render', median(goneRaw).toFixed(3) + ' vs ' + median(monMs).toFixed(1) + ' ms');
}
async function reqFamily(child, subj) {
    section('[G3] [req-family] — every 410 counted as family "hijri-gone", no hijri-date page rendered');
    const last = LAST_REQ.get(subj) || Date.now();
    const t0 = Date.now();
    while (Date.now() - t0 < 30000) {
        if (child.lines.some((x) => x.t > last + 500)) break;
        await sleep(250);
    }
    ok('G', child.lines.some((x) => x.t > last + 500), 'a [req-family] window flushed after the last request (TP_MOON_LOAD_OBS_WINDOW_S=10)', 'lines=' + child.lines.length);
    const rows = [];
    for (const { line } of child.lines) {
        try { const j = JSON.parse(line.slice('[req-family] '.length)); const cols = String(j.cols).split(','); for (const r of j.rows) { const o = {}; cols.forEach((c, i) => { o[c] = r[i]; }); rows.push(o); } } catch (_) { /* skip */ }
    }
    const n410 = ((STAT.get(subj) || new Map()).get(410) || 0) + RAW_410 - MOON_410;
    const hg = rows.filter((r) => r.family === 'hijri-gone');
    const hgN = hg.reduce((s, r) => s + Number(r.n), 0);
    info('subject answered ' + n410 + ' x 410; hijri-gone rows ' + JSON.stringify(hg.map((r) => r.outcome + ':' + r.n)));
    ok('G', n410 > 0 && hgN === n410 && hg.every((r) => r.outcome === 'gone'), '[req-family] family "hijri-gone" (outcome gone) counts every 410', 'hijri-gone=' + hgN + ' 410s=' + n410);
    const rendered = rows.filter((r) => r.family === 'hijri-date' && r.outcome === '2xx');
    ok('G', rendered.length === 0, 'no hijri-date day page was rendered (0 [req-family] hijri-date 2xx rows)', JSON.stringify(rendered.slice(0, 3)));
    const mg = rows.filter((r) => r.family === 'moon-gone').reduce((s, r) => s + Number(r.n), 0);
    ok('G', mg === MOON_410, 'moon-gone counts only the ' + MOON_410 + ' moon 410s of the [C] parity check (no hijri 410 labelled moon-gone)', 'moon-gone=' + mg);
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// [V] static
function stripJsComments(s) { return String(s).replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\'"])\/\/.*$/gm, '$1'); }
function staticChecks(root) {
    section('[V] static — asset versions, untouched engine, removed emitters (' + root + ')');
    const rd = (r, f) => fs.readFileSync(path.join(r, f), 'utf8');
    const ver = (s, f) => { const m = s.match(new RegExp(f.replace(/[.]/g, '\\.') + '\\?v=(\\d+)')); return m ? +m[1] : null; };
    const idx = rd(root, 'index.html'), bIdx = rd(BASE_ROOT, 'index.html');
    ok('V', ver(idx, 'js/app.js') > ver(bIdx, 'js/app.js'), 'index.html busts js/app.js?v above BASE', ver(bIdx, 'js/app.js') + ' → ' + ver(idx, 'js/app.js'));
    const cssChanged = rd(root, 'css/style.css') !== rd(BASE_ROOT, 'css/style.css');
    if (cssChanged) ok('V', ver(idx, 'css/style.css') > ver(bIdx, 'css/style.css'), 'css/style.css changed → style.css?v bumped', ver(bIdx, 'css/style.css') + ' → ' + ver(idx, 'css/style.css'));
    else info('css/style.css unchanged vs BASE (no style.css?v bump needed)');
    ok('V', fs.readFileSync(path.join(root, 'js/moon.js')).equals(fs.readFileSync(path.join(BASE_ROOT, 'js/moon.js'))), 'js/moon.js byte-identical to BASE (Meeus untouched)');
    ok('V', !/id="hijri-today-nav-card"/.test(idx) && !/id="hijri-today-nav"/.test(idx), 'index.html: the prev/next day card (#hijri-today-nav-card / #hijri-today-nav) is removed');
    ok('V', !/#hijri-today-nav\b/.test(rd(root, 'css/critical.css')), 'css/critical.css: no #hijri-today-nav reservation');
    const app = stripJsComments(rd(root, 'js/app.js'));
    ok('V', !/sched-day-link/.test(app), 'app.js: the schedule rows carry no sched-day-link anchor');
    const todayTpl = app.split(/\r?\n/).filter((l) => /today_in_(?:year|month)\s*:/.test(l));
    ok('V', todayTpl.length === 20 && todayTpl.every((l) => !/href/.test(l) && !/<a\b/.test(l)), 'app.js: the 20 today_in_year / today_in_month templates take no href and emit no <a>', todayTpl.filter((l) => /href|<a\b/.test(l)).slice(0, 2).join(' | '));
    // the only remaining template-literal day path is the (dead-code) hijriDayUrl helper's own return
    const dayTpl = (app.match(/\/hijri-date\/\$\{/g) || []).length;
    const helperTpl = ((app.match(/function hijriDayUrl\([\s\S]*?\n\}/) || [''])[0].match(/\/hijri-date\/\$\{/g) || []).length;
    ok('V', !/hijriDated/.test(app) && !/'\/hijri-date\/'\s*\+\s*hy/.test(app) && !/_todayHref|startHref|endHref/.test(app) && dayTpl === helperTpl,
        'app.js: no homepage-schema / countdown / banner / year-table day-path builder (template day paths ' + dayTpl + ', all inside hijriDayUrl)', 'dayTpl=' + dayTpl + ' helper=' + helperTpl);
    ok('V', !/a\[href\*="\/hijri-date\/"\]/.test(app), 'app.js: the /hijri-date/ click interceptor is removed');
    // every remaining hijriDayUrl( call lives inside the (dead) day-page renderer loadHijriDayPage
    const s = app.indexOf('function loadHijriDayPage(');
    const e = s >= 0 ? app.indexOf('\nfunction ', s + 10) : -1;
    const inDay = s >= 0 && e > s ? (app.slice(s, e).match(/hijriDayUrl\(/g) || []).length : 0;
    const total = (app.match(/hijriDayUrl\(/g) || []).length - (/function hijriDayUrl\(/.test(app) ? 1 : 0);
    ok('V', total === inDay, 'app.js: every hijriDayUrl( call (' + total + ') is inside loadHijriDayPage (unreachable behind the 410)', 'total=' + total + ' inDayRenderer=' + inDay);
    const srv = stripJsComments(rd(root, 'server.js'));
    ok('V', !/_startHref|_endHref/.test(srv) && !/_hijriDated/.test(srv), 'server.js: no year-table day hrefs and no mit-hijri dated rewrite');
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
async function main() {
    console.log('HIJRI-DAY-PAGES-REMOVAL-1 smoke — ' + (BASE_ONLY ? 'BASE-ONLY validation' : 'candidate vs BASE') + ' — UTC ' + NOW.toISOString() + ', Hijri today (Riyadh) ' + hd(D.today));
    console.log('  subject root ' + SUBJECT_ROOT + '   BASE root ' + BASE_ROOT + '   guard ' + GUARD);
    section('[pre] fixtures');
    ok('pre', fs.existsSync(GUARD) && !/\s/.test(GUARD), 'outbound guard present at a path without spaces');
    ok('pre', !!H_TODAY, 'today\'s Hijri date resolved through the table: ' + hd(D.today));
    ok('pre', !!M30 && !!M29 && mdays(...D.max.slice(0, 2)) === D.max[2], 'table: a 30-day month (' + M30 + ') and a 29-day month (' + M29 + ') in ' + HY + ', MAX ' + hd(D.max));
    let subjChild = null, baseChild = null;
    const subj = BASE_ONLY ? BASE_PORT : CAND_PORT, base = BASE_PORT;
    try {
        baseChild = await boot(BASE_ROOT, BASE_PORT, 'base');
        subjChild = BASE_ONLY ? baseChild : await boot(ROOT, CAND_PORT, 'candidate');
        const rows = buildMatrix();
        const dirOf = {};
        for (const L of LANGS) dirOf[L] = attrOf(htmlTag((await get(base, lp(L) + '/hijri-calendar')).body), 'dir');
        info('html dir per locale on BASE: ' + JSON.stringify(dirOf));
        if (want('A')) await sectionA(subj, rows, dirOf);
        if (want('A0')) await sectionA0(base, rows);
        if (want('B')) await sectionB(subj, base);
        if (want('C')) await sectionC(subj, base);
        if (want('D')) await sectionD(subj, base);
        if (want('E')) await sectionE(subj, base);
        if (want('V')) staticChecks(SUBJECT_ROOT);
        if (want('G')) { staticOrder(SUBJECT_ROOT); await timing(subj); await reqFamily(subjChild, subj); }
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
            && s('B2').fail === 0 && s('N').fail === 0 && s('pre').fail === 0 && !SEC.run;
        console.log('\nBASE-ONLY VALIDATION: ' + (valid ? 'OK' : 'NOT OK') + ' — [A] must fail on every row (' + s('A').fail + ' failed, ' + s('A').pass + ' passed), [A0] ' + s('A0').fail + ' fail, [B] ' + s('B').fail + ' fail, [B2] ' + s('B2').fail + ' fail, [N] ' + s('N').fail + ' fail. [A+]/[C] content/[D]/[E]/[G]/[V] are expected to fail on BASE (informational).');
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
