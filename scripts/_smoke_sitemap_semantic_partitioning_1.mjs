// SITEMAP-SEMANTIC-PARTITIONING-1 — smoke suite (read-only; local servers only; never touches production or Google).
//
// Proves that the semantic family sitemaps publish the SAME URL set, block for block, as the legacy sitemap files of a
// clean BASE checkout, and that the family / shard / index structure follows the approved rules. It never changes a
// product file. Every guard is exact; nothing is skipped (a missing base FAILS, it is never skipped).
//
//   [K]   static guards: one bilingualUrl definition, one `_lastmodLine =` line, `const SITEMAP_URL_BUDGET = 7500;` once;
//         product diff vs <diff base> === server.js only, and every server.js hunk lies inside the invalidateSitemapCache
//         neighbourhood or the sitemap region (`// ===== مساعدات Sitemap =====` .. `function serveEnglishHtml(`)
//   [H]   harness: TP_BASE_ROOT clean + tree === <diff base>^{tree}; ports refused when busy; servers healthy; BASE sitemap
//         files parse with the exact envelope; all server process trees killed and every port free at the end
//   [R]   robots.txt byte-identical to BASE (status, content-type, cache-control, body)
//   [S1]  unique <loc> count 176,135 → 176,135 (AFTER: robots → /sitemap.xml → children; BEFORE: robots → base index
//         children + /sitemap-quran.xml)
//   [S2]  ADDED = 0            [S3] REMOVED = 0            [S4] DUPLICATES = 0 (within and across files)
//   [S5]  UNCLASSIFIED = 0 (family rules implemented independently below; PAGES is an exact allowlist, never a catch-all)
//   [S6]  every URL matches exactly one family AND sits in a file of that family
//   [S7]  every root child ≤ 25,000 URLs          [S8] every root child ≤ 35,000,000 uncompressed bytes
//   [S9]  XML: exact sitemapindex / urlset envelope, every <url> block strictly well-formed with exactly one <loc>, no
//         raw '&'; gzip responses decode to identical bytes
//   [S10] every root child 200 application/xml     [S11] root lists no legacy file (sitemap-main / sitemap-cities-*)
//   [S12] every root child is a urlset (no nested index); 0 <lastmod> in the root index
//   [S13] family endpoints: multi-shard family index === its shards in order (not listed in root); 1-shard family file
//         is the root-listed urlset; empty family (ramadan) 404; -k on 1-shard families, k=N+1, -0, -01, .gz → 404 text/plain
//   [S14] /sitemap-quran.xml bytes, ETag, Last-Modified, Cache-Control, Content-Type === BASE; 304 on If-None-Match
//   [S15] lastmod policy: only the 20 /[lang/]privacy|terms in sitemap-pages.xml (2026-08-09, === BASE) + the 115 Quran
//         (2026-07-22); no lastmod equals the request date; every other file (and every index) 0
//   [S16] every AFTER <url> block byte-identical to the BASE block for the same loc (alternates, x-default, changefreq,
//         priority, lastmod); 11 alternates (ar..ms + x-default, exact hrefs) per non-Quran URL, 0 per Quran URL
//   [S17] no .html in any loc                     [S18] no query / fragment in any loc
//   [S19] HTTP sample on AFTER (first + last URL of every root child + a sha1-ordered stride over the prime 997, ≥ 1,000
//         URLs): 200, no Location, no noindex (meta or X-Robots-Tag), exactly one canonical === loc
//   [S20] determinism (root, every child, every family index fetched twice → identical); shard names
//         ^sitemap-(family)(-k)?\.xml$ with k = 1..N contiguous; the shard plan === an INDEPENDENT recomputation from the
//         BASE legacy stream (sitemap-main then cities-1..N, filtered by family, 10-language path groups, fewest N
//         contiguous near-equal parts within both limits) — shard k's loc list (and block bytes) === recomputed part k
//   [F]   family order of the root children: prayer, qibla, time-left, next-prayer, moon, hijri, quran, azkar, guides,
//         ramadan (only if non-empty), pages
//   [L]   legacy /sitemap-main.xml + /sitemap-cities-1..N.xml byte-identical to BASE (+ the -01 and .gz aliases);
//         /sitemap-cities-(N+1).xml 404 on both
//   [C]   clock seam TP_MOON_RANGE_TEST_NOW=2027-01-01T00:30:00Z on AFTER and BASE: moon years move to 2026..2028 and the
//         AFTER moon family === the BASE legacy moon URLs (block-identical, same order, same recomputed shard plan)
//
// Usage:  TP_BASE_ROOT=<clean base checkout> node scripts/_smoke_sitemap_semantic_partitioning_1.mjs
// Env:    TP_BASE_ROOT     clean base checkout (required); its tree must equal <diff base>^{tree}
//         TP_SSP_DIFF_BASE commit the worktree diff and the base tree are compared against (default HEAD)
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { StringDecoder } from 'node:string_decoder';
import { fileURLToPath } from 'node:url';

// SITEMAP-SEMANTIC-PARTITIONING-1: the tree under test is this script's own repo (a red-runner copy tests itself)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_ROOT = process.env.TP_BASE_ROOT || '';
const DIFF_BASE = process.env.TP_SSP_DIFF_BASE || 'HEAD';
const SITE = 'https://timesprayers.com';
// SITEMAP-SEMANTIC-PARTITIONING-1: ONE fixed port line (a red runner rewrites it in its disposable copy). The clock-seam
//   BASE server reuses BASE_PORT after the real-clock BASE server has been stopped.
const AFTER_PORT = 8931, BASE_PORT = 8932, SEAM_PORT = 8933;
const UA = 'tp-sitemap-semantic-partitioning-smoke/1 (local)';
// SITEMAP-SEMANTIC-PARTITIONING-1: owner-approved census of the 12bae98 bytes at the 2026-09-15 clock
const EXPECTED_TOTAL = 176135;
const MAX_URLS = 25000, MAX_BYTES = 35000000;
const FAMILY_ORDER = ['prayer', 'qibla', 'time-left', 'next-prayer', 'moon', 'hijri', 'quran', 'azkar', 'guides', 'ramadan', 'pages'];
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const LEGAL_LASTMOD = '2026-08-09', QURAN_LASTMOD = '2026-07-22';
const SEAM_NOW = '2027-01-01T00:30:00Z';
const SEAM_YEARS = [2026, 2027, 2028];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const EMPTY = Buffer.alloc(0);

// ── reporting ────────────────────────────────────────────────────────────────────────────────────────────────────
let pass = 0, fail = 0; const fails = []; const stats = {};
function ok(label, cond, name, detail) {
    const n = '[' + label + '] ' + name;
    const s = (stats[label] ||= { pass: 0, fail: 0 });
    if (cond) { pass++; s.pass++; console.log('  ✓ ' + n); }
    else { fail++; s.fail++; const d = detail ? String(detail).slice(0, 700) : ''; fails.push(n + (d ? ' :: ' + d : '')); console.log('  ✗ ' + n + (d ? '  :: ' + d : '')); }
}
const info = (s) => console.log('  · INFO ' + s);
const section = (s) => console.log('\n-- ' + s + ' --');
const pushS = (arr, v, n = 5) => { if (arr.length < n) arr.push(v); };

// ── family rules (SITEMAP-SEMANTIC-PARTITIONING-1: implemented independently of server.js) ───────────────────────────
const SLUG = '[a-z0-9]+(?:-[a-z0-9]+)*';
const PAGES_ALLOW = new Set(['/', '/zakat-calculator', '/msbaha', '/date-converter', '/today-hijri-date', '/prayer-times-worldwide', '/about-us', '/contact', '/privacy', '/terms']);
const FAMILY_RULES = [
    ['prayer', new RegExp(`^/prayer-times-in-${SLUG}$`)],
    ['qibla', new RegExp(`^/qibla(?:-in-${SLUG})?$`)],
    ['time-left', new RegExp(`^/time-left-until-next-prayer-in-${SLUG}$`)],
    ['next-prayer', new RegExp(`^/next-prayer-in-${SLUG}$`)],
    ['moon', new RegExp(`^/moon(?:/${SLUG}(?:/${SLUG}(?:/(?:today|\\d{4}(?:/(?:0[1-9]|1[0-2]))?))?)?)?$`)],
    ['hijri', /^\/(?:hijri-calendar\/\d{4}(?:-(?:0[1-9]|1[0-2]))?|hijri-date\/\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|30))$/],
    ['quran', new RegExp(`^/quran(?:/${SLUG})?$`)],
    ['azkar', /^\/azkar(?:\/(?:morning|evening|prayer)-azkar)?$/],
    ['guides', /^\/guides(?:\/(?:prayer-time-calculation-methods|why-prayer-times-differ|how-qibla-direction-is-calculated))?$/],
    ['ramadan', /^\/(?:ramadan|eid-al-fitr|eid-al-adha|hijri-new-year)-countdown$/],
];
const LANG_PREFIX_RE = /^\/(en|fr|tr|ur|de|id|es|bn|ms)(?=\/|$)/;
function classify(loc) {
    const none = { fams: [], rel: null, lang: null };
    if (typeof loc !== 'string' || !loc.startsWith(SITE + '/')) return none;
    let rel = loc.slice(SITE.length), lang = 'ar';
    const m = LANG_PREFIX_RE.exec(rel);
    if (m) {
        const rest = rel.slice(m[0].length);
        if (rest === '/') return none;                 // /en/ (trailing-slash home) is not "/en alone"
        lang = m[1]; rel = rest || '/';
    }
    const fams = [];
    if (PAGES_ALLOW.has(rel)) fams.push('pages');
    for (const [f, re] of FAMILY_RULES) if (re.test(rel) && !(f === 'quran' && lang !== 'ar')) fams.push(f);
    return { fams, rel, lang };
}
const FAMILY_FILE_RE = /^sitemap-(prayer|qibla|time-left|next-prayer|moon|hijri|quran|azkar|guides|ramadan|pages)(?:-([1-9]\d*))?\.xml$/;
const fileFamily = (name) => { const m = FAMILY_FILE_RE.exec(name); return m ? m[1] : null; };
const expectedHref = (rel, l) => { const prefix = l === 'ar' ? '' : '/' + l; return SITE + ((rel === '/' && l !== 'ar') ? prefix : prefix + rel); };
const pathOfLoc = (loc) => loc.slice(SITE.length) || '/';

