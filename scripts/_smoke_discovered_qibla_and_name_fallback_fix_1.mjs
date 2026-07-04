// DISCOVERED-PLACE-CROSS-ROUTE-LOCALIZED-NAME-AND-FALLBACK-FIX-1 verification (self-contained).
//
// Fix Q: /qibla-in-{slug} — when the CURATED resolver misses, fall back to the prefetched
//        discovered_places row for coords, so the qibla city SEO (title / #qibla-hero-title H1 /
//        breadcrumb) builds with the discovered city's localized name (was the generic home title).
// Fix N: _resolveCityName — for ARABIC, after names.ar + aliases.ar miss, use admin.originalName
//        (script-gated) before the English/slug fallback → no English name on the Arabic page when
//        an Arabic name is available in names.ar OR aliases.ar OR admin.originalName.
//
// Discovered pages STAY noindex; curated pages STAY index and unchanged. Coords/qibla-calc unchanged.
// Spawns `node server.js` with Supabase DISABLED + the inert test seam (DISCOVERED_SSR_TEST_FIXTURE).
// Run: node scripts/_smoke_discovered_qibla_and_name_fallback_fix_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = 8107;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Fixtures: names.ar / aliases.ar-only / admin.originalName-only / names.en-only.
const FIXTURE = {
    'qtestville':      { slug:'qtestville',      lat:27.5, lng:1.5, timezone:'Africa/Algiers', country_code:'dz', type:'city', names:{ ar:'كيوتستفيل', en:'Qtestville' } },
    'alias-only-city': { slug:'alias-only-city', lat:36.0, lng:3.0, timezone:'Africa/Algiers', country_code:'dz', type:'city', names:{ en:'Alias Only City' }, aliases:{ ar:['مدينة الاسم البديل'] } },
    'orig-only-city':  { slug:'orig-only-city',  lat:35.0, lng:2.0, timezone:'Africa/Algiers', country_code:'dz', type:'city', names:{ en:'Orig Only City' }, admin:{ originalName:'مدينة الاسم الأصلي' } },
    'enonly-city':     { slug:'enonly-city',     lat:34.0, lng:1.0, timezone:'Africa/Algiers', country_code:'dz', type:'city', names:{ en:'Enonly Real City' } }
};

const dir = mkdtempSync(path.join(tmpdir(), 'disc-qibla-'));
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
async function page(p){const r=await get(p);const title=(r.body.match(/<title>([^<]*)<\/title>/)||[,''])[1];const robots=(r.body.match(/name="robots" content="([^"]*)"/)||[,''])[1];return{http:r.status,title,robots,body:r.body};}

const srv = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(PORT), DISCOVERED_SSR_TEST_FIXTURE: fixturePath, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' },
    stdio: ['ignore','ignore','ignore']
});
let exitCode = 1;
try {
    if (!await waitReady(20000)) { console.error('✗ server not ready :'+PORT); srv.kill('SIGKILL'); process.exit(1); }
    console.log('═══ DISCOVERED-PLACE-CROSS-ROUTE-LOCALIZED-NAME-AND-FALLBACK-FIX-1 ═══');

    // ── Fix Q: qibla discovered now builds the city SEO (was generic home title) ──
    console.log('\n── Fix Q: qibla discovered city SEO ──');
    const q = await page('/qibla-in-qtestville');
    check('AR /qibla-in-qtestville title = «اتجاه القبلة في كيوتستفيل …»', q.title.includes('اتجاه القبلة في') && q.title.includes('كيوتستفيل'), q.title);
    check('AR qibla title is NOT the generic home title', !q.title.includes('حسب المدينة'));
    check('AR qibla body carries كيوتستفيل (H1/breadcrumb)', q.body.includes('كيوتستفيل'));
    check('AR qibla STAYS noindex', /noindex/.test(q.robots), q.robots);
    const qEn = await page('/en/qibla-in-qtestville');
    check('EN /en/qibla-in-qtestville title = «Qibla Direction in Qtestville …»', qEn.title.includes('Qibla Direction in') && qEn.title.includes('Qtestville'), qEn.title);

    // ── Fix N: aliases.ar + admin.originalName resolve for Arabic (no English leak) ──
    console.log('\n── Fix N: ar name chain names.ar→aliases.ar→originalName ──');
    const al = await page('/qibla-in-alias-only-city');
    check('AR alias-only qibla title uses aliases.ar «مدينة الاسم البديل»', al.title.includes('مدينة الاسم البديل'), al.title);
    check('AR alias-only qibla title does NOT leak names.en', !al.title.includes('Alias Only City'));
    const or = await page('/qibla-in-orig-only-city');
    check('AR orig-only qibla title uses admin.originalName «مدينة الاسم الأصلي» (Fix N)', or.title.includes('مدينة الاسم الأصلي'), or.title);
    check('AR orig-only qibla title does NOT leak names.en', !or.title.includes('Orig Only City'));
    const orP = await page('/prayer-times-in-orig-only-city');
    check('AR orig-only PRAYER title also uses originalName (Fix N cross-route)', orP.title.includes('مدينة الاسم الأصلي'), orP.title);
    const orM = await page('/moon-today-in-orig-only-city');
    check('AR orig-only MOON title also uses originalName (Fix N cross-route)', orM.title.includes('مدينة الاسم الأصلي'), orM.title);

    // ── en-only: no Arabic anywhere → ar must NOT leak names.en; en page uses names.en ──
    console.log('\n── en-only discovered (no ar/alias/orig) ──');
    const enAr = await page('/qibla-in-enonly-city');
    check('AR en-only qibla title does NOT leak names.en «Enonly Real City»', !enAr.title.includes('Enonly Real City'), enAr.title);
    check('AR en-only qibla STAYS noindex', /noindex/.test(enAr.robots), enAr.robots);
    const enEn = await page('/en/qibla-in-enonly-city');
    check('EN en-only qibla uses names.en', enEn.title.includes('Enonly Real City'), enEn.title);

    // ── Curated qibla unchanged (index + city name) ──
    console.log('\n── curated qibla unchanged ──');
    const mk = await page('/qibla-in-makkah');
    check('AR /qibla-in-makkah title = «اتجاه القبلة في مكة المكرمة»', mk.title.includes('اتجاه القبلة في') && mk.title.includes('مكة المكرمة'), mk.title);
    check('AR curated qibla STAYS index,follow', /(^|,)index,follow/.test(mk.robots), mk.robots);

    // ── Garbage slug (no curated, no discovered) → Fix Q does NOT fabricate a page ──
    console.log('\n── garbage slug unaffected ──');
    const g = await page('/qibla-in-zzqxnowhere-x');
    check('AR garbage qibla has NO city qibla title (stays generic)', !/اتجاه القبلة في \S/.test(g.title), g.title);

    console.log(`\n${fail===0?'✅ PASS':'❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail===0?0:1;
} finally { srv.kill('SIGKILL'); }
process.exit(exitCode);
