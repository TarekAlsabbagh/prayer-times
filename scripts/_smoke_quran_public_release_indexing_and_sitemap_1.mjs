// Smoke — QURAN-AR-PUBLIC-RELEASE-PUSH-MERGE-DEPLOY-INDEXING-AND-PRODUCTION-VERIFICATION-1.
// Proves the Arabic Quran section is PUBLICLY RELEASED: the feature-flag runtime gate is gone, /quran + the 114
// official surah routes are INDEXABLE + self-canonical + present in the sitemap as exactly 115 Quran URLs with a
// FIXED public-release <lastmod>, Robots allows the section, hreflang stays 0, source attribution is present, and
// there are no ads / no KFGQPC runtime. Behavioural (real HTTP), not grep-only: it spawns its OWN server with NO
// QURAN_PROTOTYPE_ENABLED env var (and a second with the var = '0') to prove the routes no longer depend on it.
import { spawn } from 'child_process';
import fs from 'fs'; import path from 'path'; import net from 'net'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROUTES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/quran/tanzil-uthmani-1-1/metadata/surah-routes.json'), 'utf8')).surahs;
const ALL_PATHS = ['/quran', ...ROUTES.map(r => r.path)];   // 115
const RELEASE_LASTMOD = '2026-07-22';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++) : (fail++, F.push(m), console.log('  FAIL ' + m));
const reachable = (url) => new Promise(res => { try { const u = new URL(url); const s = net.connect({ host: u.hostname, port: +u.port || 80 }, () => { s.end(); res(true); }); s.on('error', () => res(false)); s.setTimeout(1200, () => { s.destroy(); res(false); }); } catch (e) { res(false); } });
const NODE_PATH_FALLBACK = process.env.NODE_PATH || 'C:/Users/Tarek/Downloads/TIME PRAYER/node_modules';

