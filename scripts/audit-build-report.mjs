// SITE-CLS-Audit / Consolidated Markdown report builder.
// Merges css-state-classes.json + ssr-empty-elements.json + lighthouse-render.json
// into audit-reports/SITE-CLS-Audit.md

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPORTS = path.join(ROOT, 'audit-reports');

const css = JSON.parse(fs.readFileSync(path.join(REPORTS, 'css-state-classes.json'), 'utf8'));
const ssr = JSON.parse(fs.readFileSync(path.join(REPORTS, 'ssr-empty-elements.json'), 'utf8'));
const lh = JSON.parse(fs.readFileSync(path.join(REPORTS, 'lighthouse-render.json'), 'utf8'));

// Map route → parent page id (for SSR-empty join)
const ROUTE_PARENT = {
    '/': 'page-prayer-times',
    '/qibla': 'page-qibla',
    '/qibla-in-jeddah-21.5-39.2': 'page-qibla',
    '/prayer-times-in-makkah-21.4-39.8': 'page-prayer-times',
    '/moon-today': 'page-moon',
    '/moon-in-jeddah-21.5-39.2': 'page-moon',
    '/today-hijri-date': 'page-hijri-today',
    '/hijri-calendar/1447': 'page-hijri-year',
    '/azkar': 'page-duas',
    '/dateconverter': 'page-date-converter',
    '/msbaha': 'page-tasbih',
    '/zakat-calculator': 'page-zakat',
    '/ramadan-countdown': 'page-ramadan-countdown',
    '/eid-al-fitr-countdown': 'page-eid-al-fitr-countdown',
    '/eid-al-adha-countdown': 'page-eid-al-adha-countdown',
    '/hijri-new-year-countdown': 'page-hijri-new-year-countdown',
};

function priorityFromCls(cls) {
    if (cls > 0.25) return '🔴 CRITICAL';
    if (cls > 0.1) return '🟠 HIGH';
    if (cls > 0.05) return '🟡 MEDIUM';
    return '🟢 LOW';
}

function suggestFix(route, lhRow, ssrItems, worstShifts) {
    const cls = lhRow.cls?.max ?? 0;
    const lcp = lhRow.lcp?.avg ?? 0;
    const fixes = [];

    // .page.active padding parity — match any "<div class='page ... active'..."
    const hasActiveShift = worstShifts.some(s => /class="page[^"]*active[^"]*"/.test(s.sn || ''));
    if (hasActiveShift) {
        const parent = ROUTE_PARENT[route];
        fixes.push(`pre-apply .page.active layout (E4-b/Q-Hub-K2 pattern) for #${parent}`);
    }

    // Hero section growing (countdown / hijri pages have a hero card that fills via JS)
    const heroShift = worstShifts.find(s => /hero|hpage-hero/.test(s.sn || '') && (s.score ?? 0) > 0.1);
    if (heroShift) {
        const sel = heroShift.sn?.match(/class="([^"]+)"/)?.[1] || '(unknown class)';
        fixes.push(`SSR-fill or min-height reserve hero section (\`${sel.substring(0, 60)}\`) — biggest shift contributor`);
    }

    // SSR-empty above-the-fold elements
    if (ssrItems.length > 0) {
        fixes.push(`SSR-fill ${ssrItems.length} empty element(s): ${ssrItems.slice(0, 3).map(i => '#' + i.id).join(', ')}${ssrItems.length > 3 ? '…' : ''}`);
    }

    if (cls > 0.1 && fixes.length === 0) {
        fixes.push(`investigate top shift sources listed above; apply Q-Hub-J min-height or Q-Hub-H SSR-fill pattern`);
    }

    if (lcp > 3500 && cls < 0.1) {
        fixes.push(`investigate LCP element render delay (Q-Hub-G/H pattern: SSR-inject text + skip JS overwrite)`);
    }

    return fixes.length ? fixes.join('; ') : 'none — already in good state';
}

function fmt(n, digits = 0) {
    if (n == null) return '-';
    return Number(n).toFixed(digits);
}

const lines = [];
lines.push('# SITE-CLS-Audit — Page Active Layout Shift Audit');
lines.push('');
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push(`Target: \`https://prayer-times-d4w8.onrender.com\``);
lines.push('');
lines.push('## Executive Summary');
lines.push('');
const critical = lh.filter(r => (r.cls?.max ?? 0) > 0.25);
const high = lh.filter(r => (r.cls?.max ?? 0) > 0.1 && (r.cls?.max ?? 0) <= 0.25);
const medium = lh.filter(r => (r.cls?.max ?? 0) > 0.05 && (r.cls?.max ?? 0) <= 0.1);
const low = lh.filter(r => (r.cls?.max ?? 0) <= 0.05);
lines.push(`- 🔴 **CRITICAL** (CLS > 0.25): **${critical.length}** routes`);
lines.push(`- 🟠 **HIGH** (0.10 < CLS ≤ 0.25): **${high.length}** routes`);
lines.push(`- 🟡 **MEDIUM** (0.05 < CLS ≤ 0.10): **${medium.length}** routes`);
lines.push(`- 🟢 **LOW** (CLS ≤ 0.05): **${low.length}** routes`);
lines.push('');
lines.push(`Total routes audited: **${lh.length}**`);
lines.push(`Total Lighthouse runs: **${lh.reduce((s, r) => s + (r.runs || 0), 0)}**`);
lines.push('');

