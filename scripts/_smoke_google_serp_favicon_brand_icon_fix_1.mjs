// Smoke — GOOGLE-SERP-FAVICON-BRAND-ICON-FIX-1
// Google Search shows a generic/wrong favicon for timesprayers.com because the largest crawlable raster
// favicon was only 32x32 (Google prefers a SQUARE raster that is a multiple of 48px). This ticket adds
// root-path PNG favicons at 48 & 96 (generated from the official brand mark assets/brand/icon-512.png —
// dome + crescent + clock, NOT the OG image) and root copies of apple-touch/192/512, rewires index.html
// <link rel=icon> to declare the >=48 rasters + .ico "any" fallback + apple-touch, and points the manifest
// icons at the root files with name/short_name = "Times Prayers". No server/SEO/prayer/moon/qibla/azkar/GA
// change; server.js already serves any root file by extension (path.join(ROOT,urlPath)+fs.readFile) so no
// whitelist is needed. This smoke validates every icon file's real dimensions/format, the head links, the
// manifest (valid JSON + name + installable), "not SVG-only", "no og-image-as-favicon", and robots.
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const mani = fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8');
const srv  = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');

let pass = 0, fail = 0; const fails = [];
function ok(c, m) { if (c) { pass++; console.log('  PASS  ' + m); } else { fail++; fails.push(m); console.log('  FAIL  ' + m); } }

// ---- minimal PNG reader: signature + IHDR (w,h,bit,colorType,interlace) + IDAT integrity ----
function readPng(rel) {
  const b = fs.readFileSync(path.join(ROOT, rel));
  const sig = [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => b[i] === v);
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
  const bit = b[24], colorType = b[25], interlace = b[28];
  // walk chunks to collect IDAT + confirm it inflates (not corrupt)
  let pos = 8; const idat = []; let iend = false;
  while (pos < b.length) {
    const len = b.readUInt32BE(pos); const type = b.toString('ascii', pos + 4, pos + 8);
    if (type === 'IDAT') idat.push(b.subarray(pos + 8, pos + 8 + len));
    if (type === 'IEND') { iend = true; break; }
    pos += 12 + len;
  }
  let inflates = false; try { zlib.inflateSync(Buffer.concat(idat)); inflates = true; } catch (_) {}
  return { bytes: b.length, sig, w, h, bit, colorType, interlace, iend, inflates };
}
function readIco(rel) {
  const b = fs.readFileSync(path.join(ROOT, rel));
  const sig = b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0; // reserved=0, type=1 (icon)
  const count = b.readUInt16LE(4);
  const sizes = [];
  for (let i = 0; i < count; i++) {
    const off = 6 + i * 16; let w = b[off], h = b[off + 1]; if (w === 0) w = 256; if (h === 0) h = 256; sizes.push(w + 'x' + h);
  }
  return { bytes: b.length, sig, count, sizes };
}

console.log('================ 1. Root icon files: exist, valid PNG, SQUARE, exact dims ================');
const EXPECT = [['favicon-48x48.png', 48], ['favicon-96x96.png', 96], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]];
for (const [f, dim] of EXPECT) {
  ok(fs.existsSync(path.join(ROOT, f)), `${f} exists at web root`);
  const p = readPng(f);
  ok(p.sig, `${f}: valid PNG signature`);
  ok(p.w === dim && p.h === dim, `${f}: ${p.w}x${p.h} == ${dim}x${dim}`);
  ok(p.w === p.h, `${f}: SQUARE 1:1`);
  ok(p.bit === 8 && p.colorType === 6, `${f}: 8-bit RGBA (colorType 6)`);
  ok(p.interlace === 0 && p.iend && p.inflates, `${f}: non-interlaced + IEND + IDAT inflates (not corrupt)`);
}

console.log('\n================ 2. Google >=48px rule + multiples of 48 ================');
const p48 = readPng('favicon-48x48.png'), p96 = readPng('favicon-96x96.png');
ok(p48.w >= 48, `favicon-48x48 is >= 48px (Google preferred minimum)`);
ok(p96.w >= 48, `favicon-96x96 is >= 48px`);
ok(p48.w % 48 === 0 && p96.w % 48 === 0, `48 and 96 are both multiples of 48 (Google guidance)`);

console.log('\n================ 3. favicon.ico is a valid multi-size ICO ================');
const ico = readIco('favicon.ico');
ok(ico.sig, `favicon.ico: valid ICO header (type=1)`);
ok(ico.count >= 1, `favicon.ico: ${ico.count} embedded size(s) [${ico.sizes.join(', ')}]`);

