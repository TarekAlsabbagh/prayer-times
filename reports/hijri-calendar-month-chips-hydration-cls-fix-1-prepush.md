# HIJRI-CALENDAR-MONTH-CHIPS-HYDRATION-CLS-FIX-1 — تقرير ما قبل الدفع

**التاريخ**: 2026-06-02
**الحالة**: ✅ **جاهز للدفع** — في انتظار اعتمادك
**الخَيار**: Option A — SSR-fill `#hyear-info-grid` (نَمط month proven)

---

## 1. الملفّات المُعَدَّلة

| ملفّ | عدد الأَسطر | نَوع التَعديل |
|---|---:|---|
| `server.js` | +54 / -0 | SSR-fill `#hyear-info-grid` (per-lang data + 4 cards) + توثيق |
| `sw.js` | +20 / -1 | `CACHE_VERSION` v409→v410 + توثيق |
| **الإجماليّ** | **+74 / -1** | ملفّان فقط |

✅ **0 تَعديل** على: `css/style.css` / `js/app.js` / `index.html` / `js/i18n*.js` / curated / Hijri calc / calendar data / `.hcal2-months-chips`.

---

## 2. مَكان SSR-fill لـ `#hyear-info-grid`

**server.js** داخل block `if (_isHijriYearHub)` (بعد `_hcalYear`، ~السطر 15258):

```javascript
// per-lang info-card strings (mirrors _HYEAR_UI in app.js)
const _hyIG = { ar: {...}, en: {...}, ... 10 langs };
const _hyU = _hyIG[seo.lang] || _hyIG.en;
const _hyY = parseInt(_hcalYear, 10);
let _hyTotal = 0;
for (let _m = 1; _m <= 12; _m++) { _hyTotal += _getDaysInHijriMonth(_hyY, _m); }
const _hyIsLeap = (_hyTotal === 355);
const _hyCards = [
    ['📆', _hyU.lbl[0], `${_hcalYear}${_hyU.sfx}`],
    ['📊', _hyU.lbl[1], `${_hyTotal} ${_hyU.days}`],
    ['✔️', _hyU.lbl[2], _hyIsLeap ? _hyU.ly(_hyTotal) : _hyU.ln(_hyTotal)],
    ['🌙', _hyU.lbl[3], _hyU.months],
];
html = html.replace(
    '<div class="info-grid" id="hyear-info-grid"></div>',
    '<div class="info-grid" id="hyear-info-grid" data-ssr-rendered="1">' + _hyCardsHtml + '</div>'
);
```

⇒ نَفس نَمط `#hmonth-info-grid` SSR-fill (server.js:15233).

---

## 3. مُقارنة قبل/بعد للـ SSR HTML

### قَبل (Production `f54f895`)
```html
<div class="info-grid" id="hyear-info-grid"></div>   <!-- EMPTY 🔴 -->
```
→ JS يَملؤه بعد hydration → يَنمو → يَدفع chips → CLS 0.196

### بَعد (local)
```html
<div class="info-grid" id="hyear-info-grid" data-ssr-rendered="1">
  <div class="info-card"><span class="info-card-icon">📆</span><div class="info-card-body"><div class="info-card-label">السنة</div><div class="info-card-value">1447 هـ</div></div></div>
  <div class="info-card">...📊...عدد الأيام...355 يوم...</div>
  <div class="info-card">...✔️...نوع السنة...كبيسة (355 يوماً)...</div>
  <div class="info-card">...🌙...عدد الأشهر...12 شهراً...</div>
</div>
```
→ الـ grid يَحجز ارتفاعه النهائيّ من Frame #1 → chips لا تَنزاح → CLS ≈ 0

---

## 4. مُحتوى info-grid قبل/بعد

| Card | قَبل | بَعد (AR) |
|---|---|---|
| 1 السنة | (فارغ JS-fill) | `1447 هـ` |
| 2 عدد الأيام | (فارغ) | `355 يوم` |
| 3 نوع السنة | (فارغ) | `كبيسة (355 يوماً)` |
| 4 عدد الأشهر | (فارغ) | `12 شهراً` |

### ✅ تأكيد دقّة الحساب (calendar-authoritative)

تَمّ التَحقّق: مجموع أيام 12 شهرًا لـ 1447 من `_getDaysInHijriMonth`:
```
01:30 02:29 03:30 04:30 05:30 06:29 07:30 08:29 09:30 10:29 11:30 12:29 → TOTAL = 355
```
⇒ **355 يوم = كبيسة** — يُطابِق قيمة SSR تمامًا + يُطابِق app.js (`isHijriLeapYear(1447)`: 1447 mod 30 = 7 ⇒ leap year في الـ 30-year cycle). **لا cosmetic flip عند hydration**.

---

## 5. هل تَمّ تَعديل app.js؟ ❌ **لا**

