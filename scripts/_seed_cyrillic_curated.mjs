// One-shot seeder for GLOBAL-PLACE-SEARCH-L10N-RU-1 — appends 11
// Russian + Ukrainian cities to curated-places.json.
// Idempotent (skips entries that already exist by slug).
import fs from 'node:fs';

const PATH = './db/places/curated-places.json';
const places = JSON.parse(fs.readFileSync(PATH, 'utf8'));
const seen = new Set(places.map(p => p.slug));

const newCities = [
    // ── Russia (6) ──
    { slug: 'moscow', cc: 'ru', lat: 55.7558, lng: 37.6173, tz: 'Europe/Moscow',
        names: {ar:'موسكو',en:'Moscow',fr:'Moscou',de:'Moskau',tr:'Moskova',ur:'ماسکو',id:'Moskwa',es:'Moscú',bn:'মস্কো',ms:'Moscow'},
        aliases: {en:['Moskva','Москва']}, countryAr:'روسيا', countryEn:'Russia', priority: 100 },
    { slug: 'saint-petersburg', cc: 'ru', lat: 59.9311, lng: 30.3609, tz: 'Europe/Moscow',
        names: {ar:'سانت بطرسبرغ',en:'Saint Petersburg',fr:'Saint-Pétersbourg',de:'Sankt Petersburg',tr:'Saint Petersburg',ur:'سینٹ پیٹرسبرگ',id:'Sankt-Peterburg',es:'San Petersburgo',bn:'সেন্ট পিটার্সবার্গ',ms:'Saint Petersburg'},
        aliases: {en:['St Petersburg','St. Petersburg','Petersburg','Санкт-Петербург']}, countryAr:'روسيا', countryEn:'Russia', priority: 95 },
    { slug: 'vladivostok', cc: 'ru', lat: 43.1198, lng: 131.8869, tz: 'Asia/Vladivostok',
        names: {ar:'فلاديفوستوك',en:'Vladivostok',fr:'Vladivostok',de:'Wladiwostok',tr:'Vladivostok',ur:'ولاڈیووستوک',id:'Vladivostok',es:'Vladivostok',bn:'ভ্লাদিভোস্তক',ms:'Vladivostok'},
        aliases: {en:['Владивосток']}, countryAr:'روسيا', countryEn:'Russia', priority: 80 },
    { slug: 'kazan', cc: 'ru', lat: 55.8304, lng: 49.0661, tz: 'Europe/Moscow',
        names: {ar:'قازان',en:'Kazan',fr:'Kazan',de:'Kasan',tr:'Kazan',ur:'کازان',id:'Kazan',es:'Kazán',bn:'কাজান',ms:'Kazan'},
        aliases: {en:['Казань']}, countryAr:'روسيا', countryEn:'Russia', priority: 85 },
    { slug: 'sochi', cc: 'ru', lat: 43.6028, lng: 39.7342, tz: 'Europe/Moscow',
        names: {ar:'سوتشي',en:'Sochi',fr:'Sotchi',de:'Sotschi',tr:'Soçi',ur:'سوچی',id:'Sochi',es:'Sochi',bn:'সোচি',ms:'Sochi'},
        aliases: {en:['Сочи']}, countryAr:'روسيا', countryEn:'Russia', priority: 80 },
    { slug: 'novosibirsk', cc: 'ru', lat: 55.0084, lng: 82.9357, tz: 'Asia/Novosibirsk',
        names: {ar:'نوفوسيبيرسك',en:'Novosibirsk',fr:'Novossibirsk',de:'Nowosibirsk',tr:'Novosibirsk',ur:'نووسیبیرسک',id:'Novosibirsk',es:'Novosibirsk',bn:'নভোসিবিরস্ক',ms:'Novosibirsk'},
        aliases: {en:['Новосибирск']}, countryAr:'روسيا', countryEn:'Russia', priority: 80 },

    // ── Ukraine (5) ──
    { slug: 'kyiv', cc: 'ua', lat: 50.4501, lng: 30.5234, tz: 'Europe/Kyiv',
        names: {ar:'كييف',en:'Kyiv',fr:'Kiev',de:'Kiew',tr:'Kiev',ur:'کیف',id:'Kyiv',es:'Kiev',bn:'কিয়েভ',ms:'Kyiv'},
        aliases: {en:['Kiev','Київ','Киев']}, countryAr:'أوكرانيا', countryEn:'Ukraine', priority: 95 },
    { slug: 'odesa', cc: 'ua', lat: 46.4825, lng: 30.7233, tz: 'Europe/Kyiv',
        names: {ar:'أوديسا',en:'Odesa',fr:'Odessa',de:'Odessa',tr:'Odessa',ur:'اوڈیسا',id:'Odesa',es:'Odesa',bn:'ওদেসা',ms:'Odesa'},
        aliases: {en:['Odessa','Одеса','Одесса']}, countryAr:'أوكرانيا', countryEn:'Ukraine', priority: 85 },
    { slug: 'lviv', cc: 'ua', lat: 49.8397, lng: 24.0297, tz: 'Europe/Kyiv',
        names: {ar:'لفيف',en:'Lviv',fr:'Lviv',de:'Lemberg',tr:'Lviv',ur:'لویو',id:'Lviv',es:'Leópolis',bn:'লভিভ',ms:'Lviv'},
        aliases: {en:['Lvov','Lemberg','Львів','Львов']}, countryAr:'أوكرانيا', countryEn:'Ukraine', priority: 85 },
    { slug: 'kharkiv', cc: 'ua', lat: 49.9935, lng: 36.2304, tz: 'Europe/Kyiv',
        names: {ar:'خاركيف',en:'Kharkiv',fr:'Kharkiv',de:'Charkiw',tr:'Kharkiv',ur:'خارکیو',id:'Kharkiv',es:'Járkov',bn:'খারকিভ',ms:'Kharkiv'},
        aliases: {en:['Kharkov','Харків','Харьков']}, countryAr:'أوكرانيا', countryEn:'Ukraine', priority: 80 },
    { slug: 'dnipro', cc: 'ua', lat: 48.4647, lng: 35.0462, tz: 'Europe/Kyiv',
        names: {ar:'دنيبرو',en:'Dnipro',fr:'Dnipro',de:'Dnipro',tr:'Dnipro',ur:'دنیپرو',id:'Dnipro',es:'Dnipró',bn:'নিপ্রো',ms:'Dnipro'},
        aliases: {en:['Dnepropetrovsk','Dnipropetrovsk','Дніпро','Дніпропетровськ']}, countryAr:'أوكرانيا', countryEn:'Ukraine', priority: 80 }
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
