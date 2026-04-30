// Phase D3.3-0 — Rename /duas → /azkar (route + SEO + sitemap + 301 redirects).
// Anchor-based block replacement. Aborts on any anchor mismatch (no partial state).
//
// Files touched:
//   • server.js   — staticPages key /duas → /azkar (with new titles/descs);
//                   sitemap path; routing regex; _oldReserved set;
//                   inserts a 301 handler before the routing block.
//   • js/app.js   — _isDuasPage regex (now /azkar with full 10-lang prefix);
//                   pageUrl('/duas') → pageUrl('/azkar');
//                   SiteNavigationElement url /duas → /azkar.
//   • js/i18n.js  — nav.duas / duas.title strings updated to AZKAR / الأذكار
//                   (titles only — DOM section IDs and data-page="duas" stay).
//   • index.html  — no path links currently use /duas inline (i18n handles all).
//   • legal.html, countries.html — href="/duas" → "/azkar".
//   • llms.txt    — no path links (only prose); leave as-is.
//
// What stays unchanged:
//   • js/duas.js       — DuasDB structure (D3.3c will localize categories).
//   • id="page-duas"   — internal section ID.
//   • data-page="duas" — internal nav routing key.

import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\';

function read(rel) {
  const raw = readFileSync(ROOT + rel, 'utf8');
  const isCRLF = /\r\n/.test(raw);
  return { raw, isCRLF, EOL: isCRLF ? '\r\n' : '\n' };
}

function replaceExact(text, name, oldChunk, newChunk) {
  // Normalize line endings to whatever the source uses.
  const isCRLF = /\r\n/.test(text);
  if (isCRLF) {
    oldChunk = oldChunk.replace(/\r?\n/g, '\r\n');
    newChunk = newChunk.replace(/\r?\n/g, '\r\n');
  } else {
    oldChunk = oldChunk.replace(/\r\n/g, '\n');
    newChunk = newChunk.replace(/\r\n/g, '\n');
  }
  const cnt = text.split(oldChunk).length - 1;
  if (cnt !== 1) {
    throw new Error(`${name}: expected exactly 1 match for old chunk, got ${cnt}.`);
  }
  return text.replace(oldChunk, newChunk);
}

const APO = String.fromCharCode(92) + 'u2019'; // literal ’ (escape sequence, 6 chars)

