// CSP-CONNECT-SRC-WWW-GOOGLE-COLLECT-1 — RED TESTS.
//
// Each case mutates server.js, runs the smoke suite against it, asserts that the smoke's OWN label for that guard
// went red, then restores server.js and verifies the restore is BYTE-EXACT by sha256. An unmutated control run
// must be fully green first. The base server (commit eeb9194) is booted ONCE from TP_BASE_ROOT and shared.
// Nothing here touches production.
//
// Usage: TP_BASE_ROOT=<base checkout> node scripts/_red_csp_connect_src_www_google_collect_1.mjs
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRV = path.join(ROOT, 'server.js');
const SMOKE = path.join(ROOT, 'scripts', '_smoke_csp_connect_src_www_google_collect_1.mjs');
const BASE_ROOT = process.env.TP_BASE_ROOT;
const BASE_PORT = 8807;
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const ORIGINAL = fs.readFileSync(SRV);
const ORIGINAL_SHA = sha(ORIGINAL);
const restore = () => { fs.writeFileSync(SRV, ORIGINAL); return sha(fs.readFileSync(SRV)) === ORIGINAL_SHA; };
process.on('SIGINT', () => { restore(); process.exit(130); });

// the fixed GA segment of connect-src — present exactly once (one _cspTargetPolicy feeds both headers)
const SEG = 'https://*.analytics.google.com https://www.googletagmanager.com https://www.google.com" : "") + _csAds';
const SEG_WITHOUT = 'https://*.analytics.google.com https://www.googletagmanager.com" : "") + _csAds';
const SEG_SUB = 'https://*.analytics.google.com https://www.googletagmanager.com https://www.google.com https://*.google.com" : "") + _csAds';
const SEG_CCTLD = 'https://*.analytics.google.com https://www.googletagmanager.com https://www.google.com https://www.google.com.sa" : "") + _csAds';
const SEG_HTTPS = 'https://*.analytics.google.com https://www.googletagmanager.com https://www.google.com https:" : "") + _csAds';
const SEG_STAR = 'https://*.analytics.google.com https://www.googletagmanager.com https://www.google.com *" : "") + _csAds';
const RO_LINE = "    res.setHeader('Content-Security-Policy-Report-Only', _cspTargetPolicy);";
const RO_LINE_DIVERGED = "    res.setHeader('Content-Security-Policy-Report-Only', _cspTargetPolicy.replace(' https://www.google.com https://pagead2', ' https://pagead2'));";
const IMG_F1 = 'https://*.google-analytics.com https://www.googletagmanager.com" : "") + (_ADSENSE_ENABLED ? " https://pagead2';
const IMG_F1_WITH_WWW = 'https://*.google-analytics.com https://www.googletagmanager.com https://www.google.com" : "") + (_ADSENSE_ENABLED ? " https://pagead2';
const IMG_F1_REMOVED = 'https://*.google-analytics.com" : "") + (_ADSENSE_ENABLED ? " https://pagead2';
const CSI = '_csAds + (_ADSENSE_ENABLED ? " https://csi.gstatic.com" : "") + _csTrafficQuality';
const SCRIPT_SRC = `"script-src 'nonce-" + _cspNonce + "' 'unsafe-inline' 'unsafe-eval' 'strict-dynamic' https: http:",`;
const FRAME = `"frame-src 'self' https://googleads.g.doubleclick.net`;
const count = (s, f) => s.split(f).length - 1;

