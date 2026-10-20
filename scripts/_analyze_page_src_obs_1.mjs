// PAGE-SOURCE-OBSERVABILITY-1 -- offline analyser of harvested [page-src] lines (local files only; no network).
//
// Input: one or more text files holding [page-src] lines as copied from the Render log view or raw stdout (any prefix
//   before '[page-src] {' is ignored). Lines are de-duplicated by boot | worker | seq | part, so overlapping harvests are
//   safe. Rows exist for Singapore traffic only (edge-attested + cf-ipcountry SG); every other request of the five
//   families is only counted in meta.total (and meta.unattested when it was not edge-attested). Output (text, + JSON with
//   --json <file>):
//   - completeness per window: every part present, and the sum of n over the rows <= meta.total - meta.unattested; the
//     meta totals (all requests, unattested, edge-attested from another country = total - unattested - rows, to set
//     against [req-family]); windows with compaction / overflow / a full prefix table / an hour-late request, the snapshot
//     state and the edge trust;
//   - the meta sums: User-Agent cache overflow (meta.ua_ovf, requests, and the windows with any), the token table
//     (meta.tokens: the largest, and the windows at the 300 cap) and the pseudo-IPv4 requests (meta.pseudo);
//   - per UTC hour (also shown at --tz-hours, default +3 = Asia/Riyadh, the GA4 property's time zone): the SG requests in
//     rows, the PATTERN rows (default: country SG + declared browser + a Chrome-on-Windows token; --cc / --token-re to
//     change it) and the rest, with their status classes; + the requests whose token is 'overflow' (User-Agent cache or
//     token table full: such a source could not be told apart), the key-cap 'overflow' rows and the 'pseudo' and 'v6x'
//     prefix rows;
//   - the pattern by language, family, header completeness (bcls), status and Chrome major version;
//   - the pattern's networks: rows with their own /24 (IPv6 /32) (prefix, n, hours seen), the '*' rows (n, and the sum
//     of their per-row distinct-prefix estimates -- an UPPER bound of the distinct networks, since one network can recur
//     in several rows and windows) and the 'pseudo' / 'v6x' rows;
//   - the 'overflow' tokens by declared class -> n;
//   - crawler claims: declared x ver (v / x / np / err) -> n;
//   - the top sources overall (declared x token) by n.
//   Reading notes: a row is an aggregate of a worker window; a User-Agent is self-declared and its token a fixed label; a
//   prefix is a network, not an identity; country = the edge's cf-ipcountry. Nothing here proves who operates a source.
// Usage: node scripts/_analyze_page_src_obs_1.mjs <log> [<log> ...] [--cc SG] [--token-re '^browser:chrome-\d+:windows$'] [--tz-hours 3]
//        [--json out.json]
import fs from 'node:fs';

