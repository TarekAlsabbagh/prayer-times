// Phase D3.1.3c — localize B1 (date edu) + B2-a/b/d/e to 10 langs.
// Replaces 5 ar/en-only blocks in app.js with [_lng_]||en lookups.
import fs from 'fs';
const file = 'js/app.js';
const src = fs.readFileSync(file, 'utf8');
const isCRLF = /\r\n/.test(src);
const EOL = isCRLF ? '\r\n' : '\n';
let s = src;

// Helper: anchor-based replace (single occurrence)
function replaceExact(text, name, oldChunk, newChunk) {
  const cnt = text.split(oldChunk).length - 1;
  if (cnt !== 1) throw new Error(`${name}: expected 1 match, got ${cnt}`);
  console.log(`OK ${name}`);
  return text.replace(oldChunk, newChunk);
}

// ════════════════════════════════════════════════════════════════════════
// B2-a: _titleH2 (line 15337) — single inline ternary
// ════════════════════════════════════════════════════════════════════════
{
  const oldChunk = `                            const _newTxt = (_lng_ === 'ar') ? \`حالة القمر اليوم في \${_cityName}\` : \`The Moon today in \${_cityName}\`;`;
  const newChunk = [
    `                            const _TITLE_H2_BY_LANG = {`,
    `                                ar: \`حالة القمر اليوم في \${_cityName}\`,`,
    `                                en: \`The Moon today in \${_cityName}\`,`,
    `                                fr: \`La Lune aujourd'hui à \${_cityName}\`,`,
    `                                tr: \`\${_cityName}'de bugünkü Ay\`,`,
    `                                ur: \`\${_cityName} میں آج کا چاند\`,`,
    `                                de: \`Der Mond heute in \${_cityName}\`,`,
    `                                id: \`Bulan hari ini di \${_cityName}\`,`,
    `                                es: \`La Luna hoy en \${_cityName}\`,`,
    `                                bn: \`\${_cityName}-এ আজকের চাঁদ\`,`,
    `                                ms: \`Bulan hari ini di \${_cityName}\``,
    `                            };`,
    `                            const _newTxt = _TITLE_H2_BY_LANG[_lng_] || _TITLE_H2_BY_LANG.en;`
  ].join(EOL);
  s = replaceExact(s, 'B2-a _titleH2', oldChunk, newChunk);
}

// ════════════════════════════════════════════════════════════════════════
// B2-b: _citiesH2 (line 15349) — single inline ternary (no placeholder)
// ════════════════════════════════════════════════════════════════════════
{
  const oldChunk = `                            const _newTxt = (_lng_ === 'ar') ? 'تقويم القمر في مدن أخرى' : 'Moon calendar in other cities';`;
  const newChunk = [
    `                            const _CITIES_H2_BY_LANG = {`,
    `                                ar: 'تقويم القمر في مدن أخرى',`,
    `                                en: 'Moon calendar in other cities',`,
    `                                fr: \`Calendrier lunaire dans d'autres villes\`,`,
    `                                tr: \`Diğer şehirlerin ay takvimi\`,`,
    `                                ur: \`دیگر شہروں کا چاند کا کیلنڈر\`,`,
    `                                de: \`Mondkalender in anderen Städten\`,`,
    `                                id: \`Kalender bulan di kota lain\`,`,
    `                                es: \`Calendario lunar en otras ciudades\`,`,
    `                                bn: \`অন্যান্য শহরের চাঁদের ক্যালেন্ডার\`,`,
    `                                ms: \`Kalendar bulan di bandar lain\``,
    `                            };`,
    `                            const _newTxt = _CITIES_H2_BY_LANG[_lng_] || _CITIES_H2_BY_LANG.en;`
  ].join(EOL);
  s = replaceExact(s, 'B2-b _citiesH2', oldChunk, newChunk);
}

// ════════════════════════════════════════════════════════════════════════
// B2-d: _eduLinkLabels — array ternary (3 items per lang)
// ════════════════════════════════════════════════════════════════════════
{
  // Match the exact existing block (between `const _eduLinkLabels = (_lng_ === 'ar') ? [`
  // and the `];` that closes the EN array).
  const oldChunk = [
    `                        const _eduLinkLabels = (_lng_ === 'ar') ? [`,
    `                            \`حالة القمر اليوم في \${_cityName}\`,`,
    `                            \`تقويم القمر في \${_altCityName}\`,`,
    `                            'التاريخ الهجريّ اليوم'`,
    `                        ] : [`,
    `                            \`Moon status today in \${_cityName}\`,`,
    `                            \`Moon calendar in \${_altCityName}\`,`,
    `                            "Today's Hijri date"`,
    `                        ];`
  ].join(EOL);
  const newChunk = [
    `                        const _EDU_LINKS_BY_LANG = {`,
    `                            ar: [`,
    `                                \`حالة القمر اليوم في \${_cityName}\`,`,
    `                                \`تقويم القمر في \${_altCityName}\`,`,
    `                                'التاريخ الهجريّ اليوم'`,
    `                            ],`,
    `                            en: [`,
    `                                \`Moon status today in \${_cityName}\`,`,
    `                                \`Moon calendar in \${_altCityName}\`,`,
    `                                "Today's Hijri date"`,
    `                            ],`,
    `                            fr: [`,
    `                                \`État de la Lune aujourd'hui à \${_cityName}\`,`,
    `                                \`Calendrier lunaire à \${_altCityName}\`,`,
    `                                'Date hégirienne du jour'`,
    `                            ],`,
    `                            tr: [`,
    `                                \`\${_cityName}'de bugünkü ay durumu\`,`,
    `                                \`\${_altCityName} ay takvimi\`,`,
    `                                'Bugünün hicri tarihi'`,
    `                            ],`,
    `                            ur: [`,
    `                                \`\${_cityName} میں آج چاند کی حالت\`,`,
    `                                \`\${_altCityName} کا چاند کیلنڈر\`,`,
    `                                'آج کی ہجری تاریخ'`,
    `                            ],`,
    `                            de: [`,
    `                                \`Mondzustand heute in \${_cityName}\`,`,
    `                                \`Mondkalender in \${_altCityName}\`,`,
    `                                'Heutiges Hidschri-Datum'`,
    `                            ],`,
    `                            id: [`,
    `                                \`Status Bulan hari ini di \${_cityName}\`,`,
    `                                \`Kalender bulan di \${_altCityName}\`,`,
    `                                'Tanggal Hijriah hari ini'`,
    `                            ],`,
    `                            es: [`,
    `                                \`Estado de la Luna hoy en \${_cityName}\`,`,
    `                                \`Calendario lunar en \${_altCityName}\`,`,
    `                                'Fecha hijri de hoy'`,
    `                            ],`,
    `                            bn: [`,
    `                                \`\${_cityName}-এ আজ চাঁদের অবস্থা\`,`,
    `                                \`\${_altCityName}-এ চাঁদের ক্যালেন্ডার\`,`,
    `                                'আজকের হিজরি তারিখ'`,
    `                            ],`,
    `                            ms: [`,
    `                                \`Status Bulan hari ini di \${_cityName}\`,`,
    `                                \`Kalendar bulan di \${_altCityName}\`,`,
    `                                'Tarikh Hijrah hari ini'`,
    `                            ]`,
    `                        };`,
    `                        const _eduLinkLabels = _EDU_LINKS_BY_LANG[_lng_] || _EDU_LINKS_BY_LANG.en;`
  ].join(EOL);
  s = replaceExact(s, 'B2-d _eduLinkLabels', oldChunk, newChunk);
}

