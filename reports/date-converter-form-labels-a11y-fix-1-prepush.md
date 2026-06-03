# تقرير ما قبل الدفع: DATE-CONVERTER-FORM-LABELS-A11Y-FIX-1

**النوع:** إصلاح Accessibility — ربط labels بحقول أداة تحويل التاريخ (9 حقول × التبويبات الثلاثة). **لم يُنفَّذ commit/push.**
**التحقّق:** DOM-after-hydration (Preview) AR + EN (`el.labels`) + فحص الحقول غير المرتبطة + اختبار التحويل + regression.

---

## 1) سبب المشكلة
حقول الأداة كانت تحوي `<label>` مرئيًّا **بلا `for`**، والحقل بلا `aria-label`/`aria-labelledby`:
```html
<label data-i18n="converter.day">اليوم</label>
<input type="number" id="conv-g-day" …>   ← غير مرتبط
```
فلا رابط برمجيّ بين النصّ والحقل ⇒ Lighthouse: *Form/Select elements do not have associated labels*.

## 2) العناصر التي كانت بدون labels (9)
`conv-g-day` · `conv-g-month` (select) · `conv-g-year` — تبويب «من الميلادي»
`conv-h-day` · `conv-h-month` (select) · `conv-h-year` — تبويب «من الهجري»
`conv-s-day` · `conv-s-month` (select) · `conv-s-year` — تبويب «من الشمسي»
(الحقول المذكورة في تقرير Lighthouse — conv-g-day/conv-g-year/conv-g-month — جزء منها؛ أصلحتُ التسعة جميعًا.)

## 3) طريقة الإصلاح
**الطريقة المفضّلة — labels صريحة مرئيّة:** أُضيف `for="<id>"` إلى كلّ من الـ9 labels الموجودة (مرتبطة بالحقل المجاور بالـ id). لم تتغيّر النصوص ولا التصميم.
```html
<label for="conv-g-day" data-i18n="converter.day">اليوم</label>
<input id="conv-g-day" …>
```

## 4) label أم aria-label؟
**`<label for>` حقيقيّ مرئيّ** (لا aria-label) — وهو الأفضل كما طلبت، لأنّ الـ labels مرئيّة أصلًا فقط كانت غير مرتبطة.

## 5) فحص AR/EN (DOM بعد hydration)
| | AR | EN |
|---|---|---|
| كلّ الحقول الـ9 لها label مرتبط (`el.labels=1`) | ✅ | ✅ |
| نصّ التسمية | اليوم/الشهر/السنة | Day/Month/Year (مترجم) |
| حقول غير مرتبطة داخل المحوّل | **0** | **0** |
| معرّفات مكرّرة (conv-*) | **0** | **0** |
- التسميات مترجمة لكلّ اللغات تلقائيًّا (مفاتيح `converter.day/month/year` موجودة في كلّ `js/i18n/{lang}.js` — **لا حاجة لإضافة مفاتيح i18n**).

## 6) نتيجة فحص DOM (a11y)
✅ بعد الإصلاح: **0 عنصر input/select بلا تسمية** داخل `#page-date-converter` (كانت 9). المتوقَّع اختفاء خطأَي Lighthouse «Form/Select elements do not have associated labels» وارتفاع Accessibility نحو 100.

## 7) تأكيد عدم تغيير منطق التحويل
✅ **صفر مساس.** لم تُمَسّ `convertToHijri/convertToGreg/convertFromSolar` ولا الحسابات ولا الـ id (فقط أُضيف `for` للـ label). اختبار حيّ: 2026-06-03 → «الأربعاء 17 ذو الحجة 1447 هـ».

## 8) الملفّات المعدَّلة (2)
| الملف | التغيير |
|---|---|
| `index.html` | +`for="<id>"` على 9 labels داخل أداة المحوّل (3 تبويبات) — بنيويّ فقط |
| `sw.js` | `CACHE_VERSION v424 → v425` (علامة نشر) |
- **لا app.js/css/i18n/server.js، لا منطق تحويل، لا Title/Meta/H1/FAQ/JSON-LD/canonical/hreflang/sitemap، لا أذكار.**

## 9) نتائج regression
✅ **12/12 = 200**: `/`، `/date-converter`+(en/fr/tr/ur)، `/hijri-calendar`، `/today-hijri-date`، `/moon-today`، `/qibla-in-riyadh`، `/prayer-times-in-riyadh`، `/azkar`. لا أخطاء console. لا كسر بصريّ (`for` لا يغيّر العرض).

## 10) رسالة commit المقترحة
```
fix(a11y): DATE-CONVERTER-FORM-LABELS-A11Y-FIX-1 — add accessible labels to date converter fields
```

---

## معايير القبول
1. كلّ input له label مرتبط — ✅ · 2. كلّ select له label مرتبط — ✅ · 3. labels مترجمة لكلّ اللغات — ✅ · 4. لا duplicate id — ✅ · 5. لا كسر بصريّ — ✅ · 6. منطق التحويل يعمل — ✅ · 7. لا أخطاء console — ✅ · 8. Accessibility يتحسّن (0 حقول غير مرتبطة) — ✅ · 9. regression 200 — ✅ (12/12).

## تأكيدات
- لم يُنفَّذ commit/push. أوقفتُ خادم الاختبار. عمل MULTILANG محفوظ في `git stash`. لم تُبدأ أيّ صفحة أذكار.

**في انتظار اعتمادك للدفع:** `أعتمد دفع تقرير: DATE-CONVERTER-FORM-LABELS-A11Y-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
