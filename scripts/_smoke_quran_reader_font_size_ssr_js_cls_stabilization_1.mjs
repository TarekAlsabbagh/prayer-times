/*
 * _smoke_quran_reader_font_size_ssr_js_cls_stabilization_1.mjs
 * Proves the reader-CLS fix: the ayah size is CSS-driven (a per-breakpoint responsive base + a JS-only step
 * offset combined with calc), and js/quran.js NEVER writes an absolute --q-ayah-size on load — so at the
 * default step 0 the post-JS layout equals SSR (was: JS shrank 1.95rem->1.55rem, reflowing every ayah).
 * Pure-Node static analysis of css/quran.css + js/quran.js. Run from the repo root.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = fs.readFileSync(path.join(ROOT, 'css', 'quran.css'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'js', 'quran.js'), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; } else { fail++; console.error('  FAIL: ' + m); } };

// ---- CSS: base / offset / calc split ----
ok(/--q-ayah-size-base:\s*clamp\(1\.55rem,\s*4vw,\s*1\.95rem\)/.test(css), 'CSS default --q-ayah-size-base = clamp(1.55rem, 4vw, 1.95rem) (the responsive base = SSR size)');
ok(/--q-ayah-size-offset:\s*0rem/.test(css), 'CSS declares --q-ayah-size-offset: 0rem (reader step, 0 at default)');
ok(/--q-ayah-size:\s*calc\(\s*var\(--q-ayah-size-base\)\s*\+\s*var\(--q-ayah-size-offset[^)]*\)\s*\)/.test(css), 'CSS final --q-ayah-size = calc(base + offset)');
ok(!/--q-ayah-base\b/.test(css), 'the old flat --q-ayah-base is gone from CSS');
ok(/--q-ayah-size-base:\s*clamp\(1\.4rem,\s*5\.8vw,\s*1\.6rem\)/.test(css), 'phone (<=480px) overrides ONLY --q-ayah-size-base (offset + final calc inherit)');
// design untouched: ayah flow still binds font-size to the var and keeps line-height 2.4
ok(/\.quran-ayah-flow\s*\{[^}]*font-size:\s*var\(--q-ayah-size\)[^}]*line-height:\s*2\.4/s.test(css), '.quran-ayah-flow still uses var(--q-ayah-size) + line-height 2.4 (design unchanged)');

// ---- JS: offset-only, no absolute write, step 0 clears ----
ok(!/setProperty\(\s*['"]--q-ayah-size['"]/.test(js), 'js/quran.js NEVER setProperty(--q-ayah-size) — no absolute size write');
ok(/setProperty\(\s*['"]--q-ayah-size-offset['"]/.test(js), 'js/quran.js writes --q-ayah-size-offset (the step only)');
ok(/step\s*===\s*0[\s\S]{0,160}removeProperty\(\s*['"]--q-ayah-size-offset['"]\s*\)/.test(js), 'at step 0 js removes --q-ayah-size-offset (falls back to the CSS responsive base)');
ok(/removeProperty\(\s*['"]--q-ayah-size['"]\s*\)/.test(js), 'js clears any legacy absolute --q-ayah-size override');
ok(/step\s*\*\s*0\.12/.test(js), 'offset magnitude is step * 0.12rem');
ok(!/readBaseRem/.test(js), 'the old readBaseRem() helper is removed (no dead code)');
ok(/Math\.max\(-3,\s*Math\.min\(6/.test(js), 'step is clamped to [-3, 6]');

console.log((fail === 0 ? 'PASS' : 'FAIL') + ': _smoke_quran_reader_font_size_ssr_js_cls_stabilization_1 — ' + pass + ' passed, ' + fail + ' failed');
if (fail === 0) console.log('  AYAH SIZE IS CSS-RESPONSIVE + JS-OFFSET-ONLY — NO ABSOLUTE WRITE AT STEP 0 — SSR == POST-JS');
process.exitCode = fail ? 1 : 0;
