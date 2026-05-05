// Phase Q-Hub-E2 — fix Q-Hub-E placement + upgrade countdown group visuals.
//
// (1) Q-Hub-E injection regex placed the new section INSIDE the FAQ
//     section-card (before its closing </div>) due to greedy match.
//     Fix: place AFTER FAQ's </div> and BEFORE the Section 9 comment.
// (2) The "العد التنازلي" group (4 plain link cards) now mirrors the
//     existing #moon-events-section visual: icon + label + days + date,
//     using the same .moon-event-card / .moon-event-{id}-card / -days /
//     -date class set so app.js JS hooks update it the same way for
//     "closest first" sort + "soon" pulse.
//
// Days + dates are computed SSR-side using _hijriNow + _hijriToGregorian.
// SCOPE: /qibla ONLY.

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

if (/Phase Q-Hub-E2 \(2026-05-05\)/.test(srv)) {
    throw new Error('[server.js] Q-Hub-E2 already applied');
}

function toEol(s, useCRLF) { return useCRLF ? s.replace(/\n/g, '\r\n') : s; }

// ───────────────────────────────────────────────────────────────────────
// Replace the entire Q-Hub-E injection block with Q-Hub-E2 (fixed anchor +
// countdown group rewritten using moon-event-card structure).
// ───────────────────────────────────────────────────────────────────────

const SRV_START = '        // Phase Q-Hub-E (2026-05-05): "روابط إسلامية ذات صلة" section.';
const SRV_END   = '        } catch (_e) { /* silent — Q-Hub-E related tools section optional */ }';

const startIdx = srv.indexOf(SRV_START);
if (startIdx < 0) throw new Error('[server.js] Q-Hub-E start marker not found');
const endIdx = srv.indexOf(SRV_END, startIdx);
if (endIdx < 0) throw new Error('[server.js] Q-Hub-E end marker not found');
const blockEnd = endIdx + SRV_END.length;

