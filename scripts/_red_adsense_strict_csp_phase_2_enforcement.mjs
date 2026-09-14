// ADSENSE-STRICT-CSP-MIGRATION-1 — PHASE 2 ENFORCEMENT — SECURITY RED TESTS.
//
// Each case mutates server.js, runs the Phase 2 smoke suite against it, asserts that the smoke's OWN label for that
// guard went red, then restores server.js and verifies the restore is BYTE-EXACT by sha256. An unmutated control run
// must be fully green first. The base server (commit 3abc6e0) is booted ONCE from TP_BASE_ROOT and shared.
// Nothing here touches production.
//
// Usage: TP_BASE_ROOT=<base checkout> node scripts/_red_adsense_strict_csp_phase_2_enforcement.mjs
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRV = path.join(ROOT, 'server.js');
const SMOKE = path.join(ROOT, 'scripts', '_smoke_adsense_strict_csp_phase_2_enforcement.mjs');
const BASE_ROOT = process.env.TP_BASE_ROOT;
const BASE_PORT = 8852;
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const ORIGINAL = fs.readFileSync(SRV);
const ORIGINAL_SHA = sha(ORIGINAL);
const restore = () => { fs.writeFileSync(SRV, ORIGINAL); return sha(fs.readFileSync(SRV)) === ORIGINAL_SHA; };
process.on('SIGINT', () => { restore(); process.exit(130); });

const ENF = "    res.setHeader('Content-Security-Policy', _cspTargetPolicy);";
const RO = "    res.setHeader('Content-Security-Policy-Report-Only', _cspTargetPolicy);";
const SCRIPT_SRC = `"script-src 'nonce-" + _cspNonce + "' 'unsafe-inline' 'unsafe-eval' 'strict-dynamic' https: http:",`;
const F1 = 'https://*.google-analytics.com https://www.googletagmanager.com" : "") + (_ADSENSE_ENABLED ? " https://pagead2';
const CSI = '_csAds + (_ADSENSE_ENABLED ? " https://csi.gstatic.com" : "") + _csTrafficQuality';
const count = (s, f) => s.split(f).length - 1;

const CASES = [
    { id: 'R1',  name: 'nonce removed from the ENFORCING header', expect: 'A', mut: s => s.replace(ENF, "    res.setHeader('Content-Security-Policy', _cspTargetPolicy.replace(/'nonce-[^']+' /, ''));") },
    { id: 'R2',  name: 'nonce removed from a script (AdSense page tag)', expect: 'H', mut: s => s.replace("'<script' + _TP_NONCE_ATTR + ' async src=\"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='", "'<script async src=\"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='") },
    { id: 'R3',  name: 'mismatch: enforcing nonce differs from the HTML nonce', expect: 'H', mut: s => s.replace(ENF, "    res.setHeader('Content-Security-Policy', _cspTargetPolicy.split(_cspNonce).join(_mintCspNonce()));") },
    { id: 'R4',  name: 'mismatch: Report-Only nonce differs from the enforcing nonce', expect: 'B', mut: s => s.replace(RO, "    res.setHeader('Content-Security-Policy-Report-Only', _cspTargetPolicy.split(_cspNonce).join(_mintCspNonce()));") },
    { id: 'R5',  name: 'static nonce across responses', expect: 'N', mut: s => s.replace("function _mintCspNonce() { return _crypto.randomBytes(16).toString('base64'); }", "function _mintCspNonce() { return 'STATICNONCEAAAAAAAAAAA=='; }") },
    { id: 'R6',  name: "'strict-dynamic' removed", expect: 'D', mut: s => s.replace(SCRIPT_SRC, SCRIPT_SRC.replace(" 'strict-dynamic'", '')) },
    { id: 'R7',  name: "'unsafe-eval' removed", expect: 'D', mut: s => s.replace(SCRIPT_SRC, SCRIPT_SRC.replace(" 'unsafe-eval'", '')) },
    { id: 'R8',  name: 'script-src-attr removed', expect: 'D', mut: s => s.replace(`        "script-src-attr 'unsafe-inline'",\r\n`, '').replace(`        "script-src-attr 'unsafe-inline'",\n`, '') },
    { id: 'R9',  name: 'F1 reopened (googletagmanager removed from img-src)', expect: 'F', mut: s => s.replace(F1, 'https://*.google-analytics.com" : "") + (_ADSENSE_ENABLED ? " https://pagead2') },
    { id: 'R10', name: 'CSI reopened (csi.gstatic.com removed from connect-src)', expect: 'I', mut: s => s.replace(CSI, '_csAds + _csTrafficQuality') },
    { id: 'R11', name: 'a route no longer receives the nonce (worldwide page substitution removed)', expect: 'P', mut: s => s.replace('        html = _applyCspNonce(html, req && req._cspNonce);', '        html = html;') },
    { id: 'R12', name: 'inline canary without nonce executes (enforcing script-src falls back to host allowlist)', expect: 'C', mut: s => s.replace(ENF, "    res.setHeader('Content-Security-Policy', _cspTargetPolicy.replace(/script-src [^;]*/, \"script-src 'self' 'unsafe-inline' https:\"));") },
];

