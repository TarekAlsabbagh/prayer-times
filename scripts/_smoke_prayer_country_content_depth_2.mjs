// PRAYER-COUNTRY-CONTENT-DEPTH-2 verification (self-contained).
//
// Deepens /prayer-times-in-{country} SSR content from 6 → 9 content sections per lang (added
// how-to-use / when-to-check / important-notes + expanded AR/EN intro) in `_COUNTRY_SEO_L10N`,
// WITHOUT touching title/meta/H1/FAQ count. Verifies depth + that nothing SEO-critical regressed.
//
// Run: node scripts/_smoke_prayer_country_content_depth_2.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = 8198;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cp = s => [...(s || '')].length;
const wc = s => { const t = s.replace(/<(script|style)[\s\S]*?<\/\1>/g,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); return t ? t.split(' ').length : 0; };

const FIXTURE = { 'abu-hardub': { slug:'abu-hardub', lat:35.0223, lng:40.4392, timezone:'Asia/Damascus', country_code:'sy', type:'city', names:{ ar:'أبو حردوب', en:'Abu Hardoub' } } };
const dir = mkdtempSync(path.join(tmpdir(),'pc-depth-')); const fx = path.join(dir,'f.json'); writeFileSync(fx, JSON.stringify(FIXTURE),'utf8');

function get(p){ return new Promise(r=>{ http.get({host:'localhost',port:PORT,path:p},x=>{let b='';x.on('data',c=>b+=c);x.on('end',()=>r({status:x.statusCode,body:b}));}).on('error',()=>r({status:0,body:''})); }); }
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function ready(t){const t0=Date.now();while(Date.now()-t0<t){const r=await get('/health');if(r.status===200)return 1;await sleep(400);}return 0;}
let pass=0,fail=0; const check=(l,ok,x)=>{if(ok)pass++;else fail++;console.log(`${ok?'✓':'✗'} ${l}${x!==undefined?'   →  '+x:''}`);};
function P(b){return{
  t:(b.match(/<title>([^<]*)<\/title>/)||[,''])[1], d:(b.match(/<meta name="description" content="([^"]*)"/)||[,''])[1],
  blocks:(b.match(/class="country-seo-block">/g)||[]).length, h1:(b.match(/<h1[\s>]/g)||[]).length,
  faq:(b.match(/class="country-faq-item"/g)||[]).length, faqLd:/"@type"\s*:\s*"FAQPage"/.test(b), crumbLd:/"@type"\s*:\s*"BreadcrumbList"/.test(b),
  canon:((b.match(/rel="canonical" href="([^"]*)"/)||[,''])[1]).replace(/^https?:\/\/[^/]+/,''), robots:(b.match(/name="robots" content="([^"]*)"/)||[,''])[1],
  hl:(b.match(/rel="alternate" hreflang="/g)||[]).length, bodyW:wc((b.match(/<body[\s\S]*?<\/body>/)||[''])[0])
};}
// per-lang minimum full-body word floor (well above the ~516 thin baseline)
const WMIN = { ar:750, en:850, fr:850, tr:680, ur:850, de:750, id:750, es:850, bn:700, ms:750 };

const srv = spawn(process.execPath, ['server.js'], { cwd:ROOT, env:{...process.env, PORT:String(PORT), DISCOVERED_SSR_TEST_FIXTURE:fx, SUPABASE_URL:'', SUPABASE_SERVICE_ROLE_KEY:''}, stdio:['ignore','ignore','ignore'] });
let code=1;
try {
  if(!await ready(20000)){console.error('not ready');srv.kill('SIGKILL');process.exit(1);}
  console.log('═══ PRAYER-COUNTRY-CONTENT-DEPTH-2 ═══\n');
  for(const lang of ['ar','en','fr','tr','ur','de','id','es','bn','ms']){
    const u=lang==='ar'?'/prayer-times-in-egypt':`/${lang}/prayer-times-in-egypt`;
    const r=await get(u); const m=P(r.body);
    console.log(`── [${lang}] words=${m.bodyW} blocks=${m.blocks} T=${cp(m.t)} M=${cp(m.d)}`);
    check(`${lang} 200`, r.status===200, r.status);
    check(`${lang} 9 content sections (was 6)`, m.blocks===9, m.blocks);
    check(`${lang} body words ≥ ${WMIN[lang]}`, m.bodyW>=WMIN[lang], m.bodyW);
    check(`${lang} H1 = 1`, m.h1===1, m.h1);
    check(`${lang} FAQ = 5 (unchanged)`, m.faq===5, m.faq);
    check(`${lang} title 48–60 (unchanged ladder)`, cp(m.t)>=48 && cp(m.t)<=60, cp(m.t));
    check(`${lang} meta 120–160 (unchanged)`, cp(m.d)>=120 && cp(m.d)<=160, cp(m.d));
    check(`${lang} FAQPage + Breadcrumb JSON-LD`, m.faqLd && m.crumbLd);
    check(`${lang} canonical = ${u}`, m.canon===u, m.canon);
    check(`${lang} robots index`, /(^|,)index,follow/.test(m.robots));
    check(`${lang} hreflang ≥ 10`, m.hl>=10, m.hl);
  }
  // multi-country (incl. the reported Turkey page)
  console.log('\n── multi-country (9 sections) ──');
  for(const slug of ['saudi-arabia','turkey','qatar','cape-verde']){
    const r=await get('/prayer-times-in-'+slug); const m=P(r.body);
    check(`${slug} 9 sections + words≥700`, m.blocks===9 && m.bodyW>=700, `blocks=${m.blocks} words=${m.bodyW}`);
  }
  // regression
  console.log('\n── regression ──');
  const rc=await get('/prayer-times-in-riyadh'); const rcm=P(rc.body);
  check('CITY riyadh 200 + index + «الرياض» + NOT country «حسب مدنها»', rc.status===200 && /(^|,)index/.test(rcm.robots) && rcm.t.includes('الرياض') && !rcm.t.includes('حسب مدنها'), rcm.t);
  const ah=await get('/prayer-times-in-abu-hardub'); const ahm=P(ah.body);
  check('DISCOVERED abu-hardub 200 + noindex', ah.status===200 && /noindex/.test(ahm.robots), ah.status+' '+ahm.robots);

  console.log(`\n${fail===0?'✅ PASS':'❌ FAIL'}  ${pass} passed, ${fail} failed`);
  code=fail===0?0:1;
} finally { srv.kill('SIGKILL'); }
process.exit(code);
