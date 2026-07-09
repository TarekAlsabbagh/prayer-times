// Smoke — PRAYER-DE-GERMANY-FAJR-ISHA-HYBRID-HIGHLAT-FIX-1
// DE-ONLY hybrid high-latitude rule. Germany keeps method MWL (18°/17°) but its twilight rule becomes
// 'DEHybrid' in the CALC (js/prayer-times.js), decided PER PRAYER by whether the sun actually reaches the
// depression that day/city:
//   • reached  → real solar angle time (matches Google in southern DE: Heilbronn 02:06)
//   • NOT reached → AngleBased fallback (matches aladhan/IslamicFinder/Diyanet in northern DE: Berlin 02:41)
// This supersedes the earlier DE-only 'NightMiddle' (MWL-MISMATCH-1) which collapsed northern cities to
// Fajr≈Isha≈01:xx. Two layers: (1) ENGINE — run js/prayer-times.js and assert every DE city equals its
// {real-where-reached, AngleBased-where-not} target, no collapse, Heilbronn not reverted, Frankfurt mixed,
// non-DE unchanged; (2) STATIC — the wiring is present on both sides, method/label + global default + other
// countries untouched, cache-busters bumped.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const require = createRequire(import.meta.url);
const PT = require(path.join(ROOT, 'js', 'prayer-times.js'));
const srvSrc  = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const appSrc  = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
const ptSrc   = fs.readFileSync(path.join(ROOT, 'js', 'prayer-times.js'), 'utf8');
const htmlSrc = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const swSrc   = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

let pass = 0, fail = 0; const fails = [];
function ok(c, m) { if (c) { pass++; console.log('  PASS  ' + m); } else { fail++; fails.push(m); console.log('  FAIL  ' + m); } }

const DATE = new Date(2026, 6, 9); // 2026-07-09
function times(method, rule, lat, lng, tz) {
  PT.setMethod(method); PT.setAsrMethod('Shafi'); PT.setHighLats(rule); PT.setTimeFormat('24h');
  return PT.getTimes(DATE, lat, lng, tz);
}
const toMin = s => { const [a, b] = s.split(':').map(Number); return a * 60 + b; };
function gap(a, b) { let d = Math.abs(toMin(a) - toMin(b)); if (d > 720) d = 1440 - d; return d; }

// name, lat, lng, tz, Fajr-18°-reached, Isha-17°-reached, target Fajr, target Isha
const DE = [
  ['Munich',    48.14, 11.58, 2, true,  true,  '02:24', '23:53'],
  ['Stuttgart', 48.78,  9.18, 2, true,  true,  '02:18', '00:13'],
  ['Heilbronn', 49.14,  9.22, 2, true,  true,  '02:06', '00:20'],
  ['Frankfurt', 50.11,  8.68, 2, false, false, '03:05', '23:48'], // Fajr AB (18° not reached); Isha 17° reached-but-thin → AngleBased via MARGIN-THRESHOLD-FIX-1 (00:47→23:48)
  ['Cologne',   50.94,  6.96, 2, false, false, '03:10', '23:57'],
  ['Dusseldorf',51.23,  6.78, 2, false, false, '03:10', '23:58'],
  ['Essen',     51.46,  7.01, 2, false, false, '03:09', '23:58'],
  ['Dortmund',  51.51,  7.47, 2, false, false, '03:07', '23:56'],
  ['Berlin',    52.52, 13.40, 2, false, false, '02:41', '23:35'],
  ['Hamburg',   53.55, 10.00, 2, false, false, '02:52', '23:51'],
];

console.log('================ 1. ENGINE — every DE city hits its {real|AngleBased} target ================');
for (const [nm, lat, lng, tz, fR, iR, tF, tI] of DE) {
  const h = times('MWL', 'DEHybrid', lat, lng, tz);
  ok(h.fajr === tF, `${nm}: Fajr ${h.fajr} == target ${tF} (${fR ? 'real angle' : 'AngleBased fallback'})`);
  ok(h.isha === tI, `${nm}: Isha ${h.isha} == target ${tI} (${iR ? 'real angle' : 'AngleBased fallback'})`);
}

