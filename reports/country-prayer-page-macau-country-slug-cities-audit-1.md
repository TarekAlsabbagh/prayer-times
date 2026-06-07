# تقرير تدقيق: COUNTRY-PRAYER-PAGE-MACAU-COUNTRY-SLUG-CITIES-AUDIT-1

**النوع:** تدقيق فقط (Audit). **لا تعديل · لا commit · لا push.**
**الإصدار المفحوص:** working tree على `8c578d0` + preview محليّ (`localhost:3000`).
**أداة التحقّق:** قراءة الكود + `node` على `curated-places.json` + preview DOM حيّ.

---

## 1) وصف المشكلة
على صفحات تعرض **ماكاو** (مثل `/prayer-times-in-macau`)، رابط الدولة في فتات الخبز (breadcrumb) يُولَّد كـ **`/prayer-times-in-mo`** — أي يستخدم **`countryCode` (`mo`)** بدل slug دولة صحيح. وعند فتح `/prayer-times-in-mo` لا تظهر مدن: الصفحة تُخدَم كـ**صفحة مدينة SPA** لا كصفحة دولة، وتبقى **spinner** بلا قائمة مدن، وعنوانها يصبح «...في **Mo**...».

## 2) خطوات إعادة الإنتاج
1. افتح `/prayer-times-in-macau` (صفحة مدينة ماكاو — تعمل، تعرض مواقيت ماكاو).
2. افحص رابط الدولة في الـbreadcrumb (`#bc-country`).
3. النتيجة: `href = /prayer-times-in-mo` (وليس slug دولة).
4. افتح `/prayer-times-in-mo` ⇒ صفحة SPA، `citiesGridCount=0`، spinner، بلا `#cities-container`.

## 3) الرابط الذي يأخذ إلى `/prayer-times-in-mo`
من DOM الحيّ على `/prayer-times-in-macau`:
```
{ id: "bc-country", cls: "bc-link",
  text: "مواقيت الصلاة في ماكاو",
  href: "http://localhost:3000/prayer-times-in-mo" }
```
⇒ المصدر هو **رابط الدولة في الـbreadcrumb** (`#bc-country`). (ملاحظة: نفس المنطق يولّد رابط الدولة على بقية صفحات المدينة — `/moon-today-in-macau`, `/next-prayer-in-macau` — لأنّها تشترك في باني الـbreadcrumb نفسه.)

## 4) مصدر هذا الرابط في الكود
- **عميل** `js/app.js`:
  - `_getCurrentCountrySlug()` (≈9233) → `makeCountrySlug(currentCountryCode, currentEnglishCountry)`.
  - بناء الـbreadcrumb (≈8601, 8666, 8683): `countrySlug = makeCountrySlug(...)` ثمّ `countryHref = …/prayer-times-in-${countrySlug}` ويُسنَد إلى `#bc-country`.
  - **`makeCountrySlug(cc, englishName)` (12451–12462)** — جوهر العطل:
    ```js
    const name = englishName || COUNTRY_EN_NAMES[cc];
    if (name) return slugify(name);
    return cc;           // ← fallback يُعيد رمز الدولة الخام
    ```
- **خادم** `server.js` (نفس النمط، يؤكّد أنّ الرابط يصدر حتى من SSR):
  - `makeCountrySlugSrv(cc)` (1644–1653): `name = COUNTRY_NAMES_EN[cc]; if(name) return slugify(name); return cc;`
  - breadcrumb SSR (≈17566): `_countrySlugSsr = makeCountrySlugSrv(cc)` → `/prayer-times-in-${_countrySlugSsr}`.

## 5) هل `mo` هو countryCode أم slug؟
**`mo` = countryCode** (ISO، Macao). ليس slug دولة. الرابط يستخدمه خطأً كـslug بسبب fallback أعلاه.

## 6) هل يوجد countrySlug لماكاو؟
**لا.** مدخل ماكاو في curated لا يحوي حقل `countrySlug`. الشكل الفعليّ:
```json
{ "slug": "macau", "type": "city", "countryCode": "mo",
  "admin": { "countryEn": "Macao", "countryAr": "ماكاو", ... },
  "priority": 95, "names": { "ar":"ماكاو", "en":"Macau", ... } }
```
`slug = "macau"` هو slug **المدينة** (يعمل: `/prayer-times-in-macau` = صفحة مدينة صحيحة). لا يوجد slug على مستوى الدولة.

## 7) هل ماكاو موجودة في curated data؟
**نعم — مدخل واحد** فقط، مصنَّف `type:"city"` (countryCode `mo`، countryEn `Macao`). لا توجد قائمة مدن متعدّدة لماكاو (هي إقليم/مدينة واحدة).

## 8) هل `/api/cities` يرجع مدنًا لـ `mo`؟
**نعم.** `/api/cities?cc=mo` → `200`, `X-Source: curated`, **count=1** (ماكاو نفسها). طبقة البيانات سليمة:
| cc | count | cc | count |
|---|---|---|---|
| mo | 1 | ae | 26 |
| hk | 3 | my | 53 |
| tw | 8 | | |
⇒ المشكلة **ليست** في الـAPI (التصنيف C **مستبعَد**).

