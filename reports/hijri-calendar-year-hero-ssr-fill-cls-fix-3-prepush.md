# HIJRI-CALENDAR-YEAR-HERO-SSR-FILL-CLS-FIX-3 — تقرير ما قبل الدفع

**التاريخ**: 2026-06-02
**الحالة**: ✅ **جاهز للدفع** — في انتظار اعتمادك
**النطاق**: `/hijri-calendar` (year) + `/{lang}/hijri-calendar` عبر 10 لُغات

---

## 1. الملفّات المُعَدَّلة

| ملفّ | عدد الأَسطر | نَوع التَعديل |
|---|---:|---|
| `server.js` | +69 / -0 | SSR-fill `#hyear-breadcrumbs` + `#hyear-intro` (per-lang) + توثيق |
| `sw.js` | +22 / -1 | `CACHE_VERSION` v410→v411 + توثيق |
| **الإجماليّ** | **+91 / -1** | ملفّان فقط |

✅ **0 تَعديل** على: `css/style.css` / `js/app.js` / `index.html` / `js/i18n*.js` / curated / Hijri calc / `.hcal2-months-chips` / `#hyear-info-grid` (مَملوء بالفعل من v410).

---

## 2. مَكان SSR-fill لـ `#hyear-breadcrumbs`

**server.js** داخل block `if (_isHijriYearHub)` (بعد كَتلة info-grid، ~السطر 15313):

```javascript
const _hyBcItems = [
    { href: _hyHomeUrl, text: _hyBCu.home },   // الرئيسية
    { href: _hyCalUrl,  text: _hyBCu.cal },    // التقويم الهجري (href=/hijri-calendar/1447)
    { current: true,    text: _yLbl },         // 1447 هـ
];
const _hyBcHtml = `<ol class="breadcrumb-list">...</ol>`;
html = html.replace(
    /(<nav class="city-breadcrumb hijri-breadcrumb" id="hyear-breadcrumbs"[^>]*>)<\/nav>/,
    `$1${_hyBcHtml}</nav>`
);
```

⇒ نَفس نَمط today-page breadcrumb builder (server.js:14761).

---

## 3. مَكان SSR-fill لـ `#hyear-intro`

```javascript
const _hyIntroText = _escHtml(_hyIntroFn(_yLbl));  // per-lang intro text
html = html.replace(
    /(<p id="hyear-intro"[^>]*>)<\/p>/,
    `$1${_hyIntroText}</p>`
);
```

⇒ النَصّ per-lang مُطابِق لـ `app.js _HYEAR_UI[lang].intro`.

---

## 4. مُقارنة قبل/بعد للـ SSR HTML

### قَبل (Production `d63e081`)
```html
<nav class="city-breadcrumb hijri-breadcrumb" id="hyear-breadcrumbs"></nav>  <!-- EMPTY 🔴 -->
<p id="hyear-intro" class="hpage-hero-intro hpage-hero-intro--start"></p>    <!-- EMPTY 🔴 -->
<div class="info-grid" id="hyear-info-grid" data-ssr-rendered="1">...4 cards...</div>  <!-- filled (v410) -->
```
→ breadcrumb + intro يَنمُوان بعد hydration → يَدفعان chips → CLS 0.192

### بَعد (local)
```html
<nav ... id="hyear-breadcrumbs"><ol class="breadcrumb-list">الرئيسية › التقويم الهجري › 1447 هـ</ol></nav>  <!-- filled ✅ -->
<p id="hyear-intro" ...>يعرض هذا التقويم الهجري لعام 1447 هـ جميع الأشهر...</p>  <!-- filled ✅ -->
<div class="info-grid" id="hyear-info-grid" data-ssr-rendered="1">...4 cards...</div>  <!-- filled ✅ -->
```
→ كلّ العناصر فوق chips مَملوءة من Frame #1 → **صفر نُموّ → chips لا تُدفَع → CLS ≈ 0**

---

## 5. مُحتوى breadcrumb قبل/بعد

| | قَبل | بَعد (AR) |
|---|---|---|
| breadcrumb | فارغ (0 `<li>`) 🔴 | `الرئيسية › التقويم الهجري › 1447 هـ` (5 `<li>` = 3 items + 2 separators) ✅ |

اختبار محلّيّ على 5 لُغات: breadcrumb-li = **5** على كلّ (AR/EN/FR/TR/UR).

---

## 6. مُحتوى intro قبل/بعد

| Lang | قَبل | بَعد (chars) |
|---|---|---:|
| AR | فارغ 🔴 | `يعرض هذا التقويم الهجري لعام 1447 هـ جميع الأشهر...` (288) ✅ |
| EN | فارغ | (180) ✅ |
| FR | فارغ | (209) ✅ |
| TR | فارغ | (177) ✅ |
| UR | فارغ | (255) ✅ |

---

