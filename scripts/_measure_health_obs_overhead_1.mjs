// HEALTH-OBSERVABILITY-1 -- cost of the [health-obs] counters (127.0.0.1 only; never production). Run it only when the machine
//   is free (no other measurement running): it drives real servers.
//
//   [M] micro, in process: the worker half (extracted from server.js, against stubs) -- ns of CPU per request for the
//       'request' + 'close' pair (a /health on a new connection, a page on a new connection, a page on a reused one,
//       an aborted page) and per connection; the primary's /proc/net/tcp parser on synthetic files of 200 / 2,000 /
//       10,000 sockets (the 10 s sample); the time of one flush.
//   [AB] servers, order A B B A (A = TP_HEALTH_OBS=off, B = on with the 15 s self-probe), TP_AB_ROUNDS rounds (default 2,
//       i.e. 8 runs): a fresh 2-worker server per run, pinned to the same logical CPUs (TP_AB_AFFINITY, default 3 CPUs),
//       BelowNormal priority; the SAME open-loop load every run (seeded): TP_AB_RATE r/s (default 15) for TP_AB_SECS s
//       (default 60) of prayer-city / prayer-country / quran-surah pages (60/25/15, br+gzip, a new connection per request,
//       20 % aborted by the client after 20-300 ms) + one /health a second on a new connection -> per run: worker and
//       primary CPU ms per completed page (process CPU time, Windows: 15.6 ms ticks), worker / primary working set at the
//       end and peak, client p50 / p95 / p99 of completed pages and of /health, completed / aborted / failed counts.
//       Summary: per arm median over runs, B - A with the spread between runs of the same arm.
// Usage: node scripts/_measure_health_obs_overhead_1.mjs [--micro] [--ab]   (no flag = both)
//        env TP_GUARD, TP_URLS (a urls.json with city / country / quran lists), TP_AB_ROUNDS, TP_AB_RATE, TP_AB_SECS,
//        TP_AB_AFFINITY (hex mask, default 0x700 = CPUs 8-10), TP_MEASURE_PORT (default 8780), TP_OUT (json)
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { EventEmitter } from 'node:events';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const URLS_FILE = process.env.TP_URLS || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/health-restart-1/urls.json';
const ROUNDS = Number(process.env.TP_AB_ROUNDS || 2), RATE = Number(process.env.TP_AB_RATE || 15), SECS = Number(process.env.TP_AB_SECS || 60);
const AFF = String(process.env.TP_AB_AFFINITY || '0x700');
const PORT = Number(process.env.TP_MEASURE_PORT || 8780);
const OUT = process.env.TP_OUT || '';
const args = new Set(process.argv.slice(2));
const ALL = !args.has('--micro') && !args.has('--ab');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor((s.length - 1) / 2)] : null; };
const pct = (a, p) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const r2 = (x) => x === null ? null : Math.round(x * 100) / 100;
const result = { when: new Date().toISOString(), node: process.version, cpus: os.cpus().length };
const SRC = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const between = (a, b) => { const i = SRC.indexOf(a); const j = SRC.indexOf(b, i); if (i < 0 || j < 0) throw new Error('marker missing: ' + a); return SRC.slice(i, j); };

