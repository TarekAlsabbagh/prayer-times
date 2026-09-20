// NODE-CLUSTER-PRIMARY-RESPAWN-1 — smoke suite (functional only, not a benchmark; local servers only; never touches production
// or any external API: a test-only preload blocks every non-loopback socket, fetch and DNS lookup and reports each attempt).
//
// server.js primary (top of the file) respawns a dead worker with setTimeout(tpSpawn, delay). Before this ticket that timer was
// unref'd, so when the dead worker was the primary's LAST handle (WEB_CONCURRENCY=1, or every worker dead at once) the primary
// exited with code 0 before the respawn ran, and the service was gone.
//
//   [A]   1 worker, normal startup: primary logs "forking 1 worker(s)", exactly 1 fork, it listens on PORT, /health 200,
//         and a 2 s steady window with 0 exits / 0 "died" lines / no fail-fast / no no-live-workers line
//   [B]   same for 2 workers (2 forks, 2 distinct pids, both listening on PORT)
//   [H2]  no worker restart after shutdown started: SIGTERM with a 200 ms respawn PENDING and one worker STILL LIVE ->
//         the drain path (not the no-live shortcut) runs, the survivor exits "during shutdown", 0 forks after SIGTERM
//   [I]   health recovery seconds are asserted and reported for every respawn scenario (S1, S2, S2b)
//   [S1]  1 worker: SIGKILL the worker → primary stays alive, logs the death, forks a NEW worker, /health 200 again
//   [S2]  2 workers: SIGKILL one → /health probed every 100 ms answers 200 throughout, the dead worker is replaced, 2 live again
//   [S2b] 2 workers: SIGKILL both in the same tick → primary stays alive, both replaced, /health 200 again (outage measured)
//   [S3a] SIGTERM (emulated inside the primary) with 2 live workers → draining logged, no respawn, all workers exit, exit 0 < 15 s
//         (exit code / fork count / timing asserted; which "primary exiting" line appears depends on the platform event order)
//   [S3b] race: kill the only worker and emit SIGTERM right after the respawn timer (200 ms) was scheduled → 0 workers left, so
//         the primary logs "[cluster] no live workers; primary exiting" and exits 0 IMMEDIATELY (not when the timer fires), 0 forks
//   [S3c] same race at maximum backoff (respawn_in_ms=5000 pending; runs at the end of the S4 group on the S4 server)
//   [S4]  8 kills, each as soon as the replacement is online → respawn_in_ms 200,200,1000,1000,1000,5000,5000,5000, actual
//         exit→fork delays honour them, bounded fork rate, primary alive, the last replacement serves /health 200; 7 of the
//         deaths happen before that replacement listened, yet an EARLIER worker was ready, so the fail-fast never triggers
//   [S4d] a worker was ready, then every replacement crashes at boot (test-only flag file) for 8 deaths (7 boot crashes > the
//         fail-fast threshold of 6), 1 and 2 workers → primary never exits, backoff escalates, recovers once the flag is removed
//   [S4c] crash at boot from the first worker (test-only env: every worker process.exit(1)s from the preload), 1 and 2 workers →
//         no worker ever ready, so after 6 deaths the primary logs "[cluster] 6 workers died before any became ready; primary
//         exiting code=1" and exits 1 in bounded time (1 worker: exactly 6 forks), nothing ever listens
//   [S5]  normal operation, 2 workers on TEST and BASE, no deaths: 0 exit events, 0 respawn lines, boot logs identical after
//         normalising pids / ports / ms timings, ~50 paths × 2 encodings identical (status, headers, decoded body; only the CSP
//         nonce, the &b= build stamp and ISO-8601 timestamps are normalised)
//   [N1] [N2] [N4c]  negative controls on TP_BASE_ROOT: they PASS only when BASE reproduces the defect (the primary exits)
//   [H]   harness: ports free before, every process tree killed and every port free at the end, outbound attempts reported
//
// Windows limits (see the report): a real SIGTERM cannot be delivered to a Node process (process.kill(pid,'SIGTERM') is
//   TerminateProcess and no handler runs), so it is emulated INSIDE the primary with process.emit('SIGTERM','SIGTERM') on a
//   trigger file. The primary's own worker.process.kill('SIGTERM') is also TerminateProcess, so the worker-side graceful drain
//   (server.close, 10 s) is NOT exercised. An external SIGKILL reaches the primary as code=1 signal=none (Linux: signal=SIGKILL).
//
// Usage:  TP_BASE_ROOT=<clean base checkout> node scripts/_smoke_node_cluster_primary_respawn_1.mjs
// Env:    TP_TEST_ROOT          tree under test (default: this script's repo); point it at BASE for a negative-control run
//         TP_BASE_ROOT          clean base checkout for [N*] and [S5] (required: missing → FAIL, never skipped)
//         TP_RESPAWN_PORT_BASE  first of 10 consecutive local ports (default 9220)
//         TP_RESPAWN_CRASH_S    [S4c] maximum wait in seconds for the crash-at-boot primary to exit (default 60)
//         TP_RESPAWN_ONLY       comma list of groups: S0,S1,S2,S3,S4,S4d,S4c,S6,S5 (default all; each N* runs with its group,
//                               S3c with S4; S0 = [A]+[B] startup, S6 = [H2] no restart after shutdown started)
//         TP_RESPAWN_OUT        artefact directory (default <os tmp>/tp-respawn-smoke-<pid>)
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import net from 'node:net';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEST_ROOT = path.resolve(process.env.TP_TEST_ROOT || REPO);
const BASE_ROOT = process.env.TP_BASE_ROOT ? path.resolve(process.env.TP_BASE_ROOT) : '';
const PORT_BASE = Number(process.env.TP_RESPAWN_PORT_BASE || 9220);
const CRASH_S = Number(process.env.TP_RESPAWN_CRASH_S || 60);
const ONLY = new Set(String(process.env.TP_RESPAWN_ONLY || 'S0,S1,S2,S3,S4,S4d,S4c,S6,S5').split(',').map((s) => s.trim()).filter(Boolean));
const TP_MAX_BOOT_DEATHS = 6;                                               // server.js fail-fast threshold (no worker ever ready)
const OUT = path.resolve(process.env.TP_RESPAWN_OUT || path.join(os.tmpdir(), 'tp-respawn-smoke-' + process.pid));
const SITE = 'https://timesprayers.com';
// Owner rule: load an outbound-blocking preload in EVERY server started. The suite's own PRELOAD_SRC already blocks and counts
//   non-loopback sockets / fetch / DNS; TP_RESPAWN_GUARD additionally chains the FROZEN harness guard.cjs in front of it, on
//   TEST and BASE alike (identical execArgv on both sides, so the [S5] parity comparison stays fair).
const GUARD = process.env.TP_RESPAWN_GUARD ? require('node:path').resolve(process.env.TP_RESPAWN_GUARD) : '';
const UA = 'tp-node-cluster-primary-respawn-smoke/1 (local)';
const P = (i) => PORT_BASE + i;
const EXPECTED_DELAYS = [200, 200, 1000, 1000, 1000, 5000, 5000, 5000];   // server.js backoff for restarts 1..8 in 60 s
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const t0 = Date.now();

// ── reporting ────────────────────────────────────────────────────────────────────────────────────────────────────
let pass = 0, fail = 0; const fails = []; const stats = {};
const RECOVERY = [];                                    // owner item I: kill -> /health 200 again, per scenario
const RECOVERY_MAX_MS = 60000;                          // generous ceiling: this is a correctness gate, not a benchmark
function recovery(label, what, ms, note) {
    RECOVERY.push({ label, what, ms, note: note || '' });
    ok(label, ms !== null && ms >= 0 && ms < RECOVERY_MAX_MS, 'health recovery: ' + what + ' in ' + (ms === null ? 'NEVER' : (ms / 1000).toFixed(2) + ' s')
        + ' (< ' + (RECOVERY_MAX_MS / 1000) + ' s)', (ms === null ? 'no recovery' : ms + ' ms') + (note ? ' :: ' + note : ''));
}
function ok(label, cond, name, detail) {
    const n = '[' + label + '] ' + name;
    const s = (stats[label] ||= { pass: 0, fail: 0 });
    const d = detail === undefined || detail === null ? '' : String(detail).slice(0, 900);
    if (cond) { pass++; s.pass++; console.log('  ✓ ' + n + (d ? '  :: ' + d : '')); }
    else { fail++; s.fail++; fails.push(n + (d ? ' :: ' + d : '')); console.log('  ✗ ' + n + (d ? '  :: ' + d : '')); }
}
const info = (s) => console.log('  · MEASURED ' + s);
const section = (s) => console.log('\n-- ' + s + ' --  (+' + Math.round((Date.now() - t0) / 1000) + ' s)');

