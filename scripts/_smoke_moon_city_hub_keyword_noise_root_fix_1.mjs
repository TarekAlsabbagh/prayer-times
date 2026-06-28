// MOON-CITY-HUB-KEYWORD-NOISE-ROOT-FIX-1 — verification (self-contained).
//
// On-Page SEO "Keyword Consistency" still flagged the city moon HUB because the VISIBLE 14-day moon
// forecast table (#moon-forecast-body, rendered CLIENT-SIDE in js/app.js) repeated the Gregorian
// month+year («يوليو 2026») AND the Hijri month+year («محرم 1448») in EVERY row (~14× each) plus a
// weekday per row → a rendering-based SEO tool counts those repeats as page keywords.
//
// Fix (js/app.js forecast loop, display only — NO moon.js/Meeus math change): emit the month+year
// ONCE per month-group heading row (`tr.fc-month-group`, «{gregMonth} {gregYear} · {hijriMonth}
// {hijriYear}»); day rows now carry a COMPACT weekday+day (Gregorian) + Hijri day NUMBER only, with
// the FULL date preserved in the link aria-label + a <time datetime> (accessibility — not visible
// text, no hidden keyword stuffing). title/meta/H1 unchanged; cache-buster bumped (app.js?v 803→804,
// sw CACHE_VERSION v464→v465). The forecast table is a SHARED component → the same de-noising applies
// wherever #moon-forecast-body renders (hub + /today + dated /day + /month); /year uses a separate
// server-rendered table (#page-moon-year) and is untouched.
//
// Browser DOM result (manually verified, documented in the PRE-PUSH report) — visible #page-moon
// token frequency on /moon/saudi-arabia/riyadh: محرم 16→4, 1448 16→4, يوليو 17→7, 2026 26→14;
// القمر 49 + الرياض 25 preserved. This file asserts the SOURCE-level fix + cache-buster + SSR shell.
//
// Run: node scripts/_smoke_moon_city_hub_keyword_noise_root_fix_1.mjs
import http from 'node:http';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (l, ok, x) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${l}${x !== undefined && x !== '' ? '   →  ' + x : ''}`); };
const PORT = 8302;
const req = (p) => new Promise((res) => { const r = http.request({ host: 'localhost', port: PORT, path: p, headers: { 'Accept-Encoding': 'identity' } }, rs => { let b = ''; rs.on('data', c => b += c); rs.on('end', () => res(b)); }); r.on('error', () => res('')); r.end(); });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function ready(ms){const t=Date.now();while(Date.now()-t<ms){if(await req('/health'))return true;await sleep(400);}return false;}
const dec = s => s.replace(/&amp;/g,'&').replace(/&#0?39;/g,"'").replace(/&rsquo;/g,'’').replace(/&quot;/g,'"').replace(/&#x27;/g,"'");
const titleOf = b => dec((b.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
const cpLen = s => [...s].length;

const APP   = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
const MOONJS= fs.readFileSync(path.join(ROOT, 'js', 'moon.js'), 'utf8');
const INDEX = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const SW    = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const MARK  = 'MOON-CITY-HUB-KEYWORD-NOISE-ROOT-FIX-1';

(async () => {
    console.log('── A) js/app.js — month-group de-noising present (display only) ──');
    check('ticket marker present in app.js', APP.includes(MARK));
    check('month-group heading row builder (tr.fc-month-group)', APP.includes('tr class="fc-month-group"'));
    check('month-group key tracked (_fcLastMK)', APP.includes('_fcLastMK'));
    check('group label = greg month/year · hijri month/year', /_grpLabel\s*=\s*_hjMonthName\s*\?/.test(APP) && APP.includes("_grpGreg + ' · ' + _hjMonthName"));
    check('compact day cell: _dayVis = weekday + day (no month/year)', APP.includes("const _dayVis = wd + ' ' + dd;"));
    check('full Gregorian date kept for aria-label (_dayFull = wd+dd+mm+yy)', APP.includes("const _dayFull = wd + ' ' + dd + ' ' + mm + ' ' + yy;"));
    check('day cell uses <time datetime=…> wrapper', /<time datetime="\$\{_dayIsoT\}"/.test(APP));
    check('day link carries aria-label="${_dayFull}"', APP.includes('aria-label="${_escHtml(_dayFull)}"'));
    check('compact hijri cell: hijriVis = String(hj.day)', APP.includes('const hijriVis = String(hj.day);'));
    check('hijri full text kept for aria-label (hijriText = day+month+year)', APP.includes("const hijriText = hj.day + ' ' + hMonthName + ' ' + hj.year;"));
    check('hijri month/year hoisted for the group heading (_hjMonthName/_hjYear)', APP.includes('_hjMonthName = hMonthName; _hjYear = hj.year;'));
    // the OLD always-full visible day cell text (`_dayText = wd+dd+mm+yy` then rendered raw) must be gone
    check('old full-date visible day cell removed (_dayText no longer the cell text)', !APP.includes("const _dayText = wd + ' ' + dd + ' ' + mm + ' ' + yy;"));

    console.log('\n── B) calc/data engine untouched (js/moon.js / Meeus) ──');
    check('js/moon.js carries NO ticket marker (math untouched)', !MOONJS.includes(MARK));
    check('app.js still consumes MoonCalc.getForecast (API unchanged)', APP.includes('MoonCalc.getForecast'));

    console.log('\n── C) cache-buster bumped + consistent (client asset changed) ──');
    const appVHits = (INDEX.match(/js\/app\.js\?v=804/g) || []).length;
    check('index.html references app.js?v=804 twice (preload + script)', appVHits === 2, 'count=' + appVHits);
    check('index.html has NO stale app.js?v=803', !INDEX.includes('app.js?v=803'));
    check('sw.js CACHE_VERSION = v465', /const CACHE_VERSION = 'v465';/.test(SW));
    check('sw.js precaches /js/app.js?v=804', SW.includes("'/js/app.js?v=804'"));
    check('sw.js has NO stale app.js?v=803', !SW.includes('app.js?v=803'));

    console.log('\n── D) SSR shell sanity (server boots; forecast body present; app.js?v=804 wired) ──');
    const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore','ignore','ignore'] });
    try {
        if (!await ready(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }
        const routes = [
            ['hub',   '/moon/saudi-arabia/riyadh'],
            ['today', '/moon/saudi-arabia/riyadh/today'],
            ['day',   '/moon/saudi-arabia/riyadh/2026/07/14'],
        ];
        for (const [name, p] of routes) {
            const b = await req(p);
            check(`${name}: served + references js/app.js?v=804`, b.length > 1000 && b.includes('js/app.js?v=804'), p);
            check(`${name}: ships empty #moon-forecast-body (client fills it)`, b.includes('id="moon-forecast-body"'));
        }
        // title/meta UNCHANGED by this ticket — hub still the cb996e4 keyword-consistency title (50-60, calendar+hijri)
        const tAr = titleOf(await req('/moon/saudi-arabia/riyadh'));
        const tEn = titleOf(await req('/en/moon/saudi-arabia/riyadh'));
        check('hub title unchanged: ar 50-60 + «تقويم» + «هجري»', cpLen(tAr) >= 50 && cpLen(tAr) <= 60 && tAr.includes('تقويم') && tAr.includes('هجري'), `T="${tAr}"`);
        check('hub title unchanged: en 50-60 + "Calendar" + "Hijri"', cpLen(tEn) >= 50 && cpLen(tEn) <= 60 && /calendar/i.test(tEn) && /hijri/i.test(tEn), `T="${tEn}"`);
        // /year uses a separate table (no #moon-forecast-body) → confirm this fix doesn't reach it
        const bYear = await req('/moon/saudi-arabia/riyadh/2026');
        check('/year does NOT ship #moon-forecast-body (separate table, unaffected)', !bYear.includes('id="moon-forecast-body"'));
        // hub still self-canonical + indexable (unchanged)
        check('hub canonical self + not noindex', /<link rel="canonical" href="[^"]*\/moon\/saudi-arabia\/riyadh"/.test(await req('/moon/saudi-arabia/riyadh')) && !/<meta name="robots"[^>]*noindex/.test(await req('/moon/saudi-arabia/riyadh')));
    } finally { s.kill('SIGKILL'); }

    console.log(`\n${fail === 0 ? '✅' : '❌'} ${MARK}: ${pass} passed, ${fail} failed`);
    process.exit(fail === 0 ? 0 : 1);
})();
