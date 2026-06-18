# PRE-PUSH REPORT — MOON-CITY-HUB-ROUTE-STRUCTURE-ADD-1

**التاريخ:** 2026-06-18. **الحالة:** نُفِّذ محليًّا بالكامل، مُختبَر، **لم يُدفَع** — بانتظار اعتمادك للدفع.
**النوع:** تذكرة **تأسيس بنية فقط** (Phase 4). لا تطوير محتوى، لا تغيير محرّك Meeus 49، لا صفحات أذكار.
**رسالة الـ commit المقترحة (commit واحد):**
`feat(moon): MOON-CITY-HUB-ROUTE-STRUCTURE-ADD-1 — add country/city moon hub routes while preserving legacy today and calendar routes`

---

## 0) الهدف (كما طلبتَ)

تفعيل `/moon/{country}/{city}` (مثل `/moon/saudi-arabia/riyadh`) كـ**البديل البنيويّ الجديد** لِهب المدينة القديم `/moon-in-{city}`:
- `/moon/{country}/{city}` = **200**، **نفس محتوى** `/moon-in-{city}` تمامًا (لا تطوير).
- `/moon-in-{city}` = **301 → `/moon/{country}/{city}`** (+لغات).
- canonical الهب = ذاتيّ على الرابط المتداخل؛ الهب القديم لم يَعُد 200.
- breadcrumb 4 مستويات: «الرئيسية > حالة القمر > {الدولة} > {المدينة}» (DOM ≡ JSON-LD).
- اليوم/الشهر/التاريخ المتداخلة (`…/today`، `…/{YYYY-MM}`، `…/{YYYY-MM-DD}`) **تبقى 404 نظيفة**.
- `/moon`، `/moon/{country}`، `/moon-today-in-{city}`، `/moon-in-{city}/{YYYY-MM[-DD]}`، ومحرّك Meeus — **دون مساس**.

---

## 1) الملفّات المعدَّلة (7 متتبَّعة + 1 جديد) — لا شيء من الـ652 ملفّ غير المتتبَّع

| الملفّ | التغيير |
|---|---|
| `server.js` (+217/-…) | `_classifyNestedMoonHub()` (تحقّق دولة+مدينة+تطابق) · فرع `_isMoonNestedHub` داخل `buildSeoForPath` (نفس عارض الهب + canonical ذاتيّ + breadcrumb 4 مستويات) · إضافة nested لـ`_isIndexHtmlRoute` + 301 mismatch · 301 الهب القديم→المتداخل (خطوة واحدة) · `_isMoonCityPageSsr` + بوّابة بذرة `__PRAYER_CITY__` + `_ssrCitySlug` · حقن SSR لـbreadcrumb الـ4 مستويات · فرع `_getActiveH1Marker` للهب المتداخل · sitemap (الهب المتداخل بدل القديم) · روابط صفحة الدولة → المتداخل |
| `js/app.js` (+48) | `_moonPathname()` يُطبِّع `/moon/{country}/{city}` → `/moon-in-{city}` لِـ4 مُحلِّلات قمر · حارس breadcrumb (يترك DOM المحقون من SSR) · `_initialSyncHydrate` يبذر من البذرة على المتداخل (لا FOUC) |
| `index.html` (+11) | عنصرا breadcrumb جديدان `bc-moon-country-li`/`-sep` (مخفيّان) + رفع `app.js?v=786→787` (موضعان) |
| `sw.js` (+4) | `CACHE_VERSION v446→v447` |
| `reports/moon-routes-structure-contract-1.md` (+29/-…) | تحديث العقد (Phase 4) |
| `scripts/_smoke_moon_routes_structure_guardrails_1.mjs` (+69/-…) | تحديث PART D/E/F للعقد الجديد + إصلاح قارئ HTTP لـUTF-8 (`Buffer.concat`) |
| `scripts/_smoke_moon_country_pages_ssr_add_1.mjs` (+15/-…) | تحديث 3 توقّعات قديمة (روابط متداخلة + المتداخل 200) |
| `scripts/_smoke_moon_city_hub_route_structure_add_1.mjs` (جديد) | اختبار مخصّص — 33 تحقّق |

