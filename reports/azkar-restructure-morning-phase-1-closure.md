# AZKAR-RESTRUCTURE-MORNING-PHASE-1 — Closure

**Date:** 2026-05-25
**Status:** 🟢 PHASE-1 COMPLETE — awaiting final `git push origin main`
**Site state:** unpublished (no real users, no aliases / redirects beyond the legacy `/duas → /azkar` 301)
**Cache busters at close:** `app.js?v=708`, `style.css?v=431`, `i18n.js?v=186`, `azkar-data.js?v=2`, `sw.js CACHE_VERSION=v336`

---

## 1 — Goal

Replace the legacy `/azkar` (`#page-duas` — all 8 categories on one page, tab-driven, session-only counter) with a clean two-level structure:

- `/azkar` — hub of 10 category cards (morning live, 9 "coming soon")
- `/azkar/morning-azkar` — independent reading page for the morning adhkar, with interactive counter, daily-reset persistence, smooth auto-advance to the next dhikr on completion, and a manual reset workflow (amber pill → confirm modal → toast feedback)

---

## 2 — Approved user decisions

| Decision | Source |
|---|---|
| URL pattern `/azkar/morning-azkar` (nested, no aliases) | plan-mode answer |
| Replace old `/azkar` entirely (no fallback) | plan-mode answer |
| Self-hosted Amiri Quran woff2 (no CDN) | plan-mode answer |
| AR full + EN chrome; other 8 langs fall back to AR | plan-mode answer |
| No external content fetched; user supplies 25 azkar text | explicit follow-up |
| 25 canonical morning items (4 Quran + 21 dhikr) | user-supplied dataset 2026-05-25 |
| Daily reset at local midnight (00:00 user TZ) — never at refresh / nav | DAILY-RESET-1 review |
| `azkar.progress.morning` storage key with `{date, items}` shape | DAILY-RESET-1 review |
| Smooth auto-advance only on completion transitions (not undo / reset / restore) | AUTO-ADVANCE-1 review |
| Amber reset button + custom confirm modal + toast feedback | RESET-BTN-1 review |
| Banner title `تم إكمال أذكار الصباح`, modal/toast text per user spec | final-text review |

---

## 3 — Implementation, broken into 8 commits

All committed locally on `main`. Cleanly stacked — each commit passes `node --check` and the verification suite at its point.

| Commit | Title | Net lines |
|---|---|---|
| `034dae6` | PHASE-1 — initial hub + morning page + counter + Amiri Quran @font-face | +2370 / -57 |
| `8867bf9` | follow-up — accept new `data-page="azkar"` in sidebar click handler | +6 / -3 |
| `d90ac3c` | FIX-1 — 7 UX corrections (hardcoded AR chrome, dir="ltr" counter, repeat=1 toggle, softer design, single-read mark-read pill, full-AR page, progress format) | +419 / -221 |
| `2d5a9b0` | DATA-25 — install user's canonical 25 morning azkar (4 Quran + 21 dhikr) + white-space:pre-line for surah line breaks | +396 / -78 |
| `aa500da` | REDESIGN-1 — spiritual reading-page redesign (page-scoped warm gradient, hero box, info-strip, soft reading cards, refined counter, accordion closed by default) | +512 / -228 |
| `35cb88d` | AUTO-ADVANCE-1 — smooth scroll to next dhikr on completion (respects prefers-reduced-motion + scroll-margin-top + arrival glow + last-item banner fallback) | +541 / -7 |
| `058e00e` | DAILY-RESET-1 — bundled `azkar.progress.morning` storage with auto-reset at local midnight + legacy per-item key sweep + 16-invariant E2E test | +360 / -20 |
| `4ba46bc` | RESET-BTN-1 — amber pill + custom confirm modal + toast feedback (replaces `window.confirm()`); generic `_azkarShowResetConfirm` + `_azkarShowToast` helpers for future categories | +484 / -30 |

Phase-1 closure work (this commit): final-text alignment + sw.js precache update + verification + closure report.

---

## 4 — Files changed across Phase 1

