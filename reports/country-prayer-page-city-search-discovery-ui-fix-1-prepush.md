# تقرير ما قبل الدفع (مُحدَّث — نطاق مُعدَّل): COUNTRY-PRAYER-PAGE-CITY-SEARCH-DISCOVERY-UI-FIX-1

**النوع:** إصلاح UI — وصل مربّع البحث فوق شبكة المدن (`#country-city-filter`) بالبحث الموسّع **مقيَّدًا بنفس الدولة فقط**.
**الحالة:** التصحيح غير مدفوع — بانتظار اعتمادك. (انظر §12 — حالة الدفع: نسخة cross-country السابقة `3272034` دُفعت قبل وصول مقاطعتك.)
**النطاق:** ملفّ واحد — `prayer-times-cities.html`. **بلا** server.js/app.js/curated/css/db/i18n.

> ⚠️ **شفافيّة:** أمر `git push` للنسخة الأولى (التي كانت تعرض «دولة أخرى») **اكتمل** قبل أن تصل مقاطعتك (التي أوقفت خطوة *التحقّق من الإنتاج*، لا الدفع). `origin/main = 3272034`. هذا التقرير يصف **التصحيح** (same-country only)، وسيُدفع كـ commit تصحيحيّ بعد اعتمادك.

---

## القرار الجديد المُعتمَد (النطاق)
داخل صفحة الدولة `/prayer-times-in-{country}`، مربّع البحث فوق الشبكة يعرض **فقط مدن نفس الدولة الحالية** — سواء محليّة (curated) أو مكتشَفة من `/api/search-place` بشرط `countryCode === الدولة الحالية`. **أيّ نتيجة من دولة أخرى تُتجاهَل تمامًا** (لا تظهر، ولا كـ«دولة أخرى»)، وتظهر بدلها رسالة: «لم نجد مدينة مطابقة داخل هذه الدولة.»

## النقاط السبع المطلوبة (صريحة)
1. **بحث شبكة الدولة لا يعرض نتائج من دول أخرى** ✅ — `_countryFilterDiscovery` يُبقي فقط `countryCode === countryCode` الحاليّ.
2. **cross-country تُتجاهَل في هذا السياق** ✅ — لا مصفوفة `other`، ولا شارة «دولة أخرى»، ولا رابط لمدينة خارج الدولة.
3. **no-results تظهر عند غياب نتيجة داخل نفس الدولة** ✅ — `_dscNoResultInCountryLabel()` («لم نجد مدينة مطابقة داخل هذه الدولة.» + 9 لغات).
4. **بحث الهيرو العامّ لم يتغيّر** ✅ — `fetchCountrySearchSuggestions`/`#search-input`/`#cities-suggestions` يبقى cross-country (يعرض «دولة أخرى»). مُثبَت حيًّا (دبي في الهيرو ⇒ عنصران + «دولة أخرى»).
5. **`/api/search-place` لم يتغيّر** ✅ — مُستهلَك فقط (GET)، بلا تعديل خادم.
6. **لا كتابة في curated أو db** ✅ — `curated-places.json` و`db/cities-{cc}.json` بلا مساس؛ المكتشَف يُحفظ فقط عبر `/api/place-selected` عند النقر (Supabase `discovered_places`).
7. **نتائج اختبار Dubai والصويرة** ✅ — أدناه §9.

## 1) سبب التنفيذ + سبب تعديل النطاق
الأصل: المربّع كان محليًّا بحتًا (تصنيف A في تدقيق المغرب). النسخة الأولى وصلته بالبحث الموسّع لكنّها عرضت نتائج الدول الأخرى كبطاقة «دولة أخرى». قرارك الجديد: داخل صفحة دولة محددة البحث **سياقيّ** — يجب ألّا يُظهِر مدن دول أخرى إطلاقًا.

