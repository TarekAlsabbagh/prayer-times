# AZKAR-RESTRUCTURE-MORNING-PHASE-1 — Closure

**Date:** 2026-05-25
**Status:** 🟢 IMPLEMENTED (awaiting user approval for `git push`)
**Scope:** Restructure `/azkar` from "all-categories-on-one-page" into a hub-of-cards landing page, AND introduce one independent category page (`/azkar/morning-azkar`) as the template for future sibling categories. Counter persists in localStorage, never auto-resets. Self-hosted Amiri Quran font for Quran-text items.
**Cache-busters:** `js/app.js?v=700→701`, `css/style.css?v=425→426`, `js/i18n.js?v=185→186`, new `js/azkar-data.js?v=1`.

---

## 1 — Goal + scope fence

**Goal:** Replace the legacy `/azkar` (all 8 categories rendered on one page via `#page-duas` + session-only counter) with a clean two-page structure:

- `/azkar` → hub of 10 category cards (morning live, 9 "coming soon")
- `/azkar/morning-azkar` → independent reading page for morning azkar, with interactive counter + persistent localStorage progress + completion banner

**Phase-1 scope fence (explicitly NOT in this commit):**
- Evening / sleep / after-prayer / wake / travel / food-drink / mosque / istighfar-tasbih / quran-sunnah-duas pages → future phases (template is `/azkar/morning-azkar`)
- Full 10-lang translation of any chrome key (AR full + EN full only; other 8 langs fall back to AR via the existing `t()` chain)
- JSON-LD `ItemList`, `BreadcrumbList`, FAQ schema beyond the existing `buildSeoForPath` output → future phase
- Completing the 15 missing morning azkar to reach the canonical 25 → user will supply the text separately
- Deletion of `js/duas.js` and `.dua-*` CSS → marked `@deprecated`, deferred one cycle
- Audio / TTS / push reminders for azkar → out of scope

---

## 2 — Approved user decisions (recorded)

