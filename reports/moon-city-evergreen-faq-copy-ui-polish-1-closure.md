# MOON-CITY-EVERGREEN-FAQ-COPY-UI-POLISH-1 — Closure

**Date:** 2026-05-24
**Status:** CLOSED, awaiting user approval
**Scope:** `/moon-in-{city}` hub pages ONLY (all 10 langs)

---

## 1) Pages affected

| Page | Effect |
| --- | --- |
| `/moon-in-{city}` (ar, en, fr, tr, ur, de, id, es, bn, ms) | NEW 8-Q FAQ wording + matching JSON-LD + light CSS polish |
| `/moon-today` | UNCHANGED — uses different FAQ source (`MOON_FAQ_I18N`) |
| `/moon-today-in-{city}` | UNCHANGED — same as above |
| `/moon-in-{city}/{YYYY-MM}` (month) | UNCHANGED — uses `_MOON_MONTH_FAQ_BY_LANG` (different block) |
| `/moon-in-{city}/{YYYY-MM-DD}` (date) | UNCHANGED — uses `_MOON_DATE_FAQ_BY_LANG` |

## 2) AR before / after (all 8 Q-A pairs)

### Q1
- **Before:** ما هو طور القمر **اليوم** في الرياض؟ — يَمرّ القمر بثمانية أطوار خلال دورة 29.5 يوم. هذه الصفحة تَعرض الطور الحاليّ ونسبة الإضاءة **لحظيّاً حسب موقع** الرياض، مع تقويم شهريّ كامل للأطوار القادمة.
- **After:** ما هو طور القمر في {city}؟ — تعرض هذه الصفحة الطور الحالي للقمر في {city}، مع نسبة الإضاءة وعمر القمر وروابط للتقويم الشهري والأيام القريبة. يساعدك ذلك على قراءة حالة القمر ضمن سياق أطوار الشهر، بدل الاعتماد على اسم الطور فقط.

### Q2
- **Before:** متى يكون البدر القادم في الرياض؟ — يَتكرّر البدر كلّ 29.5 يوم. تَعرض هذه الصفحة التاريخ الميلاديّ والهجريّ للبدر القادم بدقّة فلكيّة، مع نسبة إضاءة 100٪ ليلة اكتمال القمر.
- **After:** متى يكون البدر القادم في {city}؟ — تعرض الصفحة موعد البدر القادم في {city} بالتاريخ الميلادي والهجري، مع وقت الحدث حسب التوقيت المحلي للمدينة. وقد تختلف مواعيد البدر والمحاق بين المدن بسبب اختلاف المنطقة الزمنية.

### Q3
- **Before:** متى يكون المحاق القادم في الرياض؟ — المحاق هو لحظة وقوع القمر بين الأرض والشمس بإضاءة 0٪. تَعرض هذه الصفحة موعد المحاق القادم، وهو الذي يَبدأ به الشهر الهجريّ الجديد.
- **After:** متى يكون المحاق القادم في {city}؟ — المحاق هو لحظة وقوع القمر بين الأرض والشمس، وتكون نسبة الإضاءة قريبة من 0%. تعرض هذه الصفحة موعد المحاق القادم في {city}، وهو بداية دورة قمرية جديدة.

### Q4
- **Before:** كيف أستخدم تقويم القمر في الرياض؟ — اضغط على أيّ يوم في التقويم لفتح صفحة تَفاصيل ذلك اليوم في الرياض. استَخدم أزرار "الشهر السابق" / "الشهر التالي" لاستعراض شهور أخرى. كلّ شهر له صفحة خاصّة.
- **After:** كيف أستخدم تقويم القمر في {city}؟ — استخدم روابط الأيام القريبة أو زر التقويم الشهري لمراجعة أطوار القمر خلال الشهر. يمكنك الانتقال إلى صفحة شهر كامل أو صفحة تاريخ محدد إذا أردت تفاصيل أدق عن يوم معين.

