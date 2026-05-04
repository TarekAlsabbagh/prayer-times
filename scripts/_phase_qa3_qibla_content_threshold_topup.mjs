// Phase Q-A3 — Qibla Content Threshold Top-up.
//
// Post-Q-A2 word count = 678 (browser DOM), but SEOptimer still flags
// "Amount of Content" — its practical threshold for this page appears to
// be near 800 words. User-approved Q-A3 strategy: add 180-220 visible
// SSR words to push total to ~850-900.
//
// Per user spec (Q-A3 ONLY — no other changes):
//   • /qibla-in-{city} ONLY
//   • DO NOT touch Title/Meta/H1/H2 count/Performance/CLS/Hub/moon/hijri
//   • Add content INSIDE existing Section 4 (qibla-seo-howto) — no new H2
//   • Two more <p> blocks per lang (~120 words + ~70 words)
//
// Implementation: add _qaSec4P3 + _qaSec4P4 dictionaries (10 langs each),
// append two more <p> blocks to the existing Section 4 builder.

import { readFileSync, writeFileSync } from 'node:fs';

const SRV_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';
let raw = readFileSync(SRV_PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);

if (/Phase Q-A3 \(2026-05-03\)/.test(raw)) {
    throw new Error('[server.js] Q-A3 already applied');
}

function lfToEol(s) { return isCRLF ? s.replace(/\r?\n/g, '\r\n') : s; }

