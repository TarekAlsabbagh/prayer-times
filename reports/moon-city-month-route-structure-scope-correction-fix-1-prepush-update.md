# MOON-CITY-MONTH-ROUTE-STRUCTURE-SCOPE-CORRECTION-FIX-1 PRE-PUSH UPDATE

**التاريخ:** 2026-06-21 · **الفرع:** main · **الحالة:** مُنفَّذ محليًا فقط — **بلا commit، بلا push** · بانتظار اعتمادك.

> الخيار المعتمَد منك: «أصلِح `_hubPath` بالطريقة الأنظف» + «التقويم يظهر في صفحة الشهر فقط، والهب يبقى كما هو».

---

## 1. ما سبب الخلل بالضبط في `_hubPath`؟

كتلة التقويم الشهريّ في `server.js` (كانت عند السطر ~23050) مُغلّفة داخل `try/catch` **صامت** ينتهي بـ
`} catch (_eCal) { /* silent — fall back to no calendar */ }`. داخلها سطر:

```js
const _pickerActionHref = _hubPath;   // ← _hubPath غير مُعرّف في هذا النطاق
```

`_hubPath` **معرّف فقط** داخل معالِج تحويل 301 منفصل تمامًا (دالّة أخرى، سطر ~28118:
`const _hubPath = '/' + _moonLangPrefix + 'moon-in-' + _moonSlug;`). فهو مرجع **معلّق** متبقٍّ من إعادة هيكلة سابقة (عند إدخال البنية المتداخلة MCHRS). عند تنفيذ كتلة التقويم كان يُرمى:

```
ReferenceError: _hubPath is not defined
    at serveHtmlWithSeo (server.js:23394:43)
```

(أكّدتُه عمليًّا بِتجهيز log مؤقّت في الـ catch، ثم أزلته.) ولأنّ الخطأ يُبتلَع صامتًا، **لم تظهر شبكة التقويم على أيّ صفحة قمر متداخلة منذ إدخال البنية الجديدة** — لا الهب المتداخل ولا صفحة الشهر المتداخلة. كان مُقنَّعًا لأنّ صفحة الشهر القديمة كانت تستخدم قسمًا مخصّصًا `#page-moon-month` له جدوله الخاصّ (`my-day-link`)، فبدت «وكأنّ لها جدولًا». وأكّدتُ على الإنتاج الحيّ أنّ `/moon/saudi-arabia/riyadh` (الهب) بلا تقويم أيضًا — أي أنّه خلل قائم من قبل، لا علاقة له بتذكرة الشهر.

---

## 2. ماذا تم تعديله؟ (تعديلان جراحيّان في `server.js` فقط لهذا الجزء)

1. **إصلاح المرجع المعلّق** — `_pickerActionHref = _hubPath` → `_pickerActionHref = _moonNestBaseHc`.
   `_moonNestBaseHc` مُحسوب أصلًا في نفس الكتلة (`_nestedMoonBaseForSlug(slug, langPrefix)` = `/moon/{country}/{city}` لِلبنية الجديدة، مع fallback `…/moon`). هذا هو الـ base الصحيح لِلبنية المتداخلة. بهذا تكتمل كتلة التقويم بلا رمي.

2. **تقييد التقويم بصفحة الشهر فقط** — بوّابة الكتلة `if (_isMoonHubPageSsr && MoonCalc …)` → `if (_isMoonMonthPageSsr && MoonCalc …)`.
   هكذا تعمل كتلة التقويم **حصرًا** على صفحة الشهر (route type)، فالهب `/moon/{country}/{city}` لا يدخل الكتلة إطلاقًا → يبقى **كما هو تمامًا** بلا تقويم (لا grid ولا compact CTA). الصيغ المسطّحة القديمة (هب/شهر) كلّها 301 الآن، فلا تُخدَم أبدًا → التعديل لا يمسّ أيّ صفحة هب مُقدَّمة فعليًّا.

