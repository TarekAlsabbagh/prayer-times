/*
 * _smoke_quran_ad_safety_1.mjs
 * Proves the Quran pages ship NO real ad code (no AdSense script / publisher id / ad slot / pagead2 loader),
 * carry the structural ad-safety backstop over the verse-reading surface, document the Auto Ads exclusion,
 * bump the cache-buster to v25, and keep the Tanzil attribution intact. Pure-Node static analysis, no server.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'css', 'quran.css'), 'utf8');
const qjs = fs.existsSync(path.join(ROOT, 'js', 'quran.js')) ? fs.readFileSync(path.join(ROOT, 'js', 'quran.js'), 'utf8') : '';
const qhjs = fs.existsSync(path.join(ROOT, 'js', 'quran-home.js')) ? fs.readFileSync(path.join(ROOT, 'js', 'quran-home.js'), 'utf8') : '';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; } else { fail++; console.error('  FAIL: ' + m); } };

// ---- NO real ad code in any Quran runtime script (prose "AdSense" in privacy copy is NOT ad code) ----
const AD_CODE = /pagead2\.googlesyndication|ca-pub-\d|data-ad-slot|data-ad-client|<script[^>]*adsbygoogle/i;
ok(!AD_CODE.test(qjs), 'js/quran.js contains no real ad code (no adsbygoogle script / ca-pub / ad slot)');
ok(!AD_CODE.test(qhjs), 'js/quran-home.js contains no real ad code');
// server.js: the ONLY adsense-ish tokens allowed are privacy/cookie prose + the ad-safety selectors/comment;
// there must be NO adsbygoogle loader, NO publisher id, NO ad slot.
ok(!/pagead2\.googlesyndication/.test(server), 'server.js loads no pagead2/googlesyndication ad script');
ok(!/ca-pub-\d/.test(server), 'server.js carries no AdSense publisher id (ca-pub-*)');
ok(!/data-ad-slot|data-ad-client/.test(server), 'server.js carries no ad slot / ad client attribute');

// ---- structural ad-safety backstop in css/quran.css ----
ok(/\[data-quran-reading-surface\]\s+ins\.adsbygoogle/.test(css), 'css backstop targets injected ad containers inside the reading surface');
ok(/\[data-quran-reading-surface\][^{]*\{\s*display:\s*none\s*!important/s.test(css.replace(/\n/g, ' ')) || /googlesyndication"\],[\s\S]*?display:\s*none\s*!important/.test(css), 'reading-surface ad backstop is display:none !important (no CLS)');
ok(/AD-SAFETY|Ad-safety backstop/.test(css), 'css documents the ad-safety intent');

// ---- Auto Ads exclusion documented in server.js + reading surface marked ----
ok(/AD-SAFETY[\s\S]{0,200}Auto Ads/.test(server), 'server.js documents the /quran + /quran/* Auto Ads exclusion');
ok(/data-quran-reading-surface/.test(server), 'the flat renderer marks the verse-reading surface (data-quran-reading-surface)');

// ---- cache-buster bumped to v25 exactly (no v24, no v26) ----
const v25 = (server.match(/quran\.css\?v=25/g) || []).length;
ok(v25 === 2, 'quran.css?v=25 injected on both Quran routes (got ' + v25 + ')');
ok(!/quran\.css\?v=24/.test(server), 'no stale quran.css?v=24 remains');
ok(!/quran\.css\?v=26/.test(server), 'no premature quran.css?v=26');

// ---- Tanzil attribution intact (from the source migration) ----
ok(/_quranTanzilLinksHtml/.test(server), 'Tanzil links helper present');
ok(/tanzil\.net/.test(server) && /creativecommons\.org\/licenses\/by\/3\.0/.test(server), 'Tanzil project + CC BY 3.0 license links present');
ok(/tanzil\.net\/docs\/download/.test(server), 'official Tanzil download link present');
ok(/quran-source-trust/.test(server), 'source/trust section present');

console.log((fail === 0 ? 'PASS' : 'FAIL') + ': _smoke_quran_ad_safety_1 — ' + pass + ' passed, ' + fail + ' failed');
if (fail === 0) console.log('  QURAN PAGES CARRY ZERO REAL AD CODE, A READING-SURFACE AD BACKSTOP, DOCUMENTED AUTO-ADS EXCLUSION, v25');
process.exitCode = fail ? 1 : 0;