// ── test-only preload (written per server; its path in the command line identifies that server's processes) ───────
// NODE-CLUSTER-PRIMARY-RESPAWN-1: observational only in the primary (cluster event listeners hold no handle, the trigger
//   poll is unref'd, writes are synchronous), so it cannot keep a primary alive; the BASE negative controls prove that.
const PRELOAD_SRC = String.raw`'use strict';
// NODE-CLUSTER-PRIMARY-RESPAWN-1: TEST-ONLY preload written by scripts/_smoke_node_cluster_primary_respawn_1.mjs.
const fs = require('fs');
const cluster = require('cluster');
const net = require('net');
const dns = require('dns');
const EV = process.env.TP_RESPAWN_SMOKE_EVENTS || '';
const TRIG = process.env.TP_RESPAWN_SMOKE_TRIGGER || '';
const ROLE = cluster.isPrimary ? 'primary' : 'worker';
function ev(o) { if (!EV) return; try { fs.appendFileSync(EV, JSON.stringify(Object.assign({ t: Date.now(), pid: process.pid, role: ROLE }, o)) + '\n'); } catch (_) {} }

// outbound guard: loopback only
function isLoop(h) {
    if (h === undefined || h === null || h === '') return true;
    let s = String(h).trim().toLowerCase();
    if (s.startsWith('[') && s.endsWith(']')) s = s.slice(1, -1);
    return s === 'localhost' || s.endsWith('.localhost') || s === '::1' || s === '::' || s === '0.0.0.0'
        || /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(s) || /^::ffff:127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(s);
}
function blocked(kind, host, port) {
    ev({ e: 'outbound-blocked', kind: kind, host: String(host), port: port === undefined ? null : port });
    try { process.stderr.write('[respawn-smoke-guard] BLOCKED ' + kind + ' ' + host + '\n'); } catch (_) {}
    const err = new Error('TP_RESPAWN_SMOKE outbound guard blocked ' + kind + ' to ' + host);
    err.code = kind === 'dns' ? 'ENOTFOUND' : 'ECONNREFUSED';
    return err;
}
const origConnect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function guardedConnect(...args) {
    let o = null; const a0 = args[0];
    if (Array.isArray(a0)) o = a0[0];
    else if (a0 !== null && typeof a0 === 'object') o = a0;
    else if (typeof a0 === 'string' && !/^\d+$/.test(a0)) o = { path: a0 };
    else o = { port: a0, host: typeof args[1] === 'string' ? args[1] : undefined };
    if (o && !o.path && !isLoop(o.host)) {
        const e = blocked('socket', o.host, o.port);
        process.nextTick(() => { try { this.destroy(e); } catch (_) {} });
        return this;
    }
    return origConnect.apply(this, args);
};
if (typeof globalThis.fetch === 'function') {
    const origFetch = globalThis.fetch;
    globalThis.fetch = function fetch(input, init) {
        let h = null;
        try { h = new URL(typeof input === 'string' ? input : (input && input.url) ? input.url : String(input)).hostname; } catch (_) { h = null; }
        if (h !== null && !isLoop(h)) { const te = new TypeError('fetch failed'); te.cause = blocked('fetch', h); return Promise.reject(te); }
        return origFetch.call(this, input, init);
    };
}
for (const n of ['lookup', 'resolve', 'resolve4', 'resolve6', 'resolveAny', 'resolveCname', 'resolveMx', 'resolveNs', 'resolveSrv', 'resolveTxt']) {
    const cbFn = dns[n];
    if (typeof cbFn === 'function') dns[n] = function (h, ...rest) {
        if (!isLoop(h)) { const cb = rest[rest.length - 1]; const e = blocked('dns', h); if (typeof cb === 'function') process.nextTick(cb, e); return undefined; }
        return cbFn.call(this, h, ...rest);
    };
    const pFn = dns.promises && dns.promises[n];
    if (typeof pFn === 'function') dns.promises[n] = function (h, ...rest) {
        if (!isLoop(h)) return Promise.reject(blocked('dns', h));
        return pFn.call(this, h, ...rest);
    };
}

if (cluster.isPrimary) {
    const count = () => Object.keys(cluster.workers || {}).length;
    const refTimeouts = () => process.getActiveResourcesInfo().filter((r) => r === 'Timeout').length;
    ev({ e: 'primary-start', execArgv: process.execArgv });
    cluster.on('fork', (w) => ev({ e: 'fork', id: w.id, wpid: w.process.pid, workers: count() }));
    cluster.on('online', (w) => ev({ e: 'online', id: w.id, wpid: w.process.pid }));
    cluster.on('listening', (w, a) => ev({ e: 'listening', id: w.id, wpid: w.process.pid, port: a && a.port }));
    cluster.on('disconnect', (w) => ev({ e: 'disconnect', id: w.id, wpid: w.process.pid }));
    cluster.on('exit', (w, code, signal) => {
        ev({ e: 'exit', id: w.id, wpid: w.process.pid, code: code, signal: signal, workers: count() });
        // runs after server.js's own 'exit' listener: counts the REF'D timers now pending (the respawn timer iff not unref'd)
        setImmediate(() => ev({ e: 'after-exit', id: w.id, refTimeouts: refTimeouts(), workers: count() }));
    });
    process.on('exit', (code) => ev({ e: 'primary-exit', code: code, workers: count() }));
    const emitTerm = (why) => { ev({ e: 'emit-sigterm', why: why, workers: count(), refTimeouts: refTimeouts() }); process.emit('SIGTERM', 'SIGTERM'); };
    if (TRIG) {
        setInterval(() => {
            let cmd = '';
            try { cmd = fs.readFileSync(TRIG, 'utf8').trim(); } catch (_) { return; }
            try { fs.unlinkSync(TRIG); } catch (_) {}
            ev({ e: 'trigger', cmd: cmd });
            if (cmd === 'sigterm') emitTerm('trigger');
            else if (cmd === 'kill-one-then-sigterm') {
                // NODE-CLUSTER-PRIMARY-RESPAWN-1 [H2]: kill ONE of two workers, then emit SIGTERM from the 'exit' listener that
                //   runs right after server.js scheduled the respawn. A REF'D respawn timer is pending AND a worker is still
                //   live, so the primary must take the DRAIN path (not the no-live-workers shortcut) and never fork a replacement.
                cluster.once('exit', (w) => emitTerm('after-exit-of-' + w.id));
                const ids = Object.keys(cluster.workers);
                if (ids.length) { try { cluster.workers[ids[0]].process.kill('SIGKILL'); } catch (_) {} }
            }
            else if (cmd === 'kill-then-sigterm') {
                // registered AFTER server.js's 'exit' listener, so it runs right after the respawn timer was scheduled
                cluster.once('exit', (w) => emitTerm('after-exit-of-' + w.id));
                for (const id of Object.keys(cluster.workers)) { try { cluster.workers[id].process.kill('SIGKILL'); } catch (_) {} }
            }
        }, 50).unref();
    }
} else {
    ev({ e: 'worker-start', id: cluster.worker && cluster.worker.id });
    if (process.env.TP_RESPAWN_SMOKE_CRASH_AT_BOOT === '1') { ev({ e: 'worker-crash-at-boot', id: cluster.worker && cluster.worker.id }); process.exit(1); }
    const CF = process.env.TP_RESPAWN_SMOKE_CRASH_FILE || '';
    if (CF && fs.existsSync(CF)) { ev({ e: 'worker-crash-at-boot', id: cluster.worker && cluster.worker.id, via: 'flag-file' }); process.exit(1); }
}
`;

// ── HTTP (loopback only) ─────────────────────────────────────────────────────────────────────────────────────────
function request(port, p, { timeout = 5000, headers = {}, agent = false } = {}) {
    return new Promise((resolve) => {
        const ts = Date.now();
        let done = false; const fin = (r) => { if (!done) { done = true; resolve(Object.assign({ t: ts, ms: Date.now() - ts }, r)); } };
        const req = http.request({ host: '127.0.0.1', port, path: p, method: 'GET', agent,
            headers: Object.assign({ Host: 'timesprayers.com', 'X-Forwarded-Proto': 'https', 'User-Agent': UA }, headers) }, (res) => {
            const chunks = [];
            res.on('data', (c) => chunks.push(c));
            res.on('end', () => fin({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
            res.on('error', (e) => fin({ status: 0, err: e.code || e.message }));
        });
        req.on('error', (e) => fin({ status: 0, err: e.code || e.message }));
        req.setTimeout(timeout, () => req.destroy(Object.assign(new Error('timeout'), { code: 'TIMEOUT' })));
        req.end();
    });
}
const health = async (port, timeout = 2000) => (await request(port, '/health', { timeout })).status;
function startProber(port, everyMs) {
    const results = []; const pending = new Set();
    const iv = setInterval(() => {
        const pr = request(port, '/health', { timeout: 2000 }).then((r) => { results.push({ t: r.t, status: r.status, ms: r.ms, err: r.err }); pending.delete(pr); });
        pending.add(pr);
    }, everyMs);
    return { results, stop: async () => { clearInterval(iv); await Promise.all([...pending]); return results.sort((a, b) => a.t - b.t); } };
}
function portFree(port) {
    return new Promise((resolve) => {
        const s = net.createServer(); s.once('error', () => resolve(false));
        s.once('listening', () => s.close(() => resolve(true)));
        s.listen(port, '127.0.0.1');
    });
}
async function waitFor(fn, timeoutMs, stepMs = 100) {
    const end = Date.now() + timeoutMs;
    for (;;) { if (await fn()) return true; if (Date.now() >= end) return false; await sleep(stepMs); }
}

// ── server processes ─────────────────────────────────────────────────────────────────────────────────────────────
const SERVERS = new Set();
function pidAlive(pid) { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } }
function killTree(pid) {
    if (process.platform === 'win32') { try { execFileSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} }
    else { try { process.kill(pid, 'SIGKILL'); } catch (_) {} }
}
// node processes whose command line carries the given preload path (i.e. this server's primary + workers)
function processesWith(needle) {
    const key = needle.replace(/\\/g, '/').toLowerCase();
    if (process.platform !== 'win32') return [];
    let out = '';
    try {
        out = execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command',
            "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ForEach-Object { '' + $_.ProcessId + '|' + $_.CommandLine }"],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true });
    } catch (_) { return [{ pid: -1, cmd: 'process query failed' }]; }
    return out.split(/\r?\n/).filter(Boolean).map((l) => { const i = l.indexOf('|'); return { pid: Number(l.slice(0, i)), cmd: l.slice(i + 1) }; })
        .filter((x) => x.cmd.replace(/\\/g, '/').toLowerCase().includes(key));
}
async function boot(label, root, port, workers, { extraEnv = {}, waitListening = true } = {}) {
    const pre = await request(port, '/health', { timeout: 1500 });
    if (pre.status !== 0) throw new Error('port ' + port + ' already answers /health (' + pre.status + ') — refusing');
    if (!(await portFree(port))) throw new Error('port ' + port + ' is bound by another process — refusing');
    const dir = path.join(OUT, label); fs.mkdirSync(dir, { recursive: true });
    const srv = { label, root, port, workers, dir, evFile: path.join(dir, 'events.jsonl'), trigFile: path.join(dir, 'trigger.txt'),
        preload: path.join(dir, 'preload.cjs'), crashFile: path.join(dir, 'crash-at-boot.flag'), lines: [], exitCode: undefined, exitSignal: undefined, exitAt: null };
    for (const f of [srv.evFile, srv.trigFile, srv.crashFile]) { try { fs.unlinkSync(f); } catch (_) {} }
    fs.writeFileSync(srv.preload, PRELOAD_SRC);
    const env = Object.assign({}, process.env);
    for (const k of Object.keys(env)) if (k.startsWith('TP_RESPAWN_SMOKE_') || k === 'WEB_CONCURRENCY' || k === 'PORT') delete env[k];
    Object.assign(env, { PORT: String(port), SITE_URL: SITE, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', NODE_ENV: 'production',
        WEB_CONCURRENCY: String(workers), TP_RESPAWN_SMOKE_EVENTS: srv.evFile, TP_RESPAWN_SMOKE_TRIGGER: srv.trigFile,
        TP_RESPAWN_SMOKE_CRASH_FILE: srv.crashFile, BENCH_OUT: srv.dir }, extraEnv);
    srv.t0 = Date.now();
    srv.argv = GUARD ? ['-r', GUARD, '-r', srv.preload, 'server.js'] : ['-r', srv.preload, 'server.js'];
    srv.child = spawn(process.execPath, srv.argv, { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    SERVERS.add(srv);
    const onData = (stream) => { let buf = ''; return (d) => {
        buf += d.toString('utf8'); let i;
        while ((i = buf.indexOf('\n')) >= 0) { srv.lines.push({ t: Date.now(), stream, line: buf.slice(0, i).replace(/\r$/, '') }); buf = buf.slice(i + 1); }
    }; };
    srv.child.stdout.on('data', onData('out')); srv.child.stderr.on('data', onData('err'));
    srv.child.on('exit', (code, signal) => { srv.exitCode = code; srv.exitSignal = signal; srv.exitAt = Date.now(); });
    if (waitListening) {
        const up = await waitFor(async () => srv.exitAt !== null
            || (live(srv).filter((w) => w.listenT).length >= workers && (await health(port)) === 200), 240000, 200);
        if (!up || srv.exitAt !== null) { const tail = srv.lines.slice(-8).map((l) => l.line).join(' | '); await stop(srv); throw new Error('server did not become healthy: ' + label + ' :: ' + tail); }
    }
    return srv;
}
async function stop(srv) {
    if (!srv || srv.stopped) return;
    if (srv.child && srv.exitAt === null) killTree(srv.child.pid);
    for (const w of live(srv)) if (w.wpid && pidAlive(w.wpid)) killTree(w.wpid);   // orphans only if the primary died first
    await waitFor(() => srv.exitAt !== null, 15000, 50);
    for (const x of processesWith(srv.preload)) if (x.pid > 0) killTree(x.pid);
    await waitFor(() => portFree(srv.port), 30000, 200);
    srv.leftover = processesWith(srv.preload);
    try { fs.writeFileSync(path.join(srv.dir, 'server.log'), srv.lines.map((l) => l.t + ' ' + l.stream + ' ' + l.line).join('\n') + '\n'); } catch (_) {}
    srv.stopped = true; SERVERS.delete(srv);
}
function events(srv) {
    let txt = '';
    try { txt = fs.readFileSync(srv.evFile, 'utf8'); } catch (_) { return []; }
    return txt.split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch (_) { return null; } }).filter(Boolean);
}
const evOf = (srv, name) => events(srv).filter((e) => e.e === name);
function workersOf(srv) {
    const m = new Map();
    for (const e of events(srv)) {
        if (e.role !== 'primary' || e.id === undefined || e.id === null) continue;
        const w = m.get(e.id) || { id: e.id };
        if (e.e === 'fork') { w.wpid = e.wpid; w.forkT = e.t; }
        else if (e.e === 'online') w.onlineT = e.t;
        else if (e.e === 'listening') w.listenT = e.t;
        else if (e.e === 'exit') { w.exitT = e.t; w.code = e.code; w.signal = e.signal; w.countAtExit = e.workers; }
        else if (e.e === 'after-exit') w.refTimeoutsAfterExit = e.refTimeouts;
        m.set(e.id, w);
    }
    return [...m.values()].sort((a, b) => a.id - b.id);
}
const live = (srv) => workersOf(srv).filter((w) => w.forkT && !w.exitT);
const DIED_RE = /^\[cluster\] worker id=(\d+) died code=(\S+) signal=(\S+) restarts_in_window=(\d+) respawn_in_ms=(\d+)$/;
const diedLines = (srv) => srv.lines.map((l) => [l, DIED_RE.exec(l.line)]).filter(([, m]) => m)
    .map(([l, m]) => ({ t: l.t, id: +m[1], code: m[2], signal: m[3], rw: +m[4], delay: +m[5] }));
