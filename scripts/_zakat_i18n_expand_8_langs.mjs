#!/usr/bin/env node
/**
 * ZAKAT-CALCULATOR-I18N-EXPAND-8-LANGS-1 (2026-05-31)
 * Add 6 new + update 2 existing zakat keys across 8 per-lang i18n files
 * (bn/de/fr/tr/ur/id/es/ms). AR + EN already have the new keys from the
 * prior ZAKAT-CALCULATOR-UI-CONTENT-UX-IMPROVEMENT-1 commit (87a7880).
 *
 * Updates per file:
 *   - zakat.hero.title          (replace value)
 *   - zakat.hero.subtitle       (replace value)
 *   - zakat.actions.download_pdf (NEW — insert after zakat.actions.copy)
 *   - zakat.empty.subtitle       (NEW)
 *   - zakat.compact_disclaimer.text (NEW)
 *   - zakat.edu.title           (NEW)
 *   - zakat.edu.intro           (NEW)
 *   - zakat.breadcrumb.label    (NEW)
 *   (5 NEW keys inserted as a block after the line containing
 *    `'zakat.disclaimer.body':`)
 *
 * Idempotent: re-runs detect already-present keys and skip.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();

const T = {
    fr: {
        'zakat.hero.title':            'Calculateur de Zakat — Calculez Votre Zakat Facilement',
        'zakat.hero.subtitle':         'Estimez la zakat sur votre argent, vos économies, votre or, votre argent et vos investissements, avec un nissab clair et le taux de 2,5%.',
        'zakat.actions.download_pdf':  'Télécharger la Zakat en PDF',
        'zakat.empty.subtitle':        'Votre résultat apparaîtra ici dès que vous saisirez vos valeurs ci-dessous.',
        'zakat.compact_disclaimer.text': 'Note : ce calculateur est destiné à une estimation uniquement et ne constitue pas une fatwa. Pour les cas particuliers, consultez un savant de confiance.',
        'zakat.edu.title':             "En savoir plus sur la zakat de l'argent",
        'zakat.edu.intro':             "La zakat sur l'argent est généralement calculée à 2,5% de la richesse zakatable nette dès qu'elle atteint le nissab et qu'une année lunaire complète (Hawl) s'est écoulée.",
        'zakat.breadcrumb.label':      'Calculateur de Zakat',
    },
    de: {
        'zakat.hero.title':            'Zakat-Rechner — Berechnen Sie Ihre Zakat Einfach',
        'zakat.hero.subtitle':         'Schätzen Sie die Zakat auf Ihr Geld, Ihre Ersparnisse, Gold, Silber und Investitionen — mit klaren Nisab-Schwellen und dem Satz von 2,5%.',
        'zakat.actions.download_pdf':  'Zakat-PDF herunterladen',
        'zakat.empty.subtitle':        'Ihr Ergebnis erscheint hier, sobald Sie unten Ihre Werte eingegeben haben.',
        'zakat.compact_disclaimer.text': 'Hinweis: Dieser Rechner dient nur zur Schätzung und ist keine religiöse Verfügung (Fatwa). In besonderen Fällen wenden Sie sich an einen vertrauenswürdigen Gelehrten.',
        'zakat.edu.title':             'Erfahren Sie mehr über die Zakat auf Geld',
        'zakat.edu.intro':             'Die Zakat auf Geld wird in der Regel mit 2,5% des zakatpflichtigen Nettovermögens berechnet, sobald es den Nisab erreicht und ein volles Mondjahr (Hawl) vergangen ist.',
        'zakat.breadcrumb.label':      'Zakat-Rechner',
    },
    tr: {
        'zakat.hero.title':            'Zekât Hesaplayıcı — Zekâtınızı Kolayca Hesaplayın',
        'zakat.hero.subtitle':         'Paranız, birikiminiz, altın, gümüş ve yatırımlarınız üzerinden zekâtı tahminen hesaplayın — nisab eşikleri ve %2,5 oranı ile.',
        'zakat.actions.download_pdf':  "Zekât PDF'sini İndir",
        'zakat.empty.subtitle':        'Sonucunuz, aşağıya değerlerinizi girer girmez burada görünecektir.',
        'zakat.compact_disclaimer.text': 'Not: bu hesaplayıcı yalnızca tahmin amaçlıdır ve dini bir hüküm (fetva) değildir. Özel durumlar için güvenilir bir alime danışın.',
        'zakat.edu.title':             'Mal zekâtı hakkında bilgi edinin',
        'zakat.edu.intro':             'Mal zekâtı genellikle nisaba ulaşmış ve üzerinden bir kameri yıl (Hawl) geçmiş net zekâta tabi maldan %2,5 olarak hesaplanır.',
        'zakat.breadcrumb.label':      'Zekât Hesaplayıcı',
    },
    ur: {
        'zakat.hero.title':            'زکوٰۃ کیلکولیٹر — اپنی زکوٰۃ آسانی سے شمار کریں',
        'zakat.hero.subtitle':         'اپنی نقد، بچت، سونے، چاندی اور سرمایہ کاری پر زکوٰۃ تخمیناً شمار کریں — واضح نصاب اور 2.5% شرح کے ساتھ۔',
        'zakat.actions.download_pdf':  'زکوٰۃ پی ڈی ایف ڈاؤن لوڈ کریں',
        'zakat.empty.subtitle':        'آپ کے نیچے اپنی رقم کی قیمتیں درج کرتے ہی یہاں نتیجہ ظاہر ہوگا۔',
        'zakat.compact_disclaimer.text': 'نوٹ: یہ کیلکولیٹر صرف تخمینے کے لیے ہے اور یہ شرعی فتویٰ نہیں ہے۔ خاص حالات میں کسی معتبر عالم سے رجوع کریں۔',
        'zakat.edu.title':             'مال کی زکوٰۃ کے بارے میں جانیں',
        'zakat.edu.intro':             'مال کی زکوٰۃ عام طور پر صافی زکوٰۃ پذیر مال کا 2.5% شمار کی جاتی ہے جب وہ نصاب کو پہنچ جائے اور اس پر مکمل قمری سال (حول) گزر چکا ہو۔',
        'zakat.breadcrumb.label':      'زکوٰۃ کیلکولیٹر',
    },
    id: {
        'zakat.hero.title':            'Kalkulator Zakat — Hitung Zakat Anda dengan Mudah',
        'zakat.hero.subtitle':         'Estimasikan zakat untuk uang, tabungan, emas, perak, dan investasi Anda — dengan nisab yang jelas dan tarif 2,5%.',
        'zakat.actions.download_pdf':  'Unduh Zakat PDF',
        'zakat.empty.subtitle':        'Hasil Anda akan muncul di sini segera setelah Anda memasukkan nilai harta Anda di bawah.',
        'zakat.compact_disclaimer.text': 'Catatan: kalkulator ini hanya untuk perkiraan dan bukan fatwa keagamaan. Untuk kasus khusus, konsultasikan dengan ulama tepercaya.',
        'zakat.edu.title':             'Pelajari tentang zakat harta',
        'zakat.edu.intro':             'Zakat harta umumnya dihitung sebesar 2,5% dari kekayaan zakat bersih ketika telah mencapai nisab dan haul satu tahun hijriah.',
        'zakat.breadcrumb.label':      'Kalkulator Zakat',
    },
    es: {
        'zakat.hero.title':            'Calculadora de Zakat — Calcule Su Zakat Fácilmente',
        'zakat.hero.subtitle':         'Estime la zakat sobre su dinero, ahorros, oro, plata e inversiones — con umbrales claros del nisab y la tasa del 2,5%.',
        'zakat.actions.download_pdf':  'Descargar Zakat PDF',
        'zakat.empty.subtitle':        'Su resultado aparecerá aquí en cuanto introduzca sus valores a continuación.',
        'zakat.compact_disclaimer.text': 'Nota: esta calculadora es solo para estimación y no constituye un dictamen religioso (fatwa). Para casos especiales, consulte a un erudito de confianza.',
        'zakat.edu.title':             'Aprende sobre la zakat del dinero',
        'zakat.edu.intro':             'La zakat del dinero generalmente se calcula al 2,5% de la riqueza zakatable neta una vez que alcanza el nisab y ha pasado un año lunar completo (Hawl).',
        'zakat.breadcrumb.label':      'Calculadora de Zakat',
    },
    bn: {
        'zakat.hero.title':            'যাকাত ক্যালকুলেটর — সহজেই আপনার যাকাত হিসাব করুন',
        'zakat.hero.subtitle':         'আপনার অর্থ, সঞ্চয়, সোনা, রুপা এবং বিনিয়োগের উপর যাকাত আনুমানিকভাবে হিসাব করুন — স্পষ্ট নিসাব ও ২.৫% হারে।',
        'zakat.actions.download_pdf':  'যাকাত PDF ডাউনলোড করুন',
        'zakat.empty.subtitle':        'নিচে আপনার সম্পদের মান প্রবেশ করানোর সাথে সাথে এখানে ফলাফল দেখা যাবে।',
        'zakat.compact_disclaimer.text': 'নোট: এই ক্যালকুলেটরটি কেবল আনুমানিক হিসাবের জন্য, কোনো ফতোয়া নয়। বিশেষ পরিস্থিতিতে বিশ্বস্ত আলেমের সাথে পরামর্শ করুন।',
        'zakat.edu.title':             'অর্থের যাকাত সম্পর্কে জানুন',
        'zakat.edu.intro':             'যখন কোনো সম্পদ নিসাবে পৌঁছায় এবং তার উপর এক চান্দ্রবর্ষ (হাওল) অতিবাহিত হয়, তখন সাধারণত নিট যাকাতযোগ্য সম্পদের ২.৫% হারে যাকাত হিসাব করা হয়।',
        'zakat.breadcrumb.label':      'যাকাত ক্যালকুলেটর',
    },
    ms: {
        'zakat.hero.title':            'Kalkulator Zakat — Kira Zakat Anda dengan Mudah',
        'zakat.hero.subtitle':         'Anggarkan zakat ke atas wang, simpanan, emas, perak dan pelaburan anda — dengan ambang nisab yang jelas dan kadar 2.5%.',
        'zakat.actions.download_pdf':  'Muat Turun Zakat PDF',
        'zakat.empty.subtitle':        'Keputusan anda akan dipaparkan di sini sebaik sahaja anda memasukkan nilai harta anda di bawah.',
        'zakat.compact_disclaimer.text': 'Nota: kalkulator ini hanya untuk anggaran dan bukan fatwa keagamaan. Bagi kes khas, rujuklah ulama yang dipercayai.',
        'zakat.edu.title':             'Ketahui tentang zakat harta',
        'zakat.edu.intro':             'Zakat harta biasanya dikira pada kadar 2.5% daripada harta zakat bersih sebaik sahaja mencapai nisab dan setelah berlalu setahun (haul) hijri.',
        'zakat.breadcrumb.label':      'Kalkulator Zakat',
    },
};

const LANGS = Object.keys(T);

function escapeForJsString(s) {
    // wrap value in single quotes — escape internal single quotes + backslashes
    return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function patchLang(lang) {
    const file = resolve(ROOT, `js/i18n/${lang}.js`);
    let src = readFileSync(file, 'utf8');
    const stats = { lang, replaced: 0, added: 0, skipped: 0 };
    const tr = T[lang];

    // ─── (1+2) Replace zakat.hero.title + zakat.hero.subtitle ───
    for (const k of ['zakat.hero.title', 'zakat.hero.subtitle']) {
        const v = escapeForJsString(tr[k]);
        // match the existing line: '<key>': '<old_value>',
        const lineRegex = new RegExp(`(^|\\n)([ \\t]*)'${k.replace(/\./g, '\\.')}':\\s*'(?:[^'\\\\]|\\\\.)*',`, 'g');
        let matched = false;
        src = src.replace(lineRegex, (m, prefix, indent) => {
            matched = true;
            stats.replaced++;
            return `${prefix}${indent}'${k}': '${v}',`;
        });
        if (!matched) {
            console.warn(`[${lang}] WARN: ${k} not found for replace — skipping`);
            stats.skipped++;
        }
    }

    // ─── (3) Insert zakat.actions.download_pdf AFTER zakat.actions.copy ───
    if (src.includes(`'zakat.actions.download_pdf':`)) {
        stats.skipped++;
        console.log(`[${lang}] zakat.actions.download_pdf already present — skipping insertion`);
    } else {
        const v = escapeForJsString(tr['zakat.actions.download_pdf']);
        const copyRegex = /(^|\n)([ \t]*)('zakat\.actions\.copy':\s*'(?:[^'\\]|\\.)*',)/;
        const before = src.length;
        src = src.replace(copyRegex, (m, prefix, indent, line) => {
            return `${prefix}${indent}${line}\n${indent}'zakat.actions.download_pdf': '${v}',`;
        });
        if (src.length === before) {
            console.warn(`[${lang}] WARN: zakat.actions.copy not found — cannot insert download_pdf`);
            stats.skipped++;
        } else {
            stats.added++;
        }
    }

    // ─── (4) Insert 5-key block AFTER zakat.disclaimer.body ───
    const newKeys = ['zakat.empty.subtitle', 'zakat.compact_disclaimer.text', 'zakat.edu.title', 'zakat.edu.intro', 'zakat.breadcrumb.label'];
    const allPresent = newKeys.every(k => src.includes(`'${k}':`));
    if (allPresent) {
        stats.skipped += 5;
        console.log(`[${lang}] all 5 new keys after disclaimer.body already present — skipping`);
    } else {
        const discRegex = /(^|\n)([ \t]*)('zakat\.disclaimer\.body':\s*'(?:[^'\\]|\\.)*',)/;
        const before = src.length;
        src = src.replace(discRegex, (m, prefix, indent, line) => {
            const lines = [
                `${indent}// ZAKAT-CALCULATOR-I18N-EXPAND-8-LANGS-1: 5 new keys (mirror of ar.js/en.js additions)`,
                ...newKeys.map(k => `${indent}'${k}': '${escapeForJsString(tr[k])}',`)
            ].join('\n');
            stats.added += 5;
            return `${prefix}${indent}${line}\n${lines}`;
        });
        if (src.length === before) {
            console.warn(`[${lang}] WARN: zakat.disclaimer.body not found — cannot insert 5-key block`);
            stats.skipped += 5;
        }
    }

    writeFileSync(file, src, 'utf8');
    return stats;
}

console.log('ZAKAT-CALCULATOR-I18N-EXPAND-8-LANGS-1 — patching 8 lang files\n');
const totals = { replaced: 0, added: 0, skipped: 0 };
for (const lang of LANGS) {
    const s = patchLang(lang);
    console.log(`  ${lang}: replaced=${s.replaced} added=${s.added} skipped=${s.skipped}`);
    totals.replaced += s.replaced;
    totals.added += s.added;
    totals.skipped += s.skipped;
}
console.log(`\nTotal: replaced=${totals.replaced} added=${totals.added} skipped=${totals.skipped}`);
console.log(`Expected on FRESH run: replaced=16 (8 langs × 2 keys), added=48 (8 langs × 6 keys), skipped=0`);
