// Phase Q-A5 — Qibla paragraph tips visual polish.
//
// User feedback: "نريد جعل هذه النقاط مصممة بشكل افضل وليس فقط سرد للكلام"
// (we want these points designed better, not just narrative text).
//
// Card 4 (qibla-seo-card-howto) has 4 paragraphs that look like a wall of
// text. Other cards (overview, bearing, distance) have only 1 paragraph
// each.
//
// Solution: CSS-only polish — convert each <p> in the howto card into a
// distinct "tip" with:
//   • Leading checkmark badge (✓ in a circle)
//   • Subtle dashed separator between tips
//   • Slightly increased spacing
//   • RTL-aware (badge on right for AR/UR pages)
//
// NO HTML structure change — purely CSS targeting `.qibla-seo-card-howto p`.
// Other cards keep their single-paragraph clean look (no badge clutter).

import { readFileSync, writeFileSync } from 'node:fs';

const CSS_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\css\\style.css';
const HTML_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\index.html';

let cssRaw  = readFileSync(CSS_PATH, 'utf8');
let htmlRaw = readFileSync(HTML_PATH, 'utf8');
const isCRLFcss  = /\r\n/.test(cssRaw);
const isCRLFhtml = /\r\n/.test(htmlRaw);

if (/Phase Q-A5 \(2026-05-03\)/.test(cssRaw)) {
    throw new Error('[style.css] Q-A5 already applied');
}

function lfToEol(s, isCRLF) { return isCRLF ? s.replace(/\r?\n/g, '\r\n') : s; }

function makeReplacer(getRaw, setRaw, isCRLF) {
    return function replaceOnce(label, oldStr, newStr) {
        const oldNorm = lfToEol(oldStr, isCRLF);
        const newNorm = lfToEol(newStr, isCRLF);
        const raw = getRaw();
        const cnt = raw.split(oldNorm).length - 1;
        if (cnt !== 1) throw new Error(`[${label}] expected 1 anchor match, got ${cnt}`);
        setRaw(raw.replace(oldNorm, newNorm));
        console.log(`✓ ${label}`);
    };
}

const replaceCss  = makeReplacer(() => cssRaw,  v => cssRaw  = v, isCRLFcss);
const replaceHtml = makeReplacer(() => htmlRaw, v => htmlRaw = v, isCRLFhtml);

// ═══════════════════════════════════════════════════════════════════════════
// PART 1 — CSS: add paragraph-tip styling for the howto card.
// Anchor: end of Q-A4 CSS block (just before .qibla-seo-stat strong).
// ═══════════════════════════════════════════════════════════════════════════
const CSS_OLD = `.qibla-seo-stat strong {
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: 0.3px;
}

`;

const CSS_NEW = `.qibla-seo-stat strong {
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: 0.3px;
}

/* Phase Q-A5 (2026-05-03): convert howto card's 4 paragraphs into distinct
   "tip" blocks with leading ✓ badge + dashed separator. CSS-only — no HTML
   change. Other cards (overview/bearing/distance) keep their single-paragraph
   clean layout (no badge clutter). RTL-aware: badge sits on the right for
   AR/UR pages via inset-inline-start. */
.qibla-seo-card-howto p {
    position: relative;
    padding-inline-start: 36px;
    margin: 0 0 14px;
    min-height: 26px;
}
.qibla-seo-card-howto p:last-child {
    margin-bottom: 0;
}
.qibla-seo-card-howto p::before {
    content: "✓";
    position: absolute;
    inset-inline-start: 0;
    top: 2px;
    width: 26px;
    height: 26px;
    background: rgba(11, 122, 75, 0.12);
    color: var(--primary, #0b7a4b);
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: 800;
    line-height: 1;
    transition: transform 0.2s ease, background 0.2s ease;
}
.qibla-seo-card-howto p:hover::before {
    transform: scale(1.1);
    background: rgba(11, 122, 75, 0.20);
}
.qibla-seo-card-howto p + p {
    padding-top: 16px;
    border-top: 1px dashed rgba(11, 122, 75, 0.20);
}
.qibla-seo-card-howto p + p::before {
    top: 18px;
}
@media (max-width: 768px) {
    .qibla-seo-card-howto p {
        padding-inline-start: 32px;
    }
    .qibla-seo-card-howto p::before {
        width: 22px;
        height: 22px;
        font-size: 0.78rem;
    }
}

`;

replaceCss('PART 1 — Add Q-A5 CSS for howto paragraph tips', CSS_OLD, CSS_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 2 — Bump style.css cache version (v=248 → v=249).
// ═══════════════════════════════════════════════════════════════════════════
function replaceAllInHtml(label, oldStr, newStr, expectCount) {
    const cnt = htmlRaw.split(oldStr).length - 1;
    if (cnt !== expectCount) throw new Error(`[${label}] expected ${expectCount}, got ${cnt}`);
    htmlRaw = htmlRaw.split(oldStr).join(newStr);
    console.log(`✓ ${label} (${cnt} occurrences)`);
}
replaceAllInHtml('PART 2 — Bump style.css?v=248 → v=249', 'style.css?v=248', 'style.css?v=249', 2);

writeFileSync(CSS_PATH, cssRaw);
writeFileSync(HTML_PATH, htmlRaw);

console.log('\n✅ Phase Q-A5 — Qibla tips polish complete.');
console.log('Howto card paragraphs now look like distinct tip blocks with:');
console.log('  • Leading ✓ badge in green pill');
console.log('  • Dashed separator between tips');
console.log('  • Hover scale animation on badge');
console.log('  • RTL-aware (badge on right for AR/UR)');
console.log('Other cards (overview/bearing/distance) UNCHANGED.');
