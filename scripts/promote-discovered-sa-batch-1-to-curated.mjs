#!/usr/bin/env node
/* =============================================================================
 * scripts/promote-discovered-sa-batch-1-to-curated.mjs
 * DISCOVERED-CITY-TO-CURATED-PROMOTE-BATCH-1
 *
 * Promotes the FIRST reviewed batch of Saudi discovered cities (2 places, both
 * classified READY_FOR_REVIEW by scripts/review-discovered-cities.mjs) into the
 * durable curated dataset db/places/curated-places.json.
 *
 * Data source: reports/pending-discovered-cities.json (the live Supabase review run,
 * meta.source = "supabase"). Each entry below is the VALIDATED record from that report:
 *   - uray-irah  (عريعرة): READY_FOR_REVIEW, dedup all-null, ar native (quality=curated),
 *                lat/lng from the discovered (nominatim) record.
 *   - al-ajfar   (الأجفر): READY_FOR_REVIEW, dedup all-null, ar native (quality=official).
 *
 * names.en cleanup (uray-irah ONLY): the discovered record carried en="`Uray`irah" with
 * literal BACKTICKS (a nominatim artifact). Per the ticket decision it is set to the clean
 * typographic form "Uray‘irah" (U+2018). NOT a translation — only de-pollution of an existing
 * Latin name. al-ajfar en ("Al Ajfar") is already clean and unchanged.
 *
 * type: preserved from the discovered record (village / town) — curated already contains
 * 1009 town + 25 village entries, so this matches the existing convention (not normalized).
 *
 * Scope: ONLY appends these 2 entries. Does NOT touch db/cities-*.json, Supabase, site-search,
 * the search pipeline, the noindex guard, or any other city. NO runtime translation / fillchain
 * (fr/de were fillchain==en in the source, so only ar+en are carried). Idempotent. Writes
 * canonical 2-space JSON + trailing \n. Mirrors the proven add-*-to-curated.mjs invariants.
 * ============================================================================= */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CURATED = path.join(__dirname, '..', 'db', 'places', 'curated-places.json');

// --- the validated batch (from reports/pending-discovered-cities.json) ---
const NEW_CITIES = [
    {
        slug: 'uray-irah', type: 'village', countryCode: 'sa',
        lat: 25.977396, lng: 48.8687799, timezone: 'Asia/Riyadh',
        names: { ar: 'عريعرة', en: 'Uray‘irah' },   // en de-backticked → typographic ‘ (U+2018) per ticket
        aliases: {},
        admin: { countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia' },
        priority: 30, source: 'curated', verified: true
    },
    {
        slug: 'al-ajfar', type: 'town', countryCode: 'sa',
        lat: 27.4725, lng: 42.998889, timezone: 'Asia/Riyadh',
        names: { ar: 'الأجفر', en: 'Al Ajfar' },
        aliases: {},
        admin: { countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia' },
        priority: 30, source: 'curated', verified: true
    }
];

// --- mirror of server.js _isPrayerTimesReady (+ stricter ar/en minimum) ---
function isReady(p) {
    if (!p || typeof p !== 'object') return false;
    if (typeof p.slug !== 'string' || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(p.slug)) return false;
    if (typeof p.countryCode !== 'string' || !/^[a-z]{2}$/.test(p.countryCode)) return false;
    const lat = Number(p.lat), lng = Number(p.lng);
    if (!isFinite(lat) || lat < -90 || lat > 90) return false;
    if (!isFinite(lng) || lng < -180 || lng > 180) return false;
    if (typeof p.timezone !== 'string' || !p.timezone) return false;
    if (!p.names || typeof p.names !== 'object') return false;
    if (!p.names.ar || !p.names.en) return false;
    return true;
}
// ar must be Arabic script, en must be Latin (no backticks / no script pollution)
function namesTrustworthy(p) {
    const ar = String(p.names.ar || ''), en = String(p.names.en || '');
    if (!/[؀-ۿ]/.test(ar) || /[A-Za-z`]/.test(ar)) return false;
    if (!/[A-Za-z]/.test(en) || /[؀-ۿ`]/.test(en)) return false;   // reject backtick in en
    return true;
}
function namesAndAliases(p) {
    const out = [];
    if (p.names) for (const v of Object.values(p.names)) if (v) out.push(String(v).trim().toLowerCase());
    if (p.aliases) for (const arr of Object.values(p.aliases)) if (Array.isArray(arr)) for (const v of arr) if (v) out.push(String(v).trim().toLowerCase());
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
        if (!namesTrustworthy(city)) { console.error(`REJECT ${slug}: names not trustworthy (script/backtick check)`); process.exitCode = 1; continue; }
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
        console.log(`ADD  ${slug} (${cc}/${city.type}) lat=${city.lat} lng=${city.lng} names=${JSON.stringify(city.names)}`);
    }

    if (!added.length) { console.log('No new cities added.'); return; }

    const bak = CURATED + '.preSaBatch1.bak';
    if (!fs.existsSync(bak)) fs.writeFileSync(bak, raw, 'utf8');
    fs.writeFileSync(CURATED, JSON.stringify(arr, null, 2) + '\n', 'utf8');
    const saCount = arr.filter(p => (p.countryCode || '').toLowerCase() === 'sa').length;
    console.log(`\nDONE: ${before} → ${arr.length} (+${added.length}: ${added.join(', ')}) | SA cities now: ${saCount}`);
}

main();
