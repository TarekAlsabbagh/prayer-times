// Phase Q-Hub-A — Qibla Hub SEO Cleanup (2026-05-04).
//
// SCOPE: /qibla ONLY (the public Hub/gateway).
// DOES NOT TOUCH: /qibla-in-{city}, /moon-*, /hijri-*, /prayer-times-*.
//
// SEOptimer flags addressed:
//   • Title — short (~42 chars). New per-lang Title in 50-60 sweet spot,
//     emphasizing Hub intent (find anywhere, not a city).
//   • Meta — short (~100 chars). New per-lang Meta in 130-160, mentions
//     "from your location", "interactive map", "manually pick city", "Mecca".
//   • H1 — multiple H1s. Add /qibla$ to _getActiveH1Marker so Phase I
//     downgrades inactive H1s to H2 on this route too.
//   • Keyword Consistency — prayer-times shell leaks "مواقيت الصلاة" /
//     "التاريخ الهجري". Strip #page-prayer-times shell and add
//     html.qibla-hub-page so CSS reveals #page-qibla immediately.
//   • Amount of Content — only ~244 words. Inject a new H2 educational
//     section with 4 H3 cards (per-lang) bringing word count to ~750+.
//
// This script edits server.js + js/app.js + index.html and is idempotent
// (refuses to re-run if marker present).

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SRV_PATH = path.join(ROOT, 'server.js');
const APP_PATH = path.join(ROOT, 'js', 'app.js');
const HTML_PATH = path.join(ROOT, 'index.html');

let srvRaw = readFileSync(SRV_PATH, 'utf8');
let appRaw = readFileSync(APP_PATH, 'utf8');

const isCRLFsrv = /\r\n/.test(srvRaw);
const isCRLFapp = /\r\n/.test(appRaw);

// Normalize to LF for matching; restore CRLF on write if originally CRLF.
let srv = srvRaw.replace(/\r\n/g, '\n');
let app = appRaw.replace(/\r\n/g, '\n');

if (/Phase Q-Hub-A \(2026-05-04\)/.test(srv)) {
    throw new Error('[server.js] Q-Hub-A already applied');
}

function toEol(s, useCRLF) { return useCRLF ? s.replace(/\n/g, '\r\n') : s; }

function replaceOnce(haystack, needle, replacement, label) {
    const i = haystack.indexOf(needle);
    if (i < 0) throw new Error(`[${label}] anchor not found`);
    if (haystack.indexOf(needle, i + 1) >= 0) {
        throw new Error(`[${label}] anchor not unique`);
    }
    return haystack.substring(0, i) + replacement + haystack.substring(i + needle.length);
}

// ───────────────────────────────────────────────────────────────────────
// 1) Update staticPages['/qibla'] Title and Meta (10 langs)
// ───────────────────────────────────────────────────────────────────────

const SRV_OLD_QIBLA = `        '/qibla': {
            // Phase D1: replace em-dash with "|", extend short titles, normalize TR desc
            title: {
                ar: 'اتجاه القبلة | بوصلة الكعبة المشرفة والمسافة',
                en: 'Qibla Direction | Compass and Distance to the Kaaba',
                fr: 'Direction de la Qibla | Boussole et distance à la Kaaba',
                tr: 'Kıble Yönü | Kâbe\\u2019ye Pusula ve Uzaklık Hesaplama',
                ur: 'سمتِ قبلہ | خانہ کعبہ کی طرف قطب نما اور فاصلہ',
                de: 'Qibla-Richtung | Kompass und Entfernung zur Kaaba',
                id: 'Arah Kiblat | Kompas Online dan Jarak ke Kakbah',
                es: 'Dirección de la Qibla | Brújula y distancia a la Kaaba',
                bn: 'কিবলার দিক | কাবার দিকনির্দেশ ও দূরত্ব নির্ণয়',
                ms: 'Arah Kiblat | Kompas Dalam Talian dan Jarak ke Kaabah',
            },
            desc: {
                ar: 'احسب اتجاه القبلة بدقة من أي موقع مع المسافة إلى الكعبة المشرفة وبوصلة تفاعلية وأسئلة شائعة.',
                en: 'Calculate the Qibla direction accurately from any location with the distance to the Kaaba, an interactive compass and a helpful FAQ.',
                fr: 'Calculez la direction précise de la Qibla depuis n\\u2019importe quel lieu : distance à la Kaaba, boussole interactive et FAQ utile.',
                tr: 'Her konumdan kıble yönünü doğru hesaplayın: Kâbe\\u2019ye uzaklık (km), etkileşimli pusula, anlık döndürme ve sıkça sorulan sorular.',
                ur: 'کسی بھی مقام سے قبلہ کی درست سمت، کعبہ تک فاصلہ، انٹرایکٹو قطب نما اور عام سوالات کے ساتھ۔',
                de: 'Berechnen Sie die Qibla-Richtung genau von jedem Ort aus: Entfernung zur Kaaba, interaktiver Kompass und hilfreiche FAQ.',
                id: 'Hitung arah kiblat dengan akurat dari lokasi mana pun, lengkap dengan jarak ke Kakbah, kompas interaktif, dan FAQ.',
                es: 'Calcule la dirección precisa de la Qibla desde cualquier lugar con la distancia a la Kaaba, una brújula interactiva y una FAQ útil.',
                bn: 'যেকোনো অবস্থান থেকে কিবলার সঠিক দিক—কাবা পর্যন্ত দূরত্ব, ইন্টারঅ্যাকটিভ কম্পাস এবং FAQ সহ।',
                ms: 'Kira arah kiblat dengan tepat dari mana-mana lokasi dengan jarak ke Kaabah, kompas interaktif dan FAQ berguna.',
            },
            app: { category: 'UtilitiesApplication' },
            ogType: 'website',
        },`;

