# تقرير ما قبل الدفع: MSBAHA-H1-SEO-FIX-1

**النوع:** إصلاح بنية H1 لصفحة `/msbaha` (المسبحة الإلكترونية) — جعل H1=1 فقط، عبر كلّ اللغات العشر.
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**النطاق:** 3 ملفّات — `index.html` (+5/−3) · `server.js` (+10/−0) · `css/style.css` (+8/−2) = **23 إضافة / 5 حذف**. **بلا** مساس: منطق العداد، الأذكار، i18n/الترجمة، Title/Meta، FAQ/JSON-LD، curated، البحث، أيّ SEO آخر.
**القاعدة:** `origin/main = HEAD = 801790e` · لم تُمَسّ أيّ ملفّات أخرى متعقَّبة.

---

## 1) سبب H1=19 (بنيويّ — مؤكَّد)
الـSPA shell (`index.html`) يحوي H1 واحدًا لكلّ أداة (الرئيسية/القبلة/القمر/الزكاة/الهجري/الأذكار/العدّات…). الدالّة `_getActiveH1Marker(urlPath)` في `server.js` تُعيد، لكلّ مسار، **مُعرِّف الـH1 النشط**؛ ثمّ `_downgradeInactiveH1s` تُبقي ذلك الـH1 وتُحوِّل البقيّة إلى `<h2>` في الـSSR.

**المشكلة المزدوجة في `/msbaha`:**
1. **المسار غير مُسجَّل** في `_getActiveH1Marker` → الدالّة تُعيد `null` → `_downgradeInactiveH1s` **لا تُعدِّل شيئًا** → تبقى كلّ الـ19 H1 (heroes بقيّة الأدوات) في الـmarkup → SEOptimer يَعُدّ **H1=19**.
2. **صفحة المسبحة نفسها بلا H1 خاصّ بها**: عنوانها الرئيسيّ كان `<h2 data-i18n="tasbih.title">` (سطر 4310) — أي 0 H1 ذاتيّ. (المسبحة كانت الأداة الوحيدة بـ`<h2>` للعنوان بدل `<h1>`، وغير المسجَّلة.)

> `/msbaha` كانت **المسار الوحيد** الذي يخدم `index.html` والمفقود من `_getActiveH1Marker` (تحقّقتُ من كامل `_isIndexHtmlRoute`: date-converter/today-hijri-date/qibla/moon/zakat/azkar/hijri-*/city-pages كلّها مُسجَّلة).

## 2) هل تستخدم بطاقات/أذكار المسبحة `<h1>`؟ — **لا**
فحصتُ كامل كتلة `#page-tasbih`. الهرمية الداخليّة **سليمة بالفعل**:
- العنوان الرئيسيّ: `tasbih.title` — كان `<h2>` (← يُرقَّى إلى `<h1>`، هذا الإصلاح الوحيد للهرمية).
- الأقسام الستّة (`tasbih.edu/howto/after/when/related/faq.title`): **`<h2>`** ✓ (صحيحة تحت H1).
- بطاقات/خطوات (`howto.step*`، `when.c*`، `related.*`): **`<h3>`** ✓.

أي: لا توجد عناوين داخليّة بـ`<h1>` تحتاج تحويلًا — البطاقات تستخدم h2/h3 بشكل صحيح. النقص الوحيد كان **عنوان الصفحة على مستوى الصفحة (H1)**.

## 3) الإصلاح (3 تغييرات + cache-buster)
| # | الملفّ | التغيير |
|---|---|---|
| 1 | `index.html` (≈4310) | ترقية عنوان الصفحة `<h2>` → `<h1 id="tasbih-h1">` (نفس الأيقونة + `<span data-i18n="tasbih.title">`، بلا تغيير نصّ/ترجمة). تعليق توضيحيّ بلا أيّ وسم عنوان حرفيّ. |
| 2 | `server.js` `_getActiveH1Marker` | تسجيل `if (/^\/msbaha$/.test(path)) return { kind:'id', value:'tasbih-h1' };` → يُبقي عنوان المسبحة H1 ويُنزِّل الـ19 الأخرى إلى `<h2>`. |
| 3 | `css/style.css` (1974 + 14397) | إضافة `.tasbih-card h1` إلى مُحدِّد `.section-card h2` (ديسكتوب + موبايل) → شكل العنوان المُرقَّى **مطابق تمامًا** للعنوان السابق. |
| 4 | `index.html` (81-82) | `css/style.css?v=477` → **`?v=478`** (ليصل تنسيق `.tasbih-card h1` للمستخدمين). |