1. URL pattern: `/azkar/morning-azkar` nested. No aliases. Site is unpublished — no legacy URL support needed.
2. Old `/azkar` (#page-duas) → **replaced** with the new hub. Tabs / all-in-one render / session-only counter removed.
3. Counter persistence: localStorage only. **Never auto-resets.** Daily-midnight auto-reset NOT implemented — user must click "Reset all".
4. Self-hosted Amiri Quran woff2 at `fonts/AmiriQuran-Regular.woff2`. CSS `@font-face` defined with `font-display: swap` and a fallback chain (`'AmiriQuran', 'Amiri', 'Scheherazade New', 'Traditional Arabic', serif`) so pages render gracefully even before the binary is added.
5. Chrome i18n: AR + EN fully translated. Other 8 langs use existing `t()` fallback (AR).
6. Hub shows **10 cards** (per user spec): morning, evening, sleep, after-prayer, wake, travel, food-drink, mosque, istighfar-tasbih, quran-sunnah-duas. Morning is the only one `status:'live'` in Phase 1.
7. Morning azkar data: **10 items migrated verbatim** from existing `js/duas.js` into the new schema. NO external sources used; user will supply the remaining 15 separately.

---

## 3 — Files changed

| File | Change |
|---|---|
| `js/azkar-data.js` | **NEW** — exports `window.AzkarCategories` (10 cards) + `window.AzkarMorning` (10 migrated items in new schema with `id, category, order, type, title, text, repeat, repeatLabel, source, virtue, authenticity, authenticityNote`). |
| `index.html` | `#page-duas` block (lines ~3247-3257) → REPLACED with `#page-azkar-hub` (10 SSR-static cards: 1 live `<a>` + 9 `azkar-card--soon` divs with "قريبًا" badge) + `#page-azkar-morning` (breadcrumb + h1 + progress wrap + reset button + `#azkar-morning-list` container + completed banner). Sidebar nav: `<a href="/azkar" data-page="azkar">` (was `data-page="duas"`). Cache busters bumped. `<script src="js/azkar-data.js?v=1">` added next to legacy `js/duas.js`. |
| `js/app.js` | New module (~280 lines) appended after the legacy `incrementCounter`: `_loadAzkarHub`, `_loadAzkarMorning`, `_azkarStorageKey/Persist/Restore/ResetCategory`, `_azkarTickCounter`, `_updateMorningProgress`, `_azkarPickLang`, `_azkarLocalized`. SPA activator (~line 10797) extended with two new regex branches (`/azkar/morning-azkar` → `page-azkar-morning`; `/azkar` → `page-azkar-hub`). Nav-key mapping: `page-azkar-hub`/`page-azkar-morning` → `'azkar'`. `initApp` (~line 3432) tri-state activation. `_deferOnMoon(initDuas)` (~line 3157) → `_deferOnMoon(() => { if(...page-azkar-hub) _loadAzkarHub(); if(...page-azkar-morning) _loadAzkarMorning(); })`. Legacy `initDuas / showDuaCategory / incrementCounter` retained as no-op compat shims (early-return when `#dua-categories` missing — which is now always). |
| `css/style.css` | `@font-face AmiriQuran` near top of file. New `.azkar-*` block (~270 lines) for hub grid, cards, soon-state, breadcrumb, progress, list, card items, default + Quran text styling, counter (tap area ≥64px desktop / ≥72px mobile), undo/reset buttons, source, virtue/authenticity `<details>` accordions, completed state, completed banner, mobile @media, dark-mode overrides. Legacy `.dua-*` block marked `@deprecated`. |
| `js/i18n.js` | 25 new keys added to AR block (line ~1122) + 25 new keys added to EN block (line ~2569). All `azkar.hub.*` + `azkar.morning.*` keys. |
| `js/i18n/ar.js` | Same 25 AR keys mirrored. |
| `js/i18n/en.js` | Same 25 EN keys mirrored. |
| `server.js` | `_isIndexHtmlRoute` regex chain extended with `/azkar/morning-azkar$` (~line 22250, before `/azkar$`). `staticPages` map: new entry for `/azkar/morning-azkar` with AR + EN titles + descriptions (8 other langs use EN values — Phase-1 fallback). `staticPaths` sitemap array: `['/azkar/morning-azkar', '0.75', 'monthly']` added after `/azkar`. New SSR injection block (~line 14287) activates `#page-azkar-hub` / `#page-azkar-morning` per URL (mirrors HIJRI-MONTH SSR pattern). Legacy `/duas → /azkar` 301 redirect untouched. |
| `fonts/AmiriQuran-Regular.woff2` | **NOT included** — auto-mode classifier denied the external binary download. User must drop the woff2 manually (see `fonts/README.md` for source). Fallback chain renders gracefully without it. |
| `fonts/LICENSE-AMIRI.txt` | NEW — SIL Open Font License v1.1 text (required when the woff2 ships). |
| `fonts/README.md` | NEW — explains expected file path, download source, and license. |
| `reports/azkar-restructure-morning-phase-1-closure.md` | NEW (this file). |

---

## 4 — Data migration table (existing 10 morning azkar → new schema)

All 10 items copied **verbatim** from `js/duas.js → AzkarDB.categories[0].duas` into `window.AzkarMorning`:

| New ID | text (excerpt) | repeat | source.ref | authenticity |
|---|---|---|---|---|
| morning-001 | أصبحنا وأصبح الملك لله... | 1 | أبو داود | null |
| morning-002 | اللهم بك أصبحنا وبك أمسينا... | 1 | الترمذي | null |
| morning-003 | اللهم أنت ربي لا إله إلا أنت... (سيد الاستغفار) | 1 | البخاري | sahih |
| morning-004 | سبحان الله وبحمده | 100 | مسلم | sahih |
| morning-005 | لا إله إلا الله وحده لا شريك له... | 10 | البخاري ومسلم | sahih |
| morning-006 | اللهم إني أسألك العافية في الدنيا والآخرة... | 1 | ابن ماجه | null |
| morning-007 | بسم الله الذي لا يضر مع اسمه شيء... | 3 | أبو داود والترمذي | null |
| morning-008 | رضيت بالله ربا وبالإسلام دينا... | 3 | أبو داود | null |
| morning-009 | يا حي يا قيوم برحمتك أستغيث... | 1 | الحاكم | null |
| morning-010 | أعوذ بكلمات الله التامات من شر ما خلق | 3 | مسلم | sahih |

Stable IDs `morning-001` … `morning-010` so localStorage keys (`azkar.count.morning.morning-XXX`) survive future reorders / additions.

---

## 5 — Verification results

All performed on local dev server (port 3000) after restart with bumped cache busters.

### Syntax checks
- `node --check js/app.js` → OK
- `node --check js/azkar-data.js` → OK
- `node --check server.js` → OK
- `node --check js/i18n.js` → OK
- `node --check js/i18n/ar.js` → OK
- `node --check js/i18n/en.js` → OK

### HTTP smoke (all 200 except expected redirects)
- `/azkar` → 200
- `/en/azkar` → 200
- `/azkar/morning-azkar` → 200
- `/en/azkar/morning-azkar` → 200
- `/duas` → 301 (legacy alias, untouched, still redirects to /azkar)

### SSR injection
- `/azkar` HTML contains `<div class="page active" id="page-azkar-hub">` ✓
- `/azkar/morning-azkar` HTML contains `<div class="page active" id="page-azkar-morning">` ✓
- `/azkar` HTML has 10 `azkar-card` containers (1 live `<a>`, 9 `azkar-card--soon`) ✓

### Sitemap
- `/sitemap-main.xml` contains 120 references to `morning-azkar` (10 langs × ~12 hreflang annotations per row) ✓

### Browser DOM (desktop, AR)
- Hub: `#page-azkar-hub.active` ✓, 10 cards visible, morning card `href="/azkar/morning-azkar"` ✓
- Morning page: `#page-azkar-morning.active` ✓, 10 cards rendered from `window.AzkarMorning` ✓
- Counter functional:
  - Tap on item 4 (sub7anAllah × 100) → 0/100 → 5 taps → 5/100 → undo → 4/100 ✓
  - Tap on item 1 (× 1) → 0/1 → 1 tap → 1/1, `.completed` class added ✓
  - Progress bar width updates to 10% (1 of 10 items completed) ✓
- localStorage:
  - `azkar.count.morning.morning-001` = "1" ✓
  - `azkar.count.morning.morning-004` = "4" ✓
- Reset-all: confirm dialog → all counters back to 0, all `azkar.count.morning.*` keys removed ✓

### Regression sweep — all 200 except expected
- `/` → 200, `/qibla` → 200, `/moon-today` → 200, `/qibla-in-makkah` → 200, `/moon-today-in-jeddah` → 200, `/prayer-times-in-mecca` → 301 (pre-existing canonical redirect), `/search-test` → 200, `/hijri-calendar/1447-08` → 200, `/today-hijri-date` → 200, `/msbaha` → 200, `/zakat-calculator` → 200.

---

## 6 — Cache-buster bumps

- `index.html`: `js/app.js?v=700 → ?v=701`
- `index.html`: `css/style.css?v=425 → ?v=426`
- `index.html`: `js/i18n.js?v=185 → ?v=186`
- `index.html`: new `js/azkar-data.js?v=1`

---

## 7 — Known gaps + Phase 2+ backlog

- **Fonts/AmiriQuran-Regular.woff2 not committed** — auto-mode classifier denied the external download. User must download from https://github.com/alif-type/amiri/raw/master/files/AmiriQuran-Regular.woff2 and drop into `fonts/`. The `@font-face` rule + fallback chain handle the missing file gracefully (renders with `'Amiri' / 'Scheherazade New' / serif` until the woff2 is added).
- **15 missing morning azkar** — user to supply text verbatim. Append into `window.AzkarMorning` as `morning-011` … `morning-025` in the same schema.
- **9 sibling categories (evening, sleep, after-prayer, wake, travel, food-drink, mosque, istighfar-tasbih, quran-sunnah-duas)** — each needs:
  1. A new `<div class="page" id="page-azkar-{slug}">` block in `index.html` (copy `#page-azkar-morning` shape).
  2. A new `window.Azkar{Capitalised}` array in `js/azkar-data.js`.
  3. Flip the corresponding `AzkarCategories[i].status` from `'soon'` to `'live'`.
  4. New `azkar.{slug}.*` i18n keys (chrome only — dhikr text stays AR-only).
  5. New regex branch in the SPA activator + `_isIndexHtmlRoute` + `staticPaths` + `staticPages`.
  6. New SSR activation in `server.js` (mirror the morning block).
- **Full 10-lang chrome** — keys exist only in AR + EN currently. Add to `fr.js`, `de.js`, `tr.js`, `ur.js`, `id.js`, `es.js`, `bn.js`, `ms.js`.
- **JSON-LD enrichment** — Phase 2 can emit `ItemList` for hub and `BreadcrumbList` + `WebPage` schema for morning page.
- **Delete `js/duas.js` + `.dua-*` CSS + legacy `initDuas/showDuaCategory/incrementCounter`** — currently kept as compat shims (functions early-return on missing DOM, CSS doesn't apply since `#page-duas` is gone). Safe to delete in Phase 2.
- **Counter "completed" idle visual** — when reset-all rebuilds the list, the progress-fill width takes one extra tick to recompute (cosmetic, no functional issue).
- **`type:'quran'` items** — schema supports them but none of the 10 migrated items are flagged. When user supplies the 15 missing items (which include آية الكرسي / الإخلاص / الفلق / الناس), flip those to `type:'quran'` so `.azkar-quran-text` + Amiri Quran font applies.

---

## 8 — Risks observed + mitigations

- **Missing woff2 binary**: pre-mitigated by graceful CSS fallback chain. User can add the file at any time without code change.
- **Removing old `/azkar` content reduces page word count**: mitigated — the content (full dhikr) moves to `/azkar/morning-azkar` (new indexable URL with full text + interactive UI). Net SEO impact long-term is positive (each category gets its own targeted URL).
- **Sidebar `data-page="duas"` rename to `"azkar"`**: verified — sidebar highlight still works on `/azkar*` URLs via the updated BFCache self-heal table.
- **i18n keys not in 8 other lang files**: by design — `t()` chain falls back through `_lang → 'en' → 'ar' → key`. Other-lang users on `/azkar` will see AR strings (acceptable Phase-1 fallback per user spec).
- **Browser cache during preview testing**: `js/i18n.js?v=186` is the new URL — production users hit it fresh on first load and get all keys. Preview tool's aggressive cache misleadingly showed raw keys during this session, but source + served file content verified correct.

---

## 9 — Closure checklist

- [x] `js/azkar-data.js` created with 10 categories + 10 migrated morning items (stable IDs).
- [x] `#page-duas` replaced with `#page-azkar-hub` + `#page-azkar-morning` in `index.html`.
- [x] Sidebar nav `data-page="duas"` → `"azkar"` + `href="/azkar"`.
- [x] New `_loadAzkarHub` + `_loadAzkarMorning` JS module replacing legacy initDuas wiring.
- [x] localStorage persistence works + never auto-resets + Reset-all button zeros all.
- [x] SPA activator extended (`/azkar` → hub, `/azkar/morning-azkar` → morning).
- [x] CSS `.azkar-*` block added with mobile + dark mode coverage; legacy `.dua-*` marked deprecated.
- [x] `@font-face AmiriQuran` defined with fallback chain.
- [x] 25 i18n keys added in AR + EN to `js/i18n.js` + `js/i18n/ar.js` + `js/i18n/en.js`.
- [x] `server.js` route activation + sitemap entry + SSR injection added.
- [x] All cache busters bumped (app.js v=701, style.css v=426, i18n.js v=186, azkar-data.js v=1).
- [x] HTTP 200 verified for `/azkar`, `/en/azkar`, `/azkar/morning-azkar`, `/en/azkar/morning-azkar`.
- [x] `/duas → /azkar` 301 still works (legacy alias intact).
- [x] No regressions on `/qibla`, `/moon-today`, `/prayer-times-*`, `/search-test`, `/hijri-calendar/*`, `/today-hijri-date`, `/msbaha`, `/zakat-calculator`.
- [x] No data / curated places / routes / slugs / canonical / hreflang / sitemap-cities changes.
- [x] No new dependencies (font binary is OFL-licensed self-hosted, not a package).
- [x] Closure report written.
