// Phase J — Pre-Launch Deployment QA
//
// يُجري دفعة شاملة من الفحوصات قبل النشر:
//   1. بناء البيانات: enrich-local-cities + build-curated-sitemap
//   2. تشغيل كلّ السكربتات الخمسة (407 اختبار)
//   3. Smoke tests على /robots.txt و /sitemap.xml
//   4. فحص بروتوكول URLs (يجب أن يطابق SITE_URL):
//        - عند SITE_URL=https://… → كلّ <loc> https://…
//        - عند SITE_URL=http://localhost… → http://…
//   5. اختبار 5 صفحات مدن: title/H1/canonical/hreflang
//   6. اختبار 3 redirects: mecca→makkah، giza-governorate→giza، singapore→singapore-city
//
// تشغيل (مع خادم محلّي):     node scripts/predeploy-check.mjs
// أو ضدّ staging/production: SITE_URL=https://example.com node scripts/predeploy-check.mjs

import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';

const BASE = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const expectedScheme = BASE.startsWith('https://') ? 'https' : 'http';

let totalPass = 0, totalFail = 0;
const failures = [];

function ok(label) { totalPass++; console.log(`  ✓ ${label}`); }
function bad(label) { totalFail++; failures.push(`✗ ${label}`); console.log(`  ✗ ${label}`); }

console.log(`\n══════════════════════════════════════════════════════════════════`);
console.log(`  Phase J — Pre-Launch Deployment QA`);
console.log(`══════════════════════════════════════════════════════════════════`);
console.log(`  SITE_URL: ${BASE}`);
console.log(`  Expected scheme: ${expectedScheme}://\n`);

// ── 1) Build pipeline ─────────────────────────────────────────────────
console.log(`▌ A) Build pipeline`);
try {
    execSync('node scripts/enrich-local-cities.mjs', { stdio: 'pipe' });
    ok('enrich-local-cities.mjs ran successfully');
} catch (e) {
    bad(`enrich-local-cities failed: ${e.message.slice(0, 100)}`);
}
try {
    execSync('node scripts/build-curated-sitemap.mjs', { stdio: 'pipe' });
    ok('build-curated-sitemap.mjs ran successfully');
} catch (e) {
    bad(`build-curated-sitemap failed: ${e.message.slice(0, 100)}`);
}

// Verify generated artifacts
if (fs.existsSync('db/curated-slugs.json')) {
    const data = JSON.parse(fs.readFileSync('db/curated-slugs.json', 'utf8'));
    ok(`curated-slugs.json exists (${data.count} entries, ${data.redirectCount} redirects)`);
} else {
    bad('db/curated-slugs.json missing');
}

// ── 2) Run all 5 test suites ──────────────────────────────────────────
console.log(`\n▌ B) Test suites`);
const suites = [
    'test-smart-search',
    'test-search-routing',
    'test-sitemap-canonical',
    'test-sitemap-output',
    'test-page-template-seo',
];
for (const s of suites) {
    const r = spawnSync('node', [`scripts/${s}.mjs`], { encoding: 'utf8', env: { ...process.env, SITE_URL: BASE } });
    if (r.status === 0) ok(`${s}: PASS`);
    else {
        const last3 = (r.stdout || '').split('\n').slice(-6).join(' / ').slice(0, 100);
        bad(`${s}: FAIL — ${last3}`);
    }
}

// ── 3) robots.txt ─────────────────────────────────────────────────────
console.log(`\n▌ C) robots.txt`);
const robots = await (await fetch(`${BASE}/robots.txt`)).text();
if (robots.includes(`Sitemap: ${BASE}/sitemap.xml`)) ok(`Sitemap directive points to ${BASE}/sitemap.xml`);
else bad(`Sitemap directive wrong (got: ${robots.match(/Sitemap:.*/)?.[0]})`);
if (robots.includes('Disallow: /api/'))    ok('Disallow: /api/');    else bad('Missing Disallow: /api/');
if (robots.includes('Disallow: /search'))  ok('Disallow: /search');  else bad('Missing Disallow: /search');
if (robots.includes('Disallow: /*?city=')) ok('Disallow: /*?city='); else bad('Missing Disallow: /*?city=');

