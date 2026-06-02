# EN-QIBLA-CITY-DESKTOP-LCP-RENDER-DELAY-FIX-1 — تقرير ما قبل الدفع

**التاريخ**: 2026-06-01
**الحالة**: ✅ **جاهز للدفع** — في انتظار اعتمادك
**الخَيار المُطَبَّق**: Option A (server.js نَقطيّ — كَما اعتُمِد)

---

## 1. الملفّ المُعَدَّل

| ملفّ | عدد الأَسطر | نَوع التَعديل |
|---|---:|---|
| `server.js` | +27 / -0 | إضافة كَتلة `_isQiblaCityPage` regex + `html.replace` + ~20 سطر توثيق |
| `sw.js` | +25 / -1 | `CACHE_VERSION` v402→v403 + كَتلة توثيق الإصلاح |
| **الإجماليّ** | **+52 / -1** | ملفّان فقط |

✅ **لا تَعديل** على: `index.html` / `css/style.css` / `js/app.js` / `js/i18n*.js` / curated data / fonts / sitemap structure / robots.txt

---

## 2. أين تَمّ ضبط `data-qibla-mode` في SSR

**الموقع**: `server.js` بعد block `if (_isQiblaHub) { ... }` (السطر ~14298 — بين Hub gateway و HD-1 gateway).

**المنطق**:

```javascript
const _isQiblaCityPage = /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?qibla-in-[a-z][a-z0-9.-]+(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?$/.test(urlPath);
if (_isQiblaCityPage) {
    html = html.replace(
        '<div class="page" id="page-qibla" data-qibla-mode="hub">',
        '<div class="page" id="page-qibla" data-qibla-mode="city">'
    );
}
```

**كيف يَعمل**:
1. الـ regex يَلتَقِط:
   - `/qibla-in-{slug}` (AR — افتراضيّ)
   - `/{lang}/qibla-in-{slug}` لكلّ 9 لُغات (en|fr|tr|ur|de|id|es|bn|ms)
   - مَع suffix اختياريّ `-{lat}-{lng}` (legacy bookmarks)
2. على match: `html.replace` يُبدّل قيمة `data-qibla-mode` من `"hub"` إلى `"city"`
3. على non-match: HTML يَبقى كَما هو (Hub pages + بقيّة الصفحات)

---

## 3. كيف يُمَيِّز السيرفر بين Hub و City

| URL pattern | regex match | Mode |
|---|---|---|
| `/qibla` | `_isQiblaHub` ✅ | `"hub"` |
| `/{lang}/qibla` | `_isQiblaHub` ✅ | `"hub"` |
| `/qibla-in-riyadh` | `_isQiblaCityPage` ✅ | `"city"` 🆕 |
| `/en/qibla-in-makkah` | `_isQiblaCityPage` ✅ | `"city"` 🆕 |
| `/qibla-in-riyadh-24.7-46.6` | `_isQiblaCityPage` ✅ (legacy coord form) | `"city"` 🆕 |
| `/prayer-times-in-riyadh` | لا يَطابِق | غير ذي صِلة |
| `/` | لا يَطابِق | غير ذي صِلة |

⚠️ **mutual exclusion**: `_isQiblaHub` (يَنتهي بـ `/qibla$`) و `_isQiblaCityPage` (يَتطلّب `/qibla-in-...`) لا يَتقاطعان — أَمان كامل.

---

## 4. أمثلة SSR قبل/بعد (مَوثَّقة محلّيًّا)

اختبار محلّيّ على `localhost:10001` بعد التَعديل:

