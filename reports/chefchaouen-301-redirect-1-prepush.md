# تقرير ما قبل الدفع: CHEFCHAOUEN-301-REDIRECT-1

**النوع:** 301 من الـslug المكتشف القديم `chefchaouen-ma` إلى الـslug الرسميّ القانونيّ `chefchaouen`.
**الحالة:** **مُنفَّذ** (التنفيذ آمن) — لم يُدفع، بانتظار اعتمادك.
**النطاق:** ملفّ واحد — `server.js` (**+17 سطرًا**، 0 حذف). **بلا** curated/db-cities/site-search/APIs/index.html/cache-buster.
**القاعدة:** `origin/main = HEAD = 399e77b`.

## 1) هل 301 آمن؟ — **نعم، آمن ومُنفَّذ**
استُخدمت الآليّة القائمة `CURATED_REDIRECTS` (نفس مسار `mecca→makkah`) عبر **خريطة يدويّة مصدرها `server.js`** — لا تعديل للملفّ المولَّد الهشّ. الاختبارات أثبتت أمانه (لا loop، لا كسر noindex لمدن أخرى، لا redirects عشوائية).

## 2) مكان تنفيذ التحويل
`server.js`، بعد كتلة تحميل `db/curated-slugs.json` (≈1705): ثابت `_MANUAL_PROMOTED_REDIRECTS` يُدمَج في `CURATED_REDIRECTS` عند الإقلاع. ثمّ يستهلكه **معالج Phase-G 301 القائم** (server.js:≈23964) بلا تعديل — يغطّي كلّ عائلات المسارات + بادئات اللغات.

## 3) CURATED_REDIRECTS أم طريقة أخرى؟
**CURATED_REDIRECTS** (الآليّة المصمَّمة)، لكن المصدر **خريطة يدويّة في `server.js`** بدل تعديل `db/curated-slugs.json`:
- الـ`redirects` في `curated-slugs.json` **مولَّدة آليًّا** من `oldSlugs` المشتقّة من تَسليج الاسم الإنجليزيّ (عبر `build-curated-sitemap.mjs`)؛ و`chefchaouen-ma` **غير مشتقّ آليًّا** (لاحقة اكتشاف). فتعديل الملفّ المولَّد = **هشّ** (إعادة التوليد تمحوه). الخريطة في `server.js` **مُلتزَمة وتنجو من إعادة التوليد** (تُدمَج كلّ إقلاع).
```js
const _MANUAL_PROMOTED_REDIRECTS = { 'chefchaouen-ma': 'chefchaouen' };
for (const _oldSlug in _MANUAL_PROMOTED_REDIRECTS) {
    const _to = _MANUAL_PROMOTED_REDIRECTS[_oldSlug];
    if (_oldSlug !== _to && !CURATED_REDIRECTS[_oldSlug]) CURATED_REDIRECTS[_oldSlug] = _to; // loop-guard + no-override
}
```

## 4) الرابط القديم قبل/بعد (`/prayer-times-in-chefchaouen-ma`)
| | قبل | بعد |
|---|---|---|
| الحالة | 200 · `noindex,follow` | **301 → `/prayer-times-in-chefchaouen`** |

## 5) الرابط الرسميّ (`/prayer-times-in-chefchaouen`)
**200 · index,follow · H1=1 · canonical = `…/prayer-times-in-chefchaouen` · بلا تسرّب «Chefchaouen Ma»** (بلا تغيير عمّا أرسته تذكرة الترقية).

## 6) اللغات ar/en/fr (الكلّ PASS)
| المسار | النتيجة |
|---|---|
| `/prayer-times-in-chefchaouen-ma` | 301 → `/prayer-times-in-chefchaouen` |
| `/en/prayer-times-in-chefchaouen-ma` | 301 → `/en/prayer-times-in-chefchaouen` |
| `/fr/prayer-times-in-chefchaouen-ma` | 301 → `/fr/prayer-times-in-chefchaouen` |
> اللغة محفوظة (المعالج يُبقي `_langPart`). والوجهة في كلّ لغة 200 · index · H1=1.
> **مكافأة:** `qibla-in/moon-today-in/moon-in/next-prayer-in/time-left-…-chefchaouen-ma` تُحوَّل أيضًا → القانونيّ (لاحظ: `/qibla-in-chefchaouen-ma` كان **index** سابقًا — التحويل يُوحّده إلى `/qibla-in-chefchaouen`).

## 7) لا redirect loop (مؤكَّد)
`fetch(redirect:follow)` على `/prayer-times-in-chefchaouen-ma` → **ينتهي بـ200** على `/prayer-times-in-chefchaouen`. الحارس `_oldSlug !== _to` + كون `chefchaouen` ليس مصدر تحويل → لا حلقة.

## 8) لا كسر discovered noindex للمدن الأخرى (مؤكَّد)
`/prayer-times-in-faketown-ma` و`/prayer-times-in-somewhere-de` (غير curated، غير مُدرَجة) → **200 · noindex,follow، بلا تحويل**. الخريطة مستهدَفة لـ`chefchaouen-ma` فقط. و`mecca→makkah` الأصليّ ما زال يعمل (الدمج لم يُتلِف entries القائمة).

## 9) لا تغيير للبحث
معالج 301 يخصّ مسارات الصفحات (`prayer-times-in`/`qibla-in`/…) ويعمل **قبل** منطق `/api/*`. لم يُمَسّ `/api/search-place` ولا `/api/place-selected` ولا `js/site-search.js` ولا search pipeline. (تأكيد: بحث الإنتاج لاحقًا ضمن post-push.)

## 10) الملفّات المعدَّلة
`server.js` (**+17 سطرًا**: التعليق + `_MANUAL_PROMOTED_REDIRECTS` + حلقة الدمج). **بلا** `curated-places.json` · `db/cities` · `db/curated-slugs.json` · `index.html` · أيّ JS عميل · cache-buster (تغيير خادميّ بحت).

## 11) نتائج regression (الكلّ PASS)
`/` · `/prayer-times-in-rabat` · `/prayer-times-in-essaouira` · `/prayer-times-in-riyadh` · `/prayer-times-in-morocco` · `/qibla` · `/azkar` · `/msbaha` → **كلّها 200 · H1=1**. `node --check server.js` ✓.

## 12) رسالة commit المقترحة
```
fix(city): CHEFCHAOUEN-301-REDIRECT-1 — redirect old discovered Chefchaouen slug to curated page
```

---
**الخلاصة:** 301 آمن من `chefchaouen-ma` (كلّ عائلات المسارات + ar/en/fr) إلى `chefchaouen` القانونيّ — عبر خريطة يدويّة مُلتزَمة في `server.js` مُدمَجة في `CURATED_REDIRECTS` (غير هشّة، تنجو من إعادة توليد curated-slugs). لا loop، لا كسر noindex لمدن أخرى، لا redirects عشوائية، لا مساس بالبحث/curated/db-cities. الوجهة 200 index H1=1 canonical صحيح. regression نظيف.

**النتيجة المقترحة:** ✅ جاهز للدفع — للاعتماد أرسِل: `أعتمد دفع تقرير: CHEFCHAOUEN-301-REDIRECT-1`

*(ملاحظة ثابتة: لا تُبدأ أيّ صفحة أذكار جديدة حتى اعتماد `/azkar/prayer-azkar` بصريًّا.)*
