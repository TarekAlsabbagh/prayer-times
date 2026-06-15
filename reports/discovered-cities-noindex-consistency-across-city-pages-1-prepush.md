# تقرير ما قبل الدفع: DISCOVERED-CITIES-NOINDEX-CONSISTENCY-ACROSS-CITY-PAGES-1

**النوع:** إصلاح SEO — توحيد سياسة الأرشفة (noindex) عبر **كلّ** صفحات المدينة (prayer-times / qibla / moon / time-left / next-prayer) بحيث تكون **curated هي مصدر الحقيقة الوحيد**؛ أيّ مدينة ليست في curated النهائيّ ⇒ جميع صفحاتها noindex.
**الحالة:** لم يُدفع — بانتظار اعتمادك. **القاعدة:** `HEAD = origin/main = 55b14c3`. شجرة العمل: `server.js` فقط (+ سموك جديد + هذا التقرير).
**لا يلمس:** curated · الحسابات (مواقيت/قبلة/قمر) · promote-commit · classification · name-overrides · js/app.js · css. **لا migration.**

---

## 1) اسم التذكرة
**DISCOVERED-CITIES-NOINDEX-CONSISTENCY-ACROSS-CITY-PAGES-1**

## 2) أين كان الخلل تحديدًا
صفحة `/prayer-times-in-{slug}` كانت **وحدها** تملك حارس «إن لم تكن المدينة في curated ⇒ noindex» (`_findPlaceBySlug`). أمّا `qibla` و`moon` فتُحلّان المدينة عبر `_resolveCityForMoon` (FAMOUS + **db/cities-\*.json القديمة** + curated) **بلا أيّ فحص curated**؛ و`time-left`/`next-prayer` تُحلّان الاسم عبر `_resolveCityName` بلا فحص أيضًا. فالمدينة الموجودة في cities-\*.json (أو discovered/مجهولة) كانت:
- prayer-times ⇒ **noindex** (صحيح)
- qibla / moon / time-left / next-prayer ⇒ **index** (خطأ)

> **التشخيص الحيّ (قبل الإصلاح)** على 3 مدن غير-curated حقيقيّة:
> | المدينة | prayer | qibla | moon |
> |---|---|---|---|
> | kamikawa | noindex ✓ | **index ✗** | **index ✗** |
> | del-rio | noindex ✓ | **index ✗** | **index ✗** |
> | yastrebovka | noindex ✓ | **index ✗** | **index ✗** |
>
> ومدن curated (makkah/qatif/an-nabiah) كانت index على الجميع ✓.

**سبب جذريّ ثانٍ (qibla):** صفحة qibla لمدينة **لا يحلّها** `_resolveCityForMoon` (مثل المدن discovered) لا تدخل فرع qibla أصلًا، فتسقط إلى **SEO الافتراضيّ (index)** — أخطر من الأوّل لأنّه يصيب كلّ مدينة discovered.

## 3) أيّ routes كانت تسمح بالأرشفة قبل الاعتماد
لمدينة **غير-curated**: `qibla-in` · `moon-today-in` · `moon-in` (hub) · `moon-in/{YYYY-MM-DD}` · `moon-in/{YYYY-MM}` · `time-left-until-next-prayer-in` · `next-prayer-in` — كلّها كانت `index`. (prayer-times كانت noindex سلفًا.)

## 4) كيف تمّ توحيد منطق noindex
**نقطة تطبيق واحدة** قرب نهاية `buildSeoForPath` (قبل `return`): إن طابق المسار أيّ عائلة مدينة من الخمس ولم تكن المدينة في curated ⇒ `noindex,follow`. تُطبَّق فقط حين لم تُضبَط robots بقاعدة أقوى (out-of-range/coord-only للقمر تبقى كما هي). وتغطّي **حالة السقوط** (slug لا يطابق فرعه) لأنّها تفحص `corePath` لا الفرع. صفحة prayer-times تحتفظ بحارسها الخاصّ (لأنّ مساره يشترك مع صفحات **الدول** التي يجب أن تبقى index) — لكنّه أُعيد توجيهه عبر **نفس الدالّة المشتركة**.

## 5) هل استُخدمت دالّة مشتركة؟
**نعم.** `_shouldNoindexCityRoute(slug)` = `!_findPlaceBySlug(slug)` (مصدر الحقيقة = curated المنشور). تُستعمَل في حارس prayer-times **والحارس الموحَّد** للعائلات الأربع الأخرى ⇒ كلّ صفحات المدينة تعتمد منطقًا واحدًا.

## 6–9) نتائج الاختبارات حسب الحالة (تشغيل حيّ بعد الإصلاح)
| الحالة | المدينة (مثال) | النتيجة |
|---|---|---|
| **curated** | makkah · an-nabiah (بعد الترقية) | **جميع** الصفحات السبع `index` + 200 ✅ |
| **discovered/غير-curated تحت المراجعة** | kamikawa · del-rio | **جميع** الصفحات السبع `noindex` + 200 ✅ |
| **approved قبل promote** | (غير موجود في curated) | يمرّ بنفس مسار «ليست في curated» ⇒ `noindex` على الجميع ✅ |
| **branch_committed قبل curated** | (غير موجود في curated بعد) | كذلك ⇒ `noindex` على الجميع — **لا يكفي promotion record للأرشفة** ✅ |
| **curated بعد promote** | an-nabiah | `index` على الجميع ✅ (يثبت التحوّل بعد الدمج) |