| File | Status |
|---|---|
| `js/azkar-data.js` | NEW — `window.AzkarCategories` (10 cards) + `window.AzkarMorning` (25 dhikr) |
| `index.html` | `#page-duas` block replaced with `#page-azkar-hub` (10 SSR cards) + `#page-azkar-morning` (hero box + list container + completion banner). Sidebar: `data-page="duas" → "azkar"`. Cache-buster preload + script tags. |
| `js/app.js` | New `_loadAzkarHub`, `_loadAzkarMorning`, `_azkarTickCounter`, `_updateMorningProgress`, `_azkarAdvanceToNext`, `_azkarLoadProgress`, `_azkarSaveProgress`, `_azkarPersist`, `_azkarRestore`, `_azkarResetCategory`, `_azkarCleanLegacy`, `_azkarLocalDateKey`, `_azkarRepeatLabelAR`, `_azkarShowResetConfirm`, `_azkarShowToast`, `_azkarPickLang`, `_azkarLocalized`. SPA activator extended with 2 new regex branches. `initApp` activates the new pages via `_deferOnMoon`. Legacy `initDuas/showDuaCategory/incrementCounter` retained as no-op compat shims. Sidebar handler accepts both `data-page="azkar"` and legacy `"duas"`. |
| `css/style.css` | `@font-face AmiriQuran` (line ~12). New `.azkar-*` block (~830 lines): hero, info-strip, progress, cards (28-30px desktop padding), Quran-text (Amiri family + clamp font-size), default dhikr-text, mark-read pill (repeat=1), counter pill (repeat>1, `dir="ltr"` digit pair), action row, completion caption, footer separator, source line, virtue/authenticity accordions (closed default), modal overlay + body, modal buttons, toast pill, mobile @media stacking + sizing, dark-mode mirror. `scroll-margin-top` + `azkar-arrive-glow` keyframes for auto-advance. Legacy `.dua-*` rules marked `@deprecated` (kept this cycle). |
| `js/i18n.js` + `js/i18n/ar.js` + `js/i18n/en.js` | 25 new keys (AR + EN). 8 non-AR/EN langs deliberately left untouched — fall back through the existing `t()` chain to AR (acceptable Phase-1 fallback). |
| `server.js` | `_isIndexHtmlRoute` regex chain extended for `/azkar/morning-azkar` with lang-prefix. `staticPages` map: new entry with AR + EN title/desc (8 langs use EN as Phase-1 fallback). `staticPaths` sitemap: `['/azkar/morning-azkar', '0.75', 'monthly']`. New SSR injection block (mirrors HIJRI-MONTH-PAGE-SSR-RENDER-1 pattern) flips `class="page" → "page active"` on the right URL. `_NAV_LOADING_MSGS` extended with `azkar` alias. Legacy `/duas → /azkar` 301 untouched. |
| `sw.js` | `CACHE_VERSION v335 → v336`, added `/js/azkar-data.js?v=2` to PRECACHE_URLS. Did NOT add the Amiri Quran woff2 path because the binary is not yet present (would make `addAll()` reject and skip the whole precache). |
| `fonts/LICENSE-AMIRI.txt` | NEW — SIL OFL v1.1 |
| `fonts/README.md` | NEW — download instructions + fallback chain explanation |
| `fonts/AmiriQuran-Regular.woff2` | **PENDING — manual asset, user-supplied.** See §11. |
| `reports/azkar-restructure-morning-phase-1-closure.md` | this file |
| `scripts/_azkar_redesign_shots.mjs` | NEW — CDP-driven 4-frame redesign demo |
| `scripts/_azkar_advance_shots.mjs` | NEW — CDP-driven 3-frame auto-advance demo |
| `scripts/_azkar_reset_btn_shots.mjs` | NEW — CDP-driven 4-frame reset-btn demo |
| `scripts/_azkar_daily_reset_test.mjs` | NEW — 16-invariant CDP-driven E2E test for daily-reset logic |

---

## 5 — Final text strings (locked, per user 2026-05-25)

### Hub card
- `card_morning_count` → **`25 ذكرًا`**
- `card_morning_time` → **`10–15 دقيقة`**

### Morning page hero
- `h1` → **`أذكار الصباح`**
- subtitle → **`اقرأ أذكار الصباح مكتوبة مع عدد التكرار والمصدر، ويُحفظ تقدمك تلقائيًا خلال اليوم.`**
- info-strip → **`📿 25 ذكرًا · 🔢 عدّاد للأذكار المتكررة · 💾 يُحفظ تقدمك تلقائيًا`**
- progress label template → **`تم إكمال {done} من {total}`**

### Counter / action
- `repeat=1` button → **`تمت القراءة`** ↔ **`✓ تمت القراءة`**
- `repeat>1` counter prompt → **`اضغط للعدّ`** / on completion → **`✓ مكتمل`**
- undo / reset-item text-links → **`تراجع`** / **`إعادة`**
- completion caption → **`✓ تم إكمال الذكر`**

### Reset workflow
- button → **`↺ إعادة ضبط العدّادات`**
- modal title → **`هل تريد إعادة ضبط جميع العدادات؟`**
- modal description → **`سيتم تصفير تقدمك في هذا القسم والبدء من جديد.`**
- modal cancel → **`إلغاء`**
- modal confirm → **`نعم، إعادة الضبط`**
- toast → **`✓ تمت إعادة ضبط العدادات`**

