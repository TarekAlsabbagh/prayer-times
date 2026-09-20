#!/usr/bin/env node
// =====================================================================================================
// MOON-DAY-INTERNAL-LINK-CLEANUP-1 — smoke suite.
//
// The ticket removes DUPLICATE internal links to moon-day URLs and stops minting legacy day URLs. It must
// not change a single URL, status, robots meta, canonical, hreflang, title, description, JSON-LD or
// sitemap entry, and it must not make any day URL unreachable.
//
//   [A] static  the four edits are present, and only those: the year table's Hijri cell is text, the
//               forecast's Hijri cell is the text variant, the 7-day chart prefers the nested day base,
//               the month chart's dots are not anchors, and both changed bundles are cache-busted
//   [B] links   BASE vs THIS TREE over a page matrix (famous + non-famous city, 10 languages, hub /
//               today / year / month / day in and out of the indexable window): emitted day hrefs go
//               DOWN, unique day targets stay IDENTICAL, legacy /moon-in-{slug}/{ISO} hrefs go to 0
//   [C] seo     over the same matrix: status, canonical, every hreflang alternate, robots meta, title,
//               meta description, every JSON-LD block and the H1 are byte-identical to BASE
//   [D] sitemap sitemap-moon-*.xml (and sitemap.xml) byte-identical to BASE
//   [E] guard   every server is started with the frozen outbound guard; 0 non-loopback attempts
//
// Local loopback servers only. Nothing here ever touches production.
//
// Usage: node scripts/_smoke_moon_day_internal_link_cleanup_1.mjs --base <clean tree> [--ports 9400,9401]
// =====================================================================================================
import fs from 'node:fs';
import os from 'node:os';
import net from 'node:net';
import path from 'node:path';
import http from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const argVal = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const BASE = argVal('--base');
const PORTS = (argVal('--ports') || '9400,9401').split(',').map(Number);
const GUARD_SRC = argVal('--guard')
    || 'C:/Users/Tarek/Downloads/TIME PRAYER/reports/render-downsize-readiness-1-work/harness-full/guard.cjs';
const OUT = argVal('--out') || path.join(os.tmpdir(), 'tp-moonlinks-smoke-' + process.pid);
const TAG = 'MOON-DAY-INTERNAL-LINK-CLEANUP-1';

let pass = 0, fail = 0;
const ok = (c, what, detail) => {
    if (c) { pass++; console.log('  PASS ' + what + (detail ? '  ' + detail : '')); }
    else { fail++; console.log('  FAIL ' + what + (detail ? '  :: ' + detail : '')); }
};
const section = (t) => console.log('\n[' + t + ']');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!BASE) { console.error('--base <clean tree> is required'); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });

// ---- this process itself may only speak loopback -----------------------------------------------------
const blocked = [];
{
    const orig = net.Socket.prototype.connect;
    net.Socket.prototype.connect = function (...a) {
        const o = (a[0] && typeof a[0] === 'object') ? a[0] : { port: a[0], host: a[1] };
        const h = String(o.host || o.path || '127.0.0.1');
        if (!/^(127\.|::1|localhost$)/.test(h)) { blocked.push(h); throw new Error('outbound blocked: ' + h); }
        return orig.apply(this, a);
    };
    global.fetch = () => { blocked.push('fetch'); throw new Error('outbound fetch blocked'); };
}

// ---- server control ----------------------------------------------------------------------------------
// node -r cannot take a path with a space on Windows, so the frozen guard is copied next to the artefacts.
const GUARD = path.join(OUT, 'guard.cjs');
try { fs.copyFileSync(GUARD_SRC, GUARD); } catch (e) { console.error('cannot copy guard: ' + e.message); process.exit(2); }

