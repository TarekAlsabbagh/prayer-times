// Phase D3.1.2 audit: parse js/i18n.js to extract moon.edu_* values per language
// and identify which (lang,key) pairs equal the English value (de-facto fallback).
import fs from 'fs';
const txt = fs.readFileSync('js/i18n.js', 'utf8');

// js/i18n.js has separate language sections. Each section has a header that looks like:
//   const ar = { ... };   OR   ar: { ... }   OR similar.
// To avoid wrestling with eval, we'll find each language's region by anchoring on
// the first occurrence of 'moon.edu_title' in each section, scanning ~3000 lines
// from each, and parsing the values as JSON-ish strings.
//
// Simpler: find ALL occurrences of moon.edu_* and group by index — each "group of 20"
// near each other belongs to one language section. We then map sections to langs by
// scanning a window before the first key for the lang code marker.

// Pull out each `'moon.edu_KEY': 'VALUE',` pair with line index.
const re = /['"](moon\.edu_[a-zA-Z0-9_.]+)['"]\s*:\s*((?:'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`))/g;
const occ = [];
let m;
while ((m = re.exec(txt)) !== null) {
  occ.push({ idx: m.index, key: m[1], rawValue: m[2] });
}

// Group consecutive occurrences (~20 per lang). Boundaries: gap > 5000 chars between
// successive matches likely means new lang section. Then assign lang via lookup of
// nearest 'ar:'/'en:'/'fr:' etc. preceding the first match in the group.
const groups = [];
let cur = [];
for (let i = 0; i < occ.length; i++) {
  if (cur.length === 0) cur.push(occ[i]);
  else {
    const gap = occ[i].idx - occ[i-1].idx;
    if (gap > 8000) { groups.push(cur); cur = [occ[i]]; }
    else cur.push(occ[i]);
  }
}
if (cur.length) groups.push(cur);

// Identify lang for each group by scanning text BEFORE the group's first occurrence
// for the closest lang section header. Look for patterns like:
//   const ar = {   OR   "ar": {   OR   ar: {
const langOf = (anchor) => {
  // scan back up to 50000 chars for `const XX =` or `XX:` where XX is a known lang
  const back = txt.substring(Math.max(0, anchor - 60000), anchor);
  const langs = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];
  // Find the LAST occurrence of any of `<lang>:\s*\{` or `const <lang>` or `window\.I18N\.<lang>\s*=`
  let best = null;
  for (const L of langs) {
    const pat = new RegExp(`(?:^|[\\s,({])(?:const\\s+|window\\.I18N\\.|"|')(?:${L})(?:'?|"?)\\s*(?:=\\s*\\{|:\\s*\\{)`, 'g');
    let mm;
    while ((mm = pat.exec(back)) !== null) {
      if (!best || mm.index > best.pos) best = { pos: mm.index, lang: L };
    }
  }
  return best ? best.lang : '?';
};

const byLang = {};
for (const g of groups) {
  const lang = langOf(g[0].idx);
  if (!byLang[lang]) byLang[lang] = {};
  for (const it of g) byLang[lang][it.key] = it.rawValue;
}

console.log('Languages detected:', Object.keys(byLang).join(', '));
console.log('Keys per language:');
for (const L of Object.keys(byLang)) {
  console.log(`  ${L}: ${Object.keys(byLang[L]).length}`);
}

// Build the matrix. Use ar/en values as references.
const allKeys = new Set();
for (const L of Object.keys(byLang)) for (const k of Object.keys(byLang[L])) allKeys.add(k);
const KEYS = [...allKeys].sort();
const LANGS = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];

console.log('\n## Key presence matrix (✓ present, ✗ missing, = identical to en)');
console.log('| Key | ' + LANGS.join(' | ') + ' |');
console.log('|---' + LANGS.map(()=>'|---').join('') + '|');
const issuesByLang = Object.fromEntries(LANGS.map(l => [l, { missing: [], identical_en: [] }]));
for (const key of KEYS) {
  const enVal = byLang.en?.[key];
  const cells = LANGS.map(L => {
    const v = byLang[L]?.[key];
    if (!v) { issuesByLang[L].missing.push(key); return '✗'; }
    if (L !== 'en' && v === enVal) { issuesByLang[L].identical_en.push(key); return '='; }
    return '✓';
  });
  console.log(`| ${key} | ${cells.join(' | ')} |`);
}

// Summary table
console.log('\n## Per-lang summary');
console.log('| Lang | Total | Localized | Missing | Identical to EN |');
console.log('|---|---:|---:|---:|---:|');
for (const L of LANGS) {
  const total = KEYS.length;
  const missing = issuesByLang[L].missing.length;
  const ident = issuesByLang[L].identical_en.length;
  const localized = total - missing - ident;
  console.log(`| ${L} | ${total} | ${localized} | ${missing} | ${ident} |`);
}

// Show which keys are identical to EN per lang (these are the ones to translate)
console.log('\n## Keys to translate (identical to EN — de-facto fallback)');
for (const L of LANGS) {
  if (L === 'en') continue;
  const list = issuesByLang[L].identical_en;
  if (!list.length) { console.log(`  ${L}: ✓ none`); continue; }
  console.log(`  ${L} (${list.length}):`);
  for (const k of list) console.log(`    ${k} = ${byLang[L][k].slice(0, 80)}`);
}
