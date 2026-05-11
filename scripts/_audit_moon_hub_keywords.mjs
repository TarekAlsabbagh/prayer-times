// Count specific keyword occurrences INSIDE #page-moon vs OUTSIDE on
// /moon-in-{city} production HTML.
import fs from 'node:fs';
const html = fs.readFileSync(process.argv[2] || 'moon-hub-prod.html', 'utf8');

function extractById(html, id) {
    const startRe = new RegExp(`<(div|section|main|article)\\s[^>]*id="${id}"[^>]*>`, 'i');
    const m = startRe.exec(html);
    if (!m) return { start: -1, end: -1, html: '' };
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
        if (!cm) return { start: m.index, end: html.length, html: html.slice(m.index) };
        if (om && om.index < cm.index) { depth++; cursor = om.index + om[0].length; }
        else { depth--; cursor = cm.index + cm[0].length; }
    }
    return { start: m.index, end: cursor, html: html.slice(m.index, cursor) };
}

const pmRange = extractById(html, 'page-moon');
console.log(`page-moon range: ${pmRange.start} → ${pmRange.end}`);
console.log(`#page-moon size: ${pmRange.html.length} chars`);

const phrases = ['القمر اليوم', 'هلال متناقص', 'مايو 2026', 'اليوم', 'مايو', 'الشهر', 'بدر', 'متناقص', 'متزايد', 'هلال'];

const countInside = {};
const countOutside = {};

const outsideHtml = html.slice(0, pmRange.start) + html.slice(pmRange.end);

for (const p of phrases) {
    const re = new RegExp(p, 'g');
    countInside[p] = (pmRange.html.match(re) || []).length;
    countOutside[p] = (outsideHtml.match(re) || []).length;
}

console.log('\n=== INSIDE #page-moon (the visible page for SEOptimer) ===');
for (const p of phrases) {
    console.log(`  ${p.padEnd(15)} : ${String(countInside[p]).padStart(3)}`);
}
console.log('\n=== OUTSIDE #page-moon (hidden .page wrappers + nav + JSON-LD) ===');
for (const p of phrases) {
    console.log(`  ${p.padEnd(15)} : ${String(countOutside[p]).padStart(3)}`);
}

// Show context of each 'اليوم' inside page-moon
console.log('\n=== "اليوم" occurrences INSIDE #page-moon (with 50-char context) ===');
const reAll = /اليوم/g;
let m, i = 0;
while ((m = reAll.exec(pmRange.html)) !== null && i < 30) {
    const before = pmRange.html.slice(Math.max(0, m.index - 50), m.index).replace(/\s+/g, ' ').slice(-40);
    const after = pmRange.html.slice(m.index, Math.min(pmRange.html.length, m.index + 50)).replace(/\s+/g, ' ');
    console.log(`  ${++i}: ...${before}|→${after}`);
}
