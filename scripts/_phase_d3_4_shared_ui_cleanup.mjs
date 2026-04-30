// Phase D3.4 (Option A) — Shared UI HIGH + MEDIUM cleanup.
// Three atomic changes:
//
//   1. js/i18n.js — add 7 missing keys × 8 langs = 56 entries
//      (6 footer.* + 1 header.change_language) anchored after footer.terms.
//
//   2. js/app.js — refactor injectHomepageSchema():
//      • SiteNavigationElement.name → t('nav.*') (localized per lang)
//      • SiteNavigationElement.url  → lang-prefixed
//      • inLanguage on WebSite/WebPage → current lang
//
//   3. llms.txt — bring up to date with rebrand:
//      • mention 10 langs instead of 5
//      • replace "duas" with "azkar (adhkar)"
//      • add Home links for de/id/es/bn/ms

import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\';

// ─────────────────────────────────────────────────────────────
// 1. i18n.js — 7 keys × 8 langs = 56 entries
// ─────────────────────────────────────────────────────────────
const T = {
  fr: {
    'footer.arab_countries':  'Heures de prière dans les pays arabes',
    'footer.popular_cities':  'Heures de prière dans les villes populaires',
    'footer.services_title':  'Autres services islamiques',
    'footer.world_countries': 'Heures de prière dans les principaux pays du monde',
    'footer.refs_title':      'Références externes',
    'footer.share_title':     'Partager ce site',
    'header.change_language': 'Changer de langue',
  },
  tr: {
    'footer.arab_countries':  'Arap Ülkelerinde Namaz Vakitleri',
    'footer.popular_cities':  'Popüler Şehirlerde Namaz Vakitleri',
    'footer.services_title':  'Diğer İslami Hizmetler',
    'footer.world_countries': 'Önemli Dünya Ülkelerinde Namaz Vakitleri',
    'footer.refs_title':      'Dış Kaynaklar',
    'footer.share_title':     'Bu siteyi paylaş',
    'header.change_language': 'Dil Değiştir',
  },
  ur: {
    'footer.arab_countries':  'عرب ممالک میں اوقاتِ نماز',
    'footer.popular_cities':  'مشہور شہروں میں اوقاتِ نماز',
    'footer.services_title':  'دیگر اسلامی خدمات',
    'footer.world_countries': 'دنیا کے بڑے ممالک میں اوقاتِ نماز',
    'footer.refs_title':      'بیرونی حوالہ جات',
    'footer.share_title':     'سائٹ شیئر کریں',
    'header.change_language': 'زبان تبدیل کریں',
  },
  de: {
    'footer.arab_countries':  'Gebetszeiten in arabischen Ländern',
    'footer.popular_cities':  'Gebetszeiten in beliebten Städten',
    'footer.services_title':  'Weitere islamische Dienste',
    'footer.world_countries': 'Gebetszeiten in den wichtigsten Ländern der Welt',
    'footer.refs_title':      'Externe Quellen',
    'footer.share_title':     'Diese Seite teilen',
    'header.change_language': 'Sprache ändern',
  },
  id: {
    'footer.arab_countries':  'Jadwal Sholat di Negara-Negara Arab',
    'footer.popular_cities':  'Jadwal Sholat di Kota-Kota Populer',
    'footer.services_title':  'Layanan Islami Lainnya',
    'footer.world_countries': 'Jadwal Sholat di Negara-Negara Utama Dunia',
    'footer.refs_title':      'Referensi Eksternal',
    'footer.share_title':     'Bagikan situs ini',
    'header.change_language': 'Ubah Bahasa',
  },
  es: {
    'footer.arab_countries':  'Horarios de Oración en Países Árabes',
    'footer.popular_cities':  'Horarios de Oración en Ciudades Populares',
    'footer.services_title':  'Otros Servicios Islámicos',
    'footer.world_countries': 'Horarios de Oración en los Principales Países del Mundo',
    'footer.refs_title':      'Referencias Externas',
    'footer.share_title':     'Compartir este sitio',
    'header.change_language': 'Cambiar idioma',
  },
  bn: {
    'footer.arab_countries':  'আরব দেশগুলোতে নামাজের সময়',
    'footer.popular_cities':  'জনপ্রিয় শহরগুলোতে নামাজের সময়',
    'footer.services_title':  'অন্যান্য ইসলামিক সেবা',
    'footer.world_countries': 'বিশ্বের প্রধান দেশগুলোতে নামাজের সময়',
    'footer.refs_title':      'বাহ্যিক রেফারেন্স',
    'footer.share_title':     'এই সাইট শেয়ার করুন',
    'header.change_language': 'ভাষা পরিবর্তন করুন',
  },
  ms: {
    'footer.arab_countries':  'Waktu Solat di Negara-Negara Arab',
    'footer.popular_cities':  'Waktu Solat di Bandar-Bandar Popular',
    'footer.services_title':  'Perkhidmatan Islam Lain',
    'footer.world_countries': 'Waktu Solat di Negara-Negara Utama Dunia',
    'footer.refs_title':      'Rujukan Luar',
    'footer.share_title':     'Kongsi laman ini',
    'header.change_language': 'Tukar Bahasa',
  },
};