const hasLine = (srv, re) => srv.lines.some((l) => re.test(l.line));
const lineOf = (srv, re) => srv.lines.find((l) => re.test(l.line)) || null;
const NOLIVE_RE = /^\[cluster\] no live workers; primary exiting$/;
const BOOTFAIL_RE = /^\[cluster\] (\d+) workers died before any became ready; primary exiting code=1$/;
const primaryExitEv = (srv) => evOf(srv, 'primary-exit')[0] || null;
function maxInWindow(times, windowMs) {
    const t = [...times].sort((a, b) => a - b); let best = 0;
    for (let i = 0, j = 0; i < t.length; i++) { while (t[i] - t[j] >= windowMs) j++; best = Math.max(best, i - j + 1); }
    return best;
}
const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const needBase = (label) => { ok(label, !!BASE_ROOT && fs.existsSync(path.join(BASE_ROOT, 'server.js')), 'TP_BASE_ROOT points at a checkout with server.js', 'TP_BASE_ROOT=' + (BASE_ROOT || '(unset)')); return !!BASE_ROOT; };
async function killAndWaitExit(srv, w) {
    process.kill(w.wpid, 'SIGKILL');
    return waitFor(() => !!(workersOf(srv).find((x) => x.id === w.id) || {}).exitT, 15000, 10);
}

// ── scenarios ────────────────────────────────────────────────────────────────────────────────────────────────────
// owner items A + B: normal startup with 1 and with 2 workers -- no kill, no signal, nothing may respawn
async function startupCheck(L, label, port, n) {
    const tBoot = Date.now();
    const s = await boot(label, TEST_ROOT, port, n);
    const tUp = Date.now();
    try {
        await sleep(2000);                                                  // steady window: nothing may happen inside it
        const ws = workersOf(s); const ps = evOf(s, 'primary-start')[0] || { t: s.t0 }; const listens = evOf(s, 'listening');
        ok(L, hasLine(s, new RegExp('^\\[cluster\\] primary pid=\\d+ forking ' + n + ' worker\\(s\\) \\(WEB_CONCURRENCY=' + n + '\\)$')),
            'primary logged: forking ' + n + ' worker(s) (WEB_CONCURRENCY=' + n + ')', (lineOf(s, /^\[cluster\] primary pid=/) || {}).line);
        ok(L, ws.length === n && live(s).length === n, 'exactly ' + n + ' fork(s) ever and ' + n + ' live worker(s)', 'forks=' + ws.length + ' live=' + live(s).length);
        ok(L, listens.length === n && listens.every((e) => e.port === port) && new Set(ws.map((w) => w.wpid)).size === n,
            'all ' + n + ' worker(s) listening on port ' + port + ', distinct pids', listens.map((e) => e.wpid + ':' + e.port).join(' '));
        ok(L, ws.every((w) => w.wpid !== s.child.pid), 'the primary process itself never listened (it only supervises)', 'primary pid=' + s.child.pid + ' worker pids=' + ws.map((w) => w.wpid).join(','));
        ok(L, (await health(port)) === 200, '/health 200 on the ' + n + '-worker server');
        ok(L, evOf(s, 'exit').length === 0 && diedLines(s).length === 0, 'no worker exit and no "died" line in the steady window', 'exits=' + evOf(s, 'exit').length + ' died-lines=' + diedLines(s).length);
        ok(L, s.exitAt === null && pidAlive(s.child.pid) && !hasLine(s, NOLIVE_RE) && !hasLine(s, BOOTFAIL_RE),
            'primary alive; neither the no-live-workers nor the crash-at-boot fail-fast path was reached', 'exitCode=' + s.exitCode);
        const slowest = Math.max(...ws.map((w) => w.listenT - ps.t));
        info(L + ' primary start→last worker listening ' + slowest + ' ms; spawn→/health 200 ' + (tUp - tBoot) + ' ms; fork→listening ms=' + ws.map((w) => w.listenT - w.forkT).join(','));
    } finally { await stop(s); }
}

async function scenarioS0() {
    section('[A] 1 worker, NORMAL startup (TEST) — exactly 1 fork, it listens, /health 200, nothing respawns');
    await startupCheck('A', 'A-test-1w-startup', P(0), 1);
    section('[B] 2 workers, NORMAL startup (TEST) — exactly 2 forks, both listen, /health 200, nothing respawns');
    await startupCheck('B', 'B-test-2w-startup', P(2), 2);
}

async function scenarioS1() {
    section('[S1] 1 worker: SIGKILL the only worker → primary survives, logs the death, respawns, /health 200 again  (TEST ' + TEST_ROOT + ')');
    const s = await boot('S1-test-1w', TEST_ROOT, P(0), 1);
    try {
        const [w1] = live(s);
        const tKill = Date.now();
        const exited = await killAndWaitExit(s, w1);
        const back = await waitFor(async () => s.exitAt !== null || (live(s).some((w) => w.id !== w1.id && w.listenT) && (await health(s.port)) === 200), 240000, 100);
        const tBack = Date.now();
        await sleep(300);
        const ws = workersOf(s); const d1 = ws.find((w) => w.id === w1.id) || {}; const w2 = ws.find((w) => w.id !== w1.id);
        const died = diedLines(s); const pe = primaryExitEv(s);
        ok('S1', exited, 'primary observed the worker exit (cluster "exit" event)', 'code=' + d1.code + ' signal=' + d1.signal);
        ok('S1', s.exitAt === null && !pe && pidAlive(s.child.pid), 'primary is still alive after its only worker died',
            pe ? 'primary exit code=' + pe.code + ' ' + (pe.t - d1.exitT) + ' ms after the worker exit event' : 'alive pid=' + s.child.pid);
        ok('S1', died.length === 1 && died[0].id === w1.id && died[0].rw === 1 && died[0].delay === 200,
            'death logged once: [cluster] worker id=' + w1.id + ' died ... restarts_in_window=1 respawn_in_ms=200', JSON.stringify(died));
        ok('S1', (d1.refTimeoutsAfterExit || 0) >= 1, 'a REF\'D timer is pending right after the exit handler (the respawn timer)', 'ref Timeout count=' + d1.refTimeoutsAfterExit);
        ok('S1', !!w2 && w2.wpid !== w1.wpid && w2.forkT - d1.exitT >= 180 && w2.forkT - d1.exitT <= 3000,
            'a NEW worker (new pid) was forked after the 200 ms respawn delay', w2 ? 'id=' + w2.id + ' pid=' + w2.wpid + ' exit→fork=' + (w2.forkT - d1.exitT) + ' ms' : 'no new fork');
        ok('S1', back && (await health(s.port)) === 200 && !!(w2 && w2.listenT), '/health 200 again, served by the new worker',
            s.exitAt !== null ? 'primary gone, /health never returned' : 'kill→/health 200=' + (tBack - tKill) + ' ms');
        ok('S1', live(s).length === 1, 'exactly 1 live worker afterwards', JSON.stringify(live(s)));
        recovery('S1', '1 worker, SIGKILL the only worker → /health 200 again', back && s.exitAt === null ? tBack - tKill : null,
            w2 ? 'exit→fork ' + (w2.forkT - d1.exitT) + ' ms + fork→listening ' + (w2.listenT - w2.forkT) + ' ms' : '');
        if (w2) info('S1 kill→exit event ' + (d1.exitT - tKill) + ' ms; exit→fork ' + (w2.forkT - d1.exitT) + ' ms (logged 200); fork→listening '
            + (w2.listenT - w2.forkT) + ' ms; kill→/health 200 ' + (tBack - tKill) + ' ms; Windows exit code=' + d1.code + ' signal=' + d1.signal);
    } finally { await stop(s); }

    section('[N1] negative control — BASE, 1 worker: SIGKILL the only worker → the primary exits (defect reproduced)');
    if (!needBase('N1')) return;
    const b = await boot('N1-base-1w', BASE_ROOT, P(1), 1);
    try {
        const [w1] = live(b);
        const tKill = Date.now();
        await killAndWaitExit(b, w1);
        const gone = await waitFor(() => b.exitAt !== null, 15000, 20);
        await sleep(400);
        const d1 = workersOf(b).find((w) => w.id === w1.id) || {}; const pe = primaryExitEv(b);
        ok('N1', gone && !!pe, 'BASE primary exits after its only worker died', pe ? 'exit ' + (pe.t - d1.exitT) + ' ms after the worker exit event, ' + (pe.t - tKill) + ' ms after the kill' : 'still alive');
        ok('N1', b.exitCode === 0 && pe && pe.code === 0, 'BASE primary exit code 0 (Render sees a clean exit)', 'code=' + b.exitCode);
        ok('N1', workersOf(b).length === 1, 'BASE never forked a replacement', 'workers ever=' + workersOf(b).length);
        ok('N1', diedLines(b).length === 1 && diedLines(b)[0].delay === 200, 'BASE logged the death with respawn_in_ms=200 (the respawn never ran)', JSON.stringify(diedLines(b)));
        ok('N1', d1.refTimeoutsAfterExit === 0, 'BASE: no REF\'D timer pending after the exit handler (the respawn timer was unref\'d)', 'ref Timeout count=' + d1.refTimeoutsAfterExit);
        ok('N1', (await health(b.port)) === 0, 'BASE /health refused afterwards (service gone)');
        if (pe) info('N1 BASE primary exited ' + (pe.t - d1.exitT) + ' ms after the worker exit event (' + (pe.t - tKill) + ' ms after the kill)');
    } finally { await stop(b); }
}

