// MOON-CITY-TODAY-ROUTE-STRUCTURE-ADD-1 — dedicated smoke for the city TODAY page.
//
// The nested TODAY route /[lang/]moon/{country}/{city}/today is the STRUCTURAL alias of the legacy
// /moon-today-in-{city}. It reuses the SAME legacy today renderer — #page-moon active, the same
// #moon-page-h1, the same #moon-city-answer body, the same <title> — NOT a bespoke page. The ONLY
// permitted differences are:
//   1. the new route,
//   2. self-canonical (the new nested URL),
//   3. hreflang (the new nested URL, 10 langs + x-default),
//   4. a 5-level breadcrumb (Home › Moon Phase › {Country} › {City} › Today) DOM ≡ BreadcrumbList JSON-LD.
// Validation: /today/anything → 404, dash forms → 404, uppercase /Today → 404, wrong country → 301,
// unknown country/city → 404. MOON-LEGACY-ROUTES-CLEANUP-BEFORE-LAUNCH: the legacy /moon-today-in-{city}
// now 301s (lang-preserved) to the nested today. Internal "today" links inside the NEW nested pages point
// at the new nested today. js/moon.js + Meeus 49 untouched. The cities sitemap carries the nested today
// (legacy today + legacy dated DROPPED by MLRC).
//
// Run: node scripts/_smoke_moon_city_today_route_structure_add_1.mjs
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (label, ok, extra) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); };

