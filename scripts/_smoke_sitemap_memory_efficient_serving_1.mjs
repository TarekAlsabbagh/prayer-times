// SITEMAP-MEMORY-EFFICIENT-SERVING-1 — smoke test
// Boots server.js (streaming sitemap serving) with SITE_URL=https://timesprayers.com and asserts:
//   (a) CORRECTNESS of the new streaming path: for every sitemap file, the GZIP-streamed body
//       (Accept-Encoding: gzip) gunzips to EXACTLY the identity body (Accept-Encoding: identity)
//       — proving the zlib.createGzip() stream produces byte-identical output;
//   (b) CONTENT unchanged: total <loc> across all files == 175,710; required curated-index cities
//       present; noindex-legacy + discovered absent; host = https://timesprayers.com only;
//   (c) SIZE-SPLIT still holds: every file < 50 MB and < 50k URLs, follows the <lastmod> policy, is application/xml;
//       (INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1: "has <lastmod>" became the per-file lastmod policy — see lastmodPolicy)
//   (d) index lists sitemap-main + sitemap-cities-1..N; sitemap-cities-(N+1) → 404; robots unchanged.
//   SITEMAP-SEMANTIC-PARTITIONING-1: the index now lists the semantic family URL-set files (+ sitemap-quran) directly. Every index
//       child AND every legacy file (sitemap-main + sitemap-cities-1..N, no longer referenced but still served) gets (a)-(c);
//       (b)'s 175,710 total stays pinned to the legacy files (pre-existing red on 12bae98: they serve 176,020) and the index
//       children must expose exactly legacy + sitemap-quran; (d) = family listing + legacy and family phantom shards → 404.
// Self-contained (spawns + tears down its own server).
import { spawn } from 'node:child_process';
import http from 'node:http';
import zlib from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PORT = 8101;
const HOST = 'https://timesprayers.com';
const MAX_BYTES = 50 * 1024 * 1024;
const MAX_URLS = 50000;
const EXPECT_TOTAL_LOC = 175710;
// SITEMAP-SEMANTIC-PARTITIONING-1: ticket budget for every index child + the family listing order
const FAMILY_MAX_URLS = 25000;
const FAMILY_MAX_BYTES = 35000000;
const FAMILY_ORDER = ['prayer', 'qibla', 'time-left', 'next-prayer', 'moon', 'hijri', 'quran', 'azkar', 'guides', 'ramadan', 'pages'];
const QURAN_LASTMOD = '2026-07-22';

let pass = 0, fail = 0; const fails = [];
const ok = (c, m) => { if (c) pass++; else { fail++; fails.push(m); } console.log(`  ${c ? 'PASS' : 'FAIL'}  ${m}`); };

// INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1: per-file <lastmod> policy (replaces "every file has <lastmod>"). <lastmod> is emitted
//   ONLY for a real last-change date, never the request day: sitemap-main → exactly the 20 /[lang/]privacy + /[lang/]terms
//   entries at the LEGAL_PAGES legal-meta date; every other main entry and every city shard → none.
// SITEMAP-SEMANTIC-PARTITIONING-1: the policy is keyed by <loc> instead of the file name (the privacy/terms blocks now also live
//   in the pages family file, the Quran file is an index child): /[lang/]privacy + /[lang/]terms → exactly one <lastmod> = the
//   legal date, and a file carrying them carries all 20; /quran[/slug] → exactly one = 2026-07-22, only inside /sitemap-quran.xml;
//   every other <url> → none. The "20 legal entries" total is asserted per corpus (index children / legacy sitemap-main) below.
const LEGAL_LASTMOD = '2026-08-09';
function lastmodPolicy(p, text) {
    const total = (text.match(/<lastmod>/g) || []).length;
    let legal = 0, legalOk = 0, quran = 0, quranOk = 0, other = 0;
    for (const [, b] of text.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
        const loc = (b.match(/<loc>([^<]+)<\/loc>/) || [])[1] || '';
        const lms = [...b.matchAll(/<lastmod>([^<]*)<\/lastmod>/g)].map(m => m[1]);
        if (/^https?:\/\/[^/]+(?:\/(?:en|fr|tr|ur|de|id|es|bn|ms))?\/(?:privacy|terms)$/.test(loc)) { legal++; if (lms.length === 1 && lms[0] === LEGAL_LASTMOD) legalOk++; }
        else if (/^https?:\/\/[^/]+\/quran(?:\/[a-z0-9-]+)?$/.test(loc)) { quran++; if (lms.length === 1 && lms[0] === QURAN_LASTMOD) quranOk++; }
        else if (lms.length) other++;
    }
    const quranFile = /\/sitemap-quran\.xml$/.test(p);
    return { legal, ok: (legal === 0 || legal === 20) && legalOk === legal && quranOk === quran && (quran === 0 || quranFile) && other === 0 && total === legal + quran,
             detail: `legal=${legal} legalAt${LEGAL_LASTMOD}=${legalOk} quran=${quran} quranAt${QURAN_LASTMOD}=${quranOk} otherWithLastmod=${other} lastmod=${total}` };
}
// SITEMAP-SEMANTIC-PARTITIONING-1: index child name → { fam, k } (k = 0 for a single-file family), null for any other name.
const famOf = (u) => { const m = String(u).match(/\/sitemap-([a-z]+(?:-[a-z]+)*?)(?:-([1-9]\d*))?\.xml$/); return m && FAMILY_ORDER.includes(m[1]) ? { fam: m[1], k: m[2] ? Number(m[2]) : 0 } : null; };
function familyListing(children) {
    const fams = children.map(famOf);
    const count = {}; for (const f of fams) if (f) count[f.fam] = (count[f.fam] || 0) + 1;
    const orderOk = fams.every((f, i) => {
        if (!f) return false;
        const numOk = count[f.fam] === 1 ? f.k === 0 : (f.k >= 1 && f.k <= count[f.fam]);
        if (i === 0) return numOk && f.k <= 1;
        const prev = fams[i - 1];
        return numOk && (prev && ((prev.fam === f.fam && prev.k + 1 === f.k) || (FAMILY_ORDER.indexOf(prev.fam) < FAMILY_ORDER.indexOf(f.fam) && f.k <= 1)));
    });
    return { ok: children.length > 0 && orderOk, count };
}
const NEEDLES = ['/', '/prayer-times-in-riyadh', '/prayer-times-in-saudi-arabia', '/prayer-times-in-praia', '/prayer-times-in-qubtan', '/prayer-times-in-qubtan-al-jabal',
    ...['marrakech', 'washington', 'delhi', 'qassim', 'al-ahsa', 'ad-dana'].map(np => `/prayer-times-in-${np}`)];
const get = (p, enc) => new Promise((resolve) => {
    http.get({ host: 'localhost', port: PORT, path: p, headers: enc ? { 'Accept-Encoding': enc } : {} }, res => {
        const chunks = []; res.on('data', d => chunks.push(d));
        res.on('end', () => resolve({ status: res.statusCode, ctype: res.headers['content-type'] || '', enc: res.headers['content-encoding'] || '', bytes: Buffer.concat(chunks) }));
    }).on('error', () => resolve({ status: -1, ctype: '', enc: '', bytes: Buffer.alloc(0) }));
});

const srv = spawn('node', ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT), SITE_URL: HOST }, stdio: 'ignore' });
const cleanup = () => { try { srv.kill(); } catch (_) {} };
process.on('exit', cleanup);

