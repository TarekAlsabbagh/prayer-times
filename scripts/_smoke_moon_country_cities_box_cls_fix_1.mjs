// MOON-COUNTRY-CITIES-BOX-CLS-FIX-1 — verification (self-contained).
//
// CLS root cause: on /moon/{country}, #cities-container shipped only a spinner placeholder; the client
// then rendered the full 26-card grid (444px desktop / ~1955px mobile), so section.mc-cities-box grew
// and pushed everything below down → CLS 0.163 (Lighthouse's top source). Fix: SSR-render the first page
// (PER_PAGE=26) of REAL city cards into #cities-container (moon variant only) so the box is full-height
// from first paint, and the client HYDRATES those cards in place (wire clicks + pagination) instead of
// rebuilding (renderGrid reuse guard). Count-aware (small countries get exactly their cards — no gap).
//
// Runtime (no spinner→grid growth; cards reused not rebuilt; search/click/pagination work; mobile/RTL)
// is browser-verified in the PRE-PUSH. This smoke pins the SSR output + the client/server source guards
// + the scope guards (prayer page unchanged, moon.js / SEO untouched).
//
// Run: node scripts/_smoke_moon_country_cities_box_cls_fix_1.mjs
import http from 'node:http';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (label, ok, extra) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); };

const PORT = 8286;
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
const titleOf = (b) => (b.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
const canonOf = (b) => (b.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
const h1Of = (b) => { const m = b.match(/<h1[^>]*>([\s\S]*?)<\/h1>/); return m ? m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : ''; };
// the #cities-container inner segment (up to the pagination sibling)
const containerSeg = (b) => { const m = b.match(/id="cities-container"[^>]*>([\s\S]*?)<div class="pagination"/); return m ? m[0] : ''; };
const cardCount = (seg) => (seg.match(/class="city-link"/g) || []).length;

const TPL = fs.readFileSync(path.join(ROOT, 'prayer-times-cities.html'), 'utf8');
const SRV = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const MOONJS = fs.readFileSync(path.join(ROOT, 'js', 'moon.js'), 'utf8');

(async () => {
    const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
    try {
        if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

        // ── A) SSR first-page grid in #cities-container (moon country pages) ──
        console.log('── A) SSR first-page city grid (moon /{country}) ──');
        const sa = (await req('/moon/saudi-arabia')).body; const saSeg = containerSeg(sa);
        check('AR /moon/saudi-arabia #cities-container has data-ssr-grid="1"', /id="cities-container"[^>]*data-ssr-grid="1"/.test(sa));
        check('  …ships 26 real .city-link cards (PER_PAGE), NOT a spinner', cardCount(saSeg) === 26 && !/class="spinner"/.test(saSeg), String(cardCount(saSeg)));
        check('  …first card = موcity link with data-slug + nested moon href + AR label', /<a class="city-link" href="\/moon-today-in-[a-z-]+" data-slug="[a-z-]+">قمر اليوم في /.test(saSeg));
        const egEn = (await req('/en/moon/egypt')).body; const egSeg = containerSeg(egEn);
        check('EN /en/moon/egypt cards use EN label + /en/ href prefix', /<a class="city-link" href="\/en\/moon-today-in-[a-z-]+" data-slug="[a-z-]+">Moon Today in /.test(egSeg) && cardCount(egSeg) === 26);

        // ── B) count-aware (small countries: exactly their cards — no padding/gap) ──
        console.log('\n── B) count-aware first page (no gap for small countries) ──');
        const qa = (await req('/moon/qatar')).body; const qN = cardCount(containerSeg(qa));
        check('AR /moon/qatar ships its ACTUAL count (<26, >0) — not padded to 26, not a spinner', qN > 0 && qN < 26 && /data-ssr-grid="1"/.test(qa), String(qN));
        const sg = (await req('/moon/singapore')).body;
        check('AR /moon/singapore (1 city) ships exactly 1 card', cardCount(containerSeg(sg)) === 1, String(cardCount(containerSeg(sg))));

        // ── C) prayer country page UNCHANGED (spinner, no SSR grid) ──
        console.log('\n── C) prayer country page unchanged (out of scope) ──');
        const pr = (await req('/prayer-times-in-saudi-arabia')).body;
        check('/prayer-times-in-saudi-arabia #cities-container has NO data-ssr-grid', !/id="cities-container"[^>]*data-ssr-grid/.test(pr));
        check('  …still ships the spinner placeholder (client renders it)', /id="cities-container"[\s\S]{0,160}?class="spinner"/.test(pr));

        // ── D) server.js source guards (the SSR builder + injection) ──
        console.log('\n── D) server.js source guards ──');
        check('server.js _moonCountryFirstPageGridHtml builder present', /function _moonCountryFirstPageGridHtml\(cc, L\)/.test(SRV));
        check('server.js _MC_FIRST_PAGE === 26 (= template PER_PAGE)', /_MC_FIRST_PAGE\s*=\s*26/.test(SRV));
        check('server.js injects the grid into #cities-container with data-ssr-grid', /data-ssr-grid="1">\$\{_mcGrid\}/.test(SRV));

        // ── E) template source guards (hydrate-in-place, no rebuild) ──
        console.log('\n── E) template source guards (hydrate, no rebuild) ──');
        check('template _hydrateSsrGridIfPresent() present', /function _hydrateSsrGridIfPresent\(\)/.test(TPL));
        check('template _wireCityCardContext() shared click wiring present', /function _wireCityCardContext\(a, city, slug, href\)/.test(TPL));
        check('template renderGrid reuse-guard (SSR lang + page1 + unfiltered → hydrate, no rebuild)', /_curLng === _ssrGridLang && currentPage === 1[\s\S]{0,200}?_hydrateSsrGridIfPresent\(\)\) return;/.test(TPL));
        check('template hydrate is idempotent (data-wired guard — never double-bind)', /getAttribute\('data-wired'\) === '1'\) return;/.test(TPL));

        // ── F) scope: SEO (title/canonical/H1) UNCHANGED on /moon/saudi-arabia ──
        console.log('\n── F) SEO unchanged + moon.js untouched ──');
        check('moon /moon/saudi-arabia canonical self', /\/moon\/saudi-arabia$/.test(canonOf(sa)), canonOf(sa));
        check('moon /moon/saudi-arabia H1 unchanged', h1Of(sa) === 'مراحل القمر في المملكة العربية السعودية', h1Of(sa));
        check('moon /moon/saudi-arabia title present + moon-themed', /^مراحل القمر/.test(titleOf(sa)) && [...titleOf(sa)].length >= 50, String([...titleOf(sa)].length));
        check('moon /moon/saudi-arabia indexable (no noindex)', !/<meta name="robots"[^>]*noindex/i.test(sa));
        check('js/moon.js carries NO ticket marker (untouched)', !/MOON-COUNTRY-CITIES-BOX-CLS-FIX-1/.test(MOONJS));
        check('country page still serves #country-city-filter', /id="country-city-filter"/.test(sa));

        s.kill('SIGKILL');
    } catch (e) { console.error(e); try { s.kill('SIGKILL'); } catch (_) {} }
    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    process.exit(fail === 0 ? 0 : 1);
})();
