// MOON-COUNTRY-TITLE-LENGTH-ALL-LANGS-FIX-1 — verification (self-contained).
//
// /moon/{country} <title> must land in the 50–60 SEO band for EVERY language and for both short
// (مصر / Egypt / EAU) and long (الإمارات العربية المتحدة / United Arab Emirates) country names —
// via the 6-tier _MT_SUFFIXES ladder + longest-≤60 picker. This smoke renders 6 representative
// countries × 10 langs and asserts 50 ≤ titleLen ≤ 60, and guards the title-only scope: H1, meta,
// and canonical on /moon/saudi-arabia are UNCHANGED.
//
// Run: node scripts/_smoke_moon_country_title_length_all_langs_1.mjs
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (label, ok, extra) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); };

const PORT = 8256;
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
const titleOf = (b) => { const m = (b.match(/<title>([^<]*)<\/title>/) || [])[1] || ''; return m.replace(/&amp;/g, '&').replace(/&#39;/g, "'"); };
const tlen = (b) => [...titleOf(b)].length;
const canonOf = (b) => (b.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
const h1Of = (b) => { const m = b.match(/<h1[^>]*>([\s\S]*?)<\/h1>/); return m ? m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : ''; };

// short (مصر/EAU) + long (United Arab Emirates) + medium country names, to exercise both ends of the ladder
const COUNTRIES = ['saudi-arabia', 'egypt', 'turkey', 'malaysia', 'united-states', 'united-arab-emirates'];
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];

(async () => {
    const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
    try {
        if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

        // ── A) title length 50–60 for every (country, lang) ──
        console.log('── A) /moon/{country} title length ∈ [50,60] — 6 countries × 10 langs ──');
        let outOfBand = 0;
        for (const lang of LANGS) {
            const lens = [];
            for (const c of COUNTRIES) {
                const pfx = lang === 'ar' ? '' : '/' + lang;
                const b = (await req(`${pfx}/moon/${c}`)).body;
                const n = tlen(b);
                lens.push(n);
                if (n < 50 || n > 60) outOfBand++;
            }
            check(`[${lang}] all 6 countries 50–60`, lens.every(n => n >= 50 && n <= 60), lens.join(','));
        }
        check('ZERO titles out of [50,60] across all 60 (country×lang) pairs', outOfBand === 0, String(outOfBand));

        // ── B) title still moon-themed (starts with مراحل القمر / Moon Phases), not prayer ──
        console.log('\n── B) title still moon-themed ──');
        const sa = (await req('/moon/saudi-arabia')).body;
        const saEn = (await req('/en/moon/saudi-arabia')).body;
        check('AR title starts «مراحل القمر …»', /^مراحل القمر/.test(titleOf(sa)), titleOf(sa));
        check('EN title starts «Moon Phases …»', /^Moon Phases/.test(titleOf(saEn)), titleOf(saEn));
        check('no prayer leak in title', !/مواقيت الصلاة|Prayer Times/.test(titleOf(sa) + titleOf(saEn)));

        // ── C) scope: title-only — H1 / meta / canonical UNCHANGED on /moon/saudi-arabia ──
        console.log('\n── C) title-only scope (H1/meta/canonical unchanged) ──');
        check('H1 unchanged = «مراحل القمر في المملكة العربية السعودية»', h1Of(sa) === 'مراحل القمر في المملكة العربية السعودية', h1Of(sa));
        check('meta description still present (not emptied/changed by this ticket)', /تعرّف على مرحلة القمر اليوم وتقويم القمر/.test(sa));
        check('canonical self = …/moon/saudi-arabia', /\/moon\/saudi-arabia$/.test(canonOf(sa)), canonOf(sa));
        check('indexable (no noindex)', !/<meta name="robots"[^>]*noindex/i.test(sa));

        s.kill('SIGKILL');
    } catch (e) { console.error(e); try { s.kill('SIGKILL'); } catch (_) {} }
    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    process.exit(fail === 0 ? 0 : 1);
})();
