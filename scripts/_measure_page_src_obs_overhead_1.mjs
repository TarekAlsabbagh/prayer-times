// PAGE-SOURCE-OBSERVABILITY-1 -- cost measurement (127.0.0.1 only; no production request).
//
//   [U] unit: the [page-src] record (_psRecord) extracted from server.js with everything it calls and run in this process,
//       with the REAL crawler-range snapshot (data/crawler-ip-ranges.json) and edge trust on (the production path, list
//       lookups included). One run = one fresh worker window of 2,000 records (so every run pays the first-sight
//       classification of its User-Agents and prefixes), >= 60 runs a scenario after a warm-up; per-call CPU time per run
//       -> median / p95 / max over the runs, + the flush time of a window and its bytes. Rows exist for SG traffic only
//       (closure round 2026-10-19): any other request is counted and returns early, so every scenario but 'realistic'
//       is all SG (the full path) -- the worst cases. Scenarios:
//         realistic  a human-heavy mix (25 browser User-Agents, ~3,000 /24s, 40 countries -- SG one of them) + Googlebot /
//                    Bingbot / Applebot claims (inside their lists, US) + other bots + no User-Agent
//         sgwave     the GA4 pattern: Chrome on Windows, Singapore, /es/ + /ms/ city pages, a new /24 for most requests
//         claims     SG, every request claims a listed crawler, half from inside its list, half from outside
//         advua      SG, a NEW 250-character User-Agent every request (beyond the User-Agent cache)
//         atua       SG, a NEW 250-character User-Agent carrying an e-mail address every request
//         longua     SG, four 15,500-character browser User-Agents, repeated (the first 512 characters read, cached)
//         pool       SG, a scraper rotating 20,000 browser User-Agents
//         ipv6       SG, declared browsers over IPv6 (the /32 cut), a new /32 for most requests
//       TP_UNIT_BEFORE=<a server.js>: the same scenarios also run on that file's block (e.g. the previous commit), in the
//       order before, after, after, before (two measurements each) -> before / after per scenario.
//   [C] log ceiling (--logcap): [page-src] bytes of one worker window under an adversarial ALL-SG mix (rows are SG only)
//       -- the previous ceiling mix of [L] with SG as the country, and a maximal-bytes mix (150 wide top rows: the longest
//       token form 'browser:samsung-1xx:android', 'partial+ch', the longest family, shown /24s with 3-digit octets, long
//       counters; one 'rest' row for every hour x family x declared class incl. the key-cap overflow) -- once with the
//       whole window inside one UTC hour and once with the window across an hour boundary (Date.now stepped from HH:58:30
//       to HH+1:00:30) -> bytes / lines / rows per window, the across / inside ratio, and the hour / day ceiling for two
//       workers (12 windows an hour per worker, at most one of them across the boundary); + the line of a window with no
//       SG request (meta only).
//   [H] in-process memory (--memunit, needs node --expose-gc): per scenario (realistic and sgwave at 1,000 records a
//       window -- the observed peak hour, ~1,000 per worker window -- and the cap mix, 50,000 SG records reaching every
//       cap), 6 windows each: HELD = the live window state just before the flush (forced GC; it lives at most one window,
//       5 minutes); TRANSIENT PEAK = the highest heapUsed + arrayBuffers seen during the batch and right after the flush
//       without forcing GC (garbage included: short-lived, collected by the next GC); AFTER = what stays after the flush
//       (forced GC); + what stays after all windows.
//   [A] server A/B, TP_AB_RUNS (default 30) runs per arm, three arms every run in a rotating order: the production tree
//       (TP_BASE_ROOT), the candidate with the measurement OFF (TP_PAGE_SRC_OBS=0) and ON (edge trust + the real snapshot).
//       One worker each, pinned to the same logical CPU; closed loop, 16 connections, TP_AB_REQ (default 4,000) requests a
//       run -- the trailing-slash 301 of a city page (the cheapest answer of these families, so a fixed per-request cost is
//       the largest share of it; TP_AB_REAL_PCT = % of SSR-cached pages instead, default 0), with a production-like header
//       mix (attested, real snapshot: browsers, verified crawlers, other bots) -> worker CPU
//       us per request (process CPU time / responses; Windows reports CPU time in 15.6 ms ticks) and client p50 / p95;
//       TP_AB_FRESH=1 boots three fresh processes for every run (a per-process bias then averages out);
//       median / p95 per arm over the runs, the OFF - base and ON - OFF differences with the run-to-run spread.
//   [M] memory A/B: TP_MEM_ROUNDS (default 3) rounds, each a fresh ON and a fresh OFF server (alternating first), each
//       hit by the same 50,000-request burst (90 % SG, 50,000 /24s, varied User-Agents); the worker's [proc] rss / heapTotal /
//       heapUsed / external maxima during the burst and the values ~20 s after it. TP_MEM_PAIR=1: both servers booted
//       together and kept running, the bursts one after the other (the layout of the smoke's [B] section).
//   [L] log volume: [page-src] bytes per hour, two workers, 12 windows an hour, at the city-family volumes observed on
//       production ([req-family] harvests 2026-10-18/19: ~1,300-2,050 requests an hour for the four city families, a 23,860
//       peak; prayer-country adds ~1-3 %), with the source
//       mix taken from a [crawl-src] harvest (declared / token / ver / bcls / country / prefix, weighted by n; '*' rows =
//       a new /24 every request) -- a deliberately diverse proxy; + the hard ceiling (every cap reached every window).
// Usage: node --expose-gc scripts/_measure_page_src_obs_overhead_1.mjs [--unit] [--ab] [--mem] [--memunit] [--logs] [--logcap]   (no flag = all)
//        env TP_BASE_ROOT, TP_GUARD, TP_AB_RUNS, TP_AB_REQ, TP_AB_REAL_PCT, TP_AB_FRESH, TP_MEM_ROUNDS, TP_HARVEST (a [crawl-src]
//        harvest log), TP_UNIT_BEFORE, TP_OUT (json), TP_MEASURE_PORT_BASE (the first of 5 local ports, default 9851)
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_ROOT = process.env.TP_BASE_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-pagesrc-base';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const HARVEST = process.env.TP_HARVEST || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/crawl/harvest/crawlsrc-24h-202610180738-1038.log';
const AFF_SERVER = Number(process.env.TP_AB_AFFINITY || 4);   // logical CPU 2
const MPB = Number(process.env.TP_MEASURE_PORT_BASE || 9851);   // 5 consecutive local ports from MPB
const PORTS = { base: MPB, off: MPB + 1, on: MPB + 2, mon: MPB + 3, moff: MPB + 4 };
// [A]: the share (%) of real (SSR-cached, compressed) city pages in a run; the rest are the trailing-slash 301 of the
//   family (default 0: a cached page costs ~5 ms of compression a request locally, which buries a microsecond-sized
//   difference in noise; the measured record runs the same for every status)
const AB_REAL_PCT = Number(process.env.TP_AB_REAL_PCT || 0);
const RAY = '8c0d3f2a1b4e5f67-SIN';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor((s.length - 1) / 2)] : null; };
const pct = (a, p) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const r3 = (x) => x === null ? null : +x.toFixed(3);
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-pagesrc-ab-'));
const args = new Set(process.argv.slice(2));
const all = !['--unit', '--ab', '--mem', '--memunit', '--logs', '--logcap'].some((a) => args.has(a));
const out = { when: new Date().toISOString(), tree: ROOT, base: BASE_ROOT };

