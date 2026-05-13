// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL-PLACE-SEARCH-L10N-IT-ES-PT-1 (2026-05-13) — Romance overrides
// ═══════════════════════════════════════════════════════════════════════════
// Italian, Spanish, and Portuguese (incl. Brazilian) cities often carry
// historically-established Arabic names that don't follow phonetic Latin →
// Arabic transliteration. Examples:
//
//   Venezia / Venice → البندقية   (the historical Andalusian-Maghrebi name)
//   Firenze / Florence → فلورنسا
//   Córdoba → قرطبة                (al-Andalus heritage)
//   Sevilla → إشبيلية              (al-Andalus heritage)
//   Zaragoza → سرقسطة              (al-Andalus heritage)
//   Málaga → مالقة                 (al-Andalus heritage)
//   Lisboa → لشبونة
//
// These are TIER 6 (post-Nominatim) fallbacks. The main user-listed cities
// are also seeded into `curated-places.json` so they hit TIER 1 instantly,
// without any external dependency. This module catches everything Nominatim
// returns that isn't pre-curated but matches a known canonical name.
//
// NOT included (deferred to future phases):
//   * full Italian/Spanish/Portuguese transliteration of accents (ó/á/í/ú,
//     ñ, ç, ã, õ etc.) — generic NFD-strip in the main pipeline handles
//     basic accent-stripping for non-listed cities.
//   * smaller cities without a well-known Arabic name (those fall through
//     to generic transliteration, producing phonetic approximations).

'use strict';

// Lookup keys: lowercase, NFD-stripped, hyphen/space-normalized. So "Córdoba",
// "córdoba", "Cordoba", "cordoba", "Cordoba City" all collapse to "cordoba".

const IT_AR = {
    'venezia':   'البندقية',
    'venice':    'البندقية',
    'firenze':   'فلورنسا',
    'florence':  'فلورنسا',
    'roma':      'روما',
    'rome':      'روما',
    'napoli':    'نابولي',
    'naples':    'نابولي',
    'milano':    'ميلانو',
    'milan':     'ميلانو',
    'torino':    'تورينو',
    'turin':     'تورينو',
    'genova':    'جنوة',
    'genoa':     'جنوة',
    'bologna':   'بولونيا',
    'pisa':      'بيزا',
    'palermo':   'باليرمو',
    'verona':    'فيرونا',
    'padova':    'بادوفا',
    'padua':     'بادوفا',
    'siena':     'سيينا',
    'modena':    'مودينا',
    'parma':     'بارما',
    'bari':      'باري',
    'catania':   'كاتانيا',
    'trieste':   'تريستا'
};

const ES_AR = {
    'cordoba':   'قرطبة',
    'sevilla':   'إشبيلية',
    'seville':   'إشبيلية',
    'granada':   'غرناطة',
    'malaga':    'مالقة',
    'zaragoza':  'سرقسطة',
    'saragossa': 'سرقسطة',
    'madrid':    'مدريد',
    'barcelona': 'برشلونة',
    'valencia':  'فالنسيا',     // alternate: بلنسية (historical)
    'toledo':    'طليطلة',
    'salamanca': 'سلامنكا',
    'bilbao':    'بلباو',
    'alicante':  'أليكانتي',
    'almeria':   'المرية',
    'jaen':      'جيان',
    'cadiz':     'قادس',
    'huelva':    'ولبة',
    'murcia':    'مرسية',
    'pamplona':  'بنبلونة'
};

const PT_AR = {
    'lisboa':    'لشبونة',
    'lisbon':    'لشبونة',
    'porto':     'بورتو',
    'oporto':    'بورتو',
    'braga':     'براغا',
    'coimbra':   'كويمبرا',
    'faro':      'فارو',
    'evora':     'إيفورا',
    'aveiro':    'أفيرو',
    'funchal':   'فونشال'
};

const BR_AR = {
    'sao paulo':         'ساو باولو',
    'rio de janeiro':    'ريو دي جانيرو',
    'rio':               'ريو دي جانيرو',
    'brasilia':          'برازيليا',
    'salvador':          'سلفادور',
    'fortaleza':         'فورتاليزا',
    'belo horizonte':    'بيلو هوريزونتي',
    'manaus':            'ماناوس',
    'curitiba':          'كوريتيبا',
    'recife':            'ريسيفي',
    'porto alegre':      'بورتو أليغري',
    'belem':             'بيليم'
};

// Normalize a Latin/romanized name into a lookup key.
// Strips diacritics ("Córdoba" → "cordoba"), apostrophes ("São's" → "saos"),
// hyphens/underscores → space. Drops common Nominatim disambiguation
// suffixes so "Florence City" → "florence", "Madrid Capital" → "madrid".
const LOOKUP_SUFFIXES_RE = / (city|town|comune|comune di|municipality|prefecture|metropolitan(?: area)?|district|county|province|provincia|provincia di|state|capital)$/;

function lookupKey(s) {
    let k = String(s || '')
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[''`'’]+/g, '')
        .replace(/[-_\s]+/g, ' ')
        .trim();
    k = k.replace(LOOKUP_SUFFIXES_RE, '');
    return k.trim();
}

// Look up the canonical Arabic name for an IT/ES/PT/BR place by
// countryCode + best-effort source name. Returns null if no match.
function lookupRomanceArabic(countryCode, ...sources) {
    const cc = String(countryCode || '').toLowerCase();
    let dict = null;
    if (cc === 'it') dict = IT_AR;
    else if (cc === 'es') dict = ES_AR;
    else if (cc === 'pt') dict = PT_AR;
    else if (cc === 'br') dict = BR_AR;
    else return null;
    for (const src of sources) {
        if (!src || typeof src !== 'string') continue;
        const key = lookupKey(src);
        if (!key) continue;
        if (dict[key]) return dict[key];
    }
    return null;
}

module.exports = {
    lookupRomanceArabic,
    // Exposed for tests + future inspection
    _DICTS: { IT_AR, ES_AR, PT_AR, BR_AR }
};
