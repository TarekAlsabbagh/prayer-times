// CRAWL-SOURCE-OBSERVABILITY-1 — overhead + memory measurement (127.0.0.1 only, no production).
//
//   [U] unit: the crawl-src block of server.js (with the real _obsAgent / getClientIp it calls), extracted and run in
//       this process: the CPU time of one _csRecord call (median of 1,000-call batches) on a realistic request mix, the
//       same with diverse headers, with a NEW 250-character User-Agent every request (advua: the User-Agent cache full)
//       and with a scraper rotating 20,000 browser User-Agents (pool) -- the request objects of those two are built
//       fresh before each timed batch -- and the retained state size (heap delta after gc) for a realistic window and
//       for the adversarial worst case (every cap reached, 256-character User-Agents), then after the flush.
//   [A] server A/B, TP_AB_RUNS (default 6) runs; every run boots three FRESH processes -- the base tree, the candidate
//       (fixture ranges, so the verified-identity lookups run) and the candidate with TP_CRAWL_SOURCE_OBS=0 -- each one
//       worker pinned to the same logical CPU, measured one after the other (the order rotates every run, so each of the
//       3 orders runs twice), closed loop, 16 connections:
//         gone  the early 410 path (moon day + Hijri day URLs), 12 s, from 3 load-generator processes (the worker is the bottleneck)
//         month moon month / year pages (not in the SSR cache: every one renders), 15 s
//         advua the gone URLs with a NEW 250-character User-Agent every request, 12 s, 3 load-generator processes
//       per run: worker CPU us per request (process CPU time / responses), GC us per request (from [proc]), client
//       p50 / p95; the medians of the runs per arm, with the spread of the measurement-off runs as the noise floor.
//   [M] sustained run: 60 s of the gone mix with high header diversity on a fresh base / candidate pair; the worker
//       heap after a forced full GC (local inspector) before and after, and the OS working set, side by side.
//   TP_AB_ONLY_MEM=1 runs [U] and [M] only.
//   Owner conditions 2026-10-17: the ranges fixtures use the per-crawler list format, and every request carries a cf-ray;
//   the candidate arms and [U] trust the edge (TP_CRAWL_SOURCE_EDGE_TEST=1, the stand-in for RENDER=true) so a claim takes
//   the production path (the list lookup). [U] also has 'noclaim' (no User-Agent names a crawler: the path every
//   non-claim takes) and 'claims' (every User-Agent names a listed crawler, half inside its list).
//   [U] knobs: TP_UNIT_EDGE=0 (no edge trust: claims are 'u', no lookup), TP_UNIT_SCENS=a,b (scenarios),
//   TP_UNIT_NOMEM=1 (skip the retained-memory children), TP_UNIT_SERVER_JS=<file> (measure another server.js, e.g. the
//   tree before a change; a tree without _csEdgeAttested gets the same lists merged per company, its format),
//   TP_UNIT_RANGES=fixture (the small fixtures instead of the real data/crawler-ip-ranges.json lists).
// Usage: node --expose-gc scripts/_measure_crawl_source_obs_overhead_1.mjs [--unit-only]
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
const BASE_ROOT = process.env.TP_BASE_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-hijrirange';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const AFF_SERVER = Number(process.env.TP_AB_AFFINITY || 4);       // logical CPU 2
const AFF_LOAD = Number(process.env.TP_AB_LOAD_AFFINITY || 0xF00);  // logical CPUs 8-11
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TMP = /^--(load|mem)-child$/.test(process.argv[2] || '') ? os.tmpdir() : fs.mkdtempSync(path.join(os.tmpdir(), 'tp-crawlsrc-ab-'));   // the child modes write nothing
const pad = (n) => String(n).padStart(2, '0');
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor((s.length - 1) / 2)] : null; };
const pct = (a, p) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const out = { unit: {}, ab: {}, mem: {} };
const RAY = '8c0d3f2a1b4e5f67-AMS';
const EDGE = { TP_CRAWL_SOURCE_EDGE_TEST: '1' };
// the per-crawler fixture (data/crawler-ip-ranges.json format) and the per-company one of the trees before 2026-10-17
const FIX_NEW = { date: '2026-10-10', lists: {}, operators: { 'google-common': ['66.249.64.0/19', '66.102.0.0/20', '64.233.160.0/19', '2001:4860:4801::/48'],
    'google-special': ['108.177.2.0/24'], 'google-user': ['74.125.208.0/24'], bing: ['157.55.39.0/24', '40.77.167.0/24', '207.46.13.0/24'],
    'openai-gptbot': ['20.171.206.0/24'], 'openai-searchbot': ['20.42.10.176/28'], 'openai-chatgpt-user': ['52.230.152.0/24'] } };
