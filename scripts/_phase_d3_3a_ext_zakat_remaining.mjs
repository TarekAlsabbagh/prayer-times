// Phase D3.3a-extended — Complete Zakat visible body localization.
// Adds 58 keys × 8 langs = 464 missing translations to js/i18n.js.
// Scope (per D3.3d audit findings — all visible to user):
//   • zakat.settings.*     (9 keys)
//   • zakat.hawl.*         (7 keys)
//   • zakat.cash.*         (5 keys)
//   • zakat.gs.*           (9 keys)
//   • zakat.invest.*       (6 keys)
//   • zakat.debts.*        (4 keys)
//   • zakat.breakdown.*    (8 keys)
//   • zakat.seo.*          (8 keys)
//   • zakat.disclaimer.*   (2 keys)
//
// Anchor: each non-AR/EN section already has 'zakat.howto.step4' as the
// last D3.3a-inserted zakat key. We insert this new block right after it.
//
// Apostrophe convention: use actual Unicode ’ (U+2019) directly as a
// character in source — NOT the ’ escape sequence (D3.3a bug).

import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\';
const PATH = ROOT + 'js/i18n.js';

// ─────────────────────────────────────────────────────────────
// Translation table (58 keys × 8 langs)
// ─────────────────────────────────────────────────────────────
const T = {
  // ════════════════════════════════ FR ════════════════════════════════
  fr: {
    // settings
    'zakat.settings.title':              'Paramètres de calcul',
    'zakat.settings.currency':           'Devise',
    'zakat.settings.nisab_type':         'Base du nissab',
    'zakat.settings.nisab_gold':         'Nissab d’or (85 g)',
    'zakat.settings.nisab_silver':       'Nissab d’argent (595 g)',
    'zakat.settings.gold_price':         'Prix de l’or au gramme',
    'zakat.settings.silver_price':       'Prix de l’argent au gramme',
    'zakat.settings.price_helper':       'Ajustez le prix au gramme selon votre marché local.',
    'zakat.settings.price_approx_badge': 'approx.',
    // hawl
    'zakat.hawl.title':       'Une année lunaire complète (Hawl) s’est-elle écoulée sur le patrimoine ?',
    'zakat.hawl.yes':         'Oui',
    'zakat.hawl.no':          'Non',
    'zakat.hawl.unsure':      'Pas sûr',
    'zakat.hawl.note_yes':    'La zakat sera calculée si le patrimoine atteint le nissab.',
    'zakat.hawl.note_no':     'La zakat n’est peut-être pas encore due si une année lunaire complète n’a pas passé sur le patrimoine, sauf cas particuliers.',
    'zakat.hawl.note_unsure': 'Vous pouvez utiliser la calculatrice pour obtenir une estimation, puis vérifier la date d’acquisition du patrimoine ou consulter un savant de confiance.',
    // cash
    'zakat.cash.title':   'Liquidités et épargne',
    'zakat.cash.cash':    'Liquidités disponibles',
    'zakat.cash.bank':    'Comptes bancaires',
    'zakat.cash.savings': 'Épargne',
    'zakat.cash.note':    'Saisissez les fonds que vous possédez réellement au moment de la zakat.',
    // gs
    'zakat.gs.title':        'Or et argent',
    'zakat.gs.gold':         'Or',
    'zakat.gs.silver':       'Argent',
    'zakat.gs.gold_value':   'Valeur de l’or',
    'zakat.gs.silver_value': 'Valeur de l’argent',
    'zakat.gs.by_value':     'Par valeur',
    'zakat.gs.by_weight':    'Par poids',
    'zakat.gs.weight_grams': 'Poids (grammes)',
    'zakat.gs.note':         'L’or de bijoux personnels présente des divergences fiqhiques ; le calcul peut varier selon la fatwa que vous suivez.',
    // invest
    'zakat.invest.title':       'Investissements et marchandises',
    'zakat.invest.stocks':      'Actions et investissements',
    'zakat.invest.trade':       'Marchandises',
    'zakat.invest.property':    'Biens immobiliers à vendre',
    'zakat.invest.receivables': 'Sommes qui vous sont dues',
    'zakat.invest.note':        'Les biens utilisés comme résidence ou pour usage personnel ne sont généralement pas inclus ; les biens détenus en vue de la vente sont inclus à leur valeur de marché.',
    // debts
    'zakat.debts.title':       'Dettes et déductions',
    'zakat.debts.debts':       'Dettes que vous devez',
    'zakat.debts.obligations': 'Obligations à court terme',
    'zakat.debts.note':        'Les règles de déduction des dettes varient selon le type et l’échéance ; cette calculatrice fournit une estimation générale.',
    // breakdown
    'zakat.breakdown.title':         'Détail du calcul',
    'zakat.breakdown.cash_total':    'Total liquidités',
    'zakat.breakdown.gs_total':      'Total or et argent',
    'zakat.breakdown.invest_total':  'Total investissements et commerce',
    'zakat.breakdown.debts_total':   'Dettes déduites',
    'zakat.breakdown.net':           'Patrimoine net zakatable',
    'zakat.breakdown.nisab':         'Nissab',
    'zakat.breakdown.amount':        'Zakat due',
    // seo
    'zakat.seo.h1':       'Comment calcule-t-on la zakat sur l’argent ?',
    'zakat.seo.h1_body':  'La zakat est généralement calculée à 2,5 % du patrimoine net zakatable lorsque celui-ci atteint le nissab et qu’une année lunaire complète (Hawl) s’est écoulée. Formule : Zakat = Patrimoine net × 2,5 %.',
    'zakat.seo.h2':       'Qu’est-ce que le nissab de la zakat ?',
    'zakat.seo.h2_body':  'Le nissab est le seuil minimum de patrimoine qui rend la zakat obligatoire une fois le Hawl écoulé. Il est généralement estimé à l’équivalent de 85 grammes d’or ou 595 grammes d’argent.',
    'zakat.seo.h3':       'Quels biens entrent dans le calcul de la zakat ?',
    'zakat.seo.h3_body':  '<li>Liquidités, comptes bancaires et épargne</li><li>Or et argent</li><li>Marchandises et stocks de commerce</li><li>Actions et investissements</li><li>Biens immobiliers détenus pour la vente</li>',
    'zakat.seo.h4':       'Quels biens sont généralement exclus ?',
    'zakat.seo.h4_body':  '<li>Résidence personnelle</li><li>Véhicule personnel</li><li>Mobilier et effets personnels</li><li>Biens non destinés à la vente</li><li>Outils utilisés pour le travail, non pour la vente</li>',
    // disclaimer
    'zakat.disclaimer.title': 'Avertissement important',
    'zakat.disclaimer.body':  'Cette calculatrice fournit une estimation générale de la zakat à partir de vos données. Certains détails peuvent varier selon le type de patrimoine, les dettes, l’or, les actions ou la fatwa suivie dans votre pays. Pour les cas particuliers, consultez un savant de confiance.',
  },
  // ════════════════════════════════ TR ════════════════════════════════
  tr: {
    'zakat.settings.title':              'Hesaplama Ayarları',
    'zakat.settings.currency':           'Para birimi',
    'zakat.settings.nisab_type':         'Nisap esası',
    'zakat.settings.nisab_gold':         'Altın nisabı (85 g)',
    'zakat.settings.nisab_silver':       'Gümüş nisabı (595 g)',
    'zakat.settings.gold_price':         'Gram altın fiyatı',
    'zakat.settings.silver_price':       'Gram gümüş fiyatı',
    'zakat.settings.price_helper':       'Gram başına fiyatı yerel piyasanıza göre ayarlayın.',
    'zakat.settings.price_approx_badge': 'tahmini',
    'zakat.hawl.title':       'Servet üzerinde tam bir hicri yıl (havl) geçti mi?',
    'zakat.hawl.yes':         'Evet',
    'zakat.hawl.no':          'Hayır',
    'zakat.hawl.unsure':      'Emin değilim',
    'zakat.hawl.note_yes':    'Servet nisaba ulaşırsa zekat hesaplanacaktır.',
    'zakat.hawl.note_no':     'Özel durumlar dışında, servet üzerinde tam bir hicri yıl geçmediyse zekat henüz vacip olmayabilir.',
    'zakat.hawl.note_unsure': 'Hesaplayıcıyı tahmin için kullanabilir, sonra servetin edinilme tarihini gözden geçirebilir veya güvenilir bir alime danışabilirsiniz.',
    'zakat.cash.title':   'Nakit ve birikim',
    'zakat.cash.cash':    'Eldeki nakit',
    'zakat.cash.bank':    'Banka hesapları',
    'zakat.cash.savings': 'Birikim',
    'zakat.cash.note':    'Zekat zamanında fiilen sahip olduğunuz parayı girin.',
    'zakat.gs.title':        'Altın ve gümüş',
    'zakat.gs.gold':         'Altın',
    'zakat.gs.silver':       'Gümüş',
    'zakat.gs.gold_value':   'Altın değeri',
    'zakat.gs.silver_value': 'Gümüş değeri',
    'zakat.gs.by_value':     'Değere göre',
    'zakat.gs.by_weight':    'Ağırlığa göre',
    'zakat.gs.weight_grams': 'Ağırlık (gram)',
    'zakat.gs.note':         'Kişisel takı altınında fıkhî farklılıklar bulunur; hesap, takip ettiğiniz fetvaya göre değişebilir.',
    'zakat.invest.title':       'Yatırımlar ve ticari mallar',
    'zakat.invest.stocks':      'Hisse senetleri ve yatırımlar',
    'zakat.invest.trade':       'Ticari mallar',
    'zakat.invest.property':    'Satılık gayrimenkul',
    'zakat.invest.receivables': 'Size ait alacaklar',
    'zakat.invest.note':        'İkamet veya kişisel kullanım için tutulan mülkler genellikle dahil edilmez; satılık gayrimenkuller piyasa değeriyle dahildir.',
    'zakat.debts.title':       'Borçlar ve indirimler',
    'zakat.debts.debts':       'Sizden alınması gereken borçlar',
    'zakat.debts.obligations': 'Yakın vadeli yükümlülükler',
    'zakat.debts.note':        'Borç indirimi kuralları borç türü ve zamanlamasına göre değişir; bu hesaplayıcı genel bir tahmin sunar.',
    'zakat.breakdown.title':         'Hesap dökümü',
    'zakat.breakdown.cash_total':    'Nakit toplamı',
    'zakat.breakdown.gs_total':      'Altın ve gümüş toplamı',
    'zakat.breakdown.invest_total':  'Yatırım ve ticaret toplamı',
    'zakat.breakdown.debts_total':   'İndirilen borçlar',
    'zakat.breakdown.net':           'Net zekata tabi servet',
    'zakat.breakdown.nisab':         'Nisap',
    'zakat.breakdown.amount':        'Verilecek zekat',
    'zakat.seo.h1':       'Para zekatı nasıl hesaplanır?',
    'zakat.seo.h1_body':  'Zekat genellikle servet nisaba ulaşıp tam bir hicri yıl (havl) geçtiğinde net zekata tabi servetin %2,5\'i olarak hesaplanır. Formül: Zekat = Net servet × %2,5.',
    'zakat.seo.h2':       'Zekatın nisabı nedir?',
    'zakat.seo.h2_body':  'Nisap, havl tamamlandığında zekatı vacip kılan asgari servet miktarıdır. Genellikle 85 gram altın veya 595 gram gümüş karşılığı olarak hesaplanır.',
    'zakat.seo.h3':       'Hangi mallar zekat hesabına dahildir?',
    'zakat.seo.h3_body':  '<li>Nakit, banka hesapları ve birikim</li><li>Altın ve gümüş</li><li>Ticari mallar ve emtia</li><li>Hisse senetleri ve yatırımlar</li><li>Satılık gayrimenkul</li>',
    'zakat.seo.h4':       'Hangi mallar genellikle hariç tutulur?',
    'zakat.seo.h4_body':  '<li>Kişisel ikametgâh</li><li>Kişisel araç</li><li>Mobilya ve kişisel eşyalar</li><li>Satılık olmayan mülkler</li><li>İş için kullanılan, satılmayan aletler</li>',
    'zakat.disclaimer.title': 'Önemli uyarı',
    'zakat.disclaimer.body':  'Bu hesaplayıcı, girdilerinize dayalı genel bir zekat tahmini sunar. Servet türü, borçlar, altın, hisse senetleri veya ülkenizde takip edilen fetvaya göre bazı ayrıntılar değişebilir. Özel durumlar için güvenilir bir alime danışın.',
  },
  // ════════════════════════════════ UR ════════════════════════════════
  ur: {
    'zakat.settings.title':              'حساب کی ترتیبات',
    'zakat.settings.currency':           'کرنسی',
    'zakat.settings.nisab_type':         'نصاب کی بنیاد',
    'zakat.settings.nisab_gold':         'سونے کا نصاب (85 گرام)',
    'zakat.settings.nisab_silver':       'چاندی کا نصاب (595 گرام)',
    'zakat.settings.gold_price':         'فی گرام سونے کی قیمت',
    'zakat.settings.silver_price':       'فی گرام چاندی کی قیمت',
    'zakat.settings.price_helper':       'مقامی مارکیٹ کے مطابق فی گرام قیمت ایڈجسٹ کریں۔',
    'zakat.settings.price_approx_badge': 'تخمینی',
    'zakat.hawl.title':       'کیا دولت پر مکمل قمری سال (حول) گزر چکا ہے؟',
    'zakat.hawl.yes':         'ہاں',
    'zakat.hawl.no':          'نہیں',
    'zakat.hawl.unsure':      'یقین نہیں',
    'zakat.hawl.note_yes':    'اگر دولت نصاب تک پہنچے تو زکوٰۃ کا حساب کیا جائے گا۔',
    'zakat.hawl.note_no':     'خاص حالات کے سوا، اگر دولت پر مکمل قمری سال نہ گزرا ہو تو زکوٰۃ ابھی واجب نہیں ہو سکتی۔',
    'zakat.hawl.note_unsure': 'آپ تخمینی مقدار جاننے کے لیے کیلکولیٹر استعمال کر سکتے ہیں، پھر دولت کے ملکیت کی تاریخ کا جائزہ لیں یا کسی معتمد عالم سے رجوع کریں۔',
    'zakat.cash.title':   'نقدی اور بچت',
    'zakat.cash.cash':    'دستیاب نقدی',
    'zakat.cash.bank':    'بینک اکاؤنٹس',
    'zakat.cash.savings': 'بچت',
    'zakat.cash.note':    'زکوٰۃ کے وقت آپ کے پاس فعلی طور پر موجود رقم درج کریں۔',
    'zakat.gs.title':        'سونا اور چاندی',
    'zakat.gs.gold':         'سونا',
    'zakat.gs.silver':       'چاندی',
    'zakat.gs.gold_value':   'سونے کی قیمت',
    'zakat.gs.silver_value': 'چاندی کی قیمت',
    'zakat.gs.by_value':     'قیمت کے لحاظ سے',
    'zakat.gs.by_weight':    'وزن کے لحاظ سے',
    'zakat.gs.weight_grams': 'وزن (گرام)',
    'zakat.gs.note':         'ذاتی زیورات کے سونے میں فقہی اختلافات ہیں؛ آپ کی پیروی کردہ فتویٰ کے مطابق حساب مختلف ہو سکتا ہے۔',
    'zakat.invest.title':       'سرمایہ کاری اور تجارتی سامان',
    'zakat.invest.stocks':      'حصص اور سرمایہ کاری',
    'zakat.invest.trade':       'تجارتی سامان',
    'zakat.invest.property':    'فروخت کے لیے رکھی گئی جائیداد',
    'zakat.invest.receivables': 'آپ کے واجبات',
    'zakat.invest.note':        'رہائش یا ذاتی استعمال کی جائیداد عام طور پر شامل نہیں ہوتی؛ فروخت کے لیے رکھی گئی جائیداد بازار کی قیمت پر شامل ہوتی ہے۔',
    'zakat.debts.title':       'قرضے اور کٹوتیاں',
    'zakat.debts.debts':       'آپ پر واجب الادا قرض',
    'zakat.debts.obligations': 'قریب الوقت ذمہ داریاں',
    'zakat.debts.note':        'قرضوں کی کٹوتی کے قواعد قرض کی قسم اور وقت پر منحصر ہیں؛ یہ کیلکولیٹر صرف عمومی تخمینہ پیش کرتا ہے۔',
    'zakat.breakdown.title':         'حساب کی تفصیل',
    'zakat.breakdown.cash_total':    'نقدی کا مجموعہ',
    'zakat.breakdown.gs_total':      'سونے اور چاندی کا مجموعہ',
    'zakat.breakdown.invest_total':  'سرمایہ کاری اور تجارت کا مجموعہ',
    'zakat.breakdown.debts_total':   'کٹوتی شدہ قرض',
    'zakat.breakdown.net':           'خالص زکوٰۃ والی دولت',
    'zakat.breakdown.nisab':         'نصاب',
    'zakat.breakdown.amount':        'واجب الادا زکوٰۃ',
    'zakat.seo.h1':       'مال کی زکوٰۃ کیسے حساب کی جائے؟',
    'zakat.seo.h1_body':  'زکوٰۃ عام طور پر اس وقت 2.5% کی شرح سے حساب کی جاتی ہے جب دولت نصاب کو پہنچ جائے اور اس پر مکمل قمری سال (حول) گزر جائے۔ فارمولا: زکوٰۃ = خالص دولت × 2.5%۔',
    'zakat.seo.h2':       'زکوٰۃ کا نصاب کیا ہے؟',
    'zakat.seo.h2_body':  'نصاب وہ کم از کم مقدار ہے جس پر حول گزرنے کے بعد زکوٰۃ واجب ہو جاتی ہے۔ یہ عام طور پر 85 گرام سونے یا 595 گرام چاندی کے برابر ہوتا ہے۔',
    'zakat.seo.h3':       'زکوٰۃ کے حساب میں کون سی دولت شامل ہے؟',
    'zakat.seo.h3_body':  '<li>نقد، بینک اکاؤنٹس اور بچت</li><li>سونا اور چاندی</li><li>تجارتی سامان</li><li>حصص اور سرمایہ کاری</li><li>فروخت کے لیے رکھی گئی جائیداد</li>',
    'zakat.seo.h4':       'کون سی دولت عام طور پر خارج ہوتی ہے؟',
    'zakat.seo.h4_body':  '<li>ذاتی رہائش</li><li>ذاتی گاڑی</li><li>فرنیچر اور ذاتی اشیاء</li><li>وہ جائیداد جو فروخت کے لیے نہیں</li><li>کام کے لیے استعمال ہونے والے اوزار، فروخت کے لیے نہیں</li>',
    'zakat.disclaimer.title': 'اہم نوٹ',
    'zakat.disclaimer.body':  'یہ کیلکولیٹر آپ کے ان پٹ کی بنیاد پر زکوٰۃ کا عمومی تخمینہ پیش کرتا ہے۔ کچھ تفصیلات دولت کی قسم، قرضوں، سونے، حصص، یا آپ کے ملک کی فتویٰ کے مطابق مختلف ہو سکتی ہیں۔ خاص حالات میں کسی معتمد عالم سے رجوع کریں۔',
  },
  // ════════════════════════════════ DE ════════════════════════════════
  de: {
    'zakat.settings.title':              'Berechnungs-Einstellungen',
    'zakat.settings.currency':           'Währung',
    'zakat.settings.nisab_type':         'Nisab-Basis',
    'zakat.settings.nisab_gold':         'Gold-Nisab (85 g)',
    'zakat.settings.nisab_silver':       'Silber-Nisab (595 g)',
    'zakat.settings.gold_price':         'Goldpreis pro Gramm',
    'zakat.settings.silver_price':       'Silberpreis pro Gramm',
    'zakat.settings.price_helper':       'Passen Sie den Preis pro Gramm an Ihren lokalen Markt an.',
    'zakat.settings.price_approx_badge': 'ca.',
    'zakat.hawl.title':       'Ist ein vollständiges Mondjahr (Hawl) auf das Vermögen vergangen?',
    'zakat.hawl.yes':         'Ja',
    'zakat.hawl.no':          'Nein',
    'zakat.hawl.unsure':      'Nicht sicher',
    'zakat.hawl.note_yes':    'Die Zakat wird berechnet, wenn das Vermögen den Nisab erreicht.',
    'zakat.hawl.note_no':     'Außer in besonderen Fällen ist die Zakat möglicherweise noch nicht fällig, wenn auf das Vermögen kein vollständiges Mondjahr vergangen ist.',
    'zakat.hawl.note_unsure': 'Sie können den Rechner für eine Schätzung verwenden, dann das Erwerbsdatum des Vermögens überprüfen oder einen vertrauenswürdigen Gelehrten konsultieren.',
    'zakat.cash.title':   'Bargeld und Ersparnisse',
    'zakat.cash.cash':    'Verfügbares Bargeld',
    'zakat.cash.bank':    'Bankkonten',
    'zakat.cash.savings': 'Ersparnisse',
    'zakat.cash.note':    'Geben Sie das Geld ein, das Sie zum Zeitpunkt der Zakat tatsächlich besitzen.',
    'zakat.gs.title':        'Gold und Silber',
    'zakat.gs.gold':         'Gold',
    'zakat.gs.silver':       'Silber',
    'zakat.gs.gold_value':   'Goldwert',
    'zakat.gs.silver_value': 'Silberwert',
    'zakat.gs.by_value':     'Nach Wert',
    'zakat.gs.by_weight':    'Nach Gewicht',
    'zakat.gs.weight_grams': 'Gewicht (Gramm)',
    'zakat.gs.note':         'Bei persönlichem Schmuckgold gibt es Fiqh-Unterschiede; die Berechnung kann je nach befolgter Fatwa variieren.',
    'zakat.invest.title':       'Investitionen und Handelswaren',
    'zakat.invest.stocks':      'Aktien und Investitionen',
    'zakat.invest.trade':       'Handelswaren',
    'zakat.invest.property':    'Zum Verkauf gehaltene Immobilien',
    'zakat.invest.receivables': 'Ihnen geschuldete Beträge',
    'zakat.invest.note':        'Als Wohnsitz oder zur persönlichen Nutzung gehaltene Immobilien sind in der Regel ausgeschlossen; zum Verkauf gehaltene Immobilien werden zum Marktwert einbezogen.',
    'zakat.debts.title':       'Schulden und Abzüge',
    'zakat.debts.debts':       'Von Ihnen geschuldete Schulden',
    'zakat.debts.obligations': 'Kurzfristige Verpflichtungen',
    'zakat.debts.note':        'Die Regeln für den Schuldenabzug variieren je nach Schuldenart und Zeitpunkt; dieser Rechner liefert eine allgemeine Schätzung.',
    'zakat.breakdown.title':         'Berechnungsdetails',
    'zakat.breakdown.cash_total':    'Bargeldsumme',
    'zakat.breakdown.gs_total':      'Gold- und Silbersumme',
    'zakat.breakdown.invest_total':  'Summe Investitionen und Handel',
    'zakat.breakdown.debts_total':   'Abgezogene Schulden',
    'zakat.breakdown.net':           'Nettes zakatpflichtiges Vermögen',
    'zakat.breakdown.nisab':         'Nisab',
    'zakat.breakdown.amount':        'Fällige Zakat',
    'zakat.seo.h1':       'Wie wird die Zakat auf Geld berechnet?',
    'zakat.seo.h1_body':  'Die Zakat wird in der Regel mit 2,5 % des nettos zakatpflichtigen Vermögens berechnet, sobald dieses den Nisab erreicht und ein vollständiges Mondjahr (Hawl) vergangen ist. Formel: Zakat = Nettovermögen × 2,5 %.',
    'zakat.seo.h2':       'Was ist der Nisab der Zakat?',
    'zakat.seo.h2_body':  'Der Nisab ist der Mindestbetrag an Vermögen, der nach Ablauf des Hawl die Zakat verpflichtend macht. Er wird üblicherweise als Gegenwert von 85 Gramm Gold oder 595 Gramm Silber geschätzt.',
    'zakat.seo.h3':       'Welche Vermögenswerte sind in der Zakat enthalten?',
    'zakat.seo.h3_body':  '<li>Bargeld, Bankkonten und Ersparnisse</li><li>Gold und Silber</li><li>Handelswaren und Warenbestände</li><li>Aktien und Investitionen</li><li>Zum Verkauf gehaltene Immobilien</li>',
    'zakat.seo.h4':       'Welche Vermögenswerte sind in der Regel ausgeschlossen?',
    'zakat.seo.h4_body':  '<li>Persönlicher Wohnsitz</li><li>Persönliches Fahrzeug</li><li>Möbel und persönliche Gegenstände</li><li>Nicht zum Verkauf bestimmte Immobilien</li><li>Werkzeuge für die Arbeit, nicht für den Verkauf</li>',
    'zakat.disclaimer.title': 'Wichtiger Hinweis',
    'zakat.disclaimer.body':  'Dieser Rechner liefert eine allgemeine Zakat-Schätzung auf Basis Ihrer Eingaben. Einige Details können je nach Vermögensart, Schulden, Gold, Aktien oder befolgter Fatwa in Ihrem Land variieren. Konsultieren Sie in besonderen Fällen einen vertrauenswürdigen Gelehrten.',
  },
  // ════════════════════════════════ ID ════════════════════════════════
  id: {
    'zakat.settings.title':              'Pengaturan Perhitungan',
    'zakat.settings.currency':           'Mata uang',
    'zakat.settings.nisab_type':         'Dasar nisab',
    'zakat.settings.nisab_gold':         'Nisab emas (85 g)',
    'zakat.settings.nisab_silver':       'Nisab perak (595 g)',
    'zakat.settings.gold_price':         'Harga emas per gram',
    'zakat.settings.silver_price':       'Harga perak per gram',
    'zakat.settings.price_helper':       'Sesuaikan harga per gram dengan pasar lokal Anda.',
    'zakat.settings.price_approx_badge': 'perk.',
    'zakat.hawl.title':       'Apakah satu tahun hijriah penuh (haul) telah berlalu pada harta?',
    'zakat.hawl.yes':         'Ya',
    'zakat.hawl.no':          'Tidak',
    'zakat.hawl.unsure':      'Tidak yakin',
    'zakat.hawl.note_yes':    'Zakat akan dihitung jika harta mencapai nisab.',
    'zakat.hawl.note_no':     'Kecuali dalam kasus khusus, zakat mungkin belum wajib jika satu tahun hijriah penuh belum berlalu pada harta.',
    'zakat.hawl.note_unsure': 'Anda dapat menggunakan kalkulator untuk perkiraan, lalu meninjau tanggal kepemilikan harta atau berkonsultasi dengan ulama tepercaya.',
    'zakat.cash.title':   'Tunai dan tabungan',
    'zakat.cash.cash':    'Tunai yang ada',
    'zakat.cash.bank':    'Rekening bank',
    'zakat.cash.savings': 'Tabungan',
    'zakat.cash.note':    'Masukkan dana yang benar-benar Anda miliki saat zakat.',
    'zakat.gs.title':        'Emas dan perak',
    'zakat.gs.gold':         'Emas',
    'zakat.gs.silver':       'Perak',
    'zakat.gs.gold_value':   'Nilai emas',
    'zakat.gs.silver_value': 'Nilai perak',
    'zakat.gs.by_value':     'Berdasarkan nilai',
    'zakat.gs.by_weight':    'Berdasarkan berat',
    'zakat.gs.weight_grams': 'Berat (gram)',
    'zakat.gs.note':         'Emas perhiasan pribadi memiliki perbedaan fikih; perhitungan dapat berbeda menurut fatwa yang Anda ikuti.',
    'zakat.invest.title':       'Investasi dan barang dagangan',
    'zakat.invest.stocks':      'Saham dan investasi',
    'zakat.invest.trade':       'Barang dagangan',
    'zakat.invest.property':    'Properti yang dijual',
    'zakat.invest.receivables': 'Piutang Anda',
    'zakat.invest.note':        'Properti yang digunakan sebagai tempat tinggal atau pemakaian pribadi umumnya tidak termasuk; properti yang dijual dimasukkan menurut nilai pasar.',
    'zakat.debts.title':       'Utang dan pengurangan',
    'zakat.debts.debts':       'Utang yang Anda tanggung',
    'zakat.debts.obligations': 'Kewajiban jangka pendek',
    'zakat.debts.note':        'Aturan pengurangan utang berbeda menurut jenis dan waktu utang; kalkulator ini memberikan perkiraan umum.',
    'zakat.breakdown.title':         'Rincian Perhitungan',
    'zakat.breakdown.cash_total':    'Total tunai',
    'zakat.breakdown.gs_total':      'Total emas dan perak',
    'zakat.breakdown.invest_total':  'Total investasi dan dagangan',
    'zakat.breakdown.debts_total':   'Utang yang dikurangi',
    'zakat.breakdown.net':           'Harta bersih wajib zakat',
    'zakat.breakdown.nisab':         'Nisab',
    'zakat.breakdown.amount':        'Zakat yang wajib',
    'zakat.seo.h1':       'Bagaimana cara menghitung zakat harta?',
    'zakat.seo.h1_body':  'Zakat umumnya dihitung sebesar 2,5% dari harta bersih wajib zakat ketika harta mencapai nisab dan telah berlalu satu tahun hijriah penuh (haul). Rumus: Zakat = Harta bersih × 2,5%.',
    'zakat.seo.h2':       'Apa itu nisab zakat?',
    'zakat.seo.h2_body':  'Nisab adalah jumlah harta minimum yang mewajibkan zakat setelah haul terlewati. Nilainya umumnya diperkirakan setara dengan 85 gram emas atau 595 gram perak.',
    'zakat.seo.h3':       'Harta apa saja yang termasuk dalam zakat?',
    'zakat.seo.h3_body':  '<li>Tunai, rekening bank, dan tabungan</li><li>Emas dan perak</li><li>Barang dagangan dan stok</li><li>Saham dan investasi</li><li>Properti yang dijual</li>',
    'zakat.seo.h4':       'Harta apa yang umumnya tidak termasuk?',
    'zakat.seo.h4_body':  '<li>Tempat tinggal pribadi</li><li>Kendaraan pribadi</li><li>Furnitur dan barang pribadi</li><li>Properti yang tidak dimaksudkan untuk dijual</li><li>Alat untuk bekerja, bukan untuk dijual</li>',
    'zakat.disclaimer.title': 'Catatan penting',
    'zakat.disclaimer.body':  'Kalkulator ini memberikan perkiraan umum zakat berdasarkan input Anda. Beberapa rincian dapat berbeda menurut jenis harta, utang, emas, saham, atau fatwa yang berlaku di negara Anda. Untuk kasus khusus, konsultasikan dengan ulama tepercaya.',
  },
  // ════════════════════════════════ ES ════════════════════════════════
  es: {
    'zakat.settings.title':              'Ajustes de cálculo',
    'zakat.settings.currency':           'Moneda',
    'zakat.settings.nisab_type':         'Base del nisab',
    'zakat.settings.nisab_gold':         'Nisab de oro (85 g)',
    'zakat.settings.nisab_silver':       'Nisab de plata (595 g)',
    'zakat.settings.gold_price':         'Precio del oro por gramo',
    'zakat.settings.silver_price':       'Precio de la plata por gramo',
    'zakat.settings.price_helper':       'Ajuste el precio por gramo según su mercado local.',
    'zakat.settings.price_approx_badge': 'aprox.',
    'zakat.hawl.title':       '¿Ha transcurrido un año lunar completo (Hawl) sobre el patrimonio?',
    'zakat.hawl.yes':         'Sí',
    'zakat.hawl.no':          'No',
    'zakat.hawl.unsure':      'No estoy seguro',
    'zakat.hawl.note_yes':    'La zakat se calculará si el patrimonio alcanza el nisab.',
    'zakat.hawl.note_no':     'Salvo casos especiales, la zakat puede no ser obligatoria si no ha transcurrido un año lunar completo sobre el patrimonio.',
    'zakat.hawl.note_unsure': 'Puede usar la calculadora para una estimación, luego revisar la fecha de adquisición del patrimonio o consultar a un erudito de confianza.',
    'zakat.cash.title':   'Efectivo y ahorros',
    'zakat.cash.cash':    'Efectivo disponible',
    'zakat.cash.bank':    'Cuentas bancarias',
    'zakat.cash.savings': 'Ahorros',
    'zakat.cash.note':    'Introduzca los fondos que realmente posee en el momento de la zakat.',
    'zakat.gs.title':        'Oro y plata',
    'zakat.gs.gold':         'Oro',
    'zakat.gs.silver':       'Plata',
    'zakat.gs.gold_value':   'Valor del oro',
    'zakat.gs.silver_value': 'Valor de la plata',
    'zakat.gs.by_value':     'Por valor',
    'zakat.gs.by_weight':    'Por peso',
    'zakat.gs.weight_grams': 'Peso (gramos)',
    'zakat.gs.note':         'El oro de joyería personal presenta diferencias fiqh; el cálculo puede variar según la fatwa que siga.',
    'zakat.invest.title':       'Inversiones y mercancías',
    'zakat.invest.stocks':      'Acciones e inversiones',
    'zakat.invest.trade':       'Mercancías',
    'zakat.invest.property':    'Propiedades a la venta',
    'zakat.invest.receivables': 'Cuentas por cobrar',
    'zakat.invest.note':        'Las propiedades destinadas a residencia o uso personal generalmente no se incluyen; las propiedades a la venta se incluyen al valor de mercado.',
    'zakat.debts.title':       'Deudas y deducciones',
    'zakat.debts.debts':       'Deudas que usted debe',
    'zakat.debts.obligations': 'Obligaciones a corto plazo',
    'zakat.debts.note':        'Las reglas de deducción de deudas varían según el tipo y el momento; esta calculadora ofrece una estimación general.',
    'zakat.breakdown.title':         'Desglose del cálculo',
    'zakat.breakdown.cash_total':    'Total en efectivo',
    'zakat.breakdown.gs_total':      'Total oro y plata',
    'zakat.breakdown.invest_total':  'Total inversiones y comercio',
    'zakat.breakdown.debts_total':   'Deudas deducidas',
    'zakat.breakdown.net':           'Patrimonio neto zakatable',
    'zakat.breakdown.nisab':         'Nisab',
    'zakat.breakdown.amount':        'Zakat a pagar',
    'zakat.seo.h1':       '¿Cómo se calcula la zakat sobre el dinero?',
    'zakat.seo.h1_body':  'La zakat se calcula generalmente al 2,5 % del patrimonio neto zakatable cuando alcanza el nisab y ha transcurrido un año lunar completo (Hawl). Fórmula: Zakat = Patrimonio neto × 2,5 %.',
    'zakat.seo.h2':       '¿Qué es el nisab de la zakat?',
    'zakat.seo.h2_body':  'El nisab es la cantidad mínima de patrimonio que hace obligatoria la zakat una vez transcurrido el Hawl. Suele estimarse como el equivalente de 85 gramos de oro o 595 gramos de plata.',
    'zakat.seo.h3':       '¿Qué patrimonio se incluye en la zakat?',
    'zakat.seo.h3_body':  '<li>Efectivo, cuentas bancarias y ahorros</li><li>Oro y plata</li><li>Mercancías y existencias</li><li>Acciones e inversiones</li><li>Propiedades a la venta</li>',
    'zakat.seo.h4':       '¿Qué patrimonio queda generalmente excluido?',
    'zakat.seo.h4_body':  '<li>Residencia personal</li><li>Vehículo personal</li><li>Mobiliario y efectos personales</li><li>Propiedades no destinadas a la venta</li><li>Herramientas para el trabajo, no para la venta</li>',
    'zakat.disclaimer.title': 'Aviso importante',
    'zakat.disclaimer.body':  'Esta calculadora ofrece una estimación general de la zakat basada en sus datos. Algunos detalles pueden variar según el tipo de patrimonio, deudas, oro, acciones o la fatwa seguida en su país. Para casos especiales, consulte a un erudito de confianza.',
  },
  // ════════════════════════════════ BN ════════════════════════════════
  bn: {
    'zakat.settings.title':              'গণনা সেটিংস',
    'zakat.settings.currency':           'মুদ্রা',
    'zakat.settings.nisab_type':         'নিসাবের ভিত্তি',
    'zakat.settings.nisab_gold':         'স্বর্ণের নিসাব (৮৫ গ্রাম)',
    'zakat.settings.nisab_silver':       'রৌপ্যের নিসাব (৫৯৫ গ্রাম)',
    'zakat.settings.gold_price':         'প্রতি গ্রাম স্বর্ণের দাম',
    'zakat.settings.silver_price':       'প্রতি গ্রাম রৌপ্যের দাম',
    'zakat.settings.price_helper':       'আপনার স্থানীয় বাজারের সঙ্গে প্রতি গ্রাম দাম সমন্বয় করুন।',
    'zakat.settings.price_approx_badge': 'আনুমানিক',
    'zakat.hawl.title':       'সম্পদের উপর কি পূর্ণ এক চান্দ্র বছর (হাওল) পার হয়েছে?',
    'zakat.hawl.yes':         'হ্যাঁ',
    'zakat.hawl.no':          'না',
    'zakat.hawl.unsure':      'নিশ্চিত নই',
    'zakat.hawl.note_yes':    'যদি সম্পদ নিসাবে পৌঁছায় তবে যাকাত গণনা করা হবে।',
    'zakat.hawl.note_no':     'বিশেষ ক্ষেত্র ছাড়া, সম্পদের উপর পূর্ণ এক চান্দ্র বছর পার না হলে যাকাত এখনও ফরজ নাও হতে পারে।',
    'zakat.hawl.note_unsure': 'আপনি ক্যালকুলেটর ব্যবহার করে আনুমানিক হিসাব নিতে পারেন, তারপর সম্পদ অর্জনের তারিখ যাচাই করুন বা বিশ্বস্ত আলেমের পরামর্শ নিন।',
    'zakat.cash.title':   'নগদ ও সঞ্চয়',
    'zakat.cash.cash':    'হাতে থাকা নগদ',
    'zakat.cash.bank':    'ব্যাংক অ্যাকাউন্ট',
    'zakat.cash.savings': 'সঞ্চয়',
    'zakat.cash.note':    'যাকাতের সময় আপনার প্রকৃত মালিকানাধীন অর্থ লিখুন।',
    'zakat.gs.title':        'স্বর্ণ ও রৌপ্য',
    'zakat.gs.gold':         'স্বর্ণ',
    'zakat.gs.silver':       'রৌপ্য',
    'zakat.gs.gold_value':   'স্বর্ণের মূল্য',
    'zakat.gs.silver_value': 'রৌপ্যের মূল্য',
    'zakat.gs.by_value':     'মূল্য অনুসারে',
    'zakat.gs.by_weight':    'ওজন অনুসারে',
    'zakat.gs.weight_grams': 'ওজন (গ্রাম)',
    'zakat.gs.note':         'ব্যক্তিগত গহনার স্বর্ণে ফিকহী পার্থক্য আছে; অনুসৃত ফতোয়ার ভিত্তিতে গণনা ভিন্ন হতে পারে।',
    'zakat.invest.title':       'বিনিয়োগ ও বাণিজ্যিক পণ্য',
    'zakat.invest.stocks':      'শেয়ার ও বিনিয়োগ',
    'zakat.invest.trade':       'বাণিজ্যিক পণ্য',
    'zakat.invest.property':    'বিক্রির জন্য রাখা সম্পত্তি',
    'zakat.invest.receivables': 'আপনার পাওনা',
    'zakat.invest.note':        'বসবাস বা ব্যক্তিগত ব্যবহারের জন্য রাখা সম্পত্তি সাধারণত অন্তর্ভুক্ত হয় না; বিক্রির জন্য রাখা সম্পত্তি বাজারমূল্যে অন্তর্ভুক্ত হয়।',
    'zakat.debts.title':       'ঋণ ও বিয়োগ',
    'zakat.debts.debts':       'আপনার পরিশোধযোগ্য ঋণ',
    'zakat.debts.obligations': 'স্বল্পমেয়াদি দায়',
    'zakat.debts.note':        'ঋণ বিয়োগের নিয়ম ঋণের ধরন ও সময়ের উপর নির্ভর করে; এই ক্যালকুলেটর সাধারণ আনুমানিক হিসাব দেয়।',
    'zakat.breakdown.title':         'গণনার বিস্তারিত',
    'zakat.breakdown.cash_total':    'নগদ মোট',
    'zakat.breakdown.gs_total':      'স্বর্ণ ও রৌপ্য মোট',
    'zakat.breakdown.invest_total':  'বিনিয়োগ ও বাণিজ্য মোট',
    'zakat.breakdown.debts_total':   'বাদ দেওয়া ঋণ',
    'zakat.breakdown.net':           'নিট যাকাতযোগ্য সম্পদ',
    'zakat.breakdown.nisab':         'নিসাব',
    'zakat.breakdown.amount':        'প্রদেয় যাকাত',
    'zakat.seo.h1':       'অর্থের যাকাত কীভাবে গণনা করা হয়?',
    'zakat.seo.h1_body':  'যাকাত সাধারণত নিট যাকাতযোগ্য সম্পদের ২.৫% হারে গণনা করা হয় যখন সম্পদ নিসাবে পৌঁছায় এবং তার উপর পূর্ণ এক চান্দ্র বছর (হাওল) পার হয়। সূত্র: যাকাত = নিট সম্পদ × ২.৫%।',
    'zakat.seo.h2':       'যাকাতের নিসাব কী?',
    'zakat.seo.h2_body':  'নিসাব হল সম্পদের সর্বনিম্ন পরিমাণ যা হাওল পার হওয়ার পর যাকাতকে ফরজ করে। সাধারণত এটি ৮৫ গ্রাম স্বর্ণ বা ৫৯৫ গ্রাম রৌপ্যের সমতুল্য বলে অনুমান করা হয়।',
    'zakat.seo.h3':       'যাকাতের গণনায় কোন সম্পদ অন্তর্ভুক্ত?',
    'zakat.seo.h3_body':  '<li>নগদ, ব্যাংক অ্যাকাউন্ট ও সঞ্চয়</li><li>স্বর্ণ ও রৌপ্য</li><li>বাণিজ্যিক পণ্য ও মজুদ</li><li>শেয়ার ও বিনিয়োগ</li><li>বিক্রির জন্য রাখা সম্পত্তি</li>',
    'zakat.seo.h4':       'কোন সম্পদ সাধারণত বাদ পড়ে?',
    'zakat.seo.h4_body':  '<li>ব্যক্তিগত বাসস্থান</li><li>ব্যক্তিগত যানবাহন</li><li>আসবাবপত্র ও ব্যক্তিগত সামগ্রী</li><li>বিক্রির জন্য নয় এমন সম্পত্তি</li><li>কাজের জন্য ব্যবহৃত যন্ত্র, বিক্রির জন্য নয়</li>',
    'zakat.disclaimer.title': 'গুরুত্বপূর্ণ বিজ্ঞপ্তি',
    'zakat.disclaimer.body':  'এই ক্যালকুলেটর আপনার ইনপুটের ভিত্তিতে যাকাতের সাধারণ আনুমানিক হিসাব দেয়। সম্পদের ধরন, ঋণ, স্বর্ণ, শেয়ার বা আপনার দেশে অনুসৃত ফতোয়ার ভিত্তিতে কিছু বিস্তারিত ভিন্ন হতে পারে। বিশেষ ক্ষেত্রে বিশ্বস্ত আলেমের পরামর্শ নিন।',
  },
  // ════════════════════════════════ MS ════════════════════════════════
  ms: {
    'zakat.settings.title':              'Tetapan Pengiraan',
    'zakat.settings.currency':           'Mata wang',
    'zakat.settings.nisab_type':         'Asas nisab',
    'zakat.settings.nisab_gold':         'Nisab emas (85 g)',
    'zakat.settings.nisab_silver':       'Nisab perak (595 g)',
    'zakat.settings.gold_price':         'Harga emas segram',
    'zakat.settings.silver_price':       'Harga perak segram',
    'zakat.settings.price_helper':       'Laraskan harga segram mengikut pasaran tempatan anda.',
    'zakat.settings.price_approx_badge': 'angg.',
    'zakat.hawl.title':       'Adakah setahun hijrah penuh (haul) telah berlalu ke atas harta?',
    'zakat.hawl.yes':         'Ya',
    'zakat.hawl.no':          'Tidak',
    'zakat.hawl.unsure':      'Tidak pasti',
    'zakat.hawl.note_yes':    'Zakat akan dikira jika harta mencapai nisab.',
    'zakat.hawl.note_no':     'Kecuali dalam kes khas, zakat mungkin belum wajib jika setahun hijrah penuh belum berlalu ke atas harta.',
    'zakat.hawl.note_unsure': 'Anda boleh menggunakan kalkulator untuk anggaran, kemudian menyemak tarikh pemilikan harta atau merujuk kepada ulama yang dipercayai.',
    'zakat.cash.title':   'Tunai dan simpanan',
    'zakat.cash.cash':    'Tunai sedia ada',
    'zakat.cash.bank':    'Akaun bank',
    'zakat.cash.savings': 'Simpanan',
    'zakat.cash.note':    'Masukkan dana yang anda miliki sebenarnya pada masa zakat.',
    'zakat.gs.title':        'Emas dan perak',
    'zakat.gs.gold':         'Emas',
    'zakat.gs.silver':       'Perak',
    'zakat.gs.gold_value':   'Nilai emas',
    'zakat.gs.silver_value': 'Nilai perak',
    'zakat.gs.by_value':     'Mengikut nilai',
    'zakat.gs.by_weight':    'Mengikut berat',
    'zakat.gs.weight_grams': 'Berat (gram)',
    'zakat.gs.note':         'Emas perhiasan peribadi mempunyai perbezaan fiqh; pengiraan boleh berbeza mengikut fatwa yang anda ikuti.',
    'zakat.invest.title':       'Pelaburan dan barang dagangan',
    'zakat.invest.stocks':      'Saham dan pelaburan',
    'zakat.invest.trade':       'Barang dagangan',
    'zakat.invest.property':    'Hartanah untuk dijual',
    'zakat.invest.receivables': 'Piutang anda',
    'zakat.invest.note':        'Hartanah yang digunakan sebagai kediaman atau penggunaan peribadi biasanya tidak termasuk; hartanah untuk dijual dimasukkan pada nilai pasaran.',
    'zakat.debts.title':       'Hutang dan tolakan',
    'zakat.debts.debts':       'Hutang yang anda tanggung',
    'zakat.debts.obligations': 'Obligasi jangka pendek',
    'zakat.debts.note':        'Peraturan tolakan hutang berbeza mengikut jenis dan masa hutang; kalkulator ini memberikan anggaran umum.',
    'zakat.breakdown.title':         'Perincian Pengiraan',
    'zakat.breakdown.cash_total':    'Jumlah tunai',
    'zakat.breakdown.gs_total':      'Jumlah emas dan perak',
    'zakat.breakdown.invest_total':  'Jumlah pelaburan dan dagangan',
    'zakat.breakdown.debts_total':   'Hutang yang ditolak',
    'zakat.breakdown.net':           'Harta bersih kena zakat',
    'zakat.breakdown.nisab':         'Nisab',
    'zakat.breakdown.amount':        'Zakat yang wajib',
    'zakat.seo.h1':       'Bagaimana zakat ke atas wang dikira?',
    'zakat.seo.h1_body':  'Zakat biasanya dikira sebanyak 2.5% daripada harta bersih kena zakat apabila ia mencapai nisab dan setahun hijrah penuh (haul) telah berlalu. Formula: Zakat = Harta bersih × 2.5%.',
    'zakat.seo.h2':       'Apakah nisab zakat?',
    'zakat.seo.h2_body':  'Nisab ialah jumlah harta minimum yang mewajibkan zakat selepas haul berlalu. Ia biasanya dianggarkan setara dengan 85 gram emas atau 595 gram perak.',
    'zakat.seo.h3':       'Harta apakah yang termasuk dalam zakat?',
    'zakat.seo.h3_body':  '<li>Tunai, akaun bank dan simpanan</li><li>Emas dan perak</li><li>Barang dagangan dan stok</li><li>Saham dan pelaburan</li><li>Hartanah untuk dijual</li>',
    'zakat.seo.h4':       'Harta apakah yang biasanya dikecualikan?',
    'zakat.seo.h4_body':  '<li>Kediaman peribadi</li><li>Kenderaan peribadi</li><li>Perabot dan barang peribadi</li><li>Hartanah yang tidak dijual</li><li>Alat untuk kerja, bukan untuk dijual</li>',
    'zakat.disclaimer.title': 'Notis penting',
    'zakat.disclaimer.body':  'Kalkulator ini memberikan anggaran umum zakat berdasarkan input anda. Beberapa butiran boleh berbeza mengikut jenis harta, hutang, emas, saham atau fatwa yang diikuti di negara anda. Bagi kes khas, rujuklah ulama yang dipercayai.',
  },
};

