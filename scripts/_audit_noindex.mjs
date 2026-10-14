// scripts/_audit_noindex.mjs
// ────────────────────────────────────────────────────────────────────────
// SEO regression guard: scans the live site for `<meta name="robots">` and
// fails CI / loud-warns the developer if any URL that SHOULD be indexable
// is serving `noindex`.
//
// Run before every production deploy:
//   node scripts/_audit_noindex.mjs                 → audits prayer-times-d4w8.onrender.com  (⚠ FORBIDDEN — see LOCAL ONLY below)
//   node scripts/_audit_noindex.mjs http://localhost:3000  → audits local
//
// Categorization:
//   • MUST_INDEX     — homepage, all city pages, all hub pages, all month
//                      pages, FAQ pages, in-range date pages, all
//                      service pages. ANY noindex here = bug.
//   • MUST_NOINDEX   — coord-suffix URLs and out-of-range date URLs.
//                      MISSING noindex here is also a bug (could lead to
//                      synthetic-URL spam in the index).
//
// History:
//   • Phase HC-8 (2026-05-06): added after a real-city slug not in the
//     moon DB (kamikawa) was wrongly tagged as noindex. The unconditional
//     `_isCoordOnlyMoon` branch in server.js needed to be scoped to
//     `_isCoordOnlyMoon && _hasCoordSuffix`. This script catches that
//     class of regression by sampling representative URLs.
//   • MOON-DAY-PAGES-REMOVAL-1: every moon today/day entry left MUST_INDEX / MUST_NOINDEX → MUST_410 (410 in ONE
//     response, no Location) or, for clean slugs the server cannot resolve without a discovered row (kamikawa),
//     MUST_404_OR_410 (the router keeps its 404; a discovered row would make it 410). Hub/month entries kept.
//
// ⚠⚠⚠ LOCAL ONLY ⚠⚠⚠  The default BASE below is PRODUCTION (historic). Do NOT run this script without an explicit
//     LOCAL base URL argument (e.g. http://localhost:3000). Standing rule: no production requests (AdSense live,
//     invalid-traffic safety). The default is left unchanged on purpose; never rely on it.

const BASE = process.argv[2] || 'https://prayer-times-d4w8.onrender.com';   // ⚠ PRODUCTION default — always pass a LOCAL URL

const MUST_INDEX = [
  // Core
  '/',
  '/en', '/fr', '/tr', '/ur', '/de', '/id', '/es', '/bn', '/ms',
  '/index.html',

  // Hub pages
  '/qibla',
  '/moon-today',
  '/today-hijri-date',
  '/hijri-calendar/1447',
  '/dateconverter',
  '/zakat-calculator',
  '/azkar',
  '/msbaha',

  // Countdown pages
  '/ramadan-countdown',
  '/eid-al-fitr-countdown',
  '/eid-al-adha-countdown',
  '/hijri-new-year-countdown',

  // City pages — DB cities (large, well-known)
  '/prayer-times-in-makkah',
  '/prayer-times-in-medina',
  '/prayer-times-in-cairo',
  '/qibla-in-makkah',
  '/qibla-in-cairo',
  '/moon-in-makkah',
  '/moon-in-makkah/2026-05',          // month page
  '/fr/qibla-in-cairo',
  // MOON-DAY-PAGES-REMOVAL-1: /moon-today-in-makkah, /moon-in-makkah/2026-05-15, /en/moon-today-in-makkah → MUST_410.

  // City pages — slug-only fallback (real city not yet in moon DB)
  // These were the HC-8 regression. MUST be indexable.
  '/moon-in-kamikawa',
  '/moon-in-kamikawa/2026-05',
  // MOON-DAY-PAGES-REMOVAL-1: /moon-today-in-kamikawa, /moon-in-kamikawa/2026-05-15, /en/moon-today-in-kamikawa → MUST_404_OR_410.

  // City pages — non-DB city for non-moon routes (already indexable)
  '/qibla-in-kamikawa',
  '/prayer-times-in-kamikawa',
];

// URLs that intentionally MUST be noindex. Catching missing noindex here
// prevents synthetic-URL spam (millions of bogus coord/date combinations
// being indexed).
const MUST_NOINDEX = [
  // MOON-DAY-PAGES-REMOVAL-1: the former entries were all moon today/day pages (coord-suffix today URLs and
  //   out-of-window dated URLs) → moved to MUST_410 below. Nothing moon-day-shaped is "noindex" any more: it is gone.
];

// MOON-DAY-PAGES-REMOVAL-1: removed moon day/today pages → HTTP 410 in ONE response (no Location, no redirect follow).
const MUST_410 = [
  '/moon-today-in-makkah',
  '/en/moon-today-in-makkah',
  '/moon-in-makkah/2026-05-15',          // former in-range date page
  '/moon-today-in-kamikawa-43.5-142.7',  // coord-suffix today: always 410
  '/moon-today-in-randomville-50.0-30.0',
  '/moon-in-makkah/2024-01-01',          // former out-of-window date page (supported year)
  '/moon-in-makkah/2030-01-01',
];
// Clean slugs that resolve only through a discovered (Supabase) row: the router keeps its 404 when there is none,
// and answers 410 when there is one. Either is correct; a 200 or a redirect is a regression.
const MUST_404_OR_410 = [
  '/moon-today-in-kamikawa',
  '/moon-in-kamikawa/2026-05-15',
  '/en/moon-today-in-kamikawa',
];

