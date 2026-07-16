// Smoke — QURAN SSR contract (REVISION-3, SPA-integrated): the surah body is SSR-rendered inside the real
// index.html shell; the ayah text/ids/medallion/basmala are in the initial HTML; noindex via staticPages.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const b0 = src.indexOf('function _buildQuranSurahBody(n)');
const b = src.slice(b0, src.indexOf('// ===== HTTP Server =====', b0));
ok(b0 > 0, '_buildQuranSurahBody(n) present (content-only body builder, parametrised over 1..114)');
ok(/\(process\.env\.QURAN_PROTOTYPE_ENABLED === '1' && !!\(_quranSurahRoute\(urlPath\) \|\| \{\}\)\.canonical\)/.test(src), 'route gated by flag + exact /quran/surah/21 (index.html shell)');
ok(/staticPages\[corePath\] = \{[\s\S]{0,900}?noindex: true/.test(src), 'the dynamic staticPages entry sets noindex for every surah route');
ok(/if \(sp\.noindex\) robotsOverride = 'noindex,follow/.test(src), 'noindex flag drives robotsOverride → renderSeoHeadHtml emits noindex');
ok((b.match(/<h1[\s>]/g) || []).length === 1, 'exactly ONE <h1> (#quran-surah-h1)');
ok(/id="ayah-\$\{a\.ayah\}"/.test(b), 'each ayah gets id="ayah-N"');
ok(/data-reference-page="\$\{pg\.page\}"/.test(b), 'each page card has data-reference-page');
ok(/class="quran-ayah-text">\$\{_quranEsc\(a\.textUthmaniBody\)\}/.test(b), 'ayah BODY text emitted into HTML (SSR, not JS)');
ok(/class="quran-ayah-num"[^>]*aria-label="الآية \$\{_quranAr\(a\.ayah\)\}">\$\{_quranAr\(a\.ayah\)\}/.test(b), 'ayah NUMBER is a separate element (medallion) with aria-label');
ok(/quran-basmala/.test(b) && /a\.ayah === 1/.test(b), 'BasmalaOpener rendered once before ayah 1');
ok(!/ﰀ/.test(b) && !/rawEndMarkerCodePoint/.test(b), 'template never emits the raw FCxx marker');
ok(/<link rel="stylesheet" href="\/css\/quran\.css\?v=\d+">/.test(src) && /<script defer src="\/js\/quran\.js\?v=\d+"><\/script>/.test(src), 'server injects quran.css + quran.js only on this route');
ok(!/spinner|skeleton/i.test(b), 'no spinner/skeleton placeholder');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