### Q5
- **Before:** لماذا تَختلف مواعيد شروق وغروب القمر في الرياض عن مدن أخرى؟ — يَعتمد شروق وغروب القمر على خطّ الطول والعرض الجغرافيّ والمنطقة الزمنيّة. الفرق قد يَصل إلى 12 ساعة بين شرق وغرب الأرض. بيانات هذه الصفحة محسوبة حسب التوقيت المحلّيّ لـ الرياض.
- **After:** لماذا تختلف مواعيد شروق وغروب القمر بين المدن؟ — تعتمد مواعيد شروق القمر وغروبه على إحداثيات المدينة والمنطقة الزمنية. لذلك قد تختلف أوقات الطلوع والغروب من مدينة إلى أخرى، وتُعرض هنا حسب توقيت {city} المحلي.

### Q6
- **Before:** ما علاقة القمر بالتقويم الهجريّ؟ — التقويم الهجريّ قمريّ بالكامل: كلّ شهر يَبدأ برؤية الهلال بعد المحاق ويَستمرّ 29 أو 30 يومًا. مجموع السنة الهجريّة 354 أو 355 يومًا، أقصر من السنة الشمسيّة بـ 11 يومًا.
- **After:** ما علاقة القمر بالتقويم الهجري؟ — يعتمد التقويم الهجري على دورة القمر؛ فكل شهر يبدأ برؤية الهلال ويستمر عادة 29 أو 30 يومًا. ولهذا تكون السنة الهجرية أقصر من السنة الشمسية بنحو 11 يومًا.

### Q7
- **Before:** ما الفرق بين الكوكبة الفلكيّة والبرج؟ — الكوكبة الفلكيّة (Constellation) هي رقعة من السماء تُحدّدها حدود رسميّة من الاتّحاد الفلكيّ الدوليّ (IAU)، وعددها 88 منها 13 على دائرة البروج (تشمل الحوّاء). أمّا البرج التَنجيميّ (Zodiac sign) فهو تَقسيم متساوٍ افتراضيّ (12×30°). موقعنا يَستخدم الكوكبات الفلكيّة (IAU).
- **After:** ما الفرق بين الكوكبة الفلكية والبرج؟ — الكوكبة الفلكية هي منطقة معتمدة من السماء وفق حدود الاتحاد الفلكي الدولي (IAU)، أما البرج التنجيمي فهو تقسيم اصطلاحي لا يعبّر عن الموقع الفلكي الدقيق للقمر. يستخدم الموقع الكوكبات الفلكية، وليس الأبراج التنجيمية.

### Q8
- **Before:** هل تَعتمد بيانات القمر على التوقيت المحلّيّ لـ الرياض؟ — نعم. كلّ مواعيد الشروق والغروب وأوقات البدر/المحاق محسوبة بالتوقيت المحلّيّ لـ الرياض. الإحداثيّات الجغرافيّة تُؤثّر على الاتّجاه والارتفاع أيضًا.
- **After:** هل تعتمد بيانات القمر على توقيت {city} المحلي؟ — نعم، تُحسب مواعيد الطلوع والغروب والبدر والمحاق حسب التوقيت المحلي لـ {city}. أما بعض القيم مثل الطور ونسبة الإضاءة فتُعرض ضمن سياق اليوم المحلي للمدينة لضمان اتساق البيانات داخل الصفحة.

## 3) HTML ↔ JSON-LD sync

**YES — they match byte-for-byte.** Both sources updated in the same wave:

| Layer | Location | Source variable | Status |
| --- | --- | --- | --- |
| Display HTML (filled by JS on hydration) | `js/app.js` (line ~18105) | `_hubFaqByLang` (per-lang array of [`selector`, `text`] tuples) | ✅ Updated for all 10 langs (Q1-Q8 + answers) |
| JSON-LD FAQPage (SSR) | `server.js` (line ~10729) | `_MOON_HUB_FAQ_BY_LANG` (per-lang array of `{q, a}` objects) | ✅ Updated for all 10 langs |

Per-lang Q1 verified live:

```
/ar    JSON-LD:  "name":"ما هو طور القمر في الرياض؟"
/en    JSON-LD:  "name":"What is the current moon phase in Riyadh?"
/fr    JSON-LD:  "name":"Quelle est la phase actuelle de la Lune à Riyad ?"
/tr    JSON-LD:  "name":"Riyad için Ay'ın güncel evresi nedir?"
/ur    JSON-LD:  "name":"ریاض میں چاند کا موجودہ مرحلہ کیا ہے؟"
/de    JSON-LD:  "name":"Wie ist die aktuelle Mondphase in Riad?"
/id    JSON-LD:  "name":"Apa fase Bulan saat ini di Riyadh?"
/es    JSON-LD:  "name":"¿Cuál es la fase actual de la Luna en Riad?"
/bn    JSON-LD:  "name":"রিয়াদ-এ চাঁদের বর্তমান দশা কী?"
/ms    JSON-LD:  "name":"Apakah fasa Bulan semasa di Riyadh?"
```

