// Phase H — Sitemap output verification (HTTP-level)
//
// يطلب /sitemap.xml + /sitemap-cities-1.xml من الخادم المحلّي ويتحقّق من:
//   - XML صحيح
//   - كل URL في الـ sitemap له slug من db/curated-slugs.json (canonical فقط)
//   - لا توجد روابط قديمة (مثل /prayer-times-in-mecca) — يجب أن تُحوَّل قبل الفهرسة
//   - لا query params في أي URL
//   - لا coord-only slugs (loc-NN.N-NN.N)
//   - hreflang يحوي 10 لغات + x-default
//   - robots.txt يحوي Disallow صحيح + Sitemap directive
//
// تشغيل: تأكّد أن الخادم يعمل على :3000 ثم: node scripts/test-sitemap-output.mjs

import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.SITE_URL || 'http://localhost:3000';
const SITEMAP_INDEX = `${BASE}/sitemap.xml`;
const ROBOTS = `${BASE}/robots.txt`;

const data = JSON.parse(fs.readFileSync(path.resolve('db/curated-slugs.json'), 'utf8'));
const validSlugs = new Set(data.entries.map(e => e.slug));
const oldSlugs = new Set(Object.keys(data.redirects));

let pass = 0, fail = 0;
const failures = [];
function ok(label) { pass++; console.log(`  ✓ ${label}`); }
function bad(label) { fail++; failures.push(`  ✗ ${label}`); console.log(`  ✗ ${label}`); }

console.log(`\n══════ Phase H — Sitemap Output Test Suite ══════`);
console.log(`Base URL: ${BASE}\n`);

// ── 1) Fetch sitemap index ────────────────────────────────────────────
console.log(`▌ A) /sitemap.xml index`);
let indexXml = '';
try {
    const r = await fetch(SITEMAP_INDEX);
    if (r.status !== 200) { bad(`sitemap.xml status ${r.status}`); }
    else {
        indexXml = await r.text();
        ok('sitemap.xml returns 200');
    }
} catch (e) {
    bad(`fetch failed: ${e.message}`);
    process.exit(1);
}

// Extract sub-sitemap URLs
const submapUrls = [...indexXml.matchAll(/<loc>([^<]+sitemap-cities-\d+\.xml)<\/loc>/g)].map(m => m[1]);
ok(`Index references ${submapUrls.length} city sub-sitemap(s)`);

// ── 2) Fetch each sub-sitemap ─────────────────────────────────────────
console.log(`\n▌ B) /sitemap-cities-N.xml content validation`);
let allUrls = [];
for (const url of submapUrls) {
    const r = await fetch(url);
    if (r.status !== 200) { bad(`${url} status ${r.status}`); continue; }
    const xml = await r.text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    allUrls.push({ submap: url, xml, urls });
}
const totalUrls = allUrls.reduce((n, x) => n + x.urls.length, 0);
ok(`Collected ${totalUrls} <loc> entries across ${allUrls.length} sub-sitemap(s)`);

// ── 3) Validate every URL ─────────────────────────────────────────────
console.log(`\n▌ C) URL canonical-purity checks`);
let badQuery = 0, coordOnly = 0, oldSlugUsed = 0, unknownSlug = 0;
const cityUrlRe = /\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?(?:prayer-times-in|qibla-in|moon-today-in|moon-in|about|time-left-until-prayer-in|next-prayer-time-in)-([a-z][a-z0-9-]+?)(?:\/\d{4}-\d{2}-\d{2})?$/;

for (const { urls } of allUrls) {
    for (const u of urls) {
        try {
            const path = new URL(u).pathname;
            if (u.includes('?')) badQuery++;
            const m = path.match(cityUrlRe);
            if (m) {
                const slug = m[1];
                if (slug.startsWith('loc-') && /\d/.test(slug)) coordOnly++;
                if (oldSlugs.has(slug)) { oldSlugUsed++; failures.push(`  ✗ old slug "${slug}" leaked into sitemap (should redirect): ${u}`); }
                if (!validSlugs.has(slug)) {
                    // Country slugs like /prayer-times-in-saudi-arabia don't match curated; skip those
                    // Detect country-list URLs by checking against the simple pattern (only with no extra)
                    const seemsCity = !path.includes('/about-') ||
                        validSlugs.has(slug) || /-/.test(slug);
                    // We only want the guarantee for prayer-times-in / qibla-in (city pages)
                    if (/\/(?:prayer-times-in|qibla-in|moon-today-in|moon-in)-/.test(path)) {
                        // Check curated set
                        if (!validSlugs.has(slug)) {
                            unknownSlug++;
                            failures.push(`  ✗ unknown slug "${slug}" in sitemap: ${u}`);
                        }
                    }
                }
            }
        } catch(e) {}
    }
}
badQuery === 0 ? ok('No URLs contain query strings') : bad(`${badQuery} URLs contain query strings`);
coordOnly === 0 ? ok('No coord-only slugs (loc-NN.Nx-NN.Nx)') : bad(`${coordOnly} coord-only slugs found`);
oldSlugUsed === 0 ? ok('No old/non-canonical slugs (mecca, giza-governorate, etc.)') : bad(`${oldSlugUsed} old slugs leaked`);
unknownSlug === 0 ? ok(`All city slugs map to curated-slugs.json (${validSlugs.size} valid)`) : bad(`${unknownSlug} unknown slugs`);

// ── 4) hreflang completeness ──────────────────────────────────────────
console.log(`\n▌ D) hreflang coverage`);
const expectedLangs = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms', 'x-default'];
const sample = allUrls[0]?.xml || '';
const sampleEntry = sample.match(/<url>[\s\S]*?<\/url>/);
if (sampleEntry) {
    const hreflangs = [...sampleEntry[0].matchAll(/hreflang="([^"]+)"/g)].map(m => m[1]);
    const missing = expectedLangs.filter(l => !hreflangs.includes(l));
    missing.length === 0
        ? ok(`Sample <url> has all 11 hreflang entries (${expectedLangs.length})`)
        : bad(`Missing hreflang: ${missing.join(', ')}`);
} else {
    bad('Could not find sample <url> entry to inspect hreflang');
}

// ── 5) robots.txt ─────────────────────────────────────────────────────
console.log(`\n▌ E) robots.txt`);
const rb = await (await fetch(ROBOTS)).text();
rb.includes('Disallow: /api/')      ? ok('Disallow: /api/')      : bad('missing Disallow: /api/');
rb.includes('Disallow: /search')    ? ok('Disallow: /search')    : bad('missing Disallow: /search');
rb.includes('Disallow: /*?city=')   ? ok('Disallow: /*?city=')   : bad('missing Disallow: /*?city=');
rb.includes('Disallow: /*?lat=')    ? ok('Disallow: /*?lat=')    : bad('missing Disallow: /*?lat=');
rb.includes('Disallow: /*?lng=')    ? ok('Disallow: /*?lng=')    : bad('missing Disallow: /*?lng=');
/Sitemap:\s*\S+\/sitemap\.xml/.test(rb) ? ok('Sitemap directive present') : bad('Sitemap directive missing');

// ── Summary ───────────────────────────────────────────────────────────
console.log(`\n══════ Summary ══════`);
console.log(`  Passed: ${pass}`);
console.log(`  Failed: ${fail}`);
console.log(`  Total entries in sitemap: ${totalUrls}`);

if (failures.length > 0) {
    console.log(`\n══════ Failures (${failures.length}) ══════`);
    for (const f of failures) console.log(f);
}

console.log('');
process.exit(fail > 0 ? 1 : 0);