**لماذا لا bump للـservice-worker؟** فحصتُ `sw.js`: الأصول `?v=` تُخدَّم **cache-first بمطابقة URL كامل** → `?v=478` = cache-miss مضمون → جلب جديد؛ والـHTML/التنقّل **network-first** → نسخة طازجة دائمًا (والـcrawler يأخذ SSR طازجًا). فلا حاجة لـ`CACHE_VERSION` ولا `PRECACHE_URLS`.

## 4) H1 قبل/بعد (10 لغات — SSR مُتحقَّق)
| | قبل | بعد |
|---|---|---|
| `/msbaha` (وكلّ `/{lang}/msbaha`) | **H1 = 19** (heroes الأدوات، بلا تنزيل) | **H1 = 1** (`#tasbih-h1` = عنوان المسبحة المترجَم) |

العناوين المترجَمة المؤكَّدة: ar «المسبحة الإلكترونية» · en «Digital Tasbih» · fr «Tasbih numérique» · tr «Dijital Tespih» · ur «ڈیجیٹل تسبیح» · de «Digitale Tasbih» · id/ms «Tasbih Digital» · es «Tasbih Digital» · bn «ডিজিটাল তাসবিহ».

## 5) الهرمية H2/H3 (بلا تغيير — كانت صحيحة)
الأقسام تبقى `<h2>` والبطاقات/الخطوات `<h3>`. لم أُحوِّل أيّ عنوان داخليّ (لم يكن أيّ منها H1). (ملاحظة شفافة: عدّ `<h2>` في الـmarkup الخام ≈124 لأنّ الـshell يضمّ عناوين كلّ الأدوات — وهذا **متطابق على كلّ صفحات الموقع** وسمة بنيويّة للـSPA، لا علاقة له بمقياس H1 الذي عالجناه.)

## 6) الحفاظ على الشكل (computed style — متصفّح حيّ)
`#tasbih-h1` مقابل `.section-card h2` المرجعيّ — **مطابقة كاملة**:
| الخاصّية | `#tasbih-h1` (بعد) | `.section-card h2` (مرجع) |
|---|---|---|
| font-size | 19.2px (1.2rem) | 19.2px |
| color | rgb(13,74,40) primary-dark | rgb(13,74,40) |
| border-bottom | 2px solid | 2px solid |
| padding-bottom | 12px | 12px |
| display / align-items | flex / center | flex / center |
> `styleMatchesH2 = true` · `tag = H1` · `totalH1inDOM = 1` · مرئيّ · `pageTasbihActive = true`. لقطة الشاشة: العنوان والأداة (التابات/33×3/الدائرة/العدّاد) تُرسَم سليمة، بلا كسر.

## 7) FAQ / JSON-LD (غير متأثّر — مؤكَّد)
كتلة `application/ld+json` من نوع `@graph` تحوي عقدة `FAQPage` بـ**6 أسئلة**، تُصدَّر لكلّ لغة (ar inLanguage=ar · en=en · ur=ur …) عبر علم `tasbihFaq:true` في `staticPages`. **لم أُعدِّل** هذا العلم ولا منطق الإصدار — مطابق قبل/بعد.

## 8) Title / Meta (غير متأثّر — مؤكَّد)
لم أمسّ مدخل `'/msbaha'` في `staticPages`. الأطوال بعد التغيير (= قبله):
| لغة | Title | Meta |
|---|---|---|
| ar | 53 | 123 |
| en | 57 | 146 |
| fr | 55 | 141 |
| tr | 52 | 153 |
| ur | 48 | 134 |
| bn | 55 | 130 |
> كلّها ضمن نطاقات SEO (Title 50–60، Meta 120–160) وبلا أيّ تغيير.

