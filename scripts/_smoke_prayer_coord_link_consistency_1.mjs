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
// Unchanged behaviour is asserted too: identity-point links, far points, invalid points, bare city routes, robots,
// canonical and status.
//
// Run: node scripts/_smoke_prayer_coord_link_consistency_1.mjs        (PORT env overrides the default 8231; PORT+1 and PORT+2 run the winter / summer clocks)
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
// The server forks a worker: kill the whole tree (a plain kill of the primary can leave the worker listening on Windows).
const killTree = (p) => { try { if (process.platform === 'win32') execSync('taskkill /PID ' + p.pid + ' /T /F', { stdio: 'ignore' }); else p.kill('SIGKILL'); } catch (_e) { try { p.kill('SIGKILL'); } catch (_) {} } };
let code = 1;
try {
  if (!await ready(60000) || !await ready(60000, PORT + 1) || !await ready(60000, PORT + 2)) { console.error('server not ready'); process.exit(1); }
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
  const far = await get('/en/prayer-times-in-boston-10.5-10.5'); const farT = ssrTimes(far.body);
  // Owner decision 4 (2026-11-09): an unresolved point is never presented as resolved -- the page keeps the identity's
  //   content, is seeded with that identity (ONE place before and after JavaScript) and says so in a note.
  check('far point boston-10.5-10.5: not guessed — identity times, identity seed (us), note naming Boston, United States', far.status === 200 && K.every((k) => farT[k] === bareT[k]) && (seedOf(far.body) || {}).countryCode === 'us' && !(seedOf(far.body) || {}).coordTools && /do not match Boston .*Boston, United States/.test(note(far.body)), `${far.status} seed=${(seedOf(far.body) || {}).countryCode} note=${note(far.body).slice(0, 60)}`);
  const inv = await get('/en/prayer-times-in-boston-95.5-200.5');
  check('invalid point boston-95.5-200.5: no crash, identity content + identity seed + note', inv.status === 200 && K.every((k) => ssrTimes(inv.body)[k] === bareT[k]) && (seedOf(inv.body) || {}).countryCode === 'us' && !!note(inv.body), inv.status);
  const intN = await get('/en/prayer-times-in-boston-41-73');
  check('integer namesake point boston-41-73 (also matches the bare-route shape): seed agrees with the SSR (kg, Kyrgyzstan)', (seedOf(intN.body) || {}).countryCode === 'kg' && bcCountry(intN.body) === 'Kyrgyzstan' && pci(intN.body, 'Calculation Method') === METHOD_LABEL.MWL, `${(seedOf(intN.body) || {}).countryCode} / ${bcCountry(intN.body)}`);
  const intF = await get('/en/prayer-times-in-boston-10-10');
  check('integer far point boston-10-10: identity times + identity seed (as before) + note', K.every((k) => ssrTimes(intF.body)[k] === bareT[k]) && (seedOf(intF.body) || {}).countryCode === 'us' && !!note(intF.body));
  check('bare boston + identity point: no note', !note(bare.body) && !note(idp.body));
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
  const syd = await get('/en/prayer-times-in-sydney-46.14--60.18');
  check('sydney-46.14--60.18 (Sydney, Nova Scotia: tz-lookup America/Halifax, gate fallback America/Toronto): zone-unverified — identity content + note, no namesake seed', !(seedOf(syd.body) || {}).coordTools && /time zone we cannot verify/.test(note(syd.body)), note(syd.body).slice(0, 80));
  const okr = await get('/en/prayer-times-in-okara-40.26-71.01');
  check('okara-40.26-71.01 (record filed under Kyrgyzstan, point on the Uzbek border: tz-lookup Asia/Tashkent, unstable): zone-unverified — identity Okara (Pakistan) + note', (seedOf(okr.body) || {}).countryCode === 'pk' && !(seedOf(okr.body) || {}).coordTools && /time zone we cannot verify/.test(note(okr.body)), note(okr.body).slice(0, 80));

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

  console.log('\n── (5) unresolved coordinate links: honest state, never another city\'s times as the point\'s ──');
  const unk = await get('/en/prayer-times-in-zzznotarealcity-12.3-45.6');
  check('unknown word with coordinates: no Makkah default times in the HTML ("--:--"), no seed, note "could not identify"', unk.status === 200 && K.every((k) => ssrTimes(unk.body)[k] === '--:--') && !seedOf(unk.body) && /could not identify/.test(note(unk.body)), JSON.stringify(ssrTimes(unk.body)));
  const unkBare = await get('/en/prayer-times-in-zzznotarealcity');
  check('unknown word WITHOUT coordinates: not a coordinate link — unchanged, no note', !note(unkBare.body));
  const arFar = await get('/prayer-times-in-boston-10.5-10.5');
  check('Arabic far point: Arabic note naming بوسطن، الولايات المتحدة', /بوسطن، الولايات المتحدة/.test(note(arFar.body)), note(arFar.body).slice(0, 80));
  // The three notes in all 10 languages (the texts live in server.js _PRAYER_COORD_NOTE_L10N and wait for the owner's
  //   language review): every language renders its own text, shows the URL coordinates, and leaves no placeholder.
  const NOTE_LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
  for (const [kind, p0, la, lo] of [['known word, far point', '/prayer-times-in-boston-10.5-10.5', '10.5', '10.5'], ['zone not verified', '/prayer-times-in-sydney-46.14--60.18', '46.14', '-60.18'], ['unknown word', '/prayer-times-in-zzznotarealcity-12.3-45.6', '12.3', '45.6']]) {
    const bad = [], seen = new Set();
    for (const L of NOTE_LANGS) {
      const r = await get((L === 'ar' ? '' : '/' + L) + p0), n = note(r.body);
      const coords = '(' + la + ((L === 'ar' || L === 'ur') ? '، ' : ', ') + lo + ')';
      if (r.status !== 200 || !n || /[{}]/.test(n) || !n.includes(coords) || seen.has(n)) bad.push(L + ': ' + (n || '(no note)').slice(0, 50));
      seen.add(n);
    }
    check('note (' + kind + '): rendered in all 10 languages, each its own text, URL coordinates shown, no unfilled placeholder', bad.length === 0, bad.join(' | '));
  }
  check('namesake pages carry no note', !note(bos.body));
  const hk = await get('/en/prayer-times-in-hong-kong-22.28-114.16');
  check('ambiguous point that is also within 25 km of the identity (hong-kong: curated hk + db cn record): identity content + seed, no note', !note(hk.body) && (seedOf(hk.body) || {}).countryCode === 'hk' && !(seedOf(hk.body) || {}).coordTools, `${(seedOf(hk.body) || {}).countryCode} note=${note(hk.body).slice(0, 40)}`);

  console.log('\n── (6) asset version: the served page and the served js/app.js ──');
  const vm = /js\/app\.js\?v=(\d+)/.exec(bos.body);
  check('served HTML references js/app.js?v=863', !!vm && vm[1] === '863', vm && vm[1]);
  const js = await get('/js/app.js?v=863');
  check('served js/app.js?v=863: 200 and carries the client guard (coordTools / data-pc-unlinked)', js.status === 200 && js.body.includes('coordTools') && js.body.includes('data-pc-unlinked'), js.status + ' ' + js.body.length);

  console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
  code = fail === 0 ? 0 : 1;
} finally { killTree(srv); killTree(srvW); killTree(srvS); try { fs.unlinkSync(FAKE); } catch (_e) {} }
process.exit(code);
