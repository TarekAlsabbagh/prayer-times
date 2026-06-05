# تقرير ما قبل الدفع: GLOBAL-CURRENT-CITY-LANG-SWITCH-LEAK-FIX-1

**النوع:** إصلاح تسريب اسم المدينة بلغة قديمة في الهيدر عند التنقّل بين اللغات (state عامّ `currentCity`).
**الملفّ:** `js/app.js` فقط (+ cache-buster في `index.html`). **لا تغيير server.js/curated/حسابات.**
**الحالة:** لم يُدفع — بانتظار اعتمادك.

---

## 1) السيناريو الذي يُعيد إنتاج المشكلة (مثبَت حيًّا)
1. زيارة `/bn/prayer-times-in-riyadh` (بنغاليّ) ⇒ `loadCityData` يحفظ `sessionStorage['city_riyadh'] = {name:"রিয়াদ", englishName:"Riyadh", lat, lng, …}` و`last_city_context.name="রিয়াদ"` — **الاسم المعروض المترجَم، لا slug**.
2. الانتقال إلى صفحة عربيّة (`/date-converter` أو `/next-prayer-in-riyadh` أو `/`).
3. الهيدر العلويّ (`#snb-city` / `#city-name`) يعرض **«রিয়াদ» (بنغاليّ) داخل صفحة عربيّة** — مطابق لصورتك.

## 2) مصدر التسريب الحقيقيّ
دالتا عرض اسم المدينة `getDisplayCity()` و`getCurrentCityLabel()` في فرع **`ar`** كانتا تقبلان أيّ `currentCity` خالٍ من الحروف اللاتينيّة:
```js
if (currentCity && !/[A-Za-z]/.test(currentCity)) return currentCity; // ← يقبل «রিয়াদ» / «مکہ»
```
الحارس يرفض **اللاتينيّة فقط** — لا يرفض البنغاليّة/الأرديّة/CJK. فأيّ اسم غير لاتينيّ من لغة سابقة يُعرَض كما هو على الصفحة العربيّة.

## 3) هل التسريب من localStorage / currentCity / hydration؟
- **sessionStorage** `city_<slug>` + `last_city_context`: تخزّن **الاسم المعروض المترجَم** (بنغاليّ على صفحة bn)، لا مقبضًا مستقرًّا.
- **hydration**: `_initialSyncHydrate` (app.js:54) ينسخ `seed.name` إلى `currentCity` حرفيًّا بغضّ النظر عن لغة الصفحة الجديدة.
- **currentCity (global)**: يصبح بنغاليًّا، ثمّ تُرجعه دالتا العرض في فرع ar.
(المفاتيح: `city_<slug>`، `last_city_context`، `currentCity`، `currentEnglishName`.)

## 4) موضع الهيدر المتأثّر
`#snb-city` (الشريط اللاصق) و`#city-name` — كلاهما يستهلك `getCurrentCityLabel()`. الفرع AR هو نقطة العطل لكلّ السطوح التي تمرّ عبر هاتين الدالتين (هيدر، hero، CTA، aria-labels…).

## 5) جدول قبل/بعد — BN→AR
| المسار (دافئ) | قبل | بعد |
|---|---|---|
| `/bn/prayer-times-in-riyadh` → `/date-converter` | **রিয়াদ** | **الرياض** ✅ |
| `/bn/next-prayer-in-riyadh` → `/next-prayer-in-riyadh` | **রিয়াদ** | **الرياض** ✅ (snb + npt-h1) |

## 6) جدول قبل/بعد — AR→BN (عدم انحدار)
| المسار (دافئ) | قبل | بعد |
|---|---|---|
| `/prayer-times-in-makkah` → `/bn/date-converter` | (بنغاليّ صحيح أصلاً) | **মক্কা** ✅ (0 عربيّ) |
> الفروع غير العربيّة كانت تُعيد الحلّ أصلاً عبر cityMap؛ مؤكَّد لا انحدار.

## 7) جدول قبل/بعد — UR→AR
| المسار (دافئ) | قبل | بعد |
|---|---|---|
| `/ur/prayer-times-in-makkah` → `/date-converter` | **مکہ** (أرديّ) | **مكّة المكرّمة** ✅ |
> الأرديّة تشارك العربيّة كتلة Unicode، فأُضيف رفضٌ صريح للحروف الأرديّة/الفارسيّة الخاصّة (ی ہ ے ٹ ڈ ڑ ں ھ گ چ پ ک ژ…) قبل القبول.