const REQUIRED_KEYS = [
  'footer.arab_countries', 'footer.popular_cities', 'footer.services_title',
  'footer.world_countries', 'footer.refs_title', 'footer.share_title',
  'header.change_language',
];

// Validate
for (const lang of Object.keys(T)) {
  for (const k of REQUIRED_KEYS) {
    if (!(k in T[lang])) throw new Error(`Missing: ${lang}/${k}`);
  }
}
console.log(`✓ Translation table validated: ${Object.keys(T).length} langs × ${REQUIRED_KEYS.length} keys = ${Object.keys(T).length * REQUIRED_KEYS.length} entries`);

// ─────────────────────────────────────────────────────────────
// 1. js/i18n.js — anchor: 'footer.terms' (last existing footer key in
//    each non-AR/EN lang). Insert 7 keys after it.
// ─────────────────────────────────────────────────────────────
{
  const PATH = ROOT + 'js/i18n.js';
  const raw = readFileSync(PATH, 'utf8');
  const isCRLF = /\r\n/.test(raw);
  const EOL = isCRLF ? '\r\n' : '\n';
  const INDENT = '        ';

  const allMatches = [...raw.matchAll(/^[ \t]+'footer\.terms': '.*?',[ \t]*$/gm)];
  if (allMatches.length !== 10) {
    throw new Error(`Expected 10 footer.terms anchors, got ${allMatches.length}`);
  }
  const fileLangOrder = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];
  const targetLangs = ['fr','tr','ur','de','id','es','bn','ms'];

  let txt = raw;
  // Insert from end to start
  for (let i = fileLangOrder.length - 1; i >= 0; i--) {
    const lang = fileLangOrder[i];
    if (!targetLangs.includes(lang)) continue;

    const m = allMatches[i];
    const matchEnd = m.index + m[0].length;
    const after = raw.slice(matchEnd, matchEnd + 200);
    if (/footer\.arab_countries/.test(after)) {
      throw new Error(`Lang ${lang}: D3.4-A block already exists — script already ran?`);
    }

    const lines = [''];
    lines.push(`${INDENT}// ─── D3.4 — Shared UI cleanup (HIGH + MEDIUM) ───`);
    for (const k of REQUIRED_KEYS) {
      const v = T[lang][k];
      const escaped = v.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      lines.push(`${INDENT}'${k}': '${escaped}',`);
    }
    const insertText = EOL + lines.join(EOL);
    txt = txt.slice(0, matchEnd) + insertText + txt.slice(matchEnd);
    console.log(`✓ Inserted 7 keys for lang=${lang}`);
  }

  writeFileSync(PATH, txt);
  console.log('✅ js/i18n.js: 56 new entries inserted');
}

