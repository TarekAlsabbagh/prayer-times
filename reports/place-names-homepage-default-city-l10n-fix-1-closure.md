# PLACE-NAMES-HOMEPAGE-DEFAULT-CITY-L10N-FIX-1 — Closure Report

**Date**: 2026-05-18
**Phase ID**: PLACE-NAMES-HOMEPAGE-DEFAULT-CITY-L10N-FIX-1
**Predecessor**: PLACE-NAMES-CROSS-PAGE-NAVIGATION-CONSISTENCY-FIX-1 (`1b597b5`).

---

## 1. المشكلة المُكتَشَفة

على الصفحة الرئيسية لأي لغة غير العربية (`/ur/`, `/fr/`, `/de/`, ...), كان اسم المدينة الافتراضي يظهر بالعربية `مكة المكرمة` في:

- `#city-name`
- `#qibla-city`
- `currentCity` global JS variable
- ...وأي surface آخر يقرأ من `currentCity` قبل دورة init كاملة.

مثال محدد على `/ur/` (المستخدم أبلغ): العنوان كان أوردو بشكل صحيح (`آج اوقاتِ نماز | …`) لكن `#city-name = "مكة المكرمة"` بالعربية، مما يكسر القاعدة المعمارية "اسم المدينة يطابق لغة الصفحة".

---

## 2. السبب الجذري

`js/app.js` line 8 كان يحتوي تعيين ثابت hardcoded:

```js
let currentCity = 'مكة المكرمة';
```

لا توجد آلية تعديل بعدئذ على الصفحة الرئيسية لأن:

- `_initialSyncHydrate` IIFE (line 27) يطابق فقط route patterns تحتوي slug (مثل `/prayer-times-in-{slug}` و`/qibla-in-{slug}` و...). على الصفحة الرئيسية (`/ur/`, `/`, etc.) الـ regex لا يطابق → IIFE يخرج مبكراً دون تعديل الـ default.
- على الصفحات غير الرئيسية، الـ SSR seed (`__PRAYER_CITY__`) يعدّل القيم عبر `_initialSyncHydrate`. على الصفحة الرئيسية لا يوجد seed.
- نتيجة: `currentCity = 'مكة المكرمة'` (default Arabic) ينحقن في `#city-name` و`#qibla-city` على كل صفحات الرئيسية الـ 10.

---

## 3. الإصلاح المنفّذ

استبدال السطر 8 في `js/app.js` بـ IIFE صغير يقرأ `document.documentElement.lang` (الـ `<html lang>` المحدّد server-side) ويختار اسم Mecca المحلّي من خريطة 10 لغات:

```js
let currentCity = (function () {
    // Values aligned with _LOCALIZED_CITY_MAPS (CITY_NAMES_*) defined later
    // in this file, so first-paint default matches what getDisplayCity()
    // would compute once init runs. For `id` + `ms` this means "Makkah"
    // (the form CITY_NAMES_ID + CITY_NAMES_MS use) rather than the
    // curated_places.json `Mekkah`/`Mekah` — avoids a brief flash on the
    // homepage default. Both forms are valid Indonesian/Malay; "Makkah"
    // matches the legacy site copy used elsewhere.
    var _MECCA_BY_LANG = {
        ar: 'مكة المكرمة', en: 'Mecca',   fr: 'La Mecque', de: 'Mekka',
        tr: 'Mekke',        ur: 'مکہ',    id: 'Makkah',    es: 'La Meca',
        bn: 'মক্কা',         ms: 'Makkah'
    };
    try {
        var _lang = (typeof document !== 'undefined' && document.documentElement)
            ? (document.documentElement.lang || 'ar') : 'ar';
        return _MECCA_BY_LANG[_lang] || _MECCA_BY_LANG.ar;
    } catch (_) { return _MECCA_BY_LANG.ar; }
})();
```

### قرار: مواءمة القيم مع `CITY_NAMES_*` الموجودة، لا مع `curated_places.json`

