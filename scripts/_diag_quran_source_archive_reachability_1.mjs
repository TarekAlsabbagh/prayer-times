/* QURAN-SOURCE-LINK-LABEL-AND-TARGET-CONSISTENCY-ALL-PAGES-1 — DIAGNOSTIC, not part of the daily suite.

   Named `_diag_…`, NOT `_smoke_quran_…`, deliberately: the runner globs `_smoke_quran_*.mjs`, and a check
   that depends on a third-party host must never be able to turn the regression suite red because that host
   had a bad afternoon. The label assertions that DO gate every run live in
   _smoke_quran_source_link_label_consistency_1.mjs and touch no network.

   What this proves, on demand, is that the label still tells the truth about the target:
     • the URL the pages link to is the manifest's own downloadUrl
     • HTTPS, and the host belongs to the source authority
     • it answers (200), following at most one redirect, and the FINAL url is what we describe
     • the response is an archive, not an HTML page — by Content-Type AND by the ZIP magic number
   It reads only the first four bytes; the 10 MB archive is never downloaded.

   Run: node scripts/_diag_quran_source_archive_reachability_1.mjs */
import fs from 'fs';

const MANIFEST = JSON.parse(fs.readFileSync('data/quran/kfgqpc-hafs-v2-0/source-manifest.json', 'utf8'));
// NOT named `URL`: that identifier is the global WHATWG URL class, and shadowing it breaks `new URL(...)`
// three lines below. (It did, once.)
const ARCHIVE_URL = MANIFEST.source.downloadUrl;
const HOST_SUFFIX = 'qurancomplex.gov.sa';   // the source authority's own domain

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  PASS ' + m); } else { fail++; console.log('  FAIL ' + m); } };

console.log('--- §3 the external archive the label describes ---');
console.log('  url: ' + ARCHIVE_URL);

const u = new URL(ARCHIVE_URL);
ok(u.protocol === 'https:', `HTTPS — ${u.protocol}`);
ok(u.hostname === HOST_SUFFIX || u.hostname.endsWith('.' + HOST_SUFFIX),
   `host belongs to the source authority — ${u.hostname}`);
ok(/\.zip$/i.test(u.pathname), `the path ends in .zip — ${u.pathname.split('/').pop()}`);

let head = null, redirect = null;
try {
  head = await fetch(ARCHIVE_URL, { method: 'HEAD', redirect: 'manual' });
  if (head.status >= 300 && head.status < 400) {
    redirect = head.headers.get('location');
    console.log('  redirect → ' + redirect);
    head = await fetch(new URL(redirect, ARCHIVE_URL), { method: 'HEAD' });
  }
} catch (e) {
  console.log('  NETWORK ERROR: ' + e.message);
  console.log('\n  This is a diagnostic. A failure here means the external host is unreachable RIGHT NOW —');
  console.log('  it does not mean the page label is wrong, and it does not gate the regression suite.');
  console.log(`\nRESULT: ${pass} passed, ${fail + 1} failed`);
  process.exitCode = 1;
  process.exit();
}

ok(head.status === 200, `final status 200 — ${head.status}`);
ok(redirect === null, `no redirect — ${redirect || 'direct'}`);
const ct = (head.headers.get('content-type') || '').toLowerCase();
ok(/zip|octet-stream/.test(ct), `Content-Type is an archive, not text/html — ${ct || '(none)'}`);
const len = +(head.headers.get('content-length') || 0);
ok(len > 1024 * 1024, `Content-Length looks like a real package — ${len} bytes (${(len / 1048576).toFixed(2)} MB)`);

// the decisive check: the first four bytes of a ZIP are always PK\x03\x04
const r = await fetch(ARCHIVE_URL, { headers: { Range: 'bytes=0-3' } });
const magic = Buffer.from(await r.arrayBuffer());
ok(magic.length >= 4 && magic[0] === 0x50 && magic[1] === 0x4B && magic[2] === 0x03 && magic[3] === 0x04,
   `the bytes on the wire are a ZIP — ${[...magic].map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ')}`);

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
