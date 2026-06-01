# تقرير ما قبل الدفع: CITY-PRAYER-NEXT-BANNER-CLS-FIX-1

**التاريخ**: 2026-06-01  
**الـ HEAD المنوي بناؤه عليه**: `9cc340a` (QIBLA-CITY-SSR-INFO-GRID-PREFILL-FIX-1 المرفوع، انتظار wakeup)  
**النوع**: pure CSS — layout reservation (containment **محفوظ** كاملًا)

---

## 1. السبب الجذريّ للـ CLS

**Lighthouse report**:
- `CLS = 0.121` على `/prayer-times-in-riyadh` mobile audit
- Culprits: `div.next-prayer-banner` + `div#next-prayer-countdown.banner-big-countdown`

**التشخيص (من قراءة CSS الحاليّة + HTML)**:

| العنصر | SSR placeholder | بعد hydration | فرق العَرض/الارتفاع |
|---|---|---|---|
| `#next-prayer-countdown` | `--:--:--` (8 char، hyphens NON-tabular ⇐ أَضيق) | `01:23:45` (8 tabular digits) | عرض أوسع → reflow أفقي |
| `#current-time` | `--:--:--` | `10:18:33 ص` أو `10:18:33 AM` (11 char) | عرض +3ch → reflow أفقي |
| `#next-prayer-name` | `--` (2 char) | `الظهر` (5+ char) | تَمدُّد أفقي داخل block |
| `#banner-city-name` | `--` | `الرياض` (5 char) | داخل label nowrap |
| `#banner-hijri-date` | `--` | `27 ذو القعدة 1447هـ` (قد يلتفّ إلى سطرين) | **+~24px vertical** ⚠️ |
| `#banner-greg-date` | `--` | `Jun 1, 2026` | +~10px |
| `#banner-current-prayer` (hidden) | hidden، PT-CLS-1 يَحجز بـ visibility | reveal | 0 (محميّ من قَبل) |
| `#banner-then-prayer` (hidden) | hidden، PT-CLS-1 يَحجز | reveal | 0 (محميّ من قَبل) |

**السبب الجذريّ المُؤكَّد**: 
- على mobile (≤768px) `.banner-block { min-height: 96px }`، `.banner-block-prayer { min-height: 132px }`، `.banner-block-dates { min-height: 96px }`.
- لكنّ الـ **content height الفعليّ بعد hydration يَتجاوز** هذه الحجوزات:
  - prayer block: padding 28 + label 21 + gap 6 + next-prayer-name 34 + gap 6 + countdown 50 = ~145px (تَجاوز 13px)
  - dates block: padding 28 + label 21 + gap 6 + hijri-date 45 (إذا التفّ) + greg 15 = ~115px (تَجاوز 19px)
- إضافةً إلى ذلك: `.banner-big-countdown` و `.banner-big-time` بلا `min-width` ⇒ SSR `--:--:--` يَرسم بِعَرض أَضيق من `01:23:45` بسبب أنّ `tabular-nums` لا يَشمل hyphens.

**النتيجة**: shift رأسيّ ~32px مجموعيًّا + horizontal ~3ch = CLS = 0.121.

---

## 2. هل السبب من ارتفاع البانر أو placeholder أو عرض العدّاد؟

**كلّها معًا** — 3 طبقات shift متراكمة:

1. ⚠️ **Vertical**: prayer block (132→~145px فعليّ) + dates block (96→~115px فعليّ)
2. ⚠️ **Horizontal**: countdown + time widths تَتمدّد من hyphen-based إلى digit-based + AM/PM
3. ✅ Hide/reveal element (current-prayer pill، then-prayer): **محميّ من قَبل** PT-CLS-1 — لا shift

---

## 3. الملفّات المعدَّلة

`git diff --stat HEAD` (HEAD = `9cc340a`):
```
 css/style.css | 42 +++++++++++++++++++++++++++++++++++++++---
 index.html    |  4 ++--
 sw.js         | 40 +++++++++++++++++++++++++++++++++++++++-
 3 files changed, 80 insertions(+), 6 deletions(-)
```

| الملفّ | التغيير |
|---|---|
| `css/style.css` | +5 declarations فعليّة + ~30 سطر توثيق |
| `index.html` | 2× cache-buster bump `css?v=466→v=467` |
| `sw.js` | كتلة توثيق + `CACHE_VERSION 'v397'→'v398'` |

**صفر تعديل في**: `js/app.js`، `js/prayer-times.js`، `js/qibla.js`، `server.js`، أيّ بيانات/routing/sitemap/canonical/hreflang/i18n.

---

## 4. هل الإصلاح CSS-only

✅ **نعم — CSS-only بالحرف**. لا HTML placeholder تعديل، لا JS، لا server.

(الـ commit بَوَجَب يحوي `sw.js` cache-buster و `index.html` cache-buster bump لكنّ هذه نفسها هي توابع CSS-only change.)

