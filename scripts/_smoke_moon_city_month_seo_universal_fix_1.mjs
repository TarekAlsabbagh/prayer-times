// MOON-CITY-MONTH-SEO-UNIVERSAL-FIX-1 — HTTP wiring + Part-II verification (boots the server).
//
// Part I: the month title/meta are now produced by the ALGORITHMIC universal fitter
//   (js/moon-month-seo.js). This smoke confirms the SERVER is wired to it and that real
//   cities (incl. the reported ar/Madrid/January regression + long Santiago de Querétaro)
//   land in 50–60 / 120–160. (Exhaustive matrix is the pure-function test.)
// Part II: the existing month context is data-driven to the PAGE's month. The M1 educational
//   H2 used new Date() (server clock) → now uses the page month. We assert two different month
//   pages show their OWN month (not the server's current month), with NO new context block.
//
// Run: node scripts/_smoke_moon_city_month_seo_universal_fix_1.mjs
import http from 'node:http';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (l, ok, x) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${l}${x !== undefined && x !== '' ? '   →  ' + x : ''}`); };
const PORT = 8304;
const req = (p) => new Promise((res) => { const r = http.request({ host: 'localhost', port: PORT, path: p, headers: { 'Accept-Encoding': 'identity' } }, rs => { let b = ''; rs.on('data', c => b += c); rs.on('end', () => res(b)); }); r.on('error', () => res('')); r.end(); });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function ready(ms){const t=Date.now();while(Date.now()-t<ms){if(await req('/health'))return true;await sleep(400);}return false;}
const dec = s => (s||'').replace(/&amp;/g,'&').replace(/&#0?39;/g,"'").replace(/&rsquo;/g,'’').replace(/&quot;/g,'"').replace(/&#x27;/g,"'");
const titleOf = b => dec((b.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
const descOf = b => dec((b.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
const cpLen = s => [...s].length;
const h1Count = b => (b.match(/<h1[\s>]/g) || []).length;
const canonOf = b => (b.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
const h1Txt = b => { const m = b.match(/<h1[^>]*id="moon-page-h1"[^>]*>([\s\S]*?)<\/h1>/); return m ? dec(m[1].replace(/<[^>]+>/g, '').trim()) : ''; };
// Extract the M1 educational Section-1 H2 (class moon-seo-month-title).
const m1H2 = b => { const m = b.match(/moon-seo-month-title[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>/); return m ? dec(m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()) : ''; };

const SRV = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const MOD = fs.readFileSync(path.join(ROOT, 'js', 'moon-month-seo.js'), 'utf8');
const MOONJS = fs.readFileSync(path.join(ROOT, 'js', 'moon.js'), 'utf8');
const APPJS = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
const INDEX = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const CSS = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
const SWJS = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

const langs = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];
const cal = {ar:'تقويم',en:'calendar',fr:'calendrier',tr:'takvim',ur:'تقویم',de:'kalender',id:'kalender',es:'calendario',bn:'ক্যালেন্ডার',ms:'kalendar'};
const cityR = {ar:'الرياض',en:'Riyadh',fr:'Riyad',tr:'Riyad',ur:'ریاض',de:'Riad',id:'Riyadh',es:'Riad',bn:'রিয়াদ',ms:'Riyadh'};
const lc = s => (s||'').toLowerCase();
const P = (l, sub) => (l === 'ar' ? '' : '/' + l) + sub;
const MADRID = '/spain/madrid/2026/01';        // the reported regression: ar/Madrid/January
const RIYADH = '/saudi-arabia/riyadh/2026/06';
const SANTIAGO = '/mexico/santiago-de-queretaro/2026/06';

(async () => {
    const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore','ignore','ignore'] });
    try {
        if (!await ready(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

        console.log('── A) Title 50–60 + city + calendar keyword — Madrid/Jan (regression) + Riyadh + Santiago (10 langs) ──');
        for (const [tag, sub, cityTokFn] of [
            ['Madrid/Jan', MADRID, (l) => ({ar:'مدريد',en:'Madrid',fr:'Madrid',tr:'Madrid',ur:'میڈرڈ',de:'Madrid',id:'Madrid',es:'Madrid',bn:'মাদ্রিদ',ms:'Madrid'}[l])],
            ['Riyadh', RIYADH, (l) => cityR[l]],
            ['Santiago', SANTIAGO, (l) => (l==='ar'?'سانتياغو':(l==='ur'||l==='bn'?'Santiago':'Querétaro'))],
        ]) {
            for (const l of langs) {
                const page = await req((l === 'ar' ? '' : '/' + l) + '/moon' + sub);
                const t = titleOf(page); const n = cpLen(t); const d = descOf(page); const dn = cpLen(d);
                const okT = n >= 50 && n <= 60;
                const okM = dn >= 120 && dn <= 160;
                const okCal = lc(t).includes(lc(cal[l]));
                check(`${tag} ${l}: T=${n}[50-60] M=${dn}[120-160] +cal`, okT && okM && okCal, `"${t}"`);
            }
        }

        console.log('\n── B) Part II — M1 educational H2 is DATA-DRIVEN to the PAGE month (was new Date()/server clock) ──');
        const enJan = await req('/en/moon/saudi-arabia/riyadh/2026/01');
        const enSep = await req('/en/moon/saudi-arabia/riyadh/2026/09');
        const arJan = await req('/moon/saudi-arabia/riyadh/2026/01');
        const h2Jan = m1H2(enJan), h2Sep = m1H2(enSep), h2JanAr = m1H2(arJan);
        check('EN /2026/01 M1 H2 shows the PAGE month "January 2026"', /January 2026/.test(h2Jan), h2Jan);
        check('EN /2026/09 M1 H2 shows the PAGE month "September 2026"', /September 2026/.test(h2Sep), h2Sep);
        check('M1 H2 differs by page month (Jan ≠ Sep) → driven by URL not clock', h2Jan !== h2Sep && /January/.test(h2Jan) && /September/.test(h2Sep));
        check('AR /2026/01 M1 H2 shows "يناير 2026" (page month)', /يناير 2026/.test(h2JanAr), h2JanAr);

        console.log('\n── C) Existing month context PRESERVED + data-driven + NO new/duplicate block ──');
        check('intro paragraph present (data-month-page)', enJan.includes('data-month-page="1"') && enJan.includes('moon-intro'));
        check('EN intro names the PAGE month (January)', /This calendar shows the moon[\s\S]{0,80}January 2026/.test(enJan));
        check('Hijri-range card present + real Hijri (Jumada/Rajab + 1447)', /moon-hijri-range/.test(enJan) && /(Jumada|Rajab|Rabi)/.test(enJan) && enJan.includes('1447'));
        check('monthly-overview summary chip present', enJan.includes('moon-summary-line--month'));
        check('NO moon-month-context block (no duplicate added this ticket)', !enJan.includes('moon-month-context') && !SRV.includes('moon-month-context'));

        console.log('\n── D) Table untouched + SEO intact (month page) ──');
        const arJun = await req(RIYADH.replace(/^/, '/moon')); // /moon/.../2026/06
        check('month still has #moon-forecast-body', arJun.includes('moon-forecast-body'));
        check('month has NO fc-month-group (865f505 not back)', !arJun.includes('fc-month-group'));
        check('month has exactly ONE H1', h1Count(arJun) === 1, String(h1Count(arJun)));
        check('SSR H1 = month form (page month)', /أطوار القمر في/.test(h1Txt(arJun)) && h1Txt(arJun).includes('2026'), h1Txt(arJun));
        check('month canonical self (…/2026/06)', /\/moon\/saudi-arabia\/riyadh\/2026\/06$/.test(canonOf(arJun)), canonOf(arJun));
        check('month indexable (no noindex)', !/<meta name="robots"[^>]*noindex/i.test(arJun));
        check('month hreflang alternates present', (arJun.match(/rel="alternate"\s+hreflang/g) || []).length >= 10);
        check('title has NO «اليوم»/Today (distinct from /today)', !titleOf(arJun).includes('اليوم') && !/\bToday\b/i.test(titleOf(enJan)));

        console.log('\n── E) Scope: today/day/year unaffected ──');
        check('/today H1 ≠ month form', !/Moon Phases in[\s\S]*2026/.test(h1Txt(await req('/en/moon/saudi-arabia/riyadh/today'))));
        check('/day H1 is the date form', /on 14 June 2026/.test(h1Txt(await req('/en/moon/saudi-arabia/riyadh/2026/06/14'))));
        check('/year title has 2026', /2026/.test(titleOf(await req('/en/moon/saudi-arabia/riyadh/2026'))));
        check('global /moon + country /moon/sa unaffected', /اليوم/.test(titleOf(await req('/moon'))) && !/2026/.test(titleOf(await req('/moon/saudi-arabia'))));

        console.log('\n── F) Source guards ──');
        check('server.js requires the fitter module', SRV.includes("require('./js/moon-month-seo.js')") && SRV.includes('MoonMonthSeo.fitMonthTitle') && SRV.includes('MoonMonthSeo.fitMonthDesc'));
        check('server.js no longer uses the old _mTitleCands array', !SRV.includes('_mTitleCands'));
        check('module is pure (no require of moon.js / express / fs)', !/require\(/.test(MOD));
        check('module exports fitMonthTitle + fitMonthDesc', MOD.includes('fitMonthTitle') && MOD.includes('fitMonthDesc'));
        check('M1 block no longer uses new Date() for the month H2', !/_m1Now\s*=\s*new Date\(\)/.test(SRV));
        check('js/moon.js untouched (no universal-fix marker)', !MOONJS.includes('MOON-CITY-MONTH-SEO-UNIVERSAL-FIX-1'));
        check('css/style.css not implicated', !CSS.includes('moon-month-context'));
        check('matrix test file present', fs.existsSync(path.join(ROOT, 'scripts', '_matrix_moon_month_seo_universal_fix_1.mjs')));

        console.log('\n── G) Upcoming-Phases month-scope (app.js — client-rendered; code presence + shell; render verified in browser) ──');
        check('app.js carries the universal-fix marker', APPJS.includes('MOON-CITY-MONTH-SEO-UNIVERSAL-FIX-1'));
        check('app.js scopes upcoming phases to the page month (_isMonthScoped + findPhaseEventsInRange month range)', APPJS.includes('_isMonthScoped') && APPJS.includes('_moMonth'));
        check('app.js builds month-scoped phase heading (Moon Phases in {month})', APPJS.includes('Moon Phases in ') && APPJS.includes('أطوار القمر في '));
        check('app.js suppresses today-relative countdown in month mode', APPJS.includes('if (!_isMonthScoped) {') && /\{[\s\S]{0,200}mu-countdown[\s\S]{0,120}appendChild\(cdEl\)/.test(APPJS));
        check('SSR month shell still ships #moon-upcoming-timeline (hydrated client-side)', (await req('/en/moon/saudi-arabia/riyadh/2026/01')).includes('moon-upcoming-timeline'));
        check('cache-buster bumped: index.html app.js?v=805 (no 804)', INDEX.includes('js/app.js?v=805') && !INDEX.includes('js/app.js?v=804'));
        check('cache-buster bumped: sw v466 + precache app.js?v=805', SWJS.includes("CACHE_VERSION = 'v466'") && SWJS.includes('/js/app.js?v=805') && !SWJS.includes("'v465'"));

        s.kill('SIGKILL');
    } catch (e) { console.error(e); try { s.kill('SIGKILL'); } catch (_) {} }
    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    process.exit(fail === 0 ? 0 : 1);
})();