const SRV_NEW_QIBLA = `        '/qibla': {
            // Phase Q-Hub-A (2026-05-04): extend Title to 50-60 sweet spot and
            // shift emphasis to Hub intent (find Qibla anywhere, NOT a city).
            // Was D1 (~42-char Title, ~100-char Meta) → SEOptimer flagged short.
            // Now mentions "اتجاه القبلة + بوصلة الكعبة + تحديد القبلة + بدقة"
            // for Hub-side keyword consistency.
            title: {
                ar: 'اتجاه القبلة الآن | بوصلة الكعبة وتحديد القبلة بدقة',
                en: 'Qibla Direction Now | Accurate Kaaba Compass and Finder',
                fr: 'Direction de la Qibla maintenant | Boussole Kaaba précise',
                tr: 'Kıble Yönü Şimdi | Kâbe Pusulası ve Hassas Konum Bulma',
                ur: 'ابھی سمتِ قبلہ معلوم کریں | کعبہ کا قطب نما درست تعین',
                de: 'Qibla-Richtung jetzt | präziser Kaaba-Kompass und Finder',
                id: 'Arah Kiblat Sekarang | Kompas Kakbah dan Penentu Akurat',
                es: 'Dirección de la Qibla ahora | Brújula Kaaba precisa',
                bn: 'এখনই কিবলার দিক | সঠিক কাবা কম্পাস ও কিবলা নির্ণয়',
                ms: 'Arah Kiblat Sekarang | Kompas Kaabah dan Penentu Tepat',
            },
            // Phase Q-Hub-A (2026-05-04): extend Meta from ~100 to 130-160 chars
            // (SEOptimer 120-160 sweet spot). Adds "from your location",
            // "interactive map", "manually pick city", "Mecca" — Hub intent.
            desc: {
                ar: 'اعرف اتجاه القبلة من موقعك بدقة باستخدام بوصلة الكعبة وخريطة تفاعلية، أو اختر مدينتك يدوياً لتحديد القبلة نحو مكة المكرمة.',
                en: 'Find the Qibla direction from your location accurately using a Kaaba compass and an interactive map, or pick your city manually to locate the Qibla toward Mecca.',
                fr: 'Trouvez la direction de la Qibla depuis votre position avec précision grâce à une boussole de la Kaaba et une carte interactive, ou choisissez votre ville manuellement vers La Mecque.',
                tr: 'Konumunuzdan kıble yönünü Kâbe pusulası ve etkileşimli harita ile hassas şekilde bulun ya da şehrinizi manuel seçerek kıbleyi Mekke yönünde belirleyin.',
                ur: 'اپنے مقام سے قبلہ کی درست سمت کعبہ کے قطب نما اور انٹرایکٹو نقشے سے معلوم کریں، یا مکہ مکرمہ کی طرف سمت جاننے کے لیے اپنا شہر منتخب کریں۔',
                de: 'Finden Sie die Qibla-Richtung von Ihrem Standort genau mit einem Kaaba-Kompass und einer interaktiven Karte, oder wählen Sie Ihre Stadt manuell zur Mekka-Peilung.',
                id: 'Temukan arah kiblat dari lokasi Anda dengan akurat menggunakan kompas Kakbah dan peta interaktif, atau pilih kota Anda secara manual untuk menentukan arah ke Mekkah.',
                es: 'Encuentre la dirección de la Qibla desde su ubicación con precisión usando una brújula de la Kaaba y un mapa interactivo, o elija su ciudad manualmente hacia La Meca.',
                bn: 'আপনার অবস্থান থেকে কাবা কম্পাস ও ইন্টারঅ্যাকটিভ মানচিত্র দিয়ে সঠিক কিবলার দিক জানুন, অথবা মক্কার দিকে কিবলা নির্ণয়ে নিজের শহর বেছে নিন।',
                ms: 'Cari arah kiblat dari lokasi anda dengan tepat menggunakan kompas Kaabah dan peta interaktif, atau pilih bandar anda secara manual untuk menentukan kiblat ke Makkah.',
            },
            app: { category: 'UtilitiesApplication' },
            ogType: 'website',
        },`;

srv = replaceOnce(srv, SRV_OLD_QIBLA, SRV_NEW_QIBLA, 'staticPages/qibla');

// ───────────────────────────────────────────────────────────────────────
// 2) Add /qibla$ active-H1 marker so Phase I downgrades inactive H1s.
// ───────────────────────────────────────────────────────────────────────

const SRV_OLD_H1MARKER = `    if (/^\\/qibla-in-/.test(path))                   return { kind: 'id',   value: 'qibla-hero-title' };`;
const SRV_NEW_H1MARKER = `    if (/^\\/qibla-in-/.test(path))                   return { kind: 'id',   value: 'qibla-hero-title' };
    // Phase Q-Hub-A (2026-05-04): /qibla Hub also uses #qibla-hero-title as the active H1.
    if (/^\\/qibla$/.test(path))                       return { kind: 'id',   value: 'qibla-hero-title' };`;

srv = replaceOnce(srv, SRV_OLD_H1MARKER, SRV_NEW_H1MARKER, 'getActiveH1Marker');

// ───────────────────────────────────────────────────────────────────────
// 3) Add _stripHtmlForQiblaHub strip-list + function (after Moon strip).
// ───────────────────────────────────────────────────────────────────────

const SRV_OLD_AFTERMOON = `function _stripPagePrayerTimesOnly(html) {
    return _stripElement(html, { type: 'id', value: 'page-prayer-times' });
}`;
const SRV_NEW_AFTERMOON = `function _stripPagePrayerTimesOnly(html) {
    return _stripElement(html, { type: 'id', value: 'page-prayer-times' });
}

// ── Phase Q-Hub-A (2026-05-04): Qibla Hub gateway strip ──
// SEOptimer was indexing #page-prayer-times content (مواقيت الصلاة, التاريخ
// الهجري) as if it were /qibla content, polluting Keyword Consistency.
// Strip the prayer shell + the static SEO blocks attached to /qibla. The
// new SEO content (educational section + extended Title/Meta) is injected
// in serveHtmlWithSeo gated on _isQiblaHub.
const _QIBLA_HUB_STRIP_IDS = [
    'page-prayer-times',          // entire prayer shell — keyword noise on Hub
    'sticky-next-bar',            // "next prayer" sticky — irrelevant to Qibla Hub
];
function _stripHtmlForQiblaHub(htmlIn) {
    let out = htmlIn;
    for (const id of _QIBLA_HUB_STRIP_IDS) {
        out = _stripElement(out, { type: 'id', value: id });
    }
    return out;
}`;

srv = replaceOnce(srv, SRV_OLD_AFTERMOON, SRV_NEW_AFTERMOON, 'qibla strip function');

// ───────────────────────────────────────────────────────────────────────
// 4) Add _isQiblaHub detection + pipeline (parallel to _isMoonTodayHub).
// ───────────────────────────────────────────────────────────────────────

// 4a — Add the flag in serveHtmlWithSeo near _isMoonTodayHub
const SRV_OLD_FLAGS = `    const _isMoonTodayHub = /^\\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\\/)?moon-today$/.test(urlPath);`;
const SRV_NEW_FLAGS = `    const _isMoonTodayHub = /^\\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\\/)?moon-today$/.test(urlPath);
    // Phase Q-Hub-A (2026-05-04): /qibla Hub detection. Used to (a) strip the
    // prayer shell from SSR, (b) inject html.qibla-hub-page so #page-qibla is
    // visible immediately, and (c) inject the educational section + override H1.
    const _isQiblaHub = /^\\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\\/)?qibla$/.test(urlPath);`;

srv = replaceOnce(srv, SRV_OLD_FLAGS, SRV_NEW_FLAGS, 'isQiblaHub flag');

// 4b — Strip + class + content injection block, placed AFTER Moon Hub block
//      and BEFORE the closing of _isMoonCityPageSsr handling. We anchor on
//      the existing Moon Hub block start so insertion is unambiguous.
const SRV_OLD_BEFOREQIBLAINJ = `    // 1f) UAT-Moon-Home: /moon-today → Moon Gateway. Strip heavy moon sections
    //     + entire #page-prayer-times shell. Inject html.moon-today-hub-page so
    //     CSS reveals the new #moon-hub-hero / #moon-hub-faq immediately.
    if (_isMoonTodayHub) {`;
