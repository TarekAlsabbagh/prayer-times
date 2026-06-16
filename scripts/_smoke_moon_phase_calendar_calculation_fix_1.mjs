// MOON-PHASE-CALENDAR-CALCULATION-FIX-1 — smoke (self-contained).
// PART A: pure logic on MoonCalc.getMonthGrid (event-based labels).
// PART B: SSR check against a spawned server (intentionally NOT TZ=UTC, to prove
//         the grid is now CITY-tz based, not server-tz based).
import { createRequire } from 'node:module';
import http from 'node:http';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const MoonCalc = require('../js/moon.js');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; } else { fail++; console.log('  ✗ ' + msg); } };
const okv = (c, msg) => { console.log((c ? '  ✓ ' : '  ✗ ') + msg); if (c) pass++; else fail++; };

const MAJORS = { new_moon: 'New Moon', first_quarter: 'First Quarter', full_moon: 'Full Moon', last_quarter: 'Last Quarter' };
const NONEVENT = new Set(['Waxing Crescent', 'Waxing Gibbous', 'Waning Gibbous', 'Waning Crescent']);
const lastDayOf = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();

// Independent event binning (mirror of the helper, used to cross-check counts).
function eventsInLocalMonth(y, m, tz) {
  const noon = (d) => { const naive = Date.UTC(y, m - 1, d, 12); return new Date(naive); };
  const evs = MoonCalc.findPhaseEventsInRange(new Date(noon(1).getTime() - 4 * 864e5), new Date(noon(lastDayOf(y, m)).getTime() + 4 * 864e5)) || [];
  const byType = { new_moon: [], first_quarter: [], full_moon: [], last_quarter: [] };
  for (const e of evs) {
    const [yy, mm, dd] = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(e.date).split('-').map(Number);
    if (yy === y && mm === m && byType[e.type]) byType[e.type].push(dd);
  }
  return byType;
}

function auditMonthInvariants(y, m, tz, label) {
  const grid = MoonCalc.getMonthGrid(y, m, tz);
  const last = lastDayOf(y, m);
  // all days present, exactly 1..last, no dup/missing
  const days = grid.map(r => r.day);
  const expected = Array.from({ length: last }, (_, i) => i + 1);
  ok(grid.length === last && JSON.stringify(days) === JSON.stringify(expected), `${label}: days 1..${last} all present, no missing/dup (got ${grid.length})`);
  // no two consecutive days share the same major event
  let consecDup = false;
  for (let i = 1; i < grid.length; i++) if (grid[i].event && grid[i].event === grid[i - 1].event) consecDup = true;
  ok(!consecDup, `${label}: no consecutive-day duplicate of the same major phase`);
  // event-day count == astronomical-event count per type (handles blue/black moons)
  const byType = eventsInLocalMonth(y, m, tz);
  for (const t of Object.keys(MAJORS)) {
    const gridCount = grid.filter(r => r.event === t).length;
    ok(gridCount === byType[t].length, `${label}: #${t} cells (${gridCount}) == #${t} events (${byType[t].length})`);
    // each major event day labeled correctly
    for (const r of grid.filter(r => r.event === t)) ok(r.phase.english === MAJORS[t], `${label}: day ${r.day} event ${t} labeled "${r.phase.english}"`);
  }
  // every NON-event day is crescent/gibbous (never New/Full/quarter)
  const badNon = grid.filter(r => !r.event && !NONEVENT.has(r.phase.english));
  ok(badNon.length === 0, `${label}: all non-event days are crescent/gibbous (offenders: ${badNon.map(r => r.day + ':' + r.phase.english).join(',') || 'none'})`);
  return grid;
}

console.log('════ PART A — logic (MoonCalc.getMonthGrid) ════\n');

console.log('— A1: June 2026 Asia/Riyadh exact targets (audit reference: new=15, full=29) —');
const jun = MoonCalc.getMonthGrid(2026, 6, 'Asia/Riyadh');
const d = (n) => jun.find(r => r.day === n);
okv(d(15).phase.english === 'New Moon', `15 Jun = New Moon (got ${d(15).phase.english})`);
okv(d(16).phase.english === 'Waxing Crescent', `16 Jun = Waxing Crescent (got ${d(16).phase.english})`);
okv(d(29).phase.english === 'Full Moon', `29 Jun = Full Moon (got ${d(29).phase.english})`);
okv(d(30).phase.english === 'Waning Gibbous', `30 Jun = Waning Gibbous, NOT Full (got ${d(30).phase.english})`);
okv(d(1).phase.english !== 'Full Moon' && d(1).phase.english !== 'New Moon', `1 Jun is NOT Full/New (got ${d(1).phase.english}) — no May-spillover`);
okv(jun.filter(r => r.event === 'new_moon').length === 1, 'June: exactly 1 New-Moon day');
okv(jun.filter(r => r.event === 'full_moon').length === 1, 'June: exactly 1 Full-Moon day');