async function scenarioS2() {
    section('[S2] 2 workers: SIGKILL one → /health every 100 ms stays 200, the dead worker is replaced  (TEST)');
    const s = await boot('S2-test-2w', TEST_ROOT, P(2), 2);
    try {
        let prober = startProber(s.port, 100);
        await sleep(1000);
        const [wa] = live(s);
        const tKill = Date.now();
        await killAndWaitExit(s, wa);
        const replaced = await waitFor(async () => s.exitAt !== null || live(s).filter((w) => w.listenT).length === 2, 240000, 100);
        await sleep(1000);
        let probes = await prober.stop();
        const bad = probes.filter((r) => r.status !== 200);
        const ws = workersOf(s); const dead = ws.find((w) => w.id === wa.id) || {}; const repl = ws.filter((w) => w.forkT > dead.exitT);
        ok('S2', s.exitAt === null && pidAlive(s.child.pid), 'primary alive');
        ok('S2', probes.length >= 50 && bad.length === 0, '/health answered 200 on every 100 ms probe throughout the death and respawn',
            'probes=' + probes.length + ' non-200=' + bad.length + ' ' + JSON.stringify(bad.slice(0, 5)));
        ok('S2', replaced && repl.length === 1 && repl[0].wpid !== wa.wpid && !!repl[0].listenT, 'the dead worker was replaced by a new listening worker',
            repl.map((w) => 'id=' + w.id + ' pid=' + w.wpid + ' exit→fork=' + (w.forkT - dead.exitT) + ' ms').join(', '));
        ok('S2', live(s).length === 2 && new Set(live(s).map((w) => w.wpid)).size === 2, '2 live workers again', live(s).map((w) => w.id + ':' + w.wpid).join(' '));
        const died = diedLines(s);
        ok('S2', died.length === 1 && died[0].rw === 1 && died[0].delay === 200, 'death logged once with respawn_in_ms=200', JSON.stringify(died));
        recovery('S2', '2 workers, SIGKILL one → dead worker replaced (service never lost)', replaced && repl[0] && repl[0].listenT ? repl[0].listenT - tKill : null,
            'zero-downtime: ' + probes.length + ' probes, ' + bad.length + ' non-200');
        info('S2 probes=' + probes.length + ' max health latency=' + Math.max(...probes.map((r) => r.ms)) + ' ms; kill→replacement listening=' + ((repl[0] && repl[0].listenT) - tKill) + ' ms');

        section('[S2b] 2 workers: SIGKILL BOTH in the same tick → primary survives and replaces both  (TEST)');
        prober = startProber(s.port, 100);
        await sleep(500);
        const pair = live(s);
        const tKill2 = Date.now();
        for (const w of pair) process.kill(w.wpid, 'SIGKILL');
        const bothExit = await waitFor(() => pair.every((p) => !!(workersOf(s).find((x) => x.id === p.id) || {}).exitT), 15000, 10);
        const back = await waitFor(async () => s.exitAt !== null || (live(s).filter((w) => !pair.some((p) => p.id === w.id) && w.listenT).length === 2 && (await health(s.port)) === 200), 240000, 100);
        const tBack = Date.now();
        await sleep(1000);
        probes = await prober.stop();
        const lastExit = Math.max(...pair.map((p) => (workersOf(s).find((x) => x.id === p.id) || {}).exitT || 0));
        const newW = workersOf(s).filter((w) => w.forkT > lastExit - 1 && !pair.some((p) => p.id === w.id) && w.forkT >= tKill2);
        const pe = primaryExitEv(s);
        ok('S2b', bothExit, 'both workers exited', pair.map((p) => p.id + ':' + p.wpid).join(' '));
        ok('S2b', s.exitAt === null && !pe && pidAlive(s.child.pid), 'primary is still alive after BOTH workers died together', pe ? 'primary exit code=' + pe.code + ' ' + (pe.t - lastExit) + ' ms after the last worker exit' : '');
        const died2 = diedLines(s).slice(1);
        ok('S2b', died2.length === 2 && died2[0].rw === 2 && died2[0].delay === 200 && died2[1].rw === 3 && died2[1].delay === 1000,
            'both deaths logged: restarts_in_window 2 → 200 ms, 3 → 1000 ms', JSON.stringify(died2));
        ok('S2b', back && newW.length === 2 && newW.every((w) => w.listenT), 'two NEW workers forked and listening', newW.map((w) => 'id=' + w.id + ' fork+' + (w.forkT - lastExit) + ' ms').join(', '));
        ok('S2b', (await health(s.port)) === 200 && live(s).length === 2, '/health 200 again with 2 live workers');
        recovery('S2b', '2 workers, SIGKILL BOTH → /health 200 again', back && s.exitAt === null ? tBack - tKill2 : null,
            'full outage while every worker is dead; ' + probes.filter((r) => r.status !== 200).length + '/' + probes.length + ' probes non-200');
        const firstBad = probes.find((r) => r.t >= tKill2 && r.status !== 200); const lastBad = [...probes].reverse().find((r) => r.status !== 200);
        info('S2b outage (every worker dead, so expected until a replacement listens): non-200 probes=' + probes.filter((r) => r.status !== 200).length + '/' + probes.length
            + (firstBad ? ' from +' + (firstBad.t - tKill2) + ' ms to +' + (lastBad.t - tKill2) + ' ms after the kill' : '')
            + (s.exitAt !== null ? '; primary gone, /health never returned' : '; kill→/health 200=' + (tBack - tKill2) + ' ms'));
    } finally { await stop(s); }

    section('[N2] negative control — BASE, 2 workers: SIGKILL both → the primary exits (defect reproduced)');
    if (!needBase('N2')) return;
    const b = await boot('N2-base-2w', BASE_ROOT, P(3), 2);
    try {
        const pair = live(b);
        for (const w of pair) process.kill(w.wpid, 'SIGKILL');
        const gone = await waitFor(() => b.exitAt !== null, 15000, 20);
        await sleep(400);
        const pe = primaryExitEv(b); const lastExit = Math.max(...workersOf(b).map((w) => w.exitT || 0));
        ok('N2', gone && !!pe && pe.code === 0, 'BASE primary exits (code 0) when both workers die together', pe ? (pe.t - lastExit) + ' ms after the last worker exit event' : 'still alive');
        ok('N2', workersOf(b).length === 2, 'BASE never forked a replacement', 'workers ever=' + workersOf(b).length);
    } finally { await stop(b); }
}

async function scenarioS3() {
    section('[S3a] SIGTERM (emulated in the primary) with 2 live workers → drain, no respawn, all exit, primary exit 0 < 15 s  (TEST)');
    const s = await boot('S3a-test-2w-sigterm', TEST_ROOT, P(4), 2);
    try {
        const before = live(s);
        fs.writeFileSync(s.trigFile, 'sigterm');
        const gone = await waitFor(() => s.exitAt !== null, 30000, 20);
        await sleep(300);
        const em = evOf(s, 'emit-sigterm')[0]; const pe = primaryExitEv(s); const ws = workersOf(s);
        ok('S3a', !!em, 'SIGTERM emitted inside the primary (process.emit)', em ? 'workers at SIGTERM=' + em.workers : 'no trigger');
        ok('S3a', hasLine(s, /^\[cluster\] primary received SIGTERM; draining 2 worker\(s\)$/), 'primary logged: received SIGTERM; draining 2 worker(s)');
        ok('S3a', em && ws.filter((w) => w.forkT >= em.t).length === 0 && diedLines(s).length === 0, 'no worker forked and no respawn scheduled during the drain',
            'forks after=' + (em ? ws.filter((w) => w.forkT >= em.t).length : '?') + ' died-lines=' + diedLines(s).length);
        ok('S3a', before.every((w) => { const x = ws.find((y) => y.id === w.id) || {}; return x.exitT && !pidAlive(w.wpid); }), 'every worker exited',
            ws.map((w) => 'id=' + w.id + ' code=' + w.code + ' signal=' + w.signal).join(', '));
        ok('S3a', before.every((w) => hasLine(s, new RegExp('^\\[cluster\\] worker id=' + w.id + ' exited during shutdown '))), 'each worker exit logged as "exited during shutdown"');
        ok('S3a', gone && s.exitCode === 0 && pe && em && pe.t - em.t < 15000, 'primary exited with code 0 within the 15 s grace',
            pe && em ? 'exit ' + (pe.t - em.t) + ' ms after SIGTERM, code=' + s.exitCode : 'code=' + s.exitCode);
        const drainedLine = hasLine(s, /^\[cluster\] all workers drained; primary exiting$/); const windowLine = hasLine(s, /^\[cluster\] drain window elapsed; primary exiting$/);
        // F4: the "all workers drained" line needs the dead worker to be gone from cluster.workers when its "exit" fires, which
        //   depends on the platform's exit/disconnect order; assert the outcome (code 0, well before the 15 s grace) instead.
        ok('S3a', gone && s.exitCode === 0 && !windowLine && pe && em && pe.t - em.t < 5000, 'primary exited 0 promptly, not through the 15 s drain-window path',
            'SIGTERM→exit=' + (pe && em ? pe.t - em.t : '?') + ' ms window-line=' + windowLine + ' drained-line=' + drainedLine);
        ok('S3a', !hasLine(s, NOLIVE_RE), 'the no-live-workers path was NOT taken (2 workers were still live at SIGTERM)');
        if (pe && em) info('S3a SIGTERM→primary exit ' + (pe.t - em.t) + ' ms; "all workers drained" line present=' + drainedLine + '; worker exit signal on Windows=' + ws.map((w) => w.signal).join(','));
    } finally { await stop(s); }

    section('[S3b] race: kill the only worker, SIGTERM right after the 200 ms respawn timer was scheduled  (TEST)');
    const r = await boot('S3b-test-1w-race', TEST_ROOT, P(5), 1);
    try {
        const tTrig = Date.now();
        fs.writeFileSync(r.trigFile, 'kill-then-sigterm');
        const gone = await waitFor(() => r.exitAt !== null, 30000, 10);
        await sleep(300);
        checkRace('S3b', r, 200, gone, tTrig);
    } finally { await stop(r); }
}