// Check one sitemap file: gzip==identity, structural, size/url caps, host, no-noindex. Returns loc count.
// SITEMAP-SEMANTIC-PARTITIONING-1: `index` = the file is an index child (→ also the family budget); returns the needles found
//   instead of the full text (index children + legacy files together would be ~460 MB of text).
async function checkFile(p, index, idnPre) {
    const idn = idnPre || await get(p, 'identity');   // SITEMAP-SEMANTIC-PARTITIONING-1: reuse the legacy probe response (one identity fetch per file)
    const gzp = await get(p, 'gzip');
    let gunz = Buffer.alloc(0);
    try { gunz = zlib.gunzipSync(gzp.bytes); } catch (_) {}
    const text = idn.bytes.toString('utf8');
    const locs = (text.match(/<loc>/g) || []).length;
    const offhost = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].filter(m => !m[1].startsWith(HOST)).length;
    const bad = (text.match(/onrender|localhost|staging/gi) || []).length;
    const noidx = (text.match(/noindex|discovered/gi) || []).length;
    ok(idn.status === 200 && idn.ctype.includes('application/xml'), `${p} identity: 200 application/xml`);
    ok(gzp.status === 200 && gzp.enc === 'gzip', `${p} gzip: 200 Content-Encoding: gzip`);
    ok(gunz.length > 0 && Buffer.compare(idn.bytes, gunz) === 0, `${p} gzip-stream gunzips to EXACT identity bytes (byte-identical)`);
    // INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1: "has <lastmod>" → the per-file lastmod policy (lastmodPolicy above).
    const lm = lastmodPolicy(p, text);
    ok(idn.bytes.length < MAX_BYTES && locs < MAX_URLS && lm.ok, `${p} <50MB(${(idn.bytes.length/1048576).toFixed(2)}) <50k(${locs}) lastmod[${lm.detail}]`);
    ok(offhost === 0 && bad === 0 && noidx === 0, `${p} host-clean offhost=${offhost} bad=${bad} noidx=${noidx}`);
    // SITEMAP-SEMANTIC-PARTITIONING-1: index children stay within the family budget (<= 25,000 URLs, <= 35,000,000 bytes)
    if (index) ok(idn.status === 200 && locs <= FAMILY_MAX_URLS && idn.bytes.length <= FAMILY_MAX_BYTES, `${p} within the family budget (<= ${FAMILY_MAX_URLS} URLs: ${locs}, <= ${FAMILY_MAX_BYTES} bytes: ${idn.bytes.length})`);
    const found = NEEDLES.filter(n => text.includes(`<loc>${HOST}${n}</loc>`));
    return { locs, legal: lm.legal, found, status: idn.status };
}

