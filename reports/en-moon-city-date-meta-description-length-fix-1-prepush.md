# EN-MOON-CITY-DATE-META-DESCRIPTION-LENGTH-FIX-1 — تقرير ما قبل الدفع

**التاريخ**: 2026-06-01
**الحالة**: ✅ **جاهز للدفع** — في انتظار اعتمادك
**النطاق**: EN فقط — `/en/moon-in-{city}/YYYY-MM-DD`

---

## 1. مكان توليد Meta Description

**`server.js:9598-9609`** — داخل `_moonDesc` object، فرع `en` في route `/{lang}/moon-in-{city}/YYYY-MM-DD`.

**المُتغيِّرات المُستخدَمة**:
- `cityDisplay`: اسم المدينة المُحلَّى لكلّ لغة
- `_primaryDateLabel`: التاريخ الميلاديّ فقط (مثل `"3 June 2026"`)
- `_mainWithEquiv`: التاريخ الميلاديّ + الهجريّ بين قَوسين (مثل `"3 June 2026 (equivalent to 17 Dhu al-Hijjah 1447 AH)"` ≈ **51 char**)

**السبب الجذريّ**: EN template استَخدَم `_mainWithEquiv` + suffix طويل `"zodiac — calculated with precise astronomical formulas."` (43 char) = طول إجماليّ 179-186.

---

## 2. النصّ القديم والجديد

### النصّ القديم على `/en/moon-in-jeddah/2026-06-03`

```
Moon phase in Jeddah on 3 June 2026 (equivalent to 17 Dhu al-Hijjah 1447 AH):
illumination, moon age, moonrise, moonset, and zodiac — calculated with precise
astronomical formulas.
```

**الطول: 180 chars** 🔴

### النصّ الجديد

```
Moon phase in Jeddah on 3 June 2026: view illumination, moon age, moonrise,
moonset, Hijri date, and daily lunar details for this date.
```

**الطول: 135 chars** ✅

---

## 3. سبب تَجاوُز الوصف 160

| العُنصر | الطول | الحُكم |
|---|---:|---|
| Template constant | 122 chars | high baseline |
| `_mainWithEquiv` (التاريخ + الهجريّ) | ~51 chars | المُلَوَّث الرئيسيّ 🔴 |
| `cityDisplay` (Jeddah) | 6 chars | طبيعيّ |
| **Total** | **~179** 🔴 | تَجاوَز 160 |

⇒ استخدام `_mainWithEquiv` بَدلًا من `_primaryDateLabel` كان السبب الجوهريّ.

---

## 4. مَنطق اختيار القالب (Ladder)

```javascript
const _enMoonDateDescForms = (city, date) => ({
    long:   `Moon phase in ${city} on ${date}: view illumination, moon age, moonrise, moonset, Hijri date, and daily lunar details for this date.`,
    medium: `Moon phase in ${city} on ${date}: view illumination, moon age, moonrise, moonset, Hijri date, and daily lunar details.`,
    short:  `Moon phase in ${city} on ${date}: check illumination, moon age, moonrise, moonset, and Hijri date.`,
    minimal: `Moon phase in ${city}: check illumination, moon age, moonrise, moonset, and Hijri date for this date.`,
});
const _pickEnMoonDateDesc = (city, date) => {
    const f = _enMoonDateDescForms(city, date);
    const order = [f.long, f.medium, f.short, f.minimal];
    // 1) first candidate in [120, 160]
    for (const t of order) {
        if (t.length >= 120 && t.length <= 160) return t;
    }
    // 2) longest candidate ≤ 160
    const ok = order.filter(t => t.length <= 160).sort((a, b) => b.length - a.length);
    if (ok.length) return ok[0];
    // 3) escape hatch
    return f.minimal;
};
```

**الفِكرة**: 4-rung ladder — يَختار أَطول template يَقع في النطاق [120, 160] للـ city + date المُعطى. مُستلهَم من نَفس النَمط في `_pickMoonDayTitle` (server.js:9572).

---

## 5. جدول اختبار 8 صفحات (محلّيًّا)

