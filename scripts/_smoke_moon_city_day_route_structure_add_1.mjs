// MOON-CITY-DAY-ROUTE-STRUCTURE-ADD-1 — dedicated smoke for the city DAY page.
//
// Pins the contract: /[lang/]moon/{country}/{city}/{yyyy}/{mm}/{dd} is the city DAY page —
// 200, single H1, self canonical + 10-lang hreflang, 7-level breadcrumb (Home › Moon Phase ›
// {Country} › {City} › {yyyy} › {Month} › {dd}) DOM ≡ BreadcrumbList JSON-LD, SSR hero
// (desc + 7 info chips + quick-nav anchors), day summary, an SSR day-details table, prev/next
// DAY (cross-month + cross-year), back links (month/year/city), and a 5-question FAQ with a
// matching FAQPage JSON-LD (no Event schema). Validation: deeper/today/dash/bad-day/bad-month
// → 404, leap-aware day-of-month, wrong country → 301. Day pages are index + self-canonical
// but NOT bulk-added to the sitemap. Month-page day links now point at the new nested day
// route. Legacy moon routes + Meeus 49 untouched; no redirect from /moon-in-{city}/{yyyy-mm-dd}.
//
// Run: node scripts/_smoke_moon_city_day_route_structure_add_1.mjs
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (label, ok, extra) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); };

const PORT = 8234;
function req(p) {
    return new Promise((resolve) => {
        const r = http.request({ host: 'localhost', port: PORT, path: p, method: 'GET', headers: { 'Accept-Encoding': 'identity' } }, res => {
            const chunks = []; res.on('data', c => chunks.push(c));
            res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8'), loc: res.headers.location || '' }));
        });
        r.on('error', () => resolve({ status: 0, body: '', loc: '' }));
        r.end();
    });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitReady(ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const r = await req('/health'); if (r.status === 200) return true; await sleep(400); } return false; }

