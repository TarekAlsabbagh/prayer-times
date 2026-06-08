# تقرير ما قبل الدفع: COUNTRY-PRAYER-PAGE-CITY-SECTION-SEARCH-DISCOVERY-FIX-1

**النوع:** مواءمة بحث صفحة الدولة مع سياسة البحث العامّة + قسم مدن الدولة في صفحة المدينة (A + B).
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**النطاق:** 3 ملفّات فقط — `js/app.js` (Part B) · `prayer-times-cities.html` (Part A) · `index.html` (cache-buster). **بلا** تغيير curated / server.js / js/i18n.js / css.

---

## 1) آلية البحث العامّة الحاليّة
`GET /api/search-place?q=&lang=` بثلاث طبقات: **Curated** (ذاكرة) → **Discovered** (Supabase `discovered_places`) → **External** (Nominatim/LocationIQ + cache). الشكل الموحَّد يحوي `slug, countryCode, displayName, names, lat, lng, timezone, source, nameQuality`. الواجهة العامّة (الرئيسيّة/القمر/القبلة) في `js/app.js` (`_stFetch`/`_stOnPick`).

## 2) سياسة الإضافة المعتمدة: discovered + رابط، بلا كتابة curated
- `curated-places.json` **لا يُكتَب وقت التشغيل أبدًا** (يدويّ عبر apply scripts + commit).
- الاكتشاف يُسجَّل في Supabase `discovered_places` عبر **`POST /api/place-selected`** (`verified:false`, upsert بـ`(slug,country_code)`). إن `!_SUPABASE_ENABLED` يُقرّ دون حفظ.
- 🔎 **اكتشاف تدقيق حرج:** صفحة الدولة كانت بها بحث (`#search-input`/`onSearch`) يستدعي `fetchNominatimSuggestions` الذي يضرب **Nominatim مباشرةً** (لا `/api/search-place`)، يستعمل **أسماء OSM وقت التشغيل** (`nd['name:ar']`/`place.name`)، يولّد slug بـ`makeSlug`، **ويكتب آليًّا** المدينة الجديدة إلى `db/cities-{cc}.json` عبر `saveToDb`→`/api/cities/add`. هذا يخالف سياسة الموقع تمامًا — وهو ما عالجناه.

## 3) منطق البحث المحلي (Part A — صفحة الدولة)
`onSearch` (`#search-input`): فلتر محليّ فوريّ على `allCities` (curated الدولة) عبر `nameAr`/`nameEn` → `renderGrid`. عند وجود نتائج محليّة تُعرَض فقط (بلا أيّ API). **بلا تغيير.**

## 4) منطق البحث الموسّع (Part A)
عند **0 نتائج محليّة** و`q.length≥2` (بعد 300ms): **`fetchCountrySearchSuggestions(q)`** (بديل `fetchNominatimSuggestions`) →
`fetch('/api/search-place?q=&lang=')` (طبقات الموقع: curated→discovered→external) → فلترة `_isPrayerTimesReady`-style + **dedup** ضدّ `allCities` (by slug) → تقسيم **countryCode validation**:
- `same` = `countryCode === currentCountryCode` → بطاقات «مدينة مكتشَفة» (badge مترجَم).
- `other` = خلاف ذلك → بطاقات بـ`sugg-item--other` + badge «دولة أخرى» (لا تُدمَج في شبكة الدولة).
- لا أيّ منهما → رسالة «لم نجد مدينة مطابقة...» المترجَمة.
يُعاد استخدام dropdown `#cities-suggestions` + CSS `.sugg-*` القائمة (لا CSS جديد). الرسائل inline بـ10 لغات (نمط الصفحة القائم — لا مفاتيح i18n جديدة).

## 5) countryCode validation
`r.countryCode.toLowerCase() === countryCode` (cc الصفحة). نتائج نفس الدولة فقط تُعرَض كـ«مكتشَفة»؛ غيرها تُعرَض بوضوح كـ«دولة أخرى» ولا تُضاف. **تأكيد حيّ:** بحث «Dubai» على `/prayer-times-in-saudi-arabia` → نتيجتان كلاهما `sugg-item--other` («دبي · الإمارات · دولة أخرى») — **لم تُدمَج في السعودية**.

## 6) منع التكرار (duplicate prevention)
`const existing = new Set(allCities.map(c=>c.slug.toLowerCase()))` ثمّ `!existing.has(r.slug)` — أيّ نتيجة slug موجود في curated الدولة تُسقَط (تظهر محليًّا أصلًا).

## 7) فصل discovered عن curated
نتائج البحث الموسّع تظهر في dropdown `#cities-suggestions` كـ**اقتراحات منفصلة** (badge «مدينة مكتشَفة»)، **لا** داخل شبكة `#cities-grid` المعتمدة. النقر → `/api/place-selected` (discovered) + seed session + انتقال إلى `/[lang]/prayer-times-in-{slug}`. **لا كتابة curated، لا `saveToDb`، لا `db/cities-*.json`.**

