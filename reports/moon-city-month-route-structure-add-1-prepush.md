# MOON-CITY-MONTH-ROUTE-STRUCTURE-ADD-1 PRE-PUSH REPORT

**التاريخ:** 2026-06-18 · **الفرع:** `main` · **HEAD الحاليّ:** `b821faf` (تذكرة السنة فقط) · **شجرة العمل:** تغييرات MCMR غير مُلتزَمة (local only)
**الحالة:** ✅ نُفِّذ محليًّا بالكامل + اختبارات خضراء + تحقّق متصفّح (سطح المكتب + الجوّال) — **بانتظار مراجعتك واعتمادك. لم يُدفَع شيء.**

> **القرار المطلوب منك:** مراجعة هذا التقرير. لن أُنشئ commit أو أدفع إلى `main` قبل عبارتي الاعتماد الصريحتين.

---

## 0) نطاق التذكرة وما التُزِم به حرفيًّا

**فُعِّلت صفحة الشهر فقط:** `/[lang/]moon/{country}/{city}/{yyyy}/{mm}` (مثال `/moon/saudi-arabia/riyadh/2026/06`).

القيود الحرجة — كلّها مُحترَمة:
- ❌ **لم** تُفعَّل صفحة اليوم المتداخلة `…/{yyyy}/{mm}/{dd}` → تبقى **404 نظيف**.
- ❌ **لم** تُفعَّل صفحة `…/today` المتداخلة → تبقى **404 نظيف**.
- ❌ **لم** تُفعَّل صور الشرطة dash `…/{yyyy-mm}` و`…/{yyyy-mm-dd}` → تبقى **404 نظيف**.
- ❌ **لم** يُمَسّ Meeus 49 / `js/moon.js` إطلاقًا (مُتحقَّق: الرياض يونيو 2026 — 15=المحاق، 30=البدر بلا تغيير).
- ❌ **لم** يُطوَّر محتوى `/moon` ولا `/moon/{country}` (عدا تحديث روابط داخليّة لازمة: بطاقات الأشهر في صفحة السنة).
- ❌ **لا** تحويلة من الشهر القديم `/moon-in-{city}/{yyyy-mm}` → الجديد (راجع §1).
- ✅ **local only** — لا commit ولا push قبل اعتمادك.

---

## 1) قرار التحويلة القديمة (Section 1)

**لم أُضِف أيّ تحويلة (301) من `/moon-in-{city}/{yyyy-mm}` إلى المسار الجديد. الروابط القديمة تبقى تعمل 200 كما هي.**

> **ملاحظة مطلوبة في التقرير:** Legacy month routes left unchanged intentionally because the site is not officially launched yet. Final redirect/noindex cleanup will be handled in a separate pre-launch cleanup ticket.
> (تُرِكت روابط الشهر القديمة دون تغيير عن قصد لأنّ الموقع لم يُطلَق رسميًّا بعد؛ تنظيف التحويلات/noindex النهائيّ سيُعالَج في تذكرة تنظيف منفصلة قبل الإطلاق.)

---

## 2) البنية النشطة بعد هذه التذكرة (Section 2)

| المسار | الحالة |
|---|---|
| `/moon` | 200 (هب عام) |
| `/moon/{country}` | 200 (صفحة دولة) |
| `/moon/{country}/{city}` | 200 (هب المدينة) |
| `/moon/{country}/{city}/{yyyy}` | 200 (صفحة السنة) |
| **`/moon/{country}/{city}/{yyyy}/{mm}`** | **200 (صفحة الشهر — جديدة، `page-moon-month`)** |
| `…/{yyyy}/{mm}/{dd}` (يوم متداخل) | **404 نظيف** |
| `…/today` (متداخل) | **404 نظيف** |
| `…/{yyyy-mm}` + `…/{yyyy-mm-dd}` (dash) | **404 نظيف** |

---

## 3) الملفّات المُعدَّلة (9 ملفّات مُتعقَّبة + 2 جديد)