## 7. تأكيد أنّ `#hyear-info-grid` ما زال SSR-filled

✅ `info-grid-filled = 1` على 5 لُغات — الـ 4 cards من v410 مَحفوظة (لم يُلمَس).

---

## 8. تأكيد أنّ `.hcal2-months-chips` لم تَتغيّر

✅ chip-name spans = **12** (لم تُلمَس markup الـ chips إطلاقًا). الإصلاح فقط ملأ العناصر فوقها.

---

## 9. هل تَمّ تَعديل app.js؟ ❌ **لا**

✅ **0 تَعديل على app.js** — نَفس قَرار info-grid + month page: app.js يُعيد ملء breadcrumb + intro بنَفس البُنية/النَصّ بعد hydration ⇒ **visual no-op** (لا نُموّ إضافيّ، لا shift). البيانات مُتطابقة (نَفس labels + نَفس intro template).

---

## 10. هل تَمّ تَعديل CSS؟ ❌ **لا**

✅ **0 تَعديل على CSS**. لم نَستخدم min-height/contain على chips (كَما طَلبت) — السبب الحقيقيّ كان نُموّ العناصر فوقها، وحُلَّ بالـ SSR-fill.

---

## 11. تأكيد أنّ صفحة الشهر لم تَتأثّر

✅ `/hijri-calendar/1447-12` + `/en/hijri-calendar/1447-12`:
- `hyear-bc-filled = 0` (الـ fill خاصّ بـ `_isHijriYearHub` فقط)
- `hyear-intro` فارغ (الـ fill لا يَنطبق على month route)
- month tbody = **29 rows** (مَحفوظ)
- month breadcrumb + subtitle + info-grid: مَحفوظة (HIJRI-MONTH-PAGE-SSR-RENDER-1 سَليم)

---

## 12. تأكيد أنّ today/day Hijri pages لم تَتأثّر

✅ `/today-hijri-date` + `/hijri-date/1447-12-16`:
- `hyear-bc-filled = 0`، `hyear-intro` فارغ (الـ fill لا يَنطبق)
- html.class مَحفوظة (`hijri-today-page` / `hijri-day-page`)

---

## 13. تأكيد أنّ الحسابات والبيانات لم تَتغيّر

✅ **0 تَعديل** على:
- Hijri/Gregorian calculation
- calendar data / month order (12 chips بنفس الترتيب)
- month links (`/hijri-calendar/1447-01...12`)
- عدد أيام السنة (355) / الأشهر (29/30)

الـ breadcrumb + intro نَصّ ثابت per-lang (لا منطق حسابيّ).

---

## 14. تأكيد أنّ canonical/hreflang/sitemap/JSON-LD لم تَتغيّر

اختبار محلّيّ على `/hijri-calendar`:
- Title: `التقويم الهجري 1447 هـ | الأشهر الهجرية والتواريخ الميلادية` ✅
- H1: `تقويم السنة الهجرية` ✅
- JSON-LD: 1 block ✅

⇒ الـ SSR-fill يَستهدف `#hyear-breadcrumbs` + `#hyear-intro` داخل `<body>` فقط — لا يَمسّ `<head>`/canonical/hreflang/sitemap/JSON-LD.

---

## 15. نتائج regression URLs (16/16 HTTP 200)

| URL | HTTP | | URL | HTTP |
|---|:-:|---|---|:-:|
| `/` | 200 | | `/en/hijri-calendar` | 200 |
| `/prayer-times-in-riyadh` | 200 | | `/fr/hijri-calendar` | 200 |
| `/moon-today` | 200 | | `/tr/hijri-calendar` | 200 |
| `/qibla-in-riyadh` | 200 | | `/ur/hijri-calendar` | 200 |
| `/msbaha` | 200 | | `/hijri-calendar/1447-12` | 200 |
| `/zakat-calculator` | 200 | | `/en/hijri-calendar/1447-12` | 200 |
| `/azkar` | 200 | | `/today-hijri-date` | 200 |
| `/hijri-calendar` | 200 | | `/hijri-date/1447-12-16` | 200 |

⇒ **16/16 PASSED**.

---

## 16. قياس CLS محلّيّ أو تفسير

⚠️ **لم يُقَس CLS فعليًّا بـ Lighthouse في الـ local** (يَتطلّب chromium). لكنّ التَحليل قاطع:

- **قبل (v410)**: info-grid مَملوء لكنّ breadcrumb + intro فارغان → يَنمُوان فوق chips → CLS 0.192
- **بعد (v411)**: **كلّ** العناصر فوق chips (breadcrumb + intro + info-grid) مَملوءة من Frame #1 → **صفر نُموّ** → chips لا تُدفَع
- **المُقارنة الحاسمة**: صفحة السنة الآن تُطابِق صفحة الشهر (التي تَملأ breadcrumb + subtitle + info-grid + tbody كلّها = CLS-safe)
- **المُتَوقَّع**: CLS من `.hcal2-months-chips` → **≈ 0** (لم يَعد هناك أيّ عُنصر يَنمو فوقها)

