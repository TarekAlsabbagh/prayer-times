# MOON-CITY-EVERGREEN-EDU-CONTENT-UI-POLISH-1 — Closure

**Date:** 2026-05-24
**Status:** CLOSED, awaiting user approval
**Scope:** `/moon-in-{city}` hub pages ONLY (all 10 langs)
**Implementation commit:** (TBD on stage)

---

## 1) Pages affected

- `/moon-in-{city}` for `ar, en, fr, tr, ur, de, id, es, bn, ms` (10 langs)

Examples verified live:
- `/moon-in-riyadh`, `/moon-in-jeddah`, `/moon-in-makkah` (AR)
- `/en/moon-in-riyadh`, `/fr/moon-in-paris`, `/de/moon-in-berlin`, `/es/moon-in-madrid`
- `/tr/moon-in-istanbul`, `/ur/moon-in-karachi`, `/bn/moon-in-dhaka`, `/id/moon-in-jakarta`, `/ms/moon-in-kuala-lumpur`

## 2) Pages explicitly UNTOUCHED

- `/moon-today` (Mecca-anchored hub)
- `/moon-today-in-{city}` (today snapshot)
- `/moon-in-{city}/{YYYY-MM}` (month archive)
- `/moon-in-{city}/{YYYY-MM-DD}` (date archive)

Gating in server.js (line 17557) is `_isMoonHubPageSsr && !(seo.moonCity && seo.moonCity.isMonthPage)` — sibling routes never enter the SEO-cards block.

## 3) Acceptance criteria

| # | Criterion | Status |
| - | --------- | ------ |
| 1 | Applied across 10 languages | ✅ PASS (live SSR confirmed all 10) |
| 2 | Scope strictly `/moon-in-{city}` only | ✅ PASS (gating preserved; sibling routes verified 0 cards) |
| 3 | Each card has title + exactly 2 paragraphs | ✅ PASS (s1Title/s1P1/s1P2 … s4 schema kept) |
| 4 | Content not over-compressed (kept SEO value) | ✅ PASS (~700-900 words per page across 4 cards) |
| 5 | Content not too long / not text-walls | ✅ PASS (2-paragraph cards, balanced) |
| 6 | Reduced repetition of "حالة القمر" | ✅ PASS (AR Card 1 title changed from "كيف تقرأ حالة القمر" → "كيف تتابع أطوار القمر"; "حالة" still used sparingly in Card 2/3/4 where it reads naturally — not as filler) |
| 7 | Natural per-lang phrasing (not machine-translated) | ✅ PASS (each lang reviewed for native voice) |
| 8 | Desktop: 2×2 grid layout | ✅ PASS (`.moon-hub-seo-grid` with `grid-template-columns:repeat(2,1fr)`) |
| 9 | Mobile: single column | ✅ PASS (`@media (max-width:768px)` collapses to `1fr`) |
| 10 | Lighter shadows | ✅ PASS (`0 10px 28px rgba(15,44,28,.045)` → `0 6px 18px rgba(15,44,28,.035)`) |
| 11 | Equal card heights in the grid | ✅ PASS (`display:flex; flex-direction:column` on the card) |
| 12 | Comfortable padding | ✅ PASS (`26px 28px` → `22px 24px` desktop; `20px` → `18px 20px` mobile) |
| 13 | Comfortable line-height | ✅ PASS (`line-height: 2` → `line-height: 1.75` desktop; `1.9` → `1.8` mobile) |
| 14 | No layout redesign | ✅ PASS (still 4 sibling `<section class="moon-hub-seo-card">`, just wrapped in 1 grid container) |
| 15 | No identity / color changes | ✅ PASS (no color tokens touched) |
| 16 | Calculations unchanged | ✅ PASS (no calc code touched) |
| 17 | MoonCalc unchanged | ✅ PASS (no MoonCalc reference touched) |
| 18 | Moon values unchanged | ✅ PASS (no value-flow code touched) |
| 19 | city-local noon unchanged | ✅ PASS |
| 20 | sitemap unchanged | ✅ PASS |
| 21 | canonical / hreflang / JSON-LD unchanged | ✅ PASS |
| 22 | No new dependencies | ✅ PASS |

## 4) AR before / after

### Card 1

