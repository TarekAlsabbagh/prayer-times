# تقرير ما قبل الدفع: PALESTINE-DISPLAY-NORMALIZATION-FIX-1

**النوع:** إصلاح عرض — أيّ مكان/مدينة/نتيجة مصدرها Israel (`il` / 🇮🇱) تُعرَض للمستخدم كـ **فلسطين / Palestine / 🇵🇸 / ps** عبر كلّ أسطح البحث وقبل التخزين. **عرض فقط** — لا مساس بالإحداثيّات/التوقيت/حساب الصلاة.
**الحالة:** لم يُدفع — بانتظار اعتمادك.
**القاعدة:** `origin/main = 828dda2`. القراران المعتمدان: (1) تطبيع `/api/place-selected` عند الكتابة ✅، (2) ترك `Asia/Jerusalem` كما هو (للحساب) ✅.

---

## 1) مكان الـnormalizer الجديد
وحدة نقيّة قابلة للاختبار: **`server/place-display-normalize.js`** (95 سطرًا، CommonJS، بلا شبكة/IO). تُصدِّر:
- `PALESTINE_DISPLAY` (أسماؤك العشر) + `PALESTINE_FLAG='🇵🇸'`.
- `isIsraelCc(cc)` · `normalizeCcForDisplay(cc)` (il→ps) · `palestineName(lang)`.
- **`normalizeResultDisplay(r, lang)`** — تطبيع كائن نتيجة بحث: `il`→`{cc:'ps', name:Palestine[lang], flag:'🇵🇸'}`؛ `ps`→يفرض الاسم النظيف Palestine[lang] (فتتطابق نتائج il-المطبَّعة مع ps-الأصليّة، وتختفي صيغة Intl الطويلة «الأراضي الفلسطينية» في 8 لغات).
- **`normalizeStorePayload(p)`** — يطبّع حمولة `/api/place-selected` قبل التخزين: `country_code` il→ps + `admin.country`→خريطة فلسطين، مع **الحفاظ على lat/lng/timezone/names**.

نظير عميليّ مطابق في `js/app.js`: `_PALESTINE_DISPLAY` + `_isIlCc` + `_palestineName`.

## 2) أين استُخدم في الخادم (`server.js`)
- **require** الوحدة (`const _placeDisplay = require('./server/place-display-normalize')`).
- **`_searchCuratedPlaces`** — تطبيع كلّ نتيجة في الخريطة النهائيّة (curated فيها 0 il، فالأثر تلميع اسم ps في 10 لغات).
- **خارجيّ (Nominatim)** — تطبيع الكائن المُعاد (`normalizeResultDisplay(_extResult, code)`).
- **discovered (Supabase)** — تطبيع الكائن المُعاد في `_mapDiscoveredRow`.
- **`/api/place-selected`** — `normalizeStorePayload(place)` بعد parse وقبل التحقّق/التخزين.

## 3) أين استُخدم في العميل (`js/app.js`)
- **`getDisplayCountry()`** (الدالّة **الحيّة** لاسم الدولة، تُستدعى في 12+ موضعًا للصلاة/القمر/القبلة/الزكاة): حارس في الأعلى — `if (_isIlCc(currentCountryCode)) return _palestineName(lang);` ⇒ اسم الدولة لمدينة il يظهر فلسطين في كلّ لغة.
- **`updateCityCountryInfo()`** (هيرو معلومات الدولة): تطبيع `cc` il→ps + متغيّرات الاسم. **ملاحظة شفافة:** عناصر هذا الهيرو (`city-country-info-section`/`city-country-flag`) **غير موجودة في index.html الحاليّ** (أُزيلت في إعادة تصميم سابقة)، فالدالّة تُرجِع مبكرًا والتعديل **حارس دفاعيّ حاليًّا غير فعّال** (يحمي إن أُعيد القسم). التغطية الفعليّة تأتي من `getDisplayCountry`.

## 4) كيف تمّ تطبيع Nominatim
نتيجة Nominatim كانت `_getCountryName('il')='Israel/إسرائيل'` + `_countryCodeToFlag('il')='🇮🇱'` + `countryCode:'il'`. الآن البنّاء يلفّ المُخرَج بـ`normalizeResultDisplay(..., code)` كخطوة أخيرة ⇒ يخرج `ps/Palestine/🇵🇸`. **مؤكَّد حيًّا:** Tel Aviv/Nazareth/Acre → `[Palestine/ps 🇵🇸]`.

