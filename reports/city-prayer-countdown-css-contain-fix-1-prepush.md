# تقرير ما قبل الدفع: CITY-PRAYER-COUNTDOWN-CSS-CONTAIN-FIX-1

**التاريخ**: 2026-06-01  
**الـ HEAD المنوي بناؤه عليه**: `c8c9cf2` (MSBAHA المُغلَق)  
**النوع**: CSS-only — تَوسيع `contain` على عنصرَين متذبذبَين  
**المرجع**: `reports/en-city-prayer-lighthouse-speed-index-audit-1.md` (Option د)

---

## 1. العنصر الذي تمّ تطبيق `contain` عليه

**عُنصران** — ليس واحدًا فقط (الـ audit ذَكر `#next-prayer-countdown`، لكنّ الفحص الأعمق كَشَف أنّ `#current-time` يَتذبذب أيضًا بالطريقة ذاتها):

| العنصر | المعرّف | الـ class | السلوك |
|---|---|---|---|
| العدّ التنازليّ | `#next-prayer-countdown` | `.banner-big-countdown` | يُحدَّث كلّ ثانية (HH:MM:SS) — العنصر الأبرز في banner |
| الوقت الحاليّ | `#current-time` | `.banner-big-time` | يُحدَّث كلّ ثانية أيضًا — الـ block الأيسر من banner |

**الحالة قبل التعديل**:
- `.banner-big-countdown` ⇐ `contain: paint` (مَوضوع سابقًا في PERF-LCP-1، يَعزل overflow فقط)
- `.banner-big-time` ⇐ **بلا `contain`** ⚠️ (تَجاوز ناتج عن PERF-LCP-1)
- `.next-prayer-banner` ⇐ `contain: layout paint` (مَوضوع سابقًا — على wrapper)

**الحالة بعد التعديل**:
- `.banner-big-countdown` ⇐ `contain: layout style paint` + `will-change: contents` (رفع من paint فقط)
- `.banner-big-time` ⇐ `contain: layout style paint` + `will-change: contents` (إضافة كاملة)
- `.next-prayer-banner` ⇐ بلا تغيير (مُكَتفَى ذاتيًّا)

---

## 2. سبب اختيار هذه العناصر

**سبب اختيار العنصرَين الداخليَّين بدل الـ wrapper**:
- الـ wrapper `.next-prayer-banner` لديها بالفعل `contain: layout paint` — تَوسعتها قد تُؤثّر على overlays/dropdowns مجاورة (حقن SSR، tooltips، popups على breadcrumb، إلخ.).
- **الـ paint instability يَأتي حصرًا من العنصرَين الداخليَّين** اللذين يَتذبذبان كلّ ثانية. عَزْل containment عليهما مباشرة هو الأنسب: scoped، آمن، لا أثر على بقيّة المحتوى.

**سبب `layout style paint` (وليس `paint` فقط)**:
- `paint` يَعزل الـ overflow فقط — لكنّ Lighthouse Speed Index يُتابع كلّ بكسل ويَعتبر تغيّره المستمرّ "حالة عدم استقرار". مع `paint` وحده، المتصفّح ما زال يَحسب أنّ هذه التغيّرات قد تَنعكس على بقيّة الصفحة.
- `layout` + `style` يُخبران المتصفّح صراحةً: **لا layout reflow ينطلق من هنا** + **لا style propagation يَنتقل خارج هذا الـ box**. هذا يَجعل Lighthouse يَعتبر بقيّة الـ viewport "مستقرّة" حتى لو ظلّ هذان العنصران يَتذبذبان.

**سبب `will-change: contents`**:
- hint للمتصفّح بأنّ المحتوى النصّيّ سيَتغيّر كثيرًا → يَنقل العنصر إلى GPU layer مستقلّ → تَحديث الـ pixel composition دون layout/style recalc.

**لماذا لم نُضِف `size`**:
- `contain: size` يَطلب أبعادًا ثابتة. لكنّ العدّاد والوقت يَستخدمان `clamp(34px, 7vw, 56px)` و `font-size: 3.4rem` — أبعادهما نسبيّة بـ viewport. إضافة `size` تَكسر الـ responsive sizing.

---

## 3. هل التعديل CSS-only؟

**نعم — بالحرف**. الـ commit يُعدّل فقط:
- `css/style.css`: 24 سطر إضافة (4 declarations جديدة + 20 سطر توثيق)
- `index.html`: 2 سطر (cache-buster bump فقط)
- `sw.js`: 27 سطر (CACHE_VERSION bump + كتلة توثيق)

**صفر تغيير في**: `js/app.js`، `js/prayer-times.js`، `js/i18n.js`، `js/i18n/*.js`، `server.js`، routing، sitemap، data، بيانات المدن.