## 9) العدّاد/الأذكار/الترجمة (غير متأثّرة)
الأداة سليمة: `tasbih-btn` · `tasbih-count` · `tasbih-free-btn` حاضرة؛ منطق `tasbihClick`/`tasbihSwitchMode`/`tasbihReset` بلا مساس (لم أُعدِّل `js/app.js`). i18n keys بلا تغيير (`tasbih.title` نفسه — فقط تغيّر وسم الحاوية h2→h1).

## 10) الاختبارات (SSR + متصفّح)
- ✅ **`node --check server.js`** ناجح.
- ✅ **`/msbaha` + 9 لغات إضافيّة** → **H1=1** لكلّها، بعنوان مترجَم.
- ✅ **Regression — كلّها H1=1:** `/` · `/qibla` · `/moon-today` · `/azkar` · `/azkar/morning-azkar` · `/date-converter` · `/zakat-calculator` · `/today-hijri-date` · `/hijri-calendar` · `/prayer-times-in-riyadh` (مدينة) · `/prayer-times-in-morocco` (دولة) · `/prayer-times-in-macau`. (لا تُنزَّل العناوين النشطة الصحيحة؛ عنوان المسبحة المُرقَّى يُنزَّل إلى h2 على هذه الصفحات كما يجب.)
- ✅ **متصفّح حيّ** `/msbaha`: tag=H1، عدد H1=1، الشكل مطابق، الأداة تعمل.
- ✅ **FAQPage JSON-LD** = 6Q لكلّ لغة · **CSS المُصدَّر** يحوي `.tasbih-card h1` (مرّتان).

## 11) خارج النطاق (شفافيّة — لم يُغيَّر)
- **`/msbaha` page-tasbih بلا `active` في الـSSR الخام** بينما العميل يُفعّلها (`pageTasbihActive=true` في المتصفّح). سلوك **موجود مسبقًا** لم ألمسه؛ مقياس H1 على مستوى الـmarkup، فالإصلاح كافٍ. (إن رغبت لاحقًا بتفعيل SSR لـpage-tasbih مثل zakat/date-converter → تذكرة مستقلّة `MSBAHA-SSR-ACTIVE-CLASS-1`.)
- **`/msbaha` H1=19** كان مُلاحَظًا في تذاكر سابقة كـ«مسبق وخارج النطاق» — هذه التذكرة تُغلقه.

## 12) الملفّات + رسالة commit + خطّة الدفع
- **الملفّات (3 فقط):** `index.html` · `server.js` · `css/style.css`. (ملفّات `??` غير المتعقَّبة = artifacts/نسخ/تقارير جلسات سابقة — **لن تُضمّ**؛ سأستخدم `git add` صريحًا للملفّات الثلاثة + هذا التقرير، لا `git add -A`.)
- **رسالة commit المقترحة:**
```
fix(msbaha): MSBAHA-H1-SEO-FIX-1 — single page H1 on /msbaha (was H1=19)

Promote the tasbih page title from <h2> to <h1 id="tasbih-h1"> and register
/msbaha in _getActiveH1Marker so _downgradeInactiveH1s keeps only that H1 and
demotes the other ~19 SPA-shell H1s to <h2>. Internal section headings (h2) and
sub-items (h3) already correct — unchanged. Visual preserved via .tasbih-card h1
(mirrors .section-card h2). No counter/i18n/Title/Meta/FAQ changes. CSS cache-buster
v=477→478. Verified H1=1 on /msbaha across all 10 langs + regression on all fixed pages.
```

---
**الخلاصة:** `/msbaha` أصبحت **H1=1** (عنوان المسبحة المترجَم) عبر اللغات العشر، مع بقاء الهرمية الداخليّة الصحيحة (H2/H3)، والشكل البصريّ مطابقًا تمامًا، ودون أيّ مساس بالعدّاد أو الترجمة أو Title/Meta أو FAQ/JSON-LD أو أيّ SEO آخر. Regression نظيف على كلّ الصفحات المُصلَحة سابقًا.

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: MSBAHA-H1-SEO-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
