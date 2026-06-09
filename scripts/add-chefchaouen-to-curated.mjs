#!/usr/bin/env node
/* =============================================================================
 * scripts/add-chefchaouen-to-curated.mjs
 * COUNTRY-CITIES-MA-CURATED-EXPANSION-CHEFCHAOUEN-1
 *
 * Promotes the DISCOVERED city "Chefchaouen" (Morocco) into the durable curated
 * dataset db/places/curated-places.json, so /prayer-times-in-chefchaouen becomes a
 * real index,follow page (the noindex guard flips automatically once _findPlaceBySlug
 * returns the entry) and the city joins the Morocco listing + curated search tier.
 *
 * Coordinates: taken from the EXISTING production discovered record
 *   /api/search-place → slug=chefchaouen-ma, cc=ma, lat=35.1687748, lng=-5.2683454,
 *   names.ar=شفشاون  (OSM/Nominatim via Supabase). Cross-checked against GeoNames
 *   2552419 (35.1688, -5.26361) — same city, sub-km delta, negligible for prayer times.
 *
 * Scope: ONLY appends one entry to curated-places.json. Does NOT touch db/cities-*.json,
 * site-search, the search pipeline, the discovered noindex guard, country SEO content,
 * or any other city's slug/name. Idempotent. Writes canonical 2-space JSON + trailing \n.
 *
 * Mirrors server.js _isPrayerTimesReady + the auto-add invariants (dedup by slug,
 * near-duplicate <0.15° in same cc, name/alias collision in same cc).
 * ============================================================================= */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CURATED = path.join(__dirname, '..', 'db', 'places', 'curated-places.json');

// --- the single city to add (slug + names + tz per ticket; coords from discovered record) ---
const NEW_CITIES = [
    {
        slug: 'chefchaouen', type: 'city', countryCode: 'ma',
        lat: 35.1687748, lng: -5.2683454, timezone: 'Africa/Casablanca',
        names: { ar: 'شفشاون', en: 'Chefchaouen', fr: 'Chefchaouen' },  // ar+en+fr (Morocco local langs)
        aliases: {},
        admin: { countryAr: 'المغرب', countryEn: 'Morocco' },
        priority: 60, source: 'curated', verified: true
    }
];

// --- mirror of server.js _isPrayerTimesReady (+ stricter ar/en minimum, like auto-add) ---
function isReady(p) {
    if (!p || typeof p !== 'object') return false;
    if (typeof p.slug !== 'string' || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(p.slug)) return false;
    if (typeof p.countryCode !== 'string' || !/^[a-z]{2}$/.test(p.countryCode)) return false;
    const lat = Number(p.lat), lng = Number(p.lng);
    if (!isFinite(lat) || lat < -90 || lat > 90) return false;
    if (!isFinite(lng) || lng < -180 || lng > 180) return false;
    if (typeof p.timezone !== 'string' || !p.timezone) return false;
    if (!p.names || typeof p.names !== 'object') return false;
    if (!p.names.ar || !p.names.en) return false;   // data-policy minimum: ar + en
    return true;
}

function namesAndAliases(p) {
    const out = [];
    if (p.names) for (const v of Object.values(p.names)) if (v) out.push(String(v));
    if (p.aliases) for (const arrv of Object.values(p.aliases)) if (Array.isArray(arrv)) for (const v of arrv) if (v) out.push(String(v));
    return out;
}

function main() {
    const raw = fs.readFileSync(CURATED, 'utf8');
    const arr = JSON.parse(raw);
    const before = arr.length;
    const bySlug = new Set(arr.map(p => (p.slug || '').toLowerCase()));

    const added = [];
    for (const city of NEW_CITIES) {
        const slug = (city.slug || '').toLowerCase();
        if (bySlug.has(slug)) { console.log(`SKIP ${slug}: already in curated`); continue; }
        if (!isReady(city)) { console.error(`REJECT ${slug}: fails isReady`); process.exitCode = 1; continue; }
        const cc = city.countryCode.toLowerCase();
        const near = arr.find(p => (p.countryCode || '').toLowerCase() === cc &&
            Math.abs(Number(p.lat) - city.lat) < 0.15 && Math.abs(Number(p.lng) - city.lng) < 0.15);
        if (near) { console.error(`REJECT ${slug}: near-duplicate of ${near.slug}`); process.exitCode = 1; continue; }
        const newNames = namesAndAliases(city);
        const clash = arr.find(p => (p.countryCode || '').toLowerCase() === cc &&
            namesAndAliases(p).some(n => newNames.includes(n)));
        if (clash) { console.error(`REJECT ${slug}: name collision with ${clash.slug}`); process.exitCode = 1; continue; }
        arr.push(city);
        bySlug.add(slug);
        added.push(slug);
        console.log(`ADD  ${slug} (${cc}) lat=${city.lat} lng=${city.lng} tz=${city.timezone} names=${JSON.stringify(city.names)}`);
    }

    if (!added.length) { console.log('No new cities added.'); return; }

    const bak = CURATED + '.preChefchaouen.bak';
    if (!fs.existsSync(bak)) fs.writeFileSync(bak, raw, 'utf8');
    fs.writeFileSync(CURATED, JSON.stringify(arr, null, 2) + '\n', 'utf8');
    const maCount = arr.filter(p => (p.countryCode || '').toLowerCase() === 'ma').length;
    console.log(`\nDONE: ${before} → ${arr.length} (+${added.length}: ${added.join(', ')}) | MA cities now: ${maCount}`);
}

main();
