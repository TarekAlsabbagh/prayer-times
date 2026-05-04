// Standalone test for the safe brace-counting strip approach.
// Runs against the LIVE served HTML, validates strip output WITHOUT touching
// server.js. Only proceeds to apply if all checks pass.

import { readFileSync, writeFileSync } from 'node:fs';
import http from 'node:http';

// ── 1. Brace-counting strip function ──
//    Walks the HTML from `openAnchor` and tracks `<div>` open/close depth.
//    When depth returns to 0, returns the html with that block REMOVED.
//    Handles arbitrary nesting safely (unlike non-greedy regex).
function stripBlockByOpenAnchor(html, openAnchor) {
    const start = html.indexOf(openAnchor);
    if (start < 0) return { html, found: false, removed: 0 };
    let depth = 0;
    let pos = start;
    while (pos < html.length) {
        if (html[pos] === '<') {
            // <div ... >  (opens)
            if (html.startsWith('<div', pos) && (html[pos + 4] === ' ' || html[pos + 4] === '>')) {
                // Find end of this opening tag
                const tagEnd = html.indexOf('>', pos);
                if (tagEnd < 0) return { html, found: false, removed: 0 };
                depth++;
                pos = tagEnd + 1;
                continue;
            }
            // </div>  (closes)
            if (html.startsWith('</div>', pos)) {
                depth--;
                pos += 6;
                if (depth === 0) {
                    return {
                        html: html.slice(0, start) + html.slice(pos),
                        found: true,
                        removed: pos - start
                    };
                }
                continue;
            }
        }
        pos++;
    }
    return { html, found: false, removed: 0 };
}

// Variant for stripping a single tag (e.g., <p id="..."></p>) without depth tracking
function stripSingleTag(html, openAnchor, closeTag) {
    const start = html.indexOf(openAnchor);
    if (start < 0) return { html, found: false };
    const closeIdx = html.indexOf(closeTag, start);
    if (closeIdx < 0) return { html, found: false };
    return {
        html: html.slice(0, start) + html.slice(closeIdx + closeTag.length),
        found: true,
        removed: closeIdx + closeTag.length - start
    };
}

// ── 2. Fetch live HTML ──
function fetchHtml(path) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:8080${path}`, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
            res.on('error', reject);
        }).on('error', reject);
    });
}

const path = '/qibla-in-istanbul';
const original = await fetchHtml(path);
console.log(`Fetched ${path}: ${original.length} bytes`);
writeFileSync('C:\\Users\\Tarek\\AppData\\Local\\Temp\\qa8_original.html', original);

// ── 3. Apply 3 strips ──
let result = original;

// (1) CTA card
const r1 = stripBlockByOpenAnchor(result, '<div class="section-card qibla-main-cta-card qibla-city-only">');
console.log(`\n[1] CTA card strip: found=${r1.found}, removed ${r1.removed} bytes`);
result = r1.html;

// (2) Info-grid OUTER section-card. Need unique anchor.
//    The OUTER is a generic <div class="section-card qibla-city-only"> — many of them.
//    Instead, strip just the INNER <div id="qibla-info-grid"> (unique), then
//    optionally clean up the outer if it becomes empty.
const r2a = stripBlockByOpenAnchor(result, '<div id="qibla-info-grid"');
console.log(`\n[2a] Inner info-grid strip: found=${r2a.found}, removed ${r2a.removed} bytes`);
result = r2a.html;

// Now the parent section-card is `<div class="section-card qibla-city-only">\s*</div>` — empty
// Strip it via a tight regex that only matches EMPTY parent
const beforeEmpty = result.length;
result = result.replace(
    /<div class="section-card qibla-city-only">\s*<\/div>/,
    ''
);
const removedEmptyWrapper = beforeEmpty - result.length;
console.log(`[2b] Empty wrapper cleanup: removed ${removedEmptyWrapper} bytes`);

// (3) Footer-seo (single <p></p>)
const r3 = stripSingleTag(
    result,
    '<p id="qibla-footer-seo"',
    '</p>'
);
console.log(`\n[3] Footer-seo strip: found=${r3.found}, removed ${r3.removed} bytes`);
result = r3.html;

console.log(`\nTotal: ${original.length} → ${result.length} bytes (removed ${original.length - result.length})`);
writeFileSync('C:\\Users\\Tarek\\AppData\\Local\\Temp\\qa8_stripped.html', result);

// ── 4. Validation ──
console.log(`\n=== VALIDATION ===`);

// 4a. The 3 stripped elements should be ABSENT
const checks = [
    { label: 'qibla-main-cta-card removed', test: !result.includes('qibla-main-cta-card') },
    { label: 'qibla-info-grid removed', test: !result.includes('qibla-info-grid') },
    { label: 'qibla-footer-seo removed', test: !result.includes('qibla-footer-seo') },
];

// 4b. Critical preserved elements MUST still be present
checks.push({ label: 'compass section preserved', test: result.includes('qibla-compass') });
checks.push({ label: 'qibla-other-cities-title preserved', test: result.includes('qibla-other-cities-title') });
checks.push({ label: 'qibla-faq-title preserved', test: result.includes('qibla-faq-title') });
checks.push({ label: 'qibla-related (footer links) preserved', test: result.includes('qibla-related') });
checks.push({ label: 'qibla-trust-note preserved', test: result.includes('qibla-trust-note') });
checks.push({ label: 'Q-A SEO sections preserved', test: result.includes('qibla-seo-info-wrap') });
checks.push({ label: 'Q-A4 cards preserved (4)', test:
    result.includes('qibla-seo-card-overview')
    && result.includes('qibla-seo-card-bearing')
    && result.includes('qibla-seo-card-distance')
    && result.includes('qibla-seo-card-howto') });
checks.push({ label: 'Q-A6 note preserved', test: result.includes('qibla-seo-note') });

// 4c. HTML structure check: count opening and closing div tags
const opens = (result.match(/<div\b/g) || []).length;
const closes = (result.match(/<\/div>/g) || []).length;
checks.push({ label: `<div> balance: ${opens} opens vs ${closes} closes`, test: opens === closes });

// 4d. Original opens/closes for comparison
const origOpens = (original.match(/<div\b/g) || []).length;
const origCloses = (original.match(/<\/div>/g) || []).length;
console.log(`Original: ${origOpens} opens / ${origCloses} closes`);
console.log(`Stripped: ${opens} opens / ${closes} closes`);

const allPass = checks.every(c => c.test);
checks.forEach(c => console.log(`  ${c.test ? '✅' : '❌'} ${c.label}`));

if (allPass) {
    console.log(`\n✅ ALL CHECKS PASS — safe to apply to server.js`);
} else {
    console.log(`\n❌ SOME CHECKS FAILED — DO NOT apply to server.js`);
    process.exit(1);
}
