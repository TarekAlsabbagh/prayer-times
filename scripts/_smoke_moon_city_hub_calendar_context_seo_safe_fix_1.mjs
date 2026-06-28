// MOON-CITY-HUB-CALENDAR-CONTEXT-SEO-SAFE-FIX-1 — verification (self-contained).
//
// SEOptimer "Keyword Consistency" on the city moon HUB (/moon/{country}/{city}) was treating the
// forecast TABLE's date tokens (Muharram / July / 1448 / 2026 / weekday names) as if they were the
// page's main keywords. UX-safe fix (server.js only): inject a VISIBLE, localized, city-dynamic
// context block (H2 «Moon Calendar in {city}» + intro + H3 «Moon Phases by Hijri Month» + a short
// description) right BEFORE the forecast card — strengthening the real keywords (Moon Calendar /
// Moon Phases / Hijri Month / Moon Status / city) around the table WITHOUT touching the table.
// Hub-only (NOT today/month/day/year/country/global-hub). No app.js / index.html / CSS / cache-buster.
// The rejected 865f505 group-header table change is NOT reintroduced (no fc-month-group).
//
// Run: node scripts/_smoke_moon_city_hub_calendar_context_seo_safe_fix_1.mjs
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
const h1Count = b => (b.match(/<h1[\s>]/g) || []).length;
const canonOf = b => (b.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
const ID = 'id="moon-hub-calendar-context"';
// slice out just the injected block so token checks can't be satisfied by other page text
const ctxBlock = b => { const i = b.indexOf(ID); if (i < 0) return ''; const j = b.indexOf('</section>', i); return dec(b.slice(i, j < 0 ? i + 1200 : j)); };

const SRV = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const APPJS = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
const MOONJS = fs.readFileSync(path.join(ROOT, 'js', 'moon.js'), 'utf8');
const INDEX = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const CSS = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');

const langs = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];
// distinctive real-keyword tokens that must appear INSIDE the injected block, per lang
const hij    = {ar:'هجري',en:'Hijri',fr:'hégirien',tr:'Hicri',ur:'ہجری',de:'Hidschri',id:'Hijriah',es:'hijri',bn:'হিজরি',ms:'Hijrah'};
const phase  = {ar:'أطوار',en:'Moon Phases',fr:'phases de la Lune',tr:'Ay Evreleri',ur:'اطوار',de:'Mondphasen',id:'Fase Bulan',es:'Fases de la Luna',bn:'দশা',ms:'Fasa Bulan'};
const calTok = {ar:'تقويم القمر',en:'moon calendar',fr:'calendrier lunaire',tr:'Ay Takvimi',ur:'چاند کا تقویم',de:'Mondkalender',id:'Kalender Bulan',es:'calendario lunar',bn:'চাঁদের ক্যালেন্ডার',ms:'Kalendar Bulan'};
const cityTok= {ar:'الرياض',en:'Riyadh',fr:'Riyad',tr:'Riyad',ur:'ریاض',de:'Riad',id:'Riyadh',es:'Riad',bn:'রিয়াদ',ms:'Riyadh'};
const lc = s => s.toLowerCase();

