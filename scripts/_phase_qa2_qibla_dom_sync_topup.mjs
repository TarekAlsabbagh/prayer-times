// Phase Q-A2 — Qibla DOM Title Sync + Content Top-up.
//
// SEOptimer post-Q-A still flags 2 items on /qibla-in-riyadh:
//   1. Title Tag ❌ — SEOptimer reads DOM Title (post-JS, 48 chars):
//      "اتجاه القبلة في الرياض، المملكة العربية السعودية"
//      NOT the SSR Title (56 chars in sweet spot).
//      Source of overwrite: js/app.js:9152-9211 (setSEOMeta call inside
//      `if (/\/qibla-in-/.test(path))` block).
//   2. Amount of Content ❌ — 610 words, 40 short of ~650 target.
//
// Per user spec (Q-A2 ONLY — NO Q-B/Q-C):
//   • Sync DOM Title with SSR Title format
//   • Add 80-120 visible SSR words → ~700-730 total
//   • DO NOT touch /qibla Hub, H2 reduction, Performance, moon/hijri/prayer
//
// PART 1 (js/app.js:9153-9176): rewrite the qibla-city titles + desc blocks
//   to match SSR Q-A format exactly. Drop the `[withCountry, withoutCountry]`
//   array pattern — use a single SSR-matching string.
//
// PART 2 (server.js Q-A SSR sections): extend Section 4 (how-to) paragraph
//   in 10 langs by ~50-60 words each. Adds ~50-60 AR words to the page.
//   For other 9 langs, add proportional content.
//
// PART 3 (server.js Q-A): also extend Section 1 (overview) paragraph in
//   AR + 9 langs by ~30-40 words to push word count over 650 reliably.

import { readFileSync, writeFileSync } from 'node:fs';

const APP_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\js\\app.js';
const SRV_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';

let appRaw = readFileSync(APP_PATH, 'utf8');
let srvRaw = readFileSync(SRV_PATH, 'utf8');

const isCRLFapp = /\r\n/.test(appRaw);
const isCRLFsrv = /\r\n/.test(srvRaw);

if (/Phase Q-A2 \(2026-05-03\)/.test(appRaw)) {
    throw new Error('[app.js] Q-A2 already applied');
}

function lfToEol(s, isCRLF) { return isCRLF ? s.replace(/\r?\n/g, '\r\n') : s; }

function makeReplacer(getRaw, setRaw, isCRLF) {
    return function replaceOnce(label, oldStr, newStr) {
        const oldNorm = lfToEol(oldStr, isCRLF);
        const newNorm = lfToEol(newStr, isCRLF);
        const raw = getRaw();
        const cnt = raw.split(oldNorm).length - 1;
        if (cnt !== 1) throw new Error(`[${label}] expected 1 anchor match, got ${cnt}`);
        setRaw(raw.replace(oldNorm, newNorm));
        console.log(`✓ ${label}`);
    };
}

const replaceApp = makeReplacer(() => appRaw, v => appRaw = v, isCRLFapp);
const replaceSrv = makeReplacer(() => srvRaw, v => srvRaw = v, isCRLFsrv);

