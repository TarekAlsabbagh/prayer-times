# تقرير ما قبل الدفع: IN-PAGE-SIDENAV-CONSISTENCY-ON-STATIC-AND-COUNTRY-PAGES-1

**النوع:** توحيد الشريط الجانبيّ داخل الصفحة (`#sidebar`) عبر **مصدر واحد مشترك** بدل التكرار — جعل صفحات `about/contact/privacy/terms` وصفحات الدول `/prayer-times-in-{country}` ودليل الدول تستخدم **نفس النمط المرجعيّ للصفحة الرئيسية** (أيقونات SVG)، بعد أن كانت على الشريط القديم بالإيموجي.
**الحالة:** لم يُدفع — بانتظار اعتمادك. **القاعدة:** `HEAD = origin/main = fc109f1`.
**النطاق:** الشريط الجانبيّ داخل الصفحة فقط. **لم يُمَسّ:** الـHeader navbar العلويّ · city-context nav · routing · SEO · محتوى الصفحات · الحسابات · discovered admin · countdown · sitemap.

---

## 1) اسم التذكرة
**IN-PAGE-SIDENAV-CONSISTENCY-ON-STATIC-AND-COUNTRY-PAGES-1**

## 2) لم أغيّر الـHeader navbar العلويّ ✅
التعديل محصور في `<aside id="sidebar">` فقط. الـ`.top-header` (الشعار العلويّ + البحث + مبدّل اللغة + الثيم + موقعي/الرئيسية) **غير ممسوس** — مُثبَت في السموك (top-header موجود على كلّ صفحة، 8/8).

## 3) أين كان «مصدر in-page sidenav المختلف» (التكرار القديم)
الشريط الجانبيّ كان **مكرَّرًا inline داخل كلّ قالب** بنُسخ متباينة:
| القالب | الشريط القديم |
|---|---|
| `index.html` (الرئيسية + أدوات SPA) | **النمط الحديث**: أيقونات **SVG** (تعليق «UAT-ICON-2») + `data-page` |
| `legal.html` (about/contact/privacy/terms) | **قديم**: شعار إيموجي 🕌 + عناوين «🕌 الخدمات الإسلامية» + أيقونات `.nav-icon` إيموجي 🕐 |
| `prayer-times-cities.html` (صفحات الدول) | نفس القديم بالإيموجي |
| `countries.html` (دليل الدول) | نفس القديم بالإيموجي |

بالعربية تحديدًا يظهر الفرق لأنّ AR يتخطّى ترجمة SSR، فيبقى النصّ الاحتياطيّ بالإيموجي ظاهرًا على صفحات legal/country بينما الرئيسية أيقونات SVG نظيفة.

## 4) النمط المرجعيّ من الصفحة الرئيسية
شريط `index.html`: شعار `<svg><use href="#i-mosque"/></svg>` + عناوين أقسام بأيقونات SVG (بلا إيموجي) + 9 روابط كلٌّ بـ`<svg class="icon icon-md nav-icon">` و`data-page`، والعنصر الحاليّ `class="active"`. يعتمد على **sprite** يحوي رموز `#i-mosque` … الموجود في الرئيسية فقط.

## 5) المصدر المشترك الجديد (DRY)
أُنشئ **مصدر وحيد في `server.js`**: الدالّة `_renderSidebar({ spa, active })` + بيانات `_SIDENAV_GROUPS` + الـsprite المصغّر `_SIDENAV_SPRITE` (11 رمزًا فقط يستخدمها الشريط). يُحقَن **مرّة واحدة عند تحميل الكاش** (`_preloadStatic`، قبل الضغط) في العنصر النائب `<!--SHARED-SIDEBAR-->` في القوالب الأربعة:
- **`spa:true`** (الرئيسية): `data-page` + `active` على العنصر الحاليّ؛ بلا sprite إضافيّ (الرئيسية تحمل الـsprite الكامل أصلًا).
- **`spa:false`** (الصفحات الثابتة): روابط `<a href>` عاديّة (بلا اعتراض SPA، بلا active مفروض) + الـsprite المصغّر للأيقونات الـ11.
أزلتُ النسخ الـinline القديمة من القوالب الأربعة واستبدلتها بالعنصر النائب ⇒ **مصدر واحد فقط**. صافي الأسطر: القوالب الأربعة تقلّصت (−142 سطر مكرّر) مقابل +82 في server.js = **−53 سطرًا صافيًا** مع إزالة التكرار.