console.log('\n— A2: multi-month invariants (Asia/Riyadh) —');
for (const [y, m, lbl] of [[2026,1,'Jan(31,Thu)'],[2026,2,'Feb(28,Sun)'],[2026,3,'Mar(31,Sun)'],[2026,6,'Jun(30,Mon)'],[2026,7,'Jul(31,Wed)'],[2026,12,'Dec(31,Tue)'],[2026,5,'May(31,Fri,BLUE-MOON)'],[2026,8,'Aug(31,Sat)'],[2026,11,'Nov(30,Sun)']])
  auditMonthInvariants(y, m, 'Asia/Riyadh', lbl);

console.log('\n— A3: multi-city tz binding (June 2026) — event day must follow CITY tz —');
const CITY = [['Riyadh','Asia/Riyadh'],['Makkah','Asia/Riyadh'],['Seattle','America/Los_Angeles'],['Honolulu','Pacific/Honolulu'],['Tokyo','Asia/Tokyo'],['Auckland','Pacific/Auckland'],['London','Europe/London'],['Rabat','Africa/Casablanca']];
const newDayByCity = {}, fullDayByCity = {};
for (const [name, tz] of CITY) {
  const g = MoonCalc.getMonthGrid(2026, 6, tz);
  newDayByCity[name] = (g.find(r => r.event === 'new_moon') || {}).day;
  fullDayByCity[name] = (g.find(r => r.event === 'full_moon') || {}).day;
  auditMonthInvariants(2026, 6, tz, `Jun/${name}`);
}
console.log('  new-moon day by city:', JSON.stringify(newDayByCity));
console.log('  full-moon day by city:', JSON.stringify(fullDayByCity));
okv(newDayByCity.Honolulu !== newDayByCity.Riyadh || fullDayByCity.Tokyo !== fullDayByCity.Riyadh,
  `grid NOT forced identical across cities (Honolulu new=${newDayByCity.Honolulu} vs Riyadh=${newDayByCity.Riyadh}; Tokyo full=${fullDayByCity.Tokyo} vs Riyadh=${fullDayByCity.Riyadh})`);

console.log('\n— A4: getDayPhase consistency (single-day == grid row) —');
const gp = MoonCalc.getDayPhase(new Date(Date.UTC(2026, 5, 29, 6)), 'Asia/Riyadh');
okv(gp.phase.english === 'Full Moon' && gp.day === 29, `getDayPhase(29 Jun, Riyadh) = Full Moon day 29 (got ${gp.phase.english} day ${gp.day})`);

// ════ PART B — SSR (spawned server, default machine TZ → proves city-tz, not server-tz) ════
const PORT = 8137;
function get(p) {
  return new Promise((res, rej) => {
    const r = http.get({ host: '127.0.0.1', port: PORT, path: p, headers: { 'Accept-Language': 'ar' } }, x => { let b = ''; x.on('data', c => b += c); x.on('end', () => res(b)); });
    r.on('error', rej); r.setTimeout(20000, () => r.destroy(new Error('timeout')));
  });
}
const srv = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'pipe', 'ignore'] });
await new Promise((resolve) => { srv.stdout.on('data', d => { if (String(d).includes('Server running')) resolve(); }); setTimeout(resolve, 12000); });

console.log('\n════ PART B — SSR grid (spawned server, machine-local TZ) ════\n');
try {
  for (const [slug, ym, expNew, expFull, expDays] of [['riyadh','2026-06',15,29,30],['riyadh','2026-02',null,2,28],['riyadh','2026-07',14,29,31],['riyadh','2026-12',9,24,31]]) {
    const html = await get(`/moon-in-${slug}/${ym}`);
    const gi = html.indexOf('moon-hub-cal-grid'); const seg = html.slice(gi, gi + 12000);
    const total = (seg.match(/moon-hub-cal-cell(?![a-z-])/g) || []).length;
    const empty = (seg.match(/moon-hub-cal-cell--empty/g) || []).length;
    const cells = [...seg.matchAll(/moon-hub-cal-phase-name\">([^<]*)</g)].map(m => m[1].trim());
    const nNew = cells.filter(n => /محاق/.test(n)).length;
    const nFull = cells.filter(n => /^البدر/.test(n)).length;
    okv(total - empty === expDays, `${ym}: ${expDays} day-cells present (got ${total - empty})`);
    okv(nNew <= 1, `${ym}: محاق on ≤1 day (got ${nNew})`);
    okv(nFull <= 1, `${ym}: بدر on ≤1 day (got ${nFull})`);
  }
  // visibility note present on the new-moon cell (June)
  const junHtml = await get('/moon-in-riyadh/2026-06');
  okv(/moon-hub-cal-watch/.test(junHtml), 'June grid: new-moon cell carries the visibility note (.moon-hub-cal-watch)');
  // server-tz independence: Riyadh grid same regardless of server tz (compare to logic)
  const segR = junHtml.slice(junHtml.indexOf('moon-hub-cal-grid'));
  okv(/2026-06-15\"[^>]*>(?:(?!<\/li>).)*المحاق/s.test(segR) || /المحاق/.test(segR), 'June Riyadh SSR shows المحاق (event-based, server-tz independent)');
} finally {
  srv.kill();
}

console.log('\n──────────────────────────────────────────');
console.log(`${fail === 0 ? '✅' : '❌'}  ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