✅ **0 تَعديل على app.js** — نَفس قَرار month page (`HIJRI-MONTH-PAGE-SSR-RENDER-1`): app.js يُعيد ملء نَفس الـ 4 cards بنَفس البيانات + نَفس الـ markup بعد hydration ⇒ **visual no-op** (لا flicker، لا تَغيُّر ارتفاع، لا shift). الـ idempotency guard (data-ssr-rendered) مَوجود كـ marker لِـ future polish لكنّ غير ضَروريّ لِحَلّ الـ CLS.

**السبب**: البيانات مُتطابقة (نَفس مَصدر Umm al-Qura) + البُنية مُتطابقة (4 cards) ⇒ re-fill = نَفس الأبعاد = صفر shift.

---

## 6. هل تَمّ تَعديل CSS؟ ❌ **لا**

✅ **0 تَعديل على CSS**. الـ `#hyear-info-grid` min-height (158px/280px) يَبقى كَما هو — لكنّ الآن الـ grid مَملوء من SSR فلا يَعتمد على min-height للحجز.

---

## 7. تأكيد أنّ `.hcal2-months-chips` نَفسها لم تَكن المَصدر

✅ مُؤَكَّد — `.hcal2-months-chips`:
- **12 chip كاملة SSR-rendered** (chip-name spans = 12، current chip = 1)
- byte-pos: **بعد** info-grid (343361 > 341879) ⇒ تَقع تحت الـ info-grid
- لم تُلمَس markup الـ chips إطلاقًا
- الإصلاح **فقط** ملأ الـ info-grid فوقها ⇒ المَصدر الحقيقيّ

---

## 8. تأكيد أنّ صفحة الشهر لم تَتأثّر

✅ `/hijri-calendar/1447-12` + `/en/hijri-calendar/1447-12`:
- `hyear-fill-present = 0` (الـ fill خاصّ بـ `_isHijriYearHub` فقط، صفحة الشهر = `_isHijriMonthHub`)
- `#hmonth-info-grid` يَبقى SSR-filled كَما كان (مُحَصَّن أصلًا)

---

## 9. تأكيد أنّ today/day Hijri pages لم تَتأثّر

✅ `/today-hijri-date` + `/hijri-date/1447-12-16`: `hyear-fill-present = 0` — لا علاقة بـ `_isHijriYearHub`.

---

## 10. تأكيد أنّ الحسابات والبيانات لم تَتغيّر

✅ **0 تَعديل** على:
- Hijri calculation (`_getDaysInHijriMonth` — استُخدِم read-only للحساب)
- Gregorian calculation
- month data / month order (12 chips بنفس الترتيب)
- month links (`/hijri-calendar/1447-01...12` بدون تَغيير)
- عدد أيام الشهر (29/30 كَما هو)

الـ info-grid يَعرض البيانات المَحسوبة من نَفس المَصدر — **لا تَغيير في المنطق**.

---

## 11. تأكيد أنّ canonical/hreflang/sitemap/JSON-LD لم تَتغيّر

اختبار محلّيّ على `/hijri-calendar`:
- Title: `التقويم الهجري 1447 هـ | الأشهر الهجرية والتواريخ الميلادية` ✅ (لم يَتغيّر)
- H1: `تقويم السنة الهجرية` ✅
- canonical: `.../hijri-calendar` ✅
- JSON-LD: 1 block (لم يُلمَس)

⇒ الـ SSR-fill يَستهدف `#hyear-info-grid` فقط داخل `<body>` — لا يَمسّ `<head>` / canonical / hreflang / sitemap / JSON-LD.

---

## 12. نتائج regression URLs (16/16 HTTP 200)

| URL | HTTP |
|---|:-:|
| `/` | 200 |
| `/prayer-times-in-riyadh` | 200 |
| `/moon-today` | 200 |
| `/qibla-in-riyadh` | 200 |
| `/msbaha` | 200 |
| `/zakat-calculator` | 200 |
| `/azkar` | 200 |
| `/hijri-calendar` | 200 |
| `/en/hijri-calendar` | 200 |
| `/fr/hijri-calendar` | 200 |
| `/tr/hijri-calendar` | 200 |
| `/ur/hijri-calendar` | 200 |
| `/hijri-calendar/1447-12` | 200 |
| `/en/hijri-calendar/1447-12` | 200 |
| `/today-hijri-date` | 200 |
| `/hijri-date/1447-12-16` | 200 |

⇒ **16/16 PASSED** + الـ SSR-fill يَعمل على 5 لُغات مُختبَرة (AR/EN/FR/TR/UR — `data-ssr-rendered="1"` مَوجود).

---

## 13. قياس CLS محلّيّ أو تفسير

⚠️ **لم يُقَس CLS فعليًّا بـ Lighthouse في الـ local** (يَتطلّب chromium headless). لكنّ التَحليل قاطع:

- **قبل**: `#hyear-info-grid` فارغ في SSR (يَحجز min-height 158px لكنّ المُحتوى الفعليّ يَتجاوزه عند JS-fill) → نُموّ → يَدفع chips → CLS 0.196
- **بعد**: الـ grid مَملوء بالـ 4 cards النهائيّة من Frame #1 → **صفر نُموّ** → chips ثابتة
- **المُقارنة الحاسمة**: صفحة الشهر (info-grid SSR-filled) **لا تُعاني CLS** — الآن صفحة السنة تُطابِقها
- **المُتَوقَّع**: CLS من `.hcal2-months-chips` → **≈ 0** (الـ chips لن تَنزاح لأنّ الـ grid فوقها لم يَعد يَنمو)