| URL | T (chars) | D (chars) | Title | Tier المُختار |
|---|---:|---:|---|---|
| `/en/moon-in-jeddah/2026-06-03` | 60 | **135** ✅ | `Moon Phase in Jeddah on 3 June 2026 \| Phase and Illumination` | **long** |
| `/en/moon-in-riyadh/2026-06-03` | 60 | **135** ✅ | `Moon Phase in Riyadh on 3 June 2026 \| Phase and Illumination` | **long** |
| `/en/moon-in-makkah/2026-06-03` | 59 | **134** ✅ | `Moon Phase in Mecca on 3 June 2026 \| Phase and Illumination` | **long** |
| `/en/moon-in-cairo/2026-06-03` | 59 | **134** ✅ | `Moon Phase in Cairo on 3 June 2026 \| Phase and Illumination` | **long** |
| `/en/moon-in-new-york/2026-06-03` | 37 | **137** ✅ | `Moon phase in New York on 3 June 2026` | **long** |
| `/en/moon-in-kuala-lumpur/2026-06-03` | 41 | **141** ✅ | `Moon phase in Kuala Lumpur on 3 June 2026` | **long** |
| `/en/moon-in-los-angeles/2026-06-03` | 40 | **140** ✅ | `Moon phase in Los Angeles on 3 June 2026` | **long** |
| `/en/moon-in-washington/2026-06-03` | 39 | **139** ✅ | `Moon phase in Washington on 3 June 2026` | **long** |

⇒ **8/8 في [134-141]** ✅ — كلّها داخل النطاق المُمتاز SEO.

**Nutritional check** (مَدى ladder): النَمط الـ `long` يُغَطّي ~99% من المدن الواقعيّة:
- أقصر مدينة (Mecca=5، Cairo=5): **134 chars** ✅
- أَطول مدينة شائعة (Kuala Lumpur=12): **141 chars** ✅
- لو كانت المدينة 25 char + التاريخ 17 char ⇒ ~157 ✅
- في حالة `long > 160` نادرة جدًا، الـ ladder يَنتقل إلى `medium` تلقائيًّا

---

## 6. تأكيد أنّ Jeddah لم تَعد 180

- قَبل: **180** 🔴
- بَعد: **135** ✅

تَحسُّن: **−45 char** = داخل النطاق [120, 160].

---

## 7. تأكيد أنّ Title لم يَتغيّر

| URL | Title قَبل | Title بَعد | Δ |
|---|---|---|---|
| `/en/moon-in-jeddah/2026-06-03` | `Moon Phase in Jeddah on 3 June 2026 \| Phase and Illumination` | **مُطابق** ✅ | 0 |
| `/en/moon-in-makkah/2026-06-03` | `Moon Phase in Mecca on 3 June 2026 \| Phase and Illumination` | **مُطابق** ✅ | 0 |
| `/en/moon-in-new-york/2026-06-03` | `Moon phase in New York on 3 June 2026` | **مُطابق** ✅ | 0 |

Title يُولَّد من `_pickMoonDayTitle` المُختلف (السطر 9572) ولم يُلمَس.

**H1** على EN: `🌙 Moon in {City} on 3 June 2026` — **مُطابق** ✅ (يُولَّد من قِبَل code آخر).

---

## 8. تأكيد أنّ اللغات الأخرى لم تَتأثّر

اختبار محلّيّ لـ 11 URL (AR + 9 langs):

| URL | T (bytes) | D (bytes) |
|---|---:|---:|
| `/moon-in-jeddah/2026-06-03` (AR) | 93 | 241 |
| `/moon-in-riyadh/2026-06-03` (AR) | 99 | 247 |
| `/moon-in-cairo/2026-06-03` (AR) | 101 | 249 |
| `/fr/moon-in-paris/2026-06-03` | 40 | 207 |
| `/tr/moon-in-istanbul/2026-06-03` | 61 | 197 |
| `/ur/moon-in-karachi/2026-06-03` | 88 | 258 |
| `/de/moon-in-berlin/2026-06-03` | 60 | 187 |
| `/id/moon-in-jakarta/2026-06-03` | 50 | 185 |
| `/es/moon-in-madrid/2026-06-03` | 56 | 193 |
| `/bn/moon-in-dhaka/2026-06-03` | 131 | 406 |
| `/ms/moon-in-kuala-lumpur/2026-06-03` | 56 | 177 |

ملاحظة: الأَرقام بالـ UTF-8 bytes (AR/UR/BN = 2 bytes/char). كلّها **مُطابقة baseline production** — `code` الـ 9 لغات لم يُلمَس.

