// CSP-IMG-SRC-GOOGLETAGMANAGER-PING-1 — RED TESTS.
//
// A green smoke suite proves nothing unless each guard can be shown to FAIL when the thing it protects
// breaks. Every case mutates server.js, runs the smoke suite against it, asserts that the smoke's OWN
// label for that guard went red, then restores server.js and verifies the restore is BYTE-EXACT by sha256.
// An unmutated control run must be fully green first.
//
// The base server (commit 5c07b8f) is booted ONCE from TP_BASE_ROOT and shared by every smoke run.
// Nothing here touches production.
//
// Usage: TP_BASE_ROOT=<base checkout> node scripts/_red_csp_img_src_googletagmanager_ping_1.mjs
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRV = path.join(ROOT, 'server.js');
const SMOKE = path.join(ROOT, 'scripts', '_smoke_csp_img_src_googletagmanager_ping_1.mjs');
const BASE_ROOT = process.env.TP_BASE_ROOT;
const BASE_PORT = 8792;
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const ORIGINAL = fs.readFileSync(SRV);
const ORIGINAL_SHA = sha(ORIGINAL);
const restore = () => { fs.writeFileSync(SRV, ORIGINAL); return sha(fs.readFileSync(SRV)) === ORIGINAL_SHA; };
process.on('SIGINT', () => { restore(); process.exit(130); });

// the fixed GA segment of img-src — present exactly twice (enforcing first, Report-Only second)
const SEG = '" https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com" : "") + (_ADSENSE_ENABLED ? " https://pagead2';
const SEG_WITHOUT = '" https://www.google-analytics.com https://*.google-analytics.com" : "") + (_ADSENSE_ENABLED ? " https://pagead2';
const SEG_WILDCARD = '" https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://*.googletagmanager.com" : "") + (_ADSENSE_ENABLED ? " https://pagead2';
const SEG_HTTPS = '" https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https:" : "") + (_ADSENSE_ENABLED ? " https://pagead2';
const FONT = `"font-src 'self' https://fonts.gstatic.com data:",`;
const FONT_WIDENED = `"font-src 'self' https://fonts.gstatic.com data: https://www.googletagmanager.com",`;

function replaceNth(s, find, repl, n) {
    let idx = -1;
    for (let i = 0; i <= n; i++) { idx = s.indexOf(find, idx + 1); if (idx === -1) return s; }
    return s.slice(0, idx) + repl + s.slice(idx + find.length);
}
const count = (s, f) => s.split(f).length - 1;

const CASES = [
    { id: 'R1', name: 'host removed from the ENFORCING img-src', expect: 'A', mut: s => replaceNth(s, SEG, SEG_WITHOUT, 0) },
    { id: 'R2', name: 'host removed from the REPORT-ONLY img-src', expect: 'B', mut: s => replaceNth(s, SEG, SEG_WITHOUT, 1) },
    { id: 'R3', name: 'wildcard https://*.googletagmanager.com added to enforcing img-src', expect: 'E', mut: s => replaceNth(s, SEG, SEG_WILDCARD, 0) },
    { id: 'R4', name: 'bare https: added to Report-Only img-src', expect: 'F', mut: s => replaceNth(s, SEG, SEG_HTTPS, 1) },
    { id: 'R5', name: 'a different directive touched (enforcing font-src gains the host)', expect: 'D', mut: s => replaceNth(s, FONT, FONT_WIDENED, 0) },
    { id: 'R6', name: 'Consent Mode default changed (wait_for_update 500 -> 501)', expect: 'G', mut: s => s.replace("'wait_for_update':500,", "'wait_for_update':501,") },
    { id: 'R7', name: 'AdSense page tag changed (crossorigin dropped)', expect: 'H', mut: s => s.replace(`_ADSENSE_CLIENT + '" crossorigin="anonymous"></script>'`, `_ADSENSE_CLIENT + '"></script>'`) },
    { id: 'R8', name: 'nonce architecture broken (static nonce)', expect: 'I', mut: s => s.replace("function _mintCspNonce() { return _crypto.randomBytes(16).toString('base64'); }", "function _mintCspNonce() { return 'STATICNONCEAAAAAAAAAAA=='; }") },
    { id: 'R9', name: 'regional CMP suppression disabled for EEA visitors', expect: 'J', mut: s => s.split('if (_inRegulatedRegion) html = _stripCustomConsentBanner(html, urlPath);').join('if (false) html = _stripCustomConsentBanner(html, urlPath);') },
];

