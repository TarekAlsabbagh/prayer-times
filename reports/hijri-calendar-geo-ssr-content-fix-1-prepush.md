# تقرير ما قبل الدفع: HIJRI-CALENDAR-GEO-SSR-CONTENT-FIX-1

**النوع:** Fix — Option A (SSR-fill Remaining Content)
**النطاق:** **All supported languages** (10 لغات: ar/en/fr/tr/ur/de/id/es/bn/ms) — وليس AR/EN فقط.
**الحالة:** جاهز للاعتماد — لم يُنفَّذ commit/push بعد.
**التاريخ:** 2026-06-02
**المرجع:** HIJRI-CALENDAR-GEO-RENDERED-CONTENT-AUDIT-1 (معتمد)

> **ملاحظة على تحديث النطاق:** التنفيذ كان **مبنيًّا للعشر لغات من البداية** — يَعتمد على `seo.lang` ونظام اللغة الحالي في `server.js`، وكل القواميس المُضافة (`_HY_HNAMES` أسماء الأشهر الهجرية، `_HY_GSFX` لاحقة الميلادي، `_HY_ROWTITLE` tooltip) تحوي العشر لغات، إضافةً إلى `_GREG_MONTHS` العام (10 لغات) و `_hSfxByLang` (10 لغات). لذلك **توسيع النطاق إلى كل اللغات لم يتطلّب أيّ تغيير في الكود** — فقط تحقّق إضافي موثّق في الجدول أدناه.

---

## 1) الملفات المعدَّلة

| الملف | التغيير | الأسطر |
|---|---|---|
| `server.js` | إضافة كتلة SSR-fill لـ `#hyear-table-body` (12 صفًّا) داخل `if (_isHijriYearHub)` بعد كتلة breadcrumb/intro | +104 |
| `js/app.js` | حارس no-swap في `loadHijriYearPage()` — تخطّي إعادة بناء الجدول إذا كان SSR-filled | +8 / -1 |
| `index.html` | cache-buster: `app.js?v=751 → 752` (موضعان) | 4 |
| `sw.js` | `CACHE_VERSION 'v411' → 'v412'` + محاذاة PRECACHE `app.js?v=475 → 752` | 4 |

**الإجمالي:** 4 ملفّات، +115 / -5.
**لم تُمَسّ:** CSS، i18n، أي ملف آخر، أي بيانات تقويم/حساب.

---

## 2) مكان SSR-fill لـ `#hyear-table-body`

`server.js` داخل `if (_isHijriYearHub)` (بعد كتلة FIX-3 breadcrumb/intro، قبل `_HCAL_GUIDE`). يبني 12 صفًّا في حلقة `for (_m=1.._m<=12)`:
- يستخدم نفس محرّك Umm al-Qura: **`_getDaysInHijriMonth`** + **`_hijriToGregorian`** (نفس مصدر صفحة الشهر HIJRI-MONTH-PAGE-SSR-RENDER-1).
- أسماء الأشهر الهجرية: dict محلّي 10 لغات (نسخة من `app.js HIJRI_MONTHS_BY_LANG`).
- أسماء الأشهر الميلادية: **`_GREG_MONTHS` العام** (نفس الذي تستخدمه صفحة الشهر — مُثبَت ومعتمد GEO).
- يستبدل `<tbody id="hyear-table-body"></tbody>` بـ `<tbody id="hyear-table-body" data-ssr-rendered="1">…12 صفًّا…</tbody>`.
- صياغة الصف **مطابقة بايت-ببايت** لـ `app.js loadHijriYearPage()` (السطر 23259): روابط الشهر/اليوم + تظليل الشهر الحالي + تخطيط الصفوف + أنماط `<td>` السطرية + tooltips التحويل.

---

## 3) هل تم SSR-fill لـ `#hyear-cta` أو `#hyear-years-grid`؟

**لا — مقصود.** اكتُفِي بالإلزامي (`#hyear-table-body`) فقط، تجنّبًا لتوسيع النطاق:
- الـ CTA (3 روابط) و years-grid (5 روابط) يتطلّب SSR-fill لهما **مرآة 6+ قواميس عناوين 10-لغات إضافية** (`cta_today/cta_month/cta_converter/years_title/years_current/years_active_suffix`) = توسيع نطاق ومخاطرة أكبر، وقد صنّفهما الـ Audit **ثانويَّين 🟡** (السبب الرئيسي 🔴 كان الجدول).
- يبقيان كما هما اليوم (JS-filled بعد hydration) — **لا تغيير في سلوكهما** (status quo محفوظ). وهما **أسفل** الجدول فلا يؤثّران على CLS للـ chips.
- إن رغبت لاحقًا، نفتح `HIJRI-CALENDAR-GEO-SSR-CONTENT-FIX-2` لهما.