// ---------- the block, extracted from server.js (or from another server.js: file) ----------
function loadBlock(env = {}, file = path.join(ROOT, 'server.js')) {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
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
        constAt('_OBS_NAMED_BOTS'), fnAt('_obsAgent'), constAt('_shedEnvInt'), constAt('_ML_AGENT_CLASS'), constAt('_ML_EDGES'), constAt('_ML_BUCKET_COLS'),
        lines.slice(b0, b1 - 1).join('\n')].join('\n');
    const logs = [];
    const saved = {}; for (const [k, v] of Object.entries(env)) { saved[k] = process.env[k]; process.env[k] = v; }
    try {
        // eslint-disable-next-line no-new-func
        const api = new Function('require', 'process', 'console', 'fs', 'path', 'zlib', 'ROOT', 'performance', '_ML_ON', '_ML_WINDOW_S', 'TP_WORKER_ID', '_OBS_WTAG',
            code + '\nreturn { _psRecord, _psFlush, _psStart };')(require, process, { log: (s) => logs.push(String(s)) }, fs, path, zlib, ROOT, performance, true, 300, 1, ' worker=1');
        api.logs = logs;
        api._psStart();   // TP_CRAWL_RANGES_FILE (if any) is still set here
        return api;
    } finally { for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; } }
}

// ---------- request mixes ----------
const BROWSERS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
];
for (let i = 0; i < 13; i++) BROWSERS.push('Mozilla/5.0 (Linux; Android 1' + (i % 5) + '; SM-A' + (100 + i * 7) + ') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/1' + (30 + i) + '.0.0.0 Mobile Safari/537.36');
const BOTS = [
    ['Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', (i) => '66.249.66.' + (1 + i % 250)],
    ['Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.7390.122 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', (i) => '66.249.68.' + (1 + i % 250)],
    ['Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)', (i) => '157.55.39.' + (1 + i % 250)],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)', (i) => '17.241.75.' + (1 + i % 250)],
];
const OTHER = ['python-requests/2.31.0', 'curl/8.4.0', 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)', 'Mozilla/5.0 (compatible; ShapBot/0.1.0)', 'Go-http-client/1.1'];
const CCS = 'US,SA,EG,IN,PK,ID,MY,SG,DE,FR,GB,TR,BD,MA,DZ,AE,KW,QA,JO,IQ,NG,CA,AU,NL,ES,IT,SE,BE,CH,AT,RU,KZ,UZ,TN,LY,SD,SO,YE,OM,BH'.split(',');
const FAMS = ['prayer-city', 'qibla-city', 'next-prayer-city', 'time-left-city'];
const FAM_URL = ['/prayer-times-in-', '/qibla-in-', '/next-prayer-in-', '/time-left-until-next-prayer-in-'];
const LANGS = ['', '', '', '', '/en', '/en', '/fr', '/tr', '/ur', '/de', '/id', '/es', '/bn', '/ms'];
const FULLH = { 'sec-fetch-mode': 'navigate', 'sec-fetch-dest': 'document', 'accept-language': 'ar,en;q=0.8', accept: 'text/html,*/*', 'sec-ch-ua': '"Chromium";v="141"' };
// a varied browser User-Agent (Chrome major 1..199 x 5 OS: enough distinct tokens to reach the 300 cap)
const OSES = ['Windows NT 10.0; Win64; x64', 'Linux; Android 10; K', 'X11; Linux x86_64', 'Macintosh; Intel Mac OS X 10_15_7', 'X11; CrOS x86_64 14541.0.0'];
const vbrowser = (k) => 'Mozilla/5.0 (' + OSES[k % 5] + ') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + (1 + (k * 7) % 199) + '.0.' + (k % 3000) + '.1 Safari/537.36';
const LONG_UAS = [0, 1, 2, 3].map((k) => { let s = BROWSERS[k] + ' x' + k + ' '; while (s.length < 15500) s += 'abcdefghij klmnopqrstu vwxyz '; return s.slice(0, 15500); });
function profile(i, scen) {
    const h = { host: 'timesprayers.com', 'accept-encoding': 'gzip, deflate, br', 'cf-ray': RAY };
    let fi = [0, 0, 0, 1, 1, 2, 3][i % 7], lang = LANGS[(i * 5) % LANGS.length];
    if (scen === 'ipv6') {
        const ip = '2a02:' + ((i * 13) % 65536).toString(16) + ':' + ((i * 7) % 65536).toString(16) + '::' + (1 + i % 250).toString(16);
        Object.assign(h, { 'user-agent': BROWSERS[i % 3], 'cf-connecting-ip': ip, 'cf-ipcountry': 'SG', accept: 'text/html' });
    } else if (scen === 'sgwave') {
        Object.assign(h, { 'user-agent': BROWSERS[i % 2], 'cf-connecting-ip': (43 + i % 4) + '.' + ((i * 13) % 250) + '.' + ((i * 7) % 250) + '.' + (1 + i % 250), 'cf-ipcountry': 'SG', accept: 'text/html' });
        lang = i % 2 ? '/es' : '/ms'; fi = i % 4;
    } else if (scen === 'claims') {
        const b = BOTS[i % BOTS.length];
        Object.assign(h, { 'user-agent': b[0], 'cf-connecting-ip': (i >> 1) % 2 === 0 ? b[1](i) : (31 + i % 150) + '.' + (i % 256) + '.9.' + (1 + i % 250), 'cf-ipcountry': 'SG' });
    } else if (scen === 'advua') {
        let s = 'u' + i.toString(36) + 'q';
        while (s.length < 250) s += ((i * 31 + s.length) % 36).toString(36);
        Object.assign(h, { 'user-agent': s, 'cf-connecting-ip': (11 + i % 200) + '.' + (i % 256) + '.7.' + (1 + i % 250), 'cf-ipcountry': 'SG' });
    } else if (scen === 'atua') {
        let s = 'u' + i.toString(36) + 'q@mail' + (i % 7) + '.example/1.0 ';
        while (s.length < 250) s += ((i * 31 + s.length) % 36).toString(36);
        Object.assign(h, { 'user-agent': s, 'cf-connecting-ip': (11 + i % 200) + '.' + (i % 256) + '.7.' + (1 + i % 250), 'cf-ipcountry': 'SG' });
    } else if (scen === 'longua') {
        Object.assign(h, { 'user-agent': LONG_UAS[i % 4], 'cf-connecting-ip': (43 + i % 4) + '.' + ((i * 13) % 250) + '.' + ((i * 7) % 250) + '.' + (1 + i % 250), 'cf-ipcountry': 'SG', accept: 'text/html' });
    } else if (scen === 'pool') {
        const k = (i * 7919) % 20000;
        Object.assign(h, { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + (100 + k % 40) + '.0.' + (k % 6000) + '.' + (k % 200) + ' Safari/537.36',
            'cf-connecting-ip': (11 + k % 200) + '.' + (k % 256) + '.7.' + (1 + k % 250), 'cf-ipcountry': 'SG', accept: 'text/html' });
    } else {   // realistic
        const r = i % 20;
        if (r < 14) {
            Object.assign(h, { 'user-agent': BROWSERS[(i * 7) % BROWSERS.length], 'cf-connecting-ip': (20 + (i * 7) % 180) + '.' + ((i * 13) % 250) + '.' + (i % 17) + '.' + (1 + i % 250), 'cf-ipcountry': CCS[(i * 3) % CCS.length] });
            if (i % 3) Object.assign(h, FULLH);
        } else if (r < 17) { const b = BOTS[i % BOTS.length]; Object.assign(h, { 'user-agent': b[0], 'cf-connecting-ip': b[1](i), 'cf-ipcountry': 'US' }); }
        else if (r < 19) Object.assign(h, { 'user-agent': OTHER[i % OTHER.length], 'cf-connecting-ip': (100 + i % 50) + '.' + (i % 200) + '.3.' + (1 + i % 250), 'cf-ipcountry': CCS[i % 9] });
        else Object.assign(h, { 'cf-connecting-ip': (60 + i % 50) + '.1.' + (i % 200) + '.4', 'cf-ipcountry': 'XX' });
    }
    return { req: { method: i % 9 === 0 ? 'HEAD' : 'GET', headers: h, socket: { remoteAddress: '10.0.0.1' } }, fi, path: lang + FAM_URL[fi] + ['makkah', 'cairo', 'riyadh', 'jakarta', 'karachi'][i % 5] };
}

