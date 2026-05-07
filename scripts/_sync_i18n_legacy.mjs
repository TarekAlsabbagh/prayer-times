// Hotfix sync: copy 9 keys × 10 langs from js/i18n/{lang}.js bundles into the
// legacy js/i18n.js dictionary that server.js reads at boot for SSR
// translation. Without this sync, /en /fr /tr /ur etc. show Arabic text for
// any data-i18n key added only to the per-lang bundles (e.g.
// footer.popular_cities_intro, footer.svc_*_desc, the rewritten
// faq.home.q1/a1/q2/a2).
//
// Strategy: regex-extract each key's literal value (preserving quotes +
// escapes) from each per-lang bundle, then regex-replace the matching key
// in js/i18n.js inside that lang's TRANSLATIONS sub-block. Runs once,
// idempotent (re-running with same source → same output).

import { readFileSync, writeFileSync } from 'node:fs';

const LANGS = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];
const KEYS = [
  'faq.home.q1', 'faq.home.a1', 'faq.home.q2', 'faq.home.a2',
  'footer.popular_cities_intro',
  'footer.link_hijri_today', 'footer.link_hijri_year',
  'footer.link_date_converter', 'footer.link_tasbih',
  'footer.svc_hijri_today_desc', 'footer.svc_hijri_year_desc',
  'footer.svc_date_converter_desc', 'footer.svc_tasbih_desc',
  // Phase HC-9 (2026-05-06): added with the 3 short intros + FAQ Q7.
  'home.arab_countries_intro',
  'home.popular_cities_intro_long',
  'home.services_intro'
];

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Build a regex that matches ` 'key': 'value',` where value can contain escaped chars.
// We capture the entire literal (with surrounding quotes) so we can paste it as-is.
function valueLiteralRe(key) {
  const k = escRe(key);
  return new RegExp(`'${k}'\\s*:\\s*('(?:[^'\\\\]|\\\\.)*')`, 'g');
}

// Read each per-lang bundle and extract key → literal value
const valuesByLang = {};
for (const L of LANGS) {
  const src = readFileSync(`js/i18n/${L}.js`, 'utf8');
  valuesByLang[L] = {};
  for (const k of KEYS) {
    const m = valueLiteralRe(k).exec(src);
    if (m) valuesByLang[L][k] = m[1];
  }
}

console.log('Source (per-lang bundles) — keys found:');
for (const L of LANGS) {
  console.log(`  ${L}: ${Object.keys(valuesByLang[L]).length}/${KEYS.length}`);
}

// Now patch js/i18n.js. The file has 10 lang blocks (TRANSLATIONS.ar,
// TRANSLATIONS.en, …). Each block starts with `LANG_CODE: {` and ends at
// the matching `}`. We split by lang block, patch each, rejoin.
//
// Simpler approach: for each lang, find the lang block bounds via the
// lang-key marker (e.g. `'home.tagline':` strings are unique-per-lang), then
// inside that block do per-key replace OR insert.

const I18N_PATH = 'js/i18n.js';
let src = readFileSync(I18N_PATH, 'utf8');
let totalReplaced = 0, totalInserted = 0;

// We use the unique anchor `'footer.popular_cities':` (which exists in EVERY
// lang block) to locate each lang block's region. Find all 10 occurrences.
const anchorRe = /'footer\.popular_cities'\s*:\s*'/g;
const anchors = [];
let m;
while ((m = anchorRe.exec(src)) !== null) anchors.push(m.index);
if (anchors.length !== LANGS.length) {
  console.error(`FATAL: expected ${LANGS.length} anchor matches, found ${anchors.length}`);
  process.exit(1);
}

// Anchors appear in lang order (assuming i18n.js orders lang blocks in the
// canonical order ar, en, fr, tr, ur, de, id, es, bn, ms).
// We'll process from LAST to FIRST so earlier offsets don't shift.
for (let li = LANGS.length - 1; li >= 0; li--) {
  const L = LANGS[li];
  const blockStart = anchors[li];
  // Block ends at the next lang's anchor OR end of file
  const blockEnd = (li + 1 < LANGS.length) ? anchors[li + 1] : src.length;
  let block = src.slice(blockStart, blockEnd);
  const before = block.length;

  for (const k of KEYS) {
    const newVal = valuesByLang[L][k];
    if (!newVal) continue;
    const escK = escRe(k);
    const reReplace = new RegExp(`('${escK}'\\s*:\\s*)'(?:[^'\\\\]|\\\\.)*'`);
    if (reReplace.test(block)) {
      // Replace existing
      block = block.replace(reReplace, `$1${newVal}`);
      totalReplaced++;
    } else {
      // Insert after the popular_cities anchor (close to where we want)
      block = block.replace(
        /('footer\.popular_cities'\s*:\s*'(?:[^'\\]|\\.)*',)/,
        `$1\n        '${k}': ${newVal},`
      );
      totalInserted++;
    }
  }

  src = src.slice(0, blockStart) + block + src.slice(blockEnd);
  console.log(`  ${L}: block patched (Δ ${block.length - before} chars)`);
}

writeFileSync(I18N_PATH, src);
console.log(`\n✅ Updated ${I18N_PATH}: ${totalReplaced} replaced + ${totalInserted} inserted = ${totalReplaced + totalInserted} total edits.`);
