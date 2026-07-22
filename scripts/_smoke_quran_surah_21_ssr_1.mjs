// Smoke — QURAN SSR contract (REVISION-3, SPA-integrated): the surah body is SSR-rendered inside the real
// index.html shell; the ayah text/ids/medallion/basmala are in the initial HTML; noindex via staticPages.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const b0 = src.indexOf('function _buildQuranSurahBody(n)');
const b = src.slice(b0, src.indexOf('// ===== HTTP Server =====', b0));
ok(b0 > 0, '_buildQuranSurahBody(n) present (content-only body builder, parametrised over 1..114)');
ok(/\(!!_quranSurahRoute\(urlPath\)\) \|\|/.test(src) && !/QURAN_PROTOTYPE_ENABLED/.test(src), 'route recognised UNCONDITIONALLY via an exact slug match (index.html shell) — the QURAN_PROTOTYPE_ENABLED gate was removed at public release');
ok(!/staticPages\[corePath\] = \{[\s\S]{0,1200}?noindex: true/.test(src), 'the dynamic staticPages entry carries NO noindex — every surah route is INDEXABLE (public release)');
ok(/const _robots = seo\.robotsOverride \|\| 'index,follow/.test(src), 'default robots = index,follow → a surah page (no robotsOverride) is emitted indexable');
ok((b.match(/<h1[\s>]/g) || []).length === 1, 'exactly ONE <h1> (#quran-surah-h1)');
ok(/id="ayah-\$\{a\.ayah\}"/.test(b), 'each ayah gets id="ayah-N"');
ok(/quran-ayah-flow/.test(b) && !/data-reference-page/.test(b), 'ayahs render in a flat flow (quran-ayah-flow) — the KFGQPC mushaf page card / data-reference-page is retired');
ok(/class="quran-ayah-text">\$\{_quranEsc\(a\.textUthmaniBody\)\}/.test(b), 'ayah BODY text emitted into HTML (SSR, not JS)');
ok(/class="quran-ayah-num"[^>]*aria-label="الآية \$\{_quranAr\(a\.ayah\)\}">\$\{_quranAr\(a\.ayah\)\}/.test(b), 'ayah NUMBER is a separate element (medallion) with aria-label');
ok(/quran-basmala/.test(b) && /basmalaMode === 'separate'/.test(b), 'basmala opener rendered only when basmalaMode === \'separate\' (Fatiha=first-ayah / Tawba=none never duplicate or add text)');
ok(!/ﰀ/.test(b) && !/rawEndMarkerCodePoint/.test(b), 'template never emits the raw FCxx marker');
ok(/<link rel="stylesheet" href="\/css\/quran\.css\?v=\d+">/.test(src) && /<script defer src="\/js\/quran\.js\?v=\d+"><\/script>/.test(src), 'server injects quran.css + quran.js only on this route');
ok(!/spinner|skeleton/i.test(b), 'no spinner/skeleton placeholder');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