## 9) هل `/prayer-times-in-mo` معروف أم slug غير صالح؟
**غير صالح كدولة.** `_countryFromSlug(slug)` (server.js 6730) يدور على مفاتيح `COUNTRY_NAMES_EN` ويقارن `makeCountrySlugSrv(cc) === slug`؛ لا cc ينتج `"mo"` ⇒ يُعيد `{cc:'__'}` ⇒ `isCountry=false` (24450–24452) ⇒ يُخدَم **`index.html` (SPA)** كأنّ `mo` slug مدينة. لا توجد مدينة بـslug `mo` ⇒ spinner بلا بيانات. **لا 404، لا redirect** — الراوتر يقبل الـslug الخاطئ بصمت.
> تأكيد محليّ بالبايتات: `/prayer-times-in-mo` و`/macau` و`/hong-kong` و`/taiwan` = ~488KB **`index.html`** (`spaTpl=true`)، بينما `/united-arab-emirates` و`/malaysia` = ~142KB **`prayer-times-cities.html`** (`countryTpl=true`).

## 10) هل المشكلة خاصة بماكاو أم تشمل HK/AE وغيرها؟
**تشمل 9 دول/أقاليم** موجودة في curated لكنّها **غائبة عن `COUNTRY_NAMES_EN`** (والخريطة العميلة `COUNTRY_EN_NAMES`):
| cc | الاسم | مدن curated | cc | الاسم | مدن curated |
|---|---|---|---|---|---|
| lv | Latvia | 19 | is | Iceland | 4 |
| tw | Taiwan | 8 | ee | Estonia | 4 |
| lt | Lithuania | 8 | hk | Hong Kong | 3 |
| cy | Cyprus | 5 | me | Montenegro | 3 |
| | | | mo | **Macau** | 1 |
**المجموع: 9 ccs / 55 مدينة curated** تتأثّر بنفس العطل. أمّا **AE/SA/MY/CN** فموجودة في الخريطة ⇒ روابطها صحيحة (`/prayer-times-in-united-arab-emirates`…) وصفحاتها country تعمل (AE country = 142KB، 26 مدينة).
> الفحص العمليّ أكّد: client `COUNTRY_EN_NAMES` ينقصه أيضًا mo/hk/tw، وserver `COUNTRY_NAMES_EN` (152 مفتاحًا) ينقصه الـ9 جميعًا.

## 11) سبب بقاء الصفحة فارغة/spinner
`/prayer-times-in-mo` يُخدَم كصفحة **مدينة SPA** بـslug غير معروف (`mo`):
- `_countryFromSlug('mo')='__'` ⇒ ليست صفحة دولة (لا يُحمَّل قالب المدن، لا `#cities-container`، لا `#results-count`).
- كمدينة: لا curated/db يطابق slug `mo` ⇒ لا إحداثيّات/بيانات ⇒ `spinnerPresent=true`، `citiesGridCount=0`، العنوان «...في **Mo**» (من `_slugToTitle`).
- (ملاحظة جانبيّة: ظهور «ماكاو» في H1 أثناء الاختبار ناتج عن تسرّب حالة sessionStorage من زيارة `/prayer-times-in-macau` السابقة؛ على زيارة نظيفة يظهر «Mo». هذا أثر عرض ثانويّ لا يغيّر الجذر.)

## 12) التصنيف A/B/C/D/E/F
| الرمز | الوصف | ينطبق؟ |
|---|---|---|
| **A** | الرابط يستخدم countryCode بدل country slug | ✅ **نعم** — `makeCountrySlug`/`makeCountrySlugSrv` يُعيدان `cc` عند تعذّر الاسم. |
| **B** | ماكاو غائبة عن خريطة slug الدول | ✅ **نعم (الجذر الأعمق)** — mo (+8) غائبة عن `COUNTRY_NAMES_EN` و`COUNTRY_EN_NAMES`. حتى لو كان الرابط `/prayer-times-in-macao` لما عُرِف كدولة. |
| **C** | `/api/cities` لا يدعم countryCode لماكاو | ❌ لا — الـAPI يُرجع المدن (mo=1). |
| **D** | لا توجد قائمة مدن على مستوى الدولة | ⚠️ قرار بيانات — ماكاو مدخل واحد (مدينة)؛ HK=3, TW=8 لديها مدن. ليست «لا بيانات» بل «غير معترَف بها كدولة». |
| **E** | الراوتر يقبل slug مجهولًا ويُظهر spinner فارغًا | ✅ **نعم (العَرَض)** — `/prayer-times-in-mo` لا يُرفَض (لا 404/redirect)، يسقط لصفحة مدينة فارغة. |
| **F** | يجب توجيه ماكاو لصفحة الصين | ⚠️ قرار بيانات — ماكاو في curated إقليم مستقلّ (mo / Macao)، ليست تحت China. التوجيه للصين قرار سياسة بيانات يحتاج توثيقًا، **غير محسوم الآن**. |
**الخلاصة:** الجذر = **A + B** (B الأعمق)، والعَرَض = **E**. D/F قرارات بيانات تُوثَّق ولا تُحسَم في هذا التدقيق.

