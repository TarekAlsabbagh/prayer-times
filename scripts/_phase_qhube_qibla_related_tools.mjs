// Phase Q-Hub-E — Related Islamic Tools Section (2026-05-05).
//
// Adds an "روابط إسلامية ذات صلة" section AT THE BOTTOM of /qibla, between
// the FAQ section and Section 9 (Footer). 3 groups × 4 link cards each:
//   • أدوات أساسية: prayer times / hijri today / moon today / hijri calendar
//   • العد التنازلي: ramadan / eid al-fitr / eid al-adha / hijri new year
//   • صفحات مساعدة: azkar / zakat / msbaha / date converter
//
// Goal: improve internal navigation + UX, NOT inflate SEO content. Each
// link card is short (label + 6-8 word description). NO long paragraphs.
//
// SCOPE: /qibla ONLY. Title/Meta/H1, guide content, /qibla-in-{city},
// /moon-*, /hijri-*, /prayer-times-* untouched.

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

if (/Phase Q-Hub-E \(2026-05-05\)/.test(srv)) {
    throw new Error('[server.js] Q-Hub-E already applied');
}

function toEol(s, useCRLF) { return useCRLF ? s.replace(/\n/g, '\r\n') : s; }

// ───────────────────────────────────────────────────────────────────────
// 1) Inject Q-Hub-E SSR data + render code at end of _isQiblaHub block,
//    just BEFORE the closing `}` of `if (_isQiblaHub) { ... }`.
// ───────────────────────────────────────────────────────────────────────

const SRV_ANCHOR = `        } catch (_e) { /* silent — Q-Hub-C2 unified guide section optional */ }
    }`;

if (srv.indexOf(SRV_ANCHOR) < 0) {
    throw new Error('[server.js] Q-Hub-C2 anchor not found');
}

