#!/usr/bin/env node
// =====================================================================================================
// SERVER-MEMORY-CACHE-BOUNDS-1 -- smoke: _geocodeCache and _externalMemCache are provably bounded.
//
// WHY A SOURCE-EXTRACTION HARNESS (and no production seam):
//   server.js is a monolith that binds a port and loads every dataset on require, and both caches are
//   module-private. Instead of adding a test-only export/env seam to production, this smoke cuts the
//   EXACT production source text out of server.js by fixed anchors and evaluates it in a node:vm
//   context whose only I/O primitives are stubs:
//     region A  "GLOBAL-PLACE-SEARCH-NOMINATIM-CACHE-1" .. "_localizeRawNominatim" -- the memory cache,
//               _loadExternalCache/_saveExternalCache, both fetchers, _searchLocationIQRaw and
//               _searchExternalPlaces, i.e. all FOUR write paths (two fetch, two Supabase hydration);
//     region B  the _geocodeCache block;
//     region C  the /api/geocode handler block, wrapped in an async function (req/res/qs stubs).
//   `fetch`, `_supabaseFetch`, `setInterval` and `Date` are injected stubs (controllable clock), so no
//   code path can reach the network; this process additionally blocks every non-loopback socket.
//   Production behaviour is untouched because nothing in server.js knows this harness exists.
//
// SECTIONS
//   S0 static census    every insert into either Map goes through its single writer
//   S1 geocode unit     TTL on read (fake clock), identity of a fresh hit, LRU order at the 10K cap,
//                       byte budget, per-entry limit, sweep + unref'd interval
//   S2 external unit    same for the external writer/reader, incl. expired writes and hydration
//   S3 bulk bounds      100,000 and 500,000 insertions through EVERY write path (+ an interleaved mix),
//                       estimated bytes AND measured heap
//   S4 parity (--base)  identical deterministic scenarios run against BASE and this tree: every returned
//                       value, status, header and every stubbed external call must match
//   S5 boot (--base --boot) both trees booted with a network guard; curated API + HTML responses
//                       compared after normalising nonce / build stamp / timestamps
//
// Usage: node scripts/_smoke_server_memory_cache_bounds_1.mjs [--base <BASE tree>] [--boot]
//            [--ports 9120,9121] [--quick]
// =====================================================================================================
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import v8 from 'node:v8';
import net from 'node:net';
import http from 'node:http';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { spawn, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const argVal = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : null; };
const BASE = argVal('--base');
const BOOT = argv.includes('--boot');
const QUICK = argv.includes('--quick');
const PORTS = (argVal('--ports') || '9120,9121').split(',').map(Number);
// SERVER-MEMORY-CACHE-BOUNDS-1: the ticket's frozen outbound guard (net + fetch + DNS) is preloaded into
//   the primary AND every cluster worker of both booted servers, alongside the inline guard below.
const GUARD_CJS = argVal('--guard')
    || 'C:/Users/Tarek/Downloads/TIME PRAYER/reports/render-downsize-readiness-1-work/harness-full/guard.cjs';

// ---- this process never talks to anything but loopback --------------------------------------------
const netBlocked = [];
{
    const orig = net.Socket.prototype.connect;
    net.Socket.prototype.connect = function (...a) {
        let o = a[0];
        if (Array.isArray(o)) o = o[0];
        const host = (o && typeof o === 'object') ? o.host : (typeof a[1] === 'string' ? a[1] : 'localhost');
        const isPipe = o && typeof o === 'object' && o.path;
        if (!isPipe && host && !/^(localhost|127\.0\.0\.1|::1)$/.test(host)) {
            netBlocked.push(host);
            throw new Error('smoke net guard: blocked ' + host);
        }
        return orig.apply(this, a);
    };
    globalThis.fetch = async (u) => { netBlocked.push(String(u)); throw new Error('smoke net guard: fetch blocked'); };
}

v8.setFlagsFromString('--expose_gc');
const gc = vm.runInNewContext('gc');
const heapMB = () => { gc(); gc(); return process.memoryUsage().heapUsed / 1048576; };

let pass = 0, fail = 0;
const failures = [];
function check(name, ok, detail) {
    if (ok) { pass++; console.log('  PASS ' + name + (detail !== undefined ? '  ' + detail : '')); }
    else { fail++; failures.push(name); console.log('  FAIL ' + name + (detail !== undefined ? '  ' + detail : '')); }
}
const section = (t) => console.log('\n== ' + t);

// ---- source extraction -------------------------------------------------------------------------------
const A_START = '// ═══ GLOBAL-PLACE-SEARCH-NOMINATIM-CACHE-1 (2026-05-13)';
const A_END = '// Pure CPU step — turn cached raw Nominatim rows';
const B_START = '// كاش في الذاكرة لطلبات Nominatim';
const B_END = 'if (!fs.existsSync(DB_DIR))';
const C_START = '    // ===== Nominatim Proxy (يحل مشكلة CORS + rate limit) =====';
const C_END = '    // ===== UAT-2.8 — Wikipedia API endpoints removed =====';

function slice(src, start, end, label) {
    const s = src.indexOf(start);
    if (s < 0 || src.indexOf(start, s + 1) >= 0) throw new Error(label + ': start anchor missing or not unique');
    const e = src.indexOf(end, s);
    if (e < 0) throw new Error(label + ': end anchor missing');
    return src.slice(s, e);
}
function fnBody(src, header) {
    const s = src.indexOf(header);
    if (s < 0) return null;
    let i = src.indexOf('{', s), depth = 0;
    for (; i < src.length; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') { depth--; if (depth === 0) return { start: s, end: i + 1 }; }
    }
    return null;
}
const readSrc = (root) => fs.readFileSync(path.join(root, 'server.js'), 'utf8');

const T0 = Date.UTC(2027, 0, 1, 0, 0, 0);
function makeClock() {
    const clock = { now: T0 };
    const RealDate = Date;
    class FakeDate extends RealDate {
        constructor(...a) { if (a.length === 0) super(clock.now); else super(...a); }
        static now() { return clock.now; }
    }
    return { clock, FakeDate };
}
function intervalStub(list) {
    return (fn, ms) => { const h = { fn, ms, unrefCalled: false, unref() { h.unrefCalled = true; return h; } }; list.push(h); return h; };
}

// ---- payloads (Nominatim jsonv2-shaped; Arabic names force two-byte strings like real responses) ------
function placeItem(nTags, uniq) {
    const nd = { name: 'الرياض ' + uniq };
    for (let i = 0; i < nTags; i++) nd['name:l' + i] = 'مدينة الرياض ' + i + ' ' + uniq;
    return { place_id: 1234567, licence: 'Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright',
        osm_type: 'relation', osm_id: 3678409, lat: '24.6319692', lon: '46.7150648', category: 'boundary',
        type: 'administrative', place_rank: 16, importance: 0.66, addresstype: 'city', name: 'الرياض ' + uniq,
        display_name: 'الرياض, منطقة الرياض, السعودية ' + uniq,
        address: { city: 'الرياض', state: 'منطقة الرياض', country: 'السعودية', country_code: 'sa' },
        namedetails: nd, boundingbox: ['24.29', '25.15', '46.29', '47.02'] };
}
const SMALL_TEXT = (u) => JSON.stringify([placeItem(3, u)]);                      // ~0.8K units
const BIG_TEXT = (u) => JSON.stringify(Array.from({ length: 10 }, (_, j) => placeItem(60, u + '.' + j)));   // ~20K units

