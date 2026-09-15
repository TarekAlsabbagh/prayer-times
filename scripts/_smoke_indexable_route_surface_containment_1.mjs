// INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1 (Phase 1) — smoke suite.
//
// Verifies the approved behaviour (it never changes it). Every guard is exact; nothing is skipped.
//
//   [K]  static source guards: ONE getSupportedMoonYearRange(); no 1900/2100 year-bound comparisons outside it; the
//        TP_MOON_RANGE_TEST_NOW seam is read ONLY inside it; client island readers + asset versions present
//   [U]  unchanged: robots.txt === base; Hijri sample === base; git diff --quiet on js/moon.js js/prayer-times.js db sw.js css
//   [M1] moon range: in-range year/month/day 200 (3 cities x ar/en/fr, MIN/01 + MAX/12 in all 10 locales);
//        MIN-1 / MAX+1 (year, month, day + .html twins) → branded 404 noindex,follow + X-Robots-Tag
//   [M2] HARD BLOCKER month correctness: H1 year === grid title year === every grid day-cell year === URL year,
//        day-link count === days in month (leap aware), breadcrumb year rung (visible + JSON-LD) === URL year
//   [M3] navigation bounds: no prev at MIN / no next at MAX (year + month), every option / nested moon year in range,
//        cal-y picker exactly MIN..MAX
//   [M4] legacy + ?cal: out-of-range legacy → 404 no Location; in range → ONE 301 → 200; nested hub ?cal in/out of range
//   [M5] clock seam TP_MOON_RANGE_TEST_NOW (2027-01-01T00:30Z and 2026-12-31T23:30Z): routes, island, sitemap window
//   [I]  SSR island {min,max} + CSP nonce on moon hub/today/year/month/day; absent elsewhere
//   [C1] coordinate/tail matrix (D4/D5/PRAYER) in ar/en/fr + curated/country/discovered-like controls === base
//   [H1] .html normalizer: ONE 301 to the final clean URL, query verbatim, public max-age=86400, target 200;
//        non-matching .html → 404; legacy tool/Hijri .html 301s + /index.html === base
//   [S1] Singapore: city pages indexable (10 locales), *-singapore-city 200 noindex, moon unchanged, legacy moon 301s,
//        /singapore chain, no singapore-city hrefs, sitemap placement, boot guard drops only "singapore"
//   [Q1] Quran: sitemap-main 0 /quran; sitemap-quran bytes/ETag/Last-Modified === base; 304
//   [L1] lastmod policy on EVERY sitemap file + counts + loc shape/uniqueness
//   [SM] sitemap invariant, SAMPLED over HTTP (every 1000th <loc> of every file + special URLs): 200, indexable,
//        self-canonical
//
// Base comparisons boot TP_BASE_ROOT (a clean checkout whose tree === c126604^{tree}) or use TP_BASE_URL.
// Without one, every base comparison FAILS — never skipped.
//
// Usage: TP_BASE_ROOT=<clean base checkout> node scripts/_smoke_indexable_route_surface_containment_1.mjs
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_COMMIT = 'c126604';
const SITE = 'https://timesprayers.com';
const AFTER_PORT = 8835, BASE_PORT = 8836, SEAM1_PORT = 8837, SEAM2_PORT = 8838;
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const L3 = ['ar', 'en', 'fr'];
const lp = (L) => (L === 'ar' ? '' : '/' + L);
const p2 = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── supported moon range, derived from the real UTC clock exactly like the server helper ──
const NOW = new Date();
const CUR = NOW.getUTCFullYear();
const MIN = Math.max(1900, CUR - 5), MAX = Math.min(2100, CUR + 5);
const UTC_M = NOW.getUTCMonth() + 1, UTC_D = NOW.getUTCDate();
const TODAY_ISO = NOW.toISOString().slice(0, 10);
const TODAY_PATH = CUR + '/' + p2(UTC_M) + '/' + p2(UTC_D);

const CITIES = [
    { cs: 'saudi-arabia', c: 'riyadh', tz: 'Asia/Riyadh' },
    { cs: 'united-kingdom', c: 'london', tz: 'Europe/London' },          // famous city, NON-Riyadh timezone
    { cs: 'saudi-arabia', c: 'an-nabiah', tz: 'Asia/Riyadh' },          // non-famous curated town
];
const RIYADH = CITIES[0], LONDON = CITIES[1];
const cityBase = (L, city) => lp(L) + '/moon/' + city.cs + '/' + city.c;

let pass = 0, fail = 0; const fails = [];
function ok(label, cond, name, detail) {
    const n = '[' + label + '] ' + name;
    if (cond) { pass++; console.log('  ✓ ' + n); }
    else { fail++; fails.push(n + (detail ? ' :: ' + detail : '')); console.log('  ✗ ' + n + (detail ? '  :: ' + detail : '')); }
}
const info = (s) => console.log('  · INFO ' + s);
const section = (s) => console.log('\n-- ' + s + ' --');

// ── HTTP ──
function get(port, urlPath, headers = {}) {
    return new Promise((resolve) => {
        const req = http.request({ host: '127.0.0.1', port, path: urlPath, method: 'GET',
            headers: { 'Accept-Encoding': 'identity', 'User-Agent': 'tp-irsc-smoke/1', ...headers } }, (res) => {
            const c = []; res.on('data', (x) => c.push(x));
            res.on('end', () => { const buf = Buffer.concat(c); resolve({ status: res.statusCode, headers: res.headers, buf, body: buf.toString('utf8') }); });
            res.on('error', (e) => resolve({ status: 0, headers: {}, buf: Buffer.alloc(0), body: '', err: e.message }));
        });
        req.setTimeout(300000, () => req.destroy(new Error('timeout')));
        req.on('error', (e) => resolve({ status: 0, headers: {}, buf: Buffer.alloc(0), body: '', err: e.message }));
        req.end();
    });
}
const CACHE = new Map();
async function cget(port, urlPath) {
    const k = port + '|' + urlPath;
    if (!CACHE.has(k)) CACHE.set(k, await get(port, urlPath));
    return CACHE.get(k);
}
async function pool(items, n, fn) {
    const out = new Array(items.length); let i = 0;
    await Promise.all(Array.from({ length: Math.min(n, items.length || 1) }, async () => {
        while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
    }));
    return out;
}
const prefetch = (port, paths, n = 6) => pool([...new Set(paths)], n, (p) => cget(port, p));

