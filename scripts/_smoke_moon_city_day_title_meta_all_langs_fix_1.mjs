// MOON-CITY-DAY-TITLE-META-ALL-LANGS-FIX-1 — HTTP verification (boots the server).
//
// The dated day page /moon/{country}/{city}/{YYYY}/{MM}/{DD} now builds title (50–60) and
// meta (120–160) for ALL 10 langs via the algorithmic fitter js/moon-day-seo.js — replacing
// the gap-prone 4-rung title ladder (short cities fell to <50: en/Riyadh=36) and the EN-only
// meta ladder (other 9 langs overflowed >160 via the date-with-Hijri string). No EN fallback.
// The exhaustive pure-function matrix is scripts/_matrix_moon_day_seo_all_langs_fix_1.mjs;
// this asserts the SERVER is wired + the contract holds on real in-range dated pages.
//
// Dated pages exist only for [today-30, today+90]; dates are computed RELATIVE to today so the
// smoke is date-robust. Lengths are CODE POINTS ([...s].length) — what the SEO tool counts.
//
// Run: node scripts/_smoke_moon_city_day_title_meta_all_langs_fix_1.mjs
import http from 'node:http';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (l, ok, x) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${l}${x !== undefined && x !== '' ? '   →  ' + x : ''}`); };
const PORT = 8316;
const req = (p) => new Promise((res) => { const r = http.request({ host: 'localhost', port: PORT, path: p, headers: { 'Accept-Encoding': 'identity' } }, rs => { let b = ''; rs.on('data', c => b += c); rs.on('end', () => res(b)); }); r.on('error', () => res('')); r.end(); });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function ready(ms){const t=Date.now();while(Date.now()-t<ms){if(await req('/health'))return true;await sleep(400);}return false;}
const dec = s => (s||'').replace(/&amp;/g,'&').replace(/&#0?39;/g,"'").replace(/&rsquo;/g,'’').replace(/&quot;/g,'"').replace(/&#x27;/g,"'");
const titleOf = b => dec((b.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
const descOf = b => dec((b.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
const cp = s => [...s].length;
const h1Count = b => (b.match(/<h1[\s>]/g) || []).length;
const canonOf = b => (b.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';

// In-range dated dates relative to today (within [today-30, today+90]).
const pad = n => (n < 10 ? '0' + n : '' + n);
const dpath = (addDays) => { const d = new Date(); d.setDate(d.getDate() + addDays); return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()); };
const D1 = dpath(7), D2 = dpath(25);   // both comfortably in range

const SRV = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const MOD = fs.readFileSync(path.join(ROOT, 'js', 'moon-day-seo.js'), 'utf8');
const APPJS = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
const MOONJS = fs.readFileSync(path.join(ROOT, 'js', 'moon.js'), 'utf8');
const INDEX = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const CSS = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');

const langs = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
// Per-lang native moon token that MUST appear in title (proves no EN fallback) + per-lang city token.
const moonTok = { ar: 'القمر', en: 'Moon', fr: 'Lune', tr: 'Ay', ur: 'چاند', de: 'Mond', id: 'Bulan', es: 'Luna', bn: 'চাঁদ', ms: 'Bulan' };
const cityTok = {
    riyadh: { ar: 'الرياض', en: 'Riyadh', fr: 'Riyad', tr: 'Riyad', ur: 'ریاض', de: 'Riad', id: 'Riyadh', es: 'Riad', bn: 'রিয়াদ', ms: 'Riyadh' },
};

(async () => {
    const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
    try {
        if (!await ready(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

        // ── A) dated page: title 50-60 + meta 120-160, 10 langs × short(Riyadh)+long(Santiago) × 2 dates ──
        console.log(`── A) title 50-60 + meta 120-160 (10 langs × 2 cities × 2 dates; D1=${D1} D2=${D2}) ──`);
        const cities = [['saudi-arabia/riyadh', 'Riyadh(short)'], ['mexico/santiago-de-queretaro', 'Santiago(long)']];
        for (const l of langs) {
            const lp = (l === 'ar') ? '' : '/' + l;
            for (const [slug, tag] of cities) {
                for (const D of [D1, D2]) {
                    const b = await req(`${lp}/moon/${slug}/${D}`);
                    const t = titleOf(b), d = descOf(b); const tn = cp(t), dn = cp(d);
                    check(`${l}/${tag} ${D}: T=${tn}[50-60] M=${dn}[120-160]`, tn >= 50 && tn <= 60 && dn >= 120 && dn <= 160, `"${t}"`);
                }
            }
        }

        // ── B) NO English fallback: each lang's title is in its OWN language + city + date retained ──
        console.log('\n── B) no EN fallback (per-lang moon token + city + date present) ──');
        for (const l of langs) {
            const lp = (l === 'ar') ? '' : '/' + l;
            const b = await req(`${lp}/moon/saudi-arabia/riyadh/${D1}`);
            const t = titleOf(b), d = descOf(b);
            const yr = D1.slice(0, 4);
            check(`${l}: title has native moon token "${moonTok[l]}" + city "${cityTok.riyadh[l]}" + year`, t.includes(moonTok[l]) && t.includes(cityTok.riyadh[l]) && t.includes(yr), `"${t}"`);
            check(`${l}: meta has native moon token + city`, d.includes(moonTok[l]) && d.includes(cityTok.riyadh[l]));
        }

        // ── C) SEO contract on the dated page (H1=1, canonical self, hreflang, indexable) ──
        console.log('\n── C) dated-page contract ──');
        for (const l of ['', '/en', '/bn']) {
            const p = `${l}/moon/saudi-arabia/riyadh/${D1}`;
            const b = await req(p);
            check(`${p}: H1=1 + canonical self + hreflang + indexable`, h1Count(b) === 1 && canonOf(b).endsWith(p) && /hreflang=/.test(b) && !/<meta name="robots"[^>]*noindex/i.test(b), `canon=${canonOf(b)}`);
        }

        // ── D) scope: /today, /month, /year unaffected (still 200 + H1=1 + title in 50-60) ──
        console.log('\n── D) scope: today / month / year unaffected ──');
        const mo = D1.slice(0, 7); const yr = D1.slice(0, 4);
        for (const [p, tag] of [[`/en/moon/saudi-arabia/riyadh/today`, 'today'], [`/en/moon/saudi-arabia/riyadh/${mo}`, 'month'], [`/en/moon/saudi-arabia/riyadh/${yr}`, 'year']]) {
            const b = await req(p); const tn = cp(titleOf(b));
            check(`${tag} (${p}): 200 + H1=1 + title 50-60 (${tn})`, !!b && h1Count(b) === 1 && tn >= 50 && tn <= 60);
        }

        // ── E) source guards: server-side fitter only, no cache-buster, moon.js untouched ──
        console.log('\n── E) source guards ──');
        check('server.js requires moon-day-seo + calls fitDayTitle/fitDayDesc', /require\('\.\/js\/moon-day-seo\.js'\)/.test(SRV) && /MoonDaySeo\.fitDayTitle\(/.test(SRV) && /MoonDaySeo\.fitDayDesc\(/.test(SRV));
        check('server.js: old _MOON_DAY_TITLE_FORMS / _pickMoonDayTitle removed', !SRV.includes('_MOON_DAY_TITLE_FORMS') && !SRV.includes('_pickMoonDayTitle'));
        check('js/moon-day-seo.js exports fitDayTitle + fitDayDesc', /fitDayTitle/.test(MOD) && /fitDayDesc/.test(MOD) && /module\.exports/.test(MOD));
        check('moon-day-seo.js NOT a client asset (absent in index.html + css)', !INDEX.includes('moon-day-seo') && !CSS.includes('moon-day-seo'));
        check('index.html app.js?v=805 preserved (NO cache-buster)', /app\.js\?v=805\b/.test(INDEX));
        check('js/moon.js untouched (no ticket marker)', !MOONJS.includes('MOON-CITY-DAY-TITLE-META'));
        check('js/app.js NOT modified for this ticket (no marker)', !APPJS.includes('MOON-CITY-DAY-TITLE-META'));

        s.kill('SIGKILL');
    } catch (e) { console.error(e); try { s.kill('SIGKILL'); } catch (_) {} }
    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    process.exit(fail === 0 ? 0 : 1);
})();
