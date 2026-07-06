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

let pass = 0, fail = 0; const fails = [];
const ok = (c, m) => { if (c) pass++; else { fail++; fails.push(m); } console.log(`  ${c ? 'PASS' : 'FAIL'}  ${m}`); };
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
    const children = [...idx.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    const mainFile = children.filter(u => /\/sitemap-main\.xml$/.test(u));
    const cityFiles = children.filter(u => /\/sitemap-cities-\d+\.xml$/.test(u));
    ok(mainFile.length === 1, 'index lists sitemap-main.xml');
    ok(cityFiles.length >= 1, `index lists ${cityFiles.length} city sitemap file(s) [SPLIT preserved]`);
    ok(children.every(u => u.startsWith(HOST)), 'index children all on timesprayers.com');

    // fetch every file once; run size/split/host/noindex checks + accumulate full text for presence
    let allText = '', totalLocs = 0, maxBytes = 0;
    for (const url of [...mainFile, ...cityFiles]) {
        const p = url.replace(HOST, '');
        const r = await get(p);
        allText += r.text;
        const locs = (r.text.match(/<loc>/g) || []).length;
        const offhost = [...r.text.matchAll(/<loc>([^<]+)<\/loc>/g)].filter(m => !m[1].startsWith(HOST)).length;
        const bad = (r.text.match(/onrender|localhost|staging/gi) || []).length;
        const noidx = (r.text.match(/noindex|discovered/gi) || []).length;
        const good = r.status === 200 && r.ctype.includes('application/xml') && r.bytes < MAX_BYTES && locs < MAX_URLS && r.text.includes('<lastmod>') && offhost === 0 && bad === 0 && noidx === 0;
        ok(good, `${p} : 200 xml <50MB(${(r.bytes/1048576).toFixed(2)}) <50k(${locs}) lastmod offhost=${offhost} bad=${bad} noidx=${noidx}`);
        totalLocs += locs; maxBytes = Math.max(maxBytes, r.bytes);
    }
    console.log(`  INFO  city files=${cityFiles.length} | total <loc>=${totalLocs} | largest file=${(maxBytes/1048576).toFixed(2)}MB`);

    // (a) curated index cities MUST be present
    for (const kp of ['/', '/prayer-times-in-riyadh', '/prayer-times-in-saudi-arabia', '/prayer-times-in-praia', '/prayer-times-in-qubtan', '/prayer-times-in-qubtan-al-jabal']) {
        ok(allText.includes(`<loc>${HOST}${kp}</loc>`), `PRESENT (curated index): ${kp}`);
    }
    // (b) noindex legacy curated-slugs-only MUST be absent
    for (const np of ['marrakech', 'washington', 'delhi', 'qassim', 'al-ahsa']) {
        ok(!allText.includes(`<loc>${HOST}/prayer-times-in-${np}</loc>`), `ABSENT (noindex legacy): /prayer-times-in-${np}`);
    }
    // (c) discovered MUST be absent
    ok(!allText.includes(`<loc>${HOST}/prayer-times-in-ad-dana</loc>`), 'ABSENT (discovered): /prayer-times-in-ad-dana');

    // 404 guard + robots
    const next = await get(`/sitemap-cities-${cityFiles.length + 1}.xml`);
    ok(next.status === 404, `sitemap-cities-${cityFiles.length + 1}.xml → 404`);
    const rob = await get('/robots.txt');
    ok(rob.text.includes(`Sitemap: ${HOST}/sitemap.xml`), `robots.txt Sitemap → ${HOST}/sitemap.xml`);

    cleanup();
    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    if (fail > 0) { console.log('FAILED:'); fails.forEach(f => console.log('  - ' + f)); }
    process.exit(fail === 0 ? 0 : 1);
})();