`git status --short --untracked-files=no` يُظهِر **حصريًّا** هذه السبعة + الجديد. الـ652 ملفًّا غير المتتبَّع **لن تدخل** الـcommit.

---

## 2) المعماريّة (كيف يُخدَم المتداخل بِنفس محتوى الهب القديم)

**السيرفر:** `/moon/{country}/{city}` يُغذّي **نفس** عارض الهب الموجود (`#page-moon` في `index.html`) عبر:
- `buildSeoForPath`: عند مطابقة الشكل المتداخل + التحقّق، يُضبَط `citySlug` = المقطع الثاني، `_isMoonHubPage=true`، canonical = `origin+p` (ذاتيّ تلقائيًّا)، وتُبنى breadcrumb 4 مستويات (Moon Phase + اسم الدولة المُعرَّب يطابقان صفحة `/moon/{country}`).
- نفس سلسلة العنوان/الوصف/H1/FAQ/`moonCity`/Meeus — بلا تكرار منطق.

**العميل (`js/app.js`):** `_moonPathname()` يُطبِّع المسار المتداخل إلى `/moon-in-{city}` لِـ`_moonCitySlugFromPath`/`_moonIsHubPath`/`_moonCoordsFromPath`/`_moonDateFromPath` → كلّ منطق الهب يعمل كما لو كان `/moon-in-{city}`. وحارس صغير في باني breadcrumb يترك الـDOM الـ4 مستويات المحقون من SSR كما هو (لا يدوسه بـ3 مستويات).

> **شفافيّة:** هذه التذكرة لمست `js/app.js` + `index.html` (وبالتالي رفعنا cache-busters). هذا **ضروريّ بنيويًّا** لا «تطوير محتوى»: العميل يقرأ `window.location.pathname` لاستخراج المدينة، والشكل المتداخل كان يُعيد `null` → الصفحة تنكسر بعد الـhydration. أيضًا breadcrumb الهب يُرسَم client-side، فبدون عنصر الدولة + الحارس لا يتحقّق DOM≡JSON-LD بعد الـhydration. لا تغيير في نصوص الواجهة، فقط البنية/الروابط.

---

## 3) التحقّق من الـ200/301/404 (12 حالة — كلّها مُثبَتة محليًّا)

| الرابط | النتيجة | الوجهة |
|---|---|---|
| `/moon/saudi-arabia/riyadh` · `/en/…` | **200** | — |
| `/moon-in-riyadh` · `/en/moon-in-riyadh` | **301** | `/moon/saudi-arabia/riyadh` · `/en/…` (لغة محفوظة) |
| `/moon/united-states/riyadh` (مدينة في دولة خاطئة) | **301** | `/moon/saudi-arabia/riyadh` |
| `/moon/saudi-arabia/riyadh/today` · `/{YYYY-MM}` · `/{YYYY-MM-DD}` · `/en/…/today` | **404** نظيف (~2KB، ليست shell) | — |
| `/moon/saudi-arabia/notacity` (مدينة مجهولة) | **404** | — |
| `/moon/zzz-not-a-country/riyadh` (دولة مجهولة) | **404** | — |
| `/moon/saudi-arabia` (صفحة الدولة) | **200** (دون مساس) | — |
| `/moon-today-in-riyadh` · `/moon-in-riyadh/2026-06` · `/2026-06-17` | **200** (دون مساس — لم تُهاجَر) | — |

---

## 4) محتوى الصفحة المتداخلة (SSR + بعد الـhydration) — AR + EN

