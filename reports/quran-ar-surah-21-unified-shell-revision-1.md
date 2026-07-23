# QURAN-AR-SURAH-21-UNIFIED-SITE-SHELL-HERO-NAVIGATION-AND-READING-UX-REVISION-1

**Status:** UI/UX REVISED LOCALLY — NOT PUSHED — AWAITING USER VISUAL APPROVAL
**Scope:** UI/UX only. NO change to Quran text / 021.json / basmala.json / ayah order / page split / import pipeline / hashes / 112-ayah count. NO push, NO sitemap, NO indexing, NO surah generalization.

---

## 1. Before → After (architecture)

| Aspect | BEFORE (standalone document) | AFTER (unified site shell) |
|---|---|---|
| Shell | bespoke `.quran-doc` / `.quran-wrap`, its own header | real site shell: `menu-toggle` + `.sidebar-overlay` + `.app-layout` > `_renderSidebar()` + `.main-content` + `.footer.site-footer` |
| Sidebar / nav | none | shared `_renderSidebar({spa:false})` builder (identical to moon/azkar/countdown pages) + `_SIDENAV_SPRITE` |
| Header | none (document had only a small breadcrumb) | site mobile menu button (`☰` → `toggleSidebar()`), desktop sidebar rail |
| Palette | independent beige/green (`--q-bg #f4f1e8`, `--q-accent #0f6b4f`) | inherits site variables from `css/style.css` (no standalone palette); Quran tints derived via `color-mix()` |
| Dark mode | `.quran-doc[data-theme]` local | site `html[data-theme="dark"]` + shared `localStorage['theme']` + early-paint script |
| Breadcrumb | `القرآن الكريم ← سورة الأنبياء` (no link) | `الرئيسية ← القرآن الكريم ← سورة الأنبياء` (real Home link) |
| Hero | short «سورة الأنبياء» | approved eyebrow + H1 + intro + 6 chips + 3 action buttons |
| Toolbar | icon-only (`أ+`, `☾`, `▤`, `▲`) | labeled buttons (تكبير/تصغير النص، الوضع الليلي، وضع القراءة، أعلى الصفحة) + aria-label + title + aria-pressed |
| Ayah jump | none | numeric input (1–112) + JS smooth-scroll+highlight + **no-JS server GET→302 `#ayah-N`** |
| Page jump | select (JS only) | labeled select + no-JS server GET→302 `#page-N` |
| Surah nav | none | prev «سورة طه» / next «سورة الحج» — **disabled** (aria-disabled, «غير متاحة في النموذج الأولي», NO links) |
| Surah index | none | drawer from chapters.json (114 surahs; current active, 113 disabled — no 404s) |
| Surah end | one line | full end card (title + العودة + تصفّح + مصدر + disabled prev/next + data version) |
| Footer | small text notice | real `.footer.site-footer` (عن الموقع / اتصل بنا / سياسة الخصوصية / شروط الاستخدام) |

## 2. Color-variable mapping (independent palette → inherited site variables)

| Element | OLD standalone token | NEW site variable | Light | Dark (verified) |
|---|---|---|---|---|
| Page surface | `--q-bg #f4f1e8` | `var(--bg)` | `#f0f2f5` | `#22272e` |
| Card / hero / page-card | `--q-card #fffdf7` | `var(--card-bg)` | `#ffffff` | `#2d333b` |
| Primary text | `--q-ink #1f2a24` | `var(--text)` | `#2c3e50` | `#cdd9e5` |
| Secondary text | `--q-ink-soft #55645b` | `var(--text-light)` | `#5f6b78` | `#a8b3c1` |
| Accent / green | `--q-accent #0f6b4f` | `var(--primary)` / `var(--primary-dark)` | `#1a6b3c` / `#0d4a28` | `#2d9059` / `#4dcb8c` |
| Borders / dividers | `--q-line #e4ddcb` | `var(--border)` | `#e0e0e0` | `#444c56` |
| Shadow | `--q-shadow` | `var(--shadow)` | `0 2px 12px rgba(0,0,0,.08)` | `0 2px 8px rgba(0,0,0,.3)` |
| Radius | `14px` literal | `var(--radius)` | `12px` | `12px` |
| Chip / tint bg | `--q-accent-soft #dcefe7` | `color-mix(var(--primary) 8–12%, var(--card-bg))` | derived | derived (auto-flips) |

Browser-verified inheritance (Chromium): `--primary=#1a6b3c`, `--bg=#f0f2f5`→`#22272e`, `--card-bg=#ffffff`→`#2d333b`, medallion border = `var(--primary)`.

## 3. Files modified (allowed scope)

