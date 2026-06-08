# تقرير ما قبل الدفع: COUNTRY-PRAYER-PAGE-PREHYDRATED-CITIES-DATA-FIX-1

**النوع:** حقن بيانات المدن المعتمدة (curated) مسبقًا داخل HTML (الخيار B) — صفحة الدولة + قسم مدن الدولة في صفحة المدينة.
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**النطاق:** 4 ملفّات — `server.js` (حقن SSR) · `prayer-times-cities.html` + `js/app.js` (قراءة client) · `index.html` (cache-buster). **بلا** تغيير curated/css/i18n/canonical/sitemap/`/api/search-place`.

## 1) سبب التنفيذ
كان السطحان (صفحة الدولة + قسم صفحة المدينة) يَجلبان المدن **client-side** عبر `/api/cities` مع **spinner/تأخير**. أصبحت البيانات تُحقَن server-side من curated فتُرسَم **فورًا بلا fetch ولا spinner**.

## 2) أين تم حقن JSON
`server.js`: دالّة `_countryCitiesScriptTag(cc)` تبني `<script type="application/json" id="country-cities-data">…</script>` من `_curatedCitiesForCc(cc)` (نفس helper `/api/cities`، `<`-escaped). تُحقَن قبل `</head>` في:
- **صفحة الدولة** (`seo.countryListing` block): `cc = seo.countryListing.code` → قائمة الدولة كاملة.
- **صفحة المدينة** (بعد `__PRAYER_CITY__`): `cc = _curatedEntry.countryCode` → قائمة دولة المدينة.
> فقط للمدن/الدول المعتمدة (curated). الصفحات غير المدنيّة (`/azkar`،`/qibla`،`/`) **لا تُحقَن** (مؤكَّد).

## 3) كيف يقرأ الـclient البيانات المحقونة
- **صفحة الدولة** (`fetchCities`): يقرأ `#country-cities-data` **أوّلًا** → `allCities = injected` → `renderGrid()` + `injectCitiesItemList()` → `return` (لا fetch).
- **صفحة المدينة** (`updateCountryCitiesSection`): يقرأ `#country-cities-data` **أوّلًا** (قبل requestIdleCallback) → `renderCountryCities(injected, code)` → `return` (لا idle، لا fetch).

## 4) متى يُستخدم fallback `/api/cities`
حين غياب/فراغ `#country-cities-data` أو فشل `JSON.parse` → يكمل المسار القديم (sessionStorage → `/api/cities`). **`/api/cities` يبقى حيًّا fallback** ولـsearch-discovery.

## 5) حالة صفحة الدولة قبل/بعد
| | قبل | بعد |
|---|---|---|
| المصدر | `/api/cities` (runtime) | `#country-cities-data` (SSR، curated) |
| spinner | نعم | **لا** |
| fetch أولي `/api/cities` | نعم | **0 (مؤكَّد)** |
| العرض | بعد الجلب | **فوريّ** |
> **تأكيد حيّ — SA:** 26 بطاقة · «183 منطقة / مدينة» · spinner=false · **apiCitiesCalls=0**.

## 6) حالة قسم مدن الدولة في صفحة المدينة قبل/بعد
| | قبل | بعد |
|---|---|---|
| المصدر | `/api/cities` عبر idle | `#country-cities-data` (SSR) |
| تأخير idle + fetch | نعم | **لا (فوريّ)** |
> **تأكيد حيّ:** ماكاو → بطاقة macau واحدة، **apiCitiesCalls=0** · الرياض → 16 بطاقة (الرياض ضمنها)، **apiCitiesCalls=0**.

## 7) حالة spinner قبل/بعد
صفحة الدولة: spinner «جاري تحميل المدن...» **اختفى** (يُرسَم من المحقون قبل أيّ spinner). قسم المدينة: لا تأخير idle.

## 8) حالة fetch `/api/cities` قبل/بعد
قبل: نداء على كلّ تحميل. بعد: **0 نداء** عند وجود المحقون (مؤكَّد عبر `performance.getEntriesByType('resource')` = صفر `/api/cities` على SA/macau/riyadh). يبقى fallback فقط.

