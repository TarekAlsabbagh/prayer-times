// ADSENSE-CMP-REGIONAL-BANNER-SUPPRESSION-1 — verification.
//
// Rule under test:
//   inside  EEA/UK/CH (per _CONSENT_EU_REGIONS, signalled by CF-IPCountry)
//           -> the custom consent banner is NOT shipped
//           -> the "cookie settings" control REMAINS, and reopens Google's own consent UI
//              via googlefc.callbackQueue + showRevocationMessage (never a privacy-only link)
//   outside -> byte-identical to today, including footer-cookie.js and window.openCookieSettings
//   missing / malformed / unknown signal -> FAIL SAFE: keep everything
//
// Covers BOTH serving paths: serveHtmlWithSeo (index, guides, legal, prayer-times-cities) and
// serveCountriesPage (/prayer-times-worldwide), which writes its own response.
//
// Two traps this suite exists to catch, both found by measuring rather than assuming:
//   * prayer-times-cities.html and countries.html have NO shared footer, so they never carried the
//     cookie-settings control. Asserting it there would assert something that was never true.
//   * On MOON routes an earlier SSR pass already rewrote that anchor to {lang}/privacy while
//     keeping its onclick, so a "#"-only match would skip moon pages and leave a dead control.
//
//   node scripts/_smoke_adsense_cmp_regional_banner_suppression_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (l, ok, extra) => { ok ? pass++ : fail++; console.log((ok ? '✓ ' : '✗ ') + l + (extra ? '   ->  ' + extra : '')); };

