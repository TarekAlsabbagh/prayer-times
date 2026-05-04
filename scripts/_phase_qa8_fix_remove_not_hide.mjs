// Phase Q-A8-fix — Replace CSS hiding with SSR conditional removal.
//
// User feedback on Q-A8:
//   "كلمة 'مخفي' هنا خطيرة. الأفضل عدم توليد العنصر أصلاً، أو عرضه compact."
//   The 3 elements hidden via `display: none !important` in Q-A8 are
//   semantically duplicate — they shouldn't be in the DOM at all on
//   /qibla-in-{city} pages.
//
// Hidden content is bad because:
//   1. SEOptimer/Google may not count text inside `display: none` reliably
//   2. DOM bloat — extra elements that JS may try to populate (wasted work)
//   3. Code-cleanliness debt — implicit "this exists but is invisible"
//
// Q-A8-fix replaces:
//   • `.qibla-main-cta-card { display: none !important }`
//   • `.qibla-info-grid    { display: none !important }`
//   • `.qibla-footer-seo   { display: none !important }`
// with: SSR strip in server.js (gated by `seo.qiblaRef && seo.qiblaRef.slug`).
//
// Strip patterns (regex, scoped + unique anchors):
//   • CTA card: <div class="section-card qibla-main-cta-card qibla-city-only">
//               ...minimal inner (a + p)...</div>
//   • Info-grid section-card: <div class="section-card qibla-city-only">
//               <div id="qibla-info-grid" class="info-grid">
//               ...4 info-cards...</div></div>
//   • Footer-seo p: <p id="qibla-footer-seo" class="qibla-footer-seo"></p>
//
// All elements are now ABSENT from served HTML on city pages — not hidden.

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

if (/Phase Q-A8-fix \(2026-05-03\)/.test(cssRaw)) {
    throw new Error('[style.css] Q-A8-fix already applied');
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
// PART 1 — css/style.css: REVERT the Q-A8 display:none rules.
// Keep the layout polish (3-col grid + howto full-width + related pills CTA).
// ═══════════════════════════════════════════════════════════════════════════
const CSS_OLD = `/* (1) Hide the big "مواقيت الصلاة" CTA card between compass and SEO content.
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
}`;

const CSS_NEW = `/* Phase Q-A8-fix (2026-05-03): REMOVED the display:none rules from Q-A8.
   The 3 elements (.qibla-main-cta-card, .qibla-info-grid, .qibla-footer-seo)
   are now stripped from SSR HTML output entirely on /qibla-in-{city} pages
   (server.js gated by seo.qiblaRef.slug) — they no longer exist in the DOM.
   See server.js qibla SSR block.

   The layout polish (3-col grid + howto full-width) is KEPT below since
   it's purely structural. */
@media (min-width: 769px) {
    .qibla-seo-info-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .qibla-seo-card-howto {
        grid-column: 1 / -1;
    }
}`;

replaceCss('PART 1 — Revert CSS display:none rules (keep layout polish)', CSS_OLD, CSS_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 2 — server.js: add SSR strip block on qibla city pages.
// Insert AFTER the Q-A SSR injection's closing brace (just before the
// "// Phase Q-A4 fix-order applied" marker).
// ═══════════════════════════════════════════════════════════════════════════
const SRV_OLD = `            } catch (_e) { /* silent — Q-A SSR injection optional, page still serves */ }
        }

    // 5h) SSR لصفحة القمر العامّة /moon-today (بدون مدينة) — H1 و intro بلا placeholders`;

const SRV_NEW = `            } catch (_e) { /* silent — Q-A SSR injection optional, page still serves */ }

            // Phase Q-A8-fix (2026-05-03): SSR strip duplicate elements on qibla city
            // pages instead of CSS-hiding them (Q-A8 used display:none which is
            // semantically wrong for SEO + dirty DOM). All 3 elements are duplicates:
            //   • .qibla-main-cta-card → "مواقيت الصلاة" link is in Related-pills at bottom
            //   • .qibla-info-grid     → city/angle/lat/lng all shown in compass + Q-A4 badges
            //   • .qibla-footer-seo    → long duplicate of all data (angle + distance + ...)
            try {
                // (1) Strip the big CTA card (section-card with class qibla-main-cta-card)
                html = html.replace(
                    /<div class="section-card qibla-main-cta-card qibla-city-only">[\\s\\S]*?<p id="qibla-main-cta-note"[^>]*><\\/p>\\s*<\\/div>/,
                    ''
                );
                // (2) Strip the info-grid section-card (city/angle/lat/lng)
                html = html.replace(
                    /<div class="section-card qibla-city-only">\\s*<div id="qibla-info-grid"[\\s\\S]*?<\\/div>\\s*<\\/div>/,
                    ''
                );
                // (3) Strip the long footer-seo paragraph
                html = html.replace(
                    /<p id="qibla-footer-seo"[^>]*><\\/p>/,
                    ''
                );
            } catch (_e) { /* silent — Q-A8-fix strip optional, page still serves */ }
        }

    // 5h) SSR لصفحة القمر العامّة /moon-today (بدون مدينة) — H1 و intro بلا placeholders`;

replaceSrv('PART 2 — server.js: add SSR strip block (3 strips on qibla-city)', SRV_OLD, SRV_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 3 — index.html: bump style.css cache version (v=252 → v=253).
// ═══════════════════════════════════════════════════════════════════════════
function replaceAllInHtml(label, oldStr, newStr, expectCount) {
    const cnt = htmlRaw.split(oldStr).length - 1;
    if (cnt !== expectCount) throw new Error(`[${label}] expected ${expectCount}, got ${cnt}`);
    htmlRaw = htmlRaw.split(oldStr).join(newStr);
    console.log(`✓ ${label} (${cnt} occurrences)`);
}
replaceAllInHtml('PART 3 — Bump style.css?v=252 → v=253', 'style.css?v=252', 'style.css?v=253', 2);

writeFileSync(SRV_PATH, srvRaw);
writeFileSync(CSS_PATH, cssRaw);
writeFileSync(HTML_PATH, htmlRaw);

console.log('\n✅ Phase Q-A8-fix — Replace CSS hiding with SSR strip complete.');
console.log('  • Removed: 3 display:none rules from Q-A8');
console.log('  • Added: 3 html.replace() strips in qibla SSR block');
console.log('  • Result: elements ABSENT from raw HTML (not hidden via CSS)');
console.log('  • Kept: 3-col grid + howto full-width layout polish');
console.log('\nVerify with: curl http://localhost:8080/qibla-in-istanbul | grep "qibla-main-cta-card"');
console.log('Should return ZERO matches.');
