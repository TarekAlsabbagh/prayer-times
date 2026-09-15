// INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1 — RED TESTS (mutation runner).
//
// Proves that the companion smoke (scripts/_smoke_indexable_route_surface_containment_1.mjs) actually guards every
// approved decision: each case re-introduces ONE regression and asserts that the smoke's OWN label for that guard
// goes red. An unmutated control run must be fully GREEN first.
//
// The implementation worktree is NEVER mutated. For every run (control + each case) the runner:
//   1. copies the worktree's tracked files (as they are on disk — uncommitted edits included) plus its untracked,
//      non-ignored files (the new ticket scripts) into a disposable directory <TP_RED_COPY_PARENT>/red-copy-<id>, adds
//      a node_modules junction (TP_RED_NODE_MODULES) and gives the copy its OWN git repository (git init + a read-only
//      objects/info/alternates to the worktree's object store + HEAD detached at the worktree HEAD + read-tree), so the
//      smoke's git guards see exactly the worktree's state (verified: `git diff --name-only` of copy === worktree);
//   2. harness adaptation IN THE COPY ONLY: the smoke's fixed port line is rewritten to this runner's ports (8841-8848);
//   3. applies ONE mutation inside that copy (every anchor must match an exact number of times; the mutated file must
//      still parse; the mutated copy must boot to /health 200 — so a label can never go red for the wrong reason);
//   4. runs the copy's smoke with cwd = copy (TP_SMOKE_ROOT = copy, TP_BASE_ROOT = base checkout);
//   5. parses the smoke's red labels ("✗ [LABEL] …") and checks exit != 0 + the expected label(s) red;
//   6. deletes the copy (junction unlinked first — the real node_modules is never followed).
// Before/after the whole suite the worktree is fingerprinted (HEAD, tracked diff, tracked status lines, sha256 of every
// tracked file) and must be identical; untracked files written meanwhile by OTHER authors are listed by name.
//
// Nothing here touches production or Google: the smoke only talks to local servers. Ports: 8841-8849 only.
//
// Usage:
//   node scripts/_red_indexable_route_surface_containment_1.mjs                       (control + all 14 cases)
//   TP_RED_ONLY=R0,R7 node scripts/_red_indexable_route_surface_containment_1.mjs    (subset; R0 = control)
//   TP_RED_DRY=1 node scripts/_red_indexable_route_surface_containment_1.mjs         (mutations apply+parse, copy cycle)
// Env:
//   TP_BASE_ROOT          base checkout, tree === c126604^{tree} (default C:/Users/Tarek/Downloads/timesprayers-gcollect)
//   TP_RED_COPY_PARENT    parent dir of the disposable copies (default: session scratchpad if present, else os.tmpdir())
//   TP_RED_NODE_MODULES   node_modules to junction into each copy (default C:/Users/Tarek/Downloads/TIME PRAYER/node_modules)
//   TP_RED_PARALLEL       concurrent runs, 1 or 2 (default 2; 4 ports per run inside 8841-8848)
//   TP_RED_RUN_TIMEOUT_MS per-run timeout (default 90 min)
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';
import path from 'node:path';
import net from 'node:net';
import { fileURLToPath } from 'node:url';

