# تقرير ما قبل الدفع: COUNTRY-PRAYER-PAGE-SINGLE-CITY-TERRITORY-UX-FIX-1

**النوع:** تحسين UX لقسم «مدن الدولة» على صفحة المدينة، للأقاليم/الدول ذات المدينة الواحدة (تابع لتدقيق MACAU-COUNTRY-CITY-SAME-SLUG-ROUTING-AUDIT-1).
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**النطاق محصور:** `renderCountryCities` (empty-state) + تحييد breadcrumb الدائريّ + مفتاح i18n واحد. **بلا** تغيير slugs/canonical/hreflang/sitemap/curated/تصنيف ماكاو/مصدر المدن/حساب الصلاة/SEO/H1/أذكار.

## 1) سبب المشكلة
على صفحة مدينة في إقليم بمدينة curated واحدة (مثل ماكاو)، يستدعي `updateCountryCitiesSection` الدالّة `renderCountryCities([macau],'mo')` التي **تستبعد المدينة الحاليّة** (`others = cities.filter(...)`، السطر 12604). إذ المدينة الوحيدة = الحاليّة ⇒ `others.length===0` ⇒ القسم كان **يُخفى بصمت** (`section.style.display='none'`). كذلك رابط الدولة في الـbreadcrumb صار (بعد MAPPING-FIX-1) `/prayer-times-in-macau` = **نفس صفحة المدينة** (دائريّ، النقر لا يغيّر شيئًا).

## 2) عدد الأقاليم/الدول المتأثّرة
**21 إقليمًا/دولة** بمدينة curated واحدة: `mo(macau) · sg(singapore) · nz(auckland) · kp · bo · ec · uy · ci · cm · cd · gn · lr · ml · ne · sl · sn · td · ug · bf · ao · dj`. جميعها الآن تُظهر رسالة empty-state بدل القسم المخفيّ. (الـbreadcrumb الدائريّ يتحيّد فقط حيث slug الدولة = slug المدينة الحاليّة — أبرزها ماكاو.)

## 3) سلوك ماكاو قبل/بعد
| العنصر | قبل | بعد |
|---|---|---|
| قسم «مدن الدولة» | مخفيّ بصمت (display:none، 0 بطاقات) | **ظاهر** برسالة مترجَمة واضحة (0 بطاقات، لا شبكة فارغة، لا spinner) |
| العنوان | افتراضيّ عامّ «مدن الدولة» | «مواقيت الصلاة في مدن ماكاو» (مترجَم) |
| رابط الدولة (breadcrumb) | `/prayer-times-in-macau` قابل للنقر (دائريّ) | **بلا href** + class `bc-nolink` (نصّ، لا نقرة ميتة) |

## 4) كيف تمّ التعامل مع `others.length === 0`
في `renderCountryCities`:
```
if (others.length === 0) {
  if (cities && cities.length > 0) {        // إقليم بمدينة واحدة = الحاليّة
    section.style.display = 'block'; section.classList.remove('u-hidden');
    title.textContent = t('cities.section_title', { country });
    grid.innerHTML = ''; grid.style.display = 'none';       // لا شبكة فارغة
    <p id="country-cities-empty-note" class="cities-empty-note">  // يُنشأ مرّة، يُعاد استخدامه
       = t('cities.single_city_note', { country });
    moreBtn.parentElement.style.display = 'none';            // إخفاء زرّ «المزيد»
  } else {
    section.style.display = 'none';                          // لا بيانات أصلاً ⇒ إخفاء كالسابق
  }
  return;
}
// المسار العادي (≥1 مدينة أخرى): إخفاء الرسالة + إظهار الشبكة (regression-safe)
```
> التمييز: `cities.length>0 && others===0` = single-city (رسالة) · `cities.length===0` = لا بيانات (إخفاء). المسار متعدّد-المدن غير متأثّر.

## 5) نصوص i18n المضافة
مفتاح واحد جديد `cities.single_city_note` (بقالب `{country}`) أُضيف **NATIVE لكلّ اللغات العشر** في `js/i18n/{lang}.js` (تستهلكه صفحة المدينة SPA) + `js/i18n.js` (المصدر الموحَّد). أمثلة:
- ar: «{country} تضمّ مدينة رئيسية واحدة في بياناتنا الحالية، لذلك لا توجد مدن أخرى لعرضها هنا.»
- en: «{country} currently has one main city in our data, so there are no other cities to show here.»
- (fr/tr/ur/de/id/es/bn/ms مترجَمة أصليًّا أيضًا.)
> بُمِب `_i18nVersion '197'→'198'` ليصل المفتاح للزوّار العائدين عبر bundles per-lang.

