// MOON-CITY-MONTH-ROUTE-STRUCTURE-SCOPE-CORRECTION-FIX-1 — dedicated smoke for the city MONTH page.
//
// SCOPE CORRECTION: the nested MONTH route /[lang/]moon/{country}/{city}/{yyyy}/{mm} is the
// STRUCTURAL alias of the legacy month page /moon-in-{city}/{yyyy-mm}. It reuses the SAME legacy
// renderer — #page-moon active (NOT a bespoke #page-moon-month), the same #moon-page-h1, the same
// legacy <title>, AND — critically — the SAME legacy monthly calendar grid (.moon-hub-cal-grid,
// 7-column wall calendar) whose day cells link to the NEW nested day route
// /moon/{country}/{city}/{yyyy}/{mm}/{dd}. The ONLY permitted differences are:
//   1. self-canonical (the new nested URL),
//   2. hreflang (10 langs + x-default on the new nested URL),
//   3. a 6-level breadcrumb (Home › Moon Phase › {Country} › {City} › {yyyy} › {Month})
//      with DOM ≡ BreadcrumbList JSON-LD,
//   4. calendar day links use the nested day route.
// The bespoke #page-moon-month section (hero/my-chip/my-day-link table/summary/FAQ) is GONE.
// HUB INVARIANT: the city hub /moon/{country}/{city} renders NO calendar widget (grid OR compact
// CTA) — the calendar block is now gated month-page-ONLY (`_isMoonMonthPageSsr`). This also fixed a
// pre-existing `_hubPath` ReferenceError that had been silently swallowing the calendar for every
// nested moon page. Validation: dash/bad-month/bad-year → 404, wrong country → 301. Year-page month
// cards → nested month route. Legacy /moon-in-{city}/{yyyy-mm} 301s (MLRC); js/moon.js + Meeus 49 untouched.
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

