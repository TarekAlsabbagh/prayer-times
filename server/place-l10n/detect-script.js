// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL-PLACE-SEARCH-L10N-SCRIPT-FALLBACK-1 (2026-05-13) — Script detection
// ═══════════════════════════════════════════════════════════════════════════
// Utility: classify a string by writing system. Used by `index.js` to:
//   * reject raw non-Arabic non-Latin names from the AR displayName path
//   * pick a romanized source for transliteration when a CJK / Korean /
//     Cyrillic / etc. name has no `name:ar` namedetail
//
// Unicode ranges (BMP only — surrogate-pair scripts not currently needed):
//   Arabic       U+0600 .. U+06FF (plus presentation forms FB50-FDFF, FE70-FEFF)
//   Han (CJK)    U+4E00 .. U+9FFF   — shared CN + JP + KR
//   Japanese kana U+3040 .. U+30FF  — Hiragana + Katakana (JP only)
//   Korean Hangul U+AC00 .. U+D7AF
//   Cyrillic     U+0400 .. U+04FF
//   Devanagari   U+0900 .. U+097F  — Hindi etc.
//   Bengali      U+0980 .. U+09FF
//   Thai         U+0E00 .. U+0E7F
//   Greek        U+0370 .. U+03FF
//   Hebrew       U+0590 .. U+05FF
//   Latin        U+0041..U+005A, U+0061..U+007A (basic ASCII; extended Latin
//                with diacritics collapses to A-Z after NFD-strip).

'use strict';

function detectScript(value) {
    const s = String(value || '');
    if (!s) return 'empty';
    if (/[؀-ۿﭐ-﷿ﹰ-﻿]/.test(s)) return 'arabic';
    if (/[぀-ヿ]/.test(s)) return 'japanese';      // Kana → JP-specific
    if (/[가-힯]/.test(s)) return 'korean';
    if (/[一-鿿]/.test(s)) return 'han';           // CJK Unified — shared
    if (/[Ѐ-ӿ]/.test(s)) return 'cyrillic';
    if (/[ऀ-ॿ]/.test(s)) return 'devanagari';
    if (/[ঀ-৿]/.test(s)) return 'bengali';
    if (/[฀-๿]/.test(s)) return 'thai';
    if (/[Ͱ-Ͽ]/.test(s)) return 'greek';
    if (/[֐-׿]/.test(s)) return 'hebrew';
    if (/[A-Za-z]/.test(s))         return 'latin';
    return 'unknown';
}

// True if a string is safe to display in an Arabic UI without further
// transliteration (Arabic script, or pure digits/punctuation).
function isArabicSafe(value) {
    const script = detectScript(value);
    return script === 'arabic' || script === 'unknown' || script === 'empty';
}

// True if a string is a viable Latin source for generic AR transliteration.
function isLatin(value) {
    return detectScript(value) === 'latin';
}

// True if a string contains characters from a non-Arabic, non-Latin script
// (CJK, Hangul, Cyrillic, Devanagari, etc.). These MUST NOT surface as
// displayName in Arabic UI.
function isNonLatinNonArabic(value) {
    const script = detectScript(value);
    return script === 'japanese' || script === 'korean' || script === 'han'
        || script === 'cyrillic' || script === 'devanagari'
        || script === 'bengali'  || script === 'thai'
        || script === 'greek'    || script === 'hebrew';
}

// Strip common place-type suffixes from a romanized name so transliteration
// produces a clean city label. Examples:
//   "Katsuragawa Town"      → "Katsuragawa"
//   "Kyoto-shi"             → "Kyoto"
//   "Shibuya-ku"            → "Shibuya"
//   "Beijing City"          → "Beijing"
//   "Comune di Bologna"     → "Bologna"  (less common; covers Italian)
const PLACE_SUFFIX_RE = new RegExp(
    '\\s(?:'
    + 'city|town|village|hamlet|municipality|prefecture|metropolis'
    + '|metropolitan(?:\\sarea)?|district|county|province|provincia'
    + '|region|special\\sadministrative\\sregion|sar|state|capital'
    + ')$',
    'i'
);
const JP_HYPHEN_SUFFIX_RE = /-?(machi|cho|mura|shi|ku|to|fu|ken|gun|son)$/i;
const COMUNE_PREFIX_RE = /^comune\s+di\s+/i;

function stripPlaceSuffix(s) {
    let t = String(s || '').trim();
    if (!t) return '';
    // Italian-style "Comune di X" → "X"
    t = t.replace(COMUNE_PREFIX_RE, '').trim();
    // Japanese hyphenated suffixes (e.g. Kyoto-shi, Shibuya-ku)
    t = t.replace(JP_HYPHEN_SUFFIX_RE, '').trim();
    // Generic English place suffixes (City, Town, Village, …)
    t = t.replace(PLACE_SUFFIX_RE, '').trim();
    return t;
}

module.exports = {
    detectScript,
    isArabicSafe,
    isLatin,
    isNonLatinNonArabic,
    stripPlaceSuffix
};