const argv = process.argv.slice(2);
const opt = (name, dflt) => { const i = argv.indexOf(name); if (i === -1) return dflt; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const CC = opt('--cc', 'SG');
const TOKEN_RE = new RegExp(opt('--token-re', '^browser:chrome-\\d+:windows$'));
const JSON_OUT = opt('--json', '');
// the lines carry UTC hours; GA4 reports this property in Asia/Riyadh (UTC+3): each hour is also shown at that offset
const TZ_H = Number(opt('--tz-hours', '3'));
const localHour = (h) => { const t = Date.parse(h + ':00:00Z'); return Number.isFinite(t) ? new Date(t + TZ_H * 3600000).toISOString().slice(0, 13).replace('T', ' ') + ':00' : '?'; };
const files = argv;
if (!files.length) { console.error('usage: node scripts/_analyze_page_src_obs_1.mjs <log> [...] [--cc SG] [--token-re RE] [--json out.json]'); process.exit(2); }

const COLS = 'hour,family,lang,declared,token,ver,bcls,country,prefix,n,2xx,3xx,4xx,5xx,abort,head,avg_ms,max_ms,pfx'.split(',');
const C = Object.fromEntries(COLS.map((c, i) => [c, i]));
const seen = new Set(), wins = new Map();
let lines = 0, dup = 0, bad = 0; const other = { enabled: 0, expired: 0, warn: 0 };
for (const f of files) {
    for (const l of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
        if (/\[page-src\] worker=\d+ ENABLED/.test(l)) { other.enabled++; continue; }
        if (/\[page-src\] worker=\d+ EXPIRED/.test(l)) { other.expired++; continue; }
        if (/\[page-src\] worker=\d+ WARN/.test(l)) { other.warn++; continue; }
        const i = l.indexOf('[page-src] {');
        if (i === -1) continue;
        let o;
        try { o = JSON.parse(l.slice(i + 11)); } catch (_) { bad++; continue; }
        if (o.cols !== COLS.join(',')) { bad++; continue; }
        const k = o.boot + '|' + o.w + '|' + o.seq + '|' + o.part;
        if (seen.has(k)) { dup++; continue; }
        seen.add(k); lines++;
        const wk = o.boot + '|' + o.w + '|' + o.seq;
        let W = wins.get(wk);
        if (!W) { W = { boot: o.boot, w: o.w, seq: o.seq, ts: o.ts, win: o.win, meta: null, rows: [], parts: new Set() }; wins.set(wk, W); }
        if (o.part === 0) W.meta = o.meta;
        W.parts.add(o.part);
        W.rows.push(...o.rows);
    }
}
const add = (m, k, n) => m.set(k, (m.get(k) || 0) + n);
const top = (m, n = 20) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
const isPattern = (r) => r[C.country] === CC && r[C.declared] === 'browser' && TOKEN_RE.test(String(r[C.token]));
// completeness + meta sums
const comp = { windows: wins.size, complete: 0, mismatched: [], partsMissing: 0, compact: 0, overflow: 0, pfxFull: 0, hrLate: 0, rangesNotOk: 0, edgeOff: 0 };
const mt = { total: 0, unattested: 0, rows: 0, other_attested: 0 };
const metaSum = { ua_ovf: 0, ua_ovf_windows: 0, tokens_max: 0, tokens_at_cap_windows: 0, pseudo: 0 };
for (const W of wins.values()) {
    const n = W.rows.reduce((s, r) => s + r[C.n], 0);
    if (!W.meta) { comp.partsMissing++; continue; }
    const maxPart = Math.max(...W.parts);
    const partsOk = W.parts.size === maxPart + 1;
    if (!partsOk) comp.partsMissing++;
    const attested = W.meta.total - (W.meta.unattested || 0);
    if (partsOk && n <= attested) comp.complete++; else comp.mismatched.push(W.boot + '/w' + W.w + '/seq' + W.seq + ': rows ' + n + ' vs attested ' + attested);
    mt.total += W.meta.total; mt.unattested += W.meta.unattested || 0; mt.rows += n; mt.other_attested += attested - n;
    if (W.meta.compact) comp.compact++;
    if (W.meta.ovf) comp.overflow++;
    if (W.meta.pfx_full) comp.pfxFull++;
    comp.hrLate += W.meta.hr_late || 0;
    if (W.meta.ranges_state !== 'ok') comp.rangesNotOk++;
    if (!W.meta.edge_trust) comp.edgeOff++;
    metaSum.ua_ovf += W.meta.ua_ovf || 0;
    if (W.meta.ua_ovf) metaSum.ua_ovf_windows++;
    metaSum.tokens_max = Math.max(metaSum.tokens_max, W.meta.tokens || 0);
    if ((W.meta.tokens || 0) >= 300) metaSum.tokens_at_cap_windows++;
    metaSum.pseudo += W.meta.pseudo || 0;
}
// aggregates
const hours = new Map();
const pat = { lang: new Map(), family: new Map(), bcls: new Map(), status: new Map(), major: new Map(), prefixes: new Map(), star: { n: 0, pfxSum: 0, rows: 0 }, pseudo: { n: 0, rows: 0 }, v6x: { n: 0, rows: 0 } };
const claims = new Map(), srcTop = new Map(), special = new Map();
let total = 0;
for (const W of wins.values()) for (const r of W.rows) {
    const n = r[C.n];
    total += n;
    const h = hours.get(r[C.hour]) || { all: 0, pattern: 0, rest: 0, p2xx: 0, p3xx: 0, p4xx: 0, p5xx: 0, pabort: 0, phead: 0, tok_overflow: 0, keycap_overflow: 0, pseudo: 0, v6x: 0 };
    h.all += n;
    const tk = String(r[C.token]);
    if (tk === 'overflow') { h.tok_overflow += n; add(special, r[C.declared] + ' | ' + tk, n); }
    if (r[C.declared] === 'overflow') h.keycap_overflow += n;
    if (r[C.prefix] === 'pseudo') h.pseudo += n;
    if (r[C.prefix] === 'v6x') h.v6x += n;
    if (isPattern(r)) {
        h.pattern += n; h.p2xx += r[C['2xx']]; h.p3xx += r[C['3xx']]; h.p4xx += r[C['4xx']]; h.p5xx += r[C['5xx']]; h.pabort += r[C.abort]; h.phead += r[C.head];
        add(pat.lang, r[C.lang], n); add(pat.family, r[C.family], n); add(pat.bcls, r[C.bcls], n);
        for (const s of ['2xx', '3xx', '4xx', '5xx', 'abort']) add(pat.status, s, r[C[s]]);
        add(pat.major, (/chrome-(\d+)/.exec(r[C.token]) || [])[1] || '?', n);
        if (r[C.prefix] === '*') { pat.star.n += n; pat.star.pfxSum += r[C.pfx]; pat.star.rows++; }
        else if (r[C.prefix] === 'pseudo') { pat.pseudo.n += n; pat.pseudo.rows++; }
        else if (r[C.prefix] === 'v6x') { pat.v6x.n += n; pat.v6x.rows++; }
        else { const p = pat.prefixes.get(r[C.prefix]) || { n: 0, hours: new Set() }; p.n += n; p.hours.add(r[C.hour]); pat.prefixes.set(r[C.prefix], p); }
    } else h.rest += n;
    hours.set(r[C.hour], h);
    if (r[C.ver] !== 'na' && r[C.ver] !== '-') add(claims, r[C.declared] + ' | ver ' + r[C.ver], n);
    add(srcTop, r[C.declared] + ' | ' + r[C.token], n);
}
// report
const out = { files, lines, duplicates: dup, unreadable: bad, enabled_lines: other.enabled, expired_lines: other.expired, warn_lines: other.warn, total_requests: total,
    meta_totals: { total: mt.total, unattested: mt.unattested, rows: mt.rows, other_attested: mt.other_attested },
    pattern: { cc: CC, token_re: TOKEN_RE.source }, completeness: comp, meta_sums: metaSum,
    tz_hours: TZ_H,
    hours: [...hours.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1).map(([h, v]) => ({ hour: h, local: localHour(h), ...v })),
    pattern_by: { lang: top(pat.lang), family: top(pat.family), bcls: top(pat.bcls), status: top(pat.status), chrome_major: top(pat.major) },
    pattern_networks: { own_prefix_rows: [...pat.prefixes.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 50).map(([p, v]) => [p, v.n, v.hours.size]),
        folded: { n: pat.star.n, rows: pat.star.rows, distinct_prefixes_upper_bound: pat.star.pfxSum }, pseudo: pat.pseudo, v6x: pat.v6x },
    overflow_tokens: top(special, 40),
    claims: top(claims, 50), top_sources: top(srcTop, 30) };
const pr = (s) => console.log(s);
pr('PAGE-SOURCE-OBSERVABILITY-1 analysis -- ' + files.length + ' file(s), ' + lines + ' lines (' + dup + ' duplicates, ' + bad + ' unreadable), ' + wins.size + ' worker windows, '
    + other.warn + ' WARN lines; ' + total + ' SG requests in rows');
pr('meta totals: all family requests ' + mt.total + ' (set against [req-family]), not edge-attested ' + mt.unattested + ', edge-attested from another country ' + mt.other_attested + ', SG rows ' + mt.rows);
pr('completeness: ' + comp.complete + '/' + comp.windows + ' windows with every part and rows <= total - unattested' + (comp.mismatched.length ? ' -- MISMATCH ' + comp.mismatched.slice(0, 5).join('; ') : '')
    + '; parts missing ' + comp.partsMissing + '; compaction ' + comp.compact + ', overflow ' + comp.overflow + ', prefix table full ' + comp.pfxFull
    + '; hour-late ' + comp.hrLate + '; snapshot not ok ' + comp.rangesNotOk + '; edge trust off ' + comp.edgeOff);
pr('meta sums: User-Agent cache overflow (ua_ovf) ' + metaSum.ua_ovf + ' requests in ' + metaSum.ua_ovf_windows + ' windows; token table (tokens) max ' + metaSum.tokens_max
    + ', at the 300 cap in ' + metaSum.tokens_at_cap_windows + ' windows; pseudo-IPv4 requests (pseudo) ' + metaSum.pseudo);
pr('\nper UTC hour (SG rows only; pattern = country ' + CC + ' + declared browser + token ~ /' + TOKEN_RE.source + '/; t.ovf = token "overflow"; kc.ovf = key-cap overflow rows; '
    + 'pseudo / v6x = those prefix rows):');
pr('  hour UTC       (UTC' + (TZ_H >= 0 ? '+' : '') + TZ_H + ')              all   pattern   rest   p.2xx p.3xx p.4xx p.5xx p.abort p.head   t.ovf  kc.ovf  pseudo     v6x');
for (const h of out.hours) pr('  ' + h.hour + '  (' + h.local + ')' + String(h.all).padStart(8) + String(h.pattern).padStart(9) + String(h.rest).padStart(7) + String(h.p2xx).padStart(7) + String(h.p3xx).padStart(6) + String(h.p4xx).padStart(6) + String(h.p5xx).padStart(6) + String(h.pabort).padStart(8) + String(h.phead).padStart(7)
    + String(h.tok_overflow).padStart(8) + String(h.keycap_overflow).padStart(8) + String(h.pseudo).padStart(8) + String(h.v6x).padStart(8));
for (const [k, v] of Object.entries(out.pattern_by)) pr('pattern by ' + k + ': ' + v.map(([a, b]) => a + ' ' + b).join(', '));
pr('pattern networks with their own row (prefix, n, hours): ' + (out.pattern_networks.own_prefix_rows.map((x) => x.join(' ')).join('; ') || '-'));
pr('pattern folded into "*": n ' + pat.star.n + ' in ' + pat.star.rows + ' rows; distinct prefixes <= ' + pat.star.pfxSum + ' (sum of per-row estimates)');
pr('pattern "pseudo" rows: n ' + pat.pseudo.n + ' in ' + pat.pseudo.rows + ' rows; "v6x" rows: n ' + pat.v6x.n + ' in ' + pat.v6x.rows + ' rows');
pr('overflow tokens (declared | token -> n): ' + (out.overflow_tokens.map(([a, b]) => a + ' ' + b).join(', ') || '-'));
pr('crawler claims (declared | ver -> n): ' + (out.claims.map(([a, b]) => a + ' ' + b).join(', ') || '-'));
pr('top sources (declared | token -> n): ' + out.top_sources.map(([a, b]) => a + ' ' + b).join(', '));
if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify(out, null, 1));
