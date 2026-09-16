// SITEMAP-CURATED-SYNC-AFTER-SIZE-SPLIT-1 — smoke test
// Boots server.js with SITE_URL=https://timesprayers.com and asserts:
//  (a) the sitemap CITY set == the curated index set (_CURATED_PLACES): curated index cities
//      (praia/qubtan/qubtan-al-jabal/riyadh) ARE present; noindex legacy curated-slugs-only entries
//      (marrakech/washington/delhi/qassim — served noindex) are ABSENT; discovered (ad-dana) absent;
//  (b) the SIZE-SPLIT fix still holds: every /sitemap-cities-N.xml < 50MB and < 50k URLs;
//  (c) host = https://timesprayers.com only; no onrender/localhost/staging; no discovered/noindex.
// Self-contained (spawns + tears down its own server).
import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PORT = 8098;
const HOST = 'https://timesprayers.com';
const MAX_BYTES = 50 * 1024 * 1024;
const MAX_URLS = 50000;
// SITEMAP-SEMANTIC-PARTITIONING-1: /sitemap.xml now lists the semantic family URL-set files (+ /sitemap-quran.xml) directly;
//   every index child must also stay within the ticket budget (<= 25,000 URLs, <= 35,000,000 uncompressed bytes). The legacy
//   /sitemap-main.xml + /sitemap-cities-N.xml are no longer referenced but still served — they are read explicitly below.
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
const get = (p) => new Promise((resolve) => {
    http.get({ host: 'localhost', port: PORT, path: p }, res => {
        const chunks = []; res.on('data', d => chunks.push(d));
        res.on('end', () => { const b = Buffer.concat(chunks); resolve({ status: res.statusCode, ctype: res.headers['content-type'] || '', bytes: b.length, text: b.toString('utf8') }); });
    }).on('error', () => resolve({ status: -1, ctype: '', bytes: 0, text: '' }));
});

const srv = spawn('node', ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT), SITE_URL: HOST }, stdio: 'ignore' });
const cleanup = () => { try { srv.kill(); } catch (_) {} };
process.on('exit', cleanup);

