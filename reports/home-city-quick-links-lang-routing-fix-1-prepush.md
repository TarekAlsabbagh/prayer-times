# تقرير ما قبل الدفع: HOME-CITY-QUICK-LINKS-LANG-ROUTING-FIX-1

**النوع:** إصلاح توجيه لغة روابط المدن السريعة في الصفحة الرئيسية (هيرو). **لم يُنفَّذ commit/push.**
**التحقّق:** SSR (curl، 10 لغات) + DOM-after-hydration (Preview) + regression.

---

## 1) السبب الجذريّ
روابط المدن السريعة في الهيرو (`.lhpc-chip` — مكة/المدينة/الرياض/جدة/القاهرة/إسطنبول) كانت **hardcoded في `index.html`** بصيغة `href="/prayer-times-in-{slug}"` **بدون بادئة لغة**. وبما أنّ كلّ المسارات تَخدم `index.html` نفسه (SPA)، فإنّ المستخدم على `/en` يضغط الرابط فينتقل إلى `/prayer-times-in-makkah` (بلا بادئة) ⇒ تظهر الصفحة بالعربيّة. **شبكة الفوتر** (`popular-cities-grid`) كانت تُبادئ صحيحًا في SSR، لكنّ هيرو الكويك-سيتيز لم يكن.

## 2) أين كانت الروابط تُبنى
- **هيرو الكويك-سيتيز** (`index.html` أسطر 423–428): `<a class="lhpc-chip" href="/prayer-times-in-{slug}" …>` — **hardcoded بلا بادئة** ⇒ مصدر العطل.
- **الفوتر** (`popular-cities-grid`): يُبادأ صحيحًا في `server.js` (~18638): `prefix = (Lf==='ar')?'':'/'+Lf` — سليم، لم يُمَسّ.
- **الأكثر بحثًا** (`.msc-chip`, `#most-searched-chips`): **مُجرّدة من DOM الصفحة الرئيسية تمامًا في SSR** (غير ظاهرة للمستخدم) ولا يعيد JS بناءها ⇒ غير معنيّة بالعطل المرئيّ.

## 3) hardcoded أم JS يعيد البناء؟
**hardcoded في SSR.** `js/app.js` **لا** يعيد بناء روابط `.lhpc-chip` (يشير إليها في selector لأحداث فقط، لا يكتب href). فالإصلاح في طبقة SSR هو الصحيح (يعمل حتّى قبل/بدون JS). وبعد hydration، يترجم محوّل i18n **نصّ** الشريحة فقط (Mecca/Medina…) دون لمس الـ href.

## 4) ما تمّ تعديله
في `server.js` ضمن كتلة SSR لترجمة روابط الفوتر (بعد معالجة `popular-cities-grid`)، أُضيفت قاعدة: **لغير العربيّة فقط** (`Lf !== 'ar'`) يُضاف `/{lang}` إلى href شرائح `.lhpc-chip` (و`.msc-chip` دفاعيًّا) عبر regex مُحكَم يطابق `href="/prayer-times-in-{slug}"`. **الـ slug يبقى إنجليزيًّا ثابتًا**؛ يُضاف فقط بادئة اللغة. العربيّة تبقى بلا بادئة.
```js
if (Lf !== 'ar') {
  const _cpfx = '/' + Lf;
  html = html.replace(/(<a class="lhpc-chip" href=")(\/prayer-times-in-[a-z][a-z0-9-]*)(")/g, (m,a,p,c)=>a+_cpfx+p+c);
  html = html.replace(/(<a class="msc-chip" href=")(\/prayer-times-in-[a-z][a-z0-9-]*)(")/g,  (m,a,p,c)=>a+_cpfx+p+c);
}
```

## 5) جدول قبل/بعد (هيرو، رابط مكة كمثال — كلّ المدن الستّ تتبع نفس النمط)
| اللغة | قبل | بعد |
|---|---|---|
| AR `/` | `/prayer-times-in-makkah` | `/prayer-times-in-makkah` (بلا بادئة — صحيح) |
| EN `/en` | `/prayer-times-in-makkah` ❌ | **`/en/prayer-times-in-makkah`** ✅ |
| FR `/fr` | `/prayer-times-in-makkah` ❌ | **`/fr/prayer-times-in-makkah`** ✅ |
| TR `/tr` | `/prayer-times-in-makkah` ❌ | **`/tr/prayer-times-in-makkah`** ✅ |
| UR `/ur` | `/prayer-times-in-makkah` ❌ | **`/ur/prayer-times-in-makkah`** ✅ |
- مؤكَّد لكلّ اللغات العشر SSR: de/id/es/bn/ms أيضًا `/{lang}/prayer-times-in-makkah` ✅.
- **DOM بعد hydration (/en):** الروابط الستّ كلّها `/en/prayer-times-in-…`، النصوص مترجمة (Mecca/Medina/…)، البادئة محفوظة، **لا أخطاء console**.