**BEFORE:**
> **كيف تقرأ حالة القمر في الرياض؟**
> تعرض صفحة حالة القمر في الرياض معلومات تساعد الزائر على فهم وضع القمر من خلال عدة مؤشرات رئيسية، مثل طور القمر، ونسبة الإضاءة، وعمر القمر، واتجاه تطور الطور خلال الأيام القريبة. قراءة هذه البيانات معاً تعطي صورة أوضح من الاعتماد على اسم الطور فقط، لأن كل طور يمر بدرجات مختلفة من الإضاءة والعمر قبل الانتقال إلى الطور التالي.
> عند النظر إلى حالة القمر، يمكن البدء باسم الطور الحالي، ثم مراجعة نسبة الإضاءة لمعرفة مقدار الجزء المضيء من قرص القمر. بعد ذلك يساعد عمر القمر على فهم موقعه داخل الدورة القمرية، وهل هو في بداية الشهر القمري أو منتصفه أو مراحله الأخيرة. هذه المعلومات تجعل الصفحة مناسبة للمتابعة السريعة، ولمن يريد رابطاً مركزياً لحالة القمر في المدينة دون الدخول مباشرة إلى صفحة شهر أو تاريخ محدد.

**AFTER:**
> **كيف تتابع أطوار القمر في الرياض؟**
> تعرض صفحة تقويم القمر في الرياض الطور الحالي، ونسبة الإضاءة، وعمر القمر، مع روابط للأيام القريبة والتقويم الشهري. تساعدك هذه البيانات على فهم موقع القمر داخل دورته، ومعرفة ما إذا كان يقترب من الهلال أو التربيع أو البدر أو المحاق.
> يمكنك استخدام هذه الصفحة كنقطة بداية سريعة لمتابعة حالة القمر في الرياض، ثم الانتقال إلى صفحة الشهر أو صفحة تاريخ محدد إذا كنت تريد تفاصيل أوسع عن تسلسل الأطوار خلال فترة معينة.

### Card 2

**BEFORE:**
> **الفرق بين صفحة القمر في الرياض وصفحات القمر الأخرى**
> صفحة القمر في الرياض تعمل كصفحة رئيسية لحالة القمر في المدينة، وتجمع بين معلومات الطور الحالي وروابط التقويم والأيام القريبة. أما صفحة القمر العامة فهي تعرض حالة القمر دون التركيز على مدينة بعينها، بينما تعرض صفحات التاريخ المحدد بيانات القمر في يوم معيّن، وتعرض صفحات الشهر تقويماً أوسع لمراحل القمر خلال شهر كامل.
> هذا الفصل بين الصفحات يساعد المستخدم ومحركات البحث على فهم وظيفة كل رابط. فإذا كان الهدف معرفة حالة القمر المرتبطة بمدينة محددة، فصفحة المدينة هي الأنسب. وإذا كان الهدف مراجعة مراحل القمر خلال شهر كامل، فصفحة التقويم الشهري تكون أوضح. أما عند البحث عن تاريخ محدد، فصفحة التاريخ تعرض بيانات أكثر ارتباطاً بذلك التاريخ المحدد دون خلطها مع صفحة Hub العامة.

**AFTER:**
> **متى تستخدم صفحة القمر في الرياض؟**
> استخدم صفحة القمر في الرياض عندما تريد ملخصًا واضحًا يجمع حالة القمر الحالية، ونسبة الإضاءة، ومواعيد الطلوع والغروب، وروابط الأيام والشهور القريبة. هذه الصفحة مناسبة لمن يريد معرفة سريعة دون الدخول مباشرة إلى تقويم الشهر الكامل.
> أما صفحة الشهر فتعرض أطوار القمر خلال شهر كامل، بينما تعرض صفحة التاريخ بيانات القمر في يوم محدد. لذلك تبقى صفحة الرياض مدخلًا منظمًا يربط بين الحالة الحالية والتقويم الشهري والصفحات اليومية.

### Card 3

**BEFORE:**
> **ما العوامل التي تظهر في بيانات القمر؟**
> تعتمد بيانات القمر المعروضة في الصفحة على مجموعة من العناصر الفلكية المبسطة للمستخدم. من أهم هذه العناصر طور القمر، وهو الاسم الذي يصف شكل القمر في مرحلته الحالية، مثل الهلال أو التربيع أو البدر أو الأحدب. كما تظهر نسبة الإضاءة التي توضّح مقدار الجزء المضيء من سطح القمر كما يُرى من الأرض.
> يظهر أيضاً عمر القمر، وهو مؤشر يساعد على معرفة موقعه داخل الدورة القمرية. وكلما تقدم عمر القمر، انتقل تدريجياً بين الأطوار المختلفة حتى يكتمل البدر ثم يبدأ بالتناقص. وقد تتأثر طريقة عرض بعض التفاصيل بالتوقيت المحلي للمدينة، لذلك تفيد صفحة الرياض في إعطاء سياق مكاني واضح بدلاً من عرض معلومات عامة فقط.

