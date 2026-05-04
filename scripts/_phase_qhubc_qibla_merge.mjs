// Phase Q-Hub-C — Merge Duplicate Hub Content + Visual Redesign (2026-05-04).
//
// Q-Hub-A added "دليل استخدام بوصلة القبلة" (4 cards).
// Q-Hub-B added "معلومات مهمة عن تحديد اتجاه القبلة" (4 cards + closing).
// Both sections covered nearly identical topics → visually heavy and
// duplicate-feeling. Q-Hub-C merges them into ONE section with 5 distinct
// cards (no topic duplication), keyword-rich bodies, and a tight closing
// summary. Visual: 2-col grid desktop / 1-col mobile, icon prefix per card.
//
// SCOPE: /qibla ONLY. Does NOT touch /qibla-in-{city}, moon, hijri,
// prayer-times, Title, Meta, or H1.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SRV_PATH = path.join(ROOT, 'server.js');
const CSS_PATH = path.join(ROOT, 'css', 'style.css');

let srvRaw = readFileSync(SRV_PATH, 'utf8');
let cssRaw = readFileSync(CSS_PATH, 'utf8');

const isCRLFsrv = /\r\n/.test(srvRaw);
const isCRLFcss = /\r\n/.test(cssRaw);

let srv = srvRaw.replace(/\r\n/g, '\n');
let css = cssRaw.replace(/\r\n/g, '\n');

if (/Phase Q-Hub-C \(2026-05-04\)/.test(srv)) {
    throw new Error('[server.js] Q-Hub-C already applied');
}

function toEol(s, useCRLF) { return useCRLF ? s.replace(/\n/g, '\r\n') : s; }

// ───────────────────────────────────────────────────────────────────────
// 1) Replace the entire injection block (Q-Hub-A guide + Q-Hub-B authority
//    + closing) with one unified Q-Hub-C section.
// ───────────────────────────────────────────────────────────────────────

const SRV_START_MARKER = '        // 4b-ii — Inject educational H2 section ("دليل استخدام بوصلة القبلة")';
const SRV_END_MARKER   = "        } catch (_e) { /* silent — Q-Hub-A guide / Q-Hub-B authority section optional */ }";

const startIdx = srv.indexOf(SRV_START_MARKER);
if (startIdx < 0) throw new Error('[server.js] start marker not found');
const endIdx = srv.indexOf(SRV_END_MARKER, startIdx);
if (endIdx < 0) throw new Error('[server.js] end marker not found');
const blockEnd = endIdx + SRV_END_MARKER.length;