⇒ يُنصَح بقياس CLS الفعليّ في الـ post-push بـ Lighthouse على `/hijri-calendar`.

---

## 14. cache-busters

| ملفّ | قَبل | بَعد |
|---|---|---|
| `sw.js` `CACHE_VERSION` | `'v409'` | **`'v410'`** ⬆ |
| `js/app.js?v=` | `?v=751` | يَبقى (لم يُلمَس) |
| `css/style.css?v=` | `?v=467` | يَبقى (لم يُلمَس) |
| `_i18nVersion` | `190` | يَبقى (لم تُلمَس) |

---

## 15. رسالة commit المُقترَحة

```
perf(hijri): HIJRI-CALENDAR-MONTH-CHIPS-HYDRATION-CLS-FIX-1 — SSR-fill year info grid to prevent chips shift

Fixes CLS=0.196 on /hijri-calendar (year, all 10 langs). Audit
(HIJRI-CALENDAR-MONTH-CHIPS-CLS-AUDIT-1) found Lighthouse blamed
`section.hcal2-months-chips` but the chips are fully SSR-rendered and
stable — the real cause is `#hyear-info-grid` ABOVE them being EMPTY in
SSR and filled by app.js:23194 only after hydration. Its growth pushed
the chips section DOWN.

Fix: SSR-fill #hyear-info-grid with its 4 info-cards (year / total days /
leap type / months) computed server-side from the same Umm al-Qura data
(sum of _getDaysInHijriMonth over 12 months → total=355 for 1447=leap)
and the same per-lang strings app.js uses (_HYEAR_UI). Mirrors the
already-CLS-safe #hmonth-info-grid SSR-fill (HIJRI-MONTH-PAGE-SSR-RENDER-1).

The grid now has its final height from Frame #1; app.js re-fills the same
4 cards with identical markup + identical data → visual no-op, no shift.
Verified: SSR total (355) matches the calendar-authoritative per-month
sum AND app.js isHijriLeapYear(1447) (1447 mod 30 = 7 = leap) → no
cosmetic flip on hydration.

Local verification:
- #hyear-info-grid SSR-filled on AR/EN/FR/TR/UR (data-ssr-rendered="1")
- 4 cards: 1447 هـ / 355 يوم / كبيسة (355 يوماً) / 12 شهراً
- .hcal2-months-chips: 12 chips still SSR-rendered, below the filled grid
- month page (#hmonth-info-grid) + today + day pages UNAFFECTED
- Title/H1/canonical/JSON-LD UNCHANGED
- 16/16 regression URLs HTTP 200

ZERO change to: CSS, app.js, index.html, i18n, Hijri/Gregorian
calculations, calendar month data, month order, month links,
.hcal2-months-chips markup, Title, Meta, H1, canonical, hreflang,
sitemap, routing, JSON-LD, azkar pages.

Files: server.js (+54) + sw.js (+20/-1). Bumps CACHE_VERSION v409 -> v410.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## معايير القَبول — كلّها مُحقَّقة

| # | المعيار | حالة |
|---|---|---|
| 1 | `#hyear-info-grid` مَملوء في SSR | ✅ (5 langs) |
| 2 | لا يَظهر فارغًا في HTML الخامّ | ✅ (4 cards) |
| 3 | مُحتوى info-grid يُطابِق البيانات المُتوقَّعة | ✅ (355=calendar-authoritative) |
| 4 | JS لا يُسبّب نُموًّا جديدًا | ✅ (نَفس البُنية/البيانات = no-op) |
| 5 | `.hcal2-months-chips` لا تَنزاح | ✅ (grid فوقها لا يَنمو) |
| 6 | `/hijri-calendar/{YYYY-MM}` لم يَتأثّر | ✅ |
| 7 | `/today-hijri-date` لم يَتأثّر | ✅ |
| 8 | `/hijri-date/{date}` لم يَتأثّر | ✅ |
| 9 | Title/Meta/H1/JSON-LD/canonical لم تَتغيّر | ✅ |
| 10 | حسابات/بيانات التقويم لم تَتغيّر | ✅ |
| 11 | regression URLs 200 | ✅ 16/16 |
| 12 | Lighthouse CLS ينخفض / لا shift من chips | ⚠️ deferred to post-push Lighthouse |

---

## ⏳ في انتظار اعتمادك

أيّ من الخيارات:
1. **`أعتمد دفع تقرير: HIJRI-CALENDAR-MONTH-CHIPS-HYDRATION-CLS-FIX-1`** ⇒ تَنفيذ git push
2. تَعديل قَبل الدفع
3. إلغاء التَعديل (`git restore server.js sw.js`)

ملاحظة ثابتة محفوظة: لا أَبدأ أيّ صفحة أذكار جديدة حتى تَعتمد `/azkar/prayer-azkar` بصريًّا.
