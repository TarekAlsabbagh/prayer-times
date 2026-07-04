// MOON-COUNTRY-CLIENT-COUNTRY-FALLBACK-PARITY-FIX-1 verification (self-contained, SSR-level).
//
// The /moon/{country} pages now inject the SAME authoritative country context (window.__PT_COUNTRY__ =
// cc + 10-lang names, built from _countryNameForLang) that the prayer country page uses, so the shared
// client resolution (countryCode + getCountryDisplay, live since DEPTH-2) renders the moon H1/hero/
// subtitle/breadcrumb from SSR truth and never falls back to 'sa'. This smoke asserts the SSR side:
//   • non-curated moon country pages inject data-pt-ctx with the CORRECT cc + a 10-lang names map + the
//     correct per-lang name, and the SSR <title> carries no Saudi Arabia leak;
//   • curated moon country pages inject the correct cc (saudi-arabia = sa, legitimately);
//   • the prayer country page still injects its own context (DEPTH-2 regression);
//   • a nested moon CITY page still renders (200) and is not a country listing.
//
// Run: node scripts/_smoke_moon_country_client_country_parity_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = 8205;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SAUDI = /السعودية|Saudi|Saoudite|Suudi|Arab Saudi|سعودی/i;
function get(p){ return new Promise(r=>{ http.get({host:'localhost',port:PORT,path:p},x=>{let b='';x.on('data',c=>b+=c);x.on('end',()=>r({status:x.statusCode,body:b}));}).on('error',()=>r({status:0,body:''})); }); }
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function ready(t){const t0=Date.now();while(Date.now()-t0<t){const r=await get('/health');if(r.status===200)return 1;await sleep(400);}return 0;}
let pass=0,fail=0; const check=(l,ok,x)=>{if(ok)pass++;else fail++;console.log(`${ok?'✓':'✗'} ${l}${x!==undefined?'   →  '+x:''}`);};
function ctxOf(body){ const m=body.match(/data-pt-ctx="1">window\.__PT_COUNTRY__=(\{[\s\S]*?\});<\/script>/); if(!m) return null; try { return JSON.parse(m[1]); } catch(e){ return null; } }
const T = b => (b.match(/<title>([^<]*)<\/title>/)||[,''])[1];

const NON_CURATED = { 'cape-verde':'cv','seychelles':'sc','saint-vincent-and-the-grenadines':'vc','central-african-republic':'cf','republic-of-the-congo':'cg' };
const CURATED = { 'saudi-arabia':'sa','egypt':'eg','turkey':'tr','qatar':'qa','bahrain':'bh' };
const LANGS = ['ar','en','fr','ur','ms'];

const srv = spawn(process.execPath, ['server.js'], { cwd:ROOT, env:{...process.env, PORT:String(PORT), SUPABASE_URL:'', SUPABASE_SERVICE_ROLE_KEY:''}, stdio:['ignore','ignore','ignore'] });
let code=1;
try {
  if(!await ready(20000)){console.error('not ready');srv.kill('SIGKILL');process.exit(1);}
  console.log('═══ MOON-COUNTRY-CLIENT-COUNTRY-FALLBACK-PARITY-FIX-1 ═══\n');

  console.log('── non-curated /moon/{country} × 5 langs: ctx + cc + names + no-Saudi ──');
  for(const [slug,cc] of Object.entries(NON_CURATED)){
    for(const lng of LANGS){
      const url = lng==='ar' ? '/moon/'+slug : `/${lng}/moon/${slug}`;
      const r = await get(url); const ctx = ctxOf(r.body); const t = T(r.body);
      check(`${lng} ${slug} 200`, r.status===200, r.status);
      check(`${lng} ${slug} ctx cc=${cc}`, !!ctx && ctx.cc===cc, ctx?ctx.cc:'(no ctx)');
      check(`${lng} ${slug} ctx names ×10 + [${lng}] set`, !!ctx && ctx.names && Object.keys(ctx.names).length===10 && !!ctx.names[lng], ctx&&ctx.names?ctx.names[lng]:'-');
      check(`${lng} ${slug} names[${lng}] not Saudi`, !!ctx && ctx.names && !SAUDI.test(ctx.names[lng]||''));
      check(`${lng} ${slug} SSR title no Saudi`, !SAUDI.test(t), t.slice(0,34));
    }
  }

  console.log('\n── curated /moon/{country} regression (cc correct; saudi legit) ──');
  for(const [slug,cc] of Object.entries(CURATED)){
    const r = await get('/moon/'+slug); const ctx = ctxOf(r.body);
    check(`/moon/${slug} 200 + ctx cc=${cc}`, r.status===200 && !!ctx && ctx.cc===cc, ctx?ctx.cc:'(no ctx)');
    if(slug!=='saudi-arabia') check(`/moon/${slug} SSR title no Saudi`, !SAUDI.test(T(r.body)), T(r.body).slice(0,30));
  }

  console.log('\n── regression: prayer country still injects its own ctx; nested moon city 200 ──');
  const pc = await get('/moon/egypt'); // moon country (already covered) + prayer country below
  const prc = await get('/prayer-times-in-cape-verde'); const pctx = ctxOf(prc.body);
  check('prayer /prayer-times-in-cape-verde ctx cc=cv (DEPTH-2 intact)', !!pctx && pctx.cc==='cv', pctx?pctx.cc:'(no ctx)');
  const mc = await get('/moon/cape-verde/praia/today');
  check('nested moon city /moon/cape-verde/praia/today 200 + NOT a country ctx', mc.status===200 && ctxOf(mc.body)===null, mc.status);
  const hub = await get('/moon');
  check('global /moon hub 200 (unaffected)', hub.status===200, hub.status);

  console.log(`\n${fail===0?'✅ PASS':'❌ FAIL'}  ${pass} passed, ${fail} failed`);
  code=fail===0?0:1;
} finally { srv.kill('SIGKILL'); }
process.exit(code);