const SRV_NEW_BLOCK = `        } catch (_e) { /* silent — Q-Hub-C2 unified guide section optional */ }
        // Phase Q-Hub-E (2026-05-05): "روابط إسلامية ذات صلة" section.
        // Internal nav cards (3 groups × 4 links each) injected AFTER the FAQ
        // section card and BEFORE Section 9 (Footer). Per-lang labels +
        // short 6-8 word descriptions. NO long paragraphs (UX, not SEO bloat).
        const _qHubRelated = {
            ar: {
                title: 'روابط إسلامية ذات صلة',
                lead: 'خدمات إسلامية مساعدة تكمّل تجربتك في معرفة اتجاه القبلة.',
                groups: [
                    { title: 'أدوات أساسية', links: [
                        { icon: '🕌', label: 'مواقيت الصلاة', desc: 'مواقيت اليوم لأي مدينة', href: '/' },
                        { icon: '🗓️', label: 'التاريخ الهجري اليوم', desc: 'التاريخ الهجري الحالي بدقة', href: '/today-hijri-date' },
                        { icon: '🌙', label: 'حالة القمر اليوم', desc: 'الطور والإضاءة وعمر القمر', href: '/moon-today' },
                        { icon: '📅', label: 'التقويم الهجري', desc: 'تقويم سنة 1447 هجرية كاملاً', href: '/hijri-calendar/1447' },
                    ] },
                    { title: 'العد التنازلي للمناسبات', links: [
                        { icon: '🌙', label: 'كم باقي على رمضان', desc: 'العد التنازلي حتى أول رمضان', href: '/ramadan-countdown' },
                        { icon: '🎉', label: 'كم باقي على عيد الفطر', desc: 'حساب الأيام المتبقية', href: '/eid-al-fitr-countdown' },
                        { icon: '🐑', label: 'كم باقي على عيد الأضحى', desc: 'حساب الأيام المتبقية', href: '/eid-al-adha-countdown' },
                        { icon: '🎊', label: 'رأس السنة الهجرية', desc: 'حتى أول محرم القادم', href: '/hijri-new-year-countdown' },
                    ] },
                    { title: 'صفحات مساعدة', links: [
                        { icon: '📿', label: 'الأذكار', desc: 'أذكار الصباح والمساء وبعد الصلاة', href: '/azkar' },
                        { icon: '💰', label: 'حاسبة الزكاة', desc: 'احسب زكاة المال والذهب', href: '/zakat-calculator' },
                        { icon: '📿', label: 'المسبحة الإلكترونية', desc: 'سبحة رقمية للتسبيح والذكر', href: '/msbaha' },
                        { icon: '🔄', label: 'محوّل التاريخ', desc: 'تحويل بين الميلادي والهجري', href: '/dateconverter' },
                    ] },
                ],
            },
            en: {
                title: 'Related Islamic Tools',
                lead: 'Helpful Islamic services that complement your Qibla experience.',
                groups: [
                    { title: 'Essential Tools', links: [
                        { icon: '🕌', label: 'Prayer Times', desc: "Today's times for any city", href: '/en/' },
                        { icon: '🗓️', label: 'Hijri Date Today', desc: 'Current Islamic date with precision', href: '/en/today-hijri-date' },
                        { icon: '🌙', label: 'Moon Today', desc: 'Phase, illumination and lunar age', href: '/en/moon-today' },
                        { icon: '📅', label: 'Hijri Calendar', desc: 'Full Islamic calendar 1447 AH', href: '/en/hijri-calendar/1447' },
                    ] },
                    { title: 'Event Countdowns', links: [
                        { icon: '🌙', label: 'Ramadan Countdown', desc: 'Days remaining until Ramadan', href: '/en/ramadan-countdown' },
                        { icon: '🎉', label: 'Eid al-Fitr Countdown', desc: 'Days remaining until Eid', href: '/en/eid-al-fitr-countdown' },
                        { icon: '🐑', label: 'Eid al-Adha Countdown', desc: 'Days remaining until Eid', href: '/en/eid-al-adha-countdown' },
                        { icon: '🎊', label: 'Hijri New Year', desc: 'Until next Muharram begins', href: '/en/hijri-new-year-countdown' },
                    ] },
                    { title: 'Helper Pages', links: [
                        { icon: '📿', label: 'Azkar', desc: 'Morning, evening and post-prayer azkar', href: '/en/azkar' },
                        { icon: '💰', label: 'Zakat Calculator', desc: 'Calculate zakat on money and gold', href: '/en/zakat-calculator' },
                        { icon: '📿', label: 'Tasbih (Msbaha)', desc: 'Digital tasbih for dhikr', href: '/en/msbaha' },
                        { icon: '🔄', label: 'Date Converter', desc: 'Gregorian ↔ Hijri conversion', href: '/en/dateconverter' },
                    ] },
                ],
            },
            fr: {
                title: 'Outils islamiques connexes',
                lead: 'Services islamiques qui complètent votre expérience de la Qibla.',
                groups: [
                    { title: 'Outils essentiels', links: [
                        { icon: '🕌', label: 'Heures de prière', desc: 'Heures du jour pour toute ville', href: '/fr/' },
                        { icon: '🗓️', label: 'Date hégirienne', desc: 'Date islamique actuelle précise', href: '/fr/today-hijri-date' },
                        { icon: '🌙', label: 'Lune aujourd\\u2019hui', desc: 'Phase, illumination et âge lunaire', href: '/fr/moon-today' },
                        { icon: '📅', label: 'Calendrier hégirien', desc: 'Calendrier islamique complet 1447 H', href: '/fr/hijri-calendar/1447' },
                    ] },
                    { title: 'Comptes à rebours', links: [
                        { icon: '🌙', label: 'Ramadan', desc: 'Jours restants jusqu\\u2019au Ramadan', href: '/fr/ramadan-countdown' },
                        { icon: '🎉', label: 'Aïd al-Fitr', desc: 'Jours restants jusqu\\u2019à l\\u2019Aïd', href: '/fr/eid-al-fitr-countdown' },
                        { icon: '🐑', label: 'Aïd al-Adha', desc: 'Jours restants jusqu\\u2019à l\\u2019Aïd', href: '/fr/eid-al-adha-countdown' },
                        { icon: '🎊', label: 'Nouvel an hégirien', desc: 'Jusqu\\u2019au prochain Mouharram', href: '/fr/hijri-new-year-countdown' },
                    ] },
                    { title: 'Pages utiles', links: [
                        { icon: '📿', label: 'Azkar', desc: 'Azkar du matin, du soir et après prière', href: '/fr/azkar' },
                        { icon: '💰', label: 'Calculatrice zakat', desc: 'Calcul de la zakat sur l\\u2019argent', href: '/fr/zakat-calculator' },
                        { icon: '📿', label: 'Tasbih (Msbaha)', desc: 'Compteur numérique pour le dhikr', href: '/fr/msbaha' },
                        { icon: '🔄', label: 'Convertisseur de date', desc: 'Conversion grégorien ↔ hégirien', href: '/fr/dateconverter' },
                    ] },
                ],
            },
            tr: {
                title: 'İlgili İslami Araçlar',
                lead: 'Kıble deneyiminizi tamamlayan yardımcı İslami hizmetler.',
                groups: [
                    { title: 'Temel Araçlar', links: [
                        { icon: '🕌', label: 'Namaz Vakitleri', desc: 'Bugünün vakitleri her şehir için', href: '/tr/' },
                        { icon: '🗓️', label: 'Hicri Tarih', desc: 'Bugünkü Hicri tarihi hassas olarak', href: '/tr/today-hijri-date' },
                        { icon: '🌙', label: 'Bugün Ay', desc: 'Evre, aydınlanma ve ay yaşı', href: '/tr/moon-today' },
                        { icon: '📅', label: 'Hicri Takvim', desc: 'Tam Hicri 1447 takvimi', href: '/tr/hijri-calendar/1447' },
                    ] },
                    { title: 'Geri Sayımlar', links: [
                        { icon: '🌙', label: 'Ramazan Geri Sayımı', desc: 'Ramazana kalan günler', href: '/tr/ramadan-countdown' },
                        { icon: '🎉', label: 'Ramazan Bayramı', desc: 'Bayrama kalan günler', href: '/tr/eid-al-fitr-countdown' },
                        { icon: '🐑', label: 'Kurban Bayramı', desc: 'Bayrama kalan günler', href: '/tr/eid-al-adha-countdown' },
                        { icon: '🎊', label: 'Hicri Yılbaşı', desc: 'Sonraki Muharrem\\u2019e kadar', href: '/tr/hijri-new-year-countdown' },
                    ] },
                    { title: 'Yardımcı Sayfalar', links: [
                        { icon: '📿', label: 'Zikirler', desc: 'Sabah, akşam ve namaz sonrası zikirler', href: '/tr/azkar' },
                        { icon: '💰', label: 'Zekat Hesaplayıcı', desc: 'Mal ve altın zekatı hesaplama', href: '/tr/zakat-calculator' },
                        { icon: '📿', label: 'Tesbih (Msbaha)', desc: 'Zikir için dijital tesbih', href: '/tr/msbaha' },
                        { icon: '🔄', label: 'Tarih Dönüştürücü', desc: 'Miladi ↔ Hicri dönüşüm', href: '/tr/dateconverter' },
                    ] },
                ],
            },
            ur: {
                title: 'متعلقہ اسلامی ٹولز',
                lead: 'قبلہ کے تجربے میں آپ کی مدد کرنے والی اسلامی خدمات۔',
                groups: [
                    { title: 'بنیادی ٹولز', links: [
                        { icon: '🕌', label: 'نماز کے اوقات', desc: 'کسی بھی شہر کے آج کے اوقات', href: '/ur/' },
                        { icon: '🗓️', label: 'آج کی ہجری تاریخ', desc: 'موجودہ ہجری تاریخ درست', href: '/ur/today-hijri-date' },
                        { icon: '🌙', label: 'آج چاند', desc: 'مرحلہ، روشنی اور چاند کی عمر', href: '/ur/moon-today' },
                        { icon: '📅', label: 'ہجری کیلنڈر', desc: 'مکمل 1447 ہجری کیلنڈر', href: '/ur/hijri-calendar/1447' },
                    ] },
                    { title: 'الٹی گنتی', links: [
                        { icon: '🌙', label: 'رمضان میں کتنا باقی', desc: 'رمضان تک باقی دن', href: '/ur/ramadan-countdown' },
                        { icon: '🎉', label: 'عید الفطر کتنا باقی', desc: 'عید تک باقی دن', href: '/ur/eid-al-fitr-countdown' },
                        { icon: '🐑', label: 'عید الاضحیٰ کتنا باقی', desc: 'عید تک باقی دن', href: '/ur/eid-al-adha-countdown' },
                        { icon: '🎊', label: 'نیا ہجری سال', desc: 'اگلے محرم تک', href: '/ur/hijri-new-year-countdown' },
                    ] },
                    { title: 'مددگار صفحات', links: [
                        { icon: '📿', label: 'اذکار', desc: 'صبح، شام اور بعد از نماز اذکار', href: '/ur/azkar' },
                        { icon: '💰', label: 'زکوٰۃ کیلکولیٹر', desc: 'مال اور سونے کی زکوٰۃ', href: '/ur/zakat-calculator' },
                        { icon: '📿', label: 'ڈیجیٹل تسبیح', desc: 'ذکر کے لیے ڈیجیٹل تسبیح', href: '/ur/msbaha' },
                        { icon: '🔄', label: 'تاریخ کنورٹر', desc: 'گریگوری اور ہجری کے درمیان', href: '/ur/dateconverter' },
                    ] },
                ],
            },
            de: {
                title: 'Verwandte islamische Werkzeuge',
                lead: 'Hilfreiche islamische Dienste, die Ihre Qibla-Erfahrung ergänzen.',
                groups: [
                    { title: 'Grundlegende Werkzeuge', links: [
                        { icon: '🕌', label: 'Gebetszeiten', desc: 'Heutige Zeiten für jede Stadt', href: '/de/' },
                        { icon: '🗓️', label: 'Hidschri-Datum heute', desc: 'Aktuelles islamisches Datum präzise', href: '/de/today-hijri-date' },
                        { icon: '🌙', label: 'Mond heute', desc: 'Phase, Beleuchtung und Mondalter', href: '/de/moon-today' },
                        { icon: '📅', label: 'Hidschri-Kalender', desc: 'Vollständiger Kalender 1447 AH', href: '/de/hijri-calendar/1447' },
                    ] },
                    { title: 'Countdowns', links: [
                        { icon: '🌙', label: 'Ramadan-Countdown', desc: 'Verbleibende Tage bis Ramadan', href: '/de/ramadan-countdown' },
                        { icon: '🎉', label: 'Eid al-Fitr', desc: 'Verbleibende Tage bis Eid', href: '/de/eid-al-fitr-countdown' },
                        { icon: '🐑', label: 'Eid al-Adha', desc: 'Verbleibende Tage bis Eid', href: '/de/eid-al-adha-countdown' },
                        { icon: '🎊', label: 'Islamisches Neujahr', desc: 'Bis zum nächsten Muharram', href: '/de/hijri-new-year-countdown' },
                    ] },
                    { title: 'Hilfsseiten', links: [
                        { icon: '📿', label: 'Adhkar', desc: 'Morgen-, Abend- und Nach-Gebet-Adhkar', href: '/de/azkar' },
                        { icon: '💰', label: 'Zakat-Rechner', desc: 'Zakat auf Geld und Gold berechnen', href: '/de/zakat-calculator' },
                        { icon: '📿', label: 'Digitale Tasbih', desc: 'Digitale Tasbih für Dhikr', href: '/de/msbaha' },
                        { icon: '🔄', label: 'Datums-Konverter', desc: 'Gregorianisch ↔ Hidschri', href: '/de/dateconverter' },
                    ] },
                ],
            },
            id: {
                title: 'Alat Islami Terkait',
                lead: 'Layanan Islami yang melengkapi pengalaman kiblat Anda.',
                groups: [
                    { title: 'Alat Utama', links: [
                        { icon: '🕌', label: 'Jadwal Salat', desc: 'Waktu hari ini untuk setiap kota', href: '/id/' },
                        { icon: '🗓️', label: 'Tanggal Hijriah', desc: 'Tanggal Islam saat ini akurat', href: '/id/today-hijri-date' },
                        { icon: '🌙', label: 'Bulan Hari Ini', desc: 'Fase, pencahayaan dan usia bulan', href: '/id/moon-today' },
                        { icon: '📅', label: 'Kalender Hijriah', desc: 'Kalender lengkap 1447 H', href: '/id/hijri-calendar/1447' },
                    ] },
                    { title: 'Hitung Mundur', links: [
                        { icon: '🌙', label: 'Hitung Mundur Ramadan', desc: 'Hari tersisa hingga Ramadan', href: '/id/ramadan-countdown' },
                        { icon: '🎉', label: 'Idul Fitri', desc: 'Hari tersisa hingga Idul Fitri', href: '/id/eid-al-fitr-countdown' },
                        { icon: '🐑', label: 'Idul Adha', desc: 'Hari tersisa hingga Idul Adha', href: '/id/eid-al-adha-countdown' },
                        { icon: '🎊', label: 'Tahun Baru Hijriah', desc: 'Hingga Muharram berikutnya', href: '/id/hijri-new-year-countdown' },
                    ] },
                    { title: 'Halaman Bantuan', links: [
                        { icon: '📿', label: 'Azkar', desc: 'Azkar pagi, sore dan setelah salat', href: '/id/azkar' },
                        { icon: '💰', label: 'Kalkulator Zakat', desc: 'Hitung zakat uang dan emas', href: '/id/zakat-calculator' },
                        { icon: '📿', label: 'Tasbih Digital', desc: 'Tasbih digital untuk zikir', href: '/id/msbaha' },
                        { icon: '🔄', label: 'Konverter Tanggal', desc: 'Masehi ↔ Hijriah', href: '/id/dateconverter' },
                    ] },
                ],
            },
            es: {
                title: 'Herramientas islámicas relacionadas',
                lead: 'Servicios islámicos útiles que complementan su experiencia de Qibla.',
                groups: [
                    { title: 'Herramientas esenciales', links: [
                        { icon: '🕌', label: 'Horarios de oración', desc: 'Horarios de hoy para cualquier ciudad', href: '/es/' },
                        { icon: '🗓️', label: 'Fecha hégira de hoy', desc: 'Fecha islámica actual precisa', href: '/es/today-hijri-date' },
                        { icon: '🌙', label: 'Luna hoy', desc: 'Fase, iluminación y edad lunar', href: '/es/moon-today' },
                        { icon: '📅', label: 'Calendario hégira', desc: 'Calendario islámico completo 1447 H', href: '/es/hijri-calendar/1447' },
                    ] },
                    { title: 'Cuentas regresivas', links: [
                        { icon: '🌙', label: 'Cuenta atrás Ramadán', desc: 'Días restantes hasta Ramadán', href: '/es/ramadan-countdown' },
                        { icon: '🎉', label: 'Eid al-Fitr', desc: 'Días restantes hasta el Eid', href: '/es/eid-al-fitr-countdown' },
                        { icon: '🐑', label: 'Eid al-Adha', desc: 'Días restantes hasta el Eid', href: '/es/eid-al-adha-countdown' },
                        { icon: '🎊', label: 'Año Nuevo Hégira', desc: 'Hasta el próximo Muharram', href: '/es/hijri-new-year-countdown' },
                    ] },
                    { title: 'Páginas auxiliares', links: [
                        { icon: '📿', label: 'Azkar', desc: 'Azkar de mañana, noche y después de la oración', href: '/es/azkar' },
                        { icon: '💰', label: 'Calculadora de zakat', desc: 'Calcule el zakat de dinero y oro', href: '/es/zakat-calculator' },
                        { icon: '📿', label: 'Tasbih digital', desc: 'Tasbih digital para el dhikr', href: '/es/msbaha' },
                        { icon: '🔄', label: 'Conversor de fechas', desc: 'Gregoriano ↔ Hégira', href: '/es/dateconverter' },
                    ] },
                ],
            },
            bn: {
                title: 'সম্পর্কিত ইসলামিক টুল',
                lead: 'কিবলা অভিজ্ঞতা পরিপূর্ণ করতে সহায়ক ইসলামিক সেবা।',
                groups: [
                    { title: 'প্রয়োজনীয় টুল', links: [
                        { icon: '🕌', label: 'নামাজের সময়', desc: 'যে কোন শহরের আজকের সময়', href: '/bn/' },
                        { icon: '🗓️', label: 'আজকের হিজরি তারিখ', desc: 'বর্তমান ইসলামিক তারিখ সঠিকভাবে', href: '/bn/today-hijri-date' },
                        { icon: '🌙', label: 'আজ চাঁদ', desc: 'দশা, আলোকসজ্জা ও চাঁদের বয়স', href: '/bn/moon-today' },
                        { icon: '📅', label: 'হিজরি ক্যালেন্ডার', desc: 'সম্পূর্ণ হিজরি 1447 ক্যালেন্ডার', href: '/bn/hijri-calendar/1447' },
                    ] },
                    { title: 'কাউন্টডাউন', links: [
                        { icon: '🌙', label: 'রমজান কাউন্টডাউন', desc: 'রমজান পর্যন্ত বাকি দিন', href: '/bn/ramadan-countdown' },
                        { icon: '🎉', label: 'ঈদুল ফিতর', desc: 'ঈদ পর্যন্ত বাকি দিন', href: '/bn/eid-al-fitr-countdown' },
                        { icon: '🐑', label: 'ঈদুল আযহা', desc: 'ঈদ পর্যন্ত বাকি দিন', href: '/bn/eid-al-adha-countdown' },
                        { icon: '🎊', label: 'হিজরি নববর্ষ', desc: 'পরবর্তী মুহাররম পর্যন্ত', href: '/bn/hijri-new-year-countdown' },
                    ] },
                    { title: 'সহায়ক পৃষ্ঠা', links: [
                        { icon: '📿', label: 'আযকার', desc: 'সকাল, সন্ধ্যা ও নামাজ পরবর্তী আযকার', href: '/bn/azkar' },
                        { icon: '💰', label: 'যাকাত ক্যালকুলেটর', desc: 'টাকা ও সোনার যাকাত হিসাব', href: '/bn/zakat-calculator' },
                        { icon: '📿', label: 'ডিজিটাল তসবিহ', desc: 'যিকরের জন্য ডিজিটাল তসবিহ', href: '/bn/msbaha' },
                        { icon: '🔄', label: 'তারিখ কনভার্টার', desc: 'গ্রেগরিয়ান ↔ হিজরি', href: '/bn/dateconverter' },
                    ] },
                ],
            },
            ms: {
                title: 'Alat Islam Berkaitan',
                lead: 'Perkhidmatan Islam yang melengkapi pengalaman kiblat anda.',
                groups: [
                    { title: 'Alat Utama', links: [
                        { icon: '🕌', label: 'Waktu Solat', desc: 'Waktu hari ini untuk mana-mana bandar', href: '/ms/' },
                        { icon: '🗓️', label: 'Tarikh Hijrah', desc: 'Tarikh Islam semasa dengan tepat', href: '/ms/today-hijri-date' },
                        { icon: '🌙', label: 'Bulan Hari Ini', desc: 'Fasa, pencahayaan dan usia bulan', href: '/ms/moon-today' },
                        { icon: '📅', label: 'Kalendar Hijrah', desc: 'Kalendar lengkap 1447 H', href: '/ms/hijri-calendar/1447' },
                    ] },
                    { title: 'Detik Akhir', links: [
                        { icon: '🌙', label: 'Detik Ramadan', desc: 'Hari berbaki sehingga Ramadan', href: '/ms/ramadan-countdown' },
                        { icon: '🎉', label: 'Aidilfitri', desc: 'Hari berbaki sehingga Aidilfitri', href: '/ms/eid-al-fitr-countdown' },
                        { icon: '🐑', label: 'Aidiladha', desc: 'Hari berbaki sehingga Aidiladha', href: '/ms/eid-al-adha-countdown' },
                        { icon: '🎊', label: 'Tahun Baharu Hijrah', desc: 'Sehingga Muharram berikutnya', href: '/ms/hijri-new-year-countdown' },
                    ] },
                    { title: 'Halaman Bantuan', links: [
                        { icon: '📿', label: 'Azkar', desc: 'Azkar pagi, petang dan selepas solat', href: '/ms/azkar' },
                        { icon: '💰', label: 'Kalkulator Zakat', desc: 'Kira zakat wang dan emas', href: '/ms/zakat-calculator' },
                        { icon: '📿', label: 'Tasbih Digital', desc: 'Tasbih digital untuk zikir', href: '/ms/msbaha' },
                        { icon: '🔄', label: 'Penukar Tarikh', desc: 'Masehi ↔ Hijrah', href: '/ms/dateconverter' },
                    ] },
                ],
            },
        };
        try {
            const _r = _qHubRelated[seo.lang] || _qHubRelated.en;
            const _groupsHtml = _r.groups.map(g => {
                const _linksHtml = g.links.map(l =>
                    \`<a class="qhe-link" href="\${_escHtml(l.href)}"><span class="qhe-link-icon" aria-hidden="true">\${l.icon}</span><span class="qhe-link-text"><span class="qhe-link-label">\${_escHtml(l.label)}</span><span class="qhe-link-desc">\${_escHtml(l.desc)}</span></span></a>\`
                ).join('');
                return \`<div class="qhe-group"><h3 class="qhe-group-title">\${_escHtml(g.title)}</h3><div class="qhe-link-grid">\${_linksHtml}</div></div>\`;
            }).join('');
            const _relatedHtml = \`<div class="section-card qibla-hub-only qhe-section"><header class="qhe-header"><h2 class="qhe-h2">\${_escHtml(_r.title)}</h2><p class="qhe-lead">\${_escHtml(_r.lead)}</p></header>\${_groupsHtml}</div>\`;
            // Anchor: insert AFTER the FAQ section card and BEFORE Section 9 (Footer).
            html = html.replace(
                /(<\\/div>\\s*<!-- Section 9: Footer -->)/,
                _relatedHtml + '$1'
            );
        } catch (_e) { /* silent — Q-Hub-E related tools section optional */ }
    }`;

