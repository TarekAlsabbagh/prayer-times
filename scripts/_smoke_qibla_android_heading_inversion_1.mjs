// Smoke — QIBLA-ANDROID-HEADING-DIRECTION-INVERSION-FIX-1
// Proves: (1) the REAL _androidAlphaToHeading extracted from js/app.js maps a clockwise
// Android `alpha` to the correct compass heading — North=0, East=90, South=180, West=270 —
// and never NaN across the wrap; (2) the OLD `(360 - alpha) % 360` mapping DID swap East↔West
// (documents the bug); (3) structurally, the Android branch now calls the new helper, the iOS
// path (webkitCompassHeading, immediate) is UNCHANGED, the jitter stabilizer (deadband / rate
// limit / rAF) is still present, and there is NO constant offset / NO Compass Lab.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const appSrc = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');

let pass = 0, fail = 0; const fails = [];
function ok(c, m) { if (c) { pass++; console.log('  PASS  ' + m); } else { fail++; fails.push(m); console.log('  FAIL  ' + m); } }

console.log('================ 1. REAL _androidAlphaToHeading (extracted from app.js) ================');
const m = appSrc.match(/function _androidAlphaToHeading\(alpha\) \{[\s\S]*?\n\}/);
ok(!!m, '_androidAlphaToHeading present in app.js');
const _androidAlphaToHeading = eval('(' + m[0].replace('function _androidAlphaToHeading', 'function') + ')');
// cardinal directions: the corrected mapping = alpha directly
ok(_androidAlphaToHeading(0)   === 0,   'North: alpha 0   → heading 0');
ok(_androidAlphaToHeading(90)  === 90,  'East:  alpha 90  → heading 90   (was 270 = West, now FIXED)');
ok(_androidAlphaToHeading(180) === 180, 'South: alpha 180 → heading 180');
ok(_androidAlphaToHeading(270) === 270, 'West:  alpha 270 → heading 270  (was 90 = East, now FIXED)');
// normalisation / wrap
ok(_androidAlphaToHeading(360)  === 0,   'wrap: alpha 360 → 0');
ok(_androidAlphaToHeading(359)  === 359, 'wrap: alpha 359 → 359');
ok(_androidAlphaToHeading(-1)   === 359, 'normalise negative: alpha -1 → 359');
ok(_androidAlphaToHeading(450)  === 90,  'normalise >360: alpha 450 → 90');
let bad = false;
for (let a = -720; a <= 720; a += 1) { const h = _androidAlphaToHeading(a); if (Number.isNaN(h) || h < 0 || h >= 360) bad = true; }
ok(!bad, '1441 alpha values: never NaN, always in [0, 360)');

console.log('\n================ 2. OLD mapping DID invert East/West (documents the bug) ================');
const oldMap = (alpha) => (360 - alpha) % 360;
ok(oldMap(90)  === 270, 'OLD (360-alpha): East alpha 90  → 270 (shown as West) — the bug');
ok(oldMap(270) === 90,  'OLD (360-alpha): West alpha 270 → 90  (shown as East) — the bug');
ok(oldMap(0)   === 0 || oldMap(0) === 360 % 360, 'OLD: North alpha 0 → 0 (N/S were unaffected)');
ok(oldMap(180) === 180, 'OLD: South alpha 180 → 180 (N/S were unaffected)');
// new fixes exactly the two that were wrong, leaves N/S identical
ok(_androidAlphaToHeading(90) !== oldMap(90) && _androidAlphaToHeading(270) !== oldMap(270), 'NEW differs from OLD exactly at E/W');
ok(_androidAlphaToHeading(0) === oldMap(0) && _androidAlphaToHeading(180) === oldMap(180), 'NEW == OLD at N/S (only E/W changed)');

console.log('\n================ 3. Structural: Android branch, iOS unchanged, stabilizer intact, no offset ================');
ok(/heading = _androidAlphaToHeading\(e\.alpha\);/.test(appSrc), 'Android branch now uses _androidAlphaToHeading(e.alpha)');
ok(!/heading = \(360 - e\.alpha\) % 360;/.test(appSrc), 'OLD inline (360 - e.alpha) mapping is GONE');
ok(/_applyCompassHeading\(e\.webkitCompassHeading\)/.test(appSrc), 'iOS still reads + applies webkitCompassHeading (unchanged)');
ok(/if \(e\.webkitCompassHeading != null[\s\S]{0,240}?_applyCompassHeading\(e\.webkitCompassHeading\);[\s\S]{0,60}?return;/.test(appSrc), 'iOS branch applies raw heading immediately + returns (unchanged)');
ok(/\} else \{[\s\S]{0,160}?_androidCompassStabilize\(heading\);/.test(appSrc), 'Android branch still routes through the jitter stabilizer');
// jitter stabilizer still present
ok(/_AND_DEADBAND\s*=\s*2\b/.test(appSrc) && /_AND_MAX_STEP\s*=\s*10\b/.test(appSrc), 'stabilizer deadband(2)+rate-limit(10) still present');
ok(/function _androidCompassFrame\(\)/.test(appSrc) && /requestAnimationFrame/.test(appSrc), 'stabilizer rAF loop still present');
// no offset / no lab, in the compass region
const regStart = appSrc.indexOf('function _applyCompassHeading');
const regEnd = appSrc.indexOf('function requestCompassPermission');
const region = appSrc.slice(regStart, regEnd).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
ok(!/\b8[35]\b/.test(region), 'NO +83/-83/85 constant offset in compass code');
// strip comments (RR2 comment mentions "Compass Lab"); `qiblaLab(?!el)` avoids the breadcrumb var qiblaLabel
const _invCode = appSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/([^:])\/\/[^\n]*/g, '$1');
ok(!/qiblaLab(?!el)/.test(_invCode) && !/Compass Lab/.test(_invCode), 'NO Compass Lab / ?qiblaLab param (code)');

console.log(`\nPASS=${pass}  FAIL=${fail}`);
if (fail > 0) { console.log('FAILED:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
