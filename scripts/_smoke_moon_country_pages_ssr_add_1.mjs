// MOON-COUNTRY-PAGES-SSR-ADD-1 — verification (self-contained).
//
// /moon/{country} is a NEW SSR page built on the EXISTING prayer-times-cities.html country grid
// (moon variant), for countries with curated cities. It mirrors /prayer-times-in-{country} in
// structure (breadcrumb, hero, city grid, in-country search, content sections, FAQ) but ALL text
// is about the moon, the city cards/search target the EXISTING city routes /moon-today-in-{city},
// and NO nested /moon/{country}/{city}[/…] route is activated (those stay clean 404).
//
// NOTE: like the prayer country page, this is a standalone template (NOT the SPA #page-* system),
// so "#page-moon active" is N/A here — the page renders its own moon hero/H1/grid/content directly.
// City cards + the in-country search are client-rendered from #country-cities-data; that behavior is
// verified in the browser during the ticket (cards → /moon-today-in-{city}, search → same). This
// smoke pins the SSR contract + SEO + the 404 guards + the prayer regression.
//
// Run: node scripts/_smoke_moon_country_pages_ssr_add_1.mjs
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (label, ok, extra) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); };

const PORT = 8227;
let SITE = `http://localhost:${PORT}`;
function req(p) {
    return new Promise((resolve) => {
        const r = http.request({ host: 'localhost', port: PORT, path: p, method: 'GET', headers: { 'Accept-Encoding': 'identity' } }, res => {
            let b = ''; res.on('data', c => b += c); res.on('end', () => resolve({ status: res.statusCode, body: b, loc: res.headers.location || '' }));
        });
        r.on('error', () => resolve({ status: 0, body: '', loc: '' }));
        r.end();
    });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitReady(ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const r = await req('/health'); if (r.status === 200) return true; await sleep(400); } return false; }
