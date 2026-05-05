// SITE-CLS-Audit / Static SSR-empty element scanner
// Finds DOM elements in index.html that are EMPTY in SSR but get populated
// by JS later (the Q-Hub-H pattern). Maps each to its parent SPA page
// (#page-qibla, #page-moon, etc.) and flags the filling JS function.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const HTML_PATH = path.join(ROOT, 'index.html');
const APP_JS_PATH = path.join(ROOT, 'js', 'app.js');

const html = fs.readFileSync(HTML_PATH, 'utf8');
const appJs = fs.readFileSync(APP_JS_PATH, 'utf8');

// ── 1) Find empty elements (id="X"></tagName>) in index.html ──
//    Pattern: <tag id="ID" ...></tag> with NO content between open/close.

const EMPTY_ELEMENT_RE = /<(h1|h2|h3|h4|p|ul|ol|div|span|section|article)\s+([^>]*?)id="([^"]+)"([^>]*)>\s*<\/\1>/g;

const findings = [];
let m;
while ((m = EMPTY_ELEMENT_RE.exec(html)) !== null) {
    const tag = m[1];
    const beforeId = m[2];
    const id = m[3];
    const afterId = m[4];
    const fullAttrs = (beforeId + ' id="' + id + '"' + afterId).trim();
    const lineNumber = html.slice(0, m.index).split('\n').length;

    // Determine parent #page-X by walking back to nearest <div class="page" id="page-X">
    const before = html.slice(0, m.index);
    const lastPageMatch = [...before.matchAll(/<div\s+class="page"\s+id="(page-[a-z-]+)"/g)].pop();
    const parentPage = lastPageMatch ? lastPageMatch[1] : '(global)';

    findings.push({
        tag,
        id,
        line: lineNumber,
        attrs: fullAttrs.substring(0, 120),
        parentPage,
        hasSsrMarker: fullAttrs.includes('data-qhh-ssr="1"'),
        hasHidden: /\bhidden(?=\s|>|$)/.test(fullAttrs),
        hasDataI18n: fullAttrs.includes('data-i18n='),
    });
}

// Dedupe duplicates that may match overlapping regex
const seen = new Set();
const unique = [];
for (const f of findings) {
    const key = `${f.id}::${f.line}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(f);
}

// ── 2) For each empty element, find the JS function that fills it ──

function findFillingCallSite(id) {
    const calls = [];
    // Match: getElementById('ID') or querySelector('#ID') or getElementById("ID")
    const reGet = new RegExp(`(?:getElementById|querySelector)\\s*\\(\\s*["'#]?${id.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}["']`, 'g');
    let mm;
    while ((mm = reGet.exec(appJs)) !== null) {
        const lineNumber = appJs.slice(0, mm.index).split('\n').length;
        // Look ahead for innerHTML or textContent assignment in next ~500 chars
        const lookahead = appJs.slice(mm.index, mm.index + 600);
        const isWrite = /\.(innerHTML|textContent|appendChild|outerHTML)\s*=/.test(lookahead) || /\.appendChild\(/.test(lookahead);
        if (isWrite) {
            // Find enclosing function name
            const before = appJs.slice(0, mm.index);
            const funcMatch = before.match(/function\s+(\w+)\s*\([^)]*\)\s*\{[\s\S]*$/);
            calls.push({
                line: lineNumber,
                func: funcMatch ? funcMatch[1] : '(anonymous)',
            });
        }
    }
    return calls;
}

const enriched = unique.map(f => ({
    ...f,
    fillers: findFillingCallSite(f.id),
}));

// ── 3) Estimate above-the-fold position by parent page ──

const FOLD_PRIORITY = {
    'page-prayer-times': 'HIGH',
    'page-qibla': 'HIGH',
    'page-moon': 'HIGH',
    'page-hijri-today': 'HIGH',
    'page-tasbih': 'HIGH',
    'page-zakat': 'HIGH',
    'page-azkar': 'HIGH',
    'page-duas': 'HIGH',
    'page-date-converter': 'MEDIUM',
    'page-hijri-day': 'HIGH',
    'page-hijri-month': 'MEDIUM',
    'page-hijri-year': 'MEDIUM',
};

// Filter: only keep elements with at least one filler AND no SSR marker
//         AND not hidden (hidden elements don't cause CLS until revealed,
//         which is its own issue tracked separately).
const flagged = enriched
    .filter(f => f.fillers.length > 0)
    .filter(f => !f.hasSsrMarker)
    .map(f => ({
        ...f,
        priority: FOLD_PRIORITY[f.parentPage] || 'LOW',
    }));

// ── 4) Group by parent page ──

const byPage = {};
for (const f of flagged) {
    if (!byPage[f.parentPage]) byPage[f.parentPage] = [];
    byPage[f.parentPage].push(f);
}

// ── 5) Output ──

const summary = {
    timestamp: new Date().toISOString(),
    total: flagged.length,
    totalScanned: enriched.length,
    skippedAlreadyMarked: enriched.filter(f => f.hasSsrMarker).length,
    skippedNoFiller: enriched.filter(f => f.fillers.length === 0).length,
    byPage,
};

const outJson = path.join(ROOT, 'audit-reports', 'ssr-empty-elements.json');
fs.writeFileSync(outJson, JSON.stringify(summary, null, 2), 'utf8');

console.log('=== SITE-CLS-Audit / SSR-empty element scanner ===');
console.log(`Total empty-tag matches: ${enriched.length}`);
console.log(`  - With SSR marker (data-qhh-ssr="1"): ${summary.skippedAlreadyMarked} (skipped)`);
console.log(`  - Without filler in app.js: ${summary.skippedNoFiller} (skipped)`);
console.log(`  - Flagged (empty + filler + no marker): ${flagged.length}`);
console.log();

const pageOrder = Object.keys(byPage).sort((a, b) => {
    const pa = FOLD_PRIORITY[a] === 'HIGH' ? 0 : (FOLD_PRIORITY[a] === 'MEDIUM' ? 1 : 2);
    const pb = FOLD_PRIORITY[b] === 'HIGH' ? 0 : (FOLD_PRIORITY[b] === 'MEDIUM' ? 1 : 2);
    return pa - pb || a.localeCompare(b);
});

for (const page of pageOrder) {
    const items = byPage[page];
    console.log(`━━━ ${page}  [${FOLD_PRIORITY[page] || 'LOW'} priority — ${items.length} flagged] ━━━`);
    for (const it of items) {
        const fillerSummary = it.fillers
            .map(f => `${f.func}@${f.line}`)
            .slice(0, 3)
            .join(', ');
        console.log(`  • <${it.tag} id="${it.id}">  line ${it.line}`);
        console.log(`    fillers: ${fillerSummary}${it.fillers.length > 3 ? ` (+${it.fillers.length - 3} more)` : ''}`);
        if (it.hasHidden) console.log(`    ⚠ has hidden attr`);
        if (it.hasDataI18n) console.log(`    ⚠ has data-i18n attr`);
    }
    console.log();
}

console.log(`✅ JSON saved: ${path.relative(ROOT, outJson)}`);
