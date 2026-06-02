# EN-MOON-TODAY-CITY-KEYWORD-CONSISTENCY-FIX-1 — تقرير ما قبل الدفع

**التاريخ**: 2026-06-01
**الحالة**: ✅ **جاهز للدفع** — في انتظار اعتمادك
**الخَيار المُطَبَّق**: Option A2 (helper جديد `_stripHtmlForMoonCity` — كَما اعتُمِد)

---

## 1. الملفّات المُعَدَّلة

| ملفّ | عدد الأَسطر | نَوع التَعديل |
|---|---:|---|
| `server.js` | +60 / -1 | إضافة `_MOON_CITY_STRIP_IDS` + `_stripHtmlForMoonCity` helper + استبدال استدعاء + توثيق |
| `sw.js` | +31 / -1 | `CACHE_VERSION` v404→v405 + كَتلة توثيق |
| **الإجماليّ** | **+91 / -2** | ملفّان فقط |

✅ **0 تَعديل** على: `index.html` / `css/style.css` / `js/app.js` / `js/i18n*.js` / curated data / sitemap structure / robots.txt / fonts

---

## 2. اسم الـ helper الجديد

**`_stripHtmlForMoonCity`** في `server.js:6288` — مُطابق لِنَمط `_stripHtmlForMoonHub` (server.js:6262) و `_stripHtmlForQiblaHub` (server.js:6298) و `_stripHtmlForHijriYearHub` (server.js:6357).

---

## 3. قائمة IDs المُضافة إلى `_MOON_CITY_STRIP_IDS`

```javascript
const _MOON_CITY_STRIP_IDS = [
    'page-prayer-times',     // الـ ID الأَصليّ من القديم
    // 🆕 12 inactive SPA wrapper (نَفس IDs MOON-TODAY-KEYWORD-CONSISTENCY-FIX-1):
    'page-qibla',
    'page-zakat',
    'page-azkar-hub',
    'page-azkar-morning',
    'page-azkar-evening',
    'page-azkar-prayer',
    'page-tasbih',
    'page-hijri-today',
    'page-hijri-day',
    'page-hijri-year',
    'page-hijri-month',
    'page-date-converter',
];
```

⇒ **13 ID إجمالًا** (1 قديم + 12 جديد).

---

## 4. أين تَمّ استبدال `_stripPagePrayerTimesOnly`

**server.js:15971** — داخل `if (_isMoonCityPageSsr) { ... }`:

```javascript
// قَبل:
if (_isMoonCityPageSsr) {
    html = _stripPagePrayerTimesOnly(html);
}

// بَعد:
if (_isMoonCityPageSsr) {
    html = _stripHtmlForMoonCity(html);
}
```

**`_isMoonCityPageSsr` regex** (server.js:13327) يَلتقط:
- `/moon-today-in-{slug}` + كلّ 10 لُغات
- `/moon-in-{slug}` + كلّ 10 لُغات
- مَع suffix `-{lat}-{lng}` (legacy coord form)
- مَع suffix `/YYYY-MM` و `/YYYY-MM-DD` (date routing)

⇒ الإصلاح يَنفع **~2,000 صفحة** (10 لُغات × ~200 مدينة × 2 route families).

ملاحظة: `_stripPagePrayerTimesOnly` يَبقى مُعرَّفًا في server.js:6284 (لم يُحذَف) لأنّه قد يَكون مَستخدمًا في مكان آخر، لكنّه الآن غير مَستدعى في moon city branch.

---

## 5. اختبار 7 صفحات (محلّيًّا على port=10003)

### Heading counts

| URL | H1 | H2 | H3 | bytes |
|---|---:|---:|---:|---:|
| `/en/moon-today-in-jeddah` | 1 | **45** ✅ | **19** ✅ | 237,935 |
| `/en/moon-today-in-riyadh` | 1 | **45** ✅ | **19** ✅ | 237,935 |
| `/en/moon-today-in-makkah` | 1 | **45** ✅ | **19** ✅ | 237,951 |
| `/en/moon-today-in-cairo` | 1 | **45** ✅ | **19** ✅ | 237,931 |
| `/en/moon-today-in-new-york` | 1 | **45** ✅ | **19** ✅ | 238,088 |
| `/en/moon-today-in-kuala-lumpur` | 1 | **45** ✅ | **19** ✅ | 238,263 |
| `/moon-today-in-jeddah` (AR) | 1 | **45** ✅ | **19** ✅ | 249,843 |