> هذان التعديلان فوق ما كان مُنفَّذًا أصلًا في الجلسة السابقة (تركيب `m` المتداخل للشهر `_MNESTED_MONTH`، تفعيل `#page-moon` بدل `#page-moon-month`، تجريد القسم المخصّص، الـ canonical الذاتيّ، الـ hreflang، JSON-LD breadcrumb 6 مستويات). وأضفتُ في هذه الجلسة أيضًا **كتلة تعبئة DOM لِـ breadcrumb الشهر** (مرآة كتلة اليوم، تتوقّف عند رتبة الشهر current) لأنّ الرتب المرئيّة كانت لا تزال `hidden` رغم صحّة JSON-LD.

---

## 3. هل صفحة الشهر الجديدة تعرض calendar/table القديم؟

**نعم.** `/moon/saudi-arabia/riyadh/2026/06` = **200**، وتعرض **نفس شبكة التقويم الشهريّة القديمة** بالضبط:

- `.moon-hub-calendar-card` + `.moon-hub-cal-grid` + `.moon-hub-cal-title` موجودة.
- عنوان التقويم: `📆 تقويم أطوار القمر في الرياض — يونيو 2026`.
- شبكة تقويم 7 أعمدة (تقويم حائطيّ) لكامل الشهر، أُنشئت بِمحرّك **Meeus 49** نفسه.
- **روابط الأيّام متداخلة:** `/moon/saudi-arabia/riyadh/2026/06/NN` (29 رابطًا مؤرّخًا) + خليّة «اليوم» (21 يونيو = اليوم) تشير إلى `…/today`، أي 30 خليّة يوم كلّها متداخلة، **0 روابط legacy**.
- المتصفّح (1552px): الشبكة مرئيّة، البطاقة مرئيّة، **لا console errors**، **لا horizontal overflow** (scrollWidth 1544 ≤ 1552)، H1 واحد مرئيّ، `#page-moon` نشط.
- أشهر أخرى (تحقّق التقويم الكامل): يناير 2027 = 31 رابطًا، فبراير 2024 (كبيسة) = 29، ديسمبر 2026 = 31 — كلّها مع `.moon-hub-cal-grid` و0 legacy.

---

## 4. هل hub المدينة بقي صحيحًا؟

**نعم — بلا أيّ تغيير.** `/moon/saudi-arabia/riyadh` (و`/en/…`) = **200** + `#page-moon` نشط، و:

- `moon-hub-cal-grid` = **غائب** ✅
- `moon-hub-calendar-card` = **غائب** ✅
- `moon-hub-cal-compact` (CTA) = **غائب** ✅

لا يظهر تقويم شهر بالخطأ على الهب. ولأنّ الهب كان أصلًا بلا تقويم (الخطأ القديم كان يُسقِط الكتلة)، فإنّ تقييد الكتلة بصفحة الشهر يُبقي مُخرَجات الهب **مطابقة لِما كانت** — صفر تغيير في محتوى الهب. والتمييز الآن واضح: **التقويم في صفحة الشهر فقط** — يوم/today/سنة/دولة كلّها بلا `moon-hub-cal-grid` (تحقّقتُ من الأربع).

---

## 5. هل أزيل محتوى الشهر الجديد السابق (المُصمَّم)؟

**نعم، بالكامل.** عنصر `<… id="page-moon-month">` المخصّص **مُجرَّد** من الـ HTML المُقدَّم (`_stripHtmlForMoonCity`). 0 آثار bespoke: `my-chip` / `my-day-link` / `moon-month-hero` / `moon-month-summary` / `moon-month-calendar` / `my-month-card` — لا شيء منها يظهر. `#page-moon-month` غير نشط، و`#page-moon` هو النشط. العنوان عنوان الشهر القديم: `تقويم القمر في الرياض لشهر يونيو 2026 ومراحل القمر`، وH1 القديم: `🌙 أطوار القمر في الرياض — يونيو 2026`.

---

