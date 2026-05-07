// Phase E5-a2 — Critical CSS Hybrid extraction.
//
// After E5-a externalized the 280 KiB style.css, Lighthouse Mobile still
// reported FCP 4.4s / LCP 5.1s / Speed Index 7-22s because the external
// stylesheet is now the render-blocking critical path: browser cannot
// paint anything until /css/style.css?v=244 downloads + parses.
//
// Fix: build a tiny critical.css (~15-20 KiB) that contains JUST the
// rules needed to paint above-the-fold content correctly on moon city
// pages. Inline it at the top of <head>. Browser paints from the
// critical CSS immediately, then the external style.css loads in
// parallel and overrides/completes everything else.
//
// Strategy: extract by SELECTOR WHITELIST from existing style.css
// (instead of writing critical.css by hand which is error-prone). The
// whitelist matches selectors I know are above-the-fold based on the
// E2/E4 work done in this session.
//
// Hybrid pattern:
//   <head>
//     <style id="critical-css">/* extracted ~15 KiB */</style>
//     <link rel="stylesheet" href="/css/style.css?v=244">  ← cached, full
//   </head>

import { readFileSync, writeFileSync } from 'node:fs';

const SRC = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\css\\style.css';
const OUT = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\css\\critical.css';

const css = readFileSync(SRC, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// CRITICAL SELECTOR WHITELIST
// Patterns are tested case-insensitively against the SELECTOR PART of each
// CSS rule. If ANY pattern matches the rule's selector, the rule is included.
// ─────────────────────────────────────────────────────────────────────────────
const CRITICAL_PATTERNS = [
    // CSS variables (root + dark theme) — required for any var() to resolve
    /^:root$/,
    /^html\[data-theme="dark"\]$/,
    /^html\[data-theme="dark"\]\s+body$/,

    // Universal reset + base only
    /^\*$/,
    /^\*::before$/,
    /^\*::after$/,
    /^html$/,
    /^body$/,

    // Page visibility (every route gate at top of style.css — TINY rules)
    /^\.page$/,
    /^\.page\.active$/,
    /^html\.qibla-page-loading\s/,
    /^html\.msbaha-page\s/,
    /^html\.date-converter-page\s/,
    /^html\.hijri-(year|month|today|day)-page\s/,

    // HCal-A2 (2026-05-05): #page-hijri-{year|month|today|day}-scoped
    // reservations that survive the JS html-class-removal sequence
    // (app.js:2987/2999/3011 etc remove the html.hijri-*-page class
    // after activation, which would un-apply html-class-based reservations
    // and cause collapse-shift). The #page-hijri-* selector persists.
    /^#page-hijri-(year|month|today|day)(\s|$)/,

    // Countdown-A (2026-05-05): same robustness rationale for countdown pages.
    // Selectors target page IDs directly so child reservations don't depend
    // on html.countdown-page being present.
    /^#page-(ramadan|eid-al-fitr|eid-al-adha|hijri-new-year)-countdown(\s|$)/,
    /^html\.countdown-page\.countdown-(ramadan|eid-al-fitr|eid-al-adha|hijri-new-year)\s/,

    // PT-A (2026-05-05): #page-prayer-times-scoped reservations.
    // Phase reverted as no-op — see style.css PT-A comment block.
    // Whitelist pattern kept in case a future PT-A-followup needs it.
    /^#page-prayer-times(\s|$)/,

    // Moon-A (2026-05-06): #page-moon-scoped reservation for the
    // .moon-summary-line (the actual source of the 0.121 shift —
    // chips wrap from 1 to 2 lines when JS fills "—" placeholders).
    // Tight pattern to avoid pulling 16KB of unrelated moon styling
    // into critical.css.
    /^#page-moon\s+\.moon-summary-line$/,

    // Home-CLS-Fix (2026-05-06): homepage bottom-section reservations to
    // stabilize layout for arab-countries-section + home-footer-links
    // (user-reported CLS culprits at 0.550 + 0.061).
    /^#arab-countries-section$/,
    /^#home-footer-links$/,
    // Home-CLS-Fix v3: also lock #location-hero to absorb font-swap
    // delta — when Cairo loads on cold cache, location-hero grows by
    // ~10px, which pushes the sections below it down. Reservation
    // prevents the growth → no shift attributable to the bottom
    // sections.
    /^#location-hero$/,
    /^#location-hero:not\(\.loc-hero-collapsed\)$/,
    // Home-CLS-Fix v3-c: lock .loc-hero-search-wrap (input wrapper inside
    // hero) — search input grows by 10px on Cairo load (placeholder text
    // line-height differs). Without inlining, the rule lands AFTER the
    // first paint window Lighthouse measures CLS in.
    /^\.loc-hero-search-wrap$/,
    // Home-CLS-Fix v3-d: hero title + subtitle inside #location-hero.
    /^#loc-hero-title$/,
    /^#loc-hero-subtitle$/,
    // Home-CLS-Fix v3-b: cookie-consent banner also grows on font swap.
    /^\.cookie-consent$/,
    // Home-Cards (2026-05-06): "Why use this site" 4-card section. All
    // selectors at the section level + cards + grid + responsive variants.
    /^\.home-why-section/,
    /^\.home-why-grid/,
    /^\.home-why-card/,
    /^\.home-why-icon$/,
    /^\.home-why-intro$/,
    /^html\[data-theme="dark"\]\s+\.home-why/,
    // Phase HC-2.3+2.4: popular-cities intro + 4-card services.
    /^\.home-popular-cities-intro$/,
    /^\.home-section-intro/,
    /^\.home-services-cards$/,
    /^\.home-service-card/,
    /^\.home-service-icon$/,
    /^\.home-service-body$/,
    /^\.home-service-title$/,
    /^\.home-service-desc$/,
    /^html\[data-theme="dark"\]\s+\.home-service/,
    /^html\.home-page\s/,
    /^html\.moon-(today-hub|today-city|hub|date|month)-page\s/,
    /^html\.countdown-page\s/,
    /^\.hub-only$/,
    /^\.u-hidden$/,

    // E5-a3: Above-the-fold layout primitives (added to fix sidebar pushing
    // content 1953px down + body styling + section-card shell rendering)
    /^\.app-layout$/,
    /^\.sidebar$/,
    /^\.sidebar\.open$/,
    /^\.sidebar-overlay$/,
    /^\.sidebar-overlay\.open$/,
    /^\.sidebar-header$/,
    /^\.sidebar-logo$/,
    /^\.menu-toggle$/,
    /^\.header-actions$/,
    /^\.lang-switcher$/,
    /^\.location-info$/,
    /^\.section-card$/,
    /^main$/,
    /^\.main-content$/,

    // Header dates (Phase E4-final-A min-height)
    /^#country-name$/,
    /^#sidebar-greg-date$/,
    /^#sidebar-hijri-date$/,

    // E4 reservations + parity (critical — must apply on first paint to prevent CLS)
    /^#moon-upcoming-timeline$/,
    /^#moon-comparison$/,
    /^#moon-forecast$/,
    /^#moon-city-answer$/,
    /^#moon-main-card$/,
    /^#moon-hijri-date$/,
    /^#moon-hijri-greg$/,
    /^#moon-hijri-lunar$/,
    /^#moon-distance\.value$/,
    /^#moon-distance-sub\.value-sub$/,
    /^a\.fc-hijri-link$/,

    // Theme transition guard
    /^\.theme-no-transition\s/,
];

// Helper: test if a selector matches any critical pattern
function isCritical(selector) {
    // Normalize: trim, lowercase for matching
    const sel = selector.trim();
    for (const p of CRITICAL_PATTERNS) {
        if (p.test(sel)) return true;
    }
    return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS PARSER (simple but enough for our minified-or-formatted style.css):
// Walks rules at the top level and inside @media. For each rule, splits
// the selector list, checks if ANY part matches a critical pattern, and
// if so, emits the entire rule unmodified.
// ─────────────────────────────────────────────────────────────────────────────

function extractCritical(input) {
    const out = [];
    let i = 0;
    const len = input.length;

    while (i < len) {
        // Skip whitespace + line comments
        while (i < len && /\s/.test(input[i])) i++;
        if (i >= len) break;

        // Block comment? Skip silently.
        if (input.slice(i, i + 2) === '/*') {
            const endC = input.indexOf('*/', i + 2);
            if (endC < 0) break;
            i = endC + 2;
            continue;
        }

        // @media (or @supports / @keyframes — handle generically)
        if (input[i] === '@') {
            const atStart = i;
            // Find the matching '{'
            const braceOpen = input.indexOf('{', i);
            if (braceOpen < 0) break;
            const atRule = input.slice(atStart, braceOpen).trim();
            // Find matching closing brace (track nesting)
            let depth = 1;
            let j = braceOpen + 1;
            while (j < len && depth > 0) {
                if (input[j] === '{') depth++;
                else if (input[j] === '}') depth--;
                if (depth > 0) j++;
            }
            if (depth !== 0) break;
            const blockBody = input.slice(braceOpen + 1, j);

            // For @media: recursively extract critical rules from body
            if (/^@media\b/.test(atRule)) {
                const innerCritical = extractCritical(blockBody);
                if (innerCritical.trim()) {
                    out.push(`${atRule}{${innerCritical}}`);
                }
            }
            // Skip @keyframes / @font-face / @supports — they're not critical
            // for first paint. The external style.css will load them shortly.
            // Else skip (e.g., @import, @charset etc. — leave to external CSS).
            i = j + 1;
            continue;
        }

        // Normal rule: read selector list until '{'
        const braceOpen = input.indexOf('{', i);
        if (braceOpen < 0) break;
        const selectorList = input.slice(i, braceOpen).trim();
        // Find matching closing '}' (no nesting expected in normal rules)
        let depth = 1;
        let j = braceOpen + 1;
        while (j < len && depth > 0) {
            if (input[j] === '{') depth++;
            else if (input[j] === '}') depth--;
            if (depth > 0) j++;
        }
        if (depth !== 0) break;
        const ruleBody = input.slice(braceOpen + 1, j);

        // Check if ANY selector in the comma-separated list matches a critical pattern
        const selectors = selectorList.split(',').map(s => s.trim());
        const anyCritical = selectors.some(isCritical);

        if (anyCritical) {
            // Filter selectors to only the critical ones (drop non-critical to keep size small)
            const keptSelectors = selectors.filter(isCritical);
            out.push(`${keptSelectors.join(',')}{${ruleBody}}`);
        }
        i = j + 1;
    }

    return out.join('\n');
}

const critical = extractCritical(css);
const sizeKiB = Math.round(critical.length / 1024 * 10) / 10;

// Wrap with header comment
const HEADER = `/* ═══════════════════════════════════════════════════════════════════════════
   Phase E5-a2 — Critical CSS Hybrid (auto-extracted from style.css)
   ═══════════════════════════════════════════════════════════════════════════
   Extracted on: ${new Date().toISOString()}
   Source: css/style.css (full ${Math.round(css.length / 1024)} KiB)
   Critical: ${sizeKiB} KiB

   This file is INLINED into <head> by server.js. The full style.css continues
   to load externally as a cached request — overrides any critical rule and
   covers all non-critical (below-the-fold) styling.

   To regenerate after editing style.css:
     node scripts/_phase_e5_a2_critical_css.mjs

   The extraction whitelist is in the script. To add a selector to critical,
   add a regex pattern there and re-run.
   ═══════════════════════════════════════════════════════════════════════════ */

`;

writeFileSync(OUT, HEADER + critical);
console.log(`✅ Critical CSS extracted: ${sizeKiB} KiB → ${OUT}`);
console.log(`   Source: ${Math.round(css.length / 1024)} KiB`);
console.log(`   Reduction: ${Math.round((1 - critical.length / css.length) * 100)}%`);
