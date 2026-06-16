// MOON-PHASE-CALENDAR-CALCULATION-AUDIT-1 — diagnostic (READ-ONLY, no app code touched).
//
// Loads the project's OWN js/moon.js (MoonCalc) and reproduces the SSR monthly
// calendar grid labeling to demonstrate:
//   (1) Duplicate New Moon / Full Moon: the grid labels each day via
//       MoonCalc.getPhaseName(noon) which is ILLUMINATION-THRESHOLD based
//       (pct<1 → New Moon, pct>=99 → Full Moon). Those bands each last ~1.9
//       days, so two consecutive noon samples fall in-band → the same major
//       phase is printed on 2 calendar days.
//   (2) The event-based truth: findPhaseEventsInRange pins each major phase to
//       the single instant (and thus single local day) it actually occurs.
//   (3) Grid day-coverage: the SSR loop is day=1..lastDay (so every day SHOULD
//       be present) — the report cross-checks this against the real SSR HTML.
//   (4) Timezone behaviour: the GRID samples server-local noon (city-independent)
//       whereas getForecast() (moon-today/forecast) is city-tz aware.
//
// NOTE: production (Render) runs in UTC, and the SSR grid samples
// `new Date(y, m-1, day, 12)` = 12:00 server-local = 12:00 UTC. This script
// samples at 12:00 UTC to match production exactly.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const MoonCalc = require('../js/moon.js');

const NEW = 'New Moon', FULL = 'Full Moon';
const isMajor = (en) => en === NEW || en === FULL;

// Replicate the SSR grid sample instant for a given Y, M(1-12), day: 12:00 UTC.
const noonUTC = (y, m, d) => new Date(Date.UTC(y, m - 1, d, 12, 0, 0));

function monthLabel(y, m) {
  return `${y}-${String(m).padStart(2, '0')}`;
}
function lastDayOf(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
function firstWday(y, m) { return new Date(Date.UTC(y, m - 1, 1, 12)).getUTCDay(); } // 0=Sun

// Reproduce the SSR grid's per-day phase label (getPhaseName at noon-UTC).
function gridPhases(y, m) {
  const last = lastDayOf(y, m);
  const rows = [];
  for (let d = 1; d <= last; d++) {
    const dt = noonUTC(y, m, d);
    const ph = MoonCalc.getPhaseName(dt);
    const il = MoonCalc.getMoonIllumination(dt);
    rows.push({ d, en: ph.english, ar: ph.name, illum: il });
  }
  return rows;
}

// The astronomical truth: the 4 major events that occur within the month (UTC).
function monthEvents(y, m) {
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0)); // first instant of next month
  const evs = MoonCalc.findPhaseEventsInRange(start, end) || [];
  return evs.map(e => ({
    type: e.type,
    en: e.phase.english,
    // local UTC day the event falls on + the exact UTC time
    utcDay: e.date.getUTCDate(),
    iso: e.date.toISOString().replace('.000Z', 'Z')
  }));
}

function auditMonth(y, m, note) {
  const lbl = monthLabel(y, m);
  const last = lastDayOf(y, m);
  const fw = firstWday(y, m);
  const rows = gridPhases(y, m);
  const newDays = rows.filter(r => r.en === NEW).map(r => r.d);
  const fullDays = rows.filter(r => r.en === FULL).map(r => r.d);
  const events = monthEvents(y, m);

  console.log(`\n════════ ${lbl}  (${note}) ════════`);
  console.log(`  days in month: ${last} · first weekday (0=Sun..6=Sat): ${fw} · leading empty cells: ${fw}`);
  console.log(`  grid covers days: 1..${last}  (loop is day=1..lastDay → all present in HTML loop)`);
  // Duplicate detection on the GRID (getPhaseName threshold)
  console.log(`  GRID getPhaseName(noon-UTC) major-phase days:`);
  console.log(`    New Moon (محاق) labeled on day(s): [${newDays.join(', ')}]  ${newDays.length > 1 ? '❌ DUPLICATE' : (newDays.length === 1 ? '✓ single' : '— none in month')}`);
  console.log(`    Full Moon (بدر) labeled on day(s): [${fullDays.join(', ')}]  ${fullDays.length > 1 ? '❌ DUPLICATE' : (fullDays.length === 1 ? '✓ single' : '— none in month')}`);
  // The astronomical events (truth)
  console.log(`  ASTRONOMICAL events in month (findPhaseEventsInRange, UTC):`);
  for (const e of events) console.log(`    ${e.en.padEnd(13)} → day ${String(e.utcDay).padStart(2)}  @ ${e.iso}`);
  // For each duplicated major phase, show the illum on the 2 days vs the single event day
  for (const [label, days] of [['New Moon', newDays], ['Full Moon', fullDays]]) {
    if (days.length > 1) {
      const ev = events.find(e => e.en === label);
      console.log(`  ↳ ${label} duplicated on days [${days.join(', ')}]; true event day = ${ev ? ev.utcDay : '?'}.`);
      for (const d of days) {
        const r = rows.find(x => x.d === d);
        console.log(`       day ${String(d).padStart(2)}: illumination ${r.illum.toFixed(2)}%  → threshold labeled "${label}"`);
      }
    }
  }
  return { lbl, last, fw, newDays, fullDays, events };
}

