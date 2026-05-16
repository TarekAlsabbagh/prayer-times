// scripts/geodata/countries/sk.mjs — Slovakia — CURATED-GEODATA-EUROPE-3
export default {
    cc:'sk', countryAr:'سلوفاكيا', countryEn:'Slovakia',
    defaultTimezone:'Europe/Bratislava',
    geonamesUrl:'https://download.geonames.org/export/dump/SK.zip', innerTxtName:'SK.txt',
    bbox:{ minLat:47.7, maxLat:49.7, minLng:16.8, maxLng:22.6 },
    // Slovakia 8 regions (kraje). Will verify Stage 1.
    admin1ToRegion:{
        '01':{ar:'براتيسلافا',en:'Bratislava'},
        '02':{ar:'بانسكا بيستريتسا',en:'Banská Bystrica'},
        '03':{ar:'كوشيتسه',en:'Košice'},
        '04':{ar:'نيترا',en:'Nitra'},
        '05':{ar:'بريشوف',en:'Prešov'},
        '06':{ar:'ترنتشين',en:'Trenčín'},
        '07':{ar:'ترنافا',en:'Trnava'},
        '08':{ar:'جيلينا',en:'Žilina'}
    },
    popMin:100000, alwaysIncludeFeatureCodes:['PPLC','PPLA'], extraReligious:[], extraNonPlace:[]
};
