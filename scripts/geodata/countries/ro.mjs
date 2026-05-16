// scripts/geodata/countries/ro.mjs — Romania — CURATED-GEODATA-EUROPE-3
export default {
    cc:'ro', countryAr:'رومانيا', countryEn:'Romania',
    defaultTimezone:'Europe/Bucharest',
    geonamesUrl:'https://download.geonames.org/export/dump/RO.zip', innerTxtName:'RO.txt',
    bbox:{ minLat:43.6, maxLat:48.3, minLng:20.2, maxLng:29.8 },
    // Romania 41 counties + Bucharest. Will verify Stage 1.
    admin1ToRegion:{},
    popMin:100000, alwaysIncludeFeatureCodes:['PPLC','PPLA'], extraReligious:[], extraNonPlace:[]
};
