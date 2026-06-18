// MOON-CITY-HUB-ROUTE-STRUCTURE-ADD-1 — dedicated smoke for the nested city moon hub.
//
// Pins the Phase-4 contract: /[lang/]moon/{country}/{city} is the canonical structural
// alias for the legacy city moon hub /moon-in-{city} — SAME content, 4-level breadcrumb
// (Home › Moon Phase › {Country} › {City}) with DOM ≡ BreadcrumbList JSON-LD, self
// canonical + 10-lang hreflang, page-moon active (not footer-only), single H1, the
// __PRAYER_CITY__ seed, the 301 old→new (+langs), mismatch→301, validation 404s, and
// the legacy today/month/date routes left UNTOUCHED (200, not migrated).
//
// Run: node scripts/_smoke_moon_city_hub_route_structure_add_1.mjs
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (label, ok, extra) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); };

const PORT = 8231;
function req(p) {
    return new Promise((resolve) => {
        const r = http.request({ host: 'localhost', port: PORT, path: p, method: 'GET', headers: { 'Accept-Encoding': 'identity' } }, res => {
            // Whole body as one UTF-8 stream (multibyte-safe).
            const chunks = []; res.on('data', c => chunks.push(c));
            res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8'), loc: res.headers.location || '' }));
        });
        r.on('error', () => resolve({ status: 0, body: '', loc: '' }));
        r.end();
    });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitReady(ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const r = await req('/health'); if (r.status === 200) return true; await sleep(400); } return false; }