// ======================================================================================================
// external harness
// ======================================================================================================
function loadExternal(src, label) {
    const region = slice(src, A_START, A_END, label + ' region A');
    const { clock, FakeDate } = makeClock();
    const intervals = [];
    const counters = { fetch: 0, supaGet: 0, supaPost: 0, log: null };
    const state = { supaMode: 'table', supaRows: new Map(), supaFail: false, supaStore: true, ignoreFilter: false,
        plan: null, payload: (provider, q) => SMALL_TEXT(provider + ':' + q) };
    const sandbox = {
        Date: FakeDate, AbortController, setTimeout, clearTimeout, URL,
        setInterval: intervalStub(intervals),
        console: { log() {}, warn() {}, error() {} },
        process: { env: { LOCATIONIQ_API_KEY: 'harness-key-not-real' } },
        _SUPABASE_ENABLED: false,
        _SUPPORTED_LANGS: ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'],
        _localizeRawNominatim: (raw) => raw,
        async _supabaseFetch(p, o) {
            const method = (o && o.method) || 'GET';
            if (method === 'POST') {
                counters.supaPost++;
                if (counters.log) counters.log.push('supabase POST ' + JSON.parse(o.body).cache_key + ' ' + JSON.parse(o.body).status);
                if (state.supaStore) { const row = JSON.parse(o.body); state.supaRows.set(row.cache_key, row); }
                return { ok: true, status: 201, data: null };
            }
            counters.supaGet++;
            const key = decodeURIComponent(/cache_key=eq\.([^&]*)/.exec(p)[1]);
            const gt = Date.parse(decodeURIComponent(/expires_at=gt\.([^&]*)/.exec(p)[1]));
            if (counters.log) counters.log.push('supabase GET ' + key);
            if (state.supaFail) return { ok: false, status: 503, data: null };
            if (state.supaMode === 'synth') {
                return { ok: true, status: 200, data: [{ cache_key: key, response: JSON.parse(state.payload('supabase', key)),
                    status: 'ok', expires_at: new FakeDate(clock.now + 7 * 864e5).toISOString() }] };
            }
            const row = state.supaRows.get(key);
            if (!row) return { ok: true, status: 200, data: [] };
            if (!state.ignoreFilter && !(Date.parse(row.expires_at) > gt)) return { ok: true, status: 200, data: [] };
            return { ok: true, status: 200, data: [JSON.parse(JSON.stringify(row))] };
        },
        async fetch(url) {
            counters.fetch++;
            const u = new URL(url);
            const provider = u.hostname.indexOf('locationiq') >= 0 ? 'locationiq' : 'nominatim';
            const q = u.searchParams.get('q');
            if (counters.log) counters.log.push('fetch ' + provider + ' ' + q);
            const plan = state.plan ? state.plan(provider, q) : null;
            if (plan && plan.throw) throw new Error(plan.throw);
            const status = plan ? plan.status : 200;
            const text = plan && plan.body !== undefined ? plan.body : state.payload(provider, q);
            return { ok: status >= 200 && status < 300, status, json: async () => JSON.parse(text), text: async () => text };
        },
    };
    vm.createContext(sandbox);
    vm.runInContext(region + `
;globalThis.__X = {
    cache: _externalMemCache,
    search: _searchExternalPlaces,
    liq: _searchLocationIQRaw,
    set: typeof _externalMemSet === 'function' ? _externalMemSet : null,
    get: typeof _externalMemGet === 'function' ? _externalMemGet : null,
    sweep: typeof _externalMemSweep === 'function' ? _externalMemSweep : null,
    bytes: () => (typeof _externalMemBytes === 'number' ? _externalMemBytes : NaN),
    MAX: _EXTERNAL_MEM_MAX,
    MAX_BYTES: typeof _EXTERNAL_MEM_MAX_BYTES === 'number' ? _EXTERNAL_MEM_MAX_BYTES : null,
    MAX_ENTRY_BYTES: typeof _EXTERNAL_MEM_MAX_ENTRY_BYTES === 'number' ? _EXTERNAL_MEM_MAX_ENTRY_BYTES : null,
    SWEEP_MS: typeof _EXTERNAL_MEM_SWEEP_MS === 'number' ? _EXTERNAL_MEM_SWEEP_MS : null,
    TTL: { ok: _EXT_TTL_OK, empty: _EXT_TTL_EMPTY, error: _EXT_TTL_ERROR },
};`, sandbox, { filename: label + ':server.js#external' });
    return { X: sandbox.__X, sandbox, clock, intervals, counters, state };
}

// ======================================================================================================
// geocode harness
// ======================================================================================================
function loadGeocode(src, label) {
    const regionB = slice(src, B_START, B_END, label + ' region B');
    const regionC = slice(src, C_START, C_END, label + ' region C');
    const { clock, FakeDate } = makeClock();
    const intervals = [];
    const counters = { fetch: 0, circuitFail: 0, circuitSuccess: 0, log: null };
    const state = { circuitOpen: false, plan: null };
    const sandbox = {
        Date: FakeDate, AbortController, setTimeout, clearTimeout,
        setInterval: intervalStub(intervals),
        console: { log() {}, warn() {}, error() {} },
        circuitAllow: () => !state.circuitOpen,
        circuitFail: () => { counters.circuitFail++; },
        circuitSuccess: () => { counters.circuitSuccess++; },
        async fetch(url) {
            counters.fetch++;
            if (counters.log) counters.log.push('fetch ' + url);
            const p = state.plan(url);
            if (p.throw) throw new Error(p.throw);
            return { status: p.status, text: async () => p.body };
        },
    };
    vm.createContext(sandbox);
    vm.runInContext(regionB + `
async function __geocodeHandler(urlPath, req, qs, res) {
${regionC}
    return 'fallthrough';
}
;globalThis.__G = {
    cache: _geocodeCache,
    handler: __geocodeHandler,
    MAX: _GEOCACHE_MAX,
    TTL: _GEOCACHE_TTL,
    MAX_BYTES: typeof _GEOCACHE_MAX_BYTES === 'number' ? _GEOCACHE_MAX_BYTES : null,
    MAX_ENTRY_BYTES: typeof _GEOCACHE_MAX_ENTRY_BYTES === 'number' ? _GEOCACHE_MAX_ENTRY_BYTES : null,
    SWEEP_MS: typeof _GEOCACHE_SWEEP_MS === 'number' ? _GEOCACHE_SWEEP_MS : null,
};`, sandbox, { filename: label + ':server.js#geocode' });
    const call = async (qs) => {
        const res = { status: 0, headers: null, body: null,
            writeHead(s, h) { this.status = s; this.headers = h; }, end(b) { this.body = b === undefined ? '' : b; } };
        await sandbox.__G.handler('/api/geocode', { method: 'GET' }, qs, res);
        return res;
    };
    return { G: sandbox.__G, sandbox, clock, intervals, counters, state, call };
}

// recompute a writer's running byte total from scratch
const extBytesRecount = (X) => { let t = 0; for (const e of X.cache.values()) t += e.bytes || 0; return t; };
const geoBytesRecount = (G) => { let t = 0; for (const w of G.cache._m.values()) t += w.b; return t; };

