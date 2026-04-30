// Phase D3.3a — Zakat full localization for 8 non-AR/EN languages.
// Adds 39 keys × 8 langs = 312 missing translations to js/i18n.js.
// Scope: zakat.hero.* (5), zakat.actions.* (3), zakat.result.* (12),
//        zakat.faq.* (15), zakat.howto.* (4).
// Anchor: each language section already contains 'zakat.cond5' as the last
//         legacy zakat key — we insert the new block immediately after it.
// Aborts on any anchor mismatch (no partial state).

import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\';
const PATH = ROOT + 'js/i18n.js';

const APO = String.fromCharCode(92) + 'u2019'; // literal ’ (6 chars in source)

// ─────────────────────────────────────────────────────────────
// Translations table (39 keys × 8 langs)
// ─────────────────────────────────────────────────────────────
const T = {
  fr: {
    'zakat.hero.title':         'Calculateur de Zakat',
    'zakat.hero.subtitle':      `Calculez la zakat sur votre argent, votre épargne, votre or et vos actions facilement, avec un nissab clair et le taux de 2,5${String.fromCharCode(160)}%.`,
    'zakat.hero.badge_percent': 'Taux : 2,5 %',
    'zakat.hero.badge_nisab':   `Nissab : 85${String.fromCharCode(160)}g d${APO}or ou 595${String.fromCharCode(160)}g d${APO}argent`,
    'zakat.hero.badge_hawl':    'Hawl : une année lunaire',
    'zakat.actions.reset':      'Réinitialiser',
    'zakat.actions.copy':       'Copier le résultat',
    'zakat.actions.copied':     'Copié ✓',
    'zakat.result.title':       'Résultat de la Zakat',
    'zakat.result.net':         'Patrimoine net zakatable',
    'zakat.result.nisab':       'Nissab effectif',
    'zakat.result.amount':      'Zakat due',
    'zakat.result.formula':     'Zakat = Patrimoine net × 2,5 %',
    'zakat.result.empty':       'Saisissez vos avoirs pour démarrer le calcul',
    'zakat.result.below':       `Le patrimoine n${APO}a pas atteint le nissab`,
    'zakat.result.due':         'Nissab atteint — la zakat est due',
    'zakat.result.pending':     `Nissab atteint mais le Hawl n${APO}a pas encore passé`,
    'zakat.result.pending_note':`La zakat ne peut être due qu${APO}après l${APO}écoulement d${APO}une année lunaire complète sur le patrimoine.`,
    'zakat.result.estimate':    `Le patrimoine atteint le nissab — il s${APO}agit d${APO}une estimation${String.fromCharCode(160)};${String.fromCharCode(160)}vérifiez l${APO}année lunaire (Hawl).`,
    'zakat.result.estimate_badge':'estimation',
    'zakat.faq.title':          'FAQ sur la Zakat',
    'zakat.faq.q1':             'Comment calculer la zakat sur l\\u2019argent ?',
    'zakat.faq.a1':             'Si le patrimoine atteint le nissab et qu\\u2019une année lunaire complète (Hawl) s\\u2019est écoulée, la zakat est calculée à 2,5 % du patrimoine net zakatable.',
    'zakat.faq.q2':             'Quel est le taux de la zakat sur l\\u2019argent ?',
    'zakat.faq.a2':             'Le taux de la zakat sur l\\u2019argent est généralement de 2,5 %.',
    'zakat.faq.q3':             'La zakat est-elle due sur le salaire ?',
    'zakat.faq.a3':             'Le salaire lui-même n\\u2019est pas soumis à la zakat dès sa réception, mais ce qui en est épargné, qui atteint le nissab et sur lequel passe une année lunaire complète, entre dans le calcul de la zakat.',
    'zakat.faq.q4':             `L${APO}or est-il soumis à la zakat ?`,
    'zakat.faq.a4':             `L${APO}or est soumis à la zakat dès qu${APO}il atteint le nissab. L${APO}or de bijoux personnels présente des divergences fiqhiques, référez-vous donc à la fatwa que vous suivez.`,
    'zakat.faq.q5':             'La zakat est-elle due sur les actions ?',
    'zakat.faq.a5':             `Oui, la zakat peut être due sur les actions selon l${APO}intention (investissement à long terme, spéculation ou commerce). Elles peuvent être incluses dans la section investissements de la calculatrice.`,
    'zakat.faq.q6':             'Dois-je déduire les dettes de la zakat ?',
    'zakat.faq.a6':             'Certaines dettes échues peuvent être déduites, mais les détails varient selon le type et le moment de la dette — cette calculatrice fournit une estimation générale.',
    'zakat.faq.q7':             `Cette calculatrice remplace-t-elle la consultation d${APO}un savant ?`,
    'zakat.faq.a7':             'Non, la calculatrice vous aide à estimer, mais elle ne remplace pas la consultation d\\u2019un savant compétent dans les cas particuliers ou complexes.',
    'zakat.howto.step1':        `Déterminez le nissab — 85${String.fromCharCode(160)}g d${APO}or ou 595${String.fromCharCode(160)}g d${APO}argent au prix du marché.`,
    'zakat.howto.step2':        'Additionnez l\\u2019ensemble de votre patrimoine zakatable (liquidités + or + investissements + créances).',
    'zakat.howto.step3':        'Soustrayez les dettes que vous devez pour obtenir le patrimoine net zakatable.',
    'zakat.howto.step4':        'Multipliez le patrimoine net × 2,5 % s\\u2019il atteint le nissab et que le Hawl est passé.',
  },
  tr: {
    'zakat.hero.title':         'Zekat Hesaplayıcı',
    'zakat.hero.subtitle':      'Para, birikim, altın ve hisse senetlerine düşen zekatı kolayca hesaplayın — net nisap ve %2,5 oranıyla.',
    'zakat.hero.badge_percent': 'Oran: %2,5',
    'zakat.hero.badge_nisab':   'Nisap: 85 g altın veya 595 g gümüş',
    'zakat.hero.badge_hawl':    'Havl: bir hicri yıl',
    'zakat.actions.reset':      'Sıfırla',
    'zakat.actions.copy':       'Sonucu kopyala',
    'zakat.actions.copied':     'Kopyalandı ✓',
    'zakat.result.title':       'Zekat Sonucu',
    'zakat.result.net':         'Net zekata tabi servet',
    'zakat.result.nisab':       'Geçerli nisap',
    'zakat.result.amount':      'Verilecek zekat',
    'zakat.result.formula':     'Zekat = Net servet × %2,5',
    'zakat.result.empty':       'Hesaplamayı başlatmak için varlık değerlerinizi girin',
    'zakat.result.below':       'Servet nisaba ulaşmadı',
    'zakat.result.due':         'Nisap karşılandı — zekat gereklidir',
    'zakat.result.pending':     'Nisap karşılandı ancak henüz havl geçmedi',
    'zakat.result.pending_note':'Servet üzerine bir hicri yıl tamamlanmadan zekat gerekli olmayabilir.',
    'zakat.result.estimate':    'Servet nisaba ulaştı — bu bir tahmindir; hicri yılı (Havl) doğrulayın.',
    'zakat.result.estimate_badge':'tahmini',
    'zakat.faq.title':          'Zekat SSS',
    'zakat.faq.q1':             'Para zekatı nasıl hesaplanır?',
    'zakat.faq.a1':             'Servet nisaba ulaşırsa ve üzerinden bir hicri yıl (havl) geçerse, zekat net zekata tabi servetin %2,5\\u2019i olarak hesaplanır.',
    'zakat.faq.q2':             'Para zekatının oranı nedir?',
    'zakat.faq.a2':             'Para zekatının oranı genellikle %2,5\\u2019tir.',
    'zakat.faq.q3':             'Maaştan zekat gerekir mi?',
    'zakat.faq.a3':             `Maaşın kendisi alındığı anda zekata tabi değildir, ancak ondan biriktirilen, nisaba ulaşan ve üzerinden tam bir hicri yıl geçen miktar zekat hesaplamasına dahil edilir.`,
    'zakat.faq.q4':             'Altın zekata tabi midir?',
    'zakat.faq.a4':             'Altın nisaba ulaştığında zekata tabidir. Kişisel takı altınında fıkhî görüş farklılıkları vardır; bu nedenle takip ettiğiniz fetvaya başvurun.',
    'zakat.faq.q5':             'Hisse senetlerinden zekat gerekir mi?',
    'zakat.faq.a5':             'Evet, niyetinize göre (uzun vadeli yatırım, spekülasyon veya ticaret) hisse senetlerinden zekat gerekebilir. Hesaplayıcının yatırımlar bölümüne dahil edebilirsiniz.',
    'zakat.faq.q6':             'Borçları zekattan düşmeli miyim?',
    'zakat.faq.a6':             'Bazı vadesi gelmiş borçlar düşülebilir, ancak detaylar borç türüne ve zamanlamasına göre değişir — bu hesaplayıcı genel bir tahmin sunar.',
    'zakat.faq.q7':             'Bu hesaplayıcı bir alimle danışmanın yerini tutar mı?',
    'zakat.faq.a7':             'Hayır, hesaplayıcı tahmin yapmanıza yardımcı olur, ancak özel veya karmaşık durumlarda bilgili bir alime danışmanın yerini tutmaz.',
    'zakat.howto.step1':        'Nisabı belirleyin — piyasa fiyatından 85 g altın veya 595 g gümüş.',
    'zakat.howto.step2':        'Tüm zekata tabi servetinizi toplayın (nakit + altın + yatırımlar + alacaklar).',
    'zakat.howto.step3':        'Net zekata tabi serveti elde etmek için borçlarınızı çıkarın.',
    'zakat.howto.step4':        'Nisaba ulaştıysa ve havl geçtiyse net serveti × %2,5 ile çarpın.',
  },
  ur: {
    'zakat.hero.title':         'زکوٰۃ کیلکولیٹر',
    'zakat.hero.subtitle':      'اپنی نقدی، بچت، سونے اور حصص پر زکوٰۃ آسانی سے حساب کریں — واضح نصاب اور 2.5% کی شرح کے ساتھ۔',
    'zakat.hero.badge_percent': 'شرح: 2.5%',
    'zakat.hero.badge_nisab':   'نصاب: 85 گرام سونا یا 595 گرام چاندی',
    'zakat.hero.badge_hawl':    'حول: ایک قمری سال',
    'zakat.actions.reset':      'ری سیٹ کریں',
    'zakat.actions.copy':       'نتیجہ کاپی کریں',
    'zakat.actions.copied':     'کاپی ہو گیا ✓',
    'zakat.result.title':       'زکوٰۃ کا نتیجہ',
    'zakat.result.net':         'خالص زکوٰۃ والی دولت',
    'zakat.result.nisab':       'مؤثر نصاب',
    'zakat.result.amount':      'واجب الادا زکوٰۃ',
    'zakat.result.formula':     'زکوٰۃ = خالص دولت × 2.5%',
    'zakat.result.empty':       'حساب شروع کرنے کے لیے اپنی دولت کی اقدار درج کریں',
    'zakat.result.below':       'دولت نصاب تک نہیں پہنچی',
    'zakat.result.due':         'نصاب پورا ہوا — زکوٰۃ واجب ہے',
    'zakat.result.pending':     'نصاب پورا لیکن حول ابھی نہیں گزرا',
    'zakat.result.pending_note':'دولت پر مکمل قمری سال گزرنے تک زکوٰۃ واجب نہیں ہو سکتی۔',
    'zakat.result.estimate':    'دولت نصاب کو پہنچ گئی — یہ تخمینی قیمت ہے؛ قمری سال (حول) کی تصدیق کریں۔',
    'zakat.result.estimate_badge':'تخمینی',
    'zakat.faq.title':          'زکوٰۃ کے کثرت سے پوچھے جانے والے سوالات',
    'zakat.faq.q1':             'مال کی زکوٰۃ کیسے حساب کی جائے؟',
    'zakat.faq.a1':             'اگر دولت نصاب کو پہنچ جائے اور اس پر مکمل قمری سال (حول) گزر جائے، تو زکوٰۃ خالص زکوٰۃ والی دولت کا 2.5% حساب کی جاتی ہے۔',
    'zakat.faq.q2':             'مال کی زکوٰۃ کی شرح کیا ہے؟',
    'zakat.faq.a2':             'مال کی زکوٰۃ کی شرح عام طور پر 2.5% ہے۔',
    'zakat.faq.q3':             'کیا تنخواہ پر زکوٰۃ واجب ہے؟',
    'zakat.faq.a3':             'تنخواہ خود ملنے پر اس پر زکوٰۃ واجب نہیں، مگر اس میں سے جو رقم بچائی جائے اور نصاب کو پہنچ کر اس پر قمری سال گزر جائے، وہ زکوٰۃ کے حساب میں شامل ہو گی۔',
    'zakat.faq.q4':             'کیا سونے پر زکوٰۃ ہے؟',
    'zakat.faq.a4':             'سونا نصاب کو پہنچتے ہی زکوٰۃ کا تابع ہو جاتا ہے۔ ذاتی زیورات کے سونے میں فقہی اختلاف ہے، لہٰذا اپنی مستند فتویٰ کی پیروی کریں۔',
    'zakat.faq.q5':             'کیا حصص پر زکوٰۃ واجب ہے؟',
    'zakat.faq.a5':             'جی ہاں، نیت کے مطابق (طویل مدتی سرمایہ کاری، چھوٹی مدت یا تجارت) حصص پر زکوٰۃ واجب ہو سکتی ہے۔ آپ انہیں کیلکولیٹر کے سرمایہ کاری حصے میں شامل کر سکتے ہیں۔',
    'zakat.faq.q6':             'کیا قرضوں کو زکوٰۃ سے گھٹایا جائے؟',
    'zakat.faq.a6':             'کچھ واجب الادا قرض گھٹائے جا سکتے ہیں، مگر تفصیل قرض کی نوعیت اور وقت پر منحصر ہے — یہ کیلکولیٹر صرف عمومی تخمینہ پیش کرتا ہے۔',
    'zakat.faq.q7':             'کیا یہ کیلکولیٹر مفتی سے مشورے کا نعم البدل ہے؟',
    'zakat.faq.a7':             'نہیں، کیلکولیٹر صرف تخمینے میں مدد دیتا ہے، یہ خاص یا پیچیدہ معاملات میں کسی عالم سے مشورہ لینے کا متبادل نہیں۔',
    'zakat.howto.step1':        'نصاب کا تعیّن کریں — مارکیٹ ریٹ پر 85 گرام سونا یا 595 گرام چاندی۔',
    'zakat.howto.step2':        'اپنی تمام زکوٰۃ والی دولت جمع کریں (نقد + سونا + سرمایہ کاری + آپ کے واجبات)۔',
    'zakat.howto.step3':        'خالص زکوٰۃ والی دولت حاصل کرنے کے لیے اپنے واجب الادا قرض گھٹائیں۔',
    'zakat.howto.step4':        'اگر نصاب پورا ہو اور حول گزر چکا ہو، تو خالص دولت × 2.5% ضرب دیں۔',
  },
  de: {
    'zakat.hero.title':         'Zakat-Rechner',
    'zakat.hero.subtitle':      'Berechnen Sie Ihre Zakat auf Geld, Ersparnisse, Gold und Aktien einfach — mit klarem Nisab und 2,5 % Zakatsatz.',
    'zakat.hero.badge_percent': 'Satz: 2,5 %',
    'zakat.hero.badge_nisab':   'Nisab: 85 g Gold oder 595 g Silber',
    'zakat.hero.badge_hawl':    'Hawl: ein Mondjahr',
    'zakat.actions.reset':      'Zurücksetzen',
    'zakat.actions.copy':       'Ergebnis kopieren',
    'zakat.actions.copied':     'Kopiert ✓',
    'zakat.result.title':       'Zakat-Ergebnis',
    'zakat.result.net':         'Nettes zakatpflichtiges Vermögen',
    'zakat.result.nisab':       'Effektiver Nisab',
    'zakat.result.amount':      'Fällige Zakat',
    'zakat.result.formula':     'Zakat = Nettovermögen × 2,5 %',
    'zakat.result.empty':       'Geben Sie Ihre Vermögenswerte ein, um die Berechnung zu starten',
    'zakat.result.below':       'Vermögen hat den Nisab nicht erreicht',
    'zakat.result.due':         'Nisab erreicht — Zakat ist fällig',
    'zakat.result.pending':     'Nisab erreicht, aber das Hawl ist noch nicht vergangen',
    'zakat.result.pending_note':'Zakat ist möglicherweise erst fällig, wenn ein vollständiges Mondjahr auf dem Vermögen vergangen ist.',
    'zakat.result.estimate':    'Vermögen erreicht den Nisab — dies ist eine Schätzung; bitte das Mondjahr (Hawl) überprüfen.',
    'zakat.result.estimate_badge':'ca.',
    'zakat.faq.title':          'Häufige Fragen zur Zakat',
    'zakat.faq.q1':             'Wie berechne ich die Zakat auf Geld?',
    'zakat.faq.a1':             'Wenn das Vermögen den Nisab erreicht und ein vollständiges Mondjahr (Hawl) vergangen ist, wird die Zakat mit 2,5 % des nettos zakatpflichtigen Vermögens berechnet.',
    'zakat.faq.q2':             'Wie hoch ist der Zakat-Satz auf Geld?',
    'zakat.faq.a2':             'Der Zakat-Satz auf Geld beträgt in der Regel 2,5 %.',
    'zakat.faq.q3':             'Ist Zakat auf das Gehalt fällig?',
    'zakat.faq.a3':             'Das Gehalt selbst unterliegt nicht der Zakat bei Empfang, aber alles, was davon gespart wird, den Nisab erreicht und worauf ein vollständiges Mondjahr vergeht, fließt in die Zakat-Berechnung ein.',
    'zakat.faq.q4':             'Ist Gold zakatpflichtig?',
    'zakat.faq.a4':             'Gold ist zakatpflichtig, sobald es den Nisab erreicht. Bei persönlichem Schmuckgold gibt es fiqh-Unterschiede; folgen Sie der Fatwa, der Sie folgen.',
    'zakat.faq.q5':             'Ist Zakat auf Aktien fällig?',
    'zakat.faq.a5':             'Ja, Zakat kann je nach Absicht auf Aktien fällig werden (langfristige Anlage, Spekulation oder Handel). Sie können sie im Investitionsbereich des Rechners einbeziehen.',
    'zakat.faq.q6':             'Sollte ich Schulden von der Zakat abziehen?',
    'zakat.faq.a6':             'Einige fällige Schulden können abgezogen werden, aber Details variieren je nach Schuldenart und Zeitpunkt — dieser Rechner liefert eine allgemeine Schätzung.',
    'zakat.faq.q7':             'Ersetzt dieser Rechner die Beratung durch einen Gelehrten?',
    'zakat.faq.a7':             'Nein, der Rechner hilft Ihnen bei der Schätzung, ersetzt aber nicht die Beratung durch einen kundigen Gelehrten in besonderen oder komplexen Fällen.',
    'zakat.howto.step1':        'Bestimmen Sie den Nisab — 85 g Gold oder 595 g Silber zum Marktpreis.',
    'zakat.howto.step2':        'Summieren Sie Ihr gesamtes zakatpflichtiges Vermögen (Bargeld + Gold + Investitionen + Forderungen).',
    'zakat.howto.step3':        'Ziehen Sie Ihre fälligen Schulden ab, um das nettos zakatpflichtige Vermögen zu erhalten.',
    'zakat.howto.step4':        'Multiplizieren Sie das Nettovermögen × 2,5 %, wenn es den Nisab erreicht und das Hawl vergangen ist.',
  },
  id: {
    'zakat.hero.title':         'Kalkulator Zakat',
    'zakat.hero.subtitle':      'Hitung zakat atas uang, tabungan, emas, dan saham Anda dengan mudah — dengan nisab yang jelas dan tarif zakat 2,5%.',
    'zakat.hero.badge_percent': 'Tarif: 2,5%',
    'zakat.hero.badge_nisab':   'Nisab: 85g emas atau 595g perak',
    'zakat.hero.badge_hawl':    'Haul: satu tahun hijriah',
    'zakat.actions.reset':      'Atur ulang',
    'zakat.actions.copy':       'Salin hasil',
    'zakat.actions.copied':     'Disalin ✓',
    'zakat.result.title':       'Hasil Zakat',
    'zakat.result.net':         'Harta bersih wajib zakat',
    'zakat.result.nisab':       'Nisab efektif',
    'zakat.result.amount':      'Zakat yang wajib',
    'zakat.result.formula':     'Zakat = Harta bersih × 2,5%',
    'zakat.result.empty':       'Masukkan nilai harta Anda untuk memulai perhitungan',
    'zakat.result.below':       'Harta belum mencapai nisab',
    'zakat.result.due':         'Nisab terpenuhi — zakat wajib',
    'zakat.result.pending':     'Nisab terpenuhi tetapi haul belum berlalu',
    'zakat.result.pending_note':'Zakat mungkin belum wajib hingga satu tahun hijriah penuh berlalu pada harta.',
    'zakat.result.estimate':    'Harta mencapai nisab — ini perkiraan; mohon verifikasi tahun hijriah (haul).',
    'zakat.result.estimate_badge':'perk.',
    'zakat.faq.title':          'Tanya Jawab Seputar Zakat',
    'zakat.faq.q1':             'Bagaimana cara menghitung zakat harta?',
    'zakat.faq.a1':             'Jika harta mencapai nisab dan telah berlalu satu tahun hijriah penuh (haul), zakat dihitung sebesar 2,5% dari harta bersih wajib zakat.',
    'zakat.faq.q2':             'Berapa tarif zakat harta?',
    'zakat.faq.a2':             'Tarif zakat harta umumnya adalah 2,5%.',
    'zakat.faq.q3':             'Apakah gaji wajib dizakati?',
    'zakat.faq.a3':             'Gaji itu sendiri tidak wajib zakat saat diterima, tetapi tabungan darinya yang mencapai nisab dan dilewati satu tahun hijriah penuh masuk dalam perhitungan zakat.',
    'zakat.faq.q4':             'Apakah emas wajib dizakati?',
    'zakat.faq.a4':             'Emas wajib dizakati ketika telah mencapai nisab. Emas perhiasan pribadi memiliki perbedaan fikih, jadi rujuklah fatwa yang Anda ikuti.',
    'zakat.faq.q5':             'Apakah saham wajib dizakati?',
    'zakat.faq.a5':             'Ya, zakat dapat wajib pada saham tergantung niat (investasi jangka panjang, spekulasi, atau perdagangan). Saham bisa dimasukkan dalam bagian investasi pada kalkulator.',
    'zakat.faq.q6':             'Apakah utang dipotong dari zakat?',
    'zakat.faq.a6':             'Beberapa utang yang jatuh tempo dapat dipotong, tetapi rincinya berbeda menurut jenis dan waktu utang — kalkulator ini memberikan perkiraan umum.',
    'zakat.faq.q7':             'Apakah kalkulator ini menggantikan konsultasi dengan ulama?',
    'zakat.faq.a7':             'Tidak, kalkulator ini membantu Anda memperkirakan, tetapi tidak menggantikan konsultasi dengan ulama yang kompeten dalam kasus khusus atau kompleks.',
    'zakat.howto.step1':        'Tentukan nisab — 85g emas atau 595g perak pada harga pasar.',
    'zakat.howto.step2':        'Jumlahkan seluruh harta wajib zakat Anda (uang tunai + emas + investasi + piutang).',
    'zakat.howto.step3':        'Kurangkan utang yang Anda tanggung untuk mendapatkan harta bersih wajib zakat.',
    'zakat.howto.step4':        'Kalikan harta bersih × 2,5% jika telah mencapai nisab dan haul telah berlalu.',
  },
  es: {
    'zakat.hero.title':         'Calculadora de Zakat',
    'zakat.hero.subtitle':      'Calcula la zakat sobre tu dinero, ahorros, oro e inversiones fácilmente — con un nisab claro y la tasa del 2,5 %.',
    'zakat.hero.badge_percent': 'Tasa: 2,5 %',
    'zakat.hero.badge_nisab':   'Nisab: 85 g de oro o 595 g de plata',
    'zakat.hero.badge_hawl':    'Hawl: un año lunar',
    'zakat.actions.reset':      'Restablecer',
    'zakat.actions.copy':       'Copiar resultado',
    'zakat.actions.copied':     'Copiado ✓',
    'zakat.result.title':       'Resultado de la Zakat',
    'zakat.result.net':         'Patrimonio neto zakatable',
    'zakat.result.nisab':       'Nisab efectivo',
    'zakat.result.amount':      'Zakat a pagar',
    'zakat.result.formula':     'Zakat = Patrimonio neto × 2,5 %',
    'zakat.result.empty':       'Introduzca sus valores de patrimonio para iniciar el cálculo',
    'zakat.result.below':       'El patrimonio no ha alcanzado el nisab',
    'zakat.result.due':         'Nisab alcanzado — la zakat es obligatoria',
    'zakat.result.pending':     'Nisab alcanzado pero el Hawl aún no ha transcurrido',
    'zakat.result.pending_note':'La zakat puede no ser obligatoria hasta que transcurra un año lunar completo sobre el patrimonio.',
    'zakat.result.estimate':    'El patrimonio alcanza el nisab — esto es una estimación; por favor verifique el año lunar (Hawl).',
    'zakat.result.estimate_badge':'aprox.',
    'zakat.faq.title':          'Preguntas frecuentes sobre la Zakat',
    'zakat.faq.q1':             '¿Cómo calculo la zakat sobre el dinero?',
    'zakat.faq.a1':             'Si el patrimonio alcanza el nisab y ha transcurrido un año lunar completo (Hawl), la zakat se calcula al 2,5 % del patrimonio neto zakatable.',
    'zakat.faq.q2':             '¿Cuál es la tasa de la zakat sobre el dinero?',
    'zakat.faq.a2':             'La tasa de la zakat sobre el dinero es generalmente del 2,5 %.',
    'zakat.faq.q3':             '¿Se debe pagar zakat sobre el salario?',
    'zakat.faq.a3':             'El salario en sí no está sujeto a la zakat al recibirlo, pero lo que se ahorra de él, alcanza el nisab y sobre el que pasa un año lunar completo entra en el cálculo de la zakat.',
    'zakat.faq.q4':             '¿Se paga zakat sobre el oro?',
    'zakat.faq.a4':             'El oro está sujeto a la zakat una vez que alcanza el nisab. El oro de joyería personal presenta diferencias fiqh, por lo que conviene consultar la fatwa que sigue.',
    'zakat.faq.q5':             '¿Se paga zakat sobre las acciones?',
    'zakat.faq.a5':             'Sí, la zakat puede deberse sobre las acciones según la intención (inversión a largo plazo, especulación o comercio). Pueden incluirse en la sección de inversiones de la calculadora.',
    'zakat.faq.q6':             '¿Debo deducir las deudas de la zakat?',
    'zakat.faq.a6':             'Algunas deudas vencidas pueden deducirse, pero los detalles varían según el tipo y el momento de la deuda — esta calculadora ofrece una estimación general.',
    'zakat.faq.q7':             '¿Esta calculadora reemplaza la consulta a un erudito?',
    'zakat.faq.a7':             'No, la calculadora le ayuda a estimar, pero no reemplaza la consulta a un erudito competente en casos especiales o complejos.',
    'zakat.howto.step1':        'Determine el nisab — 85 g de oro o 595 g de plata al precio del mercado.',
    'zakat.howto.step2':        'Sume todo su patrimonio zakatable (efectivo + oro + inversiones + cuentas por cobrar).',
    'zakat.howto.step3':        'Reste sus deudas vencidas para obtener el patrimonio neto zakatable.',
    'zakat.howto.step4':        'Multiplique el patrimonio neto × 2,5 % si alcanza el nisab y ha pasado el Hawl.',
  },
  bn: {
    'zakat.hero.title':         'যাকাত ক্যালকুলেটর',
    'zakat.hero.subtitle':      'আপনার নগদ অর্থ, সঞ্চয়, স্বর্ণ ও শেয়ারের যাকাত সহজে গণনা করুন — স্পষ্ট নিসাব ও ২.৫% হারে।',
    'zakat.hero.badge_percent': 'হার: ২.৫%',
    'zakat.hero.badge_nisab':   'নিসাব: ৮৫ গ্রাম স্বর্ণ বা ৫৯৫ গ্রাম রৌপ্য',
    'zakat.hero.badge_hawl':    'হাওল: এক চান্দ্র বছর',
    'zakat.actions.reset':      'রিসেট করুন',
    'zakat.actions.copy':       'ফলাফল কপি করুন',
    'zakat.actions.copied':     'কপি হয়েছে ✓',
    'zakat.result.title':       'যাকাতের ফলাফল',
    'zakat.result.net':         'নিট যাকাতযোগ্য সম্পদ',
    'zakat.result.nisab':       'কার্যকর নিসাব',
    'zakat.result.amount':      'প্রদেয় যাকাত',
    'zakat.result.formula':     'যাকাত = নিট সম্পদ × ২.৫%',
    'zakat.result.empty':       'গণনা শুরু করতে আপনার সম্পদের মূল্য লিখুন',
    'zakat.result.below':       'সম্পদ নিসাব পর্যন্ত পৌঁছায়নি',
    'zakat.result.due':         'নিসাব পূর্ণ হয়েছে — যাকাত ফরজ',
    'zakat.result.pending':     'নিসাব পূর্ণ কিন্তু হাওল এখনও পার হয়নি',
    'zakat.result.pending_note':'সম্পদের উপর পূর্ণ এক চান্দ্র বছর পার না হওয়া পর্যন্ত যাকাত ফরজ নাও হতে পারে।',
    'zakat.result.estimate':    'সম্পদ নিসাব পর্যন্ত পৌঁছেছে — এটি একটি আনুমানিক হিসাব; চান্দ্র বছর (হাওল) যাচাই করুন।',
    'zakat.result.estimate_badge':'আনুমানিক',
    'zakat.faq.title':          'যাকাত সম্পর্কে সাধারণ প্রশ্ন',
    'zakat.faq.q1':             'অর্থের যাকাত কীভাবে গণনা করব?',
    'zakat.faq.a1':             'সম্পদ নিসাবে পৌঁছালে এবং তার উপর পূর্ণ এক চান্দ্র বছর (হাওল) পার হলে, যাকাত নিট যাকাতযোগ্য সম্পদের ২.৫% হিসেবে গণনা করা হয়।',
    'zakat.faq.q2':             'অর্থের যাকাতের হার কত?',
    'zakat.faq.a2':             'অর্থের যাকাতের হার সাধারণত ২.৫%।',
    'zakat.faq.q3':             'বেতনের উপর যাকাত ফরজ?',
    'zakat.faq.a3':             'বেতন প্রাপ্তির সাথে সাথেই তার উপর যাকাত ফরজ নয়, তবে তা থেকে যা সঞ্চয় করা হয় এবং নিসাবে পৌঁছে তার উপর পূর্ণ এক চান্দ্র বছর পার হয়, তা যাকাত গণনায় অন্তর্ভুক্ত হয়।',
    'zakat.faq.q4':             'স্বর্ণের উপর যাকাত আছে কি?',
    'zakat.faq.a4':             'স্বর্ণ নিসাবে পৌঁছালে যাকাতের আওতায় আসে। ব্যক্তিগত গহনার স্বর্ণে ফিকহী মতপার্থক্য আছে, তাই অনুসৃত ফতোয়ার পরামর্শ নিন।',
    'zakat.faq.q5':             'শেয়ারের উপর যাকাত প্রযোজ্য?',
    'zakat.faq.a5':             'হ্যাঁ, নিয়তের ভিত্তিতে (দীর্ঘমেয়াদী বিনিয়োগ, ফাটকা বা ব্যবসা) শেয়ারের উপর যাকাত প্রযোজ্য হতে পারে। ক্যালকুলেটরের বিনিয়োগ বিভাগে অন্তর্ভুক্ত করা যায়।',
    'zakat.faq.q6':             'যাকাত থেকে ঋণ বাদ দিতে হবে কি?',
    'zakat.faq.a6':             'কিছু পরিশোধ্য ঋণ বাদ দেওয়া যেতে পারে, তবে বিস্তারিত ঋণের ধরন ও সময়ের উপর নির্ভর করে — এই ক্যালকুলেটর সাধারণ আনুমানিক ফলাফল দেয়।',
    'zakat.faq.q7':             'এই ক্যালকুলেটর কি আলেমের পরামর্শের বিকল্প?',
    'zakat.faq.a7':             'না, ক্যালকুলেটর আপনাকে আনুমানিক হিসাব করতে সাহায্য করে, তবে বিশেষ বা জটিল ক্ষেত্রে জ্ঞানী আলেমের পরামর্শের বিকল্প নয়।',
    'zakat.howto.step1':        'নিসাব নির্ধারণ করুন — বাজার দরে ৮৫ গ্রাম স্বর্ণ বা ৫৯৫ গ্রাম রৌপ্য।',
    'zakat.howto.step2':        'আপনার সমস্ত যাকাতযোগ্য সম্পদ যোগ করুন (নগদ + স্বর্ণ + বিনিয়োগ + পাওনা)।',
    'zakat.howto.step3':        'নিট যাকাতযোগ্য সম্পদ পেতে আপনার পরিশোধ্য ঋণ বিয়োগ করুন।',
    'zakat.howto.step4':        'সম্পদ নিসাবে পৌঁছালে এবং হাওল পার হলে নিট সম্পদ × ২.৫% গুণ করুন।',
  },
  ms: {
    'zakat.hero.title':         'Kalkulator Zakat',
    'zakat.hero.subtitle':      'Kira zakat ke atas wang, simpanan, emas dan saham anda dengan mudah — dengan nisab yang jelas dan kadar 2.5%.',
    'zakat.hero.badge_percent': 'Kadar: 2.5%',
    'zakat.hero.badge_nisab':   'Nisab: 85g emas atau 595g perak',
    'zakat.hero.badge_hawl':    'Haul: satu tahun hijrah',
    'zakat.actions.reset':      'Set semula',
    'zakat.actions.copy':       'Salin keputusan',
    'zakat.actions.copied':     'Disalin ✓',
    'zakat.result.title':       'Keputusan Zakat',
    'zakat.result.net':         'Harta bersih kena zakat',
    'zakat.result.nisab':       'Nisab berkesan',
    'zakat.result.amount':      'Zakat yang wajib',
    'zakat.result.formula':     'Zakat = Harta bersih × 2.5%',
    'zakat.result.empty':       'Masukkan nilai harta anda untuk memulakan pengiraan',
    'zakat.result.below':       'Harta belum mencapai nisab',
    'zakat.result.due':         'Nisab dipenuhi — zakat wajib',
    'zakat.result.pending':     'Nisab dipenuhi tetapi haul belum berlalu',
    'zakat.result.pending_note':'Zakat mungkin belum wajib sehingga setahun hijrah penuh berlalu ke atas harta.',
    'zakat.result.estimate':    'Harta mencapai nisab — ini adalah anggaran; sila sahkan tahun hijrah (haul).',
    'zakat.result.estimate_badge':'angg.',
    'zakat.faq.title':          'Soalan Lazim tentang Zakat',
    'zakat.faq.q1':             'Bagaimana saya mengira zakat ke atas wang?',
    'zakat.faq.a1':             'Jika harta mencapai nisab dan setahun hijrah penuh (haul) telah berlalu, zakat dikira pada kadar 2.5% daripada harta bersih kena zakat.',
    'zakat.faq.q2':             'Berapakah kadar zakat ke atas wang?',
    'zakat.faq.a2':             'Kadar zakat ke atas wang biasanya ialah 2.5%.',
    'zakat.faq.q3':             'Adakah zakat dikenakan ke atas gaji?',
    'zakat.faq.a3':             'Gaji itu sendiri tidak dikenakan zakat sebaik diterima, tetapi apa yang disimpan daripadanya, mencapai nisab dan dilalui setahun hijrah penuh, termasuk dalam pengiraan zakat.',
    'zakat.faq.q4':             'Adakah emas dikenakan zakat?',
    'zakat.faq.a4':             'Emas dikenakan zakat sebaik mencapai nisab. Emas perhiasan peribadi mempunyai perbezaan fiqh; rujuklah fatwa yang anda ikuti.',
    'zakat.faq.q5':             'Adakah zakat dikenakan ke atas saham?',
    'zakat.faq.a5':             'Ya, zakat boleh dikenakan ke atas saham bergantung kepada niat (pelaburan jangka panjang, spekulasi atau perdagangan). Saham boleh dimasukkan dalam bahagian pelaburan pada kalkulator.',
    'zakat.faq.q6':             'Patutkah saya menolak hutang daripada zakat?',
    'zakat.faq.a6':             'Sebahagian hutang tertunggak boleh ditolak, tetapi butirannya berbeza mengikut jenis dan masa hutang — kalkulator ini memberikan anggaran umum.',
    'zakat.faq.q7':             'Adakah kalkulator ini menggantikan rujukan kepada ulama?',
    'zakat.faq.a7':             'Tidak, kalkulator ini membantu anda menganggar, tetapi tidak menggantikan rujukan kepada ulama yang berpengetahuan dalam kes khas atau kompleks.',
    'zakat.howto.step1':        'Tentukan nisab — 85g emas atau 595g perak pada harga pasaran.',
    'zakat.howto.step2':        'Jumlahkan semua harta kena zakat anda (tunai + emas + pelaburan + piutang).',
    'zakat.howto.step3':        'Tolak hutang yang anda tanggung untuk mendapatkan harta bersih kena zakat.',
    'zakat.howto.step4':        'Darab harta bersih × 2.5% jika nisab dipenuhi dan haul telah berlalu.',
  },
};