// ─────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────
const REQUIRED_KEYS = [
  // settings (9)
  'zakat.settings.title', 'zakat.settings.currency', 'zakat.settings.nisab_type',
  'zakat.settings.nisab_gold', 'zakat.settings.nisab_silver',
  'zakat.settings.gold_price', 'zakat.settings.silver_price',
  'zakat.settings.price_helper', 'zakat.settings.price_approx_badge',
  // hawl (7)
  'zakat.hawl.title', 'zakat.hawl.yes', 'zakat.hawl.no', 'zakat.hawl.unsure',
  'zakat.hawl.note_yes', 'zakat.hawl.note_no', 'zakat.hawl.note_unsure',
  // cash (5)
  'zakat.cash.title', 'zakat.cash.cash', 'zakat.cash.bank', 'zakat.cash.savings', 'zakat.cash.note',
  // gs (9)
  'zakat.gs.title', 'zakat.gs.gold', 'zakat.gs.silver',
  'zakat.gs.gold_value', 'zakat.gs.silver_value',
  'zakat.gs.by_value', 'zakat.gs.by_weight', 'zakat.gs.weight_grams', 'zakat.gs.note',
  // invest (6)
  'zakat.invest.title', 'zakat.invest.stocks', 'zakat.invest.trade',
  'zakat.invest.property', 'zakat.invest.receivables', 'zakat.invest.note',
  // debts (4)
  'zakat.debts.title', 'zakat.debts.debts', 'zakat.debts.obligations', 'zakat.debts.note',
  // breakdown (8)
  'zakat.breakdown.title', 'zakat.breakdown.cash_total', 'zakat.breakdown.gs_total',
  'zakat.breakdown.invest_total', 'zakat.breakdown.debts_total',
  'zakat.breakdown.net', 'zakat.breakdown.nisab', 'zakat.breakdown.amount',
  // seo (8)
  'zakat.seo.h1', 'zakat.seo.h1_body', 'zakat.seo.h2', 'zakat.seo.h2_body',
  'zakat.seo.h3', 'zakat.seo.h3_body', 'zakat.seo.h4', 'zakat.seo.h4_body',
  // disclaimer (2)
  'zakat.disclaimer.title', 'zakat.disclaimer.body',
];
console.log(`Required keys per lang: ${REQUIRED_KEYS.length}`);
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
// Insert into js/i18n.js (anchor: zakat.howto.step4)
// ─────────────────────────────────────────────────────────────
const raw = readFileSync(PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);
const EOL = isCRLF ? '\r\n' : '\n';
const INDENT = '        '; // 8 spaces

