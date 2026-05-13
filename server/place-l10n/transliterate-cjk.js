// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL-PLACE-SEARCH-L10N-CJK-1 (2026-05-13) — China + Japan overrides
// ═══════════════════════════════════════════════════════════════════════════
// Big Chinese and Japanese cities have well-established Arabic names that
// don't follow generic Latin→Arabic transliteration rules. The user explicitly
// listed canonical forms (Beijing → بكين, Tokyo → طوكيو, …) — we ship those
// as small, curated dictionaries here.
//
// In production, the L10N pipeline order means:
//   * tier 2 (Nominatim namedetails `name:ar`) wins for most big cities
//     anyway — these dicts act as a safety net when Nominatim is missing
//     the AR tag (smaller cities, recently added places, …).
//   * tier 5 (this module) runs after `alias_lang` and BEFORE the Turkish
//     and generic-Latin transliteration tiers, so we never let raw CJK or
//     romanized names slip into the AR UI when a canonical name exists.
//
// NOT included (deferred to future phases):
//   * full pinyin → Arabic transliteration (would need a much larger table)
//   * Wikidata / GeoNames enrichment
//   * smaller cities without a well-known Arabic name (those fall through
//     to generic transliteration, which produces approximate output)

'use strict';

// Canonical Arabic names — keys are normalized lookup forms (lowercase,
// NFD-stripped, apostrophes removed, hyphens/underscores → space).
// Add aliases for common Anglicized spellings (Peking, Canton, etc.).
const CN_AR = {
    'beijing':       'بكين',
    'peking':        'بكين',         // historical English name
    'shanghai':      'شنغهاي',
    'guangzhou':     'قوانغتشو',
    'canton':        'قوانغتشو',     // historical English name
    'shenzhen':      'شينزن',
    'xian':          'شيان',          // "Xi'an" → "xian" after apostrophe strip
    'hangzhou':      'هانغتشو',
    'nanjing':       'نانجينغ',
    'chengdu':       'تشنغدو',
    'wuhan':         'ووهان',
    'tianjin':       'تيانجين',
    'chongqing':     'تشونغتشينغ',
    'suzhou':        'سوجو',
    'qingdao':       'تشينغداو',
    'dalian':        'داليان',
    'harbin':        'هاربين',
    'kunming':       'كونمينغ',
    'macau':         'ماكاو',
    'macao':         'ماكاو',
    'hong kong':     'هونغ كونغ',
    'hongkong':      'هونغ كونغ',
    'shenyang':      'شنيانغ',
    'changchun':     'تشانغتشون',
    'changsha':      'تشانغشا',
    'zhengzhou':     'تشنغتشو',
    'xiamen':        'شيامن',
    'foshan':        'فوشان',
    'lhasa':         'لاسا',
    'urumqi':        'أورومتشي'
};

const JP_AR = {
    'tokyo':         'طوكيو',
    'osaka':         'أوساكا',
    'kyoto':         'كيوتو',
    'yokohama':      'يوكوهاما',
    'sapporo':       'سابورو',
    'nagoya':        'ناغويا',
    'kobe':          'كوبي',
    'fukuoka':       'فوكوكا',
    'hiroshima':     'هيروشيما',
    'sendai':        'سينداي',
    'nara':          'نارا',
    'okinawa':       'أوكيناوا',
    'kanazawa':      'كانازاوا',
    'nagasaki':      'ناغاساكي',
    'kumamoto':      'كوماموتو',
    'naha':          'ناها',
    'sakai':         'ساكاي',
    'kawasaki':      'كاواساكي',
    'saitama':       'سايتاما',
    'chiba':         'تشيبا',
    'kitakyushu':    'كيتاكيوشو',
    'niigata':       'نيغاتا',
    'hamamatsu':     'هاماماتسو',
    'shizuoka':      'شيزوكا',
    'okayama':       'أوكاياما'
};

// Script detection regexes.
// `぀-ゟ` Hiragana   — Japanese only
// `゠-ヿ` Katakana   — Japanese only
// `㐀-䶿` CJK Ext-A  — shared CN/JP
// `一-鿿` CJK Unified — shared CN/JP (Han characters)
const CJK_SCRIPT_RE   = /[぀-ヿ㐀-䶿一-鿿]/;
const KANA_SCRIPT_RE  = /[぀-ヿ]/;   // Japanese-specific signal

function isCJKScript(s) {
    if (typeof s !== 'string') return false;
    return CJK_SCRIPT_RE.test(s);
}

// Common Nominatim disambiguation suffixes that come back appended to
// the English name (e.g. "Guangzhou City", "Tokyo Metropolis"). Stripped
// so the bare-city lookup still hits the dict.
const LOOKUP_SUFFIXES_RE = / (city|municipality|prefecture|metropolis|metropolitan(?: area)?|district|county|province|special administrative region|sar)$/;

// Normalize a Latin/romanized name into a lookup key.
// "Xi'an" / "xi-an" / "Xian" all collapse to "xian".
// "Guangzhou City" → "guangzhou".
function lookupKey(s) {
    let k = String(s || '')
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[''`'’]+/g, '')               // strip apostrophes / quotes
        .replace(/[-_\s]+/g, ' ')                // dashes/underscores/spaces → single space
        .trim();
    // Strip the common Nominatim suffix (one pass is enough — these
    // suffixes don't stack in practice).
    k = k.replace(LOOKUP_SUFFIXES_RE, '');
    return k.trim();
}

// Look up the canonical Arabic name for a CN or JP place. Returns null if
// no match. Sources are tried in priority order; the first hit wins.
//
// `countryCode` decides which dict to consult. When cc is missing AND the
// source contains CJK characters, we fall back to searching both dicts —
// Kana script narrows to JP first; pure Han chars try CN then JP.
function lookupCJKArabic(countryCode, ...sources) {
    const cc = String(countryCode || '').toLowerCase();

    let primary = null;
    let secondary = null;
    if (cc === 'cn') {
        primary = CN_AR;
    } else if (cc === 'jp') {
        primary = JP_AR;
    } else {
        // Country unknown — use script detection to choose
        const hasScript = sources.some(s => typeof s === 'string' && CJK_SCRIPT_RE.test(s));
        if (!hasScript) return null;
        const hasKana = sources.some(s => typeof s === 'string' && KANA_SCRIPT_RE.test(s));
        primary   = hasKana ? JP_AR : CN_AR;
        secondary = hasKana ? CN_AR : JP_AR;
    }

    for (const src of sources) {
        if (!src || typeof src !== 'string') continue;
        const key = lookupKey(src);
        if (!key) continue;
        if (primary[key])              return primary[key];
        if (secondary && secondary[key]) return secondary[key];
    }
    return null;
}

module.exports = {
    isCJKScript,
    lookupCJKArabic,
    // Exposed for tests + future inspection
    _DICTS: { CN_AR, JP_AR }
};
