# HOME-SEARCH-SOURCE-OF-TRUTH-RECHECK-1 — Audit Report

**Date:** 2026-05-25
**Status:** 🟡 AUDIT ONLY — NO CODE CHANGES MADE.
**Triggered by:** Contradiction noticed after the previous audit (`HOME-SEARCH-REGRESSION-AUDIT-1`) — internal pages (/moon-today, /qibla) look correct in their search dropdown, but the homepage doesn't. If they were both meant to share the same component, the previous "no regression" verdict is incomplete.

---

## 1 — Was the previous audit incomplete? ✅ YES

**The previous audit named `/search-test` as the source-of-truth.** That was wrong. The actual reference the moon/qibla pages use is the `.city-page-search .cps-suggestions .suggestion-item` rule set introduced in commit **`afa01e4`** (2026-04-23, `feat(hijri): redesign year/month/day pages as Answer Pages + SEO polish`).

`/search-test` is **self-contained** (own `.search-test-*` CSS in its HTML file). It was the EXPERIMENTAL/PROOF page for the v2 backend fetcher. The visual polish that landed on the production site went into the `.city-page-search` component — NOT into `/search-test`'s self-contained CSS, NOT into the homepage's `.loc-hero-suggestions`.

So:
- "Internal pages took it from the homepage" — **FALSE**. They took it from the `.city-page-search` component (initially for /prayer-times-in-{city}, then via `MOON/QIBLA-GENERAL-HOME-SEARCH-BOX-1` ported to /moon-today + /qibla on 2026-05-18).
- "Internal pages took it from /search-test" — **FALSE**. /search-test has its own isolated CSS.
- The visible homepage and visible moon/qibla search boxes are **different DOM components** — each with its OWN CSS rule set.

---

## 2 — Empirical diff (browser-measured today, current HEAD `1516fac`)

| Property | Homepage `/` | `/moon-today` (internal) | `/qibla` (internal) | `/prayer-times-in-jeddah` (internal) | `/search-test` (reference) |
|---|---|---|---|---|---|
| Visible input id | `loc-hero-search` | `moon-hub-search` | `qibla-hub-search` | `loc-hero-search` | `search-test-input` |
| Visible input class | `loc-hero-search--hero` | `cps-input cps-input--moon` | `cps-input cps-input--qibla` | `loc-hero-search--hero` | `search-test-input` |
| Visible dropdown id | `loc-hero-suggestions` | `moon-hub-suggestions` | `qibla-hub-suggestions` | `loc-hero-suggestions` | `search-test-suggestions` |
| Visible dropdown class | **`loc-hero-suggestions`** | **`cps-suggestions`** | **`cps-suggestions`** | **`loc-hero-suggestions`** | `search-test-suggestions` |
| Dropdown parent chain (top→down) | `.loc-hero-search-wrap` | `.cps-inner` → `.city-page-search--moon` → `.qibla-hub-hero-actions` | `.cps-inner` → `.city-page-search--qibla` → `.qibla-hub-hero-actions` | `.loc-hero-search-wrap` | `.search-test-box` |
| Result item tag | `<div>` | `<div>` | `<div>` | `<div>` | `<button>` |
| Result item class | `suggestion-item` | `suggestion-item` | `suggestion-item` | `suggestion-item` | `search-test-result` |
| **Item padding** | **12px 16px** (global) | **10px 14px** (scoped) | **10px 14px** (scoped) | **12px 16px** (global) | 12px 16px (self) |
| **Item gap** | 10px (global) | 10px (global) | 10px (global) | 10px (global) | 12px (self) |
| **Item height** | 71 px | 68 px | 68 px | 71 px | 65 px |
| **Name font-size** | **0.9 rem (14.4 px)** | **0.94 rem (15.04 px)** | **0.94 rem (15.04 px)** | **0.9 rem (14.4 px)** | 1 rem (16 px) (self) |
| Subtitle font-size | 0.8 rem (12.8 px) | 0.8 rem (12.8 px) | 0.8 rem (12.8 px) | 0.8 rem (12.8 px) | 0.83 rem (self) |
| Subtitle order | country · type | country · type | country · type | country · type | type · country (self) |
| **Dropdown box-shadow** | **0 6px 20px rgba(0,0,0,.08)** | **0 8px 24px rgba(0,0,0,.12)** | **0 8px 24px rgba(0,0,0,.12)** | **0 6px 20px rgba(0,0,0,.08)** | 0 8px 24px rgba(0,0,0,.12) (self) |
| Dropdown max-height | 320 px | 320 px | 320 px | 320 px | 360 px (self) |
| Flag srcset | none | none | none | none | yes (2× retina) |
| Visual gap input-bottom → first-name | 19 px | 25 px | 25 px | 19 px | 30 px |
| Renderer function | `_renderV2Row(ctx=_DEFAULT)` | `_renderV2Row(ctx=MOON)` | `_renderV2Row(ctx=QIBLA)` | `_renderV2Row(ctx=_DEFAULT)` | inline self-contained |
| Open control | `.open` class | `.open` class | `.open` class | `.open` class | `[hidden]` attribute |
| Mirror layer involved? | YES (mirror from hidden `#city-suggestions`) | NO (direct) | NO (direct) | YES (mirror from hidden `#city-suggestions`) | NO |

