// MOON-CITY-MONTH-ROUTE-STRUCTURE-ADD-1 — dedicated smoke for the city MONTH page.
//
// Pins the contract: /[lang/]moon/{country}/{city}/{yyyy}/{mm} is the city MONTH page —
// 200, single H1, self canonical + 10-lang hreflang, 6-level breadcrumb (Home › Moon
// Phase › {Country} › {City} › {yyyy} › {Month}) DOM ≡ BreadcrumbList JSON-LD, SSR hero
// (desc + 7 info chips + quick-nav anchors), month summary, an SSR daily calendar with
// EVERY day of the month (June 2026 = 30 rows) whose day links use the NEW nested day route
// /moon/{country}/{city}/{yyyy}/{mm}/{dd} (live since MOON-CITY-DAY-ROUTE-STRUCTURE-ADD-1), prev/next
// month (cross-year), back links, and a 6-question FAQ with matching FAQPage JSON-LD (no
// Event schema). Validation: deeper day / today / dash / bad month → 404, wrong country →
// 301. Year-page month cards now point at the new nested route. Legacy routes + Meeus 49
// untouched; no redirect added from /moon-in-{city}/{yyyy-mm}.
//
// Run: node scripts/_smoke_moon_city_month_route_structure_add_1.mjs
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (label, ok, extra) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); };

const PORT = 8233;
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
    const out = []; const re = /(?:<a[^>]*class="bc-link[^"]*"[^>]*>|<li[^>]*id="bc-mm-month"[^>]*>)([^<]*)</g; let m;
    while ((m = re.exec(nav)) !== null) { const t = m[1].trim(); if (t) out.push(t); }
    return out;
}
function jsonldCrumbNames(b) {
    const i = b.indexOf('"@type":"BreadcrumbList"'); if (i < 0) return null;
    const m = b.slice(i).match(/"itemListElement":\[([\s\S]*?)\]/); if (!m) return null;
    return (m[1].match(/"name":"([^"]*)"/g) || []).map(s => s.replace(/^"name":"/, '').replace(/"$/, ''));
}

