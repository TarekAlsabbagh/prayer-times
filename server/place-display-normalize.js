'use strict';
/* =============================================================================
 * server/place-display-normalize.js
 * PALESTINE-DISPLAY-NORMALIZATION-FIX-1
 *
 * Central, pure DISPLAY normalizer: any place whose country code resolves to
 * Israel (`il`) must be SHOWN to the user as Palestine — country name, flag and
 * the display country code — across every search surface and before persistence.
 *
 * Strictly display + storage-label only. It NEVER touches lat / lng / timezone
 * or anything used for the prayer-time calculation. The forbidden user-facing
 * strings are ONLY: Israel / إسرائيل / 🇮🇱 (and the `il` code as a shown label).
 *
 *   il  →  ps  +  "فلسطين / Palestine / Filistin / …"  +  🇵🇸
 *   ps  →  (cc/flag unchanged)  +  the SAME clean Palestine name (so an
 *          il-normalized result and a native-ps result read identically, and
 *          the 8 non-AR/EN langs stop falling back to Intl's long
 *          "Palestinian Territories" form).
 *
 * No network, no mutation of geo/calc fields — synchronous helpers only.
 * The browser ships an identical map in js/app.js (getDisplayCountry guard +
 * updateCityCountryInfo) for direct visits that never hit /api/search-place.
 * ============================================================================= */

// User-approved display names (PALESTINE-DISPLAY-NORMALIZATION-AUDIT-1 §12), per lang.
const PALESTINE_DISPLAY = {
    ar: 'فلسطين', en: 'Palestine', fr: 'Palestine', tr: 'Filistin', ur: 'فلسطین',
    de: 'Palästina', id: 'Palestina', es: 'Palestina', bn: 'ফিলিস্তিন', ms: 'Palestin'
};
const PALESTINE_FLAG = '🇵🇸';

function isIsraelCc(cc) {
    return String(cc || '').trim().toLowerCase() === 'il';
}

// Display country code: il → ps; everything else passes through unchanged.
function normalizeCcForDisplay(cc) {
    return isIsraelCc(cc) ? 'ps' : cc;
}

function palestineName(lang) {
    const l = String(lang || 'en').toLowerCase();
    return PALESTINE_DISPLAY[l] || PALESTINE_DISPLAY.en;
}

// Regional-indicator flag emoji from a 2-letter code (server already has one,
// but we keep a tiny local copy so this module is self-contained/testable).
function ccToFlag(cc) {
    const code = String(cc || '').trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(code)) return '';
    return code.split('').map(ch => String.fromCodePoint(127397 + ch.charCodeAt(0))).join('');
}

// Normalize a /api/search-place RESULT object in place (curated / external /
// discovered all share this contract shape). Returns the same object.
//   - il → countryCode:'ps', countryName:Palestine[lang], countryFlag:'🇵🇸'
//   - ps → countryName forced to the clean Palestine[lang] (cc/flag already ps)
function normalizeResultDisplay(r, lang) {
    if (!r || typeof r !== 'object') return r;
    const cc = String(r.countryCode || '').trim().toLowerCase();
    if (cc === 'il') {
        r.countryCode = 'ps';
        r.countryName = palestineName(lang);
        r.countryFlag = PALESTINE_FLAG;
    } else if (cc === 'ps') {
        r.countryName = palestineName(lang);
        if (!r.countryFlag) r.countryFlag = PALESTINE_FLAG;
    }
    return r;
}

// Normalize an incoming /api/place-selected payload BEFORE it is persisted to
// Supabase, so the store never accumulates an `il` identity. Display/label only:
// country_code + admin.country are remapped; lat/lng/timezone/names stay intact.
function normalizeStorePayload(p) {
    if (!p || typeof p !== 'object') return p;
    if (isIsraelCc(p.countryCode)) {
        p.countryCode = 'ps';
        // Replace any stored Israel country label with the full Palestine map so
        // future reads (even if admin.country wins) never surface "Israel".
        const admin = (p.admin && typeof p.admin === 'object') ? p.admin : {};
        admin.country = Object.assign({}, PALESTINE_DISPLAY);
        p.admin = admin;
    }
    return p;
}

module.exports = {
    PALESTINE_DISPLAY, PALESTINE_FLAG,
    isIsraelCc, normalizeCcForDisplay, palestineName, ccToFlag,
    normalizeResultDisplay, normalizeStorePayload
};
