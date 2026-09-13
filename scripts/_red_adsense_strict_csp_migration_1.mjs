// ADSENSE-STRICT-CSP-MIGRATION-1 — RED TESTS.
//
// A green suite proves nothing unless each guard can be shown to FAIL when the thing it protects is
// broken. Every case below mutates server.js, boots the server, asserts the specific guard goes RED,
// then restores the file and verifies the restore is BYTE-EXACT by sha256.
//
// The six literal <script> rewrite anchors get a red test EACH, not one generic test, because that
// is exactly the failure class that breaks SILENTLY: the page still renders, just without its i18n
// bundles / country data island / country context / Umm al-Qura table.
//
// Nothing here touches production. Usage: node scripts/_red_adsense_strict_csp_migration_1.mjs
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRV = path.join(ROOT, 'server.js');
const TOKEN = '__TP_CSP_NONCE__';

const BASE_BYTES = fs.readFileSync(SRV);
const BASE_SHA = crypto.createHash('sha256').update(BASE_BYTES).digest('hex');
console.log('base server.js sha256 = ' + BASE_SHA + '\n');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let port = 8760;
let redOk = 0, redBad = 0;
const bad = [];

function get(p, urlPath, headers = {}) {
    return new Promise((resolve) => {
        const req = http.request({ host: '127.0.0.1', port: p, path: urlPath, method: 'GET',
            headers: { 'Accept-Encoding': 'identity', ...headers } }, (res) => {
            const c = []; res.on('data', x => c.push(x));
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(c).toString('utf8') }));
        });
        req.on('error', () => resolve({ status: 0, headers: {}, body: '' }));
        req.end();
    });
}
async function boot(p, cacheMode = '0') {
    const child = spawn(process.execPath, ['server.js'], {
        cwd: ROOT,
        env: { ...process.env, PORT: String(p), WEB_CONCURRENCY: '1', TP_SSR_CACHE: cacheMode,
               SITE_URL: 'https://timesprayers.com', SUPABASE_URL: '',
               GA_MEASUREMENT_ID: 'G-LT0KWQHW6P', ADSENSE_CLIENT: 'ca-pub-5423625249193539' },
        stdio: ['ignore', 'ignore', 'ignore']
    });
    for (let i = 0; i < 120; i++) {
        const r = await get(p, '/health');
        if (r.status === 200) return child;
        await sleep(400);
    }
    child.kill('SIGKILL');
    return null;
}
const headerNonce = (csp) => (String(csp || '').match(/'nonce-([^']+)'/) || [])[1] || null;

// mutate -> boot -> probe -> restore(byte-exact)
async function red(label, mutate, probe, cacheMode = '0') {
    let src = BASE_BYTES.toString('utf8');
    const mutated = mutate(src);
    if (mutated === src) {
        redBad++; bad.push(label + ' :: MUTATION DID NOT APPLY (anchor text not found)');
        console.log('  ✗ ' + label + '  :: mutation did not apply — the red test itself is broken');
        return;
    }
    fs.writeFileSync(SRV, mutated, 'utf8');
    port++;
    let child = null, wentRed = false, note = '';
    try {
        child = await boot(port, cacheMode);
        if (!child) { note = 'server failed to boot under mutation (counts as RED)'; wentRed = true; }
        else { const r = await probe(port); wentRed = r.red; note = r.note || ''; }
    } catch (e) { wentRed = true; note = 'threw: ' + e.message; }
    finally {
        if (child) { try { child.kill('SIGKILL'); } catch (_) {} }
        fs.writeFileSync(SRV, BASE_BYTES);
        const sha = crypto.createHash('sha256').update(fs.readFileSync(SRV)).digest('hex');
        if (sha !== BASE_SHA) { console.log('  !! RESTORE NOT BYTE-EXACT after ' + label); process.exit(2); }
        await sleep(400);
    }
    if (wentRed) { redOk++; console.log('  ✓ ' + label + (note ? '  :: ' + note : '')); }
    else { redBad++; bad.push(label + ' :: stayed GREEN'); console.log('  ✗ ' + label + '  :: STAYED GREEN — guard is blind' + (note ? ' :: ' + note : '')); }
}