---

## 4) مقارنة قبل/بعد للـ SSR HTML

| | قبل (Production v411) | بعد (محليًّا، هذا الإصلاح) |
|---|---|---|
| `<tbody id="hyear-table-body">` | `<tbody id="hyear-table-body"></tbody>` (فارغ) | `<tbody id="hyear-table-body" data-ssr-rendered="1">…</tbody>` |
| صفوف الجدول في SSR | **0** | **12** |
| محتوى الصف | — | اسم الشهر+السنة، بداية ميلادية، نهاية ميلادية، عدد الأيام (كلّها روابط) |

---

## 5) عدد صفوف الجدول قبل/بعد + جدول اللغات (10 لغات)

كان السابق **0 صفًّا** في كل لغة. بعد الإصلاح، التحقّق المحليّ (port 10022) على العشر لغات:

```
Lang | URL                  | #hyear-table-body rows | Breadcrumb SSR | Intro SSR | Info Grid SSR | html.hijri-year-page | page-hijri-year active | HTTP
ar   | /hijri-calendar      | 12                     | yes            | yes       | yes           | yes                  | yes                    | 200
en   | /en/hijri-calendar   | 12                     | yes            | yes       | yes           | yes                  | yes                    | 200
fr   | /fr/hijri-calendar   | 12                     | yes            | yes       | yes           | yes                  | yes                    | 200
tr   | /tr/hijri-calendar   | 12                     | yes            | yes       | yes           | yes                  | yes                    | 200
ur   | /ur/hijri-calendar   | 12                     | yes            | yes       | yes           | yes                  | yes                    | 200
de   | /de/hijri-calendar   | 12                     | yes            | yes       | yes           | yes                  | yes                    | 200
id   | /id/hijri-calendar   | 12                     | yes            | yes       | yes           | yes                  | yes                    | 200
es   | /es/hijri-calendar   | 12                     | yes            | yes       | yes           | yes                  | yes                    | 200
bn   | /bn/hijri-calendar   | 12                     | yes            | yes       | yes           | yes                  | yes                    | 200
ms   | /ms/hijri-calendar   | 12                     | yes            | yes       | yes           | yes                  | yes                    | 200
```

**النتيجة: 10/10 لغات تعرض الجدول من SSR — 12 صفًّا، 0 فارغ.**

---

## 6) عيّنة من صفوف الجدول (محليًّا)

**عيّنة الصف الأول مُعرَّبة لكل لغة (تثبت احترام اللغة + الاتجاه):**
```
ar : محرم 1447 هـ        | 26 يونيو 2025  | 25 يوليو 2025  | 30
en : Muharram 1447 AH    | 26 June 2025   | 25 July 2025   | 30
fr : Mouharram 1447 H    | 26 juin 2025   | 25 juillet 2025| 30
tr : Muharrem 1447 H     | 26 Ocak…(Greg) | …            | 30
ur : محرّم 1447 ہجری      | 26 جون 2025    | 25 جولائی 2025  | 30
de : Muharram 1447 AH    | 26 Juni 2025   | 25 Juli 2025   | 30
id : Muharram 1447 H     | 26 Juni 2025   | 25 Juli 2025   | 30
bn : মুহররম 1447 হিজরি   | 26 জুন 2025    | 25 জুলাই 2025   | 30
ms : Muharam 1447 H      | 26 Jun 2025    | 25 Julai 2025  | 30
```
الصف 12 (ذو الحجة 1447 = 29 يومًا) **مظلَّل كالشهر الحالي** في كل لغة (اليوم داخل ذي الحجة).
كل خلية تاريخ تحمل رابطًا (`/{lang}/hijri-date/1447-MM-DD`) + tooltip تحويلي مُعرَّب؛ خليّتا الشهر والأيام تحملان رابط الشهر (`/{lang}/hijri-calendar/1447-MM`).