const NEW_BLOCK = `        // Phase Q-Hub-C (2026-05-04): merged unified guide section.
        // Replaces Q-Hub-A guide + Q-Hub-B authority + closing into ONE
        // visually-compact section with 5 distinct H3 cards (no topic
        // duplication), each keyword-rich. 2-col grid desktop / 1-col mobile.
        // Inserted just BEFORE the FAQ section card in #page-qibla.
        const _qHubGuide = {
            ar: {
                h2: 'دليل شامل لاستخدام بوصلة القبلة',
                lead: 'يوضّح هذا الدليل طريقة تحديد اتجاه القبلة من موقعك أو من المدينة التي تختارها يدوياً، وكيفية فهم زاوية القبلة واستخدام بوصلة القبلة مع الخريطة معاً للوصول إلى مكة المكرمة بدقة.',
                cards: [
                    { icon: '🧭', h3: 'كيف تعمل بوصلة القبلة؟', body: 'تعتمد بوصلة القبلة على إحداثيات موقعك الجغرافي (خط العرض وخط الطول) لحساب الاتجاه نحو الكعبة المشرفة في مكة المكرمة. تُحوَّل هذه الإحداثيات إلى زاوية اتجاه تُقاس بالدرجات انطلاقاً من الشمال الجغرافي في عقارب الساعة، ثم تظهر النتيجة على شكل سهم أو مؤشر يساعدك على معرفة الاتجاه الصحيح. يعتمد الحساب على صيغة Great-Circle الفلكية وهي الطريقة الأدق لقياس أقصر مسافة هندسية بين نقطتين على سطح الكرة الأرضية. لذلك فإن دقة بوصلة القبلة لا تتأثر بالساعة أو اليوم، بل بدقة الموقع الذي تنطلق منه، وهذا ما يجعل الاعتماد على إحداثيات GPS الحديثة الخيار الأنسب لمعظم الحالات.' },
                    { icon: '📍', h3: 'تحديد القبلة من موقعي', body: 'عند الضغط على زر تحديد اتجاه القبلة من موقعي، يستخدم المتصفح موقعك الحالي بعد السماح له بالوصول إلى بيانات الموقع عبر GPS. كلما كانت إشارة GPS أدق، أصبحت زاوية القبلة أوضح وأقرب إلى القيمة الحقيقية، لذلك يُفضّل استخدام هذه الطريقة في مكان مفتوح أو قريب من نافذة، خصوصاً إذا كنت داخل مبنى كبير. عند توفر هذه الشروط يصبح اتجاه القبلة من موقعي قريباً جداً من الزاوية الفعلية لمكة المكرمة، دون الحاجة إلى إدخال أي بيانات يدوياً، وهي أسرع طريقة للحصول على نتيجة موثوقة.' },
                    { icon: '🌍', h3: 'اختيار المدينة يدوياً', body: 'إذا لم ترغب في مشاركة موقعك، أو لم تكن خدمة GPS متاحة على جهازك، يمكنك ببساطة كتابة اسم المدينة في حقل البحث في أعلى الصفحة واختيارها من القائمة. تتضمن قائمة المدن آلاف الأسماء حول العالم بأسماء عربية وإنجليزية، ويعتمد حساب اتجاه القبلة على الإحداثيات الرسمية للمدينة المختارة. اختيار المدينة يدوياً مفيد للمسافرين الذين يرغبون بالاطلاع على زاوية القبلة في وجهتهم القادمة قبل الوصول، ويعطي نتيجة دقيقة طالما أنك ضمن حدود المدينة المختارة أو في منطقة قريبة منها.' },
                    { icon: '🗺️', h3: 'استخدام البوصلة مع الخريطة', body: 'تساعدك بوصلة القبلة على توجيه الهاتف نحو الاتجاه الصحيح باستخدام الحساس المغناطيسي الداخلي، بينما توضّح الخريطة خط الاتجاه العام نحو مكة المكرمة بطريقة هندسية بحتة. إذا لاحظت اختلافاً بين قراءة البوصلة وموقع الكعبة على الخريطة، ابتعد عن المعادن والأجهزة الكهربائية الكبيرة وأبواب الحديد ثم أعد المحاولة، لأنها تخلط الحساس المغناطيسي وتجعل قراءة بوصلة القبلة غير ثابتة. الخريطة لا تتأثر بهذه العوامل، لذلك يُعتمد عليها أكثر عند الشك، مع التذكر أن الجمع بين البوصلة والخريطة هو الحل الأمثل.' },
                    { icon: '📐', h3: 'فهم زاوية القبلة نحو مكة المكرمة', body: 'زاوية القبلة هي الدرجة التي توضّح اتجاه الكعبة بالنسبة إلى الشمال الجغرافي. تختلف هذه الزاوية من بلد إلى آخر ومن مدينة إلى أخرى لأن الحساب يعتمد على موقعك على سطح الأرض الكروية. تُقاس الزاوية بالدرجات في عقارب الساعة من الشمال الجغرافي، فالقيمة 0° تعني شمالاً و90° شرقاً و180° جنوباً و270° غرباً. مثلاً في الرياض تكون القبلة جنوب-غرب تقريباً، وفي إسطنبول جنوب-شرق، وفي القاهرة شرق، وفي جاكرتا غرب. معرفة قيمة زاوية القبلة لموقعك تساعدك على تحديد القبلة بسرعة باستخدام أي بوصلة عادية حين تغيب بوصلة القبلة الإلكترونية.' },
                ],
                close: 'الجمع بين تحديد القبلة من موقعي وبوصلة القبلة والخريطة هو الأسلوب الأنسب لمعظم المستخدمين. اتجاه القبلة لا يتغير بتغير الوقت أو اليوم لأن مكة المكرمة موقع ثابت على الأرض، لكنه يتغير بتغير موقعك أنت؛ لذلك إذا انتقلت من بلد إلى آخر، أو حتى من مدينة إلى أخرى داخل البلد نفسه، قد تختلف زاوية القبلة الجديدة بشكل ملحوظ عن السابقة. عند الشك في صحة الاتجاه يمكنك مقارنة قراءة بوصلة القبلة على الهاتف مع موقع الكعبة المشرفة على الخريطة، فإذا تطابقت القراءتان فالاتجاه صحيح، وإذا اختلفتا فالأرجح أن هناك تشويشاً مغناطيسياً يستلزم الاعتماد على الخريطة أكثر من البوصلة في تلك اللحظة.',
            },
            en: {
                h2: 'Complete Guide to Using the Qibla Compass',
                lead: 'This guide explains how to find the Qibla direction from your location or from a city you pick manually, how to interpret the Qibla angle, and how to use the Qibla compass together with the map to reach Mecca accurately.',
                cards: [
                    { icon: '🧭', h3: 'How does the Qibla compass work?', body: 'The Qibla compass uses your geographic coordinates (latitude and longitude) to compute the bearing toward the Kaaba in Mecca. These coordinates are converted into a direction angle measured in degrees clockwise from geographic north, and the result is shown as an arrow that helps you identify the correct direction. The computation relies on the astronomical Great-Circle formula, which is the most accurate way to measure the shortest geometric path between two points on the surface of Earth. The accuracy of the Qibla compass therefore does not depend on the time of day, but on the precision of the location it starts from, which is why modern GPS coordinates remain the best fit for most cases.' },
                    { icon: '📍', h3: 'Finding the Qibla from my location', body: 'When you tap "Find the Qibla from my location", the browser uses your current position after you grant access to GPS data. The more accurate the GPS signal, the clearer the Qibla angle becomes and the closer the value lands to reality, so it is best to use this method in an open area or near a window, especially inside large buildings. With these conditions in place, the Qibla direction from your location ends up very close to the actual bearing toward Mecca, with no need to enter any data manually, and is the fastest way to obtain a trustworthy result.' },
                    { icon: '🌍', h3: 'Picking a city manually', body: 'If you would rather not share your location, or geolocation is unavailable on your device, you can simply type a city name in the search field at the top of the page and pick it from the list. The list includes thousands of cities worldwide, and the Qibla calculation is based on the official coordinates of the selected city. Picking a city manually is useful for travelers who want to check the Qibla angle at their next destination before arrival, and the result remains accurate as long as you are within the boundaries of the chosen city or a nearby area.' },
                    { icon: '🗺️', h3: 'Using the compass with the map', body: 'The Qibla compass helps you point your phone toward the correct direction using the device’s internal magnetic sensor, while the map shows the great-circle line toward Mecca in a purely geometric way. If you see a mismatch between the compass reading and the position of the Kaaba on the map, step away from large metal objects, electronic appliances and iron doors and try again, because these items disturb the magnetic sensor and make the Qibla compass reading unstable. The map is not affected by such factors, so when in doubt the map is more reliable, and the best workflow is to combine compass and map together.' },
                    { icon: '📐', h3: 'Understanding the Qibla angle toward Mecca', body: 'The Qibla angle is the degree value that indicates the direction of the Kaaba relative to geographic north. This angle differs between countries and between cities, because the computation depends on your position on the spherical surface of Earth. It is measured in degrees clockwise from geographic north — 0° means north, 90° east, 180° south, 270° west. For example, the Qibla is roughly southwest from Riyadh, southeast from Istanbul, east from Cairo, and west from Jakarta. Knowing the Qibla angle for your location lets you find the direction quickly with any ordinary compass when an electronic Qibla compass is not available.' },
                ],
                close: 'Combining "Qibla from my location" with the Qibla compass and the map is the most reliable workflow for most users. The Qibla direction does not change with the time of day because Mecca is a fixed point on Earth, but it does change with your own position; so when you move from country to country, or even between cities inside the same country, the new Qibla angle may differ noticeably from the previous one. When in doubt about the bearing, you can compare the Qibla compass reading on the phone against the location of the Kaaba on the map: if both agree the direction is sound, and if they disagree magnetic interference is the likely cause and the map should be trusted more than the compass at that moment.',
            },
            fr: {
                h2: 'Guide complet pour utiliser la boussole de la Qibla',
                lead: 'Ce guide explique comment trouver la direction de la Qibla depuis votre position ou depuis une ville choisie manuellement, comment interpréter l\\u2019angle de la Qibla, et comment utiliser la boussole de la Qibla avec la carte pour atteindre La Mecque avec précision.',
                cards: [
                    { icon: '🧭', h3: 'Comment fonctionne la boussole de la Qibla ?', body: 'La boussole de la Qibla utilise vos coordonnées géographiques (latitude et longitude) pour calculer la direction vers la Kaaba à La Mecque. Ces coordonnées sont converties en un angle exprimé en degrés depuis le nord géographique dans le sens des aiguilles d\\u2019une montre, et le résultat est affiché sous forme de flèche qui vous aide à identifier la bonne direction. Le calcul repose sur la formule astronomique du grand cercle, la méthode la plus précise pour mesurer le chemin géométrique le plus court entre deux points à la surface de la Terre. La précision de la boussole de la Qibla ne dépend donc pas de l\\u2019heure mais de la précision de la position de départ, ce qui rend les coordonnées GPS modernes les plus adaptées dans la plupart des cas.' },
                    { icon: '📍', h3: 'Trouver la Qibla depuis ma position', body: 'Lorsque vous appuyez sur « Trouver la Qibla depuis ma position », le navigateur utilise votre position actuelle après que vous l\\u2019autorisez à accéder aux données GPS. Plus le signal GPS est précis, plus l\\u2019angle de la Qibla est clair et proche de la valeur réelle ; il est donc préférable d\\u2019utiliser cette méthode en zone ouverte ou près d\\u2019une fenêtre, surtout à l\\u2019intérieur de grands bâtiments. Avec ces conditions, la direction de la Qibla depuis votre position devient très proche du cap réel vers La Mecque, sans saisie manuelle de données, et c\\u2019est la méthode la plus rapide pour un résultat fiable.' },
                    { icon: '🌍', h3: 'Choisir une ville manuellement', body: 'Si vous préférez ne pas partager votre position, ou si la géolocalisation n\\u2019est pas disponible sur votre appareil, vous pouvez simplement taper un nom de ville dans le champ de recherche en haut de la page et le choisir dans la liste. La liste contient des milliers de villes dans le monde, et le calcul de la Qibla repose sur les coordonnées officielles de la ville sélectionnée. Le choix manuel d\\u2019une ville est utile aux voyageurs qui veulent vérifier l\\u2019angle de la Qibla à leur prochaine destination avant l\\u2019arrivée, et le résultat reste précis tant que vous êtes dans les limites de la ville choisie.' },
                    { icon: '🗺️', h3: 'Utiliser la boussole avec la carte', body: 'La boussole de la Qibla vous aide à orienter le téléphone dans la bonne direction grâce au capteur magnétique interne, tandis que la carte affiche la ligne du grand cercle vers La Mecque de manière purement géométrique. En cas d\\u2019écart entre la boussole et la position de la Kaaba sur la carte, éloignez-vous des grands objets métalliques, des appareils électroniques et des portes en fer puis recommencez, car ces éléments perturbent le capteur magnétique et rendent la lecture de la boussole de la Qibla instable. La carte n\\u2019est pas concernée par ces facteurs, donc en cas de doute la carte est plus fiable, et la meilleure approche reste de combiner les deux.' },
                    { icon: '📐', h3: 'Comprendre l\\u2019angle de la Qibla vers La Mecque', body: 'L\\u2019angle de la Qibla est la valeur en degrés qui indique la direction de la Kaaba par rapport au nord géographique. Cet angle change d\\u2019un pays à l\\u2019autre et d\\u2019une ville à l\\u2019autre, car le calcul dépend de votre position à la surface sphérique de la Terre. Il est mesuré en degrés dans le sens horaire depuis le nord : 0° nord, 90° est, 180° sud, 270° ouest. Par exemple, la Qibla est environ sud-ouest depuis Riyad, sud-est depuis Istanbul, est depuis Le Caire et ouest depuis Jakarta. Connaître l\\u2019angle de la Qibla pour votre position permet de trouver le cap rapidement avec une boussole ordinaire si la boussole électronique n\\u2019est pas disponible.' },
                ],
                close: 'Combiner « Qibla depuis ma position » avec la boussole de la Qibla et la carte est le flux le plus fiable pour la plupart des utilisateurs. La direction de la Qibla ne change pas avec l\\u2019heure car La Mecque est un point fixe sur Terre, mais elle change avec votre propre position ; ainsi, lorsque vous passez d\\u2019un pays à un autre, ou même entre villes d\\u2019un même pays, le nouvel angle peut différer nettement. En cas de doute, comparez la boussole de la Qibla avec la position de la Kaaba sur la carte : si les deux concordent le cap est juste, sinon les interférences magnétiques sont probables et la carte est plus fiable que la boussole à cet instant.',
            },
            tr: {
                h2: 'Kıble Pusulasını Kullanmak için Eksiksiz Kılavuz',
                lead: 'Bu kılavuz, kıble yönünü konumunuzdan veya elle seçtiğiniz bir şehirden nasıl bulacağınızı, kıble açısını nasıl yorumlayacağınızı ve Mekke\\u2019ye doğru kıble pusulasını harita ile birlikte hassas biçimde nasıl kullanacağınızı açıklar.',
                cards: [
                    { icon: '🧭', h3: 'Kıble pusulası nasıl çalışır?', body: 'Kıble pusulası, coğrafi koordinatlarınızı (enlem ve boylam) kullanarak Mekke\\u2019deki Kâbe\\u2019ye yönü hesaplar. Bu koordinatlar coğrafi kuzeyden saat yönünde derecelerle ölçülen bir yön açısına dönüştürülür ve sonuç, doğru yönü belirlemenize yardımcı bir okla gösterilir. Hesap, yeryüzündeki iki nokta arasındaki en kısa geometrik yolu ölçen en doğru yöntem olan astronomik Great-Circle formülüne dayanır. Bu nedenle kıble pusulasının doğruluğu günün saatine değil, başlangıç konumunun doğruluğuna bağlıdır; bu da modern GPS koordinatlarını çoğu durumda en uygun seçenek yapar.' },
                    { icon: '📍', h3: 'Konumumdan kıble yönünü bulma', body: '\\u201CKıbleyi konumumdan bul\\u201D\\u2019a bastığınızda, tarayıcı GPS verilerine erişim izni verdikten sonra mevcut konumunuzu kullanır. GPS sinyali ne kadar doğruysa, kıble açısı o kadar net ve gerçeğe yakın olur; bu yüzden bu yöntemi açık alanda veya pencere yakınında, özellikle büyük binaların içindeyken kullanmak daha iyidir. Bu koşullar sağlandığında konumunuzdan kıble yönü, Mekke\\u2019ye gerçek yöne çok yakın olur ve elle veri girmeden güvenilir sonuç almak için en hızlı yoldur.' },
                    { icon: '🌍', h3: 'Şehri elle seçme', body: 'Konumunuzu paylaşmak istemiyorsanız veya cihazınızda konum servisi yoksa, sayfanın üst kısmındaki arama alanına bir şehir adı yazıp listeden seçebilirsiniz. Listede dünyanın dört bir yanından binlerce şehir bulunur ve kıble hesabı seçilen şehrin resmi koordinatlarına göre yapılır. Şehri elle seçmek, varış noktasındaki kıble açısını önceden öğrenmek isteyen yolcular için yararlıdır; seçilen şehrin sınırları içinde veya yakın bölgede olduğunuz sürece sonuç doğruluğunu korur.' },
                    { icon: '🗺️', h3: 'Pusulayı harita ile birlikte kullanma', body: 'Kıble pusulası, telefonunuzu cihazın iç manyetik sensörü aracılığıyla doğru yöne çevirmenize yardımcı olur; harita ise Mekke\\u2019ye giden büyük daire çizgisini saf geometrik biçimde gösterir. Pusula okuması ile haritadaki Kâbe konumu arasında fark görürseniz, büyük metal eşyalardan, elektronik cihazlardan ve demir kapılardan uzaklaşıp tekrar deneyin; bu nesneler manyetik sensörü etkileyerek kıble pusulasının okumasını dengesizleştirir. Harita bu etkilenmeden uzaktır, bu yüzden şüphe halinde haritaya daha çok güvenilir; en iyisi pusula ile haritayı birlikte kullanmaktır.' },
                    { icon: '📐', h3: 'Mekke yönündeki kıble açısını anlama', body: 'Kıble açısı, Kâbe\\u2019nin coğrafi kuzeye göre yönünü gösteren derece değeridir. Bu açı, hesabın yeryüzünün küresel yüzeyindeki konumunuza bağlı olması nedeniyle ülkeden ülkeye ve şehirden şehre değişir. Coğrafi kuzeyden saat yönünde derecelerle ölçülür: 0° kuzey, 90° doğu, 180° güney, 270° batı. Örneğin, kıble Riyad\\u2019dan yaklaşık güneybatı, İstanbul\\u2019dan güneydoğu, Kahire\\u2019den doğu ve Cakarta\\u2019dan batıdadır. Konumunuza ait kıble açısını bilmek, elektronik kıble pusulası yoksa sıradan bir pusula ile yönü hızlıca bulmanızı sağlar.' },
                ],
                close: 'Konumumdan kıbleyi, kıble pusulasını ve haritayı birlikte kullanmak çoğu kullanıcı için en güvenilir yoldur. Kıble yönü gün saatine göre değişmez çünkü Mekke yeryüzünde sabittir, ama kendi konumunuza göre değişir; ülkeden ülkeye, hatta aynı ülkede şehirden şehre geçtiğinizde yeni açı belirgin biçimde farklı olabilir. Yön konusunda emin olmadığınızda, kıble pusulası okumasını harita üzerindeki Kâbe konumu ile karşılaştırın: ikisi uyuşuyorsa yön doğrudur, uyuşmuyorsa manyetik karışma muhtemeldir ve o anda haritaya pusuladan daha çok güvenmek doğru olur.',
            },
            ur: {
                h2: 'قبلہ کے قطب نما کے استعمال کا مکمل رہنما',
                lead: 'یہ رہنما بتاتا ہے کہ آپ اپنے مقام سے یا منتخب کردہ شہر سے قبلہ کی سمت کیسے معلوم کریں، قبلہ کی زاویہ کیسے سمجھیں، اور مکہ مکرمہ تک پہنچنے کے لیے قبلہ کے قطب نما کو نقشے کے ساتھ کیسے درست طور پر استعمال کریں۔',
                cards: [
                    { icon: '🧭', h3: 'قبلہ کا قطب نما کیسے کام کرتا ہے؟', body: 'قبلہ کا قطب نما آپ کے جغرافیائی نقاط (طول و عرض البلد) استعمال کرکے مکہ مکرمہ میں کعبہ کی طرف سمت کا حساب لگاتا ہے۔ ان نقاط کو جغرافیائی شمال سے گھڑی کے رخ پر درجات میں ماپی گئی سمتی زاویہ میں تبدیل کیا جاتا ہے، اور نتیجہ ایک تیر کی شکل میں دکھایا جاتا ہے جو آپ کو صحیح سمت بتاتا ہے۔ حساب Great-Circle فلکی فارمولے پر مبنی ہے جو زمین کی سطح پر دو نقاط کے درمیان مختصر ترین ہندسی راستہ ناپنے کا سب سے درست طریقہ ہے۔ اسی لیے قبلہ کے قطب نما کی درستگی دن کے وقت پر نہیں بلکہ شروعاتی مقام کی درستگی پر منحصر ہے، اور جدید GPS نقاط زیادہ تر حالات میں موزوں ترین انتخاب ہیں۔' },
                    { icon: '📍', h3: 'اپنے مقام سے قبلہ کی سمت', body: 'جب آپ \\u201Cاپنے مقام سے قبلہ معلوم کریں\\u201D دباتے ہیں، براؤزر آپ کی موجودہ پوزیشن GPS ڈیٹا تک رسائی کی اجازت کے بعد استعمال کرتا ہے۔ GPS سگنل جتنا درست ہوگا، قبلہ کی زاویہ اتنی ہی واضح اور حقیقی قدر کے قریب ہوگی، اس لیے بہتر ہے کہ یہ طریقہ کھلی جگہ یا کھڑکی کے قریب استعمال کیا جائے، خاص طور پر بڑے عمارتوں کے اندر۔ ان شرائط پر آپ کے مقام سے قبلہ کی سمت مکہ مکرمہ کی اصل سمت کے بہت قریب ہو جاتی ہے، بغیر کسی دستی ڈیٹا کے، اور یہ معتبر نتیجہ حاصل کرنے کا تیز ترین طریقہ ہے۔' },
                    { icon: '🌍', h3: 'دستی طور پر شہر کا انتخاب', body: 'اگر آپ مقام شیئر نہیں کرنا چاہتے، یا آپ کے آلے پر مقام کی سہولت دستیاب نہیں، تو صفحے کے اوپری تلاش خانے میں شہر کا نام لکھ کر فہرست سے منتخب کر سکتے ہیں۔ فہرست میں دنیا بھر کے ہزاروں شہر شامل ہیں، اور قبلہ کا حساب منتخب شہر کے سرکاری نقاط پر مبنی ہے۔ شہر کا دستی انتخاب ان مسافروں کے لیے مفید ہے جو اپنی اگلی منزل کی قبلہ زاویہ پہلے سے جاننا چاہتے ہیں، اور نتیجہ اس وقت تک درست رہتا ہے جب تک آپ منتخب شہر کی حدود یا نزدیکی علاقے میں ہیں۔' },
                    { icon: '🗺️', h3: 'قطب نما کو نقشے کے ساتھ استعمال', body: 'قبلہ کا قطب نما آپ کے فون کو داخلی مقناطیسی سینسر کی مدد سے درست سمت میں رکھنے میں مدد دیتا ہے، جبکہ نقشہ خالص ہندسی طریقے سے مکہ مکرمہ کی طرف Great-Circle لائن دکھاتا ہے۔ اگر قطب نما کی قراءت اور نقشے پر کعبہ کی پوزیشن میں فرق نظر آئے، بڑے دھاتی اشیاء، الیکٹرانک آلات اور لوہے کے دروازوں سے دور ہو جائیں اور دوبارہ کوشش کریں، کیونکہ یہ سینسر کو متاثر کرکے قبلہ کے قطب نما کی قراءت کو غیر مستحکم بنا دیتے ہیں۔ نقشہ ایسے عوامل سے متاثر نہیں ہوتا، اس لیے شک کی صورت میں نقشہ زیادہ بھروسہ مند ہے، اور بہترین طریقہ دونوں کا مجموعہ ہے۔' },
                    { icon: '📐', h3: 'مکہ مکرمہ کی طرف قبلہ کی زاویہ', body: 'قبلہ کی زاویہ وہ درجہ ہے جو کعبہ کی سمت کو جغرافیائی شمال کے مقابلے میں ظاہر کرتا ہے۔ یہ زاویہ ملک سے ملک اور شہر سے شہر مختلف ہوتی ہے کیونکہ حساب زمین کی کروی سطح پر آپ کے مقام پر منحصر ہے۔ یہ جغرافیائی شمال سے گھڑی کے رخ پر درجات میں ماپی جاتی ہے: 0° شمال، 90° مشرق، 180° جنوب، 270° مغرب۔ مثال کے طور پر، ریاض سے قبلہ تقریباً جنوب-مغرب، استنبول سے جنوب-مشرق، قاہرہ سے مشرق اور جکارتہ سے مغرب میں ہے۔ اپنے مقام کی قبلہ زاویہ جاننا آپ کو الیکٹرانک قطب نما نہ ہونے پر کسی بھی عام قطب نما سے سمت تیزی سے معلوم کرنے میں مدد دیتا ہے۔' },
                ],
                close: '\\u201Cمیرے مقام سے قبلہ\\u201D، قبلہ کے قطب نما اور نقشے کا مجموعہ زیادہ تر صارفین کے لیے سب سے قابل اعتماد طریقہ ہے۔ قبلہ کی سمت دن کے وقت سے نہیں بدلتی کیونکہ مکہ مکرمہ زمین پر ایک مستقل مقام ہے، لیکن آپ کے اپنے مقام کے بدلنے سے بدلتی ہے؛ ایک ملک سے دوسرے ملک، یا ایک ہی ملک کے دو شہروں کے درمیان جانے پر نئی زاویہ نمایاں طور پر مختلف ہو سکتی ہے۔ شک کی صورت میں قبلہ کے قطب نما کی قراءت کا نقشے پر کعبہ کے مقام سے موازنہ کریں: اگر دونوں ملیں تو سمت درست ہے، ورنہ مقناطیسی مداخلت ممکن ہے اور اس وقت نقشے پر بھروسہ کرنا قطب نما سے بہتر ہے۔',
            },
            de: {
                h2: 'Vollständiger Leitfaden zum Qibla-Kompass',
                lead: 'Dieser Leitfaden erklärt, wie Sie die Qibla-Richtung von Ihrem Standort oder von einer manuell gewählten Stadt aus bestimmen, wie Sie den Qibla-Winkel deuten und wie Sie den Qibla-Kompass zusammen mit der Karte präzise nach Mekka einsetzen.',
                cards: [
                    { icon: '🧭', h3: 'Wie funktioniert der Qibla-Kompass?', body: 'Der Qibla-Kompass nutzt Ihre geographischen Koordinaten (Breite und Länge), um die Peilung zur Kaaba in Mekka zu berechnen. Diese Koordinaten werden in einen Richtungswinkel umgewandelt, der in Grad im Uhrzeigersinn vom geographischen Norden gemessen wird, und das Ergebnis erscheint als Pfeil, der Ihnen die richtige Richtung zeigt. Die Berechnung beruht auf der astronomischen Großkreis-Formel, der genauesten Methode, um den kürzesten geometrischen Weg zwischen zwei Punkten auf der Erdoberfläche zu messen. Die Genauigkeit des Qibla-Kompasses hängt also nicht von der Tageszeit ab, sondern von der Genauigkeit des Ausgangsorts; moderne GPS-Koordinaten sind daher in den meisten Fällen die beste Wahl.' },
                    { icon: '📍', h3: 'Qibla-Richtung von meinem Standort', body: 'Wenn Sie auf „Qibla von meinem Standort“ tippen, nutzt der Browser Ihre aktuelle Position, sobald Sie den Zugriff auf GPS-Daten erlauben. Je genauer das GPS-Signal, desto klarer wird der Qibla-Winkel und desto näher liegt der Wert am tatsächlichen, daher ist diese Methode in offenem Gelände oder am Fenster am besten, besonders innerhalb großer Gebäude. Unter diesen Bedingungen kommt die Qibla-Richtung von Ihrem Standort der echten Peilung nach Mekka sehr nahe — ohne manuelle Eingabe — und ist der schnellste Weg zu einem zuverlässigen Ergebnis.' },
                    { icon: '🌍', h3: 'Stadt manuell wählen', body: 'Wenn Sie Ihren Standort nicht teilen möchten oder die Geolokalisierung auf Ihrem Gerät nicht verfügbar ist, geben Sie einfach einen Stadtnamen in das Suchfeld am Seitenanfang ein und wählen Sie ihn aus der Liste. Die Liste umfasst tausende Städte weltweit, und die Qibla-Berechnung basiert auf den offiziellen Koordinaten der gewählten Stadt. Eine manuelle Stadtauswahl ist nützlich für Reisende, die den Qibla-Winkel ihres nächsten Ziels vor der Ankunft kennen wollen; das Ergebnis bleibt genau, solange Sie sich innerhalb der Stadtgrenzen oder einem nahen Bereich aufhalten.' },
                    { icon: '🗺️', h3: 'Kompass mit der Karte nutzen', body: 'Der Qibla-Kompass hilft Ihnen, das Telefon mithilfe des internen Magnetsensors in die richtige Richtung zu drehen, während die Karte die Großkreis-Linie nach Mekka rein geometrisch zeigt. Sehen Sie eine Abweichung zwischen Kompasswert und Kaaba-Position auf der Karte, entfernen Sie sich von großen Metallgegenständen, Elektronik und Eisentüren und probieren Sie es erneut, denn diese Objekte stören den Magnetsensor und machen die Anzeige des Qibla-Kompasses instabil. Die Karte ist davon nicht betroffen, im Zweifel ist sie zuverlässiger; der beste Ansatz ist die Kombination aus Kompass und Karte.' },
                    { icon: '📐', h3: 'Den Qibla-Winkel nach Mekka verstehen', body: 'Der Qibla-Winkel ist der Gradwert, der die Richtung der Kaaba relativ zum geographischen Norden angibt. Dieser Winkel unterscheidet sich von Land zu Land und von Stadt zu Stadt, weil die Berechnung von Ihrer Position auf der kugelförmigen Erdoberfläche abhängt. Er wird in Grad im Uhrzeigersinn vom Norden gemessen: 0° Nord, 90° Ost, 180° Süd, 270° West. So liegt die Qibla aus Riad etwa Südwest, aus Istanbul Südost, aus Kairo Ost und aus Jakarta West. Den Qibla-Winkel für Ihren Standort zu kennen, hilft, die Richtung mit jedem gewöhnlichen Kompass schnell zu finden, falls kein elektronischer Qibla-Kompass verfügbar ist.' },
                ],
                close: 'Die Kombination aus „Qibla von meinem Standort“, dem Qibla-Kompass und der Karte ist der zuverlässigste Workflow für die meisten Nutzer. Die Qibla-Richtung ändert sich nicht mit der Tageszeit, da Mekka ein fester Punkt auf der Erde ist, aber sie ändert sich mit Ihrer eigenen Position; wechseln Sie das Land, oder auch nur die Stadt innerhalb desselben Landes, kann der neue Winkel deutlich anders sein. Bei Zweifeln vergleichen Sie die Anzeige des Qibla-Kompasses mit der Kaaba-Position auf der Karte: stimmen beide überein, ist die Peilung in Ordnung, andernfalls liegt vermutlich magnetische Störung vor und die Karte sollte in diesem Moment vor dem Kompass den Vorzug erhalten.',
            },
            id: {
                h2: 'Panduan Lengkap Menggunakan Kompas Kiblat',
                lead: 'Panduan ini menjelaskan cara menemukan arah kiblat dari lokasi Anda atau dari kota yang Anda pilih secara manual, cara membaca sudut kiblat, dan cara menggunakan kompas kiblat bersama peta untuk mencapai Mekkah dengan akurat.',
                cards: [
                    { icon: '🧭', h3: 'Bagaimana kompas kiblat bekerja?', body: 'Kompas kiblat menggunakan koordinat geografis Anda (lintang dan bujur) untuk menghitung arah ke Kakbah di Mekkah. Koordinat tersebut diubah menjadi sudut arah yang diukur dalam derajat searah jarum jam dari utara geografis, dan hasilnya ditampilkan sebagai panah yang membantu Anda menentukan arah yang benar. Perhitungan menggunakan rumus astronomi Great-Circle, metode paling akurat untuk mengukur lintasan geometris terpendek antara dua titik di permukaan Bumi. Karena itu akurasi kompas kiblat tidak bergantung pada waktu, melainkan pada ketelitian lokasi awal; koordinat GPS modern menjadi pilihan paling sesuai pada sebagian besar kasus.' },
                    { icon: '📍', h3: 'Mencari kiblat dari lokasi saya', body: 'Saat Anda menekan "Cari kiblat dari lokasi saya", peramban menggunakan posisi Anda saat ini setelah Anda memberi izin akses GPS. Semakin akurat sinyal GPS, semakin jelas sudut kiblat dan semakin dekat ke nilai sebenarnya, sehingga lebih baik menggunakan metode ini di tempat terbuka atau dekat jendela, terutama di dalam gedung besar. Dengan kondisi tersebut, arah kiblat dari lokasi Anda menjadi sangat dekat dengan arah sebenarnya ke Mekkah, tanpa perlu memasukkan data secara manual, dan ini cara tercepat memperoleh hasil yang andal.' },
                    { icon: '🌍', h3: 'Memilih kota secara manual', body: 'Jika Anda tidak ingin membagikan lokasi atau geolokasi tidak tersedia di perangkat Anda, cukup ketik nama kota di kolom pencarian di bagian atas halaman dan pilih dari daftar. Daftar tersebut mencakup ribuan kota di seluruh dunia, dan perhitungan kiblat didasarkan pada koordinat resmi kota yang dipilih. Memilih kota secara manual berguna bagi pelancong yang ingin mengetahui sudut kiblat di tujuan berikutnya sebelum tiba; hasilnya tetap akurat selama Anda berada dalam batas kota tersebut atau di sekitarnya.' },
                    { icon: '🗺️', h3: 'Menggunakan kompas dengan peta', body: 'Kompas kiblat membantu Anda mengarahkan ponsel ke arah yang benar melalui sensor magnetik internal, sedangkan peta menunjukkan garis lingkaran besar ke Mekkah secara murni geometris. Jika ada perbedaan antara bacaan kompas dan posisi Kakbah di peta, jauhkan diri dari benda logam besar, peralatan elektronik, dan pintu besi, lalu coba lagi karena benda-benda tersebut mengganggu sensor magnetik dan membuat bacaan kompas kiblat tidak stabil. Peta tidak terpengaruh oleh hal itu, jadi saat ragu peta lebih dapat dipercaya, dan pendekatan terbaik adalah menggabungkan kompas dengan peta.' },
                    { icon: '📐', h3: 'Memahami sudut kiblat ke Mekkah', body: 'Sudut kiblat adalah nilai derajat yang menunjukkan arah Kakbah relatif terhadap utara geografis. Sudut ini berbeda antar negara dan antar kota karena perhitungan bergantung pada posisi Anda di permukaan Bumi yang berbentuk bola. Diukur dalam derajat searah jarum jam dari utara: 0° utara, 90° timur, 180° selatan, 270° barat. Misalnya, kiblat kira-kira barat daya dari Riyadh, tenggara dari Istanbul, timur dari Kairo, dan barat dari Jakarta. Mengetahui sudut kiblat untuk lokasi Anda memudahkan menemukan arah dengan kompas biasa apabila kompas kiblat elektronik tidak tersedia.' },
                ],
                close: 'Menggabungkan "kiblat dari lokasi saya" dengan kompas kiblat dan peta adalah alur kerja paling andal bagi sebagian besar pengguna. Arah kiblat tidak berubah seiring waktu karena Mekkah adalah titik tetap di Bumi, tetapi berubah seiring posisi Anda; ketika Anda berpindah negara, atau bahkan antar kota dalam negara yang sama, sudut baru bisa berbeda secara mencolok. Saat ragu, bandingkan bacaan kompas kiblat dengan letak Kakbah di peta: jika sepakat berarti arah benar, jika tidak gangguan magnetik kemungkinan besar penyebabnya, dan saat itu peta lebih dapat dipercaya daripada kompas.',
            },
            es: {
                h2: 'Guía completa para usar la brújula de la Qibla',
                lead: 'Esta guía explica cómo encontrar la dirección de la Qibla desde su ubicación o desde una ciudad elegida manualmente, cómo interpretar el ángulo de la Qibla y cómo usar la brújula de la Qibla junto con el mapa para llegar con precisión hacia La Meca.',
                cards: [
                    { icon: '🧭', h3: '¿Cómo funciona la brújula de la Qibla?', body: 'La brújula de la Qibla utiliza sus coordenadas geográficas (latitud y longitud) para calcular el rumbo hacia la Kaaba en La Meca. Estas coordenadas se convierten en un ángulo medido en grados en sentido horario desde el norte geográfico, y el resultado se muestra como una flecha que le ayuda a identificar la dirección correcta. El cálculo se basa en la fórmula astronómica del círculo máximo, el método más preciso para medir la trayectoria geométrica más corta entre dos puntos sobre la superficie de la Tierra. Por eso la precisión de la brújula de la Qibla no depende de la hora, sino de la precisión del punto de partida, y por eso las coordenadas GPS modernas son la mejor opción en la mayoría de los casos.' },
                    { icon: '📍', h3: 'Encontrar la Qibla desde mi ubicación', body: 'Cuando pulsa "Encontrar la Qibla desde mi ubicación", el navegador utiliza su posición actual tras concederle acceso a los datos del GPS. Cuanto más precisa sea la señal GPS, más claro será el ángulo de la Qibla y más cerca quedará del valor real, por eso conviene usar esta opción al aire libre o cerca de una ventana, especialmente dentro de edificios grandes. En esas condiciones, la dirección de la Qibla desde su ubicación queda muy cerca del rumbo verdadero hacia La Meca, sin necesidad de introducir datos manualmente, y es la forma más rápida de obtener un resultado fiable.' },
                    { icon: '🌍', h3: 'Elegir una ciudad manualmente', body: 'Si prefiere no compartir su ubicación o la geolocalización no está disponible en su dispositivo, simplemente escriba un nombre de ciudad en el campo de búsqueda en la parte superior de la página y elíjalo de la lista. La lista incluye miles de ciudades en todo el mundo, y el cálculo de la Qibla se basa en las coordenadas oficiales de la ciudad seleccionada. Elegir una ciudad manualmente es útil para viajeros que quieren conocer el ángulo de la Qibla en su próximo destino antes de llegar; el resultado se mantiene preciso mientras esté dentro de los límites de la ciudad elegida.' },
                    { icon: '🗺️', h3: 'Usar la brújula con el mapa', body: 'La brújula de la Qibla le ayuda a apuntar el teléfono en la dirección correcta usando el sensor magnético interno, mientras que el mapa muestra la línea de círculo máximo hacia La Meca de forma puramente geométrica. Si nota una diferencia entre la lectura de la brújula y la posición de la Kaaba en el mapa, aléjese de objetos metálicos grandes, aparatos electrónicos y puertas de hierro y vuelva a intentarlo, porque interfieren con el sensor magnético y hacen inestable la lectura de la brújula de la Qibla. El mapa no se ve afectado, así que en caso de duda el mapa es más fiable y la mejor estrategia es combinar ambos.' },
                    { icon: '📐', h3: 'Entender el ángulo de la Qibla hacia La Meca', body: 'El ángulo de la Qibla es el valor en grados que indica la dirección de la Kaaba respecto al norte geográfico. Este ángulo varía entre países y entre ciudades porque el cálculo depende de su posición en la superficie esférica de la Tierra. Se mide en grados en sentido horario desde el norte: 0° norte, 90° este, 180° sur, 270° oeste. Por ejemplo, la Qibla es más o menos suroeste desde Riad, sureste desde Estambul, este desde El Cairo y oeste desde Yakarta. Conocer el ángulo de la Qibla para su ubicación permite encontrar el rumbo rápidamente con una brújula corriente cuando no haya brújula electrónica.' },
                ],
                close: 'Combinar "Qibla desde mi ubicación" con la brújula de la Qibla y el mapa es el flujo más fiable para la mayoría de los usuarios. La dirección de la Qibla no cambia con la hora del día porque La Meca es un punto fijo en la Tierra, pero sí cambia con su propia posición; al pasar de un país a otro, o incluso entre ciudades del mismo país, el nuevo ángulo puede ser notablemente distinto. Ante la duda, compare la lectura de la brújula de la Qibla con la ubicación de la Kaaba en el mapa: si ambas coinciden el rumbo es correcto, si no probablemente haya interferencia magnética y conviene confiar en el mapa más que en la brújula en ese momento.',
            },
            bn: {
                h2: 'কিবলা কম্পাস ব্যবহারের সম্পূর্ণ নির্দেশিকা',
                lead: 'এই নির্দেশিকা ব্যাখ্যা করে কীভাবে আপনি নিজের অবস্থান থেকে বা ম্যানুয়ালি বেছে নেওয়া শহর থেকে কিবলার দিক জানবেন, কিবলার কোণ কীভাবে বুঝবেন এবং মক্কার দিকে যেতে কিবলা কম্পাসকে মানচিত্রের সাথে কীভাবে সঠিকভাবে ব্যবহার করবেন।',
                cards: [
                    { icon: '🧭', h3: 'কিবলা কম্পাস কীভাবে কাজ করে?', body: 'কিবলা কম্পাস আপনার ভৌগোলিক স্থানাঙ্ক (অক্ষাংশ ও দ্রাঘিমাংশ) ব্যবহার করে মক্কার কাবার দিকে দিক হিসাব করে। এই স্থানাঙ্কগুলোকে ভৌগোলিক উত্তর থেকে ঘড়ির কাঁটার দিকে ডিগ্রিতে মাপা একটি দিকনির্দেশী কোণে রূপান্তর করা হয়, এবং ফলাফল একটি তীরের আকারে দেখানো হয় যা সঠিক দিক চিনতে সাহায্য করে। গণনা Great-Circle জ্যোতির্বৈজ্ঞানিক সূত্রের উপর ভিত্তি করে—পৃথিবীর পৃষ্ঠে দুটি বিন্দুর মধ্যে সংক্ষিপ্ততম জ্যামিতিক পথ মাপার সবচেয়ে নির্ভুল উপায়। তাই কিবলা কম্পাসের নির্ভুলতা দিনের সময়ের উপর নয়, বরং প্রারম্ভিক অবস্থানের নির্ভুলতার উপর নির্ভর করে; অধিকাংশ ক্ষেত্রে আধুনিক GPS স্থানাঙ্ক সবচেয়ে উপযুক্ত।' },
                    { icon: '📍', h3: 'আমার অবস্থান থেকে কিবলা', body: '"আমার অবস্থান থেকে কিবলা" চাপলে ব্রাউজার GPS ডেটায় প্রবেশের অনুমতি দেওয়ার পর আপনার বর্তমান অবস্থান ব্যবহার করে। GPS সংকেত যত নির্ভুল, কিবলার কোণ তত স্পষ্ট ও বাস্তব মানের কাছাকাছি; তাই এই পদ্ধতি খোলা জায়গায় বা জানালার কাছে, বিশেষত বড় ভবনের ভেতরে, ব্যবহার করাই উত্তম। এই শর্তগুলো পূরণ হলে আপনার অবস্থান থেকে কিবলার দিক মক্কার প্রকৃত দিকের খুব কাছে যায়, ম্যানুয়াল ডেটা ছাড়াই, এবং এটি বিশ্বস্ত ফল পাওয়ার দ্রুততম উপায়।' },
                    { icon: '🌍', h3: 'ম্যানুয়ালি শহর বেছে নেওয়া', body: 'যদি আপনি অবস্থান শেয়ার না করতে চান বা আপনার ডিভাইসে জিওলোকেশন না থাকে, পৃষ্ঠার শীর্ষে অনুসন্ধান বাক্সে শহরের নাম লিখুন এবং তালিকা থেকে নির্বাচন করুন। তালিকায় বিশ্বের হাজার হাজার শহর রয়েছে, এবং কিবলার গণনা নির্বাচিত শহরের সরকারি স্থানাঙ্কের উপর ভিত্তি করে। ম্যানুয়ালি শহর নির্বাচন ভ্রমণকারীদের জন্য উপযোগী যারা পরবর্তী গন্তব্যে পৌঁছানোর আগেই কিবলার কোণ জানতে চান; নির্বাচিত শহরের সীমানার মধ্যে থাকলে ফলাফল নির্ভুল থাকে।' },
                    { icon: '🗺️', h3: 'কম্পাস ও মানচিত্র একসাথে', body: 'কিবলা কম্পাস ফোনের অভ্যন্তরীণ চৌম্বক সেন্সরের সাহায্যে আপনাকে সঠিক দিকে ফোন ঘোরাতে সাহায্য করে, আর মানচিত্র মক্কার দিকে বৃহৎ বৃত্ত রেখা সম্পূর্ণ জ্যামিতিকভাবে দেখায়। যদি কম্পাসের পাঠ ও মানচিত্রে কাবার অবস্থানের মধ্যে পার্থক্য দেখেন, বড় ধাতব বস্তু, ইলেকট্রনিক যন্ত্র এবং লোহার দরজা থেকে দূরে গিয়ে আবার চেষ্টা করুন, কারণ এগুলো চৌম্বক সেন্সরে প্রভাব ফেলে এবং কিবলা কম্পাসের পাঠ অস্থির করে। মানচিত্র এগুলোতে প্রভাবিত হয় না, তাই সন্দেহ হলে মানচিত্র বেশি বিশ্বস্ত; সর্বোত্তম পদ্ধতি হলো দুটোই একসাথে ব্যবহার।' },
                    { icon: '📐', h3: 'মক্কার দিকে কিবলার কোণ বোঝা', body: 'কিবলার কোণ হলো ডিগ্রি মান যা ভৌগোলিক উত্তরের সাপেক্ষে কাবার দিক নির্দেশ করে। দেশ ও শহরভেদে এই কোণ বদলায় কারণ গণনা পৃথিবীর গোলকাকার পৃষ্ঠে আপনার অবস্থানের উপর নির্ভর করে। এটি ভৌগোলিক উত্তর থেকে ঘড়ির কাঁটার দিকে ডিগ্রিতে মাপা হয়: 0° উত্তর, 90° পূর্ব, 180° দক্ষিণ, 270° পশ্চিম। উদাহরণস্বরূপ, রিয়াদ থেকে কিবলা মোটামুটি দক্ষিণ-পশ্চিম, ইস্তাম্বুল থেকে দক্ষিণ-পূর্ব, কায়রো থেকে পূর্ব এবং জাকার্তা থেকে পশ্চিম। আপনার অবস্থানের জন্য কিবলার কোণ জানা থাকলে ইলেকট্রনিক কম্পাস না থাকলেও সাধারণ কম্পাসে দ্রুত দিক খুঁজে নেওয়া যায়।' },
                ],
                close: '"আমার অবস্থান থেকে কিবলা", কিবলা কম্পাস ও মানচিত্রের সমন্বয়ই অধিকাংশ ব্যবহারকারীর জন্য সবচেয়ে নির্ভরযোগ্য পদ্ধতি। কিবলার দিক দিনের সময়ের সাথে বদলায় না কারণ মক্কা পৃথিবীর একটি স্থির বিন্দু, তবে আপনার নিজের অবস্থানের সাথে বদলায়; এক দেশ থেকে আরেক দেশে, এমনকি একই দেশের একটি শহর থেকে অন্য শহরে গেলে নতুন কোণ লক্ষণীয়ভাবে আলাদা হতে পারে। সন্দেহ হলে কিবলা কম্পাসের পাঠ মানচিত্রে কাবার অবস্থানের সাথে মিলিয়ে দেখুন: মিললে দিক সঠিক, না মিললে চৌম্বক বিঘ্ন সম্ভাব্য, এবং তখন কম্পাসের চেয়ে মানচিত্রের উপর নির্ভর করাই ভালো।',
            },
            ms: {
                h2: 'Panduan Lengkap Menggunakan Kompas Kiblat',
                lead: 'Panduan ini menerangkan cara mencari arah kiblat dari lokasi anda atau dari bandar yang anda pilih secara manual, cara memahami sudut kiblat, dan cara menggunakan kompas kiblat bersama peta untuk sampai ke Makkah dengan tepat.',
                cards: [
                    { icon: '🧭', h3: 'Bagaimana kompas kiblat berfungsi?', body: 'Kompas kiblat menggunakan koordinat geografi anda (latitud dan longitud) untuk mengira arah ke Kaabah di Makkah. Koordinat ini ditukar kepada sudut arah yang diukur dalam darjah ikut arah jam dari utara geografi, dan hasilnya dipaparkan sebagai anak panah yang membantu anda mengenal pasti arah yang betul. Pengiraan menggunakan formula astronomi Great-Circle, kaedah paling tepat untuk mengukur laluan geometri terpendek antara dua titik di permukaan Bumi. Oleh itu ketepatan kompas kiblat tidak bergantung kepada masa, tetapi pada ketepatan lokasi mula; koordinat GPS moden adalah pilihan terbaik dalam kebanyakan keadaan.' },
                    { icon: '📍', h3: 'Mencari kiblat dari lokasi saya', body: 'Apabila anda menekan "Cari kiblat dari lokasi saya", pelayar menggunakan kedudukan semasa anda selepas anda memberi kebenaran akses GPS. Semakin tepat isyarat GPS, semakin jelas sudut kiblat dan semakin hampir kepada nilai sebenar, jadi kaedah ini lebih baik di kawasan terbuka atau dekat tingkap, terutama di dalam bangunan besar. Dengan keadaan ini, arah kiblat dari lokasi anda menjadi sangat hampir kepada arah sebenar ke Makkah, tanpa perlu memasukkan data secara manual, dan ini cara paling pantas untuk mendapat hasil yang dipercayai.' },
                    { icon: '🌍', h3: 'Memilih bandar secara manual', body: 'Jika anda lebih suka tidak berkongsi lokasi atau geolokasi tidak tersedia pada peranti anda, taipkan nama bandar dalam medan carian di bahagian atas halaman dan pilih daripada senarai. Senarai ini meliputi ribuan bandar di seluruh dunia, dan pengiraan kiblat berasaskan koordinat rasmi bandar yang dipilih. Memilih bandar secara manual berguna kepada pelancong yang ingin mengetahui sudut kiblat di destinasi seterusnya sebelum tiba; hasilnya kekal tepat selagi anda berada dalam sempadan bandar yang dipilih atau kawasan berdekatan.' },
                    { icon: '🗺️', h3: 'Menggunakan kompas dengan peta', body: 'Kompas kiblat membantu anda menghalakan telefon ke arah yang betul menggunakan sensor magnet dalaman, manakala peta menunjukkan garis bulatan besar ke Makkah secara semata-mata geometri. Jika ada perbezaan antara bacaan kompas dengan kedudukan Kaabah pada peta, jauhkan diri daripada objek logam besar, peralatan elektronik dan pintu besi lalu cuba sekali lagi, kerana ia mengganggu sensor magnet dan menjadikan bacaan kompas kiblat tidak stabil. Peta tidak terjejas oleh faktor ini, jadi ketika ragu peta lebih boleh dipercayai, dan pendekatan terbaik ialah menggabungkan kompas dengan peta.' },
                    { icon: '📐', h3: 'Memahami sudut kiblat ke Makkah', body: 'Sudut kiblat ialah nilai darjah yang menunjukkan arah Kaabah relatif kepada utara geografi. Sudut ini berbeza antara negara dan antara bandar kerana pengiraan bergantung kepada kedudukan anda di permukaan Bumi yang berbentuk sfera. Ia diukur dalam darjah ikut arah jam dari utara: 0° utara, 90° timur, 180° selatan, 270° barat. Contohnya, kiblat kira-kira barat daya dari Riyadh, tenggara dari Istanbul, timur dari Kaherah dan barat dari Jakarta. Mengetahui sudut kiblat untuk lokasi anda membolehkan anda mencari arah dengan cepat menggunakan mana-mana kompas biasa apabila kompas kiblat elektronik tidak tersedia.' },
                ],
                close: 'Menggabungkan "kiblat dari lokasi saya" dengan kompas kiblat dan peta ialah aliran kerja paling dipercayai bagi kebanyakan pengguna. Arah kiblat tidak berubah mengikut masa kerana Makkah ialah titik tetap di Bumi, tetapi ia berubah mengikut kedudukan anda; apabila anda berpindah negara, atau antara bandar dalam negara yang sama, sudut baharu mungkin berbeza dengan ketara. Apabila ragu, bandingkan bacaan kompas kiblat dengan kedudukan Kaabah pada peta: jika bersetuju arah itu betul, jika tidak gangguan magnet kemungkinan puncanya, dan pada saat itu peta lebih boleh dipercayai daripada kompas.',
            },
        };
        try {
            const _g = _qHubGuide[seo.lang] || _qHubGuide.en;
            const _cardsHtml = _g.cards.map((c, idx) => {
                const fullWidth = (idx === _g.cards.length - 1) ? ' qibla-hub-master-card--wide' : '';
                return \`<article class="qibla-hub-master-card\${fullWidth}"><div class="qibla-hub-master-icon" aria-hidden="true">\${c.icon}</div><div class="qibla-hub-master-text"><h3 class="qibla-hub-master-h3">\${_escHtml(c.h3)}</h3><p class="qibla-hub-master-body">\${_escHtml(c.body)}</p></div></article>\`;
            }).join('');
            const _sectionHtml = \`<div class="section-card qibla-hub-only qibla-hub-master"><div class="qibla-hub-master-header"><h2 class="qibla-hub-master-h2">\${_escHtml(_g.h2)}</h2><p class="qibla-hub-master-lead">\${_escHtml(_g.lead)}</p></div><div class="qibla-hub-master-grid">\${_cardsHtml}</div><p class="qibla-hub-master-close">\${_escHtml(_g.close)}</p></div>\`;
            // Anchor: insert just BEFORE the FAQ section card. Use the unique
            // <h2 id="qibla-faq-title"> as the anchor.
            html = html.replace(
                /(<!-- Section 8: FAQ \\(both modes, different content\\) -->\\s*<div class="section-card">\\s*<h2 id="qibla-faq-title")/,
                _sectionHtml + '$1'
            );
        } catch (_e) { /* silent — Q-Hub-C unified guide section optional */ }`;

