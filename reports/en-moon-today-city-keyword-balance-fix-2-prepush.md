# EN-MOON-TODAY-CITY-KEYWORD-BALANCE-FIX-2 — تقرير ما قبل الدفع

**التاريخ**: 2026-06-01
**الحالة**: ✅ **جاهز للدفع** — في انتظار اعتمادك
**الخَيار**: Option D (Combined Light Balance — 3 fixes صغيرة)

---

## 1. الملفّات المُعَدَّلة

| ملفّ | عَدد الأَسطر | نَوع التَعديل |
|---|---:|---|
| `server.js` | +44 / -2 | Meta template + `{city}` post-i18n replacement + توثيق |
| `js/i18n.js` | +17 / -3 | 3 EN strings (moon.upcoming.title + moon.current_month_h2 + moon.chart_title) + توثيق |
| `sw.js` | +25 / -1 | `CACHE_VERSION` v406→v407 + توثيق |
| **الإجماليّ** | **+86 / -6** | 3 ملفّات |

✅ **0 تَعديل** على: `index.html` / `css/style.css` / `js/app.js` / curated data / sitemap / robots.txt / fonts / Moon math.

---

## 2. مَكان إصلاح `{city}` placeholder

**`server.js`** بعد `_translateI18nAttrs` (السطر ~20703):

```javascript
html = _translateI18nAttrs(html, seo.lang);

// EN-MOON-TODAY-CITY-KEYWORD-BALANCE-FIX-2
if (_isMoonCityPageSsr && seo.moonCity && seo.moonCity.name) {
    const _cityForI18n = String(seo.moonCity.name);
    html = html.replace(/\{city\}/g, _cityForI18n);
}
```

⇒ يَنطبق على كلّ moon city pages (`/moon-today-in-*`، `/moon-in-*/{YYYY-MM-DD}`، `/moon-in-*/{YYYY-MM}`). الـ Hub `/moon-today` غير مَتأثّر (`_isMoonCityPageSsr === false`).

---

## 3. النصّ القديم والجديد لـ H2

### H2 #4 (`moon.current_month_h2`)
| | EN | غير-EN |
|---|---|---|
| قَبل | `Moon Phases This Month` | لم تَتغيّر |
| بَعد | `Moon Phases in {city} This Month` → render: `Moon Phases in Medina This Month` | لم تَتغيّر |

### H2 #5 (`moon.upcoming.title`)
| | EN | غير-EN |
|---|---|---|
| قَبل | `🔮 Upcoming Moon Phases` | لم تَتغيّر |
| بَعد | `🔮 Upcoming Moon Phases in {city}` → render: `🔮 Upcoming Moon Phases in Medina` | لم تَتغيّر |

### H2 #6 (`moon.chart_title`)
| | EN | غير-EN |
|---|---|---|
| قَبل | `Moon Illumination Chart — 7 Days` | لم تَتغيّر |
| بَعد | `Moon Illumination in {city} — 7-Day Chart` → render: `Moon Illumination in Medina — 7-Day Chart` | لم تَتغيّر |

### H2 #12 (`moon.faq_city_title`) — **bug fix**
| | EN |
|---|---|
| قَبل (Production) | `Frequently Asked Questions about the Moon today in {city}` 🐛 |
| بَعد | `Frequently Asked Questions about the Moon today in Medina` ✅ |

(لم تُعَدَّل i18n strings — كلّها كانت تَحوي `{city}` placeholder؛ التَعديل سَيَسبدل `{city}` ⇒ city name تلقائيًّا عبر post-pipeline replacement)

---

## 4. Meta Description قبل/بعد + الطول

### قَبل (Production)
```
Today's moon in Medina: current phase, illumination, moon age, moonrise and moonset, next full moon, plus a link to the monthly moon calendar.
```
**D = 142 chars** ✅

### بَعد
```
Moon today in Medina: see current phase, illumination, moon age, moonrise, moonset, and Hijri date — plus the monthly calendar.
```
**D = 127 chars** ✅

---

## 5. طول Meta Description قبل/بعد

| المَدينة | قَبل D | بَعد D | الحُكم |
|---|---:|---:|---|
| Medina | 142 | **127** | ✅ في [120, 160] |
| Jeddah | 142 | **127** | ✅ |
| Riyadh | 142 | **127** | ✅ |
| Mecca | 141 | **126** | ✅ |
| Cairo | 141 | **126** | ✅ |
| New York | 144 | **129** | ✅ |
| Kuala Lumpur | 148 | **133** | ✅ |

