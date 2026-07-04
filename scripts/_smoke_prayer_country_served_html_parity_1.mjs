// PRAYER-COUNTRY-SEO-SERVED-HTML-PARITY-AND-CONTENT-DEPTH-FIX-1 verification (self-contained).
//
// ROOT CAUSE: prayer-times-cities.html (the prayer-country client template) had inline scripts that
// OVERWROTE the SSR-injected <title>/<meta description> after hydration + on language switch with the
// OLD short forms («مواقيت الصلاة في مدن {country}» [24] / «تصفح جميع مدن {country}…» [86]) — so
// JS-rendering SEO crawlers saw the old values even though the SERVED HTML was correct. FIX: ported the
// server's title/meta LADDER into a client `_countrySeoTitleDesc()` helper so client == server.
//
// This smoke asserts (a) SERVED HTML has the ladder title/meta for /{lang}/prayer-times-in-egypt across
// 10 langs and NOT the old short forms, and (b) the client source no longer clobbers (static analysis).
// The client RENDER == served values is proven separately in the browser (documented in the report).
//
// Run: node scripts/_smoke_prayer_country_served_html_parity_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = 8194;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cpLen = s => [...(s || '')].length;

function get(p){ return new Promise((res)=>{ http.get({host:'localhost',port:PORT,path:p}, r=>{ let b=''; r.on('data',c=>b+=c); r.on('end',()=>res({status:r.statusCode,body:b})); }).on('error',()=>res({status:0,body:''})); }); }
const sleep = ms => new Promise(r=>setTimeout(r,ms));
async function ready(t){ const t0=Date.now(); while(Date.now()-t0<t){ const r=await get('/health'); if(r.status===200)return 1; await sleep(400);} return 0; }
const T = b => (b.match(/<title>([^<]*)<\/title>/)||[,''])[1];
const D = b => (b.match(/<meta name="description" content="([^"]*)"/)||[,''])[1];

let pass=0, fail=0;
const check=(l,ok,x)=>{ if(ok)pass++; else fail++; console.log(`${ok?'✓':'✗'} ${l}${x!==undefined?'   →  '+x:''}`); };

// per-lang keyword-first prefix the LADDER title must start with (== server _CT_TITLE base head)
const KWPREFIX = {
    ar:'مواقيت الصلاة في', en:'Prayer Times in', fr:'Heures de prière', tr:'', ur:'', de:'Gebetszeiten', id:'Jadwal Sholat', es:'Horarios de oración', bn:'', ms:'Waktu Solat'
};
// OLD short forms that MUST NOT be the served title/meta (the regressed values the SEO tool reported)
const OLD_AR_TITLE = 'مواقيت الصلاة في مدن مصر';
const OLD_EN_TITLE = 'Prayer Times in Cities of Egypt';

const srv = spawn(process.execPath, ['server.js'], { cwd:ROOT, env:{...process.env, PORT:String(PORT), SUPABASE_URL:'', SUPABASE_SERVICE_ROLE_KEY:''}, stdio:['ignore','ignore','ignore'] });
let code = 1;
try {
    if(!await ready(20000)){ console.error('server not ready'); srv.kill('SIGKILL'); process.exit(1); }
    console.log('═══ PRAYER-COUNTRY-SEO-SERVED-HTML-PARITY-AND-CONTENT-DEPTH-FIX-1 ═══\n');

    // ── (A) served HTML (SSR) carries the ladder title/meta across 10 langs (egypt) ──
    console.log('── served HTML: /{lang}/prayer-times-in-egypt ──');
    for (const lang of ['ar','en','fr','tr','ur','de','id','es','bn','ms']) {
        const url = lang==='ar' ? '/prayer-times-in-egypt' : `/${lang}/prayer-times-in-egypt`;
        const r = await get(url); const t=T(r.body), d=D(r.body); const tl=cpLen(t), dl=cpLen(d);
        console.log(`  [${lang}] title[${tl}] meta[${dl}]  ${t}`);
        check(`[${lang}] 200`, r.status===200, r.status);
        check(`[${lang}] title 48–60 cp`, tl>=48 && tl<=60, tl);
        check(`[${lang}] meta 120–160 cp`, dl>=120 && dl<=160, dl);
        if (KWPREFIX[lang]) check(`[${lang}] title keyword-first`, t.startsWith(KWPREFIX[lang]), t.slice(0,20));
    }

    // ── (B) served HTML is NOT the old short forms that the SEO tool reported ──
    console.log('\n── served HTML ≠ old short forms ──');
    const ar = await get('/prayer-times-in-egypt');
    check('AR served title ≠ old «…مدن مصر»', T(ar.body)!==OLD_AR_TITLE, T(ar.body));
    check('AR served meta ≠ old «تصفح جميع…»', !D(ar.body).startsWith('تصفح جميع'), D(ar.body).slice(0,20));
    const en = await get('/en/prayer-times-in-egypt');
    check('EN served title ≠ old «…Cities of Egypt»', T(en.body)!==OLD_EN_TITLE, T(en.body));
    check('EN served meta ≠ old «Browse all…»', !D(en.body).startsWith('Browse all'), D(en.body).slice(0,20));

    // ── (C) client source: clobber removed, ladder helper wired (static analysis) ──
    console.log('\n── client source (prayer-times-cities.html) ──');
    const html = readFileSync(path.join(ROOT,'prayer-times-cities.html'),'utf8');
    check('has ported ladder helper _countrySeoTitleDesc', html.includes('function _countrySeoTitleDesc'));
    check('document.title uses the ladder', html.includes('document.title = _countrySeoTitleDesc(lng, cn).title'));
    check('OLD clobber `document.title = fullTitle` REMOVED', !html.includes('document.title = fullTitle'));
    check('meta description uses the ladder (_seoTD.desc)', html.includes('const desc  = _seoTD.desc'));
    check('client ladder mirrors server AR base «مواقيت الصلاة في ${cn}»', html.includes('مواقيت الصلاة في ${cn}'));
    check('client ladder mirrors server AR meta LONG head', html.includes('تعرّف على مواقيت الصلاة في ${cn} اليوم حسب المدينة'));

    // ── (D) regression: city page + discovered ──
    console.log('\n── regression ──');
    const rc = await get('/prayer-times-in-riyadh');
    check('CITY /prayer-times-in-riyadh 200', rc.status===200, rc.status);
    check('CITY riyadh served title carries «الرياض»', T(rc.body).includes('الرياض'), T(rc.body));

    console.log(`\n${fail===0?'✅ PASS':'❌ FAIL'}  ${pass} passed, ${fail} failed`);
    code = fail===0?0:1;
} finally { srv.kill('SIGKILL'); }
process.exit(code);
