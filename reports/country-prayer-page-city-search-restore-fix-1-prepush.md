# تقرير ما قبل الدفع: COUNTRY-PRAYER-PAGE-CITY-SEARCH-RESTORE-FIX-1

**النوع:** المرحلة 3 من جذر صفحة الدولة (إعادة بحث المدن داخل القائمة فقط).
**الصفحة:** `/prayer-times-in-{country}` و`/[lang]/prayer-times-in-{country}` (ملفّ `prayer-times-cities.html`).
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**النطاق محصور:** مربّع تصفية داخل نتائج المدن المعروضة + مفتاح i18n واحد للـplaceholder. **لا** مصدر/أعداد/أسماء/slugs المدن · **لا** navbar · **لا** SEO/H1/SSR-cities · **لا** حساب المواقيت · **لا** صفحات الأذكار.

---

## 1) المشكلة (قبل الإصلاح)
صفحة الدولة كانت **بلا مربّع بحث داخل قائمة المدن**: الزائر يرى الشبكة (199 IN / 148 PK / 38 BD / 183 SA …) لكن لا وسيلة لتصفيتها بسرعة. مربّعات الـhero/header في هذا الملفّ legacy تعيد التوجيه للرئيسية (stubs)، فلا تُصفّي القائمة الحاليّة. الهدف: إرجاع **فلتر فوريّ فوق الشبكة** يُصفّي **مدن الدولة المعروضة فقط** (بلا إنترنت/Nominatim/ترجمة وقت التشغيل).

## 2) الحلّ (سطر واحد لكلّ جزء)
- **HTML:** بطاقة بحث `<div class="cities-search-card">` فيها `<input id="country-city-filter" oninput="onCountryCityFilter()">` أُدرِجت **فوق شبكة المدن مباشرةً** (بين `results-count` و`.cities-main-card`) — تُعيد استخدام CSS `.cities-search-card` الموجود أصلًا (لا CSS جديد).
- **JS:** دالّة `onCountryCityFilter()` تُصفّي `allCities` محليًّا فقط، تضبط `currentPage=1` ثمّ `renderGrid()`.
- **i18n:** مفتاح واحد `countryCities.searchPlaceholder` لـ10 لغات في `js/i18n.js` (الـSSR data-i18n walker يقرأ منه + الـbundle نفسه يُحمَّل في الصفحة).

## 3) منطق التصفية (مطابق للمواصفة — بلا ترجمة وقت التشغيل)
لكلّ مدينة، تطابق إن احتوى الاستعلام أيًّا من:
1. **الاسم المحلّي** `names[lang]` (لغة الصفحة الحاليّة) — خام + lowercase + `normalizeAr`.
2. **الاسم الإنجليزيّ** `nameEn` (= `names.en`) — lowercase. ← fallback الإنجليزيّ.
3. **الاسم العربيّ** `nameAr` — عبر `normalizeAr` (تطبيع الهمزات/التاء/الياء).
4. **الـslug** الإنجليزيّ المنسّق — lowercase.

> لا Nominatim، لا fetch، لا fillchain، لا ترجمة. الاستعلام الفارغ ⇒ `filtered = [...allCities]` (يُعيد الترتيب الأساسيّ كما هو). عند عدم التطابق، `renderGrid` يعرض رسالة «لا نتائج» المترجَمة (تأكَّد: bn = «কোনো ফলাফল নেই»).

## 4) الـplaceholder المترجَم (SSR، 10 لغات — مؤكَّد)
| اللغة | placeholder (من SSR) |
|---|---|
| ar `/prayer-times-in-saudi-arabia` | `🔍 ابحث عن مدينة داخل هذه الدولة...` |
| en `/en/prayer-times-in-saudi-arabia` | `🔍 Search for a city in this country...` |
| ur `/ur/prayer-times-in-pakistan` | `🔍 اس ملک میں کسی شہر کی تلاش کریں...` |
| bn `/bn/prayer-times-in-india` (DOM) | `🔍 এই দেশের একটি শহর খুঁজুন...` |
> الباقي (fr/tr/de/id/es/ms) مضافة في `js/i18n.js` بنفس المفتاح ومترجَمة أصليًّا.

## 5) التحقّق الوظيفيّ في المتصفّح (preview حيّ — `/bn/prayer-times-in-india`)
| الاختبار | الإدخال | النتيجة |
|---|---|---|
| القاعدة | — | 199 «অঞ্চল / শহর» · 26 بطاقة/صفحة ✓ |
| اسم محلّي (بنغاليّ) | `দিল্লি` | 1 نتيجة — أوّلها «দিল্লি-এ নামাজের সময়» ✓ |
| اسم إنجليزيّ | `Mumbai` | 1 نتيجة — أوّلها «মুম্বই» ✓ |
| slug | `new-delhi` | أوّلها «দিল্লি» · `href=/bn/prayer-times-in-new-delhi` ✓ |
| لا تطابق | `zzqxnomatch` | «কোনো ফলাফল নেই» (مترجَمة) ✓ |
| مسح | `` (فارغ) | يعود 26 بطاقة / 199 — **الترتيب الأساسيّ محفوظ** ✓ |