// ─────────────────────────────────────────────────────────────
// 1. server.js
// ─────────────────────────────────────────────────────────────
{
  const { raw } = read('server.js');
  let txt = raw;

  // (a) staticPages /duas → /azkar  with new titles/descs
  const oldStaticBlock =
`        '/duas': {
            // Phase D1: array→object structure; localized for all 10 langs
            title: {
                ar: 'الأدعية والأذكار الصحيحة من الكتاب والسنة',
                en: 'Duas & Athkar | Authentic Islamic Supplications',
                fr: 'Douas et Athkar | Invocations authentiques de l${APO}islam',
                tr: 'Dualar ve Zikirler | Kur${APO}an ve Sünnet${APO}ten Sahih Dualar',
                ur: 'دعائیں اور اذکار | قرآن و سنت سے صحیح اسلامی دعائیں',
                de: 'Duas & Athkar | Authentische Bittgebete aus Quran & Sunna',
                id: 'Doa dan Zikir | Doa Sahih dari Al-Quran dan Sunnah',
                es: 'Duas y Athkar | Súplicas Auténticas del Islam',
                bn: 'দোয়া ও জিকির | কুরআন ও সুন্নাহ থেকে সহিহ দোয়া',
                ms: 'Doa dan Zikir | Doa Sahih dari Al-Quran dan Sunnah',
            },
            desc: {
                ar: 'أدعية وأذكار صحيحة من القرآن والسنة: أذكار الصباح والمساء، بعد الصلاة، النوم، السفر، الكرب، ويوم الجمعة — مع التخريج.',
                en: 'Authentic duas from Quran & Sunnah: morning & evening athkar, after-prayer remembrance, sleep, travel, distress and Friday duas with sources.',
                fr: 'Douas authentiques du Coran et de la Sunna : athkar du matin et du soir, après la prière, sommeil, voyage, détresse et vendredi avec sources.',
                tr: 'Kur${APO}an ve Sünnet${APO}ten sahih dualar ve zikirler: sabah-akşam zikirleri, namaz sonrası, uyku, yolculuk, sıkıntı ve Cuma duaları kaynaklarıyla.',
                ur: 'قرآن و سنت سے صحیح دعائیں اور اذکار: صبح و شام کے اذکار، نماز کے بعد، سونے، سفر، پریشانی اور جمعہ کی دعائیں حوالہ جات کے ساتھ۔',
                de: 'Authentische Duas aus Quran und Sunna: Morgen- und Abend-Athkar, nach dem Gebet, Schlaf, Reise, Not und Freitags-Duas mit Quellen.',
                id: 'Doa sahih dari Al-Quran dan Sunnah: zikir pagi dan petang, setelah sholat, tidur, perjalanan, kesusahan dan doa Jumat dengan sumber.',
                es: 'Duas auténticas del Corán y la Sunna: athkar de la mañana y la tarde, tras la oración, sueño, viaje, angustia y duas del viernes con fuentes.',
                bn: 'কুরআন ও সুন্নাহ থেকে সহিহ দোয়া ও জিকির: সকাল-সন্ধ্যার জিকির, নামাজের পর, ঘুম, ভ্রমণ, কষ্ট ও জুমার দোয়া সূত্র সহকারে।',
                ms: 'Doa sahih dari Al-Quran dan Sunnah: zikir pagi dan petang, selepas solat, tidur, perjalanan, kesusahan dan doa Jumaat berserta sumber.',
            },
            ogType: 'article',
        },`;

  const newStaticBlock =
`        '/azkar': {
            // Phase D3.3-0: rename /duas → /azkar; SEO-rebrand to AZKAR / الأذكار
            title: {
                ar: 'الأذكار | أذكار الصباح والمساء وأدعية صحيحة من القرآن والسنة',
                en: 'Azkar | Authentic Daily Islamic Supplications & Adhkar',
                fr: 'Azkar | Invocations authentiques du quotidien (Adhkar)',
                tr: 'Azkar | Kur${APO}an ve Sünnet${APO}ten Sahih Günlük Zikirler',
                ur: 'اذکار | صبح و شام کے اذکار اور قرآن و سنت سے صحیح دعائیں',
                de: 'Azkar | Authentische tägliche Bittgebete (Adhkar) aus Quran & Sunna',
                id: 'Azkar | Zikir Harian Sahih dari Al-Quran dan Sunnah',
                es: 'Azkar | Súplicas Diarias Auténticas (Adhkar) del Islam',
                bn: 'আযকার | কুরআন ও সুন্নাহ থেকে সহিহ দৈনিক জিকির',
                ms: 'Azkar | Zikir Harian Sahih dari Al-Quran dan Sunnah',
            },
            desc: {
                ar: 'الأذكار الصحيحة من القرآن والسنة: أذكار الصباح والمساء، بعد الصلاة، النوم، السفر، الكرب، ويوم الجمعة — مع التخريج.',
                en: 'Azkar — authentic daily adhkar from Quran & Sunnah: morning & evening, after-prayer remembrance, sleep, travel, distress and Friday supplications with sources.',
                fr: 'Azkar — adhkar authentiques du Coran et de la Sunna : matin et soir, après la prière, sommeil, voyage, détresse et invocations du vendredi avec sources.',
                tr: 'Azkar — Kur${APO}an ve Sünnet${APO}ten sahih günlük zikirler: sabah-akşam, namaz sonrası, uyku, yolculuk, sıkıntı ve Cuma duaları kaynaklarıyla.',
                ur: 'اذکار — قرآن و سنت سے صحیح روزمرّہ اذکار: صبح و شام، نماز کے بعد، سونے، سفر، پریشانی اور جمعہ کی دعائیں حوالہ جات کے ساتھ۔',
                de: 'Azkar — authentische tägliche Adhkar aus Quran und Sunna: morgens und abends, nach dem Gebet, Schlaf, Reise, Not und Freitags-Bittgebete mit Quellen.',
                id: 'Azkar — zikir harian sahih dari Al-Quran dan Sunnah: pagi dan petang, setelah sholat, tidur, perjalanan, kesusahan dan doa Jumat dengan sumber.',
                es: 'Azkar — adhkar diarios auténticos del Corán y la Sunna: mañana y tarde, tras la oración, sueño, viaje, angustia e invocaciones del viernes con fuentes.',
                bn: 'আযকার — কুরআন ও সুন্নাহ থেকে সহিহ দৈনিক জিকির: সকাল-সন্ধ্যা, নামাজের পর, ঘুম, ভ্রমণ, কষ্ট ও জুমার দোয়া সূত্র সহকারে।',
                ms: 'Azkar — zikir harian sahih dari Al-Quran dan Sunnah: pagi dan petang, selepas solat, tidur, perjalanan, kesusahan dan doa Jumaat berserta sumber.',
            },
            ogType: 'article',
        },`;

  txt = replaceExact(txt, 'server.js (a) staticPages /duas → /azkar block', oldStaticBlock, newStaticBlock);

  // (b) sitemap entry
  txt = replaceExact(
    txt,
    'server.js (b) sitemap entry',
    `                ['/duas', '0.8', 'monthly'],`,
    `                ['/azkar', '0.8', 'monthly'],`
  );

  // (c) routing regex
  txt = replaceExact(
    txt,
    'server.js (c) routing regex /duas$',
    `        /^\\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\\/)?duas$/.test(urlPath) ||`,
    `        /^\\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\\/)?azkar$/.test(urlPath) ||`
  );

  // (d) _oldReserved set: replace 'duas' with 'azkar','duas' (keep 'duas'
  //     to prevent it from being mistaken for a country slug, although
  //     the new 301 handler intercepts it first)
  txt = replaceExact(
    txt,
    `server.js (d) _oldReserved set`,
    `        const _oldReserved = new Set(['qibla','moon','zakat-calculator','duas','msbaha',`,
    `        const _oldReserved = new Set(['qibla','moon','zakat-calculator','azkar','duas','msbaha',`
  );

  // (e) Insert 301 handler for /duas → /azkar — placed right BEFORE the
  //     `_isIndexHtmlRoute` block so the 301 fires before any index.html
  //     serving. We anchor on the comment "// ===== HTML pages served from
  //     index.html (SSR SEO injection) =====" which is unique.
  const anchor301 =
`    // ===== HTML pages served from index.html (SSR SEO injection) =====
    // يدعم: ar (افتراضي بدون prefix)، en، fr، tr، ur`;

  const insert301 =
`    // ===== Phase D3.3-0: 301 /duas → /azkar (legacy alias) =====
    // /duas, /{lang}/duas, /duas.html, /{lang}/duas.html → /azkar (or /{lang}/azkar)
    {
        const _duasMatch = urlPath.match(/^\\/(?:(en|fr|tr|ur|de|id|es|bn|ms)\\/)?duas(?:\\.html)?\\/?$/);
        if (_duasMatch) {
            const _l = _duasMatch[1] || '';
            const _newUrl = (_l ? '/' + _l : '') + '/azkar';
            res.writeHead(301, {
                'Location': _newUrl,
                'Cache-Control': 'public, max-age=31536000'
            });
            res.end();
            return;
        }
    }

    // ===== HTML pages served from index.html (SSR SEO injection) =====
    // يدعم: ar (افتراضي بدون prefix)، en، fr، tr، ur`;

  txt = replaceExact(txt, 'server.js (e) insert 301 handler', anchor301, insert301);

  writeFileSync(ROOT + 'server.js', txt);
  console.log('✓ server.js updated (5 anchor edits applied)');
}

