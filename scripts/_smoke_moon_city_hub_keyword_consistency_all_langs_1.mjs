// MOON-CITY-HUB-KEYWORD-CONSISTENCY-ALL-LANGS-1 — verification (self-contained).
//
// On-Page SEO "Keyword Consistency" flagged /moon/{country}/{city} (the no-date city moon HUB):
// the content/headings carried moon-calendar + phase + Hijri-month + city, but the TITLE+META omitted
// «الشهر الهجري / Hijri month» and used an inconsistent calendar term («تقويم الأطوار» / "Lunar Calendar"
// vs H1's «تقويم القمر» / "Moon Calendar"). Fix (server.js _MOON_HUB_TITLE_FORMS + _MOON_HUB_DESC_FORMS,
// 10 langs): foreground moon-calendar + phase + Hijri-month + city in title (illumination → meta only),
// align the calendar term, and weave Hijri-month into the meta. Per user decision (Option 1) the hub
// title keeps NO «اليوم»/today → stays distinct from the /today page. Length ladders still _fit to
// 50–60 (title) / 120–160 (meta). No design/H1/canonical/route change.
//
// Run: node scripts/_smoke_moon_city_hub_keyword_consistency_all_langs_1.mjs
import http from 'node:http';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (l, ok, x) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${l}${x !== undefined && x !== '' ? '   →  ' + x : ''}`); };
const PORT = 8301;
const req = (p) => new Promise((res) => { const r = http.request({ host: 'localhost', port: PORT, path: p, headers: { 'Accept-Encoding': 'identity' } }, rs => { let b = ''; rs.on('data', c => b += c); rs.on('end', () => res(b)); }); r.on('error', () => res('')); r.end(); });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function ready(ms){const t=Date.now();while(Date.now()-t<ms){if(await req('/health'))return true;await sleep(400);}return false;}
const dec = s => s.replace(/&amp;/g,'&').replace(/&#0?39;/g,"'").replace(/&rsquo;/g,'’').replace(/&quot;/g,'"').replace(/&#x27;/g,"'");
const titleOf = b => dec((b.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
const descOf = b => dec((b.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
const cpLen = s => [...s].length;
const h1Count = b => (b.match(/<h1[\s>]/g) || []).length;
const canonOf = b => (b.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';

const SRV = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const MOONJS = fs.readFileSync(path.join(ROOT, 'js', 'moon.js'), 'utf8');
const langs = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];
const cal = {ar:'تقويم',en:'calendar',fr:'calendrier',tr:'takvim',ur:'تقویم',de:'kalender',id:'kalender',es:'calendario',bn:'পঞ্জিকা',ms:'kalendar'};
const hij = {ar:'هجري',en:'hijri',fr:'hégirien',tr:'hicri',ur:'ہجری',de:'hidschri',id:'hijriah',es:'hijri',bn:'হিজরি',ms:'hijrah'};
const cityTok = {ar:'الرياض',en:'Riyadh',fr:'Riyad',tr:'Riyad',ur:'ریاض',de:'Riad',id:'Riyadh',es:'Riad',bn:'রিয়াদ',ms:'Riyadh'};

(async () => {
    const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore','ignore','ignore'] });
    try {
        if (!await ready(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

        console.log('── A) city-hub title/meta keyword consistency (10 langs, /moon/saudi-arabia/riyadh) ──');
        for (const l of langs) {
            const b = await req((l === 'ar' ? '' : '/' + l) + '/moon/saudi-arabia/riyadh');
            const t = titleOf(b), d = descOf(b); const tn = cpLen(t), dn = cpLen(d);
            const blob = (t + ' ' + d).toLowerCase();
            const ok = tn >= 50 && tn <= 60 && dn >= 120 && dn <= 160
                && blob.includes(cal[l].toLowerCase()) && blob.includes(hij[l].toLowerCase())
                && t.includes(cityTok[l]);
            check(`${l}: T=${tn}[50-60] M=${dn}[120-160] +calendar +hijri +city`, ok, `T="${t}"`);
        }

        console.log('\n── B) hub↔today differentiation (city HUB has NO «اليوم»/today; /today page DOES) ──');
        const arHub = titleOf(await req('/moon/saudi-arabia/riyadh'));
        const arToday = titleOf(await req('/moon/saudi-arabia/riyadh/today'));
        const enHub = titleOf(await req('/en/moon/saudi-arabia/riyadh'));
        const enToday = titleOf(await req('/en/moon/saudi-arabia/riyadh/today'));
        check('AR city-hub title has NO «اليوم»', !arHub.includes('اليوم'), arHub);
        check('AR /today title HAS «اليوم» (still distinct)', arToday.includes('اليوم'), arToday);
        check('EN city-hub title has NO "Today"', !/\bToday\b/i.test(enHub), enHub);
        check('EN /today title HAS "Today"', /\bToday\b/i.test(enToday), enToday);

        console.log('\n── C) one H1 + canonical self + indexable (city hub) ──');
        const sa = await req('/moon/saudi-arabia/riyadh');
        check('city-hub has exactly ONE H1', h1Count(sa) === 1, String(h1Count(sa)));
        check('city-hub canonical self', /\/moon\/saudi-arabia\/riyadh$/.test(canonOf(sa)), canonOf(sa));
        check('city-hub indexable (no noindex)', !/<meta name="robots"[^>]*noindex/i.test(sa));

        console.log('\n── D) scope: hub / country / today / year UNCHANGED ──');
        check('global /moon hub title unchanged (keeps «اليوم» — different page)', /^حالة القمر اليوم: طور القمر وتقويم القمر والشهر الهجري$/.test(titleOf(await req('/moon'))));
        check('country /moon/saudi-arabia title unchanged', /^مراحل القمر في المملكة العربية السعودية/.test(titleOf(await req('/moon/saudi-arabia'))));
        check('year page title unchanged (has 2026)', /2026/.test(titleOf(await req('/moon/saudi-arabia/riyadh/2026'))));

        console.log('\n── E) source guards ──');
        check('server.js en city-hub longer = Moon Calendar, Phase & Hijri Month', SRV.includes('Moon in ${c} | Moon Calendar, Phase & Hijri Month'));
        check('server.js ar city-hub longer carries الشهر الهجري', SRV.includes('حالة القمر في ${c} | تقويم القمر وأطواره والشهر الهجري'));
        check('server.js en meta carries "through the Hijri month"', SRV.includes('through the Hijri month'));
        check('old inconsistent EN "Lunar Calendar" hub title gone', !SRV.includes('Moon in ${c} | Moon Phase, Illumination and Lunar Calendar'));
        check('js/moon.js carries NO ticket marker (untouched)', !/MOON-CITY-HUB-KEYWORD-CONSISTENCY-ALL-LANGS-1/.test(MOONJS));

        s.kill('SIGKILL');
    } catch (e) { console.error(e); try { s.kill('SIGKILL'); } catch (_) {} }
    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    process.exit(fail === 0 ? 0 : 1);
})();
