// CRAWL-SOURCE-OBSERVABILITY-1 — acceptance smoke (HTTP, 127.0.0.1 only, no production, no download).
//
// Owner directive under test (2026-10-16): READ AND MEASURE ONLY. A bounded, aggregated measurement of who requests the
// early 410 / 404 gate answers (moon-gone, hijri-gone, hijri-cal-gone, hijri-cal-future) and the moon month / year pages
// (moon-month, moon-year, every outcome), logged as [crawl-src] lines per worker window. Nothing may change a response.
// Sections
//   [I]  response identity: a fixed URL list × header sets × GET/HEAD (+ br/gzip) — status, headers (date and nonces
//        masked) and body byte-identical between the base tree (production main + the Hijri range commit), the
//        candidate and the kill switch (TP_CRAWL_SOURCE_OBS=0); a base-vs-base determinism gate first.
//   [C]  exact counts (edge trust on: TP_CRAWL_SOURCE_EDGE_TEST=1, every request with a cf-ray unless it tests its
//        absence): a known mix with crafted headers (Googlebot inside / outside the fixture google-common list, IPv4 +
//        IPv6, without a cf-ray, from x-forwarded-for, behind a private cf-connecting-ip, Bingbot, GPTBot, Applebot (no
//        list loaded), PerplexityBot (no list loaded), DuckDuckBot (a list only the snapshot names), OAI-SearchBot from a
//        gptbot-only IP, AdsBot-Google, meta-externalagent,
//        GoogleOther, FooCrawler, python-requests, browsers with full / partial / no sec-fetch headers, an empty UA,
//        pseudo-IPv4, countries, HEAD + GET, referer classes, repeated vs distinct URLs, aborted requests) → every
//        [crawl-src] row: declared vs ver, bcls, prefixes only at n >= MIN_N, '*' folding, outcomes, methods, referer /
//        encoding classes, the distinct-URL HyperLogLogs (+ an offline register merge), repeat ratios, top paths,
//        per-minute rate, city x date, the UA-token table and its samples; review fixes: no sample for a browser-shaped
//        User-Agent filed as a bot (CUBOT phone, Pinterest in-app), the operator claim of a long User-Agent ('x', not
//        'na'), seo / social product tokens, a declared browser's small row folded into '*' next to a hot crawler /24,
//        query-string counts + cache-key registers, the uurl per-source registers, the yr year-offset table, the header
//        boot / seq / ts, and the [moon-load] agent classes unchanged by reusing the crawl-src declared name.
//   [W]  two workers: per-worker rows sum to what was sent; the base64 registers of both workers merge offline into
//        one distinct-URL estimate; Space-Saving keeps the heavy path inside its error bound.
//   [K]  the key cap (test-only TP_CRAWL_SOURCE_TEST_MAX_KEYS=6): cold prefixes compact into '*'; beyond that, one
//        'overflow' row per family; the UA-token table caps at 300 (+ one overflow row per declared class); n preserved.
//   [E]  expiry: TP_CRAWL_SOURCE_OBS_UNTIL in the past → one EXPIRED line, no rows; a mid-run expiry → rows only for
//        what came before it, one EXPIRED line.
//   [R]  ranges: file absent → ranges=none / null, 'ranges_error=absent', meta.ranges_state 'absent' and every claim 'err'
//        ('na' without a claim) even from an edge-attested source; a malformed file → 'ranges_error=unreadable', every
//        claim 'err' (also without edge trust: 'err' comes before 'u'); the yr table decodes 'err'.
//   [V]  owner conditions 2026-10-17 -- source reliability and list meanings:
//        (1) a server WITHOUT edge trust (no RENDER, no TP_CRAWL_SOURCE_EDGE_TEST) given forged cf-connecting-ip + cf-ray
//            from listed crawler IPs → 'u' for every claim ('na' without one), meta.edge_trust 0, meta.unattested = the
//            claims; (2) edge trust but no cf-ray → 'u' and (3) edge trust + cf-ray but the IP from x-forwarded-for (no /
//            a private cf-connecting-ip) → 'u' (both in the [C] mix and in-process); the edge-attestation matrix in-process
//            (RENDER=true, the test stand-in, TP_TRUSTED_PROXY=none); (4) each claim against ITS crawler's list, not the
//            company's: Googlebot from a google-user-only IP → 'x', AdsBot-Google from google-special → 'v', GoogleOther
//            from google-common → 'v', OAI-SearchBot from a gptbot-only IP → 'x', ChatGPT-User from its own list → 'v', a
//            named crawler without a list (meta-externalagent, ClaudeBot, ...) → 'np', a /32 exactly and its neighbours,
//            IPv6 inside a list in compressed and expanded form; (5) the yr table and the src rows decode all six ver
//            values ('na','v','x','np','u','err'), also at a high token index (the 3-bit ver field).
//        Every verified-identity expectation runs with TP_CRAWL_SOURCE_EDGE_TEST=1 AND a cf-ray header.
//   [S]  forced shed (TP_MOON_DAY_SHED on, burst 1): the client's 503 / 200 counts equal the moon-month shed / 2xx counts.
//   [O]  switches: TP_CRAWL_SOURCE_OBS=0 and TP_MOON_LOAD_OBS=0 → no [crawl-src] line at all.
//   [P]  privacy: no full client IPv4 / IPv6, query string, referer value, cookie / authorization / accept-language
//        value or raw browser UA in any emitted line; samples <= 160 chars and only for non-browser tokens; every
//        [crawl-src] line <= 8 KB and <= 60 rows.
//   [U]  in-process (the block extracted from server.js with the functions it calls): the client-IP fast path returns
//        exactly getClientIp(req) for public / private / malformed / IPv6 / port / mapped forms, both proxy modes; the
//        country index round-trips; _csBotWord returns exactly the regex match (random + corpus strings); _csRecord
//        returns exactly _obsAgent(ua); beyond the 2,000-entry User-Agent cache a new User-Agent keeps its declared name
//        and ver, goes to '<declared>|overflow' (meta.ua_ovf) and costs a few microseconds, not tens.
//   [Z]  the offline analyser over the harvested lines of the counts + two-worker servers (twice: boot / seq dedupe).
//   [X]  server.js stays CRLF (one CR per line) and passes node --check; data/crawler-ip-ranges.json has the per-crawler
//        format: a date, a 'lists' block with each list's sources (https) and publisher creationTime, the ten list keys
//        the server maps claims to (none becomes a User-Agent substring), every CIDR valid, and the server loads it with
//        no skipped entry.
//   [N]  outbound guard: no connection, DNS or fetch attempt left the machine.
// Usage: node scripts/_smoke_crawl_source_obs_1.mjs   (env TP_BASE_ROOT = the base checkout, TP_GUARD = the guard)
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import net from 'node:net';
import zlib from 'node:zlib';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_ROOT = process.env.TP_BASE_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-hijrirange';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const SITE = 'https://timesprayers.com';
const PORT = { base: 8701, base2: 8713, cand: 8702, kill: 8703, counts: 8704, two: 8705, cap: 8706, expired: 8707, expiring: 8708,
    noranges: 8709, badranges: 8710, shed: 8711, mloff: 8712, noedge: 8714 };
// edge trust for the verified-identity servers (the test-only stand-in for RENDER=true) and the cf-ray they need
const EDGE = { TP_CRAWL_SOURCE_EDGE_TEST: '1' };
const RAY = '8c0d3f2a1b4e5f67-AMS';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-crawlsrc-'));
let pass = 0, fail = 0; const fails = []; const SEC = {};
function ok(label, cond, name, detail) {
    const s = SEC[label] || (SEC[label] = { pass: 0, fail: 0 });
    const n = '[' + label + '] ' + name;
    if (cond) { pass++; s.pass++; console.log('  ✓ ' + n); }
    else { fail++; s.fail++; fails.push(n + (detail ? ' :: ' + detail : '')); console.log('  ✗ ' + n + (detail ? '  :: ' + String(detail).slice(0, 600) : '')); }
}
const info = (s) => console.log('  · INFO ' + s);
const section = (s) => console.log('\n-- ' + s + ' --');
const pad = (n) => String(n).padStart(2, '0');

// ---- the synthetic range snapshot (never downloaded: written here, passed by TP_CRAWL_RANGES_FILE) ----
// The per-crawler format of data/crawler-ip-ranges.json: one list per crawler (disjoint here, so a claim matched against
//   another crawler's list of the same company shows up as 'x'); apple and perplexity-bot are absent (their claims: 'np');
//   duckduckbot is a list key only the snapshot names (its key becomes the claim).
const FIXTURE = path.join(TMP, 'crawler-ip-ranges.fixture.json');
const FIX_OPS = {
    'google-common': ['66.249.64.0/19', '2001:4860:4801:10::/64', 'not-a-cidr', '1.2.3.4/33'],
    'google-special': ['108.177.2.0/24', '2001:4860:4801:2008::/64'],
    'google-user': ['74.125.208.0/24', '2001:4860:4801:4004::/64'],
    'bing': ['157.55.39.0/24', '40.77.167.0/24'],
    'openai-gptbot': ['20.171.206.0/24'],
    'openai-searchbot': ['20.42.10.176/28'],
    'openai-chatgpt-user': ['23.98.142.176/28'],
    'perplexity-user': ['3.224.62.45/32', '18.97.21.0/30'],
    'duckduckbot': ['20.191.45.0/24'],
};
fs.writeFileSync(FIXTURE, JSON.stringify({ date: '2026-10-10',
    lists: Object.fromEntries(Object.keys(FIX_OPS).map((k) => [k, { sources: ['https://example.invalid/' + k + '.json'], creationTime: ['2026-10-10T00:00:00.000000'] }])),
    operators: FIX_OPS }));
const BADFILE = path.join(TMP, 'crawler-ip-ranges.bad.json');
fs.writeFileSync(BADFILE, '{ this is not json');
const NOFILE = path.join(TMP, 'no-such-dir', 'crawler-ip-ranges.json');

// ---- servers ----
const kids = [];
const rawGet = (port, p, { method = 'GET', h = {}, timeout = 120000 } = {}) => new Promise((res) => {
    const r = http.request({ host: '127.0.0.1', port, path: p, method, headers: h, agent: false }, (x) => {
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
        TP_MOON_DAY_SHED: '0', TP_MOON_LOAD_OBS_WINDOW_S: '10', TP_SSR_CACHE: '1', TP_REQUEST_OBSERVABILITY: '1', NODE_ENV: 'production',
        SITE_URL: SITE, GUARD_OUT: guardOut }, extra);
    const k = spawn(process.execPath, ['-r', GUARD, 'server.js'], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
    const srv = { tag, port, root, k, guardOut, lines: [], buf: '' };
    const take = (d) => { srv.buf += d.toString('utf8'); let i; while ((i = srv.buf.indexOf('\n')) !== -1) { srv.lines.push(srv.buf.slice(0, i).replace(/\r$/, '')); srv.buf = srv.buf.slice(i + 1); } };
    k.stdout.on('data', take); k.stderr.on('data', take);
    kids.push(srv);
    for (let i = 0; i < 400; i++) { if ((await rawGet(port, '/health', { timeout: 3000 })).st === 200) break; await sleep(400); if (i === 399) throw new Error('boot failed ' + tag); }
    // every worker up (its ENABLED / EXPIRED / moon-load line printed)
    for (let i = 0; i < 100; i++) { if (srv.lines.filter((l) => /^\[moon-load\] worker=\d+ ENABLED/.test(l)).length >= workers || extra.TP_MOON_LOAD_OBS === '0') break; await sleep(200); }
    return srv;
}
const killSrv = (srv) => { try { execFileSync('taskkill', ['/PID', String(srv.k.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} };
const csLines = (srv, from = 0) => srv.lines.slice(from).filter((l) => l.startsWith('[crawl-src] {'));
const csJson = (srv, from = 0) => csLines(srv, from).map((l) => JSON.parse(l.slice(12)));
// wait until `n` new [moon-load] window lines (one per worker per window) appeared after index `from`
async function flushes(srv, from, n, timeoutMs = 40000) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
        if (srv.lines.slice(from).filter((l) => l.startsWith('[moon-load] {') && /"part":0/.test(l)).length >= n) return true;
        await sleep(150);
    }
    return false;
}
// windows: per worker, a 'src' part-0 line opens a window; every line of that worker until the next one belongs to it
function windows(objs) {
    const out = [], cur = {};
    for (const o of objs) {
        if (o.t === 'src' && o.part === 0) { cur[o.w] = { w: o.w, meta: o.meta, src: [], fam: [], rate: [], cd: [], top: [], tok: [], uurl: [], yr: [], lines: [] }; out.push(cur[o.w]); }
        const W = cur[o.w]; if (!W) continue;
        W[o.t].push(...o.rows); W.lines.push(o);
    }
    return out;
}
// src column indexes
const SC = {}; 'family,declared,token,ver,bcls,country,prefix,n,2xx,3xx,4xx,gone,shed,abort,5xx,avg_ms,max_ms,lt25,lt50,lt100,lt200,lt300,lt500,lt1000,lt2000,lt5000,ge5000,urls,ips,max_min,max_min_lb,get,head,other,ref_none,ref_self,ref_search,ref_other,enc_br,enc_gzip,enc_none,pseudo,keys,qs'.split(',').forEach((c, i) => { SC[c] = i; });
const srcKey = (r) => r.slice(0, 7).join('|');
// HyperLogLog (the server's estimator) over a merged register array — the offline merge recipe
function hllEst(reg) {
    const m = reg.length; let s = 0, z = 0;
    for (let i = 0; i < m; i++) { s += Math.pow(2, -reg[i]); if (reg[i] === 0) z++; }
    const a = m === 16 ? 0.673 : m === 32 ? 0.697 : m === 64 ? 0.709 : 0.7213 / (1 + 1.079 / m);
    let e = a * m * m / s;
    if (e <= 2.5 * m && z > 0) e = m * Math.log(m / z);
    else if (e > 143165576.53) e = -4294967296 * Math.log(1 - e / 4294967296);
    return Math.round(e);
}
const regsOf = (b64) => new Uint8Array(zlib.inflateRawSync(Buffer.from(b64, 'base64')));
function mergeRegs(list) { const m = new Uint8Array(2048); for (const r of list) for (let i = 0; i < 2048; i++) if (r[i] > m[i]) m[i] = r[i]; return m; }
function mergeRegs6(list) { const m = new Uint8Array(64); for (const r of list) for (let i = 0; i < 64; i++) if (r[i] > m[i]) m[i] = r[i]; return m; }

// ---- the block, extracted from server.js with the functions it calls, for in-process checks ----
function loadBlock(env = {}, con = null) {
    const lines = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8').split(/\r?\n/);
    const fnAt = (name) => { const i = lines.findIndex((l) => l.startsWith('function ' + name + '(')); let j = i; while (lines[j] !== '}') j++; return lines.slice(i, j + 1).join('\n'); };
    const constAt = (name) => {
        const i = lines.findIndex((l) => l.startsWith('const ' + name + ' '));
        let j = i, depth = 0;
        for (;;) { for (const ch of lines[j]) { if ('([{'.includes(ch)) depth++; else if (')]}'.includes(ch)) depth--; } if (depth <= 0 && /;\s*(\/\/.*)?$/.test(lines[j])) break; j++; }
        return lines.slice(i, j + 1).join('\n');
    };
    const b0 = lines.findIndex((l) => l.startsWith('// CRAWL-SOURCE-OBSERVABILITY-1 (owner directive'));
    const b1 = lines.findIndex((l, i) => i > b0 && l.startsWith('// MOON-DAY-PAGES-REMOVAL-1 (2026-10-13)'));
    const code = [constAt('_TP_TRUSTED_PROXY'), constAt('_RE_IPV4_TEXT'), fnAt('_normIpText'), fnAt('_isNonPublicIpText'), fnAt('getClientIp'),
        constAt('_OBS_NAMED_BOTS'), fnAt('_obsAgent'), constAt('_shedEnvInt'), constAt('_ML_AGENT_CLASS'), constAt('_ML_EDGES'), constAt('_ML_BUCKET_COLS'), lines.slice(b0, b1 - 1).join('\n')].join('\n');
    const saved = {}; for (const [k, v] of Object.entries(env)) { saved[k] = process.env[k]; process.env[k] = v; }
    try {
        // eslint-disable-next-line no-new-func
        return new Function('require', 'process', 'console', 'fs', 'path', 'zlib', 'ROOT', 'performance', '_ML_ON', '_ML_WINDOW_S', 'TP_WORKER_ID', '_OBS_WTAG',
            code + '\nreturn { getClientIp, _csClientIp, ip4: () => _csIp4, _csParse4, _csCountryIdx, _csCountryStr, _csBotWord, _obsAgent, _csRecord, _csFlush, _csStart, _csEdgeAttested, OPS0: _CS_OPS.slice(), edgeTrust: _CS_EDGE_TRUST };')(createRequire(import.meta.url), process, con || { log() {} }, fs, path, zlib, ROOT, performance, true, 300, 1, ' worker=1');
    } finally { for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; } }
}

// ---- user agents ----
const UA = {
    gbot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    bing: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    gpt: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)',
    apple: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)',
    pplx: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
    ddg: 'DuckDuckBot/1.1; (+http://duckduckgo.com/duckduckbot.html)',
    oai: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot',
    gother: 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36 (compatible; GoogleOther)',
    foo: 'FooCrawler/1.0 (+https://foo.example/bot; ' + 'x'.repeat(200) + ')',
    py: 'python-requests/2.31.0',
    chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    firefox: 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
    safari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    abort: 'AbortProbe/1.0',
    // browser-shaped User-Agents that _obsAgent files under a bot class ('bot' in a phone model; Pinterest in-app browser)
    cubot1: 'Mozilla/5.0 (Linux; Android 10; CUBOT_X30 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.80 Mobile Safari/537.36',
    cubot2: 'Mozilla/5.0 (Linux; Android 11; CUBOT KINGKONG 5 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Mobile Safari/537.36',
    pin: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [Pinterest/iOS]',
    ahrefs: 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)',
    semrush: 'Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)',
    gbotlong: 'Mozilla/5.0 (Linux; Android 14; ' + 'Q'.repeat(240) + ') (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',   // the claim after character 256
    safmac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    adsbot: 'AdsBot-Google (+http://www.google.com/adsbot.html)',
    meta: 'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
    cgpt: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
    pplxu: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)',
    feed: 'FeedFetcher-Google; (+http://www.google.com/feedfetcher.html)',
    mpg: 'Mediapartners-Google',
    claude: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
};
// distinctive pieces of every BROWSER-SHAPED User-Agent sent (none may appear in any emitted line)
const BROWSER_BITS = ['Windows NT 10.0; Win64; x64', 'rv:121.0', 'iPhone OS 17_0', 'Nexus 5X Build/MMB29P', 'Chrome/120.0.0.0', 'Firefox/121.0', 'Mobile/15E148',
    'CUBOT_X30', 'QP1A.190711.020', 'CUBOT KINGKONG', 'Pinterest/iOS', 'iPhone OS 16_6', 'Intel Mac OS X 10_15_7', 'Chrome/118.0.5993.80', 'Chrome/117.0.0.0'];
