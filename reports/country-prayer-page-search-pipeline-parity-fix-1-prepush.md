# تقرير ما قبل الدفع: COUNTRY-PRAYER-PAGE-SEARCH-PIPELINE-PARITY-FIX-1

**النوع:** توحيد جذريّ لمنطق البحث في وحدة مشتركة واحدة (`js/site-search.js`) تستخدمها الرئيسية + صندوقا صفحة الدولة، بقيد `countryScope` لصفحة الدولة.
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**النطاق:** 4 ملفّات — `js/site-search.js` (جديد) · `js/app.js` · `index.html` · `prayer-times-cities.html`. **بلا** server.js/css/curated/db/slugs/SEO.

---

## 1) سبب المشكلة المعمارية
كان منطق البحث **مكرَّرًا في 3 أماكن** تصيب كلّها `/api/search-place` لكن بكود منفصل قابل للانجراف: الرئيسية (`_st*` داخل `js/app.js`)، وصندوق الهيرو في صفحة الدولة (`fetchCountrySearchSuggestions`)، وصندوق الشبكة (`_countryFilterDiscovery`). صفحة الدولة **لا تُحمّل `js/app.js`**، فتعذّر إعادة استخدام `_st*`. (تصنيف التدقيق: C + E.)

## 2) كيف تم توحيد البحث
استُخرج منطق `_st*` المعتمد إلى **وحدة مشتركة واحدة `js/site-search.js` = `window.SiteSearch`**، تُحمَّل في **كِلا** `index.html` (قبل `app.js`) و`prayer-times-cities.html`. الآن:
- `app.js` (`_st*`) صار **يفوّض** جوهره إلى `SiteSearch` (الجلب + الفلتر + الرسم + الاختيار + التوجيه) مع إبقاء توصيله القائم.
- صندوقا صفحة الدولة يُنشَآن عبر `SiteSearch.createBox(...)`.
صافي التغيير: **−109 سطرًا** في الملفّات الثلاثة (إزالة تكرار) + الوحدة الجديدة.

## 3) اسم الوحدة المشتركة
**`js/site-search.js`** → `window.SiteSearch` يصدّر: `pickLang` · `langPrefix` · `routeFor` · `isReady` · `esc` · `fetchResults(q,lang)` · `scopeFilter(results, countryScope, existingSlugs)` · `onPick(r,{targetRoute,lang})` · `renderSearchTestDropdown` · **`createBox(opts)`**.

## 4) كيف تستخدمه الصفحة الرئيسية
`app.js` يربط `#loc-hero-search` (+ هابَي moon/qibla) كما قبل، لكنّ الدوالّ الأساسيّة صارت أغلفة رفيعة فوق `SiteSearch`:
- `_stIsPrayerTimesReady → SiteSearch.isReady` · `_stRouteFor → SiteSearch.routeFor` · `_stOnPick → SiteSearch.onPick` · `_stFetch → SiteSearch.fetchResults` · `_stRenderResults → SiteSearch.renderSearchTestDropdown`.
- **بلا countryScope** ⇒ بحث عالميّ (كلّ الدول) — سلوك الرئيسية لم يتغيّر. (الجسم القديم لـ`_stOnPick` مُبقى مُعطَّلًا خلف `_stOnPick_legacyUnused` كأثر مرجعيّ فقط.)

## 5) كيف تستخدمه صفحة الدولة
`prayer-times-cities.html` يُحمّل `site-search.js` ويُنشئ صندوقين عبر `SiteSearch.createBox` (memoized):
- **الشبكة `#country-city-filter`:** فلتر curated محليّ أوّلًا (`onCountryCityFilter`) ⇒ عند 0 ⇒ `_gridSearch().search(q)` يرسم بطاقات `.city-link` في `#cities-container`.
- **الهيرو `#search-input`:** فلتر محليّ ⇒ عند 0 ⇒ `_heroSearch().search(q)` يرسم صفوف `.sugg-item` في dropdown `#cities-suggestions`.
- كلاهما `countryScope = () => countryCode` + `existingSlugs = allCities`. حُذِفت `_countryFilterDiscovery` و`fetchCountrySearchSuggestions` و`_dscBuildItem` و`_dscPickPlace` و`_dscOtherCountryBadge` (مؤكَّد `undefined`).