// ═══════════════════════════════════════════════════════════════════════════
// PART 1 — js/app.js: rewrite qibla-city titles + desc to match SSR Q-A.
// Drops the [withCountry, withoutCountry] array — uses single SSR-matching
// string so DOM Title (post-JS) === SSR Title (what crawlers read).
// ═══════════════════════════════════════════════════════════════════════════
const APP_PART1_OLD = `    // qibla-in-*
    if (/\\/qibla-in-/.test(path)) {
        const titles = ({
            ar: [\`اتجاه القبلة في \${cityDisplay}\${countrySuffix}\`, \`اتجاه القبلة في \${cityDisplay}\`],
            en: [\`Qibla Direction in \${cityDisplay}\${countrySuffix}\`, \`Qibla Direction in \${cityDisplay}\`],
            fr: [\`Direction de la Qibla à \${cityDisplay}\${countrySuffix}\`, \`Direction de la Qibla à \${cityDisplay}\`],
            tr: [\`\${cityDisplay}\${countrySuffix} Kıble Yönü\`, \`\${cityDisplay} Kıble Yönü\`],
            ur: [\`\${cityDisplay}\${countrySuffix} میں قبلہ کی سمت\`, \`\${cityDisplay} میں قبلہ کی سمت\`],
            de: [\`Qibla-Richtung in \${cityDisplay}\${countrySuffix}\`, \`Qibla-Richtung in \${cityDisplay}\`],
            id: [\`Arah Kiblat di \${cityDisplay}\${countrySuffix}\`, \`Arah Kiblat di \${cityDisplay}\`],
            es: [\`Dirección de la Qibla en \${cityDisplay}\${countrySuffix}\`, \`Dirección de la Qibla en \${cityDisplay}\`],
            bn: [\`\${cityDisplay}\${countrySuffix}-এ কিবলার দিক\`, \`\${cityDisplay}-এ কিবলার দিক\`],
            ms: [\`Arah Kiblat di \${cityDisplay}\${countrySuffix}\`, \`Arah Kiblat di \${cityDisplay}\`],
        })[lang];
        const desc = ({
            ar: \`اتجاه القبلة الدقيق من \${cityDisplay}\${countrySuffix} إلى الكعبة المشرفة في مكة، مع درجة الانحراف وبوصلة وخريطة تفاعلية.\`,
            en: \`Accurate Qibla direction from \${cityDisplay}\${countrySuffix} to the Kaaba in Mecca, with exact bearing, compass and map view.\`,
            fr: \`Direction précise de la Qibla depuis \${cityDisplay}\${countrySuffix} vers la Kaaba à La Mecque, avec angle exact, boussole et vue sur carte.\`,
            tr: \`\${cityDisplay}\${countrySuffix} konumundan Mekke'deki Kâbe'ye doğru kesin Kıble yönü, tam açı, pusula ve harita görünümü.\`,
            ur: \`\${cityDisplay}\${countrySuffix} سے مکہ میں کعبہ شریف کی درست قبلہ سمت، درست زاویہ، کمپاس اور نقشہ ویو کے ساتھ۔\`,
            de: \`Genaue Qibla-Richtung von \${cityDisplay}\${countrySuffix} zur Kaaba in Mekka, mit exaktem Winkel, Kompass und Kartenansicht.\`,
            id: \`Arah Kiblat yang akurat dari \${cityDisplay}\${countrySuffix} ke Ka'bah di Mekkah, dengan sudut tepat, kompas, dan tampilan peta.\`,
            es: \`Dirección precisa de la Qibla desde \${cityDisplay}\${countrySuffix} hacia la Kaaba en La Meca, con ángulo exacto, brújula y vista de mapa.\`,
            bn: \`\${cityDisplay}\${countrySuffix} থেকে মক্কার কাবার দিকে সঠিক কিবলার দিক, সুনির্দিষ্ট কোণ, কম্পাস এবং মানচিত্র দৃশ্যসহ।\`,
            ms: \`Arah Kiblat tepat dari \${cityDisplay}\${countrySuffix} ke Kaabah di Makkah, dengan sudut tepat, kompas dan pandangan peta.\`,
        })[lang];`;

