// scripts/_test_place_names_bn_in_1.mjs
//
// PLACE-NAMES-BN-IN-1 verification — 22 IN BATCH-A entries now have
// `names.bn` populated via Option-A single wave (SEED-18 untouched).
//
// Pure offline test against curated-places.json — no server boot needed.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (label, b, extra) => {
    (b ? pass++ : fail++);
    console.log((b ? '  ✓ ' : '  ✗ ') + label + (extra ? '   ' + extra : ''));
};

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' PLACE-NAMES-BN-IN-1 — Bengali enrichment verification (offline)');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('');

const CURATED_PATH = new URL('../db/places/curated-places.json', import.meta.url);
const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));
const inEntries = curated.filter(e => e.countryCode === 'in');

// ─── Bengali script guard ────────────────────────────────────────────────
const BENGALI_BLOCK    = /[ঀ-৿]/;
const ASSAMESE_ONLY    = /[ৰৱ]/;
const LATIN            = /[A-Za-z]/;
const DEVANAGARI       = /[ऀ-ॿ]/;
const ARABIC           = /[؀-ۿ]/;
const TAMIL            = /[஀-௿]/;
const GURMUKHI         = /[਀-੿]/;
const GUJARATI         = /[઀-૿]/;
const TELUGU_KANNADA   = /[ఀ-ೞ]/;
const MALAYALAM        = /[ഀ-ൿ]/;

function isCleanBengali(s) {
    if (!s) return false;
    if (LATIN.test(s))          return false;
    if (DEVANAGARI.test(s))     return false;
    if (ARABIC.test(s))         return false;
    if (TAMIL.test(s))          return false;
    if (GURMUKHI.test(s))       return false;
    if (GUJARATI.test(s))       return false;
    if (TELUGU_KANNADA.test(s)) return false;
    if (MALAYALAM.test(s))      return false;
    if (ASSAMESE_ONLY.test(s))  return false;
    return BENGALI_BLOCK.test(s);
}

// ─── Expected canonical Bengali names per plan §3 ────────────────────────
const EXPECTED_BN = {
    // BATCH-A-22
    'coimbatore':       'কোয়েম্বাটুর',
    'thane':            'থানে',
    'vadodara':         'বড়োদরা',
    'pimpri-chinchwad': 'পিম্পরি-চিঞ্চওয়াড়',
    'nashik':           'নাশিক',
    'madurai':          'মাদুরাই',
    'tirunelveli':      'তিরুনেলভেলি',
    'agra':             'আগ্রা',
    'faridabad':        'ফরিদাবাদ',
    'jamshedpur':       'জামশেদপুর',
    'dombivali':        'দোম্বিভলি',
    'meerut':           'মেরঠ',
    'ghaziabad':        'গাজিয়াবাদ',
    'dhanbad':          'ধানবাদ',
    'aurangabad':       'আওরঙ্গাবাদ',
    'varanasi':         'বারাণসী',
    'amritsar':         'অমৃতসর',
    'vijayawada':       'বিজয়ওয়াড়া',
    'ranchi':           'রাঁচি',
    'prayagraj':        'প্রয়াগরাজ',
    'visakhapatnam':    'বিশাখাপত্তনম',
    'jodhpur':          'যোধপুর',
};

// ─── SEED-18 Bengali names that MUST remain byte-identical ───────────────
const SEED_18_BN = {
    'new-delhi':    'দিল্লি',
    'mumbai':       'মুম্বই',
    'kolkata':      'কলকাতা',
    'hyderabad-in': 'হায়দরাবাদ',
    'chennai':      'চেন্নাই',
    'bengaluru':    'বেঙ্গালুরু',
    'lucknow':      'লখনউ',
    'ahmedabad':    'আহমেদাবাদ',
    'pune':         'পুনে',
    'jaipur':       'জয়পুর',
    'surat':        'সুরাট',
    'kanpur':       'কানপুর',
    'indore':       'ইন্দোর',
    'nagpur':       'নাগপুর',
    'bhopal':       'ভোপাল',
    'patna':        'পাটনা',
    'srinagar':     'শ্রীনগর',
    'kochi':        'কোচি',
};

