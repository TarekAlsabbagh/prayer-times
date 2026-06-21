// MOON-CITY-YEAR-ROUTE-STRUCTURE-ADD-1 — dedicated smoke for the city YEAR page.
//
// Pins the contract: /[lang/]moon/{country}/{city}/{yyyy} is the city YEAR overview —
// 200, single H1, self canonical + 10-lang hreflang, 5-level breadcrumb (Home › Moon
// Phase › {Country} › {City} › {yyyy}) DOM ≡ BreadcrumbList JSON-LD, SSR-visible major-
// phases table + 12 month cards (each → the NEW nested month route /moon/{country}/{city}/
// {yyyy}/{mm}, live since MOON-CITY-MONTH-ROUTE-STRUCTURE-ADD-1) + prev/next-year links + 5-6 FAQ. Validation:
// unknown country/city → 404, wrong country → 301, bad/non-4-digit/out-of-range year →
// 404, and the deeper today/month/day + dash forms stay clean 404. Legacy moon routes
// and Meeus 49 are untouched.
//
// Run: node scripts/_smoke_moon_city_year_route_structure_add_1.mjs
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (label, ok, extra) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); };

const PORT = 8232;
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
const h1Count = (b) => (b.match(/<h1\b/g) || []).length;
const count = (b, re) => (b.match(re) || []).length;
function domCrumbs(b) {
    const nav = (b.match(/<nav class="moon-breadcrumb"[\s\S]*?<\/nav>/) || [''])[0];
    const out = []; const re = /(?:<a[^>]*class="bc-link[^"]*"[^>]*>|<li[^>]*id="bc-my-year"[^>]*>)([^<]*)</g; let m;
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
    SITE = (canonOf((await req('/moon/saudi-arabia/riyadh/2026')).body).match(/^(https?:\/\/[^/]+)/) || [])[1] || SITE;

    // ── A) year page = 200, #page-moon-year active, 1 H1, self canonical (multi-country) ──
    console.log('── A) year page = 200 + #page-moon-year active + 1 H1 + self canonical ──');
    for (const u of ['/moon/saudi-arabia/riyadh/2026', '/en/moon/saudi-arabia/riyadh/2026', '/moon/united-states/new-york/2027', '/fr/moon/saudi-arabia/jeddah/2025']) {
        const r = await req(u);
        const ok = r.status === 200 && pageActive(r.body, 'page-moon-year') && h1Count(r.body) === 1 && canonOf(r.body) === SITE + u && r.body.length > 60000;
        check(`${u}: 200 + page-moon-year + 1 H1 + self canonical`, ok, `status=${r.status} pmy=${pageActive(r.body, 'page-moon-year')} h1=${h1Count(r.body)} canon=${canonOf(r.body)}`);
    }

    // ── A2) NO leaked sections / NO orphaned comment text (…-FIX-1 regression) ──
    //   Root cause was _stripElement miscounting <div>/</div> tokens written inside HTML
    //   comments in #page-moon (e.g. a literal "</div>" in a doc-comment), so stripping
    //   #page-moon for the year page terminated early → it leaked moon-general-faq /
    //   moon-hub-related-links / moon-events-section + orphaned comment fragments as
    //   VISIBLE text. These guards fail loudly if that ever regresses.
    console.log('\n── A2) NO leaked #page-moon sections + NO orphaned comment text (FIX-1) ──');
    for (const u of ['/moon/saudi-arabia/riyadh/2026', '/en/moon/saudi-arabia/riyadh/2026']) {
        const b = (await req(u)).body;
        const leakedIds = ['moon-general-faq', 'moon-hub-related-links', 'moon-events-section', 'moon-date-edu-hijri', 'moon-hub-hero', 'moon-page-h1']
            .filter(id => new RegExp('id="' + id + '"').test(b));
        check(`${u}: 0 leaked #page-moon section IDs`, leakedIds.length === 0, `leaked=[${leakedIds.join(',')}]`);
        // orphaned developer/technical text must NOT appear in the served HTML
        const techText = ['closing </div>', 'LAST visible section', 'moon-general-faq and moon-hub-related-links', 'MOON-EVENTS-MOVE-BOTTOM', 'closing #page-moon']
            .filter(t => b.includes(t));
        check(`${u}: 0 orphaned technical/comment text`, techText.length === 0, `found=[${techText.join(' | ')}]`);
        // every HTML comment must be balanced (a stripped "<!--" with a surviving "-->" = leak)
        const opens = (b.match(/<!--/g) || []).length, closes = (b.match(/-->/g) || []).length;
        check(`${u}: HTML comments balanced (<!-- == -->)`, opens === closes, `open=${opens} close=${closes}`);
        // the page must NOT carry the live moon hub or the Islamic-events countdown widget
        check(`${u}: no moon-event-ramadan / hub search leaked`, !/id="moon-event-ramadan"/.test(b) && !/id="moon-hub-search"/.test(b));
        // centred content container present (layout fix)
        check(`${u}: #page-moon-year max-width container present`, /#page-moon-year\{[^}]*max-width:1100px/.test(b));
    }

    // ── A3) HERO: card + description + 6 info chips + 3 quick-nav anchors (…-HERO) ──
    console.log('\n── A3) Hero card: description + info chips (city/year/tz/events/full/new) + quick-nav anchors ──');
    {
        const b = (await req('/moon/saudi-arabia/riyadh/2026')).body;
        check('hero card #moon-year-hero is a .section-card', /<header class="section-card moon-year-hero" id="moon-year-hero">/.test(b));
        check('hero body has the short description (.my-hero-desc)', /<div id="moon-year-hero-body">[\s\S]*?class="my-hero-desc"/.test(b));
        check('hero has 6 info chips', count(b, /class="my-chip"/g) === 6, `${count(b, /class="my-chip"/g)} chips`);
        check('chips show المدينة + السنة + التوقيت المحلي + الأحداث الكبرى + البدر + المحاق',
            ['المدينة', 'السنة', 'التوقيت المحلي', 'الأحداث الكبرى', 'البدر', 'المحاق'].every(l => b.includes(l)));
        check('chips carry the live values (Asia/Riyadh · 50 · 13 مرة · 12 مرة)', b.includes('Asia/Riyadh') && /<b>50<\/b>/.test(b) && b.includes('<b>13 مرة</b>') && b.includes('<b>12 مرة</b>'));
        check('3 quick-nav anchors → #moon-year-summary / #table / #months', /href="#moon-year-summary"/.test(b) && /href="#moon-year-table"/.test(b) && /href="#moon-year-months"/.test(b));
        check('summary card has the local-time note (.my-sum-note)', /id="moon-year-summary"[\s\S]*?class="my-sum-note"/.test(b));
        check('phases table has an intro paragraph (.my-table-intro)', /id="moon-year-table"[\s\S]*?class="my-table-intro"[\s\S]*?class="my-table"/.test(b));
        check('old standalone .moon-year-intro NOT duplicated', !/class="moon-year-intro"/.test(b));
        // SEO title carries the value-add suffix; H1 stays without it (matches page intent)
        const arT = (await req('/moon/saudi-arabia/riyadh/2026')).body.match(/<title>([^<]*)<\/title>/);
        const enT = (await req('/en/moon/saudi-arabia/riyadh/2026')).body.match(/<title>([^<]*)<\/title>/);
        check('AR title = "تقويم القمر في الرياض 2026 | مواعيد البدر والمحاق"', arT && arT[1] === 'تقويم القمر في الرياض 2026 | مواعيد البدر والمحاق', arT && arT[1]);
        check('EN title = "Moon Calendar in Riyadh 2026 | Full Moon and New Moon Dates"', enT && enT[1] === 'Moon Calendar in Riyadh 2026 | Full Moon and New Moon Dates', enT && enT[1]);
        check('H1 keeps "لعام 2026" (no SEO suffix) — matches page intent', /id="moon-year-h1">[\s\S]*?تقويم القمر في الرياض لعام 2026[\s\S]*?<\/h1>/.test(b));
        // heading hierarchy: exactly 1 H1 + the four section H2s
        const h2s = (b.match(/<h2[^>]*>/g) || []).length;
        check('exactly 1 H1', count(b, /<h1\b/g) === 1);
        check('≥ 4 H2 section headings (summary/table/months/faq)', h2s >= 4, `${h2s} h2`);
        // structured data: BreadcrumbList + FAQPage only — NO Event schema for full/new moons
        check('NO Event schema (full/new moons are not events)', !/"@type":"Event"/.test(b));
        check('still has BreadcrumbList + FAQPage', /"@type":"BreadcrumbList"/.test(b) && /"@type":"FAQPage"/.test(b));
        // the quick-nav anchor handler must exist in app.js: a hashchange→initFromURL listener
        // means a native <a href="#…"> would re-route to home, so the handler MUST preventDefault
        // + scrollIntoView. Guard against it silently regressing.
        const appJs = (await req('/js/app.js')).body;
        check('app.js carries the .my-anchor preventDefault+scroll handler', /a\.my-anchor\[href\^="#"\]/.test(appJs) && /scrollIntoView/.test(appJs), 'handler present');
    }

    // ── B) 5-level breadcrumb DOM ≡ JSON-LD (AR + EN) ──
    console.log('\n── B) breadcrumb DOM ≡ JSON-LD (Home › Moon Phase › Country › City › Year) ──');
    for (const [u, hub, country, city] of [
        ['/moon/saudi-arabia/riyadh/2026', 'حالة القمر', 'المملكة العربية السعودية', 'الرياض'],
        ['/en/moon/saudi-arabia/riyadh/2026', 'Moon Phase', 'Saudi Arabia', 'Riyadh'],
    ]) {
        const b = (await req(u)).body;
        const dom = domCrumbs(b);
        const names = jsonldCrumbNames(b);
        const lp = u.startsWith('/en') ? '/en' : '';
        check(`${u}: DOM ≡ JSON-LD (5 rungs)`, dom.length === 5 && JSON.stringify(dom) === JSON.stringify(names), `dom=${JSON.stringify(dom)}`);
        check(`${u}: rungs 2-5 = [${hub}, ${country}, ${city}, 2026]`, !!names && names.slice(1).join('|') === [hub, country, city, '2026'].join('|'), JSON.stringify(names));
        check(`${u}: country href ${lp}/moon/saudi-arabia · city href ${lp}/moon/saudi-arabia/riyadh`,
            new RegExp('id="bc-my-country" href="' + lp + '/moon/saudi-arabia"').test(b) && new RegExp('id="bc-my-city" href="' + lp + '/moon/saudi-arabia/riyadh"').test(b));
    }

    // ── C) SSR content: phases table + 12 month cards + prev/next + FAQ + hreflang ──
    // MOON-CITY-MONTH-ROUTE-STRUCTURE-ADD-1 §3: the 12 month cards now point at the NEW nested
    // month route /moon/{country}/{city}/{yyyy}/{mm} (was the legacy /moon-in-{city}/{yyyy-mm}).
    console.log('\n── C) SSR content (table · 12 month cards → new nested month route · prev/next · FAQ · hreflang) ──');
    {
        const b = (await req('/moon/saudi-arabia/riyadh/2026')).body;
        check('major-phases table present + ≥ 40 event rows', /class="my-table"/.test(b) && count(b, /<tbody>[\s\S]*?<\/tbody>/) >= 0 && count(b, /<tr>/g) >= 40, `${count(b, /<tr>/g)} rows`);
        check('exactly 12 month cards', count(b, /class="my-month-card"/g) === 12, `${count(b, /class="my-month-card"/g)} cards`);
        check('month links use NEW nested /moon/saudi-arabia/riyadh/2026/NN (12)', count(b, /href="\/moon\/saudi-arabia\/riyadh\/2026\/\d\d"/g) === 12, `${count(b, /href="\/moon\/saudi-arabia\/riyadh\/2026\/\d\d"/g)}`);
        check('month cards NO LONGER use the legacy /moon-in-riyadh/2026-NN route', count(b, /href="\/moon-in-riyadh\/2026-\d\d"/g) === 0, `${count(b, /href="\/moon-in-riyadh\/2026-\d\d"/g)}`);
        check('prev + next year links (2025 + 2027)', b.includes('/moon/saudi-arabia/riyadh/2025') && b.includes('/moon/saudi-arabia/riyadh/2027'));
        check('year summary card present', /id="moon-year-summary"/.test(b));
        // FAQ reuses the today-page moon FAQ styling (.moon-faq-item, same look as /moon-today-in-{city})
        check('5-6 SSR FAQ (.moon-faq-item) + FAQPage JSON-LD', count(b, /class="moon-faq-item"/g) >= 5 && count(b, /class="moon-faq-item"/g) <= 6 && /"@type":"FAQPage"/.test(b), `${count(b, /class="moon-faq-item"/g)} faq`);
        check('year FAQ uses .moon-faq container (today-page style, no country-faq-item)', /<div class="moon-faq">/.test(b) && !/class="country-faq-item"/.test(b));
        const hl = new Set((b.match(/hreflang="([a-z-]+)"/g) || []).map(s => s.replace(/hreflang="|"/g, '')));
        check('hreflang 10 langs + x-default', ['ar','en','fr','tr','ur','de','id','es','bn','ms'].every(l => hl.has(l)) && hl.has('x-default'));
        check('indexable (no noindex)', !/<meta name="robots"[^>]*noindex/i.test(b));
    }

    // ── D) validation: deeper/dash/bad-year 404 · mismatch 301 · unknown 404 ──
    console.log('\n── D) validation (deeper/dash/bad-year 404 · mismatch 301 · unknown 404) ──');
    for (const u of [
        '/moon/saudi-arabia/riyadh/today', '/moon/saudi-arabia/riyadh/2026/06/17',
        '/moon/saudi-arabia/riyadh/2026-06', '/moon/saudi-arabia/riyadh/2026-06-17',
        '/moon/saudi-arabia/riyadh/26', '/moon/saudi-arabia/riyadh/202', '/moon/saudi-arabia/riyadh/20261',
        '/moon/saudi-arabia/riyadh/abcd', '/moon/saudi-arabia/riyadh/1899', '/moon/saudi-arabia/riyadh/2101',
        '/moon/saudi-arabia/notacity/2026', '/moon/zzz-not-a-country/riyadh/2026',
    ]) {
        const r = await req(u);
        check(`${u} → 404 (not served)`, r.status === 404 && !pageActive(r.body, 'page-moon-year'), `status=${r.status}`);
    }
    {
        const r = await req('/moon/united-states/riyadh/2026');
        check('/moon/united-states/riyadh/2026 → 301 /moon/saudi-arabia/riyadh/2026 (mismatch)', r.status === 301 && r.loc === '/moon/saudi-arabia/riyadh/2026', `status=${r.status} loc=${r.loc}`);
        const re = await req('/en/moon/united-states/riyadh/2026');
        check('/en/… mismatch → 301 /en/moon/saudi-arabia/riyadh/2026 (lang preserved)', re.status === 301 && re.loc === '/en/moon/saudi-arabia/riyadh/2026', `status=${re.status} loc=${re.loc}`);
    }

    // ── E) sitemap: year pages (prev/cur/next) in · month pages now in (MCMR) · deeper day/today out ──
    console.log('\n── E) sitemap-cities: year pages in · month pages in (MCMR) · deeper day/today out ──');
    {
        const smc = (await req('/sitemap-cities-1.xml')).body;
        const cy = new Date().getFullYear();
        check(`sitemap has current-year /moon/saudi-arabia/medina/${cy}`, smc.includes(`${SITE}/moon/saudi-arabia/medina/${cy}</loc>`));
        check('sitemap has prev + next year for the city', smc.includes(`/moon/saudi-arabia/medina/${cy - 1}</loc>`) && smc.includes(`/moon/saudi-arabia/medina/${cy + 1}</loc>`));
        // MOON-CITY-MONTH-ROUTE-STRUCTURE-ADD-1 §9: month pages /moon/{c}/{city}/{yyyy}/{mm} are now emitted.
        check('sitemap NOW has nested month /moon/saudi-arabia/medina/{yyyy}/{mm} (MCMR)', /\/moon\/saudi-arabia\/medina\/\d{4}\/\d{2}<\/loc>/.test(smc));
        check('sitemap: still NO deeper day /moon/{c}/{city}/{yyyy}/{mm}/{dd}', !/\/moon\/[a-z-]+\/[a-z-]+\/\d{4}\/\d{2}\/\d{2}<\/loc>/.test(smc));
        check('sitemap: NO nested today /moon/{c}/{city}/today', !/\/moon\/[a-z-]+\/[a-z-]+\/today<\/loc>/.test(smc));
    }

    // ── F) legacy routes untouched + Meeus 49 unchanged ──
    console.log('\n── F) legacy routes untouched + Meeus 49 unchanged ──');
    for (const [u, id] of [['/moon/saudi-arabia/riyadh', 'page-moon'], ['/moon-today-in-riyadh', 'page-moon'], ['/moon-in-riyadh/2026-06', 'page-moon'], ['/moon-in-riyadh/2026-06-17', 'page-moon']]) {
        const r = await req(u);
        check(`${u}: still 200 + ${id} active`, r.status === 200 && pageActive(r.body, id), `status=${r.status}`);
    }
    check('/moon still 200', (await req('/moon')).status === 200);
    check('/moon/saudi-arabia still 200', (await req('/moon/saudi-arabia')).status === 200);
    check('/moon-today still 301 → /moon', (await req('/moon-today')).status === 301);
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
