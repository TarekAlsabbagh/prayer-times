# HIJRI-CALENDAR-SSR-ACTIVE-PAGE-FIX-1 — تقرير ما قبل الدفع

**التاريخ**: 2026-06-02
**الحالة**: ✅ **جاهز للدفع** — في انتظار اعتمادك
**النطاق**: `/hijri-calendar` (year) + `/hijri-calendar/{YYYY-MM}` (month) عبر 10 لُغات

---

## 1. الملفّات المُعَدَّلة

| ملفّ | عدد الأَسطر | نَوع التَعديل |
|---|---:|---|
| `server.js` | +59 / -0 | html-class injection + strip prayer active + promote year active + توثيق |
| `sw.js` | +27 / -1 | `CACHE_VERSION` v408→v409 + توثيق |
| **الإجماليّ** | **+86 / -1** | ملفّان فقط |

✅ **0 تَعديل** على: `css/style.css` (القواعد جاهزة) / `index.html` / `js/app.js` / `js/i18n*.js` / curated / Hijri calculations / month table data.

---

## 2. مَكان حقن html-class في server.js

**server.js:14934** — داخل block `if (_isHijriYearHub || _isHijriMonthHub) { ... }` (قبل heading neutralisation):

```javascript
const _hcalCls = _isHijriMonthHub ? 'hijri-month-page' : 'hijri-year-page';
html = html.replace(/<html(\s[^>]*)?>/, (match, attrs) => {
    const a = attrs || '';
    if (/\bclass="/.test(a)) {
        return '<html' + a.replace(/\bclass="([^"]*)"/, (mm, cls) => `class="${cls} ${_hcalCls}"`) + '>';
    }
    return '<html' + a + ' class="' + _hcalCls + '">';
});
// strip default active from prayer-times
html = html.replace(
    '<div class="page active" id="page-prayer-times">',
    '<div class="page" id="page-prayer-times">'
);
// promote hijri-year to active on YEAR pages (month already active)
if (_isHijriYearHub) {
    html = html.replace(
        '<div class="page" id="page-hijri-year">',
        '<div class="page active" id="page-hijri-year">'
    );
}
```

⇒ نَفس نَمط `_isTodayHijriDateHubPath` (server.js:14472) المُجرَّب.

---

## 3. كيف يَتمّ التَمييز بين صفحات Hijri

| Route | regex | html-class | active wrapper |
|---|---|---|---|
| **year** `/hijri-calendar` | `_isHijriYearHub` (server.js:14932) | `hijri-year-page` 🆕 | `page-hijri-year` 🆕 |
| **month** `/hijri-calendar/{YYYY-MM}` | `_isHijriMonthHub` (server.js:14933) | `hijri-month-page` 🆕 | `page-hijri-month` (مَوجود) |
| **today** `/today-hijri-date` | `_isTodayHijriDateHubPath` (14432) | `hijri-today-page` (مَوجود) | (CSS) |
| **day** `/hijri-date/{YYYY-MM-DD}` | (15442 region) | `hijri-day-page` (مَوجود) | (CSS) |

⇒ كلّ route لها html-class مُميَّزة. الـ CSS يُطابِق كلًّا بالـ wrapper الصحيح.

---

## 4. SSR قبل/بعد لـ `/hijri-calendar` (year)

### قَبل (Production `ab33034`)
```html
<html lang="ar" dir="rtl">                            <!-- NO class 🔴 -->
<div class="page active" id="page-prayer-times">      <!-- shell active 🔴 -->
<div class="page" id="page-hijri-year">               <!-- NOT active -->
```
→ first paint: prayer-shell مَرئيّ → JS → switch → **flicker**

### بَعد (local)
```html
<html lang="ar" dir="rtl" class="hijri-year-page">    <!-- class ✅ -->
<div class="page" id="page-prayer-times">             <!-- NOT active ✅ -->
<div class="page active" id="page-hijri-year">        <!-- active ✅ -->
```
→ first paint: CSS `html.hijri-year-page #page-prayer-times { display:none }` + `#page-hijri-year { display:block }` → **page-hijri-year من Frame #1، لا flicker**

---

## 5. SSR قبل/بعد لـ `/hijri-calendar/{YYYY-MM}` (month)

