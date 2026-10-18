// SEO-CITY-SUMMARY-HIDDEN-REMOVAL-1 — local regression guard (no network; outbound guard + ADSENSE off).
//   Boots BASE (a clean tree of the production commit, env TP_BASE_ROOT) and CAND (this tree) side by side and compares
//   the raw SSR HTML of the same URLs:
//   [R] the visually-hidden paragraph #city-summary-text (.city-summary-hidden-seo) is gone from every city page in
//       CAND (and BASE still had it — proves the URLs reach the rendering path).
//   [V] the visible one-line summary #city-summary-visible is still filled and #city-summary-paragraph is not hidden.
//   [E] after normalising per-request noise (CSP nonce, app.js cache-buster / build stamp) CAND == BASE minus that one
//       paragraph, byte for byte, on city pages in 10 languages — so prayer times, the displayed method
//       (#sis-calc-method), title, meta, canonical, hreflang, robots and JSON-LD are untouched; every other family
//       (home, country, qibla, moon, next-prayer, time-left, worldwide) is identical. A BASE-vs-BASE determinism
//       check runs per URL first (a minute rollover between two fetches retries once).
//   [C] the client updateCitySummaryParagraph() (extracted from js/app.js, run in a vm with a stub DOM) fills an empty
//       visible line, keeps an SSR-filled one, un-hides the section and no longer reads #city-summary-text.
//   node scripts/_smoke_seo_city_summary_hidden_removal_1.mjs   (env TP_BASE_ROOT, TP_GUARD, TP_SMOKE_PORT)
import http from 'node:http';
import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_ROOT = process.env.TP_BASE_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-shapbot';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const P0 = Number(process.env.TP_SMOKE_PORT || 8871);
const PORT = { base: P0, cand: P0 + 1 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (port, p) => new Promise((res) => {
    const r = http.get({ host: '127.0.0.1', port, path: p, headers: { 'accept-encoding': 'identity', 'user-agent': 'Mozilla/5.0 smoke' } }, (x) => {
        const c = []; x.on('data', (d) => c.push(d)); x.on('end', () => res({ st: x.statusCode, h: x.headers, b: Buffer.concat(c).toString('utf8') }));
    });
    r.on('error', () => res({ st: 0, h: {}, b: '' }));
});
let pass = 0, fail = 0;
const ok = (c, n, d) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (d ? '  :: ' + d : '')); } };
// The template comment above the paragraph is already dropped from served HTML by the final comment strip, which
//   leaves its whitespace line behind — so the served BASE block is "\r\n\r\n<ws>\r\n<ws><p …>…</p>".
const HIDDEN_RE = /\r?\n\r?\n[ \t]*(?:<!--[^\n]*-->)?\r?\n[ \t]*<p id="city-summary-text" class="city-summary-hidden-seo">[^<]*<\/p>/;
// per-request / per-checkout noise: CSP nonce, article:modified_time and any ms ISO stamp (= the render instant), the
//   banner clock (hh:mm:ss), the git build stamp
//   (&b=<sha7>, differs between the two checkouts) and the app.js cache-buster this ticket bumps.
const norm = (s) => s.replace(/nonce="[^"]*"/g, 'nonce=""')
    .replace(/("article:modified_time" content=")[^"]*/g, '$1T')
    .replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/g, 'ISO')   // Article datePublished/dateModified = render instant (moon pages)
    .replace(/(id="current-time">)\d\d:\d\d:\d\d/g, '$1HMS').replace(/(id="next-prayer-countdown">)[\d:]+/g, '$1COUNTDOWN')   // banner clock, seconds
    .replace(/((?:&amp;|&|\?)b=)[0-9a-f]{7,40}/g, '$1SHA')
    .replace(/js\/app\.js\?v=\d+/g, 'js/app.js?v=N');