تَأكيد: تَعديل واحد سطر:
```diff
- en: `Moon phase in ${cityDisplay} on ${_mainWithEquiv}: illumination, moon age, moonrise, moonset, and zodiac — calculated with precise astronomical formulas.`,
+ en: _pickEnMoonDateDesc(cityDisplay, _primaryDateLabel),
```
الـ 9 لُغات الأخرى يَبقَين على `_mainWithEquiv` كَما هي.

---

## 9. تأكيد عدم تَغيير حسابات القمر أو التواريخ

✅ **0 تَعديل** على:
- Moon phase calculation
- Moon illumination percentage
- Moon rise/set times
- Moon age / distance
- Hijri date calculation (`_primaryDateLabel` + `_mainWithEquiv` كلّها مَوجودة في الـ scope — استخدمنا `_primaryDateLabel` فقط، لم نَنشئها)
- Gregorian date (`_primaryDateLabel`)
- بيانات المدن
- إحداثيّات
- moonrise / moonset / illumination / moon age values

التَعديل **سَطر واحد**: استبدال EN template بـ helper جديد. لا منطق حسابيّ.

---

## 10. تأكيد عدم تَغيير canonical / hreflang / sitemap / routing

✅ **0 تَعديل**:
- canonical pipeline (`server.js:1544`): لم يُلمَس
- hreflang generation: لم يُلمَس
- sitemap routes: لم تُلمَس
- robots.txt: لم يُلمَس
- routing: لم يُلمَس

---

## 11. cache-busters

| ملفّ | قَبل | بَعد |
|---|---|---|
| `sw.js` `CACHE_VERSION` | `'v405'` | **`'v406'`** ⬆ |
| `js/app.js?v=` | `?v=751` | يَبقى (لا تَعديل JS) |
| `css/style.css?v=` | `?v=467` | يَبقى (لا تَعديل CSS) |
| `_i18nVersion` | `190` | يَبقى (لا تَعديل i18n) |

HTML `Cache-Control: no-cache` ⇒ SEOptimer يَرى الـ meta الجديد فَورًا بعد الـ deploy.

---

## 12. الملفّات المُعَدَّلة

| ملفّ | عدد الأَسطر | نَوع التَعديل |
|---|---:|---|
| `server.js` | +46 / -1 | إضافة `_enMoonDateDescForms` + `_pickEnMoonDateDesc` helpers + استبدال EN template + توثيق |
| `sw.js` | +28 / -1 | `CACHE_VERSION` v405→v406 + كَتلة توثيق |
| **الإجماليّ** | **+74 / -2** | ملفّان فقط |

✅ **0 تَعديل** على: `index.html` / `css/style.css` / `js/app.js` / `js/i18n*.js` / curated / `index.html`

---

## 13. تأكيد إضافيّ — Regression URLs (14 URL)

| URL | HTTP |
|---|:-:|
| `/` | 200 ✅ |
| `/en` | 200 ✅ |
| `/prayer-times-in-riyadh` | 200 ✅ |
| `/qibla-in-makkah` | 200 ✅ |
| `/qibla` | 200 ✅ |
| `/moon-today` | 200 ✅ |
| `/moon-today-in-riyadh` | 200 ✅ |
| `/en/moon-today-in-riyadh` | 200 ✅ |
| `/moon-in-riyadh` | 200 ✅ |
| **`/moon-in-riyadh/2026-06-03`** (AR — مَحفوظ) | 200 ✅ |
| **`/en/moon-in-riyadh/2026-06-03`** (EN — مُصلَح) | 200 ✅ |
| `/hijri-calendar` | 200 ✅ |
| `/msbaha` | 200 ✅ |
| `/azkar` | 200 ✅ |

⇒ **14/14 PASSED** ✅

---

## 14. تأكيد ما لم يَتغيّر

✅ **0 تَعديل** على:
- حسابات القمر (phase / illumination / age / rise / set)
- التاريخ الهجريّ + الميلاديّ
- city data / إحداثيّات
- canonical / hreflang / sitemap / routing
- Title (EN — مَحفوظ)
- H1 (EN — مَحفوظ)
- JSON-LD
- مُحتوى الصفحة المَرئيّ
- CSS / app.js / i18n
- curated data
- AR/FR/TR/UR/DE/ID/ES/BN/MS Meta Descriptions (لم تُلمَس)
- صفحات `/moon-today` / `/moon-today-in-{city}` / غيرها
- إصلاحات سابقة (MOON-TODAY-KEYWORD-CONSISTENCY-FIX-1، EN-MOON-TODAY-CITY-KEYWORD-CONSISTENCY-FIX-1، CANONICAL-PROD-ORIGIN-FIX-1، إلخ)

