# تقرير ما قبل الدفع: HIJRI-DATE-DAY-BREADCRUMB-SSR-FILL-CLS-FIX-1

**النوع:** Perf/CLS — SSR-fill breadcrumb + الكتل الداعمة قرب الطيّة في `/hijri-date/YYYY-MM-DD`. **النطاق الموسَّع المعتمَد.** **لم يُنفَّذ commit/push.**
**التحقّق:** متصفح headless (Preview) + `PerformanceObserver('layout-shift',{buffered:true,sources})` + SSR curl (10 لغات + حدود + EN) + SPA/full nav + regression.

## 1) الملفّات المعدَّلة (4 ملفّات، +158/-9)
| الملف | التغيير |
|---|---|
| `server.js` | +135 — كتلة SSR-fill (1.6) داخل `if (_hdGreg)`: قاموس `_HDB` 10 لغات + بناء 5 عناصر: `#hday-breadcrumbs` (5 مستويات) · `#hday-hierarchy` (رابطان) · `#hday-info-grid` (6 بطاقات، فرع non-today) · `#hday-cta` (3 أزرار، prayer→Home) · `#hday-nav` (prev/next مع boundary عبر `_isValidHijriDate`)، كلّها `data-ssr-rendered="1"` |
| `js/app.js` | +24/-9 — 5 حُرّاس no-swap في `loadHijriDayPage()` (نمط `if(el&&ssr==='1'){consume}else if(el){build}`) لـ bc/grid/cta/hier/nav |
| `index.html` | `app.js?v=756 → 757` (موضعان) |
| `sw.js` | `CACHE_VERSION v416 → v417` + PRECACHE `app.js?v=757` |

## 2) العناصر التي تم SSR-fill لها
`#hday-breadcrumbs` (أولوية قصوى، فوق الهيرو) · `#hday-info-grid` · `#hday-hierarchy` · `#hday-cta` · `#hday-nav`. **العناصر الأربعة السابقة (FIX-1) لم تُمَسّ** (تبقى SSR-filled كما هي).

## 3) مقارنة SSR قبل/بعد
| العنصر | قبل (SSR) | بعد (SSR) |
|---|---|---|
| `#hday-breadcrumbs` | `<nav…></nav>` **فارغ** | `<ol class="breadcrumb-list">` 5 مستويات + `data-ssr-rendered="1"` |
| `#hday-hierarchy` | `<div…></div>` **فارغ** | رابطا الشهر/السنة + marker |
| `#hday-info-grid` | **فارغ** | 6 بطاقات (اليوم/الميلادي/الشهر/السنة/عدد الأيام/الترتيب) + marker |
| `#hday-cta` | **فارغ** | 3 أزرار (محوّل/قمر/صلاة→Home) + marker |
| `#hday-nav` | **فارغ** | prev/next مع boundary + marker |

## 4) تأكيد `#hday-breadcrumbs` مملوء من SSR
✅ 10/10 لغات: `5/5` عناصر بـ `data-ssr-rendered="1"`. مثال breadcrumb (AR): `الرئيسية › التقويم الهجري › 1447 هـ › ذو الحجة 1447 هـ › 17 ذو الحجة 1447 هـ`؛ (EN): `Home › Hijri Calendar › 1447 AH › Dhu al-Hijjah 1447 AH › 17 Dhu al-Hijjah 1447 AH`.

## 5) تأكيد العناصر الأربعة السابقة مستقرّة
✅ `#hday-day-num`/`#hday-month`/`#hday-year`/`#hday-subtitle` تبقى SSR-filled و `data-ssr-rendered` يُستهلَك؛ لم تظهر في مصادر الـ shift. (DOM check: dayNum h=74، subtitle h=40، ssr=null.)

## 6) تفاصيل حارس no-swap (app.js)
```js
const bcEl = document.getElementById('hday-breadcrumbs');
if (bcEl && bcEl.getAttribute('data-ssr-rendered') === '1') { bcEl.removeAttribute('data-ssr-rendered'); } // أوّل hydration: تخطّي
else if (bcEl) { /* …البناء الأصلي… */ }                                                                  // SPA-nav: إعادة بناء
```
نفس النمط لـ grid/cta/hier/nav. **SPA/full nav سليم:** التنقّل إلى 1447-12-18 أعاد البناء صحيحًا (breadcrumb=«18 ذو الحجة 1447 هـ»، nav prev=17).