// Find each anchor occurrence (one per language). AR and EN anchors come
// first but we only want to insert into the 8 non-AR/EN langs.
// Use line-bounded regex (TR has escaped apostrophe in surrounding context
// so use line bounds, not '[^']*').
const allMatches = [...raw.matchAll(/^[ \t]+'zakat\.howto\.step4': '.*?',[ \t]*$/gm)];
if (allMatches.length !== 10) {
  throw new Error(`Expected 10 zakat.howto.step4 anchors (one per lang), got ${allMatches.length}`);
}
const fileLangOrder = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];
const targetLangs = ['fr','tr','ur','de','id','es','bn','ms']; // skip ar+en

let txt = raw;
// Insert from end to start so earlier offsets remain valid
for (let i = fileLangOrder.length - 1; i >= 0; i--) {
  const lang = fileLangOrder[i];
  if (!targetLangs.includes(lang)) continue;

  const m = allMatches[i];
  const matchEnd = m.index + m[0].length;

  // Idempotency check
  const after = raw.slice(matchEnd, matchEnd + 200);
  if (/zakat\.settings\.title/.test(after) || /D3\.3a-extended/.test(after)) {
    throw new Error(`Lang ${lang}: D3.3a-extended block already exists — script already ran?`);
  }

  // Build the insert block
  const lines = [];
  lines.push(''); // creates EOL after the anchor line, then we add our new lines
  lines.push(`${INDENT}// ─── D3.3a-extended — Complete zakat body localization ───`);
  for (const k of REQUIRED_KEYS) {
    const v = T[lang][k];
    // Escape: backslashes first, then single quotes
    const escaped = v.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    lines.push(`${INDENT}'${k}': '${escaped}',`);
  }
  const insertText = EOL + lines.join(EOL);
  txt = txt.slice(0, matchEnd) + insertText + txt.slice(matchEnd);
  console.log(`✓ Inserted ${REQUIRED_KEYS.length} keys for lang=${lang}`);
}

writeFileSync(PATH, txt);
console.log(`\n✅ js/i18n.js updated: ${targetLangs.length * REQUIRED_KEYS.length} new entries.`);
console.log('   Next: node --check js/i18n.js, restart preview, verify 8 langs.');
