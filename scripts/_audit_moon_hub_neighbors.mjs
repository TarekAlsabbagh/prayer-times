// Find which .page wrapper contains the M1 sections + moon-main-card.
import fs from 'node:fs';

const html = fs.readFileSync(process.argv[2] || 'moon-prod.html', 'utf8');

// Build map: each .page wrapper → [start, end] by finding open + matching close.
const pageRe = /<div\s+class="page(?:\s+active)?"\s+id="(page-[a-z-]+)"/g;
const pages = [];
let m;
while ((m = pageRe.exec(html)) !== null) {
    pages.push({ id: m[1], start: m.index, openEnd: m.index + m[0].length });
}
// Approximate each end as the start of the NEXT one minus a buffer.
for (let i = 0; i < pages.length; i++) {
    pages[i].end = (i + 1 < pages.length) ? pages[i + 1].start : html.length;
}

console.log('=== .page wrappers (in order) ===');
for (const p of pages) {
    console.log('  ' + p.id.padEnd(38) + ' : @' + String(p.start).padStart(7) + ' → @' + p.end);
}

const probes = [
    { name: 'moon-forecast',                  needle: 'moon-forecast' },
    { name: 'moon-main-card (hero)',          needle: 'moon-main-card' },
    { name: 'moon-comparison',                needle: 'moon-comparison' },
    { name: 'moon-upcoming-timeline',         needle: 'moon-upcoming-timeline' },
    { name: 'M1 Section 1 (Calendar in...)',  needle: 'تقويم القمر في' },
    { name: 'M1 Section 2 (phases)',          needle: 'هلال' },
    { name: 'moon-other-cities',              needle: 'moon-other-cities' },
    { name: 'MOON-HUB-SEO-4 H2-1',            needle: 'كيف تقرأ حالة القمر' },
    { name: 'MOON-HUB-SEO-4 H2-2',            needle: 'الفرق بين صفحة القمر' },
    { name: 'MOON-HUB-SEO-4 H2-3',            needle: 'ما العوامل التي تظهر' },
    { name: 'MOON-HUB-SEO-4 H2-4',            needle: 'استخدام تقويم القمر' },
    { name: 'moon-hub-faq',                   needle: 'moon-hub-faq' },
];

function whichPage(pos) {
    for (const p of pages) {
        if (pos >= p.start && pos < p.end) return p.id;
    }
    return '(none)';
}

console.log('');
console.log('=== Which .page contains each anchor (FIRST occurrence) ===');
for (const probe of probes) {
    const pos = html.indexOf(probe.needle);
    const where = whichPage(pos);
    console.log('  ' + probe.name.padEnd(35) + ' @' + String(pos).padStart(7) + ' → ' + where);
}

// Also count occurrences of "moon-main-card" globally
console.log('');
console.log('=== Global occurrences (some elements repeated across page wrappers) ===');
for (const cls of ['moon-main-card', 'moon-forecast', 'moon-comparison', 'moon-hub-faq', 'moon-hub-seo-card']) {
    const re = new RegExp(cls, 'g');
    const matches = html.match(re) || [];
    console.log('  ' + cls.padEnd(28) + ': ' + matches.length);
}