(الأرقام أعلاه بـ chars الـ JS Length؛ الـ Bash يَحسب bytes UTF-8 — فقد تَختلف الأرقام بَين الأَدوات. كلتاهما في [120, 160] ✅)

---

## 6. قائمة H2 المُحَسَّنة بإضافة `in {City}`

| H2 # | i18n key | قَبل | بَعد (مَع Medina) |
|---|---|---|---|
| #4 | `moon.current_month_h2` | `Moon Phases This Month` | `Moon Phases in Medina This Month` |
| #5 | `moon.upcoming.title` | `🔮 Upcoming Moon Phases` | `🔮 Upcoming Moon Phases in Medina` |
| #6 | `moon.chart_title` | `Moon Illumination Chart — 7 Days` | `Moon Illumination in Medina — 7-Day Chart` |
| #12 | `moon.faq_city_title` | `...about the Moon today in {city}` 🐛 | `...about the Moon today in Medina` ✅ |

⇒ **4 H2 يَحوي اسم المدينة** (كان 0 قَبل) + **`Moon today in Medina` exact phrase: 1 → 7 occurrences**.

---

## 7. اختبار 7 EN cities + AR + Hub (محلّيًّا)

### 7 EN cities

| URL | T | D | `{city}` literal | الحُكم |
|---|---:|---:|---:|---|
| `/en/moon-today-in-medina` | 50 | **127** | **0** | ✅ |
| `/en/moon-today-in-jeddah` | 50 | **127** | **0** | ✅ |
| `/en/moon-today-in-riyadh` | 50 | **127** | **0** | ✅ |
| `/en/moon-today-in-makkah` | 56 | **126** | **0** | ✅ |
| `/en/moon-today-in-cairo` | 56 | **126** | **0** | ✅ |
| `/en/moon-today-in-new-york` | 52 | **129** | **0** | ✅ |
| `/en/moon-today-in-kuala-lumpur` | 56 | **133** | **0** | ✅ |

### AR /moon-today-in-medina (لم تَتغيّر)
- Title: `حالة القمر اليوم في المدينة المنورة | طور القمر والإضاءة` — مُطابق Production
- Meta: `حالة القمر اليوم في المدينة المنورة: الطور الحالي ونسبة الإضاءة، عمر القمر، شروق وغروب القمر، والبدر القادم، مع تقويم القمر الشهريّ.` — مُطابق
- `{city}` literal: **0** ✅ (تَمّ استبدالها أيضًا لأنّ الـ FAQ templates مُشتركة بَين اللغات — فائدة جانبيّة)

### `/moon-today` Hub (لم تَتأثّر)
- AR Hub Desc لم يَتغيّر ✅
- `{city}` literal على Hub = 15 (في comments + JS scripts — غير مَرئيّة وغير مُؤثّرة، نَفس Production)

---

## 8. تأكيد عدم ظهور `{city}` في HTML المَرئيّ على moon city pages

✅ **0 `{city}` literal** على كلّ 7 EN cities + AR city (مَوثَّق محلّيًّا).

⚠️ **ملاحظة مهنيّة**: الـ `{city}` على Hub `/moon-today` (15 occurrences) ما زال مَوجودًا — هذه في HTML comments + JS scripts (غير مَرئيّة، غير مُؤثّرة على SEO). الـ FIX-2 لم يَستهدف Hub لأنّ المُشكلة كانت على City pages فقط.

---

## 9. تأكيد أنّ Title لم يَتغيّر

✅ Title EN على 7 cities: مَحفوظ تَمامًا (T=50-57). لم يُلمَس code الـ Title.
✅ Title AR: مَحفوظ.

---

## 10. تأكيد أنّ H1 لم يَتغيّر

✅ H1 EN: `🌙 Moon Today in Medina` / `Jeddah` / إلخ — مَحفوظ تَمامًا.
✅ H1 AR: مَحفوظ.

---

## 11. تأكيد أنّ JSON-LD لم يَتغيّر

✅ JSON-LD blocks لا تَستخدم data-i18n keys المُعَدَّلة — تَأتي من `seo.moonCity.name` و `articleBody` builders في server.js (غير ضمن نِطاق التَعديل). 2 blocks مَوجودة على Production والآن أيضًا.

⚠️ تَحفُّظ: لو كان JSON-LD يَحوي `{city}` literal سابقًا (غير مُحتمَل لأنّ JSON-LD يُبنى بـ template literals مع cityDisplay)، الـ post-i18n replacement سَيُصلِحه أيضًا. تَحقَّقت محلّيًّا: JSON-LD نَظيف على Production الحاليّ، وسَيَبقى نَظيفًا بعد التَعديل.

