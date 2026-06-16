// IN-PAGE-SIDENAV-CONSISTENCY-ON-STATIC-AND-COUNTRY-PAGES-1 — verification (self-contained).
//
// The in-page side navigation (#sidebar) now comes from ONE shared source
// (_renderSidebar in server.js), injected at cache-load into the
// <!--SHARED-SIDEBAR--> placeholder of index.html + the 3 static templates
// (legal.html / prayer-times-cities.html / countries.html). All pages therefore
// render the SAME SVG-icon sidebar that the homepage uses — the legal/country
// pages no longer show the OLD emoji sidebar. The homepage keeps its SPA variant
// (data-page + active); the static pages use plain <a href> (no SPA interception,
// no forced active) + a mini-sprite. The top Header navbar, routing, SEO, H1 and
// page content are untouched.
//
// Run: node scripts/_smoke_in_page_sidenav_consistency_on_static_and_country_pages_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
function check(label, ok, extra) { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); }

console.log('═══ IN-PAGE-SIDENAV-CONSISTENCY-ON-STATIC-AND-COUNTRY-PAGES-1 ═══');

const PORT = 8213;
function get(p) {
    return new Promise((resolve) => {
        const r = http.request({ host: 'localhost', port: PORT, path: p, method: 'GET', headers: { 'Accept-Encoding': 'identity' } }, res => {
            let b = ''; res.on('data', c => b += c); res.on('end', () => resolve({ status: res.statusCode, body: b }));
        });
        r.on('error', () => resolve({ status: 0, body: '' }));
        r.end();
    });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitReady(ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const r = await get('/health'); if (r.status === 200) return true; await sleep(400); } return false; }

function aside(html) { const i = html.indexOf('id="sidebar"'); if (i < 0) return ''; const s = html.lastIndexOf('<aside', i); const e = html.indexOf('</aside>', i); return e < 0 ? '' : html.slice(s, e + 8); }
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u;

const SPA = [{ p: '/', label: 'home' }];
const STATIC = [
    { p: '/about-us', label: 'about (legal)' },
    { p: '/contact', label: 'contact (legal)' },
    { p: '/privacy', label: 'privacy (legal)' },
    { p: '/terms', label: 'terms (legal)' },
    { p: '/prayer-times-in-saudi-arabia', label: 'country SA' },
    { p: '/prayer-times-in-egypt', label: 'country EG' },
    { p: '/prayer-times-in-morocco', label: 'country MA' },
    { p: '/prayer-times-worldwide', label: 'countries' },
];

let exitCode = 1;
const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
try {
    if (!await waitReady(20000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

    // ── 1) Homepage (SPA variant) — the reference, unchanged ──
    console.log('\n-- homepage (SPA variant): SVG sidebar + data-page + active ──');
    {
        const html = (await get('/')).body;
        const a = aside(html);
        const svg = (a.match(/<use href="#i-/g) || []).length;
        const links = [...a.matchAll(/<a href="([^"]*)"([^>]*)>/g)];
        const dataPage = (a.match(/data-page=/g) || []).length;
        const active = (a.match(/class="active"/g) || []).length;
        check('home: 12 SVG icons in sidebar', svg === 12, 'svg=' + svg);
        check('home: 9 nav links', links.length === 9, 'links=' + links.length);
        check('home: SPA data-page on all 9 links', dataPage === 9, 'data-page=' + dataPage);
        check('home: exactly 1 active item (prayer-times "/")', active === 1 && /<a href="\/"[^>]*class="active"/.test(a), 'active=' + active);
        check('home: NO emoji in sidebar', !EMOJI.test(a));
        check('home: logo uses SVG (not emoji)', /sidebar-logo[^>]*>[\s]*<svg[^>]*><use href="#i-mosque"/.test(a));
        check('home: full sprite present', html.includes('id="zk-svg-sprite"'));
        check('home: top Header navbar present', html.includes('class="top-header"') || html.includes('top-header'));
    }

    // ── 2) Static + country pages — now the SAME SVG sidebar (no emoji), static variant ──
    for (const { p, label } of STATIC) {
        console.log(`-- ${label} (${p}) --`);
        const html = (await get(p)).body;
        const a = aside(html);
        const svg = (a.match(/<use href="#i-/g) || []).length;
        const links = (a.match(/<a href="/g) || []).length;
        const dataPage = (a.match(/data-page=/g) || []).length;
        const active = (a.match(/class="active"/g) || []).length;
        const h1 = (html.match(/<h1\b/g) || []).length;
        check(`${label}: sidebar present`, !!a);
        check(`${label}: 12 SVG icons (matches homepage)`, svg === 12, 'svg=' + svg);
        check(`${label}: 9 nav links`, links === 9, 'links=' + links);
        check(`${label}: NO emoji in sidebar`, !EMOJI.test(a));
        check(`${label}: logo uses SVG (not emoji)`, /sidebar-logo[^>]*>[\s]*<svg[^>]*><use href="#i-mosque"/.test(a));
        check(`${label}: static variant (no data-page, no forced active)`, dataPage === 0 && active === 0, `dp=${dataPage} act=${active}`);
        check(`${label}: mini-sprite injected`, html.includes('id="sidenav-svg-sprite"'));
        check(`${label}: H1 unchanged (=1)`, h1 === 1, 'h1=' + h1);
        check(`${label}: top Header navbar present (untouched)`, html.includes('top-header'));
    }

    // ── 3) EN lang-prefix still applied to the shared sidebar ──
    console.log('\n-- EN lang-prefix on the shared sidebar --');
    for (const p of ['/en/privacy', '/en/prayer-times-in-egypt']) {
        const a = aside((await get(p)).body);
        const first = (a.match(/<a href="([^"]*)"/) || [])[1] || '';
        const qibla = /<a href="\/en\/qibla"/.test(a);
        check(`${p}: sidebar links lang-prefixed (/en/...)`, first === '/en' && qibla, 'first=' + first);
        check(`${p}: still NO emoji`, !EMOJI.test(a));
    }

    // ── 4) No residual OLD emoji sidebar anywhere in the served static templates ──
    console.log('\n-- residual old-emoji-sidebar guard --');
    for (const p of ['/about-us', '/prayer-times-in-saudi-arabia', '/prayer-times-worldwide']) {
        const a = aside((await get(p)).body);
        check(`${p}: no emoji nav-icon span (old style gone)`, !/<span class="nav-icon">[^<]/.test(a));
        check(`${p}: no emoji-prefixed group label (old style gone)`, !/nav-group-label"[^>]*>\s*[\u{1F300}-\u{1FAFF}]/u.test(a));
    }

    console.log(`\n═══ ${pass} passed, ${fail} failed ═══`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ smoke crashed:', e && e.message);
} finally {
    s.kill('SIGKILL');
}
process.exit(exitCode);
