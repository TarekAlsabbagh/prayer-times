// SITEMAP-CITIES-SPLIT-BY-SIZE-FOR-GSC-1 — smoke test
// Boots server.js with SITE_URL=https://timesprayers.com and asserts the city sitemaps are
// split by URL budget so EVERY file stays under Google's 50MB / 50k-URL limits, on the right
// host, with lastmod, application/xml, 200, no onrender/localhost/staging, no discovered/noindex,
// and the index lists all files. Self-contained (spawns + tears down its own server).
import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PORT = 8097;
const HOST = 'https://timesprayers.com';
const MAX_BYTES = 50 * 1024 * 1024; // Google hard limit (uncompressed)
const MAX_URLS = 50000;             // Google hard limit

let pass = 0, fail = 0; const fails = [];
const ok = (c, m) => { if (c) pass++; else { fail++; fails.push(m); } console.log(`  ${c ? 'PASS' : 'FAIL'}  ${m}`); };

// INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1: per-file <lastmod> policy (replaces "every file has <lastmod>"). <lastmod> is emitted
//   ONLY for a real last-change date, never the request day: sitemap-main → exactly the 20 /[lang/]privacy + /[lang/]terms
//   entries at the LEGAL_PAGES legal-meta date; every other main entry and every city shard → none.
const LEGAL_LASTMOD = '2026-08-09';
function lastmodPolicy(p, text) {
    const total = (text.match(/<lastmod>/g) || []).length;
    if (!/\/sitemap-main\.xml$/.test(p)) return { ok: total === 0, detail: `lastmod=${total}` };
    let legal = 0, legalOk = 0, other = 0;
    for (const [, b] of text.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
        const loc = (b.match(/<loc>([^<]+)<\/loc>/) || [])[1] || '';
        const lms = [...b.matchAll(/<lastmod>([^<]*)<\/lastmod>/g)].map(m => m[1]);
        if (/^https?:\/\/[^/]+(?:\/(?:en|fr|tr|ur|de|id|es|bn|ms))?\/(?:privacy|terms)$/.test(loc)) { legal++; if (lms.length === 1 && lms[0] === LEGAL_LASTMOD) legalOk++; }
        else if (lms.length) other++;
    }
    return { ok: legal === 20 && legalOk === 20 && other === 0 && total === 20, detail: `legal=${legal} legalAt${LEGAL_LASTMOD}=${legalOk} otherWithLastmod=${other} lastmod=${total}` };
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
    // wait for boot
    let booted = false;
    for (let i = 0; i < 60; i++) { const r = await get('/sitemap.xml'); if (r.status === 200) { booted = true; break; } await new Promise(r => setTimeout(r, 500)); }
    ok(booted, 'server booted + /sitemap.xml 200');
    if (!booted) { cleanup(); process.exit(1); }

    const idx = await get('/sitemap.xml');
    ok(idx.ctype.includes('application/xml'), `sitemap.xml application/xml (${idx.ctype})`);
    ok(idx.text.includes('<sitemapindex'), 'sitemap.xml is a <sitemapindex>');
    // INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1: index children carry no <lastmod> (no reliable last-change date; never the request day)
    ok(!idx.text.includes('<lastmod>'), 'sitemap.xml index children carry NO <lastmod>');
    const children = [...idx.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    ok(children.length > 0 && children.every(u => u.startsWith(HOST)), `index children all on ${HOST} (${children.length})`);
    const mainFile = children.filter(u => /\/sitemap-main\.xml$/.test(u));
    const cityFiles = children.filter(u => /\/sitemap-cities-\d+\.xml$/.test(u));
    ok(mainFile.length === 1, 'index lists exactly one sitemap-main.xml');
    ok(cityFiles.length >= 1, `index lists ${cityFiles.length} city sitemap file(s) [SPLIT]`);

    let totalLocs = 0, maxBytes = 0;
    for (const url of [...mainFile, ...cityFiles]) {
        const p = url.replace(HOST, '');
        const r = await get(p);
        ok(r.status === 200, `${p} 200`);
        ok(r.ctype.includes('application/xml'), `${p} application/xml`);
        ok(r.bytes < MAX_BYTES, `${p} FILE SIZE < 50MB (${(r.bytes / 1048576).toFixed(2)}MB)`);
        const locs = (r.text.match(/<loc>/g) || []).length;
        ok(locs < MAX_URLS, `${p} URL COUNT < 50000 (${locs})`);
        // INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1: "has <lastmod>" → the per-file lastmod policy (lastmodPolicy above).
        { const lm = lastmodPolicy(p, r.text); ok(lm.ok, `${p} lastmod policy (${lm.detail})`); }
        const bad = (r.text.match(/onrender|localhost|staging/gi) || []).length;
        ok(bad === 0, `${p} no onrender/localhost/staging (${bad})`);
        const offhost = [...r.text.matchAll(/<loc>([^<]+)<\/loc>/g)].filter(m => !m[1].startsWith(HOST)).length;
        ok(offhost === 0, `${p} all <loc> on ${HOST} (off-host=${offhost})`);
        const noidx = (r.text.match(/noindex|discovered/gi) || []).length;
        ok(noidx === 0, `${p} no discovered/noindex tokens (${noidx})`);
        totalLocs += locs; maxBytes = Math.max(maxBytes, r.bytes);
    }
    ok(totalLocs > 0, `total <loc> across all files = ${totalLocs}`);
    console.log(`  INFO  largest file = ${(maxBytes / 1048576).toFixed(2)}MB (limit 50MB)`);

    const next = await get(`/sitemap-cities-${cityFiles.length + 1}.xml`);
    ok(next.status === 404, `sitemap-cities-${cityFiles.length + 1}.xml → 404 (no phantom extra file)`);

    const allText = (await Promise.all([...mainFile, ...cityFiles].map(u => get(u.replace(HOST, ''))))).map(r => r.text).join('');
    for (const kp of ['/', '/prayer-times-in-riyadh', '/prayer-times-in-saudi-arabia']) {
        ok(allText.includes(`<loc>${HOST}${kp}</loc>`), `key page present in sitemap: ${kp}`);
    }
    const praia = allText.includes(`<loc>${HOST}/prayer-times-in-praia</loc>`);
    console.log(`  INFO  /prayer-times-in-praia in sitemap: ${praia}  (curated-slugs.json source; absence = pre-existing SITEMAP-CURATED-SYNC-1, NOT this ticket)`);

    const rob = await get('/robots.txt');
    ok(rob.text.includes(`Sitemap: ${HOST}/sitemap.xml`), `robots.txt Sitemap line → ${HOST}/sitemap.xml`);

    cleanup();
    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    if (fail > 0) { console.log('FAILED:'); fails.forEach(f => console.log('  - ' + f)); }
    process.exit(fail === 0 ? 0 : 1);
})();