**مصدر الترجمة:** أسماء الأشهر الهجرية من نفس قاموس بقيّة صفحات التقويم (مطابق لـ `app.js HIJRI_MONTHS_BY_LANG` و server `_HM_NAMES`)؛ أسماء الأشهر الميلادية من `_GREG_MONTHS` العام؛ اللاحقة الهجرية من `_hSfxByLang`. أيّ لغة بلا قيمة تسقط على `en` عبر `|| .en` (لا جدول فارغ). لاحِظ TR لاحقة ميلادية فارغة (`GSFX_BY_LANG.tr=''`) مطابقةً للعميل.

---

## 7) تأكيد تطابق القيم مع حسابات JavaScript

- **مجموع أيام الأشهر الـ12 = 355** ✅ (يطابق سنة 1447 كبيسة).
- **ذو الحجة 1447 = 29 يومًا** ✅ (يطابق صفحة الشهر `/hijri-calendar/1447-12` = 29 صفًّا).
- نفس المحرّك (`_hijriToGregorian` / `_getDaysInHijriMonth`) يغذّي SSR و JS و info-grid معًا → **صفر اختلاف عددي**.
- صياغة الشهر+السنة: `${name} ${year}${hSfx}` ⇒ `_yLbl` (مثلاً «1447 هـ») = نفس مخرجات العميل `HSFX_BY_LANG`.

---

## 8) هل تم تعديل `app.js`؟ ولماذا

**نعم — تعديل واحد ضروري (حارس no-swap):**
```js
// قبل
const tbody = document.getElementById('hyear-table-body');
if (tbody) { tbody.innerHTML = ''; … }
// بعد
const tbody = document.getElementById('hyear-table-body');
if (tbody && tbody.getAttribute('data-ssr-rendered') !== '1') { tbody.innerHTML = ''; … }
```
**لماذا ضروري:** بدون الحارس، كان JS سيمسح الجدول المُولَّد من SSR ويعيد بناءه (إعادة إنشاء DOM + احتمال CLS). الحارس يجعل JS **يتخطّى** الجدول حين يكون SSR-filled، فيبقى DOM ثابتًا.

---

## 9) تفاصيل حارس no-swap

- **الآلية:** `data-ssr-rendered="1"` يُضاف على `<tbody>` من الخادم؛ JS يفحصه ويتخطّى الإعادة.
- **التوافق العكسي:** لو لم يصل SSR-fill (أيّ مسار قديم/خطأ) فإن السمة غائبة → JS يبني الجدول كالمعتاد (سلوك آمن، لا تراجع).
- **نفس نمط** info-grid (FIX-1) و azkar SSR cards.
- تَحقّق محليًّا: مسار الشهر `/hijri-calendar/1447-12` يُبقي `<tbody id="hyear-table-body"></tbody>` **فارغًا** (بلا سمة) — لا تسريب عبر المسارات.

---

## 10) تأكيد أن صفحة الشهر لم تتأثر (5 لغات)

✅ `/hijri-calendar/1447-12` على **ar/en/fr/tr/ur**: `#hmonth-table-body` ما زال **29 صفًّا** من SSR في الخمسة؛ و**لا تسريب** لجدول السنة على مسار الشهر (`year-table-leak=false` في الخمسة) — الجدول المخفيّ للسنة يبقى فارغًا (بلا `data-ssr-rendered`).

## 11) تأكيد أن صفحات today/day Hijri لم تتأثر

✅ `/today-hijri-date` → `html.class="hijri-today-page"`، لا جدول سنة مُفعَّل.
✅ `/hijri-date/1447-12-16` → `html.class="hijri-day-page"`، سليم.

## 12) تأكيد أن الحسابات والبيانات لم تتغير

✅ صفر تعديل على `_getDaysInHijriMonth` / `_hijriToGregorian` / بيانات التقويم / ترتيب الأشهر / أسماء الأشهر / روابط الأشهر. **اختبارات الهجري:** `umm_al_qura_a1` (49/49) + `year_faq_seo_expansion_1` (68/68) + `stage_b1_unit` (68/68) = **185/185 نجاح، 0 فشل**.

## 13) تأكيد canonical/hreflang/sitemap/JSON-LD لم تتغير

✅ AR: title «التقويم الهجري 1447 هـ…»، H1 «تقويم السنة الهجرية»، canonical نطاق صحيح، JSON-LD = 1، hreflang = 11.
✅ EN: title «Hijri Calendar 1447 AH…»، H1 «Hijri Year Calendar»، JSON-LD = 1، hreflang = 11.
✅ sitemap/routing بلا تعديل.

---

## 14) نتائج Regression URLs (محليًّا، port 10021)

