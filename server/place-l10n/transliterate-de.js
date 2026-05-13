// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL-PLACE-SEARCH-L10N-DE-1 (2026-05-13) — German → Arabic
// ═══════════════════════════════════════════════════════════════════════════
// Two-pronged module (same pattern as transliterate-cjk + romance-overrides):
//
//   1. `DE_AR_OVERRIDES`: small dict for famous German-speaking cities whose
//      Arabic name is historical/conventional rather than phonetic
//      (Köln → كولونيا, Wien → فيينا, Zürich → زيورخ, München → ميونخ).
//      The same cities are seeded into `curated-places.json` so tier 1
//      always wins; this dict is a fallback if curated is ever changed.
//
//   2. `transliterateGermanToArabic`: phonetic Latin → Arabic with German-
//      specific rules:
//
//      Umlauts (preserved before NFD — Hepburn-like):
//          ä → ا  (close-mid /ɛː/ — Arabic alif approximation)
//          ö → و  (front-rounded /ø/ — no closer Arabic letter)
//          ü → و  (front-rounded /y/ — same)
//          ß → س  (always /s/)
//
//      Word-initial digraphs:
//          sch → ش  (German /ʃ/)
//          st-/sp- → شت- / شب-  (German /ʃt/, /ʃp/ ONLY at word start;
//                                 mid-word st remains ست)
//
//      Other digraphs:
//          ch  → خ   (German /x/ or /ç/)
//          tz  → تس  (German /ts/)
//          ie  → ي   (long /iː/)
//          ei/ai/ay/ey → اي
//          eu/äu → وي
//          au → او
//
//      Single letters that differ from generic English convention:
//          g → غ   (German /g/, same as Japanese-romaji convention)
//          z → تس  (German z is /ts/, not /z/)
//          j → ي   (German j is /j/, not /dʒ/)
//          v → ف   (German v is /f/)
//          w → ف   (German w is /v/ but Arabic prefers ف here)
//          e → ''  (often silent in unstressed positions)
//
//      Doubled consonants collapse to a single Arabic letter
//      ("Stuttgart" → "شتوتغارت", not "شتوتتغارت").
//
// Examples:
//   München     → 'ميونخ'   (curated; module gives مونخن otherwise)
//   Hamburg     → 'هامبورغ'
//   Frankfurt   → 'فرانكفورت'
//   Berlin      → 'برلين'
//   Düsseldorf  → 'دوسلدورف'
//   Nürnberg    → 'نورنبرغ'
//   Stuttgart   → 'شتوتغارت'
//   Bonn        → 'بون'

'use strict';

// ── Override dict for famous historic Arabic names ───────────────────────
// Cities NOT in this dict fall through to the phonetic transliterator.
const DE_AR_OVERRIDES_FLAT = {
    // Germany
    'munich':       'ميونخ',
    'munchen':      'ميونخ',
    'cologne':      'كولونيا',
    'koln':         'كولونيا',
    'dusseldorf':   'دوسلدورف',
    'nurnberg':     'نورنبرغ',
    'nuremberg':    'نورنبرغ',
    'hamburg':      'هامبورغ',
    'frankfurt':    'فرانكفورت',
    'stuttgart':    'شتوتغارت',
    'berlin':       'برلين',
    'bonn':         'بون',
    'leipzig':      'لايبزيغ',
    'dresden':      'دريسدن',
    'essen':        'إيسن',
    'bremen':       'بريمن',
    'hanover':      'هانوفر',
    'hannover':     'هانوفر',
    // Austria
    'vienna':       'فيينا',
    'wien':         'فيينا',
    'salzburg':     'سالزبورغ',
    'innsbruck':    'إنسبروك',
    'graz':         'غراتس',
    'linz':         'لينتس',
    // Switzerland
    'zurich':       'زيورخ',
    'zuerich':      'زيورخ',
    'geneva':       'جنيف',
    'geneve':       'جنيف',
    'basel':        'بازل',
    'bern':         'برن',
    'lausanne':     'لوزان',
    'lucerne':      'لوسرن',
    'luzern':       'لوسرن'
};

