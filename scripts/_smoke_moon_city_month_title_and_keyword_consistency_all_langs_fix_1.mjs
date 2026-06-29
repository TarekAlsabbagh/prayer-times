// MOON-CITY-MONTH-TITLE-AND-KEYWORD-CONSISTENCY-ALL-LANGS-FIX-1 — verification (self-contained).
//
// Month page /moon/{country}/{city}/{YYYY}/{MM}: (1) adaptive title ladder so EVERY lang/city lands
// in 50–60 (long cities like Santiago de Querétaro were 68); meta kept 120–160. (2) H1 hydration fix
// in js/app.js so the post-hydration H1 stays the MONTH form (was overwritten with the "today" form);
// SSR H1 is the month form here. The redundant SSR context block (an earlier attempt) was REMOVED per
// user decision — the month page ALREADY ships a rich month context (Hijri-range card + month intro +
// month/phase headings) from prior tickets; we keep ONE natural context, no duplication / stuffing.
// Table untouched (no fc-month-group; 865f505 not reintroduced).
//
// Run: node scripts/_smoke_moon_city_month_title_and_keyword_consistency_all_langs_fix_1.mjs
import http from 'node:http';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (l, ok, x) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${l}${x !== undefined && x !== '' ? '   →  ' + x : ''}`); };
const PORT = 8303;
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

const SRV = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const APPJS = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
const MOONJS = fs.readFileSync(path.join(ROOT, 'js', 'moon.js'), 'utf8');
const INDEX = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const CSS = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');

const langs = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];
const cal = {ar:'تقويم',en:'calendar',fr:'calendrier',tr:'takvim',ur:'تقویم',de:'kalender',id:'kalender',es:'calendario',bn:'ক্যালেন্ডার',ms:'kalendar'};
const cityR = {ar:'الرياض',en:'Riyadh',fr:'Riyad',tr:'Riyad',ur:'ریاض',de:'Riad',id:'Riyadh',es:'Riad',bn:'রিয়াদ',ms:'Riyadh'};
const lc = s => (s||'').toLowerCase();
const MROOT = '/moon/saudi-arabia/riyadh/2026/06';
const MLONG = '/moon/mexico/santiago-de-queretaro/2026/06';

(async () => {
    const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore','ignore','ignore'] });
    try {
        if (!await ready(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

        console.log('── A) month TITLE 50–60 + city + calendar keyword (10 langs × short+long city) ──');
        for (const l of langs) {
            for (const [tag, base, cityTok] of [['Riyadh', MROOT, cityR[l]], ['Santiago', MLONG, (l==='ar'?'سانتياغو':(l==='ur'||l==='bn'?'Santiago':'Querétaro'))]]) {
                const t = titleOf(await req((l === 'ar' ? '' : '/' + l) + base)); const n = cpLen(t);
                const ok = n >= 50 && n <= 60 && lc(t).includes(lc(cal[l])) && t.includes(cityTok);
                check(`${l}/${tag}: T=${n}[50-60] +city +calendar`, ok, `"${t}"`);
            }
        }

        console.log('\n── B) month META 120–160 (10 langs × short+long city) ──');
        for (const l of langs) {
            for (const [tag, base] of [['Riyadh', MROOT], ['Santiago', MLONG]]) {
                const d = descOf(await req((l === 'ar' ? '' : '/' + l) + base)); const n = cpLen(d);
                check(`${l}/${tag}: M=${n}[120-160]`, n >= 120 && n <= 160, d.slice(0,55)+'…');
            }
        }

        // MOON-CITY-MONTH-KEYWORD-CONSISTENCY-DATA-DRIVEN-CONTEXT-1 (2026-06-29): a SINGLE data-driven
        // month-context block (phases + Hijri months) is now expected on every month page (server-side;
        // index.html/css guards below confirm it is NOT a template/CSS change).
        console.log('\n── C) data-driven moon-month-context present on month pages (1 per page) ──');
        check('server.js builds moon-month-context (data-driven)', SRV.includes('moon-month-context'));
        for (const l of ['', '/en', '/fr', '/tr']) {
            const _mc = (await req(l + MROOT));
            check(`${l || '/ar'} month page has exactly one moon-month-context`, (_mc.split('id="moon-month-context"').length - 1) === 1);
        }

        console.log('\n── D) the EXISTING month context survives (data-driven Hijri span present) ──');
        const arMp = await req(MROOT), enMp = await req('/en' + MROOT);
        check('AR month page shows the Hijri span (محرم + 1448)', /محرم/.test(arMp) && arMp.includes('1448'));
        check('EN month page shows the Hijri span (Muharram + 1448)', /Muharram/.test(enMp) && enMp.includes('1448'));
        check('EN month page keeps a calendar/phase heading', /Moon (phase )?[Cc]alendar/.test(enMp) || /Moon Phases/.test(enMp));

        console.log('\n── E) SSR H1 = month form (NOT today) ──');
        check('AR month SSR H1 «أطوار القمر… 2026»', /أطوار القمر في/.test(h1Txt(arMp)) && h1Txt(arMp).includes('2026') && !h1Txt(arMp).includes('اليوم'), h1Txt(arMp));
        check('EN month SSR H1 «Moon Phases in … 2026»', /Moon Phases in/.test(h1Txt(enMp)) && h1Txt(enMp).includes('2026') && !/\bToday\b/i.test(h1Txt(enMp)), h1Txt(enMp));
        check('js/app.js carries the month-H1 hydration fix (marker + #moon-page-h1)', APPJS.includes('MOON-CITY-MONTH-TITLE-AND-KEYWORD-CONSISTENCY-ALL-LANGS-FIX-1') && APPJS.includes('moon-page-h1'));

        console.log('\n── F) table untouched + SEO intact (month page) ──');
        // MOON-CITY-MONTH-REMOVE-14DAY-TABLE-ADD-MONTH-SUMMARY-1 (2026-06-29): the 14-day forecast is
        // removed on month pages (kept on /today) and replaced by #moon-month-stats.
        check('month: 14-day forecast removed (kept on /today)', !arMp.includes('id="moon-forecast"'));
        check('month: #moon-month-stats present (replacement)', arMp.includes('id="moon-month-stats"'));
        check('month has NO fc-month-group (865f505 not back)', !arMp.includes('fc-month-group'));
        check('month has exactly ONE H1', h1Count(arMp) === 1, String(h1Count(arMp)));
        check('month canonical self (…/2026/06)', /\/moon\/saudi-arabia\/riyadh\/2026\/06$/.test(canonOf(arMp)), canonOf(arMp));
        check('month indexable (no noindex)', !/<meta name="robots"[^>]*noindex/i.test(arMp));
        check('month title has NO «اليوم»/Today (distinct from /today)', !titleOf(arMp).includes('اليوم') && !/\bToday\b/i.test(titleOf(enMp)));

        console.log('\n── G) scope: SSR H1 of today/day/year is NOT the month form (untouched) ──');
        check('/today SSR H1 ≠ month form', !/Moon Phases in[\s\S]*2026/.test(h1Txt(await req('/en/moon/saudi-arabia/riyadh/today'))));
        check('/day SSR H1 is the date form', /on 14 June 2026/.test(h1Txt(await req('/en/moon/saudi-arabia/riyadh/2026/06/14'))));
        check('/year page unaffected (title has 2026)', /2026/.test(titleOf(await req('/en/moon/saudi-arabia/riyadh/2026'))));
        check('global /moon + country /moon/sa unaffected', /اليوم/.test(titleOf(await req('/moon'))) && !/2026/.test(titleOf(await req('/moon/saudi-arabia'))));

        console.log('\n── H) source guards ──');
        // MOON-CITY-MONTH-SEO-UNIVERSAL-FIX-1 superseded the hand-tuned _mTitleCands arrays with the
        // algorithmic fitter module (js/moon-month-seo.js). The title stays adaptive 50-60 (asserted above).
        check('server.js month title is adaptive via the universal fitter module', SRV.includes("require('./js/moon-month-seo.js')") && SRV.includes('MoonMonthSeo.fitMonthTitle'));
        check('js/moon.js untouched (no marker)', !MOONJS.includes('MOON-CITY-MONTH-TITLE-AND-KEYWORD-CONSISTENCY'));
        check('index.html does NOT carry moon-month-context', !INDEX.includes('moon-month-context'));
        check('css/style.css does NOT carry moon-month-context', !CSS.includes('moon-month-context'));
        // MOON-CITY-MONTH-SEO-UNIVERSAL-FIX-1 bumped app.js?v 804→805 (Upcoming-Phases month-scope fix).
        check('index.html cache-buster ≥ app.js?v=805 (current)', INDEX.includes('js/app.js?v=805') && !INDEX.includes('js/app.js?v=804'));

        s.kill('SIGKILL');
    } catch (e) { console.error(e); try { s.kill('SIGKILL'); } catch (_) {} }
    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    process.exit(fail === 0 ? 0 : 1);
})();
