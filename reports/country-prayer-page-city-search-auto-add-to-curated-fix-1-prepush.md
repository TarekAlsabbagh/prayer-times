# تقرير Audit + ما قبل الدفع: COUNTRY-PRAYER-PAGE-CITY-SEARCH-AUTO-ADD-TO-CURATED-FIX-1

**النوع:** ترقية مدينتين مكتشَفتين same-country إلى `curated-places.json` فعليًّا (لا pending) عبر script محليّ + commit.
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**النطاق:** بيانات فقط — `db/places/curated-places.json` (+43، مدخلان) + `scripts/add-discovered-city-to-curated.mjs` (جديد). **بلا** server.js/js/html/css، **بلا** db/cities.

---

## القسم الأول — التدقيق الإلزاميّ (الأمان والديمومة)
| السؤال | الجواب |
|---|---|
| **هل يمكن للـbackend الكتابة الدائمة في curated على Render؟** | **لا.** (أ) التطبيق **لا** يحوي أيّ كود يكتب `curated-places.json` (السطر 23385 يكتب `db/cities-{cc}.json` القديم فقط؛ `/api/place-selected` يكتب Supabase). (ب) نظام ملفّات Render **عابر (ephemeral)** — الكتابة runtime تُمحى عند كلّ redeploy/restart (الملفّ يُبنى من git). |
| **هل تبقى بعد redeploy؟** | **لا** — `_CURATED_PLACES` يُحمَّل من الملفّ المُلتزَم في git عند الإقلاع؛ أيّ كتابة runtime تُفقَد. |
| **هل الأفضل الإضافة محليًّا عبر script ثمّ commit؟** | **نعم** — المسار الوحيد الدائم، ومطابق لخطّ الأنابيب القائم (`apply_curated_candidates.mjs` + موجات curated). |
| **هل في فتح endpoint إضافة عامّ خطر؟** | **نعم، عالٍ** — تسميم/سبام curated (يغذّي SSR + sitemap + canonical + SEO)، وعديم الجدوى أصلًا (عابر). |
| **هل نحتاج حماية endpoint؟** | نعم لو وُجِد، لكنّ الخلاصة: **لا endpoint runtime** — نعتمد المسار B (script + commit). طبقة الـ«pending» موجودة أصلًا: `/api/place-selected` → Supabase `discovered_places`. |
> **القرار المعتمد:** **المسار B** — script محليّ يضيف المدينتين إلى curated + commit. **لا endpoint إضافة عامّ.**

## القسم الثاني — الإصلاح (14 نقطة)

### 1) هل يمكن الكتابة الدائمة إلى curated من التطبيق
**لا** (راجع التدقيق). الديمومة فقط عبر git + redeploy.

### 2) قرار آلية الإضافة المعتمدة
**المسار B** — `scripts/add-discovered-city-to-curated.mjs` (يُشغَّل محليًّا، مراجعة diff، ثمّ commit/push). لا endpoint عامّ.

### 3) هل أُضيفت Huraymila إلى curated
**نعم** ✅ — `slug=huraymila`, `cc=sa`. (curated: 2977→2979، SA 183→184.)

### 4) هل أُضيفت Essaouira إلى curated
**نعم** ✅ — `slug=essaouira`, `cc=ma`. (MA 22→23.)

### 5) البيانات المضافة لكلّ مدينة (مُتحقَّقة من `/api/search-place` الإنتاج)
| الحقل | Huraymila | Essaouira |
|---|---|---|
| slug | huraymila | essaouira |
| type | city | city |
| countryCode | sa | ma |
| lat / lng | 25.126667 / 46.1225 | 31.5118281 / -9.7620903 |
| timezone | Asia/Riyadh | Africa/Casablanca |
| names | `{ar:'حريملاء', en:'Huraymila'}` | `{ar:'الصويرة', en:'Essaouira', fr:'Essaouira'}` |
| admin.region | Riyadh Province | Marrakesh-Safi |
| priority | 45 | 70 |
| source / verified | curated / true | curated / true |
> **سياسة الأسماء:** ar+en حدًّا أدنى + لغة البلد المحليّة الموثوقة (fr للمغرب). **لا** ترجمة runtime، **لا** fillchain، **لا** slug مولَّد (من الـendpoint). الباقي يرجع لـnames.en حسب CITY-NAME-SEO-FALLBACK-POLICY.

