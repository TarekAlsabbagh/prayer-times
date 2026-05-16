// scripts/geodata/countries/pl.mjs — Poland — CURATED-GEODATA-EUROPE-3
// admin1 codes verified via Stage 1 PPLA inspection (2026-05-16).
export default {
    cc:'pl', countryAr:'بولندا', countryEn:'Poland',
    defaultTimezone:'Europe/Warsaw',
    geonamesUrl:'https://download.geonames.org/export/dump/PL.zip', innerTxtName:'PL.txt',
    bbox:{ minLat:49.0, maxLat:54.9, minLng:14.0, maxLng:24.2 },
    admin1ToRegion:{
        '72':{ar:'سيليزيا السفلى',     en:'Lower Silesia'},   // Wrocław
        '73':{ar:'كويافي-بومرانيا',    en:'Kuyavia-Pomerania'}, // Bydgoszcz
        '74':{ar:'لودز',               en:'Łódź'},
        '75':{ar:'لوبلين',             en:'Lublin'},
        '76':{ar:'لوبوش',              en:'Lubusz'},          // Zielona Góra / Gorzów
        '77':{ar:'بولندا الصغرى',      en:'Lesser Poland'},   // Kraków
        '78':{ar:'مازوفيا',            en:'Masovia'},         // Warsaw PPLC
        '79':{ar:'أوبولي',             en:'Opole'},
        '80':{ar:'كاربات السفلى',      en:'Subcarpathia'},    // Rzeszów
        '81':{ar:'بودلاسي',            en:'Podlaskie'},       // Białystok
        '82':{ar:'بوميرانيا',          en:'Pomerania'},       // Gdańsk
        '83':{ar:'سيليزيا',            en:'Silesia'},         // Katowice
        '84':{ar:'شفينتوكشيسكي',       en:'Świętokrzyskie'},  // Kielce
        '85':{ar:'فارمينسكو-مازورسكي', en:'Warmia-Masuria'},  // Olsztyn
        '86':{ar:'بولندا الكبرى',      en:'Greater Poland'},  // Poznań
        '87':{ar:'بوميرانيا الغربية',  en:'West Pomerania'}   // Szczecin
    },
    popMin:100000, alwaysIncludeFeatureCodes:['PPLC','PPLA'], extraReligious:[], extraNonPlace:[]
};
