// MOON-PHASE-EVENT-DATE-REFERENCE-VALIDATION-1 — diagnostic (READ-ONLY, no app code touched).
//
// Independent reference = Jean Meeus "Astronomical Algorithms" Ch.49 (true phase
// JDE with the full periodic + planetary correction tables). This is essentially
// the method timeanddate.com uses. We compare:
//   (A) our js/moon.js findPhaseEventsInRange  (root-find on MEAN elongation D)
//   (B) Meeus-49 true phase time
//   (C) timeanddate anchors supplied by the user
// for New / First Quarter / Full / Last Quarter, May–Aug 2026, Riyadh + 7 cities.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const MoonCalc = require('../js/moon.js');

const DEG = Math.PI / 180;
const DELTA_T = 69; // seconds, TD−UT for 2026 (IERS/Meeus) — day-level negligible
const sin = (d) => Math.sin(d * DEG), cos = (d) => Math.cos(d * DEG);

// ── Meeus Ch.49: JDE (TD) of the phase for lunation index k + phase fraction ──
//   frac: 0=New, 0.25=First Q, 0.5=Full, 0.75=Last Q
function meeusPhaseJDE(k) {
  const T = k / 1236.85;
  let JDE = 2451550.09766 + 29.530588861 * k + 0.00015437 * T * T - 0.000000150 * T ** 3 + 0.00000000073 * T ** 4;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  const M  = 2.5534 + 29.10535670 * k - 0.0000014 * T * T - 0.00000011 * T ** 3;
  const Mp = 201.5643 + 385.81693528 * k + 0.0107582 * T * T + 0.00001238 * T ** 3 - 0.000000058 * T ** 4;
  const F  = 160.7108 + 390.67050284 * k - 0.0016118 * T * T - 0.00000227 * T ** 3 + 0.000000011 * T ** 4;
  const Om = 124.7746 - 1.56375588 * k + 0.0020672 * T * T + 0.00000215 * T ** 3;
  const phase = ((k % 1) + 1) % 1; // 0,0.25,0.5,0.75
  let corr = 0;
  if (phase === 0 || phase === 0.5) { // New or Full
    corr = -0.40720 * sin(Mp) + 0.17241 * E * sin(M) + 0.01608 * sin(2*Mp) + 0.01039 * sin(2*F)
      + 0.00739 * E * sin(Mp - M) - 0.00514 * E * sin(Mp + M) + 0.00208 * E*E * sin(2*M)
      - 0.00111 * sin(Mp - 2*F) - 0.00057 * sin(Mp + 2*F) + 0.00056 * E * sin(2*Mp + M)
      - 0.00042 * sin(3*Mp) + 0.00042 * E * sin(M + 2*F) + 0.00038 * E * sin(M - 2*F)
      - 0.00024 * E * sin(2*Mp - M) - 0.00017 * sin(Om) - 0.00007 * sin(Mp + 2*M)
      + 0.00004 * sin(2*Mp - 2*F) + 0.00004 * sin(3*M) + 0.00003 * sin(Mp + M - 2*F)
      + 0.00003 * sin(2*Mp + 2*F) - 0.00003 * sin(Mp + M + 2*F) + 0.00003 * sin(Mp - M + 2*F)
      - 0.00002 * sin(Mp - M - 2*F) - 0.00002 * sin(3*Mp + M) + 0.00002 * sin(4*Mp);
  } else { // First or Last quarter
    corr = -0.62801 * sin(Mp) + 0.17172 * E * sin(M) - 0.01183 * E * sin(Mp + M) + 0.00862 * sin(2*Mp)
      + 0.00804 * sin(2*F) + 0.00454 * E * sin(Mp - M) + 0.00204 * E*E * sin(2*M)
      - 0.00180 * sin(Mp - 2*F) - 0.00070 * sin(Mp + 2*F) - 0.00040 * sin(3*Mp)
      - 0.00034 * E * sin(2*Mp - M) + 0.00032 * E * sin(M + 2*F) + 0.00032 * E * sin(M - 2*F)
      - 0.00028 * E*E * sin(Mp + 2*M) + 0.00027 * E * sin(2*Mp + M) - 0.00017 * sin(Om)
      - 0.00005 * sin(Mp - M - 2*F) + 0.00004 * sin(2*Mp + 2*F) - 0.00004 * sin(Mp + M + 2*F)
      + 0.00004 * sin(Mp - 2*M) + 0.00003 * sin(Mp + M - 2*F) + 0.00003 * sin(3*M)
      + 0.00002 * sin(2*Mp - 2*F) + 0.00002 * sin(Mp - M + 2*F) - 0.00002 * sin(3*Mp + M);
    const W = 0.00306 - 0.00038 * E * cos(M) + 0.00026 * cos(Mp) - 0.00002 * cos(Mp - M)
      + 0.00002 * cos(Mp + M) + 0.00002 * cos(2*F);
    corr += (phase === 0.25) ? W : -W;
  }
  // Additional planetary corrections A1..A14 (days)
  const A = [
    [299.77 + 0.107408 * k - 0.009173 * T * T, 0.000325],
    [251.88 + 0.016321 * k, 0.000165], [251.83 + 26.651886 * k, 0.000164],
    [349.42 + 36.412478 * k, 0.000126], [84.66 + 18.206239 * k, 0.000110],
    [141.74 + 53.303771 * k, 0.000062], [207.14 + 2.453732 * k, 0.000060],
    [154.84 + 7.306860 * k, 0.000056], [34.52 + 27.261239 * k, 0.000047],
    [207.19 + 0.121824 * k, 0.000042], [291.34 + 1.844379 * k, 0.000040],
    [161.72 + 24.198154 * k, 0.000037], [239.56 + 25.513099 * k, 0.000035],
    [331.55 + 3.592518 * k, 0.000023],
  ];
  let add = 0; for (const [ang, c] of A) add += c * sin(ang);
  return JDE + corr + add;
}
function jdToDateUTC(jd) {
  jd -= DELTA_T / 86400; // TD → UT(C)
  jd += 0.5; const Z = Math.floor(jd), Fr = jd - Z;
  let A; if (Z < 2299161) A = Z; else { const al = Math.floor((Z - 1867216.25) / 36524.25); A = Z + 1 + al - Math.floor(al / 4); }
  const B = A + 1524, C = Math.floor((B - 122.1) / 365.25), D = Math.floor(365.25 * C), E = Math.floor((B - D) / 30.6001);
  const day = B - D - Math.floor(30.6001 * E) + Fr;
  const mo = (E < 14) ? E - 1 : E - 13, yr = (mo > 2) ? C - 4716 : C - 4715;
  const di = Math.floor(day), hh = (day - di) * 24, h = Math.floor(hh), mm = (hh - h) * 60, m = Math.floor(mm), s = Math.round((mm - m) * 60);
  return new Date(Date.UTC(yr, mo - 1, di, h, m, s));
}
const PHASES = [['new_moon', 0], ['first_quarter', 0.25], ['full_moon', 0.5], ['last_quarter', 0.75]];
function meeusEventsInRange(startUTC, endUTC) {
  const out = [];
  const y0 = startUTC.getUTCFullYear() + (startUTC.getUTCMonth()) / 12;
  const kBase = Math.floor((y0 - 2000) * 12.3685) - 2;
  for (let kk = kBase; kk < kBase + 8; kk++) {
    for (const [type, fr] of PHASES) {
      const d = jdToDateUTC(meeusPhaseJDE(kk + fr));
      if (d >= startUTC && d < endUTC) out.push({ type, date: d });
    }
  }
  return out.sort((a, b) => a.date - b.date);
}

