# MOON-CITY-TODAY-ROUTE-STRUCTURE-ADD-1 — PRE-PUSH REPORT

**التاريخ:** 2026-06-21 · **الفرع:** main (محليّ فقط، **بلا commit وبلا push**) · فوق `70b1613` المنشور.
**الرسالة المقترحة:** `feat(moon): MOON-CITY-TODAY-ROUTE-STRUCTURE-ADD-1 — add today moon phase routes for city pages using legacy today content`

---

## 1) ما الذي تم تنفيذه

تفعيل صفحة اليوم المتداخلة `/moon/{country}/{city}/today` كـ **البديل البنيويّ** للرابط القديم
`/moon-today-in-{city}`، عبر **إعادة استعمال نفس مُصيِّر صفحة اليوم القديم** (آليّة مماثلة للهب
واليوم المؤرّخ المتداخلَين) — لا صفحة/محتوى/تصميم جديد.

- **`server.js`:** `_classifyMoonToday()` (valid/redirect/none) + توجيه 301 للـ mismatch + إضافة
  `(_moonToday.kind === 'valid')` لِـ `_isIndexHtmlRoute`؛ `_MNESTED_TODAY` regex + علم
  `_isMoonNestedToday` + توليفة المطابقة `m = _MNESTED_TODAY` (citySlug=m[2]، بلا إحداثيّات، بلا تاريخ
  → يُصيَّر كصفحة اليوم `isHub:false`)؛ `_getActiveH1Marker` يُعيد `moon-page-h1` لليوم المتداخل؛
  breadcrumb JSON-LD 5 رتب + حقن DOM (5 رتب)؛ توسيع 3 تعبيرات route لِتشمل `/today`؛ إضافة اليوم
  المتداخل لِـ sitemap-cities؛ تحويل روابط «اليوم» داخل الهب (CTA + خليّة التقويم) للمتداخل الجديد.
- **`js/app.js`:** `_moonPathname()` يُطبِّع اليوم المتداخل → `/moon-today-in-{city}`؛ early-return في
  باني الـ breadcrumb لِيشمل اليوم المتداخل (يحفظ DOM المحقون من SSR). `_isMoonPath` + المُفعِّل +
  BFCache يُصنِّفونه `page-moon` دون تغيير (المسار `/moon/...` يقع تلقائيًّا في page-moon).
- **`css/style.css`:** `.bc-item[hidden]{display:none}` — إصلاح تسريب رتب الـ breadcrumb المخفيّة (انظر §3).
- **كاسرات الكاش:** `app.js?v=793` · `style.css?v=481` · `sw.js v453`.
- **`index.html`:** لا تغيير بنيويّ (إعادة استعمال خانات الـ breadcrumb القائمة) — كاسرات الكاش فقط.

---

## 2) أمثلة الروابط التي أصبحت 200

`/moon/saudi-arabia/riyadh/today` · `/en/moon/saudi-arabia/riyadh/today` ·
`/moon/united-states/new-york/today` · `/fr/moon/saudi-arabia/jeddah/today` — كلّها **200 + `#page-moon`**.

---

## 3) هل يعرض اليوم المتداخل نفس محتوى `/moon-today-in-{city}`؟ — نعم ✅

مؤكَّد آليًّا 1:1 (3 مدن/لغات):

| العنصر | `/moon/saudi-arabia/riyadh/today` | `/moon-today-in-riyadh` |
|---|---|---|
| الصفحة النشطة | `#page-moon` | `#page-moon` |
| `<title>` | حالة القمر اليوم في الرياض \| طور القمر والإضاءة والعمر | **مطابق** |
| `#moon-page-h1` | 🌙 حالة القمر اليوم في الرياض | **مطابق** |
| جسم المحتوى | `#moon-city-answer` (الجسم القديم) | **مطابق** |
| عناصر مخصّصة (`page-moon-day`/…) | **0** | — |

**ملاحظة §3 (إصلاح ضمن النطاق):** خانتا السنة/الشهر المخفيّتان في الـ breadcrumb كانتا تتسرّبان بصريًّا
(رتبة السنة تحمل نص «—») بسبب أنّ `.bc-item{display:flex}` يتغلّب على `[hidden]{display:none}` —
وهي علّة سابقة من `70b1613` تظهر على الهب المتداخل أيضًا. أضفت `.bc-item[hidden]{display:none}` فصار
الـ breadcrumb المرئيّ يطابق الـ JSON-LD على اليوم والهب معًا (الهب صار 4 رتب نظيفة، اليوم 5 رتب نظيفة).

