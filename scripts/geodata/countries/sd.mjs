// scripts/geodata/countries/sd.mjs
// ─────────────────────────────────────────────────────────────────────────
// Sudan — GeoNames country config
// CURATED-GEODATA-NILE-YEMEN-LIBYA-1
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'sd',
    countryAr:       'السودان',
    countryEn:       'Sudan',
    defaultTimezone: 'Africa/Khartoum',

    geonamesUrl:  'https://download.geonames.org/export/dump/SD.zip',
    innerTxtName: 'SD.txt',

    // Sudan: roughly 8.7°-22.0°N and 21.8°-38.7°E. Pad slightly
    // for the southern + western borders where GeoNames sometimes
    // assigns Sudan to points fractionally outside.
    bbox: { minLat: 8.6, maxLat: 22.1, minLng: 21.7, maxLng: 38.8 },

    // Verified via Stage 1 PPLA/PPLC entries (Sudan has 18 states post-
    // 2013 reorganization; GeoNames uses non-contiguous codes
    // 29/36/38/39/41/42/43/47/49/50/52/53/55/56/58/60/61/62 — the gaps
    // are the legacy pre-2011 codes from before South Sudan partition):
    //   29=PPLC Khartoum, 36=Red Sea (Port Sudan),
    //   38=Gezira (Wad Medani), 39=Gedaref (Al Qadarif),
    //   41=White Nile (Rabak), 42=Blue Nile (Ad-Damazin),
    //   43=Northern (Dongola), 47=West Darfur (Al-Junaynah),
    //   49=South Darfur (Nyala), 50=South Kordofan (Kadugli),
    //   52=Kassala, 53=River Nile (Ad-Damir),
    //   55=North Darfur (El Fasher), 56=North Kordofan (El Obeid),
    //   58=Sennar (Singa), 60=East Darfur (El Daein),
    //   61=Central Darfur (Zalingei), 62=West Kordofan (Al-Fulah)
    admin1ToRegion: {
        '29': { ar: 'ولاية الخرطوم',           en: 'Khartoum State' },
        '36': { ar: 'ولاية البحر الأحمر',      en: 'Red Sea State' },
        '38': { ar: 'ولاية الجزيرة',           en: 'Al Jazirah State' },
        '39': { ar: 'ولاية القضارف',           en: 'Al Qadarif State' },
        '41': { ar: 'ولاية النيل الأبيض',      en: 'White Nile State' },
        '42': { ar: 'ولاية النيل الأزرق',      en: 'Blue Nile State' },
        '43': { ar: 'الولاية الشمالية',        en: 'Northern State' },
        '47': { ar: 'ولاية غرب دارفور',        en: 'West Darfur State' },
        '49': { ar: 'ولاية جنوب دارفور',       en: 'South Darfur State' },
        '50': { ar: 'ولاية جنوب كردفان',       en: 'South Kordofan State' },
        '52': { ar: 'ولاية كسلا',              en: 'Kassala State' },
        '53': { ar: 'ولاية نهر النيل',         en: 'River Nile State' },
        '55': { ar: 'ولاية شمال دارفور',       en: 'North Darfur State' },
        '56': { ar: 'ولاية شمال كردفان',       en: 'North Kordofan State' },
        '58': { ar: 'ولاية سنار',              en: 'Sennar State' },
        '60': { ar: 'ولاية شرق دارفور',        en: 'East Darfur State' },
        '61': { ar: 'ولاية وسط دارفور',        en: 'Central Darfur State' },
        '62': { ar: 'ولاية غرب كردفان',        en: 'West Kordofan State' }
    },

    extraReligious: [],
    extraNonPlace:  []
};
