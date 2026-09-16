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
// INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1: server.js drops (at boot) every redirect key that is ALSO a live curated slug
//   (db/places/curated-places.json — today only "singapore"): that URL is the canonical city page, not an old slug. Each
//   dropped key is verified LIVE over HTTP below (200, no Location, no noindex); its former target (singapore-city) is an old slug now.
const liveCuratedSlugs = new Set(JSON.parse(fs.readFileSync(path.resolve('db/places/curated-places.json'), 'utf8')).map(p => p.slug));
const droppedRedirects = Object.entries(data.redirects).filter(([k]) => liveCuratedSlugs.has(k));
const oldSlugs = new Set([...Object.keys(data.redirects).filter(k => !liveCuratedSlugs.has(k)), ...droppedRedirects.map(([, to]) => to)]);

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
// SITEMAP-SEMANTIC-PARTITIONING-1: /sitemap.xml now lists the semantic family URL-set files (+ /sitemap-quran.xml) instead of
//   sitemap-main + sitemap-cities-N. The legacy /sitemap-cities-N.xml files are still served (no longer referenced): B/C/D keep
//   reading exactly them (probed until the first non-200), and the index children get the same purity + hreflang checks (C2/D2).
const indexChildren = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const familyChildren = indexChildren.filter(u => /\/sitemap-[a-z]+(?:-[a-z]+)*(?:-[1-9]\d*)?\.xml$/.test(u) && !/\/sitemap-(?:main|cities-\d+)\.xml$/.test(u));
(indexChildren.length > 0 && familyChildren.length === indexChildren.length)
    ? ok(`Index references ${indexChildren.length} semantic family sub-sitemap(s) (no legacy sitemap-main / sitemap-cities-N)`)
    : bad(`Index children are not all semantic family sitemaps: ${indexChildren.filter(u => !familyChildren.includes(u)).slice(0, 5).join(', ') || '(none listed)'}`);

// ── 2) Fetch each sub-sitemap ─────────────────────────────────────────
console.log(`\n▌ B) /sitemap-cities-N.xml content validation`);
let allUrls = [];
const submapUrls = [];
for (let i = 1; i <= 500; i++) {
    const url = `${BASE}/sitemap-cities-${i}.xml`;
    const r = await fetch(url);
    if (r.status !== 200) {
        await r.arrayBuffer().catch(() => {});
        // The list ends at the first 404. Any other status — or a shard served AFTER the gap — means a legacy file broke
        // rather than the list ending, which the old "fail on any listed non-200" check would have caught.
        if (r.status !== 404) bad(`${url} status ${r.status} (expected 200, or 404 at the end of the legacy list)`);
        for (let j = i + 1; j <= i + 3; j++) {
            const rr = await fetch(`${BASE}/sitemap-cities-${j}.xml`);
            await rr.arrayBuffer().catch(() => {});
            if (rr.status === 200) { bad(`/sitemap-cities-${j}.xml is served but /sitemap-cities-${i}.xml returned ${r.status} — gap in the legacy chunk list`); break; }
        }
        break;
    }
    submapUrls.push(url);
    const xml = await r.text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    allUrls.push({ submap: url, xml, urls });
}
submapUrls.length > 0 ? ok(`Legacy server still serves ${submapUrls.length} city sub-sitemap(s) (sitemap-cities-1..${submapUrls.length})`) : bad('Legacy /sitemap-cities-1.xml is not served');
// SITEMAP-SEMANTIC-PARTITIONING-1: every index child except the Quran file (Arabic-only, no hreflang) — no XML kept, only <loc>s + the first <url>
const indexUrls = [];
for (const url of familyChildren.filter(u => !/\/sitemap-quran\.xml$/.test(u))) {
    const r = await fetch(url);
    if (r.status !== 200) { bad(`${url} status ${r.status}`); await r.arrayBuffer().catch(() => {}); continue; }
    const xml = await r.text();
    indexUrls.push({ submap: url, urls: [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]), firstEntry: (xml.match(/<url>[\s\S]*?<\/url>/) || [''])[0] });
}
const totalUrls = allUrls.reduce((n, x) => n + x.urls.length, 0);
ok(`Collected ${totalUrls} <loc> entries across ${allUrls.length} sub-sitemap(s)`);