---

## 12. تأكيد عدم تَغيير حسابات القمر

✅ **0 تَعديل** على:
- Moon phase calculation
- Moon illumination percentage
- Moon rise / set times
- Moon age / distance
- Hijri date calculation
- Gregorian date / city coordinates
- 14-Day Moon Forecast (data + structure)
- Islamic events countdown

التَعديل فقط على strings (Meta template + 3 i18n strings + 1 SSR placeholder replacement).

---

## 13. تأكيد عدم تَغيير canonical/hreflang/sitemap

✅ **0 تَعديل**:
- canonical pipeline (`server.js:1544`): لم يُلمَس
- hreflang generation: لم يُلمَس
- sitemap routes: لم تُلمَس
- robots.txt: لم يُلمَس
- routing: لم يُلمَس

---

## 14. تأكيد أنّ `/moon-today` Hub لم تَتأثّر

اختبار محلّيّ:
- Hub AR Title: `حالة القمر اليوم: الطور الحالي ومراحل القمر والتقويم الهجري` — **مُطابق production** ✅
- Hub AR Meta: D=155 — **مُطابق production** ✅
- Hub H2/H3 count: يَبقى 43/13 (FIX-1 مَحفوظ) ✅
- Hub `{city}` على Production = 15 (في comments/scripts غير مَرئيّة) — يَبقى مَع التَعديل (لأنّ Hub خارج نِطاق `_isMoonCityPageSsr`)

---

## 15. صفحات regression HTTP 200

اختبار محلّيّ على 14 URL:

| URL | HTTP |
|---|:-:|
| `/` | 200 ✅ |
| `/en` | 200 ✅ |
| `/prayer-times-in-riyadh` | 200 ✅ |
| `/qibla-in-makkah` | 200 ✅ |
| `/qibla` | 200 ✅ |
| `/moon-today` | 200 ✅ |
| `/moon-today-in-medina` | 200 ✅ |
| `/en/moon-today-in-medina` | 200 ✅ |
| `/moon-in-riyadh` | 200 ✅ |
| `/moon-in-riyadh/2026-06-03` | 200 ✅ |
| `/en/moon-in-riyadh/2026-06-03` | 200 ✅ |
| `/hijri-calendar` | 200 ✅ |
| `/msbaha` | 200 ✅ |
| `/azkar` | 200 ✅ |

⇒ **14/14 PASSED**.

**فائدة جانبيّة**: `/en/moon-in-{city}/2026-06-03` (FIX `4f3be72`) ما زال Meta=135، Hijri 'Dhu al-Hijjah 1447' في body=4 occurrences — مَحفوظ ✅.

---

## 16. cache-busters

| ملفّ | قَبل | بَعد |
|---|---|---|
| `sw.js` `CACHE_VERSION` | `'v406'` | **`'v407'`** ⬆ |
| `js/app.js?v=` | `?v=751` | يَبقى (لم يُلمَس JS) |
| `css/style.css?v=` | `?v=467` | يَبقى (لم يُلمَس CSS) |
| `_i18nVersion` | `190` | **يَبقى 190** (تَعديل js/i18n.js فقط على 3 EN strings — قد يَحتاج bump لو الـ client يَستخدم i18n.js مَع cache version. تَحقّق: i18n.js يُحَمَّل بدون version param في الـ <script> tags؟ يَحتاج تأكيد لو الـ client cache يَحتاج refresh) |

⚠️ **توصية**: bump `_i18nVersion` لـ 191 لو الـ JS i18n.js يُحَمَّل client-side مَع cache. السيرفر-side `_translateI18nAttrs` يَستخدم `js/i18n.js` كاش يُعاد تَحميله مع server restart (Render auto-restart بعد commit) ⇒ لا حاجة لـ bump.

---

## 17. رسالة commit المُقترَحة