const PORT = 8235;
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
const h1Text = (b) => ((b.match(/id="moon-page-h1"[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '').replace(/<[^>]*>/g, '').trim();
const titleText = (b) => (b.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
// VISIBLE breadcrumb rungs inside <nav class="moon-breadcrumb"> (skip hidden <li> + separators)
function domCrumbs(b) {
    const nav = (b.match(/<nav class="moon-breadcrumb"[\s\S]*?<\/nav>/) || [''])[0];
    const out = [];
    for (const m of nav.matchAll(/<li class="[^"]*"[^>]*?>([\s\S]*?)<\/li>/g)) {
        if (/\bhidden\b/.test(m[0])) continue;
        if (/bc-sep/.test(m[0])) continue;
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
    SITE = (canonOf((await req('/moon/saudi-arabia/riyadh/today')).body).match(/^(https?:\/\/[^/]+)/) || [])[1] || SITE;

    // ── A) nested today = 200, #page-moon active (legacy today renderer), 1 H1, self canonical ──
    console.log('── A) nested today = 200 + #page-moon active (legacy today renderer) + 1 H1 + self canonical ──');
    for (const u of ['/moon/saudi-arabia/riyadh/today', '/en/moon/saudi-arabia/riyadh/today', '/moon/united-states/new-york/today', '/fr/moon/saudi-arabia/jeddah/today']) {
        const r = await req(u);
        const ok = r.status === 200 && pageMoonActive(r.body) && !/id="page-moon-day"/.test(r.body) && h1Count(r.body) === 1 && canonOf(r.body) === SITE + u && r.body.length > 60000;
        check(`${u}: 200 + page-moon + NO #page-moon-day + 1 H1 + self canonical`, ok, `status=${r.status} pm=${pageMoonActive(r.body)} h1=${h1Count(r.body)} canon=${canonOf(r.body)}`);
    }

    // ── B) legacy today renderer (renderer / title / H1 / body) ──
    //   MOON-LEGACY-ROUTES-CLEANUP-BEFORE-LAUNCH: the legacy /moon-today-in-{city} now 301s to THIS nested
    //   URL (no 200 body to diff against), so assert non-empty title/H1 here + legacy 301→here.
    console.log('\n── B) legacy today renderer (renderer · title · H1 · body) + legacy URL 301→nested ──');
    for (const [nested, legacy] of [
        ['/moon/saudi-arabia/riyadh/today', '/moon-today-in-riyadh'],
        ['/en/moon/saudi-arabia/riyadh/today', '/en/moon-today-in-riyadh'],
        ['/moon/united-states/new-york/today', '/moon-today-in-new-york'],
    ]) {
        const d = await req(nested), lg = await req(legacy);
        check(`${nested}: non-empty <title> + legacy ${legacy} 301→here`, titleText(d.body).length > 0 && lg.status === 301 && lg.loc === nested, `day="${titleText(d.body)}" legacy=${lg.status}→${lg.loc}`);
        check(`${nested}: non-empty #moon-page-h1`, h1Text(d.body).length > 0, `day="${h1Text(d.body)}"`);
        check(`${nested}: reuses legacy body (#moon-city-answer present)`, /id="moon-city-answer"/.test(d.body));
        const bespoke = ['page-moon-day', 'moon-day-hero', 'moon-year-summary', 'moon-month-summary'].filter(id => new RegExp('id="' + id + '"').test(d.body));
        check(`${nested}: 0 bespoke section artifacts`, bespoke.length === 0, `present=[${bespoke.join(',')}]`);
    }

    // ── C) 5-level breadcrumb DOM ≡ JSON-LD (AR + EN) + correct nested hrefs ──
    console.log('\n── C) 5-level breadcrumb DOM ≡ JSON-LD (Home › Moon Phase › Country › City › Today) ──');
    for (const [u, hub, country, city, today] of [
        ['/moon/saudi-arabia/riyadh/today', 'حالة القمر', 'المملكة العربية السعودية', 'الرياض', 'اليوم'],
        ['/en/moon/saudi-arabia/riyadh/today', 'Moon Phase', 'Saudi Arabia', 'Riyadh', 'Today'],
    ]) {
        const b = (await req(u)).body;
        const dom = domCrumbs(b), names = jsonldCrumbNames(b);
        const lp = u.startsWith('/en') ? '/en' : '';
        check(`${u}: DOM ≡ JSON-LD (5 rungs)`, dom.length === 5 && JSON.stringify(dom) === JSON.stringify(names), `dom=${JSON.stringify(dom)} ld=${JSON.stringify(names)}`);
        check(`${u}: rungs = [Home,${hub},${country},${city},${today}]`, !!names && names.slice(1).join('|') === [hub, country, city, today].join('|'), JSON.stringify(names));
        check(`${u}: city → ${lp}/moon/saudi-arabia/riyadh (link) · country → ${lp}/moon/saudi-arabia · moon-phase → ${lp}/moon`,
            new RegExp('id="bc-moon" href="' + lp + '/moon/saudi-arabia/riyadh"').test(b) &&
            new RegExp('id="bc-moon-country" href="' + lp + '/moon/saudi-arabia"').test(b) &&
            new RegExp('id="bc-moon-hub" href="' + lp + '/moon"').test(b));
        check(`${u}: today rung is current (no link)`, new RegExp('<li class="bc-item bc-current bc-date" id="bc-date" aria-current="page">' + today + '</li>').test(b));
    }

    // ── D) hreflang (10 langs + x-default) points at the new nested today URL ──
    console.log('\n── D) hreflang 10 langs + x-default → nested today URL ──');
    {
        const b = (await req('/moon/saudi-arabia/riyadh/today')).body;
        const hl = new Set((b.match(/hreflang="([a-z-]+)"/g) || []).map(x => x.replace(/hreflang="|"/g, '')));
        check('hreflang 10 langs + x-default', ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'].every(l => hl.has(l)) && hl.has('x-default'));
        check('ar alternate → /moon/saudi-arabia/riyadh/today (nested)', /hreflang="ar" href="[^"]*\/moon\/saudi-arabia\/riyadh\/today"/.test(b));
        check('en alternate → /en/moon/saudi-arabia/riyadh/today (nested, lang-prefixed)', /hreflang="en" href="[^"]*\/en\/moon\/saudi-arabia\/riyadh\/today"/.test(b));
        check('indexable (no noindex)', !/<meta name="robots"[^>]*noindex/i.test(b));
    }

    // ── E) validation: /today/anything · dash · uppercase 404 · mismatch 301 · unknown 404 ──
    console.log('\n── E) validation (deeper/dash/uppercase 404 · mismatch 301 · unknown 404) ──');
    for (const u of [
        '/moon/saudi-arabia/riyadh/today/test', '/moon/saudi-arabia/riyadh/today/2026',
        '/moon/saudi-arabia/riyadh/Today', '/moon/saudi-arabia/riyadh/TODAY',
        '/moon/saudi-arabia/riyadh/2026-06', '/moon/saudi-arabia/riyadh/2026-06-17',
        '/moon/saudi-arabia/notacity/today', '/moon/zzz-not-a-country/riyadh/today',
    ]) {
        const r = await req(u);
        check(`${u} → 404 (not served, not page-moon)`, r.status === 404 && !pageMoonActive(r.body), `status=${r.status}`);
    }
    {
        const r = await req('/moon/united-states/riyadh/today');
        check('/moon/united-states/riyadh/today → 301 /moon/saudi-arabia/riyadh/today (mismatch)', r.status === 301 && r.loc === '/moon/saudi-arabia/riyadh/today', `status=${r.status} loc=${r.loc}`);
        const re = await req('/en/moon/united-states/riyadh/today');
        check('/en/… mismatch → 301 /en/moon/saudi-arabia/riyadh/today (lang preserved)', re.status === 301 && re.loc === '/en/moon/saudi-arabia/riyadh/today', `status=${re.status} loc=${re.loc}`);
    }

    // ── F) sitemap: nested today PRESENT · legacy today ABSENT (MOON-LEGACY-ROUTES-CLEANUP-BEFORE-LAUNCH) ──
    console.log('\n── F) sitemap-cities: nested today PRESENT · legacy today ABSENT (MLRC cleanup) ──');
    {
        const smc = (await req('/sitemap-cities-1.xml')).body;
        check('sitemap: nested today /moon/saudi-arabia/medina/today PRESENT', /\/moon\/saudi-arabia\/medina\/today<\/loc>/.test(smc));
        check('sitemap: legacy /moon-today-in-{city} ABSENT (MLRC — now 301)', !/\/moon-today-in-[a-z-]+<\/loc>/.test(smc), `${(smc.match(/\/moon-today-in-[a-z-]+<\/loc>/g) || []).length}`);
        check('sitemap: nested hub /moon/saudi-arabia/medina still present', /\/moon\/saudi-arabia\/medina<\/loc>/.test(smc));
    }

    // ── G) internal "today" links inside the NEW nested pages → new nested today ──
    console.log('\n── G) new nested pages: "today" links → /moon/{country}/{city}/today ──');
    {
        const hub = (await req('/moon/saudi-arabia/riyadh')).body;
        check('nested hub: "today" CTA + calendar cell → /moon/saudi-arabia/riyadh/today', /href="\/moon\/saudi-arabia\/riyadh\/today"/.test(hub));
        check('nested hub: NO self-city legacy /moon-today-in-riyadh link', count(hub, /href="\/moon-today-in-riyadh"/g) === 0, `${count(hub, /href="\/moon-today-in-riyadh"/g)}`);
    }

    // ── H) legacy routes now 301 → nested (MLRC) + nested structure intact + Meeus 49 ──
    console.log('\n── H) legacy today/month/date 301 → nested (MLRC) + nested structure intact + Meeus 49 ──');
    for (const [u, to] of [
        ['/moon-today-in-riyadh', '/moon/saudi-arabia/riyadh/today'],
        ['/moon-in-riyadh', '/moon/saudi-arabia/riyadh'],
        ['/moon-in-riyadh/2026-06', '/moon/saudi-arabia/riyadh/2026/06'],
        ['/moon-in-riyadh/2026-06-17', '/moon/saudi-arabia/riyadh/2026/06/17'],
    ]) {
        const r = await req(u);
        check(`${u} → 301 ${to} (MLRC)`, r.status === 301 && r.loc === to, `status=${r.status} loc=${r.loc}`);
    }
    check('/moon/saudi-arabia/riyadh = 200 (hub)', (await req('/moon/saudi-arabia/riyadh')).status === 200);
    check('/moon/saudi-arabia/riyadh/2026 = 200 (year)', (await req('/moon/saudi-arabia/riyadh/2026')).status === 200);
    check('/moon/saudi-arabia/riyadh/2026/06 = 200 (month)', (await req('/moon/saudi-arabia/riyadh/2026/06')).status === 200);
    check('/moon/saudi-arabia/riyadh/2026/06/17 = 200 (day)', (await req('/moon/saudi-arabia/riyadh/2026/06/17')).status === 200);
    check('/moon/saudi-arabia = 200 (country) · /moon = 200 (hub)', (await req('/moon/saudi-arabia')).status === 200 && (await req('/moon')).status === 200);
    {
        // MLRC: validate Meeus via nested DAY pages (legacy grid now 301s; same engine, same output).
        const r15 = await req('/moon/saudi-arabia/riyadh/2026/06/15'), r30 = await req('/moon/saudi-arabia/riyadh/2026/06/30');
        const ok15 = r15.status === 200 && r15.body.includes('المحاق'), ok30 = r30.status === 200 && r30.body.includes('البدر');
        check('Meeus 49 unchanged: 15 Jun=المحاق · 30 Jun=البدر (nested day pages)', ok15 && ok30, `15=${ok15} 30=${ok30}`);
    }

    // ── MOON-CITY-TODAY-EXPLORE-SECTION-1: "Explore the Moon in {city}" section replaces the today nav CTAs ──
    console.log('\n── Explore-the-Moon section on the today page (replaces the month/year nav CTAs) ──');
    {
        const xTitle = (x) => (x.match(/id="mc-explore-title"[^>]*>([^<]*)</) || [])[1] || '';
        const tb = (await req('/moon/saudi-arabia/riyadh/today')).body;
        check('today: #mc-explore section + title ("استكشف القمر في الرياض")', /id="mc-explore"/.test(tb) && tb.includes('استكشف القمر في الرياض'));
        const xHrefs = [...tb.matchAll(/<a class="mc-explore-card" href="([^"]+)"/g)].map(m => m[1]);
        check('today: 3 link cards; FIRST → country page, then city year + month', xHrefs.length === 3 && xHrefs[0] === '/moon/saudi-arabia' && /\/moon\/saudi-arabia\/riyadh\/\d{4}$/.test(xHrefs[1]) && /\/moon\/saudi-arabia\/riyadh\/\d{4}\/\d{2}$/.test(xHrefs[2]), xHrefs.join(' '));
        check('today: first-card label = "moon in cities of {country}"', tb.includes('القمر في مدن المملكة العربية السعودية'));
        check('today: date picker present (y/m/d + disabled go + scoped base)', /id="mc-exp-y"/.test(tb) && /id="mc-exp-m"/.test(tb) && /id="mc-exp-d"/.test(tb) && /id="mc-exp-go" class="mc-explore-go" disabled/.test(tb) && /b="\/moon\/saudi-arabia\/riyadh\/"/.test(tb));
        check('today: OLD nav CTAs removed (no moon-today-month/year-cta)', !/id="moon-today-month-cta"/.test(tb) && !/id="moon-today-year-cta"/.test(tb));
        check('today: section placed before #moon-current-month-h2', tb.indexOf('id="mc-explore"') > 0 && tb.indexOf('id="mc-explore"') < tb.indexOf('id="moon-current-month-h2"'));
        for (const u of [xHrefs[0], xHrefs[1], xHrefs[2], '/moon/saudi-arabia/riyadh/2026/12/09']) check(`today: link 200 ${u}`, (await req(u)).status === 200);
        // 10/10 native title + lang-prefixed country href on the first card (no /en/en double prefix)
        const xNat = { en: 'Explore the Moon in', fr: 'Explorez la Lune', tr: 'Keşfedin', ur: 'دریافت کریں', de: 'entdecken', id: 'Jelajahi Bulan', es: 'Explora la Luna', bn: 'অন্বেষণ করুন', ms: 'Terokai Bulan' };
        for (const [lang, sent] of Object.entries(xNat)) {
            const b = (await req(`/${lang}/moon/saudi-arabia/riyadh/today`)).body;
            const fh = (b.match(/<a class="mc-explore-card" href="([^"]+)"/) || [])[1] || '';
            check(`today explore native ${lang} + /${lang}/ country href`, xTitle(b).includes(sent) && fh === `/${lang}/moon/saudi-arabia` && !/\/en\/en\//.test(b));
        }
        // scope: section is today-page only — NOT on hub / year / month / day
        for (const u of ['/moon/saudi-arabia/riyadh', '/moon/saudi-arabia/riyadh/2026', '/moon/saudi-arabia/riyadh/2026/06', '/moon/saudi-arabia/riyadh/2026/06/17']) {
            check(`scope: no explore section on ${u}`, !(await req(u)).body.includes('id="mc-explore"'));
        }
    }

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ unexpected', e && e.stack || e); exitCode = 1;
} finally { s.kill('SIGKILL'); }
process.exit(exitCode);
