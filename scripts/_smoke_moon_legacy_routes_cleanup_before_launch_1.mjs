// MOON-LEGACY-ROUTES-CLEANUP-BEFORE-LAUNCH — dedicated guardrails for the legacy→nested moon
// route cleanup shipped before launch. Pins the full contract so a regression fails BEFORE it ships.
//
// PART A — legacy → nested 301 (lang-preserved) for ALL 5 legacy shapes:
//            /moon-today                       → /moon
//            /moon-in-{city}                   → /moon/{country}/{city}
//            /moon-today-in-{city}             → /moon/{country}/{city}/today
//            /moon-in-{city}/{yyyy-mm}         → /moon/{country}/{city}/{yyyy}/{mm}
//            /moon-in-{city}/{yyyy-mm-dd}      → /moon/{country}/{city}/{yyyy}/{mm}/{dd}
//          across ar (no prefix) + en + fr + ur + de prefixes. Each 301 target itself = 200.
// PART B — validation: invalid legacy date (2026-06-32), invalid month (2026-13), Feb-30, Hijri-year
//          date, and unknown/garbage city all → 404 (NOT 301-to-200, NOT a 200 thin page).
// PART C — coord-suffix legacy (/moon-today-in-{city}-{lat}-{lng}, /moon-in-{city}-{lat}-{lng}) still
//          renders 200 (no nested target exists for a raw-coord slug — must NOT 404).
// PART D — sitemap: NO legacy flat moon route anywhere (main + cities); nested hub + today PRESENT;
//          no bulk day-page flood.
// PART E — client _nestedMoonHrefClient (extracted from js/app.js): hub/today/month/day build the
//          nested URL when country known; coord-suffix slug + unknown country → legacy fallback.
// PART F — SSR: rendered nested pages emit ZERO legacy moon hrefs (the SSR base links are all nested).
// MOON-DAY-PAGES-REMOVAL-1: legacy today + dated shapes (clean + coord) → 410 Gone, no Location (5 langs); hub/month/
//          /moon-today 301s stay; sitemap carries no /today; client helper never returns a /today, day or
//          /moon-today-in- URL ('today' → hub, 'day' → ''); F also rejects nested today/day hrefs.
//
// Run: node scripts/_smoke_moon_legacy_routes_cleanup_before_launch_1.mjs
import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (label, ok, extra) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); };