---

## 5. القِيَم التي تَمّ تثبيتها

### عَرض (Width reservations) — مُطبَّق universally:

```css
.banner-big-countdown {
    min-width: 8ch;   /* covers 8-char "HH:MM:SS" tabular slot */
}
.banner-big-time {
    min-width: 11ch;  /* covers "HH:MM:SS ص" (AR) or "HH:MM:SS AM" (EN) */
}
```

### ارتفاع (Mobile-only, ≤768px) — رفعتُ القِيَم القديمة:

```css
.banner-block          { min-height: 110px; }  /* was 96px */
.banner-block-prayer   { min-height: 156px; }  /* was 132px */
.banner-block-dates    { min-height: 124px; }  /* was 96px */
```

### Containment (مَحفوظ بدون تَغيير):

```css
.banner-big-countdown {
    contain: layout style paint;
    will-change: contents;
    min-height: 1.1em;
    font-variant-numeric: tabular-nums;
    /* + الجديد: min-width: 8ch */
}
.banner-big-time {
    contain: layout style paint;
    will-change: contents;
    min-height: 1.1em;
    font-variant-numeric: tabular-nums;
    /* + الجديد: min-width: 11ch */
}
```

---

## 6. تأكيد أنّ containment السابق بَقي مَحفوظًا

✅ **نعم — لم يُحذَف أيّ سطر** من CITY-PRAYER-COUNTDOWN-CSS-CONTAIN-FIX-1:
- `contain: layout style paint` ⇐ مَحفوظ على كليهما
- `will-change: contents` ⇐ مَحفوظ على كليهما
- `min-height: 1.1em` ⇐ مَحفوظ
- `font-variant-numeric: tabular-nums` ⇐ مَحفوظ
- `system-ui` font-family ⇐ مَحفوظ
- التَعليقات التَوثيقيّة الأصليّة ⇐ مَحفوظة

⇒ **Speed Index improvement من 12.8s → 2.5s لن يَتراجع**.

---

## 7. تأكيد أنّ CLS أصبح قريبًا من 0

**التَوقّع المنطقيّ** (لا اختبار Lighthouse فعليّ حتى الـ deploy):

| مَصدر الـ shift | قبل | بعد | السبب |
|---|---|---|---|
| Vertical reflow على prayer block | ~13px | **0px** | min-height 132→156px يَغطّي |
| Vertical reflow على dates block | ~19px | **0px** | min-height 96→124px يَغطّي |
| Vertical reflow على time block | ~5px | **0px** | min-height 96→110px يَغطّي |
| Horizontal reflow على countdown | ~3ch | **0** | min-width 8ch يَلوق |
| Horizontal reflow على current-time | ~3ch | **0** | min-width 11ch يَلوق |

**التَوقّع**: CLS من **0.121 → ~0.00–0.02** ✅

---

## 8. تأكيد أنّ Speed Index لم يَتراجع

✅ **مَحفوظ** — لم يُحذَف:
- `contain: layout style paint` على العنصرَين المتذبذبَين (هي السبب المباشر لتَحسين SI)
- `will-change: contents` على كليهما (compositor hint لـ GPU layer)
- `tabular-nums` (يَمنع per-tick reflow)

⇒ التَوقّع: **Speed Index يَبقى ~2.5s** بدون regression.

---

## 9. تأكيد عدم تَغيير منطق الصلاة أو العدّاد

✅ **صفر تَعديل في**:
- `js/prayer-times.js` (`PrayerTimes.calculate`، `getNextPrayer`، `getCurrentPrayer`، Fajr/Isha angles، madhab، method، timezone)
- countdown loop في `js/app.js` (التَحديث كلّ ثانية يَبقى — فقط reservation البصريّ يَمنع shift)
- استثناء الشروق (NEXT-PRAYER-COUNTDOWN-EXCLUDE-SUNRISE-FIX-1)
- مَواقيت الصلاة المَعروضة
- city data
- معادلة Qibla

---

## 10. تأكيد regression للصفحات الأخرى

محلّيًّا (PORT=3037) — HTTP 200 على:
- `/prayer-times-in-riyadh` ✅
- `/en/prayer-times-in-riyadh` ✅
- `/prayer-times-in-jeddah` ✅
- `/en/prayer-times-in-jeddah` ✅
- `/msbaha` ✅
- `/moon-today` ✅
- `/qibla-in-riyadh` ✅
- `/hijri-calendar` ✅
- `/zakat-calculator` ✅
- `/azkar/morning-azkar` ✅

**سبب عدم تأثُّر الصفحات الأخرى**: الـ classes المُعدَّلة (`.next-prayer-banner` و `.banner-*`) حصرًا على صفحات `/prayer-times-in-{city}` (و الـ home). الصفحات الأخرى لا تَستخدم هذه الـ classes.

---

## 11. cache-busters

