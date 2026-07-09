// Smoke — PRAYER-DE-FRANKFURT-ISHA-MARGIN-THRESHOLD-FIX-1
// DE-only, ISHA-only refinement of DEHybrid. When the Isha 17° depression IS reached but only *barely*
// (small margin), the real-angle Isha clusters near solar midnight (Frankfurt 00:47) — astronomically
// valid but impractical and unlike every mainstream reference (~23:47). So for ISHA (dir==='cw') the
// engine now requires margin >= DE_ISHA_MIN_MARGIN (1.0°) to use the real angle; otherwise it uses the
// AngleBased fallback. FAJR (dir==='ccw') keeps the plain reachability gate — NO margin threshold —
// because Heilbronn's Fajr 18° margin is only +0.4° and must stay real (02:06). Result: Frankfurt Isha
// 00:47 → 23:48, while Heilbronn 00:20 / Stuttgart 00:13 / Munich 23:53 and ALL Fajr times are unchanged,
// and every non-DE country is byte-identical (DEHybrid is never set for them).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const require = createRequire(import.meta.url);
const PT = require(path.join(ROOT, 'js', 'prayer-times.js'));
const ptSrc   = fs.readFileSync(path.join(ROOT, 'js', 'prayer-times.js'), 'utf8');
const srvSrc  = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const appSrc  = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
const htmlSrc = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const swSrc   = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

let pass = 0, fail = 0; const fails = [];
function ok(c, m) { if (c) { pass++; console.log('  PASS  ' + m); } else { fail++; fails.push(m); console.log('  FAIL  ' + m); } }

const DATE = new Date(2026, 6, 9);
function times(rule, method, lat, lng, tz) { PT.setMethod(method); PT.setAsrMethod('Shafi'); PT.setHighLats(rule); PT.setTimeFormat('24h'); return PT.getTimes(DATE, lat, lng, tz); }
// independent 17°/18° margin (|minSunAlt| − angle) for 2026-07-09 to prove WHY the threshold isolates Frankfurt
const rad = d => d*Math.PI/180, deg = r => r*180/Math.PI;
const N = 190, g = 2*Math.PI/365*(N-1+0.5);
const decl = deg(0.006918-0.399912*Math.cos(g)+0.070257*Math.sin(g)-0.006758*Math.cos(2*g)+0.000907*Math.sin(2*g)-0.002697*Math.cos(3*g)+0.00148*Math.sin(3*g));
const margin = (lat, a) => (-(deg(Math.asin(Math.sin(rad(lat))*Math.sin(rad(decl)) - Math.cos(rad(lat))*Math.cos(rad(decl))))) - a);

// name, lat, lng, tz, Fajr(unchanged), Isha(AFTER fix), 17°-reached, expected-Isha-rule
const DE = [
  ['Munich',    48.14, 11.58, 2, '02:24', '23:53', true,  'real'],
  ['Stuttgart', 48.78,  9.18, 2, '02:18', '00:13', true,  'real'],
  ['Heilbronn', 49.14,  9.22, 2, '02:06', '00:20', true,  'real'],
  ['Frankfurt', 50.11,  8.68, 2, '03:05', '23:48', true,  'AB-thin'],  // THE FIX
  ['Cologne',   50.94,  6.96, 2, '03:10', '23:57', false, 'AB-notReached'],
  ['Dusseldorf',51.23,  6.78, 2, '03:10', '23:58', false, 'AB-notReached'],
  ['Essen',     51.46,  7.01, 2, '03:09', '23:58', false, 'AB-notReached'],
  ['Dortmund',  51.51,  7.47, 2, '03:07', '23:56', false, 'AB-notReached'],
  ['Berlin',    52.52, 13.40, 2, '02:41', '23:35', false, 'AB-notReached'],
  ['Hamburg',   53.55, 10.00, 2, '02:52', '23:51', false, 'AB-notReached'],
];

console.log('================ 1. Frankfurt Isha FIXED (00:47 → 23:48); Fajr unchanged ================');
const fra = times('DEHybrid', 'MWL', 50.11, 8.68, 2);
ok(fra.isha === '23:48', `Frankfurt Isha == 23:48 (was 00:47); got ${fra.isha}`);
ok(fra.isha !== '00:47', 'Frankfurt Isha no longer the after-midnight 00:47');
ok(fra.fajr === '03:05', `Frankfurt Fajr unchanged == 03:05; got ${fra.fajr}`);
ok(times('AngleBased','MWL',50.11,8.68,2).isha === fra.isha, 'Frankfurt Isha now equals the AngleBased fallback (23:48)');

console.log('\n================ 2. Southern real-angle Isha PRESERVED (not broken) ================');
const heil = times('DEHybrid','MWL',49.14,9.22,2), stut = times('DEHybrid','MWL',48.78,9.18,2), mun = times('DEHybrid','MWL',48.14,11.58,2);
ok(heil.isha === '00:20', `Heilbronn Isha stays 00:20 (real angle); got ${heil.isha}`);
ok(heil.fajr === '02:06', `Heilbronn Fajr stays 02:06 (NOT reverted); got ${heil.fajr}`);
ok(stut.isha === '00:13', `Stuttgart Isha stays 00:13 (real angle); got ${stut.isha}`);
ok(mun.isha === '23:53', `Munich Isha stays 23:53; got ${mun.isha}`);