// ── Per-route table ──
lines.push('## Per-Route Lighthouse Numbers (Render)');
lines.push('');
lines.push('| Priority | Route | Perf | CLS | LCP | SI | TTFB |');
lines.push('|---|---|---|---|---|---|---|');
const sorted = [...lh].sort((a, b) => (b.cls?.max ?? 0) - (a.cls?.max ?? 0));
for (const r of sorted) {
    const pri = priorityFromCls(r.cls?.max ?? 0);
    lines.push(`| ${pri} | \`${r.route}\` | ${fmt(r.perf?.avg)} | ${fmt(r.cls?.max, 3)} | ${fmt(r.lcp?.avg)}ms | ${fmt(r.si?.avg)}ms | ${fmt(r.ttfb?.avg)}ms |`);
}
lines.push('');

// ── Per-route diagnostic ──
lines.push('## Per-Route Diagnostic + Suggested Fix Type');
lines.push('');
for (const r of sorted) {
    if ((r.cls?.max ?? 0) <= 0.05 && (r.lcp?.avg ?? 0) < 2500) continue; // skip green
    const parent = ROUTE_PARENT[r.route];
    const ssrItems = (ssr.byPage?.[parent] || []);
    const fix = suggestFix(r.route, r, ssrItems, r.worstShifts || []);
    lines.push(`### ${priorityFromCls(r.cls?.max ?? 0)}  \`${r.route}\``);
    lines.push('');
    lines.push(`- Performance: **${fmt(r.perf?.avg)}**  |  CLS: **${fmt(r.cls?.max, 3)}**  |  LCP: **${fmt(r.lcp?.avg)}ms**  |  SI: **${fmt(r.si?.avg)}ms**`);
    if (r.lcpSnippet) {
        lines.push(`- LCP element: \`${String(r.lcpSnippet).substring(0, 100).replace(/\n/g, ' ')}\``);
    }
    if (r.worstShifts?.length) {
        lines.push(`- Top shifts:`);
        for (const s of r.worstShifts.slice(0, 4)) {
            const snip = String(s.sn || '').substring(0, 80).replace(/\n/g, ' ');
            const h = s.rect?.height ?? '?';
            lines.push(`    - score \`${(s.score ?? 0).toFixed(3)}\`  h=${h}px  →  \`${snip}\``);
        }
    }
    if (ssrItems.length) {
        lines.push(`- SSR-empty elements (filled by JS, no \`data-qhh-ssr\` marker):`);
        for (const it of ssrItems.slice(0, 8)) {
            const tags = [];
            if (it.hasHidden) tags.push('hidden');
            if (it.hasDataI18n) tags.push('data-i18n');
            const tagStr = tags.length ? ` [${tags.join(', ')}]` : '';
            lines.push(`    - \`<${it.tag} id="${it.id}">\` line ${it.line}${tagStr}`);
        }
        if (ssrItems.length > 8) lines.push(`    - ...and ${ssrItems.length - 8} more`);
    }
    lines.push('');
    lines.push(`**Suggested fix:** ${fix}`);
    lines.push('');
}

