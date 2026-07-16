// Smoke — QURAN Arabic-only SEO (REVISION-3): the prototype is noindex + Arabic-only — no hreflang / no
// other-language alternates, and its staticPages entry declares ONLY Arabic title/desc.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const b0 = src.indexOf('function _buildQuranSurah21Body()');
const b = src.slice(b0, src.indexOf('// ===== HTTP Server =====', b0));
ok(b0 > 0, 'body builder present');
ok(!/hreflang/i.test(b), 'NO hreflang link anywhere in the surah body');
ok(!/rel="alternate"/i.test(b), 'NO rel="alternate" language alternates in the body');
ok(!/lang="en"|lang="fr"|lang="ur"|lang="tr"|lang="bn"|lang="ms"|lang="de"|lang="es"|lang="id"/.test(b), 'no other-language document lang in the body');
const sp = src.slice(src.indexOf("staticPages['/quran/surah/21']"), src.indexOf("staticPages['/moon']"));
ok(/noindex: true/.test(sp), 'route is noindex');
ok(/title: \{ ar: /.test(sp) && /desc:\s*\{ ar: /.test(sp), 'Arabic-only title + desc (ar key only)');
ok(!/\b(en|fr|tr|ur|de|id|es|bn|ms):/.test(sp), 'staticPages entry declares NO non-Arabic locale keys');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
