#!/usr/bin/env node
// =====================================================================================================
// MOON-DAY-INTERNAL-LINK-CLEANUP-1 — smoke suite.
//
// The ticket removed DUPLICATE internal links to moon-day URLs and stopped minting legacy day URLs.
//
// MOON-DAY-PAGES-REMOVAL-1: the old assertions ("0 unique day targets lost", "year 104 -> 54 day hrefs", "day routes
//   unchanged", "sitemap-moon byte-identical") are obsolete — the day/today pages are now REMOVED (410). The harness
//   (outbound guard, boot, page matrix, normLive, regexes, BASE-vs-BASE gate) is kept; the assertions are a BASE-vs-NEW
//   diff against the removal contract, BASE = the pre-removal tree (--base, unchanged):
//   [A] static  js/moon.js byte-identical to BASE; js/app.js + js/moon-chart.js changed and every index.html ?v bumped
//               above BASE; any other index.html js/*.js / css/style.css ?v changes iff its bytes changed
//   [B] links   kept pages (hub / year / month x famous + non-famous city x 10 languages, + /moon/{country} and /moon):
//               THIS TREE emits 0 nested day, 0 legacy day, 0 nested /today and 0 /moon-today-in- hrefs (BASE > 0 =
//               control); today / day page kinds → 200 on BASE, 410 Gone on THIS TREE
//   [C] seo     kept pages: status, canonical, robots, title, meta description, hreflang identical to BASE
//               (og:url / JSON-LD / H1 differences are reported, not asserted)
//   [D] sitemap moon family files (from each sitemap.xml): THIS TREE = BASE minus exactly the /today locs (nothing else
//               removed or added, kept <url> blocks identical); robots.txt + non-moon index children identical; kept
//               routes + day-shaped 404s unchanged; day/today routes → 410
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
// MOON-DAY-PAGES-REMOVAL-1: the previous ticket's source-shape checks (year/forecast/chart day-link edits, exact
//   ?v=847/12/509 pins, the one-declaration CSS delta) describe link builders this ticket removes — replaced by
//   behavioural/relative checks that need no new source string.
section('A static');
{
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const bhtml = fs.readFileSync(path.join(BASE, 'index.html'), 'utf8');
    ok(fs.readFileSync(path.join(ROOT, 'js/moon.js')).equals(fs.readFileSync(path.join(BASE, 'js/moon.js'))),
        'js/moon.js (Meeus) is byte-identical to BASE');
    // every versioned js/*.js + css/style.css ref in index.html: bytes changed vs BASE <=> ?v bumped above BASE
    const verMap = (h) => {
        const o = {};
        for (const m of h.matchAll(/(?:src|href)="((?:js\/[a-z0-9-]+\.js)|(?:css\/style\.css))\?v=(\d+)"/g)) (o[m[1]] = o[m[1]] || []).push(+m[2]);
        return o;
    };
    const vn = verMap(html), vb = verMap(bhtml);
    ok(Object.keys(vb).length > 0 && JSON.stringify(Object.keys(vn).sort()) === JSON.stringify(Object.keys(vb).sort()),
        'index.html references the same versioned js/css files as BASE', Object.keys(vn).sort().join(','));
    for (const f of Object.keys(vb).sort()) {
        const nv = vn[f] || [], bv = vb[f];
        let same = false;
        try { same = fs.readFileSync(path.join(ROOT, f)).equals(fs.readFileSync(path.join(BASE, f))); } catch (_e) { same = false; }
        const bumped = nv.length === bv.length && nv.every((v) => v > Math.max(...bv));
        const detail = 'BASE ?v=' + bv.join(',') + ' NEW ?v=' + nv.join(',') + ' bytes ' + (same ? 'identical' : 'changed');
        if (f === 'js/app.js' || f === 'js/moon-chart.js') {
            ok(!same && bumped, f + ' changed (day/today link builders removed) and every index.html ref is bumped above BASE', detail);
        } else if (f === 'js/i18n.js') {
            // the full i18n bundle is cache-busted by the server's automatic &b=<build sha> (server.js appends it to
            //   (app|i18n).js?v=N on every deploy); its split bundles are versioned by _i18nVersion. A manual ?v bump is optional.
            ok(nv.length === bv.length && nv.every((v) => v >= Math.max(...bv)), f + ' ?v kept or bumped (busted by the automatic &b=<build sha>)', detail);
        } else if (same) {
            ok(JSON.stringify(nv) === JSON.stringify(bv), f + ' unchanged bytes -> same ?v as BASE', detail);
        } else {
            ok(bumped, f + ' changed bytes -> every index.html ref bumped above BASE', detail);
        }
    }
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
// MOON-DAY-PAGES-REMOVAL-1: the country page and the general /moon page must not link a removed page either
for (const lp of LANGS) {
    MATRIX.push({ url: lp + '/moon/saudi-arabia', lang: lp || '/ar', city: '-', kind: 'country' });
    MATRIX.push({ url: lp + '/moon', lang: lp || '/ar', city: '-', kind: 'moon' });
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

// MOON-DAY-PAGES-REMOVAL-1: B/C/D assert the removal contract (BASE = pre-removal tree).
const GONE_KINDS = new Set(['today', 'day-in-window', 'day-out-of-window']);
const NESTED_TODAY_HREF = /href="([^"]*?\/moon\/[a-z][a-z0-9-]*\/[a-z0-9][a-z0-9-]*\/today)(?:[?#][^"]*)?"/g;
const LEGACY_TODAY_HREF = /href="([^"]*?\/moon-today-in-[^"]*)"/g;
const goneHrefs = (s) => [...all(NESTED_DAY_HREF, s), ...all(LEGACY_DAY_HREF, s), ...all(NESTED_TODAY_HREF, s), ...all(LEGACY_TODAY_HREF, s)];
const is410 = (r) => r.status === 410 && !r.headers.location && /data-tp-gone="moon-day"/.test(r.body);
const SEO_KEYS = ['status', 'canonical', 'robots', 'title', 'description', 'hreflang'];
const INFO_KEYS = ['ogUrl', 'jsonld', 'h1'];
const firstDiff = (x, y) => { let i = 0; while (i < x.length && i < y.length && x[i] === y[i]) i++; return i; };

section('B links + C seo (' + MATRIX.length + ' pages x 2 trees)');
let goneBase = 0, goneNew = 0, seoDiffs = 0, infoDiffs = 0, removedOk = 0, removedBad = 0, keptPages = 0;
const perKind = {};
const leakExamples = [], seoExamples = [], infoExamples = [], removedExamples = [];
for (const m of MATRIX) {
    const [a, b] = [await req(PORTS[0], m.url), await req(PORTS[1], m.url)];
    const k = perKind[m.kind] || (perKind[m.kind] = { pages: 0, base: 0, neu: 0, st: {} });
    k.pages++;
    const stKey = a.status + '->' + b.status; k.st[stKey] = (k.st[stKey] || 0) + 1;
    if (GONE_KINDS.has(m.kind)) {
        // removed page kinds: 200 on BASE, 410 Gone in ONE response on THIS TREE
        if (a.status === 200 && is410(b)) removedOk++;
        else { removedBad++; if (removedExamples.length < 5) removedExamples.push(m.url + ' BASE ' + a.status + ' NEW ' + b.status + (b.headers.location ? ' -> ' + b.headers.location : '')); }
        continue;
    }
    keptPages++;
    const ga = goneHrefs(a.body), gb = goneHrefs(b.body);
    k.base += ga.length; k.neu += gb.length; goneBase += ga.length; goneNew += gb.length;
    if (gb.length && leakExamples.length < 5) leakExamples.push(m.url + ' -> ' + uniq(gb).slice(0, 3).join(', '));
    const sa = seoOf(a), sb = seoOf(b);
    for (const key of SEO_KEYS) {
        if (JSON.stringify(sa[key]) !== JSON.stringify(sb[key])) {
            seoDiffs++;
            if (seoExamples.length < 5) {
                const x = String(sa[key] || ''), y = String(sb[key] || ''), i = firstDiff(x, y);
                seoExamples.push(m.url + ' :: ' + key + ' @' + i
                    + ' BASE=' + JSON.stringify(x.slice(Math.max(0, i - 60), i + 80))
                    + ' NEW=' + JSON.stringify(y.slice(Math.max(0, i - 60), i + 80)));
            }
        }
    }
    for (const key of INFO_KEYS) {
        if (JSON.stringify(sa[key]) !== JSON.stringify(sb[key])) {
            infoDiffs++;
            if (infoExamples.length < 3) { const x = String(sa[key] || ''), y = String(sb[key] || ''), i = firstDiff(x, y);
                infoExamples.push(m.url + ' :: ' + key + ' @' + i + ' BASE=' + JSON.stringify(x.slice(Math.max(0, i - 40), i + 60)) + ' NEW=' + JSON.stringify(y.slice(Math.max(0, i - 40), i + 60))); }
        }
    }
}
ok(removedBad === 0 && removedOk > 0, 'today / day page kinds: 200 on BASE -> 410 Gone on THIS TREE (no Location, data-tp-gone="moon-day")',
    removedBad ? removedExamples.join(' | ') : removedOk + ' pages');
ok(goneNew === 0, 'kept pages (hub/year/month/country//moon): 0 nested day, 0 legacy day, 0 nested /today, 0 /moon-today-in- hrefs on THIS TREE',
    goneNew ? goneNew + ' hrefs :: ' + leakExamples.join(' | ') : keptPages + ' pages');
ok(goneBase > 0, 'control: BASE emitted day/today hrefs on the same kept pages (the scan sees them)', 'BASE ' + goneBase + ' -> NEW ' + goneNew);
ok(seoDiffs === 0, 'kept pages: status/canonical/robots/title/description/hreflang identical to BASE',
    seoDiffs ? seoExamples.join(' | ') : keptPages + ' pages x ' + SEO_KEYS.length + ' SEO fields');
console.log('  INFO og:url / JSON-LD / H1 differences on kept pages (not asserted): ' + infoDiffs + (infoExamples.length ? '  e.g. ' + infoExamples.join(' | ') : ''));
console.log('\n  per page kind (both cities, 10 languages):');
console.log('  kind                 pages  day/today hrefs BASE  day/today hrefs NEW  status BASE->NEW');
for (const [kind, v] of Object.entries(perKind)) {
    console.log('  ' + kind.padEnd(20) + ' ' + String(v.pages).padStart(5) + ' ' + String(v.base).padStart(21)
        + ' ' + String(v.neu).padStart(20) + '  ' + Object.entries(v.st).map(([s, n]) => s + ' x' + n).join(', '));
}

// =============================================================================== D sitemap + routes
section('D sitemap / routes');
{
    const [a, b] = [await req(PORTS[0], '/robots.txt'), await req(PORTS[1], '/robots.txt')];
    ok(a.status === b.status && a.body === b.body, 'identical to BASE: /robots.txt', 'status ' + a.status + '/' + b.status + ' bytes ' + a.body.length + '/' + b.body.length);
}
{
    const TODAY_LOC = /^https:\/\/timesprayers\.com(?:\/(?:en|fr|tr|ur|de|id|es|bn|ms))?\/moon\/[a-z][a-z0-9-]*\/[a-z0-9][a-z0-9-]*\/today$/;
    const DAY_LOC = /\/moon\/[a-z][a-z0-9-]*\/[a-z0-9][a-z0-9-]*\/\d{4}\/\d{2}\/\d{2}$|\/moon-today-in-|\/moon-in-[^/]+\/\d{4}-\d{2}-\d{2}$/;
    const family = async (port) => {
        const idx = await req(port, '/sitemap.xml');
        const children = [...idx.body.matchAll(/<loc>([^<]*)<\/loc>/g)].map((x) => x[1]);
        const moonNames = children.map((l) => (l.match(/(\/sitemap-moon(?:-[1-9]\d*)?\.xml)$/) || [])[1]).filter(Boolean);
        const blocks = new Map(); let n = 0;
        for (const f of moonNames) {
            const r = await req(port, f);
            for (const u of r.body.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
                const loc = (u[1].match(/<loc>([^<]*)<\/loc>/) || [])[1] || '';
                n++; blocks.set(loc, u[1].replace(/<lastmod>[^<]*<\/lastmod>/g, '<lastmod>X</lastmod>').trim());
            }
        }
        return { idx, children, moonNames, blocks, n };
    };
    const [fa, fb] = [await family(PORTS[0]), await family(PORTS[1])];
    ok(fa.moonNames.length > 0 && fb.moonNames.length > 0, 'both trees list sitemap-moon family files in sitemap.xml',
        'BASE ' + fa.moonNames.join(',') + ' NEW ' + fb.moonNames.join(','));
    const nonMoon = (c) => c.filter((l) => !/\/sitemap-moon(?:-[1-9]\d*)?\.xml$/.test(l));
    ok(JSON.stringify(nonMoon(fa.children)) === JSON.stringify(nonMoon(fb.children)), 'sitemap.xml: every non-moon child identical to BASE (same order)',
        nonMoon(fa.children).length + ' / ' + nonMoon(fb.children).length + ' children');
    const baseToday = [...fa.blocks.keys()].filter((l) => TODAY_LOC.test(l));
    const removed = [...fa.blocks.keys()].filter((l) => !fb.blocks.has(l));
    const added = [...fb.blocks.keys()].filter((l) => !fa.blocks.has(l));
    const changed = [...fb.blocks.keys()].filter((l) => fa.blocks.has(l) && fa.blocks.get(l) !== fb.blocks.get(l));
    const newGone = [...fb.blocks.keys()].filter((l) => TODAY_LOC.test(l) || DAY_LOC.test(l));
    ok(baseToday.length > 0, 'control: BASE moon family lists /today locs', String(baseToday.length));
    ok(newGone.length === 0, 'THIS TREE moon family: 0 /today and 0 day locs', newGone.slice(0, 3).join(' '));
    ok(added.length === 0, 'THIS TREE moon family: 0 locs added vs BASE', added.slice(0, 3).join(' '));
    ok(removed.length === baseToday.length && removed.every((l) => TODAY_LOC.test(l)),
        'THIS TREE moon family = BASE minus exactly the /today locs (no other loc removed)',
        'removed ' + removed.length + ' / BASE /today ' + baseToday.length + ' (derived 1,070 sitemap-wide, confirm on the first candidate run)'
        + ' non-today removed: ' + removed.filter((l) => !TODAY_LOC.test(l)).slice(0, 3).join(' '));
    ok(changed.length === 0 && fb.n === fb.blocks.size, 'every kept moon <url> block identical to BASE (lastmod normalised), no duplicate loc',
        'changed ' + changed.length + ' ' + changed.slice(0, 2).join(' ') + ' dup ' + (fb.n - fb.blocks.size));
    console.log('  INFO moon family: BASE ' + fa.n + ' locs in ' + fa.moonNames.length + ' files -> NEW ' + fb.n + ' locs in ' + fb.moonNames.length + ' files');
}
// kept routes + day-shaped requests that are 404 on BASE: unchanged
for (const u of ['/moon/egypt/makkah/2026', '/moon/egypt/zzz-not-a-city/2026', '/moon/saudi-arabia/makkah/2032/01', '/moon/saudi-arabia/makkah/2026/09',
    '/moon/saudi-arabia/makkah/2032/01/01', '/moon/saudi-arabia/makkah/2026/02/30', '/moon/saudi-arabia/makkah/today/x', '/moon/egypt/zzz-not-a-city/today']) {
    const [a, b] = [await req(PORTS[0], u), await req(PORTS[1], u)];
    ok(a.status === b.status && String(a.headers.location || '') === String(b.headers.location || ''),
        'route behaviour unchanged: ' + u, a.status + (a.headers.location ? ' -> ' + a.headers.location : ''));
}
// day / today routes (200, or a 301 that ended at a day/today page on BASE) -> 410 directly
for (const u of ['/moon/saudi-arabia/makkah/2026/09/20', '/moon/saudi-arabia/khafji/2026/02/11', '/moon-in-makkah/2026-09-21',
    '/moon-today-in-makkah', '/moon/egypt/makkah/today', '/moon/saudi-arabia/makkah/today']) {
    const [a, b] = [await req(PORTS[0], u), await req(PORTS[1], u)];
    ok((a.status === 200 || a.status === 301) && is410(b), 'removed route -> 410 Gone in ONE response: ' + u,
        'BASE ' + a.status + (a.headers.location ? ' -> ' + a.headers.location : '') + ' NEW ' + b.status + (b.headers.location ? ' -> ' + b.headers.location : ''));
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
