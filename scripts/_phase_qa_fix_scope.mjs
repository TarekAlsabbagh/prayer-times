// Phase Q-A scope fix: the Q-A SSR injection was placed INSIDE the
// `if (seo.moonCity)` block (server.js:8586-9669), so it never runs on qibla
// pages (which don't have seo.moonCity set). This script:
//   1. Cuts the Q-A block from its current wrong location (after M1)
//   2. Re-inserts it AFTER the seo.moonCity closing brace at line 9669
// Net result: Q-A block runs on every page where seo.qiblaRef is set,
// regardless of whether seo.moonCity exists.

import { readFileSync, writeFileSync } from 'node:fs';

const SRV_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';
let raw = readFileSync(SRV_PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);

if (/Phase Q-A scope fix v2/.test(raw)) {
    throw new Error('[server.js] Q-A scope fix already applied');
}

function lfToEol(s) { return isCRLF ? s.replace(/\r?\n/g, '\r\n') : s; }

// Find Q-A block boundaries — extract entire block (including the comment header
// and the catch+closing brace).
// Anchor markers (unique strings):
const START_MARK = lfToEol('        // ── Phase Q-A (2026-05-03): qibla-in-{city} SEO cleanup ──\n');
const END_MARK = lfToEol("            } catch (_e) { /* silent — Q-A SSR injection optional, page still serves */ }\n        }\n");

const startIdx = raw.indexOf(START_MARK);
if (startIdx < 0) throw new Error('Q-A start marker not found');
const endMarkIdx = raw.indexOf(END_MARK, startIdx);
if (endMarkIdx < 0) throw new Error('Q-A end marker not found');
const endIdx = endMarkIdx + END_MARK.length;

// The block to move
const qaBlock = raw.slice(startIdx, endIdx);
console.log(`Q-A block: ${qaBlock.length} chars (${qaBlock.split('\n').length} lines)`);

// Step 1: remove Q-A block from current wrong location (also remove the blank lines around it)
const PRE_BLANK = lfToEol('\n\n');
const POST_BLANK = lfToEol('\n\n');
let preBlankStart = startIdx;
// Walk back to consume preceding blank lines (preserve the M1 `}` line)
while (preBlankStart > 0 && raw[preBlankStart - 1] === '\n') preBlankStart--;
// Don't remove the newline after M1's `}` — keep one separator
if (raw.slice(preBlankStart, startIdx).length > 1) {
    // We'll keep just one blank line as separator
}
const removeStart = preBlankStart;
let removeEnd = endIdx;
while (raw[removeEnd] === '\n') removeEnd++;
const replacementSeparator = lfToEol('\n\n\n');
raw = raw.slice(0, removeStart) + replacementSeparator + raw.slice(removeEnd);
console.log(`✓ Removed Q-A block from wrong location (between M1 and 18-A)`);

// Step 2: find the seo.moonCity closing brace and insert Q-A block AFTER it
// The closing brace is the line `    }` (4 spaces + `}`) followed by `\n\n    // 5h)`.
// To find it precisely, anchor on the unique nearby comment "5h) SSR لصفحة القمر العامّة /moon-today".
const ANCHOR_5H = lfToEol('    // 5h) SSR لصفحة القمر العامّة /moon-today (بدون مدينة) — H1 و intro بلا placeholders\n');
const anchor5hIdx = raw.indexOf(ANCHOR_5H);
if (anchor5hIdx < 0) throw new Error('5h anchor not found');

// Walk back from anchor5hIdx to find the closing `}` of seo.moonCity, then insert before the blank line.
// Pattern just before 5h: "    }\n\n" where `    }` closes seo.moonCity.
const PRECEDING_CLOSE = lfToEol('    }\n\n');
const closeIdx = raw.lastIndexOf(PRECEDING_CLOSE, anchor5hIdx);
if (closeIdx < 0 || closeIdx > anchor5hIdx) throw new Error('seo.moonCity closing brace not found before 5h');

// Insert Q-A block AFTER the closing brace `    }` and the blank line, BEFORE 5h comment
const insertPos = closeIdx + PRECEDING_CLOSE.length;
// Compose the Q-A block with a marker comment + trailing separator
const newQaWithMarker = lfToEol('    // ── Phase Q-A (2026-05-03) — scope fix v2: moved OUT of seo.moonCity gate ──\n')
    + qaBlock
    + lfToEol('\n');
raw = raw.slice(0, insertPos) + newQaWithMarker + raw.slice(insertPos);
console.log(`✓ Inserted Q-A block AFTER seo.moonCity closing brace, BEFORE 5h section`);

writeFileSync(SRV_PATH, raw);
console.log('\n✅ Phase Q-A scope fix complete.');
console.log('Q-A block now runs on every page where seo.qiblaRef is set.');