console.log('\n================ 3. Every DE city — Isha target + Fajr unchanged ================');
for (const [nm, lat, lng, tz, fajrExp, ishaExp] of DE) {
  const t = times('DEHybrid', 'MWL', lat, lng, tz);
  ok(t.isha === ishaExp, `${nm}: Isha ${t.isha} == ${ishaExp}`);
  ok(t.fajr === fajrExp, `${nm}: Fajr ${t.fajr} == ${fajrExp} (UNCHANGED by the Isha threshold)`);
}

console.log('\n================ 4. Margin ordering proves the threshold (Isha-only) isolates Frankfurt ================');
const mFra = margin(50.11, 17), mHeil = margin(49.14, 17), mStut = margin(48.78, 17);
ok(mFra < 1.0, `Frankfurt 17° margin ${mFra.toFixed(2)}° < 1.0° threshold ⇒ AngleBased`);
ok(mHeil >= 1.0, `Heilbronn 17° margin ${mHeil.toFixed(2)}° >= 1.0° ⇒ real angle preserved`);
ok(mStut >= 1.0, `Stuttgart 17° margin ${mStut.toFixed(2)}° >= 1.0° ⇒ real angle preserved`);
ok(mFra < mHeil && mFra < mStut, 'Frankfurt has the smallest Isha margin (the only "reached-but-thin" city this date)');
// Fajr must NOT get a margin gate: Heilbronn Fajr 18° margin is tiny (+0.4°) yet must stay real.
ok(margin(49.14, 18) < 1.0 && heil.fajr === '02:06', `Heilbronn Fajr 18° margin ${margin(49.14,18).toFixed(2)}° < 1.0 yet Fajr stays real 02:06 (NO Fajr threshold)`);

console.log('\n================ 5. DE-ONLY — non-DE countries byte-identical ================');
for (const [nm, method, lat, lng, tz, exp] of [
  ['Riyadh','Makkah',24.71,46.68,3,'03:40/20:16'], ['Istanbul','Turkey',41.01,28.98,3,'03:36/22:33'],
  ['Paris','France',48.85,2.35,2,'04:21/23:31'], ['KL','JAKIM',3.14,101.69,8,'05:56/20:43'],
  ['Jakarta','KemenagJakarta',-6.21,106.85,7,'04:41/19:06'], ['NewYork','ISNA',40.71,-74.01,-4,'03:56/22:06'],
  ['Toronto','ISNA',43.65,-79.38,-4,'03:58/22:47']]) {
  const t = times('AngleBased', method, lat, lng, tz);
  ok((t.fajr+'/'+t.isha) === exp, `${nm} (${method}) unchanged: ${t.fajr}/${t.isha}`);
}

console.log('\n================ 6. STATIC — engine wiring (Isha-only, DE-only) + method + cache-busters ================');
ok(/function angleMargin\(angle, t, lat, jd\)/.test(ptSrc), 'engine has angleMargin() helper');
ok(/DE_ISHA_MIN_MARGIN\s*=\s*1\.0/.test(ptSrc), 'threshold DE_ISHA_MIN_MARGIN = 1.0');
ok(/dir === 'cw'[\s\S]{0,120}reached && margin >= DE_ISHA_MIN_MARGIN/.test(ptSrc), 'threshold applies to ISHA (cw) only: reached && margin >= threshold');
ok(/:\s*reached;\s*\/\/ الفجر/.test(ptSrc) || /\?\s*\(reached && margin[\s\S]{0,80}:\s*reached/.test(ptSrc), 'FAJR (ccw) keeps plain `reached` (no margin threshold)');
ok(/angleMargin\(m\.isha, t\.isha, lat, jd\)/.test(ptSrc), 'call site passes Isha margin');
ok(/angleMargin\(m\.fajr, t\.fajr, lat, jd\)/.test(ptSrc), 'call site passes Fajr margin (used only if a future gate; today Fajr ignores it)');
ok(/if \(config\.highLats === 'DEHybrid'\)/.test(ptSrc), 'threshold lives inside the DEHybrid branch (DE-only)');
ok(/highLats:\s*'AngleBased'/.test(ptSrc), 'global default still AngleBased');
ok(/de: 'DEHybrid'/.test(srvSrc) && /de: 'DEHybrid'/.test(appSrc), 'DE still mapped to DEHybrid on both sides (unchanged)');
ok(!/de: 'NightMiddle'/.test(srvSrc) && !/de: 'NightMiddle'/.test(appSrc), 'no lingering NightMiddle mapping');
ok(/js\/prayer-times\.js\?v=56/.test(htmlSrc), 'index.html prayer-times.js?v=56 (engine changed)');
ok(/js\/app\.js\?v=833/.test(htmlSrc), 'index.html app.js?v=833 (app.js UNCHANGED this ticket)');
ok(/CACHE_VERSION = 'v501'/.test(swSrc), "sw.js CACHE_VERSION 'v501'");
ok(!/<option[^>]*value="DEHybrid"/.test(htmlSrc), 'DEHybrid still NOT a dropdown option (method stays MWL)');

console.log('\n================ 7. Determinism (SSR==client given same inputs) ================');
const a1 = times('DEHybrid','MWL',50.11,8.68,2), a2 = times('DEHybrid','MWL',50.11,8.68,2);
ok(JSON.stringify(a1) === JSON.stringify(a2), 'two identical Frankfurt calls → identical output (deterministic)');
const de1 = times('DEHybrid','MWL',50.11,8.68,2); const sa1 = times('Makkah','AngleBased',24.71,46.68,3);
ok(sa1.fajr === '03:40' && sa1.isha === '20:16', 'a DE(DEHybrid) call does not leak into the next non-DE call');

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
