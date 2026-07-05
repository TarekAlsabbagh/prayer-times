// PRAYER-CITY-COUNTRY-BREADCRUMB-LINK-FIX-1 verification (self-contained, SSR-level).
//
// On /prayer-times-in-{city} the breadcrumb country rung must be a REAL link to /prayer-times-in-{countrySlug}
// for ANY city with a valid country_code — not just the FAMOUS_CITY_OVERRIDES set. Root fix resolves the cc via
// _cityCcForBreadcrumb (famous → curated-places _findPlaceBySlug → coord/slug) → makeCountrySlugSrv → href +
// BreadcrumbList JSON-LD country item + seeds __PRAYER_CITY__.countrySlug so the client keeps the link on
// hydration. Asserts (SSR): the #bc-country href, the 3-item JSON-LD country URL, and the seeded countrySlug —
// for NEW curated BATCH cities, old famous cities, and 5 langs; plus no broken href="#" for unresolved slugs.
//
// Run: node scripts/_smoke_prayer_city_country_breadcrumb_link_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = 8211;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function get(p){ return new Promise(r=>{ http.get({host:'localhost',port:PORT,path:p},x=>{let b='';x.on('data',c=>b+=c);x.on('end',()=>r({status:x.statusCode,body:b}));}).on('error',()=>r({status:0,body:''})); }); }
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function ready(t){const t0=Date.now();while(Date.now()-t0<t){const r=await get('/health');if(r.status===200)return 1;await sleep(400);}return 0;}
let pass=0,fail=0; const check=(l,ok,x)=>{if(ok)pass++;else fail++;console.log(`${ok?'✓':'✗'} ${l}${x!==undefined?'   →  '+x:''}`);};
function bcCountryHref(b){ const m=b.match(/<a class="bc-link"([^>]*?)id="bc-country"[^>]*>/); if(!m) return '(no #bc-country)'; const h=m[0].match(/href="([^"]*)"/); return h?h[1]:'(no-href-attr)'; }
function bcLd(b){ const ld=(b.match(/id="breadcrumb-schema"[^>]*>(\{[\s\S]*?\})<\/script>/)||[,''])[1]; try{ const o=JSON.parse(ld); const c=o.itemListElement.find(i=>i.position===2&&i.item); return { n:o.itemListElement.length, country:c?c.item.replace(/^https?:\/\/[^/]+/,''):'' }; }catch(e){ return {n:0,country:''}; } }
function seedSlug(b){ const s=b.match(/window\.__PRAYER_CITY__=(\{[\s\S]*?\});<\/script>/); if(!s) return '(no seed)'; try{ return JSON.parse(s[1]).countrySlug||'(none)'; }catch(e){ return 'err'; } }

// [citySlug, expected countrySlug] — BATCH-1/2 (new curated) + famous (regression). Only real system slugs.
const CITIES = [
  ['praia','cape-verde'], ['windhoek','namibia'], ['gaborone','botswana'], ['chisinau','moldova'],
  ['libreville','gabon'], ['bridgetown','barbados'], ['castries','saint-lucia'], ['victoria-mahe','seychelles'],
  ['riyadh','saudi-arabia'], ['cairo','egypt'], ['doha','qatar'], ['istanbul','turkey'],
];

const srv = spawn(process.execPath, ['server.js'], { cwd:ROOT, env:{...process.env, PORT:String(PORT), SUPABASE_URL:'', SUPABASE_SERVICE_ROLE_KEY:''}, stdio:['ignore','ignore','ignore'] });
let code=1;
try {
  if(!await ready(20000)){console.error('not ready');srv.kill('SIGKILL');process.exit(1);}
  console.log('═══ PRAYER-CITY-COUNTRY-BREADCRUMB-LINK-FIX-1 ═══\n');

  console.log('── city → country breadcrumb link (HTML href + JSON-LD + seed) ──');
  for (const [city, cSlug] of CITIES) {
    const r = await get('/prayer-times-in-'+city);
    if (r.status!==200) { check(`${city} 200`, false, r.status); continue; }
    const href = bcCountryHref(r.body); const ld = bcLd(r.body); const seed = seedSlug(r.body);
    const exp = '/prayer-times-in-'+cSlug;
    check(`${city} → HTML #bc-country href = ${exp}`, href===exp, href);
    check(`${city} → JSON-LD 3 items + country ${exp}`, ld.n===3 && ld.country===exp, `${ld.n} items, ${ld.country}`);
    check(`${city} → seeded countrySlug = ${cSlug}`, seed===cSlug, seed);
    check(`${city} → href is NOT "#"`, href!=='#');
  }

  console.log('\n── praia × 5 langs: lang-prefixed country href ──');
  for (const lng of ['ar','en','fr','ur','ms']) {
    const url = lng==='ar' ? '/prayer-times-in-praia' : `/${lng}/prayer-times-in-praia`;
    const r = await get(url); const href = bcCountryHref(r.body);
    const exp = (lng==='ar'?'':'/'+lng) + '/prayer-times-in-cape-verde';
    check(`${lng} praia → ${exp}`, href===exp, href);
  }

  console.log('\n── regression: city title/meta unchanged + robots ──');
  const pr = await get('/prayer-times-in-praia');
  const _t=(pr.body.match(/<title>([^<]*)<\/title>/)||[,''])[1], _m=(pr.body.match(/<meta name="description" content="([^"]*)"/)||[,''])[1];
  check('praia title present + «برايا»', _t.includes('برايا') && _t.length>10, _t);
  check('praia meta 120–160', [..._m].length>=120 && [..._m].length<=160, [..._m].length);
  check('praia robots index', /(^|,)index/.test((pr.body.match(/name="robots" content="([^"]*)"/)||[,''])[1]));

  console.log('\n── guard: unresolved slug → NO broken href="#" ──');
  const unk = await get('/prayer-times-in-zzznotarealcity');
  const unkHref = bcCountryHref(unk.body);
  check('unknown slug: #bc-country has no href="#"', unkHref!=='#', unkHref);
  check('unknown slug: JSON-LD has no broken /prayer-times-in- URL', !/\/prayer-times-in-"/.test(unk.body) && bcLd(unk.body).country!=='/prayer-times-in-', bcLd(unk.body).country || '(none)');

  console.log(`\n${fail===0?'✅ PASS':'❌ FAIL'}  ${pass} passed, ${fail} failed`);
  code=fail===0?0:1;
} finally { srv.kill('SIGKILL'); }
process.exit(code);
