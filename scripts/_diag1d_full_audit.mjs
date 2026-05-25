#!/usr/bin/env node
/**
 * CONTENT-HYDRATION-FLICKER-DIAG-1-D — comprehensive scan
 *
 * Scans `index.html` for every `data-i18n="KEY">TEXT</tag>` site (text-
 * content i18n binding only, NOT title/aria-label/placeholder), looks up
 * the AR value of KEY in `js/i18n.js`, and reports every case where
 * HTML literal text != AR i18n value byte-for-byte. Those are the
 * visible-flicker sources on the AR homepage / sidebar / shared shell.
 *
 * Output: TSV to stdout — one row per mismatch:
 *   <line>\t<key>\t<html_text>\t<ar_value>\t<notes>
 * Trailer rows: TOTAL_HTML_BINDINGS, TOTAL_AR_KEYS, MATCHES, MISMATCHES,
 *               MISSING_AR_KEYS (i18n key referenced in HTML but absent
 *               from the AR block).
 *
 * Read-only. Does NOT modify any file.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const HTML_PATH = resolve(ROOT, 'index.html');
const I18N_PATH = resolve(ROOT, 'js/i18n.js');

// ---- 1. Extract AR i18n values ------------------------------------------
//
// i18n.js layout: a top-level TRANSLATIONS-like object whose `ar:` block
// runs from the first AR entry (around line 7) until the EN block starts
// (around line 1494). Each entry is a single-line string literal:
//     'key': 'value',
//     "key": "value",
//
// We tag each AR-block line and then collect 'key': 'value' pairs.
// The first hit at or below the 'ar:' marker starts the block; the first
// 'en:' marker ends it.
const i18nSrc = readFileSync(I18N_PATH, 'utf8').split(/\r?\n/);

function findBlockBounds(lines, langKey) {
    // matches:  ar: {   OR  'ar': {  OR  "ar": {
    const startRe = new RegExp(`(?:^|[\\s,])(?:'|")?${langKey}(?:'|")?\\s*:\\s*\\{`);
    let start = -1;
    for (let i = 0; i < lines.length; i++) {
        if (startRe.test(lines[i])) { start = i; break; }
    }
    if (start < 0) return null;
    // Walk forward, tracking brace depth, to find the matching close brace.
    let depth = 0;
    let opened = false;
    for (let i = start; i < lines.length; i++) {
        for (const ch of lines[i]) {
            if (ch === '{') { depth++; opened = true; }
            else if (ch === '}') { depth--; if (opened && depth === 0) return [start, i]; }
        }
    }
    return null;
}

const arBounds = findBlockBounds(i18nSrc, 'ar');
if (!arBounds) { console.error('[FATAL] could not locate ar: { } block in js/i18n.js'); process.exit(2); }

const arMap = new Map();   // key -> { value, line }
// Match both single-quote and double-quote string literals on either side
// (be conservative: only single-line entries, comma-terminated).
const kvRe = /(?:['"])([A-Za-z][\w.\-]+)(?:['"])\s*:\s*(['"])((?:\\.|(?!\2)[^\\])*)\2\s*,?\s*$/;
for (let i = arBounds[0] + 1; i < arBounds[1]; i++) {
    const line = i18nSrc[i].trim();
    if (!line || line.startsWith('//') || line.startsWith('/*')) continue;
    const m = line.match(kvRe);
    if (m) {
        const key = m[1];
        let value = m[3];
        // unescape common JS string escapes that may appear in the i18n values
        value = value.replace(/\\n/g, '\n').replace(/\\t/g, '\t')
                     .replace(/\\u([0-9a-fA-F]{4})/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)))
                     .replace(/\\(['"\\])/g, '$1');
        if (!arMap.has(key)) arMap.set(key, { value, line: i + 1 });
    }
}

// ---- 2. Extract HTML data-i18n bindings ---------------------------------
//
// We match the simple, common case the project uses everywhere:
//     <tag ... data-i18n="KEY" ...>TEXT</tag>
// where TEXT contains no '<' (i.e. no nested element). That covers all
// the sidebar/qa-card/mit-/h1/p/span sites in this codebase.
const html = readFileSync(HTML_PATH, 'utf8');
const htmlLines = html.split(/\r?\n/);

// Build a quick line lookup by character offset so we can report line nums.
const lineStarts = [0];
for (let i = 0; i < html.length; i++) {
    if (html[i] === '\n') lineStarts.push(i + 1);
}
function lineOf(offset) {
    // binary search
    let lo = 0, hi = lineStarts.length - 1;
    while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (lineStarts[mid] <= offset) lo = mid; else hi = mid - 1;
    }
    return lo + 1;
}

const bindingRe = /<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\bdata-i18n="([A-Za-z][\w.\-]+)"[^>]*>([^<]*)<\/\1>/g;
const bindings = [];   // { line, tag, key, htmlText }
let m;
while ((m = bindingRe.exec(html)) !== null) {
    bindings.push({
        line: lineOf(m.index),
        tag: m[1],
        key: m[2],
        htmlText: m[3].trim(),
    });
}

// ---- 3. Compare ---------------------------------------------------------
let matches = 0;
let mismatches = [];
let missingAr = [];

for (const b of bindings) {
    if (!arMap.has(b.key)) {
        missingAr.push(b);
        continue;
    }
    const ar = arMap.get(b.key).value.trim();
    if (b.htmlText === ar) {
        matches++;
    } else {
        mismatches.push({
            ...b,
            ar,
            arLine: arMap.get(b.key).line,
            // Quick diff helpers
            htmlLen: [...b.htmlText].length,
            arLen: [...ar].length,
            sameAfterStrip: stripShaddasAndTatweels(b.htmlText) === stripShaddasAndTatweels(ar),
        });
    }
}

function stripShaddasAndTatweels(s) {
    return s.replace(/[ـً-ٰٟ]/g, '');
}

// ---- 4. Report ----------------------------------------------------------
const HEADER = ['html_line', 'tag', 'key', 'html_text', 'ar_value', 'html_cp', 'ar_cp', 'diacritics_only', 'ar_line'];
console.log(HEADER.join('\t'));
for (const m of mismatches) {
    console.log([
        m.line, m.tag, m.key,
        JSON.stringify(m.htmlText),
        JSON.stringify(m.ar),
        m.htmlLen, m.arLen,
        m.sameAfterStrip ? 'Y' : 'N',
        m.arLine,
    ].join('\t'));
}
console.log('');
console.log(`# TOTAL_HTML_BINDINGS  ${bindings.length}`);
console.log(`# TOTAL_AR_KEYS_PARSED ${arMap.size}`);
console.log(`# MATCHES              ${matches}`);
console.log(`# MISMATCHES           ${mismatches.length}`);
console.log(`# MISMATCHES_DIACRITICS_ONLY ${mismatches.filter(m => m.sameAfterStrip).length}`);
console.log(`# MISMATCHES_TEXTUAL   ${mismatches.filter(m => !m.sameAfterStrip).length}`);
console.log(`# MISSING_AR_KEYS      ${missingAr.length}`);
if (missingAr.length) {
    console.log('');
    console.log('# Bindings whose key has NO AR entry (binder falls back silently):');
    for (const b of missingAr) console.log(`#   line ${b.line}  ${b.tag}  ${b.key}  ${JSON.stringify(b.htmlText)}`);
}
