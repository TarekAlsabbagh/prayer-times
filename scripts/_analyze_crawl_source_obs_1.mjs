#!/usr/bin/env node
// CRAWL-SOURCE-OBSERVABILITY-1 -- OFFLINE analyser for harvested [crawl-src] log lines (read-only; no network).
//
//   node scripts/_analyze_crawl_source_obs_1.mjs <harvest> [<harvest> ...] [--top N] [--json out.json] [--dedupe] [--ranges data/crawler-ip-ranges.json]
//
//   --ranges prints where each crawler list came from (sources, the publisher's creationTime, the snapshot date) next to
//   the windows that used it; the file is only read, never fetched.
//
// The ver column (owner conditions 2026-10-17) -- a User-Agent that names a crawler is a CLAIM; ver says what checking that
//   claim against the published list of THAT crawler (not the company's other lists) gave, and is printed as "confidence",
//   always apart from the declared name:
//     'v'   verified list match       the client IP is inside the loaded list of the crawler the User-Agent names
//     'x'   mismatch with the loaded list  the IP is NOT inside that list -- not proof that the name is false (a list can
//                                     be stale or incomplete; a crawler can use addresses it does not publish)
//     'np'  no list for this crawler  no published list is loaded for the crawler the User-Agent names
//     'u'   unverifiable source       the IP was not edge-attested (the process does not trust the edge, the request had no
//                                     cf-ray, or the IP did not come from cf-connecting-ip), so it was not checked
//     'err' snapshot unavailable      the ranges file was absent or unreadable: no claim could be checked
//     'na'  no crawler claim          the User-Agent names none of the crawlers the server knows
//   Inference limits: a declared name, the request behaviour, the network source and this confidence are separate facts.
//   Different declared names do not show different operators, and the request-header class of a declared browser (full /
//   partial / bare) describes the headers only, not who or what sent them.
//
// Input: text files, one log line per line, in time order. Each line may be
//   - the JSON object that follows the '[crawl-src] ' prefix (the documented harvest format),
//   - a whole log line '... [crawl-src] {...}' (an ISO timestamp anywhere before the tag is used as the line time),
//   - a log-API JSON wrapper { "timestamp" | "ts" | "time": ..., "message" | "msg" | "text" | "line" | "log": "[crawl-src] {...}" },
//   - a '[crawl-src] worker=N ENABLED ...' / 'EXPIRED' status line (kept for the coverage section),
//   - optionally '[moon-load] {...}' window lines (used only for the extra agent x date view of (6)).
//   Anything else is counted and ignored.
//
// Merging: counters are summed over every worker and window; distinct-URL HyperLogLogs (the 'fam' p=11 registers, the
//   'fam' cache-key registers and the per-source 'uurl' p=6 registers) are merged by register max and re-estimated with
//   the server's own estimator; Space-Saving top paths are merged with lower / upper bounds; per-minute peaks are per
//   worker, cluster peaks are bounded with the line time (the header 'ts', else a log timestamp before the tag).
//   A line with a header boot + seq is kept once per (boot, seq, kind, part), so a double harvest is dropped even
//   without log timestamps; --dedupe also drops exact repeats of a whole input line (on by default for timestamped lines).
//
// Sections follow the owner's questions:
//   (0) coverage + data quality (0b: edge trust / snapshot state / unattested claims per worker window; 0c: --ranges)
//   (1) who / what / status per family      (2) declared name vs confidence (ver)
//   (3) load by source x page type, unique URLs vs repeats, per-minute rate   (4) edge-cache potential of repeats
//   (5) per-source picture for a targeted action (robots vs rate rule -- candidates, the owner decides)
//   (6) moon month / year: city class x date class, and year offset x outcome x agent x ver (the year-range question)
//   + the limits of this data.
import fs from 'node:fs';
import zlib from 'node:zlib';

// ---------------------------------------------------------------- arguments
const argv = process.argv.slice(2);
const files = [];
let TOP = 15, JSON_OUT = null, DEDUPE = false, RANGES = null;
for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--top') TOP = Math.max(1, parseInt(argv[++i], 10) || 15);
    else if (a === '--json') JSON_OUT = argv[++i];
    else if (a === '--ranges') RANGES = argv[++i];
    else if (a === '--dedupe') DEDUPE = true;
    else if (a === '-h' || a === '--help') { usage(0); }
    else files.push(a);
}
function usage(code) {
    console.log('usage: node scripts/_analyze_crawl_source_obs_1.mjs <harvest.jsonl|log> [...] [--top N] [--json out.json] [--dedupe] [--ranges crawler-ip-ranges.json]');
    process.exit(code);
}
if (!files.length) usage(2);

// ---------------------------------------------------------------- constants shared with server.js
const FAMS = ['moon-gone', 'hijri-gone', 'hijri-cal-gone', 'hijri-cal-future', 'moon-month', 'moon-year'];
const GONE_FAMS = new Set(['moon-gone', 'hijri-gone', 'hijri-cal-gone', 'hijri-cal-future']);
const OUTS = ['2xx', '3xx', '4xx', 'gone', 'shed', 'abort', '5xx'];
const EDGES = [25, 50, 100, 200, 300, 500, 1000, 2000, 5000];
const BUCKETS = ['lt25', 'lt50', 'lt100', 'lt200', 'lt300', 'lt500', 'lt1000', 'lt2000', 'lt5000', 'ge5000'];
const VERS = ['v', 'x', 'np', 'u', 'err', 'na'];
// what each ver value means (printed as "confidence", apart from the declared name): see the header comment
const VER_INFO = {
    v: ['verified list match', 'the client IP is inside the loaded list of the crawler the User-Agent names'],
    x: ['mismatch with the loaded list', 'the IP is NOT inside that list -- not proof that the name is false: a list can be stale or incomplete, a crawler can use addresses it does not publish'],
    np: ['no list for this crawler', 'no published list is loaded for the crawler the User-Agent names'],
    u: ['unverifiable source', 'the IP was not edge-attested (no edge trust in the process, no cf-ray, or not from cf-connecting-ip), so it was not checked'],
    err: ['snapshot unavailable', 'the ranges file was absent or unreadable, so no claim could be checked'],
    na: ['no checked claim', 'the User-Agent names none of the crawlers the server has a list key for (browsers, tools, unnamed bots, and SEO / link-preview crawlers such as AhrefsBot or facebookexternalhit) -- not a statement that it is not a crawler'],
};
const conf = (v) => (VER_INFO[v] ? VER_INFO[v][0] : v === '-' ? 'mixed (rest / overflow row)' : String(v));
const BCLS = ['full', 'full+ch', 'partial', 'partial+ch', 'bare', 'bare+ch'];
const CITIES = ['cur', 'db', 'disc', 'unk', 'na'];
const DATES = ['in', 'p1y', 'pold', 'f1y', 'flate', 'na'];
const DATE_TXT = { in: 'overlaps today-30d..today+90d', p1y: 'ends 30d..1y ago', pold: 'ends > 1y ago', f1y: 'starts 90d..1y ahead', flate: 'starts > 1y ahead', na: 'n/a' };
const HLL_P = 11, HLL_M = 1 << HLL_P;
// _obsAgent names -> the robots.txt user-agent token the crawler documents (declared; compliance is NOT measured here)
const ROBOTS_TOKEN = {
    'googlebot': 'Googlebot', 'google-inspection': 'Google-InspectionTool', 'adsbot-google': 'AdsBot-Google',
    'mediapartners-google': 'Mediapartners-Google', 'bingbot': 'bingbot', 'gptbot': 'GPTBot', 'claudebot': 'ClaudeBot',
    'ccbot': 'CCBot', 'bytespider': 'Bytespider', 'amazonbot': 'Amazonbot', 'applebot': 'Applebot', 'yandexbot': 'YandexBot',
    'meta-external': 'meta-externalagent', 'perplexitybot': 'PerplexityBot',
};
const ADS_CRAWLERS = new Set(['mediapartners-google', 'adsbot-google']);

// ---------------------------------------------------------------- HyperLogLog (the server's estimator, verbatim)
function hllEst(reg) {
    const m = reg.length; let s = 0, z = 0;
    for (let i = 0; i < m; i++) { s += Math.pow(2, -reg[i]); if (reg[i] === 0) z++; }
    const a = m === 16 ? 0.673 : m === 32 ? 0.697 : m === 64 ? 0.709 : 0.7213 / (1 + 1.079 / m);
    let e = a * m * m / s;
    if (e <= 2.5 * m && z > 0) e = m * Math.log(m / z);
    else if (e > 143165576.53) e = -4294967296 * Math.log(1 - e / 4294967296);
    return Math.round(e);
}
const regMax = (dst, src) => { for (let i = 0; i < dst.length; i++) if (src[i] > dst[i]) dst[i] = src[i]; return dst; };
function decodeRegs(b64) {
    try { const r = new Uint8Array(zlib.inflateRawSync(Buffer.from(String(b64), 'base64'))); return r.length === HLL_M ? r : null; } catch (_e) { return null; }
}

