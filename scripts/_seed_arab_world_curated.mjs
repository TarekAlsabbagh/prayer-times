// EMERGENCY: append ~25 major Arab + Middle Eastern cities to curated-places.json.
// These cities are critical for a prayer-times site but were previously
// served only via Nominatim — and production's Render IP keeps hitting
// the 1-req/sec rate limit, leaving them empty during peak usage.
//
// Idempotent (skips entries that already exist by slug).
import fs from 'node:fs';

const PATH = './db/places/curated-places.json';
const places = JSON.parse(fs.readFileSync(PATH, 'utf8'));
const seen = new Set(places.map(p => p.slug));

const newCities = [
    // ── Levant ──
    { slug: 'damascus', cc: 'sy', lat: 33.5138, lng: 36.2765, tz: 'Asia/Damascus',
        names: {ar:'دمشق',en:'Damascus',fr:'Damas',de:'Damaskus',tr:'Şam',ur:'دمشق',id:'Damaskus',es:'Damasco',bn:'দামেস্কাস',ms:'Damsyik'},
        aliases: {en:['Dimashq','Esh Sham'],ar:['الشام']}, countryAr:'سوريا', countryEn:'Syria', priority: 100 },
    { slug: 'aleppo', cc: 'sy', lat: 36.2021, lng: 37.1343, tz: 'Asia/Damascus',
        names: {ar:'حلب',en:'Aleppo',fr:'Alep',de:'Aleppo',tr:'Halep',ur:'حلب',id:'Aleppo',es:'Alepo',bn:'আলেপ্পো',ms:'Aleppo'},
        aliases: {en:['Halab'],ar:['حلب الشهباء']}, countryAr:'سوريا', countryEn:'Syria', priority: 90 },
    { slug: 'beirut', cc: 'lb', lat: 33.8938, lng: 35.5018, tz: 'Asia/Beirut',
        names: {ar:'بيروت',en:'Beirut',fr:'Beyrouth',de:'Beirut',tr:'Beyrut',ur:'بیروت',id:'Beirut',es:'Beirut',bn:'বৈরুত',ms:'Beirut'},
        aliases: {en:['Beyrouth']}, countryAr:'لبنان', countryEn:'Lebanon', priority: 100 },
    { slug: 'amman', cc: 'jo', lat: 31.9454, lng: 35.9284, tz: 'Asia/Amman',
        names: {ar:'عمّان',en:'Amman',fr:'Amman',de:'Amman',tr:'Amman',ur:'عمان',id:'Amman',es:'Amán',bn:'আম্মান',ms:'Amman'},
        aliases: {ar:['عمان'],en:[]}, countryAr:'الأردن', countryEn:'Jordan', priority: 100 },
    { slug: 'jerusalem', cc: 'ps', lat: 31.7683, lng: 35.2137, tz: 'Asia/Hebron',
        names: {ar:'القدس',en:'Jerusalem',fr:'Jérusalem',de:'Jerusalem',tr:'Kudüs',ur:'یروشلم',id:'Yerusalem',es:'Jerusalén',bn:'জেরুজালেম',ms:'Baitulmaqdis'},
        aliases: {ar:['أورشليم','بيت المقدس'],en:['Al-Quds','Bayt al-Maqdis']}, countryAr:'فلسطين', countryEn:'Palestine', priority: 100 },
    { slug: 'gaza', cc: 'ps', lat: 31.5017, lng: 34.4668, tz: 'Asia/Gaza',
        names: {ar:'غزة',en:'Gaza',fr:'Gaza',de:'Gaza',tr:'Gazze',ur:'غزہ',id:'Gaza',es:'Gaza',bn:'গাজা',ms:'Gaza'},
        aliases: {ar:['غزة هاشم']}, countryAr:'فلسطين', countryEn:'Palestine', priority: 95 },
    { slug: 'ramallah', cc: 'ps', lat: 31.9038, lng: 35.2034, tz: 'Asia/Hebron',
        names: {ar:'رام الله',en:'Ramallah',fr:'Ramallah',de:'Ramallah',tr:'Ramallah',ur:'رام اللہ',id:'Ramallah',es:'Ramala',bn:'রামাল্লাহ',ms:'Ramallah'},
        aliases: {}, countryAr:'فلسطين', countryEn:'Palestine', priority: 80 },

    // ── Mesopotamia / Iraq ──
    { slug: 'baghdad', cc: 'iq', lat: 33.3152, lng: 44.3661, tz: 'Asia/Baghdad',
        names: {ar:'بغداد',en:'Baghdad',fr:'Bagdad',de:'Bagdad',tr:'Bağdat',ur:'بغداد',id:'Bagdad',es:'Bagdad',bn:'বাগদাদ',ms:'Baghdad'},
        aliases: {ar:['مدينة السلام']}, countryAr:'العراق', countryEn:'Iraq', priority: 100 },
    { slug: 'basra', cc: 'iq', lat: 30.5085, lng: 47.7804, tz: 'Asia/Baghdad',
        names: {ar:'البصرة',en:'Basra',fr:'Bassora',de:'Basra',tr:'Basra',ur:'بصرہ',id:'Basra',es:'Basora',bn:'বসরা',ms:'Basrah'},
        aliases: {en:['Basrah']}, countryAr:'العراق', countryEn:'Iraq', priority: 85 },
    { slug: 'mosul', cc: 'iq', lat: 36.3489, lng: 43.1577, tz: 'Asia/Baghdad',
        names: {ar:'الموصل',en:'Mosul',fr:'Mossoul',de:'Mossul',tr:'Musul',ur:'موصل',id:'Mosul',es:'Mosul',bn:'মসুল',ms:'Mosul'},
        aliases: {ar:['موصل']}, countryAr:'العراق', countryEn:'Iraq', priority: 85 },

    // ── Gulf ──
    { slug: 'doha', cc: 'qa', lat: 25.2854, lng: 51.5310, tz: 'Asia/Qatar',
        names: {ar:'الدوحة',en:'Doha',fr:'Doha',de:'Doha',tr:'Doha',ur:'دوحہ',id:'Doha',es:'Doha',bn:'দোহা',ms:'Doha'},
        aliases: {ar:['دوحة']}, countryAr:'قطر', countryEn:'Qatar', priority: 100 },
    { slug: 'kuwait-city', cc: 'kw', lat: 29.3759, lng: 47.9774, tz: 'Asia/Kuwait',
        names: {ar:'الكويت',en:'Kuwait City',fr:'Koweït',de:'Kuwait-Stadt',tr:'Kuveyt',ur:'کویت سٹی',id:'Kuwait City',es:'Ciudad de Kuwait',bn:'কুয়েত সিটি',ms:'Bandar Kuwait'},
        aliases: {ar:['مدينة الكويت','كويت'],en:['Kuwait']}, countryAr:'الكويت', countryEn:'Kuwait', priority: 100 },
    { slug: 'manama', cc: 'bh', lat: 26.2285, lng: 50.5860, tz: 'Asia/Bahrain',
        names: {ar:'المنامة',en:'Manama',fr:'Manama',de:'Manama',tr:'Manama',ur:'منامہ',id:'Manama',es:'Manama',bn:'মানামা',ms:'Manama'},
        aliases: {ar:['منامة']}, countryAr:'البحرين', countryEn:'Bahrain', priority: 100 },
    { slug: 'muscat', cc: 'om', lat: 23.5859, lng: 58.4059, tz: 'Asia/Muscat',
        names: {ar:'مسقط',en:'Muscat',fr:'Mascate',de:'Maskat',tr:'Maskat',ur:'مسقط',id:'Muscat',es:'Mascate',bn:'মাসকাট',ms:'Muscat'},
        aliases: {}, countryAr:'عُمان', countryEn:'Oman', priority: 100 },
    { slug: 'abu-dhabi', cc: 'ae', lat: 24.4539, lng: 54.3773, tz: 'Asia/Dubai',
        names: {ar:'أبوظبي',en:'Abu Dhabi',fr:'Abou Dabi',de:'Abu Dhabi',tr:'Abu Dabi',ur:'ابو ظبی',id:'Abu Dhabi',es:'Abu Dabi',bn:'আবু ধাবি',ms:'Abu Dhabi'},
        aliases: {ar:['أبو ظبي']}, countryAr:'الإمارات', countryEn:'United Arab Emirates', priority: 100 },
    { slug: 'dubai', cc: 'ae', lat: 25.2048, lng: 55.2708, tz: 'Asia/Dubai',
        names: {ar:'دبي',en:'Dubai',fr:'Dubaï',de:'Dubai',tr:'Dubai',ur:'دبئی',id:'Dubai',es:'Dubái',bn:'দুবাই',ms:'Dubai'},
        aliases: {}, countryAr:'الإمارات', countryEn:'United Arab Emirates', priority: 100 },
    { slug: 'sharjah', cc: 'ae', lat: 25.3463, lng: 55.4209, tz: 'Asia/Dubai',
        names: {ar:'الشارقة',en:'Sharjah',fr:'Charjah',de:'Schardscha',tr:'Sharjah',ur:'شارجہ',id:'Sharjah',es:'Sharjah',bn:'শারজাহ',ms:'Sharjah'},
        aliases: {ar:['شارقة']}, countryAr:'الإمارات', countryEn:'United Arab Emirates', priority: 90 },

    // ── Yemen / Horn of Africa ──
    { slug: 'sanaa', cc: 'ye', lat: 15.3694, lng: 44.1910, tz: 'Asia/Aden',
        names: {ar:'صنعاء',en:'Sanaa',fr:'Sanaa',de:'Sanaa',tr:'Sana',ur:'صنعاء',id:'Sana',es:'Saná',bn:'সানা',ms:'Sanaa'},
        aliases: {en:['Sana','San\'a']}, countryAr:'اليمن', countryEn:'Yemen', priority: 100 },
    { slug: 'aden', cc: 'ye', lat: 12.7855, lng: 45.0187, tz: 'Asia/Aden',
        names: {ar:'عدن',en:'Aden',fr:'Aden',de:'Aden',tr:'Aden',ur:'عدن',id:'Aden',es:'Adén',bn:'এডেন',ms:'Aden'},
        aliases: {}, countryAr:'اليمن', countryEn:'Yemen', priority: 85 },
    { slug: 'mogadishu', cc: 'so', lat: 2.0469, lng: 45.3182, tz: 'Africa/Mogadishu',
        names: {ar:'مقديشو',en:'Mogadishu',fr:'Mogadiscio',de:'Mogadischu',tr:'Mogadişu',ur:'موغاديشو',id:'Mogadishu',es:'Mogadiscio',bn:'মোগাদিশু',ms:'Mogadishu'},
        aliases: {ar:['مقديشيو']}, countryAr:'الصومال', countryEn:'Somalia', priority: 90 },

    // ── Nile / Egypt ──
    { slug: 'alexandria', cc: 'eg', lat: 31.2001, lng: 29.9187, tz: 'Africa/Cairo',
        names: {ar:'الإسكندرية',en:'Alexandria',fr:'Alexandrie',de:'Alexandria',tr:'İskenderiye',ur:'اسکندریہ',id:'Alexandria',es:'Alejandría',bn:'আলেক্সান্দ্রিয়া',ms:'Iskandariah'},
        aliases: {ar:['إسكندرية','الاسكندرية']}, countryAr:'مصر', countryEn:'Egypt', priority: 95 },
    { slug: 'khartoum', cc: 'sd', lat: 15.5007, lng: 32.5599, tz: 'Africa/Khartoum',
        names: {ar:'الخرطوم',en:'Khartoum',fr:'Khartoum',de:'Khartum',tr:'Hartum',ur:'خرطوم',id:'Khartoum',es:'Jartum',bn:'খার্তুম',ms:'Khartoum'},
        aliases: {ar:['خرطوم']}, countryAr:'السودان', countryEn:'Sudan', priority: 100 },

    // ── Maghreb ──
    { slug: 'algiers', cc: 'dz', lat: 36.7538, lng: 3.0588, tz: 'Africa/Algiers',
        names: {ar:'الجزائر',en:'Algiers',fr:'Alger',de:'Algier',tr:'Cezayir',ur:'الجیئرز',id:'Algiers',es:'Argel',bn:'আলজিয়ার্স',ms:'Algiers'},
        aliases: {ar:['مدينة الجزائر']}, countryAr:'الجزائر', countryEn:'Algeria', priority: 100 },
    { slug: 'tunis', cc: 'tn', lat: 36.8065, lng: 10.1815, tz: 'Africa/Tunis',
        names: {ar:'تونس',en:'Tunis',fr:'Tunis',de:'Tunis',tr:'Tunus',ur:'تونس',id:'Tunis',es:'Túnez',bn:'তিউনিস',ms:'Tunis'},
        aliases: {ar:['مدينة تونس']}, countryAr:'تونس', countryEn:'Tunisia', priority: 100 },
    { slug: 'tripoli-ly', cc: 'ly', lat: 32.8872, lng: 13.1913, tz: 'Africa/Tripoli',
        names: {ar:'طرابلس',en:'Tripoli',fr:'Tripoli',de:'Tripolis',tr:'Trablus',ur:'طرابلس',id:'Tripoli',es:'Trípoli',bn:'ত্রিপোলি',ms:'Tripoli'},
        aliases: {ar:['طرابلس الغرب']}, countryAr:'ليبيا', countryEn:'Libya', priority: 95 },
    { slug: 'casablanca', cc: 'ma', lat: 33.5731, lng: -7.5898, tz: 'Africa/Casablanca',
        names: {ar:'الدار البيضاء',en:'Casablanca',fr:'Casablanca',de:'Casablanca',tr:'Kazablanka',ur:'کاسابلانکا',id:'Casablanca',es:'Casablanca',bn:'কাসাব্লাঙ্কা',ms:'Casablanca'},
        aliases: {ar:['كازابلانكا','دار البيضاء']}, countryAr:'المغرب', countryEn:'Morocco', priority: 100 },
    { slug: 'rabat', cc: 'ma', lat: 34.0209, lng: -6.8417, tz: 'Africa/Casablanca',
        names: {ar:'الرباط',en:'Rabat',fr:'Rabat',de:'Rabat',tr:'Rabat',ur:'رباط',id:'Rabat',es:'Rabat',bn:'রাবাত',ms:'Rabat'},
        aliases: {ar:['رباط']}, countryAr:'المغرب', countryEn:'Morocco', priority: 95 },
    { slug: 'marrakesh', cc: 'ma', lat: 31.6295, lng: -7.9811, tz: 'Africa/Casablanca',
        names: {ar:'مراكش',en:'Marrakesh',fr:'Marrakech',de:'Marrakesch',tr:'Marakeş',ur:'مراکش',id:'Marrakesh',es:'Marrakech',bn:'মারাকেশ',ms:'Marrakesh'},
        aliases: {en:['Marrakech']}, countryAr:'المغرب', countryEn:'Morocco', priority: 85 },
    { slug: 'nouakchott', cc: 'mr', lat: 18.0735, lng: -15.9582, tz: 'Africa/Nouakchott',
        names: {ar:'نواكشوط',en:'Nouakchott',fr:'Nouakchott',de:'Nouakchott',tr:'Nuakşot',ur:'نواکشوط',id:'Nouakchott',es:'Nuakchot',bn:'নুয়াকশট',ms:'Nouakchott'},
        aliases: {}, countryAr:'موريتانيا', countryEn:'Mauritania', priority: 90 }
];

let added = 0;
for (const c of newCities) {
    if (seen.has(c.slug)) { console.log('  SKIP (exists)', c.slug); continue; }
    const aliases = c.aliases || {};
    places.push({
        slug: c.slug, type: 'city', countryCode: c.cc,
        lat: c.lat, lng: c.lng, timezone: c.tz,
        names: c.names,
        aliases: aliases,
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