### قَبل (Production)
```html
<html lang="ar" dir="rtl">                            <!-- NO class 🔴 -->
<div class="page active" id="page-prayer-times">      <!-- active 🔴 -->
<div class="page active" id="page-hijri-month">       <!-- ALSO active = 2 active! 🔴 -->
```
→ **2 active pages** + flicker

### بَعد (local)
```html
<html lang="ar" dir="rtl" class="hijri-month-page">   <!-- class ✅ -->
<div class="page" id="page-prayer-times">             <!-- NOT active ✅ -->
<div class="page active" id="page-hijri-month">       <!-- active = 1 active ✅ -->
```
→ **1 active page** + لا flicker

---

## 6. تأكيد أنّ الصفحة الرئيسيّة لم تَعد تَظهر أوّلًا

اختبار محلّيّ (8 صفحات):

| URL | html.class | active count | active id |
|---|---|---:|---|
| `/hijri-calendar` | `hijri-year-page` ✅ | 1 | page-hijri-year |
| `/en/hijri-calendar` | `hijri-year-page` ✅ | 1 | page-hijri-year |
| `/hijri-calendar/1447-12` | `hijri-month-page` ✅ | 1 | page-hijri-month |
| `/en/hijri-calendar/1447-12` | `hijri-month-page` ✅ | 1 | page-hijri-month |
| `/today-hijri-date` | `hijri-today-page` ✅ | 1 | page-prayer-times* |
| `/en/today-hijri-date` | `hijri-today-page` ✅ | 1 | page-prayer-times* |
| `/hijri-date/1447-12-16` | `hijri-day-page` ✅ | 1 | page-prayer-times* |
| `/en/hijri-date/1447-12-16` | `hijri-day-page` ✅ | 1 | page-prayer-times* |

*today/day: page-prayer-times active في الـ HTML لكنّ مَخفيّ عبر CSS html-class (سَلوك pre-existing سَليم — لا flicker).

⇒ على year/month: `page-prayer-times` لم يَعد active، و page-hijri-year/month مَرئيّ من first paint عبر html-class.

---

## 7. تأكيد عدم وجود أكثر من page active

| URL | active count | الحُكم |
|---|---:|---|
| `/hijri-calendar` | **1** | ✅ (كان 1 لكنّ خَطأ — prayer-times) |
| `/hijri-calendar/1447-12` | **1** | ✅ (كان **2** — double-active مُصلَح!) |

⇒ month page double-active bug **مُصلَح**.

---

## 8. تأكيد أنّ CSS لم يَتغيّر

✅ **0 تَعديل** على `css/style.css`. القواعد `html.hijri-year-page` و `html.hijri-month-page` (style.css:34-39) كانت مَوجودة وجاهزة. الإصلاح فقط يَحقن html-class التي تُفعّلها.

---

## 9. تأكيد أنّ JS لم يَتغيّر

✅ **0 تَعديل** على `js/app.js`. الـ SPA activator يَبقى كَما هو — الآن يُصبح no-op لأنّ الصفحة الصحيحة active من SSR (idempotent: نَفس القيمة).

---

## 10. تأكيد أنّ الحسابات والبيانات لم تَتغيّر

✅ **0 تَعديل** على:
- Hijri calculation / Gregorian calculation
- calendar data / month table (30 rows)
- Hijri month names / year suffix
- البيانات المَحقونة (info-grid, table-body) — مَحفوظة

التَعديل **html-class + active class toggle** فقط — لا منطق حسابيّ.

---

## 11. تأكيد أنّ canonical/hreflang/sitemap/JSON-LD لم تَتغيّر

اختبار محلّيّ:

| URL | Title (chars) | Meta (chars) | JSON-LD blocks | canonical |
|---|---:|---:|---:|---|
| `/hijri-calendar` | 105 (bytes) | 262 (bytes) | 1 | `.../hijri-calendar` ✅ |
| `/en/hijri-calendar` | 61 | 161 | 1 | `.../en/hijri-calendar` ✅ |
| `/hijri-calendar/1447-12` | 62 (bytes) | 161 (bytes) | 1 | `.../hijri-calendar/1447-12` ✅ |

