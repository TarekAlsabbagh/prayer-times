// MOON-SSR-FILL-FRIENDLY-PLACEHOLDER-LINKS-1 — verification (self-contained).
//
// Root: on every moon CITY page (#page-moon) index.html ships 9 deterministic-ish placeholder anchors
// as href="#"; js/app.js fills them on hydration. A no-JS crawler / SEO tool (SEOptimer "Friendly Links")
// reads the raw HTML and sees those "#" as empty links. Fix: SSR now fills the 8 DETERMINISTIC ones with
// the real NESTED url server-side (server.js, serveHtmlWithSeo, gated on seo.moonCity.slug) so first paint
// already has friendly links. app.js re-sets the SAME hrefs on hydration (idempotent → no mismatch). The
// 9th — related-card #4 ("today's Hijri date" → /hijri-date/{Y-M-D}) — is intentionally LEFT as href="#"
// in SSR because app.js derives it from the BROWSER-tz today (drift → SSR/hydration mismatch risk).
//
// app.js is NOT modified and there is NO cache-buster (server-side only). SSR==hydration parity for the
// 8 is browser-verified in the PRE-PUSH. This smoke pins the SSR output + the server.js source guard +
// the "left as #" exclusion + the no-app.js-change / no-cache-buster invariants.
//
// Run: node scripts/_smoke_moon_ssr_fill_friendly_placeholder_links_1.mjs
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
const hrefOf = (h, cls) => { const m = h.match(new RegExp('<a\\b[^>]*' + cls + '[^>]*?href="([^"]*)"')); return m ? m[1] : '(NF)'; };
const hashCount = (h) => (h.match(/href="#"/g) || []).length;
const renderedLegacy = (h) => (h.match(/href="[^"]*moon-today-in-/g) || []).length;
// the 8 deterministic placeholders we SSR-fill
const FILLED = ['moon-hub-related-1', 'moon-hub-related-2', 'moon-hub-related-3', 'moon-hub-related-5', 'moon-hub-related-6', 'moon-city-hub-edu-link-today', 'moon-city-hub-edu-link-other', 'sticky-next-bar'];

const SRV = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const IDX = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