(async () => {
    let booted = false;
    for (let i = 0; i < 80; i++) { const r = await get('/sitemap.xml', 'identity'); if (r.status === 200) { booted = true; break; } await new Promise(r => setTimeout(r, 500)); }
    ok(booted, 'server booted + /sitemap.xml 200');
    if (!booted) { cleanup(); process.exit(1); }

    // index
    const idx = await get('/sitemap.xml', 'identity');
    ok(idx.bytes.toString('utf8').includes('<sitemapindex'), 'sitemap.xml is <sitemapindex>');
    // INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1: index children carry no <lastmod> (no reliable last-change date; never the request day)
    ok(!idx.bytes.toString('utf8').includes('<lastmod>'), 'sitemap.xml index children carry NO <lastmod>');
    const children = [...idx.bytes.toString('utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    // SITEMAP-SEMANTIC-PARTITIONING-1: "index lists sitemap-main + ≥1 sitemap-cities-N" → the index lists only semantic family
    //   URL-set files, in family order, multi-shard families numbered 1..N; no legacy file name is referenced any more.
    const listing = familyListing(children);
    ok(listing.ok, `index lists ${children.length} semantic family URL-set file(s) in family order, shards numbered 1..N (${JSON.stringify(listing.count)})`);
    ok(!children.some(u => /\/sitemap-(?:main|cities-\d+)\.xml$/.test(u)), 'index lists no legacy sitemap-main.xml / sitemap-cities-N.xml');
    ok(children.every(u => u.startsWith(HOST)), 'index children all on timesprayers.com');
    // index gzip==identity too
    const idxGz = await get('/sitemap.xml', 'gzip');
    let idxGunz = Buffer.alloc(0); try { idxGunz = zlib.gunzipSync(idxGz.bytes); } catch (_) {}
    ok(Buffer.compare(idx.bytes, idxGunz) === 0, 'sitemap.xml index gzip == identity (index still via sendXml, unchanged)');

    // every file: correctness + structural, accumulate loc + full text for presence
    // SITEMAP-SEMANTIC-PARTITIONING-1: two corpora — every index child, then the legacy files (sitemap-main + sitemap-cities-1..N,
    //   probed until the first non-200; still served). Needles are tracked per corpus.
    const corp = { index: { locs: 0, legal: 0, found: new Set() }, legacy: { locs: 0, legal: 0, found: new Set() } };
    let quranLocs = 0;
    for (const url of children) {
        const p = url.replace(HOST, '');
        const r = await checkFile(p, true);
        corp.index.locs += r.locs; corp.index.legal += r.legal; r.found.forEach(n => corp.index.found.add(n));
        if (/\/sitemap-quran\.xml$/.test(p)) quranLocs = r.locs;
    }
    let cityN = 0;
    {
        const r = await checkFile('/sitemap-main.xml', false);
        corp.legacy.locs += r.locs; corp.legacy.legal += r.legal; r.found.forEach(n => corp.legacy.found.add(n));
    }
    for (;;) {
        const p = `/sitemap-cities-${cityN + 1}.xml`;
        const probe = await get(p, 'identity');
        if (probe.status !== 200 || cityN >= 500) break;
        cityN++;
        const r = await checkFile(p, false, probe);
        corp.legacy.locs += r.locs; corp.legacy.legal += r.legal; r.found.forEach(n => corp.legacy.found.add(n));
    }
    // SITEMAP-SEMANTIC-PARTITIONING-1: the pinned total stays on the legacy files it was written for (unchanged pre-existing expectation)
    ok(corp.legacy.locs === EXPECT_TOTAL_LOC, `total <loc> across all files == ${EXPECT_TOTAL_LOC} (got ${corp.legacy.locs})`);
    console.log(`  INFO  city files=${cityN} | total <loc>=${corp.legacy.locs} | index children=${children.length} (<loc>=${corp.index.locs})`);
    // SITEMAP-SEMANTIC-PARTITIONING-1: the index children expose exactly the legacy URLs + the Quran file; 20 legal lastmod entries per corpus
    ok(corp.index.locs === corp.legacy.locs + quranLocs, `index children <loc> (${corp.index.locs}) === legacy sitemap-main + sitemap-cities-1..${cityN} (${corp.legacy.locs}) + sitemap-quran (${quranLocs})`);
    ok(corp.index.legal === 20 && corp.legacy.legal === 20, `privacy/terms <lastmod> entries: 20 across the index children (${corp.index.legal}), 20 in legacy sitemap-main (${corp.legacy.legal})`);

    // content unchanged: required present / forbidden absent
    // SITEMAP-SEMANTIC-PARTITIONING-1: in the index children AND in the legacy files
    for (const kp of ['/', '/prayer-times-in-riyadh', '/prayer-times-in-saudi-arabia', '/prayer-times-in-praia', '/prayer-times-in-qubtan', '/prayer-times-in-qubtan-al-jabal']) {
        ok(corp.index.found.has(kp) && corp.legacy.found.has(kp), `PRESENT (curated index): ${kp}`);
    }
    for (const np of ['marrakech', 'washington', 'delhi', 'qassim', 'al-ahsa', 'ad-dana']) {
        ok(!corp.index.found.has(`/prayer-times-in-${np}`) && !corp.legacy.found.has(`/prayer-times-in-${np}`), `ABSENT (noindex/discovered): /prayer-times-in-${np}`);
    }

    // 404 guard + robots
    // SITEMAP-SEMANTIC-PARTITIONING-1: legacy phantom shard (legacy files still served) + the next shard of every multi-shard family
    const next = await get(`/sitemap-cities-${cityN + 1}.xml`, 'identity');
    ok(cityN >= 1 && next.status === 404, `sitemap-cities-${cityN + 1}.xml → 404`);
    for (const [fam, n] of Object.entries(listing.count)) {
        if (n < 2) continue;
        const r = await get(`/sitemap-${fam}-${n + 1}.xml`, 'identity');
        ok(r.status === 404, `sitemap-${fam}-${n + 1}.xml → 404`);
    }
    const rob = await get('/robots.txt', 'identity');
    ok(rob.bytes.toString('utf8').includes(`Sitemap: ${HOST}/sitemap.xml`), `robots.txt Sitemap → ${HOST}/sitemap.xml`);

    cleanup();
    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    if (fail > 0) { console.log('FAILED:'); fails.forEach(f => console.log('  - ' + f)); }
    process.exit(fail === 0 ? 0 : 1);
})();