const FIX_OLD = { date: '2026-10-10', operators: { google: ['66.249.64.0/19', '66.102.0.0/20', '64.233.160.0/19', '2001:4860:4801::/48'], bing: ['157.55.39.0/24', '40.77.167.0/24', '207.46.13.0/24'], openai: ['20.171.206.0/24', '52.230.152.0/24'] } };
const UNIT_SRC = process.env.TP_UNIT_SERVER_JS || path.join(ROOT, 'server.js');
const UNIT_NEW = fs.readFileSync(UNIT_SRC, 'utf8').includes('function _csEdgeAttested(');
const UNIT_ENV = UNIT_NEW && process.env.TP_UNIT_EDGE !== '0' ? EDGE : {};
// [U] ranges: the real snapshot (production list sizes) -- for a tree before 2026-10-17 the same lists merged per company
//   (its format); TP_UNIT_RANGES=fixture uses the small fixtures above instead
function unitRanges() {
    if (process.env.TP_UNIT_RANGES === 'fixture') return UNIT_NEW ? FIX_NEW : FIX_OLD;
    const sj = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'crawler-ip-ranges.json'), 'utf8'));
    if (UNIT_NEW) return sj;
    const by = { google: ['google-common', 'google-special', 'google-user'], bing: ['bing'], openai: ['openai-gptbot', 'openai-searchbot', 'openai-chatgpt-user'],
        apple: ['apple'], perplexity: ['perplexity-bot', 'perplexity-user'] };
    return { date: sj.date, operators: Object.fromEntries(Object.entries(by).map(([k, ls]) => [k, ls.flatMap((l) => sj.operators[l] || [])])) };
}

// ---------- request mix (shared by [U] and [A]) ----------
const UAS = [
    'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.7390.122 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)',
    'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)', 'python-requests/2.31.0', 'Go-http-client/1.1', '',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
];
// the User-Agents of UAS that name no crawler (the 'noclaim' mix) and the claims with an IP inside / outside their list
const UAS_NOCLAIM = UAS.filter((u) => !/googlebot|gptbot|bingbot|chatgpt-user/i.test(u));
const CLAIMS = [
    ['Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', (i) => '66.249.66.' + (1 + i % 250)],
    ['Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.7390.122 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', (i) => '2001:4860:4801:' + (i % 64).toString(16) + '::' + (i % 9 + 1)],
    ['Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)', (i) => '20.171.206.' + (1 + i % 250)],
    ['Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)', (i) => '157.55.39.' + (1 + i % 250)],
    ['Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot', (i) => '52.230.152.' + (1 + i % 250)],
    ['AdsBot-Google (+http://www.google.com/adsbot.html)', (i) => '108.177.2.' + (1 + i % 250)],
];
function profile(i, diverse) {
    if (diverse === 'adv') {       // a NEW 250-character User-Agent every request (beyond the crawl-src User-Agent cache)
        let s = 'u' + i.toString(36) + 'q';
        while (s.length < 250) s += ((i * 31 + s.length) % 36).toString(36);
        return { 'user-agent': s, 'cf-connecting-ip': '66.249.66.' + (1 + i % 250), 'cf-ipcountry': 'US', 'accept-encoding': 'br', 'cf-ray': RAY };
    }
    if (diverse === 'pool') {      // a scraper rotating 20,000 browser User-Agents
        const k = (i * 7919) % 20000;
        return { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + (100 + k % 40) + '.0.' + (k % 6000) + '.' + (k % 200) + ' Safari/537.36',
            'cf-connecting-ip': (11 + k % 200) + '.' + (k % 256) + '.7.' + (1 + k % 250), 'cf-ipcountry': 'US', 'accept-encoding': 'gzip, br', accept: 'text/html', 'cf-ray': RAY };
    }
    if (diverse === 'claims') {    // every User-Agent names a listed crawler; even i: an IP inside its list, odd i: outside
        const c = CLAIMS[i % CLAIMS.length];
        return { 'user-agent': c[0], 'cf-connecting-ip': (i >> 1) % 2 === 0 ? c[1](i) : (31 + i % 150) + '.' + (i % 256) + '.9.' + (1 + i % 250), 'cf-ipcountry': ['US', 'DE', 'IE'][i % 3],
            'accept-encoding': 'gzip, deflate, br', 'cf-ray': RAY };
    }
    const ua = diverse === 'noclaim' ? UAS_NOCLAIM[i % UAS_NOCLAIM.length]
        : diverse && i % 3 === 0 ? 'Probe' + (i % 900) + 'Crawler/1.' + (i % 7) + ' (+https://example.net/bot)' : UAS[i % UAS.length];
    const a = 20 + (i * 7) % 200, b = (i * 13) % 250, c = diverse === true ? (i * 31) % 250 : (i % 40);   // 'noclaim': the realistic sources
    const h = { 'user-agent': ua, 'cf-connecting-ip': (i % 11 === 0) ? '2001:4860:4801:' + (i % 64).toString(16) + '::' + (i % 9 + 1) : (i % 5 === 0 ? '66.249.66.' + (1 + i % 200) : a + '.' + b + '.' + c + '.' + (1 + i % 250)),
        'cf-ipcountry': ['US', 'DE', 'SA', 'EG', 'IN', 'XX', 'T1', 'FR'][i % 8], 'accept-encoding': 'gzip, deflate, br', 'cf-ray': RAY };
    if (i % 4 === 0) Object.assign(h, { 'sec-fetch-mode': 'navigate', 'sec-fetch-dest': 'document', 'accept-language': 'ar,en;q=0.8', accept: 'text/html,*/*', 'sec-ch-ua': '"Chromium";v="120"' });
    if (i % 6 === 0) h.referer = 'https://www.google.com/';
    if (!ua) delete h['user-agent'];
    return h;
}
const GONE_URLS = [];
for (const c of ['riyadh', 'jeddah', 'makkah', 'medina', 'dammam']) for (let d = 0; d < 400; d++) {
    const t = new Date(Date.UTC(2025, 0, 1) + d * 86400000);
    GONE_URLS.push('/moon/saudi-arabia/' + c + '/' + t.getUTCFullYear() + '/' + pad(t.getUTCMonth() + 1) + '/' + pad(t.getUTCDate()));
}
for (let m = 1; m <= 12; m++) for (let d = 1; d <= 29; d++) GONE_URLS.push('/hijri-date/1445-' + pad(m) + '-' + pad(d));
const MONTH_URLS = [];
for (const c of ['riyadh', 'jeddah', 'makkah', 'medina']) for (let y = 2025; y <= 2028; y++) { MONTH_URLS.push('/moon/saudi-arabia/' + c + '/' + y); for (let m = 1; m <= 12; m += 1) MONTH_URLS.push('/moon/saudi-arabia/' + c + '/' + y + '/' + pad(m)); }