```
 server.js                                              | 360 +++  (المنطق: مُصنِّف + SEO + باني المحتوى + حقن SSR + sitemap) — لم يُمَسّ في جولة PRE-PUSH UPDATE
 index.html                                             |  69 +++  (#page-moon-month + Hero + CSS + cache-busters)
 js/app.js                                              |  22 +    (تفعيل SPA + BFCache + _isMoonMonthPath)
 sw.js                                                  |   2 +-   (CACHE_VERSION v449 → v450)
 reports/moon-routes-structure-contract-1.md            |  16 +-   (عقد البنية: الشهر صار 200 LIVE)
 scripts/_smoke_moon_routes_structure_guardrails_1.mjs  |  20 +-   (حارس: الشهر=200، الأعمق/dash=404)
 scripts/_smoke_moon_city_year_route_structure_add_1.mjs|  22 +-   (بطاقات السنة → المسار المتداخل الجديد + sitemap الشهر)
 scripts/_smoke_moon_spa_router_moon_prefix_activation_audit_1.mjs | 14 +- (PRE-PUSH UPDATE — test-only: /moon-in-{city}=301→nested)
 scripts/_smoke_moon_today_content_move_to_moon_1.mjs   |  18 +-   (PRE-PUSH UPDATE — test-only: /moon-in-{city}=301→nested)
 scripts/_smoke_moon_city_month_route_structure_add_1.mjs (جديد)   (سموك الشهر المخصّص — 69 فحصًا)
 reports/moon-city-month-route-structure-add-1-prepush.md (جديد)   (هذا التقرير)
```

**ملفّات ضوضاء غير مُدرَجة في الالتزام** (لن تُضاف): `reports/en-moon-city-month-keyword-consistency-audit-1.md` (ملفّ سابق غير مرتبط بالتذكرة) + كلّ `db/places/candidates/*` + `.azkar-shots/` + `.lh-runs/` + … (≈368 ملفًّا). سأرحّل المسارات بالاسم صراحةً وأتأكّد أنّ المجموعة المرحّلة هي ملفّات التذكرة بالضبط قبل الالتزام.

---

## 4) المُصنِّف والتحقّق (Section 10)

`_classifyMoonMonth(urlPath)` (regex `^/((?:lang)/)?moon/([a-z][a-z0-9-]+)/([a-z][a-z0-9-]+)/(\d{4})/(\d{2})$`) يُرجِع `{kind:'valid'|'redirect'|'none'}`:
- السنة 4 أرقام في **1900–2100**؛ الشهر رقمان في **01–12**؛ الدولة حقيقيّة؛ المدينة تُحلّ وتنتمي للدولة.
- مدينة في دولة خاطئة → **301** للمسار الصحيح (مع حفظ اللغة).

نتائج التحقّق (من السموك، كلّها خضراء):

| الإدخال | المتوقَّع | النتيجة |
|---|---|---|
| `/moon/saudi-arabia/riyadh/2026/06` | 200 | ✅ |
| `…/2026/06/17` (يوم) | 404 | ✅ |
| `…/today` | 404 | ✅ |
| `…/2026/6` (رقم واحد) | 404 | ✅ |
| `…/2026/00` | 404 | ✅ |
| `…/2026/13` | 404 | ✅ |
| `…/2026/abc` | 404 | ✅ |
| `…/2026-06` (dash) | 404 | ✅ |
| `…/2026-06-17` (dash) | 404 | ✅ |
| `…/1899/06` + `…/2101/06` (خارج المجال) | 404 | ✅ |
| `/moon/saudi-arabia/notacity/2026/06` | 404 | ✅ |
| `/moon/zzz-not-a-country/riyadh/2026/06` | 404 | ✅ |
| `/moon/united-states/riyadh/2026/06` (دولة خاطئة) | 301 → `/moon/saudi-arabia/riyadh/2026/06` | ✅ |
| `/en/…` (دولة خاطئة) | 301 مع حفظ `/en` | ✅ |

