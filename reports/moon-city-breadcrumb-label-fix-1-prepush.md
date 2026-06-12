# تقرير ما قبل الدفع: MOON-CITY-BREADCRUMB-LABEL-FIX-1

**النوع:** إصلاح تسمية breadcrumb لصفحات القمر — عنصر المدينة يحمل الآن «القمر في {city}» (بدل اسم المدينة المجرّد على الـhub)، مع توحيد SSR + العميل دون الاعتماد على hydration.
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**القاعدة:** `origin/main = HEAD = baa125c`. (PROMOTE-BATCH-1 يبقى مُعلَّقًا غير مُلتزَم — معزول، لا تُمَسّ ملفّاته.)
**القرارات المعتمدة:** (1) إعادة استخدام المفتاح القائم `moon.bc_moon_in_city_nodate` بلا تعديل صياغات i18n. (2) النطاق: hub + شهر + يوم + today، breadcrumb + JSON-LD فقط، بتطابق SSR↔client.

---

## 1) سبب المشكلة
على صفحة الـhub `/moon-in-{city}`، عنصر المدينة (آخر عنصر) كان يُعرَض **مجرّدًا «{city}»** بقرار سابق `UAT-Moon-City-Hub-Polish` في طبقتين: `app.js:22112` (`_isHubBC ? _cityNameBC : …`) و`server.js:10315` (`name: cityDisplay`). المفتاح القائم «القمر في {city}» كان يُستخدَم في الشهر/اليوم فقط.

## 2) الملفّات المعدَّلة
| الملفّ | التغيير |
|---|---|
| `server.js` | +12/−2 — السطر ~10315: عنصر المدينة يستخدم قالب «القمر في {city}» (hub/شهر/يوم) أو «القمر اليوم في {city}» (today)، عبر قاموسين يُماثلان المفتاحين. يُصلح SSR + JSON-LD معًا |
| `js/app.js` | +11/−5 — (أ) السطر ~22112: فرع الـhub يستخدم `_buildMoonCityText(_cityNameBC, true)` (= nodate) بدل المجرّد؛ (ب) السطر ~22047: `_skipTodayBC = _isDatePage || _isMonthUrl` (رابط المدينة الأبويّ على الصفحة المؤرَّخة دائمًا nodate، فيطابق SSR حتى لو كان تاريخ الـURL = اليوم) |
| `index.html` | +2/−2 — cache-buster `app.js?v=775→777` |
> **لم يُمَسّ:** `js/i18n.js` (لا تعديل صياغات) · curated-places.json · حسابات/بيانات القمر · canonical/hreflang/sitemap · Title/Meta/H1 · الصلاة/القبلة/الأذكار/المسبحة · search. تأكيد: 0 علامات Palestine/homonym/PROMOTE في الـdiff.

## 3) كيف استُخدم `moon.bc_moon_in_city_nodate`
- **العميل:** `_buildMoonCityText(cityName, /*skipToday*/ true)` يقرأ المفتاح عبر `t('moon.bc_moon_in_city_nodate')` ويستبدل `{city}`.
- **الخادم (SSR):** قاموس `_moonBcNodate` **يُماثل قيم المفتاح حرفيًّا** بكل اللغات العشر (وقاموس `_moonBcToday` يُماثل `moon.bc_moon_in_city` لصفحة today) — لأنّ server.js يبني breadcrumb بقواميس مُرمَّزة لا يقرأ i18n. **لا صياغة جديدة.**

## 4) نتيجة `/moon-in-riyadh` قبل/بعد
| | قبل | بعد |
|---|---|---|
| ar (مرئيّ = JSON-LD) | الرئيسية › حالة القمر › **الرياض** | الرئيسية › حالة القمر › **القمر في الرياض** ✓ |
| en | Home › Moon › **Riyadh** | Home › Moon › **Moon in Riyadh** ✓ |
> مؤكَّد SSR (curl) **و** العميل بعد hydration (متصفّح) — متطابقان، بلا flip.