- **page-moon نشط** (ليست footer-only): الجسم ~285KB، 13 قسم قمر (chart/forecast/summary/FAQ/seo).
- **H1 واحد** (أُصلِح من 6→1 — انظر §7): «🌙 تقويم القمر وأطوار الشهر في الرياض، المملكة العربية السعودية».
- **canonical ذاتيّ** على AR (`…/moon/saudi-arabia/riyadh`) وEN (`…/en/moon/saudi-arabia/riyadh`).
- **hreflang:** 10 لغات + x-default.
- **بذرة `__PRAYER_CITY__`** موجودة بالاسم المُعرَّب (`"name":"الرياض"`).
- **ملخّص محسوب حيّ** (Meeus): هلال متزايد · 14.96% · 3.27 يوم.
- **0 أخطاء console** (مُثبَت في المتصفّح عبر preview).

---

## 5) breadcrumb 4 مستويات — DOM ≡ JSON-LD (مُثبَت AR + EN)

| | AR | EN |
|---|---|---|
| DOM (SSR + بعد hydration) | الرئيسية › **حالة القمر** (→/moon) › **المملكة العربية السعودية** (→/moon/saudi-arabia) › **الرياض** (current) | Home › **Moon Phase** (→/en/moon) › **Saudi Arabia** (→/en/moon/saudi-arabia) › **Riyadh** (current) |
| JSON-LD `BreadcrumbList` | مطابق تمامًا (نفس الأسماء + الروابط) | مطابق تمامًا |

«حالة القمر»/«Moon Phase» = `_MOON_PHASE_CRUMB_L10N` (نفس تسمية صفحة الدولة). اسم الدولة = `_countryNameForLang`. رُنغ المدينة = اسم المدينة المُعرَّب فقط (كما في مواصفتك `> {City}`). بعد الـhydration يُبقي العميل الـ4 مستويات (الحارس).

---

## 6) sitemap (مُثبَت)

- **sitemap-main:** فيه `/moon` و`/moon/{country}` (+/en)؛ ليس فيه `/moon-today`؛ لا إغراق أيّام.
- **sitemap-cities:** فيه الهب المتداخل `/moon/saudi-arabia/medina` (+/en)؛ **خرج** منها الهب القديم `/moon-in-{city}` (0 رابط هب قديم — تحويلة لا تُدرَج)؛ بقي `/moon-today-in-{city}` واليوم القديم `/moon-in-{city}/{date}` (لم يُهاجَرا).

---

## 7) bug حقيقيّ أمسكه الاختبار قبل الدفع — H1=6 → H1=1

عند أوّل تشغيل للـguardrails ظهر أنّ الصفحة المتداخلة فيها **6 وسوم H1** (خطأ SEO). السبب: `_getActiveH1Marker` لم يكن يعرف الشكل المتداخل → لم يُخفَّض H1 الصفحات غير النشطة في الـSPA shell. الإصلاح: فرع جديد يُرجِع `moon-page-h1` للهب المتداخل (مثل `/moon-in-{city}` تمامًا). بعدها H1=1 على AR وEN. (لولا الاختبار لَشُحِن الخطأ.)

---

## 8) نتائج الاختبارات (محليًّا — كلّها خضراء)

| المجموعة | النتيجة |
|---|---|
| `_smoke_moon_routes_structure_guardrails_1.mjs` (محدَّث) | **81/81** ✅ |
| `_smoke_moon_city_hub_route_structure_add_1.mjs` (جديد) | **33/33** ✅ |
| `_smoke_moon_country_pages_ssr_add_1.mjs` (Phase 3 — محدَّث) | **58/58** ✅ |
| countdown smoke (انحدار) | **424/424** ✅ |
| انحدار مستهدف: `/prayer-times-in-*`، `/qibla-in-*`، `/moon-today-in-*`، `/`، صفحة دولة | كلّها 200 + **H1=1** + بذرة سليمة ✅ |
| `node --check server.js` · `node --check js/app.js` | نظيف ✅ |

ملاحظة: حدّثتُ قارئ HTTP في guardrails إلى `Buffer.concat` (نفس إصلاح countdown) لِمنع تذبذب UTF-8 على فحوص العربيّة.

---