## 8) حالة البحث عن مدينة من دولة خاطئة
`/prayer-times-in-saudi-arabia` + «Dubai» (cc=ae): تُعرَض كـ«دولة أخرى» (لا تُضاف للسعودية)، والنقر يفتح صفحتها الصحيحة `/prayer-times-in-dubai`. **مؤكَّد حيّ** (نتيجتان، كلاهما `--other`).

## 9) حالة ماكاو قبل/بعد (Part B — صفحة المدينة)
| | قبل | بعد |
|---|---|---|
| `/prayer-times-in-macau` قسم مدن الدولة | كان يُظهر **empty-state** (المدينة الوحيدة = الحاليّة تُستبعَد) | يُظهر **بطاقة ماكاو** (cardCount=1، href=`/prayer-times-in-macau`، عنوان «مواقيت الصلاة في مدن ماكاو»)، **بلا empty-state، بلا spinner** ✅ |
> البحث عن «Macau» يأتي من curated مباشرةً (فلتر محليّ)، لا discovered.

## 10) حالة قسم مدن الدولة في صفحة المدينة (Part B)
`renderCountryCities`: استُبدِل استبعاد المدينة الحاليّة بـ`displayCities = cities` (كلّ curated **بما فيها الحاليّة**). empty-state/إخفاء فقط حين `cities.length===0`. **تأكيد حيّ — الرياض:** 16 بطاقة، **الرياض ضمنها** (البطاقة الأولى `/prayer-times-in-riyadh`)، عنوان «مواقيت الصلاة في مدن المملكة العربية السعودية». (نَسخ سلوك single-city: رسالة `single_city_note` لم تَعُد تُعرَض — المفتاح/الـCSS باقيان دون استعمال، غير ضارّين.)

## 11) تأكيد no runtime city translation
أسماء النتائج تُعرَض من `r.displayName`/`r.names` المبنيّة server-side وفق `names[lang]→names.en` — **لا ترجمة client، لا fillchain، لا slug مولَّد** (نستعمل `r.slug` من الـendpoint). أُزيلت أسماء OSM وقت التشغيل (`nd['name:ar']`/`place.name`) و`makeSlug`-للنتائج نهائيًّا.

## 12) تأكيد عدم تغيير curated/canonical/hreflang/sitemap
✅ **لم يُمَسّ** `curated-places.json` · لا slugs · لا canonical/hreflang/sitemap · لا `server.js` · لا تصنيف ماكاو · لا `/api/cities` ولا مصدر شبكة المدن. الإصلاح: منطق بحث client + منطق عرض قسم + cache-buster.

## 13) الملفّات المعدَّلة
| الملفّ | التغيير | الأسطر |
|---|---|---|
| `prayer-times-cities.html` | استبدال `fetchNominatimSuggestions` بـ`fetchCountrySearchSuggestions` (/api/search-place + countryCode + dedup + place-selected + رسائل inline 10 لغات) + تحديث المُستدعي. | ≈+238/−128 |
| `js/app.js` | `renderCountryCities`: عرض كلّ curated incl. الحاليّة (Part B). | ≈+18/−35 |
| `index.html` | بمب `app.js v=771→772`. | +2/−2 |
> `git status`: **3 ملفّات متتبَّعة فقط**. LF محفوظ. `node --check js/app.js` ✓ + فحص inline JS لصفحة الدولة ✓.

## 14) نتائج regression (محليّ، preview)
- ✅ **ماكاو (Part B)**: 1 بطاقة (macau)، بلا empty-state.
- ✅ **الرياض (Part B)**: 16 بطاقة، الرياض ضمنها.
- ✅ **Part A دولة خاطئة**: «Dubai» على SA → نتيجتان `--other` «دولة أخرى»، لا دمج.
- ✅ **Part A لا نتيجة**: «zzqx…» → «لم نجد مدينة مطابقة داخل هذه الدولة أو عبر البحث العامّ.»
- ✅ **Part A محلّي-أوّلًا**: «Umluj/Tabuk» (curated) → فلتر محليّ، لا fallback، لا اقتراحات.
- ✅ **0 أخطاء console** على كلّ ما سبق.
- ⚠️ **ملاحظة بيئة:** طبقة External (Nominatim) **محجوبة شبكيًّا في بيئة العمل المحليّة** (`status=error`)، فمسار «same-country discovered» الحيّ يحتاج الإنتاج (حيث يعمل Nominatim). لكنّه **مطابق بالكود** لمسار «دولة أخرى» المُثبَت (نفس fetch→countryCode-filter→`_dscBuildItem`→badge، يختلف فقط في مصفوفة `same` ونصّ الـbadge) ⇒ سيظهر على الإنتاج.

## 15) رسالة commit المقترحة
```
fix(country): COUNTRY-PRAYER-PAGE-CITY-SECTION-SEARCH-DISCOVERY-FIX-1 — align country city sections and search with curated + discovered policy
```

---
**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: COUNTRY-PRAYER-PAGE-CITY-SECTION-SEARCH-DISCOVERY-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
