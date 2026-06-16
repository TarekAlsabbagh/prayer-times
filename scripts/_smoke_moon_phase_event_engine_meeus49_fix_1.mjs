// MOON-PHASE-EVENT-ENGINE-MEEUS49-FIX-1 — accuracy smoke (no server).
// Asserts the moon.js event engine (now Meeus Ch.49) matches the external
// reference (timeanddate / published ephemerides, validated to the minute) within
// a tight tolerance, AND that the calendar binds each event to the correct LOCAL
// day per city. Guards against any regression to mean-elongation-D timing.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const MoonCalc = require('../js/moon.js');

let pass = 0, fail = 0;
const ok = (c, msg) => { console.log((c ? '  ✓ ' : '  ✗ ') + msg); if (c) pass++; else fail++; };
const TOL_MIN = 10; // ±10 minutes vs reference

const RY = 'Asia/Riyadh';
const localFull = (d, tz) => new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(d).replace(',', '');
const localDay = (d, tz) => Number(new Intl.DateTimeFormat('en-CA', { timeZone: tz, day: '2-digit' }).format(d));
const evsOf = (y, m) => MoonCalc.findPhaseEventsInRange(new Date(Date.UTC(y, m - 1, 1)), new Date(Date.UTC(y, m, 1))) || [];

// ── Reference UTC event times (timeanddate / published, minute precision) ──
// Cross-checked: June Full = 2026-06-29T23:57Z (timeanddate + astronomy.com + starwalk).
const REF = [
  ['full_moon',    2026, 5, '2026-05-01T17:21Z'], ['last_quarter', 2026, 5, '2026-05-09T21:10Z'],
  ['new_moon',     2026, 5, '2026-05-16T20:01Z'], ['first_quarter',2026, 5, '2026-05-23T11:10Z'],
  ['full_moon',    2026, 5, '2026-05-31T08:44Z'],
  ['last_quarter', 2026, 6, '2026-06-08T10:00Z'], ['new_moon',     2026, 6, '2026-06-15T02:54Z'],
  ['first_quarter',2026, 6, '2026-06-21T21:55Z'], ['full_moon',    2026, 6, '2026-06-29T23:57Z'],
  ['last_quarter', 2026, 7, '2026-07-07T19:29Z'], ['new_moon',     2026, 7, '2026-07-14T09:43Z'],
  ['first_quarter',2026, 7, '2026-07-21T11:05Z'], ['full_moon',    2026, 7, '2026-07-29T14:37Z'],
];

console.log('════ (1) Event-time accuracy vs reference (±' + TOL_MIN + ' min, UTC) ════');
for (const [type, y, m, iso] of REF) {
  // a blue/black-moon month can have TWO of the same event — pick the nearest to the reference.
  const cands = evsOf(y, m).filter(e => e.type === type);
  const refMs = Date.parse(iso);
  const ev = cands.length ? cands.reduce((a, b) => Math.abs(a.date.getTime() - refMs) < Math.abs(b.date.getTime() - refMs) ? a : b) : null;
  if (!ev) { ok(false, `${y}-${String(m).padStart(2,'0')} ${type}: MISSING from engine`); continue; }
  const diffMin = Math.abs(ev.date.getTime() - Date.parse(iso)) / 60000;
  ok(diffMin <= TOL_MIN, `${y}-${String(m).padStart(2,'0')} ${type.padEnd(13)} engine ${ev.date.toISOString().slice(5,16)} vs ref ${iso.slice(5,16)}  Δ=${diffMin.toFixed(1)}min`);
}

