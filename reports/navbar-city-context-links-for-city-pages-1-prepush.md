# تقرير ما قبل الدفع: NAVBAR-CITY-CONTEXT-LINKS-FOR-CITY-PAGES-1

**النوع:** تحسين تنقّل — جعل روابط الـnavbar الثلاثة المرتبطة بالمدينة (prayer-times/qibla/moon) **ذكيّة حسب سياق المدينة الحاليّة** على صفحات المدن المعتمدة، مع بقاء href حقيقيًّا قابلًا للفتح في تبويب جديد. **امتداد لتذكرة الـnavbar السابقة، لا تراجع عنها.**
**الحالة:** لم يُدفع — بانتظار اعتمادك. **القاعدة:** `HEAD = origin/main = 3dffca2`. شجرة العمل: `server.js` فقط (+ سموك جديد + هذا التقرير).
**بلا تغيير:** التصميم/الترتيب/النصوص/الأيقونات · index.html · js/app.js · css · الحسابات · SEO/canonical/robots · active-state · server routes.

---

## 1) اسم التذكرة
**NAVBAR-CITY-CONTEXT-LINKS-FOR-CITY-PAGES-1**

## 2) السبب الحقيقيّ للمشكلة
بعد التذكرة السابقة صارت روابط الـnavbar **ثابتة على الـhubs العامّة** (qibla=`/qibla`). معالِج SPA على النقرة العاديّة **كان أصلًا ذكيًّا** (من صفحة مدينة → `/qibla-in-{slug}`)، لكنّ **سمة `href` الثابتة = hub** — فالنقر الأيمن «Open in new tab» / Ctrl+click / نسخ-الرابط كان يفتح الـhub العامّ لا صفحة المدينة. الإصلاح: مواءمة `href` في SSR مع سلوك SPA الذكيّ.

## 3) كيف يُستخرَج city context
في `serveHtmlWithSeo` (طبقة SSR): يُجرَّد `urlPath` من بادئة اللغة، ثمّ يُطابَق ضدّ **عائلات مسارات المدن الخمس** ويُستخرَج الـslug:
```
/(prayer-times-in | qibla-in | moon-today-in | moon-in | time-left-until-next-prayer-in | next-prayer-in)-{slug}[-lat-lng][/date]
```

## 4) مصدر التحقّق أنّ المدينة curated
**`_findPlaceBySlug(slug)`** (curated المنشور) — **نفس مصدر الحقيقة في سياسة noindex**. إن لم تكن المدينة curated ⇒ **لا إعادة كتابة** (الروابط الثلاثة تبقى hubs عامّة)، تطابقًا مع منع بناء روابط city-specific قابلة للأرشفة لمدينة غير معتمدة.

## 5) المسارات city-specific المدعومة
الروابط الثلاثة المرتبطة بالمدينة في الـnavbar: **prayer-times → `/prayer-times-in-{slug}`** · **qibla → `/qibla-in-{slug}`** · **moon → `/moon-today-in-{slug}`**. تُفعَّل على أيٍّ من عائلات المدن الخمس (بما فيها time-left/next-prayer إن كان المستخدم عليها). الروابط غير المرتبطة بالمدينة (zakat/azkar/tasbih/hijri/date-converter) **تبقى عامّة** دائمًا.

## 6) أمثلة href من `/prayer-times-in-an-nabiah` (curated)
```
prayer-times → /prayer-times-in-an-nabiah     qibla → /qibla-in-an-nabiah
moon → /moon-today-in-an-nabiah                zakat → /zakat-calculator (عامّ)
azkar → /azkar (عامّ)                           date-converter → /date-converter (عامّ)
```

## 7) أمثلة href من `/qibla-in-an-nabiah` (curated)
```
prayer-times → /prayer-times-in-an-nabiah     qibla → /qibla-in-an-nabiah
moon → /moon-today-in-an-nabiah
```

## 8) أمثلة href من hub مثل `/qibla` (عامّ)
```
prayer-times → /     qibla → /qibla     moon → /moon-today     (تبقى عامّة بلا تغيير)
```
وكذلك `/`, `/moon-today`, `/azkar`, `/date-converter` … والمدن **غير-curated** (`/prayer-times-in-kamikawa`) ⇒ كلّها hubs عامّة (fallback).

## 9) Open in new tab
المتصفّح يقرأ `href` الحقيقيّ من SSR. على صفحة مدينة curated فإنّ `href` = مسار نفس المدينة ⇒ يفتح **صفحة المدينة لا الـhub** (مُثبَت في السموك: 59/59).

## 10) Ctrl/Cmd click
حارس النقرات المُعدَّلة من التذكرة السابقة **ما زال موجودًا** (مُثبَت في السموك) ⇒ النقرة المُعدَّلة تُرجِع للمتصفّح الذي يفتح `href` الحقيقيّ (= city-specific على صفحة المدينة).

