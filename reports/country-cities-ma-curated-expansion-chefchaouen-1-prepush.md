# تقرير ما قبل الدفع: COUNTRY-CITIES-MA-CURATED-EXPANSION-CHEFCHAOUEN-1

**النوع:** ترقية مدينة شفشاون (المغرب) من discovered مؤقتة (noindex) إلى curated رسميّة (index,follow).
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**النطاق:** ملفّ بيانات واحد + سكربت الإضافة. **بلا** أيّ تعديل على `server.js` / `js/*` / البحث / noindex guard / المدن الأخرى.
**القاعدة:** `origin/main = HEAD = 161ddae` (شجرة نظيفة عدا تغييرات هذه التذكرة).

---

## 1) سبب الإضافة
المدينة كانت تظهر من البحث كصفحة **discovered مؤقتة** `/prayer-times-in-chefchaouen-ma` تعمل للمستخدم لكنّها `noindex,follow` (الحلّ الآمن المؤقّت من DISCOVERED-CITY-PAGE-NOINDEX-GUARD-FIX-1، لأنّ اسمها كان يتسرّب كـ«Chefchaouen Ma»). الترقية إلى curated تمنحها صفحة قانونيّة `/prayer-times-in-chefchaouen` بـ`index,follow` واسم مترجَم صحيح + تُدخلها قائمة مدن المغرب وطبقة البحث الـcurated.

## 2) مصدر الإحداثيات
- **سجلّ discovered الإنتاجيّ** (المصدر الأساسيّ المعتمَد، لأنّه مطابق): `/api/search-place?q=chefchaouen` → `slug=chefchaouen-ma, cc=ma, lat=35.1687748, lng=-5.2683454, names.ar=شفشاون` (OSM/Nominatim عبر Supabase) — نفس ما رآه المستخدم على الصفحة المؤقّتة.
- **تحقّق متقاطع — GeoNames 2552419**: `35.1688, -5.26361`. **نفس المدينة** (فرق lat ~3م، lng ~0.5كم — لا أثر على حساب الصلاة).
- **القرار:** استُخدمت إحداثيّات سجلّ discovered (استمراريّة + مصدرك المفضَّل «من discovered إن كان مطابقًا»).

## 3) بيانات المدينة المُضافة
```json
{
  "slug": "chefchaouen",
  "type": "city",
  "countryCode": "ma",
  "lat": 35.1687748,
  "lng": -5.2683454,
  "timezone": "Africa/Casablanca",
  "names": { "ar": "شفشاون", "en": "Chefchaouen", "fr": "Chefchaouen" },
  "aliases": {},
  "admin": { "countryAr": "المغرب", "countryEn": "Morocco" },
  "priority": 60,
  "source": "curated",
  "verified": true
}
```
> ملاحظات: `countryCode` بحروف صغيرة `"ma"` (اصطلاح البيانات الداخليّ — «MA» المطلوب = `ma`؛ `_isPrayerTimesReady` يفرض `/^[a-z]{2}$/`). `admin.region` **مُغفَل** عمدًا تماشيًا مع spec التذكرة ومع نمط rabat + كلّ مدن الشمال (tetouan/tangier/al-hoceima بلا region). `priority:60` (تقديريّ — أصغر من essaouira 70؛ يؤثّر فقط على ترتيب القائمة). فحوص الثوابت: `isReady` ✓، near-dup (<0.15°) **NONE**، name-collision **NONE**.

## 4) عدد مدن المغرب قبل/بعد
| | قبل | بعد |
|---|---|---|
| curated إجماليّ | 2979 | **2980** (+1) |
| مدن MA (`_curatedCitiesForCc`) | **23** | **24** |
| بطاقات صفحة المغرب المرسومة (متصفّح) | 23 | **24** |
> صفحة `/prayer-times-in-morocco` (ar/en/fr): `country-cities-data` = **24**، وبطاقة شفشاون موجودة وتربط للـslug القانونيّ `/prayer-times-in-chefchaouen` (لا `-ma`).

## 5) نتيجة صفحة `/prayer-times-in-chefchaouen`
| | ar | en | fr |
|---|---|---|---|
| HTTP | 200 | 200 | 200 |
| robots | **index,follow** | **index,follow** | **index,follow** |
| H1 | 1 — «مواقيت الصلاة في شفشاون اليوم» | 1 — «Prayer Times in Chefchaouen Today» | 1 — «Heures de prière à Chefchaouen…» |
| Title (cp) | 52 | 56 | 53 |
| canonical | `…/prayer-times-in-chefchaouen` | `…/en/…` | `…/fr/…` |
| hreflang | 11 | 11 | 11 |
| تسرّب «Chefchaouen Ma» | false | false | false |
> **متصفّح حيّ:** الصفحة تُرسَم، **مواقيت الصلاة تُحسب فعلًا** لإحداثيّات شفشاون (قيم حقيقيّة)، الموقع المعروض «شفشاون، المغرب»، H1 واحد، لا noindex.

## 6) نتيجة البحث داخل المغرب
`/api/search-place?q=chefchaouen` و`q=شفشاون` → يُرجِع **curated chefchaouen** (`source=curated`, slug=`chefchaouen`). والأهمّ: **لم يعُد يُرجِع `chefchaouen-ma`** — لأنّ المُدخل الـcurated يُلغي ازدواج سجلّ discovered (القانونيّ يفوز). فبحث المستخدم يصل الآن للصفحة الرسميّة.