console.log('\n════ (2) The 3 flagged cases + new moon — Riyadh local (timeanddate anchors) ════');
const ANCHOR = [
  ['last_quarter', 2026, 5, '2026-05-10 00:10', 10],
  ['first_quarter',2026, 5, '2026-05-23 14:10', 23],
  ['new_moon',     2026, 6, '2026-06-15 05:54', 15],
  ['full_moon',    2026, 6, '2026-06-30 02:57', 30],
];
for (const [type, y, m, expLocal, expDay] of ANCHOR) {
  const ev = evsOf(y, m).find(e => e.type === type);
  const got = ev ? localFull(ev.date, RY) : '—';
  const gotDay = ev ? localDay(ev.date, RY) : -1;
  // tolerate ±a couple minutes in the displayed local time; day must match exactly
  ok(gotDay === expDay, `${type.padEnd(13)} Riyadh local day = ${gotDay} (timeanddate: ${expDay}) — got "${got}" vs "${expLocal}"`);
}

console.log('\n════ (3) June 2026 grid — corrected days ════');
const g = MoonCalc.getMonthGrid(2026, 6, RY);
const d = (n) => g.find(r => r.day === n).phase.english;
ok(d(1) !== 'Full Moon' && d(1) !== 'New Moon', `1 Jun present, not major (got ${d(1)})`);
ok(d(15) === 'New Moon', `15 Jun = New Moon (got ${d(15)})`);
ok(d(16) === 'Waxing Crescent', `16 Jun = Waxing Crescent (got ${d(16)})`);
ok(d(29) === 'Waxing Gibbous', `29 Jun = Waxing Gibbous, NOT Full (got ${d(29)})`);
ok(d(30) === 'Full Moon', `30 Jun = Full Moon — accurate (got ${d(30)})`);
ok(g.length === 30, `all 30 days present (got ${g.length})`);
ok(g.filter(r => r.event === 'new_moon').length === 1 && g.filter(r => r.event === 'full_moon').length === 1, 'June: exactly 1 New + 1 Full');

console.log('\n════ (4) Multi-city local day of June full moon (event follows city tz) ════');
const CITY = [['Riyadh','Asia/Riyadh',30],['Makkah','Asia/Riyadh',30],['Seattle','America/Los_Angeles',29],['Honolulu','Pacific/Honolulu',29],['Tokyo','Asia/Tokyo',30],['Auckland','Pacific/Auckland',30],['London','Europe/London',30],['Rabat','Africa/Casablanca',30],['New York','America/New_York',29]];
for (const [name, tz, exp] of CITY) {
  const fd = (MoonCalc.getMonthGrid(2026, 6, tz).find(r => r.event === 'full_moon') || {}).day;
  ok(fd === exp, `${name.padEnd(9)} full-moon local day = ${fd} (expected ${exp})`);
}

console.log('\n════ (5) Multi-month invariants (all days, single event per astro event, non-event=crescent/gibbous) ════');
const NON = new Set(['Waxing Crescent', 'Waxing Gibbous', 'Waning Gibbous', 'Waning Crescent']);
for (const [y, m] of [[2026,1],[2026,2],[2026,3],[2026,4],[2026,5],[2026,6],[2026,7],[2026,8],[2026,9],[2026,10],[2026,11],[2026,12]]) {
  const gg = MoonCalc.getMonthGrid(y, m, RY);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  let dup = false; for (let i = 1; i < gg.length; i++) if (gg[i].event && gg[i].event === gg[i-1].event) dup = true;
  const badNon = gg.filter(r => !r.event && !NON.has(r.phase.english)).length;
  // event-cell count must equal real astronomical events of that type (handles blue/black moon)
  let countOk = true;
  for (const t of ['new_moon','first_quarter','full_moon','last_quarter']) {
    if (gg.filter(r => r.event === t).length !== evsOf(y, m).filter(e => e.type === t && localDay(e.date, RY) && new Intl.DateTimeFormat('en-CA',{timeZone:RY,year:'numeric',month:'2-digit'}).format(e.date) === `${y}-${String(m).padStart(2,'0')}`).length) countOk = false;
  }
  ok(gg.length === last && !dup && badNon === 0 && countOk, `${y}-${String(m).padStart(2,'0')}: ${last} days, no consecutive dup, non-event=crescent/gibbous, event-count matches`);
}

console.log('\n──────────────────────────────────────────');
console.log(`${fail === 0 ? '✅' : '❌'}  ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
