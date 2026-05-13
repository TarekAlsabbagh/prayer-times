// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL-PLACE-SEARCH-L10N-TR-1 (2026-05-13) — Turkish → Arabic transliteration
// ═══════════════════════════════════════════════════════════════════════════
// Used by `index.js`'s tier-5 (country-aware) hook when the search result has
// `countryCode === 'tr'` OR the source name contains Turkish diacritics
// (`Ş ş Ç ç Ğ ğ İ ı Ö ö Ü ü`). Produces phonetically reasonable Arabic for
// place names like:
//
//   Şirince  → شيرينجه
//   Çıralı   → تشيرالي
//   Göreme   → غوريمه
//   Üsküdar  → أوسكودار
//   Çeşme    → تشيشمه
//   İzmir    → إزمير
//   Kaş      → كاش
//
// Key design points:
//   * Operates on the ORIGINAL lowercased string — NO NFD strip, so the
//     Turkish-specific diacritics (cedilla, breve, umlaut, dotless-i) are
//     preserved through to the lookup tables. The generic AR pipeline NFD-
//     strips them and produces poor output.
//   * Position-aware vowels: word-INITIAL vowels need a hamza carrier
//     (Arabic phonotactics doesn't allow naked initial vowels), word-MEDIAL
//     vowels become bare letters, word-FINAL `e` becomes silent `ه`.
//   * Turkish `c` is /dʒ/ (→ ج), NOT English /k/ or /s/ — the generic
//     pipeline's contextual `c+e/i → س` rule is wrong for Turkish.
//   * `ç` is digraph /tʃ/ → تش.
//   * `ş` is /ʃ/ → ش.
//   * `ğ` is silent in modern Turkish — dropped.
//   * `ı` (dotless i) is /ɯ/ — approximated as ي (no closer Arabic vowel).
//   * `ö`, `ü` are front-rounded vowels with no Arabic equivalent —
//     approximated as و (and `أو` when word-initial).

'use strict';

// Position-aware letter maps. Word-initial vowels get a hamza-carrying
// letter; mid- and end-word vowels are bare. End-of-word `e` becomes ه.
const TR_MID = {
    'a': 'ا',     'b': 'ب',     'c': 'ج',     'ç': 'تش',
    'd': 'د',     'e': 'ي',     'f': 'ف',     'g': 'غ',
    'ğ': '',      'h': 'ه',     'i': 'ي',     'ı': 'ي',
    'j': 'ج',     'k': 'ك',     'l': 'ل',     'm': 'م',
    'n': 'ن',     'o': 'و',     'ö': 'و',     'p': 'ب',
    'q': 'ق',     'r': 'ر',     's': 'س',     'ş': 'ش',
    't': 'ت',     'u': 'و',     'ü': 'و',     'v': 'ف',
    'w': 'و',     'x': 'كس',    'y': 'ي',     'z': 'ز'
};

// Word-INITIAL overrides — vowels need hamza carriers. Consonants
// inherit from MID via the spread below.
const TR_START = Object.assign({}, TR_MID, {
    'e':  'إي',   // /e/ word-start → hamza-i + ya (long e)
    'i':  'إ',    // word-start /i/ → hamza-i
    'ı':  'إ',    // word-start /ɯ/ → hamza-i (best approximation)
    'o':  'أو',   // word-start /o/ → hamza-a + waw
    'ö':  'أو',   // word-start /ø/ → hamza-a + waw (no better Arabic eqv.)
    'u':  'أو',   // word-start /u/ → hamza-a + waw
    'ü':  'أو'    // word-start /y/ → hamza-a + waw (no better Arabic eqv.)
});

// Word-FINAL overrides — final `e` is rendered as ه (silent vowel mark).
const TR_END = Object.assign({}, TR_MID, {
    'e':  'ه'
});

// Regex used by isTurkishScript() to detect Turkish-specific diacritics
// from the SOURCE name. Used as a secondary signal when countryCode is
// missing or ambiguous.
const TR_SCRIPT_RE = /[ŞşÇçĞğİıÖöÜü]/;

function isTurkishScript(s) {
    if (typeof s !== 'string') return false;
    return TR_SCRIPT_RE.test(s);
}

// Transliterate a Latin/Turkish string to Arabic, position-aware.
// Returns '' on empty / invalid input.
function transliterateTurkishToArabic(s) {
    if (!s || typeof s !== 'string') return '';
    // Lowercase but DO NOT NFD-strip — keep ş, ç, ğ, ı, etc. intact.
    // toLowerCase() handles İ → i̇ via the Unicode default casing;
    // we normalise that below so 'i̇' (i + combining dot) collapses
    // back to plain 'i'.
    const lower = String(s).toLowerCase()
        .normalize('NFC')                          // i̇ → ı? No — leave to lookup
        .replace(/̇/g, '')                    // strip stray combining dot above
        .replace(/[‘’‚‛'`-]+/g, ' ') // apostrophes + hyphens → space
        .replace(/\s+/g, ' ')
        .trim();
    if (!lower) return '';

    let out = '';
    // Iterate word-by-word so position-aware tables work per-word.
    const tokens = lower.split(/(\s+)/);
    for (const token of tokens) {
        if (/^\s+$/.test(token)) { out += ' '; continue; }
        // Array.from handles multi-byte chars (Turkish chars are BMP so
        // length === 1 per char, but be safe).
        const chars = Array.from(token);
        const last = chars.length - 1;
        for (let i = 0; i < chars.length; i++) {
            const ch = chars[i];
            // Already-Arabic char passes through.
            if (/[؀-ۿ]/.test(ch)) { out += ch; continue; }
            // Pick the position-appropriate table.
            const table = (i === 0) ? TR_START
                        : (i === last) ? TR_END
                        : TR_MID;
            const mapped = table[ch];
            if (mapped !== undefined) { out += mapped; continue; }
            // Unknown char (digit, punctuation we missed) — drop.
        }
    }
    return out.replace(/\s+/g, ' ').trim();
}

module.exports = {
    isTurkishScript,
    transliterateTurkishToArabic,
    // Exposed for tests + future inspection
    _TABLES: { TR_START, TR_MID, TR_END }
};