const pageActive = (b, id) => new RegExp('class="page active" id="' + id + '"').test(b);
const canonOf = (b) => (b.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
const count = (b, re) => (b.match(re) || []).length;
function domCrumbs(b) {
    const nav = (b.match(/<nav class="moon-breadcrumb"[\s\S]*?<\/nav>/) || [''])[0];
    const out = []; const re = /(?:<a[^>]*class="bc-link[^"]*"[^>]*>|<li[^>]*id="bc-md-day"[^>]*>)([^<]*)</g; let m;
    while ((m = re.exec(nav)) !== null) { const t = m[1].trim(); if (t) out.push(t); }
    return out;
}
function jsonldCrumbNames(b) {
    const i = b.indexOf('"@type":"BreadcrumbList"'); if (i < 0) return null;
    const m = b.slice(i).match(/"itemListElement":\[([\s\S]*?)\]/);
    return (m[1].match(/"name":"([^"]*)"/g) || []).map(s => s.replace(/^"name":"/, '').replace(/"$/, ''));
}

let exitCode = 1;
let SITE = `http://localhost:${PORT}`;
const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
try {
    if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }
    SITE = (canonOf((await req('/moon/saudi-arabia/riyadh/2026/06/17')).body).match(/^(https?:\/\/[^/]+)/) || [])[1] || SITE;

    // ── A) day page = 200, #page-moon-day active, 1 H1, self canonical (multi-country) ──
    console.log('── A) day page = 200 + #page-moon-day active + 1 H1 + self canonical ──');
    for (const u of ['/moon/saudi-arabia/riyadh/2026/06/17', '/en/moon/saudi-arabia/riyadh/2026/06/17', '/moon/united-states/new-york/2027/01/15', '/fr/moon/saudi-arabia/jeddah/2025/12/03']) {
        const r = await req(u);
        const ok = r.status === 200 && pageActive(r.body, 'page-moon-day') && count(r.body, /<h1\b/g) === 1 && canonOf(r.body) === SITE + u && r.body.length > 60000;
        check(`${u}: 200 + page-moon-day + 1 H1 + self canonical`, ok, `status=${r.status} pmd=${pageActive(r.body, 'page-moon-day')} h1=${count(r.body, /<h1\b/g)} canon=${canonOf(r.body)}`);
    }

    // ── A2) NO leaked sections + NO orphaned comment text + balanced comments ──
    console.log('\n── A2) NO leaked #page-moon / #page-moon-year / #page-moon-month sections + balanced comments ──');
    for (const u of ['/moon/saudi-arabia/riyadh/2026/06/17', '/en/moon/saudi-arabia/riyadh/2026/06/17']) {
        const b = (await req(u)).body;
        const leaked = ['moon-general-faq', 'moon-hub-related-links', 'moon-events-section', 'moon-hub-hero', 'moon-event-ramadan', 'moon-year-summary', 'moon-month-summary', 'moon-page-h1']
            .filter(id => new RegExp('id="' + id + '"').test(b));
        check(`${u}: 0 leaked hub/year/month section IDs`, leaked.length === 0, `leaked=[${leaked.join(',')}]`);
        const opens = (b.match(/<!--/g) || []).length, closes = (b.match(/-->/g) || []).length;
        check(`${u}: HTML comments balanced (<!-- == -->)`, opens === closes, `open=${opens} close=${closes}`);
        check(`${u}: #page-moon-day max-width container present`, /#page-moon-day\{[^}]*max-width:1100px/.test(b));
    }

    // ── B) 7-level breadcrumb DOM ≡ JSON-LD (AR + EN) ──
    console.log('\n── B) 7-level breadcrumb DOM ≡ JSON-LD (Home › Moon Phase › Country › City › Year › Month › Day) ──');
    for (const [u, hub, country, city, mn] of [
        ['/moon/saudi-arabia/riyadh/2026/06/17', 'حالة القمر', 'المملكة العربية السعودية', 'الرياض', 'يونيو'],
        ['/en/moon/saudi-arabia/riyadh/2026/06/17', 'Moon Phase', 'Saudi Arabia', 'Riyadh', 'June'],
    ]) {
        const b = (await req(u)).body;
        const dom = domCrumbs(b), names = jsonldCrumbNames(b);
        const lp = u.startsWith('/en') ? '/en' : '';
        check(`${u}: DOM ≡ JSON-LD (7 rungs)`, dom.length === 7 && JSON.stringify(dom) === JSON.stringify(names), `dom=${JSON.stringify(dom)}`);
        check(`${u}: rungs = [Home,${hub},${country},${city},2026,${mn},17]`, !!names && names.slice(1).join('|') === [hub, country, city, '2026', mn, '17'].join('|'), JSON.stringify(names));
        check(`${u}: year rung → /moon/saudi-arabia/riyadh/2026 · month rung → …/2026/06`,
            new RegExp('id="bc-md-year" href="' + lp + '/moon/saudi-arabia/riyadh/2026"').test(b) && new RegExp('id="bc-md-month" href="' + lp + '/moon/saudi-arabia/riyadh/2026/06"').test(b));
        check(`${u}: city rung ${lp}/moon/saudi-arabia/riyadh · country ${lp}/moon/saudi-arabia`,
            new RegExp('id="bc-md-city" href="' + lp + '/moon/saudi-arabia/riyadh"').test(b) && new RegExp('id="bc-md-country" href="' + lp + '/moon/saudi-arabia"').test(b));
    }

    // ── C) hero chips · day summary · day details · prev/next day · back · FAQ · hreflang ──
    console.log('\n── C) hero chips · day summary · day details · prev/next day · back · FAQ · hreflang ──');
    {
        const b = (await req('/moon/saudi-arabia/riyadh/2026/06/17')).body;
        check('hero card #moon-day-hero is a .section-card', /<header class="section-card moon-year-hero" id="moon-day-hero">/.test(b));
        check('hero has 7 info chips (city/date/weekday/tz/phase/illum/age)', count(b, /class="my-chip"/g) === 7, `${count(b, /class="my-chip"/g)} chips`);
        check('chips show المدينة + التاريخ + اليوم + التوقيت + الطور + الإضاءة + العمر',
            ['المدينة', 'التاريخ', 'اليوم', 'التوقيت المحلي', 'الطور', 'الإضاءة', 'العمر'].every(l => b.includes(l)));
        check('chips carry live values (Asia/Riyadh · 17 يونيو 2026)', b.includes('Asia/Riyadh') && b.includes('17 يونيو 2026'));
        check('day summary present (#moon-day-summary) + note', /id="moon-day-summary"/.test(b) && /class="my-sum-note"/.test(b));
        check('day details present (#moon-day-details) + intro', /id="moon-day-details"/.test(b) && /class="my-table-intro"/.test(b));
        const _calHead = (b.match(/id="moon-day-details"[\s\S]*?<\/thead>/) || [''])[0];
        check('6 detail columns (date/day/phase/illum/age/nearest)', count(_calHead, /<th>/g) === 6, `${count(_calHead, /<th>/g)} th`);
        check('details row has the city-local date 17 يونيو 2026', /id="moon-day-details"[\s\S]*?17 يونيو 2026/.test(b));
        check('month-calendar link (#moon-day-details → /2026/06)', /class="moon-day-monthlink"[\s\S]*?href="\/moon\/saudi-arabia\/riyadh\/2026\/06"/.test(b.replace(/\n/g, '')));
        check('prev + next DAY links (06/16 + 06/18)', b.includes('/moon/saudi-arabia/riyadh/2026/06/16') && b.includes('/moon/saudi-arabia/riyadh/2026/06/18'));
        check('back links → month + year + city', b.includes('href="/moon/saudi-arabia/riyadh/2026/06"') && b.includes('href="/moon/saudi-arabia/riyadh/2026"') && /class="my-back-link"[^>]*href="\/moon\/saudi-arabia\/riyadh"/.test(b.replace(/\n/g, '')));
        check('NO links to the legacy day route /moon-in-riyadh/2026-06-17', count(b, /href="\/moon-in-riyadh\/2026-06-17"/g) === 0);
        check('5 SSR FAQ (.moon-faq-item) + FAQPage JSON-LD', count(b, /class="moon-faq-item"/g) === 5 && /"@type":"FAQPage"/.test(b), `${count(b, /class="moon-faq-item"/g)} faq`);
        check('NO Event schema (phases are not events)', !/"@type":"Event"/.test(b));
        const hl = new Set((b.match(/hreflang="([a-z-]+)"/g) || []).map(x => x.replace(/hreflang="|"/g, '')));
        check('hreflang 10 langs + x-default', ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'].every(l => hl.has(l)) && hl.has('x-default'));
        check('indexable (no noindex)', !/<meta name="robots"[^>]*noindex/i.test(b));
        const t = (b.match(/<title>([^<]*)<\/title>/) || [])[1];
        check('AR title = "حالة القمر في الرياض 17 يونيو 2026 | طور القمر والإضاءة"', t === 'حالة القمر في الرياض 17 يونيو 2026 | طور القمر والإضاءة', t);
        const h1 = (b.match(/<h1[^>]*id="moon-day-h1">[\s\S]*?<span>([^<]*)<\/span>/) || [])[1];
        check('AR H1 = "حالة القمر في الرياض يوم 17 يونيو 2026"', h1 === 'حالة القمر في الرياض يوم 17 يونيو 2026', h1);
    }
    {
        const en = (await req('/en/moon/saudi-arabia/riyadh/2026/06/17')).body;
        check('EN title = "Moon Phase in Riyadh on June 17, 2026 | Illumination and Moon Age"', (en.match(/<title>([^<]*)<\/title>/) || [])[1] === 'Moon Phase in Riyadh on June 17, 2026 | Illumination and Moon Age');
        check('EN H1 = "Moon Phase in Riyadh on June 17, 2026"', (en.match(/<h1[^>]*id="moon-day-h1">[\s\S]*?<span>([^<]*)<\/span>/) || [])[1] === 'Moon Phase in Riyadh on June 17, 2026');
    }

    // ── D) prev/next day CROSS-MONTH + CROSS-YEAR boundaries ──
    console.log('\n── D) prev/next day cross-month + cross-year boundaries ──');
    {
        const jun1 = (await req('/moon/saudi-arabia/riyadh/2026/06/01')).body;
        check('Jun 1: prev = May 31 (/2026/05/31) + next = Jun 2 (/2026/06/02)', jun1.includes('/moon/saudi-arabia/riyadh/2026/05/31') && jun1.includes('/moon/saudi-arabia/riyadh/2026/06/02'));
        const jun30 = (await req('/moon/saudi-arabia/riyadh/2026/06/30')).body;
        check('Jun 30: next = Jul 1 (/2026/07/01) + prev = Jun 29 (/2026/06/29)', jun30.includes('/moon/saudi-arabia/riyadh/2026/07/01') && jun30.includes('/moon/saudi-arabia/riyadh/2026/06/29'));
        const jan1 = (await req('/moon/saudi-arabia/riyadh/2026/01/01')).body;
        check('Jan 1 2026: prev = Dec 31 2025 (/2025/12/31)', jan1.includes('/moon/saudi-arabia/riyadh/2025/12/31'));
        const dec31 = (await req('/moon/saudi-arabia/riyadh/2026/12/31')).body;
        check('Dec 31 2026: next = Jan 1 2027 (/2027/01/01)', dec31.includes('/moon/saudi-arabia/riyadh/2027/01/01'));
    }

    // ── E) validation: deeper/dash/bad-day/bad-month 404 · leap-aware · mismatch 301 · unknown 404 ──
    console.log('\n── E) validation (today/dash/bad-day/bad-month 404 · leap-aware · mismatch 301 · unknown 404) ──');
    for (const u of [
        '/moon/saudi-arabia/riyadh/today', '/moon/saudi-arabia/riyadh/2026-06-17', '/moon/saudi-arabia/riyadh/2026-06',
        '/moon/saudi-arabia/riyadh/2026/6/17', '/moon/saudi-arabia/riyadh/2026/06/7',
        '/moon/saudi-arabia/riyadh/2026/06/00', '/moon/saudi-arabia/riyadh/2026/06/32',
        '/moon/saudi-arabia/riyadh/2026/02/30', '/moon/saudi-arabia/riyadh/2026/13/01',
        '/moon/saudi-arabia/riyadh/2026/06/17/extra', '/moon/saudi-arabia/riyadh/1899/06/17', '/moon/saudi-arabia/riyadh/2101/06/17',
        '/moon/saudi-arabia/notacity/2026/06/17', '/moon/zzz-not-a-country/riyadh/2026/06/17',
    ]) {
        const r = await req(u);
        check(`${u} → 404 (not served)`, r.status === 404 && !pageActive(r.body, 'page-moon-day'), `status=${r.status}`);
    }
    // leap-aware day-of-month: 2024-02-29 valid (leap), 2026-02-29 invalid (non-leap)
    check('/moon/saudi-arabia/riyadh/2024/02/29 → 200 (leap year)', (await req('/moon/saudi-arabia/riyadh/2024/02/29')).status === 200);
    check('/moon/saudi-arabia/riyadh/2026/02/29 → 404 (non-leap)', (await req('/moon/saudi-arabia/riyadh/2026/02/29')).status === 404);
    check('/moon/saudi-arabia/riyadh/2026/04/31 → 404 (April has 30 days)', (await req('/moon/saudi-arabia/riyadh/2026/04/31')).status === 404);
    {
        const r = await req('/moon/united-states/riyadh/2026/06/17');
        check('/moon/united-states/riyadh/2026/06/17 → 301 /moon/saudi-arabia/riyadh/2026/06/17 (mismatch)', r.status === 301 && r.loc === '/moon/saudi-arabia/riyadh/2026/06/17', `status=${r.status} loc=${r.loc}`);
        const re = await req('/en/moon/united-states/riyadh/2026/06/17');
        check('/en/… mismatch → 301 /en/moon/saudi-arabia/riyadh/2026/06/17 (lang preserved)', re.status === 301 && re.loc === '/en/moon/saudi-arabia/riyadh/2026/06/17', `status=${re.status} loc=${re.loc}`);
    }

    // ── F) sitemap: day pages NOT bulk-added (month pages still present) ──
    console.log('\n── F) sitemap-cities: day pages NOT bulk-added · month pages present ──');
    {
        const smc = (await req('/sitemap-cities-1.xml')).body;
        check('sitemap: NO bulk day pages /moon/{c}/{city}/{yyyy}/{mm}/{dd}', !/\/moon\/[a-z-]+\/[a-z-]+\/\d{4}\/\d{2}\/\d{2}<\/loc>/.test(smc), `${(smc.match(/\/moon\/[a-z-]+\/[a-z-]+\/\d{4}\/\d{2}\/\d{2}<\/loc>/g) || []).length} day locs`);
        check('sitemap: still has nested month /moon/saudi-arabia/medina/{yyyy}/{mm}', /\/moon\/saudi-arabia\/medina\/\d{4}\/\d{2}<\/loc>/.test(smc));
        check('sitemap: NO nested today /moon/{c}/{city}/today', !/\/moon\/[a-z-]+\/[a-z-]+\/today<\/loc>/.test(smc));
    }

    // ── G) MONTH page day links now point at the NEW nested day route ──
    console.log('\n── G) month page day links → new nested /moon/{country}/{city}/{yyyy}/{mm}/{dd} ──');
    {
        const m = (await req('/moon/saudi-arabia/riyadh/2026/06')).body;
        check('month page: 30 day links → /moon/saudi-arabia/riyadh/2026/06/NN', count(m, /class="my-day-link" href="\/moon\/saudi-arabia\/riyadh\/2026\/06\/\d\d"/g) === 30, `${count(m, /class="my-day-link" href="\/moon\/saudi-arabia\/riyadh\/2026\/06\/\d\d"/g)}`);
        check('month page: day links NO LONGER use legacy /moon-in-riyadh/2026-06-NN', count(m, /href="\/moon-in-riyadh\/2026-06-\d\d"/g) === 0);
    }

    // ── H) legacy routes untouched (no redirect) + Meeus 49 unchanged ──
    console.log('\n── H) legacy routes untouched (no redirect) + Meeus 49 unchanged ──');
    check('/moon-in-riyadh/2026-06-17 still 200 (legacy day — NOT redirected)', (await req('/moon-in-riyadh/2026-06-17')).status === 200);
    check('/moon-in-riyadh/2026-06 still 200 (legacy month)', (await req('/moon-in-riyadh/2026-06')).status === 200);
    check('/moon-today-in-riyadh still 200', (await req('/moon-today-in-riyadh')).status === 200);
    check('/moon/saudi-arabia/riyadh/2026/06 still 200 (month)', (await req('/moon/saudi-arabia/riyadh/2026/06')).status === 200);
    check('/moon/saudi-arabia/riyadh/2026 still 200 (year)', (await req('/moon/saudi-arabia/riyadh/2026')).status === 200);
    check('/moon/saudi-arabia/riyadh still 200 (hub)', (await req('/moon/saudi-arabia/riyadh')).status === 200);
    check('/moon/saudi-arabia still 200 (country)', (await req('/moon/saudi-arabia')).status === 200);
    check('/moon still 200', (await req('/moon')).status === 200);
    {
        const grid = (await req('/moon-in-riyadh/2026-06')).body;
        const ok15 = /2026-06-15[\s\S]{0,260}?المحاق/.test(grid), ok30 = /2026-06-30[\s\S]{0,260}?البدر/.test(grid);
        check('Meeus 49 unchanged: 15 Jun=المحاق · 30 Jun=البدر', ok15 && ok30, `15=${ok15} 30=${ok30}`);
    }

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ unexpected', e && e.stack || e); exitCode = 1;
} finally { s.kill('SIGKILL'); }
process.exit(exitCode);
