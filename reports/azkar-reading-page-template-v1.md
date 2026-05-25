# AZKAR-READING-PAGE-TEMPLATE-V1

**Status:** ✅ Approved by user — 2026-05-26
**Reference implementation:** `/azkar/morning-azkar`
**Reference commit chain:**
- `034dae6` — RESTRUCTURE-PHASE-1 (hub + first morning page + 10 items)
- `2d5a9b0` — DATA-25 (canonical 25 morning items)
- `888f10b` (re-applied as `e1eae9e`) — DARK-MODE-POLISH
- `4e1a2de` (re-applied in `81d017f`) — RESET-SCROLL + MOBILE-STICKY-OFFSET
- `81d017f` — PHASE-3-COMPOSITE (SEO title/desc + H2 bridge + counter aria + FAQ)
- `6f82c84` — SSR-SINGLE-ACTIVE-FIX (1 `.page.active` on /azkar*)
- `c1e1fa7` — SSR-SINGLE-H1-FIX (1 H1 on /azkar*)
- `baf0289` — SSR-RENDER-LIST (25 cards in SSR + JS hydration only) — **the CLS-zero baseline**

**Audience:** any contributor adding a new azkar category page (e.g.
`/azkar/evening-azkar`, `/azkar/sleep-azkar`, `/azkar/after-prayer-azkar`,
`/azkar/wake-up-azkar`, `/azkar/travel-azkar`, …). Follow this template
verbatim — do not invent a new layout or new render strategy. The
template is the agreed contract for SEO, performance, accessibility,
and offline UX consistency across the section.

**Trigger phrases** for picking up this template later: "azkar template",
"new azkar category", "evening azkar", "sleep azkar", "AZKAR-RESTRUCTURE-MORNING-PHASE-2".

---

## 0. The 20-element checklist (must all pass before merge)

| # | Element | Mandatory? | Reference |
|---|---|:---:|---|
| 1 | Independent route `/azkar/{category-slug}-azkar` | ✅ | server.js `_isAzkar*Route` regex |
| 2 | Exactly 1 `<h1>` in SSR HTML | ✅ | server.js `_getActiveH1Marker` |
| 3 | SEO `title` + `meta description` per template (§4) | ✅ | server.js `staticPages` map |
| 4 | Card list fully SSR-rendered (NEVER empty in SSR) | ✅ | server.js `_buildAzkar*ListHtml()` |
| 5 | Card schema matches the 9 fields (§9) | ✅ | js/azkar-data.js |
| 6 | Quran-type cards show title; dhikr-type cards hide it | ✅ | renderer guard in both server.js + js/app.js |
| 7 | Counter variant A/B + completed state | ✅ | `isSingleRead = (repeat === 1)` |
| 8 | Inline progress + sticky progress + reset-all button | ✅ | `.azkar-progress-*` + `.azkar-sticky-progress-*` |
| 9 | Reset flow: modal → toast → scroll-to-top | ✅ | `_azkarShowResetConfirm` + `_azkarScrollToTopOfPage` |
| 10 | Per-category localStorage key `azkar.progress.{category}` | ✅ | `_azkarProgressKey()` |
| 11 | Auto-advance respects prefers-reduced-motion + offset | ✅ | `_azkarAdvanceToNext` + `_azkarScrollToCard` |
| 12 | Mobile sticky-offset scroll-margin-top (200/190/130) | ✅ | css/style.css `.azkar-card-item` |
| 13 | Dark mode polish (§7) | ✅ | css/style.css `html[data-theme="dark"]` |
| 14 | Page-specific FAQ (NOT verbatim morning FAQ) | ✅ | index.html `.azkar-faq` section |
| 15 | Educational mini-cards specific to the section | ✅ | index.html `.azkar-edu-section` |
| 16 | Internal link grid at footer (no broken links) | ✅ | index.html `.azkar-edu-links` |
| 17 | H2 keyword bridge above the list (§4) | ✅ | index.html `.azkar-section-intro` |
| 18 | No noise duplication of UI labels in aria/title/hidden | ✅ | `_AZKAR_AR_CHROME.counterTap` + `counterTapAria` split |
| 19 | Registered in `_getActiveH1Marker` for single-H1 SSR | ✅ | server.js |
| 20 | Lighthouse CLS < 0.1 (ideally 0.000) | ✅ | measured via Claude Preview PerformanceObserver |

