# تقرير ما قبل الدفع: AZKAR-USEFUL-LINKS-PRAYER-TIMES-HREF-FIX-1

**النوع:** إصلاح موجَّه — كرت «مواقيت الصلاة» في قسم «صفحات مفيدة بجانب الأذكار» كان يذهب للصفحة الرئيسيّة (تمسح السياق → مكّة)؛ الآن يوجَّه لصفحة مواقيت **المدينة الحاليّة** عند وجود سياق صالح.
**الملفّات:** `server.js` (ماركر SSR) + `js/app.js` (hydration للـhref) + `index.html`/`sw.js` (cache-busters). **بلا مساس بسلوك الرئيسيّة / بقيّة الكروت / SEO / حسابات.**
**الحالة:** لم يُدفع — بانتظار اعتمادك.

## 1) سبب المشكلة
في باني قسم «صفحات مفيدة» (`server.js`)، الكرت الأوّل (مواقيت الصلاة) = `_aHrefs[0]` = الصفحة الرئيسيّة (`/` للعربيّة / `/[lang]/` لغيرها). الصفحة الرئيسيّة تمسح `last_city_context` عمدًا (`js/app.js:5324`) ⇒ عند وجود مدينة (Macau) يُعاد السياق إلى مكّة. (الخادم لا يقرأ sessionStorage فلا يعرف مدينة المستخدم وقت العرض.)

## 2) مكان الرابط الخاطئ
`server.js:15190` → `const _aHrefs=[(seo.lang==='ar')?'/':(_pfx+'/'), …]` (العنصر [0]). الكرت يُبنى في الحلقة `server.js:~15193` ضمن `section.azkar-hub-links`.

## 3) الرابط قبل/بعد
| | قبل | بعد |
|---|---|---|
| SSR (fallback) | `/` (ar) / `/[lang]/` | **بلا تغيير** — يبقى fallback `/` / `/[lang]/` |
| العميل (سياق Macau، bn) | `/bn/` | **`/bn/prayer-times-in-macau`** |
| العميل (لا سياق) | `/bn/` | `/bn/` (يبقى fallback) |

## 4) hydration أم SSR فقط؟
**Hydration (المسار 1 المعتمَد).** SSR يبقي fallback `/[lang]/` + يضيف ماركر `data-azk-prayer-card="1"` على الكرت الأوّل فقط. بعد التحميل، `_hydrateAzkarPrayerCard()` (في `_loadAzkarHub`) يقرأ `last_city_context` (فقط — لا globals) ويحسب slug عبر `makeSlug(englishName, lat, lng)` ثمّ يضبط `href = /[lang]/prayer-times-in-{slug}`. لا سياق ⇒ يبقى fallback.

## 5) جدول AR/BN/EN قبل/بعد (محقَّق حيًّا، app.js v769)
| السيناريو | href الكرت بعد | بعد النقر | reset لمكّة؟ |
|---|---|---|---|
| **BN + Macau** | `/bn/prayer-times-in-macau` | المدينة تبقى **Macau** | ❌ لا |
| **AR + Macau** | `/prayer-times-in-macau` | تبقى **ماكاو** | ❌ لا |
| **EN + Riyadh** | `/en/prayer-times-in-riyadh` | تبقى **Riyadh** | ❌ لا |
| **لا سياق (BN)** | `/bn/` (fallback) | الرئيسيّة (مقبول) | — |

## 6) تأكيد عدم تغيير سلوك الصفحة الرئيسيّة
✅ **لم يُلمَس** `js/app.js:5324` (مسح الرئيسيّة) ولا منطق الرئيسيّة. الإصلاح يغيّر **href هذا الكرت فقط** عبر hydration. لم نفتح `GLOBAL-HOME-NAV-CITY-CONTEXT-PRESERVE-FIX-1`.

## 7) تأكيد عدم تغيير باقي روابط الأذكار
✅ الكروت الخمسة الأخرى بلا تغيير: `/[lang]/today-hijri-date`, `/hijri-calendar`, `/date-converter`, `/msbaha`, `/zakat-calculator` (مؤكَّد حيًّا). الماركر يُضاف لـ`i===1` فقط. محتوى/روابط الأذكار الأخرى بلا مساس.

## 8) تأكيد عدم تغيير SEO
✅ SSR يبقي href fallback ثابتًا (`/[lang]/`) — لا تغيير في الروابط المزحوفة/canonical/hreflang/sitemap/Title/Meta. الـhydration يحدث client-side فقط بعد التحميل (لا يراه الزاحف). slug إنجليزيّ ثابت (`makeSlug`)، اسم المدينة المترجَم لا يُستخدَم في الـURL.

## 9) الملفّات المعدَّلة
| الملفّ | التغيير |
|---|---|
| `server.js` | +6/−1: ماركر `data-azk-prayer-card="1"` على الكرت الأوّل (i===1) + تعليق. |
| `js/app.js` | +41: `_hydrateAzkarPrayerCard()` + استدعاؤه في `_loadAzkarHub()`. |
| `index.html` | `app.js?v=767 → 769` (preload + script). |
| `sw.js` | `CACHE_VERSION v436 → v438`. |

## 10) نتائج regression
- `node --check` على server.js + app.js ✅ · **0 أخطاء console** ✅
- HTTP **200** لكلّ: `/azkar`, `/en/azkar`, `/bn/azkar`, `/ur/azkar`, `/bn/prayer-times-in-macau`, `/bn/date-converter`, `/bn/msbaha`, `/bn/zakat-calculator`, `/bn/today-hijri-date`, `/bn/hijri-calendar` (10/10) ✅
- صفحة الأذكار تُرسَم (page-azkar-hub active) ✅ · الكروت الخمسة الأخرى ثابتة ✅
- SSR لـ/bn/azkar: الماركر موجود + href fallback `/bn/` (الخادم لا يهدرج) ✅

## 11) cache-busters
`app.js?v=767 → 769` · `CACHE_VERSION v436 → v438`. (CSS بلا تغيير.) — البمب المزدوج لأنّ app.js عُدِّل مرّتين (الدالّة ثمّ إزالة fallback الـglobals).

## 12) رسالة commit المقترحة
```
fix(azkar): AZKAR-USEFUL-LINKS-PRAYER-TIMES-HREF-FIX-1 — route prayer times useful link to current city
```

---

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: AZKAR-USEFUL-LINKS-PRAYER-TIMES-HREF-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
