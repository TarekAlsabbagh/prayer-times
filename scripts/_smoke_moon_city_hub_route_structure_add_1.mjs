// MOON-CITY-HUB-ROUTE-STRUCTURE-ADD-1 — dedicated smoke for the nested city moon hub.
//
// Pins the Phase-4 contract: /[lang/]moon/{country}/{city} is the canonical structural
// alias for the legacy city moon hub /moon-in-{city} — SAME content, 4-level breadcrumb
// (Home › Moon Phase › {Country} › {City}) with DOM ≡ BreadcrumbList JSON-LD, self
// canonical + 10-lang hreflang, page-moon active (not footer-only), single H1, the
// __PRAYER_CITY__ seed, the 301 old→new (+langs), mismatch→301, validation 404s, and
// the legacy today/month/date routes left UNTOUCHED (200, not migrated).
// MOON-DAY-PAGES-REMOVAL-1: the hub keeps today's moon block (#moon-main-card …); its explore section = 3 cards
//   (country, year, month) + a year/month picker (no #mc-exp-d, no day URL); day/today and legacy today/dated → 410;
//   legacy month 301 stays; the month page detail-CTA never links /today. The 404 list is unchanged.
//
// Run: node scripts/_smoke_moon_city_hub_route_structure_add_1.mjs
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (label, ok, extra) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); };