## 6) الدول الإضافيّة (placeholder SSR مؤكَّد)
SA (ar) ✓ · SA (en) ✓ · PK (ur) ✓ · IN (bn) ✓. الفلتر نفسه عامّ على كلّ الدول لأنّه يعمل على `allCities` المُحمَّلة من `/api/cities` (مصدر curated من التذكرة السابقة).

## 7) الملفّات المعدَّلة
| الملفّ | التغيير | السطور |
|---|---|---|
| `prayer-times-cities.html` | بطاقة بحث `.cities-search-card` فوق الشبكة + دالّة `onCountryCityFilter()` + بمب كاش i18n `198→199`. | **+40 / −2** |
| `js/i18n.js` | مفتاح `countryCities.searchPlaceholder` × 10 لغات قبل `module.exports`. | **+12** |
| `scripts/_apply_country_city_search_i18n.mjs` | مولّد idempotent للمفتاح (أداة، غير مُحمَّل في الإنتاج). | جديد |
> `git diff --stat`: **2 ملفّات مُتتبَّعة، +50 / −2**. LF محفوظ (`node --check js/i18n.js` ✓؛ `prayer-times-cities.html` بلا تنفيذ Node لكن طُبِّع LF).

## 8) ما لم يُمَسّ
✅ مصدر المدن (curated من `4300d73`) · أعداد المدن (199/148/38/183…) · أسماء `names[lang]→names.en` · slugs · navbar (`6e1fbd0`) · SEO/Title/Meta/canonical/hreflang/sitemap · H1 · SSR city list (مؤجَّل) · حساب المواقيت · صفحات الأذكار · بيانات curated. **`server.js` غير ممسوس في هذه التذكرة.**

## 9) نتائج regression (محليّ، HTTP 200)
`/prayer-times-in-india` · `/bn/prayer-times-in-bangladesh` · `/id/prayer-times-in-indonesia` · `/` · `/azkar` · `/prayer-times-in-riyadh` — كلّها **200**. **0 أخطاء console** (preview console: «No console logs» على مستوى error بعد كلّ اختبارات الفلتر).

## 10) معايير القبول (11/11)
1. ✅ مربّع البحث ظاهر **فوق** قائمة المدن.
2. ✅ placeholder مترجَم بلغة الصفحة (4 لغات مؤكَّدة SSR/DOM + 6 مضافة).
3. ✅ يُصفّي **مدن الدولة المعروضة فقط** (يعمل على `allCities`، بلا إنترنت).
4. ✅ يطابق الاسم المحلّي `names[lang]`.
5. ✅ يطابق الإنجليزيّ `nameEn` (fallback) + الـslug + العربيّ.
6. ✅ لا ترجمة وقت تشغيل / لا Nominatim / لا fillchain.
7. ✅ مسح البحث يُعيد **الترتيب الأساسيّ** للقائمة (199 IN عادت كما هي).
8. ✅ رسالة «لا نتائج» مترجَمة عند عدم التطابق.
9. ✅ لم يتغيّر مصدر/عدد/اسم/slug المدن ولا navbar/SEO/H1.
10. ✅ 0 أخطاء console.
11. ✅ روابط regression تَحلّ 200.

## 11) cache-busters
- `js/i18n.js?v=198 → 199` داخل `prayer-times-cities.html` (أصل versioned، cache-first ⇒ URL جديد = جلب طازج للـbundle الذي يحوي المفتاح الجديد).
- HTML الصفحة `no-cache` server-side + SW network-first لـHTML ⇒ الزوّار العائدون يحصلون على البطاقة الجديدة.
- لا حاجة لبَمب `sw.js`. الـi18n يبقى monolithic (بنية السكربتات inline في هذا الملفّ legacy تتطلّب i18n متزامنًا — ترحيل per-lang خارج النطاق).

## 12) رسالة commit المقترحة
```
fix(country): COUNTRY-PRAYER-PAGE-CITY-SEARCH-RESTORE-FIX-1 — restore city search on country prayer pages
```

## 13) المخاطر + التخفيف
- **تضارب `lastQuery`:** الفلتر يضبط `lastQuery=''` عمدًا ليُظهر `renderGrid` رسالة «لا نتائج» العامّة (لا نصّ اقتراح-إنترنت الخاصّ بالـhero). مؤكَّد سلوكيًّا.
- **اختلاف رسم الحروف في ملخِّص WebFetch:** غير ذي صلة هنا — التحقّق الوظيفيّ تمّ عبر preview/DOM حيّ (قيم دقيقة)، لا عبر ملخِّص نصّي.
- **dedup المدن:** الفلتر لا يلمس `allCities` (نسخة فقط عبر spread)، فلا يؤثّر على المنطق `_isCurated ? cities : deduplicateCities` من التذكرة السابقة.

---
**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: COUNTRY-PRAYER-PAGE-CITY-SEARCH-RESTORE-FIX-1`

## التالي بعد الإغلاق
`COUNTRY-PRAYER-PAGE-SEO-CONTENT-FIX-1` (H1=1 + Meta 120–160 + محتوى) ← `COUNTRY-PRAYER-PAGE-SSR-CITIES-FIX-1` (إخراج قائمة المدن server-side).

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