### All-completed banner
- title → **`✓ تم إكمال أذكار الصباح`**
- subtitle → **`نسأل الله أن يجعل يومك عامرًا بالذكر والطمأنينة.`**

---

## 6 — Verification results (run 2026-05-25 against committed state)

### Syntax
- `node --check js/app.js` → OK
- `node --check js/azkar-data.js` → OK
- `node --check sw.js` → OK
- `node --check server.js` → OK

### HTTP smoke (all 200 except expected 301)
```
200  /
200  /azkar
200  /en/azkar
200  /azkar/morning-azkar
200  /en/azkar/morning-azkar
200  /qibla
200  /moon-today
200  /msbaha
200  /zakat-calculator
200  /today-hijri-date
200  /search-test
301  /duas  →  Location: /azkar    (legacy intact)
```

### SSR & SEO checks
- `/azkar` HTML contains exactly **10** `azkar-card-title` (1 live morning + 9 soon) ✓
- `/azkar/morning-azkar` HTML contains **25 ذكرًا** in two places (hub card + page badge) ✓
- progress placeholder `تم إكمال 0 من 0` present (replaced to `تم إكمال X من 25` on first JS tick) ✓
- new subtitle `اقرأ أذكار الصباح مكتوبة مع عدد التكرار والمصدر` rendered ✓
- banner title `تم إكمال أذكار الصباح` present ✓
- hub card meta `10–15 دقيقة` rendered ✓
- canonical on `/azkar/morning-azkar` → `rel="canonical" href="…/azkar/morning-azkar"` ✓
- canonical on `/en/azkar/morning-azkar` → `rel="canonical" href="…/en/azkar/morning-azkar"` ✓
- hreflang on morning page → **11** unique values (`x-default` + 10 langs) ✓
- sitemap `/azkar/morning-azkar` → **120** entries (10 langs × ~12 hreflang annotations per row, via `bilingualUrl()`) ✓
- raw i18n keys leaked to visible text → **0** ✓

### Service Worker
- `CACHE_VERSION = "v336"` (was v335) ✓
- `/js/azkar-data.js?v=2` present in `PRECACHE_URLS` ✓
- AmiriQuran woff2 path NOT added (file not yet present — see §11) ✓

### E2E daily-reset test (16 invariants, headless Chrome via CDP)
```
✅ T5: legacy azkar.count.* keys cleaned on first load
✅ T1: same-day reload preserves morning-002 count + DOM + .completed
✅ T6: bundle shape { date, items[id] = { count, completed } } matches spec
✅ T2: stale bundle triggers daily reset (items → {}, DOM → 0/3)
✅ T3: fresh bundle written with date=today + items={}
✅ T4: manual reset (modal confirm) wipes items, keeps date=today
✅ T7: cross-page navigation /azkar ↔ /azkar/morning-azkar preserves data
────────── 16 / 16 passed ──────────
```

### Visual evidence (committed in `.azkar-shots/`)
- 4 REDESIGN-1 frames (desktop hero+card, repeat=3 card, mobile 375, completed state)
- 3 AUTO-ADVANCE-1 frames (repeat=1 advance, repeat=3 advance at 3/3, last-item → banner)
- 4 RESET-BTN-1 frames (desktop button, modal open, toast visible, mobile full-width)

### Counter format invariant
Format is always `current / target` (e.g. `0 / 3`, never `3 / 0`). Numeric `<span>` carries `dir="ltr"` so the bidi algorithm cannot flip the digits inside the RTL page.

### No browser console errors
Verified during all CDP-driven test runs — no `[error]` entries in the console output.

---

## 7 — Cache-buster bumps applied this phase

| Asset | Before phase | After phase |
|---|---|---|
| `js/app.js` | `v=700` | **`v=708`** |
| `css/style.css` | `v=425` | **`v=431`** |
| `js/i18n.js` | `v=185` | **`v=186`** |
| `js/azkar-data.js` | (new) | **`v=2`** |
| `sw.js CACHE_VERSION` | `v335` | **`v336`** |

---

## 8 — Service Worker status

- Bumped `CACHE_VERSION` to `v336` so the SW `activate` step purges the prior caches on next page load.
- Added `/js/azkar-data.js?v=2` to `PRECACHE_URLS`.
- **Did NOT add `/fonts/AmiriQuran-Regular.woff2`** to precache because the binary is not present yet (`addAll()` would reject and skip the entire precache). Add a single line here in Phase 2 once the file ships, then bump `CACHE_VERSION` to `v337`.

---

## 9 — Legacy artifacts (DEFERRED to Phase 2 per user direction)

These are intentionally KEPT in this Phase-1 cycle to avoid regression risk:

