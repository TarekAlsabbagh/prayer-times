/* QURAN-TANZIL-ORPHANED-SMOKES-AND-COMPLETE-LIGHTHOUSE-CLOSURE-1 §4.

   Retargeted from the removed KFGQPC ZIP-download link to the LIVE Tanzil source attribution. Every Quran page
   — /quran and all 114 surah pages — must name Tanzil as the SOLE source of the text, expose the four approved
   Tanzil links (project / CC BY 3.0 licence / text-updates / official download page), state the version and the
   "shown unmodified" wording, and carry ZERO residue of the old KFGQPC provenance: no King-Fahd-Complex name, no
   UthmanicHafs ZIP, no copied SurahQuran wording, and no claim that this site owns the Quran text.

   Reads the surah list from the Tanzil manifest. Fetches over HTTP (SSR), so the local server must be running.
   Base = QURAN_SSR_BASE / QURAN_SMOKE_URL (default http://127.0.0.1:8085), matching the other SSR smokes.

   QURAN_SSR_BASE=http://localhost:8080 node scripts/_smoke_quran_source_link_label_consistency_1.mjs */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const B = process.env.QURAN_SSR_BASE || process.env.QURAN_SMOKE_URL || 'http://127.0.0.1:8085';
let pass = 0, fail = 0; const F = [];
const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));

const ROUTES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/quran/tanzil-uthmani-1-1/metadata/surah-routes.json'), 'utf8')).surahs;

// The four approved Tanzil source links — the ONLY external source links a Quran page may carry.
const TANZIL_LINKS = [
  'https://tanzil.net',
  'https://creativecommons.org/licenses/by/3.0/',
  'https://tanzil.net/updates/',
  'https://tanzil.net/docs/download',
];
// Wording that must appear on every page (source section identity + version + licence + "unmodified").
const MUST = ['مصدر النص القرآني', 'مشروع Tanzil', 'إصدار ١٫١', 'Creative Commons Attribution 3.0', 'دون تعديل'];
// KFGQPC / copied-source residue that must appear NOWHERE.
const FORBIDDEN = [
  ['مجمع الملك فهد', 'King-Fahd-Complex name (Arabic)'],
  ['King Fahd', 'King Fahd (English)'],
  ['KFGQPC', 'KFGQPC token'],
  ['UthmanicHafs', 'UthmanicHafs archive name'],
  ['UthmanicHafs_v2-0.zip', 'the old ZIP filename'],
  ['surahquran', 'SurahQuran copied wording'],
  ['حقوق النص محفوظة', 'a "text rights reserved by this site" claim'],
];

// every <a class="quran-source-link"> on a page, with the attributes we care about
const sourceLinks = (html) => [...html.matchAll(/<a\b([^>]*\bclass="[^"]*quran-source-link[^"]*"[^>]*)>/g)].map(m => ({
  attrs: m[1],
  href: (m[1].match(/\bhref="([^"]*)"/) || [, ''])[1],
  aria: (m[1].match(/\baria-label="([^"]*)"/) || [, ''])[1],
  rel: (m[1].match(/\brel="([^"]*)"/) || [, ''])[1],
  target: (m[1].match(/\btarget="([^"]*)"/) || [, ''])[1],
}));

const inspect = (html, where) => {
  const problems = [];
  for (const w of MUST) if (!html.includes(w)) problems.push(`missing «${w}»`);
  for (const [bad, why] of FORBIDDEN) if (new RegExp(bad, 'i').test(html)) problems.push(`FORBIDDEN ${why}`);
  const L = sourceLinks(html);
  const hrefs = L.map(a => a.href);
  for (const u of TANZIL_LINKS) if (!hrefs.includes(u)) problems.push(`missing source link ${u}`);
  // no source link may point anywhere other than the four approved Tanzil URLs, and each must be well-formed https
  for (const a of L) {
    if (!TANZIL_LINKS.includes(a.href)) problems.push(`unexpected source link ${a.href}`);
    if (!/^https:\/\/[^\s"]+$/.test(a.href)) problems.push(`malformed href ${a.href}`);
    if (!a.aria) problems.push(`source link ${a.href} has no accessible name`);
    if (/\bnofollow\b/.test(a.rel)) problems.push(`source link ${a.href} carries rel=nofollow`);
    if (a.target === '_blank' && !(/\bnoopener\b/.test(a.rel) && /\bnoreferrer\b/.test(a.rel))) problems.push(`target=_blank without noopener/noreferrer on ${a.href}`);
  }
  return problems.length ? `${where}: ${problems.slice(0, 6).join(' | ')}` : null;
};

console.log('--- §4 /quran — Tanzil is the sole named source, four approved links, zero KFGQPC residue ---');
{
  const html = await (await fetch(B + '/quran')).text();
  const bad = inspect(html, '/quran');
  ok(!bad, bad || 'source section names Tanzil + version + CC BY 3.0 + "unmodified", four approved links, no KFGQPC residue');
  const hrefs = sourceLinks(html).map(a => a.href);
  for (const u of TANZIL_LINKS) ok(hrefs.includes(u), `/quran carries the source link ${u}`);
  ok(/href="\/quran\/[a-z0-9-]+#quran-source-trust"/.test(html), '/quran links into a surah #quran-source-trust section');
}

console.log('\n--- §4 all 114 surah pages — identical Tanzil attribution, one trust section each ---');
{
  let status = 0, must = 0, links4 = 0, clean = 0, trust = 0; const problems = [];
  for (const rec of ROUTES) {
    const res = await fetch(B + rec.path);
    if (res.status === 200) status++;
    const html = await res.text();
    if (MUST.every(w => html.includes(w))) must++;
    const hrefs = sourceLinks(html).map(a => a.href);
    if (TANZIL_LINKS.every(u => hrefs.includes(u)) && hrefs.every(h => TANZIL_LINKS.includes(h))) links4++;
    if (!FORBIDDEN.some(([bad]) => new RegExp(bad, 'i').test(html))) clean++;
    if ((html.match(/id="quran-source-trust"/g) || []).length === 1) trust++;
    const bad = inspect(html, rec.path);
    if (bad && problems.length < 5) problems.push(bad);
  }
  ok(status === 114, `114/114 surah pages → HTTP 200 — ${status}`);
  ok(must === 114, `114/114 carry the Tanzil source wording (name + ١٫١ + CC BY 3.0 + «دون تعديل») — ${must}`);
  ok(links4 === 114, `114/114 expose EXACTLY the four approved Tanzil links — ${links4}`);
  ok(clean === 114, `114/114 carry ZERO KFGQPC / copied-source residue — ${clean}`);
  ok(trust === 114, `114/114 own exactly one #quran-source-trust section — ${trust}`);
  ok(problems.length === 0, `no page deviates — ${problems.join(' ;; ') || 'none'}`);
}

console.log('\n--- §4 the whole section is Tanzil, KFGQPC nowhere in the 115-page sweep ---');
{
  let residue = 0;
  const home = await (await fetch(B + '/quran')).text();
  if (FORBIDDEN.some(([bad]) => new RegExp(bad, 'i').test(home))) residue++;
  for (const rec of ROUTES) {
    const html = await (await fetch(B + rec.path)).text();
    if (FORBIDDEN.some(([bad]) => new RegExp(bad, 'i').test(html))) residue++;
  }
  ok(residue === 0, `0/115 pages carry any KFGQPC or copied-source residue — ${residue} did`);
}

console.log(`\nRESULT source_link_label_consistency(Tanzil): ${pass} passed, ${fail} failed`);
if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