## 6) تأكيد عدم تغيير slugs
✅ الـ slug إنجليزيّ ثابت في كلّ اللغات: `makkah, medina, riyadh, jeddah, cairo, istanbul`. الاختلاف الوحيد هو بادئة اللغة `/en/ /fr/ …`. لم تُستخدَم أسماء مترجمة في الـ slug.

## 7) تأكيد عدم تغيير SEO
✅ لا تغيير على: canonical, hreflang, sitemap, Title, Meta, H1، منطق البحث، منطق مواقيت الصلاة، بيانات المدن، صفحات الأذكار. التعديل **يضيف بادئة لغة إلى href شرائح الهيرو فقط** على الصفحة الرئيسية. شبكة الفوتر سليمة (لم تتأثّر — تأكَّد en مُبادأ + ar بلا بادئة).

## 8) الملفّات المعدَّلة (لهذه التذكرة)
| الملف | التغيير |
|---|---|
| `server.js` | +كتلة بادئة لغة لشرائح `.lhpc-chip` / `.msc-chip` في SSR (لغير العربيّة). |
- **لا** تغيير على `index.html` (المصدر يبقى بلا بادئة؛ SSR يضيفها) ولا `app.js` ولا CSS ولا i18n. **لا cache-buster** (HTML يُخدَم ديناميكيًّا لكلّ طلب؛ لا ملفّ بإصدار تغيّر). LF.

## 9) regression (محليًّا)
✅ `/` (200) · `/en` (200) · `/fr/prayer-times-in-paris` (200) · `/zakat-calculator` (200) · `/azkar` (200) · `/msbaha` (200) · `/moon-today` (200). لا أخطاء console.

## 10) cache-busters
**لا شيء** خاصّ بهذه التذكرة (تغيير SSR فقط في server.js؛ لا أصول مُصدَّرة).

## 11) رسالة commit المقترحة
```
fix(home): HOME-CITY-QUICK-LINKS-LANG-ROUTING-FIX-1 — preserve language prefix in homepage city links
```

---

## ⚠️ ملاحظة تشابك مع تذكرة سابقة غير مدفوعة
شجرة العمل الحاليّة تحوي **أيضًا** تغييرات تذكرة **AZKAR-HUB-CARD-L10N-FIX-1** التي لم تعتمد دفعها بعد (15 ملفًّا: `css/style.css` + `js/i18n.js` + 10 ملفّات لغة + `index.html` + `sw.js` + رفع `_i18nVersion` في `server.js`). و`server.js` يحمل **التغييرين معًا** (رفع `_i18nVersion` للأذكار + كتلة روابط المدن لهذه التذكرة).
**خطّة الدفع النظيفة عند اعتمادك:** سأفصلهما إلى **commitين منفصلين**: أوّلًا AZKAR-HUB-CARD-L10N-FIX-1 (بحالة server.js بدون كتلة المدن)، ثمّ HOME-CITY-QUICK-LINKS (كتلة المدن في server.js وحده). يلزم اعتماد **كلتا** التذكرتين للدفع (لأنّهما تتشاركان server.js)، أو اعتماد AZKAR أوّلًا.

## معايير القبول
1. روابط المدن السريعة تحترم اللغة الحاليّة — ✅ · 2. لا نقل EN/FR/TR/UR لصفحة عربيّة — ✅ · 3. slugs إنجليزيّة ثابتة — ✅ · 4. البحث الرئيسيّ غير متأثّر — ✅ · 5. صفحات مواقيت الصلاة لم تتغيّر — ✅ · 6. canonical/hreflang/sitemap بلا تغيير — ✅ · 7. لا أخطاء console — ✅ · 8. regression 200 — ✅.

**في انتظار اعتمادك للدفع:** `أعتمد دفع تقرير: HOME-CITY-QUICK-LINKS-LANG-ROUTING-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
