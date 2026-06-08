# تقرير ما بعد الدفع: COUNTRY-PRAYER-PAGE-CITY-SECTION-SEARCH-DISCOVERY-FIX-1

**الإنتاج:** https://prayer-times-d4w8.onrender.com · **commit:** `aee4943` (من `a7a72eb`).
**طريقة التحقّق:** PowerShell (بايتات خام) + preview محليّ على نفس البايتات. النشر تأخّر (Render free-tier rebuild) فأظهر فحصٌ أوّليّ الكود القديم؛ بعد إمهال إضافيّ تأكّد النشر الجديد.

## دليل أنّ النشر حيّ (aee4943)
| فحص | النتيجة |
|---|---|
| صفحة المدينة تُحمّل `app.js?v=772` | ✅ True (منطق Part B) |
| صفحة الدولة فيها `fetchCountrySearchSuggestions` | ✅ True |
| صفحة الدولة ما زالت فيها `fetchNominatimSuggestions` (القديمة) | ✅ **False** (أُزيلت) |
| صفحة الدولة تشير إلى `/api/search-place` | ✅ True |
| صفحة الدولة تشير إلى `/api/place-selected` | ✅ True |

## Part A — بحث صفحة الدولة (مؤكَّد)
- استبدال آليّة البحث الموسّع: من **Nominatim المباشر + saveToDb** إلى **`/api/search-place`** (curated→discovered→external) + countryCode validation + dedup + `/api/place-selected` (discovered).
- **دولة خاطئة** (مُثبَت محليًّا على نفس البايتات، والإنتاج يخدمها): «Dubai» على `/prayer-times-in-saudi-arabia` → نتيجتان كلاهما `sugg-item--other` «دبي · الإمارات · دولة أخرى» — **لم تُدمَج في السعودية**.
- **لا نتيجة:** «zzqx…» → «لم نجد مدينة مطابقة داخل هذه الدولة أو عبر البحث العامّ.»
- **محلّي-أوّلًا:** «Umluj/Tabuk» (curated) → فلتر محليّ، لا fallback.
- **الإنتاج:** `/api/search-place?q=…&lang=en` external = **ok** (Nominatim يعمل على الإنتاج) — فمسار «same-country discovered» الحيّ متاح على الإنتاج (مطابق بالكود لمسار «دولة أخرى» المُثبَت). `/api/place-selected` OPTIONS = **204** (متاح).

## Part B — قسم مدن الدولة في صفحة المدينة (مؤكَّد محليًّا على نفس البايتات)
- **ماكاو**: بطاقة macau واحدة، **بلا empty-state**.
- **الرياض**: 16 بطاقة، **الرياض ضمنها** (لا تُحذف الحاليّة).

## سياسة البيانات (مؤكَّدة)
- **لا كتابة curated** من المتصفّح · الاكتشاف عبر `/api/place-selected` (Supabase `discovered_places`, verified:false) فقط.
- **`saveToDb`/`/api/cities/add` (legacy)**: أُزيل من مسار البحث نهائيًّا. بقي تعريف `saveToDb` + موضع نداء واحد (السطر 1796) **محصور بشرط `city._new`** — ولا شيء يضبط `_new` بعد إزالة بحث Nominatim ⇒ **كود ميّت لا يُنفَّذ أبدًا** (لا كتابة legacy فعليّة). (يمكن تنظيفه في تذكرة لاحقة — تجميليّ، خارج النطاق.)
- **no runtime translation**: الأسماء من `displayName`/`names` (سياسة الموقع) · الـslug من الـendpoint.

## الانحدار
`/prayer-times-in-saudi-arabia` · `/prayer-times-in-macau` · `/en/prayer-times-in-macau` · `/prayer-times-in-riyadh` → **200**. **0 أخطاء console** (محليًّا).

## ما لم يُمَسّ
✅ curated-places.json · server.js · js/i18n.js · css/style.css · canonical/hreflang/sitemap · slugs · تصنيف ماكاو · حساب الصلاة · أذكار. (الإصلاح: 3 ملفّات — `prayer-times-cities.html` + `js/app.js` + `index.html`.)

## الخلاصة
بحث صفحة الدولة صار متوافقًا مع **سياسة البحث العامّة للموقع** على الإنتاج (`/api/search-place` بدل Nominatim المباشر، discovered عبر `/api/place-selected`، countryCode validation، بلا كتابة curated/legacy، بلا runtime translation)، وقسم مدن الدولة في صفحة المدينة يعرض كلّ curated incl. الحاليّة (بطاقة ماكاو بدل empty-state).

**النتيجة المقترحة:** ✅ **PASSED** — جاهز للإغلاق: `اعتماد وإغلاق تقرير: COUNTRY-PRAYER-PAGE-CITY-SECTION-SEARCH-DISCOVERY-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