---

## 1. URL + route policy

- **One slug per category**, lowercased, hyphenated, suffixed with `-azkar`:
  - `/azkar/morning-azkar` ✅ (live)
  - `/azkar/evening-azkar` (future)
  - `/azkar/sleep-azkar` (future)
  - `/azkar/after-prayer-azkar` (future)
  - `/azkar/wake-up-azkar` (future)
  - `/azkar/travel-azkar` (future)
- **Lang prefix supported**: `/{lang}/azkar/{slug}-azkar` (en/fr/tr/ur/de/id/es/bn/ms).
- Routes are listed in `server.js` regex chain (`_isAzkarMorningRoute = /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?azkar\/morning-azkar$/`). Add a new constant per category.
- **No combined route**: do NOT serve evening dhikr inside `/azkar`. The hub
  `/azkar` is a cards landing page only. Each category has its own URL for
  SEO + Open Graph + canonical separation.
- **Sitemap**: add an entry to `staticPaths` in server.js (~line 22062)
  `['/azkar/{slug}-azkar', '0.75', 'monthly']`.

---

## 2. SSR contract (the core rule)

> ❗ **The dhikr list MUST be fully SSR-rendered. Empty lists with JS
> injection are forbidden** — they caused Lighthouse CLS 0.343 on
> `/azkar/morning-azkar` (see commits `cbfd58f` reverted via `5f126f8`,
> then root-fixed via `baf0289`).

### What SSR must produce
- `<div class="azkar-list" id="azkar-{cat}-list" data-ssr-rendered="1" aria-live="polite">`
  containing **all** dhikr cards.