```
seo(en-moon-city): EN-MOON-TODAY-CITY-KEYWORD-BALANCE-FIX-2 — fix city placeholder and strengthen city moon headings

Combined light balance for /en/moon-today-in-{city} pages, addressing
findings from EN-MOON-TODAY-CITY-KEYWORD-CONSISTENCY-FIX-2-AUDIT. Three
small, scoped fixes:

(1) {city} placeholder bug fix. Audit found 13 literal `{city}` tokens
in visible HTML on /en/moon-today-in-medina — 1 in #moon-faq-city-h2
"Frequently Asked Questions about the Moon today in {city}" and 12 in
moon-dq{1,illum,age,6,7,8} FAQ Q+A templates. The `_translateI18nAttrs`
helper translated the data-i18n key but never interpolated the {city}
placeholder. Fixed with a post-pipeline `html.replace(/\{city\}/g, ...)`
gated on `_isMoonCityPageSsr && seo.moonCity.name`. Replacement applies
to all langs (FAQ i18n strings are shared) — a free bonus cleanup.

(2) Meta Description rephrased to lead with the EXACT primary phrase
"Moon today in {City}" (matches Title + H1) instead of the possessive
"Today's moon in {City}". Adds the "Hijri date" keyword previously
absent in meta. New template: "Moon today in {City}: see current phase,
illumination, moon age, moonrise, moonset, and Hijri date — plus the
monthly calendar." Length 126-135 chars for typical cities, comfortably
in SEOptimer's [120, 160] sweet spot.

(3) Three EN-only H2 templates enriched with {city} placeholder in
js/i18n.js (the SSR replacement applies to them too):
- moon.current_month_h2: "Moon Phases This Month" → "Moon Phases in
  {city} This Month"
- moon.upcoming.title: "🔮 Upcoming Moon Phases" → "🔮 Upcoming Moon
  Phases in {city}"
- moon.chart_title: "Moon Illumination Chart — 7 Days" → "Moon
  Illumination in {city} — 7-Day Chart"

AR + 8 other langs i18n strings UNCHANGED (still ship without {city}
placeholder on these 3 H2s — they keep their existing wording).

Local verification on /en/moon-today-in-medina:
- {city} literal occurrences: 13 -> 0
- "Moon today in Medina" exact phrase: 1 -> 7 occurrences
- Meta D: 142 -> 127 (still in [120, 160])
- Title (T=50), H1 ("🌙 Moon Today in Medina"): UNCHANGED
- 7/7 EN cities D in [126, 135]
- AR /moon-today-in-medina: Title + Meta + H1 UNCHANGED
- /moon-today Hub: UNCHANGED (FIX-1 result preserved, H2=43 H3=13)
- /en/moon-in-{city}/{YYYY-MM-DD}: UNCHANGED (FIX `4f3be72` preserved,
  Hijri date still in body 4x)
- 14/14 regression URLs HTTP 200

ZERO change to: moon calculations, moon phase / illumination /
moonrise / moonset / age, Hijri/Gregorian dates, city data, canonical,
hreflang, sitemap, routing, JSON-LD (schema fields use seo.moonCity
fields not affected by string replace), CSS, app.js, /moon-today hub
behaviour. The `{phaseName}/{illum}/{age}/{time}/{distance}` placeholders
remain JS-hydrated as before (dynamic moon values).

Files: server.js (+44/-2) + js/i18n.js (+17/-3) + sw.js (+25/-1).
Bumps CACHE_VERSION v406 -> v407.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## 18. Acceptance Criteria

| # | المعيار | حالة |
|---|---|---|
| 1 | لا تَظهر `{city}` حَرفيًّا في HTML | ✅ 7 EN + 1 AR cities = 0 |
| 2 | FAQ H2 يَعرض اسم المدينة الحقيقيّ | ✅ "Medina" |
| 3 | Meta Description يَحوي "Moon today in {City}" | ✅ |
| 4 | Meta D في [120, 160] | ✅ 126-135 |
| 5 | Title لم يَتغيّر | ✅ |
| 6 | H1 لم يَتغيّر | ✅ |
| 7 | H2/H3 أكثر اتّساقًا | ✅ 4 H2 يَحوي "in {City}" (كان 0) |
| 8 | Core moon keywords مَحفوظة | ✅ |
| 9 | لا تَعود wrappers مُسرَّبة | ✅ 12/12 ABSENT |
| 10 | `/moon-today` Hub لم تَتأثّر | ✅ |
| 11 | حسابات القمر لم تَتغيّر | ✅ |
| 12 | canonical/hreflang/sitemap لم تَتغيّر | ✅ |
| 13 | 14 regression HTTP 200 | ✅ |

---

## ⏳ في انتظار اعتمادك

أيّ من الخيارات:
1. **`أعتمد دفع تقرير: EN-MOON-TODAY-CITY-KEYWORD-BALANCE-FIX-2`** ⇒ تَنفيذ git push
2. تَعديل قَبل الدفع
3. إلغاء التَعديل (`git restore server.js js/i18n.js sw.js`)

ملاحظة ثابتة محفوظة: لا أَبدأ أيّ صفحة أذكار جديدة حتى تَعتمد `/azkar/prayer-azkar` بصريًّا.