## 5) كيف تمّ تطبيع discovered
`_mapDiscoveredRow` يبني الكائن من صفّ Supabase ثمّ يلفّه بـ`normalizeResultDisplay`. حتّى لو احتوى الصفّ `admin.country.en='Israel'` مخزَّنًا، التطبيع يُطبَّق **أخيرًا** فيتجاوزه ويُخرِج Palestine. (Supabase مُعطَّل محلّيًّا ⇒ يُتحقَّق حيًّا على الإنتاج؛ المنطق مُختبَر-وحدة.)

## 6) كيف تمّ تطبيع `/api/place-selected` قبل التخزين
بعد `JSON.parse(body)` مباشرةً: `place = _placeDisplay.normalizeStorePayload(place)` — يحوّل `countryCode` il→ps و`admin.country`→خريطة فلسطين قبل `_isValidDiscoveredInput` و`_upsertDiscoveredPlace`. فلا يتراكم `il` في Supabase مستقبلًا. **الإحداثيّات/التوقيت/أسماء المدينة محفوظة** (مؤكَّد باختبار الوحدة).

## 7) كيف تمّ منع 🇮🇱 من الظهور
**كلّ الأعلام تُشتقّ من `countryCode`** (خادم: emoji عبر `_countryCodeToFlag`؛ عميل: صور `flagcdn/{cc}.png`). بتطبيع `countryCode` المعروض il→ps **في مصدر النتيجة**، كلّ رسّامي الأعلام يُنتِجون 🇵🇸 تلقائيًّا. إضافةً: مسح DOM حيّ أثبت أنّ **صفحة الصلاة لا تعرض علم دولة للمدينة في الهيرو** أصلًا (الأعلام إمّا أعلام لغات أو أقسام تصفّح دول ثابتة تحوي ps بلا il)، وبطاقات البحث تتلقّى ps من الـAPI المطبَّع. ⇒ 🇮🇱 لا يظهر في أيّ مسار.

## 8) نتيجة Tel Aviv / Nazareth / Haifa / Jaffa / Jerusalem (مؤكَّد حيًّا)
| الاستعلام | المصدر | النتيجة |
|---|---|---|
| Tel Aviv (ar/en) | external | **تل أبيب – يافا / فلسطين / ps / 🇵🇸** |
| Nazareth | external | **الناصرة / فلسطين / ps / 🇵🇸** (+ نظائر Belgium/US/India سليمة) |
| Acre | external | **Acre / فلسطين / ps / 🇵🇸** (+ نظير Brazil سليم) |
| Haifa | curated | هايفونج/فيتنام (تطابق ضبابيّ؛ Haifa غير curated فلا تُسرِّب إسرائيل) |
| Jaffa | external | (فارغ هذه المرّة — لا تسريب) |
| Jerusalem / القدس | curated | **القدس / فلسطين / ps / 🇵🇸** (بلا انحدار) |
> **مسح شامل** لقائمتك (8 استعلامات × ar+en = 32 نتيجة): **0 تسريب «Israel/إسرائيل/🇮🇱/cc=il» في الحقول المعروضة**، 18 موسومة بفلسطين.

## 9) نتيجة صفحة فلسطين وشبكة مدنها
`/prayer-times-in-palestine` → 200، «فلسطين/Palestine»، 0 إسرائيل (كما في التدقيق). شبكة المدن تُرسَم من `db/cities-ps.json` الذي **نُظِّف** (الاسم الملوَّث الوحيد أُزيل) ⇒ لا «اسرائيل» في أيّ اسم مدينة.

## 10) تنظيف `Kafr 'Aqab اسرائيل`
`db/cities-ps.json`: `nameEn: "Kafr 'Aqab اسرائيل"` → `"Kafr 'Aqab"`. **`nameAr`/`lat`/`lng`/`pop` بلا تغيير.** تحقّق: 0 إدخالة ملوَّثة متبقّية (كانت 1/469).

## 11) تأكيد عدم تغيير timezone
لم تُمَسّ أيّ سلسلة `timezone`. نتائج il تبقى `Asia/Jerusalem` (للحساب — ليست في قائمة الممنوع ولا تُعرَض كتسمية سياسيّة). 0 مدينة curated تستخدم `Asia/Jerusalem`. اختبار الوحدة يؤكّد `normalizeStorePayload` و`normalizeResultDisplay` يحفظان `timezone`.

## 12) تأكيد عدم تغيير الحسابات
الـnormalizer يلمس فقط `countryCode`/`countryName`/`countryFlag`/`admin.country` (عرض/تسمية). `lat`/`lng`/`timezone` — مصادر حساب الصلاة — **بلا تغيير** (مؤكَّد بالوحدة + curl: Tel Aviv يحتفظ lat/lng/tz). لا مساس بمنطق الحساب الفلكيّ.