// ─── Group 1: Counts ────────────────────────────────────────────────────
console.log('── Group 1: Counts ──');
ok('Total curated == 2528', curated.length === 2528, '(actual: ' + curated.length + ')');
ok('IN total == 40',         inEntries.length === 40,  '(actual: ' + inEntries.length + ')');
const withBn = inEntries.filter(e => e.names && e.names.bn).length;
ok('IN with names.bn == 40', withBn === 40, '(actual: ' + withBn + '/40)');
const withAr = inEntries.filter(e => e.names && e.names.ar).length;
ok('IN with names.ar == 40 (unchanged)', withAr === 40);
const withEn = inEntries.filter(e => e.names && e.names.en).length;
ok('IN with names.en == 40 (unchanged)', withEn === 40);
const withHi = inEntries.filter(e => e.names && e.names.hi).length;
ok('IN with names.hi == 40 (unchanged)', withHi === 40);
const withUr = inEntries.filter(e => e.names && e.names.ur).length;
ok('IN with names.ur == 40 (unchanged)', withUr === 40);

// ─── Group 2: Bengali script guard ──────────────────────────────────────
console.log('');
console.log('── Group 2: Bengali script guard ──');
let scriptFails = 0;
for (const e of inEntries) {
    if (!e.names || !e.names.bn) continue;
    if (!isCleanBengali(e.names.bn)) scriptFails++;
}
ok('All names.bn pass strict Bengali guard', scriptFails === 0);

let aliasScriptFails = 0;
let aliasCount = 0;
for (const e of inEntries) {
    if (e.aliases && Array.isArray(e.aliases.bn)) {
        for (const a of e.aliases.bn) {
            aliasCount++;
            if (!isCleanBengali(a)) aliasScriptFails++;
        }
    }
}
ok('All aliases.bn pass strict Bengali guard (' + aliasCount + ' aliases)', aliasScriptFails === 0);

// ─── Group 3: BATCH-A-22 canonical Bengali names ─────────────────────────
console.log('');
console.log('── Group 3: BATCH-A-22 canonical Bengali names match plan §3 ──');
for (const slug of Object.keys(EXPECTED_BN).sort()) {
    const e = inEntries.find(x => x.slug === slug);
    if (!e) { ok('in/' + slug + ' exists', false); continue; }
    const bn = e.names && e.names.bn;
    ok('in/' + slug.padEnd(20) + ' bn = "' + EXPECTED_BN[slug] + '"', bn === EXPECTED_BN[slug],
       bn === EXPECTED_BN[slug] ? '' : '(actual: "' + bn + '")');
}

// ─── Group 4: SEED-18 names.bn byte-identical ───────────────────────────
console.log('');
console.log('── Group 4: SEED-18 names.bn preserved byte-identically ──');
for (const slug of Object.keys(SEED_18_BN).sort()) {
    const e = inEntries.find(x => x.slug === slug);
    if (!e) { ok('in/' + slug + ' exists', false); continue; }
    const bn = e.names && e.names.bn;
    ok('in/' + slug.padEnd(20) + ' SEED bn = "' + SEED_18_BN[slug] + '"', bn === SEED_18_BN[slug],
       bn === SEED_18_BN[slug] ? '' : '(actual: "' + bn + '")');
}

// ─── Group 5: SEED-18 lang set unchanged (11-lang) ───────────────────────
console.log('');
console.log('── Group 5: SEED-18 has 11-lang set (unchanged from HI/UR waves) ──');
const EXPECTED_SEED_LANGS = ['ar','bn','de','en','es','fr','hi','id','ms','tr','ur'];
for (const slug of Object.keys(SEED_18_BN).sort()) {
    const e = inEntries.find(x => x.slug === slug);
    if (!e) { ok('in/' + slug + ' exists', false); continue; }
    const langs = Object.keys(e.names || {}).sort();
    ok('in/' + slug.padEnd(20) + ' langs = 11-lang set',
       JSON.stringify(langs) === JSON.stringify(EXPECTED_SEED_LANGS),
       JSON.stringify(langs) === JSON.stringify(EXPECTED_SEED_LANGS) ? '' : '(actual: [' + langs.join(',') + '])');
}

// ─── Group 6: BATCH-A-22 has 5-lang set (ar/en/hi/ur + new bn) ──────────
console.log('');
console.log('── Group 6: BATCH-A-22 has 5-lang set (ar/bn/en/hi/ur) ──');
const EXPECTED_BATCH_LANGS = ['ar','bn','en','hi','ur'];
for (const slug of Object.keys(EXPECTED_BN).sort()) {
    const e = inEntries.find(x => x.slug === slug);
    if (!e) { ok('in/' + slug + ' exists', false); continue; }
    const langs = Object.keys(e.names || {}).sort();
    ok('in/' + slug.padEnd(20) + ' langs = [ar,bn,en,hi,ur]',
       JSON.stringify(langs) === JSON.stringify(EXPECTED_BATCH_LANGS),
       JSON.stringify(langs) === JSON.stringify(EXPECTED_BATCH_LANGS) ? '' : '(actual: [' + langs.join(',') + '])');
}