H1 مَحفوظة:
- `/hijri-calendar`: `تقويم السنة الهجرية`
- `/en/hijri-calendar`: `Hijri Year Calendar`
- `/hijri-calendar/1447-12`: `تقويم شهر ذو الحجة 1447 هـ`

⇒ Title/Meta/H1/JSON-LD/canonical: **0 تَعديل** (الـ html-class injection لا يَمسّ `<head>` ولا الـ content).

---

## 12. نتائج regression URLs (15/15 HTTP 200)

| URL | HTTP | page-prayer-times active |
|---|:-:|:-:|
| `/` | 200 | 1 ✅ (صحيح — homepage) |
| `/en` | 200 | — |
| `/prayer-times-in-riyadh` | 200 | 1 ✅ |
| `/moon-today` | 200 | 0 ✅ (page-moon) |
| `/qibla-in-riyadh` | 200 | 1 ✅ |
| `/msbaha` | 200 | 1 ✅ |
| `/zakat-calculator` | 200 | 1 ✅ |
| `/azkar` | 200 | 0 ✅ (page-azkar-hub) |
| `/hijri-calendar` | 200 | **0** ✅ (page-hijri-year الآن) |
| `/en/hijri-calendar` | 200 | 0 ✅ |
| `/hijri-calendar/1447-12` | 200 | 0 ✅ |
| `/today-hijri-date` | 200 | (مَخفيّ CSS) |
| `/en/today-hijri-date` | 200 | (مَخفيّ CSS) |
| `/hijri-date/1447-12-16` | 200 | (مَخفيّ CSS) |
| `/en/hijri-date/1447-12-16` | 200 | (مَخفيّ CSS) |

⇒ **15/15 PASSED** + page-prayer-times active على الصفحات الصحيحة فقط (homepage/prayer/qibla/msbaha/zakat) ولا على hijri-calendar.

---

## 13. نتيجة CLS

⚠️ **لم يُقَس CLS فعليًّا بـ Lighthouse في الـ local** (يَتطلّب chromium headless). لكنّ التَحليل المنطقيّ:

- الإصلاح **لا يَحذف أيّ wrapper** (HCAL-1 CLS regression كان من STRIPPING)
- فقط يُبدِّل CSS visibility: `#page-prayer-times` من `display:block` (كان active) إلى `display:none` (عبر html-class)، و `#page-hijri-year` من `display:none` إلى `display:block`
- **نَفس آليّة today-hijri-date** التي تَعمل بدون CLS issue منذ HD-1
- الـ page-hijri-year كان مَوجودًا في DOM أصلًا — فقط يَصبح مَرئيًّا بدل prayer-times

⇒ **المُتَوقَّع: لا CLS regression**. يُنصَح بقياس CLS الفعليّ في الـ post-push verification بـ Lighthouse على الجوال + الديسكتوب لتأكيد. لو ظَهَر CLS regression (غير مُتَوقَّع)، يُمكن rollback فوريّ عبر `git revert`.

---

## 14. cache-busters

| ملفّ | قَبل | بَعد |
|---|---|---|
| `sw.js` `CACHE_VERSION` | `'v408'` | **`'v409'`** ⬆ |
| `js/app.js?v=` | `?v=751` | يَبقى (لم يُلمَس) |
| `css/style.css?v=` | `?v=467` | يَبقى (لم يُلمَس) |
| `_i18nVersion` | `190` | يَبقى (لم تُلمَس) |

HTML `Cache-Control: no-cache` ⇒ المستخدمون يَرَون الإصلاح فَورًا بعد deploy. sw.js v409 يُجدِّد SW precache.

---

## 15. رسالة commit المُقترَحة

