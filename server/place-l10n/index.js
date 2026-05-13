// ═══════════════════════════════════════════════════════════════════════════
// server/place-l10n/index.js — Localization pipeline for search results
// ═══════════════════════════════════════════════════════════════════════════
// Phases shipped previously (when this code lived in server.js):
//   * GLOBAL-PLACE-SEARCH-LANG-1 (2026-05-12): 10 UI languages, country
//     name resolution via Intl.DisplayNames.
//   * GLOBAL-PLACE-SEARCH-L10N-PIPELINE (2026-05-12): generic Latin → Arabic
//     transliteration as a fallback tier, plus `nameQuality` tagging.
//   * GLOBAL-PLACE-SEARCH-L10N-PIPELINE -et refinement (2026-05-12):
//     silent French `-et` ending drops the duplicate ت.
//
// New in GLOBAL-PLACE-SEARCH-L10N-TR-1 (2026-05-13):
//   * Module split: pipeline moves out of `server.js` into this file so
//     future per-country transliteration / overrides can drop in cleanly.
//   * Turkish-specific tier (between `alias_lang` and generic translit) —
//     see `transliterate-tr.js`. Triggered by `countryCode === 'tr'` OR
//     the source name containing Turkish diacritics.
//
// `server.js` calls into this module via:
//
//     const _placeL10n = require('./server/place-l10n');
//     _placeL10n.pickLocalizedDisplayQ(place, lang, nd, fallback, cc);
//
// `_getCountryName` (Intl.DisplayNames lookup) is INTENTIONALLY not moved
// here — it's used by code paths OUTSIDE the L10N pipeline (e.g. the Phase C
// upsert flow `_mapDiscoveredRow` consults `admin.country.{lang}` first and
// only falls back to country-code resolution). Moving it here would force
// a wider refactor than the current phase needs.

'use strict';

const turkish  = require('./transliterate-tr');
const japanese = require('./transliterate-jp');
const cjk      = require('./transliterate-cjk');
const romance  = require('./romance-overrides');
const script   = require('./detect-script');

// ── 10 UI languages this site supports ─────────────────────────────────────
const SUPPORTED_LANGS = ['ar','en','fr','de','tr','ur','id','es','bn','ms'];

// ── Generic Latin → Arabic transliteration tables ─────────────────────────
// NOT perfect transliteration — known limitations:
//   * vowels are dropped/duplicated approximately ("Pontet" → "بونت")
//   * letter "c" is contextual (c+e/i → س, else → ك)
//   * proper Arabic morphology / ta-marbuta / hamza placement NOT applied
// Output tier is marked `quality: 'transliterated'` so Phase D admin
// review can promote curated Arabic names later.

const AR_TRANSLIT_BIGRAMS = {
    'ph': 'ف', 'sh': 'ش', 'ch': 'ش', 'th': 'ث', 'kh': 'خ',
    'gh': 'غ', 'dh': 'ذ', 'oo': 'و', 'ee': 'ي', 'ou': 'و',
    'eu': 'و', 'ai': 'اي', 'ei': 'اي', 'oi': 'وا', 'au': 'و',
    'ck': 'ك'
};

const AR_TRANSLIT_LETTERS = {
    'a': 'ا', 'b': 'ب', 'd': 'د', 'e': '', 'f': 'ف', 'g': 'ج',
    'h': 'ه', 'i': 'ي', 'j': 'ج', 'k': 'ك', 'l': 'ل', 'm': 'م',
    'n': 'ن', 'o': 'و', 'p': 'ب', 'q': 'ق', 'r': 'ر', 's': 'س',
    't': 'ت', 'u': 'و', 'v': 'ف', 'w': 'و', 'x': 'كس', 'y': 'ي',
    'z': 'ز'
};