## 6. ما الفروقات المتبقية بين الجديد والقديم؟

صفحة الشهر المتداخلة = **نفس مُصيِّر `#page-moon` + نفس شبكة التقويم** للصفحة القديمة `/moon-in-{city}/{yyyy-mm}`، والفروقات الوحيدة (المسموحة فقط):

1. **route الجديد** المتداخل.
2. **canonical ذاتيّ** → `…/moon/saudi-arabia/riyadh/2026/06`.
3. **hreflang** للرابط المتداخل (10 لغات + x-default).
4. **breadcrumb 6 مستويات**: الرئيسية › حالة القمر › المملكة العربية السعودية › الرياض › 2026 › يونيو — **DOM ≡ BreadcrumbList JSON-LD** (تحقّق AR + EN). رتبة السنة رابط لصفحة السنة، رتبة الشهر هي الحاليّة (بلا رابط).
5. **روابط أيّام التقويم** تشير إلى البنية الجديدة `/moon/{country}/{city}/{yyyy}/{mm}/{dd}` (وخليّة «اليوم» → `…/today`).

لا فرق آخر: نفس العنوان، نفس H1، نفس جسم `#page-moon`، نفس Meeus.

---

## 7. نتائج الاختبارات (كلّها خضراء)

**اختبار الشهر المُعاد كتابته** `_smoke_moon_city_month_route_structure_add_1.mjs` — **69/69**:
A) 200 + `#page-moon` (لا bespoke) + H1=1 + canonical ذاتيّ (متعدّد الدول/اللغات) · A2) 0 آثار bespoke + `#moon-page-h1` + تعليقات متوازنة · B) breadcrumb 6 مستويات DOM≡JSON-LD (AR+EN) · C) شبكة التقويم القديمة + روابط أيّام متداخلة + 0 legacy + hreflang + العنوان القديم + EN grid · **C2) الهب بلا تقويم (grid/card/compact)** · C3) التقويم لصفحة الشهر فقط (يوم/today/سنة/دولة بلا grid) · D) أشهر أخرى (يناير/فبراير-كبيسة/ديسمبر) · E) 404/301 · F) sitemap · G) روابط أشهر السنة متداخلة · H) legacy 301 + Meeus.

**مجموعة القمر كاملة + الحماية:**

| Suite | النتيجة |
|---|---|
| `_smoke_moon_routes_structure_guardrails_1` (مُحدَّث: الشهر = `page-moon` + grid + الهب بلا تقويم) | ✅ 118/118 |
| `_smoke_moon_city_month_route_structure_add_1` (مُعاد كتابته) | ✅ 69/69 |
| `_smoke_moon_city_hub_route_structure_add_1` | ✅ 33/33 |
| `_smoke_moon_city_today_route_structure_add_1` | ✅ 53/53 |
| `_smoke_moon_city_year_route_structure_add_1` | ✅ 74/74 |
| `_smoke_moon_city_day_route_structure_add_1` (تحديث المرجع المتقاطع لشبكة الشهر) | ✅ 62/62 |
| `_smoke_moon_country_pages_ssr_add_1` | ✅ 58/58 |
| `_smoke_moon_phase_calendar_calculation_fix_1` (PART B → روابط الشبكة) | ✅ 211/211 |
| `_smoke_moon_phase_event_engine_meeus49_fix_1` (carry، بلا تعديل) | ✅ 45/45 |
| `_smoke_moon_today_content_move_to_moon_1` | ✅ 35/35 |
| `_smoke_moon_spa_router_moon_prefix_activation_audit_1` | ✅ 38/38 |

**انحدار غير القمر — أخضر:**

