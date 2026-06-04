# تقرير ما قبل الدفع: ZAKAT-CALCULATOR-SSR-ACTIVE-PAGE-FIX-1

**النوع:** إصلاح فلكر أوّل الرسم على `/zakat-calculator` و`/[lang]/zakat-calculator` — تفعيل صفحة الزكاة من SSR لكلّ اللغات العشر. **لم يُنفَّذ commit/push.**
**التحقّق:** SSR (curl، 10 لغات) + DOM-after-hydration (Preview) + regression. الأساس: `49026f2`.

---

## 1) السبب الجذري المختصر
صفحة الزكاة كانت **صفحة الأداة الوحيدة بلا آليّة تفعيل أوّل-رسم**: الـ SSR يشحن `#page-prayer-times` نشطة (لا يرفع `#page-zakat`)، ولا توجد قاعدة CSS ولا html-class محقون ولا فرع في السكربت السطريّ. فالتبديل للزكاة لا يحدث إلّا بعد مُفعِّل الـ SPA المؤجَّل في app.js ⇒ يُرسَم هيكل مواقيت الصلاة أوّلًا ثمّ يُستبدَل = فلكر. (التصنيف المعتمد: A + B.)

## 2) حالة SSR قبل/بعد
| | قبل | بعد |
|---|---|---|
| `.page.active` في الـ SSR | `#page-prayer-times` | **`#page-zakat`** |
| عدد `.page.active` | 1 (الخاطئة) | **1 (الصحيحة)** |
| `#page-prayer-times` | active | **غير active** |
| أوّل رسم | هيكل مواقيت الصلاة | **حاسبة الزكاة مباشرةً** |

## 3) `html.class` قبل/بعد
| | قبل | بعد |
|---|---|---|
| `<html class>` على مسار الزكاة | **(لا يوجد)** | **`zakat-calculator-page`** (10 لغات، من SSR) |
- تأكيد العزل: homepage = `home-page`، date-converter = `date-converter-page`، zakat (ar/de…) = `zakat-calculator-page` — **بلا تسرّب بين المسارات** (الحقن مقصور بـ `_isZakatCalc`).

## 4) active page قبل/بعد (DOM بعد hydration)
- قبل: `#page-prayer-times` يُرسَم أوّلًا ثمّ يُبدَّل إلى `#page-zakat`.
- بعد: `htmlClass="zakat-calculator-page"`, `activePages=["page-zakat"]`, `#page-zakat` مرئيّة (block)، `#page-prayer-times` مخفيّة (none) — **من أوّل رسم**.

## 5) هل اختفى ظهور `#page-prayer-times` أولًا؟
**نعم.** الـ CSS (`html.zakat-calculator-page #page-prayer-times{display:none!important}`) + html-class المحقون من SSR يُخفيان prayer-times ويُظهران الزكاة قبل تنفيذ أيّ JS ⇒ لا فلكر.

## 6) اختبار كل اللغات (10/10)
SSR لكلّ من `/zakat-calculator` و`/{en,fr,tr,ur,de,id,es,bn,ms}/zakat-calculator`:
`html.zakat-calculator-page` ✅ · `#page-zakat` active ✅ · `#page-prayer-times` غير active ✅ · صفحة active واحدة ✅ · H1 الزكاة حاضر ✅ · كلّها 200 ✅.

## 7) تأكيد عدم تغيير حساب الزكاة
✅ **يعمل تمامًا.** اختبار حيّ (DOM): نِصاب = 21,250 ر.س، وعند إدخال 100,000 نقدًا ⇒ الزكاة = **2,500 ر.س** (2.5% بالضبط). `js/app.js` التعديل فيه **توسيع 3 ريجيكسات مسار فقط** (en|fr|tr|ur → الـ10) لتفعيل/تنقّل الصفحة لكلّ اللغات — **بلا مساس بمنطق الحساب أو الحقول أو النتائج**.