// ════════════════════════════════════════════════════════════════════════
// B2-e: _MONTH_EDU — object ternary (5 strings per lang)
// ════════════════════════════════════════════════════════════════════════
{
  const oldChunk = [
    `                        const _MONTH_EDU = (_lng_ === 'ar') ? {`,
    `                            title: \`فهم تقويم القمر في \${_cityName} لشهر \${_mName} \${_mY}\`,`,
    `                            p1: \`تقويم القمر الشهريّ يَعرض الأطوار اليوميّة للقمر خلال شهر \${_mName} \${_mY} في \${_cityName}، من المحاق إلى البدر ثمّ العودة إلى المحاق. كلّ خانة في الجدول تُمثّل يومًا واحدًا وتُظهر التاريخ، إيموجي الطور، اسم الطور، ونسبة الإضاءة المئويّة المحسوبة بدقّة فلكيّة.\`,`,
    `                            p2: \`أهمّ الأطوار خلال أيّ شهر هي البدر (إضاءة 100٪) والمحاق (إضاءة 0٪). قسم "الأطوار القمريّة القادمة" أعلى الصفحة يَعرض التاريخ الميلاديّ والهجريّ بدقّة لكلّ طور قادم خلال \${_mName} \${_mY} وما بعده، اعتمادًا على خوارزميّات Jean Meeus الفلكيّة.\`,`,
    `                            p3: \`يَرتبط شهر \${_mName} \${_mY} بالتقويم الهجريّ ارتباطًا وثيقًا — إذ يَتداخل غالبًا مع شهر هجريّ كامل أو شهرَين. مَواعيد البدر والمحاق المعروضة في هذا التقويم تُساعد على تَقدير بداية الشهر الهجريّ القادم، رغم أنّ الإثبات الرسميّ يَخضع للرؤية الشرعيّة في كلّ بلد.\`,`,
    `                            p4: \`كلّ مَواعيد شروق وغروب القمر، وأوقات البدر والمحاق المعروضة، محسوبة بالتوقيت المحلّيّ لـ\${_cityName}. قد يَختلف الفرق بين شرق الأرض وغربها إلى 12 ساعة، لذلك تَختلف هذه المَواعيد بين \${_cityName} ومُدن أخرى مثل لندن أو نيويورك.\``,
    `                        } : {`,
    `                            title: \`Understanding the moon calendar in \${_cityName} for \${_mName} \${_mY}\`,`,
    `                            p1: \`The monthly moon calendar shows daily moon phases through \${_mName} \${_mY} in \${_cityName} — from new moon to full moon and back. Each cell represents one day and shows: the date, phase emoji, phase name, and the precisely-computed illumination percentage.\`,`,
    `                            p2: \`The two key phases each month are the full moon (100% illumination) and new moon (0% illumination). The "Upcoming moon phases" section near the top of the page shows the precise Gregorian and Hijri dates of every upcoming phase during \${_mName} \${_mY} and beyond — computed using Jean Meeus' astronomical methods.\`,`,
    `                            p3: \`\${_mName} \${_mY} ties closely to the Hijri calendar — typically overlapping with one or two full Hijri months. The full-moon and new-moon dates in this calendar help estimate when the next Hijri month begins, though official confirmation depends on local moon-sighting jurisprudence in each country.\`,`,
    `                            p4: \`All moonrise/moonset times, plus the full and new moon times shown, are computed in \${_cityName}'s local timezone. The east-west difference across the globe can reach 12 hours — so these times will differ between \${_cityName} and other cities like London or New York.\``,
    `                        };`
  ].join(EOL);
  const newChunk = [
    `                        const _MONTH_EDU_BY_LANG = {`,
    `                            ar: {`,
    `                                title: \`فهم تقويم القمر في \${_cityName} لشهر \${_mName} \${_mY}\`,`,
    `                                p1: \`تقويم القمر الشهريّ يَعرض الأطوار اليوميّة للقمر خلال شهر \${_mName} \${_mY} في \${_cityName}، من المحاق إلى البدر ثمّ العودة إلى المحاق. كلّ خانة في الجدول تُمثّل يومًا واحدًا وتُظهر التاريخ، إيموجي الطور، اسم الطور، ونسبة الإضاءة المئويّة المحسوبة بدقّة فلكيّة.\`,`,
    `                                p2: \`أهمّ الأطوار خلال أيّ شهر هي البدر (إضاءة 100٪) والمحاق (إضاءة 0٪). قسم "الأطوار القمريّة القادمة" أعلى الصفحة يَعرض التاريخ الميلاديّ والهجريّ بدقّة لكلّ طور قادم خلال \${_mName} \${_mY} وما بعده، اعتمادًا على خوارزميّات Jean Meeus الفلكيّة.\`,`,
    `                                p3: \`يَرتبط شهر \${_mName} \${_mY} بالتقويم الهجريّ ارتباطًا وثيقًا — إذ يَتداخل غالبًا مع شهر هجريّ كامل أو شهرَين. مَواعيد البدر والمحاق المعروضة في هذا التقويم تُساعد على تَقدير بداية الشهر الهجريّ القادم، رغم أنّ الإثبات الرسميّ يَخضع للرؤية الشرعيّة في كلّ بلد.\`,`,
    `                                p4: \`كلّ مَواعيد شروق وغروب القمر، وأوقات البدر والمحاق المعروضة، محسوبة بالتوقيت المحلّيّ لـ\${_cityName}. قد يَختلف الفرق بين شرق الأرض وغربها إلى 12 ساعة، لذلك تَختلف هذه المَواعيد بين \${_cityName} ومُدن أخرى مثل لندن أو نيويورك.\``,
    `                            },`,
    `                            en: {`,
    `                                title: \`Understanding the moon calendar in \${_cityName} for \${_mName} \${_mY}\`,`,
    `                                p1: \`The monthly moon calendar shows daily moon phases through \${_mName} \${_mY} in \${_cityName} — from new moon to full moon and back. Each cell represents one day and shows: the date, phase emoji, phase name, and the precisely-computed illumination percentage.\`,`,
    `                                p2: \`The two key phases each month are the full moon (100% illumination) and new moon (0% illumination). The "Upcoming moon phases" section near the top of the page shows the precise Gregorian and Hijri dates of every upcoming phase during \${_mName} \${_mY} and beyond — computed using Jean Meeus' astronomical methods.\`,`,
    `                                p3: \`\${_mName} \${_mY} ties closely to the Hijri calendar — typically overlapping with one or two full Hijri months. The full-moon and new-moon dates in this calendar help estimate when the next Hijri month begins, though official confirmation depends on local moon-sighting jurisprudence in each country.\`,`,
    `                                p4: \`All moonrise/moonset times, plus the full and new moon times shown, are computed in \${_cityName}'s local timezone. The east-west difference across the globe can reach 12 hours — so these times will differ between \${_cityName} and other cities like London or New York.\``,
    `                            },`,
    `                            fr: {`,
    `                                title: \`Comprendre le calendrier lunaire à \${_cityName} pour \${_mName} \${_mY}\`,`,
    `                                p1: \`Le calendrier lunaire mensuel affiche les phases lunaires quotidiennes durant \${_mName} \${_mY} à \${_cityName} — de la nouvelle lune à la pleine lune et retour. Chaque case représente un jour et affiche : la date, l'emoji de phase, le nom de la phase, et le pourcentage d'illumination calculé avec précision.\`,`,
    `                                p2: \`Les deux phases clés de chaque mois sont la pleine lune (100 % d'illumination) et la nouvelle lune (0 % d'illumination). La section "Prochaines phases lunaires" en haut de la page affiche les dates grégorienne et hégirienne précises de chaque phase à venir durant \${_mName} \${_mY} et au-delà — calculées avec les méthodes astronomiques de Jean Meeus.\`,`,
    `                                p3: \`\${_mName} \${_mY} est étroitement lié au calendrier hégirien — chevauchant typiquement un ou deux mois hégiriens complets. Les dates de pleine et nouvelle lune dans ce calendrier aident à estimer quand le prochain mois hégirien commence, bien que la confirmation officielle dépende de la jurisprudence locale d'observation lunaire dans chaque pays.\`,`,
    `                                p4: \`Toutes les heures de lever/coucher de la Lune, ainsi que les heures de pleine et nouvelle lune affichées, sont calculées dans le fuseau horaire local de \${_cityName}. La différence est-ouest à travers le globe peut atteindre 12 heures — ces heures différeront donc entre \${_cityName} et d'autres villes comme Londres ou New York.\``,
    `                            },`,
    `                            tr: {`,
    `                                title: \`\${_cityName} için \${_mName} \${_mY} ay takvimini anlama\`,`,
    `                                p1: \`Aylık ay takvimi \${_mName} \${_mY} boyunca \${_cityName}'de günlük ay evrelerini gösterir — yeni aydan dolunaya ve geri. Her hücre bir günü temsil eder ve şunları gösterir: tarih, evre emojisi, evre adı ve hassas olarak hesaplanan aydınlanma yüzdesi.\`,`,
    `                                p2: \`Her ay iki temel evre vardır: dolunay (%100 aydınlanma) ve yeni ay (%0 aydınlanma). Sayfanın üst kısmındaki "Yaklaşan ay evreleri" bölümü, \${_mName} \${_mY} ve sonrasında her yaklaşan evrenin hassas miladi ve hicri tarihlerini gösterir — Jean Meeus'un astronomik yöntemleri kullanılarak hesaplanır.\`,`,
    `                                p3: \`\${_mName} \${_mY}, hicri takvimle yakından bağlantılıdır — genellikle bir veya iki tam hicri ayla örtüşür. Bu takvimdeki dolunay ve yeni ay tarihleri, bir sonraki hicri ayın ne zaman başlayacağını tahmin etmeye yardımcı olur, ancak resmi onay her ülkedeki yerel ay rüyeti fıkıhına bağlıdır.\`,`,
    `                                p4: \`Tüm ay doğuşu/batışı saatleri ile gösterilen dolunay ve yeni ay saatleri, \${_cityName}'in yerel saat diliminde hesaplanır. Dünya genelinde doğu-batı farkı 12 saate ulaşabilir — bu nedenle bu saatler \${_cityName} ile Londra veya New York gibi diğer şehirler arasında farklı olacaktır.\``,
    `                            },`,
    `                            ur: {`,
    `                                title: \`\${_cityName} میں \${_mName} \${_mY} کے چاند کے کیلنڈر کو سمجھنا\`,`,
    `                                p1: \`ماہانہ چاند کا کیلنڈر \${_cityName} میں \${_mName} \${_mY} کے دوران چاند کی روزانہ اطوار دکھاتا ہے — نئے چاند سے بدر تک اور واپس۔ ہر خانہ ایک دن کی نمائندگی کرتا ہے اور دکھاتا ہے: تاریخ، طور کا ایموجی، طور کا نام، اور درست طور پر شمار کی گئی روشنی کا فیصد۔\`,`,
    `                                p2: \`ہر مہینے کی دو اہم اطوار بدر (100٪ روشنی) اور نیا چاند (0٪ روشنی) ہیں۔ صفحے کے اوپر "آنے والی چاند کی اطوار" سیکشن \${_mName} \${_mY} اور اس کے بعد ہر آنے والے طور کی درست عیسوی اور ہجری تاریخیں دکھاتا ہے — Jean Meeus کے فلکیاتی طریقوں سے شمار کی گئی۔\`,`,
    `                                p3: \`\${_mName} \${_mY} کا ہجری تقویم سے گہرا تعلق ہے — عام طور پر ایک یا دو مکمل ہجری مہینوں کے ساتھ ملتا ہے۔ اس کیلنڈر میں بدر اور نئے چاند کی تاریخیں اگلے ہجری مہینے کے آغاز کا اندازہ لگانے میں مدد کرتی ہیں، اگرچہ سرکاری تصدیق ہر ملک کی مقامی رؤیتِ ہلال کی فقہ پر منحصر ہے۔\`,`,
    `                                p4: \`تمام مطلع/مغیبِ چاند کے اوقات، نیز دکھائے گئے بدر اور نئے چاند کے اوقات، \${_cityName} کے مقامی ٹائم زون میں شمار کیے جاتے ہیں۔ زمین کے مشرق-مغرب کا فرق 12 گھنٹے تک پہنچ سکتا ہے — لہٰذا یہ اوقات \${_cityName} اور لندن یا نیویارک جیسے دوسرے شہروں کے درمیان مختلف ہوں گے۔\``,
    `                            },`,
    `                            de: {`,
    `                                title: \`Den Mondkalender in \${_cityName} für \${_mName} \${_mY} verstehen\`,`,
    `                                p1: \`Der monatliche Mondkalender zeigt die täglichen Mondphasen während \${_mName} \${_mY} in \${_cityName} — von Neumond zu Vollmond und zurück. Jede Zelle stellt einen Tag dar und zeigt: das Datum, das Phasen-Emoji, den Phasennamen und den präzise berechneten Beleuchtungsprozentsatz.\`,`,
    `                                p2: \`Die beiden wichtigsten Phasen jedes Monats sind der Vollmond (100 % Beleuchtung) und der Neumond (0 % Beleuchtung). Der Abschnitt "Kommende Mondphasen" oben auf der Seite zeigt die genauen gregorianischen und Hidschri-Daten jeder kommenden Phase während \${_mName} \${_mY} und darüber hinaus — berechnet mit den astronomischen Methoden von Jean Meeus.\`,`,
    `                                p3: \`\${_mName} \${_mY} ist eng mit dem Hidschri-Kalender verbunden — üblicherweise überlappt er mit einem oder zwei vollen Hidschri-Monaten. Die Vollmond- und Neumonddaten in diesem Kalender helfen abzuschätzen, wann der nächste Hidschri-Monat beginnt, obwohl die offizielle Bestätigung von der lokalen Mondsichtungs-Rechtsprechung in jedem Land abhängt.\`,`,
    `                                p4: \`Alle Mondaufgangs-/-untergangszeiten sowie die angezeigten Vollmond- und Neumondzeiten werden in der Ortszeit von \${_cityName} berechnet. Der Ost-West-Unterschied über den Globus kann 12 Stunden erreichen — daher werden diese Zeiten zwischen \${_cityName} und anderen Städten wie London oder New York unterschiedlich sein.\``,
    `                            },`,
    `                            id: {`,
    `                                title: \`Memahami kalender bulan di \${_cityName} untuk \${_mName} \${_mY}\`,`,
    `                                p1: \`Kalender bulan bulanan menampilkan fase bulan harian sepanjang \${_mName} \${_mY} di \${_cityName} — dari bulan baru ke purnama dan kembali. Setiap sel mewakili satu hari dan menampilkan: tanggal, emoji fase, nama fase, dan persentase iluminasi yang dihitung dengan presisi.\`,`,
    `                                p2: \`Dua fase utama setiap bulan adalah purnama (iluminasi 100%) dan bulan baru (iluminasi 0%). Bagian "Fase bulan mendatang" di bagian atas halaman menampilkan tanggal Masehi dan Hijriah yang tepat untuk setiap fase mendatang selama \${_mName} \${_mY} dan seterusnya — dihitung menggunakan metode astronomis Jean Meeus.\`,`,
    `                                p3: \`\${_mName} \${_mY} terkait erat dengan kalender Hijriah — biasanya tumpang tindih dengan satu atau dua bulan Hijriah penuh. Tanggal purnama dan bulan baru dalam kalender ini membantu memperkirakan kapan bulan Hijriah berikutnya dimulai, meskipun konfirmasi resmi tergantung pada fikih rukyat hilal lokal di setiap negara.\`,`,
    `                                p4: \`Semua waktu terbit/terbenam Bulan, ditambah waktu purnama dan bulan baru yang ditampilkan, dihitung dalam zona waktu lokal \${_cityName}. Perbedaan timur-barat di seluruh dunia dapat mencapai 12 jam — sehingga waktu-waktu ini akan berbeda antara \${_cityName} dan kota lain seperti London atau New York.\``,
    `                            },`,
    `                            es: {`,
    `                                title: \`Comprender el calendario lunar en \${_cityName} para \${_mName} \${_mY}\`,`,
    `                                p1: \`El calendario lunar mensual muestra las fases lunares diarias durante \${_mName} \${_mY} en \${_cityName} — de la luna nueva a la luna llena y vuelta. Cada celda representa un día y muestra: la fecha, el emoji de fase, el nombre de la fase y el porcentaje de iluminación calculado con precisión.\`,`,
    `                                p2: \`Las dos fases clave de cada mes son la luna llena (100 % de iluminación) y la luna nueva (0 % de iluminación). La sección "Próximas fases lunares" en la parte superior de la página muestra las fechas gregoriana e hijri precisas de cada fase próxima durante \${_mName} \${_mY} y más allá — calculadas con los métodos astronómicos de Jean Meeus.\`,`,
    `                                p3: \`\${_mName} \${_mY} está estrechamente vinculado al calendario hijri — típicamente se superpone con uno o dos meses hijri completos. Las fechas de luna llena y luna nueva en este calendario ayudan a estimar cuándo comienza el próximo mes hijri, aunque la confirmación oficial depende de la jurisprudencia local de observación lunar en cada país.\`,`,
    `                                p4: \`Todos los horarios de salida/puesta de la Luna, además de los horarios de luna llena y nueva mostrados, se calculan en la zona horaria local de \${_cityName}. La diferencia este-oeste en el globo puede alcanzar 12 horas — por lo que estos horarios diferirán entre \${_cityName} y otras ciudades como Londres o Nueva York.\``,
    `                            },`,
    `                            bn: {`,
    `                                title: \`\${_cityName}-এ \${_mName} \${_mY}-এর জন্য চাঁদের ক্যালেন্ডার বোঝা\`,`,
    `                                p1: \`মাসিক চাঁদের ক্যালেন্ডার \${_cityName}-এ \${_mName} \${_mY}-এর সময় দৈনিক চাঁদের দশা দেখায় — অমাবস্যা থেকে পূর্ণিমা এবং ফিরে। প্রতিটি সেল একটি দিন প্রতিনিধিত্ব করে এবং দেখায়: তারিখ, দশার ইমোজি, দশার নাম এবং নির্ভুলভাবে গণনা করা আলোকন শতাংশ।\`,`,
    `                                p2: \`প্রতি মাসের দুটি প্রধান দশা হল পূর্ণিমা (১০০% আলোকন) এবং অমাবস্যা (০% আলোকন)। পৃষ্ঠার শীর্ষে "আসন্ন চাঁদের দশা" বিভাগ \${_mName} \${_mY} এবং তার পরেও প্রতিটি আসন্ন দশার সঠিক খ্রিস্টীয় ও হিজরি তারিখ দেখায় — Jean Meeus-এর জ্যোতির্বিজ্ঞান পদ্ধতি ব্যবহার করে গণনা করা।\`,`,
    `                                p3: \`\${_mName} \${_mY} হিজরি ক্যালেন্ডারের সাথে ঘনিষ্ঠভাবে সম্পর্কিত — সাধারণত এক বা দুটি পূর্ণ হিজরি মাসের সাথে ওভারল্যাপ করে। এই ক্যালেন্ডারে পূর্ণিমা ও অমাবস্যার তারিখগুলি পরবর্তী হিজরি মাস কখন শুরু হয় তা অনুমান করতে সাহায্য করে, যদিও আনুষ্ঠানিক নিশ্চিতকরণ প্রতিটি দেশে স্থানীয় চাঁদ দেখার ফিকহের উপর নির্ভর করে।\`,`,
    `                                p4: \`সমস্ত চাঁদের উদয়/অস্তের সময়, পাশাপাশি দেখানো পূর্ণিমা ও অমাবস্যার সময়, \${_cityName}-এর স্থানীয় টাইমজোনে গণনা করা হয়। বিশ্ব জুড়ে পূর্ব-পশ্চিম পার্থক্য ১২ ঘণ্টা পর্যন্ত পৌঁছাতে পারে — তাই এই সময়গুলি \${_cityName} এবং লন্ডন বা নিউইয়র্কের মতো অন্যান্য শহরের মধ্যে আলাদা হবে।\``,
    `                            },`,
    `                            ms: {`,
    `                                title: \`Memahami kalendar bulan di \${_cityName} untuk \${_mName} \${_mY}\`,`,
    `                                p1: \`Kalendar bulan bulanan memaparkan fasa bulan harian sepanjang \${_mName} \${_mY} di \${_cityName} — dari anak bulan ke bulan purnama dan kembali. Setiap sel mewakili satu hari dan memaparkan: tarikh, emoji fasa, nama fasa, dan peratus pencahayaan yang dikira dengan tepat.\`,`,
    `                                p2: \`Dua fasa utama setiap bulan ialah bulan purnama (100% pencahayaan) dan anak bulan (0% pencahayaan). Bahagian "Fasa bulan akan datang" di bahagian atas halaman memaparkan tarikh Masihi dan Hijrah yang tepat bagi setiap fasa akan datang sepanjang \${_mName} \${_mY} dan seterusnya — dikira menggunakan kaedah astronomi Jean Meeus.\`,`,
    `                                p3: \`\${_mName} \${_mY} berkait rapat dengan kalendar Hijrah — biasanya bertindih dengan satu atau dua bulan Hijrah penuh. Tarikh bulan purnama dan anak bulan dalam kalendar ini membantu menganggar bila bulan Hijrah seterusnya bermula, walaupun pengesahan rasmi bergantung pada fiqh rukyah bulan tempatan di setiap negara.\`,`,
    `                                p4: \`Semua waktu terbit/terbenam Bulan, serta waktu bulan purnama dan anak bulan yang dipaparkan, dikira dalam zon waktu tempatan \${_cityName}. Perbezaan timur-barat di seluruh dunia boleh mencapai 12 jam — jadi waktu-waktu ini akan berbeza antara \${_cityName} dan bandar lain seperti London atau New York.\``,
    `                            }`,
    `                        };`,
    `                        const _MONTH_EDU = _MONTH_EDU_BY_LANG[_lng_] || _MONTH_EDU_BY_LANG.en;`
  ].join(EOL);
  s = replaceExact(s, 'B2-e _MONTH_EDU', oldChunk, newChunk);
}