const SRV_NEW_BEFOREQIBLAINJ = `    // Phase Q-Hub-A (2026-05-04): /qibla Hub gateway. Mirrors the moon-today
    // pattern — strip prayer shell, inject html.qibla-hub-page (already present
    // in css/style.css line 2 via .qibla-page-loading; we add a permanent class
    // qibla-hub-page so the strip survives even after JS removes -loading), and
    // SSR-replace H1 + inject educational H2 with 4 H3 cards before FAQ.
    if (_isQiblaHub) {
        html = _stripHtmlForQiblaHub(html);
        html = html.replace(/<html(\\s[^>]*)?>/, (match, attrs) => {
            const a = attrs || '';
            if (/\\bclass="/.test(a)) {
                return '<html' + a.replace(/\\bclass="([^"]*)"/, (mm, cls) => \`class="\${cls} qibla-hub-page"\`) + '>';
            }
            return '<html' + a + ' class="qibla-hub-page">';
        });
        // 4b-i — SSR-replace #qibla-hero-title with the long Hub H1 phrase
        // (per-lang). Drop data-i18n so _translateI18nAttrs doesn't overwrite.
        const _qHubH1ByLang = {
            ar: 'اعرف اتجاه القبلة بدقة من أي مكان في العالم',
            en: 'Find the Qibla Direction Accurately from Anywhere in the World',
            fr: 'Trouvez la direction de la Qibla avec précision partout dans le monde',
            tr: 'Dünyanın Her Yerinden Kıble Yönünü Hassas Olarak Bulun',
            ur: 'دنیا میں کہیں سے بھی قبلہ کی درست سمت معلوم کریں',
            de: 'Qibla-Richtung präzise von überall auf der Welt finden',
            id: 'Cari Arah Kiblat dengan Akurat dari Mana Saja di Dunia',
            es: 'Encuentre la dirección de la Qibla con precisión desde cualquier lugar',
            bn: 'বিশ্বের যেকোনো স্থান থেকে সঠিক কিবলার দিক জানুন',
            ms: 'Cari Arah Kiblat dengan Tepat dari Mana-mana Sahaja di Dunia',
        };
        const _qHubH1 = _qHubH1ByLang[seo.lang] || _qHubH1ByLang.en;
        html = html.replace(
            /<h1 id="qibla-hero-title"[^>]*>[\\s\\S]*?<\\/h1>/,
            \`<h1 id="qibla-hero-title" class="qibla-hero-title"><svg class="icon icon-md" aria-hidden="true"><use href="#i-compass"/></svg> <span>\${_escHtml(_qHubH1)}</span></h1>\`
        );
        // 4b-ii — Inject educational H2 section ("دليل استخدام بوصلة القبلة")
        // with 4 H3 cards. Per-lang. Inserted BEFORE the FAQ section in
        // #page-qibla so it appears in the natural reading flow:
        //   Hero → How-to → Use cases → [NEW guide] → FAQ → Footer
        const _qHubGuide = {
            ar: {
                h2: 'دليل استخدام بوصلة القبلة',
                lead: 'يوضّح هذا الدليل كيفيّة استخدام بوصلة القبلة على هذه الصفحة لتحديد اتجاه الكعبة المشرفة بدقة من موقعك أو من المدينة التي تختارها يدوياً، مع شرح للأسباب التي تجعل زاوية القبلة تختلف من مكان إلى آخر.',
                cards: [
                    { h3: 'كيف تعمل بوصلة القبلة؟', body: 'تعتمد بوصلة القبلة على إحداثيّات موقعك الجغرافيّة (خط العرض وخط الطول) لحساب الزاوية الأقصر هندسيّاً نحو الكعبة المشرفة في مكة المكرمة. عند فتح الصفحة نطلب إذن الوصول إلى موقعك، أو نسمح لك باختيار المدينة من القائمة، ثمّ نُحوّل الإحداثيّات إلى زاوية باستخدام صيغة Great-Circle الفلكيّة. تُعرض الزاوية بالدرجات انطلاقاً من الشمال الجغرافيّ، ويظهر سهم البوصلة في الواجهة موجَّهاً نحو القبلة. كلّما كان موقعك أكثر دقّة كانت الزاوية أصدق، لذا يُفضَّل تشغيل GPS على الهاتف للحصول على نتيجة أدقّ.' },
                    { h3: 'تحديد القبلة من موقعي', body: 'حين تضغط على زرّ «اعرف اتجاه القبلة من موقعي» يطلب المتصفّح إذناً للوصول إلى موقعك الحاليّ. عند الموافقة تُمرَّر الإحداثيّات إلى الصفحة فوراً، ثمّ يُحسب اتجاه القبلة وتظهر الزاوية والمسافة إلى مكة المكرمة. لتحقيق أدقّ نتيجة عند استخدام البوصلة الفعليّة في الهاتف، احرص على إبعاد الجهاز عن المعادن الكبيرة وأبواب الحديد، لأنّها تؤثّر على حساس الاتجاه المغناطيسيّ. كذلك يُفضَّل أن تكون في مكان مفتوح أو قرب نافذة لتحسين دقّة GPS، وإذا لم تشأ مشاركة الموقع فيمكنك اختيار مدينتك يدوياً.' },
                    { h3: 'اختيار المدينة يدوياً', body: 'إذا رفض المتصفّح إذن الموقع، أو لم يدعم متصفّحك تحديد الموقع، أو فضّلت ببساطة عدم مشاركة موقعك، يمكنك اختيار مدينتك من قائمة المدن الشائعة، أو كتابة اسمها في حقل البحث في أعلى الصفحة. تتضمّن قائمة البحث آلاف المدن حول العالم بأسماء عربيّة وإنجليزيّة، وعند اختيار المدينة ننتقل إلى صفحة مخصّصة تعرض اتجاه القبلة من تلك المدينة بالاعتماد على إحداثيّاتها الرسميّة. هذا الخيار مفيد عند زيارة مدينة جديدة أو لمعرفة اتجاه القبلة قبل السفر بحيث يمكن التخطيط مسبقاً.' },
                    { h3: 'لماذا تختلف زاوية القبلة؟', body: 'تختلف زاوية القبلة من موقع إلى آخر لأنّ الأرض كرويّة، وأقرب اتجاه هندسيّ بين أيّ نقطتين على سطحها يتغيّر بتغيّر إحداثيّاتهما. مثلاً في الرياض تكون القبلة جنوب-غرب تقريباً، وفي إسطنبول جنوب-شرق، وفي القاهرة شرق، وفي الدار البيضاء شمال-شرق، وفي جاكرتا غرب. لذلك لا يوجد اتجاه ثابت للقبلة على مستوى الكرة الأرضيّة، بل تُحسب لكلّ موقع زاوية مخصّصة. تُقاس الزاوية بالدرجات من الشمال الجغرافيّ في عقارب الساعة، فالقيمة 0° تعني شمالاً و90° شرقاً و180° جنوباً و270° غرباً.' },
                ],
            },
            en: {
                h2: 'Guide to Using the Qibla Compass',
                lead: 'This guide explains how to use the Qibla compass on this page to find the direction toward the Kaaba accurately, either from your location or from a city you pick manually, plus why the Qibla angle differs between places.',
                cards: [
                    { h3: 'How does the Qibla compass work?', body: 'The Qibla compass uses your geographic coordinates (latitude and longitude) to compute the shortest geometric bearing toward the Kaaba in Mecca. When you open the page we ask for location permission, or let you pick a city from the list, then we convert the coordinates into an angle using the astronomical Great-Circle formula. The angle is shown in degrees clockwise from geographic north, and the compass arrow on the page points toward the Qibla. The more accurate your location, the truer the angle — so enabling GPS on a phone yields the best result.' },
                    { h3: 'Finding the Qibla from my location', body: 'When you tap "Find Qibla from my location", the browser asks for permission to read your current position. Once you accept, the coordinates pass to the page immediately, the Qibla angle is calculated, and the bearing and distance to Mecca are displayed. For best accuracy with the actual phone compass, keep the device away from large metal objects and iron doors, which interfere with the magnetic sensor. Standing in an open area or near a window also improves GPS accuracy, and if you prefer not to share your location you can always pick a city manually.' },
                    { h3: 'Picking a city manually', body: 'If your browser denies location permission, does not support geolocation, or you simply prefer not to share your position, you can pick a city from the popular-cities list or type its name in the search field at the top of the page. The search includes thousands of cities worldwide with both English and Arabic names. When you select a city, we navigate to a dedicated page showing the Qibla direction from that city based on its official coordinates. This is useful when visiting a new city or planning ahead before travel.' },
                    { h3: 'Why does the Qibla angle differ?', body: 'The Qibla angle differs between places because Earth is spherical, and the shortest geometric path between any two surface points changes with their coordinates. For example, the Qibla is roughly southwest from Riyadh, southeast from Istanbul, east from Cairo, northeast from Casablanca, and west from Jakarta. There is no single global Qibla direction; instead, a tailored angle is computed for each location. The angle is measured in degrees clockwise from geographic north — 0° means north, 90° east, 180° south, and 270° west.' },
                ],
            },
            fr: {
                h2: 'Guide d\\u2019utilisation de la boussole de la Qibla',
                lead: 'Ce guide explique comment utiliser la boussole de la Qibla pour trouver la direction de la Kaaba avec précision, depuis votre position ou depuis une ville choisie manuellement, et pourquoi l\\u2019angle de Qibla varie d\\u2019un endroit à l\\u2019autre.',
                cards: [
                    { h3: 'Comment fonctionne la boussole de la Qibla ?', body: 'La boussole utilise vos coordonnées géographiques (latitude et longitude) pour calculer le cap géométrique le plus court vers la Kaaba à La Mecque. À l\\u2019ouverture de la page nous demandons l\\u2019autorisation d\\u2019accès à la position, ou vous laissons choisir une ville dans la liste, puis nous convertissons les coordonnées en angle via la formule astronomique du grand cercle. L\\u2019angle est exprimé en degrés à partir du nord géographique, et la flèche pointe vers la Qibla. Plus votre position est précise, plus l\\u2019angle est juste — l\\u2019activation du GPS donne le meilleur résultat.' },
                    { h3: 'Trouver la Qibla depuis ma position', body: 'Lorsque vous appuyez sur « Trouver la Qibla depuis ma position », le navigateur demande l\\u2019autorisation de lire votre position actuelle. Dès que vous acceptez, les coordonnées sont transmises à la page, l\\u2019angle de Qibla est calculé et la distance vers La Mecque s\\u2019affiche. Pour une précision maximale avec la vraie boussole du téléphone, éloignez l\\u2019appareil des grands objets métalliques et des portes en fer, qui perturbent le capteur magnétique. Tenez-vous en zone ouverte ou près d\\u2019une fenêtre pour améliorer le GPS, et si vous préférez ne pas partager la position, choisissez une ville manuellement.' },
                    { h3: 'Choisir une ville manuellement', body: 'Si le navigateur refuse la géolocalisation, ne la prend pas en charge, ou si vous préférez ne pas la partager, vous pouvez choisir une ville dans la liste des villes populaires ou saisir son nom dans la barre de recherche en haut. La recherche couvre des milliers de villes dans le monde, avec des noms en français et en arabe. Une fois la ville choisie, nous ouvrons une page dédiée affichant la direction de la Qibla depuis cette ville à partir de ses coordonnées officielles. Pratique pour préparer un voyage ou explorer un nouveau lieu.' },
                    { h3: 'Pourquoi l\\u2019angle de Qibla varie-t-il ?', body: 'L\\u2019angle de Qibla varie selon les lieux car la Terre est sphérique, et le chemin géométrique le plus court entre deux points de sa surface dépend de leurs coordonnées. Par exemple, la Qibla est environ sud-ouest depuis Riyad, sud-est depuis Istanbul, est depuis Le Caire, nord-est depuis Casablanca, et ouest depuis Jakarta. Il n\\u2019existe pas une direction unique pour toute la Terre ; un angle propre est calculé pour chaque emplacement. Il est mesuré en degrés à partir du nord géographique : 0° nord, 90° est, 180° sud, 270° ouest.' },
                ],
            },
            tr: {
                h2: 'Kıble Pusulası Kullanım Kılavuzu',
                lead: 'Bu kılavuz, sayfadaki kıble pusulasını kullanarak Kâbe yönünü konumunuzdan ya da elle seçtiğiniz bir şehirden hassas şekilde nasıl bulacağınızı ve kıble açısının yere göre neden değiştiğini açıklar.',
                cards: [
                    { h3: 'Kıble pusulası nasıl çalışır?', body: 'Kıble pusulası, coğrafi koordinatlarınızı (enlem ve boylam) kullanarak Mekke\\u2019deki Kâbe yönüne en kısa geometrik açıyı hesaplar. Sayfayı açtığınızda konum izni isteriz veya listeden bir şehir seçmenize izin veririz, ardından koordinatları Great-Circle astronomi formülüyle açıya çeviririz. Açı, coğrafi kuzeyden saat yönünde derecelerle gösterilir ve sayfadaki ok kıbleye yönelir. Konumunuz ne kadar doğru olursa açı da o kadar gerçek olur; en iyi sonuç için telefonun GPS\\u2019ini etkinleştirin.' },
                    { h3: 'Konumumdan kıbleyi bulma', body: '\\u201CKıbleyi konumumdan bul\\u201D düğmesine bastığınızda tarayıcı mevcut konumunuzu okumak için izin ister. Onayladığınızda koordinatlar sayfaya geçer, kıble açısı hesaplanır ve Mekke\\u2019ye uzaklık gösterilir. Telefonun gerçek pusulasıyla en yüksek doğruluk için cihazı büyük metal nesnelerden ve demir kapılardan uzak tutun; manyetik sensörü etkilerler. Açık bir yerde veya pencere yakınında durmak GPS doğruluğunu artırır. Konumunuzu paylaşmak istemiyorsanız her zaman elle bir şehir seçebilirsiniz.' },
                    { h3: 'Şehri elle seçme', body: 'Tarayıcı konum izni vermezse, konum desteği yoksa ya da paylaşmak istemezseniz, popüler şehirler listesinden bir şehir seçebilir veya üst kısımdaki arama alanına adını yazabilirsiniz. Arama, dünya genelinde binlerce şehri Türkçe, İngilizce ve Arapça adlarıyla kapsar. Bir şehir seçtiğinizde, o şehrin resmi koordinatlarına göre kıble yönünü gösteren özel bir sayfaya yönlendiriliriz. Yeni bir şehri ziyaret ederken veya seyahat öncesi planlama yaparken kullanışlıdır.' },
                    { h3: 'Kıble açısı neden değişir?', body: 'Dünya küresel olduğundan kıble açısı yere göre değişir; iki yüzey noktası arasındaki en kısa geometrik yol koordinatlara bağlıdır. Örneğin Riyad\\u2019dan kıble yaklaşık güneybatı, İstanbul\\u2019dan güneydoğu, Kahire\\u2019den doğu, Kazablanka\\u2019dan kuzeydoğu ve Cakarta\\u2019dan batıdır. Tek bir küresel kıble yönü yoktur; her konum için ayrı bir açı hesaplanır. Açı coğrafi kuzeyden saat yönünde derece cinsinden ölçülür: 0° kuzey, 90° doğu, 180° güney, 270° batı.' },
                ],
            },
            ur: {
                h2: 'قبلہ کے قطب نما کے استعمال کا رہنما',
                lead: 'یہ رہنما بتاتا ہے کہ اس صفحے کے قبلہ کے قطب نما سے کعبہ کی سمت اپنے مقام سے یا منتخب کردہ شہر سے درست طور پر کیسے معلوم کریں، اور قبلہ کی زاویہ مختلف مقامات پر کیوں مختلف ہوتی ہے۔',
                cards: [
                    { h3: 'قبلہ کا قطب نما کیسے کام کرتا ہے؟', body: 'قبلہ کا قطب نما آپ کے جغرافیائی نقاط (طول و عرض البلد) کی بنیاد پر مکہ مکرمہ میں کعبہ کی سب سے مختصر ہندسی سمت کا حساب لگاتا ہے۔ صفحہ کھولنے پر ہم آپ سے مقام کی اجازت طلب کرتے ہیں یا فہرست سے شہر منتخب کرنے کا اختیار دیتے ہیں، پھر Great-Circle فلکی فارمولے سے نقاط کو زاویہ میں بدلتے ہیں۔ زاویہ جغرافیائی شمال سے درجات میں دکھایا جاتا ہے، اور قطب نما کا تیر قبلہ کی طرف اشارہ کرتا ہے۔ مقام جتنا درست ہوگا زاویہ اتنا ہی صحیح ہوگا، اس لیے فون پر GPS کا استعمال بہترین نتیجہ دیتا ہے۔' },
                    { h3: 'اپنے مقام سے قبلہ کی سمت', body: 'جب آپ \\u201Cاپنے مقام سے قبلہ معلوم کریں\\u201D دباتے ہیں، براؤزر آپ کا موجودہ مقام پڑھنے کی اجازت مانگتا ہے۔ اجازت دینے پر نقاط فوراً صفحے کو منتقل ہو جاتے ہیں، قبلہ کی زاویہ شمار ہوتی ہے، اور مکہ تک فاصلہ ظاہر ہو جاتا ہے۔ اصل فون قطب نما کے ساتھ بہترین درستگی کے لیے آلے کو بڑے دھاتی اشیاء اور لوہے کے دروازوں سے دور رکھیں کیونکہ یہ مقناطیسی سینسر پر اثر ڈالتے ہیں۔ کھلی جگہ یا کھڑکی کے قریب کھڑے ہونا GPS بہتر کرتا ہے، اور اگر مقام شیئر نہ کرنا چاہیں تو شہر کا انتخاب دستی طور پر بھی ممکن ہے۔' },
                    { h3: 'شہر کا دستی انتخاب', body: 'اگر براؤزر مقام کی اجازت سے انکار کرے، یا مقام کی سہولت دستیاب نہ ہو، یا آپ مقام شیئر نہیں کرنا چاہتے، تو آپ مشہور شہروں کی فہرست سے یا صفحے کے اوپری تلاش میں اپنے شہر کا نام لکھ کر منتخب کر سکتے ہیں۔ تلاش میں ہزاروں شہر اردو، انگریزی اور عربی نام سے شامل ہیں۔ شہر منتخب کرنے پر ہم اس شہر کے سرکاری نقاط کی بنیاد پر قبلہ سمت دکھانے والے مخصوص صفحے پر چلے جاتے ہیں۔ یہ نئے شہر جانے یا سفر کی منصوبہ بندی کے وقت کارآمد ہے۔' },
                    { h3: 'قبلہ کی زاویہ کیوں مختلف ہوتی ہے؟', body: 'قبلہ کی زاویہ مختلف مقامات پر مختلف ہوتی ہے کیونکہ زمین کرہ نما ہے اور دو سطحی نقاط کے درمیان مختصر ترین ہندسی راستہ ان کے نقاط پر منحصر ہے۔ مثلاً ریاض سے قبلہ تقریباً جنوب مغرب، استنبول سے جنوب مشرق، قاہرہ سے مشرق، کاسابلانکا سے شمال مشرق، اور جکارتہ سے مغرب میں ہے۔ پوری زمین کے لیے ایک ہی سمت نہیں؛ ہر مقام کے لیے الگ زاویہ نکلتا ہے۔ زاویہ جغرافیائی شمال سے گھڑی کے رخ پر درجات میں ماپا جاتا ہے: 0° شمال، 90° مشرق، 180° جنوب، 270° مغرب۔' },
                ],
            },
            de: {
                h2: 'Anleitung zur Nutzung des Qibla-Kompasses',
                lead: 'Diese Anleitung erklärt, wie Sie den Qibla-Kompass auf dieser Seite nutzen, um die Richtung zur Kaaba präzise zu bestimmen \\u2014 entweder von Ihrem Standort oder von einer manuell gewählten Stadt \\u2014, und warum der Qibla-Winkel von Ort zu Ort variiert.',
                cards: [
                    { h3: 'Wie funktioniert der Qibla-Kompass?', body: 'Der Qibla-Kompass nutzt Ihre geographischen Koordinaten (Breite und Länge), um die kürzeste geometrische Peilung zur Kaaba in Mekka zu berechnen. Beim Öffnen der Seite fragen wir nach Standortfreigabe oder lassen Sie eine Stadt aus der Liste wählen, dann wandeln wir die Koordinaten mit der astronomischen Großkreis-Formel in einen Winkel um. Der Winkel wird in Grad im Uhrzeigersinn vom geographischen Norden angezeigt, und der Pfeil zeigt zur Qibla. Je genauer Ihre Position, desto wahrer der Winkel \\u2014 GPS am Telefon liefert das beste Ergebnis.' },
                    { h3: 'Qibla-Richtung von meinem Standort', body: 'Wenn Sie auf \\u201EQibla von meinem Standort\\u201C tippen, fragt der Browser nach Erlaubnis, Ihre aktuelle Position zu lesen. Nach Annahme werden die Koordinaten an die Seite übergeben, der Qibla-Winkel berechnet und die Entfernung nach Mekka angezeigt. Für höchste Genauigkeit mit dem Handy-Kompass halten Sie das Gerät von großen Metallobjekten und Eisentüren fern, da sie den Magnetsensor stören. In offenem Gelände oder am Fenster verbessert sich GPS, und wenn Sie den Standort nicht teilen möchten, wählen Sie einfach eine Stadt manuell.' },
                    { h3: 'Stadt manuell wählen', body: 'Wenn der Browser den Standort verweigert, Geolokalisierung nicht unterstützt oder Sie ihn nicht teilen möchten, wählen Sie eine Stadt aus der Liste beliebter Städte oder geben den Namen ins Suchfeld oben ein. Die Suche umfasst Tausende Städte weltweit mit deutschen, englischen und arabischen Namen. Nach Auswahl öffnen wir eine spezielle Seite, die die Qibla-Richtung aus dieser Stadt anhand offizieller Koordinaten zeigt. Praktisch beim Reisen oder Planen.' },
                    { h3: 'Warum variiert der Qibla-Winkel?', body: 'Der Qibla-Winkel variiert, weil die Erde kugelförmig ist und der kürzeste Weg zwischen zwei Oberflächenpunkten von ihren Koordinaten abhängt. Zum Beispiel ist die Qibla aus Riad etwa Südwest, aus Istanbul Südost, aus Kairo Ost, aus Casablanca Nordost, aus Jakarta West. Es gibt keine einzelne globale Qibla-Richtung \\u2014 für jeden Ort wird ein eigener Winkel berechnet. Er wird in Grad im Uhrzeigersinn vom geographischen Norden gemessen: 0° Nord, 90° Ost, 180° Süd, 270° West.' },
                ],
            },
            id: {
                h2: 'Panduan Menggunakan Kompas Kiblat',
                lead: 'Panduan ini menjelaskan cara menggunakan kompas kiblat di halaman ini untuk menemukan arah Kakbah secara akurat, baik dari lokasi Anda atau kota yang Anda pilih secara manual, serta mengapa sudut kiblat berbeda di setiap tempat.',
                cards: [
                    { h3: 'Bagaimana kompas kiblat bekerja?', body: 'Kompas kiblat menggunakan koordinat geografis Anda (lintang dan bujur) untuk menghitung sudut geometris terpendek menuju Kakbah di Mekkah. Saat halaman dibuka, kami meminta izin lokasi atau membiarkan Anda memilih kota dari daftar, lalu kami mengubah koordinat menjadi sudut menggunakan rumus astronomi Great-Circle. Sudut ditampilkan dalam derajat searah jarum jam dari utara geografis, dan panah pada halaman menunjuk ke kiblat. Semakin akurat lokasi Anda, semakin tepat sudutnya \\u2014 GPS pada ponsel memberi hasil terbaik.' },
                    { h3: 'Mencari kiblat dari lokasi saya', body: 'Saat Anda menekan \\u201CCari kiblat dari lokasi saya\\u201D, peramban meminta izin membaca posisi saat ini. Setelah Anda menerima, koordinat segera diteruskan ke halaman, sudut kiblat dihitung, dan jarak ke Mekkah ditampilkan. Untuk akurasi terbaik dengan kompas ponsel asli, jauhkan perangkat dari benda logam besar dan pintu besi karena memengaruhi sensor magnet. Berdiri di tempat terbuka atau dekat jendela meningkatkan GPS, dan jika Anda tidak ingin membagikan lokasi, Anda selalu dapat memilih kota secara manual.' },
                    { h3: 'Memilih kota secara manual', body: 'Jika peramban menolak izin lokasi, tidak mendukung geolokasi, atau Anda lebih suka tidak berbagi posisi, Anda dapat memilih kota dari daftar kota populer atau mengetik namanya di kolom pencarian di atas. Pencarian mencakup ribuan kota di seluruh dunia dengan nama Indonesia, Inggris, dan Arab. Setelah memilih kota, kami membuka halaman khusus yang menunjukkan arah kiblat dari kota tersebut berdasarkan koordinat resminya. Berguna saat mengunjungi kota baru atau merencanakan perjalanan.' },
                    { h3: 'Mengapa sudut kiblat berbeda?', body: 'Sudut kiblat berbeda di setiap tempat karena Bumi bulat, dan jalur geometris terpendek antara dua titik permukaan bergantung pada koordinatnya. Contohnya, kiblat dari Riyadh sekitar barat daya, dari Istanbul tenggara, dari Kairo timur, dari Casablanca timur laut, dan dari Jakarta barat. Tidak ada satu arah kiblat global; setiap lokasi memiliki sudut khusus. Sudut diukur dalam derajat searah jarum jam dari utara geografis: 0° utara, 90° timur, 180° selatan, 270° barat.' },
                ],
            },
            es: {
                h2: 'Guía para usar la brújula de la Qibla',
                lead: 'Esta guía explica cómo usar la brújula de la Qibla en esta página para encontrar la dirección hacia la Kaaba con precisión, ya sea desde su ubicación o desde una ciudad que elija manualmente, y por qué el ángulo de la Qibla varía entre lugares.',
                cards: [
                    { h3: '¿Cómo funciona la brújula de la Qibla?', body: 'La brújula de la Qibla usa sus coordenadas geográficas (latitud y longitud) para calcular el rumbo geométrico más corto hacia la Kaaba en La Meca. Al abrir la página pedimos permiso de ubicación o permitimos elegir una ciudad de la lista, luego convertimos las coordenadas en un ángulo con la fórmula astronómica del círculo máximo. El ángulo se muestra en grados desde el norte geográfico en el sentido de las agujas del reloj, y la flecha apunta a la Qibla. Cuanto más precisa su ubicación, más fiel el ángulo \\u2014 activar GPS en el móvil da el mejor resultado.' },
                    { h3: 'Encontrar la Qibla desde mi ubicación', body: 'Cuando pulsa \\u201CEncuentre la Qibla desde mi ubicación\\u201D, el navegador solicita permiso para leer su posición actual. Al aceptar, las coordenadas pasan a la página, se calcula el ángulo y se muestra la distancia a La Meca. Para máxima precisión con la brújula del teléfono real, mantenga el dispositivo lejos de objetos metálicos grandes y puertas de hierro, que afectan el sensor magnético. Estar en zona abierta o cerca de una ventana mejora el GPS, y si prefiere no compartir la ubicación siempre puede elegir una ciudad manualmente.' },
                    { h3: 'Elegir una ciudad manualmente', body: 'Si el navegador rechaza el permiso, no admite geolocalización, o prefiere no compartirla, puede elegir una ciudad de la lista de ciudades populares o escribir su nombre en el buscador en la parte superior. La búsqueda incluye miles de ciudades en todo el mundo con nombres en español, inglés y árabe. Al seleccionar una ciudad, abrimos una página dedicada que muestra la dirección de la Qibla desde esa ciudad usando sus coordenadas oficiales. Útil al visitar una ciudad nueva o planificar un viaje.' },
                    { h3: '¿Por qué varía el ángulo de la Qibla?', body: 'El ángulo de la Qibla varía entre lugares porque la Tierra es esférica, y el camino geométrico más corto entre dos puntos depende de sus coordenadas. Por ejemplo, la Qibla desde Riad es aproximadamente suroeste, desde Estambul sureste, desde El Cairo este, desde Casablanca noreste, y desde Yakarta oeste. No hay una sola dirección global de Qibla; se calcula un ángulo propio para cada lugar. Se mide en grados desde el norte geográfico en sentido horario: 0° norte, 90° este, 180° sur, 270° oeste.' },
                ],
            },
            bn: {
                h2: 'কিবলা কম্পাস ব্যবহারের নির্দেশিকা',
                lead: 'এই নির্দেশিকা ব্যাখ্যা করে কীভাবে এই পৃষ্ঠার কিবলা কম্পাস ব্যবহার করে কাবার দিক সঠিকভাবে নির্ণয় করবেন \\u2014 আপনার অবস্থান থেকে অথবা ম্যানুয়ালি বেছে নেওয়া শহর থেকে \\u2014 এবং কিবলার কোণ স্থানভেদে কেন আলাদা হয়।',
                cards: [
                    { h3: 'কিবলা কম্পাস কীভাবে কাজ করে?', body: 'কিবলা কম্পাস আপনার ভৌগোলিক স্থানাঙ্ক (অক্ষাংশ ও দ্রাঘিমাংশ) ব্যবহার করে মক্কার কাবার দিকে সংক্ষিপ্ততম জ্যামিতিক দিকনির্ণয় করে। পৃষ্ঠা খোলার সময় আমরা অবস্থানের অনুমতি চাই বা তালিকা থেকে শহর বেছে নিতে দিই, তারপর Great-Circle জ্যোতির্বৈজ্ঞানিক সূত্র ব্যবহার করে স্থানাঙ্ককে কোণে রূপান্তর করি। কোণটি ভৌগোলিক উত্তর থেকে ঘড়ির কাঁটার দিকে ডিগ্রিতে দেখানো হয়, এবং তীর কিবলার দিকে নির্দেশ করে। আপনার অবস্থান যত নির্ভুল, কোণ তত সঠিক \\u2014 ফোনে GPS চালু রাখলে সেরা ফল পাওয়া যায়।' },
                    { h3: 'আমার অবস্থান থেকে কিবলা', body: '\\u201Cআমার অবস্থান থেকে কিবলা\\u201D চাপলে ব্রাউজার আপনার বর্তমান অবস্থান পড়ার অনুমতি চায়। অনুমতি দিলে স্থানাঙ্ক সঙ্গে সঙ্গে পৃষ্ঠায় চলে যায়, কিবলার কোণ গণনা হয়, এবং মক্কার দূরত্ব দেখানো হয়। ফোনের প্রকৃত কম্পাসের সাথে সর্বোচ্চ নির্ভুলতার জন্য বড় ধাতব বস্তু ও লোহার দরজা থেকে দূরে থাকুন কারণ এগুলো চৌম্বক সেন্সরে প্রভাব ফেলে। খোলা জায়গায় বা জানালার কাছে থাকলে GPS উন্নত হয়, এবং আপনি যদি অবস্থান শেয়ার করতে না চান তবে ম্যানুয়ালি শহর বেছে নিতে পারেন।' },
                    { h3: 'ম্যানুয়ালি শহর বেছে নেওয়া', body: 'যদি ব্রাউজার অবস্থান অনুমতি প্রত্যাখ্যান করে, জিওলোকেশন সমর্থন না করে, বা আপনি অবস্থান শেয়ার করতে না চান, তাহলে জনপ্রিয় শহরের তালিকা থেকে শহর বেছে নিতে পারেন বা পৃষ্ঠার শীর্ষে অনুসন্ধান বাক্সে নাম লিখতে পারেন। অনুসন্ধানে বিশ্বজুড়ে হাজার হাজার শহর বাংলা, ইংরেজি এবং আরবি নামে রয়েছে। শহর নির্বাচন করলে আমরা সেই শহরের সরকারি স্থানাঙ্কের ভিত্তিতে কিবলার দিক দেখানো একটি বিশেষ পৃষ্ঠায় যাই। নতুন শহরে যাওয়ার সময় বা ভ্রমণের পরিকল্পনা করার সময় উপযোগী।' },
                    { h3: 'কিবলার কোণ কেন আলাদা?', body: 'কিবলার কোণ স্থানভেদে আলাদা কারণ পৃথিবী গোলাকার, এবং দুই পৃষ্ঠ-বিন্দুর মধ্যে সংক্ষিপ্ততম জ্যামিতিক পথ তাদের স্থানাঙ্কের ওপর নির্ভর করে। যেমন রিয়াদ থেকে কিবলা প্রায় দক্ষিণ-পশ্চিম, ইস্তাম্বুল থেকে দক্ষিণ-পূর্ব, কায়রো থেকে পূর্ব, কাসাব্লাঙ্কা থেকে উত্তর-পূর্ব, জাকার্তা থেকে পশ্চিম। সারা পৃথিবীর জন্য একটিই কিবলার দিক নেই; প্রতিটি অবস্থানের জন্য আলাদা কোণ গণনা করা হয়। কোণ ভৌগোলিক উত্তর থেকে ঘড়ির কাঁটার দিকে ডিগ্রিতে মাপা হয়: 0° উত্তর, 90° পূর্ব, 180° দক্ষিণ, 270° পশ্চিম।' },
                ],
            },
            ms: {
                h2: 'Panduan Menggunakan Kompas Kiblat',
                lead: 'Panduan ini menerangkan cara menggunakan kompas kiblat di halaman ini untuk mencari arah Kaabah dengan tepat, sama ada dari lokasi anda atau dari bandar yang anda pilih secara manual, serta sebab sudut kiblat berbeza antara tempat.',
                cards: [
                    { h3: 'Bagaimana kompas kiblat berfungsi?', body: 'Kompas kiblat menggunakan koordinat geografi anda (latitud dan longitud) untuk mengira sudut geometri terpendek ke arah Kaabah di Makkah. Apabila halaman dibuka, kami meminta keizinan lokasi atau membenarkan anda memilih bandar daripada senarai, kemudian kami menukar koordinat kepada sudut menggunakan formula astronomi Great-Circle. Sudut dipaparkan dalam darjah ikut arah jam dari utara geografi, dan anak panah pada halaman menghala ke kiblat. Lebih tepat lokasi anda, lebih betul sudutnya \\u2014 GPS pada telefon memberi hasil terbaik.' },
                    { h3: 'Mencari kiblat dari lokasi saya', body: 'Apabila anda menekan \\u201CCari kiblat dari lokasi saya\\u201D, pelayar meminta keizinan membaca kedudukan semasa anda. Apabila anda terima, koordinat segera dihantar ke halaman, sudut kiblat dikira, dan jarak ke Makkah dipaparkan. Untuk ketepatan tertinggi dengan kompas telefon sebenar, jauhkan peranti daripada objek logam besar dan pintu besi kerana ia mempengaruhi sensor magnet. Berdiri di kawasan terbuka atau dekat tingkap meningkatkan GPS, dan jika anda lebih suka tidak berkongsi lokasi, anda boleh memilih bandar secara manual.' },
                    { h3: 'Memilih bandar secara manual', body: 'Jika pelayar menolak keizinan lokasi, tidak menyokong geolokasi, atau anda lebih suka tidak berkongsi kedudukan, anda boleh memilih bandar dari senarai bandar popular atau menaip namanya di medan carian di bahagian atas halaman. Carian meliputi ribuan bandar di seluruh dunia dengan nama Melayu, Inggeris dan Arab. Setelah memilih bandar, kami membuka halaman khusus yang menunjukkan arah kiblat dari bandar tersebut berdasarkan koordinat rasminya. Berguna semasa melawat bandar baharu atau merancang perjalanan.' },
                    { h3: 'Mengapa sudut kiblat berbeza?', body: 'Sudut kiblat berbeza antara tempat kerana Bumi berbentuk sfera, dan laluan geometri terpendek antara dua titik permukaan bergantung pada koordinatnya. Contohnya, kiblat dari Riyadh kira-kira barat daya, dari Istanbul tenggara, dari Kaherah timur, dari Casablanca timur laut, dari Jakarta barat. Tiada satu arah kiblat global; satu sudut khusus dikira untuk setiap lokasi. Ia diukur dalam darjah ikut arah jam dari utara geografi: 0° utara, 90° timur, 180° selatan, 270° barat.' },
                ],
            },
        };
        try {
            const _g = _qHubGuide[seo.lang] || _qHubGuide.en;
            const _cardsHtml = _g.cards.map(c =>
                \`<div class="qibla-hub-guide-card"><h3 class="qibla-hub-guide-h3">\${_escHtml(c.h3)}</h3><p class="qibla-hub-guide-body">\${_escHtml(c.body)}</p></div>\`
            ).join('');
            const _sectionHtml = \`<div class="section-card qibla-hub-only qibla-hub-guide-card-wrap"><h2 class="qibla-hub-guide-h2">\${_escHtml(_g.h2)}</h2><p class="qibla-hub-guide-lead">\${_escHtml(_g.lead)}</p><div class="qibla-hub-guide-grid">\${_cardsHtml}</div></div>\`;
            // Anchor: insert just BEFORE the FAQ section card. Use the unique
            // <h2 id="qibla-faq-title"> as the anchor.
            html = html.replace(
                /(<!-- Section 8: FAQ \\(both modes, different content\\) -->\\s*<div class="section-card">\\s*<h2 id="qibla-faq-title")/,
                _sectionHtml + '$1'
            );
        } catch (_e) { /* silent — Q-Hub-A guide section optional */ }
    }
    // 1f) UAT-Moon-Home: /moon-today → Moon Gateway. Strip heavy moon sections
    //     + entire #page-prayer-times shell. Inject html.moon-today-hub-page so
    //     CSS reveals the new #moon-hub-hero / #moon-hub-faq immediately.
    if (_isMoonTodayHub) {`;

