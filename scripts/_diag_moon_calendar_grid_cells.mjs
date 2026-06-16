// MOON-PHASE-CALENDAR-CALCULATION-AUDIT-1 — grid completeness check (READ-ONLY).
// Fetches the REAL SSR monthly calendar from a locally-booted server (PORT 8132,
// booted with TZ=UTC to match Render) and verifies, per month:
//   • every day 1..lastDay is present (no missing day — incl. day 1)
//   • no duplicate day cell
//   • leading-empty-cell count == first weekday (grid alignment)
//   • how many days carry the major-phase NAME (محاق / بدر) → duplicate detection
// Pure read-only; no app code touched.
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
  const gi = html.indexOf('moon-hub-cal-grid');
  return gi >= 0 ? html.slice(gi, gi + 12000) : '';
}
// Each non-empty cell = one <li class="moon-hub-cal-cell"> ... <a href=".../YYYY-MM-DD"> OR today href.
function cellDays(seg, slug, ym) {
  // dated cells
  const re = new RegExp('moon-in-' + slug.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '/' + ym + '-(\\d{2})', 'g');
  const dated = [...seg.matchAll(re)].map(m => parseInt(m[1], 10));
  return dated;
}

const CASES = [
  { lang: 'ar', slug: 'riyadh', y: 2026, m: 6, note: 'June 2026 (starts Mon, 30d) — reported case' },
  { lang: 'ar', slug: 'riyadh', y: 2026, m: 7, note: 'July 2026 (31d)' },
  { lang: 'ar', slug: 'riyadh', y: 2026, m: 1, note: 'January 2026 (31d, starts Thu)' },
  { lang: 'ar', slug: 'riyadh', y: 2026, m: 2, note: 'February 2026 (28d, starts Sun)' },
  { lang: 'ar', slug: 'riyadh', y: 2026, m: 3, note: 'March 2026 (31d, starts Sun)' },
  { lang: 'ar', slug: 'riyadh', y: 2026, m: 11, note: 'November 2026 (30d, starts Sun)' },
  { lang: 'ar', slug: 'riyadh', y: 2026, m: 12, note: 'December 2026 (31d, starts Tue)' },
  { lang: 'en', slug: 'london', y: 2026, m: 6, note: 'June 2026 EN (cross-lang check)' },
  { lang: 'ar', slug: 'seattle', y: 2026, m: 6, note: 'June 2026 Seattle (city tz check)' },
];

let FAIL = 0;
const ok = (c, msg) => { if (!c) { FAIL++; console.log('   ✗ ' + msg); } else console.log('   ✓ ' + msg); };

const PHASE_AR_NEW = 'محاق', PHASE_AR_FULL = 'بدر';
const PHASE_EN_NEW = 'New Moon', PHASE_EN_FULL = 'Full Moon';

(async () => {
  console.log('Grid completeness vs SSR (PORT ' + PORT + ', TZ=UTC server)\n');
  for (const c of CASES) {
    const ym = `${c.y}-${String(c.m).padStart(2, '0')}`;
    const path = `${c.lang === 'ar' ? '' : '/' + c.lang}/moon-in-${c.slug}/${ym}`;
    const html = await get(path, c.lang);
    const seg = isolateGrid(html);
    const total = (seg.match(/moon-hub-cal-cell(?![a-z-])/g) || []).length;
    const empty = (seg.match(/moon-hub-cal-cell--empty/g) || []).length;
    const real = total - empty;
    const last = lastDayOf(c.y, c.m);
    const fw = firstWday(c.y, c.m);
    const dated = cellDays(seg, c.slug, ym);
    const datedSet = [...new Set(dated)];
    // today (2026-06-16) shows as a today-href cell, so it's absent from dated set; account for it.
    const todayCells = (seg.match(/moon-today-in-/g) || []).length;
    const presentCount = datedSet.length + todayCells; // dated unique + today cell
    // Which 1..last are missing from the dated set (excluding the today day)?
    const missing = [];
    for (let d = 1; d <= last; d++) if (!datedSet.includes(d)) missing.push(d);
    // a single missing entry is allowed ONLY if it's "today" and there's a today cell
    const phaseNewCount = c.lang === 'ar'
      ? (seg.match(new RegExp(PHASE_AR_NEW, 'g')) || []).length
      : (seg.match(new RegExp(PHASE_EN_NEW, 'g')) || []).length;
    const phaseFullCount = c.lang === 'ar'
      ? (seg.match(new RegExp('>\\s*' + PHASE_AR_FULL, 'g')) || []).length
      : (seg.match(new RegExp(PHASE_EN_FULL, 'g')) || []).length;

    console.log(`════ ${ym} ${c.slug} [${c.lang}] — ${c.note}`);
    console.log(`   month days=${last} firstWday=${fw} | cells total=${total} empty=${empty} real=${real} | today-cells=${todayCells}`);
    ok(empty === fw, `leading empty cells (${empty}) == first weekday (${fw})`);
    ok(real === last, `real day-cells (${real}) == days in month (${last}) → NO missing/extra day`);
    ok(datedSet.length === dated.length, `no duplicate dated cell (${dated.length} hrefs, ${datedSet.length} unique)`);
    ok(missing.length === todayCells, `day 1..${last} all present (missing-from-dated=${JSON.stringify(missing)} explained by ${todayCells} today-cell)`);
    ok(datedSet.includes(1) || (todayCells && missing.includes(1)), `DAY 1 present (the reported "missing 1 June")`);
    console.log(`   phase-name cells: New-Moon-name×${phaseNewCount}  Full-Moon-name×${phaseFullCount}  ${(phaseNewCount>1||phaseFullCount>1)?'❌ duplicate major-phase NAME in grid':''}`);
    console.log('');
  }
  console.log('──────────────────────────────────────────');
  console.log(FAIL === 0 ? '✅ GRID COMPLETENESS: all days present, no missing/duplicate day cells.' : `❌ ${FAIL} grid check(s) failed.`);
  process.exit(0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