function replaceOnce(label, oldStr, newStr) {
    const oldNorm = lfToEol(oldStr);
    const newNorm = lfToEol(newStr);
    const cnt = raw.split(oldNorm).length - 1;
    if (cnt !== 1) throw new Error(`[${label}] expected 1 anchor match, got ${cnt}`);
    raw = raw.replace(oldNorm, newNorm);
    console.log(`✓ ${label}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// Replace the Section 4 builder (which currently has 2 <p> blocks from Q-A2)
// to also include _qaSec4P3 + _qaSec4P4 + their dictionaries.
// ═══════════════════════════════════════════════════════════════════════════
const QA3_OLD = `                const _qaSec4Html = '<section class="section-card qibla-seo-info qibla-seo-howto">'
                    + '<h2>' + _escHtml(_qaPick(_qaSec4H2)) + '</h2>'
                    + '<p>' + _escHtml(_qaPick(_qaSec4P)) + '</p>'
                    + '<p>' + _escHtml(_qaPick(_qaSec4P2)) + '</p>'
                    + '</section>';`;

const QA3_NEW = `                // Phase Q-A3 (2026-05-03): added two more <p> blocks inside Section 4
                // to push word count from ~678 to ~850-900 (SEOptimer practical threshold).
                // No new H2 — keeps H2 count steady while adding ~180-220 AR words.
                const _qaSec4P3 = {
                    ar: \`عند استخدام بوصلة القبلة في \${seo.qiblaRef.cityName} أو في أي مدينة أخرى، تذكّر أن دقة النتيجة تعتمد على عاملين رئيسيين: دقة موقعك الجغرافي، واستقرار حساس الاتجاه في الهاتف. لذلك من الأفضل تحديث الموقع مرة واحدة بعد فتح الصفحة، ثم تثبيت الجهاز على سطح مستوٍ قبل قراءة زاوية القبلة. إذا كنت داخل مبنى مرتفع أو قريباً من أجهزة كهربائية أو هياكل معدنية، فقد تظهر قراءة متذبذبة؛ في هذه الحالة استخدم الخريطة كمرجع بصري، ثم قارنها باتجاه الشوارع أو المعالم القريبة حولك. تساعدك هذه الطريقة على تحديد اتجاه الصلاة بثقة أكبر، خصوصاً عند السفر أو عند الصلاة في مكان جديد لا توجد فيه علامات واضحة لاتجاه القبلة.\`,
                    en: \`When using the Qibla compass in \${seo.qiblaRef.cityName} or any other city, remember that result accuracy depends on two main factors: the precision of your geographic location and the stability of the device's orientation sensor. It is best to refresh the location once after opening the page, then place the device on a flat surface before reading the Qibla bearing. If you are inside a tall building or near electrical equipment or metal structures, the reading may fluctuate; in that case, use the map as a visual reference, then compare it with the orientation of nearby streets or landmarks around you. This approach helps you determine the prayer direction with greater confidence, especially when traveling or praying in a new place without clear Qibla markers.\`,
                    fr: \`Lors de l'utilisation de la boussole de la Qibla à \${seo.qiblaRef.cityName} ou dans toute autre ville, rappelez-vous que la précision du résultat dépend de deux facteurs principaux : la précision de votre position géographique et la stabilité du capteur d'orientation de l'appareil. Il est préférable d'actualiser la position une fois après avoir ouvert la page, puis de poser l'appareil sur une surface plane avant de lire l'azimut de la Qibla. Si vous êtes dans un grand bâtiment ou près d'équipements électriques ou de structures métalliques, la lecture peut fluctuer ; dans ce cas, utilisez la carte comme référence visuelle, puis comparez-la avec l'orientation des rues ou des points de repère à proximité.\`,
                    tr: \`\${seo.qiblaRef.cityName} şehrinde veya başka bir şehirde kıble pusulasını kullanırken, sonuç doğruluğunun iki ana faktöre bağlı olduğunu unutmayın: coğrafi konumunuzun hassasiyeti ve cihazın yönelim sensörünün kararlılığı. Sayfa açıldıktan sonra konumu bir kez yenilemek, ardından cihazı düz bir yüzeye yerleştirip kıble açısını okumak en iyisidir. Yüksek bir binadasanız veya elektrikli ekipmanlara veya metal yapılara yakınsanız, okuma dalgalanabilir; bu durumda haritayı görsel referans olarak kullanın, ardından yakındaki sokakların veya simgelerin yönüyle karşılaştırın. Bu yaklaşım, özellikle seyahat ederken veya yeni bir yerde namaz kılarken namaz yönünü daha güvenle belirlemenize yardımcı olur.\`,
                    ur: \`\${seo.qiblaRef.cityName} میں یا کسی دوسرے شہر میں قبلہ نما استعمال کرتے وقت، یاد رکھیں کہ نتیجے کی درستگی دو اہم عوامل پر منحصر ہے: آپ کے جغرافیائی مقام کی درستگی، اور آلے کے اوریئنٹیشن سینسر کی استحکام۔ لہذا صفحہ کھولنے کے بعد ایک بار مقام کو ریفریش کرنا، پھر قبلہ زاویہ پڑھنے سے پہلے آلے کو ہموار سطح پر رکھنا بہترین ہے۔ اگر آپ بلند عمارت میں ہیں یا برقی آلات یا دھاتی ڈھانچوں کے قریب ہیں، تو ریڈنگ متغیر ہو سکتی ہے؛ ایسی صورت میں نقشے کو بصری حوالہ کے طور پر استعمال کریں، پھر اپنے ارد گرد قریبی سڑکوں یا نشانیوں کی سمت سے موازنہ کریں۔ یہ طریقہ آپ کو نماز کی سمت زیادہ اعتماد کے ساتھ متعین کرنے میں مدد کرتا ہے۔\`,
                    de: \`Wenn Sie den Qibla-Kompass in \${seo.qiblaRef.cityName} oder in einer anderen Stadt verwenden, denken Sie daran, dass die Genauigkeit des Ergebnisses von zwei Hauptfaktoren abhängt: der Präzision Ihres geografischen Standorts und der Stabilität des Orientierungssensors des Geräts. Es ist am besten, den Standort einmal nach dem Öffnen der Seite zu aktualisieren und dann das Gerät auf einer ebenen Fläche zu platzieren, bevor Sie die Qibla-Peilung ablesen. Wenn Sie sich in einem hohen Gebäude oder in der Nähe von elektrischen Geräten oder Metallstrukturen befinden, kann die Anzeige schwanken; verwenden Sie in diesem Fall die Karte als visuelle Referenz und vergleichen Sie sie mit der Ausrichtung der Straßen oder Wahrzeichen in der Nähe.\`,
                    id: \`Saat menggunakan kompas kiblat di \${seo.qiblaRef.cityName} atau kota lain, ingatlah bahwa akurasi hasil bergantung pada dua faktor utama: ketepatan lokasi geografis Anda dan stabilitas sensor orientasi perangkat. Sebaiknya segarkan lokasi sekali setelah membuka halaman, kemudian letakkan perangkat di permukaan datar sebelum membaca sudut kiblat. Jika Anda berada di gedung tinggi atau dekat peralatan listrik atau struktur logam, pembacaan mungkin berfluktuasi; dalam kasus tersebut, gunakan peta sebagai referensi visual, lalu bandingkan dengan orientasi jalan atau penanda terdekat di sekitar Anda. Pendekatan ini membantu Anda menentukan arah salat dengan lebih percaya diri, terutama saat bepergian atau salat di tempat baru tanpa penanda kiblat yang jelas.\`,
                    es: \`Al usar la brújula de la Qibla en \${seo.qiblaRef.cityName} o en cualquier otra ciudad, recuerde que la precisión del resultado depende de dos factores principales: la precisión de su ubicación geográfica y la estabilidad del sensor de orientación del dispositivo. Es mejor actualizar la ubicación una vez después de abrir la página, luego colocar el dispositivo en una superficie plana antes de leer el rumbo de la Qibla. Si está dentro de un edificio alto o cerca de equipos eléctricos o estructuras metálicas, la lectura puede fluctuar; en ese caso, use el mapa como referencia visual, luego compárelo con la orientación de las calles o puntos de referencia cercanos a su alrededor.\`,
                    bn: \`\${seo.qiblaRef.cityName}-এ বা অন্য কোনো শহরে কিবলা কম্পাস ব্যবহার করার সময়, মনে রাখবেন যে ফলাফলের নির্ভুলতা দুটি প্রধান কারণের উপর নির্ভর করে: আপনার ভৌগোলিক অবস্থানের নির্ভুলতা এবং ডিভাইসের ওরিয়েন্টেশন সেন্সরের স্থিতিশীলতা। তাই পৃষ্ঠা খোলার পরে একবার অবস্থান রিফ্রেশ করা, তারপর কিবলার কোণ পড়ার আগে ডিভাইসটি একটি সমতল পৃষ্ঠে রাখা সর্বোত্তম। আপনি যদি একটি উঁচু ভবনে বা বৈদ্যুতিক সরঞ্জাম বা ধাতব কাঠামোর কাছে থাকেন, তবে রিডিং ওঠানামা করতে পারে; সেই ক্ষেত্রে, মানচিত্রটি ভিজ্যুয়াল রেফারেন্স হিসাবে ব্যবহার করুন, তারপর আপনার চারপাশের কাছাকাছি রাস্তাগুলির বা ল্যান্ডমার্কগুলির অভিমুখের সাথে তুলনা করুন।\`,
                    ms: \`Apabila menggunakan kompas kiblat di \${seo.qiblaRef.cityName} atau di mana-mana bandar lain, ingatlah bahawa ketepatan hasil bergantung pada dua faktor utama: ketepatan lokasi geografi anda dan kestabilan sensor orientasi peranti. Adalah lebih baik untuk menyegarkan lokasi sekali selepas membuka halaman, kemudian meletakkan peranti pada permukaan rata sebelum membaca sudut kiblat. Jika anda berada di dalam bangunan tinggi atau berhampiran peralatan elektrik atau struktur logam, bacaan mungkin berubah-ubah; dalam kes itu, gunakan peta sebagai rujukan visual, kemudian bandingkan dengan orientasi jalan atau mercu tanda berdekatan di sekeliling anda. Pendekatan ini membantu anda menentukan arah solat dengan lebih yakin.\`
                };
                const _qaSec4P4 = {
                    ar: \`كما يمكنك حفظ صفحة اتجاه القبلة للمدينة التي تزورها كثيراً، مثل \${seo.qiblaRef.cityName} أو مكة المكرمة، والرجوع إليها بسرعة عند الحاجة. وجود زاوية القبلة والمسافة إلى مكة المكرمة بجانب البوصلة يجعل النتيجة أسهل للفهم، لأنك لا تعتمد على المؤشر فقط، بل ترى أيضاً البيانات التي تشرح سبب هذا الاتجاه.\`,
                    en: \`You can also bookmark the Qibla direction page for cities you visit often, such as \${seo.qiblaRef.cityName} or Mecca, and return to it quickly when needed. Having the Qibla bearing and distance to Mecca next to the compass makes the result easier to understand, because you do not rely on the indicator alone — you also see the data that explains why this direction is correct.\`,
                    fr: \`Vous pouvez également enregistrer la page de direction de la Qibla pour les villes que vous visitez souvent, comme \${seo.qiblaRef.cityName} ou La Mecque, et y revenir rapidement en cas de besoin. Avoir l'azimut de la Qibla et la distance à La Mecque à côté de la boussole rend le résultat plus facile à comprendre, car vous ne vous fiez pas seulement à l'indicateur — vous voyez aussi les données qui expliquent pourquoi cette direction est correcte.\`,
                    tr: \`Ayrıca \${seo.qiblaRef.cityName} veya Mekke gibi sık ziyaret ettiğiniz şehirler için kıble yönü sayfasını yer imlerine ekleyebilir ve gerektiğinde hızlıca dönebilirsiniz. Pusulanın yanında kıble açısı ve Mekke'ye olan mesafenin bulunması sonucu anlamayı kolaylaştırır, çünkü yalnızca göstergeye güvenmezsiniz — aynı zamanda bu yönün neden doğru olduğunu açıklayan verileri görürsünüz.\`,
                    ur: \`آپ اکثر دیکھنے والے شہروں جیسے \${seo.qiblaRef.cityName} یا مکہ کے لیے قبلہ کی سمت کا صفحہ بک مارک کر سکتے ہیں اور ضرورت پڑنے پر تیزی سے واپس آ سکتے ہیں۔ قطب نما کے ساتھ قبلہ زاویہ اور مکہ تک فاصلے کا ہونا نتیجہ کو سمجھنا آسان بناتا ہے، کیونکہ آپ صرف اشارے پر بھروسہ نہیں کرتے — آپ وہ ڈیٹا بھی دیکھتے ہیں جو وضاحت کرتا ہے کہ یہ سمت کیوں درست ہے۔\`,
                    de: \`Sie können die Qibla-Richtungsseite auch als Lesezeichen für Städte speichern, die Sie oft besuchen, wie \${seo.qiblaRef.cityName} oder Mekka, und bei Bedarf schnell zurückkehren. Die Qibla-Peilung und die Entfernung nach Mekka neben dem Kompass machen das Ergebnis verständlicher, weil Sie sich nicht nur auf die Anzeige verlassen — Sie sehen auch die Daten, die erklären, warum diese Richtung korrekt ist.\`,
                    id: \`Anda juga dapat menyimpan halaman arah kiblat untuk kota yang sering Anda kunjungi, seperti \${seo.qiblaRef.cityName} atau Mekkah, dan kembali ke sana dengan cepat saat dibutuhkan. Memiliki sudut kiblat dan jarak ke Mekkah di samping kompas membuat hasil lebih mudah dipahami, karena Anda tidak hanya mengandalkan indikator — Anda juga melihat data yang menjelaskan mengapa arah ini benar.\`,
                    es: \`También puede marcar la página de dirección de la Qibla para las ciudades que visita con frecuencia, como \${seo.qiblaRef.cityName} o La Meca, y regresar rápidamente cuando lo necesite. Tener el rumbo de la Qibla y la distancia a La Meca junto a la brújula hace que el resultado sea más fácil de entender, porque no depende solo del indicador — también ve los datos que explican por qué esta dirección es correcta.\`,
                    bn: \`আপনি \${seo.qiblaRef.cityName} বা মক্কার মতো প্রায়ই ভ্রমণ করা শহরগুলির জন্য কিবলা দিকনির্দেশনা পৃষ্ঠাটি বুকমার্ক করতে পারেন এবং প্রয়োজন হলে দ্রুত ফিরে যেতে পারেন। কম্পাসের পাশে কিবলার কোণ এবং মক্কার দূরত্ব থাকা ফলাফলটি বোঝা সহজ করে তোলে, কারণ আপনি শুধুমাত্র সূচকের উপর নির্ভর করেন না — আপনি সেই ডেটাও দেখেন যা ব্যাখ্যা করে কেন এই দিকটি সঠিক।\`,
                    ms: \`Anda juga boleh menanda buku halaman arah kiblat untuk bandar yang anda lawati dengan kerap, seperti \${seo.qiblaRef.cityName} atau Makkah, dan kembali kepadanya dengan cepat apabila diperlukan. Mempunyai sudut kiblat dan jarak ke Makkah di sebelah kompas menjadikan hasil lebih mudah difahami, kerana anda tidak bergantung pada penunjuk sahaja — anda juga melihat data yang menerangkan mengapa arah ini betul.\`
                };
                const _qaSec4Html = '<section class="section-card qibla-seo-info qibla-seo-howto">'
                    + '<h2>' + _escHtml(_qaPick(_qaSec4H2)) + '</h2>'
                    + '<p>' + _escHtml(_qaPick(_qaSec4P)) + '</p>'
                    + '<p>' + _escHtml(_qaPick(_qaSec4P2)) + '</p>'
                    + '<p>' + _escHtml(_qaPick(_qaSec4P3)) + '</p>'
                    + '<p>' + _escHtml(_qaPick(_qaSec4P4)) + '</p>'
                    + '</section>';`;

replaceOnce('Q-A3 — append _qaSec4P3 + _qaSec4P4 (10 langs each)', QA3_OLD, QA3_NEW);

writeFileSync(SRV_PATH, raw);

console.log('\n✅ Phase Q-A3 — content threshold top-up complete.');
console.log('\nChanges applied (server.js):');
console.log('  • Section 4 (qibla-seo-howto) now has 4 <p> blocks (was 2)');
console.log('  • +180-220 AR words → expected total ~850-900');
console.log('\nNo new H2 — H2 count steady. No Title/Meta/H1 change.');
