# QURAN-AR-SURAH-21-CONSISTENT-WIDTH-MOBILE-SPACING-BREADCRUMB-FAQ-AND-SEO-CONTENT-REVISION-2 → REVISION-3

**Status:** FULL-WIDTH UNIFICATION AND GLOBAL HEADER REVISION COMPLETE LOCALLY — NOT COMMITTED — NOT PUSHED — AWAITING USER APPROVAL
**Scope:** UI/UX + shell integration only. NO change to Quran text / 021.json / basmala.json / hashes / import pipeline / surah set. NO commit, NO push, NO sitemap, NO indexing (still noindex), NO Service Worker.

## 1. What changed (the two asks)

### (1) ONE outer width for every box + inner reading column
The old two-width model (site 1180 + reading 820) is gone. Now there is **ONE outer width** — `.quran-site-container` (= the site content wrap, `max-width:1180px`) — shared by **every** box: breadcrumb, hero, services, toolbar, progress, all 10 page cards, surah-end, surah-nav, about, source, FAQ. The **Quran text** stays comfortable via a centered **inner column** inside the full-width card: `.quran-ayah-flow, .quran-basmala { max-width: var(--q-read-col: 860px); margin-inline: auto }`. Cards are `width:100%; max-width:none` (uniform; height free).
- **Measured (Chromium, 1440):** hero = card₀ = toolbar = surah-end = FAQ = **1072px** (all identical); every one of the 10 cards = 1072; ayah text column = **860px** (narrower than the card); no horizontal overflow. Only ONE element px max-width in quran.css: **1180**.

### (2) The REAL global site header (not a copy)
The page is no longer a standalone document. It is now **served through the real `index.html` shell** (like the moon/azkar pages), so it gets the genuine site `.top-header` (location + theme toggle + language switcher + Home), the shared sidebar (logo + Hijri date + nav drawer), the site footer, and `app.js` — **natively, with zero copied/duplicated header**.
- **Verified (Chromium):** `.top-header` present + sticky; the header shows the live location («مكة المكرمة»), a working theme toggle (☾/☀️), the AR language switcher, and Home; the sidebar drawer opens via the site's own `toggleSidebar()`; dark mode flows from the site's own `toggleTheme()`. The whole page = a first-class site page.

**Page order (as requested):** unified header → breadcrumb → hero → services → reading toolbar → Quran cards → surah-end → about → source → FAQ → other services → unified footer. The old floating-menu-button top-padding is removed (the real header provides the spacing).

## 2. Architecture (SPA integration — the established moon/azkar pattern)
- **server.js:** `_buildQuranSurah21Prototype()` → **`_buildQuranSurah21Body()`** (content-only; no doctype/head/shell/footer). Route added to `_isIndexHtmlRoute` (flag-gated). `serveHtmlWithSeo()` injects the body into `#page-quran-surah`, flips it active, strips the default prayer-times active, and injects the route-scoped font preload + `css/quran.css?v=4` + `js/quran.js?v=4`. `_getActiveH1Marker` registers the single `#quran-surah-h1`. `staticPages['/quran/surah/21']` sets the approved Title/Meta + `noindex:true` (→ robotsOverride). The old flag-gated route now only keeps the no-JS `?ayah`/`?page` → 302 redirect, then falls through to the shell serve.
- **index.html:** added `<div class="page" id="page-quran-surah"></div>` container; bumped `js/app.js?v=838 → 839` (so the new activation branches ship).
- **js/app.js:** initApp block + `pageshow` self-heal `else if` both recognize `/quran/surah/21` → keep `#page-quran-surah` active (**no flash-to-home**).
- **js/quran.js:** scoped to `#page-quran-surah`, guarded init; **no longer redefines** `toggleSidebar`/`toggleTheme` (delegates to the site globals); theme button calls `window.toggleTheme()`.
- **css/quran.css:** de-scoped from `.quran-body`/`.quran-shell`; one-width system; ayah inner column; removed body-background + menu-button-clearance (the shell handles them).