## 6) الصفحات التي وُحِّدت (تستخدم المصدر المشترك الآن)
- الرئيسية: `/` (وكلّ مسارات SPA المخدومة من index.html) — نسخة SPA.
- القانونيّة: `/about-us` · `/contact` · `/privacy` · `/terms` (legal.html).
- الدول: `/prayer-times-in-{country}` مثل `/prayer-times-in-saudi-arabia|egypt|morocco` (prayer-times-cities.html).
- دليل الدول: `/prayer-times-worldwide` (countries.html).

## 7) هل تم تعديل CSS؟ ❌ (الملفّ) — ✅ رفع cache-buster فقط
**`css/style.css` لم يُعدَّل** — أُعيد استخدام نفس الأصناف (`.sidebar` · `.sidebar-nav` · `.nav-icon` · `.icon` · `.svg-sprite-host`). لكن رُفِع cache-buster الـCSS في القوالب الثلاثة الثابتة من `?v=65/127` إلى **`?v=478`** (مطابقة الرئيسية) لضمان تحميل قواعد أيقونات SVG لدى الزوّار العائدين (الإصدار القديم قد يخدم CSS مخبّأ بلا `.icon`).

## 8) هل تم تعديل server.js أو index.html؟ ✅ نعم
- **`server.js`** (+82): المصدر المشترك + كتلة الحقن في `_preloadStatic`.
- **`index.html`** (+1/−56): إزالة الشريط الـinline (56 سطرًا) واستبدالها بـ`<!--SHARED-SIDEBAR-->`. الخرج المُقدَّم **مطابق** للسابق (نسخة SPA: 12 أيقونة SVG · 9 `data-page` · active على `/`).
- **legal.html** (+2/−21) · **prayer-times-cities.html** (+2/−44) · **countries.html** (+2/−21): إزالة الشريط الإيموجي + رفع `?v` + العنصر النائب.

## 9) وصف قبل/بعد (تأكيد بصريّ من الـpreview)
- **قبل** (صفحة دولة): أيقونات إيموجي ملوّنة 🕐🧭🌙💰🤲📿 + عنوان «🕌 الخدمات الإسلامية».
- **بعد** (لقطة preview للموبايل على `/prayer-times-in-saudi-arabia`، القائمة المنزلقة مفتوحة): أيقونات SVG خطّيّة أحادية اللون نظيفة + «الخدمات الإسلاميّة» و«التاريخ الهجريّ» (بلا إيموجي، بالشدّة) — **مطابقة للرئيسية تمامًا**.
- لقطة سطح المكتب للرئيسية: الشريط كما هو (SVG + «مواقيت الصلاة» نشط) — **بلا تراجع**.

## 10) نتائج اختبار الصفحة الرئيسية ✅
12 أيقونة SVG · 9 روابط · 9 `data-page` · active واحد على `/` · 0 إيموجي · شعار SVG · الـsprite الكامل · top-header موجود · H1=1. (وعلى `/en`: الروابط `/en/qibla`… — lang-prefix يعمل.)

## 11) نتائج اختبار الصفحات الثابتة (about/contact/privacy/terms) ✅
لكلٍّ منها: 12 أيقونة SVG · 9 روابط · 0 إيموجي · شعار SVG · النسخة الثابتة (0 `data-page` · 0 active) · الـsprite المصغّر محقون · H1=1 · top-header موجود. (`/en/privacy`: الروابط `/en/…`.)

## 12) نتائج اختبار صفحات الدول `/prayer-times-in-{country}` ✅
SA · EG · MA + `/prayer-times-worldwide`: 12 أيقونة SVG · 9 روابط · 0 إيموجي · شعار SVG · النسخة الثابتة · sprite مصغّر · **H1=1 (لم يتغيّر)** · جدول المدن والمحتوى وروابط المدن **بلا تغيير** · top-header موجود.

## 13) نتائج mobile ✅ (preview 375×812)
- على صفحة دولة: 12 أيقونة SVG · 0 إيموجي · شعار SVG · **بلا overflow أفقيّ** (`docW==winW==375`) · الأيقونات تُرسَم فعليًّا 22×22px (الـsprite يُحَلّ) · الـsprite المصغّر موجود.
- زرّ القائمة `.menu-toggle` يفتح الشريط المنزلق (`sidebar open`، مرئيّ) — القائمة الجانبيّة للموبايل تعمل ولم تتأثّر.
- **0 أخطاء console**.

