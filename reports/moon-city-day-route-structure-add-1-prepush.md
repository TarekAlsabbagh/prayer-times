# MOON-CITY-DAY-ROUTE-STRUCTURE-ADD-1 PRE-PUSH REPORT

**التاريخ:** 2026-06-18 · **الفرع:** `main` · **HEAD الحاليّ:** `931756a` (تذكرة الشهر MCMR) · **شجرة العمل:** تغييرات MCDR غير مُلتزَمة (local only)
**الحالة:** ✅ نُفِّذ محليًّا بالكامل + اختبارات خضراء + تحقّق متصفّح (سطح المكتب + الجوّال DOM) — **بانتظار مراجعتك واعتمادك. لم يُدفَع شيء.**

> **القرار المطلوب منك:** مراجعة هذا التقرير. لن أُنشئ commit أو أدفع إلى `main` قبل عبارتي الاعتماد الصريحتين.

---

## 0) ما الذي تم تنفيذه + النطاق

**فُعِّلت صفحة اليوم فقط:** `/[lang/]moon/{country}/{city}/{yyyy}/{mm}/{dd}` (مثال `/moon/saudi-arabia/riyadh/2026/06/17`). نُسِخت بنية صفحة الشهر (MCMR) مع إضافة المستوى السابع. القيود — كلّها مُحترَمة:
- ❌ **لم** تُفعَّل صفحة `today` المتداخلة → تبقى **404 نظيف** (today يُخدَم عبر القديم `/moon-today-in-{city}`).
- ❌ **لا** تحويلة (301) من اليوم القديم `/moon-in-{city}/{yyyy-mm-dd}` → الجديد. القديم يبقى **200** كما هو.
- ❌ **لم** تُضَف صفحات الأيّام دفعةً إلى sitemap (السبب: عددها ضخم؛ نؤجّل سياسة crawl/index النهائيّة).
- ❌ **لم** يُمَسّ Meeus 49 / `js/moon.js` (0 diff).
- ❌ **لم** يُطوَّر محتوى `/moon`؛ ولم تُبدأ أيّ تذكرة/أذكار جديدة.
- ✅ **local only** — لا commit/push قبل اعتمادك.

---

## 1) أمثلة الروابط التي أصبحت 200 + حالة الروابط القديمة

| الرابط | الحالة |
|---|---|
| `/moon/saudi-arabia/riyadh/2026/06/17` | **200 ✅** |
| `/en/moon/saudi-arabia/riyadh/2026/06/17` | **200 ✅** |
| `/moon-in-riyadh/2026-06-17` (اليوم القديم) | **200 — دون تحويل ✅** |
| `/moon-in-riyadh/2026-06` (الشهر القديم) | **200 ✅** |
| `/moon-today-in-riyadh` | **200 ✅** |

**هل تم عمل redirect للقديم؟** ❌ لا. اليوم القديم `/moon-in-{city}/{yyyy-mm-dd}` **يبقى 200 دون أيّ 301**. التنظيف النهائيّ مؤجَّل لِتذكرة `MOON-LEGACY-ROUTES-CLEANUP-BEFORE-LAUNCH`.

---

## 2) محتوى صفحة اليوم (SSR-visible) — مُتحقَّق في المتصفّح

- **H1 (AR):** `حالة القمر في الرياض يوم 17 يونيو 2026` · **(EN):** `Moon Phase in Riyadh on June 17, 2026` — H1 واحد فقط.
- **breadcrumb 7 مستويات:** الرئيسية › حالة القمر › المملكة العربية السعودية › الرياض › 2026 › يونيو › 17 — رتبتا **السنة والشهر روابط**، رتبة اليوم حاليّة. DOM≡JSON-LD حرفيًّا (7 عناصر، AR+EN). ✅
- **Hero:** وصف + **7 رقاقات** (المدينة/التاريخ/اليوم من الأسبوع/التوقيت المحلّي/طور القمر/نسبة الإضاءة/عمر القمر) + مرساتان `#moon-day-summary` + `#moon-day-details`. ✅
- **ملخّص اليوم (SSR، `#moon-day-summary`):** الطور + الإضاءة% + العمر + **أقرب مرحلة كبرى** (نوعها + تاريخها المحلّي + بُعدها بالأيّام) + التوقيت المحلّي + ملاحظة. ✅
- **تفاصيل اليوم (SSR، `#moon-day-details`):** جدول 6 أعمدة (التاريخ المحلّي/اليوم/الطور/الإضاءة/العمر/أقرب مرحلة كبرى) + رابط «عرض تقويم الشهر». ✅
- **مثال حيّ (17 يونيو 2026، الرياض):** `🌒 هلال متزايد` · إضاءة **8%** · العمر **2.3 يوم** · أقرب مرحلة كبرى **🌑 المحاق — 15 يونيو 2026 (قبل 2 أيام)** — متّسق فلكيًّا (يومان بعد محاق 15 يونيو). ✅
- **5 FAQ** SSR + `FAQPage` JSON-LD مطابق · **لا `Event` schema** · ليست footer-only (جسم > 60KB). ✅

