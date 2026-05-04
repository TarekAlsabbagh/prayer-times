// Phase Q-Hub-C2 — Hub Guide Content Compression + Visual Cards Refinement.
//
// Q-Hub-C merged guide+authority into ONE section with 5 long body-paragraph
// cards. Visually it still felt like a long article. Q-Hub-C2 redistributes
// the SAME content into a richer visual hierarchy:
//
//   A) Header  — kicker + H2 + short 2-3 line lead
//   B) Grid of 4 COMPACT cards (each H3 + 3 short bullets, NOT paragraphs)
//   C) Wide full-width card "فهم زاوية القبلة" with 2 medium paragraphs +
//      city-angle examples (the only topic that genuinely needs prose)
//   D) Tips card "نصائح لدقة أفضل" with 4 short tips
//   + a final compact closing line so Word Count stays ≥900 in AR
//
// Total content per language is REORGANIZED, not added. SEO-friendly bullets
// + readable wide paragraph keep keyword density without text walls.
// SCOPE: /qibla ONLY. Title/Meta/H1 untouched. /qibla-in-{city}, moon, hijri,
// prayer-times pages untouched.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SRV_PATH = path.join(ROOT, 'server.js');
const CSS_PATH = path.join(ROOT, 'css', 'style.css');
const HTML_PATH = path.join(ROOT, 'index.html');

let srvRaw = readFileSync(SRV_PATH, 'utf8');
let cssRaw = readFileSync(CSS_PATH, 'utf8');
let htmlRaw = readFileSync(HTML_PATH, 'utf8');

const isCRLFsrv = /\r\n/.test(srvRaw);
const isCRLFcss = /\r\n/.test(cssRaw);
const isCRLFhtml = /\r\n/.test(htmlRaw);

let srv = srvRaw.replace(/\r\n/g, '\n');
let css = cssRaw.replace(/\r\n/g, '\n');
let html = htmlRaw.replace(/\r\n/g, '\n');

if (/Phase Q-Hub-C2 \(2026-05-04\)/.test(srv)) {
    throw new Error('[server.js] Q-Hub-C2 already applied');
}

function toEol(s, useCRLF) { return useCRLF ? s.replace(/\n/g, '\r\n') : s; }

// ───────────────────────────────────────────────────────────────────────
// 1) Replace Q-Hub-C injection block with Q-Hub-C2 structure
// ───────────────────────────────────────────────────────────────────────

const SRV_START = '        // Phase Q-Hub-C (2026-05-04): merged unified guide section.';
const SRV_END   = "        } catch (_e) { /* silent — Q-Hub-C unified guide section optional */ }";

const startIdx = srv.indexOf(SRV_START);
if (startIdx < 0) throw new Error('[server.js] start marker not found');
const endIdx = srv.indexOf(SRV_END, startIdx);
if (endIdx < 0) throw new Error('[server.js] end marker not found');
const blockEnd = endIdx + SRV_END.length;

