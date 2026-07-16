# QURAN-AR-SURAH-21-CONSISTENT-WIDTH-MOBILE-SPACING-BREADCRUMB-FAQ-AND-SEO-CONTENT-REVISION-2

**Status:** FINAL LAYOUT, MOBILE, FAQ AND SEO CONTENT REVISION COMPLETE LOCALLY — NOT PUSHED — AWAITING USER APPROVAL
**Scope:** UI/UX + descriptive content only. NO change to Quran text / 021.json / basmala.json / hashes / import pipeline / surah set. NO push, NO sitemap, NO indexing, NO Service Worker.

## 1. Before → After
| Area | Before (REVISION-1) | After (REVISION-2) |
|---|---|---|
| Widths | `.quran-shell` (1160) + `.quran-read` (820); toolbar/progress sat at 1160, cards at 820 (mismatch) | **TWO widths only**: `.quran-site-container` (1180) + `.quran-reading-container` (820). Toolbar/progress/jumps/cards/end/nav ALL at 820 |
| Breadcrumb | bespoke `.quran-crumbs` (custom in quran.css) | **site shared component** `.moon-breadcrumb` + `.breadcrumb-list`/`.bc-item`/`.bc-link`/`.bc-sep` (card style + `›`), no new CSS |
| Mobile margins | container padding only | `padding-inline: max(16px, env(safe-area-inset-*))`; `<=360px`→12px; **top clearance** for the fixed menu button |
| Mobile services | full 8-link block before reading | **3-link short strip** under hero; full 8 at the bottom (reach reading fast) |
| Descriptive content | none | 4 SSR `<h2>` sections (about/info/rasm/jump), dynamic numbers, no tafsir/fadl/makki-madani |
| FAQ | none | 8 Q&A via the site shared FAQ component (native `<details>`, no-JS) |
| Source | one long paragraph | visible facts (source/riwayah/rasm/link) + collapsible `<details>` for version info |
| Title/Meta | old | approved Title + Meta description |

