# MOON-SPA-ROUTER-MOON-PREFIX-ACTIVATION-AUDIT-1 PRE-PUSH REPORT

**النوع:** تذكرة إصلاح client-activation ضيّقة — **تنفيذ محليّ فقط، لم يُعمل commit، ولم يُدفَع شيء.** بانتظار اعتمادك للدفع.
**التاريخ:** 2026-06-17. **HEAD:** `a233ab1` (Meeus 49، مستقرّ). النطاق: `js/app.js` + اختبارات + cache-buster فقط.

---

## 1) السبب الجذريّ المختصر
الـSSR كان سليمًا، لكنّ مُقرّرَي **الصفحة النشطة** في `js/app.js` كانا يطابقان شكلَي القمر القديمين فقط (`moon-today` / `moon-in-`). أيّ رابط `/moon/...` (البنية المتداخلة) كان يقع في الافتراضيّ `page-prayer-times` — **وهي صفحة مُجرَّدة (stripped) على صفحات القمر** — فلا تبقى أيّ `.page.active` بعد hydration ⇒ **يظهر الفوتر فقط.** الخلل **client hydration / SPA router** حصرًا.

## 2) أين كان شرط route activation القديم
موضعان يقرّران الصفحة النشطة من `pathname`:
- **`js/app.js:4034`** — تفعيل `initApp` (`const _isMoonPage = /…moon-today…/.test || /…moon-in-…/.test`).
- **`js/app.js:11904`** — راوتر self-heal داخل معالج `pageshow`/BFCache (`else if (/…(?:moon-today|moon-in-)/.test(_path)) _expectedId='page-moon'`؛ وإلا الافتراضيّ `page-prayer-times`).
(مواضع أخرى للقمر في app.js — session-key 2955، روابط التنقّل بالنقر — **ليست مُقرِّر الصفحة النشطة** ولم تسبّب الفوتر-فقط؛ تُركت كما هي ضمن النطاق الضيّق.)

## 3) ما الذي تمّ تعديله (app.js فقط)
- **مُصنِّف مشترك واحد** (file-top، يراه initApp ومعالج pageshow معًا):
  ```js
  function _isMoonPath(p) {
      return /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon(?:-today|-in-|\/|$)/.test(String(p == null ? '' : p));
  }
  ```
  «صفحة قمر» = المسار يبدأ بـ`/moon` متبوعًا بـ`-today` أو `-in-` أو `/` أو نهاية — يشمل القديم والجديد `/moon/...`، مع prefix لغة اختياريّ. `/moonshine`/`/moonlight` ليست قمرًا.
- **`_isMoonPage`** (4034) صار `= _isMoonPath(_mpPath)`.
- **self-heal** (11904) صار `else if (_isMoonPath(_path))`.
**client-only:** لا server route، لا redirect، لا SSR لـ`/moon/...` (ما زالت 404 من السيرفر هذه التذكرة — app.js فقط أصبح جاهزًا لها مستقبلًا).

## 4) هل أصبح /moon/... يصنف كـ page-moon؟
✅ نعم. اختبار المُصنِّف (مستخرَج فعليًّا من `js/app.js` ومُشغَّل):
`/moon` · `/moon/today` · `/moon/saudi-arabia` · `/moon/saudi-arabia/riyadh` · `/moon/saudi-arabia/riyadh/today` · `/moon/saudi-arabia/riyadh/2026-06` · `/moon/saudi-arabia/riyadh/2026-06-17` · `/en/moon/saudi-arabia/riyadh/today` → **page-moon** (8/8).

## 5) هل الروابط القديمة ما زالت page-moon؟
✅ نعم. `/moon-today` · `/moon-today-in-riyadh` · `/moon-in-riyadh` · `/moon-in-riyadh/2026-06` · `/moon-in-riyadh/2026-06-17` → **page-moon** (المُصنِّف + SSR: 200 + `#page-moon active` + H1 واحد).

## 6) هل صفحات غير القمر لم تتأثّر؟
✅ نعم. `/prayer-times-in-riyadh` · `/qibla-in-riyadh` · `/today-hijri-date` · `/date-converter` · `/` · `/en/qibla` · `/moonshine` · `/moonlight` → **ليست قمرًا** (المُصنِّف)، وSSR لا يُفعّل `#page-moon` على qibla/zakat/hijri/date-converter.

