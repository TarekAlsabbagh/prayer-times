// scripts/_test_place_names_hi_in_1.mjs
//
// PLACE-NAMES-HI-IN-1 verification — all 40 IN curated entries now have
// `names.hi` populated via single Option-A wave (SEED-18 + BATCH-A-22).
//
// Pure offline test against curated-places.json — no server boot needed.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (label, b, extra) => {
    (b ? pass++ : fail++);
    console.log((b ? '  ✓ ' : '  ✗ ') + label + (extra ? '   ' + extra : ''));
};

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' PLACE-NAMES-HI-IN-1 — Hindi enrichment verification (offline)');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('');

const CURATED_PATH = new URL('../db/places/curated-places.json', import.meta.url);
const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));
const inEntries = curated.filter(e => e.countryCode === 'in');

// ─── Devanagari script guard ────────────────────────────────────────────
const HAS_DEVANAGARI = /[ऀ-ॿ]/;
const LATIN          = /[A-Za-z]/;
const BENGALI        = /[ঀ-৿]/;
const ARABIC         = /[؀-ۿ]/;
const TAMIL          = /[஀-௿]/;
const GURMUKHI       = /[਀-੿]/;
const GUJARATI       = /[઀-૿]/;
const TELUGU_KANNADA = /[ఀ-ೞ]/;
const MALAYALAM      = /[ഀ-ൿ]/;

function isCleanHindi(s) {
    if (!s) return false;
    if (LATIN.test(s))           return false;
    if (BENGALI.test(s))         return false;
    if (ARABIC.test(s))          return false;
    if (TAMIL.test(s))           return false;
    if (GURMUKHI.test(s))        return false;
    if (GUJARATI.test(s))        return false;
    if (TELUGU_KANNADA.test(s))  return false;
    if (MALAYALAM.test(s))       return false;
    return HAS_DEVANAGARI.test(s);
}

// ─── Expected canonical Hindi names per place-names-hi-in-1-plan.md §3 ──
const EXPECTED_HI = {
    // SEED-18
    'new-delhi':        'नई दिल्ली',
    'mumbai':           'मुंबई',
    'kolkata':          'कोलकाता',
    'hyderabad-in':     'हैदराबाद',
    'chennai':          'चेन्नई',
    'bengaluru':        'बेंगलुरु',
    'lucknow':          'लखनऊ',
    'ahmedabad':        'अहमदाबाद',
    'pune':             'पुणे',
    'jaipur':           'जयपुर',
    'surat':            'सूरत',
    'kanpur':           'कानपुर',
    'indore':           'इंदौर',
    'nagpur':           'नागपुर',
    'bhopal':           'भोपाल',
    'patna':            'पटना',
    'srinagar':         'श्रीनगर',
    'kochi':            'कोच्चि',
    // BATCH-A-22
    'coimbatore':       'कोयंबटूर',
    'thane':            'ठाणे',
    'vadodara':         'वडोदरा',
    'pimpri-chinchwad': 'पिंपरी-चिंचवाड़',
    'nashik':           'नाशिक',
    'madurai':          'मदुरई',
    'tirunelveli':      'तिरुनेलवेली',
    'agra':             'आगरा',
    'faridabad':        'फ़रीदाबाद',
    'jamshedpur':       'जमशेदपुर',
    'dombivali':        'डोंबिवली',
    'meerut':           'मेरठ',
    'ghaziabad':        'ग़ाज़ियाबाद',
    'dhanbad':          'धनबाद',
    'aurangabad':       'औरंगाबाद',
    'varanasi':         'वाराणसी',
    'amritsar':         'अमृतसर',
    'vijayawada':       'विजयवाड़ा',
    'ranchi':           'राँची',
    'prayagraj':        'प्रयागराज',
    'visakhapatnam':    'विशाखपट्टणम्',
    'jodhpur':          'जोधपुर',
};

