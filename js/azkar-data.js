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
            status: 'soon',
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
            id: 'after-prayer',
            slug: 'after-prayer-azkar',
            route: '/azkar/after-prayer-azkar',
            icon: '🕌',
            status: 'soon',
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

    try {
        console.log('[azkar-data] loaded · categories=' + window.AzkarCategories.length +
            ' · morning_items=' + window.AzkarMorning.length);
    } catch (_) { /* silent */ }
})();