async function fetchStatus(url) {
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 20000);
    const resp = await fetch(url, { redirect: 'manual', signal: ctrl.signal });
    clearTimeout(timeout);
    const body = await resp.text().catch(() => '');
    return { status: resp.status, location: resp.headers.get('location') || '', gone: /data-tp-gone="moon-day"/.test(body) };
  } catch (e) {
    return { error: e.message };
  }
}

async function fetchRobots(url) {
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 20000);
    const resp = await fetch(url, { redirect: 'follow', signal: ctrl.signal });
    clearTimeout(timeout);
    if (!resp.ok) return { error: `HTTP ${resp.status}` };
    const html = await resp.text();
    const m = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
    return { robots: m ? m[1] : null, finalUrl: resp.url };
  } catch (e) {
    return { error: e.message };
  }
}

const results = { ok: [], fail: [] };

console.log(`\n=== Auditing ${BASE} ===\n`);

console.log(`[MUST_INDEX] ${MUST_INDEX.length} URLs that MUST be indexable:`);
for (const path of MUST_INDEX) {
  const url = BASE + path;
  const { robots, error, finalUrl } = await fetchRobots(url);
  const isIndex = robots && /^index/i.test(robots);
  if (error) {
    console.log(`  ⚠ ${path} — fetch error: ${error}`);
    results.fail.push({ path, expected: 'index', got: 'ERROR: ' + error });
  } else if (isIndex) {
    console.log(`  ✅ ${path}`);
    results.ok.push(path);
  } else {
    console.log(`  ❌ ${path} — got: ${robots || '(no meta)'}`);
    results.fail.push({ path, expected: 'index', got: robots || '(no meta)' });
  }
}

console.log(`\n[MUST_NOINDEX] ${MUST_NOINDEX.length} URLs that MUST be noindex (anti-spam):`);
for (const path of MUST_NOINDEX) {
  const url = BASE + path;
  const { robots, error } = await fetchRobots(url);
  const isNoindex = robots && /^noindex/i.test(robots);
  if (error) {
    console.log(`  ⚠ ${path} — fetch error: ${error}`);
    results.fail.push({ path, expected: 'noindex', got: 'ERROR: ' + error });
  } else if (isNoindex) {
    console.log(`  ✅ ${path}`);
    results.ok.push(path);
  } else {
    console.log(`  ❌ ${path} — got: ${robots || '(no meta)'}`);
    results.fail.push({ path, expected: 'noindex', got: robots || '(no meta)' });
  }
}

console.log(`\n[MUST_410] ${MUST_410.length} removed moon day/today URLs that MUST answer 410 (no redirect):`);
for (const path of MUST_410) {
  const { status, location, gone, error } = await fetchStatus(BASE + path);
  if (error) {
    console.log(`  ⚠ ${path} — fetch error: ${error}`);
    results.fail.push({ path, expected: '410', got: 'ERROR: ' + error });
  } else if (status === 410 && !location && gone) {
    console.log(`  ✅ ${path}`);
    results.ok.push(path);
  } else {
    console.log(`  ❌ ${path} — got: HTTP ${status}${location ? ' → ' + location : ''}`);
    results.fail.push({ path, expected: '410 (no Location)', got: `HTTP ${status}${location ? ' → ' + location : ''}` });
  }
}

console.log(`\n[MUST_404_OR_410] ${MUST_404_OR_410.length} unresolved-slug moon day/today URLs (404 stays 404; discovered → 410):`);
for (const path of MUST_404_OR_410) {
  const { status, location, gone, error } = await fetchStatus(BASE + path);
  if (error) {
    console.log(`  ⚠ ${path} — fetch error: ${error}`);
    results.fail.push({ path, expected: '404 or 410', got: 'ERROR: ' + error });
  } else if ((status === 404 && !location) || (status === 410 && !location && gone)) {
    console.log(`  ✅ ${path} (HTTP ${status})`);
    results.ok.push(path);
  } else {
    console.log(`  ❌ ${path} — got: HTTP ${status}${location ? ' → ' + location : ''}`);
    results.fail.push({ path, expected: '404 or 410 (no Location)', got: `HTTP ${status}${location ? ' → ' + location : ''}` });
  }
}

console.log(`\n=== Summary ===`);
console.log(`Pass: ${results.ok.length}`);
console.log(`Fail: ${results.fail.length}`);

if (results.fail.length > 0) {
  console.log(`\nFailures:`);
  for (const f of results.fail) {
    console.log(`  ${f.path}\n     expected: ${f.expected}\n     got:      ${f.got}`);
  }
  process.exit(1);
}

console.log(`\n✅ All checks passed. SEO indexing is configured correctly.`);
process.exit(0);
