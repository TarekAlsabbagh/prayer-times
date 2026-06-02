# تقرير ما قبل الدفع: GLOBAL-CLIENT-SEO-NO-OVERWRITE-SSR-FIX-1

**النوع:** Fix شامل — Option A (No-overwrite guard في `setSEOMeta`). **لم يُنفَّذ commit/push بعد.**
**التاريخ:** 2026-06-02 · **المرجع:** SEO-CLIENT-HYDRATION-OVERWRITE-REGRESSION-AUDIT-1 (معتمد).
**طريقة التحقّق:** متصفح headless حقيقيّ (Preview على الخادم المحليّ = مصدر `app.js` المُلتزَم) — SSR (curl) مقابل DOM بعد hydration.

---

## 1) قائمة الصفحات المفحوصة
Today-Hijri (2)، Qibla City (6)، Prayer City (5)، Hijri Calendar (4)، Msbaha (2) — إجمالي 19 رابطًا إلزاميًّا + صفحات PASS وتأكيد إصلاح hijri-date السابق.

## 2) جدول SSR مقابل DOM بعد hydration (قبل/بعد الإصلاح)

| العائلة | URL | DOM قبل الإصلاح | DOM بعد الإصلاح | SSR | الحكم |
|---|---|---|---|---|---|
| today-hijri | `/en/today-hijri-date` | M=**161** | M=**153** ✅ | 153 | ✅ FIXED |
| qibla-city | `/en/qibla-in-makkah` | T=**49** | T=**55** ✅ | 55 | ✅ FIXED |
| prayer-city | `/en/prayer-times-in-cairo` | M=**116** | M=**132** ✅ | 132 | ✅ FIXED |
| hijri-calendar | `/hijri-calendar` | M=**113** | M=**144** ✅ | 144 | ✅ FIXED |
| msbaha | `/msbaha` | T=**19** / M=**98** | T=**53** / M=**123** ✅ | 53/123 | ✅ FIXED |
| (PASS) moon | `/en/moon-today` | 55/140 | **55/140** | 55/140 | 🟢 لا تغيّر |
| (إصلاح سابق) hijri-date | `/hijri-date/1447-12-17` | 55/130 | **55/130** (hasNew=true) | 55/130 | 🟢 سليم |

كلّ DOM بعد الإصلاح = **مطابق لـ SSR** و**داخل النطاق** (Title 50–60 · Meta 120–160). `metaCount=1` في كل الصفحات؛ canonical + og:url حاضرة وصحيحة؛ JSON-LD غير متأثّر (hijri-calendar jsonLd=2).

## 3) الصفحات التي ثبت فيها overwrite (قبل الإصلاح)
الخمس عائلات أعلاه (today-hijri meta، qibla-city title، prayer-city meta، hijri-calendar meta، msbaha title+meta) — كلّها كانت تُدهَس بعد hydration؛ **بعد الإصلاح: لا overwrite — DOM يحترم SSR.**

## 4) الملفّات المعدَّلة (3 ملفّات، +42/-11)
| الملف | التغيير |
|---|---|
| `js/app.js` | guard في `setSEOMeta` فقط (4 hunks): التقاط SSR title/meta مرّة واحدة + عدم الدهس على صفحة الهبوط الأولى |
| `index.html` | `app.js?v=753 → 754` (موضعان) |
| `sw.js` | `CACHE_VERSION v413 → v414` + PRECACHE `app.js?v=754` |
**لم يُمَسّ:** server.js · CSS · i18n · الحسابات (صلاة/هجري/قمر/قبلة) · بيانات المدن · canonical generation (server) · hreflang · sitemap · JSON-LD · صفحات الأذكار.