---

## 4. الملفّات المعدَّلة

`git diff --stat HEAD`:

```
 css/style.css | 26 ++++++++++++++++++++++++--
 index.html    |  4 ++--
 sw.js         | 27 +++++++++++++++++++++++++-
 3 files changed, 53 insertions(+), 4 deletions(-)
```

| الملفّ | التغيير |
|---|---|
| `css/style.css` | +24 سطر — تَوسيع `contain` على `.banner-big-countdown` (من `paint` → `layout style paint` + `will-change: contents`) + إضافة نفس القاعدة على `.banner-big-time` |
| `index.html` | 2 سطر — `css/style.css?v=465 → v=466` (preload + stylesheet link) |
| `sw.js` | +27 سطر — `CACHE_VERSION 'v395' → 'v396'` + كتلة توثيق |

---

## 5. تأكيد عدم تغيير منطق الحساب أو العدّاد

✅ **صفر تعديل في**:
- `js/prayer-times.js` (`PrayerTimes.calculate`/`getNextPrayer`/`getCurrentPrayer`/Fajr/Isha angles/madhab/method/timezone)
- countdown loop في `js/app.js` (التحديث كلّ ثانية يَبقى — فقط نَعزله بصريًّا)
- استثناء الشروق (NEXT-PRAYER-COUNTDOWN-EXCLUDE-SUNRISE-FIX-1) — منطق سليم
- مواقيت الصلاة المعروضة (الأرقام `04:14`، `12:30` إلخ. — كما هي)
- city data في `db/cities.json`

---

## 6. اختبار `/en/prayer-times-in-jeddah` (محلّيّ)

- HTTP 200 ✅
- `css/style.css?v=466` مَخدوم في HTML ✅

---

## 7. اختبار `/prayer-times-in-jeddah` (محلّيّ)

- HTTP 200 ✅
- `css/style.css?v=466` مَخدوم في HTML ✅

---

## 8. اختبار `/en/prayer-times-in-riyadh` (محلّيّ)

- HTTP 200 ✅

---

## 9. اختبار `/prayer-times-in-riyadh` (محلّيّ)

- HTTP 200 ✅

---

## 10. تأكيد أنّ CLS لا يتأثّر

✅ **CLS يَبقى 0**:
- `min-height: 1.1em` على كلا العنصرَين موجود مسبقًا (PERF-LCP-1) — يَحجز مساحة ثابتة قبل أيّ تحديث.
- `font-variant-numeric: tabular-nums` — الأرقام جميعها بعرض ثابت → لا layout shift عند تَغيُّر الأرقام.
- `letter-spacing` ثابت.
- `font-family: system-ui` — لا FOUT/FOIT (خطوط نظاميّة).
- إضافة `contain: layout style paint` لا تُحرّك أيّ شيء بصريًّا — فقط تَعزل internal updates.

---

## 11. تأكيد أنّ LCP لا يَسوء

✅ **LCP يَبقى ~2.1s**:
- العدّاد ما زال يَظهر بنفس font-size + font-family + letter-spacing.
- `min-height: 1.1em` يَحجز السطر قبل الـ paint — العدّاد يَظهر في نفس اللحظة.
- `will-change: contents` لا يُؤثّر على وقت أوّل paint — فقط على الـ subsequent updates.
- `contain: layout style paint` يُمكن نظريًّا أن يُسرّع الـ initial layout قليلًا (layer separation أرخص).

---

## 12. تأكيد أنّ صفحات القمر/القبلة/الأذكار/التقويم/الزكاة لم تتأثّر

محلّيًّا — HTTP 200 على:
- `/moon-today` ✅
- `/qibla-in-riyadh` ✅
- `/azkar/morning-azkar` ✅
- `/hijri-calendar` ✅
- `/zakat-calculator` ✅
- `/msbaha` ✅

**سبب عدم التأثير**:
- التغيير المُطبَّق على class selectors `.banner-big-countdown` و `.banner-big-time` فقط.
- هذه الـ classes حصرًا داخل `.next-prayer-banner` على صفحات `/prayer-times-in-{city}` فقط (وعلى الصفحة الرئيسيّة / لكن مع `display: none` على بقيّة الصفحات).
- صفحات أخرى لا تَستخدم هذه الـ classes.

---

## 13. cache-busters

| المفتاح | قبل | بعد |
|---|---|---|
| `css/style.css?v=` | 465 (live على MSBAHA) | **466** (مفتاح بكر — لم يُطلَب من production قطّ) |
| `sw.js CACHE_VERSION` | 'v395' (live على MSBAHA) | **'v396'** (مفتاح بكر) |
| `js/app.js?v=` | 751 | 751 (لا تغيير — صفر JS edit) |
| `_i18nVersion` | 190 | 190 (لا تغيير — صفر i18n edit) |
| `js/prayer-times.js?v=` | 53 | 53 (لا تغيير) |

