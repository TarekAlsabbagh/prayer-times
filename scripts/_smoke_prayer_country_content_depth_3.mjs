// PRAYER-COUNTRY-CONTENT-DEPTH-3-UX-SEO-SECTIONS-FIX-1 verification (self-contained, SSR-level).
//
// Asserts the new visually-distinct "quick guide" on /prayer-times-in-{country}: (1) popular-cities
// unit with REAL SSR links to /prayer-times-in-{slug} (localized labels, ≤8, adapts to available),
// (2) 8 prayer-details chips, (3) useful links (qibla + moon on a resolved slug + a NON-link pick
// card). Verifies: guide present + scoped <style>, positioned inside #country-seo-content, NO href="#"
// in the guide, every guide link resolves 200, keyword phrases present, guide adds visible words, and
// regressions (H1=1, FAQ=5, FAQPage JSON-LD, SSR grid, guide is country-only — never on a city page).
//
// Run: node scripts/_smoke_prayer_country_content_depth_3.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = 8231;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const getBody = p => new Promise(r => { http.get({ host: 'localhost', port: PORT, path: p }, x => { let b = ''; x.on('data', c => b += c); x.on('end', () => r(b)); }).on('error', () => r('')); });
const getStatus = p => new Promise(r => { const q = http.get({ host: 'localhost', port: PORT, path: p }, x => { x.resume(); x.on('end', () => r(x.statusCode)); }); q.on('error', () => r(0)); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function ready(t) { const t0 = Date.now(); while (Date.now() - t0 < t) { if (await getStatus('/health') === 200) return 1; await sleep(400); } return 0; }
let pass = 0, fail = 0; const check = (l, ok, x) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${l}${x !== undefined ? '   →  ' + x : ''}`); };

function guideOf(b) {
  const open = b.indexOf('class="pc-guide"'); if (open < 0) return '';
  let i = b.indexOf('>', open) + 1; const start = i; let depth = 1;
  while (i < b.length && depth > 0) { const nd = b.indexOf('<section', i), nc = b.indexOf('</section>', i); if (nc < 0) break; if (nd >= 0 && nd < nc) { depth++; i = nd + 8; } else { depth--; if (depth === 0) return b.slice(start, nc); i = nc + 10; } }
  return '';
}
const wc = frag => (frag.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/&#\d+;/g, ' ').trim().match(/\S+/g) || []).length;

const srv = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT), SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' }, stdio: ['ignore', 'ignore', 'ignore'] });
let code = 1;
try {
  if (!await ready(20000)) { console.error('not ready'); srv.kill('SIGKILL'); process.exit(1); }
  console.log('═══ PRAYER-COUNTRY-CONTENT-DEPTH-3-UX-SEO-SECTIONS-FIX-1 ═══\n');

  // ── structure (ar saudi + en egypt) ──
  console.log('── guide structure ──');
  for (const [lang, p, slugPfx] of [['ar', '/prayer-times-in-saudi-arabia', ''], ['en', '/en/prayer-times-in-egypt', '/en']]) {
    const b = await getBody(p); const g = guideOf(b);
    check(`${p} guide present`, !!g);
    check(`${p} scoped <style id="pc-guide-css">`, b.includes('id="pc-guide-css"'));
    check(`${p} guide inside #country-seo-content`, b.indexOf('id="country-seo-content"') >= 0 && b.indexOf('id="country-seo-content"') < b.indexOf('class="pc-guide"'));
    check(`${p} 1 H2 + 3 H3 units in guide`, (g.match(/<h2/g) || []).length === 1 && (g.match(/<h3/g) || []).length === 3);
    const cityCards = (g.match(/class="pc-city-card"/g) || []).length;
    check(`${p} 1..8 city cards`, cityCards >= 1 && cityCards <= 8, cityCards);
    check(`${p} city links = ${slugPfx}/prayer-times-in-{slug}`, new RegExp(`class="pc-city-card" href="${slugPfx}/prayer-times-in-[a-z]`).test(g));
    check(`${p} 8 chips`, (g.match(/class="pc-chip"/g) || []).length === 8);
    check(`${p} qibla link ${slugPfx}/qibla`, g.includes(`href="${slugPfx}/qibla"`));
    check(`${p} moon link ${slugPfx}/moon/`, new RegExp(`href="${slugPfx}/moon/[a-z]`).test(g));
    check(`${p} pick card is NON-link (pc-link-static, no href)`, g.includes('pc-link-static') && !/pc-link-static"[^>]*href/.test(g));
    check(`${p} NO href="#" anywhere in guide`, !g.includes('href="#"'));
    check(`${p} guide adds >=150 visible words`, wc(g) >= 150, wc(g));
  }

  // ── keyword consistency (natural phrases inside the guide) ──
  console.log('\n── keyword consistency ──');
  const gar = guideOf(await getBody('/prayer-times-in-saudi-arabia'));
  for (const kw of ['مواقيت الصلاة في', 'الفجر', 'الظهر', 'العصر', 'المغرب', 'العشاء', 'التوقيت المحلي', 'التاريخ الهجري', 'اختر مدينتك'])
    check(`ar guide contains «${kw}»`, gar.includes(kw));
  const gen = guideOf(await getBody('/en/prayer-times-in-egypt'));
  for (const kw of ['Prayer Times in', 'Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'local time', 'Hijri date', 'select your city'])
    check(`en guide contains «${kw}»`, gen.includes(kw));

  // ── every guide link resolves 200 ──
  console.log('\n── guide links open 200 ──');
  let tot = 0, bad = 0;
  for (const p of ['/prayer-times-in-saudi-arabia', '/en/prayer-times-in-egypt', '/prayer-times-in-cape-verde', '/ur/prayer-times-in-egypt']) {
    const g = guideOf(await getBody(p));
    for (const h of [...g.matchAll(/href="([^"]+)"/g)].map(m => m[1])) { tot++; const s = await getStatus(h); if (s !== 200) { bad++; console.log(`  !! ${s} ${h}`); } }
  }
  check(`all ${tot} guide links = 200`, bad === 0, `${bad} bad`);

  // ── 10 langs: guide present + localized + chips ──
  console.log('\n── 10-lang guide presence ──');
  const guideTitleToken = { ar: 'دليل سريع', en: 'Quick Guide', fr: 'Guide rapide', tr: 'Hızlı Rehberi', ur: 'فوری رہنمائی', de: 'Kurzanleitung', id: 'Panduan Cepat', es: 'Guía rápida', bn: 'দ্রুত নির্দেশিকা', ms: 'Panduan Ringkas' };
  for (const L of ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms']) {
    const url = (L === 'ar' ? '' : '/' + L) + '/prayer-times-in-egypt';
    const g = guideOf(await getBody(url));
    check(`${L} egypt guide + localized title + 8 chips + cities`, !!g && g.includes(guideTitleToken[L]) && (g.match(/class="pc-chip"/g) || []).length === 8 && (g.match(/class="pc-city-card"/g) || []).length >= 1 && !g.includes('href="#"'));
  }

  // ── small country adapts (available cities only) ──
  console.log('\n── small countries ──');
  for (const [p, max] of [['/prayer-times-in-seychelles', 4], ['/prayer-times-in-cape-verde', 8]]) {
    const g = guideOf(await getBody(p)); const n = (g.match(/class="pc-city-card"/g) || []).length;
    check(`${p} guide present, 1..${max} city cards, no href#`, !!g && n >= 1 && n <= max && !g.includes('href="#"'), n + ' cards');
  }

  // ── regressions ──
  console.log('\n── regressions ──');
  const bs = await getBody('/prayer-times-in-saudi-arabia');
  check('H1 = 1', (bs.match(/<h1\b/g) || []).length === 1);
  check('FAQ items = 5', (bs.match(/class="country-faq-item"/g) || []).length === 5);
  check('FAQPage JSON-LD present', bs.includes('"@type":"FAQPage"'));
  check('SSR city grid present (data-ssr-grid)', bs.includes('data-ssr-grid="1"'));
  check('title present', /<title>[^<]+<\/title>/.test(bs));
  const cityPage = await getBody('/prayer-times-in-riyadh');
  check('guide is COUNTRY-ONLY (absent on city page /prayer-times-in-riyadh)', !cityPage.includes('class="pc-guide"'));

  console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
  code = fail === 0 ? 0 : 1;
} finally { srv.kill('SIGKILL'); }
process.exit(code);