// ============================================== [M] micro ==============================================
if (ALL || args.has('--micro')) {
    console.log('-- [M] micro --');
    const src = between('const _HO_ON = (() => {', 'function _hoStart() {');
    const stub = { _obsFamily: (p) => p.startsWith('/prayer-times-in-') ? 'prayer-city' : null, _OBS_404_UNKNOWN_FAMILIES: new Set(), TP_WORKER_ID: 1,
        server: { getConnections: (cb) => cb(null, 1) }, console: { log: () => {} } };
    const api = new Function('stub', 'const { _obsFamily, _OBS_404_UNKNOWN_FAMILIES, TP_WORKER_ID, server, console } = stub;\n' + src
        + '\n_hoStarted = true; _ho = _hoNew(0);\nreturn { _hoOnConn, _hoOnRequest, _hoMark, _hoFlush, get ho() { return _ho; } };')(stub);
    class Sock extends EventEmitter { constructor() { super(); this.destroyed = false; } }
    const mkRes = (req) => { const r = new EventEmitter(); r.req = req; r.writableFinished = true; r.headersSent = true; r.statusCode = 200; return r; };
    // the same objects without the counters: the baseline cost of creating them and emitting 'close' (subtracted)
    const scen = {
        healthNew: (on) => { const s = new Sock(); if (on) api._hoOnConn(s); const q = { url: '/health', socket: s, headers: {} }; const r = mkRes(q); if (on) api._hoOnRequest(q, r); r.emit('close'); s.emit('close'); },
        pageNew: (on) => { const s = new Sock(); if (on) api._hoOnConn(s); const q = { url: '/prayer-times-in-riyadh', socket: s, headers: {} }; const r = mkRes(q); if (on) { api._hoOnRequest(q, r); api._hoMark(q, r); } r.emit('close'); s.emit('close'); },
        pageReused: (on, s) => { const q = { url: '/prayer-times-in-riyadh', socket: s, headers: {} }; const r = mkRes(q); if (on) { api._hoOnRequest(q, r); api._hoMark(q, r); } r.emit('close'); },
        pageAborted: (on) => { const s = new Sock(); if (on) api._hoOnConn(s); const q = { url: '/prayer-times-in-riyadh?x=1', socket: s, headers: {} }; const r = mkRes(q); r.writableFinished = false; r.headersSent = false; if (on) { api._hoOnRequest(q, r); api._hoMark(q, r); } r.emit('close'); s.emit('close'); },
    };
    const N = 200000;
    const time = (fn) => { const c0 = process.cpuUsage(); fn(); const c = process.cpuUsage(c0); return (c.user + c.system) * 1000 / N; };   // ns per op
    const micro = {};
    for (const [name, f] of Object.entries(scen)) {
        const shared = new Sock(); if (name === 'pageReused') { api._hoOnConn(shared); f(true, shared); }   // its first request done: the rest are reuses
        const runs = { on: [], off: [] };
        for (let rep = 0; rep < 7; rep++) for (const on of (rep % 2 ? [true, false] : [false, true])) {
            runs[on ? 'on' : 'off'].push(time(() => { for (let i = 0; i < N; i++) f(on, shared); }));
            if (on) api._hoFlush('w');
        }
        micro[name] = { on_ns: Math.round(med(runs.on)), off_ns: Math.round(med(runs.off)), added_ns: Math.round(med(runs.on) - med(runs.off)) };
        console.log('  ' + name + ': ' + JSON.stringify(micro[name]));
    }
    // the primary's tcp parser on synthetic /proc/net/tcp files
    const psrc = between('const tpHoParseTcp = (', '// end tpHoParse');
    const { tpHoParseTcp } = new Function(psrc + '; return { tpHoParseTcp };')();
    const mkTcp = (n) => {
        let t = '  sl  local_address rem_address   st tx_queue rx_queue tr tm->when retrnsmt   uid  timeout inode\n   0: 00000000:2710 00000000:0000 0A 000001FF:00000000 00:00000000 00000000  1000        0 1 1 0 100 0 0 10 0\n';
        for (let i = 1; i < n; i++) t += '  ' + i + ': 0A00000B:' + (i % 3 ? '2710' : 'C350') + ' 0B0A0A0A:' + (40000 + i).toString(16).toUpperCase() + ' 0' + (1 + (i % 9)) + ' 00000000:00000000 00:00000000 00000000  1000        0 ' + i + ' 1 0 20 4 30 10 -1\n';
        return t;
    };
    micro.tcpParse = {};
    for (const n of [200, 2000, 10000]) {
        const t = mkTcp(n); const ts = [];
        for (let rep = 0; rep < 21; rep++) { const a = performance.now(); tpHoParseTcp(t, '2710', { lq: 0, bl: null, est: 0, syn: 0, cw: 0, tw: 0, oth: 0 }); ts.push(performance.now() - a); }
        micro.tcpParse[n] = { ms_median: r2(med(ts)), ms_max: r2(Math.max(...ts)), bytes: t.length };
    }
    console.log('  tcpParse: ' + JSON.stringify(micro.tcpParse));
    // one flush with a busy window (60 families of aborts, 30 slots)
    for (let i = 0; i < 2000; i++) scen.pageAborted(true);
    const fl = []; for (let rep = 0; rep < 51; rep++) { for (let i = 0; i < 100; i++) scen.pageAborted(true); scen.healthNew(true); const a = performance.now(); api._hoFlush('w'); fl.push(performance.now() - a); }
    micro.flush_ms = { median: r2(med(fl)), max: r2(Math.max(...fl)) };
    console.log('  flush: ' + JSON.stringify(micro.flush_ms));
    result.micro = micro;
}