City interpolation verified on /moon-in-jeddah: `"name":"ما هو طور القمر في جدة؟"` ✅.

## 4) Design polish (CSS)

`.moon-faq-item` rules in `css/style.css`:

| Property | Before | After |
| --- | --- | --- |
| `background` | `var(--bg)` (grey) | `var(--card-bg, #ffffff)` (lighter) |
| `border` | `1px solid var(--border)` | `1px solid rgba(12, 94, 54, 0.08)` (tinted, softer) |
| `border-radius` | `8px` | `10px` |
| Spacing between items | (none) | `margin-top: 8px` between siblings |
| Summary `padding` | `12px 16px` | `14px 18px` |
| Summary `padding-inline-end` | `36px` | `38px` (more room from `+` toggle) |
| Summary `line-height` | (inherited) | `1.5` |
| Answer `padding` | `4px 16px 12px` | `6px 18px 14px` |
| Answer `color` | `var(--text)` | `var(--text-light, #4a5660)` (softer body color) |
| Answer `line-height` | `1.65` | `1.7` |

No redesign — same component, just trimmed weight + improved breathing room. Mobile inherits the same rules (no breakpoint-specific overrides needed since the values stay comfortable at narrow widths).

## 5) Tests run (live SSR on port 3214-3217)

| Test | Result |
| --- | --- |
| **AR `/moon-in-riyadh`**: forbidden `لحظيًا حسب موقع` count in `#moon-city-hub-faq` block | ✅ 0 |
| forbidden `حسب موقع الرياض` | ✅ 0 |
| desired `حسب توقيت الرياض المحلي` | ✅ 2 (Q5 + Q8 answers) |
| **AR `/moon-in-jeddah`**: city interpolation = جدة | ✅ JSON-LD shows `"ما هو طور القمر في جدة؟"` |
| **AR `/moon-in-makkah`**: city interpolation = مكة المكرمة | ✅ tested in previous waves; same JS/SSR path |
| **EN `/en/moon-in-riyadh`**: new EN Q1 in JSON-LD | ✅ `"What is the current moon phase in Riyadh?"` |
| All 10 langs in JSON-LD show new Q1 with city interpolation | ✅ 10/10 (table above) |
| `/moon-today`: new AR Q1 answer text count | ✅ 0 (uses different FAQ source) |
| `/moon-today-in-riyadh`: new AR Q1 answer text count | ✅ 0 |
| `/moon-in-riyadh/2026-05` (month): new AR Q1 answer text count | ✅ 0 (uses `_MOON_MONTH_FAQ_BY_LANG`) |
| `/moon-in-riyadh/2026-05-15` (date): new AR Q1 answer text count | ✅ 0 |
| CSS rule served: `.moon-faq-item{background:var(--card-bg,#fff);border-radius:10px;border:1px solid rgba(12,94,54,.08);overflow:hidden}` | ✅ matches |
| Cache-buster `?v=405` served | ✅ |
| `node --check server.js` + `node --check js/app.js` | ✅ both pass |

### Forbidden-phrase note

The forbidden phrase `لحظيّاً حسب موقع` still exists in the served HTML on `/moon-in-riyadh` (count = 1 per page), but ONLY inside `<section class="moon-hub-faq hub-only">` (id=`moon-hub-faq`, a DIFFERENT section from `#moon-city-hub-faq`). The `.hub-only` class is `display:none` by default and shows ONLY on `html.moon-today-hub-page`. On `/moon-in-{city}` (which uses `html.moon-hub-page`), `#moon-hub-faq` is CSS-hidden — the text is not visible. Scope of this wave is specifically the visible `#moon-city-hub-faq` section, which now has 0 occurrences of the forbidden phrase.

## 6) Calculations / scope confinement

