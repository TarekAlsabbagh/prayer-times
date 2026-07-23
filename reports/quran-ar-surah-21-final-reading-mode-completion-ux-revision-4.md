# QURAN-AR-SURAH-21 — FINAL READING MODE & COMPLETION-UX REVISION-4

**Status:** FINAL READING MODE AND COMPLETION UX FIXED LOCALLY — NOT COMMITTED — NOT PUSHED — AWAITING USER APPROVAL
**Scope:** UI/UX only (server.js SSR builder + css/quran.css + js/quran.js + smokes). NO change to Quran text / `data/quran/**` / `basmala.json` / hashes / import pipeline / fonts. NO sitemap, NO Service Worker, NO indexing (still noindex + flag-gated). NO new SEO paragraphs / FAQ (existing content kept as-is).

## 1. Surah-end box — duplicate button removed, prev/next nav KEPT (req 1, corrected)
The completion box («تمّت سورة الأنبياء») had **two** «تصفّح جميع سور القرآن» buttons — the green primary in the actions row **and** a duplicate inside the prev/next strip. **Only the DUPLICATE was removed** (not the navigation). The box is now: ✓ badge → title → one sentence → **one action row** (`العودة إلى أوّل السورة` · **`تصفّح جميع سور القرآن`** green, the single browse-all, above the cards · `مصدر النص وموثوقيته`) → **prev/next nav = two equal cards** (prev **طه / السورة رقم ٢٠** on the right, next **الحج / السورة رقم ٢٢** on the left, RTL) with a direction arrow, name prominent + number secondary. Built dynamically via `_quranNavCard(chapter, kind)` from `chapters.json` (Al-Fatiha → no prev card, An-Nas → no next card). **Prototype:** `_QURAN_SURAHS_LIVE=false` → cards are `aria-disabled`, **no href** (zero /quran/surah/{20,22} 404s), with the note «ستتوفر عند إطلاق جميع سور القرآن»; the 114-generalization flips the flag → the SAME builder emits real `/quran/surah/N` links. Cards stack to one column ≤560px. The green button still opens the 114-surah index drawer. **Critical guard kept:** zero broken sibling-surah links (`href` uses a gated `${chapter.number}` template — no literal /20|/22).

## 2. Reading mode — a true focused reading experience (req 2)
`body.quran-reading` now hides **all** site + page chrome and keeps **only** the Quran cards + a minimized bar:
- **Hidden:** `.top-header`, `.site-footer`, `#sticky-next-bar` (next-prayer countdown), `#sidebar` (desktop rail), `.menu-toggle` (mobile hamburger), breadcrumb, hero, services, progress, **surah-end**, about, source, FAQ. The desktop sidebar's reserved `.main-content { margin-right }` is zeroed so the reading column re-centres in the full width.
- **Kept (minimized bar):** font −, font +, night toggle, and a clear **«الخروج من وضع القراءة»** button (its label stays visible even on phones). The non-essential controls (top, ayah-jump, page-jump) are hidden.
- **Exit** returns every section. Toggled via the EXISTING `data-quran-action="reading"` handler (no new global, no scroll reset → the reader's position is preserved by native scroll-anchoring). Works on desktop **and** mobile.

## 3. Default Quran font @ 390px reduced one step (req 3)
The default ayah size was JS-forced to 1.55rem on every viewport. Introduced a viewport-aware base var `--q-ayah-base` (desktop **1.55rem**, phones **1.43rem**); `applyFont()` now reads it and adds the ± step, re-applying on resize. Net effect at 390px: default **22.88px** (was 24.80 → one step smaller), +1 = **24.80px**. **No horizontal overflow, no word/medallion overlap** at either size (measured `scrollWidth ≤ clientWidth`). Desktop default unchanged (1.55rem).

## 4–5. Constraints honoured
No SEO paragraphs/questions added (req 4). Preserved (req 5): the ONE outer width, the inner reading column, the unified real site header, the Quran text/data/hashes (untouched), noindex + `QURAN_PROTOTYPE_ENABLED` flag, and NO Service-Worker / sitemap change.

## Files changed (allowed scope)
- **server.js** — surah-end de-dup (removed `surahNavHtml`/`navItem`/`prevSurah`/`nextSurah` + `${surahNavHtml}`); reading-exit button added to the toolbar; cache-busters `quran.css?v=5→6`, `quran.js?v=5→6`.
- **css/quran.css** — reading-mode hide list expanded (site chrome + `.main-content` margin reset) + minimized-bar rules + exit-button styles; `--q-ayah-base` (desktop 1.55 / mobile 1.43); removed dead `.quran-surah-nav*`; rebalanced `.quran-surah-end`.
- **js/quran.js** — `applyFont()` reads `--q-ayah-base` + resize re-apply (no Arabic letters, no new globals).
- **scripts** — rewrote `_smoke_quran_surah_navigation_1.mjs` (de-dup + no-broken-links guard); added `_smoke_quran_reading_mode_1.mjs`.

## Verification
- **Smokes: 22/22 PASS** (10 integrity + 12 UI). `node --check` OK (server.js / quran.js).
- **Chromium (headless CDP), console.error = 0**, served `quran.css?v=6` / `quran.js?v=6`:
  - Surah-end: 3 buttons, `hasSurahNav=false`, height 262.
  - Reading (desktop + mobile): header/footer/next-bar/sidebar/hamburger all `display:none`; exit button shown with label «الخروج من وضع القراءة»; cards + minimized bar only.
  - Mobile 390: default `22.88px` (`--q-ayah-base:1.43rem`), +1 `24.80px`, `overflowX=false` both.
- **Regression:** `/`, `/azkar/morning-azkar`, `/qibla`, `/quran/surah/21` → 200 (quran active, prayer-times inactive, noindex); `/moon-today` → 301 (pre-existing MLRC, untouched).
- **Screenshots** (`.quran-shots/`, untracked): `01-surah-end-desktop`, `02-reading-desktop`, `03-reading-mobile`, `04-mobile-default`, `05-mobile-plus1`.

---
Status: FINAL READING MODE AND COMPLETION UX FIXED LOCALLY — NOT COMMITTED — NOT PUSHED — AWAITING USER APPROVAL