// ============================================== [AB] servers ==============================================
function psJson(cmd) { return JSON.parse(execFileSync('powershell', ['-NoProfile', '-Command', cmd], { encoding: 'utf8' }) || 'null'); }
function procTree(pid) {
    // the primary and its node children: CPU ms, working set and peak working set (MB)
    const rows = psJson('$p=@(Get-Process -Id ' + pid + ' -ErrorAction SilentlyContinue) + @(Get-CimInstance Win32_Process -Filter "ParentProcessId=' + pid + ' AND Name=\'node.exe\'" | ForEach-Object { Get-Process -Id $_.ProcessId -ErrorAction SilentlyContinue });'
        + ' @($p | Where-Object { $_ } | ForEach-Object { [pscustomobject]@{ id=$_.Id; cpu=[math]::Round($_.TotalProcessorTime.TotalMilliseconds); ws=[math]::Round($_.WorkingSet64/1MB,1); peak=[math]::Round($_.PeakWorkingSet64/1MB,1) } }) | ConvertTo-Json -Compress');
    const a = Array.isArray(rows) ? rows : (rows ? [rows] : []);
    return { primary: a.find((x) => x.id === pid) || null, workers: a.filter((x) => x.id !== pid) };
}
const rawGet = (p, { h = {}, abortMs = null, timeout = 30000 } = {}) => new Promise((res) => {
    const t = performance.now(); let done = false;
    const fin = (kind, st) => { if (done) return; done = true; res({ kind, st, ms: performance.now() - t }); };
    const r = http.request({ host: '127.0.0.1', port: PORT, path: p, headers: { Connection: 'close', ...h }, agent: false }, (x) => {
        x.on('data', () => {}); x.on('end', () => fin('ok', x.statusCode)); x.on('error', () => fin('err'));
    });
    r.setTimeout(timeout, () => { r.destroy(); fin('timeout'); });
    r.on('error', (e) => fin(abortMs !== null && done === false && r.__ab ? 'aborted' : 'err', e.code));
    if (abortMs !== null) setTimeout(() => { if (!done) { r.__ab = true; r.destroy(); fin('aborted'); } }, abortMs);
    r.end();
});
async function boot(extra) {
    const env = { ...process.env };
    for (const k of Object.keys(env)) if (/^(TP_|NODE_OPTIONS$|GA_MEASUREMENT_ID$|SUPABASE_|LOCATIONIQ_KEY$|DISCOVERED_SSR_TEST_FIXTURE$|RENDER$|RENDER_)/.test(k)) delete env[k];
    Object.assign(env, { PORT: String(PORT), WEB_CONCURRENCY: '2', ADSENSE_CLIENT: 'off', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', NODE_ENV: 'production',
        GUARD_OUT: path.join(os.tmpdir(), 'tp-ho-guard.log') }, extra);
    if ((await rawGet('/health', { timeout: 1500 })).kind === 'ok') throw new Error('port ' + PORT + ' busy');
    const k = spawn(process.execPath, ['-r', GUARD, 'server.js'], { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'] });
    const lines = []; let buf = '';
    const take = (d) => { buf += d.toString('utf8'); let i; while ((i = buf.indexOf('\n')) !== -1) { lines.push(buf.slice(0, i).replace(/\r$/, '')); buf = buf.slice(i + 1); } };
    k.stdout.on('data', take); k.stderr.on('data', take);
    // pin + lower the priority of the primary at once (its workers inherit both)
    execFileSync('powershell', ['-NoProfile', '-Command', '$p=Get-Process -Id ' + k.pid + '; $p.ProcessorAffinity=[IntPtr]' + AFF + '; $p.PriorityClass="BelowNormal"']);
    for (let i = 0; i < 300; i++) { if ((await rawGet('/health', { timeout: 2000 })).kind === 'ok') break; await sleep(300); }
    for (let i = 0; i < 100; i++) { if (lines.filter((l) => /^Server running/.test(l)).length >= 2) break; await sleep(200); }
    return { k, lines };
}
const kill = (k) => { try { execFileSync('taskkill', ['/PID', String(k.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} };
// a seeded generator: every run sends exactly the same sequence at the same times
function lcg(seed) { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
async function runLoad() {
    const U = JSON.parse(fs.readFileSync(URLS_FILE, 'utf8'));
    const rnd = lcg(20261115);
    const plan = [];
    for (let i = 0; i < RATE * SECS; i++) {
        const r = rnd(); const list = r < 0.6 ? U.city : r < 0.85 ? U.country : U.quran;
        const p = list[Math.floor(rnd() * list.length)];
        const ab = rnd() < 0.2 ? 20 + Math.floor(rnd() * 280) : null;
        plan.push({ at: (i / RATE) * 1000, p, ab });
    }
    const t0 = performance.now(); const res = []; const hres = []; const ps = [];
    let hNext = 0, i = 0;
    while (i < plan.length || hNext < SECS * 1000) {
        const now = performance.now() - t0;
        while (i < plan.length && plan[i].at <= now) { const q = plan[i++]; ps.push(rawGet(q.p, { h: { 'Accept-Encoding': 'br, gzip' }, abortMs: q.ab }).then((x) => res.push(x))); }
        if (hNext <= now && hNext < SECS * 1000) { hNext += 1000; ps.push(rawGet('/health', { timeout: 5000 }).then((x) => hres.push(x))); }
        await sleep(2);
    }
    await Promise.all(ps);
    const okMs = res.filter((x) => x.kind === 'ok' && x.st === 200).map((x) => x.ms), hMs = hres.filter((x) => x.kind === 'ok').map((x) => x.ms);
    return { sent: plan.length, ok: okMs.length, aborted: res.filter((x) => x.kind === 'aborted').length, failed: res.filter((x) => x.kind !== 'ok' && x.kind !== 'aborted').length + res.filter((x) => x.kind === 'ok' && x.st !== 200).length,
        p50: r2(pct(okMs, 0.5)), p95: r2(pct(okMs, 0.95)), p99: r2(pct(okMs, 0.99)), h_n: hres.length, h_fail: hres.filter((x) => x.kind !== 'ok').length, h_p50: r2(pct(hMs, 0.5)), h_p99: r2(pct(hMs, 0.99)), h_max: r2(hMs.length ? Math.max(...hMs) : null) };
}
if (ALL || args.has('--ab')) {
    console.log('-- [AB] servers: ' + ROUNDS + ' x A B B A, ' + RATE + ' r/s x ' + SECS + ' s --');
    const ARMS = { A: { TP_HEALTH_OBS: 'off' }, B: { TP_HEALTH_OBS: 'on', TP_HEALTH_OBS_PROBE_S: '15' } };
    const runs = [];
    const machineLoad = () => { try { return Number(execFileSync('powershell', ['-NoProfile', '-Command', '(Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average'], { encoding: 'utf8' }).trim()); } catch (_e) { return null; } };
    for (let r = 0; r < ROUNDS; r++) for (const arm of ['A', 'B', 'B', 'A']) {
        const load0 = machineLoad();
        const s = await boot(ARMS[arm]);
        await sleep(5000);                                                    // let the boot settle
        const before = procTree(s.k.pid);
        const load = await runLoad();
        await sleep(2000);
        const after = procTree(s.k.pid);
        kill(s.k);
        await sleep(3000);
        const wCpu = after.workers.reduce((x, w) => x + w.cpu, 0) - before.workers.reduce((x, w) => x + (after.workers.find((v) => v.id === w.id) ? w.cpu : 0), 0);
        const pCpu = after.primary.cpu - before.primary.cpu;
        const row = { arm, round: r, machine_load_before_pct: load0, ...load, w_cpu_ms: wCpu, p_cpu_ms: pCpu, w_cpu_per_ok_ms: r2(wCpu / Math.max(1, load.ok)),
            w_ws_mb: r2(after.workers.reduce((x, w) => x + w.ws, 0)), w_peak_mb: r2(after.workers.reduce((x, w) => x + w.peak, 0)), p_ws_mb: after.primary.ws, p_peak_mb: after.primary.peak,
            ho_lines: s.lines.filter((l) => l.startsWith('[health-obs] {')).length };
        runs.push(row);
        console.log('  ' + JSON.stringify(row));
    }
    const arm = (a, k) => runs.filter((x) => x.arm === a).map((x) => x[k]);
    const summ = {};
    for (const k of ['w_cpu_per_ok_ms', 'w_cpu_ms', 'p_cpu_ms', 'w_ws_mb', 'w_peak_mb', 'p_ws_mb', 'p_peak_mb', 'p50', 'p95', 'p99', 'h_p50', 'h_p99', 'ok', 'aborted', 'failed', 'h_fail']) {
        const A = arm('A', k), B = arm('B', k);
        summ[k] = { A_med: r2(med(A)), B_med: r2(med(B)), B_minus_A: r2(med(B) - med(A)), A_range: [r2(Math.min(...A)), r2(Math.max(...A))], B_range: [r2(Math.min(...B)), r2(Math.max(...B))] };
    }
    console.log('  summary: ' + JSON.stringify(summ, null, 1));
    result.ab = { rounds: ROUNDS, rate: RATE, secs: SECS, affinity: AFF, runs, summary: summ };
}
if (OUT) fs.writeFileSync(OUT, JSON.stringify(result, null, 1));
