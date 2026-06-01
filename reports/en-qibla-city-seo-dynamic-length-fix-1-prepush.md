# تقرير ما قبل الدفع: EN-QIBLA-CITY-SEO-DYNAMIC-LENGTH-FIX-1

**التاريخ**: 2026-06-01  
**الـ HEAD المنوي بناؤه عليه**: `94b744a` (EN-CITY-PRAYER-META-DESCRIPTION-LENGTH-FIX-1 المرفوع، انتظار wakeup)  
**النوع**: SEO-only — Title ladder + Desc ladder لـ EN qibla city pages

---

## 1. الملفّ / الدالّة المسؤولة

**الموقع**: `server.js:8768-8902` (تقريبًا) — الكتلة التي تَتولّى `/qibla-in-{city}` routes  
**Title maps**: `_qTitles` (Full)، `_qTitlesMedium` (Medium)، `_qTitlesShort` (Short) — مَوجود مسبقًا  
**Desc map**: `_qDescs` — كان كائنًا واحدًا بنصّ ثابت لكلّ لغة  
**Selector**: inline if/else ladder (sequential length checks)

---

## 2. منطق اختيار title حسب الطول (الجديد)

**الـ ladder الجديد** (4 tiers لـ EN):

| Tier | EN Template | Cairo length |
|---|---|---|
| **Full** | `Qibla Direction in {City} \| Kaaba Compass and Accurate Qibla Finder` | 66 |
| **MediumPlus** (NEW) | `Qibla Direction in {City} Today \| Accurate Kaaba Compass` | **55** |
| **Medium** | `Qibla Direction in {City} \| Accurate Kaaba Compass` | 49 |
| **Short** | `Qibla Direction in {City} \| Kaaba Compass` | 40 |

**Selector logic** (مُحَدَّث):
```javascript
if (full ∈ [50,60]) → full
else if (mediumPlus ∈ [50,60]) → mediumPlus   ← NEW tier
else if (medium ∈ [50,60]) → medium
else if (full > 60 && medium > 60) → short
else if (short < 50) → medium
else → (full ≤ 60 ? full : short)
```

**Cairo trace** (5-char city):
- Full=66 (>60) → SKIP
- **MediumPlus=55 (∈[50,60]) → PICK** ✅ (49 → 55، solved!)

**Kuala Lumpur trace** (12-char city):
- Full=73 → SKIP
- MediumPlus=62 → SKIP
- **Medium=56 (∈[50,60]) → PICK** ✅

**Other 9 langs (ar/fr/tr/ur/de/id/es/bn/ms)**: `_qTitlesMediumPlus` يُعيد نفس قيمة `_qTitlesMedium` لها ⇒ السلوك مُحَفَّظ بالكامل.

---

## 3. منطق اختيار meta description حسب الطول (الجديد)

**EN-only ladder** (2 tiers):

| Tier | Template | Constant length |
|---|---|---|
| **Long** (current) | `Find the Qibla direction in {City} accurately using a Kaaba compass and interactive map based on your location, with the Qibla bearing and distance to Mecca.` | 151 + city |
| **Medium** (NEW) | `Find the Qibla direction in {City}, {Country} with an accurate Kaaba compass, bearing angle, distance to Makkah, and prayer-related tools.` | 123 + city + country |

**Selector**:
```javascript
if (long ∈ [120,160]) → long
else if (medium ∈ [120,160]) → medium
else → (medium ∈ [100,160] ? medium : long)
```

**Cairo** (5-char): long=156 ✅ → uses long  
**Kuala Lumpur** (12-char): long=163 (>160) → medium=143 ✅ uses medium  
**Washington** (10-char): long=161 (>160) → medium=146 ✅ uses medium  
**Los Angeles** (11-char): long=162 (>160) → medium=147 ✅ uses medium  

**Other 9 langs**: keep existing `_qDescs[lang]` single-template behavior.

---

## 4-5. قائمة templates

(انظر القسم 2 لـ titles + القسم 3 لـ descriptions)

---

## 6. جدول اختبار 10 مدن EN (محلّيّ، PORT=3039)