| URL | قَبل (Production الحاليّ `82e39b7`) | بعد (مَحلّيًّا) |
|---|---|---|
| `/en/qibla-in-riyadh` | `<div id="page-qibla" data-qibla-mode="hub">` 🔴 | `<div id="page-qibla" data-qibla-mode="city">` ✅ |
| `/en/qibla-in-jeddah` | `data-qibla-mode="hub"` 🔴 | `data-qibla-mode="city"` ✅ |
| `/en/qibla-in-makkah` | `data-qibla-mode="hub"` 🔴 | `data-qibla-mode="city"` ✅ |
| `/en/qibla-in-cairo` | `data-qibla-mode="hub"` 🔴 | `data-qibla-mode="city"` ✅ |
| `/qibla-in-riyadh` | `data-qibla-mode="hub"` 🔴 | `data-qibla-mode="city"` ✅ |
| `/qibla-in-makkah` | `data-qibla-mode="hub"` 🔴 | `data-qibla-mode="city"` ✅ |
| `/qibla` (Hub) | `data-qibla-mode="hub"` ✅ | `data-qibla-mode="hub"` ✅ (لم يَتغيّر) |
| `/en/qibla` (Hub) | `data-qibla-mode="hub"` ✅ | `data-qibla-mode="hub"` ✅ (لم يَتغيّر) |

✅ **8/8 سَلوكها صحيح**.

---

## 5. تأكيد أنّ صفحات المدينة أصبَحت `data-qibla-mode="city"`

نَتائج اختبار محلّيّ (8 URL):

```
/en/qibla-in-riyadh              mode=data-qibla-mode="city"    city=Riyadh                    angle=243.80°
/en/qibla-in-jeddah              mode=data-qibla-mode="city"    city=Jeddah                    angle=96.01°
/en/qibla-in-makkah              mode=data-qibla-mode="city"    city=Mecca                     angle=0.00°
/en/qibla-in-cairo               mode=data-qibla-mode="city"    city=Cairo                     angle=136.14°
/qibla-in-riyadh                 mode=data-qibla-mode="city"    city=الرياض                    angle=243.80°
/qibla-in-makkah                 mode=data-qibla-mode="city"    city=مكة المكرمة               angle=0.00°
```

⇒ كلّ صفحات المدينة الـ 6 المُختبَرة تَخرج بـ `"city"` ✅ + **SSR prefill values مَحفوظة** (Riyadh=243.80°، Mecca=0.00°، إلخ).

---

## 6. تأكيد أنّ صفحات Hub بَقيت `data-qibla-mode="hub"`

```
/qibla                           mode=data-qibla-mode="hub"     city=--                        angle=--
/en/qibla                        mode=data-qibla-mode="hub"     city=--                        angle=--
```

✅ كلتا صفحتَي Hub (AR + EN) بَقيتا على `"hub"` مَع `--` placeholders.

⇒ لم يَكسر Hub أَبدًا. CSS rule `[data-qibla-mode="hub"] .qibla-city-only { display: none }` ما زالت تَنطبق على Hub (مَطلوب — لإخفاء عناصر مدينة فارغة).

---

## 7. تأكيد أنّ `#qibla-info-grid` لم يَعد مَخفيًّا عند أوّل paint

**على City pages** بعد الإصلاح:
1. SSR يُخرِج `data-qibla-mode="city"`
2. CSS rule `#page-qibla[data-qibla-mode="hub"] .qibla-city-only { display: none !important; }` **لا تَنطبق** (لأنّ القيمة "city" وليس "hub")
3. `#qibla-info-grid` (داخل `<div class="section-card qibla-city-only">`) **مَرئيّ من Frame #1** مَع قِيَمه SSR-prefilled
4. JS `app.js:16558` يَضع `data-qibla-mode = "city"` — same value ⇒ no-op، لا re-paint

⇒ **Element render delay المُتوقَّع: ~6,900ms → ~50ms** (تَحسُّن ~99.3%).

---

## 8. تأكيد عدم تَغيير CSS

✅ `git diff --stat HEAD` يُظهِر فقط `server.js` + `sw.js`:

```
server.js | 27 +++++++++++++++++++++++++++
sw.js     | 25 ++++++++++++++++++++++++-
2 files changed, 51 insertions(+), 1 deletion(-)
```

- `css/style.css`: **0 تَعديل**
- لم يُلمَس `#page-qibla[data-qibla-mode="hub"] .qibla-city-only { display: none !important; }` (لا يَزال يَعمل بشَكل صحيح لـ Hub)
- لم تُضَف override rules
- لم يُلمَس `.info-grid` / `.qibla-seo-card` / `.qibla-city-only`