const pageMoonActive = (b) => /class="page active" id="page-moon"/.test(b);
const pageMoonMonthEl = (b) => /<[a-z]+[^>]*\bid="page-moon-month"/.test(b);   // the BESPOKE section element (must be ABSENT)
const canonOf = (b) => (b.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
const count = (b, re) => (b.match(re) || []).length;
const h1Count = (b) => count(b, /<h1\b/g);
const h1Text = (b) => ((b.match(/id="moon-page-h1"[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '').replace(/<[^>]*>/g, '').trim();
const titleText = (b) => (b.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
const daysInMonth = (y, m) => new Date(y, m, 0).getDate();
// VISIBLE breadcrumb rungs inside <nav class="moon-breadcrumb"> (skip hidden <li> + separators)
function domCrumbs(b) {
    const nav = (b.match(/<nav class="moon-breadcrumb"[\s\S]*?<\/nav>/) || [''])[0];
    const out = [];
    for (const m of nav.matchAll(/<li class="[^"]*"[^>]*?>([\s\S]*?)<\/li>/g)) {
        if (/\bhidden\b/.test(m[0])) continue;   // skip the rungs still hidden on this page
        if (/bc-sep/.test(m[0])) continue;        // skip separators (›)
        const t = m[1].replace(/<[^>]*>/g, '').trim();
        if (t && t !== '›') out.push(t);
    }
    return out;
}
function jsonldCrumbNames(b) {
    const i = b.indexOf('"@type":"BreadcrumbList"'); if (i < 0) return null;
    const m = b.slice(i).match(/"itemListElement":\[([\s\S]*?)\]/);
    if (!m) return null;
    return (m[1].match(/"name":"([^"]*)"/g) || []).map(s => s.replace(/^"name":"/, '').replace(/"$/, ''));
}
// count nested dated day-links into a given {yyyy}/{mm}, and legacy day-links
const datedDayLinks = (b, slug, y, mm) => count(b, new RegExp('href="/moon/saudi-arabia/' + slug + '/' + y + '/' + mm + '/\\d{2}"', 'g'));
const legacyDayLinks = (b, slug, ymd) => count(b, new RegExp('href="/moon-in-' + slug + '/' + ymd + '-\\d{2}"', 'g'));

let exitCode = 1;
let SITE = `http://localhost:${PORT}`;
const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
try {
    if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }
    SITE = (canonOf((await req('/moon/saudi-arabia/riyadh/2026/06')).body).match(/^(https?:\/\/[^/]+)/) || [])[1] || SITE;

    // ── A) month page = 200, #page-moon active (legacy renderer), 1 H1, self canonical (multi-country/lang) ──
    console.log('── A) month page = 200 + #page-moon active (legacy renderer) + 1 H1 + self canonical ──');
    for (const u of ['/moon/saudi-arabia/riyadh/2026/06', '/en/moon/saudi-arabia/riyadh/2026/06', '/moon/united-states/new-york/2027/01', '/fr/moon/saudi-arabia/jeddah/2025/12']) {
        const r = await req(u);
        const ok = r.status === 200 && pageMoonActive(r.body) && !pageMoonMonthEl(r.body) && h1Count(r.body) === 1 && canonOf(r.body) === SITE + u && r.body.length > 60000;
        check(`${u}: 200 + page-moon + NO bespoke page-moon-month + 1 H1 + self canonical`, ok,
            `status=${r.status} pm=${pageMoonActive(r.body)} pmmEl=${pageMoonMonthEl(r.body)} h1=${h1Count(r.body)} canon=${canonOf(r.body)}`);
    }

    // ── A2) bespoke MONTH renderer fully removed + legacy renderer present + balanced comments ──
    console.log('\n── A2) bespoke #page-moon-month removed (0 my-chip/my-day-link/moon-month-*) + legacy #moon-page-h1 ──');
    for (const u of ['/moon/saudi-arabia/riyadh/2026/06', '/en/moon/saudi-arabia/riyadh/2026/06']) {
        const b = (await req(u)).body;
        const bespoke = ['moon-month-hero', 'moon-month-summary', 'moon-month-calendar', 'my-chip', 'my-day-link', 'my-month-card']
            .filter(id => new RegExp(id).test(b));
        check(`${u}: 0 bespoke month artefacts`, bespoke.length === 0, `found=[${bespoke.join(',')}]`);
        check(`${u}: legacy #moon-page-h1 present + page-moon active`, /id="moon-page-h1"/.test(b) && pageMoonActive(b));
        const opens = (b.match(/<!--/g) || []).length, closes = (b.match(/-->/g) || []).length;
        check(`${u}: HTML comments balanced (<!-- == -->)`, opens === closes, `open=${opens} close=${closes}`);
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
        check(`${u}: DOM ≡ JSON-LD (6 rungs)`, dom.length === 6 && JSON.stringify(dom) === JSON.stringify(names), `dom=${JSON.stringify(dom)} jsonld=${JSON.stringify(names)}`);
        check(`${u}: rungs = [Home,${hub},${country},${city},2026,${mn}]`, !!names && names.length === 6 && names.slice(1).join('|') === [hub, country, city, '2026', mn].join('|'), JSON.stringify(names));
        check(`${u}: year rung links to ${lp}/moon/saudi-arabia/riyadh/2026`, new RegExp('href="' + lp + '/moon/saudi-arabia/riyadh/2026"').test(b));
        check(`${u}: city rung ${lp}/moon/saudi-arabia/riyadh · country ${lp}/moon/saudi-arabia`,
            new RegExp('href="' + lp + '/moon/saudi-arabia/riyadh"').test(b) && new RegExp('href="' + lp + '/moon/saudi-arabia"').test(b));
    }

    // ── C) legacy monthly CALENDAR GRID present + nested day links + legacy title + hreflang ──
    console.log('\n── C) legacy calendar grid (.moon-hub-cal-grid) + nested day links + legacy title ──');
    {
        const b = (await req('/moon/saudi-arabia/riyadh/2026/06')).body;
        check('calendar grid card present (.moon-hub-calendar-card + .moon-hub-cal-grid + .moon-hub-cal-title)',
            b.includes('moon-hub-calendar-card') && b.includes('moon-hub-cal-grid') && b.includes('moon-hub-cal-title'));
        check('calendar H2 = "📆 تقويم أطوار القمر في الرياض — يونيو 2026"', b.includes('📆 تقويم أطوار القمر في الرياض — يونيو 2026'));
        const dim = daysInMonth(2026, 6); // 30
        const dated = datedDayLinks(b, 'riyadh', '2026', '06');
        // day cells link to the nested day route; the "today" cell (when today ∈ this month) links to …/today,
        // so the dated count is dim or dim-1. Either way: covers the month, 0 legacy.
        check(`calendar day links use NEW nested route /moon/saudi-arabia/riyadh/2026/06/NN (${dim}/${dim - 1})`,
            dated >= dim - 1 && dated <= dim, `dated=${dated} dim=${dim}`);
        check('calendar day links NO LONGER use legacy /moon-in-riyadh/2026-06-NN', legacyDayLinks(b, 'riyadh', '2026-06') === 0, `legacy=${legacyDayLinks(b, 'riyadh', '2026-06')}`);
        check('NO bespoke my-day-link rows', count(b, /class="my-day-link"/g) === 0);
        // SCOPE-CORRECTION-FIX-1: 0 SSR legacy moon hrefs anywhere (calendar prev/next/picker/day cells +
        // the "view today" CTA must all be nested — no /moon-in- or /moon-today-in- leak).
        const _legHrefs = (b.match(/href="\/(?:moon-in-|moon-today-in-)[^"]*"/g) || []);
        check('0 SSR legacy moon hrefs (/moon-in-, /moon-today-in-)', _legHrefs.length === 0, `${JSON.stringify(_legHrefs)}`);
        check('"view today" CTA is nested (/moon/saudi-arabia/riyadh/today)', /class="moon-hub-detail-cta" href="\/moon\/saudi-arabia\/riyadh\/today"/.test(b));
        // prev/next month nav uses the nested route (cross-month + the picker form action is the nested base)
        check('calendar prev/next nav nested (2026/05 + 2026/07) + picker action nested', /class="moon-hub-cal-prev" href="\/moon\/saudi-arabia\/riyadh\/2026\/05"/.test(b) && /class="moon-hub-cal-next" href="\/moon\/saudi-arabia\/riyadh\/2026\/07"/.test(b) && /class="moon-hub-cal-picker"[^>]*action="\/moon\/saudi-arabia\/riyadh"/.test(b));
        const hl = new Set((b.match(/hreflang="([a-z-]+)"/g) || []).map(x => x.replace(/hreflang="|"/g, '')));
        check('hreflang 10 langs + x-default', ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'].every(l => hl.has(l)) && hl.has('x-default'));
        check('indexable (no noindex)', !/<meta name="robots"[^>]*noindex/i.test(b));
        check('AR title = "تقويم القمر في الرياض لشهر يونيو 2026 ومراحل القمر"', titleText(b) === 'تقويم القمر في الرياض لشهر يونيو 2026 ومراحل القمر', titleText(b));
        check('legacy H1 = "🌙 أطوار القمر في الرياض — يونيو 2026"', h1Text(b) === '🌙 أطوار القمر في الرياض — يونيو 2026', h1Text(b));
        const en = (await req('/en/moon/saudi-arabia/riyadh/2026/06')).body;
        check('EN title carries Riyadh + June + 2026', /Riyadh/.test(titleText(en)) && /June/.test(titleText(en)) && /2026/.test(titleText(en)), titleText(en));
        check('EN month page also renders the calendar grid', en.includes('moon-hub-cal-grid'));
    }

    // ── C2) HUB INVARIANT: city hub /moon/{country}/{city} renders NO calendar widget ──
    console.log('\n── C2) HUB unchanged: /moon/saudi-arabia/riyadh has NO calendar (grid OR compact CTA) ──');
    for (const u of ['/moon/saudi-arabia/riyadh', '/en/moon/saudi-arabia/riyadh']) {
        const b = (await req(u)).body;
        check(`${u}: 200 + page-moon active`, (await req(u)).status === 200 && pageMoonActive(b));
        check(`${u}: NO moon-hub-cal-grid (full month grid must NOT appear on hub)`, !b.includes('moon-hub-cal-grid'));
        check(`${u}: NO moon-hub-calendar-card / moon-hub-cal-compact`, !b.includes('moon-hub-calendar-card') && !b.includes('moon-hub-cal-compact'));
    }

    // ── C3) the calendar is MONTH-page ONLY (day/today/year/country show none) ──
    console.log('\n── C3) calendar is month-page ONLY (day/today/year/country = no grid) ──');
    for (const [lbl, u] of [['day', '/moon/saudi-arabia/riyadh/2026/06/17'], ['today', '/moon/saudi-arabia/riyadh/today'], ['year', '/moon/saudi-arabia/riyadh/2026'], ['country', '/moon/saudi-arabia']]) {
        const r = await req(u);
        check(`${lbl} ${u}: 200 + NO moon-hub-cal-grid`, r.status === 200 && !r.body.includes('moon-hub-cal-grid'), `status=${r.status} grid=${r.body.includes('moon-hub-cal-grid')}`);
    }

    // ── C4) month-picker (year/month dropdown) no-JS fallback → nested month 301 (NOT 404) ──
    //   SCOPE-CORRECTION-FIX-1: the SSR picker form posts ?cal-y/?cal-m (or ?cal=YYYY-MM) to the nested
    //   hub base; the server 301s it to the canonical nested month /YYYY/MM (slash form). The JS handler
    //   (app.js) builds the same nested slash URL. Previously the dropdown landed on a 404 (dash form).
    console.log('\n── C4) month-picker no-JS fallback → nested month 301 (not 404) ──');
    for (const [u, to] of [
        ['/moon/saudi-arabia/riyadh?cal-y=2026&cal-m=7', '/moon/saudi-arabia/riyadh/2026/07'],
        ['/moon/saudi-arabia/riyadh?cal=2026-07', '/moon/saudi-arabia/riyadh/2026/07'],
        ['/en/moon/saudi-arabia/riyadh?cal-y=2027&cal-m=1', '/en/moon/saudi-arabia/riyadh/2027/01'],
    ]) {
        const r = await req(u);
        check(`picker ${u} → 301 ${to}`, r.status === 301 && r.loc === to, `status=${r.status} loc=${r.loc}`);
    }
    // invalid month in the picker query must NOT redirect to a bad URL — fall through to the hub (200)
    for (const u of ['/moon/saudi-arabia/riyadh?cal-y=2026&cal-m=13', '/moon/saudi-arabia/riyadh?cal-y=2026&cal-m=0']) {
        const r = await req(u);
        check(`picker ${u} (invalid month) → 200 hub, no bad redirect`, r.status === 200, `status=${r.status}`);
    }
    // the picker form action is the nested hub base (so the JS handler + no-JS form both target nested)
    check('month-picker form action = nested hub base', /class="moon-hub-cal-picker"[^>]*action="\/moon\/saudi-arabia\/riyadh"/.test((await req('/moon/saudi-arabia/riyadh/2026/06')).body));

    // ── D) other month lengths render the grid with nested day links (cross-year + leap) ──
    console.log('\n── D) other months: grid present + nested day links (Jan 2027 = 31 · Feb 2024 = 29 leap) ──');
    for (const [y, mm] of [['2027', '01'], ['2024', '02'], ['2026', '12']]) {
        const b = (await req(`/moon/saudi-arabia/riyadh/${y}/${mm}`)).body;
        const dim = daysInMonth(+y, +mm);
        const dated = datedDayLinks(b, 'riyadh', y, mm);
        check(`${y}/${mm}: grid present + ${dim}/${dim - 1} nested day links + 0 legacy`,
            b.includes('moon-hub-cal-grid') && dated >= dim - 1 && dated <= dim && legacyDayLinks(b, 'riyadh', `${y}-${mm}`) === 0,
            `dated=${dated} dim=${dim}`);
    }

    // ── E) validation: dash/bad-month/bad-year/deeper 404 · mismatch 301 · unknown 404 ──
    console.log('\n── E) validation (dash/bad-month/bad-year/deeper 404 · mismatch 301 · unknown 404) ──');
    for (const u of [
        '/moon/saudi-arabia/riyadh/2026-06', '/moon/saudi-arabia/riyadh/2026-06-17',
        '/moon/saudi-arabia/riyadh/2026/6', '/moon/saudi-arabia/riyadh/2026/00', '/moon/saudi-arabia/riyadh/2026/13',
        '/moon/saudi-arabia/riyadh/2026/abc', '/moon/saudi-arabia/riyadh/1899/06', '/moon/saudi-arabia/riyadh/2101/06',
        '/moon/saudi-arabia/notacity/2026/06', '/moon/zzz-not-a-country/riyadh/2026/06',
    ]) {
        const r = await req(u);
        check(`${u} → 404 (not served)`, r.status === 404, `status=${r.status}`);
    }
    {
        const r = await req('/moon/united-states/riyadh/2026/06');
        check('/moon/united-states/riyadh/2026/06 → 301 /moon/saudi-arabia/riyadh/2026/06 (mismatch)', r.status === 301 && r.loc === '/moon/saudi-arabia/riyadh/2026/06', `status=${r.status} loc=${r.loc}`);
        const re = await req('/en/moon/united-states/riyadh/2026/06');
        check('/en/… mismatch → 301 /en/moon/saudi-arabia/riyadh/2026/06 (lang preserved)', re.status === 301 && re.loc === '/en/moon/saudi-arabia/riyadh/2026/06', `status=${re.status} loc=${re.loc}`);
    }

    // ── F) sitemap: month pages in, deeper day/today policy ──
    console.log('\n── F) sitemap-cities: month pages in, deeper day out, today in ──');
    {
        const smc = (await req('/sitemap-cities-1.xml')).body;
        const cy = new Date().getFullYear();
        check(`sitemap has current-year month /moon/saudi-arabia/medina/${cy}/06`, smc.includes(`${SITE}/moon/saudi-arabia/medina/${cy}/06</loc>`));
        check('sitemap has all 12 months for the current year (city)', Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).every(mm => smc.includes(`/moon/saudi-arabia/medina/${cy}/${mm}</loc>`)));
        check('sitemap: NO nested day /moon/{c}/{city}/{yyyy}/{mm}/{dd}', !/\/moon\/[a-z-]+\/[a-z-]+\/\d{4}\/\d{2}\/\d{2}<\/loc>/.test(smc));
        check('sitemap has nested today /moon/saudi-arabia/medina/today', /\/moon\/saudi-arabia\/medina\/today<\/loc>/.test(smc));
    }

    // ── G) YEAR page month cards point at the nested month route ──
    console.log('\n── G) year page month cards → nested /moon/{country}/{city}/{yyyy}/{mm} ──');
    {
        const y = (await req('/moon/saudi-arabia/riyadh/2026')).body;
        check('year page: 12 month cards → /moon/saudi-arabia/riyadh/2026/NN', count(y, /href="\/moon\/saudi-arabia\/riyadh\/2026\/\d\d"/g) >= 12, `${count(y, /href="\/moon\/saudi-arabia\/riyadh\/2026\/\d\d"/g)}`);
        check('year page: month cards NO LONGER use legacy /moon-in-riyadh/2026-NN', count(y, /href="\/moon-in-riyadh\/2026-\d\d"/g) === 0);
    }

    // ── H) legacy routes 301 → nested (MLRC) + Meeus 49 unchanged ──
    console.log('\n── H) legacy month/day/today 301 → nested (MLRC) + Meeus 49 unchanged ──');
    for (const [u, to] of [['/moon-in-riyadh/2026-06', '/moon/saudi-arabia/riyadh/2026/06'], ['/moon-in-riyadh/2026-06-17', '/moon/saudi-arabia/riyadh/2026/06/17'], ['/moon-today-in-riyadh', '/moon/saudi-arabia/riyadh/today']]) {
        const r = await req(u);
        check(`${u}: 301 → ${to} (MLRC)`, r.status === 301 && r.loc === to, `status=${r.status} loc=${r.loc}`);
    }
    check('/moon/saudi-arabia/riyadh/2026 still 200 (year)', (await req('/moon/saudi-arabia/riyadh/2026')).status === 200);
    check('/moon/saudi-arabia/riyadh still 200 (hub)', (await req('/moon/saudi-arabia/riyadh')).status === 200);
    check('/moon/saudi-arabia still 200 (country)', (await req('/moon/saudi-arabia')).status === 200);
    check('/moon still 200', (await req('/moon')).status === 200);
    {
        // Meeus via the month grid (New/Full tokens) + nested DAY pages (legacy renderer, same engine).
        const mo = (await req('/moon/saudi-arabia/riyadh/2026/06')).body;
        check('Meeus 49 in grid: 15 Jun region = المحاق · 30 Jun region = بدر',
            /2026\/06\/15[^]{0,400}?(?:المحاق|محاق)/.test(mo) && /2026\/06\/30[^]{0,400}?بدر/.test(mo));
        const r15 = await req('/moon/saudi-arabia/riyadh/2026/06/15'), r30 = await req('/moon/saudi-arabia/riyadh/2026/06/30');
        check('Meeus 49: 15 Jun=المحاق · 30 Jun=البدر (nested day pages)', r15.status === 200 && r15.body.includes('المحاق') && r30.status === 200 && r30.body.includes('البدر'));
    }

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ unexpected', e && e.message); exitCode = 1;
} finally { s.kill('SIGKILL'); }
process.exit(exitCode);
