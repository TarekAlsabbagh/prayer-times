// Phase G — يولّد db/curated-slugs.json من LOCAL_CITIES + LOCAL_PROVINCES
//
// المخرجات:
//   {
//     generatedAt: ISO,
//     count: N,
//     entries: [
//       { slug, oldSlugs: ['mecca'], en, ar, cc, countryEn, type, lat, lng, priority }
//     ],
//     redirects: { 'mecca': 'makkah', 'giza-governorate': 'giza', ... }
//   }
//
// يُستخدم من قِبل server.js لـ:
//   - 301 redirect من old slug إلى canonical
//   - canonical link بالاعتماد على slug القياسيّ
//   - sitemap augmentation (المرحلة الحاليّة: للتوثيق فقط)
//
// تشغيل: node scripts/build-curated-sitemap.mjs

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const ROOT = path.resolve('.');
const APP_JS = path.join(ROOT, 'js/app.js');
const OUT = path.join(ROOT, 'db/curated-slugs.json');

const src = fs.readFileSync(APP_JS, 'utf8');

// ── helpers ────────────────────────────────────────────────────────────
function extractArray(name) {
    const startRe = new RegExp(`const\\s+${name}\\s*=\\s*\\[`);
    const m = startRe.exec(src);
    if (!m) throw new Error(`${name} not found`);
    let i = m.index + m[0].length, depth = 1;
    while (i < src.length && depth > 0) {
        const ch = src[i];
        if (ch === '[') depth++;
        else if (ch === ']') { depth--; if (depth === 0) break; }
        i++;
    }
    return src.slice(m.index, i + 1) + ';';
}

function extractFunc(name) {
    const startRe = new RegExp(`function\\s+${name}\\s*\\(`);
    const m = startRe.exec(src);
    if (!m) throw new Error(`function ${name} not found`);
    let i = src.indexOf('{', m.index) + 1, depth = 1;
    while (i < src.length && depth > 0) {
        const ch = src[i];
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) break; }
        i++;
    }
    return src.slice(m.index, i + 1);
}

// ── Build sandbox with the routing API ────────────────────────────────
const sandboxCode = [
    extractFunc('makeSlug'),
    `const _ROUTING_ADMIN_SUFFIX_RE = /\\s+(Governorate|Province|Region|State|Emirate|Municipality|District|County)$/i;`,
    extractFunc('_routingBaseSlug'),
    `let _routingSlugIndex = null;`,
    extractFunc('_buildRoutingIndex'),
    extractFunc('_isRoutingSlugConflict'),
    extractFunc('buildPrayerTimesSlug'),
    extractArray('LOCAL_CITIES'),
    extractArray('LOCAL_PROVINCES'),
].join('\n\n');

const ctx = { console };
vm.createContext(ctx);
vm.runInContext(sandboxCode + '\nthis.__api = { buildPrayerTimesSlug, _routingBaseSlug, LOCAL_CITIES, LOCAL_PROVINCES };', ctx);
const { buildPrayerTimesSlug, _routingBaseSlug, LOCAL_CITIES, LOCAL_PROVINCES } = ctx.__api;

// ── Generate entries + redirects ──────────────────────────────────────
const entries = [];
const redirects = {};
const all = LOCAL_CITIES.concat(LOCAL_PROVINCES);