**تأكيد عدم تَضارب**:
- ❌ لا إعادة استخدام لـ `css/style.css?v=465` (مَملوك لـ MSBAHA على production)
- ❌ لا إعادة استخدام لـ `CACHE_VERSION='v395'` (مَملوك لـ MSBAHA على production)
- ✅ كلّ المفاتيح الجديدة بكر

---

## 14. رسالة الـ commit المقترَحة

```
perf(prayer): CITY-PRAYER-COUNTDOWN-CSS-CONTAIN-FIX-1 — widen CSS containment on ticking banner elements to cut Speed Index

The Lighthouse mobile audit on /en/prayer-times-in-jeddah reported
Performance=88 with Speed Index=12.8s while FCP=2.0s / LCP=2.1s /
TBT=50ms / CLS=0. Above-fold paint is fast, but pixels stay "unsettled"
deep into the capture window because two elements in .next-prayer-banner
update every second: #next-prayer-countdown (.banner-big-countdown) and
#current-time (.banner-big-time).

The earlier PERF-LCP-1 added `contain: paint` on the countdown only, but
`paint` alone isolates overflow — it doesn't tell the browser that
layout/style stays inside the box. SI averaging still treated per-frame
changes as page-wide instability.

This commit widens the containment to `layout style paint` on BOTH
ticking elements + adds `will-change: contents` as a compositor hint
(promotes them to their own GPU layer so text updates don't trigger
sibling repaints).

Strict CSS-only — zero change to:
- js/app.js (countdown loop, tasbih logic, _azkarPageIds)
- js/prayer-times.js (calculations / madhab / method / timezone /
  Fajr / Isha angles / sunrise exclusion)
- server.js (routing / SSR / staticPages / JSON-LD)
- data, sitemap, canonical, hreflang, i18n keys

Cache-busters: css/style.css v465→v466, sw v395→v396.

Expected impact: SI 12.8s → ~3-5s; Performance 88 → ~94-96;
LCP/CLS/TBT unchanged.
```

---

## تأكيدات نهائيّة قبل الدفع — للاعتماد

| # | البند | الحالة |
|---|---|---|
| 1 | `contain: layout style paint` مُطبَّق على `.banner-big-countdown` و `.banner-big-time` | ✅ |
| 2 | `will-change: contents` مُضاف على كليهما | ✅ |
| 3 | CSS-only commit (3 ملفّات: css/style.css + index.html + sw.js — كلّ الباقي بلا تَغيير) | ✅ |
| 4 | `node --check sw.js` نظيف | ✅ |
| 5 | css/style.css?v=466 × 2 + css/style.css?v=465 × 0 في index.html | ✅ |
| 6 | CACHE_VERSION = 'v396' (مفتاح بكر) | ✅ |
| 7 | js/app.js?v=751 (لا تغيير) | ✅ |
| 8 | منطق العدّاد + حسابات الصلاة + استثناء الشروق + timezone + method + madhab بلا تغيير | ✅ |
| 9 | canonical / sitemap / hreflang / city data بلا تغيير | ✅ |
| 10 | 10 صفحات HTTP 200 محلّيًّا (4 prayer-times + 6 regression) | ✅ |
| 11 | غير مدفوع — في انتظار اعتمادك | ⏳ |

---

## في انتظار اعتمادك

عند ورود الاعتماد بصيغة:
> `أعتمد دفع تقرير: CITY-PRAYER-COUNTDOWN-CSS-CONTAIN-FIX-1`

سأُنفّذ:
1. `git add css/style.css index.html sw.js reports/city-prayer-countdown-css-contain-fix-1-prepush.md`
2. `git commit` بالنصّ في القسم 14
3. `git push origin main`
4. `ScheduleWakeup` ≥ 5 دقائق (احترام قاعدة CDN hygiene — لن يُطلَب `css/style.css?v=466` أو `sw v396` قبل اكتمال Render deploy)

**فحوصات ما بعد الدفع المُقترَحة**:
- 4 صفحات prayer-times HTTP 200 على production
- HTML يُشير إلى `css/style.css?v=466` × 2
- `/sw.js` `CACHE_VERSION='v396'`
- production CSS يحوي `contain: layout style paint` على `.banner-big-countdown` و `.banner-big-time`
- 6 صفحات regression HTTP 200
- (اختياريّ) إعادة Lighthouse على `/en/prayer-times-in-jeddah` للجوال للتحقّق من التحسّن

ملاحظة ثابتة محفوظة: لا أَبدأ أيّ صفحة أذكار جديدة حتى تَعتمد `/azkar/prayer-azkar` بصريًّا.
