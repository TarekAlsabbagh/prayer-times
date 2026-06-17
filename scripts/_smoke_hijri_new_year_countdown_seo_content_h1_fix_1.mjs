// HIJRI-NEW-YEAR-COUNTDOWN-SEO-CONTENT-H1-FIX-1 — verification (self-contained).
//
// The 4 Islamic-event countdown pages (ramadan / eid-al-fitr / eid-al-adha /
// hijri-new-year) get, per supported language, server-side:
//   • a real, single SSR H1 (id=cd-h1-{occ}) — the page block is flipped active
//     and the homepage shell deactivated (no more title/meta/H1 leak);
//   • a dynamic Title from a {long,medium,short} ladder that fits ~[50,60] chars
//     after the {hy}/{gy} year substitution, plus a 120–160 char Meta;
//   • the 10-item FAQ rendered in SSR HTML from the existing i18n keys, with a
//     single matching FAQPage JSON-LD;
//   • 4 educational H2 sections injected from data/countdown-seo.js (#cd-edu-{occ}).
// The counter / years table / FAQ accordion keep their client containers, and no
// other page is affected.
//
// Run: node scripts/_smoke_hijri_new_year_countdown_seo_content_h1_fix_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
function check(label, ok, extra) { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); }

console.log('═══ HIJRI-NEW-YEAR-COUNTDOWN-SEO-CONTENT-H1-FIX-1 ═══');

const PORT = 8211;
function get(p) {
    return new Promise((resolve) => {
        const r = http.request({ host: 'localhost', port: PORT, path: p, method: 'GET', headers: { 'Accept-Encoding': 'identity' } }, res => {
            let b = ''; res.on('data', c => b += c); res.on('end', () => resolve({ status: res.statusCode, body: b }));
        });
        r.on('error', () => resolve({ status: 0, body: '' }));
        r.end();
    });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitReady(ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const r = await get('/health'); if (r.status === 200) return true; await sleep(400); } return false; }

function clen(s) { return [...(s || '')].length; }
function block(html, id) {
    const i = html.indexOf('id="' + id + '"'); if (i < 0) return '';
    const start = html.lastIndexOf('<div', i); let depth = 0;
    const re = /<\/?div\b[^>]*>/gi; re.lastIndex = start; let m;
    while ((m = re.exec(html))) { if (m[0].slice(0, 2) !== '</') depth++; else depth--; if (depth === 0) return html.slice(start, re.lastIndex); }
    return html.slice(start);
}
function visibleText(s) { return s.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim(); }

const OCC = [
    { route: 'ramadan-countdown', page: 'page-ramadan-countdown', h1: 'cd-h1-ramadan', edu: 'cd-edu-ramadan', kp: 'ramadan' },
    { route: 'eid-al-fitr-countdown', page: 'page-eid-al-fitr-countdown', h1: 'cd-h1-eid-fitr', edu: 'cd-edu-eid-fitr', kp: 'eid_fitr' },
    { route: 'eid-al-adha-countdown', page: 'page-eid-al-adha-countdown', h1: 'cd-h1-eid-adha', edu: 'cd-edu-eid-adha', kp: 'eid_adha' },
    { route: 'hijri-new-year-countdown', page: 'page-hijri-new-year-countdown', h1: 'cd-h1-hijri-ny', edu: 'cd-edu-hijri-ny', kp: 'hijri_ny' },
];
const LANGS = ['', 'en/', 'fr/', 'tr/', 'ur/', 'de/', 'id/', 'es/', 'bn/', 'ms/'];

// Replica of server.js _pickCountdownTitle for the fallback unit test.
function pickTitle(t) {
    const order = [t.long, t.medium, t.short].filter(Boolean);
    for (const x of order) { const n = clen(x); if (n >= 50 && n <= 60) return x; }
    let best = '', bl = -1; for (const x of order) { const n = clen(x); if (n <= 60 && n > bl) { best = x; bl = n; } }
    if (best) return best;
    return order.reduce((a, b) => (clen(b) < clen(a) ? b : a), order[0]);
}