const servers = [];
function boot(root, port, label) {
    const log = path.join(OUT, 'server-' + label + '.log');
    const fd = fs.openSync(log, 'w');
    const benchOut = path.join(OUT, 'bench-' + label);
    fs.mkdirSync(benchOut, { recursive: true });
    const p = spawn(process.execPath, ['-r', GUARD, 'server.js'], {
        cwd: root,
        env: { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', NODE_ENV: 'production',
            SITE_URL: 'https://timesprayers.com', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '',
            SUPABASE_ANON_KEY: '', BENCH_OUT: benchOut, BENCH_GUARD: '1' },
        stdio: ['ignore', fd, fd],
    });
    servers.push({ p, port, label, log, benchOut });
    return p;
}
function killAll() {
    for (const s of servers) {
        try {
            if (process.platform === 'win32') execFileSync('taskkill', ['/PID', String(s.p.pid), '/T', '/F'], { stdio: 'ignore' });
            else process.kill(s.p.pid, 'SIGKILL');
        } catch (_e) { /* already gone */ }
    }
}
const agents = new Map();
function req(port, p) {
    if (!agents.has(port)) agents.set(port, new http.Agent({ keepAlive: true, maxSockets: 4 }));
    return new Promise((resolve) => {
        const r = http.request({ host: '127.0.0.1', port, path: p, agent: agents.get(port),
            headers: { Host: 'timesprayers.com', 'X-Forwarded-Proto': 'https' } }, (s) => {
            const ch = []; s.on('data', (d) => ch.push(d));
            s.on('end', () => resolve({ status: s.statusCode, headers: s.headers, body: Buffer.concat(ch).toString('utf8') }));
        });
        r.on('error', (e) => resolve({ status: -1, headers: {}, body: 'ERR ' + e.message }));
        r.setTimeout(120000, () => { r.destroy(new Error('timeout')); });
        r.end();
    });
}
async function waitHealthy(port, label) {
    for (let i = 0; i < 240; i++) {
        const r = await req(port, '/health');
        if (r.status === 200) return true;
        await sleep(500);
    }
    console.error('server ' + label + ' never became healthy; see ' + path.join(OUT, 'server-' + label + '.log'));
    return false;
}

// ---- extraction helpers --------------------------------------------------------------------------- //
const NESTED_DAY = /(?:href|content)="([^"]*?\/moon\/[a-z][a-z0-9-]*\/[a-z0-9][a-z0-9-]*\/\d{4}\/\d{2}\/\d{2})"/g;
const NESTED_DAY_HREF = /href="([^"]*?\/moon\/[a-z][a-z0-9-]*\/[a-z0-9][a-z0-9-]*\/\d{4}\/\d{2}\/\d{2})"/g;
const LEGACY_DAY_HREF = /href="([^"]*?\/moon-in-[a-z0-9-]+\/\d{4}-\d{2}-\d{2})"/g;
const all = (re, s) => { const out = []; let m; re.lastIndex = 0; while ((m = re.exec(s))) out.push(m[1]); return out; };
const uniq = (a) => Array.from(new Set(a)).sort();

// The SSR bakes live values into some blocks (ISO timestamps, a per-second clock, the CSP nonce and the
//   build stamp). Two requests to the SAME server differ on them, so they are normalised before any
//   comparison; the [gate] section below proves that what is left is deterministic on BASE alone.
const normLive = (s) => String(s == null ? '' : s)
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})/g, '__ISO__')
    .replace(/(&(?:amp;)?b=)[0-9a-f]{7,40}\b/g, '$1__B__')
    .replace(/nonce="[^"]*"/g, 'nonce="__N__"')
    .replace(/\b\d{2}:\d{2}:\d{2}\b/g, '__CLOCK__');

function seoOf(r) {
    const b = r.body;
    const pick = (re) => { const m = b.match(re); return m ? normLive(m[1]) : null; };
    return {
        status: r.status,
        canonical: pick(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i),
        robots: pick(/<meta[^>]+name="robots"[^>]+content="([^"]+)"/i),
        title: pick(/<title>([\s\S]*?)<\/title>/i),
        description: pick(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i),
        ogUrl: pick(/<meta[^>]+property="og:url"[^>]+content="([^"]+)"/i),
        hreflang: normLive((b.match(/<link[^>]+rel="alternate"[^>]+hreflang="[^"]+"[^>]+href="[^"]+"[^>]*>/gi) || []).sort().join('\n')),
        jsonld: normLive((b.match(/<script[^>]+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi) || []).sort().join('\n')),
        h1: pick(/<h1[^>]*>([\s\S]*?)<\/h1>/i),
    };
}