(async () => {
    const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
    try {
        if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

        const CITY = '/moon/saudi-arabia/riyadh';
        const pages = [
            ['AR hub', CITY, ''],
            ['EN hub', '/en' + CITY, '/en'],
            ['AR today', CITY + '/today', ''],
            ['AR month', CITY + '/2026/06', ''],
            ['AR day', CITY + '/2026/06/14', ''],
        ];

        // ── A) the 8 deterministic placeholders are SSR-filled with real nested hrefs (not "#") ──
        console.log('── A) 8 deterministic placeholders filled in SSR (per page, lang-prefixed) ──');
        for (const [name, p, lp] of pages) {
            const h = (await req(p)).body;
            // none of the 8 is "#"
            const stillHash = FILLED.filter(c => hrefOf(h, c) === '#');
            check(`${name}: all 8 placeholders have a real href (none "#")`, stillHash.length === 0, stillHash.join(',') || 'all filled');
            // exact nested today + prayer/qibla/time-left with correct lang prefix
            check(`${name}: related-1/edu-today → ${lp}/moon/saudi-arabia/riyadh/today`, hrefOf(h, 'moon-hub-related-1') === lp + '/moon/saudi-arabia/riyadh/today' && hrefOf(h, 'moon-city-hub-edu-link-today') === lp + '/moon/saudi-arabia/riyadh/today', hrefOf(h, 'moon-hub-related-1'));
            check(`${name}: related-5 → ${lp}/prayer-times-in-riyadh`, hrefOf(h, 'moon-hub-related-5') === lp + '/prayer-times-in-riyadh');
            check(`${name}: related-6 → ${lp}/qibla-in-riyadh`, hrefOf(h, 'moon-hub-related-6') === lp + '/qibla-in-riyadh');
            check(`${name}: sticky → ${lp}/time-left-until-next-prayer-in-riyadh`, hrefOf(h, 'sticky-next-bar') === lp + '/time-left-until-next-prayer-in-riyadh');
            // month links: cur (related-2/edu-other) + next (related-3), valid YYYY/MM, next = month after cur
            const r2 = hrefOf(h, 'moon-hub-related-2'), r3 = hrefOf(h, 'moon-hub-related-3'), eo = hrefOf(h, 'moon-city-hub-edu-link-other');
            const reMo = new RegExp('^' + lp.replace(/\//g, '\\/') + '\\/moon\\/saudi-arabia\\/riyadh\\/(\\d{4})\\/(\\d{2})$');
            const m2 = r2.match(reMo), m3 = r3.match(reMo);
            check(`${name}: related-2/edu-other = current month (valid YYYY/MM, same)`, !!m2 && r2 === eo, r2);
            const expectNext = m2 ? (parseInt(m2[2], 10) === 12 ? `${parseInt(m2[1], 10) + 1}/01` : `${m2[1]}/${String(parseInt(m2[2], 10) + 1).padStart(2, '0')}`) : '';
            check(`${name}: related-3 = month AFTER related-2 (wraps year)`, !!m3 && `${parseInt(m3[1], 10)}/${m3[2]}` === expectNext, `${r2} → ${r3}`);
        }

        // ── B) the 9th (Hijri-date) is intentionally LEFT as "#" in SSR (no drift) ──
        console.log('\n── B) related-card #4 (Hijri date) intentionally LEFT as "#" in SSR ──');
        for (const [name, p] of pages) {
            const h = (await req(p)).body;
            check(`${name}: related-4 (hijri) still href="#" (excluded by design)`, hrefOf(h, 'moon-hub-related-4') === '#');
        }

        // ── C) no rendered legacy links; href="#" count dropped vs control-only baseline ──
        console.log('\n── C) zero rendered legacy + href="#" reduced ──');
        for (const [name, p] of pages) {
            const h = (await req(p)).body;
            check(`${name}: 0 rendered <a href> legacy /moon-today-in-`, renderedLegacy(h) === 0, String(renderedLegacy(h)));
            // hub had ~20 href="#" pre-fix; after filling 8 it must be well under that (controls + r4 only)
            check(`${name}: href="#" count reduced (≤ 14, controls + r4 only)`, hashCount(h) <= 14, String(hashCount(h)));
        }

        // ── D) scope: the global /moon hub (no city) is NOT touched by the city-gated fill ──
        console.log('\n── D) scope guard: global /moon hub (no moonCity) unaffected ──');
        const hub = (await req('/moon')).body;
        check('/moon global hub has NO moon-hub-related cards (city-only section)', hrefOf(hub, 'moon-hub-related-1') === '(NF)');

        // ── E) source guards: server.js has the fill block; app.js/index.html untouched ──
        console.log('\n── E) source guards (server-only, no cache-buster) ──');
        check('server.js: MOON-SSR-FILL-FRIENDLY-PLACEHOLDER-LINKS-1 block present', /MOON-SSR-FILL-FRIENDLY-PLACEHOLDER-LINKS-1/.test(SRV));
        check('server.js: fill gated on seo.moonCity.slug + _flSet helper present', /if \(seo\.moonCity && seo\.moonCity\.slug\)/.test(SRV) && /const _flSet = \(cls, url\)/.test(SRV));
        check('server.js: related-card #4 (hijri) is NOT in the fill list (left as #)', !/_flSet\('moon-hub-related-4'/.test(SRV));
        check('index.html: placeholders still exist as href="#" (template unchanged)', /class="moon-hub-related-card moon-hub-related-1" href="#"/.test(IDX) && /class="moon-city-hub-edu-link-today" href="#"/.test(IDX));
        check('index.html: NO cache-buster bump (app.js?v=805 preserved)', /app\.js\?v=805\b/.test(IDX));

        console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed`);
        s.kill('SIGKILL');
        process.exit(fail === 0 ? 0 : 1);
    } catch (e) {
        console.error('✗ smoke error:', e && e.message);
        try { s.kill('SIGKILL'); } catch (_) {}
        process.exit(1);
    }
})();