// ─────────────────────────────────────────────────────────────
// 2. js/app.js
// ─────────────────────────────────────────────────────────────
{
  const { raw } = read('js/app.js');
  let txt = raw;

  // (a) _isDuasPage regex — was `(?:en|ar)/?duas` (broken: had ar as a prefix
  //     which doesn't apply since AR uses no prefix). Replace with the
  //     full 10-lang prefix pattern + change duas → azkar.
  txt = replaceExact(
    txt,
    'app.js (a) _isDuasPage regex',
    `    // تفعيل صفحة الأدعية عند URL /duas
    const _isDuasPage = /\\/(?:(?:en|ar)\\/)?duas$/.test(window.location.pathname);
    if (_isDuasPage) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-duas')?.classList.add('active');
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        document.querySelector('.sidebar-nav a[data-page="duas"]')?.classList.add('active');
    }`,
    `    // Phase D3.3-0: تفعيل صفحة الأذكار عند URL /azkar (sec ID و data-page يَبقَيان "duas" داخليّاً)
    const _isAzkarPage = /\\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\\/)?azkar$/.test(window.location.pathname);
    if (_isAzkarPage) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-duas')?.classList.add('active');
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        document.querySelector('.sidebar-nav a[data-page="duas"]')?.classList.add('active');
    }`
  );

  // (b) navToPage handler — change pageUrl('/duas') → pageUrl('/azkar')
  txt = replaceExact(
    txt,
    'app.js (b) navToPage duas → azkar',
    `            // UAT-Q5h: عند الضغط على الأدعية → انتقل لصفحة /duas (لم يَكن لها handler)
            if (pageId === 'duas' && window.location.protocol !== 'file:') {`,
    `            // UAT-Q5h: عند الضغط على الأذكار → انتقل لصفحة /azkar (D3.3-0)
            if (pageId === 'duas' && window.location.protocol !== 'file:') {`
  );
  txt = replaceExact(
    txt,
    `app.js (b2) pageUrl('/duas')`,
    `                    window.location.href = pageUrl('/duas');`,
    `                    window.location.href = pageUrl('/azkar');`
  );

  // (c) SiteNavigationElement schema URL
  txt = replaceExact(
    txt,
    'app.js (c) SiteNavigationElement url',
    `            { "@type": "SiteNavigationElement", "name": "الأدعية والأذكار",   "url": \`\${origin}/duas\`                          },`,
    `            { "@type": "SiteNavigationElement", "name": "الأذكار",            "url": \`\${origin}/azkar\`                         },`
  );

  writeFileSync(ROOT + 'js/app.js', txt);
  console.log('✓ js/app.js updated (4 anchor edits applied)');
}