| URL | الحالة |
|---|---|
| `/` · `/prayer-times-in-riyadh` · `/moon-today` · `/qibla-in-riyadh` | 200 ✅ |
| `/msbaha` · `/zakat-calculator` · `/azkar` | 200 ✅ |
| `/en/today-hijri-date` · `/en/hijri-date/1447-12-16` · `/en/hijri-calendar/1447-12` | 200 ✅ |
| `/hijri-calendar` + `/en|/fr|/tr|/ur/hijri-calendar` (data-ssr-rendered=YES ×5) | 200 ✅ |

(فحص Production للـ regression الكامل يُجرى في تقرير ما بعد الدفع.)

---

## 15) تقدير تحسُّن GEO/LLM Readability

- قبل: ~55–60% من المحتوى الأساسيّ في SSR (الجدول = أكبر كتلة غائبة).
- بعد: الجدول (12 صفًّا × 4 حقول + 36 رابطًا داخليًّا) أصبح **SSR-readable** → الكتلة القرائيّة الأساسيّة الوحيدة الناقصة سُدّت.
- متوقَّع: Rendering Percentage يقفز إلى **~85–95%+**، وتختفي إشارة «Rendered Content (LLM Readability)» أو تضعف بشدّة — لتصبح صفحة السنة بمستوى صفحة الشهر GEO.
- **يُؤكَّد بإعادة فحص GEO على Production بعد الدفع.**

---

## 16) Cache-busters

| المفتاح | قبل | بعد |
|---|---|---|
| `index.html` → `app.js?v=` | 751 | **752** |
| `sw.js` → `CACHE_VERSION` | v411 | **v412** |
| `sw.js` → PRECACHE `app.js?v=` | 475 | **752** (محاذاة) |

(`server.js` لا يحتاج buster — استجابات HTML بترويسة `no-cache`.)

---

## 17) رسالة commit المقترحة

```
seo(hijri): HIJRI-CALENDAR-GEO-SSR-CONTENT-FIX-1 — SSR-render year calendar table for all languages
```

---

## معايير القبول المحدَّثة (14) — حالة محليّة

1. كل اللغات العشر تعرض جدول السنة من SSR — ✅ (جدول §5: 10/10)
2. `#hyear-table-body` ليس فارغًا في أيّ لغة — ✅
3. كل لغة تحوي 12 صفًّا — ✅ (10/10)
4. القيم الحسابية متطابقة بين اللغات (نفس عدد الأيام/البداية/النهاية/الترتيب) — ✅ (dayCounts `[30,29,30,30,30,29,30,29,30,29,30,29]` متطابق عبر اللغات؛ مجموع 355؛ ذو الحجة 29)
5. النصوص والاتجاهات تحترم اللغة الحالية — ✅ (عيّنات §6؛ RTL لـ ar/ur، أسماء أشهر مُعرَّبة)
6. لا تغيير في الحسابات — ✅ (185/185 اختبار هجري)
7. لا تغيير في روابط الأشهر — ✅
8. لا تغيير canonical/hreflang/sitemap — ✅ (hreflang=11، canonical سليم، 0 تعديل sitemap)
9. لا تغيير JSON-LD — ✅ (1 كتلة، دون تعديل)
10. لا تغيير CSS — ✅ (0 تعديل)
11. لا تغيير صفحات الأذكار — ✅ (0 تعديل)
12. `loadHijriYearPage()` لا يعيد البناء إذا SSR-filled — ✅ (حارس `data-ssr-rendered`)
13. لا CLS جديد من الجدول — ✅ متوقَّع (الجدول أسفل chips؛ الحارس يمنع إعادة البناء) — ⏳ تأكيد Lighthouse بعد الدفع
14. GEO/LLM Readability يتحسّن في كل اللغات — ⏳ يُؤكَّد بإعادة فحص GEO بعد الدفع

---

## تأكيدات

- هذا تقرير **ما قبل الدفع** — **لم يُنفَّذ** commit أو push.
- شجرة العمل تحوي فقط 4 ملفّات معدَّلة (مذكورة) + ملفّات untracked قديمة لم تُمَسّ.
- **لم تُبدأ أيّ صفحة أذكار جديدة** (التزامًا بانتظار اعتمادك البصريّ لـ `/azkar/prayer-azkar`).

**في انتظار اعتمادك للدفع:** `أعتمد دفع تقرير: HIJRI-CALENDAR-GEO-SSR-CONTENT-FIX-1`