const PORT = 8231;
function req(p) {
    return new Promise((resolve) => {
        const r = http.request({ host: 'localhost', port: PORT, path: p, method: 'GET', headers: { 'Accept-Encoding': 'identity' } }, res => {
            // Whole body as one UTF-8 stream (multibyte-safe).
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
// MOON-DAY-PAGES-REMOVAL-1: a removed day/today page = 410 in ONE response, no Location, small static body.
const is410 = (r) => r.status === 410 && !r.loc && /data-tp-gone="moon-day"/.test(r.body) && !/id="page-moon"/.test(r.body) && Buffer.byteLength(r.body) < 4096;
const canonOf = (b) => (b.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
const h1Count = (b) => (b.match(/<h1\b/g) || []).length;
const attrOf = (b, id, attr) => { const m = b.match(new RegExp('id="' + id + '"[^>]*' + attr + '="([^"]*)"')); return m ? m[1] : null; };
const textOfId = (b, id) => { const m = b.match(new RegExp('id="' + id + '"[^>]*>([^<]*)<')); return m ? m[1].trim() : null; };
// Visible DOM breadcrumb rungs (in order), scoped to the .moon-breadcrumb nav so we never
// pick up a stray href="/" elsewhere on the page. Hidden rungs (bc-month/bc-date) are empty
// → filtered out. On the nested hub this yields [Home, Moon Phase, Country, City].
function domCrumbs(b) {
    const nav = (b.match(/<nav class="moon-breadcrumb"[\s\S]*?<\/nav>/) || [''])[0];
    const out = [];
    // MOON-CITY-DAY-…-SCOPE-CORRECTION-FIX-1: the shared #page-moon breadcrumb gained a hidden
    //   year rung (bc-moon-year-li, unhidden only on the nested DAY). Walk each <li> and SKIP the
    //   hidden ones + the separators so this reflects the VISIBLE rungs (4 on the hub).
    const items = [...nav.matchAll(/<li class="[^"]*"[^>]*?>([\s\S]*?)<\/li>/g)];
    for (const m of items) {
        if (/\bhidden\b/.test(m[0])) continue;
        const t = m[1].replace(/<[^>]*>/g, '').trim();
        if (t && t !== '›') out.push(t);
    }
    return out;
}
// Anchor on the BreadcrumbList object, then grab its itemListElement array up to the
// first `]` (ListItem objects contain no `]`, so this isolates the breadcrumb array
// without bleeding into any other JSON-LD on the page). [\s\S] tolerates newlines.
function _bcArr(b) {
    const i = b.indexOf('"@type":"BreadcrumbList"');
    if (i < 0) return null;
    const m = b.slice(i).match(/"itemListElement":\[([\s\S]*?)\]/);
    return m ? m[1] : null;
}
function jsonldCrumbNames(b) {
    const arr = _bcArr(b);
    if (arr == null) return null;
    return (arr.match(/"name":"([^"]*)"/g) || []).map(s => s.replace(/^"name":"/, '').replace(/"$/, ''));
}
function jsonldCrumbItems(b) {
    const arr = _bcArr(b);
    if (arr == null) return null;
    return (arr.match(/"item":"([^"]*)"/g) || []).map(s => s.replace(/^"item":"/, '').replace(/"$/, ''));
}

let exitCode = 1;
let SITE = `http://localhost:${PORT}`;
const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
try {
    if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }
    SITE = (canonOf((await req('/moon/saudi-arabia/riyadh')).body).match(/^(https?:\/\/[^/]+)/) || [])[1] || SITE;

    // ── A) nested hub = 200, page-moon, 1 H1, self canonical, not footer-only (multi-country) ──
    console.log('── A) nested city hub = 200 + page-moon + 1 H1 + self canonical (multi-country) ──');
    const NESTED = ['/moon/saudi-arabia/riyadh', '/en/moon/saudi-arabia/riyadh', '/moon/united-states/new-york', '/fr/moon/saudi-arabia/jeddah'];
    for (const u of NESTED) {
        const r = await req(u);
        check(`${u}: 200 + page-moon + 1 H1 + self canonical + body>60KB`,
            r.status === 200 && pageMoonActive(r.body) && h1Count(r.body) === 1 && canonOf(r.body) === SITE + u && r.body.length > 60000,
            `status=${r.status} pm=${pageMoonActive(r.body)} h1=${h1Count(r.body)} canon=${canonOf(r.body)} len=${r.body.length}`);
    }

    // ── B) 4-level breadcrumb DOM ≡ BreadcrumbList JSON-LD (AR + EN) ──
    console.log('\n── B) breadcrumb DOM ≡ JSON-LD (Home › Moon Phase › Country › City) ──');
    for (const [u, hub, country, city] of [
        ['/moon/saudi-arabia/riyadh', 'حالة القمر', 'المملكة العربية السعودية', 'الرياض'],
        ['/en/moon/saudi-arabia/riyadh', 'Moon Phase', 'Saudi Arabia', 'Riyadh'],
    ]) {
        const b = (await req(u)).body;
        const dom = domCrumbs(b);
        const names = jsonldCrumbNames(b);
        const items = jsonldCrumbItems(b);
        const lp = u.startsWith('/en') ? '/en' : '';
        // Home crumb item is lang-specific: AR root = SITE/, EN home = SITE/en/.
        const expectItems = [SITE + (lp ? lp + '/' : '/'), SITE + lp + '/moon', SITE + lp + '/moon/saudi-arabia', SITE + u];
        check(`${u}: DOM breadcrumb ≡ JSON-LD names (both 4 rungs, identical)`, dom.length === 4 && JSON.stringify(dom) === JSON.stringify(names), `dom=${JSON.stringify(dom)} jsonld=${JSON.stringify(names)}`);
        check(`${u}: rungs 2-4 = [${hub}, ${country}, ${city}]`, !!names && names.slice(1).join('|') === [hub, country, city].join('|'), JSON.stringify(names));
        check(`${u}: JSON-LD items == [/, ${lp}/moon, ${lp}/moon/saudi-arabia, self]`, JSON.stringify(items) === JSON.stringify(expectItems), JSON.stringify(items));
        check(`${u}: hub href=${lp}/moon · country href=${lp}/moon/saudi-arabia · city current(no href)`,
            attrOf(b, 'bc-moon-hub', 'href') === lp + '/moon' && attrOf(b, 'bc-moon-country', 'href') === lp + '/moon/saudi-arabia' && !/id="bc-moon"[^>]*href=/.test(b),
            `hub=${attrOf(b, 'bc-moon-hub', 'href')} country=${attrOf(b, 'bc-moon-country', 'href')}`);
    }

    // ── C) canonical self + hreflang (10 langs + x-default) ──
    console.log('\n── C) canonical self + hreflang (10 langs + x-default) ──');
    {
        const b = (await req('/moon/saudi-arabia/riyadh')).body;
        const hreflangs = (b.match(/hreflang="([a-z-]+)"/g) || []).map(s => s.replace(/hreflang="|"/g, ''));
        const set = new Set(hreflangs);
        const tenLangs = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'].every(l => set.has(l));
        check('canonical self = SITE/moon/saudi-arabia/riyadh', canonOf(b) === SITE + '/moon/saudi-arabia/riyadh', canonOf(b));
        check('hreflang: 10 langs + x-default present', tenLangs && set.has('x-default'), [...set].join(','));
        check('hreflang en points to /en/moon/saudi-arabia/riyadh', b.includes(`hreflang="en" href="${SITE}/en/moon/saudi-arabia/riyadh"`) || b.includes(`href="${SITE}/en/moon/saudi-arabia/riyadh" hreflang="en"`));
        check('indexable (no noindex)', !/<meta name="robots"[^>]*noindex/i.test(b));
        check('__PRAYER_CITY__ seed present with localized name (الرياض)', /window\.__PRAYER_CITY__=\{[^<]*"slug":"riyadh"[^<]*"name":"الرياض"/.test(b));
    }

    // ── C2) HUB calendar widget = COMPACT CTA (#moon-hub-cal) ONLY, nested dynamic href, NO full grid ──
    //   MOON-CITY-HUB-ROUTE-STRUCTURE-SCOPE-CORRECTION-FIX-1: the legacy hub /moon-in-{city} carried a compact
    //   calendar CTA card (`#moon-hub-cal` / `.moon-hub-cal-compact`) linking to the CURRENT month. The nested
    //   hub restores it with a NESTED href /moon/{country}/{city}/{yyyy}/{mm} (current month, DYNAMIC — not
    //   hardcoded, from the same legacy _calTodayD), and must NOT show the full `.moon-hub-cal-grid` (month-only).
    console.log('\n── C2) hub compact calendar CTA (#moon-hub-cal) restored + nested dynamic href + NO full grid ──');
    {
        const _now = new Date();
        const _curYM = `${_now.getFullYear()}/${String(_now.getMonth() + 1).padStart(2, '0')}`;
        for (const base of ['/moon/saudi-arabia/riyadh', '/en/moon/saudi-arabia/riyadh', '/moon/saudi-arabia/jeddah']) {
            const b = (await req(base)).body;
            check(`${base}: #moon-hub-cal compact CTA present`, /id="moon-hub-cal"[^>]*moon-hub-cal-compact|moon-hub-cal-compact[^>]*id="moon-hub-cal"/.test(b));
            // MOON-CITY-HUB-CALENDAR-CTA-TOP-PLACEMENT-1: the CTA now sits at the TOP of the hub
            // content — BEFORE the moon-phase card (#moon-main-card). User-approved order deviation.
            check(`${base}: #moon-hub-cal placed BEFORE #moon-main-card (top placement)`, b.indexOf('id="moon-hub-cal"') > -1 && b.indexOf('id="moon-hub-cal"') < b.indexOf('id="moon-main-card"'));
            const href = ((b.match(/id="moon-hub-cal"[^>]*href="([^"]+)"|href="([^"]+)"[^>]*id="moon-hub-cal"/) || []).slice(1).find(Boolean)) || '';
            check(`${base}: #moon-hub-cal href = nested current month ${base}/${_curYM}`, href === `${base}/${_curYM}`, `href=${href}`);
            check(`${base}: NO full .moon-hub-cal-grid on hub`, !b.includes('moon-hub-cal-grid'));
            check(`${base}: #moon-forecast still present`, /id="moon-forecast"/.test(b));
            check(`${base}: 0 SSR legacy moon hrefs`, (b.match(/href="\/(?:moon-in-|moon-today-in-)[^"]*"/g) || []).length === 0);
        }
    }

    // ── D) 301 old→new (+langs) · mismatch→301 · validation 404 ──
    console.log('\n── D) 301 legacy→nested (+langs) · mismatch→301 · validation 404 ──');
    for (const [from, to] of [
        ['/moon-in-riyadh', '/moon/saudi-arabia/riyadh'],
        ['/en/moon-in-riyadh', '/en/moon/saudi-arabia/riyadh'],
        ['/ur/moon-in-jeddah', '/ur/moon/saudi-arabia/jeddah'],
        ['/moon-in-new-york', '/moon/united-states/new-york'],
    ]) {
        const r = await req(from);
        check(`${from} → 301 ${to}`, r.status === 301 && r.loc === to, `status=${r.status} loc=${r.loc}`);
    }
    {
        const r = await req('/moon/united-states/riyadh');
        check('/moon/united-states/riyadh → 301 /moon/saudi-arabia/riyadh (city in wrong country)', r.status === 301 && r.loc === '/moon/saudi-arabia/riyadh', `status=${r.status} loc=${r.loc}`);
    }
    for (const u of ['/moon/saudi-arabia/notacity', '/moon/zzz-not-a-country/riyadh', '/moon/saudi-arabia/riyadh/today/test', '/moon/saudi-arabia/riyadh/2026-06', '/moon/saudi-arabia/riyadh/2026-06-17', '/en/moon/saudi-arabia/riyadh/2026-06-17']) {
        const r = await req(u);
        check(`${u} → 404 (not a served route)`, r.status === 404 && !pageMoonActive(r.body), `status=${r.status} pm=${pageMoonActive(r.body)}`);
    }

    // ── E) legacy routes — MOON-LEGACY-ROUTES-CLEANUP-BEFORE-LAUNCH: ALL legacy flat routes now 301
    //        (lang-preserved) to their nested equivalent (was 200 before MLRC). /moon + /moon/{country} 200.
    //        MOON-DAY-PAGES-REMOVAL-1: legacy today + dated used to 301 into a day/today page → now 410 Gone (no Location).
    console.log('\n── E) legacy month 301 → nested · legacy today/date 410 · /moon · /moon/{country} 200 ──');
    for (const [u, to] of [
        ['/moon-in-riyadh/2026-06', '/moon/saudi-arabia/riyadh/2026/06'],
    ]) {
        const r = await req(u);
        check(`${u}: 301 → ${to} (MLRC legacy cleanup)`, r.status === 301 && r.loc === to, `status=${r.status} loc=${r.loc}`);
    }
    for (const u of ['/moon-today-in-riyadh', '/moon-in-riyadh/2026-06-17']) {
        const r = await req(u);
        check(`${u}: 410 Gone, no Location (MOON-DAY-PAGES-REMOVAL-1)`, is410(r), `status=${r.status} loc=${r.loc} len=${Buffer.byteLength(r.body)}`);
    }
    check('/moon still 200 (global hub)', (await req('/moon')).status === 200);
    check('/moon/saudi-arabia still 200 (country page)', (await req('/moon/saudi-arabia')).status === 200);

    // ── F) MOON-CITY-HUB-EXPLORE-SECTION-1: "Explore the Moon in {city}" section below #moon-main-card ──
    console.log('\n── F) hub explore section (3 link cards + y/m picker) below #moon-main-card; year-CTA + detail-CTA removed ──');
    {
        const xTitle = (x) => (x.match(/id="mc-explore-title"[^>]*>([^<]*)</) || [])[1] || '';
        const hb = (await req('/moon/saudi-arabia/riyadh')).body;
        check('hub: #mc-explore section + title ("استكشف القمر في الرياض")', /id="mc-explore"/.test(hb) && hb.includes('استكشف القمر في الرياض'));
        // MOON-DAY-PAGES-REMOVAL-1: the today card is gone — 3 link cards (country, year, month), 0 /today hrefs.
        const xHrefs = [...hb.matchAll(/<a class="mc-explore-card" href="([^"]+)"/g)].map(m => m[1]);
        const _xi = hb.indexOf('id="mc-explore"'), xSec = _xi >= 0 ? hb.slice(_xi, hb.indexOf('</section>', _xi)) : '';
        check('hub: 3 link cards — FIRST → country, then year/month (no today card)', xHrefs.length === 3 && xHrefs[0] === '/moon/saudi-arabia' && /\/riyadh\/\d{4}$/.test(xHrefs[1]) && /\/riyadh\/\d{4}\/\d{2}$/.test(xHrefs[2]), xHrefs.join(' '));
        check('hub: explore section has 0 /today hrefs', !/href="[^"]*\/today(?:[?#][^"]*)?"/.test(xSec) && !xHrefs.some(h => /\/today$/.test(h)), xHrefs.join(' '));
        check('hub: first-card label = "moon in cities of {country}"', hb.includes('القمر في مدن المملكة العربية السعودية'));
        check('hub: "moon today" card REMOVED from the explore section (no قمر اليوم في الرياض card)', !xSec.includes('قمر اليوم في الرياض'));
        // the picker is year + month → month page: #mc-exp-y + #mc-exp-m, NO #mc-exp-d, and its inline script reads no day value
        {
            const pScripts = [...hb.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).filter(t => t.includes('mc-exp-y'));
            check('hub: date picker present (y/m + go + scoped base), NO day select #mc-exp-d', /id="mc-exp-y"/.test(hb) && /id="mc-exp-m"/.test(hb) && !/id="mc-exp-d"/.test(hb) && /id="mc-exp-go"/.test(hb) && /b="\/moon\/saudi-arabia\/riyadh\/"/.test(hb));
            check('hub: picker inline script present and builds no day URL (no "d.value", no mc-exp-d)', pScripts.length >= 1 && pScripts.every(t => !t.includes('d.value') && !t.includes('mc-exp-d')), `${pScripts.length} picker script(s)`);
        }
        // the hub still carries today's moon information (main card + phase/illumination + 14-day forecast)
        check('hub: today-moon block present (#moon-main-card + #moon-phase-name + #moon-illumination + #moon-forecast)', /id="moon-main-card"/.test(hb) && /id="moon-phase-name"/.test(hb) && /id="moon-illumination"/.test(hb) && /id="moon-forecast"/.test(hb));
        check('hub: explore BELOW #moon-main-card (main < explore < month-h2)', hb.indexOf('id="moon-main-card"') > 0 && hb.indexOf('id="mc-explore"') > hb.indexOf('id="moon-main-card"') && hb.indexOf('id="moon-current-month-h2"') > hb.indexOf('id="mc-explore"'));
        check('hub: standalone year-CTA + detail-CTA REMOVED, compact-cal KEPT', !/id="moon-hub-year-cta"/.test(hb) && !/moon-hub-detail-cta/.test(hb) && /id="moon-hub-cal"/.test(hb));
        for (const u of xHrefs) check(`hub: link 200 ${u}`, (await req(u)).status === 200);
        { const r = await req('/moon/saudi-arabia/riyadh/2026/12/09'); check('/moon/saudi-arabia/riyadh/2026/12/09 → 410 Gone (no day page; MOON-DAY-PAGES-REMOVAL-1)', is410(r), `status=${r.status} loc=${r.loc}`); }
        const xNat = { en: 'Explore the Moon in', fr: 'Explorez la Lune', tr: 'Keşfedin', ur: 'دریافت کریں', de: 'entdecken', id: 'Jelajahi Bulan', es: 'Explora la Luna', bn: 'অন্বেষণ করুন', ms: 'Terokai Bulan' };
        for (const [lang, sent] of Object.entries(xNat)) {
            const b = (await req(`/${lang}/moon/saudi-arabia/riyadh`)).body;
            const fh = (b.match(/<a class="mc-explore-card" href="([^"]+)"/) || [])[1] || '';
            check(`hub explore native ${lang} + /${lang}/ country href`, xTitle(b).includes(sent) && fh === `/${lang}/moon/saudi-arabia` && !/\/en\/en\//.test(b));
        }
        // MOON-DAY-PAGES-REMOVAL-1: the MONTH page has no detail-CTA to /today; if .moon-hub-detail-cta is still rendered it links the hub
        {
            const mb = (await req('/moon/saudi-arabia/riyadh/2026/06')).body;
            const ctas = [...mb.matchAll(/<a\b[^>]*class="moon-hub-detail-cta"[^>]*>/g)].map(m => (m[0].match(/href="([^"]*)"/) || [])[1] || '');
            check('month page: no detail-CTA to /today (.moon-hub-detail-cta absent, or links the hub /moon/saudi-arabia/riyadh)', ctas.every(h => h === '/moon/saudi-arabia/riyadh'), `ctas=${JSON.stringify(ctas)}`);
        }
    }

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ unexpected', e && e.message); exitCode = 1;
} finally { s.kill('SIGKILL'); }
process.exit(exitCode);
