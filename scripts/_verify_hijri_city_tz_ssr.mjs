// HIJRI-DATE-CITY-TIMEZONE-FIX-1 — SSR-vs-client verification (read-only).
//
// Proves, against a LIVE locally-booted server (PORT 8131 by default):
//   (A) For each curated test city, the SSR-rendered #banner-hijri-date equals
//       the value the CLIENT will compute via HijriDate.getTodayInTimezone(iana)
//       — i.e. SSR == client, both in the CITY's own timezone (no flash).
//   (B) The fix DIRECTION at the exact bug boundary (2026-06-15T21:30Z, just
//       after Mecca crosses into 1 Muharram 1448): Seattle stays 29 ذو الحجة 1447
//       while Mecca shows 1 محرم 1448 — the precise scenario the user reported.
//   (C) A GLOBAL page (/today-hijri-date) still shows the Mecca/Umm-al-Qura date
//       (unchanged — out of scope of this ticket).
//
// Uses the project's OWN Umm al-Qura table + js/hijri-date.js (same code the
// browser runs), so the "expected client" column is computed by the real client
// function, not a re-implementation.
import { createRequire } from 'node:module';
import http from 'node:http';
const require = createRequire(import.meta.url);
globalThis._HIJRI_UMM_AL_QURA = require('../db/hijri/umm-al-qura.json');
const HijriDate = require('../js/hijri-date.js');

const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT || 8131);
const AR_MONTHS = HijriDate.hijriMonths; // 0-indexed; [0]=محرم
const monthIdxFromAr = (name) => AR_MONTHS.indexOf(name) + 1; // → 1..12, 0 if not found

const CITIES = [
  { slug: 'seattle',      iana: 'America/Los_Angeles', label: 'Seattle' },
  { slug: 'honolulu',     iana: 'Pacific/Honolulu',    label: 'Honolulu' },
  { slug: 'new-york',     iana: 'America/New_York',    label: 'New York' },
  { slug: 'makkah',       iana: 'Asia/Riyadh',         label: 'Makkah' },
  { slug: 'kuala-lumpur', iana: 'Asia/Kuala_Lumpur',   label: 'Kuala Lumpur' },
  { slug: 'tokyo',        iana: 'Asia/Tokyo',          label: 'Tokyo' },
  { slug: 'auckland',     iana: 'Pacific/Auckland',    label: 'Auckland' },
  { slug: 'london',       iana: 'Europe/London',       label: 'London' },
  { slug: 'rabat',        iana: 'Africa/Casablanca',   label: 'Rabat' },
];
const MECCA = 'Asia/Riyadh';

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host: HOST, port: PORT, path, headers: { 'Accept-Language': 'ar' } }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('timeout ' + path)));
  });
}
async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try { await get('/'); return true; } catch (_e) { await new Promise(r => setTimeout(r, 500)); }
  }
  throw new Error('server did not come up on ' + PORT);
}

// Hijri in a given IANA zone at the current real instant, via the SAME client fn.
function clientHijri(iana) { return HijriDate.getTodayInTimezone(iana); }
// Hijri in a zone at an ARBITRARY instant (for the frozen boundary proof).
function hijriAt(instant, iana) {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: iana, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(instant).split('-').map(Number);
  return HijriDate.toHijri(y, m, d);
}
const fmt = (h) => h ? `${h.day} ${AR_MONTHS[h.month - 1]} ${h.year}` : '(out of range)';
const sameHijri = (a, b) => a && b && a.year === b.year && a.month === b.month && a.day === b.day;

// Extract the SSR-rendered Hijri text from #banner-hijri-date and parse it.
function parseBannerHijri(html) {
  const m = html.match(/id="banner-hijri-date"[^>]*>([^<]*)</);
  if (!m) return { raw: null, parsed: null };
  const raw = m[1].trim();
  // AR format: "29 ذو الحجة 1447 هـ"
  const pm = raw.match(/^(\d+)\s+(.+?)\s+(\d+)\s+هـ$/);
  if (!pm) return { raw, parsed: null };
  const day = Number(pm[1]);
  const month = monthIdxFromAr(pm[2].trim());
  const year = Number(pm[3]);
  return { raw, parsed: (month ? { day, month, year } : null) };
}

let FAIL = 0;
const ok = (c, msg) => { console.log((c ? '  ✓ ' : '  ✗ ') + msg); if (!c) FAIL++; };

