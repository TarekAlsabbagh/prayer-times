# PRAYER-BREADCRUMB-DUPLICATE-SCHEMA-FIX-1 — PRE-PUSH REPORT

**التاريخ:** 2026-06-21 · **الحالة:** محليّ فقط — **لا commit، لا push** · بانتظار اعتمادك.
**HEAD الحاليّ:** `4302c17`. التغيير الوحيد في شجرة العمل = **`server.js` فقط** (6 تعديلات breadcrumb، لا cache-buster).

---

## 1. سبب الخلل

صفحات `/prayer-times-in-{city}` + `/next-prayer-in-{city}` + `/time-left-until-next-prayer-in-{city}` كانت تُصدِر **مصدرَين** لـ BreadcrumbList في SSR + مصدرًا ثالثًا عميليًّا:
1. **كتلة `@graph` العامّة** (داخل `#ssr-graph-schema`) — رتبتان `الرئيسية › المدينة` — مبنيّة من `seo.breadcrumbs` الذي كان عنصرين فقط `[Home, City]` لهذه الصفحات (بلا رتبة الدولة).
2. **كتلة مستقلّة مخصّصة** — 3 رتب `الرئيسيّة › الدولة › مواقيت الصلاة في المدينة` — تُحقن في `<head>` بمعرّف `id="breadcrumb-schema-ssr"`.
3. **عميليّ** — `js/app.js _injectBreadcrumbSchema` يحقن BreadcrumbList بمعرّف **مختلف** `id="breadcrumb-schema"` ويُزيل القديم بـ `getElementById('breadcrumb-schema').remove()` — لكن اختلاف المعرّف منع إزالة الكتلة المستقلّة → بقيت كتلتان في DOM المُحقَّن.

النتيجة: تعارض/تكرار structured data (عمق 2 مقابل 3 + اختلاف «الرئيسية»/«الرئيسيّة»).

## 2. أين كانت الكتلة الأولى تُولَّد؟

كتلة `@graph` ذات الرتبتين: في باني الـ@graph الموحَّد (`server.js:13476-13488`) من `seo.breadcrumbs`. الصفحات الثلاث تدفع المدينة فقط:
بلدة curated (`server.js:13113`) · صيغة الإحداثيّات (`10991`) · time-left (`11224`) · next-prayer (`11328`) → `[Home, City]` (رتبتان). (qibla يدفع `[Home, Qibla, City]` فلديه كتلة `@graph` صحيحة واحدة — لذا كان سليمًا.)

## 3. أين كانت الكتلة الثانية تُولَّد؟

الكتلة المستقلّة ذات 3 رتب: `server.js:20871` (`id="breadcrumb-schema-ssr"`)، مبنيّة من `_bcItems` (Home shadda + Country + `مواقيت الصلاة في {city}`). والنسخة العميليّة المطابقة: `js/app.js:8886 _injectBreadcrumbSchema` (`id="breadcrumb-schema"`).

## 4. أيّ كتلة أُبقيت؟ وأيّ كتلة مُنعت؟

- **أُبقيت:** الكتلة الصحيحة ذات **3 رتب** (المستقلّة + نظيرتها العميليّة) — هي ما يطابق الـ DOM المرئيّ.
- **مُنعت:** كتلة `@graph` ذات **الرتبتين** — لهذه الصفحات الثلاث **فقط**.

## 5. التغييرات (6 تعديلات، `server.js` فقط)

| # | الموقع | التغيير |
|---|---|---|
| 1 | `13477` | شرط باني `@graph`: `… && !seo.breadcrumbs._suppressGraphBcLd` — يتخطّى كتلة BreadcrumbList العامّة عند رفع العلَم |
| 2 | `13113` | بلدة curated المجرّدة: `breadcrumbs._suppressGraphBcLd = true` |
| 3 | `10991` | صيغة الإحداثيّات (discovered): العلَم نفسه |
| 4 | `11224` | time-left: العلَم نفسه |
| 5 | `11328` | next-prayer: العلَم نفسه |
| 6 | `20871` | الكتلة المستقلّة: المعرّف `breadcrumb-schema-ssr` → **`breadcrumb-schema`** — ليُطابق ما يُزيله `app.js` عند hydration، فيُحذف التكرار في DOM المُحقَّن |