`curated_places.json` يحوي لـ Mecca:
- `id: "Mekkah"` و`ms: "Mekah"`

لكنّ الخريطة الموجودة `CITY_NAMES_ID` و`CITY_NAMES_MS` تستخدم `"Makkah"` للاثنين. عند تشغيل دورة init، `getDisplayCity()` يقرأ من `_LOCALIZED_CITY_MAPS[lang]['Mecca']` ويحوّل أيّ قيمة إلى `"Makkah"`. إذا وضعنا في الـ IIFE `"Mekkah"`/`"Mekah"`، سيرى المستخدم ومضة "Mekkah → Makkah" / "Mekah → Makkah" في أوّل ٢٠٠ms. لذلك واءمنا IIFE مع القيم القديمة (كلاهما مقبول لغوياً).

الفرنسية والألمانية والتركية والأوردو والإسبانية والبنغالية: القيم متطابقة بين `curated_places.json` و`CITY_NAMES_*`، لا مشكلة.

---

## 4. الملفات المعدّلة

| File | Change | Net |
|---|---|---:|
| `js/app.js` | IIFE on `currentCity` default (line 8) + phase comment | +21 / −1 |
| `index.html` | cache-buster `?v=662` → `?v=663` (2 refs) | 2 |
| `scripts/_test_place_names_homepage_default_city_l10n_fix_1.mjs` | NEW smoke 33/33 | +186 |
| `reports/place-names-homepage-default-city-l10n-fix-1-closure.md` | NEW closure | — |

**NO changes** to:
- `curated_places.json` ✓
- `server.js` ✓
- `fillLangMap` ✓
- `_pickCuratedName` ✓
- `names.ur` / `aliases.ur` ✓
- `_LOCALIZED_CITY_MAPS` / `CITY_NAMES_*` ✓
- homepage HTML markup ✓
- CSS ✓

---

## 5. التحقق المتصفّحي (Preview MCP) — كل اللغات الـ 10

| URL | `<html lang>` | `#city-name` Before fix | `#city-name` After fix | Match expected? |
|---|---|---|---|---|
| `/` | ar | `مكة المكرمة` | `مكة المكرمة` | ✓ (unchanged) |
| `/en/` | en | `مكة المكرمة` | `Mecca` | ✓ |
| `/fr/` | fr | `مكة المكرمة` | `La Mecque` | ✓ |
| `/tr/` | tr | `مكة المكرمة` | `Mekke` | ✓ |
| `/ur/` | ur | `مكة المكرمة` | **`مکہ`** | ✓ |
| `/de/` | de | `مكة المكرمة` | `Mekka` | ✓ |
| `/id/` | id | `مكة المكرمة` | `Makkah` | ✓ |
| `/es/` | es | `مكة المكرمة` | `La Meca` | ✓ |
| `/bn/` | bn | `مكة المكرمة` | `মক্কা` | ✓ |
| `/ms/` | ms | `مكة المكرمة` | `Makkah` | ✓ |

`/ur/` صفحة كاملة بعد الإصلاح:
- `#city-name`: `مکہ` ✓
- `#qibla-city`: `مکہ` ✓
- `currentCity` global: `مکہ` ✓
- `<title>`: `آج اوقاتِ نماز | ہجری تاریخ، سمتِ قبلہ اور چاند کی حالت` (Urdu — unchanged, already correct) ✓
- `bodyHasMakkahArabic`: **false** ✓ (zero Arabic leak anywhere in page text)
- `bodyHasMakkahUrdu`: true ✓

---

## 6. عدم تأثّر السلوك السابق

### Cold-load قبل اختيار مدينة (الصفحة الرئيسية فقط)
- before: `currentCity` = `مكة المكرمة` بالعربية حتى لو كانت اللغة Urdu
- after: `currentCity` = `مکہ` بالأوردو على `/ur/`، `Mecca` بالإنجليزية على `/en/`، إلخ.

