// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL-PLACE-SEARCH-L10N-SCRIPT-FALLBACK-1 (2026-05-13) — Romaji → Arabic
// ═══════════════════════════════════════════════════════════════════════════
// Used by `index.js` tier 7b when the result has `countryCode === 'jp'` OR
// the only Latin source available is a Japanese romanized variant
// (name:ja-Latn). Handles the phonetic differences vs generic English
// transliteration:
//
//   * Japanese /g/  → ج would be wrong; Arabic conventionally uses غ
//     (ghain) for Japanese 'g'. Example: "Katsuragawa" → "كاتسوراغاوا".
//   * Japanese romaji uses unambiguous digraphs:
//       'ts' → تس   ('Mitsubishi' → "ميتسوبيشي")
//       'ch' → تش   ('Hachiman' → "هاتشيمان")
//       'sh' → ش
//       'ky/gy/ry/my/ny/hy/by/py/jy' → consonant + ي (palatalised)
//   * 'r' in romaji is the alveolar tap /ɾ/ — renders as ر same as English.
//   * Final 'e' is voiced /e/, not silent — stays ي (not ه like French).
//
// NOT included (deferred):
//   * Pitch accent / long-vowel macrons — NFD strip drops them; doubled
//     vowels (oo, uu) collapse to a single Arabic vowel.
//   * Kanji-only / kana-only input (no romaji) — those are caught by the
//     pipeline's tier-2 CJK override dict or filtered out as raw CJK.

'use strict';

// Digraphs: applied first (left-to-right, longest-match).
const JP_BIGRAMS = {
    'ts': 'تس',
    'ch': 'تش',
    'sh': 'ش',
    'ky': 'كي', 'gy': 'غي', 'ry': 'ري', 'my': 'مي', 'ny': 'ني',
    'hy': 'هي', 'by': 'بي', 'py': 'بي', 'jy': 'جي',
    // Doubled vowels (long marks in Hepburn) collapse to a single Arabic
    // vowel.
    'aa': 'ا',  'ii': 'ي', 'uu': 'و', 'ee': 'ي', 'oo': 'و',
    // Common Hepburn digraphs that look like single sounds.
    'ou': 'و'
};

// Single-letter map.
const JP_LETTERS = {
    'a': 'ا', 'b': 'ب', 'c': 'س',
    'd': 'د', 'e': 'ي', 'f': 'ف',
    'g': 'غ',                       // ← key difference from generic
    'h': 'ه', 'i': 'ي', 'j': 'ج',
    'k': 'ك', 'l': 'ل', 'm': 'م',
    'n': 'ن', 'o': 'و', 'p': 'ب',
    'q': 'ق', 'r': 'ر', 's': 'س',
    't': 'ت', 'u': 'و', 'v': 'ف',
    'w': 'و', 'x': 'كس', 'y': 'ي',
    'z': 'ز'
};

function transliterateJapaneseRomajiToArabic(s) {
    if (!s || typeof s !== 'string') return '';
    // Lowercase + NFD-strip diacritics so macrons (ō, ū, ā) collapse to
    // plain vowels, then normalize hyphens/underscores/whitespace.
    const t = String(s).toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[-_\s]+/g, ' ')
        .trim();
    if (!t) return '';
    let out = '';
    let i = 0;
    while (i < t.length) {
        const ch = t[i];
        const nx = t[i + 1];
        if (/[؀-ۿ]/.test(ch)) { out += ch; i++; continue; }
        if (/\s/.test(ch))    { out += ' '; i++; continue; }
        const bg = ch + (nx || '');
        if (JP_BIGRAMS[bg]) { out += JP_BIGRAMS[bg]; i += 2; continue; }
        if (JP_LETTERS[ch] !== undefined) { out += JP_LETTERS[ch]; i++; continue; }
        i++;   // drop unknown
    }
    return out.replace(/\s+/g, ' ').trim();
}

module.exports = {
    transliterateJapaneseRomajiToArabic,
    _TABLES: { JP_BIGRAMS, JP_LETTERS }
};