## 5) نوع الإصلاح لكل عائلة
**موحَّد = guard عام** (Option A) في نقطة واحدة `setSEOMeta`:
```js
// التقاط SSR مرّة واحدة قبل أيّ دهس
if (_ssrSeoPath === null) { _ssrSeoPath=location.pathname; _ssrSeoTitle=document.title; _ssrSeoDesc=<meta desc>; }
let _useTitle=title, _useDesc=description;
// على صفحة الهبوط الأولى فقط: ثِق بـ SSR (مرّة واحدة)
if (!_ssrSeoGuardUsed && _ssrSeoPath === location.pathname) {
    _ssrSeoGuardUsed = true;
    if (_ssrSeoTitle.trim()) _useTitle=_ssrSeoTitle;
    if (_ssrSeoDesc.trim())  _useDesc=_ssrSeoDesc;
}
// ثم document.title/meta/og/twitter تستخدم _useTitle/_useDesc؛ canonical/og:url/hreflang تبقى path-derived
```
يغطّي **كل المعالِجات** (`updatePageSEO` / `updateCitySEO` / `loadHijriYearPage` / `loadHijriMonthPage` / `loadHijriDayPage`) دفعة واحدة. (لا ladder-alignment إضافيّ مطلوب؛ hijri-date يبقى مصلَّحًا من قبل + محميًّا الآن مزدوجًا.)

## 6) نتائج المتصفح بعد الإصلاح
موثّقة في §2 — الخمس عائلات صارت DOM == SSR داخل النطاق؛ PASS pages بلا تغيير؛ hijri-date سليم.

## 7) تأكيد `metaCount=1`
✅ على كل الصفحات المفحوصة (لا duplicate meta) — الـguard لا يُنشئ عناصر، بل يغيّر القيمة المُمرَّرة فقط، و`_seoUpsertMeta` يحدّث في مكانه.

## 8) تأكيد canonical/og:url
✅ canonical + og:url ذاتيّة الإشارة على كل صفحة (مشتقّة من `urls.canonical`، **خارج** نطاق الـguard) — تُحدَّث دائمًا.

## 9) تأكيد عدم تغيير الحسابات
✅ الـguard يمسّ نصوص SEO (title/description) فقط داخل `setSEOMeta`. صفر مساس بأيّ منطق حساب أو بيانات. `node --check js/app.js` ✅.

## 10) نتائج regression URLs
**18/18 = 200** على Production (شامل الخمس عائلات + moon + hijri-date + الرئيسية + zakat + azkar).

## 11) cache-busters
| المفتاح | قبل | بعد |
|---|---|---|
| `index.html` → `app.js?v=` | 753 | **754** |
| `sw.js` → `CACHE_VERSION` | v413 | **v414** |
| `sw.js` → PRECACHE `app.js?v=` | 753 | **754** |

## 12) رسالة commit المقترحة
```
seo(global): GLOBAL-CLIENT-SEO-NO-OVERWRITE-SSR-FIX-1 — prevent client SEO meta overwrites after hydration
```

---

## ملاحظات تصميميّة
- **SPA client-nav غير متأثّر:** الـguard «مرّة واحدة» (`_ssrSeoGuardUsed`) ومقيَّد بمسار الهبوط (`_ssrSeoPath === location.pathname`)؛ عند التنقّل داخل SPA يتغيّر المسار → يُحدَّث العنوان طبيعيًّا. الزواحف تُحمِّل كل URL كصفحة SSR كاملة → ترى دائمًا قيمة SSR الصحيحة.
- **`/fr/hijri-calendar`** SSR = 66/169 (أعلى قليلًا من النطاق الصارم) — هذه قيمة **الخادم** نفسها؛ الـguard يبقيها كما هي (لا يجعلها أسوأ كما كان يفعل العميل سابقًا). أيّ ضبط لطول SSR الفرنسيّ هو شأن server-side منفصل خارج نطاق هذا الإصلاح.

## معايير القبول — حالة محليّة
1. لا صفحة يدهس فيها العميل Title/Meta الصحيحين — ✅ (5/5 عائلات)
2. كل DOM Title/Meta بعد hydration داخل النطاق — ✅ (= SSR)
3. `metaCount=1` — ✅
4. canonical/og:url صحيحان — ✅
5. لا انحدار في prayer/qibla/hijri/moon/msbaha — ✅
6. لا تغيير حسابات/بيانات — ✅
7. regression 200 — ✅ (18/18)

## تأكيدات
- تقرير **ما قبل الدفع** — **لم يُنفَّذ** commit أو push.
- التحقّق DOM عبر **متصفح headless حقيقيّ** (ليس curl فقط) — أوقفتُ خادم Preview.
- **لم تُبدأ أيّ صفحة أذكار** (انتظارًا لاعتماد `/azkar/prayer-azkar` بصريًّا).

**في انتظار اعتمادك للدفع:** `أعتمد دفع تقرير: GLOBAL-CLIENT-SEO-NO-OVERWRITE-SSR-FIX-1`
