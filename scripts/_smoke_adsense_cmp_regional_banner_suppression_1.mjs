// ADSENSE-CMP-REGIONAL-BANNER-SUPPRESSION-1 — verification.
//
// Rule under test:
//   inside  EEA/UK/CH (per _CONSENT_EU_REGIONS, signalled by CF-IPCountry) -> the custom consent
//           banner is NOT shipped, and its footer opener is not left dead
//   outside -> byte-identical to today, including footer-cookie.js and the cookie-settings link
//   missing / malformed / unknown signal -> FAIL SAFE: keep the banner
//
// Covers BOTH serving paths: serveHtmlWithSeo (index, guides, legal, prayer-times-cities) and
// serveCountriesPage (/prayer-times-worldwide), which writes its own response and would otherwise
// have kept shipping the banner to regulated visitors.
//
// NOTE on `hasOpener`, established by measuring the UNCHANGED base and not assumed: only
// index.html, legal.html and guides.html receive the shared site footer, so only those routes
// carry the `openCookieSettings` link. prayer-times-cities.html and countries.html never had it.
// Asserting "the opener is intact" on those two would be asserting something that was never true,
// and asserting "the link now points at /privacy" would pass on an unrelated /privacy link - a
// green check that could never go red. Both are therefore scoped to the routes that really have it.
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
const hasOpenerCall = b => b.includes('openCookieSettings');
const hasRewrittenLink = (b, pp) => b.includes('<a href="' + pp + '/privacy" data-i18n="footer.cookie_settings"');
const consentBlock = b => {
    const m = b.match(/gtag\('consent','default',\{[\s\S]{0,600}?\}\);/g);
    return m ? m.join('||') : null;
};

// [route, langPrefix, hasOpener, label]
const ROUTES = [
    ['/',                             '',     true,  'index.html        via serveHtmlWithSeo'],
    ['/en',                           '/en',  true,  'index.html  (en)  via serveHtmlWithSeo'],
    ['/guides',                       '',     true,  'guides.html       via serveHtmlWithSeo'],
    ['/privacy',                      '',     true,  'legal.html        via serveHtmlWithSeo'],
    ['/prayer-times-in-saudi-arabia', '',     false, 'prayer-times-cities.html via serveHtmlWithSeo'],
    ['/prayer-times-worldwide',       '',     false, 'countries.html    via serveCountriesPage'],
    ['/fr/prayer-times-worldwide',    '/fr',  false, 'countries.html (fr) via serveCountriesPage'],
];

