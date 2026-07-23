// Smoke — QURAN-DEDICATED-SITEMAP-LOW-RESOURCE-GSC-SUBMISSION-1.
// Proves /sitemap-quran.xml is a standalone, LOW-RESOURCE Quran-only sitemap: exactly 115 self-canonical
// Arabic-only URLs (/quran + the 114 official surah routes), no hreflang / query / fragment / language
// prefix, fixed lastmod 2026-07-22, built ONCE + ETag/304 + brotli, and — statically — built from the
// light _quranShared().routes with NO ayah text / surah-file read / Tanzil load / city generator / call
// into the site-wide sitemap builder. The site-wide sitemap is NOT modified.
//
//   QURAN_SSR_BASE=http://localhost:8080 node scripts/_smoke_quran_dedicated_sitemap_1.mjs
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const B = process.env.QURAN_SSR_BASE || process.env.QURAN_SMOKE_URL || 'http://127.0.0.1:8085';
const ROUTES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/quran/tanzil-uthmani-1-1/metadata/surah-routes.json'), 'utf8')).surahs;
const ALL_PATHS = ['/quran', ...ROUTES.map(r => r.path)];   // 115
const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
let pass = 0, fail = 0; const F = [];
const ok = (c, m) => c ? (pass++) : (fail++, F.push(m), console.log('  FAIL ' + m));

