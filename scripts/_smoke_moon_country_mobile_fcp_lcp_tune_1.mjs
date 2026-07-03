// MOON-COUNTRY-MOBILE-FCP-LCP-TUNE-1 — verification (self-contained).
//
// Goal: improve mobile FCP/LCP on /moon/{country} WITHOUT regressing CLS=0 / SEO / the SSR grid.
// Warm-run Lighthouse showed FCP 3.2s / LCP 3.8s (LCP element = the hero text #loc-hero-subtitle),
// gated by the render-blocking critical-CSS path + a ~49KB cities-data island that was sitting in
// <head>, pushing the hero ~49KB later in the byte stream. Two moon-variant-only, server.js-only,
// byte-identical-data changes:
//   (1) RELOCATE the <script id="country-cities-data"> from </head> to just before the first body
//       <script> (after all visible + SSR content, before its only consumers: fetchCities() at body
//       end + the moon-country-header-city sync appended at </body>). Hero streams earlier.
//   (2) PRELOAD style.css (same href, version-extracted) so the render-blocking critical stylesheet
//       fetches at highest priority from the first <head> bytes. NOT async/defer (would FOUC the hero).
// The template is UNCHANGED → prayer + city pages stay byte-identical. No cache-buster (server-only).
//
// Browser runtime (no FOUC, no console errors, search/filter works, prehydration → no /api/cities
// fetch, hero renders, RTL + LTR, mobile + desktop) is verified in the PRE-PUSH. This smoke pins the
// SSR output + the scope guards.
//
// Run: node scripts/_smoke_moon_country_mobile_fcp_lcp_tune_1.mjs
import http from 'node:http';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (label, ok, extra) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); };

const PORT = 8287;
function req(p) {
    return new Promise((resolve) => {
        const r = http.request({ host: 'localhost', port: PORT, path: p, method: 'GET', headers: { 'Accept-Encoding': 'identity' } }, res => {
            let b = ''; res.on('data', c => b += c); res.on('end', () => resolve({ status: res.statusCode, body: b }));
        });
        r.on('error', () => resolve({ status: 0, body: '' }));
        r.end();
    });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitReady(ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const r = await req('/health'); if (r.status === 200) return true; await sleep(400); } return false; }
