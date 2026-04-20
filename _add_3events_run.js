// Phase 3 runner: generates 3 event HTML blocks and injects i18n keys
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const INDEX_HTML = path.join(ROOT, 'index.html');
const I18N_JS = path.join(ROOT, 'js', 'i18n.js');

const { EVENTS, TR, generateHtmlBlock } = require('./_add_3events.js');

const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];

// ========================================================================
// (1) index.html — insert 3 new event HTML blocks after Ramadan block
// ========================================================================
function injectHtmlBlocks() {
    let html = fs.readFileSync(INDEX_HTML, 'utf8');

    // Idempotency check: abort if any new block already exists
    for (const ev of EVENTS) {
        if (html.indexOf(`id="${ev.pageId}"`) !== -1) {
            console.log(`[skip] ${ev.id} block already in index.html`);
            return 0;
        }
    }

    // Extract Ramadan block — from '<div class="page countdown-page cd-ramadan"'
    // up to its matching closing </div>. The block is well-defined here because
    // Ramadan is a discrete <div class="page ..."> section.
    const startMarker = '<div class="page countdown-page cd-ramadan" id="page-ramadan-countdown">';
    const startIdx = html.indexOf(startMarker);
    if (startIdx === -1) throw new Error('Ramadan page block not found in index.html');

    // Find the matching closing </div> by counting nested <div>.
    let depth = 0;
    let i = startIdx;
    let blockEnd = -1;
    const divOpenRe = /<div\b/g;
    const divCloseRe = /<\/div>/g;
    // Scan from startIdx
    let cur = startIdx;
    while (cur < html.length) {
        divOpenRe.lastIndex = cur;
        divCloseRe.lastIndex = cur;
        const openM = divOpenRe.exec(html);
        const closeM = divCloseRe.exec(html);
        if (!closeM) break;
        if (openM && openM.index < closeM.index) {
            depth++;
            cur = openM.index + 4;
        } else {
            depth--;
            cur = closeM.index + 6;
            if (depth === 0) {
                blockEnd = cur;
                break;
            }
        }
    }
    if (blockEnd === -1) throw new Error('Could not find matching </div> for Ramadan block');

    const ramadanBlock = html.slice(startIdx, blockEnd);
    console.log(`[extract] Ramadan block: ${ramadanBlock.length} chars`);

    // Generate 3 new blocks
    const newBlocks = EVENTS.map(ev => {
        const generated = generateHtmlBlock(ev, ramadanBlock);
        console.log(`[gen] ${ev.id} block: ${generated.length} chars`);
        return generated;
    });

    // Insert after Ramadan block with comment headers
    const indent = '            ';
    const insertion = newBlocks.map((block, i) => {
        const ev = EVENTS[i];
        return `\n\n${indent}<!-- ========= صفحة العدّ التنازليّ لـ ${ev.id} ========= -->\n${indent}${block}`;
    }).join('');

    const newHtml = html.slice(0, blockEnd) + insertion + html.slice(blockEnd);
    fs.writeFileSync(INDEX_HTML, newHtml, 'utf8');
    console.log(`[write] index.html updated: +${insertion.length} chars`);
    return 1;
}

// ========================================================================
// (2) js/i18n.js — inject 3 event translation blocks into each language
// ========================================================================
function serializeKeys(obj) {
    const lines = [];
    for (const [k, v] of Object.entries(obj)) {
        // Escape backslash and single-quote for JS string literal
        const esc = String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        lines.push(`        '${k}': '${esc}',`);
    }
    return lines.join('\n');
}

function injectI18n() {
    let src = fs.readFileSync(I18N_JS, 'utf8');

    // Idempotency check — if any of the new namespaces exist, abort
    if (src.indexOf("'eid_fitr.h1':") !== -1 ||
        src.indexOf("'eid_adha.h1':") !== -1 ||
        src.indexOf("'hijri_ny.h1':") !== -1) {
        console.log('[skip] i18n.js already contains new event keys');
        return 0;
    }

    // For each language, find the 'ramadan.link_hijri_today' line and append new blocks right after it.
    // Pattern: the line starts with 8 spaces + 'ramadan.link_hijri_today': ... ,\n
    // We'll match from start-of-line to the trailing comma+newline.
    const anchorRe = /^(\s*'ramadan\.link_hijri_today':\s*'[^']*',\s*\n)/gm;

    let insertions = 0;
    src = src.replace(anchorRe, (match) => {
        // determine language position by counting how many times we've matched
        const lang = LANGS[insertions];
        insertions++;
        if (!lang) return match;

        const parts = [
            `        // ─── eid_fitr (${lang}) ───\n` + serializeKeys(TR['eid-al-fitr'][lang] || {}),
            `        // ─── eid_adha (${lang}) ───\n` + serializeKeys(TR['eid-al-adha'][lang] || {}),
            `        // ─── hijri_ny (${lang}) ───\n` + serializeKeys(TR['hijri-new-year'][lang] || {}),
        ];
        return match + parts.join('\n') + '\n';
    });

    if (insertions !== LANGS.length) {
        console.log(`[warn] expected ${LANGS.length} i18n insertions, performed ${insertions}`);
    }

    fs.writeFileSync(I18N_JS, src, 'utf8');
    console.log(`[write] js/i18n.js updated: ${insertions} language blocks`);
    return 1;
}

// ========================================================================
// (3) Bump versions
// ========================================================================
function bumpVersions() {
    // index.html: js/app.js?v=299 → v300 ; js/i18n.js?v=103 → v104
    let html = fs.readFileSync(INDEX_HTML, 'utf8');
    const before = html;
    html = html.replace(/js\/app\.js\?v=299/g, 'js/app.js?v=300');
    html = html.replace(/js\/i18n\.js\?v=103/g, 'js/i18n.js?v=104');
    if (html !== before) {
        fs.writeFileSync(INDEX_HTML, html, 'utf8');
        console.log('[bump] index.html: app.js v299→v300, i18n.js v103→v104');
    }

    // sw.js: precache URLs + CACHE_VERSION v109 → v110
    let sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
    const swBefore = sw;
    sw = sw.replace(/CACHE_VERSION = 'v109'/, "CACHE_VERSION = 'v110'");
    sw = sw.replace(/js\/app\.js\?v=299/g, 'js/app.js?v=300');
    sw = sw.replace(/js\/i18n\.js\?v=103/g, 'js/i18n.js?v=104');
    if (sw !== swBefore) {
        fs.writeFileSync(path.join(ROOT, 'sw.js'), sw, 'utf8');
        console.log('[bump] sw.js: CACHE v109→v110, app.js v299→v300, i18n.js v103→v104');
    }
}

// ========================================================================
// Main
// ========================================================================
try {
    injectHtmlBlocks();
    injectI18n();
    bumpVersions();
    console.log('\n[done] Phase 3 injection complete');
} catch (err) {
    console.error('[error]', err.message);
    console.error(err.stack);
    process.exit(1);
}
