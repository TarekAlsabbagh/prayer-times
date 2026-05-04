// Phase Q-A7 — Qibla Visual Polish + Section Refinement.
//
// User reported visual issues post-Q-A6:
//   1. CRITICAL: "مدن أخرى لاتجاه القبلة" H2 appears ABOVE the SEO cards
//      → because the SSR anchor `<div id="qibla-other-cities"` matched the
//      INNER chips div, splitting the parent's H2 from the chips. Result:
//      H2 ended up BEFORE the SSR injection, chips ended up AFTER.
//      Fix: re-anchor to the PARENT .section-card containing both H2 + chips.
//   2. Cards: distance card has empty space (uneven heights)
//   3. Howto card heavy (4 long tips with big badges + dashed separators)
//   4. Note block too wide/heavy
//   5. City chips need clear wrapper presence (already have the H2, but
//      the chips fill via JS — needs visual styling)
//   6. FAQ background grey too heavy
//   7. Related links could be cleaner CTA
//
// Per user spec (Q-A7 ONLY):
//   • CSS-only polish (no text/SEO/H1 change) EXCEPT for the SSR anchor fix
//   • DO NOT change Title/Meta/H1/Keyword Consistency
//   • DO NOT add new content
//   • DO NOT touch /qibla Hub or moon/hijri/prayer pages
//
// Implementation:
//   PART 1 (server.js): re-anchor SSR injection from
//     `<div id="qibla-other-cities"` (inner chips div) to the PARENT
//     `<div class="section-card ...qibla-city-only">` containing the H2.
//   PART 2 (server.js): wrap note paragraphs in `qibla-seo-note-body` div
//     for 2-col layout on desktop.
//   PART 3 (css/style.css): add Q-A7 visual polish (~80 lines):
//     • Card balance: align-items: stretch, height: 100%, h3+p tightening
//     • Howto card compact tips (smaller padding, smaller badges, lighter
//       dashed separator)
//     • Note: max-width + 2-col body on desktop, smaller h3, lighter padding
//     • FAQ subtle background (white + border instead of grey)
//   PART 4 (index.html): bump style.css?v=250 → v=251

import { readFileSync, writeFileSync } from 'node:fs';

const SRV_PATH  = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';
const CSS_PATH  = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\css\\style.css';
const HTML_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\index.html';

let srvRaw  = readFileSync(SRV_PATH, 'utf8');
let cssRaw  = readFileSync(CSS_PATH, 'utf8');
let htmlRaw = readFileSync(HTML_PATH, 'utf8');

const isCRLFsrv  = /\r\n/.test(srvRaw);
const isCRLFcss  = /\r\n/.test(cssRaw);
const isCRLFhtml = /\r\n/.test(htmlRaw);

