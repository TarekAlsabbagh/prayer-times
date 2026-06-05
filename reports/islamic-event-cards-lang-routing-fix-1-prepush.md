# تقرير ما قبل الدفع: ISLAMIC-EVENT-CARDS-LANG-ROUTING-FIX-1

**النوع:** إصلاح روابط كروت/عدّادات المناسبات الإسلامية بلا بادئة لغة على الصفحات غير العربيّة (تنقل المستخدم للنسخة العربيّة).
**الملفّ:** `server.js` فقط (توسيع التمريرة الموحَّدة SSR). **لا تغيير client/CSS/i18n/index.html.**
**الحالة:** لم يُدفع — بانتظار اعتمادك.

---

## 1) السبب الجذريّ
كروت المناسبات الإسلامية مكتوبة **ثابتة (hardcoded) في `index.html`** ضمن قشرة SPA:
- `.moon-event-card` → `href="/ramadan-countdown"`, `/eid-al-fitr-countdown`, `/eid-al-adha-countdown`, `/hijri-new-year-countdown` (بلا بادئة لغة).
- `#event-countdown-badge` → `/ramadan-countdown`.
هذه الكروت مكرَّرة عبر قوالب صفحات متعدّدة في القشرة (moon / hijri-date / azkar / tasbih …) فتظهر على **كلّ الصفحات**. التمريرتان الموحَّدتان السابقتان كانتا محصورتَين بالهوم (HOME-ALL-LINKS) وصفحات TL/NPT (PRAYER-COUNTDOWN-RELATED-LINKS)؛ بقيّة الصفحات (date-converter / hijri-calendar / today-hijri-date / moon / city / zakat / azkar …) بقيت كروتها **بلا بادئة** ⇒ النقر يُسقط مستخدم اللغة غير العربيّة على الصفحة العربيّة.

## 2) أماكن بناء روابط كروت المناسبات
`index.html` (ثابتة) — كتل `.moon-events-countdown` المتكرّرة (أسطر ~1149/1648/2488/2964/3162/3257/3775/4024/4268/4578 …) + `#event-countdown-badge` (سطر 688). **ليست JS-built — hardcoded في القشرة.**

## 3) hardcoded أم JS؟
**Hardcoded** في `index.html`. لذلك الإصلاح في طبقة SSR (تمريرة بادئة موحَّدة على الـHTML المُقدَّم)، لا في JS ولا بتعديل index.html (يبقى الـHTML مصدرًا واحدًا، والبادئة تُضاف server-side حسب لغة الصفحة).

## 4) عدد الروابط المتأثّرة
**4 روابط عدّادات** لكلّ صفحة غير عربيّة (`ramadan-countdown` + `eid-al-fitr-countdown` + `eid-al-adha-countdown` + `hijri-new-year-countdown`) + شارة `event-countdown-badge`. قبل الإصلاح: على date-converter/hijri-calendar/today-hijri-date/moon/city = **4 بلا بادئة** لكلّ صفحة.

## 5) جدول قبل/بعد (عيّنة BN/EN/AR — SSR)
| الصفحة × لغة | كروت المناسبات قبل | بعد |
|---|---|---|
| `/bn/date-converter` | `/eid-al-fitr-countdown` … (بلا بادئة) | **`/bn/eid-al-fitr-countdown`** … ✅ |
| `/en/date-converter` | بلا بادئة | **`/en/…`** ✅ |
| `/bn/hijri-calendar` · `/bn/today-hijri-date` · `/bn/moon-today` · `/bn/prayer-times-in-makkah` · `/bn/zakat-calculator` · `/bn/azkar` | بلا بادئة | **`/bn/…`** ✅ |
| `/date-converter` (ar) | `/eid-al-fitr-countdown` (بلا بادئة — صحيح) | **`/ramadan-countdown` …** بلا بادئة ✅ (لا تغيير) |
> بعد الإصلاح، فحص SSR على date-converter/hijri-calendar/today-hijri-date/moon/city/zakat/azkar × ar/bn/en/fr/ur: **eventMISS=0، allInternalMISS=0، DOUBLE=0** للجميع؛ العربيّة 0 روابط مُبادأة خطأً.

