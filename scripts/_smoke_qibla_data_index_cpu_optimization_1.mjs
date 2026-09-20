// QIBLA-DATA-INDEX-CPU-OPTIMIZATION-1 — smoke test for the lazy qibla slug -> nameEn index.
//
// The /qibla-in-* SSR used to scan every db/cities-*.json on each request to fill window.__QIBLA_CITY__.englishName.
// The tree under test (this checkout) builds that lookup once per worker, drops it in dbWrite(), and relays the drop to
// sibling workers through the cluster primary. This test proves the change is output-neutral against a REFERENCE tree
// (the pre-change code):
//   A. source contract: the handler no longer scans; the index, the dbWrite invalidation and the primary relay exist;
//   B. function-level equivalence: the reference scan (extracted verbatim) vs the new index (extracted verbatim) over
//      a stride of every city slug, every duplicate-slug case, every curated slug and deterministic invalid slugs, then
//      dbWrite() invalidation cases on a TEMP COPY of db/cities-*.json, plus a negative control proving sensitivity;
//   C. HTTP: reference and tree under test booted side by side; a deterministic /qibla-in-* sample + edge URLs must be
//      identical in status, headers (minus Date) and body after normalising ONLY the per-response CSP nonce, the &b=
//      build stamp and ISO timestamps (a reference-vs-reference gate proves that normaliser is sufficient);
//   D. runtime write across 2 workers: DISPOSABLE copies of both trees (no node_modules, no links) get an admin
//      POST /api/cities/add that changes the first-match nameEn of a live page; every worker of the tree under test
//      must serve exactly what the reference serves before and after the write.
//
// env: TP_BASE_ROOT (required) reference checkout, e.g. a worktree at the parent commit
//      TP_SMOKE_PORT (default 9250) uses PORT..PORT+3        TP_SMOKE_TMP (default os.tmpdir()) scratch parent dir
//      TP_SMOKE_SKIP_IPC=1 skips part D
// No request leaves loopback: a generated preload refuses non-loopback TCP/DNS/fetch and every attempt is counted (must be 0).
import { spawn, execSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REF = process.env.TP_BASE_ROOT ? path.resolve(process.env.TP_BASE_ROOT) : '';
const PORT = Number(process.env.TP_SMOKE_PORT || 9250);
const TMP_PARENT = process.env.TP_SMOKE_TMP || os.tmpdir();
const TAG = 'QIBLA-DATA-INDEX-CPU-OPTIMIZATION-1';

let pass = 0, fail = 0; const fails = [];
const ok = (c, m) => { if (c) pass++; else { fail++; fails.push(m); } console.log(`  ${c ? 'PASS' : 'FAIL'}  ${m}`); };
if (!REF || !fs.existsSync(path.join(REF, 'server.js'))) { console.error('TP_BASE_ROOT must point to a reference checkout containing server.js'); process.exit(2); }
fs.mkdirSync(TMP_PARENT, { recursive: true });
const WORK = fs.mkdtempSync(path.join(TMP_PARENT, 'tp-qibla-index-smoke-'));
const children = [];
const killAll = () => { for (const c of children) { try { execSync(`taskkill /PID ${c.pid} /T /F`, { stdio: 'ignore' }); } catch { try { process.kill(c.pid); } catch {} } } };
process.on('exit', killAll);

// ---------------------------------------------------------------- extraction helpers
const refSrc = fs.readFileSync(path.join(REF, 'server.js'), 'utf8');
const newSrc = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const NL = newSrc.includes('\r\n') ? '\r\n' : '\n';
const RNL = refSrc.includes('\r\n') ? '\r\n' : '\n';
function cutFn(src, nl, head) {
    const i = src.indexOf(head); if (i < 0) throw new Error('not found: ' + head);
    const j = src.indexOf(nl + '}' + nl, i); return src.slice(i, j + nl.length + 1 + nl.length);
}
function cutBetween(src, a, b) { const i = src.indexOf(a); const j = src.indexOf(b, i + a.length); if (i < 0 || j < 0) throw new Error('markers: ' + a); return src.slice(i, j); }

console.log(`\n${TAG} qibla index smoke\n  tree under test: ${ROOT}\n  reference:       ${REF}`);

// ================================================================ A. source contract
console.log('\n[A] source contract');
const refHandler = cutBetween(refSrc, "        let _dbNameEn = '';", '        qiblaRef = {');
const newHandler = cutBetween(newSrc, "        let _dbNameEn = '';", '        qiblaRef = {');
ok(/fs\.readdirSync\(DB_DIR\)/.test(refHandler), 'reference handler is the per-request scan (TP_BASE_ROOT is pre-change)');
ok(!/readdirSync|readFileSync|JSON\.parse/.test(newHandler) && /_getQiblaDbNameEnIndex\(\)\.get\(citySlug\) \|\| ''/.test(newHandler), 'handler does a Map lookup only (no readdir/readFile/JSON.parse)');
const idxStart = newSrc.indexOf('let _QIBLA_DB_NAME_EN_INDEX = null;');
const idxIf = newSrc.indexOf('if (cluster.isWorker) {', idxStart);
const indexBlock = idxStart >= 0 && idxIf >= 0 ? newSrc.slice(idxStart, newSrc.indexOf(NL + '}' + NL, idxIf) + NL.length + 1 + NL.length) : '';
ok(indexBlock.includes('function _getQiblaDbNameEnIndex()') && indexBlock.includes("process.on('message'") && newSrc.includes(TAG + ': worker-resident slug -> nameEn index'), 'worker-resident index + worker message listener present and tagged');
// EAGER BUILD (owner decision 2026-09-20): the index is built once per worker at startup, so no user request
//   pays for it. It must sit in worker-only code, before server.listen, and must not be awaited.
const eagerIdx = newSrc.indexOf(String.fromCharCode(10) + '_getQiblaDbNameEnIndex();');
const listenIdx = newSrc.indexOf('_preloadReady.then(');
const callSites = (newSrc.split('_getQiblaDbNameEnIndex(').length - 1);
ok(eagerIdx > 0 && listenIdx > 0 && eagerIdx < listenIdx, 'eager build call runs at startup, before server.listen');
ok(callSites === 3, 'exactly one definition + two call sites for _getQiblaDbNameEnIndex (found ' + callSites + ')');
ok(newSrc.slice(0, newSrc.indexOf('const TP_WORKER_ID')).indexOf('_getQiblaDbNameEnIndex') === -1, 'the cluster primary never builds the index');
const dbWriteText = cutFn(newSrc, NL, 'function dbWrite(cc, cities) {');
ok(/finally \{ _qiblaDbNameEnIndexChanged\(true\); \}/.test(dbWriteText), 'dbWrite() drops (and broadcasts) the index in a finally block');
const primary = newSrc.slice(0, newSrc.indexOf('const TP_WORKER_ID'));
ok(/cluster\.on\('message'/.test(primary) && primary.includes("'tp:cities-db-changed'") && /w === worker/.test(primary), 'cluster primary relays the change notice to the OTHER workers');
const writers = (newSrc.match(/\b(?:writeFileSync|writeFile|appendFileSync|appendFile|renameSync|rename|copyFileSync|copyFile|unlinkSync|unlink|rmSync|cpSync|createWriteStream)\(/g) || []);
ok(writers.length === 1 && dbWriteText.includes('fs.writeFileSync(dbFile(cc)'), `dbWrite is the only file-writing call in server.js (found ${writers.length})`);

// ================================================================ B. function-level equivalence
console.log('\n[B] function-level equivalence (reference scan vs new index)');
const mkSlugText = cutFn(newSrc, NL, 'function makeCitySlugSrv(nameEn, lat, lng) {');
ok(mkSlugText.replace(/\r\n/g, '\n') === cutFn(refSrc, RNL, 'function makeCitySlugSrv(nameEn, lat, lng) {').replace(/\r\n/g, '\n'), 'makeCitySlugSrv is unchanged');
const makeCitySlugSrv = new Function(mkSlugText + '; return makeCitySlugSrv;')();
const dbFileText = cutFn(newSrc, NL, 'function dbFile(cc) {');
function buildRef(dbDir, memo) {
    const f = new Function('fs', 'path', 'DB_DIR', 'makeCitySlugSrv', 'JSON', 'return function (citySlug) {' + refHandler + '; return _dbNameEn; };');
    if (!memo) return { scan: f(fs, path, dbDir, makeCitySlugSrv, JSON), clear() {} };
    // semantics-preserving memo (same file string -> same parsed array; pure slug fn memoised incl. throws)
    let files = new Map(), parsed = new Map(); const slugMemo = new Map(); const T = Symbol('t');
    const mfs = { readdirSync: (p) => fs.readdirSync(p), readFileSync: (p, e) => { if (files.has(p)) { const v = files.get(p); if (v instanceof Error) throw v; return v; } let v; try { v = fs.readFileSync(p, e); } catch (x) { files.set(p, x); throw x; } files.set(p, v); return v; } };
    const mjson = { parse: (s) => { if (parsed.has(s)) { const v = parsed.get(s); if (v instanceof Error) throw v; return v; } let v; try { v = JSON.parse(s); } catch (x) { parsed.set(s, x); throw x; } parsed.set(s, v); return v; } };
    const mslug = (n, la, lo) => { const k = typeof n === 'string' ? n + '' + la + '' + lo : null; if (k !== null && slugMemo.has(k)) { const v = slugMemo.get(k); if (v && v[T]) throw v.e; return v; } let v; try { v = makeCitySlugSrv(n, la, lo); } catch (e) { if (k !== null) slugMemo.set(k, { [T]: 1, e }); throw e; } if (k !== null) slugMemo.set(k, v); return v; };
    return { scan: f(mfs, path, dbDir, mslug, mjson), clear() { files = new Map(); parsed = new Map(); } };
}
function buildNew(dbDir) {
    const f = new Function('fs', 'path', 'DB_DIR', 'makeCitySlugSrv', 'cluster', 'invalidateSitemapCache',
        indexBlock + NL + dbFileText + NL + 'const _dbMemCache = new Map();' + NL + dbWriteText + NL +
        'return { lookup: function (citySlug) {' + newHandler + '; return _dbNameEn; }, dbWrite, peek: function () { return _QIBLA_DB_NAME_EN_INDEX; } };');
    return f(fs, path, dbDir, makeCitySlugSrv, { isWorker: false }, () => {});
}
function slugsOfDir(dbDir) {
    const all = [], dupDiff = []; const first = new Map();
    for (const f of fs.readdirSync(dbDir).filter((x) => /^cities-[a-z]{2}\.json$/.test(x))) {
        let arr; try { arr = JSON.parse(fs.readFileSync(path.join(dbDir, f), 'utf8')); } catch { continue; }
        if (!Array.isArray(arr)) continue;
        for (const c of arr) { if (!c) continue; let s; try { s = makeCitySlugSrv(c.nameEn, c.lat, c.lng); } catch { continue; }
            if (!first.has(s)) { first.set(s, c.nameEn); all.push(s); } else if (first.get(s) !== c.nameEn) dupDiff.push(s); }
    }
    return { all, dupDiff: [...new Set(dupDiff)] };
}
function prng(seed) { let x = seed >>> 0; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
function invalidSlugs(pool, n) {
    const r = prng(1790), out = new Set(['', '-', '__proto__', 'constructor', 'toString', 'valueOf', 'hasOwnProperty', '21.4n-39.8e', 'loc-21.4n-39.8e', 'Berlin', 'berlin-', 'so-paulo', 'x'.repeat(3000)]);
    const A = 'abcdefghijklmnopqrstuvwxyz0123456789-';
    while (out.size < n) { const b = pool[Math.floor(r() * pool.length)] || 'x'; const k = Math.floor(r() * 5);
        out.add(k === 0 ? b.toUpperCase() : k === 1 ? b + '-' + Math.floor(r() * 99) : k === 2 ? b.slice(0, -1) : k === 3 ? b + 'é' : Array.from({ length: 1 + Math.floor(r() * 20) }, () => A[Math.floor(r() * A.length)]).join('')); }
    return [...out];
}
const cmp = (label, ref, neu, slugs) => { let mm = 0, found = 0; const ex = []; for (const s of slugs) { const a = ref.scan(s), b = neu.lookup(s); if (a !== b) { mm++; if (ex.length < 3) ex.push(`${s.slice(0, 40)}: ${a} != ${b}`); } else if (a) found++; }
    ok(mm === 0, `${label}: ${slugs.length} slugs, ${found} found, ${mm} mismatches${ex.length ? ' e.g. ' + ex.join(' | ') : ''}`); return mm; };
{
    const realDb = path.join(ROOT, 'db');
    const { all, dupDiff } = slugsOfDir(realDb);
    const curated = (() => { try { return JSON.parse(fs.readFileSync(path.join(realDb, 'places', 'curated-places.json'), 'utf8')).map((e) => e && e.slug).filter((s) => typeof s === 'string'); } catch { return []; } })();
    const stride = all.filter((_, i) => i % 6 === 0);
    const inval = invalidSlugs(all, 600);
    const ref = buildRef(realDb, true), neu = buildNew(realDb);
    cmp('real db: every 6th city slug', ref, neu, stride);
    cmp('real db: every duplicate slug with a different nameEn (first-match order)', ref, neu, dupDiff);
    cmp('real db: every curated slug', ref, neu, curated);
    cmp('real db: deterministic invalid/random slugs', ref, neu, inval);
    const plain = buildRef(realDb, false); let d = 0; const sample = [...stride.slice(0, 40), ...dupDiff.slice(0, 20), ...inval.slice(0, 40)];
    for (const s of sample) if (plain.scan(s) !== ref.scan(s)) d++;
    ok(d === 0, `memoised reference == unmemoised reference scan on ${sample.length} slugs`);
    ok(neu.peek() instanceof Map && neu.peek().size > 0, `index cached after use (${neu.peek() ? neu.peek().size : 0} slugs)`);

    // invalidation on a TEMP COPY of db/cities-*.json
    const tmpDb = path.join(WORK, 'db'); fs.mkdirSync(tmpDb);
    for (const f of fs.readdirSync(realDb)) if (/^cities-[a-z]{2}\.json$/.test(f)) fs.copyFileSync(path.join(realDb, f), path.join(tmpDb, f));
    const tRef = buildRef(tmpDb, true), tNew = buildNew(tmpDb);
    const probe = () => [...new Set([...slugsOfDir(tmpDb).all.filter((_, i) => i % 25 === 0), ...slugsOfDir(tmpDb).dupDiff, 'berlin', 'zurich', 'after-throw', 'only-en', 'qiblatest-raw'])];
    const before = tNew.lookup('berlin');
    const origErr = console.error; console.error = () => {};
    const readArr = (cc) => JSON.parse(fs.readFileSync(path.join(tmpDb, `cities-${cc}.json`), 'utf8'));
    const ad = readArr('ad'); ad.push({ nameEn: 'BERLIN', lat: 42.55, lng: 1.6 }); tNew.dbWrite('ad', ad); tRef.clear();
    ok(tNew.peek() === null, 'dbWrite() dropped the cached index');
    ok(before !== 'BERLIN' && tNew.lookup('berlin') === 'BERLIN', `first match for "berlin" moved to the earlier file after dbWrite ("${before}" -> "${tNew.lookup('berlin')}")`);
    cmp("after dbWrite('ad')", tRef, tNew, probe());
    tNew.dbWrite('aa', [{ nameEn: 'Zürich', lat: 1, lng: 2 }, { nameEn: 12345, lat: 1, lng: 2 }, { nameEn: 'After Throw', lat: 1, lng: 2 }, { nameEn: 'Only En', lat: '1', lng: 2 }]); tRef.clear();
    ok(tNew.lookup('zurich') === 'Zürich' && tNew.lookup('after-throw') === '' && tNew.lookup('only-en') === '', 'new first file: accent first-match, part-way throw and string lat all behave like the scan');
    cmp("after dbWrite('aa') (throw part-way)", tRef, tNew, probe());
    const circ = [{}]; circ[0].self = circ; tNew.dbWrite('ab', circ); tRef.clear();
    cmp('after a dbWrite() whose JSON.stringify throws', tRef, tNew, probe());
    console.error = origErr;
    tNew.lookup('berlin');
    fs.writeFileSync(path.join(tmpDb, 'cities-ac.json'), JSON.stringify([{ nameEn: 'Qiblatest Raw', lat: 1, lng: 1 }])); tRef.clear();
    ok(tRef.scan('qiblatest-raw') === 'Qiblatest Raw' && tNew.lookup('qiblatest-raw') === '', 'NEGATIVE CONTROL: a write that bypasses dbWrite() is not seen (the comparison is sensitive)');
    tNew.dbWrite('ac', readArr('ac')); tRef.clear();
    cmp('after the next dbWrite() the index is exact again', tRef, tNew, probe());
    fs.mkdirSync(path.join(tmpDb, 'cities-qq.json'));   // readFileSync -> EISDIR while the index is being built
    console.error = () => {}; tNew.dbWrite('ac', readArr('ac')); console.error = origErr; tRef.clear();   // a legit write drops the cached index first
    cmp('I/O error (EISDIR) during build', tRef, tNew, ['berlin', 'zurich', 'qiblatest-raw', 'riyadh']);
    ok(tNew.peek() === null, 'an index built with an I/O error is not cached');
    fs.rmdirSync(path.join(tmpDb, 'cities-qq.json')); tRef.clear();
    cmp('after the I/O error clears', tRef, tNew, ['berlin', 'zurich', 'qiblatest-raw', 'riyadh']);
    ok(tNew.peek() instanceof Map, 'the next error-free build is cached again');
}

// ---------------------------------------------------------------- HTTP helpers
const NETBLOCK_LOG = path.join(WORK, 'netblock.log');
const PRELOAD = path.join(WORK, 'preload.cjs');
fs.writeFileSync(PRELOAD, `'use strict';
const net = require('net'), dns = require('dns'), fs = require('fs'), http = require('http'), cluster = require('cluster');
const LOOP = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0', '::', '']);
const isLoop = (h) => h == null || LOOP.has(String(h).toLowerCase());
const rec = (k, t) => { try { fs.appendFileSync(${JSON.stringify(NETBLOCK_LOG)}, k + ' ' + t + '\\n'); } catch (_) {} };
const oc = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...a) { let o = Array.isArray(a[0]) ? a[0][0] : a[0]; let h, p;
  if (o && typeof o === 'object') { h = o.host; p = o.path; } else if (typeof o === 'number' || /^\\d+$/.test(String(o))) { h = typeof a[1] === 'string' ? a[1] : undefined; } else if (typeof o === 'string') p = o;
  if (!p && !isLoop(h)) { rec('tcp', h); process.nextTick(() => { try { this.destroy(Object.assign(new Error('blocked'), { code: 'ECONNREFUSED' })); } catch (_) {} }); return this; }
  return oc.apply(this, a); };
const ol = dns.lookup; dns.lookup = function (h, ...r) { if (!isLoop(h)) { rec('dns', h); const cb = r[r.length - 1]; if (typeof cb === 'function') process.nextTick(cb, Object.assign(new Error('blocked'), { code: 'ENOTFOUND' })); return {}; } return ol.call(this, h, ...r); };
if (typeof fetch === 'function') { const of = fetch; globalThis.fetch = (i, n) => { let h = ''; try { h = new URL(typeof i === 'string' ? i : i.url).hostname; } catch (_) {} if (!isLoop(h)) { rec('fetch', h); return Promise.reject(new Error('blocked')); } return of(i, n); }; }
const ow = http.ServerResponse.prototype.writeHead;
if (process.env.TP_SMOKE_WORKER_TAG === '1') http.ServerResponse.prototype.writeHead = function (...a) { try { this.setHeader('X-Smoke-Worker', String((cluster.worker && cluster.worker.id) || 0)); } catch (_) {} return ow.apply(this, a); };
`);
function boot(root, port, extraEnv = {}) {
    const logFd = fs.openSync(path.join(WORK, `server-${port}.log`), 'w');
    const env = { ...process.env, PORT: String(port), SITE_URL: 'https://timesprayers.com', NODE_ENV: 'production', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '',
        SUPABASE_ANON_KEY: '', ADMIN_TOKEN: '', WEB_CONCURRENCY: '1', ...extraEnv };
    const c = spawn(process.execPath, ['-r', PRELOAD, 'server.js'], { cwd: root, env, stdio: ['ignore', logFd, logFd], windowsHide: true });
    children.push(c); return c;
}
const req = (port, p, { method = 'GET', headers = {}, body = null, agent } = {}) => new Promise((resolve) => {
    const r = http.request({ host: '127.0.0.1', port, path: p, method, agent, headers: { Host: 'timesprayers.com', 'X-Forwarded-Proto': 'https', ...headers } }, (res) => {
        const ch = []; res.on('data', (d) => ch.push(d)); res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(ch) }));
    });
    r.on('error', (e) => resolve({ status: -1, headers: {}, body: Buffer.from(String(e.message)) }));
    r.setTimeout(120000, () => r.destroy(new Error('timeout')));
    if (body) r.write(body); r.end();
});
async function waitUp(port) { for (let i = 0; i < 240; i++) { if ((await req(port, '/health')).status === 200) return true; await new Promise((r) => setTimeout(r, 500)); } return false; }
function norm(r) {
    const csp = String(r.headers['content-security-policy'] || '');
    const m = csp.match(/'nonce-([A-Za-z0-9+/=]+)'/);
    const fix = (s) => (m ? s.split(m[1]).join('__NONCE__') : s).replace(/(&(?:amp;)?b=)[0-9a-f]{7,40}\b/g, '$1__B__').replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})/g, '__ISO__');
    const h = Object.entries(r.headers).filter(([k]) => !['date', 'connection', 'keep-alive', 'x-smoke-worker'].includes(k)).map(([k, v]) => [k, fix(String(v))]).sort();
    return r.status + '\n' + JSON.stringify(h) + '\n' + fix(r.body.toString('latin1'));
}
const englishNameOf = (r) => { const m = r.body.toString('utf8').match(/window\.__QIBLA_CITY__=(\{.*?\});<\/script>/); try { return m ? JSON.parse(m[1]).englishName : null; } catch { return null; } };

