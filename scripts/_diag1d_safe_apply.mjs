#!/usr/bin/env node
/**
 * CONTENT-HYDRATION-FLICKER-DIAG-1-D — classify + apply SAFE alignments
 *
 * Reads index.html and js/i18n.js, finds every `<tag data-i18n="key">TEXT</tag>`
 * mismatch with the AR i18n value, classifies each into one of:
 *
 *   D       — diacritics/tatweel-only diff (shadda, sukun, fatha, ...).
 *             Same text after diacritic stripping → SAFE to align (visually
 *             invisible, no SEO impact, no layout change).
 *
 *   T       — textual diff that is "safe": no template `{...}`, no leading
 *             emoji in either side, length ratio between 0.7 and 1.4, no
 *             digit substitution (i18n outdated vs HTML).
 *
 *   TPL     — AR contains `{placeholder}`. SKIP — aligning HTML to a
 *             template literal would expose `{city}` in SSR output.
 *
 *   EMO     — AR starts (or differs by) a leading non-letter glyph (emoji,
 *             icon char). SKIP — would add decoration to SSR; user must
 *             decide whether to accept.
 *
 *   SEM     — Length-ratio out of band OR digits differ. SKIP — likely
 *             semantic difference (one side outdated or hardcoded).
 *
 * Modes:
 *   (default)        — print TSV preview of D + T items.
 *   --apply          — print preview, then mutate index.html in-place,
 *                       byte-for-byte aligning each safe binding.
 *   --json           — print full classification as JSON.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const HTML_PATH = resolve(ROOT, 'index.html');
const I18N_PATH = resolve(ROOT, 'js/i18n.js');

const MODE = process.argv.includes('--apply') ? 'apply'
           : process.argv.includes('--json')  ? 'json'
           : 'preview';

// ──────────────────────────────────────────────────────────────────────────
// 1. Extract AR i18n values (same logic as _diag1d_full_audit.mjs)
// ──────────────────────────────────────────────────────────────────────────
const i18nSrc = readFileSync(I18N_PATH, 'utf8').split(/\r?\n/);

function findBlockBounds(lines, langKey) {
    const startRe = new RegExp(`(?:^|[\\s,])(?:'|")?${langKey}(?:'|")?\\s*:\\s*\\{`);
    let start = -1;
    for (let i = 0; i < lines.length; i++) {
        if (startRe.test(lines[i])) { start = i; break; }
    }
    if (start < 0) return null;
    let depth = 0; let opened = false;
    for (let i = start; i < lines.length; i++) {
        for (const ch of lines[i]) {
            if (ch === '{') { depth++; opened = true; }
            else if (ch === '}') { depth--; if (opened && depth === 0) return [start, i]; }
        }
    }
    return null;
}

const arBounds = findBlockBounds(i18nSrc, 'ar');
if (!arBounds) { console.error('[FATAL] could not locate ar: { } block'); process.exit(2); }

const arMap = new Map();
const kvRe = /(?:['"])([A-Za-z][\w.\-]+)(?:['"])\s*:\s*(['"])((?:\\.|(?!\2)[^\\])*)\2\s*,?\s*$/;
for (let i = arBounds[0] + 1; i < arBounds[1]; i++) {
    const line = i18nSrc[i].trim();
    if (!line || line.startsWith('//')) continue;
    const m = line.match(kvRe);
    if (m) {
        let value = m[3]
            .replace(/\\n/g, '\n').replace(/\\t/g, '\t')
            .replace(/\\u([0-9a-fA-F]{4})/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)))
            .replace(/\\(['"\\])/g, '$1');
        if (!arMap.has(m[1])) arMap.set(m[1], { value, line: i + 1 });
    }
}

// ──────────────────────────────────────────────────────────────────────────
// 2. Extract HTML data-i18n text bindings
// ──────────────────────────────────────────────────────────────────────────
const htmlRaw = readFileSync(HTML_PATH, 'utf8');
const lineStarts = [0];
for (let i = 0; i < htmlRaw.length; i++) {
    if (htmlRaw[i] === '\n') lineStarts.push(i + 1);
}
function lineOf(offset) {
    let lo = 0, hi = lineStarts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1;
        if (lineStarts[mid] <= offset) lo = mid; else hi = mid - 1; }
    return lo + 1;
}

const bindingRe = /<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\bdata-i18n="([A-Za-z][\w.\-]+)"[^>]*>([^<]*)<\/\1>/g;
const bindings = [];
let m;
while ((m = bindingRe.exec(htmlRaw)) !== null) {
    bindings.push({
        offset: m.index,
        full: m[0],
        line: lineOf(m.index),
        tag: m[1],
        key: m[2],
        htmlText: m[3].trim(),
        htmlTextRaw: m[3], // exact text incl. surrounding whitespace
    });
}

// ──────────────────────────────────────────────────────────────────────────
// 3. Classify each mismatch
// ──────────────────────────────────────────────────────────────────────────
// Arabic harakat range U+064B..U+0652 + shadda U+0651 + dagger alif U+0670
// + tatweel U+0640. We strip these for D-bucket detection.
const HARAKAT_RE = /[ـً-ٰٟ]/g;
const stripDiacritics = s => s.replace(HARAKAT_RE, '');

// "Leading emoji" detector: first non-whitespace char is outside Arabic +
// Latin + Common-punctuation + digits.
const ARABIC = /[؀-ۿ]/;
const LATIN  = /[A-Za-z]/;
const ASCII_DIGIT = /[0-9]/;
const ARABIC_DIGIT = /[٠-٩]/;
function firstSignificantChar(s) {
    const t = s.replace(/^\s+/, '');
    return [...t][0] || '';
}
function looksLikeDecorativePrefix(c) {
    if (!c) return false;
    if (ARABIC.test(c) || LATIN.test(c) || ASCII_DIGIT.test(c) || ARABIC_DIGIT.test(c)) return false;
    // common punctuation that should NOT count: " ' « » ( ) [ ] — – : , .
    if (/["'«»()\[\]—–:,.!?؟،;…«»]/.test(c)) return false;
    return true;
}

function classify(b, ar) {
    if (b.htmlText === ar) return { bucket: 'MATCH' };

    if (stripDiacritics(b.htmlText) === stripDiacritics(ar)) {
        return { bucket: 'D' };
    }

    // Templates with placeholders {x} on either side
    if (/\{[a-zA-Z][\w]*\}/.test(ar) || /\{[a-zA-Z][\w]*\}/.test(b.htmlText)) {
        return { bucket: 'TPL' };
    }

    // Leading decorative char (emoji/icon) on one side only
    const arFirst = firstSignificantChar(ar);
    const htmlFirst = firstSignificantChar(b.htmlText);
    const arHasLead = looksLikeDecorativePrefix(arFirst);
    const htmlHasLead = looksLikeDecorativePrefix(htmlFirst);
    if (arHasLead !== htmlHasLead) {
        return { bucket: 'EMO' };
    }
    // Trailing decorative-only diff: e.g. AR ends with "▶ تجربة" vs "تجربة"
    // Detect by stripping leading/trailing non-Arabic/Latin/digit chars.
    const stripDecor = s => s.replace(/^[^؀-ۿA-Za-z0-9]+/, '').replace(/[^؀-ۿA-Za-z0-9]+$/, '');
    if (stripDecor(b.htmlText) === stripDecor(ar) && stripDecor(ar).length > 0) {
        // pure decorative-glyph diff
        return { bucket: 'EMO' };
    }

    // Digit substitution suggests outdated i18n (e.g. "10 أذكار" vs "25 ذكرًا")
    const htmlDigits = (b.htmlText.match(/[0-9٠-٩]+/g) || []).join(',');
    const arDigits   = (ar.match(/[0-9٠-٩]+/g) || []).join(',');
    if (htmlDigits !== arDigits && (htmlDigits || arDigits)) {
        return { bucket: 'SEM', reason: 'digit-mismatch' };
    }

    // Large length divergence → semantic mismatch
    const htmlLen = [...b.htmlText].length;
    const arLen   = [...ar].length;
    const ratio = Math.min(htmlLen, arLen) / Math.max(htmlLen, arLen);
    if (ratio < 0.7) {
        return { bucket: 'SEM', reason: 'length-ratio<0.7' };
    }

    return { bucket: 'T' };
}

const classified = [];
for (const b of bindings) {
    if (!arMap.has(b.key)) {
        classified.push({ ...b, bucket: 'MISSING_AR' });
        continue;
    }
    const ar = arMap.get(b.key).value.trim();
    const c = classify(b, ar);
    classified.push({ ...b, ar, arLine: arMap.get(b.key).line, ...c });
}

const safe = classified.filter(x => x.bucket === 'D' || x.bucket === 'T');
const buckets = ['D', 'T', 'TPL', 'EMO', 'SEM', 'MISSING_AR', 'MATCH'];
const counts = Object.fromEntries(buckets.map(b => [b, classified.filter(x => x.bucket === b).length]));

// ──────────────────────────────────────────────────────────────────────────
// 4. Output / apply
// ──────────────────────────────────────────────────────────────────────────
if (MODE === 'json') {
    process.stdout.write(JSON.stringify({ counts, safe, classified }, null, 2));
    process.exit(0);
}

// Preview always printed in both preview and apply mode
console.log('# Mismatch classification summary:');
for (const b of buckets) console.log(`#   ${b.padEnd(11)} = ${counts[b]}`);
console.log(`# Total to apply (D + T) = ${safe.length}`);
console.log('#');
console.log('# Preview (D + T only) — html_line  bucket  key  HTML -> AR  (file=index.html)');
for (const s of safe) {
    console.log(`#   L${String(s.line).padStart(4)}  ${s.bucket}  ${s.key.padEnd(40)}  ${JSON.stringify(s.htmlText)}  →  ${JSON.stringify(s.ar)}`);
}

if (MODE !== 'apply') process.exit(0);

// Apply: rewrite index.html with byte-for-byte AR alignment for each safe item.
// We replace the FULL binding (`<tag ... data-i18n="key" ...>TEXT</tag>`)
// in-place. To stay safe against duplicate identical strings, we use the
// exact `full` substring captured by the regex earlier, with a sanity guard
// that the replacement occurs exactly once per binding.
console.log('#');
console.log('# Applying...');
let out = htmlRaw;
let applied = 0;
let dupes   = 0;
let missing = 0;
// Sort by offset descending so earlier replacements don't shift later ones
const sortedSafe = [...safe].sort((a, b) => b.offset - a.offset);
for (const s of sortedSafe) {
    const oldFull = s.full;
    // Replace only the htmlText inside the binding, preserving attribute
    // order + spacing exactly.
    const idx = oldFull.lastIndexOf('>' + s.htmlTextRaw + '</' + s.tag + '>');
    if (idx < 0) {
        // Fall back: search for the text segment after the first '>'
        missing++;
        continue;
    }
    const newFull = oldFull.slice(0, idx) + '>' + s.ar + '</' + s.tag + '>';
    // Replace in the global output. Make sure we hit exactly the one at
    // the recorded offset to handle accidental duplicates.
    const before = out.slice(0, s.offset);
    const at     = out.slice(s.offset, s.offset + oldFull.length);
    const after  = out.slice(s.offset + oldFull.length);
    if (at !== oldFull) {
        // Offsets shifted due to prior edits (shouldn't happen since we go
        // back-to-front), or someone else modified the file. Fall back to
        // a global single-occurrence replace.
        const occurrences = out.split(oldFull).length - 1;
        if (occurrences === 1) {
            out = out.replace(oldFull, newFull);
            applied++;
        } else {
            dupes++;
        }
        continue;
    }
    out = before + newFull + after;
    applied++;
}
writeFileSync(HTML_PATH, out);
console.log(`# Applied: ${applied} / ${safe.length}`);
console.log(`# Skipped (offset-shift duplicates): ${dupes}`);
console.log(`# Skipped (string-not-found): ${missing}`);
