// PRAYER-COUNTRY-SSR-GRID-AND-DATA-IN-BODY-FIX-1 — verification (self-contained).
//
// Applies the moon country-page perf fixes to the PRAYER country page /prayer-times-in-{country}:
//   A) SSR-render the first page (PER_PAGE=26) of REAL prayer city cards into #cities-container so the
//      cities box is full-height from first paint (kills the spinner→grid CLS); the client HYDRATES in
//      place (_hydrateSsrGridIfPresent) instead of rebuilding. Cards byte-match the client renderGrid
//      PRAYER branch: <a class="city-link" href="/prayer-times-in-{slug}"> "Prayer Times in {city}".
//   B) relocate the ~19–54KB #country-cities-data island from <head> to the BODY (before js/i18n.js) +
//      add a style.css preload → hero streams before the island (FCP/LCP).
// Scope: PRAYER country pages only (server.js-only). MOON pages stay fixed; CITY pages are deferred (C).
// Runtime (no growth; hydrate-not-rebuild; search/pagination; mobile/RTL) is browser-verified in PRE-PUSH.
//
// Run: node scripts/_smoke_prayer_country_ssr_grid_and_data_in_body_fix_1.mjs
import http from 'node:http';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (label, ok, extra) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); };

const PORT = 8291;
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
const idx = (s, n) => s.indexOf(n);
const containerSeg = (b) => { const m = b.match(/id="cities-container"[^>]*>([\s\S]*?)<div class="pagination"/); return m ? m[0] : ''; };
const cardCount = (seg) => (seg.match(/class="city-link"/g) || []).length;

const TPL = fs.readFileSync(path.join(ROOT, 'prayer-times-cities.html'), 'utf8');
const SRV = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');