// ---------- [U] ----------
function unit() {
    const res = { ranges: 'data/crawler-ip-ranges.json', edge_trust: 1 };
    const OUTS = ['2xx', '2xx', '2xx', '2xx', '3xx', '4xx'];
    const BEFORE = process.env.TP_UNIT_BEFORE || '';
    if (BEFORE) res.before_file = BEFORE;
    // one measurement of a scenario on one block: 60 fresh windows of 2,000 records after 40 warm-up windows
    const measure = (scen, file) => {
        const api = loadBlock({ TP_CRAWL_SOURCE_EDGE_TEST: '1' }, file);
        const B = 2000, RUNS = 60;
        const fresh = scen === 'advua' || scen === 'atua' || scen === 'pool';
        const pre = fresh ? null : Array.from({ length: 8192 }, (_, i) => profile(i, scen));
        const batch = (b) => fresh ? Array.from({ length: B }, (_, j) => profile(b * B + j, scen)) : null;
        const run = (b, cur) => { for (let j = 0; j < B; j++) { const i = b * B + j, x = cur ? cur[j] : pre[i & 8191]; api._psRecord(x.req, x.fi, x.path, OUTS[i % 6], (i % 97) * 0.9); } };
        for (let b = 0; b < 40; b++) { run(1000 + b, batch(1000 + b)); api._psFlush('w'); }   // warm-up (JIT)
        api.logs.length = 0;
        const per = [], flushMs = [], bytes = [], lines = [];
        for (let b = 0; b < RUNS; b++) {
            const cur = batch(b);
            const t0 = process.hrtime.bigint();
            run(b, cur);
            const t1 = process.hrtime.bigint();
            api.logs.length = 0;
            api._psFlush('w');
            const t2 = process.hrtime.bigint();
            per.push(Number(t1 - t0) / B / 1000);
            flushMs.push(Number(t2 - t1) / 1e6);
            const ls = api.logs.filter((l) => l.startsWith('[page-src] {'));
            bytes.push(ls.reduce((s, l) => s + Buffer.byteLength(l) + 1, 0)); lines.push(ls.length);
        }
        return { per, flushMs, bytes, lines, B };
    };
    const summary = (ms) => {
        const per = ms.flatMap((m) => m.per), flushMs = ms.flatMap((m) => m.flushMs), bytes = ms.flatMap((m) => m.bytes), lines = ms.flatMap((m) => m.lines);
        return { runs: per.length, records_per_run: ms[0].B, us_per_record: { median: r3(med(per)), p95: r3(pct(per, 0.95)), max: r3(Math.max(...per)) },
            flush_ms: { median: r3(med(flushMs)), p95: r3(pct(flushMs, 0.95)) }, bytes_per_window: med(bytes), lines_per_window: med(lines) };
    };
    for (const scen of ['realistic', 'sgwave', 'claims', 'advua', 'atua', 'longua', 'pool', 'ipv6']) {
        if (!BEFORE) { res[scen] = summary([measure(scen)]); console.log('[U] ' + scen + ' ' + JSON.stringify(res[scen])); continue; }
        // before, after, after, before: the drift of a long run then falls on both arms alike
        const mb = [], ma = [];
        mb.push(measure(scen, BEFORE)); ma.push(measure(scen)); ma.push(measure(scen)); mb.push(measure(scen, BEFORE));
        res[scen] = { before: summary(mb), after: summary(ma) };
        res[scen].after_minus_before_us = { median: r3(res[scen].after.us_per_record.median - res[scen].before.us_per_record.median),
            p95: r3(res[scen].after.us_per_record.p95 - res[scen].before.us_per_record.p95) };
        console.log('[U] ' + scen + ' ' + JSON.stringify(res[scen]));
    }
    return res;
}