const NEW_BLOCK = `        // Phase Q-Hub-E2 (2026-05-05): "روابط إسلامية ذات صلة" section, with
        // the countdown group rendered using the same moon-event-card visual
        // as #moon-events-section (icon + label + days + date). Anchor fixed
        // so the section is a SIBLING of FAQ (after its closing </div>),
        // not a child. Days + dates computed SSR-side.
        const _qHubRelated = {
            ar: {
                title: 'روابط إسلامية ذات صلة',
                lead: 'خدمات إسلامية مساعدة تكمّل تجربتك في معرفة اتجاه القبلة.',
                groupTools: 'أدوات أساسية',
                groupCountdown: 'العد التنازلي للمناسبات',
                groupHelpers: 'صفحات مساعدة',
                tools: [
                    { icon: '🕌', label: 'مواقيت الصلاة', desc: 'مواقيت اليوم لأي مدينة', href: '/' },
                    { icon: '🗓️', label: 'التاريخ الهجري اليوم', desc: 'التاريخ الهجري الحالي بدقة', href: '/today-hijri-date' },
                    { icon: '🌙', label: 'حالة القمر اليوم', desc: 'الطور والإضاءة وعمر القمر', href: '/moon-today' },
                    { icon: '📅', label: 'التقويم الهجري', desc: 'تقويم سنة 1447 هجرية كاملاً', href: '/hijri-calendar/1447' },
                ],
                countdownLabels: { ramadan: 'رمضان القادم', fitr: 'عيد الفطر', adha: 'عيد الأضحى', newyear: 'رأس السنة الهجرية' },
                helpers: [
                    { icon: '📿', label: 'الأذكار', desc: 'أذكار الصباح والمساء وبعد الصلاة', href: '/azkar' },
                    { icon: '💰', label: 'حاسبة الزكاة', desc: 'احسب زكاة المال والذهب', href: '/zakat-calculator' },
                    { icon: '📿', label: 'المسبحة الإلكترونية', desc: 'سبحة رقمية للتسبيح والذكر', href: '/msbaha' },
                    { icon: '🔄', label: 'محوّل التاريخ', desc: 'تحويل بين الميلادي والهجري', href: '/dateconverter' },
                ],
            },
            en: {
                title: 'Related Islamic Tools',
                lead: 'Helpful Islamic services that complement your Qibla experience.',
                groupTools: 'Essential Tools',
                groupCountdown: 'Event Countdowns',
                groupHelpers: 'Helper Pages',
                tools: [
                    { icon: '🕌', label: 'Prayer Times', desc: "Today's times for any city", href: '/en/' },
                    { icon: '🗓️', label: 'Hijri Date Today', desc: 'Current Islamic date with precision', href: '/en/today-hijri-date' },
                    { icon: '🌙', label: 'Moon Today', desc: 'Phase, illumination and lunar age', href: '/en/moon-today' },
                    { icon: '📅', label: 'Hijri Calendar', desc: 'Full Islamic calendar 1447 AH', href: '/en/hijri-calendar/1447' },
                ],
                countdownLabels: { ramadan: 'Next Ramadan', fitr: 'Eid al-Fitr', adha: 'Eid al-Adha', newyear: 'Hijri New Year' },
                helpers: [
                    { icon: '📿', label: 'Azkar', desc: 'Morning, evening and post-prayer azkar', href: '/en/azkar' },
                    { icon: '💰', label: 'Zakat Calculator', desc: 'Calculate zakat on money and gold', href: '/en/zakat-calculator' },
                    { icon: '📿', label: 'Tasbih (Msbaha)', desc: 'Digital tasbih for dhikr', href: '/en/msbaha' },
                    { icon: '🔄', label: 'Date Converter', desc: 'Gregorian ↔ Hijri conversion', href: '/en/dateconverter' },
                ],
            },
            fr: {
                title: 'Outils islamiques connexes',
                lead: 'Services islamiques qui complètent votre expérience de la Qibla.',
                groupTools: 'Outils essentiels',
                groupCountdown: 'Comptes à rebours',
                groupHelpers: 'Pages utiles',
                tools: [
                    { icon: '🕌', label: 'Heures de prière', desc: 'Heures du jour pour toute ville', href: '/fr/' },
                    { icon: '🗓️', label: 'Date hégirienne', desc: 'Date islamique actuelle précise', href: '/fr/today-hijri-date' },
                    { icon: '🌙', label: 'Lune aujourd\\u2019hui', desc: 'Phase, illumination et âge lunaire', href: '/fr/moon-today' },
                    { icon: '📅', label: 'Calendrier hégirien', desc: 'Calendrier islamique complet 1447 H', href: '/fr/hijri-calendar/1447' },
                ],
                countdownLabels: { ramadan: 'Prochain Ramadan', fitr: 'Aïd al-Fitr', adha: 'Aïd al-Adha', newyear: 'Nouvel an hégirien' },
                helpers: [
                    { icon: '📿', label: 'Azkar', desc: 'Azkar du matin, du soir et après prière', href: '/fr/azkar' },
                    { icon: '💰', label: 'Calculatrice zakat', desc: 'Calcul de la zakat sur l\\u2019argent', href: '/fr/zakat-calculator' },
                    { icon: '📿', label: 'Tasbih (Msbaha)', desc: 'Compteur numérique pour le dhikr', href: '/fr/msbaha' },
                    { icon: '🔄', label: 'Convertisseur de date', desc: 'Conversion grégorien ↔ hégirien', href: '/fr/dateconverter' },
                ],
            },
            tr: {
                title: 'İlgili İslami Araçlar',
                lead: 'Kıble deneyiminizi tamamlayan yardımcı İslami hizmetler.',
                groupTools: 'Temel Araçlar',
                groupCountdown: 'Geri Sayımlar',
                groupHelpers: 'Yardımcı Sayfalar',
                tools: [
                    { icon: '🕌', label: 'Namaz Vakitleri', desc: 'Bugünün vakitleri her şehir için', href: '/tr/' },
                    { icon: '🗓️', label: 'Hicri Tarih', desc: 'Bugünkü Hicri tarihi hassas olarak', href: '/tr/today-hijri-date' },
                    { icon: '🌙', label: 'Bugün Ay', desc: 'Evre, aydınlanma ve ay yaşı', href: '/tr/moon-today' },
                    { icon: '📅', label: 'Hicri Takvim', desc: 'Tam Hicri 1447 takvimi', href: '/tr/hijri-calendar/1447' },
                ],
                countdownLabels: { ramadan: 'Ramazan', fitr: 'Ramazan Bayramı', adha: 'Kurban Bayramı', newyear: 'Hicri Yılbaşı' },
                helpers: [
                    { icon: '📿', label: 'Zikirler', desc: 'Sabah, akşam ve namaz sonrası zikirler', href: '/tr/azkar' },
                    { icon: '💰', label: 'Zekat Hesaplayıcı', desc: 'Mal ve altın zekatı hesaplama', href: '/tr/zakat-calculator' },
                    { icon: '📿', label: 'Tesbih (Msbaha)', desc: 'Zikir için dijital tesbih', href: '/tr/msbaha' },
                    { icon: '🔄', label: 'Tarih Dönüştürücü', desc: 'Miladi ↔ Hicri dönüşüm', href: '/tr/dateconverter' },
                ],
            },
            ur: {
                title: 'متعلقہ اسلامی ٹولز',
                lead: 'قبلہ کے تجربے میں آپ کی مدد کرنے والی اسلامی خدمات۔',
                groupTools: 'بنیادی ٹولز',
                groupCountdown: 'الٹی گنتی',
                groupHelpers: 'مددگار صفحات',
                tools: [
                    { icon: '🕌', label: 'نماز کے اوقات', desc: 'کسی بھی شہر کے آج کے اوقات', href: '/ur/' },
                    { icon: '🗓️', label: 'آج کی ہجری تاریخ', desc: 'موجودہ ہجری تاریخ درست', href: '/ur/today-hijri-date' },
                    { icon: '🌙', label: 'آج چاند', desc: 'مرحلہ، روشنی اور چاند کی عمر', href: '/ur/moon-today' },
                    { icon: '📅', label: 'ہجری کیلنڈر', desc: 'مکمل 1447 ہجری کیلنڈر', href: '/ur/hijri-calendar/1447' },
                ],
                countdownLabels: { ramadan: 'رمضان', fitr: 'عید الفطر', adha: 'عید الاضحیٰ', newyear: 'نیا ہجری سال' },
                helpers: [
                    { icon: '📿', label: 'اذکار', desc: 'صبح، شام اور بعد از نماز اذکار', href: '/ur/azkar' },
                    { icon: '💰', label: 'زکوٰۃ کیلکولیٹر', desc: 'مال اور سونے کی زکوٰۃ', href: '/ur/zakat-calculator' },
                    { icon: '📿', label: 'ڈیجیٹل تسبیح', desc: 'ذکر کے لیے ڈیجیٹل تسبیح', href: '/ur/msbaha' },
                    { icon: '🔄', label: 'تاریخ کنورٹر', desc: 'گریگوری اور ہجری کے درمیان', href: '/ur/dateconverter' },
                ],
            },
            de: {
                title: 'Verwandte islamische Werkzeuge',
                lead: 'Hilfreiche islamische Dienste, die Ihre Qibla-Erfahrung ergänzen.',
                groupTools: 'Grundlegende Werkzeuge',
                groupCountdown: 'Countdowns',
                groupHelpers: 'Hilfsseiten',
                tools: [
                    { icon: '🕌', label: 'Gebetszeiten', desc: 'Heutige Zeiten für jede Stadt', href: '/de/' },
                    { icon: '🗓️', label: 'Hidschri-Datum heute', desc: 'Aktuelles islamisches Datum präzise', href: '/de/today-hijri-date' },
                    { icon: '🌙', label: 'Mond heute', desc: 'Phase, Beleuchtung und Mondalter', href: '/de/moon-today' },
                    { icon: '📅', label: 'Hidschri-Kalender', desc: 'Vollständiger Kalender 1447 AH', href: '/de/hijri-calendar/1447' },
                ],
                countdownLabels: { ramadan: 'Ramadan', fitr: 'Eid al-Fitr', adha: 'Eid al-Adha', newyear: 'Islamisches Neujahr' },
                helpers: [
                    { icon: '📿', label: 'Adhkar', desc: 'Morgen-, Abend- und Nach-Gebet-Adhkar', href: '/de/azkar' },
                    { icon: '💰', label: 'Zakat-Rechner', desc: 'Zakat auf Geld und Gold berechnen', href: '/de/zakat-calculator' },
                    { icon: '📿', label: 'Digitale Tasbih', desc: 'Digitale Tasbih für Dhikr', href: '/de/msbaha' },
                    { icon: '🔄', label: 'Datums-Konverter', desc: 'Gregorianisch ↔ Hidschri', href: '/de/dateconverter' },
                ],
            },
            id: {
                title: 'Alat Islami Terkait',
                lead: 'Layanan Islami yang melengkapi pengalaman kiblat Anda.',
                groupTools: 'Alat Utama',
                groupCountdown: 'Hitung Mundur',
                groupHelpers: 'Halaman Bantuan',
                tools: [
                    { icon: '🕌', label: 'Jadwal Salat', desc: 'Waktu hari ini untuk setiap kota', href: '/id/' },
                    { icon: '🗓️', label: 'Tanggal Hijriah', desc: 'Tanggal Islam saat ini akurat', href: '/id/today-hijri-date' },
                    { icon: '🌙', label: 'Bulan Hari Ini', desc: 'Fase, pencahayaan dan usia bulan', href: '/id/moon-today' },
                    { icon: '📅', label: 'Kalender Hijriah', desc: 'Kalender lengkap 1447 H', href: '/id/hijri-calendar/1447' },
                ],
                countdownLabels: { ramadan: 'Ramadan', fitr: 'Idul Fitri', adha: 'Idul Adha', newyear: 'Tahun Baru Hijriah' },
                helpers: [
                    { icon: '📿', label: 'Azkar', desc: 'Azkar pagi, sore dan setelah salat', href: '/id/azkar' },
                    { icon: '💰', label: 'Kalkulator Zakat', desc: 'Hitung zakat uang dan emas', href: '/id/zakat-calculator' },
                    { icon: '📿', label: 'Tasbih Digital', desc: 'Tasbih digital untuk zikir', href: '/id/msbaha' },
                    { icon: '🔄', label: 'Konverter Tanggal', desc: 'Masehi ↔ Hijriah', href: '/id/dateconverter' },
                ],
            },
            es: {
                title: 'Herramientas islámicas relacionadas',
                lead: 'Servicios islámicos útiles que complementan su experiencia de Qibla.',
                groupTools: 'Herramientas esenciales',
                groupCountdown: 'Cuentas regresivas',
                groupHelpers: 'Páginas auxiliares',
                tools: [
                    { icon: '🕌', label: 'Horarios de oración', desc: 'Horarios de hoy para cualquier ciudad', href: '/es/' },
                    { icon: '🗓️', label: 'Fecha hégira de hoy', desc: 'Fecha islámica actual precisa', href: '/es/today-hijri-date' },
                    { icon: '🌙', label: 'Luna hoy', desc: 'Fase, iluminación y edad lunar', href: '/es/moon-today' },
                    { icon: '📅', label: 'Calendario hégira', desc: 'Calendario islámico completo 1447 H', href: '/es/hijri-calendar/1447' },
                ],
                countdownLabels: { ramadan: 'Ramadán', fitr: 'Eid al-Fitr', adha: 'Eid al-Adha', newyear: 'Año Nuevo Hégira' },
                helpers: [
                    { icon: '📿', label: 'Azkar', desc: 'Azkar de mañana, noche y después de la oración', href: '/es/azkar' },
                    { icon: '💰', label: 'Calculadora de zakat', desc: 'Calcule el zakat de dinero y oro', href: '/es/zakat-calculator' },
                    { icon: '📿', label: 'Tasbih digital', desc: 'Tasbih digital para el dhikr', href: '/es/msbaha' },
                    { icon: '🔄', label: 'Conversor de fechas', desc: 'Gregoriano ↔ Hégira', href: '/es/dateconverter' },
                ],
            },
            bn: {
                title: 'সম্পর্কিত ইসলামিক টুল',
                lead: 'কিবলা অভিজ্ঞতা পরিপূর্ণ করতে সহায়ক ইসলামিক সেবা।',
                groupTools: 'প্রয়োজনীয় টুল',
                groupCountdown: 'কাউন্টডাউন',
                groupHelpers: 'সহায়ক পৃষ্ঠা',
                tools: [
                    { icon: '🕌', label: 'নামাজের সময়', desc: 'যে কোন শহরের আজকের সময়', href: '/bn/' },
                    { icon: '🗓️', label: 'আজকের হিজরি তারিখ', desc: 'বর্তমান ইসলামিক তারিখ সঠিকভাবে', href: '/bn/today-hijri-date' },
                    { icon: '🌙', label: 'আজ চাঁদ', desc: 'দশা, আলোকসজ্জা ও চাঁদের বয়স', href: '/bn/moon-today' },
                    { icon: '📅', label: 'হিজরি ক্যালেন্ডার', desc: 'সম্পূর্ণ হিজরি 1447 ক্যালেন্ডার', href: '/bn/hijri-calendar/1447' },
                ],
                countdownLabels: { ramadan: 'রমজান', fitr: 'ঈদুল ফিতর', adha: 'ঈদুল আযহা', newyear: 'হিজরি নববর্ষ' },
                helpers: [
                    { icon: '📿', label: 'আযকার', desc: 'সকাল, সন্ধ্যা ও নামাজ পরবর্তী আযকার', href: '/bn/azkar' },
                    { icon: '💰', label: 'যাকাত ক্যালকুলেটর', desc: 'টাকা ও সোনার যাকাত হিসাব', href: '/bn/zakat-calculator' },
                    { icon: '📿', label: 'ডিজিটাল তসবিহ', desc: 'যিকরের জন্য ডিজিটাল তসবিহ', href: '/bn/msbaha' },
                    { icon: '🔄', label: 'তারিখ কনভার্টার', desc: 'গ্রেগরিয়ান ↔ হিজরি', href: '/bn/dateconverter' },
                ],
            },
            ms: {
                title: 'Alat Islam Berkaitan',
                lead: 'Perkhidmatan Islam yang melengkapi pengalaman kiblat anda.',
                groupTools: 'Alat Utama',
                groupCountdown: 'Detik Akhir',
                groupHelpers: 'Halaman Bantuan',
                tools: [
                    { icon: '🕌', label: 'Waktu Solat', desc: 'Waktu hari ini untuk mana-mana bandar', href: '/ms/' },
                    { icon: '🗓️', label: 'Tarikh Hijrah', desc: 'Tarikh Islam semasa dengan tepat', href: '/ms/today-hijri-date' },
                    { icon: '🌙', label: 'Bulan Hari Ini', desc: 'Fasa, pencahayaan dan usia bulan', href: '/ms/moon-today' },
                    { icon: '📅', label: 'Kalendar Hijrah', desc: 'Kalendar lengkap 1447 H', href: '/ms/hijri-calendar/1447' },
                ],
                countdownLabels: { ramadan: 'Ramadan', fitr: 'Aidilfitri', adha: 'Aidiladha', newyear: 'Tahun Baharu Hijrah' },
                helpers: [
                    { icon: '📿', label: 'Azkar', desc: 'Azkar pagi, petang dan selepas solat', href: '/ms/azkar' },
                    { icon: '💰', label: 'Kalkulator Zakat', desc: 'Kira zakat wang dan emas', href: '/ms/zakat-calculator' },
                    { icon: '📿', label: 'Tasbih Digital', desc: 'Tasbih digital untuk zikir', href: '/ms/msbaha' },
                    { icon: '🔄', label: 'Penukar Tarikh', desc: 'Masehi ↔ Hijrah', href: '/ms/dateconverter' },
                ],
            },
        };
        // SSR-side compute next event date + days remaining for each Islamic
        // event. Mirrors the JS logic in app.js (#moon-events-section fill).
        const _qhe2_events = [
            { id: 'ramadan', icon: '🕋', hm: 9,  hd: 1,  hrefAr: '/ramadan-countdown' },
            { id: 'fitr',    icon: '🌙', hm: 10, hd: 1,  hrefAr: '/eid-al-fitr-countdown' },
            { id: 'adha',    icon: '🐑', hm: 12, hd: 10, hrefAr: '/eid-al-adha-countdown' },
            { id: 'newyear', icon: '🎊', hm: 1,  hd: 1,  hrefAr: '/hijri-new-year-countdown' },
        ];
        const _qhe2_hToday = _hijriNow();
        const _qhe2_nowMecca = _nowMeccaDate();
        const _qhe2_nowMs = _qhe2_nowMecca.getTime();
        const _qhe2_daysBetween = (futureDate) => {
            const ms = futureDate.getTime() - _qhe2_nowMs;
            return Math.ceil(ms / (24 * 3600 * 1000));
        };
        const _qhe2_nextEventDate = (hm, hd) => {
            let targetYear = _qhe2_hToday.year;
            let cand = _hijriToGregorian(targetYear, hm, hd);
            const candDate = new Date(Date.UTC(cand.year, cand.month - 1, cand.day));
            if (candDate.getTime() < _qhe2_nowMs) {
                targetYear++;
                cand = _hijriToGregorian(targetYear, hm, hd);
                return new Date(Date.UTC(cand.year, cand.month - 1, cand.day));
            }
            return candDate;
        };
        const _qhe2_monthNames = {
            ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
            en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            fr: ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'],
            tr: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
            ur: ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'],
            de: ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'],
            id: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],
            es: ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'],
            bn: ['জানু','ফেব','মার্চ','এপ্রি','মে','জুন','জুলা','আগ','সেপ্ট','অক্টো','নভে','ডিসে'],
            ms: ['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogo','Sep','Okt','Nov','Dis'],
        };
        const _qhe2_fmtDate = (d, lang) => {
            const months = _qhe2_monthNames[lang] || _qhe2_monthNames.en;
            return d.getUTCDate() + ' ' + months[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
        };
        const _qhe2_daysLabel = (n, lang) => {
            if (n <= 0) return (lang === 'ar') ? 'اليوم' : (lang === 'en' ? 'Today' : 'Today');
            if (n === 1) return (lang === 'ar') ? 'غدًا' : (lang === 'en' ? 'Tomorrow' : 'Tomorrow');
            if (lang === 'ar') {
                if (n === 2) return 'يومان';
                if (n >= 3 && n <= 10) return n + ' أيّام';
                return n + ' يومًا';
            }
            return n + ' ' + ((lang === 'fr') ? 'jours' : (lang === 'tr' ? 'gün' : (lang === 'ur' ? 'دن' : (lang === 'de' ? 'Tage' : (lang === 'id' ? 'hari' : (lang === 'es' ? 'días' : (lang === 'bn' ? 'দিন' : (lang === 'ms' ? 'hari' : 'days'))))))));
        };
        try {
            const _r = _qHubRelated[seo.lang] || _qHubRelated.en;
            // Compute events with days, sort closest-first
            const _eventsWithDays = _qhe2_events.map(ev => {
                const d = _qhe2_nextEventDate(ev.hm, ev.hd);
                const days = _qhe2_daysBetween(d);
                return { ...ev, date: d, days };
            }).sort((a, b) => a.days - b.days);
            const _hrefForLang = (id) => {
                const map = {
                    ramadan: '/ramadan-countdown',
                    fitr: '/eid-al-fitr-countdown',
                    adha: '/eid-al-adha-countdown',
                    newyear: '/hijri-new-year-countdown',
                };
                const prefix = (seo.lang === 'ar') ? '' : ('/' + seo.lang);
                return prefix + map[id];
            };
            const _countdownCardsHtml = _eventsWithDays.map((ev, idx) => {
                const _label = _r.countdownLabels[ev.id] || ev.id;
                const _days = _qhe2_daysLabel(ev.days, seo.lang);
                const _date = _qhe2_fmtDate(ev.date, seo.lang);
                const _soon = (ev.days >= 0 && ev.days <= 5) ? ' moon-event-soon' : '';
                return \`<a class="moon-event-card moon-event-\${ev.id} moon-event-\${ev.id}-card\${_soon}" href="\${_escHtml(_hrefForLang(ev.id))}" style="order: \${idx};"><span class="moon-event-icon" aria-hidden="true">\${ev.icon}</span><div class="moon-event-body"><div class="moon-event-label">\${_escHtml(_label)}</div><div class="moon-event-days moon-event-\${ev.id}-days">\${_escHtml(_days)}</div><div class="moon-event-date moon-event-\${ev.id}-date">\${_escHtml(_date)}</div></div></a>\`;
            }).join('');
            const _toolsHtml = _r.tools.map(l =>
                \`<a class="qhe-link" href="\${_escHtml(l.href)}"><span class="qhe-link-icon" aria-hidden="true">\${l.icon}</span><span class="qhe-link-text"><span class="qhe-link-label">\${_escHtml(l.label)}</span><span class="qhe-link-desc">\${_escHtml(l.desc)}</span></span></a>\`
            ).join('');
            const _helpersHtml = _r.helpers.map(l =>
                \`<a class="qhe-link" href="\${_escHtml(l.href)}"><span class="qhe-link-icon" aria-hidden="true">\${l.icon}</span><span class="qhe-link-text"><span class="qhe-link-label">\${_escHtml(l.label)}</span><span class="qhe-link-desc">\${_escHtml(l.desc)}</span></span></a>\`
            ).join('');
            const _relatedHtml =
                \`<div class="section-card qibla-hub-only qhe-section">\` +
                    \`<header class="qhe-header"><h2 class="qhe-h2">\${_escHtml(_r.title)}</h2><p class="qhe-lead">\${_escHtml(_r.lead)}</p></header>\` +
                    \`<div class="qhe-group"><h3 class="qhe-group-title">\${_escHtml(_r.groupTools)}</h3><div class="qhe-link-grid">\${_toolsHtml}</div></div>\` +
                    \`<div class="qhe-group qhe-group--countdown"><h3 class="qhe-group-title">\${_escHtml(_r.groupCountdown)}</h3><div class="moon-events-countdown qhe-countdown-grid">\${_countdownCardsHtml}</div></div>\` +
                    \`<div class="qhe-group"><h3 class="qhe-group-title">\${_escHtml(_r.groupHelpers)}</h3><div class="qhe-link-grid">\${_helpersHtml}</div></div>\` +
                \`</div>\`;
            // FIX: anchor must capture the FAQ's </div> + spacing so the new
            // section is inserted AFTER it (sibling of FAQ), not before its
            // closing tag (which would put it inside FAQ).
            html = html.replace(
                /(<\\/div>)(\\s*<!-- Section 9: Footer -->)/,
                '$1' + _relatedHtml + '$2'
            );
        } catch (_e) { /* silent — Q-Hub-E2 related tools section optional */ }`;

