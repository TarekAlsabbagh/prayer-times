// Smoke — PRAYER-DE-GERMANY-FAJR-ISHA-MWL-MISMATCH-1  (SUPERSESSION GUARD)
// This ticket's original DE-only 'NightMiddle' override was SUPERSEDED by
// PRAYER-DE-GERMANY-FAJR-ISHA-HYBRID-HIGHLAT-FIX-1 ('DEHybrid'). NightMiddle fixed the southern
// cities (angle reached) but COLLAPSED the northern ones (Berlin/Hamburg → Fajr≈Isha≈01:xx). This
// guard asserts the old NightMiddle wiring is fully GONE, replaced by DEHybrid, that the mismatch
// ticket's own goal (Heilbronn ≈ Google) is preserved, and that the collapse it caused is fixed.
// Full hybrid coverage lives in _smoke_prayer_de_germany_fajr_isha_hybrid_highlat_fix_1.mjs.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const require = createRequire(import.meta.url);
const PT = require(path.join(ROOT, 'js', 'prayer-times.js'));
const srvSrc = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const appSrc = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');

let pass = 0, fail = 0; const fails = [];
function ok(c, m) { if (c) { pass++; console.log('  PASS  ' + m); } else { fail++; fails.push(m); console.log('  FAIL  ' + m); } }

const DATE = new Date(2026, 6, 9);
function times(rule, lat, lng, tz) { PT.setMethod('MWL'); PT.setAsrMethod('Shafi'); PT.setHighLats(rule); PT.setTimeFormat('24h'); return PT.getTimes(DATE, lat, lng, tz); }

console.log('================ SUPERSESSION — NightMiddle wiring removed, DEHybrid in place ================');
ok(!/de: 'NightMiddle'/.test(srvSrc), 'server.js no longer maps de to NightMiddle');
ok(!/de: 'NightMiddle'/.test(appSrc), 'app.js no longer maps de to NightMiddle');
ok(/de: 'DEHybrid'/.test(srvSrc), 'server.js now maps de to DEHybrid');
ok(/de: 'DEHybrid'/.test(appSrc), 'app.js now maps de to DEHybrid');
ok(/const method = _SSR_METHOD_BY_CC\[cc\] \|\| 'MWL';/.test(srvSrc), 'de still resolves to method MWL (label unchanged)');

console.log('\n================ GOAL PRESERVED — Heilbronn still ≈ Google (not the old over-clamp) ================');
const heil = times('DEHybrid', 49.13995, 9.22054, 2);
ok(heil.fajr === '02:06' && heil.isha === '00:20', `Heilbronn 02:06/00:20 (mismatch ticket's goal, preserved); got ${heil.fajr}/${heil.isha}`);

console.log('\n================ COLLAPSE FIXED — Berlin/Hamburg no longer ~01:xx twins ================');
const ber = times('DEHybrid', 52.52, 13.40, 2);
const ham = times('DEHybrid', 53.55, 10.00, 2);
ok(ber.fajr === '02:41' && ber.isha === '23:35', `Berlin 02:41/23:35 (was NightMiddle 01:12/01:11); got ${ber.fajr}/${ber.isha}`);
ok(ham.fajr === '02:52' && ham.isha === '23:51', `Hamburg 02:52/23:51 (was NightMiddle 01:25/01:25); got ${ham.fajr}/${ham.isha}`);

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
