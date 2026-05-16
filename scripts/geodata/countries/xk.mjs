// scripts/geodata/countries/xk.mjs — Kosovo — CURATED-GEODATA-EUROPE-3
// User policy: XK wins bare slug `pristina`. RS Pristina (if it appears
// in RS dump) goes to EUROPE-3-BLOCKED-REVIEW per the wave collision
// rule (XK is sovereign since 2008; we treat it as the canonical owner).
export default {
    cc:'xk', countryAr:'كوسوفو', countryEn:'Kosovo',
    defaultTimezone:'Europe/Belgrade',     // Same TZ as Serbia
    geonamesUrl:'https://download.geonames.org/export/dump/XK.zip', innerTxtName:'XK.txt',
    bbox:{ minLat:41.9, maxLat:43.3, minLng:20.0, maxLng:21.8 },
    admin1ToRegion:{},
    popMin:100000, alwaysIncludeFeatureCodes:['PPLC','PPLA'], extraReligious:[], extraNonPlace:[]
};
