// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL-PLACE-SEARCH-L10N-IN-1 (2026-05-13) — Indian subcontinent overrides
// ═══════════════════════════════════════════════════════════════════════════
// Coverage: India + Pakistan + Bangladesh.
//
// The subcontinent is special because well-known cities carry names in
// up to FIVE scripts users might type:
//
//   * Latin (English)        — Delhi, Mumbai, Karachi, Dhaka
//   * Devanagari (Hindi)     — दिल्ली, मुंबई, हैदराबाद, लखनऊ
//   * Urdu (Arabic-script)   — کراچی, لاہور, اسلام آباد
//   * Bengali                — কলকাতা, ঢাকা, চট্টগ্রাম
//   * Regional Indian scripts — Tamil சென்னை (Chennai), Kannada ಬೆಂಗಳೂರು
//     (Bengaluru), Gujarati અમદાવાદ (Ahmedabad), etc.
//
// All of those forms must resolve to the canonical Arabic display name
// for the AR UI. Strategy (same as L10N-CJK-1 / RU-1 / DE-1):
//
//   1. The user-listed cities live in `curated-places.json` with
//      `aliases.hi` / `aliases.ur` / `aliases.bn` / `aliases.ta` / etc.
//      arrays so the existing `_searchCuratedPlaces` candidate-collector
//      picks them up without any code change to the search loop.
//
//   2. This module's dict is a SECONDARY safety net for cities not yet
//      in curated. Its `lookupIndianArabic(cc, ...sources)` gates on
//      countryCode (in/pk/bd) OR script detection.
//
// Urdu uses Arabic script but with extra letters not in standard Arabic
// (ہ, ھ, ی, ے, ک, چ, پ, گ, ژ). The `lookupKey` helper folds these to
// their nearest Arabic equivalents so "لاہور" (Urdu) and "لاهور"
// (Arabic) both hit the same dict entry.

'use strict';

// ── Override dict (post-fold Latin/Urdu/Devanagari/Bengali keys) ─────────
const IN_AR_OVERRIDES_FLAT = {
    // ── India (lat + native scripts) ──
    'delhi':         'دلهي',
    'new delhi':     'دلهي',
    'mumbai':        'مومباي',
    'bombay':        'مومباي',
    'kolkata':       'كلكتا',
    'calcutta':      'كلكتا',
    'hyderabad':     'حيدر آباد',
    'chennai':       'تشيناي',
    'madras':        'تشيناي',
    'bengaluru':     'بنغالورو',
    'bangalore':     'بنغالورو',
    'lucknow':       'لكناو',
    'ahmedabad':     'أحمد آباد',
    'jaipur':        'جايبور',
    'pune':          'بونه',
    'agra':          'أغرا',
    'varanasi':      'فاراناسي',
    'kanpur':        'كانبور',
    'nagpur':        'ناغبور',
    'surat':         'سورات',
    'patna':         'باتنا',
    'indore':        'إندور',
    // Devanagari
    'दिल्ली':         'دلهي',
    'नई दिल्ली':      'دلهي',
    'मुंबई':           'مومباي',
    'हैदराबाद':        'حيدر آباد',
    'लखनऊ':           'لكناو',
    'जयपुर':           'جايبور',
    // Tamil / Kannada / Gujarati / Bengali (India)
    'சென்னை':         'تشيناي',
    'ಬೆಂಗಳೂರು':       'بنغالورو',
    'અમદાવાદ':         'أحمد آباد',
    'কলকাতা':         'كلكتا',

    // ── Pakistan (Latin + Urdu — Urdu chars are folded to Arabic by lookupKey) ──
    // Note: keys here are the POST-FOLD form (ہ→ه, ی→ي, ک→ك, چ→تش, etc.)
    'karachi':       'كراتشي',
    'lahore':        'لاهور',
    'islamabad':     'إسلام آباد',
    'rawalpindi':    'روالبندي',
    'peshawar':      'بيشاور',
    'multan':        'ملتان',
    'faisalabad':    'فيصل آباد',
    'quetta':        'كويتا',
    'sialkot':       'سيالكوت',
    'gujranwala':    'غوجرانوالا',
    // Urdu raw spellings — module-load normalization folds these into
    // post-fold lookup keys that user input also produces.
    'کراچی':           'كراتشي',
    'لاہور':           'لاهور',
    'اسلام آباد':      'إسلام آباد',
    'راولپنڈی':        'روالبندي',
    'پشاور':           'بيشاور',
    'ملتان':           'ملتان',
    'فیصل آباد':       'فيصل آباد',
    'کوئٹہ':           'كويتا',
    'سیالکوٹ':         'سيالكوت',

    // ── Bangladesh (Latin + Bengali) ──
    'dhaka':         'دكا',
    'chittagong':    'شيتاغونغ',
    'chattogram':    'شيتاغونغ',
    'sylhet':        'سلهت',
    'rajshahi':      'راجشاهي',
    'khulna':        'خولنا',
    'barisal':       'باريسال',
    'rangpur':       'رانغبور',
    'mymensingh':    'ميمن سينغ',
    // Bengali
    'ঢাকা':           'دكا',
    'চট্টগ্রাম':       'شيتاغونغ',
    'সিলেট':          'سلهت',
    'রাজশাহী':         'راجشاهي',
    'খুলনা':          'خولنا'
};

