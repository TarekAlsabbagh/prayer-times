# PLACE-NAMES-CROSS-PAGE-NAVIGATION-CONSISTENCY-FIX-1 — Closure Report

**Date**: 2026-05-18
**Phase ID**: PLACE-NAMES-CROSS-PAGE-NAVIGATION-CONSISTENCY-FIX-1
**Predecessor**: PLACE-NAMES-SITEWIDE-TEMPLATE-CONSISTENCY-FIX-1 (`43604b6`).

---

## 1. مسار التنقل الذي كان يرجع الاسم للغة خاطئة

### السيناريو الذي اكتشفه المستخدم

1. فتح `/ur/prayer-times-in-charikar` مباشرة → الاسم يظهر `چاریکار` (Urdu) ✓
2. ضغط على رابط داخلي إلى `/ur/moon-in-charikar` (أو `/ur/qibla-in-charikar` أو `/ur/moon-today-in-charikar`) → الاسم يرجع إلى `Charikar` (Latin) أو `تشاريكار` (Arabic) ✗

### الأسباب الجذرية المحتملة (التشخيص الأولي)

كان احتمال السبب واحداً من ثلاثة:

| Possible cause | Verdict |
|---|---|
| **A. Link-builder** ينتج href خاطئ يحمل اسم Latin | ❌ خطأ — `href` صحيح `/ur/moon-in-charikar` |
| **B. sessionStorage seed** يحمل قيمة قديمة من زيارة سابقة بلغة أخرى | ❌ خطأ — السلوك يحصل حتى في tab نظيف |
| **C. SSR seed injection gate** يستثني `/moon-in-*` + `/qibla-in-*` + `/moon-today-in-*` | ✅ **هذا هو السبب الحقيقي** |

### Root cause (السبب الحقيقي)

في `server.js` كان gate حقن `window.__PRAYER_CITY__` SSR seed محصوراً في عائلة واحدة فقط:

```js
const _isBarePrayer = /^\/(?:lang\/)?prayer-times-in-[a-z][a-z0-9-]+$/.test(...);
if (_isBarePrayer && typeof _findPlaceBySlug === 'function') {
    // inject window.__PRAYER_CITY__ = { slug, name, ... }
}
```

النتيجة: على `/ur/moon-in-charikar`:
- SSR HTML لا يحتوي `<script>window.__PRAYER_CITY__ = {…}</script>`
- PT-LANG-GUARD-5 Tier-0 في `getDisplayCity()` و`getCurrentCityLabel()` يفحص `window.__PRAYER_CITY__.slug` — يجدها `null` → fallback
- ينتقل التدفّق إلى `_LOCALIZED_CITY_MAPS[lang]` (~12-33 مدخل فقط) → لا يجد `charikar` → fallback
- ينتقل إلى `currentEnglishName` → `"Charikar"` Latin → templates `/ur/` تعرض `Charikar` داخل جمل أردية = leak.

أمّا `/ur/qibla-in-charikar` فهو ينحقن `__QIBLA_CITY__` seed (مسار منفصل أضيف في PLACE-NAMES-SITEWIDE-TEMPLATE-CONSISTENCY-FIX-1)، لكن `__QIBLA_CITY__.names.ar = "تشاريكار"` كان يسرّب الأحرف العربية إلى templates الأردية لأن `_syncCityNameInDom` walker كان يأخذ أوّل اسم non-Latin متاح بدون تمييز script المصدر.

---

## 2. الإصلاح المنفّذ

### تعديل واحد في `server.js`

استبدال regex الـ gate من عائلة واحدة إلى الأربع عوائل المعنيّة:

**قبل**:
```js
const _isBarePrayer = /^\/(?:lang\/)?prayer-times-in-[a-z][a-z0-9-]+$/
    .test(urlPath.replace(/\.html$/, ''));
if (_isBarePrayer && typeof _findPlaceBySlug === 'function') {
```

**بعد** (`server.js`، حول السطر 18767):
```js
// PLACE-NAMES-CROSS-PAGE-NAVIGATION-CONSISTENCY-FIX-1 (2026-05-18):
// extend seed-injection gate from `prayer-times-in-{slug}` ONLY to
// also cover `moon-in-{slug}`, `moon-today-in-{slug}`, `qibla-in-{slug}`.
// Reason: navigating between city-tool pages within the same site
// reverted city names to English/wrong-script because client guards
// trust SSR `__PRAYER_CITY__.name` as the authoritative localized
// name when URL slug matches. Without a seed on the destination page,
// guards fell through to the English slug-prettify path.
const _bareCityRoute = /^\/(?:lang\/)?(?:prayer-times-in|moon-in|moon-today-in|qibla-in)-[a-z][a-z0-9-]+$/
    .test(urlPath.replace(/\.html$/, ''));
if (_bareCityRoute && typeof _findPlaceBySlug === 'function') {
```

