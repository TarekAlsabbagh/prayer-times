// MOON-FRIENDLY-LINKS-HREF-HASH-CONTROLS-TO-BUTTONS-1 — verification (self-contained).
//
// Kills the remaining href="#" on MOON pages (SEOptimer "Friendly Links"). Classification showed the
// leftovers are NAV placeholders app.js fills on hydration (drift-prone today/Hijri or client-only
// geolocation/last-city state) — NOT controls. Server-side fix in serveHtmlWithSeo, gated on moon pages:
//   • STRIP href="#" (→ hrefless <a>) for: related-4, tdc-edu-3/4, moon-date-prev/today/next,
//     lsb-go-btn, moon-hub-smart-pill, loc-hero-smart-pill, sticky-next-bar(hub). app.js fills them.
//   • SSR-FILL real nested href for the deterministic-safe: tdc-edu-1 (hub), tdc-edu-2 (cur month),
//     moon-edu-readmore (hub). [related-1/2/3/5/6 + sticky(city) already filled by the prior ticket.]
//   • Cookie control: footer "cookie settings" href="#" → {lang}/privacy (inline onclick still opens
//     the modal for JS users). The ONLY remaining href="#" is the bc-month breadcrumb rung, which is
//     HIDDEN on hub/today and is the marker the server's legacy month/day breadcrumb renderer matches
//     to inject the real month href (stripping it would break BreadcrumbList DOM≡JSON-LD parity).
//
// Server-side only → no app.js / index.html / css / cache-buster. No javascript:void(0), no legacy,
// no redirect-target hrefs, no /en/en. Scope: moon pages only.
//
// MOON-DAY-PAGES-REMOVAL-1: today/day pages (410) dropped from pages[]; §B/§C/§D re-pointed to the city hub
//   (#moon-date-nav + #moon-today-city-edu left index.html with the today page → asserted absent); related-1 is
//   never /today (absent on the hub, → hub on the month page). The v=805 pin (§G) is a pre-existing RED, untouched.
//
// Run: node scripts/_smoke_moon_friendly_links_href_hash_controls_to_buttons_1.mjs
import http from 'node:http';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (label, ok, extra) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); };