function checkRace(label, r, expectDelay, gone, tTrig) {
    const em = evOf(r, 'emit-sigterm')[0]; const pe = primaryExitEv(r); const ws = workersOf(r);
    const died = diedLines(r); const lastDied = died[died.length - 1];
    const dead = ws.filter((w) => w.exitT).sort((a, b) => b.exitT - a.exitT)[0] || {};
    ok(label, !!em && /^after-exit-of-/.test(em.why), 'SIGTERM emitted from the "exit" listener that runs after server.js scheduled the respawn', em ? 'why=' + em.why + ' exit→SIGTERM=' + (em.t - dead.exitT) + ' ms' : 'none');
    ok(label, !!lastDied && lastDied.delay === expectDelay, 'the respawn WAS scheduled (respawn_in_ms=' + expectDelay + ')', JSON.stringify(lastDied));
    ok(label, em && em.refTimeouts >= 1, 'a REF\'D respawn timer was pending when SIGTERM arrived', em ? 'ref Timeout count=' + em.refTimeouts : '');
    const drainingLine = lineOf(r, /^\[cluster\] primary received SIGTERM; draining \d+ worker\(s\)$/);
    ok(label, !!drainingLine, 'primary logged: received SIGTERM; draining N worker(s)', drainingLine ? drainingLine.line : 'missing');
    ok(label, hasLine(r, NOLIVE_RE), 'primary logged: [cluster] no live workers; primary exiting',
        r.lines.filter((l) => /primary exiting/.test(l.line)).map((l) => l.line).join(' | ') || 'no "primary exiting" line');
    ok(label, em && ws.filter((w) => w.forkT >= em.t).length === 0, 'NO worker forked after SIGTERM',
        em ? 'forks after SIGTERM=' + ws.filter((w) => w.forkT >= em.t).length + ' forks total=' + ws.length : '');
    const bound = Math.min(150, expectDelay - 50);
    ok(label, gone && r.exitCode === 0 && pe && pe.code === 0 && em && pe.t - em.t < bound,
        'primary exited with code 0 IMMEDIATELY (< ' + bound + ' ms, i.e. before the pending ' + expectDelay + ' ms respawn timer)',
        pe && em ? 'SIGTERM→exit ' + (pe.t - em.t) + ' ms; code=' + r.exitCode : 'code=' + r.exitCode);
    if (pe && em) info(label + ' trigger→SIGTERM ' + (em.t - tTrig) + ' ms; SIGTERM→primary exit ' + (pe.t - em.t) + ' ms (pending respawn ' + expectDelay + ' ms); '
        + (drainingLine ? drainingLine.line : ''));
}

// owner item H: once the shutdown has started, nothing may fork -- neither the drain branch nor a respawn timer that was
//   already pending when SIGTERM arrived. S3b/S3c cover the 0-worker shortcut; this covers the real DRAIN path.
async function scenarioS6() {
    section('[H2] no worker restart after shutdown started: SIGTERM with a 200 ms respawn PENDING and 1 worker still live  (TEST)');
    const src6 = fs.readFileSync(path.join(TEST_ROOT, 'server.js'), 'utf8').split(/\r?\n/);
    const spawnLine = src6.find((l) => /const tpSpawn = /.test(l)) || '';
    const drainIdx = src6.findIndex((l) => /tpDraining = true;/.test(l));
    const killIdx = src6.findIndex((l, i) => i > drainIdx && /cluster\.workers\[id\]\.process\.kill\(sig\)/.test(l));
    ok('H2', /if \(!tpDraining\) cluster\.fork\(\);/.test(spawnLine), 'static: tpSpawn is guarded by !tpDraining, so a respawn timer surviving into a drain is a no-op', spawnLine.trim());
    ok('H2', drainIdx > 0 && killIdx > drainIdx, 'static: tpShutdown sets tpDraining BEFORE it kills any worker', 'tpDraining=true L' + (drainIdx + 1) + ', worker kill L' + (killIdx + 1));

    const s = await boot('H2-test-2w-killone-then-sigterm', TEST_ROOT, P(4), 2);
    try {
        const before = live(s);
        const tTrig = Date.now();
        fs.writeFileSync(s.trigFile, 'kill-one-then-sigterm');
        const gone = await waitFor(() => s.exitAt !== null, 30000, 10);
        await sleep(400);
        const em = evOf(s, 'emit-sigterm')[0]; const pe = primaryExitEv(s); const ws = workersOf(s); const died = diedLines(s);
        const killed = ws.filter((w) => w.exitT).sort((a, b) => a.exitT - b.exitT)[0] || {};
        const survivor = before.find((w) => w.id !== killed.id) || {};
        const forksAfter = em ? ws.filter((w) => w.forkT >= em.t).length : -1;
        ok('H2', !!em && em.workers === 1, 'SIGTERM arrived with exactly 1 live worker left — the DRAIN path, not the no-live shortcut',
            em ? 'workers at SIGTERM=' + em.workers + ' ref Timeout count=' + em.refTimeouts : 'no SIGTERM emitted');
        ok('H2', em && em.refTimeouts >= 1 && died.length === 1 && died[0].delay === 200,
            'a REF\'D 200 ms respawn timer was pending when the shutdown started', JSON.stringify(died) + ' refTimeouts=' + (em ? em.refTimeouts : '?'));
        ok('H2', hasLine(s, /^\[cluster\] primary received SIGTERM; draining 1 worker\(s\)$/), 'primary logged: received SIGTERM; draining 1 worker(s)');
        ok('H2', !hasLine(s, NOLIVE_RE), 'the no-live-workers shortcut was NOT taken (a worker was still live at SIGTERM)');
        ok('H2', forksAfter === 0 && ws.length === 2, 'NO worker forked after the shutdown started (total forks stayed at the 2 initial ones)',
            'forks ever=' + ws.length + ' forks after SIGTERM=' + forksAfter);
        ok('H2', died.length === 1, 'no second "died"/respawn line: the survivor took the shutdown branch instead', JSON.stringify(died));
        ok('H2', survivor.id !== undefined && hasLine(s, new RegExp('^\\[cluster\\] worker id=' + survivor.id + ' exited during shutdown ')),
            'the surviving worker exit was logged "exited during shutdown" (no respawn scheduled for it)', 'survivor id=' + survivor.id);
        ok('H2', gone && s.exitCode === 0 && pe && pe.code === 0, 'primary exited with code 0',
            'code=' + s.exitCode + (pe && em ? ' SIGTERM→exit=' + (pe.t - em.t) + ' ms' : ''));
        const outlived = !!(pe && killed.exitT && pe.t - killed.exitT >= 200);
        if (pe && em) info('H2 trigger→SIGTERM ' + (em.t - tTrig) + ' ms; worker exit→SIGTERM ' + (em.t - killed.exitT) + ' ms; SIGTERM→primary exit '
            + (pe.t - em.t) + ' ms; the pending 200 ms respawn was still due when the primary exited=' + (!outlived)
            + ' (either way 0 forks); forks ever=' + ws.length);
    } finally { await stop(s); }
}

async function scenarioS4() {
    section('[S4] no restart loop / no fork storm: 8 kills, each as soon as the replacement is online  (TEST)');
    const s = await boot('S4-test-1w-killloop', TEST_ROOT, P(6), 1);
    try {
        const kills = [];
        for (let k = 0; k < 8; k++) {
            let target = null;
            await waitFor(() => { if (s.exitAt !== null) return true; target = live(s).find((w) => w.onlineT) || null; return !!target; }, 60000, 5);
            if (!target || s.exitAt !== null) break;
            kills.push({ k: k + 1, id: target.id, wpid: target.wpid, t: Date.now(), sinceOnline: Date.now() - target.onlineT });
            await killAndWaitExit(s, target);
        }
        const back = await waitFor(async () => s.exitAt !== null || (live(s).some((w) => w.listenT) && (await health(s.port)) === 200), 240000, 100);
        const ws = workersOf(s); const died = diedLines(s); const deaths = ws.filter((w) => w.exitT).sort((a, b) => a.exitT - b.exitT);
        ok('S4', kills.length === 8, '8 kills performed', kills.map((k) => k.id + ':' + k.wpid).join(' '));
        ok('S4', s.exitAt === null && !primaryExitEv(s) && pidAlive(s.child.pid), 'primary alive through all 8 deaths');
        ok('S4', died.length === 8 && died.every((d, i) => d.rw === i + 1), 'restarts_in_window counts 1..8', died.map((d) => d.rw).join(','));
        ok('S4', JSON.stringify(died.map((d) => d.delay)) === JSON.stringify(EXPECTED_DELAYS), 'logged respawn_in_ms escalates 200,200,1000,1000,1000,5000,5000,5000', died.map((d) => d.delay).join(','));
        const actual = deaths.map((d) => { const nxt = ws.filter((w) => w.forkT >= d.exitT).sort((a, b) => a.forkT - b.forkT)[0]; return nxt ? nxt.forkT - d.exitT : null; });
        ok('S4', actual.length === 8 && actual.every((a, i) => a !== null && a >= EXPECTED_DELAYS[i] - 20 && a <= EXPECTED_DELAYS[i] + 2000),
            'each actual exit→fork delay honours its logged backoff (−20 ms timer granularity … +2 s)', actual.join(','));
        const forkTimes = ws.map((w) => w.forkT).filter(Boolean);
        const gaps = forkTimes.slice(1).map((t, i) => t - forkTimes[i]);
        const max60 = maxInWindow(forkTimes, 60000);
        ok('S4', forkTimes.length === 9 && max60 <= 18 && Math.min(...gaps) >= 180, 'fork rate bounded: 9 forks in total, ≤ 18 in any 60 s, no two forks < 180 ms apart',
            'forks=' + forkTimes.length + ' max/60s=' + max60 + ' min gap=' + Math.min(...gaps) + ' ms');
        ok('S4', back && (await health(s.port)) === 200 && live(s).length === 1, 'the last replacement listens and serves /health 200 (exactly 1 live worker)');
        const preListen = deaths.filter((d) => !d.listenT || d.listenT > d.exitT).length;
        ok('S4', preListen > TP_MAX_BOOT_DEATHS && !hasLine(s, BOOTFAIL_RE),
            'after an earlier worker was ready, ' + preListen + ' deaths before the replacement listened (> ' + TP_MAX_BOOT_DEATHS + ') did NOT trigger the crash-at-boot fail-fast',
            'pre-listening deaths=' + preListen + ' of ' + deaths.length + ' fail-fast line=' + hasLine(s, BOOTFAIL_RE));
        info('S4 fork gaps (ms; the first is the initial worker\'s boot until kill 1)=' + gaps.join(',') + '; kill→next fork span=' + (forkTimes[forkTimes.length - 1] - kills[0].t) + ' ms; kills ' + kills.map((k) => k.sinceOnline).join(',') + ' ms after online');

        section('[S3c] race at maximum backoff: kill + SIGTERM while respawn_in_ms=5000 is pending  (TEST, on the S4 server)');
        const tTrig = Date.now();
        fs.writeFileSync(s.trigFile, 'kill-then-sigterm');
        const gone = await waitFor(() => s.exitAt !== null, 30000, 10);
        await sleep(300);
        checkRace('S3c', s, 5000, gone, tTrig);
    } finally { await stop(s); }
}

