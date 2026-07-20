/* QURAN-SOURCE-LINK-LABEL-AND-TARGET-CONSISTENCY-ALL-PAGES-1

   The external source link must describe what it actually opens — a published ZIP archive, not a web page —
   and it must read IDENTICALLY on /quran and on every one of the 114 surah pages. The old label («صفحة
   المصدر…») promised a page and delivered a 10 MB download; a reader only found out by clicking.

   This is the durable guard. It sweeps all 115 pages and checks four things per page: exactly one external
   source link, the approved visible text, an accessible name that names the format, and the href still
   pointing at the manifest's own downloadUrl. It also asserts the INTERNAL «#quran-source-trust» anchor is
   untouched — the two links live in the same section and must never be confused for one another.

   NO network call to the external host: a third-party outage must not turn this suite red. The live check on
   the archive (status / content-type / ZIP magic) lives in the separate diagnostic smoke.

   Run with QURAN_SSR_BASE / QURAN_SMOKE_URL (default http://localhost:3000). */
import fs from 'fs';

const B = process.env.QURAN_SSR_BASE || process.env.QURAN_SMOKE_URL || 'http://localhost:3000';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  PASS ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const ROOT = 'data/quran/kfgqpc-hafs-v2-0';
const MANIFEST = JSON.parse(fs.readFileSync(ROOT + '/source-manifest.json', 'utf8'));
const ROUTES = JSON.parse(fs.readFileSync(ROOT + '/metadata/surah-routes.json', 'utf8')).surahs;
const URL_EXPECTED = MANIFEST.source.downloadUrl;

const TEXT = 'تنزيل ملف مصدر النص القرآني من مجمع الملك فهد (ZIP)';
const ARIA = 'تنزيل ملف مصدر النص القرآني من مجمع الملك فهد بصيغة ZIP';
// every retired spelling: none of them may come back as the label of a ZIP download
const RETIRED = ['صفحة المصدر', 'زيارة صفحة المصدر', 'عرض صفحة المصدر', 'رابط صفحة المصدر'];

// the <a class="quran-source-link"> elements on a page, with their attributes and inner text
const links = html => [...html.matchAll(/<a\b([^>]*\bclass="[^"]*quran-source-link[^"]*"[^>]*)>([\s\S]*?)<\/a>/g)]
  .map(m => ({
    attrs: m[1],
    href: (m[1].match(/\bhref="([^"]*)"/) || [, ''])[1],
    aria: (m[1].match(/\baria-label="([^"]*)"/) || [, ''])[1],
    rel: (m[1].match(/\brel="([^"]*)"/) || [, ''])[1],
    target: (m[1].match(/\btarget="([^"]*)"/) || [, ''])[1],
    // the accessible name is the aria-label when present; the arrow span is aria-hidden and excluded
    text: m[2].replace(/<span[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/span>/g, '').replace(/<[^>]+>/g, '').trim(),
  }));

const check = (html, where) => {
  const L = links(html);
  const problems = [];
  if (L.length !== 1) problems.push(`${L.length} external source links`);
  else {
    const a = L[0];
    if (a.text !== TEXT) problems.push(`visible text = «${a.text}»`);
    if (a.aria !== ARIA) problems.push(`aria-label = «${a.aria}»`);
    if (!a.aria.includes('بصيغة ZIP')) problems.push('accessible name does not name the format');
    if (a.href !== URL_EXPECTED) problems.push(`href = ${a.href}`);
    if (a.target === '_blank' && !/\bnoopener\b/.test(a.rel)) problems.push(`target=_blank without noopener (rel="${a.rel}")`);
    if (a.target === '_blank' && !/\bnoreferrer\b/.test(a.rel)) problems.push(`target=_blank without noreferrer (rel="${a.rel}")`);
  }
  // a retired label is only a problem when it labels the ZIP link — the words may legitimately appear in prose
  for (const r of RETIRED) if (L.some(a => a.text.includes(r))) problems.push(`retired label «${r}» used for the ZIP link`);
  return problems.length ? `${where}: ${problems.join(' | ')}` : null;
};

console.log('--- §7 /quran — one external source link, approved label ---');
{
  const html = await (await fetch(B + '/quran')).text();
  const L = links(html);
  ok(L.length === 1, `exactly one external source link — ${L.length}`);
  const bad = check(html, '/quran');
  ok(!bad, bad || `label, accessible name, href and rel all correct`);
  ok(L[0] && L[0].text === TEXT, `visible text = «${TEXT}»`);
  ok(L[0] && L[0].aria === ARIA, `accessible name = «${ARIA}»`);
  ok(L[0] && L[0].href === URL_EXPECTED, `href = the manifest downloadUrl`);
  ok(/\.zip(\?|$)/i.test(L[0] ? L[0].href : ''), 'the href really ends in .zip');
  // the internal anchor into the surah source section is a DIFFERENT link and must be left alone
  ok(/href="\/quran\/[a-z-]+#quran-source-trust"/.test(html), 'the internal #quran-source-trust link is still present and route-qualified');
}

console.log('\n--- §7 all 114 surah pages — identical label, identical href ---');
{
  let one = 0, text = 0, aria = 0, href = 0, anchor = 0, rel = 0, status = 0;
  const problems = [];
  for (const rec of ROUTES) {
    const res = await fetch(B + rec.path);
    if (res.status === 200) status++;
    const html = await res.text();
    const L = links(html);
    if (L.length === 1) one++;
    if (L[0] && L[0].text === TEXT) text++;
    if (L[0] && L[0].aria === ARIA) aria++;
    if (L[0] && L[0].href === URL_EXPECTED) href++;
    if (L[0] && /\bnoopener\b/.test(L[0].rel) && /\bnoreferrer\b/.test(L[0].rel)) rel++;
    if ((html.match(/id="quran-source-trust"/g) || []).length === 1) anchor++;
    const bad = check(html, rec.path);
    if (bad && problems.length < 5) problems.push(bad);
  }
  ok(status === 114, `114/114 surah pages → 200 — ${status}`);
  ok(one === 114, `114/114 carry exactly one external source link — ${one}`);
  ok(text === 114, `114/114 show the approved visible text — ${text}`);
  ok(aria === 114, `114/114 expose the approved accessible name — ${aria}`);
  ok(href === 114, `114/114 point at the manifest downloadUrl — ${href}`);
  ok(rel === 114, `114/114 carry rel noopener + noreferrer — ${rel}`);
  ok(anchor === 114, `114/114 still own exactly one #quran-source-trust section — ${anchor}`);
  ok(problems.length === 0, `no page deviates — ${problems.join(' ;; ') || 'none'}`);
}

console.log('\n--- §7 the 115-page total ---');
{
  const home = await (await fetch(B + '/quran')).text();
  let total = links(home).length;
  let matching = links(home).filter(a => a.text === TEXT && a.aria === ARIA && a.href === URL_EXPECTED).length;
  for (const rec of ROUTES) {
    const L = links(await (await fetch(B + rec.path)).text());
    total += L.length;
    matching += L.filter(a => a.text === TEXT && a.aria === ARIA && a.href === URL_EXPECTED).length;
  }
  ok(total === 115, `115 external source links across the section (1 home + 114 surahs) — ${total}`);
  ok(matching === 115, `115/115 identical in text, accessible name and href — ${matching}`);
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
