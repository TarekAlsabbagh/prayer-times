// Smoke — PRAYER-DE-GERMANY-FAJR-ISHA-MWL-MISMATCH-1
// DE-ONLY high-latitude-rule override. Germany keeps method MWL (18°/17°) but its twilight rule becomes
// 'NightMiddle' in the CALC (SSR `_HIGHLAT_BY_CC` + client override in updatePrayerTimes), so Fajr/Isha
// match Google's MWL at high latitude; the global default stays 'AngleBased' and every OTHER country is
// byte-unchanged. Two layers: (1) ENGINE — run js/prayer-times.js with each cc's effective rule and assert
// DE cities move while non-DE cities equal their AngleBased baseline; (2) STATIC — the wiring is present on
// both sides, method/label untouched, global default untouched, cache-busters bumped.
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

// Mirror of the shipped override maps (both sides define the same).
const _HIGHLAT_BY_CC = { de: 'NightMiddle' };
const DATE = new Date(2026, 6, 9); // 2026-07-09
const CITIES = [
  // name, lat, lng, method, tzOffset, cc, isGermany
  ['Heilbronn', 49.13995, 9.22054, 'MWL',    2, 'de', true],
  ['Berlin',    52.5200,  13.4050, 'MWL',    2, 'de', true],
  ['Munich',    48.1372,  11.5756, 'MWL',    2, 'de', true],
  ['Hamburg',   53.5511,   9.9937, 'MWL',    2, 'de', true],
  ['Frankfurt', 50.1109,   8.6821, 'MWL',    2, 'de', true],
  ['Cologne',   50.9375,   6.9603, 'MWL',    2, 'de', true],
  ['Riyadh',    24.7136,  46.6753, 'Makkah', 3, 'sa', false],
  ['Istanbul',  41.0082,  28.9784, 'Turkey', 3, 'tr', false],
  ['Paris',     48.8566,   2.3522, 'France', 2, 'fr', false],
];
function times(method, rule, lat, lng, tz) {
  PT.setMethod(method); PT.setAsrMethod('Shafi'); PT.setHighLats(rule); PT.setTimeFormat('24h');
  return PT.getTimes(DATE, lat, lng, tz);
}

console.log('================ 1. ENGINE — DE moves to Google, non-DE unchanged ================');
for (const [name, lat, lng, method, tz, cc, isDE] of CITIES) {
  const baseline = times(method, 'AngleBased', lat, lng, tz);                  // current behavior
  const fixed    = times(method, _HIGHLAT_BY_CC[cc] || 'AngleBased', lat, lng, tz); // shipped behavior
  const changed  = (baseline.fajr !== fixed.fajr) || (baseline.isha !== fixed.isha);
  // sunrise/dhuhr/asr/maghrib must be identical either way
  const midStable = baseline.sunrise === fixed.sunrise && baseline.dhuhr === fixed.dhuhr &&
                    baseline.asr === fixed.asr && baseline.maghrib === fixed.maghrib;
  if (isDE) {
    ok(changed, `${name} (DE): Fajr/Isha MOVE under NightMiddle (${baseline.fajr}/${baseline.isha} → ${fixed.fajr}/${fixed.isha})`);
  } else {
    ok(!changed, `${name} (${cc}): Fajr/Isha UNCHANGED (${fixed.fajr}/${fixed.isha}) — not in _HIGHLAT_BY_CC`);
  }
  ok(midStable, `${name}: sunrise/dhuhr/asr/maghrib identical regardless of rule (${fixed.sunrise}/${fixed.dhuhr}/${fixed.asr}/${fixed.maghrib})`);
}
// The headline numbers the ticket cares about.
const heil = times('MWL', 'NightMiddle', 49.13995, 9.22054, 2);
ok(heil.fajr === '02:06', `Heilbronn Fajr = 02:06 (≈ Google 02:06); got ${heil.fajr}`);
ok(heil.isha === '00:20', `Heilbronn Isha = 00:20 (≈ Google 00:23); got ${heil.isha}`);
ok(heil.sunrise === '05:28' && heil.dhuhr === '13:28' && heil.asr === '17:44' && heil.maghrib === '21:28',
   `Heilbronn sunrise/dhuhr/asr/maghrib = 05:28/13:28/17:44/21:28 (unchanged)`);

console.log('\n================ 2. STATIC — SSR wiring (server.js) ================');
ok(/const _HIGHLAT_BY_CC = \{[\s\S]*?de: 'NightMiddle'/.test(srvSrc), 'server.js _HIGHLAT_BY_CC has de:NightMiddle');
ok(/PrayerTimesSrv\.setHighLats\(_HIGHLAT_BY_CC\[cc\] \|\| 'AngleBased'\)/.test(srvSrc), 'SSR sets high-lat explicitly per request (DE→NightMiddle, else AngleBased)');
ok(/const method = _SSR_METHOD_BY_CC\[cc\] \|\| 'MWL';/.test(srvSrc), 'SSR method map untouched (de still resolves to MWL, no label change)');
ok((srvSrc.match(/de: 'NightMiddle'/g) || []).length === 1, 'only DE gets a high-lat override in server.js');

console.log('\n================ 3. STATIC — client wiring (js/app.js) ================');
ok(/const _HIGHLAT_BY_CC = \{ de: 'NightMiddle' \};/.test(appSrc), 'app.js _HIGHLAT_BY_CC = { de:NightMiddle }');
ok(/_autoCalcCc = \(countryCode \|\| ''\)\.toLowerCase\(\)\.trim\(\);/.test(appSrc), 'client records current cc in autoSelectMethod');
ok(/const effHighLats = _HIGHLAT_BY_CC\[_calcCc\] \|\| highLats;/.test(appSrc), 'client computes effHighLats (DE override else dropdown value)');
ok(/PrayerTimes\.setHighLats\(effHighLats\);/.test(appSrc), 'client calc uses effHighLats (real calc effect, not label)');
ok(/const method\s+= document\.getElementById\('calc-method'\)\.value;/.test(appSrc), 'method still read from #calc-method (label/method untouched)');

console.log('\n================ 4. STATIC — global default + cache-busters ================');
ok(/highLats:\s*'AngleBased'/.test(ptSrc), 'js/prayer-times.js GLOBAL default still AngleBased (no global change)');
ok(/js\/app\.js\?v=832/.test(htmlSrc), 'index.html app.js?v=832');
ok(/CACHE_VERSION = 'v499'/.test(swSrc), "sw.js CACHE_VERSION 'v499'");
ok(/css\/style\.css\?v=497/.test(htmlSrc) && /js\/azkar-data\.js\?v=6/.test(htmlSrc), 'css v497 + azkar-data v6 unchanged');

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