// ── Character + digraph maps for the phonetic transliterator ─────────────
const DE_LETTERS = {
    'a': 'ا', 'b': 'ب', 'c': 'ك',
    'd': 'د', 'e': '',  'f': 'ف',
    'g': 'غ',                       // ← German /g/ → غ (NOT ج)
    'h': 'ه', 'i': 'ي', 'j': 'ي',  // German j is /j/
    'k': 'ك', 'l': 'ل', 'm': 'م',
    'n': 'ن', 'o': 'و', 'p': 'ب',
    'q': 'ق', 'r': 'ر', 's': 'س',
    't': 'ت', 'u': 'و', 'v': 'ف',
    'w': 'ف', 'x': 'كس', 'y': 'ي',
    // Note: z handled via bigram → تس below; standalone 'z' here only
    // fires when not part of "tz". Use ز as a safer fallback.
    'z': 'ز',
    // Umlauts + sharp-s
    'ä': 'ا', 'ö': 'و', 'ü': 'و', 'ß': 'س'
};

const DE_BIGRAMS = {
    'ch': 'خ',   'tz': 'تس',
    'ie': 'ي',   'ei': 'اي',  'ai': 'اي',  'ay': 'اي',  'ey': 'اي',
    'eu': 'وي',  'äu': 'وي',  'au': 'او'
};

const DE_TRIGRAM_SCH = /^sch/;
const WORD_START_ST  = /^st/;
const WORD_START_SP  = /^sp/;

function lookupKey(s) {
    return String(s || '')
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[''`'’]+/g, '')
        .replace(/[-_\s]+/g, ' ')
        .trim();
}

// Look up the canonical Arabic for a famous DE/AT/CH place by countryCode
// + best-effort source name. Returns null if no match.
function lookupGermanArabic(countryCode, ...sources) {
    const cc = String(countryCode || '').toLowerCase();
    if (!['de', 'at', 'ch'].includes(cc)) return null;
    for (const src of sources) {
        if (!src || typeof src !== 'string') continue;
        const key = lookupKey(src);
        if (!key) continue;
        if (DE_AR_OVERRIDES_FLAT[key]) return DE_AR_OVERRIDES_FLAT[key];
    }
    return null;
}

// Phonetic German → Arabic. Operates on the ORIGINAL lowercased string
// (NOT NFD-stripped) so ä/ö/ü/ß survive into the lookup tables.
function transliterateGermanToArabic(s) {
    if (!s || typeof s !== 'string') return '';
    const lower = String(s).toLowerCase()
        .replace(/[''`'’]+/g, '')
        .replace(/[-_\s]+/g, ' ')
        .trim();
    if (!lower) return '';
    // Collapse doubled consonants ("Stuttgart" → "stutgart" → "شتوتغارت")
    // — leave doubled vowels alone (they encode length, e.g. "Aachen").
    const collapsed = lower.replace(/([bcdfgkhjklmnpqrstvwxz])\1/g, '$1');
    let out = '';
    // Split by whitespace and handle word boundaries (sch-/st-/sp- only fire
    // at word starts, not mid-word).
    const tokens = collapsed.split(/(\s+)/);
    for (const token of tokens) {
        if (/^\s+$/.test(token)) { out += ' '; continue; }
        let t = token;
        let local = '';
        // Word-initial trigraph "sch" → "ش"
        if (DE_TRIGRAM_SCH.test(t)) { local += 'ش'; t = t.slice(3); }
        // Word-initial "st" → "شت", "sp" → "شب"
        else if (WORD_START_ST.test(t) && t.length > 2) { local += 'شت'; t = t.slice(2); }
        else if (WORD_START_SP.test(t) && t.length > 2) { local += 'شب'; t = t.slice(2); }
        let i = 0;
        while (i < t.length) {
            const ch = t[i];
            // Arabic chars pass through
            if (/[؀-ۿ]/.test(ch)) { local += ch; i++; continue; }
            const bg = t.slice(i, i + 2);
            if (DE_BIGRAMS[bg]) { local += DE_BIGRAMS[bg]; i += 2; continue; }
            if (DE_LETTERS[ch] !== undefined) { local += DE_LETTERS[ch]; i++; continue; }
            i++;
        }
        out += local;
    }
    return out.replace(/\s+/g, ' ').trim();
}

module.exports = {
    lookupGermanArabic,
    transliterateGermanToArabic,
    _DICTS: { DE_AR_OVERRIDES_FLAT },
    _TABLES: { DE_LETTERS, DE_BIGRAMS }
};
