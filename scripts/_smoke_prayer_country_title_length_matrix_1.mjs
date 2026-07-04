// PRAYER-COUNTRY-CONTENT-DEPTH-2 — Title Length Coverage Matrix (mandatory verification).
//
// Confirms the country-page title ladder holds 50–60 code points «as much as possible» across SHORT,
// MEDIUM and LONG country-name lengths, in all 10 langs, and that DEPTH-2 (content) did not break it.
// Rules: title MUST be ≤ 60 (hard). 50–60 = pass. 46–49 = acceptable exception (natural for some
// lang/name pairs, e.g. id/ms «Arab Saudi»). < 46 or > 60 = FAIL. Only real country pages are tested
// (non-existent slugs are reported as "unavailable", never invented).
//
// Run: node scripts/_smoke_prayer_country_title_length_matrix_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = 8199;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cp = s => [...(s || '')].length;
function get(p){ return new Promise(r=>{ http.get({host:'localhost',port:PORT,path:p},x=>{let b='';x.on('data',c=>b+=c);x.on('end',()=>r({status:x.statusCode,body:b}));}).on('error',()=>r({status:0,body:''})); }); }
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function ready(t){const t0=Date.now();while(Date.now()-t0<t){const r=await get('/health');if(r.status===200)return 1;await sleep(400);}return 0;}
const T = b => (b.match(/<title>([^<]*)<\/title>/)||[,''])[1];
const isCountry = b => (b.match(/class="country-seo-block">/g)||[]).length >= 6; // 9 content blocks on a country page

// [slug, category] — real system slugs; non-existent ones are skipped + reported.
const COUNTRIES = [
  ['egypt','short'],['qatar','short'],['turkey','short'],['oman','short'],['mali','short'],['togo','short'],
  ['saudi-arabia','medium'],['bahrain','medium'],['cape-verde','medium'],['seychelles','medium'],['moldova','medium'],
  ['united-arab-emirates','long'],['saint-vincent-and-the-grenadines','long'],['sao-tome-and-principe','long'],
  ['central-african-republic','long'],['republic-of-the-congo','long'],['bosnia-and-herzegovina','long'],
];
const LANGS = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];

const srv = spawn(process.execPath, ['server.js'], { cwd:ROOT, env:{...process.env, PORT:String(PORT), SUPABASE_URL:'', SUPABASE_SERVICE_ROLE_KEY:''}, stdio:['ignore','ignore','ignore'] });
let code=1;
try {
  if(!await ready(20000)){console.error('not ready');srv.kill('SIGKILL');process.exit(1);}
  console.log('═══ TITLE LENGTH COVERAGE MATRIX (PRAYER-COUNTRY-CONTENT-DEPTH-2) ═══\n');
  console.log('language | country slug | category | title len | status | title');
  let pass=0, accept=0, fail=0, tested=0, unavailable=0, min=999, max=0; const exceptions=[], fails=[];
  const availSlugs = [];
  // resolve availability once (ar)
  for(const [slug,cat] of COUNTRIES){ const r=await get('/prayer-times-in-'+slug); if(r.status===200 && isCountry(r.body)){ availSlugs.push([slug,cat]); } else { unavailable++; console.log(`— (unavailable) ${slug}  [${cat}]  → status ${r.status}`); } await sleep(250); }
  console.log('');
  for(const lang of LANGS){
    for(const [slug,cat] of availSlugs){
      const url = lang==='ar' ? '/prayer-times-in-'+slug : `/${lang}/prayer-times-in-${slug}`;
      const r = await get(url); const t=T(r.body); const len=cp(t);
      tested++; if(len<min)min=len; if(len>max)max=len;
      let status;
      if(len>60){ status='FAIL(>60)'; fail++; fails.push(`${lang}/${slug}=${len}`); }
      else if(len>=50){ status='pass'; pass++; }
      else if(len>=46){ status='acceptable'; accept++; exceptions.push(`${lang}/${slug}=${len} (${cat}, ≤49 natural)`); }
      else { status='FAIL(<46)'; fail++; fails.push(`${lang}/${slug}=${len}`); }
      console.log(`${lang.padEnd(2)} | ${slug.padEnd(34)} | ${cat.padEnd(6)} | ${String(len).padStart(2)} | ${status.padEnd(10)} | ${t}`);
      await sleep(120);
    }
  }
  console.log('\n── summary ──');
  console.log(`countries available: ${availSlugs.length}/${COUNTRIES.length}  (unavailable: ${unavailable})`);
  console.log(`pages tested: ${tested}  |  pass(50-60): ${pass}  |  acceptable(46-49): ${accept}  |  FAIL: ${fail}`);
  console.log(`min title len: ${min}  |  max title len: ${max}`);
  if(exceptions.length){ console.log('acceptable exceptions:'); exceptions.forEach(e=>console.log('  • '+e)); }
  if(fails.length){ console.log('FAILURES:'); fails.forEach(e=>console.log('  ✗ '+e)); }
  console.log(`\n${fail===0?'✅ PASS':'❌ FAIL'}  (0 titles >60 or <46; ${pass} in 50-60, ${accept} acceptable 46-49)`);
  code = fail===0?0:1;
} finally { srv.kill('SIGKILL'); }
process.exit(code);