---

## 4) الفروقات المتبقّية (المسموحة فقط)

1. **route الجديد** `/moon/{country}/{city}/today`.
2. **canonical ذاتيّ** → الرابط المتداخل الجديد.
3. **hreflang** (10 لغات + x-default) → الرابط المتداخل الجديد (بادئة اللغة محفوظة).
4. **breadcrumb 5 مستويات** DOM≡JSON-LD: الرئيسية › حالة القمر (/moon) › {Country} (/moon/{c}) ›
   {City} (رابط /moon/{c}/{city}) › اليوم (حاليّ، بلا رابط).

لا فرق محتوى آخر.

---

## 5) هل تم عمل redirect للقديم؟ — **لا** · حالة `/moon-today-in-{city}`

لا تحويل من القديم. `/moon-today-in-riyadh` يبقى **200** (مؤكَّد). سيُعالَج التنظيف/التحويل لاحقًا في
`MOON-LEGACY-ROUTES-CLEANUP-BEFORE-LAUNCH`.

> Legacy today routes are left unchanged intentionally because the site is not officially launched yet.
> Final redirect/noindex/sitemap cleanup will be handled in MOON-LEGACY-ROUTES-CLEANUP-BEFORE-LAUNCH.

---

## 6) هل تم تحديث روابط الصفحات الجديدة إلى today الجديد؟ — نعم (داخل الصفحات الجديدة فقط)

- **الهب المتداخل `/moon/{country}/{city}`:** زرّ «عرض حالة القمر اليوم» (CTA) + خليّة «اليوم» في تقويم
  الهب صارا يشيران إلى `/moon/{country}/{city}/today` (بحارس `isNested` + الرجوع للقديم كـ fallback).
  لم يبقَ أيّ رابط `/moon-today-in-riyadh` في الهب.
- صفحة الدولة `/moon/{country}`: بطاقات المدن تشير للهب المتداخل (ليست روابط «اليوم») — دون تغيير.
- صفحات السنة/الشهر: لا تحوي روابط «اليوم» — دون تغيير.
- **خارج النطاق (موثّق):** على صفحات اليوم/المؤرّخة توجد ودجة «مدن شهيرة» تشير إلى
  `/moon-today-in-{مدن أخرى}` — وهي مكوّن مُشترَك مع الصفحات القديمة (مُصيِّر واحد)؛ تركتها كما هي
  (القديم يعمل 200)، وتُعالَج في تذكرة التنظيف قبل الإطلاق.

---

## 7) H1 / title / meta / canonical

- H1 واحد `#moon-page-h1` = «🌙 حالة القمر اليوم في الرياض» (مطابق للقديم).
- `<title>` + meta description = نفس صفحة اليوم القديمة (نية مطابقة).
- canonical ذاتيّ للرابط المتداخل الجديد · index (لا noindex) للمدن curated.

## 8) Breadcrumb DOM و JSON-LD · hreflang

- **DOM ≡ JSON-LD** (5 رتب، AR + EN): مؤكَّد عبر curl + المتصفّح:
  AR `الرئيسية | حالة القمر | المملكة العربية السعودية | الرياض | اليوم` ·
  EN `Home | Moon Phase | Saudi Arabia | Riyadh | Today`.
- روابط الرتب: المدينة → `/moon/{c}/{city}` (رابط) · الدولة → `/moon/{c}` · حالة القمر → `/moon` ·
  «اليوم» = الرتبة الحاليّة (بلا رابط).
- hreflang: 10 لغات + x-default، كلّها للرابط المتداخل الجديد (ar→`…/today`, en→`/en/…/today`).

## 9) Sitemap — هل أُضيف today الجديد؟ وحالة legacy today

- نعم: `/moon/{country}/{city}/today` أُضيف لِـ sitemap-cities للمدن curated (مؤكَّد:
  `/moon/saudi-arabia/medina/today` موجود).
- legacy `/moon-today-in-{city}` **يبقى** في sitemap بجانبه — **بلا تنظيف واسع** هذه المرحلة (آمن ومحدود).

---

## 10) نتائج guardrails + 11) نتائج الانحدار

