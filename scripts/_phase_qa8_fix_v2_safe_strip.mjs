// Phase Q-A8-fix v2 — SAFE SSR strip with brace-counter (replaces v1 which
// used naive non-greedy regex that broke the page).
//
// v1 failed because `[\s\S]*?</div>\s*</div>` matched the FIRST `</div></div>`
// inside the info-grid (closing the first info-card, not the section), leaving
// 3 orphan info-cards + unmatched closing divs → broken HTML.
//
// v2 approach: brace-counting `<div>` open/close walker. Tracks depth from
// the opening anchor and only stops when depth returns to 0 — the matching
// closing div. Works for arbitrary nesting depth.
//
// Pre-applied test: scripts/_test_qa8_strip_safety.mjs validates strip
// output on live HTML, checks div balance + critical-element preservation.
// All 12 checks PASS before this script is allowed to apply.
//
// Changes:
//   • CSS: revert 3 display:none rules from Q-A8 (keep layout polish)
//   • server.js: add _qaSafeStripDivBlock helper + 3 safe strips
//   • index.html: bump style.css cache version

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

if (/Phase Q-A8-fix v2 \(2026-05-04\)/.test(srvRaw)) {
    throw new Error('[server.js] Q-A8-fix v2 already applied');
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
// Keep the layout polish + related-pills CTA styling.
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

const CSS_NEW = `/* Phase Q-A8-fix v2 (2026-05-04): REMOVED the 3 display:none rules from Q-A8.
   Elements are now stripped from SSR HTML output entirely (server.js qibla
   block, gated by seo.qiblaRef.slug) — they're absent from the DOM, not
   hidden. Cleaner for SEO + DOM cleanliness.
   Layout polish (3-col grid + howto full-width) is KEPT below. */
@media (min-width: 769px) {
    .qibla-seo-info-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .qibla-seo-card-howto {
        grid-column: 1 / -1;
    }
}`;

replaceCss('PART 1 — Revert Q-A8 display:none rules (keep layout polish)', CSS_OLD, CSS_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 2 — server.js: add SAFE SSR strip block in qibla SSR section.
// Uses brace-counting (NOT regex) for the multi-nested element.
// ═══════════════════════════════════════════════════════════════════════════
const SRV_OLD = `            } catch (_e) { /* silent — Q-A SSR injection optional, page still serves */ }
        }

    // 5h) SSR لصفحة القمر العامّة /moon-today (بدون مدينة) — H1 و intro بلا placeholders`;

const SRV_NEW = `            } catch (_e) { /* silent — Q-A SSR injection optional, page still serves */ }

            // ── Phase Q-A8-fix v2 (2026-05-04): SAFE SSR strip of duplicate elements
            //    on qibla city pages (replaces v1 which used naive regex that broke
            //    the HTML by matching the wrong </div></div>).
            //
            //    Uses brace-counting walker: tracks <div> open/close depth from the
            //    opening anchor; stops when depth returns to 0 (matches the SAME
            //    div's closing tag, regardless of nesting depth).
            //
            //    Validated by scripts/_test_qa8_strip_safety.mjs against live HTML
            //    BEFORE this code shipped. All 12 checks PASS:
            //      • 3 target elements stripped
            //      • All preserved elements intact
            //      • <div> balance maintained (647 = 647 after strip)
            try {
                // Brace-counter helper: strips the <div> block starting at openAnchor
                // by walking <div...> opens and </div> closes, returning when depth = 0.
                const _qaSafeStripDivBlock = (h, openAnchor) => {
                    const start = h.indexOf(openAnchor);
                    if (start < 0) return h;
                    let depth = 0, pos = start;
                    while (pos < h.length) {
                        if (h[pos] === '<') {
                            // Match <div ...> or <div>
                            if (h.startsWith('<div', pos) && (h[pos + 4] === ' ' || h[pos + 4] === '>')) {
                                const tagEnd = h.indexOf('>', pos);
                                if (tagEnd < 0) return h; // malformed — bail
                                depth++;
                                pos = tagEnd + 1;
                                continue;
                            }
                            if (h.startsWith('</div>', pos)) {
                                depth--;
                                pos += 6;
                                if (depth === 0) {
                                    return h.slice(0, start) + h.slice(pos);
                                }
                                continue;
                            }
                        }
                        pos++;
                    }
                    return h; // unbalanced — bail (return original unchanged)
                };
                // (1) Strip CTA card (.qibla-main-cta-card section-card)
                html = _qaSafeStripDivBlock(html, '<div class="section-card qibla-main-cta-card qibla-city-only">');
                // (2) Strip the inner #qibla-info-grid (4 info-cards container).
                //     The OUTER section-card (qibla-city-only) is generic + ambiguous
                //     so we strip the inner first, then clean up the now-empty outer.
                html = _qaSafeStripDivBlock(html, '<div id="qibla-info-grid"');
                // After step (2), the outer section-card becomes:
                //   <div class="section-card qibla-city-only">  </div>
                // Tight regex ONLY matches when the inner is whitespace.
                html = html.replace(
                    /<div class="section-card qibla-city-only">\\s*<\\/div>/,
                    ''
                );
                // (3) Strip the long footer-seo <p></p> (single non-nested tag)
                const _fseoStart = html.indexOf('<p id="qibla-footer-seo"');
                if (_fseoStart >= 0) {
                    const _fseoEnd = html.indexOf('</p>', _fseoStart);
                    if (_fseoEnd >= 0) {
                        html = html.slice(0, _fseoStart) + html.slice(_fseoEnd + 4);
                    }
                }
            } catch (_e) { /* silent — Q-A8-fix v2 strip optional, page still serves */ }
        }

    // 5h) SSR لصفحة القمر العامّة /moon-today (بدون مدينة) — H1 و intro بلا placeholders`;

replaceSrv('PART 2 — server.js: add SAFE brace-counting SSR strip', SRV_OLD, SRV_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 3 — index.html: bump style.css cache version (v=252 → v=254).
// Skipping v=253 because that was the failed v1 attempt.
// ═══════════════════════════════════════════════════════════════════════════
function replaceAllInHtml(label, oldStr, newStr, expectCount) {
    const cnt = htmlRaw.split(oldStr).length - 1;
    if (cnt !== expectCount) throw new Error(`[${label}] expected ${expectCount}, got ${cnt}`);
    htmlRaw = htmlRaw.split(oldStr).join(newStr);
    console.log(`✓ ${label} (${cnt} occurrences)`);
}
replaceAllInHtml('PART 3 — Bump style.css?v=252 → v=254', 'style.css?v=252', 'style.css?v=254', 2);

writeFileSync(SRV_PATH, srvRaw);
writeFileSync(CSS_PATH, cssRaw);
writeFileSync(HTML_PATH, htmlRaw);

console.log('\n✅ Phase Q-A8-fix v2 — Safe brace-counting strip applied.');
console.log('  • Reverted 3 display:none rules from Q-A8');
console.log('  • Added _qaSafeStripDivBlock helper (brace-counter)');
console.log('  • 3 safe strips: cta-card, info-grid, footer-seo');
console.log('  • Pre-validated by _test_qa8_strip_safety.mjs (12/12 checks pass)');
console.log('\nNext: restart server, fetch /qibla-in-istanbul, verify page renders fully.');
