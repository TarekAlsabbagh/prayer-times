// Smoke — QURAN-AR-SURAH-PAGE-PERFORMANCE-PRELOAD-MINIFY-FIX-1.
// Locks the surah-page performance fix: the Quran section's own assets (quran.css, quran.js) and the
// self-hosted Amiri Quran font are preloaded → served MINIFIED, and the 135 KB TTF is served brotli/gzip
// COMPRESSED (~half the wire bytes). Without this, quran.css/quran.js fall back to raw-from-disk (unminified)
// and the TTF is sent uncompressed — the surah-page LCP regression this fix removed. Purely how the SAME bytes
// are served: no file/UX/text/cache-buster change.
//
// Static half reads server.js. Runtime half fetches over HTTP (SSR) — base = QURAN_SSR_BASE / QURAN_SMOKE_URL
// (default http://127.0.0.1:8085).
//   QURAN_SSR_BASE=http://localhost:8080 node scripts/_smoke_quran_asset_compression_1.mjs
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const B = process.env.QURAN_SSR_BASE || process.env.QURAN_SMOKE_URL || 'http://127.0.0.1:8085';
const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
let pass = 0, fail = 0; const F = [];
const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const minifiedLike = (t) => { const lines = t.split('\n').length; return t.length / lines > 200; };

console.log('\n--- 1) static: the three assets are in the preload/minify list ---');
const pl = src.slice(src.indexOf('const _preloadPaths = ['), src.indexOf('];', src.indexOf('const _preloadPaths = [')));
ok(/'css\/quran\.css'/.test(pl), "_preloadPaths includes css/quran.css (minified + brotli at boot)");
ok(/'js\/quran\.js'/.test(pl), "_preloadPaths includes js/quran.js (minified + brotli at boot)");
ok(/'fonts\/AmiriQuran-Regular\.ttf'/.test(pl), "_preloadPaths includes the Amiri Quran TTF (brotli/gzip precomputed at boot)");

console.log('\n--- 2) static: .ttf is compressible so the precomputed brotli is actually sent ---');
ok(/const compressible = \[[^\]]*'\.ttf'[^\]]*\]\.includes\(ext\)/.test(src), "the static-serve `compressible` set includes '.ttf'");
ok(!/'\.woff2'/.test(src.slice(src.indexOf('const compressible = ['), src.indexOf('.includes(ext)', src.indexOf('const compressible = [')))), "does NOT mark .woff2 compressible (already brotli-internal — never double-compress)");

console.log('\n--- 3) runtime: assets served minified, font served brotli-compressed ---');
{
  const cssId = await fetch(B + '/css/quran.css?v=25', { headers: { 'accept-encoding': 'identity' } });
  const cssTxt = await cssId.text();
  ok(cssId.status === 200 && minifiedLike(cssTxt), 'GET /css/quran.css?v=25 → 200 and MINIFIED (few newlines) — bytes=' + cssTxt.length);
  const jsId = await fetch(B + '/js/quran.js?v=15', { headers: { 'accept-encoding': 'identity' } });
  const jsTxt = await jsId.text();
  ok(jsId.status === 200 && minifiedLike(jsTxt), 'GET /js/quran.js?v=15 → 200 and MINIFIED — bytes=' + jsTxt.length);

  const cssBr = await fetch(B + '/css/quran.css?v=25', { headers: { 'accept-encoding': 'br' } });
  ok(cssBr.headers.get('content-encoding') === 'br', 'quran.css advertises Content-Encoding: br when requested');

  const fontBr = await fetch(B + '/fonts/AmiriQuran-Regular.ttf', { headers: { 'accept-encoding': 'br, gzip' } });
  const enc = fontBr.headers.get('content-encoding') || 'none';
  const len = +(fontBr.headers.get('content-length') || 0);
  ok(fontBr.status === 200 && (enc === 'br' || enc === 'gzip'), 'the Amiri Quran TTF is served COMPRESSED — Content-Encoding: ' + enc);
  ok(len > 0 && len < 100000, 'the compressed TTF is well under the ~135 KB raw size — ' + len + ' bytes (raw 136920)');
}

console.log('\n--- 4) runtime: a surah page still serves its ayah text intact (minification did not break it) ---');
{
  const res = await fetch(B + '/quran/al-ikhlas');
  const html = await res.text();
  ok(res.status === 200 && /class="quran-ayah-text"/.test(html) && /id="ayah-1"/.test(html), 'GET /quran/al-ikhlas → 200 with SSR ayah text (quran-ayah-text + id="ayah-1")');
  ok(/href="\/css\/quran\.css\?v=25"/.test(html) && /src="\/js\/quran\.js\?v=15"/.test(html), 'the surah page still references quran.css?v=25 + quran.js?v=15 (cache-busters unchanged)');
}

console.log(`\nRESULT quran_asset_compression: ${pass} passed, ${fail} failed`);
if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
