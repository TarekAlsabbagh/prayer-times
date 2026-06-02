# تقرير ما قبل الدفع: HIJRI-CALENDAR-MONTH-SSR-FILL-LOAD-DELAY-FIX-1

**النوع:** Perf/CLS — SSR-fill month breadcrumbs **+ subtitle final text** (النطاق المُوسَّع المعتمَد). **لم يُنفَّذ commit/push.**
**التحقّق:** متصفح headless (Preview) + `PerformanceObserver('layout-shift', {buffered:true})` + SSR curl (10 لغات).

## 1) الملفّات المعدَّلة (4 ملفّات، +106/-14)
| الملف | التغيير |
|---|---|
| `server.js` | +71 — replacement #7 (SSR-fill `#hmonth-breadcrumbs` + `data-ssr-rendered="1"`) + replacement #8 (SSR-fill `#hmonth-subtitle` بالنصّ الوصفيّ `_HM_SUBDESC` 10 لغات + `data-ssr-rendered="1"`) داخل كتلة `_isHijriMonthHub` |
| `js/app.js` | +41 — حارسا no-swap في `loadHijriMonthPage()` لـ breadcrumb + subtitle (نمط `data-ssr-rendered` يُستهلَك مرّة واحدة) |
| `index.html` | `app.js?v=754 → 755` (موضعان) |
| `sw.js` | `CACHE_VERSION v414 → v415` + PRECACHE `app.js?v=755` |

## 2) مكان SSR-fill
`server.js` ~15240+ (داخل `if (_hmTotalDays > 0)`): replacement #7 (breadcrumb) + #8 (subtitle). 9 مواضع `data-ssr-rendered` (SSR + guards).

## 3) بنية قبل/بعد
| العنصر | قبل (SSR) | بعد (SSR) |
|---|---|---|
| `#hmonth-breadcrumbs` | `<nav …></nav>` **فارغ** | `<nav … data-ssr-rendered="1"><ol class="breadcrumb-list">…4 crumbs…</ol></nav>` |
| `#hmonth-subtitle` | `30 days • range` (مختصر) — ثم يدهسه العميل بالوصفيّ | `Covers {gFirst} to {gLast} per the Umm al-Qura calendar` (الوصفيّ النهائيّ) + `data-ssr-rendered="1"` |

## 4) تأكيد العناصر لم تَعُد فارغة/مختصرة
✅ 10/10 لغات: breadcrumb = `breadcrumb-list` بـ 4 crumbs (Home › Hijri Calendar › {year}{sfx} › {month} {year}{sfx})؛ subtitle = النصّ الوصفيّ بصيغة تاريخ العميل «day month year».

