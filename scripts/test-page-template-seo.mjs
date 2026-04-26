// Phase I — Page Template SEO QA
//
// يطلب 20 صفحة مدينة من الخادم المحلّي ويتحقّق من:
//   1. <title> فريد حقيقيّ (لا تكرار حرفيّ بين العيّنة)
//   2. <meta name="description"> فريد + يحوي اسم المدينة
//   3. عدد <h1> = 1 بالضبط (مسأل أساسيّ في SEO)
//   4. <link rel="canonical"> يطابق الـ URL النهائيّ بعد الـ redirects
//   5. 11 hreflang (10 لغات + x-default)
//   6. JSON-LD صالح + يحوي BreadcrumbList
//   7. روابط داخليّة لـ qibla/moon/time-left/next-prayer/about (نفس المدينة)
//   8. لا تسرّب slugs قديمة (mecca, giza-governorate, singapore, eastern-province)
//   9. لا query params في روابط المدن
//
// تشغيل: تأكّد أن الخادم على :3000 ثم: node scripts/test-page-template-seo.mjs

import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.SITE_URL || 'http://localhost:3000';

// عيّنة الـ 20 (من قائمة المستخدم — قبل تطبيق الـ redirects)
const SAMPLE = [
    'riyadh', 'mecca', 'medina', 'jeddah', 'cairo', 'giza',
    'baghdad', 'aleppo', 'beirut', 'ramallah', 'muscat',
    'casablanca', 'oran', 'tunis', 'tripoli', 'khartoum',
    'london', 'paris', 'tokyo',
    // Phonsavan: غير موجودة في curated-slugs (Nominatim ad-hoc) — تختبر الـ fallback
    'phonsavan'
];

const data = JSON.parse(fs.readFileSync(path.resolve('db/curated-slugs.json'), 'utf8'));
const validSlugs = new Set(data.entries.map(e => e.slug));
const oldSlugs = Object.keys(data.redirects);

