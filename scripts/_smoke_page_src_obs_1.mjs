// PAGE-SOURCE-OBSERVABILITY-1 -- acceptance smoke (HTTP to 127.0.0.1 only; no production request, no download).
//
// Owner approval under test (SG-TRAFFIC-INVESTIGATION-1, 2026-10-19, + the closure round of the same day): a TEMPORARY,
//   bounded measurement of who requests the prayer / qibla / next-prayer / time-left pages (prayer-city, qibla-city,
//   next-prayer-city, time-left-city and prayer-country -- /prayer-times-in-{country}, the same URL family -- in every
//   language), logged as [page-src] lines per worker window, with its own kill switch and end date, separate from
//   [crawl-src] (moon / Hijri). Nothing may change a response. Rows -- and every network detail -- only for Singapore
//   traffic (edge-attested + cf-ipcountry SG); any other request is only counted (meta.total / meta.unattested). The
//   token column takes a fixed vocabulary only (a known browser family token, a canonical name of a fixed list, or a
//   generic label): no product name or other text from a User-Agent. IPv4 /24, IPv6 /32 on every row, the 5-request
//   threshold on the prefix AND on the row for every row; the /32 for a global unicast IPv6 address only -- any other
//   IPv6 address (outside 2000::/3, whose /32 may spell an IPv4 address in hex, or a non-global block inside it, an
//   IPv6 form that embeds an IPv4 address) or one that does not parse -> 'v6x'. End: default and hard end 2026-10-23T00:00Z, a later value clamped, an unreadable one -> the default, both
//   with one fixed WARN line per worker (never the value).
// Sections
//   [I]  response identity: 4 city families x 4 languages (ar, en, es, ms) x 2 cities + country pages + redirect / unknown /
//        query / www variants,
//        x 3 header sets (attested SG browser, attested Googlebot, bare) + HEAD + br / gzip -- status, headers (date and
//        nonces masked) and body byte-identical between the production tree (TP_BASE_ROOT, origin/main), the candidate
//        with the measurement ON (edge trust + range lookups running) and the candidate with it OFF
//        (TP_PAGE_SRC_OBS=0); a base-vs-base determinism gate first; the four servers are asked at the same moment.
//   [F]  fields, exact: a known mix inside ONE window -- SG requests of every kind (declared browser full / bare, prefix
//        shown at >= MIN_N and folded below it, IPv4 /24, IPv6 /32 on a browser row AND on a crawler row, Googlebot
//        inside / outside its list, GPTBot, Applebot (no list), python-requests, an empty User-Agent, every language
//        prefix, HEAD, a trailing slash, a www host, qibla-direction-in-, an unknown city, country pages, query strings /
//        cookies / referers / an Accept-Language carrying markers, 'pseudo', 'v6x', identifier-shaped User-Agents) +
//        requests from other countries, with no country and not edge-attested (no row, no prefix, no User-Agent cache
//        entry: meta.total / meta.unattested only) + pages of other families that must not count -> every row, its
//        status classes against what the client received, meta (total, unattested, pfx, ua_cache, tokens, pseudo)
//        against what was sent, totals against [req-family].
//   [P]  privacy: in every [page-src] line of every server and of the in-process blocks -- no full IPv4 address (only
//        a.b.c.0/24), no IPv6 prefix longer than /32, no IPv4 address in any separator form outside the prefix column,
//        no '?' anywhere, no client IP sent, no query / cookie / referer / Accept-Language marker, no raw User-Agent piece,
//        no identifier piece; every token in the fixed vocabulary; every prefix '*', 'pseudo', 'v6x', '-', /24 or the
//        /32 of a global unicast address (an h:h::/32 outside 2000::/3 or in a non-global block of it anywhere fails);
//        country 'SG' (or '-' on rest / overflow rows); every line <= 8 KB and <= 60 rows; the column legend exact.
//        NO NEW FIELD: the line head, the 19 columns and the meta keys are exactly those of d78723c + meta.pseudo.
//        In-process: the token of 40 User-Agents (identifier shapes -> their class label, real products -> their
//        canonical name, known browsers -> their family token, a major beyond 199 -> 'x'); the canonical list itself.
//   [R]  the residual cases of the pre-merge report (3.6) and the owner's closure list, over HTTP and in-process, each
//        sent 6 times from one SG prefix (so the previous rules would have printed it), and again from another country
//        and without edge attestation: UUID, e-mail with '@', with '%40' and with '@' past character 256, a user name
//        without digits (zelda.quorn/1.0), phone numbers, long hex and short digit-less hex (deadbeef), MAC forms
//        (de-ad-be-ef-ca-fe), short / full IPv4 and compressed IPv6 as the product name, a very long User-Agent; client
//        addresses 6to4, Teredo, NAT64 (two forms), IPv4-mapped (three forms), IPv4-compatible (two forms), a declared
//        crawler / tool over IPv6 (must be /32), 240.0.0.0/4 and cf-connecting-ipv6, and non-global IPv6 (808:808::
//        = 8.8.8.8 and other IPv4-in-hex forms, ::1 in full, 100::, fec0::, ff02::, 4000::, 2001:2::, 2001:db8::,
//        3fff::/20 -> 'v6x'; fc00::/7, fe80::/10, ::1 -> not taken as the client: no row) -> the scan of [P] plus every
//        original text and address of these cases over every line: nothing found; the expected rows exact; no row and
//        no prefix from the non-SG and unattested copies. Negative control: the same in-process cases through the
//        previous commit's block (d762b2b) -- the scan must find leaks there; and the non-global IPv6 cases through
//        a7935c9's block (before the non-global fold) -- the scan must find their /32s there.
//   [B]  bounded: (1) a synthetic burst of 50,000 HTTP requests (90 % SG; 50,000 distinct /24s, varied browser majors /
//        OS and bots; mostly the cheap trailing-slash 301 of each family) -> every window within its caps (keys,
//        prefixes, User-Agent cache, tokens, emitted rows), the cap paths taken, n preserved (sum of n = SG requests
//        answered, sum of meta.total = all family requests answered); the [proc] heap of a measurement-OFF server hit by
//        the same burst is reported next to it, not asserted;
//        (2) in-process (the block extracted from server.js, --expose-gc child): 50,000 records with every cap reached ->
//        the window state held at the cap, the transient peak during the batch, and what stays after the flush.
//   [K]  switches and end: TP_PAGE_SRC_OBS=0 and TP_MOON_LOAD_OBS=0 -> no [page-src] line at all ([crawl-src] /
//        [moon-load] unaffected); TP_PAGE_SRC_OBS_UNTIL in the past -> one EXPIRED line, no rows; an end reached mid-run ->
//        rows only for what came before it + one EXPIRED line; a later end -> clamped to 2026-10-23 + one WARN line without
//        the value; [crawl-src] expired -> [page-src] still runs and loads the range snapshot itself; no edge trust ->
//        meta only (unattested), no rows.
//   [W]  two workers, TP_PAGE_SRC_OBS_UNTIL unreadable: one WARN line per worker (never the value), the default end, and
//        per-worker rows sum to what was sent.
//   [U]  in-process: the UTC hour split inside one window (+ hr_late), the end-date parsing / clamp / warn, the
//        edge-attestation matrix, the TP_PAGE_SRC_MIN_N floor, the IPv6 /32 cut on every row and the row threshold on
//        every row, 'pseudo'; a User-Agent longer than 512 characters is cached like any other.
//   [M]  moon measurement not widened: the candidate server.js is the production server.js plus inserted lines only (no
//        line changed or removed), every inserted line is the page-src block or its three hooks, [crawl-src] families
//        and default end unchanged, and no [crawl-src] row of the [F] server names a measured family.
//   [X]  server.js stays CRLF in the working tree (one CR per line) and passes node --check.
//   [Z]  the offline analyser (scripts/_analyze_page_src_obs_1.mjs) over the [F] + [B] lines with a Render-style prefix.
//   [N]  outbound guard: no connection, DNS or fetch attempt left the machine.
// Usage: node scripts/_smoke_page_src_obs_1.mjs   (env TP_BASE_ROOT = the production checkout, TP_GUARD = the guard,
//        TP_PREV_SERVER = the previous commit's server.js for the [R] negative control, TP_PREV2_SERVER = a7935c9's
//        server.js for the non-global IPv6 negative control, TP_SMOKE_PORT_BASE = the first of 15 consecutive local
//        ports (default 9860), TP_SMOKE_SKIP=I,B to skip sections)
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import zlib from 'node:zlib';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_ROOT = process.env.TP_BASE_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-pagesrc-base';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const PREV_SERVER = process.env.TP_PREV_SERVER || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/pagesrc/closure/server-d762b2b.js';
const PREV2_SERVER = process.env.TP_PREV2_SERVER || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/pagesrc/final/server-a7935c9.js';
const SKIP = new Set(String(process.env.TP_SMOKE_SKIP || '').split(',').filter(Boolean));
const SITE = 'https://timesprayers.com';
const PB = Number(process.env.TP_SMOKE_PORT_BASE || 9860);   // 15 consecutive local ports from PB
const PORT = { base: PB, base2: PB + 1, on: PB + 2, off: PB + 3, counts: PB + 4, two: PB + 5, burst: PB + 6, burstoff: PB + 7, expired: PB + 8, expiring: PB + 9,
    mloff: PB + 10, csexp: PB + 11, clamp: PB + 12, noedge: PB + 13, resid: PB + 14 };
const EDGE = { TP_CRAWL_SOURCE_EDGE_TEST: '1' };
const RAY = '8c0d3f2a1b4e5f67-SIN';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-pagesrc-'));
const CHILD = process.argv[2] === '--mem-child';
let pass = 0, fail = 0; const fails = []; const SEC = {};
function ok(label, cond, name, detail) {
    const s = SEC[label] || (SEC[label] = { pass: 0, fail: 0 });
    const n = '[' + label + '] ' + name;
    if (cond) { pass++; s.pass++; console.log('  PASS ' + n); }
    else { fail++; s.fail++; fails.push(n + (detail ? ' :: ' + detail : '')); console.log('  FAIL ' + n + (detail ? '  :: ' + String(detail).slice(0, 700) : '')); }
}
const info = (s) => console.log('  . INFO ' + s);
const section = (s) => console.log('\n-- ' + s + ' --');

// ---- the synthetic range snapshot (written here, passed by TP_CRAWL_RANGES_FILE; never downloaded) ----
const FIXTURE = path.join(TMP, 'crawler-ip-ranges.fixture.json');
const FIX_OPS = { 'google-common': ['66.249.64.0/19', '2001:4860:4801:10::/64'], 'google-special': ['108.177.2.0/24'], bing: ['157.55.39.0/24'],
    'openai-gptbot': ['20.171.206.0/24'], 'openai-searchbot': ['20.42.10.176/28'] };
fs.writeFileSync(FIXTURE, JSON.stringify({ date: '2026-10-10',
    lists: Object.fromEntries(Object.keys(FIX_OPS).map((k) => [k, { sources: ['https://example.invalid/' + k + '.json'], creationTime: ['2026-10-10T00:00:00.000000'] }])),
    operators: FIX_OPS }));

// ---- user agents ----
const UA = {
    chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
    gbot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    gpt: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)',
    apple: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)',
    py: 'python-requests/2.31.0',
    safari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
};
const CH = 'browser:chrome-141:windows', SF = 'browser:safari-17:ios';
// raw User-Agent pieces that must never appear in a line (the token is a fixed value, never User-Agent text)
const UA_BITS = ['Windows NT', 'Win64', 'AppleWebKit', 'Mozilla', 'KHTML', 'Googlebot/2.1', 'GPTBot/1.2', 'Applebot/0.1', 'requests/2.31', 'iPhone OS', '+http', 'openai.com', 'Chrome/141.0.0.0'];
// identifier-shaped User-Agents for the [F] mix over HTTP: [User-Agent, client IP, expected declared / token / bcls]
const ID_UAS_HTTP = [
    ['3f2504e0-4f89-11d3-9a0c-0305e82c3301', '93.1.1.1', { declared: 'unknown', token: 'unknown', bcls: '-' }],
    ['PrayerWidget_8f3a9c2d7e', '93.1.2.1', { declared: 'unknown', token: 'unknown', bcls: '-' }],
    [UA.chrome + ' uid-a91f03c7e2/1.0', '93.1.3.1', { declared: 'browser', token: CH, bcls: 'bare' }],
    ['tester.yuri.vantop@example.com', '93.1.4.1', { declared: 'unknown', token: 'unknown', bcls: '-' }],
    ['SomeTool/1.0', '93.1.5.1', { declared: 'unknown', token: 'unknown', bcls: '-' }],
    ['Mozilla/5.0 (X11) user-yuri/1.0', '93.1.6.1', { declared: 'browser', token: 'browser:other-x:other', bcls: 'bare' }],
];
// pieces of those (and of the in-process) User-Agents that must never appear in a line
const ID_BITS = ['3f2504e0', '0305e82c3301', '8f3a9c2d7e', 'prayerwidget', 'PrayerWidget', 'a91f03c7e2', 'uid-', 'tester', 'yuri', 'vantop', 'example.com', 'sometool', 'SomeTool',
    '7731902', 'acct', 'session-abc', 'deadbeef', 'x7k9q2m4', '9f8e7d6c5b', 'tracker', 'ab12cd34ef56', 'fban', '0501234567', '966-50', 'myapp', 'mybot', 'feedreader',
    'jqx', 'rvq', 'zelda', 'quorn', 'antop', 'corp', 'example.net', 'contact', '8.8.8.8', '1.2.3.4', '1-2-3-4'];
// the [page-src] line format of d78723c (the reviewed commit): the only addition allowed is meta.pseudo
const HEAD_KEYS = 'v,t,w,boot,seq,ts,win,s,until,ranges,part,meta,cols,rows';
const META_KEYS = 'total,keys,folded,compact,ovf,pfx,pfx_full,min_n,ua_cache,ua_ovf,tokens,ranges_state,edge_trust,unattested,hr_late,pseudo';
const CLIENT_IPS = new Set();
const INPROC = [];   // every line of the in-process blocks of the CANDIDATE (scanned by [P])
const MARKERS = ['MARKERQ1', 'MARKERQ2', 'MARKERCK1', 'MARKERREF', 'MARKERAL', 'a@b.co'];

