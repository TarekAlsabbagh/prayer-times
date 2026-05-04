// Phase Q-A6 — Final Content Threshold Top-up.
//
// Post-Q-A5 SEOptimer state on /qibla-in-{city}:
//   ✅ Keyword Consistency — green
//   ✅ Title / Meta / H1 — green
//   ❌ Amount of Content — 878 words (still under SEOptimer's practical
//      threshold for this page; it's apparently closer to 1000+ words)
//
// Per user spec (Q-A6 ONLY — NO Q-B/Q-C):
//   • Add 180-220 visible SSR words → ~1,050-1,120 total
//   • DO NOT touch Title/Meta/H1
//   • DO NOT change keyword distribution (Keyword Consistency now green)
//   • Use H3 (not H2) — keep H2 count steady
//   • Add a "Notes" block inside same wrapper, AFTER the grid
//   • Focus keywords (preserve KC): اتجاه القبلة، القبلة، زاوية القبلة،
//     مكة المكرمة، البوصلة، الخريطة، المدينة
//   • AVOID heavy mention of: مواقيت الصلاة، التاريخ الهجري، القمر
//     (those are competing-page keywords — KC went green by reducing them)
//
// Implementation:
//   PART 1 (server.js):
//     • Add 3 new 10-lang dicts: _qaNoteH3, _qaNoteP1, _qaNoteP2
//     • Build _qaNoteHtml block: <div class="qibla-seo-note"><h3>...</h3>
//                                <p>P1</p><p>P2</p></div>
//     • Append _qaNoteHtml inside the wrapper, AFTER _qaCard4Html closing
//   PART 2 (css/style.css): add styling for .qibla-seo-note
//   PART 3 (index.html): bump style.css?v=249 → v=250
//
// Word count expectation:
//   AR: ~180-200 words added (P1 ~85 + P2 ~95)
//   Total per AR page: 878 → ~1,060 ✅

import { readFileSync, writeFileSync } from 'node:fs';

const SRV_PATH  = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';
const CSS_PATH  = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\css\\style.css';
const HTML_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\index.html';

let srvRaw  = readFileSync(SRV_PATH, 'utf8');
let cssRaw  = readFileSync(CSS_PATH, 'utf8');
let htmlRaw = readFileSync(HTML_PATH, 'utf8');

const isCRLFsrv  = /\r\n/.test(srvRaw);
const isCRLFcss  = /\r\n/.test(cssRaw);
const isCRLFhtml = /\r\n/.test(htmlRaw);

