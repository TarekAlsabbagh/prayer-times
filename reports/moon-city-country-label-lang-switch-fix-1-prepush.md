# تقرير ما قبل الدفع: MOON-CITY-COUNTRY-LABEL-LANG-SWITCH-FIX-1

**النوع:** Audit + Fix — توليد اسم الدولة من `countryCode` حسب لغة الصفحة الحالية، فلا يبقى اسم دولة بلغة قديمة بعد تبديل اللغة.
**الملفّات:** `js/app.js` (helper + `getDisplayCountry`) + `index.html` (cache-buster) + `sw.js` (CACHE_VERSION). **لا server.js، لا بيانات مدن، لا تغيير أسماء مدن.**
**الحالة:** لم يُدفع — بانتظار اعتمادك.

---

## 1) وصف المشكلة
على صفحة القمر، بعد اختيار مدينة من `/moon-today` والانتقال لصفحة المدينة ثمّ تبديل اللغة (مثلاً AR→BN): اسم المدينة يظهر صحيحًا بلغة الصفحة، لكن **اسم الدولة يبقى عربيًّا** في واجهة بنغاليّة. مثال: `Macau` + الدولة `ماكاو` (عربيّ) في صفحة `/bn`.

## 2) خطوات إعادة الإنتاج (مثبَتة حيًّا)
1. `/moon-today` (AR) → بحث «macau» → نقر النتيجة → `/moon-today-in-macau` (الدولة «ماكاو» عربيّ — صحيح لـAR).
2. تبديل اللغة إلى BN عبر `setLanguage('bn')` → تنقّل كامل إلى `/bn/moon-today-in-macau`.
3. **قبل الإصلاح:** `#country-name = «ماكاو»` (عربيّ) في صفحة بنغاليّة ❌.

## 3) Storage قبل/بعد تبديل اللغة
schema المخزَّن يحفظ الدولة كنصّ بلغة وقت الاختيار + `countryCode` المستقرّ:
| المفتاح | country (مخزَّن) | countryCode |
|---|---|---|
| `city_macau` | «ماكاو» (عربيّ) | `mo` |
| `city_moon` | «ماكاو» (عربيّ) | `mo` |
| `last_city_context` | «ماكاو» (عربيّ) | `mo` |

**تبديل اللغة لا يغيّر هذه القيم** (نفس النصّ العربيّ يبقى) — و`countryCode='mo'` ثابت صحيح. (السياسة المطلوبة محقَّقة: `country` يبقى كقيمة مساعدة، لكنه **لم يعد** مصدر العرض النهائيّ.)

## 4) مصدر country الخاطئ
**سلسلة fallback في `getDisplayCountry()` (client):** للغات غير AR كانت: `_LOCALIZED_COUNTRY_MAPS[lang][cc]` → `currentLocalizedCountry` → `currentEnglishCountry || COUNTRY_EN_NAMES[cc] || currentCountry`. ماكاو (`mo`) **غائبة من الخريطتين** (`COUNTRY_NAMES_BN` و`COUNTRY_EN_NAMES`)، و`currentEnglishCountry=''`، فتسقط السلسلة حتى آخر fallback = **`currentCountry`** (النصّ العربيّ المخزَّن) ⇒ تسرّب «ماكاو» على صفحة بنغاليّة. (الـSSR كان يرسل `__PRAYER_CITY__.country="ম্যাকাও এসএআর চীন"` الصحيح، لكن العميل يكتب فوقه من `getDisplayCountry()`.)

## 5) هل countryCode موجود وصحيح؟
**نعم.** `currentCountryCode='mo'` صحيح ومحفوظ عبر تبديل اللغة (مؤكَّد حيًّا في AR وBN). البيانات صحيحة 100% — التصنيف E (API/data) مُستبعَد.

## 6) قمر فقط أم عالميّة؟
**عالميّة.** `getDisplayCountry()` دالّة مشترَكة تُستخدَم في ~20 موضعًا (Zakat / Date-Converter / Breadcrumb / Country-cities / Popups / …). الخلل يظهر لأيّ دولة غائبة من الخرائط على أيّ صفحة غير عربيّة. **محقَّق حيًّا:** `/bn/date-converter` بعد اختيار ماكاو كان سيُظهر الدولة عربيّة أيضًا — والآن «ম্যাকাও». الإصلاح في الدالّة المشترَكة ⇒ يعمّ كلّ الصفحات.

## 7) التصنيف A/B/C/D/E
- ✅ **A — Stored country display string reused** (آخر fallback = `currentCountry` النصّ المخزَّن).
- ✅ **B — countryCode not used for display localization** (`mo` صحيح لكن غير مستخدَم لأنّ الخرائط تفتقده).
- ❌ **C — Old country leaks from last_city_context** (مُستبعَد — الدولة **صحيحة** (ماكاو) لكن بلغة خاطئة، ليست دولة قديمة).
- ◑ **D — Moon page display** (يظهر على القمر لكن ليس محصورًا به).
- ✅ **E — Global city header/label** (الدالّة المشترَكة `getDisplayCountry`).
> **الجذر: A + B + E.**