// the [moon-load] agent classes of the declared names used here (server.js _ML_AGENT_CLASS)
const ML_CLASS = { googlebot: 'google', bingbot: 'bing', gptbot: 'ai', perplexitybot: 'ai', applebot: 'apple', 'known-seo-crawler': 'seo', 'known-social-bot': 'social',
    'other-bot': 'other-bot', browser: 'browser', unknown: 'unknown' };
const FAM_COLS = 'family,outcome,n,avg_ms,max_ms,lt25,lt50,lt100,lt200,lt300,lt500,lt1000,lt2000,lt5000,ge5000,get,head,other,urls,repeat,regs_p11_deflateraw_b64,qs,keys,key_repeat,key_regs_p11_deflateraw_b64';
const FC = {}; FAM_COLS.split(',').forEach((c, i) => { FC[c] = i; });
const regsOf32 = (s) => Uint8Array.from(String(s), (c) => parseInt(c, 32));
const yoff = (y) => { const d = y - new Date().getUTCFullYear(); return d < -5 ? '<-5' : d > 5 ? '>+5' : d > 0 ? '+' + d : String(d); };
const SECRETS = ['qsecret', 'refsecret', 'refpath', 'example.org', 'SECRETLANG', 'tp_secret_cookie', 'abc123', 'topsecret', 'utm_source', 'Bearer', RAY, '8c0d3f2a1b4e5f67'];
const CLIENT_IPS = new Set();

// The exact-count mix: [group, n, method, headers(i), url(i), expected source key]
const FULL = { 'sec-fetch-mode': 'navigate', 'sec-fetch-dest': 'document', 'sec-fetch-site': 'cross-site', 'accept-language': 'ar,en;q=0.8',
    accept: 'text/html,application/xhtml+xml,*/*;q=0.8', 'sec-ch-ua': '"Chromium";v="120"', 'accept-encoding': 'gzip, deflate, br' };
const v6g = (i) => '2001:4860:4801:10::' + (i + 1).toString(16);
const MIX = [
    ['G1', 25, 'GET', (i) => ({ 'user-agent': UA.gbot, 'cf-connecting-ip': '66.249.66.' + (i + 1), 'cf-ipcountry': 'US', 'accept-encoding': 'gzip, deflate, br' }),
        (i) => '/moon/saudi-arabia/riyadh/2026/10/' + pad(i + 1), 'moon-gone|googlebot|-|v|-|US|66.249.66.0/24'],
    ['G2', 3, 'GET', () => ({ 'user-agent': UA.gbot, 'cf-connecting-ip': '203.0.113.7', 'cf-ipcountry': 'DE' }),
        (i) => '/hijri-date/1446-05-' + pad([1, 1, 2][i]), 'hijri-gone|googlebot|-|x|-|DE|*'],
    ['G3', 21, 'GET', (i) => ({ 'user-agent': UA.gbot, 'cf-connecting-ip': v6g(i), 'cf-ipcountry': 'US' }),
        (i) => '/moon/saudi-arabia/riyadh/2026/10/' + pad((i % 10) + 1), 'moon-gone|googlebot|-|v|-|US|2001:4860:4801::/48'],
    ['G4', 4, 'HEAD', () => ({ 'user-agent': UA.bing, 'cf-connecting-ip': '157.55.39.5', 'cf-ipcountry': 'us' }),
        (i) => ['/hijri-calendar/1446', '/hijri-calendar/1446-01', '/hijri-calendar/1446-02', '/en/hijri-calendar/1445'][i], 'hijri-cal-gone|bingbot|-|v|-|US|*'],
    ['G5a', 5, 'GET', () => ({ 'user-agent': UA.gpt, 'cf-connecting-ip': '20.171.206.9', 'cf-ipcountry': 'US' }),
        (i) => '/hijri-date/1446-05-' + pad(3 + i), 'hijri-gone|gptbot|-|v|-|US|*'],
    ['G5b', 2, 'GET', () => ({ 'user-agent': UA.gpt, 'cf-connecting-ip': '198.51.100.4', 'cf-ipcountry': 'US' }),
        (i) => '/hijri-date/1446-05-' + pad(8 + i), 'hijri-gone|gptbot|-|x|-|US|*'],
    ['G6', 3, 'GET', () => ({ 'user-agent': UA.apple, 'cf-connecting-ip': '17.58.1.1' }),
        (i) => ['/moon/saudi-arabia/riyadh/2026', '/moon/saudi-arabia/riyadh/2027', '/moon/saudi-arabia/riyadh/2040'][i], 'moon-year|applebot|-|np|-|??|*'],
    ['G7', 4, 'GET', () => ({ 'user-agent': UA.foo, 'cf-connecting-ip': '45.10.1.4', 'cf-ipcountry': 'zzz' }),
        (i) => ['/hijri-calendar/1451', '/hijri-calendar/1450-01', '/hijri-calendar/1450-02', '/hijri-calendar/1451?utm_source=qsecret'][i], 'hijri-cal-future|other-bot|foocrawler|na|-|??|*'],
    ['G8', 3, 'GET', () => ({ 'user-agent': UA.py, 'cf-connecting-ip': '45.10.2.5', 'cf-ipcountry': 'XX' }),
        (i) => ['/moon/saudi-arabia/riyadh/2026/01', '/moon/saudi-arabia/riyadh/2040/01', '/moon/egypt/riyadh/2026/10'][i], 'moon-month|other-bot|python-requests|na|-|XX|*'],
    ['G9', 6, 'GET', () => ({ 'user-agent': UA.chrome, 'cf-connecting-ip': '198.51.100.20', 'cf-ipcountry': 'SA', referer: 'https://www.google.com/search?q=refsecret', ...FULL }),
        () => '/moon/saudi-arabia/riyadh/2026/10', 'moon-month|browser|browser:chrome-120:windows|na|full+ch|SA|*'],
    ['G10', 4, 'GET', () => ({ 'user-agent': UA.firefox, 'cf-connecting-ip': '45.10.3.6' }),
        (i) => '/en/moon/saudi-arabia/riyadh/2026/09/' + pad(i + 1), 'moon-gone|browser|browser:firefox-121:linux|na|bare|??|*'],
    ['G11', 2, 'GET', (i, port) => ({ 'user-agent': UA.safari, 'cf-connecting-ip': '45.10.4.7', 'accept-language': 'xx-SECRETLANG', referer: 'http://127.0.0.1:' + port + '/moon' }),
        () => '/moon/saudi-arabia/riyadh/2026', 'moon-year|browser|browser:safari-17:ios|na|partial|??|*'],
    ['G12', 3, 'GET', () => ({ 'cf-connecting-ip': '45.10.5.8', referer: 'https://example.org/refpath', cookie: 'tp_secret_cookie=abc123', authorization: 'Bearer topsecret' }),
        (i) => '/hijri-calendar/1446-' + pad(3 + i), 'hijri-cal-gone|unknown|empty|na|-|??|*'],
    ['G13', 2, 'GET', () => ({ 'user-agent': UA.ddg, 'cf-connecting-ip': '20.191.45.3' }),
        (i) => '/fr/moon/egypt/cairo/2025/01/' + pad(i + 1), 'moon-gone|other-bot|duckduckbot|v|-|??|*'],
    ['G14', 2, 'GET', (i) => (i === 0 ? { 'user-agent': UA.chrome, 'cf-connecting-ip': '240.10.20.30', 'cf-connecting-ipv6': '2a02:1234:5678:9abc::1' } : { 'user-agent': UA.chrome, 'cf-connecting-ip': '240.10.20.31' }),
        (i) => '/hijri-date/1446-05-' + pad(10 + i), 'hijri-gone|browser|browser:chrome-120:windows|na|bare|??|*'],
    // OAI-SearchBot from an IP of the GPTBot list only: checked against ITS OWN list (openai-searchbot) -> x
    ['G15', 1, 'GET', () => ({ 'user-agent': UA.oai, 'cf-connecting-ip': '20.171.206.10' }), () => '/hijri-date/1446-05-12', 'hijri-gone|other-bot|oai-searchbot|x|-|??|*'],
    ['G16', 1, 'GET', () => ({ 'user-agent': UA.gother, 'cf-connecting-ip': '66.249.70.1' }), () => '/moon/saudi-arabia/al-ahsa/2026/11', 'moon-month|browser|googleother|v|bare|??|*'],
    ['G18', 1, 'GET', () => ({ 'user-agent': UA.pplx, 'cf-connecting-ip': '45.10.7.10' }), () => '/hijri-date/1446-05-13', 'hijri-gone|perplexitybot|-|np|-|??|*'],
    ['G19', 1, 'GET', () => ({ 'user-agent': UA.cubot1, 'cf-connecting-ip': '45.10.8.11', 'sec-fetch-mode': 'navigate', 'sec-fetch-dest': 'document', 'accept-language': 'en' }),
        () => '/moon/saudi-arabia/riyadh/2026/10/01', 'moon-gone|other-bot|mozilla|na|-|??|*'],
    ['G20', 1, 'GET', () => ({ 'user-agent': UA.cubot2, 'cf-connecting-ip': '45.10.8.12' }), () => '/moon/saudi-arabia/riyadh/2026/10/02', 'moon-gone|other-bot|cubot|na|-|??|*'],
    ['G21', 1, 'GET', () => ({ 'user-agent': UA.pin, 'cf-connecting-ip': '45.10.8.13' }), () => '/moon/saudi-arabia/riyadh/2026/10/03', 'moon-gone|known-social-bot|pinterest|na|-|??|*'],
    ['G22', 2, 'GET', () => ({ 'user-agent': UA.ahrefs, 'cf-connecting-ip': '45.10.8.14' }), (i) => '/hijri-date/1446-05-' + pad(1 + i), 'hijri-gone|known-seo-crawler|ahrefsbot|na|-|??|*'],
    ['G23', 1, 'GET', () => ({ 'user-agent': UA.semrush, 'cf-connecting-ip': '45.10.8.15' }), () => '/hijri-date/1446-05-03', 'hijri-gone|known-seo-crawler|semrushbot|na|-|??|*'],
    ['G24', 1, 'GET', () => ({ 'user-agent': UA.gbotlong, 'cf-connecting-ip': '203.0.113.9' }), () => '/hijri-date/1446-05-04', 'hijri-gone|googlebot|-|x|-|??|*'],
    // one Safari request from the hot Googlebot /24 (26 requests there): its own row has n 1 < MIN_N -> folded into '*'
    ['G25', 1, 'GET', () => ({ 'user-agent': UA.safmac, 'cf-connecting-ip': '66.249.66.250', 'cf-ipcountry': 'US' }), () => '/moon/saudi-arabia/riyadh/2026/10/04', 'moon-gone|browser|browser:safari-17:mac|na|bare|US|*'],
    // source reliability (owner condition 1): a listed Googlebot IP that is NOT edge-attested is never checked -> u
    //   G26 no cf-ray; G27 cf-ray but the IP only in x-forwarded-for; G29 cf-ray, a private cf-connecting-ip, the IP from x-forwarded-for
    ['G26', 1, 'GET', () => ({ 'user-agent': UA.gbot, 'cf-connecting-ip': '66.249.71.5' }), () => '/moon/saudi-arabia/riyadh/2026/11', 'moon-month|googlebot|-|u|-|??|*'],
    ['G27', 1, 'GET', () => ({ 'user-agent': UA.gbot, 'x-forwarded-for': '66.249.71.6' }), () => '/moon/saudi-arabia/riyadh/2025', 'moon-year|googlebot|-|u|-|??|*'],
    ['G28', 1, 'GET', () => ({ 'user-agent': UA.gbot, 'cf-connecting-ip': '203.0.113.20' }), () => '/moon/saudi-arabia/riyadh/2027/02', 'moon-month|googlebot|-|x|-|??|*'],
    ['G29', 1, 'GET', () => ({ 'user-agent': UA.gbot, 'cf-connecting-ip': '10.1.2.3', 'x-forwarded-for': '66.249.71.7' }), () => '/hijri-date/1446-05-14', 'hijri-gone|googlebot|-|u|-|??|*'],
    // a named crawler that publishes no list in the snapshot -> np (never na); AdsBot-Google against google-special -> v
    ['G30', 1, 'GET', () => ({ 'user-agent': UA.meta, 'cf-connecting-ip': '45.10.8.16' }), () => '/hijri-date/1446-05-15', 'hijri-gone|meta-external|-|np|-|??|*'],
    ['G31', 1, 'GET', () => ({ 'user-agent': UA.adsbot, 'cf-connecting-ip': '108.177.2.9' }), () => '/hijri-date/1446-05-16', 'hijri-gone|adsbot-google|-|v|-|??|*'],
];
const NO_RAY = new Set(['G26']);   // every other request carries a cf-ray (the counts server trusts the edge)
const ABORT = { n: 5, h: { 'user-agent': UA.abort, 'cf-connecting-ip': '45.10.6.9', 'accept-encoding': 'br', 'cf-ray': RAY }, url: (i) => '/moon/saudi-arabia/bisha/2026/0' + (i + 1),
    key: 'moon-month|unknown|abortprobe|na|-|??|*' };
const famOf = (u) => /^\/(?:[a-z]{2}\/)?hijri-date\//.test(u) ? 'hijri-gone' : /hijri-calendar\/145[01]/.test(u) ? 'hijri-cal-future' : /hijri-calendar\//.test(u) ? 'hijri-cal-gone'
    : /\/moon\/[a-z-]+\/[a-z-]+\/\d{4}\/\d{2}\/\d{2}$/.test(u) ? 'moon-gone' : /\/moon\/[a-z-]+\/[a-z-]+\/\d{4}\/\d{2}$/.test(u) ? 'moon-month' : 'moon-year';
const abortReq = (port, p, h) => new Promise((res) => {
    const r = http.request({ host: '127.0.0.1', port, path: p, method: 'GET', agent: false, headers: h });
    r.on('error', () => res('err')); r.on('response', (x) => { x.resume(); x.on('end', () => res('done')); });
    r.end(); setTimeout(() => { r.destroy(); res('aborted'); }, 2);
});
async function runMix(port) {
    const sent = [];
    const jobs = [];
    for (const [g, n, method, hf, uf, key] of MIX) for (let i = 0; i < n; i++) { const h = hf(i, port); if (!NO_RAY.has(g)) h['cf-ray'] = RAY; jobs.push({ g, method, h, u: uf(i), key }); }
    for (const j of jobs) for (const k of ['cf-connecting-ip', 'cf-connecting-ipv6', 'x-forwarded-for']) if (j.h[k]) CLIENT_IPS.add(j.h[k]);
    // concurrency 6, in order
    let next = 0;
    await Promise.all(Array.from({ length: 6 }, async () => {
        while (next < jobs.length) { const j = jobs[next++]; const r = await rawGet(port, j.u, { method: j.method, h: j.h }); sent.push({ ...j, st: r.st }); }
    }));
    CLIENT_IPS.add(ABORT.h['cf-connecting-ip']);
    const ab = [];
    for (let i = 0; i < ABORT.n; i++) ab.push(await abortReq(port, ABORT.url(i), ABORT.h));
    return { sent, ab };
}

