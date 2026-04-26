// Enrich LOCAL_CITIES in js/app.js with type, priority, countryEn fields.
// Idempotent — re-runs without duplicating fields.
//
// Priority schema:
//   100 — country capital OR religious/global anchor (Mecca, Medina, Jerusalem)
//    80 — major secondary city (top-2-3 of country, well-known internationally)
//    60 — default for any other LOCAL_CITIES entry
//
// Type: every current LOCAL_CITIES entry is a real city → type='city'.
//   When LOCAL_PROVINCES is added later, governorates/provinces get their own type.

import fs from 'node:fs';
import path from 'node:path';

const APP_JS = path.resolve('js/app.js');
const src = fs.readFileSync(APP_JS, 'utf8');

// ── cc (lowercase) → countryEn ─────────────────────────────────────────
const CC_TO_EN = {
    sa: 'Saudi Arabia', ae: 'United Arab Emirates', eg: 'Egypt', kw: 'Kuwait',
    qa: 'Qatar', bh: 'Bahrain', om: 'Oman', ye: 'Yemen', jo: 'Jordan',
    sy: 'Syria', iq: 'Iraq', lb: 'Lebanon', ma: 'Morocco', dz: 'Algeria',
    tn: 'Tunisia', ly: 'Libya', sd: 'Sudan', ps: 'Palestine',
    pk: 'Pakistan', tr: 'Turkey', ir: 'Iran', my: 'Malaysia', id: 'Indonesia',
    bd: 'Bangladesh', in: 'India', ng: 'Nigeria',
    gb: 'United Kingdom', fr: 'France', de: 'Germany', it: 'Italy',
    es: 'Spain', at: 'Austria', nl: 'Netherlands', ru: 'Russia',
    us: 'United States', ca: 'Canada', mx: 'Mexico', ar: 'Argentina',
    br: 'Brazil', au: 'Australia',
    jp: 'Japan', kr: 'South Korea', cn: 'China', hk: 'Hong Kong',
    sg: 'Singapore', th: 'Thailand', ph: 'Philippines',
};

// ── Capitals (en name → priority 100) ──────────────────────────────────
const CAPITALS = new Set([
    'Riyadh', 'Abu Dhabi', 'Cairo', 'Kuwait City', 'Doha', 'Manama', 'Muscat',
    'Sanaa', 'Amman', 'Damascus', 'Baghdad', 'Beirut', 'Rabat', 'Algiers',
    'Tunis', 'Tripoli', 'Khartoum', 'Islamabad', 'Ankara', 'Tehran',
    'Kuala Lumpur', 'Jakarta', 'Jerusalem', 'London', 'Paris', 'Berlin',
    'Washington', 'Ottawa', 'Tokyo', 'Seoul', 'Beijing', 'Bangkok',
    'Manila', 'Moscow', 'Rome', 'Madrid', 'Vienna', 'Amsterdam',
    'Mexico City', 'Buenos Aires', 'Delhi', 'Abuja',
    // Religious / global anchors — same priority as capitals
    'Mecca', 'Medina',
    // City-states (capital == city)
    'Singapore', 'Hong Kong',
]);

// ── Aliases (en name → array of alternate spellings) ──────────────────
// أسماء بديلة شائعة — تتطابق بـ score أقلّ من الاسم الأساسيّ
const ALIASES = {
    'Mecca':           ['Makkah', 'Makkah al-Mukarramah', 'Mecca al-Mukarramah'],
    'Medina':          ['Madinah', 'Al Madinah', 'Al Madinah Al Munawwarah', 'Madina'],
    'Jeddah':          ['Jiddah', 'Jedda'],
    'Damascus':        ['Dimashq', 'Esh Sham'],
    'Aleppo':          ['Halab'],
    'Cairo':           ['Al Qahirah', 'El Qahira'],
    'Alexandria':      ['El Iskandariyah', 'Al Iskandariyah'],
    'Algiers':         ["El Jaza'ir", 'Al Jaza\'ir'],
    'Marrakech':       ['Marrakesh'],
    'Fes':             ['Fez'],
    'Casablanca':      ['Dar el Beida'],
    'Beijing':         ['Peking'],
    'Mumbai':          ['Bombay'],
    'Kolkata':         ['Calcutta'],
    'Chennai':         ['Madras'],
    'Bengaluru':       ['Bangalore'],
    'Tehran':          ['Teheran'],
    'Sanaa':           ["San'a", 'Sanaá'],
    'Sharjah':         ['Ash Shariqah'],
    'Doha':            ['Ad Dawhah'],
    'Manama':          ['Al Manamah'],
    'Muscat':          ['Masqat'],
    'Tunis':           ['Tunes'],
    'Tripoli':         ['Tarabulus'],
    'Khartoum':        ['Al Khartum'],
    'Baghdad':         ['Bagdad'],
    'Karbala':         ['Kerbala'],
    'Najaf':           ['An Najaf'],
    'Basra':           ['Al Basrah'],
    'Amman':           ['Ammaan'],
    'Al-Ahsa':         ['Al Ahsa', 'Hofuf', 'Al Hofuf'],
    'Qassim':          ['Al Qassim', 'Buraidah', 'Buraydah'],
    'Hail':            ["Ha'il", 'Hayil'],
};

