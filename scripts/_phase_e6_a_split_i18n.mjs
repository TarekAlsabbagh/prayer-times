// Phase E6-a — i18n Per-Language Split.
//
// Reads js/i18n.js (1.1 MB monolithic, all 10 languages) and emits:
//   • js/i18n-core.js          — shared layer (~20 KiB): functions, constants,
//     defines window.TRANSLATIONS = {}, exposes _initI18nAutoGen() refactored
//     from the original IIFE so it can be invoked AFTER each lang file loads.
//   • js/i18n/{ar,en,fr,tr,ur,de,id,es,bn,ms}.js — per-language (~110 KiB):
//     each sets window.TRANSLATIONS[lang] = {...}, applies the per-lang
//     manual overrides (flag.alt_pattern, tile.title_pattern), and calls
//     _initI18nAutoGen(lang) at the end.
//
// IMPORTANT: js/i18n.js stays UNCHANGED on disk. Node-side server.js
// continues to `require('./js/i18n.js')` for SSR's TRANSLATIONS_BY_LANG.
// Only browser delivery is split (server.js will inject the new <script>
// tags and skip the old monolithic one).
//
// Re-runs idempotent — overwrites the 11 outputs cleanly each time.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER';
const SRC = path.join(ROOT, 'js', 'i18n.js');
const OUT_CORE = path.join(ROOT, 'js', 'i18n-core.js');
const OUT_LANG_DIR = path.join(ROOT, 'js', 'i18n');

const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];

if (!existsSync(OUT_LANG_DIR)) mkdirSync(OUT_LANG_DIR, { recursive: true });

