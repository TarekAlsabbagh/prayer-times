// MOON-COUNTRY-BROWSER-TITLE-HYDRATION-PRESERVE-1 — verification (self-contained).
//
// Bug: on /moon/{country} the country template's updatePageHeader() ran `document.title = fullTitle`
// UNCONDITIONALLY, where fullTitle is the SHORT H1 form («مراحل القمر في {country}»). That clobbered
// the correct long SSR <title> in the browser tab (e.g. «… اليوم وتقويم القمر — مواعيد البدر والمحاق»).
// Fix: gate that one write to the non-moon variant — `if (!_isMoonCP) document.title = fullTitle;` —
// so the SSR <title> stays authoritative on moon country pages. H1 writes (#page-title / #loc-hero-title)
// are untouched; the prayer variant is unchanged (its title is rebuilt by updateCountryListingSEO).
//
// Runtime (document.title === SSR <title> after hydration, 10 langs) is browser-verified in the ticket
// PRE-PUSH. This smoke pins the source guard + the SSR-side invariants (title band, H1, canonical).
//
// Run: node scripts/_smoke_moon_country_browser_title_hydration_preserve_1.mjs
import http from 'node:http';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (label, ok, extra) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); };

const PORT = 8276;
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
const titleOf = (b) => { const m = (b.match(/<title>([^<]*)<\/title>/) || [])[1] || ''; return m.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'); };
const tlen = (b) => [...titleOf(b)].length;
const canonOf = (b) => (b.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
const h1Of = (b) => { const m = b.match(/<h1[^>]*>([\s\S]*?)<\/h1>/); return m ? m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : ''; };

const TPL = fs.readFileSync(path.join(ROOT, 'prayer-times-cities.html'), 'utf8');

(async () => {
    const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
    try {
        if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

        // ── A) source guard: the moon variant no longer clobbers document.title ──
        console.log('── A) template source guard ──');
        check('updatePageHeader gates the title write: `if (!_isMoonCP) document.title = fullTitle;`', /if \(!_isMoonCP\) document\.title = fullTitle;/.test(TPL));
        check('NO ungated `document.title = fullTitle;` statement remains', !/^\s*document\.title = fullTitle;/m.test(TPL));
        check('H1 writes still present (#page-title + #loc-hero-title = fullTitle — H1 untouched)',
            /getElementById\('page-title'\)\.textContent = fullTitle;/.test(TPL) && /_heroH1\.textContent = fullTitle;/.test(TPL));

        // ── B) SSR invariants on /moon/{country}: long title preserved, H1 short, canonical self ──
        console.log('\n── B) SSR title/H1 invariants (AR egypt) ──');
        const eg = (await req('/moon/egypt')).body;
        const SHORT_AR = 'مراحل القمر في مصر';
        check('AR /moon/egypt <title> is the LONG SEO title (≠ the short H1 form)', titleOf(eg) !== SHORT_AR && titleOf(eg).startsWith(SHORT_AR), titleOf(eg));
        check('AR /moon/egypt title length ∈ [50,60]', tlen(eg) >= 50 && tlen(eg) <= 60, String(tlen(eg)));
        check('AR /moon/egypt title carries moon calendar keywords (وتقويم القمر)', /وتقويم القمر/.test(titleOf(eg)));
        check('AR /moon/egypt H1 unchanged = «مراحل القمر في مصر»', h1Of(eg) === SHORT_AR, h1Of(eg));
        check('AR /moon/egypt canonical self', /\/moon\/egypt$/.test(canonOf(eg)), canonOf(eg));
        check('AR /moon/egypt indexable (no noindex)', !/<meta name="robots"[^>]*noindex/i.test(eg));

        // ── C) EN + a long-country + saudi: long SSR title preserved ──
        console.log('\n── C) EN + long-name countries ──');
        const egEn = (await req('/en/moon/egypt')).body;
        check('EN /en/moon/egypt <title> ≠ short «Moon Phases in Egypt»', titleOf(egEn) !== 'Moon Phases in Egypt' && titleOf(egEn).startsWith('Moon Phases in Egypt'), titleOf(egEn));
        check('EN /en/moon/egypt title length ∈ [50,60]', tlen(egEn) >= 50 && tlen(egEn) <= 60, String(tlen(egEn)));
        const uae = (await req('/moon/united-arab-emirates')).body;
        check('AR /moon/united-arab-emirates (long name) title ∈ [50,60]', tlen(uae) >= 50 && tlen(uae) <= 60, String(tlen(uae)));
        const sa = (await req('/moon/saudi-arabia')).body;
        check('AR /moon/saudi-arabia title ∈ [50,60] + H1 unchanged', tlen(sa) >= 50 && tlen(sa) <= 60 && h1Of(sa) === 'مراحل القمر في المملكة العربية السعودية', `${tlen(sa)} | ${h1Of(sa)}`);

        // ── D) scope: prayer country page + /moon hub still serve a title (unaffected) ──
        console.log('\n── D) scope (prayer + hub unaffected) ──');
        check('prayer /prayer-times-in-egypt still serves a <title>', titleOf((await req('/prayer-times-in-egypt')).body).length > 0);
        check('/moon hub still serves a <title>', titleOf((await req('/moon')).body).length > 0);

        s.kill('SIGKILL');
    } catch (e) { console.error(e); try { s.kill('SIGKILL'); } catch (_) {} }
    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    process.exit(fail === 0 ? 0 : 1);
})();