## 5) قياس height/top قبل/بعد hydration (CLS)
| الحالة | CLS | ملاحظة |
|---|---|---|
| قبل الإصلاح | **0.0545** | subtitle ينمو +25px (dH=+25) + breadcrumb يُملأ |
| بعد الإصلاح (EN warm) | **0** | لا shift |
| بعد الإصلاح (EN/AR cold) | **~0.034** | **subtitle لم يَعُد ينمو (dH=0)** + breadcrumb SSR-filled |
- **العنصران المُستهدَفان (breadcrumb + subtitle) لم يَعُودا يُسبّبان نموًّا** (subtitle dH=+25→0). الانخفاض واضح (criterion #8).
- **المتبقّي ~0.034 (cold) ليس من العنصرين المُصلَحين**: القياس يُظهر `subMarker="1"` (أي `loadHijriMonthPage` لم يَعمل بعد) وكل العناصر تنزل +34px بانتظام أثناء أوّل رسم → **reflow أوّليّ منفصل (font/resource cold-load)**، مرشَّح لتذكرة Option-D/E مستقلّة. (صفحة السنة CLS=0.0001، فالمتبقّي خاصّ بأوّل-رسم الشهر لا بالعنصرين.)

## 6) هل تم تعديل app.js؟ ولماذا
نعم — حارسا no-swap ضروريّان: عند أوّل hydration يُستهلَك `data-ssr-rendered` (يُزال) ويُتخطّى إعادة الكتابة → لا shift؛ وعند تنقّل SPA لاحق (لا marker) يُعاد البناء طبيعيًّا → لا staleness.

## 7) هل تم تعديل CSS؟
**لا** — صفر تعديل CSS (الحلّ SSR-fill، ليس height-reservation).

## 8) تفاصيل حارس no-swap
```js
// breadcrumb + subtitle (نفس النمط):
if (el.getAttribute('data-ssr-rendered') === '1') { el.removeAttribute('data-ssr-rendered'); /* skip */ }
else { /* rebuild as before */ }
```

## 9) Title/Meta/H1
✅ لم تتغيّر — Title 37 (EN month)، H1 «Dhu al-Hijjah 1447 AH Hijri Calendar» ثابت، Meta غير متأثّر (metaCount=1).

## 10) JSON-LD/canonical/hreflang/sitemap + الحسابات
✅ jsonld=1 (raw)، hreflang=11، canonical ثابت، sitemap بلا تعديل. الجدول 29 صفًّا، info-grid 3 بطاقات، الحسابات دون مساس.

## 11) كل اللغات العشر سليمة
✅ breadcrumb + subtitle SSR-filled، rows=29، info=3 على الـ10.

## 12) regression
**17/17 = 200** (محليًّا): الرئيسية + en + prayer/qibla/moon/msbaha/azkar + month(ar/en) + year(ar/en) + day(ar/en) + today(ar/en).

## 13) cache-busters
`app.js?v=754 → 755` · `CACHE_VERSION v414 → v415` · PRECACHE 755.

## 14) رسالة commit المقترحة
```
perf(hijri): HIJRI-CALENDAR-MONTH-SSR-FILL-LOAD-DELAY-FIX-1 — SSR-fill month breadcrumbs and subtitle to prevent layout shift
```

---

## معايير القبول
1. `#hmonth-breadcrumbs` SSR-filled — ✅ (10 لغات)
2. `#hmonth-subtitle` SSR-final-text — ✅ (الوصفيّ، 10 لغات)
3. لا text-swap بعد hydration (حارس + dH=0) — ✅
4. `loadHijriMonthPage` لا يعيد الكتابة إن SSR-filled — ✅ (data-ssr-rendered)
5. DOM == SSR للعنصرين — ✅
6. CLS انخفض بوضوح (0.0545 → 0 warm / 0.034 cold) — ✅ (⚠️ المتبقّي cold من reflow أوّليّ منفصل، مُوثَّق)
7. جدول الشهر 29 — ✅
8. info-grid 3 — ✅
9. intro/H1/Title/Meta — ✅ دون تغيير
10. الحسابات/JSON-LD/canonical/hreflang/sitemap — ✅ دون تغيير
11. الـ10 لغات سليمة — ✅
12. regression 200 — ✅ (17/17)

## ملاحظة شفّافة
المتبقّي ~0.034 (cold-load) **ليس من breadcrumb/subtitle** (كلاهما dH=0 الآن)؛ يبدو reflow أوّل-رسم (font/resource) خاصّ بصفحة الشهر. أوصي — إن أبقى Lighthouse على CLS — بفتح **`HIJRI-CALENDAR-MONTH-INITIAL-PAINT-REFLOW-FIX-1`** (Option D/E) منفصلة بعد قياس Lighthouse على الإنتاج.

## تأكيدات
- تقرير ما قبل الدفع — لم يُنفَّذ commit/push. أوقفتُ خوادم الاختبار. لم تُبدأ صفحات أذكار.

**في انتظار اعتمادك للدفع:** `أعتمد دفع تقرير: HIJRI-CALENDAR-MONTH-SSR-FILL-LOAD-DELAY-FIX-1`