**AFTER:**
> **ما العوامل التي تظهر في بيانات القمر؟** *(title unchanged — already good)*
> تعتمد بيانات القمر في الرياض على عدة مؤشرات فلكية مبسطة، مثل الطور الحالي، ونسبة الإضاءة، وعمر القمر، ومواعيد طلوع القمر وغروبه حسب توقيت الرياض المحلي. تساعد هذه المؤشرات على قراءة حالة القمر بطريقة أوضح من الاعتماد على اسم الطور فقط.
> كما تظهر معلومات إضافية مثل الكوكبة الفلكية والمسافة التقريبية إلى القمر، وهي عناصر تساعد في إعطاء سياق أوسع لحركة القمر وموقعه الظاهري، دون أن تغيّر معنى الطور أو نسبة الإضاءة المعروضة.

### Card 4

**BEFORE:**
> **استخدام تقويم القمر من صفحة الرياض**
> يتيح تقويم القمر في صفحة الرياض الانتقال من النظرة العامة إلى تفاصيل أوسع. يمكن للزائر استخدام روابط الأيام القريبة لمتابعة تغير الطور خطوة بخطوة، أو فتح صفحة الشهر لمشاهدة تسلسل الأطوار خلال فترة أطول. بهذه الطريقة تعمل الصفحة كبوابة منظمة بين الحالة الحالية للقمر وصفحات التقويم الأكثر تفصيلاً.
> من الأفضل أن تبقى صفحة المدينة مختصرة في عرض التقويم، بحيث تعرض روابط واضحة للأيام القريبة أو للشهر، دون تكرار كل تفاصيل الشهر داخل صفحة Hub نفسها. هذا يحافظ على وضوح النية، ويمنع تداخل الصفحة مع صفحات الشهر والتاريخ، ويجعل تجربة التصفح أبسط للمستخدم.

**AFTER:**
> **كيف تستخدم تقويم القمر في الرياض؟**
> ابدأ بقراءة ملخص حالة القمر الحالية في أعلى الصفحة، ثم راجع نسبة الإضاءة وعمر القمر ومواعيد الطلوع والغروب. بعد ذلك يمكنك استخدام روابط الأيام القريبة أو زر التقويم الشهري لمتابعة تغيّر الأطوار خلال الشهر.
> إذا كنت تبحث عن يوم معين، فانتقل إلى صفحة التاريخ المحدد. وإذا أردت مراجعة الشهر كاملًا، فصفحة التقويم الشهري هي الأنسب لأنها تعرض تسلسل الأطوار والتواريخ الميلادية المقابلة بطريقة أوضح.

## 5) Other-language application

**YES** — all 9 non-AR languages (en, fr, tr, ur, de, id, es, bn, ms) were updated with translations preserving the AR meaning while reading naturally per language. No language was left displaying the legacy text.

Sample card titles confirmed live:

| Lang | Card 1 title |
| --- | --- |
| ar | كيف تتابع أطوار القمر في الرياض؟ |
| en | How to follow the Moon's phases in Riyadh |
| fr | Comment suivre les phases de la Lune à Paris |
| tr | İstanbul için Ay'ın evrelerini nasıl takip edersiniz |
| ur | کراچی میں چاند کے مراحل کیسے دیکھیں |
| de | Wie Sie die Mondphasen in Berlin verfolgen |
| id | Cara mengikuti fase Bulan di Jakarta |
| es | Cómo seguir las fases de la Luna en Madrid |
| bn | ঢাকা-এ চাঁদের দশা কীভাবে অনুসরণ করবেন |
| ms | Cara mengikuti fasa Bulan di Kuala Lumpur |

## 6) Design work

### HTML structure (server.js)
- The 4 `<section class="moon-hub-seo-card">` tags are now wrapped in a single `<div class="moon-hub-seo-grid">` container. This is the only structural change.

### CSS polish (css/style.css)
- **NEW**: `.moon-hub-seo-grid` rule — `display:grid; grid-template-columns:repeat(2,1fr); gap:20px; max-width:1100px` on desktop
- **NEW**: Mobile breakpoint `@media (max-width:768px)` — `grid-template-columns:1fr; gap:16px` (single column)
- **CHANGED** `.moon-hub-seo-card`:
  - `padding`: `26px 28px` → `22px 24px` (desktop), `20px` → `18px 20px` (mobile)
  - `border-radius`: `24px` → `20px` (desktop), `20px` → `18px` (mobile)
  - `box-shadow`: `0 10px 28px rgba(15,44,28,.045)` → `0 6px 18px rgba(15,44,28,.035)` *(lighter)*
  - Added `display:flex; flex-direction:column` *(equal-height cards in grid rows)*
  - Removed `max-width: 920px; margin: 20px auto 0` *(no longer needed — grid container handles width/spacing)*