(async () => {
    let booted = false;
    for (let i = 0; i < 60; i++) { const r = await get('/sitemap.xml'); if (r.status === 200) { booted = true; break; } await new Promise(r => setTimeout(r, 500)); }
    ok(booted, 'server booted + /sitemap.xml 200');
    if (!booted) { cleanup(); process.exit(1); }

    const idx = await get('/sitemap.xml');
    ok(idx.text.includes('<sitemapindex'), 'sitemap.xml is <sitemapindex>');
    // INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1: index children carry no <lastmod> (no reliable last-change date; never the request day)
    ok(!idx.text.includes('<lastmod>'), 'sitemap.xml index children carry NO <lastmod>');
    const children = [...idx.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    // SITEMAP-SEMANTIC-PARTITIONING-1: "index lists sitemap-main + ≥1 sitemap-cities-N" → the index lists only semantic family
    //   URL-set files, in family order, multi-shard families numbered 1..N; no legacy file name is referenced any more.
    const listing = familyListing(children);
    ok(listing.ok, `index lists ${children.length} semantic family URL-set file(s) in family order, shards numbered 1..N [SPLIT preserved] (${JSON.stringify(listing.count)})`);
    ok(!children.some(u => /\/sitemap-(?:main|cities-\d+)\.xml$/.test(u)), 'index lists no legacy sitemap-main.xml / sitemap-cities-N.xml');
    ok(children.every(u => u.startsWith(HOST)), 'index children all on timesprayers.com');

    // fetch every file once; run size/split/host/noindex checks + accumulate full text for presence
    // SITEMAP-SEMANTIC-PARTITIONING-1: two corpora, each file fetched once — the index children, then the legacy files (sitemap-main +
    //   sitemap-cities-1..N, probed until the first non-200; still served). Presence is tracked per corpus (no 2×230 MB concatenation).
    const NEEDLES = ['/', '/prayer-times-in-riyadh', '/prayer-times-in-saudi-arabia', '/prayer-times-in-praia', '/prayer-times-in-qubtan', '/prayer-times-in-qubtan-al-jabal',
        ...['marrakech', 'washington', 'delhi', 'qassim', 'al-ahsa', 'ad-dana'].map(np => `/prayer-times-in-${np}`)];
    const corp = { index: { locs: 0, legal: 0, found: new Set() }, legacy: { locs: 0, legal: 0, found: new Set() } };
    let maxBytes = 0, quranLocs = 0;
    const checkFile = (which, p, r) => {
        const locs = (r.text.match(/<loc>/g) || []).length;
        const offhost = [...r.text.matchAll(/<loc>([^<]+)<\/loc>/g)].filter(m => !m[1].startsWith(HOST)).length;
        const bad = (r.text.match(/onrender|localhost|staging/gi) || []).length;
        const noidx = (r.text.match(/noindex|discovered/gi) || []).length;
        // INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1: "has <lastmod>" → the per-file lastmod policy (lastmodPolicy above).
        const lm = lastmodPolicy(p, r.text);
        // SITEMAP-SEMANTIC-PARTITIONING-1: index children also stay within the family budget (<= 25,000 URLs, <= 35,000,000 bytes)
        const budget = which !== 'index' || (locs <= FAMILY_MAX_URLS && r.bytes <= FAMILY_MAX_BYTES);
        const good = r.status === 200 && r.ctype.includes('application/xml') && r.bytes < MAX_BYTES && locs < MAX_URLS && budget && lm.ok && offhost === 0 && bad === 0 && noidx === 0;
        ok(good, `${p} : 200 xml <50MB(${(r.bytes/1048576).toFixed(2)}) <50k(${locs})${which === 'index' ? ` budget[<=${FAMILY_MAX_URLS} urls, <=${FAMILY_MAX_BYTES} bytes: ${budget}]` : ''} lastmod[${lm.detail}] offhost=${offhost} bad=${bad} noidx=${noidx}`);
        corp[which].locs += locs; corp[which].legal += lm.legal; maxBytes = Math.max(maxBytes, r.bytes);
        if (/\/sitemap-quran\.xml$/.test(p)) quranLocs = locs;
        for (const n of NEEDLES) if (r.text.includes(`<loc>${HOST}${n}</loc>`)) corp[which].found.add(n);
    };
    for (const url of children) { const p = url.replace(HOST, ''); checkFile('index', p, await get(p)); }
    checkFile('legacy', '/sitemap-main.xml', await get('/sitemap-main.xml'));
    let cityN = 0, next = null;
    for (;;) {
        const p = `/sitemap-cities-${cityN + 1}.xml`;
        const r = await get(p);
        if (r.status !== 200 || cityN >= 500) { next = r; break; }
        cityN++; checkFile('legacy', p, r);
    }
    console.log(`  INFO  index children=${children.length} (<loc>=${corp.index.locs}) | legacy city files=${cityN} (<loc> incl. sitemap-main=${corp.legacy.locs}) | largest file=${(maxBytes/1048576).toFixed(2)}MB`);
    // SITEMAP-SEMANTIC-PARTITIONING-1: the index children expose exactly the legacy URLs + the Quran file; 20 legal lastmod entries per corpus
    ok(corp.index.locs === corp.legacy.locs + quranLocs, `index children <loc> (${corp.index.locs}) === legacy sitemap-main + sitemap-cities-1..${cityN} (${corp.legacy.locs}) + sitemap-quran (${quranLocs})`);
    ok(corp.index.legal === 20 && corp.legacy.legal === 20, `privacy/terms <lastmod> entries: 20 across the index children (${corp.index.legal}), 20 in legacy sitemap-main (${corp.legacy.legal})`);
    const inBoth = (n) => corp.index.found.has(n) && corp.legacy.found.has(n);
    const inNone = (n) => !corp.index.found.has(n) && !corp.legacy.found.has(n);

    // (a) curated index cities MUST be present
    // SITEMAP-SEMANTIC-PARTITIONING-1: presence / absence hold in the index children AND in the legacy files
    for (const kp of ['/', '/prayer-times-in-riyadh', '/prayer-times-in-saudi-arabia', '/prayer-times-in-praia', '/prayer-times-in-qubtan', '/prayer-times-in-qubtan-al-jabal']) {
        ok(inBoth(kp), `PRESENT (curated index): ${kp}`);
    }
    // (b) noindex legacy curated-slugs-only MUST be absent
    for (const np of ['marrakech', 'washington', 'delhi', 'qassim', 'al-ahsa']) {
        ok(inNone(`/prayer-times-in-${np}`), `ABSENT (noindex legacy): /prayer-times-in-${np}`);
    }
    // (c) discovered MUST be absent
    ok(inNone('/prayer-times-in-ad-dana'), 'ABSENT (discovered): /prayer-times-in-ad-dana');

    // 404 guard + robots
    // SITEMAP-SEMANTIC-PARTITIONING-1: legacy phantom shard (legacy files still served) + the next shard of every multi-shard family
    ok(cityN >= 1 && next.status === 404, `sitemap-cities-${cityN + 1}.xml → 404`);
    for (const [fam, n] of Object.entries(listing.count)) {
        if (n < 2) continue;
        const r = await get(`/sitemap-${fam}-${n + 1}.xml`);
        ok(r.status === 404, `sitemap-${fam}-${n + 1}.xml → 404`);
    }
    const rob = await get('/robots.txt');
    ok(rob.text.includes(`Sitemap: ${HOST}/sitemap.xml`), `robots.txt Sitemap → ${HOST}/sitemap.xml`);

    cleanup();
    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    if (fail > 0) { console.log('FAILED:'); fails.forEach(f => console.log('  - ' + f)); }
    process.exit(fail === 0 ? 0 : 1);
})();