// ════════════════════════════════════════════════════════════════════════
// B1: _DATE_EDU_AR/EN — replace AR + EN const pair with 10-lang object
// ════════════════════════════════════════════════════════════════════════
{
  const oldChunk = [
    `                const _DATE_EDU_AR = {`,
    `                    title: \`التاريخ الهجريّ ورؤية الهلال في \${_D}\`,`,
    `                    p1: \`يَرتبط القمر بالتقويم الهجريّ ارتباطًا مباشرًا، إذ يَبدأ كلّ شهر هجريّ برؤية الهلال بعد المحاق ويَستمرّ 29 أو 30 يومًا. حالة القمر في \${_Cd} يوم \${_D} مَحسوبة بدقّة فلكيّة وفق منهجيّات Jean Meeus، وتُساعد على تَقدير موعد بداية الشهر الهجريّ القادم.\`,`,
    `                    p2: \`قد تَختلف بدايات الأشهر الهجريّة بين البلدان بحسب الرؤية الشرعيّة المحلّيّة لكلّ دولة. هذه الصفحة تَعرض البيانات الفلكيّة الموضوعيّة للقمر في \${_Cd} يوم \${_D} — أمّا ثبوت الشهر فيَخضع للاجتهاد الفقهيّ في كلّ بلد.\`,`,
    `                    p3: \`كلّ مَواعيد شروق وغروب القمر، ومواعيد البدر والمحاق المعروضة هنا، محسوبة بالتوقيت المحلّيّ لـ\${_Cd}، مع اعتماد إحداثيّات المدينة الدقيقة. يَختلف وقت رؤية الهلال من مدينة إلى أخرى بحسب خطّ الطول وارتفاع الأفق.\``,
    `                };`,
    `                const _DATE_EDU_EN = {`,
    `                    title: \`Hijri date and crescent visibility on \${_D}\`,`,
    `                    p1: \`The Moon is tied directly to the Hijri calendar — each Hijri month begins with the crescent sighting after the new moon and lasts 29 or 30 days. The Moon's state in \${_Cd} on \${_D} is computed astronomically using Jean Meeus' methods, and helps estimate when the next Hijri month begins.\`,`,
    `                    p2: \`Hijri month starts may vary between countries based on local Islamic moon-sighting authority. This page shows the objective astronomical data for the Moon in \${_Cd} on \${_D} — the official confirmation of each month depends on local jurisprudence in each country.\`,`,
    `                    p3: \`All moonrise/moonset and full/new moon times shown on this page are computed in \${_Cd}'s local timezone using the city's precise coordinates. Crescent visibility times also vary between cities based on longitude and horizon altitude.\``,
    `                };`,
    `                const _edu = (_lng_ === 'ar') ? _DATE_EDU_AR : _DATE_EDU_EN;`
  ].join(EOL);
  const newChunk = [
    `                const _DATE_EDU_BY_LANG = {`,
    `                    ar: {`,
    `                        title: \`التاريخ الهجريّ ورؤية الهلال في \${_D}\`,`,
    `                        p1: \`يَرتبط القمر بالتقويم الهجريّ ارتباطًا مباشرًا، إذ يَبدأ كلّ شهر هجريّ برؤية الهلال بعد المحاق ويَستمرّ 29 أو 30 يومًا. حالة القمر في \${_Cd} يوم \${_D} مَحسوبة بدقّة فلكيّة وفق منهجيّات Jean Meeus، وتُساعد على تَقدير موعد بداية الشهر الهجريّ القادم.\`,`,
    `                        p2: \`قد تَختلف بدايات الأشهر الهجريّة بين البلدان بحسب الرؤية الشرعيّة المحلّيّة لكلّ دولة. هذه الصفحة تَعرض البيانات الفلكيّة الموضوعيّة للقمر في \${_Cd} يوم \${_D} — أمّا ثبوت الشهر فيَخضع للاجتهاد الفقهيّ في كلّ بلد.\`,`,
    `                        p3: \`كلّ مَواعيد شروق وغروب القمر، ومواعيد البدر والمحاق المعروضة هنا، محسوبة بالتوقيت المحلّيّ لـ\${_Cd}، مع اعتماد إحداثيّات المدينة الدقيقة. يَختلف وقت رؤية الهلال من مدينة إلى أخرى بحسب خطّ الطول وارتفاع الأفق.\``,
    `                    },`,
    `                    en: {`,
    `                        title: \`Hijri date and crescent visibility on \${_D}\`,`,
    `                        p1: \`The Moon is tied directly to the Hijri calendar — each Hijri month begins with the crescent sighting after the new moon and lasts 29 or 30 days. The Moon's state in \${_Cd} on \${_D} is computed astronomically using Jean Meeus' methods, and helps estimate when the next Hijri month begins.\`,`,
    `                        p2: \`Hijri month starts may vary between countries based on local Islamic moon-sighting authority. This page shows the objective astronomical data for the Moon in \${_Cd} on \${_D} — the official confirmation of each month depends on local jurisprudence in each country.\`,`,
    `                        p3: \`All moonrise/moonset and full/new moon times shown on this page are computed in \${_Cd}'s local timezone using the city's precise coordinates. Crescent visibility times also vary between cities based on longitude and horizon altitude.\``,
    `                    },`,
    `                    fr: {`,
    `                        title: \`Date hégirienne et visibilité du croissant le \${_D}\`,`,
    `                        p1: \`La Lune est directement liée au calendrier hégirien — chaque mois hégirien commence avec l'observation du croissant après la nouvelle lune et dure 29 ou 30 jours. L'état de la Lune à \${_Cd} le \${_D} est calculé astronomiquement avec les méthodes de Jean Meeus, et aide à estimer quand le prochain mois hégirien commence.\`,`,
    `                        p2: \`Les débuts des mois hégiriens peuvent varier entre les pays selon l'autorité locale d'observation islamique de la Lune. Cette page affiche les données astronomiques objectives pour la Lune à \${_Cd} le \${_D} — la confirmation officielle de chaque mois dépend de la jurisprudence locale dans chaque pays.\`,`,
    `                        p3: \`Toutes les heures de lever/coucher de la Lune et de pleine/nouvelle lune affichées sur cette page sont calculées dans le fuseau horaire local de \${_Cd} en utilisant les coordonnées précises de la ville. Les heures de visibilité du croissant varient également entre les villes selon la longitude et l'altitude de l'horizon.\``,
    `                    },`,
    `                    tr: {`,
    `                        title: \`\${_D} tarihinde hicri tarih ve hilal görünürlüğü\`,`,
    `                        p1: \`Ay, hicri takvimle doğrudan bağlantılıdır — her hicri ay yeni aydan sonra hilalin görülmesiyle başlar ve 29 veya 30 gün sürer. \${_D} tarihinde \${_Cd}'deki Ay'ın durumu, Jean Meeus yöntemleriyle astronomik olarak hesaplanır ve bir sonraki hicri ayın ne zaman başlayacağını tahmin etmeye yardımcı olur.\`,`,
    `                        p2: \`Hicri ay başlangıçları, her ülkedeki yerel İslami ay rüyeti otoritesine bağlı olarak ülkeler arasında değişebilir. Bu sayfa, \${_D} tarihinde \${_Cd}'deki Ay için nesnel astronomik verileri gösterir — her ayın resmi onayı her ülkedeki yerel fıkıha bağlıdır.\`,`,
    `                        p3: \`Bu sayfada gösterilen tüm ay doğuşu/batışı ve dolunay/yeni ay saatleri, şehrin hassas koordinatları kullanılarak \${_Cd}'in yerel saat diliminde hesaplanır. Hilal görünürlüğü saatleri de boylama ve ufuk yüksekliğine bağlı olarak şehirler arasında değişir.\``,
    `                    },`,
    `                    ur: {`,
    `                        title: \`\${_D} کو ہجری تاریخ اور ہلال کی رؤیت\`,`,
    `                        p1: \`چاند کا براہِ راست ہجری تقویم سے تعلق ہے — ہر ہجری مہینہ نئے چاند کے بعد ہلال کی رؤیت سے شروع ہوتا ہے اور 29 یا 30 دن جاری رہتا ہے۔ \${_D} کو \${_Cd} میں چاند کی حالت Jean Meeus کے طریقوں سے فلکیاتی طور پر شمار کی جاتی ہے، اور اگلے ہجری مہینے کے آغاز کے وقت کا اندازہ لگانے میں مدد کرتی ہے۔\`,`,
    `                        p2: \`ہجری ماہ کے آغاز ہر ملک میں مقامی اسلامی رؤیتِ ہلال کی اتھارٹی کے مطابق ممالک کے درمیان مختلف ہو سکتے ہیں۔ یہ صفحہ \${_D} کو \${_Cd} میں چاند کے لیے معروضی فلکیاتی ڈیٹا دکھاتا ہے — ہر مہینے کی سرکاری تصدیق ہر ملک کی مقامی فقہ پر منحصر ہے۔\`,`,
    `                        p3: \`اس صفحے پر دکھائے گئے تمام مطلع/مغیبِ چاند اور بدر/نئے چاند کے اوقات شہر کے درست کوآرڈینیٹس کا استعمال کرتے ہوئے \${_Cd} کے مقامی ٹائم زون میں شمار کیے جاتے ہیں۔ ہلال کی رؤیت کے اوقات بھی خط طول اور افق کی بلندی کے مطابق شہروں کے درمیان مختلف ہوتے ہیں۔\``,
    `                    },`,
    `                    de: {`,
    `                        title: \`Hidschri-Datum und Sichelmond-Sichtbarkeit am \${_D}\`,`,
    `                        p1: \`Der Mond ist direkt mit dem Hidschri-Kalender verbunden — jeder Hidschri-Monat beginnt mit der Sichtung der Mondsichel nach dem Neumond und dauert 29 oder 30 Tage. Der Zustand des Mondes in \${_Cd} am \${_D} wird astronomisch mit den Methoden von Jean Meeus berechnet und hilft abzuschätzen, wann der nächste Hidschri-Monat beginnt.\`,`,
    `                        p2: \`Hidschri-Monatsanfänge können zwischen Ländern variieren, basierend auf der lokalen islamischen Mondsichtungs-Autorität. Diese Seite zeigt die objektiven astronomischen Daten für den Mond in \${_Cd} am \${_D} — die offizielle Bestätigung jedes Monats hängt von der lokalen Rechtsprechung in jedem Land ab.\`,`,
    `                        p3: \`Alle Mondaufgangs-/-untergangszeiten und Vollmond-/Neumondzeiten auf dieser Seite werden mit den präzisen Koordinaten der Stadt in der lokalen Zeitzone von \${_Cd} berechnet. Sichtbarkeitszeiten der Mondsichel variieren ebenfalls zwischen Städten je nach geografischer Länge und Horizonthöhe.\``,
    `                    },`,
    `                    id: {`,
    `                        title: \`Tanggal Hijriah dan visibilitas hilal pada \${_D}\`,`,
    `                        p1: \`Bulan terkait langsung dengan kalender Hijriah — setiap bulan Hijriah dimulai dengan rukyat hilal setelah bulan baru dan berlangsung 29 atau 30 hari. Keadaan Bulan di \${_Cd} pada \${_D} dihitung secara astronomis menggunakan metode Jean Meeus, dan membantu memperkirakan kapan bulan Hijriah berikutnya dimulai.\`,`,
    `                        p2: \`Awal bulan Hijriah dapat bervariasi antar negara berdasarkan otoritas rukyat hilal Islam lokal. Halaman ini menampilkan data astronomis objektif untuk Bulan di \${_Cd} pada \${_D} — konfirmasi resmi setiap bulan tergantung pada fikih lokal di setiap negara.\`,`,
    `                        p3: \`Semua waktu terbit/terbenam Bulan dan purnama/bulan baru yang ditampilkan di halaman ini dihitung dalam zona waktu lokal \${_Cd} menggunakan koordinat presisi kota. Waktu visibilitas hilal juga bervariasi antar kota berdasarkan bujur dan ketinggian horizon.\``,
    `                    },`,
    `                    es: {`,
    `                        title: \`Fecha hijri y visibilidad del creciente el \${_D}\`,`,
    `                        p1: \`La Luna está vinculada directamente al calendario hijri — cada mes hijri comienza con la observación del creciente tras la luna nueva y dura 29 o 30 días. El estado de la Luna en \${_Cd} el \${_D} se calcula astronómicamente con los métodos de Jean Meeus, y ayuda a estimar cuándo comienza el próximo mes hijri.\`,`,
    `                        p2: \`Los inicios de meses hijri pueden variar entre países según la autoridad local de observación islámica de la Luna. Esta página muestra los datos astronómicos objetivos para la Luna en \${_Cd} el \${_D} — la confirmación oficial de cada mes depende de la jurisprudencia local en cada país.\`,`,
    `                        p3: \`Todos los horarios de salida/puesta de la Luna y de luna llena/nueva mostrados en esta página se calculan en la zona horaria local de \${_Cd} usando las coordenadas precisas de la ciudad. Los horarios de visibilidad del creciente también varían entre ciudades según la longitud y la altitud del horizonte.\``,
    `                    },`,
    `                    bn: {`,
    `                        title: \`\${_D} তারিখে হিজরি তারিখ ও হিলালের দৃশ্যমানতা\`,`,
    `                        p1: \`চাঁদ সরাসরি হিজরি ক্যালেন্ডারের সাথে যুক্ত — প্রতিটি হিজরি মাস অমাবস্যার পর হিলাল দেখার মাধ্যমে শুরু হয় এবং ২৯ বা ৩০ দিন স্থায়ী হয়। \${_D}-এ \${_Cd}-এ চাঁদের অবস্থা Jean Meeus-এর পদ্ধতি ব্যবহার করে জ্যোতির্বিজ্ঞানগতভাবে গণনা করা হয় এবং পরবর্তী হিজরি মাস কখন শুরু হবে তা অনুমান করতে সাহায্য করে।\`,`,
    `                        p2: \`স্থানীয় ইসলামিক চাঁদ দেখার কর্তৃত্বের উপর ভিত্তি করে দেশভেদে হিজরি মাসের শুরু পরিবর্তিত হতে পারে। এই পৃষ্ঠা \${_D}-এ \${_Cd}-এ চাঁদের জন্য বস্তুনিষ্ঠ জ্যোতির্বিজ্ঞান ডেটা দেখায় — প্রতিটি মাসের আনুষ্ঠানিক নিশ্চিতকরণ প্রতিটি দেশে স্থানীয় ফিকহের উপর নির্ভর করে।\`,`,
    `                        p3: \`এই পৃষ্ঠায় দেখানো সমস্ত চাঁদের উদয়/অস্ত এবং পূর্ণিমা/অমাবস্যার সময় শহরের নির্ভুল স্থানাঙ্ক ব্যবহার করে \${_Cd}-এর স্থানীয় টাইমজোনে গণনা করা হয়। হিলাল দৃশ্যমানতার সময়ও দ্রাঘিমাংশ ও দিগন্তের উচ্চতা অনুসারে শহরভেদে পরিবর্তিত হয়।\``,
    `                    },`,
    `                    ms: {`,
    `                        title: \`Tarikh Hijrah dan kelihatannya hilal pada \${_D}\`,`,
    `                        p1: \`Bulan berkait langsung dengan kalendar Hijrah — setiap bulan Hijrah bermula dengan rukyah hilal selepas anak bulan dan berlangsung 29 atau 30 hari. Keadaan Bulan di \${_Cd} pada \${_D} dikira secara astronomi menggunakan kaedah Jean Meeus, dan membantu menganggar bila bulan Hijrah seterusnya bermula.\`,`,
    `                        p2: \`Permulaan bulan Hijrah boleh berbeza antara negara berdasarkan pihak berkuasa rukyah bulan Islam tempatan. Halaman ini memaparkan data astronomi objektif untuk Bulan di \${_Cd} pada \${_D} — pengesahan rasmi setiap bulan bergantung pada fiqh tempatan di setiap negara.\`,`,
    `                        p3: \`Semua waktu terbit/terbenam Bulan dan bulan purnama/anak bulan yang dipaparkan di halaman ini dikira dalam zon waktu tempatan \${_Cd} menggunakan koordinat tepat bandar. Waktu kelihatannya hilal juga berbeza antara bandar berdasarkan bujur dan ketinggian ufuk.\``,
    `                    }`,
    `                };`,
    `                const _edu = _DATE_EDU_BY_LANG[_lng_] || _DATE_EDU_BY_LANG.en;`
  ].join(EOL);
  s = replaceExact(s, 'B1 _DATE_EDU', oldChunk, newChunk);
}

fs.writeFileSync(file, s, 'utf8');
console.log('All Phase D3.1.3c edits applied.');