// ================================================================ C. HTTP sample: reference vs tree under test
console.log('\n[C] HTTP byte identity (reference vs tree under test, 1 worker each)');
{
    const pRef = PORT, pNew = PORT + 1;
    boot(REF, pRef); boot(ROOT, pNew);
    const up = (await Promise.all([waitUp(pRef), waitUp(pNew)])).every(Boolean);
    ok(up, 'both servers booted');
    if (up) {
        const LANGS = ['', 'en/', 'fr/', 'tr/', 'ur/', 'de/', 'id/', 'es/', 'bn/', 'ms/'];
        const curated = JSON.parse(fs.readFileSync(path.join(ROOT, 'db', 'places', 'curated-places.json'), 'utf8')).map((e) => e.slug);
        const { all, dupDiff } = slugsOfDir(path.join(ROOT, 'db'));
        const curSet = new Set(curated);
        const sample = [
            ...curated.filter((_, i) => i % 13 === 0).map((s, i) => `/${LANGS[i % 10]}qibla-in-${s}`),
            ...dupDiff.slice(0, 20).map((s, i) => `/${LANGS[(i + 4) % 10]}qibla-in-${s}`),
            ...all.filter((s) => !curSet.has(s) && /^[a-z][a-z0-9-]*$/.test(s)).filter((_, i) => i % 400 === 0).map((s, i) => `/${LANGS[(i + 7) % 10]}qibla-in-${s}`),
            ...LANGS.map((l) => `/${l}qibla`),
            '/qibla-in-nowhereville', '/en/qibla-in-nowhere-12.34-56.78', '/qibla-in-constructor', '/qibla-in-constructor-12.3-45.6', '/qibla-in-Berlin',
            '/qibla-in-berlin/', '/qibla-in-makkah.html', '/qibla-in-loc-21.4n-39.8e', '/qibla-in-so-paulo', '/qibla-in-sao-paulo', '/qibla-in-berlin-52.52-13.40',
        ];
        const agentR = new http.Agent({ keepAlive: true, maxSockets: 4 }), agentN = new http.Agent({ keepAlive: true, maxSockets: 4 });
        let gateMm = 0;
        for (const p of sample.slice(0, 25)) { const a = await req(pRef, p, { agent: agentR }); const b = await req(pRef, p, { agent: agentR }); if (norm(a) !== norm(b)) gateMm++; }
        ok(gateMm === 0, `determinism gate: reference vs itself on 25 URLs after normalising nonce/&b=/ISO (${gateMm} diffs)`);
        let mm = 0, withCity = 0; const ex = []; let i = 0;
        await Promise.all(Array.from({ length: 4 }, async () => {
            while (i < sample.length) { const p = sample[i++];
                let [a, b] = await Promise.all([req(pRef, p, { agent: agentR }), req(pNew, p, { agent: agentN })]);
                if (norm(a) !== norm(b)) { [a, b] = await Promise.all([req(pRef, p, { agent: agentR }), req(pNew, p, { agent: agentN })]); if (norm(a) !== norm(b)) { mm++; if (ex.length < 3) ex.push(p); } }
                if (englishNameOf(b) !== null) withCity++; }
        }));
        ok(mm === 0, `${sample.length} URLs identical in status + headers + body (${withCity} carry __QIBLA_CITY__; ${mm} diffs${ex.length ? ': ' + ex.join(', ') : ''})`);
        agentR.destroy(); agentN.destroy();
    }
    killAll(); children.length = 0; await new Promise((r) => setTimeout(r, 1500));
}