// ---------------------------------------------------------------- input parsing
const TS_RE = /(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)/;
const toMs = (v) => { if (v == null) return null; if (typeof v === 'number') return v > 1e12 ? v : v * 1000; const t = Date.parse(String(v)); return Number.isFinite(t) ? t : null; };
const tsIn = (s) => { const m = TS_RE.exec(s); return m ? toMs(m[1].replace(' ', 'T')) : null; };
function parseLine(raw) {
    const s = raw.replace(/^﻿/, '').trim();
    if (!s) return null;
    if (s[0] === '{') {
        let o; try { o = JSON.parse(s); } catch (_e) { return { kind: 'bad' }; }
        if (o && typeof o === 'object' && typeof o.t === 'string' && Array.isArray(o.rows)) return { kind: 'cs', o, ts: null };
        const msg = o && (o.message ?? o.msg ?? o.text ?? o.line ?? o.log);
        if (typeof msg === 'string') {
            const r = parseLine(msg);
            if (r && r.ts == null) r.ts = toMs(o.timestamp ?? o.ts ?? o.time);
            return r;
        }
        return { kind: 'other' };
    }
    const ci = s.indexOf('[crawl-src]'), mi = s.indexOf('[moon-load]');
    if (ci !== -1) {
        const ts = tsIn(s.slice(0, ci)), rest = s.slice(ci + 11).trim();
        if (rest[0] === '{') { try { return { kind: 'cs', o: JSON.parse(rest), ts }; } catch (_e) { return { kind: 'bad', ts }; } }
        const st = /worker=(\d+)\s+(ENABLED|EXPIRED)\b(.*)$/.exec(rest);
        if (st) {
            const kv = {}; for (const m of st[3].matchAll(/([a-z_]+)=(\S+)/g)) kv[m[1]] = m[2];
            return { kind: 'status', w: +st[1], what: st[2], kv, ts };
        }
        return { kind: 'other' };
    }
    if (mi !== -1) {
        const rest = s.slice(mi + 11).trim();
        if (rest[0] === '{') { try { return { kind: 'ml', o: JSON.parse(rest), ts: tsIn(s.slice(0, mi)) }; } catch (_e) { return { kind: 'bad' }; } }
        return { kind: 'other' };
    }
    return { kind: 'other' };
}

// ---------------------------------------------------------------- state
const Q = { lines: 0, cs: 0, byType: {}, status: [], bad: 0, other: 0, dup: 0, versionSkip: 0, orphan: 0, ml: 0, withTs: 0 };
const flushes = [];           // { id, w, ts, win, s, ranges, until, meta, srcN, famRows: [], top: Map(fam -> rows), rate: [] }
const curFlush = new Map();   // w -> flush
const seen = new Set();
const SRC = new Map();        // 7-part key -> aggregate
const FAM = new Map();        // family|outcome -> aggregate (+ merged registers)
const CD = new Map();         // family|city|date|outcome -> n
const TOK = new Map();        // declared|token -> { n, uaMax, uaSum, samples:Set, win }
const ML = new Map();         // [moon-load] month/year: family|date|agent|outcome -> n
const UURL = new Map();       // family|declared|token|ver -> { n, regs (p=6, merged), winSum, wins }
const YR = new Map();         // family|year_off|outcome|agent|ver -> n
const seenCs = new Set();     // boot|seq|kind|part of every header line kept
const windowS = new Set(), untils = new Set(), rangesSeen = new Set();
const colIdx = new Map();
const idxOf = (cols) => { let m = colIdx.get(cols); if (!m) { m = {}; String(cols).split(',').forEach((c, i) => { m[c] = i; }); colIdx.set(cols, m); } return m; };

function openFlush(key, o, ts) {
    const f = { id: flushes.length, w: o.w, boot: o.boot || null, ts, win: o.win, s: o.s, ranges: o.ranges, until: o.until, meta: null, srcN: 0, famRows: [], top: new Map(), rate: [] };
    flushes.push(f); curFlush.set(key, f); return f;
}
function addSrc(o, f) {
    const C = idxOf(o.cols);
    for (const r of o.rows) {
        const key = [r[C.family], r[C.declared], r[C.token], r[C.ver], r[C.bcls], r[C.country], r[C.prefix]];
        const k = key.join('|');
        let a = SRC.get(k);
        if (!a) { a = { key, n: 0, out: new Array(7).fill(0), msTot: 0, msMax: 0, b: new Array(10).fill(0), urlsSum: 0, urlsMax: 0, ipsSum: 0, ipsMax: 0, pmax: 0, lb: 0,
            get: 0, head: 0, other: 0, ref: [0, 0, 0, 0], enc: [0, 0, 0], pseudo: 0, keys: 0, wins: 0 }; SRC.set(k, a); }
        const n = +r[C.n] || 0;
        a.n += n; a.wins++;
        OUTS.forEach((x, i) => { a.out[i] += +r[C[x]] || 0; });
        a.msTot += (+r[C.avg_ms] || 0) * n; a.msMax = Math.max(a.msMax, +r[C.max_ms] || 0);
        BUCKETS.forEach((x, i) => { a.b[i] += +r[C[x]] || 0; });
        const u = +r[C.urls] || 0, ip = +r[C.ips] || 0;
        a.urlsSum += u; a.urlsMax = Math.max(a.urlsMax, u); a.ipsSum += ip; a.ipsMax = Math.max(a.ipsMax, ip);
        a.pmax = Math.max(a.pmax, +r[C.max_min] || 0); a.lb = a.lb || +r[C.max_min_lb] || 0;
        a.get += +r[C.get] || 0; a.head += +r[C.head] || 0; a.other += +r[C.other] || 0;
        ['ref_none', 'ref_self', 'ref_search', 'ref_other'].forEach((x, i) => { a.ref[i] += +r[C[x]] || 0; });
        ['enc_br', 'enc_gzip', 'enc_none'].forEach((x, i) => { a.enc[i] += +r[C[x]] || 0; });
        a.pseudo += +r[C.pseudo] || 0; a.keys += +r[C.keys] || 0;
        if (f) f.srcN += n;
    }
}
function addFam(o, f, ts) {
    const C = idxOf(o.cols);
    for (const r of o.rows) {
        const k = r[C.family] + '|' + r[C.outcome];
        let a = FAM.get(k);
        if (!a) { a = { fam: r[C.family], out: r[C.outcome], n: 0, msTot: 0, msMax: 0, b: new Array(10).fill(0), get: 0, head: 0, other: 0, regs: new Uint8Array(HLL_M), winEstSum: 0, badRegs: 0,
            qs: 0, kregs: new Uint8Array(HLL_M), keyRows: 0, rows: 0 }; FAM.set(k, a); }
        const n = +r[C.n] || 0;
        a.n += n; a.msTot += (+r[C.avg_ms] || 0) * n; a.msMax = Math.max(a.msMax, +r[C.max_ms] || 0);
        BUCKETS.forEach((x, i) => { a.b[i] += +r[C[x]] || 0; });
        a.get += +r[C.get] || 0; a.head += +r[C.head] || 0; a.other += +r[C.other] || 0;
        a.winEstSum += +r[C.urls] || 0;
        const regs = decodeRegs(r[C.regs_p11_deflateraw_b64]);
        if (regs) regMax(a.regs, regs); else a.badRegs++;
        // cache-key registers (path + query): '=' when no request of the row had a query (then equal to the URL ones)
        let kregs = null;
        a.rows++;
        if (C.key_regs_p11_deflateraw_b64 !== undefined) {
            const kv = r[C.key_regs_p11_deflateraw_b64];
            kregs = kv === '=' ? regs : decodeRegs(kv);
            if (kregs) { regMax(a.kregs, kregs); a.keyRows++; }
            a.qs += +r[C.qs] || 0;
        }
        if (f) f.famRows.push({ fam: a.fam, out: a.out, n, regs, kregs, ts: ts ?? f.ts });
    }
}
function addTop(o, f) {
    const C = idxOf(o.cols);
    for (const r of o.rows) {
        const fam = r[C.family];
        if (!f.top.has(fam)) f.top.set(fam, []);
        f.top.get(fam).push([String(r[C.path]), +r[C.n] || 0, +r[C.err] || 0]);
    }
}
function addRate(o, f) {
    const C = idxOf(o.cols);
    for (const r of o.rows) f.rate.push({ fam: r[C.family], n: +r[C.n] || 0, pmax: +r[C.max_per_min] || 0, act: +r[C.active_min] || 0 });
}
function addCd(o) {
    const C = idxOf(o.cols);
    for (const r of o.rows) { const k = [r[C.family], r[C.city], r[C.date], r[C.outcome]].join('|'); CD.set(k, (CD.get(k) || 0) + (+r[C.n] || 0)); }
}
function addTok(o) {
    const C = idxOf(o.cols);
    for (const r of o.rows) {
        const k = r[C.declared] + '|' + r[C.token];
        let a = TOK.get(k);
        if (!a) { a = { d: r[C.declared], tok: r[C.token], n: 0, uaMax: 0, uaSum: 0, samples: new Set(), wins: 0 }; TOK.set(k, a); }
        a.n += +r[C.n] || 0; a.wins++;
        const u = +r[C.ua_strings] || 0; a.uaMax = Math.max(a.uaMax, u); a.uaSum += u;
        const smp = r[C.sample];
        if (typeof smp === 'string' && a.samples.size < 4) a.samples.add(smp);
    }
}
function decodeB32(s) {
    const t = String(s == null ? '' : s);
    if (t.length !== 64) return null;
    const r = new Uint8Array(64);
    for (let i = 0; i < 64; i++) { const v = parseInt(t[i], 32); if (!(v >= 0)) return null; r[i] = v; }
    return r;
}
function addUurl(o) {
    const C = idxOf(o.cols);
    for (const r of o.rows) {
        const key = [r[C.family], r[C.declared], r[C.token], r[C.ver]], k = key.join('|');
        let a = UURL.get(k);
        if (!a) { a = { key, n: 0, regs: new Uint8Array(64), winSum: 0, winMax: 0, wins: 0, bad: 0 }; UURL.set(k, a); }
        const u = +r[C.urls] || 0;
        a.n += +r[C.n] || 0; a.winSum += u; a.winMax = Math.max(a.winMax, u); a.wins++;
        const g = decodeB32(r[C.regs_p6_b32]);
        if (g) regMax(a.regs, g); else a.bad++;
    }
}
function addYr(o) {
    const C = idxOf(o.cols);
    for (const r of o.rows) { const k = [r[C.family], r[C.year_off], r[C.outcome], r[C.agent], r[C.ver]].join('|'); YR.set(k, (YR.get(k) || 0) + (+r[C.n] || 0)); }
}
function addMl(o) {
    if (!Array.isArray(o.rows) || !o.cols) return;
    const C = idxOf(o.cols);
    if (C.agent === undefined) return;
    for (const r of o.rows) {
        if (r[C.family] !== 'month' && r[C.family] !== 'year') continue;
        const k = ['moon-' + r[C.family], r[C.date], r[C.agent], r[C.outcome]].join('|');
        ML.set(k, (ML.get(k) || 0) + (+r[C.n] || 0));
    }
}