// ── CSS state-class summary ──
lines.push('## CSS Static Audit (state classes with layout properties)');
lines.push('');
lines.push(`Files scanned: ${css.filesScanned.join(', ')}`);
lines.push(`- 🔴 RISKY (no base counterpart): ${css.totals.risky}`);
lines.push(`- 🟡 PARTIAL (state matches some base props): ${css.totals.partial}`);
lines.push(`- 🟠 NEEDS REVIEW: ${css.totals.needsReview}`);
lines.push(`- 🟢 SAFE: ${css.totals.safe}`);
lines.push('');
lines.push('### Confirmed RISKY rules');
lines.push('');
const riskyDedupe = (css.risky || []).filter((r, i, arr) =>
    arr.findIndex(x => x.selector === r.selector && x.line === r.line) === i
);
// Filter scanner noise: only report rules that actually have layout-affecting
// (display, padding, margin, height, position) AND no counterpart match.
const trueRisky = riskyDedupe.filter(r => {
    const props = Object.keys(r.riskyProps || {});
    return props.some(p => /^(display|padding|margin|height|position|min-height|max-height|width|box-sizing|grid-template)/.test(p))
        && !r.hasCounterpart;
});
if (trueRisky.length === 0) {
    lines.push('No true risky rules found beyond `.page.active` (already fixed for /qibla and moon pages).');
} else {
    for (const r of trueRisky.slice(0, 10)) {
        const sel = r.selector.replace(/\/\*[\s\S]*?\*\//g, '').trim().substring(0, 100);
        if (!sel) continue;
        const props = Object.entries(r.riskyProps).map(([k, v]) => `${k}: ${v}`).join('; ');
        lines.push(`- \`${r.file}:${r.line}\` \`${sel}\` { ${props} }${r.media ? ` (in ${r.media})` : ''}`);
    }
}
lines.push('');

// ── SSR-empty audit summary ──
lines.push('## SSR-Empty Element Audit (filled by JS without SSR marker)');
lines.push('');
lines.push(`Total flagged: ${ssr.total}`);
lines.push('');
lines.push('Grouped by parent SPA page (HIGH priority = above-the-fold on hub/landing):');
lines.push('');
const pageOrder = Object.keys(ssr.byPage).sort();
for (const page of pageOrder) {
    const items = ssr.byPage[page];
    if (!items.length) continue;
    lines.push(`- **#${page}** — ${items.length} elements: ${items.slice(0, 6).map(i => '`#' + i.id + '`').join(', ')}${items.length > 6 ? `, …+${items.length - 6}` : ''}`);
}
lines.push('');

// ── Recommended fix priority ──
lines.push('## Recommended Phase Order (highest CLS first)');
lines.push('');
lines.push('Each item below should be its own SITE-CLS-{Route} phase. Don\'t fix multiple at once.');
lines.push('');
let n = 1;
for (const r of sorted) {
    if ((r.cls?.max ?? 0) <= 0.05 && (r.lcp?.avg ?? 0) < 2500) continue;
    const parent = ROUTE_PARENT[r.route];
    lines.push(`${n++}. **\`${r.route}\`** — CLS ${fmt(r.cls?.max, 3)}, Perf ${fmt(r.perf?.avg)} → fix \`#${parent}\``);
}
lines.push('');

// ── Fix-type cheat sheet ──
lines.push('## Fix-Type Cheat Sheet (no code yet)');
lines.push('');
lines.push('| Type | Pattern | Reference |');
lines.push('|---|---|---|');
lines.push('| **SSR fill** | Inject final text/HTML into the empty element via `html.replace()` in server.js, gated by route flag. Add `data-qhh-ssr="1"`. JS skips overwrite when marker present. | Q-Hub-H pattern (server.js `_qHubHeroSSR`, app.js `_qhhSkip()`) |');
lines.push('| **min-height reservation** | Add `min-height: NNNpx` (desktop) / responsive override (mobile) on the empty element. Prevents 0→content height jump. | Q-Hub-J pattern (`#qibla-hub-howto-card`, `#qibla-faq`) |');
lines.push('| **pre-apply layout CSS** | The `.page.active` parity fix. SSR-inject `html.{route}-page` class, then CSS rule `html.{route}-page #page-{route} { display: block; padding: 24px; }` matching `.page.active`. JS adding `.active` becomes a no-op. | Phase E4-b (moon), Q-Hub-K2 (qibla) |');
lines.push('| **remove post-hydration toggle** | Restructure JS to never add the layout-changing class. Move the toggle to a non-layout property (e.g., visibility/opacity inside a positioned wrapper). | Use sparingly when SSR fill is impractical |');
lines.push('');

// ── Out of scope ──
lines.push('## Explicitly Out of Scope (this audit)');
lines.push('');
lines.push('- No code edits, commits, or deploys');
lines.push('- No fixes applied — this is diagnostic-only');
lines.push('- /qibla and /qibla-in-{city} already closed via Q-Hub-A through K2');
lines.push('- Bundling, script-stripping, footer-cookie deferral — Q-Hub-I was reverted; not reopening');
lines.push('');

// ── Verification commands ──
lines.push('## How to Re-Run');
lines.push('');
lines.push('```bash');
lines.push('# Static scans (no browser, instant):');
lines.push('node scripts/audit-active-layout-css.mjs');
lines.push('node scripts/audit-ssr-empty-elements.mjs');
lines.push('');
lines.push('# Dynamic audit on Render (16 routes × N runs):');
lines.push('node scripts/audit-cls-runner.mjs --target=render --runs=1   # quick triage');
lines.push('node scripts/audit-cls-runner.mjs --target=render --runs=3 --routes=/some-bad-route   # confirm');
lines.push('');
lines.push('# Local-only diagnostic (against localhost:3000):');
lines.push('node scripts/audit-cls-runner.mjs --target=local --runs=1');
lines.push('');
lines.push('# Rebuild this report:');
lines.push('node scripts/audit-build-report.mjs');
lines.push('```');
lines.push('');

const outFile = path.join(REPORTS, 'SITE-CLS-Audit.md');
fs.writeFileSync(outFile, lines.join('\n'), 'utf8');
console.log(`✅ Report written: ${path.relative(ROOT, outFile)}`);
console.log(`   ${lines.length} lines, ${fs.statSync(outFile).size} bytes`);
