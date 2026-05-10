// Audit DOM order of MOON-HUB-SEO-4 sections vs neighbors on production HTML.
import fs from 'node:fs';

const html = fs.readFileSync(process.argv[2] || 'moon-prod.html', 'utf8');

function findFirst(html, needle) {
    return html.indexOf(needle);
}

// Find key anchor positions inside the active page-moon block.
const pageMoonStart = html.indexOf('id="page-moon"');
const pageMoonEnd   = html.indexOf('</div>\n        </div>\n        \n        <div class="page', pageMoonStart);

const anchors = {
    'page-moon START':                  pageMoonStart,
    'hero/moon-main-card':              findFirst(html, 'moon-main-card'),
    'M1: Section 1 (calendar month)':   findFirst(html, 'تقويم القمر في'),
    'M1: Section 2 (phases)':           findFirst(html, 'هلال'),
    'moon-comparison':                  findFirst(html, 'moon-comparison'),
    'moon-phase-insight':               findFirst(html, 'moon-phase-insight'),
    'moon-forecast':                    findFirst(html, 'moon-forecast'),
    'moon-upcoming-timeline':           findFirst(html, 'moon-upcoming-timeline'),
    'moon-other-cities':                findFirst(html, 'moon-other-cities'),
    'MOON-HUB-SEO-4 H2-1 (كيف تقرأ)':   findFirst(html, 'كيف تقرأ حالة القمر'),
    'MOON-HUB-SEO-4 H2-2 (الفرق بين)':  findFirst(html, 'الفرق بين صفحة القمر'),
    'MOON-HUB-SEO-4 H2-3 (العوامل)':    findFirst(html, 'ما العوامل التي تظهر'),
    'MOON-HUB-SEO-4 H2-4 (استخدام)':    findFirst(html, 'استخدام تقويم القمر'),
    'moon-hub-faq':                     findFirst(html, 'moon-hub-faq'),
    'moon-related-cards':               findFirst(html, 'moon-related-cards'),
    'page-moon END (approx)':           pageMoonEnd > 0 ? pageMoonEnd : pageMoonStart + 50000
};

const sorted = Object.entries(anchors)
    .filter(([k, v]) => v >= 0)
    .sort((a, b) => a[1] - b[1]);

console.log('=== DOM ORDER (top → bottom) ===');
for (const [name, pos] of sorted) {
    console.log('  @' + String(pos).padStart(7) + ' ' + name);
}

// Distance check: how far ABOVE FAQ are the new sections?
const faqPos = anchors['moon-hub-faq'];
const seo1Pos = anchors['MOON-HUB-SEO-4 H2-1 (كيف تقرأ)'];
const seo4Pos = anchors['MOON-HUB-SEO-4 H2-4 (استخدام)'];
console.log('');
console.log('=== Position relative to FAQ ===');
console.log('  SEO H2-1 at', seo1Pos, '— FAQ at', faqPos, '— diff:', faqPos - seo1Pos, 'bytes');
console.log('  SEO H2-4 at', seo4Pos, '— FAQ at', faqPos, '— diff:', faqPos - seo4Pos, 'bytes');
console.log('  SEO sections BEFORE FAQ?:', seo1Pos < faqPos && seo4Pos < faqPos);

// Calendar position vs SEO
const calendarPos = anchors['M1: Section 1 (calendar month)'] >= 0
    ? anchors['M1: Section 1 (calendar month)']
    : (findFirst(html, 'moon-calendar') >= 0 ? findFirst(html, 'moon-calendar') : -1);
console.log('  Calendar at', calendarPos);
console.log('  SEO sections BEFORE Calendar?:', seo1Pos < calendarPos);