// Validate translation table — all 8 langs must have all 39 keys
const REQUIRED_KEYS = [
  'zakat.hero.title','zakat.hero.subtitle','zakat.hero.badge_percent',
  'zakat.hero.badge_nisab','zakat.hero.badge_hawl',
  'zakat.actions.reset','zakat.actions.copy','zakat.actions.copied',
  'zakat.result.title','zakat.result.net','zakat.result.nisab',
  'zakat.result.amount','zakat.result.formula','zakat.result.empty',
  'zakat.result.below','zakat.result.due','zakat.result.pending',
  'zakat.result.pending_note','zakat.result.estimate','zakat.result.estimate_badge',
  'zakat.faq.title',
  'zakat.faq.q1','zakat.faq.a1','zakat.faq.q2','zakat.faq.a2',
  'zakat.faq.q3','zakat.faq.a3','zakat.faq.q4','zakat.faq.a4',
  'zakat.faq.q5','zakat.faq.a5','zakat.faq.q6','zakat.faq.a6',
  'zakat.faq.q7','zakat.faq.a7',
  'zakat.howto.step1','zakat.howto.step2','zakat.howto.step3','zakat.howto.step4',
];
for (const lang of Object.keys(T)) {
  for (const k of REQUIRED_KEYS) {
    if (!(k in T[lang])) {
      throw new Error(`Translation missing: lang=${lang} key=${k}`);
    }
  }
  const extra = Object.keys(T[lang]).filter(k => !REQUIRED_KEYS.includes(k));
  if (extra.length) throw new Error(`Unexpected extra keys for ${lang}: ${extra.join(', ')}`);
}
console.log(`✓ Translation table validated: ${Object.keys(T).length} langs × ${REQUIRED_KEYS.length} keys = ${Object.keys(T).length * REQUIRED_KEYS.length} entries`);

