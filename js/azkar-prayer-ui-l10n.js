/* ══════════════════════════════════════════════════════════════════════════
 * AZKAR-PRAYER-PAGE-UI-L10N-CHROME-1 (2026-08-06)
 * ──────────────────────────────────────────────────────────────────────────
 * TOP-chrome UI strings for the /azkar/prayer-azkar page — the text OUTSIDE
 * the dhikr cards (breadcrumb, H1, subtitle, info strip, progress, sticky
 * progress, section intro H2 + paragraph, completion banner).
 *
 * WHY A SEPARATE FILE (deliberate boundary, set by the ticket):
 *   js/azkar-data.js is reserved for the azkar CARDS and their religious
 *   text. This file carries page CHROME only, so UI work never has to open
 *   the card data file. Nothing here is a dhikr, an ayah, a hadith or a
 *   transmitted supplication.
 *
 * WHAT THIS FILE MUST NEVER CONTAIN:
 *   - any dhikr text            - any card translation
 *   - source / repeat / virtue  - authenticity / authenticityNote
 *   - any ayah or hadith        - any transmitted du'a with an attribution
 *
 * The one devotional-sounding string, `completedSub`, is a generic closing
 * good-wish shown after the user finishes the page. It is NOT presented as a
 * transmitted text and carries no attribution — mirroring the morning and
 * evening pages, which already ship the same kind of line.
 *
 * ATTRIBUTE NAMESPACE — `data-azkar-pui` (NOT `data-azkar-ui`):
 *   The prayer walker rewrites `data-azkar-ui` across the WHOLE document, and
 *   the morning + evening sections ship in the same HTML with generic keys
 *   (heroTitle, infoCount, resetBtn, …). Reusing that attribute here would
 *   overwrite the morning/evening chrome with prayer wording in the SSR HTML.
 *   A distinct attribute keeps this dictionary structurally unable to touch
 *   any other page's markup.
 *
 * Consumed by: server.js (SSR walker) + js/app.js (SPA re-render).
 * ════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    window.AZKAR_PRAYER_PAGE_UI_L10N = {
        ar: {
            ariaBreadcrumb: 'مسار التصفح',
            bcHub: 'الأذكار',
            bcCurrent: 'أذكار الصلاة',
            heroTitle: 'أذكار الصلاة',
            heroSubtitle: 'اقرأ أذكار الصلاة مكتوبة بالترتيب — من الوضوء وحتى ما بعد السلام — مع المصدر وحفظ التقدم تلقائيًا.',
            ariaInfo: 'معلومات عامة',
            infoCount: '17 ذكرًا',
            infoCounter: 'عداد للأذكار المتكررة',
            infoAutosave: 'يُحفظ تقدمك تلقائيًا',
            progressInit: 'تم إكمال 0 من 17',
            progressTpl: 'تم إكمال {done} من {total}',
            resetBtn: 'إعادة ضبط العدادات',
            resetBtnShort: 'إعادة الضبط',
            ariaProgress: 'ملخص التقدم',
            sectionTitle: 'أذكار الصلاة مرتبة مع المصدر الصحيح',
            sectionText: 'تجد في هذه الصفحة أذكار الصلاة كاملة بالترتيب: من أذكار الوضوء والمسجد، ثم استفتاح الصلاة والركوع والسجود والتشهد، وحتى الأذكار بعد السلام ودعاء الوتر، مع توضيح المصدر وعداد للأذكار المتكررة.',
            completedTitle: 'تم إكمال أذكار الصلاة',
            completedSub: 'نسأل الله أن يتقبل منك صلاتك ودعاءك.'
        },
        en: {
            ariaBreadcrumb: 'Breadcrumb',
            bcHub: 'Adhkar',
            bcCurrent: 'Prayer Adhkar',
            heroTitle: 'Prayer Adhkar',
            heroSubtitle: 'Read the prayer adhkar in order — from wudu through to after the salam — with the source for each and your progress saved automatically.',
            ariaInfo: 'General information',
            infoCount: '17 adhkar',
            infoCounter: 'Counter for repeated adhkar',
            infoAutosave: 'Your progress is saved automatically',
            progressInit: '0 of 17 completed',
            progressTpl: '{done} of {total} completed',
            resetBtn: 'Reset counters',
            resetBtnShort: 'Reset',
            ariaProgress: 'Progress summary',
            sectionTitle: 'Prayer adhkar in order with authentic sources',
            sectionText: 'This page gathers the prayer adhkar in full and in order: from the adhkar of wudu and the mosque, then the opening supplication, the ruku, the sujud and the tashahhud, through to the adhkar after the salam and the witr supplication — each with its source and a counter for the repeated ones.',
            completedTitle: 'Prayer Adhkar completed',
            completedSub: 'We ask Allah to accept your prayer and your supplication.'
        },
        fr: {
            ariaBreadcrumb: 'Fil d’Ariane',
            bcHub: 'Invocations',
            bcCurrent: 'Invocations de la prière',
            heroTitle: 'Invocations de la prière',
            heroSubtitle: 'Lisez les invocations de la prière dans l’ordre — des ablutions jusqu’après le salam — avec la source de chacune et votre progression enregistrée automatiquement.',
            ariaInfo: 'Informations générales',
            infoCount: '17 invocations',
            infoCounter: 'Compteur pour les invocations répétées',
            infoAutosave: 'Votre progression est enregistrée automatiquement',
            progressInit: '0 sur 17 terminées',
            progressTpl: '{done} sur {total} terminées',
            resetBtn: 'Réinitialiser les compteurs',
            resetBtnShort: 'Réinitialiser',
            ariaProgress: 'Résumé de la progression',
            sectionTitle: 'Les invocations de la prière dans l’ordre, avec des sources authentiques',
            sectionText: 'Cette page réunit les invocations de la prière en intégralité et dans l’ordre : des invocations des ablutions et de la mosquée, puis l’invocation d’ouverture, l’inclinaison, la prosternation et le tachahhoud, jusqu’aux invocations après le salam et celle du witr — chacune avec sa source et un compteur pour les invocations répétées.',
            completedTitle: 'Invocations de la prière terminées',
            completedSub: 'Nous demandons à Allah d’accepter votre prière et votre invocation.'
        },
        ur: {
            ariaBreadcrumb: 'نیویگیشن راستہ',
            bcHub: 'اذکار',
            bcCurrent: 'نماز کے اذکار',
            heroTitle: 'نماز کے اذکار',
            heroSubtitle: 'نماز کے اذکار ترتیب کے ساتھ پڑھیں — وضو سے لے کر سلام کے بعد تک — ہر ایک کے حوالے کے ساتھ، اور آپ کی پیش رفت خودبخود محفوظ ہوتی ہے۔',
            ariaInfo: 'عمومی معلومات',
            infoCount: '17 اذکار',
            infoCounter: 'بار بار پڑھے جانے والے اذکار کا شمار کنندہ',
            infoAutosave: 'آپ کی پیش رفت خودبخود محفوظ ہوتی ہے',
            progressInit: '17 میں سے 0 مکمل',
            progressTpl: '{total} میں سے {done} مکمل',
            resetBtn: 'شمار کنندہ ری سیٹ کریں',
            resetBtnShort: 'ری سیٹ',
            ariaProgress: 'پیش رفت کا خلاصہ',
            sectionTitle: 'نماز کے اذکار ترتیب کے ساتھ اور مستند حوالے کے ساتھ',
            sectionText: 'یہ صفحہ نماز کے اذکار مکمل اور ترتیب کے ساتھ جمع کرتا ہے: وضو اور مسجد کے اذکار سے، پھر دعائے استفتاح، رکوع، سجود اور تشہد، اور سلام کے بعد کے اذکار اور دعائے وتر تک — ہر ایک اپنے حوالے کے ساتھ، اور بار بار پڑھے جانے والے اذکار کے لیے شمار کنندہ کے ساتھ۔',
            completedTitle: 'نماز کے اذکار مکمل ہو گئے',
            completedSub: 'ہم اللہ سے دعا کرتے ہیں کہ آپ کی نماز اور دعا قبول فرمائے۔'
        },
        tr: {
            ariaBreadcrumb: 'Gezinme yolu',
            bcHub: 'Zikirler',
            bcCurrent: 'Namaz Zikirleri',
            heroTitle: 'Namaz Zikirleri',
            heroSubtitle: 'Namaz zikirlerini sırayla okuyun — abdestten selamdan sonrasına kadar — her birinin kaynağıyla birlikte; ilerlemeniz otomatik olarak kaydedilir.',
            ariaInfo: 'Genel bilgiler',
            infoCount: '17 zikir',
            infoCounter: 'Tekrarlanan zikirler için sayaç',
            infoAutosave: 'İlerlemeniz otomatik olarak kaydedilir',
            progressInit: '17 zikirden 0 tamamlandı',
            progressTpl: '{total} zikirden {done} tamamlandı',
            resetBtn: 'Sayaçları sıfırla',
            resetBtnShort: 'Sıfırla',
            ariaProgress: 'İlerleme özeti',
            sectionTitle: 'Namaz zikirleri sırasıyla ve sahih kaynaklarıyla',
            sectionText: 'Bu sayfa namaz zikirlerini eksiksiz ve sırasıyla bir araya getirir: abdest ve mescit zikirlerinden başlayarak istiftah duası, rükû, secde ve teşehhüd, ardından selamdan sonraki zikirler ve vitir duası — her biri kaynağıyla ve tekrarlanan zikirler için bir sayaçla birlikte.',
            completedTitle: 'Namaz zikirleri tamamlandı',
            completedSub: 'Allah’tan namazınızı ve duanızı kabul etmesini dileriz.'
        },
        bn: {
            ariaBreadcrumb: 'ব্রেডক্রাম্ব',
            bcHub: 'যিকির',
            bcCurrent: 'নামাজের যিকির',
            heroTitle: 'নামাজের যিকির',
            heroSubtitle: 'নামাজের যিকিরগুলো ধারাবাহিকভাবে পড়ুন — অজু থেকে সালামের পর পর্যন্ত — প্রতিটির সূত্রসহ, আর আপনার অগ্রগতি স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়।',
            ariaInfo: 'সাধারণ তথ্য',
            infoCount: '17 যিকির',
            infoCounter: 'পুনরাবৃত্ত যিকিরের জন্য কাউন্টার',
            infoAutosave: 'আপনার অগ্রগতি স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়',
            progressInit: '17টির মধ্যে 0টি সম্পন্ন',
            progressTpl: '{total}টির মধ্যে {done}টি সম্পন্ন',
            resetBtn: 'কাউন্টার রিসেট করুন',
            resetBtnShort: 'রিসেট',
            ariaProgress: 'অগ্রগতির সারসংক্ষেপ',
            sectionTitle: 'ধারাবাহিকভাবে নামাজের যিকির, নির্ভরযোগ্য সূত্রসহ',
            sectionText: 'এই পৃষ্ঠায় নামাজের যিকিরগুলো সম্পূর্ণ ও ধারাবাহিকভাবে একত্র করা হয়েছে: অজু ও মসজিদের যিকির থেকে শুরু করে দোয়ায়ে ইসতিফতাহ, রুকু, সিজদা ও তাশাহহুদ, এরপর সালামের পরের যিকির ও বিতরের দোয়া পর্যন্ত — প্রতিটি তার সূত্রসহ এবং পুনরাবৃত্ত যিকিরের জন্য কাউন্টারসহ।',
            completedTitle: 'নামাজের যিকির সম্পন্ন হয়েছে',
            completedSub: 'আমরা আল্লাহর কাছে দোয়া করি তিনি যেন আপনার নামাজ ও দোয়া কবুল করেন।'
        },
        ms: {
            ariaBreadcrumb: 'Laluan navigasi',
            bcHub: 'Zikir',
            bcCurrent: 'Zikir Solat',
            heroTitle: 'Zikir Solat',
            heroSubtitle: 'Baca zikir solat mengikut susunan — dari wuduk sehingga selepas salam — bersama sumber bagi setiap satu, dan kemajuan anda disimpan secara automatik.',
            ariaInfo: 'Maklumat umum',
            infoCount: '17 zikir',
            infoCounter: 'Kaunter untuk zikir berulang',
            infoAutosave: 'Kemajuan anda disimpan secara automatik',
            progressInit: '0 daripada 17 selesai',
            progressTpl: '{done} daripada {total} selesai',
            resetBtn: 'Tetap semula kaunter',
            resetBtnShort: 'Tetap semula',
            ariaProgress: 'Ringkasan kemajuan',
            sectionTitle: 'Zikir solat mengikut susunan dengan sumber sahih',
            sectionText: 'Halaman ini menghimpunkan zikir solat secara lengkap dan mengikut susunan: daripada zikir wuduk dan masjid, kemudian doa iftitah, rukuk, sujud dan tasyahhud, sehingga zikir selepas salam dan doa witir — setiap satu dengan sumbernya serta kaunter untuk zikir yang berulang.',
            completedTitle: 'Zikir solat selesai',
            completedSub: 'Kami memohon kepada Allah agar menerima solat dan doa anda.'
        },
        de: {
            ariaBreadcrumb: 'Navigationspfad',
            bcHub: 'Adhkar',
            bcCurrent: 'Gebets-Adhkar',
            heroTitle: 'Gebets-Adhkar',
            heroSubtitle: 'Lies die Gebets-Adhkar der Reihe nach — von der Gebetswaschung bis nach dem Salam — mit der Quelle zu jedem; dein Fortschritt wird automatisch gespeichert.',
            ariaInfo: 'Allgemeine Informationen',
            infoCount: '17 Adhkar',
            infoCounter: 'Zähler für wiederholte Adhkar',
            infoAutosave: 'Dein Fortschritt wird automatisch gespeichert',
            progressInit: '0 von 17 abgeschlossen',
            progressTpl: '{done} von {total} abgeschlossen',
            resetBtn: 'Zähler zurücksetzen',
            resetBtnShort: 'Zurücksetzen',
            ariaProgress: 'Fortschrittsübersicht',
            sectionTitle: 'Die Gebets-Adhkar der Reihe nach mit authentischen Quellen',
            sectionText: 'Diese Seite versammelt die Gebets-Adhkar vollständig und in ihrer Reihenfolge: von den Adhkar der Gebetswaschung und der Moschee über das Eröffnungsbittgebet, die Verbeugung, die Niederwerfung und das Taschahhud bis zu den Adhkar nach dem Salam und dem Witr-Bittgebet — jedes mit seiner Quelle und einem Zähler für die wiederholten Adhkar.',
            completedTitle: 'Gebets-Adhkar abgeschlossen',
            completedSub: 'Wir bitten Allah, dein Gebet und dein Bittgebet anzunehmen.'
        },
        es: {
            ariaBreadcrumb: 'Ruta de navegación',
            bcHub: 'Adhkar',
            bcCurrent: 'Adhkar de la oración',
            heroTitle: 'Adhkar de la oración',
            heroSubtitle: 'Lee los adhkar de la oración en orden — desde la ablución hasta después del salam — con la fuente de cada uno y tu progreso guardado automáticamente.',
            ariaInfo: 'Información general',
            infoCount: '17 adhkar',
            infoCounter: 'Contador para los adhkar repetidos',
            infoAutosave: 'Tu progreso se guarda automáticamente',
            progressInit: '0 de 17 completados',
            progressTpl: '{done} de {total} completados',
            resetBtn: 'Reiniciar contadores',
            resetBtnShort: 'Reiniciar',
            ariaProgress: 'Resumen del progreso',
            sectionTitle: 'Los adhkar de la oración en orden y con fuentes auténticas',
            sectionText: 'Esta página reúne los adhkar de la oración completos y en orden: desde los adhkar de la ablución y de la mezquita, luego la súplica de apertura, la inclinación, la postración y el tashahhud, hasta los adhkar después del salam y la súplica del witr — cada uno con su fuente y con un contador para los que se repiten.',
            completedTitle: 'Adhkar de la oración completados',
            completedSub: 'Pedimos a Allah que acepte tu oración y tu súplica.'
        },
        id: {
            ariaBreadcrumb: 'Jalur navigasi',
            bcHub: 'Zikir',
            bcCurrent: 'Zikir Salat',
            heroTitle: 'Zikir Salat',
            heroSubtitle: 'Baca zikir salat secara berurutan — dari wudu hingga setelah salam — lengkap dengan sumbernya, dan kemajuan Anda disimpan otomatis.',
            ariaInfo: 'Informasi umum',
            infoCount: '17 zikir',
            infoCounter: 'Penghitung untuk zikir berulang',
            infoAutosave: 'Kemajuan Anda disimpan otomatis',
            progressInit: '0 dari 17 selesai',
            progressTpl: '{done} dari {total} selesai',
            resetBtn: 'Setel ulang penghitung',
            resetBtnShort: 'Setel ulang',
            ariaProgress: 'Ringkasan kemajuan',
            sectionTitle: 'Zikir salat secara berurutan dengan sumber sahih',
            sectionText: 'Halaman ini menghimpun zikir salat secara lengkap dan berurutan: dari zikir wudu dan masjid, lalu doa iftitah, rukuk, sujud dan tasyahud, hingga zikir setelah salam dan doa witir — masing-masing dengan sumbernya serta penghitung untuk zikir yang berulang.',
            completedTitle: 'Zikir salat selesai',
            completedSub: 'Kami memohon kepada Allah agar menerima salat dan doa Anda.'
        }
    };
})();