for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const raw of text.split(/\r?\n/)) {
        if (!raw.trim()) continue;
        Q.lines++;
        const p = parseLine(raw);
        if (!p || p.kind === 'other') { Q.other++; continue; }
        if (p.kind === 'bad') { Q.bad++; continue; }
        if (p.ts != null) Q.withTs++;
        if (DEDUPE || p.ts != null) { const key = raw.trim(); if (seen.has(key)) { Q.dup++; continue; } seen.add(key); }
        if (p.kind === 'status') { Q.status.push(p); continue; }
        if (p.kind === 'ml') { Q.ml++; addMl(p.o); continue; }
        const o = p.o;
        if (o.v !== 1) { Q.versionSkip++; continue; }
        if (o.boot && o.seq != null) { const k2 = o.boot + '|' + o.seq + '|' + o.t + '|' + o.part; if (seenCs.has(k2)) { Q.dup++; continue; } seenCs.add(k2); }
        const lts = p.ts != null ? p.ts : toMs(o.ts);   // the log timestamp, else the header's flush time
        if (p.ts == null && lts != null) Q.withTs++;
        Q.cs++; Q.byType[o.t] = (Q.byType[o.t] || 0) + 1;
        if (o.s) windowS.add(o.s); if (o.until) untils.add(o.until); rangesSeen.add(o.ranges == null ? null : o.ranges);
        const fk = (o.boot || '') + '|' + o.w;            // a worker of one process (the boot id keeps restarts and deploys apart)
        let f = curFlush.get(fk);
        if (o.t === 'src' && o.part === 0) { f = openFlush(fk, o, lts); f.meta = o.meta || null; }
        else if (!f) { f = openFlush(fk, o, lts); Q.orphan++; }
        if (f.ts == null && lts != null) f.ts = lts;
        if (o.t === 'src') addSrc(o, f);
        else if (o.t === 'fam') addFam(o, f, lts);
        else if (o.t === 'top') addTop(o, f);
        else if (o.t === 'rate') addRate(o, f);
        else if (o.t === 'cd') addCd(o);
        else if (o.t === 'tok') addTok(o);
        else if (o.t === 'uurl') addUurl(o);
        else if (o.t === 'yr') addYr(o);
    }
}

// ---------------------------------------------------------------- formatting helpers
const out = [];
const say = (s = '') => { out.push(s); };
const fmt = (v) => typeof v === 'number' ? (Number.isInteger(v) ? v.toLocaleString('en-US') : v.toFixed(2)) : (v == null ? '-' : String(v));
const pct = (a, b) => b > 0 ? (100 * a / b).toFixed(1) + '%' : '-';
const NUMISH = /^[-+]?[\d,.]+%?$|^[<>]=?\d+$|^-$/;
function table(head, rows) {
    const cells = [head, ...rows].map((r) => r.map(fmt));
    const wd = head.map((_, i) => Math.max(...cells.map((r) => (r[i] || '').length)));
    // a column is right-aligned when every body cell is a number (or '-')
    const right = head.map((_, i) => rows.length > 0 && cells.slice(1).every((r) => NUMISH.test(r[i] || '-')));
    for (let j = 0; j < cells.length; j++) {
        say('  ' + cells[j].map((c, i) => (right[i] ? (c || '').padStart(wd[i]) : (c || '').padEnd(wd[i]))).join('  ').trimEnd());
        if (j === 0) say('  ' + wd.map((w) => '-'.repeat(w)).join('  '));
    }
}
const h1 = (s) => { say(''); say('='.repeat(100)); say(s); say('='.repeat(100)); };
const h2 = (s) => { say(''); say('-- ' + s); };
function quant(b, q) {   // bucket label holding the q-quantile
    const n = b.reduce((x, y) => x + y, 0); if (!n) return '-';
    let c = 0; for (let i = 0; i < b.length; i++) { c += b[i]; if (c >= q * n) return i < EDGES.length ? '<' + EDGES[i] : '>=' + EDGES[EDGES.length - 1]; }
    return '-';
}
const srcLabel = (d, t) => (!t || t === '-') ? d : (t.indexOf(d + ':') === 0 ? t : d + ':' + t);   // 'browser:chrome-120:windows' already names its class
const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);

// ---------------------------------------------------------------- (0) coverage
const srcRows = [...SRC.values()];
const totalSrcN = sum(srcRows, (a) => a.n);
const famRowsAll = [...FAM.values()];
const totalFamN = sum(famRowsAll, (a) => a.n);
const metaTotal = sum(flushes.filter((f) => f.meta), (f) => +f.meta.total || 0);
const workers = [...new Set(flushes.map((f) => f.w))].sort((a, b) => a - b);
const boots = [...new Set(flushes.map((f) => f.boot).filter(Boolean))];
const tsList = flushes.map((f) => f.ts).filter((t) => t != null).sort((a, b) => a - b);
const hasTs = tsList.length === flushes.length && flushes.length > 0;
const WIN_S = windowS.size ? Math.max(...windowS) : 300;