**هل تفاصيل اليوم SSR-visible؟** نعم — الملخّص والجدول مَحقونان من الخادم (`_buildMoonDayContent`)، يظهران قبل أيّ JS.

---

## 3) روابط السابق/التالي + روابط العودة + روابط الشهر

- **اليوم السابق/التالي** (عبور الشهر والسنة، محدود 1900–2100) — مُتحقَّق:
  - 1 يونيو → السابق **31 مايو** · 30 يونيو → التالي **1 يوليو** · 1 يناير 2026 → السابق **31 ديسمبر 2025** · 31 ديسمبر 2026 → التالي **1 يناير 2027**. ✅
- **روابط العودة:** شهر (`…/{yyyy}/{mm}`) + سنة (`…/{yyyy}`) + مدينة (`…/{city}`). ✅

**هل روابط الشهر أصبحت تشير إلى صفحات اليوم الجديدة؟** نعم — صفحة الشهر `/moon/{country}/{city}/{yyyy}/{mm}` صارت روابط أيّامها الـ30 تشير إلى **`/moon/{country}/{city}/{yyyy}/{mm}/{dd}`** (صفر روابط للقديم `/moon-in-{city}/{yyyy-mm-dd}`). ✅

---

## 4) SEO

- **AR title:** `حالة القمر في الرياض 17 يونيو 2026 | طور القمر والإضاءة` ✅
- **EN title:** `Moon Phase in Riyadh on June 17, 2026 | Illumination and Moon Age` ✅
- **AR/EN meta description** حسب المواصفات (10 لغات: AR/EN مؤلَّفتان + 8 لغات مترجمة). ✅
- **canonical:** ذاتيّ لِكلّ لغة. **hreflang:** 10 لغات + x-default. **index** (لا noindex). ✅
- **JSON-LD:** `BreadcrumbList` (7 عناصر، DOM≡JSON-LD) + `FAQPage`. لا `Event`. ✅

---

## 5) Sitemap

**صفحات اليوم index + canonical ذاتيّ، لكنّها غير مُضافة دفعةً إلى sitemap** (تُكتشَف عبر روابط أيّام صفحة الشهر). مُتحقَّق على `sitemap-cities-1.xml`: **0** رابط يوم متداخل `/moon/{c}/{city}/{yyyy}/{mm}/{dd}`، بينما صفحات الشهر باقية (27,360).

> **ملاحظة مطلوبة في التقرير:** Daily moon pages are enabled and discoverable via month pages, but not bulk-added to sitemap yet to avoid a large sitemap expansion before the pre-launch crawl strategy is approved.

---

## 6) Validation (Section 9 + 10)

`_classifyMoonDay` (regex `…/(\d{4})/(\d{2})/(\d{2})$`): السنة 1900–2100، الشهر 01–12، **اليوم 01–31 مُتحقَّق ضدّ أيّام الشهر الفعليّة (leap-aware)**؛ مدينة في دولة خاطئة → **301**. نتائج (من السموك):

