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
// Run: node scripts/_smoke_prayer_coord_link_consistency_1.mjs        (PORT env overrides the default 8231)
import http from 'node:http';
import { spawn } from 'node:child_process';
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

function get(p) { return new Promise((r) => { http.get({ host: '127.0.0.1', port: PORT, path: p, headers: { 'accept-encoding': 'identity' } }, (x) => { let b = ''; x.setEncoding('utf8'); x.on('data', (c) => b += c); x.on('end', () => r({ status: x.statusCode, body: b })); }).on('error', () => r({ status: 0, body: '' })); }); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function ready(t) { const t0 = Date.now(); while (Date.now() - t0 < t) { const r = await get('/health'); if (r.status === 200) return 1; await sleep(400); } return 0; }
let pass = 0, fail = 0; const check = (l, ok, x) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${l}${x !== undefined ? '   →  ' + x : ''}`); };
const one = (b, re) => { const m = re.exec(b); return m ? m[1] : ''; };
const K = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const ssrTimes = (b) => Object.fromEntries(K.map((k) => [k, one(b, new RegExp('id="time-' + k + '">([^<]*)<'))]));
const pci = (b, lab) => one(b, new RegExp('<span class="pci-label">' + lab + '<\\/span><span class="pci-value">([^<]*)<'));
const seedOf = (b) => { const s = one(b, /window\.__PRAYER_CITY__=(\{[\s\S]*?\});<\/script>/); try { return s ? JSON.parse(s) : null; } catch (_e) { return null; } };
const bcCountry = (b) => one(b, /id="bc-country-name">([^<]*)</);
function offsetHours(z, d) { const v = (new Intl.DateTimeFormat('en-US', { timeZone: z, timeZoneName: 'longOffset' }).formatToParts(d).find((p) => p.type === 'timeZoneName') || {}).value || 'GMT'; const m = /GMT([+-])(\d{2}):(\d{2})/.exec(v); return m ? (m[1] === '-' ? -1 : 1) * (+m[2] + +m[3] / 60) : 0; }
function utcLabel(h) { const s = h < 0 ? '−' : '+'; const a = Math.abs(h); return 'UTC' + s + (Number.isInteger(a) ? a : a.toFixed(2).replace(/0$/, '')); }
function expectTimes(lat, lng, zone, method) {
  const now = new Date(); const off = offsetHours(zone, now);
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
];

const srv = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT), SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', ADSENSE_CLIENT: 'off', WEB_CONCURRENCY: '1' }, stdio: ['ignore', 'ignore', 'ignore'] });
let code = 1;
try {
  if (!await ready(30000)) { console.error('server not ready'); process.exit(1); }
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
  check('far point boston-10.5-10.5: not guessed — previous content (identity times), no seed', far.status === 200 && K.every((k) => farT[k] === bareT[k]) && !seedOf(far.body), `${far.status} seed=${!!seedOf(far.body)}`);
  const inv = await get('/en/prayer-times-in-boston-95.5-200.5');
  check('invalid point boston-95.5-200.5: no crash, previous content, no seed', inv.status === 200 && K.every((k) => ssrTimes(inv.body)[k] === bareT[k]) && !seedOf(inv.body), inv.status);
  const intN = await get('/en/prayer-times-in-boston-41-73');
  check('integer namesake point boston-41-73 (also matches the bare-route shape): seed agrees with the SSR (kg, Kyrgyzstan)', (seedOf(intN.body) || {}).countryCode === 'kg' && bcCountry(intN.body) === 'Kyrgyzstan' && pci(intN.body, 'Calculation Method') === METHOD_LABEL.MWL, `${(seedOf(intN.body) || {}).countryCode} / ${bcCountry(intN.body)}`);
  const intF = await get('/en/prayer-times-in-boston-10-10');
  check('integer far point boston-10-10: previous behaviour (identity times + identity seed)', K.every((k) => ssrTimes(intF.body)[k] === bareT[k]) && (seedOf(intF.body) || {}).countryCode === 'us');
  const ar = await get('/prayer-times-in-boston-41.03-72.96');
  const en = await get('/en/prayer-times-in-boston-41.03-72.96');
  check('ar namesake link: same times as en (language-independent)', K.every((k) => ssrTimes(ar.body)[k] === ssrTimes(en.body)[k]), JSON.stringify(ssrTimes(ar.body)));
  check('ar namesake link: seed cc kg', (seedOf(ar.body) || {}).countryCode === 'kg');

  console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
  code = fail === 0 ? 0 : 1;
} finally { srv.kill('SIGKILL'); }
process.exit(code);