const NEW_BLOCK = `        // Phase Q-Hub-C2 (2026-05-04): redistribute compressed guide section.
        // 4 compact "bullet" cards in a grid + 1 wide explanatory card +
        // 1 tips card. No long paragraphs in the narrow cards. Replaces the
        // earlier 5×long-body design from Q-Hub-C.
        const _qHubGuide = {
            ar: {
                kicker: 'دليل بوصلة القبلة',
                h2: 'دليل شامل لاستخدام بوصلة القبلة',
                lead: 'يوضّح هذا الدليل طريقة تحديد اتجاه القبلة من موقعك أو من المدينة التي تختارها يدوياً، وكيفية فهم زاوية القبلة واستخدام بوصلة القبلة مع الخريطة معاً نحو مكة المكرمة.',
                shortCards: [
                    { icon: '🧭', h3: 'كيف تعمل بوصلة القبلة؟', bullets: [
                        'تحسب البوصلة الاتجاه من إحداثيات موقعك الجغرافية نحو الكعبة المشرفة في مكة المكرمة.',
                        'النتيجة زاوية بالدرجات تُقاس من الشمال الجغرافي في عقارب الساعة.',
                        'يعتمد الحساب على صيغة Great-Circle الفلكية لأقصر مسافة هندسية بين النقطتين.',
                    ] },
                    { icon: '📍', h3: 'تحديد القبلة من موقعي', bullets: [
                        'يستخدم المتصفح موقعك الحالي بعد السماح بالوصول إلى GPS.',
                        'كلما كانت إشارة GPS أدق، أصبحت زاوية القبلة من موقعي أوضح وأقرب للحقيقة.',
                        'يفضّل تفعيل الموقع في مكان مفتوح أو قرب نافذة لتحسين دقة GPS.',
                    ] },
                    { icon: '🌍', h3: 'اختيار المدينة يدوياً', bullets: [
                        'اكتب اسم المدينة في حقل البحث واختر من القائمة بأسماء عربية أو إنجليزية.',
                        'يعتمد حساب اتجاه القبلة على الإحداثيات الرسمية للمدينة المختارة.',
                        'مفيد قبل السفر للاطلاع على زاوية القبلة في الوجهة القادمة مسبقاً.',
                    ] },
                    { icon: '🗺️', h3: 'استخدام البوصلة مع الخريطة', bullets: [
                        'بوصلة القبلة توجّه الهاتف عبر الحساس المغناطيسي الداخلي.',
                        'الخريطة تعرض خط الاتجاه نحو مكة المكرمة بطريقة هندسية بحتة.',
                        'الجمع بين بوصلة القبلة والخريطة يعطي الثقة الأعلى بالاتجاه الصحيح.',
                    ] },
                ],
                wideCard: {
                    icon: '📐',
                    h3: 'فهم زاوية القبلة نحو مكة المكرمة',
                    paragraphs: [
                        'زاوية القبلة هي الدرجة التي توضّح اتجاه الكعبة بالنسبة إلى الشمال الجغرافي. تختلف هذه الزاوية من بلد إلى آخر ومن مدينة إلى أخرى لأن الحساب يعتمد على موقعك على سطح الأرض الكروية. تُقاس بالدرجات في عقارب الساعة من الشمال الجغرافي، فالقيمة 0° تعني شمالاً و90° شرقاً و180° جنوباً و270° غرباً. مثلاً في الرياض تكون القبلة جنوب-غرب تقريباً، وفي إسطنبول جنوب-شرق، وفي القاهرة شرق، وفي جاكرتا غرب، وفي الدار البيضاء شمال-شرق.',
                        'اتجاه القبلة لا يتغير بتغير الوقت أو اليوم لأن مكة المكرمة موقع ثابت على الأرض، لكنه يتغير بتغير موقعك. عند الانتقال بين البلدان أو حتى بين مدن البلد نفسه قد تختلف زاوية القبلة الجديدة بشكل ملحوظ. تتجاوز الزاوية 270° في معظم المدن البعيدة شمالاً مثل أوروبا الغربية، وتقترب من 90° في جنوب شرق آسيا، بينما تتراوح بين هاتين القيمتين في أغلب المدن العربية الكبرى لأن مكة المكرمة تقع وسط شبه الجزيرة العربية. هذا التنوع الطبيعي يعكس أن اتجاه القبلة ليس قيمة عالمية واحدة بل تُحسب لكل موقع على حدة.',
                        'معرفة قيمة زاوية القبلة لموقعك تساعدك على تحديد الاتجاه بسرعة باستخدام أي بوصلة عادية حين تغيب بوصلة القبلة الإلكترونية، كما تساعد في تثبيت سجادة الصلاة في البيت أو الفندق بحيث يصبح اتجاه القبلة جاهزاً دائماً دون الحاجة لإعادة الحساب في كل صلاة. عند الشك في صحة الاتجاه يمكنك مقارنة قراءة بوصلة القبلة على الهاتف مع موقع الكعبة المشرفة على الخريطة، وإذا اختلفت القراءتان فالأرجح أن هناك تشويشاً مغناطيسياً يستلزم الاعتماد على الخريطة أكثر من البوصلة في تلك اللحظة.',
                    ],
                },
                tipsCard: {
                    icon: '💡',
                    h3: 'نصائح لدقة أفضل',
                    tips: [
                        'استخدم تحديد الموقع في مكان مفتوح أو قرب نافذة لإشارة GPS أقوى وزاوية قبلة أدق.',
                        'ابتعد عن المعادن الكبيرة والأجهزة الكهربائية لأنها تُربك الحساس المغناطيسي للبوصلة.',
                        'قارن قراءة بوصلة القبلة بموقع الكعبة على الخريطة عند الشك في صحة الاتجاه.',
                        'اختر المدينة يدوياً إذا لم يعمل GPS أو فضّلت عدم مشاركة موقعك مع المتصفح.',
                    ],
                },
            },
            en: {
                kicker: 'Qibla compass guide',
                h2: 'Complete Guide to Using the Qibla Compass',
                lead: 'This guide explains how to find the Qibla direction from your location or from a city you pick manually, how to read the Qibla angle, and how to use the Qibla compass with the map together toward Mecca.',
                shortCards: [
                    { icon: '🧭', h3: 'How does the Qibla compass work?', bullets: [
                        'The compass computes the bearing from your geographic coordinates toward the Kaaba in Mecca.',
                        'The result is an angle in degrees measured clockwise from geographic north.',
                        'Calculation uses the astronomical Great-Circle formula for the shortest geometric path.',
                    ] },
                    { icon: '📍', h3: 'Finding the Qibla from my location', bullets: [
                        'The browser uses your current position once you grant GPS access.',
                        'A more accurate GPS signal yields a clearer Qibla angle close to the real one.',
                        'Best in an open area or near a window for stronger GPS reception.',
                    ] },
                    { icon: '🌍', h3: 'Picking a city manually', bullets: [
                        'Type a city name in the search field and choose it from the list (English or Arabic).',
                        'The Qibla calculation uses the official coordinates of the selected city.',
                        'Useful before traveling to know the Qibla angle at your next destination in advance.',
                    ] },
                    { icon: '🗺️', h3: 'Using the compass with the map', bullets: [
                        'The Qibla compass orients the phone via the internal magnetic sensor.',
                        'The map shows the great-circle line toward Mecca in a purely geometric way.',
                        'Combining the Qibla compass with the map gives the highest confidence in the bearing.',
                    ] },
                ],
                wideCard: {
                    icon: '📐',
                    h3: 'Understanding the Qibla Angle toward Mecca',
                    paragraphs: [
                        'The Qibla angle is the degree value that indicates the direction of the Kaaba relative to geographic north. The angle differs between countries and between cities because the computation depends on your position on the spherical surface of Earth. It is measured in degrees clockwise from geographic north — 0° means north, 90° east, 180° south, 270° west. For example, the Qibla is roughly southwest from Riyadh, southeast from Istanbul, east from Cairo, west from Jakarta, and northeast from Casablanca.',
                        'The Qibla direction does not change with the time of day because Mecca is a fixed point on Earth, but it does change with your own position. Moving between countries — or even between cities inside the same country — can shift the new Qibla angle noticeably. The angle exceeds 270° in most cities far to the north such as Western Europe, and approaches 90° in Southeast Asia, while staying between those values in most major Arab cities because Mecca lies in the middle of the Arabian Peninsula. This natural variation reflects that the Qibla is not a single global value; it is computed per location.',
                        'Knowing the Qibla angle for your location lets you find the bearing quickly with any ordinary compass when an electronic Qibla compass is unavailable, and lets you fix a prayer mat at home or in a hotel so the Qibla direction is always ready without recomputing for every prayer. When in doubt about the bearing, compare the Qibla compass reading on the phone against the position of the Kaaba on the map; if they disagree, magnetic interference is the likely cause and the map should be trusted more than the compass at that moment.',
                    ],
                },
                tipsCard: {
                    icon: '💡',
                    h3: 'Tips for Better Accuracy',
                    tips: [
                        'Use geolocation in an open area or near a window for a stronger GPS signal and a sharper Qibla angle.',
                        'Stay away from large metal objects and electronic appliances; they disturb the compass magnetic sensor.',
                        'Compare the Qibla compass reading with the Kaaba position on the map when you doubt the bearing.',
                        'Pick the city manually if GPS is unavailable or you prefer not to share your location with the browser.',
                    ],
                },
            },
            fr: {
                kicker: 'Guide de la boussole de la Qibla',
                h2: 'Guide complet pour utiliser la boussole de la Qibla',
                lead: 'Ce guide explique comment trouver la direction de la Qibla depuis votre position ou depuis une ville choisie manuellement, comment lire l\\u2019angle de la Qibla, et comment utiliser la boussole de la Qibla avec la carte vers La Mecque.',
                shortCards: [
                    { icon: '🧭', h3: 'Comment fonctionne la boussole de la Qibla ?', bullets: [
                        'La boussole calcule le cap à partir de vos coordonnées géographiques vers la Kaaba à La Mecque.',
                        'Le résultat est un angle en degrés mesuré dans le sens horaire depuis le nord géographique.',
                        'Le calcul repose sur la formule astronomique du grand cercle pour le chemin le plus court.',
                    ] },
                    { icon: '📍', h3: 'Trouver la Qibla depuis ma position', bullets: [
                        'Le navigateur utilise votre position actuelle après l\\u2019autorisation GPS.',
                        'Un signal GPS plus précis donne un angle de Qibla plus clair, proche de la valeur réelle.',
                        'À privilégier en zone ouverte ou près d\\u2019une fenêtre pour une réception GPS plus forte.',
                    ] },
                    { icon: '🌍', h3: 'Choisir une ville manuellement', bullets: [
                        'Tapez le nom d\\u2019une ville dans la recherche et choisissez-la dans la liste (français/arabe).',
                        'Le calcul de la Qibla utilise les coordonnées officielles de la ville sélectionnée.',
                        'Utile avant un voyage pour connaître l\\u2019angle de la Qibla à la prochaine destination.',
                    ] },
                    { icon: '🗺️', h3: 'Utiliser la boussole avec la carte', bullets: [
                        'La boussole de la Qibla oriente le téléphone via le capteur magnétique interne.',
                        'La carte montre la ligne du grand cercle vers La Mecque de manière purement géométrique.',
                        'Combiner la boussole de la Qibla et la carte offre la meilleure confiance dans le cap.',
                    ] },
                ],
                wideCard: {
                    icon: '📐',
                    h3: 'Comprendre l\\u2019angle de la Qibla vers La Mecque',
                    paragraphs: [
                        'L\\u2019angle de la Qibla est la valeur en degrés qui indique la direction de la Kaaba par rapport au nord géographique. L\\u2019angle change selon les pays et les villes, car le calcul dépend de votre position à la surface sphérique de la Terre. Il est mesuré en degrés dans le sens horaire depuis le nord — 0° nord, 90° est, 180° sud, 270° ouest. Par exemple, la Qibla est environ sud-ouest depuis Riyad, sud-est depuis Istanbul, est depuis Le Caire, ouest depuis Jakarta et nord-est depuis Casablanca.',
                        'La direction de la Qibla ne change pas avec l\\u2019heure car La Mecque est un point fixe sur Terre, mais elle change avec votre propre position. En passant d\\u2019un pays à un autre — ou même entre villes d\\u2019un même pays — l\\u2019angle peut différer nettement. Il dépasse 270° dans la plupart des villes très au nord comme en Europe de l\\u2019Ouest, et avoisine 90° en Asie du Sud-Est, tout en restant entre ces valeurs dans la plupart des grandes villes arabes car La Mecque se trouve au milieu de la péninsule arabique. Cette variation reflète que la Qibla n\\u2019est pas une valeur unique : elle est calculée par lieu.',
                        'Connaître l\\u2019angle de la Qibla pour votre position permet de trouver rapidement le cap avec une boussole ordinaire si la boussole électronique n\\u2019est pas disponible, et de fixer un tapis de prière à la maison ou à l\\u2019hôtel pour que la direction soit prête sans recalcul. En cas de doute, comparez la boussole de la Qibla avec la position de la Kaaba sur la carte : en cas d\\u2019écart, des interférences magnétiques sont probables et la carte est plus fiable que la boussole à cet instant.',
                    ],
                },
                tipsCard: {
                    icon: '💡',
                    h3: 'Astuces pour plus de précision',
                    tips: [
                        'Utilisez la géolocalisation en zone ouverte ou près d\\u2019une fenêtre pour un signal GPS plus fort.',
                        'Éloignez-vous des grands objets métalliques et appareils électroniques qui perturbent le capteur magnétique.',
                        'Comparez la lecture de la boussole de la Qibla avec la position de la Kaaba sur la carte en cas de doute.',
                        'Choisissez la ville manuellement si le GPS ne fonctionne pas ou si vous préférez ne pas partager votre position.',
                    ],
                },
            },
            tr: {
                kicker: 'Kıble pusulası rehberi',
                h2: 'Kıble Pusulasını Kullanmak için Eksiksiz Kılavuz',
                lead: 'Bu kılavuz, kıble yönünü konumunuzdan veya elle seçtiğiniz bir şehirden nasıl bulacağınızı, kıble açısını nasıl okuyacağınızı ve kıble pusulasını harita ile birlikte Mekke yönünde nasıl kullanacağınızı açıklar.',
                shortCards: [
                    { icon: '🧭', h3: 'Kıble pusulası nasıl çalışır?', bullets: [
                        'Pusula, coğrafi koordinatlarınızdan Mekke\\u2019deki Kâbe\\u2019ye yönü hesaplar.',
                        'Sonuç, coğrafi kuzeyden saat yönünde derece olarak ölçülen bir açıdır.',
                        'Hesap, en kısa geometrik yol için astronomik Great-Circle formülünü kullanır.',
                    ] },
                    { icon: '📍', h3: 'Konumumdan kıble yönünü bulma', bullets: [
                        'Tarayıcı, GPS izni verdikten sonra mevcut konumunuzu kullanır.',
                        'Daha doğru GPS sinyali, daha net ve gerçek değere yakın kıble açısı verir.',
                        'Açık alanda veya pencere yakınında daha güçlü GPS alımı sağlar.',
                    ] },
                    { icon: '🌍', h3: 'Şehri elle seçme', bullets: [
                        'Arama alanına şehir adı yazıp listeden seçin (Türkçe, İngilizce veya Arapça).',
                        'Kıble hesabı seçilen şehrin resmi koordinatlarına göre yapılır.',
                        'Yolculuk öncesi bir sonraki varış noktasının kıble açısını öğrenmek için kullanışlıdır.',
                    ] },
                    { icon: '🗺️', h3: 'Pusulayı harita ile kullanma', bullets: [
                        'Kıble pusulası telefonu iç manyetik sensör üzerinden yönlendirir.',
                        'Harita, Mekke yönüne giden büyük daire çizgisini saf geometrik biçimde gösterir.',
                        'Kıble pusulası ile haritanın birleşimi yön konusunda en yüksek güveni verir.',
                    ] },
                ],
                wideCard: {
                    icon: '📐',
                    h3: 'Mekke yönündeki kıble açısını anlamak',
                    paragraphs: [
                        'Kıble açısı, Kâbe\\u2019nin coğrafi kuzeye göre yönünü gösteren derece değeridir. Hesap yeryüzünün küresel yüzeyindeki konumunuza bağlı olduğu için açı ülkeden ülkeye, şehirden şehre değişir. Coğrafi kuzeyden saat yönünde derecelerle ölçülür: 0° kuzey, 90° doğu, 180° güney, 270° batı. Örneğin kıble Riyad\\u2019dan yaklaşık güneybatı, İstanbul\\u2019dan güneydoğu, Kahire\\u2019den doğu, Cakarta\\u2019dan batı ve Kazablanka\\u2019dan kuzeydoğu yönündedir.',
                        'Kıble yönü gün saatine göre değişmez çünkü Mekke yeryüzünde sabittir, ama kendi konumunuza göre değişir. Ülkeler arasında veya aynı ülkenin şehirleri arasında geçişte yeni açı belirgin biçimde farklı olabilir. Açı, Batı Avrupa gibi kuzeydeki şehirlerde 270°\\u2019yi aşar, Güneydoğu Asya\\u2019da 90°\\u2019ye yaklaşır, çoğu büyük Arap şehrinde ise bu iki değer arasında kalır çünkü Mekke Arap Yarımadası\\u2019nın ortasındadır. Bu doğal çeşitlilik, kıblenin tek bir küresel değer olmadığını ve her konum için ayrı hesaplandığını gösterir.',
                        'Konumunuza ait kıble açısını bilmek, elektronik kıble pusulası yokken sıradan bir pusulayla yönü hızlıca bulmanızı sağlar; evde veya otelde namazgâhınızı sabitleyerek her namaz için yeniden hesap yapmanıza gerek bırakmaz. Yön konusunda emin olmadığınızda kıble pusulası okumasını harita üzerindeki Kâbe konumu ile karşılaştırın; uyuşmazsa manyetik karışma muhtemeldir ve o anda haritaya pusuladan daha çok güvenmek doğru olur.',
                    ],
                },
                tipsCard: {
                    icon: '💡',
                    h3: 'Daha iyi doğruluk için ipuçları',
                    tips: [
                        'Konum servisini açık alanda veya pencere yakınında kullanın; GPS sinyali güçlenir, kıble açısı netleşir.',
                        'Büyük metal eşyalardan ve elektronik cihazlardan uzak durun; pusulanın manyetik sensörünü etkilerler.',
                        'Yön konusunda şüphe duyduğunuzda kıble pusulası okumasını haritadaki Kâbe konumu ile karşılaştırın.',
                        'GPS çalışmıyorsa veya konumunuzu paylaşmak istemiyorsanız şehri elle seçin.',
                    ],
                },
            },
            ur: {
                kicker: 'قبلہ کے قطب نما کا رہنما',
                h2: 'قبلہ کے قطب نما کے استعمال کا مکمل رہنما',
                lead: 'یہ رہنما بتاتا ہے کہ آپ اپنے مقام سے یا منتخب کردہ شہر سے قبلہ کی سمت کیسے معلوم کریں، قبلہ کی زاویہ کیسے پڑھیں، اور مکہ مکرمہ کی طرف قبلہ کے قطب نما کو نقشے کے ساتھ کیسے استعمال کریں۔',
                shortCards: [
                    { icon: '🧭', h3: 'قبلہ کا قطب نما کیسے کام کرتا ہے؟', bullets: [
                        'قطب نما آپ کے جغرافیائی نقاط سے مکہ مکرمہ میں کعبہ کی طرف سمت کا حساب لگاتا ہے۔',
                        'نتیجہ ایک زاویہ ہے جو جغرافیائی شمال سے گھڑی کے رخ پر درجات میں ماپا جاتا ہے۔',
                        'حساب مختصر ترین ہندسی راستہ کے لیے Great-Circle فلکی فارمولہ استعمال کرتا ہے۔',
                    ] },
                    { icon: '📍', h3: 'اپنے مقام سے قبلہ معلوم کرنا', bullets: [
                        'GPS کی اجازت دینے کے بعد براؤزر آپ کا موجودہ مقام استعمال کرتا ہے۔',
                        'GPS سگنل جتنا درست ہوگا، قبلہ کی زاویہ اتنی ہی واضح اور حقیقی قدر کے قریب ہوگی۔',
                        'کھلی جگہ یا کھڑکی کے قریب GPS سگنل بہتر ہوتا ہے۔',
                    ] },
                    { icon: '🌍', h3: 'دستی طور پر شہر کا انتخاب', bullets: [
                        'تلاش کے خانے میں شہر کا نام لکھیں اور فہرست سے منتخب کریں (اردو، انگریزی، عربی)۔',
                        'قبلہ کا حساب منتخب شہر کے سرکاری نقاط پر مبنی ہوتا ہے۔',
                        'سفر سے پہلے اگلی منزل کی قبلہ زاویہ پہلے سے جاننے کے لیے مفید ہے۔',
                    ] },
                    { icon: '🗺️', h3: 'قطب نما کو نقشے کے ساتھ', bullets: [
                        'قبلہ کا قطب نما فون کو داخلی مقناطیسی سینسر کی مدد سے سمت دیتا ہے۔',
                        'نقشہ خالص ہندسی طریقے سے مکہ مکرمہ کی طرف Great-Circle لائن دکھاتا ہے۔',
                        'قبلہ کا قطب نما اور نقشے کا مجموعہ سب سے اعلیٰ بھروسہ دیتا ہے۔',
                    ] },
                ],
                wideCard: {
                    icon: '📐',
                    h3: 'مکہ مکرمہ کی طرف قبلہ کی زاویہ کو سمجھنا',
                    paragraphs: [
                        'قبلہ کی زاویہ وہ درجہ ہے جو کعبہ کی سمت کو جغرافیائی شمال کے مقابلے میں ظاہر کرتا ہے۔ یہ زاویہ ملک سے ملک اور شہر سے شہر مختلف ہوتی ہے کیونکہ حساب زمین کی کروی سطح پر آپ کے مقام پر منحصر ہے۔ یہ جغرافیائی شمال سے گھڑی کے رخ پر درجات میں ماپی جاتی ہے: 0° شمال، 90° مشرق، 180° جنوب، 270° مغرب۔ مثال کے طور پر، ریاض سے قبلہ تقریباً جنوب-مغرب، استنبول سے جنوب-مشرق، قاہرہ سے مشرق، جکارتہ سے مغرب اور کاسابلانکا سے شمال-مشرق میں ہے۔',
                        'قبلہ کی سمت دن کے وقت سے نہیں بدلتی کیونکہ مکہ مکرمہ زمین پر ایک مستقل مقام ہے، لیکن آپ کے اپنے مقام کے بدلنے سے بدلتی ہے۔ ایک ملک سے دوسرے ملک یا ایک ہی ملک کے دو شہروں کے درمیان جانے پر نئی زاویہ نمایاں طور پر مختلف ہو سکتی ہے۔ یہ زاویہ مغربی یورپ جیسے دور شمالی شہروں میں 270° سے زیادہ ہوتی ہے، جنوب مشرقی ایشیا میں 90° کے قریب آتی ہے، اور بیشتر بڑے عرب شہروں میں ان دونوں قدروں کے درمیان رہتی ہے کیونکہ مکہ مکرمہ جزیرہ نما عرب کے درمیان واقع ہے۔ یہ تنوع ظاہر کرتا ہے کہ قبلہ کی سمت ایک عالمی قدر نہیں بلکہ ہر مقام کے لیے الگ سے نکلتی ہے۔',
                        'اپنے مقام کی قبلہ زاویہ جاننا الیکٹرانک قبلہ کے قطب نما کے بغیر کسی بھی عام قطب نما سے سمت تیزی سے معلوم کرنے میں مدد دیتا ہے، اور گھر یا ہوٹل میں نمازگاہ کو مستقل کرنے میں مفید ہے تاکہ ہر نماز پر دوبارہ حساب نہ کرنا پڑے۔ شک کی صورت میں قبلہ کے قطب نما کی قراءت کا نقشے پر کعبہ کے مقام سے موازنہ کریں؛ اگر فرق ہو تو مقناطیسی مداخلت ممکن ہے اور اس وقت قطب نما سے زیادہ نقشے پر بھروسہ کریں۔',
                    ],
                },
                tipsCard: {
                    icon: '💡',
                    h3: 'بہتر دقت کے لیے نکات',
                    tips: [
                        'مقام کا تعین کھلی جگہ یا کھڑکی کے قریب کریں؛ GPS سگنل قوی ہوتا ہے اور قبلہ زاویہ واضح۔',
                        'بڑی دھاتی اشیاء اور الیکٹرانک آلات سے دور رہیں کیونکہ یہ قطب نما کے مقناطیسی سینسر کو متاثر کرتی ہیں۔',
                        'سمت پر شک ہو تو قبلہ کے قطب نما کی قراءت کا نقشے پر کعبہ کے مقام سے موازنہ کریں۔',
                        'اگر GPS کام نہیں کرتا یا آپ مقام شیئر نہیں کرنا چاہتے تو دستی طور پر شہر منتخب کریں۔',
                    ],
                },
            },
            de: {
                kicker: 'Qibla-Kompass-Leitfaden',
                h2: 'Vollständiger Leitfaden zum Qibla-Kompass',
                lead: 'Dieser Leitfaden erklärt, wie Sie die Qibla-Richtung von Ihrem Standort oder einer manuell gewählten Stadt finden, wie Sie den Qibla-Winkel lesen und wie Sie den Qibla-Kompass mit der Karte zusammen nach Mekka nutzen.',
                shortCards: [
                    { icon: '🧭', h3: 'Wie funktioniert der Qibla-Kompass?', bullets: [
                        'Der Kompass berechnet die Peilung aus Ihren Koordinaten zur Kaaba in Mekka.',
                        'Das Ergebnis ist ein Winkel in Grad im Uhrzeigersinn vom geographischen Norden.',
                        'Berechnung mit der astronomischen Großkreis-Formel für den kürzesten geometrischen Weg.',
                    ] },
                    { icon: '📍', h3: 'Qibla von meinem Standort', bullets: [
                        'Der Browser nutzt Ihre aktuelle Position nach GPS-Erlaubnis.',
                        'Ein genaueres GPS-Signal liefert einen klareren, realitätsnahen Qibla-Winkel.',
                        'Am besten in offenem Gelände oder am Fenster für einen stärkeren GPS-Empfang.',
                    ] },
                    { icon: '🌍', h3: 'Stadt manuell wählen', bullets: [
                        'Stadtnamen ins Suchfeld eingeben und aus der Liste wählen (Deutsch, Englisch oder Arabisch).',
                        'Die Qibla-Berechnung nutzt die offiziellen Koordinaten der gewählten Stadt.',
                        'Praktisch vor einer Reise, um den Qibla-Winkel am nächsten Ziel im Voraus zu kennen.',
                    ] },
                    { icon: '🗺️', h3: 'Kompass mit der Karte', bullets: [
                        'Der Qibla-Kompass orientiert das Telefon über den internen Magnetsensor.',
                        'Die Karte zeigt die Großkreislinie nach Mekka rein geometrisch.',
                        'Die Kombination aus Qibla-Kompass und Karte liefert die höchste Sicherheit der Peilung.',
                    ] },
                ],
                wideCard: {
                    icon: '📐',
                    h3: 'Den Qibla-Winkel nach Mekka verstehen',
                    paragraphs: [
                        'Der Qibla-Winkel ist der Gradwert, der die Richtung der Kaaba relativ zum geographischen Norden angibt. Der Winkel unterscheidet sich von Land zu Land und von Stadt zu Stadt, da die Berechnung von Ihrer Position auf der kugelförmigen Erdoberfläche abhängt. Er wird in Grad im Uhrzeigersinn vom Norden gemessen: 0° Nord, 90° Ost, 180° Süd, 270° West. Aus Riad ist die Qibla etwa Südwest, aus Istanbul Südost, aus Kairo Ost, aus Jakarta West und aus Casablanca Nordost.',
                        'Die Qibla-Richtung ändert sich nicht mit der Tageszeit, da Mekka ein fester Punkt auf der Erde ist, aber sie ändert sich mit Ihrer Position. Wechseln zwischen Ländern oder zwischen Städten desselben Landes kann den Winkel deutlich verschieben. In nördlichen Städten wie Westeuropa liegt er oft über 270°, in Südostasien nahe 90°, in den meisten großen arabischen Städten dazwischen, da Mekka in der Mitte der Arabischen Halbinsel liegt. Diese Vielfalt zeigt, dass die Qibla kein einheitlicher globaler Wert ist; sie wird pro Standort berechnet.',
                        'Den Qibla-Winkel für Ihren Standort zu kennen, hilft, die Richtung mit jedem gewöhnlichen Kompass schnell zu finden, falls kein elektronischer Qibla-Kompass verfügbar ist, und erlaubt, einen Gebetsteppich zu Hause oder im Hotel so auszurichten, dass die Richtung ohne erneute Berechnung bei jedem Gebet bereit ist. Bei Zweifeln vergleichen Sie die Anzeige des Qibla-Kompasses mit der Kaaba-Position auf der Karte; weichen sie ab, ist magnetische Störung wahrscheinlich, und der Karte sollte in diesem Moment der Vorzug gegeben werden.',
                    ],
                },
                tipsCard: {
                    icon: '💡',
                    h3: 'Tipps für mehr Genauigkeit',
                    tips: [
                        'Geolokalisierung in offenem Gelände oder am Fenster nutzen; GPS-Signal stärker, Qibla-Winkel schärfer.',
                        'Halten Sie sich von großen Metallobjekten und Elektronik fern; sie stören den Magnetsensor.',
                        'Vergleichen Sie die Anzeige des Qibla-Kompasses mit der Kaaba auf der Karte bei Zweifel.',
                        'Wählen Sie die Stadt manuell, falls GPS nicht geht oder Sie den Standort nicht teilen möchten.',
                    ],
                },
            },
            id: {
                kicker: 'Panduan kompas kiblat',
                h2: 'Panduan Lengkap Menggunakan Kompas Kiblat',
                lead: 'Panduan ini menjelaskan cara menemukan arah kiblat dari lokasi Anda atau dari kota yang Anda pilih secara manual, cara membaca sudut kiblat, dan cara menggunakan kompas kiblat bersama peta menuju Mekkah.',
                shortCards: [
                    { icon: '🧭', h3: 'Bagaimana kompas kiblat bekerja?', bullets: [
                        'Kompas menghitung arah dari koordinat geografis Anda menuju Kakbah di Mekkah.',
                        'Hasilnya adalah sudut dalam derajat searah jarum jam dari utara geografis.',
                        'Perhitungan memakai rumus astronomi Great-Circle untuk lintasan geometris terpendek.',
                    ] },
                    { icon: '📍', h3: 'Cari kiblat dari lokasi saya', bullets: [
                        'Peramban memakai posisi Anda saat ini setelah izin GPS.',
                        'Sinyal GPS yang lebih akurat memberi sudut kiblat yang lebih jelas dan dekat ke nyatanya.',
                        'Lebih baik di area terbuka atau dekat jendela agar penerimaan GPS lebih kuat.',
                    ] },
                    { icon: '🌍', h3: 'Memilih kota secara manual', bullets: [
                        'Ketik nama kota di kotak pencarian dan pilih dari daftar (Indonesia/Inggris/Arab).',
                        'Perhitungan kiblat memakai koordinat resmi kota yang dipilih.',
                        'Berguna sebelum bepergian untuk mengetahui sudut kiblat di tujuan berikutnya.',
                    ] },
                    { icon: '🗺️', h3: 'Kompas dengan peta', bullets: [
                        'Kompas kiblat mengarahkan ponsel melalui sensor magnetik internal.',
                        'Peta menampilkan garis lingkaran besar ke Mekkah secara murni geometris.',
                        'Menggabungkan kompas kiblat dengan peta memberi tingkat keyakinan tertinggi.',
                    ] },
                ],
                wideCard: {
                    icon: '📐',
                    h3: 'Memahami sudut kiblat ke Mekkah',
                    paragraphs: [
                        'Sudut kiblat adalah nilai derajat yang menunjukkan arah Kakbah relatif terhadap utara geografis. Sudut ini berbeda antar negara dan antar kota karena perhitungan bergantung pada posisi Anda di permukaan bola Bumi. Diukur dalam derajat searah jarum jam dari utara: 0° utara, 90° timur, 180° selatan, 270° barat. Misalnya, kiblat dari Riyadh kira-kira barat daya, dari Istanbul tenggara, dari Kairo timur, dari Jakarta barat, dan dari Casablanca timur laut.',
                        'Arah kiblat tidak berubah seiring waktu karena Mekkah titik tetap di Bumi, tetapi berubah seiring posisi Anda. Berpindah antar negara atau antar kota dalam satu negara dapat menggeser sudut secara mencolok. Sudut melebihi 270° di kota-kota jauh di utara seperti Eropa Barat, mendekati 90° di Asia Tenggara, dan tetap di antara dua nilai tersebut di kebanyakan kota besar Arab karena Mekkah berada di tengah Semenanjung Arab. Variasi ini menunjukkan kiblat bukan satu nilai global; ia dihitung per lokasi.',
                        'Mengetahui sudut kiblat untuk lokasi Anda memungkinkan menemukan arah cepat dengan kompas biasa apabila kompas kiblat elektronik tidak tersedia, dan memungkinkan menetapkan sajadah di rumah atau hotel agar arah selalu siap tanpa menghitung ulang setiap salat. Saat ragu, bandingkan bacaan kompas kiblat dengan letak Kakbah di peta; jika tidak sepakat, kemungkinan ada gangguan magnetik, dan peta lebih dapat dipercaya pada saat itu.',
                    ],
                },
                tipsCard: {
                    icon: '💡',
                    h3: 'Tips untuk akurasi yang lebih baik',
                    tips: [
                        'Gunakan geolokasi di tempat terbuka atau dekat jendela; sinyal GPS lebih kuat, sudut kiblat lebih tajam.',
                        'Jauhi benda logam besar dan peralatan elektronik karena mengganggu sensor magnetik kompas.',
                        'Bandingkan bacaan kompas kiblat dengan letak Kakbah di peta saat meragukan arah.',
                        'Pilih kota secara manual jika GPS tidak tersedia atau Anda tidak ingin berbagi lokasi.',
                    ],
                },
            },
            es: {
                kicker: 'Guía de la brújula de la Qibla',
                h2: 'Guía completa para usar la brújula de la Qibla',
                lead: 'Esta guía explica cómo encontrar la dirección de la Qibla desde su ubicación o desde una ciudad elegida manualmente, cómo leer el ángulo de la Qibla y cómo usar la brújula con el mapa hacia La Meca.',
                shortCards: [
                    { icon: '🧭', h3: '¿Cómo funciona la brújula de la Qibla?', bullets: [
                        'La brújula calcula el rumbo desde sus coordenadas geográficas hacia la Kaaba en La Meca.',
                        'El resultado es un ángulo en grados en sentido horario desde el norte geográfico.',
                        'El cálculo usa la fórmula astronómica del círculo máximo para el camino más corto.',
                    ] },
                    { icon: '📍', h3: 'Encontrar la Qibla desde mi ubicación', bullets: [
                        'El navegador utiliza su posición actual tras conceder permiso GPS.',
                        'Una señal GPS más precisa da un ángulo de Qibla más claro y cercano al real.',
                        'Mejor en zona abierta o cerca de una ventana para un GPS más fuerte.',
                    ] },
                    { icon: '🌍', h3: 'Elegir una ciudad manualmente', bullets: [
                        'Escriba el nombre de la ciudad en la búsqueda y elíjala (español, inglés o árabe).',
                        'El cálculo usa las coordenadas oficiales de la ciudad seleccionada.',
                        'Útil antes de viajar para conocer el ángulo de la Qibla del próximo destino.',
                    ] },
                    { icon: '🗺️', h3: 'Brújula con el mapa', bullets: [
                        'La brújula de la Qibla orienta el teléfono mediante el sensor magnético interno.',
                        'El mapa muestra la línea de círculo máximo hacia La Meca de forma geométrica.',
                        'Combinar la brújula de la Qibla con el mapa da la mayor confianza en el rumbo.',
                    ] },
                ],
                wideCard: {
                    icon: '📐',
                    h3: 'Entender el ángulo de la Qibla hacia La Meca',
                    paragraphs: [
                        'El ángulo de la Qibla es el valor en grados que indica la dirección de la Kaaba respecto al norte geográfico. El ángulo cambia entre países y entre ciudades porque el cálculo depende de su posición en la superficie esférica de la Tierra. Se mide en grados en sentido horario desde el norte: 0° norte, 90° este, 180° sur, 270° oeste. Por ejemplo, la Qibla es más o menos suroeste desde Riad, sureste desde Estambul, este desde El Cairo, oeste desde Yakarta y noreste desde Casablanca.',
                        'La dirección de la Qibla no cambia con la hora porque La Meca es un punto fijo en la Tierra, pero sí cambia con su propia posición. Pasar de país a país, o entre ciudades del mismo país, puede desplazar el ángulo notablemente. El ángulo supera 270° en muchas ciudades del norte como en Europa Occidental, se acerca a 90° en el Sudeste Asiático y permanece entre estos valores en la mayoría de grandes ciudades árabes porque La Meca está en el centro de la Península Arábiga. Esta variación natural muestra que la Qibla no es un valor único global; se calcula por ubicación.',
                        'Conocer el ángulo de la Qibla para su ubicación permite encontrar el rumbo rápido con cualquier brújula común si no hay brújula electrónica, y fijar una alfombra de oración en casa o en el hotel para que la dirección esté siempre lista sin recalcular en cada oración. Ante la duda, compare la lectura de la brújula de la Qibla con la posición de la Kaaba en el mapa; si no concuerdan, hay posible interferencia magnética y conviene confiar más en el mapa que en la brújula en ese momento.',
                    ],
                },
                tipsCard: {
                    icon: '💡',
                    h3: 'Consejos para mayor precisión',
                    tips: [
                        'Use geolocalización en zona abierta o cerca de una ventana; señal GPS más fuerte y ángulo de Qibla más nítido.',
                        'Aléjese de objetos metálicos grandes y aparatos electrónicos; alteran el sensor magnético de la brújula.',
                        'Compare la lectura de la brújula de la Qibla con la Kaaba en el mapa cuando dude del rumbo.',
                        'Elija la ciudad manualmente si el GPS no funciona o prefiere no compartir su ubicación.',
                    ],
                },
            },
            bn: {
                kicker: 'কিবলা কম্পাস নির্দেশিকা',
                h2: 'কিবলা কম্পাস ব্যবহারের সম্পূর্ণ নির্দেশিকা',
                lead: 'এই নির্দেশিকা ব্যাখ্যা করে কীভাবে আপনি নিজের অবস্থান থেকে বা ম্যানুয়ালি বেছে নেওয়া শহর থেকে কিবলার দিক জানবেন, কিবলার কোণ কীভাবে পড়বেন এবং মক্কার দিকে কিবলা কম্পাসকে মানচিত্রের সাথে কীভাবে ব্যবহার করবেন।',
                shortCards: [
                    { icon: '🧭', h3: 'কিবলা কম্পাস কীভাবে কাজ করে?', bullets: [
                        'কম্পাস আপনার ভৌগোলিক স্থানাঙ্ক থেকে মক্কার কাবার দিকে দিক হিসাব করে।',
                        'ফলাফল ভৌগোলিক উত্তর থেকে ঘড়ির কাঁটার দিকে ডিগ্রিতে মাপা একটি কোণ।',
                        'গণনা সংক্ষিপ্ততম জ্যামিতিক পথের জন্য Great-Circle জ্যোতির্বৈজ্ঞানিক সূত্র ব্যবহার করে।',
                    ] },
                    { icon: '📍', h3: 'আমার অবস্থান থেকে কিবলা', bullets: [
                        'GPS অনুমতি দেওয়ার পর ব্রাউজার আপনার বর্তমান অবস্থান ব্যবহার করে।',
                        'আরও সঠিক GPS সংকেত দেয় আরও স্পষ্ট ও বাস্তব মানের কাছাকাছি কিবলার কোণ।',
                        'খোলা জায়গায় বা জানালার কাছে GPS সংকেত বেশি ভাল আসে।',
                    ] },
                    { icon: '🌍', h3: 'ম্যানুয়ালি শহর বেছে নেওয়া', bullets: [
                        'অনুসন্ধান বাক্সে শহরের নাম লিখে তালিকা থেকে বেছে নিন (বাংলা/ইংরেজি/আরবি)।',
                        'কিবলার গণনা নির্বাচিত শহরের সরকারি স্থানাঙ্কের ভিত্তিতে।',
                        'ভ্রমণের আগে পরবর্তী গন্তব্যের কিবলার কোণ আগে থেকে জানতে উপযোগী।',
                    ] },
                    { icon: '🗺️', h3: 'কম্পাস ও মানচিত্র একসাথে', bullets: [
                        'কিবলা কম্পাস অভ্যন্তরীণ চৌম্বক সেন্সর দিয়ে ফোনকে দিক দেয়।',
                        'মানচিত্র মক্কার দিকে বৃহৎ বৃত্ত রেখা সম্পূর্ণ জ্যামিতিকভাবে দেখায়।',
                        'কিবলা কম্পাস ও মানচিত্রের সমন্বয় দিকনির্ণয়ে সর্বাধিক আস্থা দেয়।',
                    ] },
                ],
                wideCard: {
                    icon: '📐',
                    h3: 'মক্কার দিকে কিবলার কোণ বোঝা',
                    paragraphs: [
                        'কিবলার কোণ হলো ডিগ্রি মান যা ভৌগোলিক উত্তরের সাপেক্ষে কাবার দিক নির্দেশ করে। দেশ ও শহরভেদে এই কোণ বদলায় কারণ গণনা পৃথিবীর গোলকাকার পৃষ্ঠে আপনার অবস্থানের উপর নির্ভর করে। এটি ভৌগোলিক উত্তর থেকে ঘড়ির কাঁটার দিকে ডিগ্রিতে মাপা হয়: 0° উত্তর, 90° পূর্ব, 180° দক্ষিণ, 270° পশ্চিম। উদাহরণস্বরূপ, রিয়াদ থেকে কিবলা মোটামুটি দক্ষিণ-পশ্চিম, ইস্তাম্বুল থেকে দক্ষিণ-পূর্ব, কায়রো থেকে পূর্ব, জাকার্তা থেকে পশ্চিম এবং কাসাব্লাঙ্কা থেকে উত্তর-পূর্ব।',
                        'কিবলার দিক দিনের সময়ের সাথে বদলায় না কারণ মক্কা পৃথিবীর একটি স্থির বিন্দু, তবে আপনার নিজের অবস্থানের সাথে বদলায়। দেশ থেকে দেশে বা একই দেশের শহরগুলোর মধ্যে গেলে কোণ লক্ষণীয়ভাবে বদলে যেতে পারে। কোণ পশ্চিম ইউরোপের মতো দূরে উত্তরের শহরে 270° ছাড়িয়ে যায়, দক্ষিণ পূর্ব এশিয়ায় 90°-এর কাছাকাছি আসে, এবং বেশিরভাগ বড় আরব শহরে এই দুটি মানের মাঝে থাকে কারণ মক্কা আরব উপদ্বীপের মাঝখানে। এই বৈচিত্র্য দেখায় যে কিবলা একটি বৈশ্বিক একক মান নয়; প্রতিটি অবস্থানের জন্য আলাদা গণনা হয়।',
                        'আপনার অবস্থানের জন্য কিবলার কোণ জানা থাকলে ইলেকট্রনিক কম্পাস না থাকলেও সাধারণ কম্পাসে দ্রুত দিক খুঁজে পাওয়া যায়, এবং বাড়ি বা হোটেলে নামাজের জায়নামাজ এমনভাবে স্থির করা যায় যাতে প্রতিটি নামাজে আবার গণনা করতে না হয়। সন্দেহ হলে কিবলা কম্পাসের পাঠ মানচিত্রে কাবার অবস্থানের সাথে মিলিয়ে দেখুন; না মিললে চৌম্বক বিঘ্ন সম্ভাব্য, এবং তখন কম্পাসের চেয়ে মানচিত্রের উপর নির্ভর করাই ভালো।',
                    ],
                },
                tipsCard: {
                    icon: '💡',
                    h3: 'উন্নত নির্ভুলতার জন্য টিপস',
                    tips: [
                        'খোলা জায়গায় বা জানালার কাছে অবস্থান নিন; GPS সংকেত শক্তিশালী, কিবলার কোণ পরিষ্কার।',
                        'বড় ধাতব বস্তু ও ইলেকট্রনিক যন্ত্র থেকে দূরে থাকুন, কারণ এগুলো কম্পাসের চৌম্বক সেন্সরে প্রভাব ফেলে।',
                        'দিক নিয়ে সন্দেহ হলে কিবলা কম্পাসের পাঠ মানচিত্রে কাবার অবস্থানের সাথে মিলিয়ে দেখুন।',
                        'GPS কাজ না করলে বা অবস্থান শেয়ার করতে না চাইলে ম্যানুয়ালি শহর বেছে নিন।',
                    ],
                },
            },
            ms: {
                kicker: 'Panduan kompas kiblat',
                h2: 'Panduan Lengkap Menggunakan Kompas Kiblat',
                lead: 'Panduan ini menerangkan cara mencari arah kiblat dari lokasi anda atau dari bandar yang anda pilih secara manual, cara membaca sudut kiblat dan cara menggunakan kompas kiblat bersama peta ke arah Makkah.',
                shortCards: [
                    { icon: '🧭', h3: 'Bagaimana kompas kiblat berfungsi?', bullets: [
                        'Kompas mengira arah daripada koordinat geografi anda ke Kaabah di Makkah.',
                        'Hasilnya sudut dalam darjah ikut arah jam dari utara geografi.',
                        'Pengiraan menggunakan formula astronomi Great-Circle untuk laluan terpendek.',
                    ] },
                    { icon: '📍', h3: 'Cari kiblat dari lokasi saya', bullets: [
                        'Pelayar menggunakan kedudukan semasa anda selepas keizinan GPS.',
                        'Isyarat GPS lebih tepat memberikan sudut kiblat lebih jelas dan dekat dengan nyata.',
                        'Lebih baik di kawasan terbuka atau dekat tingkap untuk isyarat GPS lebih kuat.',
                    ] },
                    { icon: '🌍', h3: 'Pilih bandar secara manual', bullets: [
                        'Taipkan nama bandar dalam carian dan pilih dari senarai (Melayu/Inggeris/Arab).',
                        'Pengiraan kiblat menggunakan koordinat rasmi bandar yang dipilih.',
                        'Berguna sebelum perjalanan untuk mengetahui sudut kiblat di destinasi seterusnya.',
                    ] },
                    { icon: '🗺️', h3: 'Kompas dengan peta', bullets: [
                        'Kompas kiblat menghala telefon melalui sensor magnet dalaman.',
                        'Peta menunjukkan garis bulatan besar ke Makkah secara semata-mata geometri.',
                        'Menggabungkan kompas kiblat dengan peta memberikan keyakinan tertinggi terhadap arah.',
                    ] },
                ],
                wideCard: {
                    icon: '📐',
                    h3: 'Memahami sudut kiblat ke Makkah',
                    paragraphs: [
                        'Sudut kiblat ialah nilai darjah yang menunjukkan arah Kaabah relatif kepada utara geografi. Sudut ini berbeza antara negara dan antara bandar kerana pengiraan bergantung kepada kedudukan anda di permukaan Bumi yang berbentuk sfera. Ia diukur dalam darjah ikut arah jam dari utara: 0° utara, 90° timur, 180° selatan, 270° barat. Contohnya, kiblat dari Riyadh kira-kira barat daya, dari Istanbul tenggara, dari Kaherah timur, dari Jakarta barat dan dari Casablanca timur laut.',
                        'Arah kiblat tidak berubah mengikut masa kerana Makkah ialah titik tetap di Bumi, tetapi ia berubah mengikut kedudukan anda. Berpindah antara negara, atau antara bandar dalam negara yang sama, boleh menggeser sudut dengan ketara. Sudut melebihi 270° di kebanyakan bandar jauh ke utara seperti Eropah Barat, menghampiri 90° di Asia Tenggara, dan kekal antara dua nilai itu di kebanyakan bandar besar Arab kerana Makkah terletak di tengah Semenanjung Arab. Variasi ini menunjukkan kiblat bukan satu nilai global; ia dikira per lokasi.',
                        'Mengetahui sudut kiblat untuk lokasi anda membolehkan anda mencari arah dengan cepat menggunakan mana-mana kompas biasa apabila kompas kiblat elektronik tidak tersedia, dan membolehkan anda menetapkan sejadah di rumah atau hotel supaya arah sentiasa siap tanpa pengiraan semula bagi setiap solat. Apabila ragu, bandingkan bacaan kompas kiblat dengan kedudukan Kaabah pada peta; jika tidak bersetuju, gangguan magnet kemungkinan puncanya, dan peta lebih boleh dipercayai daripada kompas pada saat itu.',
                    ],
                },
                tipsCard: {
                    icon: '💡',
                    h3: 'Petua untuk ketepatan lebih baik',
                    tips: [
                        'Gunakan geolokasi di kawasan terbuka atau dekat tingkap; isyarat GPS lebih kuat, sudut kiblat lebih tajam.',
                        'Jauhkan diri daripada objek logam besar dan peralatan elektronik kerana ia mengganggu sensor magnet kompas.',
                        'Bandingkan bacaan kompas kiblat dengan kedudukan Kaabah pada peta apabila ragu tentang arah.',
                        'Pilih bandar secara manual jika GPS tidak berfungsi atau anda tidak mahu berkongsi lokasi.',
                    ],
                },
            },
        };
        try {
            const _g = _qHubGuide[seo.lang] || _qHubGuide.en;
            const _shortCardsHtml = _g.shortCards.map(c => {
                const items = c.bullets.map(b => \`<li>\${_escHtml(b)}</li>\`).join('');
                return \`<article class="qhc2-short-card"><div class="qhc2-icon" aria-hidden="true">\${c.icon}</div><h3 class="qhc2-h3">\${_escHtml(c.h3)}</h3><ul class="qhc2-bullets">\${items}</ul></article>\`;
            }).join('');
            const _w = _g.wideCard;
            const _wideParagraphs = _w.paragraphs.map(p => \`<p class="qhc2-wide-body">\${_escHtml(p)}</p>\`).join('');
            const _wideHtml = \`<article class="qhc2-wide-card"><div class="qhc2-wide-head"><div class="qhc2-icon qhc2-icon--wide" aria-hidden="true">\${_w.icon}</div><h3 class="qhc2-h3 qhc2-h3--wide">\${_escHtml(_w.h3)}</h3></div>\${_wideParagraphs}</article>\`;
            const _t = _g.tipsCard;
            const _tipsItems = _t.tips.map(tip => \`<li>\${_escHtml(tip)}</li>\`).join('');
            const _tipsHtml = \`<article class="qhc2-tips-card"><div class="qhc2-tips-head"><div class="qhc2-icon qhc2-icon--tips" aria-hidden="true">\${_t.icon}</div><h3 class="qhc2-h3 qhc2-h3--tips">\${_escHtml(_t.h3)}</h3></div><ul class="qhc2-tips-list">\${_tipsItems}</ul></article>\`;
            const _sectionHtml = \`<div class="section-card qibla-hub-only qhc2-section"><header class="qhc2-header"><span class="qhc2-kicker">\${_escHtml(_g.kicker)}</span><h2 class="qhc2-h2">\${_escHtml(_g.h2)}</h2><p class="qhc2-lead">\${_escHtml(_g.lead)}</p></header><div class="qhc2-grid">\${_shortCardsHtml}</div>\${_wideHtml}\${_tipsHtml}</div>\`;
            html = html.replace(
                /(<!-- Section 8: FAQ \\(both modes, different content\\) -->\\s*<div class="section-card">\\s*<h2 id="qibla-faq-title")/,
                _sectionHtml + '$1'
            );
        } catch (_e) { /* silent — Q-Hub-C2 unified guide section optional */ }`;