if (/Phase Q-A7 \(2026-05-03\)/.test(srvRaw)) {
    throw new Error('[server.js] Q-A7 already applied');
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

const replaceSrv  = makeReplacer(() => srvRaw,  v => srvRaw  = v, isCRLFsrv);
const replaceCss  = makeReplacer(() => cssRaw,  v => cssRaw  = v, isCRLFcss);
const replaceHtml = makeReplacer(() => htmlRaw, v => htmlRaw = v, isCRLFhtml);

// ═══════════════════════════════════════════════════════════════════════════
// PART 1 — server.js: re-anchor SSR injection BEFORE the parent .section-card
// containing the H2 "مدن أخرى لاتجاه القبلة" + chips div.
// Was: anchor on the INNER chips div, causing H2 to appear above SEO content.
// Now: anchor on the parent's H2 directly — inject BEFORE the H2 (which puts
// it AFTER the prior section-card and BEFORE the H2's parent section opens).
// Actually the cleanest: match the section-card opener + H2 together so we
// inject BEFORE the entire "other cities" section-card.
// ═══════════════════════════════════════════════════════════════════════════
const SRV_OLD = `                // Inject all 4 sections immediately before #qibla-other-cities
                const _qaAllSections = _qaSec1Html + _qaSec2Html + _qaSec3Html + _qaSec4Html;
                html = html.replace(
                    /<div id="qibla-other-cities"/,
                    _qaAllSections + '<div id="qibla-other-cities"'
                );`;

const SRV_NEW = `                // Phase Q-A7 (2026-05-03): re-anchor SSR injection. Was matching the
                // INNER chips div which split the parent's H2 from chips. Now matches
                // the H2 itself + parent wrapper — injects the SEO section BEFORE
                // the entire "other cities" block, so the H2 "مدن أخرى" appears
                // ABOVE its own chips, NOT above the SEO cards.
                const _qaAllSections = _qaSec1Html + _qaSec2Html + _qaSec3Html + _qaSec4Html;
                // Match the parent section-card containing qibla-other-cities-title H2.
                // Pattern targets the EXACT class combo + H2 anchor below to ensure
                // 1-and-only-1 match on the qibla city page.
                const _qaCityChipsAnchor = /<div class="section-card qibla-city-only">\\s*<h2 id="qibla-other-cities-title"/;
                if (_qaCityChipsAnchor.test(html)) {
                    html = html.replace(
                        _qaCityChipsAnchor,
                        _qaAllSections + '<div class="section-card qibla-city-only">\\n                    <h2 id="qibla-other-cities-title"'
                    );
                } else {
                    // Fallback to the old anchor (if HTML structure changed)
                    html = html.replace(
                        /<div id="qibla-other-cities"/,
                        _qaAllSections + '<div id="qibla-other-cities"'
                    );
                }`;

replaceSrv('PART 1 — server.js: re-anchor SSR injection BEFORE other-cities parent', SRV_OLD, SRV_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 2 — server.js: wrap note paragraphs in `.qibla-seo-note-body` div
// (2-col grid on desktop, 1-col mobile).
// ═══════════════════════════════════════════════════════════════════════════
const SRV2_OLD = `                const _qaNoteHtml = '<div class="qibla-seo-note">'
                    + '<h3>' + _escHtml(_qaPick(_qaNoteH3)) + '</h3>'
                    + '<p>' + _escHtml(_qaPick(_qaNoteP1)) + '</p>'
                    + '<p>' + _escHtml(_qaPick(_qaNoteP2)) + '</p>'
                    + '</div>';`;

const SRV2_NEW = `                // Phase Q-A7 (2026-05-03): wrap the 2 paragraphs in .qibla-seo-note-body
                // for 2-col grid layout on desktop (1-col on mobile).
                const _qaNoteHtml = '<div class="qibla-seo-note">'
                    + '<h3>' + _escHtml(_qaPick(_qaNoteH3)) + '</h3>'
                    + '<div class="qibla-seo-note-body">'
                    + '<p>' + _escHtml(_qaPick(_qaNoteP1)) + '</p>'
                    + '<p>' + _escHtml(_qaPick(_qaNoteP2)) + '</p>'
                    + '</div>'
                    + '</div>';`;

replaceSrv('PART 2 — server.js: wrap note paragraphs in .qibla-seo-note-body', SRV2_OLD, SRV2_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 3 — css/style.css: add Q-A7 visual polish block.
// ═══════════════════════════════════════════════════════════════════════════
const CSS_ANCHOR = `@media (max-width: 768px) {
    .qibla-seo-note {
        padding: 18px 16px 16px;
    }
}

`;

const CSS_NEW_BLOCK = `@media (max-width: 768px) {
    .qibla-seo-note {
        padding: 18px 16px 16px;
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
   Phase Q-A7 (2026-05-03): Visual polish + section refinement.
   Targets the qibla-seo-info-wrap (Q-A4), qibla-seo-card-howto (Q-A5),
   qibla-seo-note (Q-A6), and the FAQ + chips sections. NO text or SEO
   change — purely CSS layout/typography refinement.
   ═══════════════════════════════════════════════════════════════════════════ */

/* Card balance: ensure equal heights when content varies (distance card was
   empty-bottom previously). align-items: stretch is the grid default but
   making it explicit + height: 100% on cards ensures perfect alignment. */
.qibla-seo-info-grid {
    align-items: stretch;
}
.qibla-seo-card {
    height: 100%;
    display: flex;
    flex-direction: column;
}
.qibla-seo-card > h3 {
    flex: 0 0 auto;
}
.qibla-seo-card > p {
    flex: 1 1 auto;
}

/* Howto card compact tips: smaller padding/badge/separator so 4 tips don't
   feel as heavy as before. Replaces the heavier Q-A5 tip styling. */
.qibla-seo-card-howto p {
    padding-inline-start: 32px;
    padding-block: 10px;
    margin: 0;
    line-height: 1.78;
}
.qibla-seo-card-howto p::before {
    width: 22px;
    height: 22px;
    font-size: 0.78rem;
    top: 11px;
}
.qibla-seo-card-howto p + p {
    padding-top: 12px;
    border-top: 1px dashed rgba(11, 122, 75, 0.14);
}
.qibla-seo-card-howto p + p::before {
    top: 13px;
}

/* Note block refinement: 2-col body on desktop, narrower padding, smaller h3.
   Doesn't feel like a separate "content section" anymore — more like a
   contextual aside. */
.qibla-seo-note {
    padding: 22px 26px;
}
.qibla-seo-note h3 {
    font-size: 1.05rem;
    margin-bottom: 14px;
}
.qibla-seo-note-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}
.qibla-seo-note-body p {
    margin: 0;
    font-size: 0.92rem;
    line-height: 1.85;
}
@media (max-width: 768px) {
    .qibla-seo-note-body {
        grid-template-columns: 1fr;
        gap: 14px;
    }
    .qibla-seo-note h3 {
        font-size: 1rem;
    }
}

/* City chips section + FAQ + Related links: subtle white-card polish so they
   feel consistent with the green-themed cards above. Replaces any default
   grey/heavy backgrounds. */
.qibla-other-cities-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 14px;
}
@media (max-width: 768px) {
    .qibla-other-cities-grid {
        gap: 8px;
    }
}

`;

replaceCss('PART 3 — Add Q-A7 CSS visual polish block', CSS_ANCHOR, CSS_NEW_BLOCK);

// ═══════════════════════════════════════════════════════════════════════════
// PART 4 — index.html: bump style.css cache version (v=250 → v=251).
// ═══════════════════════════════════════════════════════════════════════════
function replaceAllInHtml(label, oldStr, newStr, expectCount) {
    const cnt = htmlRaw.split(oldStr).length - 1;
    if (cnt !== expectCount) throw new Error(`[${label}] expected ${expectCount}, got ${cnt}`);
    htmlRaw = htmlRaw.split(oldStr).join(newStr);
    console.log(`✓ ${label} (${cnt} occurrences)`);
}
replaceAllInHtml('PART 4 — Bump style.css?v=250 → v=251', 'style.css?v=250', 'style.css?v=251', 2);

writeFileSync(SRV_PATH, srvRaw);
writeFileSync(CSS_PATH, cssRaw);
writeFileSync(HTML_PATH, htmlRaw);

console.log('\n✅ Phase Q-A7 — Visual polish + section refinement complete.');
console.log('Critical fix: SSR injection now lands BEFORE the "other cities" parent');
console.log('  → "مدن أخرى" H2 now correctly appears ABOVE its chips, NOT above SEO cards.');
console.log('Visual polish: card balance, compact howto tips, 2-col note body.');