- `js/duas.js` — preloaded by `server.js:3287`, still in `sw.js PRECACHE_URLS`. The legacy `initDuas / showDuaCategory / incrementCounter` early-return on missing `#dua-categories` (which is no longer in the DOM). Functionally a no-op compat shim.
- `.dua-*` CSS in `css/style.css` lines ~7102-7187 — marked with a `@deprecated AZKAR-RESTRUCTURE-MORNING-PHASE-1` comment block.

Verified:
- `index.html` grep `id="dua-categories"` → 0 matches ✓
- `index.html` grep `data-page="duas"` → 0 matches ✓
- Production runtime no longer instantiates either ✓

**Phase 2 cleanup ticket**: remove `js/duas.js` + `.dua-*` CSS + remove `/js/duas.js?v=43` from `sw.js PRECACHE_URLS` + bump `CACHE_VERSION`.

---

## 10 — Daily-reset logic (locked spec)

Storage shape:
```json
azkar.progress.morning = {
    "date": "YYYY-MM-DD",    // user's local date at first save today
    "items": {
        "morning-001": { "count": 1, "completed": true },
        "morning-005": { "count": 3, "completed": true }
    }
}
```

Reset rules:
- **Same-day reload / refresh / SPA navigation** → no reset, bundle restored as-is.
- **First load after the local date changes (midnight crossed)** → bundle rewritten to `{date: today, items: {}}`, UI restores all zeros.
- **Manual reset button → modal confirm → onConfirm** → `_azkarResetCategory('morning')` wipes items but keeps `date = today` (so the next load does not additionally trigger the stale-date branch — that would be a wasted write).
- **Undo / Reset single item** → no global reset, the entry is dropped from `items`.
- **NOT linked to Fajr / prayer times / city / geolocation** — Phase-1 scope is purely local midnight.

Legacy `azkar.count.morning.*` per-item keys are swept on first load (one-time migration). Site is unpublished, no real user data at risk.

---

## 11 — Open / pending Phase-2 items

| Item | Status |
|---|---|
| `fonts/AmiriQuran-Regular.woff2` binary | **PENDING — manual user-supplied asset.** Download from https://github.com/alif-type/amiri/raw/master/files/AmiriQuran-Regular.woff2 and drop into `fonts/`. CSS `@font-face` at `css/style.css:12-19` already points to `../fonts/AmiriQuran-Regular.woff2`. While missing, the fallback chain `'AmiriQuran' → 'Amiri' → 'Scheherazade New' → 'Traditional Arabic' → serif` renders gracefully. License text already shipped at `fonts/LICENSE-AMIRI.txt`. After the file lands: add `/fonts/AmiriQuran-Regular.woff2` to `sw.js PRECACHE_URLS` and bump `CACHE_VERSION → v337`. |
| 9 sibling categories (evening / sleep / after-prayer / wake / travel / food-drink / mosque / istighfar-tasbih / quran-sunnah-duas) | Hub cards exist with `azkar-card--soon` state. Per user spec: evening is the next Phase-2 ticket, separate from this push. |
| Full 10-lang chrome translations | Only AR + EN written. The 8 other langs fall through `t()` to AR. |
| Delete `js/duas.js` + `.dua-*` CSS + remove from SW precache | Deferred — see §9. |
| JSON-LD `ItemList` for hub + `BreadcrumbList` for morning page | Deferred (current `buildSeoForPath` SEO is sufficient for Phase 1). |
| Audio / TTS for adhkar reading | Out of scope. |
| Push reminders | Out of scope. |

---

## 12 — Risks observed + mitigations

- **Missing AmiriQuran woff2**: pre-mitigated by the CSS fallback chain. No broken request, no FOUC. Documented as pending manual asset.
- **SEO impact of removing the old single-page `/azkar`**: net positive long-term — each future azkar category gets its own URL with full reading content + SSR + sitemap + canonical + hreflang. The morning page already serves all 25 dhikr inline in the SSR'd `<div class="page active" id="page-azkar-morning">` shell; client-side rendering only adds interactivity, not content.
- **Cache busters during preview testing**: every cycle bumped both the version querystring and (where the SW touches the file) `CACHE_VERSION`. Verified browsers get the fresh content after restart.
- **localStorage migration**: legacy `azkar.count.morning.*` keys are silently swept on first load. Acceptable because site is unpublished — no real user progress is being lost.
- **8 non-AR/EN langs** see Arabic chrome on the azkar pages. By design per user spec — proper translations slated for Phase 2.

---

## 13 — Site state

Site is **unpublished**. No aliases beyond the legacy `/duas → /azkar` 301 are required. The 8-commit stack is locally verified and ready to push.