srv = srv.substring(0, startIdx) + NEW_BLOCK + srv.substring(blockEnd);

// ───────────────────────────────────────────────────────────────────────
// 2) Replace old CSS (qibla-hub-guide-* + qibla-hub-authority-*) with
//    new qibla-hub-master-* design (1180px container, 2-col grid, soft
//    green border + radius 20px + shadow, full-width last card).
// ───────────────────────────────────────────────────────────────────────

const CSS_OLD = `
/* ── Phase Q-Hub-A (2026-05-04): Qibla Hub guide card section ── */
.qibla-hub-guide-card-wrap { padding: 18px 16px; }
.qibla-hub-guide-h2 { margin: 0 0 8px; font-size: 1.25rem; line-height: 1.35; }
.qibla-hub-guide-lead { margin: 0 0 16px; color: var(--text-light); line-height: 1.7; font-size: 0.97rem; }
.qibla-hub-guide-grid { display: grid; gap: 12px; grid-template-columns: 1fr; }
@media (min-width: 720px) { .qibla-hub-guide-grid { grid-template-columns: 1fr 1fr; gap: 14px; } }
.qibla-hub-guide-card { background: var(--card-soft, rgba(0,0,0,0.03)); border: 1px solid var(--border, rgba(0,0,0,0.08)); border-radius: 12px; padding: 14px 14px 12px; }
html[data-theme="dark"] .qibla-hub-guide-card { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08); }
.qibla-hub-guide-h3 { margin: 0 0 6px; font-size: 1.02rem; line-height: 1.4; color: var(--text); }
.qibla-hub-guide-body { margin: 0; font-size: 0.94rem; line-height: 1.75; color: var(--text-light); }
/* Qibla Hub gateway: hide hub-only sections on city pages, hide city-only on hub */
html.qibla-hub-page .qibla-city-only { display: none !important; }

/* ── Phase Q-Hub-B (2026-05-04): Qibla Hub authority section ── */
.qibla-hub-authority { padding: 18px 16px; }
.qibla-hub-authority-header { margin-bottom: 14px; }
.qibla-seo-kicker { display: inline-block; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--accent, #1a4a1a); margin-bottom: 6px; opacity: 0.85; }
.qibla-hub-authority-h2 { margin: 0 0 8px; font-size: 1.25rem; line-height: 1.35; color: var(--text); }
.qibla-hub-authority-lead { margin: 0 0 4px; color: var(--text-light); line-height: 1.7; font-size: 0.97rem; }
.qibla-hub-authority-grid { display: grid; gap: 12px; grid-template-columns: 1fr; margin-top: 14px; }
@media (min-width: 720px) { .qibla-hub-authority-grid { grid-template-columns: 1fr 1fr; gap: 14px; } }
.qibla-hub-authority-card { background: var(--card-soft, rgba(0,0,0,0.03)); border: 1px solid var(--border, rgba(0,0,0,0.08)); border-radius: 12px; padding: 14px 14px 12px; margin: 0; }
html[data-theme="dark"] .qibla-hub-authority-card { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08); }
.qibla-hub-authority-h3 { margin: 0 0 6px; font-size: 1.02rem; line-height: 1.4; color: var(--text); }
.qibla-hub-authority-body { margin: 0; font-size: 0.94rem; line-height: 1.75; color: var(--text-light); }
.qibla-hub-authority-close { margin: 16px 0 0; font-size: 0.94rem; line-height: 1.75; color: var(--text-light); }`;