### 6) كيفية منع duplicate
الـscript يرفض الإضافة إن: slug موجود (idempotent) · مدينة على بُعد <0.15° في نفس الدولة · تطابق اسم/alias في نفس الدولة. **التحقّق الفعليّ:** 0 تعارض (near=[]، name collision=[]) لكلتيهما.

### 7) كيف تم التأكّد من countryCode
الـendpoint أرجع `cc=sa` لحريملاء و`cc=ma` للصويرة (مطابق للدولة)؛ الـscript يتحقّق `/^[a-z]{2}$/`؛ والمقارنة same-country محفوظة في البحث.

### 8) كيف تم تحديث جدول صفحة الدولة
البيانات تتدفّق عبر منطق الخادم القائم بلا أيّ تغيير كود: `_CURATED_PLACES` (إقلاع) → `_curatedCitiesForCc` → حقن `#country-cities-data` (prehydration) + `/api/cities`. **مُثبَت حيًّا:** السعودية allCities=**184** (label «184 منطقة / مدينة»)، المغرب **23**.

### 9) كيف تعمل بعد reload
أصبحتا **curated دائمتين**: بحث «حريملاء» على صفحة السعودية = **نتيجة محليّة** (`isLocalNoDiscovery=true`) → `/prayer-times-in-huraymila`؛ بحث «Essaouira» و«الصويرة» على المغرب = **محليّ** → `/prayer-times-in-essaouira`. لا اكتشاف جديد. صفحتا المدينة تُحلّان SSR (`__PRAYER_CITY__`). **مكافأة:** «الصويرة» العربيّة تجد المغربيّة محليًّا الآن (لأنّ names.ar=الصويرة في curated MA) فلا تصطدم بالعراقيّة.

### 10) تأكيد عدم الكتابة في db/cities
✅ `git status`: `db/cities-sa.json` + `db/cities-ma.json` **غير معدَّلة**. الـscript يكتب curated فقط.

### 11) تأكيد no runtime translation
✅ الأسماء من الـendpoint/يدويّ مُتحقَّق، لا Nominatim client، لا fillchain، لا slug مترجم.

### 12) الملفّات المعدَّلة
| الملفّ | التغيير |
|---|---|
| `db/places/curated-places.json` | **+43** (مدخلان فقط، صيغة 2-space canonical → diff نظيف) |
| `scripts/add-discovered-city-to-curated.mjs` | **جديد** — script الترقية مع الثوابت الصارمة |
> نسخة احتياطيّة `curated-places.json.preCitySearchAutoAdd.bak` (غير مُلتزَمة). **بلا** server.js/app.js/html/css/db-cities.

### 13) نتائج regression (محليّ، preview على البايتات الجديدة)
- ✅ curated 2977→2979 · SA 184 · MA 23 · كلاهما يجتاز `_isPrayerTimesReady`.
- ✅ السعودية: allCities=184، label 184، «حريملاء» محليّ → `/prayer-times-in-huraymila`، Dubai → «لم نجد مدينة مطابقة داخل هذه الدولة» (cross-country دون تغيير).
- ✅ المغرب: allCities=23، «Essaouira» + «الصويرة» محليّ → `/prayer-times-in-essaouira`.
- ✅ `/api/cities?cc=sa` (no-store) = 184 incl. huraymila · صفحتا المدينة تُحلّان SSR.
- ✅ **0 أخطاء console**.

### 14) رسالة commit المقترحة
```
fix(country): COUNTRY-PRAYER-PAGE-CITY-SEARCH-AUTO-ADD-TO-CURATED-FIX-1 — add validated same-country discovered cities to curated data
```

## ملاحظة SEO/sitemap
المدينتان أصبحتا مسارَي مدينة صحيحَين (SSR). canonical/hreflang/sitemap لهما **يُولَّدان من curated بالمنطق القائم** (لم أُعدّل أيّ كود sitemap/canonical يدويًّا) — وهو السلوك المقصود حسب توجيهك «إلا إذا كان النظام يولّدها من curated».

---
**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: COUNTRY-PRAYER-PAGE-CITY-SEARCH-AUTO-ADD-TO-CURATED-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
