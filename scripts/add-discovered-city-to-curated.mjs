#!/usr/bin/env node
/* =============================================================================
 * scripts/add-discovered-city-to-curated.mjs
 * COUNTRY-PRAYER-PAGE-CITY-SEARCH-AUTO-ADD-TO-CURATED-FIX-1
 *
 * Promotes validated, same-country DISCOVERED cities into db/places/curated-places.json
 * — the durable, reviewed path (Render's filesystem is ephemeral, so a runtime write
 * would NOT survive redeploy; and an unprotected public add-endpoint is a security risk).
 * Data is hand-validated from /api/search-place production results. Run locally, review
 * the diff, then commit + push (the redeploy bakes the new curated data into the image).
 *
 * Strict invariants:
 *   • Each entry must pass _isPrayerTimesReady (slug/cc/lat/lng/timezone/names).
 *   • Dedup: slug must be new, no near-duplicate (<0.15°) in the same country, no
 *     name/alias collision in the same country. Idempotent (skips already-present slugs).
 *   • NEVER touches db/cities-*.json. NO runtime translation, NO generated slug
 *     (slug comes from the endpoint result). Writes canonical 2-space JSON + trailing \n.
 * ============================================================================= */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CURATED = path.join(__dirname, '..', 'db', 'places', 'curated-places.json');

// --- cities to add (hand-validated from production /api/search-place) ---
const NEW_CITIES = [
    {
        slug: 'huraymila', type: 'city', countryCode: 'sa',
        lat: 25.126667, lng: 46.1225, timezone: 'Asia/Riyadh',
        names: { ar: 'حريملاء', en: 'Huraymila' },        // ar+en (Saudi local lang = ar)
        aliases: {},
        admin: { countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', region: 'Riyadh Province' },
        priority: 45, source: 'curated', verified: true
    },
    {
        slug: 'essaouira', type: 'city', countryCode: 'ma',
        lat: 31.5118281, lng: -9.7620903, timezone: 'Africa/Casablanca',
        names: { ar: 'الصويرة', en: 'Essaouira', fr: 'Essaouira' },  // ar+en+fr (Morocco local langs)
        aliases: {},
        admin: { countryAr: 'المغرب', countryEn: 'Morocco', region: 'Marrakesh-Safi' },
        priority: 70, source: 'curated', verified: true
    }
];

// --- mirror of server.js _isPrayerTimesReady ---
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
        // idempotent
        if (bySlug.has(slug)) { console.log(`SKIP ${slug}: already in curated`); continue; }
        // readiness
        if (!isReady(city)) { console.error(`REJECT ${slug}: fails isReady`); process.exitCode = 1; continue; }
        // countryCode shape
        const cc = city.countryCode.toLowerCase();
        // near-duplicate (same cc, <0.15° lat & lng)
        const near = arr.find(p => (p.countryCode || '').toLowerCase() === cc &&
            Math.abs(Number(p.lat) - city.lat) < 0.15 && Math.abs(Number(p.lng) - city.lng) < 0.15);
        if (near) { console.error(`REJECT ${slug}: near-duplicate of ${near.slug}`); process.exitCode = 1; continue; }
        // name/alias collision (same cc)
        const newNames = namesAndAliases(city);
        const clash = arr.find(p => (p.countryCode || '').toLowerCase() === cc &&
            namesAndAliases(p).some(n => newNames.includes(n)));
        if (clash) { console.error(`REJECT ${slug}: name collision with ${clash.slug}`); process.exitCode = 1; continue; }
        // accept
        arr.push(city);
        bySlug.add(slug);
        added.push(slug);
        console.log(`ADD  ${slug} (${cc}) lat=${city.lat} lng=${city.lng} tz=${city.timezone} names=${JSON.stringify(city.names)}`);
    }

    if (!added.length) { console.log('No new cities added.'); return; }

    // backup once
    const bak = CURATED + '.preCitySearchAutoAdd.bak';
    if (!fs.existsSync(bak)) fs.writeFileSync(bak, raw, 'utf8');
    // write canonical 2-space + trailing newline (matches existing file format → clean diff)
    fs.writeFileSync(CURATED, JSON.stringify(arr, null, 2) + '\n', 'utf8');
    console.log(`\nDONE: ${before} → ${arr.length} (+${added.length}: ${added.join(', ')})`);
}

main();
