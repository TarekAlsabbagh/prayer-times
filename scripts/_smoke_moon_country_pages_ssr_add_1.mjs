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
    check('monthly-by-city links → nested /moon/saudi-arabia/{city} (not legacy /moon-in-)', m.body.includes('تقويم القمر الشهري في أبرز مدن') && /href="\/moon\/saudi-arabia\/[a-z-]+"/.test(m.body) && !/href="\/moon-in-[a-z-]+"/.test(m.body));
    // educational sections — MOON-COUNTRY-PAGE-SEO-CONTENT-PERFORMANCE-TUNE-1 expanded 3→6 (new titles asserted in §G).
    check('educational sections (calc + astronomical-vs-sighting + city-diff)', m.body.includes('كيف تُحسب مراحل القمر') && m.body.includes('الفرق بين الطور الفلكي ورؤية الهلال') && m.body.includes('لماذا قد يختلف تاريخ البدر'));
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

    // ── G) MOON-COUNTRY-PAGE-SEO-CONTENT-PERFORMANCE-TUNE-1: adaptive title 50–60 + expanded 10-lang content ──
    console.log('\n── G) SEO/content tune: adaptive title + expanded 10-lang content ──');
    const cpLen = (t) => [...t.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&[a-z]+;/g, '?')].length;
    {
        // adaptive title: Saudi Arabia (a long country name that previously fell to a bare ~39-char base)
        //   must now land in the 50–60 code-point band across languages.
        for (const [lang, pfx] of [['ar', ''], ['en', '/en'], ['ur', '/ur'], ['de', '/de'], ['id', '/id']]) {
            const n = cpLen(titleOf((await req(`${pfx}/moon/saudi-arabia`)).body));
            check(`title ${lang} /moon/saudi-arabia in 50–60 cp (adaptive)`, n >= 50 && n <= 60, `${n} cp`);
        }
        const ar = (await req('/moon/saudi-arabia')).body;
        // heading hierarchy: 1 H1; H2 expanded (summary+cities+upcoming+monthly+6 educational+faq ⇒ ≥11); 8 FAQ H3
        check('/moon/saudi-arabia: H1 = 1', h1Count(ar) === 1, String(h1Count(ar)));
        const h2n = (ar.match(/<h2\b/g) || []).length, h3n = (ar.match(/<h3\b/g) || []).length;
        check('/moon/saudi-arabia: H2 expanded (≥11 sections, was 8)', h2n >= 11, `${h2n} h2`);
        check('/moon/saudi-arabia: H3 = 8 (FAQ questions only)', h3n === 8, `${h3n} h3`);
        // the 3 NEW educational sections (AR) are present (more content, no stuffing)
        check('AR new section "how phases differ between cities"', ar.includes('كيف تختلف مراحل القمر بين مدن'));
        check('AR new section "why choose your city"', ar.includes('لماذا تختار مدينتك'));
        check('AR new section "how to use the city links + calendar"', ar.includes('كيف تستخدم روابط المدن'));
        // FAQ accordion still intact (first open) + matching FAQPage JSON-LD (unchanged behaviour)
        check('AR FAQ accordion: moon-country-faq + exactly the first item open', /class="country-faq-list moon-country-faq"/.test(ar) && (ar.match(/<details class="country-faq-item" open>/g) || []).length === 1);
        check('AR FAQPage JSON-LD present', /"@type":"FAQPage"/.test(ar));
        // 10/10 native content — the 8 non-ar/en langs must NOT fall back to English (distinct native sentinels)
        const enLeak = 'Moon phases are computed astronomically inside the site';
        const natives = {
            fr: 'phases de la Lune sont calculées astronomiquement',
            tr: 'hassas formüllerle astronomik',
            ur: 'فلکی فارمولوں سے شمار',
            de: 'Mondphasen werden astronomisch innerhalb',
            id: 'Fase bulan dihitung secara astronomis',
            es: 'fases de la Luna se calculan astronómicamente',
            bn: 'চাঁদের দশা কোনো বাহ্যিক',
            ms: 'Fasa bulan dikira secara astronomi',
        };
        for (const [lang, sent] of Object.entries(natives)) {
            const b = (await req(`/${lang}/moon/saudi-arabia`)).body;
            check(`${lang} content native (no EN fallback)`, b.includes(sent) && !b.includes(enLeak), b.includes(enLeak) ? 'EN LEAK!' : 'native');
        }
    }

    // ── H) MOON-COUNTRY-CAPITAL-MOON-LINKS-SECTION-1: capital quick-links + date picker ──
    console.log('\n── H) capital quick-links section (data-driven capital) ──');
    {
        const capTitle = (b) => (b.match(/id="mc-cap-title"[^>]*>([^<]*)</) || [])[1] || '';
        const ar = (await req('/moon/saudi-arabia')).body;
        check('mc-capital section + H2 ("استكشف القمر في الرياض")', /class="country-seo-block mc-capital"/.test(ar) && ar.includes('استكشف القمر في الرياض'));
        // exactly 3 SSR <a> link cards, all on the capital riyadh (today / year / month)
        const capLinks = [...ar.matchAll(/<a class="mc-cap-card" href="([^"]+)"/g)].map(m => m[1]);
        check('3 SSR capital link cards on /moon/saudi-arabia/riyadh', capLinks.length === 3 && capLinks.every(h => h.startsWith('/moon/saudi-arabia/riyadh/')), capLinks.join(' '));
        check('capital today/year/month link shapes', /\/riyadh\/today$/.test(capLinks[0]) && /\/riyadh\/\d{4}$/.test(capLinks[1]) && /\/riyadh\/\d{4}\/\d{2}$/.test(capLinks[2]));
        for (const l of capLinks) check(`capital link 200: ${l}`, (await req(l)).status === 200);
        check('capital picker day URL 200 (/riyadh/2026/12/09)', (await req('/moon/saudi-arabia/riyadh/2026/12/09')).status === 200);
        // date picker: y/m/d selects + button disabled by default + scoped inline script with the capital base
        check('picker: y/m/d selects + disabled button + scoped script', /id="mc-cap-y"/.test(ar) && /id="mc-cap-m"/.test(ar) && /id="mc-cap-d"/.test(ar) && /id="mc-cap-go" class="mc-cap-go" disabled/.test(ar) && /b="\/moon\/saudi-arabia\/riyadh\/"/.test(ar));
        // placement: after "upcoming", before "monthly" — match the rendered <section> markers (NOT bare class
        //   strings, which also appear in the template's inline <style> in the head and would mis-order).
        const _iU = ar.indexOf('class="country-seo-block mc-upcoming"'), _iC = ar.indexOf('class="country-seo-block mc-capital"'), _iM = ar.indexOf('class="country-seo-block mc-monthly"');
        check('section order: upcoming < capital < monthly', _iU > 0 && _iC > _iU && _iM > _iC, `U=${_iU} C=${_iC} M=${_iM}`);
        // data-driven capital for OTHER countries (NOT hardcoded riyadh)
        const eg = (await req('/moon/egypt')).body, tk = (await req('/moon/turkey')).body;
        check('data-driven capital: egypt→cairo, turkey→ankara', /<a class="mc-cap-card" href="\/moon\/egypt\/cairo\//.test(eg) && /<a class="mc-cap-card" href="\/moon\/turkey\/ankara\//.test(tk));
        // 10/10 native section title (no AR/EN fallback) — distinct native sentinels in the H2
        const capNat = { fr: 'Explorez la Lune à', tr: 'Keşfedin', ur: 'چاند دریافت کریں', de: 'entdecken', id: 'Jelajahi Bulan di', es: 'Explora la Luna en', bn: 'অন্বেষণ করুন', ms: 'Terokai Bulan di' };
        for (const [lang, sent] of Object.entries(capNat)) {
            check(`capital section native ${lang}`, capTitle((await req(`/${lang}/moon/saudi-arabia`)).body).includes(sent));
        }
        // scope: NO RENDERED capital section on prayer country / city hub / year / today. Use the section's
        //   unique H2 id (id="mc-cap-title") — the prayer page shares the template so it carries the INERT
        //   .mc-capital CSS in its <style> (like the other .mc-* rules), but never renders the section.
        for (const u of ['/prayer-times-in-saudi-arabia', '/moon/saudi-arabia/riyadh', '/moon/saudi-arabia/riyadh/2026', '/moon/saudi-arabia/riyadh/today']) {
            check(`scope: no rendered capital section on ${u}`, !(await req(u)).body.includes('id="mc-cap-title"'));
        }
    }

    // ── I) MOON-COUNTRY-ISLAMIC-OCCASIONS-COUNTDOWN-1: Islamic-occasions countdown below the FAQ ──
    console.log('\n── I) Islamic-occasions countdown (below FAQ, SSR) ──');
    {
        const occTitle = (b) => (b.match(/id="mc-occasions-h2"[^>]*>([^<]*)</) || [])[1] || '';
        const ar = (await req('/moon/saudi-arabia')).body;
        check('mc-occasions section + title ("العدّ التنازليّ للمناسبات الإسلاميّة")', /id="mc-occasions"/.test(ar) && ar.includes('العدّ التنازليّ للمناسبات الإسلاميّة'));
        // exactly 4 occasion cards (ramadan/fitr/adha/newyear) → the 4 countdown pages
        for (const id of ['ramadan', 'fitr', 'adha', 'newyear']) check(`occasion card moon-event-${id}`, new RegExp(`moon-event-${id}\\b`).test(ar));
        const occHrefs = [...ar.matchAll(/<a class="moon-event-card[^"]*" href="([^"]+)"/g)].map(m => m[1]);
        check('4 occasion cards → the 4 countdown pages', occHrefs.length === 4 && occHrefs.some(h => /\/ramadan-countdown$/.test(h)) && occHrefs.some(h => /\/eid-al-fitr-countdown$/.test(h)) && occHrefs.some(h => /\/eid-al-adha-countdown$/.test(h)) && occHrefs.some(h => /\/hijri-new-year-countdown$/.test(h)), occHrefs.join(' '));
        check('occasion cards show a computed date (e.g. " … 2027")', /<div class="moon-event-date">\d{1,2} [^<]+ \d{4}<\/div>/.test(ar));
        check('occasion link target 200 (/ramadan-countdown)', (await req('/ramadan-countdown')).status === 200);
        // placement: occasions section is rendered AFTER the FAQ
        check('placement: occasions after FAQ', ar.indexOf('country-seo-faq') > 0 && ar.indexOf('id="mc-occasions"') > ar.indexOf('country-seo-faq'), `faq=${ar.indexOf('country-seo-faq')} occ=${ar.indexOf('id="mc-occasions"')}`);
        // 10/10 native section title (distinct sentinels) + lang-prefixed countdown hrefs
        const occNat = { en: 'Countdown to Islamic Events', fr: 'Compte à rebours', tr: 'Geri Sayım', ur: 'الٹی گنتی', de: 'islamischen Ereignissen', id: 'Hitung Mundur', es: 'Cuenta regresiva', bn: 'ইসলামী উৎসবের গণনা', ms: 'Kiraan Detik' };
        for (const [lang, sent] of Object.entries(occNat)) {
            const b = (await req(`/${lang}/moon/saudi-arabia`)).body;
            check(`occasions native ${lang} + /${lang}/ href`, occTitle(b).includes(sent) && new RegExp(`href="/${lang}/ramadan-countdown"`).test(b));
        }
        // scope: NO rendered occasions section off the country + year pages. The YEAR page intentionally
        //   carries it too (MOON-YEAR-ISLAMIC-OCCASIONS-COUNTDOWN-1), so it is NOT in this list; prayer /
        //   city hub / today / month must stay clean.
        for (const u of ['/prayer-times-in-saudi-arabia', '/moon/saudi-arabia/riyadh', '/moon/saudi-arabia/riyadh/today', '/moon/saudi-arabia/riyadh/2026/06']) {
            check(`scope: no occasions section on ${u}`, !(await req(u)).body.includes('id="mc-occasions"'));
        }
    }

    // ── J) MOON-COUNTRY-HEADER-UNIFY-NO-SEARCH-1: header unified with the general site header on
    //   /moon/{country} — in-header search + "موقعي" (detectLocation) geo button both removed (option ب);
    //   the prayer country page keeps both. The in-CONTENT #country-city-filter is untouched. ──
    console.log('\n── J) header unify: in-header search + "موقعي" removed (moon variant only) ──');
    {
        const mh = (await req('/moon/saudi-arabia')).body;
        const ph = (await req('/prayer-times-in-saudi-arabia')).body;
        check('moon country: in-header search REMOVED (no #city-search-input / .city-search-wrapper / #city-suggestions)', !/id="city-search-input"/.test(mh) && !/city-search-wrapper/.test(mh) && !/id="city-suggestions"/.test(mh));
        check('moon country: "موقعي" geo button REMOVED (no onclick=detectLocation button / no header.my_location)', !/onclick="detectLocation\(\)"/.test(mh) && !/data-i18n="header\.my_location"/.test(mh));
        check('moon country: header == general site header (theme + lang + home ONLY; breadcrumb KEPT)', /class="top-header"/.test(mh) && /theme-toggle-btn/.test(mh) && /lang-switcher/.test(mh) && /data-i18n="header\.home"/.test(mh) && /id="country-breadcrumb"/.test(mh));
        check('moon country: in-CONTENT city filter (#country-city-filter) KEPT', /id="country-city-filter"/.test(mh));
        check('PRAYER country page UNTOUCHED: in-header search + "موقعي" button STILL present', /id="city-search-input"/.test(ph) && /city-search-wrapper/.test(ph) && /onclick="detectLocation\(\)"/.test(ph));
        check('moon country: header ICONS unified with general header (sprite #i-map-pin/#i-moon/#i-home injected + 3 <use> refs)', /<symbol id="i-map-pin"/.test(mh) && /<symbol id="i-moon"/.test(mh) && /<symbol id="i-home"/.test(mh) && /use href="#i-map-pin"/.test(mh) && /use href="#i-moon"/.test(mh) && /use href="#i-home"/.test(mh));
        check('PRAYER country page UNTOUCHED: NO injected sprite + header NOT swapped to SVG <use> (keeps emoji)', !/<symbol id="i-map-pin"/.test(ph) && !/use href="#i-map-pin"/.test(ph));
        check('moon country: title/canonical UNCHANGED (no SEO regression)', /<title>مراحل القمر/.test(mh) && /rel="canonical" href="[^"]+\/moon\/saudi-arabia"/.test(mh));
    }

    // ── K) MOON-COUNTRY-HEADER-LOCATION-CONTEXT-MATCH-SITE-1: the header subtitle (#page-subtitle)
    //   shows a localized CITY like the general header — SSR = the country CAPITAL fallback (localized),
    //   refined client-side to the last-used city (sessionStorage last_city_context/city_moon, localized
    //   via #country-cities-data). The prayer page keeps an empty SSR subtitle + no refinement script. ──
    console.log('\n── K) header location-context: subtitle = capital fallback (SSR) + last-city client refine ──');
    {
        const mh = (await req('/moon/saudi-arabia')).body;
        const meg = (await req('/moon/egypt')).body;
        const men = (await req('/en/moon/saudi-arabia')).body;
        const ph = (await req('/prayer-times-in-saudi-arabia')).body;
        check('moon country SA(ar): #page-subtitle SSR = localized CAPITAL fallback (الرياض)', /id="page-subtitle"[^>]*>\s*الرياض\s*</.test(mh));
        check('moon country EG(ar): #page-subtitle SSR = localized CAPITAL fallback (القاهرة)', /id="page-subtitle"[^>]*>\s*القاهرة\s*</.test(meg));
        check('moon country SA(en): #page-subtitle SSR = localized CAPITAL fallback (Riyadh)', /id="page-subtitle"[^>]*>\s*Riyadh\s*</.test(men));
        check('moon country: last-used-city client refinement script injected (reads last_city_context + country-cities-data)', /id="moon-country-header-city"/.test(mh) && /last_city_context/.test(mh) && /country-cities-data/.test(mh));
        check('PRAYER country page UNTOUCHED: #page-subtitle SSR empty + NO header-city refinement script', /id="page-subtitle"[^>]*>\s*<\/div>/.test(ph) && !/id="moon-country-header-city"/.test(ph));
    }

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ unexpected', e && e.message); exitCode = 1;
} finally { s.kill('SIGKILL'); }
process.exit(exitCode);