const localDay = (d, tz) => new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const localFull = (d, tz) => new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(d).replace(',', '');
const RY = 'Asia/Riyadh';

console.log('MOON-PHASE-EVENT-DATE-REFERENCE-VALIDATION-1 — our algorithm vs Meeus Ch.49 (≈ timeanddate)\n');

for (const [y, m] of [[2026, 5], [2026, 6], [2026, 7], [2026, 8]]) {
  const s = new Date(Date.UTC(y, m - 1, 1)), e = new Date(Date.UTC(y, m, 1));
  const ours = MoonCalc.findPhaseEventsInRange(s, e) || [];
  const meeus = meeusEventsInRange(new Date(Date.UTC(y, m - 1, 1, -12)), new Date(Date.UTC(y, m, 1, 12)));
  console.log(`════ ${y}-${String(m).padStart(2,'0')} (Riyadh local) ════`);
  console.log(['event','OUR (UTC)','OUR Riyadh','Meeus (UTC)','Meeus Riyadh','Δh','day match?'].map(s=>s.padEnd(15)).join(''));
  for (const [type] of PHASES) {
    const o = ours.find(x => x.type === type), me = meeus.find(x => localDay(x.date, RY).slice(0,7) === `${y}-${String(m).padStart(2,'0')}` && x.type === type) || meeus.find(x => x.type === type);
    if (!o && !me) continue;
    const oU = o ? o.date.toISOString().slice(5, 16) : '—', mU = me ? me.date.toISOString().slice(5, 16) : '—';
    const oRy = o ? localDay(o.date, RY) : '—', mRy = me ? localDay(me.date, RY) : '—';
    const dh = (o && me) ? ((o.date - me.date) / 3600000).toFixed(1) : '—';
    const match = (o && me) ? (oRy === mRy ? 'YES' : '❌ NO') : '—';
    console.log([type, oU, oRy, mU, mRy, dh, match].map(s=>String(s).padEnd(15)).join(''));
  }
  console.log('');
}