let exitCode = 1;
const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
try {
    if (!await waitReady(20000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

    // ── 1) Per occasion × lang SEO + structure ──
    for (const o of OCC) {
        console.log(`\n-- ${o.route} --`);
        for (const lang of LANGS) {
            const tag = (lang || 'ar/');
            const html = (await get('/' + lang + o.route)).body;
            const blk = block(html, o.page);
            const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '';
            const desc = (html.match(/<meta name="description" content="([^"]*)"/i) || [])[1] || '';
            const tlen = clen(title.replace(/&amp;/g, '&')), mlen = clen(desc);
            const h1 = (blk.match(/<h1\b/g) || []).length;
            const h1IsId = new RegExp('<h1[^>]*id="' + o.h1 + '"').test(blk);
            const h2 = (blk.match(/<h2\b/g) || []).length;
            const h3 = (blk.match(/<h3\b/g) || []).length;
            const faq = (blk.match(/<details>/g) || []).length;
            const eduSec = (block(html, o.edu).match(/<section/g) || []).length;
            const active = /class="page active countdown-page/.test(blk.slice(0, 90));
            const ptInactive = /<div class="page" id="page-prayer-times">/.test(html);
            const rawTok = (blk.match(/\{(hy|gy|date|n|hyear)\}/g) || []).length;
            const rawKey = (visibleText(blk).match(/\b(ramadan|eid_fitr|eid_adha|hijri_ny)\.[a-z_]+/g) || []).length;
            const robotsOk = !/<meta name="robots"[^>]*noindex/i.test(html);

            // FAQPage JSON-LD: exactly one, valid, 10 Q, each Q.name visible
            const lds = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map(x => x[1]);
            let faqLd = null; for (const raw of lds) { try { const j = JSON.parse(raw); if (j['@type'] === 'FAQPage') faqLd = j; } catch (_) { } }
            const ldOk = !!faqLd && Array.isArray(faqLd.mainEntity) && faqLd.mainEntity.length === 10;
            const vis = visibleText(blk);
            const ldMatches = ldOk && faqLd.mainEntity.every(q => vis.includes(visibleText(q.name)) && vis.includes(visibleText(q.acceptedAnswer.text)));

            check(`${o.route} ${tag} title ∈[45,60] (${tlen})`, tlen >= 45 && tlen <= 60, title);
            check(`${o.route} ${tag} meta ∈[120,160] (${mlen})`, mlen >= 120 && mlen <= 160);
            check(`${o.route} ${tag} exactly 1 H1 and it is #${o.h1}`, h1 === 1 && h1IsId, 'h1=' + h1);
            check(`${o.route} ${tag} H2≥6 & H3≥1`, h2 >= 6 && h3 >= 1, `h2=${h2} h3=${h3}`);
            check(`${o.route} ${tag} 10 FAQ visible`, faq === 10, 'faq=' + faq);
            check(`${o.route} ${tag} 4 edu sections`, eduSec === 4, 'edu=' + eduSec);
            check(`${o.route} ${tag} page active + homepage shell off`, active && ptInactive);
            check(`${o.route} ${tag} 0 raw tokens / 0 raw keys`, rawTok === 0 && rawKey === 0, `tok=${rawTok} key=${rawKey}`);
            check(`${o.route} ${tag} 1 FAQPage JSON-LD, 10 Q, text matches visible`, ldOk && ldMatches);
            check(`${o.route} ${tag} robots index`, robotsOk);
        }
    }

    // ── 2) Counter / table / FAQ-accordion client containers intact (regression) ──
    console.log('\n-- client containers preserved (counter/table/faq accordion) --');
    for (const [route, ids] of [
        ['/ramadan-countdown', ['ramadan-timer', 'ram-years-tbody', 'ram-faq-list']],
        ['/eid-al-fitr-countdown', ['fitr-timer', 'fitr-years-tbody', 'fitr-faq-list']],
        ['/eid-al-adha-countdown', ['adha-timer', 'adha-years-tbody', 'adha-faq-list']],
        ['/hijri-new-year-countdown', ['ny-timer', 'ny-years-tbody', 'ny-faq-list']],
    ]) {
        const html = (await get(route)).body;
        for (const id of ids) check(`${route} keeps #${id}`, html.includes('id="' + id + '"'));
    }

    // ── 3) Other pages unaffected: still exactly 1 H1, still 200 ──
    console.log('\n-- other pages unaffected (H1=1) --');
    // MOON-TODAY-CONTENT-MOVE-TO-MOON-1: the moon hub (200, #moon-hub-h1) is now /moon (/moon-today 301s → /moon).
    for (const [p, marker] of [['/', 'loc-hero-title'], ['/zakat-calculator', 'zakat-h1'], ['/date-converter', 'dconv-h1'], ['/azkar', null], ['/msbaha', 'tasbih-h1'], ['/qibla', 'qibla-hero-title'], ['/moon', 'moon-hub-h1'], ['/today-hijri-date', 'hijri-today-full']]) {
        const r = await get(p); const n = (r.body.match(/<h1\b/g) || []).length;
        check(`${p} → 200 & exactly 1 H1`, r.status === 200 && n === 1, `status=${r.status} h1=${n}`);
    }

    // ── 4) Title-fallback ladder unit test (proves longest-fitting, no truncation) ──
    console.log('\n-- title ladder fallback (synthetic long names) --');
    const longTier = 'A'.repeat(80), medTier = 'B'.repeat(55), shortTier = 'C'.repeat(30);
    check('long>60 ⇒ pick in-range medium (55)', pickTitle({ long: longTier, medium: medTier, short: shortTier }) === medTier);
    check('all>60 ⇒ pick shortest (no truncation)', pickTitle({ long: 'X'.repeat(70), medium: 'Y'.repeat(65), short: 'Z'.repeat(62) }) === 'Z'.repeat(62));
    check('long in-range ⇒ pick long (most descriptive)', pickTitle({ long: 'L'.repeat(58), medium: 'M'.repeat(52), short: 'S'.repeat(30) }) === 'L'.repeat(58));
    check('no tier in [50,60] but long≤60 ⇒ pick longest ≤60', pickTitle({ long: 'L'.repeat(48), medium: 'M'.repeat(44), short: 'S'.repeat(30) }) === 'L'.repeat(48));

    console.log(`\n═══ ${pass} passed, ${fail} failed ═══`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ smoke crashed:', e && e.message);
} finally {
    s.kill('SIGKILL');
}
process.exit(exitCode);
