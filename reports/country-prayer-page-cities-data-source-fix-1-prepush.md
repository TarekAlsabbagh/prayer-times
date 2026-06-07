# تقرير ما قبل الدفع: COUNTRY-PRAYER-PAGE-CITIES-DATA-SOURCE-FIX-1

**النوع:** المرحلة 1 من جذر صفحة الدولة (مصدر بيانات المدن فقط). **النطاق محصور:** المصدر + الأعداد + الأسماء + slugs + روابط اللغة. **لا** navbar / search / SEO / H1 / SSR-cities (تذاكر لاحقة).
**الصفحة:** `/prayer-times-in-{country}` و`/[lang]/prayer-times-in-{country}` (ملفّ `prayer-times-cities.html`).
**الحالة:** لم يُدفع — بانتظار اعتمادك.

## 1) سبب المشكلة
صفحة الدولة كانت تجلب المدن من **المصادر القديمة** (`db/cities-{cc}.json` + `STATIC_CITIES` + Wikidata + خريطة عميل `CITY_NAMES_LOCAL`)، بشكل ثنائيّ اللغة `{nameAr,nameEn}` فقط — أعداد لا تطابق المعتمد، وأسماء غير محلّاة بـ`names[lang]` (bn/ms→إنجليزيّ)، وslug عبر `makeSlug` قد لا يطابق صفحة المدينة.

## 2) مصدر المدن قبل
`handleCitiesApi` → `dbRead(cc)` (db/cities-*.json) → `STATIC_CITIES[cc]` → `fetchCitiesWikidata` → `CAPITAL_DATA`. والعميل يلوّن الأسماء عبر `CITY_NAMES_LOCAL` (6 لغات فقط) ثمّ إنجليزيّ.

## 3) مصدر المدن بعد
**`_curatedCitiesForCc(cc)`** الجديدة تُرشّح `_CURATED_PLACES` (قاعدة GLOBAL-PLACE-SEARCH = `db/places/curated-places.json`) بـ`countryCode===cc`، وتُرجِع `{slug, lat, lng, names{…11 langs}, nameAr, nameEn, priority}` مرتّبة **priority↓ → city قبل town → أبجديّ**. `handleCitiesApi` يستخدمها **أولًا** (مع `X-Source: curated` + `Cache-Control: no-store`)، ويُبقي المسار القديم **fallback فقط** للدول غير المُغطّاة بـcurated (لا انحدار للدول الطويلة الذيل). العميل يتخطّى dedup الأسماء القديم لبيانات curated (مُزال التكرار أصلًا بالـslug).

## 4) جدول الأعداد قبل/بعد (مؤكَّد حيًّا، X-Source=curated)
| الدولة | قبل (legacy) | بعد (curated) | المعتمد |
|---|---|---|---|
| India | 1550 | **199** | 199 ✓ |
| Indonesia | 16 | **82** | 82 ✓ |
| Pakistan | 1013 | **148** | 148 ✓ |
| Bangladesh | 156 | **38** | 38 ✓ |
| Saudi Arabia | 142 | **183** | curated (كامل) |
| Malaysia | 288 | **53** | curated |
| (AE 26 / LY 36 — بلا فقدٍ بعد تخطّي dedup الأسماء) | | | |

## 5) أمثلة أسماء المدن حسب اللغة (مؤكَّد حيًّا)
| اللغة | عيّنة (المعروض) |
|---|---|
| ar `/prayer-times-in-saudi-arabia` | الرياض / حفر الباطن / بارق (names.ar) |
| en | Delhi / Mumbai / Bengaluru (names.en) |
| bn `/bn/…-india` | দিল্লি / আহমেদাবাদ / বেঙ্গালুরু / চেন্নাই (names.bn) |
| ur `/ur/…-pakistan` | کراچی / بہاولپور / مظفر آباد (names.ur) |
| bn `/bn/…-bangladesh` | ঢাকা / রংপুর / কুমিল্লা (names.bn) |
0 تسرّب عربيّ على الصفحات غير العربيّة (gridArabic=0).

## 6) تأكيد `names[lang] → names.en`
✅ العرض عبر `_cityLocName`: `names[lang] || names.en` (للعربيّة `names.ar`؛ للإنجليزيّة `names.en`). المدن من curated تحوي 11 لغة. لو غابت لغة ⇒ `names.en` تلقائيًّا.

