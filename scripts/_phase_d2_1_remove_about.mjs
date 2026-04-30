// Phase D2.1: Remove all /about-{city} pages from the site.
// - server.js: 6 edits (insert 410 handler; remove SEO block, sitemap emit,
//   two routes, .html-redirect mention, HOME_STRIP_IDS entry)
// - js/i18n.js: drop 6 about-city keys × 10 langs (line filter)
// - about-city.html: delete file
// - scripts/test-sitemap-output.mjs: drop 'about' from cityUrlRe + simplify line 83
//
// All anchored — exits non-zero on any mismatch (no partial state).
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const log = (...a) => console.log(...a);

// ─────────────────────────────────────────────────────────────────────────
// Helper: anchored block replacement.
function replaceBlock(s, name, startAnchor, endAnchor, newContent) {
  const i = s.indexOf(startAnchor);
  if (i < 0) throw new Error(`${name}: startAnchor not found`);
  const j = s.indexOf(endAnchor, i + startAnchor.length);
  if (j < 0) throw new Error(`${name}: endAnchor not found after start`);
  const fullEnd = j + endAnchor.length;
  const second = s.indexOf(startAnchor, i + 1);
  if (second >= 0 && second < fullEnd) throw new Error(`${name}: startAnchor non-unique inside block`);
  log(`OK ${name}: replacing ${fullEnd - i} chars at index ${i}`);
  return s.substring(0, i) + newContent + s.substring(fullEnd);
}

function replaceExact(s, name, oldText, newText) {
  const cnt = s.split(oldText).length - 1;
  if (cnt !== 1) throw new Error(`${name}: expected 1 match, got ${cnt}`);
  log(`OK ${name}: replacing exact-match (${oldText.length} chars)`);
  return s.replace(oldText, newText);
}

// ═══════════════════════════════════════════════════════════════════════
// 1) server.js — 6 edits
// ═══════════════════════════════════════════════════════════════════════
const SERVER_PATH = path.join(ROOT, 'server.js');
const srv = fs.readFileSync(SERVER_PATH, 'utf8');
const isCRLF = /\r\n/.test(srv);
const EOL = isCRLF ? '\r\n' : '\n';
let s = srv;

// (a) Insert 410 handler BEFORE the .html → clean URL redirect.
// Anchor: the "===== SEO: Redirect روابط .html..." comment.
{
  const handlerBlock = [
    '    // ===== Phase D2.1: /about-{city}* → 410 Gone (kept: /about-us only) =====',
    '    // Excludes /about-us and language-prefixed about-us; everything else under',
    '    // /about- is permanently removed (city about pages were thin/duplicate).',
    '    {',
    '        const _aboutPathRe = /^\\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\\/)?about-/;',
    '        const _aboutUsPathRe = /^\\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\\/)?about-us(?:\\.html)?\\/?$/;',
    '        if (_aboutPathRe.test(urlPath) && !_aboutUsPathRe.test(urlPath)) {',
    "            res.writeHead(410, {",
    "                'Content-Type': 'text/html; charset=utf-8',",
    "                'Cache-Control': 'no-cache, no-store, must-revalidate',",
    "                'X-Robots-Tag': 'noindex'",
    '            });',
    "            res.end('<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>410 Gone</title><meta name=\"robots\" content=\"noindex\"></head><body><h1>410 Gone</h1><p>This page has been permanently removed.</p></body></html>');",
    '            return;',
    '        }',
    '    }',
    '',
    '    // ===== SEO: Redirect روابط .html الديناميكية → روابط نظيفة (301) ====='
  ].join(EOL);
  s = replaceExact(s, 'server.js (a) insert 410 handler',
    '    // ===== SEO: Redirect روابط .html الديناميكية → روابط نظيفة (301) =====',
    handlerBlock);
}

// (b) Remove `about-[a-z0-9]|` from the .html redirect alternation
{
  const oldFrag = "(?:prayer-times-in-|qibla-in-|about-[a-z0-9]|msbaha$";
  const newFrag = "(?:prayer-times-in-|qibla-in-|msbaha$";
  s = replaceExact(s, 'server.js (b) drop about- from .html-redirect regex',
    oldFrag, newFrag);
}

// (c) Delete the /about-{city}-{lat}-{lng} SEO block (added in D2)
// Anchor: from "    // ── About city pages: /about-{slug}-{lat}-{lng} ──"
// through the closing "    }" line and a blank line, ending right before
// the moon-city-pages comment block.
{
  const startA = '    // ── About city pages: /about-{slug}-{lat}-{lng} ──';
  const endA = '    }' + EOL + EOL + '    // ── Moon city pages';
  s = replaceBlock(s, 'server.js (c) remove about-city SEO block',
    startA, endA,
    '    // ── About city pages: REMOVED in Phase D2.1 (now 410 Gone) ──' + EOL + EOL +
    '    // ── Moon city pages');
}

