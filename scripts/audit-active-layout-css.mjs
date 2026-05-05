// SITE-CLS-Audit / Static CSS scanner
// Finds CSS rules whose selector matches a state class (.active / .loaded /
// .hydrated / .visible / .ready / .open / .expanded / .collapsed / .shown)
// AND applies layout-shifting properties without an equivalent base-state
// rule. The base-vs-state mismatch is the pattern that bit /qibla via
// `.page.active { padding: 24px }` (Q-Hub-K2 fix).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const FILES = ['css/style.css', 'css/critical.css']
    .map(f => path.join(ROOT, f))
    .filter(fs.existsSync);

const RISKY_PROPS = [
    'padding', 'padding-top', 'padding-bottom', 'padding-inline', 'padding-block', 'padding-left', 'padding-right',
    'margin', 'margin-top', 'margin-bottom', 'margin-inline', 'margin-block', 'margin-left', 'margin-right',
    'display', 'position',
    'width', 'height', 'min-height', 'max-height', 'min-width', 'max-width',
    'border', 'border-width', 'border-top', 'border-bottom', 'border-inline', 'border-block', 'border-left', 'border-right',
    'gap', 'row-gap', 'column-gap',
    'grid-template-columns', 'grid-template-rows', 'grid-template-areas',
    'flex', 'flex-basis', 'flex-direction',
    'font-size', 'line-height',
    'box-sizing',
];

const STATE_CLASSES = [
    '.active', '.is-active',
    '.loaded', '.is-loaded',
    '.hydrated',
    '.visible', '.is-visible',
    '.ready', '.is-ready',
    '.open', '.is-open',
    '.expanded', '.is-expanded',
    '.collapsed', '.is-collapsed',
    '.shown',
];

function lineOf(text, index) {
    return text.slice(0, index).split('\n').length;
}

function findPropsInBody(body) {
    const found = {};
    for (const prop of RISKY_PROPS) {
        const re = new RegExp(`(^|[;\\s\\{])${prop.replace(/[-/]/g, '\\$&')}\\s*:\\s*([^;\\}]+)`, 'i');
        const m = body.match(re);
        if (m) found[prop] = m[2].trim().replace(/\s*!important.*$/, '').trim();
    }
    return found;
}

function stripStateFromSelector(selector) {
    // Convert ".page.active" -> ".page", "#x.is-visible" -> "#x", "a.b.active" -> "a.b"
    let s = selector;
    for (const cls of STATE_CLASSES) {
        s = s.split(cls).join('');
    }
    return s.replace(/\s+/g, ' ').trim();
}

const findings = [];

for (const file of FILES) {
    const css = fs.readFileSync(file, 'utf8');
    const fileLabel = path.relative(ROOT, file).replace(/\\/g, '/');

    // Build a flat index of all rules (selector + body) to enable counterpart
    // lookups. We tolerate nested @media by walking braces.
    const rules = [];
    let i = 0, depth = 0, mediaStack = [];
    while (i < css.length) {
        // Find next interesting char: '{', '}', '@'
        const next = css.slice(i).search(/[{}@]/);
        if (next < 0) break;
        const at = i + next;
        const ch = css[at];
        if (ch === '@') {
            // Find the next '{' or ';' that starts/ends the at-rule
            const semi = css.indexOf(';', at);
            const open = css.indexOf('{', at);
            if (open < 0 && semi < 0) break;
            if (semi >= 0 && (open < 0 || semi < open)) {
                // self-closing at-rule (@import, @charset)
                i = semi + 1;
                continue;
            }
            // open at-rule like @media
            const head = css.slice(at, open).trim();
            mediaStack.push(head);
            depth++;
            i = open + 1;
            continue;
        }
        if (ch === '{') {
            // Find selector (text before '{' since previous '}' or top)
            // Walk backward to find selector start
            let start = at - 1;
            let parens = 0;
            while (start >= 0) {
                const c = css[start];
                if (c === '}') break;
                if (c === '{') break;
                start--;
            }
            const selector = css.slice(start + 1, at).trim();
            const close = findMatchingClose(css, at);
            if (close < 0) break;
            const body = css.slice(at + 1, close);
            // ignore if body itself contains a nested rule (i.e., this is an
            // @media or @supports block that we already entered above)
            if (!body.includes('{')) {
                rules.push({
                    file: fileLabel,
                    line: lineOf(css, at),
                    selector,
                    body,
                    media: mediaStack.join(' › '),
                });
            }
            i = close + 1;
            continue;
        }
        if (ch === '}') {
            if (mediaStack.length) mediaStack.pop();
            depth = Math.max(0, depth - 1);
            i = at + 1;
            continue;
        }
        i = at + 1;
    }

    // Scan rules for state-class matches with risky props
    for (const r of rules) {
        const sel = r.selector;
        const matchedStates = STATE_CLASSES.filter(cls => sel.includes(cls));
        if (matchedStates.length === 0) continue;
        const risky = findPropsInBody(r.body);
        if (Object.keys(risky).length === 0) continue;

        const baseSel = stripStateFromSelector(sel);
        // Find counterpart base rule
        const counterpart = rules.find(r2 =>
            r2.media === r.media &&
            stripStateFromSelector(r2.selector).split(',').map(s => s.trim()).some(s => baseSel.split(',').map(x => x.trim()).includes(s)) &&
            !STATE_CLASSES.some(cls => r2.selector.includes(cls))
        );

        const counterpartProps = counterpart ? findPropsInBody(counterpart.body) : {};
        const verdict = analyzeVerdict(risky, counterpartProps);

        findings.push({
            file: r.file,
            line: r.line,
            selector: sel,
            media: r.media,
            riskyProps: risky,
            baseSel,
            hasCounterpart: !!counterpart,
            counterpartLine: counterpart?.line || null,
            counterpartProps,
            verdict,
        });
    }
}