**قَبل** (production مُتَحقَّق): H1=1، H2=**117**، H3=**36**، bytes≈395,876

⇒ **7/7 صفحة سَلوكها مُتَطابق**.

---

## 6. عدد H2/H3 قبل/بعد

| Metric | قبل | بعد | Δ |
|---|---:|---:|---|
| **H1** | 1 | 1 | ✅ مَحفوظ |
| **H2** | **117** | **45** | **−62%** |
| **H3** | **36** | **19** | **−47%** |
| **Total bytes** | 395,876 | 237,935 | **−40%** |
| **Visible text chars** | 44,249 | 21,088 | **−52%** |

---

## 7. تَكرار الكلمات قبل/بعد على `/en/moon-today-in-jeddah`

| Keyword | قَبل (production) | بَعد (local) | Δ | الحُكم |
|---|---:|---:|---:|---|
| **Hijri** (lower+upper) | 82+2=**84** | 51+2=**53** | **−37%** | يَبقى core (Hijri date داخل page-moon — شَرعيّ) |
| **zakat** (lower+upper) | 24+13=**37** | 0+2=**2** | **−95%** 🎉 | leak اختَفى |
| **days** | **37** | **36** | −3% | داخل page-moon countdown — شَرعيّ |
| **prayer** (lower+upper) | 19+10=**29** | 8+8=**16** | **−45%** | sidebar nav يَبقى |
| **tasbih** (lower+upper) | 18+9=**27** | 0+1=**1** | **−96%** 🎉 | leak اختَفى |
| **azkar** (lower+upper) | 1+11=**12** | 0+1=**1** | **−92%** 🎉 | leak اختَفى |
| **dhikr** | **9** | **0** | **−100%** 🎉 | leak اختَفى تَمامًا |
| **Dhu** | 10 | **10** | 0% | داخل page-moon events — شَرعيّ |
| **moon** (lower+upper) | 67+96=**163** | 67+96=**163** | **0%** | ✅ **مَحفوظ تَمامًا** |
| **moon today** | 5 | **5** | 0% | ✅ مَحفوظ |
| **moon phase** | 9 | **9** | 0% | ✅ مَحفوظ |
| **moonrise** (lower+upper) | 4+6=**10** | 4+6=**10** | 0% | ✅ مَحفوظ |
| **moonset** (lower+upper) | 3+3=**6** | 3+3=**6** | 0% | ✅ مَحفوظ |
| **moon illumination** (lower+upper) | 1+3=**4** | 1+3=**4** | 0% | ✅ مَحفوظ |
| Jeddah | 6 | **6** | 0% | طبيعيّ |
| Waning | 10 | **10** | 0% | moon phase term — مَحفوظ |

⇒ **noise: -45% to -100% انخفاض** + **core moon terms: مَحفوظة 100%**.

---

## 8. تأكيد أنّ Title لم يَتغيّر

| | قَبل | بَعد |
|---|---|---|
| `/en/moon-today-in-jeddah` Title | `Moon Today in Jeddah \| Phase, Illumination and Age` | **مُطابق** ✅ |
| طول | 50 chars | **50 chars** ✅ |

(نَفس السلوك على باقي 5 EN cities + AR city)

---

## 9. تأكيد أنّ Meta Description لم يَتغيّر

```
Today's moon in Jeddah: current phase, illumination, moon age, moonrise
and moonset, next full moon, plus a link to the monthly moon calendar.
```

طول: 142 chars ✅ (مُطابق production)

---

## 10. تأكيد أنّ H1 لم يَتغيّر

| | قَبل | بَعد |
|---|---|---|
| H1 | `🌙 Moon Today in Jeddah` | **مُطابق** ✅ |
| H1 count | 1 | **1** ✅ |

---

## 11. تأكيد أنّ JSON-LD لم يَتغيّر