console.log('════ 3 FLAGGED CASES vs timeanddate (user-provided, Riyadh) ════');
const TAD = [
  ['last_quarter', 2026, 5, 'timeanddate: 2026-05-10 00:10'],
  ['first_quarter', 2026, 5, 'timeanddate: 2026-05-23 14:10'],
  ['full_moon', 2026, 6, 'timeanddate: 2026-06-30 02:56'],
  ['new_moon', 2026, 6, 'timeanddate: 2026-06-15 (≈)'],
];
for (const [type, y, m, tad] of TAD) {
  const ours = (MoonCalc.findPhaseEventsInRange(new Date(Date.UTC(y, m - 1, 1)), new Date(Date.UTC(y, m, 1))) || []).find(x => x.type === type);
  const meeus = meeusEventsInRange(new Date(Date.UTC(y, m - 1, 1, -12)), new Date(Date.UTC(y, m, 1, 12))).find(x => x.type === type);
  console.log(`• ${type} ${y}-${String(m).padStart(2,'0')}`);
  console.log(`    OUR  : Riyadh ${ours ? localFull(ours.date, RY) : '—'}`);
  console.log(`    Meeus: Riyadh ${meeus ? localFull(meeus.date, RY) : '—'}`);
  console.log(`    ${tad}`);
}

console.log('\n════ MULTI-CITY local day per event (Meeus-49 = correct reference) — June 2026 ════');
const CITY = [['Riyadh','Asia/Riyadh'],['Makkah','Asia/Riyadh'],['Seattle','America/Los_Angeles'],['Honolulu','Pacific/Honolulu'],['Tokyo','Asia/Tokyo'],['Auckland','Pacific/Auckland'],['London','Europe/London'],['Rabat','Africa/Casablanca'],['New York','America/New_York']];
const junMeeus = meeusEventsInRange(new Date(Date.UTC(2026, 4, 20)), new Date(Date.UTC(2026, 6, 10)));
const junOurs = MoonCalc.findPhaseEventsInRange(new Date(Date.UTC(2026, 5, 1)), new Date(Date.UTC(2026, 6, 1))) || [];
for (const [type] of PHASES) {
  const me = junMeeus.filter(x => x.type === type).find(x => localDay(x.date, RY).startsWith('2026-06'));
  const ou = junOurs.find(x => x.type === type);
  if (!me) continue;
  console.log(`  ${type} — Meeus UTC ${me.date.toISOString().slice(5,16)} | our UTC ${ou ? ou.date.toISOString().slice(5,16) : '—'}`);
  console.log('     local day (Meeus→correct): ' + CITY.map(([n, tz]) => n + '=' + localDay(me.date, tz).slice(8)).join('  '));
  if (ou) console.log('     local day (OUR→shipped):  ' + CITY.map(([n, tz]) => n + '=' + localDay(ou.date, tz).slice(8)).join('  '));
}
console.log('\nDONE.');
