// MOON-PHASE-CALENDAR-CALCULATION-FIX-1 — smoke (self-contained).
// PART A: pure logic on MoonCalc.getMonthGrid (event-based labels).
// PART B: SSR check against a spawned server (intentionally NOT TZ=UTC, to prove
//         the grid is now CITY-tz based, not server-tz based).
// MOON-DAY-PAGES-REMOVAL-1: Part B counts the month grid's non-empty day cells (=== expDays) and reads the
//   phase-name / moon-hub-cal-watch spans of the new/full-moon cells on the month page (day pages are 410 now).
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

console.log('— A1: June 2026 Asia/Riyadh exact targets (Meeus/timeanddate: new=15, full=30 02:57) —');
const jun = MoonCalc.getMonthGrid(2026, 6, 'Asia/Riyadh');
const d = (n) => jun.find(r => r.day === n);
okv(d(15).phase.english === 'New Moon', `15 Jun = New Moon (got ${d(15).phase.english})`);
okv(d(16).phase.english === 'Waxing Crescent', `16 Jun = Waxing Crescent (got ${d(16).phase.english})`);
okv(d(29).phase.english === 'Waxing Gibbous', `29 Jun = Waxing Gibbous, NOT Full (got ${d(29).phase.english})`);
okv(d(30).phase.english === 'Full Moon', `30 Jun = Full Moon — accurate Meeus day (got ${d(30).phase.english})`);
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
const gp = MoonCalc.getDayPhase(new Date(Date.UTC(2026, 5, 30, 6)), 'Asia/Riyadh');
okv(gp.phase.english === 'Full Moon' && gp.day === 30, `getDayPhase(30 Jun, Riyadh) = Full Moon day 30 (got ${gp.phase.english} day ${gp.day})`);

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
  // MOON-CITY-MONTH-ROUTE-STRUCTURE-SCOPE-CORRECTION-FIX-1: the legacy monthly grid /moon-in-{slug}/{ym}
  //   301s to the nested month page /moon/{country}/{slug}/{yyyy}/{mm}, which now renders the SAME legacy
  //   #page-moon monthly CALENDAR GRID (.moon-hub-cal-grid).
  // MOON-DAY-PAGES-REMOVAL-1: the day pages are 410 and the grid cells are plain text, so validate the SAME
  //   Meeus output on the month page itself: non-empty cell count === expDays, and the phase-name span of the
  //   new/full-moon cells (cell parser works on the old <a href> and the new <div class="moon-hub-cal-cell-body">).
  //   NB 2026-06 full moon = day 30 in Asia/Riyadh (PART A1); the old tuple said 29, which only passed because the
  //   day-29 PAGE mentioned "البدر" somewhere in its text — the cell-level check needs the real event day.
  const calGrid = (b) => (b.match(/<ul class="moon-hub-cal-grid">([\s\S]*?)<\/ul>/) || [])[1] || '';
  const calCells = (b) => [...calGrid(b).matchAll(/<li class="(moon-hub-cal-cell[^"]*)"[^>]*>([\s\S]*?)<\/li>/g)].filter(x => !/--empty/.test(x[1])).map(x => x[2]);
  const calSpan = (html, cls) => ((html.match(new RegExp('<span class="' + cls + '"[^>]*>([^<]*)</span>')) || [])[1] || '');
  const calCellOf = (b, n) => calCells(b).find(c => parseInt((calSpan(c, 'moon-hub-cal-date').match(/\d+/) || [])[0], 10) === n) || '';
  for (const [slug, country, ym, expNew, expFull, expDays] of [['riyadh','saudi-arabia','2026-06',15,30,30],['riyadh','saudi-arabia','2026-02',null,2,28],['riyadh','saudi-arabia','2026-07',14,29,31],['riyadh','saudi-arabia','2026-12',9,24,31]]) {
    const [y, m] = ym.split('-');
    const html = await get(`/moon/${country}/${slug}/${y}/${m}`);
    const nCells = calCells(html).length, nA = (calGrid(html).match(/<a\b/g) || []).length;
    okv(html.includes('moon-hub-cal-grid') && nCells === expDays && nA === 0, `${ym}: legacy grid + ${expDays} day cells + 0 <a> in grid (got ${nCells} cells, ${nA} <a>)`);
    if (expNew != null) { const pn = calSpan(calCellOf(html, expNew), 'moon-hub-cal-phase-name'); okv(/محاق/.test(pn), `${ym}: محاق on day ${expNew} (month grid cell phase-name "${pn}")`); }
    { const pn = calSpan(calCellOf(html, expFull), 'moon-hub-cal-phase-name'); okv(/البدر/.test(pn), `${ym}: البدر on day ${expFull} (month grid cell phase-name "${pn}")`); }
  }
  // new-moon day carries the crescent-visibility note — rendered on the month page's new-moon cell only
  const junMo = await get('/moon/saudi-arabia/riyadh/2026/06');
  const junNew = calCellOf(junMo, 15);
  const watch = calSpan(junNew, 'moon-hub-cal-watch');
  okv(watch.includes('يُتحرى هلال الشهر مساء هذا اليوم') && (calGrid(junMo).match(/class="moon-hub-cal-watch"/g) || []).length === 1, `June new-moon cell (day 15) carries the crescent-visibility note (only once in the grid): "${watch}"`);
  // server-tz independence: Riyadh new-moon day shows المحاق regardless of server tz
  okv(/المحاق/.test(calSpan(junNew, 'moon-hub-cal-phase-name')), 'June Riyadh SSR shows المحاق on day 15 (event-based, server-tz independent)');
} finally {
  srv.kill();
}

console.log('\n──────────────────────────────────────────');
console.log(`${fail === 0 ? '✅' : '❌'}  ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