srv = srv.substring(0, startIdx) + NEW_BLOCK + srv.substring(blockEnd);

// ───────────────────────────────────────────────────────────────────────
// CSS — add styles specific to qhe-countdown-grid (4-col grid mirroring
// the moon-events-countdown layout). The .moon-event-card rules already
// exist in style.css, so we just need the grid and color tweak inside QHE.
// ───────────────────────────────────────────────────────────────────────

const QHE2_CSS = `
/* ── Phase Q-Hub-E2 (2026-05-05): countdown group inside qhe-section ── */
.qhe-group--countdown { margin-top: 18px; }
.qhe-countdown-grid {
    display: grid; gap: 10px; grid-template-columns: 1fr;
}
@media (min-width: 600px) { .qhe-countdown-grid { grid-template-columns: 1fr 1fr; gap: 12px; } }
@media (min-width: 980px) { .qhe-countdown-grid { grid-template-columns: repeat(4, 1fr); gap: 12px; } }
.qhe-countdown-grid .moon-event-card {
    margin: 0;
    /* Rely on existing .moon-event-card styles from earlier phases. */
}`;

if (!/Phase Q-Hub-E2 \(2026-05-05\)/.test(css)) {
    css = css + '\n' + QHE2_CSS;
}

// Bump CSS version
html = html.replace(/css\/style\.css\?v=\d+/g, 'css/style.css?v=258');

writeFileSync(SRV_PATH, toEol(srv, isCRLFsrv), 'utf8');
writeFileSync(CSS_PATH, toEol(css, isCRLFcss), 'utf8');
writeFileSync(HTML_PATH, toEol(html, isCRLFhtml), 'utf8');

console.log('\n✅ Phase Q-Hub-E2 — Q-Hub-E placement + countdown card visuals fixed.');
console.log('  • Section anchor moved AFTER FAQ </div> (sibling, not child)');
console.log('  • Countdown group renders moon-event-card structure with SSR days/date');
console.log('  • CSS bumped to v=258');
