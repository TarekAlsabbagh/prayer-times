# تقرير تدقيق + خطة: COUNTRY-PRAYER-PAGE-PREHYDRATED-CITIES-DATA-AUDIT-1

**النوع:** تدقيق + خطة فقط (read-only). **لم يُعدَّل أيّ ملفّ. لا commit/push.**
**الهدف:** جعل بيانات مدن الدولة (صفحة الدولة + قسم مدن الدولة في صفحة المدينة) **جاهزة محقونة عند الإطلاق** من قاعدة curated الحاليّة، بلا اعتماد على API وقت التشغيل أو legacy، مع إبقاء سياسة البحث المعتمدة عند غياب المدينة.

---

## 1) الهدف
إزالة الاعتماد على نداء `/api/cities` وقت التشغيل (+spinner) لعرض مدن الدولة، بحقن البيانات curated مسبقًا في الصفحة (SSR/prehydrate) — مع الحفاظ على `names[lang]→names.en`، الروابط localized، وسياسة `/api/search-place` للمدن غير الموجودة.

## 2) الوضع الحالي لصفحات الدولة (`/prayer-times-in-{country}`)
- تُخدَم من `prayer-times-cities.html`. المدن تُجلب **client-side** عبر `fetchCities()` (السطر 1330): `sessionStorage` cache → وإلّا `fetch('/api/cities?cc=')` (مهلة 120s) مع **spinner** (`showLoading('جاري تحميل المدن...')`).
- المصدر = **curated** (`/api/cities` → `_curatedCitiesForCc` → `_CURATED_PLACES`، ترويسة `X-Source: curated`، `Cache-Control: no-store`).
- JSON-LD `ItemList` (أبرز 100) يُحقَن **client-side** بعد الجلب (`injectCitiesItemList`).
- ⇒ **ليست SSR-visible؛ نداء API وقت التشغيل + spinner** (الخيار D فعليًّا).

## 3) الوضع الحالي لقسم مدن الدولة في صفحة المدينة (`#country-cities-section`)
- في `index.html` (SPA). يُملأ عبر `updateCountryCitiesSection` → `requestIdleCallback` → `fetch('/api/cities?cc=')` (نفس مصدر curated) → `renderCountryCities`.
- القسم يبدأ `display:none` + يُملأ بعد idle. **client-fetch، مؤجَّل، غير SSR.** (بعد SEARCH-DISCOVERY-FIX-1: يعرض كلّ المدن incl. الحاليّة.)

## 4) مصدر البيانات الحاليّ
**curated فقط** عبر `_curatedCitiesForCc(cc)` (server.js:102) من `db/places/curated-places.json`. **لا** `db/cities-{cc}.json`، لا `STATIC_CITIES`، لا Wikidata/Nominatim لعرض القائمة. ✅ نظيف.

## 5) هل المدن SSR-visible؟
**لا.** HTML الخام لصفحة الدولة يحوي **spinner** فقط («جاري تحميل المدن...»)؛ المدن تظهر بعد JS+fetch. قسم صفحة المدينة كذلك (`display:none` حتى idle+fetch).

## 6) هل يوجد fetch وقت التشغيل؟
**نعم** — كلا السطحين ينادي `/api/cities?cc=` بعد التحميل (مع cache جلسة/idle). 

## 7) هل يوجد spinner أو تأخير؟
**نعم** — صفحة الدولة: spinner صريح حتى يعود الـfetch. صفحة المدينة: تأخير `requestIdleCallback` (القسم مخفيّ ثمّ يظهر). كلاهما عرضة لـCLS/تأخير على الشبكات البطيئة.

## 8) عدد الدول والمدن في curated
**2977 مكانًا · 130 دولة.** توزيع الأحجام:
| الحجم/دولة | عدد الدول |
|---|---|
| 1 مدينة | 21 |
| 2–10 | 39 |
| 11–50 | 51 |
| 51–100 | 14 |
| 101–200 | 5 |
| 201+ | 0 |
الأكبر: in 199 · sa 183 · pk 148 · us 126 · de 106 · id 82.

