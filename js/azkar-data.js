/**
 * AZKAR-RESTRUCTURE-MORNING-PHASE-1 (2026-05-25)
 * ----------------------------------------------------------
 * Source-of-truth data file for the new azkar feature:
 *
 *   - /azkar             → uses window.AzkarCategories to render
 *                          a hub-of-cards landing page.
 *   - /azkar/morning-azkar → uses window.AzkarMorning to render
 *                            the 10 morning items (user will supply
 *                            the missing 15 separately to reach 25;
 *                            renderer works at any count).
 *
 * Schema invariants (do NOT break — localStorage keys are stable):
 *   - id           : 'morning-001' … format. NEVER reuse or reorder.
 *   - category     : matches AzkarCategories[*].id ('morning').
 *   - order        : 1-based display index within the category.
 *   - type         : 'dhikr' (default site font) | 'quran' (Amiri
 *                    Quran via .azkar-quran-text). Flip to 'quran'
 *                    when an item's text is a verbatim Quranic ayah
 *                    so the renderer applies the Quran-grade font.
 *   - text         : Arabic text VERBATIM from the trusted source.
 *                    Never auto-translate or paraphrase.
 *   - repeat       : integer ≥ 1. Counter target.
 *   - repeatLabel  : { ar, en } human-readable label (falls back
 *                    to i18n templates if null).
 *   - source       : { ref: 'البخاري' } — hadith collection / book.
 *   - virtue       : optional { ar, en } — collapsible under <details>.
 *   - authenticity : 'sahih' | 'hasan' | 'quran' | 'weak_hadith' | null
 *   - authenticityNote : optional { ar, en } — quiet scholarly note
 *                        under separate <details>.
 *
 * Phase 1 ships ONLY the 10 morning items migrated verbatim from the
 * legacy js/duas.js → AzkarDB.categories[0].duas (which remains in
 * place as a deprecated compat shim — do NOT delete it this cycle).
 */