## 6) كيف يعمل countryScope
في `SiteSearch.scopeFilter`: بعد فلتر `isReady`، إن وُجِد `countryScope` ⇒ **يُبقي فقط** `(r.countryCode||'').toLowerCase() === countryScope`، ثمّ يُسقِط ما في `existingSlugs` (dedup). فنتائج الدول الأخرى **تُسقَط تمامًا** داخل صفحة الدولة. الرئيسيّة تمرّر `countryScope=null` ⇒ تعرض الكلّ.

## 7) حالة hero search (#search-input) قبل/بعد
| | قبل | بعد |
|---|---|---|
| المنطق | `fetchCountrySearchSuggestions` (كود خاصّ) | `SiteSearch.createBox` المشتركة |
| النطاق | **cross-country** (يعرض «دولة أخرى») | **same-country only** (يُسقِط الدول الأخرى) |
| لا نتيجة | «لم نجد… أو عبر البحث العامّ» | «لم نجد مدينة مطابقة داخل هذه الدولة.» |
> **قرارك مُطبَّق:** الهيرو داخل صفحة الدولة صار مقيَّدًا بالدولة، لا عالميًّا.

## 8) حالة grid search (#country-city-filter) قبل/بعد
| | قبل | بعد |
|---|---|---|
| المنطق | `_countryFilterDiscovery` (كود خاصّ) | `SiteSearch.createBox` المشتركة |
| النطاق | same-country (من forward-fix `2240396`) | same-country (نفس الوحدة الآن) |
> النتيجة: الهيرو والشبكة **متطابقان سلوكيًّا** (نفس الجلب/الفلتر/النطاق/رسالة اللانتيجة) — مُثبَت `grid.count === hero.count`.

## 9) اختبار Huraymila (السعودية)
- `/api/search-place?q=حريملاء` (إنتاج) → `huraymila` cc=`sa` (external) — تجده الرئيسية.
- صفحة السعودية (محاكاة بشكل الإنتاج الحقيقيّ على preview): **الشبكة + الهيرو** كلاهما → بطاقة/صفّ واحد «حريملاء · المملكة العربية السعودية · مدينة مكتشَفة» → `/prayer-times-in-huraymila`؛ decoy `cc=ae` **مُسقَط**؛ `parity_sameResults=true`؛ نقر الشبكة → **تنقّل فعليّ** إلى `/prayer-times-in-huraymila`. ✅

## 10) اختبار Essaouira (المغرب)
- `/api/search-place?q=Essaouira` (إنتاج) → `essaouira` cc=`ma`. آليّة العرض **مطابقة لـHuraymila** (same-country discovered) — مُثبَتة عبر نفس مسار الرسم. محليًّا external محجوب؛ يُعاد تأكيد بطاقة المغرب على الإنتاج بعد الدفع. الاستعلام العربيّ «الصويرة» → cc=`iq` ⇒ يُسقَط (راجع 11). ✅ (آليًّا)

## 11) اختبار Dubai داخل السعودية والمغرب (+ الصويرة)
| الصفحة + الاستعلام | cc | الناتج |
|---|---|---|
| saudi + **Dubai** (شبكة) | ae | 0 بطاقة → «لم نجد مدينة مطابقة داخل هذه الدولة.» لا «دولة أخرى» ✅ |
| saudi + **Dubai** (هيرو) | ae | 0 صفّ → نفس الرسالة، لا «دولة أخرى» ✅ |
| saudi + **Jeddah** (شبكة) | (محليّ) | بطاقة `/prayer-times-in-jeddah` ✅ |
| morocco + **Dubai** | ae | 0 → الرسالة ✅ |
| morocco + **الصويرة** | iq | 0 → الرسالة (العراقيّة مُسقَطة) ✅ |
| morocco + **Rabat** | (محليّ) | `/prayer-times-in-rabat` ✅ · مسح → 22 ✅ |