## 6) حالة breadcrumb الدائريّ قبل/بعد
- **قبل:** `#bc-country` href = `/prayer-times-in-macau` = مسار الصفحة الحاليّة (نقرة ميتة دائريّة).
- **بعد:** حارس يكتشف الدائريّة (`new URL(countryHref).pathname === location.pathname`) ⇒ يُزال href + يُضاف class `bc-nolink` (CSS: `pointer-events:none; cursor:default; color:inherit`). النصّ «مواقيت الصلاة في ماكاو» يبقى ظاهرًا كنصّ لا كرابط.
- المدن العاديّة (riyadh→saudi-arabia): الرابط **يبقى فعّالًا** (`bc-nolink=false`) — لا أثر.

## 7) تأكيد عدم تغيير slugs/canonical/curated data
✅ **لم يُمَسّ `db/places/curated-places.json`** (git diff = 15 ملفّ كود/i18n فقط). لا slugs، لا canonical/hreflang، لا sitemap، لا country mapping، لا تصنيف ماكاو السياسيّ/البيانيّ، لا مصدر المدن، لا حساب الصلاة، لا SEO/H1 لصفحات قائمة. التغيير: منطق عرض قسم واحد + رسالة i18n + CSS.

## 8) الملفّات المعدَّلة
| الملفّ | التغيير | الأسطر |
|---|---|---|
| `js/app.js` | `renderCountryCities` empty-state (single-city) + حارس breadcrumb الدائريّ. | +55/−5 |
| `js/i18n/{10 langs}.js` | مفتاح `cities.single_city_note` NATIVE. | +1 لكلّ |
| `js/i18n.js` | المفتاح × 10 (المصدر الموحَّد). | +12 |
| `css/style.css` | `.cities-empty-note` + `a.bc-nolink`. | +17 |
| `server.js` | `_i18nVersion '197'→'198'`. | +1/−1 |
| `index.html` | بمب `app.js v=770→771` + `style.css v=476→477`. | +4/−4 |
| `scripts/_apply_single_city_note_i18n.mjs` | مولّد idempotent (أداة، غير محمّلة). | جديد |
> `git diff --stat`: **15 ملفًّا متتبَّعًا، +94/−10**. LF محفوظ. `node --check` نجح لكلّ ملفّات JS (server.js + app.js + 11 i18n).

## 9) نتائج regression (محليّ، preview)
- ✅ **ماكاو (single-city)**: القسم ظاهر، عنوان «مواقيت الصلاة في مدن ماكاو»، رسالة AR كاملة (54px)، 0 بطاقات، breadcrumb بلا href + `bc-nolink`.
- ✅ **en/ماكاو**: العنوان «Prayer Times in Cities of Macao»، الرسالة EN، breadcrumb متحيّد.
- ✅ **الرياض (multi-city)**: 16 بطاقة، شبكة ظاهرة، **لا** رسالة، breadcrumb → `/prayer-times-in-saudi-arabia` (فعّال) — المسار العادي سليم.
- ✅ HTTP: `/prayer-times-in-macau` `/en/...` `/riyadh` `/saudi-arabia` `/taiwan` `/` `/azkar` `/qibla` `/moon-today` = 200 · `/prayer-times-in-mo` = 301→macau · `/prayer-times-in-singapore` = 301→singapore-city (سلوك سابق غير متأثّر).
- ✅ **0 أخطاء console**.

## 10) رسالة commit المقترحة
```
fix(country): COUNTRY-PRAYER-PAGE-SINGLE-CITY-TERRITORY-UX-FIX-1 — handle single-city territory city lists
```

---
**ملاحظة تقنيّة:** قياس أوّليّ أظهر نصًّا فارغًا عبر `innerText` (يرجع '' لعناصر غير مُخطَّطة لحظة القراءة) — لكنّ `textContent` أثبت أنّ النصّ مضبوط صحيحًا على التحميل الطازج (لا علاقة بـbundle i18n).

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: COUNTRY-PRAYER-PAGE-SINGLE-CITY-TERRITORY-UX-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