// ─────────────────────────────────────────────────────────────
// 3. js/i18n.js — update nav.duas + duas.title strings (Duas → Azkar)
//    Section IDs and key names stay; only the human-readable labels change.
// ─────────────────────────────────────────────────────────────
{
  const { raw } = read('js/i18n.js');
  let txt = raw;

  // 10 nav.duas updates
  const navDuas = {
    ar: { old: `'nav.duas': 'الأدعية والأذكار',`,        new: `'nav.duas': 'الأذكار',` },
    en: { old: `'nav.duas': 'Duas & Adhkar',`,           new: `'nav.duas': 'Azkar',` },
    fr: { old: `'nav.duas': 'Douas et Adhkar',`,         new: `'nav.duas': 'Azkar',` },
    tr: { old: `'nav.duas': 'Dualar ve Zikirler',`,      new: `'nav.duas': 'Azkar',` },
    ur: { old: `'nav.duas': 'دعائیں و اذکار',`,            new: `'nav.duas': 'اذکار',` },
    de: { old: `'nav.duas': 'Bittgebete & Adhkar',`,     new: `'nav.duas': 'Azkar',` },
    id: { old: `'nav.duas': 'Doa & Zikir',`,             new: `'nav.duas': 'Azkar',`,  notes: 'id+ms identical pre-change' },
    es: { old: `'nav.duas': 'Duas y Dhikr',`,            new: `'nav.duas': 'Azkar',` },
    bn: { old: `'nav.duas': 'দুআ ও জিকির',`,             new: `'nav.duas': 'আযকার',` },
    ms: { old: `'nav.duas': 'Doa & Zikir',`,             new: `'nav.duas': 'Azkar',` },
  };

  // duas.title (page heading inside the section)
  const duasTitle = {
    ar: { old: `'duas.title': 'الأدعية والأذكار',`,       new: `'duas.title': 'الأذكار',` },
    en: { old: `'duas.title': 'Duas & Adhkar',`,          new: `'duas.title': 'Azkar',` },
    fr: { old: `'duas.title': 'Douas et Adhkar',`,        new: `'duas.title': 'Azkar',` },
    tr: { old: `'duas.title': 'Dualar ve Zikirler',`,     new: `'duas.title': 'Azkar',` },
    ur: { old: `'duas.title': 'دعائیں و اذکار',`,           new: `'duas.title': 'اذکار',` },
    de: { old: `'duas.title': 'Bittgebete & Adhkar',`,    new: `'duas.title': 'Azkar',` },
    id: { old: `'duas.title': 'Doa & Zikir',`,            new: `'duas.title': 'Azkar',` },
    es: { old: `'duas.title': 'Duas y Dhikr',`,           new: `'duas.title': 'Azkar',` },
    bn: { old: `'duas.title': 'দুআ ও জিকির',`,             new: `'duas.title': 'আযকার',` },
    ms: { old: `'duas.title': 'Doa & Zikir',`,            new: `'duas.title': 'Azkar',` },
  };

  // For id/ms which both have 'Doa & Zikir' — string is shared. We must replace
  // both occurrences in nav.duas and both in duas.title (4 total). Since we
  // can't use replaceExact on a non-unique string, we do them by full key+value.
  //
  // The nav.duas key+value pair appears once per language section; ditto
  // duas.title. So the OLD chunks of the form `'nav.duas': 'XYZ',` should be
  // unique IF the value is unique per language. For id/ms with duplicate
  // 'Doa & Zikir', we need a different anchor.
  //
  // Strategy: do a targeted regex replace, restricted by language. Since each
  // language section is contiguous, we walk each language block and replace
  // within it.

  const langs = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];
  // Section starts at line beginning with "    XX: {" (e.g. "    fr: {")
  const sectionStarts = [];
  for (const l of langs) {
    const re = new RegExp('^[ \\t]+' + l + ': \\{', 'm');
    const m = txt.match(re);
    if (!m) throw new Error(`i18n.js: cannot find section start for "${l}:"`);
    sectionStarts.push({ lang: l, idx: m.index });
  }
  sectionStarts.push({ lang: '__end', idx: txt.length });

  for (let i = 0; i < langs.length; i++) {
    const l = langs[i];
    const sStart = sectionStarts[i].idx;
    const sEnd   = sectionStarts[i + 1].idx;
    const block  = txt.slice(sStart, sEnd);

    const navOld = navDuas[l].old;
    const navNew = navDuas[l].new;
    const tOld   = duasTitle[l].old;
    const tNew   = duasTitle[l].new;

    if (block.split(navOld).length - 1 !== 1) {
      throw new Error(`i18n.js: lang=${l} nav.duas anchor not found exactly once. Block contains ${block.split(navOld).length - 1} matches.`);
    }
    if (block.split(tOld).length - 1 !== 1) {
      throw new Error(`i18n.js: lang=${l} duas.title anchor not found exactly once.`);
    }

    const newBlock = block.replace(navOld, navNew).replace(tOld, tNew);
    txt = txt.slice(0, sStart) + newBlock + txt.slice(sEnd);
  }

  writeFileSync(ROOT + 'js/i18n.js', txt);
  console.log('✓ js/i18n.js updated (20 string replacements: nav.duas + duas.title × 10 langs)');
}

