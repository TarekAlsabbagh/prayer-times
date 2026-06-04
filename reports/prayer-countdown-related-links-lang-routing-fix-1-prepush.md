# تقرير ما قبل الدفع: PRAYER-COUNTDOWN-RELATED-LINKS-LANG-ROUTING-FIX-1

**النوع:** إصلاح روابط داخليّة بلا بادئة لغة على صفحتَي العدّ التنازليّ والصلاة القادمة (تنقل المستخدم للنسخة العربيّة الافتراضيّة).
**الملفّ:** `server.js` فقط (تمريرة SSR موحَّدة). **لا تغيير client/CSS/i18n.**
**الحالة:** لم يُدفع — بانتظار اعتمادك.

---

## 1) السبب الجذريّ

صفحتا `time-left-until-next-prayer-in-{city}` و`next-prayer-in-{city}` تُقدَّمان عبر قشرة SPA واحدة فيها **~111 رابطًا داخليًّا `<a href="/…">` مكتوبة بلا بادئة لغة** (أدوات، كروت خدمات، عدّادات الأعياد، روابط القمر/القبلة/الهجري/محوّل التاريخ، كروت المدن، related pills، روابط FAQ). على `/en /fr /bn …` كان النقر يُسقط المستخدم على النسخة العربيّة (بلا بادئة). تذكرة **HOME-ALL-LINKS-LANG-ROUTING-FIX-1** عالجت هذا **للهوم فقط** عبر تمريرة موحَّدة محروسة بـ`_isHomepageSsr`؛ صفحتا TL/NPT خارج تلك الحراسة فبقيتا معطوبتين.

## 2) الصفحات المتأثّرة

`time-left-until-next-prayer-in-{city}` + `next-prayer-in-{city}` — لكلّ اللغات غير العربيّة (en/fr/tr/ur/de/id/es/bn/ms). العربيّة سليمة أصلاً (بلا بادئة بحكم التصميم).

## 3) عدد الروابط الخاطئة قبل الإصلاح (SSR الإنتاج، قبل)

| الصفحة (غير عربيّة) | internal | **MISSING-prefix** |
|---|---|---|
| `/{lang}/time-left-…-madinah` | 122 | **111** |
| `/{lang}/next-prayer-in-madinah` | 124 | **111** |
> مطابق لكلّ اللغات (bn/en/fr/ur اختُبرت). العربيّة MISSING=0 (صحيح).

## 4) جدول قبل/بعد — BN/EN/FR/UR (SSR، بعد الإصلاح)

| اللغة | MISSING قبل | MISSING بعد | double-prefix | العربيّة |
|---|---|---|---|---|
| bn | 111 | **0** | 0 | — |
| en | 111 | **0** | 0 | — |
| fr | 111 | **0** | 0 | — |
| ur | 111 | **0** | 0 | — |
| ar | 0 | **0** (بلا بادئة) | 0 | صحيح ✅ |

## 5) جدول قبل/بعد للصفحتين (SSR، بعد)

| الصفحة × لغة | MISSING بعد | canonical | Title |
|---|---|---|---|
| bn / time-left …makkah | **0** | `/bn/…` ✅ | «মক্কা-এ আজ…» (بنغاليّ) |
| en / next-prayer …riyadh | **0** | `/en/…` ✅ | «Next Prayer Time in Riyadh…» |
| fr / time-left …cairo | **0** | `/fr/…` ✅ | «Temps restant avant la prière…» |
| ur / next-prayer …istanbul | **0** | `/ur/…` ✅ | «آج استنبول میں اگلی نماز…» (أرديّ) |

عيّنة روابط مُصلَحة على `/bn/time-left-…-madinah`:
`/bn/moon-today` · `/bn/hijri-calendar` · `/bn/today-hijri-date` · `/bn/qibla-in-madinah` · `/bn/qibla` · `/bn/prayer-times-in-madinah` · `/bn/next-prayer-in-madinah` · `/bn/zakat-calculator` · `/bn/azkar` · `/bn/azkar/morning-azkar` · `/bn/eid-al-fitr-countdown` · `/bn/moon-today-in-makkah`.
(ملاحظة: `date-converter` غير موجود كرابط على صفحة TL — مثال هوم عامّ؛ ولو وُجد لأُبودئ كبقيّة الروابط.)

## 6) ما تمّ تعديله