**The key column to look at is "Item padding / font-size / shadow".** Internal moon/qibla rows are visibly denser + sharper than homepage rows because they pick up the `.cps-suggestions .suggestion-item` SCOPED rule. The homepage and prayer-times-city visible rows fall through to the GLOBAL `.suggestion-item` rule from line 7211 (which is the OLDEST styling — present since the initial repo commit `64e1b0b`).

---

## 3 — Which one is the actual source-of-truth?

**The `.cps-suggestions .suggestion-item` rule** (css/style.css:11658+) introduced by commit `afa01e4` on **2026-04-23**.

That commit redesigned hijri/prayer-times-city pages as "Answer Pages" and introduced the `.city-page-search` compact search component for in-page city search. Its dropdown rule set is the polished version:

```css
.city-page-search .cps-suggestions {
    top: calc(100% + 6px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);   /* heavier */
    ...
}
.city-page-search .cps-suggestions .suggestion-item {
    padding: 10px 14px;                            /* tighter */
    font-size: 0.94rem;                            /* larger */
    ...
}
.city-page-search .cps-suggestions .suggestion-item:hover,
.city-page-search .cps-suggestions .suggestion-item.active {
    background: #eef5ef;
    color: var(--primary-dark);
}
```

This rule reached production on **2026-04-23**. It was later inherited by /moon-today + /qibla when `MOON-GENERAL-HOME-SEARCH-BOX-1` (`fbb2395`) + `MOON/QIBLA-GENERAL-HOME-SEARCH-BOX-1` (`541e0fb`) on **2026-05-18** reused the `.city-page-search` wrapper directly on those pages.

The visible homepage's `.loc-hero-suggestions` (and visible prayer-times-city `.loc-hero-suggestions` mirror destination) was **never given an equivalent scoped item rule**. `git log -S ".loc-hero-suggestions .suggestion-item" -- css/style.css` returns **zero commits**.

---

## 4 — Why moon/qibla look right but the homepage doesn't

It is NOT a regression. It is the homepage **missing a CSS rule** that internal `.city-page-search` pages have.