if (/Phase Q-A6 \(2026-05-03\)/.test(srvRaw)) {
    throw new Error('[server.js] Q-A6 already applied');
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

const replaceSrv  = makeReplacer(() => srvRaw,  v => srvRaw  = v, isCRLFsrv);
const replaceCss  = makeReplacer(() => cssRaw,  v => cssRaw  = v, isCRLFcss);
const replaceHtml = makeReplacer(() => htmlRaw, v => htmlRaw = v, isCRLFhtml);

// ═══════════════════════════════════════════════════════════════════════════
// PART 1 — server.js: add note block dicts + insert into wrapper after grid.
// Anchor: the wrapper builder closing pattern.
// ═══════════════════════════════════════════════════════════════════════════
const SRV_OLD = `                // Wrapper with header (kicker + H2 + intro) + grid (4 cards)
                const _qaSec1Html = '<section class="qibla-seo-info-wrap" id="qibla-seo-info-wrap">'
                    + '<header class="qibla-seo-header">'
                    + '<span class="qibla-seo-kicker">' + _escHtml(_qaPick(_qaKicker)) + '</span>'
                    + '<h2>' + _escHtml(_qaPick(_qaWrapH2)) + '</h2>'
                    + '<p class="qibla-seo-intro">' + _escHtml(_qaPick(_qaWrapIntro)) + '</p>'
                    + '</header>'
                    + '<div class="qibla-seo-info-grid">'
                    + _qaCard1Html + _qaCard2Html + _qaCard3Html + _qaCard4Html
                    + '</div>'
                    + '</section>';`;

const SRV_NEW = `                // Phase Q-A6 (2026-05-03): "Notes" block — H3 (not H2) + 2 paragraphs
                // appended INSIDE wrapper AFTER the grid. Adds ~180-200 AR words to push
                // total from 878 → ~1,060 (above SEOptimer's practical threshold).
                // Focus keywords preserved (Keyword Consistency stays green): القبلة،
                // اتجاه القبلة، زاوية القبلة، مكة المكرمة، البوصلة، الخريطة، المدينة.
                // NO new H2 — H3 keeps the hierarchy clean and H2 count steady.
                const _qaNoteH3 = {
                    ar: \`ملاحظات مهمة قبل الاعتماد على اتجاه القبلة في \${seo.qiblaRef.cityName}\`,
                    en: \`Important Notes Before Relying on the Qibla Direction in \${seo.qiblaRef.cityName}\`,
                    fr: \`Notes importantes avant de se fier à la direction de la Qibla à \${seo.qiblaRef.cityName}\`,
                    tr: \`\${seo.qiblaRef.cityName}'de Kıble Yönüne Güvenmeden Önce Önemli Notlar\`,
                    ur: \`\${seo.qiblaRef.cityName} میں قبلہ کی سمت پر اعتماد کرنے سے پہلے اہم نوٹس\`,
                    de: \`Wichtige Hinweise, bevor Sie sich auf die Qibla-Richtung in \${seo.qiblaRef.cityName} verlassen\`,
                    id: \`Catatan Penting Sebelum Mengandalkan Arah Kiblat di \${seo.qiblaRef.cityName}\`,
                    es: \`Notas importantes antes de confiar en la dirección de la Qibla en \${seo.qiblaRef.cityName}\`,
                    bn: \`\${seo.qiblaRef.cityName}-এ কিবলার দিকে নির্ভর করার আগে গুরুত্বপূর্ণ নোট\`,
                    ms: \`Nota Penting Sebelum Bergantung pada Arah Kiblat di \${seo.qiblaRef.cityName}\`
                };
                const _qaNoteP1 = {
                    ar: \`قبل الاعتماد النهائي على اتجاه القبلة، تأكد من أن اسم المدينة الظاهر في الصفحة يطابق موقعك الفعلي أو أقرب مدينة لك. في بعض الحالات قد تكون داخل ضاحية أو منطقة قريبة من \${seo.qiblaRef.cityName}، لذلك تبقى النتيجة مناسبة للصلاة غالباً، لكن السماح بتحديد الموقع يعطي قراءة أدق للزاوية والمسافة. إذا كنت في مكان مفتوح، يمكنك مقارنة خط الاتجاه على الخريطة مع اتجاه الشوارع أو المباني القريبة، ثم استخدام البوصلة لضبط الوقوف نحو مكة المكرمة بثبات أكبر.\`,
                    en: \`Before relying definitively on the Qibla direction, make sure the city name shown on the page matches your actual location or the nearest city to you. In some cases you may be in a suburb or area near \${seo.qiblaRef.cityName}, so the result remains generally suitable for prayer, but allowing location detection gives a more accurate reading of the bearing and distance. If you are in an open area, you can compare the direction line on the map with the orientation of nearby streets or buildings, then use the compass to align your standing position toward Mecca with greater stability.\`,
                    fr: \`Avant de vous fier définitivement à la direction de la Qibla, assurez-vous que le nom de la ville affiché sur la page correspond à votre emplacement réel ou à la ville la plus proche. Dans certains cas, vous pouvez être dans une banlieue ou une zone proche de \${seo.qiblaRef.cityName}, le résultat reste donc généralement adapté à la prière, mais autoriser la détection de localisation donne une lecture plus précise de l'azimut et de la distance. Si vous êtes en plein air, vous pouvez comparer la ligne de direction sur la carte avec l'orientation des rues ou des bâtiments à proximité, puis utiliser la boussole pour ajuster votre position vers La Mecque avec plus de stabilité.\`,
                    tr: \`Kıble yönüne kesin olarak güvenmeden önce, sayfada gösterilen şehir adının gerçek konumunuzla veya size en yakın şehirle eşleştiğinden emin olun. Bazı durumlarda \${seo.qiblaRef.cityName} yakınlarındaki bir banliyö veya bölgede olabilirsiniz, bu nedenle sonuç genellikle namaz için uygun kalır, ancak konum tespitine izin vermek, açı ve mesafenin daha doğru okunmasını sağlar. Açık bir alandaysanız, haritadaki yön çizgisini yakındaki sokakların veya binaların yönelimi ile karşılaştırabilir, ardından duruş pozisyonunuzu Mekke'ye doğru daha kararlı bir şekilde hizalamak için pusulayı kullanabilirsiniz.\`,
                    ur: \`قبلہ کی سمت پر حتمی اعتماد کرنے سے پہلے، یقینی بنائیں کہ صفحے پر دکھایا گیا شہر کا نام آپ کے حقیقی مقام یا آپ کے قریب ترین شہر سے میل کھاتا ہے۔ کچھ معاملات میں آپ \${seo.qiblaRef.cityName} کے قریب کسی مضافاتی علاقے یا علاقے میں ہو سکتے ہیں، اس لیے نتیجہ عام طور پر نماز کے لیے مناسب رہتا ہے، لیکن مقام کا پتہ لگانے کی اجازت دینا زاویہ اور فاصلے کی زیادہ درست ریڈنگ دیتا ہے۔ اگر آپ کھلی جگہ میں ہیں، تو آپ نقشے پر سمت کی لکیر کا قریبی سڑکوں یا عمارتوں کی سمت سے موازنہ کر سکتے ہیں، پھر مکہ مکرمہ کی طرف کھڑے ہونے کی پوزیشن کو زیادہ استحکام کے ساتھ ترتیب دینے کے لیے قطب نما استعمال کر سکتے ہیں۔\`,
                    de: \`Bevor Sie sich endgültig auf die Qibla-Richtung verlassen, stellen Sie sicher, dass der auf der Seite angezeigte Stadtname mit Ihrem tatsächlichen Standort oder der nächstgelegenen Stadt übereinstimmt. In einigen Fällen befinden Sie sich möglicherweise in einem Vorort oder einem Gebiet in der Nähe von \${seo.qiblaRef.cityName}, daher bleibt das Ergebnis für das Gebet im Allgemeinen geeignet, aber das Zulassen der Standorterkennung liefert eine genauere Ablesung der Peilung und Entfernung. Wenn Sie sich im Freien befinden, können Sie die Richtungslinie auf der Karte mit der Ausrichtung der nahe gelegenen Straßen oder Gebäude vergleichen und dann den Kompass verwenden, um Ihre Standposition mit größerer Stabilität nach Mekka auszurichten.\`,
                    id: \`Sebelum mengandalkan arah kiblat secara definitif, pastikan nama kota yang ditampilkan di halaman cocok dengan lokasi sebenarnya atau kota terdekat dengan Anda. Dalam beberapa kasus Anda mungkin berada di pinggiran atau area dekat \${seo.qiblaRef.cityName}, sehingga hasilnya tetap secara umum sesuai untuk salat, tetapi mengizinkan deteksi lokasi memberikan pembacaan sudut dan jarak yang lebih akurat. Jika Anda berada di area terbuka, Anda dapat membandingkan garis arah di peta dengan orientasi jalan atau bangunan terdekat, lalu menggunakan kompas untuk menyelaraskan posisi berdiri Anda menuju Mekkah dengan stabilitas lebih besar.\`,
                    es: \`Antes de confiar definitivamente en la dirección de la Qibla, asegúrese de que el nombre de la ciudad mostrado en la página coincida con su ubicación real o la ciudad más cercana a usted. En algunos casos puede estar en un suburbio o área cerca de \${seo.qiblaRef.cityName}, por lo que el resultado sigue siendo generalmente adecuado para la oración, pero permitir la detección de ubicación da una lectura más precisa del rumbo y la distancia. Si está en un área abierta, puede comparar la línea de dirección en el mapa con la orientación de las calles o edificios cercanos, luego use la brújula para alinear su posición de pie hacia La Meca con mayor estabilidad.\`,
                    bn: \`কিবলার দিকের উপর চূড়ান্তভাবে নির্ভর করার আগে, নিশ্চিত করুন যে পৃষ্ঠায় দেখানো শহরের নাম আপনার প্রকৃত অবস্থান বা আপনার নিকটতম শহরের সাথে মেলে। কিছু ক্ষেত্রে আপনি \${seo.qiblaRef.cityName}-এর কাছাকাছি একটি শহরতলিতে বা এলাকায় থাকতে পারেন, তাই ফলাফল সাধারণত নামাজের জন্য উপযুক্ত থাকে, কিন্তু অবস্থান সনাক্তকরণের অনুমতি দেওয়া কোণ এবং দূরত্বের আরও সঠিক রিডিং দেয়। আপনি যদি একটি খোলা এলাকায় থাকেন, আপনি মানচিত্রে দিকনির্দেশনা রেখাটি কাছাকাছি রাস্তা বা ভবনের অভিমুখের সাথে তুলনা করতে পারেন, তারপর মক্কার দিকে আপনার দাঁড়ানোর অবস্থান আরও স্থিতিশীলভাবে সারিবদ্ধ করতে কম্পাস ব্যবহার করতে পারেন।\`,
                    ms: \`Sebelum bergantung secara muktamad pada arah kiblat, pastikan nama bandar yang dipaparkan pada halaman sepadan dengan lokasi sebenar anda atau bandar terdekat dengan anda. Dalam beberapa kes anda mungkin berada di pinggir bandar atau kawasan berdekatan \${seo.qiblaRef.cityName}, jadi hasilnya kekal umumnya sesuai untuk solat, tetapi membenarkan pengesanan lokasi memberikan bacaan sudut dan jarak yang lebih tepat. Jika anda berada di kawasan terbuka, anda boleh membandingkan garisan arah pada peta dengan orientasi jalan atau bangunan berdekatan, kemudian gunakan kompas untuk menjajarkan kedudukan berdiri anda ke arah Makkah dengan lebih stabil.\`
                };
                const _qaNoteP2 = {
                    ar: \`عند السفر أو الإقامة في فندق أو مكتب جديد، من الأفضل فتح الصفحة مرة واحدة بعد استقرار اتصال الإنترنت والموقع، ثم حفظ الرابط للعودة إليه بسرعة. وجود زاوية القبلة، والمسافة إلى مكة المكرمة، واسم المدينة في نفس الصفحة يساعدك على فهم النتيجة بدلاً من الاعتماد على مؤشر البوصلة وحده. وإذا ظهرت قراءة مختلفة قليلاً بين جهاز وآخر، فغالباً يكون السبب من حساس الاتجاه أو وجود معادن قريبة، وليس من حساب اتجاه القبلة نفسه.\`,
                    en: \`When traveling or staying in a new hotel or office, it is best to open the page once after the internet connection and location have stabilized, then save the link to return to it quickly. Having the Qibla bearing, the distance to Mecca, and the city name on the same page helps you understand the result instead of relying on the compass indicator alone. If a slightly different reading appears between one device and another, the cause is usually the orientation sensor or nearby metals, not the Qibla direction calculation itself.\`,
                    fr: \`Lorsque vous voyagez ou séjournez dans un nouvel hôtel ou bureau, il est préférable d'ouvrir la page une fois après que la connexion Internet et la localisation se soient stabilisées, puis d'enregistrer le lien pour y revenir rapidement. Avoir l'azimut de la Qibla, la distance à La Mecque et le nom de la ville sur la même page vous aide à comprendre le résultat au lieu de vous fier uniquement à l'indicateur de la boussole. Si une lecture légèrement différente apparaît entre un appareil et un autre, la cause est généralement le capteur d'orientation ou des métaux à proximité, et non le calcul de la direction de la Qibla lui-même.\`,
                    tr: \`Yeni bir otel veya ofiste seyahat ederken veya kalırken, internet bağlantısı ve konum stabilize olduktan sonra sayfayı bir kez açmak, ardından hızlıca geri dönmek için bağlantıyı kaydetmek en iyisidir. Aynı sayfada kıble açısı, Mekke'ye olan mesafe ve şehir adının bulunması, yalnızca pusula göstergesine güvenmek yerine sonucu anlamanıza yardımcı olur. Bir cihazla diğeri arasında biraz farklı bir okuma görünürse, neden genellikle yönelim sensörü veya yakındaki metallerdir, kıble yönü hesaplamasının kendisi değil.\`,
                    ur: \`نئے ہوٹل یا دفتر میں سفر یا قیام کے دوران، انٹرنیٹ کنکشن اور مقام کے مستحکم ہونے کے بعد صفحہ ایک بار کھولنا، پھر تیزی سے واپس آنے کے لیے لنک محفوظ کرنا بہترین ہے۔ ایک ہی صفحے پر قبلہ کا زاویہ، مکہ تک فاصلہ اور شہر کا نام موجود ہونا آپ کو نتیجہ سمجھنے میں مدد کرتا ہے بجائے اس کے کہ صرف قطب نما کے اشارے پر بھروسہ کریں۔ اگر ایک آلے اور دوسرے کے درمیان قدرے مختلف ریڈنگ ظاہر ہوتی ہے، تو وجہ عام طور پر اوریئنٹیشن سینسر یا قریبی دھاتیں ہیں، نہ کہ قبلہ کی سمت کا حساب۔\`,
                    de: \`Beim Reisen oder Aufenthalt in einem neuen Hotel oder Büro ist es am besten, die Seite einmal zu öffnen, nachdem sich die Internetverbindung und der Standort stabilisiert haben, und dann den Link zu speichern, um schnell darauf zurückgreifen zu können. Die Qibla-Peilung, die Entfernung nach Mekka und der Stadtname auf derselben Seite helfen Ihnen, das Ergebnis zu verstehen, anstatt sich nur auf die Kompassanzeige zu verlassen. Wenn zwischen einem Gerät und einem anderen eine leicht abweichende Anzeige erscheint, liegt die Ursache normalerweise am Orientierungssensor oder an nahegelegenen Metallen, nicht an der Qibla-Richtungsberechnung selbst.\`,
                    id: \`Saat bepergian atau menginap di hotel atau kantor baru, sebaiknya buka halaman satu kali setelah koneksi internet dan lokasi stabil, lalu simpan tautan untuk kembali ke sana dengan cepat. Memiliki sudut kiblat, jarak ke Mekkah, dan nama kota pada halaman yang sama membantu Anda memahami hasilnya daripada hanya mengandalkan indikator kompas. Jika muncul pembacaan yang sedikit berbeda antara satu perangkat dan perangkat lain, penyebabnya biasanya adalah sensor orientasi atau logam terdekat, bukan perhitungan arah kiblat itu sendiri.\`,
                    es: \`Cuando viaje o se hospede en un nuevo hotel u oficina, es mejor abrir la página una vez después de que la conexión a Internet y la ubicación se hayan estabilizado, luego guardar el enlace para regresar rápidamente. Tener el rumbo de la Qibla, la distancia a La Meca y el nombre de la ciudad en la misma página le ayuda a comprender el resultado en lugar de depender solo del indicador de la brújula. Si aparece una lectura ligeramente diferente entre un dispositivo y otro, la causa suele ser el sensor de orientación o metales cercanos, no el cálculo de la dirección de la Qibla en sí.\`,
                    bn: \`একটি নতুন হোটেল বা অফিসে ভ্রমণ বা থাকার সময়, ইন্টারনেট সংযোগ এবং অবস্থান স্থিতিশীল হওয়ার পরে একবার পৃষ্ঠাটি খুলে তারপর দ্রুত ফিরে আসার জন্য লিঙ্কটি সংরক্ষণ করা সর্বোত্তম। একই পৃষ্ঠায় কিবলার কোণ, মক্কার দূরত্ব, এবং শহরের নাম থাকা কেবল কম্পাস সূচকের উপর নির্ভর করার পরিবর্তে ফলাফল বুঝতে সাহায্য করে। যদি একটি ডিভাইস এবং অন্যটির মধ্যে সামান্য ভিন্ন রিডিং দেখা যায়, তবে কারণটি সাধারণত ওরিয়েন্টেশন সেন্সর বা কাছাকাছি ধাতু, কিবলার দিকনির্দেশনা গণনা নিজে থেকে নয়।\`,
                    ms: \`Apabila bermusafir atau menginap di hotel atau pejabat baru, adalah lebih baik untuk membuka halaman sekali selepas sambungan internet dan lokasi stabil, kemudian simpan pautan untuk kembali kepadanya dengan cepat. Memiliki sudut kiblat, jarak ke Makkah, dan nama bandar pada halaman yang sama membantu anda memahami hasilnya berbanding bergantung pada penunjuk kompas sahaja. Jika bacaan yang sedikit berbeza muncul antara satu peranti dan peranti lain, puncanya biasanya adalah sensor orientasi atau logam berdekatan, bukan pengiraan arah kiblat itu sendiri.\`
                };
                const _qaNoteHtml = '<div class="qibla-seo-note">'
                    + '<h3>' + _escHtml(_qaPick(_qaNoteH3)) + '</h3>'
                    + '<p>' + _escHtml(_qaPick(_qaNoteP1)) + '</p>'
                    + '<p>' + _escHtml(_qaPick(_qaNoteP2)) + '</p>'
                    + '</div>';

                // Wrapper with header (kicker + H2 + intro) + grid (4 cards) + Q-A6 note block
                const _qaSec1Html = '<section class="qibla-seo-info-wrap" id="qibla-seo-info-wrap">'
                    + '<header class="qibla-seo-header">'
                    + '<span class="qibla-seo-kicker">' + _escHtml(_qaPick(_qaKicker)) + '</span>'
                    + '<h2>' + _escHtml(_qaPick(_qaWrapH2)) + '</h2>'
                    + '<p class="qibla-seo-intro">' + _escHtml(_qaPick(_qaWrapIntro)) + '</p>'
                    + '</header>'
                    + '<div class="qibla-seo-info-grid">'
                    + _qaCard1Html + _qaCard2Html + _qaCard3Html + _qaCard4Html
                    + '</div>'
                    + _qaNoteHtml
                    + '</section>';`;

replaceSrv('PART 1 — server.js: add note block (10 langs) inside wrapper', SRV_OLD, SRV_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 2 — css/style.css: add styling for the .qibla-seo-note block.
// ═══════════════════════════════════════════════════════════════════════════
const CSS_ANCHOR = `@media (max-width: 768px) {
    .qibla-seo-card-howto p {
        padding-inline-start: 32px;
    }
    .qibla-seo-card-howto p::before {
        width: 22px;
        height: 22px;
        font-size: 0.78rem;
    }
}

`;

const CSS_NEW_BLOCK = `@media (max-width: 768px) {
    .qibla-seo-card-howto p {
        padding-inline-start: 32px;
    }
    .qibla-seo-card-howto p::before {
        width: 22px;
        height: 22px;
        font-size: 0.78rem;
    }
}

/* Phase Q-A6 (2026-05-03): "Notes" block at the bottom of qibla-seo-info-wrap.
   Full-width inside the wrapper (NOT in the 2-col grid) — gives a distinct
   "important note" feel. Soft amber/yellow accent stripe distinguishes it
   from the green cards (different visual class). H3 (no new H2). */
.qibla-seo-note {
    margin-top: 20px;
    padding: 22px 22px 20px;
    background: linear-gradient(180deg, #fffaf0 0%, #fff7e6 100%);
    border: 1px solid rgba(217, 119, 6, 0.20);
    border-radius: 18px;
    box-shadow: 0 6px 20px rgba(120, 80, 0, 0.05);
    position: relative;
    overflow: hidden;
}
.qibla-seo-note::before {
    content: "";
    position: absolute;
    inset-inline-start: 0;
    top: 22px;
    width: 4px;
    height: 44px;
    border-radius: 0 999px 999px 0;
    background: #d97706;
}
html[dir="rtl"] .qibla-seo-note::before,
html[lang="ar"] .qibla-seo-note::before,
html[lang="ur"] .qibla-seo-note::before {
    border-radius: 999px 0 0 999px;
}
.qibla-seo-note h3 {
    margin: 0 0 14px;
    font-size: 1.1rem;
    line-height: 1.5;
    color: #92400e;
    font-weight: 700;
}
.qibla-seo-note p {
    margin: 0 0 12px;
    font-size: 0.94rem;
    line-height: 1.85;
    color: #5b4530;
}
.qibla-seo-note p:last-child {
    margin-bottom: 0;
}
@media (max-width: 768px) {
    .qibla-seo-note {
        padding: 18px 16px 16px;
    }
}

`;

replaceCss('PART 2 — Add Q-A6 CSS for .qibla-seo-note block', CSS_ANCHOR, CSS_NEW_BLOCK);

// ═══════════════════════════════════════════════════════════════════════════
// PART 3 — index.html: bump style.css cache version (v=249 → v=250).
// ═══════════════════════════════════════════════════════════════════════════
function replaceAllInHtml(label, oldStr, newStr, expectCount) {
    const cnt = htmlRaw.split(oldStr).length - 1;
    if (cnt !== expectCount) throw new Error(`[${label}] expected ${expectCount}, got ${cnt}`);
    htmlRaw = htmlRaw.split(oldStr).join(newStr);
    console.log(`✓ ${label} (${cnt} occurrences)`);
}
replaceAllInHtml('PART 3 — Bump style.css?v=249 → v=250', 'style.css?v=249', 'style.css?v=250', 2);

writeFileSync(SRV_PATH, srvRaw);
writeFileSync(CSS_PATH, cssRaw);
writeFileSync(HTML_PATH, htmlRaw);

console.log('\n✅ Phase Q-A6 — Final content top-up complete.');
console.log('Notes block added to qibla-seo-info-wrap with H3 + 2 paragraphs (10 langs).');
console.log('Expected word count: ~878 → ~1,060 (above SEOptimer threshold).');
console.log('Visual: amber/orange accent (distinct from green cards) — note style.');