h1('CRAWL-SOURCE-OBSERVABILITY-1 -- offline analysis of ' + files.length + ' harvest file(s)');
h2('(0) coverage and data quality');
table(['item', 'value'], [
    ['input lines', Q.lines], ['[crawl-src] JSON lines (v1)', Q.cs], ['  by type', Object.entries(Q.byType).map(([k, v]) => k + '=' + v).join(' ')],
    ['status lines (ENABLED / EXPIRED)', Q.status.filter((s) => s.what === 'ENABLED').length + ' / ' + Q.status.filter((s) => s.what === 'EXPIRED').length],
    ['[moon-load] window lines (optional)', Q.ml], ['unparseable (truncated?) lines', Q.bad], ['ignored lines', Q.other],
    ['duplicate lines dropped', Q.dup], ['lines of another format version', Q.versionSkip], ['lines before their window header (orphans)', Q.orphan],
    ['worker windows (flushes)', flushes.length + ' over workers ' + (workers.join(',') || '-') + ' (' + flushes.filter((f) => f.win === 'final').length + ' final)'],
    ['processes (boot ids)', boots.length ? boots.length + ' (' + boots.slice(0, 6).join(',') + (boots.length > 6 ? ',...' : '') + ')' : 'no boot ids (an older format)'],
    ['windows whose User-Agent cache filled (meta.ua_ovf > 0), requests', flushes.filter((f) => f.meta && f.meta.ua_ovf).length + ', ' + sum(flushes.filter((f) => f.meta), (f) => +f.meta.ua_ovf || 0)],
    ['window length s', [...windowS].join(',') || '-'],
    ['time span', hasTs ? new Date(tsList[0]).toISOString() + ' .. ' + new Date(tsList[tsList.length - 1]).toISOString() : (tsList.length ? 'partial timestamps only' : 'no timestamps in the input')],
    ['expiry (until)', [...untils].join(',') || '-'], ['ranges snapshot date', [...rangesSeen].map((r) => r == null ? 'none' : r).join(',') || '-'],
    ['ranges loaded (ENABLED lines: operator v4+v6 ranges)', [...new Set(Q.status.filter((x) => x.what === 'ENABLED').map((x) => x.kv.ops || x.kv.ranges_error || 'none'))].join(' | ') || '-'],
    ['recorded requests: meta.total / src rows / fam rows', metaTotal + ' / ' + totalSrcN + ' / ' + totalFamN],
    ['windows with key-cap compaction / overflow / prefix table full', flushes.filter((f) => f.meta && f.meta.compact).length + ' / ' + flushes.filter((f) => f.meta && f.meta.ovf).length + ' / ' + flushes.filter((f) => f.meta && f.meta.pfx_full).length],
    ['fam rows with unreadable registers', sum(famRowsAll, (a) => a.badRegs)],
]);
const warn = [];
const metaF = flushes.filter((f) => f.meta);
const noEdge = metaF.filter((f) => f.meta.edge_trust === 0), badRanges = metaF.filter((f) => f.meta.ranges_state !== undefined && f.meta.ranges_state !== 'ok');
const unattTot = sum(metaF, (f) => +f.meta.unattested || 0);
if (rangesSeen.has(null) || badRanges.length) warn.push('some windows ran WITHOUT a usable ranges snapshot (' + (badRanges.length ? [...new Set(badRanges.map((f) => f.meta.ranges_state))].join(' / ') + ' in ' + badRanges.length + ' window(s)' : 'no snapshot date') + '): every crawler claim there is "err" (snapshot unavailable), nothing was checked.');
if (noEdge.length) warn.push(noEdge.length + ' window(s) ran in a process that does not trust the edge (meta.edge_trust 0, e.g. a local server): every crawler claim there is "u" (unverifiable source).');
if (unattTot && metaF.some((f) => f.meta.edge_trust === 1 && f.meta.unattested > 0)) warn.push('some claims in edge-trusting windows were not edge-attested (no cf-ray, or the IP not from cf-connecting-ip): those are "u", not checked.');
if (metaF.length && !metaF.some((f) => f.meta.edge_trust !== undefined)) warn.push('no meta.edge_trust in the input (a format before the owner conditions of 2026-10-17): read "x" / "v" there with care.');
if (metaTotal !== totalSrcN || totalSrcN !== totalFamN) warn.push('totals differ between meta / src / fam (a partial harvest: a window cut at the start or end of the export).');
if (flushes.some((f) => f.meta && f.meta.compact)) warn.push('a key-cap compaction happened: some prefixes that crossed MIN_N late keep their early requests in "*".');
if (flushes.some((f) => f.meta && f.meta.ovf)) warn.push('the source table overflowed: "overflow" rows have no identity breakdown.');
if (!hasTs) warn.push('no line timestamps: cluster-wide per-minute peaks and time-horizon (TTL) cache estimates are not computable; harvest with the log timestamps to get them.');
for (const w of warn) say('  ! ' + w);

// per worker window: the verification context of every window (edge trust, snapshot state, claims not edge-attested)
h2('(0b) per worker window: edge trust, ranges snapshot state, claims not edge-attested (meta of each src line)');
const winRows = metaF.map((f) => ({ boot: f.boot, w: f.w, ts: f.ts != null ? new Date(f.ts).toISOString().slice(0, 19) + 'Z' : null, win: f.win, ranges: f.ranges == null ? null : f.ranges,
    total: +f.meta.total || 0, edge_trust: f.meta.edge_trust === undefined ? null : f.meta.edge_trust, ranges_state: f.meta.ranges_state === undefined ? null : f.meta.ranges_state,
    unattested: f.meta.unattested === undefined ? null : f.meta.unattested }));
const wGroups = new Map();
for (const r of winRows) {
    const k = r.edge_trust + '|' + r.ranges_state + '|' + r.ranges;
    const g = wGroups.get(k) || { edge_trust: r.edge_trust, ranges_state: r.ranges_state, ranges: r.ranges, windows: 0, workers: new Set(), total: 0, unattested: 0 };
    g.windows++; g.workers.add((r.boot || '') + '|' + r.w); g.total += r.total; g.unattested += r.unattested || 0; wGroups.set(k, g);
}
table(['edge_trust', 'ranges_state', 'snapshot date', 'windows', 'worker processes', 'requests', 'claims not edge-attested ("u")'],
    [...wGroups.values()].map((g) => [g.edge_trust == null ? '-' : String(g.edge_trust), g.ranges_state || '-', g.ranges || 'none', g.windows, g.workers.size, g.total, g.unattested]));
table(['boot', 'worker', 'flush time (UTC)', 'win', 'requests', 'edge_trust', 'ranges_state', 'snapshot', 'unattested'],
    winRows.slice(0, TOP * 4).map((r) => [r.boot || '-', r.w, r.ts || '-', r.win, r.total, r.edge_trust == null ? '-' : String(r.edge_trust), r.ranges_state || '-', r.ranges || 'none', r.unattested == null ? '-' : r.unattested]));
if (winRows.length > TOP * 4) say('  ... ' + (winRows.length - TOP * 4) + ' more windows (all in --json: windows)');
// the snapshot's provenance (--ranges): list sources, the publisher's creationTime, the snapshot date
let rangesInfo = null;
if (RANGES) {
    h2('(0c) the ranges snapshot (--ranges ' + RANGES + '): where each crawler list came from');
    try {
        const sj = JSON.parse(fs.readFileSync(RANGES, 'utf8'));
        const lists = sj.lists || {};
        rangesInfo = { date: sj.date || null, downloaded: sj.downloaded || null, lists: Object.keys(sj.operators || {}).sort().map((k) => ({ list: k, prefixes: (sj.operators[k] || []).length,
            sources: (lists[k] && lists[k].sources) || [], creationTime: (lists[k] && lists[k].creationTime) || [] })) };
        say('  snapshot date ' + (sj.date || '-') + (sj.downloaded ? ', downloaded ' + sj.downloaded : '') + '; windows report snapshot ' + [...rangesSeen].map((r) => r == null ? 'none' : r).join(','));
        table(['list', 'CIDRs', 'publisher creationTime', 'source'], rangesInfo.lists.flatMap((l) => (l.sources.length ? l.sources : ['-']).map((s, i) => [i ? '' : l.list, i ? '' : l.prefixes, l.creationTime[i] || '-', s])));
        if (!Object.keys(lists).length) say('  ! the snapshot has no "lists" block: the sources of its lists are not documented in it.');
    } catch (e) { say('  ! cannot read ' + RANGES + ': ' + (e && e.message)); }
}

// ---------------------------------------------------------------- (1) per family
h1('(1) what was requested and how it was answered -- per family (exact counts, all workers and windows)');
const famOrder = (f) => { const i = FAMS.indexOf(f); return i === -1 ? 99 : i; };
const famTot = new Map();
for (const a of famRowsAll) {
    let t = famTot.get(a.fam);
    if (!t) { t = { fam: a.fam, n: 0, out: {}, msTot: 0, msMax: 0, b: new Array(10).fill(0), get: 0, head: 0, other: 0, regs: new Uint8Array(HLL_M) }; famTot.set(a.fam, t); }
    t.n += a.n; t.out[a.out] = (t.out[a.out] || 0) + a.n; t.msTot += a.msTot; t.msMax = Math.max(t.msMax, a.msMax);
    a.b.forEach((x, i) => { t.b[i] += x; }); t.get += a.get; t.head += a.head; t.other += a.other; regMax(t.regs, a.regs);
}
const famList = [...famTot.values()].sort((x, y) => famOrder(x.fam) - famOrder(y.fam));
table(['family', 'n', 'share', ...OUTS, 'GET', 'HEAD', 'other', 'avg_ms~', 'p50', 'p95', 'max_ms'],
    famList.map((t) => [t.fam, t.n, pct(t.n, totalFamN), ...OUTS.map((o) => t.out[o] || 0), t.get, t.head, t.other,
        +(t.msTot / Math.max(1, t.n)).toFixed(1), quant(t.b, 0.5), quant(t.b, 0.95), t.msMax]));
