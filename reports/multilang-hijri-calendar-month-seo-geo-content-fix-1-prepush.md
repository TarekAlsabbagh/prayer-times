# تقرير ما قبل الدفع: MULTILANG-HIJRI-CALENDAR-MONTH-SEO-GEO-CONTENT-FIX-1

**النوع:** SEO/GEO — Title ladder (50–60) + Meta ladder (120–160) لكل اللغات العشر + SSR-fill للمحتوى التعليمي في `/hijri-calendar/YYYY-MM`. **لم يُنفَّذ commit/push.**
**التحقّق:** متصفح headless (Preview) DOM-after-hydration + SSR (node fetch، codepoint counts) + ladder validation (12 شهرًا × 10 لغات) + regression.

## 1) السبب الجذري
- **Title قصير:** صفحة الشهر كانت تستخدم خريطة Title ثابتة (`_HMO_TITLE`) تُنتج 30–43 codepoint — **تحت أرضية 50** في كل اللغات العشر.
- **Meta قصير:** خريطة Meta ثابتة (`_HMO_DESC`) تُنتج 91–130 cp — **تحت أرضية 120** في 8 من 10 لغات.
- **Rendered/Amount:** الفقرة التعليمية `#hmonth-footer-seo` كانت **فارغة في SSR** ويملؤها `loadHijriMonthPage()` بعد hydration → زاحف SEOptimer يرى نثرًا قليلًا خاصًّا بالصفحة (Rendering ~21%).
- **Client overwrite:** ✅ **لا يوجد** — الحارس العالميّ `GLOBAL-CLIENT-SEO-NO-OVERWRITE-SSR-FIX-1` في `setSEOMeta` يثق بـ SSR في صفحة الهبوط؛ DOM-after-hydration = SSR تمامًا (تم التأكيد قبل الإصلاح: Title 36/Meta 91 محفوظان، metaCount=1).

## 2) الصفحات المفحوصة
10 لغات على `/hijri-calendar/1447-12` + عيّنات شهور AR/EN (1447-01/03/06/12) + regression (today/year/day/msbaha/qibla/prayer/home).

## 3) جدول Title/Meta قبل/بعد (codepoints، 1447-12)
| لغة | Title قبل | Title بعد | Meta قبل | Meta بعد |
|---|---|---|---|---|
| ar | 36 | **54** | 91 | **153** |
| en | 37 | **54** | 113 | **149** |
| fr | 42 | **55** | 125 | **155** |
| tr | 29 | **53** | 92 | **152** |
| ur | 30 | **60** | 94 | **143** |
| de | 40 | **57** | 130 | **146** |
| id | 33 | **58** | 111 | **139** |
| es | 37 | **53** | 118 | **146** |
| bn | 35 | **60** | 115 | **134** |
| ms | 32 | **56** | 114 | **144** |
- **كل العناوين 50–60 ✓ وكل الأوصاف 120–160 ✓** (10/10).
- **تحقّق شامل:** ladder validation عبر **12 شهرًا × 10 لغات × {29,30} يومًا** = 100% داخل النطاق (longest «ذو الحجة/Dschumādā th-thāniya» + shortest «رجب/Safar»). عيّنات AR/EN لأشهر 01/03/06/12 كلها داخل النطاق.

## 4) جدول SSR vs DOM بعد hydration
| العنصر | SSR | DOM بعد hydration |
|---|---|---|
| Title | 54 cp (laddered) | **54 cp مطابق** |
| Meta | 153 cp (laddered) | **153 cp مطابق** |
| metaCount | 1 | **1** |
| canonical / og:url | path-derived | **صحيحان** (مضيف صحيح) |
| `#hmonth-footer-seo` | مملوء (`data-ssr-rendered="1"`) | marker مُستهلَك، النصّ SSR ثابت (276 حرف + رابط سنة) |
| جدول الشهر | 29 صفًّا (SSR) | **29 صفًّا** |

## 5) هل يوجد client overwrite؟
**لا.** الحارس العالميّ يحفظ Title/Meta من SSR في صفحة الهبوط؛ ولـ footer-seo أُضيف حارس no-swap مخصّص (يُستهلَك العلَم أول hydration، ويُعاد البناء عند تنقّل SPA). لا setSEOMeta داخل `loadHijriMonthPage` أصلًا.

## 6) Title ladder المُضاف
استُبدلت `_HMO_TITLE` الثابتة بـ `_HMO_TITLE_FORMS` (5–6 مرشّحات/لغة) + `_pickHmoTitle` (أول ∈ [50,60] → أطول ≤60 → fallback) — نفس نمط ladder صفحة اليوم. الكلمات طبيعية (تقويم الشهر / الأيام الهجرية / التاريخ الميلادي).