---

## 5) SEO (Section 7)

- **Title (AR):** `تقويم القمر في الرياض يونيو 2026 | أطوار القمر اليومية` ✅
- **Title (EN):** `Moon Calendar in Riyadh June 2026 | Daily Moon Phases` ✅
- **canonical:** ذاتيّ لِكلّ لغة (مُتحقَّق على ar/en/fr + united-states/new-york). ✅
- **hreflang:** 10 لغات + `x-default`. ✅
- **JSON-LD:** `BreadcrumbList` (6 رتب، DOM≡JSON-LD) + `FAQPage`. **لا `Event`** (الأطوار ليست أحداثًا). ✅
- **indexable:** لا `noindex`. ✅

---

## 6) المحتوى (Section 6) — مُتحقَّق في المتصفّح

- **H1 (AR):** `تقويم القمر في الرياض لشهر يونيو 2026` (بلا لاحقة SEO) — H1 واحد فقط في الصفحة. ✅
- **breadcrumb 6 مستويات:** الرئيسية › حالة القمر › المملكة العربية السعودية › الرياض › 2026 › يونيو — رتبة السنة **رابط** لصفحة السنة، رتبة الشهر هي الحاليّة (نصّ). DOM≡JSON-LD مُتطابقان حرفيًّا (AR+EN). ✅
- **Hero:** وصف + **7 رقاقات** (المدينة/الشهر/السنة/التوقيت المحلّي/عدد أيّام الشهر/البدر/المحاق) + مرساتان `#moon-month-summary` + `#moon-month-calendar`. ✅
- **ملخّص الشهر:** تواريخ المحاق/التربيع الأوّل/البدر/التربيع الأخير + عدد الأحداث + tz + ملاحظة. ✅
- **الجدول اليوميّ (SSR):** صفّ لِكلّ يوم — **يونيو=30، يناير=31، فبراير 2026=28، فبراير 2024=29 (كبيسة)** — 5 أعمدة (التاريخ المحلّي/اليوم/الطور+أيقونة/الإضاءة %/العمر). ✅
- **روابط الأيّام:** تستعمل **اليوم القديم** `/moon-in-riyadh/2026-06-NN` (30 رابطًا) — **صفر** روابط للمسار المتداخل 404. ✅
- **الشهر السابق/التالي:** مع عبور السنة (يناير→ديسمبر السنة السابقة، ديسمبر→يناير السنة التالية، ومحدود 1900–2100). ✅
- **روابط رجوع:** للسنة + المدينة. ✅
- **FAQ:** 6 أسئلة SSR + `FAQPage` JSON-LD مُطابق. ✅

---

## 7) النتائج — السموك المخصّص + الانحدار

| السويت | النتيجة |
|---|---|
| **سموك الشهر الجديد** `_smoke_moon_city_month_route_structure_add_1` | **69 / 69 ✅** |
| حارس البنية `_smoke_moon_routes_structure_guardrails_1` (مُحدَّث: الشهر=200) | **89 / 89 ✅** |
| سموك السنة `_smoke_moon_city_year_route_structure_add_1` (مُحدَّث: بطاقات→الجديد) | **74 / 74 ✅** |
| سموك هب المدينة `_smoke_moon_city_hub_route_structure_add_1` | **33 / 33 ✅** |
| سموك صفحة الدولة `_smoke_moon_country_pages_ssr_add_1` | **58 / 58 ✅** |
| محرّك Meeus 49 `_smoke_moon_phase_event_engine_meeus49_fix_1` | **45 / 45 ✅** |
| حساب تقويم الأطوار `_smoke_moon_phase_calendar_calculation_fix_1` | **212 / 212 ✅** |
| عدّاد العدّ التنازليّ `_smoke_hijri_new_year_countdown_seo_content_h1_fix_1` | **424 / 424 ✅** |
| `node --check` على `server.js` + `js/app.js` + `js/moon.js` | **نظيف ✅** |