## 13) تأكيد عدم تغيير curated
`db/places/curated-places.json` **بلا تعديل** في هذا الإصلاح (2982 إدخالة، PS=12، IL=0 — ثابت). (التدقيق أثبت عدم الحاجة.)

## 14) الملفّات المعدَّلة
| الملفّ | التغيير | يُضمّ؟ |
|---|---|---|
| `server/place-display-normalize.js` | **جديد** (95 سطرًا) — الوحدة النقيّة | ✅ |
| `server.js` | +20/−4 (حصّة Palestine) — require + 3 بناة + place-selected | ✅ |
| `js/app.js` | +26/−1 — مساعد + حارس getDisplayCountry + updateCityCountryInfo + cache-buster | ✅ |
| `index.html` | +2/−2 (حصّة Palestine) — cache-buster `app.js?v=774→775` | ✅ |
| `db/cities-ps.json` | +1/−1 — تنظيف اسم Kafr 'Aqab | ✅ |
| `scripts/_test_palestine_normalize.mjs` | **جديد** — اختبار وحدة (44 توكيد) | ✅ |
| `reports/palestine-display-normalization-fix-1-prepush.md` | هذا التقرير | ✅ |
> **لم يُمَسّ:** curated-places.json · حساب الصلاة · lat/lng/timezone · sitemap · canonical/hreflang · slugs · الأذكار · المسبحة · `js/site-search.js`.

> ⚠️ **تشابك مع DISCOVERED-CITY-SEARCH-HOMONYM-MERGE-FIX-1 المُعلَّق:** الإصلاحان يتشاركان `server.js` (مناطق مختلفة) و**`index.html`** (cache-buster homonym لـsite-search على السطر 74/5218، وcache-buster Palestine لـapp.js على السطر 75/5219 — **متجاوران، في نفس الـhunk**). فصلهما في commit-ين نظيفين يستلزم دفع homonym أوّلًا (انظر القرار في نهاية التقرير).

## 15) نتائج regression
- **صياغة:** `node --check` لـ place-display-normalize + server.js + app.js ✓.
- **اختبارات الوحدة:** Palestine **44/44** · homonym **15/15** (بلا تداخل).
- **مسار curated (لا انحدار):** riyadh→Saudi، mecca→Saudi، rabat→Morocco، jerusalem→Palestine (بعد إصلاح bug نطاق `code` المكتشَف أثناء الاختبار).
- **الدول الأخرى بلا تغيير:** sa/ma/vn… تمرّ كما هي (مؤكَّد وحدة + curl).
- **العميل:** app.js بلا أخطاء console؛ `getDisplayCountry(cc=il)`→فلسطين؛ `/prayer-times-in-tel-aviv` حيًّا → 0 إسرائيل نصًّا، 0 علم il، علم ps موجود.
- **الإنتاج (بعد الدفع):** طبقة discovered الحيّة (Supabase) + كتابة place-selected — يُتحقَّقان على الإنتاج (محلّيًّا Supabase مُعطَّل).

## 16) رسالة commit المقترحة
```
fix(search): PALESTINE-DISPLAY-NORMALIZATION-FIX-1 — normalize Israel display to Palestine across search surfaces
```

---
**الخلاصة:** normalizer مركزيّ (`server/place-display-normalize.js` + نظير عميليّ) يحوّل **العرض** il→ps + اسم فلسطين بلغاتك العشر + 🇵🇸، مُطبَّق في curated/خارجيّ/discovered + كتابة place-selected + `getDisplayCountry` الحيّ. الأعلام كلّها من `countryCode` فتطبيعه يقلبها جميعًا. تنظيف اسم بيانات ملوَّث واحد. **بلا مساس بالحسابات/المواقيت/الإحداثيّات/curated/timezone.** مسح 32 نتيجة = 0 تسريب إسرائيل.

**قرار الترتيب المطلوب (لفصل نظيف عن homonym المُعلَّق):** نوصي **دفع DISCOVERED-CITY-SEARCH-HOMONYM-MERGE-FIX-1 أوّلًا** (جاهز ومُختبَر ومُقرَّر)، ثمّ يُدفع هذا الإصلاح على قاعدة نظيفة — لأنّ `index.html` يجمع cache-buster الإصلاحين في أسطر متجاورة لا تنفصل في hunk. البديل: دفعهما في commit واحد (يخالف «عدم الخلط»).

**النتيجة المقترحة:** ✅ جاهز — للاعتماد أرسِل: `أعتمد دفع تقرير: PALESTINE-DISPLAY-NORMALIZATION-FIX-1` ثمّ «أوافق على تنفيذ الدفع» (مع تحديد ترتيب الدفع مع homonym).

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
