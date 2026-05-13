// One-shot seeder for GLOBAL-PLACE-SEARCH-L10N-DE-1 — appends 11
// German/Austrian/Swiss cities to curated-places.json.
// Idempotent (skips entries that already exist by slug).
import fs from 'node:fs';

const PATH = './db/places/curated-places.json';
const places = JSON.parse(fs.readFileSync(PATH, 'utf8'));
const seen = new Set(places.map(p => p.slug));

const newCities = [
    // ── Germany (9) ──
    { slug: 'berlin', cc: 'de', lat: 52.5200, lng: 13.4050, tz: 'Europe/Berlin',
        names: {ar:'برلين',en:'Berlin',fr:'Berlin',de:'Berlin',tr:'Berlin',ur:'برلن',id:'Berlin',es:'Berlín',bn:'বার্লিন',ms:'Berlin'},
        aliases: {en:[]}, countryAr:'ألمانيا', countryEn:'Germany', priority: 100 },
    { slug: 'munich', cc: 'de', lat: 48.1351, lng: 11.5820, tz: 'Europe/Berlin',
        names: {ar:'ميونخ',en:'Munich',fr:'Munich',de:'München',tr:'Münih',ur:'میونخ',id:'München',es:'Múnich',bn:'মিউনিখ',ms:'Munich'},
        aliases: {en:['München']}, countryAr:'ألمانيا', countryEn:'Germany', priority: 95 },
    { slug: 'cologne', cc: 'de', lat: 50.9375, lng: 6.9603, tz: 'Europe/Berlin',
        names: {ar:'كولونيا',en:'Cologne',fr:'Cologne',de:'Köln',tr:'Köln',ur:'کولون',id:'Köln',es:'Colonia',bn:'কোলন',ms:'Cologne'},
        aliases: {en:['Köln','Koln']}, countryAr:'ألمانيا', countryEn:'Germany', priority: 90 },
    { slug: 'hamburg', cc: 'de', lat: 53.5511, lng: 9.9937, tz: 'Europe/Berlin',
        names: {ar:'هامبورغ',en:'Hamburg',fr:'Hambourg',de:'Hamburg',tr:'Hamburg',ur:'ہیمبرگ',id:'Hamburg',es:'Hamburgo',bn:'হামবুর্গ',ms:'Hamburg'},
        aliases: {en:[]}, countryAr:'ألمانيا', countryEn:'Germany', priority: 90 },
    { slug: 'frankfurt', cc: 'de', lat: 50.1109, lng: 8.6821, tz: 'Europe/Berlin',
        names: {ar:'فرانكفورت',en:'Frankfurt',fr:'Francfort',de:'Frankfurt am Main',tr:'Frankfurt',ur:'فرینکفرٹ',id:'Frankfurt',es:'Fráncfort',bn:'ফ্রাংকফুর্ট',ms:'Frankfurt'},
        aliases: {en:['Frankfurt am Main']}, countryAr:'ألمانيا', countryEn:'Germany', priority: 90 },
    { slug: 'stuttgart', cc: 'de', lat: 48.7758, lng: 9.1829, tz: 'Europe/Berlin',
        names: {ar:'شتوتغارت',en:'Stuttgart',fr:'Stuttgart',de:'Stuttgart',tr:'Stuttgart',ur:'شٹٹگارٹ',id:'Stuttgart',es:'Stuttgart',bn:'স্টুটগার্ট',ms:'Stuttgart'},
        aliases: {en:[]}, countryAr:'ألمانيا', countryEn:'Germany', priority: 85 },
    { slug: 'dusseldorf', cc: 'de', lat: 51.2277, lng: 6.7735, tz: 'Europe/Berlin',
        names: {ar:'دوسلدورف',en:'Düsseldorf',fr:'Düsseldorf',de:'Düsseldorf',tr:'Düsseldorf',ur:'ڈسلڈورف',id:'Düsseldorf',es:'Düsseldorf',bn:'ডুসেলডর্ফ',ms:'Düsseldorf'},
        aliases: {en:['Dusseldorf','Duesseldorf']}, countryAr:'ألمانيا', countryEn:'Germany', priority: 80 },
    { slug: 'nuremberg', cc: 'de', lat: 49.4521, lng: 11.0767, tz: 'Europe/Berlin',
        names: {ar:'نورنبرغ',en:'Nuremberg',fr:'Nuremberg',de:'Nürnberg',tr:'Nürnberg',ur:'نیورمبرگ',id:'Nürnberg',es:'Núremberg',bn:'নুরেমবার্গ',ms:'Nuremberg'},
        aliases: {en:['Nürnberg','Nurnberg']}, countryAr:'ألمانيا', countryEn:'Germany', priority: 80 },
    { slug: 'bonn', cc: 'de', lat: 50.7374, lng: 7.0982, tz: 'Europe/Berlin',
        names: {ar:'بون',en:'Bonn',fr:'Bonn',de:'Bonn',tr:'Bonn',ur:'بون',id:'Bonn',es:'Bonn',bn:'বন',ms:'Bonn'},
        aliases: {en:[]}, countryAr:'ألمانيا', countryEn:'Germany', priority: 75 },

    // ── Austria (1) ──
    { slug: 'vienna', cc: 'at', lat: 48.2082, lng: 16.3738, tz: 'Europe/Vienna',
        names: {ar:'فيينا',en:'Vienna',fr:'Vienne',de:'Wien',tr:'Viyana',ur:'ویانا',id:'Wina',es:'Viena',bn:'ভিয়েনা',ms:'Vienna'},
        aliases: {en:['Wien']}, countryAr:'النمسا', countryEn:'Austria', priority: 95 },

    // ── Switzerland (1) ──
    { slug: 'zurich', cc: 'ch', lat: 47.3769, lng: 8.5417, tz: 'Europe/Zurich',
        names: {ar:'زيورخ',en:'Zurich',fr:'Zurich',de:'Zürich',tr:'Zürih',ur:'زیورخ',id:'Zürich',es:'Zúrich',bn:'জুরিখ',ms:'Zurich'},
        aliases: {en:['Zürich','Zuerich']}, countryAr:'سويسرا', countryEn:'Switzerland', priority: 85 }
];

let added = 0;
for (const c of newCities) {
    if (seen.has(c.slug)) { console.log('  SKIP (exists)', c.slug); continue; }
    places.push({
        slug: c.slug, type: 'city', countryCode: c.cc,
        lat: c.lat, lng: c.lng, timezone: c.tz,
        names: c.names, aliases: c.aliases,
        admin: { countryAr: c.countryAr, countryEn: c.countryEn },
        priority: c.priority, source: 'curated', verified: true
    });
    seen.add(c.slug);
    added++;
}

fs.writeFileSync(PATH, JSON.stringify(places, null, 2) + '\n');
console.log('Added', added, 'cities. Total entries:', places.length);
const counts = places.reduce((a,p) => { a[p.countryCode]=(a[p.countryCode]||0)+1; return a; }, {});
console.log('Per-country counts:', counts);