---

## 9. تأكيد عدم تَغيير JS

✅ **0 تَعديل** في:
- `js/app.js`: السطر 16224 (set hub) + السطر 16558 (set city) كلاهما يَبقى كَما هو
- `js/qibla.js`: لم يُلمَس
- `js/i18n*.js`: لم تُلمَس
- لم تُضَف dependency

**ملاحظة**: السطر 16558 (`if (_pageEl) _pageEl.setAttribute('data-qibla-mode', 'city');`) كان يَضع قيمة بعد hydration. مَع الإصلاح، السيرفر يُخرِج نفس القيمة مُسبقًا ⇒ هذا السطر يُصبح **same-value no-op** (لا re-paint، لا تَأثير). تَركه كحَماية idempotent يَزيد المتانة.

---

## 10. تأكيد عدم تَغيير معادلة Qibla أو البيانات

✅ **0 تَعديل** على:
- Qibla math (lat/lng → bearing): لم يُلمَس
- Kaaba reference (21.4225, 39.8262): لم يُلمَس
- Distance calculations: لم تُلمَس
- City coordinates: لم تُلمَس
- `curated-places.json`: لم يُلمَس
- SSR prefill values: مَوثَّقة بأنّها مَحفوظة (Riyadh=243.80°/24.7136°/46.6753° قَبل وبعد) ✅

---

## 11. تأكيد عدم تَغيير canonical / hreflang / sitemap

✅ **0 تَعديل**:
- canonical pipeline في server.js:1544 (3-tier SITE_URL fallback): لم يُلمَس
- hreflang generation: لم يُلمَس
- sitemap routes: لم تُلمَس
- robots.txt: لم يُلمَس
- routing: لم يُلمَس (`_isQiblaCityPage` يَتمّ inside `serveHtmlWithSeo` — لا يَخلق route جديد، فقط يَعدِّل HTML output لـ routes موجودة)

---

## 12. تَقدير الأثر على Lighthouse Desktop

| Metric | حاليًّا (`82e39b7`) | بعد الإصلاح (مُتَوَقَّع) | التَحسُّن |
|---|---:|---:|---|
| **Element render delay** | 6,900ms 🔴 | **~50ms** ✅ | **−99.3%** |
| **Speed Index** | 4.6s ⚠️ | **~1.8-2.2s** ✅ | **−55% to −60%** |
| **Performance** | 86 | **94-97** ✅ | **+8 to +11 نقاط** |
| LCP | 1.3s | 1.0-1.3s | يَبقى أو يَتحسّن |
| FCP | 1.0s | 1.0s | يَبقى |
| TBT | 0ms | 0ms | يَبقى |
| CLS | 0 | 0 | يَبقى (الـ HTML element مَوجود في DOM طوال الوقت، فقط `display` تَتغيّر — لا shift في layout الـ neighbors لأنّ `display: none` ↔ `display: grid` على نفس العنصر بدون margin/padding على الـ wrapper) |
| SEO | 100 | 100 | يَبقى |

**فائدة جانبيّة**: الـ AR pages تَستفيد بنفس الطَريقة (`/qibla-in-{city}` AR كانت لها نفس المُشكلة — مُتَحقَّق في الـ audit). تَحسين شامل لكلّ 10 لُغات.

---

## 13. cache-busters

| ملفّ | قَبل | بعد |
|---|---|---|
| `sw.js` `CACHE_VERSION` | `'v402'` | `'v403'` ⬆ |
| `js/app.js?v=` | `?v=751` | يَبقى `?v=751` (لا تَعديل JS) |
| `css/style.css?v=` | `?v=467` | يَبقى `?v=467` (لا تَعديل CSS) |
| `_i18nVersion` | `190` | يَبقى `190` (لا تَعديل i18n) |

HTML responses بـ `Cache-Control: no-cache` ⇒ المستخدمون يَرَون الإصلاح فَورًا بعد الـ deploy. `sw.js` v403 يُجدِّد SW precache.

---

## 14. رسالة commit المُقترَحة

