// SITEMAP-MEMORY-EFFICIENT-SERVING-1 — smoke test
// Boots server.js (streaming sitemap serving) with SITE_URL=https://timesprayers.com and asserts:
//   (a) CORRECTNESS of the new streaming path: for every sitemap file, the GZIP-streamed body
//       (Accept-Encoding: gzip) gunzips to EXACTLY the identity body (Accept-Encoding: identity)
//       — proving the zlib.createGzip() stream produces byte-identical output;
//   (b) CONTENT unchanged: total <loc> across all files == 175,710; required curated-index cities
//       present; noindex-legacy + discovered absent; host = https://timesprayers.com only;
//   (c) SIZE-SPLIT still holds: every file < 50 MB and < 50k URLs, has <lastmod>, is application/xml;
//   (d) index lists sitemap-main + sitemap-cities-1..N; sitemap-cities-(N+1) → 404; robots unchanged.
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

let pass = 0, fail = 0; const fails = [];
const ok = (c, m) => { if (c) pass++; else { fail++; fails.push(m); } console.log(`  ${c ? 'PASS' : 'FAIL'}  ${m}`); };
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
async function checkFile(p) {
    const idn = await get(p, 'identity');
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
    ok(idn.bytes.length < MAX_BYTES && locs < MAX_URLS && text.includes('<lastmod>'), `${p} <50MB(${(idn.bytes.length/1048576).toFixed(2)}) <50k(${locs}) lastmod`);
    ok(offhost === 0 && bad === 0 && noidx === 0, `${p} host-clean offhost=${offhost} bad=${bad} noidx=${noidx}`);
    return { locs, text };
}

(async () => {
    let booted = false;
    for (let i = 0; i < 80; i++) { const r = await get('/sitemap.xml', 'identity'); if (r.status === 200) { booted = true; break; } await new Promise(r => setTimeout(r, 500)); }
    ok(booted, 'server booted + /sitemap.xml 200');
    if (!booted) { cleanup(); process.exit(1); }

    // index
    const idx = await get('/sitemap.xml', 'identity');
    ok(idx.bytes.toString('utf8').includes('<sitemapindex'), 'sitemap.xml is <sitemapindex>');
    const children = [...idx.bytes.toString('utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    const mainFile = children.filter(u => /\/sitemap-main\.xml$/.test(u));
    const cityFiles = children.filter(u => /\/sitemap-cities-\d+\.xml$/.test(u));
    ok(mainFile.length === 1, 'index lists sitemap-main.xml');
    ok(cityFiles.length >= 1, `index lists ${cityFiles.length} city sitemap file(s)`);
    ok(children.every(u => u.startsWith(HOST)), 'index children all on timesprayers.com');
    // index gzip==identity too
    const idxGz = await get('/sitemap.xml', 'gzip');
    let idxGunz = Buffer.alloc(0); try { idxGunz = zlib.gunzipSync(idxGz.bytes); } catch (_) {}
    ok(Buffer.compare(idx.bytes, idxGunz) === 0, 'sitemap.xml index gzip == identity (index still via sendXml, unchanged)');

    // every file: correctness + structural, accumulate loc + full text for presence
    let totalLoc = 0, allText = idx.bytes.toString('utf8');
    for (const url of [...mainFile, ...cityFiles]) {
        const r = await checkFile(url.replace(HOST, ''));
        totalLoc += r.locs; allText += r.text;
    }
    ok(totalLoc === EXPECT_TOTAL_LOC, `total <loc> across all files == ${EXPECT_TOTAL_LOC} (got ${totalLoc})`);
    console.log(`  INFO  city files=${cityFiles.length} | total <loc>=${totalLoc}`);

    // content unchanged: required present / forbidden absent
    for (const kp of ['/', '/prayer-times-in-riyadh', '/prayer-times-in-saudi-arabia', '/prayer-times-in-praia', '/prayer-times-in-qubtan', '/prayer-times-in-qubtan-al-jabal']) {
        ok(allText.includes(`<loc>${HOST}${kp}</loc>`), `PRESENT (curated index): ${kp}`);
    }
    for (const np of ['marrakech', 'washington', 'delhi', 'qassim', 'al-ahsa', 'ad-dana']) {
        ok(!allText.includes(`<loc>${HOST}/prayer-times-in-${np}</loc>`), `ABSENT (noindex/discovered): /prayer-times-in-${np}`);
    }

    // 404 guard + robots
    const next = await get(`/sitemap-cities-${cityFiles.length + 1}.xml`, 'identity');
    ok(next.status === 404, `sitemap-cities-${cityFiles.length + 1}.xml → 404`);
    const rob = await get('/robots.txt', 'identity');
    ok(rob.bytes.toString('utf8').includes(`Sitemap: ${HOST}/sitemap.xml`), `robots.txt Sitemap → ${HOST}/sitemap.xml`);

    cleanup();
    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    if (fail > 0) { console.log('FAILED:'); fails.forEach(f => console.log('  - ' + f)); }
    process.exit(fail === 0 ? 0 : 1);
})();