(function () {
    'use strict';

    // ────────────────────────────────────────────────────────────────
    // 10 hub categories (morning is the only LIVE one in Phase 1).
    // Slugs match the route segment after /azkar/.
    // ────────────────────────────────────────────────────────────────
    window.AzkarCategories = [
        {
            id: 'morning',
            slug: 'morning-azkar',
            route: '/azkar/morning-azkar',
            icon: '🌅',
            status: 'live',
            defaults: { count: 25, estTimeMin: '10–15' }
        },
        {
            id: 'evening',
            slug: 'evening-azkar',
            route: '/azkar/evening-azkar',
            icon: '🌙',
            // AZKAR-EVENING-PHASE-1 (2026-05-26): flipped soon → live.
            status: 'live',
            defaults: { count: 0, estTimeMin: null }
        },
        {
            id: 'sleep',
            slug: 'sleep-azkar',
            route: '/azkar/sleep-azkar',
            icon: '😴',
            status: 'soon',
            defaults: { count: 0, estTimeMin: null }
        },
        {
            // AZKAR-PRAYER-PHASE-1 (2026-05-26): renamed 'after-prayer' →
            // 'prayer' to cover the full set of in-prayer + post-salam
            // adhkar (wudu / mosque / takbir / ruku / sujud / tashahhud /
            // qunut / post-salam / witr / etc.). 17 cards. Status flipped
            // soon → live.
            id: 'prayer',
            slug: 'prayer-azkar',
            route: '/azkar/prayer-azkar',
            icon: '🕌',
            status: 'live',
            defaults: { count: 0, estTimeMin: null }
        },
        {
            id: 'wake',
            slug: 'wake-azkar',
            route: '/azkar/wake-azkar',
            icon: '⛅',
            status: 'soon',
            defaults: { count: 0, estTimeMin: null }
        },
        {
            id: 'travel',
            slug: 'travel-azkar',
            route: '/azkar/travel-azkar',
            icon: '✈️',
            status: 'soon',
            defaults: { count: 0, estTimeMin: null }
        },
        {
            id: 'food-drink',
            slug: 'food-drink-azkar',
            route: '/azkar/food-drink-azkar',
            icon: '🍽',
            status: 'soon',
            defaults: { count: 0, estTimeMin: null }
        },
        {
            id: 'mosque',
            slug: 'mosque-azkar',
            route: '/azkar/mosque-azkar',
            icon: '🕋',
            status: 'soon',
            defaults: { count: 0, estTimeMin: null }
        },
        {
            id: 'istighfar-tasbih',
            slug: 'istighfar-tasbih-azkar',
            route: '/azkar/istighfar-tasbih-azkar',
            icon: '📿',
            status: 'soon',
            defaults: { count: 0, estTimeMin: null }
        },
        {
            id: 'quran-sunnah-duas',
            slug: 'quran-sunnah-duas',
            route: '/azkar/quran-sunnah-duas',
            icon: '📖',
            status: 'soon',
            defaults: { count: 0, estTimeMin: null }
        }
    ];

    // ────────────────────────────────────────────────────────────────
    // 25 canonical morning azkar (user-supplied, 2026-05-25).
    // Items 001-004 are Quranic ayat → type:'quran' (Amiri Quran font).
    // Items 005-025 are prophetic dhikr → type:'dhikr' (default font).
    // Stable ids morning-001 … morning-025 — NEVER reuse, NEVER reorder
    // (localStorage keys depend on these ids).
    //
    // Schema unchanged. Renderer (js/app.js) handles all 25 dynamically:
    //   - progress shows "تم إكمال X من 25"
    //   - repeat===1 items render the "تمت القراءة" toggle
    //   - repeat>1 items render the small pill counter (current / target)
    // ────────────────────────────────────────────────────────────────
    window.AzkarMorning = [
        {
            id: 'morning-001',
            category: 'morning',
            order: 1,
            type: 'quran',
            title: { ar: 'آية الكرسي', en: 'Ayat Al-Kursi' },
            text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ، لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ، لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ، مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ، يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ، وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ، وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ، وَلَا يَئُودُهُ حِفْظُهُمَا، وَهُوَ الْعَلِيُّ الْعَظِيمُ.',
            // AZKAR-MORNING-ADD-ENGLISH-TRANSLATION-ABOVE-ARABIC-1: optional English translation of the dhikr text,
            // shown ABOVE the Arabic ONLY in the English UI (lang=en). Never shown in ar UI; Arabic text unchanged.
            // Saheeh International (Quran 2:255) — starts at the ayah (no basmala, matching the Arabic above).
            translation_en: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is [presently] before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.',
            translation_fr: "Allah ! Il n’est de divinité digne d’être adorée que Lui, le Dieu Vivant et Eternel . Il n’est gagné ni par le sommeil, ni même par la somnolence. Tout ce qui se trouve dans les cieux et sur la terre Lui appartient. Qui donc pourrait intercéder auprès de Lui sans Sa permission ? Il connaît leur avenir comme leur passé , tandis que les hommes n’embrassent de Sa science et de Ses mystères que ce qu’Il veut bien leur dévoiler. Son Koursi embrasse les cieux et la terre dont Il assure la pérennité sans aucune difficulté. Il est le Très Haut, le Très Glorieux.",
            translation_ur: "اللہ تعالیٰ ہی معبود برحق ہے جس کے سوا کوئی معبود نہیں جو زنده اور سب کا تھامنے واﻻ ہے، جسے نہ اونگھ آئے نہ نیند، اس کی ملکیت میں زمین اور آسمانوں کی تمام چیزیں ہیں۔ کون ہے جو اس کی اجازت کے بغیر اس کے سامنے شفاعت کرسکے، وه جانتا ہے جو ان کے سامنے ہے اور جو ان کے پیچھے ہے اور وه اس کے علم میں سے کسی چیز کا احاطہ نہیں کرسکتے مگر جتنا وه چاہے ، اس کی کرسی کی وسعت نے زمین و آسمان کو گھیر رکھا ہے اور اللہ تعالیٰ ان کی حفاﻇت سے نہ تھکتا اور نہ اکتاتا ہے، وه تو بہت بلند اور بہت بڑا ہے۔",
            translation_tr: "Allah; O'ndan başka hakkıyla ibadete layık hiçbir hak ilâh olmayandır; Hayy'dır (diridir); Kayyûm'dur. (kendi zâtiyle kâimdir.) O'nu ne bir uyuklama, ne de bir uyku tutar. Göklerde ve yerde ne varsa hepsi O'nundur. İzni olmadan, O'nun yanında kim şefaat edebilir? Onların önünde ve arkasında olan her şeyi bilir. Onlar ise, O'nun dilediği kadarından başka ilminden hiçbir şey kavrayamazlar. O'nun Kürsü'sü gökleri ve yeri kaplamıştır. Onların her ikisini de görüp gözetmek O'na ağır gelmez. O, çok yücedir, çok büyüktür.",
            translation_bn: "আল্লাহ্‌ , তিনি ছাড়া কোনো সত্য ইলাহ নেই । তিনি চিরঞ্জীব, সর্বসত্তার ধারক । তাঁকে তন্দ্রাও স্পর্শ করতে পারে না, নিদ্রাও নয় । আসমানসমূহে যা রয়েছে ও যমীনে যা রয়েছে সবই তাঁর । কে সে, যে তাঁর অনুমতি ব্যতীত তাঁর কাছে সুপারিশ করবে ? তাদের সামনে ও পেছনে যা কিছু আছে তা তিনি জানেন । আর যা তিনি ইচ্ছে করেন তা ছাড়া তাঁর জ্ঞানের কোনো কিছুকেই তারা পরিবেষ্টন করতে পারে না । তাঁর ‘কুরসী’ আসমানসমূহ ও যমীনকে পরিব্যাপ্ত করে আছে ; আর এ দুটোর রক্ষণাবেক্ষণ তাঁর জন্য বোঝা হয় না । আর তিনি সুউচ্চ সুমহান।",
            translation_ms: "Allah, tiada Tuhan (yang berhak disembah) melainkan Dia, Yang Tetap hidup, Yang Kekal selama-lamanya mentadbirkan (sekalian makhlukNya). Yang tidak mengantuk usahkan tidur. Yang memiliki segala yang ada di langit dan yang ada di bumi. Tiada sesiapa yang dapat memberi syafaat (pertolongan) di sisiNya melainkan dengan izinNya. yang mengetahui apa yang ada di hadapan mereka dan apa yang ada di belakang mereka, sedang mereka tidak mengetahui sesuatu pun dari (kandungan) ilmu Allah melainkan apa yang Allah kehendaki (memberitahu kepadanya). Luasnya Kursi Allah (ilmuNya dan kekuasaanNya) meliputi langit dan bumi; dan tiadalah menjadi keberatan kepada Allah menjaga serta memelihara keduanya. Dan Dia lah Yang Maha Tinggi (darjat kemuliaanNya), lagi Maha Besar (kekuasaanNya)",
            translation_de: "Allah - es gibt keine (zu Recht angebetete) Gottheit außer Ihm, dem Lebendigen, dem Beständigen. Ihn überkommt weder Schlummer noch Schlaf. Ihm gehört, was in den Himmeln und was auf der Erde ist. Wer ist es denn, der bei Ihm Fürsprache einlegen könnte - außer mit Seiner Erlaubnis? Er weiß, was vor ihnen und was hinter ihnen liegt, sie aber umfassen nichts von Seinem Wissen - außer, was Er will. Sein Thronschemel umfasst die Himmel und die Erde, und ihre Behütung beschwert Ihn nicht. Und Er ist der Hohe, (und) der Gewaltige.",
            translation_es: "¡Dios! No existe nada ni nadie con derecho a ser adorado excepto Él, el Viviente [Eterno], el Sustentador [y Gobernador de toda la creación] . No Lo afectan somnolencia ni sueño. Suyo es cuanto hay en los cielos y la Tierra. ¿Quién podrá interceder ante Él si no es con Su permiso? Conoce el pasado y el futuro [lo manifiesto y lo oculto] y nadie abarca de Su conocimiento salvo lo que Él quiere. El escabel de Su Trono abarca los cielos y la Tierra, y la custodia [y mantenimiento] de ambos no Lo agobia. Y Él es el Sublime, el Grandioso.",
            translation_id: "Allah, tidak ada tuhan selain Dia. Yang Mahahidup, Yang terus menerus mengurus (makhluk-Nya), tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan apa yang ada di bumi. Tidak ada yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya. Dia mengetahui apa yang dihadapan mereka dan apa yang di belakang mereka, dan mereka tidak mengetahui sesuatu apa pun tentang ilmu-Nya melainkan apa yang Dia kehendaki. Kursi-Nya meliputi langit dan bumi. Dan Dia tidak merasa berat memelihara keduanya, dan Dia Mahatinggi, Mahabesar.",
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه الحاكم', sourceUrl: null },
            virtue: {
                ar: 'من قالها حين يصبح أُجير من الجن حتى يمسي، ومن قالها حين يمسي أُجير منهم حتى يصبح.',
                en: null
            },
            authenticity: 'quran',
            authenticityNote: null
        },
        {
            id: 'morning-002',
            category: 'morning',
            order: 2,
            type: 'quran',
            title: { ar: 'سورة الإخلاص', en: 'Surah Al-Ikhlas' },
            text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ هُوَ اللَّهُ أَحَدٌ، اللَّهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ.',
            // AZKAR-MORNING-ADD-ENGLISH-TRANSLATION-SURAH-IKHLAS-1: English translation shown ABOVE the Arabic
            // ONLY in the English UI (lang=en), same class/style as Ayat al-Kursi (single flowing paragraph).
            // Saheeh International (Quran 112:1-4); the Basmala is translated FIRST because the Arabic text
            // above opens with the Basmala. Arabic text/tashkeel unchanged; morning-002 ONLY (not evening/prayer
            // Al-Ikhlas); never shown in ar/other UIs.
            translation_en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful. Say, "He is Allah, [who is] One, Allah, the Eternal Refuge. He neither begets nor is born, Nor is there to Him any equivalent."',
            translation_fr: "Au nom d’Allah, le Tout Miséricordieux, le Très Miséricordieux .\n\nDis : « Allah est la seule et unique divinité.\nAllah est le Maître dont nul ne peut se passer .\nIl n’a pas engendré, ni été Lui-même engendré.\nEt nul dans Sa création n’est à même de L’égaler. »",
            translation_ur: "شروع کرتا ہوں اللہ تعالیٰ کے نام سے جو بڑا مہربان نہایت رحم واﻻ ہے۔\n\nآپ کہہ دیجئے کہ وه اللہ تعالیٰ ایک (ہی) ہے.\nاللہ تعالیٰ بے نیاز ہے.\nنہ اس سے کوئی پیدا ہوا نہ وه کسی سے پیدا ہوا.\nاور نہ کوئی اس کا ہمسر ہے.",
            translation_tr: "De ki: O Allah birdir.\nAllah Samed'dir.\nDoğurmamıştır, doğurulmamıştır.\nO'nun hiçbir dengi yoktur.",
            translation_bn: "রহমান, রহীম আল্লাহ্‌র নামে\n\nবলুন , ‘তিনি আল্লাহ্, এক-অদ্বিতীয় ,\n‘আল্লাহ্ হচ্ছেন ‘সামাদ' (তিনি কারো মুখাপেক্ষী নন, সকলেই তাঁর মুখাপেক্ষী);\nতিনি কাউকেও জন্ম দেননি এবং তাঁকেও জন্ম দেয়া হয়নি ,\n‘এবং তাঁর সমতুল্য কেউই নেই ।’",
            translation_ms: "Dengan nama Allah, Yang Maha Pemurah, lagi Maha Mengasihani.\n\nKatakanlah (wahai Muhammad): “(Tuhanku) ialah Allah Yang Maha Esa;\n“Allah Yang menjadi tumpuan sekalian makhluk untuk memohon sebarang hajat;\n“Ia tiada beranak, dan Ia pula tidak diperanakkan;\n“Dan tidak ada sesiapapun yang serupa denganNya”.",
            translation_de: "Im Namen Allahs, des Allerbarmers, des Barmherzigen.\n\nSag: „Er ist Allah, ein Einer,\nAllah, der Überlegene.\nEr hat nicht gezeugt und ist nicht gezeugt worden,\nund niemand ist Ihm jemals gleich.“",
            translation_es: "En el nombre de Dios , el Compasivo con toda la creación, el Misericordioso con los creyentes .\n\nDi: “Él es Al-lah , Uno.\nAl-lah es el Absoluto .\nNo engendró ni fue engendrado.\nY no hay nada ni nadie que sea semejante a Él”.",
            translation_id: "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.\n\nKatakanlah (Muhammad), \"Dialah Allah, Yang Maha Esa.\nAllah tempat meminta segala sesuatu.\n(Allah) tidak beranak dan tidak pula diperanakkan.\nDan tidak ada sesuatu yang setara dengan Dia.\"",
            repeat: 3,
            repeatLabel: { ar: 'ثلاث مرات', en: 'three times' },
            source: { ref: 'القرآن الكريم', sourceUrl: null },
            virtue: null,
            authenticity: 'quran',
            authenticityNote: null
        },
        {
            id: 'morning-003',
            category: 'morning',
            order: 3,
            type: 'quran',
            title: { ar: 'سورة الفلق', en: 'Surah Al-Falaq' },
            text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، مِنْ شَرِّ مَا خَلَقَ، وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ، وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ.',
            // AZKAR-MORNING-QURAN-TRANSLATIONS-SURAH-AL-FALAQ-ALL-LANGUAGES-1: Al-Falaq (Quran 113:1-5) shown ABOVE
            // the Arabic in each non-Arabic UI (lang!=='ar'), same class/style as Ayat al-Kursi + Al-Ikhlas + An-Nas.
            // The Basmala is translated FIRST because the Arabic text opens with it. en = Saheeh International;
            // the 8 others = QuranEnc (static, extracted once at dev time, NO runtime API). tr omits the Basmala
            // (its 1:1 is a transliteration, not a meaning translation). Arabic text/tashkeel unchanged; morning-003
            // ONLY; never shown in the ar UI.
            translation_en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.\n\nSay, "I seek refuge in the Lord of daybreak\nFrom the evil of that which He created\nAnd from the evil of darkness when it settles\nAnd from the evil of the blowers in knots\nAnd from the evil of an envier when he envies."',
            translation_fr: "Au nom d’Allah, le Tout Miséricordieux, le Très Miséricordieux .\n\nDis : « J’implore la protection du Seigneur de l’aube,\ncontre le mal qui se trouve dans ce qu’Il a créé,\ncontre le mal de la nuit qui étend son obscurité,\ncontre le charme maléfique de tous les sorciers ,\ncontre l’envieux qui donne libre cours à sa méchanceté. »",
            translation_ur: "شروع کرتا ہوں اللہ تعالیٰ کے نام سے جو بڑا مہربان نہایت رحم واﻻ ہے۔\n\nآپ کہہ دیجئے! کہ میں صبح کے رب کی پناه میں آتا ہوں.\nہر اس چیز کے شر سے جو اس نے پیدا کی ہے.\nاور اندھیری رات کی تاریکی کے شر سے جب اس کا اندھیرا پھیل جائے.\nاور گره (لگا کر ان) میں پھونکنے والیوں کے شر سے (بھی).\nاور حسد کرنے والے کی برائی سے بھی جب وه حسد کرے.",
            translation_tr: "De ki: Ben, sabahın Rabbine sığınırım.\nYarattığı varlıkların şerrinden.\nKaranlığı çöktüğü zaman gecenin şerrinden.\nDüğümlere üfleyenlerin şerrinden.\nHaset ettiği zaman hasetçinin şerrinden.",
            translation_bn: "রহমান, রহীম আল্লাহ্‌র নামে\n\nবলুন , ‘আমি আশ্রয় প্রার্থনা করছি ঊষার রবের\nতিনি যা সৃষ্টি করেছেন তার অনিষ্ট হতে ,\nআর অনিষ্ট হতে রাতের অন্ধকারের, যখন তা গভীর হয়\nআর অনিষ্ট হতে সমস্ত নারীদের, যারা গিরায় ফুঁক দেয় ,\nআর অনিষ্ট হতে হিংসুকের , যখন সে হিংসা করে ।’",
            translation_ms: "Dengan nama Allah, Yang Maha Pemurah, lagi Maha Mengasihani.\n\nKatakanlah (wahai Muhammad); “Aku berlindung kepada (Allah) Tuhan yang menciptakan sekalian makhluk,\n“Dari bencana makhluk-makhluk yang Ia ciptakan;\n“Dan dari bahaya gelap apabila ia masuk;\n“Dan dari kejahatan makhluk-makhluk yang menghembus-hembus pada simpulan-simpulan (dan ikatan-ikatan);\n“Dan dari kejahatan orang yang dengki apabila ia melakukan dengkinya”.",
            translation_de: "Im Namen Allahs, des Allerbarmers, des Barmherzigen.\n\nSag: „Ich nehme Zuflucht beim Herrn des Tagesanbruchs\nvor dem Übel dessen, was Er erschaffen hat,\nund vor dem Übel der Dunkelheit, wenn sie zunimmt,\nund vor dem Übel der Knotenanbläserinnen\nund vor dem Übel eines (jeden) Neidenden, wenn er neidet.“",
            translation_es: "En el nombre de Dios , el Compasivo con toda la creación, el Misericordioso con los creyentes .\n\nDi: “Me refugio en el Señor del amanecer,\nde todo el mal que existe en lo que Él creó,\ndel mal de la oscuridad de la noche cuando se extiende,\ndel mal de las [hechiceras] sopladoras de nudos ,\ny del mal del envidioso cuando envidia”.",
            translation_id: "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.\n\nKatakanlah, \"Aku berlindung kepada Tuhan yang menguasai subuh (fajar),\ndari kejahatan (makhluk yang) Dia ciptakan,\ndan dari kejahatan malam apabila telah gelap gulita,\ndan dari kejahatan (perempuan-perempuan) penyihir yang meniup pada buhul-buhul (talinya),\ndan dari kejahatan orang yang dengki apabila dia dengki.\"",
            repeat: 3,
            repeatLabel: { ar: 'ثلاث مرات', en: 'three times' },
            source: { ref: 'القرآن الكريم', sourceUrl: null },
            virtue: null,
            authenticity: 'quran',
            authenticityNote: null
        },
        {
            id: 'morning-004',
            category: 'morning',
            order: 4,
            type: 'quran',
            title: { ar: 'سورة الناس', en: 'Surah An-Nas' },
            text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ، مَلِكِ النَّاسِ، إِلَٰهِ النَّاسِ، مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ، الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ، مِنَ الْجِنَّةِ وَالنَّاسِ.',
            // AZKAR-MORNING-QURAN-TRANSLATIONS-SURAH-AN-NAS-ALL-LANGUAGES-1: An-Nas (Quran 114:1-6) shown ABOVE
            // the Arabic in each non-Arabic UI (lang!=='ar'), same class/style as Ayat al-Kursi + Al-Ikhlas.
            // The Basmala is translated FIRST because the Arabic text opens with it. en = Saheeh International;
            // the 8 others = QuranEnc (static, extracted once at dev time, NO runtime API). tr omits the
            // Basmala (its 1:1 is a transliteration, not a meaning translation). Arabic text/tashkeel unchanged;
            // morning-004 ONLY (Al-Falaq/morning-003 not in scope); never shown in the ar UI.
            translation_en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.\n\nSay, "I seek refuge in the Lord of mankind,\nThe Sovereign of mankind.\nThe God of mankind,\nFrom the evil of the retreating whisperer -\nWho whispers [evil] into the breasts of mankind -\nFrom among the jinn and mankind."',
            translation_fr: "Au nom d’Allah, le Tout Miséricordieux, le Très Miséricordieux .\n\nDis : « J’implore la protection du Seigneur des hommes,\nMaître des hommes,\nDieu des hommes,\ncontre le mal du démon qui se dérobe ou s’insinue chez l’homme ,\nsoufflant d’insidieuses pensées dans le cœur des hommes,\nqu’il soit du nombre des djinns ou du nombre des hommes. »",
            translation_ur: "شروع کرتا ہوں اللہ تعالیٰ کے نام سے جو بڑا مہربان نہایت رحم واﻻ ہے۔\n\nآپ کہہ دیجئے! کہ میں لوگوں کے پروردگار کی پناه میں آتا ہوں.\nلوگوں کے مالک کی (اور).\nلوگوں کے معبود کی (پناه میں).\nوسوسہ ڈالنے والے پیچھے ہٹ جانے والے کے شر سے.\nجو لوگوں کے سینوں میں وسوسہ ڈالتا ہے.\n(خواه) وه جن میں سے ہو یا انسان میں سے.",
            translation_tr: "De ki: İnsanların Rabbine sığınırım.\nİnsanların hükümdarına.\nİnsanların ilahına.\nSinsi/(Allah anıldığında geri kaçan) vesvesecinin şerrinden.\nKi o, insanların göğüslerine vesvese verir.\nGerek cinlerden, gerek insanlardan (olur).",
            translation_bn: "রহমান, রহীম আল্লাহ্‌র নামে\n\nবলুন, ‘আমি আশ্ৰয় প্রার্থনা করছি মানুষের রবের,\nমানুষের অধিপতির,\nমানুষের ইলাহের কাছে\nআত্মগোপনকারী কুমন্ত্রণাদাতার অনিষ্ট হতে,\nযে কুমন্ত্রণা দেয় মানুষের অন্তরে,\nজিনের মধ্য থেকে এবং মানুষের মধ্য থেকে ।’",
            translation_ms: "Dengan nama Allah, Yang Maha Pemurah, lagi Maha Mengasihani.\n\nKatakanlah (wahai Muhammad): “Aku berlindung kepada (Allah) Pemulihara sekalian manusia.\n“Yang Menguasai sekalian manusia,\n“Tuhan yang berhak disembah oleh sekalian manusia,\n“Dari kejahatan pembisik penghasut yang timbul tenggelam, -\n“Yang melemparkan bisikan dan hasutannya ke dalam hati manusia, -\n“(Iaitu pembisik dan penghasut) dari kalangan jin dan manusia”.",
            translation_de: "Im Namen Allahs, des Allerbarmers, des Barmherzigen.\n\nSag: „Ich nehme Zuflucht beim Herrn der Menschen,\ndem König der Menschen,\ndem Gott der Menschen,\nvor dem Übel des Einflüsterers, des Davonschleichers,\nder in die Brüste der Menschen einflüstert,\nvon den Jinn und den Menschen.“",
            translation_es: "En el nombre de Dios , el Compasivo con toda la creación, el Misericordioso con los creyentes .\n\nDi: “Me refugio en el Señor de los seres humanos,\nen el Rey Soberano de los seres humanos,\nen el [único] Dios de los seres humanos,\nde la maldad del [demonio] susurrador que huye [cuando el nombre de Dios es mencionado],\nque susurra en los corazones de los seres humanos,\ny existe entre los yinn y entre los seres humanos”.",
            translation_id: "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.\n\nKatakanlah, \"Aku berlindung kepada Tuhannya manusia,\nRaja manusia,\nsembahan manusia,\ndari kejahatan (bisikan) setan yang bersembunyi,\nyang membisikkan (kejahatan) ke dalam dada manusia,\ndari (golongan) jin dan manusia.\"",
            repeat: 3,
            repeatLabel: { ar: 'ثلاث مرات', en: 'three times' },
            source: { ref: 'القرآن الكريم', sourceUrl: null },
            virtue: null,
            authenticity: 'quran',
            authenticityNote: null
        },
        {
            id: 'morning-005',
            category: 'morning',
            order: 5,
            type: 'dhikr',
            title: { ar: 'أصبحنا وأصبح الملك لله', en: null },
            text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.',
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه مسلم', sourceUrl: null },
            virtue: null,
            authenticity: 'sahih',
            authenticityNote: null
        },
        {
            id: 'morning-006',
            category: 'morning',
            order: 6,
            type: 'dhikr',
            title: { ar: 'اللهم بك أصبحنا', en: null },
            text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.',
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه الترمذي', sourceUrl: null },
            virtue: null,
            authenticity: null,
            authenticityNote: null
        },
        {
            id: 'morning-007',
            category: 'morning',
            order: 7,
            type: 'dhikr',
            title: { ar: 'سيد الاستغفار', en: null },
            text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.',
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه البخاري', sourceUrl: null },
            virtue: {
                ar: 'من قالها موقنًا بها حين يصبح فمات من يومه دخل الجنة، ومن قالها موقنًا بها حين يمسي فمات من ليلته دخل الجنة.',
                en: null
            },
            authenticity: 'sahih',
            authenticityNote: null
        },
        {
            id: 'morning-008',
            category: 'morning',
            order: 8,
            type: 'dhikr',
            title: { ar: 'اللهم إني أصبحت أشهدك', en: null },
            text: 'اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ.',
            repeat: 4,
            repeatLabel: { ar: 'أربع مرات', en: 'four times' },
            source: { ref: 'رواه أبو داود', sourceUrl: null },
            virtue: {
                ar: 'من قالها حين يصبح أو يمسي أربع مرات أعتقه الله من النار.',
                en: null
            },
            authenticity: null,
            authenticityNote: null
        },
        {
            id: 'morning-009',
            category: 'morning',
            order: 9,
            type: 'dhikr',
            title: { ar: 'اللهم ما أصبح بي من نعمة', en: null },
            text: 'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ، أَوْ بِأَحَدٍ مِنْ خَلْقِكَ، فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.',
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه أبو داود', sourceUrl: null },
            virtue: {
                ar: 'من قالها حين يصبح فقد أدى شكر يومه، ومن قالها حين يمسي فقد أدى شكر ليلته.',
                en: null
            },
            authenticity: null,
            authenticityNote: null
        },
        {
            id: 'morning-010',
            category: 'morning',
            order: 10,
            type: 'dhikr',
            title: { ar: 'اللهم عافني في بدني', en: null },
            text: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ.',
            repeat: 3,
            repeatLabel: { ar: 'ثلاث مرات', en: 'three times' },
            source: { ref: 'رواه أحمد', sourceUrl: null },
            virtue: null,
            authenticity: null,
            authenticityNote: null
        },
        {
            id: 'morning-011',
            category: 'morning',
            order: 11,
            type: 'dhikr',
            title: { ar: 'اللهم إني أعوذ بك من الهم والحزن', en: null },
            text: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ.',
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه أبو داود', sourceUrl: null },
            virtue: null,
            authenticity: null,
            authenticityNote: null
        },
        {
            id: 'morning-012',
            category: 'morning',
            order: 12,
            type: 'dhikr',
            title: { ar: 'حسبي الله لا إله إلا هو', en: null },
            text: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.',
            repeat: 7,
            repeatLabel: { ar: 'سبع مرات', en: 'seven times' },
            source: { ref: 'رواه ابن السني', sourceUrl: null },
            virtue: {
                ar: 'من قالها حين يصبح وحين يمسي سبع مرات كفاه الله ما أهمه من أمر الدنيا والآخرة.',
                en: null
            },
            authenticity: 'weak_hadith',
            authenticityNote: {
                ar: 'ورد في فضل هذا الذكر حديث ضعيف، ويجوز قوله كذكر ودعاء دون الجزم بثواب مخصوص.',
                en: null
            }
        },
        {
            id: 'morning-013',
            category: 'morning',
            order: 13,
            type: 'dhikr',
            title: { ar: 'اللهم إني أسألك العفو والعافية', en: null },
            text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي.',
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه أبو داود', sourceUrl: null },
            virtue: null,
            authenticity: null,
            authenticityNote: null
        },
        {
            id: 'morning-014',
            category: 'morning',
            order: 14,
            type: 'dhikr',
            title: { ar: 'اللهم عالم الغيب والشهادة', en: null },
            text: 'اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءًا، أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ.',
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه الترمذي', sourceUrl: null },
            virtue: null,
            authenticity: null,
            authenticityNote: null
        },
        {
            id: 'morning-015',
            category: 'morning',
            order: 15,
            type: 'dhikr',
            title: { ar: 'بسم الله الذي لا يضر مع اسمه شيء', en: null },
            text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ، وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ.',
            repeat: 3,
            repeatLabel: { ar: 'ثلاث مرات', en: 'three times' },
            source: { ref: 'رواه ابن ماجه', sourceUrl: null },
            virtue: {
                ar: 'من قالها ثلاثًا إذا أصبح وثلاثًا إذا أمسى لم يضره شيء.',
                en: null
            },
            authenticity: null,
            authenticityNote: null
        },
        {
            id: 'morning-016',
            category: 'morning',
            order: 16,
            type: 'dhikr',
            title: { ar: 'رضيت بالله ربًا', en: null },
            text: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا.',
            repeat: 3,
            repeatLabel: { ar: 'ثلاث مرات', en: 'three times' },
            source: { ref: 'رواه أحمد', sourceUrl: null },
            virtue: {
                ar: 'من قالها ثلاثًا حين يصبح وثلاثًا حين يمسي كان حقًا على الله أن يرضيه يوم القيامة.',
                en: null
            },
            authenticity: null,
            authenticityNote: null
        },
        {
            id: 'morning-017',
            category: 'morning',
            order: 17,
            type: 'dhikr',
            title: { ar: 'يا حي يا قيوم', en: null },
            text: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.',
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه الترمذي', sourceUrl: null },
            virtue: null,
            authenticity: null,
            authenticityNote: null
        },
        {
            id: 'morning-018',
            category: 'morning',
            order: 18,
            type: 'dhikr',
            title: { ar: 'أصبحنا وأصبح الملك لله رب العالمين', en: null },
            text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذَا الْيَوْمِ، فَتْحَهُ وَنَصْرَهُ وَنُورَهُ وَبَرَكَتَهُ وَهُدَاهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهِ وَشَرِّ مَا بَعْدَهُ.',
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه أبو داود', sourceUrl: null },
            virtue: null,
            authenticity: null,
            authenticityNote: null
        },
        {
            id: 'morning-019',
            category: 'morning',
            order: 19,
            type: 'dhikr',
            title: { ar: 'أصبحنا على فطرة الإسلام', en: null },
            text: 'أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ، حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ.',
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه أحمد', sourceUrl: null },
            virtue: null,
            authenticity: null,
            authenticityNote: null
        },
        {
            id: 'morning-020',
            category: 'morning',
            order: 20,
            type: 'dhikr',
            title: { ar: 'لا إله إلا الله وحده لا شريك له', en: null },
            text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',
            repeat: 100,
            repeatLabel: { ar: 'عشر مرات أو مائة مرة', en: 'ten or one hundred times' },
            source: { ref: 'رواه أبو داود، ورواه الترمذي', sourceUrl: null },
            virtue: {
                ar: 'يقولها عشر مرات أو مرة واحدة عند الكسل. ومن قالها مائة مرة في يوم كانت له عدل عشر رقاب، وكتبت له مائة حسنة، ومحيت عنه مائة سيئة، وكانت له حرزًا من الشيطان يومه ذلك حتى يمسي، ولم يأت أحد بأفضل مما جاء به إلا أحد عمل أكثر من ذلك.',
                en: null
            },
            authenticity: null,
            authenticityNote: null
        },
        {
            id: 'morning-021',
            category: 'morning',
            order: 21,
            type: 'dhikr',
            title: { ar: 'سبحان الله وبحمده', en: null },
            text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.',
            repeat: 100,
            repeatLabel: { ar: 'مائة مرة', en: 'one hundred times' },
            source: { ref: 'رواه مسلم', sourceUrl: null },
            virtue: {
                ar: 'من قالها مائة مرة حين يصبح وحين يمسي لم يأت أحد يوم القيامة بأفضل مما جاء به إلا أحد قال مثلما قال أو زاد عليه.',
                en: null
            },
            authenticity: 'sahih',
            authenticityNote: null
        },
        {
            id: 'morning-022',
            category: 'morning',
            order: 22,
            type: 'dhikr',
            title: { ar: 'سبحان الله وبحمده عدد خلقه', en: null },
            text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.',
            repeat: 3,
            repeatLabel: { ar: 'ثلاث مرات', en: 'three times' },
            source: { ref: 'رواه مسلم', sourceUrl: null },
            virtue: null,
            authenticity: 'sahih',
            authenticityNote: null
        },
        {
            id: 'morning-023',
            category: 'morning',
            order: 23,
            type: 'dhikr',
            title: { ar: 'اللهم إني أسألك علمًا نافعًا', en: null },
            text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا.',
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه ابن ماجه', sourceUrl: null },
            virtue: null,
            authenticity: null,
            authenticityNote: null
        },
        {
            id: 'morning-024',
            category: 'morning',
            order: 24,
            type: 'dhikr',
            title: { ar: 'أستغفر الله وأتوب إليه', en: null },
            text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ.',
            repeat: 100,
            repeatLabel: { ar: 'مائة مرة', en: 'one hundred times' },
            source: { ref: 'رواه البخاري', sourceUrl: null },
            virtue: null,
            authenticity: 'sahih',
            authenticityNote: null
        },
        {
            id: 'morning-025',
            category: 'morning',
            order: 25,
            type: 'dhikr',
            title: { ar: 'الصلاة على النبي ﷺ', en: null },
            text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ.',
            repeat: 10,
            repeatLabel: { ar: 'عشر مرات', en: 'ten times' },
            source: { ref: 'الحديث الصحيح', sourceUrl: null },
            virtue: {
                ar: 'قال الله سبحانه وتعالى: إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا. سورة الأحزاب: 56. وقال عليه الصلاة والسلام في الحديث الصحيح: من صلى عليَّ صلاة واحدة صلى الله عليه بها عشرًا.',
                en: null
            },
            authenticity: 'sahih',
            authenticityNote: null
        }
    ];

    // ────────────────────────────────────────────────────────────────
    // AZKAR-EVENING-PHASE-1 (2026-05-26): 23 evening dhikr items.
    // Schema is normalized to match window.AzkarMorning exactly:
    //   - source   : { ref: string }
    //   - title    : { ar, en } | null   (shown only for type:'quran')
    //   - virtue   : { ar, en } | null
    //   - repeatLabel : { ar, en }
    //   - authenticityNote : { ar, en } | null
    // Source text content provided verbatim by user — NOT auto-translated.
    // localStorage key is 'azkar.progress.evening' (isolated from morning).
    // ────────────────────────────────────────────────────────────────
    window.AzkarEvening = [
        {
            id: 'evening-001',
            category: 'evening',
            order: 1,
            type: 'quran',
            title: { ar: 'آية الكرسي', en: 'Ayat al-Kursi' },
            text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ، لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ، لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ، مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ، يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ، وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ، وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ، وَلَا يَئُودُهُ حِفْظُهُمَا، وَهُوَ الْعَلِيُّ الْعَظِيمُ.',
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه الحاكم' },
            virtue: { ar: 'من قالها حين يصبح أُجير من الجن حتى يمسي، ومن قالها حين يمسي أُجير منهم حتى يصبح.', en: null },
            authenticity: 'quran',
            authenticityNote: null
        },
        {
            id: 'evening-002',
            category: 'evening',
            order: 2,
            type: 'quran',
            title: { ar: 'سورة الإخلاص', en: 'Al-Ikhlas' },
            text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ هُوَ اللَّهُ أَحَدٌ، اللَّهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ.',
            repeat: 3,
            repeatLabel: { ar: 'ثلاث مرات', en: 'three times' },
            source: { ref: 'القرآن الكريم' },
            virtue: null,
            authenticity: 'quran',
            authenticityNote: null
        },
        {
            id: 'evening-003',
            category: 'evening',
            order: 3,
            type: 'quran',
            title: { ar: 'سورة الفلق', en: 'Al-Falaq' },
            text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، مِنْ شَرِّ مَا خَلَقَ، وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ، وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ.',
            repeat: 3,
            repeatLabel: { ar: 'ثلاث مرات', en: 'three times' },
            source: { ref: 'القرآن الكريم' },
            virtue: null,
            authenticity: 'quran',
            authenticityNote: null
        },
        {
            id: 'evening-004',
            category: 'evening',
            order: 4,
            type: 'quran',
            title: { ar: 'سورة الناس', en: 'An-Nas' },
            text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ، مَلِكِ النَّاسِ، إِلَٰهِ النَّاسِ، مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ، الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ، مِنَ الْجِنَّةِ وَالنَّاسِ.',
            repeat: 3,
            repeatLabel: { ar: 'ثلاث مرات', en: 'three times' },
            source: { ref: 'القرآن الكريم' },
            virtue: null,
            authenticity: 'quran',
            authenticityNote: null
        },
        {
            id: 'evening-005',
            category: 'evening',
            order: 5,
            type: 'dhikr',
            title: null,
            text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ، وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ، وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.',
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه مسلم' },
            virtue: null,
            authenticity: 'sahih',
            authenticityNote: null
        },
        {
            id: 'evening-006',
            category: 'evening',
            order: 6,
            type: 'dhikr',
            title: null,
            text: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ.',
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه الترمذي' },
            virtue: null,
            authenticity: 'sahih',
            authenticityNote: null
        },
        {
            id: 'evening-007',
            category: 'evening',
            order: 7,
            type: 'dhikr',
            title: null,
            text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.',
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه البخاري' },
            virtue: { ar: 'من قالها موقنًا بها حين يمسي فمات من ليلته دخل الجنة.', en: null },
            authenticity: 'sahih',
            authenticityNote: null
        },
        {
            id: 'evening-008',
            category: 'evening',
            order: 8,
            type: 'dhikr',
            title: null,
            text: 'اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَٰهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ.',
            repeat: 4,
            repeatLabel: { ar: 'أربع مرات', en: 'four times' },
            source: { ref: 'رواه أبو داود' },
            virtue: { ar: 'من قالها حين يصبح أو يمسي أربع مرات أعتقه الله من النار.', en: null },
            authenticity: 'sahih',
            authenticityNote: null
        },
        {
            id: 'evening-009',
            category: 'evening',
            order: 9,
            type: 'dhikr',
            title: null,
            text: 'اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ، أَوْ بِأَحَدٍ مِنْ خَلْقِكَ، فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.',
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه أبو داود' },
            virtue: { ar: 'من قالها حين يمسي فقد أدى شكر ليلته.', en: null },
            authenticity: 'hasan',
            authenticityNote: null
        },
        {
            id: 'evening-010',
            category: 'evening',
            order: 10,
            type: 'dhikr',
            title: null,
            text: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَٰهَ إِلَّا أَنْتَ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَٰهَ إِلَّا أَنْتَ.',
            repeat: 3,
            repeatLabel: { ar: 'ثلاث مرات', en: 'three times' },
            source: { ref: 'رواه أحمد' },
            virtue: null,
            authenticity: 'sahih',
            authenticityNote: null
        },
        {
            id: 'evening-011',
            category: 'evening',
            order: 11,
            type: 'dhikr',
            title: null,
            text: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ.',
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه أبو داود' },
            virtue: null,
            authenticity: 'sahih',
            authenticityNote: null
        },
        {
            id: 'evening-012',
            category: 'evening',
            order: 12,
            type: 'dhikr',
            title: null,
            text: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.',
            repeat: 7,
            repeatLabel: { ar: 'سبع مرات', en: 'seven times' },
            source: { ref: 'رواه ابن السني' },
            virtue: { ar: 'من قالها حين يصبح وحين يمسي سبع مرات كفاه الله ما أهمه من أمر الدنيا والآخرة.', en: null },
            authenticity: null,
            authenticityNote: { ar: 'ورد في بعض كتب الأذكار، وقد تكلم أهل العلم في إسناده، ومعناه صحيح من حيث الذكر والتوكل على الله.', en: null }
        },
        {
            id: 'evening-013',
            category: 'evening',
            order: 13,
            type: 'dhikr',
            title: null,
            text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي.',
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه أبو داود' },
            virtue: null,
            authenticity: 'sahih',
            authenticityNote: null
        },
        {
            id: 'evening-014',
            category: 'evening',
            order: 14,
            type: 'dhikr',
            title: null,
            text: 'اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءًا، أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ.',
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه الترمذي' },
            virtue: null,
            authenticity: 'sahih',
            authenticityNote: null
        },
        {
            id: 'evening-015',
            category: 'evening',
            order: 15,
            type: 'dhikr',
            title: null,
            text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ، وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ.',
            repeat: 3,
            repeatLabel: { ar: 'ثلاث مرات', en: 'three times' },
            source: { ref: 'رواه ابن ماجه' },
            virtue: { ar: 'من قالها ثلاثًا إذا أصبح وثلاثًا إذا أمسى لم يضره شيء.', en: null },
            authenticity: 'sahih',
            authenticityNote: null
        },
        {
            id: 'evening-016',
            category: 'evening',
            order: 16,
            type: 'dhikr',
            title: null,
            text: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا.',
            repeat: 3,
            repeatLabel: { ar: 'ثلاث مرات', en: 'three times' },
            source: { ref: 'رواه أحمد' },
            virtue: { ar: 'من قالها ثلاثًا حين يصبح وثلاثًا حين يمسي كان حقًا على الله أن يرضيه يوم القيامة.', en: null },
            authenticity: 'sahih',
            authenticityNote: null
        },
        {
            id: 'evening-017',
            category: 'evening',
            order: 17,
            type: 'dhikr',
            title: null,
            text: 'يَا حَيُّ يَا قَيُّومُ، بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.',
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه الترمذي' },
            virtue: null,
            authenticity: 'hasan',
            authenticityNote: null
        },
        {
            id: 'evening-018',
            category: 'evening',
            order: 18,
            type: 'dhikr',
            title: null,
            text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذِهِ اللَّيْلَةِ، فَتْحَهَا، وَنَصْرَهَا، وَنُورَهَا، وَبَرَكَتَهَا، وَهُدَاهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهَا وَشَرِّ مَا بَعْدَهَا.',
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه أبو داود' },
            virtue: null,
            authenticity: 'sahih',
            authenticityNote: null
        },
        {
            id: 'evening-019',
            category: 'evening',
            order: 19,
            type: 'dhikr',
            title: null,
            text: 'أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ، حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ.',
            repeat: 1,
            repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه أحمد' },
            virtue: null,
            authenticity: 'sahih',
            authenticityNote: null
        },
        {
            id: 'evening-020',
            category: 'evening',
            order: 20,
            type: 'dhikr',
            title: null,
            text: 'لَا إِلَٰهَ إِلَّا اللَّهُ، وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',
            repeat: 100,
            repeatLabel: { ar: 'عشر مرات أو مئة مرة', en: '10 or 100 times' },
            source: { ref: 'رواه الترمذي' },
            virtue: { ar: 'من قالها مئة مرة في يوم كانت له عدل عشر رقاب، وكتبت له مئة حسنة، ومحيت عنه مئة سيئة، وكانت له حرزًا من الشيطان يومه ذلك حتى يمسي.', en: null },
            authenticity: 'sahih',
            authenticityNote: null
        },
        {
            id: 'evening-021',
            category: 'evening',
            order: 21,
            type: 'dhikr',
            title: null,
            text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.',
            repeat: 100,
            repeatLabel: { ar: 'مئة مرة', en: 'one hundred times' },
            source: { ref: 'رواه مسلم' },
            virtue: { ar: 'من قالها مئة مرة حين يصبح وحين يمسي لم يأت أحد يوم القيامة بأفضل مما جاء به إلا أحد قال مثل ما قال أو زاد عليه.', en: null },
            authenticity: 'sahih',
            authenticityNote: null
        },
        {
            id: 'evening-022',
            category: 'evening',
            order: 22,
            type: 'dhikr',
            title: null,
            text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.',
            repeat: 3,
            repeatLabel: { ar: 'ثلاث مرات', en: 'three times' },
            source: { ref: 'ورد في كتب الأذكار' },
            virtue: { ar: 'من قالها حين يمسي ثلاث مرات لا تضره حمة هذه الليلة.', en: null },
            authenticity: null,
            authenticityNote: { ar: 'راجع المصدر قبل الاعتماد النهائي إذا أردت توحيد التخريج بدقة مع بقية الأذكار.', en: null }
        },
        {
            id: 'evening-023',
            category: 'evening',
            order: 23,
            type: 'dhikr',
            title: null,
            text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ.',
            repeat: 10,
            repeatLabel: { ar: 'عشر مرات', en: 'ten times' },
            source: { ref: 'سورة الأحزاب 56، والحديث الصحيح' },
            virtue: { ar: 'قال الله تعالى: إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا. وقال عليه الصلاة والسلام في الحديث الصحيح: من صلى علي صلاة واحدة صلى الله عليه بها عشرًا.', en: null },
            authenticity: 'sahih',
            authenticityNote: null
        }
    ];

    // ────────────────────────────────────────────────────────────────
    // AZKAR-PRAYER-PHASE-1 (2026-05-26): 17 prayer-related dhikr items.
    // Same schema as morning + evening. Each card represents a position
    // in/around the prayer (wudu, mosque entry, takbir, ruku, sujud,
    // tashahhud, qunut, post-salam, witr, etc.).
    // localStorage key is 'azkar.progress.prayer' (isolated).
    //
    // CONTENT SOURCE NOTE: Text content compiled from widely-attested
    // adhkar collections (Hisn al-Muslim by al-Qahtani + al-Adhkar by
    // al-Nawawi + Sahih al-Bukhari, Muslim, Abu Dawud, al-Tirmidhi,
    // al-Nasa'i, Ibn Majah, Ahmad). Each item's `authenticityNote`
    // flags it as "نصوص مأخوذة من كتب الأذكار المشهورة — يُرجى
    // التحقق من النص النهائي قبل اعتماد الإصدار العام." Reviewer
    // should verify each text byte-for-byte against the cited primary
    // source before publishing.
    // ────────────────────────────────────────────────────────────────
    const _PRAYER_AUTH_NOTE = {
        ar: 'نصوص مأخوذة من كتب الأذكار المشهورة (حصن المسلم وكتب السنة الأم). يُرجى مراجعة التشكيل والمصدر قبل الاعتماد النهائي.',
        en: null
    };
    window.AzkarPrayer = [
        {
            id: 'prayer-001', category: 'prayer', order: 1, type: 'dhikr',
            title: { ar: 'عند الوضوء', en: 'During Wudu' },
            text: 'بِسْمِ اللَّهِ.\n(عند البدء بالوضوء)\n\nوبعد الانتهاء يقول:\nأَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ.\nاللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ، وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ.',
            repeat: 1, repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه مسلم والترمذي' },
            virtue: { ar: 'من قال هذا بعد الوضوء فُتحت له أبواب الجنة الثمانية يدخل من أيها شاء.', en: null },
            authenticity: 'sahih', authenticityNote: _PRAYER_AUTH_NOTE
        },
        {
            id: 'prayer-002', category: 'prayer', order: 2, type: 'dhikr',
            title: { ar: 'دعاء الذهاب إلى المسجد', en: 'Going to the Mosque' },
            text: 'اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا، وَفِي لِسَانِي نُورًا، وَفِي سَمْعِي نُورًا، وَفِي بَصَرِي نُورًا، وَمِنْ فَوْقِي نُورًا، وَمِنْ تَحْتِي نُورًا، وَعَنْ يَمِينِي نُورًا، وَعَنْ شِمَالِي نُورًا، وَمِنْ أَمَامِي نُورًا، وَمِنْ خَلْفِي نُورًا، وَاجْعَلْ فِي نَفْسِي نُورًا، وَأَعْظِمْ لِي نُورًا.',
            repeat: 1, repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'متفق عليه' },
            virtue: null, authenticity: 'sahih', authenticityNote: _PRAYER_AUTH_NOTE
        },
        {
            id: 'prayer-003', category: 'prayer', order: 3, type: 'dhikr',
            title: { ar: 'دعاء الدخول إلى المسجد', en: 'Entering the Mosque' },
            text: 'يُقدِّم رِجلَه اليمنى، ثم يقول:\nأَعُوذُ بِاللَّهِ الْعَظِيمِ، وَبِوَجْهِهِ الْكَرِيمِ، وَسُلْطَانِهِ الْقَدِيمِ، مِنَ الشَّيْطَانِ الرَّجِيمِ.\nبِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ.\nاللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ.',
            repeat: 1, repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه أبو داود ومسلم' },
            virtue: null, authenticity: 'sahih', authenticityNote: _PRAYER_AUTH_NOTE
        },
        {
            id: 'prayer-004', category: 'prayer', order: 4, type: 'dhikr',
            title: { ar: 'أذكار الأذان', en: 'During the Adhan' },
            text: 'يردِّد المسلم خلف المؤذِّن مثل ما يقول، إلا في «حيَّ على الصلاة» و«حيَّ على الفلاح» فيقول:\nلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ.\n\nثم يصلِّي على النبي ﷺ، ثم يقول:\nاللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ.',
            repeat: 1, repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه البخاري ومسلم' },
            virtue: { ar: 'من قال ذلك بعد الأذان حلَّت له الشفاعة يوم القيامة.', en: null },
            authenticity: 'sahih', authenticityNote: _PRAYER_AUTH_NOTE
        },
        {
            id: 'prayer-005', category: 'prayer', order: 5, type: 'dhikr',
            title: { ar: 'أدعية استفتاح الصلاة', en: 'Opening Supplications' },
            text: 'وردت صيغ عدة، يختار المصلِّي واحدة منها، ومنها:\n\nسُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَٰهَ غَيْرُكَ.\n\nأو:\nاللَّهُمَّ بَاعِدْ بَيْنِي وَبَيْنَ خَطَايَايَ كَمَا بَاعَدْتَ بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ، اللَّهُمَّ نَقِّنِي مِنَ الْخَطَايَا كَمَا يُنَقَّى الثَّوْبُ الْأَبْيَضُ مِنَ الدَّنَسِ، اللَّهُمَّ اغْسِلْ خَطَايَايَ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ.',
            repeat: 1, repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'متفق عليه' },
            virtue: null, authenticity: 'sahih', authenticityNote: _PRAYER_AUTH_NOTE
        },
        {
            id: 'prayer-006', category: 'prayer', order: 6, type: 'dhikr',
            title: { ar: 'أدعية الركوع', en: 'During Ruku' },
            text: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ.\n(يكرِّرها ثلاث مرات أو أكثر)\n\nويُستحبُّ أن يُضيف:\nسُبْحَانَكَ اللَّهُمَّ رَبَّنَا وَبِحَمْدِكَ، اللَّهُمَّ اغْفِرْ لِي.\nسُبُّوحٌ قُدُّوسٌ، رَبُّ الْمَلَائِكَةِ وَالرُّوحِ.',
            repeat: 1, repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه مسلم وأبو داود' },
            virtue: null, authenticity: 'sahih', authenticityNote: _PRAYER_AUTH_NOTE
        },
        {
            id: 'prayer-007', category: 'prayer', order: 7, type: 'dhikr',
            title: { ar: 'أدعية الرفع من الركوع', en: 'Rising from Ruku' },
            text: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ.\n(للإمام والمنفرد)\n\nرَبَّنَا وَلَكَ الْحَمْدُ، حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ، مِلْءَ السَّمَاوَاتِ وَمِلْءَ الْأَرْضِ وَمَا بَيْنَهُمَا، وَمِلْءَ مَا شِئْتَ مِنْ شَيْءٍ بَعْدُ.',
            repeat: 1, repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'متفق عليه' },
            virtue: null, authenticity: 'sahih', authenticityNote: _PRAYER_AUTH_NOTE
        },
        {
            id: 'prayer-008', category: 'prayer', order: 8, type: 'dhikr',
            title: { ar: 'أدعية السجود', en: 'During Sujud' },
            text: 'سُبْحَانَ رَبِّيَ الْأَعْلَى.\n(يكرِّرها ثلاث مرات أو أكثر)\n\nسُبْحَانَكَ اللَّهُمَّ رَبَّنَا وَبِحَمْدِكَ، اللَّهُمَّ اغْفِرْ لِي.\n\nاللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ، دِقَّهُ وَجِلَّهُ، وَأَوَّلَهُ وَآخِرَهُ، وَعَلَانِيَتَهُ وَسِرَّهُ.',
            repeat: 1, repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه مسلم' },
            virtue: { ar: 'السجود من أعظم مواضع إجابة الدعاء، قال ﷺ: «أقرب ما يكون العبد من ربه وهو ساجد، فأكثروا الدعاء».', en: null },
            authenticity: 'sahih', authenticityNote: _PRAYER_AUTH_NOTE
        },
        {
            id: 'prayer-009', category: 'prayer', order: 9, type: 'dhikr',
            title: { ar: 'أدعية الجلسة بين السجدتين', en: 'Between the Two Sujuds' },
            text: 'رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي.\n\nأو:\nاللَّهُمَّ اغْفِرْ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَاجْبُرْنِي، وَعَافِنِي، وَارْزُقْنِي، وَارْفَعْنِي.',
            repeat: 1, repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه أبو داود والترمذي' },
            virtue: null, authenticity: 'sahih', authenticityNote: _PRAYER_AUTH_NOTE
        },
        {
            id: 'prayer-010', category: 'prayer', order: 10, type: 'dhikr',
            title: { ar: 'أذكار التشهد', en: 'Tashahhud' },
            text: 'التَّحِيَّاتُ لِلَّهِ، وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ.\n\nاللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ.',
            repeat: 1, repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'متفق عليه' },
            virtue: null, authenticity: 'sahih', authenticityNote: _PRAYER_AUTH_NOTE
        },
        {
            id: 'prayer-011', category: 'prayer', order: 11, type: 'dhikr',
            title: { ar: 'الدعاء بعد التشهد الأخير وقبل السلام', en: 'Before the Final Salam' },
            text: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، وَمِنْ عَذَابِ جَهَنَّمَ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ، وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ.\n\nاللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا، وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ، فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ، وَارْحَمْنِي، إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ.',
            repeat: 1, repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'متفق عليه' },
            virtue: null, authenticity: 'sahih', authenticityNote: _PRAYER_AUTH_NOTE
        },
        {
            id: 'prayer-012', category: 'prayer', order: 12, type: 'dhikr',
            title: { ar: 'دعاء القنوت', en: 'Qunut Supplication' },
            text: 'اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لِي فِيمَا أَعْطَيْتَ، وَقِنِي شَرَّ مَا قَضَيْتَ، فَإِنَّكَ تَقْضِي وَلَا يُقْضَى عَلَيْكَ، وَإِنَّهُ لَا يَذِلُّ مَنْ وَالَيْتَ، وَلَا يَعِزُّ مَنْ عَادَيْتَ، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ.\n\nاللَّهُمَّ إِنَّا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ، وَنُؤْمِنُ بِكَ وَنَتَوَكَّلُ عَلَيْكَ، وَنُثْنِي عَلَيْكَ الْخَيْرَ كُلَّهُ، نَشْكُرُكَ وَلَا نَكْفُرُكَ.',
            repeat: 1, repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه أبو داود والترمذي والنسائي' },
            virtue: null, authenticity: 'hasan', authenticityNote: _PRAYER_AUTH_NOTE
        },
        {
            id: 'prayer-013', category: 'prayer', order: 13, type: 'dhikr',
            title: { ar: 'دعاء سجود التلاوة', en: 'Prostration of Quran Recitation' },
            text: 'سَجَدَ وَجْهِيَ لِلَّذِي خَلَقَهُ، وَصَوَّرَهُ، وَشَقَّ سَمْعَهُ وَبَصَرَهُ، بِحَوْلِهِ وَقُوَّتِهِ.\nتَبَارَكَ اللَّهُ أَحْسَنُ الْخَالِقِينَ.\n\nاللَّهُمَّ اكْتُبْ لِي بِهَا عِنْدَكَ أَجْرًا، وَضَعْ عَنِّي بِهَا وِزْرًا، وَاجْعَلْهَا لِي عِنْدَكَ ذُخْرًا، وَتَقَبَّلْهَا مِنِّي كَمَا تَقَبَّلْتَهَا مِنْ عَبْدِكَ دَاوُدَ.',
            repeat: 1, repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه الترمذي والحاكم' },
            virtue: null, authenticity: 'hasan', authenticityNote: _PRAYER_AUTH_NOTE
        },
        {
            id: 'prayer-014', category: 'prayer', order: 14, type: 'dhikr',
            title: { ar: 'الأذكار بعد السلام من الصلاة', en: 'After the Salam' },
            text: 'أَسْتَغْفِرُ اللَّهَ (ثلاثًا)\n\nاللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ.\n\nلَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ.\n\nسُبْحَانَ اللَّهِ (33) ، الْحَمْدُ لِلَّهِ (33) ، اللَّهُ أَكْبَرُ (33).\n\nوَتَمَامُ الْمِائَةِ: لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.\n\nثم يقرأ آية الكرسي والمعوذات (الإخلاص والفلق والناس).',
            repeat: 1, repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه مسلم وأبو داود والترمذي' },
            virtue: { ar: 'من قرأ آية الكرسي دبر كل صلاة مكتوبة لم يمنعه من دخول الجنة إلا أن يموت.', en: null },
            authenticity: 'sahih', authenticityNote: _PRAYER_AUTH_NOTE
        },
        {
            id: 'prayer-015', category: 'prayer', order: 15, type: 'dhikr',
            title: { ar: 'دعاء استفتاح الصلاة في قيام الليل', en: 'Opening Du\'a for Night Prayer' },
            text: 'اللَّهُمَّ رَبَّ جِبْرِيلَ وَمِيكَائِيلَ وَإِسْرَافِيلَ، فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، أَنْتَ تَحْكُمُ بَيْنَ عِبَادِكَ فِيمَا كَانُوا فِيهِ يَخْتَلِفُونَ، اهْدِنِي لِمَا اخْتُلِفَ فِيهِ مِنَ الْحَقِّ بِإِذْنِكَ، إِنَّكَ تَهْدِي مَنْ تَشَاءُ إِلَى صِرَاطٍ مُسْتَقِيمٍ.',
            repeat: 1, repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه مسلم' },
            virtue: null, authenticity: 'sahih', authenticityNote: _PRAYER_AUTH_NOTE
        },
        {
            id: 'prayer-016', category: 'prayer', order: 16, type: 'dhikr',
            title: { ar: 'دعاء الخروج من المسجد', en: 'Leaving the Mosque' },
            text: 'يُقدِّم رِجلَه اليسرى، ثم يقول:\nبِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ.\nاللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ.\nاللَّهُمَّ اعْصِمْنِي مِنَ الشَّيْطَانِ الرَّجِيمِ.',
            repeat: 1, repeatLabel: { ar: 'مرة واحدة', en: 'once' },
            source: { ref: 'رواه مسلم وابن ماجه' },
            virtue: null, authenticity: 'sahih', authenticityNote: _PRAYER_AUTH_NOTE
        },
        {
            id: 'prayer-017', category: 'prayer', order: 17, type: 'dhikr',
            title: { ar: 'ما يقال بعد الانتهاء من الوتر', en: 'After the Witr Prayer' },
            text: 'سُبْحَانَ الْمَلِكِ الْقُدُّوسِ.',
            repeat: 3, repeatLabel: { ar: 'ثلاث مرات', en: 'three times' },
            source: { ref: 'رواه أبو داود والنسائي' },
            virtue: { ar: 'يرفع صوته في الثالثة ويمدها.', en: null },
            authenticity: 'sahih', authenticityNote: _PRAYER_AUTH_NOTE
        }
    ];

    // ════════════════════════════════════════════════════════════════════════
    // AZKAR-MORNING-PAGE-UI-LOCALIZATION-ALL-LANGUAGES-1 (2026-07-09)
    // Single source of truth for the morning-azkar PAGE UI CHROME across the 10
    // supported languages. Loaded on BOTH sides: server.js reads it from the
    // sandbox (window.AZKAR_MORNING_UI_L10N); js/app.js reads window.AZKAR_MORNING_UI_L10N.
    // SCOPE = UI chrome only. The Arabic DHIKR TEXT + tashkeel, the virtue /
    // authenticityNote bodies, and the source *values* (rawi names, e.g.
    // 'رواه البخاري') are NOT here — they stay Arabic by design. Only the
    // source *label* ('المصدر') is localized. `progressTpl` uses {done}/{total};
    // `rep` maps the exact repeat counts in use (1,3,4,7,10,100 + 2 spare);
    // `repN` is the generic '{n}' fallback.
    // ════════════════════════════════════════════════════════════════════════
    window.AZKAR_MORNING_UI_L10N = {
        ar: {
            heroTitle: 'أذكار الصباح',
            heroSubtitle: 'اقرأ أذكار الصباح مكتوبة مع عدد التكرار والمصدر، ويُحفظ تقدمك تلقائيًا خلال اليوم.',
            bcHub: 'الأذكار', bcCurrent: 'أذكار الصباح',
            infoCount: '25 ذكرًا', infoCounter: 'عداد للأذكار المتكررة', infoAutosave: 'يُحفظ تقدمك تلقائيًا',
            sectionTitle: 'أذكار الصباح مع التكرار والمصدر الصحيح',
            sectionText: 'تضم هذه الصفحة أذكار الصباح مكتوبة كاملة، مع توضيح عدد التكرار والمصدر لكل ذكر، إضافة إلى عداد تفاعلي يساعدك على إكمال القراءة دون نسيان.',
            completedTitle: 'تم إكمال أذكار الصباح', completedSub: 'نسأل الله أن يجعل يومك عامرًا بالذكر والطمأنينة.',
            resetBtn: 'إعادة ضبط العدادات', resetBtnShort: 'إعادة الضبط',
            ariaBreadcrumb: 'مسار التصفح', ariaInfo: 'معلومات عامة', ariaProgress: 'ملخص التقدم',
            repeatLabel: 'التكرار', sourceLabel: 'المصدر', showVirtue: 'عرض الفضل', authenticityLabel: 'ملاحظة حول درجة الحديث',
            markRead: 'تمت القراءة', markedRead: '✓ تمت القراءة', counterTap: 'عد', counterTapAria: 'اضغط للعد',
            counterDone: '✓ مكتمل', undo: 'تراجع', resetItem: 'إعادة', completedCaption: 'تم إكمال الذكر',
            emptyList: 'لا توجد أذكار متاحة حالياً.', progressTpl: 'تم إكمال {done} من {total}',
            resetConfirmTitle: 'هل تريد إعادة ضبط جميع العدادات؟', resetConfirmSub: 'سيتم تصفير تقدمك في هذا القسم والبدء من جديد.',
            cancel: 'إلغاء', confirmReset: 'نعم، إعادة الضبط', resetToast: 'تمت إعادة ضبط العدادات',
            rep: { 1: 'مرة واحدة', 2: 'مرتان', 3: 'ثلاث مرات', 4: 'أربع مرات', 7: 'سبع مرات', 10: 'عشر مرات', 100: 'مئة مرة' }, repN: '{n} مرة'
        },
        en: {
            heroTitle: 'Morning Athkar',
            heroSubtitle: 'Read the morning adhkar with their repeat counts and authentic sources — your progress is saved automatically through the day.',
            bcHub: 'Adhkar', bcCurrent: 'Morning Athkar',
            infoCount: '25 adhkar', infoCounter: 'Counter for repeated adhkar', infoAutosave: 'Your progress is saved automatically',
            sectionTitle: 'Morning Athkar with repeat counts and authentic sources',
            sectionText: 'This page presents the morning adhkar in full, showing the repeat count and source for each, with an interactive counter that helps you complete them without losing your place.',
            completedTitle: 'Morning Athkar completed', completedSub: 'We ask Allah to fill your day with remembrance and tranquility.',
            resetBtn: 'Reset counters', resetBtnShort: 'Reset',
            ariaBreadcrumb: 'Breadcrumb', ariaInfo: 'General information', ariaProgress: 'Progress summary',
            repeatLabel: 'Repetition', sourceLabel: 'Source', showVirtue: 'Show virtue', authenticityLabel: 'Note on the hadith grading',
            markRead: 'Mark as read', markedRead: '✓ Read', counterTap: 'Count', counterTapAria: 'Tap to count',
            counterDone: '✓ Done', undo: 'Undo', resetItem: 'Reset', completedCaption: 'Dhikr completed',
            emptyList: 'No adhkar available right now.', progressTpl: '{done} of {total} completed',
            resetConfirmTitle: 'Reset all counters?', resetConfirmSub: "Your progress in this section will be cleared and you'll start over.",
            cancel: 'Cancel', confirmReset: 'Yes, reset', resetToast: 'Counters have been reset',
            rep: { 1: 'once', 2: 'twice', 3: 'three times', 4: 'four times', 7: 'seven times', 10: 'ten times', 100: 'one hundred times' }, repN: '{n} times'
        },
        fr: {
            heroTitle: 'Invocations du matin',
            heroSubtitle: 'Lisez les invocations du matin avec leur nombre de répétitions et leurs sources authentiques — votre progression est enregistrée automatiquement tout au long de la journée.',
            bcHub: 'Invocations', bcCurrent: 'Invocations du matin',
            infoCount: '25 invocations', infoCounter: 'Compteur pour les invocations répétées', infoAutosave: 'Votre progression est enregistrée automatiquement',
            sectionTitle: 'Invocations du matin avec répétitions et sources authentiques',
            sectionText: 'Cette page présente les invocations du matin en intégralité, avec le nombre de répétitions et la source de chacune, ainsi qu’un compteur interactif qui vous aide à les terminer sans perdre le fil.',
            completedTitle: 'Invocations du matin terminées', completedSub: 'Nous demandons à Allah de remplir votre journée de rappel et de sérénité.',
            resetBtn: 'Réinitialiser les compteurs', resetBtnShort: 'Réinitialiser',
            ariaBreadcrumb: 'Fil d’Ariane', ariaInfo: 'Informations générales', ariaProgress: 'Résumé de la progression',
            repeatLabel: 'Répétition', sourceLabel: 'Source', showVirtue: 'Afficher le mérite', authenticityLabel: 'Note sur le degré du hadith',
            markRead: 'Marquer comme lu', markedRead: '✓ Lu', counterTap: 'Compter', counterTapAria: 'Appuyez pour compter',
            counterDone: '✓ Terminé', undo: 'Annuler', resetItem: 'Réinit.', completedCaption: 'Invocation terminée',
            emptyList: 'Aucune invocation disponible pour le moment.', progressTpl: '{done} sur {total} terminées',
            resetConfirmTitle: 'Réinitialiser tous les compteurs ?', resetConfirmSub: 'Votre progression dans cette section sera effacée et vous recommencerez.',
            cancel: 'Annuler', confirmReset: 'Oui, réinitialiser', resetToast: 'Les compteurs ont été réinitialisés',
            rep: { 1: 'une fois', 2: 'deux fois', 3: 'trois fois', 4: 'quatre fois', 7: 'sept fois', 10: 'dix fois', 100: 'cent fois' }, repN: '{n} fois'
        },
        ur: {
            heroTitle: 'صبح کے اذکار',
            heroSubtitle: 'صبح کے اذکار تعداد اور مستند حوالے کے ساتھ پڑھیں — آپ کی پیش رفت دن بھر خودبخود محفوظ رہتی ہے۔',
            bcHub: 'اذکار', bcCurrent: 'صبح کے اذکار',
            infoCount: '25 اذکار', infoCounter: 'بار بار پڑھے جانے والے اذکار کا شمار کنندہ', infoAutosave: 'آپ کی پیش رفت خودبخود محفوظ ہوتی ہے',
            sectionTitle: 'صبح کے اذکار تکرار اور مستند حوالے کے ساتھ',
            sectionText: 'یہ صفحہ صبح کے اذکار مکمل طور پر پیش کرتا ہے، ہر ذکر کی تعداد اور حوالہ واضح کرتا ہے، اور ایک متعامل شمار کنندہ فراہم کرتا ہے جو انہیں بھولے بغیر مکمل کرنے میں مدد دیتا ہے۔',
            completedTitle: 'صبح کے اذکار مکمل ہو گئے', completedSub: 'ہم اللہ سے دعا کرتے ہیں کہ آپ کا دن ذکر اور سکون سے معمور فرمائے۔',
            resetBtn: 'شمار کنندہ ری سیٹ کریں', resetBtnShort: 'ری سیٹ',
            ariaBreadcrumb: 'نیویگیشن راستہ', ariaInfo: 'عمومی معلومات', ariaProgress: 'پیش رفت کا خلاصہ',
            repeatLabel: 'تکرار', sourceLabel: 'حوالہ', showVirtue: 'فضیلت دکھائیں', authenticityLabel: 'حدیث کے درجے پر نوٹ',
            markRead: 'پڑھ لیا', markedRead: '✓ پڑھ لیا', counterTap: 'شمار', counterTapAria: 'شمار کے لیے دبائیں',
            counterDone: '✓ مکمل', undo: 'واپس', resetItem: 'دوبارہ', completedCaption: 'ذکر مکمل ہوا',
            emptyList: 'اس وقت کوئی ذکر دستیاب نہیں۔', progressTpl: '{total} میں سے {done} مکمل',
            resetConfirmTitle: 'تمام شمار کنندہ ری سیٹ کریں؟', resetConfirmSub: 'اس حصے میں آپ کی پیش رفت صاف ہو جائے گی اور آپ نئے سرے سے شروع کریں گے۔',
            cancel: 'منسوخ', confirmReset: 'ہاں، ری سیٹ کریں', resetToast: 'شمار کنندہ ری سیٹ ہو گئے',
            rep: { 1: 'ایک بار', 2: 'دو بار', 3: 'تین بار', 4: 'چار بار', 7: 'سات بار', 10: 'دس بار', 100: 'سو بار' }, repN: '{n} بار'
        },
        tr: {
            heroTitle: 'Sabah Zikirleri',
            heroSubtitle: 'Sabah zikirlerini tekrar sayıları ve sahih kaynaklarıyla okuyun — ilerlemeniz gün boyunca otomatik olarak kaydedilir.',
            bcHub: 'Zikirler', bcCurrent: 'Sabah Zikirleri',
            infoCount: '25 zikir', infoCounter: 'Tekrarlanan zikirler için sayaç', infoAutosave: 'İlerlemeniz otomatik olarak kaydedilir',
            sectionTitle: 'Tekrar sayıları ve sahih kaynaklarıyla sabah zikirleri',
            sectionText: 'Bu sayfa sabah zikirlerini eksiksiz sunar; her zikrin tekrar sayısını ve kaynağını gösterir ve onları yerinizi kaybetmeden tamamlamanıza yardımcı olan etkileşimli bir sayaç sağlar.',
            completedTitle: 'Sabah zikirleri tamamlandı', completedSub: 'Allah’tan gününüzü zikir ve huzurla doldurmasını dileriz.',
            resetBtn: 'Sayaçları sıfırla', resetBtnShort: 'Sıfırla',
            ariaBreadcrumb: 'Gezinme yolu', ariaInfo: 'Genel bilgiler', ariaProgress: 'İlerleme özeti',
            repeatLabel: 'Tekrar', sourceLabel: 'Kaynak', showVirtue: 'Fazileti göster', authenticityLabel: 'Hadis derecesi hakkında not',
            markRead: 'Okundu olarak işaretle', markedRead: '✓ Okundu', counterTap: 'Say', counterTapAria: 'Saymak için dokunun',
            counterDone: '✓ Tamamlandı', undo: 'Geri al', resetItem: 'Sıfırla', completedCaption: 'Zikir tamamlandı',
            emptyList: 'Şu anda uygun zikir yok.', progressTpl: '{total} zikirden {done} tamamlandı',
            resetConfirmTitle: 'Tüm sayaçlar sıfırlansın mı?', resetConfirmSub: 'Bu bölümdeki ilerlemeniz silinecek ve yeniden başlayacaksınız.',
            cancel: 'İptal', confirmReset: 'Evet, sıfırla', resetToast: 'Sayaçlar sıfırlandı',
            rep: { 1: 'bir kez', 2: 'iki kez', 3: 'üç kez', 4: 'dört kez', 7: 'yedi kez', 10: 'on kez', 100: 'yüz kez' }, repN: '{n} kez'
        },
        bn: {
            heroTitle: 'সকালের যিকির',
            heroSubtitle: 'সকালের যিকিরগুলো পুনরাবৃত্তির সংখ্যা ও নির্ভরযোগ্য সূত্রসহ পড়ুন — আপনার অগ্রগতি সারা দিন স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়।',
            bcHub: 'যিকির', bcCurrent: 'সকালের যিকির',
            infoCount: '25 যিকির', infoCounter: 'পুনরাবৃত্ত যিকিরের জন্য কাউন্টার', infoAutosave: 'আপনার অগ্রগতি স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়',
            sectionTitle: 'পুনরাবৃত্তি ও নির্ভরযোগ্য সূত্রসহ সকালের যিকির',
            sectionText: 'এই পৃষ্ঠায় সকালের যিকির সম্পূর্ণরূপে দেওয়া হয়েছে, প্রতিটির পুনরাবৃত্তির সংখ্যা ও সূত্র উল্লেখসহ, এবং একটি ইন্টারেক্টিভ কাউন্টার যা ভুলে না গিয়ে সেগুলো সম্পূর্ণ করতে সাহায্য করে।',
            completedTitle: 'সকালের যিকির সম্পন্ন হয়েছে', completedSub: 'আমরা আল্লাহর কাছে দোয়া করি তিনি যেন আপনার দিনটি যিকির ও প্রশান্তিতে পূর্ণ করেন।',
            resetBtn: 'কাউন্টার রিসেট করুন', resetBtnShort: 'রিসেট',
            ariaBreadcrumb: 'ব্রেডক্রাম্ব', ariaInfo: 'সাধারণ তথ্য', ariaProgress: 'অগ্রগতির সারসংক্ষেপ',
            repeatLabel: 'পুনরাবৃত্তি', sourceLabel: 'সূত্র', showVirtue: 'ফজিলত দেখুন', authenticityLabel: 'হাদিসের মান সম্পর্কে নোট',
            markRead: 'পঠিত হিসেবে চিহ্নিত করুন', markedRead: '✓ পঠিত', counterTap: 'গণনা', counterTapAria: 'গণনা করতে ট্যাপ করুন',
            counterDone: '✓ সম্পন্ন', undo: 'পূর্বাবস্থা', resetItem: 'রিসেট', completedCaption: 'যিকির সম্পন্ন হয়েছে',
            emptyList: 'এই মুহূর্তে কোনো যিকির উপলব্ধ নেই।', progressTpl: '{total}টির মধ্যে {done}টি সম্পন্ন',
            resetConfirmTitle: 'সব কাউন্টার রিসেট করবেন?', resetConfirmSub: 'এই অংশে আপনার অগ্রগতি মুছে যাবে এবং আপনি নতুন করে শুরু করবেন।',
            cancel: 'বাতিল', confirmReset: 'হ্যাঁ, রিসেট করুন', resetToast: 'কাউন্টার রিসেট করা হয়েছে',
            rep: { 1: 'একবার', 2: 'দুইবার', 3: 'তিনবার', 4: 'চারবার', 7: 'সাতবার', 10: 'দশবার', 100: 'একশ বার' }, repN: '{n} বার'
        },
        ms: {
            heroTitle: 'Zikir Pagi',
            heroSubtitle: 'Baca zikir pagi dengan bilangan ulangan dan sumber sahih — kemajuan anda disimpan secara automatik sepanjang hari.',
            bcHub: 'Zikir', bcCurrent: 'Zikir Pagi',
            infoCount: '25 zikir', infoCounter: 'Kaunter untuk zikir berulang', infoAutosave: 'Kemajuan anda disimpan secara automatik',
            sectionTitle: 'Zikir pagi dengan bilangan ulangan dan sumber sahih',
            sectionText: 'Halaman ini memaparkan zikir pagi sepenuhnya, menunjukkan bilangan ulangan dan sumber bagi setiap satu, serta kaunter interaktif yang membantu anda menyelesaikannya tanpa hilang tempat.',
            completedTitle: 'Zikir pagi selesai', completedSub: 'Kami memohon kepada Allah agar memenuhi hari anda dengan zikir dan ketenangan.',
            resetBtn: 'Tetap semula kaunter', resetBtnShort: 'Tetap semula',
            ariaBreadcrumb: 'Laluan navigasi', ariaInfo: 'Maklumat umum', ariaProgress: 'Ringkasan kemajuan',
            repeatLabel: 'Ulangan', sourceLabel: 'Sumber', showVirtue: 'Tunjuk kelebihan', authenticityLabel: 'Nota tentang darjat hadis',
            markRead: 'Tanda sebagai dibaca', markedRead: '✓ Dibaca', counterTap: 'Kira', counterTapAria: 'Ketik untuk mengira',
            counterDone: '✓ Selesai', undo: 'Buat asal', resetItem: 'Set semula', completedCaption: 'Zikir selesai',
            emptyList: 'Tiada zikir tersedia buat masa ini.', progressTpl: '{done} daripada {total} selesai',
            resetConfirmTitle: 'Tetapkan semula semua kaunter?', resetConfirmSub: 'Kemajuan anda dalam bahagian ini akan dikosongkan dan anda akan bermula semula.',
            cancel: 'Batal', confirmReset: 'Ya, tetapkan semula', resetToast: 'Kaunter telah ditetapkan semula',
            rep: { 1: 'sekali', 2: 'dua kali', 3: 'tiga kali', 4: 'empat kali', 7: 'tujuh kali', 10: 'sepuluh kali', 100: 'seratus kali' }, repN: '{n} kali'
        },
        de: {
            heroTitle: 'Morgen-Adhkar',
            heroSubtitle: 'Lies die Morgen-Adhkar mit ihrer Wiederholungszahl und authentischen Quellen — dein Fortschritt wird den ganzen Tag über automatisch gespeichert.',
            bcHub: 'Adhkar', bcCurrent: 'Morgen-Adhkar',
            infoCount: '25 Adhkar', infoCounter: 'Zähler für wiederholte Adhkar', infoAutosave: 'Dein Fortschritt wird automatisch gespeichert',
            sectionTitle: 'Morgen-Adhkar mit Wiederholungen und authentischen Quellen',
            sectionText: 'Diese Seite zeigt die Morgen-Adhkar vollständig, mit Wiederholungszahl und Quelle für jedes, sowie einem interaktiven Zähler, der dir hilft, sie ohne den Faden zu verlieren zu vollenden.',
            completedTitle: 'Morgen-Adhkar abgeschlossen', completedSub: 'Wir bitten Allah, deinen Tag mit Gedenken und Gelassenheit zu erfüllen.',
            resetBtn: 'Zähler zurücksetzen', resetBtnShort: 'Zurücksetzen',
            ariaBreadcrumb: 'Navigationspfad', ariaInfo: 'Allgemeine Informationen', ariaProgress: 'Fortschrittsübersicht',
            repeatLabel: 'Wiederholung', sourceLabel: 'Quelle', showVirtue: 'Vorzug anzeigen', authenticityLabel: 'Hinweis zum Hadith-Grad',
            markRead: 'Als gelesen markieren', markedRead: '✓ Gelesen', counterTap: 'Zählen', counterTapAria: 'Zum Zählen tippen',
            counterDone: '✓ Fertig', undo: 'Rückgängig', resetItem: 'Zurücksetzen', completedCaption: 'Dhikr abgeschlossen',
            emptyList: 'Derzeit sind keine Adhkar verfügbar.', progressTpl: '{done} von {total} abgeschlossen',
            resetConfirmTitle: 'Alle Zähler zurücksetzen?', resetConfirmSub: 'Dein Fortschritt in diesem Abschnitt wird gelöscht und du beginnst von vorn.',
            cancel: 'Abbrechen', confirmReset: 'Ja, zurücksetzen', resetToast: 'Zähler wurden zurückgesetzt',
            rep: { 1: 'einmal', 2: 'zweimal', 3: 'dreimal', 4: 'viermal', 7: 'siebenmal', 10: 'zehnmal', 100: 'hundertmal' }, repN: '{n}-mal'
        },
        es: {
            heroTitle: 'Adhkar de la mañana',
            heroSubtitle: 'Lee los adhkar de la mañana con su número de repeticiones y fuentes auténticas — tu progreso se guarda automáticamente durante el día.',
            bcHub: 'Adhkar', bcCurrent: 'Adhkar de la mañana',
            infoCount: '25 adhkar', infoCounter: 'Contador para los adhkar repetidos', infoAutosave: 'Tu progreso se guarda automáticamente',
            sectionTitle: 'Adhkar de la mañana con repeticiones y fuentes auténticas',
            sectionText: 'Esta página presenta los adhkar de la mañana completos, mostrando el número de repeticiones y la fuente de cada uno, con un contador interactivo que te ayuda a completarlos sin perder el hilo.',
            completedTitle: 'Adhkar de la mañana completados', completedSub: 'Pedimos a Allah que llene tu día de recuerdo y serenidad.',
            resetBtn: 'Reiniciar contadores', resetBtnShort: 'Reiniciar',
            ariaBreadcrumb: 'Ruta de navegación', ariaInfo: 'Información general', ariaProgress: 'Resumen del progreso',
            repeatLabel: 'Repetición', sourceLabel: 'Fuente', showVirtue: 'Mostrar la virtud', authenticityLabel: 'Nota sobre el grado del hadiz',
            markRead: 'Marcar como leído', markedRead: '✓ Leído', counterTap: 'Contar', counterTapAria: 'Toca para contar',
            counterDone: '✓ Hecho', undo: 'Deshacer', resetItem: 'Reiniciar', completedCaption: 'Dhikr completado',
            emptyList: 'No hay adhkar disponibles en este momento.', progressTpl: '{done} de {total} completados',
            resetConfirmTitle: '¿Reiniciar todos los contadores?', resetConfirmSub: 'Tu progreso en esta sección se borrará y empezarás de nuevo.',
            cancel: 'Cancelar', confirmReset: 'Sí, reiniciar', resetToast: 'Los contadores se han reiniciado',
            rep: { 1: 'una vez', 2: 'dos veces', 3: 'tres veces', 4: 'cuatro veces', 7: 'siete veces', 10: 'diez veces', 100: 'cien veces' }, repN: '{n} veces'
        },
        id: {
            heroTitle: 'Zikir Pagi',
            heroSubtitle: 'Baca zikir pagi dengan jumlah pengulangan dan sumber sahih — kemajuan Anda disimpan otomatis sepanjang hari.',
            bcHub: 'Zikir', bcCurrent: 'Zikir Pagi',
            infoCount: '25 zikir', infoCounter: 'Penghitung untuk zikir berulang', infoAutosave: 'Kemajuan Anda disimpan otomatis',
            sectionTitle: 'Zikir pagi dengan pengulangan dan sumber sahih',
            sectionText: 'Halaman ini menyajikan zikir pagi secara lengkap, menampilkan jumlah pengulangan dan sumber setiap zikir, dengan penghitung interaktif yang membantu Anda menyelesaikannya tanpa kehilangan jejak.',
            completedTitle: 'Zikir pagi selesai', completedSub: 'Kami memohon kepada Allah agar memenuhi hari Anda dengan zikir dan ketenangan.',
            resetBtn: 'Setel ulang penghitung', resetBtnShort: 'Setel ulang',
            ariaBreadcrumb: 'Jalur navigasi', ariaInfo: 'Informasi umum', ariaProgress: 'Ringkasan kemajuan',
            repeatLabel: 'Pengulangan', sourceLabel: 'Sumber', showVirtue: 'Tampilkan keutamaan', authenticityLabel: 'Catatan tentang derajat hadis',
            markRead: 'Tandai sudah dibaca', markedRead: '✓ Dibaca', counterTap: 'Hitung', counterTapAria: 'Ketuk untuk menghitung',
            counterDone: '✓ Selesai', undo: 'Urungkan', resetItem: 'Atur ulang', completedCaption: 'Zikir selesai',
            emptyList: 'Tidak ada zikir yang tersedia saat ini.', progressTpl: '{done} dari {total} selesai',
            resetConfirmTitle: 'Setel ulang semua penghitung?', resetConfirmSub: 'Kemajuan Anda di bagian ini akan dihapus dan Anda mulai dari awal.',
            cancel: 'Batal', confirmReset: 'Ya, setel ulang', resetToast: 'Penghitung telah disetel ulang',
            rep: { 1: 'sekali', 2: 'dua kali', 3: 'tiga kali', 4: 'empat kali', 7: 'tujuh kali', 10: 'sepuluh kali', 100: 'seratus kali' }, repN: '{n} kali'
        }
    };

    try {
        console.log('[azkar-data] loaded · categories=' + window.AzkarCategories.length +
            ' · morning_items=' + window.AzkarMorning.length +
            ' · evening_items=' + window.AzkarEvening.length +
            ' · prayer_items=' + window.AzkarPrayer.length);
    } catch (_) { /* silent */ }
})();