function get(port, p) { return new Promise((resolve) => { const req = http.request({ host: '127.0.0.1', port, path: p, method: 'GET' }, (res) => { res.resume(); res.on('end', () => resolve(res.statusCode)); }); req.on('error', () => resolve(0)); req.end(); }); }
function runSmoke(baseUrl) {
    return new Promise((resolve) => {
        const env = { ...process.env, TP_BASE_URL: baseUrl }; delete env.TP_BASE_ROOT;
        const c = spawn(process.execPath, [SMOKE], { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'] });
        let out = ''; c.stdout.on('data', d => out += d); c.stderr.on('data', d => out += d); c.on('close', code => resolve({ code, out }));
    });
}
const redLabels = (out) => [...new Set((out.match(/✗ \[([A-Z])\]/g) || []).map(x => x.slice(3, 4)))].sort();

(async () => {
    if (!BASE_ROOT) { console.log('TP_BASE_ROOT is required'); process.exit(2); }
    const src0 = ORIGINAL.toString('utf8');
    if (count(src0, ENF) !== 1 || count(src0, RO) !== 1) { console.log('server.js is not the Phase 2 version — refusing to run'); process.exit(2); }
    console.log('server.js sha256 (Phase 2) = ' + ORIGINAL_SHA);
    const env = { ...process.env, PORT: String(BASE_PORT), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: 'https://timesprayers.com', SUPABASE_URL: '', GA_MEASUREMENT_ID: 'G-LT0KWQHW6P', ADSENSE_CLIENT: 'ca-pub-5423625249193539' };
    delete env.TP_ENABLE_SEARCH_TEST;
    const base = spawn(process.execPath, ['server.js'], { cwd: BASE_ROOT, env, stdio: ['ignore', 'ignore', 'ignore'] });
    let up = false; for (let i = 0; i < 250 && !up; i++) { up = (await get(BASE_PORT, '/health')) === 200; if (!up) await sleep(400); }
    if (!up) { console.log('base server not healthy'); process.exit(2); }
    const baseUrl = 'http://127.0.0.1:' + BASE_PORT;
    let good = 0, bad = 0; const rows = [];
    try {
        console.log('\n[R0] control — unmutated Phase 2 tree must be fully GREEN');
        const c0 = await runSmoke(baseUrl); const r0 = redLabels(c0.out); const ctl = c0.code === 0 && r0.length === 0;
        console.log('     smoke exit=' + c0.code + '  red labels=' + (r0.join(',') || 'none') + '  ->  ' + (ctl ? 'GREEN (control valid)' : 'NOT GREEN'));
        if (!ctl) (c0.out.match(/✗ [^\n]*/g) || []).slice(0, 8).forEach(l => console.log('       ' + l.slice(0, 180)));
        (ctl ? good++ : bad++); rows.push(['R0', 'control', '-', r0.join(',') || 'none', ctl]);
        for (const k of CASES) {
            const mutated = k.mut(src0);
            if (mutated === src0) { console.log('\n[' + k.id + '] ' + k.name + '  ->  MUTATION DID NOT APPLY'); bad++; rows.push([k.id, k.name, k.expect, 'n/a', false]); continue; }
            fs.writeFileSync(SRV, mutated, 'utf8');
            let res; try { res = await runSmoke(baseUrl); } finally { if (!restore()) { console.log('RESTORE FAILED — stopping'); process.exit(4); } }
            const labels = redLabels(res.out); const hit = res.code !== 0 && labels.includes(k.expect);
            console.log('\n[' + k.id + '] ' + k.name);
            console.log('     expected red: [' + k.expect + ']   smoke exit=' + res.code + '   red labels=' + (labels.join(',') || 'none') + '   restore byte-exact=true   ->  ' + (hit ? 'RED AS EXPECTED' : 'DID NOT GO RED'));
            (res.out.match(/✗ \[[A-Z]\][^\n]*/g) || []).filter(l => l.startsWith('✗ [' + k.expect + ']')).slice(0, 2).forEach(l => console.log('       ' + l.slice(0, 180)));
            (hit ? good++ : bad++); rows.push([k.id, k.name, k.expect, labels.join(','), hit]);
        }
    } finally { restore(); try { execFileSync('taskkill', ['/PID', String(base.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} }
    const finalSha = sha(fs.readFileSync(SRV));
    console.log('\n================================================================');
    rows.forEach(r => console.log('  ' + r[0].padEnd(4) + (r[4] ? 'OK  ' : 'BAD ') + ' expect [' + r[2] + ']  red=' + (r[3] || 'none').padEnd(16) + ' ' + r[1]));
    console.log('  final server.js sha256 = ' + finalSha + '   byte-exact restore = ' + (finalSha === ORIGINAL_SHA));
    console.log('  RED SUITE: ' + good + ' ok, ' + bad + ' bad');
    console.log('================================================================');
    process.exit(bad === 0 && finalSha === ORIGINAL_SHA ? 0 : 1);
})();