const CSS_NEW = `
/* ── Phase Q-Hub-C (2026-05-04): merged unified Qibla Hub guide section. ── */
/* Replaces the dual guide+authority blocks with a single visually-compact   */
/* container (max 1180px), 2-col grid desktop / 1-col mobile, icon prefix.   */
/* Qibla Hub gateway: hide hub-only sections on city pages, hide city-only on hub */
html.qibla-hub-page .qibla-city-only { display: none !important; }

.qibla-hub-master {
    max-width: 1180px;
    margin-inline: auto;
    padding: 22px 18px 24px;
}
.qibla-hub-master-header { margin-bottom: 16px; text-align: start; }
.qibla-hub-master-h2 { margin: 0 0 8px; font-size: 1.32rem; line-height: 1.35; color: var(--text); font-weight: 700; }
.qibla-hub-master-lead { margin: 0; color: var(--text-light); line-height: 1.75; font-size: 0.98rem; }
.qibla-hub-master-grid {
    display: grid;
    gap: 14px;
    grid-template-columns: 1fr;
    margin-top: 18px;
}
@media (min-width: 720px) { .qibla-hub-master-grid { grid-template-columns: 1fr 1fr; gap: 16px; } }
.qibla-hub-master-card {
    background: linear-gradient(180deg, rgba(26,74,26,0.04) 0%, rgba(26,74,26,0.015) 100%);
    border: 1px solid rgba(26,74,26,0.12);
    border-radius: 20px;
    padding: 18px 18px 16px;
    margin: 0;
    box-shadow: 0 1px 2px rgba(26,74,26,0.04), 0 4px 12px rgba(26,74,26,0.04);
    display: flex;
    gap: 14px;
    align-items: flex-start;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.qibla-hub-master-card:hover { box-shadow: 0 1px 2px rgba(26,74,26,0.08), 0 8px 20px rgba(26,74,26,0.08); transform: translateY(-1px); }
@media (min-width: 720px) { .qibla-hub-master-card--wide { grid-column: 1 / -1; } }
html[data-theme="dark"] .qibla-hub-master-card {
    background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%);
    border-color: rgba(255,255,255,0.10);
    box-shadow: 0 1px 2px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.2);
}
.qibla-hub-master-icon {
    flex: 0 0 auto;
    width: 44px; height: 44px;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 1.4rem; line-height: 1;
    background: rgba(26,74,26,0.10);
    border-radius: 12px;
}
html[data-theme="dark"] .qibla-hub-master-icon { background: rgba(255,255,255,0.06); }
.qibla-hub-master-text { flex: 1 1 auto; min-width: 0; }
.qibla-hub-master-h3 { margin: 0 0 6px; font-size: 1.05rem; line-height: 1.4; color: var(--text); font-weight: 600; }
.qibla-hub-master-body { margin: 0; font-size: 0.95rem; line-height: 1.78; color: var(--text-light); }
.qibla-hub-master-close { max-width: 1180px; margin: 22px auto 0; font-size: 0.95rem; line-height: 1.78; color: var(--text-light); padding-inline: 4px; }`;

if (css.indexOf(CSS_OLD) < 0) {
    console.warn('[css] OLD block exact-match not found; appending new block instead.');
    css = css + '\n' + CSS_NEW;
} else {
    css = css.replace(CSS_OLD, CSS_NEW);
}

writeFileSync(SRV_PATH, toEol(srv, isCRLFsrv), 'utf8');
writeFileSync(CSS_PATH, toEol(css, isCRLFcss), 'utf8');

console.log('\n✅ Phase Q-Hub-C — Merge Duplicate Hub Content + Visual Redesign applied.');
console.log('  • Q-Hub-A guide + Q-Hub-B authority + closing → ONE merged section');
console.log('  • H2: "دليل شامل لاستخدام بوصلة القبلة" (per-lang)');
console.log('  • 5 distinct H3 cards (no topic duplication), each with an icon');
console.log('  • Visual: max-width 1180px, 2-col grid, soft green border, radius 20px');
console.log('  • Last card spans full width on desktop for the long "angle" body');
console.log('  • Closing summary kept (per-lang) for word-count headroom');