// ─── Group 1: Counts ────────────────────────────────────────────────────
console.log('── Group 1: Counts ──');
// Counts updated post ASIA-1D-IN-B-FAST (curated 2528→2558, IN 40→70).
// Hindi coverage applies only to the original 40 cohort (BATCH-B is ar+en only).
ok('Total curated == 2558', curated.length === 2558, '(actual: ' + curated.length + ')');
ok('IN total == 70',         inEntries.length === 70,  '(actual: ' + inEntries.length + ')');
const withHi = inEntries.filter(e => e.names && e.names.hi).length;
ok('IN with names.hi == 40 (HI-IN-1 cohort)', withHi === 40, '(actual: ' + withHi + '/70)');
const withAr = inEntries.filter(e => e.names && e.names.ar).length;
ok('IN with names.ar == 70 (BATCH-B included)', withAr === 70, '(actual: ' + withAr + '/70)');
const withEn = inEntries.filter(e => e.names && e.names.en).length;
ok('IN with names.en == 70 (BATCH-B included)', withEn === 70, '(actual: ' + withEn + '/70)');

// ─── Group 2: Devanagari script guard ───────────────────────────────────
console.log('');
console.log('── Group 2: Devanagari script guard ──');
let scriptFails = 0;
for (const e of inEntries) {
    if (!e.names || !e.names.hi) continue;
    if (!isCleanHindi(e.names.hi)) scriptFails++;
}
ok('All names.hi pass strict Devanagari guard', scriptFails === 0, scriptFails > 0 ? '(' + scriptFails + ' failures)' : '');

let aliasScriptFails = 0;
let aliasCount = 0;
for (const e of inEntries) {
    if (e.aliases && Array.isArray(e.aliases.hi)) {
        for (const a of e.aliases.hi) {
            aliasCount++;
            if (!isCleanHindi(a)) aliasScriptFails++;
        }
    }
}
ok('All aliases.hi pass strict Devanagari guard (' + aliasCount + ' aliases)', aliasScriptFails === 0);

// ─── Group 3: Each canonical Hindi name matches expected ────────────────
console.log('');
console.log('── Group 3: Canonical Hindi names match plan §3 ──');
for (const slug of Object.keys(EXPECTED_HI).sort()) {
    const e = inEntries.find(x => x.slug === slug);
    if (!e) {
        ok('in/' + slug + ' exists', false);
        continue;
    }
    const hi = e.names && e.names.hi;
    ok('in/' + slug.padEnd(20) + ' hi = "' + EXPECTED_HI[slug] + '"', hi === EXPECTED_HI[slug],
       hi === EXPECTED_HI[slug] ? '' : '(actual: "' + hi + '")');
}

// ─── Group 4: SEED-18 must have 11-lang set ar/bn/de/en/es/fr/hi/id/ms/tr/ur ──
console.log('');
console.log('── Group 4: SEED-18 has 11-lang set (10 original + hi) ──');
const SEED_SLUGS = [
    'new-delhi','mumbai','kolkata','hyderabad-in','chennai','bengaluru',
    'lucknow','ahmedabad','pune','jaipur','surat','kanpur','indore',
    'nagpur','bhopal','patna','srinagar','kochi'
];
const EXPECTED_SEED_LANGS = ['ar','bn','de','en','es','fr','hi','id','ms','tr','ur'];
for (const slug of SEED_SLUGS) {
    const e = inEntries.find(x => x.slug === slug);
    if (!e) { ok('in/' + slug + ' exists', false); continue; }
    const langs = Object.keys(e.names || {}).sort();
    ok('in/' + slug.padEnd(20) + ' langs = [' + EXPECTED_SEED_LANGS.join(',') + ']',
       JSON.stringify(langs) === JSON.stringify(EXPECTED_SEED_LANGS),
       JSON.stringify(langs) === JSON.stringify(EXPECTED_SEED_LANGS) ? '' : '(actual: [' + langs.join(',') + '])');
}