function get(port, p) {
    return new Promise((resolve) => {
        const req = http.request({ host: '127.0.0.1', port, path: p, method: 'GET' }, (res) => { res.resume(); res.on('end', () => resolve(res.statusCode)); });
        req.on('error', () => resolve(0)); req.end();
    });
}
function runSmoke(baseUrl) {
    return new Promise((resolve) => {
        const env = { ...process.env, TP_BASE_URL: baseUrl }; delete env.TP_BASE_ROOT;
        const c = spawn(process.execPath, [SMOKE], { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'] });
        let out = ''; c.stdout.on('data', d => out += d); c.stderr.on('data', d => out += d);
        c.on('close', code => resolve({ code, out }));
    });
}
const redLabels = (out) => [...new Set((out.match(/✗ \[([A-Z])\]/g) || []).map(x => x.slice(3, 4)))].sort();

(async () => {
    if (!BASE_ROOT) { console.log('TP_BASE_ROOT is required'); process.exit(2); }
    if (count(ORIGINAL.toString('utf8'), SEG) !== 2) { console.log('server.js is not the fixed version (SEG count != 2) — refusing to run'); process.exit(2); }
    console.log('server.js sha256 (fixed) = ' + ORIGINAL_SHA);

    const env = { ...process.env, PORT: String(BASE_PORT), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: 'https://timesprayers.com',
                  SUPABASE_URL: '', GA_MEASUREMENT_ID: 'G-LT0KWQHW6P', ADSENSE_CLIENT: 'ca-pub-5423625249193539' };
    delete env.TP_ENABLE_SEARCH_TEST;
    const base = spawn(process.execPath, ['server.js'], { cwd: BASE_ROOT, env, stdio: ['ignore', 'ignore', 'ignore'] });
    let up = false; for (let i = 0; i < 250 && !up; i++) { up = (await get(BASE_PORT, '/health')) === 200; if (!up) await sleep(400); }
    if (!up) { console.log('base server not healthy'); process.exit(2); }
    const baseUrl = 'http://127.0.0.1:' + BASE_PORT;

    let good = 0, bad = 0; const rows = [];
    try {
        console.log('\n[R0] control — unmutated fixed tree must be fully GREEN');
        const c0 = await runSmoke(baseUrl);
        const r0 = redLabels(c0.out);
        const ctlOk = c0.code === 0 && r0.length === 0;
        console.log('     smoke exit=' + c0.code + '  red labels=' + (r0.join(',') || 'none') + '  ->  ' + (ctlOk ? 'GREEN (control valid)' : 'NOT GREEN'));
        (ctlOk ? good++ : bad++); rows.push(['R0', 'control', '-', r0.join(',') || 'none', ctlOk]);

        for (const k of CASES) {
            const src = ORIGINAL.toString('utf8');
            const mutated = k.mut(src);
            if (mutated === src) { console.log('\n[' + k.id + '] ' + k.name + '  ->  MUTATION DID NOT APPLY'); bad++; rows.push([k.id, k.name, k.expect, 'n/a', false]); continue; }
            fs.writeFileSync(SRV, mutated, 'utf8');
            let res;
            try { res = await runSmoke(baseUrl); }
            finally {
                const exact = restore();
                if (!exact) { console.log('RESTORE FAILED — stopping'); process.exit(4); }
            }
            const labels = redLabels(res.out);
            const hit = res.code !== 0 && labels.includes(k.expect);
            console.log('\n[' + k.id + '] ' + k.name);
            console.log('     expected red: [' + k.expect + ']   smoke exit=' + res.code + '   red labels=' + (labels.join(',') || 'none')
                + '   restore byte-exact=true   ->  ' + (hit ? 'RED AS EXPECTED' : 'DID NOT GO RED'));
            (res.out.match(/✗ \[[A-Z]\][^\n]*/g) || []).filter(l => l.startsWith('✗ [' + k.expect + ']')).slice(0, 2).forEach(l => console.log('       ' + l.slice(0, 170)));
            (hit ? good++ : bad++); rows.push([k.id, k.name, k.expect, labels.join(','), hit]);
        }
    } finally {
        restore();
        try { execFileSync('taskkill', ['/PID', String(base.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {}
    }
    const finalSha = sha(fs.readFileSync(SRV));
    console.log('\n================================================================');
    rows.forEach(r => console.log('  ' + r[0].padEnd(4) + (r[4] ? 'OK  ' : 'BAD ') + ' expect [' + r[2] + ']  red=' + (r[3] || 'none').padEnd(12) + ' ' + r[1]));
    console.log('  final server.js sha256 = ' + finalSha + '   byte-exact restore = ' + (finalSha === ORIGINAL_SHA));
    console.log('  RED SUITE: ' + good + ' ok, ' + bad + ' bad');
    console.log('================================================================');
    process.exit(bad === 0 && finalSha === ORIGINAL_SHA ? 0 : 1);
})();
