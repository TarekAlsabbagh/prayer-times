// Smoke — QURAN REVISION-2: mobile margin CSS contract (safe-area gutters + top clearance for the fixed
// menu button). Actual pixel margins at 375/390px are verified in the browser; this locks the CSS rules.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = fs.readFileSync(path.join(ROOT, 'css', 'quran.css'), 'utf8');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
// side gutters: >=16px, safe-area aware, on the ONE site container (all boxes share it)
ok(/\.quran-site-container\s*\{[\s\S]*max\(16px,\s*env\(safe-area-inset-right\)\)[\s\S]*max\(16px,\s*env\(safe-area-inset-left\)\)/.test(css), 'site container padding: max(16px, safe-area) both inline sides');
// very small screens may drop to 12px (still no edge-touch)
ok(/@media\s*\(max-width:\s*360px\)[\s\S]*padding-inline:\s*max\(12px/.test(css), '<=360px may tighten to 12px gutter');
// the REAL site .top-header provides the top spacing now — NO bespoke menu-button clearance padding
ok(!/\.quran-shell\s*\{\s*padding-top/.test(css) && /top-header provides the top spacing/.test(css), 'no bespoke menu-button top-clearance (real header handles it)');
// cards use border-box (padding counts inside the width), never 100vw
ok(/\.quran-page-card\s*\{[^}]*box-sizing:\s*border-box/.test(css), 'page cards box-sizing: border-box');
ok(/\.quran-site-container\s*\{[^}]*box-sizing:\s*border-box/.test(css), 'site container box-sizing: border-box');
ok(!/width:\s*100vw/.test(css), 'no width:100vw');
// card internal padding >= 16px on mobile
ok(/@media\s*\(max-width:\s*480px\)[\s\S]*\.quran-page-card\s*\{\s*padding:\s*16px/.test(css), 'card internal padding >= 16px on mobile');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
