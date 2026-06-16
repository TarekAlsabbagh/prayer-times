// HIJRI-DATE-CITY-TIMEZONE-FIX-1 — standalone smoke (no server required).
//
// Exercises the REAL shipping client function HijriDate.getTodayInTimezone(iana)
// (the same code the browser runs) at controlled instants by temporarily
// substituting a Date subclass frozen to a fixed UTC moment. Proves:
//   1. LIVE  — every test city yields a valid in-range Hijri equal to its own
//              city-local civil date (never Mecca, never device).
//   2. BOUNDARY just after Mecca midnight (2026-06-15T21:30Z → 1 Muharram 1448):
//              cities BEHIND Mecca (Seattle/Honolulu/New York/London/Rabat) stay
//              on 29 ذو الحجة 1447 while AT/AHEAD-of Mecca (Makkah/KL/Tokyo/
//              Auckland) show 1 محرم 1448. This is the exact user-reported bug,
//              now resolved per-city.
//   3. REVERSE boundary (2026-06-15T12:30Z): an AHEAD city (Auckland) has already
//              rolled into 1 محرم 1448 while Mecca is still on 29 ذو الحجة 1447 —
//              proving the date follows the CITY, in both directions.
//   4. FALLBACK — null / '' / malformed IANA → getToday() (device), never throws.
//
// Run: node scripts/_smoke_hijri_date_city_timezone_fix_1.mjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
globalThis._HIJRI_UMM_AL_QURA = require('../db/hijri/umm-al-qura.json');
const HijriDate = require('../js/hijri-date.js');

const AR = HijriDate.hijriMonths;
const fmt = (h) => h ? `${h.day} ${AR[h.month - 1]} ${h.year}` : '(null)';
const eq = (h, d, m, y) => h && h.day === d && h.month === m && h.year === y;

let FAIL = 0;
const ok = (c, msg) => { console.log((c ? '  ✓ ' : '  ✗ ') + msg); if (!c) FAIL++; };

// Run a thunk with `new Date()` (argless) and Date.now() frozen to `iso`,
// while preserving every other Date behaviour (parsing, arithmetic, Intl).
const RealDate = Date;
function atInstant(iso, thunk) {
  const ms = RealDate.parse(iso);
  class FakeDate extends RealDate {
    constructor(...a) { if (a.length === 0) super(ms); else super(...a); }
    static now() { return ms; }
  }
  globalThis.Date = FakeDate;
  try { return thunk(); } finally { globalThis.Date = RealDate; }
}

const CITIES = [
  { label: 'Seattle',      iana: 'America/Los_Angeles' },
  { label: 'Honolulu',     iana: 'Pacific/Honolulu' },
  { label: 'New York',     iana: 'America/New_York' },
  { label: 'Makkah',       iana: 'Asia/Riyadh' },
  { label: 'Kuala Lumpur', iana: 'Asia/Kuala_Lumpur' },
  { label: 'Tokyo',        iana: 'Asia/Tokyo' },
  { label: 'Auckland',     iana: 'Pacific/Auckland' },
  { label: 'London',       iana: 'Europe/London' },
  { label: 'Rabat',        iana: 'Africa/Casablanca' },
];

// city-local civil Y-M-D at a given instant (independent recomputation)
function cityYmd(iso, iana) {
  return atInstant(iso, () =>
    new Intl.DateTimeFormat('en-CA', { timeZone: iana, year: 'numeric', month: '2-digit', day: '2-digit' })
      .format(new Date()).split('-').map(Number));
}

console.log('════ (1) LIVE — getTodayInTimezone == city-local civil date, in-range ════');
for (const c of CITIES) {
  const h = HijriDate.getTodayInTimezone(c.iana);
  const [y, m, d] = cityYmd(new Date().toISOString(), c.iana); // live instant, this city
  const expect = HijriDate.toHijri(y, m, d);
  ok(h && HijriDate.isValidHijriDate(h.year, h.month, h.day), `${c.label}: in-range Hijri (${fmt(h)})`);
  ok(eq(h, expect.day, expect.month, expect.year), `${c.label}: == city-local (${fmt(expect)})`);
}

console.log('\n════ (2) BOUNDARY 2026-06-15T21:30:00Z (Mecca just entered 1 Muharram 1448) ════');
const B = '2026-06-15T21:30:00.000Z';
const BEHIND = { Seattle: 'America/Los_Angeles', Honolulu: 'Pacific/Honolulu', 'New York': 'America/New_York', London: 'Europe/London', Rabat: 'Africa/Casablanca' };
const AHEAD  = { Makkah: 'Asia/Riyadh', 'Kuala Lumpur': 'Asia/Kuala_Lumpur', Tokyo: 'Asia/Tokyo', Auckland: 'Pacific/Auckland' };
for (const [label, iana] of Object.entries(BEHIND)) {
  const h = atInstant(B, () => HijriDate.getTodayInTimezone(iana));
  ok(eq(h, 29, 12, 1447), `${label} (behind Mecca): 29 ذو الحجة 1447 — NOT Mecca's 1 Muharram (got ${fmt(h)})`);
}
for (const [label, iana] of Object.entries(AHEAD)) {
  const h = atInstant(B, () => HijriDate.getTodayInTimezone(iana));
  ok(eq(h, 1, 1, 1448), `${label} (at/ahead of Mecca): 1 محرم 1448 (got ${fmt(h)})`);
}

console.log('\n════ (3) REVERSE boundary 2026-06-15T12:30:00Z (Auckland ahead, Mecca behind) ════');
const R = '2026-06-15T12:30:00.000Z';
const auck = atInstant(R, () => HijriDate.getTodayInTimezone('Pacific/Auckland'));
const mecc = atInstant(R, () => HijriDate.getTodayInTimezone('Asia/Riyadh'));
ok(eq(auck, 1, 1, 1448), `Auckland already rolled to 1 محرم 1448 (got ${fmt(auck)})`);
ok(eq(mecc, 29, 12, 1447), `Mecca still on 29 ذو الحجة 1447 (got ${fmt(mecc)})`);
ok(!eq(auck, mecc.day, mecc.month, mecc.year), 'Auckland ≠ Mecca — date follows the city (ahead direction)');

console.log('\n════ (4) FALLBACK — bad/missing IANA → getToday(), never throws ════');
const dev = HijriDate.getToday();
for (const bad of [null, undefined, '', '   ', 'Not/AZone', 42, {}]) {
  let h, threw = false;
  try { h = HijriDate.getTodayInTimezone(bad); } catch (_e) { threw = true; }
  ok(!threw, `getTodayInTimezone(${JSON.stringify(bad)}) did not throw`);
  ok(eq(h, dev.day, dev.month, dev.year), `  → fell back to device getToday() (${fmt(dev)})`);
}

console.log('\n──────────────────────────────────────────');
console.log(FAIL === 0 ? '✅ ALL SMOKE CHECKS PASSED' : `❌ ${FAIL} SMOKE CHECK(S) FAILED`);
process.exit(FAIL === 0 ? 0 : 1);
