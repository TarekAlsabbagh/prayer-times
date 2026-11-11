// PRAYER-COORD-LINK-CONSISTENCY-1 — SSR + seed smoke (self-contained; starts its own local server).
//
// A coordinate prayer link /prayer-times-in-{slug}-{lat}-{lng} whose point is ANOTHER place of the same name must
// describe that place everywhere: hero times, banner, city-intelligence zone + method, breadcrumb country and the
// `window.__PRAYER_CITY__` seed the client trusts. Before the fix the content was the slug's identity (e.g.
// boston-41.03-72.96 = Boston, KYRGYZSTAN showed Boston, United States: its coordinates, UTC-5 and ISNA).
//
// Expected values are INDEPENDENT of server.js: the point's country is the db/cities-{cc}.json file the record lives
// in, the zone is written out per case (checked against tz-lookup), and the method is the documented country default
// written out per case (checked against server.js `_SSR_METHOD_BY_CC`, so a map change fails loudly here instead of
// silently moving the expectation). Times are recomputed with js/prayer-times.js for the URL point.
// A coordinate link whose point is NOT resolved and verified (unknown word; coordinates far from / ambiguous with /
// invalid for the word; another record whose time zone is not verified) is the "unavailable" state (owner decisions
// 2026-11-10): no prayer time, countdown, clock, date, city or country anywhere in the document, a message, an optional
// link to the word's known city (name AND country) and a link to the home page search (sections 2, 3, 5, 5b).
// Unchanged behaviour is asserted too: identity-point links, bare city routes, robots, canonical and status.
// What the BROWSER does on such a page (no geolocation, no storage write, no navigation, back / forward) is measured
// in headless Chrome by timesprayers-shed-qa/prayer-coord-3/unavail-probe.mjs, not here.
//
// Run: node scripts/_smoke_prayer_coord_link_consistency_1.mjs        (PORT env overrides the default 8231; PORT+1 and PORT+2 run the winter / summer clocks; PORT+3 runs with dummy Google ids)
import http from 'node:http';
import { spawn, execSync } from 'node:child_process';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 8231);
const PT = require(path.join(ROOT, 'js', 'prayer-times.js'));
const tzLookup = require('tz-lookup');
const SRC = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
function grabMap(name) {
  const i = SRC.indexOf('const ' + name + ' = {'); if (i < 0) throw new Error('map not found: ' + name);
  const j = SRC.indexOf('{', i); let d = 0;
  for (let k = j; k < SRC.length; k++) { if (SRC[k] === '{') d++; else if (SRC[k] === '}' && --d === 0) return (0, eval)('(' + SRC.slice(j, k + 1) + ')'); }
  throw new Error('unterminated ' + name);
}
const METHOD_MAP = grabMap('_SSR_METHOD_BY_CC');