## 9) الانحدار — لا مساس بِما هو خارج النطاق

كلّ تعديلاتي على المسارات المشتركة (`_getActiveH1Marker`, `_initialSyncHydrate`, بوّابة البذرة, `_isMoonCityPageSsr`, `_cityRouteMatch`, فرع `buildSeoForPath`) مُسوَّرة بشرط «الشكل المتداخل»؛ للمسارات غير المتداخلة `_isMoonNestedHub=false` و`_moonPathname()` يُرجِع المسار الخام ⇒ **سلوك مطابق للسابق**. مُثبَت: prayer/qibla/moon-today/الدولة/الرئيسية كلّها 200 + H1=1.

محرّك **Meeus 49** (`js/moon.js`) **لم يُمَسّ** — guardrails يؤكّد الرياض يونيو 2026: 15=المحاق · 16=هلال متزايد · 29=أحدب متزايد · 30=البدر.

---

## 10) قرارات اتّخذتُها (للمراجعة)

1. **رُنغ المدينة = اسم المدينة المجرّد** («الرياض»/«Riyadh») حرفيًّا كما في مواصفتك «> {City}» — وليس «القمر في {city}». إن فضّلتَ «القمر في {city}» فهو تعديل سطر واحد.
2. **301 الهب القديم → المتداخل في خطوة واحدة** (حتّى للهب ذي coord-suffix): يُسقِط الإحداثيّات ويذهب للمتداخل مباشرة (لا قفزتان).
3. **mismatch → 301 للصحيح** (اخترتُ 301 على 404 لأنّه أفضل UX، وكلاهما مسموح في مواصفتك «301 أو 404»).
4. **روابط «أهم مراحل»/«مدن أخرى» داخل صفحة الهب نفسها:** تُركت للعميل كما هي (today تبقى today، التاريخ يبقى تاريخ — غير مُهاجَرة). فقط روابط **هب** صفحة الدولة هاجرت (مثالك الصريح).
5. **صفحات اليوم/الشهر/التاريخ القديمة** breadcrumb-ها يشير إلى `/moon-in-{city}` (يقفز 301 للمتداخل) — تُركت دون مساس لأنّك طلبت عدم لمسها؛ القفزة 301 غير ضارّة (deferred-cosmetic).

---

## 11) ما لم أفعله (التزامًا بالنطاق)

- لم أُفعِّل `…/today` ولا `…/{YYYY-MM}` ولا `…/{YYYY-MM-DD}` المتداخلة (تبقى 404).
- لم أطوّر محتوى `/moon` ولا `/moon/{country}`.
- لم ألمس Meeus 49 ولا الصلاة/الهجري/القبلة/الأذكار.
- لم أبدأ أيّ تذكرة أخرى.

---

## 12) خطّة ما بعد الدفع (بعد اعتمادك)

1. الدفع إلى `origin/main` (commit واحد) → انتظار Render (~200-400s).
2. تحقّق إنتاجيّ: `/moon/saudi-arabia/riyadh`=200 + breadcrumb 4 مستويات DOM≡JSON-LD + canonical ذاتيّ + `/moon-in-riyadh`=301 + المتداخلة الأعمق 404 + sitemap + 0 console.
3. تحديث ذاكرة الـroadmap (Phase 4 LIVE).
4. تقرير ما بعد الدفع، ثمّ اعتمادك الرسميّ للإغلاق.

---

### الخلاصة
نُفِّذت البنية المتداخلة `/moon/{country}/{city}` محليًّا بالكامل كبديل بنيويّ للهب القديم — نفس المحتوى، 301 قديم→جديد، breadcrumb 4 مستويات DOM≡JSON-LD (AR+EN)، canonical ذاتيّ، hreflang، sitemap محدَّث، والمتداخل الأعمق 404 نظيف. 7 ملفّات متتبَّعة + اختبار جديد. كلّ الاختبارات خضراء (81+33+58+424) والانحدار نظيف. **لم يُدفَع — بانتظار اعتمادك.**
