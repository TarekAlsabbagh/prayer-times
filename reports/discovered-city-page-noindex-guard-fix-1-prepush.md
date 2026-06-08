# تقرير ما قبل الدفع: DISCOVERED-CITY-PAGE-NOINDEX-GUARD-FIX-1

**النوع:** حارس SEO — `noindex,follow` لصفحات المدن التي ليست في curated (discovered/مجهولة)، لمنع فهرسة عناوين خام مُشتقّة من slug.
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**النطاق:** ملفّ واحد — `server.js` (+11). **بلا** curated/app.js/site-search.js/html/css/sitemap.

---

## 1) سبب المشكلة
أيّ `/prayer-times-in-{slug}` لا يُطابق دولة يُعامَل كمدينة في `buildSeoFor` (السطر 10478). إن لم يكن الـslug في curated (`_findPlaceBySlug=null`)، فالاسم يُشتقّ من الـslug عبر `_slugToTitle` (مثل `chefchaouen-ma`→«Chefchaouen Ma»)، وكانت الصفحة تُرسَم **`index,follow`** — صفحة SEO خام مخالفة لسياسة `names[lang]→names.en`.

## 2) كيف تم تمييز صفحة discovered غير curated
في نفس فرع المدينة (`buildSeoFor`)، يوجد أصلًا `const _curated = _findPlaceBySlug(slug)` (10492). الحارس الجديد: **`if (!_curated) robotsOverride = 'noindex,follow,…'`**. أي: مدينة curated ⇒ `_curated` موجود ⇒ index؛ غير curated ⇒ `_curated=null` ⇒ noindex. يعتمد على نفس مصدر حقيقة `__PRAYER_CITY__` (الذي كان `false` لـchefchaouen-ma).

## 3) حالة `/prayer-times-in-chefchaouen-ma` قبل/بعد
| | قبل | بعد |
|---|---|---|
| HTTP | 200 | **200** (تبقى تُخدَم) |
| robots | `index,follow` | **`noindex,follow,max-snippet:-1,max-image-preview:large`** |
| محتوى الصفحة | يُرسَم | **يُرسَم كما هو** (#page-h1 + 11 hreflang + canonical) — تعمل للمستخدم، لكن لا تُفهرَس |
> العنوان «Chefchaouen Ma» يبقى (إصلاح الاسم = تذكرة البيانات التالية)، لكنّه لم يعد قابلًا للفهرسة.

## 4) حالة robots قبل/بعد (مُثبَت محليًّا)
| الصفحة | robots |
|---|---|
| chefchaouen-ma (غير curated) | `index,follow` → **`noindex,follow`** ✅ |
| slug عشوائيّ (testxyz123zzz) | → **`noindex,follow`** ✅ (يحمي من spam الـslugs) |
| `/en/`+`/fr/` chefchaouen-ma | **`noindex,follow`** ✅ (كلّ اللغات) |
| rabat / riyadh / essaouira / huraymila (curated) | **`index,follow`** ✅ (دون تغيير) |
| morocco / saudi-arabia (دولة) | **`index,follow`** ✅ |
| `/` · `/qibla` · `/moon-today` · `/azkar` | **`index,follow`** ✅ |

## 5) تأكيد أنّ صفحات curated لم تتأثر
✅ كلّ مدينة curated (rabat/riyadh/essaouira/huraymila، وبكلّ اللغات) تبقى `index,follow` بـcanonical/hreflang كما هي. الحارس يُطبَّق **فقط** عند `!_curated`. صفحات الدول والرئيسية والقبلة والقمر والأذكار: غير متأثّرة (فروع مختلفة).

## 6) تأكيد عدم تعديل curated
✅ `git status`: `curated-places.json` **غير معدَّل** · `js/app.js` · `js/site-search.js` · index.html · prayer-times-cities.html · css — كلّها **غير معدَّلة**. لا تغيير في slugs ولا في منطق sitemap (الـsitemap أصلًا يُولَّد من curated فلا يُدرِج discovered — مؤكَّد في التدقيق). canonical/hreflang للصفحات curated دون مساس.

## 7) الملفّات المعدَّلة
| الملفّ | التغيير | الأسطر |
|---|---|---|
| `server.js` | حارس `if (!_curated) robotsOverride='noindex,follow,…'` في فرع مدينة `buildSeoFor`. | **+11** |
> `node --check server.js` ✓. **ملفّ واحد فقط.**

## 8) نتائج regression (محليّ)
- ✅ غير curated (chefchaouen-ma + عشوائيّ + EN/FR) → `noindex,follow`، HTTP 200، الصفحة تُرسَم كاملة.
- ✅ curated (rabat/riyadh/essaouira/huraymila + UR/EN) → `index,follow`.
- ✅ دولة (morocco/saudi-arabia) + الرئيسية + qibla/moon-today/azkar → `index,follow` دون تغيير.
- ✅ سلامة الصفحة غير-curated: #page-h1 موجود · 11 hreflang · canonical ذاتيّ (دون تغيير) · بنية مواقيت الصلاة سليمة.
- ✅ `node --check` ناجح.

## 9) رسالة commit المقترحة
```
fix(seo): DISCOVERED-CITY-PAGE-NOINDEX-GUARD-FIX-1 — noindex non-curated discovered city pages
```

---
**الخلاصة:** أيّ صفحة `/prayer-times-in-{slug}` غير موجودة في curated أصبحت **`noindex,follow`** (تبقى 200 وتعمل للمستخدم، لكن Google لا يفهرسها بعنوان خام). صفحات curated والدول والرئيسية وبقيّة الأقسام غير متأثّرة. يمنع تكرار «Chefchaouen Ma» لأيّ مدينة discovered. بلا تعديل curated/slugs/sitemap/canonical/hreflang للصفحات المُنسّقة. (إضافة شفشاون لـcurated = التذكرة التالية `COUNTRY-CITIES-MA-CURATED-EXPANSION-CHEFCHAOUEN-1`.)

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: DISCOVERED-CITY-PAGE-NOINDEX-GUARD-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