async function scenarioS4d() {
    section('[S4d] a worker was READY, then every replacement crashes at boot (flag file), 1 and 2 workers → no fail-fast, primary never exits  (TEST)');
    const ss = await Promise.all([boot('S4d-test-1w-ready-then-bootcrash', TEST_ROOT, P(6), 1), boot('S4d-test-2w-ready-then-bootcrash', TEST_ROOT, P(9), 2)]);
    try {
        const TARGET_DEATHS = 8;                                                       // 1 kill + 7 boot crashes (> TP_MAX_BOOT_DEATHS)
        const runs = ss.map((s) => ({ s, readyBefore: evOf(s, 'listening').length }));
        for (const r of runs) {
            fs.writeFileSync(r.s.crashFile, 'crash');
            const [victim] = live(r.s);
            r.victim = victim; r.tKill = Date.now();
            process.kill(victim.wpid, 'SIGKILL');
        }
        // Probing starts only AFTER the kill's "exit" event: a connection the primary accepts in the few ms between an abrupt
        //   worker death and its disconnect is handed off (SCHED_RR) to the dead worker, and on Windows that IPC write can
        //   throw an unhandled 'error' (write EMFILE) that crashes the primary. That is Node cluster behaviour, identical on
        //   BASE, and not what S4d measures (see the report).
        await Promise.all(runs.map((r) => waitFor(() => !!(workersOf(r.s).find((x) => x.id === r.victim.id) || {}).exitT, 15000, 10)));
        for (const r of runs) r.prober = startProber(r.s.port, 250);
        await Promise.all(runs.map((r) => waitFor(() => r.s.exitAt !== null || diedLines(r.s).length >= TARGET_DEATHS, 90000, 50)));
        for (const r of runs) { r.tClear = Date.now(); r.diedAtClear = diedLines(r.s).length; try { fs.unlinkSync(r.s.crashFile); } catch (_) {} }
        await Promise.all(runs.map((r) => waitFor(async () => r.s.exitAt !== null
            || (live(r.s).filter((w) => w.listenT).length === r.s.workers && live(r.s).some((w) => w.forkT > r.tClear) && (await health(r.s.port)) === 200), 90000, 200)));
        const tRecovered = Date.now();
        await sleep(500);
        for (const r of runs) {
            const s = r.s; const n = s.workers; const L = 'S4d';
            const probes = await r.prober.stop();
            const bootCrashes = evOf(s, 'worker-crash-at-boot').length;
            const died = diedLines(s); const ws = workersOf(s);
            const deaths = ws.filter((w) => w.exitT).sort((a, b) => a.exitT - b.exitT);
            const actual = deaths.slice(0, TARGET_DEATHS).map((d) => { const nxt = ws.filter((w) => w.forkT >= d.exitT && w.id !== r.victim.id).sort((a, b) => a.forkT - b.forkT)[0]; return nxt ? nxt.forkT - d.exitT : null; });
            ok(L, r.readyBefore >= n, s.label + ': ' + n + ' worker(s) had listened before the crash-at-boot phase', 'listening events before=' + r.readyBefore);
            ok(L, s.exitAt === null && !primaryExitEv(s) && pidAlive(s.child.pid) && !hasLine(s, BOOTFAIL_RE),
                s.label + ': primary never exited and never logged the fail-fast line', 'code=' + s.exitCode + ' fail-fast line=' + hasLine(s, BOOTFAIL_RE));
            ok(L, bootCrashes >= TARGET_DEATHS - 1 && bootCrashes > TP_MAX_BOOT_DEATHS, s.label + ': ' + bootCrashes + ' replacements crashed at boot (> fail-fast threshold ' + TP_MAX_BOOT_DEATHS + ') and were still retried',
                'boot crashes=' + bootCrashes + ' died lines at flag removal=' + r.diedAtClear);
            ok(L, JSON.stringify(died.slice(0, TARGET_DEATHS).map((d) => d.delay)) === JSON.stringify(EXPECTED_DELAYS),
                s.label + ': logged respawn_in_ms escalates 200,200,1000,1000,1000,5000,5000,5000', died.map((d) => d.delay).join(','));
            ok(L, actual.length === TARGET_DEATHS && actual.every((a, i) => a !== null && a >= EXPECTED_DELAYS[i] - 20 && a <= EXPECTED_DELAYS[i] + 2000),
                s.label + ': each actual exit→fork delay honours its logged backoff', actual.join(','));
            ok(L, live(s).filter((w) => w.listenT).length === n && (await health(s.port)) === 200,
                s.label + ': after the flag was removed the next respawn listens again, ' + n + ' live worker(s), /health 200', 'flag removed→recovered=' + (tRecovered - r.tClear) + ' ms');
            const bad = probes.filter((p) => p.status !== 200);
            if (n === 2) ok(L, probes.length >= 40 && bad.length === 0, s.label + ': the surviving worker answered /health 200 on every 250 ms probe through the crash-at-boot phase', 'probes=' + probes.length + ' non-200=' + bad.length
                + ' ' + JSON.stringify(bad.slice(0, 4).map((p) => ({ afterKill: p.t - r.tKill, ms: p.ms, status: p.status, err: p.err }))));
            info(s.label + ' kill→flag removal ' + (r.tClear - r.tKill) + ' ms; deaths=' + deaths.length + ' boot crashes=' + bootCrashes + '; exit→fork ms=' + actual.join(',')
                + '; /health probes=' + probes.length + ' non-200=' + bad.length + '; forks total=' + ws.length);
        }
    } finally { for (const s of ss) { try { fs.unlinkSync(s.crashFile); } catch (_) {} } await Promise.all(ss.map((s) => stop(s))); }
}

