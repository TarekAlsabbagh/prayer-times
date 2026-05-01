// Phase E2-keywords — add `moon.current_month_h2` to all 10 langs.
// This is the client-side fallback text for the static H2 placeholder
// (server.js replaces the text with current month + year on /moon-today
// SSR; this fallback shows if SSR replacement fails OR for client-only
// navigation).
import { readFileSync, writeFileSync } from 'node:fs';

const PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\js/i18n.js';
const raw = readFileSync(PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);
const EOL = isCRLF ? '\r\n' : '\n';
const INDENT = '        ';

// Per-lang text — generic "moon phases this month" wording, since the
// client-side fallback can't know the SSR date. Server-side override
// at server.js (Phase E2-keywords block) replaces with the actual
// month name + year.
const T = {
  ar: 'أطوار القمر خلال هذا الشهر',
  en: 'Moon Phases This Month',
  fr: 'Phases de la Lune ce mois-ci',
  tr: 'Bu Ay Ay Evreleri',
  ur: 'اس مہینے چاند کے مراحل',
  de: 'Mondphasen in diesem Monat',
  id: 'Fase Bulan Bulan Ini',
  es: 'Fases de la Luna este mes',
  bn: 'এই মাসের চাঁদের দশা',
  ms: 'Fasa Bulan Bulan Ini',
};

const langs = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];
const allMatches = [...raw.matchAll(/^[ \t]+'moon\.upcoming\.title': '.*?',[ \t]*$/gm)];
if (allMatches.length !== 10) {
  throw new Error(`Expected 10 'moon.upcoming.title' anchors, got ${allMatches.length}`);
}

let txt = raw;
// Insert from end to start so earlier offsets remain valid.
for (let i = langs.length - 1; i >= 0; i--) {
  const lang = langs[i];
  const m = allMatches[i];
  const matchEnd = m.index + m[0].length;
  // Idempotency
  const after = raw.slice(matchEnd, matchEnd + 200);
  if (/moon\.current_month_h2/.test(after)) {
    throw new Error(`Lang ${lang}: moon.current_month_h2 already exists — script already ran?`);
  }
  const v = T[lang];
  const escaped = v.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const newLine = EOL + INDENT + `'moon.current_month_h2': '${escaped}',`;
  txt = txt.slice(0, matchEnd) + newLine + txt.slice(matchEnd);
  console.log(`✓ Inserted moon.current_month_h2 for lang=${lang}`);
}

writeFileSync(PATH, txt);
console.log(`\n✅ js/i18n.js: 10 entries inserted.`);
