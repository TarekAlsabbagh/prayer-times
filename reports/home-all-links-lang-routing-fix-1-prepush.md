# تقرير ما قبل الدفع: HOME-ALL-LINKS-LANG-ROUTING-FIX-1

**النوع:** إصلاح موحَّد لتوجيه لغة **كلّ** روابط الصفحة الرئيسية الداخليّة (10 لغات). **يدمج ويُغني عن** `HOME-CITY-QUICK-LINKS-LANG-ROUTING-FIX-1` (أُسقطت كتذكرة مستقلّة). **لم يُنفَّذ commit/push.**
**التحقّق:** SSR (curl، 10 لغات) + DOM بعد hydration (Preview) + فحص HTTP لكلّ الروابط + regression.

---

## 1) السبب الجذريّ
بناءً على تقرير `HOME-ALL-LINKS-LANG-ROUTING-AUDIT-1`: **معظم روابط `<a href="/…">` الداخليّة في قشرة الصفحة الرئيسية مكتوبة Hardcoded في `index.html` بلا بادئة لغة** (أدوات مصغّرة، بطاقات خدمات، عدّادات أحداث، رابط العالميّة، شبكة مدن القمر، بطاقات هَب الأذكار، روابط التسبيح…). 132 نسخة (31 مسارًا فريدًا) على كلّ صفحة لغة غير عربيّة ⇒ النقر يأخذ المستخدم للنسخة العربيّة. الاستثناءان المعالَجان سابقًا فقط: شبكة الفوتر + هيرو المدن. السبب **HTML hardcoded، لا JS rebuild**.

## 2) عدد الروابط المتأثّرة
- **قبل:** 132 رابطًا داخليًّا بلا بادئة (31 فريدًا) على كلّ لغة غير عربيّة × 9 لغات.
- **بعد:** **0** على كلّ اللغات (كلّ الروابط الداخليّة تحمل بادئة اللغة الصحيحة).

## 3) ما تمّ تعديله
في `server.js` ضمن كتلة SSR للصفحة الرئيسية (بعد معالجة روابط الفوتر، حتّى لا تُبادأ مرّتين)، أُضيف **تمرير موحَّد** مقصور على الصفحة الرئيسية غير العربيّة (`_isHomepageSsr && Lf !== 'ar'`):
```js
if (_isHomepageSsr && Lf !== 'ar') {
  const _L = Lf;
  const _alreadyPrefixed = /^\/(?:en|fr|tr|ur|de|id|es|bn|ms)(?:\/|$)/;
  const _staticExt = /\.(?:js|mjs|css|json|xml|png|jpe?g|gif|svg|webp|ico|webmanifest|txt|woff2?|ttf|otf|map|pdf|mp[34]|webm)$/i;
  html = html.replace(/href="(\/[^"?#]*)((?:[?#][^"]*)?)"/g, (full, path, qh) => {
    if (path === '/') return 'href="/' + _L + '"';     // الهوم/الشعار
    if (_alreadyPrefixed.test(path)) return full;       // مُبادأ مسبقًا
    if (path.startsWith('/api/')) return full;          // API
    if (_staticExt.test(path)) return full;             // ملفّات static
    return 'href="/' + _L + path + qh + '"';
  });
}
```
وأُزيلت الكتلة الضيّقة `.lhpc-chip`/`.msc-chip` من تذكرة HOME-CITY (صارت مشمولة ضمن التمرير الموحَّد).

