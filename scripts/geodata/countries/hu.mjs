// scripts/geodata/countries/hu.mjs — Hungary — CURATED-GEODATA-EUROPE-3
export default {
    cc:'hu', countryAr:'المجر', countryEn:'Hungary',
    defaultTimezone:'Europe/Budapest',
    geonamesUrl:'https://download.geonames.org/export/dump/HU.zip', innerTxtName:'HU.txt',
    bbox:{ minLat:45.7, maxLat:48.6, minLng:16.1, maxLng:22.9 },
    // Hungary 19 counties + Budapest. Will verify Stage 1.
    admin1ToRegion:{
        '05':{ar:'بودابست',en:'Budapest'}
        // remaining codes verified after Stage 1
    },
    popMin:100000, alwaysIncludeFeatureCodes:['PPLC','PPLA'], extraReligious:[], extraNonPlace:[]
};
