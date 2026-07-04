// COUNTRY-AND-CITIES-COVERAGE-BATCH-1-AND-BATCH-2-FIX-1 verification.
//
// BATCH-2: 21 small island/Pacific states added to the 10 country-name maps.
// CITIES: 116 curated cities (capital + majors, GeoNames-verified coords/tz, hand-authored Arabic)
//   added to curated-places.json for all 37 BATCH-1+BATCH-2 countries → country grids non-empty,
//   city/prayer/qibla/moon routes resolve. Praia is now CURATED (index) instead of discovered.
//
// Spawns `node server.js` with Supabase DISABLED + fixture (abu-hardub) for the discovered control.
// Run: node scripts/_smoke_country_and_cities_coverage_batch12_fix_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = 8123;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE = { 'abu-hardub': { slug:'abu-hardub', lat:35.02, lng:40.44, timezone:'Asia/Damascus', country_code:'sy', type:'city', names:{ ar:'أبو حردوب', en:'Abu Hardoub' } } };
const dir = mkdtempSync(path.join(tmpdir(), 'cc-cities-'));
const fixturePath = path.join(dir, 'fixture.json');
writeFileSync(fixturePath, JSON.stringify(FIXTURE), 'utf8');

function get(p, depth){return new Promise((res)=>{http.get({host:'localhost',port:PORT,path:p},r=>{
    if([301,302,307,308].includes(r.statusCode) && r.headers.location && (depth||0)<3){ r.resume(); const loc=r.headers.location.replace(/^https?:\/\/[^/]+/,''); return res(get(loc,(depth||0)+1)); }
    let b='';r.on('data',c=>b+=c);r.on('end',()=>res({status:r.statusCode,body:b}));
}).on('error',()=>res({status:0,body:''}));});}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function waitReady(t){const t0=Date.now();while(Date.now()-t0<t){const r=await get('/health');if(r.status===200)return true;await sleep(400);}return false;}
let pass=0,fail=0;
const check=(l,ok,x)=>{if(ok)pass++;else fail++;console.log(`${ok?'✓':'✗'} ${l}${x!==undefined?'   →  '+x:''}`);};
function meta(b){return{title:(b.match(/<title>([^<]*)<\/title>/)||[,''])[1],robots:(b.match(/name="robots" content="([^"]*)"/)||[,''])[1],canon:((b.match(/rel="canonical" href="([^"]*)"/)||[,''])[1]).replace(/^https?:\/\/[^/]+/,'')};}
const cityLinks=b=>(b.match(/class="city-link"/g)||[]).length;
const isIndex=r=>/(^|,)index,follow/.test(r);
const isNoindex=r=>/noindex/.test(r);