// ── servers ──
async function boot(root, port, extraEnv = {}) {
    const pre = await get(port, '/health');
    if (pre.status !== 0) throw new Error('port ' + port + ' already in use (a stale server would falsify results)');
    const env = { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: SITE,
                  SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' };
    delete env.TP_ENABLE_SEARCH_TEST; delete env.TP_MOON_RANGE_TEST_NOW;
    Object.assign(env, extraEnv);
    const child = spawn(process.execPath, ['server.js'], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
    child.bootLog = '';
    const keep = (d) => { if (child.bootLog.length < 400000) child.bootLog += d.toString('utf8'); };
    child.stdout.on('data', keep); child.stderr.on('data', keep);
    for (let i = 0; i < 300; i++) {
        const r = await get(port, '/health');
        if (r.status === 200) return child;
        if (child.exitCode != null) break;
        await sleep(400);
    }
    stop(child); throw new Error('server did not become healthy: ' + root + ' :' + port);
}
function stop(child) {
    if (!child) return;
    try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) { try { child.kill(); } catch (_) {} }
}

// ── HTML parsing ──
const noComments = (b) => String(b || '').replace(/<!--[\s\S]*?-->/g, '');
function metaRobots(b) {
    const m = noComments(b).match(/<meta\b[^>]*\bname=["']robots["'][^>]*>/i);
    return m ? ((m[0].match(/\bcontent=["']([^"']*)["']/i) || [])[1] ?? '') : null;
}
function canonicalOf(b) {
    const m = noComments(b).match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i);
    return m ? ((m[0].match(/\bhref=["']([^"']*)["']/i) || [])[1] ?? '') : null;
}
const titleOf = (b) => (noComments(b).match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] ?? null;
const hreflangN = (b) => (noComments(b).match(/hreflang="/g) || []).length;
const xrt = (r) => String((r.headers && r.headers['x-robots-tag']) || '');
const hasNoindex = (r) => /noindex/i.test(metaRobots(r.body) || '') || /noindex/i.test(xrt(r));
const indexable = (r) => { const m = metaRobots(r.body) || ''; return /(^|[\s,])index([\s,]|$)/i.test(m) && !/noindex/i.test(m) && !/noindex/i.test(xrt(r)); };
const seo = (r) => ({ status: r.status, location: r.headers.location || null, canonical: canonicalOf(r.body), robots: metaRobots(r.body),
                      title: titleOf(r.body), hreflang: hreflangN(r.body) });
const redir = (r) => ({ status: r.status, location: r.headers.location || null, cacheControl: r.headers['cache-control'] || null });
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const diffKeys = (a, b) => Object.keys(a).filter((k) => !eq(a[k], b[k])).map((k) => k + ': ' + JSON.stringify(a[k]) + ' vs base ' + JSON.stringify(b[k])).join(' | ');
const brief = (r) => 'status=' + r.status + ' loc=' + (r.headers.location || '') + ' robots=' + metaRobots(r.body) + ' xrt=' + xrt(r) + ' canon=' + canonicalOf(r.body) + (r.err ? ' err=' + r.err : '');
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const yearsIn = (s) => (String(s).match(/(?<!\d)(?:1[89]\d\d|2[01]\d\d)(?!\d)/g) || []).map(Number);
const NESTED_YEAR_RE = /\/moon\/[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*\/(\d{4})(?!\d)/g;
const nestedYears = (b) => [...String(b).matchAll(NESTED_YEAR_RE)].map((m) => +m[1]);
const cspNonce = (r) => (String(r.headers['content-security-policy'] || '').match(/'nonce-([^']+)'/) || [])[1] || null;
function cityLocalYmd(tz) {
    const s = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const [y, m, d] = s.split('-').map(Number); return { y, m, d };
}

// Expectation helpers (each is ONE ok line with the full evidence on failure)
function expectIndexable200(label, r, p, name) {
    ok(label, r.status === 200 && !r.headers.location && indexable(r) && canonicalOf(r.body) === SITE + p.split('?')[0],
        (name || '200 indexable self-canonical') + '  ' + p, brief(r));
}
function expectNoindex200(label, r, p, name) {
    ok(label, r.status === 200 && !r.headers.location && /^noindex,\s*follow/i.test(metaRobots(r.body) || '') && canonicalOf(r.body) === SITE + p.split('?')[0],
        (name || '200 noindex,follow self-canonical') + '  ' + p, brief(r));
}
function expectBranded404(label, r, p) {
    ok(label, r.status === 404 && !r.headers.location && metaRobots(r.body) === 'noindex,follow' && xrt(r) === 'noindex,follow',
        'branded 404 (meta noindex,follow + X-Robots-Tag noindex,follow), no Location  ' + p, brief(r));
}
function expect404NotIndexable(label, r, p) {
    ok(label, r.status === 404 && !r.headers.location && (metaRobots(r.body) === null || /noindex/i.test(metaRobots(r.body))) && !indexable(r),
        '404, no Location, not indexable  ' + p, brief(r));
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
function staticChecks() {
    section('[K] static source guards');
    const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
    ok('K', src.split('function getSupportedMoonYearRange(').length === 2, "server.js contains exactly one 'function getSupportedMoonYearRange('",
        'count=' + (src.split('function getSupportedMoonYearRange(').length - 1));
    const hStart = src.indexOf('function getSupportedMoonYearRange(');
    const hEnd = hStart >= 0 ? src.indexOf('\n}', hStart) : -1;
    const helper = hStart >= 0 && hEnd > hStart ? src.slice(hStart, hEnd + 2) : '';
    const outside = hStart >= 0 && hEnd > hStart ? src.slice(0, hStart) + src.slice(hEnd + 2) : src;
    ok('K', /Math\.max\(1900,\s*_y - SUPPORTED_MOON_YEAR_BACK\)/.test(helper) && /Math\.min\(2100,\s*_y \+ SUPPORTED_MOON_YEAR_AHEAD\)/.test(helper)
        && /getUTCFullYear\(\)/.test(helper) && /const SUPPORTED_MOON_YEAR_BACK = 5;/.test(src) && /const SUPPORTED_MOON_YEAR_AHEAD = 5;/.test(src),
        'helper = current UTC year ±5 with hard caps 1900/2100');
    ok('K', !outside.includes('>= 1900 && ') && !outside.includes('<= 2100)') && !outside.includes('>= 1900 &&') && !outside.includes('<= 2100 '),
        "no '>= 1900 && ' / '<= 2100)' literal outside the helper");
    const codeLines = outside.split(/\r?\n/).map((l, i) => [i + 1, l.replace(/\/\/.*$/, '')]).filter(([, l]) => !/^\s*\*/.test(l));
    const badLines = codeLines.filter(([, l]) => /(?:[<>]=?|===?|!==?)\s*(?:1900|2100)\b|\b(?:1900|2100)\s*(?:[<>]=?|===?)|Math\.(?:max|min)\(\s*(?:1900|2100)\b/.test(l));
    ok('K', badLines.length === 0, 'no 1900/2100 comparison or Math.max/min clamp in server.js code outside the helper', badLines.slice(0, 5).map(([n, l]) => n + ': ' + l.trim().slice(0, 120)).join(' || '));
    ok('K', /process\.env\.TP_MOON_RANGE_TEST_NOW/.test(helper) && !/process\.env\.TP_MOON_RANGE_TEST_NOW/.test(outside) && !/process\.env\[['"]TP_MOON_RANGE_TEST_NOW/.test(outside),
        'the TP_MOON_RANGE_TEST_NOW clock seam is read ONLY inside getSupportedMoonYearRange');
    ok('K', src.split('id="ssr-moon-year-range"').length === 2 && /parts\.push\(`<script\$\{_TP_NONCE_ATTR\} id="ssr-moon-year-range">window\.__MOON_YEAR_RANGE__=\{"min":\$\{_mRange\.SUPPORTED_MOON_YEAR_MIN\},"max":\$\{_mRange\.SUPPORTED_MOON_YEAR_MAX\}\};<\/script>`\)/.test(src),
        'exactly one nonce\'d island emitter, fed by getSupportedMoonYearRange');
    const app = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
    const chart = fs.readFileSync(path.join(ROOT, 'js/moon-chart.js'), 'utf8');
    const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    ok('K', /window\.__MOON_YEAR_RANGE__/.test(app) && /__MOON_YEAR_RANGE__/.test(chart), 'client link builders read the island (js/app.js + js/moon-chart.js)');
    // INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1 (red-suite R14 gap): D12 static guards — a client robots writer must
    //   never be able to raise an SSR noindex to index.
    const appRobotsWrites = app.match(/_seoUpsertMeta\(\s*'robots'[^;]*\)/g) || [];
    ok('K', appRobotsWrites.length === 1 && appRobotsWrites[0] === "_seoUpsertMeta('robots', 'name', _robotsForClientWrite('index, follow'))"
        && app.split('function _robotsForClientWrite(').length === 2 && /function _robotsForClientWrite\(clientValue\) \{\s*try \{ if \(\/\\bnoindex\\b\/i\.test\(_ssrRobotsContent\) && window\.location\.pathname === _ssrRobotsPath\) return _ssrRobotsContent; \}/.test(app),
        "js/app.js: the only robots write is _seoUpsertMeta('robots', 'name', _robotsForClientWrite('index, follow')) and the helper keeps an SSR noindex", appRobotsWrites.join(' || '));
    const ptc = fs.readFileSync(path.join(ROOT, 'prayer-times-cities.html'), 'utf8');
    const ptcRobotsWrites = ptc.match(/upsertMeta\(\s*'robots'[^;]*\)/g) || [];
    ok('K', ptcRobotsWrites.length === 1 && /if \(!\/\\bnoindex\\b\/i\.test\(_rC\)\) upsertMeta\('robots', 'name', 'index, follow'\);/.test(ptc),
        "prayer-times-cities.html: its single robots write is guarded by the SSR-noindex check", ptcRobotsWrites.join(' || '));
    ok('K', idx.includes('js/app.js?v=846"') && idx.includes('js/moon-chart.js?v=11"') && !idx.includes('js/app.js?v=845"') && !idx.includes('js/moon-chart.js?v=10"'),
        'index.html busts app.js?v=846 and moon-chart.js?v=11');

    section('[U] untouched files (git)');
    let quiet = false, detail = '';
    try { execFileSync('git', ['-C', ROOT, 'diff', '--quiet', '--', 'js/moon.js', 'js/prayer-times.js', 'db', 'sw.js', 'css'], { stdio: 'ignore' }); quiet = true; }
    catch (e) { detail = 'exit=' + e.status; }
    ok('U', quiet, 'git diff --quiet -- js/moon.js js/prayer-times.js db sw.js css (exit 0)', detail);
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
function checkMonthPage(r, L, city, Y, M) {
    const bad = [];
    const base = cityBase(L, city);
    if (r.status !== 200) bad.push('status=' + r.status);
    if (canonicalOf(r.body) !== SITE + base + '/' + Y + '/' + p2(M)) bad.push('canonical=' + canonicalOf(r.body));
    const b = noComments(r.body);
    const h1s = [...b.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => m[1].replace(/<[^>]+>/g, ''));
    const h1y = yearsIn(h1s[0] || '');
    if (h1s.length !== 1) bad.push('h1 count=' + h1s.length);
    if (!h1y.length || h1y.some((y) => y !== Y)) bad.push('H1 years=' + JSON.stringify(h1y));
    const titles = [...b.matchAll(/<h2 class="moon-hub-cal-title">([^<]*)<\/h2>/g)].map((m) => m[1]);
    const ty = yearsIn(titles[0] || '');
    if (titles.length !== 1) bad.push('grid title count=' + titles.length);
    if (!ty.length || ty.some((y) => y !== Y)) bad.push('grid title years=' + JSON.stringify(ty));
    const grids = [...b.matchAll(/<ul class="moon-hub-cal-grid">([\s\S]*?)<\/ul>/g)].map((m) => m[1]);
    if (grids.length !== 1) bad.push('grid count=' + grids.length);
    const hrefs = [...(grids[0] || '').matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)].map((m) => m[1]);
    const dim = new Date(Date.UTC(Y, M, 0)).getUTCDate();
    const dayRe = new RegExp('^' + esc(base) + '/(\\d{4})/(\\d{2})/(\\d{2})$');
    const days = new Set(); let todayN = 0; const wrong = [];
    for (const h of hrefs) {
        const m = h.match(dayRe);
        if (m) {
            if (+m[1] !== Y) wrong.push('year ' + h);
            else if (+m[2] !== M) wrong.push('month ' + h);
            else if (days.has(+m[3]) || +m[3] < 1 || +m[3] > dim) wrong.push('day ' + h);
            else days.add(+m[3]);
        } else if (h === base + '/today') todayN++;
        else wrong.push('shape ' + h);
    }
    if (wrong.length) bad.push('cell hrefs: ' + wrong.slice(0, 3).join(', '));
    if (hrefs.length !== dim) bad.push('day links=' + hrefs.length + ' daysInMonth=' + dim);
    const loc = cityLocalYmd(city.tz);
    if (todayN > 1) bad.push('today links=' + todayN);
    if (todayN === 1 && !(loc.y === Y && loc.m === M && !days.has(loc.d))) bad.push('a /today cell on a month that is not the city-local current month');
    for (let d = 1; d <= dim; d++) if (!days.has(d) && !(todayN === 1 && d === loc.d)) { bad.push('missing day ' + d); break; }
    const bcA = [...b.matchAll(/<a class="bc-link" id="bc-moon-year" href="([^"]*)">([^<]*)<\/a>/g)];
    if (bcA.length !== 1 || bcA[0][1] !== base + '/' + Y || bcA[0][2].trim() !== String(Y)) bad.push('visible breadcrumb year rung=' + JSON.stringify(bcA.map((m) => [m[1], m[2]])));
    const ld5 = b.match(/\{"@type":"ListItem","position":5,"name":"([^"]*)","item":"([^"]*)"\}/);
    if (!ld5 || ld5[1] !== String(Y) || ld5[2] !== SITE + base + '/' + Y) bad.push('JSON-LD breadcrumb position 5=' + (ld5 ? ld5[1] + ' ' + ld5[2] : 'none'));
    const ldAll = [...b.matchAll(/"@type":"BreadcrumbList"/g)].length;
    if (ldAll !== 1) bad.push('BreadcrumbList count=' + ldAll);
    return bad;
}

async function moonChecks(A) {
    info('supported moon range from the UTC clock: MIN=' + MIN + ' MAX=' + MAX + ' current=' + CUR + ' (today UTC ' + TODAY_ISO + ')');

    // ── [M1] ────────────────────────────────────────────────────────────────────────────────────────────────────
    section('[M1] moon range — in range 200, outside 404');
    const inYear = [], inMonth = [], inDayNoindex = [], inDayIndex = [], out = [];
    for (const city of CITIES) {
        for (const L of L3) {
            const b = cityBase(L, city);
            inYear.push(b + '/' + MIN, b + '/' + MAX, b + '/' + CUR);
            inMonth.push(b + '/' + MIN + '/01', b + '/' + MAX + '/12', b + '/' + CUR + '/' + p2(UTC_M));
            inDayNoindex.push(b + '/' + MIN + '/01/01', b + '/' + MAX + '/12/31');
            inDayIndex.push(b + '/' + TODAY_PATH);
            for (const t of [String(MIN - 1), String(MAX + 1), (MIN - 1) + '/12', (MAX + 1) + '/01', (MIN - 1) + '/12/31', (MAX + 1) + '/01/01']) {
                out.push(b + '/' + t, b + '/' + t + '.html');
            }
        }
        for (const L of LANGS) {
            const b = cityBase(L, city);
            inMonth.push(b + '/' + MIN + '/01', b + '/' + MAX + '/12');
            if (!L3.includes(L)) out.push(b + '/' + (MIN - 1) + '/12', b + '/' + (MAX + 1) + '/01');
        }
    }
    await prefetch(A, [...inYear, ...inMonth, ...inDayNoindex, ...inDayIndex, ...out]);
    for (const p of [...new Set(inYear)]) expectIndexable200('M1', await cget(A, p), p, 'year page 200 indexable self-canonical');
    for (const p of [...new Set(inMonth)]) expectIndexable200('M1', await cget(A, p), p, 'month page 200 indexable self-canonical');
    for (const p of [...new Set(inDayNoindex)]) expectNoindex200('M1', await cget(A, p), p, 'day page (outside today-30..+90) 200 noindex,follow self-canonical');
    for (const p of [...new Set(inDayIndex)]) expectIndexable200('M1', await cget(A, p), p, 'day page (UTC today) 200 indexable self-canonical');
    for (const p of [...new Set(out)]) expectBranded404('M1', await cget(A, p), p);

    // ── [M2] ────────────────────────────────────────────────────────────────────────────────────────────────────
    section('[M2] HARD BLOCKER — month correctness (URL year === H1 === grid title === every day cell === breadcrumb)');
    const m2 = [];
    for (let Y = MIN; Y <= MAX; Y++) for (let M = 1; M <= 12; M++) m2.push(['ar', RIYADH, Y, M]);
    for (const city of [RIYADH, LONDON]) {
        for (const L of LANGS) {
            for (const [Y, M] of [[MIN, 1], [MAX, 12], [CUR, UTC_M]]) {
                if (L === 'ar' && city === RIYADH) continue;   // already covered by the full riyadh-ar sweep
                m2.push([L, city, Y, M]);
            }
        }
    }
    await prefetch(A, m2.map(([L, city, Y, M]) => cityBase(L, city) + '/' + Y + '/' + p2(M)));
    let febLeap = 0;
    for (const [L, city, Y, M] of m2) {
        const p = cityBase(L, city) + '/' + Y + '/' + p2(M);
        const bad = checkMonthPage(await cget(A, p), L, city, Y, M);
        if (M === 2 && new Date(Date.UTC(Y, 2, 0)).getUTCDate() === 29 && !bad.length) febLeap++;
        ok('M2', bad.length === 0, 'month correct (' + new Date(Date.UTC(Y, M, 0)).getUTCDate() + ' day links, all years ' + Y + ')  ' + p, bad.join(' ; '));
    }
    const leapYears = range(MIN, MAX).filter((y) => new Date(Date.UTC(y, 2, 0)).getUTCDate() === 29);
    ok('M2', febLeap === leapYears.length && leapYears.length > 0, 'every leap February in range renders 29 linked days (riyadh ar: ' + leapYears.join(',') + ')', 'ok=' + febLeap);

    // ── [M3] ────────────────────────────────────────────────────────────────────────────────────────────────────
    section('[M3] navigation bounds (SSR)');
    const navPages = [];
    for (const city of CITIES) for (const L of L3) {
        const b = cityBase(L, city);
        navPages.push(b, b + '/today', b + '/' + MIN, b + '/' + MAX, b + '/' + CUR, b + '/' + MIN + '/01', b + '/' + MAX + '/12',
            b + '/' + CUR + '/' + p2(UTC_M), b + '/' + MIN + '/01/01', b + '/' + MAX + '/12/31', b + '/' + TODAY_PATH);
    }
    await prefetch(A, navPages);
    for (const city of CITIES) for (const L of L3) {
        const b = cityBase(L, city);
        const yearLinkRe = new RegExp('^' + esc(b) + '/(\\d{4})$');
        for (const Y of [MIN, MAX, CUR]) {
            const r = await cget(A, b + '/' + Y);
            const body = noComments(r.body);
            const has = (cls) => new RegExp('<a\\b[^>]*class="[^"]*\\b' + cls + '\\b').test(body);
            const wantPrev = Y > MIN, wantNext = Y < MAX;
            ok('M3', has('my-yp-prev') === wantPrev && has('my-yearnav-prev') === wantPrev && has('my-yp-next') === wantNext && has('my-yearnav-next') === wantNext,
                'year page prev arrow/pill ' + (wantPrev ? 'present' : 'ABSENT') + ', next ' + (wantNext ? 'present' : 'ABSENT') + '  ' + b + '/' + Y,
                'my-yp-prev=' + has('my-yp-prev') + ' my-yearnav-prev=' + has('my-yearnav-prev') + ' my-yp-next=' + has('my-yp-next') + ' my-yearnav-next=' + has('my-yearnav-next'));
            const pick = [...body.matchAll(/<option\b[^>]*\bvalue="([^"]*)"[^>]*>/g)].map((m) => (m[1].match(yearLinkRe) || [])[1]).filter(Boolean).map(Number);
            ok('M3', eq(pick, range(MIN, MAX)), 'year picker options exactly ' + MIN + '..' + MAX + '  ' + b + '/' + Y, JSON.stringify(pick));
            const prevLinks = [...body.matchAll(/<a\b[^>]*\brel="prev"[^>]*>/g)].map((m) => m[0]);
            ok('M3', wantPrev || prevLinks.every((t) => !yearLinkRe.test((t.match(/href="([^"]*)"/) || [])[1] || '')), 'no rel=prev year link at MIN  ' + b + '/' + Y, prevLinks.join(' '));
        }
        for (const [Y, M, wantPrev, wantNext] of [[MIN, 1, false, true], [MAX, 12, true, false], [CUR, UTC_M, true, true]]) {
            const p = b + '/' + Y + '/' + p2(M);
            const body = noComments((await cget(A, p)).body);
            const prev = /<a class="moon-hub-cal-prev" href="/.test(body), next = /<a class="moon-hub-cal-next" href="/.test(body);
            const off = (body.match(/<span class="moon-hub-cal-nav-off" aria-hidden="true"><\/span>/g) || []).length;
            ok('M3', prev === wantPrev && next === wantNext && off === (2 - Number(wantPrev) - Number(wantNext)),
                'month nav: a.moon-hub-cal-prev ' + (wantPrev ? 'present' : 'ABSENT') + ', a.moon-hub-cal-next ' + (wantNext ? 'present' : 'ABSENT') + ', span.moon-hub-cal-nav-off x' + (2 - Number(wantPrev) - Number(wantNext)) + '  ' + p,
                'prev=' + prev + ' next=' + next + ' off=' + off);
            const sel = body.match(/<select name="cal-y"[^>]*>([\s\S]*?)<\/select>/g) || [];
            const vals = sel.length === 1 ? [...sel[0].matchAll(/<option value="(\d+)"/g)].map((m) => +m[1]) : [];
            const selected = sel.length === 1 ? (sel[0].match(/<option value="(\d+)" selected>/) || [])[1] : null;
            ok('M3', sel.length === 1 && eq(vals, range(MIN, MAX)) && Number(selected) === Y, 'select[name=cal-y] options exactly ' + MIN + '..' + MAX + ', selected ' + Y + '  ' + p,
                'selects=' + sel.length + ' vals=' + JSON.stringify(vals) + ' selected=' + selected);
        }
    }
    for (const p of [...new Set(navPages)]) {
        const r = await cget(A, p);
        const ys = nestedYears(r.body);
        const outYs = [...new Set(ys.filter((y) => y < MIN || y > MAX))];
        const optYs = [...r.body.matchAll(/<option\b[^>]*\bvalue="([^"]*)"/g)].map((m) => m[1]).flatMap((v) => {
            const n = v.match(/\/moon\/[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*\/(\d{4})(?!\d)/); if (n) return [+n[1]];
            return /^(?:1[89]|2[01])\d\d$/.test(v) ? [+v] : [];
        });
        const outOpt = [...new Set(optYs.filter((y) => y < MIN || y > MAX))];
        ok('M3', r.status === 200 && ys.length > 0 && outYs.length === 0 && outOpt.length === 0,
            'every nested moon year (href/JSON-LD/link) and every <option> year within [' + MIN + ',' + MAX + ']  ' + p + '  (' + ys.length + ' refs, ' + optYs.length + ' year options)',
            'status=' + r.status + ' outOfRangeNested=' + JSON.stringify(outYs) + ' outOfRangeOptions=' + JSON.stringify(outOpt));
    }

    // ── [M4] ────────────────────────────────────────────────────────────────────────────────────────────────────
    section('[M4] legacy flat moon routes + ?cal');
    for (const city of CITIES) for (const L of L3) {
        const P = lp(L), nb = cityBase(L, city);
        for (const t of [`/moon-in-${city.c}/${MIN - 1}-12`, `/moon-in-${city.c}/${MAX + 1}-01`, `/moon-in-${city.c}/${MIN - 1}-12-31`,
                         `/moon-in-${city.c}/${MAX + 1}-01-01`, `/moon-today-in-${city.c}/${MIN - 1}-12-31`, `/moon-today-in-${city.c}/${MAX + 1}-01-01`]) {
            const r = await get(A, P + t);
            ok('M4', r.status === 404 && !r.headers.location && hasNoindex(r), 'out-of-range legacy → 404, NO Location, noindex  ' + P + t, brief(r));
        }
        for (const [t, target] of [[`/moon-in-${city.c}/${MIN}-01`, `${nb}/${MIN}/01`], [`/moon-in-${city.c}/${MAX}-12`, `${nb}/${MAX}/12`],
                                   [`/moon-in-${city.c}/${MIN}-01-01`, `${nb}/${MIN}/01/01`], [`/moon-in-${city.c}/${MAX}-12-31`, `${nb}/${MAX}/12/31`],
                                   [`/moon-today-in-${city.c}/${MIN}-01-01`, `${nb}/${MIN}/01/01`], [`/moon-today-in-${city.c}/${MAX}-12-31`, `${nb}/${MAX}/12/31`]]) {
            const r = await get(A, P + t);
            const f = r.headers.location ? await cget(A, r.headers.location) : null;
            ok('M4', r.status === 301 && r.headers.location === target && f && f.status === 200 && !f.headers.location,
                'in-range legacy → exactly ONE 301 → ' + target + ' (200)  ' + P + t, brief(r) + (f ? ' → ' + brief(f) : ''));
        }
        for (const [q, target] of [[`?cal=${MIN}-01`, `${nb}/${MIN}/01`], [`?cal=${MAX}-12`, `${nb}/${MAX}/12`], [`?cal-y=${MAX}&cal-m=12`, `${nb}/${MAX}/12`]]) {
            const r = await get(A, nb + q);
            const f = r.headers.location ? await cget(A, r.headers.location) : null;
            ok('M4', r.status === 301 && r.headers.location === target && f && f.status === 200 && !f.headers.location,
                'nested hub ?cal in range → ONE 301 → month page (200)  ' + nb + q, brief(r) + (f ? ' → ' + brief(f) : ''));
        }
        for (const q of [`?cal=${MIN - 1}-12`, `?cal=${MAX + 1}-01`, `?cal-y=${MAX + 1}&cal-m=1`, `?cal-y=${MIN - 1}&cal-m=12`, `?cal=${CUR}-13`, '?cal=abc']) {
            const r = await get(A, nb + q);
            ok('M4', r.status === 200 && !r.headers.location && canonicalOf(r.body) === SITE + nb && indexable(r),
                'nested hub ?cal out of range / malformed → 200 hub, canonical clean ' + SITE + nb + '  ' + nb + q, brief(r));
        }
        for (const q of [`?cal=${MIN - 1}-12`, `?cal=${MAX + 1}-01`]) {
            const r = await get(A, P + `/moon-in-${city.c}` + q);
            ok('M4', r.status === 301 && r.headers.location === nb, 'legacy hub ?cal out of range → NO ?cal redirect, the legacy hub 301 → ' + nb + '  ' + P + `/moon-in-${city.c}` + q, brief(r));
        }
    }
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
async function islandChecks(A) {
    section('[I] SSR island window.__MOON_YEAR_RANGE__');
    const want = `window.__MOON_YEAR_RANGE__={"min":${MIN},"max":${MAX}};`;
    const pages = [];
    for (const L of ['ar', 'en']) {
        const b = cityBase(L, RIYADH);
        pages.push(b, b + '/today', b + '/' + CUR, b + '/' + CUR + '/' + p2(UTC_M), b + '/' + TODAY_PATH, b + '/' + MIN + '/01/01');
    }
    pages.push(cityBase('fr', LONDON) + '/' + MAX, cityBase('en', CITIES[2]) + '/' + MIN + '/01');
    for (const p of pages) {
        const r = await get(A, p);
        const tags = [...r.body.matchAll(/<script\b([^>]*)\bid="ssr-moon-year-range"[^>]*>([\s\S]*?)<\/script>/g)];
        const nonce = tags.length === 1 ? (tags[0][1].match(/\bnonce="([^"]+)"/) || [])[1] : null;
        ok('I', r.status === 200 && tags.length === 1 && tags[0][2] === want && !!nonce && nonce === cspNonce(r),
            'exactly one island ' + want + ' with the response CSP nonce  ' + p, 'status=' + r.status + ' tags=' + tags.length + ' body=' + (tags[0] ? tags[0][2] : '') + ' nonce=' + nonce + ' csp=' + cspNonce(r));
    }
    for (const p of ['/', '/en', '/prayer-times-in-makkah', '/qibla', '/en/qibla']) {
        const r = await get(A, p);
        ok('I', r.status === 200 && !r.body.includes('ssr-moon-year-range') && !r.body.includes('__MOON_YEAR_RANGE__='), 'island absent  ' + p, 'status=' + r.status);
    }
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
async function coordChecks(A, B) {
    section('[C1] D4 time-left / next-prayer coordinate tails');
    for (const L of L3) {
        const P = lp(L);
        for (const fam of ['time-left-until-next-prayer-in-', 'next-prayer-in-']) {
            for (const tail of ['riyadh-24-46', 'riyadh--24-46', 'riyadh-24--46', 'riyadh--24--46', 'makkah-21-39', 'london-51-0']) {
                const p = P + '/' + fam + tail;
                expect404NotIndexable('C1', await get(A, p), p);
            }
            // routes review: D4 targets CURATED coordinate variants only — a non-curated stem is served exactly as base.
            {
                const p = P + '/' + fam + 'kamikawa-43-142';
                const r = await get(A, p), rb = B ? await get(B, p) : null;
                expectNoindex200('C1', r, p, 'non-curated stem {slug}-{int}-{int} → 200 noindex,follow self-canonical (as base)');
                ok('C1', !!rb && rb.status === r.status && metaRobots(rb.body) === metaRobots(r.body), 'status + robots identical to base  ' + p, brief(r) + (rb ? ' base ' + brief(rb) : ' no base'));
            }
        }
    }
    section('[C1] D5 qibla tails');
    for (const L of L3) {
        const P = lp(L);
        {
            const p = P + '/qibla-in-riyadh-24.7136-46.6753';
            const r = await get(A, p), rb = B ? await get(B, p) : null;
            const f = r.headers.location ? await get(A, r.headers.location) : null;
            ok('C1', r.status === 301 && r.headers.location === P + '/qibla-in-riyadh' && f && f.status === 200 && indexable(f) && !!rb && eq(redir(r), redir(rb)),
                'resolvable qibla coordinates → ONE 301 → clean (200 indexable), identical to base  ' + p, brief(r) + (rb ? ' base ' + JSON.stringify(redir(rb)) : ' no base'));
        }
        expectNoindex200('C1', await get(A, P + '/qibla-in-unknownplace-12.5-33.2'), P + '/qibla-in-unknownplace-12.5-33.2', 'unknown qibla coordinates → 200 noindex,follow self-canonical');
        expectNoindex200('C1', await get(A, P + '/qibla-in-loc-24.7n-46.6e'), P + '/qibla-in-loc-24.7n-46.6e', 'qibla loc- → 200 noindex,follow self-canonical');
        for (const t of ['/qibla-in-riyadh/2026', '/qibla-in-riyadh/foo', '/qibla-in-Riyadh', '/qibla-in-riyadh.HTML', '/qibla-in-riyadh.html/', '/qibla-in-riyadh.htm',
                         '/qibla-in-24riyadh', '/qibla-in-riyadh-24.7', '/qibla-in-riyadh%20', '/qibla-in-riyadh_x']) {
            expect404NotIndexable('C1', await get(A, P + t), P + t);
        }
    }
    section('[C1] PRAYER tails');
    for (const L of L3) {
        const P = lp(L);
        expectNoindex200('C1', await get(A, P + '/prayer-times-in-riyadh-24.7136-46.6753'), P + '/prayer-times-in-riyadh-24.7136-46.6753', 'prayer {slug}-{lat}-{lng} → 200 noindex,follow self-canonical');
        expectNoindex200('C1', await get(A, P + '/prayer-times-in-loc-24.7n-46.6e'), P + '/prayer-times-in-loc-24.7n-46.6e', 'prayer loc- → 200 noindex,follow self-canonical');
        for (const t of ['/prayer-times-in-riyadh.htm', '/prayer-times-in-riyadh.php', '/prayer-times-in-riyadh.x', '/prayer-times-in-riyadh.html.html', '/prayer-times-in-riyadh-24.7']) {
            expect404NotIndexable('C1', await get(A, P + t), P + t);
        }
        // routes review: rl-time-left / rl-next-prayer on coordinate prayer pages (curated variant / decimal → stem; else full)
        for (const [pp, want] of [['/prayer-times-in-riyadh-24-46', 'riyadh'], ['/prayer-times-in-riyadh-24.7136-46.6753', 'riyadh'], ['/prayer-times-in-kamikawa-43-142', 'kamikawa-43-142']]) {
            const r = await get(A, P + pp);
            const tl = (r.body.match(/id="rl-time-left" href="([^"]*)"/) || [])[1], np = (r.body.match(/id="rl-next-prayer" href="([^"]*)"/) || [])[1];
            const tlT = tl ? await get(A, tl) : null, npT = np ? await get(A, np) : null;
            ok('C1', r.status === 200 && tl === P + '/time-left-until-next-prayer-in-' + want && np === P + '/next-prayer-in-' + want && !!tlT && tlT.status === 200 && !!npT && npT.status === 200,
                'related links → …-in-' + want + ' (both 200)  ' + P + pp, 'tl=' + tl + ' (' + (tlT ? tlT.status : '-') + ') np=' + np + ' (' + (npT ? npT.status : '-') + ')');
        }
        const p = P + '/prayer-times-in-mo';
        const r = await get(A, p), rb = B ? await get(B, p) : null;
        ok('C1', r.status === 301 && r.headers.location === P + '/prayer-times-in-macau' && !!rb && eq(redir(r), redir(rb)), '/prayer-times-in-mo → 301 macau, identical to base  ' + p,
            JSON.stringify(redir(r)) + (rb ? ' base ' + JSON.stringify(redir(rb)) : ' no base'));
    }
    section('[C1] curated / country / discovered-like controls === base');
    const controls = [];
    for (const L of L3) {
        const P = lp(L);
        for (const s of ['/prayer-times-in-riyadh', '/qibla-in-riyadh', '/time-left-until-next-prayer-in-riyadh', '/next-prayer-in-riyadh',
                         '/prayer-times-in-saudi-arabia', '/prayer-times-in-macau', '/prayer-times-in-makkah', '/qibla-in-makkah', '/prayer-times-in-london',
                         '/prayer-times-in-malaysia', '/prayer-times-in-hong-kong', '/prayer-times-worldwide',
                         '/prayer-times-in-kamikawa', '/qibla-in-kamikawa', '/time-left-until-next-prayer-in-kamikawa', '/next-prayer-in-kamikawa']) controls.push(P + s);
    }
    await prefetch(A, controls, 4); if (B) await prefetch(B, controls, 4);
    for (const p of controls) {
        const a = seo(await cget(A, p)), b = B ? seo(await cget(B, p)) : null;
        const kamikawa = p.includes('kamikawa');
        // /prayer-times-worldwide is written by serveCountriesPage itself and has NO robots meta (default index) — on base too.
        const worldwide = /\/prayer-times-worldwide$/.test(p);
        const rA = await cget(A, p);
        const robotsOk = kamikawa ? /noindex/.test(a.robots || '') : worldwide ? (a.robots === null && !/noindex/i.test(xrt(rA))) : /(^|,)index,/.test(a.robots || '');
        const shape = a.status === 200 && robotsOk && a.canonical === SITE + p;
        ok('C1', !!b && eq(a, b) && shape, 'status/Location/canonical/robots/title/hreflang identical to base (' + (kamikawa ? 'noindex' : worldwide ? 'no robots meta = default index' : 'index') + ', self-canonical)  ' + p,
            b ? (diffKeys(a, b) || ('shape: ' + JSON.stringify(a))) : 'no base');
    }
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
async function htmlChecks(A, B) {
    section('[H1] .html → ONE 301 to the final clean URL');
    const H = [];
    for (const L of LANGS) {
        const P = lp(L), mb = cityBase(L, RIYADH);
        H.push([P + '/prayer-times-in-riyadh.html', P + '/prayer-times-in-riyadh'], [P + '/qibla-in-riyadh.html', P + '/qibla-in-riyadh'],
               [mb + '.html', mb], [mb + '/today.html', mb + '/today'], [mb + '/' + CUR + '.html', mb + '/' + CUR],
               [mb + '/' + CUR + '/' + p2(UTC_M) + '.html', mb + '/' + CUR + '/' + p2(UTC_M)], [mb + '/' + TODAY_PATH + '.html', mb + '/' + TODAY_PATH]);
    }
    H.push(['/prayer-times-in-riyadh.html?x=1&y=%20z', '/prayer-times-in-riyadh?x=1&y=%20z'],
           ['/prayer-times-in-mecca.html', '/prayer-times-in-makkah'],
           ['/en/prayer-times-in-mecca.html?utm_source=a&b=', '/en/prayer-times-in-makkah?utm_source=a&b='],
           ['/fr/prayer-times-in-mo.html?a=b', '/fr/prayer-times-in-macau?a=b'],
           ['/ms/prayer-times-in-hk.html', '/ms/prayer-times-in-hong-kong'],
           ['/prayer-times-in-saudi-arabia.html', '/prayer-times-in-saudi-arabia'],
           ['/prayer-times-in-singapore.html', '/prayer-times-in-singapore'],
           ['/prayer-times-in-riyadh-24.7136-46.6753.html', '/prayer-times-in-riyadh-24.7136-46.6753'],
           ['/prayer-times-in-loc-24.7n-46.6e.html', '/prayer-times-in-loc-24.7n-46.6e'],
           ['/qibla-in-riyadh-24.7136-46.6753.html', '/qibla-in-riyadh'],
           ['/en/qibla-in-riyadh-24.7136-46.6753.html?q=1', '/en/qibla-in-riyadh?q=1'],
           ['/de/qibla-in-mecca.html', '/de/qibla-in-makkah'],
           ['/qibla-in-loc-24.7n-46.6e.html', '/qibla-in-loc-24.7n-46.6e'],
           ['/moon/saudi-arabia/riyadh.html?cal=' + MIN + '-01', '/moon/saudi-arabia/riyadh/' + MIN + '/01'],
           ['/en/moon/saudi-arabia/riyadh.html?cal-y=' + MAX + '&cal-m=12', '/en/moon/saudi-arabia/riyadh/' + MAX + '/12'],
           ['/moon/saudi-arabia/riyadh.html?cal=' + (MIN - 1) + '-12', '/moon/saudi-arabia/riyadh?cal=' + (MIN - 1) + '-12'],
           ['/en/moon/saudi-arabia/riyadh/' + CUR + '.html?utm=x', '/en/moon/saudi-arabia/riyadh/' + CUR + '?utm=x'],
           ['/moon/egypt/riyadh/' + CUR + '.html', '/moon/saudi-arabia/riyadh/' + CUR],
           ['/moon/egypt/riyadh.html', '/moon/saudi-arabia/riyadh'],
           // constraints review: a country-mismatched nested hub .html with ?cal resolves the month in the SAME hop
           ['/moon/egypt/riyadh.html?cal=' + MIN + '-01', '/moon/saudi-arabia/riyadh/' + MIN + '/01'],
           ['/en/moon/egypt/riyadh.html?cal-y=' + MAX + '&cal-m=12', '/en/moon/saudi-arabia/riyadh/' + MAX + '/12'],
           ['/fr/moon/united-kingdom/london/' + MIN + '/01/01.html', '/fr/moon/united-kingdom/london/' + MIN + '/01/01'],
           ['/moon/saudi-arabia/an-nabiah/' + MAX + '/12.html', '/moon/saudi-arabia/an-nabiah/' + MAX + '/12'],
           // review F2: the query is kept byte-for-byte, including a second '?'
           ['/prayer-times-in-riyadh.html?a=1?b=2', '/prayer-times-in-riyadh?a=1?b=2'],
           ['/fr/qibla-in-riyadh.html?utm_source=x?ref=y', '/fr/qibla-in-riyadh?utm_source=x?ref=y']);
    await pool(H, 6, async ([p, target]) => {
        const r = await get(A, p);
        const f = r.headers.location ? await get(A, r.headers.location) : null;
        ok('H1', r.status === 301 && r.headers.location === target && r.headers['cache-control'] === 'public, max-age=86400' && f && f.status === 200 && !f.headers.location,
            'ONE 301 → ' + target + ' (public, max-age=86400) → 200  ' + p,
            brief(r) + ' cc=' + r.headers['cache-control'] + (f ? ' → ' + brief(f) : ''));
    });
    section('[H1] non-matching .html → 404 without Location');
    for (const p of ['/prayer-times-in-riyadh-24.7.html', '/prayer-times-in-Riyadh.html', '/qibla-in-Riyadh.html', '/qibla-in-riyadh/2026.html',
                     '/moon/saudi-arabia/riyadh/' + (MAX + 1) + '.html', '/moon/saudi-arabia/riyadh/' + (MIN - 1) + '/12.html',
                     '/en/moon/saudi-arabia/riyadh/' + (MAX + 1) + '/01/01.html', '/moon/saudi-arabia/zzz-no-city/' + CUR + '.html',
                     '/time-left-until-next-prayer-in-riyadh.html', '/en/time-left-until-next-prayer-in-riyadh.html', '/next-prayer-in-riyadh.html',
                     '/quran.html', '/quran/al-fatihah.html', '/privacy.html', '/terms.html', '/en/privacy.html', '/fr/terms.html',
                     // review F1: an Object.prototype key is never a route (no 301 to "function Object() …")
                     '/prayer-times-in-constructor.html', '/en/prayer-times-in-constructor.html', '/fr/prayer-times-in-constructor.html',
                     '/qibla-in-constructor.html', '/qibla-in-constructor-21.4-39.8.html', '/ms/qibla-in-constructor.html']) {
        const r = await get(A, p);
        ok('H1', r.status === 404 && !r.headers.location, '404, no Location  ' + p, brief(r));
    }
    section('[H1] legacy tool / Hijri .html 301s + /index.html === base');
    for (const p of ['/msbaha.html', '/en/msbaha.html', '/today-hijri-date.html', '/en/today-hijri-date.html', '/date-converter.html', '/en/date-converter.html',
                     '/hijri-date/1448-01-01.html', '/en/hijri-date/1448-01-01.html', '/hijri-calendar/1447-03.html', '/en/hijri-calendar/1447-03.html',
                     '/msbaha.html?x=1', '/hijri-date/1448-01-01.html?y=2']) {
        const a = await get(A, p), b = B ? await get(B, p) : null;
        const clean = p.split('?')[0].replace(/\.html$/, '');
        ok('H1', !!b && eq(redir(a), redir(b)) && a.status === 301 && a.headers.location === clean && a.headers['cache-control'] === 'public, max-age=31536000',
            'unchanged legacy 301 → ' + clean + ' (no query, max-age=31536000), byte-equal to base  ' + p, JSON.stringify(redir(a)) + (b ? ' base ' + JSON.stringify(redir(b)) : ' no base'));
    }
    for (const p of ['/index.html', '/index.html?x=1', '/en/index.html']) {
        const a = await get(A, p), b = B ? await get(B, p) : null;
        ok('H1', !!b && eq(redir(a), redir(b)), '/index.html handling identical to base  ' + p, JSON.stringify(redir(a)) + (b ? ' base ' + JSON.stringify(redir(b)) : ' no base'));
    }
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
async function singaporeChecks(A, B, afterChild) {
    section('[S1] Singapore — city pages, *-singapore-city, moon, chains');
    const cityPages = [], cityNoindex = [], moonPages = [];
    for (const L of LANGS) {
        const P = lp(L);
        for (const f of ['/prayer-times-in-', '/qibla-in-', '/time-left-until-next-prayer-in-', '/next-prayer-in-']) { cityPages.push(P + f + 'singapore'); cityNoindex.push(P + f + 'singapore-city'); }
        moonPages.push(P + '/moon/singapore', P + '/moon/singapore/singapore', P + '/moon/singapore/singapore/today', P + '/moon/singapore/singapore/' + CUR);
    }
    await prefetch(A, [...cityPages, ...cityNoindex, ...moonPages], 6);
    if (B) await prefetch(B, moonPages, 6);
    for (const p of cityPages) expectIndexable200('S1', await cget(A, p), p, 'Singapore city page 200 index,follow self-canonical, no redirect');
    for (const p of cityNoindex) expectNoindex200('S1', await cget(A, p), p, '*-singapore-city 200 noindex,follow, no redirect');
    for (const p of moonPages) {
        const a = seo(await cget(A, p)), b = B ? seo(await cget(B, p)) : null;
        ok('S1', !!b && eq(a, b) && a.status === 200 && /(^|,)index,/.test(a.robots || '') && a.canonical === SITE + p, 'moon Singapore page unchanged vs base (200 index self-canonical)  ' + p,
            b ? (diffKeys(a, b) || JSON.stringify(a)) : 'no base');
    }
    for (const L of LANGS) {
        const P = lp(L);
        for (const [src, dst] of [[P + '/moon-in-singapore', P + '/moon/singapore/singapore'], [P + '/moon-today-in-singapore', P + '/moon/singapore/singapore/today']]) {
            const r = await get(A, src);
            const f = r.headers.location ? await cget(A, r.headers.location) : null;
            ok('S1', r.status === 301 && r.headers.location === dst && f && f.status === 200 && !f.headers.location && indexable(f),
                'ONE 301 → ' + dst + ' (200 indexable)  ' + src, brief(r) + (f ? ' → ' + brief(f) : ''));
        }
    }
    {
        const r = await get(A, '/singapore');
        const f = r.headers.location ? await get(A, r.headers.location) : null;
        ok('S1', r.status === 301 && r.headers.location === '/prayer-times-in-singapore' && f && f.status === 200 && !f.headers.location && indexable(f),
            '/singapore → ONE 301 → /prayer-times-in-singapore (200 indexable, chain ends)', brief(r) + (f ? ' → ' + brief(f) : ''));
    }
    section('[S1] boot guard: only the live curated slug "singapore" loses its redirect');
    const redirects = JSON.parse(fs.readFileSync(path.join(ROOT, 'db/curated-slugs.json'), 'utf8')).redirects || {};
    ok('S1', redirects.singapore === 'singapore-city', 'db/curated-slugs.json still carries singapore → singapore-city (generated file unchanged)', JSON.stringify(redirects.singapore));
    for (const [from, to] of Object.entries(redirects)) {
        if (from === 'singapore') continue;
        const p = '/prayer-times-in-' + from;
        const a = await get(A, p), b = B ? await get(B, p) : null;
        ok('S1', a.status === 301 && a.headers.location === '/prayer-times-in-' + to && !!b && eq(redir(a), redir(b)), 'other curated redirect unchanged vs base  ' + p + ' → /prayer-times-in-' + to,
            JSON.stringify(redir(a)) + (b ? ' base ' + JSON.stringify(redir(b)) : ' no base'));
    }
    const warn = (afterChild && afterChild.bootLog || '').split(/\r?\n/).filter((l) => l.includes('[Curated] ignoring redirect for live curated slug:'));
    const warnSlugs = [...new Set(warn.map((l) => (l.match(/live curated slug:\s*(\S+)/) || [])[1]))];
    ok('S1', warn.length >= 1 && eq(warnSlugs, ['singapore']) && warn.every((l) => /singapore -> singapore-city/.test(l)), 'boot log: the guard dropped exactly one key — singapore -> singapore-city',
        JSON.stringify(warn));
    section('[S1] no internal link to *-singapore-city');
    for (const L of ['ar', 'en']) {
        for (const s of ['/', '/prayer-times-worldwide', '/prayer-times-in-singapore', '/moon/singapore', '/qibla-in-singapore', '/prayer-times-in-malaysia']) {
            const p = (L === 'ar' ? '' : '/en') + (s === '/' && L !== 'ar' ? '' : s);
            const r = await cget(A, p || '/');
            const bad = [...r.body.matchAll(/\bhref=["']([^"']*)["']/gi)].map((m) => m[1]).filter((h) => h.includes('-singapore-city'));
            ok('S1', r.status === 200 && bad.length === 0, "no '-singapore-city' in any href  " + (p || '/'), 'status=' + r.status + ' ' + bad.slice(0, 3).join(' '));
        }
    }
    const app = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
    ok('S1', !app.includes('singapore-city'), "js/app.js contains no 'singapore-city'", 'count=' + (app.split('singapore-city').length - 1));
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
function parseUrlset(xml) {
    const blocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
    return blocks.map((b) => ({ loc: (b.match(/<loc>([^<]*)<\/loc>/) || [])[1] || null, lastmod: (b.match(/<lastmod>([^<]*)<\/lastmod>/) || [])[1] || null,
                               lastmodN: (b.match(/<lastmod>/g) || []).length }));
}
async function readAllSitemaps(port) {
    const robots = await get(port, '/robots.txt');
    const index = await get(port, '/sitemap.xml');
    const children = [...index.body.matchAll(/<sitemap>([\s\S]*?)<\/sitemap>/g)].map((m) => ({ loc: (m[1].match(/<loc>([^<]*)<\/loc>/) || [])[1], lastmodN: (m[1].match(/<lastmod>/g) || []).length }));
    const files = [];
    const names = children.map((c) => String(c.loc || '').replace(SITE, ''));
    if (!names.includes('/sitemap-quran.xml')) names.push('/sitemap-quran.xml');
    for (const n of names) {
        const r = await get(port, n);
        files.push({ name: n, status: r.status, totalLastmod: (r.body.match(/<lastmod>/g) || []).length, urls: parseUrlset(r.body), sha: crypto.createHash('sha256').update(r.buf).digest('hex'),
                     etag: r.headers.etag || null, lastModified: r.headers['last-modified'] || null });
    }
    return { robots, index, children, files };
}
const RIYADH_MOON_LOC = /^https:\/\/timesprayers\.com(?:\/(?:en|fr|tr|ur|de|id|es|bn|ms))?\/moon\/saudi-arabia\/riyadh\/(\d{4})(?:\/\d{2})?$/;
function riyadhMoonYears(urls) {
    const per = {};
    for (const u of urls) { const m = String(u.loc).match(RIYADH_MOON_LOC); if (m) per[m[1]] = (per[m[1]] || 0) + 1; }
    return per;
}

async function sitemapChecks(A, B, SM) {
    const byName = Object.fromEntries(SM.files.map((f) => [f.name, f]));
    const main = byName['/sitemap-main.xml'], quran = byName['/sitemap-quran.xml'];
    const shards = SM.files.filter((f) => /^\/sitemap-cities-\d+\.xml$/.test(f.name));

    section('[L1] lastmod policy + counts + <loc> shape on every sitemap file');
    const robotsSitemaps = (SM.robots.body.match(/^Sitemap:\s*(\S+)\s*$/gm) || []).map((l) => l.replace(/^Sitemap:\s*/, '').trim());
    ok('L1', eq(robotsSitemaps, [SITE + '/sitemap.xml', SITE + '/sitemap-quran.xml']), 'robots.txt Sitemap lines = sitemap.xml + sitemap-quran.xml', JSON.stringify(robotsSitemaps));
    ok('L1', SM.index.status === 200 && (SM.index.body.match(/<lastmod>/g) || []).length === 0 && SM.children.every((c) => c.lastmodN === 0),
        'sitemap index: 0 <lastmod> (children carry none)', 'lastmod=' + (SM.index.body.match(/<lastmod>/g) || []).length);
    ok('L1', eq(SM.children.map((c) => c.loc), [SITE + '/sitemap-main.xml', ...range(1, 23).map((i) => SITE + '/sitemap-cities-' + i + '.xml')]),
        'sitemap index children = sitemap-main + sitemap-cities-1..23', SM.children.length + ' children');
    ok('L1', SM.files.every((f) => f.status === 200), 'every sitemap file 200', SM.files.filter((f) => f.status !== 200).map((f) => f.name + '=' + f.status).join(' '));
    const legalDates = [...new Set([...fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8').matchAll(/class="legal-meta">[^<]*?(\d{4}-\d{2}-\d{2})</g)].map((m) => m[1]))];
    ok('L1', legalDates.length === 1 && legalDates[0] === '2026-08-09', 'LEGAL_PAGES legal-meta literals carry ONE date (2026-08-09)', JSON.stringify(legalDates));
    const legalLocs = ['/privacy', '/terms'].flatMap((s) => LANGS.map((L) => SITE + lp(L) + s));
    const withLm = main ? main.urls.filter((u) => u.lastmodN > 0) : [];
    ok('L1', !!main && main.totalLastmod === 20 && eq(withLm.map((u) => u.loc).sort(), legalLocs.slice().sort()) && withLm.every((u) => u.lastmodN === 1 && u.lastmod === legalDates[0]),
        'sitemap-main: <lastmod> ONLY on /[lang/]privacy + /[lang/]terms (20), each = the legal-meta date', main ? 'total=' + main.totalLastmod + ' ' + JSON.stringify(withLm.slice(0, 3)) : 'no main');
    const shardLm = shards.reduce((s, f) => s + f.totalLastmod, 0);
    ok('L1', shards.length === 23 && shardLm === 0, 'sitemap-cities-1..23: 0 <lastmod> in every file (all shards read)', 'files=' + shards.length + ' lastmod=' + shardLm + ' ' + shards.filter((f) => f.totalLastmod).map((f) => f.name).join(' '));
    ok('L1', !!quran && quran.urls.length === 115 && quran.totalLastmod === 115 && quran.urls.every((u) => u.lastmod === '2026-07-22'), 'sitemap-quran: 115 URLs, every <lastmod> = 2026-07-22',
        quran ? 'urls=' + quran.urls.length + ' lastmod=' + quran.totalLastmod : 'no quran');
    const allLm = SM.files.flatMap((f) => f.urls.map((u) => u.lastmod).filter(Boolean));
    ok('L1', !allLm.includes(TODAY_ISO) && allLm.every((d) => d === '2026-08-09' || d === '2026-07-22'), 'no <lastmod> is the request date (' + TODAY_ISO + '); only 2026-08-09 / 2026-07-22 exist',
        JSON.stringify([...new Set(allLm)]));
    const mainN = main ? main.urls.length : 0, shardN = shards.reduce((s, f) => s + f.urls.length, 0), quranN = quran ? quran.urls.length : 0;
    const all = SM.files.flatMap((f) => f.urls.map((u) => u.loc));
    const uniq = new Set(all);
    ok('L1', mainN === 7430 && shardN === 168590 && quranN === 115 && all.length === 176135 && uniq.size === 176135,
        'counts: sitemap-main 7,430 · city shards 168,590 (23 files) · quran 115 · 176,135 entries = 176,135 unique',
        'main=' + mainN + ' shards=' + shardN + ' quran=' + quranN + ' total=' + all.length + ' unique=' + uniq.size);
    const dupWithin = SM.files.filter((f) => new Set(f.urls.map((u) => u.loc)).size !== f.urls.length).map((f) => f.name);
    ok('L1', dupWithin.length === 0, 'no duplicate <loc> within any file', dupWithin.join(' '));
    const badShape = all.filter((l) => !l || !l.startsWith(SITE + '/') || l.includes('?') || /\.html$/i.test(l) || l !== l.toLowerCase() || (l !== SITE + '/' && l.endsWith('/')) || /\s/.test(l));
    ok('L1', badShape.length === 0, 'every <loc>: https apex, no query, no .html, lowercase, no non-canonical trailing slash', badShape.slice(0, 5).join(' '));

    section('[S1] sitemap placement of Singapore');
    const sgMain = main ? main.urls.filter((u) => /\/prayer-times-in-singapore$/.test(u.loc)) : [];
    const sgShard = shards.flatMap((f) => f.urls.filter((u) => /\/prayer-times-in-singapore$/.test(u.loc)).map((u) => u.loc));
    ok('S1', !!main && sgMain.length === 0, 'sitemap-main no longer lists /prayer-times-in-singapore as a country', sgMain.map((u) => u.loc).join(' '));
    ok('S1', eq(sgShard.slice().sort(), LANGS.map((L) => SITE + lp(L) + '/prayer-times-in-singapore').sort()), 'city shards list /prayer-times-in-singapore exactly once per locale (10)', JSON.stringify(sgShard));
    ok('S1', all.every((l) => !l.includes('singapore-city')), "no sitemap <loc> contains 'singapore-city'", all.filter((l) => l.includes('singapore-city')).slice(0, 3).join(' '));

    section('[Q1] Quran sitemap');
    const qMain = main ? main.urls.filter((u) => /^https:\/\/timesprayers\.com(?:\/[a-z]{2})?\/quran(?:\/|$)/.test(u.loc)) : [];
    ok('Q1', !!main && qMain.length === 0, 'sitemap-main contains 0 /quran URLs', qMain.length + ' found');
    const qa = await get(A, '/sitemap-quran.xml'), qb = B ? await get(B, '/sitemap-quran.xml') : null;
    const sha = (r) => crypto.createHash('sha256').update(r.buf).digest('hex');
    ok('Q1', !!qb && qa.status === 200 && sha(qa) === sha(qb), 'sitemap-quran body sha256 === base', sha(qa) + (qb ? ' vs ' + sha(qb) : ' no base'));
    ok('Q1', !!qb && !!qa.headers.etag && qa.headers.etag === qb.headers.etag && !!qa.headers['last-modified'] && qa.headers['last-modified'] === qb.headers['last-modified'],
        'sitemap-quran ETag and Last-Modified === base', JSON.stringify([qa.headers.etag, qa.headers['last-modified']]) + (qb ? ' base ' + JSON.stringify([qb.headers.etag, qb.headers['last-modified']]) : ''));
    const q304 = await get(A, '/sitemap-quran.xml', { 'If-None-Match': qa.headers.etag || '"none"' });
    ok('Q1', q304.status === 304 && q304.buf.length === 0, 'If-None-Match: <ETag> → 304, empty body', 'status=' + q304.status + ' len=' + q304.buf.length);

    return { main, shards, all };
}

async function sitemapSampleChecks(A, SM) {
    section('[SM] sitemap invariant — SAMPLED HTTP (every 1000th <loc> per file + first/last + special URLs)');
    const sample = new Set();
    for (const f of SM.files) {
        f.urls.forEach((u, i) => { if (i % 1000 === 0) sample.add(u.loc); });
        if (f.urls.length) sample.add(f.urls[f.urls.length - 1].loc);
    }
    for (const L of LANGS) { sample.add(SITE + lp(L) + '/prayer-times-in-singapore'); sample.add(SITE + lp(L) + '/privacy'); sample.add(SITE + lp(L) + '/terms'); }
    const list = [...sample].filter((l) => SM.files.some((f) => f.urls.some((u) => u.loc === l)));
    info('sampled ' + list.length + ' of ' + SM.files.reduce((s, f) => s + f.urls.length, 0) + ' <loc>');
    const bad = [];
    await pool(list, 4, async (loc) => {
        const p = loc.replace(SITE, '') || '/';
        const r = await get(A, p);
        if (!(r.status === 200 && !r.headers.location && indexable(r) && canonicalOf(r.body) === loc)) bad.push(loc + ' → ' + brief(r));
    });
    ok('SM', bad.length === 0, 'every sampled <loc> is 200, no Location, indexable, canonical === loc (' + list.length + ' URLs)', bad.slice(0, 5).join(' || '));
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
async function unchangedChecks(A, B) {
    section('[U] robots.txt + Hijri sample === base');
    const ra = await get(A, '/robots.txt'), rb = B ? await get(B, '/robots.txt') : null;
    ok('U', !!rb && ra.status === 200 && ra.body === rb.body && ra.headers['content-type'] === rb.headers['content-type'] && ra.headers['cache-control'] === rb.headers['cache-control'],
        'robots.txt byte-identical to base (status, content-type, cache-control, body)', rb ? 'len ' + ra.body.length + ' vs ' + rb.body.length : 'no base');
    for (const p of ['/hijri-date/1448-01-01', '/hijri-calendar/1447', '/hijri-calendar/1449-12', '/hijri-date/1356-01-01', '/hijri-calendar/1501',
                     '/en/hijri-date/1448-01-01', '/en/hijri-calendar/1447']) {
        const a = await get(A, p), b = B ? await get(B, p) : null;
        const sa = { status: a.status, location: a.headers.location || null, robots: metaRobots(a.body), xrt: xrt(a), canonical: canonicalOf(a.body) };
        const sb = b ? { status: b.status, location: b.headers.location || null, robots: metaRobots(b.body), xrt: xrt(b), canonical: canonicalOf(b.body) } : null;
        ok('U', !!sb && eq(sa, sb), 'Hijri status/Location/robots/canonical identical to base  ' + p + '  (' + sa.status + ')', sb ? (diffKeys(sa, sb) || '') : 'no base');
    }
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// routes review: REAL discovered slugs that end in two numbers (_generateUniqueSlug 'sector-15-2', a name like
//   'Block 12 23') are not D4 coordinate variants — served as base (200 noindex) and linked with their FULL slug.
const D4_DISCOVERED_FIXTURE = {
    'sector-15-2': { slug: 'sector-15-2', lat: 28.4595, lng: 77.0266, timezone: 'Asia/Kolkata', country_code: 'in', type: 'city', names: { en: 'Sector 15', ar: 'القطاع 15' } },
    'block-12-23': { slug: 'block-12-23', lat: 31.52, lng: 74.35, timezone: 'Asia/Karachi', country_code: 'pk', type: 'city', names: { en: 'Block 12 23', ar: 'بلوك 12 23' } },
};
async function d4FixtureChecks(port) {
    section('[C1] D4 real numeric-tail slugs (discovered fixture) — not 404, links keep the full slug');
    for (const L of ['ar', 'en']) {
        const P = lp(L);
        for (const slug of Object.keys(D4_DISCOVERED_FIXTURE)) {
            for (const fam of ['time-left-until-next-prayer-in-', 'next-prayer-in-']) {
                const p = P + '/' + fam + slug;
                expectNoindex200('C1', await get(port, p), p, 'real discovered numeric-tail slug → 200 noindex,follow self-canonical (not a D4 404)');
            }
            const pp = P + '/prayer-times-in-' + slug;
            const r = await get(port, pp);
            const tl = (r.body.match(/id="rl-time-left" href="([^"]*)"/) || [])[1], np = (r.body.match(/id="rl-next-prayer" href="([^"]*)"/) || [])[1];
            ok('C1', r.status === 200 && tl === P + '/time-left-until-next-prayer-in-' + slug && np === P + '/next-prayer-in-' + slug,
                'prayer page related links keep the full slug  ' + pp, 'status=' + r.status + ' tl=' + tl + ' np=' + np);
        }
        for (const fam of ['time-left-until-next-prayer-in-', 'next-prayer-in-']) {
            const p = P + '/' + fam + 'riyadh-24-46';
            expect404NotIndexable('C1', await get(port, p), p);
        }
    }
}

async function seamChecks(port, nowIso, lo, hi, riyadhShardName, label) {
    section('[M5] clock seam TP_MOON_RANGE_TEST_NOW=' + nowIso + ' → expected ' + lo + '..' + hi);
    const b = '/moon/saudi-arabia/riyadh';
    for (const [p, want] of [[b + '/' + lo, 200], [b + '/' + (lo - 1), 404], [b + '/' + hi, 200], [b + '/' + (hi + 1), 404],
                             [b + '/' + hi + '/12', 200], [b + '/' + (hi + 1) + '/01', 404], [b + '/' + (lo - 1) + '/12/31', 404], [b + '/' + lo + '/01/01', 200]]) {
        const r = await get(port, p);
        if (want === 200) ok('M5', r.status === 200 && !r.headers.location && canonicalOf(r.body) === SITE + p, label + ': ' + p + ' → 200 self-canonical', brief(r));
        else expectBranded404('M5', r, label + ': ' + p);
    }
    {
        const r = await get(port, b + '/' + hi + '/12');
        const body = noComments(r.body);
        const tags = [...r.body.matchAll(/<script\b[^>]*\bid="ssr-moon-year-range"[^>]*>([\s\S]*?)<\/script>/g)];
        ok('M5', tags.length === 1 && tags[0][1] === `window.__MOON_YEAR_RANGE__={"min":${lo},"max":${hi}};`, label + ': island min ' + lo + ' max ' + hi, tags.map((t) => t[1]).join(' '));
        const sel = body.match(/<select name="cal-y"[^>]*>([\s\S]*?)<\/select>/) || [];
        const vals = sel[1] ? [...sel[1].matchAll(/<option value="(\d+)"/g)].map((m) => +m[1]) : [];
        ok('M5', eq(vals, range(lo, hi)) && !/<a class="moon-hub-cal-next" href="/.test(body) && /<a class="moon-hub-cal-prev" href="/.test(body),
            label + ': ' + hi + '/12 picker ' + lo + '..' + hi + ', no next month link', JSON.stringify(vals));
        // INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1 (red-suite R2 gap): [M2] month correctness ALSO under the seam clock —
        //   the old city-today ±5 grid clamp only diverges from the range when the two clocks differ, so the real-clock
        //   sweep alone cannot see it. URL year === H1 === grid title === every day cell at both seam edges.
        for (const [Y, M] of [[hi, 12], [lo, 1]]) {
            const mp = b + '/' + Y + '/' + p2(M);
            const bad = checkMonthPage(Y === hi ? r : await get(port, mp), 'ar', RIYADH, Y, M);
            ok('M2', bad.length === 0, label + ': month correct under the seam clock  ' + mp, bad.join(' ; '));
        }
        const y = await get(port, b + '/' + lo);
        ok('M5', !/<a\b[^>]*class="[^"]*\bmy-yp-prev\b/.test(noComments(y.body)) && !/<a\b[^>]*class="[^"]*\bmy-yearnav-prev\b/.test(noComments(y.body)), label + ': year ' + lo + ' has no prev arrow/pill');
        const outs = nestedYears(r.body).concat(nestedYears(y.body)).filter((v) => v < lo || v > hi);
        ok('M5', outs.length === 0, label + ': nested moon years on ' + lo + ' / ' + hi + '/12 within [' + lo + ',' + hi + ']', JSON.stringify([...new Set(outs)]));
    }
    {
        const r1 = await get(port, '/moon-in-riyadh/' + (lo - 1) + '-12'), r2 = await get(port, '/moon-in-riyadh/' + hi + '-12');
        ok('M5', r1.status === 404 && !r1.headers.location && r2.status === 301 && r2.headers.location === b + '/' + hi + '/12', label + ': legacy ' + (lo - 1) + '-12 → 404, ' + hi + '-12 → 301', brief(r1) + ' | ' + brief(r2));
        const c1 = await get(port, b + '?cal=' + hi + '-12'), c2 = await get(port, b + '?cal=' + (hi + 1) + '-01');
        ok('M5', c1.status === 301 && c1.headers.location === b + '/' + hi + '/12' && c2.status === 200 && !c2.headers.location && canonicalOf(c2.body) === SITE + b,
            label + ': hub ?cal=' + hi + '-12 → 301; ?cal=' + (hi + 1) + '-01 → 200 clean canonical', brief(c1) + ' | ' + brief(c2));
    }
    // sitemap window stays current year ±1 (of the seam clock)
    let per = {};
    if (riyadhShardName) { const r = await get(port, riyadhShardName); per = riyadhMoonYears(parseUrlset(r.body)); }
    if (!Object.keys(per).length) {
        const idx = await get(port, '/sitemap.xml');
        for (const m of idx.body.matchAll(/<loc>https:\/\/timesprayers\.com(\/sitemap-cities-\d+\.xml)<\/loc>/g)) {
            const r = await get(port, m[1]); const x = riyadhMoonYears(parseUrlset(r.body));
            if (Object.keys(x).length) { per = x; break; }
        }
    }
    const seamCur = new Date(Date.parse(nowIso)).getUTCFullYear();
    const wantYears = [seamCur - 1, seamCur, seamCur + 1].map(String);
    ok('M5', eq(Object.keys(per).sort(), wantYears) && wantYears.every((y) => per[y] === 130), label + ': sitemap riyadh moon years = ' + wantYears.join(',') + ' only (130 locs each: year + 12 months × 10 locales)',
        JSON.stringify(per));
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
(async () => {
    let afterChild = null, baseChild = null, seam1 = null, seam2 = null, d4FixDir = null;
    const t0 = Date.now();
    try {
        staticChecks();
        let base = null;
        const baseUrl = process.env.TP_BASE_URL || '';
        const bootAfter = boot(ROOT, AFTER_PORT);
        let bootBase = null;
        if (!baseUrl && process.env.TP_BASE_ROOT) {
            const broot = process.env.TP_BASE_ROOT;
            const tb = execFileSync('git', ['-C', broot, 'rev-parse', 'HEAD^{tree}'], { encoding: 'utf8' }).trim();
            const want = execFileSync('git', ['-C', ROOT, 'rev-parse', BASE_COMMIT + '^{tree}'], { encoding: 'utf8' }).trim();
            const porcelain = execFileSync('git', ['-C', broot, 'status', '--porcelain'], { encoding: 'utf8' }).trim();
            ok('U', tb === want && porcelain === '', 'TP_BASE_ROOT is clean and its tree === ' + BASE_COMMIT + '^{tree}', tb + ' vs ' + want + ' porcelain=' + porcelain.split('\n').length);
            bootBase = boot(broot, BASE_PORT);
        }
        afterChild = await bootAfter;
        if (bootBase) { baseChild = await bootBase; base = BASE_PORT; }
        if (baseUrl) { const u = new URL(baseUrl); base = Number(u.port); }
        if (!base) ok('U', false, 'base server available', 'no TP_BASE_ROOT / TP_BASE_URL — every base comparison fails');
        const A = AFTER_PORT, B = base;

        await moonChecks(A);
        await islandChecks(A);
        await coordChecks(A, B);
        await htmlChecks(A, B);
        await singaporeChecks(A, B, afterChild);
        await unchangedChecks(A, B);

        section('reading every sitemap file (after' + (B ? ' + base' : '') + ')');
        CACHE.clear();
        const SM = await readAllSitemaps(A);
        info('after: ' + SM.files.map((f) => f.name + '=' + f.urls.length).join(' '));
        await sitemapChecks(A, B, SM);
        const riyadhShard = SM.files.find((f) => /sitemap-cities/.test(f.name) && Object.keys(riyadhMoonYears(f.urls)).length);
        const perAfter = riyadhShard ? riyadhMoonYears(riyadhShard.urls) : {};
        let perBase = null;
        if (B) {
            const bs = await get(B, riyadhShard ? riyadhShard.name : '/sitemap-cities-1.xml');
            perBase = riyadhMoonYears(parseUrlset(bs.body));
            const bm = parseUrlset((await get(B, '/sitemap-main.xml')).body);
            info('base sitemap-main: ' + bm.length + ' URLs, /quran URLs ' + bm.filter((u) => /\/quran(\/|$)/.test(u.loc)).length + ', /prayer-times-in-singapore ' + bm.filter((u) => /\/prayer-times-in-singapore$/.test(u.loc)).length);
        }
        section('[M5] real clock: sitemap moon window unchanged (current year ±1)');
        const wantReal = [CUR - 1, CUR, CUR + 1].map(String);
        ok('M5', eq(Object.keys(perAfter).sort(), wantReal) && wantReal.every((y) => perAfter[y] === 130) && !!perBase && eq(perAfter, perBase),
            'sitemap riyadh moon years = ' + wantReal.join(',') + ' (130 each) and identical to base', JSON.stringify(perAfter) + ' base ' + JSON.stringify(perBase));
        await sitemapSampleChecks(A, SM);
        const shardName = riyadhShard ? riyadhShard.name : null;
        SM.files.length = 0;

        stop(baseChild); baseChild = null;
        stop(afterChild); afterChild = null;
        CACHE.clear();
        seam1 = await boot(ROOT, SEAM1_PORT, { TP_MOON_RANGE_TEST_NOW: '2027-01-01T00:30:00Z' });
        await seamChecks(SEAM1_PORT, '2027-01-01T00:30:00Z', 2022, 2032, shardName, 'seam 2027-01-01T00:30Z');
        stop(seam1); seam1 = null;
        d4FixDir = fs.mkdtempSync(path.join(process.env.TEMP || process.env.TMP || path.resolve(ROOT, '..'), 'irsc-d4-'));
        const d4Fix = path.join(d4FixDir, 'discovered-fixture.json');
        fs.writeFileSync(d4Fix, JSON.stringify(D4_DISCOVERED_FIXTURE));
        seam2 = await boot(ROOT, SEAM2_PORT, { TP_MOON_RANGE_TEST_NOW: '2026-12-31T23:30:00Z', DISCOVERED_SSR_TEST_FIXTURE: d4Fix });
        await seamChecks(SEAM2_PORT, '2026-12-31T23:30:00Z', 2021, 2031, shardName, 'seam 2026-12-31T23:30Z');
        await d4FixtureChecks(SEAM2_PORT);
    } catch (e) {
        fail++; fails.push('HARNESS: ' + (e && e.stack || e)); console.log('  ✗ HARNESS: ' + (e && e.stack || e));
    } finally { stop(afterChild); stop(baseChild); stop(seam1); stop(seam2); if (d4FixDir) { try { fs.rmSync(d4FixDir, { recursive: true, force: true }); } catch (_) {} } }
    console.log('\n================================================================');
    console.log('  INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1 smoke   PASS ' + pass + '   FAIL ' + fail + '   (' + Math.round((Date.now() - t0) / 1000) + ' s)');
    fails.forEach((f) => console.log('    - ' + f));
    console.log('================================================================');
    process.exit(fail === 0 ? 0 : 1);
})();