## 7) Meta ladder المُضاف
استُبدلت `_HMO_DESC` الثابتة بـ `_HMO_DESC_FORMS` (2–3 مرشّحات/لغة) + `_pickHmoDesc` (أول ∈ [120,160] → أطول ≤160 → fallback). تتضمّن: تقويم الشهر، الشهر الهجري، التاريخ الميلادي، عدد الأيام (`${totalDays}`)، تقويم أم القرى — بلا حشو.

## 8) GEO / Rendered Content
SSR-fill `#hmonth-footer-seo` (كان فارغًا) بفقرة تعليمية SSR-readable لكل لغة (يعرض ماذا، يساعد على ماذا، عدد الأيام، أم القرى) + رابط داخليّ واحد إلى تقويم السنة + `data-ssr-rendered="1"` + حارس no-swap في app.js. لا markup جديد، لا CSS — يستخدم الـ `<p>` الموجود.

## 9) Amount of Content
الفقرة التعليمية (~276 حرفًا/لغة) أصبحت SSR-visible بدل أن تكون JS-only → زيادة النثر الخاصّ بالصفحة الذي يراه الزاحف، دون حشو أو نصّ مخفيّ.

## 10) الملفّات المعدَّلة (4 ملفّات، +96/-29)
| الملف | التغيير |
|---|---|
| `server.js` | +107/-… — `_HMO_TITLE_FORMS`+`_pickHmoTitle` · `_HMO_DESC_FORMS`+`_pickHmoDesc` (يستبدلان الخرائط الثابتة) · كتلة SSR-fill لـ `#hmonth-footer-seo` (قاموس `_HM_FOOTER_SEO` 10 لغات + رابط سنة + marker) |
| `js/app.js` | +10/-2 — حارس no-swap لـ `#hmonth-footer-seo` |
| `index.html` | `app.js?v=757 → 758` (موضعان) |
| `sw.js` | `CACHE_VERSION v417 → v418` + PRECACHE 758 |

## 11) تأكيد عدم تغيير الحسابات
✅ لم تُمَسّ: `_getDaysInHijriMonth`/`_hijriToGregorian`/أم القرى/عدد أيام الشهر/بداية ونهاية الشهر/روابط الأيام/روابط الأشهر. الجدول 29 صفًّا (ذو الحجة 1447 = 29 يومًا) دون تغيير. (الـ `${totalDays}` المعروض في الـ meta/footer يقرأ من نفس المحرّك.)

## 12) تأكيد عدم تغيير canonical/hreflang/sitemap
✅ canonical/og:url path-derived دون تغيير (مضيف صحيح)، hreflang=11، sitemap غير ممسوس (الإصلاح لا يمسّ routing ولا الـ head links). JSON-LD غير ممسوس.

## 13) نتائج regression URLs
✅ **22/22 = 200** محليًّا (شهر 5 لغات + شهور AR + hub + year + day + today + msbaha + qibla-city + prayer-city + home). صفحة اليوم title دون تغيير، صفحة السنة title دون تغيير.

## 14) cache-busters
`app.js?v=757 → 758` · `CACHE_VERSION v417 → v418` · PRECACHE 758.

## 15) رسالة commit المقترحة
```
seo(hijri): MULTILANG-HIJRI-CALENDAR-MONTH-SEO-GEO-CONTENT-FIX-1 — improve month pages SEO and SSR readability
```

---

## معايير القبول
1. Title الشهر العربيّ ∈ 50–60 — ✅ (54)
2. Meta الشهر العربيّ ∈ 120–160 — ✅ (153)
3. Title/Meta الإنجليزيّة ∈ النطاق — ✅ (54 / 149)
4. باقي اللغات ∈ النطاق — ✅ (10/10، جدول §3 + 12 شهرًا)
5. SSR و DOM بعد hydration لا يتعارضان — ✅ (مطابقان)
6. لا client overwrite — ✅ (حارس عالميّ + حارس footer)
7. metaCount=1 — ✅
8. canonical/og:url صحيحان — ✅
9. جدول الشهر من SSR — ✅ (29 صفًّا)
10. المحتوى التعليمي SSR-visible — ✅ (footer-seo)
11. Rendered/LLM readability يتحسّن — ✅ (footer SSR + Title/Meta أطول وأغنى)
12. Amount of Content يتحسّن بلا حشو — ✅ (فقرة تعليمية/لغة)
13. الحسابات لا تتغيّر — ✅
14. regression 200 — ✅ (22/22)

## تأكيدات
- تقرير ما قبل الدفع — لم يُنفَّذ commit/push. أوقفتُ خوادم الاختبار. صفر تعديل CSS/i18n/routing/أذكار/JSON-LD. لم تُبدأ أيّ صفحة أذكار.

**في انتظار اعتمادك للدفع:** `أعتمد دفع تقرير: MULTILANG-HIJRI-CALENDAR-MONTH-SEO-GEO-CONTENT-FIX-1`