## 11) اللغة الإنجليزيّة
الـlang-prefix pass الموجود يحوّل الروابط المُعاد كتابتها إلى `/{lang}/…`: من `/en/prayer-times-in-an-nabiah` ⇒ qibla=`/en/qibla-in-an-nabiah` · moon=`/en/moon-today-in-an-nabiah` · prayer-times=`/en/prayer-times-in-an-nabiah` (مُثبَت).

## 12) mobile menu
الـsidebar **هو** قائمة الموبايل (نفس `.sidebar-nav`، نفس الـhrefs المُعاد كتابتها، نفس المعالِج). منطق الطيّ/الفتح غير ممسوس ⇒ السلوك مطابق (city-aware على صفحات المدن).

## 13) SSR ↔ hydration (لا mismatch)
العميل **لا يكتب** سمة `href` لعناصر `.sidebar-nav` إطلاقًا (يتنقّل عبر `data-page`)، ومعالِج SPA يتنقّل city-aware للوجهة نفسها ⇒ `href` في SSR = ما يفعله SPA ⇒ **بلا تعارض بين الرابط الأوّليّ والرابط بعد JS**.

## 14) الملفّات المعدَّلة (1 + سموك + تقرير)
| الملفّ | التغيير |
|---|---|
| `server.js` | **+24** — كتلة إعادة كتابة navbar حسب سياق المدينة في `serveHtmlWithSeo` قبل الـlang-prefix pass (مَحروسة بـ`_findPlaceBySlug`) |
| `scripts/_smoke_navbar_city_context_links_for_city_pages_1.mjs` | **جديد** — 59 تأكيدًا |

**لم يُمَسّ:** index.html · js/app.js · css · sw.js · curated · sitemap · الحسابات · server routes. **SSR-only** (HTML يُخدَم network-first ⇒ لا حاجة لـcache-buster/SW bump، كتذكرة noindex).

## 15) node --check
`node --check server.js` → **سليم**.

## 16) تأكيد أنّ href لا يعود إلى `#`
✅ مُثبَت في السموك على كلّ صفحة (curated + hubs + EN + غير-curated): **0 رابط `#`**. الروابط دائمًا حقيقيّة (city-specific أو hub).

## 17) تأكيد أنّ التصميم لم يتغيّر
تتغيّر **سمة `href` فقط** عبر SSR على صفحات المدن المعتمدة. لا تغيير في الماركب/الترتيب/النصوص/الأيقونات/الـclasses/`active`. مظهر الـnavbar مطابق.

## 18) تأكيد أنّ SEO لم يتغيّر سلبًا
لا تغيير في meta/canonical/robots/hreflang. الروابط الجديدة هي روابط داخليّة حقيقيّة لصفحات مدن **curated قابلة للأرشفة** (تحسين تنقّل/زحف داخليّ)؛ والمدن غير-curated تبقى hubs ⇒ **لا روابط city noindex في الـnavbar**. (active-state يبقى JS-driven وغير ممسوس.)

## 19) نتائج الاختبار + regression
- **سموك التذكرة: 59/59 ✓** — صفحات مدن curated (an-nabiah×3 + makkah) city-specific · hubs/tools (5) عامّة · EN lang-prefixed · غير-curated (kamikawa/del-rio) fallback عامّ · غير-المرتبطة بالمدينة عامّة · 0×`#` · المسارات 200 · الحارس قائم · active-state JS سليم.
- **regression: prev-navbar 39/39** (روابط الـhub ما زالت حقيقيّة) · **noindex 39/39** (SSR عريض، robots غير متأثّر) · **place-by-slug 44/44** · **8/8 صفحات عامّة → 200**.

## 20) رسالة commit المقترحة
```
fix(nav): NAVBAR-CITY-CONTEXT-LINKS-FOR-CITY-PAGES-1 — preserve current city context in navbar hrefs
```
الالتزام = `server.js` + السموك الجديد + هذا التقرير (3 ملفّات، معزولة).

---

**الخلاصة:** على صفحة مدينة **curated**، روابط navbar الثلاثة (prayer/qibla/moon) تشير لصفحات **نفس المدينة** (عبر إعادة كتابة SSR محروسة بـ`_findPlaceBySlug`) ⇒ Open-in-new-tab/Ctrl+click/نسخ-الرابط تفتح صفحة المدينة لا الـhub؛ الـhubs والمدن غير-curated تبقى عامّة (fallback)؛ اللغة مُحافَظ عليها؛ النقرة العاديّة تبقى SPA؛ لا mismatch مع hydration. **SSR-only، بلا `#`، بلا تغيير تصميم/SEO/حسابات/active-state، 59/59 + 39/39 + 39/39 + 44/44 + 8/8، node --check سليم.**

**للاعتماد أرسِل:** `أعتمد دفع تقرير: NAVBAR-CITY-CONTEXT-LINKS-FOR-CITY-PAGES-1` ثمّ «أوافق على تنفيذ الدفع».

*(ملاحظة ثابتة: لا أبدأ أيّ تذكرة جديدة ولا صفحة أذكار قبل اعتمادك؛ والأذكار موقوفة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
