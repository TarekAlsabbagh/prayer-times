// Smoke — QURAN prototype: responsive + dark-mode + font-loading CSS contract (css/quran.css).
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = fs.readFileSync(path.join(ROOT, 'css', 'quran.css'), 'utf8');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
ok(/@font-face\s*\{[^}]*font-family:\s*'AmiriQuran'[^}]*AmiriQuran-Regular\.ttf[^}]*\}/s.test(css), '@font-face AmiriQuran → AmiriQuran-Regular.ttf (open-licensed OFL, unmodified)');
ok(!/KFGQPCHafs|uthmanic_hafs/i.test(css), 'no KFGQPC font references remain in quran.css');
ok(/font-family:\s*'AmiriQuran',\s*'Amiri'/.test(css), "reading stacks prefer 'AmiriQuran' then system 'Amiri' fallback");
ok(/font-display:\s*swap/.test(css), 'font-display: swap');
ok(/@media\s*\(max-width:\s*768px\)/.test(css), 'tablet breakpoint (<=768)');
ok(/@media\s*\(max-width:\s*480px\)/.test(css), 'mobile breakpoint (<=480)');
ok(/@media\s*\(max-width:\s*480px\)[\s\S]*quran-tool-label\s*\{\s*display:\s*none/.test(css), 'toolbar labels collapse to icons on small screens');
ok(/data-theme="dark"/.test(css), 'dark-mode override via data-theme="dark"');
ok(!/background:\s*#000\b|background:\s*black\b|--q-bg:\s*#000000/.test(css), 'dark mode does NOT use pure black');
ok(/prefers-reduced-motion/.test(css), 'respects prefers-reduced-motion');
ok(/\.quran-reading-sticky\s*\{[^}]*position:\s*sticky/s.test(css), 'sticky reading bar (wrapper holds toolbar + progress)');
ok(/\.quran-ayah-num\s*\{[\s\S]*border[\s\S]*border-radius:\s*999px/.test(css), 'ayah-number medallion is its own styled element (not a font glyph)');
ok(/quran-reading[\s\S]*display:\s*none/.test(css), 'reading mode hides chrome');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