**سويتان قديمتان كانتا حمراوين — أُصلِحتا الآن (test-only) بناءً على طلبك (PRE-PUSH UPDATE):**
- `_smoke_moon_spa_router_moon_prefix_activation_audit_1`: كان 35/36 → الآن **37/37 ✅**
- `_smoke_moon_today_content_move_to_moon_1`: كان 33/34 → الآن **35/35 ✅**

سبب الفشل كان توكيدًا قديمًا واحدًا: `/moon-in-riyadh` (الهب المسطّح القديم) = 200. لكنّ السلوك المعتمَد منذ تذكرة الهب `MOON-CITY-HUB-ROUTE-STRUCTURE-ADD-1` (`d0dd388`، في HEAD) هو **301 → `/moon/saudi-arabia/riyadh`**. صحّحتُ توقّعات الاختبارين **فقط** ليطابقا السلوك المعتمَد:
- `/moon-in-riyadh` → **301** → `/moon/saudi-arabia/riyadh`؛ و`/en/moon-in-riyadh` → **301** → `/en/moon/saudi-arabia/riyadh`.
- اليوم/المؤرّخ القديم (`/moon-today-in-{city}`، `/moon-in-{city}/{date}`) يبقى **200** كما هو.
- **التعديل test-only بحت:** لم يُمَسّ `server.js` ولا أيّ runtime ولا routes ولا `js/moon.js` بسبب هذه النقطة (أُضيف فقط التقاط رأس `Location` في مساعد `get()` بالسموك الأوّل لِتمكين فحص وجهة 301). لا توجد الآن أيّ سويت معروفة بالفشل.

---

## 8) تحقّق المتصفّح (سطح المكتب + الجوّال)

- **سطح المكتب:** `page-moon-month` نشط، H1=1، 7 رقاقات، 30 صفّ يوميّ، 6 FAQ، breadcrumb 6 رتب، **لا فيضان أفقيّ** (`scrollWidth ≤ innerWidth`)، **صفر أخطاء console**.
- **الجوّال (375px):** `page-moon-month` نشط، **0 عناصر تتجاوز العرض**، الجدول يتّسع دون تمرير أفقيّ، 7 رقاقات، 30 صفًّا.
- **صحّة الأطوار (Meeus 49):** تدرّج صحيح علميًّا — 1–7 يونيو أحدب متناقص (99%→61%)، 8 تربيع أخير (51%)، 9–14 هلال متناقص نحو المحاق في 15، العمر يتزايد 15.8→28.8 يوم.
- لقطتان (جوّال Hero + سطح المكتب الجدول) مُلتقَطتان أثناء الجلسة.

---

## 9) Sitemap (Section 9)

من `sitemap-cities-1.xml` المُقدَّم محليًّا:

| النمط | العدد | الحالة |
|---|---|---|
| **الشهر المتداخل الجديد** `/moon/{c}/{city}/{yyyy}/{mm}` | **27,360** | ✅ مُضاف (760 مدينة curated × 3 سنوات × 12 شهرًا) |
| السنة المتداخلة `/moon/{c}/{city}/{yyyy}` | 2,280 | بلا تغيير |
| اليوم المتداخل `…/{yyyy}/{mm}/{dd}` | **0** | ✅ غير مُدرَج (صحيح) |
| today المتداخل `…/today` | **0** | ✅ غير مُدرَج (صحيح) |
| **الشهر القديم** `/moon-in-{city}/{yyyy-mm}` | 2,280 | **بلا تغيير** (راجع الملاحظة) |
| **اليوم القديم** `/moon-in-{city}/{yyyy-mm-dd}` | 23,560 | **بلا تغيير** |

