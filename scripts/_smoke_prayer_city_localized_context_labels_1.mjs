// PRAYER-CITY-LOCALIZED-CITY-CONTEXT-LABELS-AND-REMOVE-LAST-LOCATION-PILL-1 — SSR verification.
//
// City prayer page (/prayer-times-in-{city}) now appends the localized city name to the banner
// next-prayer, date-card (Hijri + new Gregorian label), info-strip (imsak / fasting / last-third)
// and "next prayer" labels — in all 10 langs, SSR-rendered via `data-i18n-city` + the
// _translateI18nAttrs walker — and removes the "last used location" smart-redirect pill on city
// pages only (homepage keeps it). Labels only: SEO (title/robots/canonical/hreflang), routes,
// discovered-noindex/curated-index all unchanged.
//
// Run: node scripts/_smoke_prayer_city_localized_labels_1.mjs
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = 8293;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const get = p => new Promise(r => { http.get({ host: 'localhost', port: PORT, path: p }, x => { let b = ''; x.on('data', c => b += c); x.on('end', () => r(b)); }).on('error', () => r('')); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function ready(t){ const t0=Date.now(); while(Date.now()-t0<t){ if(await get('/health')) return 1; await sleep(400);} return 0; }
let pass=0, fail=0; const check=(l,ok,x)=>{ if(ok)pass++; else fail++; console.log(`${ok?'✓':'✗'} ${l}${x!==undefined?'   →  '+x:''}`); };
const robots = b => (b.match(/name="robots" content="([^,"]*)/)||[,''])[1];

const srv = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT:String(PORT), SUPABASE_URL:'', SUPABASE_SERVICE_ROLE_KEY:'' }, stdio:['ignore','ignore','ignore'] });
let code = 1;
try {
  if (!await ready(20000)) { console.error('server not ready'); srv.kill('SIGKILL'); process.exit(1); }
  console.log('═══ PRAYER-CITY-LOCALIZED-CITY-CONTEXT-LABELS — SSR ═══\n');

  // (a) AR city page — every city-context label carries the city name «في الرياض»
  console.log('── AR /prayer-times-in-riyadh: city-context labels ──');
  const ar = await get('/prayer-times-in-riyadh');
  const arWants = [
    'الوقت المتبقي للصلاة التالية في الرياض',
    'التاريخ الهجري اليوم في الرياض',
    'التاريخ الميلادي اليوم في الرياض',
    'الإمساك اليوم في الرياض',
    'مدة الصيام اليوم في الرياض',
    'الثلث الأخير من الليل اليوم في الرياض',
    'الصلاة القادمة في الرياض:',
  ];
  for (const w of arWants) check(`AR label present: ${w.slice(0,34)}…`, ar.includes(w));
  check('AR: NO unsubstituted {loc} in a data-i18n-city label', !/data-i18n-city="[^"]*">[^<]*\{loc\}/.test(ar));
  check('AR: Gregorian label revealed (not hidden)', !/banner-greg-label[^>]*hidden/.test(ar) && ar.includes('banner-greg-label'));
  check('AR: smart-redirect pill REMOVED on city page', !ar.includes('id="loc-hero-smart-pill"'));

  // (b) EN city page — same, English
  console.log('\n── EN /en/prayer-times-in-riyadh: city-context labels ──');
  const en = await get('/en/prayer-times-in-riyadh');
  for (const w of ['Time until next prayer in Riyadh','Today\'s Hijri date in Riyadh','Today\'s Gregorian date in Riyadh','Imsak today in Riyadh','Fasting duration today in Riyadh','Last third of the night today in Riyadh','Next prayer in Riyadh:'])
    check(`EN label present: ${w.slice(0,30)}…`, en.includes(w));
  check('EN: pill REMOVED on city page', !en.includes('id="loc-hero-smart-pill"'));

  // (b2) "today tools" grid (#pt-related-tools, client-rendered) — the moon + hijri card names now
  //      carry {loc} in the served js/app.js template (client substitutes the localized city).
  console.log('\n── today-tools cards (client template carries {loc}) ──');
  const appjs = await get('/js/app.js');
  check('app.js moon-tool name has «حالة القمر اليوم في {loc}»', appjs.includes('حالة القمر اليوم في {loc}'));
  check('app.js hijri-tool name has «التاريخ الهجري اليوم في {loc}»', appjs.includes('التاريخ الهجري اليوم في {loc}'));

  // (c) homepage — labels NOT present (region is city-page-only) + pill KEPT
  console.log('\n── homepage /: pill kept, no city labels ──');
  const home = await get('/');
  check('home: has NO data-i18n-city labels (banner region city-only)', !home.includes('data-i18n-city'));
  check('home: smart-redirect pill KEPT', home.includes('id="loc-hero-smart-pill"'));
  check('home: <html class="home-page">', /<html[^>]*class="[^"]*home-page/.test(home));

  // (d) SEO / robots UNCHANGED (labels-only ticket)
  console.log('\n── SEO unchanged (labels only) ──');
  check('curated city 200 + index + canonical + hreflang', robots(ar)==='index' && ar.includes('rel="canonical"') && (ar.match(/rel="alternate" hreflang=/g)||[]).length>=10, robots(ar));
  check('city page <html class="city-page">', /<html[^>]*class="[^"]*city-page/.test(ar));
  check('discovered /prayer-times-in-ad-dana stays noindex', robots(await get('/prayer-times-in-ad-dana'))==='noindex');

  console.log(`\n${fail===0?'✅ PASS':'❌ FAIL'}  ${pass} passed, ${fail} failed`);
  code = fail===0 ? 0 : 1;
} finally { srv.kill('SIGKILL'); }
process.exit(code);