✅ **0 تَعديل** على JSON-LD blocks الـ موجودة في `#page-moon`. JSON-LD من الصفحات الـ stripped (إن وُجِد) يُزال مَع الـ wrappers — تَنظيف إضافيّ يَخدم SEO.

---

## 12. تأكيد أنّ حسابات القمر لم تَتغيّر

✅ **0 تَعديل** على:
- Moon phase calculation
- Moon illumination percentage
- Moon rise/set times
- Moon age / distance
- Hijri date calculation
- Islamic event countdown (مَوقعها داخل #page-moon — مَحفوظ)
- بيانات المُدن
- إحداثيّات

التَعديل **strip only** — حَذف عناصر HTML wrapper من SSR output. لا منطق حسابيّ.

---

## 13. تأكيد أنّ canonical/hreflang/sitemap لم تَتغيّر

✅ **0 تَعديل**:
- canonical pipeline (`server.js:1544` SITE_URL): لم يُلمَس
- hreflang generation: لم يُلمَس
- sitemap routes: لم تُلمَس
- robots.txt: لم يُلمَس
- routing: لم يُلمَس

---

## 14. تأكيد أنّ `/moon-today` الـ Hub لم تَتراجع بعد FIX-1

اختبار محلّيّ:
```
/moon-today  H2=43  H3=13
```

⇒ **مُطابق نَتائج FIX-1** (`0a5e373`). Hub strip يَستخدم `_MOON_HUB_STRIP_IDS` المُستقل، لا يَتعارض مَع `_MOON_CITY_STRIP_IDS` الجَديد.

---

## 15. تأكيد أنّ صفحات regression تَعمل 200

اختبار محلّيّ على 14 URL:

| URL | HTTP |
|---|:-:|
| `/` | 200 ✅ |
| `/en` | 200 ✅ |
| `/prayer-times-in-riyadh` | 200 ✅ |
| `/qibla-in-makkah` | 200 ✅ |
| `/qibla` | 200 ✅ |
| `/moon-today` | 200 ✅ |
| **`/moon-today-in-riyadh`** | **200 ✅** |
| **`/en/moon-today-in-riyadh`** | **200 ✅** |
| **`/moon-in-riyadh`** | **200 ✅** (يَستفيد أيضًا) |
| `/hijri-calendar` | 200 ✅ |
| `/today-hijri-date` | 200 ✅ |
| `/msbaha` | 200 ✅ |
| `/zakat-calculator` | 200 ✅ |
| `/azkar` | 200 ✅ |

⇒ **14/14 PASSED** — لا regression. **🎁 فائدة جانبيّة**: `/moon-in-{city}` أيضًا يَستفيد من الإصلاح لأنّ `_isMoonCityPageSsr` regex يَلتقط كلتا الـ routes (`/moon-today-in-*` و `/moon-in-*`).

---

## 16. cache-busters

| ملفّ | قَبل | بَعد |
|---|---|---|
| `sw.js` `CACHE_VERSION` | `'v404'` | **`'v405'`** ⬆ |
| `js/app.js?v=` | `?v=751` | يَبقى `?v=751` (لم يُلمَس JS) |
| `css/style.css?v=` | `?v=467` | يَبقى `?v=467` (لم يُلمَس CSS) |
| `_i18nVersion` | `190` | يَبقى `190` |

HTML `Cache-Control: no-cache` ⇒ SEOptimer يَرى التَنظيف فَورًا.

---

## 17. رسالة commit المُقترَحة

```
seo(moon): EN-MOON-TODAY-CITY-KEYWORD-CONSISTENCY-FIX-1 — strip leaked SPA pages from moon city SSR

Same SPA-shell-leak cleanup as MOON-TODAY-KEYWORD-CONSISTENCY-FIX-1
(0a5e373), but applied to /moon-today-in-{city} and /moon-in-{city}
across all 10 langs. Audit measured 117 H2 / 36 H3 on /en/moon-today-
in-jeddah (identical on Riyadh, Mecca, Cairo, New York, Kuala Lumpur,
AR /moon-today-in-jeddah) with Hijri 84x, zakat 37x, tasbih 27x,
prayer 29x, days 37x, azkar 12x — all leaked from 12 inactive SPA
wrappers because city pages were using the narrow
`_stripPagePrayerTimesOnly` helper (only stripped page-prayer-times).

Fix: new helper `_stripHtmlForMoonCity` with `_MOON_CITY_STRIP_IDS`
(1 prayer-times + same 12 wrappers as Hub fix). Replaced the call at
server.js:15971. moon-chart-section / moon-forecast / moon-faq-city /
moon-evergreen / moon-events-section: ALL PRESERVED — those are the
real moon city educational content.

Local verification on /en/moon-today-in-jeddah:
- H2: 117 -> 45 (-62%)
- H3: 36 -> 19 (-47%)
- bytes: 395,876 -> 237,935 (-40%)
- visible text: 44,249 -> 21,088 (-52%)
- Hijri: 84 -> 53 (-37%, still has page-moon hijri date — core)
- zakat: 37 -> 2 (-95%)
- tasbih: 27 -> 1 (-96%)
- azkar: 12 -> 1 (-92%)
- prayer: 29 -> 16 (-45%, sidebar nav remains)
- dhikr: 9 -> 0 (-100%)
- core moon terms (moon, Moon, moon today, moon phase, moonrise,
  moonset, moon illumination): PRESERVED 100%
- Title (T=50), Meta (D=142), H1 ("🌙 Moon Today in Jeddah"): UNCHANGED
- /moon-today Hub still clean (H2=43, H3=13 — FIX-1 result preserved)
- /moon-in-{city} also benefits (same regex)
- 14/14 regression URLs HTTP 200

ZERO change to: CSS, JS, i18n, qibla math, moon calculations, hijri
data, city coordinates, canonical, hreflang, sitemap, routing, title,
meta, H1, JSON-LD, SSR prefill values, /moon-today hub behaviour
(unaffected — uses separate _stripHtmlForMoonHub), prayer / qibla /
azkar / tools / hijri pages (unaffected).

Files: server.js (+60/-1) + sw.js (+31/-1) = 91 insertions, 2
deletions. Bumps CACHE_VERSION v404 -> v405. One fix benefits
~2,000 city pages (10 langs × ~200 cities × 2 route families
moon-today-in + moon-in).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## 18. ما تَمّ التَحقّق منه — Acceptance Criteria

| # | المعيار | حالة |
|---|---|---|
| 1 | helper جديد `_stripHtmlForMoonCity` مُنشأ | ✅ |
| 2 | `_MOON_CITY_STRIP_IDS` يَحوي 13 ID | ✅ |
| 3 | استدعاء استُبدِل في server.js:15971 | ✅ |
| 4 | 7 صفحات city: H2 117 → 45 (−62%) | ✅ |
| 5 | 7 صفحات city: H3 36 → 19 (−47%) | ✅ |
| 6 | Title T=50-56 مَحفوظ على EN + AR | ✅ |
| 7 | Meta D=141-148 مَحفوظ | ✅ |
| 8 | H1 "🌙 Moon Today in {City}" مَحفوظ | ✅ |
| 9 | JSON-LD مَحفوظ | ✅ |
| 10 | Core moon terms (moon/phase/rise/set/illumination/age): 100% مَحفوظة | ✅ |
| 11 | `/moon-today` Hub لم يَتراجع (H2=43 H3=13) | ✅ |
| 12 | `/moon-in-{city}` يَستفيد بنفس الإصلاح | ✅ |
| 13 | 14/14 regression URLs HTTP 200 | ✅ |
| 14 | `node --check server.js` exit 0 | ✅ |
| 15 | `node --check sw.js` exit 0 | ✅ |

---

## ⏳ في انتظار اعتمادك

أيّ من الخيارات:
1. **`أعتمد دفع تقرير: EN-MOON-TODAY-CITY-KEYWORD-CONSISTENCY-FIX-1`** ⇒ تَنفيذ git push
2. تَعديل قَبل الدفع
3. إلغاء التَعديل (`git restore server.js sw.js`)

ملاحظة ثابتة محفوظة: لا أَبدأ أيّ صفحة أذكار جديدة حتى تَعتمد `/azkar/prayer-azkar` بصريًّا.