const boot = (root, port) => spawn(process.execPath, ['-r', GUARD, 'server.js'], { cwd: root, stdio: 'ignore',
    env: { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: 'https://timesprayers.com', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', ADSENSE_CLIENT: 'off', TP_MOON_DAY_SHED: '0' } });
const kids = [boot(BASE_ROOT, PORT.base), boot(ROOT, PORT.cand)];
const LANGS = ['', '/en', '/fr', '/tr', '/ur', '/de', '/id', '/es', '/bn', '/ms'];
// city mix: every method key the hero uses (Makkah, MWL, ISNA, Egypt, Turkey, Karachi, KemenagJakarta, JAKIM, France,
//   Singapore, MoroccoAwqaf, Tehran) + a London-type page where the old hidden text named another method.
const CITIES = ['riyadh', 'london', 'damascus', 'cairo', 'istanbul', 'karachi', 'jakarta', 'kuala-lumpur', 'paris', 'new-york',
    'toronto', 'singapore', 'casablanca', 'tehran', 'berlin', 'sydney'];
const OTHERS = ['/', '/prayer-times-in-saudi-arabia', '/prayer-times-in-india', '/qibla-in-riyadh', '/moon/saudi-arabia/riyadh',
    '/next-prayer-in-london', '/time-left-until-next-prayer-in-cairo', '/prayer-times-worldwide', '/today-hijri-date', '/moon'];
try {
    for (const port of Object.values(PORT)) { for (let i = 0; i < 400; i++) { if ((await get(port, '/health')).st === 200) break; await sleep(300); } }
    const bytes = { base: 0, cand: 0, baseBr: 0, candBr: 0, n: 0 };
    const fetchTrio = async (p) => {
        for (let attempt = 0; attempt < 2; attempt++) {
            const b1 = await get(PORT.base, p), c = await get(PORT.cand, p), b2 = await get(PORT.base, p);
            if (norm(b1.b) === norm(b2.b)) return { b: b1, c, det: true };
            await sleep(1500);
        }
        const b1 = await get(PORT.base, p), c = await get(PORT.cand, p);
        return { b: b1, c, det: false };
    };
    console.log('-- [R][V][E] city pages: ' + CITIES.length + ' cities x ' + LANGS.length + ' langs');
    let hiddenBase = 0, hiddenCand = 0, visOk = 0, secOk = 0, eqOk = 0, detOk = 0, total = 0, st200 = 0;
    const eqFail = [], visFail = [];
    for (const city of CITIES) for (const L of LANGS) {
        const p = L + '/prayer-times-in-' + city; total++;
        const { b, c, det } = await fetchTrio(p);
        if (b.st === 200 && c.st === 200) st200++;
        if (det) detOk++;
        if (/id="city-summary-text"/.test(b.b)) hiddenBase++;
        if (/city-summary-text|city-summary-hidden-seo/.test(c.b)) hiddenCand++;
        const vm1 = c.b.match(/<p id="city-summary-visible" class="city-summary-visible">([^<]*)<\/p>/);
        if (vm1 && vm1[1].trim().length > 10) visOk++; else visFail.push(p);
        if (/class="section-card city-summary-paragraph" id="city-summary-paragraph"/.test(c.b)) secOk++;
        const baseMinus = b.b.replace(HIDDEN_RE, '');
        if (norm(baseMinus) === norm(c.b)) eqOk++; else eqFail.push(p);
        bytes.base += Buffer.byteLength(b.b); bytes.cand += Buffer.byteLength(c.b); bytes.n++;
        bytes.baseBr += zlib.brotliCompressSync(b.b, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 4 } }).length;
        bytes.candBr += zlib.brotliCompressSync(c.b, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 4 } }).length;
    }
    ok(st200 === total, 'all ' + total + ' city URLs answer 200 on BASE and CAND', st200 + '/' + total);
    ok(detOk === total, 'BASE-vs-BASE determinism held on every URL (after at most one retry)', detOk + '/' + total);
    ok(hiddenBase === total, '[R] BASE carried the hidden paragraph on every city URL (test reaches the path)', hiddenBase + '/' + total);
    ok(hiddenCand === 0, '[R] CAND carries no #city-summary-text / .city-summary-hidden-seo', hiddenCand + ' pages still have it');
    ok(visOk === total, '[V] CAND keeps the visible one-line summary filled', visFail.slice(0, 5).join(', '));
    ok(secOk === total, '[V] CAND keeps #city-summary-paragraph visible (no u-hidden)', secOk + '/' + total);
    ok(eqOk === total, '[E] CAND == BASE minus the hidden paragraph (normalised nonce + app.js stamp), byte for byte', eqFail.slice(0, 5).join(', '));
    console.log('     bytes/page raw ' + Math.round(bytes.base / bytes.n) + ' → ' + Math.round(bytes.cand / bytes.n) + ' ; brotli-4 ' + Math.round(bytes.baseBr / bytes.n) + ' → ' + Math.round(bytes.candBr / bytes.n));
    console.log('-- [E] other families unchanged');
    let oEq = 0, oTot = 0; const oFail = [];
    for (const o of OTHERS) for (const L of ['', '/en', '/ur', '/bn']) {
        const p = (L + o).replace(/\/$/, '') || '/'; oTot++;
        const { b, c } = await fetchTrio(p);
        if (b.st === c.st && norm(b.b) === norm(c.b)) oEq++; else oFail.push(p + ' ' + b.st + '/' + c.st);
    }
    ok(oEq === oTot, 'home / country / qibla / moon / next-prayer / time-left / worldwide / hijri identical (' + oTot + ' URLs)', oFail.slice(0, 5).join(', '));
    console.log('-- [C] client updateCitySummaryParagraph');
    const app = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
    const s0 = app.indexOf('function updateCitySummaryParagraph(');
    const endM = /\r?\n\}\r?\n/.exec(app.slice(s0));
    const fnSrc = app.slice(s0, s0 + endM.index + endM[0].length);
    ok(s0 > 0 && !/city-summary-text/.test(fnSrc), 'the client function no longer reads #city-summary-text');
    const mk = (visText, withSec = true) => {
        const cls = new Set(['section-card', 'city-summary-paragraph', 'u-hidden']);
        const els = { 'city-summary-paragraph': withSec ? { classList: { remove: (c) => cls.delete(c), contains: (c) => cls.has(c) } } : null,
            'city-summary-visible': { textContent: visText } };
        const ctx = { document: { getElementById: (id) => els[id] || null }, _isCityPagePhase2: () => true, getCurrentLang: () => 'en' };
        vm.createContext(ctx); vm.runInContext(fnSrc + '\nthis.f = updateCitySummaryParagraph;', ctx);
        return { ctx, els, cls };
    };
    { const t = mk(''); t.ctx.f('London', 'United Kingdom', 'Muslim World League', 'Europe/London');
      ok(/London/.test(t.els['city-summary-visible'].textContent) && !t.cls.has('u-hidden'), 'empty visible line is filled and the section un-hidden', t.els['city-summary-visible'].textContent); }
    { const t = mk('SSR line already here'); t.ctx.f('London', 'United Kingdom', 'MWL', 'UTC');
      ok(t.els['city-summary-visible'].textContent === 'SSR line already here' && !t.cls.has('u-hidden'), 'an SSR-filled visible line is kept, section un-hidden'); }
    { let threw = false; try { const t = mk('', false); t.ctx.f('X', 'Y', 'Z', 'UTC'); } catch (_) { threw = true; }
      ok(!threw, 'no section on the page → returns quietly'); }
} finally {
    for (const k of kids) { try { k.kill(); } catch (_) { /* gone */ } }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
