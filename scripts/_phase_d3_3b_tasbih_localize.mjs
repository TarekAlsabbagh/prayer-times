// Phase D3.3b — Tasbih sequence localization (3 phrases × 10 langs).
// Adds tasbih.subhanallah / tasbih.alhamdulillah / tasbih.allahu_akbar
// to js/i18n.js (anchor: 'tasbih.free_unit', the last existing tasbih key
// per lang). Then refactors js/app.js: TASBIH_SEQUENCE / TASBIH_SEQUENCE_EN
// (hardcoded ar/en-only) → getTasbihSequence() now reads from t() with a
// safe AR fallback (so that any single missing key falls back to AR phrase,
// never to English literal).
//
// Aborts on any anchor mismatch.

import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\';

// ─────────────────────────────────────────────────────────────
// Translation table (3 phrases × 10 langs)
// ─────────────────────────────────────────────────────────────
const T = {
  ar: { sub: 'سبحان الله',         alh: 'الحمد لله',          akb: 'الله أكبر' },
  en: { sub: 'Subhanallah',        alh: 'Alhamdulillah',      akb: 'Allahu Akbar' },
  fr: { sub: 'Subhanallah',        alh: 'Alhamdulillah',      akb: 'Allahu Akbar' },
  tr: { sub: 'Sübhanallah',        alh: 'Elhamdülillah',      akb: 'Allahu Ekber' },
  ur: { sub: 'سبحان اللہ',          alh: 'الحمد للہ',           akb: 'اللہ اکبر' },
  de: { sub: 'Subhanallah',        alh: 'Alhamdulillah',      akb: 'Allahu Akbar' },
  id: { sub: 'Subhanallah',        alh: 'Alhamdulillah',      akb: 'Allahu Akbar' },
  es: { sub: 'Subhanallah',        alh: 'Alhamdulillah',      akb: 'Allahu Akbar' },
  bn: { sub: 'সুবহানাল্লাহ',         alh: 'আলহামদুলিল্লাহ',         akb: 'আল্লাহু আকবার' },
  ms: { sub: 'Subhanallah',        alh: 'Alhamdulillah',      akb: 'Allahu Akbar' },
};

// ─────────────────────────────────────────────────────────────
// 1. js/i18n.js — insert 3 new keys per lang after 'tasbih.free_unit'
// ─────────────────────────────────────────────────────────────
{
  const PATH = ROOT + 'js/i18n.js';
  const raw = readFileSync(PATH, 'utf8');
  const isCRLF = /\r\n/.test(raw);
  const EOL = isCRLF ? '\r\n' : '\n';
  const INDENT = '        ';

  // Find each lang's tasbih.free_unit line (one per lang = 10 total)
  const allMatches = [...raw.matchAll(/^[ \t]+'tasbih\.free_unit': '[^']*',[ \t]*$/gm)];
  if (allMatches.length !== 10) {
    throw new Error(`Expected 10 tasbih.free_unit anchors, got ${allMatches.length}`);
  }

  const fileLangOrder = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];
  let txt = raw;
  // Insert from end to start so earlier offsets stay valid.
  for (let i = fileLangOrder.length - 1; i >= 0; i--) {
    const lang = fileLangOrder[i];
    const m = allMatches[i];
    const tr = T[lang];
    const matchEnd = m.index + m[0].length;

    // Idempotency: skip if already inserted
    const after = raw.slice(matchEnd, matchEnd + 80);
    if (/tasbih\.subhanallah/.test(after)) {
      throw new Error(`Lang ${lang}: tasbih.subhanallah already exists — script already ran?`);
    }

    const escape = s => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const block = EOL +
      INDENT + `'tasbih.subhanallah': '${escape(tr.sub)}',` + EOL +
      INDENT + `'tasbih.alhamdulillah': '${escape(tr.alh)}',` + EOL +
      INDENT + `'tasbih.allahu_akbar': '${escape(tr.akb)}',`;

    // Insert AFTER the matched line (matchEnd points to start of next char,
    // which is the EOL char; skip it so we land at start of next line)
    let insertAt = matchEnd;
    if (txt[insertAt] === '\r') insertAt++;
    if (txt[insertAt] === '\n') insertAt++;
    // Now insertAt is the start of the line AFTER tasbih.free_unit.
    // We want our block to come BEFORE that line, so just inject `block` at
    // matchEnd (after the line ending of tasbih.free_unit), but our block
    // already starts with EOL — so prepending it at matchEnd produces the
    // correct layout.
    txt = txt.slice(0, matchEnd) + block + txt.slice(matchEnd);
    console.log(`✓ Inserted 3 keys for lang=${lang}`);
  }

  writeFileSync(PATH, txt);
  console.log(`✅ js/i18n.js: 30 new entries inserted (3 phrases × 10 langs)`);
}