// ---- [I] response identity ----
const ID_URLS = [
    '/moon/saudi-arabia/riyadh/2026/10/13', '/en/moon/saudi-arabia/riyadh/2026/10/14', '/fr/moon/egypt/cairo/2025/01/01', '/ur/moon/saudi-arabia/riyadh/today',
    '/moon-in-makkah/2026-10-13', '/de/moon-today-in-makkah', '/moon/saudi-arabia/riyadh/2026/10/13/', '/tr/moon/saudi-arabia/riyadh/2026/10/13?x=1',
    '/hijri-date/1446-05-10', '/en/hijri-date/1448-01-01', '/id/hijri-date/1440-09-01', '/hijri-date/1446-05-10.html',
    '/hijri-calendar/1446', '/en/hijri-calendar/1445-03', '/hijri-calendar/1451', '/fr/hijri-calendar/1450-02', '/hijri-calendar/1448', '/hijri-calendar/1448-05',
    '/moon/saudi-arabia/riyadh/2026/10', '/en/moon/saudi-arabia/riyadh/2027', '/moon/saudi-arabia/al-ahsa/2026/11', '/moon/saudi-arabia/riyadh/2040/01',
    '/moon/saudi-arabia/riyadh/2040', '/moon/egypt/riyadh/2026/10', '/es/moon/saudi-arabia/riyadh/2026/03', '/moon/saudi-arabia/zzqx-nocity/2026/10',
    '/prayer-times-in-cairo', '/en/prayer-times-in-riyadh', '/qibla-in-cairo', '/', '/en', '/moon', '/moon/saudi-arabia', '/moon/saudi-arabia/riyadh',
    '/today-hijri-date', '/css/style.css', '/js/app.js', '/robots.txt', '/health', '/api/place-by-slug?slug=riyadh', '/no-such-page-qa', '/sitemap.xml',
];
const ID_HEADERS = [
    ['browser', { 'user-agent': UA.chrome, ...FULL, 'accept-encoding': 'identity', 'cf-connecting-ip': '198.51.100.21', 'cf-ipcountry': 'SA', referer: 'https://www.google.com/' }],
    ['googlebot', { 'user-agent': UA.gbot, 'accept-encoding': 'identity', 'cf-connecting-ip': '66.249.66.200', 'cf-ipcountry': 'US', 'cf-ray': RAY }],
    ['no-ua', { 'accept-encoding': 'identity' }],
];
const maskBody = (b) => b.replace(/nonce="[^"]*"/g, 'nonce="N"').replace(/'nonce-[^']*'/g, "'nonce-N'")
    .replace(/(article:modified_time" content=")[^"]*/g, '$1T').replace(/("date(?:Modified|Published)":\s*")[^"]*/g, '$1T')
    .replace(/(id="current-time">)\d{1,2}:\d{2}(?::\d{2})?/g, '$1CLOCK').replace(/(id="next-prayer-countdown">)[\d:]+/g, '$1COUNTDOWN')
    .replace(/(\b(?:app|i18n)\.js\?v=\d+)&b=[0-9a-f]+/g, '$1&b=SHA').replace(/^(\{"status":"ok","ts":)\d+\}$/, '$1TS}');   // /health carries the clock
const maskHead = (h) => { const o = {}; for (const k of Object.keys(h).sort()) { if (k === 'date') continue; o[k] = String(h[k]).replace(/'nonce-[^']*'/g, "'nonce-N'"); } return JSON.stringify(o); };
const decode = (r) => { try { const e = r.h['content-encoding']; return e === 'br' ? zlib.brotliDecompressSync(r.raw) : e === 'gzip' ? zlib.gunzipSync(r.raw) : r.raw; } catch (_) { return r.raw; } };
const view = (r) => ({ st: r.st ? r.st : 'ERR:' + r.err, head: maskHead(r.h), body: maskBody(decode(r).toString('latin1')) });

async function main() {
    console.log('CRAWL-SOURCE-OBSERVABILITY-1 smoke — ' + ROOT + ' (base ' + BASE_ROOT + ') — UTC ' + new Date().toISOString());
    const S = {};
    try {
        [S.base, S.base2, S.cand, S.kill] = await Promise.all([
            boot(BASE_ROOT, PORT.base, 'base'), boot(BASE_ROOT, PORT.base2, 'base2'),
            // the candidate trusts the edge, so the identity traffic also runs the list lookups (a Googlebot request with a cf-ray)
            boot(ROOT, PORT.cand, 'cand', { TP_CRAWL_RANGES_FILE: FIXTURE, ...EDGE }), boot(ROOT, PORT.kill, 'kill', { TP_CRAWL_RANGES_FILE: FIXTURE, TP_CRAWL_SOURCE_OBS: '0', ...EDGE })]);

        section('[I] response identity: base vs candidate vs kill switch');
        for (const [, h] of ID_HEADERS) if (h['cf-connecting-ip']) CLIENT_IPS.add(h['cf-connecting-ip']);
        let n = 0, gateBad = [], candBad = [], killBad = [];
        const combos = [];
        for (const u of ID_URLS) for (const [hn, h] of ID_HEADERS) combos.push([u, hn, h, 'GET']);
        for (const u of ['/moon/saudi-arabia/riyadh/2026/10/13', '/hijri-date/1446-05-10', '/hijri-calendar/1446', '/hijri-calendar/1451', '/moon/saudi-arabia/riyadh/2026/10', '/en/moon/saudi-arabia/riyadh/2027', '/prayer-times-in-cairo'])
            combos.push([u, 'googlebot-head', ID_HEADERS[1][1], 'HEAD']);
        for (const u of ['/moon/saudi-arabia/riyadh/2026/10', '/hijri-calendar/1448', '/prayer-times-in-cairo', '/moon/saudi-arabia/riyadh/2026/10/13'])
            for (const enc of ['br', 'gzip']) combos.push([u, 'browser-' + enc, { ...ID_HEADERS[0][1], 'accept-encoding': enc }, 'GET']);
        // A transport error (no response at all, e.g. the sporadic loopback ECONNRESET on the 1 MB /js/app.js that every
        //   tree shows, base included) is retried up to 3 times: identity compares RESPONSES, and every response received
        //   is compared in full. The retries per server are reported.
        const retries = { base: 0, base2: 0, cand: 0, kill: 0 };
        const fetchV = async (name, port, u, o) => { let r = await rawGet(port, u, o); for (let t = 0; t < 3 && r.st === 0; t++) { retries[name]++; await sleep(200); r = await rawGet(port, u, o); } return view(r); };
        for (const [u, hn, h0, method] of combos) {
            const h = { ...h0, host: '127.0.0.1:8700' };
            const a = await fetchV('base', PORT.base, u, { method, h }), a2 = await fetchV('base2', PORT.base2, u, { method, h });
            const c = await fetchV('cand', PORT.cand, u, { method, h }), k = await fetchV('kill', PORT.kill, u, { method, h });
            n++;
            const same = (x, y) => x.st === y.st && x.head === y.head && x.body === y.body;
            const why = (x, y) => x.st !== y.st ? 'status ' + x.st + '/' + y.st : x.head !== y.head ? 'headers ' + x.head.slice(0, 300) + ' vs ' + y.head.slice(0, 300) : 'body differs (len ' + x.body.length + '/' + y.body.length + ')';
            if (!same(a, a2)) { gateBad.push(method + ' ' + u + ' [' + hn + '] ' + why(a, a2)); continue; }
            if (!same(a, c)) candBad.push(method + ' ' + u + ' [' + hn + '] ' + why(a, c));
            if (!same(a, k)) killBad.push(method + ' ' + u + ' [' + hn + '] ' + why(a, k));
        }
        info('transport retries (no response, retried): ' + JSON.stringify(retries));
        ok('I', gateBad.length === 0, 'determinism gate: base vs base identical after masking (' + n + ' requests)', gateBad.slice(0, 4).join(' | '));
        ok('I', candBad.length === 0, 'candidate == base: status + headers + body for ' + (n - gateBad.length) + ' requests (' + ID_URLS.length + ' URLs × 3 header sets, 7 HEAD, 8 br/gzip)', candBad.slice(0, 4).join(' | '));
        ok('I', killBad.length === 0, 'kill switch == base for the same requests', killBad.slice(0, 4).join(' | '));
        const st410 = (await rawGet(PORT.cand, '/hijri-date/1446-05-10')).st, st404 = (await rawGet(PORT.cand, '/hijri-calendar/1451')).st, stm = (await rawGet(PORT.cand, '/moon/saudi-arabia/riyadh/2026/10')).st;
        ok('I', st410 === 410 && st404 === 404 && stm === 200, 'sanity: hijri day 410, future calendar 404, moon month 200 on the candidate', st410 + '/' + st404 + '/' + stm);
        await flushes(S.cand, 0, 2);
        const cEn = S.cand.lines.filter((l) => /^\[crawl-src\] worker=\d+ ENABLED/.test(l));
        ok('I', cEn.length === 1 && /ranges=2026-10-10/.test(cEn[0]) && /google-common:1\+1-bad2/.test(cEn[0]) && /google-special:1\+1[ ,]/.test(cEn[0]) && /duckduckbot:1\+0/.test(cEn[0])
            && /perplexity-user:2\+0/.test(cEn[0]) && / edge_trust=1 /.test(cEn[0]) && /until=2026-11-15/.test(cEn[0]) && /min_n=20/.test(cEn[0]) && /max_keys=1500/.test(cEn[0]),
            'candidate: one ENABLED line — window, caps, until=2026-11-15, ranges=2026-10-10, per-crawler lists (google-common:1+1-bad2: 2 malformed CIDRs skipped, google-special, perplexity-user, duckduckbot), edge_trust=1', cEn.join(' | '));
        ok('I', csLines(S.cand).length > 0, 'candidate emitted [crawl-src] rows for the identity traffic', String(csLines(S.cand).length));
        ok('O', S.kill.lines.filter((l) => l.startsWith('[crawl-src]')).length === 0, 'kill switch TP_CRAWL_SOURCE_OBS=0: no [crawl-src] line at all (ENABLED or rows)',
            S.kill.lines.filter((l) => l.startsWith('[crawl-src]')).slice(0, 2).join(' | '));
        ok('O', S.kill.lines.some((l) => l.startsWith('[moon-load] {')), 'kill switch: [moon-load] still reports (only crawl-src is off)');
    } catch (e) { ok('run', false, 'unexpected error (identity)', e && e.stack || String(e)); }
    for (const k of ['base', 'base2', 'kill']) if (S[k]) killSrv(S[k]);

    // the other servers, booted together
    try {
        const T = Date.now();
        [S.counts, S.two, S.cap, S.expired, S.noranges, S.badranges, S.shed, S.mloff, S.noedge] = await Promise.all([
            boot(ROOT, PORT.counts, 'counts', { TP_CRAWL_RANGES_FILE: FIXTURE, TP_SSR_CACHE: '0', ...EDGE }),
            boot(ROOT, PORT.two, 'two', { TP_CRAWL_RANGES_FILE: FIXTURE, ...EDGE }, 2),
            boot(ROOT, PORT.cap, 'cap', { TP_CRAWL_RANGES_FILE: FIXTURE, TP_CRAWL_SOURCE_TEST_MAX_KEYS: '6' }),
            boot(ROOT, PORT.expired, 'expired', { TP_CRAWL_RANGES_FILE: FIXTURE, TP_CRAWL_SOURCE_OBS_UNTIL: '2020-01-01' }),
            boot(ROOT, PORT.noranges, 'noranges', { TP_CRAWL_RANGES_FILE: NOFILE, ...EDGE }),      // 'err' wins over an attested source
            boot(ROOT, PORT.badranges, 'badranges', { TP_CRAWL_RANGES_FILE: BADFILE }),            // ... and over an unattested one
            boot(ROOT, PORT.shed, 'shed', { TP_CRAWL_RANGES_FILE: FIXTURE, TP_MOON_DAY_SHED: '1', TP_MOON_DAY_SHED_BURST: '1', TP_MOON_DAY_SHED_PER_TICK: '1' }),
            boot(ROOT, PORT.mloff, 'mloff', { TP_CRAWL_RANGES_FILE: FIXTURE, TP_MOON_LOAD_OBS: '0' }),
            boot(ROOT, PORT.noedge, 'noedge', { TP_CRAWL_RANGES_FILE: FIXTURE }),                  // no RENDER, no TP_CRAWL_SOURCE_EDGE_TEST
        ]);
        info('booted 9 servers in ' + Math.round((Date.now() - T) / 1000) + ' s');
    } catch (e) { ok('run', false, 'unexpected error (boot)', e && e.stack || String(e)); }

    // ---- [C] exact counts ----
    try {
        section('[C] exact counts (1 worker, MIN_N 20, window 10 s, fixture ranges)');
        const srv = S.counts;
        let W = null, res = null, attempt = 0, from = 0;
        while (attempt < 3 && !W) {
            attempt++;
            // start right after a flush, so the mix lands in one window
            from = srv.lines.length; await flushes(srv, from, 1); from = srv.lines.length;
            const t0 = Date.now();
            res = await runMix(PORT.counts);
            const took = Date.now() - t0;
            await sleep(1500);
            await flushes(srv, from, 2);
            const ws = windows(csJson(srv, from)).filter((w) => w.meta && w.meta.total > 0);
            info('attempt ' + attempt + ': mix sent in ' + took + ' ms, recorded in ' + ws.length + ' window(s)');
            if (ws.length === 1) W = ws[0];
        }
        ok('C', !!W, 'the whole mix landed in one 10 s window (needed for the per-window prefix threshold)');
        if (W) {
            const sent = res.sent;
            const badSt = sent.filter((j) => { const f = famOf(j.u.split('?')[0]); return (f.endsWith('gone') && j.st !== 410) || (f === 'hijri-cal-future' && j.st !== 404); });
            ok('C', badSt.length === 0, 'every gone request answered 410 and every future calendar request 404', badSt.slice(0, 4).map((j) => j.u + ' ' + j.st).join(' | '));
            const rows = {}; for (const r of W.src) rows[srcKey(r)] = r;
            const want = {}; for (const j of sent) { const w = want[j.key] || (want[j.key] = { n: 0, st: {}, head: 0 }); w.n++; w.st[j.st] = (w.st[j.st] || 0) + 1; if (j.method === 'HEAD') w.head++; }
            const bad = [];
            for (const [k, w] of Object.entries(want)) {
                const r = rows[k];
                if (!r) { bad.push('missing ' + k); continue; }
                if (r[SC.n] !== w.n) bad.push(k + ' n ' + r[SC.n] + ' want ' + w.n);
                const o = { 200: '2xx', 301: '3xx', 404: '4xx', 410: 'gone' };
                for (const [st, c] of Object.entries(w.st)) if (r[SC[o[st]]] !== c) bad.push(k + ' ' + o[st] + ' ' + r[SC[o[st]]] + ' want ' + c);
                if (r[SC.head] !== w.head || r[SC.get] !== w.n - w.head) bad.push(k + ' method get/head ' + r[SC.get] + '/' + r[SC.head]);
            }
            ok('C', bad.length === 0, 'every group: its exact key (family|declared|token|ver|bcls|country|prefix), n, outcome counts and GET/HEAD split (' + Object.keys(want).length + ' keys)', bad.slice(0, 6).join(' | '));
            const gs = (k) => rows[k] || [];
            const verOf = Object.fromEntries(Object.keys(want).map((k) => [k.split('|')[0] + ':' + k.split('|')[1] + ':' + k.split('|')[2] + ':' + k.split('|')[6], k.split('|')[3]]));
            ok('C', Object.keys(want).every((k) => rows[k]) && ['v', 'x', 'np', 'na', 'u'].every((v) => Object.keys(want).some((k) => k.split('|')[3] === v)) && !W.src.some((r) => r[SC.ver] === 'err'),
                'declared vs VERIFIED kept apart (edge-attested + cf-ray): googlebot v (google-common v4 + v6) / x (not in the loaded list) / u (no cf-ray; IP from x-forwarded-for; private cf-connecting-ip), bingbot v, gptbot v / x, adsbot-google v (google-special), applebot np, perplexitybot np, meta-external np, duckduckbot v (snapshot list), oai-searchbot x (gptbot-only IP), GoogleOther (declared browser) v, others na; no err', JSON.stringify(verOf).slice(0, 400));
            ok('C', W.meta.edge_trust === 1 && W.meta.ranges_state === 'ok' && W.meta.unattested === 3,
                'meta: edge_trust 1, ranges_state ok, unattested 3 (the claims G26 no cf-ray, G27 x-forwarded-for, G29 private cf-connecting-ip)', JSON.stringify(W.meta));
            ok('C', gs('moon-month|browser|browser:chrome-120:windows|na|full+ch|SA|*')[SC.n] === 6 && gs('moon-gone|browser|browser:firefox-121:linux|na|bare|??|*')[SC.n] === 4
                && gs('moon-year|browser|browser:safari-17:ios|na|partial|??|*')[SC.n] === 2 && gs('moon-month|browser|googleother|v|bare|??|*')[SC.n] === 1,
                'browser header consistency: full+ch (sec-fetch + accept-language + text/html + sec-ch-ua), partial (accept-language only), bare (none) -- a label of the request headers only');
            const nonStar = W.src.filter((r) => r[SC.prefix] !== '*' && r[SC.prefix] !== '-').map((r) => r[SC.prefix]);
            ok('C', JSON.stringify([...new Set(nonStar)].sort()) === JSON.stringify(['2001:4860:4801::/48', '66.249.66.0/24']),
                'prefixes: only 66.249.66.0/24 (25 requests) and the IPv6 /48 2001:4860:4801::/48 (21) are emitted; every prefix below 20 is folded into *', JSON.stringify([...new Set(nonStar)]));
            ok('C', !W.src.some((r) => r[SC.declared] === 'browser' && r[SC.prefix] !== '*'), 'a declared browser\'s row needs MIN_N requests itself: the lone Safari request from the hot 66.249.66.0/24 is in * (G25)',
                JSON.stringify(W.src.filter((r) => r[SC.declared] === 'browser').map((r) => r.slice(0, 8))));
            ok('C', W.meta.total === sent.length + ABORT.n && W.src.reduce((s, r) => s + r[SC.n], 0) === sent.length + ABORT.n,
                'meta.total and the sum of n over the src rows = every request sent (' + (sent.length + ABORT.n) + ')', W.meta.total + ' / ' + W.src.reduce((s, r) => s + r[SC.n], 0));
            const ab = gs(ABORT.key);
            info('aborted requests: client ' + JSON.stringify(res.ab) + ' → row abort ' + ab[SC.abort] + ', 2xx ' + ab[SC['2xx']]);
            ok('C', ab[SC.n] === ABORT.n && ab[SC.abort] + ab[SC['2xx']] === ABORT.n && ab[SC.abort] >= 1, 'aborted moon-month requests: outcome abort (or 2xx when the render beat the 2 ms close), n = 5', JSON.stringify(ab.slice(7, 15)));
            const g1 = gs('moon-gone|googlebot|-|v|-|US|66.249.66.0/24');
            ok('C', g1[SC.enc_br] === 25 && g1[SC.ref_none] === 25 && g1[SC.pseudo] === 0 && g1[SC.keys] === 1 && g1[SC.max_min_lb] === 0, 'G1 row: 25 br, 25 no referer, no pseudo, one key, exact per-minute max', JSON.stringify(g1.slice(31)));
            ok('C', Math.abs(g1[SC.urls] - 25) <= 25 * 0.3 && Math.abs(g1[SC.ips] - 25) <= 25 * 0.45, 'G1 row: distinct URLs (HLL p=6) ≈ 25 and distinct IPs (salted HLL p=5) ≈ 25 within 3σ', g1[SC.urls] + ' / ' + g1[SC.ips]);
            const g9 = gs('moon-month|browser|browser:chrome-120:windows|na|full+ch|SA|*');
            ok('C', g9[SC.ref_search] === 6 && g9[SC.enc_br] === 6 && g9[SC.urls] === 1, 'G9 row: referer class search ×6 (Google), br ×6, one distinct URL (6 repeats)', JSON.stringify(g9.slice(27)));
            const g11 = gs('moon-year|browser|browser:safari-17:ios|na|partial|??|*'), g12 = gs('hijri-cal-gone|unknown|empty|na|-|??|*'), g10 = gs('moon-gone|browser|browser:firefox-121:linux|na|bare|??|*');
            ok('C', g11[SC.ref_self] === 2 && g12[SC.ref_other] === 3 && g10[SC.enc_none] === 4 && g10[SC.ref_none] === 4, 'referer classes self (same host) / other, encoding class none', [g11[SC.ref_self], g12[SC.ref_other], g10[SC.enc_none]].join(','));
            const g14 = gs('hijri-gone|browser|browser:chrome-120:windows|na|bare|??|*');
            ok('C', g14[SC.pseudo] === 2, 'pseudo-IPv4: both requests counted (cf-connecting-ipv6 present / 240.0.0.0/4)', String(g14[SC.pseudo]));
            const g4 = gs('hijri-cal-gone|bingbot|-|v|-|US|*'), g7 = gs('hijri-cal-future|other-bot|foocrawler|na|-|??|*'), g8 = gs('moon-month|other-bot|python-requests|na|-|XX|*');
            ok('C', !!g4.length && !!g7.length && !!g8.length, "country: 'us' → US, 'zzz' → ??, 'XX' kept, absent → ??");
            ok('C', g7[SC.qs] === 1 && W.src.filter((r) => r !== g7).every((r) => r[SC.qs] === 0), 'src qs: the one request with a query string (G7 /hijri-calendar/1451?utm_source=…) is counted, no other', String(g7[SC.qs]));
            // header: boot / seq / ts on every line of the window
            const tsOk = (t) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(t) && Math.abs(Date.parse(t) - Date.now()) < 180000;
            ok('C', W.lines.every((o) => /^[0-9a-f]{6}$/.test(o.boot) && Number.isInteger(o.seq) && o.seq >= 1 && tsOk(o.ts)) && new Set(W.lines.map((o) => o.boot + '|' + o.seq + '|' + o.ts)).size === 1,
                'header: every line of the window carries the same boot (6 hex), seq (>= 1) and ts (UTC, to the second, now)', JSON.stringify(W.lines.map((o) => [o.t, o.boot, o.seq, o.ts])).slice(0, 300));
            const enC = srv.lines.find((l) => /^\[crawl-src\] worker=1 ENABLED/.test(l)) || '';
            ok('C', enC.endsWith(' boot=' + W.lines[0].boot), 'the ENABLED line names the same boot id', enC.slice(-40));
            ok('C', W.meta.ua_ovf === 0, 'meta.ua_ovf = 0 (the User-Agent cache never filled)', JSON.stringify(W.meta));
            // uurl: per family|declared|token|ver, n = the src rows' n, the registers re-estimate to the row's urls
            const ubad = [];
            const srcN = {}; for (const r of W.src) { const k = r.slice(0, 4).join('|'); srcN[k] = (srcN[k] || 0) + r[SC.n]; }
            for (const r of W.uurl) {
                const k = r.slice(0, 4).join('|');
                if (srcN[k] !== r[4]) ubad.push(k + ' n ' + r[4] + ' src ' + srcN[k]);
                if (!/^[0-9a-v]{64}$/.test(r[6]) || hllEst(regsOf32(r[6])) !== r[5]) ubad.push(k + ' regs');
            }
            if (Object.keys(srcN).length !== W.uurl.length) ubad.push('groups ' + W.uurl.length + ' want ' + Object.keys(srcN).length);
            const ug = W.uurl.find((r) => r.slice(0, 4).join('|') === 'moon-gone|googlebot|-|v');
            if (!ug || Math.abs(ug[5] - 25) > 5) ubad.push('googlebot moon-gone distinct ' + (ug && ug[5]) + ' want ~25 (v4 /24 + v6 /48 rows merged)');
            ok('C', ubad.length === 0, 'uurl: one row per family|declared|token|ver, n = src sum, registers (64 base-32 chars) re-estimate to urls; Googlebot v4 + v6 rows merge to ~25 distinct URLs', ubad.slice(0, 5).join(' | '));
            // fam: query-string count and cache keys (path + query)
            const fc = W.fam.find((r) => r[FC.family] === 'hijri-cal-future');
            const famColsOk = W.lines.filter((o) => o.t === 'fam').every((o) => o.cols === FAM_COLS);
            ok('C', famColsOk && fc && fc[FC.qs] === 1 && fc[FC.urls] === 3 && fc[FC.keys] === 4 && fc[FC.key_regs_p11_deflateraw_b64] !== '='
                && W.fam.filter((r) => r !== fc).every((r) => r[FC.qs] === 0 && r[FC.key_regs_p11_deflateraw_b64] === '=' && r[FC.keys] === r[FC.urls])
                && hllEst(regsOf(fc[FC.key_regs_p11_deflateraw_b64])) === 4,
                'fam: qs (requests with a query) and distinct cache keys -- hijri-cal-future 3 paths / 4 keys, 1 query; rows without a query carry "=" (keys = urls)', fc && JSON.stringify([fc[FC.qs], fc[FC.urls], fc[FC.keys]]));
            // yr: page year offset x outcome x agent class x ver
            const yr = {}; for (const r of W.yr) yr[r.slice(0, 5).join('|')] = r[5];
            const yrSum = (f) => W.yr.filter((r) => r[0] === f).reduce((s, r) => s + r[5], 0);
            ok('C', yr['moon-year|' + yoff(2040) + '|4xx|apple|np'] === 1 && yr['moon-year|' + yoff(2027) + '|2xx|apple|np'] === 1 && yr['moon-year|' + yoff(2026) + '|2xx|browser|na'] === 2
                && yr['moon-month|' + yoff(2026) + '|2xx|browser|na'] === 6 && yr['moon-month|' + yoff(2026) + '|2xx|browser|v'] === 1 && yr['moon-month|' + yoff(2040) + '|4xx|other-bot|na'] === 1
                && yr['moon-month|' + yoff(2026) + '|3xx|other-bot|na'] === 1 && yr['moon-month|' + yoff(2026) + '|2xx|google|u'] === 1 && yr['moon-year|' + yoff(2025) + '|2xx|google|u'] === 1
                && yr['moon-month|' + yoff(2027) + '|2xx|google|x'] === 1 && yrSum('moon-month') === (W.fam.filter((r) => r[0] === 'moon-month').reduce((s, r) => s + r[2], 0)) && yrSum('moon-year') === W.fam.filter((r) => r[0] === 'moon-year').reduce((s, r) => s + r[2], 0)
                && !W.yr.some((r) => !r[0].startsWith('moon-')),
                'yr: year offset (2026 -> ' + yoff(2026) + ', 2027 -> ' + yoff(2027) + ', 2040 -> ' + yoff(2040) + ') x outcome x agent class x ver (na / v / np / u / x decoded); sums = the month / year family n', JSON.stringify(yr).slice(0, 500));
            // [moon-load] agent classes: unchanged although they now come from the crawl-src declared name
            const mlWant = {};
            for (const j of [...sent.map((x) => ({ u: x.u, d: x.key.split('|')[1] })), ...Array.from({ length: ABORT.n }, (_, i) => ({ u: ABORT.url(i), d: 'unknown' }))]) {
                const f = famOf(j.u.split('?')[0]); const mf = f === 'moon-gone' ? 'day' : f === 'moon-month' ? 'month' : f === 'moon-year' ? 'year' : null;
                if (mf) { const k = mf + '|' + ML_CLASS[j.d]; mlWant[k] = (mlWant[k] || 0) + 1; }
            }
            const mlGot = {};
            for (const l of srv.lines.slice(from)) if (l.startsWith('[moon-load] {')) for (const r of JSON.parse(l.slice(12)).rows) { const k = r[0] + '|' + r[4]; mlGot[k] = (mlGot[k] || 0) + r[5]; }
            ok('C', JSON.stringify(Object.entries(mlWant).sort()) === JSON.stringify(Object.entries(mlGot).sort()), '[moon-load] family x agent class = the declared names sent (the agent now reuses the crawl-src declared name)',
                JSON.stringify(mlGot) + ' want ' + JSON.stringify(mlWant));
            // fam: exact n per family|outcome, distinct URLs, repeat ratio, offline register merge
            const famN = {}, famU = {};
            for (const j of [...sent, ...Array.from({ length: ABORT.n }, (_, i) => ({ u: ABORT.url(i) }))]) {
                const p = j.u.split('?')[0], f = famOf(p);
                famN[f] = (famN[f] || 0) + 1; (famU[f] || (famU[f] = new Set())).add(p);
            }
            const fbad = [], fby = {};
            for (const r of W.fam) { (fby[r[0]] || (fby[r[0]] = [])).push(r); }
            for (const [f, nn] of Object.entries(famN)) {
                const rs = fby[f] || [];
                const sn = rs.reduce((s, r) => s + r[2], 0);
                if (sn !== nn) fbad.push(f + ' n ' + sn + ' want ' + nn);
                const est = hllEst(mergeRegs(rs.map((r) => regsOf(r[FC.regs_p11_deflateraw_b64]))));
                const tru = famU[f].size;
                if (Math.abs(est - tru) > Math.max(1, tru * 0.05)) fbad.push(f + ' distinct ' + est + ' want ' + tru);
                const rep = sn / est;
                if (Math.abs(rep - nn / tru) > 0.1) fbad.push(f + ' repeat ' + rep.toFixed(2) + ' want ' + (nn / tru).toFixed(2));
                for (const r of rs) if (Math.abs(r[FC.repeat] - +(r[2] / Math.max(1, r[FC.urls])).toFixed(2)) > 1e-9) fbad.push(f + ' row repeat ≠ n/urls');
            }
            ok('C', fbad.length === 0, 'fam: n per family = sent; the outcome rows\' registers merge (inflate, max) into distinct URLs within 5% (p=11), repeat ratio = n / distinct (moon-gone 52/31, moon-month 15/10, …)', fbad.slice(0, 6).join(' | '));
            ok('C', (fby['moon-month'] || []).some((r) => r[1] === '3xx') && (fby['moon-year'] || []).some((r) => r[1] === '4xx') && (fby['hijri-cal-future'] || [])[0][1] === '4xx',
                'fam outcomes: moon-month 3xx (wrong country), moon-year 4xx (out of window), hijri-cal-future 4xx');
            // top paths: exact when a family has <= 32 distinct paths
            const tbad = [];
            for (const [f, set] of Object.entries(famU)) {
                const wantP = {}; for (const j of [...sent, ...Array.from({ length: ABORT.n }, (_, i) => ({ u: ABORT.url(i) }))]) { const p = j.u.split('?')[0]; if (famOf(p) === f) wantP[p] = (wantP[p] || 0) + 1; }
                const got = {}; for (const r of W.top.filter((r) => r[0] === f)) { got[r[1]] = r[2]; if (r[3] !== 0) tbad.push(f + ' err ' + r[1]); }
                if (JSON.stringify(Object.entries(got).sort()) !== JSON.stringify(Object.entries(wantP).sort())) tbad.push(f + ' top ' + JSON.stringify(got).slice(0, 200));
                if (set.size > 32) tbad.push(f + ' has > 32 paths');
            }
            ok('C', tbad.length === 0, 'top paths: every family\'s paths with exact counts and error 0 (<= 32 distinct each), query strings stripped (/hijri-calendar/1451 = 2)', tbad.slice(0, 4).join(' | '));
            const top1 = W.top.filter((r) => r[0] === 'moon-month').sort((a, b) => b[2] - a[2])[0];
            ok('C', top1 && top1[1] === '/moon/saudi-arabia/riyadh/2026/10' && top1[2] === 6, 'top path of moon-month: /moon/saudi-arabia/riyadh/2026/10 × 6', JSON.stringify(top1));
            // per-minute rate
            const rbad = [];
            for (const [f, nn] of Object.entries(famN)) {
                const r = W.rate.find((x) => x[0] === f);
                if (!r || r[1] !== nn || r[2] > nn || r[2] < Math.ceil(nn / Math.max(1, r[3])) || (r[3] === 1 && r[2] !== nn) || r[3] < 1 || r[3] > 2) rbad.push(f + ' ' + JSON.stringify(r));
            }
            ok('C', rbad.length === 0, 'rate: n per family, max requests in one minute (= n when one minute), active minutes 1..2', rbad.join(' | '));
            const sbad = W.src.filter((r) => r[SC.max_min] > r[SC.n] || r[SC.max_min] < 1);
            ok('C', sbad.length === 0, 'src: per-minute max within 1..n for every row');
            // city x date
            const cd = {}; for (const r of W.cd) cd[r.slice(0, 4).join('|')] = r[4];
            const cdSum = (f) => W.cd.filter((r) => r[0] === f).reduce((s, r) => s + r[4], 0);
            ok('C', cd['moon-month|cur|in|2xx'] === 7 && cd['moon-month|cur|flate|4xx'] === 1 && cd['moon-month|cur|in|3xx'] === 1 && cd['moon-month|cur|p1y|2xx'] === 1 && cd['moon-month|cur|f1y|2xx'] === 1
                && cd['moon-month|db|in|2xx'] === 1 && cd['moon-year|cur|in|2xx'] === 4 && cd['moon-year|cur|p1y|2xx'] === 1 && cd['moon-year|cur|flate|4xx'] === 1 && cdSum('moon-month') === famN['moon-month'] && cdSum('moon-year') === famN['moon-year']
                && !W.cd.some((r) => !r[0].startsWith('moon-')),
                'cd: moon-month / moon-year city class × date class × outcome (cur/in, cur/flate 404, cur/p1y, db/in, bisha db/p1y aborts), sums = family n; none for the gone families', JSON.stringify(cd));
            // token table
            const tok = {}; for (const r of W.tok) tok[r[0] + '|' + r[1]] = r;
            const kbad = [];
            const T = [['googlebot|-', 54, UA.gbot, 2], ['meta-external|-', 1, UA.meta], ['adsbot-google|-', 1, UA.adsbot], ['bingbot|-', 4, UA.bing], ['gptbot|-', 7, UA.gpt], ['applebot|-', 3, UA.apple], ['perplexitybot|-', 1, UA.pplx],
                ['other-bot|mozilla', 1, 'NULL'], ['other-bot|cubot', 1, 'NULL'], ['known-social-bot|pinterest', 1, 'NULL'], ['known-seo-crawler|ahrefsbot', 2, UA.ahrefs],
                ['known-seo-crawler|semrushbot', 1, UA.semrush], ['browser|browser:safari-17:mac', 1, 'NULL'],
                ['other-bot|foocrawler', 4, null], ['other-bot|python-requests', 3, UA.py], ['other-bot|duckduckbot', 2, UA.ddg], ['other-bot|oai-searchbot', 1, UA.oai],
                ['unknown|abortprobe', 5, UA.abort], ['unknown|empty', 3, 'NULL'], ['browser|browser:chrome-120:windows', 8, 'NULL'], ['browser|browser:firefox-121:linux', 4, 'NULL'],
                ['browser|browser:safari-17:ios', 2, 'NULL'], ['browser|googleother', 1, 'NULL']];
            for (const [k, nn, sample, uas = 1] of T) {
                const r = tok[k];
                if (!r) { kbad.push('missing ' + k); continue; }
                if (r[2] !== nn) kbad.push(k + ' n ' + r[2] + ' want ' + nn);
                if (r[3] < 1 || r[3] > uas) kbad.push(k + ' ua_strings ' + r[3]);
                if (sample === 'NULL' && r[4] !== null) kbad.push(k + ' has a sample');
                if (sample && sample !== 'NULL' && r[4] !== sample.slice(0, 160)) kbad.push(k + ' sample ' + r[4]);   // these UAs are printable ASCII: the sample is the UA cut to 160
            }
            const fooS = (tok['other-bot|foocrawler'] || [])[4] || '';
            if (!(fooS.length === 160 && fooS.startsWith('FooCrawler/1.0 (+https://foo.example/bot; xxx'))) kbad.push('foocrawler sample not truncated to 160: ' + fooS.length);
            if (W.tok.length !== T.length) kbad.push('tok rows ' + W.tok.length + ' want ' + T.length);
            ok('C', kbad.length === 0, 'tok: n and distinct UA strings per declared|token; ONE sanitised sample for UAs that are not browser-shaped (the 260-char FooCrawler UA cut to 160), null for every browser, the empty UA, and the browser-shaped CUBOT / Pinterest UAs filed as bots; seo / social product tokens (ahrefsbot, semrushbot, pinterest)', kbad.slice(0, 6).join(' | '));
            S.examples = csLines(srv, from).slice(0, 12);
        }
    } catch (e) { ok('run', false, 'unexpected error (counts)', e && e.stack || String(e)); }

    // ---- [W] two workers ----
    try {
        section('[W] two workers: per-worker rows + offline merge');
        const srv = S.two;
        const from0 = srv.lines.length; await flushes(srv, from0, 2); const from = srv.lines.length;
        const urls = [];
        for (let i = 0; i < 300; i++) { const d = new Date(Date.UTC(2025, 0, 1) + i * 86400000); urls.push('/moon/saudi-arabia/riyadh/' + d.getUTCFullYear() + '/' + pad(d.getUTCMonth() + 1) + '/' + pad(d.getUTCDate())); }
        const HEAVY = '/en/moon/saudi-arabia/riyadh/2026/10/16';
        const jobs = [...urls, ...Array(60).fill(HEAVY)].map((u, i) => ({ u, i })).sort((a, b) => ((a.i * 7919) % 360) - ((b.i * 7919) % 360));
        let next = 0; const st = {};
        for (let i = 1; i <= 200; i++) CLIENT_IPS.add('66.249.66.' + i);
        await Promise.all(Array.from({ length: 16 }, async () => { while (next < jobs.length) { const j = jobs[next++]; const r = await rawGet(PORT.two, j.u, { h: { 'user-agent': UA.gbot, 'cf-connecting-ip': '66.249.66.' + (1 + (j.i % 200)), 'cf-ray': RAY } }); st[r.st] = (st[r.st] || 0) + 1; } }));
        await sleep(1500); await flushes(srv, from, 4);
        const ws = windows(csJson(srv, from)).filter((w) => w.meta && w.meta.total > 0);
        const perW = {}; for (const w of ws) perW[w.w] = (perW[w.w] || 0) + w.meta.total;
        info('statuses ' + JSON.stringify(st) + '; per worker recorded ' + JSON.stringify(perW) + ' in ' + ws.length + ' window(s)');
        const tot = ws.reduce((s, w) => s + w.src.reduce((a, r) => a + r[SC.n], 0), 0);
        ok('W', st[410] === 360 && tot === 360, 'the sum over both workers\' src rows = 360 requests sent (410 each)', tot + ' / ' + JSON.stringify(st));
        ok('W', ws.every((w) => w.meta.edge_trust === 1 && w.meta.ranges_state === 'ok' && w.meta.unattested === 0) && ws.every((w) => w.src.every((r) => r[SC.ver] === 'v')),
            'both workers: edge_trust 1, ranges_state ok, unattested 0 in every window; every Googlebot row v (each worker compiled the per-crawler lists itself)', JSON.stringify(ws.map((w) => w.meta)));
        ok('W', Object.keys(perW).length === 2, 'both workers recorded and flushed their own windows (w = ' + Object.keys(perW).join(',') + ')', JSON.stringify(perW));
        const regs = ws.flatMap((w) => w.fam.filter((r) => r[0] === 'moon-gone').map((r) => regsOf(r[FC.regs_p11_deflateraw_b64])));
        const est = hllEst(mergeRegs(regs));
        const perEst = ws.map((w) => w.fam.filter((r) => r[0] === 'moon-gone').reduce((s, r) => s + r[FC.urls], 0));
        ok('W', Math.abs(est - 301) <= 301 * 0.08, 'merged registers of every worker / window → distinct URLs ≈ 301 (p=11, within 8%); per-window estimates were ' + JSON.stringify(perEst), String(est));
        const heavy = ws.flatMap((w) => w.top.filter((r) => r[1] === HEAVY));
        const hn = heavy.reduce((s, r) => s + r[2], 0), he = heavy.reduce((s, r) => s + r[3], 0);
        ok('W', heavy.length >= 1 && hn >= 60 && hn - he <= 60, 'Space-Saving: the heavy path (60 of 360, 301 distinct > 32 slots) is tracked with n >= 60 >= n - err', 'n ' + hn + ' err ' + he);
        ok('W', ws.every((w) => { const u = w.fam.filter((r) => r[0] === 'moon-gone').reduce((s, r) => s + r[FC.urls], 0), t = w.top.filter((r) => r[0] === 'moon-gone').length; return u > 40 ? t === 32 : t <= 32; }), 'top table holds exactly 32 paths per family when more were seen');
        const ur = ws.flatMap((w) => w.uurl.filter((r) => r.slice(0, 4).join('|') === 'moon-gone|googlebot|-|v'));
        const uest = hllEst(mergeRegs6(ur.map((r) => regsOf32(r[6]))));
        ok('W', ur.reduce((s, r) => s + r[4], 0) === 360 && Math.abs(uest - 301) <= 301 * 0.4, 'uurl: the per-source p=6 registers of both workers / all windows merge offline: Googlebot moon-gone ≈ 301 distinct URLs (p=6, within 3σ), n 360', uest + ' from ' + ur.length + ' rows');
        const boots = new Map(); for (const w of ws) { const b = w.lines[0].boot; if (!boots.has(b)) boots.set(b, new Set()); boots.get(b).add(w.w); }
        const seqOk = [...boots.keys()].every((b) => { const s = ws.filter((w) => w.lines[0].boot === b).map((w) => w.lines[0].seq); return s.every((x, i) => i === 0 || x > s[i - 1]); });
        ok('W', boots.size === 2 && [...boots.values()].every((s) => s.size === 1) && seqOk, 'header: each worker process has its own boot id; seq rises from window to window', JSON.stringify([...boots].map(([b, s]) => [b, [...s]])));
    } catch (e) { ok('run', false, 'unexpected error (two workers)', e && e.stack || String(e)); }

    // ---- [K] key cap, compaction, overflow, token cap ----
    try {
        section('[K] key cap (TP_CRAWL_SOURCE_TEST_MAX_KEYS=6), compaction, overflow, token cap');
        const srv = S.cap;
        const phase = async (name, n, hf, uf) => {
            const f0 = srv.lines.length; await flushes(srv, f0, 1); const from = srv.lines.length;
            let next = 0;
            await Promise.all(Array.from({ length: 4 }, async () => { while (next < n) { const i = next++; await rawGet(PORT.cap, uf(i), { h: hf(i) }); } }));
            await sleep(1200); await flushes(srv, from, 2);
            const ws = windows(csJson(srv, from)).filter((w) => w.meta && w.meta.total > 0);
            info(name + ': ' + ws.length + ' window(s), meta ' + JSON.stringify(ws.map((w) => w.meta)));
            return ws;
        };
        // 1: 30 distinct /24s, one identity → one '*' row by compaction, no overflow
        let ws = await phase('compaction', 30, (i) => ({ 'user-agent': UA.gbot, 'cf-connecting-ip': '198.51.' + (i + 1) + '.7' }), (i) => '/hijri-date/1446-05-' + pad((i % 29) + 1));
        for (let i = 0; i < 30; i++) CLIENT_IPS.add('198.51.' + (i + 1) + '.7');
        let rows = ws.flatMap((w) => w.src), sum = rows.reduce((s, r) => s + r[SC.n], 0);
        ok('K', ws.length === 1 && rows.length === 1 && rows[0][SC.prefix] === '*' && rows[0][SC.n] === 30 && ws[0].meta.compact >= 1 && ws[0].meta.ovf === 0 && ws[0].meta.keys <= 6,
            'compaction: 30 cold prefixes of one identity → one * row (n 30, keys <= cap, compact >= 1, no overflow)', JSON.stringify(rows.map((r) => r.slice(0, 8))) + ' ' + JSON.stringify(ws.map((w) => w.meta)));
        ok('K', rows.length === 1 && rows[0][SC.max_min_lb] === 1 && rows[0][SC.keys] >= 2, 'a merged row says its per-minute max is a lower bound (max_min_lb 1) and how many keys it holds');
        // 2: 30 distinct tokens from one IP → 6 rows kept, the rest in one overflow row
        ws = await phase('overflow', 30, (i) => ({ 'user-agent': 'Probe' + i + 'Crawler/1.0', 'cf-connecting-ip': '45.20.1.9' }), (i) => '/hijri-date/1446-05-' + pad((i % 29) + 1));
        CLIENT_IPS.add('45.20.1.9');
        rows = ws.flatMap((w) => w.src); sum = rows.reduce((s, r) => s + r[SC.n], 0);
        const ovf = rows.find((r) => r[SC.declared] === 'overflow');
        ok('K', ws.length === 1 && sum === 30 && ovf && ovf[SC.n] === ws[0].meta.ovf && ovf[SC.family] === 'hijri-gone' && ws[0].meta.keys <= 7 && rows.length <= 7 && ovf[SC.n] >= 20,
            'overflow: beyond the cap, one hijri-gone|overflow row (n = meta.ovf); keys <= cap + 1 family row; n preserved (30)', JSON.stringify(rows.map((r) => r.slice(0, 8))) + ' ' + JSON.stringify(ws.map((w) => w.meta)));
        // 3: 310 distinct tokens → 300 token rows + one other-bot|overflow (n 10)
        ws = await phase('token cap', 310, (i) => ({ 'user-agent': 'Zq' + i + 'Bot/1.0', 'cf-connecting-ip': '45.20.2.9' }), (i) => '/hijri-date/1446-05-' + pad((i % 29) + 1));
        CLIENT_IPS.add('45.20.2.9');
        const tk = ws.flatMap((w) => w.tok);
        const tov = tk.find((r) => r[1] === 'overflow');
        ok('K', ws.length === 1 && tk.length === 301 && tov && tov[0] === 'other-bot' && tov[2] === 10 && tk.reduce((s, r) => s + r[2], 0) === 310 && tov[4] === null,
            'token cap: 300 declared|token rows + one other-bot|overflow (n 10, no sample); n preserved (310)', tk.length + ' ' + JSON.stringify(tov));
        const lines = csLines(srv);
        ok('K', lines.every((l) => Buffer.byteLength(l) <= 8192) && csJson(srv).every((o) => o.rows.length <= 60), 'every line <= 8 KB and <= 60 rows even with 301 token rows (' + lines.length + ' lines, longest ' + Math.max(...lines.map((l) => Buffer.byteLength(l))) + ' B)');
    } catch (e) { ok('run', false, 'unexpected error (cap)', e && e.stack || String(e)); }

    // ---- [E] expiry ----
    try {
        section('[E] expiry');
        const srv = S.expired;
        for (let i = 0; i < 5; i++) await rawGet(PORT.expired, '/hijri-date/1446-05-0' + (i + 1), { h: { 'user-agent': UA.gbot } });
        await rawGet(PORT.expired, '/moon/saudi-arabia/riyadh/2026/10', { h: { 'user-agent': UA.gbot } });
        const f = srv.lines.length; await flushes(srv, f, 2);
        const L = srv.lines.filter((l) => l.startsWith('[crawl-src]'));
        ok('E', L.length === 1 && /^\[crawl-src\] worker=1 EXPIRED until=2020-01-01 /.test(L[0]), 'UNTIL 2020-01-01: exactly one EXPIRED line, no ENABLED line, no rows after two windows', L.join(' | '));
        ok('E', srv.lines.some((l) => l.startsWith('[moon-load] {')), 'the expired measurement leaves [moon-load] running');
    } catch (e) { ok('run', false, 'unexpected error (expired)', e && e.stack || String(e)); }
    try {
        // boot a server whose expiry is 30 s away, send before and after it
        const untilIso = new Date(Date.now() + 30000).toISOString();
        S.expiring = await boot(ROOT, PORT.expiring, 'expiring', { TP_CRAWL_RANGES_FILE: FIXTURE, TP_CRAWL_SOURCE_OBS_UNTIL: untilIso });
        const srv = S.expiring;
        const en = srv.lines.find((l) => /^\[crawl-src\] worker=1 ENABLED/.test(l)) || '';
        for (let i = 0; i < 7; i++) await rawGet(PORT.expiring, '/hijri-date/1446-05-0' + (i + 1), { h: { 'user-agent': UA.gbot } });
        const wait = Date.parse(untilIso) - Date.now() + 500;
        info('ENABLED until=' + (en.match(/until=(\S+)/) || [])[1] + '; waiting ' + Math.round(wait / 1000) + ' s for the expiry');
        await sleep(Math.max(0, wait));
        for (let i = 0; i < 4; i++) await rawGet(PORT.expiring, '/hijri-date/1446-06-0' + (i + 1), { h: { 'user-agent': UA.gbot } });
        const f = srv.lines.length; await flushes(srv, f, 2);
        const ex = srv.lines.filter((l) => /^\[crawl-src\] worker=\d+ EXPIRED/.test(l));
        const tot = csJson(srv).filter((o) => o.t === 'src' && o.part === 0).reduce((s, o) => s + o.meta.total, 0);
        const paths = csJson(srv).filter((o) => o.t === 'top').flatMap((o) => o.rows.map((r) => r[1]));
        ok('E', en.includes('until=' + untilIso) && ex.length === 1 && tot === 7 && !paths.some((p) => p.includes('1446-06')),
            'mid-run expiry: the 7 requests before it are reported, the 4 after it are not, one EXPIRED line', 'total ' + tot + ', EXPIRED ×' + ex.length);
    } catch (e) { ok('run', false, 'unexpected error (expiring)', e && e.stack || String(e)); }

    // ---- [R] ranges absent / malformed ----
    for (const [name, srv, wantInfo, state, edge] of [['absent', S.noranges, 'ranges_error=absent', 'absent', 1], ['malformed', S.badranges, 'ranges_error=unreadable', 'unreadable', 0]]) {
        try {
            section('[R] ranges file ' + name + ' (edge trust ' + (edge ? 'on, requests with a cf-ray' : 'off') + ')');
            const en = srv.lines.find((l) => /^\[crawl-src\] worker=1 ENABLED/.test(l)) || '';
            ok('R', /ranges=none/.test(en) && en.includes(' ' + wantInfo + ' ') && !/ops=/.test(en), 'ENABLED says ranges=none + ' + wantInfo + ' (absence and corruption told apart)', en);
            const f0 = srv.lines.length; await flushes(srv, f0, 1); const from = srv.lines.length;
            const port = srv.port;
            const req = [[UA.gbot, '66.249.66.9'], [UA.bing, '157.55.39.5'], [UA.gpt, '20.171.206.9'], [UA.ddg, '20.191.45.3'], [UA.py, '45.10.2.5'], [UA.gother, '66.249.70.1'], [UA.meta, '45.10.8.16']];
            for (const [, ip] of req) CLIENT_IPS.add(ip);
            for (const [ua, ip] of req) await rawGet(port, '/hijri-calendar/1446', { h: { 'user-agent': ua, 'cf-connecting-ip': ip, 'cf-ray': RAY } });
            await rawGet(port, '/moon/saudi-arabia/riyadh/2026/10', { h: { 'user-agent': UA.gbot, 'cf-connecting-ip': '66.249.66.9', 'cf-ray': RAY } });
            await sleep(1000); await flushes(srv, from, 2);
            const objs = csJson(srv, from);
            const rows = objs.filter((o) => o.t === 'src').flatMap((o) => o.rows);
            const ver = {}; for (const r of rows) ver[r[SC.family] + ':' + r[SC.declared] + ':' + r[SC.token]] = r[SC.ver];
            const yrR = objs.filter((o) => o.t === 'yr').flatMap((o) => o.rows);
            const metas = objs.filter((o) => o.t === 'src' && o.part === 0).map((o) => o.meta);
            ok('R', ver['hijri-cal-gone:googlebot:-'] === 'err' && ver['hijri-cal-gone:bingbot:-'] === 'err' && ver['hijri-cal-gone:gptbot:-'] === 'err' && ver['hijri-cal-gone:browser:googleother'] === 'err'
                && ver['hijri-cal-gone:meta-external:-'] === 'err' && ver['moon-month:googlebot:-'] === 'err'
                && ver['hijri-cal-gone:other-bot:duckduckbot'] === 'na' && ver['hijri-cal-gone:other-bot:python-requests'] === 'na' && objs.every((o) => o.ranges === null),
                'every claim is err (Googlebot from inside a Google range and meta-external included; edge ' + (edge ? 'attested' : 'not trusted') + '), no claim → na, DuckDuckBot names no list without the snapshot, ranges null', JSON.stringify(ver));
            ok('R', metas.length >= 1 && metas.every((m) => m.ranges_state === state && m.edge_trust === edge && m.unattested === 0),
                'meta: ranges_state ' + state + ', edge_trust ' + edge + ', unattested 0 (err comes first: nothing is counted as unattested)', JSON.stringify(metas));
            ok('R', yrR.length === 1 && yrR[0].join('|') === 'moon-month|' + yoff(2026) + '|2xx|google|err|1', 'yr decodes err: moon-month|' + yoff(2026) + '|2xx|google|err|1', JSON.stringify(yrR));
        } catch (e) { ok('run', false, 'unexpected error (ranges ' + name + ')', e && e.stack || String(e)); }
    }

    // ---- [V] (1) a server WITHOUT edge trust: forged edge headers from listed crawler IPs are never verified ----
    try {
        section('[V] source reliability: no edge trust (no RENDER, no TP_CRAWL_SOURCE_EDGE_TEST), forged cf-connecting-ip + cf-ray');
        const srv = S.noedge;
        const en = srv.lines.find((l) => /^\[crawl-src\] worker=1 ENABLED/.test(l)) || '';
        ok('V', /ranges=2026-10-10/.test(en) && / edge_trust=0 /.test(en), 'ENABLED: the lists loaded (ranges=2026-10-10) but edge_trust=0', en);
        const f0 = srv.lines.length; await flushes(srv, f0, 1); const from = srv.lines.length;
        // every claim from an IP INSIDE its own list, with a forged cf-connecting-ip and a forged cf-ray
        //   (one country code per request, so each request is its own row)
        const claims = [['Googlebot', UA.gbot, '66.249.66.9'], ['bingbot', UA.bing, '157.55.39.5'], ['GPTBot', UA.gpt, '20.171.206.9'], ['GoogleOther', UA.gother, '66.249.70.1'],
            ['AdsBot-Google', UA.adsbot, '108.177.2.9'], ['DuckDuckBot', UA.ddg, '20.191.45.3'], ['meta-externalagent', UA.meta, '45.10.8.16'], ['Perplexity-User', UA.pplxu, '3.224.62.45'],
            ['ChatGPT-User', UA.cgpt, '23.98.142.180']].map((c) => [...c, 'u']);
        const none = [['python-requests', UA.py, '45.10.2.5', 'na'], ['Chrome', UA.chrome, '198.51.100.20', 'na']];
        const reqs = [...claims, ...none];
        const cc = (i) => String.fromCharCode(81 + Math.floor(i / 10)) + (i % 10);   // Q0 .. Q9, R0 .. (a letter + a digit)
        for (const [, , ip] of reqs) CLIENT_IPS.add(ip);
        for (let i = 0; i < reqs.length; i++) await rawGet(srv.port, '/hijri-date/1446-05-20', { h: { 'user-agent': reqs[i][1], 'cf-connecting-ip': reqs[i][2], 'cf-ray': RAY, 'cf-ipcountry': cc(i) } });
        await rawGet(srv.port, '/moon/saudi-arabia/riyadh/2026/10', { h: { 'user-agent': UA.gbot, 'cf-connecting-ip': '66.249.66.9', 'cf-ray': RAY } });
        await sleep(1000); await flushes(srv, from, 2);
        const ws = windows(csJson(srv, from)).filter((w) => w.meta && w.meta.total > 0);
        const rows = ws.flatMap((w) => w.src);
        const ver = {}; for (const r of rows) if (r[SC.family] === 'hijri-gone') ver[r[SC.country]] = (ver[r[SC.country]] || []).concat([r[SC.ver]]);
        const bad = reqs.map(([name, , , want], i) => (JSON.stringify(ver[cc(i)]) === JSON.stringify([want]) ? null : name + '=' + JSON.stringify(ver[cc(i)]))).filter(Boolean);
        ok('V', ws.length === 1 && bad.length === 0 && !rows.some((r) => r[SC.ver] === 'v' || r[SC.ver] === 'x'),
            '(1) every claim from a listed IP with forged cf-connecting-ip + cf-ray is u (' + claims.length + ' crawlers: Googlebot, bingbot, GPTBot, GoogleOther, AdsBot, DuckDuckBot, meta-externalagent, Perplexity-User, ChatGPT-User); no claim → na; no row v or x', bad.join(' | ') + ' ' + JSON.stringify(ver));
        const m = ws[0] && ws[0].meta;
        ok('V', !!m && m.edge_trust === 0 && m.ranges_state === 'ok' && m.unattested === claims.length + 1 && m.total === claims.length + none.length + 1,
            '(1) meta: edge_trust 0, ranges_state ok, unattested = the ' + (claims.length + 1) + ' claims (the moon-month one included), total ' + (claims.length + none.length + 1), JSON.stringify(m));
        const yrV = ws.flatMap((w) => w.yr);
        ok('V', yrV.length === 1 && yrV[0].join('|') === 'moon-month|' + yoff(2026) + '|2xx|google|u|1', '(1) yr decodes u: moon-month|' + yoff(2026) + '|2xx|google|u|1', JSON.stringify(yrV));
    } catch (e) { ok('run', false, 'unexpected error (no edge)', e && e.stack || String(e)); }

    // ---- [V] in-process: the edge-attestation matrix, list matching per crawler, all six ver values decoded ----
    try {
        section('[V] in-process: edge attestation, per-crawler lists, ver decoding');
        const startOn = (api, file) => { const prev = process.env.TP_CRAWL_RANGES_FILE; process.env.TP_CRAWL_RANGES_FILE = file; try { api._csStart(); } finally { if (prev === undefined) delete process.env.TP_CRAWL_RANGES_FILE; else process.env.TP_CRAWL_RANGES_FILE = prev; } };
        const recIn = (api, ua, h, fam, p) => api._csRecord({ method: 'GET', headers: { host: 'timesprayers.com', ...(ua === null ? {} : { 'user-agent': ua }), ...h }, socket: { remoteAddress: '127.0.0.1' } }, null, p, fam, fam.endsWith('gone') ? 'gone' : '2xx', 1, fam.startsWith('moon-m') || fam === 'moon-year' ? 'cur' : undefined, 'in', p);
        const flushRows = (api, logs) => { logs.length = 0; api._csFlush('w'); const o = logs.filter((l) => l.startsWith('[crawl-src] {')).map((l) => JSON.parse(l.slice(12))); return { src: o.filter((x) => x.t === 'src').flatMap((x) => x.rows), yr: o.filter((x) => x.t === 'yr').flatMap((x) => x.rows), meta: (o.find((x) => x.t === 'src' && x.part === 0) || {}).meta }; };
        // (a) the attestation matrix: process edge trust x request headers
        const H = [
            ['cf + ray', { 'cf-connecting-ip': '66.249.66.1', 'cf-ray': RAY }, true],
            ['cf, no ray', { 'cf-connecting-ip': '66.249.66.1' }, false],
            ['cf, empty ray', { 'cf-connecting-ip': '66.249.66.1', 'cf-ray': '' }, false],
            ['xff + ray, no cf', { 'x-forwarded-for': '66.249.66.1', 'cf-ray': RAY }, false],
            ['private cf + xff + ray', { 'cf-connecting-ip': '10.0.0.1', 'x-forwarded-for': '66.249.66.1', 'cf-ray': RAY }, false],
            ['garbage cf + xff + ray', { 'cf-connecting-ip': 'garbage', 'x-forwarded-for': '66.249.66.1', 'cf-ray': RAY }, false],
            ['socket only + ray', { 'cf-ray': RAY }, false],
            ['bracketed v6 cf + ray', { 'cf-connecting-ip': '[2001:4860:4801:10::1]', 'cf-ray': RAY }, true],
            ['mapped v4 cf + ray', { 'cf-connecting-ip': '::ffff:66.249.66.1', 'cf-ray': RAY }, true],
        ];
        const E = [['no edge env', {}, false], ['TP_CRAWL_SOURCE_EDGE_TEST=1', EDGE, true], ['RENDER=true', { RENDER: 'true' }, true], ['RENDER=TRUE', { RENDER: 'TRUE' }, true],
            ['RENDER=1 (not "true")', { RENDER: '1' }, false], ['TP_CRAWL_SOURCE_EDGE_TEST=0', { TP_CRAWL_SOURCE_EDGE_TEST: '0' }, false],
            ['RENDER=true + TP_TRUSTED_PROXY=none', { RENDER: 'true', TP_TRUSTED_PROXY: 'none' }, false]];
        const mbad = []; let mn = 0;
        for (const [en, env, trust] of E) {
            const saved = {}; for (const k of ['RENDER', 'TP_CRAWL_SOURCE_EDGE_TEST', 'TP_TRUSTED_PROXY']) { saved[k] = process.env[k]; delete process.env[k]; }
            let A;
            try { A = loadBlock(env); } finally { for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; } }
            if (A.edgeTrust !== trust) mbad.push(en + ': edge trust ' + A.edgeTrust);
            for (const [hn, h, att] of H) {
                const req = { headers: h, socket: { remoteAddress: '66.249.66.1' } };
                const ip = A._csClientIp(req, h);
                const got = A._csEdgeAttested(h, ip), want = trust && att;
                mn++;
                if (got !== want) mbad.push(en + ' / ' + hn + ': ' + got);
            }
        }
        ok('V', mbad.length === 0, '(2)(3) edge attestation = process edge trust (RENDER=true or the test stand-in; never with TP_TRUSTED_PROXY=none) AND a cf-ray AND the checked IP is the cf-connecting-ip (' + mn + ' combinations: no cf-ray, empty cf-ray, IP from x-forwarded-for, private / garbage cf-connecting-ip, socket -> never)', mbad.slice(0, 6).join(' | '));
        // (b) list matching, each claim against ITS crawler's list (edge-attested, cf-ray); one country code per case
        const logsL = [];
        const L = loadBlock(EDGE, { log: (s) => logsL.push(String(s)) }); startOn(L, FIXTURE);
        const CASES = [
            ['Googlebot from google-common', UA.gbot, '66.249.66.1', 'v'],
            ['Googlebot from a google-user-only IP', UA.gbot, '74.125.208.9', 'x'],
            ['Googlebot from a google-special-only IP', UA.gbot, '108.177.2.9', 'x'],
            ['AdsBot-Google from google-special', UA.adsbot, '108.177.2.10', 'v'],
            ['AdsBot-Google from a google-common-only IP', UA.adsbot, '66.249.66.2', 'x'],
            ['Mediapartners-Google from google-special', UA.mpg, '108.177.2.11', 'v'],
            ['GoogleOther from google-common', UA.gother, '66.249.66.3', 'v'],
            ['GoogleOther from a google-user-only IP', UA.gother, '74.125.208.10', 'x'],
            ['FeedFetcher-Google from google-user', UA.feed, '74.125.208.11', 'v'],
            ['OAI-SearchBot from a gptbot-only IP', UA.oai, '20.171.206.11', 'x'],
            ['OAI-SearchBot from its own list', UA.oai, '20.42.10.180', 'v'],
            ['GPTBot from a searchbot-only IP', UA.gpt, '20.42.10.181', 'x'],
            ['ChatGPT-User from its own list', UA.cgpt, '23.98.142.180', 'v'],
            ['ChatGPT-User from a gptbot-only IP', UA.cgpt, '20.171.206.12', 'x'],
            ['bingbot from bing', UA.bing, '40.77.167.20', 'v'],
            ['meta-externalagent (no list)', UA.meta, '45.10.8.16', 'np'],
            ['ClaudeBot (no list)', UA.claude, '45.10.8.17', 'np'],
            ['Applebot (no list loaded)', UA.apple, '17.58.1.1', 'np'],
            ['PerplexityBot (no list loaded)', UA.pplx, '3.224.62.45', 'np'],
            ['Perplexity-User from a /32 exactly', UA.pplxu, '3.224.62.45', 'v'],
            ['Perplexity-User from the /32 + 1', UA.pplxu, '3.224.62.46', 'x'],
            ['Perplexity-User from the /32 - 1', UA.pplxu, '3.224.62.44', 'x'],
            ['Perplexity-User from a /30 edge', UA.pplxu, '18.97.21.3', 'v'],
            ['Perplexity-User past the /30', UA.pplxu, '18.97.21.4', 'x'],
            ['DuckDuckBot from its snapshot list', UA.ddg, '20.191.45.3', 'v'],
            ['Googlebot IPv6 in google-common (compressed)', UA.gbot, '2001:4860:4801:10::1', 'v'],
            ['Googlebot IPv6 in google-common (expanded)', UA.gbot, '2001:4860:4801:0010:0000:0000:0000:0001', 'v'],
            ['Googlebot IPv6 in google-common (upper case)', UA.gbot, '2001:4860:4801:10:0:0:0:ABCD', 'v'],
            ['Googlebot IPv6 in google-user only', UA.gbot, '2001:4860:4801:4004::5', 'x'],
            ['AdsBot IPv6 in google-special', UA.adsbot, '2001:4860:4801:2008:0:0:0:7', 'v'],
            ['Googlebot IPv6 outside every list', UA.gbot, '2001:db9::1', 'x'],
            ['python-requests (no claim)', UA.py, '66.249.66.4', 'na'],
            ['a browser from a Google IP (no claim)', UA.chrome, '66.249.66.5', 'na'],
        ];
        const cc = (i) => String.fromCharCode(65 + Math.floor(i / 10)) + String(i % 10);   // A0, A1, ... one country code per case
        CASES.forEach(([, ua, ip], i) => recIn(L, ua, { 'cf-connecting-ip': ip, 'cf-ray': RAY, 'cf-ipcountry': cc(i) }, 'hijri-gone', '/hijri-date/1446-05-01'));
        const RL = flushRows(L, logsL);
        const byCc = {}; for (const r of RL.src) byCc[r[SC.country]] = (byCc[r[SC.country]] || []).concat([r[SC.ver]]);
        const lbad = CASES.map(([name, , ip, want], i) => { const g = byCc[cc(i)] || []; return g.length === 1 && g[0] === want ? null : name + ' (' + ip + ') -> ' + JSON.stringify(g) + ' want ' + want; }).filter(Boolean);
        ok('V', lbad.length === 0 && RL.meta.unattested === 0, '(4) ' + CASES.length + ' claims against their own crawler list: google-user / google-special IPs are x for Googlebot, AdsBot / Mediapartners v only on google-special, GoogleOther v on google-common, OAI-SearchBot x on a gptbot IP, ChatGPT-User v on its own list, named crawlers without a list np, a /32 exact v and its neighbours x, /30 edges, IPv6 compressed / expanded / upper case', lbad.slice(0, 6).join(' | '));
        // (c) all six ver values in the yr table and the src rows, at a high token index (300 tokens first) and both families
        const logsY = [], logsZ = [];
        const Y = loadBlock(EDGE, { log: (s) => logsY.push(String(s)) }); startOn(Y, FIXTURE);
        const Z = loadBlock(EDGE, { log: (s) => logsZ.push(String(s)) }); startOn(Z, NOFILE);
        for (let i = 0; i < 300; i++) { recIn(Y, 'Zq' + i + 'Bot/1.0', { 'cf-connecting-ip': '45.20.2.9' }, 'hijri-gone', '/hijri-date/1446-05-01'); recIn(Z, 'Zq' + i + 'Bot/1.0', { 'cf-connecting-ip': '45.20.2.9' }, 'hijri-gone', '/hijri-date/1446-05-01'); }
        const SIX = [['na', Y, UA.py, { 'cf-connecting-ip': '45.10.2.5', 'cf-ray': RAY }, 2021, 'other-bot'], ['v', Y, UA.gbot, { 'cf-connecting-ip': '66.249.66.1', 'cf-ray': RAY }, 2022, 'google'],
            ['x', Y, UA.gbot, { 'cf-connecting-ip': '203.0.113.5', 'cf-ray': RAY }, 2023, 'google'], ['np', Y, UA.apple, { 'cf-connecting-ip': '17.58.1.1', 'cf-ray': RAY }, 2024, 'apple'],
            ['u', Y, UA.gbot, { 'cf-connecting-ip': '66.249.66.1' }, 2025, 'google'], ['err', Z, UA.gbot, { 'cf-connecting-ip': '66.249.66.1', 'cf-ray': RAY }, 2026, 'google']];
        // each case twice (n 2), so its src row sorts above the 300 one-request token rows (only the top 150 rows are emitted)
        for (const [, api, ua, h, y] of SIX) for (let k = 0; k < 2; k++) { recIn(api, ua, h, 'moon-month', '/moon/saudi-arabia/riyadh/' + y + '/10'); recIn(api, ua, h, 'moon-year', '/moon/saudi-arabia/riyadh/' + y); }
        const RY = flushRows(Y, logsY), RZ = flushRows(Z, logsZ);
        const yrAll = [...RY.yr, ...RZ.yr].map((r) => r.join('|')), srcAll = [...RY.src, ...RZ.src];
        const ybad = [];
        for (const [v, , ua, , y, ag] of SIX) {
            const d = ua === UA.py ? 'other-bot' : ua === UA.apple ? 'applebot' : 'googlebot';
            for (const fam of ['moon-month', 'moon-year']) {
                if (!yrAll.includes(fam + '|' + yoff(y) + '|2xx|' + ag + '|' + v + '|2')) ybad.push('yr ' + fam + ' ' + v);
                const sr = srcAll.filter((r) => r[SC.family] === fam && r[SC.declared] === d && r[SC.ver] === v);
                if (sr.length !== 1 || sr[0][SC.n] !== 2) ybad.push('src ' + fam + ' ' + d + ' ' + v + ' ' + JSON.stringify(sr.map((r) => r.slice(0, 8))));
            }
        }
        if (yrAll.length !== 12) ybad.push('yr rows ' + yrAll.length + ' want 12');
        ok('V', ybad.length === 0 && RY.meta.tokens === 300 && RZ.meta.ranges_state === 'absent' && RY.meta.unattested === 4,
            '(5) all six ver values (na / v / x / np / u / err) decode in the yr table (year offset ' + yoff(2021) + '..' + yoff(2026) + ') and the src rows, moon-month and moon-year, with 300 tokens ahead of them (high token index)', ybad.slice(0, 6).join(' | ') + ' ' + JSON.stringify(yrAll));
    } catch (e) { ok('run', false, 'unexpected error (verification in-process)', e && e.stack || String(e)); }

    // ---- [S] forced shed ----
    try {
        section('[S] forced shed (TP_MOON_DAY_SHED on, burst 1, 1 per tick)');
        const srv = S.shed;
        const f0 = srv.lines.length; await flushes(srv, f0, 1); const from = srv.lines.length;
        const urls = [];
        for (const c of ['riyadh', 'jeddah', 'makkah', 'medina', 'dammam']) for (let y = 2025; y <= 2027; y++) for (let m = 1; m <= 12; m++) urls.push('/moon/saudi-arabia/' + c + '/' + y + '/' + pad(m));
        const cnt = {}; let next = 0; const tEnd = Date.now() + 4000;
        CLIENT_IPS.add('66.249.66.77');
        await Promise.all(Array.from({ length: 24 }, async () => { while (Date.now() < tEnd) { const r = await rawGet(PORT.shed, urls[next++ % urls.length], { h: { 'user-agent': UA.gbot, 'cf-connecting-ip': '66.249.66.77' } }); cnt[r.st] = (cnt[r.st] || 0) + 1; } }));
        await sleep(1500); await flushes(srv, from, 2);
        const rows = csJson(srv, from).filter((o) => o.t === 'src').flatMap((o) => o.rows).filter((r) => r[SC.family] === 'moon-month');
        const shed = rows.reduce((s, r) => s + r[SC.shed], 0), ok2 = rows.reduce((s, r) => s + r[SC['2xx']], 0);
        const famShed = csJson(srv, from).filter((o) => o.t === 'fam').flatMap((o) => o.rows).filter((r) => r[0] === 'moon-month' && r[1] === 'shed').reduce((s, r) => s + r[2], 0);
        info('client ' + JSON.stringify(cnt) + ' → rows shed ' + shed + ', 2xx ' + ok2);
        ok('S', (cnt[503] || 0) > 0 && shed === (cnt[503] || 0) && ok2 === (cnt[200] || 0) && famShed === shed, 'moon-month shed / 2xx counts = the client\'s 503 / 200 counts (src and fam tables agree)', JSON.stringify(cnt) + ' shed ' + shed + ' 2xx ' + ok2 + ' fam ' + famShed);
    } catch (e) { ok('run', false, 'unexpected error (shed)', e && e.stack || String(e)); }

    // ---- [O] TP_MOON_LOAD_OBS=0 ----
    try {
        section('[O] TP_MOON_LOAD_OBS=0 (crawl-src requires the moon-load listener)');
        for (let i = 0; i < 5; i++) await rawGet(PORT.mloff, '/hijri-date/1446-05-0' + (i + 1), { h: { 'user-agent': UA.gbot } });
        await sleep(12000);
        ok('O', !S.mloff.lines.some((l) => l.startsWith('[crawl-src]') || l.startsWith('[moon-load]')), 'no [crawl-src] and no [moon-load] line at all');
    } catch (e) { ok('run', false, 'unexpected error (mloff)', e && e.stack || String(e)); }

    // ---- [P] privacy, over every emitted line of every candidate server ----
    try {
        section('[P] privacy + line bounds (every [crawl-src] line of every candidate server)');
        const all = [];
        for (const s of kids) if (s.root === ROOT) for (const l of s.lines) if (l.startsWith('[crawl-src]')) all.push(l);
        info(all.length + ' [crawl-src] lines checked, ' + CLIENT_IPS.size + ' client addresses');
        const ipHit = [];
        for (const ip of CLIENT_IPS) {
            const re = new RegExp('(^|[^0-9a-fA-F.:])' + ip.replace(/[.]/g, '\\.') + '(?![0-9a-fA-F.:])');
            if (all.some((l) => re.test(l))) ipHit.push(ip);
        }
        ok('P', ipHit.length === 0, 'no full client IPv4 / IPv6 address in any line', ipHit.slice(0, 5).join(','));
        ok('P', !all.some((l) => /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.(?!0\/24)\d{1,3}\b/.test(l.replace(/https?:\/\/[^\s"]*/g, ''))), 'no IPv4 other than an a.b.c.0/24 prefix anywhere');
        ok('P', !all.some((l) => { const t = l.replace(/"[0-9a-f]{1,4}:[0-9a-f]{1,4}:[0-9a-f]{1,4}::\/48"/g, '""').replace(/https?:\/\/[^\s"]*/g, ''); return t.includes('::') || /[0-9a-f]{1,4}(?::[0-9a-f]{1,4}){7}/i.test(t); }), 'no IPv6 address other than an x:y:z::/48 prefix');
        const sec = SECRETS.filter((x) => all.some((l) => l.includes(x)));
        ok('P', sec.length === 0, 'no query string, referer value, cookie, authorization or accept-language value', sec.join(','));
        ok('P', all.every((l) => !l.replace(/"\?\?"/g, '').includes('?')), 'no "?" anywhere (no query string) except the "??" country placeholder');
        const bb = BROWSER_BITS.filter((x) => all.some((l) => l.includes(x)));
        ok('P', bb.length === 0, 'no raw browser User-Agent (no distinctive piece of any browser UA sent)', bb.join(','));
        const toks = all.filter((l) => l.startsWith('[crawl-src] {')).map((l) => JSON.parse(l.slice(12))).filter((o) => o.t === 'tok').flatMap((o) => o.rows);
        ok('P', toks.every((r) => r[4] === null || (typeof r[4] === 'string' && r[4].length <= 160 && r[0] !== 'browser' && !/["\\\x00-\x1f\x7f-\uffff]/.test(r[4]))),
            'samples: <= 160 printable-ASCII characters, none for a declared browser (' + toks.filter((r) => r[4]).length + ' samples)');
        ok('P', all.every((l) => Buffer.byteLength(l) <= 8192) && all.filter((l) => l.startsWith('[crawl-src] {')).every((l) => JSON.parse(l.slice(12)).rows.length <= 60), 'every [crawl-src] line <= 8 KB and <= 60 rows');
        const hdrs = ['cookie', 'authorization', 'sec-fetch-mode', 'accept-language', 'x-forwarded-for', 'cf-connecting-ip', 'cf-ray'];
        ok('P', !all.some((l) => hdrs.some((h) => l.toLowerCase().includes('"' + h + '"'))), 'no header names / dumps in any line');
        // the rest of stdout: no client IP or secret from the crawl-src traffic in any other line either
        const other = []; for (const s of kids) if (s.root === ROOT) for (const l of s.lines) if (!l.startsWith('[crawl-src]')) other.push(l);
        const oHit = [...CLIENT_IPS].filter((ip) => other.some((l) => l.includes(ip))).concat(SECRETS.filter((x) => other.some((l) => l.includes(x))));
        if (oHit.length) info('INFO other (pre-existing) log lines carry: ' + oHit.slice(0, 5).join(','));
        ok('P', true, 'other stdout lines checked (' + other.length + '): ' + (oHit.length ? 'see INFO' : 'no client IP / secret'));
    } catch (e) { ok('run', false, 'unexpected error (privacy)', e && e.stack || String(e)); }

    // ---- [U] in-process equivalence ----
    try {
        section('[U] in-process: client-IP fast path == getClientIp, country index');
        const IPS = ['66.249.66.1', '8.8.8.8', '1.1.1.1', '10.0.0.1', '127.0.0.1', '172.16.0.1', '172.31.255.255', '172.32.0.1', '192.168.1.1', '192.169.0.1',
            '169.254.1.1', '100.64.0.1', '100.127.255.255', '100.128.0.1', '0.1.2.3', '255.255.255.255', '240.10.20.30', '010.1.2.3', '1.2.3', '1.2.3.4.5', '256.1.1.1',
            ' 8.8.8.8', '8.8.8.8 ', '[2001:db8::1]', '2001:4860:4801:10::1', '::ffff:8.8.8.8', '8.8.8.8:443', 'unknown', '', 'fe80::1', 'fd00::1', '::1', undefined];
        for (const mode of ['cloudflare', 'none']) {
            const U = loadBlock(mode === 'none' ? { TP_TRUSTED_PROXY: 'none' } : {});
            const bad = []; let n = 0;
            for (const cf of IPS) for (const xff of [undefined, '9.9.9.9', '10.0.0.1, 9.9.9.8', 'garbage']) for (const sock of ['127.0.0.1', '::ffff:203.0.113.5', '2001:db8::7', undefined]) {
                const h = {}; if (cf !== undefined) h['cf-connecting-ip'] = cf; if (xff !== undefined) h['x-forwarded-for'] = xff;
                const req = { headers: h, socket: { remoteAddress: sock } };
                const a = U.getClientIp(req), b = U._csClientIp(req, h), b4 = U.ip4();
                n++;
                if (a !== b || b4 !== U._csParse4(a)) bad.push(JSON.stringify([cf, xff, sock]) + ' -> ' + a + ' / ' + b + ' / ' + b4);
            }
            ok('U', bad.length === 0, 'TP_TRUSTED_PROXY=' + mode + ': the fast path returns exactly getClientIp(req) and its parsed IPv4 (' + n + ' cf-connecting-ip x forwarded-for x socket combinations)', bad.slice(0, 4).join(' | '));
        }
        const U = loadBlock();
        let rt = 0;
        for (let a = 65; a <= 90; a++) for (const b of '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ') { const c = String.fromCharCode(a) + b; if (U._csCountryStr(U._csCountryIdx(c)) !== c || U._csCountryStr(U._csCountryIdx(c.toLowerCase())) !== c) rt++; }
        ok('U', rt === 0 && ['', 'U', 'USA', '1A', '@@', 'U-', null, undefined, 7].every((v) => U._csCountryIdx(v) === 0) && U._csCountryStr(0) === '??',
            'country index: all 936 letter + letter-or-digit codes round-trip (lower case upper-cased); anything else is ??', String(rt));
        // _csBotWord == the regex it replaces (Latin-1 strings, as header values are)
        const RE = /[a-z0-9][a-z0-9._-]{0,39}(?:bot|crawler|spider|fetcher|scraper|agent)\b/i;
        let seed = 7, nb = 0, bw = [];
        const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return seed / 4294967296; };
        const atoms = ['bot', 'Bot', 'BOT', 'crawler', 'spider', 'fetcher', 'scraper', 'agent', 'Agent', 'a', 'b', 'o', 't', 'x', '9', '.', '_', '-', ' ', '/', ';', '(', ')',
            'é', 'À', 'ß', 'ÿ', 'µ', 'z'.repeat(12), 'q'.repeat(20), 'ro', 'robot', 'abot', 'bots', 'bot_', '_bot', 'crawl', 'spid', 'K'];
        const corpus = [...Object.values(UA), 'x'.repeat(300) + 'bot', 'bot'.repeat(100), 'a.b-c_d'.repeat(40) + 'crawler', 'x'.repeat(39) + 'bot', 'x'.repeat(40) + 'bot', '.' + 'x'.repeat(39) + 'bot', 'Screaming Frog SEO Spider/19.0', 'meta-externalagent/1.1'];
        for (let k = 0; k < 300000 + corpus.length; k++) {
            let s = '';
            if (k < 300000) { const L = 1 + Math.floor(rnd() * 24); for (let a = 0; a < L; a++) s += atoms[Math.floor(rnd() * atoms.length)]; } else s = corpus[k - 300000];
            const m = RE.exec(s), want = m ? m[0].toLowerCase() : null, got = U._csBotWord(s.toLowerCase());
            nb++; if (want !== got && bw.length < 5) bw.push(JSON.stringify(s) + ' ' + want + ' / ' + got);
        }
        ok('U', bw.length === 0, '_csBotWord returns exactly the match of the regex it replaces (' + nb + ' random + corpus strings)', bw.join(' | '));
        // beyond the User-Agent cache: declared + ver kept, '<declared>|overflow', the declared name returned, a few microseconds a call
        const startWith = (api) => { const prev = process.env.TP_CRAWL_RANGES_FILE; process.env.TP_CRAWL_RANGES_FILE = FIXTURE; try { api._csStart(); } finally { if (prev === undefined) delete process.env.TP_CRAWL_RANGES_FILE; else process.env.TP_CRAWL_RANGES_FILE = prev; } };
        // the production path: edge trust on and a cf-ray on every request (so a claim is checked against its list)
        const mk = (ua, ip) => ({ method: 'GET', headers: { host: 'timesprayers.com', 'user-agent': ua, 'cf-connecting-ip': ip, 'cf-ray': RAY }, socket: { remoteAddress: '127.0.0.1' } });
        let declBad = 0;
        const recOn = (api, ua, ip) => { const p = '/hijri-date/1446-05-01'; const d = api._csRecord(mk(ua, ip), null, p, 'hijri-gone', 'gone', 1, undefined, undefined, p); if (d !== api._obsAgent(ua)) declBad++; };
        const corpusUA = [...Object.values(UA), '', 'Mozilla/5.0', 'curl/8.7.1', 'Dalvik/2.1.0 (Linux; U; Android 11)', 'Opera/9.80 (Windows NT 6.1) Presto/2.12.388 Version/12.16'];
        // (1) cached / memo path, (3) the overflow path: the declared name returned is exactly _obsAgent(ua)
        const V1 = loadBlock(EDGE, { log() {} }); startWith(V1);
        for (const ua of corpusUA) { recOn(V1, ua, '45.30.2.9'); recOn(V1, ua, '45.30.2.9'); }
        // (2) the cache filled by 2,000 FooCrawler User-Agents (one token), then 500 more of them and 100 Googlebot ones
        const logs = [];
        const V = loadBlock(EDGE, { log: (s) => logs.push(String(s)) }); startWith(V);
        for (let i = 0; i < 2000; i++) recOn(V, 'FooCrawler/1.0 (n' + i + ')', '45.30.1.9');
        for (let i = 0; i < 500; i++) recOn(V, 'FooCrawler/1.0 (m' + i + ')', '45.30.1.9');
        for (let i = 0; i < 100; i++) recOn(V, 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html) r' + i, '203.0.113.5');
        logs.length = 0; V._csFlush('w');
        const objs = logs.filter((l) => l.startsWith('[crawl-src] {')).map((l) => JSON.parse(l.slice(12)));
        const meta = objs.find((o) => o.t === 'src' && o.part === 0).meta;
        const tk = {}; for (const r of objs.filter((o) => o.t === 'tok').flatMap((o) => o.rows)) tk[r[0] + '|' + r[1]] = r;
        const sn = {}; for (const r of objs.filter((o) => o.t === 'src').flatMap((o) => o.rows)) { const k = r[0] + '|' + r[1] + '|' + r[2] + '|' + r[3]; sn[k] = (sn[k] || 0) + r[7]; }
        // (3) a full cache, then the corpus twice (declared check) and the cost of a call with a NEW 250-character User-Agent
        const V3 = loadBlock(EDGE, { log() {} }); startWith(V3);
        for (let i = 0; i < 2000; i++) recOn(V3, 'FooCrawler/1.0 (n' + i + ')', '45.30.1.9');
        for (const ua of corpusUA) { recOn(V3, ua, '45.30.2.9'); recOn(V3, ua, '45.30.2.9'); }
        const per = [];
        for (let b = 0; b < 40; b++) {
            const reqs = Array.from({ length: 250 }, (_, i) => { let s = 'u' + (b * 250 + i).toString(36) + 'q'; while (s.length < 250) s += ((b * 250 + i) * 31 + s.length) % 36; return mk(s.slice(0, 250), '66.249.66.' + (1 + i % 250)); });
            const t0 = process.hrtime.bigint();
            for (const r of reqs) V3._csRecord(r, null, '/moon/saudi-arabia/riyadh/2026/10/01', 'moon-gone', 'gone', 1, undefined, undefined, '/moon/saudi-arabia/riyadh/2026/10/01');
            per.push(Number(process.hrtime.bigint() - t0) / 250 / 1000);
        }
        per.sort((a, b) => a - b);
        const medUs = per[per.length >> 1];
        info('beyond the cache: meta ' + JSON.stringify({ ua_cache: meta.ua_cache, ua_ovf: meta.ua_ovf, total: meta.total }) + '; median ' + medUs.toFixed(2) + ' us a call with a new 250-char User-Agent');
        ok('U', declBad === 0, '_csRecord returns exactly _obsAgent(ua) (cached, memo, beyond the cache; ' + (corpusUA.length * 4 + 2600 + 2000) + ' calls) -- the value [moon-load] now reuses', String(declBad));
        ok('U', meta.ua_cache === 2000 && meta.ua_ovf === 600 && meta.total === 2600 && tk['other-bot|foocrawler'] && tk['other-bot|foocrawler'][2] === 2000 && typeof tk['other-bot|foocrawler'][4] === 'string'
            && tk['other-bot|overflow'] && tk['other-bot|overflow'][2] === 500 && tk['other-bot|overflow'][4] === null && tk['googlebot|-'] && tk['googlebot|-'][2] === 100
            && sn['hijri-gone|googlebot|-|x'] === 100 && sn['hijri-gone|other-bot|overflow|na'] === 500 && sn['hijri-gone|other-bot|foocrawler|na'] === 2000,
            'cache full (2,000): new User-Agents keep declared + ver (Googlebot from outside the ranges -> x, its own "-" token); a grouping class goes to "<declared>|overflow" (no sample); meta.ua_ovf = 600',
            JSON.stringify({ meta, tok: Object.keys(tk), src: sn }));
        ok('U', medUs < 20, 'a request with a NEW 250-character User-Agent beyond the cache costs ' + medUs.toFixed(2) + ' us (median of 40 x 250 calls; < 20 us -- the regex path took ~40)');
    } catch (e) { ok('run', false, 'unexpected error (unit)', e && e.stack || String(e)); }

    // ---- [Z] the offline analyser over the harvested lines (counts + two-worker servers), and the same harvest twice ----
    try {
        section('[Z] offline analyser');
        const H = path.join(TMP, 'harvest.txt');
        const lines = [];
        for (const s of [S.counts, S.two]) if (s) for (const l of s.lines) if (l.startsWith('[crawl-src]')) lines.push(l);
        fs.writeFileSync(H, lines.join('\n') + '\n');
        const J1 = path.join(TMP, 'an1.json'), J2 = path.join(TMP, 'an2.json');
        const run = (args) => { try { return { out: execFileSync(process.execPath, [path.join(ROOT, 'scripts', '_analyze_crawl_source_obs_1.mjs'), ...args], { encoding: 'utf8', maxBuffer: 64 << 20 }), code: 0 }; } catch (e) { return { out: String(e.stdout || '') + String(e.stderr || ''), code: e.status || 1 }; } };
        const a1 = run([H, '--json', J1]), a2 = run([H, H, '--json', J2]);
        ok('Z', a1.code === 0 && a2.code === 0, 'the analyser runs on the harvest (exit 0)', (a1.out + a2.out).slice(-400));
        const j1 = JSON.parse(fs.readFileSync(J1, 'utf8')), j2 = JSON.parse(fs.readFileSync(J2, 'utf8'));
        const tot = (j) => j.families.reduce((s, f) => s + f.n, 0);
        ok('Z', j1.coverage.hasTs === true && !/needs timestamps/.test(a1.out) && j1.processes.length === 3, 'header ts / boot: windows are timed and the 3 worker processes kept apart (no "needs timestamps")', JSON.stringify({ hasTs: j1.coverage.hasTs, processes: j1.processes }));
        ok('Z', tot(j1) === j1.coverage.metaTotal && tot(j2) === tot(j1) && j2.coverage.dup > 0, 'the same harvest twice: every line kept once by boot / seq (totals unchanged, ' + j2.coverage.dup + ' duplicates dropped)', tot(j1) + ' / ' + tot(j2));
        const gsu = j1.source_urls.filter((x) => x.family === 'moon-gone' && x.declared === 'googlebot' && x.ver === 'v');
        const ck = j1.cache_keys.find((x) => x.family === 'hijri-cal-future');
        ok('Z', gsu.length === 1 && Math.abs(gsu[0].distinct_urls - 326) <= 326 * 0.4 && ck && ck.with_query === 1 && ck.distinct_paths === 3 && ck.distinct_keys === 4
            && j1.year_offsets.some((x) => x.family === 'moon-month') && /\(6a\) year offset/.test(a1.out) && /\(4a\) by cache key/.test(a1.out),
            'per-source distinct URLs merged over workers / windows (Googlebot moon-gone ≈ 301 + 25), cache keys vs paths (hijri-cal-future 3 / 4), year-offset table', JSON.stringify({ gsu, ck }));
        // owner conditions 2 + 3: every ver value explained as defined, confidence apart from the declared name, per-window meta, no verdict words
        const verTxt = ["'v'  verified list match", "'x'  mismatch with the loaded list", "'np' no list for this crawler", "'u'  unverifiable source", "'err' snapshot unavailable", "'na' no checked claim"];
        const missT = verTxt.filter((t) => !a1.out.includes(t));
        const wm = j1.windows || [];
        const metasH = lines.filter((l) => l.startsWith('[crawl-src] {')).map((l) => JSON.parse(l.slice(12))).filter((o) => o.t === 'src' && o.part === 0).map((o) => o.meta);
        const unH = metasH.reduce((s, m) => s + (m.unattested || 0), 0);
        ok('Z', missT.length === 0 && /\(0b\) per worker window/.test(a1.out) && /confidence/.test(a1.out) && wm.length === metasH.length
            && wm.every((w) => w.edge_trust === 1 && w.ranges_state === 'ok') && wm.reduce((s, w) => s + (w.unattested || 0), 0) === unH && unH >= 3 && j1.ver_meaning && Object.keys(j1.ver_meaning).length === 6,
            'analyser: explains all six ver values, prints confidence apart from the declared name, reports edge_trust / ranges_state / unattested per worker window (unattested ' + unH + ' = the harvested meta, >= the 3 [C] claims G26 / G27 / G29)', missT.join(' | ') + ' ' + JSON.stringify(wm.slice(0, 3)));
        const forb = (a1.out + JSON.stringify(j1)).match(/spoof\w*|non-?human|not human|\bhuman\b|\bbots? (?:are|is) (?:fake|real)\b/gi) || [];
        const srcTxt = fs.readFileSync(path.join(ROOT, 'scripts', '_analyze_crawl_source_obs_1.mjs'), 'utf8').match(/spoof\w*|non-?human|not human|\bhuman\b/gi) || [];
        ok('Z', forb.length === 0 && srcTxt.length === 0, 'analyser output and source: no "spoofed" and no "human" / "not human" wording', forb.concat(srcTxt).slice(0, 5).join(','));
    } catch (e) { ok('run', false, 'unexpected error (analyser)', e && e.stack || String(e)); }

    // ---- [X] file checks ----
    try {
        section('[X] server.js');
        const buf = fs.readFileSync(path.join(ROOT, 'server.js'));
        let cr = 0, lf = 0, crlf = 0;
        for (let i = 0; i < buf.length; i++) { if (buf[i] === 13) { cr++; if (buf[i + 1] === 10) crlf++; } else if (buf[i] === 10) lf++; }
        ok('X', cr === lf && crlf === lf, 'CRLF everywhere: ' + lf + ' lines, ' + cr + ' CR, ' + crlf + ' CRLF');
        let chk = 'ok'; try { execFileSync(process.execPath, ['--check', path.join(ROOT, 'server.js')], { stdio: 'pipe' }); } catch (e) { chk = String(e.stderr || e.message); }
        ok('X', chk === 'ok', 'node --check server.js', chk);
        // the owner-approved snapshot (2026-10-17), per-crawler format: date, a 'lists' block (sources + publisher creationTime),
        //   the ten list keys the server maps claims to, every CIDR valid; and the server loads it with no skipped entry
        {
            const SNAP = path.join(ROOT, 'data', 'crawler-ip-ranges.json');
            const LISTS = ['apple', 'bing', 'google-common', 'google-special', 'google-user', 'openai-chatgpt-user', 'openai-gptbot', 'openai-searchbot', 'perplexity-bot', 'perplexity-user'];
            let snapOk = false, snapInfo = 'absent', bad = [];
            try {
                const sj = JSON.parse(fs.readFileSync(SNAP, 'utf8'));
                const isIso = (t) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/.test(String(t)) && Number.isFinite(Date.parse(String(t).replace(/(\.\d{3})\d+/, '$1')));
                const cidrOk = (c) => {
                    if (typeof c !== 'string') return false;
                    const [a, l, extra] = c.split('/');
                    if (extra !== undefined || !/^\d{1,3}$/.test(l || '')) return false;
                    const v = net.isIP(a);
                    return (v === 4 && +l <= 32) || (v === 6 && +l <= 128);
                };
                const ops = Object.keys(sj.operators || {}).sort(), lists = Object.keys(sj.lists || {}).sort();
                if (!/^\d{4}-\d{2}-\d{2}$/.test(sj.date)) bad.push('date ' + sj.date);
                if (ops.join() !== LISTS.join()) bad.push('operators ' + ops.join('/'));
                if (lists.join() !== ops.join()) bad.push('lists ' + lists.join('/') + ' != operators');
                for (const k of ops) {
                    const L = (sj.lists || {})[k] || {}, arr = sj.operators[k];
                    if (!Array.isArray(L.sources) || !L.sources.length || !L.sources.every((u) => /^https:\/\/[a-z0-9.-]+\/\S+\.json$/i.test(u))) bad.push(k + ' sources ' + JSON.stringify(L.sources));
                    if (!Array.isArray(L.creationTime) || L.creationTime.length !== (L.sources || []).length || !L.creationTime.every(isIso)) bad.push(k + ' creationTime ' + JSON.stringify(L.creationTime));
                    if (L.prefixes !== undefined && L.prefixes !== arr.length) bad.push(k + ' prefixes ' + L.prefixes + ' != ' + arr.length);
                    if (!Array.isArray(arr) || !arr.length) bad.push(k + ' empty');
                    const inv = (arr || []).filter((c) => !cidrOk(c));
                    if (inv.length) bad.push(k + ' invalid CIDRs ' + inv.slice(0, 3).join(','));
                }
                // every list key is one the server maps a claim to (none would become a User-Agent substring claim)
                const OPS0 = loadBlock().OPS0;
                const unknown = ops.filter((k) => !OPS0.includes(k));
                if (unknown.length) bad.push('keys the server does not map a claim to: ' + unknown.join(','));
                // the server loads it: every list compiled, nothing skipped
                const logsS = [];
                const Sx = loadBlock(EDGE, { log: (s) => logsS.push(String(s)) });
                const prev = process.env.TP_CRAWL_RANGES_FILE; process.env.TP_CRAWL_RANGES_FILE = SNAP;
                try { Sx._csStart(); } finally { if (prev === undefined) delete process.env.TP_CRAWL_RANGES_FILE; else process.env.TP_CRAWL_RANGES_FILE = prev; }
                const enS = logsS.find((l) => / ENABLED /.test(l)) || '';
                const opsS = ((enS.match(/ ops=(\S+)/) || [])[1] || '').split(',');
                if (!enS.includes(' ranges=' + sj.date + ' ') || opsS.length !== LISTS.length || opsS.some((x) => /-bad/.test(x) || /:0\+0$/.test(x))) bad.push('server load: ' + enS.slice(0, 400));
                const nC = ops.reduce((s, k) => s + sj.operators[k].length, 0);
                snapOk = bad.length === 0;
                snapInfo = 'date ' + sj.date + ', ' + ops.length + ' lists (' + ops.join('/') + '), ' + nC + ' CIDRs; creationTime ' + ops.map((k) => k + ' ' + String(sj.lists[k].creationTime[0]).slice(0, 10)).join(', ');
            } catch (e) { snapInfo = String(e.message || e); bad.push(snapInfo); }
            ok('X', snapOk, 'data/crawler-ip-ranges.json (owner-approved official snapshot) has the per-crawler format and loads cleanly: ' + snapInfo, bad.slice(0, 6).join(' | '));
        }
    } catch (e) { ok('run', false, 'unexpected error (files)', e && e.stack || String(e)); }

    for (const s of kids) killSrv(s);
    await sleep(800);
    section('[N] outbound guard');
    for (const s of kids) { const log = fs.existsSync(s.guardOut) ? fs.readFileSync(s.guardOut, 'utf8').trim() : ''; ok('N', log === '', s.tag + ': no outbound connection / DNS / fetch attempt', log.split('\n').slice(0, 3).join(' | ')); }

    if (S.examples) { console.log('\n== example [crawl-src] lines (counts run) =='); for (const l of S.examples) console.log('  ' + l.slice(0, 1200)); }
    console.log('\n== per section ==');
    for (const [k, v] of Object.entries(SEC)) console.log('  ' + k.padEnd(4) + ' pass ' + String(v.pass).padStart(4) + '  fail ' + String(v.fail).padStart(4));
    console.log('\n' + (fail === 0 ? 'PASS' : 'FAIL') + '  ' + pass + ' passed, ' + fail + ' failed');
    if (fails.length) { console.log('\nFailures:'); for (const f of fails.slice(0, 200)) console.log('  - ' + f); }
    if (process.env.TP_KEEP_TMP !== '1') { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (_) {} }
    process.exit(fail === 0 ? 0 : 1);
}
main();