## 9) جدول الأعداد + الأحجام للدول المرجعيّة
| cc | الدولة | count | payload خام | gzip≈ | تغطية الأسماء (ar/en) | single? | تعارض slug |
|---|---|---|---|---|---|---|---|
| sa | Saudi Arabia | 183 | 49 KB | **14 KB** | 100/100 | لا | لا |
| in | India | 199 | 36 KB | **11 KB** | 100/100 | لا | لا |
| pk | Pakistan | 148 | 25 KB | 7.4 KB | 100/100 | لا | لا |
| id | Indonesia | 82 | 18 KB | 4.7 KB | 100/100 | لا | لا |
| my | Malaysia | 53 | 11 KB | 3.2 KB | 100/100 | لا | لا |
| bd | Bangladesh | 38 | 6.7 KB | 2.3 KB | 100/100 | لا | لا |
| ae | UAE | 26 | 7.6 KB | 2.2 KB | 100/100 | لا | لا |
| cn | China | 10 | 2.6 KB | 1.0 KB | 100/100 | لا | لا |
| tw | Taiwan | 8 | 2.3 KB | 0.7 KB | 100/100 | لا | لا |
| hk | Hong Kong | 3 | 0.9 KB | 0.4 KB | 100/100 | لا | **نعم** (مدينة hong-kong) |
| mo | Macau | 1 | 0.24 KB | 0.16 KB | 100/100 | **نعم** | **نعم** (مدينة macau) |
> `ar/en` تغطية 100% في كلّ الدول؛ `bn/ur/id` متفاوتة (مثال IN id=9% · PK bn=7%) — يُغطّيها `names[lang]→names.en` بلا ترجمة runtime. **الأكبر = SA 14KB gzip** — حجم prehydrate مقبول جدًّا.

## 10) توصية حقن البيانات
**الخيار B — Prehydrated JSON داخل HTML** (موصى به):
حقن `<script type="application/json" id="country-cities-data">[…curated list…]</script>` (أو `window.__COUNTRY_CITIES__`) **server-side** في:
- صفحة الدولة: القائمة الكاملة للـcc.
- صفحة المدينة: قائمة مدن `currentCountryCode`.
ثمّ الـclient يرسم منها **فورًا** (بلا `/api/cities` fetch، بلا spinner). يُبقى `/api/cities` كـ**fallback** ولسياسة البحث.
> 🏗️ **سند معماريّ:** server.js يحقن **أصلًا** بذور SSR لكلّ مكان (`window.__PRAYER_CITY__` السطر 21707 · `__QIBLA_CITY__` · `__POPULAR_CITY_NAMES__`) في هذه الـHTML — لكنّه **لا يحقن قائمة المدن**. فإضافة حقن القائمة **امتداد طبيعيّ منخفض المخاطر** لنقطة الحقن القائمة.

## 11) مقارنة SSR vs Prehydrated JSON vs Static JSON
| المعيار | A: SSR HTML كامل | **B: Prehydrated JSON** | C: Static JSON files | D: /api/cities (الحاليّ) |
|---|---|---|---|---|
| جاهز عند الإطلاق | ✅ | ✅ | شبه (fetch سريع) | ❌ (fetch+spinner) |
| بلا fetch بعد التحميل | ✅ | ✅ | ❌ | ❌ |
| حجم HTML | **ثقيل** (markup/مدينة × لغات) | خفيف (JSON، ≤14KB gz) | الأخفّ | الأخفّ |
| SEO (مدن مرئيّة بلا JS) | **الأقوى** | متوسط (JSON-LD يبقى للSEO) | ضعيف | ضعيف |
| تعقيد البناء/الإصدار | متوسط | **منخفض** | عالٍ (versioning/cache) | منخفض |
| TTFB/LCP | قد يتأثّر | جيّد | جيّد | جيّد لكن spinner |
| إعادة الاستخدام | — | يعيد استخدام حقن SSR القائم | endpoint/CDN جديد | — |
**الخلاصة:** B يحقّق «جاهز بلا spinner» بأقلّ مخاطرة وحجم معقول، ويُبقي JSON-LD للSEO. A مبالغ (markup ضخم متكرّر عبر اللغات) وC يضيف تعقيد build/cache دون إلغاء الـfetch.