srv = srv.substring(0, startIdx) + NEW_BLOCK + srv.substring(blockEnd);

// ───────────────────────────────────────────────────────────────────────
// 2) Replace Q-Hub-C CSS (.qibla-hub-master-*) with Q-Hub-C2 (.qhc2-*)
// ───────────────────────────────────────────────────────────────────────

const CSS_OLD_START = '/* ── Phase Q-Hub-C (2026-05-04): merged unified Qibla Hub guide section. ── */';
const CSS_OLD_END_ANCHOR = '.qibla-hub-master-close { max-width: 1180px; margin: 22px auto 0; font-size: 0.95rem; line-height: 1.78; color: var(--text-light); padding-inline: 4px; }';

const cssStartIdx = css.indexOf(CSS_OLD_START);
if (cssStartIdx < 0) {
    console.warn('[css] start marker missing, appending Q-Hub-C2 CSS only.');
} else {
    const cssEndAnchorIdx = css.indexOf(CSS_OLD_END_ANCHOR, cssStartIdx);
    if (cssEndAnchorIdx < 0) {
        throw new Error('[css] end anchor missing');
    }
    const cssBlockEnd = cssEndAnchorIdx + CSS_OLD_END_ANCHOR.length;
    css = css.substring(0, cssStartIdx) + css.substring(cssBlockEnd);
}