| الإدخال | المتوقَّع | النتيجة |
|---|---|---|
| `…/2026/06/17` + `/en/…` | 200 | ✅ |
| `…/today` · `…/2026-06-17` · `…/2026-06` (dash) | 404 | ✅ |
| `…/2026/6/17` (شهر رقم واحد) · `…/2026/06/7` (يوم رقم واحد) | 404 | ✅ |
| `…/2026/06/00` · `…/2026/06/32` | 404 | ✅ |
| `…/2026/02/30` · `…/2026/13/01` | 404 | ✅ |
| `…/2026/06/17/extra` (أعمق من اليوم) | 404 | ✅ |
| `…/1899/06/17` · `…/2101/06/17` (خارج المجال) | 404 | ✅ |
| **`…/2024/02/29` (سنة كبيسة)** | **200** | ✅ |
| **`…/2026/02/29` (غير كبيسة)** · `…/2026/04/31` | **404** | ✅ |
| مدينة مجهولة · دولة مجهولة | 404 | ✅ |
| `/moon/united-states/riyadh/2026/06/17` (دولة خاطئة) | 301 → `/moon/saudi-arabia/riyadh/2026/06/17` | ✅ |
| `/en/…` mismatch | 301 مع حفظ `/en` | ✅ |

---

## 7) النتائج — السموك المخصّص + الانحدار

| السويت | النتيجة |
|---|---|
| **سموك اليوم الجديد** `_smoke_moon_city_day_route_structure_add_1` | **75 / 75 ✅** |
| حارس البنية `_smoke_moon_routes_structure_guardrails_1` (مُحدَّث: اليوم=200، leap-aware) | **97 / 97 ✅** |
| سموك الشهر `_smoke_moon_city_month_route_structure_add_1` (مُحدَّث: روابط الأيّام→الجديد) | **69 / 69 ✅** |
| سموك السنة `_smoke_moon_city_year_route_structure_add_1` (مُحدَّث: الأعمق=`…/{dd}/extra`) | **74 / 74 ✅** |
| سموك هب المدينة | **33 / 33 ✅** |
| سموك صفحة الدولة | **58 / 58 ✅** |
| spa-router | **37 / 37 ✅** |
| moon-today-content | **35 / 35 ✅** |
| محرّك Meeus 49 | **45 / 45 ✅** |
| حساب تقويم الأطوار | **212 / 212 ✅** |
| العدّ التنازليّ | **424 / 424 ✅** |
| `node --check` (server.js · app.js · moon.js) | **نظيف ✅** |

**لا توجد أيّ سويت معروفة بالفشل.**

---

## 8) تحقّق المتصفّح (سطح المكتب + الجوّال)

- **سطح المكتب (DOM):** `page-moon-day` نشط فقط، H1=1، 7 رقاقات، ملخّص + جدول تفاصيل (6 أعمدة)، 5 FAQ، breadcrumb 7 رتب، **صفر أخطاء console**، بيانات Meeus متّسقة فلكيًّا.
- **الجوّال (375px):** `page-moon-day` نشط، 7 رقاقات، **0 عناصر تتجاوز العرض**، جدول التفاصيل يتّسع دون تمرير أفقيّ (`scrollW = innerW = 375`). ✅
- ملاحظة بيئيّة: أداة لقطة الشاشة Headless غير مستقرّة (مهلة 30s، مثل جلستَي MCYR/MCMR)؛ اعتمدتُ تحقّق DOM الشامل. CSS صفحة اليوم نسخة مُعاد-تحجيمها حرفيًّا من CSS الشهر (`overflow-x:clip` + `.my-table-scroll`) المُتحقَّق على الإنتاج في MCMR.

---

## 9) الملفّات المُعدَّلة (8 مُتعقَّبة + 2 جديد)

```
server.js                                              | 382 ++  (المنطق: _classifyMoonDay + SEO + باني المحتوى + حقن SSR + strip ids + H1 marker + dispatch)
index.html                                             |  68 ++  (#page-moon-day + Hero 7-rung breadcrumb + CSS + cache-buster v790→791)
js/app.js                                              |  24 +   (_isMoonDayPath + تفعيل SPA + BFCache + _initialSyncHydrate)
sw.js                                                  |   4 +-  (CACHE_VERSION v450 → v451)
reports/moon-routes-structure-contract-1.md            |  19 +-  (عقد البنية: اليوم 200 LIVE)
scripts/_smoke_moon_routes_structure_guardrails_1.mjs  |  25 +-  (حارس: اليوم=200 leap-aware؛ today/dash/bad-day/أعمق=404)
scripts/_smoke_moon_city_month_route_structure_add_1.mjs|  15 +- (روابط أيّام الشهر → المتداخل الجديد؛ الأعمق=`…/{dd}/extra`)
scripts/_smoke_moon_city_year_route_structure_add_1.mjs|   4 +-  (الأعمق-من-السنة 404 = `…/{dd}/extra`)
scripts/_smoke_moon_city_day_route_structure_add_1.mjs (جديد)   (سموك اليوم المخصّص — 75 فحصًا)
reports/moon-city-day-route-structure-add-1-prepush.md (جديد)   (هذا التقرير)
```