const PORT = 8288;
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
const hashTags = (h) => (h.match(/<a\b[^>]*href="#"[^>]*>/g) || []);
const clsOf = (t) => { const m = t.match(/class="([^"]*)"/); const i = t.match(/id="([^"]*)"/); return (m ? m[1] : '') + (i ? (' #' + i[1]) : ''); };
const anchorWith = (h, needle) => { const idx = h.indexOf(needle); if (idx < 0) return null; const st = h.lastIndexOf('<a', idx); const en = h.indexOf('>', idx); return (st >= 0 && en >= 0) ? h.slice(st, en + 1) : null; };
const hrefIn = (tag) => { if (!tag) return '(absent)'; const m = tag.match(/href="([^"]*)"/); return m ? m[1] : '(no-href)'; };
const renderedLegacy = (h) => (h.match(/href="[^"]*moon-today-in-/g) || []).length;
const doublePrefix = (h) => (h.match(/href="\/(en|fr|tr|ur|de|id|es|bn|ms)\/\1\//g) || []).length;
const jsVoid = (h) => (h.match(/href="javascript:/gi) || []).length;

const SRV = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const IDX = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

(async () => {
    const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
    try {
        if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

        const CITY = '/moon/saudi-arabia/riyadh';
        const pages = [
            ['/moon (global hub)', '/moon', 0],
            ['/moon/saudi-arabia (country)', '/moon/saudi-arabia', 0],
            ['city hub', CITY, 1],            // 1 = hidden bc-month placeholder
            ['EN city hub', '/en' + CITY, 1],
            ['month', CITY + '/2026/06', 0],
            ['year', CITY + '/2026', 0],
        ];

        // ── A) ZERO href="#" on EVERY moon page (no exception left) ──
        console.log('── A) ZERO href="#" on every moon page ──');
        for (const [name, p] of pages) {
            const h = (await req(p)).body;
            const tags = hashTags(h);
            check(`${name}: 0 href="#"`, tags.length === 0, tags.map(clsOf).join(', ') || '0');
        }

        // ── B) bc-month → real nested current-month href on hub/today (was the last href="#") ──
        console.log('\n── B) bc-month resolved → real nested current-month href on the hub ──');
        for (const [nm, pth, lp] of [['hub', CITY, ''], ['EN hub', '/en' + CITY, '/en']]) {
            const h = (await req(pth)).body;
            const bm = anchorWith(h, 'id="bc-month"');
            const re = new RegExp('^' + lp.replace(/\//g, '\\/') + '\\/moon\\/saudi-arabia\\/riyadh\\/\\d{4}\\/\\d{2}$');
            check(`${nm}: bc-month → ${lp}/moon/saudi-arabia/riyadh/{YYYY}/{MM} (real, not "#")`, !!bm && re.test(hrefIn(bm)), hrefIn(bm));
        }
        // month: bc-month is NOT touched here (renderer-managed) — never href="#"
        for (const pth of [CITY + '/2026/06']) {
            const h = (await req(pth)).body;
            const bm = anchorWith(h, 'id="bc-month"');
            check(`${pth}: bc-month is renderer-managed (never href="#")`, !bm || hrefIn(bm) !== '#', bm ? hrefIn(bm) : '(absent: current rung)');
        }

        // ── C) the drift/dynamic NAV placeholders are STRIPPED (hrefless, NOT href="#") ──
        console.log('\n── C) drift/dynamic nav placeholders stripped to hrefless ──');
        // MOON-DAY-PAGES-REMOVAL-1: these were read off the (removed) today page → read off the city hub.
        const cityHub = (await req(CITY)).body;
        for (const cls of ['moon-hub-related-4']) {
            const tag = anchorWith(cityHub, cls);
            check(`hub: .${cls} exists & is hrefless (stripped, app.js fills)`, !!tag && !/href=/.test(tag), tag ? tag.replace(/\s+/g, ' ') : '(absent)');
        }
        for (const id of ['lsb-go-btn', 'moon-hub-smart-pill']) {
            const tag = anchorWith(cityHub, 'id="' + id + '"');
            check(`hub: #${id} exists & is hrefless (stripped)`, !!tag && !/href="#"/.test(tag) && !/href=/.test(tag), tag ? tag.replace(/\s+/g, ' ') : '(absent)');
        }
        // the date nav (#moon-date-prev/next) and the today-city edu block (tdc-edu-1..4) lived on the today page only
        for (const needle of ['id="moon-date-prev"', 'id="moon-date-next"', 'id="moon-date-nav"', 'moon-tdc-edu-link-']) {
            check(`hub: ${needle} absent (removed with the today page)`, cityHub.indexOf(needle) === -1);
        }

        // ── D) the deterministic-safe nav links are SSR-FILLED with real nested hrefs ──
        console.log('\n── D) deterministic-safe nav links SSR-filled (real nested href) ──');
        // MOON-DAY-PAGES-REMOVAL-1: moon-edu-readmore was SSR-filled on the today/day pages only (the hub strips that
        //   block — measured on BASE: absent on the hub and the month page). Those pages are 410 now, so the check is
        //   inverted to "the hub carries no readmore link to a removed page" (absent, or the hub itself).
        { const rm = hrefIn(anchorWith(cityHub, 'moon-edu-readmore'));
          check('hub: moon-edu-readmore absent or → city hub (never a removed page)', !anchorWith(cityHub, 'moon-edu-readmore') || rm === '/moon/saudi-arabia/riyadh', rm); }
        check('hub: sticky-next-bar → time-left (city)', hrefIn(anchorWith(cityHub, 'sticky-next-bar')) === '/time-left-until-next-prayer-in-riyadh', hrefIn(anchorWith(cityHub, 'sticky-next-bar')));
        // MOON-DAY-PAGES-REMOVAL-1 (inverted): related-1 never → /today. On the hub its <li> is removed in SSR;
        //   on the month page it points at the hub.
        check('hub: related-1 absent (its <li> removed in SSR — no /today, no self-link)', !/class="[^"]*\bmoon-hub-related-1\b/.test(cityHub), hrefIn(anchorWith(cityHub, 'moon-hub-related-1')));
        const monthPg = (await req(CITY + '/2026/06')).body;
        check('month: related-1 → city hub (never /today)', hrefIn(anchorWith(monthPg, 'moon-hub-related-1')) === '/moon/saudi-arabia/riyadh', hrefIn(anchorWith(monthPg, 'moon-hub-related-1')));

        // ── E) cookie control → real /privacy href (onclick modal preserved); lang-prefixed ──
        console.log('\n── E) footer cookie-settings → real /privacy href (onclick preserved) ──');
        for (const [name, p, lp] of [['AR', CITY, ''], ['EN', '/en' + CITY, '/en']]) {
            const h = (await req(p)).body;
            const ck = (h.match(/<a[^>]*onclick="[^"]*openCookieSettings[^"]*"[^>]*>/) || [])[0] || '';
            check(`${name}: cookie href = ${lp}/privacy`, hrefIn(ck) === lp + '/privacy', hrefIn(ck));
            check(`${name}: cookie onclick (openCookieSettings) preserved`, /openCookieSettings/.test(ck) && /preventDefault/.test(ck));
        }

        // ── F) no legacy/redirect/void/double-prefix rendered links on any moon page ──
        console.log('\n── F) clean links (0 legacy / 0 javascript: / 0 /en/en) ──');
        for (const [name, p] of pages.map(x => [x[0], x[1]])) {
            const h = (await req(p)).body;
            check(`${name}: 0 legacy + 0 javascript: + 0 /en/en rendered`, renderedLegacy(h) === 0 && jsVoid(h) === 0 && doublePrefix(h) === 0, `legacy=${renderedLegacy(h)} void=${jsVoid(h)} dbl=${doublePrefix(h)}`);
        }

        // ── G) source guards: server-side only, no app.js/index/css/cache-buster ──
        console.log('\n── G) source guards (server-only, no cache-buster) ──');
        check('server.js: MOON-FRIENDLY-LINKS-HREF-HASH-CONTROLS-TO-BUTTONS-1 block present', /MOON-FRIENDLY-LINKS-HREF-HASH-CONTROLS-TO-BUTTONS-1/.test(SRV));
        check('server.js: _flhStrip helper + moon-page gate present', /const _flhStrip = \(needle\)/.test(SRV) && /_isAnyMoonPage/.test(SRV));
        check('server.js: bc-month is NOT stripped (breadcrumb marker preserved)', !/_flhStrip\('id="bc-month"'\)/.test(SRV));
        check('server.js: cookie → /privacy rewrite present', /openCookieSettings[^/]*\/privacy"|\/privacy"\$1/.test(SRV) || /'href="' \+ _lpFor \+ '\/privacy"\$1'/.test(SRV));
        check('index.html: app.js?v=805 preserved (NO cache-buster)', /app\.js\?v=805\b/.test(IDX));
        check('index.html: cookie link still href="#" in template (rewrite is server-side only)', /onclick="[^"]*openCookieSettings[^"]*"/.test(IDX) && /href="#"[^>]*openCookieSettings|openCookieSettings[\s\S]{0,40}/.test(IDX));

        console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} passed, ${fail} failed`);
        s.kill('SIGKILL');
        process.exit(fail === 0 ? 0 : 1);
    } catch (e) {
        console.error('✗ smoke error:', e && e.message);
        try { s.kill('SIGKILL'); } catch (_) {}
        process.exit(1);
    }
})();
