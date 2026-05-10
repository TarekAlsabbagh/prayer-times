// Audit MOON-HUB-SEO-4 word counts on production HTML.
// Usage: node scripts/_audit_moon_hub_seo_wordcount.mjs <htmlPath>

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const htmlPath = process.argv[2] || path.resolve(__dirname, '..', 'moon-prod.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function extractById(html, id) {
    // Match opening tag with the given id (any of div/section/main/article).
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
        if (om && om.index < cm.index) {
            depth++;
            cursor = om.index + om[0].length;
        } else {
            depth--;
            cursor = cm.index + cm[0].length;
        }
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

const PAGE_IDS = [
    'page-moon', 'page-prayer-times', 'page-qibla', 'page-zakat',
    'page-hijri-today', 'page-hijri-day', 'page-hijri-year', 'page-hijri-month',
    'page-date-converter', 'page-hijri-calendar', 'page-duas', 'page-tasbih',
    'page-ramadan-countdown', 'page-eid-al-fitr-countdown',
    'page-eid-al-adha-countdown', 'page-hijri-new-year-countdown',
    'page-all-cities'
];

console.log('=== Word count per .page wrapper ===');
let activeCount = 0;
let activeText = '';
for (const id of PAGE_IDS) {
    const frag = extractById(html, id);
    if (!frag) continue;
    const text = stripToText(frag);
    const wc = wordCount(text);
    // Check if .active class is on the opening tag
    const isActive = /class="[^"]*\bactive\b/.test(frag.slice(0, 200));
    const mark = isActive ? '[ACTIVE]' : '';
    console.log(`  ${id.padEnd(34)} : ${String(wc).padStart(5)} words  ${mark}`);
    if (isActive) {
        activeCount += wc;
        activeText += text + ' ';
    }
}

console.log('');
console.log('=== Total raw word count (whole document body) ===');
const wholeText = stripToText(html);
console.log('  Whole document:', wordCount(wholeText), 'words');
console.log('');
console.log('=== Active page words only ===');
console.log('  Total (visible by SEOptimer-like crawler):', activeCount, 'words');
console.log('');
console.log('=== H2 phrases inside ACTIVE pages only ===');
const phrases = [
    'كيف تقرأ حالة القمر',
    'الفرق بين صفحة القمر',
    'ما العوامل التي تظهر في بيانات القمر',
    'استخدام تقويم القمر',
    'تقويم القمر',
    'مراحل القمر',
];
for (const p of phrases) {
    console.log('  ' + p.padEnd(40) + ': ', activeText.includes(p));
}
console.log('');
console.log('=== Count of moon-hub-seo-card occurrences ===');
console.log('  In whole HTML:', (html.match(/moon-hub-seo-card/g) || []).length);
const moonFrag = extractById(html, 'page-moon');
if (moonFrag) {
    console.log('  Inside #page-moon only:', (moonFrag.match(/moon-hub-seo-card/g) || []).length);
}