## 2) المربّع والمعالج
| المربّع | المعرّف | المعالج | السلوك بعد التصحيح |
|---|---|---|---|
| **فوق الشبكة** | `#country-city-filter` | `onCountryCityFilter` → `_countryFilterDiscovery` | محليّ أوّلًا ⇒ عند 0 بحث موسّع **مقيَّد بنفس الدولة** |
| الهيرو | `#search-input` | `onSearch` → `fetchCountrySearchSuggestions` | **لم يُمَسّ** (cross-country كما هو) |

## 3) منطق التدفّق
`onCountryCityFilter` (بلا تغيير عن النسخة الأولى): فلتر محليّ أوّلًا ⇒ عند `filtered.length===0 && q.length>=2` ⇒ `setTimeout(_countryFilterDiscovery, 300)` (debounce + `clearTimeout`).
`_countryFilterDiscovery(q)`: «جارٍ البحث» ⇒ `fetch('/api/search-place')` ⇒ حارس قِدَم ⇒ **فلترة same-country فقط** ⇒ بطاقات أو رسالة in-country.

## 4) القاعدة المُطبَّقة في الكود
```js
const same = results.filter(r =>
    r && typeof r.slug==='string' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(r.slug) &&
    /^[a-z]{2}$/.test((r.countryCode||'').toLowerCase()) &&
    (r.countryCode||'').toLowerCase() === countryCode &&   // ← نفس الدولة فقط (cross-country يسقط)
    isFinite(r.lat) && isFinite(r.lng) && typeof r.timezone==='string' && r.timezone &&
    !existing.has(r.slug.toLowerCase()));
if (!same.length) { container.innerHTML = `<div class="status-msg">${_dscNoResultInCountryLabel()}</div>`; return; }
```
لا توجد مصفوفة `other` ولا `_dscOtherCountryBadge` في هذه الدالّة بعد التصحيح.

## 5) عرض البطاقة + الرسالة
- **same-country موجودة:** بطاقات `.cities-grid`/`.city-link` في منطقة الشبكة، الشارة «مدينة مكتشَفة»، رابط `/[lang]/prayer-times-in-{slug}` (حتى 8). **بلا CSS جديد.**
- **لا نتيجة داخل الدولة:** رسالة مترجمة «لم نجد مدينة مطابقة داخل هذه الدولة.» (10 لغات) — منفصلة عن `_dscNoResultLabel` (الذي يخصّ الهيرو ويذكر البحث العامّ، تُرك كما هو).

## 6) dedup + validation
نفس قواعد السياسة: slug صالح + cc لغتان + lat/lng منتهية + timezone نصّ + **`!existing.has(slug)`** (لا تكرار لمدينة موجودة في الشبكة) + **`=== countryCode`**.

## 7) النقر → `_dscPickPlace(r)`
النقر يستدعي `_dscPickPlace` (المشتركة): POST `/api/place-selected` (إن `source!=='curated'`) + بذر sessionStorage + `pageUrl('/prayer-times-in-'+slug)`. **بلا** كتابة curated/db.

## 8) لا ترجمة runtime
الاسم = `r.displayName || r.secondaryName || r.slug`، الدولة = `r.countryName`، slug من الـendpoint. لا Nominatim/Wikidata client، لا fillchain، لا slug مولَّد.