for (const item of all) {
    const slug = buildPrayerTimesSlug(item);
    if (!slug) continue;

    // اكتشف الـ slugs القديمة التي يجب أن تُحوَّل (301) إلى الـ canonical
    const oldSlugs = [];
    // 1) لو يوجد slug override صريح، فإنّ الـ baseSlug من en هو slug قديم
    if (item.slug && item.slug !== _routingBaseSlug(item.en)) {
        const bareEn = _routingBaseSlug(item.en);
        if (bareEn && bareEn !== slug) oldSlugs.push(bareEn);
    }
    // 2) لو الاسم يحوي لاحقة إداريّة (Giza Governorate)، فالـ slug-with-suffix قديم
    //    (مثلًا: 'giza-governorate' → canonical 'giza')
    const fullSlugified = (item.en || '').toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (fullSlugified && fullSlugified !== slug) oldSlugs.push(fullSlugified);

    entries.push({
        slug,
        oldSlugs: [...new Set(oldSlugs)],
        en: item.en,
        ar: item.ar,
        cc: (item.cc || '').toLowerCase(),
        countryEn: item.countryEn || '',
        country: item.country || '',
        type: item.type || 'city',
        lat: item.lat,
        lng: item.lng,
        priority: Number.isFinite(item.priority) ? item.priority : 50,
    });

    for (const old of oldSlugs) {
        // Avoid overwriting an existing redirect target with a different one
        if (redirects[old] && redirects[old] !== slug) {
            console.warn(`⚠ redirect conflict: "${old}" → "${redirects[old]}" vs "${slug}"`);
            continue;
        }
        redirects[old] = slug;
    }
}

// ── Dedup by canonical slug — keep highest-priority entry ─────────────
// (مثلًا: Riyadh city + Riyadh Region كلاهما → 'riyadh'؛ نُبقي City لأنّها priority=100)
// المحافظات/المناطق بنفس الإحداثيّات تخدم نفس URL — لا تكرار في sitemap.
const bySlug = new Map();
let dedupRemoved = 0;
for (const e of entries) {
    const existing = bySlug.get(e.slug);
    if (!existing) { bySlug.set(e.slug, e); continue; }
    if (e.priority > existing.priority) {
        // الجديد أولى — استبدل، لكن دمج oldSlugs
        e.oldSlugs = [...new Set([...e.oldSlugs, ...existing.oldSlugs])];
        bySlug.set(e.slug, e);
    } else {
        // القديم أولى — ضمّ oldSlugs الجديدة فيه
        existing.oldSlugs = [...new Set([...existing.oldSlugs, ...e.oldSlugs])];
    }
    dedupRemoved++;
}
const finalEntries = [...bySlug.values()];
const dupes = [];   // بعد الـ dedup يجب أن تكون فارغة
const slugCounts2 = new Map();
for (const e of finalEntries) slugCounts2.set(e.slug, (slugCounts2.get(e.slug) || 0) + 1);
for (const [s, n] of slugCounts2) if (n > 1) dupes.push([s, n]);
if (dupes.length) {
    console.warn(`⚠ ${dupes.length} duplicate canonical slug(s) AFTER dedup:`);
    for (const [s, n] of dupes) console.warn(`    "${s}" used ${n}× — bug?`);
}

// ── Write output ──────────────────────────────────────────────────────
const output = {
    generatedAt: new Date().toISOString(),
    count: finalEntries.length,
    citiesCount: LOCAL_CITIES.length,
    provincesCount: LOCAL_PROVINCES.length,
    dedupedCount: dedupRemoved,
    redirectCount: Object.keys(redirects).length,
    entries: finalEntries,
    redirects,
};
fs.writeFileSync(OUT, JSON.stringify(output, null, 2));

// ── Summary ───────────────────────────────────────────────────────────
console.log(`✓ Wrote ${OUT}`);
console.log(`  Total entries (after dedup): ${finalEntries.length}`);
console.log(`  Cities:                      ${LOCAL_CITIES.length}`);
console.log(`  Provinces:                   ${LOCAL_PROVINCES.length}`);
console.log(`  Deduped same-slug pairs:     ${dedupRemoved}`);
console.log(`  Old → new redirects:         ${Object.keys(redirects).length}`);
console.log(`  Duplicate canonical slugs:   ${dupes.length}`);
if (Object.keys(redirects).length > 0) {
    console.log(`\n  Sample redirects:`);
    for (const [old, neu] of Object.entries(redirects).slice(0, 10)) {
        console.log(`    /prayer-times-in-${old}  →  /prayer-times-in-${neu}`);
    }
}
