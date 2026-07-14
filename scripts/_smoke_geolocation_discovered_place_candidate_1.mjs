// Smoke — GEOLOCATION-DISCOVERED-PLACE-SELECTION-ADMIN-REVIEW-FLOW-1
// Loads the ACTUAL _isCuratedSlugClient + _recordGeoDiscoveredPlaceCandidate helpers
// straight out of js/app.js into a vm sandbox (faithful — not a re-implementation) and
// asserts the decision logic: privacy centroid (not raw coords), curated-skip, skip-safe
// gates, settlement-type gating, keepalive, source=geolocation, and never-throws.
import fs from 'fs';
import vm from 'vm';

const APP = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const START = 'let _CURATED_SLUG_SET_CLIENT = null;';
const END = 'function _popularCitiesList(';
const si = APP.indexOf(START), ei = APP.indexOf(END);
if (si < 0 || ei < 0 || ei <= si) { console.error('FATAL: could not extract helper block from app.js'); process.exit(1); }
const HELPER = APP.slice(si, ei);

let pass = 0, fail = 0;
const A = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };

// Build a fresh sandbox per case (resets _geoDiscoverLastKey + curated-set memo).
function build(opts = {}) {
  const calls = { place: [], rev: [] };
  const sb = {
    console, Promise, Set, JSON, Math, Intl, isFinite, parseFloat, String, Object, Array, RegExp, setTimeout,
    LOCAL_CITIES: opts.LOCAL_CITIES || [{ en: 'Riyadh', cc: 'sa', slug: 'riyadh' }, { en: 'Mecca', cc: 'sa', slug: 'makkah' }],
    getCurrentLang: () => opts.lang || 'en',
    _coordKey: (p, la, lo, l) => p + '_' + la + '_' + lo + (l ? '_' + l : ''),
    nomUrl: (u) => u,
    _cached: (_key, fn) => fn(),                       // no cache in test → always invoke fetcher
    makeSlug: (name, lat, lng) => {
      const latin = String(name || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s]+/g, ' ').trim().replace(/\s+/g, '-');
      if (latin.length >= 2) return latin;
      const la = Math.abs(lat).toFixed(1) + (lat >= 0 ? 'n' : 's');
      const lo = Math.abs(lng).toFixed(1) + (lng >= 0 ? 'e' : 'w');
      return 'loc-' + la + '-' + lo;
    },
    buildPrayerTimesSlug: (c) => c.slug || String(c.en || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    _isWardLike: (name) => /[-\s](ku|gu)$|区|구|\b(Ward|Bezirk|Arrondissement|Distrito|Kecamatan|Daerah)\b/i.test(String(name || '')),
    _isAdminOrStreetLike: (name) => /\b(Governorate|Province|Region|District|County|Prefecture|State|Emirate|Municipality|Township)\b/i.test(String(name || '')),
    fetch: (url, init) => {
      if (typeof url === 'string' && url.indexOf('/api/place-selected') !== -1) {
        let body = null; try { body = JSON.parse(init.body); } catch (_) {}
        calls.place.push({ method: init.method, keepalive: !!(init && init.keepalive), body });
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, persisted: true }) });
      }
      calls.rev.push(url);
      const m = /accept-language=([a-z-]+)/.exec(url);
      const lang = m ? m[1] : 'en';
      const resp = (opts.rev && opts.rev[lang] !== undefined) ? opts.rev[lang] : (opts.rev ? opts.rev.en : null);
      return Promise.resolve({ ok: true, json: () => Promise.resolve(resp) });
    },
  };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(HELPER, sb);
  return { sb, calls };
}

const tick = () => new Promise((r) => setTimeout(r, 5));

// Reusable reverse-geocode fixtures
const enTown = { address: { city: 'Schenefeld', country: 'Germany', country_code: 'de' }, namedetails: { 'name:en': 'Schenefeld' }, addresstype: 'town', name: 'Schenefeld', lat: '53.6000', lon: '9.8280' };
const arTown = { address: { city: 'شينيفيلد', country: 'ألمانيا', country_code: 'de' }, namedetails: { 'name:ar': 'شينيفيلد' }, name: 'شينيفيلد' };