const WT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SMOKE_REL = 'scripts/_smoke_indexable_route_surface_containment_1.mjs';
const BASE_ROOT = process.env.TP_BASE_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-gcollect';
const SCRATCH_DEFAULT = 'C:/Users/Tarek/AppData/Local/Temp/claude/C--Users-Tarek-Downloads-TIME-PRAYER/4a4bfa89-f0ce-4ae8-bf28-1d023d5d9eb3/scratchpad';
const COPY_PARENT = process.env.TP_RED_COPY_PARENT || (fs.existsSync(SCRATCH_DEFAULT) ? SCRATCH_DEFAULT : os.tmpdir());
const NODE_MODULES = process.env.TP_RED_NODE_MODULES || 'C:/Users/Tarek/Downloads/TIME PRAYER/node_modules';
const LOG_DIR = path.join(COPY_PARENT, 'red-logs-indexable-route-surface-containment-1');
const PARALLEL = Math.max(1, parseInt(process.env.TP_RED_PARALLEL || '2', 10) || 1);
const RUN_TIMEOUT_MS = parseInt(process.env.TP_RED_RUN_TIMEOUT_MS || String(90 * 60 * 1000), 10);
const PORT_MIN = 8841, PORT_MAX = 8849;
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const eqJ = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// SMOKE ADAPTER — the only place that knows the smoke's contract.
//   * ROOT = the smoke file's own parent dir (import.meta.url) → running the COPY's smoke tests the copy.
//   * ports are a fixed line (AFTER, BASE, SEAM1, SEAM2) with no env override → rewritten in the copy only.
//   * base comparisons: TP_BASE_ROOT (the smoke boots it and checks its tree === c126604^{tree}).
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
const PORTS_PER_RUN = 4;
const SMOKE_PORT_LINE = 'const AFTER_PORT = 8835, BASE_PORT = 8836, SEAM1_PORT = 8837, SEAM2_PORT = 8838;';
// The smoke is SNAPSHOTTED once per suite (first use) and those exact bytes are written into every copy, so the control
// and all cases test ONE smoke version even if its author edits the worktree file meanwhile. Returns the snapshot sha256.
let SMOKE_SNAPSHOT = null;
function adaptSmokeInCopy(copyDir, ports) {
    if (SMOKE_SNAPSHOT === null) SMOKE_SNAPSHOT = fs.readFileSync(path.join(WT, SMOKE_REL), 'utf8');
    const s = SMOKE_SNAPSHOT;
    const n = s.split(SMOKE_PORT_LINE).length - 1;
    if (n !== 1) throw new Error('smoke port line found ' + n + ' times (expected 1) — the smoke changed its port contract');
    fs.writeFileSync(path.join(copyDir, SMOKE_REL), s.replace(SMOKE_PORT_LINE, `const AFTER_PORT = ${ports[0]}, BASE_PORT = ${ports[1]}, SEAM1_PORT = ${ports[2]}, SEAM2_PORT = ${ports[3]};`), 'utf8');
    return sha(Buffer.from(s, 'utf8')).slice(0, 16);
}
function smokeEnv(copyRoot) {
    const env = { ...process.env };
    delete env.TP_ENABLE_SEARCH_TEST; delete env.TP_MOON_RANGE_TEST_NOW; delete env.TP_BASE_URL;
    env.TP_SMOKE_ROOT = copyRoot;
    env.TP_BASE_ROOT = BASE_ROOT;
    return env;
}
const redLabels = (out) => [...new Set([...String(out).matchAll(/✗ \[([A-Z][A-Z0-9]*)\]/g)].map(m => m[1]))].sort();
const labelFailCounts = (out) => { const c = {}; for (const m of String(out).matchAll(/✗ \[([A-Z][A-Z0-9]*)\]/g)) c[m[1]] = (c[m[1]] || 0) + 1; return c; };
const greenCount = (out) => (String(out).match(/✓ \[[A-Z][A-Z0-9]*\]/g) || []).length;
const smokeSummary = (out) => { const m = String(out).match(/INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1 smoke\s+PASS (\d+)\s+FAIL (\d+)\s+\((\d+) s\)/); return m ? { pass: +m[1], fail: +m[2], secs: +m[3] } : null; };

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// MUTATIONS — each edit: { file, find, replace, count } (count = exact number of occurrences required), or
// { file, fn } for a structural edit that throws when its anchors are not found exactly.
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
const SRV = 'server.js';
const APP = 'js/app.js';
// review F2 moved the query capture: the normalizer now starts at the raw-query index line.
const HTML_NORMALIZER_START = "        const _hQi = req.url.indexOf('?');";
const HTML_LEGACY_RULE_NEW = String.raw`        if (/^\/(?:en\/)?(?:msbaha$|today-hijri-date$|date-converter$|`;
const HTML_LEGACY_RULE_OLD = String.raw`        if (/^\/(?:en\/)?(?:prayer-times-in-|qibla-in-|msbaha$|today-hijri-date$|date-converter$|`;
const CASES = [
    { id: 'R1', expect: ['M1'], name: 'SUPPORTED_MOON_YEAR_BACK = 100 (range widened backwards)',
      edits: [{ file: SRV, find: 'const SUPPORTED_MOON_YEAR_BACK = 5;', replace: 'const SUPPORTED_MOON_YEAR_BACK = 100;', count: 1 }] },
    { id: 'R2', expect: ['M2'], name: 'month grid: the old city-today ±5 clamp restored',
      note: 'under the REAL clock the old clamp (city-local year ±5) equals the new range (UTC year ±5) except around New Year, so [M2] can only see it when the smoke checks month pages with a shifted range',
      edits: [
          { file: SRV, find: 'const _calY = _calYOk ? _calYReq : _calTodayD.getFullYear();',
            replace: 'const _calY = _calM ? Math.max(_calTodayD.getFullYear() - 5, Math.min(_calTodayD.getFullYear() + 5, parseInt(_calM[1], 10))) : _calTodayD.getFullYear();', count: 1 },
          { file: SRV, find: 'const _calMo = _calYOk', replace: 'const _calMo = _calM', count: 1 },
      ] },
    { id: 'R3', expect: ['M3'], name: 'year page: prev/next arrow + pill range gates removed (back to 1900/2100)',
      edits: [
          { file: SRV, find: 'const _yPrevHtml = (_Y - 1 >= _yRange.SUPPORTED_MOON_YEAR_MIN) ?', replace: 'const _yPrevHtml = (_Y - 1 >= 1900) ?', count: 1 },
          { file: SRV, find: 'const _yNextHtml = (_Y + 1 <= _yRange.SUPPORTED_MOON_YEAR_MAX) ?', replace: 'const _yNextHtml = (_Y + 1 <= 2100) ?', count: 1 },
          { file: SRV, find: 'if (_Y - 1 >= _yRange.SUPPORTED_MOON_YEAR_MIN) _nav +=', replace: 'if (_Y - 1 >= 1900) _nav +=', count: 1 },
          { file: SRV, find: 'if (_Y + 1 <= _yRange.SUPPORTED_MOON_YEAR_MAX) _nav +=', replace: 'if (_Y + 1 <= 2100) _nav +=', count: 1 },
      ] },
    { id: 'R4', expect: ['M4'], name: 'legacy dated moon routes use 1900/2100 again (301 into a 404)',
      edits: [
          { file: SRV, find: 'if (_isSupportedMoonYear(_dy) && _dm >= 1 && _dm <= 12 && _dd >= 1 && _dd <= _dim) {',
            replace: 'if (_dy >= 1900 && _dy <= 2100 && _dm >= 1 && _dm <= 12 && _dd >= 1 && _dd <= _dim) {', count: 1 },
          { file: SRV, find: 'if (_isSupportedMoonYear(_my) && _mm >= 1 && _mm <= 12) {',
            replace: 'if (_my >= 1900 && _my <= 2100 && _mm >= 1 && _mm <= 12) {', count: 1 },
          { file: SRV, find: 'if (!_isSupportedMoonYear(_dy)) { _legacyMoon404(); return; }',
            replace: 'if (!(_dy >= 1900 && _dy <= 2100)) { _legacyMoon404(); return; }', count: 1 },
          { file: SRV, find: 'if (_mm >= 1 && _mm <= 12 && !_isSupportedMoonYear(_my)) { _legacyMoon404(); return; }',
            replace: 'if (_mm >= 1 && _mm <= 12 && !(_my >= 1900 && _my <= 2100)) { _legacyMoon404(); return; }', count: 1 },
          { file: SRV, find: 'if (_realDate && !_isSupportedMoonYear(_dp[0])) {',
            replace: 'if (_realDate && !(_dp[0] >= 1900 && _dp[0] <= 2100)) {', count: 1 },
      ] },
    { id: 'R5', expect: ['M5'], name: 'getSupportedMoonYearRange ignores TP_MOON_RANGE_TEST_NOW',
      edits: [{ file: SRV, find: 'const _t = process.env.TP_MOON_RANGE_TEST_NOW ? Date.parse(process.env.TP_MOON_RANGE_TEST_NOW) : NaN;', replace: 'const _t = NaN;', count: 1 }] },
    { id: 'R6', expect: ['I'], name: 'ssr-moon-year-range island removed',
      edits: [{ file: SRV, find: 'parts.push(`<script${_TP_NONCE_ATTR} id="ssr-moon-year-range">window.__MOON_YEAR_RANGE__={"min":${_mRange.SUPPORTED_MOON_YEAR_MIN},"max":${_mRange.SUPPORTED_MOON_YEAR_MAX}};</script>`);',
                replace: '/* RED R6: island removed */', count: 1 }] },
    { id: 'R7', expect: ['C1'], name: 'qibla gate restored to /qibla-in-.+(?:\\.html)?$/',
      edits: [{ file: SRV, find: '        _QIBLA_ROUTE_RE.test(urlPath) ||',
                replace: String.raw`        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?qibla-in-.+(?:\.html)?$/.test(urlPath) ||`, count: 1 }] },
    { id: 'R8', expect: ['C1'], name: 'D4 curated coordinate-variant detector disabled (time-left / next-prayer tails route again)',
      edits: [{ file: SRV, find: "return (stem && !(stem in Object.prototype) && _findPlaceBySlug(stem) && !_findPlaceBySlug(s)) ? stem : '';", replace: "return ''; /* RED R8 */", count: 1 }] },
    { id: 'R9', expect: ['C1'], name: 'prayer functional-variant (coords / loc-) noindex block removed',
      edits: [{ file: SRV, find: String.raw`if (!robotsOverride && /^\/prayer-times-in-(?:loc-\d{1,2}\.\d[ns]-\d{1,3}\.\d[ew]|[a-z][a-z0-9-]*?-(?:-?\d+(?:\.\d+)?)-(?:-?\d+(?:\.\d+)?))$/.test(corePath) && !_findPlaceBySlug(corePath.slice('/prayer-times-in-'.length))) {`,
                replace: 'if (false) { /* RED R9: functional-variant noindex removed */', count: 1 }] },
    { id: 'R10', expect: ['H1'], name: 'old ar/en-only .html rule restored (normalizer removed)',
      edits: [{ file: SRV, fn: (s) => {
          const a = s.indexOf(HTML_NORMALIZER_START), b = s.indexOf(HTML_LEGACY_RULE_NEW);
          if (a < 0 || b < 0 || b <= a || (b - a) > 6000) throw new Error('normalizer anchors not found in order (a=' + a + ' b=' + b + ')');
          if (s.indexOf(HTML_NORMALIZER_START, a + 1) >= 0 || s.indexOf(HTML_LEGACY_RULE_NEW, b + 1) >= 0) throw new Error('normalizer anchors not unique');
          return s.slice(0, a) + HTML_LEGACY_RULE_OLD + s.slice(b + HTML_LEGACY_RULE_NEW.length);
      } }] },
    { id: 'R11', expect: ['S1'], name: 'Singapore boot guard removed (singapore -> singapore-city 301 is back)',
      edits: [{ file: SRV, find: 'for (const _rk of Object.keys(CURATED_REDIRECTS)) {', replace: 'for (const _rk of []) { /* RED R11: guard removed */', count: 1 }] },
    { id: 'R12', expect: ['Q1'], name: 'a /quran <url> re-added to sitemap-main',
      edits: [{ file: SRV, find: '            // 1b) INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1: the Arabic Quran URLs (/quran + the 114 surahs) are',
                replace: "            entries.push('  <url>\\n    <loc>' + escapeXml(SITE_URL + '/quran') + '</loc>\\n    <changefreq>monthly</changefreq>\\n    <priority>0.8</priority>\\n  </url>');   /* RED R12 */\n"
                       + '            // 1b) INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1: the Arabic Quran URLs (/quran + the 114 surahs) are', count: 1 }] },
    { id: 'R13', expect: ['L1'], name: "bilingualUrl emits today's date as <lastmod>",
      edits: [{ file: SRV, find: String.raw`const _lastmodLine = (typeof lastmod === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(lastmod)) ?`,
                replace: "const _lastmodLine = (lastmod = new Date().toISOString().split('T')[0], true) ?", count: 1 }] },
    { id: 'R14', expect: ['K'], name: 'js/app.js setSEOMeta no longer uses _robotsForClientWrite (D12)',
      note: 'the smoke has NO static D12 guard; [K] is its static-source label (it checks app.js only for the island reader) — staying green here is a GAP (D12 is covered only at runtime by _browser_…[D12])',
      edits: [{ file: APP, find: "_seoUpsertMeta('robots', 'name', _robotsForClientWrite('index, follow'));", replace: "_seoUpsertMeta('robots', 'name', 'index, follow');", count: 1 }] },
];

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
function countOcc(s, f) { if (!f) return 0; let n = 0, i = 0; while ((i = s.indexOf(f, i)) >= 0) { n++; i += f.length; } return n; }
function applyEdit(src, e) {
    if (e.fn) { const out = e.fn(src); if (out === src) throw new Error('structural edit changed nothing'); return out; }
    let find = e.find, replace = e.replace, n = countOcc(src, find);
    if (n === 0 && find.includes('\n') && src.includes('\r\n')) { find = find.split('\n').join('\r\n'); replace = replace.split('\n').join('\r\n'); n = countOcc(src, find); }
    if (n !== e.count) throw new Error('anchor count ' + n + ' != expected ' + e.count + ' in ' + e.file + ' :: ' + find.slice(0, 90));
    const out = src.split(find).join(replace);
    if (out === src) throw new Error('edit changed nothing in ' + e.file);
    return out;
}
// read-only git on the worktree (--no-optional-locks: never refresh/write the worktree index)
function git(args) { return execFileSync('git', ['--no-optional-locks', '-C', WT, ...args], { encoding: 'buffer', maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'pipe'] }); }
function gitIn(dir, args) { return execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'pipe'] }); }
const WT_HEAD = git(['rev-parse', 'HEAD']).toString().trim();
const WT_OBJECTS = path.join(path.resolve(WT, git(['rev-parse', '--git-common-dir']).toString().trim()), 'objects').replace(/\\/g, '/');
function listFiles() {
    const split = (b) => b.toString('utf8').split('\0').filter(Boolean);
    const tracked = split(git(['ls-files', '-z']));
    const untracked = split(git(['ls-files', '-z', '--others', '--exclude-standard']));
    return { tracked, untracked };
}
function fingerprint() {
    const { tracked, untracked } = listFiles();
    const status = git(['status', '--porcelain=v1', '--untracked-files=all']).toString('utf8');
    const diff = git(['diff', '--binary', 'HEAD']);
    const h = crypto.createHash('sha256'); const perFile = {};
    for (const f of [...tracked, ...untracked].sort()) {
        let d = 'MISSING'; try { d = sha(fs.readFileSync(path.join(WT, f))); } catch (_) {}
        perFile[f] = d; if (tracked.includes(f)) h.update(f + '\0' + d + '\n');
    }
    return { status, diffSha: sha(diff), trackedManifestSha: h.digest('hex'), files: tracked.length + untracked.length, perFile, tracked: new Set(tracked),
             head: git(['rev-parse', 'HEAD']).toString().trim() };
}
function makeCopy(n) {
    const dir = path.join(COPY_PARENT, 'red-copy-' + n);
    removeCopy(dir);
    const { tracked, untracked } = listFiles();
    let copied = 0;
    for (const f of [...tracked, ...untracked]) {
        const src = path.join(WT, f);
        if (!fs.existsSync(src)) continue;          // deleted in the worktree → absent in the copy too
        const dst = path.join(dir, f);
        fs.mkdirSync(path.dirname(dst), { recursive: true });
        fs.copyFileSync(src, dst);
        copied++;
    }
    fs.symlinkSync(NODE_MODULES, path.join(dir, 'node_modules'), 'junction');
    // the copy's OWN git repo: objects are borrowed read-only via alternates (git never writes to an alternate store)
    gitIn(dir, ['init', '-q']);
    fs.mkdirSync(path.join(dir, '.git', 'objects', 'info'), { recursive: true });
    fs.writeFileSync(path.join(dir, '.git', 'objects', 'info', 'alternates'), WT_OBJECTS + '\n');
    gitIn(dir, ['update-ref', '--no-deref', 'HEAD', WT_HEAD]);
    gitIn(dir, ['read-tree', 'HEAD']);
    try { gitIn(dir, ['update-index', '-q', '--refresh']); } catch (_) { /* exit 1 = some files modified — expected */ }
    const copyDiff = gitIn(dir, ['diff', '--name-only']).split('\n').filter(Boolean).sort();
    const wtDiff = git(['diff', '--name-only']).toString('utf8').split('\n').filter(Boolean).sort();
    if (!eqJ(copyDiff, wtDiff)) throw new Error('copy git state differs from the worktree: copy=' + JSON.stringify(copyDiff) + ' worktree=' + JSON.stringify(wtDiff));
    return { dir, copied, gitDiff: copyDiff };
}
function removeCopy(dir) {
    if (!fs.existsSync(dir)) return;
    const nm = path.join(dir, 'node_modules');
    try {
        const st = fs.lstatSync(nm);
        if (st.isSymbolicLink()) { try { fs.unlinkSync(nm); } catch (_) { fs.rmdirSync(nm); } }
        else if (st.isDirectory()) throw new Error('refusing to delete ' + dir + ': node_modules is a real directory, not the junction');
    } catch (e) { if (e.code !== 'ENOENT') throw e; }
    if (fs.existsSync(nm)) throw new Error('junction still present in ' + dir);
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
}
function portFree(port) {
    return new Promise((resolve) => {
        const s = net.createServer(); s.once('error', () => resolve(false));
        s.once('listening', () => s.close(() => resolve(true)));
        s.listen(port, '127.0.0.1');
    });
}
const ACTIVE = new Set();
function killTree(pid) { try { execFileSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} }
async function bootHealth(root, port) {
    const get = () => new Promise((resolve) => {
        const req = http.request({ host: '127.0.0.1', port, path: '/health', method: 'GET' }, (res) => { res.resume(); res.on('end', () => resolve(res.statusCode)); });
        req.on('error', () => resolve(0)); req.setTimeout(5000, () => { req.destroy(); resolve(0); }); req.end();
    });
    const env = { ...process.env, PORT: String(port), SITE_URL: 'https://timesprayers.com', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' };
    delete env.TP_ENABLE_SEARCH_TEST; delete env.TP_MOON_RANGE_TEST_NOW;
    const child = spawn(process.execPath, ['server.js'], { cwd: root, env, stdio: ['ignore', 'ignore', 'pipe'] });
    ACTIVE.add(child.pid);
    let err = ''; child.stderr.on('data', d => { if (err.length < 4000) err += d; });
    let exited = null; child.on('exit', (c) => { exited = c; });
    let status = 0;
    try {
        for (let i = 0; i < 300 && exited === null; i++) { status = await get(); if (status === 200) break; await sleep(400); }
    } finally {
        killTree(child.pid); ACTIVE.delete(child.pid);
        for (let i = 0; i < 50 && !(await portFree(port)); i++) await sleep(200);
    }
    return { ok: status === 200, detail: status === 200 ? 'health 200' : ('health=' + status + ' exited=' + exited + ' stderr=' + err.replace(/\s+/g, ' ').slice(0, 300)) };
}
function runSmoke(copyRoot, logFile) {
    return new Promise((resolve) => {
        const c = spawn(process.execPath, [path.join(copyRoot, SMOKE_REL)], { cwd: copyRoot, env: smokeEnv(copyRoot), stdio: ['ignore', 'pipe', 'pipe'] });
        ACTIVE.add(c.pid);
        const chunks = []; c.stdout.on('data', d => chunks.push(d)); c.stderr.on('data', d => chunks.push(d));
        let timedOut = false;
        const t = setTimeout(() => { timedOut = true; killTree(c.pid); }, RUN_TIMEOUT_MS);
        c.on('close', (code) => {
            clearTimeout(t); killTree(c.pid); ACTIVE.delete(c.pid);
            const out = Buffer.concat(chunks).toString('utf8');
            try { fs.writeFileSync(logFile, out); } catch (_) {}
            resolve({ code: timedOut ? 'TIMEOUT' : code, out });
        });
    });
}

async function runOne(k, slot) {
    const ports = Array.from({ length: PORTS_PER_RUN }, (_, i) => PORT_MIN + slot * PORTS_PER_RUN + i);
    const row = { id: k.id, name: k.name, expect: k.expect, labels: [], code: null, ok: false, note: '', ports };
    const t0 = Date.now();
    let copy = null;
    try {
        for (const p of ports) if (!(await portFree(p))) throw new Error('port ' + p + ' is busy before the run');
        copy = makeCopy(k.id.toLowerCase());
        row.copied = copy.copied; row.copyGitDiff = copy.gitDiff.join(',');
        row.smokeSha = adaptSmokeInCopy(copy.dir, ports);   // suite-wide smoke snapshot, port-adapted (copy only)
        const touched = {};
        for (const e of (k.edits || [])) {
            const p = path.join(copy.dir, e.file);
            if (!(e.file in touched)) touched[e.file] = { before: sha(fs.readFileSync(p)), wt: sha(fs.readFileSync(path.join(WT, e.file))) };
            fs.writeFileSync(p, applyEdit(fs.readFileSync(p, 'utf8'), e), 'utf8');
        }
        for (const f in touched) {
            if (touched[f].before !== touched[f].wt) throw new Error('copy of ' + f + ' did not match the worktree before mutation');
            if (sha(fs.readFileSync(path.join(copy.dir, f))) === touched[f].before) throw new Error('mutation left ' + f + ' unchanged');
            execFileSync(process.execPath, ['--check', path.join(copy.dir, f)], { stdio: 'pipe' });
        }
        const health = await bootHealth(copy.dir, ports[0]);
        row.health = health.ok;
        if (!health.ok) throw new Error('copy did not boot healthy on :' + ports[0] + ' (' + health.detail + ')');
        const logFile = path.join(LOG_DIR, k.id + '.log');
        const res = await runSmoke(copy.dir, logFile);
        row.log = logFile; row.code = res.code; row.labels = redLabels(res.out); row.labelFails = labelFailCounts(res.out); row.green = greenCount(res.out);
        row.summary = smokeSummary(res.out); row.harness = /✗ HARNESS:/.test(res.out);
        row.redLines = (res.out.match(/✗ (?:\[[A-Z][A-Z0-9]*\]|HARNESS:)[^\n]*/g) || []);
        if (!row.summary) row.note += ' | smoke printed no summary line';
        if (row.harness) row.note += ' | smoke HARNESS failure: ' + ((res.out.match(/✗ HARNESS:[^\n]*/) || [''])[0]).slice(0, 200);
        if (k.id === 'R0') {
            row.ok = res.code === 0 && row.labels.length === 0 && !row.harness && !!row.summary && row.summary.fail === 0;
        } else {
            row.missing = k.expect.filter(l => !row.labels.includes(l));
            row.ok = res.code !== 0 && res.code !== 'TIMEOUT' && !!row.summary && row.missing.length === 0;
            if (!row.ok && k.note) row.note += ' | ' + k.note;
        }
    } catch (e) {
        row.ok = false; row.note += ' | ERROR: ' + String(e.message).split('\n')[0];
    } finally {
        if (copy) { try { removeCopy(copy.dir); } catch (e) { row.note += ' | copy delete failed: ' + e.message; } row.copyDeleted = !fs.existsSync(copy.dir); if (!row.copyDeleted) row.ok = false; }
        for (const p of ports) if (!(await portFree(p))) { row.ok = false; row.note += ' | port ' + p + ' still busy after the run'; }
        row.secs = Math.round((Date.now() - t0) / 1000);
        row.note = row.note.replace(/^ \| /, '');
    }
    return row;
}
function printRow(r) {
    console.log('\n[' + r.id + '] ' + r.name + '   (ports ' + r.ports.join(',') + ')');
    const s = r.summary ? 'smoke PASS ' + r.summary.pass + ' FAIL ' + r.summary.fail : 'no smoke summary';
    if (r.id === 'R0') console.log('     control: exit=' + r.code + '  ' + s + '  red labels=' + (r.labels.join(',') || 'none') + '  ->  ' + (r.ok ? 'GREEN (control valid)' : 'NOT GREEN'));
    else console.log('     expected red: [' + r.expect.join('][') + ']   exit=' + r.code + '   ' + s + '   red labels=' + (Object.entries(r.labelFails || {}).map(([l, n]) => l + '×' + n).join(',') || 'none')
        + '   ->  ' + (r.ok ? 'RED AS EXPECTED' : 'DID NOT GO RED AS EXPECTED' + (r.missing && r.missing.length ? ' (missing ' + r.missing.join(',') + ')' : '')));
    if (r.note) console.log('     note: ' + r.note);
    console.log('     copy files=' + r.copied + ' git-diff=' + r.copyGitDiff + '  health=' + r.health + '  copy deleted=' + r.copyDeleted + '  smoke sha256=' + r.smokeSha + '…  ' + r.secs + 's  log=' + r.log);
    const want = (r.redLines || []).filter(l => r.id === 'R0' || (r.expect || []).some(x => l.startsWith('✗ [' + x + ']')));
    want.slice(0, 3).forEach(l => console.log('       ' + l.slice(0, 220)));
}

(async () => {
    const only = process.env.TP_RED_ONLY ? new Set(process.env.TP_RED_ONLY.split(',').map(s => s.trim())) : null;
    process.on('SIGINT', () => { for (const pid of ACTIVE) killTree(pid); for (const d of fs.readdirSync(COPY_PARENT)) if (/^red-copy-r(\d+|dry)$/.test(d)) { try { removeCopy(path.join(COPY_PARENT, d)); } catch (_) {} } process.exit(130); });
    if (!fs.existsSync(NODE_MODULES)) { console.log('node_modules not found: ' + NODE_MODULES); process.exit(2); }

    if (process.env.TP_RED_DRY === '1') {
        // DRY: every mutation applies + parses; one copy/junction/git/port-adapt/delete cycle; no smoke, no server.
        let bad = 0;
        const fp0 = fingerprint();
        for (const k of CASES) {
            const cache = {};
            try {
                for (const e of k.edits) cache[e.file] = applyEdit(cache[e.file] ?? fs.readFileSync(path.join(WT, e.file), 'utf8'), e);
                for (const f in cache) {
                    const tmp = path.join(COPY_PARENT, 'red-syntax-' + k.id + '-' + path.basename(f));
                    fs.writeFileSync(tmp, cache[f], 'utf8');
                    try { execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' }); } finally { fs.rmSync(tmp, { force: true }); }
                }
                console.log('  ✓ [' + k.id + '] mutation applies + parses (' + Object.keys(cache).join(',') + ')');
            } catch (e) { bad++; console.log('  ✗ [' + k.id + '] ' + String(e.message).split('\n').slice(0, 4).join(' | ')); }
        }
        const nm0 = fs.readdirSync(NODE_MODULES).length;
        const c = makeCopy('rdry');
        const same = sha(fs.readFileSync(path.join(c.dir, 'server.js'))) === sha(fs.readFileSync(path.join(WT, 'server.js')));
        const jOk = fs.lstatSync(path.join(c.dir, 'node_modules')).isSymbolicLink() && fs.existsSync(path.join(c.dir, 'node_modules', 'terser'));
        let smokeOk = false, gitOk = false;
        try {
            if (fs.existsSync(path.join(c.dir, SMOKE_REL))) { adaptSmokeInCopy(c.dir, [8841, 8842, 8843, 8844]); smokeOk = fs.readFileSync(path.join(c.dir, SMOKE_REL), 'utf8').includes('const AFTER_PORT = 8841, BASE_PORT = 8842, SEAM1_PORT = 8843, SEAM2_PORT = 8844;'); }
            gitOk = gitIn(c.dir, ['rev-parse', 'c126604^{tree}']).trim() === git(['rev-parse', 'c126604^{tree}']).toString().trim();
            execFileSync('git', ['-C', c.dir, 'diff', '--quiet', '--', 'js/moon.js', 'js/prayer-times.js', 'db', 'sw.js', 'css'], { stdio: 'ignore' });
        } catch (e) { gitOk = false; console.log('  ✗ copy git/smoke adapt: ' + String(e.message).split('\n')[0]); }
        removeCopy(c.dir);
        const fp1 = fingerprint();
        const wtSame = fp0.trackedManifestSha === fp1.trackedManifestSha && fp0.diffSha === fp1.diffSha && fp0.head === fp1.head;
        const ok = !bad && same && jOk && smokeOk && gitOk && !fs.existsSync(c.dir) && fs.readdirSync(NODE_MODULES).length === nm0 && wtSame;
        console.log('  copy files=' + c.copied + ' git-diff=' + c.gitDiff.join(',') + ' server.js identical=' + same + ' junction ok=' + jOk + ' smoke port-adapt ok=' + smokeOk
            + ' copy git (c126604 tree + diff --quiet guarded paths) ok=' + gitOk + ' copy deleted=' + !fs.existsSync(c.dir) + ' node_modules ' + nm0 + '/' + fs.readdirSync(NODE_MODULES).length + ' worktree unchanged=' + wtSame);
        console.log('DRY ' + (ok ? 'PASS' : 'FAIL'));
        process.exit(ok ? 0 : 1);
    }

    if (!fs.existsSync(path.join(WT, SMOKE_REL))) { console.log('smoke not found: ' + path.join(WT, SMOKE_REL)); process.exit(2); }
    if (!fs.existsSync(BASE_ROOT)) { console.log('TP_BASE_ROOT not found: ' + BASE_ROOT); process.exit(2); }
    if (PORT_MIN + PARALLEL * PORTS_PER_RUN - 1 > PORT_MAX) { console.log('TP_RED_PARALLEL=' + PARALLEL + ' needs more than ports 8841-8849'); process.exit(2); }
    for (let p = PORT_MIN; p < PORT_MIN + PARALLEL * PORTS_PER_RUN; p++) if (!(await portFree(p))) { console.log('port ' + p + ' is busy — refusing to run (a stale server would falsify results)'); process.exit(2); }
    fs.mkdirSync(LOG_DIR, { recursive: true });
    const nmBefore = fs.readdirSync(NODE_MODULES).length;
    console.log('worktree   = ' + WT + '  (HEAD ' + WT_HEAD + ')');
    console.log('base root  = ' + BASE_ROOT);
    console.log('copies in  = ' + COPY_PARENT + path.sep + 'red-copy-<id>   parallel=' + PARALLEL + '   logs=' + LOG_DIR);
    const fpBefore = fingerprint();
    console.log('worktree fingerprint (before): files=' + fpBefore.files + '  diff sha256=' + fpBefore.diffSha.slice(0, 16) + '  tracked manifest sha256=' + fpBefore.trackedManifestSha.slice(0, 16));

    // every mutation must apply to the CURRENT worktree sources before anything is run (fail fast on drift)
    let preBad = 0;
    for (const k of CASES) {
        if (only && !only.has(k.id)) continue;
        const cache = {};
        try { for (const e of k.edits) cache[e.file] = applyEdit(cache[e.file] ?? fs.readFileSync(path.join(WT, e.file), 'utf8'), e); }
        catch (e) { preBad++; console.log('  [' + k.id + '] mutation does not apply to the worktree: ' + e.message); }
    }
    if (preBad) { console.log('refusing to run: ' + preBad + ' mutation(s) do not apply'); process.exit(2); }

    const rows = [];
    const T0 = Date.now();
    try {
        if (!only || only.has('R0')) {
            console.log('\n[R0] control — unmutated copy must be fully GREEN');
            const r0 = await runOne({ id: 'R0', name: 'control (no mutation)', expect: [], edits: [] }, 0);
            printRow(r0); rows.push(r0);
        }
        const queue = CASES.filter(k => !only || only.has(k.id));
        let next = 0;
        const worker = async (slot) => {
            while (next < queue.length) {
                const k = queue[next++];
                console.log('\n… ' + k.id + ' started (slot ' + slot + ', ' + Math.round((Date.now() - T0) / 1000) + 's)');
                const r = await runOne(k, slot); printRow(r); rows.push(r);
            }
        };
        await Promise.all(Array.from({ length: PARALLEL }, (_, s) => worker(s)));
    } finally {
        for (const pid of ACTIVE) killTree(pid);
        for (const d of fs.readdirSync(COPY_PARENT)) {
            if (/^red-copy-r(\d+|dry)$/.test(d)) { try { removeCopy(path.join(COPY_PARENT, d)); } catch (e) { console.log('leftover copy not removed: ' + d + ' ' + e.message); } }
        }
    }

    const fpAfter = fingerprint();
    const changed = Object.keys({ ...fpBefore.perFile, ...fpAfter.perFile }).filter(f => fpBefore.perFile[f] !== fpAfter.perFile[f]);
    // HARD proof: HEAD, tracked diff, tracked status lines and every tracked file's bytes are identical. This runner only
    // writes under COPY_PARENT, so an UNTRACKED file that appears/changes meanwhile (another author's ticket script) is
    // reported by name — it is not attributed to this runner and cannot mask a tracked change.
    //   Other ticket authors may edit test scripts in the SAME worktree while the suite runs, so the proof is two-tier:
    //   HARD  = HEAD + the bytes and status lines of every tracked file OUTSIDE scripts/ (product files) + this runner file;
    //   INFO  = scripts/* (tracked or untracked) changed by another writer, listed by path with before->after sha256.
    const SELF = 'scripts/_red_indexable_route_surface_containment_1.mjs';
    const isScript = (f) => f.startsWith('scripts/') && f !== SELF;
    const statusPath = (l) => l.slice(3).replace(/^"|"$/g, '');
    const hardStatus = (s) => s.split('\n').filter(l => l && !l.startsWith('??') && !isScript(statusPath(l))).join('\n');
    const trackedChanged = changed.filter(f => (fpBefore.tracked.has(f) || fpAfter.tracked.has(f)) && !isScript(f));
    const untrackedChanged = changed.filter(f => !trackedChanged.includes(f));
    const wtSame = fpBefore.head === fpAfter.head && hardStatus(fpBefore.status) === hardStatus(fpAfter.status) && trackedChanged.length === 0
        && fpBefore.perFile[SELF] === fpAfter.perFile[SELF];
    const leftovers = fs.readdirSync(COPY_PARENT).filter(d => /^red-copy-r(\d+|dry)$/.test(d));
    const nmAfter = fs.existsSync(NODE_MODULES) ? fs.readdirSync(NODE_MODULES).length : -1;
    const smokeShas = [...new Set(rows.map(r => r.smokeSha).filter(Boolean))];

    const order = ['R0', ...CASES.map(k => k.id)];
    rows.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    console.log('\n================================================================================================');
    for (const r of rows) {
        const reds = Object.entries(r.labelFails || {}).map(([l, n]) => l + '×' + n).join(',') || 'none';
        console.log('  ' + r.id.padEnd(4) + (r.ok ? 'OK  ' : 'BAD ') + (r.id === 'R0' ? 'expect GREEN ' : 'expect [' + r.expect.join('][') + ']').padEnd(14)
            + ' exit=' + String(r.code).padEnd(4) + (r.summary ? ' PASS ' + String(r.summary.pass).padStart(4) + ' FAIL ' + String(r.summary.fail).padStart(3) : ' (no summary)     ')
            + '  red=' + reds.padEnd(34) + ' ' + r.name);
    }
    console.log('  smoke sha256 used by the runs: ' + smokeShas.join(', ') + (smokeShas.length > 1 ? '   (WARNING: the smoke changed during the suite)' : ''));
    console.log('  worktree unchanged (HEAD + tracked diff + tracked status + tracked bytes) = ' + wtSame + (trackedChanged.length ? '  TRACKED CHANGED: ' + trackedChanged.join(', ') : ''));
    if (untrackedChanged.length) console.log('  note: untracked files added/changed by another writer during the suite: '
        + untrackedChanged.map(f => f + ' ' + String(fpBefore.perFile[f] || 'ABSENT').slice(0, 12) + '->' + String(fpAfter.perFile[f] || 'ABSENT').slice(0, 12)).join(', '));
    console.log('  disposable copies left = ' + leftovers.length + '   node_modules entries before/after = ' + nmBefore + '/' + nmAfter + '   total ' + Math.round((Date.now() - T0) / 1000) + 's');
    const good = rows.filter(r => r.ok).length, bad = rows.length - good;
    console.log('  RED SUITE: ' + good + ' ok, ' + bad + ' bad');
    console.log('================================================================================================');
    process.exit(bad === 0 && wtSame && leftovers.length === 0 && nmBefore === nmAfter ? 0 : 1);
})();