// (d) Delete sitemap emission line for /about-
{
  const oldLine = "                entries.push(...bilingualUrl('/about-' + slug, '0.5', 'monthly', today));" + EOL;
  s = replaceExact(s, 'server.js (d) drop /about- sitemap emit',
    oldLine, '');
}

// (e) Delete the two route handlers that serve about-city.html
// Route 1: lines ~10604–10611
{
  const startA = '    // ===== about-* pages (about-city.html) =====';
  const endA = '    }' + EOL + EOL + '    // ===== صفحة كل دول العالم';
  s = replaceBlock(s, 'server.js (e1) remove about-city route #1',
    startA, endA,
    '    // ===== صفحة كل دول العالم');
}
// Route 2: lines ~10761–10769
{
  const startA = '    // صفحة عن المدينة: /about-{slug}';
  const endA = '    }' + EOL + EOL + '    // ملاحظة: routes';
  s = replaceBlock(s, 'server.js (e2) remove about-city route #2',
    startA, endA,
    '    // ملاحظة: routes');
}

// (f) Remove 'about-city' from _HOME_STRIP_IDS (line 2782)
{
  const oldFrag = "    'city-info', 'about-city',";
  const newFrag = "    'city-info',";
  s = replaceExact(s, 'server.js (f) drop about-city from HOME_STRIP_IDS',
    oldFrag, newFrag);
}

fs.writeFileSync(SERVER_PATH, s, 'utf8');
log('✓ server.js — all 6 edits applied');

// ═══════════════════════════════════════════════════════════════════════
// 2) js/i18n.js — drop about.* keys (60 lines × 10 langs)
// ═══════════════════════════════════════════════════════════════════════
const I18N_PATH = path.join(ROOT, 'js', 'i18n.js');
const i18nRaw = fs.readFileSync(I18N_PATH, 'utf8');
const i18nLines = i18nRaw.split(/\r?\n/);
const dropRe = /^\s*['"]about\.(loading|about_city|map|no_wiki|city_load_error|no_wiki_info)['"]\s*:\s*/;
const kept = [];
let dropped = 0;
for (const ln of i18nLines) {
  if (dropRe.test(ln)) { dropped++; continue; }
  kept.push(ln);
}
if (dropped === 0) throw new Error('i18n.js: no about-city keys found — already removed?');
fs.writeFileSync(I18N_PATH, kept.join(EOL), 'utf8');
log(`✓ js/i18n.js — dropped ${dropped} about-city key lines`);

// ═══════════════════════════════════════════════════════════════════════
// 3) about-city.html — delete file
// ═══════════════════════════════════════════════════════════════════════
const ABOUT_HTML = path.join(ROOT, 'about-city.html');
if (fs.existsSync(ABOUT_HTML)) {
  fs.unlinkSync(ABOUT_HTML);
  log('✓ about-city.html — deleted');
} else {
  log('○ about-city.html — already absent');
}

// ═══════════════════════════════════════════════════════════════════════
// 4) scripts/test-sitemap-output.mjs — drop 'about' from cityUrlRe
// ═══════════════════════════════════════════════════════════════════════
const TEST_PATH = path.join(ROOT, 'scripts', 'test-sitemap-output.mjs');
const tst = fs.readFileSync(TEST_PATH, 'utf8');
let t = tst;

// Drop |about from the alternation.
{
  const oldRe = '|moon-today-in|moon-in|about|time-left-until-prayer-in|next-prayer-time-in';
  const newRe = '|moon-today-in|moon-in|time-left-until-prayer-in|next-prayer-time-in';
  t = replaceExact(t, 'test-sitemap (regex) drop |about',
    oldRe, newRe);
}

// Simplify the seemsCity logic — /about- can no longer appear in sitemap.
{
  const oldChunk = [
    '                    // Country slugs like /prayer-times-in-saudi-arabia don\'t match curated; skip those',
    '                    // Detect country-list URLs by checking against the simple pattern (only with no extra)',
    '                    const seemsCity = !path.includes(\'/about-\') ||',
    '                        validSlugs.has(slug) || /-/.test(slug);',
  ].join(EOL);
  const newChunk = [
    '                    // Country slugs like /prayer-times-in-saudi-arabia don\'t match curated; skip those',
    '                    // (Phase D2.1: /about-{city} URLs were removed entirely; the seemsCity guard',
    '                    //  used to special-case them is now obsolete.)',
  ].join(EOL);
  t = replaceExact(t, 'test-sitemap (logic) drop seemsCity guard',
    oldChunk, newChunk);
}

fs.writeFileSync(TEST_PATH, t, 'utf8');
log('✓ scripts/test-sitemap-output.mjs — patched');

log('');
log('All Phase D2.1 edits applied.');