console.log('MOON-PHASE-CALENDAR-CALCULATION-AUDIT-1 — phase/calendar diagnostic');
console.log('Sampling instant per grid cell: 12:00 UTC (matches Render server-local noon).');

// ── Required test months ──────────────────────────────────────────────────
auditMonth(2026, 6, 'June 2026 — the reported case; starts Monday; 30 days');
auditMonth(2026, 7, 'July 2026 — 31 days');
auditMonth(2026, 1, 'January 2026 — 31 days; starts Thursday');
auditMonth(2026, 2, 'February 2026 — 28 days');
auditMonth(2026, 3, 'March 2026 — 31 days; starts Sunday');
auditMonth(2026, 12, 'December 2026 — 31 days');
auditMonth(2026, 11, 'November 2026 — 30 days; starts Sunday (start-Sunday case)');
auditMonth(2026, 2, 'February 2026 again — 28-day case (start Sunday)');

// ── Summary across a full year: how many months have duplicate major phases ─
console.log('\n════════ YEAR SWEEP 2026 — duplicate-major-phase frequency ════════');
let dupNew = 0, dupFull = 0;
for (let m = 1; m <= 12; m++) {
  const rows = gridPhases(2026, m);
  const nn = rows.filter(r => r.en === NEW).length;
  const nf = rows.filter(r => r.en === FULL).length;
  if (nn > 1) dupNew++;
  if (nf > 1) dupFull++;
  console.log(`  ${monthLabel(2026, m)}: New-Moon-labeled days=${nn}${nn>1?' ❌':''} · Full-Moon-labeled days=${nf}${nf>1?' ❌':''}`);
}
console.log(`  → months with DUPLICATE New Moon: ${dupNew}/12 · DUPLICATE Full Moon: ${dupFull}/12`);

// ── Timezone behaviour: grid (server noon) vs getForecast (city tz) ────────
console.log('\n════════ TIMEZONE: does the major-phase DAY move between cities? ════════');
console.log('A) GRID path = MoonCalc.getPhaseName(new Date(y,m,d,12)) — uses SERVER-LOCAL noon, NO city tz.');
console.log('   → identical grid for every city (city-independent). [structural fact from server.js:21702]');
console.log('B) getForecast path (moon-today / forecast) — uses city IANA tz to bin events into local days:');
const CITY = [
  ['Riyadh', 24.71, 46.67, 'Asia/Riyadh'],
  ['Seattle', 47.61, -122.33, 'America/Los_Angeles'],
  ['Honolulu', 21.31, -157.86, 'Pacific/Honolulu'],
  ['Tokyo', 35.68, 139.69, 'Asia/Tokyo'],
  ['Auckland', -36.85, 174.76, 'Pacific/Auckland'],
  ['London', 51.51, -0.13, 'Europe/London'],
  ['Rabat', 34.02, -6.83, 'Africa/Casablanca'],
];
// Find the June 2026 new-moon event day per city via getForecast labels.
for (const [name, lat, lng, tz] of CITY) {
  const fc = MoonCalc.getForecast(new Date(Date.UTC(2026, 5, 1, 0, 0, 0)), lat, lng, 30, tz);
  const nm = fc.find(x => x.event === 'new_moon');
  const fm = fc.find(x => x.event === 'full_moon');
  const dayOf = (entry) => entry ? new Date(entry.dayStart.getTime() + 12 * 3600000).getUTCDate() : '?';
  // event local day index (1-based within the forecast window starting Jun 1 local)
  const nmIdx = nm ? fc.indexOf(nm) + 1 : '?';
  const fmIdx = fm ? fc.indexOf(fm) + 1 : '?';
  console.log(`   ${name.padEnd(9)} (${tz.padEnd(20)}): forecast new-moon local day#=${String(nmIdx).padStart(2)} · full-moon local day#=${String(fmIdx).padStart(2)}  (day# counts from Jun 1 local)`);
}
console.log('   → if the event day# differs between cities, the major-phase day legitimately shifts by tz —');
console.log('     proving the GRID (city-independent) is inconsistent with the city-tz moon-today view.');

console.log('\nDONE — see report reports/moon-phase-calendar-calculation-audit-1.md');