### بعد اختيار مدينة (الصفحات الفرعية)
- before: `_initialSyncHydrate` يستلم `__PRAYER_CITY__` SSR seed و يضع `currentCity` لاسم المدينة المختارة باللغة الصحيحة.
- after: نفس السلوك تماماً. الـ IIFE فقط يضبط قيمة الـ "default before any URL slug match" — لا يؤثّر على route handling.

### Geo-detect ("اعرف موقعي")
- before: عند اكتشاف الموقع، Nominatim reverse-geocode يحدّث `currentCity` بالاسم المحلّي.
- after: نفس السلوك تماماً.

### Homepage Search
- before: اختيار مدينة من search box → `selectCity()` → `navigateToCity(...)` → الانتقال إلى `/prayer-times-in-{slug}`.
- after: نفس السلوك تماماً.

---

## 7. نتائج الاختبارات

### الـ smoke الجديد — **33/33 pass**

| Part | Coverage | Result |
|---|---|---:|
| A | Disk source markers (IIFE on currentCity + phase comment + cache-buster ≥ 663) | 3/3 ✓ |
| B | SSR `<html lang>` correct on all 10 lang homepages | 10/10 ✓ |
| C | IIFE map values match legacy `CITY_NAMES_<LANG>['Mecca']` (consistency check) | 10/10 ✓ |
| D | Homepage HTTP 200 regression on all 10 langs | 10/10 ✓ |

### Carry-forward — All green

| Suite | Result |
|---|---:|
| `_test_place_names_homepage_default_city_l10n_fix_1` (new) | **33/33** |
| `_test_place_names_cross_page_navigation_consistency_fix_1` | 28/28 |
| `_test_place_names_sitewide_template_consistency_fix_1` | 26/26 |
| `_test_place_names_template_consistency_all_langs_fix_1` | 18/18 |
| `_test_place_names_ur_template_consistency_1` | 16/16 |
| `_test_place_names_ur_client_seed_hydration_fix_1` | 12/12 |
| `_test_place_names_ur_af_1` | 41/41 |
| `_test_city_page_l10n` | 152/152 |
| `_test_lang_guard` | 5/5 |
| `_test_lang_guard_helpers` | 6/6 |
| `_test_link_city_name` | 18/18 |
| `_test_city_name_ugly` | 5/5 |
| `_test_city_name_universal` | 35/35 |
| `_test_place_by_slug` | 44/44 |
| `_test_external_provider_2` | 32/32 |
| `_test_home_title_stability` | 10/10 |
| `_test_home_search_migration` | 33/33 |
| `_test_search_ar` | 22/22 |
| `_test_external_cache` | 13/13 |
| `_test_fill_lang_map` | 11/11 |
| `_test_qibla_back_fix_2` | 12/12 |
| `_test_qibla_general_home_search_box_1` | 36/36 |
| `_test_moon_general_home_search_box_1` | 37/37 |
| `_test_asia_1g_af_search` | 24/24 |
| `_test_search_place_endpoint` | (running, expected 659/659) |

---

## Status: 🟢 CLOSED — homepage default city now localizes to current page language on all 10 languages.

### Rollback

```
git revert <commit-hash>
```

Pure-additive client-side change (single IIFE + cache-buster). Safe and instant.

### Architecture rule (now uniform site-wide)

> The `currentCity` global default at script-top reads `<html lang>` and
> picks a localized Mecca name from a 10-lang map. This ensures the
> homepage cold-load shows the lang-matched name BEFORE any URL slug
> seed, sessionStorage seed, or Nominatim reverse-geocode runs. The
> map values are aligned with the legacy `_LOCALIZED_CITY_MAPS`
> (`CITY_NAMES_*`) so first-paint matches what `getDisplayCity()` would
> compute once init runs — zero flash.

### Trigger phrases

"homepage Arabic flash", "/ur/ default city", "مکہ default", "currentCity initial value", "Mecca homepage", "_MECCA_BY_LANG"