// ─────────────────────────────────────────────────────────────
// 2. js/app.js — refactor injectHomepageSchema()
// ─────────────────────────────────────────────────────────────
{
  const PATH = ROOT + 'js/app.js';
  const raw = readFileSync(PATH, 'utf8');

  function replaceExact(text, name, oldChunk, newChunk) {
    const isCRLF = /\r\n/.test(text);
    if (isCRLF) {
      oldChunk = oldChunk.replace(/\r?\n/g, '\r\n');
      newChunk = newChunk.replace(/\r?\n/g, '\r\n');
    } else {
      oldChunk = oldChunk.replace(/\r\n/g, '\n');
      newChunk = newChunk.replace(/\r\n/g, '\n');
    }
    const cnt = text.split(oldChunk).length - 1;
    if (cnt !== 1) throw new Error(`${name}: expected 1 match, got ${cnt}`);
    return text.replace(oldChunk, newChunk);
  }

  let txt = raw;

  // Replace the inLanguage line + the 9 SiteNavigationElement entries.
  // Anchor: from `"inLanguage": "ar",` through last SiteNavigationElement entry.
  const oldBlock =
`            "@type": "WebSite",
            "@id": \`\${origin}/#website\`,
            "url": \`\${origin}/\`,
            "name": siteName,
            "alternateName": "مواقيت الصلاة والتاريخ الهجري",
            "inLanguage": "ar",
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": \`\${origin}/?q={search_term_string}\`
                },
                "query-input": "required name=search_term_string"
            }
        },
        {
            "@type": "Organization",
            "@id": \`\${origin}/#organization\`,
            "name": siteName,
            "url": \`\${origin}/\`
        },
        {
            "@type": "WebPage",
            "@id": \`\${origin}/#webpage\`,
            "url": \`\${origin}/\`,
            "name": \`\${siteName} والتاريخ الهجري\`,
            "headline": \`\${siteName} والتاريخ الهجري\`,
            "description": siteDesc,
            "inLanguage": "ar",
            "isPartOf": { "@id": \`\${origin}/#website\` },
            "about": [
                { "@type": "Thing", "name": "مواقيت الصلاة" },
                { "@type": "Thing", "name": "التاريخ الهجري" },
                { "@type": "Thing", "name": "تحويل التاريخ" },
                { "@type": "Thing", "name": "اتجاه القبلة" },
                { "@type": "Thing", "name": "القمر اليوم" },
                { "@type": "Thing", "name": "حاسبة الزكاة" }
            ],
            "publisher": { "@id": \`\${origin}/#organization\` }
        },
        { "@type": "SiteNavigationElement", "name": "مواقيت الصلاة",      "url": \`\${origin}/\`                              },
        { "@type": "SiteNavigationElement", "name": "اتجاه القبلة",       "url": \`\${origin}/qibla\`                         },
        { "@type": "SiteNavigationElement", "name": "القمر اليوم",         "url": \`\${origin}/moon-today\`                    },
        { "@type": "SiteNavigationElement", "name": "حاسبة الزكاة",       "url": \`\${origin}/zakat-calculator\`              },
        { "@type": "SiteNavigationElement", "name": "الأذكار",            "url": \`\${origin}/azkar\`                         },
        { "@type": "SiteNavigationElement", "name": "المسبحة الإلكترونية","url": \`\${origin}/msbaha\`                        },
        { "@type": "SiteNavigationElement", "name": "التاريخ الهجري اليوم","url": \`\${origin}\${hijriDated}\`                  },
        { "@type": "SiteNavigationElement", "name": "التقويم الهجري",     "url": \`\${origin}/hijri-calendar/\${hijriYear}\`   },
        { "@type": "SiteNavigationElement", "name": "تحويل التاريخ",      "url": \`\${origin}/dateconverter\`                 }
    ]
};`;

  const newBlock =
`            "@type": "WebSite",
            "@id": \`\${origin}/#website\`,
            "url": \`\${origin}\${_pageUrlBase}\`,
            "name": siteName,
            "alternateName": "مواقيت الصلاة والتاريخ الهجري",
            "inLanguage": _lang,
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": \`\${origin}\${_pageUrlBase}?q={search_term_string}\`
                },
                "query-input": "required name=search_term_string"
            }
        },
        {
            "@type": "Organization",
            "@id": \`\${origin}/#organization\`,
            "name": siteName,
            "url": \`\${origin}/\`
        },
        {
            "@type": "WebPage",
            "@id": \`\${origin}\${_pageUrlBase}#webpage\`,
            "url": \`\${origin}\${_pageUrlBase}\`,
            "name": \`\${siteName} والتاريخ الهجري\`,
            "headline": \`\${siteName} والتاريخ الهجري\`,
            "description": siteDesc,
            "inLanguage": _lang,
            "isPartOf": { "@id": \`\${origin}/#website\` },
            "about": [
                { "@type": "Thing", "name": _navName('nav.prayer_times', "مواقيت الصلاة") },
                { "@type": "Thing", "name": _navName('nav.hijri_today',  "التاريخ الهجري") },
                { "@type": "Thing", "name": _navName('nav.date_converter',"تحويل التاريخ") },
                { "@type": "Thing", "name": _navName('nav.qibla',        "اتجاه القبلة") },
                { "@type": "Thing", "name": _navName('nav.moon',         "القمر اليوم") },
                { "@type": "Thing", "name": _navName('nav.zakat',        "حاسبة الزكاة") }
            ],
            "publisher": { "@id": \`\${origin}/#organization\` }
        },
        { "@type": "SiteNavigationElement", "name": _navName('nav.prayer_times',   "مواقيت الصلاة"),       "url": \`\${origin}\${_pageUrlBase}\`                                          },
        { "@type": "SiteNavigationElement", "name": _navName('nav.qibla',          "اتجاه القبلة"),        "url": \`\${origin}\${_langPath}/qibla\`                                       },
        { "@type": "SiteNavigationElement", "name": _navName('nav.moon',           "القمر اليوم"),         "url": \`\${origin}\${_langPath}/moon-today\`                                  },
        { "@type": "SiteNavigationElement", "name": _navName('nav.zakat',          "حاسبة الزكاة"),        "url": \`\${origin}\${_langPath}/zakat-calculator\`                            },
        { "@type": "SiteNavigationElement", "name": _navName('nav.duas',           "الأذكار"),             "url": \`\${origin}\${_langPath}/azkar\`                                       },
        { "@type": "SiteNavigationElement", "name": _navName('nav.tasbih',         "المسبحة الإلكترونية"), "url": \`\${origin}\${_langPath}/msbaha\`                                      },
        { "@type": "SiteNavigationElement", "name": _navName('nav.hijri_today',    "التاريخ الهجري"),      "url": \`\${origin}\${_langPath}\${hijriDated}\`                              },
        { "@type": "SiteNavigationElement", "name": _navName('nav.hijri_calendar', "التقويم الهجري"),      "url": \`\${origin}\${_langPath}/hijri-calendar/\${hijriYear}\`               },
        { "@type": "SiteNavigationElement", "name": _navName('nav.date_converter', "تحويل التاريخ"),       "url": \`\${origin}\${_langPath}/dateconverter\`                              }
    ]
};`;

  // Insert helper variables ABOVE the schema definition. Anchor on the
  // line that begins the schema literal.
  const oldHelpers =
`    const origin      = window.SITE_URL || window.location.origin;
    const _hToday     = HijriDate.getToday();
    const hijriYear   = _hToday.year;
    const _p2         = (n) => String(n).padStart(2, '0');
    const hijriDated  = \`/hijri-date/\${_hToday.year}-\${_p2(_hToday.month)}-\${_p2(_hToday.day)}\`;
    const siteName    = 'مواقيت الصلاة';
    const siteDesc    = 'منصة إسلامية تعرض مواقيت الصلاة، التاريخ الهجري، تحويل التاريخ، اتجاه القبلة، القمر اليوم، وحاسبة الزكاة.';

    const schema = {`;

  const newHelpers =
`    const origin      = window.SITE_URL || window.location.origin;
    const _hToday     = HijriDate.getToday();
    const hijriYear   = _hToday.year;
    const _p2         = (n) => String(n).padStart(2, '0');
    const hijriDated  = \`/hijri-date/\${_hToday.year}-\${_p2(_hToday.month)}-\${_p2(_hToday.day)}\`;
    const siteName    = 'مواقيت الصلاة';
    const siteDesc    = 'منصة إسلامية تعرض مواقيت الصلاة، التاريخ الهجري، تحويل التاريخ، اتجاه القبلة، القمر اليوم، وحاسبة الزكاة.';

    // Phase D3.4 — localize SiteNavigationElement names + lang-prefix URLs
    const _lang        = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const _langPath    = (_lang === 'ar') ? '' : ('/' + _lang);
    const _pageUrlBase = _langPath + '/';
    const _navName     = (key, fallback) => {
        if (typeof t === 'function') {
            const v = t(key);
            if (v && v !== key) return v;
        }
        return fallback;
    };

    const schema = {`;

  txt = replaceExact(txt, 'app.js helper vars (lang/navName)', oldHelpers, newHelpers);
  txt = replaceExact(txt, 'app.js schema body (inLanguage + about + 9 nav)', oldBlock, newBlock);

  writeFileSync(PATH, txt);
  console.log('✅ js/app.js: injectHomepageSchema refactored — 10-lang dispatch + lang-prefixed URLs');
}

