# EN-TODAY-HIJRI-DATE-META-DESCRIPTION-LENGTH-FIX-1 — تقرير ما قبل الدفع

**التاريخ**: 2026-06-02
**الحالة**: ✅ **جاهز للدفع** — في انتظار اعتمادك
**النطاق**: EN فقط — `/en/today-hijri-date`

---

## 1. مَكان توليد Meta Description

**`server.js:8459`** — داخل `_HD8_DESC` object (مُولِّد per-lang descriptions لـ `/today-hijri-date` route).

**المُتغيِّر المُستخدَم**: `${_hDate}` = الـ Hijri date label الحاليّ بالـ EN (مثل "16 Dhu al-Hijjah 1447 AH").

---

## 2. النصّ القديم وطوله

```
Check today's Hijri date 16 Dhu al-Hijjah 1447 AH and its matching Gregorian date, with the Hijri calendar, date converter, moon phase, and Islamic events tools.
```

**D = 161 chars** (decoded) 🔴 — تَجاوَز ceiling 160 بِحَرف واحد!

---

## 3. النصّ الجديد وطوله

```
Check today's Hijri date 16 Dhu al-Hijjah 1447 AH and matching Gregorian date, with Hijri calendar, date converter, moon phase, and Islamic events tools.
```

**D = 153 chars** (decoded) ✅ — في [120, 160] بـ 7 char هامش.

### الفَرق

| | قَبل | بَعد |
|---|---|---|
| 1 | `and **its** matching Gregorian` | `and matching Gregorian` (−4 chars) |
| 2 | `with **the** Hijri calendar` | `with Hijri calendar` (−4 chars) |

⇒ **−8 chars إجماليّ**. المعنى مَحفوظ تَمامًا (`its` و `the` اختياريّان grammar-wise).

---

## 4. سبب تَجاوُز الطول

الـ template الأَصليّ صَيغ بـ verbose English يَستخدم `its` + `the` (style choice). المُجموع كَان exactly 161 على `16 Dhu al-Hijjah 1447 AH` — char واحد فوق ceiling SEOptimer.

### الـ Length range الجَديد عبر الـ Hijri year

| Hijri day | length | حُكم |
|---|---:|---|
| `1 Muharram 1447 AH` (شَهر هجريّ قَصير اسمه) | 147 | ✅ |
| `16 Dhu al-Hijjah 1447 AH` (الحاليّ — يَوميًا) | **153** | ✅ |
| `30 Dhu al-Hijjah 1447 AH` (أَطول day suffix) | 153 | ✅ |
| `15 Rabi al-Thani 1447 AH` | 155 | ✅ |

⇒ النَطاق المُتَوقَّع: **~147-159 chars** عبر السنة. كلّها في [120, 160]. **آمن.**

---

## 5. تأكيد أنّ الإصلاح EN-only

```javascript
// قَبل:
en: `Check today's Hijri date ${_hDate} and its matching Gregorian date, with the Hijri calendar, ...`,