## 8) ما تمّ تعديله
- **helper جديد `_countryNameFromCode(cc, lang)`** في `js/app.js` (قبل `getDisplayCountry`): يحلّ اسم الدولة من رمز ISO عبر **`Intl.DisplayNames([lang], {type:'region'})`** (معيار دوليّ لأسماء الدول/المناطق — **ليس ترجمة مدن**)، مع cache لكلّ لغة، ويعيد `''` إن تعذّر (متصفّح قديم/رمز غير صالح) فتبقى fallbacks القديمة.
- **`getDisplayCountry()`:** للغات غير AR صار يحلّ من `countryCode` باللغة الحالية **قبل** أيّ سقوط إلى `currentCountry` المخزَّن؛ فرع AR يبقى كما هو (يفضّل الاسم العربيّ الكامل/المخزَّن، Intl كحلّ أخير فقط) لمنع أيّ انحراف إملائيّ على صفحات AR.

## 9) كيف يُحلّ country label بعد الإصلاح
ترتيب الأولويّة في `getDisplayCountry()` لكلّ لغة غير AR:
`_LOCALIZED_COUNTRY_MAPS[lang][cc]` (القاموس المنسَّق) → **`Intl.DisplayNames(lang)`** (من `cc`) → الإنجليزيّة (`currentEnglishCountry` → `COUNTRY_EN_NAMES[cc]` → `Intl en`) → **`currentCountry` المخزَّن فقط إذا تعذّر حلّ الرمز كليًّا**. (AR: `_MOON_COUNTRY_NAMES.ar[cc]` → `currentCountry` → `Intl ar`.)

## 10) أمثلة قبل/بعد (محقَّقة حيًّا على app.js v767)
| السيناريو | المدينة | الدولة قبل | الدولة بعد |
|---|---|---|---|
| **Macau AR→BN** | Macau | ❌ «ماكاو» (عربيّ) | ✅ «**ম্যাকাও**» (بنغاليّ) |
| **Macau EN→BN** | Macau | ❌ عربيّ (EN كان «Macao») | ✅ «**ম্যাকাও**» |
| **Riyadh BN→AR** | الرياض | — | ✅ «**المملكة العربية السعودية**» (كامل) |
| **Dubai UR→EN** | Dubai | — | ✅ «**United Arab Emirates**» |
| **Macau AR (مرجع)** | ماكاو | «ماكاو» | «ماكاو» (بلا تغيير — لا انحدار AR) |
| **Macau EN (مكافأة)** | Macau | ❌ عربيّ | ✅ «**Macao**» (Intl) |
> `Intl.DisplayNames` لـ`MO`: ar=مكاو، en=Macao، bn=ম্যাকাও، ur=مکاؤ، fr/es=Macao، de/ms=Macau، tr=Makao، id=Makau. (كلّها أسماء دول معياريّة.)

## 11) تأكيد عدم تغيير أسماء المدن / no runtime translation
✅ **أسماء المدن بلا مساس.** `getDisplayCity()` لم يُلمَس؛ القاعدة `names[lang] → names.en` سارية (Macau→«Macau» fallback إنجليزيّ، رِياد→«রিয়াদ» من البيانات). الإصلاح يخصّ **أسماء الدول فقط** عبر `Intl` (معيار دوليّ للدول، لا ترجمة مدن runtime). محقَّق: `cityDom` ثابت من البيانات في كلّ السيناريوهات.

## 12) تأكيد عدم تغيير الحسابات/SEO
✅ تعديل client بحت في طبقة عرض اسم الدولة. بلا مساس: حسابات القمر/الصلاة، slugs، Title/Meta/canonical/hreflang/sitemap/JSON-LD (كلّها SSR/server.js غير معدَّلة)، الإحداثيّات، صفحات الأذكار.

## 13) الملفّات المعدَّلة
| الملفّ | التغيير |
|---|---|
| `js/app.js` | +55/−11: helper `_countryNameFromCode` (+ `_intlRegionCache`) + إعادة كتابة `getDisplayCountry()` بأولويّة countryCode→Intl قبل النصّ المخزَّن. |
| `index.html` | `app.js?v=766 → ?v=767` (preload + script). |
| `sw.js` | `CACHE_VERSION v435 → v436`. |

## 14) نتائج regression
- `node --check js/app.js` ✅ · 0 أخطاء console عبر كلّ السيناريوهات ✅
- HTTP 200 لكلّ الروابط: `/moon-today`, `/en/moon-today`, `/bn/moon-today`, `/moon-today-in-macau`, `/en|/bn/moon-today-in-macau`, `/date-converter`, `/bn/date-converter`, `/qibla`, `/bn/qibla`, `/prayer-times-in-riyadh`, `/bn/prayer-times-in-riyadh` (12/12) ✅
- AR Macau = «ماكاو» بلا تغيير (لا انحدار) ✅ · لا عودة لمكّة ✅ · أسماء المدن من البيانات فقط ✅

## 15) cache-busters
`app.js?v=766 → 767` · `CACHE_VERSION v435 → v436`. (CSS بلا تغيير.)

## 16) رسالة commit المقترحة
```
fix(moon): MOON-CITY-COUNTRY-LABEL-LANG-SWITCH-FIX-1 — localize country label from country code after language switch
```

---

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: MOON-CITY-COUNTRY-LABEL-LANG-SWITCH-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