## 14) تأكيد أنّ SEO لم يتغيّر ✅
لا تغيير في title/meta/canonical/robots/**H1** (H1=1 على كلّ الصفحات — مُثبَت). التعديل في `<aside>` فقط، خارج `<head>` و`<main>`. (ملاحظة: غياب canonical على `/prayer-times-worldwide` وعنوانه «🌍 …» حالة سابقة في countries.html غير متعلّقة بهذا التعديل.)

## 15) تأكيد أنّ Header navbar و city-context nav لم يتأثّرا ✅
- **Header navbar**: غير ممسوس (top-header موجود 8/8).
- **city-context nav**: سموك التذكرة السابقة **59/59** — إعادة كتابة روابط الـsidebar حسب سياق المدينة ما زالت تعمل (النسخة SPA المحقونة تحتفظ بـ`data-page` التي تعتمد عليها الميزة).
- **ملاحظة سلوكيّة مقصودة**: شعار صفحة الدولة كان `onclick="goToPrayerTimes()"` وصار `goHome()` (مثل الرئيسية وبقيّة الصفحات) — كلاهما ينتقل للرئيسية، فالنتيجة متطابقة والسلوك صار **موحَّدًا** مع الرئيسية. زرّ «الرئيسية» في الـHeader ما زال `goToPrayerTimes()` (غير ممسوس).

## 16) الملفّات المعدَّلة
| الملفّ | التغيير |
|---|---|
| `server.js` | **+82** — `_SIDENAV_GROUPS` + `_renderSidebar()` + `_SIDENAV_SPRITE` + حقن `<!--SHARED-SIDEBAR-->` في `_preloadStatic` |
| `index.html` | **+1/−56** — إزالة الشريط الـinline ⇐ عنصر نائب |
| `legal.html` | **+2/−21** — عنصر نائب + `?v=478` |
| `prayer-times-cities.html` | **+2/−44** — عنصر نائب + `?v=478` |
| `countries.html` | **+2/−21** — عنصر نائب + `?v=478` |
| `scripts/_smoke_in_page_sidenav_consistency_on_static_and_country_pages_1.mjs` | **جديد** — 90 تأكيدًا |

**لم يُمَسّ:** `css/style.css` · `js/app.js` · `sw.js` · `js/i18n*` · curated · sitemap · الحسابات · discovered admin · countdown · صفحات الأذكار.

## 17) node --check
`node --check server.js` → **سليم**. (القوالب HTML لا تُفحَص بـnode؛ تحقّقت بالتقديم الفعليّ + السموك.)

## 18) النتائج
- **سموك التذكرة: 90/90 ✓** (الرئيسية SPA + 8 صفحات ثابتة/دول + EN lang-prefix + حارس «لا إيموجي قديم»).
- **regression:** navbar city-context **59/59** · countdown **424/424** · noindex **39/39**.
- **preview:** موبايل (قائمة منزلقة + بلا overflow + 0 console errors) + سطح المكتب (الرئيسية بلا تراجع).

## 19) رسالة commit المقترحة
```
fix(ui): IN-PAGE-SIDENAV-CONSISTENCY-ON-STATIC-AND-COUNTRY-PAGES-1 — align in-page sidenav with homepage navigation style
```
الالتزام = `server.js` + `index.html` + `legal.html` + `prayer-times-cities.html` + `countries.html` + السموك + هذا التقرير (7 عناصر، معزولة).

---

**الخلاصة:** الشريط الجانبيّ داخل الصفحة صار من **مصدر واحد مشترك** (`_renderSidebar` في server.js) يُحقَن في القوالب الأربعة ⇒ صفحات about/contact/privacy/terms والدول ودليل الدول تعرض الآن **نفس شريط الأيقونات SVG للرئيسية** (بلا إيموجي، نفس البنية/الأصناف/الـspacing/الأيقونات)، مع نسخة SPA للرئيسية ونسخة static للباقي. **بلا تعديل CSS (رفع cache-buster فقط)، بلا مسّ Header navbar/city-context/SEO/H1/المحتوى/الحسابات.** 90/90 + 59/59 + 424/424 + 39/39 · node --check سليم · موبايل وسطح مكتب مُتحقَّقان بصريًّا.

**للاعتماد أرسِل:** `أعتمد دفع تقرير: IN-PAGE-SIDENAV-CONSISTENCY-ON-STATIC-AND-COUNTRY-PAGES-1` ثمّ «أوافق على تنفيذ الدفع».

*(ملاحظة ثابتة: لا أبدأ أيّ تذكرة جديدة ولا صفحة أذكار قبل اعتمادك؛ والأذكار موقوفة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