## 7) محتوى فعليّ بعد hydration (تحقّق المتصفّح — preview، app.js?v=785)
| الرابط | الصفحة النشطة | محتوى #page-moon | H1 |
|---|---|---|---|
| `/moon-in-riyadh` | `page-moon` فقط | **6495 حرفًا** | «تقويم القمر وأطوار الشهر في الرياض…» + 🌒 هلال 7.5% + breadcrumbs |
| `/moon-today` | `page-moon` فقط | **5149 حرفًا** + hero + بحث | «حالة القمر اليوم» |
**لا فوتر-فقط.** والـapp.js المحمَّل = `?v=785` (المُصحَّح).

## 8) هل يوجد JavaScript console error؟
✅ لا — `preview_console_logs(level=error)` → **No console logs** على الصفحتين.

## 9) هل تمّ تعديل server.js؟
**لا — `server.js` UNCHANGED.** لم يلزم helper مشترك في السيرفر؛ المُصنِّف helper داخل `js/app.js` فقط.

## 10) هل تمّ تعديل sw/cache-buster؟
✅ نعم (لأنّ `js/app.js` تغيّر): `index.html` `app.js?v=784→785`، `sw.js` `CACHE_VERSION v444→v445` + precache `app.js?v=785`. **CSS لم يُمَسّ** (لم يلزم لإصلاح activation).

## 11) قائمة الملفّات المعدَّلة
| الملفّ | التغيير |
|---|---|
| `js/app.js` (+28/−10) | `_isMoonPath` مشترك + ربط `_isMoonPage` وself-heal به |
| `index.html` | `app.js?v=784→785` (preload + script) |
| `sw.js` | `CACHE_VERSION v444→v445` + precache 785 |
| `scripts/_smoke_navbar_links_…` | تثبيت الإصدار 784→785 |
| **جديد** `scripts/_smoke_moon_spa_router_moon_prefix_activation_audit_1.mjs` | سموك التذكرة |
**لم يُمَسّ:** `server.js`، `css/style.css`، `js/moon.js`.

## 12) نتائج الاختبارات (محلّيًّا)
| الاختبار | النتيجة |
|---|---|
| **classifier smoke (جديد)** | ✅ **36/36** (تصنيف 22 رابطًا + ربط المُقرّرَين + SSR القديم يُفعّل page-moon + غير-القمر لا) |
| navbar open-in-new-tab | ✅ 39/39 |
| navbar-city-context | ✅ 59/59 |
| discovered-noindex policy | ✅ 39/39 |
| countdown SEO/H1 | ✅ 424/424 |
| hijri-city-tz verify | ✅ ALL PASSED |
| Meeus accuracy | ✅ 45/45 |
| grid | ✅ 212/212 |
| browser: legacy moon pages render (no footer-only, no console error) | ✅ 6495/5149 حرفًا، H1=1 |
| `node --check` (app.js / sw.js) | ✅ سليم |

## 13) تأكيد عدم تغيّر Meeus 49
✅ `js/moon.js` **لم يُمَسّ** (ليس في الـdiff). يونيو الرياض: 15=محاق · 16=هلال متزايد · 29=ليس بدرًا · 30=بدر. مايو: تربيع أخير=10 · أوّل=23. (Meeus 45/45 + grid 212/212.)

## 14) تأكيد عدم تغيّر SEO/sitemap/canonical
✅ `server.js` لم يُمَسّ ⇒ **title/meta/canonical/robots/sitemap/hreflang/JSON-LD دون أيّ تغيير.** هذه التذكرة client-activation فقط.

## 15) رسالة الـcommit المقترَحة
```
fix(moon): MOON-SPA-ROUTER-MOON-PREFIX-ACTIVATION-AUDIT-1 — recognize /moon prefix routes as moon pages in SPA activation

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

**لن أدفع ولن أعمل commit قبل أن ترسل:** `أعتمد دفع تقرير: MOON-SPA-ROUTER-MOON-PREFIX-ACTIVATION-AUDIT-1` + «أوافق على تنفيذ الدفع». لم أبدأ مرحلة `/moon` hub أو `/moon/{country}` ولا أيّ تذكرة أخرى.