console.log('\n================ 2. Hybrid identity: reached→NightMiddle-value, not→AngleBased ================');
for (const [nm, lat, lng, tz, fR, iR] of DE) {
  const h  = times('MWL', 'DEHybrid',    lat, lng, tz);
  const nm_ = times('MWL', 'NightMiddle', lat, lng, tz); // = real angle where reached
  const ab = times('MWL', 'AngleBased',  lat, lng, tz);
  ok(h.fajr === (fR ? nm_.fajr : ab.fajr), `${nm}: Fajr follows ${fR ? 'real(=NightMiddle)' : 'AngleBased'}`);
  ok(h.isha === (iR ? nm_.isha : ab.isha), `${nm}: Isha follows ${iR ? 'real(=NightMiddle)' : 'AngleBased'}`);
}

console.log('\n================ 3. NO COLLAPSE — Fajr↔Isha gap > 60 min for every DE city ================');
for (const [nm, lat, lng, tz] of DE) {
  const h = times('MWL', 'DEHybrid', lat, lng, tz);
  const g = gap(h.fajr, h.isha);
  ok(g > 60, `${nm}: gap ${g}min > 60 (no Fajr≈Isha collapse; ${h.fajr}/${h.isha})`);
}
// The specific cities the ticket flagged must NOT be ~01:xx twins any more.
const berlin = times('MWL', 'DEHybrid', 52.52, 13.40, 2);
ok(berlin.fajr === '02:41' && berlin.isha === '23:35', `Berlin fixed to 02:41/23:35 (was 01:12/01:11); got ${berlin.fajr}/${berlin.isha}`);
const hamburg = times('MWL', 'DEHybrid', 53.55, 10.00, 2);
ok(hamburg.fajr === '02:52' && hamburg.isha === '23:51', `Hamburg fixed to 02:52/23:51 (was 01:25/01:25); got ${hamburg.fajr}/${hamburg.isha}`);

console.log('\n================ 4. Heilbronn NOT reverted to the old AngleBased over-clamp ================');
const heil = times('MWL', 'DEHybrid', 49.14, 9.22, 2);
ok(heil.fajr === '02:06', `Heilbronn Fajr 02:06 (= Google), NOT 03:04; got ${heil.fajr}`);
ok(heil.isha === '00:20', `Heilbronn Isha 00:20 (= Google), NOT 23:44; got ${heil.isha}`);
ok(heil.fajr !== '03:04' && heil.isha !== '23:44', 'Heilbronn did not regress to the pre-fix AngleBased values');

console.log('\n================ 5. Frankfurt — Fajr AngleBased; Isha AngleBased via MARGIN-THRESHOLD-FIX-1 ================');
// Superseded by PRAYER-DE-FRANKFURT-ISHA-MARGIN-THRESHOLD-FIX-1: Frankfurt Isha 17° IS reached but the
// margin is thin (+0.5°) so the real-angle Isha (00:47) is replaced by the AngleBased fallback (23:48).
const fra = times('MWL', 'DEHybrid', 50.11, 8.68, 2);
const fraAB = times('MWL', 'AngleBased', 50.11, 8.68, 2);
ok(fra.fajr === fraAB.fajr, `Frankfurt Fajr uses AngleBased (18° NOT reached): ${fra.fajr}`);
ok(fra.isha === fraAB.isha, `Frankfurt Isha uses AngleBased (17° reached-but-thin → margin threshold): ${fra.isha}`);
ok(fra.fajr === '03:05' && fra.isha === '23:48', `Frankfurt = 03:05/23:48 (Isha no longer 00:47); got ${fra.fajr}/${fra.isha}`);

console.log('\n================ 6. DE-ONLY — non-DE countries byte-identical to their normal rule ================');
const REG = [
  ['Riyadh',   'Makkah', 24.71, 46.68, 3, '03:40', '20:16'],
  ['Istanbul', 'Turkey', 41.01, 28.98, 3, '03:36', '22:33'],
  ['Paris',    'France', 48.85,  2.35, 2, '04:21', '23:31'],
  ['KL',       'JAKIM',   3.14,101.69, 8, '05:56', '20:43'],
  ['Jakarta',  'KemenagJakarta', -6.21, 106.85, 7, '04:41', '19:06'],
  ['NewYork',  'ISNA',   40.71, -74.01, -4, '03:56', '22:06'],
  ['Toronto',  'ISNA',   43.65, -79.38, -4, '03:58', '22:47'],
];
for (const [nm, method, lat, lng, tz, tF, tI] of REG) {
  const t = times(method, 'AngleBased', lat, lng, tz); // their normal rule; DEHybrid is never set for them
  ok(t.fajr === tF && t.isha === tI, `${nm} (${method}) unchanged: ${t.fajr}/${t.isha} == ${tF}/${tI}`);
}
// And DEHybrid must be mapped to exactly one cc (de) — no other country gets it (code-level DE-only).
ok((srvSrc.match(/^\s*[a-z]{2}: 'DEHybrid'/gm) || []).length === 1, 'server.js: DEHybrid mapped to exactly one cc');
ok((appSrc.match(/[a-z]{2}: 'DEHybrid'/g) || []).length === 1, 'app.js: DEHybrid mapped to exactly one cc');