## 2. Two-width system (measured in Chromium)
- **Site container** (breadcrumb, hero, short-services, about, source, FAQ, full-services) = `max-width:1180px` (= the site's SEO content wrap `.qibla-seo-info-wrap`, style.css:3124), `margin-inline:auto`, safe-area padding.
- **Reading container** (toolbar, progress, ayah-jump, page-jump, ALL 10 page cards, completion, surah-nav) = `max-width:820px`, centered, `width:100%`, `box-sizing:border-box`.
- Page cards: `width:100%; max-width:none; box-sizing:border-box` — uniform width/border/radius/shadow/spacing/padding; height stays natural.
- **Desktop 1440 measures:** site container 1152 (top) = 1152 (lower); reading 820; all 10 cards **820** (equal); toolbar 820 = card; surah-end 820 = card; hero 1120 (site width, wider than card by design); horizontal overflow = **false**. Only two element px max-widths in quran.css: **820 + 1180**.

## 3. Mobile margins (measured @ 375px)
- breadcrumb / hero / short-services / toolbar / cards / FAQ: **left 16px, right 16px** (width 343 on 375).
- card left margin 16, right margin 16; **no horizontal overflow** (scrollWidth 375 = viewport).
- Menu button: fixed 48px at top:16 (bottom 64). **Breadcrumb top = 64** → button never overlaps the breadcrumb/H1 (`btnClearsBreadcrumb=true`). `<=360px` gutter may tighten to 12px.
- Breadcrumb component: `.moon-breadcrumb` (SITE); reused HTML/classes/`›` separators/hover/focus/dark — NOT redesigned in quran.css.

## 4. Descriptive content (SSR, visible, dynamic numbers, `sName`+data-driven)
- `<h2>قراءة سورة الأنبياء مكتوبة كاملة</h2>` · `<h2>معلومات عن سورة الأنبياء</h2>` · `<h2>سورة الأنبياء بالرسم العثماني برواية حفص</h2>` · `<h2>الانتقال إلى آية من سورة الأنبياء</h2>` — exact approved copy; آية/جزء/صفحات numbers derive from `surah.*`. No download/audio/tafsir/fadl/sabab-nuzul/makki-madani.

## 5. FAQ (8 Q&A, site shared component, no-JS)
`<section class="section-card quran-faq" aria-labelledby="quran-faq-title"><h2 id="quran-faq-title">أسئلة شائعة حول سورة الأنبياء</h2><div class="country-faq-list moon-country-faq">` + 8 × `<details class="country-faq-item"><summary><h3>…</h3></summary><p>…</p></details>`. Approved questions: عدد الآيات · رقم السورة · الجزء · الصفحات المرجعية · الرسم العثماني · الانتقال إلى آية · مطابقة الأسطر · مصدر النص. No forbidden (why-named/fadl/maqasid/sabab-nuzul/makki-madani). **No FAQ Schema emitted** (page is noindex). Structured-data would match visible text verbatim when the section launches.

## 6. Title / Meta / Source
- **Title:** `سورة الأنبياء مكتوبة كاملة بالرسم العثماني | مواقيت الصلاة`
- **Meta:** `اقرأ سورة الأنبياء مكتوبة كاملة بالرسم العثماني، من الآية 1 إلى 112، برواية حفص عن عاصم، مع الانتقال المباشر إلى الآية والصفحات المرجعية 322–331.`
- **H1** unchanged (single). **Source** split: visible facts + `<details>تفاصيل إصدار بيانات القرآن</details>` (package/version/dataVersion/page-split/non-typographic note) — dataVersion no longer prominent.

## 7. Files modified (allowed scope)
- **server.js** (`M`, +281 net vs origin/main): builder restructured into two containers; `_QURAN_SERVICE_LINKS_SHORT`; `_quranServiceLinksHtml(opts)`; new `_quranAboutHtml`/`_quranFaqHtml`/`_quranSourceHtml`; shared breadcrumb markup; approved Title/Meta; quran.css/js bumped to `?v=3`.
- **css/quran.css** (untracked prototype file, reworked): two-width system, safe-area gutters + menu-button top clearance, uniform page-card rule, about/source-facts/source-details styles; breadcrumb/FAQ NOT redefined (shared components). Font-face/medallion/sticky-toolbar/reading-mode/responsive/reduced-motion/dark preserved.
- **js/quran.js** (untracked prototype file): shell hook moved to `.quran-reading-container` (all reading elements live there). No new Arabic literals.
- **5 new smokes:** `_smoke_quran_{consistent_width_system, mobile_safe_margins, breadcrumb_shared_component, faq_content, seo_visible_content}_1.mjs`.
- **NOT touched:** data/quran/** , fonts/**, scripts/quran/build.mjs, sw.js, index.html, app.js, sitemap.

## 8. Tests
- **21/21 Quran smokes PASS.** The 10 pre-existing INTEGRITY smokes (source_checksum, surah_21_import, ayah_end_marker, basmala_derivation, unicode_preservation, page_mapping, …) remain green **unchanged** → text/hash/112-ayah integrity survived. + 6 REVISION-1 UI smokes + 5 new REVISION-2 smokes.
- `node --check server.js` OK; `node --check js/quran.js` OK.

## 9. Browser verification
- **Browser:** in-app Browser pane — **Chromium 148.0.7778.271** (Electron 42.5.1). *External Chrome (Claude in Chrome) not connected to this session, so the in-app Chromium engine was used.*
- **pageerror = 0, console.error = 0** ("No console logs").
- Desktop 1440/1920 + Mobile 375: unified two-width layout; all reading boxes 820; site sections 1180; 16px mobile gutters; button clears breadcrumb; no horizontal overflow; FAQ native `<details>` works; dark theme inherited on the new layout.
- Screenshots (in chat): desktop top; mobile top (margins + breadcrumb + button clearance); mobile FAQ (8 Q, open); mobile dark.

## 10. Integrity / safety
- `git diff --stat`: only `server.js` (+281). `git diff --check`: no whitespace errors.
- `data/quran/**`, `fonts/**`, `scripts/quran/**`: **no modifications**.
- Route still flag-gated (`QURAN_PROTOTYPE_ENABLED=1`), `noindex,follow`, Arabic-only, not in sitemap/menu. No FAQ schema emitted.
- **No commit, no push.**

---
Status: FINAL LAYOUT, MOBILE, FAQ AND SEO CONTENT REVISION COMPLETE LOCALLY — NOT PUSHED — AWAITING USER APPROVAL