const CASES = [
    { id: 'R1',  name: 'host removed from connect-src (both headers lose it)', expect: 'A', mut: s => s.replace(SEG, SEG_WITHOUT) },
    { id: 'R2',  name: 'Report-Only diverges: its copy drops the host', expect: 'B', mut: s => s.replace(RO_LINE, RO_LINE_DIVERGED) },
    { id: 'R3',  name: 'https://*.google.com added to connect-src', expect: 'E', mut: s => s.replace(SEG, SEG_SUB) },
    { id: 'R4',  name: 'google.<ccTLD> (www.google.com.sa) added to connect-src', expect: 'E', mut: s => s.replace(SEG, SEG_CCTLD) },
    { id: 'R5',  name: 'bare https: added to connect-src', expect: 'F', mut: s => s.replace(SEG, SEG_HTTPS) },
    { id: 'R6',  name: 'wildcard * added to connect-src', expect: 'F', mut: s => s.replace(SEG, SEG_STAR) },
    { id: 'R7',  name: 'another directive touched (img-src gains www.google.com)', expect: 'K', mut: s => s.replace(IMG_F1, IMG_F1_WITH_WWW) },
    { id: 'R8',  name: 'F1 reopened (googletagmanager removed from img-src)', expect: 'K', mut: s => s.replace(IMG_F1, IMG_F1_REMOVED) },
    { id: 'R9',  name: 'CSI reopened (csi.gstatic.com removed from connect-src)', expect: 'K', mut: s => s.replace(CSI, '_csAds + _csTrafficQuality') },
    { id: 'R10', name: "script-src changed ('strict-dynamic' removed)", expect: 'K', mut: s => s.replace(SCRIPT_SRC, SCRIPT_SRC.replace(" 'strict-dynamic'", '')) },
    { id: 'R11', name: 'frame-src changed (doubleclick removed)', expect: 'K', mut: s => s.replace(FRAME, `"frame-src 'self'`) },
    { id: 'R12', name: 'nonce architecture broken (static nonce)', expect: 'I', mut: s => s.replace("function _mintCspNonce() { return _crypto.randomBytes(16).toString('base64'); }", "function _mintCspNonce() { return 'STATICNONCEAAAAAAAAAAA=='; }") },
    { id: 'R13', name: 'Consent Mode default changed (wait_for_update 500 -> 501)', expect: 'M', mut: s => s.replace("'wait_for_update':500,", "'wait_for_update':501,") },
    { id: 'R14', name: 'AdSense page tag changed (crossorigin dropped)', expect: 'M', mut: s => s.replace(`_ADSENSE_CLIENT + '" crossorigin="anonymous"></script>'`, `_ADSENSE_CLIENT + '"></script>'`) },
    { id: 'R15', name: 'SSR cache nonce bypass switched off', expect: 'W', mut: s => s.replace('const _SC_NONCE_BYPASS = true;', 'const _SC_NONCE_BYPASS = false;') },
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
    if (count(ORIGINAL.toString('utf8'), SEG) !== 1) { console.log('server.js is not the fixed version (SEG count != 1) — refusing to run'); process.exit(2); }
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
        const c0 = await runSmoke(baseUrl); const r0 = redLabels(c0.out);
        const ctlOk = c0.code === 0 && r0.length === 0;
        console.log('     smoke exit=' + c0.code + '  red labels=' + (r0.join(',') || 'none') + '  ->  ' + (ctlOk ? 'GREEN (control valid)' : 'NOT GREEN'));
        if (!ctlOk) (c0.out.match(/✗ [^\n]*/g) || []).slice(0, 6).forEach(l => console.log('       ' + l.slice(0, 170)));
        (ctlOk ? good++ : bad++); rows.push(['R0', 'control', '-', r0.join(',') || 'none', ctlOk]);

        for (const k of CASES) {
            const src = ORIGINAL.toString('utf8');
            const mutated = k.mut(src);
            if (mutated === src) { console.log('\n[' + k.id + '] ' + k.name + '  ->  MUTATION DID NOT APPLY'); bad++; rows.push([k.id, k.name, k.expect, 'n/a', false]); continue; }
            fs.writeFileSync(SRV, mutated, 'utf8');
            let res;
            try { res = await runSmoke(baseUrl); }
            finally { if (!restore()) { console.log('RESTORE FAILED — stopping'); process.exit(4); } }
            const labels = redLabels(res.out);
            const hit = res.code !== 0 && labels.includes(k.expect);
            console.log('\n[' + k.id + '] ' + k.name);
            console.log('     expected red: [' + k.expect + ']   smoke exit=' + res.code + '   red labels=' + (labels.join(',') || 'none') + '   restore byte-exact=true   ->  ' + (hit ? 'RED AS EXPECTED' : 'DID NOT GO RED'));
            (res.out.match(/✗ \[[A-Z]\][^\n]*/g) || []).filter(l => l.startsWith('✗ [' + k.expect + ']')).slice(0, 2).forEach(l => console.log('       ' + l.slice(0, 170)));
            (hit ? good++ : bad++); rows.push([k.id, k.name, k.expect, labels.join(','), hit]);
        }
    } finally {
        restore();
        try { execFileSync('taskkill', ['/PID', String(base.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {}
    }
    const finalSha = sha(fs.readFileSync(SRV));
    console.log('\n================================================================');
    rows.forEach(r => console.log('  ' + r[0].padEnd(4) + (r[4] ? 'OK  ' : 'BAD ') + ' expect [' + r[2] + ']  red=' + (r[3] || 'none').padEnd(14) + ' ' + r[1]));
    console.log('  final server.js sha256 = ' + finalSha + '   byte-exact restore = ' + (finalSha === ORIGINAL_SHA));
    console.log('  RED SUITE: ' + good + ' ok, ' + bad + ' bad');
    console.log('================================================================');
    process.exit(bad === 0 && finalSha === ORIGINAL_SHA ? 0 : 1);
})();