// ---------- [U] unit ----------
function extractBlock(src) {
    const lines = src.split(/\r?\n/);
    const fnAt = (name) => {
        const i = lines.findIndex((l) => l.startsWith('function ' + name + '('));
        if (i === -1) throw new Error('no function ' + name);
        let j = i; while (lines[j] !== '}') j++;
        return lines.slice(i, j + 1).join('\n');
    };
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
    const block = lines.slice(b0, b1 - 1).join('\n');
    return [constAt('_TP_TRUSTED_PROXY'), constAt('_RE_IPV4_TEXT'), fnAt('_normIpText'), fnAt('_isNonPublicIpText'), fnAt('getClientIp'),
        constAt('_OBS_NAMED_BOTS'), fnAt('_obsAgent'), constAt('_shedEnvInt'), constAt('_ML_AGENT_CLASS'), constAt('_ML_EDGES'), constAt('_ML_BUCKET_COLS'), block].join('\n');
}
function loadUnit(env) {
    const src = fs.readFileSync(UNIT_SRC, 'utf8');
    const code = extractBlock(src);
    const logs = [];
    const con = { log: (s) => logs.push(String(s)) };
    const saved = {};
    for (const [k, v] of Object.entries(env)) { saved[k] = process.env[k]; process.env[k] = v; }
    // eslint-disable-next-line no-new-func
    const f = new Function('require', 'process', 'console', 'fs', 'path', 'zlib', 'ROOT', 'performance', '_ML_ON', '_ML_WINDOW_S', 'TP_WORKER_ID', '_OBS_WTAG',
        code + '\nreturn { _csRecord, _csFlush, _csStart, _csSrc, _csUa, _csPfx, _csTok, _csFamRows };');
    const api = f(require, process, con, fs, path, zlib, ROOT, performance, true, 300, 1, ' worker=1');
    for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
    api.logs = logs;
    // _csStart reads TP_CRAWL_RANGES_FILE when it runs (not when the block is built): set it for that call
    //   (before 2026-10-17 the env was already restored here, so [U] loaded the default snapshot path instead of its fixture)
    api.start = () => {
        const prev = process.env.TP_CRAWL_RANGES_FILE;
        if (env.TP_CRAWL_RANGES_FILE) process.env.TP_CRAWL_RANGES_FILE = env.TP_CRAWL_RANGES_FILE;
        try { api._csStart(); } finally { if (prev === undefined) delete process.env.TP_CRAWL_RANGES_FILE; else process.env.TP_CRAWL_RANGES_FILE = prev; }
        api.enabled = logs.find((l) => / ENABLED /.test(l)) || '';
    };
    return api;
}
const FAMS = [['moon-gone', 'gone'], ['hijri-gone', 'gone'], ['hijri-cal-gone', 'gone'], ['hijri-cal-future', '4xx'], ['moon-month', '2xx'], ['moon-year', '2xx'], ['moon-month', 'shed'], ['moon-month', '4xx']];
function mkReq(i, diverse) { return { method: i % 9 === 0 ? 'HEAD' : 'GET', headers: { host: 'timesprayers.com', ...profile(i, diverse) }, socket: { remoteAddress: '10.0.0.1' } }; }
function unit() {
    const FIX = path.join(TMP, 'ranges.json');
    fs.writeFileSync(FIX, JSON.stringify(unitRanges()));
    const res = { tree: UNIT_SRC, owner_conditions_code: UNIT_NEW, edge_trust: UNIT_ENV === EDGE ? 1 : 0, ranges: process.env.TP_UNIT_RANGES === 'fixture' ? 'fixture' : 'data/crawler-ip-ranges.json' + (UNIT_NEW ? '' : ' merged per company') };
    const SCEN = { realistic: false, noclaim: 'noclaim', claims: 'claims', diverse: true, advua: 'adv', pool: 'pool' };
    // CPU per call
    for (const name of (process.env.TP_UNIT_SCENS || 'realistic,noclaim,claims,diverse,advua,pool').split(',')) {
        const diverse = SCEN[name];
        if (diverse === undefined) throw new Error('unknown scenario ' + name);
        const api = loadUnit({ TP_CRAWL_RANGES_FILE: FIX, ...UNIT_ENV });
        api.start();
        if (!res.enabled) res.enabled = api.enabled.replace(/ boot=\w+$/, '');
        const N = 400000, B = 1000;
        const fresh = diverse === 'adv' || diverse === 'pool';   // new request objects (new strings) built before each timed batch
        const reqs = fresh ? null : Array.from({ length: 4096 }, (_, i) => mkReq(i, diverse));
        const paths = Array.from({ length: 4096 }, (_, i) => (i % 10 < 7 ? GONE_URLS[(i * 37) % GONE_URLS.length] : MONTH_URLS[(i * 11) % MONTH_URLS.length]));
        let cur = null;
        const prep = (b) => { if (fresh) cur = Array.from({ length: B }, (_, j) => mkReq(b * B + j, diverse)); };
        const call = (i) => { const k = i & 4095, f = FAMS[i % FAMS.length]; api._csRecord(fresh ? cur[i % B] : reqs[k], null, paths[k], f[0], f[1], (i % 97) * 0.7, f[0].startsWith('moon-m') || f[0] === 'moon-year' ? 'cur' : undefined, 'in', paths[k]); };
        for (let b = 0; b < 200; b++) { prep(10000 + b); for (let i = 0; i < B; i++) call(b * B + i); }   // warm-up (JIT), then a fresh window
        api._csFlush('w'); api.logs.length = 0;
        const per = [];
        let tSum = 0n;
        for (let b = 0; b < N / B; b++) {
            prep(20000 + b);
            const t0 = process.hrtime.bigint();
            for (let i = 0; i < B; i++) call(b * B + i);
            const dt = process.hrtime.bigint() - t0;
            tSum += dt;
            per.push(Number(dt) / B / 1000);   // µs per call
            if ((b + 1) % 150 === 0) { const tf = process.hrtime.bigint(); api._csFlush('w'); tSum += process.hrtime.bigint() - tf; api.logs.length = 0; }   // a window every 150k records
        }
        const meanAll = Number(tSum) / N / 1000;   // every call, the compactions and the flushes included
        api._csFlush('w');
        for (let b = 0; b < 150; b++) { prep(30000 + b); for (let i = 0; i < B; i++) call(b * B + i); }   // one full window, then its flush: time + lines printed
        api.logs.length = 0;
        const tF = process.hrtime.bigint(); api._csFlush('w'); const tF2 = process.hrtime.bigint();
        // the ver mix of the flushed window (from the src rows), so a scenario's verification path is visible
        const vers = {};
        for (const l of api.logs) if (l.startsWith('[crawl-src] {')) { const o = JSON.parse(l.slice(12)); if (o.t === 'src') for (const r of o.rows) vers[r[3]] = (vers[r[3]] || 0) + r[7]; }
        res[name] = { median_us: +med(per).toFixed(3), mean_us_incl_flushes: +meanAll.toFixed(3), p95_us: +pct(per, 0.95).toFixed(3), max_batch_us: +Math.max(...per).toFixed(3),
            flush_ms: +(Number(tF2 - tF) / 1e6).toFixed(1), lines_per_flush: api.logs.length, longest_line_bytes: Math.max(...api.logs.map((l) => Buffer.byteLength(l))), ver_mix: vers };
    }
    // retained memory: measured in a fresh child process (no garbage or JIT state from the CPU runs)
    for (const fill of (process.env.TP_UNIT_NOMEM === '1' ? [] : ['real', 'worst'])) {
        try {
            const r = execFileSync(process.execPath, ['--expose-gc', fileURLToPath(import.meta.url), '--mem-child', fill, FIX], { encoding: 'utf8' });
            const j = JSON.parse(r.trim().split('\n').pop());
            res['mem: ' + j.name] = j;
        } catch (e) { res['mem: ' + fill] = 'error ' + (e.stderr || e.message); }
    }
    return res;
}
// The child: every request object and string is created on the fly and dropped after the call, exactly as in the
//   server, so whatever the tables keep (User-Agent cache keys, prefixes, paths, samples) counts as retained state.
function memChild(fill, FIX) {
    const heap = () => { global.gc(); global.gc(); global.gc(); const m = process.memoryUsage(); return m.heapUsed + m.arrayBuffers; };
    const api = loadUnit({ TP_CRAWL_RANGES_FILE: FIX, ...UNIT_ENV });
    api.start();
    globalThis.__api = api;
    const N = fill === 'real' ? 60000 : 40000;
    const mk = fill === 'real' ? (i) => mkReq(i, false) : (i) => ({ method: 'GET', socket: {}, headers: { host: 'x',
        'user-agent': ('Mozilla/5.0 (compatible; W' + i + 'zbot/1.0; +https://example.net/' + 'q'.repeat(300)).slice(0, 256),
        'cf-connecting-ip': (1 + (i % 200)) + '.' + (((i / 200) | 0) % 250) + '.' + ((i * 7) % 250) + '.9', 'cf-ipcountry': String.fromCharCode(65 + i % 26, 65 + (i >> 5) % 26) } });
    const pathOf = fill === 'real' ? (i) => (i % 3 ? GONE_URLS[i % GONE_URLS.length] : MONTH_URLS[i % MONTH_URLS.length]).slice(0)
        : (i) => '/moon/saudi-arabia/c' + i + '-' + 'z'.repeat(150) + '/2026/10';
    const cityOf = (f, i) => (f === 'moon-month' || f === 'moon-year') ? ['cur', 'db', 'disc', 'unk', 'na'][i % 5] : undefined;
    const rec = (i) => { const f = FAMS[i % FAMS.length], pa = pathOf(i); api._csRecord(mk(i), null, pa, f[0], f[1], i % 300, cityOf(f[0], i), ['in', 'p1y', 'pold', 'f1y', 'flate', 'na'][i % 6], pa); };
    for (let i = 0; i < 2000; i++) rec(i);                 // warm-up (JIT), then an empty window
    api._csFlush('w'); api.logs.length = 0;
    const h0 = heap();
    for (let i = 0; i < N; i++) rec(i);
    const h1 = heap();
    const tables = { src: api._csSrc.size, ua_cache: api._csUa.size, prefixes: api._csPfx.size, tokens: api._csTok.size, fam: api._csFamRows.filter(Boolean).length };
    let parts = null;
    if (process.env.TP_MEM_BREAKDOWN === '1') {   // diagnostics: what each table holds (cleared one by one)
        parts = {};
        let hp = h1;
        for (const [k, m] of [['ua_cache', api._csUa], ['prefixes', api._csPfx], ['tokens', api._csTok], ['src_keys', api._csSrc]]) { m.clear(); const h = heap(); parts[k] = Math.round((hp - h) / 1024); hp = h; }
    }
    api._csFlush('w'); api.logs.length = 0;
    const h2 = heap();
    if (parts) tables.breakdown_kb = parts;
    return { name: fill === 'real' ? 'realistic window (60k records, 12 UAs, ~800 prefixes)' : 'worst case: every cap reached (256-char UAs, 160-char paths)',
        retained_kb: Math.round((h1 - h0) / 1024), after_flush_kb: Math.round((h2 - h0) / 1024), tables };
}