## 7) قياس CLS قبل/بعد (متصفح)
| الحالة | CLS |
|---|---|
| قبل (AUDIT-2) | **0.0393** |
| بعد — cold | **0.0167** |
| بعد — warm | **0.0084** |
- **مصادر الـ shift بعد الإصلاح:** `DIV.section-card` + `SPAN.snb-*` (شريط العدّاد العلويّ الثابت — مكوّن موقعيّ عامّ) **فقط**. **لا أثر** من breadcrumb/info-grid/hierarchy/cta/nav (اختفت من المصادر — معيار #6 محقَّق).

## 8) Title/Meta/H1
✅ دون تغيير — Title «التاريخ الهجري 17 ذو الحجة 1447 هـ | ما يوافقه ميلادياً»؛ H1 `#hday-title` = «17 ذو الحجة 1447 هـ وما يوافقه ميلادياً» (لم تمسّه التذكرة).

## 9) JSON-LD/canonical/hreflang/sitemap
✅ دون تغيير — ld+json=1 (raw SSR)، canonical/hreflang/sitemap بلا مساس (الإصلاح لا يمسّ الـ <head> ولا الـ routing).

## 10) الحسابات دون تغيير
✅ نفس محرّك Umm al-Qura: ذو الحجة 1447 = **29 يومًا** (info-grid «29 يومًا» + «17 من 29»)؛ nav boundary: 1447-01-01 prev=1446-12-29، next=1447-01-02 (صحيح). الميلاديّ 17 ذو الحجة → 3 يونيو 2026.

## 11) SPA navigation
✅ التنقّل بين التواريخ يعيد البناء صحيحًا (full nav إلى 18 → كل العناصر صحيحة، markers مُستهلَكة).

## 12) regression
✅ **20/20 = 200** محليًّا (الرئيسية/en + qibla/moon/msbaha/azkar + hijri-calendar(hub/month/year) + hijri-date(4 عيّنات×langs) + today(ar/en) + zakat + search-test). صفحة today (`htoday-*`) سليمة (لم تتأثّر — معرّفات مختلفة).

## 13) cache-busters
`app.js?v=756 → 757` · `CACHE_VERSION v416 → v417` · PRECACHE 757.

## 14) رسالة commit المقترحة
```
perf(hijri): HIJRI-DATE-DAY-BREADCRUMB-SSR-FILL-CLS-FIX-1 — SSR-fill day breadcrumbs and near-fold blocks to reduce layout shift
```

---

## معايير القبول
1. `#hday-breadcrumbs` غير فارغ في SSR — ✅ (10 لغات)
2. الكتل قرب الطيّة غير فارغة في SSR — ✅ (hierarchy/info-grid/cta/nav)
3. العناصر الأربعة السابقة مستقرّة — ✅ (لم تُمَسّ، لا تتراجع)
4. DOM بعد hydration لا يعيد بناء بصريًّا — ✅ (markers مُستهلَكة، DOM==SSR)
5. CLS ينخفض بوضوح عن 0.0393 — ✅ (cold 0.0167 / warm 0.0084)
6. لا shift من breadcrumb/info-grid/hierarchy/cta/nav — ✅ (اختفت من المصادر)
7. Title/Meta/H1 دون تغيير — ✅
8. JSON-LD/canonical/hreflang/sitemap دون تغيير — ✅
9. الحسابات دون تغيير — ✅
10. SPA navigation يعمل — ✅
11. regression 200 — ✅ (20/20)

## ملاحظة شفّافة
المتبقّي (cold ~0.017) مصدره **شريط العدّاد العلويّ الثابت `snb-*`** (يحدّث المدينة/الوقت بعد hydration) — مكوّن **موقعيّ عامّ** خارج نطاق هذه التذكرة وليس من العناصر الخمسة. مرشَّح لتذكرة مستقلّة (مثل `STICKY-SUBNAV-BAR-HYDRATION-CLS-AUDIT-1`) — لا تُبدأ الآن. كذلك H1-overwrite (نصّيّ) يبقى لتذكرة `HIJRI-DATE-DAY-H1-CLIENT-OVERWRITE-FIX-1` المستقلّة عند الطلب.

## ملاحظة بشأن `#hday-cta`
زرّ «الصلاة» يشير إلى الرئيسية في SSR (لا geo على الخادم)؛ العميل يعيد تخصيصه عند تنقّل SPA لاحق إن عُرفت مدينة — الارتفاع متطابق فلا shift. (على صفحات التاريخ `isGeoToday=false` أصلًا، فالنصّ عامّ.)

## تأكيدات
- تقرير ما قبل الدفع — لم يُنفَّذ commit/push. أوقفتُ خوادم الاختبار. صفر تعديل CSS/i18n/routing/حسابات/Title/Meta/H1/JSON-LD/أذكار. لم تُبدأ أيّ صفحة أذكار.

**في انتظار اعتمادك للدفع:** `أعتمد دفع تقرير: HIJRI-DATE-DAY-BREADCRUMB-SSR-FILL-CLS-FIX-1`