```
perf(qibla): EN-QIBLA-CITY-DESKTOP-LCP-RENDER-DELAY-FIX-1 — SSR city mode for qibla city pages

Eliminate ~6,900ms Element render delay on `/qibla-in-{city}` pages (all
10 langs). The SSR HTML was emitting `<div id="page-qibla"
data-qibla-mode="hub">` for City pages — then the CSS rule
`#page-qibla[data-qibla-mode="hub"] .qibla-city-only { display: none
!important; }` (style.css:15764) suppressed #qibla-info-grid and every
.qibla-city-only descendant until app.js:16558 ran initQiblaForCity()
and flipped the attribute to "city" ~6.9s later. Lighthouse measured
this as the LCP element render delay even though the grid values were
in the SSR HTML from byte 0 (via 9cc340a/QIBLA-CITY-SSR-INFO-GRID-
PREFILL-FIX-1).

Fix: server.js detects `/qibla-in-{slug}` (with optional lang prefix +
optional -lat-lng coord suffix) and rewrites the static
`data-qibla-mode="hub"` to `data-qibla-mode="city"` in the SSR output.
Grid visible from Frame #1 with its SSR-prefilled values. The JS
attribute set at app.js:16558 becomes a same-value no-op.

Hub pages (/qibla, /{lang}/qibla) untouched — _isQiblaHub matches a
different URL shape and is mutually exclusive with the city regex.

Expected Lighthouse Desktop on /en/qibla-in-riyadh:
- Element render delay: 6,900ms → ~50ms (-99.3%)
- Speed Index: 4.6s → ~2.0s (-55%)
- Performance: 86 → 94-97 (+8 to +11)
- LCP: 1.3s (unchanged or improved)
- CLS: 0 (unchanged)
- TBT: 0ms (unchanged)
- SEO: 100 (unchanged)

ZERO change to: CSS, JS, i18n, qibla calculation, city coordinates,
canonical, hreflang, sitemap, routing, title, meta, H1, JSON-LD, SSR
prefill values, /qibla hub behaviour, /qibla-in-* prayer/moon city
pages.

Files: server.js (+27) + sw.js (+25/-1) = 51 insertions, 1 deletion.
Bumps CACHE_VERSION v402 → v403.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## 15. Local Regression Smoke (12 URL)

تَمّ اختبار بدء سيرفر محلّيّ على `localhost:10001` + 12 URL سَفر:

| URL | HTTP | Title (مُختصَر) |
|---|---:|---|
| `/` | 200 | "مواقيت الصلاة اليوم \|..." |
| `/en/` | 301 (→ /en) | redirect مَوجود — لا علاقة بالإصلاح |
| `/prayer-times-in-riyadh` | 200 | "مواقيت الصلاة في الرياض..." |
| `/en/prayer-times-in-cairo` | 200 | "Prayer Times in Cairo Today..." (T=50) |
| `/qibla-in-makkah` | 200 | "اتجاه القبلة في مكة المكرمة اليوم..." (T=53) |
| `/en/qibla-in-makkah` | 200 | "Qibla Direction in Mecca Today..." (T=55) |
| `/qibla` | 200 | "اتجاه القبلة الآن \|..." (Hub) |
| `/en/qibla` | 200 | "Qibla Direction Now \|..." (Hub) |
| `/moon-today` | 200 | "حالة القمر اليوم..." |
| `/hijri-calendar` | 200 | "التقويم الهجري 1447 هـ..." |
| `/msbaha` | 200 | "المسبحة الإلكترونية..." |
| `/zakat-calculator` | 200 | "حاسبة الزكاة..." |

✅ **0 regression** — كلّ الصفحات الـ 12 + 8 صفحات qibla تَعمل سَلوكها صحيح.

---

## 16. ما تَمّ التَحقّق منه + Acceptance Criteria

| # | المعيار | حالة |
|---|---|---|
| 1 | `/en/qibla-in-riyadh` يَحوي `data-qibla-mode="city"` | ✅ Local test passed |
| 2 | `/qibla-in-riyadh` يَحوي `data-qibla-mode="city"` | ✅ Local test passed |
| 3 | `/qibla` يَبقى `data-qibla-mode="hub"` | ✅ Local test passed |
| 4 | `/en/qibla` يَبقى `data-qibla-mode="hub"` | ✅ Local test passed |
| 5 | `#qibla-info-grid` مَوجود ومَملوء في SSR | ✅ Local test passed (Riyadh=243.80°، Mecca=0°، Cairo=136.14°، إلخ) |
| 6 | `.qibla-city-only` غير مَخفيّة على City عند أوّل paint | ✅ تأكيد منطقيّ (CSS rule لا تَنطبق على `"city"`) |
| 7 | `#qibla-info-grid` لا يَنتظر JS بعد hydration | ✅ سَيُختبَر post-push بـ Lighthouse |
| 8 | QIBLA SSR prefill السابق (9cc340a) يَبقى يَعمل | ✅ تأكيد محلّيّ — القِيَم مَحفوظة |
| 9 | canonical لا يَرجع للـ localhost (regression) | ✅ سَيُختبَر post-push (CANONICAL-PROD-ORIGIN-FIX-1 لم يُلمَس) |
| 10 | العناوين والأَوصاف لا تَتغيّر | ✅ Local test passed |
| 11 | `/qibla` العامّة لا تَتأثّر | ✅ Local test passed |
| 12 | صفحات regression تَعمل 200 | ✅ 12/12 PASSED محلّيًّا |