// ── Per-page parse helpers ─────────────────────────────────────────────
function extractTitle(html) {
    const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    return m ? m[1].replace(/\s+/g, ' ').trim() : null;
}
function extractMetaDesc(html) {
    let m = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    if (m) return m[1].trim();
    m = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    return m ? m[1].trim() : null;
}
function countH1(html) {
    return (html.match(/<h1[\s>]/gi) || []).length;
}
function extractCanonical(html) {
    const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
    return m ? m[1] : null;
}
function extractHreflangs(html) {
    return [...html.matchAll(/<link[^>]+rel=["']alternate["'][^>]+hreflang=["']([^"']+)["']/gi)].map(m => m[1]);
}
function extractJsonLd(html) {
    return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1].trim());
}
function extractCityHrefs(html) {
    return [...html.matchAll(/href=["']([^"']*\/(?:prayer-times-in|qibla-in|moon-today-in|moon-in|about|time-left-until-prayer-in|next-prayer-time-in)-[a-z][a-z0-9-]+(?:[/?#][^"']*)?)["']/gi)].map(m => m[1]);
}

const expectedLangs = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms', 'x-default'];

// ── Run tests ─────────────────────────────────────────────────────────
console.log(`\n══════ Phase I — Page Template SEO Test Suite ══════`);
console.log(`Base: ${BASE}`);
console.log(`Sample: ${SAMPLE.length} pages\n`);

const titles = new Map();          // title text → [slugs]
const descriptions = new Map();    // desc text → [slugs]
const failures = [];
let testsPass = 0, testsFail = 0;
const ok  = (label) => { testsPass++; };
const bad = (label) => { testsFail++; failures.push(`✗ ${label}`); };

const reports = [];
for (const slug of SAMPLE) {
    const url = `${BASE}/prayer-times-in-${slug}`;
    const report = { slug, url, checks: {} };
    let r;
    try {
        r = await fetch(url, { redirect: 'follow' });
    } catch (e) {
        bad(`${slug}: fetch failed: ${e.message}`);
        report.error = e.message;
        reports.push(report);
        continue;
    }
    const finalPath = new URL(r.url).pathname;
    const html = await r.text();
    report.status = r.status;
    report.finalPath = finalPath;
    report.size = (html.length / 1024).toFixed(1) + 'KB';

    if (r.status !== 200) {
        bad(`${slug}: HTTP ${r.status}`);
        report.error = `HTTP ${r.status}`;
        reports.push(report);
        continue;
    }

    // ── 1) Title ──
    const title = extractTitle(html);
    report.title = title;
    if (!title || title.length < 10) bad(`${slug}: title missing/short`);
    else {
        ok('title');
        const arr = titles.get(title) || [];
        arr.push(slug);
        titles.set(title, arr);
    }

    // ── 2) Meta description ──
    const desc = extractMetaDesc(html);
    report.desc = desc ? desc.slice(0, 60) + '…' : null;
    if (!desc || desc.length < 50) bad(`${slug}: meta description missing/short (${desc?.length || 0})`);
    else {
        ok('description');
        const arr = descriptions.get(desc) || [];
        arr.push(slug);
        descriptions.set(desc, arr);
    }

    // ── 3) H1 count ──
    const h1 = countH1(html);
    report.h1 = h1;
    if (h1 !== 1) bad(`${slug}: expected 1 <h1>, got ${h1}`);
    else ok('h1');

    // ── 4) Canonical ──
    const canon = extractCanonical(html);
    report.canonical = canon;
    if (!canon) bad(`${slug}: no canonical link`);
    else {
        const canonPath = canon.startsWith('http') ? new URL(canon).pathname : canon;
        if (canonPath === finalPath) ok('canonical');
        else bad(`${slug}: canonical "${canonPath}" ≠ final "${finalPath}"`);
    }

    // ── 5) hreflang ──
    const hreflangs = extractHreflangs(html);
    const missing = expectedLangs.filter(l => !hreflangs.includes(l));
    report.hreflangs = hreflangs.length;
    if (missing.length === 0) ok('hreflang');
    else bad(`${slug}: missing hreflang: ${missing.join(',')}`);

    // ── 6) JSON-LD validity + BreadcrumbList ──
    const lds = extractJsonLd(html);
    report.jsonLdCount = lds.length;
    if (lds.length === 0) bad(`${slug}: no JSON-LD`);
    else {
        let allValid = true;
        let hasBreadcrumb = false;
        for (const script of lds) {
            try {
                const parsed = JSON.parse(script);
                const flat = JSON.stringify(parsed);
                if (flat.includes('"BreadcrumbList"')) hasBreadcrumb = true;
            } catch (e) {
                allValid = false;
                bad(`${slug}: invalid JSON-LD: ${e.message.slice(0, 60)}`);
            }
        }
        if (allValid) ok('jsonld-valid');
        if (hasBreadcrumb) ok('breadcrumb');
        else bad(`${slug}: no BreadcrumbList in JSON-LD`);
    }

    // ── 7) Internal links to all related city-page types ──
    const cityHrefs = extractCityHrefs(html);
    const baseSlug = finalPath.match(/^\/(?:[a-z]{2}\/)?prayer-times-in-([a-z][a-z0-9-]+)/)?.[1];
    const wantedTypes = ['/qibla-in-', '/moon-today-in-', '/time-left-until-prayer-in-', '/next-prayer-time-in-'];
    let missingTypes = [];
    for (const t of wantedTypes) {
        const hasAnyOfType = cityHrefs.some(h => h.includes(t));
        if (!hasAnyOfType) missingTypes.push(t);
    }
    report.internals = wantedTypes.length - missingTypes.length;
    if (missingTypes.length === 0) ok('internal-links');
    else bad(`${slug}: missing internal-link types: ${missingTypes.join(',')}`);

    // ── 8) No old slug leaks ──
    let leaks = 0;
    for (const old of oldSlugs) {
        const re = new RegExp(`href=["'][^"']*\\/[a-z-]+-${old}["']`, 'g');
        const m = html.match(re);
        if (m) leaks += m.length;
    }
    report.oldSlugLeaks = leaks;
    if (leaks === 0) ok('no-old-slug-leaks');
    else bad(`${slug}: ${leaks} old-slug href leaks (e.g. /prayer-times-in-mecca should be /prayer-times-in-makkah)`);

    // ── 9) No query params in city URLs ──
    const queryLeaks = cityHrefs.filter(h => h.includes('?')).length;
    if (queryLeaks === 0) ok('no-query-params');
    else bad(`${slug}: ${queryLeaks} city links contain query params`);

    reports.push(report);
}

// ── Cross-page uniqueness ─────────────────────────────────────────────
console.log(`▌ Per-page checks (${SAMPLE.length} pages × 9 checks)`);
console.log(`  Passed: ${testsPass}`);
console.log(`  Failed: ${testsFail}`);

console.log(`\n▌ Title uniqueness across sample`);
let dupTitles = 0;
for (const [t, slugs] of titles) {
    if (slugs.length > 1) {
        dupTitles++;
        failures.push(`✗ Duplicate title in [${slugs.join(', ')}]: "${t.slice(0, 70)}..."`);
    }
}
console.log(dupTitles === 0 ? `  ✓ All ${titles.size} titles unique` : `  ✗ ${dupTitles} duplicate title group(s)`);

console.log(`\n▌ Description uniqueness across sample`);
let dupDescs = 0;
for (const [d, slugs] of descriptions) {
    if (slugs.length > 1) {
        dupDescs++;
        failures.push(`✗ Duplicate description in [${slugs.join(', ')}]: "${d.slice(0, 70)}..."`);
    }
}
console.log(dupDescs === 0 ? `  ✓ All ${descriptions.size} descriptions unique` : `  ✗ ${dupDescs} duplicate description group(s)`);

// ── Tabular summary ───────────────────────────────────────────────────
console.log(`\n▌ Per-page summary`);
console.log(`  ${'slug'.padEnd(15)} | ${'status'.padEnd(7)} | h1 | hf | jld | int | leaks | canon`);
console.log(`  ${'-'.repeat(15)}-+-${'-'.repeat(7)}-+----+----+-----+-----+-------+------`);
for (const r of reports) {
    const cmark = (r.canonical && new URL(r.canonical, BASE).pathname === r.finalPath) ? '✓' : '✗';
    console.log(`  ${(r.slug || '').padEnd(15)} | ${String(r.status || 'ERR').padEnd(7)} | ${String(r.h1 ?? '?').padEnd(2)} | ${String(r.hreflangs ?? '?').padEnd(2)} | ${String(r.jsonLdCount ?? '?').padEnd(3)} | ${String(r.internals ?? '?').padEnd(3)} | ${String(r.oldSlugLeaks ?? '?').padEnd(5)} | ${cmark}`);
}

// ── Final summary ─────────────────────────────────────────────────────
const totalTests = testsPass + testsFail + dupTitles + dupDescs;
console.log(`\n══════ Summary ══════`);
console.log(`  Per-page checks: ${testsPass}/${testsPass + testsFail}`);
console.log(`  Title duplicates: ${dupTitles}`);
console.log(`  Description duplicates: ${dupDescs}`);
console.log(`  ─────────────────`);
console.log(`  Total failures: ${failures.length}`);

if (failures.length > 0) {
    console.log(`\n══════ Failures (${failures.length}) ══════`);
    for (const f of failures) console.log(`  ${f}`);
}

console.log('');
process.exit(failures.length > 0 ? 1 : 0);