const src = readFileSync(SRC, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// PARSE STRATEGY: line-based + brace depth tracking. The file is hand-written
// (not minified) so this is reliable.
//   Section 1 — preamble (header comment) before `const TRANSLATIONS = {`
//   Section 2 — TRANSLATIONS object: top-level keys are the 10 lang codes
//   Section 3 — post-object overrides (TRANSLATIONS['xx']['key'] = ...)
//   Section 4 — _autoGenPatternedAttrs IIFE (lines 13210-13236)
//   Section 5 — module.exports + helper functions + _detectLang() + t() etc.
// ─────────────────────────────────────────────────────────────────────────────

const lines = src.split(/\r?\n/);
const N = lines.length;

// Find boundaries
let translationsStart = -1;     // line index of "const TRANSLATIONS = {"
let translationsEnd = -1;       // line index of the closing "};" of TRANSLATIONS
let autoGenStart = -1;          // line of "(function _autoGenPatternedAttrs()"
let autoGenEnd = -1;            // line of the IIFE's closing "})();"
let moduleExportStart = -1;     // line of "if (typeof module !== 'undefined'"
let moduleExportEnd = -1;       // line of the closing "}" of that block

for (let i = 0; i < N; i++) {
    const ln = lines[i];
    if (translationsStart === -1 && /^const\s+TRANSLATIONS\s*=\s*\{/.test(ln)) {
        translationsStart = i;
    }
    if (translationsStart !== -1 && translationsEnd === -1 && /^\};?\s*$/.test(ln) && i > translationsStart) {
        // Close of TRANSLATIONS — but only the FIRST top-level "};" after the start
        translationsEnd = i;
    }
    if (autoGenStart === -1 && /\(function\s+_autoGenPatternedAttrs\b/.test(ln)) {
        autoGenStart = i;
    }
    if (autoGenStart !== -1 && autoGenEnd === -1 && i > autoGenStart && /^\}\)\(\);?\s*$/.test(ln)) {
        autoGenEnd = i;
    }
    if (moduleExportStart === -1 && /^if\s*\(typeof\s+module\s*!==\s*['"]undefined['"]/.test(ln)) {
        moduleExportStart = i;
    }
    if (moduleExportStart !== -1 && moduleExportEnd === -1 && i > moduleExportStart && /^\}\s*$/.test(ln)) {
        moduleExportEnd = i;
    }
}

if (translationsStart === -1 || translationsEnd === -1) {
    throw new Error('Could not locate TRANSLATIONS object boundaries');
}
if (autoGenStart === -1 || autoGenEnd === -1) {
    throw new Error('Could not locate _autoGenPatternedAttrs IIFE');
}
// HOME-I18N-CONTENT-FLICKER-FIX-1 (2026-06-13): the module.exports boundary is
// now load-bearing. js/i18n.js accumulated per-lang TRANSLATIONS['xx']['key']=…
// overrides AFTER the autoGen IIFE (zakat/azkar/tasbih content keys added since
// the 2026-05-03 split). Those MUST be routed into the per-lang bundles (they
// reference TRANSLATIONS['xx'] which only exists after the lang file runs), NOT
// dumped into i18n-core.js verbatim — doing so threw "TRANSLATIONS is not
// defined" at core load and broke all i18n. We now collect overrides up to
// moduleExportStart and start the core's post-section AT moduleExportStart.
if (moduleExportStart === -1) {
    throw new Error('Could not locate module.exports boundary (load-bearing for override routing)');
}

console.log(`📍 Boundaries detected:`);
console.log(`   TRANSLATIONS:    line ${translationsStart + 1} → ${translationsEnd + 1}`);
console.log(`   autoGen IIFE:    line ${autoGenStart + 1} → ${autoGenEnd + 1}`);
console.log(`   module.exports:  line ${moduleExportStart + 1} → ${moduleExportEnd + 1}`);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — Identify per-language top-level key boundaries inside TRANSLATIONS
// Inside the object, top-level keys look like:  "    ar: {"  (4 spaces + lang + ': {')
// Their matching "    }," is at the same indent.
// ─────────────────────────────────────────────────────────────────────────────

const langBoundaries = {};
for (let i = translationsStart + 1; i < translationsEnd; i++) {
    const m = lines[i].match(/^    ([a-z]{2}):\s*\{/);
    if (m && LANGS.includes(m[1])) {
        const lang = m[1];
        // Find matching close: scan forward, tracking braces. Start depth at 1.
        let depth = 1;
        let j = i;
        const startCol = lines[i].indexOf('{');
        // Count braces from after the opening one
        let charIdx = startCol + 1;
        while (j < translationsEnd) {
            const text = lines[j].slice(charIdx);
            for (const ch of text) {
                if (ch === '{') depth++;
                else if (ch === '}') {
                    depth--;
                    if (depth === 0) break;
                }
            }
            if (depth === 0) {
                // Found close on this line
                langBoundaries[lang] = { start: i, end: j };
                break;
            }
            j++;
            charIdx = 0;
        }
    }
}

const foundLangs = Object.keys(langBoundaries);
console.log(`📍 Languages detected: ${foundLangs.join(', ')} (${foundLangs.length}/10)`);
if (foundLangs.length !== 10) {
    throw new Error(`Expected 10 languages, found ${foundLangs.length}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — Identify per-language manual overrides between TRANSLATIONS close
// and autoGen IIFE: lines like  TRANSLATIONS['en']['flag.alt_pattern'] = '...';
// ─────────────────────────────────────────────────────────────────────────────

// HOME-I18N-CONTENT-FLICKER-FIX-1: scan BOTH pre-IIFE overrides (flag/tile
// patterns, between TRANSLATIONS close and the autoGen IIFE) AND post-IIFE
// overrides (zakat/azkar/… content keys, between the IIFE and module.exports).
// The `^TRANSLATIONS['xx'][` regex naturally skips the indented IIFE body, so a
// single sweep up to moduleExportStart captures every per-lang override line.
const langOverrides = Object.fromEntries(LANGS.map(l => [l, []]));
for (let i = translationsEnd + 1; i < moduleExportStart; i++) {
    const m = lines[i].match(/^TRANSLATIONS\[['"]([a-z]{2})['"]\]/);
    if (m && LANGS.includes(m[1])) {
        langOverrides[m[1]].push(lines[i]);
    }
}

console.log(`📍 Manual overrides per language:`);
for (const lang of LANGS) {
    console.log(`   ${lang}: ${langOverrides[lang].length} lines`);
}

// ─────────────────────────────────────────────────────────────────────────────
// HEADER COMMENT for generated files
// ─────────────────────────────────────────────────────────────────────────────

const HEADER = (label) => `/*
 * ${label}
 *
 * Auto-generated by scripts/_phase_e6_a_split_i18n.mjs
 * Source: js/i18n.js
 * Generated: ${new Date().toISOString()}
 *
 * DO NOT EDIT BY HAND. To regenerate after editing js/i18n.js, run:
 *   node scripts/_phase_e6_a_split_i18n.mjs
 *
 * Phase E6-a — i18n Per-Language Split.
 * The original js/i18n.js is preserved unchanged for Node-side require()
 * (server.js SSR uses TRANSLATIONS_BY_LANG from the full bundle).
 * Browser delivery now uses i18n-core.js + i18n/{lang}.js (this file).
 */
`;

// ─────────────────────────────────────────────────────────────────────────────
// EMIT i18n/{lang}.js — one file per language
// ─────────────────────────────────────────────────────────────────────────────

let totalLangBytes = 0;
for (const lang of LANGS) {
    const { start, end } = langBoundaries[lang];
    // Body of the lang object: lines from start+1 to end-1 inclusive
    // Reconstruct the dictionary as standalone object literal
    const bodyLines = [];
    for (let k = start + 1; k <= end; k++) {
        bodyLines.push(lines[k]);
    }
    // The last line is the lang's closing "    },"  → drop the trailing comma if present
    let lastLine = bodyLines[bodyLines.length - 1];
    lastLine = lastLine.replace(/^(\s*\}),?\s*$/, '$1');
    bodyLines[bodyLines.length - 1] = lastLine;

    // Override lines with TRANSLATIONS['{lang}']['key'] = val; → window.TRANSLATIONS.{lang}['key'] = val;
    const overrideLines = langOverrides[lang].map(l =>
        l.replace(/^TRANSLATIONS\[/, 'window.TRANSLATIONS[')
    );

    const out = [
        HEADER(`i18n/${lang}.js — language bundle for "${lang}"`),
        `(function() {`,
        `'use strict';`,
        `window.TRANSLATIONS = window.TRANSLATIONS || {};`,
        `window.TRANSLATIONS['${lang}'] = {`,
        ...bodyLines,
        `;`,
        ``,
        `// Manual per-lang overrides (originally between TRANSLATIONS object and _autoGenPatternedAttrs IIFE):`,
        ...overrideLines,
        ``,
        `// Trigger auto-generation of patterned keys (flag.{cc}, tile.{city})`,
        `// for THIS language only. Safe to call multiple times — function is idempotent.`,
        `if (typeof _initI18nAutoGen === 'function') {`,
        `    _initI18nAutoGen('${lang}');`,
        `}`,
        `})();`,
        ``,
    ].join('\n');

    const outPath = path.join(OUT_LANG_DIR, `${lang}.js`);
    writeFileSync(outPath, out);
    const sz = Buffer.byteLength(out, 'utf8');
    totalLangBytes += sz;
    console.log(`✓ Wrote ${lang}.js (${(sz / 1024).toFixed(1)} KiB)`);
}

// ─────────────────────────────────────────────────────────────────────────────
// EMIT i18n-core.js — shared layer
//
// Contents (in order):
//   1. window.TRANSLATIONS = window.TRANSLATIONS || {};   ← placeholder so lang
//      bundles can attach even if loaded BEFORE core (defensive — defer order
//      doesn't always run in parse order across browsers)
//   2. _initI18nAutoGen() — refactored from the IIFE. Iterates ONLY the lang
//      passed in (or all loaded langs if none). Safe to call repeatedly.
//   3. module.exports (Node guard) — kept for compat; Node still uses
//      require('./js/i18n.js') so this is a safety net only.
//   4. Everything from the original after _autoGenPatternedAttrs IIFE:
//      _detectLang(), _lang init, t(), getCurrentLang(), setLanguage(),
//      toggleLanguage(), isRTL(), _stripLangPrefix(), _renderLangSwitcher(),
//      toggleLangMenu(), and any DOMContentLoaded / event listeners.
// ─────────────────────────────────────────────────────────────────────────────

// HOME-I18N-CONTENT-FLICKER-FIX-1: start at moduleExportStart (NOT autoGenEnd+1)
// so the per-lang TRANSLATIONS['xx'] override block between the IIFE and
// module.exports is EXCLUDED from core (it was routed into the lang bundles
// above). Core keeps only module.exports + all functions + initial _lang
// detection. The override region is verified to contain no executable code
// other than overrides/comments/blanks, so nothing core needs is dropped.
const postAutoGen = lines.slice(moduleExportStart).join('\n');

// Build the refactored autoGen function — same logic but parameterized by lang.
const initI18nAutoGenFn = `
// Phase E6-a: refactored from the original IIFE _autoGenPatternedAttrs() so
// per-language bundles can call it AFTER they attach their dict to the global
// TRANSLATIONS object. Iterates only the requested lang (or all loaded langs
// if no arg). Safe to call multiple times — adds keys only if missing.
function _initI18nAutoGen(onlyLang) {
    if (!window.TRANSLATIONS) return;
    const langs = onlyLang ? [onlyLang] : Object.keys(window.TRANSLATIONS);
    for (const lang of langs) {
        const dict = window.TRANSLATIONS[lang];
        if (!dict) continue;
        const flagPat = dict['flag.alt_pattern'];
        const tilePat = dict['tile.title_pattern'];
        for (const key of Object.keys(dict)) {
            const mc = key.match(/^country\\.(.+)$/);
            if (mc && flagPat) {
                const cc = mc[1];
                const flagKey = 'flag.' + cc;
                if (!(flagKey in dict)) {
                    dict[flagKey] = flagPat.replace('{country}', dict[key]);
                }
            }
            const mt = key.match(/^city\\.(.+)$/);
            if (mt && tilePat) {
                const ck = mt[1];
                const tileKey = 'tile.' + ck;
                if (!(tileKey in dict)) {
                    dict[tileKey] = tilePat.replace('{city}', dict[key]);
                }
            }
        }
    }
}
// Expose globally so per-lang bundles can call it.
if (typeof window !== 'undefined') window._initI18nAutoGen = _initI18nAutoGen;
`;

const coreOut = [
    HEADER('i18n-core.js — shared i18n functions + _initI18nAutoGen'),
    `'use strict';`,
    ``,
    `// Placeholder so per-lang bundles can attach even if they load BEFORE core`,
    `// (browser defer order is not strictly guaranteed across <script> tags).`,
    `if (typeof window !== 'undefined') {`,
    `    window.TRANSLATIONS = window.TRANSLATIONS || {};`,
    `}`,
    ``,
    initI18nAutoGenFn,
    ``,
    `// ── Original helpers from js/i18n.js (post-IIFE section) ──`,
    postAutoGen,
].join('\n');

writeFileSync(OUT_CORE, coreOut);
const coreSz = Buffer.byteLength(coreOut, 'utf8');
console.log(`✓ Wrote i18n-core.js (${(coreSz / 1024).toFixed(1)} KiB)`);

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

const srcSz = Buffer.byteLength(src, 'utf8');
const totalNew = totalLangBytes + coreSz;
console.log(`\n📊 Summary:`);
console.log(`   Source i18n.js:    ${(srcSz / 1024).toFixed(1)} KiB`);
console.log(`   Core:              ${(coreSz / 1024).toFixed(1)} KiB`);
console.log(`   All 10 langs:      ${(totalLangBytes / 1024).toFixed(1)} KiB`);
console.log(`   Total new files:   ${(totalNew / 1024).toFixed(1)} KiB`);
console.log(`   Per-page (AR):     ${(coreSz / 1024 + (totalLangBytes / 10) / 1024).toFixed(1)} KiB (core + 1 lang)`);
console.log(`   Per-page (other):  ${(coreSz / 1024 + (totalLangBytes / 10) / 1024 * 2).toFixed(1)} KiB (core + lang + en fallback)`);
console.log(`   Reduction (AR):    ${Math.round((1 - (coreSz + totalLangBytes / 10) / srcSz) * 100)}%`);
console.log(`\n✅ Phase E6-a build complete.`);