## 6) تأكيد عدم تغيير slug
✅ معرّفات المناسبات إنجليزيّة ثابتة (`ramadan-countdown`, `eid-al-fitr-countdown`, `eid-al-adha-countdown`, `hijri-new-year-countdown`). التمريرة تُضيف بادئة اللغة فقط؛ لا تترجم/تغيّر المعرّف.

## 7) تأكيد عدم تغيير الحسابات/العدّادات
✅ منطق حساب المناسبات والعدّادات في صفحات `*-countdown` بلا تغيير (التمريرة تمسّ `href` فقط). الـHTTP لكلّ صفحات العدّادات المُبادأة = 200.

## 8) تأكيد عدم تغيير SEO
✅ canonical/hreflang/og:url مطلقة (https) — غير ممسوسة (التمريرة تطابق `href="/…"` النسبيّة فقط). Title/Meta بلغتها. JSON-LD يستخدم `url`/`item` لا `href=` — غير ممسوس. sitemap بلا تغيير. (مؤكَّد على `/bn/date-converter`: canonical+hreflang `/bn/…`، Title بنغاليّ.)

## 9) نتائج SSR
12 توليفة صفحة×لغة: **MISSING=0 / DOUBLE=0** لغير العربيّة، العربيّة بلا بادئة. روابط العدّادات المُبادأة كلّها **200** (bn/en/fr/ur).

## 10) نتائج DOM بعد hydration
`/bn/date-converter`: `.moon-event-card` = `/bn/ramadan-countdown` + `/bn/eid-al-fitr-countdown` + `/bn/eid-al-adha-countdown` + `/bn/hijri-new-year-countdown`؛ `wrongCount=0` (91 رابطًا event-ish). `/date-converter` (ar): الكروت بلا بادئة، `wronglyPrefixedOnAr=0`. **0 أخطاء console.**

## 11) نتائج HTTP للروابط
`/bn/eid-al-fitr-countdown`, `/bn/eid-al-adha-countdown`, `/bn/ramadan-countdown`, `/bn/hijri-new-year-countdown`, `/en/eid-al-fitr-countdown`, `/fr/ramadan-countdown`, `/ur/hijri-new-year-countdown` ⇒ كلّها **200**. لا 404.

## 12) الملفّات المعدَّلة
| الملفّ | التغيير |
|---|---|
| `server.js` | توسيع حارس التمريرة الموحَّدة من `(seo.timeLeftPage || seo.nextPrayerPage)` إلى **كلّ الصفحات غير العربيّة** (`seo.lang !== 'ar'`) + تحديث التعليق. (سطر واحد منطقيّ + تعليق.) |

## 13) نتائج regression
- `node --check server.js` ✅ · 0 أخطاء console ✅
- الهوم (مُغطّى أصلاً بتمريرته): إعادة التشغيل = no-op (روابط مُبادأة مسبقًا) ⇒ DOUBLE=0 ✅
- TL/NPT: ما زالت تعمل (مشمولة الآن بالحارس العامّ) ✅
- العربيّة على كلّ الصفحات: بلا بادئة ✅
- canonical/hreflang/Title/JSON-LD/sitemap بلا تغيير ✅

## 14) cache-busters
**لا شيء** — تغيير SSR بحت؛ الـHTML بـ`Cache-Control: no-cache`. لا تغيير app.js/CSS/i18n/SW ⇒ لا `?v=`، لا `_i18nVersion`، لا `CACHE_VERSION`. (مطابق لتذكرتَي الروابط السابقتَين.)

## 15) رسالة commit المقترحة
```
fix(i18n): ISLAMIC-EVENT-CARDS-LANG-ROUTING-FIX-1 — preserve language prefix in Islamic event card links

Generalize the unified SSR language-prefix pass (HOME-ALL-LINKS /
PRAYER-COUNTDOWN-RELATED-LINKS) to EVERY non-AR page. The Islamic-event
countdown cards (.moon-event-card → /ramadan-countdown, /eid-al-fitr-countdown,
/eid-al-adha-countdown, /hijri-new-year-countdown) + #event-countdown-badge are
hardcoded in the SPA shell on every page, so on /bn /en /fr … a click dropped
the user onto the Arabic page. Now they (and all internal links) carry the
current lang prefix site-wide; AR stays prefix-less; IDs/slugs unchanged;
canonical/hreflang/Title/JSON-LD untouched. SSR-only, no cache-buster.
```

---

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: ISLAMIC-EVENT-CARDS-LANG-ROUTING-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