async function scenarioS4c() {
    section('[S4c] crash at boot from the first worker (no worker ever ready), 1 and 2 workers → fail-fast exit 1 after ' + TP_MAX_BOOT_DEATHS + ' deaths  (TEST)');
    const crashEnv = { TP_RESPAWN_SMOKE_CRASH_AT_BOOT: '1' };
    const cs = await Promise.all([boot('S4c-test-1w-crash', TEST_ROOT, P(7), 1, { extraEnv: crashEnv, waitListening: false }),
        boot('S4c-test-2w-crash', TEST_ROOT, P(8), 2, { extraEnv: crashEnv, waitListening: false })]);
    try {
        const healthSeen = new Set();
        const tEnd = Date.now() + CRASH_S * 1000;
        while (Date.now() < tEnd && cs.some((c) => c.exitAt === null)) {
            for (const c of cs) { if (c.exitAt !== null) continue; const h = await health(c.port, 1000); if (h) healthSeen.add(c.label + ':' + h); }
            await sleep(250);
        }
        await sleep(1500);
        for (const c of cs) {
            const n = c.workers; const ps = evOf(c, 'primary-start')[0] || { t: c.t0 }; const pe = primaryExitEv(c);
            const ws = workersOf(c); const forkTimes = ws.map((w) => w.forkT).filter(Boolean).sort((a, b) => a - b);
            const died = diedLines(c);
            const deaths = ws.filter((w) => w.exitT).sort((a, b) => a.exitT - b.exitT);
            const nth = deaths[TP_MAX_BOOT_DEATHS - 1] || null;
            const honoured = deaths.map((d, i) => { const dl = died[i]; const nxt = ws.filter((w) => w.forkT >= d.exitT && !w.used).sort((a, b) => a.forkT - b.forkT)[0]; if (nxt) nxt.used = true; return dl && nxt ? (nxt.forkT - d.exitT) - dl.delay : null; }).filter((x) => x !== null);
            const failLine = lineOf(c, BOOTFAIL_RE);
            const L = 'S4c';
            ok(L, c.exitAt !== null && c.exitCode === 1 && !!pe && pe.code === 1, c.label + ': primary exited with code 1',
                'code=' + c.exitCode + (pe ? ' start→exit=' + ((pe.t - ps.t) / 1000).toFixed(2) + ' s' : ' (still alive after ' + CRASH_S + ' s)'));
            ok(L, !!failLine && failLine.line === '[cluster] ' + TP_MAX_BOOT_DEATHS + ' workers died before any became ready; primary exiting code=1',
                c.label + ': logged "[cluster] ' + TP_MAX_BOOT_DEATHS + ' workers died before any became ready; primary exiting code=1"', failLine ? failLine.line : 'missing');
            if (n === 1) ok(L, forkTimes.length === TP_MAX_BOOT_DEATHS && deaths.length === TP_MAX_BOOT_DEATHS, c.label + ': exactly ' + TP_MAX_BOOT_DEATHS + ' forks and ' + TP_MAX_BOOT_DEATHS + ' deaths',
                'forks=' + forkTimes.length + ' deaths=' + deaths.length);
            else ok(L, forkTimes.length >= TP_MAX_BOOT_DEATHS && forkTimes.length <= TP_MAX_BOOT_DEATHS + 1, c.label + ': ' + TP_MAX_BOOT_DEATHS + '-' + (TP_MAX_BOOT_DEATHS + 1) + ' forks (deaths are counted across both slots)',
                'forks=' + forkTimes.length + ' deaths=' + deaths.length);
            ok(L, died.length === TP_MAX_BOOT_DEATHS && JSON.stringify(died.map((d) => d.delay)) === JSON.stringify(EXPECTED_DELAYS.slice(0, TP_MAX_BOOT_DEATHS)),
                c.label + ': ' + TP_MAX_BOOT_DEATHS + ' "died" lines, backoff 200,200,1000,1000,1000 before the last one', died.map((d) => d.delay).join(','));
            ok(L, !!nth && !!pe && ws.filter((w) => w.forkT > nth.exitT).length === 0 && pe.t - nth.exitT < 1000,
                c.label + ': no fork after the ' + TP_MAX_BOOT_DEATHS + 'th death; primary exited right after it', nth && pe ? 'death ' + TP_MAX_BOOT_DEATHS + '→exit=' + (pe.t - nth.exitT) + ' ms forks after=' + ws.filter((w) => w.forkT > nth.exitT).length : '');
            ok(L, !!pe && pe.t - ps.t < 30000, c.label + ': bounded time from primary start to exit (< 30 s)', pe ? ((pe.t - ps.t) / 1000).toFixed(2) + ' s' : 'no exit');
            ok(L, honoured.length === forkTimes.length - n && honoured.every((x) => x >= -20), c.label + ': every respawn waited at least its logged respawn_in_ms',
                'min slack=' + (honoured.length ? Math.min(...honoured) : 'n/a') + ' ms over ' + honoured.length + ' respawns');
            ok(L, evOf(c, 'listening').length === 0 && ![...healthSeen].some((h) => h.startsWith(c.label + ':')), c.label + ': nothing ever listened (/health refused throughout)');
            const left = processesWith(c.preload);
            ok(L, left.length === 0, c.label + ': no node process of this server left after the primary exit', JSON.stringify(left.slice(0, 3)));
            info(c.label + ' forks=' + forkTimes.length + ' deaths=' + deaths.length + '; primary start→exit=' + (pe ? ((pe.t - ps.t) / 1000).toFixed(2) + ' s' : 'n/a')
                + '; fork gaps ms=' + forkTimes.slice(1).map((t, i) => t - forkTimes[i]).join(','));
        }
    } finally { await Promise.all(cs.map((c) => stop(c))); }

    section('[N4c] negative control — BASE crash at boot: the primary exits after the last worker death (before the fix)');
    if (!needBase('N4c')) return;
    const bs = await Promise.all([boot('N4c-base-1w-crash', BASE_ROOT, P(7), 1, { extraEnv: crashEnv, waitListening: false }),
        boot('N4c-base-2w-crash', BASE_ROOT, P(8), 2, { extraEnv: crashEnv, waitListening: false })]);
    try {
        await Promise.all(bs.map((b) => waitFor(() => b.exitAt !== null, 20000, 20)));
        await sleep(300);
        for (const b of bs) {
            const pe = primaryExitEv(b); const ws = workersOf(b); const lastExit = Math.max(...ws.map((w) => w.exitT || 0)); const ps = evOf(b, 'primary-start')[0] || { t: b.t0 };
            ok('N4c', !!pe && pe.code === 0 && ws.length === b.workers, b.label + ': BASE primary exits (code 0) after ' + b.workers + ' fork(s), no retry',
                pe ? 'forks=' + ws.length + ' exit ' + (pe.t - lastExit) + ' ms after the last worker exit, ' + (pe.t - ps.t) + ' ms after primary start' : 'still alive, forks=' + ws.length);
        }
    } finally { await Promise.all(bs.map((b) => stop(b))); }
}

// ~50 paths across every page family, static assets, APIs, robots/sitemaps and a 404 (/health is excluded: its body is Date.now())
const IDENTITY_PATHS = [
    '/', '/en', '/fr', '/tr', '/ur', '/de', '/id', '/es', '/bn', '/ms',
    '/prayer-times-in-makkah', '/en/prayer-times-in-makkah', '/prayer-times-in-riyadh', '/fr/prayer-times-in-riyadh', '/prayer-times-in-cairo',
    '/prayer-times-in-saudi-arabia', '/de/prayer-times-in-london', '/prayer-times-worldwide',
    '/qibla', '/qibla-in-makkah', '/en/qibla-in-riyadh', '/next-prayer-in-london', '/time-left-until-next-prayer-in-cairo',
    '/moon', '/moon/saudi-arabia', '/moon/saudi-arabia/riyadh', '/moon/saudi-arabia/riyadh/today', '/moon/saudi-arabia/riyadh/2026', '/moon/saudi-arabia/riyadh/2026/09',
    '/hijri-calendar/1447', '/today-hijri-date', '/date-converter', '/zakat-calculator', '/msbaha',
    '/quran', '/quran/al-fatihah', '/azkar', '/azkar/morning-azkar', '/azkar/evening-azkar', '/azkar/prayer-azkar',
    '/guides', '/guides/why-prayer-times-differ', '/ramadan-countdown', '/en/eid-al-adha-countdown',
    '/about-us', '/contact', '/privacy', '/en/terms',
    '/robots.txt', '/sitemap.xml', '/sitemap-quran.xml', '/ads.txt', '/css/style.css', '/js/app.js', '/sw.js',
    '/api/place-by-slug?slug=makkah', '/this-path-does-not-exist-respawn-smoke',
];
const NORMS = [
    [/nonce="[A-Za-z0-9+/=_-]+"/g, 'nonce="<NONCE>"'],
    [/'nonce-[A-Za-z0-9+/=_-]+'/g, "'nonce-<NONCE>'"],
    [/([?&]|&amp;)b=[0-9a-f]{7,40}\b/g, '$1b=<BUILD>'],
    [/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?/g, '<ISO>'],
];
const norm = (s) => NORMS.reduce((acc, [re, rep]) => acc.replace(re, rep), s);
const IGNORE_H = new Set(['date', 'connection', 'keep-alive', 'transfer-encoding']);
function decode(r) {
    const enc = String((r.headers && r.headers['content-encoding']) || '').toLowerCase();
    try {
        if (enc === 'br') return zlib.brotliDecompressSync(r.body);
        if (enc === 'gzip') return zlib.gunzipSync(r.body);
        if (enc === 'deflate') return zlib.inflateSync(r.body);
    } catch (e) { return Buffer.from('<decode error ' + e.message + '>'); }
    return r.body;
}
function compareResp(a, b) {
    const diffs = [];
    if (a.status === 0 || b.status === 0) return ['transport a=' + (a.err || a.status) + ' b=' + (b.err || b.status)];
    if (a.status !== b.status) diffs.push('status ' + a.status + ' vs ' + b.status);
    const encoded = !!(a.headers['content-encoding'] || b.headers['content-encoding']);
    for (const n of new Set([...Object.keys(a.headers), ...Object.keys(b.headers)])) {
        if (IGNORE_H.has(n) || (n === 'content-length' && encoded)) continue;
        const va = a.headers[n] === undefined ? undefined : norm(String(a.headers[n]));
        const vb = b.headers[n] === undefined ? undefined : norm(String(b.headers[n]));
        if (va !== vb) diffs.push('header ' + n + ': ' + va + ' vs ' + vb);
    }
    const na = norm(decode(a).toString('utf8')), nb = norm(decode(b).toString('utf8'));
    if (na !== nb) { let i = 0; while (i < na.length && i < nb.length && na[i] === nb[i]) i++; diffs.push('body @' + i + ': ' + JSON.stringify(na.slice(i, i + 80)) + ' vs ' + JSON.stringify(nb.slice(i, i + 80))); }
    return diffs;
}
const normBootLine = (l, srv) => l.split(srv.root).join('<ROOT>').split(srv.root.replace(/\\/g, '/')).join('<ROOT>')
    .replace(/pid=\d+/g, 'pid=<PID>').replace(new RegExp('\\b' + srv.port + '\\b', 'g'), '<PORT>').replace(/\b\d+(?:\.\d+)?\s?ms\b/g, '<N>ms')
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?/g, '<ISO>');