بلوك واحد جديد في `server.js` نهاية `serveHtmlWithSeo` (قبل ترميز الـbuffer)، يطبّق **نفس منطق تمريرة الهوم بالحرف** لكن محروسًا بـ`(seo.timeLeftPage || seo.nextPrayerPage) && seo.lang !== 'ar'`:
```js
html = html.replace(/href="(\/[^"?#]*)((?:[?#][^"]*)?)"/g, (full, path, qh) => {
    if (path === '/') return 'href="/' + _L + '"';   // home/logo → /{lang}
    if (_alreadyPrefixed.test(path)) return full;     // already /xx/…  (no double)
    if (path.startsWith('/api/')) return full;        // API
    if (_staticExt.test(path)) return full;           // static assets
    return 'href="/' + _L + path + qh + '"';          // add lang prefix
});
```
آمن بالبناء: يطابق `href="/…"` بعلامتَي اقتباس فقط (الخارجيّة https/mailto/tel و`<use href="#…">` لا تُطابَق)، يتخطّى المُبادأة مسبقًا/الثابتة/api، والـcanonical/hreflang/og:url مطلقة (https) فلا تُمسّ، وJSON-LD يستخدم مفاتيح `url`/`item` لا `href=` فلا يُمسّ.

## 7) تأكيد عدم تغيير slugs

✅ الـslugs إنجليزيّة ثابتة (`madinah/makkah/riyadh/cairo/istanbul`). التمريرة تُضيف بادئة اللغة فقط؛ لا تلمس الـslug. `madinah` تبقى `madinah` داخل `/bn/prayer-times-in-madinah`.

## 8) تأكيد عدم تغيير الحسابات/SEO

✅ بلا مساس بحساب المواقيت/العدّ التنازليّ/ترتيب الصلوات/أسماء المدن. ✅ Title/Meta محفوظة بلغتها. ✅ canonical مطلق `/{lang}/…` صحيح (غير ممسوس). ✅ hreflang/og:url مطلقة (غير ممسوسة). ✅ sitemap بلا تغيير. ✅ صفحات الأذكار: روابطها داخل القشرة صارت `/bn/azkar…` (مطلوب) بلا أيّ تعديل على منطق/محتوى الأذكار.

## 9) نتائج SSR + DOM بعد hydration

- **SSR** (10 صفحات: ar/bn/en/fr/ur × TL/NPT): MISSING=0 لغير العربيّة، DOUBLE=0، العربيّة بلا بادئة.
- **DOM بعد hydration** (`/bn/time-left-…-madinah`): `realWrongCount=0` (الـ13 «wrong» في كاشف المستخدم كلّها رابط الهوم `/bn` — صحيح، بلا trailing slash لتفادي 301)، DOUBLE=0.
- **DOM على AR** (`/time-left-…-madinah`): `wronglyPrefixedOnAr=0` (كلّ الروابط بلا بادئة — صحيح).
- 0 أخطاء console.

## 10) نتائج HTTP status للروابط الداخليّة

كلّها **200** (localhost): `/bn/moon-today`, `/bn/date-converter`, `/bn/hijri-calendar`, `/bn/today-hijri-date`, `/bn/qibla-in-madinah`, `/bn/prayer-times-in-madinah`, `/bn/next-prayer-in-madinah`, `/bn/zakat-calculator`, `/bn/azkar`, `/bn/eid-al-fitr-countdown`, `/en/moon-today`, `/fr/qibla-in-makkah`, `/ur/prayer-times-in-riyadh`. لا `/dateconverter` قديم. لا 404.

## 11) الملفّات المعدَّلة

| الملفّ | التغيير |
|---|---|
| `server.js` | +35 سطرًا: بلوك تمريرة بادئة اللغة الموحَّد لصفحتَي TL/NPT في نهاية `serveHtmlWithSeo`. |

## 12) cache-busters

**لا شيء** — تغيير SSR بحت؛ صفحات الـHTML تُقدَّم بـ`Cache-Control: no-cache` فتُجلب طازجة دائمًا. لا تغيير في app.js/CSS/i18n/SW ⇒ لا `?v=`، لا `_i18nVersion`، لا `CACHE_VERSION`. (مطابق لتذكرة HOME-ALL-LINKS.)

## 13) رسالة commit المقترحة

```
fix(prayer-countdown): PRAYER-COUNTDOWN-RELATED-LINKS-LANG-ROUTING-FIX-1 — preserve language prefix in countdown related links

Apply the unified SSR language-prefix pass (same logic as HOME-ALL-LINKS)
to time-left-until-next-prayer-in-{city} + next-prayer-in-{city}. ~111
internal hrefs per non-AR page were hardcoded without a lang prefix,
dropping users onto the Arabic page. Now every eligible internal link
carries the current lang prefix; AR stays prefix-less; slugs unchanged;
canonical/hreflang/Title untouched. SSR-only, no cache-buster.
```

---

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: PRAYER-COUNTDOWN-RELATED-LINKS-LANG-ROUTING-FIX-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
