// MOON-CITY-DAY-ROUTE-STRUCTURE-SCOPE-CORRECTION-FIX-1 — dedicated smoke for the city DAY page.
//
// SCOPE CORRECTION: the nested DAY route /[lang/]moon/{country}/{city}/{yyyy}/{mm}/{dd} is the
// STRUCTURAL alias of the legacy dated page /moon-in-{city}/{yyyy-mm-dd}. It reuses the SAME legacy
// renderer — #page-moon active, the same #moon-page-h1, the same #moon-city-answer body, the same
// <title> — NOT a bespoke #page-moon-day section. The ONLY permitted differences are:
//   1. self-canonical (the new nested URL),
//   2. hreflang (the new nested URL, 10 langs + x-default),
//   3. a 7-level breadcrumb (Home › Moon Phase › {Country} › {City} › {yyyy} › {Month} › {dd})
//      with DOM ≡ BreadcrumbList JSON-LD.
// Validation: deeper/today/dash/bad-day/bad-month → 404, leap-aware day-of-month, wrong country →
// 301 to the nested URL. Day pages are index + self-canonical but NOT bulk-added to the sitemap.
// Month-page day links point at the new nested day route. Legacy /moon-in-{city}/{yyyy-mm-dd} stays
// a 200 (NO redirect); js/moon.js + Meeus 49 untouched.
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