(async () => {
    const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
    try {
        if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

        // ── A) SSR first-page grid in #cities-container (prayer /{country}) ──
        console.log('── A) SSR first-page prayer city grid ──');
        const sa = (await req('/prayer-times-in-saudi-arabia')).body; const saSeg = containerSeg(sa);
        check('AR /prayer-times-in-saudi-arabia #cities-container has data-ssr-grid="1"', /id="cities-container"[^>]*data-ssr-grid="1"/.test(sa));
        check('  …ships 26 real .city-link cards (PER_PAGE), NOT a spinner', cardCount(saSeg) === 26 && !/class="spinner"/.test(saSeg), String(cardCount(saSeg)));
        check('  …first card = city-link + data-slug + flat prayer href + AR label', /<a class="city-link" href="\/prayer-times-in-[a-z-]+" data-slug="[a-z-]+">مواقيت الصلاة في /.test(saSeg));
        const egEn = (await req('/en/prayer-times-in-egypt')).body; const egSeg = containerSeg(egEn);
        check('EN /en/prayer-times-in-egypt cards use EN label + /en/ href prefix', /<a class="city-link" href="\/en\/prayer-times-in-[a-z-]+" data-slug="[a-z-]+">Prayer Times in /.test(egSeg) && cardCount(egSeg) === 26);

        // ── B) count-aware (small countries: exactly their cards — no padding/gap) ──
        console.log('\n── B) count-aware first page (no gap for small countries) ──');
        const qa = (await req('/prayer-times-in-qatar')).body; const qN = cardCount(containerSeg(qa));
        check('AR /prayer-times-in-qatar ships its ACTUAL count (<26, >0), not padded, not a spinner', qN > 0 && qN < 26 && /data-ssr-grid="1"/.test(qa), String(qN));
        // NOTE: the singapore homonym flat prayer route (/prayer-times-in-singapore) is NOT a country
        //   listing (pre-existing special routing) → no #cities-container; use another small country.
        const bh = (await req('/prayer-times-in-bahrain')).body; const bN = cardCount(containerSeg(bh));
        check('AR /prayer-times-in-bahrain (smaller country) ships its ACTUAL count (<26, >0)', bN > 0 && bN < 26 && /data-ssr-grid="1"/.test(bh), String(bN));

        // ── C) data island relocated to BODY + style.css preload + hero before island ──
        console.log('\n── C) island in body + preload + hero-first (FCP/LCP) ──');
        for (const [lbl, p] of [['AR', '/prayer-times-in-saudi-arabia'], ['EN', '/en/prayer-times-in-saudi-arabia']]) {
            const b = (await req(p)).body;
            const isl = idx(b, 'id="country-cities-data"'), he = idx(b, '</head>'), hero = idx(b, 'id="loc-hero-subtitle"');
            check(`${lbl} ${p}: #country-cities-data is in BODY (after </head>)`, isl > he);
            check(`${lbl}   …style.css preload present`, /rel="preload" as="style" href="css\/style\.css/.test(b));
            check(`${lbl}   …hero (#loc-hero-subtitle) precedes the island in byte order`, hero > 0 && hero < isl);
        }

        // ── D) other langs: SSR grid + correct label/href ──
        console.log('\n── D) ur / fr also SSR-grid with correct label + prefix ──');
        const urSa = containerSeg((await req('/ur/prayer-times-in-saudi-arabia')).body);
        check('UR: /ur/prayer-times-in- href + "اوقاتِ نماز" label + data-ssr-grid', cardCount(urSa) === 26 && /href="\/ur\/prayer-times-in-[a-z-]+"/.test(urSa) && /اوقاتِ نماز/.test(urSa));
        const frEg = containerSeg((await req('/fr/prayer-times-in-egypt')).body);
        check('FR: /fr/prayer-times-in- href + "Heures de prière à" label', cardCount(frEg) === 26 && /<a class="city-link" href="\/fr\/prayer-times-in-[a-z-]+" data-slug="[a-z-]+">Heures de prière à /.test(frEg));

        // ── E) server.js source guards ──
        console.log('\n── E) server.js source guards ──');
        check('server.js _prayerCountryFirstPageGridHtml builder present', /function _prayerCountryFirstPageGridHtml\(cc, L\)/.test(SRV));
        check('server.js injects the prayer grid with data-ssr-grid', /data-ssr-grid="1">\$\{_pcGrid\}/.test(SRV));
        check('server.js relocates prayer cities-data before js/i18n.js', /html\.replace\('<script src="js\/i18n\.js', _ccTag \+ '\\n<script src="js\/i18n\.js'\)/.test(SRV));
        check('server.js injects the prayer style.css preload', /rel="preload" as="style" href="\$\{_cssP\[1\]\}"/.test(SRV));
        check('template UNCHANGED — no prayer-fix ticket marker in prayer-times-cities.html', !/PRAYER-COUNTRY-SSR-GRID-AND-DATA-IN-BODY-FIX-1/.test(TPL));

        // ── F) MOON country pages UNCHANGED (still SSR grid + island in body) ──
        console.log('\n── F) moon country pages unaffected ──');
        const mn = (await req('/moon/saudi-arabia')).body;
        check('moon /moon/saudi-arabia still SSR-grids', /id="cities-container"[^>]*data-ssr-grid="1"/.test(mn));
        check('moon island still in BODY (after </head>)', idx(mn, 'id="country-cities-data"') > idx(mn, '</head>'));

        // ── G) CITY pages UNCHANGED (scope C deferred: island still in head, no ssr-grid) ──
        console.log('\n── G) city pages unchanged (C deferred) ──');
        const cty = (await req('/prayer-times-in-riyadh')).body;
        const cIsl = idx(cty, 'id="country-cities-data"'), cHe = idx(cty, '</head>');
        check('city /prayer-times-in-riyadh: cities-data STILL in <head> (deferred)', cIsl > 0 && cIsl < cHe);
        check('city page has NO #cities-container SSR grid change', !/id="cities-container"[^>]*data-ssr-grid/.test(cty));

        s.kill('SIGKILL');
        console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
        process.exit(fail === 0 ? 0 : 1);
    } catch (e) {
        try { s.kill('SIGKILL'); } catch (_) {}
        console.error('✗ error', e && e.message); process.exit(1);
    }
})();