say('  (avg_ms~ is rebuilt from per-row rounded averages; sub-millisecond 410s read as 0-1 ms.)');

h2('(1b) declared identity per family (top ' + TOP + ' a family; token shown for other-bot / unknown / browser / seo / social)');
for (const t of famList) {
    const g = new Map();
    for (const a of srcRows) {
        if (a.key[0] !== t.fam) continue;
        const lab = srcLabel(a.key[1], a.key[2]);
        let e = g.get(lab);
        if (!e) { e = { lab, n: 0, out: new Array(7).fill(0), ver: {}, cc: new Map(), pfx: 0, star: 0, head: 0 }; g.set(lab, e); }
        e.n += a.n; a.out.forEach((x, i) => { e.out[i] += x; }); e.ver[a.key[3]] = (e.ver[a.key[3]] || 0) + a.n; e.head += a.head;
        e.cc.set(a.key[5], (e.cc.get(a.key[5]) || 0) + a.n);
        if (a.key[6] === '*') e.star += a.n; else if (a.key[6] !== '-') e.pfx += a.n;
    }
    const rows = [...g.values()].sort((x, y) => y.n - x.n);
    say(''); say('  ' + t.fam + ' (n=' + fmt(t.n) + ')');
    table(['declared name', 'n', 'share', 'gone', '2xx', '3xx', '4xx', 'shed', 'abort', 'HEAD', 'ver v/x/np/u/err/na', 'top countries', 'in emitted /24-/48'],
        rows.slice(0, TOP).map((e) => [e.lab, e.n, pct(e.n, t.n), e.out[3], e.out[0], e.out[1], e.out[2], e.out[4], e.out[5], e.head,
            VERS.map((v) => e.ver[v] || 0).join('/') + (e.ver['-'] ? ' ?' + e.ver['-'] : ''),
            [...e.cc.entries()].sort((x, y) => y[1] - x[1]).slice(0, 3).map(([c, n]) => c + ':' + n).join(' '), pct(e.pfx, e.n)]));
    if (rows.length > TOP) say('  ... ' + (rows.length - TOP) + ' more sources, n=' + fmt(sum(rows.slice(TOP), (e) => e.n)));
}

// ---------------------------------------------------------------- (2) declared vs verified
h1('(2) declared name vs confidence (a User-Agent that names a crawler is a claim; "ver" checks it against the published list of THAT crawler)');
say('  ver = the confidence of the claim, kept apart from the declared name:');
for (const v of VERS) say('    ' + ("'" + v + "'").padEnd(4) + ' ' + VER_INFO[v][0] + ' -- ' + VER_INFO[v][1]);
say('  A declared name is what the client says; different declared names do not show different operators, and one name');
say('  can be sent by several operators. Behaviour (what and how often) and network source are reported separately below.');
const byDecl = new Map();
for (const a of srcRows) {
    const lab = srcLabel(a.key[1], a.key[2]);
    let e = byDecl.get(lab);
    if (!e) { e = { lab, d: a.key[1], tok: a.key[2], n: 0, ver: {}, gone: 0, mm: 0, bcls: {}, cc: new Map(), pfx: new Map(), star: 0, unk: 0, pmax: 0, fams: {} }; byDecl.set(lab, e); }
    e.n += a.n; e.ver[a.key[3]] = (e.ver[a.key[3]] || 0) + a.n; e.bcls[a.key[4]] = (e.bcls[a.key[4]] || 0) + a.n;
    e.fams[a.key[0]] = (e.fams[a.key[0]] || 0) + a.n;
    if (GONE_FAMS.has(a.key[0])) e.gone += a.n; else e.mm += a.n;
    e.cc.set(a.key[5], (e.cc.get(a.key[5]) || 0) + a.n);
    if (a.key[6] === '*') e.star += a.n; else if (a.key[6] === '-') e.unk += a.n;
    else { const p = e.pfx.get(a.key[6]) || { n: 0, pmax: 0, ver: a.key[3], cc: a.key[5] }; p.n += a.n; p.pmax = Math.max(p.pmax, a.pmax); e.pfx.set(a.key[6], p); }
    e.pmax = Math.max(e.pmax, a.pmax);
}
const decl = [...byDecl.values()].sort((x, y) => y.n - x.n);
const CLAIM_VERS = ['v', 'x', 'np', 'u', 'err'];
const claims = decl.filter((e) => CLAIM_VERS.some((v) => (e.ver[v] || 0) > 0));
h2('(2a) declared names that claim a crawler with a list key (Google per list, Bing, OpenAI per crawler, Apple, Perplexity per crawler, named crawlers without a list, snapshot lists): confidence counts');
table(['declared name', 'n', 'v list match', 'x mismatch', 'np no list', 'u unverifiable', 'err no snapshot', 'na', 'mixed (rest/overflow)', 'checked (v+x)', 'list match of checked', 'main confidence'],
    claims.map((e) => {
        const chk = (e.ver.v || 0) + (e.ver.x || 0);
        const top = [...VERS, '-'].map((v) => [v, e.ver[v] || 0]).sort((a, b) => b[1] - a[1])[0];
        return [e.lab, e.n, e.ver.v || 0, e.ver.x || 0, e.ver.np || 0, e.ver.u || 0, e.ver.err || 0, e.ver.na || 0, e.ver['-'] || 0, chk, pct(e.ver.v || 0, chk), conf(top[0]) + ' ' + pct(top[1], e.n)];
    }));
if (!claims.length) say('  (no claiming source in the input)');
say('  "list match of checked" counts only v and x: u (not edge-attested), np (no list) and err (no snapshot) were never checked.');
h2('(2b) declared browsers: request-header consistency (a label of the request headers only; it identifies no one)');
// a 'browser' User-Agent whose token is a product name (e.g. GoogleOther, HeadlessChrome) is browser-LIKE, not a plain browser
const brRow = (e) => [e.tok, e.n, ...BCLS.map((b) => e.bcls[b] || 0), pct((e.bcls.full || 0) + (e.bcls['full+ch'] || 0), e.n)];
const br = decl.filter((e) => e.d === 'browser' && String(e.tok).indexOf('browser:') === 0);
const brLike = decl.filter((e) => e.d === 'browser' && String(e.tok).indexOf('browser:') !== 0);
table(['browser token', 'n', ...BCLS, 'full share'], br.slice(0, TOP).map(brRow));
if (br.length > TOP) say('  ... ' + (br.length - TOP) + ' more browser tokens, n=' + fmt(sum(br.slice(TOP), (e) => e.n)));
if (brLike.length) {
    say('  browser-like User-Agents that name a product (declared "browser" by _obsAgent, but not a plain browser):');
    table(['product token', 'n', ...BCLS, 'full share'], brLike.slice(0, TOP).map(brRow));
}
h2('(2c) names that are not one bot: tokens under other-bot / unknown / browser / known-seo-crawler / known-social-bot, and distinct User-Agent strings');
const tok = [...TOK.values()].sort((x, y) => y.n - x.n);
for (const d of ['other-bot', 'unknown', 'browser', 'known-seo-crawler', 'known-social-bot']) {
    const l = tok.filter((t) => t.d === d);
    say('  ' + d + ': ' + l.length + ' distinct tokens, n=' + fmt(sum(l, (t) => t.n)) + (l.some((t) => t.tok === 'overflow') ? ' (token table overflowed in some window)' : ''));
}
table(['declared', 'token', 'n', 'UA strings (max window .. sum of windows)', 'sample (not browser-shaped only, <=160 chars)'],
    tok.slice(0, TOP * 2).map((t) => [t.d, t.tok, t.n, t.uaMax + ' .. ' + t.uaSum, t.samples.size ? [...t.samples][0] + (t.samples.size > 1 ? '  (+' + (t.samples.size - 1) + ' other samples)' : '') : '-']));