// ── 4) Sitemap protocol consistency ───────────────────────────────────
console.log(`\n▌ D) Sitemap protocol consistency`);
const idxXml = await (await fetch(`${BASE}/sitemap.xml`)).text();
const submapUrls = [...idxXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
let badProto = 0, sample = '';
for (const u of submapUrls) {
    if (!u.startsWith(`${expectedScheme}://`)) { badProto++; sample = u; }
}
badProto === 0
    ? ok(`All ${submapUrls.length} sub-sitemap URLs use ${expectedScheme}://`)
    : bad(`${badProto} sub-sitemap URLs use wrong protocol (sample: ${sample})`);

// Probe one sub-sitemap
if (submapUrls.length > 0) {
    const submapXml = await (await fetch(submapUrls[0])).text();
    const cityUrls = [...submapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    let mixedProto = 0, mixedSample = '';
    for (const u of cityUrls) {
        if (!u.startsWith(`${expectedScheme}://`)) { mixedProto++; mixedSample = u; }
    }
    mixedProto === 0
        ? ok(`All ${cityUrls.length} city URLs use ${expectedScheme}://`)
        : bad(`${mixedProto} city URLs use wrong protocol (sample: ${mixedSample})`);
}

// ── 5) Smoke test 6 sample pages ──────────────────────────────────────
console.log(`\n▌ E) Smoke test (sample pages)`);
const samplePages = [
    '/prayer-times-in-riyadh',
    '/prayer-times-in-makkah',
    '/qibla-in-makkah',
    '/moon-today-in-riyadh',
    '/time-left-until-prayer-in-cairo',
    '/next-prayer-time-in-london',
];
for (const p of samplePages) {
    const r = await fetch(`${BASE}${p}`);
    if (r.status !== 200) { bad(`${p}: HTTP ${r.status}`); continue; }
    const html = await r.text();
    const issues = [];
    const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
    if (h1Count !== 1) issues.push(`H1×${h1Count}`);
    const canon = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1];
    if (!canon) issues.push('no-canonical');
    else if (!canon.startsWith(`${expectedScheme}://`)) issues.push(`canonical-proto-${canon.slice(0, 30)}`);
    const hreflangs = [...html.matchAll(/hreflang=["']([^"']+)["']/g)].map(m => m[1]);
    const wantedLangs = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms', 'x-default'];
    const missingLangs = wantedLangs.filter(l => !hreflangs.includes(l));
    if (missingLangs.length > 0) issues.push(`missing-hreflang:${missingLangs.join(',')}`);
    if (/href=["'][^"']*\?(?:city|lat|lng|q)=/i.test(html)) issues.push('query-params-in-href');

    if (issues.length === 0) ok(`${p}: H1=1, canonical, 11 hreflang, no query-params`);
    else bad(`${p}: ${issues.join(' | ')}`);
}

// ── 6) Redirect tests ─────────────────────────────────────────────────
console.log(`\n▌ F) 301 Redirect tests`);
const redirects = [
    { from: '/prayer-times-in-mecca',           to: '/prayer-times-in-makkah' },
    { from: '/qibla-in-mecca',                  to: '/qibla-in-makkah' },
    { from: '/moon-today-in-mecca',             to: '/moon-today-in-makkah' },
    { from: '/prayer-times-in-giza-governorate',to: '/prayer-times-in-giza' },
    { from: '/prayer-times-in-singapore',       to: '/prayer-times-in-singapore-city' },
    { from: '/en/prayer-times-in-mecca',        to: '/en/prayer-times-in-makkah' },
];
for (const r of redirects) {
    const resp = await fetch(`${BASE}${r.from}`, { redirect: 'manual' }).catch(() => null);
    if (!resp) { bad(`${r.from}: fetch failed`); continue; }
    if (resp.status === 301) {
        const loc = resp.headers.get('location');
        if (loc === r.to || loc === `${BASE}${r.to}`) ok(`${r.from} → ${r.to}`);
        else bad(`${r.from} → ${loc} (expected ${r.to})`);
    } else if (resp.status === 0 || resp.status === 200) {
        // Browsers/some envs hide 301 details; do follow then check final URL
        const followed = await fetch(`${BASE}${r.from}`, { redirect: 'follow' });
        const finalPath = new URL(followed.url).pathname;
        if (finalPath === r.to) ok(`${r.from} → ${r.to} (via follow)`);
        else bad(`${r.from} → final ${finalPath} (expected ${r.to})`);
    } else {
        bad(`${r.from}: HTTP ${resp.status}`);
    }
}

// ── Summary ───────────────────────────────────────────────────────────
console.log(`\n══════════════════════════════════════════════════════════════════`);
console.log(`  Summary`);
console.log(`══════════════════════════════════════════════════════════════════`);
console.log(`  Passed: ${totalPass}`);
console.log(`  Failed: ${totalFail}`);
if (failures.length > 0) {
    console.log(`\n  Failures:`);
    for (const f of failures) console.log(`    ${f}`);
}
console.log('');
process.exit(totalFail > 0 ? 1 : 0);