const srv = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT:String(PORT), DISCOVERED_SSR_TEST_FIXTURE:fixturePath, SUPABASE_URL:'', SUPABASE_SERVICE_ROLE_KEY:'' }, stdio:['ignore','ignore','ignore'] });
let exitCode = 1;
try {
    if (!await waitReady(20000)) { console.error('✗ not ready'); srv.kill('SIGKILL'); process.exit(1); }
    console.log('═══ COUNTRY-AND-CITIES-COVERAGE-BATCH-1-AND-BATCH-2-FIX-1 ═══');

    // ── Cape Verde: grid non-empty + Praia now CURATED (index) ──
    console.log('\n── Cape Verde + Praia (now curated) ──');
    const cvC = await get('/prayer-times-in-cape-verde');
    check('/prayer-times-in-cape-verde grid non-empty (was empty)', cityLinks(cvC.body) >= 3, cityLinks(cvC.body)+' city-links');
    const pr = await get('/prayer-times-in-praia'); const prm = meta(pr.body);
    check('/prayer-times-in-praia = 200 + INDEX (curated, was noindex discovered)', pr.status===200 && isIndex(prm.robots), pr.status+' '+prm.robots);
    check('  → title «…برايا…»', prm.title.includes('برايا'), prm.title);
    const prQ = await get('/qibla-in-praia'); const prQm = meta(prQ.body);
    check('/qibla-in-praia = 200 + INDEX + برايا', prQ.status===200 && isIndex(prQm.robots) && prQm.title.includes('برايا'), prQ.status+' '+prQm.robots);
    const cvM = await get('/moon/cape-verde');
    check('/moon/cape-verde = 200 (now has curated cities; was 404)', cvM.status===200, cvM.status);
    const prMn = await get('/moon/cape-verde/praia/today'); const prMnm = meta(prMn.body);
    check('/moon/cape-verde/praia/today = 200 + INDEX (curated)', prMn.status===200 && isIndex(prMnm.robots), prMn.status+' '+prMnm.robots);

    // ── BATCH-1 sample (Namibia / Windhoek) ──
    console.log('\n── BATCH-1 sample: Namibia ──');
    const na = await get('/prayer-times-in-namibia');
    check('/prayer-times-in-namibia grid non-empty', cityLinks(na.body) >= 3, cityLinks(na.body)+' city-links');
    for (const [p,label] of [['/prayer-times-in-windhoek','prayer'],['/qibla-in-windhoek','qibla'],['/next-prayer-in-windhoek','next'],['/time-left-until-next-prayer-in-windhoek','time-left']]) {
        const r=await get(p); const m=meta(r.body);
        check(`windhoek ${label} 200 + index + فيندهوك`, r.status===200 && isIndex(m.robots) && m.title.includes('فيندهوك'), r.status+' '+m.robots);
    }
    const wMn = await get('/moon-today-in-windhoek'); const wMnm = meta(wMn.body);
    check('/moon-today-in-windhoek → nested /moon/namibia/... 200 index', wMn.status===200 && wMnm.canon==='/moon/namibia/windhoek/today' && isIndex(wMnm.robots), wMn.status+' '+wMnm.canon);

    // ── BATCH-2 samples ──
    console.log('\n── BATCH-2 samples ──');
    for (const [cc,slug,city,ar] of [['barbados','barbados','bridgetown','بريدجتاون'],['samoa','samoa','apia','آبيا'],['tonga','tonga','nuku-alofa','نوكو'],['sao-tome-and-principe','sao-tome-and-principe','sao-tome','ساو تومي'],['seychelles','seychelles','victoria-mahe','فيكتوريا']]) {
        const c=await get('/prayer-times-in-'+cc);
        check(`/prayer-times-in-${cc} grid non-empty`, cityLinks(c.body) >= 1, cityLinks(c.body)+' links');
        const r=await get('/prayer-times-in-'+city); const m=meta(r.body);
        check(`  city /prayer-times-in-${city} 200 index «${ar}»`, r.status===200 && isIndex(m.robots) && m.title.includes(ar), r.status+' '+m.robots);
    }
    // sparse countries: still non-empty (>=1) + capital works
    console.log('\n── sparse countries (documented) ──');
    for (const [cc,city] of [['antigua-and-barbuda','saint-johns'],['tuvalu','funafuti'],['palau','ngerulmud']]) {
        const c=await get('/prayer-times-in-'+cc); const r=await get('/prayer-times-in-'+city);
        check(`${cc}: grid≥1 + capital 200`, cityLinks(c.body)>=1 && r.status===200, cityLinks(c.body)+' links / cap '+r.status);
    }

    // ── Regression ──
    console.log('\n── regression ──');
    const rc = await get('/prayer-times-in-riyadh'); const rcm = meta(rc.body);
    check('curated riyadh 200 index unchanged', rc.status===200 && isIndex(rcm.robots), rc.status+' '+rcm.robots);
    const sa = await get('/prayer-times-in-saudi-arabia');
    check('saudi-arabia grid still populated', cityLinks(sa.body) >= 20, cityLinks(sa.body)+' links');
    const ah = await get('/prayer-times-in-abu-hardub'); const ahm = meta(ah.body);
    check('discovered abu-hardub still 200 + NOINDEX (unchanged)', ah.status===200 && isNoindex(ahm.robots), ah.status+' '+ahm.robots);

    console.log(`\n${fail===0?'✅ PASS':'❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail===0?0:1;
} finally { srv.kill('SIGKILL'); }
process.exit(exitCode);