**ملاحظة مهمّة:** الحالتان «approved» و«branch_committed» مُغطّاتان حُكمًا — البوّابة هي `_findPlaceBySlug` (curated المنشور فقط)، ولا تكترث لحالة المراجعة/الترقية؛ فما لم تُدمَج المدينة فعليًّا في curated تبقى noindex. هذا نفس مسار kamikawa/del-rio في السموك.

**الصفحات تبقى تعمل للمستخدم:** كلّها **HTTP 200** (noindex فقط يمنع الفهرسة، لا العرض).

## 10) نتيجة sitemap
- الـsitemap **يعتمد curated فقط** (`buildSitemapDataFresh` يبني من `CURATED_ENTRIES`) — **بلا تغيير مطلوب**.
- مُثبَت في السموك: `sitemap-cities-1.xml` يحوي `prayer-times-in-makkah` + `qibla-in-makkah`، و**لا يحوي** kamikawa ولا del-rio.
- ⇒ لا تناقض sitemap↔robots: لا صفحة noindex مُدرَجة في الخريطة.

## 11) canonical
بلا تغيير في السياسة — الصفحة غير-curated تبقى noindex مع canonical ذاتيّ (يشير لنفسها، وهي noindex) تمامًا كسلوك prayer-times القائم.

## 12) الملفّات المعدَّلة (2 + تقرير)
| الملفّ | التغيير |
|---|---|
| `server.js` | **+34/−1** — دالّة `_shouldNoindexCityRoute` المشتركة · حارس موحَّد قرب نهاية `buildSeoForPath` للعائلات الأربع + السقوط · توجيه حارس prayer-times عبر الدالّة المشتركة |
| `scripts/_smoke_discovered_cities_noindex_consistency_across_city_pages_1.mjs` | **جديد** — 39 تأكيدًا |

**لم يُمَسّ:** curated · sitemap (لا تغيير) · search العامّ · index.html · js/app.js · css · الحسابات · promote-commit · classification · name-overrides · migrations.

## 13) هل توجد migration؟
**لا.** تغيير SEO/robots بحت في طبقة الـSSR. **لم تُنشأ/تُعدَّل أيّ migration.**

## 14) نتائج السموك + node --check
- **سموك التذكرة: 39/39 ✓** — curated (makkah + an-nabiah) كلّها index/200 · غير-curated (kamikawa + del-rio) كلّها noindex/200 · الـhubs (/qibla · /moon-today · /) + صفحة **الدولة** (/prayer-times-in-morocco) تبقى index · sitemap curated-only.
- **regression:**
  - **14 مدينة curated** عبر الأقاليم (riyadh/jeddah/cairo/istanbul/dubai/london/paris/jakarta/karachi/dhaka/new-york/casablanca/qatif/charikar) على qibla+moon ⇒ **0 انحدار** (كلّها index).
  - `_test_place_by_slug.mjs` **44/44** · `_test_search_merge.mjs` **15/15**.
  - **كامل سويت discovered/admin (12 سموك) + SSR = 326/326** (noindex 39 · ssr 18 · curated_status 29 · search_near_dup 34 · filter 23 · name_overrides 31 · sorting 31 · promote_commit 22 · diagnostics 32 · preview 28 · review 18 · dashboard_mvp 21) — admin غير متأثّر.
- **`node --check server.js` سليم.**

## 15) تأكيد أنّ التعديل لا يغيّر الحسابات/promote-commit/curated
- ✅ **الحسابات** (مواقيت/قبلة/قمر) غير ممسوسة — التغيير حصرًا في robots meta داخل `buildSeoForPath`؛ كلّ الصفحات تُخدَم 200 وتُحسَب كما هي.
- ✅ **curated** غير ممسوس (لا إضافة/حذف مدن).
- ✅ **promote-commit** + **classification** + **name-overrides** غير متأثّرة.
- ✅ **الصفحات العامّة** (curated + الدول + الـhubs) تبقى index؛ فقط مدن **غير-curated** صارت noindex على كلّ صفحاتها.

## 16) رسالة commit المقترحة
```
fix(seo): DISCOVERED-CITIES-NOINDEX-CONSISTENCY-ACROSS-CITY-PAGES-1 — apply discovered noindex consistently across prayer qibla and moon city pages
```
الالتزام = `server.js` + السموك الجديد + هذا التقرير (3 ملفّات، معزولة).

---

**الخلاصة:** مصدر الحقيقة للأرشفة صار **curated فقط** عبر دالّة مشتركة `_shouldNoindexCityRoute`؛ أيّ مدينة ليست في curated (discovered / approved / branch_committed-قبل-الدمج / legacy cities-\*.json) صارت **noindex على prayer-times وqibla وmoon وtime-left وnext-prayer معًا** (كانت qibla/moon تُؤرشَف أسرع من prayer-times). الصفحات تبقى 200، الـhubs والدول وcurated تبقى index، الـsitemap curated-only. **بلا migration، بلا تغيير حسابات/curated/promote-commit، 39/39 سموك + 326/326 carry-forward + 44/44 place + 15/15 merge + 14 مدينة curated بلا انحدار.**

**للاعتماد أرسِل:** `أعتمد دفع تقرير: DISCOVERED-CITIES-NOINDEX-CONSISTENCY-ACROSS-CITY-PAGES-1` ثمّ «أوافق على تنفيذ الدفع».

*(ملاحظة ثابتة: لا أبدأ أيّ تذكرة جديدة ولا صفحة أذكار قبل اعتمادك؛ والأذكار موقوفة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