// ---------------- STATIC (server.js source) — low-resource + isolation ----------------
const b0 = src.indexOf('function _getQuranDedicatedSitemap()');
const body = b0 >= 0 ? src.slice(b0, src.indexOf('\n}', b0)) : '';
ok(b0 > 0, 'server.js defines _getQuranDedicatedSitemap()');
ok(/let _quranSitemapCache = null;/.test(src) && /if \(_quranSitemapCache\) return _quranSitemapCache;/.test(body), 'built ONCE — cached in the module-level _quranSitemapCache (not rebuilt per request)');
ok(/for \(const _qr of _quranShared\(\)\.routes\)/.test(body), 'source = _quranShared().routes (the light cached routes table)');
ok(!/readFileSync|textUthmaniBody|surahs\/|tanzil-uthmani|kfgqpc/i.test(body), 'builder reads NO ayah text / surah files / Tanzil / KFGQPC');
ok(!/getCitySitemapChunks|getSitemapData|curated|bilingualUrl|countryCodes|_CURATED_PLACES/.test(body), 'builder calls NO city/country data + NO site-wide sitemap builder');
ok(/require\('crypto'\)[\s\S]*digest\('hex'\)/.test(body) && /ETag/.test(src.slice(src.indexOf('sitemap-quran'))), 'a strong ETag is precomputed');
ok(/brotliCompressSync/.test(body) && /gzipSync/.test(body), 'brotli + gzip are precomputed once');
// the route handler
const h0 = src.indexOf('/sitemap-quran\\.xml');
const handler = h0 >= 0 ? src.slice(src.indexOf('const mq = urlPath.match'), src.indexOf('// ===== /sitemap.xml')) : '';
ok(/_getQuranDedicatedSitemap\(\)/.test(handler), 'the /sitemap-quran.xml route serves from the cached builder');
ok(handler.includes('_normWeakETag') && handler.includes('_ifNoneMatchHit') && /writeHead\(304/.test(handler), 'conditional GET → 304 via an RFC-compatible weak ETag comparison (ignores the W/ prefix)');
ok(handler.includes("split(',')") && handler.includes("tok === '*'"), 'If-None-Match honours a comma-separated ETag list and "*"');
ok(handler.includes("req.headers['if-modified-since']") && handler.indexOf("req.headers['if-none-match']") < handler.indexOf("req.headers['if-modified-since']"), 'If-Modified-Since is only a fallback — If-None-Match takes precedence');
ok(!/getCitySitemapChunks|sitemap-main|bilingualUrl/.test(handler), 'the route does NOT invoke the city generator or the site-wide sitemap builder');
// site-wide sitemap NOT modified — its Quran block is still intact
ok(/const QURAN_PUBLIC_RELEASE_LASTMOD = '2026-07-22';/.test(src) && /entries\.push\(_quranSitemapUrl\('\/quran', '0\.8'\)\);/.test(src), 'the site-wide sitemap-main Quran block is left intact (not modified/removed)');
// robots.txt advertises the new sitemap additionally
ok(/Sitemap: \$\{SITE_URL\}\/sitemap\.xml/.test(src) && /Sitemap: \$\{SITE_URL\}\/sitemap-quran\.xml/.test(src), 'robots.txt keeps the site-wide Sitemap line AND adds the /sitemap-quran.xml line');

async function main() {
  // ---------------- RUNTIME ----------------
  const res = await fetch(B + '/sitemap-quran.xml');
  const ct = res.headers.get('content-type') || '';
  const etag = res.headers.get('etag') || '';
  const lastMod = res.headers.get('last-modified') || '';
  const xml = await res.text();
  ok(res.status === 200, '/sitemap-quran.xml → HTTP 200 — ' + res.status);
  ok(/^application\/xml/.test(ct), 'Content-Type is application/xml — «' + ct + '»');
  ok(/^<\?xml version="1\.0" encoding="UTF-8"\?>/.test(xml) && /<urlset\b/.test(xml) && /<\/urlset>/.test(xml), 'valid sitemap XML (xml decl + urlset open/close)');
  ok(xml.length < 30000, 'the raw XML is small (< 30 KB) — ' + xml.length + ' bytes');
  ok(!!etag, 'response carries an ETag — «' + etag + '»');

  const origin = B.replace(/\/+$/, '');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const paths = locs.map(u => u.replace(/^https?:\/\/[^/]+/, ''));
  const expected = new Set(ALL_PATHS);
  ok(locs.length === 115, 'exactly 115 <loc> — ' + locs.length);
  ok(new Set(paths).size === 115, '115 DISTINCT urls (duplicate = 0)');
  ok(ALL_PATHS.every(p => paths.includes(p)), 'missing = 0 (all of /quran + the 114 slug paths present)');
  ok(paths.every(p => expected.has(p)), 'extra = 0 (no url outside /quran)');
  ok(locs.every(u => u === origin + u.replace(/^https?:\/\/[^/]+/, '')), 'every <loc> is origin + path (absolute, same host)');
  ok(!locs.some(u => /[?]/.test(u)), 'query string = 0');
  ok(!locs.some(u => /#/.test(u)), 'fragment = 0');
  ok(!paths.some(p => /^\/(en|fr|de|tr|ur|id|es|bn|ms)\/quran/.test(p)), 'language-prefixed url = 0');
  ok(!paths.some(p => !/^\/quran(\/[a-z0-9-]+)?$/.test(p)), 'every path matches /quran or /quran/{slug} exactly');
  const urlBlocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m => m[1]);
  ok(urlBlocks.length === 115 && urlBlocks.every(b => b.includes('<lastmod>2026-07-22</lastmod>')), 'all 115 carry the fixed lastmod 2026-07-22');
  ok(!/xhtml:link|hreflang/.test(xml), 'the sitemap carries NO hreflang alternates (Arabic-only)');

  // every listed url is live + indexable + self-canonical
  let s200 = 0, idx = 0, canon = 0, noNoindex = 0, noHl = 0; const bad = [];
  for (const p of ALL_PATHS) {
    const r = await fetch(origin + p); const h = await r.text();
    if (r.status === 200) s200++; else { bad.push(p + ' status ' + r.status); continue; }
    const rob = (h.match(/name="robots"[^>]*content="([^"]*)"/) || [, ''])[1];
    if (/\bindex,follow\b/.test(rob) && !/noindex/.test(rob)) idx++; else bad.push(p + ' robots «' + rob + '»');
    if (!/noindex/i.test(rob) && !/noindex/i.test(r.headers.get('x-robots-tag') || '')) noNoindex++; else bad.push(p + ' noindex');
    const c = (h.match(/rel="canonical"[^>]*href="([^"]*)"/) || [, ''])[1];
    if (c === origin + p) canon++; else bad.push(p + ' canon «' + c + '»');
    if ((h.match(/rel="alternate" hreflang/g) || []).length === 0) noHl++; else bad.push(p + ' hreflang');
  }
  ok(s200 === 115, 'all 115 listed urls → HTTP 200 — ' + s200);
  ok(idx === 115, 'all 115 are indexable (index,follow) — ' + idx);
  ok(noNoindex === 115, 'noindex = 0 across the 115 — ' + noNoindex);
  ok(canon === 115, 'canonical correct 115/115 (self-canonical) — ' + canon);
  ok(noHl === 115, 'hreflang = 0 across the 115 — ' + noHl);
  if (bad.length) console.log('  (first deviations) ' + bad.slice(0, 5).join(' ;; '));

  // ---- conditional-GET matrix (weak-ETag + If-Modified-Since; If-None-Match precedence) ----
  const cond = async (headers) => {
    const r = await fetch(B + '/sitemap-quran.xml', { headers });
    const body = await r.text();
    return { status: r.status, len: body.length, etag: r.headers.get('etag') || '', lm: r.headers.get('last-modified') || '', cc: r.headers.get('cache-control') || '' };
  };
  const weak = 'W/' + etag;                              // the weak form Render's edge echoes back
  const olderDate = 'Mon, 21 Jul 2026 00:00:00 GMT';    // < Last-Modified (2026-07-22)
  const newerDate = 'Thu, 23 Jul 2026 00:00:00 GMT';    // > Last-Modified
  let c;
  c = await cond({ 'If-None-Match': etag });            ok(c.status === 304 && c.len === 0, '2) If-None-Match strong → 304 with empty body — ' + c.status + '/' + c.len);
  c = await cond({ 'If-None-Match': weak });            ok(c.status === 304 && c.len === 0, '3) If-None-Match weak W/"…" → 304 with empty body — ' + c.status + '/' + c.len);
  ok(c.etag === etag && c.lm === lastMod && /max-age=86400/.test(c.cc), '13) the 304 preserves ETag + Last-Modified + Cache-Control');
  c = await cond({ 'If-None-Match': '"nope-000", ' + weak }); ok(c.status === 304, '4) If-None-Match list (miss, then the weak match) → 304 — ' + c.status);
  c = await cond({ 'If-None-Match': '*' });             ok(c.status === 304, '5) If-None-Match: * → 304 — ' + c.status);
  c = await cond({ 'If-None-Match': '"deadbeef00"' });  ok(c.status === 200, '6) If-None-Match non-match → 200 — ' + c.status);
  c = await cond({ 'If-Modified-Since': lastMod });     ok(c.status === 304 && c.len === 0, '7) If-Modified-Since == Last-Modified → 304 — ' + c.status);
  c = await cond({ 'If-Modified-Since': newerDate });   ok(c.status === 304, '8) If-Modified-Since newer than Last-Modified → 304 — ' + c.status);
  c = await cond({ 'If-Modified-Since': olderDate });   ok(c.status === 200, '9) If-Modified-Since older than Last-Modified → 200 — ' + c.status);
  c = await cond({ 'If-Modified-Since': 'not-a-valid-date' }); ok(c.status === 200, '10) invalid If-Modified-Since → 200 — ' + c.status);
  c = await cond({ 'If-None-Match': '"deadbeef00"', 'If-Modified-Since': lastMod }); ok(c.status === 200, '11) If-None-Match miss + If-Modified-Since match → 200 (If-None-Match precedence) — ' + c.status);
  // 14 + 15 + 16 — the payload + the general sitemap are unchanged by this fix
  const xml2 = await (await fetch(B + '/sitemap-quran.xml')).text();
  ok([...xml2.matchAll(/<loc>/g)].length === 115, '14) still exactly 115 urls after the fix');
  ok(xml2 === xml, '15) the XML body is byte-identical across requests (deterministic, unchanged)');
  const smMain2 = await (await fetch(B + '/sitemap-main.xml')).text();
  ok([...smMain2.matchAll(/<loc>https?:\/\/[^/]+\/quran(\/[a-z0-9-]+)?<\/loc>/g)].length === 115, '16) the general sitemap-main still lists exactly 115 quran urls (unchanged)');
  // brotli negotiation still works on the 200 path
  const rBr = await fetch(B + '/sitemap-quran.xml', { headers: { 'accept-encoding': 'br' } });
  ok((rBr.headers.get('content-encoding') || '') === 'br', 'serves Content-Encoding: br on the 200 response when requested');

  console.log('RESULT quran_dedicated_sitemap: ' + pass + ' passed, ' + fail + ' failed');
  if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
}
main().catch(e => { console.log('  FAIL uncaught ' + (e && e.message)); process.exit(1); });