> **ملاحظة sitemap (مطلوبة):** روابط الشهر/اليوم القديمة (`/moon-in-{city}/{yyyy-mm}` و`…/{yyyy-mm-dd}`) لا تزال مُصدَّرة في sitemap-cities دون تغيير. تُرِكت عن قصد لأنّ الموقع لم يُطلَق رسميًّا بعد؛ تنظيف sitemap النهائيّ (إزالة القديم/إضافة noindex/توحيد على البنية المتداخلة) سيُعالَج في تذكرة تنظيف منفصلة قبل الإطلاق. **لم أُجرِ أيّ تنظيف شامل** ضمن هذه التذكرة.

أشهر الشهر الجديد محدودة بصفحات السنة المقبولة (السنة السابقة + الحاليّة + التالية) — لا إغراق أيّام، لا today.

---

## 10) الروابط القديمة سليمة (Section 4) + Meeus 49 دون مساس

- `/moon-in-riyadh/2026-06` (شهر قديم) → **200** (لم يُحوَّل). ✅
- `/moon-in-riyadh/2026-06-17` (يوم قديم) → **200**. ✅
- `/moon-today-in-riyadh` → **200**. ✅
- `/moon/saudi-arabia/riyadh/2026` (سنة) + `…/riyadh` (هب) + `/moon/saudi-arabia` (دولة) + `/moon` → كلّها **200**. ✅
- Meeus 49: الرياض يونيو 2026 — 15=المحاق، 30=البدر (دون تغيير). ✅

---

## 11) Guardrails (Section 11) + عقد البنية

- حارس البنية حُدِّث: `/moon/{country}/{city}/{yyyy}/{mm}` = **200 + `page-moon-month` نشط + H1=1 + 0 أقسام مُسرَّبة + تعليقات HTML متوازنة**؛ والأعمق `…/{yyyy}/{mm}/{dd}` + `…/today` + الشهر غير الصالح (`/6`, `/00`, `/13`) + dash = **404 نظيف**.
- عقد البنية `reports/moon-routes-structure-contract-1.md` حُدِّث ليعكس أنّ صفحة الشهر صارت 200 LIVE (الجدول النشط + جدول المستقبل + قواعد التحقّق + وصف الحارسين E/F).

---

## 12) Cache-busters

- `index.html`: `app.js?v=789 → v=790` ✅
- `sw.js`: `CACHE_VERSION 'v449' → 'v450'` ✅ (التطابق الوحيد النشط في السطر 1564؛ `v392` في السطر 1084 مجرّد تعليق تاريخيّ).

---

## 13) رسالة الالتزام المقترَحة + التوقّف

**سأرحّل بالاسم صراحةً هذه الملفّات فقط** (لا ملفّات ضوضاء):
```
server.js  index.html  js/app.js  sw.js
reports/moon-routes-structure-contract-1.md
reports/moon-city-month-route-structure-add-1-prepush.md
scripts/_smoke_moon_routes_structure_guardrails_1.mjs
scripts/_smoke_moon_city_year_route_structure_add_1.mjs
scripts/_smoke_moon_city_month_route_structure_add_1.mjs
scripts/_smoke_moon_spa_router_moon_prefix_activation_audit_1.mjs   (PRE-PUSH UPDATE — test-only)
scripts/_smoke_moon_today_content_move_to_moon_1.mjs               (PRE-PUSH UPDATE — test-only)
```

**رسالة الالتزام:**
```
feat(moon): MOON-CITY-MONTH-ROUTE-STRUCTURE-ADD-1 — add monthly moon calendar routes for city pages
```

> ⛔ **توقّفت هنا. لم أُنشئ commit ولم أدفع.** لن أبدأ الدفع إلا بعد عبارتيك الصريحتين:
> «أعتمد دفع تقرير: MOON-CITY-MONTH-ROUTE-STRUCTURE-ADD-1» + «أوافق على تنفيذ الدفع إلى main».
>
> ولن أبدأ صفحة اليوم المحدّد، ولا صفحة today، ولا تنظيف الروابط القديمة، ولا تطوير محتوى `/moon`، ولا أيّ تذكرة/صفحة أذكار جديدة قبل إغلاق هذه التذكرة.