**أُكِّد:**
- **`js/moon.js` لم يتغيّر** (`git diff` = 0). · **Meeus 49 لم يتغيّر**.
- **`js/app.js` تغيّر ولماذا:** نعم — أضفتُ `_isMoonDayPath`، وفرعَ تفعيل `#page-moon-day` (بأسبقيّة فوق الشهر/السنة)، وتخطّي `updateMoonInfo()` على صفحة اليوم، وفرعَ BFCache، وتمديدَ regex بذرة `__PRAYER_CITY__` لِمسار اليوم (لمنع FOUC). لا تغيير في محرّك القمر.
- **sw/cache-busters تغيّرا:** `app.js?v=790→791` + `CACHE_VERSION v450→v451`.
- ملفّات الضوضاء (~370) **لن تدخل** الالتزام (ترحيل صريح بالاسم).

---

## 10) الثوابت (الروابط القديمة + المسارات غير المُفعَّلة) — من السموك

- `/moon-in-riyadh/2026-06-17` (يوم قديم) + `/moon-in-riyadh/2026-06` (شهر قديم) + `/moon-today-in-riyadh` = **200** (دون مساس). ✅
- `/moon/{country}/{city}/today` = **404 نظيف** (لم تبدأ). ✅
- `/moon/{country}/{city}/{yyyy-mm-dd}` (dash) = **404 نظيف**. ✅
- صفحات اليوم غير الصالحة (`/2026/06/32`، `/2026/6/17`، …) = **404 نظيف**. ✅
- السلسلة `…/{yyyy}/{mm}` + `…/{yyyy}` + `…/{city}` + `/moon/{country}` + `/moon` كلّها **200**. ✅

---

## 11) دَيْن تنظيف مُسجَّل قبل الإطلاق

استمرار روابط legacy في sitemap أو 200 مؤقتًا مقبول الآن فقط لأنّ الموقع لم يُطلَق رسميًّا بعد. مُسجَّل لِتذكرة مستقلّة:

> **`MOON-LEGACY-ROUTES-CLEANUP-BEFORE-LAUNCH`** — تنظيف/تحويل/noindex لروابط `/moon-in-{city}/{yyyy-mm}` + `/moon-in-{city}/{yyyy-mm-dd}` + تشذيب sitemap legacy. **لن يُبدأ إلا بطلبك المنفصل.**

---

## 12) رسالة الالتزام المقترَحة + التوقّف

**سأرحّل بالاسم صراحةً هذه الملفّات فقط** (لا ملفّات ضوضاء):
```
server.js  index.html  js/app.js  sw.js
reports/moon-routes-structure-contract-1.md
reports/moon-city-day-route-structure-add-1-prepush.md
scripts/_smoke_moon_routes_structure_guardrails_1.mjs
scripts/_smoke_moon_city_month_route_structure_add_1.mjs
scripts/_smoke_moon_city_year_route_structure_add_1.mjs
scripts/_smoke_moon_city_day_route_structure_add_1.mjs
```

**رسالة الالتزام:**
```
feat(moon): MOON-CITY-DAY-ROUTE-STRUCTURE-ADD-1 — add daily moon phase routes for city pages
```

> ⛔ **توقّفت هنا. لم أُنشئ commit ولم أدفع.** لن أبدأ الدفع إلا بعد عبارتيك:
> «أعتمد دفع تقرير: MOON-CITY-DAY-ROUTE-STRUCTURE-ADD-1» + «أوافق على تنفيذ الدفع إلى main».
>
> ولن أبدأ صفحة today، ولا cleanup للروابط القديمة، ولا تطوير محتوى `/moon`، ولا إضافة صفحات الأيّام دفعةً إلى sitemap، ولا أيّ تذكرة/أذكار جديدة قبل إغلاق هذه التذكرة.