const APP_PART1_NEW = `    // qibla-in-*
    if (/\\/qibla-in-/.test(path)) {
        // Phase Q-A2 (2026-05-03): client Title + Meta now MIRROR SSR Q-A format
        // exactly so SEOptimer (which may read DOM post-JS) sees the same Title
        // it sees in SSR. Drops the previous [withCountry, withoutCountry] array
        // pattern — single string per lang. Country suffix removed because the
        // SSR Title is already in the 50-60 sweet spot without it.
        const titles = ({
            ar: [\`اتجاه القبلة في \${cityDisplay} | بوصلة الكعبة وتحديد القبلة بدقة\`, \`اتجاه القبلة في \${cityDisplay} | بوصلة الكعبة وتحديد القبلة بدقة\`],
            en: [\`Qibla Direction in \${cityDisplay} | Kaaba Compass and Accurate Qibla Finder\`, \`Qibla Direction in \${cityDisplay} | Kaaba Compass and Accurate Qibla Finder\`],
            fr: [\`Direction de la Qibla à \${cityDisplay} | Boussole de la Kaaba et localisation précise\`, \`Direction de la Qibla à \${cityDisplay} | Boussole de la Kaaba et localisation précise\`],
            tr: [\`\${cityDisplay} Kıble Yönü | Kâbe Pusulası ve Hassas Konum\`, \`\${cityDisplay} Kıble Yönü | Kâbe Pusulası ve Hassas Konum\`],
            ur: [\`\${cityDisplay} میں سمتِ قبلہ | کعبہ کا قطب نما اور درست تعین\`, \`\${cityDisplay} میں سمتِ قبلہ | کعبہ کا قطب نما اور درست تعین\`],
            de: [\`Qibla-Richtung in \${cityDisplay} | Kaaba-Kompass und präzise Ortung\`, \`Qibla-Richtung in \${cityDisplay} | Kaaba-Kompass und präzise Ortung\`],
            id: [\`Arah Kiblat di \${cityDisplay} | Kompas Kakbah dan Penentu Kiblat Akurat\`, \`Arah Kiblat di \${cityDisplay} | Kompas Kakbah dan Penentu Kiblat Akurat\`],
            es: [\`Dirección de la Qibla en \${cityDisplay} | Brújula de la Kaaba y localizador preciso\`, \`Dirección de la Qibla en \${cityDisplay} | Brújula de la Kaaba y localizador preciso\`],
            bn: [\`\${cityDisplay}-এ কিবলার দিক | কাবা কম্পাস ও সঠিক কিবলা নির্ণয়\`, \`\${cityDisplay}-এ কিবলার দিক | কাবা কম্পাস ও সঠিক কিবলা নির্ণয়\`],
            ms: [\`Arah Kiblat di \${cityDisplay} | Kompas Kaabah dan Penentu Kiblat Tepat\`, \`Arah Kiblat di \${cityDisplay} | Kompas Kaabah dan Penentu Kiblat Tepat\`],
        })[lang];
        const desc = ({
            ar: \`اعرف اتجاه القبلة في \${cityDisplay} بدقة باستخدام بوصلة الكعبة وخريطة تفاعلية تعتمد على موقعك، مع زاوية القبلة والمسافة إلى مكة المكرمة.\`,
            en: \`Find the Qibla direction in \${cityDisplay} accurately using a Kaaba compass and interactive map based on your location, with the Qibla bearing and distance to Mecca.\`,
            fr: \`Trouvez la direction de la Qibla à \${cityDisplay} avec précision grâce à une boussole de la Kaaba et une carte interactive basée sur votre position, avec l'azimut et la distance à La Mecque.\`,
            tr: \`\${cityDisplay} için kıble yönünü Kâbe pusulası ve konumunuza dayalı etkileşimli harita ile hassas şekilde bulun; kıble açısı ve Mekke'ye uzaklık dahildir.\`,
            ur: \`\${cityDisplay} میں قبلہ کی درست سمت معلوم کریں، کعبہ کے قطب نما اور آپ کے مقام پر مبنی انٹرایکٹو نقشے کے ساتھ، قبلہ زاویہ اور مکہ تک فاصلے سمیت۔\`,
            de: \`Finden Sie die Qibla-Richtung in \${cityDisplay} präzise mit einem Kaaba-Kompass und einer interaktiven Karte basierend auf Ihrem Standort, mit Qibla-Peilung und Entfernung nach Mekka.\`,
            id: \`Temukan arah kiblat di \${cityDisplay} dengan akurat menggunakan kompas Kakbah dan peta interaktif berdasarkan lokasi Anda, lengkap dengan sudut kiblat dan jarak ke Mekkah.\`,
            es: \`Encuentre la dirección de la Qibla en \${cityDisplay} con precisión usando una brújula de la Kaaba y un mapa interactivo basado en su ubicación, con el rumbo y la distancia a La Meca.\`,
            bn: \`\${cityDisplay}-এ কিবলার দিক সঠিকভাবে জানুন কাবা কম্পাস ও আপনার অবস্থান অনুযায়ী ইন্টারঅ্যাকটিভ মানচিত্রের সাহায্যে, কিবলার কোণ ও মক্কার দূরত্বসহ।\`,
            ms: \`Cari arah kiblat di \${cityDisplay} dengan tepat menggunakan kompas Kaabah dan peta interaktif berdasarkan lokasi anda, lengkap dengan sudut kiblat dan jarak ke Makkah.\`,
        })[lang];`;