const pageMoonActive = (b) => /class="page active" id="page-moon"/.test(b);
const canonOf = (b) => (b.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
const h1Count = (b) => (b.match(/<h1\b/g) || []).length;
const attrOf = (b, id, attr) => { const m = b.match(new RegExp('id="' + id + '"[^>]*' + attr + '="([^"]*)"')); return m ? m[1] : null; };
const textOfId = (b, id) => { const m = b.match(new RegExp('id="' + id + '"[^>]*>([^<]*)<')); return m ? m[1].trim() : null; };
// Visible DOM breadcrumb rungs (in order), scoped to the .moon-breadcrumb nav so we never
// pick up a stray href="/" elsewhere on the page. Hidden rungs (bc-month/bc-date) are empty
// → filtered out. On the nested hub this yields [Home, Moon Phase, Country, City].
function domCrumbs(b) {
    const nav = (b.match(/<nav class="moon-breadcrumb"[\s\S]*?<\/nav>/) || [''])[0];
    const out = [];
    const re = /(?:<a[^>]*class="bc-link[^"]*"[^>]*>|<span[^>]*class="bc-link bc-moon"[^>]*>)([^<]*)</g;
    let m;
    while ((m = re.exec(nav)) !== null) { const t = m[1].trim(); if (t) out.push(t); }
    return out;
}
// Anchor on the BreadcrumbList object, then grab its itemListElement array up to the
// first `]` (ListItem objects contain no `]`, so this isolates the breadcrumb array
// without bleeding into any other JSON-LD on the page). [\s\S] tolerates newlines.
function _bcArr(b) {
    const i = b.indexOf('"@type":"BreadcrumbList"');
    if (i < 0) return null;
    const m = b.slice(i).match(/"itemListElement":\[([\s\S]*?)\]/);
    return m ? m[1] : null;
}
function jsonldCrumbNames(b) {
    const arr = _bcArr(b);
    if (arr == null) return null;
    return (arr.match(/"name":"([^"]*)"/g) || []).map(s => s.replace(/^"name":"/, '').replace(/"$/, ''));
}
function jsonldCrumbItems(b) {
    const arr = _bcArr(b);
    if (arr == null) return null;
    return (arr.match(/"item":"([^"]*)"/g) || []).map(s => s.replace(/^"item":"/, '').replace(/"$/, ''));
}

let exitCode = 1;
let SITE = `http://localhost:${PORT}`;
const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
try {
    if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }
    SITE = (canonOf((await req('/moon/saudi-arabia/riyadh')).body).match(/^(https?:\/\/[^/]+)/) || [])[1] || SITE;

    // ── A) nested hub = 200, page-moon, 1 H1, self canonical, not footer-only (multi-country) ──
    console.log('── A) nested city hub = 200 + page-moon + 1 H1 + self canonical (multi-country) ──');
    const NESTED = ['/moon/saudi-arabia/riyadh', '/en/moon/saudi-arabia/riyadh', '/moon/united-states/new-york', '/fr/moon/saudi-arabia/jeddah'];
    for (const u of NESTED) {
        const r = await req(u);
        check(`${u}: 200 + page-moon + 1 H1 + self canonical + body>60KB`,
            r.status === 200 && pageMoonActive(r.body) && h1Count(r.body) === 1 && canonOf(r.body) === SITE + u && r.body.length > 60000,
            `status=${r.status} pm=${pageMoonActive(r.body)} h1=${h1Count(r.body)} canon=${canonOf(r.body)} len=${r.body.length}`);
    }

    // ── B) 4-level breadcrumb DOM ≡ BreadcrumbList JSON-LD (AR + EN) ──
    console.log('\n── B) breadcrumb DOM ≡ JSON-LD (Home › Moon Phase › Country › City) ──');
    for (const [u, hub, country, city] of [
        ['/moon/saudi-arabia/riyadh', 'حالة القمر', 'المملكة العربية السعودية', 'الرياض'],
        ['/en/moon/saudi-arabia/riyadh', 'Moon Phase', 'Saudi Arabia', 'Riyadh'],
    ]) {
        const b = (await req(u)).body;
        const dom = domCrumbs(b);
        const names = jsonldCrumbNames(b);
        const items = jsonldCrumbItems(b);
        const lp = u.startsWith('/en') ? '/en' : '';
        // Home crumb item is lang-specific: AR root = SITE/, EN home = SITE/en/.
        const expectItems = [SITE + (lp ? lp + '/' : '/'), SITE + lp + '/moon', SITE + lp + '/moon/saudi-arabia', SITE + u];
        check(`${u}: DOM breadcrumb ≡ JSON-LD names (both 4 rungs, identical)`, dom.length === 4 && JSON.stringify(dom) === JSON.stringify(names), `dom=${JSON.stringify(dom)} jsonld=${JSON.stringify(names)}`);
        check(`${u}: rungs 2-4 = [${hub}, ${country}, ${city}]`, !!names && names.slice(1).join('|') === [hub, country, city].join('|'), JSON.stringify(names));
        check(`${u}: JSON-LD items == [/, ${lp}/moon, ${lp}/moon/saudi-arabia, self]`, JSON.stringify(items) === JSON.stringify(expectItems), JSON.stringify(items));
        check(`${u}: hub href=${lp}/moon · country href=${lp}/moon/saudi-arabia · city current(no href)`,
            attrOf(b, 'bc-moon-hub', 'href') === lp + '/moon' && attrOf(b, 'bc-moon-country', 'href') === lp + '/moon/saudi-arabia' && !/id="bc-moon"[^>]*href=/.test(b),
            `hub=${attrOf(b, 'bc-moon-hub', 'href')} country=${attrOf(b, 'bc-moon-country', 'href')}`);
    }

    // ── C) canonical self + hreflang (10 langs + x-default) ──
    console.log('\n── C) canonical self + hreflang (10 langs + x-default) ──');
    {
        const b = (await req('/moon/saudi-arabia/riyadh')).body;
        const hreflangs = (b.match(/hreflang="([a-z-]+)"/g) || []).map(s => s.replace(/hreflang="|"/g, ''));
        const set = new Set(hreflangs);
        const tenLangs = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'].every(l => set.has(l));
        check('canonical self = SITE/moon/saudi-arabia/riyadh', canonOf(b) === SITE + '/moon/saudi-arabia/riyadh', canonOf(b));
        check('hreflang: 10 langs + x-default present', tenLangs && set.has('x-default'), [...set].join(','));
        check('hreflang en points to /en/moon/saudi-arabia/riyadh', b.includes(`hreflang="en" href="${SITE}/en/moon/saudi-arabia/riyadh"`) || b.includes(`href="${SITE}/en/moon/saudi-arabia/riyadh" hreflang="en"`));
        check('indexable (no noindex)', !/<meta name="robots"[^>]*noindex/i.test(b));
        check('__PRAYER_CITY__ seed present with localized name (الرياض)', /window\.__PRAYER_CITY__=\{[^<]*"slug":"riyadh"[^<]*"name":"الرياض"/.test(b));
    }

    // ── D) 301 old→new (+langs) · mismatch→301 · validation 404 ──
    console.log('\n── D) 301 legacy→nested (+langs) · mismatch→301 · validation 404 ──');
    for (const [from, to] of [
        ['/moon-in-riyadh', '/moon/saudi-arabia/riyadh'],
        ['/en/moon-in-riyadh', '/en/moon/saudi-arabia/riyadh'],
        ['/ur/moon-in-jeddah', '/ur/moon/saudi-arabia/jeddah'],
        ['/moon-in-new-york', '/moon/united-states/new-york'],
    ]) {
        const r = await req(from);
        check(`${from} → 301 ${to}`, r.status === 301 && r.loc === to, `status=${r.status} loc=${r.loc}`);
    }
    {
        const r = await req('/moon/united-states/riyadh');
        check('/moon/united-states/riyadh → 301 /moon/saudi-arabia/riyadh (city in wrong country)', r.status === 301 && r.loc === '/moon/saudi-arabia/riyadh', `status=${r.status} loc=${r.loc}`);
    }
    for (const u of ['/moon/saudi-arabia/notacity', '/moon/zzz-not-a-country/riyadh', '/moon/saudi-arabia/riyadh/today', '/moon/saudi-arabia/riyadh/2026-06', '/moon/saudi-arabia/riyadh/2026-06-17', '/en/moon/saudi-arabia/riyadh/2026-06-17']) {
        const r = await req(u);
        check(`${u} → 404 (not a served route)`, r.status === 404 && !pageMoonActive(r.body), `status=${r.status} pm=${pageMoonActive(r.body)}`);
    }

    // ── E) legacy routes UNTOUCHED (not migrated this phase) ──
    console.log('\n── E) legacy routes untouched (today / month / date 200 · /moon · /moon/{country}) ──');
    for (const u of ['/moon-today-in-riyadh', '/moon-in-riyadh/2026-06', '/moon-in-riyadh/2026-06-17']) {
        const r = await req(u);
        check(`${u}: still 200 + page-moon + self canonical`, r.status === 200 && pageMoonActive(r.body) && canonOf(r.body).endsWith(u), `status=${r.status} pm=${pageMoonActive(r.body)} canon=${canonOf(r.body)}`);
    }
    check('/moon still 200 (global hub)', (await req('/moon')).status === 200);
    check('/moon/saudi-arabia still 200 (country page)', (await req('/moon/saudi-arabia')).status === 200);

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ unexpected', e && e.message); exitCode = 1;
} finally { s.kill('SIGKILL'); }
process.exit(exitCode);
