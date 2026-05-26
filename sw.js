// Service Worker: cache-first for versioned static assets, network-first for HTML, stale-while-revalidate for /api/*
// Bump CACHE_VERSION whenever precache list changes
// AZKAR-MORNING-DARK-MODE-POLISH-2 (2026-05-25):
//   v336 → v337. Re-introduces dark-mode contrast polish for
//   /azkar/morning-azkar (wiped by FLICKER-FIXES-ROLLBACK-TO-3eae0b5).
//   Only css/style.css touched: new dark-mode block (~80 lines) at
//   line 8460+ scoped under html[data-theme="dark"]. NO change to body
//   background or general site palette. NO change to light mode. NO
//   change to layout/JS/counter/daily-reset.
//   Cache-buster: css/style.css?v=439 → ?v=440.
// AZKAR-MORNING-PHASE-3-COMPOSITE (2026-05-25):
//   v337 → v338. Re-introduces 4 polish waves wiped by FLICKER-FIXES-
//   ROLLBACK-TO-3eae0b5, in one ordered composite:
//     1. AZKAR-RESET-SCROLL-TO-TOP-2 — reset-all flow jumps to
//        #azkar-page-top using offset-aware scroll
//     2. AZKAR-MOBILE-STICKY-OFFSET-2 — _azkarScrollToCard() replaces
//        raw scrollIntoView in auto-advance; scroll-margin-top bumped
//        to 200/190/130 per breakpoint to clear sticky-progress bar
//     3. AZKAR-MORNING-SEO-TITLE-DESC-2 — AR title 63→52 chars + AR
//        desc 114→122 chars per SEOptimer (50-60 / 120-160 windows)
//     4. AZKAR-MORNING-KEYWORD-CONSISTENCY-1 — H2 + intro paragraph
//        before dhikr list to bridge أذكار الصباح/التكرار/المصدر; counter
//        prompt shortened ("اضغط للعدّ" → "عدّ" visible, full form on
//        aria-label); 2 FAQ questions reworded around التكرار/المصادر
//   Cache-busters: app.js?v=712 → ?v=713, css/style.css?v=440 → ?v=441.
// AZKAR-MORNING-SSR-RENDER-LIST-1 (2026-05-26):
//   v338 → v339. Root-cause fix for the Lighthouse CLS culprit identified
//   in AZKAR-MORNING-CLS-ROOT-FIX-OPTIONS-1.
//   Before: #azkar-morning-list was EMPTY in SSR HTML; _loadAzkarMorning()
//   in app.js mounted 25 dhikr cards after DOMContentLoaded, pushing
//   .azkar-edu-section ~9700px down on every load (CLS 0.343).
//   Now: server.js SSR-renders all 25 cards into the list via a new
//   _buildAzkarMorningListHtml() helper that loads data from
//   js/azkar-data.js into a Function sandbox at startup. app.js detects
//   the SSR marker (data-ssr-rendered="1") and switches to hydration
//   only — binds handlers + applies localStorage state on the existing
//   DOM. NO min-height hack, NO layout reservation. CLS = 0 because
//   the content is in the SSR HTML at first paint.
//   Bonus: Googlebot now sees all 25 dhikr + sources + virtues without
//   running JS — major SEO win for Keyword Consistency too.
//   Cache-buster: js/app.js?v=713 → ?v=714.
// AZKAR-EVENING-PHASE-1 (2026-05-26):
//   v339 → v340. New /azkar/evening-azkar page following the
//   AZKAR-READING-PAGE-TEMPLATE-V1 contract verbatim:
//     • 23 evening dhikr added to js/azkar-data.js (SSR-loaded)
//     • SSR-rendered list (data-ssr-rendered="1", no client-render shift)
//     • Independent localStorage key: azkar.progress.evening
//     • SEO title 52 chars + desc 122 chars (canonical template)
//     • H1 = "أذكار المساء" + single-active-page strip
//     • Counter / undo / reset / hydration cloned from morning
//     • Dark mode + mobile-sticky-offset CSS shared with morning
//     • New _loadAzkarEvening + _hydrateAzkarEveningCards in app.js
//   Cache-busters: js/app.js?v=714 → ?v=715,
//                  js/azkar-data.js?v=2 → ?v=3,
//                  css/style.css?v=441 → ?v=442.
// AZKAR-EVENING-PAGESHOW-FIX-1 (2026-05-26):
//   v340 → v341. Critical fix: js/app.js pageshow handler (BFCache
//   restorer at line 10828) had no regex for /azkar/evening-azkar,
//   so the fallback branch fired and forced #page-prayer-times active.
//   User-visible symptom: visiting /azkar/evening-azkar flashed the
//   evening page for ~1s then redirected to the homepage.
//   Fix: added the evening pattern alongside morning. NO other change.
//   Cache-buster: js/app.js?v=715 → ?v=716.
// AZKAR-PRAYER-PHASE-1 (2026-05-26):
//   v341 → v342. New /azkar/prayer-azkar page (17 dhikr covering wudu,
//   mosque entry/exit, ruku, sujud, tashahhud, qunut, post-salam, witr),
//   following the AZKAR-READING-PAGE-TEMPLATE-V1 contract verbatim
//   (clone of evening with category='prayer', storage key 'azkar.progress.prayer',
//   SSR-rendered list, BFCache restorer + SPA activator branches added in app.js).
//   Hub `/azkar` now activates the prayer card (replaces former after-prayer
//   "soon" placeholder). Morning + evening edu-link grids updated to add the
//   prayer cross-link. Custom SEO title/desc per user spec (different from
//   the canonical morning/evening template).
//   Cache-busters: js/app.js?v=716 → ?v=717,
//                  js/azkar-data.js?v=3 → ?v=4,
//                  css/style.css?v=442 → ?v=443.
// LOC-HERO-MIN-HEIGHT-TRIM-1 (2026-05-26):
//   v354 → v355. Trims #location-hero min-height reservation from
//   685px → 580px (mobile) and 540px → 470px (desktop). The original
//   reservation from Phase Home-CLS-Fix v3 (2026-05-06) was sized for
//   a denser hero. Since then `.loc-hero-city` (current-city pill) was
//   hidden on home via `html.home-page .loc-hero-city { display: none
//   !important }` at css/style.css:61, and natural content shrank to
//   ~560–580 px mobile / ~440–460 px desktop. Result: ~100–125 px of
//   visible empty space at the card bottom — user-reported regression.
//   The new values still cover the 10–18 px Cairo font-swap delta (the
//   original CLS concern) while eliminating the visible empty gap.
//   CSS-only change scoped to a single rule pair. No HTML / JS / SSR
//   changes. Other pages unaffected (`:not(.loc-hero-collapsed)` guard
//   keeps city pages with collapsed hero untouched).
//   Cache-buster: css/style.css?v=445 → ?v=446.
// MOROCCO-AWQAF-FAJR-ADJUST-APPLY-1 (2026-05-26):
//   v353 → v354. Per the user-approved Option B from MOROCCO-AWQAF-VERIFY-1:
//   add `adj: { fajr: -6 }` to the MoroccoAwqaf method only. Other 5 prayers
//   were already 0–1 min from Google; only Fajr drifted by +6 min. Mirrors
//   the JAKIM ihtiyat pattern (academic angles preserved, table-style
//   minute adjustment in `adj`).
//   Rabat 2026-05-26 result: Fajr 04:33 (Google 04:33, EXACT). Other 5
//   prayers untouched (still 0–1 min from Google).
//   No other method touched, no country mapping touched, no madhab logic
//   touched, no i18n / cache-buster bumps on app.js / styles needed.
//   Cache-buster: js/prayer-times.js?v=50 → ?v=51.
// TL-HERO-VISIBILITY-FIX-1 (2026-05-26):
//   v352 → v353. URGENT regression fix: the time-left hero (#tl-hero)
//   on /time-left-until-prayer-in-{city} AND the next-prayer hero
//   (#npt-hero) on /next-prayer-in-{city} were invisible because the
//   static markup carries `u-hidden` and a recent commit (034dae60,
//   AZKAR-RESTRUCTURE-MORNING-PHASE-1, 2026-05-25) added `!important`
//   to `.u-hidden { display: none !important }`. That `!important`
//   overrode the cascade rule `html.time-left-page .tl-hero {
//   display: block }` (and the equivalent for npt-hero), making the
//   pages render with no hero / no countdown — the user-visible
//   regression.
//
//   Fix: server.js now strips `u-hidden` from both `#tl-hero` and
//   `#npt-hero` on their respective routes — same pattern already used
//   for #city-summary-paragraph at server.js:16350. Once `u-hidden` is
//   gone, the existing display rules show the hero as designed. No
//   CSS or JS change needed.
//
//   Scope:
//     • Only the SSR HTML emitted for /time-left-until-prayer-in-{slug}
//       and /next-prayer-in-{slug} is modified.
//     • Other routes (where these elements should stay hidden) are
//       untouched — `u-hidden` is preserved by virtue of NOT entering
//       those if-blocks.
//   No client JS change. No CSS change. No cache-buster bump on the
//   app/styles bundles needed (SSR-only fix). Just SW bump for clarity.
// REGIONAL-DEFAULT-CALC-METHODS-APPLY-1 (2026-05-26):
//   v351 → v352. Phase A + Phase B Sub-option B1 from the
//   REGIONAL-DEFAULT-CALC-METHODS-AUDIT-1 report:
//
//   Country-default changes in `_AUTO_METHOD_BY_CC` (js/app.js) AND
//   `_SSR_METHOD_BY_CC` (server.js) — both maps fully synced:
//     • LB → MWL          (was Makkah)
//     • LY → Egypt        (was Makkah; LY follows the Egyptian convention)
//     • YE → MWL          (was Makkah)
//     • IQ → MWL          (was Makkah)
//     • PS → MWL          (was Makkah)
//     • JO → MWL          (was Makkah; Phase B B1, no JordanAwqaf yet)
//     • DZ → MWL          (was Makkah; Phase B B1, no AlgeriaAwqaf yet)
//     • TN → MWL          (was Makkah; Phase B B1, no TunisiaReligiousAffairs yet)
//     • SD → MWL          (was Makkah)
//     • SS → MWL          (was Makkah)
//     • MR → MWL          (was Makkah)
//     • SO → MWL          (was Makkah)
//     • DJ → MWL          (was Makkah)
//     • KM → MWL          (was Makkah)
//     • Fallback Makkah → MWL  in BOTH maps' || branch (was the silent
//                              default for ~150 unmapped countries).
//
//   GCC + Syria preserved on Makkah (the only 7 legitimate Umm Al-Qura
//   users): SA, AE, KW, QA, BH, OM, SY.
//   Countries with their own dedicated methods untouched: EG, FR, TR,
//   IR, MA (MoroccoAwqaf), MY (JAKIM), ID (KemenagJakarta), PK/IN/BD/AF
//   (Karachi), SG/BN (Singapore), Europe (MWL), N. America (ISNA),
//   S. America (MWL).
//
//   Also: brings `_SSR_METHOD_BY_CC` byte-equivalent in semantics to
//   `_AUTO_METHOD_BY_CC` so the SSR first paint and client hydration
//   pick the SAME method — no more "wrong-then-right" flash in computed
//   prayer times. Critical for MY/ID/MA (server was using stale
//   Singapore/Makkah) and for the entire Europe/SA block.
//
//   No change to: method angles (MWL stays 18/17, ISNA stays 15/15,
//   etc.), Shafi/Hanafi logic, dropdown list, translations, or any
//   user-explicit pick stored in localStorage['calc_method_user'].
//   Cache-buster: js/app.js?v=723 → ?v=724.
// SSR-CONTENT-NO-SWAP-1 (2026-05-26):
//   v350 → v351. Fixes a visible text "swap" / FOUC where 4 sidebar nav
//   labels and the #loc-hero-title hero H1/H2 rendered with one Arabic
//   string at first paint, then JS-hydrated to a different Arabic string.
//   Caused by static HTML fallback text drifting from the i18n.js AR
//   value (and from JS dynamic rewrites for city pages):
//     • <span data-i18n="nav.qibla">          : "اتجاه القبلة" → "إتجاه القبلة"
//     • <span data-i18n="nav.duas">           : "الأدعية والأذكار" → "الأذكار"
//     • <span data-i18n="nav.hijri_today">    : "التاريخ الهجريّ اليوم" → "التاريخ الهجري"
//     • <span data-i18n="nav.hijri_calendar"> : "التقويم الهجريّ" → "التقويم الهجري"
//   Static text aligned to the i18n AR target in index.html so no
//   client-side swap occurs.
//
//   Plus: new SSR injection in server.js for #loc-hero-title on
//   /prayer-times-in-{city} pages. The JS function at app.js:12882
//   rewrites the H2 to a city-specific tagline ("مواقيت الصلاة اليوم في
//   {city} والتاريخ الهجريّ والميلاديّ"). The SSR layer now emits the
//   same string for the first paint so the H2 is stable on city pages
//   in all 10 langs. Homepage tagline already matched the static fallback,
//   so the new block only fires when cityMatchSsr is truthy.
//   Cache-buster: js/app.js?v=722 → ?v=723.
// MALAYSIA-JAKIM-IHTIYAT-APPLY-1 + I18N-VERSION-BUMP-1 (2026-05-26):
//   v349 → v350. Two coordinated changes:
//     1. MALAYSIA-JAKIM-IHTIYAT-APPLY-1: applies JAKIM's published e-solat
//        "ihtiyat" (احتياط) precaution-minutes to the JAKIM method —
//        Fajr +10, Sunrise 0, Dhuhr +1, Asr +1, Maghrib +1, Isha +1.
//        Added as `adj` field on the JAKIM method definition in
//        js/prayer-times.js; applied in computeAllTimes BEFORE the
//        user's `config.adjustment` so user overrides still work on top.
//        Kuala Lumpur verification: 5/6 prayers EXACT match with Google,
//        Fajr 05:49 (Google 05:50, 1 min — within tolerance).
//        Other methods unaffected (no `adj` field) — Mexico City ISNA
//        regression: 0-drift.
//     2. I18N-VERSION-BUMP-1: bumps `_i18nVersion` in server.js from
//        183 → 184 so returning visitors fetch the fresh per-lang i18n
//        files containing the JAKIM/KemenagJakarta/MoroccoAwqaf method
//        names from COUNTRY-SPECIFIC-CALC-METHODS-1.
//   Cache-buster: js/prayer-times.js?v=49 → ?v=50.
// MOON-DATE-TODAY-SUB-FILL-1 (2026-05-26):
//   v348 → v349. The #moon-date-today-sub element under the "اليوم
//   المعروض" center card of the moon-date-nav was empty on the city-today
//   page (e.g. /moon-today-in-jeddah) because the JS code at app.js:20438
//   gated the date fill behind `_isDatePage` — which is false on the
//   today-page (only true on /moon-in-{city}/YYYY-MM-DD). Now drops the
//   gate (the outer `_navEl && _citySlug && !_isHubPage` block already
//   excludes the hub page), so today's date appears in the sub-line on
//   both date-pages AND city-today pages. The `today` variable at
//   app.js:16836 is already correct: `_requestedDate || new Date()` →
//   the requested date on date-pages and now() on city-today pages.
//   Cache-buster: js/app.js?v=721 → ?v=722.
// SIS-LAST-THIRD-ARROW-DIR-1 (2026-05-26):
//   v347 → v348. Tiny UX fix: the "last third of night" time-range in the
//   summary info strip on /prayer-times-in-{city} (#sis-last-third) used a
//   hard-coded right-arrow '→', which renders as a left-to-right arrow even
//   on RTL pages. Now direction-aware: RTL langs (ar/ur) get '←' so the
//   arrow points from the start time toward the end time in their visual
//   reading direction. LTR langs keep '→'. One-liner in app.js
//   updateSummaryInfoStrip(); no other behavior changed.
//   Cache-buster: js/app.js?v=720 → ?v=721.
// AMERICAS-DEFAULT-CALC-METHODS-1 (2026-05-26):
//   v346 → v347. Country-default calculation method update for the Americas:
//     • North America extended: US/CA/MX preserved on ISNA; GL (Greenland)
//       and BM (Bermuda) added → ISNA.
//     • South America (14 codes: AR, BO, BR, CL, CO, EC, FK, GF, GY, PY,
//       PE, SR, UY, VE) → MWL. Previously all of Latin America was lumped
//       under one "ISNA" rule; per user spec the South-American subset
//       moves to MWL (the broader pan-American RIS standard). FK
//       (Falkland Islands) added since it was not in the map.
//     • Central America (GT/HN/NI/SV/CR/PA/BZ) and Caribbean
//       (CU/DO/HT/JM/TT/BB) stay on ISNA — NOT in user's spec so
//       explicitly preserved untouched.
//   User-explicit pick in localStorage['calc_method_user'] is always
//   honored — no change to `_userExplicitMethod()`.
//   Cache-buster: js/app.js?v=719 → ?v=720.
// EUROPE-DEFAULT-CALC-METHOD-1 + COUNTRY-SPECIFIC-CALC-METHODS-1 (2026-05-26):
//   v345 → v346. Two coordinated changes to the country→default calculation
//   method mapping (`_AUTO_METHOD_BY_CC` in js/app.js):
//     1. EUROPE-DEFAULT-CALC-METHOD-1: All 44 European country codes
//        (except FR + TR, which keep their dedicated authorities) default
//        to 'MWL' (Muslim World League). Includes RU which previously
//        mapped to the 'Russia' method.
//     2. COUNTRY-SPECIFIC-CALC-METHODS-1: 3 new country-specific authorities
//        added to js/prayer-times.js with their published angles and surfaced
//        in the settings dropdown:
//          • JAKIM            (Malaysia)   — Fajr 20°, Isha 18°
//          • KemenagJakarta   (Indonesia)  — Fajr 20°, Isha 18°
//          • MoroccoAwqaf     (Morocco)    — Fajr 18°, Isha 17°
//        Defaults:  MY → JAKIM   ID → KemenagJakarta   MA → MoroccoAwqaf
//   User-explicit pick in localStorage['calc_method_user'] is ALWAYS
//   honored — the existing `_userExplicitMethod()` short-circuit in
//   `autoSelectMethod()` is untouched.
//   No changes to non-Europe / non-MY/ID/MA defaults. No changes to
//   Shafi/Hanafi (asrMethod) logic.
//   Cache-busters: js/app.js?v=718 → ?v=719,
//                  js/i18n.js?v=186 → ?v=187,
//                  js/prayer-times.js?v=48 → ?v=49.
// MOON-HERO-MOBILE-CTA-FIX-2 (2026-05-26):
//   v344 → v345. Long-language safety: remove the strict
//   `max-height: 72px !important` on `#page-moon .qibla-hub-geo-btn
//   / .qibla-hub-pick-btn` introduced in MOON-HERO-MOBILE-CTA-FIX-1.
//   Replaced with `max-height: none !important`. Reason: DE / BN / FR /
//   TR labels can wrap to 2 lines on narrow viewports (≤360px), and a
//   72px ceiling would crop the second line. The square-card bug stays
//   fixed because `height: auto !important` + `aspect-ratio: auto
//   !important` + the grid→flex-column conversion still defeat the
//   legacy `height: 100%` stretch. Vertical compactness is preserved
//   by padding + line-height instead of capping the height.
//   Scope unchanged (#page-moon only). Desktop unchanged.
//   Cache-buster: css/style.css?v=444 → ?v=445.
// ARIA-SUNRISE-FIX-1 (2026-05-26):
//   v343 → v344. Semantic fix: sunrise (الشروق) is NOT a prayer.
//   Previously updatePrayerCardsSEO() in js/app.js emitted
//   `aria-label="موعد صلاة الشروق اليوم في {city}"` for the sunrise card,
//   which is semantically wrong (the sun-rise event is not one of the
//   five obligatory prayers). Screen readers + search engines now see:
//     • Sunrise card: "وقت الشروق اليوم في {city}" / "Sunrise time today
//       in {city}" — across all 10 supported langs.
//     • The five prayer cards: unchanged ("موعد صلاة {الصلاة} اليوم في {city}").
//   Side-effect cleanup: the early-return `if (!cityLabel) return;` was
//   scoped down so prayer cards get a cityless fallback label even before
//   the city resolves (screen readers never read a stale SSR default).
//   Time value is never included in aria-label/title (already rendered
//   inside .prayer-time, no need to duplicate numeric data).
//   Cache-buster: js/app.js?v=717 → ?v=718.
// MOON-HERO-MOBILE-CTA-FIX-1 (2026-05-26):
//   v342 → v343. CSS-only mobile responsive fix for /moon-today hero.
//   The primary "use my location" CTA was rendering as a giant ~square
//   card on mobile (≤767px); the secondary "pick city manually" button
//   was barely visible. Hero contents also overflowed horizontally.
//   Added a #page-moon-scoped @media (max-width: 767px) block that:
//     • Forces .qibla-dual-cta to flex-column (overrides legacy grid).
//     • Caps button geometry (min-height 56px, max-height 72px,
//       height: auto, aspect-ratio: auto) — defeats the legacy
//       `height: 100%` stretch that produced the square card.
//     • Pins width/box-sizing on hero wrappers + adds overflow-x: hidden
//       so chrome no longer crops at L/R viewport edges.
//   Scope guard: every selector is prefixed with #page-moon. The same
//   .qibla-hub-geo-btn / .qibla-hub-pick-btn / .qibla-dual-cta classes
//   are reused on /qibla — those pages remain untouched. Desktop also
//   untouched (rule body sits entirely inside the mobile @media query).
//   Cache-buster: css/style.css?v=443 → ?v=444.
// PROD-RABAT-CLIENT-OVERWRITE-FIX-1 (2026-05-26):
//   v355 → v356. Fixes city-page prayer times flipping to wrong values
//   ~1.5h earlier after JS load (most visible on Rabat: SSR showed 04:33
//   Fajr → client overwrote with 03:03). Root cause: client read
//   `window.__PRAYER_CITY__.timezone` ("Africa/Casablanca" IANA string)
//   but `loadCityData()` was called with hard-coded `null` for the
//   timezone arg, forcing a `fetchTimezone()` call to Open-Meteo whose
//   `Math.round((lng/15)*2)/2` fallback returns `-0.5` for Rabat
//   (correct: `+1`) → prayer times 1.5h early.
//   Fix:
//     • server.js `_buildSlugLookupResult` now emits a NUMERIC
//       `timezoneOffset` field alongside the IANA `timezone` string,
//       computed once via existing `_ianaOffsetHours(iana, now)`.
//     • js/app.js `__PRAYER_CITY__` consumer now reads
//       `p.timezoneOffset` and passes it as the 7th arg to
//       `loadCityData`. Open-Meteo remains a fallback for
//       non-curated paths (URL ?lat&lng, LOCAL_CITIES, geocodeSlug).
//   Affected: all `/prayer-times-in-{city}`, `/moon-in-{city}`,
//     `/moon-today-in-{city}`, `/qibla-in-{city}` routes for curated
//     cities (Rabat, Istanbul, New York, Kuala Lumpur, etc.).
//     Mecca/Riyadh were accidentally OK because their longitude was
//     close to a multiple of 15° → fallback happened to be correct.
//   Cache-buster: js/app.js?v=724 → ?v=725.
// ISLAMIC-EVENTS-COUNTDOWN-LOCAL-TIME-1 (2026-05-26):
//   v356 → v357. Unifies the Islamic-occasion countdown logic for both the
//   #moon-events-section cards (4 places) AND the 4 standalone countdown
//   pages (/ramadan-countdown, /eid-al-fitr-countdown, /eid-al-adha-countdown,
//   /hijri-new-year-countdown). Replaces the previous Hijri-driven Gregorian
//   derivation (`HijriDate.toGregorian(year, month, day)`) with a single
//   shared registry `window.ISLAMIC_EVENT_DATES` built from explicit Local
//   Date constructors `new Date(y, monthIndex, d, 0, 0, 0)` — NO UTC, NO
//   Date.UTC(), NO `T00:00:00Z`, NO server time, NO city dependency.
//   Refreshed dates: Eid al-Adha 27 May 2026, Hijri NY 16 Jul 2026,
//   Ramadan 8 Feb 2027, Eid al-Fitr 9 Mar 2027.
//   Display formats unified across cards + pages:
//     • >1 day → "21 يومًا" / "21 days"
//     • 1 day  → "غدًا"   / "Tomorrow"
//     • 0 day  → "اليوم"   / "Today"
//     • past   → "انتهى"   / "Ended" (new key `moon.events.ended`, never neg)
//   Notice paragraph rewritten in all 10 langs to clarify the counter
//   follows the user's device timezone (no city, no UTC).
//   General countdown pages were ALWAYS device-time-local; this commit just
//   formalizes the source-of-truth so cards stay in sync with pages.
//   Untouched: prayer-times routes (city-bound), moon-info, qibla, sitemap,
//   curated places, country mapping, SSR for city pages.
//   Cache-buster: js/app.js?v=725 → ?v=726; i18n version 184 → 185.
const CACHE_VERSION = 'v357';
const STATIC_CACHE  = `tp-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `tp-runtime-${CACHE_VERSION}`;

// الأصول التي تُحمَّل بشكل متكرر ومفيد كاشها محلياً
// AZKAR-RESTRUCTURE-MORNING-PHASE-1 (2026-05-25):
//   • Added /js/azkar-data.js — new bundle that drives /azkar hub and
//     /azkar/morning-azkar. Without precache, a returning user with the
//     SW already installed would not pick up the new file until the next
//     network request.
//   • Bumped CACHE_VERSION v335 → v336 so the SW activate step purges
//     the previous caches.
//   • NOT precaching /fonts/AmiriQuran-Regular.woff2 — the woff2 binary
//     is a pending manual asset (see fonts/README.md). Adding a missing
//     path would make addAll() reject and skip the entire precache. Add
//     a line here in Phase 2 once the file ships.
//   • /js/duas.js is kept until Phase 2 (compat shim — see js/duas.js).
const PRECACHE_URLS = [
    '/css/style.css?v=178',
    '/js/i18n.js?v=134',
    '/js/prayer-times.js?v=47',
    '/js/hijri-date.js?v=42',
    '/js/qibla.js?v=44',
    '/js/moon.js?v=52',
    '/js/moon-chart.js?v=7',
    '/js/duas.js?v=43',
    '/js/azkar-data.js?v=2',
    '/js/app.js?v=475',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
                    .map((k) => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    // تجاهل الطلبات عبر الأصل (cross-origin)
    if (url.origin !== self.location.origin) return;

    // 1) أصول ثابتة versioned (لها ?v=N) → cache-first
    const isVersionedStatic =
        /\.(?:css|js)$/i.test(url.pathname) && url.searchParams.has('v');

    if (isVersionedStatic) {
        event.respondWith(
            caches.match(req).then((cached) => {
                if (cached) return cached;
                return fetch(req).then((resp) => {
                    if (resp.ok) {
                        const copy = resp.clone();
                        caches.open(STATIC_CACHE).then((c) => c.put(req, copy)).catch(() => {});
                    }
                    return resp;
                }).catch(() => cached);
            })
        );
        return;
    }

    // 2) /api/* → stale-while-revalidate (شبكة أولاً، ثم كاش فالباك)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            caches.open(RUNTIME_CACHE).then((cache) =>
                cache.match(req).then((cached) => {
                    const fetchPromise = fetch(req).then((resp) => {
                        if (resp && resp.ok) cache.put(req, resp.clone()).catch(() => {});
                        return resp;
                    }).catch(() => cached);
                    return cached || fetchPromise;
                })
            )
        );
        return;
    }

    // 3) HTML والصفحات → network-first مع fallback كاش
    if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
        event.respondWith(
            fetch(req).then((resp) => {
                if (resp && resp.ok) {
                    const copy = resp.clone();
                    caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy)).catch(() => {});
                }
                return resp;
            }).catch(() => caches.match(req))
        );
    }
});