console.log('\n================ 4. index.html <head> rel=icon links ================');
ok(/<link rel="icon" href="\/favicon\.ico" sizes="any">/.test(html), 'head: /favicon.ico with sizes="any" (multi-size fallback)');
ok(/<link rel="icon" type="image\/png" sizes="96x96" href="\/favicon-96x96\.png\?v=1">/.test(html), 'head: 96x96 PNG rel=icon (root, ?v=1)');
ok(/<link rel="icon" type="image\/png" sizes="48x48" href="\/favicon-48x48\.png\?v=1">/.test(html), 'head: 48x48 PNG rel=icon (root, ?v=1) — the Google >=48 signal');
ok(/<link rel="icon" type="image\/png" sizes="32x32" href="\/assets\/brand\/favicon-32x32\.png\?v=1">/.test(html), 'head: 32x32 PNG kept (small-size crispness)');
ok(/<link rel="icon" type="image\/png" sizes="16x16" href="\/assets\/brand\/favicon-16x16\.png\?v=1">/.test(html), 'head: 16x16 PNG kept');
ok(/<link rel="apple-touch-icon" sizes="180x180" href="\/apple-touch-icon\.png\?v=1">/.test(html), 'head: apple-touch-icon now at ROOT /apple-touch-icon.png');
ok(!/apple-touch-icon"[^>]*href="\/assets\/brand\/apple-touch-icon\.png/.test(html), 'head: apple-touch no longer points to /assets/brand/ (moved to root)');

console.log('\n================ 5. Not SVG-only (raster favicons declared) ================');
const pngIconLinks = (html.match(/<link rel="icon" type="image\/png"/g) || []).length;
ok(pngIconLinks >= 2, `head declares ${pngIconLinks} PNG rel=icon links (not SVG-only)`);
ok(/<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg\?v=2">/.test(html), 'head: SVG favicon kept as an additional (not the only) icon');

console.log('\n================ 6. manifest.webmanifest — valid JSON + Times Prayers + installable ================');
let m = null; try { m = JSON.parse(mani); ok(true, 'manifest is valid JSON'); } catch (e) { ok(false, 'manifest is valid JSON: ' + e.message); }
if (m) {
  ok(m.name === 'Times Prayers', `manifest name == "Times Prayers" (got "${m.name}")`);
  ok(m.short_name === 'Times Prayers', `manifest short_name == "Times Prayers" (got "${m.short_name}")`);
  const srcs = (m.icons || []).map(i => i.src);
  ok(srcs.includes('/icon-192.png'), 'manifest icons include /icon-192.png (root)');
  ok(srcs.includes('/icon-512.png'), 'manifest icons include /icon-512.png (root)');
  ok(srcs.includes('/favicon-48x48.png') && srcs.includes('/favicon-96x96.png'), 'manifest icons include 48 + 96');
  ok(srcs.includes('/apple-touch-icon.png'), 'manifest icons include /apple-touch-icon.png (root)');
  // every PNG icon entry must be square + root-absolute
  const pngIcons = (m.icons || []).filter(i => i.type === 'image/png');
  ok(pngIcons.length >= 5, `manifest has ${pngIcons.length} PNG icons`);
  ok(pngIcons.every(i => { const [w, h] = String(i.sizes).split('x').map(Number); return w === h && i.src.startsWith('/'); }), 'every manifest PNG icon is square + root-absolute');
  // PWA installability preserved: a >=192 PNG icon + display/start_url/scope
  const has192plus = pngIcons.some(i => { const w = Number(String(i.sizes).split('x')[0]); return w >= 192; });
  ok(has192plus, 'manifest keeps a >=192 PNG icon (PWA installable)');
  ok(m.display === 'standalone' && m.start_url === '/' && m.scope === '/', 'manifest display/start_url/scope intact (PWA not broken)');
  ok(!srcs.includes('/assets/brand/apple-touch-icon.png') && !srcs.includes('/assets/brand/icon-192.png'), 'manifest no longer references /assets/brand/ icon copies');
}

console.log('\n================ 7. No OG image used as a favicon/app icon ================');
const headFaviconBlock = (html.match(/<link rel="(?:icon|apple-touch-icon)"[^>]*>/g) || []).join('\n');
ok(!/og-image|og-images/.test(headFaviconBlock), 'head favicon links do NOT reference og-image / og-images');
ok(!/og-image|og-images/.test(mani), 'manifest icons do NOT reference og-image / og-images');

console.log('\n================ 8. Static serving + MIME + robots do NOT block icons ================');
ok(/'\.png':\s*'image\/png'/.test(srv), "server MIME map: .png -> image/png");
ok(/'\.ico':\s*'image\/x-icon'/.test(srv), "server MIME map: .ico -> image/x-icon");
ok(/'\.webmanifest':\s*'application\/manifest\+json'/.test(srv), "server MIME map: .webmanifest -> application/manifest+json");
ok(/const filePath\s*=\s*path\.join\(ROOT, urlPath\)/.test(srv) && /fs\.readFile\(filePath/.test(srv), 'server serves ANY root file by path (no whitelist) — new root icons served on disk read');
// robots block: Allow /, and none of the Disallow rules match an icon path
const robotsBlock = (srv.match(/User-agent:[\s\S]{0,400}?Sitemap:/) || [''])[0];
ok(/Allow:\s*\/'/.test(srv) || /Allow: \//.test(robotsBlock), 'robots.txt: Allow: /');
ok(!/Disallow:[^\n'`]*(png|ico|favicon|icon-|apple-touch|assets|webmanifest)/i.test(robotsBlock), 'robots.txt: no Disallow rule blocks any icon/manifest path');

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