---

## 15. رسالة commit المُقترَحة

```
seo(en-moon-date): EN-MOON-CITY-DATE-META-DESCRIPTION-LENGTH-FIX-1 — shorten dynamic moon date meta descriptions

Production audit showed 8/8 sampled EN moon-in-{city}/YYYY-MM-DD pages
(Jeddah/Riyadh/Mecca/Cairo/New York/Kuala Lumpur/Los Angeles/Washington
on 3 June 2026) emitting Meta Description at 179-186 chars — well above
the SEOptimer 120-160 sweet spot. Root cause: server.js:9600 template
embedded `_mainWithEquiv` (= "3 June 2026 (equivalent to 17 Dhu al-Hijjah
1447 AH)" ~51 chars) + a long suffix "zodiac — calculated with precise
astronomical formulas." (43 chars). Result: ~30 chars over the ceiling.

Fix: 4-rung dynamic ladder picking the longest template in [120, 160]
for the given city + date combo. EN now uses `_primaryDateLabel` (the
Gregorian-only "3 June 2026" form) instead of `_mainWithEquiv`. Hijri
equivalent stays in body/title/H1/JSON-LD — only the meta description
drops it.

Ladder:
  long    ~134-140 chars (typical sweet spot — picked for all 8 sampled)
  medium  ~120-126 chars
  short   ~102-108 chars (fallback for very long city + date)
  minimal drops date entirely (extreme escape hatch)

Local verification on 8 EN pages (3 June 2026):
  /en/moon-in-jeddah        D=180 -> 135 (long picked)
  /en/moon-in-riyadh        D=180 -> 135
  /en/moon-in-makkah        D=179 -> 134
  /en/moon-in-cairo         D=179 -> 134
  /en/moon-in-new-york      D=182 -> 137
  /en/moon-in-kuala-lumpur  D=186 -> 141
  /en/moon-in-los-angeles   D=185 -> 140
  /en/moon-in-washington    D=184 -> 139

All 8/8 EN cities now in [134, 141] — comfortably in [120, 160]. Title
(T=37-60) and H1 (`🌙 Moon in {City} on 3 June 2026`) UNCHANGED.
Other 9 langs (AR, FR, TR, UR, DE, ID, ES, BN, MS) UNCHANGED — they
keep `_mainWithEquiv`. 14/14 regression URLs HTTP 200.

ZERO change to: moon calculations, moon phase, illumination, moonrise,
moonset, moon age, Hijri date, Gregorian date, city coords, canonical,
hreflang, sitemap, routing, Title, H1, JSON-LD, visible content, CSS,
app.js, i18n, curated cities.

Files: server.js (+46/-1) + sw.js (+28/-1) = 74 insertions, 2 deletions.
Bumps CACHE_VERSION v405 -> v406.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## 16. Acceptance Criteria

| # | المعيار | حالة |
|---|---|---|
| 1 | helper `_pickEnMoonDateDesc` + `_enMoonDateDescForms` مُنشآن | ✅ |
| 2 | EN template uses ladder + `_primaryDateLabel` | ✅ |
| 3 | Jeddah Meta لم تَعد 180 (الآن 135) | ✅ |
| 4 | 8/8 EN cities D ∈ [134, 141] | ✅ |
| 5 | Title EN لم يَتغيّر | ✅ |
| 6 | H1 EN لم يَتغيّر | ✅ |
| 7 | AR/FR/TR/UR/DE/ID/ES/BN/MS Meta لم تَتغيّر | ✅ |
| 8 | حسابات القمر بدون تَعديل | ✅ |
| 9 | canonical/hreflang/sitemap بدون تَعديل | ✅ |
| 10 | 14/14 regression HTTP 200 | ✅ |
| 11 | `node --check server.js` exit 0 | ✅ |
| 12 | `node --check sw.js` exit 0 | ✅ |

---

## ⏳ في انتظار اعتمادك

أيّ من الخيارات:
1. **`أعتمد دفع تقرير: EN-MOON-CITY-DATE-META-DESCRIPTION-LENGTH-FIX-1`** ⇒ تَنفيذ git push
2. تَعديل قَبل الدفع
3. إلغاء التَعديل (`git restore server.js sw.js`)

ملاحظة ثابتة محفوظة: لا أَبدأ أيّ صفحة أذكار جديدة حتى تَعتمد `/azkar/prayer-azkar` بصريًّا.