(async () => {
  // ── 1) VALID new town → POST fired, centroid (not raw coords), source=geolocation, keepalive ──
  {
    const { sb, calls } = build({ rev: { en: enTown, ar: arTown }, lang: 'en' });
    sb._recordGeoDiscoveredPlaceCandidate(53.6512, 9.8399);   // user's RAW coords
    await tick();
    A(calls.place.length === 1, '1: exactly one /api/place-selected POST');
    const p = calls.place[0] && calls.place[0].body || {};
    A(calls.place[0] && calls.place[0].method === 'POST', '1: method POST');
    A(calls.place[0] && calls.place[0].keepalive === true, '1: keepalive:true (survives nav)');
    A(p.slug === 'schenefeld', '1: slug from reverse-geocode name');
    A(p.type === 'town', '1: settlement type preserved');
    A(p.countryCode === 'de', '1: countryCode');
    A(p.source === 'geolocation', '1: source=geolocation');
    A(typeof p.timezone === 'string' && p.timezone.length > 0, '1: timezone non-empty (Intl IANA)');
    A(p.names && p.names.en === 'Schenefeld', '1: names.en');
    A(p.names && p.names.ar === 'شينيفيلد', '1: names.ar from ar reverse');
    // PRIVACY: centroid, NOT the user's raw coordinates
    A(p.lat === 53.6 && p.lng === 9.828, '1: PRIVACY lat/lng = feature centroid');
    A(p.lat !== 53.6512 && p.lng !== 9.8399, '1: PRIVACY raw user coords NOT sent');
    // no personal identifiers anywhere in the payload
    const keys = Object.keys(p);
    A(!keys.some((k) => /ip|useragent|user_agent|userid|user_id|identifier/i.test(k)), '1: no IP/UA/user-id keys');
  }

  // ── 2) CURATED city → NO discovered duplicate ──
  {
    const enR = { address: { city: 'Riyadh', country: 'Saudi Arabia', country_code: 'sa' }, namedetails: { 'name:en': 'Riyadh' }, addresstype: 'city', name: 'Riyadh', lat: '24.71', lon: '46.67' };
    const { sb, calls } = build({ rev: { en: enR, ar: enR }, lang: 'en' });
    sb._recordGeoDiscoveredPlaceCandidate(24.7136, 46.6753);
    await tick();
    A(calls.place.length === 0, '2: curated city → NO place-selected (no duplicate)');
  }

  // ── 3) skip-safe: no reliable name ──
  {
    const enR = { address: { country: 'Germany', country_code: 'de' }, namedetails: {} };
    const { sb, calls } = build({ rev: { en: enR, ar: enR } });
    sb._recordGeoDiscoveredPlaceCandidate(53.0, 9.0);
    await tick();
    A(calls.place.length === 0, '3: no name → skip safe');
  }

  // ── 4) skip-safe: no countryCode ──
  {
    const enR = { address: { city: 'Nowhere' }, namedetails: { 'name:en': 'Nowhere' }, addresstype: 'town', lat: '1', lon: '1' };
    const { sb, calls } = build({ rev: { en: enR, ar: enR } });
    sb._recordGeoDiscoveredPlaceCandidate(1, 1);
    await tick();
    A(calls.place.length === 0, '4: no countryCode → skip safe');
  }

  // ── 5) skip: ward-like place ──
  {
    const enR = { address: { city: 'Chiyoda-ku', country: 'Japan', country_code: 'jp' }, namedetails: { 'name:en': 'Chiyoda-ku' }, addresstype: 'city', lat: '35.6', lon: '139.7' };
    const { sb, calls } = build({ rev: { en: enR, ar: enR } });
    sb._recordGeoDiscoveredPlaceCandidate(35.69, 139.75);
    await tick();
    A(calls.place.length === 0, '5: ward-like → skip');
  }

  // ── 6) skip: admin/region-only name ──
  {
    const enR = { address: { city: 'Riyadh Province', country: 'Saudi Arabia', country_code: 'sa' }, namedetails: { 'name:en': 'Riyadh Province' }, addresstype: 'city', lat: '24', lon: '46' };
    const { sb, calls } = build({ rev: { en: enR, ar: enR } });
    sb._recordGeoDiscoveredPlaceCandidate(24.5, 46.5);
    await tick();
    A(calls.place.length === 0, '6: admin/region name → skip');
  }

  // ── 7) skip: non-latin name → makeSlug returns loc-* (no reliable slug) ──
  {
    const enR = { address: { city: 'الدرعية', country: 'Saudi Arabia', country_code: 'sa' }, namedetails: {}, name: 'الدرعية', addresstype: 'town', lat: '24.7', lon: '46.5' };
    const { sb, calls } = build({ rev: { en: enR, ar: enR } });
    sb._recordGeoDiscoveredPlaceCandidate(24.75, 46.58);
    await tick();
    A(calls.place.length === 0, '7: coord-only loc-* slug → skip');
  }

  // ── 8) skip: not a settlement (administrative/no city field) ──
  {
    const enR = { address: { country: 'Germany', country_code: 'de' }, namedetails: { 'name:en': 'Somewhere' }, addresstype: 'administrative', name: 'Somewhere', lat: '52', lon: '9' };
    const { sb, calls } = build({ rev: { en: enR, ar: enR } });
    sb._recordGeoDiscoveredPlaceCandidate(52.1, 9.1);
    await tick();
    A(calls.place.length === 0, '8: administrative (no settlement type) → skip');
  }

  // ── 9) failure/robustness: reverse-geocode returns null → no POST, no throw ──
  {
    let threw = false;
    try {
      const { sb, calls } = build({ rev: { en: null, ar: null } });
      sb._recordGeoDiscoveredPlaceCandidate(10, 10);
      await tick();
      A(calls.place.length === 0, '9: null reverse-geocode → no POST');
    } catch (_) { threw = true; }
    A(!threw, '9: never throws on reverse-geocode failure');
  }

  // ── 10) robustness: invalid coords → immediate no-op, no throw ──
  {
    let threw = false;
    try {
      const { sb, calls } = build({ rev: { en: enTown, ar: arTown } });
      sb._recordGeoDiscoveredPlaceCandidate('nope', undefined);
      await tick();
      A(calls.place.length === 0, '10: invalid coords → no POST');
      A(calls.rev.length === 0, '10: invalid coords → not even a reverse-geocode');
    } catch (_) { threw = true; }
    A(!threw, '10: never throws on invalid coords');
  }

  // ── 11) dedup guard: same coord cell twice → only one reverse-geocode round ──
  {
    const { sb, calls } = build({ rev: { en: enTown, ar: arTown } });
    sb._recordGeoDiscoveredPlaceCandidate(53.6512, 9.8399);
    sb._recordGeoDiscoveredPlaceCandidate(53.6512, 9.8399);   // identical cell
    await tick();
    A(calls.place.length === 1, '11: repeat same-cell call → single POST (dedup guard)');
  }

  // ── 12) UI-lang name captured for non-ar/en locale ──
  {
    const enR = { address: { city: 'Schenefeld', country: 'Germany', country_code: 'de' }, namedetails: { 'name:en': 'Schenefeld', 'name:de': 'Schenefeld', 'name:tr': 'Şenefeld' }, addresstype: 'town', name: 'Schenefeld', lat: '53.6', lon: '9.83' };
    const { sb, calls } = build({ rev: { en: enR, ar: arTown }, lang: 'tr' });
    sb._recordGeoDiscoveredPlaceCandidate(53.61, 9.84);
    await tick();
    const p = calls.place[0] && calls.place[0].body || {};
    A(calls.place.length === 1, '12: tr locale → POST fired');
    A(p.names && p.names.tr === 'Şenefeld', '12: UI-lang (tr) name captured from namedetails');
    A(p.nameQuality && p.nameQuality.tr === 'namedetails', '12: nameQuality keyed by UI lang');
  }

  console.log('\n================ GEO-DISCOVER SMOKE: ' + pass + ' passed, ' + fail + ' failed ================');
  process.exit(fail ? 1 : 0);
})();
