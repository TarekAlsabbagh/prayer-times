// PRAYER-COUNTRY-HEADER-MATCH-MOON-COUNTRY-1 — verification (self-contained).
//
// The prayer country page /prayer-times-in-{country} must carry the SAME .top-header as the
// moon country page /moon/{country}: in-header search box stripped, "موقعي" geo button stripped,
// emoji icons swapped for the SVG sprite (#i-map-pin/#i-moon/#i-home), and a capital / last-used
// -city SUBTITLE (#page-subtitle) — all via the shared _applyCountryHeaderSiteMatch helper.
// The PRAYER page reads selected_city FIRST (global nav policy); the MOON page is frozen
// (readSelectedCity:false) so its emitted markup is byte-identical to what shipped.
//
// This smoke pins the SSR contract (capital subtitle, sprite, strips, intact in-content filter +
// breadcrumb + unchanged title/canonical), the moon-page non-regression, and the helper presence.
// The selected_city subtitle refinement (Riyadh/Jeddah/Paris) runs client-side and is verified in
// the browser during the ticket.
//
// Run: node scripts/_smoke_prayer_country_header_match_moon_1.mjs
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (label, ok, extra) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); };

const PORT = 8246;
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
const subtitleOf = (b) => { const m = b.match(/id="page-subtitle"[^>]*>([^<]*)</); return m ? m[1].trim() : ''; };
const canonOf = (b) => (b.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
const titleOf = (b) => (b.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
// the "موقعي" header button is gone iff no onclick="detectLocation()" appears BEFORE the hero
// actions block (the prayer page legitimately keeps the hero geo CTA, which is AFTER it).
function noDetectLocationInHeader(b) {
    const hero = b.indexOf('loc-hero-hero-actions');
    const det = b.indexOf('onclick="detectLocation()"');
    if (det === -1) return true;                 // none at all
    return hero !== -1 && det > hero;            // the only one(s) are in/after the hero, not the header
}

(async () => {
    // helper presence (source-level)
    const srv = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
    console.log('── helper wiring (server.js) ──');
    check('shared helper _applyCountryHeaderSiteMatch defined', /function _applyCountryHeaderSiteMatch\s*\(/.test(srv));
    check('moon block calls helper with readSelectedCity:false (frozen)', /_applyCountryHeaderSiteMatch\(html, seo\.moonCountryListing\.code, cn, L, \{ readSelectedCity: false \}\)/.test(srv));
    check('prayer block calls helper with readSelectedCity:true', /_applyCountryHeaderSiteMatch\(html, seo\.countryListing\.code, cn, L, \{ readSelectedCity: true \}\)/.test(srv));

    const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
    try {
        if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

        // ── A) PRAYER country page gets the moon header ──
        console.log('\n── A) /prayer-times-in-saudi-arabia (header site-match) ──');
        const p = await req('/prayer-times-in-saudi-arabia');
        check('200', p.status === 200, String(p.status));
        check('sprite injected (#i-map-pin + #i-moon + #i-home symbols)', /symbol id="i-map-pin"/.test(p.body) && /symbol id="i-moon"/.test(p.body) && /symbol id="i-home"/.test(p.body));
        check('emoji → SVG (use #i-map-pin present, 🏙️ gone)', p.body.includes('use href="#i-map-pin"') && !p.body.includes('🏙️'));
        check('header search box stripped (.city-search-wrapper gone)', !p.body.includes('city-search-wrapper'));
        check('header "موقعي" button stripped (no detectLocation in header)', noDetectLocationInHeader(p.body));
        check('subtitle = localized CAPITAL (الرياض) — not the country name', subtitleOf(p.body) === 'الرياض', subtitleOf(p.body));
        check('header-city refinement script present', p.body.includes('id="moon-country-header-city"'));
        check('script reads selected_city FIRST (prayer policy)', p.body.includes('getItem("selected_city")'));
        check('in-content city filter KEPT (#country-city-filter)', p.body.includes('id="country-city-filter"'));
        check('breadcrumb KEPT (#cbc-country)', p.body.includes('id="cbc-country"'));
        check('canonical UNCHANGED (= /prayer-times-in-saudi-arabia)', /\/prayer-times-in-saudi-arabia$/.test(canonOf(p.body)), canonOf(p.body));
        check('title UNCHANGED (still prayer "مواقيت الصلاة", not moon)', /مواقيت الصلاة/.test(titleOf(p.body)) && !/مراحل القمر/.test(titleOf(p.body)), titleOf(p.body).slice(0, 40));

        // ── B) capital fallback for other countries (data-driven) ──
        console.log('\n── B) capital fallback (other countries) ──');
        const eg = await req('/prayer-times-in-egypt');
        check('/prayer-times-in-egypt subtitle = القاهرة', subtitleOf(eg.body) === 'القاهرة', subtitleOf(eg.body));
        const tr = await req('/prayer-times-in-turkey');
        check('/prayer-times-in-turkey subtitle = أنقرة', subtitleOf(tr.body) === 'أنقرة', subtitleOf(tr.body));

        // ── C) MOON country page UNCHANGED (frozen) ──
        console.log('\n── C) /moon/saudi-arabia NON-REGRESSION (frozen) ──');
        const m = await req('/moon/saudi-arabia');
        check('200', m.status === 200, String(m.status));
        check('still has sprite + SVG icons', /symbol id="i-map-pin"/.test(m.body) && m.body.includes('use href="#i-map-pin"'));
        check('still has header search stripped', !m.body.includes('city-search-wrapper'));
        check('still has "موقعي" stripped (0 detectLocation — hero also removed on moon)', !m.body.includes('onclick="detectLocation()"'));
        check('still has capital subtitle (الرياض)', subtitleOf(m.body) === 'الرياض', subtitleOf(m.body));
        check('moon script does NOT read selected_city (frozen, readSelectedCity:false)', !m.body.includes('getItem("selected_city")'));
        check('title still moon ("مراحل القمر")', /مراحل القمر/.test(titleOf(m.body)), titleOf(m.body).slice(0, 40));

        s.kill('SIGKILL');
    } catch (e) { console.error(e); try { s.kill('SIGKILL'); } catch (_) {} }
    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    process.exit(fail === 0 ? 0 : 1);
})();