// ---------------------------------------------------------------- (3) load
h1('(3) load by source x page type, unique URLs vs repeats, per-minute rate');
h2('(3a) requests by source (rows) x family (columns); time = n x avg latency (wall time, not CPU)');
const totMs = sum(srcRows, (a) => a.msTot);
table(['source', 'n', 'share', ...FAMS, 'time share'],
    decl.slice(0, TOP * 2).map((e) => {
        const ms = sum(srcRows.filter((a) => srcLabel(a.key[1], a.key[2]) === e.lab), (a) => a.msTot);
        return [e.lab, e.n, pct(e.n, totalSrcN), ...FAMS.map((f) => e.fams[f] || 0), pct(ms, totMs)];
    }));
h2('(3b) unique URLs vs repeated requests per family x outcome (HyperLogLog p=11 merged over all workers and windows, +-2.3%)');
const famRowsSorted = famRowsAll.slice().sort((x, y) => famOrder(x.fam) - famOrder(y.fam) || y.n - x.n);
table(['family', 'outcome', 'n', 'distinct URLs', 'repeat ratio n/distinct', 'sum of per-window distinct', 'repeats inside windows'],
    famRowsSorted.map((a) => { const d = hllEst(a.regs); return [a.fam, a.out, a.n, d, +(a.n / Math.max(1, d)).toFixed(2), a.winEstSum, pct(a.n - a.winEstSum, a.n)]; }));
table(['family (all outcomes)', 'n', 'distinct URLs', 'repeat ratio'], famList.map((t) => { const d = hllEst(t.regs); return [t.fam, t.n, d, +(t.n / Math.max(1, d)).toFixed(2)]; }));
h2('(3c) per source (family x declared x token x ver): distinct URLs over the whole harvest (uurl p=6 registers merged, +-13%)');
const uu = [...UURL.values()].sort((x, y) => y.n - x.n);
if (uu.length) {
    table(['family', 'source', 'ver', 'n', 'distinct URLs (merged)', 'repeat ratio n/distinct', 'per-window distinct max..sum', 'windows'],
        uu.slice(0, TOP * 2).map((a) => { const d = hllEst(a.regs); return [a.key[0], srcLabel(a.key[1], a.key[2]), a.key[3], a.n, d, +(a.n / Math.max(1, d)).toFixed(2), a.winMax + '..' + a.winSum, a.wins]; }));
    if (uu.length > TOP * 2) say('  ... ' + (uu.length - TOP * 2) + ' more sources, n=' + fmt(sum(uu.slice(TOP * 2), (a) => a.n)));
} else say('  (no uurl lines: an older format -- per-source distinct URLs only as per-window estimates below)');
h2('(3c\') per source row: distinct URLs / IPs per worker window (IPs are salted per process: they never merge)');
const srcTop = srcRows.slice().sort((x, y) => y.n - x.n).slice(0, TOP * 2);
table(['family', 'source', 'ver', 'country', 'prefix', 'n', 'windows', 'URLs max-window..sum', 'IPs max-window..sum', 'peak/min/worker'],
    srcTop.map((a) => [a.key[0], srcLabel(a.key[1], a.key[2]), a.key[3], a.key[5], a.key[6], a.n, a.wins, a.urlsMax + '..' + a.urlsSum, a.ipsMax + '..' + a.ipsSum, a.pmax + (a.lb ? ' (lb)' : '')]));
h2('(3d) per-minute rate per family');
const rateByFam = new Map();
for (const f of flushes) for (const r of f.rate) {
    let e = rateByFam.get(r.fam);
    if (!e) { e = { fam: r.fam, n: 0, act: 0, peakW: 0, wins: 0, buckets: new Map() }; rateByFam.set(r.fam, e); }
    e.n += r.n; e.act += r.act; e.peakW = Math.max(e.peakW, r.pmax); e.wins++;
    if (f.ts != null) { const b = Math.floor(f.ts / (WIN_S * 1000)); const x = e.buckets.get(b) || { sumPk: 0, maxPk: 0, n: 0 }; x.sumPk += r.pmax; x.maxPk = Math.max(x.maxPk, r.pmax); x.n += r.n; e.buckets.set(b, x); }
}
table(['family', 'n', 'active worker-minutes', 'avg per active worker-minute', 'peak in one worker-minute', 'cluster peak/min bounds (lo..hi)', 'busiest window, req/min (cluster)'],
    [...rateByFam.values()].sort((x, y) => famOrder(x.fam) - famOrder(y.fam)).map((e) => {
        const bs = [...e.buckets.values()];
        const lo = bs.length ? Math.max(...bs.map((x) => x.maxPk)) : null, hi = bs.length ? Math.max(...bs.map((x) => x.sumPk)) : null;
        const busy = bs.length ? Math.max(...bs.map((x) => x.n)) / (WIN_S / 60) : null;
        return [e.fam, e.n, e.act, +(e.n / Math.max(1, e.act)).toFixed(1), e.peakW, hasTs ? lo + '..' + hi : 'needs timestamps', hasTs ? +busy.toFixed(1) : 'needs timestamps'];
    }));
say('  (a minute that straddles two windows is counted active in both; the cluster bounds assume windows of all workers align to the same ' + WIN_S + ' s slot.)');
h2('(3e) the busiest emitted network prefixes (>= MIN_N requests in one worker window)');
const pfxRows = srcRows.filter((a) => a.key[6] !== '*' && a.key[6] !== '-').sort((x, y) => y.pmax - x.pmax || y.n - x.n).slice(0, TOP);
table(['prefix', 'family', 'source', 'ver', 'country', 'n', 'peak/min/worker', 'IPs max-window'], pfxRows.map((a) => [a.key[6], a.key[0], srcLabel(a.key[1], a.key[2]), a.key[3], a.key[5], a.n, a.pmax, a.ipsMax]));
if (!pfxRows.length) say('  (no prefix reached MIN_N in any worker window)');

// ---------------------------------------------------------------- (4) edge-cache potential
h1('(4) could the repeated public responses be edge-cached? (repeat ratio of each answer, per URL path)');
say('  hit share = 1 - distinct/n for a cache that keeps every answer for the horizon, by URL PATH (query stripped -- an');
say('  upper bound) and, where the lines carry them, by CACHE KEY (path + query, as an edge keys by default). Nothing here');
say('  sees Vary / cookies / the edge\'s own rules.');
const horizons = hasTs ? [['window (' + WIN_S + ' s)', WIN_S * 1000], ['1 hour', 3600e3], ['1 day', 86400e3]] : [];
const famBuckets = (fam, H) => {   // sum over time buckets of the distinct URLs in each bucket (all workers, all outcomes of fam)
    const m = new Map();
    for (const f of flushes) for (const r of f.famRows) {
        if (r.fam !== fam || !r.regs) continue;
        const b = H === 0 ? 'f' + f.id : Math.floor((r.ts ?? f.ts) / H);
        regMax(m.get(b) || (m.set(b, new Uint8Array(HLL_M)), m.get(b)), r.regs);
    }
    let s = 0; for (const v of m.values()) s += hllEst(v); return s;
};
table(['family', 'n', 'per worker-window', ...horizons.map((h) => h[0]), 'whole harvest'],
    famList.map((t) => {
        const whole = hllEst(t.regs);
        const cells = [famBuckets(t.fam, 0), ...horizons.map((h) => famBuckets(t.fam, h[1])), whole];
        return [t.fam, t.n, ...cells.map((d) => pct(Math.max(0, t.n - d), t.n))];
    }));
