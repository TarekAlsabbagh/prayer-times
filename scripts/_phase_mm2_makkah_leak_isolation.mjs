// Phase MM2 — Makkah/English city-name leak isolation in __POPULAR_CITY_NAMES__.
//
// Audit findings on /moon-in-makkah/2026-06 (AR):
//   • Total "Makkah"/"Mecca" occurrences in HTML: 4 + 1 = 5
//   • Distribution:
//     - ZERO in alt / aria-label / title / data-* attributes ✅
//     - ZERO in visible element text ✅
//     - ALL 5 inside the inline <script id="ssr-popular-city-names">
//       which dumps the FULL POPULAR_CITY_NAMES table (~80 cities × 10 langs)
//       on every page regardless of the page language.
//   • SEOptimer reads <script> contents as text and counts "Makkah" / "Mecca"
//     as English words appearing on the AR page → "language confusion" flag.
//
// Per user spec (Part 1):
//   "في الصفحة العربية لا يجب أن يظهر makkah داخل النصوص التي يقرأها
//    SEOptimer، إلا في URL فقط."
//   → Eliminate English city names from AR page HTML except inside URLs.
//
// Solution:
//   Slim the inline script to inject ONLY `{ar, [pageLang]}` per city instead
//   of the full 10-lang × 80-city dump.
//
//   • AR page:   {mecca: {ar: "مكة المكرمة"},                ...}        ← no EN at all
//   • EN page:   {mecca: {ar: "مكة المكرمة", en: "Mecca"},   ...}        ← AR + EN
//   • FR page:   {mecca: {ar: "مكة المكرمة", fr: "La Mecque"}, ...}      ← AR + FR
//   • Other:     {mecca: {ar: "مكة المكرمة", [lang]: "..."},   ...}
//
//   Why ALWAYS include `ar`:
//   js/app.js line 12451 has a hard-coded `_resolveCityNameClient(slug, 'ar', ...)`
//   call (regardless of page lang) for the FAMOUS_MOON_CITIES nearest-city
//   resolver. So AR must always be present.
//
//   The existing fallback `pop[s].en` in _resolveCityNameClient becomes
//   undefined on non-EN pages — but that's fine because the next fallback
//   tier (LOCAL_CITIES) covers it, and POPULAR_CITY_NAMES has all 10 langs
//   filled (so [lang] never returns falsy in practice).
//
// Side-benefits:
//   • Inline script size reduced ~5× (was: 10 langs × 80 cities = ~800 strings;
//     now: 1-2 langs × 80 cities = ~80-160 strings)
//   • Faster initial paint (smaller HTML to parse)
//
// What's NOT touched:
//   • URLs (`/moon-in-makkah/...`) — intentional, must stay English-slug
//   • _resolveCityNameClient() function logic — backward-compatible
//   • POPULAR_CITY_NAMES source data on the server — unchanged
//   • All other pages / non-script HTML — unchanged

import { readFileSync, writeFileSync } from 'node:fs';

const SRV_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';
let raw = readFileSync(SRV_PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);
const EOL = isCRLF ? '\r\n' : '\n';

if (/Phase MM2 \(2026-05-03\)/.test(raw)) {
    throw new Error('[server.js] MM2 already applied (header marker present)');
}

function lfToEol(s) { return isCRLF ? s.replace(/\r?\n/g, '\r\n') : s; }

function replaceOnce(label, oldStr, newStr) {
    const oldNorm = lfToEol(oldStr);
    const newNorm = lfToEol(newStr);
    const cnt = raw.split(oldNorm).length - 1;
    if (cnt !== 1) throw new Error(`[${label}] expected 1 anchor match, got ${cnt}`);
    raw = raw.replace(oldNorm, newNorm);
    console.log(`✓ ${label}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// Replace the full-dump inject with a per-page-lang slim inject.
// ═══════════════════════════════════════════════════════════════════════════
const MM2_OLD = `    // Expose the server's authoritative city-name table to the client so the
    // Qibla page (and any other client renderer) can render localized city
    // names without guessing via Title-cased slugs. Mirrors _resolveCityName
    // behaviour for POPULAR_CITY_NAMES keys. Long-tail cities fall back to
    // LOCAL_CITIES (client-side) or to the slug.
    parts.push(\`<script id="ssr-popular-city-names">window.__POPULAR_CITY_NAMES__=\${JSON.stringify(POPULAR_CITY_NAMES)};</script>\`);`;

const MM2_NEW = `    // Phase MM2 (2026-05-03): SLIM inject — was a full 10-lang × 80-city dump
    // that leaked English city names ("Mecca", "Makkah", "Riyadh"...) into
    // the AR page HTML, where SEOptimer counts them as cross-lang text noise.
    // Now we inject ONLY {ar, [pageLang]} per city — AR is always included
    // because js/app.js line ~12451 calls _resolveCityNameClient(slug, 'ar', ...)
    // explicitly (for FAMOUS_MOON_CITIES nearest-city resolver), regardless
    // of page lang. The fallback chain in _resolveCityNameClient remains
    // backward-compatible: pop[s][lang] resolves; pop[s].en may be undefined
    // on non-EN pages but LOCAL_CITIES + slug fallback covers it.
    const _ssrLangPCN = seo.lang || 'en';
    const _slimPCN = {};
    for (const _slug in POPULAR_CITY_NAMES) {
        const _city = POPULAR_CITY_NAMES[_slug];
        if (!_city) continue;
        const _slim = { ar: _city.ar };
        if (_ssrLangPCN !== 'ar') {
            _slim[_ssrLangPCN] = _city[_ssrLangPCN] || _city.en;
        }
        _slimPCN[_slug] = _slim;
    }
    parts.push(\`<script id="ssr-popular-city-names">window.__POPULAR_CITY_NAMES__=\${JSON.stringify(_slimPCN)};</script>\`);`;

replaceOnce('MM2 — slim __POPULAR_CITY_NAMES__ inject (per-lang only)', MM2_OLD, MM2_NEW);

writeFileSync(SRV_PATH, raw);

console.log('\n✅ Phase MM2 — Makkah leak isolation complete.');
console.log('\nChanges applied (server.js):');
console.log('  • Inline ssr-popular-city-names script: full dump → slim per-lang');
console.log('  • AR pages: only {ar} per city — NO English city names anywhere');
console.log('  • Non-AR pages: {ar, [pageLang]} per city — minimal cross-lang surface');
console.log('  • Always includes AR (line 12451 hardcoded consumer)');
console.log('\nExpected reduction on /moon-in-makkah/2026-06 (AR):');
console.log('  • "Makkah" non-URL occurrences: 4 → 0');
console.log('  • "Mecca" non-URL occurrences: 1 → 0');
console.log('  • Inline script size: ~5× smaller');
console.log('\nNo change to: client function logic, URL slugs, alt/aria/title attrs.');