(async () => {
  await waitForServer();
  const nowIso = new Date().toISOString();
  console.log('LIVE instant (UTC):', nowIso);
  const meccaNow = clientHijri(MECCA);
  console.log('Mecca/Umm-al-Qura "today" (what the OLD code showed on EVERY city page):', fmt(meccaNow), '\n');

  // ── (A) Per-city: SSR == client, both city-local ─────────────────────────
  console.log('════ (A) SSR  vs  client (getTodayInTimezone)  per city — /prayer-times-in-{slug} ════');
  console.log(['city', 'cityLocalGreg', 'EXPECTED client', 'SSR banner', 'vs Mecca', 'SSR==client?'].map(s => s.padEnd(20)).join(''));
  let divergeProvenLive = false;
  for (const c of CITIES) {
    const { status, body } = await get('/prayer-times-in-' + c.slug);
    const expected = clientHijri(c.iana);
    const { raw, parsed } = parseBannerHijri(body);
    const greg = new Intl.DateTimeFormat('en-CA', { timeZone: c.iana, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const vsMecca = sameHijri(expected, meccaNow) ? 'same' : 'DIFFERS';
    if (vsMecca === 'DIFFERS') divergeProvenLive = true;
    const match = parsed && sameHijri(parsed, expected);
    console.log(
      c.label.padEnd(20), greg.padEnd(20), fmt(expected).padEnd(20),
      (parsed ? fmt(parsed) : ('UNPARSED:' + raw)).padEnd(20),
      vsMecca.padEnd(20), (match ? 'YES' : 'NO').padEnd(20)
    );
    ok(status === 200, `${c.label}: HTTP 200`);
    ok(parsed != null, `${c.label}: SSR banner Hijri present & parseable ("${raw}")`);
    ok(match, `${c.label}: SSR banner == client getTodayInTimezone (${fmt(expected)})`);
  }
  console.log(divergeProvenLive
    ? '\n  ⓘ At least one city diverges from Mecca RIGHT NOW — the bug scenario is live and the fix is exercised.'
    : '\n  ⓘ No city diverges from Mecca at this instant (all on the same Hijri day); see (B) for the deterministic boundary proof.');

  // ── (B) Frozen boundary proof — the exact reported scenario ───────────────
  console.log('\n════ (B) Frozen boundary 2026-06-15T21:30:00Z (just after Mecca midnight → 1 Muharram 1448) ════');
  const inst = new Date('2026-06-15T21:30:00Z');
  const seaB = hijriAt(inst, 'America/Los_Angeles');
  const honB = hijriAt(inst, 'Pacific/Honolulu');
  const nycB = hijriAt(inst, 'America/New_York');
  const mecB = hijriAt(inst, MECCA);
  console.log('  Mecca   :', fmt(mecB), '(OLD code showed THIS on Seattle page — the bug)');
  console.log('  Seattle :', fmt(seaB), '(NEW code shows THIS — city-local)');
  console.log('  Honolulu:', fmt(honB));
  console.log('  New York:', fmt(nycB));
  ok(mecB && mecB.day === 1 && mecB.month === 1 && mecB.year === 1448, 'Mecca at boundary = 1 محرم 1448');
  ok(seaB && seaB.day === 29 && seaB.month === 12 && seaB.year === 1447, 'Seattle at boundary = 29 ذو الحجة 1447 (NOT Mecca\'s 1 Muharram)');
  ok(!sameHijri(seaB, mecB), 'Seattle ≠ Mecca at boundary (divergence handled)');

  // ── (C) Global page unchanged (Mecca) ────────────────────────────────────
  console.log('\n════ (C) Global page /today-hijri-date still shows Mecca/Umm-al-Qura (out of scope, unchanged) ════');
  const g = await get('/today-hijri-date');
  ok(g.status === 200, '/today-hijri-date: HTTP 200');
  // The global page renders the Mecca Hijri day/month/year somewhere in SSR text.
  const meccaDayStr = String(meccaNow.day);
  const meccaMonStr = AR_MONTHS[meccaNow.month - 1];
  const meccaYrStr = String(meccaNow.year);
  const hasMecca = g.body.includes(meccaMonStr) && g.body.includes(meccaYrStr) && new RegExp('\\b' + meccaDayStr + '\\b').test(g.body);
  ok(hasMecca, `/today-hijri-date SSR contains Mecca date tokens (${fmt(meccaNow)})`);

  console.log('\n──────────────────────────────────────────');
  console.log(FAIL === 0 ? '✅ ALL CHECKS PASSED' : `❌ ${FAIL} CHECK(S) FAILED`);
  process.exit(FAIL === 0 ? 0 : 1);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
