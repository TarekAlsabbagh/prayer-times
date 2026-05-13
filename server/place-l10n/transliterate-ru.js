// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL-PLACE-SEARCH-L10N-RU-1 (2026-05-13) — Cyrillic → Arabic
// ═══════════════════════════════════════════════════════════════════════════
// Two-pronged module (same pattern as transliterate-de + transliterate-cjk):
//
//   1. `RU_AR_OVERRIDES_FLAT`: small dict for famous Russian/Ukrainian
//      cities whose Arabic name is conventionally rendered from the
//      English/transliterated form rather than from raw Cyrillic
//      (Moscow → موسكو, Saint Petersburg → سانت بطرسبرغ, Kazan → قازان).
//
//   2. `transliterateCyrillicToArabic`: phonetic Cyrillic → Arabic with
//      coverage for both Russian and Ukrainian letters. Russian /g/ →
//      غ (same convention as Japanese and German). Affricates /ts/ →
//      تس, /tʃ/ → تش. Silent signs (ъ, ь) are dropped. Doubled
//      consonants collapse.
//
// Letter map (lowercase Cyrillic codepoints):
//   а→ا   б→ب   в→ف   г→غ   ґ→غ   д→د   е→ي   ё→يو   ж→ج   з→ز
//   и→ي   і→ي   ї→يي   й→ي   к→ك   л→ل   м→م   н→ن   о→و   п→ب
//   р→ر   с→س   т→ت   у→و   ф→ف   х→خ   ц→تس   ч→تش   ш→ش   щ→ش
//   ъ→''  ы→ي   ь→''  э→إ   ю→يو   я→يا   є→يي

'use strict';

// ── Override dict for famous Russian / Ukrainian cities ──────────────────
// Keyed in LOWERCASE NFD-stripped form so both Cyrillic and Latin spellings
// can hit (e.g. "moscow" and "москва" both → "موسكو").
const RU_AR_OVERRIDES_FLAT = {
    // Russia — Latin spellings
    'moscow':          'موسكو',
    'saint petersburg':'سانت بطرسبرغ',
    'st petersburg':   'سانت بطرسبرغ',
    'st. petersburg':  'سانت بطرسبرغ',
    'petersburg':      'سانت بطرسبرغ',
    'vladivostok':     'فلاديفوستوك',
    'kazan':           'قازان',
    'sochi':           'سوتشي',
    'novosibirsk':     'نوفوسيبيرسك',
    'yekaterinburg':   'يكاترينبورغ',
    'ekaterinburg':    'يكاترينبورغ',
    'nizhny novgorod': 'نيجني نوفغورود',
    'samara':          'سامارا',
    'rostov':          'روستوف',
    'volgograd':       'فولغوغراد',
    'krasnoyarsk':     'كراسنويارسك',
    'omsk':            'أومسك',
    'ufa':             'أوفا',
    'perm':            'بيرم',
    'voronezh':        'فورونيج',
    'tula':            'تولا',
    'murmansk':        'مورمانسك',
    // Russia — Cyrillic spellings
    'москва':          'موسكو',
    'санкт петербург': 'سانت بطرسبرغ',
    'санктпетербург':  'سانت بطرسبرغ',
    'санкт-петербург': 'سانت بطرسبرغ',
    'петербург':       'سانت بطرسبرغ',
    'владивосток':     'فلاديفوستوك',
    'казань':          'قازان',
    'сочи':            'سوتشي',
    'новосибирск':     'نوفوسيبيرسك',
    'екатеринбург':    'يكاترينبورغ',
    'нижний новгород': 'نيجني نوفغورود',

    // Ukraine — Latin
    'kyiv':            'كييف',
    'kiev':            'كييف',
    'odesa':           'أوديسا',
    'odessa':          'أوديسا',
    'lviv':            'لفيف',
    'lvov':            'لفيف',
    'kharkiv':         'خاركيف',
    'kharkov':         'خاركيف',
    'dnipro':          'دنيبرو',
    'dnepropetrovsk':  'دنيبرو',
    'donetsk':         'دونيتسك',
    'zaporizhzhia':    'زابوريجيا',
    // Ukraine — Cyrillic
    'київ':            'كييف',
    'киев':            'كييف',     // Russian spelling of Kyiv
    'одеса':           'أوديسا',
    'одесса':          'أوديسا',   // Russian spelling
    'львів':           'لفيف',
    'львов':           'لفيف',     // Russian spelling
    'харків':          'خاركيف',
    'харьков':         'خاركيف',   // Russian spelling
    'дніпро':          'دنيبرو',
    'дніпропетровськ': 'دنيبرو'
};