// ─────────────────────────────────────────────────────────────
// 3. llms.txt — replace "duas" → "azkar (adhkar)", expand 5 langs → 10,
//    add Home links for de/id/es/bn/ms.
// ─────────────────────────────────────────────────────────────
{
  const PATH = ROOT + 'llms.txt';
  const raw = readFileSync(PATH, 'utf8');

  const newContent = `# Prayer Times & Hijri Calendar

> Accurate daily Islamic prayer times (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha),
  Hijri calendar, Qibla direction, Zakat calculator, azkar (adhkar), and digital tasbih
  for cities worldwide. Supports Arabic, English, French, Turkish, Urdu,
  German, Indonesian, Spanish, Bengali, and Malay.

## Main pages
- [Home (Arabic)](https://prayer-times-d4w8.onrender.com/)
- [Home (English)](https://prayer-times-d4w8.onrender.com/en/)
- [Home (French)](https://prayer-times-d4w8.onrender.com/fr/)
- [Home (Turkish)](https://prayer-times-d4w8.onrender.com/tr/)
- [Home (Urdu)](https://prayer-times-d4w8.onrender.com/ur/)
- [Home (German)](https://prayer-times-d4w8.onrender.com/de/)
- [Home (Indonesian)](https://prayer-times-d4w8.onrender.com/id/)
- [Home (Spanish)](https://prayer-times-d4w8.onrender.com/es/)
- [Home (Bengali)](https://prayer-times-d4w8.onrender.com/bn/)
- [Home (Malay)](https://prayer-times-d4w8.onrender.com/ms/)
- [Sitemap](https://prayer-times-d4w8.onrender.com/sitemap.xml)

## Features
- Prayer times for any city via coordinates or search
- Hijri to Gregorian (and Gregorian to Hijri) date converter
- Qibla direction calculator with interactive compass
- Zakat (Islamic alms) calculator
- Collection of authentic azkar (adhkar) and du'as from Quran & Sunnah
- Digital tasbih counter with session persistence
- Moon phase tracking
- Multi-language: ar, en, fr, tr, ur, de, id, es, bn, ms
`;

  const isCRLF = /\r\n/.test(raw);
  const finalContent = isCRLF ? newContent.replace(/\n/g, '\r\n') : newContent;
  writeFileSync(PATH, finalContent);
  console.log('✅ llms.txt: updated — 10 langs, AZKAR rebrand, all home links present');
}

console.log('\n✅ Phase D3.4 (Option A) — Shared UI HIGH + MEDIUM cleanup complete.');
console.log('   Next: bump asset versions, restart preview, verify 8 langs.');