// ---- servers ----
const kids = [];
const rawGet = (port, p, { method = 'GET', h = {}, timeout = 120000, agent = false } = {}) => new Promise((res) => {
    const r = http.request({ host: '127.0.0.1', port, path: p, method, headers: h, agent }, (x) => {
        const c = []; x.on('data', (d) => c.push(d)); x.on('end', () => res({ st: x.statusCode, h: x.headers, raw: Buffer.concat(c) }));
    });
    r.setTimeout(timeout, () => r.destroy(new Error('timeout')));
    r.on('error', (e) => res({ st: 0, h: {}, raw: Buffer.alloc(0), err: (e && (e.code || e.message)) || 'error' })); r.end();
});
async function boot(root, port, tag, extra = {}, workers = 1) {
    if ((await rawGet(port, '/health', { timeout: 2000 })).st !== 0) throw new Error('port ' + port + ' already in use');
    const guardOut = path.join(TMP, 'guard-' + tag + '.log'); fs.writeFileSync(guardOut, '');
    const env = { ...process.env };
    for (const k of Object.keys(env)) if (/^(TP_|NODE_OPTIONS$|GA_MEASUREMENT_ID$|SUPABASE_|LOCATIONIQ_KEY$|DISCOVERED_SSR_TEST_FIXTURE$|RENDER$|RENDER_)/.test(k)) delete env[k];
    Object.assign(env, { PORT: String(port), WEB_CONCURRENCY: String(workers), ADSENSE_CLIENT: 'off', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '',
        TP_MOON_DAY_SHED: '0', TP_MOON_LOAD_OBS_WINDOW_S: '20', TP_SSR_CACHE: '1', TP_REQUEST_OBSERVABILITY: '1', NODE_ENV: 'production',
        SITE_URL: SITE, GUARD_OUT: guardOut, TP_CRAWL_RANGES_FILE: FIXTURE }, extra);
    const k = spawn(process.execPath, ['-r', GUARD, 'server.js'], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
    const srv = { tag, port, root, k, guardOut, lines: [], buf: '' };
    const take = (d) => { srv.buf += d.toString('utf8'); let i; while ((i = srv.buf.indexOf('\n')) !== -1) { srv.lines.push(srv.buf.slice(0, i).replace(/\r$/, '')); srv.buf = srv.buf.slice(i + 1); } };
    k.stdout.on('data', take); k.stderr.on('data', take);
    kids.push(srv);
    for (let i = 0; i < 400; i++) { if ((await rawGet(port, '/health', { timeout: 3000 })).st === 200) break; await sleep(400); if (i === 399) throw new Error('boot failed ' + tag); }
    for (let i = 0; i < 100; i++) { if (srv.lines.filter((l) => /^\[moon-load\] worker=\d+ ENABLED/.test(l)).length >= workers || extra.TP_MOON_LOAD_OBS === '0') break; await sleep(200); }
    return srv;
}
const killSrv = (srv) => { try { execFileSync('taskkill', ['/PID', String(srv.k.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} };
const psLines = (srv, from = 0) => srv.lines.slice(from).filter((l) => l.startsWith('[page-src] {'));
const psJson = (srv, from = 0) => psLines(srv, from).map((l) => JSON.parse(l.slice(11)));
const anyPs = (srv) => srv.lines.filter((l) => l.startsWith('[page-src]'));
// wait until `n` new window flushes ([moon-load] part-0 lines, one per worker per window) appeared after index `from`
async function flushes(srv, from, n, timeoutMs = 60000) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
        // + a short pause: the [req-family] / [crawl-src] / [page-src] lines of the same flush follow the [moon-load] one
        if (srv.lines.slice(from).filter((l) => l.startsWith('[moon-load] {') && /"part":0/.test(l)).length >= n) { await sleep(500); return true; }
        await sleep(100);
    }
    return false;
}
// the windows of a server's [page-src] objects: a part-0 line opens one (per worker)
function windows(objs) {
    const out = [], cur = {};
    for (const o of objs) {
        if (o.part === 0) { cur[o.w] = { w: o.w, meta: o.meta, seq: o.seq, rows: [], lines: [] }; out.push(cur[o.w]); }
        const W = cur[o.w]; if (!W) continue;
        W.rows.push(...o.rows); W.lines.push(o);
    }
    return out;
}
const COLS = 'hour,family,lang,declared,token,ver,bcls,country,prefix,n,2xx,3xx,4xx,5xx,abort,head,avg_ms,max_ms,pfx';
const C = {}; COLS.split(',').forEach((c, i) => { C[c] = i; });
const IP4_ANY = /(?:^|[^0-9])\d{1,3}(?:[._-]\d{1,3}){3}(?![0-9])/;   // an IPv4 address with '.', '_' or '-' separators
const rkey = (r) => r.slice(1, 9).join('|');   // family .. prefix (the hour apart)
const sumN = (rows) => rows.reduce((s, r) => s + r[C.n], 0);
const stClass = (st) => st >= 500 ? '5xx' : st >= 400 ? '4xx' : st >= 300 ? '3xx' : st >= 200 ? '2xx' : 'abort';

// a global unicast /32 (the only IPv6 prefix printed): inside 2000::/3 and outside its non-global blocks 2001::/23,
//   2001:db8::/32, 2002::/16 and 3fff::/20 -- test side, written on the group values, apart from the block's bit tests
const glob6 = (a, b) => a >= 0x2000 && a <= 0x3fff && !(a === 0x2001 && b <= 0x01ff) && !(a === 0x2001 && b === 0x0db8) && a !== 0x2002 && !(a === 0x3fff && b <= 0x0fff);
// ---- the client address -> the prefix key the block registers (a.b.c / h:h), or null ('pseudo', 'v6x') -- test side ----
function expand6(s) {
    if (typeof s !== 'string' || s.indexOf(':') === -1) return null;
    const m = /(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(s);
    if (m) s = s.slice(0, -m[0].length) + ((+m[1] << 8) | +m[2]).toString(16) + ':' + ((+m[3] << 8) | +m[4]).toString(16);
    const parts = s.split('::');
    if (parts.length > 2) return null;
    const A = parts[0] ? parts[0].split(':') : [], B = parts.length === 2 ? (parts[1] ? parts[1].split(':') : []) : null;
    const g = B === null ? A : [...A, ...Array(Math.max(0, 8 - A.length - B.length)).fill('0'), ...B];
    if (g.length !== 8 || g.some((x) => !/^[0-9a-f]{1,4}$/i.test(x))) return null;
    return g.map((x) => parseInt(x, 16));
}
function pkOf(ip, h = {}) {
    if (h['cf-connecting-ipv6'] !== undefined) return null;
    let t = String(ip);
    if (/^::ffff:/i.test(t)) t = t.slice(7);   // as the server's own _normIpText does
    const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(t);
    if (v4) return +v4[1] >= 240 ? null : v4.slice(1, 4).join('.');
    const g = expand6(t);
    if (!g) return null;
    if (g.slice(0, 5).every((x) => x === 0) && g[5] === 0xffff) return (g[6] >> 8) >= 240 ? null : [g[6] >> 8, g[6] & 255, g[7] >> 8].join('.');
    if (!glob6(g[0], g[1])) return null;
    return g[0].toString(16) + ':' + g[1].toString(16);
}

// ---- the scan of a printed line (owner closure round): every problem it finds ----
const ISO_TS = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?Z?/g;
const VOCAB_FIXED = new Set(['-', 'rest', 'overflow', 'empty', 'unknown', 'other-bot', 'known-seo-crawler', 'known-social-bot']);
const BROWSER_TOK = /^browser:(edge|opera|samsung|yandex|uc|firefox|chrome|safari|other)-(x|[1-9]\d{0,2}):(windows|android|ios|mac|cros|linux|other)$/;
let CANON_NAMES = null;   // the canonical names of the candidate block (_PS_CANON), filled by the first loadBlock
const tokOk = (t) => VOCAB_FIXED.has(t) || (CANON_NAMES !== null && CANON_NAMES.has(t))
    || (BROWSER_TOK.test(t) && (BROWSER_TOK.exec(t)[2] === 'x' || +BROWSER_TOK.exec(t)[2] <= 199));
const H32 = /^([0-9a-f]{1,4}):([0-9a-f]{1,4})::\/32$/i;
const GLOB32 = (pf) => { const m = H32.exec(pf); return m !== null && glob6(parseInt(m[1], 16), parseInt(m[2], 16)); };
const PREFIX_OK = (pf) => pf === '*' || pf === 'pseudo' || pf === 'v6x' || pf === '-' || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.0\/24$/.test(pf) || GLOB32(pf);
function scanLine(l, bits) {
    const bad = [];
    const low = l.toLowerCase();
    for (const b of bits) if (low.indexOf(String(b).toLowerCase()) !== -1) bad.push('text "' + b + '"');
    const s = l.replace(ISO_TS, 'T');
    // any full IPv4 shape: a.b.c.d other than a.b.c.0/24
    for (const m of s.matchAll(/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(\/\d{1,3})?/g)) if (m[4] !== '0' || m[5] !== '/24') bad.push('IPv4 ' + m[0]);
    // any IPv6 shape (2+ colons between hex groups) other than the h:h::/32 prefix of a global unicast address (the /32
    //   of any other address -- outside 2000::/3 or in a non-global block of it -- may spell an IPv4 address)
    for (const m of s.matchAll(/[0-9a-f]{0,4}(?::[0-9a-f]{0,4}){2,7}(?:\/\d{1,3})?/gi)) if (!GLOB32(m[0])) bad.push((H32.test(m[0]) ? 'IPv6 non-global /32 ' : 'IPv6 ') + m[0]);
    if (l.indexOf('?') !== -1) bad.push('"?"');
    if (l.startsWith('[page-src] {')) {
        let o = null;
        try { o = JSON.parse(l.slice(11)); } catch (_) { bad.push('unparsable line'); }
        if (o) for (const r of o.rows) {
            if (!PREFIX_OK(String(r[C.prefix]))) bad.push('prefix ' + r[C.prefix]);
            if (!tokOk(String(r[C.token]))) bad.push('token ' + r[C.token]);
            if (!(r[C.country] === 'SG' || r[C.country] === '-')) bad.push('country ' + r[C.country]);
            for (let ci = 0; ci < r.length; ci++) if (ci !== C.prefix && typeof r[ci] === 'string' && IP4_ANY.test(r[ci])) bad.push('IPv4-shaped column ' + ci + ': ' + r[ci]);
        }
    }
    return bad;
}

// ---- the block, extracted from server.js with what it calls, for the in-process checks ----
function loadBlock(env = {}, file = path.join(ROOT, 'server.js'), sink = INPROC) {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    const fnAt = (name) => { const i = lines.findIndex((l) => l.startsWith('function ' + name + '(')); if (i === -1) throw new Error('no function ' + name); let j = i; while (lines[j] !== '}') j++; return lines.slice(i, j + 1).join('\n'); };
    const constAt = (name) => {
        const i = lines.findIndex((l) => l.startsWith('const ' + name + ' '));
        if (i === -1) throw new Error('no const ' + name);
        let j = i, depth = 0;
        for (;;) { for (const ch of lines[j]) { if ('([{'.includes(ch)) depth++; else if (')]}'.includes(ch)) depth--; } if (depth <= 0 && /;\s*(\/\/.*)?$/.test(lines[j])) break; j++; }
        return lines.slice(i, j + 1).join('\n');
    };
    const b0 = lines.findIndex((l) => l.startsWith('// CRAWL-SOURCE-OBSERVABILITY-1 (owner directive'));
    const b1 = lines.findIndex((l, i) => i > b0 && l.startsWith('// MOON-DAY-PAGES-REMOVAL-1 (2026-10-13)'));
    if (b0 === -1 || b1 === -1) throw new Error('block markers not found');
    const code = [constAt('_TP_TRUSTED_PROXY'), constAt('_RE_IPV4_TEXT'), fnAt('_normIpText'), fnAt('_isNonPublicIpText'), fnAt('getClientIp'),
        constAt('_OBS_NAMED_BOTS'), fnAt('_obsAgent'), constAt('_shedEnvInt'), constAt('_ML_AGENT_CLASS'), constAt('_ML_EDGES'), constAt('_ML_BUCKET_COLS'),
        lines.slice(b0, b1 - 1).join('\n')].join('\n');
    const logs = [];
    const saved = {}; for (const [k, v] of Object.entries(env)) { saved[k] = process.env[k]; if (v === undefined) delete process.env[k]; else process.env[k] = v; }
    try {
        // eslint-disable-next-line no-new-func
        const api = new Function('require', 'process', 'console', 'fs', 'path', 'zlib', 'ROOT', 'performance', '_ML_ON', '_ML_WINDOW_S', 'TP_WORKER_ID', '_OBS_WTAG',
            code + '\nreturn { _psRecord, _psFlush, _psStart, _obsAgent, _psSrc, _psUa, _psPfx, _psTok, PS_UNTIL: _PS_UNTIL, PS_ON: _PS_ON, MIN_N: _PS_MIN_N, edgeTrust: _CS_EDGE_TRUST,'
            + ' _psToken: typeof _psToken === "function" ? _psToken : null, CANON: typeof _PS_CANON !== "undefined" ? _PS_CANON : null };')(
            createRequire(import.meta.url), process, { log: (s) => { logs.push(String(s)); if (sink) sink.push(String(s)); } }, fs, path, zlib, ROOT, performance, true, 300, 1, ' worker=1');
        api.logs = logs;
        if (CANON_NAMES === null && api.CANON && file === path.join(ROOT, 'server.js')) CANON_NAMES = new Set(api.CANON.map((x) => x[1]));
        api.start = () => { const prev = process.env.TP_CRAWL_RANGES_FILE; process.env.TP_CRAWL_RANGES_FILE = env.TP_CRAWL_RANGES_FILE || FIXTURE;
            try { api._psStart(); } finally { if (prev === undefined) delete process.env.TP_CRAWL_RANGES_FILE; else process.env.TP_CRAWL_RANGES_FILE = prev; } };
        api.rows = () => { const o = logs.filter((l) => l.startsWith('[page-src] {')).map((l) => JSON.parse(l.slice(11))); return windows(o); };
        return api;
    } finally { for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; } }
}
const FAM_URL = { 'prayer-city': '/prayer-times-in-', 'qibla-city': '/qibla-in-', 'next-prayer-city': '/next-prayer-in-', 'time-left-city': '/time-left-until-next-prayer-in-' };
// the measured families: the four city families + prayer-country (/prayer-times-in-{country}, the same URL family)
const FAMILIES = new Set([...Object.keys(FAM_URL), 'prayer-country']);
// a varied browser User-Agent (family major 1..199 x 5 OS: enough distinct tokens to reach the 300 cap)
const OSES = ['Windows NT 10.0; Win64; x64', 'Linux; Android 10; K', 'X11; Linux x86_64', 'Macintosh; Intel Mac OS X 10_15_7', 'X11; CrOS x86_64 14541.0.0'];
const vbrowser = (k) => 'Mozilla/5.0 (' + OSES[k % 5] + ') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + (1 + (k * 7) % 199) + '.0.' + (k % 3000) + '.1 Safari/537.36';

// a client IPv4 the server takes as the client (public): a private / loopback / link-local / CGNAT one falls back to the
//   socket address, so such a request is not edge-attested (meta.unattested, no row)
const isPublic4 = (ip) => { const p = String(ip).split('.').map(Number); return !(p[0] === 0 || p[0] === 10 || p[0] === 127 || (p[0] === 172 && p[1] >= 16 && p[1] <= 31)
    || (p[0] === 192 && p[1] === 168) || (p[0] === 169 && p[1] === 254) || (p[0] === 100 && p[1] >= 64 && p[1] <= 127)); };
// ---- [B2] the in-process memory child: 50,000 records with every cap reached ----
function memChild() {
    const mem = () => { const m = process.memoryUsage(); return m.heapUsed + m.arrayBuffers; };
    const heap = () => { global.gc(); global.gc(); global.gc(); return mem(); };
    const api = loadBlock({ ...EDGE, TP_TRUSTED_PROXY: undefined, RENDER: undefined });
    api.start();
    const fams = ['prayer-city', 'qibla-city', 'next-prayer-city', 'time-left-city', 'prayer-country'];
    const urlOf = { ...FAM_URL, 'prayer-country': '/prayer-times-in-' };
    const langs = ['', '/en', '/fr', '/tr', '/ur', '/de', '/id', '/es', '/bn', '/ms'];
    const word = (n) => { let s = ''; do { s = String.fromCharCode(103 + n % 20) + s; n = Math.floor(n / 20); } while (n); return s; };
    let sg = 0, unatt = 0;
    const mk = (i) => ({ method: i % 10 === 0 ? 'HEAD' : 'GET', socket: {}, headers: { host: 'x',
        'user-agent': i % 4 === 1 ? ('Mozilla/5.0 (compatible; W' + word(i) + 'zbot/1.0; +https://example.net/' + 'q'.repeat(300)).slice(0, 256) : vbrowser(i),
        'cf-connecting-ip': (11 + (i % 200)) + '.' + (((i / 200) | 0) % 250) + '.' + ((i * 7) % 250) + '.9', 'cf-ray': RAY,
        'cf-ipcountry': i % 10 === 3 ? String.fromCharCode(65 + i % 26, 66 + (i >> 5) % 24) : 'SG', accept: 'text/html' } });
    const rec = (i) => { const f = fams[i % 5]; const pa = langs[(i >> 1) % 10] + urlOf[f] + 'city' + i + '-' + 'z'.repeat(60); const r = mk(i); const pub = isPublic4(r.headers['cf-connecting-ip']); if (!pub) unatt++; else if (r.headers['cf-ipcountry'] === 'SG') sg++; api._psRecord(r, i % 5, pa, ['2xx', '3xx', '4xx', '5xx', 'abort'][(i >> 2) % 5], i % 300); };
    for (let i = 0; i < 2000; i++) rec(i);
    api._psFlush('w'); api.logs.length = 0; sg = 0; unatt = 0;
    const h0 = heap();
    let peak = 0;
    for (let i = 0; i < 50000; i++) { rec(100000 + i); if (i % 250 === 0) peak = Math.max(peak, mem()); }
    peak = Math.max(peak, mem());
    const h1 = heap();
    const tables = { keys: api._psSrc.size, ua_cache: api._psUa.size, prefixes: api._psPfx.size, tokens: api._psTok.size };
    api._psFlush('w');
    const peakFlush = mem();
    const w = api.rows()[0];
    api.logs.length = 0;
    const h2 = heap();
    return { held_at_cap_kb: Math.round((h1 - h0) / 1024), transient_peak_kb: Math.round((Math.max(peak, peakFlush) - h0) / 1024), after_flush_kb: Math.round((h2 - h0) / 1024),
        tables, meta: w && w.meta, rows: w ? w.rows.length : 0, n: w ? sumN(w.rows) : 0, sg, unatt };
}
if (CHILD) { const r = memChild(); try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (_) {} console.log(JSON.stringify(r)); process.exit(0); }

// ---- [I] response identity ----
const ID_URLS = [];
for (const lang of ['', '/en', '/es', '/ms']) for (const f of Object.keys(FAM_URL)) for (const city of ['makkah', 'cairo']) ID_URLS.push(lang + FAM_URL[f] + city);
ID_URLS.push('/es/prayer-times-in-australia', '/ms/prayer-times-in-malaysia', '/en/prayer-times-in-egypt', '/es/prayer-times-in-makkah/', '/ms/qibla-direction-in-makkah', '/qibla-in-zzqx-nocity', '/es/next-prayer-in-zzqx-nocity', '/time-left-until-next-prayer-in-zzqx-nocity',
    '/ms/prayer-times-in-makkah?utm_source=x', '/prayer-times-in-saudi-arabia', '/', '/es', '/qibla', '/moon/saudi-arabia/riyadh/2026/10', '/moon/saudi-arabia/riyadh/2026/10/13',
    '/health', '/robots.txt', '/no-such-page-qa');
const ID_HEADERS = [
    ['sg-browser', { 'user-agent': UA.chrome, ...FULL_H(), 'accept-encoding': 'identity', 'cf-connecting-ip': '203.0.113.21', 'cf-ipcountry': 'SG', 'cf-ray': RAY, referer: 'https://www.google.com/' }],
    ['googlebot', { 'user-agent': UA.gbot, 'accept-encoding': 'identity', 'cf-connecting-ip': '66.249.66.200', 'cf-ipcountry': 'US', 'cf-ray': RAY }],
    ['bare', { 'accept-encoding': 'identity' }],
];
function FULL_H() { return { 'sec-fetch-mode': 'navigate', 'sec-fetch-dest': 'document', 'accept-language': 'en-US,en;q=0.9', accept: 'text/html,application/xhtml+xml', 'sec-ch-ua': '"Chromium";v="141"' }; }
const FULL = FULL_H();
const maskBody = (b) => b.replace(/nonce="[^"]*"/g, 'nonce="N"').replace(/'nonce-[^']*'/g, "'nonce-N'")
    .replace(/(article:modified_time" content=")[^"]*/g, '$1T').replace(/("date(?:Modified|Published)":\s*")[^"]*/g, '$1T')
    .replace(/(id="current-time">)\d{1,2}:\d{2}(?::\d{2})?/g, '$1CLOCK').replace(/(id="next-prayer-countdown">)[\d:]+/g, '$1COUNTDOWN')
    .replace(/(\b(?:app|i18n)\.js\?v=\d+)&b=[0-9a-f]+/g, '$1&b=SHA').replace(/^(\{"status":"ok","ts":)\d+\}$/, '$1TS}');
const maskHead = (h) => { const o = {}; for (const k of Object.keys(h).sort()) { if (k === 'date') continue; o[k] = String(h[k]).replace(/'nonce-[^']*'/g, "'nonce-N'"); } return JSON.stringify(o); };
const decode = (r) => { try { const e = r.h['content-encoding']; return e === 'br' ? zlib.brotliDecompressSync(r.raw) : e === 'gzip' ? zlib.gunzipSync(r.raw) : r.raw; } catch (_) { return r.raw; } };
const view = (r) => ({ st: r.st ? r.st : 'ERR:' + r.err, head: maskHead(r.h), body: maskBody(decode(r).toString('latin1')) });

async function sectionI(S) {
    section('[I] response identity: production tree vs candidate ON vs candidate OFF');
    [S.base, S.base2, S.on, S.off] = await Promise.all([
        boot(BASE_ROOT, PORT.base, 'base', EDGE), boot(BASE_ROOT, PORT.base2, 'base2', EDGE),
        boot(ROOT, PORT.on, 'on', EDGE), boot(ROOT, PORT.off, 'off', { ...EDGE, TP_PAGE_SRC_OBS: '0' })]);
    for (const [, h] of ID_HEADERS) if (h['cf-connecting-ip']) CLIENT_IPS.add(h['cf-connecting-ip']);
    const combos = [];
    for (const u of ID_URLS) for (const [hn, h] of ID_HEADERS) combos.push([u, hn, h, 'GET']);
    for (const u of ['/es/prayer-times-in-makkah', '/ms/qibla-in-makkah', '/next-prayer-in-cairo', '/en/time-left-until-next-prayer-in-cairo', '/es/prayer-times-in-makkah/'])
        combos.push([u, 'googlebot-head', ID_HEADERS[1][1], 'HEAD']);
    for (const u of ['/es/prayer-times-in-makkah', '/ms/next-prayer-in-makkah', '/qibla-in-cairo', '/time-left-until-next-prayer-in-makkah'])
        for (const enc of ['br', 'gzip']) combos.push([u, 'sg-browser-' + enc, { ...ID_HEADERS[0][1], 'accept-encoding': enc }, 'GET']);
    const same = (x, y) => x.st === y.st && x.head === y.head && x.body === y.body;
    const why = (x, y) => x.st !== y.st ? 'status ' + x.st + '/' + y.st : x.head !== y.head ? 'headers ' + x.head.slice(0, 300) + ' vs ' + y.head.slice(0, 300) : 'body differs (len ' + x.body.length + '/' + y.body.length + ')';
    let n = 0, retriedGate = 0, transport = 0;
    const gateBad = [], onBad = [], offBad = [], statuses = {};
    for (const [u, hn, h0, method] of combos) {
        const h = { ...h0, host: '127.0.0.1:8700' };
        let a, a2, c, k;
        // the four servers are asked at the same moment; a determinism-gate miss (a minute rolling over on a clock-bearing
        //   page) is asked again up to 3 times; a transport error (no response at all) too
        for (let t = 0; t < 4; t++) {
            const rs = await Promise.all([PORT.base, PORT.base2, PORT.on, PORT.off].map((p) => rawGet(p, u, { method, h })));
            if (rs.some((r) => r.st === 0)) { transport++; await sleep(200); continue; }
            [a, a2, c, k] = rs.map(view);
            if (same(a, a2)) break;
            retriedGate++;
        }
        n++;
        if (!a) { gateBad.push(method + ' ' + u + ' [' + hn + '] no response'); continue; }
        statuses[a.st] = (statuses[a.st] || 0) + 1;
        if (!same(a, a2)) { gateBad.push(method + ' ' + u + ' [' + hn + '] ' + why(a, a2)); continue; }
        if (!same(a, c)) onBad.push(method + ' ' + u + ' [' + hn + '] ' + why(a, c));
        if (!same(a, k)) offBad.push(method + ' ' + u + ' [' + hn + '] ' + why(a, k));
    }
    info('identity: ' + n + ' requests per server, statuses ' + JSON.stringify(statuses) + ', gate re-asks ' + retriedGate + ', transport retries ' + transport);
    ok('I', gateBad.length === 0, 'determinism gate: production tree vs itself identical after masking (' + n + ' requests)', gateBad.slice(0, 4).join(' | '));
    ok('I', onBad.length === 0, 'measurement ON == production: status + headers + body for ' + (n - gateBad.length) + ' requests (' + ID_URLS.length + ' URLs x 3 header sets, 5 HEAD, 8 br/gzip)', onBad.slice(0, 4).join(' | '));
    ok('I', offBad.length === 0, 'measurement OFF (TP_PAGE_SRC_OBS=0) == production for the same requests', offBad.slice(0, 4).join(' | '));
    ok('I', (statuses[200] || 0) > 0 && (statuses[301] || 0) > 0 && (statuses[404] || 0) > 0, 'the identity set covers 200, 301 and 404 answers', JSON.stringify(statuses));
    await flushes(S.on, 0, 1);
    const en = S.on.lines.filter((l) => /^\[page-src\] worker=\d+ ENABLED/.test(l));
    ok('I', en.length === 1 && / families=prayer-city,qibla-city,next-prayer-city,time-left-city,prayer-country /.test(en[0]) && / until=2026-10-23 /.test(en[0])
        && / min_n=5 /.test(en[0]) && / max_keys=1500 /.test(en[0]) && / ranges=2026-10-10 /.test(en[0]) && / edge_trust=1 /.test(en[0])
        && !S.on.lines.some((l) => /^\[page-src\] worker=\d+ WARN/.test(l)),
        'ON: one ENABLED line -- families, until=2026-10-23 (default, no WARN), min_n=5, max_keys=1500, ranges, edge_trust=1', en.join(' | '));
    const onW = windows(psJson(S.on));
    ok('I', onW.length > 0 && onW.some((w) => w.rows.length > 0) && onW.every((w) => w.rows.every((r) => r[C.country] === 'SG' || r[C.country] === '-'))
        && onW.reduce((s, w) => s + w.meta.total, 0) > onW.reduce((s, w) => s + sumN(w.rows), 0),
        'ON emitted rows for the SG identity traffic only (the Googlebot-US and bare requests are in meta.total, not in rows)',
        JSON.stringify(onW.map((w) => [w.meta.total, w.meta.unattested, sumN(w.rows)])));
    ok('K', anyPs(S.off).length === 0, 'kill switch TP_PAGE_SRC_OBS=0: no [page-src] line at all (ENABLED or rows)', anyPs(S.off).slice(0, 2).join(' | '));
    ok('K', S.off.lines.some((l) => l.startsWith('[moon-load] {')) && S.off.lines.some((l) => /^\[crawl-src\] worker=\d+ ENABLED/.test(l)),
        'kill switch: [moon-load] and [crawl-src] still run (only page-src is off)');
    for (const k of ['base', 'base2', 'on', 'off']) killSrv(S[k]);
}

// ---- [F] the known mix ----
async function sectionF(S) {
    section('[F] fields: a known mix inside one window (rows for SG only)');
    S.counts = await boot(ROOT, PORT.counts, 'counts', EDGE);
    const sent = [];   // every family request: { row: { fam .. prefix } | null, pk, unatt, ua, st, head }
    const send = async (p, h, exp, method = 'GET') => {
        for (const k of ['cf-connecting-ip', 'cf-connecting-ipv6', 'x-forwarded-for']) if (h[k]) CLIENT_IPS.add(h[k]);
        const r = await rawGet(PORT.counts, p, { method, h: { host: 'timesprayers.com', ...h } });
        if (exp) sent.push({ ...exp, ua: h['user-agent'] || '', st: r.st, head: method === 'HEAD' ? 1 : 0 });
        return r.st;
    };
    const A = (ip, cc, extra = {}) => ({ 'cf-connecting-ip': ip, 'cf-ray': RAY, ...(cc ? { 'cf-ipcountry': cc } : {}), ...extra });
    // an SG row, its prefix key (for meta.pfx); a request with no row (another country / no country); an unattested one
    const SGR = (fam, lang, declared, token, ver, bcls, prefix, ip, h = {}) => ({ row: { fam, lang, declared, token, ver, bcls, prefix }, pk: pkOf(ip, h) });
    const NO = { row: null }, UN = { row: null, unatt: true };
    // warm the SSR cache first (outside the measured window), then wait for a window boundary and send the mix at once
    for (const u of ['/es/prayer-times-in-makkah', '/ms/qibla-in-makkah', '/next-prayer-in-cairo', '/en/next-prayer-in-cairo', '/fr/time-left-until-next-prayer-in-makkah',
        '/tr/qibla-in-makkah', '/ur/prayer-times-in-makkah', '/de/qibla-in-makkah', '/id/prayer-times-in-makkah', '/prayer-times-in-makkah', '/qibla-in-zzqx-nocity', '/es/prayer-times-in-australia', '/prayer-times-in-saudi-arabia',
        '/ms/prayer-times-in-makkah', '/ms/next-prayer-in-cairo', '/ms/qibla-direction-in-makkah']) await rawGet(PORT.counts, u, { h: { host: 'timesprayers.com' } });
    const from0 = S.counts.lines.length;
    await flushes(S.counts, from0, 1);
    const from = S.counts.lines.length;
    const t0 = Date.now();
    // 1) declared browser, full headers + ch, 7 IPs of one /24 -> the prefix is shown (prefix and row >= MIN_N 5)
    for (let i = 0; i < 7; i++) { const ip = '203.0.113.' + (11 + i); await send('/es/prayer-times-in-makkah', { 'user-agent': UA.chrome, ...FULL, ...A(ip, 'SG') }, SGR('prayer-city', 'es', 'browser', CH, 'na', 'full+ch', '203.0.113.0/24', ip)); }
    // 2) declared browser, bare headers, 3 different /24s -> folded '*', pfx 3
    for (const ip of ['45.33.1.1', '45.33.2.1', '45.33.3.1']) await send('/ms/qibla-in-makkah', { 'user-agent': UA.chrome, ...A(ip, 'SG') }, SGR('qibla-city', 'ms', 'browser', CH, 'na', 'bare', '*', ip));
    // 3) Googlebot inside its list, 5 requests (2 GET + 3 HEAD) from one /24 -> 'v', prefix shown
    for (let i = 0; i < 5; i++) { const ip = '66.249.66.' + (1 + i); await send('/next-prayer-in-cairo', { 'user-agent': UA.gbot, ...A(ip, 'SG') }, SGR('next-prayer-city', 'ar', 'googlebot', '-', 'v', '-', '66.249.66.0/24', ip), i < 2 ? 'GET' : 'HEAD'); }
    // 4) Googlebot outside its list -> 'x'; the same from NL -> no row
    await send('/en/next-prayer-in-cairo', { 'user-agent': UA.gbot, ...A('5.6.7.8', 'SG') }, SGR('next-prayer-city', 'en', 'googlebot', '-', 'x', '-', '*', '5.6.7.8'));
    await send('/en/next-prayer-in-cairo', { 'user-agent': UA.gbot, ...A('5.6.8.9', 'NL') }, NO);
    // 5) without a cf-ray, 6) only x-forwarded-for -> not edge-attested: meta.unattested, no row
    await send('/en/next-prayer-in-cairo', { 'user-agent': UA.gbot, 'cf-connecting-ip': '66.249.66.9', 'cf-ipcountry': 'SG' }, UN);
    await send('/en/next-prayer-in-cairo', { 'user-agent': UA.gbot, 'x-forwarded-for': '66.249.66.10', 'cf-ray': RAY, 'cf-ipcountry': 'SG' }, UN);
    // 7) GPTBot inside its list; 8) Applebot (no list loaded) -> 'np'
    await send('/fr/time-left-until-next-prayer-in-makkah', { 'user-agent': UA.gpt, ...A('20.171.206.5', 'SG') }, SGR('time-left-city', 'fr', 'gptbot', '-', 'v', '-', '*', '20.171.206.5'));
    await send('/tr/qibla-in-makkah', { 'user-agent': UA.apple, ...A('17.58.101.1', 'SG') }, SGR('qibla-city', 'tr', 'applebot', '-', 'np', '-', '*', '17.58.101.1'));
    // 9) IPv6 on a declared browser's row: /32, 5 requests -> shown
    for (let i = 1; i <= 5; i++) { const ip = '2406:3003:abcd:' + i + '::' + i; await send('/ur/prayer-times-in-makkah', { 'user-agent': UA.chrome, ...FULL, ...A(ip, 'SG') }, SGR('prayer-city', 'ur', 'browser', CH, 'na', 'full+ch', '2406:3003::/32', ip)); }
    // 10) python-requests, 5 requests from 5 /24s -> its canonical token, prefix '*'; the same from DE -> no row
    for (const ip of ['91.1.1.1', '91.1.2.1', '91.1.3.1', '91.1.4.1', '91.1.5.1']) await send('/de/qibla-in-makkah', { 'user-agent': UA.py, ...A(ip, 'SG') }, SGR('qibla-city', 'de', 'other-bot', 'python-requests', 'na', '-', '*', ip));
    await send('/de/qibla-in-makkah', { 'user-agent': UA.py, ...A('91.1.9.1', 'DE') }, NO);
    // 11) no User-Agent -> 'unknown' / 'empty'; no cf-ipcountry -> no row
    await send('/id/prayer-times-in-makkah', { ...A('36.1.1.1', 'SG') }, SGR('prayer-city', 'id', 'unknown', 'empty', 'na', '-', '*', '36.1.1.1'));
    await send('/id/prayer-times-in-makkah', { ...A('36.1.1.2', null) }, NO);
    // 12) trailing slash (301), 13) www host (301), 14) qibla-direction-in- (its family), 15) an unknown city; the same from MY -> no row
    for (const ip of ['103.1.1.1', '103.1.2.1']) await send('/bn/prayer-times-in-makkah/', { 'user-agent': UA.safari, ...A(ip, 'SG') }, SGR('prayer-city', 'bn', 'browser', SF, 'na', 'bare', '*', ip));
    await send('/prayer-times-in-makkah', { 'user-agent': UA.safari, ...A('103.1.3.1', 'SG'), host: 'www.timesprayers.com' }, SGR('prayer-city', 'ar', 'browser', SF, 'na', 'bare', '*', '103.1.3.1'));
    await send('/ms/qibla-direction-in-makkah', { 'user-agent': UA.safari, ...A('103.1.4.1', 'SG') }, SGR('qibla-city', 'ms', 'browser', SF, 'na', 'bare', '*', '103.1.4.1'));
    await send('/qibla-in-zzqx-nocity', { 'user-agent': UA.safari, ...A('103.1.5.1', 'SG') }, SGR('qibla-city', 'ar', 'browser', SF, 'na', 'bare', '*', '103.1.5.1'));
    await send('/qibla-in-zzqx-nocity', { 'user-agent': UA.safari, ...A('103.1.6.1', 'MY') }, NO);
    // 16) query strings, a cookie, a referer and an Accept-Language with markers
    for (const q of ['?utm=MARKERQ1&email=a@b.co', '?x=MARKERQ2']) { const ip = '81.2.3.' + q.length;
        await send('/prayer-times-in-makkah' + q, { 'user-agent': UA.chrome, cookie: 'sid=MARKERCK1; _ga=GA1.1.123', referer: 'https://www.google.com/search?q=MARKERREF',
            'accept-language': 'MARKERAL', 'sec-fetch-mode': 'navigate', 'sec-fetch-dest': 'document', accept: 'text/html', ...A(ip, 'SG') }, SGR('prayer-city', 'ar', 'browser', CH, 'na', 'full', '*', ip)); }
    // 17) country pages under /prayer-times-in- (prayer-country, measured too)
    for (const ip of ['45.33.4.1', '45.33.5.1']) await send('/es/prayer-times-in-australia', { 'user-agent': UA.chrome, ...A(ip, 'SG') }, SGR('prayer-country', 'es', 'browser', CH, 'na', 'bare', '*', ip));
    await send('/prayer-times-in-saudi-arabia', { 'user-agent': UA.chrome, ...A('45.33.6.1', 'SG') }, SGR('prayer-country', 'ar', 'browser', CH, 'na', 'bare', '*', '45.33.6.1'));
    // 19) a Cloudflare pseudo IPv4 (240.0.0.0/4) and a request with cf-connecting-ipv6 -> 'pseudo' (meta.pseudo 2)
    await send('/ms/prayer-times-in-makkah', { 'user-agent': UA.chrome, ...A('240.1.2.3', 'SG') }, SGR('prayer-city', 'ms', 'browser', CH, 'na', 'bare', 'pseudo', '240.1.2.3'));
    { const h6 = { 'cf-connecting-ipv6': '2001:db8:77::1' }; await send('/ms/prayer-times-in-makkah', { 'user-agent': UA.chrome, ...A('45.1.2.3', 'SG', h6) }, SGR('prayer-city', 'ms', 'browser', CH, 'na', 'bare', 'pseudo', '45.1.2.3', h6)); }
    // 20) Googlebot over IPv6 inside its list, 5 requests -> 'v'; a crawler row is cut at /32 too
    for (let i = 1; i <= 5; i++) { const ip = '2001:4860:4801:10::' + i; await send('/next-prayer-in-cairo', { 'user-agent': UA.gbot, ...A(ip, 'SG') }, SGR('next-prayer-city', 'ar', 'googlebot', '-', 'v', '-', '2001:4860::/32', ip)); }
    // 21) identifier-shaped User-Agents -> their class label ('unknown'), a strange suffix on Chrome -> the browser token,
    //     a declared browser of no known family -> 'browser:other-x:<os>'
    for (const [ua, ip, exp] of ID_UAS_HTTP) await send('/ms/next-prayer-in-cairo', { 'user-agent': ua, ...A(ip, 'SG') }, SGR('next-prayer-city', 'ms', exp.declared, exp.token, 'na', exp.bcls, '*', ip));
    // 22) a 6to4 client address -> 'v6x'
    await send('/ms/prayer-times-in-makkah', { 'user-agent': UA.chrome, ...A('2002:cb00:7115::1', 'SG') }, SGR('prayer-city', 'ms', 'browser', CH, 'na', 'bare', 'v6x', '2002:cb00:7115::1'));
    // 23) a US browser, 6 requests from one /24 -> no row, no prefix
    for (let i = 0; i < 6; i++) await send('/es/prayer-times-in-makkah', { 'user-agent': UA.chrome, ...FULL, ...A('198.51.100.' + (10 + i), 'US') }, NO);
    // 18) pages outside the five families: never counted
    for (const u of ['/', '/es', '/qibla', '/moon/saudi-arabia/riyadh/2026/10', '/es/prayer-times-worldwide', '/health'])
        await send(u, { 'user-agent': UA.chrome, ...A('198.51.100.99', 'SG') }, null);
    const tMix = Date.now() - t0;
    await flushes(S.counts, from, 1);
    const W = windows(psJson(S.counts, from));
    info('mix sent in ' + tMix + ' ms; windows with rows: ' + W.length);
    ok('F', W.length === 1, 'the whole mix landed in one window (window 20 s)', 'windows ' + W.length);
    if (!W.length) return;
    const w = W[0];
    // expected rows from what was sent and what the client received
    const exp = new Map();
    for (const s of sent) {
        if (!s.row) continue;
        const r = s.row;
        const k = [r.fam, r.lang, r.declared, r.token, r.ver, r.bcls, 'SG', r.prefix].join('|');
        const e = exp.get(k) || { n: 0, '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0, abort: 0, head: 0 };
        e.n++; e[stClass(s.st)]++; e.head += s.head;
        exp.set(k, e);
    }
    const got = new Map(w.rows.map((r) => [rkey(r), r]));
    const bad = [];
    for (const [k, e] of exp) {
        const r = got.get(k);
        if (!r) { bad.push('missing ' + k); continue; }
        for (const c of ['n', '2xx', '3xx', '4xx', '5xx', 'abort', 'head']) if (r[C[c]] !== e[c]) bad.push(k + ' ' + c + ' ' + r[C[c]] + ' != ' + e[c]);
    }
    for (const k of got.keys()) if (!exp.has(k)) bad.push('unexpected ' + k);
    ok('F', bad.length === 0, 'every row exact: family, lang, declared, token, ver, bcls, country SG, prefix -> n, 2xx..abort (= what the client received), head (' + exp.size + ' rows)', bad.slice(0, 6).join(' | '));
    const family = sent.length, sgN = sent.filter((s) => s.row).length, unatt = sent.filter((s) => s.unatt).length;
    ok('F', w.meta.total === family && sumN(w.rows) === sgN && w.meta.unattested === unatt && family - unatt - sgN === sent.filter((s) => !s.row && !s.unatt).length,
        'meta.total = the ' + family + ' family requests; sum of n = the ' + sgN + ' SG requests; meta.unattested = ' + unatt + '; total - unattested - sum of n = the other-country / no-country requests; the 6 other pages are not counted',
        JSON.stringify([w.meta.total, sumN(w.rows), w.meta.unattested]));
    const pks = new Set(sent.filter((s) => s.row && s.pk !== null).map((s) => s.pk));
    const uas = new Set(sent.filter((s) => s.row).map((s) => s.ua));
    const toks = new Set(sent.filter((s) => s.row).map((s) => s.row.declared + '|' + s.row.token));
    ok('F', w.meta.pfx === pks.size && w.meta.ua_cache === uas.size && w.meta.tokens === toks.size && w.meta.pseudo === 2,
        'no detail from non-SG requests: meta.pfx = the ' + pks.size + ' SG prefixes, meta.ua_cache = the ' + uas.size + ' SG User-Agents, meta.tokens = ' + toks.size + ', meta.pseudo = 2',
        JSON.stringify(w.meta) + ' want pfx ' + pks.size + ' ua ' + uas.size + ' tokens ' + toks.size);
    const hourNow = new Date(t0).toISOString().slice(0, 13), hourEnd = new Date().toISOString().slice(0, 13);
    ok('F', w.rows.every((r) => r[C.hour] === hourNow || r[C.hour] === hourEnd), 'hour = the UTC hour of the request', w.rows.map((r) => r[C.hour]).join(','));
    const r1 = got.get('prayer-city|es|browser|' + CH + '|na|full+ch|SG|203.0.113.0/24'), r2 = got.get('qibla-city|ms|browser|' + CH + '|na|bare|SG|*');
    const r3 = got.get('prayer-city|ur|browser|' + CH + '|na|full+ch|SG|2406:3003::/32'), r4 = got.get('next-prayer-city|ar|googlebot|-|v|-|SG|66.249.66.0/24');
    const r5 = got.get('next-prayer-city|ar|googlebot|-|v|-|SG|2001:4860::/32'), r6 = got.get('prayer-city|ms|browser|' + CH + '|na|bare|SG|pseudo');
    const r7 = got.get('next-prayer-city|ms|unknown|unknown|na|-|SG|*'), r8 = got.get('prayer-city|ms|browser|' + CH + '|na|bare|SG|v6x');
    ok('F', r1 && r1[C.pfx] === 1 && r2 && r2[C.pfx] === 3 && r3 && r3[C.pfx] === 1 && r4 && r4[C.pfx] === 1 && r5 && r5[C.pfx] === 1 && r6 && r6[C.pfx] === 0 && r7 && r7[C.pfx] === 4 && r8 && r8[C.pfx] === 0,
        'pfx: 1 for a shown /24 and a shown /32 (browser and crawler rows alike), 3 / 4 for folded rows of three / four /24s, 0 for "pseudo" and "v6x"',
        [r1, r2, r3, r4, r5, r6, r7, r8].map((r) => r && r[C.pfx]).join(','));
    ok('F', w.rows.every((r) => r[C.avg_ms] >= 0 && r[C.max_ms] >= r[C.avg_ms] && r[C['2xx']] + r[C['3xx']] + r[C['4xx']] + r[C['5xx']] + r[C.abort] === r[C.n]), 'status classes sum to n; max_ms >= avg_ms');
    ok('F', w.meta.edge_trust === 1 && w.meta.ranges_state === 'ok' && w.meta.min_n === 5 && w.meta.compact === 0 && w.meta.ovf === 0,
        'meta: edge_trust 1, ranges ok, min_n 5, no compaction / overflow', JSON.stringify(w.meta));
    ok('F', r7 && r7[C.n] === 4 && got.has('next-prayer-city|ms|browser|browser:other-x:other|na|bare|SG|*') && got.has('qibla-city|de|other-bot|python-requests|na|-|SG|*'),
        'tokens: four identifier-shaped / unlisted products -> one "unknown" row (n 4), a declared browser of no known family -> "browser:other-x:other", python-requests -> its canonical name');
    ok('F', w.rows.every((r) => r[C.country] === 'SG') && w.rows.every((r) => r[C.prefix] !== 'u' && !/^198\.51\.100\./.test(r[C.prefix])),
        'every row is SG; no row or prefix from the US / NL / DE / MY / no-country / unattested requests');
    const langs = new Set(w.rows.map((r) => r[C.lang]));
    ok('F', ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'].every((l) => langs.has(l)), 'all ten language prefixes are told apart', [...langs].join(','));
    // [req-family] of the same window counts the same five families
    const rf = S.counts.lines.slice(from).filter((l) => l.startsWith('[req-family] {')).map((l) => JSON.parse(l.slice(13)));
    const rfN = rf.reduce((s, o) => s + o.rows.filter((r) => FAMILIES.has(r[0])).reduce((a, r) => a + r[2], 0), 0);
    ok('F', rfN === family && w.meta.total === rfN, '[req-family] of the same window(s) has the same count for the five families as meta.total', rfN + ' vs ' + family);
    // [crawl-src] never names a city family (moon measurement not widened)
    const cs = S.counts.lines.filter((l) => l.startsWith('[crawl-src] {')).map((l) => JSON.parse(l.slice(12)));
    ok('M', cs.every((o) => !o.rows.some((r) => FAMILIES.has(r[0]) || /city$/.test(String(r[0])))), 'no [crawl-src] row of this server names a measured family (' + cs.length + ' lines)');
}

// ---- [P] privacy over every [page-src] line of every server ----
function sectionP(servers) {
    section('[P] privacy');
    sectionPT();
    const all = INPROC.filter((l) => l.startsWith('[page-src]'));
    const nIn = all.length;
    for (const s of servers) if (s && s.lines) all.push(...s.lines.filter((l) => l.startsWith('[page-src]')));
    const bits = [...UA_BITS, ...ID_BITS, ...MARKERS, ...CLIENT_IPS];
    const bad = [], fld = [];
    let nJson = 0;
    for (const l of all) {
        for (const b of scanLine(l, bits)) bad.push(b + ' in ' + l.slice(0, 100));
        if (/cookie|referer|accept-language|_ga|GA1\./i.test(l)) bad.push('header name/value in ' + l.slice(0, 120));
        // no new field: no cpfx / list column or key, no other new key anywhere (ENABLED / WARN / EXPIRED lines included)
        if (/cpfx|"list"|"lists"|list_segs|rare_tok|co_full|"co"|"sg"|"warn"/.test(l)) fld.push('new field text in ' + l.slice(0, 160));
        if (l.startsWith('[page-src] {')) {
            nJson++;
            const o = JSON.parse(l.slice(11));
            if (Buffer.byteLength(l) > 8192) bad.push('line > 8 KB');
            if (o.rows.length > 60) bad.push('line > 60 rows');
            if (o.cols !== COLS) fld.push('cols ' + o.cols);
            if (o.v !== 1 || o.t !== 'src') fld.push('v / t ' + o.v + ' ' + o.t);
            const hk = Object.keys(o).join(','), wantHk = o.part === 0 ? HEAD_KEYS : HEAD_KEYS.replace(',meta', '');
            if (hk !== wantHk) fld.push('head keys ' + hk);
            if (o.part === 0 && Object.keys(o.meta).join(',') !== META_KEYS) fld.push('meta keys ' + Object.keys(o.meta).join(','));
            for (const r of o.rows) if (r.length !== 19) fld.push('row width ' + r.length);
        }
    }
    ok('P', all.length > 0 && bad.length === 0, 'the line scan over ' + all.length + ' lines (' + nIn + ' in-process): no full IPv4, no IPv6 longer than /32, no client IP, no query / cookie / referer / '
        + 'Accept-Language value, no raw User-Agent or identifier piece, no "?"; tokens in the fixed vocabulary; prefixes /24, /32, *, pseudo, v6x; country SG; rows <= 60, lines <= 8 KB', bad.slice(0, 6).join(' | '));
    ok('P', nJson > 0 && fld.length === 0, 'no new field in ' + nJson + ' row lines: v 1, head keys, the 19 columns of d78723c, meta keys = d78723c + pseudo only', fld.slice(0, 6).join(' | '));
}
// [P] in-process: the page-src token of 40 User-Agents (identifier shapes -> a class label, real products -> a canonical
//   name, browsers -> their family token) and the canonical list itself
const TOKEN_CASES = [
    ['3f2504e0-4f89-11d3-9a0c-0305e82c3301', 'unknown', 'unknown'],
    ['PrayerWidget_8f3a9c2d7e', 'unknown', 'unknown'],
    [UA.chrome + ' uid-a91f03c7e2/1.0', 'browser', CH],
    ['tester.yuri.vantop@example.com', 'unknown', 'unknown'],
    ['Mozilla/5.0 (X11; Linux x86_64) acct-7731902/1.0', 'browser', 'browser:other-x:linux'],
    ['session-abc/1.0', 'unknown', 'unknown'],
    ['203.0.113.21', 'unknown', 'unknown'],
    ['2001:db8:abcd:12::1', 'unknown', 'unknown'],
    ['MyApp/3.1 (contact yuri.vantop@example.org)', 'unknown', 'unknown'],
    [UA.chrome + ' Edg/141.0.0.0 tracker-9f8e7d6c5b/2', 'browser', 'browser:edge-141:windows'],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1 Device/ab12cd34ef56', 'browser', 'browser:safari-18:ios'],
    ['Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36 [FBAN/EMA;FBAV/400.0.0.0;]', 'browser', 'browser:chrome-141:android'],
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/999.0.0.0 Safari/537.36', 'browser', 'browser:chrome-x:windows'],
    ['Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/007.0 Safari/537.36', 'browser', 'browser:chrome-7:windows'],
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0', 'browser', 'browser:firefox-143:windows'],
    ['john.doe@example.com/1.0', 'unknown', 'unknown'],
    ['@zelda_q/1.0', 'unknown', 'unknown'],
    ['zelda.quorn/1.0', 'unknown', 'unknown'],
    ['8.8.8.8', 'unknown', 'unknown'],
    ['1.2.3.4-bot', 'other-bot', 'other-bot'],
    ['python-requests/2.31.0', 'other-bot', 'python-requests'],
    ['Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot', 'other-bot', 'chatgpt-user'],
    ['Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)', 'browser', 'perplexity-user'],
    ['Mozilla/5.0 (compatible; 360Spider)', 'other-bot', '360spider'],
    ['Mozilla/5.0 (compatible; MJ12bot/v1.4.8; http://mj12bot.com/)', 'known-seo-crawler', 'mj12bot'],
    ['Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)', 'known-seo-crawler', 'ahrefsbot'],
    ['facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', 'known-social-bot', 'facebookexternalhit'],
    ['WhatsApp/2.23.20.0', 'known-social-bot', 'whatsapp'],
    ['FeedFetcher-Google; (+http://www.google.com/feedfetcher.html)', 'unknown', 'feedfetcher-google'],
    ['Mozilla/5.0 (compatible; MyBot/1.0; +mailto:mybot@example.com)', 'other-bot', 'other-bot'],
    ['FeedReaderBot/2.0; +mailto:ops@feedreader.example', 'other-bot', 'other-bot'],
    ['Go-http-client/1.1', 'unknown', 'go-http-client'],
    ['okhttp/4.12.0', 'unknown', 'okhttp'],
    ['curl/8.4.0', 'other-bot', 'curl'],
    ['Wget/1.21.4', 'other-bot', 'wget'],
    ['Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.0.0 Safari/537.36', 'other-bot', 'headlesschrome'],
    ['Mozilla/5.0 (compatible; ShapBot/0.1.0)', 'other-bot', 'shapbot'],
    ['Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'googlebot', '-'],
    ['   ', 'unknown', 'unknown'],
    ['', 'unknown', 'empty'],
];
const GROUPS = ['other-bot', 'unknown', 'browser', 'known-seo-crawler', 'known-social-bot'];
function sectionPT() {
    const api = loadBlock({ ...EDGE });
    api.start();
    const canonOk = api.CANON && api.CANON.length > 0 && api.CANON.every((x) => Array.isArray(x) && x.length === 2 && typeof x[0] === 'string' && x[0] === x[0].toLowerCase() && x[0].length >= 4
        && /^[a-z0-9][a-z0-9._-]{1,39}$/.test(x[1])) && new Set(api.CANON.map((x) => x[1])).size === api.CANON.length;
    ok('P', canonOk && CANON_NAMES && CANON_NAMES.size === api.CANON.length, 'the canonical list: ' + (api.CANON ? api.CANON.length : 0) + ' fixed [substring, name] constants, names [a-z0-9._-] and unique',
        JSON.stringify(api.CANON && api.CANON.slice(0, 3)));
    const tb = [];
    for (const [ua, wantD, wantT] of TOKEN_CASES) {
        const s = ua.slice(0, 512), d = api._obsAgent(s);
        const t = GROUPS.includes(d) ? api._psToken(s.toLowerCase(), d) : '-';
        if (d !== wantD || t !== wantT || !tokOk(t)) tb.push(JSON.stringify(ua.slice(-48)) + ' -> ' + d + ' / ' + t + ' (want ' + wantD + ' / ' + wantT + ')');
    }
    // the one-pass pre-check (_PS_CANON_RE) never changes the result: the token = the first list entry contained, on every
    //   canonical substring alone, embedded in filler, and paired with another one (5,000 random strings)
    {
        let seed = 4242;
        const rnd = (n) => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return seed % n; };
        const ref = (u) => { for (const [s, nm] of api.CANON) if (u.indexOf(s) !== -1) return nm; return 'unknown'; };
        const strs = api.CANON.map((x) => x[0]);
        for (let i = 0; i < 5000; i++) {
            let s = 'zq' + 'xyz '.repeat(rnd(5));
            for (let k = rnd(3); k > 0; k--) s += strs[rnd(strs.length)] + ' /' + 'ab'.repeat(rnd(4));
            strs.push(s);
        }
        const pb = strs.filter((u) => api._psToken(u, 'unknown') !== ref(u));
        ok('P', pb.length === 0, 'in-process: the canonical pre-check changes no token (' + strs.length + ' strings: every entry, embedded, paired)', pb.slice(0, 3).join(' | '));
    }
    ok('P', tb.length === 0, 'in-process: the token of ' + TOKEN_CASES.length + ' User-Agents -- identifier shapes and unlisted products -> their class label, listed products -> the canonical name, '
        + 'browsers -> family-major-os (major beyond 199 -> x), no User-Agent -> empty', tb.slice(0, 4).join(' | '));
    // the same User-Agents through the whole record path, 6 times each from one SG /24: the rows carry exactly those tokens
    TOKEN_CASES.forEach(([ua], i) => { const ip = '198.17.' + i + '.1'; CLIENT_IPS.add(ip); for (let j = 0; j < 6; j++) api._psRecord({ method: 'GET', socket: {}, headers: { 'user-agent': ua, 'cf-connecting-ip': ip, 'cf-ray': RAY, 'cf-ipcountry': 'SG' } }, 1, '/ms/qibla-in-makkah', '2xx', 5); });
    api._psFlush('w');
    const iw = api.rows()[0];
    const want = new Map();
    for (const [ua, d, t] of TOKEN_CASES) { const k = d + '|' + t; want.set(k, (want.get(k) || 0) + 6); }
    const gotT = new Map();
    for (const r of (iw ? iw.rows : [])) { const k = r[C.declared] + '|' + r[C.token]; gotT.set(k, (gotT.get(k) || 0) + r[C.n]); }
    const diff = [...new Set([...want.keys(), ...gotT.keys()])].filter((k) => want.get(k) !== gotT.get(k));
    ok('P', iw && diff.length === 0 && sumN(iw.rows) === TOKEN_CASES.length * 6, 'in-process: recorded 6 times each from one SG /24, the rows carry exactly the expected tokens (' + want.size + ' declared|token pairs)', diff.slice(0, 5).join(' | '));
    // the shape check of the line scan itself: it would catch an IPv4 address in any form and an IPv6 longer than /32, never the hour or a /32
    const probe = (s) => scanLine(s, []).length > 0;
    // + the /32 of a non-global address: outside 2000::/3 (808:808::/32 = 8.8.8.8, cb00:7105::/32 = 203.0.113.5, ...) and
    //   the non-global blocks inside it
    const NG32 = ['"808:808::/32"', '"cb00:7105::/32"', '"c0a8:164::/32"', '"0:0::/32"', '"64:ff9b::/32"', '"100:0::/32"', '"fc00:cb00::/32"', '"fd12:3456::/32"',
        '"fe80:0::/32"', '"fec0:cb00::/32"', '"ff02:0::/32"', '"4000:cb00::/32"', '"1fff:ffff::/32"', '"2001:0::/32"', '"2001:2::/32"', '"2001:1ff::/32"', '"2001:db8::/32"',
        '"2002:cb00::/32"', '"3fff:cb0::/32"', '"3fff:fff::/32"'];
    ok('P', ['x 8.8.8.8 y', '"203.0.113.0/25"', '"1.2.3.4"', 'a 2002:cb00:7115::/48', '"2001:db8:1::/48"', '"::ffff:1.2.3.0/24"', '2a02:c7c::7', ...NG32].every(probe)
        && !['"2026-10-19T10"', '"203.0.113.0/24"', '"2a02:c7c::/32"', '"2001:4860::/32"', '"2001:200::/32"', '"2406:3003::/32"', '"3fff:1000::/32"', '"2000:0::/32"', '"3ffe:ffff::/32"',
            '"ts":"2026-10-19T12:01:19Z"', 'until=2026-10-21T06:30:00.000Z', '"browser:chrome-141:windows"'].some(probe)
        && NG32.every((s) => !PREFIX_OK(s.slice(1, -1))) && ['2a02:c7c::/32', '2001:4860::/32', '2406:3003::/32'].every(PREFIX_OK)
        && ['8.8.8.8', '1-2-3-4', 'x1_2_3_4', 'ffff-1.2.3.4'].every((s) => IP4_ANY.test(s)) && !['2026-10-19T10', '2026-10-19', '141.0.0', 'chrome-141'].some((s) => IP4_ANY.test(s)),
        'the line scan detects a full IPv4 (any separator), an IPv6 longer than /32 and the /32 of ' + NG32.length + ' non-global IPv6 blocks (also refused as a prefix), '
        + 'and passes the hour, a timestamp, a /24 and a global unicast /32');
}

// ---- [R] the residual cases (pre-merge report 3.6 + the owner's closure list) ----
const LONG = (n, tail) => { let s = 'LongTool/1.0 '; while (s.length < n) s += 'abcdefghij klmnopqrstu vwxyz '; return s.slice(0, n) + tail; };
const LONG_TAIL = ' zelda.quorn@example.com 0501234567 deadbeef 203.0.113.77 2a02:c7c::7';
const R_UAS = (longN) => [   // [label, User-Agent, declared, token]
    ['uuid', '3f2504e0-4f89-11d3-9a0c-0305e82c3301', 'unknown', 'unknown'],
    ['uuid-product', 'Widget-3f2504e0-4f89-11d3-9a0c-0305e82c3301/1.0', 'unknown', 'unknown'],
    ['email-at', 'zelda.quorn@example.com/1.0', 'unknown', 'unknown'],
    ['email-at-context', 'Mozilla/5.0 (compatible; yuri.vantop@example.org)', 'browser', 'browser:other-x:other'],
    ['email-%40', 'zelda.quorn%40example.com/1.0', 'unknown', 'unknown'],
    ['email-after-256', 'SomeClient/1.0 ' + 'a'.repeat(270) + ' contact jqx.rvq@example.net', 'unknown', 'unknown'],
    ['user-name', 'zelda.quorn/1.0', 'unknown', 'unknown'],
    ['phone', '0501234567/1.0', 'unknown', 'unknown'],
    ['phone-intl', '+966-50-123-4567', 'unknown', 'unknown'],
    ['phone-context', 'Caller +966501234567', 'unknown', 'unknown'],
    ['hex-long', 'ab12cd34ef56ab12cd34/1.0', 'unknown', 'unknown'],
    ['hex-short-no-digit', 'deadbeef/1.0', 'unknown', 'unknown'],
    ['hex-word', 'cafebabe', 'unknown', 'unknown'],
    ['mac-dash', 'de-ad-be-ef-ca-fe/1.0', 'unknown', 'unknown'],
    ['mac-colon', 'de:ad:be:ef:ca:fe/1.0', 'unknown', 'unknown'],
    ['ipv4-short-product', '8.8.8.8/1.0', 'unknown', 'unknown'],
    ['ipv4-full-product', '203.0.113.77/2.0', 'unknown', 'unknown'],
    ['ipv4-dash-product', '1-2-3-4/1.0', 'unknown', 'unknown'],
    ['ipv6-product', '2a02:c7c::7/1.0', 'unknown', 'unknown'],
    ['browser-suffix', UA.chrome + ' zelda.quorn/1.0 deadbeef', 'browser', CH],
    ['bot-mailto', 'Mozilla/5.0 (compatible; ZeldaBot/1.0; +mailto:zelda.quorn@example.com)', 'other-bot', 'other-bot'],
    ['long', LONG(longN, LONG_TAIL), 'unknown', 'unknown'],
    ['long-browser', UA.chrome + ' ' + LONG(longN, LONG_TAIL), 'browser', CH],
];
const R_ADDRS = [   // [label, client address, User-Agent, extra headers, expected prefix]
    ['6to4', '2002:cb00:7115::1', UA.chrome, {}, 'v6x'],
    ['teredo', '2001:0:4136:e378:8000:63bf:3fff:fdd2', UA.chrome, {}, 'v6x'],
    ['nat64-well-known', '64:ff9b::cb00:7116', UA.chrome, {}, 'v6x'],
    ['nat64-local', '64:ff9b:1::cb00:7117', UA.chrome, {}, 'v6x'],
    ['ipv4-compatible', '::203.0.113.90', UA.chrome, {}, 'v6x'],
    ['ipv4-compatible-hex', '::cb00:715a', UA.chrome, {}, 'v6x'],
    ['ipv4-mapped', '::ffff:198.51.100.88', UA.chrome, {}, '198.51.100.0/24'],
    ['ipv4-mapped-full', '0:0:0:0:0:ffff:c633:6459', UA.chrome, {}, '198.51.100.0/24'],
    ['ipv4-mapped-hex', '::ffff:c633:645a', UA.chrome, {}, 'v6x'],
    ['crawler-ipv6', '2001:4860:4801:10::5', UA.gbot, {}, '2001:4860::/32'],
    ['crawler-ipv6-nolist', '2a03:2880:f001:1::1', UA.apple, {}, '2a03:2880::/32'],
    ['tool-ipv6', '2a01:4f8:1:2::9', UA.py, {}, '2a01:4f8::/32'],
    ['pseudo-240', '240.1.2.3', UA.chrome, {}, 'pseudo'],
    ['pseudo-v6-header', '45.1.2.3', UA.chrome, { 'cf-connecting-ipv6': '2001:db8:77::1' }, 'pseudo'],
];
// non-global IPv6 client addresses (owner closure round, the last low finding of the privacy review): the /32 of an
//   address outside 2000::/3 may spell a whole IPv4 address in hex (808:808::/32 = 8.8.8.8), so every non-global address
//   -> 'v6x'; fc00::/7, fe80::/10 and ::1 are not taken as the client at all (getClientIp: non-public -> the socket
//   address) -> not edge-attested, no row (null)
const R_NG = [
    ['v4-in-hex-8.8.8.8', '808:808::1', UA.chrome, {}, 'v6x'],
    ['v4-in-hex-203.0.113.5', 'cb00:7105::1', UA.chrome, {}, 'v6x'],
    ['v4-in-hex-full-crawler', 'cb00:7105:0:0:0:0:0:2', UA.gbot, {}, 'v6x'],
    ['v4-in-hex-192.168.1.100-tool', 'c0a8:164::1', UA.py, {}, 'v6x'],
    ['loopback-full', '0:0:0:0:0:0:0:1', UA.chrome, {}, 'v6x'],
    ['discard-100::/64', '100::cb00:7106', UA.chrome, {}, 'v6x'],
    ['site-local-fec0::/10', 'fec0:cb00:7107::1', UA.chrome, {}, 'v6x'],
    ['multicast-ff02::', 'ff02::cb00:7108', UA.chrome, {}, 'v6x'],
    ['above-2000::/3', '4000:cb00:7109::1', UA.chrome, {}, 'v6x'],
    ['ietf-2001:2::/48', '2001:2:0:cb00::7110', UA.chrome, {}, 'v6x'],
    ['doc-2001:db8::/32', '2001:db8:cb00:7111::1', UA.chrome, {}, 'v6x'],
    ['doc-3fff::/20', '3fff:cb0:7112::1', UA.chrome, {}, 'v6x'],
    ['ula-fc00::/7', 'fc00:cb00:7113::1', UA.chrome, {}, null],
    ['ula-fd00::/8', 'fd12:3456:7114::1', UA.chrome, {}, null],
    ['link-local-fe80::/10', 'fe80::cb00:7115', UA.chrome, {}, null],
    ['loopback', '::1', UA.chrome, {}, null],
];
R_ADDRS.push(...R_NG);
// every original text and address of the cases that must appear in no line (the /24 and /32 cuts of the shown prefixes
//   are allowed and are not in this list)
const R_BITS = ['zelda', 'quorn', 'example.com', 'yuri', 'vantop', 'example.org', 'jqx', 'rvq', 'example.net', '%40', '@', '3f2504e0', '0305e82c3301', 'widget', 'someclient', 'contact',
    '0501234567', '+966', '966-50', '966501234567', 'caller', 'ab12cd34', 'deadbeef', 'cafebabe', 'de-ad', 'de:ad', 'be-ef', 'ca:fe', '8.8.8.8', '203.0.113.77', '1-2-3-4', '2a02:c7c',
    'longtool', 'klmnopqrstu', 'zeldabot', 'mailto', '2002:cb00', 'cb00:7115', '7115::', '2001:0:', '4136:e378', '8000:63bf', '3fff:fdd2', '64:ff9b', 'cb00:7116', 'cb00:7117', '203.0.113.90',
    'cb00:715a', '::ffff', '198.51.100.88', 'c633:6459', 'c633:645a', '2001:4860:4801', '4801:10', '2a03:2880:f001', 'f001:1', '2a01:4f8:1', '4f8:1:2', '240.1.2.3', '45.1.2.3',
    '2001:db8:77', '198.19.', '198.20.',
    '808:808', 'cb00:7105', 'c0a8:164', '100::cb00', 'cb00:7106', 'fec0:cb00', 'cb00:7107', 'ff02::', 'cb00:7108', '4000:cb00', 'cb00:7109', '2001:2:0', 'cb00::7110',
    '2001:db8:cb00', 'cb00:7111', '3fff:cb0:', 'cb0:7112', 'fc00:cb00', 'cb00:7113', 'fd12:3456', '3456:7114', 'fe80::'];   // (no bare 4-hex piece: the random boot id could carry one)
// sends every case 6 times from SG (one /24 per User-Agent case, the address itself for the address cases), then 6 times
//   from US and 6 times unattested; rec(headers) records one request. Returns what was sent.
function rCases(rec, longN) {
    const st = { sg: 0, us: 0, un: 0, pks: new Set(), rows: new Map() };
    const addRow = (k, n) => st.rows.set(k, (st.rows.get(k) || 0) + n);
    R_UAS(longN).forEach(([, ua, d, t], i) => {
        for (let j = 0; j < 6; j++) {
            rec({ 'user-agent': ua, 'cf-connecting-ip': '198.18.' + i + '.' + (1 + j), 'cf-ray': RAY, 'cf-ipcountry': 'SG' }); st.sg++;
            rec({ 'user-agent': ua, 'cf-connecting-ip': '198.19.' + i + '.' + (1 + j), 'cf-ray': RAY, 'cf-ipcountry': 'US' }); st.us++;
            rec({ 'user-agent': ua, 'cf-connecting-ip': '198.20.' + i + '.' + (1 + j), 'cf-ipcountry': 'SG' }); st.un++;
        }
        st.pks.add('198.18.' + i);
        addRow(d + '|' + t + '|198.18.' + i + '.0/24', 6);
    });
    for (const [, ip, ua, extra, pfx] of R_ADDRS) {
        for (let j = 0; j < 6; j++) {   // pfx null: an address never taken as the client -> every copy is unattested
            rec({ 'user-agent': ua, 'cf-connecting-ip': ip, 'cf-ray': RAY, 'cf-ipcountry': 'SG', ...extra }); if (pfx === null) st.un++; else st.sg++;
            rec({ 'user-agent': ua, 'cf-connecting-ip': ip, 'cf-ray': RAY, 'cf-ipcountry': 'US', ...extra }); if (pfx === null) st.un++; else st.us++;
            rec({ 'user-agent': ua, 'cf-connecting-ip': ip, 'cf-ipcountry': 'SG', ...extra }); st.un++;
        }
        if (pfx === null) continue;
        const pk = pkOf(ip, extra); if (pk !== null) st.pks.add(pk);
        const d = ua === UA.gbot ? 'googlebot' : ua === UA.apple ? 'applebot' : ua === UA.py ? 'other-bot' : 'browser';
        const t = d === 'browser' ? CH : d === 'other-bot' ? 'python-requests' : '-';
        addRow(d + '|' + t + '|' + pfx, 6);
    }
    return st;
}
function rCheck(tag, lines, st) {
    const W = windows(lines.filter((l) => l.startsWith('[page-src] {')).map((l) => JSON.parse(l.slice(11))));
    const rows = W.flatMap((w) => w.rows);
    const meta = W.reduce((m, w) => { for (const k of ['total', 'unattested', 'pfx', 'pseudo']) m[k] = (m[k] || 0) + w.meta[k]; return m; }, {});
    const probs = [], pl = lines.filter((x) => x.startsWith('[page-src]'));
    for (const l of pl) for (const b of scanLine(l, R_BITS)) probs.push(b);
    ok('R', probs.length === 0 && pl.length > 0, tag + ': the scan over ' + pl.length + ' [page-src] lines -- no original User-Agent text or client address of the ' + (R_UAS(0).length + R_ADDRS.length)
        + ' cases, no full IPv4, no IPv6 longer than /32, tokens and prefixes in their fixed vocabularies', [...new Set(probs)].slice(0, 8).join(' | '));
    const got = new Map();
    for (const r of rows) { const k = r[C.declared] + '|' + r[C.token] + '|' + r[C.prefix]; got.set(k, (got.get(k) || 0) + r[C.n]); }
    const diff = [...new Set([...st.rows.keys(), ...got.keys()])].filter((k) => st.rows.get(k) !== got.get(k)).map((k) => k + ' ' + got.get(k) + ' vs ' + st.rows.get(k));
    ok('R', diff.length === 0, tag + ': the rows exact -- each User-Agent case its class label or canonical token, IPv4-mapped -> its /24, 6to4 / Teredo / NAT64 / IPv4-compatible / mapped-hex -> "v6x", '
        + 'a crawler and a tool over IPv6 -> /32, 240/4 and cf-connecting-ipv6 -> "pseudo", ' + R_NG.filter((x) => x[4] === 'v6x').length + ' non-global IPv6 (IPv4-in-hex 808:808:: etc.) -> "v6x", '
        + R_NG.filter((x) => x[4] === null).length + ' non-public (fc00::/7, fe80::/10, ::1) -> no row', diff.slice(0, 6).join(' | '));
    const ngShown = rows.filter((r) => H32.test(String(r[C.prefix])) && !GLOB32(String(r[C.prefix]))).map((r) => r[C.prefix]);
    ok('R', ngShown.length === 0 && rows.filter((r) => r[C.prefix] === 'v6x').length > 0, tag + ': no non-global /32 in any row (every such address -> "v6x")', ngShown.slice(0, 6).join(' | '));
    ok('R', sumN(rows) === st.sg && meta.total === st.sg + st.us + st.un && meta.unattested === st.un && meta.pfx === st.pks.size && meta.pseudo === 12 && rows.every((r) => r[C.country] === 'SG'),
        tag + ': only the ' + st.sg + ' SG requests make rows; the ' + st.us + ' US and ' + st.un + ' unattested copies only count (meta.total ' + (st.sg + st.us + st.un) + ', unattested ' + st.un + '); meta.pfx = the ' + st.pks.size + ' SG prefixes',
        JSON.stringify(meta) + ' rows n ' + sumN(rows));
}
async function sectionR(S) {
    section('[R] residual cases: nothing of the original text or address in any line');
    // in-process: the candidate block (16,000-character long User-Agents)
    {
        const api = loadBlock({ ...EDGE });
        api.start();
        const st = rCases((h) => api._psRecord({ method: 'GET', socket: {}, headers: h }, 2, '/es/next-prayer-in-cairo', '2xx', 5), 16000);
        api._psFlush('w');
        rCheck('in-process', api.logs, st);
    }
    // over HTTP: a server of the candidate (8,000-character long User-Agents: the header limit is 16 KB)
    // The window must hold the whole send: the threshold of 5 is applied per window, so a send split over two windows
    //   folds a case to '*' in one of them and counts its prefix in both (a test artefact, not a server fault: the
    //   666 requests took 37-39 s in review against a 30 s window). R_WIN_S = 120 s leaves a ~3x margin, the flush
    //   waits allow a full window, and the send is asserted to have landed in one window before the rows are compared.
    const R_WIN_S = 120, R_WAIT_MS = (R_WIN_S + 30) * 1000;
    S.resid = await boot(ROOT, PORT.resid, 'resid', { ...EDGE, TP_MOON_LOAD_OBS_WINDOW_S: String(R_WIN_S) });
    await rawGet(PORT.resid, '/es/next-prayer-in-cairo', { h: { host: 'timesprayers.com' } });
    const f0 = S.resid.lines.length;
    await flushes(S.resid, f0, 1, R_WAIT_MS);
    const from = S.resid.lines.length;
    const reqs = [];
    const st = rCases((h) => reqs.push(h), 8000);
    let i = 0, errs = 0;
    const tR0 = Date.now();
    await Promise.all(Array.from({ length: 6 }, async () => { while (i < reqs.length) { const h = reqs[i++]; const r = await rawGet(PORT.resid, '/es/next-prayer-in-cairo', { h: { host: 'timesprayers.com', ...h } }); if (!r.st) errs++; } }));
    const tR = Date.now() - tR0;
    await flushes(S.resid, S.resid.lines.length, 1, R_WAIT_MS);
    const WR = windows(psJson(S.resid, from));
    info('HTTP: ' + reqs.length + ' requests in ' + tR + ' ms, transport errors ' + errs + '; windows with rows: ' + WR.length + ' (meta.total per window ' + WR.map((w) => w.meta.total).join(',') + ')');
    ok('R', WR.length === 1, 'HTTP: the whole send landed in one window (window ' + R_WIN_S + ' s)', 'windows ' + WR.length + ', send ' + tR + ' ms');
    rCheck('HTTP', S.resid.lines.slice(from), st);
    const allLines = S.resid.lines;
    const outside = allLines.filter((l) => !l.startsWith('[page-src]') && R_BITS.some((b) => b.length >= 6 && l.toLowerCase().indexOf(b.toLowerCase()) !== -1));
    info('HTTP: lines of other tags carrying a case text or address: ' + outside.length + (outside.length ? ' (' + [...new Set(outside.map((l) => l.slice(0, 18)))].join(', ') + ')' : ''));
    killSrv(S.resid);
    // negative control: the same in-process cases through the previous commit's block must be caught by the scan
    if (fs.existsSync(PREV_SERVER)) {
        const prev = loadBlock({ ...EDGE }, PREV_SERVER, null);
        prev.start();
        rCases((h) => prev._psRecord({ method: 'GET', socket: {}, headers: h }, 2, '/es/next-prayer-in-cairo', '2xx', 5), 16000);
        prev._psFlush('w');
        const probs = [];
        for (const l of prev.logs.filter((x) => x.startsWith('[page-src]'))) for (const b of scanLine(l, R_BITS)) probs.push(b);
        const kinds = [...new Set(probs.map((p) => p.replace(/^(text|IPv4|IPv6|token|prefix|country)\b.*$/, '$1')))];
        info('negative control (' + path.basename(PREV_SERVER) + '): ' + probs.length + ' findings, kinds ' + kinds.join(',') + '; e.g. ' + [...new Set(probs)].slice(0, 10).join(' | '));
        ok('R', probs.length > 0 && kinds.includes('text') && kinds.includes('country'), 'negative control: the scan finds the previous commit\'s leaks on the same cases (' + probs.length + ' findings)');
    } else info('negative control skipped: ' + PREV_SERVER + ' not found');
    // negative control 2: the non-global IPv6 cases through a7935c9's block (before this fold) -- there their /32s are
    //   printed (808:808::/32 = 8.8.8.8), and the scan and the prefix check must catch them
    if (fs.existsSync(PREV2_SERVER)) {
        const prev = loadBlock({ ...EDGE }, PREV2_SERVER, null);
        prev.start();
        for (const [, ip, ua, extra] of R_NG) for (let j = 0; j < 6; j++) prev._psRecord({ method: 'GET', socket: {}, headers: { 'user-agent': ua, 'cf-connecting-ip': ip, 'cf-ray': RAY, 'cf-ipcountry': 'SG', ...extra } }, 2, '/es/next-prayer-in-cairo', '2xx', 5);
        prev._psFlush('w');
        const shown = [...new Set(prev.rows().flatMap((w) => w.rows).map((r) => String(r[C.prefix])).filter((p) => H32.test(p)))];
        const probs = [];
        for (const l of prev.logs.filter((x) => x.startsWith('[page-src]'))) for (const b of scanLine(l, R_BITS)) probs.push(b);
        const caught = shown.filter((p) => probs.includes('prefix ' + p) && probs.includes('IPv6 non-global /32 ' + p));
        info('negative control 2 (' + path.basename(PREV2_SERVER) + '): /32s printed there ' + shown.join(', ') + '; findings ' + probs.length);
        ok('R', shown.includes('808:808::/32') && shown.includes('cb00:7105::/32') && shown.length >= 8 && caught.length === shown.length,
            'negative control 2: the previous block prints ' + shown.length + ' non-global /32s for these cases (808:808::/32 = 8.8.8.8 among them); the scan and the prefix check catch every one', JSON.stringify({ shown, caught: caught.length }));
    } else ok('R', false, 'negative control 2: ' + PREV2_SERVER + ' not found');
}

// ---- [B] bounded under a burst ----
async function burst(port, N, conc) {
    const agent = new http.Agent({ keepAlive: true, maxSockets: conc });
    const fams = Object.keys(FAM_URL);
    const langs = ['', '/en', '/fr', '/tr', '/ur', '/de', '/id', '/es', '/bn', '/ms'];
    const cities = ['makkah', 'cairo', 'riyadh', 'medina', 'jeddah', 'dubai'];
    let i = 0, done = 0, fam = 0, sg = 0, unatt = 0; const st = {};
    const one = async () => {
        while (i < N) {
            const k = i++;
            const f = fams[k % 4];
            const real = k % 50 === 0;                      // 2 % real pages (SSR cache), the rest the trailing-slash 301 of the family
            const u = langs[(k * 7) % 10] + FAM_URL[f] + cities[k % 6] + (real ? '' : '/');
            const ua = k % 5 === 0 ? 'Probe' + (k % 1000) + 'Bot/1.' + (k % 7) + ' (+https://example.net/bot)' : vbrowser(k);
            const cc = k % 10 === 7 ? String.fromCharCode(65 + k % 26, 66 + (k >> 5) % 24) : 'SG';   // 90 % SG
            const h = { host: 'timesprayers.com', 'user-agent': ua, 'cf-connecting-ip': (11 + (k % 200)) + '.' + (((k / 200) | 0) % 250) + '.' + ((k * 7) % 250) + '.' + (1 + k % 250),
                'cf-ray': RAY, 'cf-ipcountry': cc, accept: 'text/html' };
            const r = await new Promise((res) => {
                const q = http.request({ host: '127.0.0.1', port, path: u, method: k % 10 === 0 ? 'HEAD' : 'GET', headers: h, agent }, (x) => { x.resume(); x.on('end', () => res(x.statusCode)); });
                q.setTimeout(60000, () => q.destroy(new Error('timeout'))); q.on('error', () => res(0)); q.end();
            });
            st[r] = (st[r] || 0) + 1; done++; if (r) { fam++; if (!isPublic4(h['cf-connecting-ip'])) unatt++; else if (cc === 'SG') sg++; }
        }
    };
    const t0 = Date.now();
    await Promise.all(Array.from({ length: conc }, one));
    agent.destroy();
    return { n: done, fam, sg, unatt, st, ms: Date.now() - t0 };
}
const procMax = (srv, from) => { let heap = 0, rss = 0; for (const l of srv.lines.slice(from)) if (l.startsWith('[proc] {')) { const p = JSON.parse(l.slice(7)); heap = Math.max(heap, p.heapUsed); rss = Math.max(rss, p.rss); } return { heap, rss }; };
async function sectionB(S) {
    section('[B] bounded under a burst of 50,000 requests (90 % SG)');
    const env = { ...EDGE, TP_MOON_LOAD_OBS_WINDOW_S: '15', TP_MOON_LOAD_OBS_PROC_S: '5' };
    [S.burst, S.burstoff] = await Promise.all([boot(ROOT, PORT.burst, 'burst', env), boot(ROOT, PORT.burstoff, 'burstoff', { ...env, TP_PAGE_SRC_OBS: '0' })]);
    const res = {};
    for (const [name, srv] of [['on', S.burst], ['off', S.burstoff]]) {
        const from = srv.lines.length;
        const b = await burst(srv.port, 50000, 48);
        await flushes(srv, srv.lines.length, 1, 40000);
        const proc = procMax(srv, from);
        // the worker idle ~16 s after its flush: the [proc] line then shows what stays after the burst
        const idle0 = srv.lines.length;
        await sleep(16000);
        const pl = srv.lines.slice(idle0).filter((l) => l.startsWith('[proc] {')).map((l) => JSON.parse(l.slice(7)));
        const last = pl[pl.length - 1] || {};
        res[name] = { ...b, from, proc, after: { heap: last.heapUsed, rss: last.rss } };
        info(name + ': ' + b.n + ' requests (' + b.sg + ' SG answered) in ' + b.ms + ' ms, statuses ' + JSON.stringify(b.st) + ', [proc] during the burst max heapUsed ' + proc.heap + ' MB, rss ' + proc.rss
            + ' MB; idle after it heapUsed ' + last.heapUsed + ' MB, rss ' + last.rss + ' MB');
    }
    const W = windows(psJson(S.burst, res.on.from));
    const metas = W.map((w) => w.meta);
    const totalN = W.reduce((s, w) => s + sumN(w.rows), 0), totalM = metas.reduce((s, m) => s + m.total, 0), totalU = metas.reduce((s, m) => s + m.unattested, 0);
    ok('B', res.on.fam === 50000 && totalN === res.on.sg && totalM === res.on.fam && totalU === res.on.unatt,
        'n preserved over ' + W.length + ' windows: sum of n = the ' + res.on.sg + ' edge-attested SG requests answered, sum of meta.total = the ' + res.on.fam + ' family requests, sum of meta.unattested = the '
        + res.on.unatt + ' with a non-public cf-connecting-ip', totalN + ' / ' + totalM + ' / ' + totalU);
    ok('B', W.length > 0 && metas.every((m) => m.keys <= 1500 + 10 && m.pfx <= 4096 && m.ua_cache <= 2000 && m.tokens <= 300),
        'every window within its caps: keys <= 1,500 (+ <= 10 overflow rows), prefixes <= 4,096, User-Agent cache <= 2,000, tokens <= 300',
        JSON.stringify(metas.map((m) => [m.total, m.keys, m.pfx, m.ua_cache, m.tokens, m.compact, m.ovf])));
    ok('B', metas.some((m) => m.compact > 0 || m.ovf > 0) && metas.some((m) => m.pfx_full > 0 || m.pfx === 4096) && metas.some((m) => m.ua_ovf > 0) && metas.some((m) => m.tokens === 300),
        'the cap paths were taken: compaction / overflow rows, the prefix table full, User-Agent cache overflow, the token table at 300');
    ok('B', W.every((w) => w.rows.length <= 150 + 2 * 5 * 21 && w.lines.every((o) => o.rows.length <= 60)), 'emitted rows per window <= 150 + one rest row per hour x family x declared', W.map((w) => w.rows.length).join(','));
    const lineMax = Math.max(0, ...psLines(S.burst, res.on.from).map((l) => Buffer.byteLength(l)));
    ok('B', lineMax <= 8192, 'longest [page-src] line under the burst <= 8 KB', String(lineMax));
    const dHeap = res.on.proc.heap - res.off.proc.heap, dAfter = res.on.after.heap - res.off.after.heap;
    // reported, not asserted: process-level figures move by tens of MB with GC timing alone (see the measure script)
    info('[proc] ON - OFF under the same burst: max heapUsed ' + dHeap + ' MB, max rss ' + (res.on.proc.rss - res.off.proc.rss) + ' MB; idle after the burst heapUsed '
        + dAfter + ' MB, rss ' + (res.on.after.rss - res.off.after.rss) + ' MB (process-level, GC-timing dependent: reported only)');
    // in-process: the state held at the cap, the transient peak and what stays (a fresh --expose-gc child)
    let j = null;
    try { j = JSON.parse(execFileSync(process.execPath, ['--expose-gc', fileURLToPath(import.meta.url), '--mem-child'], { encoding: 'utf8', env: { ...process.env } }).trim().split('\n').pop()); }
    catch (e) { ok('B', false, 'in-process memory child ran', String(e.stderr || e.message)); }
    if (j) {
        info('in-process, 50,000 records (90 % SG) with every cap reached: held at the cap ' + j.held_at_cap_kb + ' KB, peak during the batch ' + j.transient_peak_kb
            + ' KB (incl. the request objects this test builds; the block alone: the measure script [H]), after the flush ' + j.after_flush_kb + ' KB, tables ' + JSON.stringify(j.tables) + ', emitted rows ' + j.rows);
        ok('B', j.tables.keys <= 1510 && j.tables.ua_cache === 2000 && j.tables.prefixes === 4096 && j.tables.tokens === 300 && j.meta && j.meta.pfx_full > 0 && j.n === j.sg && j.meta.total === 50000
            && j.meta.unattested === j.unatt, 'in-process: tables at their caps (keys <= 1,510, User-Agent cache 2,000, prefixes 4,096, tokens 300); sum of n = the attested SG records, meta.total 50,000, meta.unattested = the non-public ones', JSON.stringify(j));
        ok('B', j.held_at_cap_kb <= 2048 && j.after_flush_kb <= 256, 'in-process: window state held at the cap <= 2 MB, <= 256 KB after the flush', j.held_at_cap_kb + ' / ' + j.after_flush_kb + ' KB');
    }
    killSrv(S.burst); killSrv(S.burstoff);
}

// ---- [K] switches and end ----
async function sectionK(S) {
    section('[K] switches, end date, clamp, [crawl-src] expired, no edge trust');
    const soon = new Date(Date.now() + 75000).toISOString();   // past the parallel boot, then ~1 minute of requests
    [S.expired, S.expiring, S.mloff, S.csexp, S.clamp, S.noedge] = await Promise.all([
        boot(ROOT, PORT.expired, 'expired', { ...EDGE, TP_PAGE_SRC_OBS_UNTIL: '2020-01-01' }),
        boot(ROOT, PORT.expiring, 'expiring', { ...EDGE, TP_PAGE_SRC_OBS_UNTIL: soon, TP_MOON_LOAD_OBS_WINDOW_S: '10' }),
        boot(ROOT, PORT.mloff, 'mloff', { ...EDGE, TP_MOON_LOAD_OBS: '0' }),
        boot(ROOT, PORT.csexp, 'csexp', { ...EDGE, TP_CRAWL_SOURCE_OBS_UNTIL: '2020-01-01', TP_MOON_LOAD_OBS_WINDOW_S: '10' }),
        boot(ROOT, PORT.clamp, 'clamp', { ...EDGE, TP_PAGE_SRC_OBS_UNTIL: '2027-01-01' }),
        boot(ROOT, PORT.noedge, 'noedge', { TP_MOON_LOAD_OBS_WINDOW_S: '10' })]);
    const h = { host: 'timesprayers.com', 'user-agent': UA.gbot, 'cf-connecting-ip': '66.249.66.7', 'cf-ray': RAY, 'cf-ipcountry': 'SG' };
    // the other servers first (each then waits for its own next flush)
    const at = {};
    for (const [name, n] of [['expired', 20], ['mloff', 20], ['csexp', 6], ['clamp', 3], ['noedge', 4]]) {
        for (let i = 0; i < n; i++) await rawGet(S[name].port, '/ms/qibla-in-makkah/', { h });
        at[name] = S[name].lines.length;
    }
    const waits = Promise.all(['expired', 'csexp', 'noedge', 'clamp'].map((k) => flushes(S[k], at[k], 1, 40000)));
    // the expiring server: requests before the end, then after it
    const fromE = S.expiring.lines.length;
    let before = 0;
    info('expiring server: end at ' + soon + ', ' + Math.round((Date.parse(soon) - Date.now()) / 1000) + ' s from now');
    while (Date.now() < Date.parse(soon) - 3000) { await rawGet(PORT.expiring, '/es/prayer-times-in-makkah/', { h }); before++; await sleep(150); }
    await sleep(Math.max(0, Date.parse(soon) - Date.now()) + 1500);
    for (let i = 0; i < 20; i++) await rawGet(PORT.expiring, '/es/prayer-times-in-makkah/', { h });
    await Promise.all([flushes(S.expiring, S.expiring.lines.length, 1, 30000), waits]);
    const ex = anyPs(S.expired);
    ok('K', ex.length === 1 && /^\[page-src\] worker=1 EXPIRED until=2020-01-01 /.test(ex[0]), 'end date in the past: exactly one EXPIRED line, no ENABLED / WARN line, no rows', ex.join(' | '));
    const exp2 = anyPs(S.expiring).filter((l) => / EXPIRED /.test(l));
    const W = windows(psJson(S.expiring, fromE));
    const nRows = W.reduce((s, w) => s + sumN(w.rows), 0);
    ok('K', exp2.length === 1 && nRows === before && before > 0, 'end reached mid-run: rows only for the ' + before + ' requests before it, one EXPIRED line, nothing after', nRows + ' rows-n vs ' + before + ' before; ' + exp2.join(' | '));
    ok('K', anyPs(S.mloff).length === 0, 'TP_MOON_LOAD_OBS=0 (the listener page-src rides on): no [page-src] line at all');
    const ce = S.csexp.lines.filter((l) => /^\[crawl-src\] worker=\d+ EXPIRED/.test(l)), pe = S.csexp.lines.filter((l) => /^\[page-src\] worker=\d+ ENABLED/.test(l));
    const cw = windows(psJson(S.csexp));
    ok('K', ce.length === 1 && pe.length === 1 && / ranges=2026-10-10 /.test(pe[0]) && / ops=/.test(pe[0]) && cw.length > 0 && cw.every((w) => w.rows.length > 0 && w.rows.every((r) => r[C.ver] === 'v')),
        '[crawl-src] expired: [page-src] still ENABLED, loads the range snapshot itself, verifies Googlebot (ver v)', ce.concat(pe).join(' | '));
    const cl = anyPs(S.clamp);
    const clEn = cl.filter((l) => / ENABLED /.test(l)), clW = cl.filter((l) => / WARN /.test(l));
    ok('K', clEn.length === 1 && / until=2026-10-23\(clamped\) /.test(clEn[0]) && clW.length === 1
        && clW[0] === '[page-src] worker=1 WARN TP_PAGE_SRC_OBS_UNTIL later than the hard end, using 2026-10-23T00:00Z' && !cl.some((l) => /2027/.test(l)),
        'a later end date (2027-01-01) is clamped to 2026-10-23 (no extension) with one fixed WARN line that does not print the value', cl.filter((l) => !l.startsWith('[page-src] {')).join(' | '));
    const nw = windows(psJson(S.noedge));
    ok('K', nw.length > 0 && nw.every((w) => w.meta.edge_trust === 0 && w.rows.length === 0 && w.meta.unattested === w.meta.total && w.meta.total > 0),
        'no edge trust (no RENDER, no test flag) + forged cf-connecting-ip / cf-ray / cf-ipcountry SG: meta only (total = unattested), no row', JSON.stringify(nw.map((w) => [w.meta.total, w.meta.unattested, w.rows.length])));
    for (const k of ['expired', 'expiring', 'mloff', 'csexp', 'clamp', 'noedge']) killSrv(S[k]);
}

// ---- [W] two workers, an unreadable end date ----
async function sectionW(S) {
    section('[W] two workers, TP_PAGE_SRC_OBS_UNTIL unreadable');
    S.two = await boot(ROOT, PORT.two, 'two', { ...EDGE, TP_MOON_LOAD_OBS_WINDOW_S: '10', TP_PAGE_SRC_OBS_UNTIL: '2026-13-45-garbage@x' }, 2);
    const from = S.two.lines.length;
    let sent = 0;
    const agent = new http.Agent({ keepAlive: false });
    await Promise.all(Array.from({ length: 8 }, async (_, c) => { for (let i = 0; i < 50; i++) { const r = await rawGet(PORT.two, '/es/next-prayer-in-cairo/', { h: { host: 'timesprayers.com', 'user-agent': UA.chrome, 'cf-connecting-ip': '203.0.113.' + (c + 1), 'cf-ray': RAY, 'cf-ipcountry': 'SG' }, agent }); if (r.st) sent++; } }));
    await flushes(S.two, S.two.lines.length, 2, 30000);
    const W = windows(psJson(S.two, from));
    const ws = new Set(W.map((w) => w.w));
    ok('W', W.reduce((s, w) => s + sumN(w.rows), 0) === sent && sent === 400, 'per-worker rows sum to the ' + sent + ' requests sent', JSON.stringify(W.map((w) => [w.w, sumN(w.rows)])));
    const warn = S.two.lines.filter((l) => /^\[page-src\] worker=\d+ WARN/.test(l)), en = S.two.lines.filter((l) => /^\[page-src\] worker=\d+ ENABLED/.test(l));
    ok('W', warn.length === 2 && new Set(warn.map((l) => /worker=(\d+)/.exec(l)[1])).size === 2 && warn.every((l) => /^\[page-src\] worker=\d+ WARN invalid TP_PAGE_SRC_OBS_UNTIL, using 2026-10-23T00:00Z$/.test(l))
        && en.length === 2 && en.every((l) => / until=2026-10-23 /.test(l)) && !S.two.lines.some((l) => /garbage|2026-13-45/.test(l)),
        'an unreadable TP_PAGE_SRC_OBS_UNTIL: one fixed WARN line per worker (2), the default end 2026-10-23, the value printed nowhere', warn.concat(en.map((l) => l.slice(0, 60))).join(' | '));
    info('workers that answered: ' + [...ws].join(','));
    killSrv(S.two);
}

// ---- [U] in-process ----
function sectionU() {
    section('[U] in-process');
    // hour split inside one window
    const realNow = Date.now;
    try {
        const api = loadBlock({ ...EDGE });
        api.start();
        const mk = (ip) => ({ method: 'GET', socket: {}, headers: { 'user-agent': UA.chrome, 'cf-connecting-ip': ip, 'cf-ray': RAY, 'cf-ipcountry': 'SG' } });
        const T = Date.parse('2026-10-20T10:59:59.900Z');
        Date.now = () => T; api._psRecord(mk('203.0.113.1'), 0, '/es/prayer-times-in-makkah', '2xx', 10);
        Date.now = () => T + 200; api._psRecord(mk('203.0.113.2'), 0, '/es/prayer-times-in-makkah', '2xx', 10);
        Date.now = () => T + 2 * 3600000; api._psRecord(mk('203.0.113.3'), 0, '/es/prayer-times-in-makkah', '2xx', 10);
        Date.now = realNow;
        api._psFlush('w');
        const w = api.rows()[0];
        const hours = w ? w.rows.map((r) => r[C.hour] + ':' + r[C.n]).sort().join(',') : '';
        ok('U', hours === '2026-10-20T10:1,2026-10-20T11:2' && w.meta.hr_late === 1, 'one window across 10:59:59.9 / 11:00:00.1 -> rows for both UTC hours; a request two hours on goes to the second hour and counts hr_late', hours + ' ' + JSON.stringify(w && w.meta));
    } finally { Date.now = realNow; }
    // end date parsing: shorter values kept, later ones clamped to the hard end, unreadable ones -> the default (+ warn)
    const U = (v) => loadBlock({ TP_PAGE_SRC_OBS_UNTIL: v }).PS_UNTIL;
    const cases = [['2026-10-21T06:30:00Z', Date.parse('2026-10-21T06:30:00Z'), ''], ['2026-10-21', Date.parse('2026-10-21T00:00:00Z'), ''], ['2026-10-23', Date.parse('2026-10-23T00:00:00Z'), ''],
        ['2026-10-23T00:00:01Z', Date.parse('2026-10-23T00:00:00Z'), 'clamped'], ['2026-11-01', Date.parse('2026-10-23T00:00:00Z'), 'clamped'], ['2027-01-01', Date.parse('2026-10-23T00:00:00Z'), 'clamped'],
        ['garbage', Date.parse('2026-10-23T00:00:00Z'), 'invalid'], ['2026-02-30', Date.parse('2026-10-23T00:00:00Z'), 'invalid'], ['2026-10-2x', Date.parse('2026-10-23T00:00:00Z'), 'invalid'],
        ['2026-10-22Tnope', Date.parse('2026-10-23T00:00:00Z'), 'invalid'], [undefined, Date.parse('2026-10-23T00:00:00Z'), ''], ['  ', Date.parse('2026-10-23T00:00:00Z'), '']];
    const ub = cases.map(([v, ms, warn]) => { const u = U(v); return (u.ms === ms && u.warn === warn && (warn === 'clamped') === !!u.clamped && (warn ? u.label === '2026-10-23' : true)) ? null : JSON.stringify(v) + ' -> ' + JSON.stringify(u); }).filter(Boolean);
    ok('U', ub.length === 0, 'TP_PAGE_SRC_OBS_UNTIL: an earlier date / time kept; 2026-10-23 itself kept; anything later -> 2026-10-23 (clamped); unreadable (garbage, 2026-02-30, ...) -> 2026-10-23 with warn "invalid"; unset / blank -> 2026-10-23, no warn', ub.join(' | '));
    {   // the WARN line in-process: fixed text, never the value
        const a = loadBlock({ ...EDGE, TP_PAGE_SRC_OBS_UNTIL: 'zelda.quorn@x' }); a.start();
        const b = loadBlock({ ...EDGE, TP_PAGE_SRC_OBS_UNTIL: '2099-12-31' }); b.start();
        const wa = a.logs.filter((l) => / WARN /.test(l)), wb = b.logs.filter((l) => / WARN /.test(l));
        ok('U', wa.length === 1 && wa[0] === '[page-src] worker=1 WARN invalid TP_PAGE_SRC_OBS_UNTIL, using 2026-10-23T00:00Z' && wb.length === 1 && /later than the hard end, using 2026-10-23T00:00Z$/.test(wb[0])
            && !a.logs.concat(b.logs).some((l) => /zelda|2099/.test(l)), 'the WARN line (invalid / clamped): one fixed line per start, the value nowhere', wa.concat(wb).join(' | '));
    }
    ok('U', loadBlock({ TP_PAGE_SRC_OBS: 'off' }).PS_ON === false && loadBlock({ TP_PAGE_SRC_OBS: '0' }).PS_ON === false && loadBlock({ TP_PAGE_SRC_OBS: '1' }).PS_ON === true && loadBlock({}).PS_ON === true,
        'TP_PAGE_SRC_OBS: off / 0 -> OFF, 1 / unset -> ON');
    // edge attestation matrix: rows only when attested (and SG); otherwise meta.unattested
    const mx = [[{ RENDER: 'true' }, 1], [{ RENDER: 'TRUE' }, 1], [{ TP_CRAWL_SOURCE_EDGE_TEST: '1' }, 1], [{}, 0], [{ RENDER: 'true', TP_TRUSTED_PROXY: 'none' }, 0], [{ TP_CRAWL_SOURCE_EDGE_TEST: '1', TP_TRUSTED_PROXY: 'none' }, 0]];
    const mxBad = [];
    for (const [env, want] of mx) {
        const api = loadBlock({ RENDER: undefined, TP_CRAWL_SOURCE_EDGE_TEST: undefined, TP_TRUSTED_PROXY: undefined, ...env });
        api.start();
        api._psRecord({ method: 'GET', socket: { remoteAddress: '127.0.0.1' }, headers: { 'user-agent': UA.gbot, 'cf-connecting-ip': '66.249.66.3', 'cf-ray': RAY, 'cf-ipcountry': 'SG' } }, 1, '/qibla-in-makkah', '2xx', 5);
        api._psRecord({ method: 'GET', socket: { remoteAddress: '127.0.0.1' }, headers: { 'user-agent': UA.gbot, 'cf-connecting-ip': '::ffff:66.249.66.4', 'cf-ray': RAY, 'cf-ipcountry': 'SG' } }, 1, '/qibla-in-makkah', '2xx', 5);
        api._psFlush('w');
        const w = api.rows()[0];
        const r = w && w.rows.length === 1 ? w.rows[0] : null;
        const good = want ? (r && r[C.ver] === 'v' && r[C.country] === 'SG' && r[C.prefix] === '*' && r[C.n] === 2 && r[C.pfx] === 1 && w.meta.unattested === 0)
            : (w && w.rows.length === 0 && w.meta.unattested === 2 && w.meta.total === 2);
        if (!good) mxBad.push(JSON.stringify(env) + ' -> ' + JSON.stringify(w && [w.meta, w.rows]));
    }
    ok('U', mxBad.length === 0, 'edge attestation: RENDER=true or the test flag (with TP_TRUSTED_PROXY=cloudflare) -> a row (verified, SG, the /24 of the IPv4-mapped form too); without them or with TP_TRUSTED_PROXY=none -> no row, meta.unattested', mxBad.join(' | '));
    // TP_PAGE_SRC_MIN_N: floor 5 (a smaller value falls back to the default 5)
    const mn = ['2', '4', '5', '7', 'x', undefined].map((v) => loadBlock({ TP_PAGE_SRC_MIN_N: v }).MIN_N);
    ok('U', JSON.stringify(mn) === JSON.stringify([5, 5, 5, 7, 5, 5]), 'TP_PAGE_SRC_MIN_N: 2 -> 5, 4 -> 5, 5 -> 5, 7 -> 7, garbage / unset -> 5 (floor 5)', JSON.stringify(mn));
    // the IPv6 /32 cut on every row, the row threshold on every row, and 'pseudo'
    {
        const api = loadBlock({ ...EDGE });
        api.start();
        const R = (ua, ip, fi, extra = {}) => api._psRecord({ method: 'GET', socket: {}, headers: { 'user-agent': ua, 'cf-connecting-ip': ip, 'cf-ray': RAY, 'cf-ipcountry': 'SG', ...extra } }, fi, '/ms/prayer-times-in-makkah', '2xx', 5);
        for (let i = 1; i <= 6; i++) R(UA.chrome, '2a02:c7c:' + (0x100 + i).toString(16) + ':' + i + '::1', 0);   // browser: 6 /48s of one /32 -> '2a02:c7c::/32' shown
        for (let i = 1; i <= 5; i++) R('', '2a02:c7d:' + (0x200 + i).toString(16) + '::1', 1);                  // unknown (no User-Agent): /32 shown
        for (let i = 1; i <= 5; i++) R(UA.apple, '2a03:2880:f00' + i + ':1::1', 2);                               // Applebot (a crawler): 5 /48s of one /32 -> the /32 shown
        for (let i = 1; i <= 4; i++) R(UA.apple, '2a03:2881:f001:' + i + '::1', 3);                               // Applebot: one /32, 4 requests -> '*' (row < 5)
        for (let i = 1; i <= 5; i++) R(UA.py, '45.9.9.' + i, 3);                                                  // python-requests: 5 from one /24 -> shown
        R(UA.gbot, '45.9.9.7', 3);                                                                                // Googlebot: 1 request of that same /24 (count 6) -> '*' (row < 5)
        R(UA.chrome, '240.10.20.30', 4); R(UA.gbot, '255.1.2.3', 4); R(UA.py, '45.9.8.9', 4, { 'cf-connecting-ipv6': '2001:db8:99::5' });   // pseudo x3
        api._psFlush('w');
        const w = api.rows()[0];
        const g = (fam, d, pf) => w && w.rows.find((r) => r[C.family] === fam && r[C.declared] === d && r[C.prefix] === pf);
        const a = g('prayer-city', 'browser', '2a02:c7c::/32'), b = g('qibla-city', 'unknown', '2a02:c7d::/32'), c = g('next-prayer-city', 'applebot', '2a03:2880::/32'), d = g('time-left-city', 'applebot', '*');
        const e = g('time-left-city', 'other-bot', '45.9.9.0/24'), f = g('time-left-city', 'googlebot', '*');
        const ps = w ? w.rows.filter((r) => r[C.family] === 'prayer-country').map((r) => r[C.declared] + ':' + r[C.prefix] + ':' + r[C.n] + ':' + r[C.pfx]).sort() : [];
        ok('U', a && a[C.n] === 6 && b && b[C.n] === 5 && c && c[C.n] === 5 && c[C.pfx] === 1 && d && d[C.n] === 4 && e && e[C.n] === 5 && f && f[C.n] === 1 && w.meta.pseudo === 3
            && JSON.stringify(ps) === JSON.stringify(['browser:pseudo:1:0', 'googlebot:pseudo:1:0', 'other-bot:pseudo:1:0']) && !w.rows.some((r) => /::\/48$/.test(r[C.prefix])),
            'IPv6 /32 on every row (browser, unknown and crawler alike; no /48 anywhere); a row below 5 requests folds into "*" whatever its class (Applebot 4, Googlebot 1 of a 6-request /24); 240.0.0.0/4 and cf-connecting-ipv6 -> "pseudo"',
            JSON.stringify(w && w.rows.map((r) => r.slice(1, 9).concat([r[C.n], r[C.pfx]]))) + ' ' + JSON.stringify(w && w.meta));
    }
    // a User-Agent longer than 512 characters: classified from its first 512 characters, cached like any other
    {
        const api = loadBlock({ ...EDGE });
        api.start();
        let long = UA.chrome + ' ';
        while (long.length < 15990) long += 'abcdefghij klmnopqrstu vwxyz ';
        long = long.slice(0, 15990) + ' Googlebot';
        for (let i = 1; i <= 5; i++) api._psRecord({ method: 'GET', socket: {}, headers: { 'user-agent': long, 'cf-connecting-ip': '203.0.113.' + i, 'cf-ray': RAY, 'cf-ipcountry': 'SG' } }, 0, '/es/prayer-times-in-makkah', '2xx', 5);
        const cached = api._psUa.size;
        api._psFlush('w');
        const w = api.rows()[0];
        const r = w && w.rows.length === 1 ? w.rows[0] : null;
        ok('U', cached === 1 && r && r[C.declared] === 'browser' && r[C.token] === CH && r[C.n] === 5 && w.meta.ua_cache === 1 && w.meta.ua_ovf === 0,
            'a 16,000-character User-Agent, 5 requests: one User-Agent cache entry (its first 512 characters read; "Googlebot" past them not seen -> browser)',
            'cached ' + cached + ' ' + JSON.stringify(w && w.rows.map((x) => x.slice(3, 10))) + ' ' + JSON.stringify(w && w.meta));
    }
}

// ---- [Z] the offline analyser over the harvested lines of the [F] and [B] servers ----
function sectionZ(S) {
    section('[Z] offline analyser');
    const srvs = ['counts', 'burst'].map((k) => S[k]).filter(Boolean);
    if (!srvs.length) { info('no [F] / [B] server lines (sections skipped)'); return; }
    const f1 = path.join(TMP, 'harvest-1.log'), f2 = path.join(TMP, 'harvest-2.log'), js = path.join(TMP, 'an.json'), js2 = path.join(TMP, 'an2.json');
    const ls = srvs.flatMap((s) => s.lines.filter((l) => l.startsWith('[page-src]')));
    // a Render-style prefix on every line, as the log view shows them
    fs.writeFileSync(f1, ls.map((l) => 'Oct 19 11:00:00 AM [abcde] ' + l).join('\n'));
    const rowLines = ls.filter((l) => l.startsWith('[page-src] {'));
    fs.writeFileSync(f2, rowLines.slice(0, Math.max(1, Math.ceil(rowLines.length / 2))).join('\r\n'));   // an overlapping second harvest
    const objs = srvs.flatMap((s) => psJson(s));
    const Wall = srvs.flatMap((s) => windows(psJson(s)));
    const want = Wall.reduce((a, w) => a + sumN(w.rows), 0), wantT = Wall.reduce((a, w) => a + w.meta.total, 0), wantU = Wall.reduce((a, w) => a + w.meta.unattested, 0);
    let a = null, b = null, txt = '';
    try {
        txt = execFileSync(process.execPath, [path.join(ROOT, 'scripts', '_analyze_page_src_obs_1.mjs'), f1, '--json', js], { encoding: 'utf8' });
        execFileSync(process.execPath, [path.join(ROOT, 'scripts', '_analyze_page_src_obs_1.mjs'), f1, f2, '--json', js2], { encoding: 'utf8' });
        a = JSON.parse(fs.readFileSync(js, 'utf8')); b = JSON.parse(fs.readFileSync(js2, 'utf8'));
    } catch (e) { ok('Z', false, 'the analyser ran', String(e.stderr || e.message)); return; }
    ok('Z', a.total_requests === want && a.meta_totals.total === wantT && a.meta_totals.unattested === wantU && a.meta_totals.other_attested === wantT - wantU - want
        && a.completeness.complete === a.completeness.windows && a.completeness.mismatched.length === 0,
        'analyser: SG rows ' + want + ' = the sum of n; meta.total ' + wantT + ', unattested ' + wantU + ', other attested = total - unattested - rows; every window complete (all parts, rows <= total - unattested)',
        JSON.stringify(a.completeness) + ' ' + JSON.stringify(a.meta_totals));
    ok('Z', b.total_requests === a.total_requests && b.duplicates > 0, 'an overlapping second harvest is de-duplicated (boot / worker / seq / part)', b.duplicates + ' duplicates');
    const sg = a.hours.reduce((s, h) => s + h.pattern, 0);
    ok('Z', sg >= 10, 'the SG Chrome-on-Windows pattern of the [F] mix is found (' + sg + ' requests)', txt.split('\n').slice(0, 6).join(' / '));
    // meta.ua_ovf, meta.tokens, meta.pseudo; per hour the 'overflow' token, the key-cap overflow rows, the pseudo and v6x rows
    const m0 = objs.filter((o) => o.part === 0).map((o) => o.meta);
    const want2 = { ua_ovf: m0.reduce((s, m) => s + m.ua_ovf, 0), tokens_max: Math.max(0, ...m0.map((m) => m.tokens)), pseudo: m0.reduce((s, m) => s + m.pseudo, 0) };
    const rowsAll = objs.flatMap((o) => o.rows);
    const nOf = (f) => rowsAll.filter(f).reduce((s, r) => s + r[C.n], 0);
    const wantH = { tok_overflow: nOf((r) => r[C.token] === 'overflow'), keycap_overflow: nOf((r) => r[C.declared] === 'overflow'), pseudo: nOf((r) => r[C.prefix] === 'pseudo'), v6x: nOf((r) => r[C.prefix] === 'v6x') };
    const gotH = Object.fromEntries(Object.keys(wantH).map((k) => [k, a.hours.reduce((s, h) => s + h[k], 0)]));
    ok('Z', a.meta_sums.ua_ovf === want2.ua_ovf && want2.ua_ovf > 0 && a.meta_sums.tokens_max === want2.tokens_max && a.meta_sums.pseudo === want2.pseudo && want2.pseudo >= 2
        && JSON.stringify(gotH) === JSON.stringify(wantH) && wantH.pseudo >= 2 && wantH.v6x >= 1 && wantH.tok_overflow > 0
        && /meta sums: User-Agent cache overflow \(ua_ovf\) \d+/.test(txt) && /t\.ovf +kc\.ovf +pseudo +v6x/.test(txt) && !/rare|idlike/.test(txt),
        'analyser: meta.ua_ovf (' + want2.ua_ovf + '), meta.tokens (max ' + want2.tokens_max + '), meta.pseudo (' + want2.pseudo + '); per hour the "overflow" token, key-cap overflow, pseudo and v6x rows ' + JSON.stringify(wantH) + '; no rare / idlike',
        JSON.stringify(a.meta_sums) + ' ' + JSON.stringify(gotH));
    // the 'overflow' token column with a known non-zero value: one in-process window of 2,005 distinct browser
    //   User-Agents -> 2,000 cached, the last 5 beyond the User-Agent cache -> token 'overflow', meta.ua_ovf 5
    const ib = loadBlock({ ...EDGE });
    ib.start();
    for (let i = 0; i < 2005; i++) ib._psRecord({ method: 'GET', socket: {}, headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.' + i + '.1 Safari/537.36',
        'cf-connecting-ip': '198.51.100.' + (1 + i % 200), 'cf-ray': RAY, 'cf-ipcountry': 'SG' } }, 0, '/es/prayer-times-in-makkah', '2xx', 5);
    ib._psFlush('w');
    const f3 = path.join(TMP, 'harvest-3.log'), js3 = path.join(TMP, 'an3.json');
    fs.writeFileSync(f3, ib.logs.filter((l) => l.startsWith('[page-src]')).join('\n'));
    let c3 = null, t3 = '';
    try { t3 = execFileSync(process.execPath, [path.join(ROOT, 'scripts', '_analyze_page_src_obs_1.mjs'), f3, '--json', js3], { encoding: 'utf8' }); c3 = JSON.parse(fs.readFileSync(js3, 'utf8')); } catch (e) { t3 = String(e.stderr || e.message); }
    const o3 = c3 ? c3.hours.reduce((s, h) => s + h.tok_overflow, 0) : -1;
    ok('Z', c3 && c3.total_requests === 2005 && c3.meta_sums.ua_ovf === 5 && c3.meta_sums.ua_ovf_windows === 1 && o3 === 5 && c3.overflow_tokens.some((x) => x[0] === 'browser | overflow' && x[1] === 5),
        'analyser, a window past the User-Agent cache (2,005 distinct browsers): meta.ua_ovf 5 and 5 requests in the per-hour "overflow" token column', t3.split('\n').slice(0, 4).join(' / '));
}

// ---- [M] / [X] the diff and the file ----
function sectionMX() {
    section('[M] moon measurement not widened; [X] the file');
    const cand = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8'), base = fs.readFileSync(path.join(BASE_ROOT, 'server.js'), 'utf8');
    const cl = cand.split('\r\n'), bl = base.split('\r\n');
    let i = 0; const ins = [];
    for (let j = 0; j < cl.length; j++) { if (i < bl.length && cl[j] === bl[i]) i++; else ins.push(cl[j]); }
    const b0 = cl.findIndex((l) => l.startsWith('// PAGE-SOURCE-OBSERVABILITY-1 (SG-TRAFFIC-INVESTIGATION-1'));
    const b1 = cl.findIndex((l) => l.startsWith('function _psStart('));
    let b2 = b1; while (cl[b2] !== '}') b2++;
    const blockLines = cl.slice(b0 - 1, b2 + 1);
    const hooks = ins.filter((l) => /_PS_ON|PAGE-SOURCE-OBSERVABILITY-1: who requests/.test(l) && !blockLines.includes(l));
    const other = ins.filter((l) => !blockLines.includes(l) && !hooks.includes(l) && l !== '');
    ok('M', i === bl.length, 'the candidate server.js = the production server.js + inserted lines only (every production line kept, in order)', 'matched ' + i + '/' + bl.length);
    ok('M', other.length === 0 && hooks.length === 4, 'every inserted line is the page-src block or its hooks (_mlRecord comment + call, _mlFlush, _mlStartTimers)', JSON.stringify(other.slice(0, 3)) + ' hooks ' + hooks.length);
    const famLine = (s) => (s.match(/^const _CS_FAMS = .*$/m) || [''])[0], untilDef = (s) => (s.match(/return \{ label: '2026-11-15'.*$/m) || [''])[0];
    ok('M', famLine(cand) === famLine(base) && famLine(cand) !== '' && untilDef(cand) === untilDef(base) && untilDef(cand) !== '', '[crawl-src] families and default end are unchanged');
    const crs = (cand.match(/\r/g) || []).length, lfs = (cand.match(/\n/g) || []).length;
    ok('X', crs === lfs && !/\r(?!\n)/.test(cand), 'server.js stays CRLF in the working tree: one CR per line', crs + ' CR / ' + lfs + ' LF');
    let chk = '';
    try { execFileSync(process.execPath, ['--check', path.join(ROOT, 'server.js')], { stdio: 'pipe' }); } catch (e) { chk = String(e.stderr || e.message); }
    ok('X', chk === '', 'node --check server.js', chk);
}

async function main() {
    console.log('PAGE-SOURCE-OBSERVABILITY-1 smoke -- ' + ROOT + ' (production tree ' + BASE_ROOT + ') -- UTC ' + new Date().toISOString());
    const S = {};
    const run = async (name, fn) => { if (SKIP.has(name)) { info('section ' + name + ' skipped (TP_SMOKE_SKIP)'); return; } try { await fn(S); } catch (e) { ok(name, false, 'unexpected error', e && e.stack || String(e)); } };
    await run('I', sectionI);
    await run('F', sectionF);
    await run('R', sectionR);
    await run('K', sectionK);
    await run('W', sectionW);
    await run('B', sectionB);
    await run('U', sectionU);
    await run('M', sectionMX);
    await run('Z', sectionZ);
    sectionP(Object.values(S));
    section('[N] outbound guard');
    const outs = kids.map((k) => [k.tag, fs.existsSync(k.guardOut) ? fs.readFileSync(k.guardOut, 'utf8').trim() : '']).filter((x) => x[1]);
    ok('N', outs.length === 0, 'no connection, DNS or fetch attempt left the machine (' + kids.length + ' servers)', JSON.stringify(outs).slice(0, 400));
    for (const k of kids) killSrv(k);
    console.log('\nsections: ' + Object.entries(SEC).map(([k, v]) => k + ' ' + v.pass + '/' + (v.pass + v.fail)).join(', '));
    console.log('RESULT: ' + pass + ' passed, ' + fail + ' failed');
    if (fail) { console.log('FAILURES:\n  ' + fails.join('\n  ')); }
    try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (_) {}
    process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error(e); for (const k of kids) killSrv(k); process.exit(2); });
