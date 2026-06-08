# تقرير ما قبل الدفع: COUNTRY-PRAYER-PAGE-CITY-SEARCH-DISCOVERY-UI-FIX-1

**النوع:** إصلاح UI — وصل مربّع البحث فوق شبكة المدن (`#country-city-filter`) بسياسة البحث الموسّع العامّة.
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**النطاق:** ملفّ واحد — `prayer-times-cities.html` (+54/−0). **بلا** server.js/app.js/curated/css/db/i18n.

---

## 1) سبب التنفيذ
أثبت تدقيق `MOROCCO-SEARCH-DISCOVERY-AUDIT-1` (التصنيف A) أنّ المربّع فوق شبكة المدن (`#country-city-filter` → `onCountryCityFilter`) كان **محليًّا بحتًا**: يفلتر `allCities` ثمّ يعرض «لا توجد نتائج» — **بلا** أيّ نداء `/api/search-place`. بينما البحث الموسّع كان موصولًا فقط بصندوق الهيرو (`#search-input` → `onSearch`). فبحث المستخدم عن «الصويرة/Essaouira» في صندوق الشبكة لم يصل للاكتشاف. هذا الإصلاح يصل صندوق الشبكة بنفس السياسة.

## 2) المربّع المُصلَح والمعالج
| المربّع | المعرّف | المعالج | قبل | بعد |
|---|---|---|---|---|
| **فوق الشبكة** | `#country-city-filter` | `onCountryCityFilter()` | محليّ بحت | **محليّ أوّلًا ثمّ بحث موسّع عند 0 نتيجة** |
| الهيرو/الرأس | `#search-input` | `onSearch()` | فيه fallback | **لم يُمَسّ** |

## 3) منطق التدفّق الجديد (نفس سياسة `onSearch`)
داخل `onCountryCityFilter`: يبقى **الفلتر المحليّ أوّلًا** (بلا تغيير). أُضيف بعد `renderGrid()`:
```js
if (filtered.length === 0 && q.length >= 2) {
    _gridDiscoverTimer = setTimeout(() => _countryFilterDiscovery(q), 300);
}
```
- **يُشغَّل فقط** عند **0 نتيجة محليّة** و`q.length ≥ 2` (مطابقة محليّة موجودة ⇒ لا اكتشاف).
- **debounce 300ms** + `clearTimeout(_gridDiscoverTimer)` في بداية كلّ نداء (لا تكدّس نداءات أثناء الكتابة).

دالّة جديدة `_countryFilterDiscovery(q)`:
1. تعرض «جارٍ البحث…» في منطقة الشبكة.
2. `fetch('/api/search-place?q=…&lang=…')` (نفس endpoint السياسة).
3. **حارس قِدَم**: إن تغيّرت قيمة الصندوق عن `q` ⇒ تجاهل (لا سباق).
4. تحقّق جاهزيّة + dedup + countryCode validation (راجع 4، 6).
5. ترسم بطاقات الاكتشاف في **منطقة الشبكة** أو «لا نتيجة» إن لا شيء.

## 4) countryCode validation + فصل same/other
- `same = ready.filter(r => (r.countryCode||'').toLowerCase() === countryCode)` ← **نفس الدولة** ⇒ شارة «مدينة مكتشَفة».
- `other = ready.filter(r => (r.countryCode||'').toLowerCase() !== countryCode)` ← **دولة مختلفة** ⇒ شارة «دولة أخرى» (لا تُدمَج في الشبكة أبدًا).
- `countryCode` في هذا السياق = الرمز الثنائيّ للدولة (مثل `ma`)، نفس المقارنة المثبتة في `fetchCountrySearchSuggestions`.

## 5) مكان عرض البطاقة
تُرسَم في **منطقة الشبكة `#cities-container`** (حيث كان «لا توجد نتائج»)، بإعادة استخدام نفس صنفَيْ الشبكة `.cities-grid` + `.city-link` + `.city-type` ⇒ **بلا CSS جديد**. سقف العرض: 6 نفس‑الدولة + 3 دولة‑أخرى. عند مسح الصندوق ⇒ `renderGrid()` يعيد بناء الشبكة الكاملة.

## 6) dedup + تحقّق الجاهزيّة (نفس قواعد السياسة)
`ready` = نتائج تمرّ كلّ هذه:
`typeof slug==='string'` + `/^[a-z0-9][a-z0-9-]{0,79}$/` + `/^[a-z]{2}$/.test(cc)` + `isFinite(lat)` + `isFinite(lng)` + `typeof timezone==='string' && timezone` + `!existing.has(slug)` (حيث `existing` = slugs الـ`allCities` المعتمدة ⇒ **لا تكرار** لمدينة موجودة في الشبكة).

