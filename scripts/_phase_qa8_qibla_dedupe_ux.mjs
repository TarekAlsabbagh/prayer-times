// Phase Q-A8 — Qibla City Page Deduplication & UX Cleanup.
//
// User feedback post-Q-A7: "بصرياً فيها تكرار معلومات أكثر من اللازم" —
// the same data (city name + angle + distance + prayer-times link) appears
// in multiple places, making the page feel long and repetitive.
//
// Per user spec (Q-A8 ONLY):
//   • CSS-only changes (no text/SEO/H1 change)
//   • DO NOT change Title/Meta/H1/Keyword Consistency/Word Count significantly
//   • DO NOT delete SEO sections (Q-A4 cards, Q-A6 note all stay)
//   • DO NOT touch /qibla Hub or moon/hijri/prayer pages
//
// Changes (CSS only):
//   1. Hide `.qibla-main-cta-card` — the big "مواقيت الصلاة" CTA between
//      compass and SEO content. Same link exists in Related links at page
//      bottom — no information loss.
//   2. Hide `.qibla-info-grid` — the 4 info cards (City/Angle/Lat/Lng).
//      Same data is in compass + Q-A4 stat badges (bearing/distance) +
//      SEO cards. No information loss.
//   3. Make `.qibla-seo-card-howto` full-width via `grid-column: 1 / -1`
//      so the howto card sits below the 3 short cards (cleaner balance).
//   4. Hide `.qibla-footer-seo` paragraph (long duplicate of all data).
//      Keep the related links + trust note.
//   5. Style the related links container as a clean CTA card with a
//      "خدمات مرتبطة" pseudo-title (per-lang via :lang()).
//   6. Bump style.css cache version.

import { readFileSync, writeFileSync } from 'node:fs';

const CSS_PATH  = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\css\\style.css';
const HTML_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\index.html';

let cssRaw  = readFileSync(CSS_PATH, 'utf8');
let htmlRaw = readFileSync(HTML_PATH, 'utf8');
const isCRLFcss  = /\r\n/.test(cssRaw);
const isCRLFhtml = /\r\n/.test(htmlRaw);

if (/Phase Q-A8 \(2026-05-03\)/.test(cssRaw)) {
    throw new Error('[style.css] Q-A8 already applied');
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
// PART 1 — Add Q-A8 CSS dedup/UX block. Anchor: end of Q-A7 block.
// ═══════════════════════════════════════════════════════════════════════════
const CSS_ANCHOR = `/* City chips section + FAQ + Related links: subtle white-card polish so they
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

const CSS_NEW_BLOCK = `/* City chips section + FAQ + Related links: subtle white-card polish so they
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

/* ═══════════════════════════════════════════════════════════════════════════
   Phase Q-A8 (2026-05-03): Qibla city page deduplication + UX cleanup.
   The same data was appearing in 4-5 places (city name + angle + distance +
   prayer-times CTA). Now: keep one canonical place per piece + hide the
   duplicates. NO text/SEO change — purely CSS visibility + layout.
   ═══════════════════════════════════════════════════════════════════════════ */

/* (1) Hide the big "مواقيت الصلاة" CTA card between compass and SEO content.
   Same link exists in Related links at page bottom — zero info loss,
   removes a major visual interruption to the qibla flow. */
.qibla-main-cta-card {
    display: none !important;
}

/* (2) Hide the 4 info cards (City/Angle/Lat/Lng). Same data is in:
   - Compass (city name + angle visually)
   - Q-A4 stat badges (bearing °, distance km) — explicit numbers
   - Q-A4 SEO cards (full explanation per metric)
   No info loss; removes redundant technical strip. */
.qibla-info-grid {
    display: none !important;
}

/* (3) Make the howto card span full width of the grid (it has 4 paragraphs
   and was towering over the 3 short cards beside it). Now sits as a clean
   wide card BELOW the 3 short cards on desktop. */
@media (min-width: 769px) {
    .qibla-seo-info-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .qibla-seo-card-howto {
        grid-column: 1 / -1;
    }
}

/* (4) Hide the long footer-seo paragraph (duplicates all data: city + angle
   + distance + cardinal direction + prayer-times-link text). Related links
   list itself stays visible. */
.qibla-footer-seo {
    display: none !important;
}

/* (5) Style the related links container as a clean CTA card with a per-lang
   "خدمات مرتبطة بـ {city}" pseudo-title. Uses :lang() — no HTML change. */
.qibla-related-pills {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
}
.qibla-related-pills::before {
    content: "🔗 خدمات مرتبطة";
    display: block;
    flex: 1 1 100%;
    text-align: center;
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--primary, #075c38);
    margin-bottom: 8px;
    padding-bottom: 4px;
}
html[lang="en"] .qibla-related-pills::before { content: "🔗 Related services"; }
html[lang="fr"] .qibla-related-pills::before { content: "🔗 Services associés"; }
html[lang="tr"] .qibla-related-pills::before { content: "🔗 İlgili hizmetler"; }
html[lang="ur"] .qibla-related-pills::before { content: "🔗 متعلقہ خدمات"; }
html[lang="de"] .qibla-related-pills::before { content: "🔗 Verwandte Dienste"; }
html[lang="id"] .qibla-related-pills::before { content: "🔗 Layanan terkait"; }
html[lang="es"] .qibla-related-pills::before { content: "🔗 Servicios relacionados"; }
html[lang="bn"] .qibla-related-pills::before { content: "🔗 সম্পর্কিত পরিষেবা"; }
html[lang="ms"] .qibla-related-pills::before { content: "🔗 Perkhidmatan berkaitan"; }
.qibla-related-pills li {
    margin: 0;
}
.qibla-related-pills a {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 999px;
    background: linear-gradient(180deg, #f7fbf8 0%, #f0faf5 100%);
    border: 1px solid rgba(11, 122, 75, 0.20);
    color: var(--primary, #075c38);
    text-decoration: none;
    font-size: 0.92rem;
    font-weight: 600;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.qibla-related-pills a:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(11, 122, 75, 0.18);
    background: linear-gradient(180deg, #ecf7f1 0%, #e3f4ec 100%);
    color: var(--primary, #075c38);
}

`;

replaceCss('PART 1 — Add Q-A8 CSS dedup/UX cleanup block', CSS_ANCHOR, CSS_NEW_BLOCK);

// ═══════════════════════════════════════════════════════════════════════════
// PART 2 — index.html: bump style.css cache version (v=251 → v=252).
// ═══════════════════════════════════════════════════════════════════════════
function replaceAllInHtml(label, oldStr, newStr, expectCount) {
    const cnt = htmlRaw.split(oldStr).length - 1;
    if (cnt !== expectCount) throw new Error(`[${label}] expected ${expectCount}, got ${cnt}`);
    htmlRaw = htmlRaw.split(oldStr).join(newStr);
    console.log(`✓ ${label} (${cnt} occurrences)`);
}
replaceAllInHtml('PART 2 — Bump style.css?v=251 → v=252', 'style.css?v=251', 'style.css?v=252', 2);

writeFileSync(CSS_PATH, cssRaw);
writeFileSync(HTML_PATH, htmlRaw);

console.log('\n✅ Phase Q-A8 — Qibla dedup + UX cleanup complete.');
console.log('  • Hidden: qibla-main-cta-card, qibla-info-grid, qibla-footer-seo');
console.log('  • Layout: howto card full-width below 3 short cards (desktop)');
console.log('  • Polish: related-pills as CTA card with per-lang title (10 langs)');
console.log('No SEO change. All hidden content was duplicate.');