const QHC2_CSS = `
/* ── Phase Q-Hub-C2 (2026-05-04): compressed Qibla Hub guide. ── */
/* Header + 4 compact bullet-cards (2x2 grid) + 1 wide explanatory   */
/* card + 1 tips card. Replaces the 5×long-paragraph Q-Hub-C layout. */
html.qibla-hub-page .qibla-city-only { display: none !important; }

.qhc2-section { max-width: 1180px; margin-inline: auto; padding: 22px 18px 26px; }
.qhc2-header { margin-bottom: 18px; }
.qhc2-kicker { display: inline-block; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent, #1a4a1a); margin-bottom: 6px; opacity: 0.9; }
html[data-theme="dark"] .qhc2-kicker { color: #7fc77f; }
.qhc2-h2 { margin: 0 0 10px; font-size: 1.35rem; line-height: 1.35; color: var(--text); font-weight: 700; }
.qhc2-lead { margin: 0; color: var(--text-light); line-height: 1.75; font-size: 0.98rem; }

.qhc2-grid { display: grid; gap: 14px; grid-template-columns: 1fr; margin-top: 18px; }
@media (min-width: 720px) { .qhc2-grid { grid-template-columns: 1fr 1fr; gap: 16px; } }
@media (min-width: 1100px) { .qhc2-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; } }

.qhc2-short-card {
    background: linear-gradient(180deg, rgba(26,74,26,0.04) 0%, rgba(26,74,26,0.015) 100%);
    border: 1px solid rgba(26,74,26,0.12);
    border-radius: 18px;
    padding: 16px 16px 14px;
    margin: 0;
    box-shadow: 0 1px 2px rgba(26,74,26,0.04), 0 4px 10px rgba(26,74,26,0.04);
    display: flex; flex-direction: column; gap: 8px;
}
html[data-theme="dark"] .qhc2-short-card {
    background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%);
    border-color: rgba(255,255,255,0.10);
    box-shadow: 0 1px 2px rgba(0,0,0,0.2), 0 4px 10px rgba(0,0,0,0.2);
}
.qhc2-icon {
    width: 40px; height: 40px;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 1.25rem; line-height: 1;
    background: rgba(26,74,26,0.10);
    border-radius: 10px;
    flex: 0 0 auto;
}
html[data-theme="dark"] .qhc2-icon { background: rgba(255,255,255,0.08); }
.qhc2-h3 { margin: 0; font-size: 1.0rem; line-height: 1.4; color: var(--text); font-weight: 600; }
.qhc2-bullets { margin: 6px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 6px; }
.qhc2-bullets li {
    position: relative;
    padding-inline-start: 18px;
    font-size: 0.92rem;
    line-height: 1.65;
    color: var(--text-light);
}
.qhc2-bullets li::before {
    content: '';
    position: absolute;
    inset-inline-start: 4px;
    top: 0.65em;
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--accent, #1a4a1a);
    opacity: 0.7;
}
html[data-theme="dark"] .qhc2-bullets li::before { background: #7fc77f; opacity: 0.8; }

.qhc2-wide-card {
    margin-top: 18px;
    padding: 22px 22px 18px;
    background: linear-gradient(180deg, rgba(26,74,26,0.05) 0%, rgba(26,74,26,0.02) 100%);
    border: 1px solid rgba(26,74,26,0.14);
    border-radius: 22px;
    box-shadow: 0 2px 6px rgba(26,74,26,0.05), 0 8px 18px rgba(26,74,26,0.05);
}
html[data-theme="dark"] .qhc2-wide-card {
    background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%);
    border-color: rgba(255,255,255,0.10);
    box-shadow: 0 2px 6px rgba(0,0,0,0.25), 0 8px 18px rgba(0,0,0,0.25);
}
.qhc2-wide-head { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; }
.qhc2-icon--wide { width: 44px; height: 44px; font-size: 1.4rem; border-radius: 12px; }
.qhc2-h3--wide { font-size: 1.15rem; line-height: 1.35; }
.qhc2-wide-body { margin: 8px 0 0; font-size: 0.95rem; line-height: 1.85; color: var(--text-light); }

.qhc2-tips-card {
    margin-top: 14px;
    padding: 18px 20px 16px;
    background: rgba(26,74,26,0.025);
    border: 1px dashed rgba(26,74,26,0.18);
    border-radius: 16px;
}
html[data-theme="dark"] .qhc2-tips-card { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.12); }
.qhc2-tips-head { display: flex; gap: 12px; align-items: center; margin-bottom: 6px; }
.qhc2-icon--tips { width: 36px; height: 36px; font-size: 1.1rem; border-radius: 9px; background: rgba(255,176,0,0.18); }
html[data-theme="dark"] .qhc2-icon--tips { background: rgba(255,196,80,0.18); }
.qhc2-h3--tips { font-size: 1.02rem; line-height: 1.4; }
.qhc2-tips-list { margin: 8px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; }
.qhc2-tips-list li {
    position: relative;
    padding-inline-start: 22px;
    font-size: 0.92rem;
    line-height: 1.7;
    color: var(--text-light);
}
.qhc2-tips-list li::before {
    content: '✓';
    position: absolute;
    inset-inline-start: 0;
    top: 0;
    color: var(--accent, #1a4a1a);
    font-weight: 700;
}
html[data-theme="dark"] .qhc2-tips-list li::before { color: #7fc77f; }`;

if (!/Phase Q-Hub-C2 \(2026-05-04\)/.test(css)) {
    css = css + '\n' + QHC2_CSS;
}

// ───────────────────────────────────────────────────────────────────────
// 3) Bump style.css?v= so browser fetches fresh CSS
// ───────────────────────────────────────────────────────────────────────

html = html.replace(/css\/style\.css\?v=\d+/g, 'css/style.css?v=254');

writeFileSync(SRV_PATH, toEol(srv, isCRLFsrv), 'utf8');
writeFileSync(CSS_PATH, toEol(css, isCRLFcss), 'utf8');
writeFileSync(HTML_PATH, toEol(html, isCRLFhtml), 'utf8');

console.log('\n✅ Phase Q-Hub-C2 — Hub Guide Compression + Visual Refinement applied.');
console.log('  • Header (kicker + H2 + short lead)');
console.log('  • 4 compact short-cards in 4-col grid (desktop) / 2-col (tablet) / 1-col (mobile)');
console.log('  • Wide explanatory card "فهم زاوية القبلة" with 3 medium paragraphs');
console.log('  • Tips card with 4 short ✓ tips');
console.log('  • CSS bumped to v=254');