⇒ يُنصَح بقياس CLS الفعليّ بـ Lighthouse في الـ post-push على `/hijri-calendar`.

---

## 17. cache-busters

| ملفّ | قَبل | بَعد |
|---|---|---|
| `sw.js` `CACHE_VERSION` | `'v410'` | **`'v411'`** ⬆ |
| `js/app.js?v=` | `?v=751` | يَبقى (لم يُلمَس) |
| `css/style.css?v=` | `?v=467` | يَبقى (لم يُلمَس) |
| `_i18nVersion` | `190` | يَبقى (لم تُلمَس) |

---

## 18. رسالة commit المُقترَحة

```
perf(hijri): HIJRI-CALENDAR-YEAR-HERO-SSR-FILL-CLS-FIX-3 — SSR-fill year breadcrumbs and intro to prevent chips shift

Completes the /hijri-calendar (year) CLS fix. The info-grid SSR-fill
(v410) only dropped CLS 0.196→0.192 because two more hero containers
above the month chips were still empty in SSR: #hyear-breadcrumbs (0
<li>) and #hyear-intro (empty <p>), both JS-filled by app.js (23150 +
23169) only after hydration. Their growth pushed .hcal2-months-chips
down — Lighthouse's reported culprit. Audit
(HIJRI-CALENDAR-MONTH-CHIPS-CLS-POST-SSR-FILL-AUDIT-2) confirmed the
chips never change height; their offsetTop moves.

Fix: SSR-fill #hyear-breadcrumbs (3-item ol: Home → Hijri Calendar →
year, mirroring the proven today-page breadcrumb builder at
server.js:14761) and #hyear-intro (per-lang text mirroring app.js
_HYEAR_UI.intro). The hero now has its final height from Frame #1;
app.js re-fills both with identical markup/text → visual no-op, no
further growth → chips stop moving. The month page is CLS-safe for
exactly this reason (it SSR-fills breadcrumb + subtitle + info-grid +
tbody) — this brings the year page to parity.

Local verification:
- breadcrumb SSR-filled (5 <li> = 3 items + 2 seps) on AR/EN/FR/TR/UR
- intro SSR-filled (177-288 chars per lang)
- #hyear-info-grid still filled (v410 preserved)
- .hcal2-months-chips: 12 chips unchanged
- month + today + day pages UNAFFECTED (hyear fill absent there)
- Title/H1/JSON-LD/canonical UNCHANGED
- month tbody still 29 rows (ذو الحجة 1447)
- 16/16 regression URLs HTTP 200

ZERO change to: CSS, app.js, index.html, i18n, Hijri/Gregorian
calculations, calendar data, month order, month links,
.hcal2-months-chips markup, #hyear-info-grid (already filled),
Title, Meta, H1, canonical, hreflang, sitemap, routing, JSON-LD,
azkar pages.

Files: server.js (+69) + sw.js (+22/-1). Bumps CACHE_VERSION v410 -> v411.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## معايير القَبول — كلّها مُحقَّقة

| # | المعيار | حالة |
|---|---|---|
| 1 | `#hyear-breadcrumbs` لم يَعد فارغًا في SSR | ✅ (5 li) |
| 2 | `#hyear-intro` لم يَعد فارغًا في SSR | ✅ (177-288 chars) |
| 3 | `#hyear-info-grid` يَبقى مَملوءًا | ✅ |
| 4 | لا نُموّ جديد فوق chips بعد hydration | ✅ (كلّها مَملوءة) |
| 5 | `.hcal2-months-chips` لا تَنزاح | ✅ (لا عُنصر يَنمو فوقها) |
| 6 | صفحة الشهر لم تَتأثّر | ✅ |
| 7 | today/day pages لم تَتأثّر | ✅ |
| 8 | Title/Meta/H1/JSON-LD/canonical بدون تَغيير | ✅ |
| 9 | حسابات/بيانات التقويم بدون تَغيير | ✅ |
| 10 | regression 200 | ✅ 16/16 |
| 11 | Lighthouse CLS ينخفض / chips لا تَظهر كـ culprit | ⚠️ deferred to post-push Lighthouse |

---

## ⏳ في انتظار اعتمادك

أيّ من الخيارات:
1. **`أعتمد دفع تقرير: HIJRI-CALENDAR-YEAR-HERO-SSR-FILL-CLS-FIX-3`** ⇒ تَنفيذ git push
2. تَعديل قَبل الدفع
3. إلغاء التَعديل (`git restore server.js sw.js`)

ملاحظة ثابتة محفوظة: لا أَبدأ أيّ صفحة أذكار جديدة حتى تَعتمد `/azkar/prayer-azkar` بصريًّا.