## 8) الدالة/السياسة الجديدة
helperان جديدان + تشديد فرع ar في الدالتين (السياسة: «للعربيّة: names.ar → names.en/canonical؛ ممنوع اسم بلغة أجنبيّة»):
- `_isCleanArabicCityName(s)`: true فقط إذا كان s اسمًا عربيّ‑الخطّ نظيفًا — يرفض اللاتينيّة، والبنغاليّة/CJK/غيرها (عبر `_isDisplayScriptAcceptable(s,'ar')`)، والحروف الأرديّة/الفارسيّة الخاصّة (regex مخصّص).
- `_cityNameByLangFromEnglish(lang)`: يُعيد حلّ الاسم القانونيّ من **المقبض المستقرّ `currentEnglishName`** عبر `CITY_NAMES_AR` (ar) أو `_LOCALIZED_CITY_MAPS[lang]` (الـ8) أو `currentEnglishName` نفسه (en).
- فرع ar الجديد: يقبل `currentCity` **فقط** إن كان نظيفًا عربيًّا؛ وإلّا يُعيد الحلّ من `currentEnglishName` ⇒ `CITY_NAMES_AR` ⇒ `ssr-city-name` (إن نظيف) ⇒ الإنجليزيّة القانونيّة ⇒ ''. **لا يُرجِع أبدًا اسمًا بخطّ أجنبيّ.**

> ملاحظة: العربيّ النظيف المخزَّن (مثل «مكة المكرمة» على صفحة عربيّة شرعيّة) **يُحتفظ به كما هو** (يجتاز `_isCleanArabicCityName`) ⇒ لا تغيير تجميليّ. إعادة الحلّ تُفعَّل فقط عند تسرّب أجنبيّ.

## 9) تأكيد عدم تغيير الحسابات
✅ لا مساس بحساب المواقيت/العدّ التنازليّ/ترتيب الصلوات/الإحداثيات/slug المدينة. التعديل على **عرض اسم المدينة** فقط في دالتَي l10n.

## 10) تأكيد عدم تغيير SEO
✅ Title/Meta/canonical/hreflang/sitemap/JSON-LD — بلا تغيير (لا يُمسّ server.js). الإصلاح client‑side عرض فقط.

## 11) الملفّات المعدَّلة
| الملفّ | التغيير |
|---|---|
| `js/app.js` | +75/−13: helperان (`_isCleanArabicCityName` + `_cityNameByLangFromEnglish`) + تشديد فرع ar في `getDisplayCity` و`getCurrentCityLabel`. |
| `index.html` | cache-buster `app.js?v=764 → ?v=765`. |

## 12) نتائج regression
- `node --check js/app.js` ✅ · 0 أخطاء console ✅
- BN→AR (date-converter + next-prayer): الرياض ✅ · UR→AR: مكّة المكرّمة ✅ · AR→BN: মক্কা ✅
- **هوم AR (cold):** «مكة المكرمة» بلا تغيير ✅ · **cold AR `/prayer-times-in-riyadh`:** «الرياض» + H1 صحيح ✅
- bn page نفسها تبقى «রিয়াদ»/«মক্কা» ✅ (الفروع غير العربيّة سليمة)

## 13) cache-busters
`app.js?v=764 → ?v=765` (تغيير client). لا `_i18nVersion`/`CACHE_VERSION` (لا تغيير i18n/SW).

## 14) رسالة commit المقترحة
```
fix(global): GLOBAL-CURRENT-CITY-LANG-SWITCH-LEAK-FIX-1 — resolve current city label by active language

getDisplayCity()/getCurrentCityLabel() AR branch accepted any non-Latin
currentCity, so a Bengali/Urdu display name cached by a previous language's
visit (city_<slug> / last_city_context store the localized label) leaked into
the Arabic header on cross-language navigation. Now AR accepts currentCity
only when it's a clean Arabic-script name; otherwise it re-resolves the
canonical name from the stable English handle (CITY_NAMES_AR / city maps).
AR stays Arabic, BN/UR pages unchanged, no SEO/calc changes. app.js 764→765.
```

---

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: GLOBAL-CURRENT-CITY-LANG-SWITCH-LEAK-FIX-1`

### مُسجَّل (تحسين اختياريّ لاحق، خارج النطاق)
الإصلاح الجذريّ الأعمق: تخزين `city_<slug>` بـ**slug/إحداثيات + englishName فقط** (لا الاسم المعروض)، وإعادة توليد كلّ التسميات من المقبض المستقرّ. الإصلاح الحاليّ يحقّق نفس النتيجة المرئيّة عند طبقة العرض بأقلّ مخاطرة.

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
