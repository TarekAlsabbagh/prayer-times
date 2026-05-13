// One-shot seeder for GLOBAL-PLACE-SEARCH-L10N-IN-1 — appends 19
// Indian/Pakistani/Bangladeshi cities to curated-places.json.
// Each entry includes multi-script aliases (Latin + native scripts)
// so search hits tier 1 regardless of which script the user types.
// Idempotent (skips entries that already exist by slug).
import fs from 'node:fs';

const PATH = './db/places/curated-places.json';
const places = JSON.parse(fs.readFileSync(PATH, 'utf8'));
const seen = new Set(places.map(p => p.slug));

const newCities = [
    // ── India (8) ──
    { slug: 'new-delhi', cc: 'in', lat: 28.6139, lng: 77.2090, tz: 'Asia/Kolkata',
        names: {ar:'دلهي',en:'Delhi',fr:'Delhi',de:'Delhi',tr:'Delhi',ur:'دہلی',id:'Delhi',es:'Delhi',bn:'দিল্লি',ms:'Delhi'},
        aliases: {en:['New Delhi'], hi:['दिल्ली','नई दिल्ली'], ur:['دہلی','نئی دہلی'], bn:['দিল্লি']},
        countryAr:'الهند', countryEn:'India', priority: 100 },
    { slug: 'mumbai', cc: 'in', lat: 19.0760, lng: 72.8777, tz: 'Asia/Kolkata',
        names: {ar:'مومباي',en:'Mumbai',fr:'Bombay',de:'Mumbai',tr:'Mumbai',ur:'ممبئی',id:'Mumbai',es:'Bombay',bn:'মুম্বই',ms:'Mumbai'},
        aliases: {en:['Bombay'], hi:['मुंबई'], ur:['ممبئی'], mr:['मुंबई']},
        countryAr:'الهند', countryEn:'India', priority: 95 },
    { slug: 'kolkata', cc: 'in', lat: 22.5726, lng: 88.3639, tz: 'Asia/Kolkata',
        names: {ar:'كلكتا',en:'Kolkata',fr:'Calcutta',de:'Kalkutta',tr:'Kalküta',ur:'کولکاتا',id:'Kolkata',es:'Calcuta',bn:'কলকাতা',ms:'Kolkata'},
        aliases: {en:['Calcutta'], hi:['कोलकाता'], bn:['কলকাতা'], ur:['کولکاتا','کلکتہ']},
        countryAr:'الهند', countryEn:'India', priority: 90 },
    { slug: 'hyderabad-in', cc: 'in', lat: 17.3850, lng: 78.4867, tz: 'Asia/Kolkata',
        names: {ar:'حيدر آباد',en:'Hyderabad',fr:'Hyderabad',de:'Hyderabad',tr:'Haydarabad',ur:'حیدرآباد',id:'Hyderabad',es:'Hyderabad',bn:'হায়দরাবাদ',ms:'Hyderabad'},
        aliases: {en:[], hi:['हैदराबाद'], ur:['حیدرآباد'], te:['హైదరాబాదు']},
        countryAr:'الهند', countryEn:'India', priority: 85 },
    { slug: 'chennai', cc: 'in', lat: 13.0827, lng: 80.2707, tz: 'Asia/Kolkata',
        names: {ar:'تشيناي',en:'Chennai',fr:'Chennai',de:'Chennai',tr:'Chennai',ur:'چنئی',id:'Chennai',es:'Chennai',bn:'চেন্নাই',ms:'Chennai'},
        aliases: {en:['Madras'], hi:['चेन्नई'], ta:['சென்னை']},
        countryAr:'الهند', countryEn:'India', priority: 85 },
    { slug: 'bengaluru', cc: 'in', lat: 12.9716, lng: 77.5946, tz: 'Asia/Kolkata',
        names: {ar:'بنغالورو',en:'Bengaluru',fr:'Bangalore',de:'Bangalore',tr:'Bangalore',ur:'بنگلور',id:'Bengaluru',es:'Bangalore',bn:'বেঙ্গালুরু',ms:'Bengaluru'},
        aliases: {en:['Bangalore'], hi:['बेंगलुरु','बैंगलोर'], kn:['ಬೆಂಗಳೂರು']},
        countryAr:'الهند', countryEn:'India', priority: 85 },
    { slug: 'lucknow', cc: 'in', lat: 26.8467, lng: 80.9462, tz: 'Asia/Kolkata',
        names: {ar:'لكناو',en:'Lucknow',fr:'Lucknow',de:'Lakhnau',tr:'Lucknow',ur:'لکھنؤ',id:'Lucknow',es:'Lucknow',bn:'লখনউ',ms:'Lucknow'},
        aliases: {en:[], hi:['लखनऊ'], ur:['لکھنؤ']},
        countryAr:'الهند', countryEn:'India', priority: 80 },
    { slug: 'ahmedabad', cc: 'in', lat: 23.0225, lng: 72.5714, tz: 'Asia/Kolkata',
        names: {ar:'أحمد آباد',en:'Ahmedabad',fr:'Ahmedabad',de:'Ahmedabad',tr:'Ahmedabad',ur:'احمد آباد',id:'Ahmedabad',es:'Ahmedabad',bn:'আহমেদাবাদ',ms:'Ahmedabad'},
        aliases: {en:[], hi:['अहमदाबाद'], gu:['અમદાવાદ'], ur:['احمد آباد']},
        countryAr:'الهند', countryEn:'India', priority: 80 },

    // ── Pakistan (6) ──
    { slug: 'karachi', cc: 'pk', lat: 24.8607, lng: 67.0011, tz: 'Asia/Karachi',
        names: {ar:'كراتشي',en:'Karachi',fr:'Karachi',de:'Karatschi',tr:'Karaçi',ur:'کراچی',id:'Karachi',es:'Karachi',bn:'করাচি',ms:'Karachi'},
        aliases: {en:[], ur:['کراچی']},
        countryAr:'باكستان', countryEn:'Pakistan', priority: 95 },
    { slug: 'lahore', cc: 'pk', lat: 31.5204, lng: 74.3587, tz: 'Asia/Karachi',
        names: {ar:'لاهور',en:'Lahore',fr:'Lahore',de:'Lahore',tr:'Lahor',ur:'لاہور',id:'Lahore',es:'Lahore',bn:'লাহোর',ms:'Lahore'},
        aliases: {en:[], ur:['لاہور']},
        countryAr:'باكستان', countryEn:'Pakistan', priority: 90 },
    { slug: 'islamabad', cc: 'pk', lat: 33.6844, lng: 73.0479, tz: 'Asia/Karachi',
        names: {ar:'إسلام آباد',en:'Islamabad',fr:'Islamabad',de:'Islamabad',tr:'İslamabad',ur:'اسلام آباد',id:'Islamabad',es:'Islamabad',bn:'ইসলামাবাদ',ms:'Islamabad'},
        aliases: {en:[], ur:['اسلام آباد','اسلام اباد']},
        countryAr:'باكستان', countryEn:'Pakistan', priority: 90 },
    { slug: 'rawalpindi', cc: 'pk', lat: 33.5651, lng: 73.0169, tz: 'Asia/Karachi',
        names: {ar:'روالبندي',en:'Rawalpindi',fr:'Rawalpindi',de:'Rawalpindi',tr:'Ravalpindi',ur:'راولپنڈی',id:'Rawalpindi',es:'Rawalpindi',bn:'রাওয়ালপিন্ডি',ms:'Rawalpindi'},
        aliases: {en:[], ur:['راولپنڈی']},
        countryAr:'باكستان', countryEn:'Pakistan', priority: 80 },
    { slug: 'peshawar', cc: 'pk', lat: 34.0151, lng: 71.5249, tz: 'Asia/Karachi',
        names: {ar:'بيشاور',en:'Peshawar',fr:'Peshawar',de:'Peschawar',tr:'Peşaver',ur:'پشاور',id:'Peshawar',es:'Peshawar',bn:'পেশাওয়ার',ms:'Peshawar'},
        aliases: {en:[], ur:['پشاور']},
        countryAr:'باكستان', countryEn:'Pakistan', priority: 80 },
    { slug: 'multan', cc: 'pk', lat: 30.1575, lng: 71.5249, tz: 'Asia/Karachi',
        names: {ar:'ملتان',en:'Multan',fr:'Multan',de:'Multan',tr:'Multan',ur:'ملتان',id:'Multan',es:'Multán',bn:'মুলতান',ms:'Multan'},
        aliases: {en:[], ur:['ملتان']},
        countryAr:'باكستان', countryEn:'Pakistan', priority: 80 },

    // ── Bangladesh (5) ──
    { slug: 'dhaka', cc: 'bd', lat: 23.8103, lng: 90.4125, tz: 'Asia/Dhaka',
        names: {ar:'دكا',en:'Dhaka',fr:'Dacca',de:'Dhaka',tr:'Dakka',ur:'ڈھاکا',id:'Dhaka',es:'Daca',bn:'ঢাকা',ms:'Dhaka'},
        aliases: {en:['Dacca'], bn:['ঢাকা'], ur:['ڈھاکا']},
        countryAr:'بنغلاديش', countryEn:'Bangladesh', priority: 95 },
    { slug: 'chittagong', cc: 'bd', lat: 22.3569, lng: 91.7832, tz: 'Asia/Dhaka',
        names: {ar:'شيتاغونغ',en:'Chittagong',fr:'Chittagong',de:'Chittagong',tr:'Chittagong',ur:'چٹاگانگ',id:'Chittagong',es:'Chittagong',bn:'চট্টগ্রাম',ms:'Chittagong'},
        aliases: {en:['Chattogram'], bn:['চট্টগ্রাম','চাটগাঁ'], ur:['چٹاگانگ']},
        countryAr:'بنغلاديش', countryEn:'Bangladesh', priority: 85 },
    { slug: 'sylhet', cc: 'bd', lat: 24.8949, lng: 91.8687, tz: 'Asia/Dhaka',
        names: {ar:'سلهت',en:'Sylhet',fr:'Sylhet',de:'Sylhet',tr:'Sylhet',ur:'سلہٹ',id:'Sylhet',es:'Sylhet',bn:'সিলেট',ms:'Sylhet'},
        aliases: {en:[], bn:['সিলেট'], ur:['سلہٹ']},
        countryAr:'بنغلاديش', countryEn:'Bangladesh', priority: 80 },
    { slug: 'rajshahi', cc: 'bd', lat: 24.3636, lng: 88.6241, tz: 'Asia/Dhaka',
        names: {ar:'راجشاهي',en:'Rajshahi',fr:'Rajshahi',de:'Rajshahi',tr:'Rajshahi',ur:'راجشاہی',id:'Rajshahi',es:'Rajshahi',bn:'রাজশাহী',ms:'Rajshahi'},
        aliases: {en:[], bn:['রাজশাহী'], ur:['راجشاہی']},
        countryAr:'بنغلاديش', countryEn:'Bangladesh', priority: 80 },
    { slug: 'khulna', cc: 'bd', lat: 22.8456, lng: 89.5403, tz: 'Asia/Dhaka',
        names: {ar:'خولنا',en:'Khulna',fr:'Khulna',de:'Khulna',tr:'Khulna',ur:'کھلنا',id:'Khulna',es:'Khulna',bn:'খুলনা',ms:'Khulna'},
        aliases: {en:[], bn:['খুলনা'], ur:['کھلنا']},
        countryAr:'بنغلاديش', countryEn:'Bangladesh', priority: 80 }
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