let exitCode = 1;
let SITE = `http://localhost:${PORT}`;
const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
try {
    if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }
    SITE = (canonOf((await req('/moon/saudi-arabia/riyadh/2026/06')).body).match(/^(https?:\/\/[^/]+)/) || [])[1] || SITE;

    // ── A) month page = 200, #page-moon-month active, 1 H1, self canonical (multi-country) ──
    console.log('── A) month page = 200 + #page-moon-month active + 1 H1 + self canonical ──');
    for (const u of ['/moon/saudi-arabia/riyadh/2026/06', '/en/moon/saudi-arabia/riyadh/2026/06', '/moon/united-states/new-york/2027/01', '/fr/moon/saudi-arabia/jeddah/2025/12']) {
        const r = await req(u);
        const ok = r.status === 200 && pageActive(r.body, 'page-moon-month') && count(r.body, /<h1\b/g) === 1 && canonOf(r.body) === SITE + u && r.body.length > 60000;
        check(`${u}: 200 + page-moon-month + 1 H1 + self canonical`, ok, `status=${r.status} pmm=${pageActive(r.body, 'page-moon-month')} h1=${count(r.body, /<h1\b/g)} canon=${canonOf(r.body)}`);
    }

    // ── A2) NO leaked sections + NO orphaned comment text + balanced comments ──
    console.log('\n── A2) NO leaked #page-moon / #page-moon-year sections + balanced comments ──');
    for (const u of ['/moon/saudi-arabia/riyadh/2026/06', '/en/moon/saudi-arabia/riyadh/2026/06']) {
        const b = (await req(u)).body;
        const leaked = ['moon-general-faq', 'moon-hub-related-links', 'moon-events-section', 'moon-hub-hero', 'moon-event-ramadan', 'moon-year-summary', 'moon-page-h1']
            .filter(id => new RegExp('id="' + id + '"').test(b));
        check(`${u}: 0 leaked hub/year section IDs`, leaked.length === 0, `leaked=[${leaked.join(',')}]`);
        const opens = (b.match(/<!--/g) || []).length, closes = (b.match(/-->/g) || []).length;
        check(`${u}: HTML comments balanced (<!-- == -->)`, opens === closes, `open=${opens} close=${closes}`);
        check(`${u}: #page-moon-month max-width container present`, /#page-moon-month\{[^}]*max-width:1100px/.test(b));
    }

    // ── B) 6-level breadcrumb DOM ≡ JSON-LD (AR + EN) ──
    console.log('\n── B) 6-level breadcrumb DOM ≡ JSON-LD (Home › Moon Phase › Country › City › Year › Month) ──');
    for (const [u, hub, country, city, mn] of [
        ['/moon/saudi-arabia/riyadh/2026/06', 'حالة القمر', 'المملكة العربية السعودية', 'الرياض', 'يونيو'],
        ['/en/moon/saudi-arabia/riyadh/2026/06', 'Moon Phase', 'Saudi Arabia', 'Riyadh', 'June'],
    ]) {
        const b = (await req(u)).body;
        const dom = domCrumbs(b), names = jsonldCrumbNames(b);
        const lp = u.startsWith('/en') ? '/en' : '';
        check(`${u}: DOM ≡ JSON-LD (6 rungs)`, dom.length === 6 && JSON.stringify(dom) === JSON.stringify(names), `dom=${JSON.stringify(dom)}`);
        check(`${u}: rungs = [Home,${hub},${country},${city},2026,${mn}]`, !!names && names.slice(1).join('|') === [hub, country, city, '2026', mn].join('|'), JSON.stringify(names));
        check(`${u}: year rung links to ${lp}/moon/saudi-arabia/riyadh/2026`, new RegExp('id="bc-mm-year" href="' + lp + '/moon/saudi-arabia/riyadh/2026"').test(b));
        check(`${u}: city rung ${lp}/moon/saudi-arabia/riyadh · country ${lp}/moon/saudi-arabia`,
            new RegExp('id="bc-mm-city" href="' + lp + '/moon/saudi-arabia/riyadh"').test(b) && new RegExp('id="bc-mm-country" href="' + lp + '/moon/saudi-arabia"').test(b));
    }

    // ── C) hero chips + daily calendar (30 days, nested day links) + summary + prev/next + back + FAQ + hreflang ──
    console.log('\n── C) hero chips · daily calendar (June=30) · day links legacy · summary · prev/next · back · FAQ · hreflang ──');
    {
        const b = (await req('/moon/saudi-arabia/riyadh/2026/06')).body;
        check('hero card #moon-month-hero is a .section-card', /<header class="section-card moon-year-hero" id="moon-month-hero">/.test(b));
        check('hero has 7 info chips (city/month/year/tz/days/full/new)', count(b, /class="my-chip"/g) === 7, `${count(b, /class="my-chip"/g)} chips`);
        check('chips show المدينة + الشهر + السنة + التوقيت + عدد أيام الشهر + البدر + المحاق',
            ['المدينة', 'الشهر', 'السنة', 'التوقيت المحلي', 'عدد أيام الشهر', 'البدر', 'المحاق'].every(l => b.includes(l)));
        check('chips carry live values (Asia/Riyadh · 30 days)', b.includes('Asia/Riyadh') && /<b>30<\/b>/.test(b));
        check('month summary present (#moon-month-summary)', /id="moon-month-summary"/.test(b) && /class="my-sum-note"/.test(b));
        check('daily calendar present (#moon-month-calendar) + intro', /id="moon-month-calendar"/.test(b) && /class="my-table-intro"/.test(b));
        const _calHead = (b.match(/id="moon-month-calendar"[\s\S]*?<\/thead>/) || [''])[0];
        check('5 table columns (date/day/phase/illum/age)', count(_calHead, /<th>/g) === 5, `${count(_calHead, /<th>/g)} th`);
        check('June 2026 = exactly 30 day rows', count(b, /class="my-day-link"/g) === 30, `${count(b, /class="my-day-link"/g)} rows`);
        // MOON-CITY-DAY-ROUTE-STRUCTURE-ADD-1 §3: day links now use the NEW nested day route.
        check('day links use NEW nested day route /moon/saudi-arabia/riyadh/2026/06/NN (30)', count(b, /href="\/moon\/saudi-arabia\/riyadh\/2026\/06\/\d\d"/g) === 30, `${count(b, /href="\/moon\/saudi-arabia\/riyadh\/2026\/06\/\d\d"/g)}`);
        check('day links NO LONGER use the legacy /moon-in-riyadh/2026-06-NN route', count(b, /href="\/moon-in-riyadh\/2026-06-\d\d"/g) === 0, `${count(b, /href="\/moon-in-riyadh\/2026-06-\d\d"/g)}`);
        check('prev + next month links (2026/05 + 2026/07)', b.includes('/moon/saudi-arabia/riyadh/2026/05') && b.includes('/moon/saudi-arabia/riyadh/2026/07'));
        check('back links → year + city', b.includes('href="/moon/saudi-arabia/riyadh/2026"') && /class="my-back-link"[^>]*href="\/moon\/saudi-arabia\/riyadh"/.test(b.replace(/\n/g, '')));
        check('6 SSR FAQ (.moon-faq-item) + FAQPage JSON-LD', count(b, /class="moon-faq-item"/g) === 6 && /"@type":"FAQPage"/.test(b), `${count(b, /class="moon-faq-item"/g)} faq`);
        check('NO Event schema (phases are not events)', !/"@type":"Event"/.test(b));
        const hl = new Set((b.match(/hreflang="([a-z-]+)"/g) || []).map(x => x.replace(/hreflang="|"/g, '')));
        check('hreflang 10 langs + x-default', ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'].every(l => hl.has(l)) && hl.has('x-default'));
        check('indexable (no noindex)', !/<meta name="robots"[^>]*noindex/i.test(b));
        const t = (b.match(/<title>([^<]*)<\/title>/) || [])[1];
        check('AR title = "تقويم القمر في الرياض يونيو 2026 | أطوار القمر اليومية"', t === 'تقويم القمر في الرياض يونيو 2026 | أطوار القمر اليومية', t);
    }
    // EN title + the day-count correctness for other month lengths
    {
        const en = (await req('/en/moon/saudi-arabia/riyadh/2026/06')).body;
        check('EN title = "Moon Calendar in Riyadh June 2026 | Daily Moon Phases"', (en.match(/<title>([^<]*)<\/title>/) || [])[1] === 'Moon Calendar in Riyadh June 2026 | Daily Moon Phases');
        const jan = (await req('/moon/saudi-arabia/riyadh/2026/01')).body;   // 31 days
        check('January 2026 = 31 day rows', count(jan, /class="my-day-link"/g) === 31, `${count(jan, /class="my-day-link"/g)}`);
        const feb = (await req('/moon/saudi-arabia/riyadh/2026/02')).body;   // 28 days (2026 not leap)
        check('February 2026 = 28 day rows', count(feb, /class="my-day-link"/g) === 28, `${count(feb, /class="my-day-link"/g)}`);
        const feb24 = (await req('/moon/saudi-arabia/riyadh/2024/02')).body; // 29 (leap)
        check('February 2024 = 29 day rows (leap year)', count(feb24, /class="my-day-link"/g) === 29, `${count(feb24, /class="my-day-link"/g)}`);
    }

    // ── D) prev/next month CROSS-YEAR boundaries ──
    console.log('\n── D) prev/next month cross-year (Jan prev = Dec prev-year · Dec next = Jan next-year) ──');
    {
        const janB = (await req('/moon/saudi-arabia/riyadh/2026/01')).body;
        check('Jan 2026: prev = Dec 2025 (/2025/12) + next = Feb (/2026/02)', janB.includes('/moon/saudi-arabia/riyadh/2025/12') && janB.includes('/moon/saudi-arabia/riyadh/2026/02'));
        const decB = (await req('/moon/saudi-arabia/riyadh/2026/12')).body;
        check('Dec 2026: next = Jan 2027 (/2027/01) + prev = Nov (/2026/11)', decB.includes('/moon/saudi-arabia/riyadh/2027/01') && decB.includes('/moon/saudi-arabia/riyadh/2026/11'));
    }

    // ── E) validation: deeper/dash/bad-month 404 · mismatch 301 · unknown 404 ──
    console.log('\n── E) validation (deeper/dash/bad-month/bad-year 404 · mismatch 301 · unknown 404) ──');
    for (const u of [
        // /2026/06/17 (the day page) is now LIVE 200 since MOON-CITY-DAY-ROUTE-STRUCTURE-ADD-1;
        // only the path DEEPER than a day (…/{dd}/extra) and today/dash stay 404 here.
        '/moon/saudi-arabia/riyadh/2026/06/17/extra', '/moon/saudi-arabia/riyadh/today',
        '/moon/saudi-arabia/riyadh/2026-06', '/moon/saudi-arabia/riyadh/2026-06-17',
        '/moon/saudi-arabia/riyadh/2026/6', '/moon/saudi-arabia/riyadh/2026/00', '/moon/saudi-arabia/riyadh/2026/13',
        '/moon/saudi-arabia/riyadh/2026/abc', '/moon/saudi-arabia/riyadh/1899/06', '/moon/saudi-arabia/riyadh/2101/06',
        '/moon/saudi-arabia/notacity/2026/06', '/moon/zzz-not-a-country/riyadh/2026/06',
    ]) {
        const r = await req(u);
        check(`${u} → 404 (not served)`, r.status === 404 && !pageActive(r.body, 'page-moon-month'), `status=${r.status}`);
    }
    {
        const r = await req('/moon/united-states/riyadh/2026/06');
        check('/moon/united-states/riyadh/2026/06 → 301 /moon/saudi-arabia/riyadh/2026/06 (mismatch)', r.status === 301 && r.loc === '/moon/saudi-arabia/riyadh/2026/06', `status=${r.status} loc=${r.loc}`);
        const re = await req('/en/moon/united-states/riyadh/2026/06');
        check('/en/… mismatch → 301 /en/moon/saudi-arabia/riyadh/2026/06 (lang preserved)', re.status === 301 && re.loc === '/en/moon/saudi-arabia/riyadh/2026/06', `status=${re.status} loc=${re.loc}`);
    }

    // ── F) sitemap: month pages in, deeper day/today NOT in ──
    console.log('\n── F) sitemap-cities: month pages in, deeper day/today out ──');
    {
        const smc = (await req('/sitemap-cities-1.xml')).body;
        const cy = new Date().getFullYear();
        check(`sitemap has current-year month /moon/saudi-arabia/medina/${cy}/06`, smc.includes(`${SITE}/moon/saudi-arabia/medina/${cy}/06</loc>`));
        check('sitemap has all 12 months for the current year (city)', Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).every(mm => smc.includes(`/moon/saudi-arabia/medina/${cy}/${mm}</loc>`)));
        check('sitemap: NO nested day /moon/{c}/{city}/{yyyy}/{mm}/{dd}', !/\/moon\/[a-z-]+\/[a-z-]+\/\d{4}\/\d{2}\/\d{2}<\/loc>/.test(smc));
        check('sitemap: NO nested today /moon/{c}/{city}/today', !/\/moon\/[a-z-]+\/[a-z-]+\/today<\/loc>/.test(smc));
    }

    // ── G) YEAR page month cards now point at the NEW nested month route ──
    console.log('\n── G) year page month cards → new nested /moon/{country}/{city}/{yyyy}/{mm} ──');
    {
        const y = (await req('/moon/saudi-arabia/riyadh/2026')).body;
        check('year page: 12 month cards → /moon/saudi-arabia/riyadh/2026/NN', count(y, /class="my-month-card" href="\/moon\/saudi-arabia\/riyadh\/2026\/\d\d"/g) === 12, `${count(y, /class="my-month-card" href="\/moon\/saudi-arabia\/riyadh\/2026\/\d\d"/g)}`);
        check('year page: month cards NO LONGER use legacy /moon-in-riyadh/2026-NN', count(y, /class="my-month-card" href="\/moon-in-riyadh\//g) === 0);
    }

    // ── H) legacy routes untouched + Meeus 49 unchanged ──
    console.log('\n── H) legacy routes untouched (no redirect) + Meeus 49 unchanged ──');
    check('/moon-in-riyadh/2026-06 still 200 (legacy month — NOT redirected)', (await req('/moon-in-riyadh/2026-06')).status === 200);
    check('/moon-in-riyadh/2026-06-17 still 200 (legacy day)', (await req('/moon-in-riyadh/2026-06-17')).status === 200);
    check('/moon-today-in-riyadh still 200', (await req('/moon-today-in-riyadh')).status === 200);
    check('/moon/saudi-arabia/riyadh/2026 still 200 (year)', (await req('/moon/saudi-arabia/riyadh/2026')).status === 200);
    check('/moon/saudi-arabia/riyadh still 200 (hub)', (await req('/moon/saudi-arabia/riyadh')).status === 200);
    check('/moon/saudi-arabia still 200 (country)', (await req('/moon/saudi-arabia')).status === 200);
    check('/moon still 200', (await req('/moon')).status === 200);
    {
        const grid = (await req('/moon-in-riyadh/2026-06')).body;
        check('Meeus 49 unchanged: 15 Jun=المحاق · 30 Jun=البدر', /2026-06-15[\s\S]{0,260}?المحاق/.test(grid) && /2026-06-30[\s\S]{0,260}?البدر/.test(grid));
    }

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ unexpected', e && e.message); exitCode = 1;
} finally { s.kill('SIGKILL'); }
process.exit(exitCode);