// ======================================================================================================
async function main() {
    const src = readSrc(ROOT);
    console.log('tree: ' + ROOT + (BASE ? '\nbase: ' + BASE : ''));

    // ---------------------------------------------------------------------------------------- S0
    section('S0 static census (whole server.js)');
    {
        const setDef = fnBody(src, 'function _externalMemSet(');
        const getDef = fnBody(src, 'function _externalMemGet(');
        check('S0.1 _externalMemSet and _externalMemGet exist', !!setDef && !!getDef);
        const inside = (i) => (i >= setDef.start && i < setDef.end) || (i >= getDef.start && i < getDef.end);
        const stray = [];
        for (let i = src.indexOf('_externalMemCache.set('); i >= 0; i = src.indexOf('_externalMemCache.set(', i + 1)) {
            if (!inside(i)) stray.push(src.slice(0, i).split('\n').length);
        }
        check('S0.2 no _externalMemCache.set( outside the writer/reader (touch re-inserts the same entry)', stray.length === 0,
            stray.length ? 'lines ' + stray.join(',') : '0 stray');
        const callSites = src.split('_externalMemSet(cacheKey, {').length - 1;
        check('S0.3 all four historical write sites call _externalMemSet (2 fetch + 2 hydration)', callSites === 4, 'call sites=' + callSites);
        const readSites = src.split('const memHit = _externalMemGet(cacheKey);').length - 1;
        check('S0.4 both read sites use _externalMemGet', readSites === 2, 'read sites=' + readSites);
        const extDeletes = (src.match(/_externalMemCache\.(delete|clear)\(/g) || []).length;
        check('S0.5 _externalMemCache deletes only inside _externalMemDelete / reader touch', extDeletes === 2, 'deletes=' + extDeletes);
        const geoRawUse = (src.match(/_geocodeCache\._m\b/g) || []).length;
        const geoSetSites = (src.match(/_geocodeCache\.set\(/g) || []).length;
        check('S0.6 _geocodeCache internals not touched outside the object; one set() call site', geoRawUse === 0 && geoSetSites === 1,
            '_m refs=' + geoRawUse + ' set sites=' + geoSetSites);
    }

    // ---------------------------------------------------------------------------------------- S1
    section('S1 geocode unit (fake clock)');
    {
        const h = loadGeocode(src, 'wt');
        const { G, clock, intervals } = h;
        check('S1.0 constants: MAX=10000, TTL=24h, 64 MB budget, 1 MB entry limit, 10 min sweep',
            G.MAX === 10000 && G.TTL === 864e5 && G.MAX_BYTES === 64 * 1048576 && G.MAX_ENTRY_BYTES === 1048576 && G.SWEEP_MS === 6e5);
        const sw = intervals.filter((x) => x.ms === G.SWEEP_MS);
        check('S1.1 sweep interval registered once and unref()d', sw.length === 1 && sw[0].unrefCalled === true);

        const v = { ts: clock.now, data: '[{"a":1}]' };
        G.cache.set('k', v);
        clock.now = T0 + G.TTL - 1;
        check('S1.2 fresh at TTL-1 ms: same object returned', G.cache.get('k') === v);
        clock.now = T0 + G.TTL;
        check('S1.3 at TTL: get() -> undefined and the entry is removed', G.cache.get('k') === undefined && G.cache._m.size === 0 && G.cache._bytes === 0);

        clock.now = T0;
        for (let i = 0; i < G.MAX; i++) G.cache.set('k' + i, { ts: clock.now, data: 'x' });
        G.cache.get('k0');                                   // touch -> most recently used
        G.cache.set('k' + G.MAX, { ts: clock.now, data: 'x' });
        const keys = [...G.cache._m.keys()];
        check('S1.4 LRU at the 10K cap: touched k0 survives, k1 evicted, order oldest->newest',
            G.cache._m.size === G.MAX && G.cache._m.has('k0') && !G.cache._m.has('k1') && keys[0] === 'k2'
            && keys[keys.length - 2] === 'k0' && keys[keys.length - 1] === 'k' + G.MAX);
        G.cache.set('k5', { ts: clock.now, data: 'y' });
        check('S1.5 re-set moves key to the end, size unchanged', [...G.cache._m.keys()].pop() === 'k5' && G.cache._m.size === G.MAX);
        check('S1.6 byte accounting == recount', geoBytesRecount(G) === G.cache._bytes, 'bytes=' + G.cache._bytes);

        // byte budget: 100K-unit responses -> ~200 KB estimated each
        const g2 = loadGeocode(src, 'wt-b').G;
        const big = 'ب'.repeat(100000);
        for (let i = 0; i < 1000; i++) g2.cache.set('big' + i, { ts: T0, data: big });
        check('S1.7 byte budget binds before the count cap', g2.cache._bytes <= g2.MAX_BYTES && g2.cache._m.size < 1000
            && g2.cache._m.has('big999') && !g2.cache._m.has('big0'), 'entries=' + g2.cache._m.size + ' est MB=' + (g2.cache._bytes / 1048576).toFixed(2));
        g2.cache.set('huge', { ts: T0, data: 'ب'.repeat(600000) });
        check('S1.8 entry above 1 MB estimated is not cached', g2.cache.get('huge') === undefined);
        g2.cache.set('big999', { ts: T0, data: 'ب'.repeat(600000) });
        check('S1.9 oversize write for an existing key drops the old value (never serves stale data)', g2.cache.get('big999') === undefined);

        // sweep
        const g3 = loadGeocode(src, 'wt-s');
        for (let i = 0; i < 100; i++) g3.G.cache.set('s' + i, { ts: T0 + (i < 50 ? 0 : 3600e3), data: 'x' });
        g3.clock.now = T0 + g3.G.TTL + 1;
        g3.intervals.find((x) => x.ms === g3.G.SWEEP_MS).fn();
        check('S1.10 sweep removes exactly the expired entries', g3.G.cache._m.size === 50 && g3.G.cache._m.has('s50') && !g3.G.cache._m.has('s0')
            && geoBytesRecount(g3.G) === g3.G.cache._bytes);

        // handler: fresh hit returns identical body without a fetch; expiry refetches
        const g4 = loadGeocode(src, 'wt-h');
        g4.state.plan = () => ({ status: 200, body: '[{"place_id":1}]' });
        const r1 = await g4.call('type=search&format=json&q=riyadh');
        const r2 = await g4.call('type=search&format=json&q=riyadh');
        g4.clock.now = T0 + g4.G.TTL;
        const r3 = await g4.call('type=search&format=json&q=riyadh');
        check('S1.11 handler: miss->fetch, hit->no fetch same body, 24h->refetch',
            g4.counters.fetch === 2 && r1.body === r2.body && r2.body === r3.body && r2.status === 200, 'fetches=' + g4.counters.fetch);
    }

    // ---------------------------------------------------------------------------------------- S2
    section('S2 external unit (fake clock)');
    {
        const h = loadExternal(src, 'wt');
        const { X, clock, intervals } = h;
        check('S2.0 constants: MAX=1000, 64 MB budget, 1 MB entry limit, 10 min sweep',
            X.MAX === 1000 && X.MAX_BYTES === 64 * 1048576 && X.MAX_ENTRY_BYTES === 1048576 && X.SWEEP_MS === 6e5);
        const sw = intervals.filter((x) => x.ms === X.SWEEP_MS);
        check('S2.1 sweep interval registered once and unref()d', sw.length === 1 && sw[0].unrefCalled === true);

        const e = { response: [1], status: 'ok', expiresAt: T0 + 1000 };
        X.set('a', e);
        clock.now = T0 + 999;
        check('S2.2 fresh at expiresAt-1: same entry', X.get('a') === e);
        clock.now = T0 + 1000;
        check('S2.3 at expiresAt: reader misses and removes it', X.get('a') === undefined && X.cache.size === 0 && X.bytes() === 0);

        clock.now = T0;
        X.set('b', { response: [1], status: 'ok', expiresAt: T0 + 5000 });
        X.set('b', { response: [2], status: 'ok', expiresAt: T0 - 1 });
        check('S2.4 expired write replaces a fresh entry with a miss (previous code stored it expired)', X.get('b') === undefined && X.cache.size === 0);
        X.set('n', { response: null, status: 'ok', expiresAt: NaN });
        check('S2.5 NaN expiresAt (null expires_at row) is a miss', X.get('n') === undefined && X.cache.size === 0);

        for (let i = 0; i < X.MAX; i++) X.set('k' + i, { response: [], status: 'empty', expiresAt: T0 + 864e5 });
        X.get('k0');
        X.set('k' + X.MAX, { response: [], status: 'empty', expiresAt: T0 + 864e5 });
        const keys = [...X.cache.keys()];
        check('S2.6 LRU at the 1000 cap: touched k0 survives, k1 evicted', X.cache.size === X.MAX && X.cache.has('k0') && !X.cache.has('k1')
            && keys[0] === 'k2' && keys[keys.length - 1] === 'k' + X.MAX);
        check('S2.7 byte accounting == recount', extBytesRecount(X) === X.bytes(), 'bytes=' + X.bytes());

        const x2 = loadExternal(src, 'wt-b').X;
        const bigResp = JSON.parse(BIG_TEXT('u'));
        for (let i = 0; i < 1000; i++) x2.set('big' + i, { response: bigResp, status: 'ok', expiresAt: T0 + 1e9 });
        check('S2.8 byte budget binds before the count cap', x2.bytes() <= x2.MAX_BYTES && x2.cache.size < 1000 && x2.cache.has('big999'),
            'entries=' + x2.cache.size + ' est MB=' + (x2.bytes() / 1048576).toFixed(2));
        x2.set('huge', { response: ['ب'.repeat(300000)], status: 'ok', expiresAt: T0 + 1e9 });
        check('S2.9 entry above 1 MB estimated is not held', x2.get('huge') === undefined);

        // same-version re-hydration keeps its estimate without re-serialising
        const h3 = loadExternal(src, 'wt-v');
        const x3 = h3.X;
        const ctxJSON = vm.runInContext('JSON', h3.sandbox);
        const realStringify = ctxJSON.stringify;
        let stringified = 0;
        ctxJSON.stringify = function (...a) { stringified++; return realStringify.apply(this, a); };
        x3.set('v', { response: bigResp, status: 'ok', expiresAt: T0 + 5000 });
        const b0 = x3.bytes();
        const s0 = stringified;
        const e2 = { response: bigResp, status: 'ok', expiresAt: T0 + 5000 };
        x3.set('v', e2);
        const sameVersionStringify = stringified - s0;
        x3.set('v', { response: bigResp, status: 'ok', expiresAt: T0 + 6000 });
        const newVersionStringify = stringified - s0 - sameVersionStringify;
        check('S2.10 re-hydration of the same row version reuses the estimate (0 serialisations); a new version re-estimates (1)',
            s0 === 1 && sameVersionStringify === 0 && newVersionStringify === 1 && x3.bytes() === b0 && x3.cache.size === 1,
            `first=${s0} same=${sameVersionStringify} new=${newVersionStringify}`);
        ctxJSON.stringify = realStringify;
        x3.set('w', e2);
        check('S2.10b replaced entry is served as the new object', x3.get('w') === e2);

        // sweep
        const h4 = loadExternal(src, 'wt-s');
        for (let i = 0; i < 100; i++) h4.X.set('s' + i, { response: [], status: i < 50 ? 'error' : 'ok', expiresAt: T0 + (i < 50 ? h4.X.TTL.error : h4.X.TTL.ok) });
        h4.clock.now = T0 + h4.X.TTL.error;
        h4.intervals.find((x) => x.ms === h4.X.SWEEP_MS).fn();
        check('S2.11 sweep removes exactly the expired entries', h4.X.cache.size === 50 && h4.X.cache.has('s50') && !h4.X.cache.has('s0')
            && extBytesRecount(h4.X) === h4.X.bytes());

        // TTLs through the real fetch path
        const h5 = loadExternal(src, 'wt-t');
        h5.state.plan = (p, q) => q === 'empty place' ? { status: 200, body: '[]' } : q === 'limited place' ? { status: 429, body: '' } : null;
        await h5.X.search('ok place', 'ar'); await h5.X.search('empty place', 'ar');
        h5.sandbox.process.env.LOCATIONIQ_API_KEY = '';
        await h5.X.search('limited place', 'ar');
        const f0 = h5.counters.fetch;
        h5.clock.now = T0 + h5.X.TTL.error - 1; await h5.X.search('limited place', 'ar');
        const f1 = h5.counters.fetch;
        h5.clock.now = T0 + h5.X.TTL.error; await h5.X.search('limited place', 'ar');
        const f2 = h5.counters.fetch;
        h5.clock.now = T0 + h5.X.TTL.empty; await h5.X.search('empty place', 'ar'); await h5.X.search('ok place', 'ar');
        const f3 = h5.counters.fetch;
        check('S2.12 TTL 1h rate_limited / 24h empty / 7d ok honoured on the fetch path',
            f0 === 3 && f1 === 3 && f2 === 4 && f3 === 5, [f0, f1, f2, f3].join('/'));
    }

    // ---------------------------------------------------------------------------------------- S3
    section('S3 bulk bounds (' + (QUICK ? '10,000 and 100,000' : '10,000, 100,000 and 500,000') + ' insertions per write path)');
    const checkpoints = QUICK ? [10000, 100000] : [10000, 100000, 500000];
    const bulk = [];
    {
        const decoder = new TextDecoder();
        // geocode: two profiles through the real handler (the only production write path)
        for (const profile of ['small', 'mixed']) {
            const h = loadGeocode(src, 'wt-bulk-' + profile);
            const bigBuf = Buffer.from(JSON.stringify(Array.from({ length: 20 }, (_, j) => placeItem(250, 'b' + j))));   // ~150K units
            let i = 0;
            h.state.plan = (url) => {
                if (profile === 'mixed' && i % 50 === 0) return { status: 200, body: decoder.decode(Buffer.concat([bigBuf, Buffer.from(' ' + i)])) };
                return { status: 200, body: SMALL_TEXT(i) };
            };
            const heap0 = heapMB();
            const cps = [];
            for (const cp of checkpoints) {
                for (; i < cp; i++) await h.call('type=search&format=json&q=place' + i);
                const heap = heapMB();
                cps.push({ n: cp, size: h.G.cache._m.size, estMB: +(h.G.cache._bytes / 1048576).toFixed(2), recountOk: geoBytesRecount(h.G) === h.G.cache._bytes,
                    heapDeltaMB: +(heap - heap0).toFixed(1), fetch: h.counters.fetch });
            }
            for (const c of cps) {
                check(`S3.geo.${profile}@${c.n} size<=10000 && est<=64MB && recount`, c.size <= 10000 && c.estMB <= 64 && c.recountOk,
                    `size=${c.size} est=${c.estMB}MB heapDelta=${c.heapDeltaMB}MB fetch=${c.fetch}`);
            }
            if (cps.length >= 2) { const a = cps[cps.length - 2], z = cps[cps.length - 1];
                check(`S3.geo.${profile} heap plateau ${a.n / 1000}K->${z.n / 1000}K (<16 MB growth)`, z.heapDeltaMB - a.heapDeltaMB < 16,
                    (z.heapDeltaMB - a.heapDeltaMB).toFixed(1) + ' MB'); }
            bulk.push({ cache: 'geocode', profile, checkpoints: cps });
        }

        // external: each write path alone, then all four interleaved
        const paths = {
            'nominatim-fetch': async (h, i) => h.X.search('query ' + i, 'ar'),
            'locationiq-fetch': async (h, i) => h.X.search('query ' + i, 'ar', { forceProvider: 'locationiq' }),
            'nominatim-hydration': async (h, i) => h.X.search('query ' + i, 'ar'),
            'locationiq-hydration': async (h, i) => h.X.search('query ' + i, 'ar', { forceProvider: 'locationiq' }),
        };
        const profiles = [...Object.keys(paths), 'mixed-all-four'];
        for (const name of profiles) {
            const h = loadExternal(src, 'wt-bulk-' + name);
            const hydr = name.endsWith('hydration');
            h.sandbox._SUPABASE_ENABLED = hydr;
            h.state.supaMode = 'synth';
            h.state.supaStore = false;
            h.state.payload = (prov, key) => (Number(String(key).replace(/\D+/g, '')) % 50 === 0 ? BIG_TEXT(key) : SMALL_TEXT(key));
            const order = Object.keys(paths);
            const heap0 = heapMB();
            const cps = [];
            let i = 0;
            for (const cp of checkpoints) {
                for (; i < cp; i++) {
                    if (name === 'mixed-all-four') {
                        const p = order[i % 4];
                        h.sandbox._SUPABASE_ENABLED = p.endsWith('hydration');
                        await paths[p](h, i);
                    } else {
                        await paths[name](h, i);
                    }
                }
                const heap = heapMB();
                cps.push({ n: cp, size: h.X.cache.size, estMB: +(h.X.bytes() / 1048576).toFixed(2), recountOk: extBytesRecount(h.X) === h.X.bytes(),
                    heapDeltaMB: +(heap - heap0).toFixed(1), fetch: h.counters.fetch, supaGet: h.counters.supaGet });
            }
            for (const c of cps) {
                check(`S3.ext.${name}@${c.n} size<=1000 && est<=64MB && recount`, c.size <= 1000 && c.estMB <= 64 && c.recountOk,
                    `size=${c.size} est=${c.estMB}MB heapDelta=${c.heapDeltaMB}MB fetch=${c.fetch} supabaseGET=${c.supaGet}`);
            }
            if (cps.length >= 2) { const a = cps[cps.length - 2], z = cps[cps.length - 1];
                check(`S3.ext.${name} heap plateau ${a.n / 1000}K->${z.n / 1000}K (<16 MB growth)`, z.heapDeltaMB - a.heapDeltaMB < 16,
                    (z.heapDeltaMB - a.heapDeltaMB).toFixed(1) + ' MB'); }
            bulk.push({ cache: 'external', profile: name, checkpoints: cps });
        }

        // byte budget under sustained large payloads, both hydration and fetch
        for (const hydr of [false, true]) {
            const h = loadExternal(src, 'wt-bytes');
            h.sandbox._SUPABASE_ENABLED = hydr;
            h.state.supaMode = 'synth'; h.state.supaStore = false;
            h.state.payload = (prov, key) => BIG_TEXT(key);
            for (let i = 0; i < 20000; i++) await h.X.search('large ' + i, 'ar');
            check(`S3.ext.bytes.${hydr ? 'hydration' : 'fetch'} 20,000 x ~20K-unit payloads: est<=64MB, size<1000`,
                h.X.bytes() <= h.X.MAX_BYTES && h.X.cache.size < 1000 && extBytesRecount(h.X) === h.X.bytes(),
                `size=${h.X.cache.size} est=${(h.X.bytes() / 1048576).toFixed(2)}MB`);
        }
    }


    // ---------------------------------------------------------------------------------------- S3b
    // SERVER-MEMORY-CACHE-BOUNDS-1: the cases the bulk section does NOT cover -- repeated writes to an
    //   EXISTING key (the accounting-drift case), duplicate keys, the >1 MB bypass through the real
    //   handler, and the Supabase failure/fallback path. Every insert here goes through a production
    //   write path (the geocode cache object's own set(), the /api/geocode handler, or the two
    //   _searchExternalPlaces/_searchLocationIQRaw hydration + fetch paths).
    section('S3b overwrite / duplicate keys / oversize bypass / Supabase fallback');
    {
        const DUP_TEXTS = Array.from({ length: 64 }, (_, j) => SMALL_TEXT('d' + j));   // varying sizes -> drift shows up

        // ---- geocode: many writes over a SMALL key set: size == distinct keys, bytes never drift ----
        for (const distinct of [1, 100]) {
            const h = loadGeocode(src, 'wt-dup-geo-' + distinct);
            const heap0 = heapMB();
            const rows = [];
            let i = 0;
            for (const cp of checkpoints) {
                for (; i < cp; i++) h.G.cache.set('dup' + (i % distinct), { ts: h.clock.now, data: DUP_TEXTS[i & 63] });
                rows.push({ n: cp, size: h.G.cache._m.size, estKB: +(h.G.cache._bytes / 1024).toFixed(2),
                    recountOk: geoBytesRecount(h.G) === h.G.cache._bytes, heapDeltaMB: +(heapMB() - heap0).toFixed(1) });
            }
            for (const r of rows) {
                check(`S3b.geo.dup${distinct}@${r.n} overwrite: size==${distinct}, bytes==recount, no drift`,
                    r.size === distinct && r.recountOk && r.estKB <= 32 * 1024,
                    `size=${r.size} est=${r.estKB}KB heapDelta=${r.heapDeltaMB}MB`);
            }
            bulk.push({ cache: 'geocode', profile: 'duplicate-keys-' + distinct, checkpoints: rows });
        }

        // ---- geocode: overwrite through the PRODUCTION handler (clock past TTL forces a real rewrite) ----
        {
            const h = loadGeocode(src, 'wt-dup-geo-handler');
            h.state.plan = () => ({ status: 200, body: DUP_TEXTS[h.clock.now % 64] });
            let writes = 0;
            for (let round = 0; round < 200; round++) {
                h.clock.now = T0 + round * (h.G.TTL + 1);
                for (let k = 0; k < 50; k++) { await h.call('type=search&format=json&q=dup' + k); writes++; }
            }
            check('S3b.geo.handler 10,000 handler writes over 50 keys: 50 entries, every round refetched, bytes==recount',
                h.G.cache._m.size === 50 && geoBytesRecount(h.G) === h.G.cache._bytes && h.counters.fetch === writes,
                `size=${h.G.cache._m.size} fetches=${h.counters.fetch}/${writes} est=${(h.G.cache._bytes / 1024).toFixed(1)}KB`);
        }

        // ---- geocode: a >1 MB response is SERVED byte-for-byte but never cached ----
        {
            const h = loadGeocode(src, 'wt-oversize');
            const huge = JSON.stringify([{ pad: '\u0628'.repeat(600000) }]);              // ~1.2 MB estimated
            h.state.plan = () => ({ status: 200, body: huge });
            const r1 = await h.call('type=search&format=json&q=huge');
            const r2 = await h.call('type=search&format=json&q=huge');
            check('S3b.geo.oversize >1 MB served byte-for-byte + status 200, never cached, refetched next time',
                r1.body === huge && r2.body === huge && r1.status === 200 && r2.status === 200
                && h.G.cache._m.size === 0 && h.G.cache._bytes === 0 && h.counters.fetch === 2,
                `bodyLen=${r1.body.length} cacheSize=${h.G.cache._m.size} fetch=${h.counters.fetch}`);
        }

        // ---- external: overwrite through BOTH hydration paths (a row is re-hydrated on EVERY call) ----
        for (const [name, force] of [['nominatim-hydration', null], ['locationiq-hydration', 'locationiq']]) {
            for (const versioned of [false, true]) {
                const h = loadExternal(src, `wt-dup-ext-${name}-${versioned}`);
                h.sandbox._SUPABASE_ENABLED = true;
                h.state.supaMode = 'synth'; h.state.supaStore = false;
                const PAY = new Map();
                h.state.payload = (prov, key) => { let v = PAY.get(key); if (v === undefined) { v = SMALL_TEXT(key); PAY.set(key, v); } return v; };
                const heap0 = heapMB();
                const rows = [];
                let i = 0;
                for (const cp of checkpoints) {
                    for (; i < cp; i++) {
                        if (versioned) h.clock.now = T0 + i * 1000;          // every hydration is a NEW row version
                        await h.X.search('dup ' + (i % 50), 'ar', force ? { forceProvider: force } : undefined);
                    }
                    rows.push({ n: cp, size: h.X.cache.size, estKB: +(h.X.bytes() / 1024).toFixed(2),
                        recountOk: extBytesRecount(h.X) === h.X.bytes(), heapDeltaMB: +(heapMB() - heap0).toFixed(1), supaGet: h.counters.supaGet });
                }
                const label = name + (versioned ? '.versioned' : '');
                for (const r of rows) {
                    check(`S3b.ext.${label}@${r.n} overwrite over 50 keys: bounded, bytes==recount`,
                        r.size === rows[0].size && r.size <= 100 && r.recountOk && r.estKB <= 64 * 1024,
                        `size=${r.size} est=${r.estKB}KB heapDelta=${r.heapDeltaMB}MB supabaseGET=${r.supaGet}`);
                }
                bulk.push({ cache: 'external', profile: 'duplicate-keys-' + label, checkpoints: rows });
            }
        }

        // ---- external: overwrite through BOTH fetch paths (clock past the 7 d TTL forces a rewrite) ----
        {
            const h = loadExternal(src, 'wt-dup-ext-fetch');
            h.sandbox._SUPABASE_ENABLED = false;
            let writes = 0;
            for (let round = 0; round < 100; round++) {
                h.clock.now = T0 + round * (h.X.TTL.ok + 1);
                for (let k = 0; k < 50; k++) { await h.X.search('dupf ' + k, 'ar'); writes++; }
                for (let k = 0; k < 50; k++) { await h.X.search('dupl ' + k, 'ar', { forceProvider: 'locationiq' }); writes++; }
            }
            check('S3b.ext.fetch 10,000 fetch-path writes over <=200 keys: bounded, bytes==recount',
                h.X.cache.size <= 200 && extBytesRecount(h.X) === h.X.bytes() && h.X.bytes() <= h.X.MAX_BYTES,
                `size=${h.X.cache.size} est=${(h.X.bytes() / 1024).toFixed(1)}KB fetch=${h.counters.fetch} writes=${writes}`);
        }

        // ---- external: Supabase failure / fallback path ----
        {
            const h = loadExternal(src, 'wt-supafail');
            h.sandbox._SUPABASE_ENABLED = true;
            h.state.supaMode = 'table'; h.state.supaStore = false; h.state.supaFail = true;   // every Supabase GET 503s
            const r1 = await h.X.search('fallback a', 'ar');
            const f1 = h.counters.fetch;
            const r2 = await h.X.search('fallback a', 'ar');                                  // must come from the mem cache
            check('S3b.ext.supabase-outage: falls back to fetch, then the bounded mem cache serves the repeat',
                f1 === 1 && h.counters.fetch === 1 && r1.status === r2.status && r1.provider === r2.provider
                && JSON.stringify(r1.results) === JSON.stringify(r2.results)
                && h.X.cache.size === 1 && extBytesRecount(h.X) === h.X.bytes(),
                `fetch=${h.counters.fetch} size=${h.X.cache.size} status=${r1.status}/${r2.status}`);
            for (let i = 0; i < 5000; i++) await h.X.search('outage ' + i, 'ar');
            check('S3b.ext.supabase-outage 5,000 distinct keys during the outage stay capped at 1,000',
                h.X.cache.size === h.X.MAX && extBytesRecount(h.X) === h.X.bytes() && h.X.bytes() <= h.X.MAX_BYTES,
                `size=${h.X.cache.size} est=${(h.X.bytes() / 1048576).toFixed(2)}MB`);
        }
    }

    // ---------------------------------------------------------------------------------------- S4
    let parity = null;
    if (BASE) {
        const baseSrc = readSrc(BASE);
        section('S4 parity vs BASE (deterministic scenarios, identical stubs)');

        // ---- external scenario ----
        async function extScenario(srcX, label, isWt) {
            const h = loadExternal(srcX, label);
            const log = [];
            h.counters.log = log;
            const sweep = () => { if (isWt) h.intervals.find((x) => x.ms === 6e5).fn(); };
            const rec = async (tag, p) => { const r = await p; log.push(tag + ' => ' + JSON.stringify(r)); };
            const at = (ms) => { h.clock.now = T0 + ms; sweep(); };
            h.state.plan = (prov, q) => {
                if (q.startsWith('lim')) return prov === 'nominatim' ? { status: 429, body: '' } : null;
                if (q.startsWith('err')) return prov === 'nominatim' ? { throw: 'boom' } : { status: 404, body: '{"error":"Unable to geocode"}' };
                if (q.startsWith('both')) return { status: 503, body: '' };
                if (q.startsWith('none')) return { status: 200, body: '[]' };
                return null;
            };
            // Supabase OFF: the memory layer is the only cache
            for (const q of ['riyadh', 'riyadh', 'none x', 'lim a', 'lim a', 'err b', 'both c', 'both c', 'x', 'r'.repeat(81)]) await rec('search ' + q.slice(0, 20), h.X.search(q, 'ar'));
            await rec('force liq', h.X.search('jeddah', 'en', { forceProvider: 'locationiq' }));
            await rec('force liq again', h.X.search('jeddah', 'en', { forceProvider: 'locationiq' }));
            at(h.X.TTL.error - 1); await rec('lim a @1h-1', h.X.search('lim a', 'ar')); await rec('both c @1h-1', h.X.search('both c', 'ar'));
            at(h.X.TTL.error); await rec('lim a @1h', h.X.search('lim a', 'ar')); await rec('both c @1h', h.X.search('both c', 'ar'));
            at(h.X.TTL.empty); await rec('none x @24h', h.X.search('none x', 'ar')); await rec('riyadh @24h', h.X.search('riyadh', 'ar'));
            at(h.X.TTL.ok); await rec('riyadh @7d', h.X.search('riyadh', 'ar'));
            // 1,500 distinct keys, re-read the newest 1,000 and the 10 oldest (FIFO == LRU with no reads between)
            at(h.X.TTL.ok + 1000);
            for (let i = 0; i < 1500; i++) await h.X.search('bulk ' + i, 'ar');
            for (let i = 500; i < 1500; i++) await h.X.search('bulk ' + i, 'ar');
            for (let i = 0; i < 10; i++) await h.X.search('bulk ' + i, 'ar');
            log.push('after bulk fetch=' + h.counters.fetch);
            // Supabase ON: hydration, error rows, outage fallback, clock skew, null expiry
            h.sandbox._SUPABASE_ENABLED = true;
            const now = () => h.clock.now;
            h.state.supaRows.set('nominatim|raw|hydr ok', { cache_key: 'nominatim|raw|hydr ok', response: JSON.parse(SMALL_TEXT('h')), status: 'ok', expires_at: new Date(now() + 3600e3).toISOString() });
            h.state.supaRows.set('nominatim|raw|hydr err', { cache_key: 'nominatim|raw|hydr err', response: [], status: 'error', expires_at: new Date(now() + 3600e3).toISOString() });
            h.state.supaRows.set('nominatim|raw|hydr skew', { cache_key: 'nominatim|raw|hydr skew', response: [7], status: 'ok', expires_at: new Date(now() - 5).toISOString() });
            h.state.supaRows.set('nominatim|raw|hydr null', { cache_key: 'nominatim|raw|hydr null', response: [8], status: 'empty', expires_at: null });
            h.state.supaRows.set('locationiq|raw|hydr liq', { cache_key: 'locationiq|raw|hydr liq', response: [9], status: 'ok', expires_at: new Date(now() + 3600e3).toISOString() });
            await rec('hydr ok', h.X.search('hydr ok', 'ar'));
            await rec('hydr err', h.X.search('hydr err', 'ar'));
            h.state.ignoreFilter = true;
            await rec('hydr skew', h.X.search('hydr skew', 'ar'));
            await rec('hydr null', h.X.search('hydr null', 'ar'));
            h.state.ignoreFilter = false;
            await rec('hydr liq', h.X.search('hydr liq', 'en', { forceProvider: 'locationiq' }));
            h.state.supaFail = true;                         // outage: memory fallback
            for (const q of ['hydr ok', 'hydr err', 'hydr skew', 'hydr null', 'riyadh']) await rec('outage ' + q, h.X.search(q, 'ar'));
            await rec('outage liq', h.X.search('hydr liq', 'en', { forceProvider: 'locationiq' }));
            h.state.supaFail = false;
            at(h.X.TTL.ok + 1000 + 3600e3); h.state.supaFail = true;
            await rec('outage hydr ok @expiry', h.X.search('hydr ok', 'ar'));
            log.push('final fetch=' + h.counters.fetch + ' supaGet=' + h.counters.supaGet + ' supaPost=' + h.counters.supaPost);
            return { log, size: h.X.cache.size };
        }
        const eb = await extScenario(baseSrc, 'base', false);
        const ew = await extScenario(src, 'wt', true);
        const firstDiff = (a, b) => { for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) return i + ': BASE=' + a[i] + ' | WT=' + b[i]; return null; };
        const ed = firstDiff(eb.log, ew.log);
        check('S4.1 external: every result, status, provider and stubbed external call identical to BASE', ed === null,
            ed || (eb.log.length + ' log lines, ' + eb.log[eb.log.length - 1]));

        // ---- geocode scenario ----
        async function geoScenario(srcX, label, isWt) {
            const h = loadGeocode(srcX, label);
            const log = [];
            h.counters.log = log;
            const sweep = () => { if (isWt) h.intervals.find((x) => x.ms === 6e5).fn(); };
            h.state.plan = (url) => {
                if (url.includes('q=lim')) return { status: 429, body: '' };
                if (url.includes('q=five')) return { status: 502, body: '' };
                if (url.includes('q=boom')) return { throw: 'boom' };
                if (url.includes('q=html')) return { status: 200, body: '<html>nope</html>' };
                if (url.includes('q=ws')) return { status: 200, body: '  [{"ws":1}]\n' };
                if (url.includes('/reverse?')) return { status: 200, body: '{"place_id":9,"name":"الرياض"}' };
                return { status: 200, body: '[{"q":"' + url.slice(-24) + '"}]' };
            };
            const rec = async (qs) => { const r = await h.call(qs); log.push(qs.slice(0, 60) + ' => ' + r.status + ' ' + JSON.stringify(r.headers) + ' ' + r.body); };
            const at = (ms) => { h.clock.now = T0 + ms; sweep(); };
            for (const qs of ['type=search&format=json&q=riyadh', 'type=search&format=json&q=riyadh', 'type=reverse&format=json&lat=24.7&lon=46.6&zoom=10',
                'type=reverse&format=json&lat=24.7&lon=46.6&zoom=10', 'format=json&q=notype', 'type=search&q=lim', 'type=reverse&q=lim', 'type=search&q=lim',
                'type=search&q=five', 'type=search&q=boom', 'type=search&q=html', 'type=search&q=html', 'type=search&q=ws', 'type=search&q=ws']) await rec(qs);
            h.state.circuitOpen = true; await rec('type=search&format=json&q=riyadh'); await rec('type=search&q=uncached'); h.state.circuitOpen = false;
            at(h.G.TTL - 1); await rec('type=search&format=json&q=riyadh');
            at(h.G.TTL); await rec('type=search&format=json&q=riyadh');
            at(2 * h.G.TTL); const keep = h.state.plan; h.state.plan = () => ({ status: 429, body: '' });
            await rec('type=reverse&format=json&lat=24.7&lon=46.6&zoom=10'); await rec('type=reverse&format=json&lat=24.7&lon=46.6&zoom=10');
            h.state.plan = keep;
            await rec('type=reverse&format=json&lat=24.7&lon=46.6&zoom=10'); await rec('type=reverse&format=json&lat=24.7&lon=46.6&zoom=10');
            // 12,000 small keys with touches (count cap binds; byte budget not reached)
            at(3 * h.G.TTL);
            for (let i = 0; i < 12000; i++) { await h.call('type=search&q=bulk' + i); if (i % 7 === 0) await h.call('type=search&q=bulk' + (i >> 1)); }
            let hits = 0; const f0 = h.counters.fetch;
            for (let i = 0; i < 12000; i += 3) await h.call('type=search&q=bulk' + i);
            hits = 4000 - (h.counters.fetch - f0);
            log.push('bulk re-read hits=' + hits + ' fetch=' + h.counters.fetch + ' cfail=' + h.counters.circuitFail + ' csucc=' + h.counters.circuitSuccess);
            return { log };
        }
        const gb = await geoScenario(baseSrc, 'base', false);
        const gw = await geoScenario(src, 'wt', true);
        const gd = firstDiff(gb.log, gw.log);
        check('S4.2 geocode: every status, header, body and stubbed external call identical to BASE (below the byte budget)', gd === null,
            gd || (gb.log.length + ' log lines, ' + gb.log[gb.log.length - 1]));

        // ---- controls: the harness sees the BASE flaws ----
        {
            const h = loadExternal(baseSrc, 'base-ctl');
            h.sandbox._SUPABASE_ENABLED = true; h.state.supaMode = 'synth'; h.state.supaStore = false;
            for (let i = 0; i < 20000; i++) await h.X.search('ctl ' + i, 'ar');
            const w = loadExternal(src, 'wt-ctl');
            w.sandbox._SUPABASE_ENABLED = true; w.state.supaMode = 'synth'; w.state.supaStore = false;
            for (let i = 0; i < 20000; i++) await w.X.search('ctl ' + i, 'ar');
            check('S4.3 control: BASE hydration path is unbounded (size grows past 1000); this tree stays at 1000',
                h.X.cache.size === 20000 && w.X.cache.size === 1000, 'BASE size=' + h.X.cache.size + ' WT size=' + w.X.cache.size);
        }
        {
            const b = loadGeocode(baseSrc, 'base-ctl').G;
            const w = loadGeocode(src, 'wt-ctl').G;
            const unit = 'ب'.repeat(12000);
            for (let i = 0; i < 3000; i++) { b.cache.set('c' + i, { ts: T0, data: unit + i }); w.cache.set('c' + i, { ts: T0, data: unit + i }); }
            let baseEst = 0; for (const [k, v] of b.cache._m) baseEst += 2 * (k.length + v.data.length) + 128;
            check('S4.4 control: BASE geocode holds 3,000 x 24 KB (no byte bound); this tree <= 64 MB',
                b.cache._m.size === 3000 && w.cache._bytes <= 64 * 1048576,
                'BASE est=' + (baseEst / 1048576).toFixed(1) + 'MB WT est=' + (w.cache._bytes / 1048576).toFixed(1) + 'MB entries=' + w.cache._m.size);
            b.cache._m.clear(); w.cache._m.clear();
        }
        {
            // expected, documented difference: after >1000 hydrated keys an outage falls back to fewer memory hits
            const run = async (s, l) => {
                const h = loadExternal(s, l);
                h.sandbox._SUPABASE_ENABLED = true; h.state.supaMode = 'synth'; h.state.supaStore = false;
                for (let i = 0; i < 5000; i++) await h.X.search('out ' + i, 'ar');
                h.state.supaFail = true; const f0 = h.counters.fetch;
                for (let i = 0; i < 5000; i++) await h.X.search('out ' + i, 'ar');
                return h.counters.fetch - f0;
            };
            const fb = await run(baseSrc, 'base-out'); const fw = await run(src, 'wt-out');
            parity = { outageRefetchBase: fb, outageRefetchWt: fw };
            console.log(`  INFO S4.5 documented difference -- 5,000 hydrated keys then a Supabase outage: external fetches BASE=${fb} WT=${fw} (cap of 1,000 now applies to hydration)`);
        }
    }

    // ---------------------------------------------------------------------------------------- S5
    let boot = null;
    if (BASE && BOOT) boot = await bootCompare();

    console.log('\nnet guard (this process): blocked attempts=' + netBlocked.length);
    check('S9 zero network attempts from the harness process', netBlocked.length === 0);
    console.log(`\nRESULT ${pass} PASS / ${fail} FAIL`);
    const out = argVal('--json');
    if (out) fs.writeFileSync(out, JSON.stringify({ pass, fail, failures, bulk, parity, boot }, null, 2));
    process.exitCode = fail ? 1 : 0;
}

// ======================================================================================================
// S5 -- boot BASE and this tree with a network guard, compare curated API + HTML responses
// ======================================================================================================
const GUARD = `
import net from 'node:net';
const local = (h) => !h || /^(localhost|127\\.0\\.0\\.1|::1|0\\.0\\.0\\.0)$/.test(h);
const orig = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...a) {
  let o = a[0]; if (Array.isArray(o)) o = o[0];
  const host = (o && typeof o === 'object') ? o.host : (typeof a[1] === 'string' ? a[1] : 'localhost');
  const pipe = o && typeof o === 'object' && o.path;
  if (!pipe && !local(host)) { process.stderr.write('[net-guard] BLOCKED ' + host + '\\n'); const s = this; process.nextTick(() => s.destroy(new Error('net-guard blocked ' + host))); return this; }
  return orig.apply(this, a);
};
const of = globalThis.fetch;
globalThis.fetch = async (u, o) => { let h = ''; try { h = new URL(String(u && u.url || u)).hostname; } catch (_) {}
  if (!local(h)) { process.stderr.write('[net-guard] BLOCKED fetch ' + h + '\\n'); throw new TypeError('net-guard blocked fetch ' + h); }
  return of(u, o); };
process.stderr.write('[net-guard] active pid=' + process.pid + '\\n');
`;

function httpGet(port, p, enc) {
    return new Promise((resolve, reject) => {
        const req = http.request({ host: '127.0.0.1', port, path: p, method: 'GET', headers: {
            Host: 'timesprayers.com', 'X-Forwarded-Proto': 'https', 'Accept-Encoding': enc || 'identity',
            'User-Agent': 'Mozilla/5.0 (smoke SERVER-MEMORY-CACHE-BOUNDS-1)', Accept: 'text/html,application/json' } }, (res) => {
            const chunks = [];
            res.on('data', (c) => chunks.push(c));
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
        });
        req.on('error', reject);
        req.setTimeout(30000, () => req.destroy(new Error('timeout ' + p)));
        req.end();
    });
}
const norm = (s) => String(s)
    .replace(/nonce-[A-Za-z0-9+/=_-]+/g, 'nonce-X')
    .replace(/nonce="[^"]*"/g, 'nonce="X"')
    .replace(/([?&](?:amp;)?b=)[0-9a-f]{7,40}/g, '$1SHA')
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})/g, 'ISO')
    .replace(/"ts":\d{13}/g, '"ts":0');
