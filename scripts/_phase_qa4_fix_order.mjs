// Phase Q-A4 fix: card builders reference _qaSec2H2/_qaSec3H2/_qaSec4H2 which
// are declared LATER in the same scope (TDZ ReferenceError, swallowed by
// try/catch → entire SSR block silently failed → no qibla-seo HTML output).
//
// Fix: move the wrapper + 4 card builders to AFTER all section dictionaries
// (specifically after _qaSec4P4 declaration), then build _qaSec1Html (the
// wrapper) at the very end. Replace the per-section _qaSec*Html declarations
// with empty strings (already done by Q-A4 PARTs B/C/D).

import { readFileSync, writeFileSync } from 'node:fs';

const SRV_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';
let raw = readFileSync(SRV_PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);

if (/Phase Q-A4 fix-order applied/.test(raw)) {
    throw new Error('[server.js] Q-A4 fix-order already applied');
}

function lfToEol(s) { return isCRLF ? s.replace(/\r?\n/g, '\r\n') : s; }

// Step 1: cut the Q-A4 cards + wrapper block (currently between PART 1.A
// comment and the "// ── Section 2: bearing ──" line).
// Boundaries:
const CUT_START_MARK = lfToEol('                // Phase Q-A4 (2026-05-03): visual redesign — wrapper + grid + cards.\n');
const CUT_END_MARK   = lfToEol("                    + '</section>';\n\n                // ── Section 2: bearing ──\n");

const startIdx = raw.indexOf(CUT_START_MARK);
if (startIdx < 0) throw new Error('Q-A4 start marker not found');
const cutEndStart = raw.indexOf(CUT_END_MARK, startIdx);
if (cutEndStart < 0) throw new Error('Q-A4 end marker not found');
// Keep the "// ── Section 2: bearing ──" line in place — only cut up to the wrapper close + 1 newline
const endIdx = cutEndStart + lfToEol("                    + '</section>';\n\n").length;

const blockToMove = raw.slice(startIdx, endIdx);
console.log(`Cut Q-A4 block: ${blockToMove.length} chars (${blockToMove.split('\n').length} lines)`);

// Remove from current location
raw = raw.slice(0, startIdx) + raw.slice(endIdx);
console.log('✓ Removed Q-A4 cards/wrapper from wrong location (before dicts)');

// Step 2: insert the block AFTER `_qaSec4P4 = { ... };` declaration and
// BEFORE the `// Phase Q-A4: _qaSec4Html removed` comment.
const INSERT_AFTER = lfToEol('                // Phase Q-A4: _qaSec4Html removed — content moved into _qaCard4Html above (H3 + 4 paragraphs).\n');
const insertAfterIdx = raw.indexOf(INSERT_AFTER);
if (insertAfterIdx < 0) throw new Error('Insert anchor (_qaSec4Html removed comment) not found');

// Insert BEFORE that comment
raw = raw.slice(0, insertAfterIdx) + blockToMove + lfToEol('                // Phase Q-A4 fix-order applied: wrapper now built AFTER all section dicts.\n') + raw.slice(insertAfterIdx);
console.log('✓ Inserted Q-A4 cards/wrapper AFTER all section dicts (correct order)');

writeFileSync(SRV_PATH, raw);
console.log('\n✅ Phase Q-A4 fix-order complete. SSR injection should now work.');