srv = srv.replace(SRV_ANCHOR, SRV_NEW_BLOCK);

// ───────────────────────────────────────────────────────────────────────
// 2) Append Q-Hub-E CSS to style.css
// ───────────────────────────────────────────────────────────────────────

const QHE_CSS = `
/* ── Phase Q-Hub-E (2026-05-05): Related Islamic tools section. ── */
/* 3 groups × 4 link cards each, compact + visually distinct from guide. */
.qhe-section { max-width: 1180px; margin-inline: auto; padding: 22px 18px 24px; background: var(--card-bg, #fff); border: 1px solid rgba(26,74,26,0.13); border-radius: 22px; box-shadow: 0 2px 8px rgba(26,74,26,0.04); }
html[data-theme="dark"] .qhe-section { background: var(--card-bg, #1a2820); border-color: rgba(127,199,127,0.16); box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
.qhe-header { margin-bottom: 16px; text-align: center; }
.qhe-h2 { margin: 0 0 6px; font-size: 1.32rem; line-height: 1.35; color: var(--text); font-weight: 700; }
.qhe-lead { margin: 0; color: var(--text-light); font-size: 0.92rem; line-height: 1.6; }
.qhe-group { margin-top: 16px; }
.qhe-group-title { margin: 0 0 10px; font-size: 0.95rem; font-weight: 600; color: var(--accent, #1a4a1a); padding-inline-start: 8px; border-inline-start: 3px solid rgba(26,74,26,0.3); padding-block: 2px; }
html[data-theme="dark"] .qhe-group-title { color: #7fc77f; border-inline-start-color: rgba(127,199,127,0.4); }
.qhe-link-grid { display: grid; gap: 10px; grid-template-columns: 1fr; }
@media (min-width: 600px) { .qhe-link-grid { grid-template-columns: 1fr 1fr; gap: 12px; } }
@media (min-width: 980px) { .qhe-link-grid { grid-template-columns: repeat(4, 1fr); gap: 12px; } }
.qhe-link { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; background: rgba(26,74,26,0.03); border: 1px solid rgba(26,74,26,0.10); border-radius: 14px; text-decoration: none; color: inherit; transition: background 0.15s, border-color 0.15s, transform 0.15s; min-height: 60px; }
html[data-theme="dark"] .qhe-link { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.08); }
.qhe-link:hover { background: rgba(26,74,26,0.06); border-color: rgba(26,74,26,0.20); transform: translateY(-1px); }
html[data-theme="dark"] .qhe-link:hover { background: rgba(255,255,255,0.06); border-color: rgba(127,199,127,0.25); }
.qhe-link-icon { flex: 0 0 auto; width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; font-size: 1.05rem; background: rgba(26,74,26,0.08); border-radius: 8px; }
html[data-theme="dark"] .qhe-link-icon { background: rgba(255,255,255,0.06); }
.qhe-link-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1 1 auto; }
.qhe-link-label { font-size: 0.93rem; font-weight: 600; color: var(--text); line-height: 1.3; }
.qhe-link-desc { font-size: 0.79rem; color: var(--text-light); line-height: 1.4; }`;

if (!/Phase Q-Hub-E \(2026-05-05\)/.test(css)) {
    css = css + '\n' + QHE_CSS;
}

// ───────────────────────────────────────────────────────────────────────
// 3) Bump style.css?v=
// ───────────────────────────────────────────────────────────────────────

html = html.replace(/css\/style\.css\?v=\d+/g, 'css/style.css?v=257');

writeFileSync(SRV_PATH, toEol(srv, isCRLFsrv), 'utf8');
writeFileSync(CSS_PATH, toEol(css, isCRLFcss), 'utf8');
writeFileSync(HTML_PATH, toEol(html, isCRLFhtml), 'utf8');

console.log('\n✅ Phase Q-Hub-E — Related Islamic Tools section applied.');
console.log('  • 3 groups × 4 link cards each, per-lang (10 langs)');
console.log('  • Inserted AFTER FAQ, BEFORE Section 9 (Footer)');
console.log('  • CSS bumped to v=257');