| السويت | النتيجة |
|---|---|
| `_smoke_moon_city_today_route_structure_add_1` (جديد) | **53/53 ✓** |
| `_smoke_moon_routes_structure_guardrails_1` (كتلة today جديدة + 404 today/test) | **106/106 ✓** |
| `_smoke_moon_city_hub_route_structure_add_1` | 33/33 ✓ |
| `_smoke_moon_city_year_route_structure_add_1` (today=200 + sitemap-today موجود) | 74/74 ✓ |
| `_smoke_moon_city_month_route_structure_add_1` (نفس) | 69/69 ✓ |
| `_smoke_moon_city_day_route_structure_add_1` (نفس) | 62/62 ✓ |
| `_smoke_moon_country_pages_ssr_add_1` (today=200) | 58/58 ✓ |
| `_smoke_moon_spa_router_…` · `…_today_content_move…` | 37/37 · 35/35 ✓ |
| `…_phase_calendar_calculation_fix_1` · `…_meeus49_fix_1` | 212/212 · 45/45 ✓ |
| **إجمالي سويتات القمر العشر + الجديدة (11)** | **784 فحصًا · 0 إخفاق** |
| الانحدار غير-القمريّ: countdown-SEO · hijri-tz · fr_de-search · es_latam-search | 424/424 · all-pass · 22/22 · 22/22 ✓ |
| `node --check` server.js / app.js / moon.js | OK ✓ |

**تحقّق المتصفّح (سطح المكتب 1809px + جوّال 375px):** `#page-moon` نشط · H1 واحد · **breadcrumb 5 رتب نظيفة
DOM≡JSON-LD (بلا «—» مُتسرّبة)** · canonical ذاتيّ · جسم `#moon-city-answer` القديم · **0 أخطاء console** ·
لا overflow أفقيّ. (والهب المتداخل صار 4 رتب نظيفة بعد إصلاح §3.)

---

## 12) تأكيدات

- **`/moon/{country}/{city}/today/test` = 404** · **`/Today` أحرف كبيرة = 404** · dash forms = 404. ✓
- mismatch (مدينة في دولة خاطئة) = **301** للصحيح (+حفظ اللغة). ✓
- البنية المتداخلة سليمة: `/moon` · `/moon/{c}` · `/moon/{c}/{city}` · `/{yyyy}` · `/{yyyy}/{mm}` ·
  `/{yyyy}/{mm}/{dd}` = 200؛ والقديم `/moon-in-{city}` = 301، `/moon-in-{city}/{date}` = 200. ✓
- **`js/moon.js` بلا مساس (git diff فارغ) · Meeus 49 ثابت** (15 يونيو=المحاق · 30 يونيو=البدر). ✓
- لم يُعمل commit ولا push · لا تنظيف للروابط القديمة · لا تطوير محتوى `/moon` · لا redirect من القديم ·
  لا تذكرة أخرى ولا أذكار.

---

## قائمة الملفّات المعدَّلة (12 معدَّل + 1 جديد)

```
M  server.js          — route classifier + flags + breadcrumb(JSON-LD+DOM 5 rungs) + sitemap + hub today links + _MOON_TODAY_CRUMB_L10N
M  js/app.js          — _moonPathname nested-today → flat today + breadcrumb early-return
M  css/style.css      — .bc-item[hidden]{display:none} (breadcrumb hidden-rung fix)
M  index.html         — cache busters (app.js?v=793, style.css?v=481)
M  sw.js              — CACHE_VERSION v453
M  reports/moon-routes-structure-contract-1.md  — contract: today route LIVE + smoke entry
M  scripts/_smoke_moon_routes_structure_guardrails_1.mjs     — today block + today/test=404
M  scripts/_smoke_moon_city_hub_route_structure_add_1.mjs    — today/test in 404 list
M  scripts/_smoke_moon_city_year_route_structure_add_1.mjs   — today=200 + sitemap-today present
M  scripts/_smoke_moon_city_month_route_structure_add_1.mjs  — (same)
M  scripts/_smoke_moon_city_day_route_structure_add_1.mjs    — (same)
M  scripts/_smoke_moon_country_pages_ssr_add_1.mjs           — today=200
?? scripts/_smoke_moon_city_today_route_structure_add_1.mjs  — NEW dedicated today smoke (53 checks)
```

**رسالة commit المقترحة:**
`feat(moon): MOON-CITY-TODAY-ROUTE-STRUCTURE-ADD-1 — add today moon phase routes for city pages using legacy today content`

⏸️ **بانتظار اعتمادك للدفع — لم يُعمل commit ولا push.**