// ---------- servers ----------
const kids = [];
const ps = (cmd) => execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', cmd], { encoding: 'utf8' }).trim();
const rawGet = (port, p, h, agent, method = 'GET') => new Promise((res) => {
    const t0 = performance.now();
    const r = http.request({ host: '127.0.0.1', port, path: p, method, headers: h, agent }, (x) => { x.resume(); x.on('end', () => res({ st: x.statusCode, ms: performance.now() - t0 })); });
    r.setTimeout(60000, () => r.destroy(new Error('timeout')));
    r.on('error', () => res({ st: 0, ms: performance.now() - t0 })); r.end();
});
async function boot(root, port, tag, extra = {}) {
    const env = { ...process.env };
    for (const k of Object.keys(env)) if (/^(TP_|NODE_OPTIONS$|GA_MEASUREMENT_ID$|SUPABASE_|LOCATIONIQ_KEY$|RENDER$|RENDER_)/.test(k)) delete env[k];
    Object.assign(env, { PORT: String(port), WEB_CONCURRENCY: '1', ADSENSE_CLIENT: 'off', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', TP_MOON_DAY_SHED: '0',
        TP_SSR_CACHE: '1', TP_REQUEST_OBSERVABILITY: '1', NODE_ENV: 'production', TP_MOON_LOAD_OBS_PROC_S: '5', SITE_URL: 'https://timesprayers.com',
        TP_CRAWL_SOURCE_EDGE_TEST: '1', GUARD_OUT: path.join(TMP, 'guard-' + tag + '.log') }, extra);
    const k = spawn(process.execPath, ['-r', GUARD, 'server.js'], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
    const srv = { tag, port, k, lines: [], tlines: [], buf: '' };
    const take = (d) => { srv.buf += d; let i; while ((i = srv.buf.indexOf('\n')) !== -1) { const l = srv.buf.slice(0, i).replace(/\r$/, ''); srv.lines.push(l); srv.tlines.push({ t: Date.now(), l }); srv.buf = srv.buf.slice(i + 1); } };
    k.stdout.on('data', take); k.stderr.on('data', take);
    kids.push(srv);
    for (let i = 0; i < 300; i++) { if ((await rawGet(port, '/health', {}, false)).st === 200) break; await sleep(300); }
    srv.worker = +ps('(Get-CimInstance Win32_Process -Filter "ParentProcessId=' + k.pid + '" | Select-Object -First 1).ProcessId');
    ps('(Get-Process -Id ' + k.pid + ').ProcessorAffinity = [IntPtr]' + AFF_SERVER + '; (Get-Process -Id ' + srv.worker + ').ProcessorAffinity = [IntPtr]' + AFF_SERVER);
    return srv;
}
const killSrv = (srv) => { try { execFileSync('taskkill', ['/PID', String(srv.k.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} };
const cpuMs = (pid) => +ps('(Get-Process -Id ' + pid + ').TotalProcessorTime.TotalMilliseconds');
async function loop(port, n, conc, seed) {
    const agent = new http.Agent({ keepAlive: true, maxSockets: conc });
    let i = 0; const lat = []; let ok = 0;
    await Promise.all(Array.from({ length: conc }, async () => {
        while (i < n) {
            const k = seed + i++;
            const x = profile(k, 'realistic');
            const p = x.path + (k % 100 < AB_REAL_PCT ? '' : '/');
            const r = await rawGet(port, p, x.req.headers, agent, x.req.method);
            lat.push(r.ms); if (r.st) ok++;
        }
    }));
    agent.destroy();
    return { ok, lat };
}

// ---------- [A] ----------
async function ab() {
    const RUNS = Number(process.env.TP_AB_RUNS || 30), N = Number(process.env.TP_AB_REQ || 4000);
    // TP_AB_FRESH=1: three FRESH processes every run (a per-process bias -- heap layout, JIT, the core it lands on -- then
    //   averages out over the runs instead of sticking to one arm); default: one process per arm for all runs
    const FRESH = process.env.TP_AB_FRESH === '1';
    const S = {};
    const bootAll = async () => { [S.base, S.off, S.on] = await Promise.all([boot(BASE_ROOT, PORTS.base, 'base'), boot(ROOT, PORTS.off, 'off', { TP_PAGE_SRC_OBS: '0' }), boot(ROOT, PORTS.on, 'on')]); };
    const arms = ['base', 'off', 'on'];
    await bootAll();
    // warm-up: SSR cache + JIT on every arm
    for (const a of arms) await loop(S[a].port, 3000, 16, 0);
    const per = { base: [], off: [], on: [] }, p50 = { base: [], off: [], on: [] }, p95 = { base: [], off: [], on: [] };
    const orders = [['base', 'off', 'on'], ['off', 'on', 'base'], ['on', 'base', 'off']];
    for (let r = 0; r < RUNS; r++) {
        if (FRESH && r > 0) {
            const en = S.on.lines.find((l) => /^\[page-src\] worker=\d+ ENABLED/.test(l));
            for (const a of arms) killSrv(S[a]);
            await sleep(1500);
            await bootAll();
            if (en && !S.on.lines.some((l) => /^\[page-src\] worker=\d+ ENABLED/.test(l))) S.on.lines.push(en);
            for (const a of arms) await loop(S[a].port, 1500, 16, 0);
        }
        for (const a of orders[r % 3]) {
            const c0 = cpuMs(S[a].worker);
            const x = await loop(S[a].port, N, 16, 100000 + r * N);
            const c1 = cpuMs(S[a].worker);
            per[a].push((c1 - c0) * 1000 / x.ok); p50[a].push(med(x.lat)); p95[a].push(pct(x.lat, 0.95));
        }
        if ((r + 1) % 5 === 0) console.log('[A] run ' + (r + 1) + '/' + RUNS + ' us/req medians so far ' + arms.map((a) => a + ' ' + r3(med(per[a]))).join(', '));
    }
    const enOn = S.on.lines.find((l) => /^\[page-src\] worker=\d+ ENABLED/.test(l)) || '';
    const rowsOn = S.on.lines.filter((l) => l.startsWith('[page-src] {')).length;
    for (const a of arms) killSrv(S[a]);
    const res = { runs: RUNS, requests_per_run: N, fresh_processes_every_run: FRESH, mix: (100 - AB_REAL_PCT) + '% trailing-slash 301 of a city page, ' + AB_REAL_PCT + '% SSR-cached city page; realistic header mix (attested, real snapshot)', enabled_on: enOn.replace(/ boot=\w+$/, ''), page_src_lines_on: rowsOn };
    for (const a of arms) res[a] = { worker_us_per_req: { median: r3(med(per[a])), p95: r3(pct(per[a], 0.95)), min: r3(Math.min(...per[a])), max: r3(Math.max(...per[a])) },
        client_ms: { p50: r3(med(p50[a])), p95: r3(med(p95[a])) } };
    const diff = (x, y) => per[x].map((v, i) => v - per[y][i]);
    res.on_minus_off_us = { median: r3(med(diff('on', 'off'))), p95: r3(pct(diff('on', 'off'), 0.95)), p05: r3(pct(diff('on', 'off'), 0.05)) };
    res.off_minus_base_us = { median: r3(med(diff('off', 'base'))), p95: r3(pct(diff('off', 'base'), 0.95)), p05: r3(pct(diff('off', 'base'), 0.05)) };
    console.log('[A] ' + JSON.stringify(res));
    return res;
}

// ---------- [M] ----------
async function burst(port, N, conc) {
    const agent = new http.Agent({ keepAlive: true, maxSockets: conc });
    let i = 0;
    await Promise.all(Array.from({ length: conc }, async () => {
        while (i < N) {
            const k = i++;
            const u = LANGS[(k * 7) % LANGS.length] + FAM_URL[k % 4] + ['makkah', 'cairo', 'riyadh', 'medina', 'jeddah', 'dubai'][k % 6] + (k % 50 === 0 ? '' : '/');
            const ua = k % 5 === 0 ? 'Probe' + (k % 1000) + 'Bot/1.' + (k % 7) + ' (+https://example.net/bot)' : vbrowser(k);
            await rawGet(port, u, { host: 'timesprayers.com', 'user-agent': ua, 'cf-connecting-ip': (11 + (k % 200)) + '.' + (((k / 200) | 0) % 250) + '.' + ((k * 7) % 250) + '.' + (1 + k % 250),
                'cf-ray': RAY, 'cf-ipcountry': k % 10 === 7 ? String.fromCharCode(65 + k % 26, 66 + (k >> 5) % 24) : 'SG', accept: 'text/html' }, agent, k % 10 === 0 ? 'HEAD' : 'GET');
        }
    }));
    agent.destroy();
}
const procs = (srv, t0, t1) => srv.tlines.filter((x) => x.t >= t0 && x.t <= t1 && x.l.startsWith('[proc] {')).map((x) => JSON.parse(x.l.slice(7)));
async function mem() {
    const ROUNDS = Number(process.env.TP_MEM_ROUNDS || 3);
    // TP_MEM_PAIR=1: both servers booted together and left running, the bursts one after the other (the smoke's [B]
    //   layout, where the second server waits idle ~2 minutes before its burst); default: a fresh server per burst
    const PAIR = process.env.TP_MEM_PAIR === '1';
    const res = { rounds: [], pair: PAIR, burst: '50,000 requests, 48 connections, 50,000 /24s, 4,000 User-Agents, random countries' };
    for (let r = 0; r < ROUNDS; r++) {
        const order = r % 2 === 0 ? ['on', 'off'] : ['off', 'on'];
        const row = {};
        const envOf = (arm) => ({ TP_MOON_LOAD_OBS_WINDOW_S: '15', ...(arm === 'off' ? { TP_PAGE_SRC_OBS: '0' } : {}) });
        const pair = PAIR ? Object.fromEntries(await Promise.all(['on', 'off'].map(async (arm) => [arm, await boot(ROOT, arm === 'on' ? PORTS.mon : PORTS.moff, 'p' + arm + r, envOf(arm))]))) : null;
        for (const arm of order) {
            const srv = PAIR ? pair[arm] : await boot(ROOT, arm === 'on' ? PORTS.mon : PORTS.moff, 'm' + arm + r, envOf(arm));
            await sleep(6000);
            const t0 = Date.now();
            await burst(srv.port, 50000, 48);
            const t1 = Date.now();
            await sleep(21000);
            const t2 = Date.now();
            const during = procs(srv, t0, t1 + 5500), after = procs(srv, t1 + 15000, t2);
            const mx = (k) => Math.max(0, ...during.map((p) => p[k]));
            const last = after[after.length - 1] || {};
            row[arm] = { burst_s: Math.round((t1 - t0) / 1000), max: { rss: mx('rss'), heapTotal: mx('heapTotal'), heapUsed: mx('heapUsed'), ext: mx('ext') },
                after_20s: { rss: last.rss, heapTotal: last.heapTotal, heapUsed: last.heapUsed, ext: last.ext } };
            if (!PAIR) { killSrv(srv); await sleep(1500); }
        }
        if (PAIR) { killSrv(pair.on); killSrv(pair.off); await sleep(1500); }
        res.rounds.push(row);
        console.log('[M] round ' + (r + 1) + ' ' + JSON.stringify(row));
    }
    const d = (k, sub) => res.rounds.map((x) => x.on[sub][k] - x.off[sub][k]);
    res.on_minus_off_mb = { max_rss: d('rss', 'max'), max_heapTotal: d('heapTotal', 'max'), max_heapUsed: d('heapUsed', 'max'), after_rss: d('rss', 'after_20s'), after_heapUsed: d('heapUsed', 'after_20s') };
    console.log('[M] ' + JSON.stringify(res.on_minus_off_mb));
    return res;
}

// ---------- [L] ----------
function harvestPopulation() {
    const pop = [];
    if (!fs.existsSync(HARVEST)) return pop;
    for (const l of fs.readFileSync(HARVEST, 'utf8').split(/\r?\n/)) {
        const i = l.indexOf('[crawl-src] {'); if (i < 0) continue;
        let o; try { o = JSON.parse(l.slice(i + 12)); } catch (_) { continue; }
        if (o.t !== 'src') continue;
        for (const r of o.rows) if (r[1] !== 'overflow' && r[2] !== 'rest') pop.push({ declared: r[1], token: r[2], bcls: r[4], country: r[5], prefix: r[6], n: r[7] });
    }
    return pop;
}
function logs() {
    const pop = harvestPopulation();
    const res = { source_mix: pop.length ? HARVEST + ' (' + pop.length + ' [crawl-src] src rows, weighted by n)' : 'none (harvest missing)', volumes: {} };
    if (!pop.length) return res;
    const cum = []; let tot = 0; for (const p of pop) { tot += p.n; cum.push(tot); }
    const pick = (x) => { let lo = 0, hi = cum.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] > x) hi = m; else lo = m + 1; } return pop[lo]; };
    // a request with that source: the declared class -> a User-Agent of that class and token, the prefix -> an address inside it
    const uaFor = (p, i) => {
        if (p.declared === 'browser') { const m = /^browser:([a-z]+)-(\w+):(\w+)$/.exec(p.token) || [];
            const os = { windows: 'Windows NT 10.0; Win64; x64', android: 'Linux; Android 10; K', ios: 'iPhone; CPU iPhone OS 18_6 like Mac OS X', mac: 'Macintosh; Intel Mac OS X 10_15_7', linux: 'X11; Linux x86_64' }[m[3]] || 'X11; Linux x86_64';
            return m[1] === 'safari' ? 'Mozilla/5.0 (' + os + ') AppleWebKit/605.1.15 (KHTML, like Gecko) Version/' + m[2] + '.0 Safari/605.1.15'
                : 'Mozilla/5.0 (' + os + ') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + (m[2] || '141') + '.0.0.0 Safari/537.36'; }
        const named = { googlebot: 'Googlebot/2.1', bingbot: 'bingbot/2.0', applebot: 'Applebot/0.1', gptbot: 'GPTBot/1.2', perplexitybot: 'PerplexityBot/1.0', 'meta-external': 'meta-externalagent/1.1',
            amazonbot: 'Amazonbot/0.1', claudebot: 'ClaudeBot/1.0', yandexbot: 'YandexBot/3.0', bytespider: 'Bytespider', ccbot: 'CCBot/2.0', 'adsbot-google': 'AdsBot-Google', 'mediapartners-google': 'Mediapartners-Google', 'google-inspection': 'Google-InspectionTool/1.0' };
        if (named[p.declared]) return 'Mozilla/5.0 (compatible; ' + named[p.declared] + ')';
        if (p.token === 'empty') return '';
        return (p.token && p.token !== '-' && p.token !== 'overflow' ? p.token.replace(/[^a-z0-9._-]/g, '') : 'misc') + '/1.0';
    };
    const ipFor = (p, i) => {
        const m = /^(\d+)\.(\d+)\.(\d+)\.0\/24$/.exec(p.prefix || '');
        if (m) return m[1] + '.' + m[2] + '.' + m[3] + '.' + (1 + i % 250);
        const m6 = /^([0-9a-f]+):([0-9a-f]+):([0-9a-f]+)::\/48$/.exec(p.prefix || '');
        if (m6) return m6[1] + ':' + m6[2] + ':' + m6[3] + '::' + (1 + i % 999).toString(16);
        return (20 + (i * 7919) % 200) + '.' + ((i * 104729) % 250) + '.' + ((i * 31) % 250) + '.' + (1 + i % 250);   // '*': a new /24 nearly every request
    };
    const hdr = (bcls) => bcls && bcls.startsWith('full') ? FULLH : bcls && bcls.startsWith('partial') ? { accept: 'text/html' } : {};
    // a window per worker: V/2/12 requests; 12 windows an hour, 2 workers
    for (const [label, V] of [['typical ~1,500/h', 1500], ['busy normal hour ~2,050/h', 2050], ['observed peak 23,860/h (2026-10-17 22:00Z)', 23860]]) {
        const api = loadBlock({ TP_CRAWL_SOURCE_EDGE_TEST: '1' });
        const per = Math.round(V / 2 / 12);
        let bytes = 0, lines = 0, rows = 0; let seed = 1;
        for (let w = 0; w < 24; w++) {      // 24 worker windows = one hour of 2 workers
            for (let j = 0; j < per; j++) {
                const i = seed++;
                const p = pick(((i * 2654435761) % 4294967296) / 4294967296 * tot);
                const h = { host: 'timesprayers.com', 'cf-ray': RAY, 'cf-connecting-ip': ipFor(p, i), ...(p.country && p.country.length === 2 && p.country !== '??' ? { 'cf-ipcountry': p.country } : {}), ...hdr(p.bcls) };
                const ua = uaFor(p, i); if (ua) h['user-agent'] = ua;
                const fi = [0, 0, 0, 1, 1, 2, 3][i % 7];
                api._psRecord({ method: 'GET', headers: h, socket: {} }, fi, LANGS[(i * 5) % LANGS.length] + FAM_URL[fi] + 'makkah', '2xx', 80);
            }
            api.logs.length = 0;
            api._psFlush('w');
            for (const l of api.logs) if (l.startsWith('[page-src] {')) { bytes += Buffer.byteLength(l) + 1; lines++; rows += JSON.parse(l.slice(11)).rows.length; }
        }
        res.volumes[label] = { requests_per_hour: V, bytes_per_hour: bytes, kb_per_hour: +(bytes / 1024).toFixed(1), lines_per_hour: lines, rows_per_hour: rows, mb_per_day: +(bytes * 24 / 1048576).toFixed(2) };
    }
    // the ceiling: every cap reached in every window (the adversarial mix)
    {
        const api = loadBlock({ TP_CRAWL_SOURCE_EDGE_TEST: '1' });
        let bytes = 0, lines = 0;
        for (let w = 0; w < 24; w++) {
            // every declared class (so the 'rest' rows reach their maximum too), new tokens, prefixes and countries throughout
            const DECL = ['Googlebot/2.1', 'Google-InspectionTool/1.0', 'AdsBot-Google', 'Mediapartners-Google', 'bingbot/2.0', 'AhrefsBot/7.0', 'facebookexternalhit/1.1',
                'GPTBot/1.2', 'ClaudeBot/1.0', 'CCBot/2.0', 'Bytespider', 'Amazonbot/0.1', 'Applebot/0.1', 'YandexBot/3.0', 'meta-externalagent/1.1', 'PerplexityBot/1.0'];
            for (let j = 0; j < 6000; j++) {
                const i = w * 6000 + j, x = profile(i, 'pool');
                const c = j % 19;
                x.req.headers['user-agent'] = c < 16 ? 'Mozilla/5.0 (compatible; ' + DECL[c] + '; +https://example.net/' + i + ')' : c === 16 ? 'Probe' + i + 'Bot/1.0' : c === 17 ? 'Tool' + i + '/2.0' : x.req.headers['user-agent'];
                x.req.headers['cf-ipcountry'] = String.fromCharCode(65 + i % 26, 65 + (i >> 5) % 26);
                x.path = LANGS[i % LANGS.length] + FAM_URL[x.fi] + 'makkah';
                api._psRecord(x.req, x.fi, x.path, ['2xx', '3xx', '4xx'][j % 3], 50);
            }
            api.logs.length = 0; api._psFlush('w');
            for (const l of api.logs) if (l.startsWith('[page-src] {')) { bytes += Buffer.byteLength(l) + 1; lines++; }
        }
        res.volumes['ceiling: every cap reached every window'] = { bytes_per_hour: bytes, kb_per_hour: +(bytes / 1024).toFixed(1), lines_per_hour: lines, mb_per_day: +(bytes * 24 / 1048576).toFixed(2) };
    }
    console.log('[L] ' + JSON.stringify(res));
    return res;
}

// ---------- [C] the log ceiling of one worker window, inside one UTC hour and across an hour boundary ----------
function logcap() {
    const realNow = Date.now;
    const T_IN = Date.parse('2026-10-20T10:30:00Z');                                              // a window inside 10:00-10:59
    const T_X0 = Date.parse('2026-10-20T10:58:30Z'), T_X1 = Date.parse('2026-10-20T11:00:30Z');   // a window across 11:00
    const word = (n, len) => { let s = ''; do { s = String.fromCharCode(103 + n % 20) + s; n = Math.floor(n / 20); } while (n); return s.padStart(len, 'x'); };   // letters g..z only
    const OUTS = ['2xx', '3xx', '4xx', '5xx', 'abort'];
    const CLASS_UA = ['Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'Mozilla/5.0 (compatible; Google-InspectionTool/1.0)',
        'AdsBot-Google (+http://www.google.com/adsbot.html)', 'Mediapartners-Google', 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
        'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)', 'facebookexternalhit/1.1', 'Mozilla/5.0 (compatible; GPTBot/1.2)', 'ClaudeBot/1.0', 'CCBot/2.0',
        'Bytespider', 'Amazonbot/0.1', 'Mozilla/5.0 (compatible; Applebot/0.1)', 'Mozilla/5.0 (compatible; YandexBot/3.0)', 'meta-externalagent/1.1', 'PerplexityBot/1.0',
        'curl/8.4.0', BROWSERS[0], 'okhttp/4.12.0'];   // every declared class
    const rec = (api, ua, ip, fi, lang, cc, j, ms, extra) => api._psRecord({ method: j % 2 ? 'HEAD' : 'GET', socket: {}, headers: { 'user-agent': ua, 'cf-connecting-ip': ip, 'cf-ray': RAY, 'cf-ipcountry': cc, accept: 'text/html', ...extra } },
        fi, lang + FAM_URL[fi % 4] + 'makkah', OUTS[j % 5], ms);
    const LANGS10 = ['', '/en', '/fr', '/tr', '/ur', '/de', '/id', '/es', '/bn', '/ms'];
    // the longest token form: 'browser:samsung-1xx:android' (27 characters); with Accept + sec-ch-ua -> 'partial+ch'
    const SAMS = (r) => 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/' + (100 + r % 100) + '.0 Chrome/130.0.0.0 Mobile Safari/537.36';
    const CHH = { 'sec-ch-ua': '"Chromium";v="130"' };
    // the maximal-bytes mix of one window (in each UTC hour it covers): rows exist for SG only, so everything is SG
    const maxMix = (api, w, cross) => {
        const hours = cross ? [T_X0, T_X1] : [T_IN];
        hours.forEach((t, hp) => {
            Date.now = () => t;
            // 150 wide rows: declared browser, the longest token, 'partial+ch', the longest family (next-prayer-city), its
            //   own /24 with 3-digit octets and >= MIN_N requests (so the prefix is shown), every status class, 6-digit ms
            for (let r = 0; r < 150; r++) {
                const ip = (200 + r % 55) + '.' + (100 + 2 * w + hp) + '.' + (100 + Math.floor(r / 55)) + '.';
                for (let j = 0; j < 120 / hours.length; j++) rec(api, SAMS(r), ip + (100 + j), 2, r < 100 ? '/ms' : '/es', 'SG', j, 99999.4 + j, CHH);
            }
            // one small row for every family x declared class (-> one 'rest' row each)
            for (let f = 0; f < 5; f++) for (let c = 0; c < CLASS_UA.length; c++) rec(api, CLASS_UA[c], (30 + c) + '.' + (100 + f + 5 * hp) + '.' + (w % 250) + '.7', f, '/bn', 'SG', c, 99999.4);
        });
        // then keys that compaction cannot merge (a distinct token x language x family each, already '*') until the key cap,
        //   and one overflow row per family
        for (let k = 0; k < 1500; k++) rec(api, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + (1 + k % 140) + '.0.0.0 Safari/537.36',
            '45.' + (k % 250) + '.' + ((k / 250) | 0) + '.9', k % 5, LANGS10[((k / 140) | 0) % 10], 'SG', k, 50);
        for (let f = 0; f < 5; f++) rec(api, 'okhttp/4.12.0', '46.1.1.' + (1 + f), f, '/de', 'SG', f, 50);
        Date.now = realNow;
    };
    // the previous ceiling mix of [L] (6,000 records, every declared class, new tokens / prefixes / countries throughout)
    const prevMix = (api, w, cross) => {
        const DECL = ['Googlebot/2.1', 'Google-InspectionTool/1.0', 'AdsBot-Google', 'Mediapartners-Google', 'bingbot/2.0', 'AhrefsBot/7.0', 'facebookexternalhit/1.1',
            'GPTBot/1.2', 'ClaudeBot/1.0', 'CCBot/2.0', 'Bytespider', 'Amazonbot/0.1', 'Applebot/0.1', 'YandexBot/3.0', 'meta-externalagent/1.1', 'PerplexityBot/1.0'];
        for (let j = 0; j < 6000; j++) {
            Date.now = () => (cross ? (j < 3000 ? T_X0 : T_X1) : T_IN);
            const i = w * 6000 + j, x = profile(i, 'pool');
            const c = j % 19;
            x.req.headers['user-agent'] = c < 16 ? 'Mozilla/5.0 (compatible; ' + DECL[c] + '; +https://example.net/' + i + ')' : c === 16 ? 'Probe' + i + 'Bot/1.0' : c === 17 ? 'Tool' + i + '/2.0' : x.req.headers['user-agent'];
            x.req.headers['cf-ipcountry'] = 'SG';
            api._psRecord(x.req, x.fi, LANGS[i % LANGS.length] + FAM_URL[x.fi] + 'makkah', ['2xx', '3xx', '4xx'][j % 3], 50);
        }
        Date.now = realNow;
    };
    const runMix = (mix, cross) => {
        const api = loadBlock({ TP_CRAWL_SOURCE_EDGE_TEST: '1' });
        const per = [];
        try {
            for (let w = 0; w < 12; w++) {
                api.logs.length = 0;
                mix(api, w, cross);
                api._psFlush('w');
                const ls = api.logs.filter((l) => l.startsWith('[page-src] {'));
                const os = ls.map((l) => JSON.parse(l.slice(11)));
                per.push({ bytes: ls.reduce((s, l) => s + Buffer.byteLength(l) + 1, 0), lines: ls.length, rows: os.reduce((s, o) => s + o.rows.length, 0),
                    hours: new Set(os.flatMap((o) => o.rows.map((r) => r[0]))).size, line_max: Math.max(...ls.map((l) => Buffer.byteLength(l))) });
            }
        } finally { Date.now = realNow; }
        const b = per.map((p) => p.bytes);
        return { windows: per.length, bytes_per_window: { median: med(b), max: Math.max(...b) }, lines_max: Math.max(...per.map((p) => p.lines)),
            rows_max: Math.max(...per.map((p) => p.rows)), hours_in_rows: Math.max(...per.map((p) => p.hours)), longest_line: Math.max(...per.map((p) => p.line_max)) };
    };
    const res = { workers: 2, windows_per_hour_per_worker: 12, scope: 'rows for SG traffic only (edge-attested + cf-ipcountry SG): every mix below is all SG',
        note: 'per worker and UTC hour at most one window spans the hour boundary; the other 11 lie inside it; a worker restart adds one final flush' };
    {   // a window with no SG request: one line, meta only
        const api = loadBlock({ TP_CRAWL_SOURCE_EDGE_TEST: '1' });
        for (let k = 0; k < 5000; k++) rec(api, BROWSERS[k % BROWSERS.length], (20 + k % 200) + '.' + (k % 250) + '.1.9', k % 5, LANGS10[k % 10], CCS[k % CCS.length] === 'SG' ? 'US' : CCS[k % CCS.length], k, 50);
        api.logs.length = 0; api._psFlush('w');
        const ls = api.logs.filter((l) => l.startsWith('[page-src] {'));
        res.no_sg_window = { lines: ls.length, bytes: ls.reduce((s, l) => s + Buffer.byteLength(l) + 1, 0), rows: ls.reduce((s, l) => s + JSON.parse(l.slice(11)).rows.length, 0),
            mb_per_day_2_workers: +(2 * 12 * 24 * ls.reduce((s, l) => s + Buffer.byteLength(l) + 1, 0) / 1048576).toFixed(3) };
        console.log('[C] no_sg_window ' + JSON.stringify(res.no_sg_window));
    }
    for (const [name, mix] of [['max_bytes_mix', maxMix], ['previous_ceiling_mix', prevMix]]) {
        const inside = runMix(mix, false), cross = runMix(mix, true);
        const bi = inside.bytes_per_window.max, bx = cross.bytes_per_window.max;
        const hour = 2 * (11 * bi + bx);
        res[name] = { inside_hour: inside, across_hour: cross, across_over_inside: +(bx / bi).toFixed(3),
            ceiling: { bytes_per_hour_2_workers: hour, kb_per_hour: +(hour / 1024).toFixed(1), mb_per_day: +(hour * 24 / 1048576).toFixed(2),
                if_every_window_crossed_mb_per_day: +(2 * 12 * bx * 24 / 1048576).toFixed(2), inside_only_mb_per_day: +(2 * 12 * bi * 24 / 1048576).toFixed(2) } };
        console.log('[C] ' + name + ' ' + JSON.stringify(res[name]));
    }
    return res;
}

// ---------- [H] in-process memory: held window state, transient peak, what stays ----------
function memunit() {
    if (typeof global.gc !== 'function') throw new Error('--memunit needs node --expose-gc');
    const mem = () => { const m = process.memoryUsage(); return m.heapUsed + m.arrayBuffers; };
    // a synchronous, compacting full GC (sweeping finished), three times
    const gcmem = () => { for (let k = 0; k < 3; k++) global.gc({ type: 'major', execution: 'sync', flavor: 'last-resort' }); return mem(); };
    const kb = (b) => Math.round(b / 1024);
    const OUTS = ['2xx', '2xx', '2xx', '2xx', '3xx', '4xx'];
    // the inputs of a window are built BEFORE its start value, so the figures are the block's own allocations (the request
    //   objects exist in a server anyway)
    const fromProfile = (scen) => (i) => { const x = profile(i, scen); return [x.req, x.fi, x.path, OUTS[i % 6], (i % 97) * 0.9]; };
    // the cap mix: SG (90 %), a new /24 per record, varied browser majors / OS and bots -> every cap reached
    const capMix = (i) => {
        const ua = i % 4 === 1 ? 'Mozilla/5.0 (compatible; Probe' + i + 'Bot/1.0; +https://example.net/bot)' : vbrowser(i);
        return [{ method: i % 10 === 0 ? 'HEAD' : 'GET', socket: {}, headers: { host: 'x', 'user-agent': ua, 'cf-ray': RAY, accept: 'text/html',
            'cf-connecting-ip': (11 + (i % 200)) + '.' + (((i / 200) | 0) % 250) + '.' + ((i * 7) % 250) + '.9', 'cf-ipcountry': i % 10 === 3 ? 'US' : 'SG' } },
            i % 5, LANGS[(i >> 1) % LANGS.length] + FAM_URL[i % 4] + 'city' + i, OUTS[i % 6], i % 300];
    };
    const res = { method: 'heapUsed + arrayBuffers of the block alone (the inputs are built before the window start value); HELD = forced GC just before the flush (the live window state, kept at most one window, 5 minutes); TRANSIENT PEAK = the highest value seen without forcing GC during the batch and right after the flush, minus the window start value (garbage included: short-lived, collected by the next GC); AFTER = forced GC after the flush, minus the window start value' };
    for (const [label, N, gen] of [['realistic_1000', 1000, fromProfile('realistic')], ['sgwave_1000', 1000, fromProfile('sgwave')], ['cap_50000', 50000, capMix]]) {
        const api = loadBlock({ TP_CRAWL_SOURCE_EDGE_TEST: '1' });
        for (let w = 0; w < 3; w++) { for (let i = 0; i < Math.min(N, 5000); i++) api._psRecord(...gen(7000000 + w * N + i)); api._psFlush('w'); }   // warm-up
        api.logs.length = 0;
        const base = gcmem();
        const per = [];
        for (let w = 0; w < 6; w++) {
            // (a JSON round trip: every input string flat, so no string flattening during the batch shrinks the baseline)
            let inputs = JSON.parse(JSON.stringify(Array.from({ length: N }, (_, i) => gen(w * N + i))));
            // touch every input header once (its shape settles here, before the start value, not during the batch)
            for (const x of inputs) { const h = x[0].headers; for (const k of ['user-agent', 'cf-connecting-ip', 'cf-ray', 'cf-ipcountry', 'cf-connecting-ipv6', 'accept', 'accept-language', 'sec-fetch-mode', 'sec-fetch-dest', 'sec-ch-ua', 'x-forwarded-for']) void h[k]; void x[0].socket.remoteAddress; void x[0].method; }
            const b0 = gcmem();
            let peak = b0;
            for (let i = 0; i < N; i++) { api._psRecord(...inputs[i]); if ((i & 127) === 0) { const m = mem(); if (m > peak) peak = m; } }
            { const m = mem(); if (m > peak) peak = m; }
            const held = gcmem();
            api._psFlush('w');
            { const m = mem(); if (m > peak) peak = m; }
            api.logs.length = 0;
            const after = gcmem();
            if (inputs.length !== N) throw new Error('inputs');   // (read here: the inputs stay live through every value above)
            // held = what the flush releases (both values with the same live inputs); start_to_held / after_flush = against the
            //   window start (the inputs' own small changes -- object shapes settling on first access -- fall in these two)
            per.push({ held_kb: kb(held - after), start_to_held_kb: kb(held - b0), transient_peak_kb: kb(peak - b0), after_flush_kb: kb(after - b0) });
            inputs = null;
        }
        const end = gcmem();
        const mx = (k) => Math.max(...per.map((p) => p[k])), md = (k) => med(per.map((p) => p[k]));
        res[label] = { records_per_window: N, windows: per.length, held_kb: { median: md('held_kb'), max: mx('held_kb') }, start_to_held_kb: { median: md('start_to_held_kb'), max: mx('start_to_held_kb') },
            transient_peak_kb: { median: md('transient_peak_kb'), max: mx('transient_peak_kb') },
            after_flush_kb: { median: md('after_flush_kb'), max: mx('after_flush_kb') }, after_all_windows_kb: kb(end - base), per_window: per };
        console.log('[H] ' + label + ' ' + JSON.stringify({ ...res[label], per_window: undefined }));
    }
    return res;
}

async function main() {
    try {
        if (all || args.has('--memunit')) out.memunit = memunit();
        if (all || args.has('--unit')) out.unit = unit();
        if (all || args.has('--logs')) out.logs = logs();
        if (all || args.has('--logcap')) out.logcap = logcap();
        if (all || args.has('--ab')) out.ab = await ab();
        if (all || args.has('--mem')) out.mem = await mem();
    } finally { for (const k of kids) killSrv(k); }
    const guard = fs.readdirSync(TMP).filter((f) => f.startsWith('guard-')).map((f) => fs.readFileSync(path.join(TMP, f), 'utf8').trim()).filter(Boolean);
    out.outbound_guard_blocks = guard.length;
    if (process.env.TP_OUT) fs.writeFileSync(process.env.TP_OUT, JSON.stringify(out, null, 1));
    console.log('RESULT ' + JSON.stringify(out));
    try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (_) {}
}
main().catch((e) => { console.error(e); for (const k of kids) killSrv(k); process.exit(2); });