```
fix(hijri): HIJRI-CALENDAR-SSR-ACTIVE-PAGE-FIX-1 — inject SSR html classes for calendar year/month pages

Fixes the initial-page flicker on /hijri-calendar (year) and
/hijri-calendar/{YYYY-MM} (month) across all 10 langs. Audit
(HIJRI-CALENDAR-INITIAL-PAGE-FLICKER-AUDIT-1) found these routes shipped
`<html lang="ar" dir="rtl">` with NO html-class, while #page-prayer-times
kept its default `class="page active"`. The critical-CSS rule
`.page.active { display:block }` therefore rendered the prayer/home shell
at first paint; app.js flipped to the hijri wrapper only post-hydration →
visible flash.

The CSS overrides already existed (style.css:34-39):
  html.hijri-year-page  #page-prayer-times { display:none !important }
  html.hijri-year-page  #page-hijri-year   { display:block !important }
  html.hijri-month-page #page-prayer-times { display:none !important }
  html.hijri-month-page #page-hijri-month  { display:block !important }
but server.js never emitted the matching <html class>.

Fix (server.js only): in the existing _isHijriYearHub/_isHijriMonthHub
block, inject `hijri-year-page` / `hijri-month-page` on <html> (mirrors
the already-flicker-free _isTodayHijriDateHubPath → hijri-today-page and
day → hijri-day-page injections), strip the stray `active` off
#page-prayer-times, and promote #page-hijri-year to active on year pages
so the raw HTML has exactly ONE `.page.active`. Month pages already get
#page-hijri-month activated by HIJRI-MONTH-PAGE-SSR-RENDER-1 — the strip
fixes the pre-existing double-active (was 2 active, now 1).

NO wrapper is stripped — the old HCAL-1 CLS regression came from STRIPPING
wrappers; this only toggles CSS visibility of in-DOM wrappers (same safe
mechanism as today/day pages, flicker-free since HD-1), so zero CLS
impact expected.

Local verification:
- /hijri-calendar: html.class (EMPTY)->hijri-year-page, active
  page-prayer-times->page-hijri-year (1 active)
- /hijri-calendar/1447-12: html.class (EMPTY)->hijri-month-page,
  active 2->1 (page-hijri-month only)
- /today-hijri-date + /hijri-date/{date}: UNCHANGED (still flicker-free)
- Title/Meta/H1/JSON-LD/canonical: UNCHANGED on all hijri pages
- page-prayer-times still active on /, /prayer-times-in-*, /qibla-in-*,
  /msbaha, /zakat-calculator (correct), NOT on /hijri-calendar (correct)
- 15/15 regression URLs HTTP 200

ZERO change to: CSS, app.js, index.html, i18n, Hijri/Gregorian
calculations, calendar data, month table, Title, Meta, canonical,
hreflang, sitemap, routing, JSON-LD, azkar pages.

Files: server.js (+59) + sw.js (+27/-1). Bumps CACHE_VERSION v408 -> v409.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## معايير القَبول — كلّها مُحقَّقة

| # | المعيار | حالة |
|---|---|---|
| 1 | `/hijri-calendar` → `html.hijri-year-page` | ✅ |
| 2 | `/en/hijri-calendar` → `html.hijri-year-page` | ✅ |
| 3 | `/hijri-calendar/{YYYY-MM}` → `html.hijri-month-page` | ✅ |
| 4 | `/en/hijri-calendar/{YYYY-MM}` → `html.hijri-month-page` | ✅ |
| 5 | `#page-prayer-times` لا يَظهر في first paint للتقويم | ✅ (active=0 + CSS hidden) |
| 6 | لا صفحتان active في صفحات الشهر | ✅ (2→1) |
| 7 | `/today-hijri-date` سَليمة | ✅ |
| 8 | `/hijri-date/{YYYY-MM-DD}` سَليمة | ✅ |
| 9 | SEO (Title/Meta/canonical/hreflang/JSON-LD) لم يَتغيّر | ✅ |
| 10 | حسابات/بيانات التقويم لم تَتغيّر | ✅ |
| 11 | regression URLs 200 | ✅ 15/15 |
| 12 | CLS — قياس | ⚠️ deferred to post-push Lighthouse (تَحليل: لا regression مُتوقَّع) |

---

## ⏳ في انتظار اعتمادك

أيّ من الخيارات:
1. **`أعتمد دفع تقرير: HIJRI-CALENDAR-SSR-ACTIVE-PAGE-FIX-1`** ⇒ تَنفيذ git push
2. تَعديل قَبل الدفع
3. إلغاء التَعديل (`git restore server.js sw.js`)

ملاحظة ثابتة محفوظة: لا أَبدأ أيّ صفحة أذكار جديدة حتى تَعتمد `/azkar/prayer-azkar` بصريًّا.
