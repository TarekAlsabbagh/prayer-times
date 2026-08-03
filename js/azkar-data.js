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
            // AZKAR-MORNING-DUA-CARD-05-TRANSLATIONS-TRUSTED-SOURCES-AVAILABLE-LANGUAGES-1: static translations of this
            // dhikr, shown ABOVE the Arabic on non-Arabic UIs. en/fr/ur/tr/bn/es/id = HadeethEnc encyclopedia (hadith 3008;
            // morning wording built from the SAME source's own translation per the hadith's instruction); ms = akuislam
            // morning-adhkar guide (cites Sahih Muslim, full text, read once); de = Islamische Datenbank Hisn-ul-Muslim
            // (ch. 'Adhkar for morning and evening' item 77; footnote markers stripped — PENDING resolved by the
            // …-PENDING-TRUSTED-TRANSLATIONS-CARD05-CARD06-1 ticket). NO translation_ar (Arabic UI never shows one).
            translation_en: "The morning has reached, and all the dominion belongs to Allah and praise be to Allah. There is no god but Allah, alone without any partner. To Him belongs the dominion, and to Him belongs praise, and He is Omnipotent over all things. My Lord, I ask You for the good of this day and the good of what follows it, and I seek refuge with You from the evil of this day and the evil of what follows it. My Lord, I seek refuge with You from laziness and woeful aging. My Lord, I seek refuge with You from torment of the fire and torment in the grave.",
            translation_fr: "Nous nous retrouvons au matin, ainsi que la royauté, appartenant à Allah ; les louanges sont pour Allah, il n'est de divinité [digne d'adoration] excepté Allah, Lui Seul, Il n’a point d’associé. A Lui la royauté, à Lui les louanges et Il est capable de toute chose. Ô Seigneur ! Je Te demande le meilleur de ce qui se trouve dans cette journée et le meilleur de ce qui vient après. Et je cherche protection auprès de Toi contre le mal de ce qui se trouve dans cette journée et le mal de ce qui vient après. Ô Seigneur ! Je cherche protection auprès de Toi contre la paresse et les maux de la vieillesse. Ô Seigneur ! Je cherche protection auprès de Toi contre le châtiment du Feu et le châtiment de la tombe.",
            translation_ur: "ہم نے صبح کی اور اللہ کی بادشاہت کو دوام رہا۔ تمام تعریفیں اللہ کے لیے ہیں اور اللہ کے سوا کوئی الٰہ نہیں۔ وہ اکیلا ہے، اُس کا کوئی شریک نہیں۔ بادشاہی اسی کی ہے اور ہر قسم کی حمد بھی اُسی کے لیے ہے اور وہ ہر چیز پر قدرت رکھتا ہے۔ اے میرے رب! میں تجھ سے اِس دن کی بھلائی چاہتا ہوں اور اُس کی بھی جو اس کے بعد ہے۔ اور اس دن کی برائی سے تیری پناہ مانگتا ہوں اور اُس سے بھی جو اس کے بعد ہے۔ اے رب! میں سستی سے اور بڑھاپے کی برائی سے تیری پناہ مانگتا ہوں۔ اے رب! میں جہنم اور قبر کے عذاب سے تیری پناہ چاہتا ہوں۔",
            translation_tr: "Biz Allah'ın (kulu) olarak sabahladık, bütün mülk de Allah'ın olarak sabahladı. Hamd Allah'a mahsustur. Allah'dan başka hakkıyla ibadete layık hiçbir ilâh yoktur, yalnız O vardır; O'nun ortağı yoktur. Mülk O'na mahsustur; hamd O'na mahsustur. O, her şeye kadirdir. Rabbim! Bu gündüzde bulunanın hayırlısını ve bundan sonra olanın da hayırlısını senden isterim. Bu gündüzde olanın şerrinden ve bundan sonra olanın şerrinden sana sığınırım. Rabbim! Tembellikten, kocamaktan ve bunamaktan sana sığınırım. Cehennem'deki azaptan ve kabirdeki azaptan sana sığınırım.",
            translation_bn: "আমরা ও সারা রাজ্য আল্লাহর জন্য সকালে উপনীত হলাম। সকল প্রশংসা আল্লাহর। আল্লাহ ছাড়া কোন সত্য উপাস্য নেই, তিনি এক, তাঁর কোন শরীক নেই। তাঁরই জন্য সমস্ত রাজত্ব, তাঁরই জন্য যাবতীয় প্রশংসা এবং তিনি সকল বস্তুর উপর সর্ব শক্তিমান। হে আমার রব! আমি তোমার নিকট এই দিনে যে কল্যাণ নিহিত আছে তা এবং তার পরে যে কল্যাণ আছে তাও প্রার্থনা করছি। আর আমি তোমার নিকট এই দিনে যে অকল্যাণ আছে তা এবং তারপরেও যে অকল্যাণ আছে তা হতে আশ্রয় চাচ্ছি। হে আমার রব! আমি তোমার নিকট অলসতা এবং বার্ধক্যের মন্দ হতে পানাহ চাচ্ছি। হে আমার রব! আমি তোমার নিকট জাহান্নামের এবং কবরের সকল প্রকার আযাব হতে আশ্রয় চাচ্ছি।",
            translation_ms: "Kami telah memasuki waktu pagi dan kerajaan hanya milik Allah, segala puji bagi Allah. Tidak ada Ilah (yang berhak disembah) kecuali Allah semata, tiada sekutu bagi-Nya. Milik Allah kerajaan dan bagi-Nya pujian. Dia-lah Yang Mahakuasa atas segala sesuatu. Wahai Rabbku, aku mohon kepada-Mu kebaikan di hari ini dan kebaikan sesudahnya. Aku berlindung kepada-Mu dari kejahatan hari ini dan kejahatan sesudahnya. Wahai Rabbku, aku berlindung kepadaMu dari kemalasan dan kejelekan di hari tua. Wahai Rabbku, aku berlindung kepada-Mu dari siksaan di neraka dan siksaan di alam kubur.",
            translation_de: "Wir haben den Morgen erreicht, und die Herrschaft (an diesem Morgen) gehört Allāh (allein). Allāh (allein) gehört (und gebührt) Al-Ḥamd (das Lob). Es gibt keinen wahren Ilāh (Anbetungswürdigen) außer Allāh allein. Er hat keinen Teilhaber. Ihm (allein) gehört die Herrschaft, und Ihm (allein) gehört (und gebührt) Al-Ḥamd; und Er hat zu allem die Macht. Oh mein Rabb (Herr), ich erbitte von Dir das Beste an diesem Tag und das Beste dessen, was danach kommt. Und ich suche Zuflucht bei Dir vor dem Übel dieses Tages und dem Übel dessen, was danach kommt. Oh mein Rabb, ich suche Zuflucht bei Dir vor dem Müßiggang (faul oder langsam die ʿIbādah (gottesdienstlichen Handlungen) zu verrichten, obwohl man fit ist) und der schweren Altersschwäche (oder in einer anderen Bedeutung: dem Schlechten der Überheblichkeit). Oh mein Rabb, ich suche Zuflucht bei Dir vor der Strafe im Höllenfeuer und vor der Strafe im Grab.",
            translation_es: "¡Hemos amanecido y ha amanecido el Reino de Al-lah. Las alabanzas son para Al-lah. No hay más dios que Al-lah, único y sin asociado! Para Él es el Reino y la alabanza. Él es el Poderoso sobre todas las cosas. ¡Señor, te pido el bien que haya en este día y después de él. Y me refugio en Ti del mal que haya en este día y después de él! ¡Señor, me refugio en Ti de la pereza y el mal de la decrepitud. Me refugio en Ti del castigo del Fuego y del castigo de la tumba!",
            translation_id: "Kami memasuki waktu pagi dan segala kekuasaan hanya milik Allah, segala puji hanya milik Allah. Tidak ada Ilah yang berhak disembah selain Allah Yang Maha Esa tidak ada sekutu bagi-Nya. Bagi-Nya-lah segala kekuasaan dan bagi-Nya-lah segala puji dan Dia-lah Yang Maha Kuasa atas segala sesuatu. Ya Rabbku, aku memohon kepada-Mu kebaikan yang ada di hari ini dan kebaikan yang terdapat setelahnya. Aku berlindung kepada-Mu dari kejelekan yang ada di hari ini dan kejelekan yang terdapat setelahnya. Wahai Rabbku, aku berlindung kepadamu dari kemalasan dan kejelekan umur tua. Wahai Rabbku, aku berlindung kepada-Mu dari siksa neraka dan azab kubur.",
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
            // AZKAR-MORNING-DUA-CARD-06-TRANSLATIONS-TRUSTED-SOURCES-AVAILABLE-LANGUAGES-1: static translations of this
            // dhikr (MORNING form only), shown ABOVE the Arabic on non-Arabic UIs. All 7 = HadeethEnc encyclopedia
            // (hadith 5490; the morning segment sliced verbatim from the same source translation — no word swaps).
            // PENDING resolved by …-PENDING-TRUSTED-TRANSLATIONS-CARD05-CARD06-1: fr = Hisnii morning invocations
            // (invocation 7; As-Sahihah 262); ms = akuislam guide (the official HadeethEnc ms Excel v1.2.0 lacks hadith
            // 5490 — verified). NO translation_ar (Arabic UI never shows one).
            translation_en: "O Allah, by You we have reached the morning, and by You we have reached the evening; by You we live, and by You we die, and to You is the Resurrection.",
            translation_fr: "Ô Allah ! C’est par Toi que nous nous retrouvons au matin et c’est par Toi que nous nous retrouvons au soir. C’est par Toi que nous vivons et c’est par Toi que nous mourons et c’est vers Toi que se fera la Résurrection.",
            translation_ur: "اے اللہ! تیری حفاظت میں ہم نے صبح کی اور تیری حفاظت میں ہی شام کی اور تیرے ہی نام پر ہم زندہ ہوتے اور تیرے ہی نام پر ہم مرتے ہیں اور تیری ہی طرف اٹھ کر جانا ہے",
            translation_tr: "Allah'ım! Senin lütfunla sabaha ulaştık, senin lütfunla akşama erdik. Sen isteyince dirilir, sen isteyince ölürüz. Yeniden diriltip huzurunda toplayacak olan da Sensin.",
            translation_bn: "হে আল্লাহ! আপনার অনুগ্রহে আমরা ভোরে উপনীত হই, সন্ধ্যায় উপনীত হই এবং বাঁচি ও মরি। আর আপনার দিকেই আমাদের প্রত্যাবর্তন",
            translation_ms: "Ya Allah, dengan rahmat dan pertolongan-Mu kami memasuki waktu pagi, dan dengan rahmat dan pertolongan-Mu kami memasuki waktu petang. Dengan rahmat dan pertolongan-Mu kami hidup, dan dengan kehendak-Mu kami mati. Dan kepada-Mu kebangkitan (bagi semua makhluk).",
            translation_de: "O Allah, durch Dich traten wir in den Morgen, durch Dich traten wir in den Abend, durch Dich leben wir, durch Dich sterben wir und zu Dir ist die Auferstehung.",
            translation_es: "¡Oh Al-lah, por Ti hemos amanecido y por Ti hemos anochecido; por Ti vivimos y por Ti morimos; y a Ti seremos congregados!",
            translation_id: "Ya Allah! Dengan pertolongan dan rahmat-Mu kami memasuki pagi hari, dengan pertolongan dan rahmat-Mu kami memasuki sore hari, dengan pertolongan dan rahmat-Mu kami hidup, dengan pertolongan dan rahmat-Mu kami mati, dan hanya kepada-Mu kebangkitan semua makhluk",
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
            // AZKAR-MORNING-DUA-CARD-07-SAYYIDUL-ISTIGHFAR-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1: static
            // translations of the DUA MEANING ONLY (no narrator intro, no transliteration, no virtue sentence — the
            // virtue stays in the separate Arabic `virtue` field). en/ur/tr/bn/de/es/id = HadeethEnc encyclopedia
            // (hadith 5503; the bracketed dua meaning sliced verbatim); fr = Hisnii morning invocations (invocation
            // 10 — HadeethEnc has no fr for 5503); ms = akuislam istighfar guide ("Maksudnya" text; cites Bukhari &
            // Abu Dawud). NO translation_ar (Arabic UI never shows one).
            translation_en: "O Allah, You are my Lord. You created me, and I am Your slave. I will remain faithful to Your covenant and promise as much as possible. I seek refuge with You from the evil of what I have done. I acknowledge Your favor upon me, and I admit my sin. So, forgive me. Indeed, none can forgive sins but You.",
            translation_fr: "Ô Allah ! Tu es mon Seigneur. Il n’y a aucune divinité [digne d’être adorée] en dehors de Toi. Tu m’as créé et je suis Ton serviteur, je me conforme autant que je peux à mon engagement et à ma promesse vis-à-vis de Toi. Je cherche refuge auprès de Toi contre le mal que j’ai commis. Je reconnais Ton bienfait à mon égard et je reconnais mon péché. Pardonne-moi donc, en effet nul autre que Toi ne pardonnes les péchés.",
            translation_ur: "اے اللہ! تو میرا رب ہے، تیرے سوا کوئی معبود برحق نہیں۔ تو نے مجھے پیدا کیا اور میں تیرا بندہ ہوں۔ میں اپنی طاقت کے مطابق تجھ سے کیے ہوئے عہد اور وعدے پر قائم ہوں۔ میں اپنے کیے ہوئے اعمال کے شر سے تیری پناہ مانگتا ہوں۔ میں تیرے حضور تیری جانب سے ملنے والی نعمتوں کا اقرار کرتا ہوں۔ ایسے ہی اپنے گناہوں کا بھی اعتراف کرتا ہوں۔ لہذا میرى مغفرت فرما، کیوں کہ تیرے سوا کوئی گناہوں کى مغفرت کرنے والا نہیں ہے۔",
            translation_tr: "Allah’ım! Sen benim Rabbimsin. Senden başka ibadete layık (hak) ilah yoktur. Beni sen yarattın ve ben senin kulunum. Ezelde sana verdiğim sözümde ve vaadimde hâlâ gücüm yettiğince durmaktayım. İşlediğim kusurların şerrinden sana sığınırım. Bana lütfettiğin nimetleri itiraf ediyorum. Günahlarımı itiraf ediyorum. Beni affet, şüphe yok ki günahları senden başka affedecek yoktur.",
            translation_bn: "হে আল্লাহ, আপনিই আমার রব, আপনি ছাড়া কোনো সত্য মাবূদ নেই। আপনিই আমাকে সৃষ্টি করেছেন, আমি আপনার বান্দা, আমি যথাসাধ্য আপনার অঙ্গীকার ও ওয়াদার ওপর আছি, আমি যা করছি তার অনিষ্ট থেকে আপনার নিকট প্রার্থনা করছি। আমি আমার ওপর আপনার নি‘আমত স্বীকার করছি এবং আমি আপনার সামনে আমার পাপ স্বীকার করছি, অতএব আপনি আমাকে ক্ষমা করুন। কারণ, আপনি ব্যতীত কেউ পাপ ক্ষমা করবে না।",
            translation_ms: "Ya Allah, Engkaulah Tuhanku, tiada tuhan yang disembah melainkan Engkau. Engkau telah menjadikan aku, dan aku ialah hamba Mu, aku tetap atas amanah-Mu dan janji-Mu sekadar kesanggupan. Aku berlindung dengan-Mu daripada kejahatan yang telah aku lakukan. Aku mengakui kepada-Mu dengan nikmatMu ke atasku dan aku mengakui dosaku. Maka ampunilah aku, maka sesungguhnya tiada siapa yang dapat mengampuni dosa-dosaku selain Engkau.",
            translation_de: "O Allah, Du bist mein Herr, es gibt keinen Gott außer Dir. Du hast mich erschaffen, und ich bin Dein Diener. Ich halte an Deinem Bund und Deinem Versprechen fest, so gut ich kann. Ich suche Zuflucht bei Dir vor dem Bösen, das ich getan habe. Ich bekenne Deine Gnade mir gegenüber und ich bekenne meine Sünden. So vergib mir, denn niemand vergibt Sünden außer Dir.",
            translation_es: "¡Oh, Al-lah!, Tú eres mi Señor. No hay más divinidad que Tú. Me has creado y soy Tu Siervo. Mantengo mi pacto y mi promesa contigo de la mejor manera que puedo. En Ti me refugio del mal que he cometido. Reconozco Tus gracias para conmigo y reconozco mis pecados. Perdóname, pues nadie perdona los pecados sino Tú.",
            translation_id: "Ya Allah! Engkau adalah Tuhanku, tidak ada Tuhan yang berhak disembah kecuali Engkau. Engkau yang menciptakanku, aku adalah hamba-Mu. Aku menetapi perjanjian dan janjiku kepada-Mu semampuku. Aku berlindung kepada-Mu dari keburukan perbuatanku. Aku mengakui nikmat-Mu atas diriku dan aku mengakui dosaku. Maka ampunilah aku, karena sesungguhnya tiada yang mengampuni dosa selain Engkau.",
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
            // AZKAR-MORNING-DUA-CARD-08-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1: static translations of the dua
            // meaning only (no repeat label, reference, virtue, transliteration, explanation, footnotes/digits, or
            // evening variant). en=Sunnah Hisn 80; es/id/bn=HisnMuslim ch.1; de=Islamische Datenbank Hisnu-l-
            // Muslim ch.27; fr=Dar Al Athar Hisnul Muslim ch.27; ur=IslamHouse morning/evening azkar; ms=AkuIslam
            // (Pagi); tr=Kuranla Şifa. Approved incidental cleaning: ur/bn honorific after the Prophet’s name dropped
            // (not in the Arabic text), es «Muhammmad»→«Muhammad», ms «‘Arys»→«‘Arsy», fr «[ou au soir]» dropped.
            // NO translation_ar (Arabic UI never shows a block).
            translation_en: "O Allah, I have entered a new morning and call upon You and upon the bearers of Your Throne, upon Your angels and all creation to bear witness that surely You are Allah, there is none worthy of worship but You alone, You have no partners, and that Muhammad is Your slave and Your Messenger.",
            translation_fr: "Ô Seigneur ! Me voici au matin, je Te prends à témoin et je prends à témoins les porteurs de Ton Trône ainsi que Tes anges et toutes tes créatures, que c’est Toi Allah, il n’y a de divinité que Toi, Tu es Seul et sans associé, et que Muhammad est Ton esclave et Ton messager.",
            translation_ur: "اے اللہ! میں نے اس حال میں صبح کی کہ میں تجھے گواہ بناتا ہوں اور تیرا عرش اٹھانے والوں کو، تیرے فرشتوں کو اور تیری تمام مخلوق کو گواہ بناتا ہوں کہ تو ہی اللہ ہے، تیرے سوا کوئی معبود برحق نہیں، اور بیشک محمد تیرے بندے اور تیرے رسول ہیں۔",
            translation_tr: "Allah'ım! Senin, kendinden başka ilah olmayan Allah olduğuna ve Muhammed'in de kulun ve Rasûlün olduğuna; seni, arşını taşıyanları, meleklerini ve bütün yarattıklarını şahit tutarak sabahladım",
            translation_bn: "হে আল্লাহ! আমি সকালে উপনীত হয়েছি। আপনাকে আমি সাক্ষী রাখছি, আরও সাক্ষী রাখছি আপনার ‘আরশ বহনকারীদেরকে, আপনার ফেরেশতাগণকে ও আপনার সকল সৃষ্টিকে, (এর উপর) যে— নিশ্চয় আপনিই আল্লাহ, একমাত্র আপনি ছাড়া আর কোনো হক্ব ইলাহ নেই, আপনার কোনো শরীক নেই; আর মুহাম্মাদ আপনার বান্দা ও রাসূল।",
            translation_ms: "Ya Allah, sesungguhnya aku di waktu pagi ini mempersaksikan Engkau, malaikat yang memikul ‘Arsy-Mu, malaikat-malaikat dan seluruh makhluk-Mu, bahawa sesungguhnya Engkau adalah Allah, tiada Ilah yang berhak disembah kecuali Engkau semata, tiada sekutu bagi-Mu dan sesungguhnya Muhammad adalah hamba dan utusan-Mu.",
            translation_de: "O Allāh, wahrlich habe ich den Morgen erreicht und rufe Dich, und die Deinen Thron tragenden (die Engel), Deine Malāʾikah (Engel) und all Deine Schöpfung zum Bezeugen, dass ich bezeuge, Du bist Allāh; und es gibt keinen wahren Ilāh (Anbetungswürdigen) außer Dir (allein). Du hast keinen Teilhaber; und Muḥammad ist Dein Diener und Gesandter.",
            translation_es: "Oh Allah, ciertamente amanezco y atestiguo, así como atestiguan los (ángeles) que sostienen Tu Trono, Tus ángeles y toda Tu creación, de que Tu eres Allah y no hay divinidad salvo Tú, único, sin asociado y que Muhammad es Tu siervo y mensajero.",
            translation_id: "Ya Allah, sesungguhnya aku di waktu pagi bersaksi kepada-Mu, malaikat yang memikul ‘Arasy-Mu, malaikat-malaikat dan seluruh makhluk-Mu, sesungguhnya Engkau adalah Allah, tiada Tuhan yang berhak disembah kecuali Engkau Yang Maha Esa, tiada sekutu bagi-Mu dan sesungguhnya Muhammad adalah hamba dan utusan-Mu.",
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
            // AZKAR-MORNING-DUA-CARD-09-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1: static translations of the dua
            // meaning only (no repeat label, reference, virtue, transliteration, explanation, footnotes/digits, or
            // evening variant). en=Sunnah Hisn 81; es/id/bn=HisnMuslim item 81; de=Islamische Datenbank Hisnu-l-Muslim
            // Kap.27; fr=Dar Al Athar Hisnul Muslim ch.27; ur=IslamHouse morning/evening azkar; tr=Turkish Hisnul
            // Müslim böl.27 (morning form «sabaha çıkan»; not the evening-form Turkish source); ms=Duaa Mathurat
            // Sughra (Doa 19, Pagi). Incidental cleaning: footnote digits + evening markers
            // («[ou ce soir]», «[Akşamleyin…]») dropped. NO translation_ar (Arabic UI never shows a block).
            translation_en: "O Allah, whatever blessing has been received by me or anyone of Your creation is from You alone, You have no partner. All praise is for you and thanks is to You.",
            translation_fr: "Ô Seigneur ! Tout ce qui m’arrive comme bienfaits en ce jour qui se lève, à moi ou à l’une de Tes créatures, provient de Toi Seul, sans associé. A Toi la louange ainsi que la gratitude.",
            translation_ur: "اے اللہ! مجھ پر یا تیری مخلوق میں سے کسی پر جس نعمت نے بھی صبح کی ہے وہ صرف تیری طرف سے ہے، تو اکیلا ہے، تیرا کوئی شریک نہیں، پس تیرے ہی لئے حمد اور تیرے ہی لئے شکر ہے۔",
            translation_tr: "Allahım! Benim veya kullarından birisinin yanında sabaha çıkan her nimet, yalnızca sendendir. Senin ortağın yoktur. Hamd, yalnızca sanadır. Şükür de sanadır.",
            translation_bn: "হে আল্লাহ! যে নি‘আমত আমার সাথে সকালে উপনীত হয়েছে, অথবা আপনার সৃষ্টির অন্য কারও সাথে; এসব নেয়ামত কেবলমাত্র আপনার নিকট থেকেই; আপনার কোনো শরীক নেই। সুতরাং সকল প্রশংসা আপনারই। আর সকল কৃতজ্ঞতা আপনারই প্রাপ্য।",
            translation_ms: "Ya Allah, apa saja nikmat yang kami dapati pagi ini dari mana-mana makhlukMu maka sebenarnya dari Engkau jua. Tidak ada sekutu bagiMu. Puji dan kesyukuran (kami) untukMu.",
            translation_de: "O Allāh, all meine Gaben und die Gaben zu Deinen Geschöpfen an diesem Morgen sind von Dir allein. Du hast keinen Teilhaber. So gebühren al-ḥamd (das Lob) und Dank Dir (allein).",
            translation_es: "¡Oh Allah! Toda la gracia que poseo o posea alguien de Tu creación, proviene de Ti, único sin asociados, para Ti es la alabanza y el agradecimiento.",
            translation_id: "Ya Allah, nikmat yang kuterima atau diterima oleh seseorang di antara makhluk-Mu di pagi ini adalah dari-Mu. Maha Esa Engkau, tiada sekutu bagi-Mu. Bagi-Mu segala puji dan kepada-Mu panjatan syukur (dari seluruh makhluk-Mu).",
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
            // AZKAR-MORNING-DUA-CARD-10-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1: static translations of the dua
            // meaning only (no repeat label, reference, virtue, transliteration, explanation, footnotes/digits, or
            // evening variant). «لا إله إلا أنت» is rendered twice per language, matching the Arabic structure.
            // en=Sunnah Hisn 85; es/id/bn=HisnMuslim item 82; de=Islamische Datenbank Hisnu-l-Muslim Kap.27;
            // fr=Turjman Islam Évocation (full text, shahada twice; replaces the earlier French source); ur=IslamHouse
            // morning azkar; tr=Turkish Hisnul Müslim (morning form); ms=Malaysian Ministry of Education Hisnul Muslim
            // (e-JAUHAR). id keeps the translator's bracketed clarifications as published. NO translation_ar.
            translation_en: "O Allah, grant my body health, O Allah, grant my hearing health, O Allah, grant my sight health. None has the right to be worshipped except You. O Allah, I take refuge with You from disbelief and poverty, and I take refuge with You from the punishment of the grave. None has the right to be worshipped except You.",
            translation_fr: "Ô Allah ! Préserve-moi dans mon corps. Ô Allah ! Préserve-moi dans mon ouïe. Ô Allah ! Préserve-moi dans ma vue. Nulle divinité ne mérite l’adoration hormis Toi. Ô Allah ! j’invoque Ta protection contre la mécréance et la pauvreté. Ô Allah ! J’invoque Ta protection contre le supplice de la tombe. Nulle divinité ne mérite l’adoration hormis Toi.",
            translation_ur: "اے اللہ! مجھے میرے جسم میں عافیت دے، اے اللہ! مجھے میرے کانوں میں عافیت دے، اے اللہ! مجھے میری آنکھوں میں عافیت دے، تیرے علاوہ کوئی عبادت کے لائق نہیں، اے اللہ! میں کفر اور فقر سے تیری پناہ چاہتا ہوں، اور عذاب قبر سے تیری پناہ چاہتا ہوں، تیرے علاوہ کوئی عبادت کے لائق نہیں۔",
            translation_tr: "Allah'ım! Bedenime afiyet ver. Allah'ım! Kulağıma afiyet ver. Allah'ım! Gözüme afiyet ver. Senden başka ilah yok. Allah'ım! Küfürden ve fakirlikten sana sığınırım. Kabir azabından sana sığınırım. Senden başka ilah yok.",
            translation_bn: "হে আল্লাহ! আমাকে নিরাপত্তা দিন আমার শরীরে। হে আল্লাহ! আমাকে নিরাপত্তা দিন আমার শ্রবণশক্তিতে। হে আল্লাহ! আমাকে নিরাপত্তা দিন আমার দৃষ্টিশক্তিতে। আপনি ছাড়া কোনো হক্ব ইলাহ নেই। হে আল্লাহ! আমি আপনার কাছে আশ্রয় চাই কুফুরী ও দারিদ্র্য থেকে। আর আমি আপনার আশ্রয় চাই কবরের আযাব থেকে। আপনি ছাড়া আর কোনো হক্ব ইলাহ নেই।",
            translation_ms: "Ya Allah, kurniakanlah kesihatan pada badanku, Ya Allah, kurniakanlah kesihatan pada pendengaranku, Ya Allah, kurniakanlah kesihatan pada penglihatanku, tiada Tuhan yang berhak disembah melainkan Engkau. Ya Allah, aku berlindung denganMu daripada kekufuran dan kefakiran. Ya Allah aku berlindung denganMu daripada azab kubur, tiada Tuhan yang berhak disembah melainkan Engkau.",
            translation_de: "O Allāh, schenke mir Heil in meinem Körper. O Allāh, schenke mir Heil in meinem Gehör. O Allāh, schenke mir Heil in meinem Sehen. Es gibt keinen wahren Ilāh (Anbetungswürdigen) außer Dir. O Allāh, ich suche Zuflucht bei Dir vor dem Kufr und vor der Armut; und ich suche Zuflucht bei Dir vor der Strafe im Grab. Es gibt keinen wahren Ilāh außer Dir.",
            translation_es: "Oh Allah, concede salud a mi cuerpo, Oh Allah, otorgale salud a mis oídos, Oh Allah, concede salud a mi vista, no hay dios sino Tú. Oh Allah ciertamente me refugio en Ti de la incredulidad, de la pobreza, y en Ti me amparo del tormento de la tumba, no hay dios sino Tú.",
            translation_id: "Ya Allah, selamatkan tubuh-ku (dari penyakit dan yang tidak aku inginkan). Ya Allah, selamatkan pendengaranku (dari penyakit dan maksiat atau sesuatu yang tidak aku inginkan). Ya Allah, selamatkan penglihatanku, tiada Tuhan (yang berhak disembah) kecuali Engkau. Ya Allah!, Sesungguhnya aku berlindung kepada-Mu dari kekufuran dan kefakiran. Aku berlindung kepada-Mu dari siksa kubur, tiada Tuhan (yang berhak disembah) kecuali Engkau.",
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
            // AZKAR-MORNING-DUA-CARD-11-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1: static translations of the dua
            // meaning only (no repeat label, reference, virtue, transliteration, story, footnotes/digits, or evening
            // variant). Card text follows Abu Dawud «غلبة الدين وقهر الرجال»; trusted Hisnul-Muslim sources render the
            // Bukhari wording «ضلع الدين وغلبة الرجال» (equivalent meaning: burden of debt + overpowered by men).
            // en/es/id/bn=HisnMuslim ch.34; fr=Dar Al Athar ch.34; ur=IslamHouse (al-Qahtani booklet); tr=Turkish Hisnul
            // Müslim; ms=Malaysian Ministry of Education Hisnul Muslim (e-JAUHAR); de=Islamische Datenbank ch.34.
            // id keeps the translator's bracketed clarification «(ku)». NO translation_ar.
            translation_en: "O Allah, I take refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and from being over powered by men.",
            translation_fr: "Ô Seigneur! Je me mets sous Ta protection contre les soucis et la tristesse, contre l’incapacité et la paresse, contre l’avarice et la lâcheté, contre le poids de la dette et la domination des hommes.",
            translation_ur: "اے اللہ! میں تیری پناہ مانگتا ہوں حزن و ملال سے، بے بسی و کاہلی سے، بخیلی اور بزدلی سے، قرض کے بوجھ اور لوگوں کے غلبے سے۔",
            translation_tr: "Allahım! Keder ve hüzünden, acizlik ve tembellikten, cimrilik ve korkaklıktan, borcun belimi bükmesinden ve insanların bana galip gelmesinden sana sığınırım.",
            translation_bn: "হে আল্লাহ! নিশ্চয় আমি আপনার আশ্রয় নিচ্ছি দুশ্চিন্তা ও দুঃখ থেকে, অপারগতা ও অলসতা থেকে, কৃপণতা ও ভীরুতা থেকে, ঋণের ভার ও মানুষদের দমন-পীড়ন থেকে।",
            translation_ms: "Ya Allah, aku berlindung denganMu daripada ditimpa kesusahan dan kedukaan, daripada kelemahan dan kemalasan, daripada kedekut dan perasaaan takut dan daripada desakan berhutang dan paksaan orang.",
            translation_de: "O Allāh, ich nehme Zuflucht bei Dir vor der Sorge und Trauer, vor Unfähigkeit und der Trägheit, vor Geiz, vor Feigheit, vor Last der Schulden und davor, von Männern unterdrückt zu werden.",
            translation_es: "Oh Señor me refugio en Ti de las preocupaciones y las tristezas, de la debilidad y la vagancia, de la avaricia y la cobardía, del peso de las deudas y de ser dominado por los hombres.",
            translation_id: "Ya Allah, sesungguhnya aku berlindung kepada-Mu dari keluh kesah dan rasa sedih, dari kelemahan dan kemalasan, dari sifat bakhil dan penakut, dari cengkraman utang dan laki-laki yang menindas-(ku).",
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
            // AZKAR-MORNING-DUA-CARD-12-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1: static translations of the dua
            // meaning only (no repeat label, reference, virtue, hadith-grade note, transliteration, footnotes/digits,
            // explanation, or evening variant). Dhikr text = Quran 9:129 (last verse of At-Tawbah); Hisn al-Muslim 83.
            // en/es/id/bn=HisnMuslim ch.27; fr=Dar Al Athar ch.27; ur=IslamHouse (al-Qahtani booklet, item 17); tr=Turkish
            // Hisnul Muslim; ms=Malaysian Ministry of Education (e-JAUHAR); de=Islamische Datenbank ch.27. de/id/ms keep the
            // source's own inline glosses; ur orthography normalized (heh). NO translation_ar.
            translation_en: "Allah is Sufficient for me, none has the right to be worshipped except Him, upon Him I rely and He is Lord of the exalted throne.",
            translation_fr: "Allah me suffit, il n'y a de divinité que Lui, c'est en Lui que je place ma confiance et Il est le Seigneur du Trône immense.",
            translation_ur: "میرے لیے اللہ کافی ہے۔ اس کے سوا کوئی معبود برحق نہیں۔ میں نے اسی پر بھروسہ کیا اور وہ بڑے عرش کا مالک ہے۔",
            translation_tr: "Yeterli bana Allah, O'ndan başka ibâdete lâyık hiçbir ilah yoktur, O'na tevekkül ettim, O yüce arş'ın Rabbidir.",
            translation_bn: "আল্লাহই আমার জন্য যথেষ্ট, তিনি ছাড়া আর কোনো হক্ব ইলাহ নেই। আমি তাঁর উপরই ভরসা করি। আর তিনি মহান আরশের রব্ব।",
            translation_ms: "Cukuplah Allah (sebagai pelindung) bagiku tiada Tuhan yang berhak disembah melainkan Dia, kepadanyalah aku bertawakkal dan dialah Tuhan yang menguasai Arasy yang agung.",
            translation_de: "Allāh genügt mir. Es gibt keinen wahren Ilāh (Anbetungswürdigen) außer Ihm. Auf Ihn verlasse ich mich; Er ist der Rabb (Herr) des gewaltigen Thrones.",
            translation_es: "Allah me es suficiente, no hay divinidad excepto Él, en Él confío que es el Señor del Trono Magnífico.",
            translation_id: "Cukup bagiku Allah (sebagai pelindung), tiada Tuhan (yang berhak disembah) kecuali Dia. Kepada-Nya aku bertawakkal dan Dia adalah Tuhan 'Arasy yang Agung.",
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
            // AZKAR-MORNING-DUA-CARD-13-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1: static translations of the dua meaning
            // only (no repeat label, reference, virtue, hadith story, isnad/narrator, transliteration, footnotes/digits,
            // explanation, or evening variant). Dhikr = Hisn al-Muslim 84 / Abu Dawud 5074 (+Ibn Majah 3871). en/es/id/bn=
            // HisnMuslim ch.27; fr=Dar Al Athar ch.27; ur=Islamic Urdu Books (Sunan Ibn Majah 3871, dua text only, no isnad);
            // tr=DUAM Turkish dua database (Ebu Dawud); ms=Malaysian Ministry of Education (e-JAUHAR); de=Islamische Datenbank
            // ch.27. tr+de: source explanatory parens stripped; id keeps source glosses; es kept verbatim. NO translation_ar.
            translation_en: "O Allah, I ask You for pardon and well-being in this life and the next. O Allah, I ask You for pardon and well-being in my religious and worldly affairs, and my family and my wealth. O Allah, veil my weaknesses and set at ease my dismay. O Allah, preserve me from the front and from behind and on my right and on my left and from above, and I take refuge with You lest I be swallowed up by the earth.",
            translation_fr: "Ô Seigneur ! Je T'implore de m'accorder Ton pardon et Ta protection dans cette vie et dans l'au-delà. Ô Seigneur ! Je T'implore de m'accorder Ton pardon et Ta protection dans ma religion, ma vie, ma famille et mes biens. Ô Seigneur ! Couvre mes défauts et rassure moi quant aux peurs qui me tiraillent. Ô Seigneur ! Préserve moi de tout ce qui pourrait survenir de devant ou derrière moi, à ma droite, à ma gauche ou au-dessus de moi, et je me réfugie auprès de Ta toute grandeur contre une mort qui surgirait d'en-dessous de moi.",
            translation_ur: "اے اللہ! میں تجھ سے دنیا اور آخرت میں عفو اور عافیت کا طالب ہوں، اے اللہ! میں تجھ سے اپنے دین و دنیا اور اپنے اہل و مال میں معافی اور عافیت کا طالب ہوں، اے اللہ! میرے عیوب چھپا دے، میرے دل کو مامون کر دے، اور میرے آگے پیچھے، دائیں بائیں، اور اوپر سے میری حفاظت فرما، اور میں تیری پناہ چاہتا ہوں نیچے سے ہلاک کئے جانے سے",
            translation_tr: "Allah'ım! Senden dünya ve ahirette af ve afiyet dilerim. Allah'ım! Senden dinim, dünyam, aile fertlerim ve malım hakkında af ve afiyet dilerim. Allah'ım! Ayıplarımı ört, korkularımdan emin kıl. Allah'ım! Beni önümden, arkamdan, sağımdan solumdan ve üstümden koru. Altımdan helak olmaktan senin büyüklüğüne sığınırım.",
            translation_bn: "হে আল্লাহ! আমি আপনার নিকট দুনিয়া ও আখেরাতে ক্ষমা ও নিরাপত্তা প্রার্থনা করছি। হে আল্লাহ! আমি আপনার নিকট ক্ষমা এবং নিরাপত্তা চাচ্ছি আমার দ্বীন, দুনিয়া, পরিবার ও অর্থ-সম্পদের। হে আল্লাহ! আপনি আমার গোপন ত্রুটিসমূহ ঢেকে রাখুন, আমার উদ্বিগ্নতাকে রূপান্তরিত করুন নিরাপত্তায়। হে আল্লাহ! আপনি আমাকে হেফাযত করুন আমার সামনের দিক থেকে, আমার পিছনের দিক থেকে, আমার ডান দিক থেকে, আমার বাম দিক থেকে এবং আমার উপরের দিক থেকে। আর আপনার মহত্ত্বের অসিলায় আশ্রয় চাই আমার নীচ থেকে হঠাৎ আক্রান্ত হওয়া থেকে।",
            translation_ms: "Ya Allah aku memohon kepadaMu keampunan dan kesejahteraan di dunia dan di akhirat Ya Allah aku memohon kepadaMu keampunan dan kesejahteraan pada agamaku, duniaku keluargaku dan hartaku. Ya Allah, tutupkanlah keaibanku dan amankanlah diriku daripada rasa takut. Ya Allah, peliharalah diriku dari hadapan dan belakangku, dari kanan dan kiriku serta dari atasku dan aku berlindung dengan keagunganMu daripada diceroboh di sebelah bawahku.",
            translation_de: "O Allāh, ich bitte Dich um Vergebung und Heil im Diesseits und im Jenseits. O Allāh, ich bitte Dich um Vergebung und Heil in meinem Dīn und in meinem Leben, für meine Angehörigen und in meinem Vermögen. O Allāh, verberge meine Schamteile und gewähre mir Sicherheit vor meiner Furcht. O Allāh, beschütze mich von vorne, von hinten, von rechts und von links und von oben. Ich suche Zuflucht bei Deiner Gewaltigkeit, dass mich Unheil von unten trifft.",
            translation_es: "Oh Allah ciertamente solicito Tu indulgencia y el bienestar en esta vida y en la otra, Oh Allah ciertamente ruego Tu perdón y el bienestar en mis asuntos religiosos, mundanales, mi familia y mis bienes, Oh Allah cubre mi desnudes, y confórtame ante el miedo, Oh Allah protégeme por todas partes, delante y por detrás, a mi derecha e izquierda, sobre mí. Me refugio en tu grandeza de ser engullido por la tierra.",
            translation_id: "Ya Allah, sesungguhnya aku mohon kepada-Mu ampunan dan keselamatan di dunia dan akhirat. Ya Allah sesungguhnya aku mohon kepada-Mu ampunan dan keselamatan: dalam agamaku, (kehidupan) duniaku, keluargaku, hartaku. Ya Allah tutuplah auratku (aib dan sesuatu yang tidak layak di lihat orang lain) dan berilah ketentraman di hatiku. Ya Allah, peliharalah aku dari arah depan, belakang, kanan, kiri dan atasku. Aku berlindung dengan kebesaran-Mu, agar aku tidak mendapat bahaya dari bawahku.",
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
            // AZKAR-MORNING-DUA-CARD-14-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1: static translations of the dua
            // meaning only (no repeat label, reference, virtue, hadith story, isnad/narrator, transliteration,
            // footnotes/digits, explanation, or evening variant). Dhikr = Hisn al-Muslim 85 / Tirmidhi 3392 (+Abu
            // Dawud 5067). en/es/id/bn=HisnMuslim ch.27; fr=Dar Al Athar ch.27; ur=IslamHouse (Adhkar as-Sabah wal-
            // Masa, dua text only, no reference); tr=Islamiokul Turkish Hisnul Muslim (bd.85); ms=Malaysian Ministry
            // of Education (e-JAUHAR); de=Islamische Datenbank ch.27. All nine keep the final clause ("or bringing
            // it upon a Muslim"): ms verbatim (rough phrasing); fr keeps bracketed "(Et je me refugie...)"; de keeps
            // translator glosses (Herr/Satan/...). NO translation_ar.
            translation_en: "O Allah, Knower of the unseen and the seen, Creator of the heavens and the Earth, Lord and Sovereign of all things, I bear witness that none has the right to be worshipped except You. I take refuge in You from the evil of my soul and from the evil and shirk of the devil, and from committing wrong against my soul or bringing such upon another Muslim.",
            translation_fr: "Ô Seigneur ! Toi qui connais parfaitement l'invisible et le visible ! Créateur des cieux et de la terre ! Maître et Possesseur de toute chose ! J'atteste qu'il n'est d'autre divinité méritant l'adoration en dehors de Toi. Je me réfugie auprès de Toi contre le mal de mon âme, contre celui du diable et de son incitation à T'attribuer un associé. (Et je me réfugie auprès de Toi) contre tout méfait que je pourrais perpétrer envers moi-même ou envers autrui.",
            translation_ur: "اے اللہ! اے غیب اور حاضر کے جاننے والے، آسمانوں اور زمین کو پیدا کرنے والے، ہر چیز کے پروردگار اور مالک! میں شہادت دیتا ہوں کہ تیرے علاوہ کوئی عبادت کے لائق نہیں، میں تیری پناہ مانگتا ہوں اپنے نفس کے شر سے اور شیطان کے شر اور اس کے شرک سے، اور اس بات سے کہ میں اپنے نفس پر برائی کا ارتکاب کروں یا کسی مسلمان کے لئے برائی کا سبب بنوں۔",
            translation_tr: "Gizli ve âşikarı bilen, göklerin ve yerin yaratıcısı Allahım! Her şeyin Rabbi ve sahibi! Senden başka hakkıyla ibâdete lâyık hiçbir ilah olmadığına şehâdet ederim. Nefsimin şerrinden sana sığınırım. Şeytan ve şirkinin şerrinden, nefsime kötülük etmekten veya o kötülüğü bir müslümana götürmekten sana sığınırım.",
            translation_bn: "হে আল্লাহ! হে গায়েব ও উপস্থিতের জ্ঞানী, হে আসমানসমূহ ও যমীনের স্রষ্টা, হে সব কিছুর রব্ব ও মালিক! আমি সাক্ষ্য দিচ্ছি যে, আপনি ছাড়া আর কোনো হক্ব ইলাহ নেই। আমি আপনার কাছে আশ্রয় চাই আমার আত্মার অনিষ্ট থেকে, শয়তানের অনিষ্টতা থেকে ও তার শির্ক বা তার ফাঁদ থেকে, আমার নিজের উপর কোনো অনিষ্ট করা, অথবা কোনো মুসলিমের দিকে তা টেনে নেওয়া থেকে।",
            translation_ms: "Ya Allah, Tuhan yang mengetahui perkara ghaib dan nyata, Pencipta langit dan bumi, Tuhan setiap sesuatu dan Pemiliknya, aku mengaku bahawa Tiada Tuhan yang berhak disembah melainkan Engkau, aku berlindung denganMu daripada kejahatan diriku dan kejahatan syaitan dan sekutunya dan aku berlindung dan tidak pada berusaha untuk melakukan kejahatan terhadap diriku atau aku mendorong orang Islam melakukannya.",
            translation_de: "O Allāh, Kenner des Verborgenen und des Offenkundigen, Erschaffer der Himmel und der Erde, Rabb (Herr) und Besitzer aller Dinge. Ich bezeuge, dass es keinen wahren Ilāh (Anbetungswürdigen) außer Dir gibt. Ich nehme Zuflucht bei Dir vor meiner üblen Seele und vor dem Übel des Šaiṭān (Satan) und dessen Širk (Beigesellung), und dass ich Unrecht gegen meine Seele oder gegen einen anderen Muslim handele.",
            translation_es: "Oh Allah, Conocedor de lo oculto y lo manifiesto, Creador de los cielos y de la tierra, Señor de los ángeles y de todas las cosas, atestiguo que no hay divinidad sino Tu, me refugio en Ti del mal de mi mismo, del mal del Sheitan y de su idolatría, y de cometer mal en contra de mi mismo, o en contra de un musulmán.",
            translation_id: "Ya Allah, Yang Maha Mengetahui yang ghaib dan yang nyata. Wahai Tuhan Pencipta langit dan bumi, Tuhan segala sesuatu yang merajainya. Aku bersaksi bahwa tiada tuhan yang berhak disembah kecuali Engkau. Aku berlindung kepada-Mu dari kejahatan diriku, setan dan bala tentaranya, atau aku menjalankan kejelekan terhadap diriku atau mendorong orang Islam padanya.",
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
            // AZKAR-MORNING-DUA-CARD-15-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1: static translations of the dua
            // meaning only (no repeat label, reference, virtue, hadith story, isnad/narrator, transliteration,
            // footnotes/digits, explanation, or evening variant). Dhikr = Hisn al-Muslim 86 / Ibn Majah 3869 (+Abu
            // Dawud 5088, Tirmidhi 3388). All nine keep BOTH divine names (As-Samee/All-Hearing + Al-Alim/All-Knowing).
            // en/id/tr=HadeethEnc hadith 6093 (dhikr quote only — HisnMuslim en mistranslates As-Samee as "All-Seeing",
            // HisnMuslim id drops it, Islamiokul tr has no standalone meaning); es/bn=HisnMuslim ch.27; fr=Dar Al Athar;
            // ms=Malaysian Ministry of Education (e-JAUHAR); de=Islamische Datenbank ch.27; ur=IslamHouse (Adhkar as-
            // Sabah wal-Masa). The virtue stays in the separate virtue field. NO translation_ar.
            translation_en: "In the name of Allah, with Whose name nothing in the earth or the heaven can cause harm, and He is the All-Hearing, the All-Knowing.",
            translation_fr: "Au Nom d'Allah dont la mention empêche toute chose de nuire, tant sur la terre que dans le ciel, et Il est l'Audient et l'Omniscient.",
            translation_ur: "اس اللہ کے نام کے ساتھ جس کے نام کے ساتھ زمین وآسمان میں کوئی چیز نقصان نہیں پہنچاتی، اور وہ خوب سننے والا بڑا جاننے والا ہے۔",
            translation_tr: "Yerde de gökte de O'nun ismiyle birlikte hiçbir şeyin zarar veremeyeceği Allah'ın adıyla. O, her şeyi işiten ve bilendir.",
            translation_bn: "আল্লাহর নামে; যাঁর নামের সাথে আসমান ও যমীনে কোনো কিছুই ক্ষতি করতে পারে না। আর তিনি সর্বশ্রোতা, মহাজ্ঞানী।",
            translation_ms: "Dengan Nama Allah yang tidak memberi mudharat bersama namaNya oleh sesuatu di bumi dan tidak juga di langit, Dialah Yang Maha Mendengar lagi Maha Mengetahui.",
            translation_de: "Im Namen Allāhs, mit Dessen Namen kann nichts auf der Erde oder im Himmel Schaden zufügen. Er ist der Allhörende, der Allwissende.",
            translation_es: "En el nombre de Allah el cual en su nombre nada perjudica, asi en la tierra como en los cielos, Él es quien todo lo oye el Omnisapiente.",
            translation_id: "Dengan nama Allah yang tidak akan berbahaya sesuatu pun di bumi dan di langit bersama nama-Nya, dan Dia Maha Mendengar lagi Maha Mengetahui.",
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
            // AZKAR-MORNING-DUA-CARD-16-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1: static translations of the dua
            // meaning only (no repeat label, reference, virtue/promise, hadith story, isnad/narrator, transliteration,
            // footnotes/digits, explanation, or evening variant). Dhikr = Hisn al-Muslim 87 / Ibn Majah 3870 (+Ahmad
            // 4/337, Nasai Amal 4, Ibn as-Sunni 68, Abu Dawud 5072, Tirmidhi 3389). All nine preserve the three
            // meanings: Allah as Lord + Islam as religion + Muhammad as Prophet (Nabi, NOT Messenger/Rasul).
            // Sources: en/es/id/bn=HisnMuslim ch.27; fr=Dar Al Athar 87; tr=Turkish Hisn al-Muslim ch.27 87 (Islamiokul
            // carries only the adhan Rasul form, so it is not used); ms=Malaysian Ministry of Education (e-JAUHAR) 87;
            // de=Islamische Datenbank ch.27 87; ur=IslamHouse. HadeethEnc NOT used (it lacks the morning/evening Nabi
            // version, only the Rasul/Messenger one). Salawat kept where the source has it (ur/tr/bn/ms/de/es) and NOT
            // added where the source omits it (en/fr/id). ms fixes source typo lslam to Islam; id resolves the -(ku)
            // notation to natural Tuhanku/agamaku/nabiku. The virtue/promise stays in the separate virtue field. NO translation_ar.
            translation_en: "I am pleased with Allah as a Lord, and Islam as a religion and Muhammad as a Prophet.",
            translation_fr: "Je reconnais Allah en tant que Seigneur, l'Islam en tant que religion et Muhammad en tant que Prophète.",
            translation_ur: "میں راضی ہو گیا اللہ کے رب ہونے پر اور اسلام کو دین اختیار کرنے پر اور محمدﷺ کو نبی تسلیم کرنے پر۔",
            translation_tr: "Rab olarak Allah'tan, dîn olarak İslam'dan, nebi olarak Muhammed -sallallahu aleyhi ve sellem-'den râzı oldum.",
            translation_bn: "আল্লাহকে রব, ইসলামকে দীন ও মুহাম্মাদ সাল্লাল্লাহু আলাইহি ওয়াসাল্লামকে নবীরূপে গ্রহণ করে আমি সন্তুষ্ট।",
            translation_ms: "Aku redha Allah sebagai Tuhan, Islam sebagai agama dan Muhammad saw sebagai Nabi.",
            translation_de: "Ich bin mit Allāh als Rabb (Herr), dem Islām als Dīn (Glauben) und Muḥammad, Allāh segne ihn gebe ihm Heil, als Prophet zufrieden.",
            translation_es: "Me complazco de Allah como Señor, del Islam como religión, y de Muhámmad (la paz y las bendiciones de Allah sean con él) como Profeta.",
            translation_id: "Aku rela Allah sebagai Tuhanku, Islam sebagai agamaku dan Muhammad sebagai nabiku.",
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
            // AZKAR-MORNING-DUA-CARD-17-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1: static translations of the dua
            // meaning only (no repeat label, reference, hadith story, the advice-to-Fatimah narration, ruling, isnad,
            // transliteration of the whole dhikr, footnotes/digits, explanation, or evening variant). This is a du-a with
            // NO salawat in the matn. Dhikr = Hisn al-Muslim 88 / Al-Hakim 1/545 / Sahih at-Targhib 1/273 (also Tirmidhi
            // 3524, which supports the card source «رواه الترمذي» — source stays unchanged, virtue stays null). All nine
            // preserve the three meanings: Ya Hayyu Ya Qayyum + by Your mercy I seek relief + set right all my affairs and
            // do not leave me to myself for the blink of an eye. Sources: en/es/id/bn=HisnMuslim ch.27 88; fr=Dar Al Athar
            // 88; ur=Mukhtasar Hisn al-Muslim 99 (Islamic Urdu Books, since the saved IslamHouse booklet lacked this item);
            // tr=Turkish Hisn al-Muslim ch.27 — «Ya Hayy, Ya Kayyum» is the conventional invocation of
            // the two divine names (kept like Allah), NOT a whole-dhikr transliteration; Islamiokul carries a different Ya
            // Hayy Ya Kayyum dua (asking Paradise) so it is not used; de=Islamische Datenbank 88. Approved source-fix: ms
            // «biarkankan»->«biarkan» (doubled suffix typo). Clarifying glosses kept verbatim: es (un instante), de (bei
            // Dir), id (semua urusan). NO translation_ar.
            translation_en: "O Ever Living, O Self-Subsisting and Supporter of all, by Your mercy I seek assistance, rectify for me all of my affairs and do not leave me to myself, even for the blink of an eye.",
            translation_fr: "Ô Vivant ! Ô Toi qui es le Seul à être imploré pour ce que nous désirons ! C'est à Ta miséricorde que j'en appelle. Améliore ma situation et ne me livre pas à moi-même, ne serait-ce qu'un seul instant.",
            translation_ur: "اے ہمیشہ زندہ رہنے والے، اے قائم رکھنے والے، تیری رحمت کے ساتھ ہی میں مدد مانگتا ہوں، میری مکمل حالت درست فرما دے، اور مجھے لحظہ بھر بھی میرے نفس کے سپرد نہ کر۔",
            translation_tr: "Ya Hayy, Ya Kayyûm! Senin rahmetinle yardım dilerim. Bütün işlerimi düzelt ve göz açıp kapayınca kadar -bile olsa- beni nefsime bırakma.",
            translation_bn: "হে চিরঞ্জীব, হে চিরস্থায়ী! আমি আপনার রহমতের অসীলায় আপনার কাছে উদ্ধার কামনা করি, আপনি আমার সার্বিক অবস্থা সংশোধন করে দিন, আর আমাকে আমার নিজের কাছে নিমেষের জন্যও সোপর্দ করবেন না।",
            translation_ms: "Wahai tuhan yang Tetap Hidup, Yang Kekal memerintah selama-lamanya, dengan rahmatMu aku memohon pertolongan. Perelokkanlah bagiku segala urusanku dan janganlah Engkau biarkan nasibku ditentukan oleh diriku sendiri walaupun sekadar sekelip mata.",
            translation_de: "O Lebendiger und Beständiger. Ich suche Zuflucht (bei Dir) mit Deiner Barmherzigkeit. Verbessere all meine Angelegenheiten. Überlass mir keinen Augenblick eine meiner Angelegenheiten.",
            translation_es: "Oh Viviente, Oh Subsistente, en Tu misericordia busco asistencia, rectifica todos mis asuntos y no me dejes librado a mi mismo, ni siquiera por un pestañeo (un instante).",
            translation_id: "Wahai Yang Maha Hidup dan Maha Terjaga, dengan rahmat-Mu aku minta pertolongan, perbaikilah segala urusanku dan jangan Engkau limpahkan (semua urusan) terhadap diriku walau sekejap mata.",
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
            // AZKAR-MORNING-DUA-CARD-18-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1: static translations of the MORNING dua
            // meaning only (no repeat label, reference, hadith story, isnad, transliteration, footnotes/digits, explanation,
            // evening variant, or the evening-instruction footnote). MORNING form only (asbahna / this day) — NOT the evening
            // (amsayna / this night). Dhikr = Hisn al-Muslim 89 / Abu Dawud 4/322 (5076) (Abu Malik al-Ashari); it is NOT the
            // longer tahlil hadith (Muslim: ...wal-hamdu lillah, la ilaha illallah...), so HadeethEnc is NOT used (it only has
            // that tahlil version). All nine keep the FIVE goodness elements: fath(conquest)+nasr(victory)+nur(light)+
            // baraka(blessing)+huda(guidance), plus refuge from the evil in it and after it. Sources: en/bn=HisnMuslim ch.27
            // 89; fr=Dar Al Athar 89 (evening brackets [ou au soir] removed); de=Islamische Datenbank 89; ms=e-JAUHAR (evening
            // (petang) + evening-instruction removed; typos pembukaannya/pertolongannya fixed); ur=Mukhtasar Hisn al-Muslim
            // 100; tr=Turkish Hisnul Muslim (Ilme Davet Dernegi) — explicit five elements, no gloss; es=La Fortaleza del
            // Musulman Spanish 91 (keeps su victoria for nasr, NOT su fin; item number + evening note removed; Al-Lah kept);
            // id=published Indonesian dhikr source (Abu Malik al-Ashari / Abu Dawud) with the full opening + five elements
            // (honorific SWT normalized to Allah). NO translation_ar.
            translation_en: "We have reached the morning and at this very time all sovereignty belongs to Allah, Lord of the worlds. O Allah, I ask You for the good of this day, its triumphs and its victories, its light and its blessings and its guidance, and I take refuge in You from the evil of this day and the evil that follows it.",
            translation_fr: "Nous voilà au matin et le règne appartient à Allah, le Seigneur de l'univers. Ô Seigneur ! Je Te demande le bien de ce jour : ce qu'il contient comme conquêtes, victoires, lumière, bénédiction et guidée. Je me mets sous Ta protection contre le mal de ce jour et le mal qui vient après lui.",
            translation_ur: "ہم نے صبح کی اور اللہ رب العالمین کے لئے (بادشاہت) نے بھی صبح کی، اے اللہ! میں تجھ سے اس دن کی بھلائی، فتح، نصرت، نور، برکت اور اس کی ہدایت کا سوال کرتا ہوں اور اس پر جو شر ہے اور اس کے بعد جو شر ہے اس سے تیری پناہ میں آتا ہوں۔",
            translation_tr: "Mülk, Âlemlerin Rabbi Allah'ın olduğu halde sabahladık. Allahım! Senden bu günün hayrını, fethini, zaferini, nûrunu, bereketini ve hidâyetini dilerim. Onda ve sonrasındaki şerden sana sığınırım.",
            translation_bn: "আমরা সকালে উপনীত হয়েছি, অনুরূপ যাবতীয় রাজত্বও সকালে উপনীত হয়েছে সৃষ্টিকুলের রব্ব আল্লাহর জন্য। হে আল্লাহ! আমি আপনার কাছে কামনা করি এই দিনের কল্যাণ: বিজয়, সাহায্য, নূর, রবকত ও হেদায়াত। আর আমি আপনার কাছে আশ্রয় চাই এ দিনের এবং এ দিনের পরের অকল্যাণ থেকে।",
            translation_ms: "Kami hayati pagi kami dan pagi yang penuh Kekuasaan bagi Allah tuhan sekalian alam. Ya Allah, aku memohon kepadaMu kebaikan hari ini, pembukaannya, pertolongannya, cahayanya, berkatnya dan petunjuknya. Aku berlindung denganMu daripada kejahatan hari ini dan yang selepasnya.",
            translation_de: "Wahrlich haben wir den Morgen erreicht, und die Herrschaft an diesem Morgen gehört Allāh, dem Rabb (Herr) der Welten. O Allāh, ich bitte Dich um das Gute dieses Tages, seinen Sieg, seine Hilfe (Unterstützung), sein Licht, seine Segnung und seine Rechtleitung. Ich suche Zuflucht bei Dir vor dem Übel an ihm (diesem Tag) und alldem, was danach kommt.",
            translation_es: "Amanecimos y amaneció el reino para Al-Lah Señor del universo, ¡Oh Al-Lah! Te pido lo mejor de este día: su triunfo, su victoria, su luz, su bendición y su guía; me protejo en Ti del mal que haya en él y después de él.",
            translation_id: "Kami telah berada di pagi hari dan kekuasaan ini hanyalah milik Allah, Tuhan semesta Alam. Ya Allah aku memohon kebaikan hari ini kepada-Mu, kemenangan, pertolongan, cahaya, keberkahan, dan petunjuknya. Aku juga berlindung kepada-Mu dari keburukannya dan keburukan sesudahnya.",
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
            // Card 19 (morning-019) — per-language trusted-source meaning translations (salawat kept/omitted per source).
            translation_en: "We rise upon the fitrah of Islam, and the word of pure faith, and upon the religion of our Prophet Muhammad and upon the religion of our forefather Ibraheem, who was a Muslim and of true faith and was not of those who associate others with Allah.",
            translation_fr: "Nous voici au matin, et en nous se trouve la nature première qui est l'Islam, en nous, la parole du monothéisme ; nous sommes dans la religion de notre Prophète Muhammad (صلى الله عليه وسلم) et sur la voie de notre père Abraham qui vouait son culte exclusivement à Allah, soumis à Lui, et n'était point du nombre des associateurs.",
            translation_ur: "ہم نے فطرت اسلام اور کلمہ اخلاص اور نبی محمدﷺ کے دین اور اپنے باپ ابراہیم علیہ السلام کی ملت پر صبح کی جو یک طرفہ خالص مسلمان تھے، اور وہ مشرکوں میں سے نہیں تھے۔",
            translation_tr: "İslâm fıtratı, ihlas kelimesi ve Nebîmiz Muhammed -sallallahu aleyhi ve sellem-'in dini üzere; hanif ve müslüman olan, müşriklerden olmayan babamız İbrahim'in milleti üzere sabaha eriştik.",
            translation_bn: "আমরা সকালে উপনীত হয়েছি ইসলামের ফিত্বরাতের ওপর, নিষ্ঠাপূর্ণ বাণী (তাওহীদ) এর ওপর, আমাদের নবী মুহাম্মাদ সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম-এর দীনের ওপর, আর আমাদের পিতা ইব্রাহীম আলাইহিস সালাম-এর মিল্লাতের ওপর—যিনি ছিলেন একনিষ্ঠ মুসলিম এবং যিনি মুশরিকদের অন্তর্ভুক্ত ছিলেন না।",
            translation_ms: "Kami hayati pagi ini di atas landasan fitrah dan perwatakan Islam, berpegang kepada kalimah ikhlas, dan berpegang kepada agama Nabi kami Muhammad SAW yang juga agama ayah kami Ibrahim, yang berada di atas jalan yang lurus, muslim dan tidak tergolong dari kalangan orang-orang musyrik.",
            translation_de: "Wir sind mit der Fitrah (natürliche Veranlagung) des Islam in den Morgen eingetreten, und mit dem Wort der Aufrichtigkeit und mit der Religion unseres Propheten Muhammad und der Religion unseres Vaters Ibrahim, der ein Anhänger des rechten Glaubens war, einer, der sich Allah ergeben hat, und er gehörte nicht zu den Götzendienern.",
            translation_es: "Amanecimos en la naturaleza del Islam, en la palabra del monoteísmo, en la religión de nuestro profeta Mujammad (La paz y las bendiciones de Al-Lah sean con él) en la comunidad de Abraham monoteístas, musulmán y no era de los idolatras",
            translation_id: "Kami berada di waktu pagi di atas fitrah Islam, di atas kalimat ikhlas, di atas agama Nabi kami Muhammad ﷺ, dan di atas millah (ajaran) bapak kami Ibrahim yang lurus, seorang muslim, dan beliau tidak termasuk dari golongan orang-orang musyrik.",
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
            // Card 20 (morning-020) — short-form tahlil, per-language trusted-source meaning translations (NO «يحيي ويميت»; virtue stays a separate field).
            translation_en: "None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise, and He is over all things omnipotent.",
            translation_fr: "Il n'y a aucune divinité [digne d'être adorée] en dehors d'Allah, Seul, sans associé. À Lui la royauté, à Lui la louange et Il est capable de toute chose.",
            translation_ur: "اللہ کے علاوہ کوئی عبادت کے لائق نہیں، وہ اکیلا ہے، اس کا کوئی شریک نہیں، اسی کے لئے ملک ہے، اور اسی کے لئے حمد ہے اور وہ ہر چیز پر قادر ہے۔",
            translation_tr: "Allah'tan başka hakkıyla ibâdete lâyık hiçbir ilah yoktur. O, birdir ve hiçbir ortağı yoktur. Mülk O'nundur, hamd da O'nadır. O, her şeye gücü yetendir.",
            translation_bn: "একমাত্র আল্লাহ ছাড়া কোনো হক্ব ইলাহ নেই, তাঁর কোনো শরীক নেই, রাজত্ব তাঁরই, সমস্ত প্রশংসাও তাঁর, আর তিনি সকল কিছুর উপর ক্ষমতাবান।",
            translation_ms: "Tidak ada Tuhan yang berhak disembah selain Allah semata, tidak ada sekutu bagi-Nya. Bagi-Nya kerajaan dan segala pujian. Dia-lah yang berkuasa atas segala sesuatu.",
            translation_de: "Es gibt keine Gottheit außer Allah, Dem Einzigen, Der keinen Partner hat. Sein sind die Herrschaft und das Lob, und Er ist über alle Dinge mächtig.",
            translation_es: "No hay divinidad salvo Allah, único, sin asociado, Suyo es el Reino y Suya es la alabanza y es sobre toda cosa Poderoso.",
            translation_id: "Tidak ada ilah yang berhak disembah selain Allah semata, tidak ada sekutu bagi-Nya. Milik Allah kerajaan dan segala pujian. Dia-lah yang berkuasa atas segala sesuatu.",
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
            // Card 21 (morning-021) — short-form tasbih «سبحان الله وبحمده», per-language trusted-source meaning translations (tasbih + hamd only; NO «العظيم»/longer form; virtue stays a separate field).
            translation_en: "How perfect Allah is and I praise Him.",
            translation_fr: "Gloire, pureté et louange à Allah.",
            translation_ur: "اللہ پاک ہے اور اپنی تعریف کے ساتھ ہے۔",
            translation_tr: "Hamdederek Allah'ı tüm noksanlıklardan tenzih ederim.",
            translation_bn: "আমি আল্লাহর প্রশংসাসহ পবিত্রতা ও মহিমা ঘোষণা করছি।",
            translation_ms: "Mahasuci Allah, aku memuji-Nya.",
            translation_de: "Gepriesen sei Allah und Lob sei Ihm.",
            translation_es: "Glorificado sea Allah y Alabado sea.",
            translation_id: "Maha Suci Allah dan segala puji (bagi-Nya).",
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
            // Card 22 (morning-022) — full 4-measures tasbih «سبحان الله وبحمده عدد خلقه…», per-language trusted-source meaning translations (preserve عدد خلقه/رضا نفسه/زنة عرشه/مداد كلماته; NOT the Card-21 short form; Juwayriyah story/repeat stay out).
            translation_en: "How perfect Allah is and I praise Him by the number of His creation and His pleasure, and by the weight of His throne, and the ink of His words.",
            translation_fr: "Gloire, pureté et louange à Allah, autant que le nombre de Ses créatures, autant de fois qu'il le faut pour Le satisfaire, d'un nombre égal au poids de Son Trône et au nombre indéterminé de Ses paroles.",
            translation_ur: "اللہ پاک ہے اور اپنی تعریف کے ساتھ ہے، اپنی مخلوق کی گنتی کے برابر، اپنے نفس کی رضامندی کے برابر، اپنے عرش کے وزن کے برابر، اور اپنے کلمات کی روشنائی کے برابر۔",
            translation_tr: "Yarattıklarının sayısınca, kendisinin râzı olacağı kadar, arşının ağırlığı ve kelimelerinin çokluğunca hamdederek Allah'ı tüm noksanlıklardan tenzih ederim.",
            translation_bn: "আমি আল্লাহর প্রশংসাসহ পবিত্রতা ও মহিমা ঘোষণা করছি— তাঁর সৃষ্ট বস্তুসমূহের সংখ্যার সমান, তাঁর নিজের সন্তোষের সমান, তাঁর আরশের ওজনের সমান ও তাঁর বাণীসমূহ লেখার কালি পরিমাণ।",
            translation_ms: "Mahasuci Allah, aku memuji-Nya sebanyak makhluk-Nya, sejauh kerelaan-Nya, seberat timbangan Arsy-Nya, dan sebanyak tinta tulisan kalimat-Nya.",
            translation_de: "Gepriesen sei Allah und Lob sei Ihm gemäß der Anzahl Seiner Geschöpfe und Seines Wohlgefallens und mit dem Gewicht Seines Thrones und der Tinte Seiner Worte.",
            translation_es: "Glorificado sea Allah y alabado sea por el número de cuanto ha creado, por su Complacencia, por el peso de Su Trono y por la tinta de sus palabras.",
            translation_id: "Maha Suci Allah, aku memuji-Nya sebanyak makhluk-Nya, sejauh kerelaan-Nya, seberat timbangan 'Arasy-Nya dan sebanyak tinta tulisan kalimat-Nya.",
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
            // Card 23 (morning-023) — du'a «اللهم إني أسألك علمًا نافعًا…», per-language trusted-source meaning translations (preserve 3: علم نافع/رزق طيب/عمل متقبل; رزق=provision NOT money; Ibn-Majah ref + after-Fajr context + sanad stay out).
            translation_en: "O Allah, I ask You for knowledge which is beneficial and sustenance which is good, and deeds which are acceptable.",
            translation_fr: "Ô Allah ! Je Te demande [de m'accorder] un savoir utile, une subsistance licite et des œuvres que Tu agrées.",
            translation_ur: "اے اللہ! میں تجھ سے نفع دینے والے علم اور پاکیزہ رزق اور قابل قبول عمل کا سوال کرتا ہوں۔",
            translation_tr: "Allahım! Senden, faydalı bir ilim, temiz bir rızık ve makbul bir amel dilerim.",
            translation_bn: "হে আল্লাহ! আমি আপনার নিকট উপকারী জ্ঞান, পবিত্র রিযিক এবং কবুলযোগ্য আমল প্রার্থনা করি।",
            translation_ms: "Ya Allah, sungguh aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang halal dan amal yang diterima.",
            translation_de: "O Allah, ich bitte dich um nützliches Wissen, gute Versorgung und angenommene Taten.",
            translation_es: "Oh Señor te ruego un conocimiento beneficioso, un sustento agradable y la aceptación de las obras.",
            translation_id: "Ya Allah, sesungguhnya aku mohon kepada-Mu ilmu yang bermanfaat, rezki yang baik dan amal yang diterima.",
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
            // Card 24 (morning-024) — istighfar «أستغفر الله وأتوب إليه», per-language trusted-source meaning translations (preserve 2: seeking forgiveness + repentance to Him; Bukhari ref + repeat + sanad stay out; no «العظيم»/longer form; fr=Dar Al Athar not Hisnii; ms=bertaubat/id=bertobat).
            translation_en: "I seek Allah's forgiveness and I turn to Him in repentance.",
            translation_fr: "J'implore le pardon d'Allah et à Lui je me repens.",
            translation_ur: "میں اللہ سے مغفرت طلب کرتا ہوں اور اس کے حضور توبہ کرتا ہوں۔",
            translation_tr: "Allah'tan mağfiret diler ve O'na tevbe ederim.",
            translation_bn: "আমি আল্লাহর কাছে ক্ষমা প্রার্থনা করছি এবং তাঁর নিকটই তাওবা করছি।",
            translation_ms: "Aku memohon ampun kepada Allah dan bertaubat kepada-Nya.",
            translation_de: "Ich bitte Allah um Vergebung und ich bereue bei Ihm.",
            translation_es: "Te pido perdón y a Ti vuelvo arrepentido.",
            translation_id: "Aku memohon ampun kepada Allah dan bertobat kepada-Nya.",
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
            // Card 25 (morning-025) — salawat «اللهم صل وسلم على نبينا محمد» (Hisn al-Muslim short form), per-language trusted-source meaning translations (preserve 4: ask Allah + salat/blessings + salam/peace + our Prophet Muhammad; NO Ibrahimi/longer salawat; virtue + repeat + sanad stay out; fr=Dar Al Athar; ur=Talaqqi; ms=Zikir).
            translation_en: "O Allah, send prayers and peace upon our Prophet Muhammad.",
            translation_fr: "Ô Seigneur ! Accorde Tes bénédictions et la paix à notre Prophète Muhammad.",
            translation_ur: "اے اللہ، ہمارے نبی محمد صلی اللہ علیہ وسلم پر درود و سلام بھیج۔",
            translation_tr: "Allahım! Peygamberimiz Muhammed'e salât ve selâm eyle.",
            translation_bn: "হে আল্লাহ! আপনি সালাত ও সালাম পেশ করুন আমাদের নবী মুহাম্মাদের উপর।",
            translation_ms: "Ya Allah, limpahkan selawat dan salam atas Nabi kami Muhammad.",
            translation_de: "O Allah, Segen und Frieden auf unserem Propheten Muhammad.",
            translation_es: "Oh Señor, concede paz y bendiciones a nuestro Profeta Muhammad.",
            translation_id: "Ya Allah, (sampaikanlah) shalawat dan salam kepada Nabi kami Muhammad.",
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
            // AZKAR-EVENING-PAGE-UI-LOCALIZATION-AND-QURAN-TRANSLATIONS-ALL-LANGUAGES-1: Ayat al-Kursi translation shown ABOVE
            // the Arabic in each non-Arabic UI (lang!=='ar'). COPIED VERBATIM from morning-001 (Arabic byte-identical);
            // en = Saheeh International, 8 others = QuranEnc static (NO runtime). tr omits transliterated Basmala.
            translation_en: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is [presently] before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
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
            // AZKAR-EVENING-PAGE-UI-LOCALIZATION-AND-QURAN-TRANSLATIONS-ALL-LANGUAGES-1: Surah Al-Ikhlas translation shown ABOVE
            // the Arabic in each non-Arabic UI (lang!=='ar'). COPIED VERBATIM from morning-002 (Arabic byte-identical);
            // en = Saheeh International, 8 others = QuranEnc static (NO runtime). tr omits transliterated Basmala.
            translation_en: "In the name of Allah, the Entirely Merciful, the Especially Merciful. Say, \"He is Allah, [who is] One, Allah, the Eternal Refuge. He neither begets nor is born, Nor is there to Him any equivalent.\"",
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
            // AZKAR-EVENING-PAGE-UI-LOCALIZATION-AND-QURAN-TRANSLATIONS-ALL-LANGUAGES-1: Surah Al-Falaq translation shown ABOVE
            // the Arabic in each non-Arabic UI (lang!=='ar'). COPIED VERBATIM from morning-003 (Arabic byte-identical);
            // en = Saheeh International, 8 others = QuranEnc static (NO runtime). tr omits transliterated Basmala.
            translation_en: "In the name of Allah, the Entirely Merciful, the Especially Merciful.\n\nSay, \"I seek refuge in the Lord of daybreak\nFrom the evil of that which He created\nAnd from the evil of darkness when it settles\nAnd from the evil of the blowers in knots\nAnd from the evil of an envier when he envies.\"",
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
            // AZKAR-EVENING-PAGE-UI-LOCALIZATION-AND-QURAN-TRANSLATIONS-ALL-LANGUAGES-1: Surah An-Nas translation shown ABOVE
            // the Arabic in each non-Arabic UI (lang!=='ar'). COPIED VERBATIM from morning-004 (Arabic byte-identical);
            // en = Saheeh International, 8 others = QuranEnc static (NO runtime). tr omits transliterated Basmala.
            translation_en: "In the name of Allah, the Entirely Merciful, the Especially Merciful.\n\nSay, \"I seek refuge in the Lord of mankind,\nThe Sovereign of mankind.\nThe God of mankind,\nFrom the evil of the retreating whisperer -\nWho whispers [evil] into the breasts of mankind -\nFrom among the jinn and mankind.\"",
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
            // AZKAR-EVENING-DUA-CARD-05-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1: per-language MEANING translation (EVENING form — this night) shown ABOVE the Arabic in each non-ar UI; trusted Hisn al-Muslim / Sahih Muslim (2723, Ibn Mas'ud) sources per the approved source audit. No Arabic translation is added; the Arabic dhikr, source and repeat stay unchanged.
            translation_en: "We have reached the evening and at this very time unto Allah belongs all sovereignty, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise and He is over all things omnipotent. My Lord, I ask You for the good of this night and the good of what follows it and I take refuge in You from the evil of this night and the evil of what follows it. My Lord, I take refuge in You from laziness and senility. My Lord, I take refuge in You from torment in the Fire and punishment in the grave.",
            translation_fr: "Nous voilà au soir et le règne appartient à Allah. Louange à Allah, Il n'y a aucune divinité [digne d'être adorée] en dehors d'Allah, Seul, sans associé. À Lui la royauté, à Lui la louange et Il est capable de toute chose. Seigneur ! Je Te demande le bien que contient cette nuit et le bien qui vient après. Et je cherche refuge auprès de Toi contre le mal que contient cette nuit et le mal qui vient après. Seigneur ! Je cherche refuge auprès de Toi contre la paresse et les maux de la vieillesse. Je cherche refuge auprès de Toi contre le châtiment de l'Enfer et contre les tourments de la tombe.",
            translation_ur: "ہم نے شام کی اور اللہ کی بادشاہت کو دوام حاصل رہا۔ تمام تعریفیں اللہ کے لیے ہیں اور اللہ کے سوا کوئی الٰہ نہیں۔ وہ اکیلا ہے، اُس کا کوئی شریک نہیں۔ بادشاہی اسی کی ہے اور ہر قسم کی حمد بھی اُسی کے لیے ہے اور وہ ہر چیز پر قدرت رکھتا ہے۔ اے میرے رب! میں تجھ سے اِس رات کی بھلائی چاہتا ہوں اور اُس کی بھی جو اس کے بعد ہے۔ اور اس رات کی برائی سے تیری پناہ مانگتا ہوں اور اُس سے بھی جو اس کے بعد ہے۔ اے رب! میں سستی سے اور بڑھاپے کی برائی سے تیری پناہ مانگتا ہوں۔ اے رب! میں جہنم اور قبر کے عذاب سے تیری پناہ چاہتا ہوں۔",
            translation_tr: "Akşama ulaştık, mülk de Allah'a ait olmak üzere akşama ulaştı. Hamd sadece Allah'adır. Allah'dan başka hiç bir ilâh yoktur, tekdir ve ortağı yoktur. Mülk O'na aittir, hamd O'na mahsustur. O her şeye kadirdir. Allahım, bu gecenin hayrını, bu geceden sonrasının hayrını dilerim. Bu gecenin şerrinden, bu geceden sonrasının şerrinden sana sığınırım. Tembellikten, fena şekilde ihtiyarlıktan sana sığınırım Allahım. Cehennem azabından, kabir azabından sana sığınırım Allahım.",
            translation_bn: "আমরা আল্লাহর জন্য বিকালে উপনীত হয়েছি, অনুরূপ যাবতীয় রাজত্বও বিকালে উপনীত হয়েছে, আল্লাহ্‌র জন্য। সমুদয় প্রশংসা আল্লাহ্‌র জন্য। একমাত্র আল্লাহ ছাড়া কোনো হক্ব ইলাহ নেই, তাঁর কোনো শরীক নেই। রাজত্ব তাঁরই এবং প্রশংসাও তাঁর, আর তিনি সকল কিছুর উপর ক্ষমতাবান। হে রব্ব! এই রাতের মাঝে এবং এর পরে যা কিছু কল্যাণ আছে আমি আপনার নিকট তা প্রার্থনা করি। আর এই রাতের মাঝে এবং এর পরে যা কিছু অকল্যাণ আছে, তা থেকে আমি আপনার আশ্রয় চাই। হে রব্ব! আমি আপনার কাছে আশ্রয় চাই অলসতা ও খারাপ বার্ধক্য থেকে। হে রব্ব! আমি আপনার কাছে আশ্রয় চাই জাহান্নামে আযাব হওয়া থেকে এবং কবরে আযাব হওয়া থেকে।",
            translation_ms: "Kami telah memasuki waktu petang dan kerajaan pada waktu petang ini adalah milik Allah, segala puji bagi Allah, tiada tuhan yang berhak disembah melainkan Allah semata-mata, tiada sekutu bagi-Nya, milik-Nyalah kerajaan dan bagi-Nyalah segala pujian, dan Dia Maha Berkuasa atas segala sesuatu. Ya Tuhanku, aku memohon kepada-Mu kebaikan malam ini dan kebaikan selepasnya, dan aku berlindung kepada-Mu daripada kejahatan malam ini dan kejahatan selepasnya. Ya Tuhanku, aku berlindung kepada-Mu daripada kemalasan dan kejahatan usia tua. Ya Tuhanku, aku berlindung kepada-Mu daripada azab neraka dan azab kubur.",
            translation_de: "Wir sind in den Abend eingetreten, und die Herrschaft Allahs ist auch in den Abend eingetreten, und alles Lob gebührt Allah. Es gibt keine Gottheit außer Allah alleine, Er hat keinen Partner, Ihm gehört die Herrschaft und Ihm gehört das Lob, und Er ist über alle Dinge mächtig. Mein Herr, ich bitte Dich um das Gute dieser Nacht und das Gute dessen, was ihr folgt, und ich suche Zuflucht bei Dir vor dem Übel dieser Nacht und dem Übel dessen, was ihr folgt. Mein Herr, ich suche Zuflucht bei Dir vor Trägheit und dem niedrigsten Greisenalter. Mein Herr, ich suche Zuflucht bei Dir vor der Pein des Höllenfeuers und der Pein des Grabes.",
            translation_es: "¡Hemos anochecido y ha anochecido el Reino de Al-lah. Las alabanzas son para Al-lah. No hay más dios que Al-lah, único y sin asociado! Para Él es el Reino y la alabanza. Él es el Poderoso sobre todas las cosas. ¡Señor, te pido el bien que haya en esta noche y después de ella. Y me refugio en Ti del mal que haya en esta noche y después de ella! ¡Señor, me refugio en Ti de la pereza y el mal de la decrepitud. Me refugio en Ti del castigo del Fuego y del castigo de la tumba!",
            translation_id: "Kami telah memasuki waktu sore dan kerajaan hanya milik Allah, segala puji hanya milik Allah. Tidak ada Ilah yang berhak diibadahi dengan benar, kecuali Allah Yang Mahaesa, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya pujian. Dia-lah Yang Mahakuasa atas segala sesuatu. Wahai Rabb, aku mohon kepada-Mu kebaikan di malam ini dan kebaikan sesudahnya. Aku berlindung kepada-Mu dari kejahatan yang ada di malam ini dan kejahatan sesudahnya. Wahai Rabb, aku berlindung kepada-Mu dari kemalasan dan keburukan di hari tua. Wahai Rabb, aku berlindung kepada-Mu dari siksaan di neraka dan siksaan di kubur.",
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
            // AZKAR-EVENING-DUA-CARD-06-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1: per-language MEANING translation (EVENING form — ends «المصير»/return, NOT «النشور»/resurrection) shown ABOVE the Arabic in each non-ar UI; trusted sources per the approved source audit (Hisn al-Muslim, HadeethEnc, and recognized per-language adhkar references; Hasan — Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah). No Arabic translation is added; the Arabic dhikr, source and repeat stay unchanged.
            translation_en: "O Allah, by Your leave we have reached the evening and by Your leave we have reached the morning, by Your leave we live and die and unto You is our return.",
            translation_fr: "Ô Allah ! C'est par Toi que nous nous retrouvons au soir et c'est par Toi que nous nous retrouvons au matin. C'est par Toi que nous vivons et c'est par Toi que nous mourons et c'est vers Toi que sera notre destinée.",
            translation_ur: "اے اللہ! تیری حفاظت میں ہم نے شام کی اور تیری حفاظت میں ہم نے صبح کی اور تیرے ہی نام پر ہم زندہ ہوتے اور تیرے ہی نام پر ہم مرتے ہیں اور تیری ہی طرف لوٹ کر جانا ہے۔",
            translation_tr: "Allah'ım! Seninle akşamladık, Seninle sabahladık. Seninle yaşar Seninle ölürüz. Dönüş de ancak Sana'dır.",
            translation_bn: "হে আল্লাহ! আমরা আপনার জন্য বিকালে উপনীত হয়েছি এবং আপনারই জন্য আমরা সকালে উপনীত হয়েছি। আর আপনার দ্বারা আমরা জীবিত থাকি, আপনার দ্বারাই আমরা মারা যাব; আর আপনার দিকেই প্রত্যাবর্তিত হব।",
            translation_ms: "Ya Allah, dengan rahmat dan pertolongan-Mu kami memasuki waktu petang, dan dengan rahmat dan pertolongan-Mu kami memasuki waktu pagi. Dengan rahmat dan pertolongan-Mu kami hidup, dan dengan kehendak-Mu kami mati. Dan kepada-Mu tempat kembali.",
            translation_de: "O Allah durch Dich traten wir in den Abend ein, durch Dich traten wir in den Morgen ein, durch Dich leben wir, durch Dich sterben wir und zu Dir ist die Rückkehr.",
            translation_es: "¡Oh Al-lah, por Ti hemos amanecido y por Ti hemos anochecido; por Ti vivimos y por Ti morimos; y a Ti será el retorno!",
            translation_id: "Ya Allah, dengan rahmat dan pertolongan-Mu kami memasuki waktu sore dan dengan rahmat dan pertolongan-Mu kami memasuki waktu pagi. Dengan rahmat dan kehendak-Mu kami hidup dan dengan rahmat dan kehendak-Mu kami mati. Dan kepada-Mu tempat kembali.",
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
            // AZKAR-EVENING-DUA-CARD-07-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1: Sayyid al-Istighfar dua-MEANING translations x9 non-ar (same dua as morning-007). en = Hisn al-Muslim / Sahih al-Bukhari (Sunnah, hisn 79) — the COMPLETE form keeping «there is none worthy of worship but You» (HadeethEnc en drops it, so NOT reused). fr/ur/tr/bn/ms/de/es/id = reused verbatim from morning-007 (HadeethEnc / Hisnii / AkuIslam), all 10 meanings + «abu'u» as acknowledge/admit; ur uses the correct «مغفرت» (morning-007 is already clean — the audit-flagged typo «مغرفت» is absent). No Arabic translation; the virtue stays in the separate Arabic virtue field, untranslated; the Arabic dhikr, source and repeat stay unchanged.
            translation_en: "O Allah, You are my Lord, there is none worthy of worship but You. You created me and I am your slave. I keep Your covenant, and my pledge to You so far as I am able. I seek refuge in You from the evil of what I have done. I admit to Your blessings upon me, and I admit to my misdeeds. Forgive me, for there is none who may forgive sins but You.",
            translation_fr: "Ô Allah ! Tu es mon Seigneur. Il n’y a aucune divinité [digne d’être adorée] en dehors de Toi. Tu m’as créé et je suis Ton serviteur, je me conforme autant que je peux à mon engagement et à ma promesse vis-à-vis de Toi. Je cherche refuge auprès de Toi contre le mal que j’ai commis. Je reconnais Ton bienfait à mon égard et je reconnais mon péché. Pardonne-moi donc, en effet nul autre que Toi ne pardonnes les péchés.",
            translation_ur: "اے اللہ! تو میرا رب ہے، تیرے سوا کوئی معبود برحق نہیں۔ تو نے مجھے پیدا کیا اور میں تیرا بندہ ہوں۔ میں اپنی طاقت کے مطابق تجھ سے کیے ہوئے عہد اور وعدے پر قائم ہوں۔ میں اپنے کیے ہوئے اعمال کے شر سے تیری پناہ مانگتا ہوں۔ میں تیرے حضور تیری جانب سے ملنے والی نعمتوں کا اقرار کرتا ہوں۔ ایسے ہی اپنے گناہوں کا بھی اعتراف کرتا ہوں۔ لہذا میرى مغفرت فرما، کیوں کہ تیرے سوا کوئی گناہوں کى مغفرت کرنے والا نہیں ہے۔",
            translation_tr: "Allah’ım! Sen benim Rabbimsin. Senden başka ibadete layık (hak) ilah yoktur. Beni sen yarattın ve ben senin kulunum. Ezelde sana verdiğim sözümde ve vaadimde hâlâ gücüm yettiğince durmaktayım. İşlediğim kusurların şerrinden sana sığınırım. Bana lütfettiğin nimetleri itiraf ediyorum. Günahlarımı itiraf ediyorum. Beni affet, şüphe yok ki günahları senden başka affedecek yoktur.",
            translation_bn: "হে আল্লাহ, আপনিই আমার রব, আপনি ছাড়া কোনো সত্য মাবূদ নেই। আপনিই আমাকে সৃষ্টি করেছেন, আমি আপনার বান্দা, আমি যথাসাধ্য আপনার অঙ্গীকার ও ওয়াদার ওপর আছি, আমি যা করছি তার অনিষ্ট থেকে আপনার নিকট প্রার্থনা করছি। আমি আমার ওপর আপনার নি‘আমত স্বীকার করছি এবং আমি আপনার সামনে আমার পাপ স্বীকার করছি, অতএব আপনি আমাকে ক্ষমা করুন। কারণ, আপনি ব্যতীত কেউ পাপ ক্ষমা করবে না।",
            translation_ms: "Ya Allah, Engkaulah Tuhanku, tiada tuhan yang disembah melainkan Engkau. Engkau telah menjadikan aku, dan aku ialah hamba Mu, aku tetap atas amanah-Mu dan janji-Mu sekadar kesanggupan. Aku berlindung dengan-Mu daripada kejahatan yang telah aku lakukan. Aku mengakui kepada-Mu dengan nikmatMu ke atasku dan aku mengakui dosaku. Maka ampunilah aku, maka sesungguhnya tiada siapa yang dapat mengampuni dosa-dosaku selain Engkau.",
            translation_de: "O Allah, Du bist mein Herr, es gibt keinen Gott außer Dir. Du hast mich erschaffen, und ich bin Dein Diener. Ich halte an Deinem Bund und Deinem Versprechen fest, so gut ich kann. Ich suche Zuflucht bei Dir vor dem Bösen, das ich getan habe. Ich bekenne Deine Gnade mir gegenüber und ich bekenne meine Sünden. So vergib mir, denn niemand vergibt Sünden außer Dir.",
            translation_es: "¡Oh, Al-lah!, Tú eres mi Señor. No hay más divinidad que Tú. Me has creado y soy Tu Siervo. Mantengo mi pacto y mi promesa contigo de la mejor manera que puedo. En Ti me refugio del mal que he cometido. Reconozco Tus gracias para conmigo y reconozco mis pecados. Perdóname, pues nadie perdona los pecados sino Tú.",
            translation_id: "Ya Allah! Engkau adalah Tuhanku, tidak ada Tuhan yang berhak disembah kecuali Engkau. Engkau yang menciptakanku, aku adalah hamba-Mu. Aku menetapi perjanjian dan janjiku kepada-Mu semampuku. Aku berlindung kepada-Mu dari keburukan perbuatanku. Aku mengakui nikmat-Mu atas diriku dan aku mengakui dosaku. Maka ampunilah aku, karena sesungguhnya tiada yang mengampuni dosa selain Engkau.",
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
            // AZKAR-EVENING-DUA-CARD-08-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1: shahada dua-MEANING translations x9 non-ar
            // (same dua as morning-008, EVENING form «أمسيت»). NINE meanings each: ① O Allah ② I have reached the EVENING &
            // call You to witness ③ bearers of Your Throne ④ Your angels ⑤ all creation ⑥ that You are Allah ⑦ no god but
            // You ⑧ You ALONE, no partner ⑨ Muhammad Your servant & Messenger. en/fr/bn/ms/de/es/id = morning-008 reused with
            // ONLY the time-word morning→evening (they already keep ⑧ «alone, no partner»). ur & tr DIVERGE: their morning-008
            // form DROPS ⑧ «وحدك لا شريك لك», restored here from a trusted source (morning cards are NOT retro-fixed by this
            // ticket). ur ⑧ «تو اکیلا ہے، تیرا کوئی شریک نہیں» = islamicurdubooks (Sunan Abi Dawud 5078, Faryawai/Saeedi; +
            // Mukhtasar Hisn al-Muslim, Zubair Ali Zai #91). tr = TRUSTED COMPOSITE (Turkish only, user-approved Option 1):
            // BODY from IslamHouse Hısnu'l-Müslim (al-Qahtani, çev. İsmail Yaşa) dua 80, evening «akşamladım» per its footnote 3,
            // keeps 8/9; ⑧ completed from Diyanet Din İşleri Yüksek Kurulu «O tektir, ortağı yoktur», morph-fitted to the
            // witness form «tek olduğuna, ortağın olmadığına». Other sources: en=Sunnah Hisn 80 (GSalam); fr=Dar Al Athar
            // Hisnul Muslim ch.27; bn=HisnMuslim bn ch.1 #80 (বিকালে); ms=AkuIslam Zikir Petang; de=Islamische Datenbank
            // Kap.27; es=hisnmuslim es #1 (anochezco); id=Rumaysho (petang). NO translation_ar; the Arabic dhikr, source
            // «رواه أبو داود», repeat «أربع مرات» and virtue stay byte-identical/unchanged. No transliteration/reference/repeat/
            // source/sanad/virtue/footnote inside any block. NO morning wording; renderers (server.js/app.js) untouched.
            translation_en: "O Allah, I have entered a new evening and call upon You and upon the bearers of Your Throne, upon Your angels and all creation to bear witness that surely You are Allah, there is none worthy of worship but You alone, You have no partners, and that Muhammad is Your slave and Your Messenger.",
            translation_fr: "Ô Seigneur ! Me voici au soir, je Te prends à témoin et je prends à témoins les porteurs de Ton Trône ainsi que Tes anges et toutes tes créatures, que c’est Toi Allah, il n’y a de divinité que Toi, Tu es Seul et sans associé, et que Muhammad est Ton esclave et Ton messager.",
            translation_ur: "اے اللہ! میں نے اس حال میں شام کی کہ میں تجھے گواہ بناتا ہوں اور تیرا عرش اٹھانے والوں کو، تیرے فرشتوں کو اور تیری تمام مخلوق کو گواہ بناتا ہوں کہ تو ہی اللہ ہے، تیرے سوا کوئی معبود برحق نہیں، تو اکیلا ہے، تیرا کوئی شریک نہیں، اور بیشک محمد تیرے بندے اور تیرے رسول ہیں۔",
            translation_tr: "Allahım! Senin, senden başka hak ilah olmayan Allah olduğuna, tek olduğuna, ortağın olmadığına ve Muhammed'in de senin kulun ve elçin olduğuna; Seni, senin arşını taşıyanları, meleklerini ve bütün yarattıklarını şahit tutarak akşamladım.",
            translation_bn: "হে আল্লাহ! আমি বিকালে উপনীত হয়েছি। আপনাকে আমি সাক্ষী রাখছি, আরও সাক্ষী রাখছি আপনার ‘আরশ বহনকারীদেরকে, আপনার ফেরেশতাগণকে ও আপনার সকল সৃষ্টিকে, (এর উপর) যে— নিশ্চয় আপনিই আল্লাহ, একমাত্র আপনি ছাড়া আর কোনো হক্ব ইলাহ নেই, আপনার কোনো শরীক নেই; আর মুহাম্মাদ আপনার বান্দা ও রাসূল।",
            translation_ms: "Ya Allah, sesungguhnya aku di waktu petang ini mempersaksikan Engkau, malaikat yang memikul ‘Arsy-Mu, malaikat-malaikat dan seluruh makhluk-Mu, bahawa sesungguhnya Engkau adalah Allah, tiada Ilah yang berhak disembah kecuali Engkau semata, tiada sekutu bagi-Mu dan sesungguhnya Muhammad adalah hamba dan utusan-Mu.",
            translation_de: "O Allāh, wahrlich habe ich den Abend erreicht und rufe Dich, und die Deinen Thron tragenden (die Engel), Deine Malāʾikah (Engel) und all Deine Schöpfung zum Bezeugen, dass ich bezeuge, Du bist Allāh; und es gibt keinen wahren Ilāh (Anbetungswürdigen) außer Dir (allein). Du hast keinen Teilhaber; und Muḥammad ist Dein Diener und Gesandter.",
            translation_es: "Oh Allah, ciertamente anochezco y atestiguo, así como atestiguan los (ángeles) que sostienen Tu Trono, Tus ángeles y toda Tu creación, de que Tu eres Allah y no hay divinidad salvo Tú, único, sin asociado y que Muhammad es Tu siervo y mensajero.",
            translation_id: "Ya Allah, sesungguhnya aku di waktu petang bersaksi kepada-Mu, malaikat yang memikul ‘Arasy-Mu, malaikat-malaikat dan seluruh makhluk-Mu, sesungguhnya Engkau adalah Allah, tiada Tuhan yang berhak disembah kecuali Engkau Yang Maha Esa, tiada sekutu bagi-Mu dan sesungguhnya Muhammad adalah hamba dan utusan-Mu.",
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
            // AZKAR-EVENING-DUA-CARD-09-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1: static dua MEANING translations in the
            // EVENING form («أمسى»), same dua as morning-009 (twin). NINE meanings: O Allah / whatever blessing this EVENING /
            // or to anyone of Your creation / from You / alone / no partner / all praise / all thanks. NO repeat label, reference,
            // virtue, transliteration, footnotes/digits, or morning wording inside the block. Sources: en=printed Morning & Evening
            // Adhkar reference; fr=French Hisnul Muslim ch.27 (ce soir); ur=Urdu Hisnul Muslim adhkar (شام کی); tr=Turkish Hisnul
            // Muslim ch.27 (akşama çıkan); bn=Bengali Hisnul Muslim ch.1 (বিকালে); ms=Malay Ma'thurat Sughra Doa 20 Petang;
            // de=German Hisnu-l-Muslim ch.27 (an diesem Abend, cleaned: no transliteration); es=Spanish Hisnul Muslim body +
            // documented «al anochecer» (trusted composite); id=Indonesian Hisnul Muslim ch.27 (di sore ini). NO translation_ar.
            translation_en: "O Allah, all the favours that I or anyone from Your creation has received in the evening, are from You Alone. You have no partner. To You Alone belong all praise and all thanks.",
            translation_fr: "Ô Seigneur ! Tout ce qui m'arrive comme bienfaits ce soir, à moi ou à l'une de Tes créatures, provient de Toi Seul, sans associé. A Toi la louange ainsi que la gratitude.",
            translation_ur: "اے اللہ! مجھ پر یا تیری مخلوق میں سے کسی پر جس نعمت نے بھی شام کی ہے وہ صرف تیری طرف سے ہے، تو اکیلا ہے، تیرا کوئی شریک نہیں، پس تیرے ہی لئے حمد اور تیرے ہی لئے شکر ہے۔",
            translation_tr: "Allahım! Benim veya kullarından birisinin yanında akşama çıkan her nimet, yalnızca sendendir. Senin ortağın yoktur. Hamd, yalnızca sanadır. Şükür de sanadır.",
            translation_bn: "হে আল্লাহ! যে নি‘আমত আমার সাথে বিকালে উপনীত হয়েছে, অথবা আপনার সৃষ্টির অন্য কারও সাথে; এসব নেয়ামত কেবলমাত্র আপনার নিকট থেকেই; আপনার কোনো শরীক নেই। সুতরাং সকল প্রশংসা আপনারই। আর সকল কৃতজ্ঞতা আপনারই প্রাপ্য।",
            translation_ms: "Ya Allah, apa sahaja nikmat yang kami dapati pada petang ini atau yang diterima oleh mana-mana makhluk-Mu, maka sebenarnya ia datang dari Engkau sahaja. Tidak ada sekutu bagi-Mu. Maka bagi-Mu segala puji dan bagi-Mu segala kesyukuran.",
            translation_de: "O Allāh, all meine Gaben und die Gaben zu Deinen Geschöpfen an diesem Abend sind von Dir allein. Du hast keinen Teilhaber. So gebühren Dir allein Lob und Dank.",
            translation_es: "¡Oh Allah! Toda la gracia que poseo al anochecer, o que posea alguien de Tu creación, proviene de Ti, único sin asociados. Para Ti es la alabanza y el agradecimiento.",
            translation_id: "Ya Allah, nikmat yang kuterima atau diterima oleh seseorang di antara makhluk-Mu di sore ini adalah dari-Mu. Maha Esa Engkau, tiada sekutu bagi-Mu. Bagi-Mu segala puji dan kepada-Mu panjatan syukur.",
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
            // AZKAR-EVENING-DUA-CARD-10-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1: static dua MEANING translations. This dua is
            // TIME-NEUTRAL (no «أصبح/أمسى» — said morning AND evening with one text), so the evening translations are the same as
            // the already-approved morning-010 (byte-identical reuse; no time-word swap, no composite). EIGHT meanings: grant
            // health in body / hearing / sight / «لا إله إلا أنت» (first) / refuge from disbelief / poverty / punishment of the
            // grave / «لا إله إلا أنت» (final). «عافني»=grant health/wellbeing (not merely heal); «الكفر»=disbelief/kufr (not
            // ingratitude). Sources: en=printed Morning & Evening Adhkar ref (Hisn 85); fr=Turjman Islam Évocation; ur=Urdu Hisnul
            // Muslim adhkar; tr=Turkish Hisnul Muslim; bn=Bengali Hisnul Muslim; ms=Malaysian Ministry-of-Education Hisnul Muslim;
            // de=German Hisnu-l-Muslim ch.27; es=Spanish Hisnul Muslim; id=Indonesian Hisnul Muslim (keeps the translator's
            // published bracketed clarifications, e.g. «(dari penyakit…)», as-is). NO repeat/reference/virtue/transliteration/
            // footnote inside the block; NO translation_ar; morning-010 NOT touched.
            translation_en: "O Allah, grant my body health, O Allah, grant my hearing health, O Allah, grant my sight health. None has the right to be worshipped except You. O Allah, I take refuge with You from disbelief and poverty, and I take refuge with You from the punishment of the grave. None has the right to be worshipped except You.",
            translation_fr: "Ô Allah ! Préserve-moi dans mon corps. Ô Allah ! Préserve-moi dans mon ouïe. Ô Allah ! Préserve-moi dans ma vue. Nulle divinité ne mérite l’adoration hormis Toi. Ô Allah ! j’invoque Ta protection contre la mécréance et la pauvreté. Ô Allah ! J’invoque Ta protection contre le supplice de la tombe. Nulle divinité ne mérite l’adoration hormis Toi.",
            translation_ur: "اے اللہ! مجھے میرے جسم میں عافیت دے، اے اللہ! مجھے میرے کانوں میں عافیت دے، اے اللہ! مجھے میری آنکھوں میں عافیت دے، تیرے علاوہ کوئی عبادت کے لائق نہیں، اے اللہ! میں کفر اور فقر سے تیری پناہ چاہتا ہوں، اور عذاب قبر سے تیری پناہ چاہتا ہوں، تیرے علاوہ کوئی عبادت کے لائق نہیں۔",
            translation_tr: "Allah'ım! Bedenime afiyet ver. Allah'ım! Kulağıma afiyet ver. Allah'ım! Gözüme afiyet ver. Senden başka ilah yok. Allah'ım! Küfürden ve fakirlikten sana sığınırım. Kabir azabından sana sığınırım. Senden başka ilah yok.",
            translation_bn: "হে আল্লাহ! আমাকে নিরাপত্তা দিন আমার শরীরে। হে আল্লাহ! আমাকে নিরাপত্তা দিন আমার শ্রবণশক্তিতে। হে আল্লাহ! আমাকে নিরাপত্তা দিন আমার দৃষ্টিশক্তিতে। আপনি ছাড়া কোনো হক্ব ইলাহ নেই। হে আল্লাহ! আমি আপনার কাছে আশ্রয় চাই কুফুরী ও দারিদ্র্য থেকে। আর আমি আপনার আশ্রয় চাই কবরের আযাব থেকে। আপনি ছাড়া আর কোনো হক্ব ইলাহ নেই।",
            translation_ms: "Ya Allah, kurniakanlah kesihatan pada badanku, Ya Allah, kurniakanlah kesihatan pada pendengaranku, Ya Allah, kurniakanlah kesihatan pada penglihatanku, tiada Tuhan yang berhak disembah melainkan Engkau. Ya Allah, aku berlindung denganMu daripada kekufuran dan kefakiran. Ya Allah aku berlindung denganMu daripada azab kubur, tiada Tuhan yang berhak disembah melainkan Engkau.",
            translation_de: "O Allāh, schenke mir Heil in meinem Körper. O Allāh, schenke mir Heil in meinem Gehör. O Allāh, schenke mir Heil in meinem Sehen. Es gibt keinen wahren Ilāh (Anbetungswürdigen) außer Dir. O Allāh, ich suche Zuflucht bei Dir vor dem Kufr und vor der Armut; und ich suche Zuflucht bei Dir vor der Strafe im Grab. Es gibt keinen wahren Ilāh außer Dir.",
            translation_es: "Oh Allah, concede salud a mi cuerpo, Oh Allah, otorgale salud a mis oídos, Oh Allah, concede salud a mi vista, no hay dios sino Tú. Oh Allah ciertamente me refugio en Ti de la incredulidad, de la pobreza, y en Ti me amparo del tormento de la tumba, no hay dios sino Tú.",
            translation_id: "Ya Allah, selamatkan tubuh-ku (dari penyakit dan yang tidak aku inginkan). Ya Allah, selamatkan pendengaranku (dari penyakit dan maksiat atau sesuatu yang tidak aku inginkan). Ya Allah, selamatkan penglihatanku, tiada Tuhan (yang berhak disembah) kecuali Engkau. Ya Allah!, Sesungguhnya aku berlindung kepada-Mu dari kekufuran dan kefakiran. Aku berlindung kepada-Mu dari siksa kubur, tiada Tuhan (yang berhak disembah) kecuali Engkau.",
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
            // AZKAR-EVENING-DUA-CARD-11-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1: static meaning-translations
            // of the anxiety-and-grief dua (Abu Dawud, Hisnul-Muslim ch.34). Time-neutral (no morning/evening word),
            // so 7 langs (en/fr/tr/bn/de/es/id) reuse morning-011 byte-identical. ur + ms use their own trusted
            // renderings: ur from the Sunan Abi Dawud 1555 Urdu translation; ms is a Malaysia-only trusted composite
            // (Ministry-of-Education Hisnul-Muslim body + state-mufti wording for al-jubn / cowardice). Meaning only:
            // no repeat label, reference, virtue, transliteration, footnotes or digits. No Arabic translation field.
            // morning-011 is NOT modified by this ticket.
            translation_en: "O Allah, I take refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and from being over powered by men.",
            translation_fr: "Ô Seigneur! Je me mets sous Ta protection contre les soucis et la tristesse, contre l’incapacité et la paresse, contre l’avarice et la lâcheté, contre le poids de la dette et la domination des hommes.",
            translation_ur: "اے اللہ! میں غم اور حزن سے تیری پناہ مانگتا ہوں، عاجزی و سستی سے تیری پناہ مانگتا ہوں، بزدلی اور کنجوسی سے تیری پناہ مانگتا ہوں اور قرض کے غلبہ اور لوگوں کے تسلط سے تیری پناہ مانگتا ہوں۔",
            translation_tr: "Allahım! Keder ve hüzünden, acizlik ve tembellikten, cimrilik ve korkaklıktan, borcun belimi bükmesinden ve insanların bana galip gelmesinden sana sığınırım.",
            translation_bn: "হে আল্লাহ! নিশ্চয় আমি আপনার আশ্রয় নিচ্ছি দুশ্চিন্তা ও দুঃখ থেকে, অপারগতা ও অলসতা থেকে, কৃপণতা ও ভীরুতা থেকে, ঋণের ভার ও মানুষদের দমন-পীড়ন থেকে।",
            translation_ms: "Ya Allah, aku berlindung denganMu daripada ditimpa kesusahan dan kedukaan, daripada kelemahan dan kemalasan, daripada kedekut dan sifat pengecut dan daripada desakan berhutang dan paksaan orang.",
            translation_de: "O Allāh, ich nehme Zuflucht bei Dir vor der Sorge und Trauer, vor Unfähigkeit und der Trägheit, vor Geiz, vor Feigheit, vor Last der Schulden und davor, von Männern unterdrückt zu werden.",
            translation_es: "Oh Señor me refugio en Ti de las preocupaciones y las tristezas, de la debilidad y la vagancia, de la avaricia y la cobardía, del peso de las deudas y de ser dominado por los hombres.",
            translation_id: "Ya Allah, sesungguhnya aku berlindung kepada-Mu dari keluh kesah dan rasa sedih, dari kelemahan dan kemalasan, dari sifat bakhil dan penakut, dari cengkraman utang dan laki-laki yang menindas-(ku).",
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
            // AZKAR-EVENING-DUA-CARD-12-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1: static meaning-translations of the
            // sufficiency dua (Ibn al-Sunni, Hisnul-Muslim ch.27; its wording = Quran 9:129, first-person SINGULAR).
            // Time-neutral (no morning/evening word), so all 9 langs reuse morning-012 byte-identical. Per-lang trusted
            // sources = Hisnul-Muslim ch.27 and/or a recognised Quran 9:129 translation (per-lang detail in the source-
            // audit report). Dhikr passage only: the Quranic verse-opening is omitted; no verse number, reference,
            // repeat label, virtue, hadith-grade note, transliteration, footnotes or digits inside the text.
            // No Arabic translation field. morning-012 is NOT modified by this ticket.
            translation_en: "Allah is Sufficient for me, none has the right to be worshipped except Him, upon Him I rely and He is Lord of the exalted throne.",
            translation_fr: "Allah me suffit, il n'y a de divinité que Lui, c'est en Lui que je place ma confiance et Il est le Seigneur du Trône immense.",
            translation_ur: "میرے لیے اللہ کافی ہے۔ اس کے سوا کوئی معبود برحق نہیں۔ میں نے اسی پر بھروسہ کیا اور وہ بڑے عرش کا مالک ہے۔",
            translation_tr: "Yeterli bana Allah, O'ndan başka ibâdete lâyık hiçbir ilah yoktur, O'na tevekkül ettim, O yüce arş'ın Rabbidir.",
            translation_bn: "আল্লাহই আমার জন্য যথেষ্ট, তিনি ছাড়া আর কোনো হক্ব ইলাহ নেই। আমি তাঁর উপরই ভরসা করি। আর তিনি মহান আরশের রব্ব।",
            translation_ms: "Cukuplah Allah (sebagai pelindung) bagiku tiada Tuhan yang berhak disembah melainkan Dia, kepadanyalah aku bertawakkal dan dialah Tuhan yang menguasai Arasy yang agung.",
            translation_de: "Allāh genügt mir. Es gibt keinen wahren Ilāh (Anbetungswürdigen) außer Ihm. Auf Ihn verlasse ich mich; Er ist der Rabb (Herr) des gewaltigen Thrones.",
            translation_es: "Allah me es suficiente, no hay divinidad excepto Él, en Él confío que es el Señor del Trono Magnífico.",
            translation_id: "Cukup bagiku Allah (sebagai pelindung), tiada Tuhan (yang berhak disembah) kecuali Dia. Kepada-Nya aku bertawakkal dan Dia adalah Tuhan 'Arasy yang Agung.",
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
            // AZKAR-EVENING-DUA-CARD-13-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1: static meaning-only
            // translations of the dua (no repeat label, reference, virtue, hadith story, isnad/narrator,
            // transliteration, footnotes/digits, explanation, or Arabic field). Time-neutral dua (no
            // morning/evening wording) = Hisn al-Muslim 84 / Abu Dawud 5074 (+Ibn Majah 3871). en/fr/ur/tr/
            // bn/ms/id carried verbatim from the twin card morning-013. de: Islamische Datenbank body with a
            // one-word fault-term cleanup (weaknesses, per German Hisnul Muslim / al-Qahtani). es: La
            // Fortaleza body with a one-word fault-term cleanup (defects, per a trusted Islamic Spanish
            // supplication rendering). All nine keep the thirteen meanings incl. the six separate directions;
            // "harm from below" is destruction-from-beneath, not assassination.
            translation_en: "O Allah, I ask You for pardon and well-being in this life and the next. O Allah, I ask You for pardon and well-being in my religious and worldly affairs, and my family and my wealth. O Allah, veil my weaknesses and set at ease my dismay. O Allah, preserve me from the front and from behind and on my right and on my left and from above, and I take refuge with You lest I be swallowed up by the earth.",
            translation_fr: "Ô Seigneur ! Je T'implore de m'accorder Ton pardon et Ta protection dans cette vie et dans l'au-delà. Ô Seigneur ! Je T'implore de m'accorder Ton pardon et Ta protection dans ma religion, ma vie, ma famille et mes biens. Ô Seigneur ! Couvre mes défauts et rassure moi quant aux peurs qui me tiraillent. Ô Seigneur ! Préserve moi de tout ce qui pourrait survenir de devant ou derrière moi, à ma droite, à ma gauche ou au-dessus de moi, et je me réfugie auprès de Ta toute grandeur contre une mort qui surgirait d'en-dessous de moi.",
            translation_ur: "اے اللہ! میں تجھ سے دنیا اور آخرت میں عفو اور عافیت کا طالب ہوں، اے اللہ! میں تجھ سے اپنے دین و دنیا اور اپنے اہل و مال میں معافی اور عافیت کا طالب ہوں، اے اللہ! میرے عیوب چھپا دے، میرے دل کو مامون کر دے، اور میرے آگے پیچھے، دائیں بائیں، اور اوپر سے میری حفاظت فرما، اور میں تیری پناہ چاہتا ہوں نیچے سے ہلاک کئے جانے سے",
            translation_tr: "Allah'ım! Senden dünya ve ahirette af ve afiyet dilerim. Allah'ım! Senden dinim, dünyam, aile fertlerim ve malım hakkında af ve afiyet dilerim. Allah'ım! Ayıplarımı ört, korkularımdan emin kıl. Allah'ım! Beni önümden, arkamdan, sağımdan solumdan ve üstümden koru. Altımdan helak olmaktan senin büyüklüğüne sığınırım.",
            translation_bn: "হে আল্লাহ! আমি আপনার নিকট দুনিয়া ও আখেরাতে ক্ষমা ও নিরাপত্তা প্রার্থনা করছি। হে আল্লাহ! আমি আপনার নিকট ক্ষমা এবং নিরাপত্তা চাচ্ছি আমার দ্বীন, দুনিয়া, পরিবার ও অর্থ-সম্পদের। হে আল্লাহ! আপনি আমার গোপন ত্রুটিসমূহ ঢেকে রাখুন, আমার উদ্বিগ্নতাকে রূপান্তরিত করুন নিরাপত্তায়। হে আল্লাহ! আপনি আমাকে হেফাযত করুন আমার সামনের দিক থেকে, আমার পিছনের দিক থেকে, আমার ডান দিক থেকে, আমার বাম দিক থেকে এবং আমার উপরের দিক থেকে। আর আপনার মহত্ত্বের অসিলায় আশ্রয় চাই আমার নীচ থেকে হঠাৎ আক্রান্ত হওয়া থেকে।",
            translation_ms: "Ya Allah aku memohon kepadaMu keampunan dan kesejahteraan di dunia dan di akhirat Ya Allah aku memohon kepadaMu keampunan dan kesejahteraan pada agamaku, duniaku keluargaku dan hartaku. Ya Allah, tutupkanlah keaibanku dan amankanlah diriku daripada rasa takut. Ya Allah, peliharalah diriku dari hadapan dan belakangku, dari kanan dan kiriku serta dari atasku dan aku berlindung dengan keagunganMu daripada diceroboh di sebelah bawahku.",
            translation_de: "O Allāh, ich bitte Dich um Vergebung und Heil im Diesseits und im Jenseits. O Allāh, ich bitte Dich um Vergebung und Heil in meinem Dīn und in meinem Leben, für meine Angehörigen und in meinem Vermögen. O Allāh, verberge meine Schwächen und gewähre mir Sicherheit vor meiner Furcht. O Allāh, beschütze mich von vorne, von hinten, von rechts und von links und von oben. Ich suche Zuflucht bei Deiner Gewaltigkeit, dass mich Unheil von unten trifft.",
            translation_es: "Oh Allah ciertamente solicito Tu indulgencia y el bienestar en esta vida y en la otra, Oh Allah ciertamente ruego Tu perdón y el bienestar en mis asuntos religiosos, mundanales, mi familia y mis bienes, Oh Allah cubre mis defectos, y confórtame ante el miedo, Oh Allah protégeme por todas partes, delante y por detrás, a mi derecha e izquierda, sobre mí. Me refugio en tu grandeza de ser engullido por la tierra.",
            translation_id: "Ya Allah, sesungguhnya aku mohon kepada-Mu ampunan dan keselamatan di dunia dan akhirat. Ya Allah sesungguhnya aku mohon kepada-Mu ampunan dan keselamatan: dalam agamaku, (kehidupan) duniaku, keluargaku, hartaku. Ya Allah tutuplah auratku (aib dan sesuatu yang tidak layak di lihat orang lain) dan berilah ketentraman di hatiku. Ya Allah, peliharalah aku dari arah depan, belakang, kanan, kiri dan atasku. Aku berlindung dengan kebesaran-Mu, agar aku tidak mendapat bahaya dari bawahku.",
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
            // AZKAR-EVENING-DUA-CARD-14-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1: static meaning-only
            // translations of the dua (no repeat label, reference, virtue, hadith story, isnad/narrator,
            // transliteration, footnotes/digits, explanation, or Arabic field). Dhikr = Hisn al-Muslim 85 /
            // Tirmidhi 3392 (+Abu Dawud 5067). en/ur/tr/bn/de carried verbatim from the twin card morning-014.
            // fr/es/id/ms DIVERGE by a trusted-source fix on evening-014 only, because their morning-014
            // rendering was deficient on one meaning: fr restores "to a Muslim" (HadeethEnc French);
            // es restores "Lord and Sovereign of all things" (HadeethEnc Spanish 3006); id restores "Satan's
            // incitement to shirk" (Almanhaj); ms restores the same shirk-incitement meaning (AkuIslam / Taqwa).
            // morning-014 is NOT touched. All nine keep the ten meanings incl. Sovereign-of-all (maleek),
            // shirk-as-shirk/incitement (never allies/troops/angels), wrong-against-myself, and upon-a-Muslim.
            translation_en: "O Allah, Knower of the unseen and the seen, Creator of the heavens and the Earth, Lord and Sovereign of all things, I bear witness that none has the right to be worshipped except You. I take refuge in You from the evil of my soul and from the evil and shirk of the devil, and from committing wrong against my soul or bringing such upon another Muslim.",
            translation_fr: "Ô Seigneur ! Toi qui connais parfaitement l'invisible et le visible ! Créateur des cieux et de la terre ! Maître et Possesseur de toute chose ! J'atteste qu'il n'est d'autre divinité méritant l'adoration en dehors de Toi. Je me réfugie auprès de Toi contre le mal de mon âme, contre celui du diable et de son incitation à T'attribuer un associé. (Et je me réfugie auprès de Toi) contre tout méfait que je pourrais perpétrer envers moi-même ou envers un musulman.",
            translation_ur: "اے اللہ! اے غیب اور حاضر کے جاننے والے، آسمانوں اور زمین کو پیدا کرنے والے، ہر چیز کے پروردگار اور مالک! میں شہادت دیتا ہوں کہ تیرے علاوہ کوئی عبادت کے لائق نہیں، میں تیری پناہ مانگتا ہوں اپنے نفس کے شر سے اور شیطان کے شر اور اس کے شرک سے، اور اس بات سے کہ میں اپنے نفس پر برائی کا ارتکاب کروں یا کسی مسلمان کے لئے برائی کا سبب بنوں۔",
            translation_tr: "Gizli ve âşikarı bilen, göklerin ve yerin yaratıcısı Allahım! Her şeyin Rabbi ve sahibi! Senden başka hakkıyla ibâdete lâyık hiçbir ilah olmadığına şehâdet ederim. Nefsimin şerrinden sana sığınırım. Şeytan ve şirkinin şerrinden, nefsime kötülük etmekten veya o kötülüğü bir müslümana götürmekten sana sığınırım.",
            translation_bn: "হে আল্লাহ! হে গায়েব ও উপস্থিতের জ্ঞানী, হে আসমানসমূহ ও যমীনের স্রষ্টা, হে সব কিছুর রব্ব ও মালিক! আমি সাক্ষ্য দিচ্ছি যে, আপনি ছাড়া আর কোনো হক্ব ইলাহ নেই। আমি আপনার কাছে আশ্রয় চাই আমার আত্মার অনিষ্ট থেকে, শয়তানের অনিষ্টতা থেকে ও তার শির্ক বা তার ফাঁদ থেকে, আমার নিজের উপর কোনো অনিষ্ট করা, অথবা কোনো মুসলিমের দিকে তা টেনে নেওয়া থেকে।",
            translation_ms: "Ya Allah, Tuhan yang mengetahui perkara ghaib dan nyata, Pencipta langit dan bumi, Tuhan setiap sesuatu dan Pemiliknya, aku mengaku bahawa Tiada Tuhan yang berhak disembah melainkan Engkau, aku berlindung denganMu daripada kejahatan diriku dan kejahatan syaitan dan godaan untuk berbuat syirik pada Allah, dan daripada aku melakukan kejahatan terhadap diriku atau aku menyeretnya kepada seorang muslim.",
            translation_de: "O Allāh, Kenner des Verborgenen und des Offenkundigen, Erschaffer der Himmel und der Erde, Rabb (Herr) und Besitzer aller Dinge. Ich bezeuge, dass es keinen wahren Ilāh (Anbetungswürdigen) außer Dir gibt. Ich nehme Zuflucht bei Dir vor meiner üblen Seele und vor dem Übel des Šaiṭān (Satan) und dessen Širk (Beigesellung), und dass ich Unrecht gegen meine Seele oder gegen einen anderen Muslim handele.",
            translation_es: "Oh Allah, Conocedor de lo oculto y lo manifiesto, Creador de los cielos y de la tierra, Señor y Amo de todas las cosas, atestiguo que no hay divinidad sino Tu, me refugio en Ti del mal de mi mismo, del mal del Sheitan y de su idolatría, y de cometer mal en contra de mi mismo, o en contra de un musulmán.",
            translation_id: "Ya Allah, Yang Maha Mengetahui yang ghaib dan yang nyata. Wahai Tuhan Pencipta langit dan bumi, Tuhan segala sesuatu yang merajainya. Aku bersaksi bahwa tiada tuhan yang berhak disembah kecuali Engkau. Aku berlindung kepada-Mu dari kejahatan diriku, setan dan ajakannya menyekutukan Allah, atau aku menjalankan kejelekan terhadap diriku atau mendorong orang Islam padanya.",
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

    // AZKAR-EVENING-PAGE-UI-LOCALIZATION-AND-QURAN-TRANSLATIONS-ALL-LANGUAGES-1
    // Evening page UI chrome per language, DERIVED from AZKAR_MORNING_UI_L10N: every shared/generic key
    // (progressTpl, resetBtn, rep map, aria labels, count/undo/source/repeatLabel, reset-confirm, toast, …)
    // is inherited byte-identical from morning (same internal lexicon); only the evening-specific keys below
    // are overridden with morning→evening wording. The `ar` overrides equal the current hardcoded evening
    // template strings exactly, so the Arabic UI stays visually unchanged.
    window.AZKAR_EVENING_UI_L10N = (function () {
        var M = window.AZKAR_MORNING_UI_L10N || {};
        var OV = {
            ar: {
                heroTitle: 'أذكار المساء', bcCurrent: 'أذكار المساء',
                heroSubtitle: 'اقرأ أذكار المساء مكتوبة مع عدد التكرار والمصدر، ويُحفظ تقدمك تلقائيًا خلال الليلة.',
                infoCount: '23 ذكرًا',
                sectionTitle: 'أذكار المساء مع التكرار والمصدر الصحيح',
                sectionText: 'تضم هذه الصفحة أذكار المساء مكتوبة كاملة، مع توضيح عدد التكرار والمصدر لكل ذكر، إضافة إلى عداد تفاعلي يساعدك على إكمال القراءة دون نسيان.',
                completedTitle: 'تم إكمال أذكار المساء', completedSub: 'نسأل الله أن يجعل ليلتك عامرة بالذكر والطمأنينة.'
            },
            en: {
                heroTitle: 'Evening Athkar', bcCurrent: 'Evening Athkar',
                heroSubtitle: 'Read the evening adhkar with their repeat counts and authentic sources — your progress is saved automatically through the evening.',
                infoCount: '23 adhkar',
                sectionTitle: 'Evening Athkar with repeat counts and authentic sources',
                sectionText: 'This page presents the evening adhkar in full, showing the repeat count and source for each, with an interactive counter that helps you complete them without losing your place.',
                completedTitle: 'Evening Athkar completed', completedSub: 'We ask Allah to fill your evening with remembrance and tranquility.'
            },
            fr: {
                heroTitle: 'Invocations du soir', bcCurrent: 'Invocations du soir',
                heroSubtitle: 'Lisez les invocations du soir avec leur nombre de répétitions et leurs sources authentiques — votre progression est enregistrée automatiquement tout au long de la soirée.',
                infoCount: '23 invocations',
                sectionTitle: 'Invocations du soir avec répétitions et sources authentiques',
                sectionText: 'Cette page présente les invocations du soir en intégralité, avec le nombre de répétitions et la source de chacune, ainsi qu’un compteur interactif qui vous aide à les terminer sans perdre le fil.',
                completedTitle: 'Invocations du soir terminées', completedSub: 'Nous demandons à Allah de remplir votre soirée de rappel et de sérénité.'
            },
            ur: {
                heroTitle: 'شام کے اذکار', bcCurrent: 'شام کے اذکار',
                heroSubtitle: 'شام کے اذکار تعداد اور مستند حوالے کے ساتھ پڑھیں — آپ کی پیش رفت شام بھر خودبخود محفوظ رہتی ہے۔',
                infoCount: '23 اذکار',
                sectionTitle: 'شام کے اذکار تکرار اور مستند حوالے کے ساتھ',
                sectionText: 'یہ صفحہ شام کے اذکار مکمل طور پر پیش کرتا ہے، ہر ذکر کی تعداد اور حوالہ واضح کرتا ہے، اور ایک متعامل شمار کنندہ فراہم کرتا ہے جو انہیں بھولے بغیر مکمل کرنے میں مدد دیتا ہے۔',
                completedTitle: 'شام کے اذکار مکمل ہو گئے', completedSub: 'ہم اللہ سے دعا کرتے ہیں کہ آپ کی شام ذکر اور سکون سے معمور فرمائے۔'
            },
            tr: {
                heroTitle: 'Akşam Zikirleri', bcCurrent: 'Akşam Zikirleri',
                heroSubtitle: 'Akşam zikirlerini tekrar sayıları ve sahih kaynaklarıyla okuyun — ilerlemeniz akşam boyunca otomatik olarak kaydedilir.',
                infoCount: '23 zikir',
                sectionTitle: 'Tekrar sayıları ve sahih kaynaklarıyla akşam zikirleri',
                sectionText: 'Bu sayfa akşam zikirlerini eksiksiz sunar; her zikrin tekrar sayısını ve kaynağını gösterir ve onları yerinizi kaybetmeden tamamlamanıza yardımcı olan etkileşimli bir sayaç sağlar.',
                completedTitle: 'Akşam zikirleri tamamlandı', completedSub: 'Allah’tan akşamınızı zikir ve huzurla doldurmasını dileriz.'
            },
            bn: {
                heroTitle: 'সন্ধ্যার যিকির', bcCurrent: 'সন্ধ্যার যিকির',
                heroSubtitle: 'সন্ধ্যার যিকিরগুলো পুনরাবৃত্তির সংখ্যা ও নির্ভরযোগ্য সূত্রসহ পড়ুন — আপনার অগ্রগতি সন্ধ্যা জুড়ে স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়।',
                infoCount: '23 যিকির',
                sectionTitle: 'পুনরাবৃত্তি ও নির্ভরযোগ্য সূত্রসহ সন্ধ্যার যিকির',
                sectionText: 'এই পৃষ্ঠায় সন্ধ্যার যিকির সম্পূর্ণরূপে দেওয়া হয়েছে, প্রতিটির পুনরাবৃত্তির সংখ্যা ও সূত্র উল্লেখসহ, এবং একটি ইন্টারেক্টিভ কাউন্টার যা ভুলে না গিয়ে সেগুলো সম্পূর্ণ করতে সাহায্য করে।',
                completedTitle: 'সন্ধ্যার যিকির সম্পন্ন হয়েছে', completedSub: 'আমরা আল্লাহর কাছে দোয়া করি তিনি যেন আপনার সন্ধ্যা যিকির ও প্রশান্তিতে পূর্ণ করেন।'
            },
            ms: {
                heroTitle: 'Zikir Petang', bcCurrent: 'Zikir Petang',
                heroSubtitle: 'Baca zikir petang dengan bilangan ulangan dan sumber sahih — kemajuan anda disimpan secara automatik sepanjang petang.',
                infoCount: '23 zikir',
                sectionTitle: 'Zikir petang dengan bilangan ulangan dan sumber sahih',
                sectionText: 'Halaman ini memaparkan zikir petang sepenuhnya, menunjukkan bilangan ulangan dan sumber bagi setiap satu, serta kaunter interaktif yang membantu anda menyelesaikannya tanpa hilang tempat.',
                completedTitle: 'Zikir petang selesai', completedSub: 'Kami memohon kepada Allah agar memenuhi petang anda dengan zikir dan ketenangan.'
            },
            de: {
                heroTitle: 'Abend-Adhkar', bcCurrent: 'Abend-Adhkar',
                heroSubtitle: 'Lies die Abend-Adhkar mit ihrer Wiederholungszahl und authentischen Quellen — dein Fortschritt wird den ganzen Abend über automatisch gespeichert.',
                infoCount: '23 Adhkar',
                sectionTitle: 'Abend-Adhkar mit Wiederholungen und authentischen Quellen',
                sectionText: 'Diese Seite zeigt die Abend-Adhkar vollständig, mit Wiederholungszahl und Quelle für jedes, sowie einem interaktiven Zähler, der dir hilft, sie ohne den Faden zu verlieren zu vollenden.',
                completedTitle: 'Abend-Adhkar abgeschlossen', completedSub: 'Wir bitten Allah, deinen Abend mit Gedenken und Gelassenheit zu erfüllen.'
            },
            es: {
                heroTitle: 'Adhkar de la tarde', bcCurrent: 'Adhkar de la tarde',
                heroSubtitle: 'Lee los adhkar de la tarde con su número de repeticiones y fuentes auténticas — tu progreso se guarda automáticamente durante la tarde.',
                infoCount: '23 adhkar',
                sectionTitle: 'Adhkar de la tarde con repeticiones y fuentes auténticas',
                sectionText: 'Esta página presenta los adhkar de la tarde completos, mostrando el número de repeticiones y la fuente de cada uno, con un contador interactivo que te ayuda a completarlos sin perder el hilo.',
                completedTitle: 'Adhkar de la tarde completados', completedSub: 'Pedimos a Allah que llene tu tarde de recuerdo y serenidad.'
            },
            id: {
                heroTitle: 'Zikir Petang', bcCurrent: 'Zikir Petang',
                heroSubtitle: 'Baca zikir petang dengan jumlah pengulangan dan sumber sahih — kemajuan Anda disimpan otomatis sepanjang petang.',
                infoCount: '23 zikir',
                sectionTitle: 'Zikir petang dengan pengulangan dan sumber sahih',
                sectionText: 'Halaman ini menyajikan zikir petang secara lengkap, menampilkan jumlah pengulangan dan sumber setiap zikir, dengan penghitung interaktif yang membantu Anda menyelesaikannya tanpa kehilangan jejak.',
                completedTitle: 'Zikir petang selesai', completedSub: 'Kami memohon kepada Allah agar memenuhi petang Anda dengan zikir dan ketenangan.'
            }
        };
        var out = {};
        Object.keys(M).forEach(function (l) { out[l] = Object.assign({}, M[l], OV[l] || {}); });
        return out;
    })();

    // ══════════════════════════════════════════════════════════════════════════
    // AZKAR-MORNING-BOTTOM-CONTENT-FAQ-LOCALIZATION-ALL-LANGUAGES-1 (2026-07-14)
    // Bottom-of-page educational cards + related-links labels + FAQ, per language, merged into
    // AZKAR_MORNING_UI_L10N *after* the evening derivation above so the evening dict stays clean
    // for its own (batch-2) bottom content. Rendered via data-azkar-ui / data-azkar-ui-aria on the
    // static #page-azkar-morning HTML; related-link paths get the lang prefix at render time.
    // ══════════════════════════════════════════════════════════════════════════
    (function () {
        var B = {
            ar: {
                eduSecAria: 'معلومات تعليمية عن أذكار الصباح',
                edu1T: 'فضل أذكار الصباح في بداية اليوم',
                edu1P1: 'أذكار الصباح من الأعمال اليومية التي تعين المسلم على افتتاح يومه بذكر الله والتوكل عليه، فهي تجمع بين التوحيد، والاستغفار، وطلب العافية، وسؤال الحفظ من الشرور. وقراءتها في بداية اليوم تساعد على حضور القلب وربط بداية اليوم بالطاعة والطمأنينة.',
                edu1P2: 'يمكن للمستخدم قراءة الأذكار كاملة بالترتيب، أو العودة إلى الأذكار التي تحتاج إلى تكرار باستخدام العداد، مع حفظ التقدم تلقائيًا خلال اليوم في نفس المتصفح.',
                edu2T: 'كيف تستخدم صفحة أذكار الصباح؟',
                edu2P1: 'صُممت هذه الصفحة لتكون سهلة القراءة على الهاتف والكمبيوتر. يظهر كل ذكر داخل بطاقة مستقلة مع عدد التكرار والمصدر، وتظهر الأذكار التي تحتاج إلى تكرار بعداد يساعدك على إكمال العدد دون نسيان.',
                edu2P2: 'عند إكمال ذكر معين، ينتقل بك الموقع تلقائيًا إلى الذكر التالي لتكون القراءة أكثر سلاسة. كما يتم حفظ تقدمك خلال اليوم، وتعود العدادات من البداية عند تغير اليوم حسب توقيت جهازك المحلي.',
                edu3T: 'الفرق بين أذكار الصباح والمساء',
                edu3P1: 'تشترك أذكار الصباح والمساء في عدد من الأذكار والآيات، مثل آية الكرسي والمعوذات وبعض أدعية الحفظ والعافية، لكن بعض الصيغ تختلف بحسب الوقت، مثل قول: أصبحنا في الصباح، وأمسينا في المساء.',
                edu3P2: 'لذلك من الأفضل قراءة كل قسم من صفحته الخاصة حتى تظهر الصيغ المناسبة للوقت، ويكون التكرار محفوظًا لكل قسم بشكل مستقل.',
                linksAria: 'روابط ذات صلة',
                lnkBack: 'العودة إلى الأذكار',
                lnkEvening: 'أذكار المساء',
                lnkPrayer: 'أذكار الصلاة',
                lnkPrayerTimes: 'مواقيت الصلاة اليوم',
                lnkQibla: 'اتجاه القبلة',
                lnkHijri: 'التاريخ الهجري اليوم',
                lnkMoon: 'حالة القمر اليوم',
                faqTitle: 'أسئلة شائعة حول أذكار الصباح',
                faqQ1: 'ما هي أذكار الصباح؟',
                faqA1: 'أذكار الصباح هي مجموعة من الآيات والأدعية والأذكار التي يقرؤها المسلم في بداية يومه، وفيها توحيد لله وطلب للحفظ والعافية والبركة.',
                faqQ2: 'متى وقت قراءة أذكار الصباح؟',
                faqA2: 'يبدأ وقت أذكار الصباح من طلوع الفجر، ويستمر إلى بداية النهار. والأفضل قراءتها بعد صلاة الفجر أو في أول الصباح بحسب استطاعة المسلم.',
                faqQ3: 'هل يجب قراءة أذكار الصباح بالترتيب؟',
                faqA3: 'لا يجب قراءة أذكار الصباح بترتيب معين، لكن ترتيبها في الصفحة يساعد على المتابعة وعدم نسيان أي ذكر، خاصة مع وجود عداد للتكرار.',
                faqQ4: 'ما فائدة التكرار في أذكار الصباح؟',
                faqA4: 'التكرار في أذكار الصباح ورد في النصوص لتثبيت الذكر وحضور القلب، مثل ثلاث مرات أو سبع مرات أو مائة مرة، فيكون العدد جزءًا من صفة الذكر وأجره.',
                faqQ5: 'هل تظهر مصادر أذكار الصباح في الصفحة؟',
                faqA5: 'نعم، يظهر المصدر مع كل ذكر لمساعدة القارئ على معرفة موضع وروده، سواء كان من القرآن الكريم أو من أحاديث صحيحة في كتب السنة المعتمدة.',
                faqQ6: 'هل يمكن قراءة أذكار الصباح من الهاتف؟',
                faqA6: 'نعم، يمكن قراءة أذكار الصباح من الهاتف أو من أي وسيلة تساعد على التذكر والمتابعة، والمهم حضور القلب والمحافظة على الذكر.',
                faqQ7: 'ماذا أفعل إذا نسيت أذكار الصباح؟',
                faqA7: 'إذا نسي المسلم أذكار الصباح أو فاتته في وقتها، فيمكنه قراءتها عندما يتذكر، مع الحرص على المواظبة عليها في وقتها قدر المستطاع.',
                faqQ8: 'هل أذكار الصباح تحفظ تلقائيًا في هذه الصفحة؟',
                faqA8: 'نعم، تحفظ الصفحة تقدمك خلال اليوم في هذا المتصفح، ثم تبدأ العدادات من جديد عند تغير اليوم حسب توقيت جهازك المحلي.',
                faqQ9: 'ما فائدة عداد أذكار الصباح؟',
                faqA9: 'يساعد العداد على متابعة الأذكار التي تحتاج إلى تكرار، مثل ثلاث مرات أو مائة مرة، حتى يقرأ المستخدم الذكر كاملًا دون نسيان العدد.'
            },
            en: {
                eduSecAria: 'Educational information about the morning adhkar',
                edu1T: 'The virtue of the morning adhkar at the start of the day',
                edu1P1: 'The morning adhkar are among the daily acts that help a Muslim open the day with the remembrance of Allah and reliance upon Him. They combine affirming His oneness, seeking forgiveness, asking for well-being, and seeking protection from harm. Reciting them at the start of the day helps bring presence of heart and ties the beginning of the day to obedience and tranquility.',
                edu1P2: 'You can read the adhkar in full order, or return to those that need repetition using the counter, while your progress is saved automatically through the day in the same browser.',
                edu2T: 'How to use the morning adhkar page',
                edu2P1: 'This page is designed to be easy to read on phone and desktop. Each dhikr appears in its own card with its repeat count and source, and the adhkar that need repeating show a counter that helps you complete the number without losing count.',
                edu2P2: 'When you complete a given dhikr, the page moves automatically to the next one for a smoother reading. Your progress is also saved through the day, and the counters restart when the day changes according to your device’s local time.',
                edu3T: 'The difference between the morning and evening adhkar',
                edu3P1: 'The morning and evening adhkar share a number of remembrances and verses, such as Ayat al-Kursi, the Mu‘awwidhat, and some supplications for protection and well-being, but some wordings differ by time, such as saying “we have reached the morning” in the morning and “we have reached the evening” in the evening.',
                edu3P2: 'It is therefore better to read each section from its own page so the wordings suited to the time appear, and so the repetition is saved independently for each section.',
                linksAria: 'Related links',
                lnkBack: 'Back to Adhkar',
                lnkEvening: 'Evening Athkar',
                lnkPrayer: 'Prayer Adhkar',
                lnkPrayerTimes: 'Prayer Times Today',
                lnkQibla: 'Qibla Direction',
                lnkHijri: 'Today’s Hijri Date',
                lnkMoon: 'Moon Phase Today',
                faqTitle: 'Frequently asked questions about the morning adhkar',
                faqQ1: 'What are the morning adhkar?',
                faqA1: 'The morning adhkar are a set of verses, supplications, and remembrances that a Muslim reads at the start of the day, containing affirmation of Allah’s oneness and requests for protection, well-being, and blessing.',
                faqQ2: 'When is the time for the morning adhkar?',
                faqA2: 'The time for the morning adhkar begins at the break of dawn and continues until the start of the day. It is best to read them after the Fajr prayer or in the early morning, according to what each Muslim is able to do.',
                faqQ3: 'Must the morning adhkar be read in order?',
                faqA3: 'The morning adhkar do not have to be read in a specific order, but their order on the page helps you keep track and not forget any dhikr, especially with a counter for repetition.',
                faqQ4: 'What is the benefit of repetition in the morning adhkar?',
                faqA4: 'Repetition in the morning adhkar is mentioned in the texts to firmly establish the remembrance and bring presence of heart, such as three, seven, or one hundred times, so the number becomes part of the character of the dhikr and its reward.',
                faqQ5: 'Are the sources of the morning adhkar shown on the page?',
                faqA5: 'Yes, the source is shown with each dhikr to help the reader know where it comes from, whether from the Noble Qur’an or from authentic hadiths in the recognized books of the Sunnah.',
                faqQ6: 'Can the morning adhkar be read from a phone?',
                faqA6: 'Yes, the morning adhkar can be read from a phone or any means that helps with remembrance and follow-up. What matters is presence of heart and maintaining the remembrance.',
                faqQ7: 'What do I do if I forget the morning adhkar?',
                faqA7: 'If a Muslim forgets the morning adhkar or misses them in their time, they may read them when they remember, while striving to keep them regularly in their time as much as possible.',
                faqQ8: 'Are the morning adhkar saved automatically on this page?',
                faqA8: 'Yes, the page saves your progress through the day in this browser, then the counters start over when the day changes according to your device’s local time.',
                faqQ9: 'What is the benefit of the morning adhkar counter?',
                faqA9: 'The counter helps you keep track of the adhkar that need repeating, such as three or one hundred times, so you read the dhikr completely without losing count of the number.'
            },
            fr: {
                eduSecAria: 'Informations pédagogiques sur les invocations du matin',
                edu1T: 'Le mérite des invocations du matin au début de la journée',
                edu1P1: 'Les invocations du matin font partie des actes quotidiens qui aident le musulman à ouvrir sa journée par le rappel d’Allah et la confiance en Lui. Elles réunissent l’affirmation de Son unicité, la demande de pardon, la demande de bien-être et la protection contre les maux. Les réciter au début de la journée aide à la présence du cœur et relie le début du jour à l’obéissance et à la sérénité.',
                edu1P2: 'Vous pouvez lire les invocations en entier dans l’ordre, ou revenir à celles qui doivent être répétées à l’aide du compteur, votre progression étant enregistrée automatiquement au cours de la journée dans le même navigateur.',
                edu2T: 'Comment utiliser la page des invocations du matin',
                edu2P1: 'Cette page est conçue pour être facile à lire sur téléphone et sur ordinateur. Chaque invocation apparaît dans une carte distincte avec son nombre de répétitions et sa source, et celles qui doivent être répétées affichent un compteur qui vous aide à atteindre le nombre sans l’oublier.',
                edu2P2: 'Lorsque vous terminez une invocation, la page passe automatiquement à la suivante pour une lecture plus fluide. Votre progression est aussi enregistrée durant la journée, et les compteurs repartent de zéro au changement de jour selon l’heure locale de votre appareil.',
                edu3T: 'La différence entre les invocations du matin et du soir',
                edu3P1: 'Les invocations du matin et du soir partagent plusieurs rappels et versets, comme le Verset du Trône, les sourates protectrices et certaines demandes de protection et de bien-être, mais certaines formules diffèrent selon le moment, comme dire « nous voici au matin » le matin et « nous voici au soir » le soir.',
                edu3P2: 'Il est donc préférable de lire chaque section depuis sa propre page afin que les formules adaptées au moment apparaissent, et que la répétition soit enregistrée séparément pour chaque section.',
                linksAria: 'Liens connexes',
                lnkBack: 'Retour aux invocations',
                lnkEvening: 'Invocations du soir',
                lnkPrayer: 'Invocations de la prière',
                lnkPrayerTimes: 'Horaires de prière aujourd’hui',
                lnkQibla: 'Direction de la Qibla',
                lnkHijri: 'Date hégirienne du jour',
                lnkMoon: 'Phase de la lune aujourd’hui',
                faqTitle: 'Questions fréquentes sur les invocations du matin',
                faqQ1: 'Que sont les invocations du matin ?',
                faqA1: 'Les invocations du matin sont un ensemble de versets, de demandes et de rappels que le musulman lit au début de sa journée, comprenant l’affirmation de l’unicité d’Allah et la demande de protection, de bien-être et de bénédiction.',
                faqQ2: 'Quel est le moment des invocations du matin ?',
                faqA2: 'Le moment des invocations du matin commence à l’aube et se poursuit jusqu’au début de la journée. Il est préférable de les lire après la prière du Fajr ou en début de matinée, selon la capacité de chacun.',
                faqQ3: 'Faut-il lire les invocations du matin dans l’ordre ?',
                faqA3: 'Les invocations du matin ne doivent pas être lues dans un ordre précis, mais leur ordre sur la page aide à suivre et à ne pas oublier une invocation, surtout avec un compteur de répétition.',
                faqQ4: 'Quel est l’intérêt de la répétition dans les invocations du matin ?',
                faqA4: 'La répétition dans les invocations du matin est mentionnée dans les textes pour ancrer le rappel et la présence du cœur, comme trois, sept ou cent fois, de sorte que le nombre fasse partie de la nature de l’invocation et de sa récompense.',
                faqQ5: 'Les sources des invocations du matin sont-elles indiquées sur la page ?',
                faqA5: 'Oui, la source est indiquée avec chaque invocation pour aider le lecteur à savoir d’où elle provient, que ce soit du Noble Coran ou de hadiths authentiques des recueils reconnus de la Sunna.',
                faqQ6: 'Peut-on lire les invocations du matin depuis un téléphone ?',
                faqA6: 'Oui, les invocations du matin peuvent être lues depuis un téléphone ou tout moyen qui aide au rappel et au suivi. L’essentiel est la présence du cœur et la constance dans le rappel.',
                faqQ7: 'Que faire si j’oublie les invocations du matin ?',
                faqA7: 'Si le musulman oublie les invocations du matin ou les manque à leur moment, il peut les lire lorsqu’il s’en souvient, tout en veillant à les maintenir régulièrement en leur temps autant que possible.',
                faqQ8: 'Les invocations du matin sont-elles enregistrées automatiquement sur cette page ?',
                faqA8: 'Oui, la page enregistre votre progression durant la journée dans ce navigateur, puis les compteurs recommencent au changement de jour selon l’heure locale de votre appareil.',
                faqQ9: 'Quel est l’intérêt du compteur des invocations du matin ?',
                faqA9: 'Le compteur aide à suivre les invocations qui doivent être répétées, comme trois ou cent fois, afin que vous lisiez l’invocation en entier sans perdre le compte du nombre.'
            },
            ur: {
                eduSecAria: 'صبح کے اذکار کے بارے میں تعلیمی معلومات',
                edu1T: 'دن کے آغاز میں صبح کے اذکار کی فضیلت',
                edu1P1: 'صبح کے اذکار ان روزمرہ اعمال میں سے ہیں جو مسلمان کو اپنے دن کا آغاز اللہ کے ذکر اور اُس پر توکل کے ساتھ کرنے میں مدد دیتے ہیں۔ ان میں توحید، استغفار، عافیت کا سوال اور شرور سے حفاظت کی دعا سب جمع ہیں۔ دن کے آغاز میں ان کا پڑھنا دل کے حاضر ہونے اور دن کی ابتدا کو طاعت اور سکون سے جوڑنے میں مدد دیتا ہے۔',
                edu1P2: 'صارف اذکار کو ترتیب کے ساتھ مکمل پڑھ سکتا ہے، یا جن اذکار کو دہرانے کی ضرورت ہو اُن پر شمار کنندہ کے ذریعے واپس آ سکتا ہے، جبکہ آپ کی پیش رفت دن بھر اسی براؤزر میں خودبخود محفوظ رہتی ہے۔',
                edu2T: 'صبح کے اذکار کا صفحہ کیسے استعمال کریں؟',
                edu2P1: 'یہ صفحہ فون اور کمپیوٹر پر آسانی سے پڑھنے کے لیے بنایا گیا ہے۔ ہر ذکر ایک الگ کارڈ میں تعداد اور حوالے کے ساتھ ظاہر ہوتا ہے، اور جن اذکار کو دہرانے کی ضرورت ہو اُن پر ایک شمار کنندہ ظاہر ہوتا ہے جو آپ کو تعداد بھولے بغیر مکمل کرنے میں مدد دیتا ہے۔',
                edu2P2: 'جب آپ کوئی ذکر مکمل کرتے ہیں تو صفحہ خودبخود اگلے ذکر پر منتقل ہو جاتا ہے تاکہ پڑھنا زیادہ روانی سے ہو۔ آپ کی پیش رفت بھی دن بھر محفوظ رہتی ہے، اور دن بدلنے پر آپ کے آلے کے مقامی وقت کے مطابق شمار کنندہ دوبارہ صفر سے شروع ہو جاتے ہیں۔',
                edu3T: 'صبح اور شام کے اذکار میں فرق',
                edu3P1: 'صبح اور شام کے اذکار میں کئی اذکار اور آیات مشترک ہیں، جیسے آیت الکرسی، معوذات اور حفاظت و عافیت کی بعض دعائیں، لیکن بعض صیغے وقت کے مطابق مختلف ہوتے ہیں، جیسے صبح میں «ہم نے صبح کی» اور شام میں «ہم نے شام کی» کہنا۔',
                edu3P2: 'اس لیے بہتر ہے کہ ہر حصہ اپنے مخصوص صفحے سے پڑھا جائے تاکہ وقت کے مناسب صیغے ظاہر ہوں، اور ہر حصے کے لیے تکرار الگ محفوظ رہے۔',
                linksAria: 'متعلقہ روابط',
                lnkBack: 'اذکار کی طرف واپس',
                lnkEvening: 'شام کے اذکار',
                lnkPrayer: 'نماز کے اذکار',
                lnkPrayerTimes: 'آج کے نماز کے اوقات',
                lnkQibla: 'قبلہ کی سمت',
                lnkHijri: 'آج کی ہجری تاریخ',
                lnkMoon: 'آج چاند کی حالت',
                faqTitle: 'صبح کے اذکار کے بارے میں اکثر پوچھے جانے والے سوالات',
                faqQ1: 'صبح کے اذکار کیا ہیں؟',
                faqA1: 'صبح کے اذکار آیات، دعاؤں اور اذکار کا مجموعہ ہیں جو مسلمان اپنے دن کے آغاز میں پڑھتا ہے، ان میں اللہ کی توحید اور حفاظت، عافیت اور برکت کی دعا شامل ہے۔',
                faqQ2: 'صبح کے اذکار پڑھنے کا وقت کب ہے؟',
                faqA2: 'صبح کے اذکار کا وقت طلوعِ فجر سے شروع ہوتا ہے اور دن کے آغاز تک رہتا ہے۔ بہتر یہ ہے کہ انہیں نمازِ فجر کے بعد یا صبح کے اوائل میں مسلمان کی استطاعت کے مطابق پڑھا جائے۔',
                faqQ3: 'کیا صبح کے اذکار ترتیب کے ساتھ پڑھنا ضروری ہے؟',
                faqA3: 'صبح کے اذکار کو کسی خاص ترتیب سے پڑھنا ضروری نہیں، لیکن صفحے پر ان کی ترتیب پیروی کرنے اور کوئی ذکر بھولنے سے بچنے میں مدد دیتی ہے، خاص طور پر تکرار کے شمار کنندہ کے ساتھ۔',
                faqQ4: 'صبح کے اذکار میں تکرار کا کیا فائدہ ہے؟',
                faqA4: 'صبح کے اذکار میں تکرار نصوص میں ذکر کو مضبوط کرنے اور دل کی حاضری کے لیے آیا ہے، جیسے تین بار، سات بار یا سو بار، تاکہ یہ تعداد ذکر کی صفت اور اس کے اجر کا حصہ بن جائے۔',
                faqQ5: 'کیا صبح کے اذکار کے حوالے صفحے پر ظاہر ہوتے ہیں؟',
                faqA5: 'جی ہاں، ہر ذکر کے ساتھ حوالہ ظاہر ہوتا ہے تاکہ قاری کو معلوم ہو کہ یہ کہاں سے آیا ہے، خواہ وہ قرآن کریم سے ہو یا سنت کی معتبر کتب کی صحیح احادیث سے۔',
                faqQ6: 'کیا صبح کے اذکار فون سے پڑھے جا سکتے ہیں؟',
                faqA6: 'جی ہاں، صبح کے اذکار فون سے یا کسی بھی ایسے ذریعے سے پڑھے جا سکتے ہیں جو یاد دہانی اور پیروی میں مدد دے، اہم بات دل کی حاضری اور ذکر پر مداومت ہے۔',
                faqQ7: 'اگر میں صبح کے اذکار بھول جاؤں تو کیا کروں؟',
                faqA7: 'اگر مسلمان صبح کے اذکار بھول جائے یا اُن کے وقت میں چھوٹ جائیں تو یاد آنے پر انہیں پڑھ سکتا ہے، اس حرص کے ساتھ کہ حسبِ استطاعت انہیں اُن کے وقت میں باقاعدگی سے پڑھے۔',
                faqQ8: 'کیا اس صفحے پر صبح کے اذکار خودبخود محفوظ ہوتے ہیں؟',
                faqA8: 'جی ہاں، صفحہ آپ کی پیش رفت دن بھر اسی براؤزر میں محفوظ رکھتا ہے، پھر دن بدلنے پر آپ کے آلے کے مقامی وقت کے مطابق شمار کنندہ دوبارہ شروع ہو جاتے ہیں۔',
                faqQ9: 'صبح کے اذکار کے شمار کنندہ کا کیا فائدہ ہے؟',
                faqA9: 'شمار کنندہ اُن اذکار کی پیروی میں مدد دیتا ہے جنہیں دہرانے کی ضرورت ہو، جیسے تین بار یا سو بار، تاکہ صارف تعداد بھولے بغیر ذکر مکمل پڑھ سکے۔'
            },
            tr: {
                eduSecAria: 'Sabah zikirleri hakkında eğitici bilgiler',
                edu1T: 'Günün başında sabah zikirlerinin fazileti',
                edu1P1: 'Sabah zikirleri, Müslümanın gününe Allah’ı anarak ve O’na tevekkül ederek başlamasına yardımcı olan günlük amellerdendir. Tevhidi, istiğfarı, afiyet istemeyi ve kötülüklerden korunmayı diLemeyi bir arada bulundurur. Günün başında okunması kalbin huzuruna ve günün başlangıcını itaat ve huzura bağlamaya yardım eder.',
                edu1P2: 'Zikirleri sırasıyla baştan sona okuyabilir veya sayaç yardımıyla tekrar edilmesi gerekenlere dönebilirsiniz; ilerlemeniz gün boyunca aynı tarayıcıda otomatik olarak kaydedilir.',
                edu2T: 'Sabah zikirleri sayfası nasıl kullanılır?',
                edu2P1: 'Bu sayfa telefonda ve bilgisayarda kolay okunacak şekilde tasarlanmıştır. Her zikir, tekrar sayısı ve kaynağıyla birlikte ayrı bir kartta görünür; tekrar edilmesi gereken zikirlerde, sayıyı unutmadan tamamlamanıza yardımcı olan bir sayaç bulunur.',
                edu2P2: 'Bir zikri tamamladığınızda, okuma daha akıcı olsun diye sayfa otomatik olarak bir sonrakine geçer. İlerlemeniz de gün boyunca kaydedilir ve gün değiştiğinde cihazınızın yerel saatine göre sayaçlar en baştan başlar.',
                edu3T: 'Sabah ve akşam zikirleri arasındaki fark',
                edu3P1: 'Sabah ve akşam zikirleri; Âyetü’l-Kürsî, Muavvizât ve bazı korunma ve afiyet duaları gibi birçok zikir ve âyeti ortak paylaşır, ancak bazı lafızlar vakte göre değişir; örneğin sabah « sabaha erdik », akşam « akşama erdik » demek gibi.',
                edu3P2: 'Bu yüzden her bölümü kendi sayfasından okumak daha iyidir; böylece vakte uygun lafızlar görünür ve tekrar, her bölüm için ayrı ayrı kaydedilir.',
                linksAria: 'İlgili bağlantılar',
                lnkBack: 'Zikirlere dön',
                lnkEvening: 'Akşam Zikirleri',
                lnkPrayer: 'Namaz Zikirleri',
                lnkPrayerTimes: 'Bugünkü Namaz Vakitleri',
                lnkQibla: 'Kıble Yönü',
                lnkHijri: 'Bugünün Hicri Tarihi',
                lnkMoon: 'Bugün Ayın Durumu',
                faqTitle: 'Sabah zikirleri hakkında sık sorulan sorular',
                faqQ1: 'Sabah zikirleri nedir?',
                faqA1: 'Sabah zikirleri, Müslümanın gününün başında okuduğu âyet, dua ve zikirlerden oluşan bir bütündür; içinde Allah’ın birliğinin ikrarı ile korunma, afiyet ve bereket istekleri yer alır.',
                faqQ2: 'Sabah zikirlerinin vakti ne zamandır?',
                faqA2: 'Sabah zikirlerinin vakti fecrin doğuşuyla başlar ve günün başlangıcına kadar sürer. En iyisi, Müslümanın gücü ölçüsünde sabah namazından sonra ya da sabahın ilk saatlerinde okumaktır.',
                faqQ3: 'Sabah zikirlerini sırayla okumak gerekir mi?',
                faqA3: 'Sabah zikirlerinin belirli bir sırayla okunması gerekmez, ancak sayfadaki sıraları takip etmeye ve hiçbir zikri unutmamaya yardımcı olur, özellikle tekrar sayacıyla birlikte.',
                faqQ4: 'Sabah zikirlerinde tekrarın faydası nedir?',
                faqA4: 'Sabah zikirlerinde tekrar, zikri pekiştirmek ve kalbin huzurunu sağlamak için metinlerde geçer; üç, yedi ya da yüz kez gibi, böylece sayı zikrin niteliğinin ve sevabının bir parçası olur.',
                faqQ5: 'Sabah zikirlerinin kaynakları sayfada gösterilir mi?',
                faqA5: 'Evet, her zikirle birlikte kaynağı gösterilir; böylece okuyucu, ister Kur’ân-ı Kerîm’den ister muteber sünnet kitaplarındaki sahih hadislerden olsun, nereden geldiğini bilir.',
                faqQ6: 'Sabah zikirleri telefondan okunabilir mi?',
                faqA6: 'Evet, sabah zikirleri telefondan ya da hatırlamaya ve takibe yardımcı olan herhangi bir vasıtayla okunabilir; önemli olan kalbin huzuru ve zikre devamdır.',
                faqQ7: 'Sabah zikirlerini unutursam ne yapmalıyım?',
                faqA7: 'Müslüman sabah zikirlerini unutur ya da vaktinde kaçırırsa, hatırladığında okuyabilir; imkânı ölçüsünde bunları vaktinde düzenli tutmaya özen göstererek.',
                faqQ8: 'Sabah zikirleri bu sayfada otomatik kaydedilir mi?',
                faqA8: 'Evet, sayfa ilerlemenizi gün boyunca bu tarayıcıda kaydeder; ardından gün değiştiğinde cihazınızın yerel saatine göre sayaçlar yeniden başlar.',
                faqQ9: 'Sabah zikirleri sayacının faydası nedir?',
                faqA9: 'Sayaç, üç ya da yüz kez gibi tekrar edilmesi gereken zikirleri takip etmeye yardımcı olur; böylece kullanıcı sayıyı şaşırmadan zikri eksiksiz okur.'
            },
            bn: {
                eduSecAria: 'সকালের যিকির সম্পর্কে শিক্ষামূলক তথ্য',
                edu1T: 'দিনের শুরুতে সকালের যিকিরের ফজিলত',
                edu1P1: 'সকালের যিকির সেই দৈনন্দিন আমলগুলোর অন্তর্ভুক্ত যা একজন মুসলিমকে আল্লাহর স্মরণ ও তাঁর ওপর ভরসার মাধ্যমে দিন শুরু করতে সাহায্য করে। এতে একত্ববাদ, ইস্তিগফার, সুস্থতার প্রার্থনা এবং অনিষ্ট থেকে রক্ষার দোয়া একসঙ্গে রয়েছে। দিনের শুরুতে এগুলো পাঠ অন্তরের উপস্থিতি আনতে এবং দিনের সূচনাকে আনুগত্য ও প্রশান্তির সঙ্গে যুক্ত করতে সাহায্য করে।',
                edu1P2: 'ব্যবহারকারী যিকিরগুলো ক্রমানুসারে পূর্ণ পাঠ করতে পারেন, অথবা কাউন্টারের সাহায্যে যেসব যিকির পুনরাবৃত্তির প্রয়োজন সেগুলোতে ফিরে যেতে পারেন, আর আপনার অগ্রগতি দিনভর একই ব্রাউজারে স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে।',
                edu2T: 'সকালের যিকিরের পৃষ্ঠা কীভাবে ব্যবহার করবেন?',
                edu2P1: 'এই পৃষ্ঠাটি ফোন ও কম্পিউটারে সহজে পড়ার জন্য তৈরি করা হয়েছে। প্রতিটি যিকির তার পুনরাবৃত্তির সংখ্যা ও উৎসসহ একটি আলাদা কার্ডে দেখা যায়, আর যেসব যিকির পুনরাবৃত্তির প্রয়োজন সেগুলোতে একটি কাউন্টার থাকে যা সংখ্যা না ভুলে সম্পূর্ণ করতে সাহায্য করে।',
                edu2P2: 'কোনো যিকির সম্পূর্ণ হলে পাঠ আরও সাবলীল করতে পৃষ্ঠা স্বয়ংক্রিয়ভাবে পরবর্তী যিকিরে চলে যায়। আপনার অগ্রগতিও দিনভর সংরক্ষিত থাকে, এবং আপনার ডিভাইসের স্থানীয় সময় অনুযায়ী দিন পরিবর্তিত হলে কাউন্টারগুলো আবার শুরু থেকে শুরু হয়।',
                edu3T: 'সকাল ও সন্ধ্যার যিকিরের মধ্যে পার্থক্য',
                edu3P1: 'সকাল ও সন্ধ্যার যিকিরে বেশ কিছু যিকির ও আয়াত অভিন্ন, যেমন আয়াতুল কুরসি, মুআওবিযাত এবং রক্ষা ও সুস্থতার কিছু দোয়া, তবে কিছু শব্দরূপ সময় অনুযায়ী ভিন্ন হয়, যেমন সকালে «আমরা সকালে উপনীত হলাম» এবং সন্ধ্যায় «আমরা সন্ধ্যায় উপনীত হলাম» বলা।',
                edu3P2: 'তাই প্রতিটি অংশ তার নিজস্ব পৃষ্ঠা থেকে পড়া উত্তম, যাতে সময়ের উপযোগী শব্দরূপ দেখা যায় এবং প্রতিটি অংশের পুনরাবৃত্তি আলাদাভাবে সংরক্ষিত থাকে।',
                linksAria: 'সম্পর্কিত লিঙ্ক',
                lnkBack: 'যিকিরে ফিরে যান',
                lnkEvening: 'সন্ধ্যার যিকির',
                lnkPrayer: 'নামাজের যিকির',
                lnkPrayerTimes: 'আজকের নামাজের সময়',
                lnkQibla: 'কিবলার দিক',
                lnkHijri: 'আজকের হিজরি তারিখ',
                lnkMoon: 'আজ চাঁদের অবস্থা',
                faqTitle: 'সকালের যিকির সম্পর্কে সাধারণ জিজ্ঞাসা',
                faqQ1: 'সকালের যিকির কী?',
                faqA1: 'সকালের যিকির হলো আয়াত, দোয়া ও যিকিরের একটি সমষ্টি যা একজন মুসলিম দিনের শুরুতে পাঠ করেন, এতে আল্লাহর একত্ববাদ এবং রক্ষা, সুস্থতা ও বরকতের প্রার্থনা রয়েছে।',
                faqQ2: 'সকালের যিকির পড়ার সময় কখন?',
                faqA2: 'সকালের যিকিরের সময় ফজরের উদয় থেকে শুরু হয় এবং দিনের সূচনা পর্যন্ত থাকে। উত্তম হলো ফজরের নামাজের পর বা সকালের প্রথম ভাগে, মুসলিমের সামর্থ্য অনুযায়ী এগুলো পড়া।',
                faqQ3: 'সকালের যিকির কি ক্রমানুসারে পড়া জরুরি?',
                faqA3: 'সকালের যিকির নির্দিষ্ট কোনো ক্রমে পড়া জরুরি নয়, তবে পৃষ্ঠায় এগুলোর ক্রম অনুসরণে ও কোনো যিকির না ভুলতে সাহায্য করে, বিশেষত পুনরাবৃত্তির কাউন্টার থাকায়।',
                faqQ4: 'সকালের যিকিরে পুনরাবৃত্তির উপকার কী?',
                faqA4: 'সকালের যিকিরে পুনরাবৃত্তি যিকিরকে দৃঢ় করতে ও অন্তরের উপস্থিতির জন্য নুসুসে এসেছে, যেমন তিনবার, সাতবার বা একশবার, ফলে এই সংখ্যা যিকিরের বৈশিষ্ট্য ও এর সওয়াবের অংশ হয়ে যায়।',
                faqQ5: 'সকালের যিকিরের উৎস কি পৃষ্ঠায় দেখানো হয়?',
                faqA5: 'হ্যাঁ, প্রতিটি যিকিরের সঙ্গে এর উৎস দেখানো হয় যাতে পাঠক জানতে পারেন এটি কোথা থেকে এসেছে, তা কুরআনুল কারিম থেকে হোক বা সুন্নাহর স্বীকৃত গ্রন্থসমূহের সহিহ হাদিস থেকে।',
                faqQ6: 'সকালের যিকির কি ফোন থেকে পড়া যায়?',
                faqA6: 'হ্যাঁ, সকালের যিকির ফোন থেকে বা স্মরণ ও অনুসরণে সহায়ক যেকোনো মাধ্যম থেকে পড়া যায়; গুরুত্বপূর্ণ হলো অন্তরের উপস্থিতি ও যিকিরের ওপর অবিচলতা।',
                faqQ7: 'সকালের যিকির ভুলে গেলে আমি কী করব?',
                faqA7: 'কোনো মুসলিম সকালের যিকির ভুলে গেলে বা সময়মতো তা ছুটে গেলে, স্মরণ হওয়ামাত্র পড়তে পারেন, সাধ্যমতো এগুলো সময়মতো নিয়মিত রাখার চেষ্টাসহ।',
                faqQ8: 'এই পৃষ্ঠায় সকালের যিকির কি স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়?',
                faqA8: 'হ্যাঁ, পৃষ্ঠাটি আপনার অগ্রগতি দিনভর এই ব্রাউজারে সংরক্ষণ করে, এরপর আপনার ডিভাইসের স্থানীয় সময় অনুযায়ী দিন পরিবর্তিত হলে কাউন্টারগুলো নতুন করে শুরু হয়।',
                faqQ9: 'সকালের যিকিরের কাউন্টারের উপকার কী?',
                faqA9: 'কাউন্টার যেসব যিকির পুনরাবৃত্তির প্রয়োজন সেগুলো অনুসরণে সাহায্য করে, যেমন তিনবার বা একশবার, যাতে ব্যবহারকারী সংখ্যা না ভুলে যিকির সম্পূর্ণ পড়তে পারেন।'
            },
            ms: {
                eduSecAria: 'Maklumat pendidikan tentang zikir pagi',
                edu1T: 'Kelebihan zikir pagi pada permulaan hari',
                edu1P1: 'Zikir pagi termasuk amalan harian yang membantu seorang Muslim memulakan harinya dengan mengingati Allah dan bertawakal kepada-Nya. Ia menghimpunkan pengesaan keesaan Allah, istighfar, permintaan afiat, dan memohon perlindungan daripada keburukan. Membacanya pada permulaan hari membantu menghadirkan hati serta mengikat permulaan hari dengan ketaatan dan ketenangan.',
                edu1P2: 'Pengguna boleh membaca zikir secara lengkap mengikut susunan, atau kembali kepada zikir yang perlu diulang menggunakan kaunter, sementara kemajuan anda disimpan secara automatik sepanjang hari dalam pelayar yang sama.',
                edu2T: 'Bagaimana menggunakan halaman zikir pagi?',
                edu2P1: 'Halaman ini direka supaya mudah dibaca pada telefon dan komputer. Setiap zikir dipaparkan dalam kad tersendiri bersama bilangan ulangan dan sumbernya, dan zikir yang perlu diulang dipaparkan dengan kaunter yang membantu anda melengkapkan bilangannya tanpa terlupa.',
                edu2P2: 'Apabila anda melengkapkan sesuatu zikir, halaman berpindah secara automatik ke zikir seterusnya supaya bacaan lebih lancar. Kemajuan anda juga disimpan sepanjang hari, dan kaunter bermula semula apabila hari bertukar mengikut waktu tempatan peranti anda.',
                edu3T: 'Perbezaan antara zikir pagi dan petang',
                edu3P1: 'Zikir pagi dan petang berkongsi beberapa zikir dan ayat, seperti Ayat al-Kursi, al-Mu‘awwizat, dan sebahagian doa perlindungan serta afiat, tetapi sebahagian lafaz berbeza mengikut waktu, seperti menyebut « kami memasuki waktu pagi » pada pagi dan « kami memasuki waktu petang » pada petang.',
                edu3P2: 'Oleh itu, lebih baik membaca setiap bahagian daripada halamannya sendiri supaya lafaz yang sesuai dengan waktu dipaparkan, dan ulangan disimpan secara berasingan bagi setiap bahagian.',
                linksAria: 'Pautan berkaitan',
                lnkBack: 'Kembali ke Zikir',
                lnkEvening: 'Zikir Petang',
                lnkPrayer: 'Zikir Solat',
                lnkPrayerTimes: 'Waktu Solat Hari Ini',
                lnkQibla: 'Arah Kiblat',
                lnkHijri: 'Tarikh Hijrah Hari Ini',
                lnkMoon: 'Fasa Bulan Hari Ini',
                faqTitle: 'Soalan lazim tentang zikir pagi',
                faqQ1: 'Apakah zikir pagi?',
                faqA1: 'Zikir pagi ialah himpunan ayat, doa, dan zikir yang dibaca seorang Muslim pada permulaan harinya, mengandungi pengesaan keesaan Allah serta permintaan perlindungan, afiat, dan keberkatan.',
                faqQ2: 'Bilakah waktu membaca zikir pagi?',
                faqA2: 'Waktu zikir pagi bermula daripada terbit fajar dan berterusan sehingga permulaan siang. Yang terbaik ialah membacanya selepas solat Subuh atau pada awal pagi, mengikut kemampuan setiap Muslim.',
                faqQ3: 'Adakah zikir pagi wajib dibaca mengikut susunan?',
                faqA3: 'Zikir pagi tidak wajib dibaca mengikut susunan tertentu, tetapi susunannya pada halaman membantu anda mengikutinya dan tidak terlupa sebarang zikir, terutamanya dengan adanya kaunter ulangan.',
                faqQ4: 'Apakah faedah pengulangan dalam zikir pagi?',
                faqA4: 'Pengulangan dalam zikir pagi disebut dalam nas untuk mengukuhkan zikir dan menghadirkan hati, seperti tiga kali, tujuh kali, atau seratus kali, sehingga bilangan itu menjadi sebahagian daripada sifat zikir dan ganjarannya.',
                faqQ5: 'Adakah sumber zikir pagi dipaparkan pada halaman?',
                faqA5: 'Ya, sumber dipaparkan bersama setiap zikir untuk membantu pembaca mengetahui asalnya, sama ada daripada al-Qur’an al-Karim atau daripada hadis sahih dalam kitab-kitab Sunnah yang muktabar.',
                faqQ6: 'Bolehkah zikir pagi dibaca daripada telefon?',
                faqA6: 'Ya, zikir pagi boleh dibaca daripada telefon atau apa-apa cara yang membantu mengingat dan mengikutinya; yang penting ialah kehadiran hati dan istiqamah dalam berzikir.',
                faqQ7: 'Apa yang perlu saya lakukan jika terlupa zikir pagi?',
                faqA7: 'Jika seorang Muslim terlupa zikir pagi atau terlepas pada waktunya, dia boleh membacanya apabila teringat, sambil berusaha mengekalkannya secara berterusan pada waktunya sedaya mungkin.',
                faqQ8: 'Adakah zikir pagi disimpan secara automatik pada halaman ini?',
                faqA8: 'Ya, halaman ini menyimpan kemajuan anda sepanjang hari dalam pelayar ini, kemudian kaunter bermula semula apabila hari bertukar mengikut waktu tempatan peranti anda.',
                faqQ9: 'Apakah faedah kaunter zikir pagi?',
                faqA9: 'Kaunter membantu anda mengikuti zikir yang perlu diulang, seperti tiga kali atau seratus kali, supaya anda membaca zikir dengan lengkap tanpa tersilap bilangan.'
            },
            de: {
                eduSecAria: 'Lehrreiche Informationen über die Morgen-Adhkar',
                edu1T: 'Der Vorzug der Morgen-Adhkar zu Beginn des Tages',
                edu1P1: 'Die Morgen-Adhkar gehören zu den täglichen Handlungen, die dem Muslim helfen, seinen Tag mit dem Gedenken Allahs und dem Vertrauen auf Ihn zu beginnen. Sie vereinen das Bekenntnis zu Seiner Einheit, das Bitten um Vergebung, das Erbitten von Wohlergehen und den Schutz vor Übeln. Sie zu Beginn des Tages zu rezitieren, hilft zur Anwesenheit des Herzens und verbindet den Tagesbeginn mit Gehorsam und Gelassenheit.',
                edu1P2: 'Der Nutzer kann die Adhkar der Reihe nach vollständig lesen oder mit dem Zähler zu jenen zurückkehren, die wiederholt werden müssen, während dein Fortschritt über den Tag hinweg automatisch im selben Browser gespeichert wird.',
                edu2T: 'Wie benutzt man die Seite der Morgen-Adhkar?',
                edu2P1: 'Diese Seite ist so gestaltet, dass sie auf Telefon und Computer leicht zu lesen ist. Jeder Dhikr erscheint in einer eigenen Karte mit seiner Wiederholungszahl und Quelle, und die Adhkar, die wiederholt werden müssen, zeigen einen Zähler, der dir hilft, die Zahl zu vervollständigen, ohne den Überblick zu verlieren.',
                edu2P2: 'Wenn du einen bestimmten Dhikr abgeschlossen hast, wechselt die Seite für ein flüssigeres Lesen automatisch zum nächsten. Auch dein Fortschritt wird über den Tag gespeichert, und die Zähler beginnen von Neuem, wenn der Tag gemäß der Ortszeit deines Geräts wechselt.',
                edu3T: 'Der Unterschied zwischen den Morgen- und Abend-Adhkar',
                edu3P1: 'Die Morgen- und Abend-Adhkar teilen mehrere Gedenkformeln und Verse, wie den Thronvers, die Schutzsuren und einige Bittgebete um Schutz und Wohlergehen, doch manche Formulierungen unterscheiden sich je nach Zeit, etwa das Sagen « wir sind in den Morgen eingetreten » am Morgen und « wir sind in den Abend eingetreten » am Abend.',
                edu3P2: 'Daher ist es besser, jeden Abschnitt von seiner eigenen Seite zu lesen, damit die der Zeit entsprechenden Formulierungen erscheinen und die Wiederholung für jeden Abschnitt getrennt gespeichert wird.',
                linksAria: 'Verwandte Links',
                lnkBack: 'Zurück zu den Adhkar',
                lnkEvening: 'Abend-Adhkar',
                lnkPrayer: 'Gebets-Adhkar',
                lnkPrayerTimes: 'Gebetszeiten heute',
                lnkQibla: 'Qibla-Richtung',
                lnkHijri: 'Heutiges Hidschri-Datum',
                lnkMoon: 'Mondphase heute',
                faqTitle: 'Häufige Fragen zu den Morgen-Adhkar',
                faqQ1: 'Was sind die Morgen-Adhkar?',
                faqA1: 'Die Morgen-Adhkar sind eine Sammlung von Versen, Bittgebeten und Gedenkformeln, die der Muslim zu Beginn seines Tages liest; sie enthalten das Bekenntnis zur Einheit Allahs sowie Bitten um Schutz, Wohlergehen und Segen.',
                faqQ2: 'Wann ist die Zeit der Morgen-Adhkar?',
                faqA2: 'Die Zeit der Morgen-Adhkar beginnt mit dem Anbruch der Morgendämmerung und dauert bis zum Beginn des Tages. Am besten liest man sie nach dem Fadschr-Gebet oder am frühen Morgen, je nach Vermögen des Muslims.',
                faqQ3: 'Müssen die Morgen-Adhkar in der Reihenfolge gelesen werden?',
                faqA3: 'Die Morgen-Adhkar müssen nicht in einer bestimmten Reihenfolge gelesen werden, doch ihre Reihenfolge auf der Seite hilft, den Überblick zu behalten und keinen Dhikr zu vergessen, besonders mit einem Zähler für die Wiederholung.',
                faqQ4: 'Was ist der Nutzen der Wiederholung in den Morgen-Adhkar?',
                faqA4: 'Die Wiederholung in den Morgen-Adhkar wird in den Texten erwähnt, um das Gedenken zu festigen und das Herz gegenwärtig zu machen, etwa drei-, sieben- oder hundertmal, sodass die Zahl Teil des Wesens des Dhikr und seines Lohns wird.',
                faqQ5: 'Werden die Quellen der Morgen-Adhkar auf der Seite angezeigt?',
                faqA5: 'Ja, mit jedem Dhikr wird die Quelle angezeigt, damit der Leser weiß, woher er stammt, sei es aus dem edlen Koran oder aus authentischen Hadithen in den anerkannten Büchern der Sunna.',
                faqQ6: 'Können die Morgen-Adhkar vom Telefon gelesen werden?',
                faqA6: 'Ja, die Morgen-Adhkar können vom Telefon oder mit jedem Mittel gelesen werden, das beim Gedenken und Verfolgen hilft; entscheidend sind die Anwesenheit des Herzens und die Beständigkeit im Gedenken.',
                faqQ7: 'Was tue ich, wenn ich die Morgen-Adhkar vergesse?',
                faqA7: 'Wenn ein Muslim die Morgen-Adhkar vergisst oder sie in ihrer Zeit verpasst, kann er sie lesen, wenn er sich erinnert, wobei er sich bemüht, sie so weit wie möglich regelmäßig in ihrer Zeit einzuhalten.',
                faqQ8: 'Werden die Morgen-Adhkar auf dieser Seite automatisch gespeichert?',
                faqA8: 'Ja, die Seite speichert deinen Fortschritt über den Tag in diesem Browser, dann beginnen die Zähler von Neuem, wenn der Tag gemäß der Ortszeit deines Geräts wechselt.',
                faqQ9: 'Was ist der Nutzen des Zählers der Morgen-Adhkar?',
                faqA9: 'Der Zähler hilft dir, die Adhkar zu verfolgen, die wiederholt werden müssen, etwa drei- oder hundertmal, sodass du den Dhikr vollständig liest, ohne dich bei der Zahl zu verzählen.'
            },
            es: {
                eduSecAria: 'Información educativa sobre los adhkar de la mañana',
                edu1T: 'La virtud de los adhkar de la mañana al comienzo del día',
                edu1P1: 'Los adhkar de la mañana están entre los actos diarios que ayudan al musulmán a abrir su día con el recuerdo de Allah y la confianza en Él. Reúnen la afirmación de Su unicidad, la petición de perdón, la petición de bienestar y la protección contra los males. Recitarlos al comienzo del día ayuda a la presencia del corazón y vincula el inicio del día con la obediencia y la serenidad.',
                edu1P2: 'El usuario puede leer los adhkar completos en orden, o volver a los que necesitan repetición mediante el contador, mientras tu progreso se guarda automáticamente durante el día en el mismo navegador.',
                edu2T: '¿Cómo usar la página de los adhkar de la mañana?',
                edu2P1: 'Esta página está diseñada para leerse con facilidad en el teléfono y el ordenador. Cada dhikr aparece en una tarjeta propia con su número de repeticiones y su fuente, y los adhkar que necesitan repetirse muestran un contador que te ayuda a completar el número sin perder la cuenta.',
                edu2P2: 'Cuando completas un dhikr determinado, la página pasa automáticamente al siguiente para una lectura más fluida. Tu progreso también se guarda durante el día, y los contadores vuelven a empezar cuando cambia el día según la hora local de tu dispositivo.',
                edu3T: 'La diferencia entre los adhkar de la mañana y de la tarde',
                edu3P1: 'Los adhkar de la mañana y de la tarde comparten varios recuerdos y aleyas, como el Versículo del Trono, las suras protectoras y algunas súplicas de protección y bienestar, pero algunas fórmulas difieren según el momento, como decir « hemos amanecido » por la mañana y « hemos anochecido » por la tarde.',
                edu3P2: 'Por eso es mejor leer cada sección desde su propia página para que aparezcan las fórmulas adecuadas al momento, y para que la repetición se guarde de forma independiente para cada sección.',
                linksAria: 'Enlaces relacionados',
                lnkBack: 'Volver a los Adhkar',
                lnkEvening: 'Adhkar de la tarde',
                lnkPrayer: 'Adhkar de la oración',
                lnkPrayerTimes: 'Horarios de oración de hoy',
                lnkQibla: 'Dirección de la Quibla',
                lnkHijri: 'Fecha hégira de hoy',
                lnkMoon: 'Fase de la luna hoy',
                faqTitle: 'Preguntas frecuentes sobre los adhkar de la mañana',
                faqQ1: '¿Qué son los adhkar de la mañana?',
                faqA1: 'Los adhkar de la mañana son un conjunto de aleyas, súplicas y recuerdos que el musulmán lee al comienzo de su día, e incluyen la afirmación de la unicidad de Allah y la petición de protección, bienestar y bendición.',
                faqQ2: '¿Cuándo es el momento de los adhkar de la mañana?',
                faqA2: 'El tiempo de los adhkar de la mañana comienza con la aparición del alba y continúa hasta el comienzo del día. Lo mejor es leerlos después de la oración del Fayr o a primera hora de la mañana, según la capacidad de cada musulmán.',
                faqQ3: '¿Hay que leer los adhkar de la mañana en orden?',
                faqA3: 'Los adhkar de la mañana no tienen que leerse en un orden concreto, pero su orden en la página ayuda a seguirlos y a no olvidar ningún dhikr, sobre todo con un contador para la repetición.',
                faqQ4: '¿Cuál es el beneficio de la repetición en los adhkar de la mañana?',
                faqA4: 'La repetición en los adhkar de la mañana se menciona en los textos para afianzar el recuerdo y la presencia del corazón, como tres, siete o cien veces, de modo que el número pase a formar parte de la naturaleza del dhikr y su recompensa.',
                faqQ5: '¿Se muestran las fuentes de los adhkar de la mañana en la página?',
                faqA5: 'Sí, la fuente se muestra con cada dhikr para ayudar al lector a saber de dónde procede, ya sea del Noble Corán o de hadices auténticos de los libros reconocidos de la Sunna.',
                faqQ6: '¿Se pueden leer los adhkar de la mañana desde un teléfono?',
                faqA6: 'Sí, los adhkar de la mañana pueden leerse desde un teléfono o cualquier medio que ayude al recuerdo y al seguimiento; lo importante es la presencia del corazón y la constancia en el recuerdo.',
                faqQ7: '¿Qué hago si olvido los adhkar de la mañana?',
                faqA7: 'Si un musulmán olvida los adhkar de la mañana o los pierde en su momento, puede leerlos cuando los recuerde, procurando mantenerlos con regularidad en su tiempo en la medida de lo posible.',
                faqQ8: '¿Se guardan automáticamente los adhkar de la mañana en esta página?',
                faqA8: 'Sí, la página guarda tu progreso durante el día en este navegador, y luego los contadores vuelven a empezar cuando cambia el día según la hora local de tu dispositivo.',
                faqQ9: '¿Cuál es el beneficio del contador de los adhkar de la mañana?',
                faqA9: 'El contador te ayuda a seguir los adhkar que necesitan repetirse, como tres o cien veces, para que leas el dhikr por completo sin perder la cuenta del número.'
            },
            id: {
                eduSecAria: 'Informasi edukatif tentang zikir pagi',
                edu1T: 'Keutamaan zikir pagi di awal hari',
                edu1P1: 'Zikir pagi termasuk amalan harian yang membantu seorang Muslim membuka harinya dengan mengingat Allah dan bertawakal kepada-Nya. Zikir ini menghimpun pengesaan keesaan Allah, istigfar, permohonan afiat, dan permohonan perlindungan dari keburukan. Membacanya di awal hari membantu menghadirkan hati serta mengaitkan awal hari dengan ketaatan dan ketenangan.',
                edu1P2: 'Pengguna dapat membaca zikir secara lengkap sesuai urutan, atau kembali ke zikir yang perlu diulang menggunakan penghitung, sementara kemajuan Anda tersimpan otomatis sepanjang hari di peramban yang sama.',
                edu2T: 'Bagaimana cara menggunakan halaman zikir pagi?',
                edu2P1: 'Halaman ini dirancang agar mudah dibaca di ponsel dan komputer. Setiap zikir tampil dalam kartu tersendiri beserta jumlah pengulangan dan sumbernya, dan zikir yang perlu diulang menampilkan penghitung yang membantu Anda menyelesaikan jumlahnya tanpa lupa.',
                edu2P2: 'Ketika Anda menyelesaikan suatu zikir, halaman berpindah otomatis ke zikir berikutnya agar bacaan lebih lancar. Kemajuan Anda juga tersimpan sepanjang hari, dan penghitung mulai dari awal saat hari berganti sesuai waktu lokal perangkat Anda.',
                edu3T: 'Perbedaan antara zikir pagi dan petang',
                edu3P1: 'Zikir pagi dan petang berbagi sejumlah zikir dan ayat, seperti Ayat Kursi, al-Mu‘awwidzat, dan sebagian doa perlindungan serta afiat, tetapi sebagian lafal berbeda menurut waktu, seperti mengucapkan « kami memasuki waktu pagi » pada pagi dan « kami memasuki waktu petang » pada petang.',
                edu3P2: 'Karena itu, lebih baik membaca setiap bagian dari halamannya sendiri agar lafal yang sesuai dengan waktu ditampilkan, dan agar pengulangan tersimpan secara terpisah untuk setiap bagian.',
                linksAria: 'Tautan terkait',
                lnkBack: 'Kembali ke Zikir',
                lnkEvening: 'Zikir Petang',
                lnkPrayer: 'Zikir Salat',
                lnkPrayerTimes: 'Jadwal Salat Hari Ini',
                lnkQibla: 'Arah Kiblat',
                lnkHijri: 'Tanggal Hijriah Hari Ini',
                lnkMoon: 'Fase Bulan Hari Ini',
                faqTitle: 'Pertanyaan umum tentang zikir pagi',
                faqQ1: 'Apa itu zikir pagi?',
                faqA1: 'Zikir pagi adalah kumpulan ayat, doa, dan zikir yang dibaca seorang Muslim di awal harinya, yang berisi pengesaan keesaan Allah serta permohonan perlindungan, afiat, dan keberkahan.',
                faqQ2: 'Kapan waktu membaca zikir pagi?',
                faqA2: 'Waktu zikir pagi dimulai dari terbitnya fajar dan berlanjut hingga awal siang. Yang terbaik adalah membacanya setelah salat Subuh atau di awal pagi, sesuai kemampuan setiap Muslim.',
                faqQ3: 'Apakah zikir pagi harus dibaca berurutan?',
                faqA3: 'Zikir pagi tidak harus dibaca dengan urutan tertentu, tetapi urutannya di halaman membantu Anda mengikutinya dan tidak melupakan satu zikir pun, terutama dengan adanya penghitung pengulangan.',
                faqQ4: 'Apa manfaat pengulangan dalam zikir pagi?',
                faqA4: 'Pengulangan dalam zikir pagi disebutkan dalam nas untuk mengukuhkan zikir dan menghadirkan hati, seperti tiga kali, tujuh kali, atau seratus kali, sehingga jumlah itu menjadi bagian dari sifat zikir dan pahalanya.',
                faqQ5: 'Apakah sumber zikir pagi ditampilkan di halaman?',
                faqA5: 'Ya, sumber ditampilkan bersama setiap zikir untuk membantu pembaca mengetahui asalnya, baik dari Al-Qur’an al-Karim maupun dari hadis sahih dalam kitab-kitab Sunnah yang mu’tabar.',
                faqQ6: 'Apakah zikir pagi bisa dibaca dari ponsel?',
                faqA6: 'Ya, zikir pagi bisa dibaca dari ponsel atau sarana apa pun yang membantu mengingat dan mengikutinya; yang penting adalah kehadiran hati dan konsistensi dalam berzikir.',
                faqQ7: 'Apa yang harus saya lakukan jika lupa zikir pagi?',
                faqA7: 'Jika seorang Muslim lupa zikir pagi atau terlewat pada waktunya, ia boleh membacanya ketika ingat, sambil berusaha menjaganya secara rutin pada waktunya semampu mungkin.',
                faqQ8: 'Apakah zikir pagi tersimpan otomatis di halaman ini?',
                faqA8: 'Ya, halaman ini menyimpan kemajuan Anda sepanjang hari di peramban ini, lalu penghitung mulai lagi dari awal saat hari berganti sesuai waktu lokal perangkat Anda.',
                faqQ9: 'Apa manfaat penghitung zikir pagi?',
                faqA9: 'Penghitung membantu Anda mengikuti zikir yang perlu diulang, seperti tiga kali atau seratus kali, agar Anda membaca zikir secara lengkap tanpa keliru jumlahnya.'
            }
        };
        var M = window.AZKAR_MORNING_UI_L10N;
        Object.keys(B).forEach(function (l) { if (M[l]) Object.assign(M[l], B[l]); });
    })();

    // ══════════════════════════════════════════════════════════════════════════
    // AZKAR-EVENING-BOTTOM-CONTENT-FAQ-LOCALIZATION-ALL-LANGUAGES-1 (2026-07-14)
    // Evening-page parallel of the morning bottom-content merge above. Evening-specific
    // educational cards + related-links labels + FAQ, per language, merged into
    // AZKAR_EVENING_UI_L10N (already derived above). Rendered via data-azkar-ui /
    // data-azkar-ui-aria on the static #page-azkar-evening HTML by _translateAzkarEveningUi;
    // related-link paths get the lang prefix at render time. 'ar' is byte-identical to the
    // HTML source (idempotent). FAQPage JSON-LD is built server-side from faqQ*/faqA*.
    // ══════════════════════════════════════════════════════════════════════════
    (function () {
        var B = {
            ar: {
                eduSecAria: 'معلومات تعليمية عن أذكار المساء',
                edu1T: 'فضل أذكار المساء في ختام اليوم',
                edu1P1: 'أذكار المساء من الأعمال اليومية التي تعين المسلم على ختم يومه بذكر الله والتوكل عليه، وفيها تذكير بالتوحيد والاستغفار وطلب الحفظ من الشرور. وقراءتها في المساء تساعد على حضور القلب والطمأنينة، وربط نهاية اليوم بالطاعة والسكينة.',
                edu1P2: 'يمكن للمستخدم قراءة الأذكار كاملة بالترتيب، أو العودة إلى الأذكار التي تحتاج إلى تكرار باستخدام العداد، مع حفظ التقدم تلقائيًا خلال الليلة في نفس المتصفح.',
                edu2T: 'كيف تستخدم صفحة أذكار المساء؟',
                edu2P1: 'صُممت هذه الصفحة لتكون سهلة القراءة على الهاتف والكمبيوتر. يظهر كل ذكر داخل بطاقة مستقلة مع عدد التكرار والمصدر، وتظهر الأذكار التي تحتاج إلى تكرار بعداد يساعدك على إكمال العدد دون نسيان.',
                edu2P2: 'عند إكمال ذكر معين، ينتقل لك الموقع تلقائيًا إلى الذكر التالي لتكون القراءة أكثر سلاسة. كما يتم حفظ تقدمك خلال الليلة، وتعود العدادات من البداية عند تغير اليوم حسب توقيت جهازك المحلي.',
                edu3T: 'الفرق بين أذكار الصباح والمساء',
                edu3P1: 'تشترك أذكار الصباح والمساء في عدد من الأذكار والآيات، مثل آية الكرسي والمعوذات وبعض أدعية الحفظ والعافية، لكن تختلف بعض الصيغ بحسب الوقت، مثل قول: أصبحنا في الصباح، وأمسينا في المساء.',
                edu3P2: 'لذلك من الأفضل قراءة كل قسم من صفحته الخاصة حتى تظهر الصيغ المناسبة للوقت، ويكون التكرار محفوظًا لكل قسم بشكل مستقل.',
                linksAria: 'روابط ذات صلة',
                lnkBack: 'العودة إلى الأذكار',
                lnkMorning: 'أذكار الصباح',
                lnkPrayer: 'أذكار الصلاة',
                lnkPrayerTimes: 'مواقيت الصلاة اليوم',
                lnkQibla: 'اتجاه القبلة',
                lnkHijri: 'التاريخ الهجري اليوم',
                lnkMoon: 'حالة القمر اليوم',
                faqTitle: 'أسئلة شائعة حول أذكار المساء',
                faqQ1: 'ما هي أذكار المساء؟',
                faqA1: 'أذكار المساء هي أدعية وآيات وأذكار يقرأها المسلم في وقت المساء، وفيها توحيد واستغفار وطلب للحفظ والعافية، وتُقال اقتداءً بما ورد في السنة وما اشتهر من الأذكار الصحيحة.',
                faqQ2: 'متى وقت قراءة أذكار المساء؟',
                faqA2: 'يبدأ وقت أذكار المساء من بعد العصر عند كثير من أهل العلم، ويمتد إلى الليل. والأفضل قراءتها في أول وقت المساء ما أمكن حتى يبدأ المسلم ليلته بذكر الله وطلب الحفظ.',
                faqQ3: 'هل يجب قراءة أذكار المساء بالترتيب؟',
                faqA3: 'لا يلزم ترتيب محدد لقراءة أذكار المساء، لكن قراءتها مرتبة في الصفحة تساعد على التنظيم وعدم نسيان أي ذكر، خاصة الأذكار التي تحتاج إلى تكرار.',
                faqQ4: 'ما فائدة التكرار في أذكار المساء؟',
                faqA4: 'بعض أذكار المساء وردت بعدد معين من التكرار، مثل ثلاث مرات أو سبع مرات أو مئة مرة. لذلك يساعدك العداد في الصفحة على إكمال العدد المطلوب دون خطأ أو نسيان.',
                faqQ5: 'هل تظهر مصادر أذكار المساء في الصفحة؟',
                faqA5: 'نعم، يظهر المصدر مع كل ذكر لمساعدة القارئ على معرفة موضع وروده، مع عرض الفضل أو الملاحظة المتعلقة بالذكر عند توفرها.',
                faqQ6: 'هل يمكن قراءة أذكار المساء من الهاتف؟',
                faqA6: 'نعم، الصفحة مصممة لتسهيل قراءة أذكار المساء من الهاتف والكمبيوتر، مع بطاقات واضحة وعداد تفاعلي وحفظ تلقائي للتقدم.',
                faqQ7: 'ماذا أفعل إذا نسيت أذكار المساء؟',
                faqA7: 'إذا نسيت أذكار المساء في وقتها، فاقرأ ما تيسر منها عند تذكرك، وحافظ على قراءتها في وقتها في الأيام التالية قدر استطاعتك.',
                faqQ8: 'هل أذكار المساء تحفظ تقدمي تلقائيًا في هذه الصفحة؟',
                faqA8: 'نعم، تحفظ الصفحة تقدمك تلقائيًا خلال الليلة في نفس المتصفح، ثم تعود العدادات من البداية عند تغير اليوم حسب توقيت جهازك المحلي.',
                faqQ9: 'ما فائدة عداد أذكار المساء؟',
                faqA9: 'يساعدك عداد أذكار المساء على إكمال الأذكار المتكررة بسهولة، خاصة الأذكار التي تُقال ثلاث مرات أو سبع مرات أو مئة مرة، دون الحاجة إلى العد يدويًا.'
            },
            en: {
                eduSecAria: 'Educational information about the evening adhkar',
                edu1T: 'The virtue of the evening adhkar at the close of the day',
                edu1P1: 'The evening adhkar are among the daily acts that help a Muslim seal their day with the remembrance of Allah and reliance upon Him. They contain a reminder of His oneness, seeking forgiveness, and seeking protection from harm. Reciting them in the evening helps bring presence of heart and tranquility, and ties the end of the day to obedience and serenity.',
                edu1P2: 'You can read the adhkar in full order, or return to those that need repetition using the counter, while your progress is saved automatically through the evening in the same browser.',
                edu2T: 'How to use the evening adhkar page',
                edu2P1: 'This page is designed to be easy to read on phone and desktop. Each dhikr appears in its own card with its repeat count and source, and the adhkar that need repeating show a counter that helps you complete the number without losing count.',
                edu2P2: 'When you complete a given dhikr, the page moves automatically to the next one for a smoother reading. Your progress is also saved through the evening, and the counters restart when the day changes according to your device’s local time.',
                edu3T: 'The difference between the morning and evening adhkar',
                edu3P1: 'The morning and evening adhkar share a number of remembrances and verses, such as Ayat al-Kursi, the Mu‘awwidhat, and some supplications for protection and well-being, but some wordings differ by time, such as saying “we have reached the morning” in the morning and “we have reached the evening” in the evening.',
                edu3P2: 'It is therefore better to read each section from its own page so the wordings suited to the time appear, and so the repetition is saved independently for each section.',
                linksAria: 'Related links',
                lnkBack: 'Back to Adhkar',
                lnkMorning: 'Morning Athkar',
                lnkPrayer: 'Prayer Adhkar',
                lnkPrayerTimes: 'Prayer Times Today',
                lnkQibla: 'Qibla Direction',
                lnkHijri: 'Today’s Hijri Date',
                lnkMoon: 'Moon Phase Today',
                faqTitle: 'Frequently asked questions about the evening adhkar',
                faqQ1: 'What are the evening adhkar?',
                faqA1: 'The evening adhkar are supplications, verses, and remembrances that a Muslim reads at the time of evening, containing affirmation of Allah’s oneness, seeking forgiveness, and asking for protection and well-being. They are said following what is reported in the Sunnah and the well-known authentic adhkar.',
                faqQ2: 'When is the time for the evening adhkar?',
                faqA2: 'The time for the evening adhkar begins after the Asr prayer according to many scholars and extends into the night. It is best to read them at the start of the evening when possible, so that the Muslim begins their night with the remembrance of Allah and seeking protection.',
                faqQ3: 'Must the evening adhkar be read in order?',
                faqA3: 'No specific order is required for reading the evening adhkar, but reading them in order on the page helps you stay organized and not forget any dhikr, especially the adhkar that need repetition.',
                faqQ4: 'What is the benefit of repetition in the evening adhkar?',
                faqA4: 'Some evening adhkar are reported with a specific number of repetitions, such as three, seven, or one hundred times. The counter on the page therefore helps you complete the required number without error or forgetting.',
                faqQ5: 'Are the sources of the evening adhkar shown on the page?',
                faqA5: 'Yes, the source is shown with each dhikr to help the reader know where it comes from, along with the virtue or the note related to the dhikr when available.',
                faqQ6: 'Can the evening adhkar be read from a phone?',
                faqA6: 'Yes, the page is designed to make reading the evening adhkar easy from phone and computer, with clear cards, an interactive counter, and automatic saving of progress.',
                faqQ7: 'What do I do if I forget the evening adhkar?',
                faqA7: 'If you forget the evening adhkar in their time, read whatever is easy of them when you remember, and keep reading them in their time in the following days as much as you are able.',
                faqQ8: 'Does this page save my evening adhkar progress automatically?',
                faqA8: 'Yes, the page saves your progress automatically through the evening in the same browser, then the counters return to the start when the day changes according to your device’s local time.',
                faqQ9: 'What is the benefit of the evening adhkar counter?',
                faqA9: 'The evening adhkar counter helps you complete the repeated adhkar easily, especially the adhkar said three, seven, or one hundred times, without needing to count manually.'
            },
            fr: {
                eduSecAria: 'Informations pédagogiques sur les invocations du soir',
                edu1T: 'Le mérite des invocations du soir à la fin de la journée',
                edu1P1: 'Les invocations du soir font partie des actes quotidiens qui aident le musulman à clore sa journée par le rappel d’Allah et la confiance en Lui. Elles renferment un rappel de Son unicité, la demande de pardon et la protection contre les maux. Les réciter le soir aide à la présence du cœur et à la sérénité, et relie la fin de la journée à l’obéissance et à la quiétude.',
                edu1P2: 'Vous pouvez lire les invocations en entier dans l’ordre, ou revenir à celles qui doivent être répétées à l’aide du compteur, votre progression étant enregistrée automatiquement au cours de la soirée dans le même navigateur.',
                edu2T: 'Comment utiliser la page des invocations du soir',
                edu2P1: 'Cette page est conçue pour être facile à lire sur téléphone et sur ordinateur. Chaque invocation apparaît dans une carte distincte avec son nombre de répétitions et sa source, et celles qui doivent être répétées affichent un compteur qui vous aide à atteindre le nombre sans l’oublier.',
                edu2P2: 'Lorsque vous terminez une invocation, la page passe automatiquement à la suivante pour une lecture plus fluide. Votre progression est aussi enregistrée durant la soirée, et les compteurs repartent de zéro au changement de jour selon l’heure locale de votre appareil.',
                edu3T: 'La différence entre les invocations du matin et du soir',
                edu3P1: 'Les invocations du matin et du soir partagent plusieurs rappels et versets, comme le Verset du Trône, les sourates protectrices et certaines demandes de protection et de bien-être, mais certaines formules diffèrent selon le moment, comme dire « nous voici au matin » le matin et « nous voici au soir » le soir.',
                edu3P2: 'Il est donc préférable de lire chaque section depuis sa propre page afin que les formules adaptées au moment apparaissent, et que la répétition soit enregistrée séparément pour chaque section.',
                linksAria: 'Liens connexes',
                lnkBack: 'Retour aux invocations',
                lnkMorning: 'Invocations du matin',
                lnkPrayer: 'Invocations de la prière',
                lnkPrayerTimes: 'Horaires de prière aujourd’hui',
                lnkQibla: 'Direction de la Qibla',
                lnkHijri: 'Date hégirienne du jour',
                lnkMoon: 'Phase de la lune aujourd’hui',
                faqTitle: 'Questions fréquentes sur les invocations du soir',
                faqQ1: 'Que sont les invocations du soir ?',
                faqA1: 'Les invocations du soir sont des demandes, des versets et des rappels que le musulman lit au moment du soir, comprenant l’affirmation de l’unicité d’Allah, la demande de pardon et la demande de protection et de bien-être. Elles se disent en suivant ce qui est rapporté dans la Sunna et les invocations authentiques bien connues.',
                faqQ2: 'Quel est le moment des invocations du soir ?',
                faqA2: 'Le moment des invocations du soir commence après la prière du ‘Asr selon de nombreux savants et se prolonge jusque dans la nuit. Il est préférable de les lire au début de la soirée autant que possible, afin que le musulman commence sa nuit par le rappel d’Allah et la demande de protection.',
                faqQ3: 'Faut-il lire les invocations du soir dans l’ordre ?',
                faqA3: 'Aucun ordre précis n’est requis pour lire les invocations du soir, mais les lire dans l’ordre sur la page aide à s’organiser et à ne pas oublier une invocation, surtout celles qui doivent être répétées.',
                faqQ4: 'Quel est l’intérêt de la répétition dans les invocations du soir ?',
                faqA4: 'Certaines invocations du soir sont rapportées avec un nombre précis de répétitions, comme trois, sept ou cent fois. Le compteur de la page vous aide donc à atteindre le nombre requis sans erreur ni oubli.',
                faqQ5: 'Les sources des invocations du soir sont-elles indiquées sur la page ?',
                faqA5: 'Oui, la source est indiquée avec chaque invocation pour aider le lecteur à savoir d’où elle provient, avec le mérite ou la remarque liée à l’invocation lorsqu’ils sont disponibles.',
                faqQ6: 'Peut-on lire les invocations du soir depuis un téléphone ?',
                faqA6: 'Oui, la page est conçue pour faciliter la lecture des invocations du soir depuis un téléphone et un ordinateur, avec des cartes claires, un compteur interactif et un enregistrement automatique de la progression.',
                faqQ7: 'Que faire si j’oublie les invocations du soir ?',
                faqA7: 'Si vous oubliez les invocations du soir en leur temps, lisez ce qui vous est facile dès que vous vous en souvenez, et veillez à les lire en leur temps les jours suivants dans la mesure de vos capacités.',
                faqQ8: 'Cette page enregistre-t-elle automatiquement ma progression des invocations du soir ?',
                faqA8: 'Oui, la page enregistre votre progression automatiquement durant la soirée dans le même navigateur, puis les compteurs repartent de zéro au changement de jour selon l’heure locale de votre appareil.',
                faqQ9: 'Quel est l’intérêt du compteur des invocations du soir ?',
                faqA9: 'Le compteur des invocations du soir vous aide à accomplir facilement les invocations répétées, surtout celles qui se disent trois, sept ou cent fois, sans avoir besoin de compter à la main.'
            },
            ur: {
                eduSecAria: 'شام کے اذکار کے بارے میں تعلیمی معلومات',
                edu1T: 'دن کے اختتام پر شام کے اذکار کی فضیلت',
                edu1P1: 'شام کے اذکار ان روزمرہ اعمال میں سے ہیں جو مسلمان کو اپنے دن کا اختتام اللہ کے ذکر اور اُس پر توکل کے ساتھ کرنے میں مدد دیتے ہیں۔ ان میں توحید کی یاد دہانی، استغفار اور شرور سے حفاظت کی دعا شامل ہے۔ شام میں ان کا پڑھنا دل کی حاضری اور سکون میں مدد دیتا ہے، اور دن کے اختتام کو طاعت اور اطمینان سے جوڑتا ہے۔',
                edu1P2: 'صارف اذکار کو ترتیب کے ساتھ مکمل پڑھ سکتا ہے، یا جن اذکار کو دہرانے کی ضرورت ہو اُن پر شمار کنندہ کے ذریعے واپس آ سکتا ہے، جبکہ آپ کی پیش رفت شام بھر اسی براؤزر میں خودبخود محفوظ رہتی ہے۔',
                edu2T: 'شام کے اذکار کا صفحہ کیسے استعمال کریں؟',
                edu2P1: 'یہ صفحہ فون اور کمپیوٹر پر آسانی سے پڑھنے کے لیے بنایا گیا ہے۔ ہر ذکر ایک الگ کارڈ میں تعداد اور حوالے کے ساتھ ظاہر ہوتا ہے، اور جن اذکار کو دہرانے کی ضرورت ہو اُن پر ایک شمار کنندہ ظاہر ہوتا ہے جو آپ کو تعداد بھولے بغیر مکمل کرنے میں مدد دیتا ہے۔',
                edu2P2: 'جب آپ کوئی ذکر مکمل کرتے ہیں تو صفحہ خودبخود اگلے ذکر پر منتقل ہو جاتا ہے تاکہ پڑھنا زیادہ روانی سے ہو۔ آپ کی پیش رفت بھی شام بھر محفوظ رہتی ہے، اور دن بدلنے پر آپ کے آلے کے مقامی وقت کے مطابق شمار کنندہ دوبارہ صفر سے شروع ہو جاتے ہیں۔',
                edu3T: 'صبح اور شام کے اذکار میں فرق',
                edu3P1: 'صبح اور شام کے اذکار میں کئی اذکار اور آیات مشترک ہیں، جیسے آیت الکرسی، معوذات اور حفاظت و عافیت کی بعض دعائیں، لیکن بعض صیغے وقت کے مطابق مختلف ہوتے ہیں، جیسے صبح میں «ہم نے صبح کی» اور شام میں «ہم نے شام کی» کہنا۔',
                edu3P2: 'اس لیے بہتر ہے کہ ہر حصہ اپنے مخصوص صفحے سے پڑھا جائے تاکہ وقت کے مناسب صیغے ظاہر ہوں، اور ہر حصے کے لیے تکرار الگ محفوظ رہے۔',
                linksAria: 'متعلقہ روابط',
                lnkBack: 'اذکار کی طرف واپس',
                lnkMorning: 'صبح کے اذکار',
                lnkPrayer: 'نماز کے اذکار',
                lnkPrayerTimes: 'آج کے نماز کے اوقات',
                lnkQibla: 'قبلہ کی سمت',
                lnkHijri: 'آج کی ہجری تاریخ',
                lnkMoon: 'آج چاند کی حالت',
                faqTitle: 'شام کے اذکار کے بارے میں اکثر پوچھے جانے والے سوالات',
                faqQ1: 'شام کے اذکار کیا ہیں؟',
                faqA1: 'شام کے اذکار وہ دعائیں، آیات اور اذکار ہیں جو مسلمان شام کے وقت پڑھتا ہے، ان میں توحید، استغفار اور حفاظت و عافیت کی دعا ہے، اور یہ سنت میں وارد اور معروف صحیح اذکار کی پیروی میں کہے جاتے ہیں۔',
                faqQ2: 'شام کے اذکار پڑھنے کا وقت کب ہے؟',
                faqA2: 'شام کے اذکار کا وقت اہلِ علم میں سے بہت سوں کے نزدیک عصر کے بعد شروع ہوتا ہے اور رات تک رہتا ہے۔ بہتر یہ ہے کہ حسبِ استطاعت انہیں شام کے اول وقت میں پڑھا جائے تاکہ مسلمان اپنی رات کا آغاز اللہ کے ذکر اور حفاظت کی دعا سے کرے۔',
                faqQ3: 'کیا شام کے اذکار ترتیب کے ساتھ پڑھنا ضروری ہے؟',
                faqA3: 'شام کے اذکار کے لیے کوئی خاص ترتیب ضروری نہیں، لیکن صفحے پر انہیں ترتیب سے پڑھنا نظم اور کسی ذکر کو نہ بھولنے میں مدد دیتا ہے، خاص طور پر اُن اذکار میں جنہیں دہرانے کی ضرورت ہو۔',
                faqQ4: 'شام کے اذکار میں تکرار کا کیا فائدہ ہے؟',
                faqA4: 'بعض شام کے اذکار ایک مخصوص تعداد کے ساتھ وارد ہوئے ہیں، جیسے تین بار، سات بار یا سو بار۔ اس لیے صفحے کا شمار کنندہ آپ کو مطلوبہ تعداد بغیر غلطی یا بھول کے مکمل کرنے میں مدد دیتا ہے۔',
                faqQ5: 'کیا شام کے اذکار کے حوالے صفحے پر ظاہر ہوتے ہیں؟',
                faqA5: 'جی ہاں، ہر ذکر کے ساتھ اس کا حوالہ ظاہر ہوتا ہے تاکہ قاری کو معلوم ہو کہ یہ کہاں سے آیا ہے، اور دستیاب ہونے پر ذکر سے متعلق فضیلت یا نوٹ بھی دکھایا جاتا ہے۔',
                faqQ6: 'کیا شام کے اذکار فون سے پڑھے جا سکتے ہیں؟',
                faqA6: 'جی ہاں، یہ صفحہ شام کے اذکار کو فون اور کمپیوٹر سے آسانی سے پڑھنے کے لیے بنایا گیا ہے، واضح کارڈز، ایک متعامل شمار کنندہ اور پیش رفت کی خودکار حفاظت کے ساتھ۔',
                faqQ7: 'اگر میں شام کے اذکار بھول جاؤں تو کیا کروں؟',
                faqA7: 'اگر آپ شام کے اذکار اپنے وقت میں بھول جائیں تو یاد آنے پر جو میسر ہو وہ پڑھ لیں، اور آنے والے دنوں میں حسبِ استطاعت انہیں اُن کے وقت میں پڑھنے کا اہتمام رکھیں۔',
                faqQ8: 'کیا یہ صفحہ شام کے اذکار میں میری پیش رفت خودبخود محفوظ کرتا ہے؟',
                faqA8: 'جی ہاں، صفحہ آپ کی پیش رفت شام بھر اسی براؤزر میں خودبخود محفوظ رکھتا ہے، پھر دن بدلنے پر آپ کے آلے کے مقامی وقت کے مطابق شمار کنندہ دوبارہ شروع سے شروع ہو جاتے ہیں۔',
                faqQ9: 'شام کے اذکار کے شمار کنندہ کا کیا فائدہ ہے؟',
                faqA9: 'شام کے اذکار کا شمار کنندہ آپ کو دہرائے جانے والے اذکار آسانی سے مکمل کرنے میں مدد دیتا ہے، خاص طور پر وہ اذکار جو تین بار، سات بار یا سو بار کہے جاتے ہیں، بغیر ہاتھ سے گننے کی ضرورت کے۔'
            },
            tr: {
                eduSecAria: 'Akşam zikirleri hakkında eğitici bilgiler',
                edu1T: 'Günün sonunda akşam zikirlerinin fazileti',
                edu1P1: 'Akşam zikirleri, Müslümanın gününü Allah’ı anarak ve O’na tevekkül ederek bitirmesine yardımcı olan günlük amellerdendir. İçlerinde tevhidin hatırlatılması, istiğfar ve kötülüklerden korunma duası bulunur. Akşam okunması kalbin huzuruna ve sükûnete yardım eder, günün sonunu itaat ve huzura bağlar.',
                edu1P2: 'Zikirleri sırasıyla baştan sona okuyabilir veya sayaç yardımıyla tekrar edilmesi gerekenlere dönebilirsiniz; ilerlemeniz akşam boyunca aynı tarayıcıda otomatik olarak kaydedilir.',
                edu2T: 'Akşam zikirleri sayfası nasıl kullanılır?',
                edu2P1: 'Bu sayfa telefonda ve bilgisayarda kolay okunacak şekilde tasarlanmıştır. Her zikir, tekrar sayısı ve kaynağıyla birlikte ayrı bir kartta görünür; tekrar edilmesi gereken zikirlerde, sayıyı unutmadan tamamlamanıza yardımcı olan bir sayaç bulunur.',
                edu2P2: 'Bir zikri tamamladığınızda, okuma daha akıcı olsun diye sayfa otomatik olarak bir sonrakine geçer. İlerlemeniz de akşam boyunca kaydedilir ve gün değiştiğinde cihazınızın yerel saatine göre sayaçlar en baştan başlar.',
                edu3T: 'Sabah ve akşam zikirleri arasındaki fark',
                edu3P1: 'Sabah ve akşam zikirleri; Âyetü’l-Kürsî, Muavvizât ve bazı korunma ve afiyet duaları gibi birçok zikir ve âyeti ortak paylaşır, ancak bazı lafızlar vakte göre değişir; örneğin sabah « sabaha erdik », akşam « akşama erdik » demek gibi.',
                edu3P2: 'Bu yüzden her bölümü kendi sayfasından okumak daha iyidir; böylece vakte uygun lafızlar görünür ve tekrar, her bölüm için ayrı ayrı kaydedilir.',
                linksAria: 'İlgili bağlantılar',
                lnkBack: 'Zikirlere dön',
                lnkMorning: 'Sabah Zikirleri',
                lnkPrayer: 'Namaz Zikirleri',
                lnkPrayerTimes: 'Bugünkü Namaz Vakitleri',
                lnkQibla: 'Kıble Yönü',
                lnkHijri: 'Bugünün Hicri Tarihi',
                lnkMoon: 'Bugün Ayın Durumu',
                faqTitle: 'Akşam zikirleri hakkında sık sorulan sorular',
                faqQ1: 'Akşam zikirleri nedir?',
                faqA1: 'Akşam zikirleri, Müslümanın akşam vaktinde okuduğu dua, âyet ve zikirlerdir; içlerinde tevhid, istiğfar ve korunma ile afiyet istekleri bulunur ve sünnette gelen ve meşhur sahih zikirlere uyularak söylenir.',
                faqQ2: 'Akşam zikirlerinin vakti ne zamandır?',
                faqA2: 'Akşam zikirlerinin vakti birçok âlime göre ikindi namazından sonra başlar ve geceye kadar uzar. En iyisi, Müslümanın gecesine Allah’ı anarak ve korunma dileyerek başlaması için, mümkün olduğunca akşamın ilk vaktinde okumaktır.',
                faqQ3: 'Akşam zikirlerini sırayla okumak gerekir mi?',
                faqA3: 'Akşam zikirleri için belirli bir sıra gerekmez, ancak sayfada sırayla okumak düzeni korumaya ve hiçbir zikri unutmamaya yardımcı olur, özellikle tekrar edilmesi gereken zikirlerde.',
                faqQ4: 'Akşam zikirlerinde tekrarın faydası nedir?',
                faqA4: 'Bazı akşam zikirleri üç, yedi ya da yüz kez gibi belirli bir tekrar sayısıyla nakledilmiştir. Bu nedenle sayfadaki sayaç, gerekli sayıyı hatasız ve unutmadan tamamlamanıza yardımcı olur.',
                faqQ5: 'Akşam zikirlerinin kaynakları sayfada gösterilir mi?',
                faqA5: 'Evet, her zikirle birlikte kaynağı gösterilir; böylece okuyucu nereden geldiğini bilir, ayrıca mevcut olduğunda zikre ilişkin fazilet veya not da gösterilir.',
                faqQ6: 'Akşam zikirleri telefondan okunabilir mi?',
                faqA6: 'Evet, sayfa akşam zikirlerinin telefon ve bilgisayardan kolayca okunması için tasarlanmıştır; açık kartlar, etkileşimli bir sayaç ve ilerlemenin otomatik kaydıyla.',
                faqQ7: 'Akşam zikirlerini unutursam ne yapmalıyım?',
                faqA7: 'Akşam zikirlerini vaktinde unutursanız, hatırladığınızda kolayınıza geleni okuyun ve sonraki günlerde imkânınız ölçüsünde onları vaktinde okumaya özen gösterin.',
                faqQ8: 'Bu sayfa akşam zikirlerindeki ilerlememi otomatik kaydeder mi?',
                faqA8: 'Evet, sayfa ilerlemenizi akşam boyunca aynı tarayıcıda otomatik olarak kaydeder; ardından gün değiştiğinde cihazınızın yerel saatine göre sayaçlar en baştan başlar.',
                faqQ9: 'Akşam zikirleri sayacının faydası nedir?',
                faqA9: 'Akşam zikirleri sayacı, özellikle üç, yedi ya da yüz kez söylenen zikirleri elle saymanıza gerek kalmadan kolayca tamamlamanıza yardımcı olur.'
            },
            bn: {
                eduSecAria: 'সন্ধ্যার যিকির সম্পর্কে শিক্ষামূলক তথ্য',
                edu1T: 'দিনের শেষে সন্ধ্যার যিকিরের ফজিলত',
                edu1P1: 'সন্ধ্যার যিকির সেই দৈনন্দিন আমলগুলোর অন্তর্ভুক্ত যা একজন মুসলিমকে আল্লাহর স্মরণ ও তাঁর ওপর ভরসার মাধ্যমে দিন শেষ করতে সাহায্য করে। এতে একত্ববাদের স্মরণ, ইস্তিগফার এবং অনিষ্ট থেকে রক্ষার দোয়া রয়েছে। সন্ধ্যায় এগুলো পাঠ অন্তরের উপস্থিতি ও প্রশান্তি আনতে সাহায্য করে এবং দিনের শেষকে আনুগত্য ও প্রশান্তির সঙ্গে যুক্ত করে।',
                edu1P2: 'ব্যবহারকারী যিকিরগুলো ক্রমানুসারে পূর্ণ পাঠ করতে পারেন, অথবা কাউন্টারের সাহায্যে যেসব যিকির পুনরাবৃত্তির প্রয়োজন সেগুলোতে ফিরে যেতে পারেন, আর আপনার অগ্রগতি সন্ধ্যা জুড়ে একই ব্রাউজারে স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে।',
                edu2T: 'সন্ধ্যার যিকিরের পৃষ্ঠা কীভাবে ব্যবহার করবেন?',
                edu2P1: 'এই পৃষ্ঠাটি ফোন ও কম্পিউটারে সহজে পড়ার জন্য তৈরি করা হয়েছে। প্রতিটি যিকির তার পুনরাবৃত্তির সংখ্যা ও উৎসসহ একটি আলাদা কার্ডে দেখা যায়, আর যেসব যিকির পুনরাবৃত্তির প্রয়োজন সেগুলোতে একটি কাউন্টার থাকে যা সংখ্যা না ভুলে সম্পূর্ণ করতে সাহায্য করে।',
                edu2P2: 'কোনো যিকির সম্পূর্ণ হলে পাঠ আরও সাবলীল করতে পৃষ্ঠা স্বয়ংক্রিয়ভাবে পরবর্তী যিকিরে চলে যায়। আপনার অগ্রগতিও সন্ধ্যা জুড়ে সংরক্ষিত থাকে, এবং আপনার ডিভাইসের স্থানীয় সময় অনুযায়ী দিন পরিবর্তিত হলে কাউন্টারগুলো আবার শুরু থেকে শুরু হয়।',
                edu3T: 'সকাল ও সন্ধ্যার যিকিরের মধ্যে পার্থক্য',
                edu3P1: 'সকাল ও সন্ধ্যার যিকিরে বেশ কিছু যিকির ও আয়াত অভিন্ন, যেমন আয়াতুল কুরসি, মুআওবিযাত এবং রক্ষা ও সুস্থতার কিছু দোয়া, তবে কিছু শব্দরূপ সময় অনুযায়ী ভিন্ন হয়, যেমন সকালে «আমরা সকালে উপনীত হলাম» এবং সন্ধ্যায় «আমরা সন্ধ্যায় উপনীত হলাম» বলা।',
                edu3P2: 'তাই প্রতিটি অংশ তার নিজস্ব পৃষ্ঠা থেকে পড়া উত্তম, যাতে সময়ের উপযোগী শব্দরূপ দেখা যায় এবং প্রতিটি অংশের পুনরাবৃত্তি আলাদাভাবে সংরক্ষিত থাকে।',
                linksAria: 'সম্পর্কিত লিঙ্ক',
                lnkBack: 'যিকিরে ফিরে যান',
                lnkMorning: 'সকালের যিকির',
                lnkPrayer: 'নামাজের যিকির',
                lnkPrayerTimes: 'আজকের নামাজের সময়',
                lnkQibla: 'কিবলার দিক',
                lnkHijri: 'আজকের হিজরি তারিখ',
                lnkMoon: 'আজ চাঁদের অবস্থা',
                faqTitle: 'সন্ধ্যার যিকির সম্পর্কে সাধারণ জিজ্ঞাসা',
                faqQ1: 'সন্ধ্যার যিকির কী?',
                faqA1: 'সন্ধ্যার যিকির হলো দোয়া, আয়াত ও যিকির যা একজন মুসলিম সন্ধ্যার সময় পাঠ করেন; এতে একত্ববাদ, ইস্তিগফার এবং রক্ষা ও সুস্থতার প্রার্থনা রয়েছে, আর তা সুন্নাহয় বর্ণিত ও সুপরিচিত সহিহ যিকিরের অনুসরণে বলা হয়।',
                faqQ2: 'সন্ধ্যার যিকির পড়ার সময় কখন?',
                faqA2: 'সন্ধ্যার যিকিরের সময় অনেক আলেমের মতে আসরের পর শুরু হয় এবং রাত পর্যন্ত থাকে। উত্তম হলো সাধ্যমতো সন্ধ্যার প্রথম সময়ে এগুলো পড়া, যাতে মুসলিম তার রাত আল্লাহর স্মরণ ও রক্ষার প্রার্থনা দিয়ে শুরু করেন।',
                faqQ3: 'সন্ধ্যার যিকির কি ক্রমানুসারে পড়া জরুরি?',
                faqA3: 'সন্ধ্যার যিকিরের জন্য নির্দিষ্ট কোনো ক্রম জরুরি নয়, তবে পৃষ্ঠায় ক্রমানুসারে পড়া গোছানো রাখতে ও কোনো যিকির না ভুলতে সাহায্য করে, বিশেষত যেসব যিকির পুনরাবৃত্তির প্রয়োজন।',
                faqQ4: 'সন্ধ্যার যিকিরে পুনরাবৃত্তির উপকার কী?',
                faqA4: 'কিছু সন্ধ্যার যিকির নির্দিষ্ট সংখ্যক পুনরাবৃত্তিসহ বর্ণিত হয়েছে, যেমন তিনবার, সাতবার বা একশবার। তাই পৃষ্ঠার কাউন্টার আপনাকে ভুল বা বিস্মৃতি ছাড়াই প্রয়োজনীয় সংখ্যা সম্পূর্ণ করতে সাহায্য করে।',
                faqQ5: 'সন্ধ্যার যিকিরের উৎস কি পৃষ্ঠায় দেখানো হয়?',
                faqA5: 'হ্যাঁ, প্রতিটি যিকিরের সঙ্গে এর উৎস দেখানো হয় যাতে পাঠক জানতে পারেন এটি কোথা থেকে এসেছে, আর যিকির সম্পর্কিত ফজিলত বা নোট থাকলে তা-ও দেখানো হয়।',
                faqQ6: 'সন্ধ্যার যিকির কি ফোন থেকে পড়া যায়?',
                faqA6: 'হ্যাঁ, পৃষ্ঠাটি ফোন ও কম্পিউটার থেকে সন্ধ্যার যিকির সহজে পড়ার জন্য তৈরি, স্পষ্ট কার্ড, একটি ইন্টারেক্টিভ কাউন্টার এবং অগ্রগতির স্বয়ংক্রিয় সংরক্ষণসহ।',
                faqQ7: 'সন্ধ্যার যিকির ভুলে গেলে আমি কী করব?',
                faqA7: 'সন্ধ্যার যিকির সময়মতো ভুলে গেলে, মনে পড়ামাত্র যা সহজ হয় তা পড়ুন, এবং পরবর্তী দিনগুলোতে সাধ্যমতো সময়মতো এগুলো পড়ার যত্ন নিন।',
                faqQ8: 'এই পৃষ্ঠা কি সন্ধ্যার যিকিরে আমার অগ্রগতি স্বয়ংক্রিয়ভাবে সংরক্ষণ করে?',
                faqA8: 'হ্যাঁ, পৃষ্ঠাটি আপনার অগ্রগতি সন্ধ্যা জুড়ে একই ব্রাউজারে স্বয়ংক্রিয়ভাবে সংরক্ষণ করে, এরপর আপনার ডিভাইসের স্থানীয় সময় অনুযায়ী দিন পরিবর্তিত হলে কাউন্টারগুলো নতুন করে শুরু হয়।',
                faqQ9: 'সন্ধ্যার যিকিরের কাউন্টারের উপকার কী?',
                faqA9: 'সন্ধ্যার যিকিরের কাউন্টার আপনাকে পুনরাবৃত্তিমূলক যিকির সহজে সম্পূর্ণ করতে সাহায্য করে, বিশেষত যেসব যিকির তিনবার, সাতবার বা একশবার বলা হয়, হাতে গোনার প্রয়োজন ছাড়াই।'
            },
            ms: {
                eduSecAria: 'Maklumat pendidikan tentang zikir petang',
                edu1T: 'Kelebihan zikir petang pada penghujung hari',
                edu1P1: 'Zikir petang termasuk amalan harian yang membantu seorang Muslim menutup harinya dengan mengingati Allah dan bertawakal kepada-Nya. Ia mengandungi peringatan tentang keesaan Allah, istighfar, dan memohon perlindungan daripada keburukan. Membacanya pada waktu petang membantu menghadirkan hati dan ketenangan, serta mengikat penghujung hari dengan ketaatan dan kedamaian.',
                edu1P2: 'Pengguna boleh membaca zikir secara lengkap mengikut susunan, atau kembali kepada zikir yang perlu diulang menggunakan kaunter, sementara kemajuan anda disimpan secara automatik sepanjang petang dalam pelayar yang sama.',
                edu2T: 'Bagaimana menggunakan halaman zikir petang?',
                edu2P1: 'Halaman ini direka supaya mudah dibaca pada telefon dan komputer. Setiap zikir dipaparkan dalam kad tersendiri bersama bilangan ulangan dan sumbernya, dan zikir yang perlu diulang dipaparkan dengan kaunter yang membantu anda melengkapkan bilangannya tanpa terlupa.',
                edu2P2: 'Apabila anda melengkapkan sesuatu zikir, halaman berpindah secara automatik ke zikir seterusnya supaya bacaan lebih lancar. Kemajuan anda juga disimpan sepanjang petang, dan kaunter bermula semula apabila hari bertukar mengikut waktu tempatan peranti anda.',
                edu3T: 'Perbezaan antara zikir pagi dan petang',
                edu3P1: 'Zikir pagi dan petang berkongsi beberapa zikir dan ayat, seperti Ayat al-Kursi, al-Mu‘awwizat, dan sebahagian doa perlindungan serta afiat, tetapi sebahagian lafaz berbeza mengikut waktu, seperti menyebut « kami memasuki waktu pagi » pada pagi dan « kami memasuki waktu petang » pada petang.',
                edu3P2: 'Oleh itu, lebih baik membaca setiap bahagian daripada halamannya sendiri supaya lafaz yang sesuai dengan waktu dipaparkan, dan ulangan disimpan secara berasingan bagi setiap bahagian.',
                linksAria: 'Pautan berkaitan',
                lnkBack: 'Kembali ke Zikir',
                lnkMorning: 'Zikir Pagi',
                lnkPrayer: 'Zikir Solat',
                lnkPrayerTimes: 'Waktu Solat Hari Ini',
                lnkQibla: 'Arah Kiblat',
                lnkHijri: 'Tarikh Hijrah Hari Ini',
                lnkMoon: 'Fasa Bulan Hari Ini',
                faqTitle: 'Soalan lazim tentang zikir petang',
                faqQ1: 'Apakah zikir petang?',
                faqA1: 'Zikir petang ialah doa, ayat, dan zikir yang dibaca seorang Muslim pada waktu petang; ia mengandungi pengesaan keesaan Allah, istighfar, serta permohonan perlindungan dan afiat, dan disebut dengan mengikuti apa yang diriwayatkan dalam Sunnah dan zikir sahih yang masyhur.',
                faqQ2: 'Bilakah waktu membaca zikir petang?',
                faqA2: 'Waktu zikir petang bermula selepas solat Asar menurut ramai ulama dan berterusan hingga malam. Yang terbaik ialah membacanya pada awal petang jika boleh, supaya seorang Muslim memulakan malamnya dengan mengingati Allah dan memohon perlindungan.',
                faqQ3: 'Adakah zikir petang wajib dibaca mengikut susunan?',
                faqA3: 'Tiada susunan tertentu diperlukan untuk membaca zikir petang, tetapi membacanya mengikut susunan pada halaman membantu anda kekal teratur dan tidak terlupa sebarang zikir, terutamanya zikir yang perlu diulang.',
                faqQ4: 'Apakah faedah pengulangan dalam zikir petang?',
                faqA4: 'Sebahagian zikir petang diriwayatkan dengan bilangan ulangan tertentu, seperti tiga kali, tujuh kali, atau seratus kali. Oleh itu, kaunter pada halaman membantu anda melengkapkan bilangan yang diperlukan tanpa silap atau terlupa.',
                faqQ5: 'Adakah sumber zikir petang dipaparkan pada halaman?',
                faqA5: 'Ya, sumber dipaparkan bersama setiap zikir untuk membantu pembaca mengetahui asalnya, berserta kelebihan atau nota berkaitan zikir apabila tersedia.',
                faqQ6: 'Bolehkah zikir petang dibaca daripada telefon?',
                faqA6: 'Ya, halaman ini direka untuk memudahkan bacaan zikir petang daripada telefon dan komputer, dengan kad yang jelas, kaunter interaktif, dan penyimpanan kemajuan secara automatik.',
                faqQ7: 'Apa yang perlu saya lakukan jika terlupa zikir petang?',
                faqA7: 'Jika anda terlupa zikir petang pada waktunya, bacalah apa yang mudah bagi anda apabila teringat, dan berusahalah membacanya pada waktunya pada hari-hari berikutnya sedaya mungkin.',
                faqQ8: 'Adakah halaman ini menyimpan kemajuan zikir petang saya secara automatik?',
                faqA8: 'Ya, halaman ini menyimpan kemajuan anda sepanjang petang dalam pelayar yang sama, kemudian kaunter bermula semula apabila hari bertukar mengikut waktu tempatan peranti anda.',
                faqQ9: 'Apakah faedah kaunter zikir petang?',
                faqA9: 'Kaunter zikir petang membantu anda melengkapkan zikir berulang dengan mudah, terutamanya zikir yang disebut tiga kali, tujuh kali, atau seratus kali, tanpa perlu mengira dengan tangan.'
            },
            de: {
                eduSecAria: 'Lehrreiche Informationen über die Abend-Adhkar',
                edu1T: 'Der Vorzug der Abend-Adhkar am Ende des Tages',
                edu1P1: 'Die Abend-Adhkar gehören zu den täglichen Handlungen, die dem Muslim helfen, seinen Tag mit dem Gedenken Allahs und dem Vertrauen auf Ihn zu beschließen. Sie enthalten eine Erinnerung an Seine Einheit, das Bitten um Vergebung und den Schutz vor Übeln. Sie am Abend zu rezitieren, hilft zur Anwesenheit des Herzens und zur Gelassenheit und verbindet das Ende des Tages mit Gehorsam und Ruhe.',
                edu1P2: 'Der Nutzer kann die Adhkar der Reihe nach vollständig lesen oder mit dem Zähler zu jenen zurückkehren, die wiederholt werden müssen, während dein Fortschritt über den Abend hinweg automatisch im selben Browser gespeichert wird.',
                edu2T: 'Wie benutzt man die Seite der Abend-Adhkar?',
                edu2P1: 'Diese Seite ist so gestaltet, dass sie auf Telefon und Computer leicht zu lesen ist. Jeder Dhikr erscheint in einer eigenen Karte mit seiner Wiederholungszahl und Quelle, und die Adhkar, die wiederholt werden müssen, zeigen einen Zähler, der dir hilft, die Zahl zu vervollständigen, ohne den Überblick zu verlieren.',
                edu2P2: 'Wenn du einen bestimmten Dhikr abgeschlossen hast, wechselt die Seite für ein flüssigeres Lesen automatisch zum nächsten. Auch dein Fortschritt wird über den Abend gespeichert, und die Zähler beginnen von Neuem, wenn der Tag gemäß der Ortszeit deines Geräts wechselt.',
                edu3T: 'Der Unterschied zwischen den Morgen- und Abend-Adhkar',
                edu3P1: 'Die Morgen- und Abend-Adhkar teilen mehrere Gedenkformeln und Verse, wie den Thronvers, die Schutzsuren und einige Bittgebete um Schutz und Wohlergehen, doch manche Formulierungen unterscheiden sich je nach Zeit, etwa das Sagen « wir sind in den Morgen eingetreten » am Morgen und « wir sind in den Abend eingetreten » am Abend.',
                edu3P2: 'Daher ist es besser, jeden Abschnitt von seiner eigenen Seite zu lesen, damit die der Zeit entsprechenden Formulierungen erscheinen und die Wiederholung für jeden Abschnitt getrennt gespeichert wird.',
                linksAria: 'Verwandte Links',
                lnkBack: 'Zurück zu den Adhkar',
                lnkMorning: 'Morgen-Adhkar',
                lnkPrayer: 'Gebets-Adhkar',
                lnkPrayerTimes: 'Gebetszeiten heute',
                lnkQibla: 'Qibla-Richtung',
                lnkHijri: 'Heutiges Hidschri-Datum',
                lnkMoon: 'Mondphase heute',
                faqTitle: 'Häufige Fragen zu den Abend-Adhkar',
                faqQ1: 'Was sind die Abend-Adhkar?',
                faqA1: 'Die Abend-Adhkar sind Bittgebete, Verse und Gedenkformeln, die der Muslim zur Abendzeit liest; sie enthalten das Bekenntnis zur Einheit Allahs, das Bitten um Vergebung sowie die Bitte um Schutz und Wohlergehen und werden in Anlehnung an das, was in der Sunna überliefert ist, und die bekannten authentischen Adhkar gesprochen.',
                faqQ2: 'Wann ist die Zeit der Abend-Adhkar?',
                faqA2: 'Die Zeit der Abend-Adhkar beginnt nach dem Asr-Gebet nach Ansicht vieler Gelehrter und reicht bis in die Nacht. Am besten liest man sie möglichst zu Beginn des Abends, damit der Muslim seine Nacht mit dem Gedenken Allahs und der Bitte um Schutz beginnt.',
                faqQ3: 'Müssen die Abend-Adhkar in der Reihenfolge gelesen werden?',
                faqA3: 'Für die Abend-Adhkar ist keine bestimmte Reihenfolge erforderlich, doch sie auf der Seite der Reihe nach zu lesen hilft, geordnet zu bleiben und keinen Dhikr zu vergessen, besonders jene Adhkar, die wiederholt werden müssen.',
                faqQ4: 'Was ist der Nutzen der Wiederholung in den Abend-Adhkar?',
                faqA4: 'Manche Abend-Adhkar sind mit einer bestimmten Wiederholungszahl überliefert, etwa drei-, sieben- oder hundertmal. Der Zähler auf der Seite hilft dir daher, die erforderliche Zahl ohne Fehler oder Vergessen zu vervollständigen.',
                faqQ5: 'Werden die Quellen der Abend-Adhkar auf der Seite angezeigt?',
                faqA5: 'Ja, mit jedem Dhikr wird die Quelle angezeigt, damit der Leser weiß, woher er stammt, zusammen mit dem Vorzug oder der Anmerkung zum Dhikr, sofern verfügbar.',
                faqQ6: 'Können die Abend-Adhkar vom Telefon gelesen werden?',
                faqA6: 'Ja, die Seite ist so gestaltet, dass das Lesen der Abend-Adhkar vom Telefon und Computer erleichtert wird, mit klaren Karten, einem interaktiven Zähler und automatischem Speichern des Fortschritts.',
                faqQ7: 'Was tue ich, wenn ich die Abend-Adhkar vergesse?',
                faqA7: 'Wenn du die Abend-Adhkar zu ihrer Zeit vergisst, lies, was dir leichtfällt, sobald du dich erinnerst, und achte darauf, sie an den folgenden Tagen so weit wie möglich zu ihrer Zeit zu lesen.',
                faqQ8: 'Speichert diese Seite meinen Fortschritt der Abend-Adhkar automatisch?',
                faqA8: 'Ja, die Seite speichert deinen Fortschritt über den Abend im selben Browser, dann beginnen die Zähler von Neuem, wenn der Tag gemäß der Ortszeit deines Geräts wechselt.',
                faqQ9: 'Was ist der Nutzen des Zählers der Abend-Adhkar?',
                faqA9: 'Der Zähler der Abend-Adhkar hilft dir, die wiederholten Adhkar leicht zu vollenden, besonders jene, die drei-, sieben- oder hundertmal gesprochen werden, ohne von Hand zählen zu müssen.'
            },
            es: {
                eduSecAria: 'Información educativa sobre los adhkar de la tarde',
                edu1T: 'La virtud de los adhkar de la tarde al final del día',
                edu1P1: 'Los adhkar de la tarde están entre los actos diarios que ayudan al musulmán a cerrar su día con el recuerdo de Allah y la confianza en Él. Contienen un recordatorio de Su unicidad, la petición de perdón y la protección contra los males. Recitarlos por la tarde ayuda a la presencia del corazón y a la serenidad, y vincula el final del día con la obediencia y la calma.',
                edu1P2: 'El usuario puede leer los adhkar completos en orden, o volver a los que necesitan repetición mediante el contador, mientras tu progreso se guarda automáticamente durante la tarde en el mismo navegador.',
                edu2T: '¿Cómo usar la página de los adhkar de la tarde?',
                edu2P1: 'Esta página está diseñada para leerse con facilidad en el teléfono y el ordenador. Cada dhikr aparece en una tarjeta propia con su número de repeticiones y su fuente, y los adhkar que necesitan repetirse muestran un contador que te ayuda a completar el número sin perder la cuenta.',
                edu2P2: 'Cuando completas un dhikr determinado, la página pasa automáticamente al siguiente para una lectura más fluida. Tu progreso también se guarda durante la tarde, y los contadores vuelven a empezar cuando cambia el día según la hora local de tu dispositivo.',
                edu3T: 'La diferencia entre los adhkar de la mañana y de la tarde',
                edu3P1: 'Los adhkar de la mañana y de la tarde comparten varios recuerdos y aleyas, como el Versículo del Trono, las suras protectoras y algunas súplicas de protección y bienestar, pero algunas fórmulas difieren según el momento, como decir « hemos amanecido » por la mañana y « hemos anochecido » por la tarde.',
                edu3P2: 'Por eso es mejor leer cada sección desde su propia página para que aparezcan las fórmulas adecuadas al momento, y para que la repetición se guarde de forma independiente para cada sección.',
                linksAria: 'Enlaces relacionados',
                lnkBack: 'Volver a los Adhkar',
                lnkMorning: 'Adhkar de la mañana',
                lnkPrayer: 'Adhkar de la oración',
                lnkPrayerTimes: 'Horarios de oración de hoy',
                lnkQibla: 'Dirección de la Quibla',
                lnkHijri: 'Fecha hégira de hoy',
                lnkMoon: 'Fase de la luna hoy',
                faqTitle: 'Preguntas frecuentes sobre los adhkar de la tarde',
                faqQ1: '¿Qué son los adhkar de la tarde?',
                faqA1: 'Los adhkar de la tarde son súplicas, aleyas y recuerdos que el musulmán lee al momento de la tarde; incluyen la afirmación de la unicidad de Allah, la petición de perdón y la petición de protección y bienestar, y se dicen siguiendo lo que se relata en la Sunna y los adhkar auténticos bien conocidos.',
                faqQ2: '¿Cuándo es el momento de los adhkar de la tarde?',
                faqA2: 'El tiempo de los adhkar de la tarde comienza después de la oración del ‘Asr según muchos sabios y se extiende hasta la noche. Lo mejor es leerlos al comienzo de la tarde cuando sea posible, para que el musulmán empiece su noche con el recuerdo de Allah y la petición de protección.',
                faqQ3: '¿Hay que leer los adhkar de la tarde en orden?',
                faqA3: 'No se requiere un orden concreto para leer los adhkar de la tarde, pero leerlos en orden en la página ayuda a mantenerte organizado y a no olvidar ningún dhikr, sobre todo los adhkar que necesitan repetición.',
                faqQ4: '¿Cuál es el beneficio de la repetición en los adhkar de la tarde?',
                faqA4: 'Algunos adhkar de la tarde se relatan con un número concreto de repeticiones, como tres, siete o cien veces. Por eso el contador de la página te ayuda a completar el número requerido sin error ni olvido.',
                faqQ5: '¿Se muestran las fuentes de los adhkar de la tarde en la página?',
                faqA5: 'Sí, la fuente se muestra con cada dhikr para ayudar al lector a saber de dónde procede, junto con la virtud o la nota relacionada con el dhikr cuando están disponibles.',
                faqQ6: '¿Se pueden leer los adhkar de la tarde desde un teléfono?',
                faqA6: 'Sí, la página está diseñada para facilitar la lectura de los adhkar de la tarde desde el teléfono y el ordenador, con tarjetas claras, un contador interactivo y guardado automático del progreso.',
                faqQ7: '¿Qué hago si olvido los adhkar de la tarde?',
                faqA7: 'Si olvidas los adhkar de la tarde en su momento, lee lo que te resulte fácil cuando los recuerdes, y procura leerlos en su tiempo en los días siguientes en la medida de tus posibilidades.',
                faqQ8: '¿Esta página guarda automáticamente mi progreso de los adhkar de la tarde?',
                faqA8: 'Sí, la página guarda tu progreso durante la tarde en el mismo navegador, y luego los contadores vuelven a empezar cuando cambia el día según la hora local de tu dispositivo.',
                faqQ9: '¿Cuál es el beneficio del contador de los adhkar de la tarde?',
                faqA9: 'El contador de los adhkar de la tarde te ayuda a completar con facilidad los adhkar repetidos, sobre todo los que se dicen tres, siete o cien veces, sin necesidad de contar a mano.'
            },
            id: {
                eduSecAria: 'Informasi edukatif tentang zikir petang',
                edu1T: 'Keutamaan zikir petang di penghujung hari',
                edu1P1: 'Zikir petang termasuk amalan harian yang membantu seorang Muslim menutup harinya dengan mengingat Allah dan bertawakal kepada-Nya. Zikir ini berisi pengingat akan keesaan Allah, istigfar, dan permohonan perlindungan dari keburukan. Membacanya pada waktu petang membantu menghadirkan hati dan ketenangan, serta mengaitkan penghujung hari dengan ketaatan dan kedamaian.',
                edu1P2: 'Pengguna dapat membaca zikir secara lengkap sesuai urutan, atau kembali ke zikir yang perlu diulang menggunakan penghitung, sementara kemajuan Anda tersimpan otomatis sepanjang petang di peramban yang sama.',
                edu2T: 'Bagaimana cara menggunakan halaman zikir petang?',
                edu2P1: 'Halaman ini dirancang agar mudah dibaca di ponsel dan komputer. Setiap zikir tampil dalam kartu tersendiri beserta jumlah pengulangan dan sumbernya, dan zikir yang perlu diulang menampilkan penghitung yang membantu Anda menyelesaikan jumlahnya tanpa lupa.',
                edu2P2: 'Ketika Anda menyelesaikan suatu zikir, halaman berpindah otomatis ke zikir berikutnya agar bacaan lebih lancar. Kemajuan Anda juga tersimpan sepanjang petang, dan penghitung mulai dari awal saat hari berganti sesuai waktu lokal perangkat Anda.',
                edu3T: 'Perbedaan antara zikir pagi dan petang',
                edu3P1: 'Zikir pagi dan petang berbagi sejumlah zikir dan ayat, seperti Ayat Kursi, al-Mu‘awwidzat, dan sebagian doa perlindungan serta afiat, tetapi sebagian lafal berbeda menurut waktu, seperti mengucapkan « kami memasuki waktu pagi » pada pagi dan « kami memasuki waktu petang » pada petang.',
                edu3P2: 'Karena itu, lebih baik membaca setiap bagian dari halamannya sendiri agar lafal yang sesuai dengan waktu ditampilkan, dan agar pengulangan tersimpan secara terpisah untuk setiap bagian.',
                linksAria: 'Tautan terkait',
                lnkBack: 'Kembali ke Zikir',
                lnkMorning: 'Zikir Pagi',
                lnkPrayer: 'Zikir Salat',
                lnkPrayerTimes: 'Jadwal Salat Hari Ini',
                lnkQibla: 'Arah Kiblat',
                lnkHijri: 'Tanggal Hijriah Hari Ini',
                lnkMoon: 'Fase Bulan Hari Ini',
                faqTitle: 'Pertanyaan umum tentang zikir petang',
                faqQ1: 'Apa itu zikir petang?',
                faqA1: 'Zikir petang adalah doa, ayat, dan zikir yang dibaca seorang Muslim pada waktu petang; berisi pengesaan keesaan Allah, istigfar, serta permohonan perlindungan dan afiat, dan diucapkan dengan mengikuti apa yang diriwayatkan dalam Sunnah serta zikir sahih yang masyhur.',
                faqQ2: 'Kapan waktu membaca zikir petang?',
                faqA2: 'Waktu zikir petang dimulai setelah salat Asar menurut banyak ulama dan berlanjut hingga malam. Yang terbaik adalah membacanya di awal petang jika memungkinkan, agar seorang Muslim memulai malamnya dengan mengingat Allah dan memohon perlindungan.',
                faqQ3: 'Apakah zikir petang harus dibaca berurutan?',
                faqA3: 'Tidak ada urutan tertentu yang diharuskan untuk membaca zikir petang, tetapi membacanya berurutan di halaman membantu Anda tetap teratur dan tidak melupakan satu zikir pun, terutama zikir yang perlu diulang.',
                faqQ4: 'Apa manfaat pengulangan dalam zikir petang?',
                faqA4: 'Sebagian zikir petang diriwayatkan dengan jumlah pengulangan tertentu, seperti tiga kali, tujuh kali, atau seratus kali. Karena itu, penghitung di halaman membantu Anda menyelesaikan jumlah yang diperlukan tanpa keliru atau lupa.',
                faqQ5: 'Apakah sumber zikir petang ditampilkan di halaman?',
                faqA5: 'Ya, sumber ditampilkan bersama setiap zikir untuk membantu pembaca mengetahui asalnya, beserta keutamaan atau catatan terkait zikir jika tersedia.',
                faqQ6: 'Apakah zikir petang bisa dibaca dari ponsel?',
                faqA6: 'Ya, halaman ini dirancang untuk memudahkan membaca zikir petang dari ponsel dan komputer, dengan kartu yang jelas, penghitung interaktif, dan penyimpanan kemajuan otomatis.',
                faqQ7: 'Apa yang harus saya lakukan jika lupa zikir petang?',
                faqA7: 'Jika Anda lupa zikir petang pada waktunya, bacalah yang mudah bagi Anda ketika ingat, dan usahakan membacanya pada waktunya di hari-hari berikutnya semampu mungkin.',
                faqQ8: 'Apakah halaman ini menyimpan kemajuan zikir petang saya secara otomatis?',
                faqA8: 'Ya, halaman ini menyimpan kemajuan Anda sepanjang petang di peramban ini, lalu penghitung mulai lagi dari awal saat hari berganti sesuai waktu lokal perangkat Anda.',
                faqQ9: 'Apa manfaat penghitung zikir petang?',
                faqA9: 'Penghitung zikir petang membantu Anda menyelesaikan zikir berulang dengan mudah, terutama zikir yang diucapkan tiga kali, tujuh kali, atau seratus kali, tanpa perlu menghitung dengan tangan.'
            }
        };
        var E = window.AZKAR_EVENING_UI_L10N;
        Object.keys(B).forEach(function (l) { if (E[l]) Object.assign(E[l], B[l]); });
    })();


    // ══════════════════════════════════════════════════════════════════════════
    // AZKAR-PRAYER-BOTTOM-CONTENT-FAQ-LOCALIZATION-ALL-LANGUAGES-1 (2026-07-14)
    // Prayer-page BOTTOM chrome ONLY (educational cards + related-links labels + FAQ),
    // per language. Prayer had NO l10n dict before this batch, so this is a fresh standalone
    // object (not derived from morning/evening). Rendered via data-azkar-ui / data-azkar-ui-aria
    // on the static #page-azkar-prayer HTML by server _translateAzkarPrayerUi (SSR) and app.js
    // _azkarLocalizePrayerStaticUi (SPA). 'ar' is byte-identical to the HTML source (idempotent).
    // TOP chrome (hero/breadcrumb/info-strip/progress/completed banner) is intentionally OUT of
    // scope → stays Arabic (follow-up: AZKAR-PRAYER-PAGE-FULL-UI-LOCALIZATION-ALL-LANGUAGES-1).
    // Salawat ﷺ kept wherever the Arabic source has it (never added where source omits).
    // ══════════════════════════════════════════════════════════════════════════
    window.AZKAR_PRAYER_UI_L10N = {
        ar: {
            eduSecAria: 'معلومات تعليمية عن أذكار الصلاة',
            edu1T: 'فضل أذكار الصلاة وأهميتها',
            edu1P1: 'أذكار الصلاة جزء أساسي من إقامة الصلاة بصورتها الكاملة، وتشمل ما يُقال عند الوضوء والذهاب إلى المسجد، وأذكار استفتاح الصلاة والركوع والسجود والتشهد، إضافة إلى الأذكار بعد السلام. وهذه الأذكار مأثورة عن النبي ﷺ، وتُعين المسلم على حضور القلب وزيادة الخشوع في الصلاة.',
            edu1P2: 'الالتزام بأذكار الصلاة يربط المسلم بالسنة، ويجعل صلاته أكمل أجرًا وأقرب إلى السكينة، خاصة عند الاهتمام بمعاني الأذكار لا بمجرد ترديدها.',
            edu2T: 'كيف تستخدم صفحة أذكار الصلاة؟',
            edu2P1: 'تظهر الأذكار مرتبة في بطاقات مستقلة من أذكار الوضوء وحتى ما بعد السلام، ويوضح في كل بطاقة عدد التكرار والمصدر. تستطيع قراءة جميع الأذكار بالترتيب، أو الرجوع إلى ذكر معين كالقنوت أو دعاء الوتر مباشرة.',
            edu2P2: 'الأذكار التي يُسن تكرارها — مثل ما يُقال بعد الوتر ثلاث مرات — يساعدك العداد على إكمال العدد دون نسيان، ويُحفظ التقدم تلقائيًا خلال نفس اليوم في متصفحك.',
            edu3T: 'أذكار الصلاة بين السنة والحرص على المعنى',
            edu3P1: 'كثير من أذكار الصلاة وردت بصيغ متعددة في كتب السنة المعروفة، مثل أدعية استفتاح الصلاة والقنوت ودعاء الجلسة بين السجدتين، ويصح للمسلم أن يختار بين الصيغ الثابتة. والأهم هو فهم معنى الذكر وحضوره في القلب، لا الاكتفاء بقراءته باللسان.',
            edu3P2: 'ولتكامل العبادة في يومك، يُستحب قراءة أذكار الصباح والمساء كذلك، وكلاهما متوفر في صفحات مستقلة على هذا الموقع.',
            linksAria: 'روابط ذات صلة',
            lnkBack: 'العودة إلى الأذكار',
            lnkMorning: 'أذكار الصباح',
            lnkEvening: 'أذكار المساء',
            lnkPrayerTimes: 'مواقيت الصلاة اليوم',
            lnkQibla: 'اتجاه القبلة',
            lnkHijri: 'التاريخ الهجري اليوم',
            faqTitle: 'أسئلة شائعة حول أذكار الصلاة',
            faqQ1: 'ما هي أذكار الصلاة؟',
            faqA1: 'أذكار الصلاة هي الأدعية والأذكار المأثورة التي تُقال قبل الصلاة وأثناءها وبعدها، وتبدأ من أذكار الوضوء، ثم الذهاب إلى المسجد ودخوله، وأذكار استفتاح الصلاة والركوع والسجود والتشهد، وتنتهي بالأذكار بعد السلام ودعاء الوتر.',
            faqQ2: 'هل أذكار الصلاة كلها ثابتة عن النبي ﷺ؟',
            faqA2: 'أغلب أذكار الصلاة وأدعيتها وردت في كتب السنة المعروفة، وتعددت صيغ بعضها كأدعية الاستفتاح والقنوت. هذه الصفحة تجمع الصيغ المشهورة المنقولة من كتب الأذكار، ويُنصح بمراجعة المصادر للتأكد من الصيغة والتشكيل.',
            faqQ3: 'ما الفرق بين أذكار الصلاة وأذكار بعد الصلاة؟',
            faqA3: 'أذكار بعد الصلاة هي جزء من أذكار الصلاة بشكل عام، وتشمل التسبيح والتحميد والتكبير وقراءة آية الكرسي والمعوذات بعد التسليم. وقد جُمعت في هذه الصفحة ضمن قسم «الأذكار بعد السلام من الصلاة».',
            faqQ4: 'ما حكم قراءة دعاء الاستفتاح؟',
            faqA4: 'دعاء الاستفتاح سُنة عند جمهور أهل العلم، يُقال بعد تكبيرة الإحرام وقبل قراءة الفاتحة. وقد وردت صيغ متعددة، تجد بعضًا منها في بطاقة «أدعية استفتاح الصلاة» في هذه الصفحة.',
            faqQ5: 'متى يُقال دعاء القنوت؟',
            faqA5: 'يُقال دعاء القنوت في صلاة الوتر، ويزاد عليه القنوت في الفجر عند بعض أهل العلم، وكذلك قنوت النوازل عند الحاجة. وتجد في الصفحة بطاقتين: «دعاء القنوت» و«دعاء استفتاح الصلاة في قيام الليل».',
            faqQ6: 'هل تظهر مصادر أذكار الصلاة في الصفحة؟',
            faqA6: 'نعم، يظهر المصدر مع كل ذكر لمساعدة القارئ على معرفة موضع وروده، مع عرض الفضل أو الملاحظة المتعلقة بالذكر عند توفرها.',
            faqQ7: 'ما الذي يُقال بعد الانتهاء من الوتر؟',
            faqA7: 'ثبت عن النبي ﷺ أنه كان يقول بعد الوتر: «سبحان الملك القدوس» ثلاث مرات، ويرفع صوته في الثالثة. وتجد هذا الذكر في بطاقة «ما يقال بعد الانتهاء من الوتر» مع عداد لتسهيل التكرار.',
            faqQ8: 'هل تحفظ الصفحة تقدمي تلقائيًا؟',
            faqA8: 'نعم، تحفظ الصفحة تقدمك تلقائيًا خلال اليوم في نفس المتصفح، ثم تعود العدادات من البداية عند تغير اليوم حسب توقيت جهازك المحلي.',
            faqQ9: 'هل يمكن قراءة أذكار الصلاة من الهاتف؟',
            faqA9: 'نعم، الصفحة مصممة للهاتف والكمبيوتر، وبطاقات الأذكار سهلة القراءة، مع شريط تقدم ثابت يبقى مرئيًا أثناء التمرير لمتابعة ما تم إكماله.'
        },
        en: {
            eduSecAria: 'Educational information about the prayer adhkar',
            edu1T: 'The virtue and importance of the prayer adhkar',
            edu1P1: 'The prayer adhkar are an essential part of establishing the prayer in its complete form. They include what is said during ablution and on the way to the mosque, the opening supplications of the prayer, and the adhkar of the bowing, prostration, and tashahhud, in addition to the adhkar after the taslim. These adhkar are transmitted from the Prophet ﷺ and help the Muslim bring presence of heart and increase humility in the prayer.',
            edu1P2: 'Adhering to the prayer adhkar connects the Muslim to the Sunnah and makes the prayer more complete in reward and closer to tranquility, especially when one attends to the meanings of the adhkar rather than merely repeating them.',
            edu2T: 'How to use the prayer adhkar page',
            edu2P1: 'The adhkar appear ordered in separate cards, from the adhkar of ablution to those after the taslim, and each card shows the repeat count and source. You can read all the adhkar in order, or go directly to a particular dhikr such as the Qunut or the Witr supplication.',
            edu2P2: 'For the adhkar that are recommended to repeat — such as what is said three times after the Witr — the counter helps you complete the number without forgetting, and your progress is saved automatically through the same day in your browser.',
            edu3T: 'The prayer adhkar between the Sunnah and attention to meaning',
            edu3P1: 'Many prayer adhkar are reported in several wordings in the well-known books of the Sunnah, such as the opening supplications of the prayer, the Qunut, and the supplication of the sitting between the two prostrations, and it is valid for the Muslim to choose among the established wordings. What matters most is understanding the meaning of the dhikr and its presence in the heart, not merely reciting it with the tongue.',
            edu3P2: 'And to complete your worship throughout the day, it is recommended to read the morning and evening adhkar as well, both of which are available on separate pages on this site.',
            linksAria: 'Related links',
            lnkBack: 'Back to Adhkar',
            lnkMorning: 'Morning Athkar',
            lnkEvening: 'Evening Athkar',
            lnkPrayerTimes: 'Prayer Times Today',
            lnkQibla: 'Qibla Direction',
            lnkHijri: 'Today’s Hijri Date',
            faqTitle: 'Frequently asked questions about the prayer adhkar',
            faqQ1: 'What are the prayer adhkar?',
            faqA1: 'The prayer adhkar are the transmitted supplications and remembrances said before, during, and after the prayer. They begin with the adhkar of ablution, then going to the mosque and entering it, the opening supplications of the prayer and the adhkar of the bowing, prostration, and tashahhud, and end with the adhkar after the taslim and the Witr supplication.',
            faqQ2: 'Are all the prayer adhkar established from the Prophet ﷺ?',
            faqA2: 'Most of the prayer adhkar and their supplications are reported in the well-known books of the Sunnah, and some have several wordings, such as the opening and Qunut supplications. This page gathers the well-known wordings transmitted from the books of adhkar, and it is advised to consult the sources to verify the wording and vowelization.',
            faqQ3: 'What is the difference between the prayer adhkar and the adhkar after the prayer?',
            faqA3: 'The adhkar after the prayer are part of the prayer adhkar in general, and include the tasbih, tahmid, takbir, and reciting Ayat al-Kursi and the Mu‘awwidhat after the taslim. They have been gathered on this page within the section “The adhkar after the taslim of the prayer.”',
            faqQ4: 'What is the ruling on reciting the opening supplication (du‘a al-istiftah)?',
            faqA4: 'The opening supplication is a Sunnah according to the majority of the people of knowledge, said after the opening takbir and before reciting al-Fatihah. Several wordings are reported; you will find some of them in the “Opening supplications of the prayer” card on this page.',
            faqQ5: 'When is the Qunut supplication said?',
            faqA5: 'The Qunut supplication is said in the Witr prayer, and some of the people of knowledge add the Qunut in Fajr, as well as the Qunut of calamities when needed. On the page you will find two cards: “The Qunut supplication” and “The opening supplication of the prayer in the night vigil.”',
            faqQ6: 'Are the sources of the prayer adhkar shown on the page?',
            faqA6: 'Yes, the source is shown with each dhikr to help the reader know where it comes from, along with the virtue or the note related to the dhikr when available.',
            faqQ7: 'What is said after finishing the Witr?',
            faqA7: 'It is established that the Prophet ﷺ used to say after the Witr: “Subhana al-Malik al-Quddus” three times, raising his voice on the third. You will find this dhikr in the “What is said after finishing the Witr” card with a counter to make repetition easy.',
            faqQ8: 'Does the page save my progress automatically?',
            faqA8: 'Yes, the page saves your progress automatically through the day in the same browser, then the counters return to the start when the day changes according to your device’s local time.',
            faqQ9: 'Can the prayer adhkar be read from a phone?',
            faqA9: 'Yes, the page is designed for phone and computer, and the adhkar cards are easy to read, with a fixed progress bar that stays visible while scrolling to track what has been completed.'
        },
        fr: {
            eduSecAria: 'Informations pédagogiques sur les invocations de la prière',
            edu1T: 'Le mérite et l’importance des invocations de la prière',
            edu1P1: 'Les invocations de la prière sont une partie essentielle de l’accomplissement de la prière dans sa forme complète. Elles comprennent ce qui est dit lors des ablutions et en allant à la mosquée, les invocations d’ouverture de la prière, et les invocations de l’inclinaison, de la prosternation et du tachahhoud, en plus des invocations après le taslim. Ces invocations sont rapportées du Prophète ﷺ et aident le musulman à la présence du cœur et à accroître le recueillement dans la prière.',
            edu1P2: 'S’attacher aux invocations de la prière relie le musulman à la Sunna et rend sa prière plus complète en récompense et plus proche de la sérénité, surtout lorsqu’il prête attention aux sens des invocations plutôt que de les répéter simplement.',
            edu2T: 'Comment utiliser la page des invocations de la prière',
            edu2P1: 'Les invocations apparaissent ordonnées dans des cartes distinctes, des invocations des ablutions jusqu’à celles après le taslim, et chaque carte indique le nombre de répétitions et la source. Vous pouvez lire toutes les invocations dans l’ordre, ou aller directement à une invocation précise comme le Qunut ou l’invocation du Witr.',
            edu2P2: 'Pour les invocations qu’il est recommandé de répéter — comme ce qui est dit trois fois après le Witr — le compteur vous aide à atteindre le nombre sans l’oublier, et votre progression est enregistrée automatiquement durant la même journée dans votre navigateur.',
            edu3T: 'Les invocations de la prière entre la Sunna et le souci du sens',
            edu3P1: 'Beaucoup d’invocations de la prière sont rapportées en plusieurs formules dans les livres connus de la Sunna, comme les invocations d’ouverture de la prière, le Qunut et l’invocation de l’assise entre les deux prosternations, et il est valide pour le musulman de choisir parmi les formules établies. Le plus important est de comprendre le sens de l’invocation et sa présence dans le cœur, et non de se contenter de la réciter avec la langue.',
            edu3P2: 'Et pour compléter votre adoration au cours de la journée, il est recommandé de lire aussi les invocations du matin et du soir, toutes deux disponibles sur des pages distinctes de ce site.',
            linksAria: 'Liens connexes',
            lnkBack: 'Retour aux invocations',
            lnkMorning: 'Invocations du matin',
            lnkEvening: 'Invocations du soir',
            lnkPrayerTimes: 'Horaires de prière aujourd’hui',
            lnkQibla: 'Direction de la Qibla',
            lnkHijri: 'Date hégirienne du jour',
            faqTitle: 'Questions fréquentes sur les invocations de la prière',
            faqQ1: 'Que sont les invocations de la prière ?',
            faqA1: 'Les invocations de la prière sont les demandes et rappels rapportés qui se disent avant, pendant et après la prière. Elles commencent par les invocations des ablutions, puis le fait d’aller à la mosquée et d’y entrer, les invocations d’ouverture de la prière et les invocations de l’inclinaison, de la prosternation et du tachahhoud, et se terminent par les invocations après le taslim et l’invocation du Witr.',
            faqQ2: 'Toutes les invocations de la prière sont-elles établies du Prophète ﷺ ?',
            faqA2: 'La plupart des invocations de la prière et leurs demandes sont rapportées dans les livres connus de la Sunna, et certaines ont plusieurs formules, comme les invocations d’ouverture et du Qunut. Cette page rassemble les formules connues transmises depuis les livres d’invocations, et il est conseillé de consulter les sources pour vérifier la formule et la vocalisation.',
            faqQ3: 'Quelle est la différence entre les invocations de la prière et les invocations après la prière ?',
            faqA3: 'Les invocations après la prière font partie des invocations de la prière en général, et comprennent le tasbih, le tahmid, le takbir et la récitation du Verset du Trône et des sourates protectrices après le taslim. Elles ont été rassemblées sur cette page dans la section « Les invocations après le taslim de la prière ».',
            faqQ4: 'Quel est le statut de la récitation de l’invocation d’ouverture (du‘a al-istiftah) ?',
            faqA4: 'L’invocation d’ouverture est une Sunna selon la majorité des gens de science, dite après le takbir d’ouverture et avant la récitation d’al-Fatiha. Plusieurs formules sont rapportées ; vous en trouverez certaines dans la carte « Invocations d’ouverture de la prière » sur cette page.',
            faqQ5: 'Quand dit-on l’invocation du Qunut ?',
            faqA5: 'L’invocation du Qunut se dit dans la prière du Witr, et certains gens de science y ajoutent le Qunut dans le Fajr, ainsi que le Qunut des calamités en cas de besoin. Sur la page, vous trouverez deux cartes : « L’invocation du Qunut » et « L’invocation d’ouverture de la prière dans la veillée nocturne ».',
            faqQ6: 'Les sources des invocations de la prière sont-elles indiquées sur la page ?',
            faqA6: 'Oui, la source est indiquée avec chaque invocation pour aider le lecteur à savoir d’où elle provient, avec le mérite ou la remarque liée à l’invocation lorsqu’ils sont disponibles.',
            faqQ7: 'Que dit-on après avoir terminé le Witr ?',
            faqA7: 'Il est établi que le Prophète ﷺ disait après le Witr : « Subhana al-Malik al-Quddus » trois fois, en élevant la voix la troisième fois. Vous trouverez ce rappel dans la carte « Ce qui se dit après avoir terminé le Witr » avec un compteur pour faciliter la répétition.',
            faqQ8: 'La page enregistre-t-elle ma progression automatiquement ?',
            faqA8: 'Oui, la page enregistre votre progression automatiquement durant la journée dans le même navigateur, puis les compteurs repartent de zéro au changement de jour selon l’heure locale de votre appareil.',
            faqQ9: 'Peut-on lire les invocations de la prière depuis un téléphone ?',
            faqA9: 'Oui, la page est conçue pour téléphone et ordinateur, et les cartes d’invocations sont faciles à lire, avec une barre de progression fixe qui reste visible pendant le défilement pour suivre ce qui a été accompli.'
        },
        ur: {
            eduSecAria: 'نماز کے اذکار کے بارے میں تعلیمی معلومات',
            edu1T: 'نماز کے اذکار کی فضیلت اور اہمیت',
            edu1P1: 'نماز کے اذکار نماز کو اُس کی مکمل صورت میں ادا کرنے کا بنیادی حصہ ہیں، اور اِن میں وضو اور مسجد کی طرف جانے کے وقت کہے جانے والے اذکار، نماز کے استفتاح، رکوع، سجود اور تشہد کے اذکار، اور سلام کے بعد کے اذکار شامل ہیں۔ یہ اذکار نبی ﷺ سے مأثور ہیں، اور مسلمان کو دل کی حاضری اور نماز میں خشوع بڑھانے میں مدد دیتے ہیں۔',
            edu1P2: 'نماز کے اذکار پر پابندی مسلمان کو سنت سے جوڑتی ہے، اور اُس کی نماز کو اجر میں زیادہ کامل اور سکون کے قریب تر بناتی ہے، خاص طور پر جب اذکار کے معانی پر توجہ دی جائے نہ کہ محض اُنہیں دہرایا جائے۔',
            edu2T: 'نماز کے اذکار کا صفحہ کیسے استعمال کریں؟',
            edu2P1: 'اذکار وضو کے اذکار سے لے کر سلام کے بعد تک الگ الگ کارڈز میں ترتیب سے ظاہر ہوتے ہیں، اور ہر کارڈ میں تعداد اور حوالہ واضح کیا جاتا ہے۔ آپ تمام اذکار ترتیب سے پڑھ سکتے ہیں، یا کسی مخصوص ذکر جیسے قنوت یا دعائے وتر کی طرف براہِ راست جا سکتے ہیں۔',
            edu2P2: 'جن اذکار کا دہرانا سنت ہے — جیسے وتر کے بعد تین بار کہا جانے والا — اُن میں شمار کنندہ آپ کو تعداد بھولے بغیر مکمل کرنے میں مدد دیتا ہے، اور آپ کی پیش رفت اُسی دن کے دوران آپ کے براؤزر میں خودبخود محفوظ رہتی ہے۔',
            edu3T: 'نماز کے اذکار: سنت اور معنی کی رعایت کے درمیان',
            edu3P1: 'نماز کے بہت سے اذکار سنت کی معروف کتب میں مختلف صیغوں میں وارد ہوئے ہیں، جیسے نماز کے استفتاح کی دعائیں، قنوت، اور دو سجدوں کے درمیان بیٹھنے کی دعا، اور مسلمان کے لیے ثابت صیغوں میں سے اختیار کرنا درست ہے۔ سب سے اہم ذکر کے معنی کو سمجھنا اور دل میں اُس کی حاضری ہے، نہ کہ محض زبان سے پڑھ لینا۔',
            edu3P2: 'اور اپنے دن میں عبادت کی تکمیل کے لیے صبح اور شام کے اذکار پڑھنا بھی مستحب ہے، اور دونوں اِس ویب سائٹ پر الگ صفحات میں دستیاب ہیں۔',
            linksAria: 'متعلقہ روابط',
            lnkBack: 'اذکار کی طرف واپس',
            lnkMorning: 'صبح کے اذکار',
            lnkEvening: 'شام کے اذکار',
            lnkPrayerTimes: 'آج کے نماز کے اوقات',
            lnkQibla: 'قبلہ کی سمت',
            lnkHijri: 'آج کی ہجری تاریخ',
            faqTitle: 'نماز کے اذکار کے بارے میں اکثر پوچھے جانے والے سوالات',
            faqQ1: 'نماز کے اذکار کیا ہیں؟',
            faqA1: 'نماز کے اذکار وہ مأثور دعائیں اور اذکار ہیں جو نماز سے پہلے، دوران اور بعد میں کہے جاتے ہیں، اور وضو کے اذکار سے شروع ہوتے ہیں، پھر مسجد کی طرف جانے اور اُس میں داخل ہونے کے اذکار، نماز کے استفتاح، رکوع، سجود اور تشہد کے اذکار، اور سلام کے بعد کے اذکار اور دعائے وتر پر ختم ہوتے ہیں۔',
            faqQ2: 'کیا نماز کے تمام اذکار نبی ﷺ سے ثابت ہیں؟',
            faqA2: 'نماز کے اکثر اذکار اور دعائیں سنت کی معروف کتب میں وارد ہیں، اور بعض کے کئی صیغے ہیں جیسے استفتاح اور قنوت کی دعائیں۔ یہ صفحہ اذکار کی کتب سے منقول مشہور صیغوں کو جمع کرتا ہے، اور صیغے اور اعراب کی تصدیق کے لیے مصادر کی مراجعت کا مشورہ دیا جاتا ہے۔',
            faqQ3: 'نماز کے اذکار اور نماز کے بعد کے اذکار میں کیا فرق ہے؟',
            faqA3: 'نماز کے بعد کے اذکار عمومی طور پر نماز کے اذکار کا حصہ ہیں، اور اِن میں تسبیح، تحمید، تکبیر اور سلام کے بعد آیت الکرسی اور معوذات کی تلاوت شامل ہے۔ اِنہیں اِس صفحے میں «نماز کے سلام کے بعد کے اذکار» کے قسم میں جمع کیا گیا ہے۔',
            faqQ4: 'دعائے استفتاح پڑھنے کا کیا حکم ہے؟',
            faqA4: 'دعائے استفتاح جمہور اہلِ علم کے نزدیک سنت ہے، جو تکبیرِ تحریمہ کے بعد اور سورۃ الفاتحہ کی قراءت سے پہلے کہی جاتی ہے۔ کئی صیغے وارد ہوئے ہیں، اِن میں سے بعض آپ کو اِس صفحے کے «نماز کے استفتاح کی دعائیں» کارڈ میں ملیں گے۔',
            faqQ5: 'دعائے قنوت کب کہی جاتی ہے؟',
            faqA5: 'دعائے قنوت وتر کی نماز میں کہی جاتی ہے، اور بعض اہلِ علم کے نزدیک فجر میں قنوت اِس پر بڑھائی جاتی ہے، اور اسی طرح حاجت کے وقت قنوتِ نازلہ۔ صفحے میں آپ کو دو کارڈ ملیں گے: «دعائے قنوت» اور «قیام اللیل میں نماز کے استفتاح کی دعا»۔',
            faqQ6: 'کیا نماز کے اذکار کے حوالے صفحے پر ظاہر ہوتے ہیں؟',
            faqA6: 'جی ہاں، ہر ذکر کے ساتھ اس کا حوالہ ظاہر ہوتا ہے تاکہ قاری کو معلوم ہو کہ یہ کہاں سے آیا ہے، اور دستیاب ہونے پر ذکر سے متعلق فضیلت یا نوٹ بھی دکھایا جاتا ہے۔',
            faqQ7: 'وتر مکمل کرنے کے بعد کیا کہا جاتا ہے؟',
            faqA7: 'نبی ﷺ سے ثابت ہے کہ آپ وتر کے بعد تین بار «سبحان الملک القدوس» کہتے تھے، اور تیسری بار آواز بلند کرتے تھے۔ یہ ذکر آپ کو «وتر مکمل کرنے کے بعد کیا کہا جاتا ہے» کارڈ میں تکرار کو آسان بنانے کے لیے ایک شمار کنندہ کے ساتھ ملے گا۔',
            faqQ8: 'کیا صفحہ میری پیش رفت خودبخود محفوظ کرتا ہے؟',
            faqA8: 'جی ہاں، صفحہ آپ کی پیش رفت دن بھر اسی براؤزر میں خودبخود محفوظ رکھتا ہے، پھر دن بدلنے پر آپ کے آلے کے مقامی وقت کے مطابق شمار کنندہ دوبارہ شروع سے شروع ہو جاتے ہیں۔',
            faqQ9: 'کیا نماز کے اذکار فون سے پڑھے جا سکتے ہیں؟',
            faqA9: 'جی ہاں، یہ صفحہ فون اور کمپیوٹر کے لیے بنایا گیا ہے، اور اذکار کے کارڈز پڑھنے میں آسان ہیں، ایک ثابت پیش رفت بار کے ساتھ جو اسکرول کے دوران مرئی رہتا ہے تاکہ آپ مکمل ہونے والے کی پیروی کر سکیں۔'
        },
        tr: {
            eduSecAria: 'Namaz zikirleri hakkında eğitici bilgiler',
            edu1T: 'Namaz zikirlerinin fazileti ve önemi',
            edu1P1: 'Namaz zikirleri, namazı eksiksiz biçimde eda etmenin temel bir parçasıdır; abdest sırasında ve camiye giderken söylenenleri, namazın açılış dualarını, rükû, secde ve teşehhüd zikirlerini, ayrıca selamdan sonraki zikirleri kapsar. Bu zikirler Peygamber ﷺ’den nakledilmiştir ve Müslümana kalbin huzuruna ve namazda huşûyu artırmaya yardım eder.',
            edu1P2: 'Namaz zikirlerine bağlı kalmak Müslümanı Sünnet’e bağlar, namazını sevap bakımından daha eksiksiz ve huzura daha yakın kılar; özellikle zikirleri yalnızca tekrarlamak yerine anlamlarına dikkat edildiğinde.',
            edu2T: 'Namaz zikirleri sayfası nasıl kullanılır?',
            edu2P1: 'Zikirler, abdest zikirlerinden selam sonrasına kadar ayrı kartlarda sıralı görünür ve her kartta tekrar sayısı ile kaynak belirtilir. Tüm zikirleri sırasıyla okuyabilir ya da Kunut veya Vitir duası gibi belirli bir zikre doğrudan geçebilirsiniz.',
            edu2P2: 'Tekrarı sünnet olan zikirlerde — Vitir’den sonra üç kez söylenen gibi — sayaç, sayıyı unutmadan tamamlamanıza yardımcı olur ve ilerlemeniz aynı gün boyunca tarayıcınızda otomatik olarak kaydedilir.',
            edu3T: 'Namaz zikirleri: Sünnet ile mânâya özen arasında',
            edu3P1: 'Namaz zikirlerinin çoğu, namazın açılış duaları, Kunut ve iki secde arasındaki oturuş duası gibi, Sünnet’in bilinen kitaplarında birçok lafızla nakledilmiştir ve Müslümanın sabit lafızlar arasından seçim yapması geçerlidir. En önemlisi, zikri yalnızca dille okumak değil, anlamını kavramak ve kalpte hazır bulundurmaktır.',
            edu3P2: 'Ve gününüzde ibadeti tamamlamak için sabah ve akşam zikirlerini de okumak müstehaptır; her ikisi de bu sitede ayrı sayfalarda mevcuttur.',
            linksAria: 'İlgili bağlantılar',
            lnkBack: 'Zikirlere dön',
            lnkMorning: 'Sabah Zikirleri',
            lnkEvening: 'Akşam Zikirleri',
            lnkPrayerTimes: 'Bugünkü Namaz Vakitleri',
            lnkQibla: 'Kıble Yönü',
            lnkHijri: 'Bugünün Hicri Tarihi',
            faqTitle: 'Namaz zikirleri hakkında sık sorulan sorular',
            faqQ1: 'Namaz zikirleri nedir?',
            faqA1: 'Namaz zikirleri, namazdan önce, sırasında ve sonrasında söylenen nakledilmiş dua ve zikirlerdir; abdest zikirleriyle başlar, ardından camiye gitme ve girme zikirleri, namazın açılış duaları ile rükû, secde ve teşehhüd zikirleri gelir ve selamdan sonraki zikirler ile Vitir duasıyla sona erer.',
            faqQ2: 'Namaz zikirlerinin tamamı Peygamber ﷺ’den sabit midir?',
            faqA2: 'Namaz zikirlerinin ve dualarının çoğu Sünnet’in bilinen kitaplarında geçer ve açılış ile Kunut duaları gibi bazılarının birden çok lafzı vardır. Bu sayfa, zikir kitaplarından nakledilen meşhur lafızları bir araya getirir; lafzı ve harekesini doğrulamak için kaynaklara başvurmak tavsiye edilir.',
            faqQ3: 'Namaz zikirleri ile namazdan sonraki zikirler arasındaki fark nedir?',
            faqA3: 'Namazdan sonraki zikirler genel olarak namaz zikirlerinin bir parçasıdır ve tesbih, tahmid, tekbir ile selamdan sonra Âyetü’l-Kürsî ve Muavvizât’ın okunmasını içerir. Bu sayfada « Namazın selamından sonraki zikirler » bölümü altında toplanmıştır.',
            faqQ4: 'Açılış duasını (istiftâh) okumanın hükmü nedir?',
            faqA4: 'Açılış duası, ilim ehlinin çoğunluğuna göre sünnettir; iftitah tekbirinden sonra ve Fâtiha okunmadan önce söylenir. Birçok lafız nakledilmiştir; bunlardan bazılarını bu sayfadaki « Namazın açılış duaları » kartında bulacaksınız.',
            faqQ5: 'Kunut duası ne zaman okunur?',
            faqA5: 'Kunut duası Vitir namazında okunur; bazı ilim ehline göre buna Fecir’deki Kunut da eklenir, gerektiğinde nevâzil kunutu da eklenir. Sayfada iki kart bulacaksınız: « Kunut duası » ve « Gece kıyamında namazın açılış duası ».',
            faqQ6: 'Namaz zikirlerinin kaynakları sayfada gösterilir mi?',
            faqA6: 'Evet, her zikirle birlikte kaynağı gösterilir; böylece okuyucu nereden geldiğini bilir, ayrıca mevcut olduğunda zikre ilişkin fazilet veya not da gösterilir.',
            faqQ7: 'Vitir bittikten sonra ne söylenir?',
            faqA7: 'Peygamber ﷺ’in Vitir’den sonra üç kez « Subhâne’l-Meliki’l-Kuddûs » dediği ve üçüncüde sesini yükselttiği sabittir. Bu zikri, tekrarı kolaylaştıran bir sayaçla birlikte « Vitir bittikten sonra ne söylenir » kartında bulacaksınız.',
            faqQ8: 'Sayfa ilerlememi otomatik kaydeder mi?',
            faqA8: 'Evet, sayfa ilerlemenizi gün boyunca aynı tarayıcıda otomatik olarak kaydeder; ardından gün değiştiğinde cihazınızın yerel saatine göre sayaçlar en baştan başlar.',
            faqQ9: 'Namaz zikirleri telefondan okunabilir mi?',
            faqA9: 'Evet, sayfa telefon ve bilgisayar için tasarlanmıştır ve zikir kartları kolay okunur; kaydırma sırasında görünür kalan sabit bir ilerleme çubuğuyla tamamlananları takip edebilirsiniz.'
        },
        bn: {
            eduSecAria: 'নামাজের যিকির সম্পর্কে শিক্ষামূলক তথ্য',
            edu1T: 'নামাজের যিকিরের ফজিলত ও গুরুত্ব',
            edu1P1: 'নামাজের যিকির নামাজকে তার পূর্ণ রূপে আদায় করার একটি মৌলিক অংশ; এতে অজুর সময় ও মসজিদে যাওয়ার সময় যা বলা হয়, নামাজের সানা (শুরুর দোয়া), রুকু, সিজদা ও তাশাহহুদের যিকির, এবং সালামের পরের যিকির অন্তর্ভুক্ত। এই যিকিরগুলো নবী ﷺ থেকে বর্ণিত এবং মুসলিমকে অন্তরের উপস্থিতি ও নামাজে খুশু বাড়াতে সাহায্য করে।',
            edu1P2: 'নামাজের যিকিরে অবিচল থাকা মুসলিমকে সুন্নাহর সঙ্গে যুক্ত করে এবং তার নামাজকে সওয়াবে অধিক পূর্ণ ও প্রশান্তির নিকটবর্তী করে, বিশেষত যখন যিকিরের অর্থের প্রতি মনোযোগ দেওয়া হয়, কেবল উচ্চারণ নয়।',
            edu2T: 'নামাজের যিকিরের পৃষ্ঠা কীভাবে ব্যবহার করবেন?',
            edu2P1: 'যিকিরগুলো অজুর যিকির থেকে সালামের পর পর্যন্ত আলাদা কার্ডে ক্রমানুসারে দেখা যায়, এবং প্রতিটি কার্ডে পুনরাবৃত্তির সংখ্যা ও উৎস উল্লেখ থাকে। আপনি সব যিকির ক্রমানুসারে পড়তে পারেন, অথবা কুনুত বা বিতরের দোয়ার মতো নির্দিষ্ট যিকিরে সরাসরি যেতে পারেন।',
            edu2P2: 'যেসব যিকির পুনরাবৃত্তি করা সুন্নত — যেমন বিতরের পর তিনবার বলা হয় — সেগুলোতে কাউন্টার আপনাকে সংখ্যা না ভুলে সম্পূর্ণ করতে সাহায্য করে, এবং আপনার অগ্রগতি একই দিনজুড়ে আপনার ব্রাউজারে স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে।',
            edu3T: 'নামাজের যিকির: সুন্নাহ ও অর্থের প্রতি যত্নের মাঝে',
            edu3P1: 'নামাজের অনেক যিকির সুন্নাহর প্রসিদ্ধ গ্রন্থসমূহে একাধিক শব্দরূপে বর্ণিত হয়েছে, যেমন নামাজের সানার দোয়া, কুনুত এবং দুই সিজদার মাঝে বসার দোয়া, আর মুসলিমের জন্য প্রমাণিত শব্দরূপগুলোর মধ্য থেকে বেছে নেওয়া বৈধ। সবচেয়ে গুরুত্বপূর্ণ হলো যিকিরের অর্থ বোঝা ও অন্তরে তার উপস্থিতি, কেবল মুখে পড়া নয়।',
            edu3P2: 'আর আপনার দিনে ইবাদত পূর্ণ করতে সকাল ও সন্ধ্যার যিকির পড়াও মুস্তাহাব, আর উভয়ই এই ওয়েবসাইটে আলাদা পৃষ্ঠায় রয়েছে।',
            linksAria: 'সম্পর্কিত লিঙ্ক',
            lnkBack: 'যিকিরে ফিরে যান',
            lnkMorning: 'সকালের যিকির',
            lnkEvening: 'সন্ধ্যার যিকির',
            lnkPrayerTimes: 'আজকের নামাজের সময়',
            lnkQibla: 'কিবলার দিক',
            lnkHijri: 'আজকের হিজরি তারিখ',
            faqTitle: 'নামাজের যিকির সম্পর্কে সাধারণ জিজ্ঞাসা',
            faqQ1: 'নামাজের যিকির কী?',
            faqA1: 'নামাজের যিকির হলো বর্ণিত দোয়া ও যিকির যা নামাজের আগে, চলাকালে ও পরে বলা হয়; এগুলো অজুর যিকির থেকে শুরু হয়, এরপর মসজিদে যাওয়া ও প্রবেশের যিকির, নামাজের সানা, রুকু, সিজদা ও তাশাহহুদের যিকির, এবং সালামের পরের যিকির ও বিতরের দোয়ায় শেষ হয়।',
            faqQ2: 'নামাজের সব যিকির কি নবী ﷺ থেকে প্রমাণিত?',
            faqA2: 'নামাজের অধিকাংশ যিকির ও দোয়া সুন্নাহর প্রসিদ্ধ গ্রন্থসমূহে এসেছে, এবং কিছুর একাধিক শব্দরূপ রয়েছে যেমন সানা ও কুনুতের দোয়া। এই পৃষ্ঠা যিকিরের গ্রন্থসমূহ থেকে বর্ণিত প্রসিদ্ধ শব্দরূপগুলো একত্র করে, এবং শব্দরূপ ও হরকত যাচাইয়ের জন্য উৎস দেখার পরামর্শ দেওয়া হয়।',
            faqQ3: 'নামাজের যিকির ও নামাজের পরের যিকিরের মধ্যে পার্থক্য কী?',
            faqA3: 'নামাজের পরের যিকির সাধারণভাবে নামাজের যিকিরেরই অংশ, এতে তাসবিহ, তাহমিদ, তাকবির এবং সালামের পর আয়াতুল কুরসি ও মুআওবিযাত পাঠ অন্তর্ভুক্ত। এগুলো এই পৃষ্ঠায় «নামাজের সালামের পরের যিকির» অংশে একত্র করা হয়েছে।',
            faqQ4: 'সানার দোয়া (দোয়ায়ে ইস্তিফতাহ) পড়ার বিধান কী?',
            faqA4: 'সানার দোয়া অধিকাংশ আলেমের মতে সুন্নত, যা তাকবিরে তাহরিমার পর ও সূরা ফাতিহা পড়ার আগে বলা হয়। একাধিক শব্দরূপ বর্ণিত হয়েছে, এর কিছু আপনি এই পৃষ্ঠার «নামাজের সানার দোয়া» কার্ডে পাবেন।',
            faqQ5: 'কুনুতের দোয়া কখন পড়া হয়?',
            faqA5: 'কুনুতের দোয়া বিতরের নামাজে পড়া হয়, এবং কিছু আলেমের মতে ফজরে কুনুত এর সঙ্গে যোগ করা হয়, তেমনি প্রয়োজনে কুনুতে নাযিলা। পৃষ্ঠায় আপনি দুটি কার্ড পাবেন: «কুনুতের দোয়া» ও «কিয়ামুল লাইলে নামাজের সানার দোয়া»।',
            faqQ6: 'নামাজের যিকিরের উৎস কি পৃষ্ঠায় দেখানো হয়?',
            faqA6: 'হ্যাঁ, প্রতিটি যিকিরের সঙ্গে এর উৎস দেখানো হয় যাতে পাঠক জানতে পারেন এটি কোথা থেকে এসেছে, আর যিকির সম্পর্কিত ফজিলত বা নোট থাকলে তা-ও দেখানো হয়।',
            faqQ7: 'বিতর শেষ করার পর কী বলা হয়?',
            faqA7: 'নবী ﷺ থেকে প্রমাণিত যে তিনি বিতরের পর তিনবার «সুবহানাল মালিকিল কুদ্দুস» বলতেন, এবং তৃতীয়বারে স্বর উঁচু করতেন। এই যিকির আপনি «বিতর শেষ করার পর যা বলা হয়» কার্ডে পুনরাবৃত্তি সহজ করার একটি কাউন্টারসহ পাবেন।',
            faqQ8: 'পৃষ্ঠা কি আমার অগ্রগতি স্বয়ংক্রিয়ভাবে সংরক্ষণ করে?',
            faqA8: 'হ্যাঁ, পৃষ্ঠাটি আপনার অগ্রগতি দিনভর একই ব্রাউজারে স্বয়ংক্রিয়ভাবে সংরক্ষণ করে, এরপর আপনার ডিভাইসের স্থানীয় সময় অনুযায়ী দিন পরিবর্তিত হলে কাউন্টারগুলো নতুন করে শুরু হয়।',
            faqQ9: 'নামাজের যিকির কি ফোন থেকে পড়া যায়?',
            faqA9: 'হ্যাঁ, পৃষ্ঠাটি ফোন ও কম্পিউটারের জন্য তৈরি, এবং যিকিরের কার্ডগুলো পড়তে সহজ, একটি স্থির অগ্রগতি বারসহ যা স্ক্রল করার সময় দৃশ্যমান থাকে যাতে কী সম্পূর্ণ হয়েছে তা অনুসরণ করা যায়।'
        },
        ms: {
            eduSecAria: 'Maklumat pendidikan tentang zikir solat',
            edu1T: 'Kelebihan dan kepentingan zikir solat',
            edu1P1: 'Zikir solat merupakan bahagian asas dalam mendirikan solat secara lengkap; ia merangkumi apa yang diucapkan ketika berwuduk dan menuju ke masjid, doa iftitah solat, serta zikir rukuk, sujud dan tasyahhud, di samping zikir selepas salam. Zikir-zikir ini diriwayatkan daripada Nabi ﷺ dan membantu seorang Muslim menghadirkan hati serta menambah kekhusyukan dalam solat.',
            edu1P2: 'Berpegang pada zikir solat menghubungkan seorang Muslim dengan Sunnah dan menjadikan solatnya lebih sempurna pahalanya serta lebih dekat kepada ketenangan, terutamanya apabila memberi perhatian kepada makna zikir dan bukan sekadar mengulanginya.',
            edu2T: 'Bagaimana menggunakan halaman zikir solat?',
            edu2P1: 'Zikir dipaparkan tersusun dalam kad berasingan, dari zikir wuduk sehingga selepas salam, dan setiap kad menunjukkan bilangan ulangan dan sumbernya. Anda boleh membaca semua zikir mengikut susunan, atau terus kepada zikir tertentu seperti Qunut atau doa Witir.',
            edu2P2: 'Bagi zikir yang disunatkan untuk diulang — seperti yang diucapkan tiga kali selepas Witir — kaunter membantu anda melengkapkan bilangan tanpa terlupa, dan kemajuan anda disimpan secara automatik sepanjang hari yang sama dalam pelayar anda.',
            edu3T: 'Zikir solat antara Sunnah dan memelihara makna',
            edu3P1: 'Banyak zikir solat diriwayatkan dalam pelbagai lafaz dalam kitab-kitab Sunnah yang masyhur, seperti doa iftitah solat, Qunut, dan doa duduk antara dua sujud, dan adalah sah bagi seorang Muslim memilih antara lafaz yang sabit. Yang paling penting ialah memahami makna zikir dan kehadirannya di hati, bukan sekadar membacanya dengan lisan.',
            edu3P2: 'Dan untuk melengkapkan ibadah dalam hari anda, disunatkan juga membaca zikir pagi dan petang, kedua-duanya tersedia pada halaman berasingan di laman ini.',
            linksAria: 'Pautan berkaitan',
            lnkBack: 'Kembali ke Zikir',
            lnkMorning: 'Zikir Pagi',
            lnkEvening: 'Zikir Petang',
            lnkPrayerTimes: 'Waktu Solat Hari Ini',
            lnkQibla: 'Arah Kiblat',
            lnkHijri: 'Tarikh Hijrah Hari Ini',
            faqTitle: 'Soalan lazim tentang zikir solat',
            faqQ1: 'Apakah zikir solat?',
            faqA1: 'Zikir solat ialah doa dan zikir yang diriwayatkan, yang diucapkan sebelum, semasa dan selepas solat; ia bermula dengan zikir wuduk, kemudian pergi ke masjid dan memasukinya, doa iftitah solat serta zikir rukuk, sujud dan tasyahhud, dan berakhir dengan zikir selepas salam dan doa Witir.',
            faqQ2: 'Adakah semua zikir solat sabit daripada Nabi ﷺ?',
            faqA2: 'Kebanyakan zikir solat dan doanya diriwayatkan dalam kitab-kitab Sunnah yang masyhur, dan sebahagiannya mempunyai beberapa lafaz seperti doa iftitah dan Qunut. Halaman ini menghimpunkan lafaz masyhur yang dinukilkan daripada kitab-kitab zikir, dan dinasihatkan merujuk sumber untuk mengesahkan lafaz dan barisnya.',
            faqQ3: 'Apakah perbezaan antara zikir solat dan zikir selepas solat?',
            faqA3: 'Zikir selepas solat adalah sebahagian daripada zikir solat secara umum, dan merangkumi tasbih, tahmid, takbir serta bacaan Ayat al-Kursi dan al-Mu‘awwizat selepas salam. Ia dihimpunkan pada halaman ini di bawah bahagian « Zikir selepas salam solat ».',
            faqQ4: 'Apakah hukum membaca doa iftitah?',
            faqA4: 'Doa iftitah adalah Sunnah menurut majoriti ahli ilmu, diucapkan selepas takbiratul ihram dan sebelum membaca al-Fatihah. Beberapa lafaz diriwayatkan; anda akan temui sebahagiannya dalam kad « Doa iftitah solat » pada halaman ini.',
            faqQ5: 'Bilakah doa Qunut dibaca?',
            faqA5: 'Doa Qunut dibaca dalam solat Witir, dan sebahagian ahli ilmu menambahnya dengan Qunut dalam Subuh, begitu juga Qunut nazilah ketika diperlukan. Pada halaman ini anda akan temui dua kad: « Doa Qunut » dan « Doa iftitah solat dalam qiamullail ».',
            faqQ6: 'Adakah sumber zikir solat dipaparkan pada halaman?',
            faqA6: 'Ya, sumber dipaparkan bersama setiap zikir untuk membantu pembaca mengetahui asalnya, berserta kelebihan atau nota berkaitan zikir apabila tersedia.',
            faqQ7: 'Apakah yang diucapkan selepas selesai Witir?',
            faqA7: 'Sabit daripada Nabi ﷺ bahawa baginda mengucapkan selepas Witir: « Subhana al-Malik al-Quddus » tiga kali, dan meninggikan suara pada kali ketiga. Anda akan temui zikir ini dalam kad « Apa yang diucapkan selepas selesai Witir » bersama kaunter untuk memudahkan ulangan.',
            faqQ8: 'Adakah halaman menyimpan kemajuan saya secara automatik?',
            faqA8: 'Ya, halaman ini menyimpan kemajuan anda sepanjang hari dalam pelayar yang sama, kemudian kaunter bermula semula apabila hari bertukar mengikut waktu tempatan peranti anda.',
            faqQ9: 'Bolehkah zikir solat dibaca daripada telefon?',
            faqA9: 'Ya, halaman ini direka untuk telefon dan komputer, dan kad zikir mudah dibaca, dengan bar kemajuan tetap yang kekal kelihatan semasa menatal untuk menjejaki apa yang telah diselesaikan.'
        },
        de: {
            eduSecAria: 'Lehrreiche Informationen über die Gebets-Adhkar',
            edu1T: 'Der Vorzug und die Bedeutung der Gebets-Adhkar',
            edu1P1: 'Die Gebets-Adhkar sind ein wesentlicher Teil davon, das Gebet in seiner vollständigen Form zu verrichten; sie umfassen das, was bei der Gebetswaschung und auf dem Weg zur Moschee gesagt wird, die Eröffnungsbittgebete des Gebets sowie die Adhkar der Verbeugung, der Niederwerfung und des Taschahhud, dazu die Adhkar nach dem Taslim. Diese Adhkar sind vom Propheten ﷺ überliefert und helfen dem Muslim zur Anwesenheit des Herzens und zu mehr Demut im Gebet.',
            edu1P2: 'Das Festhalten an den Gebets-Adhkar verbindet den Muslim mit der Sunna und macht sein Gebet vollkommener im Lohn und näher an der Gelassenheit, besonders wenn man auf die Bedeutungen der Adhkar achtet und sie nicht nur wiederholt.',
            edu2T: 'Wie benutzt man die Seite der Gebets-Adhkar?',
            edu2P1: 'Die Adhkar erscheinen geordnet in einzelnen Karten, von den Adhkar der Gebetswaschung bis zu jenen nach dem Taslim, und jede Karte zeigt die Wiederholungszahl und die Quelle. Du kannst alle Adhkar der Reihe nach lesen oder direkt zu einem bestimmten Dhikr wie dem Qunut oder dem Witr-Bittgebet gehen.',
            edu2P2: 'Bei den Adhkar, deren Wiederholung Sunna ist — wie das, was nach dem Witr dreimal gesagt wird — hilft dir der Zähler, die Zahl ohne Vergessen zu vervollständigen, und dein Fortschritt wird über denselben Tag automatisch in deinem Browser gespeichert.',
            edu3T: 'Die Gebets-Adhkar zwischen der Sunna und dem Achten auf die Bedeutung',
            edu3P1: 'Viele Gebets-Adhkar sind in mehreren Formulierungen in den bekannten Büchern der Sunna überliefert, wie die Eröffnungsbittgebete des Gebets, der Qunut und das Bittgebet des Sitzens zwischen den beiden Niederwerfungen, und es ist für den Muslim gültig, zwischen den feststehenden Formulierungen zu wählen. Das Wichtigste ist, die Bedeutung des Dhikr zu verstehen und im Herzen gegenwärtig zu halten, nicht bloß ihn mit der Zunge zu sprechen.',
            edu3P2: 'Und um die Anbetung an deinem Tag zu vervollständigen, ist es empfohlen, auch die Morgen- und Abend-Adhkar zu lesen, die beide auf eigenen Seiten dieser Website verfügbar sind.',
            linksAria: 'Verwandte Links',
            lnkBack: 'Zurück zu den Adhkar',
            lnkMorning: 'Morgen-Adhkar',
            lnkEvening: 'Abend-Adhkar',
            lnkPrayerTimes: 'Gebetszeiten heute',
            lnkQibla: 'Qibla-Richtung',
            lnkHijri: 'Heutiges Hidschri-Datum',
            faqTitle: 'Häufige Fragen zu den Gebets-Adhkar',
            faqQ1: 'Was sind die Gebets-Adhkar?',
            faqA1: 'Die Gebets-Adhkar sind die überlieferten Bittgebete und Gedenkformeln, die vor, während und nach dem Gebet gesagt werden; sie beginnen mit den Adhkar der Gebetswaschung, dann dem Gehen zur Moschee und dem Betreten, den Eröffnungsbittgebeten des Gebets sowie den Adhkar der Verbeugung, der Niederwerfung und des Taschahhud, und enden mit den Adhkar nach dem Taslim und dem Witr-Bittgebet.',
            faqQ2: 'Sind alle Gebets-Adhkar vom Propheten ﷺ belegt?',
            faqA2: 'Die meisten Gebets-Adhkar und ihre Bittgebete sind in den bekannten Büchern der Sunna überliefert, und einige haben mehrere Formulierungen, wie die Eröffnungs- und Qunut-Bittgebete. Diese Seite versammelt die bekannten Formulierungen, die aus den Büchern der Adhkar überliefert sind, und es wird geraten, die Quellen zu prüfen, um Formulierung und Vokalisierung zu bestätigen.',
            faqQ3: 'Was ist der Unterschied zwischen den Gebets-Adhkar und den Adhkar nach dem Gebet?',
            faqA3: 'Die Adhkar nach dem Gebet sind allgemein ein Teil der Gebets-Adhkar und umfassen das Tasbih, Tahmid, Takbir sowie das Rezitieren des Thronverses und der Schutzsuren nach dem Taslim. Sie wurden auf dieser Seite im Abschnitt « Die Adhkar nach dem Taslim des Gebets » zusammengefasst.',
            faqQ4: 'Wie lautet die Bestimmung zum Rezitieren des Eröffnungsbittgebets (Du‘a al-Istiftah)?',
            faqA4: 'Das Eröffnungsbittgebet ist nach der Mehrheit der Leute des Wissens eine Sunna, die nach dem Eröffnungs-Takbir und vor dem Rezitieren der al-Fatiha gesagt wird. Mehrere Formulierungen sind überliefert; einige davon findest du in der Karte « Eröffnungsbittgebete des Gebets » auf dieser Seite.',
            faqQ5: 'Wann wird das Qunut-Bittgebet gesagt?',
            faqA5: 'Das Qunut-Bittgebet wird im Witr-Gebet gesagt, und einige Leute des Wissens fügen den Qunut im Fadschr hinzu, ebenso den Qunut der Not, wenn nötig. Auf der Seite findest du zwei Karten: « Das Qunut-Bittgebet » und « Das Eröffnungsbittgebet des Gebets im nächtlichen Stehen ».',
            faqQ6: 'Werden die Quellen der Gebets-Adhkar auf der Seite angezeigt?',
            faqA6: 'Ja, mit jedem Dhikr wird die Quelle angezeigt, damit der Leser weiß, woher er stammt, zusammen mit dem Vorzug oder der Anmerkung zum Dhikr, sofern verfügbar.',
            faqQ7: 'Was wird nach dem Beenden des Witr gesagt?',
            faqA7: 'Es ist belegt, dass der Prophet ﷺ nach dem Witr dreimal sagte: « Subhana al-Malik al-Quddus », wobei er beim dritten Mal die Stimme erhob. Du findest diesen Dhikr in der Karte « Was nach dem Beenden des Witr gesagt wird » mit einem Zähler, der die Wiederholung erleichtert.',
            faqQ8: 'Speichert die Seite meinen Fortschritt automatisch?',
            faqA8: 'Ja, die Seite speichert deinen Fortschritt über den Tag im selben Browser, dann beginnen die Zähler von Neuem, wenn der Tag gemäß der Ortszeit deines Geräts wechselt.',
            faqQ9: 'Können die Gebets-Adhkar vom Telefon gelesen werden?',
            faqA9: 'Ja, die Seite ist für Telefon und Computer gestaltet, und die Adhkar-Karten sind leicht zu lesen, mit einer festen Fortschrittsleiste, die beim Scrollen sichtbar bleibt, um zu verfolgen, was abgeschlossen wurde.'
        },
        es: {
            eduSecAria: 'Información educativa sobre los adhkar de la oración',
            edu1T: 'La virtud y la importancia de los adhkar de la oración',
            edu1P1: 'Los adhkar de la oración son una parte esencial de realizar la oración en su forma completa; incluyen lo que se dice durante la ablución y de camino a la mezquita, las súplicas de apertura de la oración y los adhkar de la inclinación, la postración y el tashahhud, además de los adhkar después del taslim. Estos adhkar están transmitidos del Profeta ﷺ y ayudan al musulmán a la presencia del corazón y a aumentar la humildad en la oración.',
            edu1P2: 'Aferrarse a los adhkar de la oración conecta al musulmán con la Sunna y hace su oración más completa en recompensa y más cercana a la serenidad, sobre todo cuando se atiende a los significados de los adhkar y no solo a repetirlos.',
            edu2T: '¿Cómo usar la página de los adhkar de la oración?',
            edu2P1: 'Los adhkar aparecen ordenados en tarjetas separadas, desde los adhkar de la ablución hasta los de después del taslim, y cada tarjeta muestra el número de repeticiones y la fuente. Puedes leer todos los adhkar en orden, o ir directamente a un dhikr concreto como el Qunut o la súplica del Witr.',
            edu2P2: 'Para los adhkar cuya repetición es Sunna —como lo que se dice tres veces después del Witr— el contador te ayuda a completar el número sin olvidarlo, y tu progreso se guarda automáticamente durante el mismo día en tu navegador.',
            edu3T: 'Los adhkar de la oración entre la Sunna y el cuidado del significado',
            edu3P1: 'Muchos adhkar de la oración están reportados en varias fórmulas en los libros conocidos de la Sunna, como las súplicas de apertura de la oración, el Qunut y la súplica del sentarse entre las dos postraciones, y es válido para el musulmán elegir entre las fórmulas establecidas. Lo más importante es comprender el significado del dhikr y su presencia en el corazón, no limitarse a recitarlo con la lengua.',
            edu3P2: 'Y para completar tu adoración a lo largo del día, es recomendable leer también los adhkar de la mañana y de la tarde, ambos disponibles en páginas separadas en este sitio.',
            linksAria: 'Enlaces relacionados',
            lnkBack: 'Volver a los Adhkar',
            lnkMorning: 'Adhkar de la mañana',
            lnkEvening: 'Adhkar de la tarde',
            lnkPrayerTimes: 'Horarios de oración de hoy',
            lnkQibla: 'Dirección de la Quibla',
            lnkHijri: 'Fecha hégira de hoy',
            faqTitle: 'Preguntas frecuentes sobre los adhkar de la oración',
            faqQ1: '¿Qué son los adhkar de la oración?',
            faqA1: 'Los adhkar de la oración son las súplicas y recuerdos transmitidos que se dicen antes, durante y después de la oración; comienzan con los adhkar de la ablución, luego ir a la mezquita y entrar en ella, las súplicas de apertura de la oración y los adhkar de la inclinación, la postración y el tashahhud, y terminan con los adhkar después del taslim y la súplica del Witr.',
            faqQ2: '¿Están todos los adhkar de la oración establecidos del Profeta ﷺ?',
            faqA2: 'La mayoría de los adhkar de la oración y sus súplicas están reportados en los libros conocidos de la Sunna, y algunos tienen varias fórmulas, como las súplicas de apertura y del Qunut. Esta página reúne las fórmulas conocidas transmitidas de los libros de adhkar, y se aconseja consultar las fuentes para verificar la fórmula y la vocalización.',
            faqQ3: '¿Cuál es la diferencia entre los adhkar de la oración y los adhkar después de la oración?',
            faqA3: 'Los adhkar después de la oración son parte de los adhkar de la oración en general, e incluyen el tasbih, el tahmid, el takbir y la recitación del Versículo del Trono y las suras protectoras después del taslim. Se han reunido en esta página dentro de la sección « Los adhkar después del taslim de la oración ».',
            faqQ4: '¿Cuál es el juicio sobre recitar la súplica de apertura (du‘a al-istiftah)?',
            faqA4: 'La súplica de apertura es una Sunna según la mayoría de la gente de conocimiento, dicha después del takbir de apertura y antes de recitar al-Fatiha. Se reportan varias fórmulas; encontrarás algunas de ellas en la tarjeta « Súplicas de apertura de la oración » en esta página.',
            faqQ5: '¿Cuándo se dice la súplica del Qunut?',
            faqA5: 'La súplica del Qunut se dice en la oración del Witr, y algunos de la gente de conocimiento le añaden el Qunut en el Fayr, así como el Qunut de las calamidades cuando es necesario. En la página encontrarás dos tarjetas: « La súplica del Qunut » y « La súplica de apertura de la oración en la vigilia nocturna ».',
            faqQ6: '¿Se muestran las fuentes de los adhkar de la oración en la página?',
            faqA6: 'Sí, la fuente se muestra con cada dhikr para ayudar al lector a saber de dónde procede, junto con la virtud o la nota relacionada con el dhikr cuando están disponibles.',
            faqQ7: '¿Qué se dice después de terminar el Witr?',
            faqA7: 'Está establecido que el Profeta ﷺ decía después del Witr: « Subhana al-Malik al-Quddus » tres veces, elevando la voz en la tercera. Encontrarás este dhikr en la tarjeta « Lo que se dice después de terminar el Witr » con un contador para facilitar la repetición.',
            faqQ8: '¿La página guarda mi progreso automáticamente?',
            faqA8: 'Sí, la página guarda tu progreso durante el día en el mismo navegador, y luego los contadores vuelven a empezar cuando cambia el día según la hora local de tu dispositivo.',
            faqQ9: '¿Se pueden leer los adhkar de la oración desde un teléfono?',
            faqA9: 'Sí, la página está diseñada para teléfono y ordenador, y las tarjetas de adhkar son fáciles de leer, con una barra de progreso fija que permanece visible al desplazarte para seguir lo que se ha completado.'
        },
        id: {
            eduSecAria: 'Informasi edukatif tentang zikir salat',
            edu1T: 'Keutamaan dan pentingnya zikir salat',
            edu1P1: 'Zikir salat merupakan bagian mendasar dalam menegakkan salat secara sempurna; mencakup apa yang diucapkan saat berwudu dan menuju masjid, doa iftitah salat, serta zikir rukuk, sujud, dan tasyahud, di samping zikir setelah salam. Zikir-zikir ini diriwayatkan dari Nabi ﷺ dan membantu seorang Muslim menghadirkan hati serta menambah kekhusyukan dalam salat.',
            edu1P2: 'Berpegang pada zikir salat menghubungkan seorang Muslim dengan Sunnah dan menjadikan salatnya lebih sempurna pahalanya serta lebih dekat kepada ketenangan, terutama ketika memperhatikan makna zikir dan bukan sekadar mengulanginya.',
            edu2T: 'Bagaimana cara menggunakan halaman zikir salat?',
            edu2P1: 'Zikir tampil tersusun dalam kartu terpisah, dari zikir wudu hingga setelah salam, dan setiap kartu menampilkan jumlah pengulangan dan sumbernya. Anda dapat membaca semua zikir sesuai urutan, atau langsung ke zikir tertentu seperti Qunut atau doa Witir.',
            edu2P2: 'Untuk zikir yang disunahkan diulang — seperti yang diucapkan tiga kali setelah Witir — penghitung membantu Anda menyelesaikan jumlah tanpa lupa, dan kemajuan Anda tersimpan otomatis sepanjang hari yang sama di peramban Anda.',
            edu3T: 'Zikir salat antara Sunnah dan menjaga makna',
            edu3P1: 'Banyak zikir salat diriwayatkan dalam beberapa lafal di kitab-kitab Sunnah yang masyhur, seperti doa iftitah salat, Qunut, dan doa duduk di antara dua sujud, dan sah bagi seorang Muslim memilih di antara lafal yang tsabit. Yang terpenting adalah memahami makna zikir dan kehadirannya di hati, bukan sekadar membacanya dengan lisan.',
            edu3P2: 'Dan untuk menyempurnakan ibadah pada hari Anda, dianjurkan pula membaca zikir pagi dan petang, keduanya tersedia di halaman terpisah pada situs ini.',
            linksAria: 'Tautan terkait',
            lnkBack: 'Kembali ke Zikir',
            lnkMorning: 'Zikir Pagi',
            lnkEvening: 'Zikir Petang',
            lnkPrayerTimes: 'Jadwal Salat Hari Ini',
            lnkQibla: 'Arah Kiblat',
            lnkHijri: 'Tanggal Hijriah Hari Ini',
            faqTitle: 'Pertanyaan umum tentang zikir salat',
            faqQ1: 'Apa itu zikir salat?',
            faqA1: 'Zikir salat adalah doa dan zikir yang diriwayatkan, yang diucapkan sebelum, selama, dan sesudah salat; dimulai dari zikir wudu, lalu pergi ke masjid dan memasukinya, doa iftitah salat serta zikir rukuk, sujud, dan tasyahud, dan berakhir dengan zikir setelah salam serta doa Witir.',
            faqQ2: 'Apakah semua zikir salat tsabit dari Nabi ﷺ?',
            faqA2: 'Sebagian besar zikir salat dan doanya diriwayatkan dalam kitab-kitab Sunnah yang masyhur, dan sebagian memiliki beberapa lafal seperti doa iftitah dan Qunut. Halaman ini menghimpun lafal masyhur yang dinukil dari kitab-kitab zikir, dan disarankan merujuk sumber untuk memastikan lafal dan harakatnya.',
            faqQ3: 'Apa perbedaan antara zikir salat dan zikir setelah salat?',
            faqA3: 'Zikir setelah salat merupakan bagian dari zikir salat secara umum, dan mencakup tasbih, tahmid, takbir, serta bacaan Ayat Kursi dan al-Mu‘awwidzat setelah salam. Semuanya dihimpun di halaman ini dalam bagian « Zikir setelah salam salat ».',
            faqQ4: 'Apa hukum membaca doa iftitah?',
            faqA4: 'Doa iftitah adalah Sunnah menurut mayoritas ahli ilmu, diucapkan setelah takbiratul ihram dan sebelum membaca al-Fatihah. Beberapa lafal diriwayatkan; Anda akan menemukan sebagiannya di kartu « Doa iftitah salat » pada halaman ini.',
            faqQ5: 'Kapan doa Qunut dibaca?',
            faqA5: 'Doa Qunut dibaca dalam salat Witir, dan sebagian ahli ilmu menambahkan Qunut pada Subuh, begitu pula Qunut nazilah ketika diperlukan. Pada halaman ini Anda akan menemukan dua kartu: « Doa Qunut » dan « Doa iftitah salat dalam qiamullail ».',
            faqQ6: 'Apakah sumber zikir salat ditampilkan di halaman?',
            faqA6: 'Ya, sumber ditampilkan bersama setiap zikir untuk membantu pembaca mengetahui asalnya, beserta keutamaan atau catatan terkait zikir jika tersedia.',
            faqQ7: 'Apa yang diucapkan setelah selesai Witir?',
            faqA7: 'Tsabit dari Nabi ﷺ bahwa beliau mengucapkan setelah Witir: « Subhana al-Malik al-Quddus » tiga kali, dan meninggikan suara pada yang ketiga. Anda akan menemukan zikir ini di kartu « Apa yang diucapkan setelah selesai Witir » beserta penghitung untuk memudahkan pengulangan.',
            faqQ8: 'Apakah halaman menyimpan kemajuan saya secara otomatis?',
            faqA8: 'Ya, halaman ini menyimpan kemajuan Anda sepanjang hari di peramban ini, lalu penghitung mulai lagi dari awal saat hari berganti sesuai waktu lokal perangkat Anda.',
            faqQ9: 'Apakah zikir salat bisa dibaca dari ponsel?',
            faqA9: 'Ya, halaman ini dirancang untuk ponsel dan komputer, dan kartu zikir mudah dibaca, dengan bilah kemajuan tetap yang tetap terlihat saat menggulir untuk memantau apa yang telah diselesaikan.'
        }
    };

    try {
        console.log('[azkar-data] loaded · categories=' + window.AzkarCategories.length +
            ' · morning_items=' + window.AzkarMorning.length +
            ' · evening_items=' + window.AzkarEvening.length +
            ' · prayer_items=' + window.AzkarPrayer.length);
    } catch (_) { /* silent */ }
})();