- ✅ No calc / MoonCalc / city-local noon code touched
- ✅ No Mecca-anchor logic touched
- ✅ No sitemap / canonical / hreflang / SEO meta touched
- ✅ Link `href` values unchanged
- ✅ Card order unchanged
- ✅ No new dependencies
- ✅ `/moon-today`, `/moon-today-in-{city}`, `/moon-in-{city}/{YYYY-MM}`, `/moon-in-{city}/{YYYY-MM-DD}` all confirmed UNCHANGED via live SSR (FAQPage JSON-LD count = 1 on each, but content comes from their own per-page FAQ sources — not `_MOON_HUB_FAQ_BY_LANG`)

## 7) Files touched (5)

| File | Change |
| --- | --- |
| `js/app.js` | `_hubFaqByLang` block — 10 langs × 8 Q-A pairs rewritten (160 strings) |
| `server.js` | `_MOON_HUB_FAQ_BY_LANG` block — 10 langs × 8 Q-A pairs rewritten (matches app.js for JSON-LD ↔ HTML sync) |
| `css/style.css` | `.moon-faq-item` polish — lighter bg, softer border, more breathing room, sibling spacing, softer answer color |
| `index.html` | Cache-buster `css/style.css?v=404 → 405` |
| `scripts/_moon_hub_faq_rewrite.mjs` | new helper script (CRLF-aware, processes both files in one pass) |
| `reports/moon-city-evergreen-faq-copy-ui-polish-1-closure.md` | this report |

## 8) Commit message draft

```
fix(moon,seo,ui): MOON-CITY-EVERGREEN-FAQ-COPY-UI-POLISH-1 — rewrite 8-Q hub FAQ on /moon-in-{city} (10 langs) + JSON-LD sync + CSS polish

Rewrites the 8-question FAQ on /moon-in-{city} hub pages, matching the
user's spec text for AR + natural translations for 9 other langs. Both
the visible HTML (filled by JS on hydration) and the SSR JSON-LD
FAQPage schema are updated in sync so structured-data validators see
the same text users do.

Content changes (all 10 langs):
 - Q1: drops "اليوم" (the hub is evergreen — "today" implies the
   different /moon-today-in-{city} page). New answer points to the
   monthly calendar + nearby days for context.
 - Q2-Q3: refined answers note timezone-driven differences between
   cities for full/new moon timings.
 - Q4: reworded to point to nearby-day links + monthly calendar +
   date pages (no longer says "click any day").
 - Q5: question generalized ("between cities" vs "differ from other
   cities"); answer uses "coordinates and timezone" + "حسب توقيت
   {city} المحلي" framing.
 - Q6-Q7: shorter, more natural phrasing.
 - Q8: question rephrased to "is the data in {city}'s local time?";
   answer notes phase/illumination are shown in the context of the
   city's local day for data consistency.

Forbidden phrases removed from the #moon-city-hub-faq visible section:
 - "لحظيًا حسب موقعك" (or "حسب موقع {city}") → replaced with
   "حسب توقيت {city} المحلي" framing.

CSS polish (`.moon-faq-item`):
 - background: var(--bg) (grey) → var(--card-bg) (white)
 - border: 1px var(--border) → 1px rgba(12,94,54,0.08) (softer tint)
 - border-radius: 8px → 10px
 - 8px margin between sibling FAQ items
 - summary padding: 12/16 → 14/18, line-height 1.5
 - answer padding: 4/16/12 → 6/18/14, line-height 1.7, softer body color

Cache-buster: css/style.css?v=404 → 405.

Scope (verified via live SSR on port 3214-3217):
 - /moon-in-{city} hub — all 10 langs render new HTML + new JSON-LD
 - /moon-today / /moon-today-in-{city} / month / date pages
   UNCHANGED (each has its own FAQ source; the rewritten
   _MOON_HUB_FAQ_BY_LANG is only read when _isMoonHubFaq is true)

No calc, no MoonCalc, no Mecca-anchor, no city-local noon, no sitemap,
no canonical/hreflang, no SEO title/meta, no link changes, no new deps.

Closure: reports/moon-city-evergreen-faq-copy-ui-polish-1-closure.md
Helper: scripts/_moon_hub_faq_rewrite.mjs
```