- Each card uses `restored = 0` (server doesn't know localStorage).
  JS hydration applies actual restored state.
- The `data-ssr-rendered="1"` marker is **mandatory** so js/app.js
  hydration path runs instead of full re-render.

### Server-side data loading pattern (do not change)
`server.js` at module load reads `./js/azkar-data.js` into a sandboxed
`Function`. The IIFE inside that file assigns `window.AzkarMorning = [...]`
(and similar for future categories), so we stub `{ window: {} }` and pluck
the array off it. This avoids any change to `azkar-data.js` (which stays
browser-shaped). Pattern at `server.js:_AZKAR_MORNING_DATA`:

```js
let _AZKAR_MORNING_DATA = [];
try {
    const _azkarSrc = fs.readFileSync(path.join(__dirname, 'js', 'azkar-data.js'), 'utf8');
    const _azkarSandbox = { window: {}, console: { log: () => {} } };
    new Function('window', 'console', _azkarSrc)(_azkarSandbox.window, _azkarSandbox.console);
    _AZKAR_MORNING_DATA = Array.isArray(_azkarSandbox.window.AzkarMorning)
        ? _azkarSandbox.window.AzkarMorning : [];
} catch (e) { /* fallback to empty — JS will re-render */ }
```

When adding a new category, reuse the same loader. Either pluck a different
global (`AzkarEvening`, `AzkarSleep`, …) or refactor `azkar-data.js` to
expose a single `window.AzkarCategoriesData = { morning: [...], evening: [...] }`.

### Render helper structure
`_buildAzkarCardHtml(dhikr, idx)` is **category-agnostic**. Reuse it for any
new category. The category-specific wrapper is just:

```js
function _buildAzkar{Cat}ListHtml() {
    if (!_AZKAR_{CAT}_DATA.length) return '';
    return _AZKAR_{CAT}_DATA.map((d, i) => _buildAzkarCardHtml(d, i)).join('');
}
```

### Active-page activation (single `.page.active` rule)
Inside the `serveHtmlWithSeo` block around line 14494:
1. Strip the default `class="page active"` from `#page-prayer-times` (already
   scoped to azkar routes — extend the `if (_isAzkar*Route || …)` condition
   to include the new category).
2. Flip the target `<div class="page" id="page-azkar-{cat}">` to `active`.
3. Inject the SSR card HTML into the matching `<div id="azkar-{cat}-list">`.

```js
if (_isAzkarEveningRoute) {
    html = html.replace(
        '<div class="page" id="page-azkar-evening">',
        '<div class="page active" id="page-azkar-evening">'
    );
    const _eveningHtml = _buildAzkarEveningListHtml();
    if (_eveningHtml) {
        html = html.replace(
            '<div class="azkar-list" id="azkar-evening-list" aria-live="polite"></div>',
            '<div class="azkar-list" id="azkar-evening-list" data-ssr-rendered="1" aria-live="polite">' +
                _eveningHtml +
            '</div>'
        );
    }
}
```

---

## 3. Single-H1 contract

Each category route must be registered in `_getActiveH1Marker(urlPath)`
(server.js ~line 6189). Either:
- Add an `id` to the H1 in `index.html` and reference it: `{ kind: 'id', value: 'azkar-{cat}-h1' }`
- Or use the existing `data-i18n` on the H1: `{ kind: 'i18n', value: 'azkar.{cat}.title' }`

Example (already done for morning):

```js
if (/^\/azkar\/morning-azkar$/.test(path))  return { kind: 'id', value: 'azkar-morning-h1' };
// Future:
if (/^\/azkar\/evening-azkar$/.test(path))  return { kind: 'id', value: 'azkar-evening-h1' };
```

`_downgradeInactiveH1s` will silently convert every other `<h1>` in the
SPA shell to `<h2>` while preserving classes, ids, and attributes.

---

## 4. SEO contract (title / description / H2 bridge)

### `title` (50–60 code-point chars, target ~52)
```
{اسم القسم} مكتوبة كاملة | صحيحة مع التكرار والمصدر
```

### `meta description` (120–160 code-point chars, target ~122)
```
اقرأ {اسم القسم} مكتوبة كاملة مع التكرار والمصدر الصحيح، وعداد تفاعلي يحفظ تقدمك خلال اليوم لتتم قراءتها بسهولة وطمأنينة.
```

### Examples
| Category | Title (AR) | Length |
|---|---|:---:|
| Morning | `أذكار الصباح مكتوبة كاملة \| صحيحة مع التكرار والمصدر` | 52 |
| Evening | `أذكار المساء مكتوبة كاملة \| صحيحة مع التكرار والمصدر` | 52 |
| Sleep | `أذكار النوم مكتوبة كاملة \| صحيحة مع التكرار والمصدر` | 51 |
| After-prayer | `أذكار بعد الصلاة مكتوبة كاملة \| صحيحة مع التكرار والمصدر` | 56 |

EN + 8 other-lang values: copy the EN string in Phase 1, translate per-lang
in Phase 2. Document the canonical AR template inside the `staticPages`
entry as `AZKAR-SEO-TEMPLATE-1` (see server.js:7700 reference).

### H2 keyword bridge (`.azkar-section-intro`)
Sits **between the hero/sticky bar and the list**. Bridges 3 core keywords
(`أذكار {القسم}` / `التكرار` / `المصدر`) into a heading + body paragraph so
SEOptimer's heading-coverage check sees them outside individual cards.

```html
<header class="azkar-section-intro" id="azkar-{cat}-section-intro">
    <h2 class="azkar-section-intro-title">{اسم القسم} مع التكرار والمصدر الصحيح</h2>
    <p class="azkar-section-intro-text">تضم هذه الصفحة {اسم القسم} مكتوبة كاملة، مع توضيح عدد التكرار والمصدر لكل ذكر، إضافة إلى عداد تفاعلي يساعدك على إكمال القراءة دون نسيان.</p>
</header>
```

---

## 5. Card schema (data contract)

`js/azkar-data.js` source-of-truth. Each item:

| field | type | required | notes |
|---|---|:---:|---|
| `id` | string | ✅ | `{category}-NNN` (3-digit zero-padded). **STABLE** — localStorage keys depend on it. Never reorder or reuse. |
| `category` | string | ✅ | Lowercase slug: `morning`, `evening`, `sleep`, etc. |
| `order` | number | ✅ | 1-based display index within the category. |
| `type` | enum | ✅ | `'dhikr'` (default site font) \| `'quran'` (Amiri Quran font + show title) |
| `title` | `{ar, en}` \| null | optional | Shown only for `type:'quran'`. Hidden for `dhikr`. |
| `text` | string | ✅ | Arabic text **verbatim** from trusted source. Never paraphrase or auto-translate. |
| `repeat` | number ≥ 1 | ✅ | Counter target. `1` → mark-read button. `>1` → counter pill. |
| `repeatLabel` | `{ar, en}` \| null | optional | Falls back to `_azkarRepeatLabelAR_SSR(n)` (1=مرة واحدة, 3=ثلاث مرات, 7=سبع مرات, 10=عشر مرات, 33=ثلاث وثلاثون مرة, 100=مئة مرة, else `n مرة`). |
| `source` | `{ ref: string, sourceUrl?: string }` | ✅ | `ref` = hadith collection / book name. Surfaced as "📖 المصدر: {ref}". |
| `virtue` | `{ar, en}` \| null | optional | Collapsible `<details>` (closed by default). |
| `authenticity` | enum \| null | optional | `'sahih' \| 'hasan' \| 'quran' \| 'weak_hadith' \| null`. Used for future filtering. |
| `authenticityNote` | `{ar, en}` \| null | optional | Quiet `<details>` under "ملاحظة حول درجة الحديث". |

**Schema invariant:** new fields may be added later, but existing fields
MUST keep their meaning. The `id` field especially — it is the localStorage
key suffix; renaming or reordering items breaks user progress.

---

## 6. Renderer contract (server-side ↔ client-side parity)

Two renderers MUST produce **byte-equivalent HTML for a fresh state** (no
localStorage). Diverging means the hydration path picks up cards with
wrong structure and event handlers fail silently.

### Card outline
```html
<article class="azkar-card-item[ azkar-card-item--single]"
         id="azkar-item-{dhikr.id}"
         data-dhikr-id="{dhikr.id}"
         data-repeat="{target}">
  <header class="azkar-card-item-header[ azkar-card-item-header--badge-only]">
    <span class="azkar-card-item-order">{NN}</span>
    [<h3 class="azkar-card-item-title">{title.ar}</h3>  <!-- quran only -->]
  </header>
  <p class="azkar-text|azkar-quran-text" dir="rtl">{text}</p>
  <div class="azkar-action-row">
    <span class="azkar-repeat-label">
      <span class="azkar-repeat-label-key">التكرار:</span>
      <span class="azkar-repeat-label-val">{repeatText}</span>
    </span>
    [<!-- if isSingleRead: -->
     <button type="button" class="azkar-mark-read" aria-pressed="false">تمت القراءة</button>]
  </div>
  [<!-- if multi: -->
   <div class="azkar-counter">
     <button type="button" class="azkar-counter-tap" aria-label="اضغط للعدّ">
       <span class="azkar-counter-tap-prompt">عدّ</span>
       <span class="azkar-counter-tap-count" dir="ltr">0 / {target}</span>
     </button>
     <div class="azkar-counter-controls">
       <button type="button" class="azkar-counter-undo">تراجع</button>
       <button type="button" class="azkar-counter-reset">إعادة</button>
     </div>
   </div>]
  <p class="azkar-completed-caption">✓ تم إكمال الذكر</p>
  [<div class="azkar-card-item-footer">
    <p class="azkar-source" dir="rtl">
      <span class="azkar-source-icon" aria-hidden="true">📖</span>
      <span class="azkar-source-key">المصدر:</span>
      <span class="azkar-source-val">{source.ref}</span>
    </p>
    [<details class="azkar-virtue">…</details>]
    [<details class="azkar-authenticity">…</details>]
  </div>]
</article>
```

### Server-side renderer
- `_buildAzkarCardHtml(dhikr, idx)` in `server.js` — pure function, no
  per-user state, no localStorage access.
- Always uses `restored = 0`, `isCompleted = false`.
- `_AZKAR_AR_CHROME_SSR` mirrors the client-side `_AZKAR_AR_CHROME`. Keep
  the two strings in sync (`counterTap`, `counterDone`, `markRead`,
  `markedRead`, `completedCaption`, `repeatLabel`, `sourceLabel`,
  `showVirtue`, `authenticityLabel`).

### Client-side hydrator
- `_hydrateAzkarMorningCards(items, listEl)` in `js/app.js` walks the
  existing DOM, applies localStorage state, binds handlers.
- The dispatch in `_loadAzkar{Cat}` uses:
  ```js
  if (listEl.dataset.ssrRendered === '1' && listEl.children.length > 0 && items.length) {
      _hydrateAzkar{Cat}Cards(items, listEl);
      // → bind handlers, no DOM rebuild
      _updateProgress();
      _azkarWireStickyProgress();
      return;
  }
  // FALLBACK: full re-render (no SSR cards present)
  ```
- **Reset flow clears `data-ssr-rendered`** before re-render so the fresh
  re-build takes the fallback path (not the stale-state hydration):
  ```js
  onConfirm: () => {
      _azkarResetCategory('{category}');
      listEl.dataset.wired = '';
      listEl.removeAttribute('data-ssr-rendered');
      listEl.innerHTML = '';
      _loadAzkar{Cat}();
      ...
  }
  ```

---

## 7. Dark mode contract

- All overrides scoped under `html[data-theme="dark"]`.
- **Never** touch `body` background, `--bg` variable, or global palette.
- Reuse the morning palette tokens:
  - Primary text: `#F5F7F4`
  - Secondary text: `#B8C4BD` / `#d6ead9` (slight green tint)
  - Accent green: `#4ade80` (titles, active states) / `#6fd394` (chev, secondary)
  - Amber (reset): `#ffd07a` on `rgba(255,193,77,0.10)`
  - Borders: `rgba(255,255,255,0.10–0.12)`
  - Inner bg: `rgba(255,255,255,0.04–0.06)`
- All `.azkar-*` selectors are category-agnostic — adding `/azkar/evening-azkar`
  inherits the morning dark mode automatically. No new CSS needed unless
  category-specific accent color is intentional (e.g., evening could keep
  the same green; do not invent purple/orange unless approved).

---

## 8. Mobile contract (sticky-offset ladder)

`.azkar-card-item` and `.azkar-hero` and `#azkar-page-top` use `scroll-margin-top`
to clear the sticky-progress bar:

| Breakpoint | scroll-margin-top |
|---|:---:|
| Default (desktop) | 120-130 px |
| `@media (max-width: 768px)` (tablet) | 190 px |
| `@media (max-width: 480px)` (mobile) | 200 px |

`_azkarOffsetPx()` in app.js mirrors the same ladder so JS-driven scrolls
(`_azkarScrollToCard`, `_azkarScrollToTopOfPage`) compensate identically.
This must stay in sync if the sticky bar height changes.

---

## 9. localStorage contract

### Schema (per category)
Key: `azkar.progress.{category}`
Value (JSON):
```js
{
  date: 'YYYY-MM-DD',   // local-timezone day key; bundle resets when day changes
  items: {
    '{dhikr-id}': { count: number, completed: boolean },
    ...
  }
}
```

### Daily reset semantics
- `_azkarLoadProgress(category)` reads the bundle.
- If `bundle.date !== todayLocal`, a fresh empty bundle is created (counters
  reset to zero, completion cleared).
- This is **automatic** — no user action needed. Each category resets
  independently at its own local midnight.
- Manual reset (the "إعادة ضبط العدّادات" modal) zeros today's items but
  preserves the day key.

### Per-category isolation
- `morning` items go to `azkar.progress.morning`.
- `evening` items will go to `azkar.progress.evening`.
- **Never** share a key between categories. Per-category isolation prevents
  cross-contamination of progress when the user reads morning AND evening on
  the same day.

### Deprecated key cleanup
- Old schema `azkar.count.{category}.{dhikrId}` is swept by `_azkarCleanLegacy(category)`
  on first load per category. Future categories inherit this cleanup
  automatically — no extra wiring needed.

---

## 10. Reset flow contract (page-level + sticky)

Both buttons (`#azkar-{cat}-reset-all` and `#azkar-{cat}-sticky-reset`) wire
to the same flow:

1. Click → `_azkarShowResetConfirm({ title, sub, cancelText, confirmText, returnFocusTo, onConfirm })`
2. Custom modal (NOT native `confirm()`) opens, focus-trapped.
3. On "نعم، إعادة الضبط":
   - `_azkarResetCategory('{category}')` zeros today's bundle.
   - Clear `listEl.dataset.wired` + `data-ssr-rendered`, then `innerHTML = ''`.
   - `_loadAzkar{Cat}()` rebuilds the list fresh.
   - `_azkarShowToast('تمت إعادة ضبط العدادات')` shows brief toast.
   - `_azkarScrollToTopOfPage()` jumps back to `#azkar-page-top` (offset-aware
     scroll respecting prefers-reduced-motion).
4. On "إلغاء" or Esc: modal closes, no other side-effects.

Per-item reset (`.azkar-counter-reset` inside a card) zeros only that item's
counter. **No scroll, no toast, no global modal.**

---

## 11. Auto-advance contract

`_azkarAdvanceToNext(currentCardEl)` fires ONLY when a counter just crossed
its target on a user click (not on restore, not on undo). Uses
`_azkarScrollToCard(nextCard)` with the offset ladder above.

Edge cases handled in morning (verify in new categories):
- Last card → reveals `#azkar-{cat}-completed` banner + scrolls to it.
- prefers-reduced-motion → `behavior: 'auto'` instead of `'smooth'`.
- Highlight CSS animation (`.azkar-just-arrived`) fades over 1.4s.

---

## 12. FAQ contract

- File location: `index.html` inside `#page-azkar-{cat}`, after the list,
  before the events section.
- Class: `.azkar-faq`, with `<h2 class="azkar-faq-title">أسئلة شائعة حول {اسم القسم}</h2>`.
- **Category-specific Q/A**. Do NOT verbatim-copy morning questions. Each
  category has its own context:
  - Evening: "متى يبدأ وقت أذكار المساء؟" (after Asr / before Maghrib?)
  - Sleep: "هل يجب الوضوء قبل أذكار النوم؟"
  - After-prayer: "هل أقرأها بعد كل صلاة فرض أم بعد الفرض والنفل؟"
- Keep the 2 keyword-bridge questions from morning's pattern (or analogs):
  - "ما فائدة التكرار في {اسم القسم}؟"
  - "هل تظهر مصادر {اسم القسم} في الصفحة؟"

---

## 13. Educational mini-cards contract

- File location: `index.html` inside `#page-azkar-{cat}`, between the completion
  banner and the FAQ.
- Class: `.azkar-edu-section`, containing 3 `.azkar-edu-card` blocks + a
  `.azkar-edu-links` grid with 4–6 link cards.
- **Category-specific content**. Each card has a 1-emoji icon + H2 title + 2–3
  short paragraphs.
- Suggested 3 cards for any category:
  1. "ما هي {اسم القسم}؟" (what + when)
  2. "كيف تستخدم صفحة {اسم القسم}؟" (how the counter works)
  3. "الفرق بين {اسم القسم} و{قسم ذو صلة}" (e.g., morning vs. evening)
- Internal-link grid: include 4–6 of:
  - `العودة إلى الأذكار` → `/azkar`
  - `{sibling category}` (live or "قريبًا" disabled)
  - `مواقيت الصلاة` → `/`
  - `التاريخ الهجري` → `/today-hijri-date`
  - `حالة القمر` → `/moon-today`
  - `اتجاه القبلة` → `/qibla`

---

## 14. Counter UI label noise contract

To avoid SEOptimer flagging `اضغط للعد` / `إعادة` / `تراجع` as page-keyword
noise:

- Visible counter prompt text: `"عدّ"` (short, single word).
- Full instruction lives on `aria-label="اضغط للعدّ"` only.
- Same applies to `undo` (visible "تراجع", aria same) and per-item `reset`
  (visible "إعادة", aria same) — these are already short enough.
- **NEVER** duplicate the same label in `textContent` + `aria-label` +
  `title` + hidden span. Pick ONE primary visible label; everything else is
  for assistive tech only.

---

## 15. CSS reuse rule

The morning page CSS already covers every selector this template uses:
- Hero / breadcrumb / page-header / page-subtitle
- Info-strip
- Progress (inline + sticky) + fill + label
- Reset buttons (amber pill)
- Card + completed state + just-arrived highlight
- Action row, repeat label, counter pill, mark-read button
- Source row + virtue/authenticity disclosure
- Completion caption + completion banner
- Section intro (H2 keyword bridge)
- Edu cards + link grid
- FAQ + events section

**Do NOT add new CSS for new categories** unless the category needs a
genuine visual departure (e.g., a different accent color approved by the
user). Use the same classes; the renderer is category-agnostic.

---

## 16. How to add a new azkar category (cookbook)

Follow this 10-step recipe. Each step is a small, isolated change. Total
diff for a new category like `evening`: ~250 lines across 4-5 files.

### Step 1 — data file
Add the new category items to `js/azkar-data.js`:
```js
window.AzkarEvening = [
    { id: 'evening-001', category: 'evening', order: 1, type: 'dhikr',
      title: null, text: '…', repeat: 1, repeatLabel: { ar: 'مرة واحدة', en: 'once' },
      source: { ref: 'البخاري' }, virtue: null, authenticity: 'sahih', authenticityNote: null },
    // … all evening items
];
```
Also extend `window.AzkarCategories` to flip `evening`'s `status: 'soon'` → `'live'`.

### Step 2 — index.html
Add the new page section (copy-paste-modify the morning block at ~line 3344):
```html
<div class="page" id="page-azkar-evening">
    <span id="azkar-page-top" aria-hidden="true" tabindex="-1"></span>
    <section class="azkar-hero">
        <div class="azkar-hero-inner">
            <nav class="azkar-breadcrumb"><a href="/azkar">الأذكار</a> <span class="sep">›</span> <span>أذكار المساء</span></nav>
            <header class="azkar-page-header">
                <h1 id="azkar-evening-h1">أذكار المساء</h1>
                <p class="azkar-page-subtitle">…</p>
            </header>
            <ul class="azkar-info-strip">…</ul>
            <div class="azkar-progress-wrap" id="azkar-evening-progress-wrap">…</div>
        </div>
    </section>
    <div class="azkar-sticky-progress" id="azkar-evening-sticky">…</div>
    <header class="azkar-section-intro" id="azkar-evening-section-intro">
        <h2 class="azkar-section-intro-title">أذكار المساء مع التكرار والمصدر الصحيح</h2>
        <p>…</p>
    </header>
    <div class="azkar-list" id="azkar-evening-list" aria-live="polite"></div>
    <div class="azkar-completed-banner u-hidden" id="azkar-evening-completed">…</div>
    <section class="azkar-edu-section">…</section>
    <section class="azkar-faq">…</section>
    <section class="section-card moon-events-section">…</section>
</div>
```

### Step 3 — server.js: data loader
After the morning loader, add the evening sandbox load:
```js
let _AZKAR_EVENING_DATA = [];
// (same Function-sandbox pattern; pluck _azkarSandbox.window.AzkarEvening)
```

### Step 4 — server.js: render helper
```js
function _buildAzkarEveningListHtml() {
    if (!_AZKAR_EVENING_DATA.length) return '';
    return _AZKAR_EVENING_DATA.map((d, i) => _buildAzkarCardHtml(d, i)).join('');
}
```
(`_buildAzkarCardHtml` is reused as-is.)

### Step 5 — server.js: route regex + SSR injection
At `_isAzkarMorningRoute` (~line 14495), add:
```js
const _isAzkarEveningRoute = /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?azkar\/evening-azkar$/.test(urlPath);
if (_isAzkarMorningRoute || _isAzkarEveningRoute || _isAzkarHubRoute) {
    // strip default prayer-times active (same as morning)
}
if (_isAzkarEveningRoute) {
    html = html.replace(
        '<div class="page" id="page-azkar-evening">',
        '<div class="page active" id="page-azkar-evening">'
    );
    const _eveningHtml = _buildAzkarEveningListHtml();
    if (_eveningHtml) {
        html = html.replace(
            '<div class="azkar-list" id="azkar-evening-list" aria-live="polite"></div>',
            '<div class="azkar-list" id="azkar-evening-list" data-ssr-rendered="1" aria-live="polite">' +
                _eveningHtml +
            '</div>'
        );
    }
}
```

### Step 6 — server.js: staticPages SEO entry
Add `/azkar/evening-azkar` to the map with the canonical template:
```js
'/azkar/evening-azkar': {
    title: { ar: 'أذكار المساء مكتوبة كاملة | صحيحة مع التكرار والمصدر', en: '…', /* … */ },
    desc:  { ar: 'اقرأ أذكار المساء مكتوبة كاملة مع التكرار والمصدر الصحيح، وعداد تفاعلي يحفظ تقدمك خلال اليوم لتتم قراءتها بسهولة وطمأنينة.', en: '…', /* … */ },
    ogType: 'article',
},
```

### Step 7 — server.js: sitemap entry
Add to `staticPaths` (~line 22062):
```js
['/azkar/evening-azkar', '0.75', 'monthly'],
```

### Step 8 — server.js: `_getActiveH1Marker`
Add the new route (~line 6213, before the `/?$` fallback):
```js
if (/^\/azkar\/evening-azkar$/.test(path))  return { kind: 'id', value: 'azkar-evening-h1' };
```

### Step 9 — js/app.js: loader + hydrator
Add `_loadAzkarEvening` (clone of `_loadAzkarMorning` with `'evening'` category)
and `_hydrateAzkarEveningCards` (clone of `_hydrateAzkarMorningCards`).
Alternatively, refactor both into a single parametric `_loadAzkar(category)`
during step 1 of any future implementation.

Also extend the SPA activator (~line 3470):
```js
} else if (_isAzkarEveningPage) {
    _activatePageOnce('page-azkar-evening');
    _deferOnMoon(_loadAzkarEvening);
}
```

### Step 10 — testing checklist
Before push, verify against the 20-element checklist (§0). Critical asserts:
- `curl /azkar/evening-azkar | grep -c '<article class="azkar-card-item'` → matches item count
- `curl /azkar/evening-azkar | grep -c 'data-ssr-rendered="1"'` → 1
- `curl /azkar/evening-azkar | grep -c '<h1\b'` → 1
- Visit via Claude Preview: CLS = 0 on mobile (390/430) + desktop (1366)
- Counter tap + undo + reset + mark-read all behave
- localStorage hydration after reload restores per-item state
- Dark mode renders text/borders/buttons clearly
- Cache-buster bumps: `js/app.js?v=…`, `sw.js CACHE_VERSION`

---

## 17. What NOT to do

| ❌ Don't | ✅ Do instead |
|---|---|
| Render list client-side only (empty `<div>` in SSR) | SSR-render all cards; JS hydrates |
| Add `min-height: Npx` to reserve list space | SSR content fills space naturally — no hack |
| Duplicate UI labels in textContent + aria-label + title | One visible label; aria-label optional for screen readers |
| Verbatim-copy morning FAQ to new category | Write category-specific Q/A (keep keyword-bridge ones) |
| Combine multiple categories into `/azkar` page | Each category has its own URL |
| Add a new H1 inside an inactive `.page` wrapper | Register in `_getActiveH1Marker` so it stays H1 only when active |
| Change `body` background or global palette in dark mode | Scope all overrides under `html[data-theme="dark"]` |
| Share localStorage key across categories | Per-category `azkar.progress.{cat}` |
| Auto-translate dhikr text or paraphrase | Verbatim from trusted Arabic source |
| Skip cache-buster bumps when JS/CSS changes | Bump `?v=N` + SW `CACHE_VERSION` |
| Reorder `id` values in azkar-data.js | IDs are stable forever — localStorage depends on them |

---

## 18. Open questions (decisions parked for future review)

1. **EN + 8 other-lang translations**: Phase 1 ships AR + EN. Should we
   translate to all 10 langs at category launch, or defer to a single
   batch after all categories are live?
2. **Audio recitation**: out of scope for V1. If added, must not affect CLS.
3. **Push reminders ("اقرأ أذكار المساء")**: out of scope.
4. **Per-category accent color** (e.g., orange for evening to suggest sunset):
   would need a CSS variant + dark-mode pair. Default: keep green.
5. **Refactor `_loadAzkarMorning` → `_loadAzkar(category)` parametric**:
   nice-to-have. Defer until 2-3 categories exist so the abstraction is
   informed by real variation.
6. **Sibling category navigation** (`أذكار الصباح ← → أذكار المساء` at the
   top of each page): not in V1 morning. Add when 2+ categories live.

---

## 19. Approval record

| Date | Decision | Approver |
|---|---|---|
| 2026-05-26 | Template V1 approved as the canonical pattern for all future azkar reading pages. | User (chat) |
| 2026-05-26 | Morning page (`/azkar/morning-azkar` at commit `baf0289`) is the reference implementation. | User (chat) |
| 2026-05-26 | Evening azkar (and all other categories) MUST follow this template. No new design strategy. | User (chat) |

---

## 20. Maintenance

When the morning page changes in ways that should propagate to all
categories (e.g., a new SEO field, a new dark-mode token, a new sticky-bar
height), update:
1. This document (`reports/azkar-reading-page-template-v1.md`)
2. The reference implementation (`/azkar/morning-azkar`)
3. Each live category page that already follows the template

Or — bump to `V2`:
1. Create `reports/azkar-reading-page-template-v2.md` with the new contract.
2. Migrate categories one-by-one.
3. Mark this file as `STATUS: SUPERSEDED BY V2` at the top.

---

**End of document.**