## 13) الإصلاح المقترح (بدون تنفيذ)
مسارات محتملة (تُحسَم في تذكرة الإصلاح):
1. **سدّ خريطة الدول** — إضافة `mo/hk/tw` (+ `cy/ee/is/lt/lv/me`) إلى `COUNTRY_NAMES_EN` (خادم) و`COUNTRY_EN_NAMES` (عميل) بأسماء إنجليزيّة قانونيّة (Macao/Hong Kong/Taiwan/…). أثره: `_countryFromSlug` يعترف بالـslug ⇒ يُخدَم قالب الدولة ⇒ `/api/cities` يملأ المدن (1/3/8…).
   - ⚠️ **تعارض slug**: slug دولة ماكاو سيكون `macao`/`macau` بينما slug **المدينة** الحاليّ `macau`. يلزم سياسة فضّ تعارض (مثل نمط `-city` المستخدم للعواصم الدقيقة في server.js:1639، أو اعتبار ماكاو **مدينة فقط** بلا صفحة دولة).
2. **تحصين باني الرابط** — منع `makeCountrySlug`/`makeCountrySlugSrv` من إصدار رمز cc خام كـslug عامّ؛ عند تعذّر الاسم **يُخفى رابط الدولة** بدل توليد `/prayer-times-in-{cc}`.
3. **تحصين الراوتر** — عند `_countryFromSlug` يُرجع `'__'` لـslug من حرفين (نمط cc): إرجاع **404** أو **redirect canonical** بدل صفحة SPA فارغة (يغطّي التصنيف E عمومًا).
4. **قرار بيانات منفصل** — لكلّ من ماكاو/HK/TW: هل هي «دولة» (صفحة مدن) أم «مدينة فقط» (إخفاء رابط الدولة)؟ + قرار F (هل ماكاو تابعة للصين؟).
> التوصية الأوّليّة: دمج (2)+(3) كتحصين عامّ آمن، ثمّ (1)+(4) كقرار بيانات لكلّ إقليم. القرار النهائيّ للمستخدم في تذكرة الإصلاح.

## 14) اسم تذكرة الإصلاح المقترحة
**`COUNTRY-PRAYER-PAGE-COUNTRY-SLUG-MAPPING-FIX-1`**

## 15) الملفّات المتوقَّعة للإصلاح
- `server.js` — `COUNTRY_NAMES_EN` (≈1600) · `makeCountrySlugSrv` (≈1644) · `_countryFromSlug` (≈6730) · حارس الراوتر isCountry/404 (≈24450) · breadcrumb SSR (≈17566).
- `js/app.js` — `COUNTRY_EN_NAMES` · `makeCountrySlug` (≈12451) · باني breadcrumb `#bc-country` (≈8601/8666).
- `prayer-times-cities.html` — حسم slug→cc لو اعتُمد مسار «دولة لهذه الأقاليم» (≈512–626).
- `db/places/curated-places.json` — **فقط** لو قُرِّر إضافة حقل `countrySlug` أو فضّ تعارض slug (قرار بيانات منفصل).
- اختبارات/تقرير الإصلاح.

## 16) تأكيد: تدقيق فقط
✅ هذه مرحلة **Audit فقط**. لم يُعدَّل أيّ ملفّ إنتاج (`git status` للملفّات المتتبَّعة دون تغيير عدا هذا التقرير الجديد). لم تُلمَس curated/مصدر المدن/navbar/search/SEO/H1/slugs/canonical/hreflang/sitemap/صفحات الأذكار.

## 17) تأكيد: لا commit / لا push
✅ لم يُنفَّذ **أيّ commit** ولا **push**. التقرير وثيقة فقط.

---
**الخلاصة:** الرابط `/prayer-times-in-mo` ينشأ لأنّ `makeCountrySlug('mo','')` يسقط إلى إرجاع رمز الدولة الخام (englishCountry فارغ + `mo` غائبة عن خريطة أسماء الدول). والأعمق: **ماكاو + 8 أقاليم/دول** غائبة عن `COUNTRY_NAMES_EN`، فلا يعترف بها الخادم كدول، فيُخدَم slugها كصفحة مدينة SPA فارغة (spinner) دون 404. التصنيف **A + B (+ E)**. التذكرة المقترحة: **COUNTRY-PRAYER-PAGE-COUNTRY-SLUG-MAPPING-FIX-1**.

**النتيجة المقترحة:** ✅ تدقيق مكتمل — للإغلاق أرسِل: `اعتماد وإغلاق تقرير: COUNTRY-PRAYER-PAGE-MACAU-COUNTRY-SLUG-CITIES-AUDIT-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