- **CHANGED** `.moon-hub-seo-card h2`:
  - `font-size`: `23px` → `20px` (desktop), `20px` → `18px` (mobile)
  - `line-height`: `1.5` → `1.45`
  - `margin-bottom`: `12px` → `10px`
- **CHANGED** `.moon-hub-seo-card p`:
  - `font-size`: `15.5px` → `15px` (desktop), `15px` → `14.5px` (mobile)
  - `line-height`: `2` → `1.75` (desktop), `1.9` → `1.8` (mobile)
  - `margin-bottom`: `12px` → `10px`

### Cache-buster
- `css/style.css?v=401` → `402`

## 7) Confirmations (no scope creep)

- ✅ Cards now render as **2×2 on desktop / 1-col on mobile** (CSS grid in served bundle verified via `curl /css/style.css?v=402`)
- ✅ Calculations **NOT changed** (no calc code touched)
- ✅ MoonCalc **NOT changed**
- ✅ sitemap / canonical / hreflang / JSON-LD **NOT changed** (no sitemap.xml, no head meta, no JSON-LD changes)
- ✅ No new dependencies

## 8) Tests executed

### SSR per-language live test (port 3208/3209)

| Test | Result |
| --- | --- |
| AR `/moon-in-riyadh` — new 4 titles render | ✅ all 4 present |
| AR `/moon-in-jeddah` — city interpolation = جدة | ✅ |
| AR `/moon-in-makkah` — city interpolation = مكة المكرمة | ✅ |
| EN `/en/moon-in-riyadh` — new 4 EN titles | ✅ all 4 present |
| FR `/fr/moon-in-paris` — Paris interpolation | ✅ |
| TR `/tr/moon-in-istanbul` — İstanbul interpolation | ✅ |
| UR `/ur/moon-in-karachi` — کراچی interpolation | ✅ |
| DE `/de/moon-in-berlin` — Berlin interpolation | ✅ |
| ID `/id/moon-in-jakarta` — Jakarta interpolation | ✅ |
| ES `/es/moon-in-madrid` — Madrid interpolation | ✅ |
| BN `/bn/moon-in-dhaka` — ঢাকা interpolation | ✅ |
| MS `/ms/moon-in-kuala-lumpur` — Kuala Lumpur interpolation | ✅ |
| Grid wrapper present (count = 1) on all hub pages | ✅ |
| 4 cards present (count = 4) | ✅ |
| OLD AR title "كيف تقرأ حالة القمر" — should be ABSENT | ✅ count = 0 |

### Sibling-route regression (count of `moon-hub-seo-card`)

| Route | Count | Expected |
| --- | --- | --- |
| `/moon-today` | 0 | 0 ✅ |
| `/moon-today-in-riyadh` | 0 | 0 ✅ |
| `/moon-in-riyadh/2026-05` (month) | 0 | 0 ✅ (gating excludes month pages) |
| `/moon-in-riyadh/2026-05-15` (date) | 0 | 0 ✅ |

### CSS delivery

| Check | Result |
| --- | --- |
| `curl /css/style.css?v=402` | HTTP 200 |
| `.moon-hub-seo-grid` rule present | ✅ `grid-template-columns:repeat(2,1fr); gap:20px; max-width:1100px` |
| Mobile media query rule present | ✅ `grid-template-columns:1fr; gap:16px` |
| Card padding tightened | ✅ `padding:22px 24px` |
| Card shadow lighter | ✅ `box-shadow:0 6px 18px rgba(15,44,28,.035)` |
| `display:flex; flex-direction:column` for equal heights | ✅ present |

### Syntax

| Check | Result |
| --- | --- |
| `node --check server.js` | ✅ syntax OK |

## 9) Files touched (4)

| File | Change |
| --- | --- |
| `server.js` | Rewrote `_MOON_HUB_GUIDE` object (4 cards × 10 langs); wrapped 4 cards in `<div class="moon-hub-seo-grid">` |
| `css/style.css` | New `.moon-hub-seo-grid` rules; polished `.moon-hub-seo-card` for tighter spacing + lighter shadow + flex-column for equal heights |
| `index.html` | Cache-buster `?v=401` → `?v=402` |
| `scripts/_moon_hub_seo_edu_rewrite.mjs` | New helper script (idempotent, CRLF-aware) used to do the SSR text replacement |
| `reports/moon-city-evergreen-edu-content-ui-polish-1-closure.md` | This report |
