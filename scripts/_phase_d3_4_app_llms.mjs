// Phase D3.4 (Option A) — app.js + llms.txt parts (i18n.js already done).
//   • app.js: refactor injectHomepageSchema to use t()-based nav names +
//     lang-prefixed URLs + correct inLanguage. Indentation: 16 spaces
//     (4 levels) for schema body.
//   • llms.txt: rebrand to AZKAR + 10 langs.

import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\';

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

// ─────────────────────────────────────────────────────────────
// 1. js/app.js — refactor injectHomepageSchema
// ─────────────────────────────────────────────────────────────
{
  const PATH = ROOT + 'js/app.js';
  const raw = readFileSync(PATH, 'utf8');

  // Idempotency guard
  if (raw.includes('// Phase D3.4 — localize SiteNavigationElement names')) {
    console.log('⏭  app.js already updated — skipping');
  } else {
    let txt = raw;

    // Edit A — helpers (above schema literal)
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

    txt = replaceExact(txt, 'app.js helpers', oldHelpers, newHelpers);

    // Edit B — schema body (16-space indent inside @graph)
    const oldBody =
`            {
                "@type": "WebSite",
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

    const newBody =
`            {
                "@type": "WebSite",
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
                    { "@type": "Thing", "name": _navName('nav.prayer_times',   "مواقيت الصلاة") },
                    { "@type": "Thing", "name": _navName('nav.hijri_today',    "التاريخ الهجري") },
                    { "@type": "Thing", "name": _navName('nav.date_converter', "تحويل التاريخ") },
                    { "@type": "Thing", "name": _navName('nav.qibla',          "اتجاه القبلة") },
                    { "@type": "Thing", "name": _navName('nav.moon',           "القمر اليوم") },
                    { "@type": "Thing", "name": _navName('nav.zakat',          "حاسبة الزكاة") }
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

    txt = replaceExact(txt, 'app.js schema body', oldBody, newBody);

    writeFileSync(PATH, txt);
    console.log('✅ js/app.js: injectHomepageSchema refactored — 10-lang dispatch + lang-prefixed URLs');
  }
}

// ─────────────────────────────────────────────────────────────
// 2. llms.txt
// ─────────────────────────────────────────────────────────────
{
  const PATH = ROOT + 'llms.txt';
  const raw = readFileSync(PATH, 'utf8');

  // Idempotency guard — if we already see /azkar mention or 10 langs listed, skip
  if (raw.includes('azkar (adhkar)') && raw.includes('Home (German)')) {
    console.log('⏭  llms.txt already updated — skipping');
  } else {
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
}

console.log('\n✅ D3.4-A app.js + llms.txt complete.');