function findMatchingClose(css, openIdx) {
    let depth = 1;
    for (let i = openIdx + 1; i < css.length; i++) {
        if (css[i] === '{') depth++;
        else if (css[i] === '}') {
            depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}

function analyzeVerdict(stateProps, baseProps) {
    // SAFE: every risky prop in state has matching value in base, OR
    //       state has only display/visibility-toggle (display: block when base has display: none and is positioned fixed/absolute).
    // PARTIAL: some props match base, others don't.
    // RISKY: state introduces new layout props with no matching base.
    const stateKeys = Object.keys(stateProps);
    if (stateKeys.length === 0) return 'NO_LAYOUT';

    // Display-toggle exemption: if state only sets `display` and base has `display: none`,
    // it's a valid show/hide pattern (assuming positioned absolutely/fixed).
    if (stateKeys.length === 1 && stateKeys[0] === 'display' && baseProps.display === 'none') {
        const isPositioned = baseProps.position === 'absolute' || baseProps.position === 'fixed';
        return isPositioned ? 'SAFE' : 'NEEDS_REVIEW';
    }

    let matched = 0, mismatched = 0;
    for (const k of stateKeys) {
        if (baseProps[k] === stateProps[k]) matched++;
        else mismatched++;
    }
    if (mismatched === 0) return 'SAFE';
    if (matched === 0) return 'RISKY';
    return 'PARTIAL';
}

// ──────────────────────────────────────────
// Output
// ──────────────────────────────────────────

const buckets = { RISKY: [], PARTIAL: [], NEEDS_REVIEW: [], SAFE: [] };
for (const f of findings) {
    if (buckets[f.verdict]) buckets[f.verdict].push(f);
}

const summary = {
    timestamp: new Date().toISOString(),
    filesScanned: FILES.map(f => path.relative(ROOT, f).replace(/\\/g, '/')),
    totals: {
        risky: buckets.RISKY.length,
        partial: buckets.PARTIAL.length,
        needsReview: buckets.NEEDS_REVIEW.length,
        safe: buckets.SAFE.length,
    },
    risky: buckets.RISKY,
    partial: buckets.PARTIAL,
    needsReview: buckets.NEEDS_REVIEW,
};

const outJson = path.join(ROOT, 'audit-reports', 'css-state-classes.json');
fs.writeFileSync(outJson, JSON.stringify(summary, null, 2), 'utf8');

console.log('=== SITE-CLS-Audit / CSS state-class scanner ===');
console.log(`Files scanned: ${summary.filesScanned.join(', ')}`);
console.log(`Totals: 🔴 RISKY=${summary.totals.risky}  🟡 PARTIAL=${summary.totals.partial}  🟠 REVIEW=${summary.totals.needsReview}  🟢 SAFE=${summary.totals.safe}`);
console.log();

function pretty(f) {
    const props = Object.entries(f.riskyProps).map(([k, v]) => `${k}: ${v}`).join('; ');
    const m = f.media ? `  [in ${f.media}]` : '';
    const cp = f.hasCounterpart ? `(base @ line ${f.counterpartLine}: ${Object.entries(f.counterpartProps).map(([k,v]) => `${k}: ${v}`).join('; ') || 'no risky props'})` : '(no base counterpart)';
    return `  ${f.file}:${f.line}  ${f.selector}${m}\n      props: { ${props} }\n      ${cp}`;
}

if (buckets.RISKY.length) {
    console.log('🔴 RISKY (state class adds layout without base counterpart):');
    buckets.RISKY.forEach(f => console.log(pretty(f)));
    console.log();
}
if (buckets.PARTIAL.length) {
    console.log('🟡 PARTIAL (state matches some base props, not all):');
    buckets.PARTIAL.forEach(f => console.log(pretty(f)));
    console.log();
}
if (buckets.NEEDS_REVIEW.length) {
    console.log('🟠 NEEDS REVIEW (display toggle on non-positioned element):');
    buckets.NEEDS_REVIEW.forEach(f => console.log(pretty(f)));
    console.log();
}

console.log(`✅ JSON saved: ${path.relative(ROOT, outJson)}`);
