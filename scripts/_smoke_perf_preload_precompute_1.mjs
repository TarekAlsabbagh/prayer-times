// Smoke — PERF-PRELOAD-PRECOMPUTE-1.
// The static files in _preloadPaths (HTML templates excluded) can be minified + gzipped + brotli-q11'd ONCE at build
// time (npm postinstall -> scripts/build-preload-cache.js) instead of in every worker at boot. This smoke locks:
//   [A] static wiring: one recipe shared by build and boot path, HTML never prebuilt, cache dir never public,
//       postinstall hook never fails the install.
//   [B] module-level fallback, the three owner-required cases + variants:
//       B1 prebuilt file absent (no manifest / not in manifest)
//       B2 fingerprint differs (source bytes changed / recipe changed)
//       B3 damaged artifact (flipped byte / truncated / manifest garbage / compressed copy that decodes to other bytes)
//   [C] server-level: a server booted on a valid cache, and servers booted on an absent, a recipe-mismatched and a
//       damaged cache, serve byte-identical static responses (identity / gzip / br, wire bytes + headers) and an
//       identical homepage (nonce + clock normalised); each logs exactly one [preload-prebuilt] line; /health only
//       answers once the worker listens; the cache directory is not reachable over HTTP.
// Local only: ports SMOKE_PORT_BASE..+3 (default 8820), ADSENSE_CLIENT=off, Supabase variables never passed.
//   node scripts/_smoke_perf_preload_precompute_1.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import http from 'node:http';
import crypto from 'node:crypto';
import { spawn, spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const P = require(path.join(ROOT, 'server', 'preload-prebuilt.js'));
const PORT0 = Number(process.env.SMOKE_PORT_BASE || 8820);
const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
let pass = 0, fail = 0; const F = [];
const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-preload-smoke-'));
const KEEP = ['PATH', 'Path', 'SystemRoot', 'SYSTEMROOT', 'SystemDrive', 'windir', 'TEMP', 'TMP', 'USERPROFILE', 'HOMEDRIVE', 'HOMEPATH', 'HOME', 'ComSpec', 'PATHEXT'];
const baseEnv = (extra) => { const e = {}; for (const k of KEEP) if (process.env[k] !== undefined) e[k] = process.env[k]; return Object.assign(e, { ADSENSE_CLIENT: 'off', SITE_URL: 'http://localhost:8080' }, extra); };
const copyDir = (a, b) => { fs.mkdirSync(b, { recursive: true }); for (const f of fs.readdirSync(a)) fs.copyFileSync(path.join(a, f), path.join(b, f)); };

const rels = P.readPreloadPathsFromServer(src);
const statics = rels.filter(P.isPrebuildable);
const htmls = rels.filter(r => !P.isPrebuildable(r));

console.log('\n--- A) static wiring ---');
ok(htmls.length === 5 && htmls.every(r => r.endsWith('.html')), 'HTML templates are excluded from prebuilding: ' + htmls.join(' '));
ok(statics.length === 25 && statics.every(r => !r.endsWith('.html')), '25 static files are prebuildable (css/js/sw.js/ttf)');
ok(P.NONCE_PLACEHOLDER === (src.match(/const _TP_NONCE_TOKEN = '([^']+)'/) || [])[1], 'the module guards on the same nonce placeholder server.js emits');
ok(statics.every(r => !P.carriesRequestPlaceholder(fs.readFileSync(path.join(ROOT, r)))), 'none of the 25 static files carries the nonce placeholder');
ok(htmls.every(r => P.carriesRequestPlaceholder(fs.readFileSync(path.join(ROOT, r)))), 'every excluded HTML template carries it (why they are excluded)');
ok(/const _preloadRecipe = require\('\.\/server\/preload-prebuilt'\);/.test(src), 'server.js loads the shared recipe module');
ok(/new CleanCSS\(_preloadRecipe\.cleanCssOptions\(\)\)/.test(src) && /Terser\.minify\(src, _preloadRecipe\.terserOptions\(\)\)/.test(src)
  && /brotliCompressSync\(data, _preloadRecipe\.brotliOptions\(\)/.test(src), 'the boot-time path uses the SAME option factories as the build');
{
  const body = src.slice(src.indexOf('async function _preloadStatic()'), src.indexOf('const _preloadReady = _preloadStatic();'));
  ok(body.length > 1000 && !/\{ compress: true, mangle: true \}/.test(body) && !/BROTLI_PARAM_QUALITY\]: 11/.test(body) && !/level: 2/.test(body),
    'no second copy of the minify/brotli options remains in _preloadStatic()');
}
ok(JSON.stringify(P.terserOptions()) === '{"compress":true,"mangle":true}' && JSON.stringify(P.cleanCssOptions()) === '{"returnPromise":false,"level":2}'
  && P.brotliOptions().params[zlib.constants.BROTLI_PARAM_QUALITY] === 11, 'recipe values are exactly the pre-change ones (Terser compress+mangle, CleanCSS level 2, brotli q11)');
{
  const dirs = (src.match(/const _PUBLIC_STATIC_DIRS = \[([^\]]*)\]/) || [])[1] || '';
  const files = (src.match(/const _PUBLIC_STATIC_FILES = new Set\(\[([\s\S]*?)\]\)/) || [])[1] || '';
  ok(dirs && !/preload/.test(dirs) && !/preload/.test(files), '.preload-cache is in neither public static allowlist');
}
{
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  ok(pkg.scripts && pkg.scripts.postinstall === 'node scripts/build-preload-cache.js', 'package.json postinstall runs the build step');
  ok(pkg.scripts.start === 'node server.js', 'start command unchanged');
  ok(/^\.preload-cache\/$/m.test(fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8')), '.preload-cache/ is gitignored');
  const b = fs.readFileSync(path.join(ROOT, 'scripts', 'build-preload-cache.js'), 'utf8');
  ok(/process\.exitCode = 0/.test(b) && !/process\.exit\(1\)/.test(b), 'the build step never fails npm install');
}

console.log('\n--- B) build + module-level fallback cases ---');
const A = path.join(scratch, 'valid');
{
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'build-preload-cache.js')], { cwd: ROOT, env: baseEnv({ TP_PRELOAD_CACHE_DIR: A }), encoding: 'utf8' });
  ok(r.status === 0 && /\[preload-prebuild\] built 25\/25 static files/.test(r.stdout), 'build step: built 25/25 -> ' + (r.stdout || '').trim().split('\n').pop());
  ok(fs.existsSync(path.join(A, 'manifest.json')) && !fs.readdirSync(scratch).some(f => f.includes('.tmp-')), 'manifest written, no temp dir left behind');
  const m = JSON.parse(fs.readFileSync(path.join(A, 'manifest.json'), 'utf8'));
  ok(Object.keys(m.files).sort().join() === statics.slice().sort().join(), 'manifest lists exactly the prebuildable files');
  const bsrc = fs.readFileSync(path.join(ROOT, 'scripts', 'build-preload-cache.js'), 'utf8');
  ok(/carriesRequestPlaceholder\(src\)/.test(bsrc), 'the build step also skips any source carrying the nonce placeholder');
  ok(m.recipe === P.recipeFingerprint() && m.recipeInfo.terser && m.recipeInfo.cleancss && m.recipeInfo.node === process.version, 'manifest carries the recipe fingerprint (Node/zlib/brotli/Terser/clean-css + options)');
  const off = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'build-preload-cache.js')], { cwd: ROOT, env: baseEnv({ TP_PRELOAD_CACHE_DIR: path.join(scratch, 'off'), TP_PRELOAD_PREBUILD: 'off' }), encoding: 'utf8' });
  ok(off.status === 0 && !fs.existsSync(path.join(scratch, 'off')), 'TP_PRELOAD_PREBUILD=off skips the build step');
  fs.writeFileSync(path.join(scratch, 'blocker'), 'a file where the cache dir would go');
  const broken = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'build-preload-cache.js')], { cwd: ROOT, env: baseEnv({ TP_PRELOAD_CACHE_DIR: path.join(scratch, 'blocker', 'sub') }), encoding: 'utf8' });
  ok(broken.status === 0 && /\[preload-prebuild\] FAILED, server will minify\+compress at boot instead/.test(broken.stderr + broken.stdout),
    'a build step that cannot write still exits 0 (npm install is never failed by it)');
}
const readSrc = (rel) => fs.readFileSync(path.join(ROOT, rel));
{
  const pb = P.openPrebuilt(ROOT, { dir: A });
  let hits = 0, decodeOk = 0;
  for (const rel of statics) { const e = pb.take(rel, readSrc(rel)); if (e) { hits++; if (zlib.gunzipSync(e.gzipped).equals(e.data) && zlib.brotliDecompressSync(e.brotli).equals(e.data)) decodeOk++; } }
  ok(hits === 25 && decodeOk === 25, 'valid cache: 25/25 taken, gzip + brotli decode to the raw copy');
  ok(pb.take('index.html', readSrc('index.html')) === null && pb.stats.miss === 0, 'HTML is never taken (and not counted as a miss)');
  ok(pb.summary(25) === '[preload-prebuilt] used 25/25 prebuilt static files', 'summary line: ' + pb.summary(25));
}
// B1: absent
{
  const empty = path.join(scratch, 'empty'); fs.mkdirSync(empty);
  const pb = P.openPrebuilt(ROOT, { dir: empty });
  const all = statics.map(rel => pb.take(rel, readSrc(rel)));
  ok(all.every(x => x === null) && pb.stats.reasons['manifest-missing'] === 25, 'B1 absent cache: every file falls back (manifest-missing=25)');
  const line = pb.summary(25);
  ok(!/\n/.test(line) && /^\[preload-prebuilt\] fallback to boot-time minify\+compress for 25\/25 static files \(used 0\); reasons: manifest-missing=25/.test(line), 'B1 one log line: ' + line.slice(0, 120));
  // asset paths such as js/footer-cookie.js are fine; request data is not
  ok(!/(\d{1,3}\.){3}\d{1,3}|user-agent|set-cookie|cookie=|https?:\/\/|\?/i.test(line), 'B1 log line carries no visitor data (no IP / UA / cookie value / URL / query)');
  const C = path.join(scratch, 'one-missing'); copyDir(A, C);
  const m = JSON.parse(fs.readFileSync(path.join(C, 'manifest.json'), 'utf8')); delete m.files['js/qibla.js']; fs.writeFileSync(path.join(C, 'manifest.json'), JSON.stringify(m));
  const pb2 = P.openPrebuilt(ROOT, { dir: C });
  ok(pb2.take('js/qibla.js', readSrc('js/qibla.js')) === null && pb2.stats.reasons['not-in-manifest'] === 1 && pb2.take('js/app.js', readSrc('js/app.js')) !== null, 'B1 one file absent from the manifest: only that file falls back');
  const D = path.join(scratch, 'artifact-gone'); copyDir(A, D); fs.rmSync(path.join(D, P.artifactName('css/style.css', 'br')));
  const pb3 = P.openPrebuilt(ROOT, { dir: D });
  ok(pb3.take('css/style.css', readSrc('css/style.css')) === null && pb3.stats.reasons['artifact-corrupt'] === 1, 'B1 artifact file deleted: that file falls back');
  const pbOff = P.openPrebuilt(ROOT, { dir: A, disabled: true });
  ok(pbOff.take('js/app.js', readSrc('js/app.js')) === null && pbOff.stats.reasons.disabled === 1, 'kill switch (TP_PRELOAD_PREBUILT=off): falls back even with a valid cache');
}
// B2: fingerprint differs
{
  const pb = P.openPrebuilt(ROOT, { dir: A });
  const changed = Buffer.concat([readSrc('js/app.js'), Buffer.from('\n// edited after the build\n')]);
  ok(pb.take('js/app.js', changed) === null && pb.stats.reasons['source-changed'] === 1, 'B2 source edited after the build: falls back (source-changed)');
  ok(pb.take('js/i18n.js', readSrc('js/i18n.js')) !== null, 'B2 the other, unchanged files are still taken');
  ok(pb.take('js/duas.js', Buffer.concat([readSrc('js/duas.js'), Buffer.from('/* __TP_CSP_NONCE__ */')])) === null && pb.stats.reasons['request-placeholder'] === 1,
    'B2 a source that now carries the nonce placeholder is never taken (request-placeholder)');
  const R = path.join(scratch, 'recipe'); copyDir(A, R);
  const m = JSON.parse(fs.readFileSync(path.join(R, 'manifest.json'), 'utf8')); m.recipe = sha(Buffer.from('terser 5.0.0 / other options')); fs.writeFileSync(path.join(R, 'manifest.json'), JSON.stringify(m));
  const pbR = P.openPrebuilt(ROOT, { dir: R });
  ok(statics.every(rel => pbR.take(rel, readSrc(rel)) === null) && pbR.stats.reasons['recipe-mismatch'] === 25, 'B2 recipe fingerprint differs (tool version / options): all 25 fall back (recipe-mismatch)');
  const V = path.join(scratch, 'format'); copyDir(A, V);
  const mv = JSON.parse(fs.readFileSync(path.join(V, 'manifest.json'), 'utf8')); mv.format = 999; fs.writeFileSync(path.join(V, 'manifest.json'), JSON.stringify(mv));
  ok(P.openPrebuilt(ROOT, { dir: V }).take('js/app.js', readSrc('js/app.js')) === null, 'B2 unknown manifest format: falls back');
}
// B3: damaged
{
  const C = path.join(scratch, 'corrupt'); copyDir(A, C);
  const fbr = path.join(C, P.artifactName('js/app.js', 'br')); const b = fs.readFileSync(fbr); b[Math.floor(b.length / 2)] ^= 0xff; fs.writeFileSync(fbr, b);
  const fraw = path.join(C, P.artifactName('css/critical.css', 'raw')); fs.writeFileSync(fraw, fs.readFileSync(fraw).subarray(0, 100));
  const pb = P.openPrebuilt(ROOT, { dir: C });
  ok(pb.take('js/app.js', readSrc('js/app.js')) === null, 'B3 flipped byte in the brotli copy: falls back');
  ok(pb.take('css/critical.css', readSrc('css/critical.css')) === null && pb.stats.reasons['artifact-corrupt'] === 2, 'B3 truncated raw copy: falls back (artifact-corrupt=2)');
  ok(pb.take('js/moon.js', readSrc('js/moon.js')) !== null, 'B3 undamaged files are still taken');
  // a gzip copy whose recorded checksum matches but which decodes to OTHER bytes (a build bug, not disk damage)
  const G = path.join(scratch, 'gzwrong'); copyDir(A, G);
  const mg = JSON.parse(fs.readFileSync(path.join(G, 'manifest.json'), 'utf8'));
  const wrong = zlib.gzipSync(Buffer.from('not the minified file'));
  fs.writeFileSync(path.join(G, mg.files['js/duas.js'].out.gz.file), wrong);
  mg.files['js/duas.js'].out.gz.len = wrong.length; mg.files['js/duas.js'].out.gz.sha256 = sha(wrong);
  fs.writeFileSync(path.join(G, 'manifest.json'), JSON.stringify(mg));
  const pbG = P.openPrebuilt(ROOT, { dir: G });
  ok(pbG.take('js/duas.js', readSrc('js/duas.js')) === null && pbG.stats.reasons['gzip-mismatch'] === 1, 'B3 gzip copy decoding to other bytes: falls back (gzip-mismatch)');
  const J = path.join(scratch, 'garbage'); copyDir(A, J); fs.writeFileSync(path.join(J, 'manifest.json'), '{"format":1,"files":{');
  const pbJ = P.openPrebuilt(ROOT, { dir: J });
  ok(pbJ.take('js/app.js', readSrc('js/app.js')) === null && pbJ.stats.reasons['manifest-unreadable'] === 1, 'B3 manifest is not valid JSON: falls back (manifest-unreadable)');
  const T = path.join(scratch, 'traversal'); copyDir(A, T);
  const mt = JSON.parse(fs.readFileSync(path.join(T, 'manifest.json'), 'utf8')); mt.files['js/app.js'].out.raw.file = '../valid/' + mt.files['js/app.js'].out.raw.file; fs.writeFileSync(path.join(T, 'manifest.json'), JSON.stringify(mt));
  ok(P.openPrebuilt(ROOT, { dir: T }).take('js/app.js', readSrc('js/app.js')) === null, 'B3 manifest entry pointing outside the cache dir is refused');
}

