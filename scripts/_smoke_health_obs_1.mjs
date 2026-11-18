// HEALTH-OBSERVABILITY-1 -- smoke suite (functional, NOT a benchmark; 127.0.0.1 only, never production; a test-only preload
//   blocks every non-loopback socket, fetch and DNS lookup). The [health-obs] counters are measurement only, so this suite
//   proves three things: the counters count what they claim, nothing is created when the switch is off, and no response
//   changes by a single byte with the switch on or off.
//
//   [U1] unit: the primary's /proc parsers (tpHoParseTcp, tpHoParseNet, extracted from server.js) on synthetic
//        /proc/net/tcp, tcp6, netstat and snmp text: accept queue + backlog of the LISTEN socket on PORT, state counts on
//        PORT only, other ports ignored, the remote address never read into the result
//   [U2] unit: the worker half (extracted from server.js, run against stubs): the abort phases pre / mid / post / preR in
//        every order of close vs render-start point, the /health new-connection wait and handle times, the self-probe
//        apart, the acc buckets, the family cap, c0, the fixed keys and the 10 s slots of a flushed line
//   [A]  a real server, switch ON (2 workers, 10 s windows, 10 s self-probe): ENABLED lines; external /health arrivals
//        (new connections + keep-alive) counted exactly in h10; the self-probe answered and counted apart (hp); aborted
//        page requests: health-obs abN == the [req-family] 'abort' rows, by family; connections closed without a request
//        -> c0; fixed key sets; no address, path, query, cookie, User-Agent or marker text in any [health-obs] line
//   [B]  switch OFF: not one [health-obs] line; a preload records every timer, listener, histogram and http.request
//        created from a health-obs function (tpHo* / _ho*): 0 with the switch OFF, > 0 with it ON (the recorder works);
//        listener census (server connection / request / listening, process SIGTERM, cluster listening) OFF == production
//   [C]  byte identity: production (add3f98 tree, TP_BASE_ROOT), ON and OFF, each URL fetched base, on, off, base again,
//        identity / br / gzip: status, every header but Date (and the per-request CSP nonce), and the decoded body must be
//        identical; normalised only for the per-request nonce and /health's ts (a determinism gate first: base vs base)
//
// Usage: node scripts/_smoke_health_obs_1.mjs   (env TP_BASE_ROOT = the production tree, TP_GUARD = the guard,
//        TP_SMOKE_PORT_BASE = the first of 6 local ports, default 8760; TP_SMOKE_SKIP=U1,U2,A,B,C)
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import net from 'node:net';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { EventEmitter } from 'node:events';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_ROOT = process.env.TP_BASE_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/health-obs-1/base-add3f98';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const SKIP = new Set(String(process.env.TP_SMOKE_SKIP || '').split(',').filter(Boolean));
const PB = Number(process.env.TP_SMOKE_PORT_BASE || 8760);
const PORT = { on: PB, off: PB + 1, base: PB + 2, idOn: PB + 3, idOff: PB + 4, idBase: PB + 5 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-healthobs-'));
let pass = 0, fail = 0; const fails = []; const SEC = {};
function ok(label, cond, name, detail) {
    const s = SEC[label] || (SEC[label] = { pass: 0, fail: 0 });
    const n = '[' + label + '] ' + name;
    if (cond) { pass++; s.pass++; console.log('  PASS ' + n); }
    else { fail++; s.fail++; fails.push(n + (detail ? ' :: ' + detail : '')); console.log('  FAIL ' + n + (detail ? '  :: ' + String(detail).slice(0, 700) : '')); }
}
const info = (s) => console.log('  . INFO ' + s);
const section = (s) => console.log('\n-- ' + s + ' --');
const SRC = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const between = (a, b) => { const i = SRC.indexOf(a); const j = SRC.indexOf(b, i); if (i < 0 || j < 0) throw new Error('marker missing: ' + a); return SRC.slice(i, j); };

const PRIMARY_KEYS = 'p,win,t0,s,cpu,elu,eld,fd,tcp,net,probe';
const WORKER_KEYS = 'p,w,win,t0,s,k0,h10,hp,acc,conn,abN,ab';
const PROBE_KEYS = 'n,ok,to,ref,err,bad,skip,max,conn_max,last';

// =====================================================================================================================
if (!SKIP.has('U1')) {
    section('[U1] primary /proc parsers');
    const src = between('const tpHoParseTcp = (', '// end tpHoParse');
    const { tpHoParseTcp, tpHoParseNet } = new Function(src + '; return { tpHoParseTcp, tpHoParseNet };')();
    const hdr = '  sl  local_address rem_address   st tx_queue rx_queue tr tm->when retrnsmt   uid  timeout inode\n';
    // PORT 10000 = 0x2710; a LISTEN with 3 waiting / backlog 511, 2 ESTABLISHED, 1 SYN_RECV, 1 CLOSE_WAIT, 2 TIME_WAIT,
    //   1 FIN_WAIT1 (other); plus sockets on other ports (an outbound 443 connection, a listener on 8080) that must not count
    const tcp4 = hdr
        + '   0: 00000000:2710 00000000:0000 0A 000001FF:00000003 00:00000000 00000000  1000        0 1 1 0 100 0 0 10 0\n'
        + '   1: 0A00000B:2710 0B0A0A0A:D431 01 00000000:00000000 00:00000000 00000000  1000        0 2 1 0 20 4 30 10 -1\n'
        + '   2: 0A00000B:2710 0C0A0A0A:D432 01 00000000:00000000 00:00000000 00000000  1000        0 3 1 0 20 4 30 10 -1\n'
        + '   3: 0A00000B:2710 0D0A0A0A:D433 03 00000000:00000000 00:00000000 00000000  1000        0 0 1 0 20 4 30 10 -1\n'
        + '   4: 0A00000B:2710 0E0A0A0A:D434 08 00000000:00000000 00:00000000 00000000  1000        0 4 1 0 20 4 30 10 -1\n'
        + '   5: 0A00000B:2710 0F0A0A0A:D435 06 00000000:00000000 03:00000F9A 00000000     0        0 0 3 0\n'
        + '   6: 0A00000B:2710 100A0A0A:D436 06 00000000:00000000 03:00000F9A 00000000     0        0 0 3 0\n'
        + '   7: 0A00000B:2710 110A0A0A:D437 04 00000000:00000000 00:00000000 00000000  1000        0 5 1 0 20 4 30 10 -1\n'
        + '   8: 0A00000B:C350 22222222:01BB 01 00000000:00000000 00:00000000 00000000  1000        0 6 1 0 20 4 30 10 -1\n'
        + '   9: 00000000:1F90 00000000:0000 0A 00000080:00000009 00:00000000 00000000  1000        0 7 1 0 100 0 0 10 0';
    const c4 = tpHoParseTcp(tcp4, '2710', { lq: 0, bl: null, est: 0, syn: 0, cw: 0, tw: 0, oth: 0 });
    ok('U1', JSON.stringify(c4) === JSON.stringify({ lq: 3, bl: 511, est: 2, syn: 1, cw: 1, tw: 2, oth: 1 }), 'tcp4: listener queue/backlog + state counts on PORT only', JSON.stringify(c4));
    const tcp6 = hdr
        + '   0: 00000000000000000000000000000000:2710 00000000000000000000000000000000:0000 0A 000001FF:00000002 00:00000000 00000000  1000        0 11 1 0 100 0 0 10 0\n'
        + '   1: 0000000000000000FFFF00000B00000A:2710 0000000000000000FFFF00000B0A0A0A:D431 01 00000000:00000000 00:00000000 00000000  1000        0 12 1 0 20 4 30 10 -1\n';
    const c6 = tpHoParseTcp(tcp6, '2710', { ...c4 });
    ok('U1', c6.lq === 5 && c6.bl === 511 && c6.est === 3, 'tcp6 (dual-stack listener) adds to the same counters', JSON.stringify(c6));
    ok('U1', Object.keys(c6).join(',') === 'lq,bl,est,syn,cw,tw,oth' && Object.values(c6).every((v) => typeof v === 'number'), 'result holds counts only (no address field)', JSON.stringify(c6));
    const c0 = tpHoParseTcp(hdr, '2710', { lq: 0, bl: null, est: 0, syn: 0, cw: 0, tw: 0, oth: 0 });
    ok('U1', c0.lq === 0 && c0.bl === null && c0.est === 0, 'header only -> zeros, no backlog');
    const netstat = 'TcpExt: SyncookiesSent SyncookiesRecv ListenOverflows ListenDrops TCPBacklogDrop\nTcpExt: 0 0 17 21 3\nIpExt: InNoRoutes\nIpExt: 0\n';
    const snmp = 'Ip: Forwarding DefaultTTL\nIp: 1 64\nTcp: RtoAlgorithm RtoMin ActiveOpens EstabResets CurrEstab\nTcp: 1 200 50 9 4\nUdp: InDatagrams\nUdp: 5\n';
    const o = {};
    tpHoParseNet(netstat, 'TcpExt', [['lo', 'ListenOverflows'], ['ld', 'ListenDrops']], o);
    tpHoParseNet(snmp, 'Tcp', [['er', 'EstabResets']], o);
    ok('U1', JSON.stringify(o) === '{"lo":17,"ld":21,"er":9}', 'netstat/snmp: ListenOverflows, ListenDrops, EstabResets (TcpExt not mistaken for Tcp)', JSON.stringify(o));
    const o2 = tpHoParseNet('garbage', 'Tcp', [['er', 'EstabResets']], {});
    ok('U1', Object.keys(o2).length === 0, 'unreadable text -> nothing');
}

// =====================================================================================================================
let LAST_U2_LINES = [];
if (!SKIP.has('U2')) {
    section('[U2] worker half against stubs');
    const src = between('const _HO_ON = (() => {', 'function _hoStart() {');
    const mkEnv = () => {
        const logs = [];
        const stub = {
            _obsFamily: (p) => p.startsWith('/prayer-times-in-') ? 'prayer-city' : p.startsWith('/quran/') ? 'quran-surah' : p === '/health' ? 'health' : p.startsWith('/f') ? 'fam' + p.slice(2) : null,
            _OBS_404_UNKNOWN_FAMILIES: new Set(), TP_WORKER_ID: 7,
            server: { getConnections: (cb) => cb(null, 4) },
            console: { log: (l) => logs.push(l) },
        };
        const api = new Function('stub', 'const { _obsFamily, _OBS_404_UNKNOWN_FAMILIES, TP_WORKER_ID, server, console } = stub;\n' + src
            + '\n_hoStarted = true; _ho = _hoNew(0);\nreturn { _hoOnConn, _hoOnRequest, _hoMark, _hoFlush, get ho() { return _ho; } };')(stub);
        return { api, logs };
    };
    const { api, logs } = mkEnv();
    class Sock extends EventEmitter { constructor() { super(); this.destroyed = false; } }
    const mkReq = (url, sock, h = {}) => ({ url, socket: sock, headers: h });
    const mkRes = (req) => { const r = new EventEmitter(); r.req = req; r.writableFinished = false; r.headersSent = false; r.statusCode = 200; return r; };
    const run = (url, plan, h) => {
        const s = new Sock(); api._hoOnConn(s);
        const req = mkReq(url, s, h); const res = mkRes(req);
        api._hoOnRequest(req, res);
        for (const step of plan) {
            if (step === 'mark') api._hoMark(req, res);
            else if (step === 'gone') s.destroyed = true;
            else if (step === 'hdr') res.headersSent = true;
            else if (step === 'finish') res.writableFinished = true;
            else if (step === 'close') res.emit('close');
        }
        return { s, req, res };
    };
    run('/prayer-times-in-a', ['close']);                          // left before the mark, never rendered -> pre
    run('/prayer-times-in-b', ['close', 'mark']);                  // left before the mark, then rendered -> pre + preR
    run('/prayer-times-in-c', ['gone', 'mark', 'close']);          // socket already gone at the mark -> pre + preR
    run('/prayer-times-in-d?q=1', ['mark', 'close']);              // after the mark, no header yet -> mid
    run('/quran/x', ['mark', 'hdr', 'close']);                     // response started -> post
    run('/quran/y', ['mark', 'hdr', 'finish', 'close']);           // completed -> no abort
    run('/nothing', ['close']);                                     // unknown path, 200 -> other-valid, pre
    const ab = Object.fromEntries(api.ho.ab);
    ok('U2', JSON.stringify(ab['prayer-city']) === '[3,1,0,2]', 'prayer-city: pre 3 (one never rendered), mid 1, preR 2', JSON.stringify(ab));
    ok('U2', JSON.stringify(ab['quran-surah']) === '[0,0,1,0]', 'quran-surah: post 1; the completed response is not an abort', JSON.stringify(ab));
    ok('U2', JSON.stringify(ab['other-valid']) === '[1,0,0,0]', 'an unclassified path -> other-valid (the [req-family] resolution)', JSON.stringify(ab));
    // /health: new connection with a wait, a second request on the same connection, a probe
    const s1 = new Sock(); api._hoOnConn(s1);
    const t = Date.now(); while (Date.now() - t < 30) { /* a 30 ms wait between accept and request */ }
    let rq = mkReq('/health', s1); let rs = mkRes(rq); api._hoOnRequest(rq, rs); rs.writableFinished = true; rs.emit('close');
    rq = mkReq('/health', s1); rs = mkRes(rq); api._hoOnRequest(rq, rs); rs.writableFinished = true; rs.emit('close');
    const s2 = new Sock(); api._hoOnConn(s2);
    rq = mkReq('/health', s2, { 'x-tp-health-obs': '1' }); rs = mkRes(rq); api._hoOnRequest(rq, rs); rs.writableFinished = true; rs.emit('close');
    const s3 = new Sock(); api._hoOnConn(s3); s3.emit('close');     // a connection closed without a request
    const slots = [...api.ho.slots.values()];
    const hs = slots.reduce((a, e) => [a[0] + e[0], a[1] + e[1], Math.max(a[2], e[2]), Math.max(a[3], e[3])], [0, 0, 0, 0]);
    ok('U2', hs[0] === 2 && hs[1] === 1 && hs[2] >= 25, '/health: 2 arrivals, 1 on a new connection, its wait >= 25 ms', JSON.stringify(hs));
    ok('U2', api.ho.hp[0] === 1, 'the self-probe is counted apart (hp), not in h10', JSON.stringify(api.ho.hp));
    ok('U2', api.ho.acc.n === 7 && api.ho.acc.ka === 0 && api.ho.acc.b.reduce((x, y) => x + y, 0) === 7, 'acc: 7 page requests on new connections, all bucketed', JSON.stringify(api.ho.acc));
    ok('U2', api.ho.c0 === 1 && api.ho.cNew === 10, 'conn: 10 accepted, c0 = 1 (closed without a request)', api.ho.c0 + '/' + api.ho.cNew);
    // the family cap
    for (let i = 0; i < 80; i++) run('/f' + i, ['close']);
    ok('U2', api.ho.ab.size <= 65 && api.ho.ab.has('overflow'), 'abort families capped (64 + overflow)', String(api.ho.ab.size));
    api._hoFlush('w');
    const line = logs.find((l) => l.startsWith('[health-obs] {'));
    const o = line ? JSON.parse(line.slice(13)) : {};
    LAST_U2_LINES = logs.slice();
    ok('U2', Object.keys(o).join(',') === WORKER_KEYS, 'worker line: fixed keys', Object.keys(o).join(','));
    ok('U2', o.conn && o.conn.now === 4 && o.w === 7 && Array.isArray(o.h10) && o.h10.length >= 1 && o.h10.every((r) => r.length === 4), 'conn.now from getConnections, h10 rows of 4', line);
    ok('U2', !/\/|\?q=|prayer-times-in-/.test(line), 'no path or query text in the line', line);
    ok('U2', api.ho.ab.size === 0 && api.ho.slots.size === 0 && api.ho.open === api.ho.openMax, 'a flush starts a clean window (open connections carried over)');
    // final flushes only once
    api._hoFlush('final'); api._hoFlush('final');
    ok('U2', logs.filter((l) => /"win":"final"/.test(l)).length === 1, 'the final line is written once');
}

// =====================================================================================================================
// ---- servers ----
const kids = [];
const rawGet = (port, p, { method = 'GET', h = {}, timeout = 60000, agent = false } = {}) => new Promise((res) => {
    const r = http.request({ host: '127.0.0.1', port, path: p, method, headers: h, agent }, (x) => {
        const c = []; x.on('data', (d) => c.push(d)); x.on('end', () => res({ st: x.statusCode, h: x.headers, raw: Buffer.concat(c) }));
    });
    r.setTimeout(timeout, () => r.destroy(new Error('timeout')));
    r.on('error', (e) => res({ st: 0, h: {}, raw: Buffer.alloc(0), err: (e && (e.code || e.message)) || 'error' })); r.end();
});
const HOOK = path.join(TMP, 'ho-hook.cjs');
fs.writeFileSync(HOOK, `'use strict';
// test-only recorder: every timer / listener / histogram / http.request created from a health-obs function (tpHo* / _ho*)
const fs = require('fs'); const cluster = require('cluster'); const OUT = process.env.TP_HO_HOOK_OUT;
Error.stackTraceLimit = 40;
const RE = /\\b(tpHo[A-Za-z]*|_ho[A-Z][A-Za-z]*)\\b/;
const note = (what) => { const st = String(new Error().stack).split('\\n').slice(3).join('\\n'); const m = RE.exec(st);
  if (m) { try { fs.appendFileSync(OUT, JSON.stringify({ pid: process.pid, role: cluster.isPrimary ? 'p' : 'w', what, fn: m[1] }) + '\\n'); } catch (_e) {} } };
const wrap = (o, n, tag) => { const f = o[n]; const w = function (...a) { note(tag(a)); return f.apply(this, a); };
  for (const s of Object.getOwnPropertySymbols(f)) w[s] = f[s]; o[n] = w; };
for (const n of ['setTimeout', 'setInterval', 'setImmediate']) wrap(globalThis, n, () => n);
const EP = require('events').EventEmitter.prototype;
for (const n of ['on', 'addListener', 'once', 'prependListener', 'prependOnceListener']) wrap(EP, n, (a) => n + ':' + String(a[0]));
const ph = require('perf_hooks'); wrap(ph, 'monitorEventLoopDelay', () => 'monitorEventLoopDelay');
const http = require('http'); wrap(http, 'request', () => 'http.request');
// listener census, written once: workers 4 s after listening, the primary 12 s after start
const census = (o) => { try { fs.appendFileSync(OUT + '.census', JSON.stringify(o) + '\\n'); } catch (_e) {} };
if (cluster.isPrimary) {
  const t = setTimeout(() => census({ role: 'p', clusterListening: cluster.listenerCount('listening'), clusterExit: cluster.listenerCount('exit'),
    clusterMessage: cluster.listenerCount('message'), sigterm: process.listenerCount('SIGTERM'), sigint: process.listenerCount('SIGINT') }), 12000);
  t.unref();
} else {
  const net = require('net'); const L = net.Server.prototype.listen;
  net.Server.prototype.listen = function (...a) { const s = this;
    s.once('listening', () => { const t = setTimeout(() => census({ role: 'w', connection: s.listenerCount('connection'), request: s.listenerCount('request'),
      listening: s.listenerCount('listening'), sigterm: process.listenerCount('SIGTERM'), sigint: process.listenerCount('SIGINT'), message: process.listenerCount('message') }), 4000); t.unref(); });
    return L.apply(this, a); };
}
`);
async function boot(root, port, tag, extra = {}, workers = 1, hook = false) {
    if ((await rawGet(port, '/health', { timeout: 2000 })).st !== 0) throw new Error('port ' + port + ' already in use');
    const guardOut = path.join(TMP, 'guard-' + tag + '.log'); fs.writeFileSync(guardOut, '');
    const hookOut = path.join(TMP, 'hook-' + tag + '.log'); fs.writeFileSync(hookOut, ''); fs.writeFileSync(hookOut + '.census', '');
    const env = { ...process.env };
    for (const k of Object.keys(env)) if (/^(TP_|NODE_OPTIONS$|GA_MEASUREMENT_ID$|SUPABASE_|LOCATIONIQ_KEY$|DISCOVERED_SSR_TEST_FIXTURE$|RENDER$|RENDER_)/.test(k)) delete env[k];
    Object.assign(env, { PORT: String(port), WEB_CONCURRENCY: String(workers), ADSENSE_CLIENT: 'off', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '',
        NODE_ENV: 'production', SITE_URL: 'https://timesprayers.com', GUARD_OUT: guardOut, TP_HO_HOOK_OUT: hookOut }, extra);
    const args = hook ? ['-r', GUARD, '-r', HOOK, 'server.js'] : ['-r', GUARD, 'server.js'];
    const k = spawn(process.execPath, args, { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
    const srv = { tag, port, root, k, guardOut, hookOut, lines: [], buf: '' };
    const take = (d) => { srv.buf += d.toString('utf8'); let i; while ((i = srv.buf.indexOf('\n')) !== -1) { srv.lines.push(srv.buf.slice(0, i).replace(/\r$/, '')); srv.buf = srv.buf.slice(i + 1); } };
    k.stdout.on('data', take); k.stderr.on('data', take);
    kids.push(srv);
    for (let i = 0; i < 400; i++) { if ((await rawGet(port, '/health', { timeout: 3000 })).st === 200) break; await sleep(400); if (i === 399) throw new Error('boot failed ' + tag); }
    for (let i = 0; i < 100; i++) { if (srv.lines.filter((l) => /^Server running/.test(l)).length >= workers) break; await sleep(200); }
    return srv;
}
const killSrv = (srv) => { try { execFileSync('taskkill', ['/PID', String(srv.k.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} };
const hoObjs = (srv) => srv.lines.filter((l) => l.startsWith('[health-obs] {')).map((l) => JSON.parse(l.slice(13)));
// send a full request on a raw socket, then destroy it after `ms` (the server has the whole request)
const abortAfter = (port, p, ms, h = '') => new Promise((res) => {
    const s = net.connect(port, '127.0.0.1', () => {
        s.write('GET ' + p + ' HTTP/1.1\r\nHost: 127.0.0.1\r\nAccept-Encoding: br, gzip\r\n' + h + 'Connection: close\r\n\r\n');
        setTimeout(() => { s.destroy(); res(); }, ms);
    });
    s.on('data', () => {}); s.on('error', () => res());
});
const connNoReq = (port) => new Promise((res) => { const s = net.connect(port, '127.0.0.1', () => setTimeout(() => { s.destroy(); res(); }, 50)); s.on('error', () => res()); });
const sumAbortReqFamily = (srv) => {
    const out = {};
    for (const l of srv.lines.filter((x) => x.startsWith('[req-family] {'))) {
        const o = JSON.parse(l.slice(13));
        for (const r of o.rows) if (r[1] === 'abort') out[r[0]] = (out[r[0]] || 0) + r[2];
    }
    return out;
};

try {
    // =================================================================================================================
    if (!SKIP.has('A') || !SKIP.has('B')) {
        section('[A] switch ON: counting');
        const on = await boot(ROOT, PORT.on, 'on', { TP_HEALTH_OBS_S: '10', TP_HEALTH_OBS_PROBE_S: '10', TP_MOON_LOAD_OBS_WINDOW_S: '10' }, 2, true);
        const en = on.lines.filter((l) => /^\[health-obs\]( worker=\d+)? ENABLED/.test(l));
        ok('A', en.filter((l) => /p=primary/.test(l)).length === 1 && en.filter((l) => /p=w /.test(l)).length === 2, 'ENABLED: 1 primary + 2 workers', en.join(' | '));
        // let the first (partial) windows pass, then a clean start: wait for the next flush and only count after it
        const markLine = async () => { const n0 = on.lines.length; for (let i = 0; i < 150; i++) { if (on.lines.slice(n0).some((l) => l.startsWith('[health-obs] {"p":"primary"'))) break; await sleep(100); } await sleep(1500); return on.lines.length; };
        const from = await markLine();
        const ka = new http.Agent({ keepAlive: true, maxSockets: 1 });
        for (let i = 0; i < 6; i++) await rawGet(PORT.on, '/health');
        for (let i = 0; i < 4; i++) await rawGet(PORT.on, '/health', { agent: ka });
        ka.destroy();
        // markers that must never reach a line
        await rawGet(PORT.on, '/prayer-times-in-riyadh?MARKERQ1=1', { h: { cookie: 'MARKERCK1=1', 'user-agent': 'MARKERUA1/1.0 (Windows NT 10.0)', referer: 'https://MARKERREF.example/' } });
        // aborted page requests: the server has the whole request, the client leaves after 0-40 ms
        const abPaths = ['/prayer-times-in-riyadh', '/prayer-times-in-saudi-arabia', '/quran/al-baqarah', '/quran/al-kahf', '/en/prayer-times-in-makkah'];
        const ap = [];
        for (let i = 0; i < 30; i++) ap.push(abortAfter(PORT.on, abPaths[i % abPaths.length] + '?MARKERQ2=' + i, i % 4 === 0 ? 0 : (i % 40), 'User-Agent: MARKERUA2\r\n'));
        await Promise.all(ap);
        for (let i = 0; i < 5; i++) await connNoReq(PORT.on);
        // wait for two more flushes of every process (10 s windows) so every count above is in a line
        await sleep(23000);
        const objs = on.lines.slice(from).filter((l) => l.startsWith('[health-obs] {')).map((l) => JSON.parse(l.slice(13)));
        const W = objs.filter((o) => o.p === 'w'), P = objs.filter((o) => o.p === 'primary');
        const hN = W.reduce((s, o) => s + o.h10.reduce((a, r) => a + r[0], 0), 0);
        const hNew = W.reduce((s, o) => s + o.h10.reduce((a, r) => a + r[1], 0), 0);
        ok('A', hN === 10, 'external /health arrivals counted exactly (10)', String(hN));
        ok('A', hNew === 7, '... 7 of them on a new connection (6 + the keep-alive one\'s first)', String(hNew));
        ok('A', W.every((o) => o.h10.every((r) => r[2] >= 0 && r[3] >= 0 && r[2] < 5000 && r[3] < 5000)), 'wait / handle maxima are sane numbers');
        const prN = P.reduce((s, o) => s + (o.probe ? o.probe.n : 0), 0), prOk = P.reduce((s, o) => s + (o.probe ? o.probe.ok : 0), 0);
        const hpN = W.reduce((s, o) => s + o.hp[0], 0);
        ok('A', prN >= 2 && prOk === prN, 'self-probe: every probe answered 200 (' + prOk + '/' + prN + ')');
        ok('A', Math.abs(hpN - prN) <= 1, 'the workers saw the probes apart from external /health (hp ' + hpN + ' vs probe ' + prN + ', +-1 at a window edge)');
        const abHo = {};
        for (const o of W) for (const [f, e] of Object.entries(o.ab)) abHo[f] = (abHo[f] || 0) + e[0] + e[1] + e[2];
        const abRf = sumAbortReqFamily({ lines: on.lines.slice(from) });
        const abHoN = Object.values(abHo).reduce((a, b) => a + b, 0), abRfN = Object.values(abRf).reduce((a, b) => a + b, 0);
        ok('A', abHoN === abRfN && JSON.stringify(Object.keys(abHo).sort()) === JSON.stringify(Object.keys(abRf).sort())
            && Object.keys(abHo).every((f) => abHo[f] === abRf[f]), 'aborted requests: [health-obs] == [req-family] abort rows, family by family',
            JSON.stringify({ abHo, abRf }));
        info('aborts seen: ' + abHoN + ' of 30 sent (the rest finished before the client left); phases ' + JSON.stringify(W.reduce((a, o) => { for (const e of Object.values(o.ab)) for (let i = 0; i < 4; i++) a[i] += e[i]; return a; }, [0, 0, 0, 0])) + ' [pre,mid,post,preR]');
        const c0 = W.reduce((s, o) => s + o.conn.c0, 0);
        ok('A', c0 >= 5, 'connections closed without a request -> c0 (>= 5)', String(c0));
        ok('A', W.every((o) => Object.keys(o).join(',') === WORKER_KEYS), 'every worker line: fixed keys');
        ok('A', P.every((o) => Object.keys(o).join(',') === PRIMARY_KEYS && Object.keys(o.probe).join(',') === PROBE_KEYS
            && Object.keys(o.eld).join(',') === 'p99,max'), 'every primary line: fixed keys (eld p99/max, probe)');
        ok('A', P.every((o) => o.fd === null && o.tcp === null && o.net === null), 'Windows: fd / tcp / net are null (Linux /proc only)');
        const all = on.lines.filter((l) => l.startsWith('[health-obs]'));
        const bad = all.filter((l) => /MARKER|127\.0\.0\.1|::1|\/|Windows NT|Mozilla|cookie|riyadh|baqarah|makkah|saudi/i.test(l));
        ok('A', bad.length === 0, 'no address, path, query, cookie, User-Agent or marker text in ' + all.length + ' [health-obs] lines', bad.slice(0, 2).join(' | '));
        const maxLen = Math.max(...all.map((l) => l.length));
        info('largest [health-obs] line: ' + maxLen + ' bytes');
        const hookOn = fs.readFileSync(on.hookOut, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
        const kinds = [...new Set(hookOn.map((x) => x.role + ':' + x.what))].sort();
        ok('A', hookOn.some((x) => x.role === 'p') && hookOn.some((x) => x.role === 'w'), 'the recorder sees health-obs registrations when ON (' + hookOn.length + ')', kinds.join(' '));
        info('ON registrations: ' + kinds.join(' '));
        const censusOn = fs.readFileSync(on.hookOut + '.census', 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
        killSrv(on);

        section('[B] switch OFF: nothing created');
        const off = await boot(ROOT, PORT.off, 'off', { TP_HEALTH_OBS: 'off', TP_HEALTH_OBS_S: '10', TP_HEALTH_OBS_PROBE_S: '10', TP_MOON_LOAD_OBS_WINDOW_S: '10' }, 2, true);
        const base = await boot(BASE_ROOT, PORT.base, 'base', { TP_MOON_LOAD_OBS_WINDOW_S: '10' }, 2, true);
        for (const srv of [off, base]) {
            for (let i = 0; i < 6; i++) await rawGet(srv.port, '/health');
            await rawGet(srv.port, '/prayer-times-in-riyadh');
            const ps = []; for (let i = 0; i < 10; i++) ps.push(abortAfter(srv.port, abPaths[i % abPaths.length], i % 3 === 0 ? 0 : 15)); await Promise.all(ps);
            for (let i = 0; i < 3; i++) await connNoReq(srv.port);
        }
        await sleep(15000);
        ok('B', off.lines.filter((l) => l.startsWith('[health-obs]')).length === 0, 'OFF: not one [health-obs] line in ' + off.lines.length + ' lines');
        const hookOff = fs.readFileSync(off.hookOut, 'utf8').split('\n').filter(Boolean);
        ok('B', hookOff.length === 0, 'OFF: 0 timers / listeners / histograms / requests created from a health-obs function', hookOff.slice(0, 3).join(' | '));
        const cen = (srv) => fs.readFileSync(srv.hookOut + '.census', 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
        const cOff = cen(off), cBase = cen(base);
        const pick = (arr, role) => arr.filter((x) => x.role === role).map((x) => JSON.stringify(x));
        ok('B', pick(cOff, 'p').length === 1 && JSON.stringify(pick(cOff, 'p')) === JSON.stringify(pick(cBase, 'p')), 'primary listener census OFF == production', JSON.stringify({ off: pick(cOff, 'p'), base: pick(cBase, 'p') }));
        ok('B', pick(cOff, 'w').length === 2 && JSON.stringify(pick(cOff, 'w')) === JSON.stringify(pick(cBase, 'w')), 'worker listener census OFF == production (connection, request, listening, SIGTERM, SIGINT, message)', JSON.stringify({ off: pick(cOff, 'w'), base: pick(cBase, 'w') }));
        info('ON census: ' + JSON.stringify(censusOn));
        info('OFF census: ' + JSON.stringify(cOff));
        killSrv(off); killSrv(base);
    }

    // =================================================================================================================
    if (!SKIP.has('C')) {
        section('[C] byte identity: production vs ON vs OFF');
        const sOn = await boot(ROOT, PORT.idOn, 'id-on', { TP_HEALTH_OBS_S: '10', TP_HEALTH_OBS_PROBE_S: '10' }, 1);
        const sOff = await boot(ROOT, PORT.idOff, 'id-off', { TP_HEALTH_OBS: '0' }, 1);
        const sBase = await boot(BASE_ROOT, PORT.idBase, 'id-base', {}, 1);
        const URLS = ['/health', '/health?x=1', '/', '/en', '/fr/', '/prayer-times-in-riyadh', '/en/prayer-times-in-makkah', '/prayer-times-in-saudi-arabia',
            '/en/prayer-times-in-yemen', '/quran', '/quran/al-kahf', '/quran/al-baqarah', '/moon/saudi-arabia/riyadh/2026/06', '/moon/saudi-arabia/riyadh/2026',
            '/moon/saudi-arabia/riyadh', '/moon/saudi-arabia/riyadh/2026/06/15', '/qibla-in-riyadh', '/next-prayer-in-riyadh', '/today-hijri-date', '/hijri-calendar/1447',
            '/msbaha', '/azkar', '/robots.txt', '/ads.txt', '/sitemap.xml', '/js/app.js', '/css/style.css', '/sw.js', '/manifest.json', '/favicon.ico',
            '/prayer-times-in-riyadh/', '/index.html', '/no-such-page-xyz', '/moon/xx/yy/zz/1/2/3', '/api/search-place?q=riyadh'];
        const ENCS = ['', 'br', 'gzip'];
        const decode = (r) => { const e = r.h['content-encoding']; try { return e === 'br' ? zlib.brotliDecompressSync(r.raw) : e === 'gzip' ? zlib.gunzipSync(r.raw) : r.raw; } catch (_e) { return r.raw; } };
        const nonceOf = (r) => { const m = /'nonce-([A-Za-z0-9+/=_-]+)'/.exec(String(r.h['content-security-policy'] || r.h['content-security-policy-report-only'] || '')); return m ? m[1] : null; };
        const norm = (r, url) => {
            const n = nonceOf(r);
            let body = decode(r).toString('latin1');
            if (n) body = body.split(n).join('NONCE');
            if (url.startsWith('/health')) body = body.replace(/"ts":\d+/, '"ts":0');
            // the build hash: 'git rev-parse --short HEAD' of each tree ('dev' without git) -- a deploy changes it anyway
            //   ('dev' -- the production tree here is a git archive -- leaves the &b= parameter out altogether)
            body = body.replace(/[?&](?:amp;)?b=[0-9a-f]{7,12}\b/g, '');
            // render-time stamps (article:modified_time and friends carry the request's own millisecond; the city
            //   banner clock and next-prayer countdown their second)
            body = body.replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/g, 'TS').replace(/(id=\\?"(?:current-time|next-prayer-countdown)\\?">)\d\d:\d\d:\d\d/g, '$1HMS');
            const h = {};
            for (const [k, v] of Object.entries(r.h)) {
                if (k === 'date' || k === 'x-ratelimit-remaining' || k === 'x-ratelimit-reset') continue;   // the limiter's own per-server counters
                if (k === 'content-length' && r.h['content-encoding']) continue;          // compressed size follows the nonce bytes
                h[k] = n ? String(v).split(n).join('NONCE') : v;
            }
            if (url.startsWith('/health') && h['content-length']) h['content-length'] = 'L';   // ts digits
            return JSON.stringify({ st: r.st, h, body });
        };
        let same = 0, diff = 0, gate = 0; const diffs = [];
        const firstDiff = (x, y) => { let i = 0; while (i < x.length && x[i] === y[i]) i++; return JSON.stringify(x.slice(Math.max(0, i - 60), i + 60)) + ' vs ' + JSON.stringify(y.slice(Math.max(0, i - 60), i + 60)); };
        // a warm-up of every URL on every server first (the first render of a page fills the caches)
        for (const url of URLS) for (const enc of ENCS) for (const s of [sBase, sOn, sOff]) await rawGet(s.port, url, { h: enc ? { 'accept-encoding': enc } : {} });
        for (const url of URLS) for (const enc of ENCS) {
            const hh = enc ? { 'accept-encoding': enc } : {};
            const b1 = norm(await rawGet(sBase.port, url, { h: hh }), url);
            const a = norm(await rawGet(sOn.port, url, { h: hh }), url);
            const o = norm(await rawGet(sOff.port, url, { h: hh }), url);
            const b2 = norm(await rawGet(sBase.port, url, { h: hh }), url);
            if (b1 !== b2) { gate++; info('determinism gate: production differs from itself at ' + url + ' [' + (enc || 'identity') + '] -- skipped: ' + firstDiff(b1, b2)); continue; }
            if (a === b1 && o === b1) same++; else { diff++; diffs.push(url + ' [' + (enc || 'identity') + '] on=' + (a === b1) + ' off=' + (o === b1) + ' ' + firstDiff(b1, a === b1 ? o : a)); }
        }
        // HEAD /health too
        const hb = norm(await rawGet(sBase.port, '/health', { method: 'HEAD' }), '/health'), ho = norm(await rawGet(sOn.port, '/health', { method: 'HEAD' }), '/health'), hf = norm(await rawGet(sOff.port, '/health', { method: 'HEAD' }), '/health');
        if (hb === ho && hb === hf) same++; else { diff++; diffs.push('HEAD /health'); }
        ok('C', diff === 0, 'ON and OFF responses identical to production (' + same + ' url x encoding cases, ' + gate + ' skipped by the determinism gate)', diffs.join(' | '));
        ok('C', gate <= 2, 'the determinism gate skipped at most 2 cases', String(gate));
        // the raw /health bytes, apart from the ts digits, byte for byte
        const raw = async (port) => (await rawGet(port, '/health')).raw.toString('latin1').replace(/\d{13}/, 'T');
        const r0 = await raw(sBase.port), r1 = await raw(sOn.port), r2 = await raw(sOff.port);
        ok('C', r0 === r1 && r0 === r2 && r0 === '{"status":"ok","ts":T}', '/health body byte for byte (ts digits apart)', JSON.stringify([r0, r1, r2]));
        killSrv(sOn); killSrv(sOff); killSrv(sBase);
    }
} finally {
    for (const s of kids) killSrv(s);
    for (const s of kids) { const g = fs.existsSync(s.guardOut) ? fs.readFileSync(s.guardOut, 'utf8').trim() : ''; if (g) info('guard blocked outbound attempts (' + s.tag + '): ' + g.split('\n').length); }
}

console.log('\n== HEALTH-OBSERVABILITY-1 smoke: ' + pass + ' passed, ' + fail + ' failed ==');
for (const [k, v] of Object.entries(SEC)) console.log('   ' + k + ': ' + v.pass + ' pass, ' + v.fail + ' fail');
if (fail) { console.log('\nFailures:'); for (const f of fails) console.log('  - ' + f); process.exit(1); }