const famKeyRows = famRowsAll.filter((a) => a.keyRows > 0);
if (famKeyRows.length) {
    h2('(4a) by cache key (path + query): requests with a query string, distinct paths vs distinct keys, hit share');
    const kt = new Map();
    for (const a of famRowsAll) {
        let t = kt.get(a.fam);
        if (!t) { t = { fam: a.fam, n: 0, qs: 0, rows: 0, keyRows: 0, regs: new Uint8Array(HLL_M), kregs: new Uint8Array(HLL_M) }; kt.set(a.fam, t); }
        t.n += a.n; t.qs += a.qs; t.rows += a.rows; t.keyRows += a.keyRows; regMax(t.regs, a.regs); regMax(t.kregs, a.kregs);
    }
    const keyBuckets = (fam, H) => {
        const m = new Map();
        for (const f of flushes) for (const r of f.famRows) {
            if (r.fam !== fam || !r.kregs) continue;
            const b = H === 0 ? 'f' + f.id : Math.floor((r.ts ?? f.ts) / H);
            regMax(m.get(b) || (m.set(b, new Uint8Array(HLL_M)), m.get(b)), r.kregs);
        }
        let s = 0; for (const v of m.values()) s += hllEst(v); return s;
    };
    table(['family', 'n', 'with a query', 'distinct paths', 'distinct keys', 'hit share by path', 'by key: per worker-window', ...horizons.map((h) => 'by key: ' + h[0]), 'by key: whole harvest', 'rows with keys'],
        [...kt.values()].sort((x, y) => famOrder(x.fam) - famOrder(y.fam)).map((t) => {
            const dp = hllEst(t.regs), dk = hllEst(t.kregs);
            const cells = [keyBuckets(t.fam, 0), ...horizons.map((h) => keyBuckets(t.fam, h[1])), dk];
            return [t.fam, t.n, pct(t.qs, t.n), dp, dk, pct(Math.max(0, t.n - dp), t.n), ...cells.map((d) => pct(Math.max(0, t.n - d), t.n)), t.keyRows + '/' + t.rows];
        }));
}
if (!hasTs) say('  (time horizons need line timestamps; "per worker-window" is a floor for a ' + WIN_S + ' s shared cache.)');
h2('(4b) the most repeated paths per family (Space-Saving top-32 per worker window, merged: n between lo and hi)');
for (const fam of FAMS) {
    const P = new Map();
    const tables = flushes.map((f) => f.top.get(fam)).filter(Boolean);
    if (!tables.length) continue;
    for (const rows of tables) for (const [p, n, e] of rows) { const x = P.get(p) || { lo: 0, hi: 0, wins: 0 }; x.lo += n - e; x.hi += n; x.wins++; P.set(p, x); }
    for (const rows of tables) {                // a path absent from a FULL table may still have up to min(count) there
        if (rows.length < 32) continue;
        const mn = Math.min(...rows.map((r) => r[1])), have = new Set(rows.map((r) => r[0]));
        for (const [p, x] of P) if (!have.has(p)) x.hi += mn;
    }
    const famN = (famTot.get(fam) || { n: 0 }).n;
    const l = [...P.entries()].sort((x, y) => y[1].lo - x[1].lo || y[1].hi - x[1].hi).slice(0, Math.min(TOP, 10));
    say(''); say('  ' + fam + ' (n=' + fmt(famN) + ', ' + P.size + ' tracked paths)');
    table(['path', 'n lo', 'n hi', 'windows'], l.map(([p, x]) => [p, x.lo, x.hi, x.wins]));
}

// ---------------------------------------------------------------- (5) per-source action picture
h1('(5) per-source picture for a targeted action -- CANDIDATES for the owner, nothing is decided here');
say('  One row per declared name AND confidence: a list match and a mismatch with the loaded list may need different levers.');
say('  Columns: declared name | confidence (ver) | behaviour (requests, page types, peak rate) | network source (countries,');
say('  prefixes) -- separate facts; none of them alone identifies an operator.');
say('  robots token = the name the crawler documents; whether it OBEYS robots.txt is not measured by this data, and a');
say('  Disallow also stops a compliant crawler from fetching the 410 / 404 answer itself.');
const act = new Map();
for (const a of srcRows) {
    const lab = srcLabel(a.key[1], a.key[2]), k = lab + '|' + a.key[3];
    let e = act.get(k);
    if (!e) { e = { lab, d: a.key[1], tok: a.key[2], ver: a.key[3], n: 0, gone: 0, mm: 0, pmax: 0, cc: new Map(), pfx: new Map(), star: 0 }; act.set(k, e); }
    e.n += a.n; if (GONE_FAMS.has(a.key[0])) e.gone += a.n; else e.mm += a.n;
    e.pmax = Math.max(e.pmax, a.pmax); e.cc.set(a.key[5], (e.cc.get(a.key[5]) || 0) + a.n);
    if (a.key[6] === '*') e.star += a.n;
    else if (a.key[6] !== '-') { const p = e.pfx.get(a.key[6]) || { n: 0, pmax: 0 }; p.n += a.n; p.pmax = Math.max(p.pmax, a.pmax); e.pfx.set(a.key[6], p); }
}
const lever = (e) => {
    const emitted = [...e.pfx.values()].reduce((x, p) => x + p.n, 0);
    const rate = emitted >= 0.5 * e.n ? 'rate-rule candidate on its emitted prefixes' : 'diffuse: no prefix reached MIN_N in a worker window';
    if (ADS_CRAWLERS.has(e.d)) return 'ads crawler (Auto Ads live): leave as is';
    if (e.ver === 'x') return 'not inside the loaded list of the crawler it names (a mismatch, not proof of a false name; the list may be stale) -> confirm with a fresh list / reverse DNS before any rule; then ' + rate;
    const why = { v: '', np: ' (no list for this crawler: not checked)', u: ' (unverifiable source: not checked)', err: ' (snapshot unavailable: not checked)', na: '', '-': ' (mixed row)' };
    if (ROBOTS_TOKEN[e.d]) return 'robots.txt group "' + ROBOTS_TOKEN[e.d] + '"' + (why[e.ver] !== undefined ? why[e.ver] : '');
    if (e.d === 'known-seo-crawler') return (e.tok && e.tok !== '-' && e.tok !== 'rest' && e.tok !== 'overflow') ? 'robots.txt group for the product "' + e.tok + '"' : 'robots.txt per product (product not captured in this row)';
    if (e.d === 'known-social-bot') return 'link-preview fetchers (user-triggered): usually leave';
    if (e.d === 'other-bot' && e.tok && e.tok !== '-' && e.tok !== 'rest' && e.tok !== 'overflow') return 'robots.txt group "' + e.tok + '" if it honours robots, else ' + rate;
    return rate;
};
const actRows = [...act.values()].sort((x, y) => y.n - x.n);
table(['declared name', 'confidence', 'n', 'on 410/404 gates', 'on month/year', 'peak/min/worker', 'top countries', 'top prefixes (n, peak/min)', 'in "*"', 'lever candidate'],
    actRows.slice(0, TOP * 2).map((e) => [e.lab, conf(e.ver), e.n, e.gone, e.mm, e.pmax,
        [...e.cc.entries()].sort((x, y) => y[1] - x[1]).slice(0, 3).map(([k, n]) => k + ':' + n).join(' '),
        [...e.pfx.entries()].sort((x, y) => y[1].n - x[1].n).slice(0, 2).map(([k, p]) => k + ' (' + p.n + ', ' + p.pmax + ')').join(' ') || '-',
        pct(e.star, e.n), lever(e)]));
if (actRows.length > TOP * 2) say('  ... ' + (actRows.length - TOP * 2) + ' more source x verification groups, n=' + fmt(sum(actRows.slice(TOP * 2), (e) => e.n)));