// Common French/Italian/Spanish word-particles, handled BEFORE the
// char-by-char loop. Conservative — avoids accidental rewrites.
const AR_TRANSLIT_PARTICLES = [
    [/\bsaint\s/g, 'سان '],   [/\bsainte\s/g, 'سانت '],
    [/\bsan\s/g, 'سان '],     [/\bsanta\s/g, 'سانتا '],
    [/\bsanto\s/g, 'سانتو '], [/\bsão\s/g, 'ساو '],
    [/\bles\s/g, 'لو '],       [/\ble\s/g, 'لو '],
    [/\bla\s/g, 'لا '],         [/\bvon\s/g, 'فون '],
    [/\bnew\s/g, 'نيو '],      [/\bvilla\s/g, 'فيلا '],
    [/\bville\s/g, 'فيل '],     [/\bsur\s/g, 'سور '],
    [/\bsous\s/g, 'سو '],       [/\bport\s/g, 'بور '],
    [/\bel\s/g, 'إل '],         [/\bal-/g, 'ال'],
    [/\bel-/g, 'ال'],            [/\bde\s/g, 'دو '],
    [/\bdu\s/g, 'دو '],          [/\bdes\s/g, 'دي '],
    [/\bda\s/g, 'دا '],           [/\bdi\s/g, 'دي '],
    [/\bdo\s/g, 'دو ']
];