## 8) تأكيد عدم تغيير SEO
✅ Title = «حاسبة الزكاة | احسب زكاة المال والذهب والأسهم بسهولة» (دون تغيير)، canonical صحيح، metaCount=1، hreflang=11، H1 الزكاة محفوظ. (الزكاة غير مسجَّلة في `_getActiveH1Marker` فلم يُمَسّ سلوك H1.) canonical/hreflang/sitemap/المحتوى دون تغيير.

## 9) الملفّات المعدَّلة (5)
| الملف | التغيير |
|---|---|
| `css/style.css` | +قاعدتان: `html.zakat-calculator-page #page-zakat{display:block!important}` + إخفاء `#page-prayer-times`. |
| `server.js` | +كتلة حقن `html.zakat-calculator-page` + نقل `active` إلى `#page-zakat` للمسار (10 لغات)، بنمط date-converter. |
| `index.html` | +فرع السكربت السطريّ للزكاة (10 لغات) + رفع `app.js?v 761→762` و`style.css?v 472→473`. |
| `js/app.js` | توسيع 3 ريجيكسات مسار الزكاة من `en\|fr\|tr\|ur` إلى الـ10 (مُفعِّل الصفحة 3826 + حارس التنقّل 5287 + self-heal للـ SPA 11694) — ضروريّ لتغطية de/id/es/bn/ms. |
| `sw.js` | `CACHE_VERSION v429 → v430`. |
- **بلا مساس:** منطق حساب الزكاة، حقول/نتائج الحاسبة، Title/Meta/H1/canonical/hreflang/sitemap، المحتوى، الأذكار. كلّ الملفّات LF.

## 10) نتائج regression
✅ **12/12 = 200:** `/`، `/hijri-calendar`، `/hijri-date/1447-12-17`، `/today-hijri-date`، `/moon-today`، `/msbaha`، `/qibla-in-riyadh`، `/prayer-times-in-riyadh`، `/azkar`، `/date-converter`، `/zakat-calculator`، `/en/zakat-calculator`.
✅ **عزل المسارات:** homepage تبقى `#page-prayer-times` نشطة (`home-page`)، date-converter تبقى `#page-date-converter` نشطة — لم تتأثّر بكتلة الزكاة. لا أخطاء console. لا overflow أفقيّ.

## 11) cache-busters
- `index.html`: `app.js?v 761→762` (app.js تغيّر) + `style.css?v 472→473` (css تغيّر).
- `sw.js`: `CACHE_VERSION v429→v430`.

## 12) رسالة commit المقترحة
```
fix(zakat): ZAKAT-CALCULATOR-SSR-ACTIVE-PAGE-FIX-1 — render zakat calculator as active page from SSR
```

---

## معايير القبول
1. لا تظهر الرئيسية/مواقيت الصلاة قبل الزكاة — ✅ · 2. `html.zakat-calculator-page` في SSR — ✅ · 3. `#page-zakat` ظاهر من أوّل رسم — ✅ · 4. `#page-prayer-times` مخفيّ من أوّل رسم — ✅ · 5. صفحة active واحدة — ✅ · 6. H1 الزكاة محفوظ — ✅ · 7. نموذج الزكاة محفوظ — ✅ · 8. لا كسر بصريّ/overlap — ✅ · 9. لا أخطاء console — ✅ · 10. حساب الزكاة يعمل — ✅ (2,500 ر.س) · 11. regression 200 — ✅.

## تأكيدات
- لم يُنفَّذ commit/push. أوقفتُ خوادم الاختبار. لم تُبدأ أيّ صفحة أذكار. الملفّات: `server.js` + `css/style.css` + `index.html` + `js/app.js` + `sw.js` فقط (+ هذا التقرير).

**في انتظار اعتمادك للدفع:** `أعتمد دفع تقرير: ZAKAT-CALCULATOR-SSR-ACTIVE-PAGE-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