| URL | Title (len) | Desc (len) | Title فيها؟ | Desc فيها؟ |
|---|---|---|---|---|
| `/en/qibla-in-cairo` | Qibla Direction in Cairo Today \| Accurate Kaaba Compass (**55**) | Find the Qibla direction in Cairo accurately... (**156**) | ✅ | ✅ |
| `/en/qibla-in-riyadh` | ...Riyadh Today... (**56**) | ...Riyadh accurately... (**157**) | ✅ | ✅ |
| `/en/qibla-in-jeddah` | ...Jeddah Today... (**56**) | ...Jeddah accurately... (**157**) | ✅ | ✅ |
| `/en/qibla-in-makkah` (→Mecca) | ...Mecca Today... (**55**) | ...Mecca accurately... (**156**) | ✅ | ✅ |
| `/en/qibla-in-new-york` | ...New York Today... (**58**) | ...New York accurately... (**159**) | ✅ | ✅ |
| `/en/qibla-in-kuala-lumpur` | ...Kuala Lumpur \| Accurate... (**56**) | ...Kuala Lumpur, Malaysia with an accurate... (**143**) | ✅ (medium) | ✅ (medium) |
| `/en/qibla-in-los-angeles` | ...Los Angeles \| Accurate... (**55**) | ...Los Angeles, United States... (**147**) | ✅ (medium) | ✅ (medium) |
| `/en/qibla-in-washington` | ...Washington Today \| Accurate... (**60**) | ...Washington, United States... (**146**) | ✅ | ✅ (medium) |
| `/en/qibla-in-jakarta` | ...Jakarta Today... (**57**) | ...Jakarta accurately... (**158**) | ✅ | ✅ |
| `/en/qibla-in-rabat` | ...Rabat Today... (**55**) | ...Rabat accurately... (**156**) | ✅ | ✅ |

**10/10 PASS** — كلّ Title في [50, 60] + كلّ Desc في [120, 160] ✅

---

## 7. تأكيد أنّ Cairo title أصبح داخل النطاق

✅ **Cairo Title**: 49 chars (`Qibla Direction in Cairo | Accurate Kaaba Compass`) → **55 chars** (`Qibla Direction in Cairo Today | Accurate Kaaba Compass`)

- داخل النطاق المَطلوب [50, 60]
- المُشكلة المُبَلَّغة من SEOptimer (Title=49، تحت 50) محلولة بإضافة "Today" — صياغة طبيعيّة، بدون keyword stuffing.

---

## 8. تأكيد أنّ الصفحة العربيّة لم تَتأثّر

**AR negative test** محلّيّ:
- `/qibla-in-cairo` AR title: `اتجاه القبلة في القاهرة | بوصلة الكعبة وتحديد القبلة بدقة` ⇐ مَطابق للأصل
- `/qibla-in-cairo` AR desc: `اعرف اتجاه القبلة في القاهرة بدقة باستخدام بوصلة الكعبة وخريطة تفاعلية...` ⇐ مَطابق للأصل
- `/qibla-in-riyadh` AR: نفس الشيء — مَطابق

✅ **AR ثابتة بالحرف** — الـ `_qTitlesMediumPlus.ar = _qTitlesMedium.ar` (لا تَعديل في النصّ، الـ ladder يَختار نفس الـ tier السابق). الـ EN-only branch في desc selector لا يُؤثّر على غير-EN.

**8 لغات أخرى** (fr/tr/ur/de/id/es/bn/ms): نفس النمط — `_qTitlesMediumPlus[lang] = _qTitlesMedium[lang]` ⇒ صفر تَغيُّر سلوكيّ.

---

## 9. تأكيد أنّ معادلة القبلة والبيانات لم تَتغيّر

✅ **صفر تَعديل في**:
- `js/qibla.js` (`Qibla.calculate`، `Qibla.getDistance`، `Qibla.getDirection`)
- Kaaba reference (21.4225, 39.8262)
- city data (إحداثيّات، أسماء)
- `_qiblaAngle`، `_distance`، `_bearingExact` في server.js (مَوجودة لكنّ المَنطق نفسه)
- QIBLA-CITY-SSR-INFO-GRID-PREFILL-FIX-1 السابقة (`#qibla-info-grid` SSR prefill) — مَحفوظة كاملًا

---

## 10. تأكيد عدم تَغيير canonical/hreflang/sitemap/routing

✅ **صفر تَعديل في**:
- canonical URL (لا تَعديل في `seo.canonical` أو URL generation)
- hreflang tags (`arUrl`، `enUrl`، إلخ.)
- sitemap.xml (لا تَعديل في `bilingualUrl()` أو staticPaths)
- routing (لا تَعديل في `/qibla-in-{city}` regex matching)
- H1 + محتوى الصفحة (الـ Q-A SEO blocks في server.js:19770+ مَحفوظة)
- JSON-LD (FAQPage + Place schemas مَحفوظة)

---

## 11. cache-busters