// ================================================================================== A. static assertions
section('A static');
{
    const srv = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
    const app = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
    const chart = fs.readFileSync(path.join(ROOT, 'js/moon-chart.js'), 'utf8');
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const bsrv = fs.readFileSync(path.join(BASE, 'server.js'), 'utf8');
    const bapp = fs.readFileSync(path.join(BASE, 'js/app.js'), 'utf8');
    const bchart = fs.readFileSync(path.join(BASE, 'js/moon-chart.js'), 'utf8');

    // L1 — year phases table
    ok(/<td class="my-table-hijri">\$\{_e\(_hijStr\(e\.m, e\.d\)\)\}<\/td>/.test(srv)
        && !/<td><a class="my-table-link" href="\$\{_e\(_dl\)\}">\$\{_e\(_hijStr/.test(srv),
        'L1 year table: the Hijri cell is text, not a second anchor to the same day URL');
    ok(/<td><a class="my-table-link" href="\$\{_e\(_dl\)\}">\$\{_e\(_dateStr\(e\)\)\}<\/a><\/td>/.test(srv),
        'L1 year table: the DATE cell still links the day page');
    ok(/<td><a class="my-table-link" href="\$\{_e\(_myMonthLink\(e\.m\)\)\}"/.test(srv),
        'L1 year table: the MONTH cell link is untouched');
    // the two anchors shared one _dl variable, so the call count is unchanged by design; what must drop
    //   is the number of times that variable is interpolated into an href inside the row template.
    ok((srv.match(/_myDayLink\(/g) || []).length === (bsrv.match(/_myDayLink\(/g) || []).length,
        'L1 the day-link builder itself is untouched (same call sites as BASE)');
    ok((srv.match(/href="\$\{_e\(_dl\)\}"/g) || []).length === 1
        && (bsrv.match(/href="\$\{_e\(_dl\)\}"/g) || []).length === 2,
        'L1 the row template uses the day href once (BASE used it twice)');

    // L2 — forecast table
    ok(!/fc-hijri-link/.test(app) && /fc-hijri-cell"><span class="fc-hijri-icon"/.test(app),
        'L2 forecast: the Hijri cell is the text variant on every page');
    ok(/const _href = _nestedMoonHrefClient\(_citySlug, _langPrefixFC, 'day', '', _rowIso\);/.test(app)
        && /fc-day-link/.test(app),
        'L2 forecast: the DAY cell still links the day page');
    ok((bapp.match(/_nestedMoonHrefClient\(/g) || []).length - (app.match(/_nestedMoonHrefClient\(/g) || []).length === 1,
        'L2 exactly one _nestedMoonHrefClient call site disappeared (the duplicate)');

    // L3a — 7-day chart
    ok(/function _computePoints\(centerDate, rangeDays, citySlug, langPrefix, tz, nestedDayBase\)/.test(chart),
        'L3a the 7-day point builder takes a nested day base');
    ok(/_nestedBase \? \(_nestedBase \+ '\/' \+ iso\.replace\(\/-\/g, '\/'\)\) : \(urlBase \+ '\/' \+ iso\)/.test(chart),
        'L3a a dot links the nested day URL when the base is known, legacy only as fallback');
    ok(/_computePoints\(centerDate, rangeDays, citySlug, langPrefix, tz, opts\.nestedDayBase \|\| ''\)/.test(chart),
        'L3a render() forwards the option');
    ok(/nestedDayBase: _mcNestedBase,/.test(app) && /_mcNestedBase = _lpNow \+ '\/moon\/'/.test(app),
        'L3a app.js derives the nested day base from the current nested moon path');

    // L3b — month chart: a dot is dropped ONLY when the grid on the same page already links that day
    ok(/const href = \(nestedDayBase && _yearInServerRange\(String\(year\)\) && !\(skipIso && skipIso\[iso\]\)\)/.test(chart)
        && /function _computeMonthPoints\(year, month, nestedDayBase, skipIso\)/.test(chart),
        'L3b a month-chart dot is an anchor only when the grid does not already link that day');
    ok(/skipIso: _mcSkipIso,/.test(app) && /document\.querySelectorAll\('\.moon-hub-cal-cell a\[href\]'\)/.test(app),
        'L3b app.js feeds the chart the grid dates read from the DOM (so the /today cell keeps its dot link)');
    ok(/const href = \(nestedDayBase && _yearInServerRange\(String\(year\)\)\) \?/.test(bchart)
        && !/skipIso/.test(bchart),
        'L3b control: the base tree links EVERY month-chart dot');

    // cache busting + blast radius
    ok(/js\/moon-chart\.js\?v=12/.test(html) && !/js\/moon-chart\.js\?v=11/.test(html), 'moon-chart.js cache-busted to v=12');
    ok(/js\/app\.js\?v=847/.test(html) && !/js\/app\.js\?v=846/.test(html), 'app.js cache-busted to v=847');
    ok(srv.split(TAG).length - 1 === 1 && app.split(TAG).length - 1 === 3 && chart.split(TAG).length - 1 === 2,
        'every edit is tagged with the ticket name', 'server=1 app=3 chart=2');

    // nothing else moved: the moon math, the routes and the sitemap builders are untouched
    const routeBits = ['SUPPORTED_MOON_YEAR_BACK', '_isMoonNestedDay', 'sitemap-moon', 'robots.txt'];
    for (const bit of routeBits) {
        ok((srv.match(new RegExp(bit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
            === (bsrv.match(new RegExp(bit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length,
            'untouched: "' + bit + '" occurrences unchanged vs BASE');
    }
    ok(fs.readFileSync(path.join(ROOT, 'js/moon.js')).equals(fs.readFileSync(path.join(BASE, 'js/moon.js'))),
        'js/moon.js (Meeus) is byte-identical to BASE');
    // robots.txt is generated by the server, not a file — it is compared over HTTP in section D.

    // ---- non-link dots must not look, read or behave like links (owner requirement) ----------------
    const css = fs.readFileSync(path.join(ROOT, 'css/style.css'), 'utf8');
    const bcss = fs.readFileSync(path.join(BASE, 'css/style.css'), 'utf8');
    ok(/circle\.moon-chart-dot \{\r?\n    transition: r 0\.15s ease, filter 0\.15s ease;\r?\n\}/.test(css)
        && !/circle\.moon-chart-dot \{[^}]*cursor: pointer/.test(css),
        'CSS: a dot that is NOT a link no longer gets cursor:pointer');
    ok(/\.moon-chart-container a circle \{\s*\r?\n\s*cursor: pointer;/.test(css)
        && /\.moon-chart-container a:hover circle \{/.test(css),
        'CSS: the pointer cursor + hover affordance live on the LINK rule, so a linked dot is unchanged');
    {
        // the ONLY css delta is that one declaration (plus this ticket's comment)
        const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim();
        const a = strip(bcss), b = strip(css);
        const i = (() => { let k = 0; while (k < a.length && k < b.length && a[k] === b[k]) k++; return k; })();
        ok(a.length - b.length === 'cursor: pointer; '.length && a.slice(i, i + 17) === 'cursor: pointer; ',
            'css/style.css differs from BASE by exactly one removed declaration', 'delta=' + (a.length - b.length)
            + ' at ' + i + ' -> ' + JSON.stringify(a.slice(i - 40, i + 20)));
    }
    ok(/css\/style\.css\?v=509/.test(html) && !/css\/style\.css\?v=508/.test(html)
        && (html.split('css/style.css?v=509').length - 1) === 2,
        'style.css cache-busted to v=509 on both refs (preload + stylesheet)');
    ok(!/role\s*=\s*["']link["']/.test(chart) && !/tabindex/i.test(chart) && !/setAttribute\('tabindex'/.test(chart),
        'the chart never sets role="link" or tabindex on a dot');
    ok(/if \(p\.href\) \{[\s\S]{0,400}?createElementNS\('http:\/\/www\.w3\.org\/2000\/svg', 'a'\)[\s\S]{0,300}?a\.setAttribute\('aria-label'/.test(chart),
        'only a dot WITH an href is wrapped in <a> and carries the aria-label');
    ok(/dot\.addEventListener\('mouseenter'/.test(chart) && /dot\.addEventListener\('focus'/.test(chart)
        && !/dot\.addEventListener\('click'/.test(chart) && !/dot\.addEventListener\('key/.test(chart)
        && !/location\.href/.test(chart),
        'dots carry tooltip listeners only — no click, no key handler, no programmatic navigation');
}

// ================================================================================ boot both trees
section('boot');
boot(BASE, PORTS[0], 'base');
boot(ROOT, PORTS[1], 'new');
const healthy = (await waitHealthy(PORTS[0], 'base')) && (await waitHealthy(PORTS[1], 'new'));
ok(healthy, 'BASE and THIS TREE are both healthy on loopback', 'ports ' + PORTS.join(','));

if (!healthy) { killAll(); console.log('\nRESULT ' + pass + ' PASS / ' + (fail + 1) + ' FAIL'); process.exit(1); }

// ================================================================================ page matrix
const LANGS = ['', '/en', '/fr', '/tr', '/ur', '/de', '/id', '/es', '/bn', '/ms'];
const CITIES = [
    { label: 'famous', country: 'saudi-arabia', city: 'makkah' },
    { label: 'non-famous', country: 'saudi-arabia', city: 'khafji' },
];
const KINDS = [
    { kind: 'hub', suffix: '' },
    { kind: 'today', suffix: '/today' },
    { kind: 'year', suffix: '/2026' },
    { kind: 'month-current', suffix: '/2026/09' },
    { kind: 'month-past', suffix: '/2026/02' },
    { kind: 'day-in-window', suffix: '/2026/09/20' },
    { kind: 'day-out-of-window', suffix: '/2026/02/11' },
];
const MATRIX = [];
for (const lp of LANGS) for (const c of CITIES) for (const k of KINDS) {
    MATRIX.push({ url: lp + '/moon/' + c.country + '/' + c.city + k.suffix, lang: lp || '/ar', city: c.label, kind: k.kind });
}

// ---- determinism gate: BASE vs BASE on the same fields, so a later diff cannot be a live value -------
section('gate BASE vs BASE');
{
    let gateDiffs = 0; const gateEx = [];
    const sample = MATRIX.filter((_, i) => i % 7 === 0);
    for (const m of sample) {
        const [a, b] = [await req(PORTS[0], m.url), await req(PORTS[0], m.url)];
        const sa = seoOf(a), sb = seoOf(b);
        for (const key of Object.keys(sa)) {
            if (JSON.stringify(sa[key]) !== JSON.stringify(sb[key])) { gateDiffs++; if (gateEx.length < 5) gateEx.push(m.url + ' :: ' + key); }
        }
        const ua = uniq(all(NESTED_DAY_HREF, a.body)), ub = uniq(all(NESTED_DAY_HREF, b.body));
        if (ua.join('|') !== ub.join('|')) { gateDiffs++; if (gateEx.length < 5) gateEx.push(m.url + ' :: day targets'); }
    }
    ok(gateDiffs === 0, 'BASE answers itself identically on every compared field (' + sample.length + ' pages)',
        gateDiffs ? gateEx.join(' | ') : 'gate clean');
}

section('B links + C seo (' + MATRIX.length + ' pages x 2 trees)');
let emittedBase = 0, emittedNew = 0, legacyBase = 0, legacyNew = 0;
let uniqueLostTotal = 0, seoDiffs = 0, statusDiffs = 0;
const perKind = {};
const lostExamples = [], seoExamples = [];
for (const m of MATRIX) {
    const [a, b] = [await req(PORTS[0], m.url), await req(PORTS[1], m.url)];
    const ua = uniq(all(NESTED_DAY_HREF, a.body)), ub = uniq(all(NESTED_DAY_HREF, b.body));
    const la = all(LEGACY_DAY_HREF, a.body), lb = all(LEGACY_DAY_HREF, b.body);
    const ea = all(NESTED_DAY_HREF, a.body).length, eb = all(NESTED_DAY_HREF, b.body).length;
    emittedBase += ea; emittedNew += eb; legacyBase += la.length; legacyNew += lb.length;
    const lost = ua.filter((u) => !ub.includes(u));
    if (lost.length) { uniqueLostTotal += lost.length; if (lostExamples.length < 5) lostExamples.push(m.url + ' -> ' + lost.slice(0, 3).join(', ')); }
    if (a.status !== b.status) statusDiffs++;
    const sa = seoOf(a), sb = seoOf(b);
    for (const key of Object.keys(sa)) {
        if (JSON.stringify(sa[key]) !== JSON.stringify(sb[key])) {
            seoDiffs++;
            if (seoExamples.length < 5) {
                const x = String(sa[key] || ''), y = String(sb[key] || '');
                let i = 0; while (i < x.length && i < y.length && x[i] === y[i]) i++;
                seoExamples.push(m.url + ' :: ' + key + ' @' + i
                    + ' BASE=' + JSON.stringify(x.slice(Math.max(0, i - 60), i + 80))
                    + ' NEW=' + JSON.stringify(y.slice(Math.max(0, i - 60), i + 80)));
            }
        }
    }
    const k = perKind[m.kind] || (perKind[m.kind] = { pages: 0, base: 0, neu: 0, uBase: 0, uNew: 0, legacy: 0 });
    k.pages++; k.base += ea; k.neu += eb; k.uBase += ua.length; k.uNew += ub.length; k.legacy += la.length;
}
ok(statusDiffs === 0, 'every page returns the same HTTP status as BASE', String(statusDiffs) + ' differences');
ok(seoDiffs === 0, 'status/canonical/robots/title/description/og:url/hreflang/JSON-LD/H1 identical to BASE',
    seoDiffs ? seoExamples.join(' | ') : MATRIX.length + ' pages x 10 SEO fields');
ok(uniqueLostTotal === 0, 'UNIQUE day targets per page: 0 lost', uniqueLostTotal ? lostExamples.join(' | ') : 'checked ' + MATRIX.length + ' pages');
ok(emittedNew < emittedBase, 'emitted day hrefs went down', 'BASE ' + emittedBase + ' -> ' + emittedNew
    + ' (-' + (emittedBase - emittedNew) + ', -' + (((emittedBase - emittedNew) / emittedBase) * 100).toFixed(2) + '%)');
ok(legacyNew === 0 && legacyBase === 0, 'no legacy /moon-in-{slug}/{ISO} href in SSR on either tree (they are client-side)',
    'BASE ' + legacyBase + ' NEW ' + legacyNew);
console.log('\n  per page kind (both cities, 10 languages):');
console.log('  kind                 pages  emitted BASE  emitted NEW  unique BASE  unique NEW');
for (const [kind, v] of Object.entries(perKind)) {
    console.log('  ' + kind.padEnd(20) + ' ' + String(v.pages).padStart(5) + ' ' + String(v.base).padStart(13)
        + ' ' + String(v.neu).padStart(12) + ' ' + String(v.uBase).padStart(12) + ' ' + String(v.uNew).padStart(11));
}
{
    const y = perKind['year'];
    ok(y && y.base === y.pages * 104 && y.neu === y.pages * 54,
        'year page: 104 -> 54 emitted day hrefs per page (the 50 duplicates are gone)',
        y ? (y.base / y.pages) + ' -> ' + (y.neu / y.pages) : 'missing');
    ok(y && y.uBase === y.uNew, 'year page: the 50 unique day targets are unchanged', y ? y.uBase + ' -> ' + y.uNew : 'missing');
}

// =============================================================================== D sitemap + routes
section('D sitemap / routes');
for (const u of ['/sitemap.xml', '/sitemap-moon-1.xml', '/sitemap-moon-2.xml', '/robots.txt']) {
    const [a, b] = [await req(PORTS[0], u), await req(PORTS[1], u)];
    const norm = (s) => s.replace(/<lastmod>[^<]*<\/lastmod>/g, '<lastmod>X</lastmod>');
    ok(a.status === b.status && norm(a.body) === norm(b.body), 'identical to BASE: ' + u,
        'status ' + a.status + '/' + b.status + ' bytes ' + a.body.length + '/' + b.body.length);
}
for (const u of ['/moon/saudi-arabia/makkah/2026/09/20', '/moon/saudi-arabia/khafji/2026/02/11',
    '/moon-in-makkah/2026-09-21', '/moon/egypt/makkah/2026', '/moon/egypt/zzz-not-a-city/2026',
    '/moon/saudi-arabia/makkah/2032/01', '/moon/saudi-arabia/makkah/2026/09']) {
    const [a, b] = [await req(PORTS[0], u), await req(PORTS[1], u)];
    ok(a.status === b.status && String(a.headers.location || '') === String(b.headers.location || ''),
        'route behaviour unchanged: ' + u, a.status + (a.headers.location ? ' -> ' + a.headers.location : ''));
}

// =============================================================================== E outbound guard
section('E guard');
{
    let attempts = 0;
    for (const s of servers) {
        try {
            for (const f of fs.readdirSync(s.benchOut)) {
                if (/^outbound/.test(f)) attempts += fs.readFileSync(path.join(s.benchOut, f), 'utf8').split('\n').filter(Boolean).length;
            }
        } catch (_e) { /* no file = no attempt */ }
        const log = fs.readFileSync(s.log, 'utf8');
        attempts += (log.match(/\[bench-guard\] BLOCKED/g) || []).length;
    }
    ok(attempts === 0, 'no server attempted a non-loopback connection', String(attempts) + ' attempts');
    ok(blocked.length === 0, 'this test process made no outbound attempt', String(blocked.length));
}

killAll();
await sleep(500);
console.log('\nartefacts: ' + OUT);
console.log('RESULT ' + pass + ' PASS / ' + fail + ' FAIL');
process.exit(fail === 0 ? 0 : 1);