## 3. Files modified (allowed scope)
- **server.js** (`M`, +261): body builder + route wiring + SSR injection + H1 marker + staticPages/noindex.
- **index.html** (`M`, +7/−2): `#page-quran-surah` container + app.js cache-buster 838→839.
- **js/app.js** (`M`, +10): two activation branches (initApp + pageshow).
- **css/quran.css**, **js/quran.js** (untracked prototype files): one-width + SPA-scoped enhancements.
- **21 smoke tests** (10 integrity + 11 UI, re-aligned to the SPA architecture).
- **NOT touched:** `data/quran/**`, `fonts/**`, `scripts/quran/build.mjs`, `sw.js`, sitemap.

## 4. Tests — **21/21 PASS (~235 assertions)**
The 10 pre-existing **integrity** smokes (source_checksum, surah_21_import, ayah_end_marker, basmala_derivation, unicode_preservation, page_mapping …) remain green → text/hash/112-ayah integrity intact through the re-architecture. The UI smokes were re-aligned to assert the SPA integration (route in `_isIndexHtmlRoute`, SSR injection + active flip, `_getActiveH1Marker`, noindex, app.js branches, one-width CSS). `node --check` OK for server.js / app.js / quran.js.

## 5. Browser verification (Chromium 148.0.7778.271, in-app pane; external Chrome not connected)
- **pageerror / console.error = 0.**
- `activePages = ["page-quran-surah"]`, `quranVisible = block` — **no flash-to-home** after app.js runs.
- Real `.top-header` present (location/theme/lang/home); sidebar drawer opens via site `toggleSidebar`; dark via site `toggleTheme`.
- Width: all boxes 1072 (uniform), ayah column 860, no horizontal overflow, H1 = 1.
- **Regression (I touched serveHtmlWithSeo + app.js + index.html):** `/` → active `page-prayer-times`; `/moon-today` → `page-moon`; `/azkar/morning-azkar` → `page-azkar-morning`; all HTTP 200 — the shell pipeline + SPA router are intact.
- Screenshots (in chat): desktop (header→hero, all boxes aligned), mobile (real header + margins), mobile sidebar drawer open, mobile dark.

## 6. Integrity / safety
- `git diff --stat`: `server.js` (+261), `index.html` (+7/−2), `js/app.js` (+10). `git diff --check`: no whitespace errors.
- `data/quran/**` + `fonts/**` + `scripts/quran/**`: **no modifications**.
- Route still flag-gated (`QURAN_PROTOTYPE_ENABLED=1`), **noindex**, Arabic-only (no hreflang), not in sitemap/menu, no FAQ schema.
- **No commit, no push.**

## 7. Post-revision fix — font +/− buttons (reported after REVISION-3)
**Symptom:** user reported «زر تكبير النص وتصغيره لايعمل» — the reading-toolbar font +/− buttons did nothing visible.
**Root cause (CSS custom-property cascade):** `applyFont()` set `--q-ayah-size` as an inline style on `#page-quran-surah` (the `.page` wrapper). But the variable is **declared by CSS on `.quran-surah-page`** (`css/quran.css:25`), which is a *descendant* of `#page-quran-surah`. A descendant's own declaration overrides an inherited value, so `.quran-surah-page` (and thus `.quran-ayah-flow`, `css/quran.css:127` `font-size: var(--q-ayah-size)`) always saw the CSS `clamp(...)`, never the JS-set value on the ancestor.
**Fix (`js/quran.js`, JS-only):** target the element that owns the variable — `var fontEl = shell.querySelector('.quran-surah-page') || shell;` — and set the inline var on `fontEl` inside `applyFont()`. An inline style on `.quran-surah-page` wins over both the base rule (`:25`) and the mobile `@media` override (`:223`), since neither is `!important`. Cache-buster bumped `js/quran.js?v=4 → 5` (server.js SSR injection) so the browser fetches the corrected file. No Arabic letters added; no other logic touched.
**Verified live (Chromium, `quran.js?v=5`, `data-quran-init=1`, console.error=0):** ayah `font-size` initial **24.80px** → +1 **26.72px** → +3 **30.56px** → −4 **22.88px**; preference **persists across reload** (saved step `-1` re-applied `22.88px` on init) and resets cleanly to `24.80px` at step 0. **21/21 smokes still green** (the SSR smoke matches `/js/quran.js?v=\d+` version-agnostically, so the bump is safe).

---
Status: FULL-WIDTH UNIFICATION AND GLOBAL HEADER REVISION COMPLETE LOCALLY (incl. font-button fix) — NOT COMMITTED — NOT PUSHED — AWAITING USER APPROVAL
