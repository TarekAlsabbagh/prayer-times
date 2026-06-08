# تقرير ما قبل الدفع: COUNTRY-PRAYER-PAGE-SEO-CONTENT-FIX-1

**النوع:** إصلاح بنية SEO + محتوى تعليميّ لصفحات `/prayer-times-in-{country}` (10 لغات، SSR) + إصلاح تسريب اسم الدولة الخام.
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**النطاق:** ملفّان — `server.js` (+304/−24) · `prayer-times-cities.html` (+20). **بلا** curated/db-cities/site-search/app.js/css-منفصل/index.html.

---

## 1) سبب المشكلة (بنيويّ، لا «محتوى ضعيف» فقط)
- **H1=0**: `_getActiveH1Marker('/prayer-times-in-*')` كان يُرجِع `#page-h1` لكلّ صفحات prayer-times؛ لكنّ قالب الدولة (`prayer-times-cities.html`) لا يملك `#page-h1`، فكان `_downgradeInactiveH1s` يُنزِّل الهيرو إلى `<h2>` بحثًا عن عنصر غير موجود → **صفر H1**.
- **تسريب اسم خام**: كتلة `cityMatchSsr` كانت تعامل slug الدولة («morocco») كمدينة، فتحقن `_slugToTitle('morocco')`=«Morocco» في الهيرو العربيّ.
- **محتوى ضعيف**: لا أقسام تعليميّة، لا FAQ، لا FAQPage JSON-LD، Title/Meta قصير للدول قصيرة الاسم.

## 2) حالة H1 قبل/بعد
| | قبل | بعد |
|---|---|---|
| كلّ صفحات الدولة (10 لغات) | **H1 = 0** | **H1 = 1** (الهيرو `#loc-hero-title`، مُبقًى عبر marker جديد) |
> الإصلاح: `_getActiveH1Marker` يميّز صفحة الدولة → `loc-hero-title`؛ والكتلة تملؤه بالاسم المترجَم.

## 3) حالة H2/H3 قبل/بعد
| | قبل | بعد |
|---|---|---|
| H2 | 1 | **6** (5 أقسام تعليميّة + قسم FAQ) |
| H3 | 0 | **5** (أسئلة FAQ، كلّ سؤال `<h3>` داخل `<summary>`) |

## 4) Title/Meta قبل/بعد (عيّنة)
| الصفحة | Title قبل | Title بعد | Meta قبل | Meta بعد |
|---|---|---|---|---|
| morocco ar | 43 | **50** | 103 | **155** |
| saudi ar | 61 | **45** | 121 | **173** |
| india bn | 29 | **50** | 84 | **139** |
| pakistan ur | 34 | **51** | 97 | **137** |
| morocco en | — | 53 | — | 165 |
> Title الآن **length-aware** (أساس + لاحقة «أوقات الأذان اليومية» إن اتّسع ≤62)؛ Meta مُثرى (الفجر…العشاء + الأذان + القبلة + الهجري). **ملاحظة شفافة:** أطول أسماء الدول (السعودية) تتجاوز 160 قليلًا في Meta (170–173) — قريبة من النطاق وGoogle يقتطع العرض عند ~160؛ الأغلبية 137–156 داخل النطاق.

## 5) Word count
من **~120** كلمة → **411–554** كلمة مرئيّة (SSR) عبر اللغات — محتوى كافٍ بلا حشو.

## 6) Keyword Consistency
الكلمات موزّعة طبيعيًّا عبر 6 أقسام: مواقيت الصلاة / أوقات الصلاة / مدن {الدولة} / الأذان / الفجر/الظهر/العصر/المغرب/العشاء / القبلة / التاريخ الهجري (وما يقابلها لكلّ لغة). لا تكرار مفرط لعبارة واحدة؛ كلّ قسم يغطّي زاوية مختلفة (كيف تُحسب / اختيار المدينة / اختلاف الأوقات / نصائح / FAQ).

## 7) FAQ + JSON-LD
- 5 أسئلة مرئيّة (`<details>` + `<h3>`) لكلّ صفحة دولة، 10 لغات.
- **FAQPage JSON-LD** مُحقَن في `<head>`، **مُتحقَّق صحّته** (يُحلَّل JSON، 5 أسئلة، يطابق H3 المرئيّة) عبر ar/en/bn/ur/id/ms + SA — **يستخدم الاسم المترجَم بلا تسريب**.

## 8) Localized Country Name Fix (قسم مستقلّ)
1. **سبب «Morocco» في الصفحة العربيّة:** كتلة `cityMatchSsr` تحقن `_slugToTitle(slug)` في `#loc-hero-title`؛ لـslug دولة `_resolveCityName` يُرجِع فارغًا فيتسرّب الـslug اللاتينيّ.
2. **أين استُخدم الاسم المحلّي:** الإصلاح يُبوِّب كتلة `cityMatchSsr` بـ`!seo.countryListing`، وكتلة الدولة تملأ H1/الـspan/المحتوى/FAQ/JSON-LD بـ`cn = seo.countryListing.name` = `_countryNameForLang(cc, lang)` (مترجَم؛ ar→المغرب). الاسم يأتي من مصدر موحَّد `countryName[lang]→en`.
3. **قبل/بعد:** `Morocco → المغرب` · `Saudi Arabia → المملكة العربية السعودية` · `India → ভারত` · `Pakistan → پاکستان`.
4. **اللغات المُختبَرة:** ar/en/bn/ur/id/ms + ميتا/H1/FAQ — `rawLeak=false` و`usesLocalizedName=true` في كلّها.
5. **بلا تغيير** slugs أو countryCodes.
6. **بلا تغيير** بيانات المدن أو البحث.