- **server.js** (`M`, +209 net): `_quranProtoData()` now also loads `metadata/chapters.json`; added `_QURAN_SERVICE_LINKS` + `_quranServiceLinksHtml()`; **rewrote `_buildQuranSurah21Prototype()`** to compose the real shell (sprite + menu-toggle + overlay + `_renderSidebar` + `.main-content` + hero + services + labeled toolbar + ayah-jump + page-jump + progress + 10 page-cards + surah-end + surah-nav + source box + surah-index drawer + site footer); route guard adds no-JS `?ayah=N` / `?page=N` → 302 fragment redirect.
- **css/quran.css** (untracked prototype file, reworked): removed the independent palette; now derives all tints from site variables; added shell/hero/services/toolbar/jump/progress/surah-end/surah-nav/index-drawer styles; body surface follows `var(--bg)`; kept `@font-face KFGQPCHafs` (unmodified TTF, font-display:swap), medallion, sticky toolbar, reading-mode, responsive (1024/768/480), reduced-motion, dark override.
- **js/quran.js** (untracked prototype file, rewritten): global `toggleSidebar()` + `toggleTheme()` matching the site 1:1; font-size, reading-mode (aria-pressed), ayah-jump (validate + smooth-scroll + flash + error toggle, no innerHTML, no Arabic literals), page-jump, surah-index open/close (focus + Escape), progress bar. All localStorage guarded.
- **6 new smoke tests** (scripts/): `_smoke_quran_unified_site_shell_1`, `_hero_content_1`, `_ayah_jump_1`, `_surah_navigation_1`, `_site_service_links_1`, `_mobile_nav_drawer_1`.

**NOT touched:** data/quran/** (021.json, basmala.json, chapters.json, source-manifest.json, source ZIP+JSON), fonts/uthmanic_hafs_v20.ttf, scripts/quran/build.mjs, sw.js, index.html, app.js, sitemap, robots, i18n.

## 4. Tests

- **16/16 Quran smokes PASS** (~150 assertions): 10 pre-existing integrity smokes (source_checksum, surah_21_import, ayah_end_marker, basmala_derivation, unicode_preservation, page_mapping, surah_21_ssr, hreflang_ar_only, no_js_reading, responsive) — all still green **unchanged**, proving text/hash/marker/basmala/112-count integrity survived the UI rewrite — plus the 6 new UI smokes.
- `node --check server.js` OK, `node --check js/quran.js` OK.

## 5. Browser verification

- **Browser:** Claude in-app Browser pane — **Chromium 148.0.7778.271** (Electron 42.5.1). *Real external Chrome (Claude in Chrome) was NOT connected to this session (`list_connected_browsers` → []), so the in-app Chromium engine was used.*
- **pageerror / console.error: 0** (`read_console_messages onlyErrors` → "No console logs").
- **Desktop (1280):** unified shell renders; sidebar 280px; footer 4 links; reading column 820px; toolbar sticky; font=KFGQPCHafs; medallion 999px; counts 10 pages / 112 ayat / 114 index / 16 service-links / H1=1; **no horizontal overflow** (scrollW 1272 ≤ 1280); **no FCxx** glyph in visible text; app.js absent; hreflang absent.
- **Dark (fresh load, theme preset):** body `#22272e`, cards `#2d333b`, text `#cdd9e5` — full dark surface, **no light strip**, not pure black.
- **Mobile (390):** `☰` menu-toggle shown, no sidebar rail, no overflow; drawer opens the shared sidebar (logo + full nav + overlay).
- **Interactions:** ayah-jump valid→`.is-flash` highlight; invalid(999)→error shown + input invalid; reading-mode hides chrome; surah-index open (aria-hidden=false, 113 disabled) + Escape closes; theme/reading aria-pressed toggles.
- **No-JS:** `GET ?ayah=5`→`302 /quran/surah/21#ayah-5`, `?ayah=112`→302, `?page=325`→`302 #page-325`; invalid `?ayah=999/0`, `?page=999`→200 (page renders). Ayah/page text is fully in SSR.
- Screenshots captured (in chat): desktop light, desktop dark, mobile, mobile drawer open, surah-index open, surah-end (disabled طه/الحج).

## 6. Integrity / safety

- `git diff --stat`: only `server.js` (+209). `git diff --check`: no whitespace errors.
- No changes under `data/quran/**` or `fonts/**` (integrity smokes green).
- No broken sibling-surah links (`/quran/surah/20|22` absent); service links limited to real routes (all return 200).
- Route still flag-gated (`QURAN_PROTOTYPE_ENABLED=1`), `noindex,follow`, Arabic-only (no hreflang), not in sitemap/menu.
- **No commit, no push.**

---
Status: UI/UX REVISED LOCALLY — NOT PUSHED — AWAITING USER VISUAL APPROVAL