## 12) تأكيد عدم الكتابة في curated/db
✅ `git status`: `db/places/curated-places.json` + `db/cities-{cc}.json` **غير معدَّلة**. الاكتشاف يُحفظ فقط عبر `SiteSearch.onPick` → POST `/api/place-selected` (Supabase `discovered_places`، verified:false) عند النقر — كما كان.

## 13) تأكيد no runtime city translation
✅ الأسماء من الـendpoint مباشرة (`displayName || secondaryName || slug` + `countryName`)؛ slug من الـendpoint؛ لا Nominatim client، لا خرائط أسماء، لا fillchain.

## 14) الملفّات المعدَّلة
| الملفّ | التغيير | الأسطر |
|---|---|---|
| `js/site-search.js` | **جديد** — `window.SiteSearch` (الوحدة المشتركة). | +~270 |
| `js/app.js` | `_st*` تفوّض إلى `SiteSearch` (جلب/فلتر/رسم/اختيار/توجيه) + guard. | 85 سطر متغيّر، صافي ≈ −49 |
| `index.html` | تحميل `site-search.js` قبل `app.js` (preload + script) + بمب `app.js v=773→774`. | +8/−4 |
| `prayer-times-cities.html` | تحميل الوحدة + `onSearch`/`onCountryCityFilter` عبر `createBox` (same-country) + حذف 5 دوالّ مكرَّرة. | 240 سطر، صافي ≈ −109 |
> `git diff --stat` (المتعقَّبة): **3 ملفّات، +112/−221** + الوحدة الجديدة. `node --check` لـsite-search.js و app.js ✓ + فحص inline JS لصفحة الدولة (2 كتلة، 0 خطأ) ✓. **بلا** server.js/css/curated/db.

## 15) نتائج regression (محليّ، preview)
- ✅ **الرئيسية** `/` + جدة → صفّان `search-test-result`، نقر → `onPick{slug:'jeddah',route:'prayer-times'}`.
- ✅ **القمر** `/moon-today` + جدة → صفّان، نقر → `route:'moon-hub'` (`/moon-today-in-jeddah`).
- ✅ **القبلة** `/qibla` + مكة → صفّ، نقر → `route:'qibla-hub'` (`/qibla-in-makkah`).
- ✅ **السعودية:** Jeddah محليّ · Dubai (شبكة+هيرو) → رسالة in-country بلا «دولة أخرى» · حريملاء (شبكة+هيرو) → مكتشَفة، decoy ae مُسقَط، parity · نقر الشبكة → تنقّل.
- ✅ **المغرب:** Rabat محليّ · Dubai/الصويرة → رسالة in-country · مسح → 22.
- ✅ **0 أخطاء console** عبر كلّ الصفحات.

## 16) رسالة commit المقترحة
```
fix(search): COUNTRY-PRAYER-PAGE-SEARCH-PIPELINE-PARITY-FIX-1 — share site search pipeline with country pages
```

---
**الخلاصة:** وحدة بحث واحدة `js/site-search.js` صارت مصدر الحقيقة للرئيسية وصندوقَي صفحة الدولة. الرئيسية عالميّة (بلا تغيير سلوكيّ)؛ صندوقا صفحة الدولة مقيَّدان بالدولة (`countryScope=cc`) ومتطابقان سلوكيًّا — يجدان ما تجده الرئيسية إن طابق الدولة (Huraymila/Essaouira)، ويُسقطان الدول الأخرى (Dubai/الصويرة-iq) برسالة in-country. بلا كتابة curated/db، بلا ترجمة runtime، بلا تغيير SEO/canonical/hreflang/sitemap. (homonym العربيّ «الصويرة→المغرب» = تذكرة خادم منفصلة `SEARCH-PLACE-COUNTRY-SCOPED-DISCOVERY-1`.)

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: COUNTRY-PRAYER-PAGE-SEARCH-PIPELINE-PARITY-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