// ─────────────────────────────────────────────────────────────
// Read source + apply
// ─────────────────────────────────────────────────────────────
const raw = readFileSync(PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);
const EOL = isCRLF ? '\r\n' : '\n';
const INDENT = '        '; // 8 spaces — matches existing format

let txt = raw;

// We anchor on each language's last legacy zakat key:
//     'zakat.cond5': '<localized>',
// And insert the new block right after this line.

// Find each lang's section start to bound our search to that lang only
const langs = Object.keys(T);
for (const lang of langs) {
  // Find anchor "zakat.cond5" within this lang section. Each section has only
  // one occurrence of zakat.cond5, so we can use the global counter check.
  const anchorRe = new RegExp(
    `(${INDENT}'zakat\\.cond5': '[^']*',)`
  );
  const anchorMatchAll = [...txt.matchAll(/'zakat\.cond5'/g)];
  // We need to find the Nth occurrence corresponding to our lang (langs are
  // listed in order: ar, en, fr, tr, ur, de, id, es, bn, ms in the file).
  // The lang index in the FILE is: ar=0, en=1, fr=2, tr=3, ur=4, de=5, id=6,
  // es=7, bn=8, ms=9. We're targeting lang ∈ {fr,tr,ur,de,id,es,bn,ms}.
  const fileLangOrder = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];
  const fileIdx = fileLangOrder.indexOf(lang);
  if (fileIdx < 0) throw new Error(`Unknown lang in file order: ${lang}`);

  // Re-count after each insertion (txt is mutated in the loop).
  // Note: TR value has escaped apostrophe (\'), so we match line-bounded
  // pattern instead of '[^']*'.
  const allMatches = [...txt.matchAll(/^[ \t]+'zakat\.cond5': '.*?',[ \t]*$/gm)];
  if (allMatches.length !== 10) {
    throw new Error(`Expected 10 zakat.cond5 occurrences (one per lang), got ${allMatches.length}`);
  }
  const m = allMatches[fileIdx];
  const matchedLine = m[0];
  const anchorPos = m.index + matchedLine.length;

  // Verify this exact anchor isn't already followed by zakat.hero (idempotency)
  const after = txt.slice(anchorPos, anchorPos + 200);
  if (/zakat\.hero\.title/.test(after)) {
    throw new Error(`Lang ${lang}: zakat.hero block already exists after anchor — aborting (script already ran?)`);
  }

  // Build the insert block
  const lines = [];
  lines.push(''); // blank — actually starts on next EOL after match line
  lines.push(`${INDENT}// ─── D3.3a — UAT-Z1 Zakat redesign keys (added in Phase D3.3a) ───`);
  for (const k of REQUIRED_KEYS) {
    const v = T[lang][k];
    // Use single quotes; escape any single quote inside value.
    const escaped = v.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    lines.push(`${INDENT}'${k}': '${escaped}',`);
  }
  const insertText = EOL + lines.join(EOL);

  txt = txt.slice(0, anchorPos) + insertText + txt.slice(anchorPos);
  console.log(`✓ Inserted ${REQUIRED_KEYS.length} keys for lang=${lang} (after file index ${fileIdx})`);
}

writeFileSync(PATH, txt);
console.log(`\n✅ js/i18n.js updated: ${langs.length * REQUIRED_KEYS.length} new entries written.`);
console.log('   Next: node --check js/i18n.js, restart preview, verify 8 langs.');