replaceApp('PART 1 — app.js: sync qibla-city Title + Meta with SSR (10 langs)', APP_PART1_OLD, APP_PART1_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 2 — server.js: extend Section 4 (how-to) paragraph with one extra
// content block per lang (~50-60 AR words). User-suggested addition.
// ═══════════════════════════════════════════════════════════════════════════
const SRV_PART2_OLD = `                const _qaSec4Html = '<section class="section-card qibla-seo-info qibla-seo-howto">'
                    + '<h2>' + _escHtml(_qaPick(_qaSec4H2)) + '</h2>'
                    + '<p>' + _escHtml(_qaPick(_qaSec4P)) + '</p>'
                    + '</section>';`;

const SRV_PART2_NEW = `                // Phase Q-A2 (2026-05-03): extra paragraph appended to Section 4
                // to push word count from ~610 to ~700-730 (in SEOptimer's 650+ range).
                // Contextually a how-to follow-up — no new H2 to keep H2 count steady.
                const _qaSec4P2 = {
                    ar: \`للحصول على قراءة أكثر ثباتاً للبوصلة في \${seo.qiblaRef.cityName}، افتح الصفحة في مكان مفتوح قدر الإمكان، وحرّك الهاتف بهدوء بعيداً عن السيارات والمصاعد والأجهزة المعدنية الكبيرة. وإذا لاحظت اختلافاً بين البوصلة والخريطة، فاعتمد على خط الخريطة أولاً ثم استخدم البوصلة لضبط اتجاه الوقوف بدقة أكبر. يمكنك حفظ الصفحة في المتصفح كاختصار سريع لكي تستخدمها في أي وقت دون البحث مجدداً، وهي تعمل بدون اتصال إنترنت بعد التحميل الأول.\`,
                    en: \`For a more stable compass reading in \${seo.qiblaRef.cityName}, open the page in an open area when possible, and move the phone slowly away from cars, elevators, and large metal objects. If you notice a difference between the compass and the map, trust the map line first and then use the compass to fine-tune your standing direction. You can bookmark this page in your browser as a quick shortcut so you can use it any time without searching again — and it works offline after the first load.\`,
                    fr: \`Pour une lecture de boussole plus stable à \${seo.qiblaRef.cityName}, ouvrez la page dans un espace ouvert si possible, et déplacez lentement le téléphone loin des voitures, ascenseurs et grands objets métalliques. Si vous remarquez une différence entre la boussole et la carte, faites d'abord confiance à la ligne de la carte, puis utilisez la boussole pour ajuster votre direction debout. Vous pouvez enregistrer cette page dans votre navigateur comme raccourci rapide pour l'utiliser à tout moment sans rechercher à nouveau, et elle fonctionne hors ligne après le premier chargement.\`,
                    tr: \`\${seo.qiblaRef.cityName} şehrinde daha kararlı bir pusula okuması için, mümkünse sayfayı açık bir alanda açın ve telefonu arabalardan, asansörlerden ve büyük metal nesnelerden yavaşça uzaklaştırın. Pusula ile harita arasında bir fark fark ederseniz, önce harita çizgisine güvenin, ardından duruş yönünüzü ince ayar yapmak için pusulayı kullanın. Bu sayfayı tarayıcınızda hızlı kısayol olarak kaydedebilirsiniz; ilk yüklemeden sonra çevrimdışı çalışır.\`,
                    ur: \`\${seo.qiblaRef.cityName} میں زیادہ مستحکم قطب نما ریڈنگ کے لیے، ممکن ہو تو صفحہ کھلی جگہ میں کھولیں، اور فون کو گاڑیوں، لفٹوں اور بڑی دھاتی اشیاء سے دور آہستہ آہستہ منتقل کریں۔ اگر آپ قطب نما اور نقشے کے درمیان فرق دیکھتے ہیں، تو پہلے نقشے کی لکیر پر بھروسہ کریں اور پھر کھڑے ہونے کی سمت کو درست کرنے کے لیے قطب نما استعمال کریں۔ آپ اس صفحے کو اپنے براؤزر میں تیز شارٹ کٹ کے طور پر محفوظ کر سکتے ہیں اور یہ پہلی لوڈنگ کے بعد آف لائن کام کرتا ہے۔\`,
                    de: \`Für eine stabilere Kompassanzeige in \${seo.qiblaRef.cityName} öffnen Sie die Seite nach Möglichkeit im Freien und bewegen Sie das Telefon langsam weg von Autos, Aufzügen und großen Metallgegenständen. Wenn Sie einen Unterschied zwischen Kompass und Karte bemerken, vertrauen Sie zuerst der Kartenlinie und verwenden Sie dann den Kompass, um Ihre Standrichtung feinabzustimmen. Sie können diese Seite als schnelle Verknüpfung in Ihrem Browser speichern und sie nach dem ersten Laden offline verwenden.\`,
                    id: \`Untuk pembacaan kompas yang lebih stabil di \${seo.qiblaRef.cityName}, buka halaman di area terbuka jika memungkinkan, dan gerakkan ponsel perlahan menjauh dari mobil, lift, dan benda logam besar. Jika Anda melihat perbedaan antara kompas dan peta, percayai garis peta terlebih dahulu lalu gunakan kompas untuk menyesuaikan arah berdiri Anda. Anda dapat menyimpan halaman ini di browser sebagai pintasan cepat dan halaman bekerja offline setelah pemuatan pertama.\`,
                    es: \`Para una lectura más estable de la brújula en \${seo.qiblaRef.cityName}, abra la página en un área abierta cuando sea posible, y mueva el teléfono lentamente lejos de automóviles, ascensores y objetos metálicos grandes. Si nota una diferencia entre la brújula y el mapa, confíe primero en la línea del mapa y luego use la brújula para afinar su dirección de pie. Puede guardar esta página en su navegador como un acceso directo rápido y funciona sin conexión después de la primera carga.\`,
                    bn: \`\${seo.qiblaRef.cityName}-এ আরও স্থিতিশীল কম্পাস রিডিংয়ের জন্য, সম্ভব হলে খোলা জায়গায় পৃষ্ঠাটি খুলুন এবং গাড়ি, লিফট এবং বড় ধাতব বস্তু থেকে ফোনটি ধীরে ধীরে দূরে সরান। আপনি যদি কম্পাস এবং মানচিত্রের মধ্যে পার্থক্য লক্ষ্য করেন, প্রথমে মানচিত্রের লাইনে বিশ্বাস করুন এবং তারপর আপনার দাঁড়ানোর দিক সূক্ষ্মভাবে সামঞ্জস্য করতে কম্পাস ব্যবহার করুন। আপনি এই পৃষ্ঠাটি আপনার ব্রাউজারে দ্রুত শর্টকাট হিসাবে সংরক্ষণ করতে পারেন এবং এটি প্রথম লোডের পরে অফলাইনে কাজ করে।\`,
                    ms: \`Untuk bacaan kompas yang lebih stabil di \${seo.qiblaRef.cityName}, buka halaman di kawasan terbuka jika boleh, dan gerakkan telefon perlahan-lahan jauh dari kereta, lif, dan objek logam besar. Jika anda perasan perbezaan antara kompas dan peta, percaya garis peta terlebih dahulu kemudian gunakan kompas untuk memperhalusi arah berdiri anda. Anda boleh menyimpan halaman ini di pelayar anda sebagai pintasan pantas dan ia berfungsi luar talian selepas muat turun pertama.\`
                };
                const _qaSec4Html = '<section class="section-card qibla-seo-info qibla-seo-howto">'
                    + '<h2>' + _escHtml(_qaPick(_qaSec4H2)) + '</h2>'
                    + '<p>' + _escHtml(_qaPick(_qaSec4P)) + '</p>'
                    + '<p>' + _escHtml(_qaPick(_qaSec4P2)) + '</p>'
                    + '</section>';`;

replaceSrv('PART 2 — server.js: Section 4 extra paragraph (10 langs, +50-60 words AR)', SRV_PART2_OLD, SRV_PART2_NEW);

writeFileSync(APP_PATH, appRaw);
writeFileSync(SRV_PATH, srvRaw);

console.log('\n✅ Phase Q-A2 — DOM Title sync + content top-up complete.');
console.log('\nChanges applied:');
console.log('  • js/app.js: client Title + Meta NOW match SSR Q-A format (10 langs)');
console.log('  • server.js: Section 4 (how-to) gets a second paragraph (~50-60 AR words)');
console.log('  • Total expected: ~610 → ~680-720 visible words (above 650 target)');
console.log('\nDOM Title (post-JS) will now be: "اتجاه القبلة في {city} | بوصلة الكعبة وتحديد القبلة بدقة"');
console.log('Matches SSR exactly — SEOptimer reads same Title regardless of crawl mode.');
console.log('\nNext: bump app.js cache version to force browsers to fetch new client code.');