## 7) تأكيد عدم الترجمة runtime
✅ لا ترجمة آليّة ولا fillchain. الأسماء تأتي حصرًا من `p.names` المنسّقة. خريطة العميل القديمة `CITY_NAMES_LOCAL` لم تُعد تُستخدَم لبيانات curated (محفوظة فقط كـfallback لبيانات legacy غير المُغطّاة).

## 8) تأكيد slugs الإنجليزيّة
✅ الرابط يستخدم **slug المنسّق** (`city.slug`) مباشرةً: `/prayer-times-in-new-delhi`, `-dhaka`, `-karachi`… لا slugs عربيّة/بنغاليّة. (legacy/Nominatim بلا slug ⇒ `makeSlug` + لاحقة التصادم كاحتياط.) مؤكَّد: النقر على «ঢাকা» ⇐ `/bn/prayer-times-in-dhaka` يفتح صفحة مدينة حقيقيّة (ليس 404).

## 9) تأكيد روابط المدن تحترم اللغة
✅ على `/bn/…` كلّ الروابط `/bn/…` (26/26)، على `/ur/…` كلّها `/ur/…`. (آليّة `pageUrl()` كما هي — لم تتغيّر.)

## 10) SSR-visible أم client-side؟
المدن ما زالت **client-side** (يُحقنها `fetchCities` بعد التحميل؛ SSR يعرض spinner). جعلها **SSR-visible خارج نطاق هذه التذكرة** (يتطلّب توسيعًا server-side) — **مؤجَّل صراحةً** إلى `COUNTRY-PRAYER-PAGE-SSR-CITIES-FIX-1` كما اتّفقنا.

## 11) الملفّات المعدَّلة
| الملفّ | التغيير |
|---|---|
| `server.js` | +`_curatedCitiesForCc()` + `handleCitiesApi` curated-first (`X-Source: curated` + `Cache-Control: no-store`). |
| `prayer-times-cities.html` | render يستخدم `names[lang]→names.en` (`_cityLocName`/`_cardLabelFn`) + slug المنسّق + `injectCitiesItemList` (names[lang]+slug+بادئة لغة) + تخطّي dedup لـcurated + بمب مفتاح sessionStorage (`…_curated_…`). |
> `git diff --stat`: **87 إضافة، 19 حذف**. (الـsearch onSearch أُعيد لأصله؛ لا navbar/SEO/H1.) LF محفوظ.

## 12) نتائج regression
✅ HTTP **200** لكلّ صفحات الدولة المختبَرة (in/id/pk/bd/sa/my × ar/en/bn/ur/id/ms). ✅ 200 لصفحات غير متأثّرة: `/`, `/date-converter`, `/zakat-calculator`, `/msbaha`, `/azkar`, `/moon-today`, `/hijri-calendar`, `/prayer-times-in-riyadh`, `/next-prayer-in-riyadh`, `/bn/prayer-times-in-riyadh`. ✅ `node --check server.js` نظيف. ✅ **0 أخطاء console**. ✅ النقر على مدينة ⇒ صفحة مدينة تعمل (لا 404).

## 13) cache-busters
- **لا حاجة لبَمب `?v`**: `prayer-times-cities.html` يُخدَم **no-cache** (الزوّار العائدون يحصلون على كود الـrender الجديد) — تعديلاته inline داخل HTML.
- `/api/cities` صار **`Cache-Control: no-store`** (يمنع خدمة قوائم legacy مخزَّنة قديمًا).
- مفتاح sessionStorage بُمِّب إلى `session_cities_curated_{cc}` (يُبطِل الكاش داخل الجلسة المفتوحة).

## 14) رسالة commit المقترحة
```
fix(country): COUNTRY-PRAYER-PAGE-CITIES-DATA-SOURCE-FIX-1 — use curated cities for country prayer pages
```

## ما لم يُمَسّ
✅ navbar · search box · SEO/H1/Title/Meta · canonical/hreflang/sitemap · تصميم الصفحة · صفحات الأذكار · منطق حساب المواقيت · إحداثيات المدن · **بيانات curated نفسها** (قراءة فقط). · المسار القديم باقٍ fallback للدول غير المُغطّاة.

---
**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: COUNTRY-PRAYER-PAGE-CITIES-DATA-SOURCE-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