**آمن بالتصميم:** يطابق فقط `href="/…"` بعلامتي تنصيص مزدوجتين ⇒ الروابط الخارجيّة (`https://`/`mailto:`/`tel:`) و`<use href="#…">` لا تُطابَق · يتخطّى المُبادأ مسبقًا (لا تكرار) · يتخطّى الملفّات static و`/api/` · `canonical`/`hreflang`/`og:url` **مطلقة (https://…)** فلا تُمَسّ · `/` → `/{lang}` (دون شرطة ختاميّة لتفادي 301) · **0 رابط `href="/…"` داخل `<script>`** (فُحِص) فلا خطر على JS.

## 4) جدول قبل/بعد — عينة روابط المدن (هيرو)
| اللغة | قبل | بعد |
|---|---|---|
| AR `/` | `/prayer-times-in-makkah` | `/prayer-times-in-makkah` (بلا بادئة) |
| EN `/en` | `/prayer-times-in-makkah` ❌ | `/en/prayer-times-in-makkah` ✅ |
| FR `/fr` | `/prayer-times-in-makkah` ❌ | `/fr/prayer-times-in-makkah` ✅ |
| TR/UR/DE/ID/ES/BN/MS | بلا بادئة ❌ | `/{lang}/prayer-times-in-makkah` ✅ |

## 5) جدول قبل/بعد — عينة روابط الأدوات/الخدمات (EN)
| الرابط | قبل | بعد |
|---|---|---|
| تحويل التاريخ | `/date-converter` ❌ | `/en/date-converter` ✅ |
| حاسبة الزكاة | `/zakat-calculator` ❌ | `/en/zakat-calculator` ✅ |
| الأذكار | `/azkar` ❌ | `/en/azkar` ✅ |
| المسبحة | `/msbaha` ❌ | `/en/msbaha` ✅ |
| القبلة | `/qibla` ❌ | `/en/qibla` ✅ |
| القمر اليوم | `/moon-today` ❌ | `/en/moon-today` ✅ |
| عدّاد رمضان | `/ramadan-countdown` ❌ | `/en/ramadan-countdown` ✅ |
| التقويم الهجري | `/hijri-calendar` ❌ | `/en/hijri-calendar` ✅ |

## 6) تأكيد دمج HOME-CITY
✅ **نعم.** الكتلة الضيّقة لشرائح المدن أُزيلت، وصارت المدن مُبادأة عبر التمرير الموحَّد. **لا تُفتح/تُدفع `HOME-CITY-QUICK-LINKS-...` منفصلة.**

## 7) تأكيد عدم تغيير slugs و SEO
✅ الـ slug إنجليزيّ ثابت (`makkah, medina, riyadh, …`)؛ يُضاف فقط بادئة اللغة. ✅ `canonical`/`hreflang`/`og:url` (مطلقة) دون تغيير · `sitemap`/`Title`/`Meta`/`H1` دون تغيير · منطق البحث/مواقيت الصلاة/بيانات المدن دون تغيير · صفحات الأذكار دون تغيير.

## 8) نتائج SSR و DOM بعد hydration
- **SSR (10 لغات):** كلّ لغة `MISSING=0 · wrong-lang=0`، **0 double-prefix**، `canonical`/`hreflang` مطلقة سليمة، `css/style.css?v=475` (نسبيّ) سليم. (AR: 179 رابطًا داخليًّا بلا بادئة — صحيح.)
- **DOM بعد hydration (/fr، خادم نظيف):** `ok=193 · missing-prefix=0 · double-prefix=0`، شرائح المدن `/fr/prayer-times-in-makkah`، الروابط المُضافة من JS (قائمة اللغة) صحيحة، **لا أخطاء console**. SSR ≈ DOM (JS لا يكسر).

## 9) فحص HTTP لكلّ الروابط الداخليّة
✅ **680 رابطًا داخليًّا فريدًا (من /en) ⇒ كلّها 200.** لا 404، لا redirect غير مرغوب. (المسارات المُبادأة `/en/…` موجودة كصفحات حقيقيّة.) لا روابط قديمة `/dateconverter`.

## 10) الملفّات المعدَّلة (لهذه التذكرة)
| الملف | التغيير |
|---|---|
| `server.js` | استبدال الكتلة الضيّقة لشرائح المدن بـ**تمرير موحَّد** يُبادئ كلّ روابط الهوم الداخليّة (غير العربيّة). |
- **لا** تغيير على `index.html`/`app.js`/CSS/i18n. **لا cache-buster** (تغيير SSR ديناميكيّ فقط؛ HTML يُخدَم لكلّ طلب). LF.

## 11) regression (محليًّا، 12/12 = 200)
`/`، `/en`، `/fr`، `/zakat-calculator`، `/en/zakat-calculator`، `/en/azkar`، `/azkar`، `/en/prayer-times-in-makkah`، `/fr/prayer-times-in-paris`، `/moon-today`، `/en/date-converter`، `/msbaha`. الصفحات الفرعيّة **غير متأثّرة** بالتمرير (مقصور على الهوم عبر `_isHomepageSsr`). `node --check` نظيف.

## 12) cache-busters
**لا شيء** (تغيير SSR فقط).

## 13) رسالة commit المقترحة
```
fix(home): HOME-ALL-LINKS-LANG-ROUTING-FIX-1 — preserve language prefix for homepage internal links
```

---

## ⚠️ تشابك مع AZKAR-HUB-CARD-L10N-FIX-1 (غير مدفوعة)
`server.js` يحمل **تغييرين**: رفع `_i18nVersion` للأذكار (تذكرة AZKAR المعلّقة) + تمرير الروابط (هذه التذكرة). شجرة العمل تحوي 15 ملفًّا (14 للأذكار + server.js المشترك).
**خطّة الدفع النظيفة:** عند اعتمادك، أفصلهما إلى **commitين**: أوّلًا AZKAR-HUB-CARD-L10N-FIX-1 (server.js بحالة رفع الإصدار فقط، بدون تمرير الروابط)، ثمّ HOME-ALL-LINKS (تمرير الروابط في server.js). يلزم اعتماد **كلتيهما** (لتشاركهما server.js).

## معايير القبول
1. كلّ روابط الهوم الداخليّة تحترم اللغة — ✅ (MISSING=0 ×10) · 2. المدن السريعة تحترم اللغة — ✅ · 3. لا نقل لصفحة عربيّة — ✅ · 4. لا `/dateconverter` — ✅ · 5. slugs ثابتة إنجليزيّة — ✅ · 6. لا 404 (680/680=200) — ✅ · 7. لا redirect غير مرغوب — ✅ · 8. SSR≈DOM صحيحان — ✅ · 9. لا أخطاء console — ✅ · 10. regression 200 — ✅.

## تأكيدات
- لم يُنفَّذ commit/push. أوقفتُ خوادم الاختبار. لم تُبدأ أيّ صفحة أذكار. الملفّ المعدَّل لهذه التذكرة: `server.js` فقط (+ هذا التقرير).

**في انتظار اعتمادك للدفع:** `أعتمد دفع تقرير: HOME-ALL-LINKS-LANG-ROUTING-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
