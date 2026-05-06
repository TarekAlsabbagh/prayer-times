// scripts/_audit_noindex.mjs
// ────────────────────────────────────────────────────────────────────────
// SEO regression guard: scans the live site for `<meta name="robots">` and
// fails CI / loud-warns the developer if any URL that SHOULD be indexable
// is serving `noindex`.
//
// Run before every production deploy:
//   node scripts/_audit_noindex.mjs                 → audits prayer-times-d4w8.onrender.com
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

const BASE = process.argv[2] || 'https://prayer-times-d4w8.onrender.com';

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
  '/moon-today-in-makkah',
  '/moon-in-makkah/2026-05',          // month page
  '/moon-in-makkah/2026-05-15',       // in-range date page
  '/en/moon-today-in-makkah',
  '/fr/qibla-in-cairo',

  // City pages — slug-only fallback (real city not yet in moon DB)
  // These were the HC-8 regression. MUST be indexable.
  '/moon-today-in-kamikawa',
  '/moon-in-kamikawa',
  '/moon-in-kamikawa/2026-05',
  '/moon-in-kamikawa/2026-05-15',
  '/en/moon-today-in-kamikawa',

  // City pages — non-DB city for non-moon routes (already indexable)
  '/qibla-in-kamikawa',
  '/prayer-times-in-kamikawa',
];

// URLs that intentionally MUST be noindex. Catching missing noindex here
// prevents synthetic-URL spam (millions of bogus coord/date combinations
// being indexed).
const MUST_NOINDEX = [
  // Coord-suffix URLs — generated programmatically, not for sharing.
  '/moon-today-in-kamikawa-43.5-142.7',
  '/moon-today-in-randomville-50.0-30.0',

  // Out-of-range date URLs — date is too far past or future to be a real
  // user request. Range is roughly today-30 to today+90 days.
  '/moon-in-makkah/2024-01-01',  // ~16+ months in the past
  '/moon-in-makkah/2030-01-01',  // ~3+ years in the future
];

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