console.log('\n================ 7. STATIC — engine + wiring + method/label + cache-busters ================');
ok(/function angleReachable\(angle, t, lat, jd\)/.test(ptSrc), 'engine has angleReachable() reachability helper');
ok(/if \(config\.highLats === 'DEHybrid'\)/.test(ptSrc), "engine adjustHighLat has a 'DEHybrid' branch");
ok(/angleReachable\(m\.fajr, t\.fajr, lat, jd\)/.test(ptSrc) && /angleReachable\(m\.isha, t\.isha, lat, jd\)/.test(ptSrc),
   'engine computes reachability for BOTH fajr and isha (per-prayer)');
ok(/highLats:\s*'AngleBased'/.test(ptSrc), 'engine GLOBAL default still AngleBased (no global change)');
ok(/de: 'DEHybrid'/.test(srvSrc), 'server.js _HIGHLAT_BY_CC de:DEHybrid');
ok(/PrayerTimesSrv\.setHighLats\(_HIGHLAT_BY_CC\[cc\] \|\| 'AngleBased'\)/.test(srvSrc), 'SSR sets high-lat per request (DE→DEHybrid, else AngleBased)');
ok(/const method = _SSR_METHOD_BY_CC\[cc\] \|\| 'MWL';/.test(srvSrc), 'SSR method map untouched (de→MWL, label unchanged)');
ok(/const _HIGHLAT_BY_CC = \{ de: 'DEHybrid' \};/.test(appSrc), 'app.js _HIGHLAT_BY_CC = { de:DEHybrid }');
ok(/const effHighLats = _HIGHLAT_BY_CC\[_calcCc\] \|\| highLats;/.test(appSrc), 'client computes effHighLats (DE override else dropdown)');
ok(/PrayerTimes\.setHighLats\(effHighLats\);/.test(appSrc), 'client calc uses effHighLats (real calc effect)');
ok((srvSrc.match(/'NightMiddle'/g) || []).length === 0 || !/de: 'NightMiddle'/.test(srvSrc), 'server.js no longer maps de to NightMiddle');
ok(!/de: 'NightMiddle'/.test(appSrc), 'app.js no longer maps de to NightMiddle');
// 'DEHybrid' is an internal calc rule — never a user-facing method/high-lat dropdown OPTION.
ok(!/<option[^>]*value="DEHybrid"/.test(htmlSrc), 'DEHybrid is NOT a dropdown <option> (never shown to the user)');
ok(!/<option[^>]*value="NightMiddle"[^>]*>\s*[^<]*method/i.test(htmlSrc), 'NightMiddle is not offered as a calc METHOD');
ok(/js\/prayer-times\.js\?v=5[0-9]/.test(htmlSrc), 'index.html prayer-times.js?v bumped (engine changed)');
ok(/js\/app\.js\?v=83[0-9]/.test(htmlSrc), 'index.html app.js?v (≥833)');
ok(/CACHE_VERSION = 'v\d{3}'/.test(swSrc), "sw.js CACHE_VERSION is a 3-digit version (bumped)");
ok(/css\/style\.css\?v=497/.test(htmlSrc) && /js\/azkar-data\.js\?v=6/.test(htmlSrc), 'css v497 + azkar-data v6 unchanged');

console.log('\n================ 8. Determinism — engine pure (SSR==client given same inputs) ================');
const a1 = times('MWL', 'DEHybrid', 52.52, 13.40, 2);
const a2 = times('MWL', 'DEHybrid', 52.52, 13.40, 2);
ok(JSON.stringify(a1) === JSON.stringify(a2), 'two identical calls → identical output (deterministic, no state leak)');
// after a DE call, a non-DE call with AngleBased is not polluted
const de1 = times('MWL', 'DEHybrid', 52.52, 13.40, 2);
const sa1 = times('Makkah', 'AngleBased', 24.71, 46.68, 3);
ok(sa1.fajr === '03:40' && sa1.isha === '20:16', 'a DE(DEHybrid) call does not leak into the next non-DE(AngleBased) call');

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