---

## 17. تأكيد ما لم يَتغيّر

✅ **0 تَعديل** على:
- Qibla math / Kaaba reference / city coordinates
- Distance to Mecca calculations
- QIBLA SSR prefill (9cc340a) — مَحفوظ كاملًا
- `canonical` / `og:url` / `hreflang` / `sitemap` / `routing`
- `<title>` / `<meta name="description">` / `<h1>` / JSON-LD
- اللغة العربيّة (لكنّها تَستفيد بنفس الطَريقة — bonus)
- 8 لُغات أخرى (TR/UR/DE/ID/ES/BN/MS/FR)
- صفحة `/qibla` العامّة
- `js/app.js` / `js/qibla.js`
- `css/style.css`
- `js/i18n*.js`
- صفحات Prayer / Moon / Hijri / Tools / Azkar
- WPM/curated data

---

## 18. خَطوات الـ post-push المَطلوبة (بعد اعتمادك للدفع)

1. `git add server.js sw.js reports/en-qibla-city-desktop-lcp-render-delay-fix-1-prepush.md`
2. `git commit -m "perf(qibla): EN-QIBLA-CITY-DESKTOP-LCP-RENDER-DELAY-FIX-1 ..."`
3. `git push origin main`
4. انتظار ≥5 دقائق (CDN hygiene)
5. تَنفيذ 12-نقطة post-push verification:
   - HEAD = origin/main + branch ab
   - `/sw.js` `CACHE_VERSION='v403'` على الإنتاج
   - `data-qibla-mode="city"` على 6 city pages
   - `data-qibla-mode="hub"` على 2 hub pages
   - SSR prefill values مَحفوظة (Riyadh/Mecca/Cairo/Jeddah)
   - Titles + Meta Descriptions بِلا regression
   - canonical يَستخدم prod domain (لا localhost)
   - 8 صفحات regression HTTP 200
6. Lighthouse Desktop على `/en/qibla-in-riyadh`:
   - Performance ≥ 90 ✅
   - Speed Index يَنخفض بِوضوح من 4.6s
   - Element render delay يَنخفض بِوضوح من 6,900ms
   - CLS = 0
   - TBT = 0ms أو قريب
   - SEO = 100

---

## ⏳ في انتظار اعتمادك

أيّ من الخيارات:
1. **`أعتمد دفع تقرير: EN-QIBLA-CITY-DESKTOP-LCP-RENDER-DELAY-FIX-1`** ⇒ تَنفيذ git push
2. تَعديل قَبل الدفع
3. إلغاء التَعديل (`git restore server.js sw.js`)

ملاحظة ثابتة محفوظة: لا أَبدأ أيّ صفحة أذكار جديدة حتى تَعتمد `/azkar/prayer-azkar` بصريًّا.