function get(port, p, country) {
    const headers = {};
    if (country !== undefined && country !== null) headers['CF-IPCountry'] = country;
    return new Promise(r => {
        const q = http.request({ host: '127.0.0.1', port, path: p, method: 'GET', headers }, s => {
            const c = []; s.on('data', x => c.push(x));
            s.on('end', () => r({ status: s.statusCode, headers: s.headers, body: Buffer.concat(c).toString('utf8') }));
        });
        q.on('error', e => r({ status: 0, headers: {}, body: '', err: String(e.code || e) }));
        q.end();
    });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function ready(port) { for (let i = 0; i < 150; i++) { if ((await get(port, '/health')).status === 200) return true; await sleep(400); } return false; }
function boot(port, env) {
    return spawn(process.execPath, ['server.js'], {
        cwd: ROOT,
        env: { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', SUPABASE_URL: '', SITE_URL: 'https://timesprayers.com', ...env },
        stdio: ['ignore', 'ignore', 'ignore']
    });
}

const hasBannerScript = b => /<script\b[^>]*footer-cookie\.js/.test(b);
const hasCustomOpener = b => b.includes('openCookieSettings');
const hasSettingsControl = b => /data-i18n="footer\.cookie_settings"/.test(b);
const wiredToGoogleCmp = b => b.includes('onclick="return tpCmpSettings(event)"');
const helperShipped = b => b.includes('function tpCmpSettings(e)');
const usesRevocationApi = b => b.includes('googlefc.callbackQueue') && b.includes('showRevocationMessage');
const consentBlock = b => { const m = b.match(/gtag\('consent','default',\{[\s\S]{0,700}?\}\);/g); return m ? m.join('||') : null; };

// [route, langPrefix, hasControl, label]
const ROUTES = [
    ['/',                             '',     true,  'index.html            via serveHtmlWithSeo'],
    ['/en',                           '/en',  true,  'index.html      (en)  via serveHtmlWithSeo'],
    ['/guides',                       '',     true,  'guides.html           via serveHtmlWithSeo'],
    ['/privacy',                      '',     true,  'legal.html            via serveHtmlWithSeo'],
    ['/moon',                         '',     true,  'moon route (anchor pre-rewritten by SSR)'],
    ['/en/moon',                      '/en',  true,  'moon route (en, pre-rewritten)'],
    ['/prayer-times-in-saudi-arabia', '',     false, 'prayer-times-cities.html (no shared footer)'],
    ['/prayer-times-worldwide',       '',     false, 'countries.html    via serveCountriesPage'],
    ['/fr/prayer-times-worldwide',    '/fr',  false, 'countries.html (fr) via serveCountriesPage'],
];

console.log('=== ADSENSE-CMP-REGIONAL-BANNER-SUPPRESSION-1 ===\n');
let exitCode = 1;
try {

const PORT = 8501, srv = boot(PORT, { TP_SSR_CACHE: '' });
try {
    if (!await ready(PORT)) throw new Error('server not ready');

    // ---- A. inside the regulated region --------------------------------------------------
    console.log('-- A. inside EEA/UK/CH (DE / GB / CH) --');
    for (const [route, pp, hasControl, label] of ROUTES) {
        const de = await get(PORT, route, 'DE');
        const base = await get(PORT, route, undefined);
        check('A1 ' + label.padEnd(44) + ' 200', de.status === 200, 'got ' + de.status);
        check('A2 ' + route.padEnd(30) + ' banner script NOT shipped', !hasBannerScript(de.body));
        check('A3 ' + route.padEnd(30) + ' no custom openCookieSettings', !hasCustomOpener(de.body));
        if (hasControl) {
            check('A4 ' + route.padEnd(30) + ' cookie-settings control STILL present', hasSettingsControl(de.body));
            check('A5 ' + route.padEnd(30) + ' wired to the Google CMP handler', wiredToGoogleCmp(de.body));
            check('A6 ' + route.padEnd(30) + ' revocation helper shipped', helperShipped(de.body) && usesRevocationApi(de.body));
            check('A7 ' + route.padEnd(30) + ' NOT privacy-only (an onclick exists)',
                wiredToGoogleCmp(de.body) && !/<a href="[^"]*\/privacy" data-i18n="footer\.cookie_settings"/.test(de.body));
            check('A8 ' + route.padEnd(30) + ' href kept as a real no-JS fallback',
                new RegExp('<a href="' + pp + '/privacy" onclick="return tpCmpSettings').test(de.body));
            check('A9 ' + route.padEnd(30) + ' (baseline really had the control)', hasCustomOpener(base.body));
        } else {
            check('A4 ' + route.padEnd(30) + ' template never had the control', !hasCustomOpener(base.body));
            check('A5 ' + route.padEnd(30) + ' helper NOT shipped where unused', !helperShipped(de.body));
            const delta = base.body.length - de.body.length;
            check('A6 ' + route.padEnd(30) + ' only the script tag removed (delta ' + delta + ' B)', delta > 20 && delta < 120, String(delta));
        }
    }
    for (const cc of ['GB', 'CH']) {
        const r = await get(PORT, '/', cc);
        check('A10 ' + cc + ' behaves exactly like DE',
            !hasBannerScript(r.body) && wiredToGoogleCmp(r.body) && helperShipped(r.body));
    }
    {
        const r = await get(PORT, '/', 'DE');
        check('A11 Vary advertises CF-IPCountry', String(r.headers['vary'] || '').includes('CF-IPCountry'), r.headers['vary']);
        check('A12 helper is defensive (no unguarded throw path)',
            r.body.includes('catch(_){w.location.href=h;}') && r.body.includes('return false;'));
    }

    // ---- B. outside the region: unchanged -------------------------------------------------
    console.log('\n-- B. outside the region (SA / US) --');
    for (const [route, , hasControl] of ROUTES) {
        const base = await get(PORT, route, undefined);
        for (const cc of ['SA', 'US']) {
            const out = await get(PORT, route, cc);
            check('B1 ' + (cc + ' ' + route).padEnd(33) + ' identical to baseline', base.body.length === out.body.length);
            check('B2 ' + (cc + ' ' + route).padEnd(33) + ' banner script shipped', hasBannerScript(out.body));
            if (hasControl) {
                check('B3 ' + (cc + ' ' + route).padEnd(33) + ' custom opener intact', hasCustomOpener(out.body));
                check('B4 ' + (cc + ' ' + route).padEnd(33) + ' NO Google-CMP handler injected', !wiredToGoogleCmp(out.body) && !helperShipped(out.body));
            }
        }
    }

    // ---- C. FAIL-SAFE ---------------------------------------------------------------------
    console.log('\n-- C. fail-safe --');
    for (const [label, cc, suppress] of [
        ['no header at all', undefined, false], ['XX (unknown)', 'XX', false], ['T1 (Tor)', 'T1', false],
        ['empty string', '', false], ['whitespace only', '   ', false], ['single letter D', 'D', false],
        ['three letters DEU', 'DEU', false], ['punctuation D!', 'D!', false],
        ['US', 'US', false], ['SA', 'SA', false],
        ['DE', 'DE', true], ['GB', 'GB', true], ['CH', 'CH', true], ['lowercase de', 'de', true], ['padded  FR ', ' FR ', true],
    ]) {
        const r = await get(PORT, '/', cc);
        const suppressed = !hasBannerScript(r.body);
        check('C1 ' + label.padEnd(22) + (suppress ? ' -> suppressed' : ' -> everything KEPT'), suppressed === suppress);
        if (!suppress) check('C2 ' + label.padEnd(22) + ' custom opener kept', hasCustomOpener(r.body));
    }

    // ---- E / F. Consent Mode + ads ---------------------------------------------------------
    console.log('\n-- E/F. Consent Mode and ads --');
    {
        const de = await get(PORT, '/', 'DE'), sa = await get(PORT, '/', 'SA');
        check('E1 Consent Mode block identical in both regions', consentBlock(de.body) !== null && consentBlock(de.body) === consentBlock(sa.body));
        check('E2 region-scoped denied defaults present', de.body.includes("'wait_for_update':500"));
        check('F1 AdSense tag present in both', de.body.includes('adsbygoogle.js?client=ca-pub-') && sa.body.includes('adsbygoogle.js?client=ca-pub-'));
        check('F2 zero ad slots', !de.body.includes('<ins class="adsbygoogle"') && !sa.body.includes('<ins class="adsbygoogle"'));
        check('F3 zero adsbygoogle.push', !de.body.includes('adsbygoogle.push') && !sa.body.includes('adsbygoogle.push'));
        check('F4 canonical intact in both', de.body.includes('rel="canonical"') && sa.body.includes('rel="canonical"'));
        const city = await get(PORT, '/prayer-times-in-riyadh', 'DE');
        check('F5 city page renders inside the region', city.status === 200 && city.body.includes('rel="canonical"'));
        check('F6 automatic geolocation untouched (app.js shipped)', city.body.includes('js/app.js'));
    }
} finally { srv.kill('SIGKILL'); }
await sleep(700);

// ---- D. cache isolation -------------------------------------------------------------------
console.log('\n-- D. SSR cache ON: no cross-region leak --');
const PORT2 = 8502, srv2 = boot(PORT2, { TP_SSR_CACHE: '1' });
try {
    if (!await ready(PORT2)) throw new Error('cache server not ready');
    const de1 = await get(PORT2, '/', 'DE');
    const sa1 = await get(PORT2, '/', 'SA');
    const de2 = await get(PORT2, '/', 'DE');
    const sa2 = await get(PORT2, '/', 'SA');
    check('D1 DE has no banner and IS wired to the CMP', !hasBannerScript(de1.body) && wiredToGoogleCmp(de1.body));
    check('D2 SA kept the banner (no EEA copy leaked)', hasBannerScript(sa1.body) && !wiredToGoogleCmp(sa1.body));
    check('D3 repeat DE still stripped + wired', !hasBannerScript(de2.body) && wiredToGoogleCmp(de2.body));
    check('D4 repeat SA still untouched', hasBannerScript(sa2.body) && hasCustomOpener(sa2.body));
    check('D5 the two regions produced different documents', de1.body.length !== sa1.body.length);
    const gb = await get(PORT2, '/qibla', 'GB'), us = await get(PORT2, '/qibla', 'US');
    check('D6 another cached family isolates too', !hasBannerScript(gb.body) && hasBannerScript(us.body));
} finally { srv2.kill('SIGKILL'); }

exitCode = fail === 0 ? 0 : 1;
} catch (e) { console.error('\n✗ aborted: ' + (e && e.message || e)); exitCode = 1; }
console.log('\n=== ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(exitCode);