The pattern:
- **Polished CSS lives at**: `.city-page-search .cps-suggestions .suggestion-item` (line 11658).
- **Moon/qibla visible dropdown** has class `.cps-suggestions` inside `.city-page-search--moon|--qibla` → ✅ rule applies → polished look.
- **Homepage visible dropdown** has class `.loc-hero-suggestions` → ❌ rule does NOT apply (selector mismatch) → falls through to GLOBAL `.suggestion-item` rule at line 7211 → unpolished older look.
- **Prayer-times city visible dropdown** also has class `.loc-hero-suggestions` (same `loc-hero` hero on those pages) → ❌ same fall-through → unpolished. (User likely didn't notice prayer-times-city looking unpolished because the search is collapsed inside the hero by default — has to be expanded to see the dropdown.)

The mirror chain (`#city-suggestions` → `#loc-hero-suggestions` via `MutationObserver` in `js/app.js:9027–9097`) copies the **inner HTML** of the polished hidden dropdown into the unpolished visible one. The copied `.suggestion-item` elements then pick up CSS based on **where they live now** (inside `.loc-hero-suggestions`, NOT inside `.cps-suggestions`). So:
- Hidden source on homepage = polished (had it been visible).
- Visible mirror destination = unpolished (different container, no scoped rule).

That's the asymmetry. The "polished" CSS is scoped to `.cps-suggestions` ancestors, and the visible homepage container is `.loc-hero-suggestions` instead.

---

## 5 — Where each component came from (timeline)

| Date | Commit | Event |
|---|---|---|
| 2026-04-21 | `3017140` | Round 20 introduces `.loc-hero-search` / `.loc-hero-suggestions` (homepage hero search). No `.loc-hero-suggestions .suggestion-item` scoped rule was ever added — falls through to legacy global `.suggestion-item`. |
| 2026-04-23 | **`afa01e4`** | **Introduces `.city-page-search` component + the polished `.cps-suggestions .suggestion-item` scoped rule** (for /prayer-times-in-{city} compact in-page search, hidden by default on city pages by `html.city-page #city-page-search { display: none !important }` at css/style.css:11542). |
| 2026-05-12 | `e4b2779` | `/search-test` page created — self-contained (own `.search-test-*` CSS). Reference for v2 backend, NOT for visual styling. |
| 2026-05-15 | `49522d7` | `HOME-SEARCH-MIGRATION-PLAN-1` — homepage v2 backend fetcher ported from /search-test. Comment explicitly says "no CSS migration". |
| 2026-05-18 | `fbb2395` | `MOON-GENERAL-HOME-SEARCH-BOX-1` — /moon-today wired to reuse the `.city-page-search` wrapper directly. INHERITS the polished `.cps-suggestions .suggestion-item` styling automatically. |
| 2026-05-18 | `541e0fb` | `MOON/QIBLA-GENERAL-HOME-SEARCH-BOX-1` — /qibla too. Same inheritance. |
| 2026-05-18 | `4e9e8e3` | `.city-page-search--moon, .city-page-search--qibla { display: block !important }` — makes the wrapper visible on those pages (it had inherited the hidden default). |

So the "polished" styling propagated **automatically** to moon/qibla when those pages ADOPTED the `.city-page-search` wrapper as their visible search container.

The homepage never got that wrapper visible (`.city-page-search` is hidden on the homepage), and `.loc-hero-suggestions` never got an equivalent rule. Therefore homepage is "stuck" on the legacy global `.suggestion-item` styling.

---

## 6 — Files/rules with the truth

### The polished rule (the one to mirror)
- `css/style.css:11658–11673` — `.city-page-search .cps-suggestions .suggestion-item` + `:last-child` + `:hover` + `.active`
- `css/style.css:11686–11699` — `.city-page-search .cps-suggestions` (container: shadow + radius + max-height)

### Where it currently applies (production)
- `/moon-today` (`.city-page-search--moon`)
- `/qibla` (`.city-page-search--qibla`)
- `/moon-today-in-{city}` (collapsible hero with the same wrapper)
- Hidden on /prayer-times-in-{city} (by design — there the loc-hero search is the visible one)

### Where it does NOT apply (the homepage and prayer-times-city visible)
- `/` (homepage) — uses `loc-hero-search` + `loc-hero-suggestions`. **No scoped `.loc-hero-suggestions .suggestion-item` rule exists.** Falls through to global `.suggestion-item` (css/style.css:7211 — initial commit).
- `/prayer-times-in-{city}` visible — same as homepage (same hero component).

---

## 7 — What the previous audit got wrong

`HOME-SEARCH-REGRESSION-AUDIT-1` concluded:
> "The homepage was never visually identical to /search-test… the divergence is original, not a later regression."

That's narrowly true (homepage ≠ /search-test by design), but it answered the WRONG question. The user's real complaint is "homepage ≠ moon/qibla", and the answer there is:
- **Moon/qibla inherited the polished `.cps-suggestions` styling for FREE because they reused the `.city-page-search` wrapper.**
- **The homepage never adopted that wrapper for its visible dropdown** — it kept the older `loc-hero-suggestions` wrapper, which has no equivalent scoped item-rule.
- The polished rule has existed in the codebase since 2026-04-23. The homepage simply never got an analogous rule.

So this is NOT "stuck on test-search style" or "regressed from test-search style" — it's "missed a CSS-rule rollout that internal pages got" on 2026-04-23, then again on 2026-05-18 when moon/qibla joined.

---

## 8 — Recommendation for the future fix wave (DO NOT EXECUTE)

Suggested wave name: **`HOME-SEARCH-LOC-HERO-ITEM-RULE-PARITY-1`** (or shorter: `HOME-SEARCH-MATCH-MOON-LOOK-1`).

Two implementation paths — both **scoped to the homepage's `.loc-hero-suggestions`**, both purely CSS-additive (no markup / JS / data / routes changes):

### Option A — Mirror the polished rule into `.loc-hero-suggestions` (smallest delta)

Add new CSS block right next to the existing `.loc-hero-suggestions` rule (css/style.css:10607):

```css
.loc-hero-suggestions {
    /* existing styles unchanged… */
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);   /* was 0 6px 20px ... */
}

.loc-hero-suggestions .suggestion-item {
    padding: 10px 14px;
    font-size: 0.94rem;
    color: var(--text, #1f2a1c);
}
.loc-hero-suggestions .suggestion-item:last-child { border-bottom: 0; }
.loc-hero-suggestions .suggestion-item:hover,
.loc-hero-suggestions .suggestion-item.focused {
    background: #eef5ef;
    color: var(--primary-dark, #1b5e20);
}
```

After this 12-line addition the homepage visible dropdown rows match moon/qibla rows pixel-for-pixel.

**Side effect on `/prayer-times-in-{city}`**: the visible loc-hero search on those pages would also pick up the polished look. That's almost certainly desirable (one less drift), but should be confirmed before deploy.

### Option B — Replace `.loc-hero-suggestions` wrapper with `.cps-suggestions` (deeper)

Modify the homepage markup (`index.html`) so the visible hero dropdown actually IS a `.city-page-search`-style block, then delete the mirror layer in `js/app.js:9027–9097`. Much bigger surgery — touches markup + JS + the mirror's event-delegation. Not recommended for a polish wave.

**Recommendation:** Option A. Single CSS addition, zero risk to JS/markup/data, and it brings prayer-times-city's visible search into parity as a bonus.

### What NOT to do in the fix wave
- Do NOT change `/search-test` (it's the experimental sandbox, separate concern).
- Do NOT flip subtitle order to "type · country" (the production styling on internal pages keeps "country · type" — verified empirically).
- Do NOT add flag srcset universally without a separate task (it's a nice retina upgrade but ortho­gonal to the parity issue).
- Do NOT touch `.cps-suggestions` rules (they are the source-of-truth — must be preserved exactly).
- Do NOT shrink the hero input (per prior user guidance).

---

## 9 — Direct answers to the audit questions

1. **What is the actual source of the search component internal pages now use?**
   `.city-page-search` wrapper + `.cps-suggestions` dropdown class + scoped `.cps-suggestions .suggestion-item` CSS rule (added 2026-04-23 by `afa01e4`).
2. **Did internal pages take search from the homepage?**
   No. They took it from the `.city-page-search` component that landed on 2026-04-23. Moon/qibla joined on 2026-05-18 by adopting that wrapper directly. The homepage never adopted that wrapper for its visible dropdown.
3. **Did they take it from /search-test?**
   No. /search-test is fully self-contained (own `.search-test-*` CSS), and its rules never landed in `css/style.css`.
4. **Are they using a different helper/renderer?**
   They use the **same JS renderer** (`_renderV2Row` in `js/app.js:5917`) — `541e0fb` refactored it to accept a `ctx`. Only the CONTAINER class differs (`.cps-suggestions` vs `.loc-hero-suggestions`), and the CSS for rows is selected by the container, not by the renderer.
5. **Is the homepage stuck on an older version while internal pages use a newer one?**
   Effectively yes — but at the CSS layer, not the JS layer. The homepage's visible container has no scoped row rules, so it falls through to the 2025-era global `.suggestion-item`. Internal moon/qibla containers have the 2026-04-23 scoped row rules.
6. **Or is the same code present but a CSS/parent in the homepage breaks the look?**
   This is the real answer: the rendered rows are identical HTML. The CONTAINER class on the homepage doesn't match any scoped row-rule, so the visible rows fall through to the legacy global rule.

---

## 10 — No-fix confirmation

This audit phase made **NO code changes**:
- No edits to `js/app.js`.
- No edits to `css/style.css`.
- No edits to `index.html`.
- No edits to `server.js`.
- No edits to `db/places/search-test.html`.
- No edits to curated data.
- No new commits, no reverts, no cache-buster bumps.
- The browser session was used only for read-only DOM measurements + screenshots.
- The only file created is this report: `reports/home-search-source-of-truth-recheck-1.md`.

The `/search-test` page remains intact. The homepage remains in its current unchanged state. No fix wave was started.
