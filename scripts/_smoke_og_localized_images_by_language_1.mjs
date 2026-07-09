// Smoke — SOCIAL-SHARE-LOCALIZED-OG-IMAGES-BY-LANGUAGE-1
// Builds on the single /og-image.png ticket: the share card is now LOCALIZED per page language.
// og:image / og:image:secure_url / twitter:image resolve to /og-images/og-{lang}.png so the
// WhatsApp/Facebook/Twitter preview matches the page language. Asserts: (1) server.js selection
// logic (10-lang set + `en` fallback + per-lang URL); (2) all 10 raster files exist, valid,
// 1200x630, <600KB; (3) og:image:type/width/height + twitter:card scaffolding intact; (4) og:url
// stays canonical, JSON-LD logo stays generic; (5) no SVG / no relative og:image.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const srv = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const LANGS = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];

let pass = 0, fail = 0; const fails = [];
function ok(c, m) { if (c) { pass++; console.log('  PASS  ' + m); } else { fail++; fails.push(m); console.log('  FAIL  ' + m); } }

console.log('================ 1. server.js per-language selection ================');
const langsLine = srv.match(/const _OG_IMG_LANGS = \[([^\]]+)\];/);
ok(!!langsLine, '_OG_IMG_LANGS array present');
if (langsLine) {
  const set = langsLine[1].replace(/['"\s]/g, '').split(',').filter(Boolean);
  ok(LANGS.every(l => set.includes(l)) && set.length === 10, '_OG_IMG_LANGS has exactly the 10 site languages');
}
ok(/const _ogImgLang = _OG_IMG_LANGS\.indexOf\(lang\) >= 0 \? lang : 'en';/.test(srv), "fallback = 'en' when lang not in the set");
ok(/const ogImageUrl = `\$\{origin\}\/og-images\/og-\$\{_ogImgLang\}\.png`;/.test(srv), 'ogImageUrl = `${origin}/og-images/og-${lang}.png` (absolute, per-lang)');
ok(!/const ogImageUrl = `\$\{origin\}\/og-image\.png`;/.test(srv), 'no longer a single static /og-image.png for og:image');
ok(!/og-image\.svg\?/.test(srv), 'no dynamic og-image.svg?t= reference for og:image');

// functional: extract the mapping logic and exercise it
const _sel = new Function('lang', `${langsLine[0]}\nreturn _OG_IMG_LANGS.indexOf(lang) >= 0 ? lang : 'en';`);
ok(_sel('ar') === 'ar' && _sel('en') === 'en' && _sel('fr') === 'fr' && _sel('bn') === 'bn', 'known langs map to themselves (ar/en/fr/bn)');
ok(_sel('xx') === 'en' && _sel('') === 'en' && _sel(undefined) === 'en', 'unknown/empty lang → en fallback');

console.log('\n================ 2. meta emitted via seo.ogImageUrl (per-lang) ================');
ok(/<meta property="og:image" content="\$\{esc\(seo\.ogImageUrl\)\}">/.test(srv), 'og:image = seo.ogImageUrl');
ok(/<meta property="og:image:secure_url" content="\$\{esc\(seo\.ogImageUrl\)\}">/.test(srv), 'og:image:secure_url = seo.ogImageUrl');
ok(/<meta name="twitter:image" content="\$\{esc\(seo\.ogImageUrl\)\}">/.test(srv), 'twitter:image = seo.ogImageUrl');
ok(/<meta property="og:image:type" content="image\/png">/.test(srv), 'og:image:type image/png');
ok(/<meta property="og:image:width" content="1200">/.test(srv) && /<meta property="og:image:height" content="630">/.test(srv), 'og:image:width 1200 + height 630');
ok(/<meta property="og:image:alt" content="\$\{esc\(seo\.title\)\}">/.test(srv), 'og:image:alt = per-page localized title');
ok(/<meta name="twitter:card" content="summary_large_image">/.test(srv), 'twitter:card = summary_large_image');
ok(/<meta property="og:url" content="\$\{esc\(seo\.canonical\)\}">/.test(srv), 'og:url = canonical (unchanged)');

console.log('\n================ 3. the 10 raster assets ================');
for (const l of LANGS) {
  const p = path.join(ROOT, 'og-images', 'og-' + l + '.png');
  if (!fs.existsSync(p)) { ok(false, 'og-' + l + '.png exists'); continue; }
  const b = fs.readFileSync(p);
  const sig = b.slice(0, 8).toString('hex') === '89504e470d0a1a0a';
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
  ok(sig && w === 1200 && h === 630 && b.length > 5 * 1024 && b.length < 600 * 1024,
     `og-${l}.png valid PNG 1200x630 ${(b.length / 1024).toFixed(0)}KB (<600KB)`);
}

console.log('\n================ 4. JSON-LD logo stays generic + .png mime + invariants ================');
ok(/"url": `\$\{seo\.origin\}\/og-image\.png`,/.test(srv), 'JSON-LD logo ImageObject stays generic /og-image.png (NOT per-lang)');
ok(/"url": seo\.ogImageUrl,/.test(srv), 'primary OG ImageObject follows seo.ogImageUrl (per-lang, representativeOfPage)');
ok(/'\.png':\s*'image\/png'/.test(srv), 'mimeTypes maps .png → image/png');
ok(/hreflang/.test(srv), 'hreflang emission still present (untouched)');
ok(/handleOgImage/.test(srv), 'legacy /og-image.svg endpoint retained (harmless, unreferenced)');

console.log(`\nPASS=${pass}  FAIL=${fail}`);
if (fail > 0) { console.log('FAILED:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