// ── 3) Validate every URL ─────────────────────────────────────────────
console.log(`\n▌ C) URL canonical-purity checks`);
let badQuery = 0, coordOnly = 0, oldSlugUsed = 0, unknownSlug = 0;
const cityUrlRe = /\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?(?:prayer-times-in|qibla-in|moon-today-in|moon-in|about|time-left-until-next-prayer-in|next-prayer-in)-([a-z][a-z0-9-]+?)(?:\/\d{4}-\d{2}-\d{2})?$/;

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
                    // Country slugs like /prayer-times-in-saudi-arabia don't match curated; skip those.
                    // (Phase D2.1: /about-{city} URLs were removed entirely; the seemsCity guard that
                    //  used to special-case them is no longer needed.)
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
// INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1: a boot-dropped redirect key must really be LIVE (200, no Location, no noindex) —
//   otherwise its sitemap URLs still count as leaked old slugs, exactly as before this ticket.
for (const [k] of droppedRedirects) {
    const r = await fetch(`${BASE}/prayer-times-in-${k}`, { redirect: 'manual' }).catch(() => null);
    const html = (r && r.status === 200) ? await r.text() : '';
    const live = !!r && r.status === 200 && !r.headers.get('location')
        && !/noindex/i.test(r.headers.get('x-robots-tag') || '') && !/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html);
    if (live) continue;
    for (const { urls } of [...allUrls, ...indexUrls]) for (const u of urls) {   // SITEMAP-SEMANTIC-PARTITIONING-1: + index children
        const m = new URL(u).pathname.match(cityUrlRe);
        if (m && m[1] === k) { oldSlugUsed++; failures.push(`  ✗ dropped redirect key "${k}" is not live (status ${r ? r.status : 'fetch failed'}) but in sitemap: ${u}`); }
    }
}
badQuery === 0 ? ok('No URLs contain query strings') : bad(`${badQuery} URLs contain query strings`);
coordOnly === 0 ? ok('No coord-only slugs (loc-NN.Nx-NN.Nx)') : bad(`${coordOnly} coord-only slugs found`);
oldSlugUsed === 0 ? ok('No old/non-canonical slugs (mecca, giza-governorate, etc.)') : bad(`${oldSlugUsed} old slugs leaked`);
unknownSlug === 0 ? ok(`All city slugs map to curated-slugs.json (${validSlugs.size} valid)`) : bad(`${unknownSlug} unknown slugs`);

// ── 3b) SITEMAP-SEMANTIC-PARTITIONING-1: the same purity checks on the index children ──
//   (the curated-slugs.json membership check stays on the legacy city files above: the index children carry exactly those city
//    URLs — asserted below — plus the country pages that sitemap-main always carried and this test never read)
console.log(`\n▌ C2) index children canonical-purity checks`);
let idxQuery = 0, idxCoord = 0, idxOld = 0;
for (const { urls } of indexUrls) {
    for (const u of urls) {
        try {
            if (u.includes('?')) idxQuery++;
            const m = new URL(u).pathname.match(cityUrlRe);
            if (m) {
                if (m[1].startsWith('loc-') && /\d/.test(m[1])) idxCoord++;
                if (oldSlugs.has(m[1])) { idxOld++; failures.push(`  ✗ old slug "${m[1]}" leaked into an index child (should redirect): ${u}`); }
            }
        } catch (e) {}
    }
}
const indexTotal = indexUrls.reduce((n, x) => n + x.urls.length, 0);
indexTotal > 0 ? ok(`Collected ${indexTotal} <loc> entries across ${indexUrls.length} index child(ren) (sitemap-quran excluded)`) : bad('Collected 0 <loc> entries from the index children');
idxQuery === 0 ? ok('Index children: no URLs contain query strings') : bad(`Index children: ${idxQuery} URLs contain query strings`);
idxCoord === 0 ? ok('Index children: no coord-only slugs (loc-NN.Nx-NN.Nx)') : bad(`Index children: ${idxCoord} coord-only slugs found`);
idxOld === 0 ? ok('Index children: no old/non-canonical slugs') : bad(`Index children: ${idxOld} old slugs leaked`);
{
    const indexSet = new Set(indexUrls.flatMap(x => x.urls));
    const notListed = allUrls.flatMap(x => x.urls).filter(u => !indexSet.has(u));
    notListed.length === 0 ? ok(`Every legacy city sub-sitemap <loc> is listed by an index child (${totalUrls})`) : bad(`${notListed.length} legacy city <loc> not listed by any index child, e.g. ${notListed.slice(0, 3).join(', ')}`);
}

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
// SITEMAP-SEMANTIC-PARTITIONING-1: the same hreflang sample on the first <url> of EVERY index child except the Quran file
{
    const noEntry = indexUrls.filter(x => !x.firstEntry).map(x => x.submap);
    const missingByFile = indexUrls.filter(x => x.firstEntry).map(x => [x.submap, expectedLangs.filter(l => ![...x.firstEntry.matchAll(/hreflang="([^"]+)"/g)].some(m => m[1] === l))]).filter(([, miss]) => miss.length);
    (indexUrls.length > 0 && noEntry.length === 0 && missingByFile.length === 0)
        ? ok(`First <url> of each of ${indexUrls.length} index child(ren) has all 11 hreflang entries`)
        : bad(`Index children hreflang sample: no <url> in [${noEntry.join(', ')}], missing ${missingByFile.map(([f, miss]) => f + ':' + miss.join('/')).join(' ; ')}`);
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
console.log(`  Total entries in the index children (sitemap-quran excluded): ${indexTotal}`);   // SITEMAP-SEMANTIC-PARTITIONING-1

if (failures.length > 0) {
    console.log(`\n══════ Failures (${failures.length}) ══════`);
    for (const f of failures) console.log(f);
}

console.log('');
process.exit(fail > 0 ? 1 : 0);