srv = replaceOnce(srv, SRV_OLD_BEFOREQIBLAINJ, SRV_NEW_BEFOREQIBLAINJ, 'qibla hub injection block');

// ───────────────────────────────────────────────────────────────────────
// 5) Update _QIBLA_HUB_UI[*].title (10 langs) so JS sets same H1 text
//     as SSR (Q-A2 invariant — keep DOM Title in sync with SSR Title).
// ───────────────────────────────────────────────────────────────────────

const APP_TITLE_REPLACEMENTS = [
    [`        title: '🧭 اعرف اتجاه القبلة بدقّة من أيّ مكان في العالم',`,
     `        title: 'اعرف اتجاه القبلة بدقة من أي مكان في العالم',`],
    [`        title: '🧭 Find the exact Qibla direction from anywhere in the world',`,
     `        title: 'Find the Qibla Direction Accurately from Anywhere in the World',`],
];

for (const [oldT, newT] of APP_TITLE_REPLACEMENTS) {
    if (app.indexOf(oldT) < 0) {
        console.warn('[app.js] WARN — title anchor not found, skipping:', oldT.substring(0, 60));
        continue;
    }
    app = app.replace(oldT, newT);
}

// ───────────────────────────────────────────────────────────────────────
// 6) Add CSS for qibla-hub-guide-* (light + dark, mobile + desktop).
//     Append to css/style.css (no other modifications).
// ───────────────────────────────────────────────────────────────────────