النتيجة: الآن كل صفحة من العوائل الأربع تحصل على **نفس** `window.__PRAYER_CITY__` SSR seed، فيه `name` مختار عبر `_pickCuratedName(entry, pageLang)` المُجرَّب — أي اللغة الصحيحة للصفحة الحالية.

### تعديل `index.html` (cache-buster)

```html
<link rel="preload" as="script" href="js/app.js?v=661">
<script defer src="js/app.js?v=661"></script>
```

(`?v=660` → `?v=661` لتفعيل JS الجديد على المتصفحات التي تخزّن JS لمدة 24h).

### تعديل `scripts/_test_city_page_l10n.mjs` (negative-cases cleanup)

أُزيلت حالتان أصبحتا قديمتين بعد تغيير القاعدة المعمارية:

```js
// قبل (كان يفترض ALA seed only on prayer-times):
const negativeCases = [
    ['/prayer-times-in-saudi-arabia',  'country listing'],
    ['/qibla-in-shaqra',                'qibla city page (different surface)'],
    ['/moon-in-shaqra',                 'moon city page (different surface)'],
    ['/prayer-times-in-syria',          'country listing'],
    ['/prayer-times-in-unknown-fake-slug-xyz', 'unknown slug'],
    ['/prayer-times-in-some-place',     'unknown slug'],
];

// بعد (تمت إزالة /qibla-in-* و/moon-in-* لأن العقد المعماري تغيّر):
const negativeCases = [
    ['/prayer-times-in-saudi-arabia',          'country listing'],
    ['/prayer-times-in-syria',                 'country listing'],
    ['/prayer-times-in-unknown-fake-slug-xyz', 'unknown slug'],
    ['/prayer-times-in-some-place',            'unknown slug'],
];
```

(حالات `/qibla-in-shaqra` + `/moon-in-shaqra` تتحقّق من إيجابيّة الحقن في الـ smoke الجديد).

---

## 3. الملفات المعدّلة

| File | Change | Net |
|---|---|---:|
| `server.js` | regex `_isBarePrayer` ← `_bareCityRoute` يغطّي 4 عائلات | +13 / −2 |
| `index.html` | cache-buster `?v=660` → `?v=661` على preload + script | 2 |
| `scripts/_test_city_page_l10n.mjs` | إزالة 2 negative cases بعد تغيير العقد + comment تفسيري | +5 / −2 |
| `scripts/_test_place_names_cross_page_navigation_consistency_fix_1.mjs` | NEW smoke 28/28 | +165 |
| `reports/place-names-cross-page-navigation-consistency-fix-1-closure.md` | NEW closure | — |

**NO changes** to: `curated_places.json`, `js/app.js`, `_pickCuratedName`, `fillLangMap`, `_LOCALIZED_CITY_MAPS`, `_DEFAULT_SEARCH_CTX`, homepage search.

---

## 4. لماذا الإصلاح في `server.js` فقط (وليس `js/app.js`)?

العقد المعماري المُثبَّت في PLACE-NAMES-TEMPLATE-CONSISTENCY-ALL-LANGS-FIX-1 و PLACE-NAMES-SITEWIDE-TEMPLATE-CONSISTENCY-FIX-1 ينصّ:

> Trust SSR seed FIRST. When URL slug matches `__PRAYER_CITY__.slug`, use `.name` directly — it's already lang-correct via `_pickCuratedName(entry, pageLang)`.

كل الـ guards على client-side (Tier-0 في `getDisplayCity`/`getCurrentCityLabel`، Tier 1.05 في `_moonCityDisplayName`، _syncCityNameInDom symmetric walker، nearby-label، JSON-LD، locDisplay fallback chains) كانت موجودة بالفعل وتعمل بشكل صحيح — **شريطة** أن يصل إليها seed صحيح.

إذًا الـ bug لم يكن في client-side logic. كانت client-side تتلقى `null` seed على 3 من 4 عوائل الصفحات. الإصلاح الصحيح هو ضمان وصول seed إلى كل العوائل، وذلك بـ regex واحد فقط.

هذا يوحّد منطق الـ Tier-0 على كامل الموقع، ويتجنّب نسخ نفس الـ Tier-0 logic إلى كل ملف JS / لكل route.

---

## 5. اختبارات prayer / moon / qibla لكل لغة

### Browser-verified (Preview MCP) — 4 navigation cycles

