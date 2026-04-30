// Phase D3.3a fix — replace double-backslash u2019 (\\u2019) with single
// backslash (’) in i18n.js. Single-backslash form is the correct
// JS escape sequence for the Unicode apostrophe ’.
import { readFileSync, writeFileSync } from 'node:fs';

const PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\js/i18n.js';
const raw = readFileSync(PATH, 'utf8');

const BS = String.fromCharCode(92);
const seq2 = BS + BS + 'u2019';   // "\\u2019" — 7 chars
const seq1 = BS + 'u2019';        // "’"  — 6 chars

const before = (raw.match(new RegExp(BS + BS + BS + BS + 'u2019', 'g')) || []).length;
console.log('Buggy occurrences before fix:', before);

const fixed = raw.split(seq2).join(seq1);

const after = (fixed.match(new RegExp(BS + BS + BS + BS + 'u2019', 'g')) || []).length;
console.log('Buggy occurrences after fix:', after);

if (after !== 0) {
  throw new Error('Fix incomplete: still ' + after + ' buggy occurrences');
}

writeFileSync(PATH, fixed);
console.log('✅ Fixed', before, 'occurrences. js/i18n.js updated.');