## 7) النقر → `_dscPickPlace(r)` (persist + navigate)
كلّ بطاقة: `a.addEventListener('click', e => { e.preventDefault(); _dscPickPlace(r); })`. `_dscPickPlace` (موجودة مسبقًا، مشتركة مع الهيرو) تُنفّذ POST `/api/place-selected` (upsert إلى Supabase `discovered_places`، verified:false) + بذر sessionStorage + التنقّل إلى `/[lang]/prayer-times-in-{slug}`. **مؤكَّد محليًّا:** النقر على بطاقة دبي استدعى `_dscPickPlace({slug:'dubai', countryCode:'ae'})`. **لا كتابة** في `curated-places.json` ولا `db/cities-*.json`.

## 8) لا ترجمة runtime — الأسماء من البيانات
اسم البطاقة = `r.displayName || r.secondaryName || r.slug` (اسم الموقع من الـendpoint)، الدولة = `r.countryName`، والـslug من الـendpoint. **لا** Nominatim/Wikidata client، **لا** خرائط أسماء، **لا** fillchain، **لا** slug مولَّد.

## 9) نتائج الاختبار المحليّ (preview على البايتات الجديدة)
| الاستعلام | المتوقَّع | النتيجة |
|---|---|---|
| **Rabat** | مطابقة محليّة (في curated MA) ⇒ لا اكتشاف | ✅ بطاقة محليّة واحدة `/prayer-times-in-rabat`، **لا** نداء اكتشاف |
| **Dubai** | 0 محليّ ⇒ اكتشاف ⇒ «دولة أخرى» | ✅ بطاقتان (دبي + بر دبي) «الإمارات · دولة أخرى» `isOther=true`، **لا دمج** في شبكة المغرب |
| **الصويرة** (عربيّ) | homonym عراقيّ ⇒ «دولة أخرى» لا مدينة محليّة | ✅ بطاقة «الصويرة · العراق · دولة أخرى» `/prayer-times-in-as-suwayrah`، `anyMergedAsLocal=false` |
| **Essaouira** (لاتينيّ) | external ⇒ `ma` (إنتاج فقط — Nominatim محجوب محليًّا) | ⏳ محليًّا `status=error` ⇒ «لا نتيجة» **بلا تعطّل**؛ مسار `ma` يُتحقَّق بعد الدفع على الإنتاج |

**Regression:**
- ✅ مسح الصندوق ⇒ `filtered=22` والشبكة تعيد 22 بطاقة.
- ✅ النقر ⇒ `_dscPickPlace(r)` بالـslug/cc الصحيحين.
- ✅ الهيرو سليم: `#search-input` + `onSearch` + `#cities-suggestions` + `fetchCountrySearchSuggestions` كلّها قائمة بلا مساس.
- ✅ **0 أخطاء console** · فحص بناء inline JS: نُقطتان، 0 أخطاء.

## 10) ما لم يُمَسّ
✅ بحث الهيرو (`onSearch`/`fetchCountrySearchSuggestions`/`#cities-suggestions`) · `curated-places.json` · `db/cities-{cc}.json` · slugs · canonical/hreflang/sitemap · SEO/Title/H1 · مصدر المدن (`#country-cities-data` المحقون) · تصنيف ماكاو · أذكار · حساب الصلاة · `/api/search-place` (مُستهلَك فقط، غير معدَّل). **بلا CSS جديد** (إعادة استخدام أصناف قائمة).

## 11) الملفّات المعدَّلة
| الملفّ | التغيير | الأسطر |
|---|---|---|
| `prayer-times-cities.html` | `onCountryCityFilter`: + `_gridDiscoverTimer` + استدعاء اكتشاف عند 0 محليّ؛ دالّة جديدة `_countryFilterDiscovery` (fetch + validate + dedup + same/other + بطاقات في الشبكة + نقر→`_dscPickPlace`). | +54/−0 |
> `git diff --stat`: **ملفّ واحد، +54/−0** (لا حذف ⇒ لا churn في نهايات الأسطر). فحص inline JS ✓. `_check_inline_js.mjs` أداة فحص (غير مُلتزَمة).

## 12) رسالة commit المقترحة
```
fix(country): COUNTRY-PRAYER-PAGE-CITY-SEARCH-DISCOVERY-UI-FIX-1 — connect country city filter to discovery search
```

---
**ملخّص:** صندوق البحث فوق شبكة المدن صار يطبّق **نفس سياسة البحث المعتمدة**: محليّ أوّلًا ⇒ عند 0 نتيجة + `q≥2` بحث `/api/search-place` ⇒ تحقّق `countryCode` ⇒ بطاقة «مدينة مكتشَفة» (نفس الدولة) أو «دولة أخرى» (مختلفة، غير مدموجة) ⇒ نقر يحفظ عبر `/api/place-selected` وينتقل. «الصويرة» العربيّة تظهر «العراق · دولة أخرى» لا كمدينة مغربيّة (القضيّة C في تذكرة منفصلة). «Essaouira→ma» مسار external يُتحقَّق على الإنتاج بعد الدفع.

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: COUNTRY-PRAYER-PAGE-CITY-SEARCH-DISCOVERY-UI-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