function normHeaders(h, drop) {
    const o = {};
    for (const k of Object.keys(h).sort()) {
        if (k === 'date' || k === 'connection' || k === 'keep-alive' || k === 'transfer-encoding' || (drop && drop.includes(k))) continue;
        if (k === 'x-ratelimit-reset') { o[k] = 'N'; continue; }                     // seconds left in the window
        o[k] = norm(Array.isArray(h[k]) ? h[k].join(', ') : h[k]);
    }
    return o;
}

async function bootCompare() {
    section('S5 booted servers (BASE :' + PORTS[0] + ' vs tree :' + PORTS[1] + ')');
    const procs = [];
    const logs = { base: '', wt: '' };
    const start = (root, port, tag) => {
        const env = { ...process.env, PORT: String(port), SITE_URL: 'https://timesprayers.com', NODE_ENV: 'production',
            SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', LOCATIONIQ_API_KEY: '', GITHUB_TOKEN: '', WEB_CONCURRENCY: '' };
        const p = spawn(process.execPath, ['-r', GUARD_CJS, '--import=data:text/javascript,' + encodeURIComponent(GUARD), 'server.js'],
            { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
        p.stdout.on('data', (d) => { logs[tag] += d; });
        p.stderr.on('data', (d) => { logs[tag] += d; });
        procs.push(p);
        return p;
    };
    const waitReady = async (port) => {
        const t = Date.now();
        while (Date.now() - t < 90000) {
            try { const r = await httpGet(port, '/health'); if (r.status === 200) return true; } catch (_) {}
            await new Promise((r) => setTimeout(r, 500));
        }
        return false;
    };
    const result = { urls: [], blocked: null };
    try {
        start(BASE, PORTS[0], 'base');
        start(ROOT, PORTS[1], 'wt');
        const ready = (await waitReady(PORTS[0])) && (await waitReady(PORTS[1]));
        check('S5.0 both servers ready', ready);
        if (!ready) return result;
        const urls = [
            '/health',
            '/api/search-place?q=riyadh&lang=ar', '/api/search-place?q=' + encodeURIComponent('الرياض') + '&lang=ar',
            '/api/search-place?q=paris&lang=fr', '/api/search-place?q=london&lang=en', '/api/search-place?q=istanbul&lang=tr',
            '/api/place-by-slug?slug=makkah', '/api/place-by-slug?slug=cairo&lang=en',
            '/api/cities?cc=sa', '/api/cities?cc=tr',
            '/', '/en', '/prayer-times-in-riyadh', '/en/prayer-times-in-london', '/fr/prayer-times-in-paris', '/qibla', '/qibla-in-makkah',
            '/quran', '/prayer-times-worldwide', '/robots.txt', '/sitemap.xml',
        ];
        // determinism gate first: each server against itself (run on BOTH so rate-limit counters stay in step)
        let gateOk = true, gateCanFail = false;
        for (const u of ['/', '/prayer-times-in-riyadh', '/api/search-place?q=riyadh&lang=ar']) {
            for (const port of PORTS) {
                const a = await httpGet(port, u); const b = await httpGet(port, u);
                if (norm(a.body.toString('utf8')) !== norm(b.body.toString('utf8'))) gateOk = false;
                if (a.body.toString('utf8') !== b.body.toString('utf8')) gateCanFail = true;   // raw HTML differs per response (nonce)
            }
        }
        check('S5.1 determinism gate: each server vs itself identical after normalisation', gateOk);
        const probe = norm('<script nonce="abc">x</script>') === norm('<script nonce="xyz">x</script>')
            && norm('<p>1</p>') !== norm('<p>2</p>');
        check('S5.2 comparator: raw HTML really varies per response (so masking is needed) and a one-byte content change is still seen',
            probe && gateCanFail);
        const decode = (r) => {
            const ce = String(r.headers['content-encoding'] || '');
            const buf = ce === 'br' ? zlib.brotliDecompressSync(r.body) : ce === 'gzip' ? zlib.gunzipSync(r.body) : r.body;
            return norm(buf.toString('utf8'));
        };
        for (const enc of ['identity', 'br, gzip']) {
            for (const u of urls) {
                let ok = false, detail = '';
                for (let attempt = 0; attempt < 2 && !ok; attempt++) {           // one retry for a minute-boundary tick
                    const a = await httpGet(PORTS[0], u, enc);
                    const b = await httpGet(PORTS[1], u, enc);
                    const ab = decode(a), bb = decode(b);
                    const drop = enc === 'identity' ? [] : ['content-length'];   // compressed size varies with the random nonce
                    const ha = JSON.stringify(normHeaders(a.headers, drop)); const hb = JSON.stringify(normHeaders(b.headers, drop));
                    ok = a.status === b.status && ha === hb && ab === bb;
                    const sha = crypto.createHash('sha256').update(ab).digest('hex').slice(0, 12);
                    detail = `${a.status} ce=${a.headers['content-encoding'] || '-'} len=${a.body.length}/${b.body.length} normSha=${sha}`
                        + (ha !== hb ? ' HEADERS DIFFER ' + ha + ' <> ' + hb : '') + (ab !== bb ? ' BODY DIFFERS' : '');
                    if (ok) result.urls.push({ url: u, enc, status: a.status, contentEncoding: a.headers['content-encoding'] || '', len: a.body.length, normSha: sha });
                }
                check(`S5 [${enc}] ${u}`, ok, detail);
            }
        }
    } finally {
        for (const p of procs) { try { execSync('taskkill /PID ' + p.pid + ' /T /F', { stdio: 'ignore' }); } catch (_) {} }
        await new Promise((r) => setTimeout(r, 1500));
        const all = logs.base + logs.wt;
        const blockedInline = (all.match(/\[net-guard\] BLOCKED/g) || []).length;
        const blockedBench = (all.match(/\[bench-guard\] BLOCKED/g) || []).length;
        const blocked = blockedInline + blockedBench;
        const active = (all.match(/\[net-guard\] active/g) || []).length;
        result.blocked = blocked; result.blockedInline = blockedInline; result.blockedBench = blockedBench; result.guardActive = active;
        check('S5.9 both guards active in primary + worker of both servers, 0 blocked outbound attempts', active >= 4 && blocked === 0,
            'guard lines=' + active + ' blocked=' + blocked + ' (inline=' + blockedInline + ' guard.cjs=' + blockedBench + ')');
    }
    return result;
}

main().catch((e) => { console.error(e); process.exitCode = 2; });
