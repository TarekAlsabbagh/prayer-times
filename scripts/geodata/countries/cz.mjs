// scripts/geodata/countries/cz.mjs — Czech Republic — CURATED-GEODATA-EUROPE-3
export default {
    cc:'cz', countryAr:'التشيك', countryEn:'Czech Republic',
    defaultTimezone:'Europe/Prague',
    geonamesUrl:'https://download.geonames.org/export/dump/CZ.zip', innerTxtName:'CZ.txt',
    bbox:{ minLat:48.5, maxLat:51.1, minLng:12.0, maxLng:18.9 },
    // Czech Republic 14 regions (kraje). Will verify Stage 1.
    admin1ToRegion:{
        '52':{ar:'هرادتس كرالوفيه',en:'Hradec Králové'},
        '78':{ar:'مورافيا-سيليزيا',en:'Moravian-Silesian'},
        '60':{ar:'أوست نا لابم',en:'Ústí nad Labem'},
        '64':{ar:'بلزن',en:'Plzeň'},
        '54':{ar:'كارلوفي فاري',en:'Karlovy Vary'},
        '79':{ar:'أولومونتس',en:'Olomouc'},
        '53':{ar:'بوهيميا الجنوبية',en:'South Bohemia'},
        '80':{ar:'زلين',en:'Zlín'},
        '70':{ar:'وسط بوهيميا',en:'Central Bohemia'},
        '74':{ar:'ليبيرتس',en:'Liberec'},
        '52':{ar:'هرادتس كرالوفيه',en:'Hradec Králové'},
        '78':{ar:'مورافيا-سيليزيا',en:'Moravian-Silesian'},
        '71':{ar:'مورافيا الجنوبية',en:'South Moravia'},
        '86':{ar:'فيسوتشينا',en:'Vysočina'},
        '88':{ar:'باردوبيتسه',en:'Pardubice'},
        '52':{ar:'هرادتس كرالوفيه',en:'Hradec Králové'},
        '10':{ar:'براغ',en:'Prague'}
    },
    popMin:100000, alwaysIncludeFeatureCodes:['PPLC','PPLA'], extraReligious:[], extraNonPlace:[]
};