## 9) اختبارات (عيّنة كافية على 9 صفحات دول)
| الصفحة | H1 | H2 | H3 | Title | Meta | FAQ JSON-LD | words | cities | rawLeak |
|---|---|---|---|---|---|---|---|---|---|
| morocco ar | 1 | 6 | 5 | 50 | 155 | 5Q ✅ | 429 | 23 | false |
| morocco en | 1 | 6 | 5 | 53 | 165 | 5Q ✅ | 528 | 23 | n/a |
| saudi ar | 1 | 6 | 5 | 45 | 173 | 5Q ✅ | 459 | 184 | false |
| saudi en | 1 | 6 | 5 | 58 | 170 | 5Q ✅ | 544 | 184 | n/a |
| india bn | 1 | 6 | 5 | 50 | 139 | 5Q ✅ | 411 | 199 | false |
| pakistan ur | 1 | 6 | 5 | 51 | 137 | 5Q ✅ | 554 | 148 | false |
| indonesia id | 1 | 6 | 5 | 56 | 156 | 5Q ✅ | 441 | 82 | n/a |
| bangladesh bn | 1 | 6 | 5 | 54 | 143 | 5Q ✅ | 411 | 38 | n/a |
| malaysia ms | 1 | 6 | 5 | 57 | 155 | 5Q ✅ | 439 | 53 | n/a |
> DOM حيّ (morocco): الهيرو `<h1>`=«مواقيت الصلاة في مدن المغرب»، seoH2=6، seoH3=5، 5 FAQ details، gridCards=23، allCities=23، **0 أخطاء console**.

## 10) تأكيد عدم تغيير المدن والبحث
✅ شبكة المدن تُرسَم (23/184…)، البحث (site-search) يعمل كما هو — لم تُمَسّ `js/site-search.js` ولا منطق البحث ولا `onSearch`/`onCountryCityFilter`.

## 11) تأكيد عدم تغيير curated
✅ `git status`: `curated-places.json` + `db/cities-*.json` **غير معدَّلة**.

## 12) تأكيد slugs/canonical/hreflang
✅ slugs بلا تغيير. canonical/hreflang **منطقهما** بلا تغيير (الصفحة تبقى index بـ11 hreflang). التغيير الوحيد المرتبط بالعرض = **H1 marker** (إصلاح خلل H1=0 موثَّق) — لم يُغيَّر canonical/hreflang.

## 13) تأكيد prehydrated cities + discovered noindex
✅ **prehydration** `#country-cities-data` بلا مساس (الأعداد 23/184/199/148/82/38/53 كما هي). ✅ **discovered noindex** يعمل (`/prayer-times-in-chefchaouen-ma` = noindex، H1=1)؛ مدن curated (riyadh/macau) = index، H1=1؛ صفحات الدولة = index، H1=1.

## 14) regression + الملفّات + commit
- **regression:** `/` · `/qibla` · `/moon-today` · `/azkar` · `/date-converter` · `/zakat-calculator` · `/next-prayer-in-riyadh` · `/prayer-times-in-riyadh` (مدينة) · `/prayer-times-in-macau` → جميعها **H1=1 · index · 200**. (`/msbaha` H1=19 **مسبق** وغير مرتبط — `/msbaha` غير مُسجَّل في `_getActiveH1Marker`؛ تغييري لمس فرع `/prayer-times-in-` فقط.) **0 أخطاء console.** `node --check server.js` ✓ + فحص inline JS لصفحة الدولة (0 أخطاء).
- **الملفّات:** `server.js` (+304/−24: marker + leak-gate + hero/span fill + `_COUNTRY_SEO_L10N` 10 لغات + builder + FAQPage JSON-LD + Title/Meta length-aware) · `prayer-times-cities.html` (+20: placeholder `#country-seo-content` + CSS داخليّ `.country-seo-*`). الصفحة no-cache فلا cache-buster.
- **رسالة commit المقترحة:**
```
fix(country): COUNTRY-PRAYER-PAGE-SEO-CONTENT-FIX-1 — improve country prayer pages SEO structure and content
```

---
**الخلاصة:** صفحات الدولة أصبحت **H1=1** (الهيرو، باسم الدولة المترجَم — بلا تسريب «Morocco»)، **H2=6 · H3=5**، Title/Meta أطول وأغنى، محتوى تعليميّ SSR (6 أقسام، 411–554 كلمة، 10 لغات)، **FAQ + FAQPage JSON-LD** صحيح ومترجَم. المدن والبحث وprehydration وdiscovered-noindex وcurated وslugs بلا مساس.

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: COUNTRY-PRAYER-PAGE-SEO-CONTENT-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
