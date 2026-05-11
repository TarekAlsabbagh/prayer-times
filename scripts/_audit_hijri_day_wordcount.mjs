// Audit word counts on /hijri-date/{date} considering the CSS class
// on <html> that determines which .page wrapper is visible.
import fs from 'node:fs';
const html = fs.readFileSync(process.argv[2] || 'hijri-local.html', 'utf8');

function extractById(html, id) {
    const startRe = new RegExp(`<(div|section|main|article)\\s[^>]*id="${id}"[^>]*>`, 'i');
    const m = startRe.exec(html);
    if (!m) return null;
    const tag = m[1].toLowerCase();
    let cursor = m.index + m[0].length;
    let depth = 1;
    const openRe = new RegExp(`<${tag}\\b[^>]*>`, 'gi');
    const closeRe = new RegExp(`</${tag}\\s*>`, 'gi');
    while (depth > 0 && cursor < html.length) {
        openRe.lastIndex = cursor;
        closeRe.lastIndex = cursor;
        const om = openRe.exec(html);
        const cm = closeRe.exec(html);
        if (!cm) return html.slice(m.index);
        if (om && om.index < cm.index) { depth++; cursor = om.index + om[0].length; }
        else { depth--; cursor = cm.index + cm[0].length; }
    }
    return html.slice(m.index, cursor);
}

function stripToText(htmlFrag) {
    if (!htmlFrag) return '';
    return htmlFrag
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
        .replace(/<!--[\s\S]*?-->/g, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[a-z0-9#]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
function wordCount(text) {
    return text.split(/\s+/).filter(Boolean).length;
}

// Detect html class
const htmlTag = html.match(/<html[^>]*>/);
const htmlClass = (htmlTag && htmlTag[0].match(/class="([^"]+)"/) || [])[1] || '';
console.log('<html class> =', JSON.stringify(htmlClass));

// CSS-visible mapping (from critical CSS in head)
const visibilityMap = {
    'hijri-day-page':   { show: 'page-hijri-day',   hide: 'page-prayer-times' },
    'hijri-today-page': { show: 'page-hijri-today', hide: 'page-prayer-times' },
    'hijri-year-page':  { show: 'page-hijri-year',  hide: 'page-prayer-times' },
    'hijri-month-page': { show: 'page-hijri-month', hide: 'page-prayer-times' },
    'moon-today-hub-page': { show: 'page-moon', hide: 'page-prayer-times' },
    'home-page':        { show: 'page-prayer-times', hide: null },
};
let visiblePage = null;
for (const cls of htmlClass.split(/\s+/)) {
    if (visibilityMap[cls]) {
        visiblePage = visibilityMap[cls].show;
        break;
    }
}
if (!visiblePage) {
    // Default: page-prayer-times is the static class="page active"
    visiblePage = 'page-prayer-times';
}
console.log('Active visible page (by CSS):', visiblePage);

// Count words in the CSS-visible page only
const visibleFrag = extractById(html, visiblePage);
const visibleText = stripToText(visibleFrag);
const visibleWc = wordCount(visibleText);
console.log('\n=== Visible page word count (what SEOptimer sees) ===');
console.log(`  ${visiblePage}: ${visibleWc} words`);

// Show phrases inside visible page
const phrases = [
    'ماذا يعني تاريخ',
    'كيف يتم تحويل',
    'الفرق بين التاريخ',
    'متى تحتاج إلى صفحة',
    'أسئلة شائعة حول تاريخ',
];
console.log('\n=== Key phrases inside visible page ===');
for (const p of phrases) {
    console.log(`  ${p.padEnd(28)}: ${visibleText.includes(p)}`);
}