| المفتاح | قبل | بعد |
|---|---|---|
| `sw.js CACHE_VERSION` | 'v399' (live على EN-PRAYER-META) | **'v400'** (مَفتاح بكر — للتَوثيق فقط) |
| `css/style.css?v=` | 467 | 467 (لا تغيير) |
| `js/app.js?v=` | 751 | 751 (لا تغيير) |
| `_i18nVersion` | 190 | 190 (لا تغيير) |
| `js/prayer-times.js?v=` | 53 | 53 (لا تغيير) |

**ملاحظة**: HTML response له `Cache-Control: no-cache` → النصّ الجديد للـ Title و Description يَصِل المستخدم فورًا بعد deploy. الـ sw bump هو للتَوثيق + الـ deploy traceability فقط.

---

## 12. رسالة الـ commit المقترَحة

```
seo(en-qibla-city): EN-QIBLA-CITY-SEO-DYNAMIC-LENGTH-FIX-1 — add length-aware title + desc ladders

SEOptimer reported Title=49 chars on /en/qibla-in-cairo (current Medium
template "Qibla Direction in Cairo | Accurate Kaaba Compass" — just 1
char below the 50-char SEO floor). Root cause: Cairo's short city name
(5 chars) makes Full=66 (>60) and Medium=49 (<50), and the existing
3-tier ladder (Full→Medium→Short) has a gap.

Title fix: Add a 4th tier "MediumPlus" for EN-only that inserts "Today"
after the city name. Cairo: 49 → 55 ✅. Other tiers unchanged. Other 9
langs reuse Medium as MediumPlus → no behavior change.

Desc fix: Add EN-only length-aware ladder. The existing long form
(151+city chars) overflows 160 for cities ≥ 10 chars (Kuala Lumpur=163,
Washington=161, Los Angeles=162). Adds a Medium form (123+city+country)
that fits 120-160 for typical long-city combos. Selector tries long
first; falls to medium if long > 160. Other 9 langs unchanged.

Tested 10 EN cities (cairo/riyadh/jeddah/makkah/new-york/kuala-lumpur/
los-angeles/washington/jakarta/rabat) — all Titles land in [50, 60]
and all Descs in [120, 160].

ZERO change to: H1, Qibla formula (js/qibla.js), Kaaba angle, distance
to Mecca, city coordinates, canonical, hreflang, sitemap, routing, AR
behavior, or 8-other-lang behavior.

Files modified: server.js (+~70 lines: new MediumPlus map + selector
tier + EN desc ladder + doc) + sw.js (this comment + version bump
v399→v400 for deploy traceability — HTML is no-cache so users see new
title/desc immediately).

Expected impact: SEOptimer Title Tag check turns from ❌ to ✅ on
/en/qibla-in-cairo and similar short-city EN qibla pages.
```

---

## تأكيدات نهائيّة قبل الدفع — للاعتماد

| # | البند | الحالة |
|---|---|---|
| 1 | EN-only change — server.js title MediumPlus tier + EN desc ladder | ✅ |
| 2 | Cairo Title: 49 → 55 chars (في النطاق [50,60]) | ✅ |
| 3 | 10 مدن EN: 10/10 Title في [50,60] + 10/10 Desc في [120,160] | ✅ |
| 4 | AR + 8 لغات أخرى غير مَتأثّرة (نَصّ مَطابق) | ✅ |
| 5 | `js/qibla.js` formula + city data + canonical/sitemap/hreflang/routing: صفر تَعديل | ✅ |
| 6 | `node --check server.js + sw.js` نظيف | ✅ |
| 7 | 8 صفحات regression HTTP 200 (msbaha/moon/prayer-times/en-prayer/hijri/zakat/azkar/qibla-hub) | ✅ |
| 8 | cache-busters: sw v399→v400 فقط (HTML no-cache → users see immediately) | ✅ |
| 9 | غير مدفوع — في انتظار اعتمادك | ⏳ |

---

## في انتظار اعتمادك

عند ورود الاعتماد بصيغة:
> `أعتمد دفع تقرير: EN-QIBLA-CITY-SEO-DYNAMIC-LENGTH-FIX-1`

سأُنفّذ:
1. `git add server.js sw.js reports/en-qibla-city-seo-dynamic-length-fix-1-prepush.md`
2. `git commit` بالنصّ في القسم 12
3. `git push origin main`
4. `ScheduleWakeup` ≥ 5 دقائق

ملاحظة ثابتة محفوظة: لا أَبدأ أيّ صفحة أذكار جديدة حتى تَعتمد `/azkar/prayer-azkar` بصريًّا.
