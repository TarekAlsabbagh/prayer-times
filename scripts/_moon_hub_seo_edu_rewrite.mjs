/* MOON-CITY-EVERGREEN-EDU-CONTENT-UI-POLISH-1 (2026-05-24)
 *
 * Rewrites the 4-card educational SEO block (moon-hub-seo-card × 4)
 * on /moon-in-{city} hub pages across all 10 langs.
 *
 * - AR text is set verbatim from the user's spec.
 * - Other 9 langs translated to match the AR meaning, with natural
 *   per-language phrasing (no machine-translated feel).
 *
 * Replaces the entire `_MOON_HUB_GUIDE = {...}` literal in server.js.
 * Idempotent — re-running prints OK_ALREADY_PATCHED if the new AR title
 * marker is already in the file.
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname || '.', '..');
const FILE = path.join(ROOT, 'server.js');
const content = fs.readFileSync(FILE, 'utf8');

// Idempotent check — the new AR s1Title contains "كيف تتابع أطوار القمر"
// (the old block had "كيف تقرأ حالة القمر").
if (content.includes('كيف تتابع أطوار القمر في')) {
  console.log('OK_ALREADY_PATCHED');
  process.exit(0);
}

// Anchor: the entire `const _MOON_HUB_GUIDE = {...};` block. We match by
// the unique opening line + the closing `};` that ends the const.
const startMarker = '                const _MOON_HUB_GUIDE = {\r\n';
const endMarker   = '                };\r\n';

const startIdx = content.indexOf(startMarker);
if (startIdx < 0) {
  console.error('MISS_START — could not find _MOON_HUB_GUIDE opening');
  process.exit(1);
}
const afterStart = startIdx + startMarker.length;
// The end is the FIRST `                };\r\n` after the start that is
// at the right indentation level. There are nested `}),` lines but no
// nested `};` at this indent.
const endIdx = content.indexOf(endMarker, afterStart);
if (endIdx < 0) {
  console.error('MISS_END — could not find _MOON_HUB_GUIDE closing');
  process.exit(1);
}
const endAfter = endIdx + endMarker.length;

// Build the new block.
const RP = String.raw;
const newBlock = `                // MOON-CITY-EVERGREEN-EDU-CONTENT-UI-POLISH-1 (2026-05-24):
                //   Rewrote all 4 SEO/educational cards to better match the
                //   /moon-in-{city} HUB intent (evergreen city-entity), with
                //   tighter focus on the actual data the page shows: phase,
                //   illumination, age, rise/set, calendar links. Removed
                //   duplicated "حالة القمر" phrasing and the "Hub العامة"
                //   contrast block. 10 langs aligned in meaning.
                const _MOON_HUB_GUIDE = {
                    ar: c => ({
                        s1Title: \`كيف تتابع أطوار القمر في \${c}؟\`,
                        s1P1: \`تعرض صفحة تقويم القمر في \${c} الطور الحالي، ونسبة الإضاءة، وعمر القمر، مع روابط للأيام القريبة والتقويم الشهري. تساعدك هذه البيانات على فهم موقع القمر داخل دورته، ومعرفة ما إذا كان يقترب من الهلال أو التربيع أو البدر أو المحاق.\`,
                        s1P2: \`يمكنك استخدام هذه الصفحة كنقطة بداية سريعة لمتابعة حالة القمر في \${c}، ثم الانتقال إلى صفحة الشهر أو صفحة تاريخ محدد إذا كنت تريد تفاصيل أوسع عن تسلسل الأطوار خلال فترة معينة.\`,
                        s2Title: \`متى تستخدم صفحة القمر في \${c}؟\`,
                        s2P1: \`استخدم صفحة القمر في \${c} عندما تريد ملخصًا واضحًا يجمع حالة القمر الحالية، ونسبة الإضاءة، ومواعيد الطلوع والغروب، وروابط الأيام والشهور القريبة. هذه الصفحة مناسبة لمن يريد معرفة سريعة دون الدخول مباشرة إلى تقويم الشهر الكامل.\`,
                        s2P2: \`أما صفحة الشهر فتعرض أطوار القمر خلال شهر كامل، بينما تعرض صفحة التاريخ بيانات القمر في يوم محدد. لذلك تبقى صفحة \${c} مدخلًا منظمًا يربط بين الحالة الحالية والتقويم الشهري والصفحات اليومية.\`,
                        s3Title: \`ما العوامل التي تظهر في بيانات القمر؟\`,
                        s3P1: \`تعتمد بيانات القمر في \${c} على عدة مؤشرات فلكية مبسطة، مثل الطور الحالي، ونسبة الإضاءة، وعمر القمر، ومواعيد طلوع القمر وغروبه حسب توقيت \${c} المحلي. تساعد هذه المؤشرات على قراءة حالة القمر بطريقة أوضح من الاعتماد على اسم الطور فقط.\`,
                        s3P2: \`كما تظهر معلومات إضافية مثل الكوكبة الفلكية والمسافة التقريبية إلى القمر، وهي عناصر تساعد في إعطاء سياق أوسع لحركة القمر وموقعه الظاهري، دون أن تغيّر معنى الطور أو نسبة الإضاءة المعروضة.\`,
                        s4Title: \`كيف تستخدم تقويم القمر في \${c}؟\`,
                        s4P1: \`ابدأ بقراءة ملخص حالة القمر الحالية في أعلى الصفحة، ثم راجع نسبة الإضاءة وعمر القمر ومواعيد الطلوع والغروب. بعد ذلك يمكنك استخدام روابط الأيام القريبة أو زر التقويم الشهري لمتابعة تغيّر الأطوار خلال الشهر.\`,
                        s4P2: \`إذا كنت تبحث عن يوم معين، فانتقل إلى صفحة التاريخ المحدد. وإذا أردت مراجعة الشهر كاملًا، فصفحة التقويم الشهري هي الأنسب لأنها تعرض تسلسل الأطوار والتواريخ الميلادية المقابلة بطريقة أوضح.\`,
                    }),
                    en: c => ({
                        s1Title: \`How to follow the Moon's phases in \${c}\`,
                        s1P1: \`The Moon calendar page for \${c} shows the current phase, illumination percentage, and Moon age, along with links to nearby days and the monthly calendar. These data points help you understand where the Moon sits in its cycle and whether it is approaching the crescent, quarter, full, or new phase.\`,
                        s1P2: \`Use this page as a quick starting point for tracking the Moon in \${c}, then move to the month page or a specific date page if you want broader detail on how the phases unfold over a given period.\`,
                        s2Title: \`When to use the \${c} Moon page\`,
                        s2P1: \`Use the Moon page for \${c} when you want a clear summary that combines the current Moon state, illumination percentage, moonrise and moonset times, and links to nearby days and months. This page is well suited for quick checks without having to dive into the full monthly calendar.\`,
                        s2P2: \`The month page shows the Moon's phases across a full month, while the date page shows Moon data for a specific day. The \${c} page therefore stays as a tidy entry point linking the current state, the monthly calendar, and the daily pages.\`,
                        s3Title: \`What factors appear in the Moon data?\`,
                        s3P1: \`Moon data on \${c} is built on a few simplified astronomy indicators — the current phase, illumination percentage, Moon age, and moonrise/moonset times in \${c}'s local time. These indicators help read the Moon's state more clearly than relying on the phase name alone.\`,
                        s3P2: \`Additional information also appears, such as the astronomical constellation and the approximate distance to the Moon — elements that give broader context for the Moon's motion and apparent position, without changing the meaning of the phase or the illumination percentage shown.\`,
                        s4Title: \`How to use the Moon calendar in \${c}\`,
                        s4P1: \`Start by reading the current Moon summary at the top of the page, then check the illumination percentage, Moon age, and rise/set times. After that, use the nearby-day links or the monthly calendar button to follow how the phases shift over the month.\`,
                        s4P2: \`If you're looking up a specific day, head to the dated page. And if you want to review the whole month, the monthly calendar page is the better fit because it shows the sequence of phases with their corresponding Gregorian dates more clearly.\`,
                    }),
                    fr: c => ({
                        s1Title: \`Comment suivre les phases de la Lune à \${c}\`,
                        s1P1: \`La page calendrier de la Lune pour \${c} affiche la phase actuelle, le pourcentage d'illumination et l'âge de la Lune, ainsi que des liens vers les jours proches et le calendrier mensuel. Ces données vous aident à comprendre où la Lune se situe dans son cycle et si elle approche du croissant, du quartier, de la pleine Lune ou de la nouvelle Lune.\`,
                        s1P2: \`Utilisez cette page comme point de départ rapide pour suivre la Lune à \${c}, puis passez à la page du mois ou à une page de date précise si vous souhaitez plus de détails sur la succession des phases sur une période donnée.\`,
                        s2Title: \`Quand utiliser la page Lune pour \${c}\`,
                        s2P1: \`Utilisez la page Lune pour \${c} lorsque vous voulez un résumé clair qui réunit l'état actuel de la Lune, le pourcentage d'illumination, les heures de lever et de coucher, et les liens vers les jours et les mois proches. Cette page convient à une consultation rapide, sans entrer directement dans le calendrier mensuel complet.\`,
                        s2P2: \`La page du mois présente les phases de la Lune sur un mois entier, tandis que la page de date montre les données lunaires d'un jour précis. La page de \${c} reste donc une porte d'entrée organisée qui relie l'état actuel, le calendrier mensuel et les pages journalières.\`,
                        s3Title: \`Quels éléments apparaissent dans les données lunaires ?\`,
                        s3P1: \`Les données lunaires de \${c} reposent sur quelques indicateurs astronomiques simplifiés — la phase actuelle, le pourcentage d'illumination, l'âge de la Lune, et les heures de lever et de coucher selon l'heure locale de \${c}. Ces indicateurs facilitent la lecture de l'état de la Lune, mieux que le seul nom de la phase.\`,
                        s3P2: \`D'autres informations apparaissent également, comme la constellation astronomique et la distance approximative à la Lune — des éléments qui apportent un contexte plus large sur le mouvement et la position apparente de la Lune, sans modifier le sens de la phase ou le pourcentage d'illumination affichés.\`,
                        s4Title: \`Comment utiliser le calendrier lunaire à \${c}\`,
                        s4P1: \`Commencez par lire le résumé de l'état actuel de la Lune en haut de la page, puis vérifiez le pourcentage d'illumination, l'âge de la Lune et les heures de lever et de coucher. Ensuite, utilisez les liens des jours proches ou le bouton du calendrier mensuel pour suivre l'évolution des phases au cours du mois.\`,
                        s4P2: \`Si vous cherchez un jour précis, allez sur la page de date dédiée. Et si vous souhaitez consulter le mois entier, la page du calendrier mensuel est la mieux adaptée, car elle présente la séquence des phases avec leurs dates grégoriennes correspondantes de manière plus claire.\`,
                    }),
                    tr: c => ({
                        s1Title: \`\${c} için Ay'ın evrelerini nasıl takip edersiniz\`,
                        s1P1: \`\${c} Ay takvimi sayfası mevcut evreyi, aydınlanma yüzdesini ve Ay yaşını, yakın günler ve aylık takvim bağlantılarıyla birlikte gösterir. Bu veriler Ay'ın döngüsündeki konumunu anlamanıza ve hilale, dördüne, dolunaya veya yeni aya yaklaşıp yaklaşmadığını görmenize yardımcı olur.\`,
                        s1P2: \`Bu sayfayı \${c} için Ay durumunu takip etmenin hızlı başlangıç noktası olarak kullanın; daha sonra evrelerin belirli bir dönemde nasıl ilerlediğine dair daha geniş ayrıntı için ay sayfasına veya belirli bir tarih sayfasına geçebilirsiniz.\`,
                        s2Title: \`\${c} Ay sayfasını ne zaman kullanmalısınız\`,
                        s2P1: \`\${c} Ay sayfasını, mevcut Ay durumunu, aydınlanma yüzdesini, Ay'ın doğuş ve batış saatlerini ve yakın gün ve ay bağlantılarını bir araya getiren net bir özet istediğinizde kullanın. Bu sayfa, tam aylık takvime girmeden hızlı bilgi almak isteyenler için uygundur.\`,
                        s2P2: \`Ay sayfası Ay'ın evrelerini tüm bir ay boyunca gösterirken, tarih sayfası belirli bir günün Ay verilerini sunar. Bu yüzden \${c} sayfası mevcut durumu, aylık takvimi ve günlük sayfaları birbirine bağlayan düzenli bir giriş noktası olarak kalır.\`,
                        s3Title: \`Ay verilerinde hangi unsurlar görünür?\`,
                        s3P1: \`\${c} Ay verileri birkaç sadeleştirilmiş astronomik göstergeye dayanır — mevcut evre, aydınlanma yüzdesi, Ay yaşı ve \${c} yerel saatine göre Ay'ın doğuş ve batış saatleri. Bu göstergeler Ay'ın durumunu, yalnızca evre adına güvenmekten daha net okumanıza yardımcı olur.\`,
                        s3P2: \`Bunlara ek olarak astronomik takımyıldız ve Ay'a yaklaşık uzaklık gibi bilgiler de görünür — bunlar Ay'ın hareketi ve görünür konumu için daha geniş bir bağlam sağlar; gösterilen evre veya aydınlanma yüzdesinin anlamını değiştirmez.\`,
                        s4Title: \`\${c} için Ay takvimini nasıl kullanırsınız\`,
                        s4P1: \`Sayfanın üstündeki güncel Ay özetini okuyarak başlayın, sonra aydınlanma yüzdesine, Ay yaşına ve doğuş/batış saatlerine bakın. Ardından evrelerin ay boyunca nasıl değiştiğini takip etmek için yakın gün bağlantılarını veya aylık takvim düğmesini kullanın.\`,
                        s4P2: \`Belirli bir gün arıyorsanız tarihli sayfaya gidin. Tüm ayı incelemek istiyorsanız aylık takvim sayfası daha uygundur çünkü evrelerin sırasını ve karşılık gelen miladi tarihleri daha net gösterir.\`,
                    }),
                    ur: c => ({
                        s1Title: \`\${c} میں چاند کے مراحل کیسے دیکھیں\`,
                        s1P1: \`\${c} کے لیے چاند کا تقویمی صفحہ موجودہ مرحلہ، روشنی کا فیصد، اور چاند کی عمر دکھاتا ہے، ساتھ ہی قریبی دنوں اور ماہانہ تقویم کے روابط بھی۔ یہ معلومات آپ کو چاند کے چکر میں اس کا مقام سمجھنے اور یہ جاننے میں مدد دیتی ہیں کہ آیا وہ ہلال، تربیع، بدر، یا نئے چاند کے قریب ہے۔\`,
                        s1P2: \`\${c} میں چاند کی حالت کے لیے اس صفحے کو ایک تیز ابتدائی نقطہ کے طور پر استعمال کریں، پھر اگر آپ کسی مخصوص مدت کے دوران مراحل کے سلسلے کے بارے میں زیادہ تفصیل چاہتے ہیں تو ماہ کے صفحے یا کسی مخصوص تاریخ کے صفحے پر جائیں۔\`,
                        s2Title: \`\${c} کا چاند کا صفحہ کب استعمال کریں\`,
                        s2P1: \`\${c} کا چاند کا صفحہ اس وقت استعمال کریں جب آپ موجودہ چاند کی حالت، روشنی کا فیصد، چاند کے طلوع اور غروب کے اوقات، اور قریبی دنوں اور ماہ کے روابط کو جمع کرنے والا واضح خلاصہ چاہتے ہوں۔ یہ صفحہ ان لوگوں کے لیے موزوں ہے جو پوری ماہانہ تقویم میں براہ راست داخل ہوئے بغیر فوری معلومات چاہتے ہیں۔\`,
                        s2P2: \`ماہ کا صفحہ پورے ماہ کے دوران چاند کے مراحل دکھاتا ہے، جبکہ تاریخ کا صفحہ ایک مخصوص دن کے چاند کا ڈیٹا دکھاتا ہے۔ اس لیے \${c} کا صفحہ موجودہ حالت، ماہانہ تقویم، اور روزانہ کے صفحات کو جوڑنے والا ایک منظم انٹری پوائنٹ بنا رہتا ہے۔\`,
                        s3Title: \`چاند کے ڈیٹا میں کون سے عوامل ظاہر ہوتے ہیں؟\`,
                        s3P1: \`\${c} میں چاند کا ڈیٹا چند سادہ فلکیاتی اشاروں پر مبنی ہے — موجودہ مرحلہ، روشنی کا فیصد، چاند کی عمر، اور \${c} کے مقامی وقت کے مطابق چاند کے طلوع اور غروب کے اوقات۔ یہ اشارے صرف مرحلے کے نام پر بھروسہ کرنے سے زیادہ واضح طور پر چاند کی حالت پڑھنے میں مدد دیتے ہیں۔\`,
                        s3P2: \`اس کے علاوہ اضافی معلومات بھی ظاہر ہوتی ہیں جیسے فلکیاتی کوکبہ اور چاند کا تقریبی فاصلہ — یہ عناصر چاند کی حرکت اور اس کے ظاہری مقام کے لیے وسیع تر سیاق فراہم کرتے ہیں، بغیر اس کے کہ دکھائے گئے مرحلے یا روشنی کے فیصد کا مطلب بدل جائے۔\`,
                        s4Title: \`\${c} میں چاند کی تقویم کیسے استعمال کریں\`,
                        s4P1: \`صفحے کے اوپر موجود موجودہ چاند کا خلاصہ پڑھنے سے شروع کریں، پھر روشنی کا فیصد، چاند کی عمر، اور طلوع و غروب کے اوقات دیکھیں۔ اس کے بعد ماہ بھر مراحل کی تبدیلی کو دیکھنے کے لیے قریبی دنوں کے روابط یا ماہانہ تقویم کا بٹن استعمال کریں۔\`,
                        s4P2: \`اگر آپ کسی مخصوص دن کی تلاش میں ہیں تو متعلقہ تاریخ کے صفحے پر جائیں۔ اور اگر آپ پورا ماہ دیکھنا چاہتے ہیں تو ماہانہ تقویم کا صفحہ زیادہ موزوں ہے کیونکہ یہ مراحل کے سلسلے اور ان کی متعلقہ عیسوی تاریخوں کو زیادہ واضح طور پر دکھاتا ہے۔\`,
                    }),
                    de: c => ({
                        s1Title: \`Wie Sie die Mondphasen in \${c} verfolgen\`,
                        s1P1: \`Die Mondkalender-Seite für \${c} zeigt die aktuelle Phase, den Beleuchtungsanteil und das Mondalter, dazu Links zu nahen Tagen und zum Monatskalender. Diese Daten helfen Ihnen einzuschätzen, wo sich der Mond in seinem Zyklus befindet und ob er sich der Sichel, dem Halbmond, dem Vollmond oder dem Neumond nähert.\`,
                        s1P2: \`Nutzen Sie diese Seite als schnellen Einstieg, um den Mond in \${c} zu verfolgen. Für mehr Details zur Abfolge der Phasen über einen bestimmten Zeitraum wechseln Sie dann auf die Monatsseite oder eine konkrete Datumsseite.\`,
                        s2Title: \`Wann Sie die Mondseite für \${c} nutzen sollten\`,
                        s2P1: \`Nutzen Sie die Mondseite für \${c}, wenn Sie eine klare Zusammenfassung möchten, die den aktuellen Mondstand, den Beleuchtungsanteil, die Mondauf- und -untergangszeiten sowie Links zu nahen Tagen und Monaten zusammenführt. Die Seite eignet sich für einen schnellen Überblick, ohne direkt in den vollständigen Monatskalender einzusteigen.\`,
                        s2P2: \`Die Monatsseite zeigt die Mondphasen über einen ganzen Monat, die Datumseite die Monddaten eines bestimmten Tages. Die \${c}-Seite bleibt damit ein geordneter Einstieg, der den aktuellen Stand, den Monatskalender und die täglichen Seiten miteinander verbindet.\`,
                        s3Title: \`Welche Faktoren erscheinen in den Monddaten?\`,
                        s3P1: \`Die Monddaten in \${c} beruhen auf einigen vereinfachten astronomischen Größen — der aktuellen Phase, dem Beleuchtungsanteil, dem Mondalter und den Mondauf- und -untergangszeiten in der Ortszeit von \${c}. Diese Werte machen den Mondstand klarer lesbar, als wenn man sich nur auf den Phasennamen verlässt.\`,
                        s3P2: \`Zusätzlich erscheinen Angaben wie das astronomische Sternbild und die ungefähre Entfernung zum Mond — Elemente, die den Mondbewegungen und der scheinbaren Position einen breiteren Kontext geben, ohne den Sinn der Phase oder den angezeigten Beleuchtungsanteil zu verändern.\`,
                        s4Title: \`Wie Sie den Mondkalender in \${c} nutzen\`,
                        s4P1: \`Beginnen Sie oben auf der Seite mit der aktuellen Mond-Übersicht und prüfen Sie dann den Beleuchtungsanteil, das Mondalter sowie Aufgangs- und Untergangszeiten. Mit den Links zu nahen Tagen oder der Schaltfläche zum Monatskalender verfolgen Sie, wie sich die Phasen im Lauf des Monats verändern.\`,
                        s4P2: \`Suchen Sie nach einem bestimmten Tag, wechseln Sie auf die zugehörige Datumseite. Möchten Sie den ganzen Monat überblicken, ist die Monatskalender-Seite besser geeignet, weil sie die Reihenfolge der Phasen mit den zugehörigen gregorianischen Daten klarer darstellt.\`,
                    }),
                    id: c => ({
                        s1Title: \`Cara mengikuti fase Bulan di \${c}\`,
                        s1P1: \`Halaman kalender Bulan untuk \${c} menampilkan fase saat ini, persentase iluminasi, dan usia Bulan, beserta tautan ke hari-hari terdekat dan kalender bulanan. Data ini membantu Anda memahami posisi Bulan dalam siklusnya dan apakah ia mendekati sabit, kuartal, purnama, atau bulan baru.\`,
                        s1P2: \`Gunakan halaman ini sebagai titik awal cepat untuk memantau Bulan di \${c}, lalu beralih ke halaman bulan atau halaman tanggal tertentu jika Anda ingin detail yang lebih luas tentang bagaimana fase-fase berjalan selama periode tertentu.\`,
                        s2Title: \`Kapan menggunakan halaman Bulan untuk \${c}\`,
                        s2P1: \`Gunakan halaman Bulan untuk \${c} ketika Anda ingin ringkasan yang jelas yang menggabungkan keadaan Bulan saat ini, persentase iluminasi, waktu terbit dan terbenam Bulan, serta tautan hari dan bulan terdekat. Halaman ini cocok bagi siapa pun yang ingin informasi cepat tanpa langsung masuk ke kalender bulanan penuh.\`,
                        s2P2: \`Halaman bulan menampilkan fase Bulan sepanjang sebulan penuh, sementara halaman tanggal menampilkan data Bulan pada hari tertentu. Karena itu halaman \${c} tetap menjadi titik masuk yang rapi yang menghubungkan keadaan saat ini, kalender bulanan, dan halaman harian.\`,
                        s3Title: \`Faktor apa yang muncul dalam data Bulan?\`,
                        s3P1: \`Data Bulan di \${c} dibangun di atas beberapa indikator astronomi sederhana — fase saat ini, persentase iluminasi, usia Bulan, dan waktu terbit/terbenam Bulan menurut waktu lokal \${c}. Indikator-indikator ini membantu membaca keadaan Bulan secara lebih jelas daripada hanya mengandalkan nama fase.\`,
                        s3P2: \`Selain itu, informasi tambahan juga muncul seperti rasi bintang astronomi dan perkiraan jarak ke Bulan — elemen yang memberi konteks lebih luas terhadap pergerakan dan posisi tampak Bulan, tanpa mengubah arti fase atau persentase iluminasi yang ditampilkan.\`,
                        s4Title: \`Cara menggunakan kalender Bulan di \${c}\`,
                        s4P1: \`Mulailah dengan membaca ringkasan keadaan Bulan saat ini di bagian atas halaman, lalu periksa persentase iluminasi, usia Bulan, dan waktu terbit/terbenam. Setelah itu, gunakan tautan hari terdekat atau tombol kalender bulanan untuk mengikuti perubahan fase sepanjang bulan.\`,
                        s4P2: \`Jika Anda mencari hari tertentu, buka halaman tanggal yang sesuai. Dan jika Anda ingin meninjau bulan penuh, halaman kalender bulanan lebih cocok karena menampilkan urutan fase dan tanggal Masehi yang sesuai dengan lebih jelas.\`,
                    }),
                    es: c => ({
                        s1Title: \`Cómo seguir las fases de la Luna en \${c}\`,
                        s1P1: \`La página del calendario lunar para \${c} muestra la fase actual, el porcentaje de iluminación y la edad de la Luna, junto con enlaces a los días cercanos y al calendario mensual. Estos datos te ayudan a entender la posición de la Luna en su ciclo y a saber si se acerca al creciente, al cuarto, a la luna llena o a la luna nueva.\`,
                        s1P2: \`Usa esta página como punto de partida rápido para seguir la Luna en \${c}, y después pasa a la página del mes o a una página de fecha específica si quieres más detalle sobre cómo se suceden las fases durante un periodo determinado.\`,
                        s2Title: \`Cuándo usar la página de la Luna en \${c}\`,
                        s2P1: \`Usa la página de la Luna en \${c} cuando quieras un resumen claro que reúna el estado actual de la Luna, el porcentaje de iluminación, las horas de salida y puesta y los enlaces a los días y meses cercanos. Esta página es adecuada para una consulta rápida sin entrar directamente en el calendario mensual completo.\`,
                        s2P2: \`La página del mes muestra las fases de la Luna durante un mes entero, mientras que la página de fecha muestra los datos lunares de un día específico. Por eso la página de \${c} sigue siendo un punto de entrada ordenado que enlaza el estado actual, el calendario mensual y las páginas diarias.\`,
                        s3Title: \`¿Qué factores aparecen en los datos lunares?\`,
                        s3P1: \`Los datos lunares en \${c} se basan en algunos indicadores astronómicos simplificados — la fase actual, el porcentaje de iluminación, la edad de la Luna y las horas de salida y puesta según la hora local de \${c}. Estos indicadores ayudan a leer el estado de la Luna de forma más clara que confiando solo en el nombre de la fase.\`,
                        s3P2: \`También aparece información adicional como la constelación astronómica y la distancia aproximada a la Luna — elementos que aportan un contexto más amplio del movimiento y la posición aparente de la Luna, sin alterar el sentido de la fase o el porcentaje de iluminación mostrados.\`,
                        s4Title: \`Cómo usar el calendario lunar en \${c}\`,
                        s4P1: \`Empieza por leer el resumen del estado actual de la Luna en la parte superior de la página, luego revisa el porcentaje de iluminación, la edad de la Luna y las horas de salida y puesta. Después, usa los enlaces de los días cercanos o el botón del calendario mensual para seguir cómo cambian las fases durante el mes.\`,
                        s4P2: \`Si buscas un día concreto, ve a la página de fecha correspondiente. Y si quieres revisar el mes completo, la página del calendario mensual es la más adecuada porque muestra la secuencia de fases y las fechas gregorianas correspondientes con mayor claridad.\`,
                    }),
                    bn: c => ({
                        s1Title: \`\${c}-এ চাঁদের দশা কীভাবে অনুসরণ করবেন\`,
                        s1P1: \`\${c}-এর জন্য চাঁদের ক্যালেন্ডার পৃষ্ঠা বর্তমান দশা, আলোকন শতাংশ ও চাঁদের বয়স দেখায়, এবং নিকটবর্তী দিন ও মাসিক ক্যালেন্ডারের লিঙ্কও দেখায়। এই তথ্য চাঁদ তার চক্রের মধ্যে কোথায় আছে তা বুঝতে এবং সে অর্ধচন্দ্র, পাদ, পূর্ণিমা বা অমাবস্যার কাছে আসছে কিনা তা জানতে সাহায্য করে।\`,
                        s1P2: \`\${c}-এ চাঁদের অবস্থা অনুসরণ করতে এই পৃষ্ঠাটিকে একটি দ্রুত শুরুর বিন্দু হিসেবে ব্যবহার করুন; তারপর কোনো নির্দিষ্ট সময়কালে দশার ধারা সম্পর্কে আরও বিস্তৃত বিবরণ চাইলে মাসের পৃষ্ঠা বা একটি নির্দিষ্ট তারিখের পৃষ্ঠায় যান।\`,
                        s2Title: \`\${c}-এর চাঁদ পৃষ্ঠা কখন ব্যবহার করবেন\`,
                        s2P1: \`\${c}-এর চাঁদ পৃষ্ঠা তখন ব্যবহার করুন যখন আপনি একটি স্পষ্ট সারসংক্ষেপ চান যেটি চাঁদের বর্তমান অবস্থা, আলোকন শতাংশ, চাঁদ ওঠা ও অস্ত যাওয়ার সময়, এবং নিকটবর্তী দিন ও মাসের লিঙ্ক একসাথে দেখায়। এই পৃষ্ঠাটি পূর্ণ মাসিক ক্যালেন্ডারে সরাসরি না গিয়ে দ্রুত তথ্য চাওয়া লোকদের জন্য উপযুক্ত।\`,
                        s2P2: \`মাসের পৃষ্ঠা পূর্ণ মাসজুড়ে চাঁদের দশা দেখায়, যেখানে তারিখের পৃষ্ঠা একটি নির্দিষ্ট দিনের চাঁদের ডেটা দেখায়। তাই \${c} পৃষ্ঠা বর্তমান অবস্থা, মাসিক ক্যালেন্ডার এবং দৈনিক পৃষ্ঠাগুলোর মধ্যে সংযোগকারী একটি সুসংগঠিত প্রবেশ বিন্দু হিসেবে থাকে।\`,
                        s3Title: \`চাঁদের ডেটায় কোন উপাদানগুলো দেখা যায়?\`,
                        s3P1: \`\${c}-এ চাঁদের ডেটা কয়েকটি সরলীকৃত জ্যোতির্বিজ্ঞান নির্দেশকের ওপর ভিত্তি করে — বর্তমান দশা, আলোকন শতাংশ, চাঁদের বয়স, এবং \${c}-এর স্থানীয় সময় অনুযায়ী চাঁদ ওঠা ও অস্ত যাওয়ার সময়। এই নির্দেশকগুলো কেবল দশার নামের ওপর নির্ভর করার চেয়ে চাঁদের অবস্থা আরও স্পষ্টভাবে পড়তে সাহায্য করে।\`,
                        s3P2: \`এর পাশাপাশি অতিরিক্ত তথ্যও দেখা যায় যেমন জ্যোতির্বিজ্ঞানিক রাশি এবং চাঁদের আনুমানিক দূরত্ব — এগুলো চাঁদের গতি এবং আপাত অবস্থানের জন্য বৃহত্তর প্রসঙ্গ দেয়, প্রদর্শিত দশা বা আলোকন শতাংশের অর্থ পরিবর্তন না করেই।\`,
                        s4Title: \`\${c}-এ চাঁদের ক্যালেন্ডার কীভাবে ব্যবহার করবেন\`,
                        s4P1: \`পৃষ্ঠার উপরে বর্তমান চাঁদের সারসংক্ষেপ পড়ে শুরু করুন, তারপর আলোকন শতাংশ, চাঁদের বয়স, এবং ওঠা ও অস্তের সময় পরীক্ষা করুন। এরপর মাসজুড়ে দশার পরিবর্তন অনুসরণ করতে নিকটবর্তী দিনের লিঙ্ক বা মাসিক ক্যালেন্ডার বোতাম ব্যবহার করুন।\`,
                        s4P2: \`কোনো নির্দিষ্ট দিন খুঁজছেন? সংশ্লিষ্ট তারিখের পৃষ্ঠায় যান। আর পুরো মাস পর্যালোচনা করতে চাইলে মাসিক ক্যালেন্ডার পৃষ্ঠাটি বেশি উপযোগী, কারণ এটি দশার ধারা এবং সংশ্লিষ্ট গ্রেগরিয়ান তারিখগুলো আরও স্পষ্টভাবে দেখায়।\`,
                    }),
                    ms: c => ({
                        s1Title: \`Cara mengikuti fasa Bulan di \${c}\`,
                        s1P1: \`Halaman kalendar Bulan untuk \${c} memaparkan fasa semasa, peratusan pencahayaan dan usia Bulan, beserta pautan ke hari-hari berdekatan dan kalendar bulanan. Data ini membantu anda memahami kedudukan Bulan dalam kitarannya serta sama ada ia menghampiri sabit, suku, purnama atau anak bulan.\`,
                        s1P2: \`Gunakan halaman ini sebagai titik mula yang pantas untuk memantau Bulan di \${c}, kemudian beralih ke halaman bulan atau halaman tarikh tertentu jika anda mahukan butiran lebih luas tentang bagaimana fasa-fasa berlangsung dalam suatu tempoh tertentu.\`,
                        s2Title: \`Bila menggunakan halaman Bulan untuk \${c}\`,
                        s2P1: \`Gunakan halaman Bulan untuk \${c} apabila anda mahukan ringkasan jelas yang menyatukan keadaan Bulan semasa, peratusan pencahayaan, waktu Bulan terbit dan terbenam, serta pautan hari dan bulan berdekatan. Halaman ini sesuai untuk semakan pantas tanpa perlu memasuki kalendar bulanan penuh secara langsung.\`,
                        s2P2: \`Halaman bulan memaparkan fasa Bulan sepanjang sebulan penuh, manakala halaman tarikh memaparkan data Bulan untuk satu hari tertentu. Oleh itu halaman \${c} kekal sebagai titik masuk yang kemas yang menghubungkan keadaan semasa, kalendar bulanan dan halaman harian.\`,
                        s3Title: \`Faktor apakah yang muncul dalam data Bulan?\`,
                        s3P1: \`Data Bulan di \${c} dibina daripada beberapa penunjuk astronomi yang dipermudahkan — fasa semasa, peratusan pencahayaan, usia Bulan, dan waktu Bulan terbit dan terbenam mengikut waktu tempatan \${c}. Penunjuk-penunjuk ini membantu membaca keadaan Bulan dengan lebih jelas berbanding hanya bergantung pada nama fasa.\`,
                        s3P2: \`Selain itu, maklumat tambahan juga muncul seperti buruj astronomi dan anggaran jarak ke Bulan — elemen yang memberi konteks lebih luas untuk pergerakan dan kedudukan ketara Bulan, tanpa mengubah maksud fasa atau peratusan pencahayaan yang dipaparkan.\`,
                        s4Title: \`Cara menggunakan kalendar Bulan di \${c}\`,
                        s4P1: \`Mulakan dengan membaca ringkasan keadaan Bulan semasa di bahagian atas halaman, kemudian semak peratusan pencahayaan, usia Bulan, dan waktu terbit/terbenam. Selepas itu, gunakan pautan hari berdekatan atau butang kalendar bulanan untuk mengikuti perubahan fasa sepanjang bulan.\`,
                        s4P2: \`Jika anda mencari hari tertentu, pergi ke halaman tarikh yang berkaitan. Dan jika anda mahu meninjau bulan penuh, halaman kalendar bulanan lebih sesuai kerana ia memaparkan urutan fasa dan tarikh Masihi yang berkaitan dengan lebih jelas.\`,
                    }),
                };
`;

// Use CRLF line endings (matches the rest of server.js).
const newBlockCRLF = newBlock.replace(/\r?\n/g, '\r\n');

const patched =
  content.substring(0, startIdx) +
  newBlockCRLF +
  content.substring(endAfter);

fs.writeFileSync(FILE, patched, 'utf8');

// Also wrap the 4 <section> tags in a <div class="moon-hub-seo-grid">
// so the CSS grid wrapper can do 2-col on desktop / 1-col on mobile.
// The wrapper is the SECOND change in server.js. Run it as a separate
// replace to keep concerns separate.
const after = fs.readFileSync(FILE, 'utf8');
const wrapperMarker = `                const _moonHubGuideHtml = \`
<section class="moon-hub-seo-card">`;
if (after.includes(wrapperMarker)) {
  const oldHtml = `                const _moonHubGuideHtml = \`
<section class="moon-hub-seo-card"><h2>\${_escHtml(_hg.s1Title)}</h2><p>\${_escHtml(_hg.s1P1)}</p><p>\${_escHtml(_hg.s1P2)}</p></section>
<section class="moon-hub-seo-card"><h2>\${_escHtml(_hg.s2Title)}</h2><p>\${_escHtml(_hg.s2P1)}</p><p>\${_escHtml(_hg.s2P2)}</p></section>
<section class="moon-hub-seo-card"><h2>\${_escHtml(_hg.s3Title)}</h2><p>\${_escHtml(_hg.s3P1)}</p><p>\${_escHtml(_hg.s3P2)}</p></section>
<section class="moon-hub-seo-card"><h2>\${_escHtml(_hg.s4Title)}</h2><p>\${_escHtml(_hg.s4P1)}</p><p>\${_escHtml(_hg.s4P2)}</p></section>
\`;`;
  const newHtml = `                // MOON-CITY-EVERGREEN-EDU-CONTENT-UI-POLISH-1 (2026-05-24):
                //   Wrap the 4 cards in a .moon-hub-seo-grid container so
                //   CSS can render them as 2×2 on desktop and 1-col on
                //   mobile, with balanced card heights.
                const _moonHubGuideHtml = \`
<div class="moon-hub-seo-grid">
<section class="moon-hub-seo-card"><h2>\${_escHtml(_hg.s1Title)}</h2><p>\${_escHtml(_hg.s1P1)}</p><p>\${_escHtml(_hg.s1P2)}</p></section>
<section class="moon-hub-seo-card"><h2>\${_escHtml(_hg.s2Title)}</h2><p>\${_escHtml(_hg.s2P1)}</p><p>\${_escHtml(_hg.s2P2)}</p></section>
<section class="moon-hub-seo-card"><h2>\${_escHtml(_hg.s3Title)}</h2><p>\${_escHtml(_hg.s3P1)}</p><p>\${_escHtml(_hg.s3P2)}</p></section>
<section class="moon-hub-seo-card"><h2>\${_escHtml(_hg.s4Title)}</h2><p>\${_escHtml(_hg.s4P1)}</p><p>\${_escHtml(_hg.s4P2)}</p></section>
</div>
\`;`;
  const oldHtmlCRLF = oldHtml.replace(/\r?\n/g, '\r\n');
  const newHtmlCRLF = newHtml.replace(/\r?\n/g, '\r\n');
  if (after.includes(oldHtmlCRLF)) {
    const patched2 = after.replace(oldHtmlCRLF, newHtmlCRLF);
    fs.writeFileSync(FILE, patched2, 'utf8');
    console.log('OK_WRAPPER_ADDED');
  } else if (after.includes(newHtmlCRLF)) {
    console.log('OK_WRAPPER_ALREADY');
  } else {
    console.error('MISS_WRAPPER — could not find old card HTML to wrap');
    process.exit(1);
  }
}

console.log('OK_EDU_REWRITE');