## 5) نتيجة صفحات الشهر واليوم (لا انحدار)
| الصفحة | breadcrumb (بعد) | آخر عنصر |
|---|---|---|
| `/moon-in-riyadh/2026-06` | …› **القمر في الرياض**(رابط) › يونيو 2026 | يونيو 2026 ✓ |
| `/moon-in-riyadh/2026-06-13` | …› **القمر في الرياض**(رابط) › يونيو 2026 › 13 يونيو 2026 | 13 يونيو 2026 ✓ |
> عنصر المدينة الوسطيّ صار «القمر في الرياض» في **SSR أيضًا** (كان مجرّدًا) فيطابق العميل. آخر عنصر يبقى الشهر/اليوم — لا انحدار. **ملاحظة:** عُولج تطابق SSR↔client على صفحة-تاريخ=اليوم (كان العميل يعرض «القمر اليوم» بينما SSR «القمر في») عبر تعديل `_skipTodayBC` — الآن كلاهما «القمر في الرياض».

## 6) نتيجة `/moon-today-in-riyadh` (مشمولة)
بعد: …› **القمر اليوم في الرياض** (آخر عنصر، current). SSR + العميل متطابقان على صيغة «اليوم» (تبقى دلالة صفحة اليوم سليمة، بلا تغيير).

## 7) نتيجة اللغات العشر (`/moon-in-riyadh` — SSR، بالمفتاح القائم)
ar «القمر في الرياض» · en «Moon in Riyadh» · fr «La Lune à Riyad» · tr «Riyad’de Ay» · ur «ریاض میں چاند» · de «Mond in Riad» · id «Bulan di Riyadh» · es «La Luna en Riad» · bn «চাঁদ রিয়াদ-এ» · ms «Bulan di Riyadh». (en مؤكَّد عميلًا «Moon in Riyadh» أيضًا.)

## 8) حالة BreadcrumbList JSON-LD
**متّسق مع المرئيّ** — JSON-LD آخر عنصره على الـhub صار «القمر في الرياض» (كان «الرياض»)، وعلى الشهر/اليوم العنصر الوسطيّ «القمر في الرياض». نفس مصفوفة `seo.breadcrumbs` تُغذّي المرئيّ + JSON-LD، فلا انفصال. positions صحيحة.

## 9) تأكيد عدم تغيير H1/Title/Meta
`/moon-in-riyadh`: H1 «🌙 تقويم القمر وأطوار الشهر في الرياض» · Title «حالة القمر في الرياض | …» — **مطابقان للقيم قبل الإصلاح** (مؤكَّد بالمقارنة). الإصلاح يمسّ breadcrumb فقط.

## 10) تأكيد عدم تغيير canonical/hreflang/sitemap
canonical = `/moon-in-riyadh` (ذاتيّ) · hreflang count = **11** — بلا تغيير. sitemap غير مُعدَّل. لا مساس بالروابط.

## 11) نتائج regression
- `node --check` server.js + app.js ✓.
- **القمر:** الأنواع الأربعة (hub/شهر/يوم/today) × (ar + en مؤكَّد) → التسمية الصحيحة، **SSR=client**، 0 أخطاء console.
- **غير القمر بلا مساس:** `/prayer-times-in-riyadh` (breadcrumb «الرئيسية › الرياض») · `/qibla-in-riyadh` (… › الرياض) · `/today-hijri-date` · `/azkar` → كلّها 200، breadcrumb بلا تغيير.
- H1/Title/canonical/hreflang(11)/moon-calc بلا تغيير.

## 12) cache-buster
`js/app.js?v=775 → 777` في `index.html` (موضعان). **لا رفع Service Worker** (لا سبب). server.js (SSR) يُخدَم طازجًا عند النشر.

## 13) رسالة commit المقترحة
```
fix(moon): MOON-CITY-BREADCRUMB-LABEL-FIX-1 — use moon-in-city breadcrumb label on city moon pages
```

---
**الخلاصة:** breadcrumb صفحات القمر صار عنصر المدينة فيه «القمر في {city}» (hub/شهر/يوم) و«القمر اليوم في {city}» (today) — بالمفتاح القائم بلا صياغة جديدة، في الطبقتين server.js + app.js فيتطابق SSR↔client بلا hydration-fix، مع JSON-LD متّسق. آخر عنصر على الـhub صار «القمر في الرياض» (كان «الرياض»). H1/Title/canonical/hreflang/الحسابات/الصفحات الأخرى بلا مساس.

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: MOON-CITY-BREADCRUMB-LABEL-FIX-1` ثمّ «أوافق على تنفيذ الدفع».

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
