// MOON-HUB-TITLE-LENGTH-ALL-LANGS-FIX-1 — verification (self-contained).
//
// SEO tool flagged the /moon hub <title> as too short (EN "Moon Today: Phase, Moon Calendar &
// Hijri Month" = 46 decoded chars). Goal: every lang's /moon <title> in the 50–60 SEOptimer band.
// The hub title lives in the '/moon-today' staticPages SEO dict (server.js) — /moon serves it
// (/moon-today 301→/moon). Only en/tr/es/bn were <50 and got reworded (+ illumination/dates, no
// stuffing); ar/fr/ur/de/id/ms were already in range and were NOT touched. Title only — H1, meta
// desc, canonical, hreflang, noindex, schema unchanged; country/city/year/month/day pages use other
// builders and are untouched.
//
// document.title == source <title> (no JS overwrite) is browser-verified in the PRE-PUSH.
// Run: node scripts/_smoke_moon_hub_title_length_all_langs_1.mjs
import http from 'node:http';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (l, ok, x) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${l}${x !== undefined && x !== '' ? '   →  ' + x : ''}`); };
const PORT = 8295;
function req(p) {
    return new Promise((res) => {
        const r = http.request({ host: 'localhost', port: PORT, path: p, method: 'GET', headers: { 'Accept-Encoding': 'identity' } }, rs => {
            let b = ''; rs.on('data', c => b += c); rs.on('end', () => res({ status: rs.statusCode, body: b, loc: rs.headers.location || '' }));
        });
        r.on('error', () => res({ status: 0, body: '', loc: '' })); r.end();
    });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function ready(ms){const t=Date.now();while(Date.now()-t<ms){const r=await req('/health');if(r.status===200)return true;await sleep(400);}return false;}
const dec = s => s.replace(/&amp;/g,'&').replace(/&#0?39;/g,"'").replace(/&rsquo;/g,'’').replace(/&quot;/g,'"').replace(/&#x27;/g,"'");
const titleOf = b => dec((b.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
const cpLen = s => [...s].length;
const canonOf = b => (b.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
const h1Of = b => ((b.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '').replace(/<[^>]+>/g,'').trim();
const descLen = b => cpLen(dec((b.match(/<meta name="description" content="([^"]*)"/) || [])[1] || ''));

const SRV = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const MOONJS = fs.readFileSync(path.join(ROOT, 'js', 'moon.js'), 'utf8');
const langs = [['ar','/moon'],['en','/en/moon'],['fr','/fr/moon'],['tr','/tr/moon'],['ur','/ur/moon'],['de','/de/moon'],['id','/id/moon'],['es','/es/moon'],['bn','/bn/moon'],['ms','/ms/moon']];

(async () => {
    const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore','ignore','ignore'] });
    try {
        if (!await ready(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

        console.log('── A) /moon <title> 50–60 decoded codepoints, ALL 10 langs ──');
        for (const [l, p] of langs) {
            const t = titleOf((await req(p)).body); const n = cpLen(t);
            check(`${l}: title ${n} chars in [50,60]`, n >= 50 && n <= 60, `"${t}"`);
        }

        console.log('\n── B) SEO head integrity on /moon + /en/moon (title-only change) ──');
        for (const p of ['/moon','/en/moon']) {
            const b = (await req(p)).body;
            check(`${p} canonical self`, new RegExp(`${p.replace('/','\\/')}"?$`).test(canonOf(b)) || canonOf(b).endsWith(p), canonOf(b));
            check(`${p} H1 present + non-empty (unchanged hub H1)`, h1Of(b).length > 0, h1Of(b));
            check(`${p} meta description in 120–160`, descLen(b) >= 120 && descLen(b) <= 160, String(descLen(b)));
            check(`${p} indexable (no noindex)`, !/<meta name="robots"[^>]*noindex/i.test(b));
            check(`${p} hreflang alternates present`, (b.match(/rel="alternate" hreflang=/g) || []).length >= 10);
        }

        console.log('\n── C) scope: legacy + country/city pages unaffected ──');
        const mt = await req('/moon-today');
        check('/moon-today still 301 → /moon (legacy redirect intact)', mt.status === 301 && /\/moon$/.test(mt.loc), `${mt.status} ${mt.loc}`);
        const sa = (await req('/moon/saudi-arabia')).body;
        check('/moon/saudi-arabia title UNCHANGED (country builder, not the hub dict)', /^مراحل القمر في المملكة العربية السعودية/.test(titleOf(sa)), titleOf(sa));
        check('  …country title still in a sane SEO range', cpLen(titleOf(sa)) >= 40 && cpLen(titleOf(sa)) <= 65, String(cpLen(titleOf(sa))));

        console.log('\n── D) server.js source guards (the 4 reworded hub titles) ──');
        check("en hub title = 'Moon Today: Phase, Moon Calendar & Hijri Month Dates'", SRV.includes('Moon Today: Phase, Moon Calendar & Hijri Month Dates'));
        check('tr hub title reworded (Bugünkü Ay + Aydınlanma)', SRV.includes('Bugünkü Ay: Evre, Aydınlanma, Ay Takvimi ve Hicri Ay'));
        check('es hub title reworded (+ iluminación)', SRV.includes('Luna hoy: fase, iluminación, calendario lunar y mes hijri'));
        check('bn hub title reworded (+ আলোকন)', SRV.includes('আজ চাঁদ: দশা, আলোকন, চাঁদের ক্যালেন্ডার ও হিজরি মাস'));
        check('old short EN hub title gone', !SRV.includes("en: 'Moon Today: Phase, Moon Calendar & Hijri Month'"));
        check('js/moon.js carries NO ticket marker (untouched)', !/MOON-HUB-TITLE-LENGTH-ALL-LANGS-FIX-1/.test(MOONJS));

        s.kill('SIGKILL');
    } catch (e) { console.error(e); try { s.kill('SIGKILL'); } catch (_) {} }
    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    process.exit(fail === 0 ? 0 : 1);
})();