function transliterateLatinToArabic(s) {
    if (!s || typeof s !== 'string') return '';
    // Normalize: lowercase, strip diacritics, collapse separators
    let t = s.toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[-'’]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (!t) return '';
    // Apply word particles first
    for (const [re, rep] of AR_TRANSLIT_PARTICLES) t = t.replace(re, rep);
    // Char-by-char with bigram lookahead
    let out = '';
    let i = 0;
    let wordStart = 0;
    while (i < t.length) {
        const ch = t[i];
        const nx = t[i + 1];
        // Already-Arabic char passes through
        if (/[؀-ۿ]/.test(ch)) { out += ch; i++; continue; }
        // Whitespace passes through; reset word boundary
        if (/\s/.test(ch)) { out += ' '; i++; wordStart = i; continue; }
        // French silent `-et` ending: at `e` followed by `t` AND word ends
        // right after, AND source word so far has >= 2 chars before this
        // `e`, skip BOTH (Pontet → بونت, Calvet → كالف).
        if (ch === 'e' && nx === 't'
            && (t[i + 2] === undefined || /\s/.test(t[i + 2]))
            && (i - wordStart) >= 2) {
            i += 2;
            continue;
        }
        // Bigram lookup
        const bg = ch + (nx || '');
        if (AR_TRANSLIT_BIGRAMS[bg]) { out += AR_TRANSLIT_BIGRAMS[bg]; i += 2; continue; }
        // Contextual c: before e/i/y → س, else → ك
        if (ch === 'c') {
            if (nx === 'e' || nx === 'i' || nx === 'y') { out += 'س'; i++; }
            else { out += 'ك'; i++; }
            continue;
        }
        // Single letter
        if (AR_TRANSLIT_LETTERS[ch] !== undefined) {
            out += AR_TRANSLIT_LETTERS[ch]; i++; continue;
        }
        // Drop unknown (punctuation, digits, etc.)
        i++;
    }
    // Collapse multi-space + remove leftover Latin
    return out.replace(/[a-z]/gi, '').replace(/\s+/g, ' ').trim();
}

// ── Build a `names`-shaped object from Nominatim namedetails ──────────────
// L10N-SCRIPT-FALLBACK-1 (2026-05-13): also extracts ROMANIZED variants
// (name:ja-Latn, name:ko-Latn, name:zh-Latn, int_name) under non-lang-code
// keys. These let `pickLocalizedDisplayQ` find a Latin source for AR
// transliteration when the place's primary name is CJK/Hangul/etc.
const ROMANIZED_KEYS = [
    ['name:ja-Latn',     'ja_latn'],
    ['name:ja_rm',       'ja_latn'],         // alt OSM tag for Hepburn
    ['name:ja-Hira',     'ja_hira'],          // Hiragana (still JP script,
                                              // not used for translit but
                                              // captured for diagnostics)
    ['name:ko-Latn',     'ko_latn'],
    ['name:zh-Latn',     'zh_latn'],
    ['name:zh-Pinyin',   'zh_latn'],
    ['name:zh_pinyin',   'zh_latn'],
    ['int_name',         'int_name'],
    ['official_name:en', 'en_official']
];

function extractNamedetailsByLang(nd) {
    const out = {};
    if (!nd || typeof nd !== 'object') return out;
    for (const lang of SUPPORTED_LANGS) {
        const k = 'name:' + lang;
        if (typeof nd[k] === 'string' && nd[k].trim()) out[lang] = nd[k].trim();
    }
    // Romanized variants — only set if not already populated (first wins).
    for (const [tag, slot] of ROMANIZED_KEYS) {
        if (typeof nd[tag] === 'string' && nd[tag].trim() && !out[slot]) {
            out[slot] = nd[tag].trim();
        }
    }
    return out;
}

// ── Pick the best `displayName` for a place + UI lang ─────────────────────
// Tier order (AR-only tiers in italics):
//   1. names[lang]                          → 'curated'
//   2. *AR-only CJK override (curated dict for CN/JP)* → 'override'
//      ↳ countryCode === 'cn'|'jp'. Sits ABOVE namedetails because the
//      curated dict has cleaner canonical names than Nominatim's
//      `name:ar` for several cities (Shenzhen, Guangzhou, etc.).
//   3. namedetailsByLang[lang]              → 'official'
//   4. aliases[lang][0]                     → 'alias'
//   5. *AR-only: any Arabic-script name in another lang slot* → 'alias_lang'
//   6. *AR-only Romance override (IT/ES/PT/BR dict)* → 'override'
//      ↳ countryCode === 'it'|'es'|'pt'|'br'. Sits AFTER Nominatim
//      because for Romance countries Nominatim's name:ar is usually
//      correct — the dict catches cases where it's missing or weak
//      (small/historic cities).
//   7a. *AR-only: Japanese romaji transliteration* → 'transliterated'
//      ↳ countryCode === 'jp'. Uses غ for /g/ (e.g. Katsuragawa → كاتسوراغاوا).
//   7b. *AR-only: Turkish country-specific transliteration* → 'transliterated'
//      ↳ countryCode === 'tr' OR source has [ŞşÇçĞğİıÖöÜö]
//   8. *AR-only: generic Latin→Arabic transliteration* → 'transliterated'
//      ↳ source priority: names.en, nd.en, nd.ja_latn, nd.ko_latn,
//      nd.zh_latn, nd.int_name, fallbackRawName (only if Latin).
//   9. names.en or namedetails.en           → 'fallback_en'
//      ↳ AR refuses non-Latin non-Arabic values (CJK/Hangul/Cyrillic/etc.).
//  10. fallbackRawName                      → 'fallback_raw'
//      ↳ AR refuses non-Latin non-Arabic values (returns 'empty' instead).
//  11. (nothing produced)                   → 'empty'
function pickLocalizedDisplayQ(place, lang, namedetailsByLang, fallbackRawName, countryCode) {
    const code = String(lang || 'ar').toLowerCase();
    const names   = (place && place.names)   || {};
    const aliases = (place && place.aliases) || {};
    const nd      = namedetailsByLang || {};

    // 1. curated/discovered names[lang]
    if (typeof names[code] === 'string' && names[code].trim()) {
        return { value: names[code].trim(), quality: 'curated' };
    }
    // 2. AR-only CJK override (cn/jp canonical dict) — beats Nominatim
    //    name:ar because some Nominatim entries include disambiguation
    //    suffixes like "(الصين)" or use non-canonical spellings.
    if (code === 'ar') {
        const ccLower = String(countryCode || '').toLowerCase();
        if (ccLower === 'cn' || ccLower === 'jp') {
            const cjkHit = cjk.lookupCJKArabic(
                ccLower, nd.en, names.en, nd.zh, names.zh, nd.ja, names.ja, fallbackRawName
            );
            if (cjkHit) return { value: cjkHit, quality: 'override' };
        }
    }
    // 3. external namedetails name:lang
    if (typeof nd[code] === 'string' && nd[code].trim()) {
        return { value: nd[code].trim(), quality: 'official' };
    }
    // 3. first alias in this lang
    if (Array.isArray(aliases[code]) && aliases[code].length > 0
        && typeof aliases[code][0] === 'string' && aliases[code][0].trim()) {
        return { value: aliases[code][0].trim(), quality: 'alias' };
    }
    // 4. AR-only — refuse Latin if any Arabic-script alternative exists
    if (code === 'ar') {
        for (const k of SUPPORTED_LANGS) {
            const v = names[k];
            if (typeof v === 'string' && /[؀-ۿ]/.test(v)) {
                return { value: v.trim(), quality: 'alias_lang' };
            }
            const vd = nd[k];
            if (typeof vd === 'string' && /[؀-ۿ]/.test(vd)) {
                return { value: vd.trim(), quality: 'alias_lang' };
            }
        }
        if (fallbackRawName && /[؀-ۿ]/.test(String(fallbackRawName))) {
            return { value: String(fallbackRawName).trim(), quality: 'alias_lang' };
        }

        // 6. AR-only — Romance override (IT/ES/PT/BR canonical names).
        //    Sits AFTER Nominatim because Nominatim's name:ar for
        //    Romance countries is usually accurate. The dict acts as
        //    a fallback when Nominatim's value is missing/weak.
        const ccLowerRom = String(countryCode || '').toLowerCase();
        if (['it','es','pt','br'].includes(ccLowerRom)) {
            const romHit = romance.lookupRomanceArabic(
                ccLowerRom, nd.en, names.en, nd.it, nd.es, nd.pt, fallbackRawName
            );
            if (romHit) return { value: romHit, quality: 'override' };
        }

        // 7a. AR-only — Japanese romaji transliteration (cc='jp' OR
        //     romanized source comes from name:ja-Latn). Uses ghain (غ)
        //     for Japanese 'g' instead of generic ج. Examples:
        //         "Katsuragawa" → كاتسوراغاوا
        //         "Mitsubishi"  → ميتسوبيشي
        const ccLowerJp = String(countryCode || '').toLowerCase();
        const jpLatinSrc = (nd.ja_latn && String(nd.ja_latn).trim()) ? String(nd.ja_latn).trim()
                         : (nd.en && script.isLatin(nd.en)) ? String(nd.en).trim()
                         : (names.en && script.isLatin(names.en)) ? String(names.en).trim()
                         : (fallbackRawName && script.isLatin(fallbackRawName) ? String(fallbackRawName).trim() : '');
        if (ccLowerJp === 'jp' && jpLatinSrc) {
            const clean = script.stripPlaceSuffix(jpLatinSrc) || jpLatinSrc;
            const jp = japanese.transliterateJapaneseRomajiToArabic(clean);
            if (jp && /[؀-ۿ]/.test(jp) && jp.length >= 2) {
                return { value: jp, quality: 'transliterated' };
            }
        }

        // 7. AR-only — Turkish country-specific transliteration.
        //    Turkish: prefer nd.tr / names.tr (preserves cedilla, breve,
        //    dotless-i etc.). Fall back to English/raw if no Turkish source.
        const ccLowerTr = String(countryCode || '').toLowerCase();
        const trSrcRaw = (typeof nd.tr   === 'string' && nd.tr.trim())   ? nd.tr.trim()
                       : (typeof names.tr === 'string' && names.tr.trim()) ? names.tr.trim()
                       : (typeof nd.en   === 'string' && nd.en.trim())   ? nd.en.trim()
                       : (typeof names.en === 'string' && names.en.trim()) ? names.en.trim()
                       : (fallbackRawName && script.isLatin(fallbackRawName) ? String(fallbackRawName).trim() : '');
        const looksTurkish = ccLowerTr === 'tr' || turkish.isTurkishScript(trSrcRaw);
        if (looksTurkish && trSrcRaw) {
            const tr = turkish.transliterateTurkishToArabic(trSrcRaw);
            if (tr && /[؀-ۿ]/.test(tr) && tr.length >= 2) {
                return { value: tr, quality: 'transliterated' };
            }
        }

        // 8. AR-only generic transliteration from the best Latin source.
        // L10N-SCRIPT-FALLBACK-1: source priority now includes romanized
        // variants of CJK / Hangul (ja_latn, ko_latn, zh_latn, int_name)
        // so a result like {name:"桂川町", name:en:"Katsuragawa Town",
        // name:ja-Latn:"Katsuragawa-machi"} produces an Arabic
        // transliteration ("كاتسوراغاوا") instead of leaking raw CJK.
        // Each source is normalized via `stripPlaceSuffix` first to drop
        // Town / City / -shi / -ku / -machi etc.
        const latinCandidates = [
            names.en,        nd.en,
            names.ja_latn,   nd.ja_latn,
            names.ko_latn,   nd.ko_latn,
            names.zh_latn,   nd.zh_latn,
            names.int_name,  nd.int_name,
            names.en_official, nd.en_official
        ];
        if (fallbackRawName && script.isLatin(fallbackRawName)) {
            latinCandidates.push(String(fallbackRawName));
        }
        let latinSrc = '';
        for (const cand of latinCandidates) {
            if (typeof cand !== 'string') continue;
            const trimmed = cand.trim();
            if (!trimmed || !script.isLatin(trimmed)) continue;
            latinSrc = script.stripPlaceSuffix(trimmed) || trimmed;
            break;
        }
        if (latinSrc) {
            const translit = transliterateLatinToArabic(latinSrc);
            if (translit && /[؀-ۿ]/.test(translit) && translit.length >= 2) {
                return { value: translit, quality: 'transliterated' };
            }
        }
    }

    // 9. English fallback — for non-AR langs, OR for AR when no Latin
    //    transliteration succeeded above. Refuse non-Latin non-Arabic
    //    values (CJK, Hangul, Cyrillic, …) when serving AR.
    const enCand = (typeof names.en === 'string' && names.en.trim())
        ? names.en.trim()
        : (typeof nd.en === 'string' && nd.en.trim()) ? nd.en.trim() : '';
    if (enCand) {
        if (code !== 'ar' || !script.isNonLatinNonArabic(enCand)) {
            return { value: enCand, quality: 'fallback_en' };
        }
    }
    // 10. Raw OSM name — last resort. For AR, REFUSE to leak CJK /
    //     Hangul / Cyrillic / etc. (returns 'empty' instead so the
    //     caller can filter the result out entirely).
    if (fallbackRawName) {
        const raw = String(fallbackRawName).trim();
        if (code === 'ar' && script.isNonLatinNonArabic(raw)) {
            return { value: '', quality: 'empty' };
        }
        return { value: raw, quality: 'fallback_raw' };
    }
    return { value: '', quality: 'empty' };
}

// Back-compat thin wrapper — returns just the string.
function pickLocalizedDisplay(place, lang, namedetailsByLang, fallbackRawName, countryCode) {
    return pickLocalizedDisplayQ(place, lang, namedetailsByLang, fallbackRawName, countryCode).value;
}

module.exports = {
    SUPPORTED_LANGS,
    pickLocalizedDisplay,
    pickLocalizedDisplayQ,
    extractNamedetailsByLang,
    transliterateLatinToArabic,
    // Re-export country-specific helpers so server.js / tests can reach
    // them via the single entry point if they need to.
    turkish,
    japanese,
    cjk,
    romance,
    script
};