## 9) الأعداد حسب الدول المرجعيّة (من `#country-cities-data` المحقون — مطابقة)
| الصفحة | count محقون | متوقَّع |
|---|---|---|
| SA country | **183** ✅ | 183 |
| bn/IN country | **199** ✅ | 199 |
| ur/PK country | **148** ✅ | 148 |
| id/ID country | **82** ✅ | 82 |
| bn/BD country | **38** ✅ | 38 |
| ms/MY country | **53** ✅ | 53 |
| riyadh city → SA | **183** ✅ | 183 |
| macau city → MO | **1** ✅ | 1 |
| ur/karachi → PK | **148** ✅ | 148 |
| bn/dhaka → BD | **38** ✅ | 38 |

## 10) تأكيد `names[lang] → names.en`
المحقون يحمل كائن `names` الكامل (10–11 لغة) + `nameAr`/`nameEn` من `_curatedCitiesForCc` (نفس عقد `/api/cities`). العرض يطبّق `names[lang]→names.en` كما هو (الـrenderers لم تتغيّر). **لا ترجمة runtime، لا fillchain، لا slug مولَّد** (الـslug من البيانات).

## 11) تأكيد no runtime translation
لا Nominatim/Wikidata/خرائط أسماء عميل في مسار العرض المحقون. الأسماء من curated فقط.

## 12) تأكيد عدم تغيير `/api/search-place`
✅ لم يُمَسّ. البحث المحلّي يُصفّي `allCities` المحقون أوّلًا؛ غير الموجود → `/api/search-place` + countryCode validation + discovered منفصل (SEARCH-DISCOVERY-FIX-1). **تأكيد حيّ:** SA local «Jeddah»→1 (من المحقون)، global «Dubai»→«دولة أخرى».

## 13) تأكيد عدم تغيير SEO/canonical/hreflang/sitemap
✅ لم تُمَسّ. JSON-LD `ItemList` يبقى كما هو (يُحقَن client من البيانات المحقونة بدل API). canonical/hreflang/sitemap/H1/title بلا تغيير.

## 14) الملفّات المعدَّلة
| الملفّ | التغيير | الأسطر |
|---|---|---|
| `server.js` | `_countryCitiesScriptTag` + حقن في صفحتي الدولة (`seo.countryListing.code`) والمدينة (`_curatedEntry.countryCode`). | +27 |
| `prayer-times-cities.html` | `fetchCities` يقرأ `#country-cities-data` أوّلًا (return قبل API). | +17 |
| `js/app.js` | `updateCountryCitiesSection` يقرأ المحقون أوّلًا (قبل idle). | +11 |
| `index.html` | بمب `app.js v=772→773`. | +4/−2 |
> `git diff --stat`: **4 ملفّات، +57/−2**. LF محفوظ. `node --check server.js`+`app.js` ✓ + فحص inline JS لصفحة الدولة ✓. **بلا تغيير** curated/css/i18n.

## 15) نتائج regression (محليّ، preview)
- ✅ `#country-cities-data` محقون بأعداد صحيحة على 6 صفحات دولة + 4 صفحات مدينة · **غائب** على `/azkar`،`/qibla`،`/`.
- ✅ SA country: 26 بطاقة/183، لا spinner، **0 /api/cities**.
- ✅ macau city: بطاقة macau، **0 /api/cities** · riyadh city: 16 (incl. riyadh)، **0 /api/cities**.
- ✅ البحث: local «Jeddah»→1 (محقون)، global «Dubai»→«دولة أخرى» (السياسة محفوظة)، `allCities=183`.
- ✅ **0 أخطاء console**.

## 16) رسالة commit المقترحة
```
fix(country): COUNTRY-PRAYER-PAGE-PREHYDRATED-CITIES-DATA-FIX-1 — prehydrate country cities from curated data
```

---
**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: COUNTRY-PRAYER-PAGE-PREHYDRATED-CITIES-DATA-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