// ── Cyrillic char + digraph maps for the phonetic transliterator ─────────
// Bigrams first (longest-match), then single letters.
const RU_BIGRAMS = {
    // Multi-codepoint vowel/affricate sequences (rare in practice)
};

const RU_LETTERS = {
    // Russian + Ukrainian shared
    'а': 'ا', 'б': 'ب', 'в': 'ف', 'г': 'غ', 'д': 'د',
    'е': 'ي', 'ё': 'يو',
    'ж': 'ج', 'з': 'ز',
    'и': 'ي', 'й': 'ي',
    'к': 'ك', 'л': 'ل', 'м': 'م', 'н': 'ن',
    'о': 'و', 'п': 'ب', 'р': 'ر',
    'с': 'س', 'т': 'ت', 'у': 'و',
    'ф': 'ف', 'х': 'خ',
    'ц': 'تس', 'ч': 'تش',
    'ш': 'ش', 'щ': 'ش',
    'ъ': '',  // hard sign — silent
    'ы': 'ي',
    'ь': '',  // soft sign — silent in transliteration
    'э': 'إ',
    'ю': 'يو', 'я': 'يا',
    // Ukrainian-specific
    'і': 'ي', 'ї': 'يي', 'є': 'يي', 'ґ': 'غ'
};

// ── Helpers ──────────────────────────────────────────────────────────────
const CYRILLIC_RE = /[Ѐ-ӿ]/;

function isCyrillic(s) {
    if (typeof s !== 'string') return false;
    return CYRILLIC_RE.test(s);
}

function lookupKey(s) {
    // NFD-strip removes Cyrillic diacritics (й→и, ё→е, ї→і, ґ→г) so
    // the dict only needs one form per city; both "Київ" and "киів"
    // collapse to the same lookup key.
    return String(s || '')
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[''`'’]+/g, '')
        .replace(/[-_\s]+/g, ' ')
        .trim();
}

// Build a normalized lookup table at module-load time so dict authors can
// write keys in either pre-NFD or post-NFD Cyrillic and lookup still hits.
const RU_AR_LOOKUP = {};
for (const [k, v] of Object.entries(RU_AR_OVERRIDES_FLAT)) {
    RU_AR_LOOKUP[lookupKey(k)] = v;
}

// Look up the canonical Arabic for a famous RU/UA place by country code +
// best-effort source name. Returns null if no match.
function lookupRussianArabic(countryCode, ...sources) {
    const cc = String(countryCode || '').toLowerCase();
    // Without a CC, still allow lookup if any source contains Cyrillic
    // (defensive — country might be missing on poorly-tagged Nominatim
    // entries).
    const hasCcMatch = ['ru', 'ua', 'by', 'kz'].includes(cc);
    const hasCyrSource = sources.some(s => isCyrillic(s));
    if (!hasCcMatch && !hasCyrSource) return null;
    for (const src of sources) {
        if (!src || typeof src !== 'string') continue;
        const key = lookupKey(src);
        if (!key) continue;
        if (RU_AR_LOOKUP[key]) return RU_AR_LOOKUP[key];
    }
    return null;
}

// Phonetic Cyrillic → Arabic. Operates on the ORIGINAL lowercased string
// (NOT NFD-stripped) so Cyrillic chars survive into the lookup tables.
// Collapses doubled consonants. Drops silent signs (ъ, ь).
function transliterateCyrillicToArabic(s) {
    if (!s || typeof s !== 'string') return '';
    const lower = String(s).toLowerCase()
        .replace(/[''`'’]+/g, '')
        .replace(/[-_\s]+/g, ' ')
        .trim();
    if (!lower) return '';
    // Collapse doubled Cyrillic consonants (the same character repeated).
    const collapsed = lower.replace(/([бвгґджзйклмнпрстфхцчшщ])\1/g, '$1');
    let out = '';
    let i = 0;
    while (i < collapsed.length) {
        const ch = collapsed[i];
        if (/[؀-ۿ]/.test(ch)) { out += ch; i++; continue; }
        if (/\s/.test(ch)) { out += ' '; i++; continue; }
        const bg = collapsed.slice(i, i + 2);
        if (RU_BIGRAMS[bg]) { out += RU_BIGRAMS[bg]; i += 2; continue; }
        if (RU_LETTERS[ch] !== undefined) { out += RU_LETTERS[ch]; i++; continue; }
        i++;   // drop anything we don't recognise (Latin chars, punct, digits)
    }
    return out.replace(/\s+/g, ' ').trim();
}

module.exports = {
    isCyrillic,
    lookupRussianArabic,
    transliterateCyrillicToArabic,
    _DICTS: { RU_AR_OVERRIDES_FLAT },
    _TABLES: { RU_LETTERS, RU_BIGRAMS }
};