| Suite | النتيجة |
|---|---|
| `_test_search_place_endpoint` | ✅ 659/659 |
| `_test_search_ar` | ✅ 22/22 |
| `_test_home_search_migration` | ✅ 33/33 |
| `_test_moon_general_home_search_box_1` | ✅ 47/47 |
| `_test_qibla_general_home_search_box_1` | ✅ 36/36 |
| `_test_qibla_back_fix_2` | ✅ 12/12 |
| `_smoke_hijri_date_city_timezone_fix_1` | ✅ ALL PASSED |
| `_smoke_hijri_new_year_countdown_seo_content_h1_fix_1` | ✅ 424/424 |

`node --check` نظيف على كلّ ملفّ مُعدَّل (server.js / js/app.js / js/moon.js / sw.js + 4 ملفّات smoke).

---

## 8. قائمة الملفات المعدّلة (9 ملفّات + هذا التقرير — staging صريح بالمسار، بلا أيّ ملفّ ضوضاء)

**الأساس (4):** `server.js` · `js/app.js` · `index.html` · `sw.js`
**التوثيق/العقد (1):** `reports/moon-routes-structure-contract-1.md`
**الاختبارات (4):** `scripts/_smoke_moon_city_month_route_structure_add_1.mjs` (مُعاد كتابته) ·
`scripts/_smoke_moon_routes_structure_guardrails_1.mjs` · `scripts/_smoke_moon_city_day_route_structure_add_1.mjs` ·
`scripts/_smoke_moon_phase_calendar_calculation_fix_1.mjs`
**هذا التقرير (1).**

**Cache busters:** `js/app.js?v=795` (من الجلسة السابقة، بلا تغيير إضافيّ — تغييرات هذه الجلسة كلّها server-side) · `sw.js CACHE_VERSION 'v454' → 'v455'`. حجم diff `server.js`: +127/−23 سطرًا.

**يجب ألّا يدخل الـ commit:** أيّ من ملفّات الضوضاء غير المتتبّعة (`.azkar-shots/`, `.lh-runs/`, `db/places/candidates/*`، إلخ) — مستبعَدة بالكامل من الـ staging.

---

## 9. تأكيد أنّ `js/moon.js` لم يتغيّر

`git diff --stat js/moon.js` = **فارغ**. لم يُلمَس مُطلقًا.

## 10. تأكيد أنّ Meeus 49 لم يتغيّر

محرّك Meeus Ch.49 سليم وغير مُعدَّل. تحقّق من ناتجه عبر الشبكة الجديدة وعبر صفحات اليوم المتداخلة:
**15 يونيو 2026 = المحاق (New Moon)** · **30 يونيو 2026 = البدر (Full Moon)**. (في الشبكة: «المحاق» قرب 15، «بدر» قرب 30؛ وفي صفحات اليوم: 15 تحوي «المحاق»، 30 تحوي «البدر».)

---

## 11. لم أُغيّر / لم أبدأ

- **لم أُغيّر:** `js/moon.js`، Meeus 49، حسابات القمر، `/moon`، صفحة الدولة `/moon/{country}`، **صفحة المدينة hub `/moon/{country}/{city}`** (مؤكَّد بلا تغيير)، صفحة السنة، صفحة اليوم، صفحة today، الصلاة/الهجري/القبلة/الأذكار/discovered.
- **لم أبدأ:** تطوير محتوى `/moon`، أيّ تصميم جديد، أيّ صفحة شهر جديدة، أيّ Hero/FAQ/ملخّص/جدول جديد، أيّ cleanup إضافيّ، أيّ تذكرة جديدة.
- `/moon-in-riyadh/2026-06` يبقى **301 → `/moon/saudi-arabia/riyadh/2026/06`**؛ والمتداخل = **200**؛ والشُّرَط `…/2026-06` + `…/2026/13` + `…/2026/00` = **404**.

---

## 12. رسالة الـ commit المقترَحة

```
fix(moon): MOON-CITY-MONTH-ROUTE-STRUCTURE-SCOPE-CORRECTION-FIX-1 — render new month routes with legacy calendar content
```

## 13. الحالة

**مُنفَّذ محليًّا فقط. لا commit. لا push.** بانتظار مراجعتك واعتمادك للدفع.
