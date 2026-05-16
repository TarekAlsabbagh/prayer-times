// scripts/geodata/countries/gr.mjs — Greece — CURATED-GEODATA-EUROPE-3
export default {
    cc:'gr', countryAr:'اليونان', countryEn:'Greece',
    defaultTimezone:'Europe/Athens',
    geonamesUrl:'https://download.geonames.org/export/dump/GR.zip', innerTxtName:'GR.txt',
    bbox:{ minLat:34.7, maxLat:41.8, minLng:19.3, maxLng:29.7 },
    // Greece 13 administrative regions + Mount Athos. Will verify Stage 1.
    admin1ToRegion:{},
    popMin:100000, alwaysIncludeFeatureCodes:['PPLC','PPLA'], extraReligious:[], extraNonPlace:[]
};