async function scenarioS5() {
    section('[S5] normal operation: no worker deaths and no signal → only the "listening" flag runs; boot logs and responses identical to BASE');
    // static: the timer and the fail-fast sit inside the cluster "exit" handler after the tpDraining early return; the
    //   no-live-workers exit sits inside tpShutdown; in normal operation only the 'listening' listener (a boolean) runs
    const src = fs.readFileSync(path.join(TEST_ROOT, 'server.js'), 'utf8').split(/\r?\n/);
    const iExit = src.findIndex((l) => /cluster\.on\('exit'/.test(l)); const iEnd = src.findIndex((l, i) => i > iExit && /^\s{4}\}\);\s*$/.test(l));
    const iTimer = src.findIndex((l) => /setTimeout\(tpSpawn, delay\)/.test(l)); const iRet = src.findIndex((l, i) => i > iExit && /^\s{12}return;\s*$/.test(l));
    ok('S5', iExit > 0 && iTimer > iRet && iRet > iExit && iTimer < iEnd, 'setTimeout(tpSpawn, delay) is reached only from the cluster "exit" handler, after the draining return',
        'exit handler L' + (iExit + 1) + '-L' + (iEnd + 1) + ', draining return L' + (iRet + 1) + ', timer L' + (iTimer + 1) + ': ' + (src[iTimer] || '').trim());
    const iFail = src.findIndex((l) => /if \(!tpEverReady && \+\+tpBootDeaths >= TP_MAX_BOOT_DEATHS\)/.test(l));
    const iShut = src.findIndex((l) => /const tpShutdown = \(sig\) => \{/.test(l)); const iShutEnd = src.findIndex((l, i) => i > iShut && /^\s{4}\};\s*$/.test(l));
    const iNoLive = src.findIndex((l) => /no live workers; primary exiting/.test(l));
    const listenLines = src.filter((l) => /cluster\.on\('listening'/.test(l));
    ok('S5', iFail > iRet && iFail < iTimer && iNoLive > iShut && iNoLive < iShutEnd && listenLines.length === 1 && /\{ tpEverReady = true; \}\);/.test(listenLines[0]),
        'fail-fast only in the "exit" handler (after the draining return); no-live-workers exit only inside tpShutdown; the \'listening\' listener only sets a boolean',
        'fail-fast L' + (iFail + 1) + ', tpShutdown L' + (iShut + 1) + '-L' + (iShutEnd + 1) + ', no-live exit L' + (iNoLive + 1) + ', listening: ' + (listenLines[0] || '').trim());
    if (!needBase('S5')) return;
    const [t, b] = await Promise.all([boot('S5-test-2w', TEST_ROOT, P(8), 2), boot('S5-base-2w', BASE_ROOT, P(9), 2)]);
    try {
        await sleep(2000);
        const bootT = t.lines.map((l) => normBootLine(l.line, t)); const bootB = b.lines.map((l) => normBootLine(l.line, b));
        console.log('  · MEASURED S5 TEST boot log, normalised (' + bootT.length + ' lines; same order as BASE=' + (JSON.stringify(bootT) === JSON.stringify(bootB)) + '):');
        for (const l of bootT) console.log('      | ' + l);
        const sortedT = [...bootT].sort(), sortedB = [...bootB].sort();
        const onlyT = sortedT.filter((l) => !sortedB.includes(l)), onlyB = sortedB.filter((l) => !sortedT.includes(l));
        ok('S5', bootT.length > 5 && JSON.stringify(sortedT) === JSON.stringify(sortedB), 'boot logs identical as a multiset after normalising pid / port / ms / root (2 workers interleave)',
            'lines TEST=' + bootT.length + ' BASE=' + bootB.length + (onlyT.length || onlyB.length ? ' onlyTEST=' + JSON.stringify(onlyT.slice(0, 4)) + ' onlyBASE=' + JSON.stringify(onlyB.slice(0, 4)) : ''));
        ok('S5', bootT[0] === bootB[0] && /^\[cluster\] primary pid=<PID> forking 2 worker\(s\) \(WEB_CONCURRENCY=2\)$/.test(bootT[0]), 'first line (primary) identical', bootT[0]);
        const counts = { paths: IDENTITY_PATHS.length, compared: 0, identical: 0, retriedOk: 0, mismatched: 0, transportRetries: 0, statuses: {} }; const mism = []; const retried = []; const non200 = [];
        // Keep-alive agents on BOTH sides (identical client for TEST and BASE): on Windows loopback a ~1 MB identity body sent
        //   with "Connection: close" intermittently ends in ECONNRESET on BASE and TEST alike (4/60 on BASE /js/app.js,
        //   0/60 with keep-alive; pre-existing, not this ticket). A transport failure (status 0) is re-fetched up to 2 more times.
        const agT = new http.Agent({ keepAlive: true, maxSockets: 2 }), agB = new http.Agent({ keepAlive: true, maxSockets: 2 });
        const pair = async (p, hdr) => {
            let ra, rb;
            for (let a = 0; a < 3; a++) {
                [ra, rb] = await Promise.all([request(t.port, p, { timeout: 60000, headers: hdr, agent: agT }), request(b.port, p, { timeout: 60000, headers: hdr, agent: agB })]);
                if (ra.status && rb.status) break;
                counts.transportRetries++; retried.push('transport ' + p + ' a=' + (ra.err || ra.status) + ' b=' + (rb.err || rb.status));
            }
            return [ra, rb];
        };
        for (const ae of ['br, gzip, deflate', '']) {
            for (const p of IDENTITY_PATHS) {
                const hdr = ae ? { 'Accept-Encoding': ae } : {};
                let [ra, rb] = await pair(p, hdr);
                let d = compareResp(ra, rb);
                if (d.length) {
                    const first = d[0];
                    [ra, rb] = await pair(p, hdr);
                    const d2 = compareResp(ra, rb); if (!d2.length) counts.retriedOk++;
                    retried.push((ae || 'identity') + ' ' + p + ' → ' + (d2.length ? 'STILL DIFFERENT' : 'identical on re-fetch') + ' (first: ' + String(first).slice(0, 160) + ')');
                    d = d2;
                }
                counts.compared++; counts.statuses[ra.status] = (counts.statuses[ra.status] || 0) + 1;
                if (ra.status !== 200) non200.push(ra.status + ' ' + (ae || 'identity') + ' ' + p);
                if (d.length) { counts.mismatched++; mism.push((ae || 'identity') + ' ' + p + ' :: ' + d.slice(0, 2).join(' | ')); } else counts.identical++;
            }
        }
        agT.destroy(); agB.destroy();
        ok('S5', counts.compared === IDENTITY_PATHS.length * 2 && counts.mismatched === 0, 'responses identical to BASE on ' + IDENTITY_PATHS.length + ' paths × 2 encodings (status, headers, decoded body)',
            JSON.stringify(counts) + (mism.length ? ' ' + mism.slice(0, 4).join(' ;; ') : ''));
        ok('S5', (counts.statuses['200'] || 0) >= IDENTITY_PATHS.length, 'the path list exercises real pages (≥ ' + IDENTITY_PATHS.length + ' of ' + counts.compared + ' responses 200)', JSON.stringify(counts.statuses));
        info('S5 non-200 (identical on both sides): ' + (non200.join(' ; ') || 'none') + '; re-fetched once after a first difference: ' + (retried.join(' ; ') || 'none'));
        await sleep(500);
        for (const x of [t, b]) {
            ok('S5', evOf(x, 'exit').length === 0 && diedLines(x).length === 0 && workersOf(x).length === 2 && x.exitAt === null && !hasLine(x, NOLIVE_RE) && !hasLine(x, BOOTFAIL_RE),
                x.label + ': 0 worker exits, 0 "died" lines, exactly the 2 initial forks, no new exit line (respawn / fail-fast / no-live paths never reached)', 'exits=' + evOf(x, 'exit').length + ' forks=' + workersOf(x).length);
        }
        const blockedT = evOf(t, 'outbound-blocked').length, blockedB = evOf(b, 'outbound-blocked').length;
        ok('S5', blockedT === blockedB, 'outbound attempts (blocked by the test guard) equal on TEST and BASE', 'TEST=' + blockedT + ' BASE=' + blockedB);
    } finally { await Promise.all([stop(t), stop(b)]); }
}

// ── main ─────────────────────────────────────────────────────────────────────────────────────────────────────────
async function main() {
    console.log('NODE-CLUSTER-PRIMARY-RESPAWN-1 smoke  node ' + process.version + ' ' + process.platform);
    console.log('  TEST_ROOT=' + TEST_ROOT + '\n  BASE_ROOT=' + (BASE_ROOT || '(unset)') + '\n  ports=' + P(0) + '-' + P(9) + '  crash window=' + CRASH_S + ' s  groups=' + [...ONLY].join(',') + '\n  artefacts=' + OUT);
    fs.mkdirSync(OUT, { recursive: true });
    try {
        section('[H] harness');
        for (let i = 0; i < 10; i++) { const h = await health(P(i), 1500); ok('H', h === 0 && await portFree(P(i)), 'port ' + P(i) + ' is free before the run', 'health=' + h); }
        ok('H', fs.existsSync(path.join(TEST_ROOT, 'server.js')), 'TEST_ROOT has server.js');
        const groups = [['S0', scenarioS0], ['S1', scenarioS1], ['S2', scenarioS2], ['S3', scenarioS3], ['S4', scenarioS4],
            ['S4d', scenarioS4d], ['S4c', scenarioS4c], ['S6', scenarioS6], ['S5', scenarioS5]];
        for (const [g, fn] of groups) {
            if (!ONLY.has(g)) continue;
            try { await fn(); } catch (e) { ok(g, false, 'group ' + g + ' threw', e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e); }
        }
    } finally {
        section('[H] cleanup');
        for (const s of [...SERVERS]) await stop(s);
        const busy = [];
        for (let i = 0; i < 10; i++) { let free = false; for (let k = 0; k < 50 && !(free = await portFree(P(i))); k++) await sleep(200); if (!free) busy.push(P(i)); }
        const leftovers = processesWith(OUT);
        ok('H', SERVERS.size === 0 && busy.length === 0 && leftovers.length === 0, 'every server process tree killed; ports ' + P(0) + '-' + P(9) + ' free; 0 node processes left with a smoke preload',
            'busy=' + busy.join(',') + ' leftovers=' + JSON.stringify(leftovers.slice(0, 3)));
        let blocked = 0;
        for (const d of fs.existsSync(OUT) ? fs.readdirSync(OUT) : []) {
            const f = path.join(OUT, d, 'events.jsonl');
            if (fs.existsSync(f)) blocked += fs.readFileSync(f, 'utf8').split('\n').filter((l) => l.includes('"outbound-blocked"')).length;
        }
        let guardBlocked = 0; const guardHosts = new Set();
        for (const d of fs.existsSync(OUT) ? fs.readdirSync(OUT) : []) {
            const dir = path.join(OUT, d);
            if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue;
            for (const f of fs.readdirSync(dir)) {
                if (!/^outbound-\d+\.jsonl$/.test(f)) continue;
                for (const l of fs.readFileSync(path.join(dir, f), 'utf8').split('\n').filter(Boolean)) {
                    guardBlocked++;
                    try { const o = JSON.parse(l); if (o.host) guardHosts.add(String(o.host)); } catch (_) {}
                }
            }
        }
        console.log('  · MEASURED outbound attempts blocked by the in-suite guard across every server: ' + blocked + ' (nothing left loopback)');
        console.log('  · MEASURED outbound attempts blocked by the frozen harness guard.cjs' + (GUARD ? '' : ' (NOT LOADED)') + ': ' + guardBlocked
            + (guardHosts.size ? ' hosts=' + [...guardHosts].slice(0, 8).join(',') : '') + '  — guard=' + (GUARD || '(unset)'));
    }
    console.log('\n================================================================');
    if (RECOVERY.length) {
        console.log('  health recovery (owner item I) — MEASURED:');
        for (const r of RECOVERY) console.log('    ' + ('[' + r.label + ']').padEnd(7) + (r.ms === null ? 'NEVER RECOVERED' : (r.ms / 1000).toFixed(2).padStart(6) + ' s (' + r.ms + ' ms)') + '  ' + r.what + (r.note ? '  — ' + r.note : ''));
    }
    console.log('  per label:');
    for (const l of Object.keys(stats)) console.log('    ' + ('[' + l + ']').padEnd(7) + ' PASS ' + String(stats[l].pass).padStart(3) + '   FAIL ' + stats[l].fail);
    console.log('  NODE-CLUSTER-PRIMARY-RESPAWN-1 smoke   PASS ' + pass + '   FAIL ' + fail + '   (' + Math.round((Date.now() - t0) / 1000) + ' s)');
    fails.forEach((f) => console.log('    - ' + f));
    console.log('================================================================');
    process.exit(fail === 0 ? 0 : 1);
}
process.on('SIGINT', () => { for (const s of SERVERS) { if (s.child) killTree(s.child.pid); } process.exit(130); });
main();
