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
//   on /time-left-until-next-prayer-in-{city} AND the next-prayer hero
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
//     • Only the SSR HTML emitted for /time-left-until-next-prayer-in-{slug}
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
// CITY-PRAYER-INFO-PILLS-RESPONSIVE-FIX-1 (2026-05-26):
//   v357 → v358. CSS-only mobile responsive fix for #summary-info-strip
//   pills (الإمساك / مدة الصيام / آخر ثلث الليل / طريقة الحساب) on
//   /prayer-times-in-{city} pages. Removed the legacy `white-space:
//   nowrap` on `.sis-item` that clipped long calc-method labels like
//   "طريقة الحساب: المغرب - وزارة الأوقاف والشؤون الإسلامية" — text now
//   wraps within the pill via `inline-flex` + `flex-wrap: wrap` +
//   `overflow-wrap: anywhere`. Mobile (≤ 640 px) switches the strip to a
//   1-column grid with full-width pills so every label has room to wrap
//   onto 2-3 lines without horizontal overflow. RTL preserved (flexbox).
//   Scope: #summary-info-strip only lives inside #page-prayer-times.
//   Untouched: prayer-time computation, calc-method values, fasting/imsak/
//   last-third logic, /moon-today / /qibla / /azkar pages.
//   Cache-buster: css/style.css?v=446 → ?v=447.
// ADVANCED-SETTINGS-MODAL-MOBILE-FIX-1 (2026-05-26):
//   v358 → v359. Fix the settings modal (إعدادات حساب المواقيت) being
//   cropped under the mobile sidebar drawer on /prayer-times-in-{city}.
//   Root cause: `.settings-modal-overlay` was at z-index 1000, BELOW
//   `.sidebar` at z-index 1100 — when the drawer opened it sat on top
//   of the modal on the inline-end side. Fix bumps the overlay to
//   z-index 9999 (matches other site overlays + dialogs) so it always
//   floats above the sidebar/top-header/sticky bars. Also tightened
//   mobile box sizing (max-width 100%, calc(100vh - 24px) max-height,
//   overflow-x: hidden) so long Arabic method names like "اتحاد المنظمات
//   الإسلامية الفرنسية" can wrap without horizontal overflow. The
//   `openSettingsModal()` JS helper now also calls `closeSidebar()`
//   pre-emptively so the drawer doesn't peek behind the dimmed overlay.
//   No logic changes — Shafi/Hanafi/method values/storage untouched.
//   Cache-buster: css/style.css?v=447 → ?v=448; js/app.js?v=726 → ?v=727.
// STICKY-NEXT-BAR-SIDEBAR-OVERLAP-FIX-1 (2026-05-26):
//   v359 → v360. Same root cause as ADVANCED-SETTINGS-MODAL-MOBILE-FIX-1
//   but for `.sticky-next-bar` (the "القادمة: الفجر · 06:34:55 | المدينة"
//   strip that floats below the header on /prayer-times-in-{city}).
//   Previously: `left: 0; right: 0` made the bar span the full viewport
//   including the area the desktop sidebar (z-index 1100) occupies, so
//   the sidebar visually clipped its inline-end half. On mobile, the same
//   bug appeared whenever the user opened the nav drawer.
//   Fix: mirror the `.moon-sticky-bar` UAT-fix exactly — switch to
//   logical-property positioning (`inset-inline-start: var(--sidebar-width, 0); inset-inline-end: 0`)
//   on desktop, then `inset-inline-start: 0` inside `@media (max-width: 768px)`
//   when the sidebar collapses into a drawer.
//   CSS-only, ~12 line change. RTL/LTR both honored (logical properties).
//   Untouched: .moon-sticky-bar, .top-header, .sidebar, header z-index,
//   /moon-today, /qibla, /azkar.
//   Cache-buster: css/style.css?v=448 → ?v=449.
// AZKAR-RESET-COUNTERS-NO-RELOAD-FIX-1 (2026-05-26):
//   v360 → v361. Critical bug fix for the reset-all button on /azkar/
//   morning-azkar, /azkar/evening-azkar, /azkar/prayer-azkar. After
//   tapping reset + confirm, evening/prayer pages flashed the SSR-fallback
//   notice "تعذّر تحميل أذكار المساء/الصلاة. يرجى إعادة تحميل الصفحة." —
//   because the reset handler cleared `listEl.innerHTML` + the
//   `data-ssr-rendered` marker before re-calling `_loadAzkarX()`, which
//   on evening/prayer entered the missing-SSR fallback branch (their
//   load functions have no client-rebuild path, unlike morning).
//   Fix: new shared helper `_azkarResetCardsInPlace(category, items, progressFn)`
//   that resets counters in place — walks the existing DOM cards (still
//   mounted from SSR), removes `.completed` class, resets counter text
//   to `0 / N`, resets prompts/aria-pressed, refreshes progress UI. NO
//   innerHTML wipe, NO data-ssr-rendered removal, NO _loadAzkarX
//   re-call. Applied to all 6 reset callers (3 page-level + 3 sticky-bar).
//   Invariants honored: window.AzkarMorning/Evening/Prayer untouched,
//   route/page-state untouched, no error notices shown.
//   Cache-buster: js/app.js?v=727 → ?v=728.
// QIBLA-CITY-BREADCRUMB-LABEL-FIX-1 (2026-05-26):
//   v361 → v362. Descriptive last breadcrumb item on /qibla-in-{city}
//   pages across all 10 langs. Was: "الرياض" / "Riyadh" / etc. Now:
//   "اتجاه القبلة في الرياض" / "Qibla Direction in Riyadh" / "Direction
//   de la Qibla à Riyad" / "Riyad için kıble yönü" / etc. Matches the
//   page H1 wording and aligns the visible breadcrumb byte-for-byte with
//   the BreadcrumbList JSON-LD (no Google Search Console rich-result
//   mismatch). City name still resolved via the same client name picker,
//   so localized names appear correctly per lang (ریاض, Riyad, etc.).
//   JS-only change: 10 new `bc_qibla_in_city(city)` functions inside
//   `_QIBLA_UI` + tiny tweaks to `_buildQiblaBreadcrumbOl` and the
//   JSON-LD generator. No HTML / CSS / SSR / i18n.js / per-lang file
//   touched. Hub `/qibla` unchanged (last item stays = "اتجاه القبلة").
//   Cache-buster: js/app.js?v=728 → ?v=729.
// QIBLA-RELATED-SERVICES-CARDS-UX-FIX-1 + QIBLA-CITY-DARK-MODE-CARDS-FIX-1 (2026-05-26):
//   v362 → v363. Two related UI/UX fixes for /qibla-in-{city} pages,
//   bundled in one commit because both touch the qibla page surface.
//
//   PART A — RELATED-SERVICES cards:
//   The 3 related-services links (Prayer Times / Moon Today / Hijri Date)
//   were rendered as compact pill buttons that gave no context about WHY
//   to click. Re-rendered as descriptive cards: icon + title + 1-line
//   description + arrow. Whole card is clickable (fully accessible <a>
//   with aria-label = title). Responsive grid (1-3 cols), RTL-aware
//   arrow direction, 10-lang content via new `related_cards(city)` fn
//   per lang inside `_QIBLA_UI`. Old `related_labels` kept for safety.
//
//   PART B — DARK MODE cards/note/FAQ:
//   The .qibla-seo-card / .qibla-seo-note / .qibla-seo-stat blocks (the
//   evergreen SEO content section) had hardcoded white/light-amber bgs
//   that stayed white in dark mode while the text inherited the global
//   dark-mode color override, producing washed-out unreadable cards.
//   New `html[data-theme="dark"] #page-qibla .qibla-seo-*` overrides
//   use the existing dark palette (--card-bg, --primary-light, --gold-
//   light) for proper contrast. Same treatment for the new related-
//   services cards + the FAQ <details> blocks. Light mode untouched
//   (no changes to existing light-theme rules).
//
//   Scope: scoped under `#page-qibla` — no impact on /prayer-times-in-*,
//   /moon-today, /azkar. Light mode visually identical to before.
//   Cache-busters: css/style.css?v=449 → ?v=450; js/app.js?v=729 → ?v=730.
// QIBLA-CITY-FAQ-SEO-EXPANSION-1 (2026-05-26):
//   v363 → v364. Expanded FAQ on /qibla-in-{city} pages from 4 to 10 Q&A
//   pairs across all 10 langs, targeting common search intents
//   (compass / mobile / app-difference / north-or-south / city-to-city
//   variance / approximate-angle). Existing 4 questions preserved.
//   FAQPage JSON-LD reads from the same `faqItems` array as the
//   visible <details> rendering, so DOM and schema stay byte-identical
//   (no Google Search Console rich-result mismatch). City name still
//   resolved via the same client name picker per lang. JS-only change:
//   ~60 new Q&A pairs added inside `_QIBLA_UI[lang].faq(ctx)` functions.
//   Untouched: Qibla calc, angle/distance, canonical, H1, related-services,
//   /qibla hub, prayer-times/moon/azkar pages.
//   Cache-buster: js/app.js?v=730 → ?v=731.
// DATE-CONVERTER-TAB-HIDDEN-CLASS-FIX-1 (2026-05-31):
//   v373 → v374. Bug fix on /dateconverter: clicking the "Hijri →
//   Gregorian" or "Solar → Gregorian" tabs showed an empty body.
//   Root cause: the two hidden converter <div>s carry `class="u-hidden"`,
//   and `.u-hidden { display: none !important; }` (css/style.css:8511)
//   cannot be overridden by the inline `style.display='block'` that
//   `switchConverter()` was setting — `!important` always wins. Switched
//   to `classList.toggle('u-hidden', !visible)` + cleared any legacy
//   inline `display` left over from the previous code path. Single
//   function `switchConverter()` in js/app.js (~line 23833). No CSS
//   change, no HTML change. Untouched: prayer-times pages, /qibla,
//   /moon-*, /azkar/*, /today-hijri-date, all i18n.
//   Cache-buster: js/app.js?v=740 → ?v=741.
// CITY-PRAYER-ISLAMIC-EVENTS-COUNTDOWN-FIX-1 (2026-05-31):
//   v372 → v373. UX upgrade for the bottom of /prayer-times-in-{city}:
//   the legacy 3rd tier of `#related-links-section` (`.rls-tier-nav`
//   with `rl-weekly` self-anchor + `rl-country` aggregation link) was
//   REPLACED with a more useful Islamic-events countdown section —
//   same `<section class="section-card moon-events-section">` block
//   that appears on /moon-today + the 3 azkar pages (4 cards: Ramadan
//   / Eid al-Fitr / Eid al-Adha / Hijri New Year, each with a
//   localized days-remaining label or "يجري الآن" when active).
//
//   Implementation:
//   • index.html — removed the `.rls-tier-nav` <div> (13 lines), added
//     a sibling `<section class="moon-events-section">` immediately
//     after `#related-links-section` close.
//   • js/app.js — `_azkarRenderMoonEvents()` had its scope extended
//     from 3 azkar pages to 4 pages (now also includes
//     `#page-prayer-times`). The function is called from
//     `updateRelatedLinks()` (which already runs on every prayer-times
//     city page activation) — so the new section fills automatically.
//     Also removed the now-orphaned `rl-weekly` + `rl-country` rows
//     from the items[] array (the DOM ids no longer exist).
//
//   Result on /prayer-times-in-riyadh:
//     • #related-links-section now has 2 tiers (Live + Info) instead of 3
//     • New sibling moon-events-section shows 4 countdown cards with
//       same rolling-cycle logic (Eid Adha "يجري الآن", etc.)
//     • Links go to /ramadan-countdown / /eid-al-fitr-countdown /
//       /eid-al-adha-countdown / /hijri-new-year-countdown
//
//   Untouched: prayer time calculation, the previously-pushed
//   #pt-related-tools section (4 generic tool cards), the rest of
//   #related-links-section (Live + Info tiers stay intact), all moon /
//   qibla / azkar / hijri pages, the i18n catalog.
//   Cache-buster: js/app.js?v=739 → ?v=740.
// CITY-PRAYER-RELATED-ISLAMIC-TOOLS-SECTION-1 (2026-05-31):
//   v371 → v372. New "Islamic tools for your day in {city}" section added
//   to every /prayer-times-in-{city} page (10 langs). Reuses the
//   .hd1-tools-section visual pattern from /today-hijri-date — same
//   .hd1-tools-grid + .hd1-tool-card markup so CSS is shared (no new
//   rules). 4 cards inside the new section:
//     1. الأذكار اليومية        → /azkar          (static)
//     2. اتجاه القبلة في {city}  → /qibla-in-{slug} (dynamic href + name)
//     3. حالة القمر اليوم        → /moon-today-in-{slug} (dynamic href)
//     4. التاريخ الهجري اليوم    → /today-hijri-date (static)
//   Deliberately EXCLUDES:
//     • مواقيت الصلاة اليوم — would be a self-link to /prayer-times-in-{slug}
//     • كم باقي على الصلاة القادمة — replaced by Azkar card per user spec
//   Placement: index.html ~line 738, immediately AFTER #city-calc-settings
//   (the settings <details>) and BEFORE #city-summary-paragraph. Hidden
//   via `u-hidden` until JS attaches a real city slug — avoids inline
//   AR text flashing on non-AR pages.
//   Filled by `updateRelatedLinks()` in js/app.js (~line 9210+), reusing
//   the existing function's `(citySlug, cityName, countrySlug, countryName,
//   lang)` signature. All 10-lang strings inline in JS — NO new i18n
//   keys needed (i18n.js + 10 standalone files untouched).
//   No CSS changes (reuses .hd1-tools-section + .hd1-tool-card existing
//   styles + dark-mode variants). Untouched: prayer time calculation,
//   #related-links-section (the existing 7-link block), /qibla*,
//   /moon-*, /azkar/*, /hijri-* pages.
//   Cache-buster: js/app.js?v=738 → ?v=739.
// NEXT-PRAYER-COUNTDOWN-SLUG-SEO-FIX-1 (2026-05-27):
//   v370 → v371. Pre-launch slug rename + H1 dedup for the prayer-countdown
//   page. Old route `/time-left-until-prayer-in-{city}` renamed to the more
//   intent-accurate `/time-left-until-next-prayer-in-{city}` across every
//   surface: server.js (route handlers, sitemap, canonical, redirect map),
//   js/app.js (SPA activator regexes, internal-link builders, related-
//   links cards), index.html (search-card href + comments), css/style.css
//   + sw.js (comments only). 5 production files × 48 total replace_all
//   occurrences. No legacy 301 redirect added — site is pre-launch, the
//   old slug never went public, no SEO-history to preserve.
//
//   Plus H1 cleanup: the old H1 was "كم باقي على صلاة {DYNAMIC_PRAYER} في
//   {city}؟" — i.e. the title MUTATED per hour (Fajr / Dhuhr / Asr …).
//   Per-user spec H1 must stay FIXED so Google indexes a stable string.
//   Removed `<b class="tl-h1-prayer" id="tl-h1-prayer">` from index.html.
//   The dynamic prayer name still appears in `.tl-meta` body text. JS
//   fill at js/app.js:13915 is null-safe (`if (_tlH1Prayer)`) → no JS
//   change. Updated `tl.h1_prefix` in all 10 langs to carry the full
//   lead-in ("كم باقي على الصلاة القادمة في" / "Time left until the
//   next prayer in" / etc); set `tl.h1_in` to '' (was a grammar
//   connector for the now-removed slot). Applied to BOTH the main
//   bundle `js/i18n.js` (10 langs) AND the per-lang bundles
//   `js/i18n/{lang}.js` (10 files). i18n version bumped 185→186.
//
//   Result: visiting /time-left-until-next-prayer-in-riyadh renders:
//     AR: "كم باقي على الصلاة القادمة في الرياض؟"
//     EN: "Time left until the next prayer in Riyadh?"
//     FR: "Temps restant avant la prochaine prière à Riyadh ?"
//     (… same shape across all 10 langs)
//
//   No per-prayer pages created (e.g. NO /time-left-until-fajr-in-X).
//   Untouched: /prayer-times-in-*, /next-prayer-in-*, /qibla-*,
//   /moon-*, /azkar/*, /hijri-*. Cache-busters: js/app.js?v=737 → ?v=738;
//   css/style.css?v=453 → ?v=454; i18n version 185 → 186.
// ISLAMIC-EVENTS-COUNTDOWN-PAGE-ACTIVE-CYCLE-FIX-1 (2026-05-27 — Phase B):
//   v369 (composite commit now bumped to v370 to fold in Phase B feedback
//   from the user before push). Two additional surface changes layered on
//   top of the Phase A work documented immediately below:
//
//     [B1] CSS: remove the years-table internal scroll. The wrapper had
//          `max-height: 360px; overflow-y: auto;` which forced an awkward
//          inner scrollbar with sticky-thead overhead for what is always
//          only 5 rows. Switched to `max-height: none; overflow-y: visible;`
//          so the table grows to its intrinsic height (no scrollbar, no
//          row-vs-header overlap risk because there's nothing to scroll).
//          Kept the sticky-thead OPAQUE-background fix as a no-op safety
//          net in case the cap ever returns.
//
//     [B2] CSS + JS: split the previously-single active sentence into
//          TWO distinct strings to stop the duplication the user spotted
//          ("بدأ عيد الأضحى 1447 هـ يوم 27 مايو 2026، وهو جارٍ الآن"
//          appearing both under H1 AND below the counter).
//          Now:
//            • #*-h1-seo  → CELEBRATORY chip with festive per-event copy
//              (Eid → "وكل عام وأنتم بخير", Ramadan → "تقبّل الله صيامكم
//              وقيامكم", NY → "نسأل الله أن يجعله عام خير وبركة").
//              Styled via the new `.cd-h1-seo.countdown-active-intro`
//              rule (rounded pill, soft green tint, dark-mode variant).
//            • #*-seo-line → FUNCTIONAL concise variant
//              ("بدأت أيام عيد الأضحى يوم 27 مايو 2026." etc).
//          AR + EN explicit per event; 8 other langs fall back to AR.
//
//   Cache-busters: js/app.js?v=736 → ?v=737; css/style.css?v=452 → ?v=453.
//
// ISLAMIC-EVENTS-COUNTDOWN-PAGE-ACTIVE-CYCLE-FIX-1 (2026-05-27 — Phase A):
//   v368 → v369 (single composite commit). Apply ACTIVE-CYCLE awareness
//   to every surface of the 4 Islamic-event countdown pages
//   (/ramadan-countdown + /eid-al-fitr-countdown + /eid-al-adha-countdown
//   + /hijri-new-year-countdown). Six coordinated surface changes when
//   the resolver returns `status:'active'`:
//
//     (1) H1 textContent — swaps "🐑 كم باقي على عيد الأضحى 1447 هـ؟"
//         for the event-specific active title (e.g. "🐑 عيد الأضحى
//         المبارك جارٍ الآن 1447 هـ"). Removes data-i18n on the H1 so
//         later i18n re-binds don't overwrite. Per-event AR + EN; other
//         8 langs fall back to AR.
//     (2) #*-h1-seo sub-line — swaps "N days remain until X" for
//         "بدأ X يوم Y، وهو جارٍ الآن" (per event, localized).
//     (3) #*-seo-line bottom SEO — same active sentence as (2).
//     (4) .cd-personal-bar line 2 (.cdp-l2) — swaps "N days remain
//         until X begins" for the per-event "happening now" line.
//     (5) Ticker target — switches from `_eventGreg` (active cycle's
//         PAST start; would always display "انتهى" + 00:00:00) to
//         `_activeEndDate` (cycle.start + durationDays). Counter now
//         meaningfully counts DOWN to end of festival. New CSS hook
//         class `is-active` on `.countdown-timer` for future styling.
//         Edge case: if `diff <= 0` while active (rare — page left open
//         across festival end), days cell shows "يجري الآن" instead of
//         "انتهى"; reload resolves the next upcoming cycle.
//     (6) Years table — base Hijri year shifts +1 when active so the
//         current in-progress cycle is excluded from the "upcoming
//         years" table. Row 0 becomes the next strictly-future cycle;
//         "after N days" recomputed against it. Row count stays at 5
//         via Hijri-math extrapolation for the tail.
//
//   Plus a CSS-only sticky-thead fix on `.countdown-table thead th`:
//   the previous rule overrode only position/top/z-index, leaving the
//   semi-transparent `rgba(76,175,80,0.10)` from the base. Rows visually
//   bled through during scroll. Layered an opaque `var(--card-bg)`
//   underneath + kept the green tint as overlay gradient; added
//   bottom box-shadow + bumped z-index 2→3. Dark-mode equivalent.
//
//   AR + EN explicit in JS templates; 8 other langs fall back to AR.
//   No new i18n keys (reuses `moon.events.active_now` from previous
//   ISLAMIC-EVENTS-ROLLING-CYCLE-FIX-1). No HTML structure change.
//   SSR untouched. Untouched pages: /prayer-times-in-*, /qibla-in-*,
//   /azkar/*, /moon-today*, /moon-in-*, /hijri-calendar, /zakat-
//   calculator, /msbaha. Card semantics (small cards on /moon-today
//   etc.) unchanged — still uses ISLAMIC-EVENTS-ROLLING-CYCLE-FIX-1
//   logic and shows "يجري الآن" for active events.
//   Cache-busters: js/app.js?v=734 → ?v=736 (two intermediate WIP
//   versions never deployed); css/style.css?v=451 → ?v=452.
// ISLAMIC-EVENTS-FUTURE-TABLE-ACTIVE-CYCLE-FIX-1 (rolled into above):
//   v368 → v369. Two-part fix for the "upcoming years" table on the 4
//   Islamic-event countdown pages (/ramadan-countdown + /eid-al-fitr-
//   countdown + /eid-al-adha-countdown + /hijri-new-year-countdown):
//
//   [CSS] css/style.css `.countdown-table thead th` — the sticky-thead
//   rule only overrode position/top/z-index, leaving the base background
//   `rgba(76,175,80,0.10)` from `.countdown-table th`. Semi-transparent
//   tint let rows visually bleed through the header during scroll. Fix
//   layers an OPAQUE `var(--card-bg)` underneath via background-color +
//   keeps the green tint as background-image gradient (visual color
//   unchanged, opacity now solid). Adds bottom box-shadow + bumps
//   z-index 2→3 to crisply separate from scrolled rows. Dark-mode
//   equivalent included.
//
//   [JS] js/app.js _initCountdownPage() years table builder — when
//   `_isEventActive` (set by ISLAMIC-EVENTS-ROLLING-CYCLE-FIX-1), the
//   loop now shifts Hijri-year base by +1 so the CURRENT in-progress
//   cycle (which has already started — start ≤ today) is EXCLUDED
//   from a table titled "upcoming years". Row 0 of the displayed
//   table is the first strictly-future cycle. The "after N days"
//   label is recomputed against THAT future date (not against the
//   active cycle's past start). Row count stays at 5 — list shifts
//   forward by 1 year via Hijri math. Card semantics untouched: the
//   live counter still shows "يجري الآن" during the active window
//   (separation of table vs. card semantics per user spec).
//
//   No HTML structure change. No new i18n keys. SSR untouched.
//   Untouched pages: /prayer-times-in-*, /qibla-in-*, /azkar/*,
//   /moon-today*, /moon-in-*, /hijri-calendar, /zakat-calculator,
//   /msbaha.
//   Cache-busters: js/app.js?v=734 → ?v=735; css/style.css?v=451 → ?v=452.
// ISLAMIC-EVENTS-ROLLING-CYCLE-FIX-1 (2026-05-27):
//   v367 → v368. Replace "انتهى" semantics with rolling-cycle logic for
//   the 4 Islamic-event countdown cards (Ramadan / Eid al-Fitr / Eid
//   al-Adha / Hijri New Year) on every page that renders them:
//     • /moon-today + /moon-today-in-{city} + /moon-in-{city}/{date}
//     • /azkar/morning-azkar + /azkar/evening-azkar + /azkar/prayer-azkar
//     • /ramadan-countdown + /eid-al-fitr-countdown +
//       /eid-al-adha-countdown + /hijri-new-year-countdown
//   New schema: window.ISLAMIC_EVENT_DATES[k] now carries `cycles[]`
//   instead of single `target`. Each cycle has `start` (Local Date) +
//   `hijriYear` + optional `durationDays` (active-window length).
//   New helpers: window._islamicEventResolveCycle(k, now?) → {status,
//   start, endExclusive?, hijriYear, daysLeft} and
//   window._islamicEventStatusLabel(resolved, lang) → localized text.
//   Active durations: ramadan 29-30d, fitr 3d, adha 4d, newyear 1d.
//   When today is inside an active cycle, the card shows "يجري الآن"
//   (or localized: Happening now / En cours / Sedang berlangsung /
//   جاری ہے / Läuft gerade / etc. across all 10 langs) and sorts to
//   FRONT of the grid. The legacy `.moon-event-ended` class + "انتهى"
//   text are gone — past cycles are auto-skipped.
//   Date corrections from project's Umm al-Qura table: Hijri NY 1448
//   was Jul 16 2026 (WRONG month-index typo) → corrected to Jun 16 2026.
//   3 new future cycles added per event (covers 1448-1450).
//   _azkarRenderMoonEvents() scope expanded from #page-azkar-morning
//   ONLY to all 3 azkar pages (morning + evening + prayer) — evening
//   and prayer used to show "—" placeholders forever; now they fill.
//   Untouched: server.js SSR (qhe-section already auto-skips past via
//   its own Hijri year-bump), CSS, HTML structure, individual-page
//   counter widgets (target still works for active=now=0d behavior),
//   prayer-times/qibla/azkar-content pages.
//   Cache-buster: js/app.js?v=733 → ?v=734.
// MOON-DAY-NAV-WEEKDAY-LABEL-FIX-1 (2026-05-27):
//   v366 → v367. JS-only UX polish for the moon date-nav buttons on
//   /moon-today-in-{city} and /moon-in-{city}/{date} pages. Now each
//   button's sub-text starts with the localized weekday name:
//     prev → "الجمعة 29 مايو"        (was: "29 مايو")
//     today → "السبت 30 مايو 2026"   (was: "30 مايو 2026")
//     next → "الأحد 31 مايو"          (was: "31 مايو")
//   English uses comma convention: "Saturday, May 30, 2026".
//   10 langs supported via native Intl.DateTimeFormat({weekday:'long'}) —
//   no new i18n keys, no CSS, no HTML changes. Helpers _moonNavWeekday +
//   _joinWeekdayAndDate live inline inside the existing nav block in
//   updateMoonInfo() (js/app.js ~line 20803). Hijri-context sub-text
//   still uses Hijri month name but now also prepended with weekday
//   (the weekday is calendar-independent — derived from JS Date).
//   Untouched: prev/next href targets, today.href, page date selection,
//   moon data (phase/illumination/age/rise/set/distance), forecast
//   table, prayer-times/qibla/azkar pages, SSR, JSON-LD.
//   Cache-buster: js/app.js?v=732 → ?v=733.
// MOON-CURRENT-CYCLE-RISE-SET-FIX-1 (2026-05-27):
//   v365 → v366. Behavior + UI fix for /moon-today-in-{city} and
//   /moon-in-{city}/{date} pages: the displayed moonset is now ALWAYS
//   the end of the SAME cycle as the displayed moonrise — even when
//   it crosses to the next calendar day.
//   Before: getMoonTimes returned the FIRST set in the [00:00, 24:00]
//   local-city window. When today's rise was in the evening, the
//   returned set belonged to YESTERDAY's evening rise cycle (confusing
//   for users monitoring "today's moon").
//   Fix: js/app.js updateMoonInfo() now detects setTime < riseTime (or
//   missing set) and re-fetches getMoonTimes(today+1day) to use ITS
//   set instead. When that next-day set is displayed, a small note
//   "صباح اليوم التالي" (or localized equivalent) appears below the
//   time. New DOM element `<div id="moon-set-note" class="value-sub
//   moon-set-note" hidden>` reuses the existing .value-sub styling
//   (no CSS change). 10-lang i18n key `moon.set_next_day_note` added.
//   MoonCalc.getMoonTimes return signature was extended additively
//   with `riseTime`/`setTime` raw Date objects (the formatted `rise`/`set`
//   strings stay byte-identical for back-compat with forecast table,
//   moon chart, mini-card on home, etc).
//   Untouched: phase, illumination, age, distance, zodiac, city tz,
//   forecast table, prayer-times/qibla/azkar pages, SSR, JSON-LD.
//   Cache-busters: js/moon.js?v=52 → ?v=53; js/app.js?v=731 → ?v=732.
// QIBLA-HUB-MOBILE-CTA-FIX-1 (2026-05-27):
//   v364 → v365. Mobile-responsive polish for /qibla hub hero card.
//   User report: on viewports <768px, the primary "use my location" CTA
//   rendered as a giant near-square block, the secondary "pick a city"
//   button cropped, and trust chips overflowed the card edges.
//   User CRITICAL constraint: KEEP ALL 8 hero elements visible on mobile —
//   do NOT hide smart-pill, subtitle, microcopy note, or trust chips.
//   Desktop layout must remain UNCHANGED.
//   Fix: new `@media (max-width: 767px)` block in css/style.css scoped
//   strictly under `#page-qibla`, mirroring the earlier
//   MOON-HERO-MOBILE-CTA-FIX-1 pattern at line ~27296. The shared
//   classes (.qibla-dual-cta / .qibla-hub-geo-btn / .qibla-hub-pick-btn /
//   .qibla-hub-hero-card / .qibla-hub-hero-badges) are used on BOTH
//   /qibla AND /moon-today; each page now has its own scoped mobile
//   block so neither leaks into the other.
//   Rules added: (1) hero overflow-x:hidden + box-sizing border-box +
//   padding 20px/14px (2) H1 clamp() (3) subtitle 0.95rem (4) smart-pill
//   compact (5) hero search width 100% min-height 52px (6) dual CTA
//   flex-column !important (7) both buttons full-width 56px pill geometry
//   with `height: auto / max-height: none / aspect-ratio: auto` to defeat
//   any legacy stretch (8a) microcopy centered (8b) trust chips justified
//   center with flex-wrap.
//   Untouched: desktop layout, /moon-today hero, /prayer-times-in-*,
//   /azkar, JSON-LD schema, JS, server.js, sidebar nav.
//   Cache-buster: css/style.css?v=450 → ?v=451 (no JS change).
//
// HIJRI-YEAR-CALENDAR-FAQ-SEO-EXPANSION-1 (2026-05-31):
//   Expanded `/hijri-calendar/{year}` FAQ from 3 → 12 questions per language
//   (all 10 langs). Added year-start/end, month order, Ramadan/Eid-Fitr/
//   Eid-Adha dates (Umm al-Qura ± moon-sighting caveat), Hijri↔Gregorian
//   conversion, cross-country differences, lunar-vs-solar comparison.
//   FAQPage JSON-LD auto-syncs (single source: `ui.faq(ctx)`).
//   Cache-buster: js/app.js?v=741 → ?v=742, sw v374 → v375.
//
// HIJRI-CALENDAR-MOBILE-YEAR-NAV-OVERLAP-FIX-1 (2026-05-31):
//   Defensive CSS-only mobile-scoped patch on /hijri-calendar — adds
//   explicit `position: relative` + z-index stacking + `overflow: visible`
//   to .hpage-hero-start, .calendar-year-picker, .hyear-year-nav-*, and a
//   LOWER z-index + clear:both on the #hyear-info-grid section-card. This
//   bulletproofs the prev/next year buttons against any future cascade
//   absolute/transform positioning + against user font-zoom edge cases.
//   No JS, no data, no DOM, no SEO, no calculations changed.
//   Cache-buster: css/style.css?v=454 → ?v=455, sw v375 → v376.
//
// QIBLA-CITY-QUICKLINKS-CTA-PILL-STYLE-1 (2026-05-31):
//   CSS-only restyle of #page-qibla .qibla-quicklinks (the 3-link block on
//   /qibla-in-{city} pages) to match the visual system of #hyear-cta on
//   /hijri-calendar — balanced 3-col grid, primary-fill first action +
//   white outline secondaries, 50px min-height, 12px radius, soft shadows,
//   hover lift on desktop, single-column stack on mobile, dark-mode parity.
//   No DOM/text/href/JS/i18n/SEO/JSON-LD/calculation changes.
//   Cache-buster: css/style.css?v=455 → ?v=456, sw v376 → v377.
//
// HIJRI-CALENDAR-MOBILE-YEAR-NAV-FLOW-FIX-2 (2026-05-31):
//   Follow-up to FIX-1: changes .hyear-year-nav-row from grid 2-col to
//   flex-column on mobile (≤767px), so prev/next buttons stack vertically
//   inside the year-picker instead of side-by-side. Eliminates wrapping/
//   overflow risk at narrow widths or with font-zoom. Adds defensive
//   position:static + transform:none + width:100% locks on all year-nav
//   buttons + the CTA so cascading rules cannot lift them out of flow.
//   No DOM/JS/data/SEO/desktop changes.
//   Cache-buster: css/style.css?v=456 → ?v=457, sw v377 → v378.
//
// QIBLA-CITY-ISLAMIC-EVENTS-COUNTDOWN-CLONE-1 (2026-05-31):
//   Replaces the legacy footer block on /qibla-in-{city} (qibla-footer-seo
//   + qibla-related + qibla-trust-note inside a <div class="section-card">)
//   with a clone of the Islamic Events Countdown section (4 cards: Ramadan
//   / Eid Fitr / Eid Adha / Hijri New Year). Mirrors the prayer-times
//   implementation from 9d393fb. Extends `_azkarRenderMoonEvents()` scope
//   in js/app.js to include #page-qibla. JS handlers at app.js:16906-16956
//   that previously populated the removed IDs now silently no-op.
//   Cache-buster: js/app.js?v=742 → ?v=743, sw v378 → v379.
//
// MOON-DISC-GLOW-REMOVE-KEEP-DROPSHADOW-1 (2026-05-31):
//   Removed the warm-yellow outer glow on the moon SVG disc by stripping
//   the first `drop-shadow(0 0 18px rgba(255,230,150,0.28))` from the
//   chained `filter:` on `.moon-svg` (css/style.css:2630). Kept the
//   natural dark `drop-shadow(0 4px 10px rgba(0,0,0,0.25))` for depth.
//   Applies to all moon pages (/moon-today, /moon-today-in-{city},
//   /moon-in-{city}, /moon-in-{city}/{date}). No JS/data/calc/SEO change.
//   Cache-buster: css/style.css?v=457 → ?v=458, sw v379 → v380.
//
// HOME-MOON-SECTIONS-LEAK-FIX-1 (2026-05-31):
//   Removed literal angle-bracketed HTML tag tokens from two HTML comments
//   in index.html (lines 1099 + 1459) that were fooling the regex-based
//   tag-balance counter in server.js _stripElement. Bug effect: on / SSR,
//   the related-links-section strip was over-consuming ~1000 lines,
//   devouring page-prayer-times closing div + page-qibla + page-moon
//   wrappers — making moon sections (chart, forecast, FAQ, evergreen)
//   visually fall inside page-prayer-times on the homepage. Comment-only
//   fix; no code, CSS, JS, or strip-algorithm changed. Follow-up systemic
//   ticket: SERVER-STRIPELEMENT-COMMENT-AWARE-1 will harden _stripElement
//   to skip comment regions natively.
//   Cache-buster bump for SW precache invalidation only: sw v380 → v381.
//
// PRAYER-TIMES-COUNTDOWN-CARD-STYLE-FIX-1 (2026-05-31):
//   On /prayer-times-in-{city}, the 4 Islamic-events countdown anchors
//   (from commit 9d393fb) used only `.moon-event-{name}-card` classes,
//   but the per-event coloring CSS at css/style.css:4339+ targets the
//   bare `.moon-event-{name}` (no suffix). Added the bare class alongside
//   the existing `-card` suffix so cards now get the per-event purple/
//   gold/red/blue borders + labels matching /moon-today + /qibla-in-
//   {city} (the latter was fixed identically in 211f1bf).
//   No CSS / JS / data / SEO change. Index.html dual-class addition only.
//   Cache-buster: js/app.js?v=743 → ?v=744, sw v381 → v382.
//
// PRAYER-CALC-SETTINGS-MOBILE-SELECT-LAYOUT-FIX-1 (2026-05-31):
//   Mobile (≤767px) CSS-only fix for the calc-settings <details> block
//   on /prayer-times-in-{city}. Issue: native <select> dropdown arrow
//   rendered at wrong edge in RTL (left instead of right) + default
//   padding didn't reserve space for arrow → text-arrow collision.
//   Touch target was 40px (below 48px guideline). Fix: appearance:none
//   + custom SVG chevron via background-image, positioned via dir-aware
//   selectors (LTR=end, RTL=start), padding-inline 14px/38px, 48px
//   min-height, 12px border-radius, 1rem font-size, dark-mode color
//   variant. No JS/data/calc/advanced-settings logic changed.
//   Cache-buster: css/style.css?v=458 → ?v=459, sw v382 → v383.
//
// PRAYER-TIMES-JUMP-CTA-BUTTON-REMOVAL-1 (2026-05-31):
//   Removed the "Jump to next prayer" CTA button (.cha-cta--banner)
//   from .next-prayer-banner on /prayer-times-in-{city} pages per
//   user request. HTML markup deleted at index.html:609-612 (replaced
//   with a doc comment). Supporting code KEPT as harmless dead code
//   (no DOM refs): jumpToActivePrayer() in js/app.js, .cha-cta--banner
//   CSS rules in css/style.css, cha.cta_jump i18n keys across 10 lang
//   files. A separate cleanup ticket can prune them later if desired.
//   Cache-buster bump for SW precache invalidation only: sw v383 → v384.
//
// ZAKAT-CALCULATOR-UI-CONTENT-UX-IMPROVEMENT-1 (2026-05-31):
//   UI/UX + content + SEO polish for /zakat-calculator. NO calc-logic
//   changes (zero touch to js/app.js zakat module). Surgical additions:
//   1) HTML: empty-state subtitle + 2 educational chips (نسبة/نصاب)
//      using existing badge i18n keys; settings nisab form-group gains
//      `form-group--full-row` class so the 2 radio pills never wrap on
//      the 2-col grid (≥1280px); compact inline disclaimer chip between
//      the result grid and the breakdown table; .zakat-seo restructured
//      from 4 plain h2-blocks into a 2x2 .zakat-edu-grid of cards.
//   2) CSS: 8 new rule blocks scoped under .zakat-*; dark-mode overrides
//      for all new elements; @media (max-width: 480px) keeps mobile
//      single-column reading flow.
//   3) i18n (AR + EN): 4 new keys (zakat.empty.subtitle,
//      zakat.compact_disclaimer.text, zakat.edu.title, zakat.edu.intro);
//      hero title + subtitle updated to add "تقديريًّا" wording per spec.
//      Other 8 langs fall back via existing t() chain (AR/EN per i18n
//      fallback policy used elsewhere in this project).
//   4) server.js: no SSR / route / sitemap / canonical changes —
//      zakatFaq:true (FAQPage + HowTo JSON-LD) already in place at
//      server.js:7912 / 11318-11354, fully verified live.
//   Cache-busters: css/style.css v459→v460, sw v384→v385. js/app.js
//   v744 unchanged (JS untouched).
//
// ZAKAT-CALCULATOR-UI-CONTENT-UX-IMPROVEMENT-1 (follow-up, 2026-05-31):
//   User requested moving the action buttons (.zakat-actions with
//   #zakat-reset + #zakat-copy) from inside #zakat-sticky-result to
//   directly below the "الزكاة المستحقّة" row inside #zakat-breakdown.
//   HTML-only relocation (same buttons, same IDs → js/app.js handlers
//   continue to work). CSS: new .zakat-actions--in-breakdown modifier
//   adds top-border + spacing; the previous opacity-dim rule for
//   .zakat-sticky-result[data-state="empty"] .zakat-actions was REMOVED
//   (orphan — the div no longer lives inside .zakat-sticky-result).
//   Cache-busters: css/style.css v460→v461, sw v385→v386.
//
// ZAKAT-CALCULATOR-UI-CONTENT-UX-IMPROVEMENT-1 (follow-up 2, 2026-05-31):
//   User requested DELETING the entire <aside class="zakat-result-col">
//   (the sticky result column with 5 state blocks + chips + subtitle).
//   The breakdown table (#zakat-breakdown below the inputs) is now the
//   single result display — it already showed all values including the
//   "الزكاة المستحقّة" row highlighted via tr.is-total. Changes:
//   1) HTML: removed entire <aside class="zakat-result-col">...</aside>
//      wrapper from index.html (replaced with explanatory comment).
//   2) JS: _zakatRender() in js/app.js gracefully handles a missing
//      #zakat-sticky-result — the sticky-block updates wrap in
//      `if (root) { ... }` instead of early-return. Breakdown table +
//      hawl notes + backward-compat mirrors ALWAYS update regardless.
//      Zero calc-logic change.
//   3) CSS: .zakat-grid is now permanently 1-col (no @media 2-col
//      desktop split). The .zakat-result-col / .zakat-sticky-result /
//      .zakat-state-* / .zakat-empty-chip* / .zakat-state-subtitle /
//      .zakat-amount-block* / .zakat-amount-big / .zakat-formula /
//      .zakat-result-rows* / .zakat-state-badge* / .zakat-state-icon
//      rules remain as dead CSS (harmless, zero selectors match;
//      can be pruned in a future cleanup ticket).
//   Cache-busters: css/style.css v461→v462, js/app.js v744→v745
//   (JS was touched: _zakatRender resilience), sw v386→v387.
//
// ZAKAT-CALCULATOR-UI-CONTENT-UX-IMPROVEMENT-1 (follow-up 3, 2026-05-31):
//   User requested a new full-width "Download Zakat PDF" button below
//   the existing مسح/نسخ row in the breakdown section. Implementation:
//   1) HTML: new <button id="zakat-download-pdf" class="zakat-action-btn
//      zakat-action-btn--pdf"> + new svg <symbol id="i-download"> in the
//      icon sprite.
//   2) CSS: .zakat-action-btn--pdf { flex:1 1 100% (own row); background:
//      #e60023 Adobe-PDF red; color:#fff; font-weight:700 } + hover/focus
//      darker + dark-mode override.
//   3) JS: new _zakatDownloadPDF() function — opens a new tab with a
//      self-contained receipt HTML (A4 page, title, timestamp, breakdown
//      table cloned from live #zbt-* values, highlighted total row,
//      disclaimer, source URL footer); triggers window.print() so the
//      user picks "Save as PDF" in their browser print dialog. Includes
//      iframe fallback for popup-blocked scenarios. ZERO external
//      dependencies (no jsPDF / html2canvas) — native Arabic shaping
//      handled by the browser's built-in fonts.
//   4) i18n: new key `zakat.actions.download_pdf` ("تنزيل الزكاة PDF" /
//      "Download Zakat PDF") in AR + EN per-lang bundles + the
//      server-loaded js/i18n.js. Other 8 langs fall back via existing
//      _needsEnFallback chain.
//   5) server.js: _i18nVersion 187→188.
//   Cache-busters: css/style.css v462→v463, js/app.js v745→v746
//   (added _zakatDownloadPDF + binding), sw v387→v388.
//
// ZAKAT-CALCULATOR-I18N-EXPAND-8-LANGS-1 (2026-05-31):
//   Translated all 8 new/updated zakat keys to the other 8 langs
//   (bn/de/fr/tr/ur/id/es/ms) — previously these langs showed EN
//   fallback for: zakat.hero.title, zakat.hero.subtitle, zakat.actions
//   .download_pdf, zakat.empty.subtitle, zakat.compact_disclaimer.text,
//   zakat.edu.title, zakat.edu.intro, zakat.breadcrumb.label. Applied
//   via a one-shot idempotent Node script (scripts/_zakat_i18n_expand_8_langs.mjs)
//   that does 16 replacements (8 langs × 2 updated hero keys) + 48
//   insertions (8 langs × 6 new keys) = 64 atomic per-lang-file mutations.
//   server.js _i18nVersion bumped 188→189. Cache-buster: sw v388→v389.
//   No HTML / CSS / JS / route / data changes.
//
// MOON-DISC-ANIMATION-DISABLE-1 (2026-05-31):
//   Disabled ALL motion on the moon disc visual across moon pages
//   (/moon-today, /moon-today-in-{city}, /moon-in-{city},
//    /moon-in-{city}/{date}). Two CSS transitions removed at
//   css/style.css:2636 + 2639 (the .moon-svg filter transition + the
//   .moon-svg-lit `d` path-morph). Added a defensive `animation: none
//   !important; transition: none !important;` block scoped under
//   .moon-visual / .moon-svg / .moon-svg-lit / .moon-icon / .moon-disc
//   subtrees to win against any future motion-introducing code. The
//   prior @media (prefers-reduced-motion: reduce) rule was removed
//   because motion is now disabled for all users (became redundant).
//   Untouched: .moon-chart-container halo pulse (data-viz, separate
//   container), .moon-hero-icon (already static), moonHubCtaPulse,
//   moonEventPulse, pulse-btn, pulse-soft (all on unrelated UI).
//   CSS-only fix. Zero JS / HTML / data / route changes. Cache-
//   busters: css/style.css v463→v464, sw v389→v390.
//
// NEXT-PRAYER-COUNTDOWN-EXCLUDE-SUNRISE-FIX-1 (revised 2026-06-01):
//   Sunrise is a falaki marker, NOT a fard prayer. The "next prayer"
//   semantic must skip it across ALL UI surfaces: time-left countdown
//   hero, sticky-next-bar on every page, banner, CSL, hero, etc.
//   GLOBAL fix (single source of truth):
//     1) js/prayer-times.js:251 — PrayerTimes.getNextPrayer prayer list
//        changed from ['fajr','sunrise','dhuhr','asr','maghrib','isha']
//        to ['fajr','dhuhr','asr','maghrib','isha']. Mirrors the existing
//        policy already in getCurrentPrayer (line ~289) which also
//        excludes sunrise with comment "الشروق ليس صلاة مفروضة".
//     2) js/app.js:14077 — outer countdown loop's `prayers` array changed
//        from sunrise-inclusive to sunrise-exclusive, so `targetSeconds`
//        stays in lock-step with `next.key`.
//   The earlier (uncommitted) draft used a SCOPED local block inside the
//   time-left page guard; that block has been REMOVED in this revision
//   (now redundant — the outer fix handles all surfaces). The timeline
//   list (#tl-timeline) intentionally keeps sunrise as an informational
//   row, but the "now" marker uses outer `next` (sunrise-excluded) so
//   sunrise never gets highlighted.
//   PRESERVED:
//     - js/prayer-times.js sunrise time calculations (times.raw.sunrise)
//     - currentPrayerTimes.sunrise display in the prayer-times-in-{city}
//       table (uses raw data directly, not getNextPrayer)
//     - Adhan-trigger logic (separate prayerKeys list at app.js:14306+)
//   AFFECTED UI (all now correctly skip sunrise):
//     - Sticky next-prayer bar (#sticky-next-bar) on every page
//     - Time-left page hero (#tl-h1-prayer + #tl-countdown + #tl-seo)
//     - Time-left timeline "←" / "now" marker
//     - Banner / CSL / hero countdowns
//   Cache busters: js/app.js v746→v747, js/prayer-times.js v51→v52
//   (prayer-times.js was MODIFIED in this revision — global getNextPrayer
//   fix), sw v390→v391.
//
// NEXT-PRAYER-COUNTDOWN-EXCLUDE-SUNRISE-FIX-1-CDN-CACHE-BREAKER (2026-06-01):
//   POST-DEPLOY DISCOVERY: After pushing c309eea, production was still
//   serving OLD code for /js/app.js?v=747. Root cause: Render's CDN
//   caches static files with `Cache-Control: public, max-age=31536000,
//   immutable`. A request for ?v=747 made DURING the deploy (while the
//   underlying file on disk was still the PRE-fix content) caused the
//   CDN to cache the OLD response under that cache key — for a full
//   YEAR. Subsequent requests for ?v=747 keep getting the cached OLD
//   content even after the deploy completes and disk has NEW content.
//   Diagnosis evidence: fetching /js/app.js?fresh=NOW123abc (a NEVER-
//   USED query) returned the correct NEW content (4 OLD inclusive + 2
//   NEW excluded arrays = matches disk source), while /js/app.js?v=747
//   returned OLD content (5 OLD + 1 NEW = matches pre-fix source).
//   FIX: bump every cache-buster key that was used in commit c309eea
//   to a NEW value that has NEVER been requested:
//     - js/app.js v747 → v748
//     - js/prayer-times.js v52 → v53
//     - sw v391 → v392
//   No JS / data / route / SSR changes — only the cache-buster query
//   strings + this SW CACHE_VERSION bump (to force SW precache refresh).
//   Underlying NEXT-PRAYER-COUNTDOWN-EXCLUDE-SUNRISE-FIX-1 code from
//   commit c309eea is correct as-is on disk + git origin/main.
//   WORKFLOW LEARNING: Post-push verification must wait ≥5 minutes
//   after push before fetching ?v=N URLs, otherwise CDN may cache
//   the OLD pre-deploy response under the NEW cache-key.
//
// TASBIH-AUTO-MODE-NEXT-STEP-FIX-1 (2026-06-01):
//   User-reported regression: on /msbaha (electronic Tasbih), the auto
//   mode counter stopped at 33 and never advanced (was supposed to
//   cycle سبحان الله → الحمد لله → الله أكبر at 33 each). Root cause:
//   js/app.js line 2438 referenced `TASBIH_SEQUENCE` which no longer
//   exists — the code was refactored to use `getTasbihSequence()`
//   function (line ~2385) in commit e4b2779 (2026-05-12) but this
//   one reference was missed. Accessing .length on undefined threw a
//   silent TypeError inside the setTimeout callback at line 2431,
//   aborting tasbihNextStep() — leaving the button disabled (line
//   2428) forever at count=33.
//   Fix: 1-line change at line 2438:
//     OLD:  if (tasbihStep < TASBIH_SEQUENCE.length - 1) {
//     NEW:  if (tasbihStep < getTasbihSequence().length - 1) {
//   Matches the existing pattern at line 2474 inside
//   tasbihUpdateAutoUI which also uses getTasbihSequence(). No data /
//   markup / CSS / route / server change. Cache-busters: js/app.js
//   v748→v749, sw v392→v393.
//
// TASBIH-AUTO-MODE-NEXT-STEP-FIX-1-CDN-CACHE-BREAKER (2026-06-01): pure
//   cache-buster bump — NO logic change anywhere. Rationale: after the
//   push of 4953bf4 (the actual tasbih fix), the post-push verification
//   discovered that the production HTML on Render was still referencing
//   js/app.js?v=748 and the production sw.js still reported
//   CACHE_VERSION='v392'. As a side effect of that diagnostic, the
//   verification fetched /js/app.js?v=749 BEFORE the Render deploy had
//   actually rolled out, which means Cloudflare's edge CDN may have
//   cached the OLD pre-fix app.js content under the ?v=749 key for up
//   to a year (Cache-Control: public, max-age=31536000, immutable).
//   To bypass any such poisoning, this commit moves the cache-buster
//   to a fresh key that has never been requested: app.js v749→v750,
//   sw v393→v394. Files modified: index.html (2× cache-buster bumps)
//   + sw.js (this comment + the version literal). ZERO change to:
//   js/app.js, css/style.css, js/i18n.js, js/i18n/*.js,
//   js/prayer-times.js, server.js, routing, sitemap, data, i18n keys,
//   or tasbih logic. This is the exact same pattern as the earlier
//   d6ea488 NEXT-PRAYER-COUNTDOWN-EXCLUDE-SUNRISE-FIX-1-CDN-CACHE-
//   BREAKER, which had to be applied for the same root cause.
//   COMMITTED + DEPLOYED + VERIFIED as 5250d01 on 2026-06-01 — all 14
//   post-push checks passed (HTML only refs v=750; sw='v394'; bytes
//   contain getTasbihSequence().length × 1 and TASBIH_SEQUENCE.length × 0;
//   visual auto-mode 33-click test PASSED: سبحان الله → الحمد لله, count
//   reset to 0, button re-enabled). v749/v750/v394 are NOW LIVE keys on
//   production CDN — any subsequent commit MUST bump to fresh keys above.
//
// MSBAHA-SEO-CONTENT-UX-EXPANSION-1 (2026-06-01): SEO + UX expansion for
//   /msbaha. Added 6 educational sections (edu/howto/after/when/related/
//   disclaimer) + FAQ block (6 Q&A) below the existing tasbih tool —
//   tasbih JS LOGIC UNCHANGED (auto/free modes, 33-counter, reset buttons,
//   session totals all intact). New i18n keys (~50, AR+EN) in js/i18n.js
//   + js/i18n/{ar,en}.js — other 8 langs fall back to EN. New CSS in
//   css/style.css (.tasbih-edu/howto/after/when/related/faq* selectors
//   + dark-mode overrides). New tasbihFaq flag wired into /msbaha
//   staticPages entry → FAQPage + HowTo JSON-LD emit in server.js
//   (mirrors the zakatFaq pattern, single source of truth via i18n).
//   Cache-busters: css/style.css v464→v465, _i18nVersion 189→190.
//   (Originally drafted with sw v393→v394; rebased on top of
//   CDN-CACHE-BREAKER 5250d01 which already consumed v394.)
//
// MSBAHA-EVENTS-ECHO-1 (2026-06-01): follow-up addition to MSBAHA-SEO-CONTENT-
//   UX-EXPANSION-1. Added a clone of the /moon-today #moon-events-section
//   (Islamic events countdown — Ramadan / Eid al-Fitr / Eid al-Adha / Hijri
//   New Year) at the bottom of /msbaha, BELOW the FAQ section. Pattern
//   mirrors AZKAR-EVENTS-ECHO-1 at #page-azkar-morning: class-based selectors
//   only (no ID conflict with the original on /moon-today). Each card carries
//   BOTH the bare `.moon-event-{key}` class (provides the colored gradient
//   chrome via the rules at css/style.css:4374-4399) AND the
//   `.moon-event-{key}-card` (JS hook for _azkarRenderMoonEvents() in
//   js/app.js to populate days+date and reorder by proximity). js/app.js
//   change is a SINGLE LINE — appending 'page-tasbih' to the _azkarPageIds
//   array in _azkarRenderMoonEvents() so the rolling-cycle resolver
//   populates the day-counts + dates on this page too. Tasbih JS LOGIC
//   (tasbihClick/tasbihNextStep/tasbihSwitchMode/etc.) STILL UNCHANGED.
//   Cache-busters (post stash-pop reconciliation — v750/v394 are now
//   CDN-CACHE-BREAKER's live production keys and cannot be re-used):
//   js/app.js v750→v751, sw v394→v395. CSS unchanged (reuses existing
//   .moon-events-* / .moon-event-* rules).
//
// CITY-PRAYER-COUNTDOWN-CSS-CONTAIN-FIX-1 (2026-06-01): pure CSS
//   containment fix. The Lighthouse mobile audit on /en/prayer-times-in-
//   jeddah reported Performance=88 with Speed Index=12.8s while FCP=2.0s
//   / LCP=2.1s / TBT=50ms / CLS=0 — meaning above-fold paint was fast
//   but pixels remained "unsettled" deep into the capture window. The
//   audit (reports/en-city-prayer-lighthouse-speed-index-audit-1.md)
//   traced the root cause to two ticking elements that update every
//   second: #next-prayer-countdown (`.banner-big-countdown`) and
//   #current-time (`.banner-big-time`). Each tick changes pixels that
//   Lighthouse SI averages as "not yet final". The earlier PERF-LCP-1
//   added `contain: paint` on the countdown only, but `paint` alone
//   doesn't tell the browser that layout/style stays inside the box —
//   so SI calculations still considered the per-frame change as
//   page-wide instability. This commit widens the containment to
//   `layout style paint` on BOTH ticking elements + adds
//   `will-change: contents` as a compositor hint. Strict CSS-only —
//   ZERO change to: js/app.js (countdown loop logic), js/prayer-times.js
//   (calculations / madhab / method / timezone / Fajr / Isha angles),
//   server.js (routing / SSR / staticPages / JSON-LD), data, sitemap,
//   canonical, hreflang, i18n keys. Files modified: css/style.css (~20
//   lines of doc + 4 new declarations) + index.html (2× CSS cache-buster
//   bumps) + sw.js (this comment + version literal). Cache-busters:
//   css/style.css v465→v466, sw v395→v396. Expected impact: SI 12.8s →
//   ~3-5s, Performance 88 → ~94-96, LCP unchanged, CLS unchanged.
//
// QIBLA-CITY-SSR-INFO-GRID-PREFILL-FIX-1 (2026-06-01): server.js-only fix.
//   Lighthouse mobile audit on /qibla-in-riyadh reported Performance=72 with
//   LCP=2.9s + Speed Index=10.8s + Element render delay=16,650ms. Audit
//   (reports/qibla-city-pages-lighthouse-lcp-render-delay-audit-1.md) found
//   that #qibla-info-grid is the LCP element and its 4 cells (#qibla-city,
//   #qibla-exact-angle, #qibla-lat, #qibla-lng) held `--` placeholder in SSR
//   on ALL 6 audited /qibla-in-{city} pages (riyadh, jeddah, makkah, rabat
//   + EN variants — all 235-byte whitespace-only grid_inner_chars), even
//   though server.js already had `seo.qiblaRef.{cityName,lat,lng}` available.
//   Client js/app.js fills them only after hydration (~3-4s post-FCP on
//   mobile slow CPU). This commit injects the values into SSR HTML directly
//   via 4 html.replace calls inside the existing Q-A SEO block — using the
//   SAME bearing formula already computed for the SEO bearing-badge, but a
//   separate `_bearingExact` to 2 decimals to match the client's
//   `_qiblaAngle.toFixed(2)`. Lat/lng use `.toFixed(4)` + '°' suffix to
//   match `currentLat.toFixed(4)+'°'` at js/app.js:8321-8322. The client
//   will idempotently overwrite these cells after hydration with bit-for-bit
//   identical values (same formula, same precision).
//   Files modified: server.js (+~50 lines: 4 html.replace + doc) + sw.js
//   (this comment + version bump). ZERO change to: index.html, css/style.css,
//   js/app.js, js/qibla.js, js/prayer-times.js, data, sitemap, canonical,
//   hreflang, i18n keys. Qibla formula UNCHANGED. /qibla hub UNAFFECTED
//   (block is gated by seo.qiblaRef.slug — city pages only). Cache-busters:
//   sw v396→v397 (no CSS/JS changes — only HTML response changes via SSR).
//   Expected impact: LCP 2.9s → ~1.0-1.3s, Speed Index 10.8s → ~3-4s,
//   Element render delay 16,650ms → ~50-200ms, Performance 72 → ~92-96.
//
// CITY-PRAYER-NEXT-BANNER-CLS-FIX-1 (2026-06-01): pure CSS containment +
//   layout reservation fix. After CITY-PRAYER-COUNTDOWN-CSS-CONTAIN-FIX-1
//   (0240887) cut Speed Index from 12.8s → ~2.5s on /prayer-times-in-
//   riyadh mobile, Lighthouse reported a NEW CLS=0.121 with the layout-
//   shift culprit being div.next-prayer-banner + #next-prayer-countdown.
//   Root cause: SSR placeholders (`--`, `--:--:--`) are visually narrower
//   than their post-hydration values ("الرياض", "10:18:33 ص",
//   "01:23:45", "27 ذو القعدة 1447هـ"), and the mobile .banner-block
//   min-height reservations (96/132/96px from PT-CLS-1) under-cover the
//   actual hydrated height by ~15-20px. This caused vertical reflow in
//   the prayer + dates blocks when JS swapped in real values.
//
//   Strict CSS-only fix:
//     • +min-width: 8ch on .banner-big-countdown — locks horizontal slot
//       so "--:--:--" (non-tabular hyphens) and "01:23:45" (tabular digits)
//       render at identical width.
//     • +min-width: 11ch on .banner-big-time — covers "HH:MM:SS ص" (Ar)
//       and "HH:MM:SS AM" (En) full-width.
//     • Mobile .banner-block min-height 96→110px (time block safety).
//     • Mobile .banner-block-prayer min-height 132→156px (covers
//       label + name + countdown + optional then-prayer).
//     • Mobile .banner-block-dates min-height 96→124px (covers hijri
//       date wrap to 2 lines + greg date).
//
//   PRESERVED (NOT removed): contain: layout style paint + will-change:
//     contents on both .banner-big-countdown and .banner-big-time (from
//     CITY-PRAYER-COUNTDOWN-CSS-CONTAIN-FIX-1). The Speed Index improvement
//     is kept; CLS is reduced via reservation.
//
//   Files modified: css/style.css (+5 declarations + ~30 lines docs) +
//   index.html (2× CSS cache-buster) + sw.js (this comment + version).
//   ZERO change to: js/app.js (countdown loop, prayer logic, sunrise
//   exclusion), js/prayer-times.js (calculations, madhab, method, Fajr/
//   Isha angles, timezone), server.js, data, sitemap, canonical, hreflang,
//   i18n keys. Cache-busters: css/style.css v466→v467, sw v397→v398.
//   Expected impact: CLS 0.121 → ~0 (<0.02), Speed Index ≤2.5s preserved,
//   LCP ≤0.9s preserved, TBT ≤0ms preserved, Performance 89 → ~94+.
//
// EN-CITY-PRAYER-META-DESCRIPTION-LENGTH-FIX-1 (2026-06-01): SEO-only fix.
//   SEOptimer reported the EN meta description on /en/prayer-times-in-cairo
//   was 116 chars — under the standard 120-160 band. Root cause traced to
//   server.js _CITY_DESC_FORMS.en: the `long` form (current "See today's...")
//   exceeds 160 chars for any city name ≥ 5 chars, so the _pickCityDesc
//   selector falls through to `withCountry` (which was only 116 chars). This
//   commit rewrites the EN `withCountry` form with natural connectors
//   ("check today's", "plus") to land between 127 and 160 chars for typical
//   city+country combos (constant base = 122 chars). Other 9 langs (ar/fr/
//   tr/ur/de/id/es/bn/ms) UNTOUCHED — only EN was reported. Tests on
//   cairo/riyadh/jeddah/makkah/new-york/kuala-lumpur/jakarta all land in
//   the 130-150 range. Title, H1, prayer calculations, city data, canonical,
//   sitemap, hreflang, routing ALL UNCHANGED. Only the EN city-prayer meta
//   description text changes. Files modified: server.js (+~15 lines: new
//   wording + doc comment) + sw.js (this comment + version bump). HTML
//   response is Cache-Control: no-cache so users see new desc immediately
//   after deploy — no cache-buster needed on css/js (they didn't change).
//   sw v398→v399 for deploy traceability only.
//
// EN-QIBLA-CITY-SEO-DYNAMIC-LENGTH-FIX-1 (2026-06-01): SEO-only fix for
//   EN qibla city pages /en/qibla-in-{city}. SEOptimer reported Title=49
//   chars on /en/qibla-in-cairo (current Medium template "Qibla Direction
//   in Cairo | Accurate Kaaba Compass" = 49, falling 1 char below the
//   50-60 SEO band). Root cause: Cairo's short city name (5 chars) makes
//   Full=66 (>60) and Medium=49 (<50) — the existing 3-tier ladder (Full→
//   Medium→Short) has a gap. This commit adds a 4th tier "MediumPlus" for
//   EN-only that inserts "Today" after the city name, yielding 55 chars
//   for Cairo (Full=66, MediumPlus=55 ✅, Medium=49, Short=40). The
//   selector ladder is updated to try MediumPlus between Full and Medium.
//   Other 9 langs (ar/fr/tr/ur/de/id/es/bn/ms) reuse Medium as MediumPlus
//   — no behavior change for them. Also adds EN-only length-aware meta
//   description ladder: existing long form (151+city) overflows 160 for
//   cities ≥ 10 chars (Kuala Lumpur=163, Washington=161, Los Angeles=162)
//   — adds a Medium form (123+city+country) that fits 120-160 for typical
//   long-city combos. Selector tries long first; falls to medium if long
//   exceeds 160. Files modified: server.js (+~70 lines: 1 new template
//   map + selector tier + EN desc ladder + doc) + sw.js (this comment +
//   version bump). ZERO change to: H1, qibla calculation, Kaaba angle,
//   distance to Mecca, city coordinates, canonical, hreflang, sitemap,
//   routing, AR/8-lang behavior. Cache-busters: sw v399→v400 (HTML
//   response is no-cache → users see new title/desc immediately after
//   deploy without cache-buster bump on css/js).
//
// CANONICAL-PROD-ORIGIN-FIX-1 (2026-06-01): critical SEO infrastructure
//   fix. SEOptimer audit revealed that EVERY production page (12/12
//   audited: /, /en/, /prayer-times-in-riyadh, /en/qibla-in-makkah,
//   /moon-today, /hijri-calendar, /msbaha, /zakat-calculator, etc.)
//   was emitting canonical + og:url + hreflang as
//   `http://localhost:10000/<path>` instead of the production domain.
//   sitemap-main.xml (5.9 MB) contained 54,720 occurrences of
//   `localhost` across thousands of city URLs — every URL Google would
//   discover via sitemap was unreachable. Root cause: server.js line
//   1544 reads `process.env.SITE_URL` with a fallback to
//   `http://localhost:${PORT}` — but on Render SITE_URL was never
//   configured, and PORT=10000, so SITE_URL evaluated to
//   `http://localhost:10000` for ALL canonical/og/hreflang/sitemap
//   emission. Fix (Option C): defensive 3-tier fallback so any future
//   "forgot to set env var" doesn't regress: Tier 1 explicit SITE_URL,
//   Tier 2 RENDER_EXTERNAL_URL (auto-provided by Render), Tier 3
//   localhost (dev). Also recommend setting SITE_URL on Render
//   dashboard for full belt-and-suspenders coverage. Files modified:
//   server.js (~20 lines: 1 fallback chain + doc) + sw.js (this
//   comment + version bump). ZERO change to: page content, prayer/
//   qibla calculations, city data, routing, sitemap structure (only
//   the origin in <loc> entries changes — localhost → real domain).
//   Cache-busters: sw v400→v401 (HTML + sitemap are no-cache → users
//   and Google see correct URLs immediately after deploy).
//
// AR-QIBLA-CITY-SEO-DYNAMIC-TITLE-LENGTH-FIX-1 (2026-06-01): AR-only SEO
//   fix mirroring EN-QIBLA-CITY-SEO-DYNAMIC-LENGTH-FIX-1's MediumPlus
//   pattern. Audit of /qibla-in-* AR pages found 9/10 cities in the
//   [50, 60] title band except `/qibla-in-makkah` ("مكة المكرمة" =
//   11-char AR city name → Full template overflows 60 → fallback to
//   Medium = 47 chars, below the 50 floor). The fix activates the AR
//   slot of `_qTitlesMediumPlus` (which was previously aliased to
//   Medium) with: "اتجاه القبلة في {City} اليوم | بوصلة الكعبة بدقة"
//   (42+city chars). For Makkah this yields 53 chars ✅. For shorter
//   AR cities (Cairo=7, Riyadh=6, etc.) the existing Full tier still
//   wins (50+city in [50, 60]) — MediumPlus is only selected when
//   Full > 60. Other 9 langs UNCHANGED. AR Meta Description, H1, JSON-LD,
//   canonical, hreflang, sitemap, routing, Qibla calculation, city
//   data UNCHANGED. EN/FR/TR/UR/DE/ID/ES/BN/MS qibla city pages
//   UNCHANGED. /qibla hub UNAFFECTED (gated by seo.qiblaRef.slug).
//   Files: server.js (1-line value change + ~15 lines doc) + sw.js
//   (this comment + version bump v401→v402). HTML is no-cache so users
//   see new Makkah AR title immediately after deploy.
//
// EN-QIBLA-CITY-DESKTOP-LCP-RENDER-DELAY-FIX-1 (2026-06-01): performance
//   fix for `/qibla-in-{city}` pages (all 10 langs). Audit found that
//   #qibla-info-grid (the SSR-prefilled 4-card grid from
//   9cc340a/QIBLA-CITY-SSR-INFO-GRID-PREFILL-FIX-1) was the LCP element
//   on Lighthouse Desktop with `Element render delay = 6,900ms` and
//   `Speed Index = 4.6s` — even though the grid VALUES were in HTML
//   from byte 0. Root cause: server.js was emitting
//   `<div id="page-qibla" data-qibla-mode="hub">` for City pages, then
//   the CSS rule `#page-qibla[data-qibla-mode="hub"] .qibla-city-only
//   { display: none !important; }` (style.css:15764) suppressed the
//   grid (and all .qibla-city-only descendants) until app.js:16558
//   ran initQiblaForCity() and flipped the attribute to "city" ~6.9s
//   later. Fix: on `/{lang}?/qibla-in-{slug}[-lat-lng]` routes, SSR
//   now emits `data-qibla-mode="city"` upfront — grid visible from
//   Frame #1, JS attribute set becomes a same-value no-op. /qibla
//   hub pages UNAFFECTED (regex precludes them). ZERO change to:
//   CSS, JS, i18n, qibla math, city data, canonical, hreflang,
//   sitemap, routing, title, meta, H1, JSON-LD, SSR prefill values,
//   Hub mode behaviour. Expected impact: Element render delay 6,900ms
//   → ~50ms, Speed Index 4.6s → ~2s, Performance 86 → 94+. Files:
//   server.js (single regex-test + one html.replace + ~20 lines doc)
//   + sw.js (this comment + version bump v402→v403).
//
// MOON-TODAY-KEYWORD-CONSISTENCY-FIX-1 (2026-06-01): SEO Keyword
//   Consistency fix for /moon-today (Arabic hub). SEOptimer audit
//   flagged the hub's keyword distribution as polluted — the page
//   was indexing 114 H2 tags, 63 occurrences of "الصلاة", 17 of
//   "مواقيت الصلاة", 45 of "بعد", 12 of "يومًا", 92 of "الهجري" —
//   even though the actual moon section uses only ~9 of those H2s
//   and the noise words are not relevant to "حالة القمر اليوم"
//   intent. Root cause: the SPA shell ships every tool's page wrapper
//   <div class="page" id="page-..."> in the same HTML — 12 inactive
//   wrappers (page-qibla, page-zakat, page-azkar-{hub,morning,evening,
//   prayer}, page-tasbih, page-hijri-{today,day,year,month}, page-
//   date-converter) were leaking their full educational content into
//   the moon hub's textContent. Crawlers like SEOptimer read text
//   regardless of `.page { display:none }`, so all the leaked
//   headings + keywords counted. Fix: extend `_MOON_HUB_STRIP_IDS`
//   with the 12 wrappers — same proven pattern as `_HCAL_HUB_STRIP_IDS`
//   which solved the identical leak on /hijri-calendar (HCAL-1). The
//   active #page-moon content is untouched. Expected: H2 114→~15,
//   H3 30→~5, "الصلاة" 63→~5, "مواقيت الصلاة" 17→~2, "بعد" 45→~15,
//   "يومًا" 12→~3 — core moon terms (القمر, حالة القمر, طور القمر,
//   شروق, غروب, إضاءة, عمر) PRESERVED. ZERO change to: Title,
//   Meta Description, H1, moon calculations, hijri data, prayer
//   times, qibla math, canonical, hreflang, sitemap, routing,
//   JSON-LD, CSS, app.js, i18n, curated cities. Files: server.js
//   (+12 IDs in _MOON_HUB_STRIP_IDS + doc) + sw.js (this comment +
//   version bump v403→v404). HTML is no-cache so SEOptimer sees the
//   clean output immediately after deploy.
//
// EN-MOON-TODAY-CITY-KEYWORD-CONSISTENCY-FIX-1 (2026-06-01): same
//   SPA-shell-leak cleanup, but for `/moon-today-in-{slug}` and
//   `/moon-in-{slug}` city pages across all 10 langs (the Hub fix
//   above only covered `/moon-today`). Audit EN-MOON-TODAY-CITY-
//   KEYWORD-CONSISTENCY-AUDIT-1 measured 117 H2 / 36 H3 on
//   /en/moon-today-in-jeddah (and identical counts on Riyadh, Mecca,
//   Cairo, New York, Kuala Lumpur + AR /moon-today-in-jeddah) with
//   Hijri=82, zakat=37, tasbih=27, prayer=29, days=37, azkar=12 —
//   all leaked from the same 12 inactive wrappers because city
//   pages used the narrower `_stripPagePrayerTimesOnly` helper
//   (only removed page-prayer-times). Fix: new helper
//   `_stripHtmlForMoonCity` with `_MOON_CITY_STRIP_IDS` (the 1
//   prayer-times entry + the same 12 wrappers as the Hub fix), and
//   the city-pages branch at server.js:15971 now calls it instead.
//   moon-chart-section / moon-forecast / moon-faq-city / moon-
//   evergreen / moon-events-section: ALL PRESERVED — those are the
//   actual moon educational content the city pages need. Title
//   (T=50-56), Meta (D=141-148), H1 ("Moon Today in {City}" / "حالة
//   القمر اليوم في {city}"), JSON-LD: UNCHANGED. Moon math, Hijri
//   data, prayer-times, qibla math, canonical, hreflang, sitemap,
//   routing, CSS, app.js, i18n, curated cities: ZERO change.
//   Expected impact: H2 117→~12-15, H3 36→~5-8, Hijri 82→~5,
//   prayer 29→~1, tasbih 27→~0, zakat 37→~0, days 37→~10 —
//   core moon terms (moon, Moon, moon today, moon phase, moonrise,
//   moonset, moon illumination, moon age) PRESERVED. Files:
//   server.js (+~55 — new helper + IDs + replaced call site + doc)
//   + sw.js (this comment + version bump v404→v405). One fix
//   benefits ~2,000 city pages (10 langs × ~200 cities).
const CACHE_VERSION = 'v405';
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