const PORT = 8231;
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
const canonOf = (b) => (b.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
const pageMoonActive = (b) => /class="page active" id="page-moon"/.test(b);

// ── PART E (offline): extract + run the REAL shipped client helper ──
console.log('── E) client _nestedMoonHrefClient (extracted from js/app.js) ──');
const appSrc = readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
// MOON-DAY-PAGES-REMOVAL-1: signature-tolerant extraction — `function _nestedMoonHrefClient(` up to the next top-level `\n}`.
const fnMatch = appSrc.match(/function _nestedMoonHrefClient\([^)]*\)\s*\{[\s\S]*?\n\}/);
check('js/app.js defines _nestedMoonHrefClient(…)', !!fnMatch);
// INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1 (D11): _nestedMoonHrefClient now calls the shipped supported-year helpers, so the
//   REAL _moonYearRange() + _moonYearInRange(y) are extracted from js/app.js too (no stub). This sandbox has no window
//   island, so they use their defensive fallback (current UTC year ±5) and the 2026 month/day cases stay in range.
const yrRangeMatch = appSrc.match(/function _moonYearRange\(\)\s*\{[\s\S]*?\n\}/);
const yrInRangeMatch = appSrc.match(/function _moonYearInRange\(y\)\s*\{[\s\S]*?\n\}/);
check('js/app.js defines _moonYearRange() + _moonYearInRange(y) (called by _nestedMoonHrefClient)', !!yrRangeMatch && !!yrInRangeMatch);
let _nested = () => '';
if (fnMatch) {
    // makeCountrySlug stub: 'sa'→'saudi-arabia', 'us'→'united-states', else '' (unknown country → legacy).
    const stub = `var currentCountryCode='';var currentEnglishCountry='';function makeCountrySlug(cc){return ({sa:'saudi-arabia',us:'united-states'})[cc]||'';}`;
    // INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1: evaluate together with the extracted range helpers it now depends on.
    try { _nested = new Function(stub + '\n' + (yrRangeMatch ? yrRangeMatch[0] : '') + '\n' + (yrInRangeMatch ? yrInRangeMatch[0] : '') + '\nreturn (' + fnMatch[0] + ');')(); } catch (e) { check('_nestedMoonHrefClient evaluable', false, e.message); }
}
// MOON-DAY-PAGES-REMOVAL-1: the helper never builds a removed page — 'today' maps to the city HUB, 'day' returns ''
//   (callers render the day as plain text), and the legacy fallback is the hub /moon-in-{slug} (301 → nested hub) or
//   /moon, never /moon-today-in-.
check("hub (cc=sa) → nested hub", _nested('riyadh', '', 'hub', 'sa') === '/moon/saudi-arabia/riyadh', _nested('riyadh', '', 'hub', 'sa'));
check("hub (cc=sa, /en) → nested hub w/ lang", _nested('riyadh', '/en', 'hub', 'sa') === '/en/moon/saudi-arabia/riyadh', _nested('riyadh', '/en', 'hub', 'sa'));
check("today (cc=sa, /en) → nested HUB w/ lang (no /today page)", _nested('riyadh', '/en', 'today', 'sa') === '/en/moon/saudi-arabia/riyadh', _nested('riyadh', '/en', 'today', 'sa'));
check("month (cc=us) → nested /yyyy/mm", _nested('new-york', '', 'month', 'us', '2026-06') === '/moon/united-states/new-york/2026/06', _nested('new-york', '', 'month', 'us', '2026-06'));
check("day (cc=us) → '' (no day page; plain text)", _nested('new-york', '', 'day', 'us', '2026-06-17') === '', _nested('new-york', '', 'day', 'us', '2026-06-17'));
{
    const fb = _nested('zzz', '', 'today', 'xx');
    check("unknown country → legacy hub fallback /moon-in-{slug} or /moon (no unsafe inference, never /moon-today-in-)", fb === '/moon-in-zzz' || fb === '/moon', fb);
    const fbe = _nested('zzz', '', 'hub', '');
    check("empty country → legacy hub fallback /moon-in-{slug} or /moon", fbe === '/moon-in-zzz' || fbe === '/moon', fbe);
    const fbc = _nested('loc-21.4-39.8', '', 'today', 'sa');
    check("coord-suffix slug → legacy hub fallback /moon-in-{slug} or /moon (no nested target)", fbc === '/moon-in-loc-21.4-39.8' || fbc === '/moon', fbc);
}
// sweep: no combination ever yields a removed page (/today, /YYYY/MM/DD, /moon-today-in-, legacy /moon-in-x/YYYY-MM-DD).
{
    const bad = [];
    const CALLS = [['hub', undefined], ['hub', '2026-06-17'], ['today', undefined], ['today', '2026-06-17'], ['month', '2026-06'], ['day', '2026-06-17'], ['day', '2026-06']];
    for (const slug of ['riyadh', 'new-york', 'zzz', 'loc-21.4-39.8']) for (const lp of ['', '/en', '/fr']) for (const cc of ['sa', 'us', 'xx', '']) for (const [kind, ds] of CALLS) {
        let out; try { out = String(_nested(slug, lp, kind, cc, ds)); } catch (e) { out = 'THROW:' + e.message; }
        if (/^THROW:/.test(out) || /\/today(?:[?#]|$)/.test(out) || /\/\d{4}\/\d{2}\/\d{2}(?:[?#]|$)/.test(out) || out.includes('/moon-today-in-') || /\/moon-in-[^/?#]+\/\d{4}-\d{2}-\d{2}/.test(out)) bad.push(`${kind}(${slug},${lp || "''"},${cc || "''"},${ds || '-'})=${out}`);
    }
    check('sweep: _nestedMoonHrefClient never returns a /today, /YYYY/MM/DD, /moon-today-in- or legacy dated URL', bad.length === 0, bad.slice(0, 4).join(' | '));
}

let exitCode = 1;
let SITE = `http://localhost:${PORT}`;
const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
try {
    if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }
    SITE = (canonOf((await req('/moon')).body).match(/^(https?:\/\/[^/]+)/) || [])[1] || SITE;

    // ── PART A: legacy → nested 301 (lang-preserved) ──
    //   MOON-DAY-PAGES-REMOVAL-1: the today + dated shapes used to 301 into a day/today page → now 410 Gone in ONE
    //   response (no Location), in all 5 languages. /moon-today, hub and month keep their 301s.
    const is410 = (r) => r.status === 410 && !r.loc && /data-tp-gone="moon-day"/.test(r.body) && !/id="page-moon"/.test(r.body) && Buffer.byteLength(r.body) < 4096;
    const goneInfo = (r) => `status=${r.status} loc=${r.loc} gone=${/data-tp-gone="moon-day"/.test(r.body)} len=${Buffer.byteLength(r.body)}`;
    console.log('\n── A) legacy → nested 301 (3 kept shapes × 5 langs) · legacy today/dated → 410 (2 shapes × 5 langs) ──');
    const LANGS = ['', '/en', '/fr', '/ur', '/de'];
    const SHAPES = [
        (lp) => [`${lp}/moon-today`, `${lp}/moon`],
        (lp) => [`${lp}/moon-in-riyadh`, `${lp}/moon/saudi-arabia/riyadh`],
        (lp) => [`${lp}/moon-in-riyadh/2026-06`, `${lp}/moon/saudi-arabia/riyadh/2026/06`],
    ];
    const GONE_SHAPES = [
        (lp) => `${lp}/moon-today-in-riyadh`,
        (lp) => `${lp}/moon-in-riyadh/2026-06-17`,
    ];
    for (const lp of LANGS) {
        for (const mk of SHAPES) {
            const [from, to] = mk(lp);
            const r = await req(from);
            check(`${from} → 301 ${to}`, r.status === 301 && r.loc === to, `status=${r.status} loc=${r.loc}`);
        }
        for (const mk of GONE_SHAPES) {
            const u = mk(lp);
            const r = await req(u);
            check(`${u} → 410 Gone, no Location (MOON-DAY-PAGES-REMOVAL-1)`, is410(r), goneInfo(r));
        }
    }
    // each 301 target itself is a live 200 (no redirect chain to a 404/dead-end)
    console.log('\n── A2) each nested target = live 200 ──');
    for (const u of ['/moon', '/moon/saudi-arabia/riyadh', '/moon/saudi-arabia/riyadh/2026/06']) {
        const r = await req(u);
        check(`${u} → 200`, r.status === 200, `status=${r.status}`);
    }

    // ── PART B: validation → 404 (not 301-to-200, not thin 200) ──
    console.log('\n── B) invalid legacy date/month + unknown city → 404 ──');
    for (const u of [
        '/moon-in-riyadh/2026-06-32',   // invalid day
        '/moon-in-riyadh/2026-13',      // invalid month
        '/moon-in-riyadh/2026-13-01',   // invalid month (dated)
        '/moon-in-riyadh/2026-02-30',   // Feb 30 (non-existent)
        '/moon-in-riyadh/1447-10-03',   // Hijri-year date (strict policy → 404)
        '/moon-today-in-notacityxyz',   // unknown city (today)
        '/moon-in-notacityxyz',         // unknown city (hub)
        '/moon-in-notacityxyz/2026-06', // unknown city (month)
    ]) {
        const r = await req(u);
        check(`${u} → 404 (not 301, not thin 200)`, r.status === 404 && r.body.length < 50000, `status=${r.status} len=${r.body.length}`);
    }

    // ── PART C: coord-suffix legacy HUB must NOT 404 — it resolves to a live 200 page (possibly via the
    //   pre-existing coord-strip canonical redirect, then the MLRC legacy→nested 301). Follow the chain.
    //   MOON-DAY-PAGES-REMOVAL-1: the coord TODAY and coord DATED forms → 410 directly (one hop, no chain).
    console.log('\n── C) coord-suffix legacy hub resolves to 200 · coord today/dated → 410 ──');
    const follow = async (u, max = 4) => { let cur = u, last = null; for (let i = 0; i < max; i++) { last = await req(cur); if (last.status === 301 && last.loc) { cur = last.loc; continue; } break; } return { final: cur, status: last.status, body: last.body }; };
    for (const u of ['/moon-in-riyadh-24.7-46.7']) {
        const r = await follow(u);
        check(`${u} → resolves to 200 page-moon (final=${r.final})`, r.status === 200 && pageMoonActive(r.body), `status=${r.status} pm=${pageMoonActive(r.body)}`);
    }
    for (const u of ['/moon-today-in-riyadh-24.7-46.7', '/moon-in-riyadh-24.7-46.7/2026-06-17']) {
        const r = await req(u);
        check(`${u} → 410 Gone directly, no Location (MOON-DAY-PAGES-REMOVAL-1)`, is410(r), goneInfo(r));
    }

    // ── PART D: sitemap — NO legacy flat moon routes anywhere; nested hub present; NO nested today (MOON-DAY-PAGES-REMOVAL-1) ──
    console.log('\n── D) sitemap: 0 legacy flat moon routes · nested hub present · nested today absent · no day flood ──');
    const sm = (await req('/sitemap-main.xml')).body;
    const smc = (await req('/sitemap-cities-1.xml')).body;
    check('sitemap-main: bare /moon-today ABSENT', !/\/moon-today<\/loc>/.test(sm));
    check('sitemap-cities: /moon-in-{city} ABSENT', !/\/moon-in-[a-z-]+<\/loc>/.test(smc), `${(smc.match(/\/moon-in-[a-z-]+<\/loc>/g) || []).length}`);
    check('sitemap-cities: /moon-today-in-{city} ABSENT', !/\/moon-today-in-[a-z-]+<\/loc>/.test(smc), `${(smc.match(/\/moon-today-in-[a-z-]+<\/loc>/g) || []).length}`);
    check('sitemap-cities: legacy dated /moon-in-{city}/{date} ABSENT', !/\/moon-in-[a-z-]+\/\d{4}-\d{2}(?:-\d{2})?<\/loc>/.test(smc), `${(smc.match(/\/moon-in-[a-z-]+\/\d{4}-\d{2}(?:-\d{2})?<\/loc>/g) || []).length}`);
    check('sitemap-cities: nested hub /moon/{country}/{city} PRESENT', /\/moon\/[a-z-]+\/[a-z-]+<\/loc>/.test(smc));
    check('sitemap-cities: nested today /moon/{country}/{city}/today ABSENT (MOON-DAY-PAGES-REMOVAL-1 — 410)', !/\/moon\/[a-z0-9-]+\/[a-z0-9-]+\/today<\/loc>/.test(smc), `${(smc.match(/\/moon\/[a-z0-9-]+\/[a-z0-9-]+\/today<\/loc>/g) || []).length}`);
    check('sitemap: no nested day-page flood (no /moon/.../{yyyy}/{mm}/{dd})', !/\/moon\/[a-z-]+\/[a-z-]+\/\d{4}\/\d{2}\/\d{2}<\/loc>/.test(sm + smc));

    // ── PART F: SSR rendered nested pages emit ZERO legacy moon hrefs ──
    //   MOON-DAY-PAGES-REMOVAL-1: the removed today/day pages leave the list, and the sweep also rejects nested
    //   /moon/{country}/{city}/today and /{yyyy}/{mm}/{dd} hrefs (HTML comments stripped for that part).
    console.log('\n── F) SSR nested pages emit 0 legacy moon hrefs + 0 nested today/day hrefs ──');
    for (const u of ['/moon', '/moon/saudi-arabia', '/moon/saudi-arabia/riyadh', '/moon/saudi-arabia/riyadh/2026', '/moon/saudi-arabia/riyadh/2026/06']) {
        const b = (await req(u)).body;
        const legacyHrefs = (b.match(/href="[^"]*\/moon-(?:today-)?in-[a-z]/g) || []);
        const nestedDayToday = (b.replace(/<!--[\s\S]*?-->/g, '').match(/href="[^"]*\/moon\/[a-z0-9-]+\/[a-z0-9-]+\/(?:today|\d{4}\/\d{2}\/\d{2})(?:\.html)?(?:[?#][^"]*)?"/g) || []);
        check(`${u}: 0 legacy moon hrefs + 0 nested today/day hrefs in SSR HTML`, legacyHrefs.length === 0 && nestedDayToday.length === 0, [...legacyHrefs, ...nestedDayToday].slice(0, 3).join(' , '));
    }

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ unexpected', e && e.message); exitCode = 1;
} finally { s.kill('SIGKILL'); }
process.exit(exitCode);