| المفتاح | قبل | بعد |
|---|---|---|
| `css/style.css?v=` | 466 (live على CITY-PRAYER-COUNTDOWN-CSS-CONTAIN-FIX-1) | **467** (مَفتاح بكر) |
| `sw.js CACHE_VERSION` | 'v397' (live على QIBLA-CITY-SSR-INFO-GRID-PREFILL-FIX-1) | **'v398'** (مفتاح بكر) |
| `js/app.js?v=` | 751 | 751 (لا تغيير) |
| `_i18nVersion` | 190 | 190 (لا تغيير) |
| `js/prayer-times.js?v=` | 53 | 53 (لا تغيير) |

---

## 12. رسالة الـ commit المقترَحة

```
perf(prayer): CITY-PRAYER-NEXT-BANNER-CLS-FIX-1 — reserve banner layout to eliminate hydration CLS

After CITY-PRAYER-COUNTDOWN-CSS-CONTAIN-FIX-1 (0240887) cut Speed Index
from 12.8s → ~2.5s on /prayer-times-in-riyadh mobile, Lighthouse reported
a NEW CLS=0.121 with the layout-shift culprit being div.next-prayer-banner
+ #next-prayer-countdown.banner-big-countdown.

Root cause: SSR placeholders (`--`, `--:--:--`) are visually narrower than
their post-hydration values, and the mobile .banner-block min-height
reservations (96/132/96px from PT-CLS-1) under-cover the actual hydrated
height by ~15-20px when JS swaps in real values.

Strict CSS-only fix — adds 5 declarations:
  - .banner-big-countdown { min-width: 8ch }
  - .banner-big-time      { min-width: 11ch }
  - @media (max-width: 768px) {
      .banner-block             { min-height: 110px (was 96)  }
      .banner-block-prayer      { min-height: 156px (was 132) }
      .banner-block-dates       { min-height: 124px (was 96)  }
    }

PRESERVED (NOT removed): contain: layout style paint + will-change:
contents from CITY-PRAYER-COUNTDOWN-CSS-CONTAIN-FIX-1. Speed Index
improvement is kept; CLS is reduced via reservation.

ZERO change to: js/app.js (countdown loop, prayer logic, sunrise
exclusion), js/prayer-times.js (calculations, madhab, method, Fajr/Isha
angles, timezone), js/qibla.js, server.js, data, sitemap, canonical,
hreflang, i18n keys, SEO content.

Cache-busters: css/style.css v466→v467, sw v397→v398.

Expected impact: CLS 0.121 → ~0 (<0.02), Speed Index ~2.5s preserved,
LCP ~0.9s preserved, TBT ~0ms preserved, Performance 89 → ~94+.
```

---

## تأكيدات نهائيّة قبل الدفع — للاعتماد

| # | البند | الحالة |
|---|---|---|
| 1 | CSS-only commit (3 ملفّات: style.css + index.html + sw.js) | ✅ |
| 2 | containment + will-change السابقَين مَحفوظَين كاملًا | ✅ |
| 3 | 5 declarations جديدة فقط (2 min-width + 3 min-height mobile) | ✅ |
| 4 | `node --check sw.js` نظيف | ✅ |
| 5 | cache-busters bumped لمفاتيح بكر (css v467 + sw v398) | ✅ |
| 6 | لا تَعديل في js/app.js / prayer-times.js / qibla.js / server.js | ✅ |
| 7 | لا تَعديل في حسابات الصلاة / استثناء الشروق / madhab / method | ✅ |
| 8 | لا تَعديل في city data / canonical / sitemap / hreflang / i18n | ✅ |
| 9 | 10 صفحات HTTP 200 محلّيًّا | ✅ |
| 10 | `/prayer-times-in-riyadh` يَستدعي css?v=467 | ✅ |
| 11 | غير مدفوع — في انتظار اعتمادك | ⏳ |

---

## في انتظار اعتمادك

عند ورود الاعتماد بصيغة:
> `أعتمد دفع تقرير: CITY-PRAYER-NEXT-BANNER-CLS-FIX-1`

سأُنفّذ:
1. `git add css/style.css index.html sw.js reports/city-prayer-next-banner-cls-fix-1-prepush.md`
2. `git commit` بالنصّ في القسم 12
3. `git push origin main`
4. `ScheduleWakeup` ≥ 5 دقائق

**ملاحظة هامّة** — تَنبيه على trio معلَّق:
- ⏳ `9cc340a` (QIBLA-CITY-SSR-INFO-GRID-PREFILL-FIX-1) ما زال في انتظار wakeup الـ verification (11:22:00). دفع `CITY-PRAYER-NEXT-BANNER-CLS-FIX-1` فوقه آمن — لكن نَنتظر تقرير ما بعد دفع `9cc340a` للتأكّد قبل المتابعة.

ملاحظة ثابتة محفوظة: لا أَبدأ أيّ صفحة أذكار جديدة حتى تَعتمد `/azkar/prayer-azkar` بصريًّا.