const idx = (b, s) => b.indexOf(s);
const titleOf = (b) => (b.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
const canonOf = (b) => (b.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
const h1Of = (b) => { const m = b.match(/<h1[^>]*>([\s\S]*?)<\/h1>/); return m ? m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : ''; };
const cardsIn = (b) => { const m = b.match(/id="cities-container"[^>]*>([\s\S]*?)<div class="pagination"/); return m ? (m[0].match(/class="city-link"/g) || []).length : 0; };

const SRV = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const MOONJS = fs.readFileSync(path.join(ROOT, 'js', 'moon.js'), 'utf8');
const TPL = fs.readFileSync(path.join(ROOT, 'prayer-times-cities.html'), 'utf8');

(async () => {
    const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
    try {
        if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

        // ── A) moon /{country}: cities-data RELOCATED out of <head> into the body, before consumers ──
        console.log('── A) cities-data island relocated to body (moon /{country}) ──');
        const sa = (await req('/moon/saudi-arabia')).body;
        const he = idx(sa, '</head>'), cd = idx(sa, 'id="country-cities-data"'), i18n = idx(sa, '<script src="js/i18n.js'),
              hero = idx(sa, 'id="loc-hero-subtitle"'), fc = sa.lastIndexOf('fetchCities()');
        check('cities-data is in the BODY (after </head>)', cd > he && cd > 0, `data@${cd} head@${he}`);
        check('cities-data BEFORE first body <script> (js/i18n.js)', cd < i18n && i18n > 0, `data@${cd} i18n@${i18n}`);
        check('cities-data BEFORE the fetchCities() consumer', cd < fc, `data@${cd} fetchCities@${fc}`);
        check('hero (#loc-hero-subtitle) now streams BEFORE cities-data', hero > 0 && hero < cd, `hero@${hero} data@${cd}`);
        check('<head> no longer carries the cities-data island', sa.slice(0, he).indexOf('country-cities-data') === -1, `head=${(he / 1024).toFixed(1)}KB`);
        check('cities-data still present + parseable (byte-identical payload)', /id="country-cities-data">\[\{/.test(sa));

        // ── B) style.css preload (render-blocking, NOT async) ──
        console.log('\n── B) style.css preload (kept render-blocking) ──');
        const pl = (sa.match(/<link rel="preload" as="style" href="(css\/style\.css\?v=\d+)">/) || [])[1];
        const ss = (sa.match(/<link rel="stylesheet" href="(css\/style\.css\?v=\d+)">/) || [])[1];
        check('style.css preload present', !!pl, pl);
        check('preload href === stylesheet href (no version drift)', pl && pl === ss, `${pl} vs ${ss}`);
        check('style.css STILL a render-blocking <link rel=stylesheet> (no async/print/onload swap)',
            /<link rel="stylesheet" href="css\/style\.css\?v=\d+">/.test(sa) && !/style\.css[^>]*(?:media="print"|onload=)/.test(sa));
        check('preload sits in <head>', (sa.indexOf('rel="preload" as="style" href="css/style.css') < he));

        // ── C) SSR grid + SEO unchanged (CLS fix c3ce4d1 intact) ──
        console.log('\n── C) SSR grid + SEO intact (no regression to c3ce4d1 / SEO) ──');
        check('SSR first-page grid still 26 cards + data-ssr-grid', cardsIn(sa) === 26 && /data-ssr-grid="1"/.test(sa), String(cardsIn(sa)));
        check('moon H1 unchanged', h1Of(sa) === 'مراحل القمر في المملكة العربية السعودية', h1Of(sa));
        check('moon canonical self', /\/moon\/saudi-arabia$/.test(canonOf(sa)));
        check('moon title unchanged + indexable', /^مراحل القمر/.test(titleOf(sa)) && !/noindex/i.test(sa));
        check('FAQPage JSON-LD still in <head>', sa.slice(0, he).indexOf('"FAQPage"') !== -1);
        check('#country-city-filter still served', /id="country-city-filter"/.test(sa));

        // ── D) count-aware + EN variant carry the same treatment ──
        console.log('\n── D) small-country + EN variant ──');
        const qa = (await req('/moon/qatar')).body;
        check('Qatar count-aware (17) + data in body', cardsIn(qa) === 17 && idx(qa, 'id="country-cities-data"') > idx(qa, '</head>'), String(cardsIn(qa)));
        const en = (await req('/en/moon/egypt')).body;
        check('/en/moon/egypt: data in body + preload + 26 cards', idx(en, 'id="country-cities-data"') > idx(en, '</head>') && /preload" as="style" href="css\/style\.css/.test(en) && cardsIn(en) === 26);

        // ── E) prayer NOW ALSO relocated (PRAYER-COUNTRY-SSR-GRID-AND-DATA-IN-BODY-FIX-1); CITY still in head (C deferred) ──
        //   The moon-only scope guard was retired when the sibling ticket moved the prayer country island
        //   to the body + added the css preload. CITY pages are the deferred "C" scope → still in <head>.
        console.log('\n── E) prayer page also FCP/LCP-tuned (sibling fix); city deferred ──');
        const pr = (await req('/prayer-times-in-saudi-arabia')).body;
        check('prayer: cities-data now in BODY (after </head>)', idx(pr, 'id="country-cities-data"') > idx(pr, '</head>'));
        check('prayer: style.css preload added', /preload" as="style" href="css\/style\.css/.test(pr));
        check('prayer: no longer ships the spinner (SSR grid at first paint)', !/id="cities-container"[\s\S]{0,160}?class="spinner"/.test(pr));
        const cty = (await req('/prayer-times-in-riyadh')).body;
        check('city page UNCHANGED — cities-data still in <head> (scope C deferred)', idx(cty, 'id="country-cities-data"') > 0 && idx(cty, 'id="country-cities-data"') < idx(cty, '</head>'));

        // ── F) source guards ──
        console.log('\n── F) server.js / moon.js source guards ──');
        check('server.js relocates cities-data before js/i18n.js (moon variant)', /html\.replace\('<script src="js\/i18n\.js', _ccTagM \+ '\\n<script src="js\/i18n\.js'\)/.test(SRV));
        check('server.js keeps the in-head fallback', /html\.replace\('<\/head>', _ccTagM \+ '\\n<\/head>'\);\s*\/\/ fallback/.test(SRV));
        check('server.js injects the style.css preload (version-extracted)', /rel="preload" as="style" href="\$\{_cssM\[1\]\}"/.test(SRV));
        check('template UNCHANGED — no ticket marker in prayer-times-cities.html', !/MOON-COUNTRY-MOBILE-FCP-LCP-TUNE-1/.test(TPL));
        check('js/moon.js carries NO ticket marker (untouched)', !/MOON-COUNTRY-MOBILE-FCP-LCP-TUNE-1/.test(MOONJS));

        s.kill('SIGKILL');
    } catch (e) { console.error(e); try { s.kill('SIGKILL'); } catch (_) {} }
    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    process.exit(fail === 0 ? 0 : 1);
})();