## 12) سياسة البحث عند عدم وجود مدينة (تبقى كما اعتُمِدت)
عند بحث عن مدينة خارج البيانات المحقونة: **local curated filter أوّلًا** (على القائمة المحقونة) → **`/api/search-place`** (curated→discovered→external) → **countryCode validation** → **discovered كرابط منفصل** (لا دمج في الشبكة) → النقر `/api/place-selected` (discovered، **لا** curated، **لا** `db/cities-*.json`) — هذا مطبَّق فعلًا في SEARCH-DISCOVERY-FIX-1 ولا يتغيّر.

## 13) هل يلزم تعديل `/api/search-place`؟
**لا.** يعمل وفق العقد المطلوب (يُرجع `slug/countryCode/names/displayName/timezone/source`). البحث الموسّع يستهلكه كما هو. (تأكيد إنتاج: `/api/search-place` external=ok على الإنتاج.)

## 14) الملفّات المتوقَّعة للإصلاح (عند الاعتماد)
- `server.js` — حقن `country-cities-data` (JSON من `_curatedCitiesForCc(cc)`) في SSR لـ`prayer-times-cities.html` (صفحة الدولة) و`index.html` (صفحة المدينة، حسب `__PRAYER_CITY__.cc`)؛ اختياريًّا نقل JSON-LD ItemList لـserver-side للSEO.
- `prayer-times-cities.html` — `fetchCities` يقرأ `#country-cities-data` المحقون أوّلًا (إن وُجد) ويتخطّى `/api/cities`؛ يبقى الـAPI fallback.
- `js/app.js` — `updateCountryCitiesSection`/`renderCountryCities` يقرأ المحقون أوّلًا للمدينة.
- (اختياري) `css/style.css` — لا تغيير متوقَّع.
- **بلا** `curated-places.json` · **بلا** legacy. + بمب cache-busters المعتاد.

## 15) اسم تذكرة الإصلاح المقترحة
**`COUNTRY-PRAYER-PAGE-PREHYDRATED-CITIES-DATA-FIX-1`** — حقن prehydrated JSON (الخيار B) لصفحتي الدولة والمدينة + قراءة client من المحقون أوّلًا + إبقاء `/api/cities` fallback و`/api/search-place` للبحث. (يمكن لاحقًا تذكرة SEO منفصلة لـSSR HTML/JSON-LD server-side إن رُغِب — الخيار Hybrid.)

## القرار المقترح
**Option 2 — Prehydrated JSON داخل HTML** كحلّ أساسيّ (متوازن: جاهز، بلا spinner، خفيف، يعيد استخدام حقن SSR القائم، يُبقي السياسات). مع إبقاء باب **Option 4 (Hybrid)** مفتوحًا لاحقًا لو أردنا SSR HTML لأبرز ~12 مدينة لتقوية SEO.

## 16) تأكيد: تدقيق فقط
✅ لم يُعدَّل `server.js`/`js/app.js`/`prayer-times-cities.html`/`index.html`/`css/style.css`/`curated-places.json` ولا أيّ ملفّ آخر. هذا التقرير وثيقة فقط.

## 17) تأكيد: لا commit / لا push
✅ لم يُنفَّذ أيّ commit ولا push.

---
**النتيجة المقترحة:** ✅ تدقيق مكتمل — للإغلاق أرسِل: `اعتماد وإغلاق تقرير: COUNTRY-PRAYER-PAGE-PREHYDRATED-CITIES-DATA-AUDIT-1` ثمّ (إن وافقت) `افتح تذكرة COUNTRY-PRAYER-PAGE-PREHYDRATED-CITIES-DATA-FIX-1`.

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