// ─── Group 7: No other Indian local langs added ─────────────────────────
console.log('');
console.log('── Group 7: No other Indian local langs added ──');
const FORBIDDEN_LANGS = ['ta','mr','te','kn','ml','gu','pa','or','as','sa'];
for (const l of FORBIDDEN_LANGS) {
    const count = inEntries.filter(e => e.names && e.names[l]).length;
    ok('IN entries with names.' + l + ' == 0', count === 0);
}

// ─── Group 8: Spot-check required aliases.bn from plan §4 ───────────────
console.log('');
console.log('── Group 8: Spot-check required aliases.bn from plan §4 ──');
const REQUIRED_ALIASES = {
    'visakhapatnam':    ['ভাইজাগ', 'বিশাখাপত্তম'],
    'varanasi':         ['বেনারস', 'কাশী'],
    'vadodara':         ['বরোদা'],
    'meerut':           ['মীরুট'],
    'jamshedpur':       ['জমশেদপুর'],
    'ghaziabad':        ['ঘাজিয়াবাদ'],
    'coimbatore':       ['কোভাই'],
    'aurangabad':       ['ছত্রপতি সম্ভাজীনগর'],
    'prayagraj':        ['এলাহাবাদ'],
};
for (const slug of Object.keys(REQUIRED_ALIASES)) {
    const e = inEntries.find(x => x.slug === slug);
    if (!e) { ok('in/' + slug + ' exists', false); continue; }
    const aliases = (e.aliases && Array.isArray(e.aliases.bn)) ? e.aliases.bn : [];
    for (const expectedA of REQUIRED_ALIASES[slug]) {
        ok('in/' + slug.padEnd(20) + ' has alias.bn "' + expectedA + '"',
           aliases.includes(expectedA),
           aliases.includes(expectedA) ? '' : '(actual aliases.bn: ' + JSON.stringify(aliases) + ')');
    }
}

// ─── Group 9: No Devanagari/Arabic/Tamil/Assamese-only contamination ────
console.log('');
console.log('── Group 9: No Devanagari/Arabic/Assamese-only contamination in names.bn or aliases.bn ──');
let contaminations = 0;
for (const e of inEntries) {
    const bn = e.names && e.names.bn;
    if (bn && (DEVANAGARI.test(bn) || ARABIC.test(bn) || ASSAMESE_ONLY.test(bn))) {
        contaminations++;
        console.log('  ✗ in/' + e.slug + ' names.bn has contamination: ' + bn);
    }
    const aliases = (e.aliases && Array.isArray(e.aliases.bn)) ? e.aliases.bn : [];
    for (const a of aliases) {
        if (DEVANAGARI.test(a) || ARABIC.test(a) || ASSAMESE_ONLY.test(a)) {
            contaminations++;
            console.log('  ✗ in/' + e.slug + ' aliases.bn has contamination: ' + a);
        }
    }
}
ok('No script contamination', contaminations === 0);

// ─── Group 10: SEED-18 aliases.bn unchanged ─────────────────────────────
console.log('');
console.log('── Group 10: SEED-18 aliases.bn unchanged (preserve pre-existing) ──');
const SEED_PRE_ALIASES_BN = {
    'new-delhi':    ['দিল্লি'],
    'kolkata':      ['কলকাতা'],
};
for (const [slug, expectedAliases] of Object.entries(SEED_PRE_ALIASES_BN)) {
    const e = inEntries.find(x => x.slug === slug);
    if (!e) { ok('in/' + slug + ' exists', false); continue; }
    const aliases = (e.aliases && Array.isArray(e.aliases.bn)) ? e.aliases.bn : [];
    ok('in/' + slug.padEnd(20) + ' SEED aliases.bn = ' + JSON.stringify(expectedAliases),
       JSON.stringify(aliases) === JSON.stringify(expectedAliases),
       JSON.stringify(aliases) === JSON.stringify(expectedAliases) ? '' : '(actual: ' + JSON.stringify(aliases) + ')');
}

// ─── Final tally ────────────────────────────────────────────────────────
console.log('');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' Results: ' + pass + ' passed, ' + fail + ' failed (' + (pass + fail) + ' total)');
console.log('═══════════════════════════════════════════════════════════════════════');

process.exit(fail === 0 ? 0 : 1);