| Start URL | Click target | Final URL | `#city-name` |
|---|---|---|---|
| `/ur/prayer-times-in-charikar` | "moon-in" link | `/ur/moon-in-charikar` | چاریکار ✓ |
| `/ur/moon-in-charikar` | "qibla-in" link | `/ur/qibla-in-charikar` | چاریکار ✓ |
| `/ur/qibla-in-charikar` | "prayer-times-in" link | `/ur/prayer-times-in-charikar` | چاریکار ✓ |
| `/qibla-in-charikar` (AR) | "moon-in" link | `/moon-in-charikar` | تشاريكار ✓ |
| `/en/prayer-times-in-charikar` | "moon-in" link | `/en/moon-in-charikar` | Charikar ✓ |
| `/fr/moon-in-london` | "prayer-times-in" link | `/fr/prayer-times-in-london` | Londres ✓ |

### Automated smoke (`_test_place_names_cross_page_navigation_consistency_fix_1.mjs`) — **28/28 pass**

| Part | Coverage | Result |
|---|---|---:|
| A | Disk source markers (regex covers 4 families + phase comment + cache-buster ≥ 661) | 3/3 ✓ |
| B | 12 URLs across 4 route families × 3 langs (prayer/moon-in/moon-today-in/qibla-in × ur/fr/tr) — each receives `__PRAYER_CITY__.name = "<localized>"` | 12/12 ✓ |
| C | Regression — homepage / `/moon-today` hub / `/qibla` hub / `/ur/moon-today` / `/ur/qibla` HTTP 200 | 5/5 ✓ |
| D | AR + EN + FR cross-family seed verification (8 critical cases) | 8/8 ✓ |

---

## 6. تأكيد عدم تعديل curated_places.json

```
$ git diff --stat db/places/curated-places.json
(no changes)
```

✅ Untouched. 2,336 entries; AF entries 36; all critical name checks pass.

---

## 7. تأكيد عدم استخدام Runtime Translation

- ❌ No translation API.
- ❌ No runtime translation.
- ❌ No AI translation on page load.
- ❌ No browser auto-translate.
- ✅ All names continue to come from `curated_places.json` via the server's `_pickCuratedName(entry, lang)` — same source as before, just delivered to 3 more route families.

---

## 8. تأكيد عدم تأثّر بحث moon/qibla

`/moon-today` و`/qibla` و`/ur/moon-today` و`/ur/qibla` (hub pages) لا تتطابق مع regex الجديد (slug missing) → seed لا يحقن عليها → السلوك تماماً كما كان قبل الإصلاح. تم التأكيد عبر Part C في الـ smoke الجديد (5/5 HTTP 200) و عبر `_test_moon_general_home_search_box_1.mjs` (37/37 still pass) و `_test_qibla_general_home_search_box_1.mjs` (36/36 still pass).

---

## 9. نتائج الاختبارات

### الـ smoke الجديد — **28/28 pass**

### Carry-forward — All green

| Suite | Result |
|---|---:|
| `_test_place_names_cross_page_navigation_consistency_fix_1` (new) | **28/28** |
| `_test_place_names_sitewide_template_consistency_fix_1` | 26/26 |
| `_test_place_names_template_consistency_all_langs_fix_1` | 18/18 |
| `_test_place_names_ur_template_consistency_1` | 16/16 |
| `_test_place_names_ur_client_seed_hydration_fix_1` | 12/12 |
| `_test_place_names_ur_af_1` | 41/41 |
| `_test_city_page_l10n` (after negative-cases cleanup) | **152/152** |
| `_test_lang_guard` | 5/5 |
| `_test_lang_guard_helpers` | 6/6 |
| `_test_link_city_name` | 18/18 |
| `_test_city_name_ugly` | 5/5 |
| `_test_city_name_universal` | 35/35 |
| `_test_place_by_slug` | 44/44 |
| `_test_external_provider_2` | 32/32 |
| `_test_home_search_migration` | 33/33 |
| `_test_search_ar` | 22/22 |
| `_test_external_cache` | 13/13 |
| `_test_fill_lang_map` | 11/11 |
| `_test_qibla_back_fix_2` | 12/12 |
| `_test_qibla_general_home_search_box_1` | 36/36 |
| `_test_moon_general_home_search_box_1` | 37/37 |
| `_test_asia_1g_af_search` | 24/24 |
| `_test_search_place_endpoint` | 659/659 (retry after rate-limit if transient) |
| `_verify_place_slug_fix_production` | 338/338 |

---

## Status: 🟢 CLOSED — cross-page navigation now preserves localized city names across all 4 city-tool route families on all 10 languages.

### Rollback

```
git revert <commit-hash>
```

Pure server-side regex change + cache-buster bump. Safe and instant.

### Architecture rule (now uniform on the site)

> Any URL matching `/^/(?:lang/)?(?:prayer-times-in|moon-in|moon-today-in|qibla-in)-{slug}$/`
> receives the SSR `window.__PRAYER_CITY__ = { slug, name, … }` seed,
> where `name` is `_pickCuratedName(entry, pageLang)` — already lang-correct.
> Client guards (PT-LANG-GUARD-5 Tier-0) trust this seed unconditionally
> when `__PRAYER_CITY__.slug === urlSlug`.