// ─────────────────────────────────────────────────────────────
// 2. js/app.js — refactor TASBIH_SEQUENCE / getTasbihSequence
// ─────────────────────────────────────────────────────────────
{
  const PATH = ROOT + 'js/app.js';
  const raw = readFileSync(PATH, 'utf8');
  const isCRLF = /\r\n/.test(raw);
  const EOL = isCRLF ? '\r\n' : '\n';

  // Old block
  const oldBlock =
`// ========= المسبحة الإلكترونية =========
const TASBIH_SEQUENCE    = ['سبحان الله', 'الحمد لله', 'الله أكبر'];
const TASBIH_SEQUENCE_EN = ['Subhan Allah', 'Alhamdulillah', 'Allahu Akbar'];
function getTasbihSequence() {
    return (typeof getCurrentLang === 'function' && getCurrentLang() === 'en')
        ? TASBIH_SEQUENCE_EN : TASBIH_SEQUENCE;
}`;

  // New block — t() based with AR ultimate fallback per phrase.
  // Using t() means each phrase falls through the i18n lookup chain:
  //   t() → I18N[lang][key] → I18N.en[key] → I18N.ar[key] → key string
  // We added the keys for all 10 langs, so the lookup hits the correct
  // localized form on first try. AR fallback in the JS itself protects
  // against any future i18n.js corruption / single-key delete.
  const newBlock =
`// ========= المسبحة الإلكترونية =========
// Phase D3.3b — sequence localized for 10 langs via i18n keys
//   tasbih.subhanallah / tasbih.alhamdulillah / tasbih.allahu_akbar
// AR phrases retained as ultimate JS fallback per item.
const _TASBIH_FALLBACK_AR = ['سبحان الله', 'الحمد لله', 'الله أكبر'];
function getTasbihSequence() {
    const _t = (typeof t === 'function') ? t : null;
    if (!_t) return _TASBIH_FALLBACK_AR.slice();
    const out = [
        _t('tasbih.subhanallah')   || _TASBIH_FALLBACK_AR[0],
        _t('tasbih.alhamdulillah') || _TASBIH_FALLBACK_AR[1],
        _t('tasbih.allahu_akbar')  || _TASBIH_FALLBACK_AR[2],
    ];
    return out;
}`;

  function replaceExact(text, name, oldChunk, newChunk) {
    const isCRLF2 = /\r\n/.test(text);
    if (isCRLF2) {
      oldChunk = oldChunk.replace(/\r?\n/g, '\r\n');
      newChunk = newChunk.replace(/\r?\n/g, '\r\n');
    } else {
      oldChunk = oldChunk.replace(/\r\n/g, '\n');
      newChunk = newChunk.replace(/\r\n/g, '\n');
    }
    const cnt = text.split(oldChunk).length - 1;
    if (cnt !== 1) throw new Error(`${name}: expected 1 match, got ${cnt}`);
    return text.replace(oldChunk, newChunk);
  }

  let txt = replaceExact(raw, 'app.js TASBIH_SEQUENCE refactor', oldBlock, newBlock);
  writeFileSync(PATH, txt);
  console.log('✅ js/app.js: TASBIH_SEQUENCE refactored to t()-based 10-lang lookup');
}

console.log('\n✅ Phase D3.3b — Tasbih sequence localization complete.');
console.log('   Next: bump asset versions, restart preview, verify 8 langs.');