const canonOf = (b) => (b.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
const h1Count = (b) => (b.match(/<h1\b/g) || []).length;
const heroH1 = (b) => { const m = b.match(/<h1[^>]*id="loc-hero-title"[^>]*>([\s\S]*?)<\/h1>/); return m ? m[1].trim() : ''; };
const titleOf = (b) => (b.match(/<title>([^<]*)<\/title>/) || [])[1] || '';

let exitCode = 1;
const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
try {
    if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

    // ── A) /moon/{country} = 200 moon country page (AR) ──
    console.log('── A) /moon/saudi-arabia (AR) ──');
    const m = await req('/moon/saudi-arabia');
    SITE = (canonOf(m.body).match(/^(https?:\/\/[^/]+)/) || [])[1] || SITE;
    check('/moon/saudi-arabia → 200', m.status === 200, String(m.status));
    check('exactly one H1', h1Count(m.body) === 1, String(h1Count(m.body)));
    check('H1 is moon ("مراحل القمر")', /مراحل القمر/.test(heroH1(m.body)), heroH1(m.body).slice(0, 40));
    check('H1 has NO prayer leak ("مواقيت الصلاة")', !/مواقيت الصلاة/.test(heroH1(m.body)));
    check('canonical self = SITE/moon/saudi-arabia', canonOf(m.body) === SITE + '/moon/saudi-arabia', canonOf(m.body));
    check('indexable (no noindex)', !/<meta name="robots"[^>]*noindex/i.test(m.body));
    check('title moon ("مراحل القمر … قمر اليوم")', /<title>مراحل القمر/.test(m.body), titleOf(m.body).slice(0, 50));
    check('variant flag script present (id moon-country-variant)', m.body.includes('id="moon-country-variant"'));
    check('prehydrated cities grid data present', m.body.includes('id="country-cities-data"'));
    check('in-country city search box present (#country-city-filter)', m.body.includes('id="country-city-filter"'));
    // Hero cleanup: the ENTIRE hero actions block (search + geo/prayer CTA + pick + badges) is removed.
    // NB the inlined CSS rule ".loc-hero-search-wrap{…}" legitimately remains (unused style), so assert
    // the ELEMENTS are gone, not the bare class string.
    check('NO top hero search box (#search-input + <label> removed)', !m.body.includes('id="search-input"') && !/<label[^>]*loc-hero-search-wrap/.test(m.body));
    check('NO hero actions block (geo/pick CTA elements removed)', !/<div[^>]*\bloc-hero-hero-actions\b/.test(m.body) && !m.body.includes('id="loc-hero-geo-btn"') && !m.body.includes('id="loc-hero-pick-btn"'));
    check('NO prayer-times CTA text in moon content ("عرض مواقيت الصلاة في موقعي")', !m.body.includes('عرض مواقيت الصلاة في موقعي'));
    // Compact + contained layout: marker class on <main> drives the hero min-height override + the
    // centered content column (CSS in the template's inline <style>; visual width/height verified in
    // the browser during the ticket — SSR can only confirm the marker + the scoped CSS are present).
    check('layout marker on <main> ("main-content moon-country-layout")', m.body.includes('main-content moon-country-layout'));
    check('scoped layout CSS present (.moon-country-layout #location-hero min-height:auto)', /\.moon-country-layout\s+#location-hero\s*\{\s*min-height:\s*auto/.test(m.body));
    // Computed moon summary card (today phase + illumination + next full/new).
    check('moon summary card ("ملخص القمر في" + .mc-summary)', m.body.includes('ملخص القمر في') && /class="mc-summary"/.test(m.body));
    check('summary labels (today phase + illumination + next full/new)', m.body.includes('مرحلة القمر اليوم') && m.body.includes('نسبة الإضاءة') && m.body.includes('البدر القادم') && m.body.includes('المحاق القادم'));
    // Cities-grid heading (moon).
    check('cities-grid heading ("قمر اليوم في مدن" + .mc-cities-heading)', m.body.includes('قمر اليوم في مدن') && /class="mc-cities-heading"/.test(m.body));
    // Upcoming major phases (4 events).
    check('upcoming phases ("أهم مراحل القمر القادمة" + first/last quarter)', m.body.includes('أهم مراحل القمر القادمة') && m.body.includes('التربيع الأول القادم') && m.body.includes('التربيع الأخير القادم'));
    // MOON-CITY-HUB-ROUTE-STRUCTURE-ADD-1: monthly-by-city links now point to the NESTED city
    //   hub /moon/{country}/{city} (the legacy /moon-in-{city} 301s there), NOT the old form.
    check('monthly-by-city links → nested /moon/saudi-arabia/{city} (not legacy /moon-in-)', m.body.includes('تقويم القمر الشهري في مدن') && /href="\/moon\/saudi-arabia\/[a-z-]+"/.test(m.body) && !/href="\/moon-in-[a-z-]+"/.test(m.body));
    // 3 educational sections.
    check('educational sections (calc + crescent + city-diff)', m.body.includes('كيف تُحسب مراحل القمر') && m.body.includes('رؤية الهلال وبداية الشهر الهجري') && m.body.includes('لماذا قد يختلف تاريخ البدر'));
    // 8 SSR-visible FAQ + matching FAQPage JSON-LD.
    check('8 SSR FAQ items (.country-faq-item)', (m.body.match(/class="country-faq-item"/g) || []).length === 8, String((m.body.match(/class="country-faq-item"/g) || []).length));
    check('FAQ string updated ("هل المحاق يعني بداية الشهر الهجري")', m.body.includes('هل المحاق يعني بداية الشهر الهجري'));
    check('FAQ has external-API question ("هل يعتمد الموقع على API خارجي")', m.body.includes('هل يعتمد الموقع على API خارجي'));
    check('FAQPage JSON-LD present', /"@type":\s*"FAQPage"/.test(m.body));
    // Breadcrumb = Home > "حالة القمر" (Moon Phase, → /moon) > Country, DOM + JSON-LD identical.
    check('breadcrumb DOM: "حالة القمر" → /moon (NOT "القمر")', /id="cbc-country"/.test(m.body) && /<a class="bc-link" href="\/moon">حالة القمر<\/a>/.test(m.body));
    check('breadcrumb JSON-LD label = "حالة القمر" (matches DOM)', m.body.includes('"name":"حالة القمر"'));
    check('NOT footer-only (substantial body)', m.body.length > 60000, m.body.length + ' bytes');

    // ── B) /en/moon/{country} localized + hreflang ──
    console.log('\n── B) /en/moon/saudi-arabia (EN) ──');
    const en = await req('/en/moon/saudi-arabia');
    check('/en/moon/saudi-arabia → 200', en.status === 200, String(en.status));
    check('EN H1 = "Moon Phases in Saudi Arabia"', /Moon Phases in/.test(heroH1(en.body)), heroH1(en.body).slice(0, 40));
    check('EN canonical = SITE/en/moon/saudi-arabia', canonOf(en.body) === SITE + '/en/moon/saudi-arabia', canonOf(en.body));
    check('hreflang ar → SITE/moon/saudi-arabia', en.body.includes(`${SITE}/moon/saudi-arabia"`));
    check('hreflang en → SITE/en/moon/saudi-arabia', en.body.includes(`${SITE}/en/moon/saudi-arabia"`));
    check('EN breadcrumb DOM "Moon Phase" → /en/moon', /<a class="bc-link" href="\/en\/moon">Moon Phase<\/a>/.test(en.body));
    check('EN breadcrumb JSON-LD "Moon Phase" → /en/moon (matches DOM)', /"name":"Moon Phase","item":"[^"]*\/en\/moon"/.test(en.body));
    check('EN no prayer CTA / no hero search', !en.body.includes('id="search-input"') && !en.body.includes('id="loc-hero-geo-btn"'));
    check('EN summary + 8 FAQ + monthly nested /en/moon/saudi-arabia/{city} links', en.body.includes('Moon Summary in') && (en.body.match(/class="country-faq-item"/g) || []).length === 8 && /href="\/en\/moon\/saudi-arabia\/[a-z-]+"/.test(en.body));

    // ── C) nested city hub now LIVE 200 (MOON-CITY-HUB-ROUTE-STRUCTURE-ADD-1); the nested today/year/
    //        month/day are now LIVE 200 too — only the DASH forms + deeper-than-today stay clean 404 ──
    console.log('\n── C) /moon/{country}/{city} = 200 hub · dash forms + deeper-than-today = clean 404 ──');
    check('/moon/saudi-arabia/riyadh: 200 (nested city hub now LIVE)', (await req('/moon/saudi-arabia/riyadh')).status === 200);
    for (const u of ['/moon/saudi-arabia/riyadh/today/test', '/moon/saudi-arabia/riyadh/2026-06', '/moon/saudi-arabia/riyadh/2026-06-17']) {
        const r = await req(u);
        check(`${u}: 404 (not 200/empty)`, r.status === 404, String(r.status));
    }
    // unknown country / no cities → 404 (no thin page)
    check('/moon/zzz-not-a-country → 404', (await req('/moon/zzz-not-a-country')).status === 404);

    // ── D) prayer country page UNCHANGED (no moon variant leak) ──
    console.log('\n── D) prayer country page regression ──');
    const pp = await req('/prayer-times-in-saudi-arabia');
    check('/prayer-times-in-saudi-arabia → 200', pp.status === 200, String(pp.status));
    check('NO moon variant flag on prayer page', !pp.body.includes('id="moon-country-variant"'));
    check('prayer SEO content intact ("مواقيت الصلاة في مدن")', pp.body.includes('مواقيت الصلاة في مدن'));
    check('prayer page has NO moon SEO content', !pp.body.includes('كيف تُحسب مراحل القمر'));
    check('prayer page STILL has top hero search box (#search-input + <label>)', pp.body.includes('id="search-input"') && /<label[^>]*loc-hero-search-wrap/.test(pp.body));
    check('prayer page STILL has hero actions block + geo CTA (#loc-hero-geo-btn)', pp.body.includes('id="loc-hero-geo-btn"') && /<div[^>]*\bloc-hero-hero-actions\b/.test(pp.body));
    check('prayer page STILL has country-city filter', pp.body.includes('id="country-city-filter"'));
    check('prayer page has NO moon summary / upcoming / mc-* sections', !pp.body.includes('class="mc-summary"') && !pp.body.includes('أهم مراحل القمر القادمة'));
    // NB: the .moon-country-layout CSS rule lives in the shared template <style> (inert without the
    // marker), so check the marker is not APPLIED to <main>, not the bare class string.
    check('prayer page <main> has NO moon-country-layout marker (layout unchanged)', !pp.body.includes('main-content moon-country-layout'));

    // ── E) /moon + /moon-today + Meeus unchanged ──
    console.log('\n── E) /moon hub + /moon-today + Meeus unchanged ──');
    check('/moon → 200', (await req('/moon')).status === 200);
    { const r = await req('/moon-today'); check('/moon-today → 301 /moon', r.status === 301 && r.loc === '/moon', `${r.status} ${r.loc}`); }
    { // MLRC: legacy grid now 301s — validate Meeus via nested DAY pages (same engine, same output).
      const r15 = await req('/moon/saudi-arabia/riyadh/2026/06/15'), r30 = await req('/moon/saudi-arabia/riyadh/2026/06/30');
      check('Meeus Riyadh 15=المحاق · 30=البدر (nested day pages)', r15.status === 200 && r15.body.includes('المحاق') && r30.status === 200 && r30.body.includes('البدر')); }

    // ── F) sitemap: /moon/{country} present, /moon-today absent, no nested future routes ──
    console.log('\n── F) sitemap ──');
    const sm = (await req('/sitemap-main.xml')).body;
    check('sitemap has SITE/moon/saudi-arabia (+ /en)', sm.includes(`<loc>${SITE}/moon/saudi-arabia</loc>`) && sm.includes(`<loc>${SITE}/en/moon/saudi-arabia</loc>`));
    check('sitemap still has /moon hub', sm.includes(`<loc>${SITE}/moon</loc>`));
    check('sitemap: bare /moon-today ABSENT', !/\/moon-today<\/loc>/.test(sm));
    check('sitemap: NO nested /moon/{country}/{city}', !/\/moon\/[a-z-]+\/[a-z-]+<\/loc>/.test(sm));

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ unexpected', e && e.message); exitCode = 1;
} finally { s.kill('SIGKILL'); }
process.exit(exitCode);
