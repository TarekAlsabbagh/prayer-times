// MOON-PHASE-CALENDAR-CALCULATION-AUDIT-1 — grid completeness check (READ-ONLY).
// Fetches the REAL SSR monthly calendar from a locally-booted server (PORT 8132,
// booted with TZ=UTC to match Render) and verifies, per month:
//   • every day 1..lastDay is present (no missing day — incl. day 1)
//   • no duplicate day cell
//   • leading-empty-cell count == first weekday (grid alignment)
//   • how many days carry the major-phase NAME (محاق / بدر) → duplicate detection
// Pure read-only; no app code touched.
// MOON-DAY-PAGES-REMOVAL-1: reads the NESTED month page /[lang/]moon/{country}/{city}/{yyyy}/{mm} and parses each
//   cell's .moon-hub-cal-date text (the cells carry no day href any more; works on <a> and <div> cell wrappers).
import http from 'node:http';
const PORT = Number(process.env.PORT || 8132), HOST = '127.0.0.1';
function get(path, lang) {
  return new Promise((res, rej) => {
    const r = http.get({ host: HOST, port: PORT, path, headers: { 'Accept-Language': lang || 'ar' } }, x => {
      let b = ''; x.on('data', c => b += c); x.on('end', () => res(b));
    });
    r.on('error', rej); r.setTimeout(15000, () => r.destroy(new Error('timeout')));
  });
}
const lastDayOf = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const firstWday = (y, m) => new Date(Date.UTC(y, m - 1, 1, 12)).getUTCDay();

function isolateGrid(html) {
  return (html.match(/<ul class="moon-hub-cal-grid">([\s\S]*?)<\/ul>/) || [])[1] || '';
}
// Every grid cell = one <li class="moon-hub-cal-cell[ --today][ --empty]">; a non-empty cell carries
//   <span class="moon-hub-cal-date">15 يونيو</span> ("June 15" in en) → the day number is the digits of that text.
const gridCells = (seg) => [...seg.matchAll(/<li class="(moon-hub-cal-cell[^"]*)"[^>]*>([\s\S]*?)<\/li>/g)].map(m => ({ cls: m[1], html: m[2] }));
const spanText = (html, cls) => ((html.match(new RegExp('<span class="' + cls + '"[^>]*>([^<]*)</span>')) || [])[1] || '');
function cellDays(seg) {
  return gridCells(seg).filter(c => !/--empty/.test(c.cls)).map(c => parseInt((spanText(c.html, 'moon-hub-cal-date').match(/\d+/) || [])[0], 10));
}

const CASES = [
  { lang: 'ar', country: 'saudi-arabia', slug: 'riyadh', y: 2026, m: 6, note: 'June 2026 (starts Mon, 30d) — reported case' },
  { lang: 'ar', country: 'saudi-arabia', slug: 'riyadh', y: 2026, m: 7, note: 'July 2026 (31d)' },
  { lang: 'ar', country: 'saudi-arabia', slug: 'riyadh', y: 2026, m: 1, note: 'January 2026 (31d, starts Thu)' },
  { lang: 'ar', country: 'saudi-arabia', slug: 'riyadh', y: 2026, m: 2, note: 'February 2026 (28d, starts Sun)' },
  { lang: 'ar', country: 'saudi-arabia', slug: 'riyadh', y: 2026, m: 3, note: 'March 2026 (31d, starts Sun)' },
  { lang: 'ar', country: 'saudi-arabia', slug: 'riyadh', y: 2026, m: 11, note: 'November 2026 (30d, starts Sun)' },
  { lang: 'ar', country: 'saudi-arabia', slug: 'riyadh', y: 2026, m: 12, note: 'December 2026 (31d, starts Tue)' },
  { lang: 'en', country: 'united-kingdom', slug: 'london', y: 2026, m: 6, note: 'June 2026 EN (cross-lang check)' },
  { lang: 'ar', country: 'united-states', slug: 'seattle', y: 2026, m: 6, note: 'June 2026 Seattle (city tz check)' },
];

let FAIL = 0;
const ok = (c, msg) => { if (!c) { FAIL++; console.log('   ✗ ' + msg); } else console.log('   ✓ ' + msg); };

const PHASE_AR_NEW = 'محاق', PHASE_AR_FULL = 'بدر';
const PHASE_EN_NEW = 'New Moon', PHASE_EN_FULL = 'Full Moon';

(async () => {
  console.log('Grid completeness vs SSR (PORT ' + PORT + ', TZ=UTC server)\n');
  for (const c of CASES) {
    const ym = `${c.y}-${String(c.m).padStart(2, '0')}`;
    // MOON-DAY-PAGES-REMOVAL-1: the legacy /moon-in-{slug}/{ym} only 301s now — read the nested month page directly.
    const path = `${c.lang === 'ar' ? '' : '/' + c.lang}/moon/${c.country}/${c.slug}/${c.y}/${String(c.m).padStart(2, '0')}`;
    const html = await get(path, c.lang);
    const seg = isolateGrid(html);
    const cells = gridCells(seg);
    const total = cells.length;
    const empty = cells.filter(x => /--empty/.test(x.cls)).length;
    const real = total - empty;
    const last = lastDayOf(c.y, c.m);
    const fw = firstWday(c.y, c.m);
    const dated = cellDays(seg);   // day numbers from the .moon-hub-cal-date text of every non-empty cell (today cell included)
    const datedSet = [...new Set(dated)];
    const todayCells = cells.filter(x => /--today/.test(x.cls)).length;   // informational only (the today cell has date text too)
    // Which 1..last are missing from the parsed day numbers?
    const missing = [];
    for (let d = 1; d <= last; d++) if (!datedSet.includes(d)) missing.push(d);
    const phaseNames = cells.filter(x => !/--empty/.test(x.cls)).map(x => spanText(x.html, 'moon-hub-cal-phase-name'));
    const phaseNewCount = phaseNames.filter(t => t.includes(c.lang === 'ar' ? PHASE_AR_NEW : PHASE_EN_NEW)).length;
    const phaseFullCount = phaseNames.filter(t => t.includes(c.lang === 'ar' ? PHASE_AR_FULL : PHASE_EN_FULL)).length;

    console.log(`════ ${ym} ${c.slug} [${c.lang}] — ${c.note}`);
    console.log(`   month days=${last} firstWday=${fw} | cells total=${total} empty=${empty} real=${real} | today-cells=${todayCells}`);
    ok(empty === fw, `leading empty cells (${empty}) == first weekday (${fw})`);
    ok(real === last, `real day-cells (${real}) == days in month (${last}) → NO missing/extra day`);
    ok(datedSet.length === dated.length, `no duplicate day cell (${dated.length} cells, ${datedSet.length} unique day numbers)`);
    ok(missing.length === 0, `day 1..${last} all present (missing=${JSON.stringify(missing)})`);
    ok(datedSet.includes(1), `DAY 1 present (the reported "missing 1 June")`);
    ok((seg.match(/<a\b/g) || []).length === 0, `0 <a> inside the grid (day cells are plain text)`);
    console.log(`   phase-name cells: New-Moon-name×${phaseNewCount}  Full-Moon-name×${phaseFullCount}  ${(phaseNewCount>1||phaseFullCount>1)?'❌ duplicate major-phase NAME in grid':''}`);
    console.log('');
  }
  console.log('──────────────────────────────────────────');
  console.log(FAIL === 0 ? '✅ GRID COMPLETENESS: all days present, no missing/duplicate day cells.' : `❌ ${FAIL} grid check(s) failed.`);
  process.exit(0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