(async () => {
    const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore','ignore','ignore'] });
    try {
        if (!await ready(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

        console.log('── A) context block present + localized real keywords + dynamic city (10 langs, hub /moon/saudi-arabia/riyadh) ──');
        for (const l of langs) {
            const b = await req((l === 'ar' ? '' : '/' + l) + '/moon/saudi-arabia/riyadh');
            const blk = ctxBlock(b);
            const ok = b.includes(ID)
                && lc(blk).includes(lc(calTok[l]))
                && blk.includes(hij[l])
                && lc(blk).includes(lc(phase[l]))
                && blk.includes(cityTok[l]);
            check(`${l}: block + calendar + hijri + phases + city`, ok, blk ? blk.slice(0,70).replace(/\s+/g,' ') : '(no block)');
        }

        console.log('\n── B) hub-only scope: block ABSENT on today/month/day/year/country/global-hub ──');
        check('/today  no context block', !(await req('/moon/saudi-arabia/riyadh/today')).includes(ID));
        check('/month (2026/07)  no context block', !(await req('/moon/saudi-arabia/riyadh/2026/07')).includes(ID));
        check('/day (2026/07/14)  no context block', !(await req('/moon/saudi-arabia/riyadh/2026/07/14')).includes(ID));
        check('/year (2026)  no context block', !(await req('/moon/saudi-arabia/riyadh/2026')).includes(ID));
        check('/moon global hub  no context block', !(await req('/moon')).includes(ID));
        check('/moon/saudi-arabia country  no context block', !(await req('/moon/saudi-arabia')).includes(ID));
        check('/en/today  no context block', !(await req('/en/moon/saudi-arabia/riyadh/today')).includes(ID));

        console.log('\n── C) the forecast TABLE is untouched (present; 865f505 group-header NOT reintroduced) ──');
        const sa = await req('/moon/saudi-arabia/riyadh');
        check('hub still has #moon-forecast card', sa.includes('id="moon-forecast"'));
        check('hub still has #moon-forecast-body (client-filled table)', sa.includes('id="moon-forecast-body"'));
        check('hub has NO fc-month-group (865f505 not back)', !sa.includes('fc-month-group'));
        check('block is placed BEFORE the forecast card', sa.indexOf(ID) < sa.indexOf('id="moon-forecast"') && sa.indexOf(ID) > -1);

        console.log('\n── D) title/meta/H1/canonical unchanged from cb996e4 (no «اليوم» on hub) ──');
        const arT = titleOf(sa), enT = titleOf(await req('/en/moon/saudi-arabia/riyadh'));
        check('AR hub title == cb996e4', arT === 'حالة القمر في الرياض | تقويم القمر وأطواره والشهر الهجري', arT);
        check('EN hub title == cb996e4', enT === 'Moon in Riyadh | Moon Calendar, Phase & Hijri Month', enT);
        check('AR hub title has NO «اليوم»', !arT.includes('اليوم'));
        check('EN hub title has NO "Today"', !/\bToday\b/i.test(enT));
        check('hub has exactly ONE H1 (block adds only H2/H3)', h1Count(sa) === 1, String(h1Count(sa)));
        check('hub canonical self', /\/moon\/saudi-arabia\/riyadh$/.test(canonOf(sa)), canonOf(sa));
        check('hub indexable (no noindex)', !/<meta name="robots"[^>]*noindex/i.test(sa));

        console.log('\n── E) dynamic city: short-name (Riyadh) vs long-name (Medina) ──');
        const med = await req('/moon/saudi-arabia/medina'); const medEn = await req('/en/moon/saudi-arabia/medina');
        check('AR Medina hub: block + city «المدينة المنورة»', med.includes(ID) && ctxBlock(med).includes('المدينة'), ctxBlock(med).slice(0,60).replace(/\s+/g,' '));
        check('EN Medina hub: block + city «Medina»', medEn.includes(ID) && ctxBlock(medEn).includes('Medina'), ctxBlock(medEn).slice(0,60).replace(/\s+/g,' '));

        console.log('\n── F) source guards: server.js-only change; no app.js/index.html/moon.js/CSS edits ──');
        check('server.js carries ticket marker', SRV.includes('MOON-CITY-HUB-CALENDAR-CONTEXT-SEO-SAFE-FIX-1'));
        check('server.js has hub-only guard _isCityHubOnly', SRV.includes('_isCityHubOnly'));
        check('server.js builds moon-hub-calendar-context', SRV.includes('moon-hub-calendar-context'));
        check('index.html NOT carrying the block (SSR-injected, not in template)', !INDEX.includes('moon-hub-calendar-context'));
        check('js/app.js untouched (no block id / marker)', !APPJS.includes('moon-hub-calendar-context') && !APPJS.includes('MOON-CITY-HUB-CALENDAR-CONTEXT-SEO-SAFE-FIX-1'));
        check('js/moon.js untouched (no marker)', !MOONJS.includes('MOON-CITY-HUB-CALENDAR-CONTEXT'));
        check('css/style.css unchanged (reuses .section-card, no new class)', !CSS.includes('moon-hub-calendar-context'));

        s.kill('SIGKILL');
    } catch (e) { console.error(e); try { s.kill('SIGKILL'); } catch (_) {} }
    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    process.exit(fail === 0 ? 0 : 1);
})();
