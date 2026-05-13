// One-shot seeder: appends 21 Romance-country cities to curated-places.json.
// Idempotent — checks for an existing slug before adding.
import fs from 'node:fs';

const PATH = './db/places/curated-places.json';
const places = JSON.parse(fs.readFileSync(PATH, 'utf8'));
const seen = new Set(places.map(p => p.slug));

const newCities = [
    // ── Italy (9) ──
    { slug: 'venice', cc: 'it', lat: 45.4408, lng: 12.3155, tz: 'Europe/Rome',
        names: {ar:'البندقية',en:'Venice',fr:'Venise',de:'Venedig',tr:'Venedik',ur:'وینس',id:'Venesia',es:'Venecia',bn:'ভেনিস',ms:'Venice'},
        aliases: {en:['Venezia']}, countryAr:'إيطاليا', countryEn:'Italy', priority: 90 },
    { slug: 'florence', cc: 'it', lat: 43.7696, lng: 11.2558, tz: 'Europe/Rome',
        names: {ar:'فلورنسا',en:'Florence',fr:'Florence',de:'Florenz',tr:'Floransa',ur:'فلورنس',id:'Florence',es:'Florencia',bn:'ফ্লোরেন্স',ms:'Florence'},
        aliases: {en:['Firenze']}, countryAr:'إيطاليا', countryEn:'Italy', priority: 85 },
    { slug: 'rome', cc: 'it', lat: 41.9028, lng: 12.4964, tz: 'Europe/Rome',
        names: {ar:'روما',en:'Rome',fr:'Rome',de:'Rom',tr:'Roma',ur:'روم',id:'Roma',es:'Roma',bn:'রোম',ms:'Rome'},
        aliases: {en:['Roma']}, countryAr:'إيطاليا', countryEn:'Italy', priority: 100 },
    { slug: 'naples', cc: 'it', lat: 40.8518, lng: 14.2681, tz: 'Europe/Rome',
        names: {ar:'نابولي',en:'Naples',fr:'Naples',de:'Neapel',tr:'Napoli',ur:'نیپلز',id:'Napoli',es:'Nápoles',bn:'নাপলস',ms:'Naples'},
        aliases: {en:['Napoli']}, countryAr:'إيطاليا', countryEn:'Italy', priority: 85 },
    { slug: 'milan', cc: 'it', lat: 45.4642, lng: 9.1900, tz: 'Europe/Rome',
        names: {ar:'ميلانو',en:'Milan',fr:'Milan',de:'Mailand',tr:'Milano',ur:'میلان',id:'Milan',es:'Milán',bn:'মিলান',ms:'Milan'},
        aliases: {en:['Milano']}, countryAr:'إيطاليا', countryEn:'Italy', priority: 90 },
    { slug: 'turin', cc: 'it', lat: 45.0703, lng: 7.6869, tz: 'Europe/Rome',
        names: {ar:'تورينو',en:'Turin',fr:'Turin',de:'Turin',tr:'Torino',ur:'ٹورن',id:'Torino',es:'Turín',bn:'তুরিন',ms:'Turin'},
        aliases: {en:['Torino']}, countryAr:'إيطاليا', countryEn:'Italy', priority: 80 },
    { slug: 'genoa', cc: 'it', lat: 44.4056, lng: 8.9463, tz: 'Europe/Rome',
        names: {ar:'جنوة',en:'Genoa',fr:'Gênes',de:'Genua',tr:'Cenova',ur:'جنوآ',id:'Genoa',es:'Génova',bn:'জেনোয়া',ms:'Genoa'},
        aliases: {en:['Genova']}, countryAr:'إيطاليا', countryEn:'Italy', priority: 80 },
    { slug: 'bologna', cc: 'it', lat: 44.4949, lng: 11.3426, tz: 'Europe/Rome',
        names: {ar:'بولونيا',en:'Bologna',fr:'Bologne',de:'Bologna',tr:'Bolonya',ur:'بولونیا',id:'Bologna',es:'Bolonia',bn:'বোলোনিয়া',ms:'Bologna'},
        aliases: {en:[]}, countryAr:'إيطاليا', countryEn:'Italy', priority: 80 },
    { slug: 'pisa', cc: 'it', lat: 43.7228, lng: 10.4017, tz: 'Europe/Rome',
        names: {ar:'بيزا',en:'Pisa',fr:'Pise',de:'Pisa',tr:'Piza',ur:'پیزا',id:'Pisa',es:'Pisa',bn:'পিসা',ms:'Pisa'},
        aliases: {en:[]}, countryAr:'إيطاليا', countryEn:'Italy', priority: 75 },

    // ── Spain (8) ──
    { slug: 'madrid', cc: 'es', lat: 40.4168, lng: -3.7038, tz: 'Europe/Madrid',
        names: {ar:'مدريد',en:'Madrid',fr:'Madrid',de:'Madrid',tr:'Madrid',ur:'میڈرڈ',id:'Madrid',es:'Madrid',bn:'মাদ্রিদ',ms:'Madrid'},
        aliases: {en:[]}, countryAr:'إسبانيا', countryEn:'Spain', priority: 100 },
    { slug: 'barcelona', cc: 'es', lat: 41.3851, lng: 2.1734, tz: 'Europe/Madrid',
        names: {ar:'برشلونة',en:'Barcelona',fr:'Barcelone',de:'Barcelona',tr:'Barselona',ur:'بارسلونا',id:'Barcelona',es:'Barcelona',bn:'বার্সেলোনা',ms:'Barcelona'},
        aliases: {en:[]}, countryAr:'إسبانيا', countryEn:'Spain', priority: 95 },
    { slug: 'cordoba', cc: 'es', lat: 37.8882, lng: -4.7794, tz: 'Europe/Madrid',
        names: {ar:'قرطبة',en:'Córdoba',fr:'Cordoue',de:'Córdoba',tr:'Kurtuba',ur:'قرطبہ',id:'Córdoba',es:'Córdoba',bn:'কর্ডোবা',ms:'Cordoba'},
        aliases: {en:['Cordoba']}, countryAr:'إسبانيا', countryEn:'Spain', priority: 85 },
    { slug: 'seville', cc: 'es', lat: 37.3891, lng: -5.9845, tz: 'Europe/Madrid',
        names: {ar:'إشبيلية',en:'Seville',fr:'Séville',de:'Sevilla',tr:'Sevilla',ur:'اشبیلیہ',id:'Sevilla',es:'Sevilla',bn:'সেভিল',ms:'Seville'},
        aliases: {en:['Sevilla']}, countryAr:'إسبانيا', countryEn:'Spain', priority: 85 },
    { slug: 'granada-es', cc: 'es', lat: 37.1773, lng: -3.5986, tz: 'Europe/Madrid',
        names: {ar:'غرناطة',en:'Granada',fr:'Grenade',de:'Granada',tr:'Granada',ur:'غرناطہ',id:'Granada',es:'Granada',bn:'গ্রানাডা',ms:'Granada'},
        aliases: {en:[]}, countryAr:'إسبانيا', countryEn:'Spain', priority: 85 },
    { slug: 'malaga', cc: 'es', lat: 36.7213, lng: -4.4214, tz: 'Europe/Madrid',
        names: {ar:'مالقة',en:'Málaga',fr:'Malaga',de:'Málaga',tr:'Malaga',ur:'مالاگا',id:'Málaga',es:'Málaga',bn:'মালাগা',ms:'Malaga'},
        aliases: {en:['Malaga']}, countryAr:'إسبانيا', countryEn:'Spain', priority: 80 },
    { slug: 'zaragoza', cc: 'es', lat: 41.6488, lng: -0.8891, tz: 'Europe/Madrid',
        names: {ar:'سرقسطة',en:'Zaragoza',fr:'Saragosse',de:'Saragossa',tr:'Zaragoza',ur:'زراگوزا',id:'Zaragoza',es:'Zaragoza',bn:'জারাগোজা',ms:'Zaragoza'},
        aliases: {en:['Saragossa']}, countryAr:'إسبانيا', countryEn:'Spain', priority: 80 },
    { slug: 'valencia', cc: 'es', lat: 39.4699, lng: -0.3763, tz: 'Europe/Madrid',
        names: {ar:'فالنسيا',en:'Valencia',fr:'Valence',de:'Valencia',tr:'Valencia',ur:'ویلنسیا',id:'Valencia',es:'Valencia',bn:'ভ্যালেন্সিয়া',ms:'Valencia'},
        aliases: {ar:['بلنسية'],en:[]}, countryAr:'إسبانيا', countryEn:'Spain', priority: 85 },

    // ── Portugal (2) ──
    { slug: 'lisbon', cc: 'pt', lat: 38.7223, lng: -9.1393, tz: 'Europe/Lisbon',
        names: {ar:'لشبونة',en:'Lisbon',fr:'Lisbonne',de:'Lissabon',tr:'Lizbon',ur:'لزبن',id:'Lisboa',es:'Lisboa',bn:'লিসবন',ms:'Lisbon'},
        aliases: {en:['Lisboa']}, countryAr:'البرتغال', countryEn:'Portugal', priority: 90 },
    { slug: 'porto', cc: 'pt', lat: 41.1579, lng: -8.6291, tz: 'Europe/Lisbon',
        names: {ar:'بورتو',en:'Porto',fr:'Porto',de:'Porto',tr:'Porto',ur:'پورتو',id:'Porto',es:'Oporto',bn:'পোর্তো',ms:'Porto'},
        aliases: {en:['Oporto']}, countryAr:'البرتغال', countryEn:'Portugal', priority: 80 },

    // ── Brazil (2) ──
    { slug: 'sao-paulo', cc: 'br', lat: -23.5505, lng: -46.6333, tz: 'America/Sao_Paulo',
        names: {ar:'ساو باولو',en:'São Paulo',fr:'São Paulo',de:'São Paulo',tr:'São Paulo',ur:'ساؤ پاؤلو',id:'São Paulo',es:'São Paulo',bn:'সাও পাওলো',ms:'São Paulo'},
        aliases: {en:['Sao Paulo']}, countryAr:'البرازيل', countryEn:'Brazil', priority: 95 },
    { slug: 'rio-de-janeiro', cc: 'br', lat: -22.9068, lng: -43.1729, tz: 'America/Sao_Paulo',
        names: {ar:'ريو دي جانيرو',en:'Rio de Janeiro',fr:'Rio de Janeiro',de:'Rio de Janeiro',tr:'Rio de Janeiro',ur:'ریو ڈی جنیرو',id:'Rio de Janeiro',es:'Río de Janeiro',bn:'রিও ডি জেনিরো',ms:'Rio de Janeiro'},
        aliases: {en:['Rio']}, countryAr:'البرازيل', countryEn:'Brazil', priority: 85 }
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