// ── Major secondary cities (en name → priority 80) ─────────────────────
const MAJORS = new Set([
    'Jeddah', 'Dubai', 'Alexandria', 'Aleppo', 'Basra', 'Casablanca',
    'Karachi', 'Lahore', 'Istanbul', 'Mumbai', 'New York', 'Los Angeles',
    'Saint Petersburg', 'Shanghai', 'Osaka', 'Lagos', 'Surabaya',
    'Marrakech', 'Faisalabad', 'Hamburg', 'Munich', 'Lyon', 'Marseille',
    'Birmingham', 'Manchester', 'Toronto', 'Vancouver', 'São Paulo', 'Sydney',
    'Sharjah', 'Medina', 'Taif', 'Dammam', 'Karbala', 'Najaf',
    'Bengaluru', 'Chennai', 'Kolkata',
    'Hyderabad', 'Cologne', 'Frankfurt', 'Kazan', 'Guangzhou',
    'Bandung', 'Medan', 'Kano', 'Multan', 'Izmir', 'Bursa',
    'Chicago', 'Miami', 'Houston', 'San Francisco', 'Seattle', 'Boston',
]);

// ── Find LOCAL_CITIES block ────────────────────────────────────────────
const startMarker = 'const LOCAL_CITIES = [';
const startIdx = src.indexOf(startMarker);
if (startIdx === -1) { console.error('LOCAL_CITIES block not found'); process.exit(1); }
const blockStart = startIdx + startMarker.length;
// Find matching closing ];
let depth = 1, i = blockStart;
while (i < src.length && depth > 0) {
    const ch = src[i];
    if (ch === '[') depth++;
    else if (ch === ']') depth--;
    if (depth === 0) break;
    i++;
}
if (depth !== 0) { console.error('Unmatched LOCAL_CITIES brackets'); process.exit(1); }
const blockEnd = i; // index of closing ]
const blockText = src.slice(blockStart, blockEnd);

// ── Parse + enrich each entry line ─────────────────────────────────────
// Each entry sits on a single line: {ar:'...',en:'...',lat:N,lng:N,cc:'..',country:'...'},
const entryRe = /\{([^{}]*)\}/g;
let entries = 0, capitalsCount = 0, majorsCount = 0;

const enrichedBlock = blockText.replace(entryRe, (full, body) => {
    entries++;

    // Extract en + cc to look up priority/countryEn
    const enMatch = body.match(/en\s*:\s*'([^']+)'/);
    const ccMatch = body.match(/cc\s*:\s*'([^']+)'/);
    if (!enMatch || !ccMatch) return full; // malformed — skip

    const en = enMatch[1];
    const cc = ccMatch[1].toLowerCase();
    const countryEn = CC_TO_EN[cc] || '';

    let priority;
    if (CAPITALS.has(en))    { priority = 100; capitalsCount++; }
    else if (MAJORS.has(en)) { priority = 80;  majorsCount++; }
    else                     { priority = 60; }

    // Idempotent: strip any existing type/priority/countryEn/aliasEn before re-adding
    let cleaned = body
        .replace(/,?\s*type\s*:\s*'[^']*'/g, '')
        .replace(/,?\s*priority\s*:\s*\d+/g, '')
        .replace(/,?\s*countryEn\s*:\s*'[^']*'/g, '')
        .replace(/,?\s*aliasEn\s*:\s*\[[^\]]*\]/g, '');

    // Build alias suffix if any
    const aliasArr = ALIASES[en];
    const aliasSuffix = aliasArr
        ? `,aliasEn:[${aliasArr.map(a => `'${a.replace(/'/g, "\\'")}'`).join(',')}]`
        : '';

    const appended = cleaned + `,type:'city',priority:${priority},countryEn:'${countryEn}'${aliasSuffix}`;
    return `{${appended}}`;
});

// ── Write back ─────────────────────────────────────────────────────────
const out = src.slice(0, blockStart) + enrichedBlock + src.slice(blockEnd);
fs.writeFileSync(APP_JS, out);

console.log(`✓ Enriched ${entries} entries  (capitals: ${capitalsCount}, majors: ${majorsCount}, others: ${entries - capitalsCount - majorsCount})`);