const pageMoonActive = (b) => /class="page active" id="page-moon"/.test(b);
const canonOf = (b) => (b.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
const count = (b, re) => (b.match(re) || []).length;
const h1Count = (b) => count(b, /<h1\b/g);
// the legacy renderer's H1 (#moon-page-h1) and its text — shared by the legacy + nested-day pages
const h1Text = (b) => ((b.match(/id="moon-page-h1"[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '').replace(/<[^>]*>/g, '').trim();
const titleText = (b) => (b.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
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

let exitCode = 1;
let SITE = `http://localhost:${PORT}`;
const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
try {
    if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }
    SITE = (canonOf((await req('/moon/saudi-arabia/riyadh/2026/06/17')).body).match(/^(https?:\/\/[^/]+)/) || [])[1] || SITE;

    // ── A) nested day = 200, #page-moon active (legacy renderer, NOT #page-moon-day), 1 H1, self canonical ──
    //   In-range dates (today 2026-06-21; range [today-30, today+90]) so the page is the indexable
    //   dated page — apples-to-apples with the legacy comparison in §B.
    console.log('── A) nested day = 200 + #page-moon active (legacy renderer) + 1 H1 + self canonical (new nested URL) ──');
    for (const u of ['/moon/saudi-arabia/riyadh/2026/06/17', '/en/moon/saudi-arabia/riyadh/2026/06/17', '/moon/united-states/new-york/2026/07/15', '/fr/moon/saudi-arabia/jeddah/2026/08/03']) {
        const r = await req(u);
        const ok = r.status === 200 && pageMoonActive(r.body) && !/id="page-moon-day"/.test(r.body) && h1Count(r.body) === 1 && canonOf(r.body) === SITE + u && r.body.length > 60000;
        check(`${u}: 200 + page-moon active + NO #page-moon-day + 1 H1 + self canonical`, ok, `status=${r.status} pm=${pageMoonActive(r.body)} pmd=${/id="page-moon-day"/.test(r.body)} h1=${h1Count(r.body)} canon=${canonOf(r.body)}`);
    }

    // ── B) SAME CONTENT as the legacy dated page (same renderer / title / H1 / body container) ──
    console.log('\n── B) same content as legacy /moon-in-{city}/{yyyy-mm-dd} (same renderer · title · H1 · body) ──');
    for (const [nested, legacy] of [
        ['/moon/saudi-arabia/riyadh/2026/06/17', '/moon-in-riyadh/2026-06-17'],
        ['/en/moon/saudi-arabia/riyadh/2026/06/17', '/en/moon-in-riyadh/2026-06-17'],
        ['/moon/united-states/new-york/2026/07/15', '/moon-in-new-york/2026-07-15'],
    ]) {
        const d = await req(nested), lg = await req(legacy);
        check(`${nested}: same <title> as ${legacy}`, lg.status === 200 && titleText(d.body) === titleText(lg.body) && titleText(d.body).length > 0, `day="${titleText(d.body)}" legacy="${titleText(lg.body)}"`);
        check(`${nested}: same #moon-page-h1 text as legacy`, h1Text(d.body) === h1Text(lg.body) && h1Text(d.body).length > 0, `day="${h1Text(d.body)}" legacy="${h1Text(lg.body)}"`);
        check(`${nested}: reuses legacy body (#moon-city-answer present)`, /id="moon-city-answer"/.test(d.body));
        // NO bespoke day artifacts (the removed #page-moon-day page): id/hero/summary/details/H1 all absent
        const bespoke = ['page-moon-day', 'moon-day-hero', 'moon-day-summary', 'moon-day-details', 'moon-day-h1'].filter(id => new RegExp('id="' + id + '"').test(d.body));
        check(`${nested}: 0 bespoke day artifacts (page-moon-day/hero/summary/details/h1)`, bespoke.length === 0, `present=[${bespoke.join(',')}]`);
    }
    // out-of-range nested day (date far from today): STILL self-canonical to the new nested URL
    //   (NOT the legacy /moon-today-in-{city}) — requirement #1 holds regardless of range. Legacy
    //   out-of-range pages are noindex + canonical→/moon-today; the nested day keeps self-canonical.
    //   (MOON-CITY-DAY-ROUTE-STRUCTURE-SCOPE-CORRECTION-FIX-1 — the canonical-override-skip.)
    {
        const oor = '/moon/saudi-arabia/riyadh/2030/01/15';
        const r = await req(oor);
        check(`${oor} (out of range): 200 + self canonical (NOT /moon-today-in-…)`, r.status === 200 && canonOf(r.body) === SITE + oor, `status=${r.status} canon=${canonOf(r.body)}`);
    }

    // ── C) 7-level breadcrumb DOM ≡ JSON-LD (AR + EN) + correct nested hrefs ──
    console.log('\n── C) 7-level breadcrumb DOM ≡ JSON-LD (Home › Moon Phase › Country › City › Year › Month › Day) ──');
    for (const [u, hub, country, city, mn] of [
        ['/moon/saudi-arabia/riyadh/2026/06/17', 'حالة القمر', 'المملكة العربية السعودية', 'الرياض', 'يونيو'],
        ['/en/moon/saudi-arabia/riyadh/2026/06/17', 'Moon Phase', 'Saudi Arabia', 'Riyadh', 'June'],
    ]) {
        const b = (await req(u)).body;
        const dom = domCrumbs(b), names = jsonldCrumbNames(b);
        const lp = u.startsWith('/en') ? '/en' : '';
        check(`${u}: DOM ≡ JSON-LD (7 rungs)`, dom.length === 7 && JSON.stringify(dom) === JSON.stringify(names), `dom=${JSON.stringify(dom)} ld=${JSON.stringify(names)}`);
        check(`${u}: rungs = [Home,${hub},${country},${city},2026,${mn},17]`, !!names && names.slice(1).join('|') === [hub, country, city, '2026', mn, '17'].join('|'), JSON.stringify(names));
        // hrefs: City → /moon/{c}/{city} · Year → …/2026 · Month → …/2026/06 · Country → /moon/{c} · Moon Phase → /moon
        check(`${u}: city → ${lp}/moon/saudi-arabia/riyadh · year → …/2026 · month → …/2026/06`,
            new RegExp('id="bc-moon" href="' + lp + '/moon/saudi-arabia/riyadh"').test(b) &&
            new RegExp('id="bc-moon-year" href="' + lp + '/moon/saudi-arabia/riyadh/2026"').test(b) &&
            new RegExp('id="bc-month" href="' + lp + '/moon/saudi-arabia/riyadh/2026/06"').test(b));
        check(`${u}: country → ${lp}/moon/saudi-arabia · moon-phase → ${lp}/moon · day rung is current (no link)`,
            new RegExp('id="bc-moon-country" href="' + lp + '/moon/saudi-arabia"').test(b) &&
            new RegExp('id="bc-moon-hub" href="' + lp + '/moon"').test(b) &&
            /<li class="bc-item bc-current bc-date" id="bc-date" aria-current="page">17<\/li>/.test(b));
    }

    // ── D) hreflang (10 langs + x-default) points at the new nested URL ──
    console.log('\n── D) hreflang 10 langs + x-default → nested day URL ──');
    {
        const b = (await req('/moon/saudi-arabia/riyadh/2026/06/17')).body;
        const hl = new Set((b.match(/hreflang="([a-z-]+)"/g) || []).map(x => x.replace(/hreflang="|"/g, '')));
        check('hreflang 10 langs + x-default', ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'].every(l => hl.has(l)) && hl.has('x-default'));
        check('ar alternate → /moon/saudi-arabia/riyadh/2026/06/17 (nested)', /hreflang="ar" href="[^"]*\/moon\/saudi-arabia\/riyadh\/2026\/06\/17"/.test(b));
        check('en alternate → /en/moon/saudi-arabia/riyadh/2026/06/17 (nested, lang-prefixed)', /hreflang="en" href="[^"]*\/en\/moon\/saudi-arabia\/riyadh\/2026\/06\/17"/.test(b));
        check('indexable (no noindex)', !/<meta name="robots"[^>]*noindex/i.test(b));
    }

    // ── E) validation: deeper/dash/bad-day/bad-month 404 · leap-aware · mismatch 301 · unknown 404 ──
    console.log('\n── E) validation (today/dash/bad-day/bad-month/deeper 404 · leap-aware · mismatch 301 · unknown 404) ──');
    for (const u of [
        '/moon/saudi-arabia/riyadh/today/test', '/moon/saudi-arabia/riyadh/2026-06-17', '/moon/saudi-arabia/riyadh/2026-06',
        '/moon/saudi-arabia/riyadh/2026/6/17', '/moon/saudi-arabia/riyadh/2026/06/7',
        '/moon/saudi-arabia/riyadh/2026/06/00', '/moon/saudi-arabia/riyadh/2026/06/32',
        '/moon/saudi-arabia/riyadh/2026/02/30', '/moon/saudi-arabia/riyadh/2026/13/01',
        '/moon/saudi-arabia/riyadh/2026/06/17/extra', '/moon/saudi-arabia/riyadh/1899/06/17', '/moon/saudi-arabia/riyadh/2101/06/17',
        '/moon/saudi-arabia/notacity/2026/06/17', '/moon/zzz-not-a-country/riyadh/2026/06/17',
    ]) {
        const r = await req(u);
        check(`${u} → 404 (not served, not page-moon)`, r.status === 404 && !pageMoonActive(r.body), `status=${r.status}`);
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
        // MOON-CITY-TODAY-ROUTE-STRUCTURE-ADD-1 §8: nested today /moon/{c}/{city}/today is now emitted.
        check('sitemap NOW has nested today /moon/saudi-arabia/medina/today (MCTR)', /\/moon\/saudi-arabia\/medina\/today<\/loc>/.test(smc));
    }

    // ── G) MONTH page day links now point at the NEW nested day route ──
    console.log('\n── G) month page day links → new nested /moon/{country}/{city}/{yyyy}/{mm}/{dd} ──');
    {
        const m = (await req('/moon/saudi-arabia/riyadh/2026/06')).body;
        check('month page: 30 day links → /moon/saudi-arabia/riyadh/2026/06/NN', count(m, /class="my-day-link" href="\/moon\/saudi-arabia\/riyadh\/2026\/06\/\d\d"/g) === 30, `${count(m, /class="my-day-link" href="\/moon\/saudi-arabia\/riyadh\/2026\/06\/\d\d"/g)}`);
        check('month page: day links NO LONGER use legacy /moon-in-riyadh/2026-06-NN', count(m, /href="\/moon-in-riyadh\/2026-06-\d\d"/g) === 0);
    }

    // ── H) legacy routes untouched (NO redirect from legacy day) + Meeus 49 unchanged ──
    console.log('\n── H) legacy routes untouched (no redirect from legacy day) + Meeus 49 unchanged ──');
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
