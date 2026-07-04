// COUNTRY-COVERAGE-AUDIT-AND-MISSING-COUNTRY-SLUGS-FIX-1 verification (self-contained).
//
// Root cause fixed: 16 missing UN sovereign states (cv, by, md, hn, ni, sv, na, bw, ga, cg, cf,
// bi, ls, gw, gq, sz) were absent from COUNTRY_NAMES_EN → makeCountrySlugSrv(cc) returned '' →
// discovered cities in those countries (e.g. Praia/cv) 404'd on ALL moon routes (flat + nested).
// After adding them to the 10 country-name maps, makeCountrySlugSrv('cv')='cape-verde' → the moon
// nested/flat routes resolve. Country hubs (/moon/{slug}, gated on curated cities) STAY 404 for
// these zero-city countries, and they never enter the sitemap → no thin indexable page introduced.
//
// Spawns `node server.js` with Supabase DISABLED + the inert test seam (DISCOVERED_SSR_TEST_FIXTURE).
// Run: node scripts/_smoke_country_coverage_missing_slugs_fix_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = 8113;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Praia = discovered city in cv (a NEWLY-added country). abu-hardub = discovered in sy (an already
// -supported country, regression control). Both have names.ar so the moon title carries the AR name.
const FIXTURE = {
    'praia':      { slug:'praia',      lat:14.9218, lng:-23.5087, timezone:'Atlantic/Cape_Verde', country_code:'cv', type:'city', names:{ ar:'برايا', en:'Praia' } },
    'abu-hardub': { slug:'abu-hardub', lat:35.0223, lng:40.4392,  timezone:'Asia/Damascus',       country_code:'sy', type:'city', names:{ ar:'أبو حردوب', en:'Abu Hardoub' } }
};

const dir = mkdtempSync(path.join(tmpdir(), 'cc-cov-'));
const fixturePath = path.join(dir, 'fixture.json');
writeFileSync(fixturePath, JSON.stringify(FIXTURE), 'utf8');

function get(p, depth){return new Promise((res)=>{http.get({host:'localhost',port:PORT,path:p},r=>{
    if([301,302,307,308].includes(r.statusCode) && r.headers.location && (depth||0)<3){ r.resume(); const loc=r.headers.location.replace(/^https?:\/\/[^/]+/,''); return res(get(loc,(depth||0)+1)); }
    let b='';r.on('data',c=>b+=c);r.on('end',()=>res({status:r.statusCode,body:b}));
}).on('error',()=>res({status:0,body:''}));});}
// no-follow variant to inspect the 301 target
function head(p){return new Promise((res)=>{http.get({host:'localhost',port:PORT,path:p},r=>{r.resume();res({status:r.statusCode,location:(r.headers.location||'').replace(/^https?:\/\/[^/]+/,'')});}).on('error',()=>res({status:0,location:''}));});}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function waitReady(t){const t0=Date.now();while(Date.now()-t0<t){const r=await get('/health');if(r.status===200)return true;await sleep(400);}return false;}
let pass=0,fail=0;
const check=(l,ok,x)=>{if(ok)pass++;else fail++;console.log(`${ok?'✓':'✗'} ${l}${x!==undefined?'   →  '+x:''}`);};
function meta(b){return{title:(b.match(/<title>([^<]*)<\/title>/)||[,''])[1],robots:(b.match(/name="robots" content="([^"]*)"/)||[,''])[1],canon:((b.match(/rel="canonical" href="([^"]*)"/)||[,''])[1]).replace(/^https?:\/\/[^/]+/,'')};}