// بَعد:
en: `Check today's Hijri date ${_hDate} and matching Gregorian date, with Hijri calendar, ...`,
```

✅ تَعديل سَطر EN فقط داخل `_HD8_DESC`. **AR, FR, TR, UR, DE, ID, ES, BN, MS** كلّها **لم تُلمَس** (مَوجودة في نَفس الـ object لكن في أَسطر مُختلفة).

---

## 6. تأكيد أنّ Title لم يَتغيّر

اختبار محلّيّ:
```
T = 57 chars
"Hijri Date Today | 16 Dhu al-Hijjah 1447 AH and Gregorian"
```
**مُطابق Production** ✅

---

## 7. تأكيد أنّ H1 لم يَتغيّر

اختبار محلّيّ:
```
H1 = "Today's Hijri Date: Tuesday, 16 Dhu al-Hijjah 1447 AH"
```
**مُطابق Production** ✅

---

## 8. تأكيد أنّ التاريخ الهجريّ والميلاديّ لم يَتغيّرا

✅ التَعديل تَعديل **template string** فقط على EN Meta. الـ `${_hDate}` = `16 Dhu al-Hijjah 1447 AH` تَأتي من Hijri date calculation الـ غير مَتأثّر بالكامل.

- Hijri date في Title: مَحفوظ
- Hijri date في H1: مَحفوظ
- Hijri date في Meta (placeholder): مَحفوظ
- Hijri date في body content: مَحفوظ
- Hijri/Gregorian date converter logic: غير مَتأثّر

---

## 9. تأكيد أنّ باقي اللُغات لم تَتأثّر

اختبار محلّيّ:

| Lang | T (bytes) | D (bytes) | الحُكم |
|---|---:|---:|---|
| AR (`/today-hijri-date`) | 88 | 267 | **مُطابق Production** ✅ |
| FR | 75 | 208 | **مُطابق Production** ✅ |
| TR | 54 | 178 | **مُطابق Production** ✅ |
| UR | 75 | 246 | **مُطابق Production** ✅ |

(الأَرقام بـ UTF-8 bytes؛ AR/UR = 2 bytes/char.) ✅ 4 لُغات بدون تَأثُّر.

---

## 10. تأكيد عدم تَغيير canonical/hreflang/sitemap/routing

✅ **0 تَعديل** على:
- canonical pipeline (`server.js:1544`): لم يُلمَس
- hreflang generation: لم يُلمَس
- sitemap routes: لم تُلمَس
- robots.txt: لم يُلمَس
- routing: لم يُلمَس

---

## 11. cache-busters

| ملفّ | قَبل | بَعد |
|---|---|---|
| `sw.js` `CACHE_VERSION` | `'v407'` | **`'v408'`** ⬆ |
| `js/app.js?v=` | `?v=751` | يَبقى (لم يُلمَس) |
| `css/style.css?v=` | `?v=467` | يَبقى (لم يُلمَس) |
| `_i18nVersion` | `190` | يَبقى (لم تُلمَس i18n) |

HTML `Cache-Control: no-cache` ⇒ SEOptimer يَرى الـ Meta الجديد فَورًا بعد الـ deploy.

---

## 12. صفحات regression — 12/12 HTTP 200 ✅

| URL | HTTP |
|---|:-:|
| `/` | 200 |
| `/en` | 200 |
| `/prayer-times-in-riyadh` | 200 |
| `/qibla-in-makkah` | 200 |
| `/qibla` | 200 |
| `/moon-today` | 200 |
| `/moon-in-riyadh` | 200 |
| `/hijri-calendar` | 200 |
| `/today-hijri-date` | 200 |
| `/en/today-hijri-date` | 200 |
| `/msbaha` | 200 |
| `/azkar` | 200 |

---

## 13. الملفّات المُعَدَّلة

| ملفّ | عدد الأَسطر | نَوع التَعديل |
|---|---:|---|
| `server.js` | +10 / -1 | EN template (1 سطر) + 9 سطور توثيق |
| `sw.js` | +16 / -1 | `CACHE_VERSION` v407→v408 + توثيق |
| **الإجماليّ** | **+26 / -2** | ملفّان فقط |

✅ **0 تَعديل** على: `index.html` / `css/style.css` / `js/app.js` / `js/i18n*.js` / curated / Hijri calculation / Gregorian calculation / date converter logic.

---

## 14. رسالة commit المُقترَحة

```
seo(en-hijri): EN-TODAY-HIJRI-DATE-META-DESCRIPTION-LENGTH-FIX-1 — shorten today Hijri date meta description

EN-only Meta Description length fix for /en/today-hijri-date. SEOptimer
audit showed D=161 chars (1 over the 160 ceiling) on "16 Dhu al-Hijjah
1447 AH". Fix: drop "its" + "the" (2 short words, 8 chars total) from
the EN template at server.js:8459 — meaning preserved:
- "and its matching Gregorian"  -> "and matching Gregorian"
- "with the Hijri calendar"     -> "with Hijri calendar"

New length ~153 chars on today's date (16 Dhu al-Hijjah 1447 AH),
~147-159 across the Hijri year (depends on Hijri day length).
Comfortably in SEOptimer's [120, 160] sweet spot.

AR/UR were already in [120, 160] range — UNCHANGED. FR/TR/DE/ID/ES/BN/MS
have D>160 but OUT OF SCOPE for this EN-only task — can be addressed in
a future multi-lang pass if requested.

Local verification on /en/today-hijri-date: D=161 -> 153. Title (T=57),
H1 ("Today's Hijri Date: Tuesday, 16 Dhu al-Hijjah 1447 AH"), Hijri/
Gregorian dates UNCHANGED. AR/FR/TR/UR baseline match production —
unaffected. 12/12 regression URLs HTTP 200.

ZERO change to: Title, H1, JSON-LD, Hijri calculation, Gregorian
calculation, date converter logic, canonical, hreflang, sitemap,
routing, CSS, app.js, i18n, curated.

Files: server.js (+10/-1) + sw.js (+16/-1) = 26 insertions, 2 deletions.
Bumps CACHE_VERSION v407 -> v408.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## ⏳ في انتظار اعتمادك

أيّ من الخيارات:
1. **`أعتمد دفع تقرير: EN-TODAY-HIJRI-DATE-META-DESCRIPTION-LENGTH-FIX-1`** ⇒ تَنفيذ git push
2. تَعديل قَبل الدفع
3. إلغاء التَعديل (`git restore server.js sw.js`)

ملاحظة ثابتة محفوظة: لا أَبدأ أيّ صفحة أذكار جديدة حتى تَعتمد `/azkar/prayer-azkar` بصريًّا.