const CSS_PATH = path.join(ROOT, 'css', 'style.css');
let cssRaw = readFileSync(CSS_PATH, 'utf8');
const isCRLFcss = /\r\n/.test(cssRaw);
let css = cssRaw.replace(/\r\n/g, '\n');

const QHUBA_CSS = `
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
`;

if (!/Phase Q-Hub-A \(2026-05-04\)/.test(css)) {
    css = css + '\n' + QHUBA_CSS;
}

// ───────────────────────────────────────────────────────────────────────
// Write back all files (preserving original line endings).
// ───────────────────────────────────────────────────────────────────────

writeFileSync(SRV_PATH, toEol(srv, isCRLFsrv), 'utf8');
writeFileSync(APP_PATH, toEol(app, isCRLFapp), 'utf8');
writeFileSync(CSS_PATH, toEol(css, isCRLFcss), 'utf8');
// index.html unchanged for Q-Hub-A — all changes live in server.js (SSR injection)

console.log('\n✅ Phase Q-Hub-A — Qibla Hub SEO Cleanup applied.');
console.log('  • Title (10 langs) → 50-60 sweet spot');
console.log('  • Meta  (10 langs) → 130-160 sweet spot');
console.log('  • H1    → /qibla added to _getActiveH1Marker (Phase I dedup)');
console.log('  • Strip → #page-prayer-times + #sticky-next-bar on /qibla SSR');
console.log('  • Class → html.qibla-hub-page (parallel to .moon-today-hub-page)');
console.log('  • SSR H1 text → "اعرف اتجاه القبلة بدقة من أي مكان في العالم" (per-lang)');
console.log('  • Section → "دليل استخدام بوصلة القبلة" + 4 H3 cards (per-lang)');
console.log('  • Word count target → 750-850 (was 244)');
