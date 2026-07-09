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

    try {
        console.log('[azkar-data] loaded · categories=' + window.AzkarCategories.length +
            ' · morning_items=' + window.AzkarMorning.length +
            ' · evening_items=' + window.AzkarEvening.length +
            ' · prayer_items=' + window.AzkarPrayer.length);
    } catch (_) { /* silent */ }
})();