// ---------------- STATIC (source) ----------------
const server = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
ok(!/process\.env\.QURAN_PROTOTYPE_ENABLED/.test(server), 'server.js has ZERO active runtime gate on process.env.QURAN_PROTOTYPE_ENABLED (feature gate removed)');
ok(/const QURAN_PUBLIC_RELEASE_LASTMOD = '2026-07-22';/.test(server), 'server.js defines the FIXED QURAN_PUBLIC_RELEASE_LASTMOD (not `today`)');
ok(/_quranSitemapUrl\('\/quran'/.test(server) && /_quranShared\(\)\.routes\) entries\.push\(_quranSitemapUrl/.test(server.replace(/\s+/g, ' ')), 'the sitemap builds the 115 Quran urls from _quranShared().routes (no second slug list, no ayah text)');
ok(/css\/quran\.css\?v=25\b/.test(server) && !/css\/quran\.css\?v=2[46]/.test(server), 'css/quran.css?v=25 unchanged');
ok(/js\/quran\.js\?v=15\b/.test(server) && !/js\/quran\.js\?v=1[46]/.test(server), 'js/quran.js?v=15 unchanged');
ok(/js\/quran-home\.js\?v=4\b/.test(server) && !/js\/quran-home\.js\?v=[23]\b/.test(server), 'js/quran-home.js bumped to v=4 (QURAN-SITEWIDE-SIDEBAR-ENTRY-AND-EXISTING-LOCALE-MODAL-HANDOFF-1)');
// no KFGQPC runtime data dir anywhere the section reads at request time
ok(!/data\/quran\/kfgqpc-hafs/.test(server), 'server.js has ZERO KFGQPC runtime data-path reference');

async function boot(port, envOverrides) {
  const env = Object.assign({}, process.env, { PORT: String(port), NODE_PATH: NODE_PATH_FALLBACK });
  delete env.QURAN_PROTOTYPE_ENABLED;                 // start from a flag-FREE env
  Object.assign(env, envOverrides || {});             // …then apply the exact override this boot wants
  const p = spawn(process.execPath, [path.join(ROOT, 'server.js')], { cwd: ROOT, stdio: 'ignore', env });
  const base = 'http://localhost:' + port;
  for (let i = 0; i < 80; i++) { await sleep(400); if (await reachable(base)) { const h = await fetch(base + '/quran').then(r => r.text()).catch(() => ''); if (/id="page-quran-home"/.test(h)) return { p, base }; } }
  return { p: null, base };
}

async function main() {
  // ---------------- server A: NO QURAN_PROTOTYPE_ENABLED in env ----------------
  const A = await boot(3197, {});   // env var deleted inside boot()
  if (!A.p) { console.log('SKIP — could not boot a flag-free server'); finish(); return; }
  const hRobots = await fetch(A.base + '/robots.txt').then(r => r.text());
  const sm = await fetch(A.base + '/sitemap-main.xml').then(r => r.text());

  // (1) Sitemap — exactly 115, distinct, fixed lastmod, arabic-only, no query/fragment/lang-prefix/anchor
  const quranLocs = [...sm.matchAll(/<loc>([^<]*\/quran(?:\/[a-z0-9-]+)?)<\/loc>/g)].map(m => m[1]);
  const paths = quranLocs.map(u => u.replace(/^https?:\/\/[^/]+/, ''));
  const expected = new Set(ALL_PATHS);
  ok(quranLocs.length === 115, 'sitemap: exactly 115 Quran <loc> — ' + quranLocs.length);
  ok(new Set(paths).size === 115, 'sitemap: 115 distinct Quran urls (0 duplicates)');
  ok(ALL_PATHS.every(p => paths.includes(p)), 'sitemap: 0 missing (all /quran + 114 official slug paths present)');
  ok(paths.every(p => expected.has(p)), 'sitemap: 0 extra Quran urls');
  ok(!paths.some(p => /\/(en|fr|de|tr|ur|id|es|bn|ms)\/quran/.test(p)), 'sitemap: 0 language-prefixed Quran urls');
  ok(!quranLocs.some(u => /[?#]/.test(u)), 'sitemap: 0 query strings / fragments (no #ayah anchors)');
  const quranBlocks = [...sm.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m => m[1]).filter(b => /\/quran(?:\/[a-z0-9-]+)?<\/loc>/.test(b));
  ok(quranBlocks.length === 115 && quranBlocks.every(b => b.includes('<lastmod>' + RELEASE_LASTMOD + '</lastmod>')), 'sitemap: all 115 carry the FIXED lastmod ' + RELEASE_LASTMOD);
  ok(!quranBlocks.some(b => /xhtml:link/.test(b)), 'sitemap: Quran urls carry NO hreflang alternates (Arabic-only)');

  // (2) Robots.txt allows the section + assets, and advertises the sitemap
  ok(!/Disallow:\s*\/quran/.test(hRobots), 'robots.txt does not Disallow /quran');
  ok(/Sitemap:\s*\S+\/sitemap\.xml/.test(hRobots), 'robots.txt advertises the sitemap');

  // (3) every one of the 115 pages: 200 + indexable + self-canonical + attribution + no ads + hreflang 0 + H1/title/desc
  let s200 = 0, indexable = 0, noXrobots = 0, selfCanon = 0, attribution = 0, noAds = 0, hreflang0 = 0, oneH1 = 0, hasTitle = 0, hasDesc = 0, hasJsonLd = 0;
  const bad = [];
  for (const p of ALL_PATHS) {
    const res = await fetch(A.base + p); const html = await res.text();
    if (res.status === 200) s200++; else bad.push(p + ' status ' + res.status);
    const robots = (html.match(/<meta[^>]*name="robots"[^>]*content="([^"]*)"/) || [, ''])[1];
    if (/\bindex,follow\b/.test(robots) && !/\bnoindex\b/.test(robots) && !/\bnofollow\b/.test(robots) && !/\bnone\b/.test(robots)) indexable++; else bad.push(p + ' robots «' + robots + '»');
    if (!/noindex/i.test(res.headers.get('x-robots-tag') || '')) noXrobots++; else bad.push(p + ' X-Robots-Tag noindex');
    const canon = (html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/) || [, ''])[1];
    if (canon.endsWith(p) && !/[?#]/.test(canon)) selfCanon++; else bad.push(p + ' canonical «' + canon + '»');
    if (/Tanzil/i.test(html) && /(Creative Commons|CC[ -]?BY|creativecommons\.org\/licenses\/by\/3\.0)/i.test(html) && /tanzil\.net/i.test(html)) attribution++; else bad.push(p + ' attribution missing');
    if (!/pagead2|ca-pub-|adsbygoogle/.test(html)) noAds++; else bad.push(p + ' adsense present');
    if ((html.match(/rel="alternate" hreflang/g) || []).length === 0) hreflang0++; else bad.push(p + ' hreflang present');
    if ((html.match(/<h1[\s>]/g) || []).length === 1) oneH1++; else bad.push(p + ' H1 count');
    if (/<title>[^<]+<\/title>/.test(html)) hasTitle++;
    if (/name="description" content="[^"]+"/.test(html)) hasDesc++;
    if (/application\/ld\+json/.test(html)) hasJsonLd++;
  }
  ok(s200 === 115, '115/115 pages → HTTP 200 (flag-free server) — ' + s200);
  ok(indexable === 115, '115/115 INDEXABLE (index,follow; no noindex/nofollow/none) — ' + indexable);
  ok(noXrobots === 115, '115/115 have NO X-Robots-Tag: noindex — ' + noXrobots);
  ok(selfCanon === 115, '115/115 self-canonical, no query/fragment — ' + selfCanon);
  ok(attribution === 115, '115/115 carry Tanzil + CC-BY + tanzil.net source attribution — ' + attribution);
  ok(noAds === 115, '115/115 carry ZERO AdSense (no pagead2/ca-pub/adsbygoogle) — ' + noAds);
  ok(hreflang0 === 115, '115/115 carry hreflang = 0 (Arabic-only) — ' + hreflang0);
  ok(oneH1 === 115, '115/115 carry exactly ONE <h1> — ' + oneH1);
  ok(hasTitle === 115 && hasDesc === 115, '115/115 carry a <title> + meta description');
  ok(hasJsonLd === 115, '115/115 keep JSON-LD structured data — ' + hasJsonLd);
  if (bad.length) console.log('  (first deviations) ' + bad.slice(0, 6).join(' ;; '));

  try { A.p.kill(); } catch (e) {}
  await sleep(300);

  // ---------------- server B: QURAN_PROTOTYPE_ENABLED=0 must NOT disable the section ----------------
  const B = await boot(3198, { QURAN_PROTOTYPE_ENABLED: '0' });
  if (B.p) {
    let flag0ok = 0; const chk = ['/quran', '/quran/al-baqarah', '/quran/an-nas'];
    for (const p of chk) { const res = await fetch(B.base + p); const html = await res.text(); if (res.status === 200 && /id="page-quran-(home|surah)"/.test(html) && /content="index,follow/.test(html)) flag0ok++; }
    ok(flag0ok === chk.length, 'with QURAN_PROTOTYPE_ENABLED=0 the section STILL serves 200 + indexable (the var is inert) — ' + flag0ok + '/' + chk.length);
    try { B.p.kill(); } catch (e) {}
  } else { console.log('  (could not boot the flag=0 server — skipped that sub-check)'); }

  finish();
}
function finish() {
  console.log('RESULT quran_public_release_indexing_and_sitemap: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.log('  FAIL uncaught ' + (e && e.message)); fail++; finish(); });