function get(p, port) { return new Promise((r) => { http.get({ host: '127.0.0.1', port: port || PORT, path: p, headers: { 'accept-encoding': 'identity' } }, (x) => { let b = ''; x.setEncoding('utf8'); x.on('data', (c) => b += c); x.on('end', () => r({ status: x.statusCode, body: b })); }).on('error', () => r({ status: 0, body: '' })); }); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function ready(t, port) { const t0 = Date.now(); while (Date.now() - t0 < t) { const r = await get('/health', port); if (r.status === 200) return 1; await sleep(400); } return 0; }
let pass = 0, fail = 0; const check = (l, ok, x) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${l}${x !== undefined ? '   →  ' + x : ''}`); };
const one = (b, re) => { const m = re.exec(b); return m ? m[1] : ''; };
const K = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const ssrTimes = (b) => Object.fromEntries(K.map((k) => [k, one(b, new RegExp('id="time-' + k + '">([^<]*)<'))]));
const pci = (b, lab) => one(b, new RegExp('<span class="pci-label">' + lab + '<\\/span><span class="pci-value">([^<]*)<'));
const seedOf = (b) => { const s = one(b, /window\.__PRAYER_CITY__=(\{[\s\S]*?\});<\/script>/); try { return s ? JSON.parse(s) : null; } catch (_e) { return null; } };
const bcCountry = (b) => one(b, /id="bc-country-name">([^<]*)</);
const note = (b) => one(b, /id="pc-coord-note" role="note">([^<]*)</);

// ── The "unavailable" state (owner decisions 2026-11-10, items 3 + 4): what the HTML of an UNRESOLVED coordinate link
//    must be. No prayer time, countdown, sticky bar, monthly table, clock, date, city or country anywhere in the document
//    (body, <title>, meta, JSON-LD, client seed); a message; an optional link to the word's known city with its name AND
//    country; a link to the home page search. Robots / canonical / hreflang / status as before. ──
const UN = (() => { try { return grabMap('_PRAYER_COORD_UNAVAIL_L10N'); } catch (_e) { return null; } })();   // null on a tree without the fix: the checks fail, they do not crash
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const deEnt = (s) => String(s || '').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const stripTags = (s) => deEnt(String(s || '').replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
const elText = (b, id) => { const m = new RegExp('<([a-z0-9]+)\\b[^>]*\\sid="' + id + '"[^>]*>([\\s\\S]*?)</\\1>').exec(b); return m ? stripTags(m[2]) : ''; };
const elHtml = (b, id) => { const m = new RegExp('<([a-z0-9]+)\\b[^>]*\\sid="' + id + '"[^>]*>([\\s\\S]*?)</\\1>').exec(b); return m ? m[2] : ''; };
const aHref = (b, id) => { const m = new RegExp('<a\\b[^>]*\\sid="' + id + '"[^>]*>').exec(b); return m ? ((/\shref="([^"]*)"/.exec(m[0]) || [])[1] || '') : ''; };
const metaC = (b, key) => deEnt(one(b, new RegExp('<meta (?:name|property)="' + key.replace(/[.:]/g, '\\$&') + '" content="([^"]*)"')));
// the document without what a visitor (or a crawler reading text) never sees as content: scripts, styles, icons, and the
// one render-time stamp every page carries (article:modified_time)
const visibleDoc = (b) => b.replace(/<script\b[\s\S]*?<\/script>/g, '').replace(/<style\b[\s\S]*?<\/style>/g, '').replace(/<svg\b[\s\S]*?<\/svg>/g, '').replace(/<meta property="article:modified_time"[^>]*>/g, '');
// element ids that hold a time, a clock, a date or a place on a prayer page
const TIME_PLACE_IDS = ['time-fajr', 'time-sunrise', 'time-dhuhr', 'time-asr', 'time-maghrib', 'time-isha', 'next-prayer-countdown', 'next-prayer-name', 'current-time', 'sticky-next-bar', 'snb-remaining', 'snb-prayer-name', 'snb-city', 'prayer-schedule-section', 'schedule-table', 'schedule-body', 'city-name', 'country-name', 'bc-city', 'bc-country-name', 'city-breadcrumb', 'location-suggestion-bar', 'calc-method', 'asr-method', 'time-format', 'settings-modal-overlay', 'adhan-popup', 'adhan-audio', 'notif-prompt'];
// [] = the document IS the unavailable state.  o = { lang, la, lo, tail, kind?, alt: {stem, city, country} | null, names: [strings that must not appear outside the alt link] }
function unavailProblems(r, o) {
  const b = r.body, P = [], L = o.lang, lp = L === 'ar' ? '' : '/' + L, T = UN || {};
  if (r.status !== 200) P.push('status ' + r.status);
  if (!/<html\b[^>]*\sdata-pc-unavailable="1"/.test(b)) P.push('no data-pc-unavailable marker on <html>');
  const kind = one(b, /id="pc-unavailable" data-pc-kind="([^"]*)"/);
  if (!/id="pc-unavailable"/.test(b)) P.push('no panel'); else if (o.kind && kind !== o.kind) P.push('kind=' + kind + ' (expected ' + o.kind + ')');
  const head = T.heading && T.heading[L], wantMsg = T.message && T.message[L] ? T.message[L].replace('{coords}', o.la + ', ' + o.lo) : null;
  if (!head || elText(b, 'page-h1') !== head) P.push('h1=' + elText(b, 'page-h1'));
  if (!head || stripTags(one(b, /<title>([\s\S]*?)<\/title>/)) !== head) P.push('title=' + one(b, /<title>([\s\S]*?)<\/title>/));
  if (!wantMsg || elText(b, 'pc-coord-note') !== wantMsg) P.push('message=' + elText(b, 'pc-coord-note'));
  if (!elHtml(b, 'pc-coord-note').includes('<bdi dir="ltr">' + o.la + ', ' + o.lo + '</bdi>')) P.push('coordinates not direction-isolated');
  for (const k of ['og:title', 'twitter:title', 'og:image:alt']) if (!head || metaC(b, k) !== head) P.push(k + '=' + metaC(b, k));
  for (const k of ['description', 'og:description', 'twitter:description']) if (!wantMsg || metaC(b, k).replace(/[⁦⁩]/g, '') !== wantMsg) P.push(k + '=' + metaC(b, k));
  if (o.alt) {
    const want = T.altLink && T.altLink[L] ? T.altLink[L].replace('{city}', o.alt.city).replace('{country}', o.alt.country) : null;
    if (aHref(b, 'pc-alt-city') !== lp + '/prayer-times-in-' + o.alt.stem) P.push('alt href=' + aHref(b, 'pc-alt-city'));
    if (!want || elText(b, 'pc-alt-city') !== want) P.push('alt label=' + elText(b, 'pc-alt-city'));
    if (!T.altLead || elText(b, 'pc-alt-lead') !== T.altLead[L]) P.push('alt lead=' + elText(b, 'pc-alt-lead'));
  } else if (/id="pc-alt-city"/.test(b) || /id="pc-alt-lead"/.test(b)) P.push('alt link present for an unknown word');
  if (aHref(b, 'pc-search-link') !== (lp || '/') || !T.search || elText(b, 'pc-search-link') !== T.search[L]) P.push('search link=' + aHref(b, 'pc-search-link') + ' ' + elText(b, 'pc-search-link'));
  const vis = visibleDoc(b);
  const tm = vis.match(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g); if (tm) P.push('time text ' + tm.slice(0, 4).join(' '));
  const ids = TIME_PLACE_IDS.filter((id) => b.includes('id="' + id + '"')); if (ids.length) P.push('elements ' + ids.join(','));
  if (/class="pci-/.test(b)) P.push('city-intelligence block');
  const pages = (b.match(/<div\b[^>]*\bclass="page\b[^"]*"[^>]*\bid="page-[^"]*"/g) || []).length; if (pages !== 1) P.push('page blocks=' + pages);
  if (/__PRAYER_CITY__\s*=/.test(b) || /id="ssr-prayer-city"/.test(b)) P.push('client seed');
  if (/id="country-cities-data"/.test(b)) P.push('country cities data');
  if (/application\/ld\+json/.test(b)) P.push('JSON-LD');
  if (/name="ssr-city-name"/.test(b)) P.push('ssr-city-name meta');
  if (/name="geo\.position"|name="ICBM"/.test(b)) P.push('geo meta');
  if (elText(b, 'sidebar-hijri-date') || elText(b, 'sidebar-greg-date')) P.push('sidebar date');
  const nav = (pg) => { const m = new RegExp('<a\\b[^>]*\\sdata-page="' + pg + '"[^>]*>').exec(b); return m ? ((/\shref="([^"]*)"/.exec(m[0]) || [])[1] || '') : ''; };
  if (nav('prayer-times') !== (lp || '/') || nav('qibla') !== lp + '/qibla' || nav('moon') !== lp + '/moon') P.push('sidebar links ' + [nav('prayer-times'), nav('qibla'), nav('moon')].join(' '));
  if (!/^noindex,follow/.test(one(b, /name="robots" content="([^"]*)"/))) P.push('robots=' + one(b, /name="robots" content="([^"]*)"/));
  if (!one(b, /rel="canonical" href="([^"]*)"/).endsWith(lp + '/prayer-times-in-' + o.tail)) P.push('canonical=' + one(b, /rel="canonical" href="([^"]*)"/));
  const hl = [...b.matchAll(/<link rel="alternate" hreflang="[^"]*" href="([^"]*)"/g)].map((m) => m[1]);
  if (hl.length !== 11 || !hl.every((h) => h.endsWith('/prayer-times-in-' + o.tail))) P.push('hreflang=' + hl.length);
  // no place name outside the alternative-city link (URLs excepted: the link's own word is part of this page's address)
  const text = stripTags(vis.replace(/<a\b[^>]*\sid="pc-alt-city"[\s\S]*?<\/a>/, '').replace(/\s(?:href|content|src|action)="[^"]*"/g, ''));
  for (const n of (o.names || [])) if (n && text.toLowerCase().includes(String(n).toLowerCase())) P.push('place name outside the alt link: ' + n);
  return P;
}
// every <a> of a page: { tag, id, page, href, unlinked }
const anchors = (b) => [...b.matchAll(/<a\b([^>]*)>/g)].map((m) => ({ tag: m[1], id: (/\sid="([^"]*)"/.exec(m[1]) || [])[1] || '', page: (/\sdata-page="([^"]*)"/.exec(m[1]) || [])[1] || '', href: (/\shref="([^"]*)"/.exec(m[1]) || [])[1], unlinked: /data-pc-unlinked="1"/.test(m[1]) }));
// a link to one of the stem's city routes (any language, any coordinate tail), the page's own URL excepted
const toStem = (stem, tail) => (h) => {
  if (!h) return false;
  const p = h.replace(/^\/(?:en|fr|tr|ur|de|id|es|bn|ms)(?=\/)/, '');
  if (p === '/prayer-times-in-' + tail) return false;
  return new RegExp('^/(?:prayer-times-in|qibla-in|next-prayer-in|time-left-until-next-prayer-in|moon-in|moon-today-in)-' + stem + '(?:-[-\\d.]+)?(?:/.*)?$').test(p)
    || new RegExp('^/moon/[a-z0-9-]+/' + stem + '(?:/.*)?$').test(p);
};
function offsetHours(z, d) { const v = (new Intl.DateTimeFormat('en-US', { timeZone: z, timeZoneName: 'longOffset' }).formatToParts(d).find((p) => p.type === 'timeZoneName') || {}).value || 'GMT'; const m = /GMT([+-])(\d{2}):(\d{2})/.exec(v); return m ? (m[1] === '-' ? -1 : 1) * (+m[2] + +m[3] / 60) : 0; }
function utcLabel(h) { const s = h < 0 ? '−' : '+'; const a = Math.abs(h); return 'UTC' + s + (Number.isInteger(a) ? a : a.toFixed(2).replace(/0$/, '')); }
function expectTimes(lat, lng, zone, method, at) {
  const now = at ? new Date(at) : new Date(); const off = offsetHours(zone, now);
  PT.setMethod(method); PT.setHighLats('AngleBased'); PT.setTimeFormat('24h');
  const loc = new Date(now.getTime() + off * 3600e3);
  const t = PT.getTimes(new Date(loc.getUTCFullYear(), loc.getUTCMonth(), loc.getUTCDate(), 12, 0, 0), lat, lng, off);
  return Object.fromEntries(K.map((k) => [k, t[k]]));
}
const METHOD_LABEL = { MWL: 'Muslim World League', ISNA: 'North America (ISNA)', Karachi: 'Univ. of Islamic Sciences – Karachi', Makkah: 'Umm al-Qura – Makkah' };

// [slug, lat, lng (as in the URL), point cc (its db/cities file), point zone, documented method, country name (en)]
// The zones of aberdeen / la-paz / bush are exactly the cases whose COUNTRY zone would be wrong (Toronto, Mexico City,
// New York) — the point's own zone must be used.
const NAMESAKE = [
  ['boston', '41.03', '72.96', 'kg', 'Asia/Bishkek', 'MWL', 'Kyrgyzstan'],
  ['san-francisco', '-31.44', '-62.07', 'ar', 'America/Argentina/Cordoba', 'MWL', 'Argentina'],
  ['aberdeen', '52.33', '-106.29', 'ca', 'America/Regina', 'ISNA', 'Canada'],
  ['la-paz', '24.15', '-110.31', 'mx', 'America/Mazatlan', 'ISNA', 'Mexico'],
  ['bush', '30.61', '-89.9', 'us', 'America/Chicago', 'ISNA', 'United States'],
  ['salem', '11.65', '78.17', 'in', 'Asia/Kolkata', 'Karachi', 'India'],       // has its own curated page (salem-in)
  ['dunkirk', '51.29', '0.98', 'gb', 'Europe/London', 'MWL', 'United Kingdom'], // closest pair (101.5 km)
  ['hit', '32.93', '36.67', 'sy', 'Asia/Damascus', 'Makkah', 'Syria'],
  // Faro, Yukon: the gate of _ssrCityIana rejects America/Whitehorse (no curated Canadian city uses it); the documented,
  // record-keyed exception _PRAYER_COORD_ZONE_EXCEPTIONS supplies it (section 3: winter, summer, narrowness).
  ['faro', '62.23', '-133.33', 'ca', 'America/Whitehorse', 'ISNA', 'Canada'],
];

const ENV = { ...process.env, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', ADSENSE_CLIENT: 'off', WEB_CONCURRENCY: '1' };
const srv = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...ENV, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
// Two more servers with the process clock moved to a winter and a summer day (test-only preload written to the OS temp
// dir): Faro, Yukon must stay on UTC-7 in both; the identity Faro (Portugal) must follow its own DST.
const FAKE = path.join(os.tmpdir(), 'tp-pcoord-fakeclock-' + process.pid + '.cjs');
fs.writeFileSync(FAKE, "'use strict';const iso=process.env.FAKE_NOW;if(iso){const R=Date,d=R.parse(iso)-R.now();class F extends R{constructor(...a){if(a.length===0)super(R.now()+d);else super(...a);}static now(){return R.now()+d;}}F.UTC=R.UTC;F.parse=R.parse;global.Date=F;}");
const WIN = '2026-01-15T20:00:00Z', SUM = '2026-07-15T20:00:00Z';
const srvW = spawn(process.execPath, ['-r', FAKE, 'server.js'], { cwd: ROOT, env: { ...ENV, PORT: String(PORT + 1), FAKE_NOW: WIN }, stdio: ['ignore', 'ignore', 'ignore'] });
const srvS = spawn(process.execPath, ['-r', FAKE, 'server.js'], { cwd: ROOT, env: { ...ENV, PORT: String(PORT + 2), FAKE_NOW: SUM }, stdio: ['ignore', 'ignore', 'ignore'] });
// A fourth server with DUMMY Google ids (local only; the server makes no outbound request at render time): the Google tags
//   the templates get at load time are then present, so their absence on unavailable pages can be checked (owner 2026-11-11).
const DUMMY_ADS = 'ca-pub-0000000000000000', DUMMY_GA = 'G-TEST000000';
const srvG = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...ENV, PORT: String(PORT + 3), ADSENSE_CLIENT: DUMMY_ADS, GA_MEASUREMENT_ID: DUMMY_GA }, stdio: ['ignore', 'ignore', 'ignore'] });
// The server forks a worker: kill the whole tree (a plain kill of the primary can leave the worker listening on Windows).
const killTree = (p) => { try { if (process.platform === 'win32') execSync('taskkill /PID ' + p.pid + ' /T /F', { stdio: 'ignore' }); else p.kill('SIGKILL'); } catch (_e) { try { p.kill('SIGKILL'); } catch (_) {} } };
let code = 1;
try {
  if (!await ready(60000) || !await ready(60000, PORT + 1) || !await ready(60000, PORT + 2) || !await ready(60000, PORT + 3)) { console.error('server not ready'); process.exit(1); }
  console.log('═══ PRAYER-COORD-LINK-CONSISTENCY-1 ═══\n');

  console.log('── (1) namesake coordinate links describe the POINT (times, zone, method, country, seed) ──');
  for (const [slug, la, lo, cc, zone, method, cname] of NAMESAKE) {
    const url = `/en/prayer-times-in-${slug}-${la}-${lo}`;
    const r = await get(url); const b = r.body;
    check(`${slug}: documented method of ${cc} = ${method} (server map)`, (METHOD_MAP[cc] || 'MWL') === method, METHOD_MAP[cc] || 'MWL (fallback)');
    check(`${slug}: tz-lookup(point) = ${zone}`, tzLookup(+la, +lo) === zone, tzLookup(+la, +lo));
    check(`${slug}: 200`, r.status === 200, r.status);
    const got = ssrTimes(b), exp = expectTimes(+la, +lo, zone, method);
    check(`${slug}: SSR hero times = the point's (${cc}, ${zone}, ${method})`, K.every((k) => got[k] === exp[k]), JSON.stringify(got) + ' vs ' + JSON.stringify(exp));
    const lab = utcLabel(offsetHours(zone, new Date()));
    check(`${slug}: city-intelligence zone = ${lab}`, pci(b, 'Time zone') === lab, pci(b, 'Time zone'));
    check(`${slug}: city-intelligence method = ${METHOD_LABEL[method]}`, pci(b, 'Calculation Method') === METHOD_LABEL[method], pci(b, 'Calculation Method'));
    check(`${slug}: breadcrumb country = ${cname}`, bcCountry(b) === cname, bcCountry(b));
    const s = seedOf(b);
    check(`${slug}: seed present, cc=${cc}, zone=${zone}, point=URL point`, !!s && s.countryCode === cc && s.timezone === zone && s.lat === +la && s.lng === +lo, s ? `${s.countryCode} ${s.timezone} ${s.lat},${s.lng}` : '(no seed)');
    check(`${slug}: seed satisfies the client's step-0 contract (name, country, numeric offset)`, !!s && !!s.name && !!s.country && typeof s.timezoneOffset === 'number' && s.timezoneOffset === offsetHours(zone, new Date()), s ? `${s.name} / ${s.country} / ${s.timezoneOffset}` : '');
    check(`${slug}: seed slug = URL stem (client name matching)`, !!s && s.slug === slug, s && s.slug);
    check(`${slug}: geo.position = URL point`, one(b, /name="geo\.position" content="([^"]*)"/) === `${la};${lo}`);
    check(`${slug}: robots noindex,follow (unchanged)`, /^noindex,follow/.test(one(b, /name="robots" content="([^"]*)"/)), one(b, /name="robots" content="([^"]*)"/));
    check(`${slug}: canonical self (unchanged)`, one(b, /rel="canonical" href="([^"]*)"/) === 'https://timesprayers.com' + url || one(b, /rel="canonical" href="([^"]*)"/).endsWith(url), one(b, /rel="canonical" href="([^"]*)"/));
  }

  console.log('\n── (2) unchanged: bare route, identity point, far point, invalid point ──');
  const bare = await get('/en/prayer-times-in-boston'); const bareT = ssrTimes(bare.body);
  const bs = seedOf(bare.body);
  check('bare boston: identity (United States, ISNA)', bcCountry(bare.body) === 'United States' && pci(bare.body, 'Calculation Method') === METHOD_LABEL.ISNA && bs && bs.countryCode === 'us', `${bcCountry(bare.body)} / ${pci(bare.body, 'Calculation Method')}`);
  check('bare boston: robots index (unchanged)', /(^|,)index/.test(one(bare.body, /name="robots" content="([^"]*)"/)));
  const idp = await get('/en/prayer-times-in-boston-42.36--71.06'); const idT = ssrTimes(idp.body);
  check('identity point boston-42.36--71.06: same times as the bare route', K.every((k) => idT[k] === bareT[k]), JSON.stringify(idT));
  check('identity point: United States + ISNA, seeded with the identity', bcCountry(idp.body) === 'United States' && pci(idp.body, 'Calculation Method') === METHOD_LABEL.ISNA && (seedOf(idp.body) || {}).countryCode === 'us');
  // Owner decisions 2026-11-10 (items 3 + 4) REPLACE the 2026-11-09 expectation "identity times + identity seed + note":
  //   an unresolved point shows NO times at all and no other city's data -- the unavailable state. The identity city is
  //   only offered as a link (name AND country), which the visitor may or may not follow.
  const BOS_ALT = { stem: 'boston', city: 'Boston', country: 'United States' };
  const far = await get('/en/prayer-times-in-boston-10.5-10.5');
  { const p = unavailProblems(far, { lang: 'en', la: '10.5', lo: '10.5', tail: 'boston-10.5-10.5', kind: 'far', alt: BOS_ALT, names: ['Boston', 'United States', 'Kyrgyzstan'] });
    check('far point boston-10.5-10.5: unavailable state — no times, no place, no seed; link "Prayer times in Boston, United States" only as an offer', p.length === 0, p.join(' | ')); }
  check('far point boston-10.5-10.5: none of the identity\'s times of the bare page appears anywhere in the document', K.every((k) => /^\d\d:\d\d$/.test(bareT[k])) && !K.some((k) => visibleDoc(far.body).includes(bareT[k])), JSON.stringify(bareT));
  const inv = await get('/en/prayer-times-in-boston-95.5-200.5');
  { const p = unavailProblems(inv, { lang: 'en', la: '95.5', lo: '200.5', tail: 'boston-95.5-200.5', kind: 'invalid', alt: BOS_ALT, names: ['Boston', 'United States'] });
    check('invalid point boston-95.5-200.5: no crash, unavailable state (no identity content, no seed)', p.length === 0, p.join(' | ')); }
  const intN = await get('/en/prayer-times-in-boston-41-73');
  check('integer namesake point boston-41-73 (also matches the bare-route shape): seed agrees with the SSR (kg, Kyrgyzstan)', (seedOf(intN.body) || {}).countryCode === 'kg' && bcCountry(intN.body) === 'Kyrgyzstan' && pci(intN.body, 'Calculation Method') === METHOD_LABEL.MWL, `${(seedOf(intN.body) || {}).countryCode} / ${bcCountry(intN.body)}`);
  const intF = await get('/en/prayer-times-in-boston-10-10');
  { const p = unavailProblems(intF, { lang: 'en', la: '10', lo: '10', tail: 'boston-10-10', kind: 'far', alt: BOS_ALT, names: ['Boston', 'United States'] });
    check('integer far point boston-10-10 (shares the bare-route shape): unavailable state, NOT seeded through the bare route', p.length === 0, p.join(' | ')); }
  const isResolved = (b) => !/data-pc-unavailable/.test(b) && !/id="pc-unavailable"/.test(b) && K.every((k) => /^\d\d:\d\d$/.test(ssrTimes(b)[k]));
  check('bare boston + identity point: resolved pages, not the unavailable state (times present, no marker, no panel)', isResolved(bare.body) && isResolved(idp.body));
  const ar = await get('/prayer-times-in-boston-41.03-72.96');
  const en = await get('/en/prayer-times-in-boston-41.03-72.96');
  check('ar namesake link: same times as en (language-independent)', K.every((k) => ssrTimes(ar.body)[k] === ssrTimes(en.body)[k]), JSON.stringify(ssrTimes(ar.body)));
  check('ar namesake link: seed cc kg', (seedOf(ar.body) || {}).countryCode === 'kg');

  console.log('\n── (3) faro, Yukon: record-keyed America/Whitehorse exception — winter, summer, narrowness ──');
  const wh = (iso) => offsetHours('America/Whitehorse', new Date(iso));
  check('ICU data in use: America/Whitehorse is UTC-7 in January AND July (no DST since 2020)', wh(WIN) === -7 && wh(SUM) === -7, `${wh(WIN)} / ${wh(SUM)}`);
  check('ICU data in use: Europe/Lisbon (the identity faro) is UTC+0 in January, UTC+1 in July', offsetHours('Europe/Lisbon', new Date(WIN)) === 0 && offsetHours('Europe/Lisbon', new Date(SUM)) === 1);
  for (const [lab, port, at] of [['winter', PORT + 1, WIN], ['summer', PORT + 2, SUM]]) {
    const fy = await get('/en/prayer-times-in-faro-62.23--133.33', port), fp = await get('/en/prayer-times-in-faro', port);
    const ey = expectTimes(62.23, -133.33, 'America/Whitehorse', 'ISNA', at), ep = expectTimes(37.01869, -7.92716, 'Europe/Lisbon', 'MWL', at);
    check(`faro Yukon ${lab}: SSR times = the point on UTC-7 (ISNA)`, K.every((k) => ssrTimes(fy.body)[k] === ey[k]), JSON.stringify(ssrTimes(fy.body)) + ' vs ' + JSON.stringify(ey));
    check(`faro Yukon ${lab}: zone label UTC−7, seed America/Whitehorse offset -7, Canada`, pci(fy.body, 'Time zone') === 'UTC−7' && (seedOf(fy.body) || {}).timezone === 'America/Whitehorse' && (seedOf(fy.body) || {}).timezoneOffset === -7 && bcCountry(fy.body) === 'Canada', pci(fy.body, 'Time zone'));
    check(`faro Portugal (bare, same name) ${lab}: unchanged identity — Europe/Lisbon, MWL, Portugal`, K.every((k) => ssrTimes(fp.body)[k] === ep[k]) && (seedOf(fp.body) || {}).timezone === 'Europe/Lisbon' && bcCountry(fp.body) === 'Portugal' && pci(fp.body, 'Time zone') === (lab === 'winter' ? 'UTC+0' : 'UTC+1'), JSON.stringify(ssrTimes(fp.body)) + ' ' + pci(fp.body, 'Time zone'));
  }
  const fpc = await get('/en/prayer-times-in-faro-37.02--7.93');
  check('faro identity coordinate link (Portugal point): Lisbon, no exception, no coordTools', (seedOf(fpc.body) || {}).timezone === 'Europe/Lisbon' && !(seedOf(fpc.body) || {}).coordTools);
  const fbare = await get('/en/prayer-times-in-faro');
  check('faro bare page: no Whitehorse anywhere (the exception never reaches the word)', !fbare.body.includes('America/Whitehorse'));
  // The exception does not widen the gate: another Canadian record whose zone the gate rejects stays unresolved.
  //   (2026-11-10: unresolved now means the unavailable state -- no Sydney (Australia) / Okara (Pakistan) times any more.)
  const syd = await get('/en/prayer-times-in-sydney-46.14--60.18');
  { const p = unavailProblems(syd, { lang: 'en', la: '46.14', lo: '-60.18', tail: 'sydney-46.14--60.18', kind: 'zone-unverified', alt: { stem: 'sydney', city: 'Sydney', country: 'Australia' }, names: ['Sydney', 'Australia', 'Canada', 'Nova Scotia'] });
    check('sydney-46.14--60.18 (Sydney, Nova Scotia: tz-lookup America/Halifax, gate fallback America/Toronto): zone not verified — unavailable state, no Whitehorse-style exception, no times of Sydney, Australia', p.length === 0 && !syd.body.includes('America/Halifax') && !syd.body.includes('America/Toronto'), p.join(' | ')); }
  const okr = await get('/en/prayer-times-in-okara-40.26-71.01');
  { const p = unavailProblems(okr, { lang: 'en', la: '40.26', lo: '71.01', tail: 'okara-40.26-71.01', kind: 'zone-unverified', alt: { stem: 'okara', city: 'Okara', country: 'Pakistan' }, names: ['Okara', 'Pakistan', 'Kyrgyzstan', 'Karachi'] });
    check('okara-40.26-71.01 (record filed under Kyrgyzstan; tz-lookup Asia/Tashkent, unstable): zone not verified — unavailable state, no times of Okara, Pakistan (owner decision 3)', p.length === 0, p.join(' | ')); }
  const okrBare = await get('/en/prayer-times-in-okara');
  check('okara bare page (the destination of the offered link): Okara, Pakistan — resolved, unchanged', isResolved(okrBare.body) && bcCountry(okrBare.body) === 'Pakistan' && (seedOf(okrBare.body) || {}).countryCode === 'pk', bcCountry(okrBare.body));

  console.log('\n── (4) tool links of a namesake coordinate page never lead to the other same-name city ──');
  const bos = await get('/en/prayer-times-in-boston-41.03-72.96'), A = anchors(bos.body);
  const nav = (a, pg) => (a.find((x) => x.page === pg && /^\/en\//.test(x.href || '')) || {}).href;
  check('boston (no own page): sidebar prayer = this page, qibla = /en/qibla hub, moon = /en/moon hub', nav(A, 'prayer-times') === '/en/prayer-times-in-boston-41.03-72.96' && nav(A, 'qibla') === '/en/qibla' && nav(A, 'moon') === '/en/moon', [nav(A, 'prayer-times'), nav(A, 'qibla'), nav(A, 'moon')].join(' '));
  check('boston: no link to any boston city route except this page', !A.some((a) => toStem('boston', 'boston-41.03-72.96')(a.href)), A.filter((a) => toStem('boston', 'boston-41.03-72.96')(a.href)).map((a) => a.href).join(' '));
  check('boston: the four city-named related links (time-left / next-prayer / qibla / moon) are removed, hijri stays', !/id="rl-(?:time-left|next-prayer|qibla|moon)"/.test(bos.body) && /id="rl-hijri"/.test(bos.body));
  check('boston: qibla / moon tool cards (label names the city) unlinked + hidden; mini tools (no city in label) keep the hubs', ['pt-tool-qibla', 'pt-tool-moon'].every((id) => { const a = A.find((x) => x.id === id); return a && a.unlinked && !a.href && /\shidden\b/.test(a.tag); }) && (A.find((x) => x.id === 'mit-qibla') || {}).href === '/en/qibla' && (A.find((x) => x.id === 'mit-moon') || {}).href === '/en/moon');
  check('boston: seed carries coordTools {stem, tail, own:""} for the client guard', JSON.stringify((seedOf(bos.body) || {}).coordTools) === JSON.stringify({ stem: 'boston', tail: 'boston-41.03-72.96', own: '', ownMoon: '' }), JSON.stringify((seedOf(bos.body) || {}).coordTools));
  check('boston: the other-language versions of this page are untouched (hreflang link)', /href="[^"]*\/fr\/prayer-times-in-boston-41\.03-72\.96"/.test(bos.body));
  const OWN = [['salem', '11.65', '78.17', 'salem-in', 'india'], ['bharatpur', '27.22', '77.49', 'bharatpur-in', 'india'], ['cambridge', '43.36', '-80.31', 'cambridge-ca', 'canada']];
  for (const [stem, la, lo, own, cs] of OWN) {
    const tail = stem + '-' + la + '-' + lo, pg = await get('/en/prayer-times-in-' + tail), B = anchors(pg.body);
    const want = { 'prayer-times': '/en/prayer-times-in-' + own, qibla: '/en/qibla-in-' + own, moon: '/en/moon/' + cs + '/' + own };
    check(`${stem} (own page ${own}): sidebar -> ${own}'s prayer / qibla / moon hub`, Object.keys(want).every((k) => nav(B, k) === want[k]), Object.keys(want).map((k) => nav(B, k)).join(' '));
    const hr = (id) => (B.find((x) => x.id === id) || {}).href;
    const ids = ['rl-time-left', 'rl-next-prayer', 'rl-qibla', 'rl-moon', 'mit-qibla', 'mit-moon', 'pt-tool-qibla', 'pt-tool-moon'];
    const exp = ['/en/time-left-until-next-prayer-in-' + own, '/en/next-prayer-in-' + own, want.qibla, want.moon, want.qibla, want.moon, want.qibla, want.moon];
    check(`${stem}: related links + mini tools + tool cards -> ${own}`, ids.every((id, i) => hr(id) === exp[i]), ids.map(hr).join(' '));
    check(`${stem}: no link to the identity's routes of "${stem}"`, !B.some((a) => toStem(stem, tail)(a.href)), B.filter((a) => toStem(stem, tail)(a.href)).map((a) => a.href).join(' '));
    const pc = (seedOf(pg.body) || {}).countryCode;
    for (const [lab, u] of [['prayer', want['prayer-times']], ['qibla', want.qibla], ['moon hub', want.moon], ['next-prayer', '/en/next-prayer-in-' + own], ['time-left', '/en/time-left-until-next-prayer-in-' + own]]) {
      const d = await get(u); const ds = seedOf(d.body);
      check(`${stem}: destination ${lab} ${u} answers 200 and names the same country (${pc})`, d.status === 200 && (!ds || ds.countryCode === pc) && (lab !== 'prayer' || (!!ds && ds.countryCode === pc)), `${d.status} ${ds ? ds.countryCode : '(no seed)'}`);
    }
  }
  const idl = anchors((await get('/en/prayer-times-in-boston-42.36--71.06')).body);
  check('identity coordinate link boston-42.36--71.06: links unchanged (identity pages)', nav(idl, 'qibla') === '/en/qibla-in-boston' && nav(idl, 'prayer-times') === '/en/prayer-times-in-boston');
  // The client guard (js/app.js _pcMapToolHref) and the server rewrite (server.js _prayerCoordToolHref) must agree.
  const grabFn = (src, name) => { const i = src.indexOf('function ' + name + '('); if (i < 0) throw new Error('fn ' + name); const j = src.indexOf('{', i); let d = 0; for (let k = j; k < src.length; k++) { if (src[k] === '{') d++; else if (src[k] === '}' && --d === 0) return src.slice(i, k + 1); } throw new Error('unterminated ' + name); };
  const APP = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
  const sfx = (src, decl) => (new RegExp(decl + " = ('[^']*')").exec(src) || [])[1];
  const load = (fn) => { try { return fn(); } catch (e) { return () => '(missing: ' + e.message + ')'; } };   // a tree without the fix fails the checks, it does not crash
  const srvMap = load(() => (0, eval)('(function(){var _PC_COORD_SFX=' + sfx(SRC, 'const _PC_COORD_SFX') + ';' + grabFn(SRC, '_prayerCoordToolHref') + ';return _prayerCoordToolHref;})()'));
  const cliMap = load(() => (0, eval)('(function(){var _PC_COORD_SFX=' + sfx(APP, 'var _PC_COORD_SFX') + ';' + grabFn(APP, '_pcMapToolHref') + ';return _pcMapToolHref;})()'));
  const CTS = [{ stem: 'boston', tail: 'boston-41.03-72.96', own: '', ownMoon: '' }, { stem: 'salem', tail: 'salem-11.65-78.17', own: 'salem-in', ownMoon: '/moon/india/salem-in' }];
  const HREFS = ['/en/prayer-times-in-boston', '/prayer-times-in-boston', '/en/prayer-times-in-boston-41.03-72.96', '/en/prayer-times-in-boston-42.36--71.06', '/en/qibla-in-boston', '/qibla-in-boston-41.03-72.96', '/en/moon/kyrgyzstan/boston', '/en/moon/united-states/boston/2026/11', '/en/moon-in-boston', '/en/moon-in-boston-41.0300-72.9600', '/fr/moon-today-in-boston', '/en/next-prayer-in-boston', '/en/time-left-until-next-prayer-in-boston', '/en/prayer-times-in-bostonia', '/en/qibla', '/en/moon', '/en/prayer-times-in-kyrgyzstan', '/en/prayer-times-in-salem', '/en/qibla-in-salem', '/de/moon/india/salem', '/en/next-prayer-in-salem', '/en/time-left-until-next-prayer-in-salem-11.65-78.17', 'https://x.test/en/qibla-in-boston', '#'];
  const diffs = [];
  for (const ct of CTS) for (const h of HREFS) { const a = JSON.stringify(srvMap(h, ct)), b = JSON.stringify(cliMap(h, ct)); if (a !== b) diffs.push(h + ' ' + a + ' != ' + b); }
  check(`server and client tool-link rules agree (${CTS.length * HREFS.length} cases)`, diffs.length === 0, diffs.slice(0, 3).join(' | '));
  check('rule spot-checks: boston qibla -> hub, next-prayer -> drop, other words / other points untouched; salem next-prayer -> salem-in',
    JSON.stringify(srvMap('/en/qibla-in-boston', CTS[0])) === JSON.stringify({ href: '/en/qibla', hub: true })
    && JSON.stringify(srvMap('/en/next-prayer-in-boston', CTS[0])) === JSON.stringify({ drop: true })
    && srvMap('/en/prayer-times-in-bostonia', CTS[0]) === null && srvMap('/en/prayer-times-in-boston-42.36--71.06', CTS[0]) === null
    && JSON.stringify(srvMap('/en/next-prayer-in-salem', CTS[1])) === JSON.stringify({ href: '/en/next-prayer-in-salem-in', hub: false }));

  console.log('\n── (5) unresolved coordinate links: the unavailable state — no times, no other city\'s data, anywhere ──');
  // (a) unknown word + coordinates   (b) known word whose coordinates are far from / ambiguous with / invalid for it
  // (c) another record of the word whose time zone is not verified.   Expected names are written out here (independent
  //     of server.js); `kind` is the resolver's reason, shown in data-pc-kind.
  const UNAV = [
    ['a', 'unknown word, valid coordinates', 'zzznotarealcity', '12.3', '45.6', 'no-identity', null, ['zzznotarealcity', 'Makkah', 'Mecca']],
    ['a', 'unknown word, valid coordinates in UTC-6', 'zzznotarealcity', '40.0', '-100.0', 'no-identity', null, ['zzznotarealcity']],
    ['a', 'unknown one-letter word', 'a', '12.3', '45.6', 'no-identity', null, ['Makkah', 'Mecca']],
    ['a', 'unknown word, integer coordinates', 'zzz', '12', '45', 'no-identity', null, ['Makkah', 'Mecca']],
    ['a', 'known word followed by three numbers (the word "boston-1" is unknown)', 'boston-1', '2', '3', 'no-identity', null, ['Boston', 'United States']],
    ['b', 'known word, negative coordinates far from it', 'boston', '-10.5', '-10.5', 'far', BOS_ALT, ['Boston', 'United States']],
    ['b', 'known word, point ambiguous between two records (jampur)', 'jampur', '29.38', '70.35', 'both', { stem: 'jampur', city: 'Jampur', country: 'Pakistan' }, ['Jampur', 'Pakistan']],
    ['b', 'known word, point ambiguous between two records (fordham)', 'fordham', '52.57', '0.38', 'both', { stem: 'fordham', city: 'Fordham', country: 'United Kingdom' }, ['Fordham', 'United Kingdom']],
    ['c', 'zone not verified (petra: point in Jordan, the word\'s known city is in Greece)', 'petra', '30.33', '35.44', 'zone-unverified', { stem: 'petra', city: 'Petra', country: 'Greece' }, ['Petra', 'Greece', 'Jordan']],
    ['c', 'zone not verified (san-juan: point in Puerto Rico)', 'san-juan', '18.47', '-66.12', 'zone-unverified', { stem: 'san-juan', city: 'San Juan', country: 'Argentina' }, ['San Juan', 'Argentina', 'Puerto Rico']],
  ];
  const unk = await get('/en/prayer-times-in-zzznotarealcity-12.3-45.6');
  for (const [grp, what, stem, la, lo, kind, alt, names] of UNAV) {
    const tail = stem + '-' + la + '-' + lo, r = (stem === 'zzznotarealcity' && la === '12.3') ? unk : await get('/en/prayer-times-in-' + tail);
    const p = unavailProblems(r, { lang: 'en', la, lo, tail, kind, alt, names });
    check(`(${grp}) ${what} — ${tail}: unavailable state`, p.length === 0, p.join(' | '));
  }
  check('unknown word with coordinates: no Makkah default times, no "--:--" placeholders left to fill, no seed', !/--:--/.test(visibleDoc(unk.body)) && !seedOf(unk.body) && !/id="time-fajr"/.test(unk.body));
  const unkBare = await get('/en/prayer-times-in-zzznotarealcity');
  check('unknown word WITHOUT coordinates: not a coordinate link — unchanged by this ticket (no marker, no panel; separate ticket UNKNOWN-PLACE-CLIENT-FALLBACK-1)', !/data-pc-unavailable/.test(unkBare.body) && !/id="pc-unavailable"/.test(unkBare.body));
  // Every unresolved record of the full scan (2026-11-10: 25 zone-not-verified + 7 far / ambiguous) and okara.
  const SCAN = ['san-juan-18.47--66.12', 'san-jose-14.97-145.63', 'sydney-46.14--60.18', 'montreal-46.43--90.24', 'saintpaul--21.01-55.27', 'pingxiang-22.1-106.75', 'borodino-45.64-34.68', 'saintnazaire-4.92--53.2', 'petra-30.33-35.44', 'tama-44.97-34.61', 'kurama-41-72.23', 'aleksandrovka-45.28-36.37', 'orlovka-45.4-36.28', 'romanovka-45.13-35.07', 'frunze-45.3-34.71', 'petrovka-45.11-35.31', 'pravda-45.78-33.85', 'sovetskoe-45.43-33.65', 'vasilyevka-45.27-36.35', 'novopokrovka-45.16-35.24', 'tula--14.26--170.56', 'san-antonio-15.13-145.69', 'vladislavivka-45.47-34.6', 'azovske-45.4-35.88', 'la-victoria-7.03--71.44',
    'frslev-55.29-12.32', 'fordham-52.57-0.38', 'al-mushayrifah-31.5-35.87', 'jampur-29.38-70.35', 'al-kamil-22.26-39.8', 'al-muwayh-22.43-41.75', 'mawqaq-27.39-41.18', 'okara-40.26-71.01'];
  const scanBad = [];
  for (const tail of SCAN) {
    const m = /^(.*?)-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/.exec(tail), r = await get('/en/prayer-times-in-' + tail), b = r.body;
    const kind = one(b, /id="pc-unavailable" data-pc-kind="([^"]*)"/), altT = elText(b, 'pc-alt-city'), am = /^Prayer times in (.+), (.+)$/.exec(altT);
    const core = unavailProblems(r, { lang: 'en', la: m[2], lo: m[3], tail, alt: am ? { stem: m[1], city: am[1], country: am[2] } : null, names: am ? [am[1]] : [] });
    if (core.length || !am || !/^(zone-unverified|both|far)$/.test(kind)) scanBad.push(tail + ' [' + kind + '] ' + core.slice(0, 2).join('; ') + (am ? '' : ' no alt link with name + country'));
  }
  check(`all ${SCAN.length} unresolved records of the full scan (25 zone not verified + 7 far / ambiguous + okara): unavailable state, the offered city named with its country`, scanBad.length === 0, scanBad.slice(0, 4).join(' || '));
  // The offered link says where it goes: its label must be the name and the country the destination page itself shows.
  const altBad = [];
  //   (The destination's breadcrumb country and its H1 are in the HTML of every city page, curated or not.)
  const reEsc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const [L, tail, stem] of [['en', 'boston-10.5-10.5', 'boston'], ['ar', 'boston-10.5-10.5', 'boston'], ['ur', 'okara-40.26-71.01', 'okara'], ['bn', 'sydney-46.14--60.18', 'sydney'], ['fr', 'petra-30.33-35.44', 'petra'], ['tr', 'jampur-29.38-70.35', 'jampur']]) {
    const lp = L === 'ar' ? '' : '/' + L, pg = await get(lp + '/prayer-times-in-' + tail), dest = await get(aHref(pg.body, 'pc-alt-city') || '/__none__');
    const label = elText(pg.body, 'pc-alt-city');
    const lm = UN ? new RegExp('^' + reEsc(UN.altLink[L]).replace('\\{city\\}', '(.+?)').replace('\\{country\\}', '(.+)') + '$').exec(label) : null;
    const byName = lm ? (UN.altLink[L].indexOf('{city}') < UN.altLink[L].indexOf('{country}') ? { city: lm[1], country: lm[2] } : { city: lm[2], country: lm[1] }) : null;
    const destCountry = bcCountry(dest.body), destH1 = elText(dest.body, 'page-h1');
    if (dest.status !== 200 || !isResolved(dest.body) || aHref(pg.body, 'pc-alt-city') !== lp + '/prayer-times-in-' + stem || !byName || !byName.city || byName.country !== destCountry || !destH1.includes(byName.city)) altBad.push(L + ' ' + tail + ': "' + label + '" vs destination h1 "' + destH1 + '" / country "' + destCountry + '" (' + dest.status + ')');
  }
  check('the offered link: 200, a resolved prayer page, and its label = the city (as in that page\'s H1) AND the country (that page\'s breadcrumb) (en, ar, ur, bn, fr, tr)', altBad.length === 0, altBad.join(' || '));
  const arFar = await get('/prayer-times-in-boston-10.5-10.5');
  { const p = unavailProblems(arFar, { lang: 'ar', la: '10.5', lo: '10.5', tail: 'boston-10.5-10.5', kind: 'far', alt: { stem: 'boston', city: 'بوسطن', country: 'الولايات المتحدة' }, names: ['بوسطن', 'الولايات المتحدة', 'Boston'] });
    check('Arabic far point: Arabic unavailable state; the offered link names بوسطن، الولايات المتحدة', p.length === 0, p.join(' | ')); }
  // All 10 languages x the three groups: each language its own texts (exactly the table of server.js
  //   _PRAYER_COORD_UNAVAIL_L10N, which waits for an independent language review), the URL coordinates, no unfilled
  //   placeholder, no times, the same structure. Names of the offered city are read from the destination page.
  for (const [what, tail, stem, la, lo, kind] of [['(a) unknown word', 'zzznotarealcity-12.3-45.6', '', '12.3', '45.6', 'no-identity'], ['(b) known word, far point', 'boston-10.5-10.5', 'boston', '10.5', '10.5', 'far'], ['(c) zone not verified', 'okara-40.26-71.01', 'okara', '40.26', '71.01', 'zone-unverified']]) {
    const bad = [], seenH = new Set(), seenM = new Set();
    for (const L of LANGS) {
      const lp = L === 'ar' ? '' : '/' + L, r = await get(lp + '/prayer-times-in-' + tail);
      let alt = null;
      if (stem) { const d = await get(lp + '/prayer-times-in-' + stem); alt = { stem, city: elText(d.body, 'city-name'), country: elText(d.body, 'country-name') }; if (!alt.city || !alt.country) bad.push(L + ': destination shows no name / country'); }
      const p = unavailProblems(r, { lang: L, la, lo, tail, kind, alt, names: alt ? [alt.city] : ['zzznotarealcity'] });
      const h = elText(r.body, 'page-h1'), m = elText(r.body, 'pc-coord-note');
      if (p.length) bad.push(L + ': ' + p.slice(0, 2).join('; '));
      if (/[{}]/.test(stripTags(elHtml(r.body, 'pc-unavailable')))) bad.push(L + ': unfilled placeholder');
      if (seenH.has(h) || seenM.has(m)) bad.push(L + ': text repeated from another language');
      if (!new RegExp('<html lang="' + L + '" dir="' + ((L === 'ar' || L === 'ur') ? 'rtl' : 'ltr') + '"').test(r.body)) bad.push(L + ': lang / dir');
      seenH.add(h); seenM.add(m);
    }
    check(`${what} — ${tail}: unavailable state in all 10 languages, each its own text, coordinates shown, no placeholder`, bad.length === 0, bad.slice(0, 4).join(' || '));
  }
  // The texts table itself: complete, and no wording that promises anything.
  { const bad = [];
    if (!UN) bad.push('table _PRAYER_COORD_UNAVAIL_L10N not found');
    else {
      for (const k of ['heading', 'message', 'altLead', 'altLink', 'search']) for (const L of LANGS) { const s = UN[k] && UN[k][L]; if (!s || typeof s !== 'string' || s.trim() !== s || s.length < 8) bad.push(k + '.' + L + ' missing'); }
      if (Object.keys(UN).sort().join() !== 'altLead,altLink,heading,message,search') bad.push('keys ' + Object.keys(UN).join());
      for (const L of LANGS) {
        const ph = (s) => (String(s || '').match(/\{[a-z]+\}/g) || []).sort().join();
        if (ph(UN.message && UN.message[L]) !== '{coords}') bad.push('message.' + L + ' placeholders ' + ph(UN.message && UN.message[L]));
        if (ph(UN.altLink && UN.altLink[L]) !== '{city},{country}') bad.push('altLink.' + L + ' placeholders ' + ph(UN.altLink && UN.altLink[L]));
        for (const k of ['heading', 'altLead', 'search']) if (ph(UN[k] && UN[k][L])) bad.push(k + '.' + L + ' has a placeholder');
        for (const k of Object.keys(UN)) if (/\d/.test(UN[k][L] || '')) bad.push(k + '.' + L + ' contains a digit');
      }
      for (const w of ['exact', 'accurate', 'precise', 'guarantee', 'verified times']) for (const k of Object.keys(UN)) if (new RegExp(w, 'i').test(UN[k].en || '')) bad.push('en ' + k + ' promises: ' + w);
    }
    check('texts table (server.js _PRAYER_COORD_UNAVAIL_L10N): 5 texts x 10 languages, placeholders {coords} / {city} + {country} only, no digit, no promise of accuracy', bad.length === 0, bad.slice(0, 5).join(' | ')); }
  check('the texts of the rejected "identity city + note" state are gone from server.js', !SRC.includes('_PRAYER_COORD_NOTE_L10N') && !SRC.includes('_prayerCoordInjectNote') && !/The prayer times on this page are for \{city\}/.test(SRC) && !/search for your city to get exact times/.test(SRC));
  check('namesake page (boston-41.03-72.96): resolved, not the unavailable state', isResolved(bos.body) && (seedOf(bos.body) || {}).countryCode === 'kg');
  const hk = await get('/en/prayer-times-in-hong-kong-22.28-114.16');
  check('ambiguous point that is also within 25 km of the identity (hong-kong: curated hk + db cn record): resolved — identity content + seed, not the unavailable state', isResolved(hk.body) && (seedOf(hk.body) || {}).countryCode === 'hk' && !(seedOf(hk.body) || {}).coordTools, `${(seedOf(hk.body) || {}).countryCode}`);
  const faroY = await get('/en/prayer-times-in-faro-62.23--133.33');
  check('faro, Yukon (the one zone exception): resolved, not the unavailable state', isResolved(faroY.body) && (seedOf(faroY.body) || {}).timezone === 'America/Whitehorse');

  console.log('\n── (5b) the unavailable transform fails closed, and the client gate is in place ──');
  // The transform is a pure function of (html, parts): run the real one, taken from server.js, on a template that has lost
  //   its prayer block and on one whose output would still carry a time element. It must THROW (the caller then serves
  //   the bare page) -- never return the city content.
  //   The transform also removes the template's Google head snippets (module constants of server.js); stand-ins with the
  //   same shape are defined here and placed in the sample document, so their removal is checked too.
  const SN = { c: "<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{});</script>", g: '<script async src="https://www.googletagmanager.com/gtag/js?id=G-X"></script>', a: '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0"></script>' };
  const tf = load(() => (0, eval)('(function(){var _CONSENT_DEFAULT_SNIPPET=' + JSON.stringify(SN.c) + ',_GA_HEAD_SNIPPET=' + JSON.stringify(SN.g) + ',_ADSENSE_HEAD_SNIPPET=' + JSON.stringify(SN.a) + ';' + ['_reEsc', '_escHtml', '_stripElement', '_pageBlockEnd', '_stripForeignPageBlocks', '_prayerCoordUnavailableTransform', '_prayerCoordUnavailableBare'].map((n) => grabFn(SRC, n)).join('\n') + ';return { t: _prayerCoordUnavailableTransform, bare: _prayerCoordUnavailableBare };})()'));
  const PARTS = { title: 'T', description: 'D', panel: '<section id="pc-unavailable"><h1 id="page-h1">T</h1></section>', homeHref: '/en', qiblaHref: '/en/qibla', moonHref: '/en/moon' };
  const threw = (html) => { try { tf.t(html, PARTS); return false; } catch (_e) { return true; } };
  const okDoc = '<html lang="en"><head>' + SN.c + SN.g + SN.a + '<meta name="google-adsense-account" content="ca-pub-0"><title>Prayer Times in X</title></head><body><div class="page active" id="page-prayer-times"><div id="time-fajr">05:00</div></div><div class="page" id="page-qibla"><div>q</div></div></body></html>';
  const outOk = (() => { try { return tf.t(okDoc, PARTS); } catch (e) { return 'THREW ' + e.message; } })();
  check('transform on a well-formed template: panel in, times out, other page blocks out, title replaced, marker set, Google head snippets + account meta removed', typeof tf.t === 'function' && /data-pc-unavailable="1"/.test(outOk) && /id="pc-unavailable"/.test(outOk) && !/05:00/.test(outOk) && !/page-qibla/.test(outOk) && /<title>T<\/title>/.test(outOk) && !/adsbygoogle|googletagmanager|gtag|dataLayer|google-adsense-account/.test(outOk), String(outOk).slice(0, 120));
  check('transform fails closed: no prayer block -> throws; unbalanced block -> throws; a time element left outside the block -> throws', typeof tf.t === 'function' && threw('<html><head><title>x</title></head><body><p>no block</p></body></html>') && threw('<html><head><title>x</title></head><body><div class="page active" id="page-prayer-times"><div>open') && threw(okDoc.replace('<body>', '<body><span id="next-prayer-countdown">01:02:03</span>')));
  const bareDoc = (() => { try { return tf.bare({ lang: 'ur', rtl: true }, PARTS); } catch (e) { return 'THREW ' + e.message; } })();
  check('the bare fallback page: marker, noindex, the panel, right-to-left for ur, no time', /<html lang="ur" dir="rtl" data-pc-unavailable="1">/.test(bareDoc) && /noindex,follow/.test(bareDoc) && /id="pc-unavailable"/.test(bareDoc) && !/\d{1,2}:\d{2}/.test(bareDoc), String(bareDoc).slice(0, 100));
  // The client: every entry point that could resolve, compute, store or ask for a place starts with the gate. (What the
  //   browser then really does is measured in headless Chrome: timesprayers-shed-qa/prayer-coord-3/unavail-probe.mjs.)
  const fnHead = (src, name) => { const i = src.indexOf('function ' + name + '('); return i < 0 ? '' : src.slice(i, i + 900); };
  const gated = (name) => /_pcUnavailable\(\)/.test(fnHead(APP, name));
  const GATES = ['initApp', 'initFromURL', 'onLanguageChange', 'detectLocation', 'loadCityData', '_saveLastCityContextNow', '_hydrateCurrentCityFromUrlOrStorage', '_initialSyncHydrate', '_wireGlobalCityCtxOnNav'];
  check(`client gate _pcUnavailable() at the top of ${GATES.length} entry points (${GATES.join(', ')})`, GATES.every(gated), GATES.filter((g) => !gated(g)).join(', '));
  check('client gate reads the server marker <html data-pc-unavailable="1">', /getAttribute\('data-pc-unavailable'\) === '1'/.test(fnHead(APP, '_pcUnavailable')));

  console.log('\n── (5c) Google tags: unavailable pages carry what the 404 / 410 pages carry (none); resolved pages are unchanged ──');
  //   G = the Google pieces of a page: AdSense loader, GA loader, consent-default snippet, any gtag / dataLayer, AdSense account meta.
  const G = (b) => ({ adsense: (b.match(/adsbygoogle/g) || []).length, gtm: (b.match(/googletagmanager\.com/g) || []).length, consent: (b.match(/gtag\('consent','default'/g) || []).length,
    dataLayer: (b.match(/dataLayer/g) || []).length, acct: (b.match(/google-adsense-account/g) || []).length, client: (b.match(/ca-pub-\d+/g) || []).length, gaId: (b.match(/G-TEST000000/g) || []).length });
  const none = (g) => Object.values(g).every((v) => v === 0);
  const g404 = G((await get('/en/this-page-does-not-exist', PORT + 3)).body), g410 = G((await get('/en/moon-today-in-boston', PORT + 3)).body);
  check('dummy-id server: the 404 and 410 pages carry no Google piece (the parity target)', none(g404) && none(g410), JSON.stringify(g404) + ' ' + JSON.stringify(g410));
  const gCity = G((await get('/en/prayer-times-in-boston', PORT + 3)).body);
  check('dummy-id server: a normal city page DOES carry them (so the check can see the tags): AdSense, GA, consent default, account meta', gCity.adsense >= 1 && gCity.gtm >= 1 && gCity.consent >= 1 && gCity.acct === 1 && gCity.gaId >= 1, JSON.stringify(gCity));
  { const bad = [];
    for (const tail of ['zzznotarealcity-12.3-45.6', 'boston-10.5-10.5', 'okara-40.26-71.01']) for (const L of LANGS) {
      const r = await get((L === 'ar' ? '' : '/' + L) + '/prayer-times-in-' + tail, PORT + 3), g = G(r.body);
      // id="sidebar": the full page, not the fail-closed bare page (which would also carry no tag)
      if (r.status !== 200 || !/data-pc-unavailable="1"/.test(r.body) || !/id="pc-unavailable"/.test(r.body) || !/id="sidebar"/.test(r.body) || !none(g)) bad.push(L + ' ' + tail + ' ' + r.status + ' ' + JSON.stringify(g));
    }
    check('unavailable pages, 3 kinds x 10 languages, dummy AdSense + GA ids: no adsbygoogle, googletagmanager, consent snippet, gtag / dataLayer, account meta (= the 404 / 410 set)', bad.length === 0, bad.slice(0, 3).join(' || ')); }
  // Resolved pages keep exactly the Google head they have today: same Google pieces as the home page (untouched by this
  //   ticket). Byte identity against the reference tree is measured separately (timesprayers-shed-qa/prayer-coord-3).
  const headG = (b) => { const h = b.slice(0, b.indexOf('</head>')); return (h.match(/<script[^>]*>[^<]*(?:gtag|dataLayer)[^<]*<\/script>|<script[^>]*(?:adsbygoogle|googletagmanager)[^>]*><\/script>|<meta name="google-adsense-account"[^>]*>/g) || []).map((x) => x.replace(/nonce="[^"]*"/g, 'nonce=""')).join('\n'); };
  const hHome = headG((await get('/en', PORT + 3)).body);
  for (const [lab, u] of [['resolved namesake coordinate page', '/en/prayer-times-in-boston-41.03-72.96'], ['identity coordinate page', '/en/prayer-times-in-boston-42.36--71.06'], ['normal city page', '/en/prayer-times-in-boston'], ['faro, Yukon', '/en/prayer-times-in-faro-62.23--133.33']]) {
    const h = headG((await get(u, PORT + 3)).body);
    check(lab + ': the same Google head pieces as the home page (consent default + GA + AdSense + account meta), unchanged', h === hHome && /adsbygoogle/.test(h) && /googletagmanager/.test(h) && /gtag\('consent','default'/.test(h) && /google-adsense-account/.test(h), h.length + ' vs ' + hHome.length);
  }

  console.log('\n── (6) asset version: the served page and the served js/app.js ──');
  const vm = /js\/app\.js\?v=(\d+)/.exec(bos.body);
  check('served HTML references js/app.js?v=863', !!vm && vm[1] === '863', vm && vm[1]);
  const js = await get('/js/app.js?v=863');
  check('served js/app.js?v=863: 200 and carries the client guard (coordTools / data-pc-unlinked)', js.status === 200 && js.body.includes('coordTools') && js.body.includes('data-pc-unlinked'), js.status + ' ' + js.body.length);
  check('served js/app.js?v=863 carries the unavailable-state gate (data-pc-unavailable), and the unavailable page itself loads that file', js.status === 200 && js.body.includes('data-pc-unavailable') && (/js\/app\.js\?v=(\d+)/.exec(unk.body) || [])[1] === '863', (/js\/app\.js\?v=(\d+)/.exec(unk.body) || [])[1]);

  console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
  code = fail === 0 ? 0 : 1;
} finally { killTree(srv); killTree(srvW); killTree(srvS); killTree(srvG); try { fs.unlinkSync(FAKE); } catch (_e) {} }
process.exit(code);