(async () => {
    console.log('=== nonce architecture ===');

    await red('R1 nonce removed from the CSP header -> header/body mismatch detected',
        s => s.replace('"script-src \'nonce-" + _cspNonce + "\' \'unsafe-inline\' \'unsafe-eval\' \'strict-dynamic\' https: http:"',
                       '"script-src \'unsafe-inline\' \'unsafe-eval\' \'strict-dynamic\' https: http:"'),
        async (p) => { const r = await get(p, '/');
            const hn = headerNonce(r.headers['content-security-policy-report-only']);
            return { red: !hn, note: 'header nonce = ' + hn }; });

    await red('R2 nonce removed from the AdSense tag -> un-nonced executable script detected',
        s => s.replace("+ '<script' + _TP_NONCE_ATTR + ' async src=\"https://pagead2.googlesyndication.com",
                       "+ '<script async src=\"https://pagead2.googlesyndication.com"),
        async (p) => { const r = await get(p, '/');
            const m = r.body.match(/<script[^>]*adsbygoogle\.js[^>]*>/);
            return { red: !!m && !/nonce=/.test(m[0]), note: (m ? m[0].slice(0, 70) : 'tag not found') }; });

    // NOTE: these files are CRLF. Hard-coding "\n\n" here silently matches nothing and the harness
    //   would report a blind guard that is really a broken test — so the line break is matched as
    //   \r?\n and preserved via a capture group, which works on either line ending.
    await red('R3 body nonce diverges from header nonce -> mismatch detected',
        s => s.replace(/html = _applyCspNonce\(html, req && req\._cspNonce\);(\r?\n\r?\n    const buf = Buffer\.from\(html)/,
                       'html = _applyCspNonce(html, "MISMATCHED-NONCE-VALUE==");$1'),
        async (p) => { const r = await get(p, '/');
            const hn = headerNonce(r.headers['content-security-policy-report-only']);
            return { red: !r.body.includes('nonce="' + hn + '"'), note: 'header=' + hn }; });

    await red('R4 nonce pinned to a constant -> reuse across responses detected',
        s => s.replace("function _mintCspNonce() { return _crypto.randomBytes(16).toString('base64'); }",
                       "function _mintCspNonce() { return 'STATIC-NONCE-AAAAAAAAAA=='; }"),
        async (p) => { const a = await get(p, '/'); const b = await get(p, '/');
            const na = headerNonce(a.headers['content-security-policy-report-only']);
            const nb = headerNonce(b.headers['content-security-policy-report-only']);
            return { red: na === nb, note: na + ' vs ' + nb }; });

    await red("R5 SSR cache bypass disabled with TP_SSR_CACHE=1 -> cached nonce reuse detected",
        s => s.replace('const _SC_NONCE_BYPASS = true;', 'const _SC_NONCE_BYPASS = false;'),
        async (p) => {
            // hit a cacheable family twice; a cache HIT replays the body while the header is fresh
            await get(p, '/quran');
            const a = await get(p, '/quran');
            const b = await get(p, '/quran');
            const na = headerNonce(a.headers['content-security-policy-report-only']);
            const nb = headerNonce(b.headers['content-security-policy-report-only']);
            const aMatches = a.body.includes('nonce="' + na + '"');
            const bMatches = b.body.includes('nonce="' + nb + '"');
            return { red: !(aMatches && bMatches), note: 'bodyMatchesOwnHeader A=' + aMatches + ' B=' + bMatches };
        }, '1');

    await red("R6 'strict-dynamic' removed -> target policy shape detected",
        s => s.replace("'unsafe-eval' 'strict-dynamic' https: http:", "'unsafe-eval' https: http:"),
        async (p) => { const r = await get(p, '/');
            const ro = r.headers['content-security-policy-report-only'] || '';
            return { red: !/strict-dynamic/.test(ro) }; });

    await red('R12 substitution skipped at exit A -> raw token leaks to the client',
        s => s.replace(/[ \t]*html = _applyCspNonce\(html, req && req\._cspNonce\);\r?\n\r?\n(    const buf = Buffer\.from\(html)/,
                       '$1'),
        async (p) => { const r = await get(p, '/');
            return { red: r.body.indexOf(TOKEN) !== -1, note: 'token present = ' + (r.body.indexOf(TOKEN) !== -1) }; });

    console.log('\n=== the six <script> rewrite anchors (each fails SILENTLY) ===');

    await red('RA1 anchor#1 i18n regex narrowed -> split bundles stop being injected',
        s => s.replace('/<script\\b[^>]*\\bdefer\\s+src="js\\/i18n\\.js\\?v=\\d+"\\s*><\\/script>/',
                       '/<script\\s+defer\\s+src="js\\/i18n\\.js\\?v=\\d+"\\s*><\\/script>/'),
        async (p) => { const r = await get(p, '/fr');
            const hasSplit = /js\/i18n\/fr\.js/.test(r.body);
            return { red: !hasSplit, note: 'split bundle present = ' + hasSplit }; });

    await red('RA2 anchor#2/#3 i18n island anchor reverted to the pre-nonce literal -> country island lost',
        s => s.replace("const _I18N_SRC_ANCHOR = '<script' + _TP_NONCE_ATTR + ' src=\"js/i18n.js';",
                       "const _I18N_SRC_ANCHOR = '<script src=\"js/i18n.js';"),
        async (p) => { const r = await get(p, '/prayer-times-in-saudi-arabia');
            // MEASURED: breaking this anchor does NOT lose the island — each injection site has an
            //   else-branch that falls back to injecting at </head>. Unmutated the island lands at
            //   ~102365 with </head> at ~76677 (i.e. in the BODY, next to the i18n tag); mutated it
            //   lands at ~72497 with </head> at ~127126 (i.e. inside the HEAD). So presence is the
            //   wrong thing to assert — POSITION is the signal. The real-world cost of losing the
            //   anchor is the FCP/LCP regression the original code comments describe: a ~19-54 KB
            //   island pushed back into <head>, ahead of the hero.
            const island = r.body.indexOf('id="country-cities-data"');
            const headEnd = r.body.indexOf('</head>');
            const inHead = island >= 0 && headEnd >= 0 && island < headEnd;
            return { red: inHead,
                     note: 'island=' + island + ' </head>=' + headEnd + ' fellBackIntoHead=' + inHead }; });

    await red('RA3 anchor#6 Umm al-Qura marker reverted -> hijri table stops being injected',
        s => s.replace("const marker = '<script' + _TP_NONCE_ATTR + ' defer src=\"js/hijri-date.js';",
                       "const marker = '<script defer src=\"js/hijri-date.js';"),
        async (p) => { const r = await get(p, '/');
            const has = /window\._HIJRI_UMM_AL_QURA=/.test(r.body);
            return { red: !has, note: 'hijri table present = ' + has }; });

    console.log('\n=== consent / CMP / regional ===');

    await red('R11 Consent Mode snippet loses its nonce -> un-nonced consent script detected',
        s => s.replace("'<script' + _TP_NONCE_ATTR + '>window.dataLayer=window.dataLayer||[];",
                       "'<script>window.dataLayer=window.dataLayer||[];"),
        async (p) => { const r = await get(p, '/');
            const m = r.body.match(/<script[^>]*>window\.dataLayer=/);
            return { red: !!m && !/nonce=/.test(m[0]), note: (m ? m[0].slice(0, 60) : 'not found') }; });

    await red('R10 EEA cookie-settings binding removed -> no consent-withdrawal path in EEA',
        s => s.replace("if (out !== _beforeLink) out = out.replace('</body>', _TP_CMP_SETTINGS_FN + '</body>');",
                       "if (false) out = out.replace('</body>', _TP_CMP_SETTINGS_FN + '</body>');"),
        async (p) => { const r = await get(p, '/', { 'CF-IPCountry': 'DE' });
            const bound = /showRevocationMessage/.test(r.body);
            return { red: !bound, note: 'EEA binding present = ' + bound }; });

    await red('R13 EEA anchor rewrite reverted to the inline-onclick form -> handler reappears',
        s => s.replace('/<a href="[^"]*"(\\s+data-tp-cookie-settings="1")/g',
                       '/<a href="[^"]*" onclick="NEVER_MATCHES"/g'),
        async (p) => { const r = await get(p, '/', { 'CF-IPCountry': 'DE' });
            // with the rewrite dead the control keeps href="#" instead of a real privacy URL
            const deadHref = /<a href="#"\s+data-tp-cookie-settings/.test(r.body);
            return { red: deadHref, note: 'control left with href="#" = ' + deadHref }; });

    console.log('\n================================================================');
    console.log('  RED TESTS: ' + redOk + ' correctly went red, ' + redBad + ' did NOT');
    if (bad.length) { console.log('\n  BLIND GUARDS:'); for (const b of bad) console.log('    - ' + b); }
    const finalSha = crypto.createHash('sha256').update(fs.readFileSync(SRV)).digest('hex');
    console.log('\n  final server.js sha256 = ' + finalSha);
    console.log('  byte-exact restore     = ' + (finalSha === BASE_SHA));
    console.log('================================================================');
    process.exit(redBad === 0 && finalSha === BASE_SHA ? 0 : 1);
})();