## 9) نتائج الاختبار المحليّ (preview على البايتات المُصحَّحة)
| # | الصفحة + الاستعلام | المتوقَّع | النتيجة |
|---|---|---|---|
| 1 | morocco + **Rabat** | محليّ، بلا اكتشاف | ✅ بطاقة `/prayer-times-in-rabat`، discoveryFired=false |
| 2 | morocco + **Dubai** (cc=ae) | لا بطاقة، لا «دولة أخرى»، رسالة in-country | ✅ 0 بطاقة، «لم نجد مدينة مطابقة داخل هذه الدولة.»، anyOtherBadge=false |
| 3 | morocco + **الصويرة** (cc=iq) | لا بطاقة عراقيّة، رسالة in-country | ✅ 0 بطاقة، الرسالة، لا «دولة أخرى»، لا العراق |
| 4 | morocco + **Essaouira** (محليًّا: external محجوب) | رسالة in-country | ✅ 0 بطاقة، الرسالة، بلا تعطّل |
| 4b | morocco + **Essaouira** — محاكاة `fetch` ترجع cc=ma **و** cc=iq | بطاقة ma فقط، إسقاط iq | ✅ **بطاقة واحدة** «الصويرة · المغرب · مدينة مكتشَفة» `/prayer-times-in-essaouira`؛ العراقيّة **أُسقطت** (anyIraqShown=false) |
| 5 | saudi-arabia + **Dubai** (cc=ae) | لا تظهر دبي، رسالة in-country | ✅ 0 بطاقة، الرسالة، anyDubaiShown=false |
| 6 | saudi-arabia + **Jeddah** | محليّ | ✅ بطاقة `/prayer-times-in-jeddah` |
| 7 | مسح الصندوق | تعود الشبكة الكاملة | ✅ MA→22، SA→183 |
| 8 | **الهيرو** + Dubai (سعوديّة) | يبقى cross-country «دولة أخرى» | ✅ عنصران + «دولة أخرى» (الهيرو سليم) |
- ✅ **0 أخطاء console** · فحص inline JS: نقطتان، 0 أخطاء.

## 10) ما لم يُمَسّ
✅ بحث الهيرو (`onSearch`/`fetchCountrySearchSuggestions`/`_dscNoResultLabel`/`_dscOtherCountryBadge`) · `/api/search-place` · `/api/place-selected` · `curated-places.json` · `db/cities-{cc}.json` · slugs · canonical/hreflang/sitemap · SEO/Title/H1 · مصدر المدن · تصنيف ماكاو · أذكار · حساب الصلاة. **بلا CSS جديد.**

## 11) الملفّات المعدَّلة (التصحيح)
| الملفّ | التغيير | الأسطر (مقابل 3272034) |
|---|---|---|
| `prayer-times-cities.html` | `_countryFilterDiscovery`: same-country فقط (حذف `other` + `_dscOtherCountryBadge`)؛ + `_dscNoResultInCountryLabel()` (10 لغات). | **+38 / −16** |
> فحص inline JS ✓.

## 12) حالة الدفع + رسالة commit
- **`origin/main = 3272034`** (نسخة cross-country دُفعت قبل المقاطعة؛ Render قد ينشرها مؤقّتًا).
- **خياران للتصحيح** (لن أُنفّذ أيًّا منهما قبل اعتمادك):
  - **(أ) Forward-fix (موصى به، آمن):** commit تصحيحيّ جديد فوق 3272034 يُقيّد النطاق ⇒ `git push` عاديّ. لا إعادة كتابة تاريخ.
  - **(ب) Amend + force-push:** دمج التصحيح في 3272034 و`git push --force` ⇒ تاريخ بنسخة واحدة، لكنّه **مدمِّر** (إعادة كتابة `main` المنشور).
- رسالة الـcommit (إن forward-fix، أقترح توضيح النطاق مع إبقاء اسم التذكرة):
  ```
  fix(country): COUNTRY-PRAYER-PAGE-CITY-SEARCH-DISCOVERY-UI-FIX-1 — restrict country city filter to same-country results
  ```
  (أو الإبقاء على الرسالة الأصليّة حرفيًّا إن رغبت.)

---
**الخلاصة:** صندوق شبكة الدولة الآن **سياقيّ بحت داخل الدولة**: محليّ أوّلًا ⇒ عند 0 بحث `/api/search-place` يُبقي فقط `countryCode === الدولة` ⇒ بطاقة «مدينة مكتشَفة» أو رسالة «لم نجد مدينة مطابقة داخل هذه الدولة». دبي/الصويرة (cc≠الدولة) **لا تظهران إطلاقًا**. الهيرو وكلّ شيء آخر بلا مساس.

**للاعتماد أرسِل:** `أعتمد دفع تقرير: COUNTRY-PRAYER-PAGE-CITY-SEARCH-DISCOVERY-UI-FIX-1` — مع تحديد **(أ) forward-fix** أم **(ب) amend+force-push**. (إن لم تحدّد، أعتمد forward-fix الآمن.)

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