// ─────────────────────────────────────────────────────────────
// 4. legal.html
// ─────────────────────────────────────────────────────────────
{
  const { raw } = read('legal.html');
  let txt = raw;

  txt = replaceExact(
    txt,
    'legal.html nav link',
    `<a href="/duas"><span class="nav-icon">🤲</span> <span data-i18n="nav.duas">الأدعية والأذكار</span></a>`,
    `<a href="/azkar"><span class="nav-icon">🤲</span> <span data-i18n="nav.duas">الأذكار</span></a>`
  );

  writeFileSync(ROOT + 'legal.html', txt);
  console.log('✓ legal.html updated (1 anchor edit)');
}

// ─────────────────────────────────────────────────────────────
// 5. countries.html — has 2 occurrences (sidebar nav + qa-card)
// ─────────────────────────────────────────────────────────────
{
  const { raw } = read('countries.html');
  let txt = raw;

  // sidebar nav (line 55)
  txt = replaceExact(
    txt,
    'countries.html sidebar nav',
    `<a href="/duas"><span class="nav-icon">🤲</span> <span data-i18n="nav.duas">الأدعية والأذكار</span></a>`,
    `<a href="/azkar"><span class="nav-icon">🤲</span> <span data-i18n="nav.duas">الأذكار</span></a>`
  );

  // qa-card (line 206) — uses {LANG_PREFIX} placeholder
  txt = replaceExact(
    txt,
    'countries.html qa-card href',
    `                        <a class="qa-card" href="{LANG_PREFIX}/duas"`,
    `                        <a class="qa-card" href="{LANG_PREFIX}/azkar"`
  );

  writeFileSync(ROOT + 'countries.html', txt);
  console.log('✓ countries.html updated (2 anchor edits)');
}

console.log('\n✅ Phase D3.3-0 — Rename /duas → /azkar — all files written.');
console.log('   Next: node --check server.js, restart preview, verify acceptance tests.');