## 7) حالة الرابط القديم `/prayer-times-in-chefchaouen-ma`
**بلا تغيير: 200 · `noindex,follow`** (الـslug `chefchaouen-ma` ما يزال غير curated → الحارس `if(!_curated)` يُبقيه noindex). يعمل للمستخدم، لا يُفهرَس — كما كان.

## 8) هل تم تنفيذ 301؟ — **لا (مؤجَّل، مع التبرير)**
درستُ الآليّة العامّة `CURATED_REDIRECTS` (تُحمَّل من **`db/curated-slugs.json` المولَّد** عبر `scripts/build-curated-sitemap.mjs`؛ المعالج عند server.js:23962 يُصدِر 301 لكلّ عائلات المسارات). **تنفيذ 301 الآن غير آمن/غير نظيف لأنّه:**
1. يتطلّب تعديل ملفّ **مولَّد** (`entries`+`redirects`) → هشّ (قد يُمحى عند إعادة التوليد) ويُوسّع النطاق.
2. يُدخل `chefchaouen` إلى الـsitemap → يخالف **سابقة essaouira** (التي رُقّيت إلى curated-places.json **فقط**، بلا مُدخل sitemap وبلا 301 — تحقّقتُ: `curated-slugs.json` لا يحوي essaouira).
3. الصفحة القديمة **noindex أصلًا** (لا تُفهرَس → لا ضرر تكرار محتوى)، وما قبل الإطلاق **لا روابط واردة** للدمج.
4. البحث **يُلغي الازدواج تلقائيًّا** (يُرجِع القانونيّ، يُسقِط `-ma`)، والروابط الداخليّة (بطاقة المغرب) تشير للقانونيّ — فلا توجيه يدويّ مطلوب لوصول Google.

**التوصية:** إبقاء القديمة noindex كما هي. إن رغبت بالـ301 لاحقًا → تذكرة مستقلّة `CHEFCHAOUEN-301-REDIRECT-1` تُجدِّد `curated-slugs.json` بشكل صحيح (تضيف `oldSlugs:["chefchaouen-ma"]` + تعيد توليد الـredirects/sitemap).

## 9) تأكيد عدم تغيير المدن الأخرى
diff على `curated-places.json` = **+21 سطرًا، 0 حذف** (إلحاق محض لمُدخل واحد، بلا إعادة تنسيق أيّ مُدخل آخر). slugs/أسماء كلّ مدن المغرب الـ23 الحاليّة بلا تغيير. Regression: `/prayer-times-in-rabat` · `/prayer-times-in-essaouira` · `/prayer-times-in-riyadh` → 200 · index,follow · H1=1 (دون تغيير).

## 10) تأكيد عدم لمس البحث / noindex guard / db/cities
- ✅ **لا تعديل** على `server.js` إطلاقًا (الحارس + العدّ + البحث كلّها تلتقط المُدخل الجديد تلقائيًّا من `_CURATED_PLACES`/`_CURATED_SLUG_INDEX` عند الإقلاع).
- ✅ **لا تعديل** على `js/site-search.js` ولا search pipeline ولا prehydration logic.
- ✅ **لا تعديل** على `db/cities-*.json` (legacy).
- ✅ noindex guard للمدن غير curated بلا مساس (chefchaouen-ma ما زال noindex).

## 11) الملفّات المعدَّلة
| الملفّ | التغيير |
|---|---|
| `db/places/curated-places.json` | +1 مُدخل (chefchaouen) — +21 سطرًا، 0 حذف |
| `scripts/add-chefchaouen-to-curated.mjs` | **جديد** — سكربت الترقية (يعكس ثوابت auto-add: isReady + near-dup + name-collision + idempotent + نسخة احتياطيّة `.preChefchaouen.bak` + كتابة canonical 2-space) |
> نسخة `db/places/curated-places.json.preChefchaouen.bak` ليست متعقَّبة (git يتجاهلها كـ`*.bak`).

## 12) نتائج regression
| الصفحة | النتيجة |
|---|---|
| `/prayer-times-in-rabat` | 200 · index · H1=1 (بلا تغيير) |
| `/prayer-times-in-essaouira` | 200 · index · H1=1 (بلا تغيير) |
| `/prayer-times-in-riyadh` | 200 · index · H1=1 (بلا تغيير) |
| `/prayer-times-in-chefchaouen-ma` | 200 · **noindex** (بلا تغيير) |
| صفحة المغرب ar | لا تسرّب إنجليزيّ — تحوي «شفشاون» |

## 13) رسالة commit المقترحة
```
feat(cities): COUNTRY-CITIES-MA-CURATED-EXPANSION-CHEFCHAOUEN-1 — add Chefchaouen to Morocco curated cities
```

---
**الخلاصة:** إضافة شفشاون إلى curated (ملفّ بيانات واحد + سكربت) تجعل `/prayer-times-in-chefchaouen` صفحة **index,follow** (H1=1، اسم مترجَم، مواقيت محسوبة، canonical/hreflang صحيحة)، وترفع مدن المغرب **23→24**، ويجدها البحث كـcurated — دون لمس `server.js` أو البحث أو noindex guard أو `db/cities` أو أيّ مدينة أخرى. الـ301 **مؤجَّل** (آمن لكنّه يتطلّب تعديل ملفّ مولَّد ويخالف سابقة essaouira؛ القديمة noindex لا تضرّ).

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: COUNTRY-CITIES-MA-CURATED-EXPANSION-CHEFCHAOUEN-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