// ---------------------------------------------------------------- (6) moon month / year
h1('(6) moon month / year traffic: city class x date class (for the year-range question)');
say('  date class of the page: ' + DATES.map((d) => d + ' = ' + DATE_TXT[d]).join('; '));
say('  At 7ad65ce the server serves only current-5 .. current+5 years (SUPPORTED_MOON_YEAR_BACK / _AHEAD = 5): pold and flate MIX');
say('  served far years (2xx) with out-of-range ones (4xx) -- read the outcome columns; the bands cannot split the +-5 window.');
for (const fam of ['moon-month', 'moon-year']) {
    const rows = [...CD.entries()].map(([k, n]) => [k.split('|'), n]).filter(([k]) => k[0] === fam);
    const N = sum(rows, (r) => r[1]);
    if (!N) { say(''); say('  ' + fam + ': no traffic in the input'); continue; }
    say(''); say('  ' + fam + ' (n=' + fmt(N) + ')');
    table(['date class', 'n', 'share', ...CITIES, ...OUTS.filter((o) => o !== 'gone')],
        DATES.map((d) => {
            const r = rows.filter(([k]) => k[2] === d);
            return [d, sum(r, (x) => x[1]), pct(sum(r, (x) => x[1]), N), ...CITIES.map((c) => sum(r.filter(([k]) => k[1] === c), (x) => x[1])),
                ...OUTS.filter((o) => o !== 'gone').map((o) => sum(r.filter(([k]) => k[3] === o), (x) => x[1]))];
        }).filter((r) => r[1] > 0));
    const far = sum(rows.filter(([k]) => k[2] === 'pold' || k[2] === 'flate'), (x) => x[1]);
    const farOk = sum(rows.filter(([k]) => (k[2] === 'pold' || k[2] === 'flate') && k[3] === '2xx'), (x) => x[1]);
    say('  far from today (pold + flate): ' + pct(far, N) + ' of ' + fam + ' requests (' + pct(farOk, N) + ' served 2xx, the rest outside the range or failed).');
    // years of the heavy-hitter paths (a lower bound: only paths that stayed in a top-32 table)
    const yrs = new Map();
    for (const f of flushes) for (const [p, n, e] of (f.top.get(fam) || [])) {
        const m = /\/(\d{4})(?:\/\d{2})?$/.exec(p); if (!m) continue;
        yrs.set(m[1], (yrs.get(m[1]) || 0) + (n - e));
    }
    if (yrs.size) say('  years of the top-32 paths (guaranteed counts, a lower bound): ' + [...yrs.entries()].sort((x, y) => x[0].localeCompare(y[0])).map(([y, n]) => y + ':' + n).join(' '));
}
if (YR.size) {
    h2('(6a) year offset of the page (its year minus the current UTC year; the server serves -5 .. +5) x outcome');
    const YO = ['<-5', '-5', '-4', '-3', '-2', '-1', '0', '+1', '+2', '+3', '+4', '+5', '>+5', 'rest'];
    const yrows = [...YR.entries()].map(([k, n]) => [k.split('|'), n]);
    for (const fam of ['moon-month', 'moon-year']) {
        const r = yrows.filter(([k]) => k[0] === fam);
        const N = sum(r, (x) => x[1]);
        if (!N) continue;
        say(''); say('  ' + fam + ' (n=' + fmt(N) + ')');
        table(['year offset', 'n', 'share', ...OUTS.filter((o) => o !== 'gone')],
            YO.map((y) => { const q = r.filter(([k]) => k[1] === y); return [y, sum(q, (x) => x[1]), pct(sum(q, (x) => x[1]), N), ...OUTS.filter((o) => o !== 'gone').map((o) => sum(q.filter(([k]) => k[2] === o), (x) => x[1]))]; })
                .filter((x) => x[1] > 0));
        const ag = [...new Set(r.map(([k]) => k[3] + '/' + k[4]))].sort((a, b) => sum(r.filter(([k]) => k[3] + '/' + k[4] === b), (x) => x[1]) - sum(r.filter(([k]) => k[3] + '/' + k[4] === a), (x) => x[1])).slice(0, 8);
        say('  by agent class / ver (top 8): requests per year offset');
        table(['year offset', ...ag], YO.map((y) => [y, ...ag.map((a) => sum(r.filter(([k]) => k[1] === y && k[3] + '/' + k[4] === a), (x) => x[1]))]).filter((x) => x.slice(1).some((v) => v > 0)));
    }
}
if (ML.size) {
    h2('(6b) from [moon-load] lines: month / year x date class x coarse agent class (not split by verification)');
    const agents = [...new Set([...ML.keys()].map((k) => k.split('|')[2]))].sort();
    for (const fam of ['moon-month', 'moon-year']) {
        const r = [...ML.entries()].filter(([k]) => k.startsWith(fam + '|'));
        if (!r.length) continue;
        say('  ' + fam);
        table(['date class', ...agents], DATES.map((d) => [d, ...agents.map((a) => sum(r.filter(([k]) => k.split('|')[1] === d && k.split('|')[2] === a), (x) => x[1]))]).filter((x) => x.slice(1).some((v) => v > 0)));
    }
}

// ---------------------------------------------------------------- limits
h1('limits of this data (state them in the owner report)');
[
    'Per-source distinct URLs merge across windows and workers (uurl, p=6: +-13%) only per family x declared x token x ver, and only for the top 100 groups of a window (the rest per family x declared); distinct IPs and UA strings stay per-window estimates (the IP hash is salted per process).',
    'The cache-key view assumes the edge keys on path + full query; a cache that ignores or sorts query parameters sits between the path and the key figures.',
    'Cluster per-minute peaks align windows by their flush time (5-minute slots); a window that straddles two slots is counted in one.',
    'A prefix below MIN_N (20) per worker window folds into "*" -- a source spread over many /24s, or split across workers, stays invisible as a prefix; a declared browser\'s row also needs MIN_N requests itself.',
    'Named classes (googlebot, gptbot, ...) are their own token; once a window\'s User-Agent cache is full (2,000), new User-Agents of the grouping classes are counted under "overflow" (meta.ua_ovf).',
    'Whether a crawler fetches or obeys robots.txt is not observed (/robots.txt requests are not recorded).',
    'Year offsets are exact per page year; the date classes (in / p1y / pold / f1y / flate) remain relative bands.',
    'Latency is wall time from the close listener, not CPU; avg_ms is rounded per row.',
    'Confidence (ver) is a check of a claim against the loaded list of the crawler the User-Agent names: "x" is a mismatch with that list, not proof that the name is false (lists go stale or are incomplete; crawlers can use unpublished addresses); "u", "np" and "err" rows were not checked at all.',
    'A declared name is a claim, and different declared names do not show different operators (one operator can send several names; several operators can send one name). Declared name, behaviour, network source and confidence are separate facts.',
    'The request-header class of a declared browser (full / partial / bare) describes the request headers only; it says nothing certain about who or what sent the request.',
    'Only the snapshot date reaches the logs; the date and source of each list come from the snapshot file itself (--ranges).',
].forEach((s) => say('  - ' + s));

console.log(out.join('\n'));

if (JSON_OUT) {
    const J = {
        coverage: { ...Q, status: Q.status.map((s) => ({ w: s.w, what: s.what, kv: s.kv, ts: s.ts })), flushes: flushes.length, workers, windowS: [...windowS], until: [...untils], ranges: [...rangesSeen], metaTotal, totalSrcN, totalFamN, hasTs },
        families: famList.map((t) => ({ family: t.fam, n: t.n, outcomes: t.out, get: t.get, head: t.head, other: t.other, avg_ms: +(t.msTot / Math.max(1, t.n)).toFixed(2), p50: quant(t.b, 0.5), p95: quant(t.b, 0.95), max_ms: t.msMax, distinct_urls: hllEst(t.regs) })),
        family_outcomes: famRowsSorted.map((a) => ({ family: a.fam, outcome: a.out, n: a.n, distinct_urls: hllEst(a.regs), per_window_distinct_sum: a.winEstSum })),
        sources: decl.map((e) => ({ source: e.lab, declared: e.d, token: e.tok, n: e.n, ver: e.ver, bcls: e.bcls, families: e.fams, countries: Object.fromEntries(e.cc), prefixes: Object.fromEntries(e.pfx), star: e.star, peak_per_min_worker: e.pmax })),
        actions: actRows.map((e) => ({ source: e.lab, ver: e.ver, confidence: conf(e.ver), n: e.n, gone: e.gone, month_year: e.mm, peak_per_min_worker: e.pmax, prefixes: Object.fromEntries(e.pfx), star: e.star, lever: lever(e) })),
        windows: winRows,
        ver_meaning: Object.fromEntries(VERS.map((v) => [v, { confidence: VER_INFO[v][0], meaning: VER_INFO[v][1] }])),
        ranges_snapshot: rangesInfo,
        src_rows: srcRows.map((a) => ({ key: a.key, n: a.n, outcomes: Object.fromEntries(OUTS.map((o, i) => [o, a.out[i]])), urls: [a.urlsMax, a.urlsSum], ips: [a.ipsMax, a.ipsSum], peak_per_min: a.pmax, lb: a.lb, windows: a.wins })),
        tokens: tok.map((t) => ({ declared: t.d, token: t.tok, n: t.n, ua_strings: [t.uaMax, t.uaSum], samples: [...t.samples] })),
        rate: [...rateByFam.values()].map((e) => ({ family: e.fam, n: e.n, active_worker_minutes: e.act, peak_worker_minute: e.peakW })),
        city_date: [...CD.entries()].map(([k, n]) => { const p = k.split('|'); return { family: p[0], city: p[1], date: p[2], outcome: p[3], n }; }),
        moon_load_agent_date: [...ML.entries()].map(([k, n]) => { const p = k.split('|'); return { family: p[0], date: p[1], agent: p[2], outcome: p[3], n }; }),
        source_urls: [...UURL.values()].map((a) => ({ family: a.key[0], declared: a.key[1], token: a.key[2], ver: a.key[3], n: a.n, distinct_urls: hllEst(a.regs), windows: a.wins })),
        cache_keys: famRowsAll.filter((a) => a.keyRows > 0).map((a) => ({ family: a.fam, outcome: a.out, n: a.n, with_query: a.qs, distinct_paths: hllEst(a.regs), distinct_keys: hllEst(a.kregs) })),
        year_offsets: [...YR.entries()].map(([k, n]) => { const p = k.split('|'); return { family: p[0], year_off: p[1], outcome: p[2], agent: p[3], ver: p[4], n }; }),
        processes: boots,
    };
    fs.writeFileSync(JSON_OUT, JSON.stringify(J, null, 1));
    console.log('\nwrote ' + JSON_OUT);
}
