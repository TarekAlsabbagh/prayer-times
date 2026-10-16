// HIJRI-CALENDAR-RANGE-1 — acceptance smoke (HTTP, 127.0.0.1 only, no production).
//
// Owner decision under test (2026-10-16): the Hijri calendar year and month pages are served for the previous, current
// and next Hijri year only (Asia/Riyadh civil date, Umm al-Qura table), in all 10 languages. Past years/months → 410
// (noindex, max-age=3600); future years/months → 404 (noindex, no-store) until they enter; years outside the table and
// malformed shapes keep their old answers. The hub, /today-hijri-date and /date-converter stay. One window source for
// the gate, rel=prev/next, SSR links, the client meta, the 410 bodies and both sitemaps; the hub joins sitemap-hijri.
// Sections
//   [W]  window statuses at a fixed clock (2026-10-16, window 1447–1449), 10 locales: 200 + index + self canonical + 11
//        hreflang + the window meta for hub / 3 years / 36 months; 410 and 404 with their headers for past / future
//        samples; HEAD; the URL forms (trailing slashes, query, month .html twin) answered directly; in-window forms
//        keep their 301s.
//   [U]  unchanged answers: invalid / malformed shapes give the same status, Location and body as batch A.
//   [L]  link audit: every /hijri-calendar/YYYY[-MM] href and rel=prev/next in the SSR HTML of every served calendar page
//        (400), the homepages, hubs, countdowns, today, converter, moon month pages and the 410 / 404 bodies is inside
//        the window.
//   [S]  sitemaps: /sitemap-hijri.xml and the legacy /sitemap-main.xml list exactly hub + window (400), no duplicate.
//   [R]  rollover in ONE running process (2 workers, SSR cache ON), the clock crossing 2027-06-05T21:00:00Z (Riyadh
//        midnight, 1 Muharram 1449) with no restart: 1450 404 → 200 index + listed + linked; 1447 200 → 410, unlisted,
//        unlinked; hub / rel / panel / meta / day-410 links follow; repeated requests reach both workers.
//   [T]  table edges: current year = 1500 (window 1499–1500) and past the table's last day (no year served) — no crash.
//   [C]  owner decision 2026-10-16: a cacheable 410 whose links follow the window is never kept past the next window change
//        (max-age = seconds left, no-cache in the last minute), and the day-410 text matches what it links (month or converter).
//   [N]  outbound guard: no ad / analytics / Supabase attempt.
// Usage: node scripts/_smoke_hijri_calendar_range_1.mjs   (env TP_A_ROOT batch-A checkout, TP_GUARD)
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import zlib from 'node:zlib';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const A_ROOT = process.env.TP_A_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-hijrislim';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const SITE = 'https://timesprayers.com';
const P1 = 8601, PA = 8602, PR = 8603, PT = 8604;
const T0 = '2026-10-16T12:00:00Z';                 // window 1447–1449 (current 1448)
const BOUNDARY = Date.parse('2027-06-05T21:00:00Z'); // 00:00 Asia/Riyadh, 1 Muharram 1449 → window 1448–1450
const LANGS = ['', '/en', '/fr', '/tr', '/ur', '/de', '/id', '/es', '/bn', '/ms'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-hrange-'));
let pass = 0, fail = 0; const fails = []; const SEC = {};
function ok(label, cond, name, detail) {
    const s = SEC[label] || (SEC[label] = { pass: 0, fail: 0 });
    const n = '[' + label + '] ' + name;
    if (cond) { pass++; s.pass++; console.log('  ✓ ' + n); }
    else { fail++; s.fail++; fails.push(n + (detail ? ' :: ' + detail : '')); console.log('  ✗ ' + n + (detail ? '  :: ' + detail : '')); }
}
const info = (s) => console.log('  · INFO ' + s);
const section = (s) => console.log('\n-- ' + s + ' --');
const get = (port, p, { method = 'GET', h = {} } = {}) => new Promise((res) => {
    const r = http.request({ host: '127.0.0.1', port, path: p, method, headers: { 'Accept-Encoding': 'identity', 'User-Agent': 'Mozilla/5.0 (tp-hrange-smoke)', ...h } }, (x) => {
        const c = []; x.on('data', (d) => c.push(d)); x.on('end', () => {
            let b = Buffer.concat(c);
            try { if (x.headers['content-encoding'] === 'br') b = zlib.brotliDecompressSync(b); else if (x.headers['content-encoding'] === 'gzip') b = zlib.gunzipSync(b); } catch (_) {}
            res({ st: x.statusCode, h: x.headers, b: b.toString('utf8') });
        });
    });
    r.setTimeout(120000, () => r.destroy(new Error('timeout')));
    r.on('error', () => res({ st: 0, h: {}, b: '' })); r.end();
});
const kids = [];
async function boot(root, port, tag, extra = {}) {
    if ((await get(port, '/health')).st !== 0) throw new Error('port ' + port + ' already in use');
    const guardOut = path.join(TMP, 'guard-' + tag + '.log'); fs.writeFileSync(guardOut, '');
    const env = { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: SITE, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '',
        ADSENSE_CLIENT: 'off', TP_MOON_DAY_SHED: '0', GUARD_OUT: guardOut };
    for (const k of ['NODE_OPTIONS', 'TP_ENABLE_SEARCH_TEST', 'DISCOVERED_SSR_TEST_FIXTURE', 'TP_HIJRI_SLIM', 'TP_HIJRI_RANGE_TEST_NOW', 'TP_HIJRI_RANGE_TEST_OFFSET_MS']) delete env[k];
    Object.assign(env, typeof extra === 'function' ? extra() : extra);
    const k = spawn(process.execPath, ['-r', GUARD, 'server.js'], { cwd: root, env, stdio: 'ignore' }); k.tag = tag; k.guardOut = guardOut; kids.push(k);
    for (let i = 0; i < 400; i++) { if ((await get(port, '/health')).st === 200) return env; await sleep(400); }
    throw new Error('boot failed ' + tag);
}
const mask = (b) => b.replace(/nonce="[^"]*"/g, 'nonce="N"').replace(/(article:modified_time" content=")[^"]*/g, '$1T')
    .replace(/("date(?:Modified|Published)":\s*")[^"]*/g, '$1T').replace(/(id="current-time">)\d{1,2}:\d{2}(?::\d{2})?/g, '$1CLOCK')
    .replace(/(id="next-prayer-countdown">)[\d:]+/g, '$1COUNTDOWN').replace(/(\b(?:app|i18n)\.js\?v=\d+)&b=[0-9a-f]+/g, '$1&b=SHA');