**لماذا لا تغيير في `js/app.js`؟** أعدتُ استخدام إزالته القائمة (`getElementById('breadcrumb-schema').remove()`) بمواءمة معرّف SSR معها — فلا تغيير عميل ولا cache-buster. **العلَم `_suppressGraphBcLd` لا يُسرَّب للإخراج** (خاصيّة على مصفوفة، لا تُسلسَل في JSON).

## 6. النتائج لكلّ صفحة (محلّيّ — SSR خام + DOM مُحقَّن)

| الصفحة | BreadcrumbList SSR | BreadcrumbList مُحقَّن (متصفّح) | DOM≡JSON-LD | H1 | canonical | hreflang |
|---|---|---|---|---|---|---|
| `/prayer-times-in-riyadh` | **1** (3 رتب، `id=breadcrumb-schema`) | **1** | **نعم** ✅ | 1 | ذاتيّ | 10+x ✅ |
| `/next-prayer-in-riyadh` | **1** | — (JSON-LD فقط، مقبول) | — | 1 | ذاتيّ | 10+x ✅ |
| `/time-left-until-next-prayer-in-riyadh` | **1** | — (JSON-LD فقط، مقبول) | — | 1 | ذاتيّ | 10+x ✅ |

- لا كتلة `الرئيسية › المدينة` ذات الرتبتين القديمة في أيّ منها ✅
- لا `id="breadcrumb-schema-ssr"` بعد الآن (أصبح `breadcrumb-schema`) ✅

## 7. لا تأثّر على باقي الصفحات

| الصفحة | BreadcrumbList |
|---|---|
| qibla `/qibla-in-riyadh` | 1 (3 رتب) ✅ |
| country `/prayer-times-in-saudi-arabia` | 1 (2 رتبة) ✅ |
| moon `/moon/saudi-arabia/riyadh` | 1 (4 رتب) ✅ |
| zakat / hijri / azkar | 1 لكلّ ✅ |

`#ssr-graph-schema` **سليم** على صفحات الصلاة الثلاث: ما يزال يحوي Organization/WebSite/WebPage، وJSON.parse صالح — حُذفت منه **عقدة BreadcrumbList فقط** لهذه الصفحات.

## 8. SEO + الواجهة

H1 = 1 · canonical ذاتيّ · hreflang 10+x-default · index,follow — على الصفحات الثلاث (بلا تغيير). متصفّحيًّا: `page-prayer-times` نشطة · **0 console errors** · **لا تجاوز أفقيّ** (overflow=false عند viewport 1280؛ قراءة `true` سابقة كانت خللَ قياس بـ innerWidth=0).

## 9. الانحدار

search-place **659** · search-ar **22** · home-migration **33** · qibla-box **36** · qibla-back **12** · hijri ✅ · countdown **424** ·
moon: hub **51** · guardrails **118** · country **58** (moon غير متأثّر). حالات الصفحات: `/`·prayer-city·country·qibla·next-prayer·time-left·moon·hijri·azkar·zakat·date-converter = **كلّها 200**. `node --check` نظيف.

## 10. الثوابت المؤكَّدة

- **`js/moon.js` لم يتغيّر** (`git diff` فارغ) · **Meeus 49** ثابت (15 يونيو = المحاق) ✅
- **حسابات الصلاة لم تتغيّر** (seed المدينة + tz=`Asia/Riyadh` قائم) ✅
- **sitemap لم يتغيّر** (التصحيح breadcrumb فقط؛ عائلات qibla/next-prayer/time-left قائمة) ✅
- **redirects لم تتغيّر** (`/moon-in-riyadh` → 301) · **discovered noindex** قائم (`/prayer-times-in-zzqwerty` = 200 + noindex) ✅
- **لا route جديد · لا slug تغيّر · لا تصميم · لا cache-buster** ✅

## 11. الحالة

التصحيح جاهز محليًّا ومُتحقَّق. الصفحات الثلاث تُصدِر **BreadcrumbList واحدًا فقط** (SSR=1 **و** مُحقَّن=1، غير متعارض، DOM≡JSON-LD)؛ الكتلة المُبقاة هي الصحيحة ذات 3 رتب؛ كتلة الرتبتين داخل `#ssr-graph-schema` مُنعت لهذه الصفحات فقط؛ باقي الصفحات (qibla/moon/country/zakat/hijri/azkar) سليمة بلا تغيير؛ `js/moon.js` + Meeus + الحسابات + sitemap + redirects + discovered ثوابت.
**لم أعمل commit ولم أدفع. لم أبدأ أيّ تذكرة أخرى. بانتظار اعتمادك للتقرير ثمّ موافقتك على الدفع.**