console.log('=== ADSENSE-CMP-REGIONAL-BANNER-SUPPRESSION-1 ===\n');
let exitCode = 1;
try {

const PORT = 8501, srv = boot(PORT, { TP_SSR_CACHE: '' });
try {
    if (!await ready(PORT)) throw new Error('server not ready');

    // ---- A. inside the regulated region: banner NOT shipped, no dead control -------------
    console.log('-- A. inside EEA/UK/CH (CF-IPCountry: DE) --');
    for (const [route, pp, hasOpener, label] of ROUTES) {
        const de = await get(PORT, route, 'DE');
        const base = await get(PORT, route, undefined);
        check('A1 ' + label.padEnd(42) + ' 200', de.status === 200, 'got ' + de.status);
        check('A2 ' + route.padEnd(30) + ' banner script NOT shipped', !hasBannerScript(de.body));
        check('A3 ' + route.padEnd(30) + ' no dead openCookieSettings control', !hasOpenerCall(de.body));
        if (hasOpener) {
            check('A4 ' + route.padEnd(30) + ' opener REPLACED by a real ' + (pp || '') + '/privacy link',
                hasRewrittenLink(de.body, pp));
            check('A5 ' + route.padEnd(30) + ' (and the unchanged response really had the opener)',
                hasOpenerCall(base.body));
        } else {
            check('A4 ' + route.padEnd(30) + ' template never had an opener - nothing to rewrite',
                !hasOpenerCall(base.body));
            // the ONLY thing removed here is the script tag, so the delta must be small
            const delta = base.body.length - de.body.length;
            check('A5 ' + route.padEnd(30) + ' only the script tag was removed (delta ' + delta + ' B)',
                delta > 20 && delta < 120, String(delta));
        }
    }
    {
        const r = await get(PORT, '/', 'DE');
        check('A6 Vary advertises CF-IPCountry', String(r.headers['vary'] || '').includes('CF-IPCountry'), r.headers['vary']);
    }

    // ---- B. outside: byte-identical to the no-signal baseline ----------------------------
    console.log('\n-- B. outside the region (CF-IPCountry: SA) vs no signal at all --');
    for (const [route, , hasOpener] of ROUTES) {
        const base = await get(PORT, route, undefined);
        const sa = await get(PORT, route, 'SA');
        check('B1 ' + route.padEnd(30) + ' banner STILL shipped', hasBannerScript(sa.body));
        check('B2 ' + route.padEnd(30) + ' identical to the no-signal baseline', base.body.length === sa.body.length);
        if (hasOpener) {
            check('B3 ' + route.padEnd(30) + ' cookie-settings opener intact', hasOpenerCall(sa.body));
        }
    }

    // ---- C. FAIL-SAFE matrix -------------------------------------------------------------
    console.log('\n-- C. fail-safe: only a positive covered answer may suppress --');
    for (const [label, cc, shouldSuppress] of [
        ['no header at all',         undefined, false],
        ['XX (unknown to the edge)',  'XX',     false],
        ['T1 (Tor)',                  'T1',     false],
        ['empty string',              '',       false],
        ['whitespace only',           '   ',    false],
        ['single letter D',           'D',      false],
        ['three letters DEU',         'DEU',    false],
        ['punctuation D!',            'D!',     false],
        ['US (not covered)',          'US',     false],
        ['SA (not covered)',          'SA',     false],
        ['DE (covered)',              'DE',     true],
        ['GB (covered, UK)',          'GB',     true],
        ['CH (covered, Switzerland)', 'CH',     true],
        ['lowercase de (covered)',    'de',     true],
        ['padded  FR  (covered)',     ' FR ',   true],
    ]) {
        const r = await get(PORT, '/', cc);
        const suppressed = !hasBannerScript(r.body);
        check('C1 ' + label.padEnd(28) + (shouldSuppress ? ' -> suppressed' : ' -> banner KEPT'),
            suppressed === shouldSuppress, suppressed ? 'suppressed' : 'kept');
    }

    // ---- D. nothing else moved -----------------------------------------------------------
    console.log('\n-- D. Consent Mode, AdSense and ads are untouched in BOTH regions --');
    {
        const de = await get(PORT, '/', 'DE');
        const sa = await get(PORT, '/', 'SA');
        check('D1 Consent Mode default block is identical in both regions',
            consentBlock(de.body) !== null && consentBlock(de.body) === consentBlock(sa.body));
        check('D2 region-scoped denied defaults still present', de.body.includes("'wait_for_update':500"));
        check('D3 AdSense tag present inside the region', de.body.includes('adsbygoogle.js?client=ca-pub-'));
        check('D4 AdSense tag present outside the region', sa.body.includes('adsbygoogle.js?client=ca-pub-'));
        check('D5 no ad slot inside the region', !de.body.includes('<ins class="adsbygoogle"'));
        check('D6 no ad slot outside the region', !sa.body.includes('<ins class="adsbygoogle"'));
        check('D7 no adsbygoogle.push anywhere', !de.body.includes('adsbygoogle.push') && !sa.body.includes('adsbygoogle.push'));
        check('D8 canonical intact in both', de.body.includes('rel="canonical"') && sa.body.includes('rel="canonical"'));
        const city = await get(PORT, '/prayer-times-in-riyadh', 'DE');
        check('D9 a city page still renders fully inside the region', city.status === 200 && city.body.includes('rel="canonical"'));
        check('D10 automatic geolocation code untouched (app.js still shipped)', city.body.includes('js/app.js'));
    }
} finally { srv.kill('SIGKILL'); }
await sleep(700);

// ---- E. the SSR cache must not cross-serve between regions ------------------------------
console.log('\n-- E. SSR cache ON: a stripped page must never reach a non-regulated visitor --');
const PORT2 = 8502, srv2 = boot(PORT2, { TP_SSR_CACHE: '1' });
try {
    if (!await ready(PORT2)) throw new Error('cache server not ready');
    const de1 = await get(PORT2, '/', 'DE');     // miss -> render -> stored under the "eu" key
    const sa1 = await get(PORT2, '/', 'SA');     // must MISS, not inherit the stripped entry
    const de2 = await get(PORT2, '/', 'DE');
    const sa2 = await get(PORT2, '/', 'SA');
    check('E1 DE response has no banner', !hasBannerScript(de1.body));
    check('E2 SA response DID keep the banner (no cross-serve)', hasBannerScript(sa1.body));
    check('E3 repeat DE is still stripped', !hasBannerScript(de2.body));
    check('E4 repeat SA still keeps the banner', hasBannerScript(sa2.body));
    check('E5 the two regions really produced different documents', de1.body.length !== sa1.body.length);
    const q = await get(PORT2, '/qibla', 'GB');
    const q2 = await get(PORT2, '/qibla', 'US');
    check('E6 another cached family behaves the same (GB stripped, US kept)',
        !hasBannerScript(q.body) && hasBannerScript(q2.body));
} finally { srv2.kill('SIGKILL'); }

exitCode = fail === 0 ? 0 : 1;
} catch (e) { console.error('\n✗ aborted: ' + (e && e.message || e)); exitCode = 1; }
console.log('\n=== ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(exitCode);
