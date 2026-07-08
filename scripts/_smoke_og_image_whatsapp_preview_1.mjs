// Smoke — SOCIAL-SHARE-OG-IMAGE-WHATSAPP-PREVIEW-1
// The share preview was blank on WhatsApp/Facebook because og:image pointed at an SVG
// (/og-image.svg), which those platforms don't render. This ticket ships a static 1200x630
// raster PNG (/og-image.png) and points every SSR page's og:image + twitter:image at it, with
// og:image:secure_url + og:image:type added. Asserts: (1) server.js meta wiring; (2) the PNG
// asset exists, is a valid 1200x630 PNG under 600KB; (3) .png mime; (4) canonical/robots/twitter
// scaffolding untouched.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const srv = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');

let pass = 0, fail = 0; const fails = [];
function ok(c, m) { if (c) { pass++; console.log('  PASS  ' + m); } else { fail++; fails.push(m); console.log('  FAIL  ' + m); } }

console.log('================ 1. ogImageUrl → static absolute PNG (not SVG) ================');
ok(/const ogImageUrl = `\$\{origin\}\/og-image\.png`;/.test(srv), 'ogImageUrl = `${origin}/og-image.png` (absolute, static)');
ok(!/const ogImageUrl = `\$\{origin\}\/og-image\.svg/.test(srv), 'ogImageUrl no longer the dynamic SVG endpoint');

console.log('\n================ 2. OG/Twitter meta emitted ================');
ok(/<meta property="og:image" content="\$\{esc\(seo\.ogImageUrl\)\}">/.test(srv), 'og:image = seo.ogImageUrl');
ok(/<meta property="og:image:secure_url" content="\$\{esc\(seo\.ogImageUrl\)\}">/.test(srv), 'og:image:secure_url present (NEW)');
ok(/<meta property="og:image:type" content="image\/png">/.test(srv), 'og:image:type = image/png (NEW)');
ok(/<meta property="og:image:width" content="1200">/.test(srv), 'og:image:width 1200');
ok(/<meta property="og:image:height" content="630">/.test(srv), 'og:image:height 630');
ok(/<meta property="og:image:alt" content="\$\{esc\(seo\.title\)\}">/.test(srv), 'og:image:alt (per-page title)');
ok(/<meta property="og:url" content="\$\{esc\(seo\.canonical\)\}">/.test(srv), 'og:url = canonical');
ok(/<meta property="og:type" content="\$\{esc\(seo\.ogType\)\}">/.test(srv), 'og:type present');
ok(/<meta name="twitter:card" content="summary_large_image">/.test(srv), 'twitter:card = summary_large_image');
ok(/<meta name="twitter:image" content="\$\{esc\(seo\.ogImageUrl\)\}">/.test(srv), 'twitter:image = seo.ogImageUrl (PNG)');
ok(/<meta name="twitter:title" content="\$\{esc\(seo\.title\)\}">/.test(srv), 'twitter:title present');
ok(/<meta name="twitter:description" content="\$\{esc\(seo\.description\)\}">/.test(srv), 'twitter:description present');

console.log('\n================ 3. JSON-LD ImageObject uses the PNG ================');
ok(/"url": `\$\{seo\.origin\}\/og-image\.png`,/.test(srv), 'logo ImageObject url → og-image.png');
ok(/"contentUrl": `\$\{seo\.origin\}\/og-image\.png`,/.test(srv), 'logo ImageObject contentUrl → og-image.png');
ok(/"url": seo\.ogImageUrl,/.test(srv), 'primary OG ImageObject url = seo.ogImageUrl (auto PNG)');

console.log('\n================ 4. The raster asset itself ================');
const pngPath = path.join(ROOT, 'og-image.png');
ok(fs.existsSync(pngPath), 'og-image.png exists at repo root (served at /og-image.png)');
if (fs.existsSync(pngPath)) {
  const b = fs.readFileSync(pngPath);
  ok(b.slice(0, 8).toString('hex') === '89504e470d0a1a0a', 'valid PNG signature');
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
  ok(w === 1200 && h === 630, `dimensions 1200x630 (got ${w}x${h})`);
  ok(b.length < 600 * 1024, `size under 600KB (got ${(b.length / 1024).toFixed(1)}KB)`);
  ok(b.length > 5 * 1024, 'size sane (> 5KB, not an empty/placeholder file)');
}

console.log('\n================ 5. .png served as image/png + invariants untouched ================');
ok(/'\.png':\s*'image\/png'/.test(srv), 'mimeTypes maps .png → image/png');
ok(/<link rel="canonical"/.test(srv) || /rel=\\"canonical\\"/.test(srv) || /canonical/.test(srv), 'canonical emission still present (untouched)');
ok(/hreflang/.test(srv), 'hreflang emission still present (untouched)');
ok(/handleOgImage/.test(srv), 'legacy /og-image.svg endpoint retained (harmless, now unreferenced by meta)');

console.log(`\nPASS=${pass}  FAIL=${fail}`);
if (fail > 0) { console.log('FAILED:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