// ================================================================ D. runtime write across 2 workers (disposable copies)
if (process.env.TP_SMOKE_SKIP_IPC === '1') {
    console.log('\n[D] skipped (TP_SMOKE_SKIP_IPC=1)');
} else {
    console.log('\n[D] admin write on a disposable copy, 2 workers: every worker must match the reference');
    const SKIP = new Set(['node_modules', '.git', 'reports', 'candidates']);
    const copyTree = (src, dst) => {
        fs.cpSync(src, dst, { recursive: true, dereference: false, filter: (s) => {
            const b = path.basename(s);
            if (SKIP.has(b) || b.endsWith('.bak')) return false;
            try { if (fs.lstatSync(s).isSymbolicLink()) return false; } catch { return false; }
            return true; } });
        return dst;
    };
    const token = crypto.randomBytes(18).toString('hex');
    const copies = { ref: copyTree(REF, path.join(WORK, 'ref')), neu: copyTree(ROOT, path.join(WORK, 'new')) };
    const nodePath = (root) => path.join(root, 'node_modules');
    const U = ['/en/qibla-in-berlin', '/qibla-in-qiblatest-island-10.5--30.5'];
    const observe = async (port, wantBoth) => {   // bursts of fresh connections until both worker ids answered every URL
        const seen = {};
        for (let burst = 0; burst < 60; burst++) {
            const rs = await Promise.all(Array.from({ length: 8 }, (_, k) => req(port, U[k % U.length], { headers: { Connection: 'close' }, agent: false }).then((r) => [U[k % U.length], r])));
            for (const [u, r] of rs) { const w = r.headers['x-smoke-worker'] || '?'; (seen[u] ||= {})[w] ||= { en: englishNameOf(r), norm: norm(r), status: r.status }; }
            if (U.every((u) => seen[u] && Object.keys(seen[u]).length >= wantBoth)) break;
        }
        return seen;
    };
    const run = async (label, root, port) => {
        boot(root, port, { WEB_CONCURRENCY: '2', ADMIN_TOKEN: token, NODE_PATH: nodePath(label === 'ref' ? REF : ROOT), TP_SMOKE_WORKER_TAG: '1' });
        if (!(await waitUp(port))) return null;
        await new Promise((r) => setTimeout(r, 1500));   // let the second worker come up
        const before = await observe(port, 2);
        const post = await req(port, '/api/cities/add?cc=ad', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify([{ nameAr: 'برلين اختبار', nameEn: 'BERLIN', lat: 42.55, lng: 1.6, type: 'city' }, { nameAr: 'جزيرة اختبار', nameEn: 'QiblaTest ISLAND', lat: 42.56, lng: 1.61, type: 'city' }]) });
        const after = await observe(port, 2);
        return { before, after, post: post.status, postBody: post.body.toString() };
    };
    const R = await run('ref', copies.ref, PORT + 2);
    const N = await run('neu', copies.neu, PORT + 3);
    ok(!!R && !!N, 'both disposable copies booted with 2 workers');
    if (R && N) {
        ok(R.post === 200 && N.post === 200, `admin POST /api/cities/add answered 200 on both (${R.postBody} | ${N.postBody})`);
        for (const phase of ['before', 'after']) for (const u of U) {
            const rw = Object.keys(R[phase][u] || {}), nw = Object.keys(N[phase][u] || {});
            ok(nw.length >= 2, `${phase} ${u}: tree under test answered from ${nw.length} workers (${nw.join(',')})`);
            const refVals = new Set(rw.map((w) => R[phase][u][w].norm));
            ok(refVals.size === 1, `${phase} ${u}: reference workers agree with each other`);
            const refNorm = [...refVals][0];
            const bad = nw.filter((w) => N[phase][u][w].norm !== refNorm);
            ok(bad.length === 0, `${phase} ${u}: every worker of the tree under test is byte-identical to the reference (englishName ${nw.map((w) => w + '=' + JSON.stringify(N[phase][u][w].en)).join(' ')})`);
        }
        ok(N.before[U[0]] && Object.values(N.before[U[0]]).every((x) => x.en !== 'BERLIN') && Object.values(N.after[U[0]]).every((x) => x.en === 'BERLIN'),
            'the write really changed the first-match englishName on every worker ("BERLIN" after, not before)');
        ok(Object.values(N.after[U[1]]).every((x) => x.en === 'QiblaTest ISLAND'), 'a slug that did not exist before resolves on every worker after the write');
    }
    killAll(); children.length = 0; await new Promise((r) => setTimeout(r, 1500));
}

const attempts = (() => { try { return fs.readFileSync(NETBLOCK_LOG, 'utf8').split('\n').filter(Boolean).length; } catch { return 0; } })();
ok(attempts === 0, `no outbound (non-loopback) network attempt from any server (${attempts})`);
killAll();
if (fail === 0) { try { fs.rmSync(WORK, { recursive: true, force: true }); } catch (e) { console.log('  (could not remove ' + WORK + ': ' + e.message + ')'); } } else console.log('  logs kept in ' + WORK);
console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} pass, ${fail} fail`);
if (fail) { for (const f of fails) console.log('  - ' + f); process.exit(1); }
process.exit(0);