// ── XML grammar (SITEMAP-SEMANTIC-PARTITIONING-1: exact envelopes + strict <url> block grammar) ─────────────────────
const XML_DECL = '<?xml version="1.0" encoding="UTF-8"?>\n';
const URLSET_XHTML_OPEN = XML_DECL + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
const URLSET_PLAIN_OPEN = XML_DECL + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
const URLSET_CLOSE = '</urlset>\n';
const INDEX_OPEN = XML_DECL + '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
const INDEX_CLOSE = '\n</sitemapindex>\n';
const HEAD_BYTES = Buffer.byteLength(URLSET_XHTML_OPEN), TAIL_BYTES = Buffer.byteLength(URLSET_CLOSE);
const BLOCK_RE = /^  <url>\n    <loc>([^<>"'\s]+)<\/loc>\n(?:    <lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>\n)?    <changefreq>(always|hourly|daily|weekly|monthly|yearly|never)<\/changefreq>\n    <priority>(0(?:\.\d{1,2})?|1(?:\.0)?)<\/priority>\n((?:    <xhtml:link rel="alternate" hreflang="[a-zA-Z-]+" href="[^"<>'\s]+"\/>\n)*)  <\/url>$/;
const BAD_ENTITY_RE = /&(?!(?:amp|lt|gt|quot|apos);)/;
const unxml = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

function analyzeBlock(block) {
    const m = BLOCK_RE.exec(block);
    if (!m) return null;
    const alts = m[5] ? [...m[5].matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map((a) => [a[1], unxml(a[2])]) : [];
    return {
        loc: unxml(m[1]), lastmod: m[2] || '', alts,
        wellFormed: (block.match(/<loc>/g) || []).length === 1 && !BAD_ENTITY_RE.test(block),
        bytes: Buffer.byteLength(block) + 1,                       // every block is followed by '\n' in the file
        sha: crypto.createHash('sha256').update(block).digest('base64'),
    };
}

// Streaming parser: exact head, then ONLY "<url> block + \n" repeated, then exactly "</urlset>\n". A <sitemapindex> body
// is collected (bounded) and parsed separately.
function makeParser(onBlock) {
    const st = { type: null, head: null, blocks: 0, err: null, done: false, indexText: '' };
    let buf = '', pos = 0;
    const bad = (m) => { if (!st.err) st.err = m; };
    st.push = (text) => {
        if (st.err || !text) return;
        if (st.type === 'index') { st.indexText += text; if (st.indexText.length > 8e6) bad('sitemapindex larger than 8 MB'); return; }
        buf = pos ? buf.slice(pos) + text : buf + text; pos = 0;
        if (st.type === null) {
            const nl1 = buf.indexOf('\n'); const nl2 = nl1 < 0 ? -1 : buf.indexOf('\n', nl1 + 1);
            if (nl2 < 0) { if (buf.length > 4096) bad('no XML declaration + root element lines'); return; }
            const head = buf.slice(0, nl2 + 1);
            if (head.startsWith(XML_DECL + '<sitemapindex')) { st.type = 'index'; st.indexText = buf; buf = ''; return; }
            if (head !== URLSET_XHTML_OPEN && head !== URLSET_PLAIN_OPEN) { bad('unexpected XML head ' + JSON.stringify(head.slice(0, 160))); return; }
            st.type = 'urlset'; st.head = head; pos = head.length;
        }
        if (st.done) { if (buf.length - pos > URLSET_CLOSE.length) bad('content after </urlset>'); return; }
        for (;;) {
            if (buf.startsWith('  <url>\n', pos)) {
                const end = buf.indexOf('\n  </url>\n', pos);
                if (end < 0) { if (buf.length - pos > 2e6) bad('unterminated <url> block'); return; }
                const block = buf.slice(pos, end + 9);
                st.blocks++;
                onBlock(block);
                pos = end + 10;
                continue;
            }
            const rest = buf.length - pos;
            if (buf.startsWith(URLSET_CLOSE, pos)) { st.done = true; if (rest > URLSET_CLOSE.length) bad('content after </urlset>'); return; }
            const frag = buf.slice(pos);
            if (rest < 10 && ('  <url>\n'.startsWith(frag) || URLSET_CLOSE.startsWith(frag))) return;   // token split across chunks
            bad('unexpected content after block ' + st.blocks + ': ' + JSON.stringify(frag.slice(0, 100)));
            return;
        }
    };
    st.finish = () => {
        if (st.err || st.type === 'index') return st;
        if (st.type !== 'urlset') { bad('empty / non-XML body'); return st; }
        if (!st.done || buf.slice(pos) !== URLSET_CLOSE) bad('missing or incorrect </urlset> tail');
        return st;
    };
    return st;
}
function parseIndex(text) {
    const items = [...text.matchAll(/<sitemap>([\s\S]*?)<\/sitemap>/g)].map((m) => m[1]);
    const locs = items.map((s) => (s.match(/<loc>([^<]*)<\/loc>/) || [])[1] || '');
    const rebuilt = INDEX_OPEN + locs.map((l) => `  <sitemap>\n    <loc>${l}</loc>\n  </sitemap>`).join('\n') + INDEX_CLOSE;
    return {
        locs, lastmods: (text.match(/<lastmod>/g) || []).length, exact: locs.length > 0 && rebuilt === text && !BAD_ENTITY_RE.test(text),
        paths: locs.map((l) => (l.startsWith(SITE + '/') && !/[?#]/.test(l)) ? l.slice(SITE.length) : null),
    };
}

// ── HTTP (SITEMAP-SEMANTIC-PARTITIONING-1: local only; Host + X-Forwarded-Proto like the edge) ──────────────────────
function reqOpts(port, p, headers) {
    return { host: '127.0.0.1', port, path: p, method: 'GET', agent: false,
        headers: { Host: 'timesprayers.com', 'X-Forwarded-Proto': 'https', 'User-Agent': UA, 'Accept-Encoding': 'identity', ...headers } };
}
function fetchTextRaw(port, p, headers = {}, timeoutMs = 600000) {
    return new Promise((resolve) => {
        let settled = false; const done = (v) => { if (!settled) { settled = true; resolve(v); } };
        const req = http.request(reqOpts(port, p, headers), (res) => {
            const chunks = []; res.on('data', (c) => chunks.push(c));
            res.on('end', () => {
                const raw = Buffer.concat(chunks); let buf = raw, gunzipErr = null;
                if (res.headers['content-encoding'] === 'gzip') { try { buf = zlib.gunzipSync(raw); } catch (e) { gunzipErr = e.message; } }
                const body = buf.toString('utf8');
                done({ status: res.statusCode, headers: res.headers, raw, buf, body, gunzipErr, truncated: _cutShort(p, res.statusCode, body) });
            });
            res.on('error', (e) => done({ status: 0, headers: {}, raw: EMPTY, buf: EMPTY, body: '', err: e.message }));
        });
        req.setTimeout(timeoutMs, () => req.destroy(new Error('timeout')));
        req.on('error', (e) => done({ status: 0, headers: {}, raw: EMPTY, buf: EMPTY, body: '', err: e.message }));
        req.end();
    });
}
// Streamed fetch: hashes the DECODED bytes and feeds decoded text to onText; nothing large is retained.
function streamFileRaw(port, p, headers = {}, onText = null) {
    return new Promise((resolve) => {
        let settled = false; const done = (v) => { if (!settled) { settled = true; resolve(v); } };
        const req = http.request(reqOpts(port, p, headers), (res) => {
            const h = crypto.createHash('sha256'); let rawBytes = 0, bytes = 0, cbErr = null;
            const dec = new StringDecoder('utf8');
            let tail = '';   // last decoded characters, to notice a cut-short body
            const gz = res.headers['content-encoding'] === 'gzip';
            const feed = (t) => { if (!onText || cbErr || !t) return; try { onText(t); } catch (e) { cbErr = e.stack || String(e); } };
            let src = res;
            res.on('data', (c) => { rawBytes += c.length; });
            if (gz) { src = zlib.createGunzip(); res.pipe(src); }
            src.on('data', (c) => { h.update(c); bytes += c.length; const t = dec.write(c); tail = (tail + t).slice(-64); feed(t); });
            src.on('end', () => { const t = dec.end(); tail = (tail + t).slice(-64); feed(t);
                done({ status: res.statusCode, headers: res.headers, rawBytes, bytes, sha: h.digest('hex'), gz, err: cbErr, truncated: _cutShort(p, res.statusCode, tail) }); });
            src.on('error', (e) => done({ status: res.statusCode, headers: res.headers, rawBytes, bytes, sha: null, gz, err: e.message }));
            if (gz) res.on('error', (e) => done({ status: res.statusCode, headers: res.headers, rawBytes, bytes, sha: null, gz, err: e.message }));
        });
        req.setTimeout(900000, () => req.destroy(new Error('timeout')));
        req.on('error', (e) => done({ status: 0, headers: {}, rawBytes: 0, bytes: 0, sha: null, gz: false, err: e.message }));
        req.end();
    });
}
// A loaded machine sometimes cuts a large sitemap response short (seen on BASE files too, i.e. not a product defect),
// so read it again instead of reporting a phantom failure. onText callbacks are fed again from scratch by the caller.
const _cutShort = (p, status, tailOrBody) => status === 200 && /\.xml$/.test(p) && !/<\/(?:urlset|sitemapindex)>\s*$/.test(tailOrBody);
const HTTP_RETRY = { text: 0, stream: 0, paths: new Map() };
const _noteRetry = (kind, p, why) => { const k = kind + ' ' + p + ' ' + why; HTTP_RETRY.paths.set(k, (HTTP_RETRY.paths.get(k) || 0) + 1); };
const _why = (r) => !r ? 'no-response' : (r.status === 0 ? 'transport' : (r.err ? 'err:' + String(r.err).slice(0, 40) : (r.truncated ? 'cut-short' : '')));
const _needsRetry = (r) => !r || r.status === 0 || !!r.err || !!r.truncated;
async function fetchText(port, p, headers = {}, timeoutMs = 600000) {
    let r = await fetchTextRaw(port, p, headers, timeoutMs);
    for (let i = 0; i < 3 && _needsRetry(r); i++) { HTTP_RETRY.text++; _noteRetry('buffered', p, _why(r)); await sleep(500 * (i + 1)); r = await fetchTextRaw(port, p, headers, timeoutMs); }
    return r;
}
async function streamFile(port, p, headers = {}, onText = null) {
    if (onText) return streamFileRaw(port, p, headers, onText);   // caller owns the retry (see parseFile)
    let r = await streamFileRaw(port, p, headers, onText);
    for (let i = 0; i < 3 && _needsRetry(r); i++) { HTTP_RETRY.stream++; _noteRetry('streamed', p, _why(r)); await sleep(500 * (i + 1)); r = await streamFileRaw(port, p, headers, onText); }
    return r;
}
async function pool(items, n, fn) {
    const out = new Array(items.length); let i = 0;
    await Promise.all(Array.from({ length: Math.max(1, Math.min(n, items.length)) }, async () => {
        while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
    }));
    return out;
}
const is404Text = (r) => r.status === 404 && r.headers['content-type'] === 'text/plain' && r.body === 'Not Found' && !r.headers.location;
const brief = (r) => r.status + ' ' + (r.headers['content-type'] || '') + ' ' + JSON.stringify(String(r.body || '').slice(0, 40)) + (r.headers.location ? ' Location=' + r.headers.location : '') + (r.err ? ' err=' + r.err : '');

// ── servers (SITEMAP-SEMANTIC-PARTITIONING-1: refuse busy ports; kill whole process trees) ───────────────────────────
const CHILDREN = new Set();
function portFree(port) {
    return new Promise((resolve) => {
        const s = net.createServer(); s.once('error', () => resolve(false));
        s.once('listening', () => s.close(() => resolve(true)));
        s.listen(port, '127.0.0.1');
    });
}
async function boot(root, port, extraEnv = {}) {
    const pre = await fetchTextRaw(port, '/health', {}, 3000);   // raw: a refused connection is the EXPECTED answer here
    if (pre.status !== 0) throw new Error('port ' + port + ' already answers /health (' + pre.status + ') — refusing (a stale server would falsify results)');
    if (!(await portFree(port))) throw new Error('port ' + port + ' is bound by another process — refusing');
    const env = { ...process.env, PORT: String(port), SITE_URL: SITE, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', WEB_CONCURRENCY: '1' };
    delete env.TP_MOON_RANGE_TEST_NOW; delete env.TP_ENABLE_SEARCH_TEST;
    Object.assign(env, extraEnv);
    const child = spawn(process.execPath, ['server.js'], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
    CHILDREN.add(child); child.port = port; child.log = '';
    const keep = (d) => { if (child.log.length < 20000) child.log += d.toString('utf8'); };
    child.stdout.on('data', keep); child.stderr.on('data', keep);
    for (let i = 0; i < 1200; i++) {                          // up to ~10 min: the CPU is shared with other local work
        const r = await fetchTextRaw(port, '/health', {}, 5000);   // raw: this loop IS the retry while the server boots
        if (r.status === 200) return child;
        if (child.exitCode != null) break;
        await sleep(500);
    }
    await stop(child);
    throw new Error('server did not become healthy: ' + root + ' :' + port + ' log=' + child.log.replace(/\s+/g, ' ').slice(-400));
}
function killTree(pid) { try { execFileSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} }
async function stop(child) {
    if (!child) return;
    killTree(child.pid); CHILDREN.delete(child);
    for (let i = 0; i < 150 && !(await portFree(child.port)); i++) await sleep(200);
}
process.on('SIGINT', () => { for (const c of CHILDREN) killTree(c.pid); process.exit(130); });

// ── sitemap walking ──────────────────────────────────────────────────────────────────────────────────────────────
const sitemapPaths = (robotsBody) => [...String(robotsBody).matchAll(/^\s*sitemap:\s*(\S+)\s*$/gim)].map((m) => (m[1].startsWith(SITE + '/') ? m[1].slice(SITE.length) : m[1]));
async function parseFile(port, p, parent, onBlock) {
    const name = p.replace(/^\//, '');
    const rec = { path: p, name, parent, family: fileFamily(name), badBlocks: 0, badSamples: [], firstLoc: null, lastLoc: null, lastmods: 0,
                  _locD: crypto.createHash('sha256'), _blockD: crypto.createHash('sha256') };
    // Blocks are staged and replayed into onBlock only after a COMPLETE read, so re-reading a cut-short body
    // (a loaded machine truncates large responses; it hits untouched BASE files too) cannot double-count a URL.
    let r = null, staged = [], parser = null;
    for (let attempt = 0; attempt < 4; attempt++) {
        staged = []; parser = makeParser((block) => staged.push(block));
        r = await streamFileRaw(port, p, {}, (t) => parser.push(t));
        parser.finish();
        if (!_needsRetry(r) || attempt === 3) break;
        HTTP_RETRY.stream++; _noteRetry('scan', p, _why(r)); await sleep(500 * (attempt + 1));
    }
    for (const block of staged) onBlock(rec, block);
    staged = null;
    Object.assign(rec, { status: r.status, ctype: (r.headers && r.headers['content-type']) || '', cc: (r.headers && r.headers['cache-control']) || '',
        enc: (r.headers && r.headers['content-encoding']) || '', bytes: r.bytes, sha: r.sha, err: r.err || null,
        type: parser.type, head: parser.head, urls: parser.blocks, xmlErr: parser.err });
    if (parser.type === 'index') rec.index = parseIndex(parser.indexText);
    rec.locDigest = rec._locD.digest('hex'); rec.blockDigest = rec._blockD.digest('hex'); delete rec._locD; delete rec._blockD;
    return rec;
}
async function walkSitemaps(port, roots, onBlock) {
    const seen = new Set(), files = [], indexes = [], order = [];
    async function walk(p, parent) {
        if (seen.has(p)) return; seen.add(p);
        const rec = await parseFile(port, p, parent, onBlock);
        order.push(rec);
        if (rec.type === 'index') { indexes.push(rec); for (const c of rec.index.paths) if (c) await walk(c, p); }
        else files.push(rec);
    }
    for (const r of roots) await walk(r, 'robots.txt');
    return { files, indexes, order, byPath: new Map(order.map((r) => [r.path, r])) };
}
// Per-block bookkeeping shared by BASE and AFTER: file digests (loc sequence + block-sha sequence), first/last loc.
function blockCommon(rec, block) {
    const b = analyzeBlock(block);
    if (!b || !b.wellFormed) { rec.badBlocks++; pushS(rec.badSamples, block.slice(0, 240), 3); if (!b) return null; }
    if (rec.firstLoc === null) rec.firstLoc = b.loc;
    rec.lastLoc = b.loc;
    rec._locD.update(b.loc + '\n'); rec._blockD.update(b.sha + '\n');
    if (b.lastmod) rec.lastmods++;
    const c = classify(b.loc);
    b.fams = c.fams; b.rel = c.rel; b.lang = c.lang;
    b.fam = c.fams.length === 1 ? c.fams[0] : (c.fams.length ? 'MULTI' : 'UNCLASSIFIED');
    return b;
}
// BASE collector: loc → { sha, lastmod, file, fam, rel, lang, bytes } + the legacy stream per family (Quran file excluded).
function makeCollector(keepFam) {
    const col = { byLoc: new Map(), streams: {}, entries: 0, dups: 0, dupSamples: [] };
    col.onBlock = (rec, block) => {
        const b = blockCommon(rec, block); if (!b) return;
        if (keepFam && b.fam !== keepFam) return;
        col.entries++;
        if (col.byLoc.has(b.loc)) { col.dups++; pushS(col.dupSamples, b.loc); return; }
        const e = { loc: b.loc, sha: b.sha, lastmod: b.lastmod, file: rec.name, fam: b.fam, rel: b.rel, lang: b.lang, bytes: b.bytes, a: 0, aFile: null };
        col.byLoc.set(b.loc, e);
        if (rec.name !== 'sitemap-quran.xml') (col.streams[b.fam] ||= []).push(e);
    };
    return col;
}
// AFTER checker: compares every block against the BASE collector on the fly (no raw block is retained).
function makeAfterChecker(baseCol) {
    const A = { entries: 0, compared: 0, added: new Set(), addedSamples: [], dups: 0, dupSamples: [], blockChanged: 0, bcSamples: [],
        lastmodChanged: 0, unclassified: 0, unSamples: [], multi: 0, multiSamples: [], wrongFile: 0, wfSamples: [],
        lmBad: 0, lmSamples: [], legal: 0, legalNotBase: 0, quranLm: 0, lmValues: new Set(), altBad: 0, altSamples: [],
        html: 0, htmlSamples: [], query: 0, querySamples: [], moonYears: new Set(), famCounts: {} };
    A.onBlock = (rec, block) => {
        const b = blockCommon(rec, block); if (!b) return;
        A.entries++;
        A.famCounts[b.fam] = (A.famCounts[b.fam] || 0) + 1;
        if (b.fam === 'UNCLASSIFIED') { A.unclassified++; pushS(A.unSamples, b.loc); }
        else if (b.fam === 'MULTI') { A.multi++; pushS(A.multiSamples, b.loc + ' ' + b.fams.join('|')); }
        else if (b.fam !== rec.family) { A.wrongFile++; pushS(A.wfSamples, b.loc + ' (' + b.fam + ') in ' + rec.name); }
        const e = baseCol.byLoc.get(b.loc);
        if (!e) {
            if (A.added.has(b.loc)) { A.dups++; pushS(A.dupSamples, b.loc + ' (twice, not in base)'); }
            else { A.added.add(b.loc); pushS(A.addedSamples, b.loc + ' in ' + rec.name); }
        } else {
            if (e.a > 0) { A.dups++; pushS(A.dupSamples, b.loc + ' (' + e.aFile + ' & ' + rec.name + ')'); }
            else {
                e.aFile = rec.name; A.compared++;
                if (e.sha !== b.sha) { A.blockChanged++; pushS(A.bcSamples, b.loc + ' in ' + rec.name + ' (base ' + e.file + ')'); }
                if (e.lastmod !== b.lastmod) A.lastmodChanged++;
            }
            e.a++;
        }
        if (b.lastmod) {
            A.lmValues.add(b.lastmod);
            const isLegal = rec.name === 'sitemap-pages.xml' && (b.rel === '/privacy' || b.rel === '/terms');
            const isQuran = rec.name === 'sitemap-quran.xml' && b.fam === 'quran';
            if (isLegal && b.lastmod === LEGAL_LASTMOD) { A.legal++; if (!e || e.lastmod !== b.lastmod) A.legalNotBase++; }
            else if (isQuran && b.lastmod === QURAN_LASTMOD) A.quranLm++;
            else { A.lmBad++; pushS(A.lmSamples, b.loc + ' lastmod=' + b.lastmod + ' in ' + rec.name); }
        }
        if (b.fam === 'quran') { if (b.alts.length !== 0) { A.altBad++; pushS(A.altSamples, b.loc + ' quran alts=' + b.alts.length); } }
        else {
            const good = b.rel !== null && b.alts.length === 11 && b.loc === expectedHref(b.rel, b.lang)
                && b.alts.every(([hl, href], i) => (i < 10 ? (hl === LANGS[i] && href === expectedHref(b.rel, LANGS[i])) : (hl === 'x-default' && href === expectedHref(b.rel, 'ar'))));
            if (!good) { A.altBad++; pushS(A.altSamples, b.loc + ' alts=' + b.alts.map((a) => a[0]).join(',')); }
        }
        if (/\.html/i.test(b.loc)) { A.html++; pushS(A.htmlSamples, b.loc); }
        if (/[?#]/.test(b.loc)) { A.query++; pushS(A.querySamples, b.loc); }
        if (b.fam === 'moon') { const my = /^\/moon\/[^/]+\/[^/]+\/(\d{4})(?:\/|$)/.exec(b.rel); if (my) A.moonYears.add(+my[1]); }
    };
    return A;
}
function moonYearsOf(entries) {
    const s = new Set();
    for (const e of entries || []) { const my = /^\/moon\/[^/]+\/[^/]+\/(\d{4})(?:\/|$)/.exec(e.rel || ''); if (my) s.add(+my[1]); }
    return [...s].sort((a, b) => a - b);
}

// ── INDEPENDENT shard-plan recomputation (SITEMAP-SEMANTIC-PARTITIONING-1) ───────────────────────────────────────────
// From the BASE legacy stream of one family: group consecutive entries into 10-language path groups (ar..ms), then pick
// the FEWEST N (1, 2, …) such that splitting the D groups into N contiguous parts of near-equal group count (the D % N
// remainder groups go to the leading parts) keeps every part ≤ MAX_URLS URLs and ≤ MAX_BYTES bytes (XML head + tail
// included). Returns per part: name, URL/byte totals, loc-sequence and block-sha-sequence digests.
function recomputePlan(streams, fams = FAMILY_ORDER) {
    const out = { fams: {}, errors: [], detail: {} };
    for (const fam of fams) {
        if (fam === 'quran') { out.fams.quran = [{ name: 'sitemap-quran.xml' }]; continue; }
        const s = streams[fam] || [];
        const groups = [];
        for (let i = 0; i < s.length;) {
            let j = i; while (j < s.length && j - i < 10 && s[j].rel === s[i].rel) j++;
            const langs = s.slice(i, j).map((e) => e.lang);
            if (j - i !== 10 || !eq(langs, LANGS)) pushS(out.errors, fam + ': path group at stream index ' + i + ' (' + s[i].rel + ') has languages ' + langs.join(','), 5);
            let bytes = 0; for (let k = i; k < j; k++) bytes += s[k].bytes;
            groups.push({ start: i, end: j, urls: j - i, bytes });
            i = j;
        }
        const D = groups.length;
        const PU = [0], PB = [0];
        for (const g of groups) { PU.push(PU[PU.length - 1] + g.urls); PB.push(PB[PB.length - 1] + g.bytes); }
        let parts = [];
        for (let N = 1; N <= D; N++) {
            const q = Math.floor(D / N), r = D % N; let g0 = 0, good = true; const cand = [];
            for (let k = 0; k < N; k++) {
                const g1 = g0 + q + (k < r ? 1 : 0);
                const urls = PU[g1] - PU[g0], bytes = HEAD_BYTES + TAIL_BYTES + PB[g1] - PB[g0];
                if (g1 === g0 || urls > MAX_URLS || bytes > MAX_BYTES) good = false;
                cand.push({ g0, g1, urls, bytes });
                g0 = g1;
            }
            if (good) { parts = cand; break; }
        }
        if (D > 0 && parts.length === 0) pushS(out.errors, fam + ': no N satisfies the limits');
        out.fams[fam] = parts.map((p, k) => {
            const locD = crypto.createHash('sha256'), blockD = crypto.createHash('sha256');
            const a = groups[p.g0].start, z = groups[p.g1 - 1].end;
            for (let i = a; i < z; i++) { locD.update(s[i].loc + '\n'); blockD.update(s[i].sha + '\n'); }
            return { name: parts.length === 1 ? 'sitemap-' + fam + '.xml' : 'sitemap-' + fam + '-' + (k + 1) + '.xml', urls: p.urls, bytes: p.bytes,
                     paths: p.g1 - p.g0, locDigest: locD.digest('hex'), blockDigest: blockD.digest('hex'), firstLoc: s[a].loc, lastLoc: s[z - 1].loc };
        });
        out.detail[fam] = { urls: s.length, paths: D, parts: out.fams[fam].map((p) => p.paths + ' paths/' + p.urls + ' URLs/' + p.bytes + ' B') };
    }
    return out;
}

// ── git helpers ──────────────────────────────────────────────────────────────────────────────────────────────────
function git(dir, args) { return execFileSync('git', ['--no-optional-locks', '-C', dir, ...args], { encoding: 'buffer', maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'pipe'] }); }

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// [K] static guards (SITEMAP-SEMANTIC-PARTITIONING-1)
function staticChecks() {
    section('[K] static guards on server.js + product diff vs ' + DIFF_BASE);
    const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
    const lines = src.split(/\r?\n/);
    const nBil = (src.match(/\bfunction\s+bilingualUrl\s*\(/g) || []).length;
    const nBilAssign = (src.match(/\bbilingualUrl\s*=\s*(?:function|\()/g) || []).length;
    ok('K', nBil === 1 && nBilAssign === 0, 'exactly one bilingualUrl definition', 'function defs=' + nBil + ' assignments=' + nBilAssign);
    const nLm = lines.filter((l) => l.includes('_lastmodLine =')).length;
    ok('K', nLm === 1, "exactly one '_lastmodLine =' line", 'found ' + nLm);
    const nBudget = src.split('const SITEMAP_URL_BUDGET = 7500;').length - 1;
    const nBudgetAny = (src.match(/\bSITEMAP_URL_BUDGET\s*=/g) || []).length;
    ok('K', nBudget === 1 && nBudgetAny === 1, 'const SITEMAP_URL_BUDGET = 7500; present exactly once (no other assignment)', 'literal=' + nBudget + ' assignments=' + nBudgetAny);

    let names = [], statusLines = [], oldSrc = '', diffText = '';
    try {
        names = git(ROOT, ['diff', '--name-only', DIFF_BASE]).toString('utf8').split('\n').map((s) => s.trim()).filter(Boolean);
        statusLines = git(ROOT, ['status', '--porcelain=v1', '--untracked-files=all']).toString('utf8').split('\n').filter(Boolean);
        oldSrc = git(ROOT, ['show', DIFF_BASE + ':server.js']).toString('utf8');
        diffText = git(ROOT, ['diff', '-U0', '--no-color', '--no-ext-diff', DIFF_BASE, '--', 'server.js']).toString('utf8');
    } catch (e) { ok('K', false, 'git diff / status / show readable', String(e.message).split('\n')[0]); return; }
    // Product files = everything outside scripts/ (ticket test scripts may be edited by other authors meanwhile).
    const product = names.filter((n) => !n.startsWith('scripts/'));
    ok('K', eq(product, ['server.js']), 'tracked product diff vs ' + DIFF_BASE + ' === [server.js] (scripts/ excluded)', JSON.stringify(product));
    const scriptNames = names.filter((n) => n.startsWith('scripts/'));
    if (scriptNames.length) info('tracked test-script changes (not product): ' + scriptNames.join(', '));
    const untracked = statusLines.filter((l) => l.startsWith('??')).map((l) => l.slice(3).replace(/^"|"$/g, ''));
    const untrackedProduct = untracked.filter((f) => !f.startsWith('scripts/'));
    ok('K', untrackedProduct.length === 0, 'no untracked product file (only scripts/ may be new)', untrackedProduct.join(', '));
    ok('K', !oldSrc.includes('SITEMAP-SEMANTIC-PARTITIONING-1') && src.includes('SITEMAP-SEMANTIC-PARTITIONING-1'),
        'the diff base lacks the ticket and the worktree carries it (the hunk guard below is not vacuous)');

    const oldLines = oldSrc.split(/\r?\n/);
    const anchors = (ls) => {
        const find = (pred) => { const hits = []; ls.forEach((l, i) => { if (pred(l)) hits.push(i + 1); }); return hits; };
        return {
            inv: find((l) => /^function invalidateSitemapCache\s*\(/.test(l)),
            smStart: find((l) => l.includes('// ===== مساعدات Sitemap =====')),
            smEnd: find((l) => /^\s*function serveEnglishHtml\s*\(/.test(l)),
        };
    };
    const aOld = anchors(oldLines), aNew = anchors(lines);
    const uniq = (a) => a.inv.length === 1 && a.smStart.length === 1 && a.smEnd.length === 1 && a.smStart[0] < a.smEnd[0];
    ok('K', uniq(aOld) && uniq(aNew), 'region anchors unique in both versions (invalidateSitemapCache, sitemap helpers, serveEnglishHtml)', JSON.stringify({ old: aOld, new: aNew }));
    if (!(uniq(aOld) && uniq(aNew))) return;
    const inside = (lo, hi, a) => (lo >= a.inv[0] - 6 && hi <= a.inv[0] + 6) || (lo >= a.smStart[0] && hi <= a.smEnd[0] - 1);
    const hunks = [...diffText.matchAll(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/gm)].map((m) => ({
        a: +m[1], b: m[2] === undefined ? 1 : +m[2], c: +m[3], d: m[4] === undefined ? 1 : +m[4] }));
    const outside = hunks.filter((h) => {
        const oLo = h.a, oHi = h.b === 0 ? h.a : h.a + h.b - 1;
        const nLo = h.c, nHi = h.d === 0 ? h.c : h.c + h.d - 1;
        return !(inside(oLo, oHi, aOld) && inside(nLo, nHi, aNew));
    });
    ok('K', hunks.length > 0 && outside.length === 0,
        'every server.js hunk (' + hunks.length + ') lies inside invalidateSitemapCache ±6 lines or the sitemap region (old ' + aOld.smStart[0] + '-' + aOld.smEnd[0] + ', new ' + aNew.smStart[0] + '-' + aNew.smEnd[0] + ')',
        'outside: ' + outside.map((h) => '-' + h.a + ',' + h.b + ' +' + h.c + ',' + h.d).join(' '));
    info('hunks: ' + hunks.map((h) => '-' + h.a + ',' + h.b + ' +' + h.c + ',' + h.d).join('  '));
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════
async function main() {
    const t0 = Date.now();
    const REQ_DATES = new Set();
    const addDates = () => { const d = new Date(); REQ_DATES.add(d.toISOString().slice(0, 10)); REQ_DATES.add(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')); };
    addDates();
    const PORTS = [AFTER_PORT, BASE_PORT, SEAM_PORT];
    let afterChild = null, baseChild = null, seamChild = null, seamBaseChild = null;
    try {
        staticChecks();

        section('[H] base checkout + ports');
        if (!BASE_ROOT || !fs.existsSync(path.join(BASE_ROOT, 'server.js'))) throw new Error('TP_BASE_ROOT is not set or has no server.js — every base comparison would be impossible');
        let baseTree = '', wantTree = '', porcelain = 'unreadable';
        try {
            baseTree = git(BASE_ROOT, ['rev-parse', 'HEAD^{tree}']).toString().trim();
            wantTree = git(ROOT, ['rev-parse', DIFF_BASE + '^{tree}']).toString().trim();
            porcelain = git(BASE_ROOT, ['status', '--porcelain']).toString().trim();
        } catch (e) { info('git on base failed: ' + e.message.split('\n')[0]); }
        ok('H', !!baseTree && baseTree === wantTree && porcelain === '', 'TP_BASE_ROOT is clean and its tree === ' + DIFF_BASE + '^{tree} of the tree under test',
            'base ' + baseTree + ' vs ' + wantTree + ' porcelain=' + JSON.stringify(porcelain.slice(0, 200)));
        info('ROOT=' + ROOT + '  BASE_ROOT=' + BASE_ROOT + '  base tree ' + baseTree.slice(0, 12) + '  ports ' + PORTS.join(','));
        for (const p of PORTS) {
            const h = await fetchTextRaw(p, '/health', {}, 3000);   // raw: status 0 (port free) is the expected result
            ok('H', h.status === 0 && await portFree(p), 'port ' + p + ' is free before the run', 'health=' + h.status);
        }
        const boots = await Promise.allSettled([boot(ROOT, AFTER_PORT), boot(BASE_ROOT, BASE_PORT)]);
        afterChild = boots[0].status === 'fulfilled' ? boots[0].value : null;
        baseChild = boots[1].status === 'fulfilled' ? boots[1].value : null;
        ok('H', !!afterChild && !!baseChild, 'AFTER (:' + AFTER_PORT + ') and BASE (:' + BASE_PORT + ') servers healthy',
            boots.filter((b) => b.status === 'rejected').map((b) => b.reason.message).join(' | '));
        if (!afterChild || !baseChild) throw new Error('servers not healthy');
        const A = AFTER_PORT, B = BASE_PORT;

        // ── [R] robots ──
        section('[R] robots.txt');
        const ra = await fetchText(A, '/robots.txt'), rb = await fetchText(B, '/robots.txt');
        ok('R', ra.status === 200 && rb.status === 200 && Buffer.compare(ra.buf, rb.buf) === 0 && ra.headers['content-type'] === rb.headers['content-type'] && ra.headers['cache-control'] === rb.headers['cache-control'],
            'robots.txt byte-identical to BASE (status, content-type, cache-control, body)', brief(ra) + ' vs ' + brief(rb));
        const robotsPathsA = sitemapPaths(ra.body), robotsPathsB = sitemapPaths(rb.body);
        info('robots Sitemap lines: ' + robotsPathsA.join(' '));

        // ── BASE walk ──
        section('BASE — robots.txt → /sitemap.xml → legacy children + /sitemap-quran.xml (streamed)');
        let tp = Date.now();
        const baseCol = makeCollector(null);
        const bw = await walkSitemaps(B, robotsPathsB, baseCol.onBlock);
        const baseRoot = bw.byPath.get('/sitemap.xml');
        info('base: ' + bw.files.length + ' URL-set files, ' + baseCol.entries + ' entries, ' + baseCol.byLoc.size + ' unique (' + Math.round((Date.now() - tp) / 1000) + ' s)');
        const baseBad = bw.order.filter((r) => r.status !== 200 || r.err || r.xmlErr || r.badBlocks || (r.type === 'index' && !r.index.exact));
        ok('H', !!baseRoot && baseRoot.type === 'index' && baseBad.length === 0 && baseCol.dups === 0,
            'BASE sitemap files all 200 with the exact envelope / block grammar, no duplicate loc',
            baseBad.map((r) => r.path + ' ' + r.status + ' ' + (r.xmlErr || r.err || ('bad blocks ' + r.badBlocks))).join(' | ') + ' dups=' + baseCol.dups + ' ' + baseCol.dupSamples.join(' '));
        if (!baseRoot || baseRoot.type !== 'index') throw new Error('BASE /sitemap.xml is not a sitemap index');

        // ── AFTER walk ──
        section('AFTER — robots.txt → /sitemap.xml → every child (streamed, block-compared on the fly)');
        tp = Date.now();
        const chk = makeAfterChecker(baseCol);
        const aw = await walkSitemaps(A, robotsPathsA, chk.onBlock);
        addDates();
        const root = aw.byPath.get('/sitemap.xml');
        if (!root || root.type !== 'index') throw new Error('AFTER /sitemap.xml is not a sitemap index (' + (root ? root.status + ' ' + root.xmlErr : 'missing') + ')');
        const rootPaths = root.index.paths;
        const children = rootPaths.map((p) => (p ? aw.byPath.get(p) : null));
        info('after: ' + aw.files.length + ' URL-set files, ' + chk.entries + ' entries (' + Math.round((Date.now() - tp) / 1000) + ' s)');
        console.log('    ' + 'FILE'.padEnd(28) + 'STATUS TYPE    URLS    BYTES       LASTMOD FAMILY');
        for (const r of aw.order) console.log('    ' + r.name.padEnd(28) + String(r.status).padEnd(7) + String(r.type).padEnd(8) + String(r.urls).padEnd(8) + String(r.bytes).padEnd(12) + String(r.lastmods).padEnd(8) + (r.family || '-'));
        info('after family counts: ' + JSON.stringify(chk.famCounts));

        // ── [S1]..[S6] set + families ──
        section('[S1]-[S6] URL set + families');
        let removed = 0, present = 0; const removedSamples = [];
        for (const e of baseCol.byLoc.values()) { if (e.a === 0) { removed++; pushS(removedSamples, e.loc + ' (base ' + e.file + ')'); } else present++; }
        const afterUnique = present + chk.added.size;
        ok('S1', baseCol.byLoc.size === EXPECTED_TOTAL && afterUnique === baseCol.byLoc.size && chk.entries === afterUnique,
            baseCol.byLoc.size + ' → ' + afterUnique + ' unique <loc> (expected ' + EXPECTED_TOTAL + ' → ' + EXPECTED_TOTAL + '; AFTER entries ' + chk.entries + ')');
        ok('S2', chk.added.size === 0, 'ADDED = ' + chk.added.size, chk.addedSamples.join(' | '));
        ok('S3', removed === 0, 'REMOVED = ' + removed, removedSamples.join(' | '));
        ok('S4', chk.dups === 0 && chk.entries === afterUnique, 'DUPLICATES = ' + chk.dups + ' (within and across AFTER files)', chk.dupSamples.join(' | '));
        ok('S5', chk.unclassified === 0, 'UNCLASSIFIED = ' + chk.unclassified, chk.unSamples.join(' | '));
        const baseUncl = [...baseCol.byLoc.values()].filter((e) => e.fam === 'UNCLASSIFIED' || e.fam === 'MULTI').length;
        ok('S5', baseUncl === 0, 'BASE set also classifies completely (UNCLASSIFIED+MULTI = ' + baseUncl + ')');
        ok('S6', chk.multi === 0, 'every URL matches exactly one family (multi-family = ' + chk.multi + ')', chk.multiSamples.join(' | '));
        ok('S6', chk.wrongFile === 0, 'every URL sits in a file of its own family (misplaced = ' + chk.wrongFile + ')', chk.wfSamples.join(' | '));
        const badNames = rootPaths.filter((p) => !p || !fileFamily(p.slice(1)));
        ok('S6', badNames.length === 0, 'every root child name maps to a family', badNames.join(' '));

        // ── [S9] root + [S10]..[S12] + [F] ──
        section('[S9]-[S12] + [F] root index');
        ok('S9', root.status === 200 && root.index.exact && !root.err && rootPaths.every(Boolean), '/sitemap.xml exact <sitemapindex> envelope (' + rootPaths.length + ' children, absolute https locs)', root.xmlErr || root.err || '');
        ok('S10', root.status === 200 && /^application\/xml\b/.test(root.ctype), '/sitemap.xml 200 application/xml', root.status + ' ' + root.ctype);
        const legacyListed = rootPaths.filter((p) => /sitemap-main|sitemap-cities/.test(String(p)));
        ok('S11', legacyListed.length === 0, 'root index lists no legacy file (sitemap-main / sitemap-cities-*)', legacyListed.join(' '));
        ok('S12', root.index.lastmods === 0, 'root index has 0 <lastmod>', 'found ' + root.index.lastmods);
        const nested = children.filter((r) => !r || r.type !== 'urlset');
        ok('S12', nested.length === 0, 'every root child is a urlset (no nested sitemapindex)', nested.map((r) => (r ? r.path + ' ' + r.type : 'missing')).join(' '));
        const famSeq = rootPaths.map((p) => fileFamily(String(p).slice(1)));
        const runs = famSeq.filter((f, i) => i === 0 || f !== famSeq[i - 1]);
        const nonEmpty = FAMILY_ORDER.filter((f) => f !== 'ramadan');
        const expectedRuns = FAMILY_ORDER.filter((f) => nonEmpty.includes(f) || runs.includes(f));
        ok('F', eq(runs, expectedRuns) && new Set(runs).size === runs.length,
            'root family order = ' + expectedRuns.join(',') + ' (each family contiguous; ramadan only if non-empty)', 'actual runs ' + runs.join(','));

        // ── per-child [S7] [S8] [S9] [S10] + gzip + determinism ──
        section('[S7]-[S10] + [S20] per root child (gzip decode + second identity fetch)');
        await pool(children.filter(Boolean), 3, async (rec) => {
            rec.gzr = await streamFile(A, rec.path, { 'Accept-Encoding': 'gzip' });
            rec.id2 = await streamFile(A, rec.path, {});
        });
        for (const rec of children) {
            if (!rec) continue;
            const wantHead = rec.name === 'sitemap-quran.xml' ? URLSET_PLAIN_OPEN : URLSET_XHTML_OPEN;
            ok('S7', rec.urls > 0 && rec.urls <= MAX_URLS, rec.name + ' ' + rec.urls + ' URLs ≤ ' + MAX_URLS);
            ok('S8', rec.bytes > 0 && rec.bytes <= MAX_BYTES, rec.name + ' ' + rec.bytes + ' bytes ≤ ' + MAX_BYTES);
            ok('S9', rec.type === 'urlset' && rec.head === wantHead && !rec.xmlErr && !rec.err && rec.badBlocks === 0 && rec.enc === '',
                rec.name + ' exact urlset envelope, ' + rec.urls + ' well-formed <url> blocks with one <loc> each', (rec.xmlErr || rec.err || '') + ' bad=' + rec.badBlocks + ' ' + rec.badSamples.map((s) => JSON.stringify(s)).join(' '));
            ok('S9', rec.gzr.status === 200 && rec.gzr.gz && !rec.gzr.err && rec.gzr.sha === rec.sha && rec.gzr.bytes === rec.bytes && rec.gzr.rawBytes < rec.bytes,
                rec.name + ' gzip response decodes to identical bytes', 'gz=' + rec.gzr.gz + ' ' + rec.gzr.bytes + ' vs ' + rec.bytes + ' err=' + rec.gzr.err);
            ok('S10', rec.status === 200 && /^application\/xml\b/.test(rec.ctype), rec.name + ' 200 application/xml', rec.status + ' ' + rec.ctype);
            ok('S20', rec.id2.status === 200 && !!rec.sha && rec.id2.sha === rec.sha, rec.name + ' fetched twice → byte-identical', rec.id2.sha + ' vs ' + rec.sha);
        }
        const rootA = await fetchText(A, '/sitemap.xml'), rootB = await fetchText(A, '/sitemap.xml'), rootGz = await fetchText(A, '/sitemap.xml', { 'Accept-Encoding': 'gzip' });
        ok('S20', rootA.status === 200 && Buffer.compare(rootA.buf, rootB.buf) === 0 && crypto.createHash('sha256').update(rootA.buf).digest('hex') === root.sha, '/sitemap.xml fetched three times → byte-identical');
        ok('S9', rootGz.status === 200 && rootGz.headers['content-encoding'] === 'gzip' && !rootGz.gunzipErr && Buffer.compare(rootGz.buf, rootA.buf) === 0, '/sitemap.xml gzip response decodes to identical bytes');

        // ── [S15] lastmod ──
        section('[S15] lastmod policy');
        const lmFiles = children.filter(Boolean).map((r) => [r.name, r.lastmods]);
        const lmWrongFiles = lmFiles.filter(([n, c]) => (n === 'sitemap-pages.xml' ? c !== 20 : n === 'sitemap-quran.xml' ? c !== 115 : c !== 0));
        ok('S15', chk.lmBad === 0, 'no <lastmod> outside the 20 legal URLs (2026-08-09, sitemap-pages.xml) and the 115 Quran URLs (2026-07-22)', chk.lmSamples.join(' | '));
        ok('S15', chk.legal === 20 && chk.legalNotBase === 0, 'exactly 20 /[lang/]privacy|terms lastmod = ' + LEGAL_LASTMOD + ', each === BASE', 'legal=' + chk.legal + ' notBase=' + chk.legalNotBase);
        ok('S15', chk.quranLm === 115, 'exactly 115 Quran lastmod = ' + QURAN_LASTMOD, 'quran=' + chk.quranLm);
        ok('S15', lmWrongFiles.length === 0, 'per-file lastmod counts: sitemap-pages 20, sitemap-quran 115, every other file 0', JSON.stringify(lmWrongFiles));
        const todayHits = [...chk.lmValues].filter((v) => REQ_DATES.has(v));
        ok('S15', todayHits.length === 0, 'no <lastmod> equals the request date (' + [...REQ_DATES].join(',') + ')', todayHits.join(','));
        ok('S15', chk.lastmodChanged === 0, 'lastmod of every loc === BASE (changed = ' + chk.lastmodChanged + ')');

        // ── [S16] [S17] [S18] ──
        section('[S16]-[S18] block identity, hreflang, loc hygiene');
        ok('S16', chk.blockChanged === 0 && chk.compared === baseCol.byLoc.size, 'every AFTER <url> block byte-identical to the BASE block for the same loc (' + chk.compared + ' compared, changed ' + chk.blockChanged + ')', chk.bcSamples.join(' | '));
        ok('S16', chk.altBad === 0, '11 alternates (ar..ms + x-default, exact hrefs, self-href) per non-Quran URL; 0 per Quran URL (bad = ' + chk.altBad + ')', chk.altSamples.join(' | '));
        ok('S17', chk.html === 0, 'no .html in any loc (' + chk.html + ')', chk.htmlSamples.join(' | '));
        ok('S18', chk.query === 0, 'no query / fragment in any loc (' + chk.query + ')', chk.querySamples.join(' | '));

        // ── [S20] names + independent plan ──
        section('[S20] shard names + INDEPENDENT plan recomputation from the BASE legacy stream');
        const legacyStreamFiles = bw.files.filter((r) => r.name !== 'sitemap-quran.xml').map((r) => r.name);
        info('base legacy stream order: ' + legacyStreamFiles.join(' '));
        const plan = recomputePlan(baseCol.streams);
        for (const f of FAMILY_ORDER) if (plan.detail[f]) info('plan ' + f.padEnd(12) + JSON.stringify(plan.detail[f]));
        ok('S20', plan.errors.length === 0, 'BASE legacy stream groups into complete 10-language path groups (ar..ms) for every family', plan.errors.join(' | '));
        const strayStreams = Object.keys(baseCol.streams).filter((k) => !FAMILY_ORDER.includes(k) || k === 'quran');
        ok('S20', strayStreams.length === 0, 'BASE legacy stream holds no Quran / unclassified entries (Quran lives only in /sitemap-quran.xml)', strayStreams.join(','));
        const shardsByFam = {};
        for (const p of rootPaths) { const f = fileFamily(String(p).slice(1)); if (f) (shardsByFam[f] ||= []).push(p); }
        const nameBad = [];
        for (const f of FAMILY_ORDER) {
            const s = shardsByFam[f] || [];
            if (f === 'quran') { if (!eq(s, ['/sitemap-quran.xml'])) nameBad.push(f + ':' + s.join(',')); continue; }
            if (s.length === 1 && s[0] !== '/sitemap-' + f + '.xml') nameBad.push(f + ':' + s[0]);
            if (s.length > 1 && !eq(s, s.map((_, k) => '/sitemap-' + f + '-' + (k + 1) + '.xml'))) nameBad.push(f + ':' + s.join(','));
        }
        ok('S20', nameBad.length === 0 && rootPaths.every((p) => FAMILY_FILE_RE.test(String(p).slice(1))),
            'shard names ^sitemap-(family)(-k)?\\.xml$ — single file has no -k, multi-shard k = 1..N contiguous in order', nameBad.join(' | '));
        const expRoot = FAMILY_ORDER.flatMap((f) => plan.fams[f].map((p) => '/' + p.name));
        ok('S20', eq(rootPaths, expRoot), 'root children === recomputed plan (families, shard counts, names, order)', 'actual ' + rootPaths.join(',') + ' expected ' + expRoot.join(','));
        for (const f of FAMILY_ORDER) {
            if (f === 'quran') continue;
            for (const p of plan.fams[f]) {
                const rec = aw.byPath.get('/' + p.name);
                ok('S20', !!rec && rec.urls === p.urls && rec.bytes === p.bytes && rec.locDigest === p.locDigest && rec.blockDigest === p.blockDigest,
                    p.name + ' loc list + block bytes === recomputed part (' + p.paths + ' paths, ' + p.urls + ' URLs, ' + p.bytes + ' B, ' + p.firstLoc.slice(SITE.length) + ' .. ' + p.lastLoc.slice(SITE.length) + ')',
                    rec ? ('urls ' + rec.urls + ' bytes ' + rec.bytes + ' loc ' + (rec.locDigest === p.locDigest) + ' blocks ' + (rec.blockDigest === p.blockDigest) + ' first ' + rec.firstLoc + ' last ' + rec.lastLoc) : 'file missing in AFTER');
            }
        }

        // ── [S13] family endpoints ──
        section('[S13] family endpoints (+ [S9] [S20] for family indexes)');
        const probes404 = [];
        for (const f of FAMILY_ORDER) {
            const s = shardsByFam[f] || [], N = s.length;
            if (f === 'quran') {
                ok('S13', N === 1 && s[0] === '/sitemap-quran.xml', 'quran family = /sitemap-quran.xml listed in root');
                probes404.push('/sitemap-quran-1.xml');
                continue;
            }
            if (N === 0) {
                ok('S13', plan.fams[f].length === 0, f + ': empty family (recomputed plan also empty)', 'plan parts ' + plan.fams[f].length);
                probes404.push('/sitemap-' + f + '.xml', '/sitemap-' + f + '-1.xml', '/sitemap-' + f + '.xml.gz');
            } else if (N === 1) {
                const rec = aw.byPath.get(s[0]);
                ok('S13', s[0] === '/sitemap-' + f + '.xml' && !!rec && rec.type === 'urlset' && rec.status === 200, f + ': 1-shard family → /sitemap-' + f + '.xml is the urlset listed in root');
                probes404.push('/sitemap-' + f + '-1.xml', '/sitemap-' + f + '-0.xml', '/sitemap-' + f + '-01.xml', '/sitemap-' + f + '-2.xml', '/sitemap-' + f + '.xml.gz');
            } else {
                const p = '/sitemap-' + f + '.xml';
                const i1 = await fetchText(A, p), i2 = await fetchText(A, p), ig = await fetchText(A, p, { 'Accept-Encoding': 'gzip' });
                const pi = parseIndex(i1.body);
                ok('S13', i1.status === 200 && /^application\/xml\b/.test(i1.headers['content-type'] || '') && eq(pi.paths, s) && !rootPaths.includes(p),
                    f + ': ' + p + ' is a sitemapindex of exactly its ' + N + ' shards in order, not listed in root', brief(i1) + ' children ' + pi.paths.join(','));
                ok('S9', pi.exact && pi.lastmods === 0, f + ': family index exact <sitemapindex> envelope, 0 <lastmod>');
                ok('S9', ig.status === 200 && ig.headers['content-encoding'] === 'gzip' && !ig.gunzipErr && Buffer.compare(ig.buf, i1.buf) === 0, f + ': family index gzip decodes to identical bytes');
                ok('S20', i2.status === 200 && Buffer.compare(i1.buf, i2.buf) === 0, f + ': family index fetched twice → byte-identical');
                probes404.push('/sitemap-' + f + '-' + (N + 1) + '.xml', '/sitemap-' + f + '-0.xml', '/sitemap-' + f + '-01.xml', '/sitemap-' + f + '.xml.gz', '/sitemap-' + f + '-1.xml.gz');
            }
        }
        probes404.push('/sitemap-xyz.xml');
        const pr = await pool(probes404, 4, (p) => fetchText(A, p));
        const pBad = probes404.map((p, i) => [p, pr[i]]).filter(([, r]) => !is404Text(r));
        ok('S13', pBad.length === 0, probes404.length + ' non-existent family names → 404 text/plain "Not Found", no Location (' + probes404.join(' ') + ')', pBad.map(([p, r]) => p + ' → ' + brief(r)).join(' | '));
        const xyzB = await fetchText(B, '/sitemap-xyz.xml');
        ok('S13', is404Text(xyzB) && is404Text(pr[pr.length - 1]), 'unknown sitemap name 404 is the same as BASE (legacy 404 shape)', brief(xyzB));

        // ── [S14] Quran ──
        section('[S14] /sitemap-quran.xml === BASE');
        const qa = await fetchText(A, '/sitemap-quran.xml'), qb = await fetchText(B, '/sitemap-quran.xml');
        ok('S14', qa.status === 200 && qb.status === 200 && qa.buf.length > 0 && Buffer.compare(qa.buf, qb.buf) === 0, 'body byte-identical to BASE (' + qa.buf.length + ' bytes)', brief(qa) + ' vs ' + brief(qb));
        const hk = ['etag', 'last-modified', 'cache-control', 'content-type'];
        ok('S14', hk.every((k) => !!qa.headers[k] && qa.headers[k] === qb.headers[k]), 'ETag, Last-Modified, Cache-Control, Content-Type === BASE',
            JSON.stringify(hk.map((k) => [k, qa.headers[k], qb.headers[k]])));
        const q304a = await fetchText(A, '/sitemap-quran.xml', { 'If-None-Match': qa.headers.etag || '"none"' });
        const q304b = await fetchText(B, '/sitemap-quran.xml', { 'If-None-Match': qb.headers.etag || '"none"' });
        const q304w = await fetchText(A, '/sitemap-quran.xml', { 'If-None-Match': 'W/' + (qa.headers.etag || '"none"') });
        ok('S14', q304a.status === 304 && q304a.raw.length === 0 && q304b.status === 304 && q304w.status === 304 && q304a.headers.etag === qa.headers.etag,
            '304 on If-None-Match (strong + weak) on AFTER, same as BASE', q304a.status + '/' + q304w.status + ' base ' + q304b.status);
        const qgzA = await fetchText(A, '/sitemap-quran.xml.gz'), qgzB = await fetchText(B, '/sitemap-quran.xml.gz');
        ok('S14', qgzA.status === 200 && !qgzA.gunzipErr && Buffer.compare(qgzA.buf, qa.buf) === 0 && Buffer.compare(qgzA.raw, qgzB.raw) === 0, '/sitemap-quran.xml.gz decodes to the same bytes, compressed bytes === BASE');
        ok('S14', rootPaths.includes('/sitemap-quran.xml') && robotsPathsA.includes('/sitemap-quran.xml'), '/sitemap-quran.xml listed in the root index and still in robots.txt');

        // ── [L] legacy files ──
        section('[L] legacy /sitemap-main.xml + /sitemap-cities-1..N.xml === BASE');
        const legacyPaths = baseRoot.index.paths.filter((p) => /^\/sitemap-(?:main|cities-\d+)\.xml$/.test(String(p)));
        const nCities = legacyPaths.length - 1;
        ok('L', legacyPaths[0] === '/sitemap-main.xml' && nCities > 0 && eq(legacyPaths.slice(1), Array.from({ length: nCities }, (_, i) => '/sitemap-cities-' + (i + 1) + '.xml')) && legacyPaths.length === baseRoot.index.paths.length,
            'BASE index = /sitemap-main.xml + /sitemap-cities-1..' + nCities + '.xml', baseRoot.index.paths.join(','));
        const legacyAfter = await pool(legacyPaths, 3, (p) => streamFile(A, p, {}));
        legacyPaths.forEach((p, i) => {
            const br = bw.byPath.get(p), ar = legacyAfter[i];
            ok('L', !!br && ar.status === 200 && !ar.err && ar.sha === br.sha && ar.bytes === br.bytes && ar.headers['content-type'] === br.ctype,
                p + ' byte-identical to BASE (' + (br ? br.bytes : '?') + ' bytes, sha256 ' + String(br && br.sha).slice(0, 12) + ')', ar.status + ' ' + ar.bytes + ' ' + ar.sha);
        });
        const nextA = await fetchText(A, '/sitemap-cities-' + (nCities + 1) + '.xml'), nextB = await fetchText(B, '/sitemap-cities-' + (nCities + 1) + '.xml');
        ok('L', is404Text(nextA) && is404Text(nextB), '/sitemap-cities-' + (nCities + 1) + '.xml → 404 text/plain on both', brief(nextA) + ' vs ' + brief(nextB));
        const aliases = [['/sitemap-cities-01.xml', '/sitemap-cities-1.xml'], ['/sitemap-main.xml.gz', '/sitemap-main.xml'], ['/sitemap-cities-1.xml.gz', '/sitemap-cities-1.xml']];
        for (const [alias, canon] of aliases) {
            const [xa, xb] = await Promise.all([streamFile(A, alias, {}), streamFile(B, alias, {})]);
            const br = bw.byPath.get(canon);
            ok('L', xa.status === 200 && xb.status === 200 && !!br && xa.sha === br.sha && xb.sha === br.sha && xa.gz === xb.gz,
                alias + ' (alias) decodes to the same bytes as BASE ' + canon, xa.status + '/' + xb.status + ' gz ' + xa.gz + '/' + xb.gz);
        }

        // ── [S19] HTTP sample ──
        section('[S19] HTTP sample on AFTER');
        const allLocs = [];
        for (const e of baseCol.byLoc.values()) if (e.a > 0) allLocs.push(e.loc);
        for (const l of chk.added) allLocs.push(l);
        const keyed = allLocs.map((l) => [crypto.createHash('sha1').update(l).digest('hex'), l]).sort((x, y) => (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0));
        // every 997th position of the sha1-ordered list, widened to R residues mod 997 so the stride sample is ≥ 1,000 URLs
        const strideCount = (R) => Math.floor(keyed.length / 997) * R + Math.min(R, keyed.length % 997);
        let R = 1; while (strideCount(R) < 1000 && R < 997) R++;
        const sample = new Set();
        keyed.forEach(([, l], i) => { if (i % 997 < R) sample.add(l); });
        const strideN = sample.size;
        for (const rec of children) if (rec && rec.firstLoc) { sample.add(rec.firstLoc); sample.add(rec.lastLoc); }
        const list = [...sample];
        info('sample: ' + strideN + ' stride URLs (positions i % 997 < ' + R + ' in sha1 order of ' + keyed.length + ') + first/last of ' + children.length + ' files = ' + list.length);
        const strip = (html) => String(html).replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[\s\S]*?<\/script>/gi, '');
        const s19bad = []; let retried = 0; tp = Date.now();
        await pool(list, 4, async (loc) => {
            let r = await fetchText(A, pathOfLoc(loc), {}, 180000);
            if (r.status === 0) { retried++; await sleep(1000); r = await fetchText(A, pathOfLoc(loc), {}, 180000); }
            const doc = strip(r.body);
            const robots = [...doc.matchAll(/<meta\b[^>]*\bname=["']robots["'][^>]*>/gi)].map((m) => (m[0].match(/\bcontent=["']([^"']*)["']/i) || [])[1] || '');
            const canons = [...doc.matchAll(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi)].map((m) => unxml((m[0].match(/\bhref=["']([^"']*)["']/i) || [])[1] || ''));
            const xrt = String(r.headers['x-robots-tag'] || '');
            const why = [];
            if (r.status !== 200) why.push('status ' + r.status + (r.err ? ' ' + r.err : ''));
            if (r.headers.location) why.push('Location ' + r.headers.location);
            if (/noindex/i.test(xrt)) why.push('X-Robots-Tag ' + xrt);
            if (robots.some((v) => /noindex/i.test(v))) why.push('meta robots ' + robots.join(' | '));
            if (canons.length !== 1 || canons[0] !== loc) why.push('canonical ' + JSON.stringify(canons));
            if (why.length) s19bad.push(loc + ' → ' + why.join('; '));
        });
        ok('S19', list.length >= 1000 && strideN >= 1000 && s19bad.length === 0,
            list.length + ' sampled <loc>: 200, no Location, no noindex (meta / X-Robots-Tag), exactly one canonical === loc (' + Math.round((Date.now() - tp) / 1000) + ' s, status-0 retries ' + retried + ')',
            s19bad.length + ' bad: ' + s19bad.slice(0, 6).join(' || '));

        const realBaseYears = moonYearsOf(baseCol.streams.moon);
        const CUR = new Date().getUTCFullYear();
        await stop(afterChild); afterChild = null;
        await stop(baseChild); baseChild = null;

        // ── [C] clock seam ──
        section('[C] clock seam TP_MOON_RANGE_TEST_NOW=' + SEAM_NOW + ' (AFTER :' + SEAM_PORT + ', BASE :' + BASE_PORT + ')');
        const sboots = await Promise.allSettled([boot(ROOT, SEAM_PORT, { TP_MOON_RANGE_TEST_NOW: SEAM_NOW }), boot(BASE_ROOT, BASE_PORT, { TP_MOON_RANGE_TEST_NOW: SEAM_NOW })]);
        seamChild = sboots[0].status === 'fulfilled' ? sboots[0].value : null;
        seamBaseChild = sboots[1].status === 'fulfilled' ? sboots[1].value : null;
        ok('H', !!seamChild && !!seamBaseChild, 'seam AFTER and seam BASE servers healthy', sboots.filter((b) => b.status === 'rejected').map((b) => b.reason.message).join(' | '));
        if (!seamChild || !seamBaseChild) throw new Error('seam servers not healthy');
        tp = Date.now();
        const sbCol = makeCollector('moon');
        const sbRobots = await fetchText(BASE_PORT, '/robots.txt');
        const sbw = await walkSitemaps(BASE_PORT, sitemapPaths(sbRobots.body), sbCol.onBlock);
        const sbBad = sbw.order.filter((r) => r.status !== 200 || r.err || r.xmlErr || r.badBlocks);
        ok('H', sbBad.length === 0 && sbCol.dups === 0, 'seam BASE sitemap files parse with the exact grammar', sbBad.map((r) => r.path + ' ' + (r.xmlErr || r.err || r.status)).join(' | '));
        const seamBaseYears = moonYearsOf(sbCol.streams.moon);
        ok('C', eq(realBaseYears, [CUR - 1, CUR, CUR + 1]) && eq(seamBaseYears, SEAM_YEARS),
            'seam is effective: real-clock moon years ' + realBaseYears.join(',') + ' → seam moon years ' + seamBaseYears.join(',') + ' (expected ' + SEAM_YEARS.join(',') + ')');
        const sChk = makeAfterChecker(sbCol);
        const sRoot = await parseFile(SEAM_PORT, '/sitemap.xml', 'seam', () => {});
        const sMoonPaths = (sRoot.index ? sRoot.index.paths : []).filter((p) => fileFamily(String(p).slice(1)) === 'moon');
        const sRecs = [];
        for (const p of sMoonPaths) sRecs.push(await parseFile(SEAM_PORT, p, '/sitemap.xml', sChk.onBlock));
        let sRemoved = 0; for (const e of sbCol.byLoc.values()) if (e.a === 0) sRemoved++;
        info('seam: base moon ' + sbCol.byLoc.size + ' URLs; after moon files ' + sRecs.map((r) => r.name + '=' + r.urls).join(' ') + ' (' + Math.round((Date.now() - tp) / 1000) + ' s)');
        const sParseBad = sRecs.filter((r) => r.status !== 200 || r.type !== 'urlset' || r.xmlErr || r.err || r.badBlocks || r.urls > MAX_URLS || r.bytes > MAX_BYTES);
        ok('C', sRoot.status === 200 && !!sRoot.index && sRoot.index.exact && sMoonPaths.length > 0 && sParseBad.length === 0,
            'seam AFTER root index exact; moon files 200, exact grammar, within limits', sParseBad.map((r) => r.name + ' ' + (r.xmlErr || r.err || r.status)).join(' | '));
        ok('C', sbCol.byLoc.size > 0 && sChk.entries === sbCol.byLoc.size && sChk.added.size === 0 && sRemoved === 0 && sChk.dups === 0 && sChk.wrongFile === 0 && sChk.unclassified === 0 && sChk.multi === 0,
            'seam AFTER moon family union === BASE legacy moon URLs (' + sChk.entries + ' vs ' + sbCol.byLoc.size + '; added ' + sChk.added.size + ', removed ' + sRemoved + ', dups ' + sChk.dups + ', misplaced ' + sChk.wrongFile + ')',
            sChk.addedSamples.concat(sChk.wfSamples, sChk.unSamples).join(' | '));
        ok('C', sChk.blockChanged === 0 && sChk.compared === sbCol.byLoc.size && sChk.altBad === 0 && sChk.lmBad === 0, 'seam moon blocks byte-identical to BASE (' + sChk.compared + ' compared, changed ' + sChk.blockChanged + ')', sChk.bcSamples.join(' | '));
        ok('C', eq([...sChk.moonYears].sort((a, b) => a - b), SEAM_YEARS), 'seam AFTER moon years === ' + SEAM_YEARS.join(','), [...sChk.moonYears].join(','));
        const sPlan = recomputePlan(sbCol.streams, ['moon']);
        const sExp = sPlan.fams.moon.map((p) => '/' + p.name);
        ok('C', sPlan.errors.length === 0 && eq(sMoonPaths, sExp), 'seam moon shard names === recomputed plan (' + sExp.join(',') + ')', sPlan.errors.join(' | ') + ' actual ' + sMoonPaths.join(','));
        for (const p of sPlan.fams.moon) {
            const rec = sRecs.find((r) => r.name === p.name);
            ok('C', !!rec && rec.urls === p.urls && rec.bytes === p.bytes && rec.locDigest === p.locDigest && rec.blockDigest === p.blockDigest,
                'seam ' + p.name + ' loc list + block bytes === recomputed part (' + p.urls + ' URLs, ' + p.bytes + ' B)', rec ? rec.urls + ' ' + rec.bytes : 'missing');
        }
    } catch (e) {
        fail++; (stats.H ||= { pass: 0, fail: 0 }).fail++;
        fails.push('HARNESS: ' + (e && e.stack || e)); console.log('  ✗ HARNESS: ' + (e && e.stack || e));
    } finally {
        for (const c of [afterChild, baseChild, seamChild, seamBaseChild]) if (c) await stop(c);
        for (const c of [...CHILDREN]) await stop(c);
        const busy = [];
        for (const p of PORTS) { let free = false; for (let i = 0; i < 50 && !(free = await portFree(p)); i++) await sleep(200); if (!free) busy.push(p); }
        ok('H', busy.length === 0 && CHILDREN.size === 0, 'every server process tree killed; ports ' + PORTS.join(',') + ' free at the end', 'busy ' + busy.join(','));
    }
    console.log('\n================================================================');
    console.log('  HTTP re-reads after a transport failure or a cut-short body: buffered=' + HTTP_RETRY.text + ' streamed=' + HTTP_RETRY.stream);
    for (const [k, n] of [...HTTP_RETRY.paths.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log('      ' + String(n).padStart(3) + ' x ' + k);
    console.log('  per label:');
    const order = ['K', 'H', 'R', ...Array.from({ length: 20 }, (_, i) => 'S' + (i + 1)), 'F', 'L', 'C'];
    for (const l of [...order.filter((x) => stats[x]), ...Object.keys(stats).filter((x) => !order.includes(x))]) console.log('    ' + ('[' + l + ']').padEnd(6) + ' PASS ' + String(stats[l].pass).padStart(3) + '   FAIL ' + stats[l].fail);
    console.log('  SITEMAP-SEMANTIC-PARTITIONING-1 smoke   PASS ' + pass + '   FAIL ' + fail + '   (' + Math.round((Date.now() - t0) / 1000) + ' s)');
    fails.forEach((f) => console.log('    - ' + f));
    console.log('================================================================');
    process.exit(fail === 0 ? 0 : 1);
}
main();