const srv = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(PORT), DISCOVERED_SSR_TEST_FIXTURE: fixturePath, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' },
    stdio: ['ignore','ignore','ignore']
});
let exitCode = 1;
try {
    if (!await waitReady(20000)) { console.error('✗ server not ready :'+PORT); srv.kill('SIGKILL'); process.exit(1); }
    console.log('═══ COUNTRY-COVERAGE-AUDIT-AND-MISSING-COUNTRY-SLUGS-FIX-1 ═══');

    // ── THE FIX: Praia (cv) moon routes now resolve instead of 404 ──
    console.log('\n── Praia / Cape Verde (cv) moon routes ──');
    const pf = await head('/moon-today-in-praia');
    check('flat /moon-today-in-praia 301→nested cape-verde', pf.status===301 && pf.location==='/moon/cape-verde/praia/today', pf.status+' '+pf.location);
    const pn = await get('/moon-today-in-praia'); const pnm = meta(pn.body);
    check('flat /moon-today-in-praia resolves 200 (was 404)', pn.status===200, pn.status);
    check('  → canonical /moon/cape-verde/praia/today', pnm.canon==='/moon/cape-verde/praia/today', pnm.canon);
    check('  → index (praia is now CURATED after BATCH-1-AND-BATCH-2)', /(^|,)index,follow/.test(pnm.robots), pnm.robots);
    check('  → title carries برايا', pnm.title.includes('برايا'), pnm.title);
    check('  → body carries country الرأس الأخضر', pn.body.includes('الرأس الأخضر'));
    const pd = await get('/moon/cape-verde/praia/today'); const pdm = meta(pd.body);
    check('nested /moon/cape-verde/praia/today = 200 (direct)', pd.status===200, pd.status);
    check('  → index + self-canonical (praia curated)', /(^|,)index,follow/.test(pdm.robots) && pdm.canon==='/moon/cape-verde/praia/today', pdm.robots+' '+pdm.canon);
    const ph = await get('/moon-in-praia');
    check('/moon-in-praia (hub) resolves 200 (was 404)', ph.status===200, ph.status);

    // ── Cape Verde country hub stays 404 (gated, 0 curated cities) — NO thin page ──
    console.log('\n── Cape Verde country hub gated (no curated cities) ──');
    const mcv = await get('/moon/cape-verde');
    check('/moon/cape-verde = 200 (now HAS curated cities after BATCH-1-AND-BATCH-2)', mcv.status===200, mcv.status);

    // ── Prayer country page for cv: now a proper country page (was city «كيب verde») ──
    console.log('\n── /prayer-times-in-cape-verde country page ──');
    const pcv = await get('/prayer-times-in-cape-verde'); const pcvm = meta(pcv.body);
    check('AR /prayer-times-in-cape-verde title = «…مدن الرأس الأخضر…»', pcvm.title.includes('الرأس الأخضر'), pcvm.title);
    check('AR title is NOT the half-transliterated «كيب verde»', !pcvm.title.includes('verde'), pcvm.title);
    const pcvEn = await get('/en/prayer-times-in-cape-verde'); const pcvEnm = meta(pcvEn.body);
    check('EN /en/prayer-times-in-cape-verde = «Prayer Times in Cities of Cape Verde»', pcvEnm.title.includes('Cape Verde'), pcvEnm.title);

    // ── Praia flat city routes unchanged (200 noindex برايا) ──
    console.log('\n── Praia prayer/qibla/next/time-left unchanged ──');
    for (const [p,label] of [['/prayer-times-in-praia','prayer'],['/qibla-in-praia','qibla'],['/next-prayer-in-praia','next-prayer'],['/time-left-until-next-prayer-in-praia','time-left']]) {
        const r = await get(p); const m = meta(r.body);
        check(`${label} 200 + index + برايا (curated)`, r.status===200 && /(^|,)index,follow/.test(m.robots) && m.title.includes('برايا'), r.status+' '+m.robots+' '+m.title.slice(0,28));
    }
    const legacy = await get('/time-left-for-prayer-in-praia');
    check('legacy /time-left-for-prayer-in-praia = 404 (never generated)', legacy.status===404, legacy.status);

    // ── Another new country resolves its slug; hub still gated ──
    console.log('\n── new country slug sanity (Namibia/na) ──');
    const pna = await get('/prayer-times-in-namibia'); const pnam = meta(pna.body);
    check('AR /prayer-times-in-namibia country page = «…ناميبيا…»', pnam.title.includes('ناميبيا'), pnam.title);
    const mna = await get('/moon/namibia');
    check('/moon/namibia = 200 (now HAS curated cities after BATCH-1-AND-BATCH-2)', mna.status===200, mna.status);

    // ── REGRESSION: curated + already-supported-country discovered unchanged ──
    console.log('\n── regression: curated + supported-country discovered ──');
    const rc = await get('/prayer-times-in-riyadh'); const rcm = meta(rc.body);
    check('curated /prayer-times-in-riyadh 200 + index', rc.status===200 && /(^|,)index/.test(rcm.robots), rc.status+' '+rcm.robots);
    const rm = await get('/moon/saudi-arabia');
    check('curated /moon/saudi-arabia 200 (has curated cities)', rm.status===200, rm.status);
    const rmc = await get('/moon/saudi-arabia/riyadh/today'); const rmcm = meta(rmc.body);
    check('curated /moon/saudi-arabia/riyadh/today 200 + index', rmc.status===200 && /(^|,)index/.test(rmcm.robots), rmc.status+' '+rmcm.robots);
    const ah = await head('/moon-today-in-abu-hardub');
    check('sy discovered /moon-today-in-abu-hardub 301→/moon/syria/… (unchanged)', ah.status===301 && ah.location==='/moon/syria/abu-hardub/today', ah.status+' '+ah.location);

    console.log(`\n${fail===0?'✅ PASS':'❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail===0?0:1;
} finally { srv.kill('SIGKILL'); }
process.exit(exitCode);