// ─── Group 5: BATCH-A-22 contains ar/en/hi (may have additional langs from later waves) ──
// Note: relaxed from strict-equal to set-inclusion to remain stable across
// subsequent UR-IN-1 / BN-IN-1 / TA-IN-1 / MR-IN-1 enrichment waves which
// add more langs to these 22 entries.
console.log('');
console.log('── Group 5: BATCH-A-22 contains ar/en/hi (set-inclusion; tolerates later waves) ──');
const BATCH_SLUGS_22 = [
    'visakhapatnam','vijayawada','varanasi','vadodara','tirunelveli','thane',
    'ranchi','nashik','meerut','madurai','jodhpur','jamshedpur','ghaziabad',
    'faridabad','dombivali','dhanbad','coimbatore','aurangabad','amritsar',
    'prayagraj','agra','pimpri-chinchwad'
];
const REQUIRED_BATCH_LANGS = ['ar','en','hi'];
for (const slug of BATCH_SLUGS_22) {
    const e = inEntries.find(x => x.slug === slug);
    if (!e) { ok('in/' + slug + ' exists', false); continue; }
    const langs = new Set(Object.keys(e.names || {}));
    const missing = REQUIRED_BATCH_LANGS.filter(l => !langs.has(l));
    ok('in/' + slug.padEnd(20) + ' includes [ar,en,hi]',
       missing.length === 0,
       missing.length === 0 ? '' : '(missing: [' + missing.join(',') + '])');
}

// ─── Group 6: No other Indian local langs added to names ────────────────
console.log('');
console.log('── Group 6: No other Indian local langs added ──');
const FORBIDDEN_LANGS = ['ta','mr','te','kn','ml','gu','pa','or','as','sa'];
for (const l of FORBIDDEN_LANGS) {
    const count = inEntries.filter(e => e.names && e.names[l]).length;
    ok('IN entries with names.' + l + ' == 0', count === 0, count > 0 ? '(actual: ' + count + ')' : '');
}

// ─── Group 7: Spot-check key aliases per plan §4 ────────────────────────
console.log('');
console.log('── Group 7: Spot-check key aliases.hi from plan §4 ──');
const REQUIRED_ALIASES = {
    'mumbai':           ['बम्बई', 'ग्रेटर मुम्बई'],
    'kolkata':          ['कलकत्ता'],
    'chennai':          ['मद्रास'],
    'bengaluru':        ['बैंगलोर'],
    'vadodara':         ['बड़ौदा', 'वड़ोदरा'],
    'varanasi':         ['काशी', 'बनारस'],
    'prayagraj':        ['इलाहाबाद'],
    'aurangabad':       ['छत्रपति संभाजीनगर'],
    'coimbatore':       ['कोइंबतूर'],
    'madurai':          ['मदुराई'],
    'tirunelveli':      ['तिरुनलवेली'],
    'meerut':           ['मीरत'],
    'faridabad':        ['फरीदाबाद'],
    'ghaziabad':        ['गाजियाबाद'],
    'pimpri-chinchwad': ['पिंपरी चिंचवड'],
    'visakhapatnam':    ['विज़ाग'],
};
for (const slug of Object.keys(REQUIRED_ALIASES)) {
    const e = inEntries.find(x => x.slug === slug);
    if (!e) { ok('in/' + slug + ' exists', false); continue; }
    const aliases = (e.aliases && Array.isArray(e.aliases.hi)) ? e.aliases.hi : [];
    for (const expectedA of REQUIRED_ALIASES[slug]) {
        ok('in/' + slug.padEnd(20) + ' has alias.hi "' + expectedA + '"',
           aliases.includes(expectedA),
           aliases.includes(expectedA) ? '' : '(actual aliases.hi: ' + JSON.stringify(aliases) + ')');
    }
}

// ─── Final tally ────────────────────────────────────────────────────────
console.log('');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' Results: ' + pass + ' passed, ' + fail + ' failed (' + (pass + fail) + ' total)');
console.log('═══════════════════════════════════════════════════════════════════════');

process.exit(fail === 0 ? 0 : 1);