const noComments = (b) => String(b).replace(/<!--[\s\S]*?-->/g, '');
const head = (b) => (noComments(b).match(/<head>[\s\S]*?<\/head>/) || [''])[0];
const robotsOf = (b) => (head(b).match(/<meta name="robots" content="([^"]*)"/) || [])[1] || null;
const canonOf = (b) => (head(b).match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || null;
const hreflangN = (b) => (head(b).match(/<link rel="alternate" hreflang="/g) || []).length;
const winMeta = (b) => (b.match(/<meta name="tp-hijri-window" content="([^"]*)"/) || [])[1] || null;
// every calendar year / month link of a page (href attributes and rel=prev/next), comments excluded
//   — plus every absolute site URL of a calendar year / month anywhere else in the page (JSON-LD url / item / @id, og:url)
const calLinks = (b) => [...[...noComments(b).matchAll(/\bhref="(?:https?:\/\/[^"/]+)?((?:\/[a-z]{2})?\/hijri-calendar\/(\d{4})(?:-(\d{2}))?)"/g)].map((m) => ({ href: m[1], y: +m[2] })),
    ...[...noComments(b).matchAll(/https:\/\/timesprayers\.com((?:\/[a-z]{2})?\/hijri-calendar\/(\d{4})(?:-\d{2})?)(?![\d-])/g)].map((m) => ({ href: 'abs:' + m[1], y: +m[2] }))];
const relLinks = (b) => [...head(b).matchAll(/<link rel="(prev|next)" href="([^"]+)"/g)].map((m) => m[1] + '=' + m[2].replace(SITE, ''));
const yearsOf = (L, ys) => { const out = []; for (const y of ys) { out.push(L + '/hijri-calendar/' + y); for (let m = 1; m <= 12; m++) out.push(L + '/hijri-calendar/' + y + '-' + String(m).padStart(2, '0')); } return out; };

async function main() {
    console.log('HIJRI-CALENDAR-RANGE-1 smoke — ' + ROOT + ' — UTC ' + new Date().toISOString());
    try {
        await boot(ROOT, P1, 'T0', { TP_HIJRI_RANGE_TEST_NOW: T0 });
        await boot(A_ROOT, PA, 'A');

        section('[W] window 1447–1449 (clock ' + T0 + '), 10 locales');
        for (const L of LANGS) {
            const served = [L + '/hijri-calendar', ...yearsOf(L, [1447, 1448, 1449])];
            let bad = [];
            for (const u of served) {
                const r = await get(P1, u);
                const rb = robotsOf(r.b) || '';
                if (r.st !== 200) { bad.push(u + ' status ' + r.st); continue; }
                if (/noindex/.test(rb) || /noindex/.test(r.h['x-robots-tag'] || '')) bad.push(u + ' robots ' + rb + ' / ' + r.h['x-robots-tag']);
                if (canonOf(r.b) !== SITE + u) bad.push(u + ' canonical ' + canonOf(r.b));
                if (hreflangN(r.b) !== 11) bad.push(u + ' hreflang ' + hreflangN(r.b));
                if (winMeta(r.b) !== '1447,1449,1448') bad.push(u + ' meta ' + winMeta(r.b));
            }
            ok('W', bad.length === 0, (L || '/ar') + ': hub + 1447..1449 + 36 months — 200, index, self canonical, 11 hreflang, meta 1447,1449,1448 (' + served.length + ' pages)', bad.slice(0, 4).join(' | '));
            for (const [kind, ys] of [['past', [1356, 1445, 1446]], ['future', [1450, 1451, 1500]]]) {
                bad = [];
                for (const y of ys) for (const sfx of ['', '-01', '-12']) {
                    const u = L + '/hijri-calendar/' + y + sfx, r = await get(P1, u);
                    const cc = r.h['cache-control'] || '';
                    if (kind === 'past' && !(r.st === 410 && cc === 'public, max-age=3600')) bad.push(u + ' ' + r.st + ' ' + cc);
                    if (kind === 'future' && !(r.st === 404 && cc === 'no-store')) bad.push(u + ' ' + r.st + ' ' + cc);
                    if ((r.h['x-robots-tag'] || '') !== 'noindex') bad.push(u + ' xrt ' + r.h['x-robots-tag']);
                    for (const hd of ['location', 'etag', 'last-modified', 'expires']) if (r.h[hd]) bad.push(u + ' has ' + hd);
                    if (/<script|rel="canonical"/i.test(r.b)) bad.push(u + ' body has script/canonical');
                    if (!/<meta name="robots" content="noindex">/.test(r.b)) bad.push(u + ' no robots noindex meta');
                    const links = [...r.b.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/^\/(?:en|fr|tr|ur|de|id|es|bn|ms)(?=\/)/, ''));
                    if (JSON.stringify(links) !== JSON.stringify(['/hijri-calendar', '/hijri-calendar/1448', '/today-hijri-date', '/date-converter'])) bad.push(u + ' links ' + links.join(','));
                    if (kind === 'future' && !/2027|2028|2075|2076/.test(r.b)) bad.push(u + ' no entry date');
                }
                ok('W', bad.length === 0, (L || '/ar') + ': ' + kind + ' ' + ys.join('/') + ' ×{year,-01,-12} → ' + (kind === 'past' ? '410 public, max-age=3600' : '404 no-store') + ', X-Robots-Tag noindex, light body (hub, 1448, today, converter)', bad.slice(0, 4).join(' | '));
            }
        }
        for (const [u, st] of [['/hijri-calendar/1446', 410], ['/en/hijri-calendar/1450-03', 404], ['/hijri-calendar/1448', 200]]) {
            const r = await get(P1, u, { method: 'HEAD' });
            ok('W', r.st === st && r.b.length === 0, 'HEAD ' + u + ' → ' + r.st + ', empty body', r.st + ' len ' + r.b.length);
        }
        for (const [u, st, loc] of [['/hijri-calendar/1446/', 410], ['/en/hijri-calendar/1446///', 410], ['/hijri-calendar/1446?x=1', 410], ['/hijri-calendar/1446-05.html', 410], ['/en/hijri-calendar/1446-05.html', 410],
            ['/en/hijri-calendar/1450-05.html', 404], ['/fr/hijri-calendar/1450-05/', 404], ['/hijri-calendar/1448/', 301, '/hijri-calendar/1448'], ['/hijri-calendar/1448-05.html', 301, '/hijri-calendar/1448-05'],
            ['/en/hijri-calendar/1449-12/', 301, '/en/hijri-calendar/1449-12']]) {
            const r = await get(P1, u);
            ok('W', r.st === st && (r.h.location || '') === (loc || ''), u + ' → ' + st + (loc ? ' ' + loc : ' directly (no redirect)'), r.st + ' ' + (r.h.location || ''));
        }

        section('[U] unchanged answers (same status, Location and body as batch A)');
        for (const u of ['/hijri-calendar/1355', '/hijri-calendar/1501', '/hijri-calendar/1446-13', '/hijri-calendar/1446-1', '/hijri-calendar/1446.html', '/en/hijri-calendar/1450.html',
            '/hijri-calendar/1448.html', '/fr/hijri-calendar/1446-05.html', '/fr/hijri-calendar/1446.html', '/HIJRI-CALENDAR/1446', '/ar/hijri-calendar/1446', '/hijri-calendar/14460',
            '/hijri-calendar/abcd', '/en/hijri-calendar/1355-01', '/hijri-calendar.html', '/hijri-date/1448-02-30', '/hijri-date/1446-05-04']) {
            const a = await get(PA, u), r = await get(P1, u);
            const same = a.st === r.st && (a.h.location || '') === (r.h.location || '') && mask(a.b) === mask(r.b);
            ok('U', same || (u === '/hijri-date/1446-05-04' && a.st === 410 && r.st === 410), u + ' → ' + r.st + (r.h.location ? ' ' + r.h.location : '') + ' (unchanged)', 'A ' + a.st + ' ' + (a.h.location || '') + ' len ' + a.b.length + ' vs ' + r.b.length);
        }

        section('[L] link audit: every calendar link / rel inside the window 1447–1449');
        {
            const pages = [];
            for (const L of LANGS) pages.push(L + '/hijri-calendar', ...yearsOf(L, [1447, 1448, 1449]));
            const controls = ['/', '/en', '/fr', '/ur', '/bn', '/prayer-times-worldwide', '/en/prayer-times-worldwide', '/qibla', '/en/qibla', '/de/qibla', '/ramadan-countdown', '/eid-al-fitr-countdown',
                '/eid-al-adha-countdown', '/hijri-new-year-countdown', '/en/hijri-new-year-countdown', '/today-hijri-date', '/en/today-hijri-date', '/date-converter', '/en/date-converter', '/moon',
                '/moon/saudi-arabia/riyadh/2026/10', '/en/moon/saudi-arabia/riyadh/2026', '/prayer-times-in-riyadh', '/en/prayer-times-in-saudi-arabia', '/guides', '/privacy',
                '/hijri-date/1447-05-04', '/hijri-date/1446-05-04', '/hijri-date/1450-05-04', '/hijri-calendar/1446', '/hijri-calendar/1450-02', '/en/hijri-calendar/1451'];
            let n = 0, bad = []; const perPage = {};
            for (const u of [...pages, ...controls]) {
                const r = await get(P1, u);
                const ls = calLinks(r.b), rel = relLinks(r.b);
                n += ls.length + rel.length;
                for (const l of ls) if (l.y < 1447 || l.y > 1449) bad.push(u + ' → ' + l.href);
                for (const x of rel) { const y = +(x.match(/hijri-calendar\/(\d{4})/) || [])[1]; if (y && (y < 1447 || y > 1449)) bad.push(u + ' rel ' + x); }
                if (controls.includes(u)) perPage[u] = ls.length;
            }
            ok('L', bad.length === 0, (pages.length + controls.length) + ' pages, ' + n + ' calendar links + rel: all inside 1447–1449', bad.slice(0, 8).join(' | '));
            info('calendar links on control pages: ' + JSON.stringify(perPage));
            const d = await get(P1, '/hijri-date/1447-05-04'), d2 = await get(P1, '/hijri-date/1446-05-04');
            ok('L', /\/hijri-calendar\/1447-05"/.test(d.b) && !/\/hijri-calendar\/1446-05"/.test(d2.b), 'day-410 bodies link their month only when served (1447-05 linked, 1446-05 not)');
            const y47 = await get(P1, '/hijri-calendar/1447'), y49 = await get(P1, '/hijri-calendar/1449');
            ok('L', /<span id="hyear-prev-link"[^>]*hyear-year-nav-off/.test(y47.b) && /<a id="hyear-next-link"[^>]*href="\/hijri-calendar\/1448"/.test(y47.b)
                && /<span id="hyear-next-link"[^>]*hyear-year-nav-off/.test(y49.b) && /<a id="hyear-prev-link"[^>]*href="\/hijri-calendar\/1448"/.test(y49.b), 'year panel: 1447 has no prev, 1449 has no next; the inner buttons stay');
            const m01 = await get(P1, '/hijri-calendar/1447-01'), m12 = await get(P1, '/hijri-calendar/1449-12');
            ok('L', !relLinks(m01.b).some((x) => x.startsWith('prev')) && !relLinks(m12.b).some((x) => x.startsWith('next')), 'month rel: 1447-01 has no prev, 1449-12 has no next', relLinks(m01.b) + ' ' + relLinks(m12.b));
            // (the qibla hub "related tools" block that also carried a /hijri-calendar/1447 card is not rendered on the production
            //   tree either — its try/catch skips it — so it is checked by source only, in the report)
            const home = await get(P1, '/'), cty = await get(P1, '/prayer-times-worldwide'), enHome = await get(P1, '/en');
            ok('L', !/hijri-calendar\/1447/.test(noComments(home.b)) && /class="home-service-card" href="\/hijri-calendar"/.test(home.b) && /href="\/hijri-calendar" data-i18n="footer\.link_hijri_year">التقويم الهجري</.test(cty.b)
                && /class="home-service-card" href="\/en\/hijri-calendar"[\s\S]{0,300}?>Hijri Calendar</.test(enHome.b), 'no pinned 1447: the home service card (ar, en) and the countries footer link the hub with a year-free label');
        }

        section('[S] sitemaps list exactly hub + window (×10 locales), no duplicate');
        {
            const exp = new Set(); for (const L of LANGS) [L + '/hijri-calendar', ...yearsOf(L, [1447, 1448, 1449])].forEach((u) => exp.add(SITE + u));
            const sm = await get(P1, '/sitemap-hijri.xml');
            const locs = [...sm.b.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
            const set = new Set(locs);
            ok('S', sm.st === 200 && locs.length === 400 && set.size === 400 && [...exp].every((u) => set.has(u)), '/sitemap-hijri.xml: ' + locs.length + ' locs = hub + 1447..1449 (13 each) × 10 locales', 'n=' + locs.length + ' uniq=' + set.size + ' missing=' + [...exp].filter((u) => !set.has(u)).slice(0, 3));
            const leg = await get(P1, '/sitemap-main.xml', { h: { 'Accept-Encoding': 'gzip' } });
            const ll = [...leg.b.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => /\/hijri-calendar(?:\/|$)/.test(u));
            ok('S', leg.st === 200 && ll.length === 400 && new Set(ll).size === 400 && ll.every((u) => exp.has(u)), 'legacy /sitemap-main.xml: the same 400 calendar locs', 'st ' + leg.st + ' n=' + ll.length);
        }
    } catch (e) { ok('run', false, 'unexpected error (fixed-clock part)', e && e.stack || String(e)); }

    try {
        section('[R] rollover in one process: 2 workers, SSR cache on, clock crossing 2027-06-05T21:00:00Z');
        let offset = 0;
        await boot(ROOT, PR, 'rollover', () => { offset = (BOUNDARY - 150000) - Date.now(); return { WEB_CONCURRENCY: '2', TP_SSR_CACHE: '1', TP_HIJRI_RANGE_TEST_OFFSET_MS: String(offset) }; });
        const srvNow = () => Date.now() + offset;
        info('server clock after boot: ' + new Date(srvNow()).toISOString() + ' (boundary in ' + Math.round((BOUNDARY - srvNow()) / 1000) + ' s)');
        const snap = async () => {
            const o = {};
            for (const u of ['/hijri-calendar/1450', '/en/hijri-calendar/1450-01', '/hijri-calendar/1447', '/fr/hijri-calendar/1447-12']) {
                const sts = []; for (let i = 0; i < 4; i++) sts.push((await get(PR, u)).st); o[u] = sts.join('/');
            }
            const hub = await get(PR, '/hijri-calendar'); o.hubMeta = winMeta(hub.b); o.hubNav = [...hub.b.matchAll(/<(a|span) id="hyear-(prev|next)-link"([^>]*)>/g)].map((m) => m[2] + '=' + (m[1] === 'a' ? (m[3].match(/href="([^"]+)"/) || [])[1] : 'OFF')).join(' ');
            const metas = new Set(); for (let i = 0; i < 4; i++) metas.add(winMeta((await get(PR, '/', { h: { 'Accept-Encoding': 'br' } })).b)); o.homeMeta = [...metas].join('|');
            o.rel1448 = relLinks((await get(PR, '/hijri-calendar/1448')).b).join(' ');
            o.rel144912 = relLinks((await get(PR, '/hijri-calendar/1449-12')).b).join(' ');
            o.rel144801 = relLinks((await get(PR, '/hijri-calendar/1448-01')).b).join(' ');
            const sm = await get(PR, '/sitemap-hijri.xml'); o.smYears = [...new Set([...sm.b.matchAll(/hijri-calendar\/(\d{4})/g)].map((m) => m[1]))].sort().join(','); o.smN = (sm.b.match(/<loc>/g) || []).length;
            o.day = /\/hijri-calendar\/1447-05"/.test((await get(PR, '/hijri-date/1447-05-04')).b) ? 'links 1447-05' : 'no 1447-05 link';
            const f = await get(PR, '/hijri-calendar/1450', { h: { 'Accept-Encoding': 'br' } }); o.br1450 = f.st + ' ' + (f.h['content-encoding'] || 'identity') + ' ' + (f.h['cache-control'] || '');
            o.robots1450 = robotsOf((await get(PR, '/hijri-calendar/1450')).b);
            return o;
        };
        if (srvNow() > BOUNDARY - 20000) { ok('R', false, 'boot took too long: no time left before the boundary', new Date(srvNow()).toISOString()); }
        else {
            const before = await snap(); before.t = new Date(srvNow()).toISOString();
            info('before: ' + JSON.stringify(before));
            while (srvNow() < BOUNDARY + 2000) await sleep(500);
            const after = await snap(); after.t = new Date(srvNow()).toISOString();
            info('after:  ' + JSON.stringify(after));
            ok('R', before.t < '2027-06-05T21:00:00' && after.t > '2027-06-05T21:00:00', 'the same process served both sides of the boundary (' + before.t + ' → ' + after.t + ')');
            ok('R', before['/hijri-calendar/1450'] === '404/404/404/404' && after['/hijri-calendar/1450'] === '200/200/200/200' && after['/en/hijri-calendar/1450-01'] === '200/200/200/200', '1450 and 1450-01: 404 ×4 → 200 ×4 (both workers)', JSON.stringify([before['/hijri-calendar/1450'], after['/hijri-calendar/1450'], after['/en/hijri-calendar/1450-01']]));
            ok('R', before['/hijri-calendar/1447'] === '200/200/200/200' && after['/hijri-calendar/1447'] === '410/410/410/410' && after['/fr/hijri-calendar/1447-12'] === '410/410/410/410', '1447 and 1447-12: 200 ×4 → 410 ×4', JSON.stringify([before['/hijri-calendar/1447'], after['/hijri-calendar/1447'], after['/fr/hijri-calendar/1447-12']]));
            ok('R', !/noindex/.test(after.robots1450 || '') && /^200 br no-cache/.test(after.br1450), '1450 after: robots ' + after.robots1450 + ', br variant ' + after.br1450);
            ok('R', before.smYears === '1447,1448,1449' && after.smYears === '1448,1449,1450' && before.smN === 400 && after.smN === 400, 'sitemap-hijri: 1447–1449 → 1448–1450 (400 locs each)', before.smYears + ' → ' + after.smYears);
            ok('R', before.hubMeta === '1447,1449,1448' && after.hubMeta === '1448,1450,1449' && before.homeMeta === '1447,1449,1448' && after.homeMeta === '1448,1450,1449', 'window meta on the hub and on the SSR-cached homepage follows the flip (no stale cached page)', before.homeMeta + ' → ' + after.homeMeta);
            ok('R', before.hubNav === 'prev=/hijri-calendar/1447 next=/hijri-calendar/1449' && after.hubNav === 'prev=/hijri-calendar/1448 next=/hijri-calendar/1450', 'hub panel: 1447 / 1449 → 1448 / 1450', before.hubNav + ' → ' + after.hubNav);
            ok('R', before.rel1448 === 'prev=/hijri-calendar/1447 next=/hijri-calendar/1449' && after.rel1448 === 'next=/hijri-calendar/1449', '1448 rel: prev 1447 → no prev', before.rel1448 + ' → ' + after.rel1448);
            ok('R', before.rel144912 === 'prev=/hijri-calendar/1449-11' && after.rel144912 === 'prev=/hijri-calendar/1449-11 next=/hijri-calendar/1450-01', '1449-12 rel next: absent → 1450-01', before.rel144912 + ' → ' + after.rel144912);
            ok('R', before.rel144801 === 'prev=/hijri-calendar/1447-12 next=/hijri-calendar/1448-02' && after.rel144801 === 'next=/hijri-calendar/1448-02', '1448-01 rel prev: 1447-12 → absent', before.rel144801 + ' → ' + after.rel144801);
            ok('R', before.day === 'links 1447-05' && after.day === 'no 1447-05 link', 'day-410 body: links 1447-05 → no longer (the month left the window)', before.day + ' → ' + after.day);
        }
    } catch (e) { ok('run', false, 'unexpected error (rollover part)', e && e.stack || String(e)); }

    try {
        section('[C] cache bound at the rollover + the day-410 text');
        for (const [clock, want] of [['2026-10-16T12:00:00Z', 'public, max-age=3600'], ['2027-06-05T20:30:00Z', 'public, max-age=1800'], ['2027-06-05T20:59:30Z', 'no-cache']]) {
            const k0 = kids.length;
            await boot(ROOT, PT, 'cache-' + clock.slice(0, 16).replace(/[^0-9]/g, ''), { TP_HIJRI_RANGE_TEST_NOW: clock });
            const bad = [];
            for (const u of ['/hijri-calendar/1446', '/en/hijri-calendar/1446-05', '/hijri-date/1447-05-04', '/hijri-date/1446-05-04', '/fr/hijri-date/1490-06-10']) {
                const r = await get(PT, u);
                if (r.st !== 410 || (r.h['cache-control'] || '') !== want) bad.push(u + ' ' + r.st + ' ' + r.h['cache-control']);
            }
            const fut = await get(PT, '/hijri-calendar/1451');
            if ((fut.h['cache-control'] || '') !== 'no-store') bad.push('future 404 ' + fut.h['cache-control']);
            ok('C', bad.length === 0, clock + ': every cacheable 410 → ' + want + ' (seconds left to 2027-06-05T21:00Z, capped at 3600); the future 404 stays no-store', bad.join(' | '));
            try { execFileSync('taskkill', ['/PID', String(kids[k0].pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {}
            await sleep(1500);
        }
        {
            const inM = await get(P1, '/hijri-date/1447-05-04'), outM = await get(P1, '/hijri-date/1446-05-04'), outEn = await get(P1, '/en/hijri-date/1490-06-10');
            const hasConv = (b) => /href="(?:\/en)?\/date-converter"/.test(b), hasMonth = (b) => /\/hijri-calendar\/\d{4}-\d{2}"/.test(b);
            ok('C', hasMonth(inM.b) && !hasConv(inM.b) && /جدول الشهر/.test(inM.b) && !/تحويل التاريخ/.test(inM.b), 'day 410 inside the window: month link + "monthly table" text, no converter');
            ok('C', !hasMonth(outM.b) && hasConv(outM.b) && /عبر تحويل التاريخ/.test(outM.b) && !/جدول الشهر/.test(outM.b), 'day 410 outside the window: converter link + converter text, no month link or "monthly table" text');
            ok('C', !hasMonth(outEn.b) && hasConv(outEn.b) && /with the Date Converter/.test(outEn.b) && !/monthly table/.test(outEn.b), 'en day 410 outside the window: converter link + converter text');
        }

        section('[T] table edges');
        for (const [clock, label, expectIn, expectOut] of [['2077-01-15T12:00:00Z', 'current year 1500 (window 1499–1500)', ['/hijri-calendar/1499', '/hijri-calendar/1500-12'], [['/hijri-calendar/1498', 410], ['/hijri-calendar/1501', 404]]],
            ['2077-12-01T12:00:00Z', 'past the table end (no year served)', [], [['/hijri-calendar/1500', 410], ['/hijri-calendar/1499-05', 410], ['/hijri-calendar/1501', 404]]]]) {
            const port = PT;
            const k = kids.length;
            await boot(ROOT, port, 'edge-' + clock.slice(0, 4), { TP_HIJRI_RANGE_TEST_NOW: clock });
            const bad = [];
            for (const u of expectIn) { const r = await get(port, u); if (r.st !== 200) bad.push(u + ' ' + r.st); }
            for (const [u, st] of expectOut) { const r = await get(port, u); if (r.st !== st) bad.push(u + ' ' + r.st + ' (want ' + st + ')'); }
            const sm = await get(port, '/sitemap-hijri.xml');
            const ys = [...new Set([...sm.b.matchAll(/hijri-calendar\/(\d{4})/g)].map((m) => m[1]))].sort().join(',');
            const want = expectIn.length ? '1499,1500' : '';
            if (sm.st !== 200 || ys !== want || !/hijri-calendar<\/loc>/.test(sm.b)) bad.push('sitemap ' + sm.st + ' years [' + ys + ']');
            ok('T', bad.length === 0, label + ': statuses right, sitemap-hijri 200 with hub + [' + want + ']', bad.join(' | '));
            try { execFileSync('taskkill', ['/PID', String(kids[k].pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {}
            await sleep(1500);
        }
    } catch (e) { ok('run', false, 'unexpected error (table edges)', e && e.stack || String(e)); }
    finally {
        for (const k of kids) { try { execFileSync('taskkill', ['/PID', String(k.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} }
    }
    section('[N] outbound guard');
    for (const k of kids) { const log = fs.existsSync(k.guardOut) ? fs.readFileSync(k.guardOut, 'utf8').trim() : ''; ok('N', !/googlesyndication|doubleclick|google-analytics|googletagmanager|supabase/.test(log), k.tag + ' server: no ad / analytics / Supabase attempt', log.split('\n').slice(0, 3).join(' | ')); }
    console.log('\n== per section ==');
    for (const [k, v] of Object.entries(SEC)) console.log('  ' + k.padEnd(4) + ' pass ' + String(v.pass).padStart(4) + '  fail ' + String(v.fail).padStart(4));
    console.log('\n' + (fail === 0 ? 'PASS' : 'FAIL') + '  ' + pass + ' passed, ' + fail + ' failed');
    if (fails.length) { console.log('\nFailures:'); for (const f of fails.slice(0, 200)) console.log('  - ' + f); }
    try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (_) {}
    process.exit(fail === 0 ? 0 : 1);
}
main();