// ── Script detection ────────────────────────────────────────────────────
const DEVANAGARI_RE = /[ऀ-ॿ]/;
const BENGALI_RE    = /[ঀ-৿]/;
const TAMIL_RE      = /[஀-௿]/;
const KANNADA_RE    = /[ಀ-೿]/;
const GUJARATI_RE   = /[઀-૿]/;
const URDU_EXTRA_RE = /[چپژکگہھیےؐ-ٟڀ-ۿݐ-ݿ]/;

function isSouthAsianScript(s) {
    if (typeof s !== 'string') return false;
    return DEVANAGARI_RE.test(s) || BENGALI_RE.test(s)
        || TAMIL_RE.test(s) || KANNADA_RE.test(s) || GUJARATI_RE.test(s)
        || URDU_EXTRA_RE.test(s);
}

// ── Lookup-key normalization ────────────────────────────────────────────
// Folds Urdu-specific letters to standard Arabic so "لاہور" and "لاهور"
// hit the same key. Also folds Arabic hamzated alif variants the way the
// rest of the codebase does (see server.js `_normSearchText`).
function lookupKey(s) {
    let k = String(s || '').toLowerCase();
    // Urdu / Persian → Arabic letter folds
    k = k.replace(/ہ/g, 'ه')   // U+06C1 (Heh Goal) → U+0647
         .replace(/ھ/g, 'ه')   // U+06BE (Heh Doachashmee) → U+0647
         .replace(/ی/g, 'ي')   // U+06CC (Farsi Yeh) → U+064A
         .replace(/ے/g, 'ي')   // U+06D2 (Yeh Barree) → U+064A
         .replace(/ک/g, 'ك')   // U+06A9 (Keheh) → U+0643
         .replace(/چ/g, 'تش')  // U+0686 (Cheh) → تش (Arabic /tʃ/)
         .replace(/پ/g, 'ب')   // U+067E (Peh) → ب
         .replace(/گ/g, 'غ')   // U+06AF (Gaf) → غ (/g/ → ghain)
         .replace(/ژ/g, 'ج')   // U+0698 (Jeh) → ج
         // Retroflex consonants (Urdu/Hindi adaptations)
         .replace(/ٹ/g, 'ت')   // U+0679 (TTeh) → ت
         .replace(/ڈ/g, 'د')   // U+0688 (DDal) → د
         .replace(/ڑ/g, 'ر')   // U+0691 (RReh) → ر
         .replace(/ں/g, 'ن');  // U+06BA (Noon Ghunna) → ن
    // Arabic hamzated alif + other diacritic folds (mirrors _normSearchText)
    k = k.replace(/[أإآٱا]/g, 'ا')
         .replace(/ى/g, 'ي')
         .replace(/ؤ/g, 'و')
         .replace(/ئ/g, 'ي')
         .replace(/ة/g, 'ه')
         .replace(/[ً-ٰٟ]/g, '');
    // Latin diacritics (NFD-strip combining marks only)
    k = k.normalize('NFD').replace(/[̀-ͯ]/g, '');
    // Strip apostrophes / collapse separators
    k = k.replace(/[''`'’]+/g, '')
         .replace(/[-_\s]+/g, ' ')
         .trim();
    return k;
}

// Build a normalized lookup table at module-load so dict authors don't
// have to pre-fold their keys.
const IN_AR_LOOKUP = {};
for (const [k, v] of Object.entries(IN_AR_OVERRIDES_FLAT)) {
    IN_AR_LOOKUP[lookupKey(k)] = v;
}

// Look up the canonical Arabic for an IN/PK/BD place by countryCode +
// best-effort source name. Returns null if no match.
function lookupIndianArabic(countryCode, ...sources) {
    const cc = String(countryCode || '').toLowerCase();
    const isSouthAsianCountry = ['in', 'pk', 'bd', 'np', 'lk'].includes(cc);
    // Without a CC, allow lookup if any source contains a South Asian script.
    const hasSouthAsianSource = sources.some(s => isSouthAsianScript(s));
    if (!isSouthAsianCountry && !hasSouthAsianSource) return null;
    for (const src of sources) {
        if (!src || typeof src !== 'string') continue;
        const key = lookupKey(src);
        if (!key) continue;
        if (IN_AR_LOOKUP[key]) return IN_AR_LOOKUP[key];
    }
    return null;
}

module.exports = {
    isSouthAsianScript,
    lookupIndianArabic,
    _DICTS: { IN_AR_OVERRIDES_FLAT, IN_AR_LOOKUP }
};