console.log('\n--- C) server level: valid vs absent vs recipe-mismatch vs damaged cache ---');
const get = (port, p, h = {}) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port, path: p, headers: Object.assign({ host: 'localhost:8080' }, h), agent: false }, (x) => {
    const c = []; x.on('error', rej); x.on('data', d => c.push(d)); x.on('end', () => res({ status: x.statusCode, headers: x.headers, body: Buffer.concat(c) }));
  }); r.on('error', rej); r.setTimeout(30000, () => r.destroy(new Error('timeout'))); r.end();
});
const getR = async (port, p, h) => { for (let i = 0; ; i++) { try { return await get(port, p, h); } catch (e) { if (i >= 2) throw e; await new Promise(r => setTimeout(r, 300)); } } };
const health = (port) => new Promise((res) => { const r = http.get({ host: '127.0.0.1', port, path: '/health', agent: false, timeout: 1000 }, (x) => { x.resume(); x.on('end', () => res(x.statusCode)); }); r.on('error', () => res(0)); r.on('timeout', () => { r.destroy(); res(0); }); });
async function boot(name, port, cacheDir) {
  if (await health(port) !== 0) throw new Error('port ' + port + ' busy');
  const out = [];
  const p = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: baseEnv({ PORT: String(port), WEB_CONCURRENCY: '1', TP_PRELOAD_CACHE_DIR: cacheDir }), stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  spawned.push(p);
  p.stdout.on('data', d => out.push(d.toString())); p.stderr.on('data', d => out.push(d.toString()));
  let healthBeforeListen = false;
  const t0 = Date.now();
  for (;;) {
    if (p.exitCode !== null) throw new Error(name + ' exited: ' + out.join(''));
    if (Date.now() - t0 > 180000) throw new Error(name + ' not healthy');
    const st = await health(port);
    if (st === 200) { if (!/Server running at/.test(out.join(''))) healthBeforeListen = true; break; }
    await new Promise(r => setTimeout(r, 100));
  }
  return { name, port, p, log: () => out.join(''), readyMs: Date.now() - t0, healthBeforeListen };
}
const spawned = [];   // every server process this smoke started -- and only those -- is killed at the end
const kill = (p) => { try { if (process.platform === 'win32') execFileSync('taskkill', ['/PID', String(p.pid), '/T', '/F'], { stdio: 'ignore' }); else p.kill('SIGKILL'); } catch (_e) {} };
const norm = (h) => h.replace(/nonce="[A-Za-z0-9+/=]+"/g, 'nonce="N"').replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/g, 'TS').replace(/>\d\d:\d\d:\d\d</g, '>T<');
const servers = [];
try {
  servers.push(...await Promise.all([
    boot('valid', PORT0, A),
    boot('absent', PORT0 + 1, path.join(scratch, 'empty')),
    boot('recipe', PORT0 + 2, path.join(scratch, 'recipe')),
    boot('damaged', PORT0 + 3, path.join(scratch, 'corrupt')),
  ]));
  const [V, ...others] = servers;
  const pbLines = (s) => s.log().split(/\r?\n/).filter(l => l.startsWith('[preload-prebuilt]'));
  ok(pbLines(V).length === 1 && pbLines(V)[0] === '[preload-prebuilt] used 25/25 prebuilt static files', 'valid: ' + pbLines(V)[0]);
  ok(pbLines(servers[1]).length === 1 && /manifest-missing=25/.test(pbLines(servers[1])[0]), 'absent: ' + (pbLines(servers[1])[0] || '').slice(0, 110));
  ok(pbLines(servers[2]).length === 1 && /recipe-mismatch=25/.test(pbLines(servers[2])[0]), 'recipe: ' + (pbLines(servers[2])[0] || '').slice(0, 110));
  ok(pbLines(servers[3]).length === 1 && /for 2\/25 static files \(used 23\); reasons: artifact-corrupt=2/.test(pbLines(servers[3])[0]), 'damaged: ' + (pbLines(servers[3])[0] || '').slice(0, 130));
  ok(servers.every(s => !s.healthBeforeListen && /Server running at/.test(s.log())), '/health answered only after the worker listened (preload awaited)');
  ok(servers.every(s => (s.log().match(/\[Cache\] Preloaded 30 files/g) || []).length === 1), 'all four preloaded the same 30 files');
  let same = 0, total = 0; const bad = [];
  for (const rel of statics) {
    for (const enc of [null, 'gzip', 'br']) {
      const h = enc ? { 'accept-encoding': enc } : {};
      const ref = await getR(V.port, '/' + rel + '?v=1', h);
      for (const o of others) {
        const r = await getR(o.port, '/' + rel + '?v=1', h);
        total++;
        const hs = (x) => JSON.stringify(Object.entries(x.headers).filter(([k]) => k !== 'date').map(([k, v]) => [k, k.startsWith('content-security-policy') ? String(v).replace(/'nonce-[^']+'/g, "'nonce-N'") : v]));
        if (r.status === ref.status && r.body.equals(ref.body) && hs(r) === hs(ref)) same++; else bad.push(o.name + ' ' + rel + ' ' + enc);
      }
    }
  }
  ok(same === total && total === 25 * 3 * 3, 'every static file x identity/gzip/br: wire bytes + headers identical to the valid-cache server (' + same + '/' + total + ')' + (bad.length ? ' bad: ' + bad.slice(0, 4).join('; ') : ''));
  {
    const refs = norm(zlib.brotliDecompressSync((await getR(V.port, '/', { 'accept-encoding': 'br' })).body).toString('utf8'));
    let eq = 0; for (const o of others) { const t = norm(zlib.brotliDecompressSync((await getR(o.port, '/', { 'accept-encoding': 'br' })).body).toString('utf8')); if (t === refs) eq++; }
    ok(eq === 3 && refs.includes('window._HIJRI_UMM_AL_QURA') && refs.includes('<style id="critical-css">') && !refs.includes('<!--SHARED-SIDEBAR-->'),
      'homepage identical on all four (nonce + clock normalised), with the Umm al-Qura table, critical CSS and the shared sidebar in place');
  }
  {
    const r = await getR(V.port, '/.preload-cache/manifest.json');
    const r2 = await getR(V.port, '/.preload-cache/' + P.artifactName('js/app.js', 'raw'));
    ok(r.status === 404 && r2.status === 404 && !r.body.toString().includes('recipe'), '/.preload-cache/* is not served (404, default-deny unchanged)');
  }
} catch (e) {
  ok(false, 'server-level section threw: ' + (e && e.message || e).slice(0, 300));
} finally {
  for (const p of spawned) kill(p);
  fs.rmSync(scratch, { recursive: true, force: true });
}

console.log(`\nRESULT perf_preload_precompute_1: ${pass} passed, ${fail} failed`);
if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