// ---------- [A] / [M] servers ----------
const kids = [];
const rawGet = (port, p, h, agent) => new Promise((res) => {
    const t0 = performance.now();
    const r = http.request({ host: '127.0.0.1', port, path: p, method: 'GET', headers: h, agent }, (x) => { x.resume(); x.on('end', () => res({ st: x.statusCode, ms: performance.now() - t0 })); });
    r.setTimeout(60000, () => r.destroy(new Error('timeout')));
    r.on('error', () => res({ st: 0, ms: performance.now() - t0 })); r.end();
});
const ps = (cmd) => execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', cmd], { encoding: 'utf8' }).trim();
async function boot(root, port, tag, extra = {}, nodeArgs = []) {
    const env = { ...process.env };
    for (const k of Object.keys(env)) if (/^(TP_|NODE_OPTIONS$|GA_MEASUREMENT_ID$|SUPABASE_|LOCATIONIQ_KEY$)/.test(k)) delete env[k];
    Object.assign(env, { PORT: String(port), WEB_CONCURRENCY: '1', ADSENSE_CLIENT: 'off', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', TP_MOON_DAY_SHED: '0',
        TP_SSR_CACHE: '1', TP_REQUEST_OBSERVABILITY: '1', NODE_ENV: 'production', TP_MOON_LOAD_OBS_PROC_S: '5', SITE_URL: 'https://timesprayers.com',
        GUARD_OUT: path.join(TMP, 'guard-' + tag + '.log') }, extra);
    const k = spawn(process.execPath, [...nodeArgs, '-r', GUARD, 'server.js'], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
    const srv = { tag, port, k, lines: [], tlines: [], buf: '' };
    const take = (d) => { srv.buf += d; let i; while ((i = srv.buf.indexOf('\n')) !== -1) { const l = srv.buf.slice(0, i).replace(/\r$/, ''); srv.lines.push(l); srv.tlines.push({ t: Date.now(), l }); srv.buf = srv.buf.slice(i + 1); } };
    k.stdout.on('data', take); k.stderr.on('data', take);
    kids.push(srv);
    for (let i = 0; i < 300; i++) { if ((await rawGet(port, '/health', {}, false)).st === 200) break; await sleep(300); }
    srv.worker = +ps('(Get-CimInstance Win32_Process -Filter "ParentProcessId=' + k.pid + '" | Select-Object -First 1).ProcessId');
    ps('(Get-Process -Id ' + k.pid + ').ProcessorAffinity = [IntPtr]' + AFF_SERVER + '; (Get-Process -Id ' + srv.worker + ').ProcessorAffinity = [IntPtr]' + AFF_SERVER);
    return srv;
}
const cpuMs = (pid) => +ps('(Get-Process -Id ' + pid + ').TotalProcessorTime.TotalMilliseconds');
// The same closed loop in LOADERS child processes (each pinned to its own logical CPU, 0x100 << i), so the one worker
//   under test is the bottleneck (a single Node client tops out near the 410 path's rate); latencies are merged.
const LOADERS = Number(process.env.TP_AB_LOADERS || 3);
async function multiLoop(port, which, secs, conc) {
    const kidsL = [];
    for (let i = 0; i < LOADERS; i++) {
        const k = spawn(process.execPath, [fileURLToPath(import.meta.url), '--load-child', String(port), which, String(secs), String(conc), String(i)], { stdio: ['ignore', 'pipe', 'inherit'] });
        let o = ''; k.stdout.on('data', (d) => { o += d; });
        kidsL.push(new Promise((r) => k.on('exit', () => { try { r(JSON.parse(o.trim().split('\n').pop())); } catch (_) { r({ n: 0, st: {}, lat: [] }); } })));
    }
    const res = await Promise.all(kidsL);
    const lat = res.flatMap((x) => x.lat), st = {};
    for (const x of res) for (const [k, v] of Object.entries(x.st)) st[k] = (st[k] || 0) + v;
    return { n: lat.length, st, p50: +pct(lat, 0.5).toFixed(2), p95: +pct(lat, 0.95).toFixed(2) };
}
async function closedLoop(port, urls, secs, conc, diverse, offset = 0) {
    const agent = new http.Agent({ keepAlive: true, maxSockets: conc });
    const lat = [], st = {};
    let i = 0;
    const tEnd = Date.now() + secs * 1000;
    await Promise.all(Array.from({ length: conc }, async () => {
        while (Date.now() < tEnd) { const k = offset + i++; const r = await rawGet(port, urls[(k * 7919) % urls.length], profile(k, diverse), agent); lat.push(r.ms); st[r.st] = (st[r.st] || 0) + 1; }
    }));
    agent.destroy();
    return { n: lat.length, st, p50: +pct(lat, 0.5).toFixed(2), p95: +pct(lat, 0.95).toFixed(2), lat };
}
// One run = three FRESH processes (base tree, candidate, candidate with TP_CRAWL_SOURCE_OBS=0), each one worker pinned
//   to the same logical CPU, warmed up, then measured one after the other (the order rotates every run) on both
//   scenarios, then killed. Fresh processes per run matter: one long-lived process differs from another by several
//   per cent on the render path whatever its code (measured: the same tree, crawl-src on vs off, -6 % to +6.5 %).
const killKid = (s) => { try { execFileSync('taskkill', ['/PID', String(s.k.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} };
const gcUs = (s, t0, t1, n) => {          // GC ms of the worker over [t0, t1] from its [proc] lines (5 s windows), per request
    let ms = 0;
    for (const x of s.tlines) if (x.t > t0 && x.t <= t1 + 5500 && x.l.startsWith('[proc] {')) { const p = JSON.parse(x.l.slice(7)); for (const k of Object.keys(p.gc || {})) ms += p.gc[k][1]; }
    return +(ms * 1000 / Math.max(1, n)).toFixed(1);
};
async function ab() {
    const FIX = path.join(TMP, 'ranges-ab.json');
    fs.writeFileSync(FIX, JSON.stringify(FIX_NEW));
    // the candidate arms trust the edge (as on Render) and every request carries a cf-ray: claims take the list lookup
    const ARMS = [['base', BASE_ROOT, {}], ['cand', ROOT, { TP_CRAWL_RANGES_FILE: FIX, ...EDGE }], ['kill', ROOT, { TP_CRAWL_RANGES_FILE: FIX, TP_CRAWL_SOURCE_OBS: '0', ...EDGE }]];
    const PLAN = { gone: 12, month: 15, advua: 12 };   // seconds per measurement
    const SCENS = (process.env.TP_AB_SCENS || 'gone,month,advua').split(',');
    const RUNS = Number(process.env.TP_AB_RUNS || 6);
    const R = {};
    for (const scen of SCENS) { R[scen] = {}; for (const [a] of ARMS) R[scen][a] = []; }
    for (let run = 1; run <= RUNS; run++) {
        const srv = {};
        for (let j = 0; j < ARMS.length; j++) { const [a, root, env] = ARMS[j]; srv[a] = await boot(root, 8721 + j, 'ab-' + a + '-' + run, env); }
        for (const [a] of ARMS) { await closedLoop(srv[a].port, GONE_URLS, 5, 16, false); await closedLoop(srv[a].port, MONTH_URLS, 6, 16, false); }   // warm-up
        for (const scen of SCENS) {
            for (let j = 0; j < ARMS.length; j++) {
                const a = ARMS[(run - 1 + j) % ARMS.length][0], s = srv[a];
                await sleep(1500);
                const c0 = cpuMs(s.worker), t0 = Date.now();
                const r = scen === 'month' ? await closedLoop(s.port, MONTH_URLS, PLAN[scen], 16, false) : await multiLoop(s.port, scen, PLAN[scen], 16);
                delete r.lat;
                const c1 = cpuMs(s.worker), t1 = Date.now();
                await sleep(5700);
                r.cpu_us_per_req = +((c1 - c0) * 1000 / r.n).toFixed(1); r.gc_us_per_req = gcUs(s, t0, t1, r.n); r.rps = +(r.n / PLAN[scen]).toFixed(0);
                R[scen][a].push(r);
                console.log('  run ' + run + ' ' + scen.padEnd(5) + ' ' + a.padEnd(4) + ' ' + JSON.stringify(r));
            }
        }
        for (const [a] of ARMS) killKid(srv[a]);
        await sleep(2000);
    }
    for (const scen of SCENS) {
        const m = (a, k) => med(R[scen][a].map((r) => r[k]));
        out.ab[scen] = {};
        for (const [a] of ARMS) out.ab[scen][a] = { cpu_us_per_req: m(a, 'cpu_us_per_req'), gc_us_per_req: m(a, 'gc_us_per_req'), rps: m(a, 'rps'), p50_ms: m(a, 'p50'), p95_ms: m(a, 'p95'),
            cpu_runs: R[scen][a].map((r) => r.cpu_us_per_req) };
        out.ab[scen].cand_minus_base_us = +(out.ab[scen].cand.cpu_us_per_req - out.ab[scen].base.cpu_us_per_req).toFixed(1);
        out.ab[scen].cand_minus_kill_us = +(out.ab[scen].cand.cpu_us_per_req - out.ab[scen].kill.cpu_us_per_req).toFixed(1);
        const all = [...R[scen].base, ...R[scen].kill].map((r) => r.cpu_us_per_req);   // the measurement-off runs: the noise floor
        out.ab[scen].off_spread_us = +(Math.max(...all) - Math.min(...all)).toFixed(1);
    }
    await memPhase(FIX);
}
// [M] sustained run (60 s of the gone mix with diverse headers, so every table reaches its cap within one 300 s window)
//   on a fresh base / candidate pair. The worker heap is read after a forced full GC (HeapProfiler.collectGarbage then
//   Runtime.getHeapUsage, through the worker's own inspector on 127.0.0.1) before and after the run, so the growth
//   compares live objects only; the OS working set is read after the GC too.
async function heapAfterGc(inspectPort) {
    let url = null;
    for (const p of [inspectPort + 1, inspectPort + 2]) { try { const l = await (await fetch('http://127.0.0.1:' + p + '/json/list')).json(); if (l[0]) { url = l[0].webSocketDebuggerUrl; break; } } catch (_) {} }
    if (!url) return null;
    const sock = new WebSocket(url);
    await new Promise((r) => sock.addEventListener('open', r));
    let id = 0; const pend = new Map();
    sock.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
    const call = (method, params) => new Promise((r) => { const i = ++id; pend.set(i, r); sock.send(JSON.stringify({ id: i, method, params })); });
    await call('HeapProfiler.enable'); await call('HeapProfiler.collectGarbage'); await call('HeapProfiler.collectGarbage');
    const u = await call('Runtime.getHeapUsage');
    sock.close();
    return +(u.result.usedSize / 1048576).toFixed(2);
}
async function memPhase(FIX) {
    const ws = (pid) => +(+ps('(Get-Process -Id ' + pid + ').WorkingSet64') / 1048576).toFixed(1);
    const procs = {};
    const pair = [await boot(BASE_ROOT, 8731, 'mem-base', {}, ['--inspect=127.0.0.1:9431']), await boot(ROOT, 8732, 'mem-cand', { TP_CRAWL_RANGES_FILE: FIX, ...EDGE }, ['--inspect=127.0.0.1:9441'])];
    const insp = [9431, 9441];
    for (let i = 0; i < pair.length; i++) {
        const s = pair[i];
        await closedLoop(s.port, GONE_URLS, 5, 16, false);              // warm-up (JIT, SSR-independent caches)
        const h0 = await heapAfterGc(insp[i]), w0 = ws(s.worker);
        const r = await closedLoop(s.port, GONE_URLS, 60, 16, true);
        const h1 = await heapAfterGc(insp[i]), w1 = ws(s.worker);
        procs[s.tag] = { requests: r.n, heap_after_gc_mb: [h0, h1], heap_growth_mb: h0 != null && h1 != null ? +(h1 - h0).toFixed(2) : null, os_ws_mb: [w0, w1], os_ws_growth_mb: +(w1 - w0).toFixed(1) };
        console.log('  [M] ' + s.tag + ' ' + JSON.stringify(procs[s.tag]));
    }
    if (procs['mem-base'].heap_growth_mb != null && procs['mem-cand'].heap_growth_mb != null) procs.cand_minus_base_heap_growth_mb = +(procs['mem-cand'].heap_growth_mb - procs['mem-base'].heap_growth_mb).toFixed(2);
    procs.cand_minus_base_ws_growth_mb = +(procs['mem-cand'].os_ws_growth_mb - procs['mem-base'].os_ws_growth_mb).toFixed(1);
    out.mem = procs;
    out.crawlSrcLinesCand = pair[1].lines.filter((l) => l.startsWith('[crawl-src] {')).length;   // 0 expected: no 300 s window closes in the run
    out.crawlSrcLinesBase = pair[0].lines.filter((l) => l.startsWith('[crawl-src]')).length;
    for (const s of kids) killKid(s);
}

if (process.argv[2] === '--load-child') {
    const [port, which, secs, conc, idx] = process.argv.slice(3);
    try { ps('(Get-Process -Id ' + process.pid + ').ProcessorAffinity = [IntPtr]' + (0x100 << Number(idx))); } catch (_) {}
    const r = await closedLoop(Number(port), which === 'month' ? MONTH_URLS : GONE_URLS, Number(secs), Number(conc), which === 'advua' ? 'adv' : false, Number(idx) * 1000003);
    console.log(JSON.stringify({ n: r.n, st: r.st, lat: r.lat.map((x) => +x.toFixed(2)) }));
    process.exit(0);
}
if (process.argv[2] === '--mem-child') { console.log(JSON.stringify(memChild(process.argv[3], process.argv[4]))); process.exit(0); }
try { ps('(Get-Process -Id ' + process.pid + ').ProcessorAffinity = [IntPtr]' + AFF_LOAD); } catch (_) {}
console.log('[U] unit measurement');
out.unit = unit();
console.log(JSON.stringify(out.unit, null, 1));
if (!process.argv.includes('--unit-only')) {
    console.log('[A] server A/B (base ' + BASE_ROOT + ' vs candidate), server affinity 0x' + AFF_SERVER.toString(16) + ', load affinity 0x' + AFF_LOAD.toString(16));
    try {
        if (process.env.TP_AB_ONLY_MEM === '1') {
            const FIXm = path.join(TMP, 'ranges-mem.json');
            fs.writeFileSync(FIXm, JSON.stringify(FIX_NEW));
            await memPhase(FIXm);
            for (const s of kids) killKid(s);
        } else await ab();
    } catch (e) { console.log('A/B error ' + (e && e.stack)); for (const s of kids) { try { execFileSync('taskkill', ['/PID', String(s.k.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} } }
    console.log(JSON.stringify({ ab: out.ab, mem: out.mem, crawl_src_lines: { base: out.crawlSrcLinesBase, cand: out.crawlSrcLinesCand } }, null, 1));
}
fs.writeFileSync(path.join(TMP, 'result.json'), JSON.stringify(out, null, 1));
console.log('result: ' + path.join(TMP, 'result.json'));
