// Phase D3.3c — AZKAR categories + count label localization.
// Atomic changes:
//   1. js/duas.js  — convert each category's `name: 'AR string'` to a
//      10-lang object literal (8 categories × 10 langs = 80 entries);
//      rename `const DuasDB` → `const AzkarDB` and add a backward-compat
//      alias `const DuasDB = AzkarDB;` so any external/legacy reference
//      still works.
//   2. js/i18n.js  — add `azkar.count_label` (10 langs) with {count}
//      placeholder.
//   3. js/app.js   — replace hardcoded `cat.name` and "${count} ذكر" in the
//      AZKAR list/detail render with t()-based lookups; switch the two
//      call sites from `DuasDB` → `AzkarDB` (the alias keeps backward
//      compatibility, but using the new name keeps the code consistent
//      with the AZKAR rebrand).
//
// What stays unchanged (per phase scope):
//   • Du'a text (Arabic religious content)  — AzkarDB.duas[i].text
//   • Reference (hadith book names)         — AzkarDB.duas[i].reference
//   • Category icons (emoji)                — AzkarDB.categories[i].icon
//   • Filename js/duas.js                   — kept (avoids sw.js cache
//                                              invalidation + index.html
//                                              script tag rewrite)
//   • /azkar route, canonical, hreflang, sitemap

import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\';

// ─────────────────────────────────────────────────────────────
// 1. Category translations (8 categories × 10 langs = 80 entries)
// ─────────────────────────────────────────────────────────────
const CATS = {
  morning: {
    ar: 'أذكار الصباح',
    en: 'Morning Azkar',
    fr: 'Azkar du matin',
    tr: 'Sabah zikirleri',
    ur: 'صبح کے اذکار',
    de: 'Morgen-Azkar',
    id: 'Azkar pagi',
    es: 'Azkar de la mañana',
    bn: 'সকালের আজকার',
    ms: 'Azkar pagi',
  },
  evening: {
    ar: 'أذكار المساء',
    en: 'Evening Azkar',
    fr: 'Azkar du soir',
    tr: 'Akşam zikirleri',
    ur: 'شام کے اذکار',
    de: 'Abend-Azkar',
    id: 'Azkar petang',
    es: 'Azkar de la tarde',
    bn: 'সন্ধ্যার আজকার',
    ms: 'Azkar petang',
  },
  'after-prayer': {
    ar: 'أذكار بعد الصلاة',
    en: 'Post-prayer Azkar',
    fr: 'Azkar après la prière',
    tr: 'Namaz sonrası zikirler',
    ur: 'نماز کے بعد کے اذکار',
    de: 'Azkar nach dem Gebet',
    id: 'Azkar setelah sholat',
    es: 'Azkar después de la oración',
    bn: 'নামাজের পরের আজকার',
    ms: 'Azkar selepas solat',
  },
  sleep: {
    ar: 'أذكار النوم',
    en: 'Sleep Azkar',
    fr: 'Azkar avant le sommeil',
    tr: 'Uyku zikirleri',
    ur: 'سوتے وقت کے اذکار',
    de: 'Schlaf-Azkar',
    id: 'Azkar tidur',
    es: 'Azkar antes de dormir',
    bn: 'ঘুমের আজকার',
    ms: 'Azkar tidur',
  },
  wakeup: {
    ar: 'أذكار الاستيقاظ',
    en: 'Waking Azkar',
    fr: 'Azkar du réveil',
    tr: 'Uyanış zikirleri',
    ur: 'جاگنے کے اذکار',
    de: 'Azkar beim Aufwachen',
    id: 'Azkar bangun tidur',
    es: 'Azkar al despertar',
    bn: 'জাগরণের আজকার',
    ms: 'Azkar bangun tidur',
  },
  quran: {
    ar: 'أدعية من القرآن',
    en: 'Du’as from the Qur’an',
    fr: 'Invocations du Coran',
    tr: 'Kur’an’dan dualar',
    ur: 'قرآنی دعائیں',
    de: 'Bittgebete aus dem Quran',
    id: 'Doa dari Al-Quran',
    es: 'Súplicas del Corán',
    bn: 'কুরআনের দোয়া',
    ms: 'Doa daripada Al-Quran',
  },
  general: {
    ar: 'أدعية عامة',
    en: 'General Du’as',
    fr: 'Invocations générales',
    tr: 'Genel dualar',
    ur: 'عام دعائیں',
    de: 'Allgemeine Bittgebete',
    id: 'Doa umum',
    es: 'Súplicas generales',
    bn: 'সাধারণ দোয়া',
    ms: 'Doa am',
  },
  travel: {
    ar: 'أدعية السفر',
    en: 'Travel Du’as',
    fr: 'Invocations du voyage',
    tr: 'Yolculuk duaları',
    ur: 'سفر کی دعائیں',
    de: 'Reise-Bittgebete',
    id: 'Doa perjalanan',
    es: 'Súplicas del viaje',
    bn: 'ভ্রমণের দোয়া',
    ms: 'Doa perjalanan',
  },
};

// Validate that all 8 categories cover all 10 langs
const REQ_LANGS = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];
for (const id of Object.keys(CATS)) {
  for (const l of REQ_LANGS) {
    if (!CATS[id][l]) throw new Error(`CATS missing: ${id}/${l}`);
  }
}
console.log(`✓ Category translations validated: ${Object.keys(CATS).length} cats × ${REQ_LANGS.length} langs`);

// ─────────────────────────────────────────────────────────────
// 2. Count label translations (10 langs)
// ─────────────────────────────────────────────────────────────
const COUNT_LABEL = {
  ar: '{count} ذكر',
  en: '{count} azkar',
  fr: '{count} azkar',
  tr: '{count} zikir',
  ur: '{count} اذکار',
  de: '{count} Azkar',
  id: '{count} azkar',
  es: '{count} azkar',
  bn: '{count} আজকার',
  ms: '{count} azkar',
};

// ─────────────────────────────────────────────────────────────
// 3. js/duas.js — convert each `name: 'X'` to multi-lang object
//    + rename `const DuasDB = {` → `const AzkarDB = {` + alias for compat
// ─────────────────────────────────────────────────────────────
{
  const PATH = ROOT + 'js/duas.js';
  const raw = readFileSync(PATH, 'utf8');
  const isCRLF = /\r\n/.test(raw);
  const EOL = isCRLF ? '\r\n' : '\n';
  let txt = raw;

  // Rename top-level const + plan to add alias at the EOF (only if not already done)
  let needsAlias = false;
  if (txt.includes('const DuasDB = {') && !txt.includes('const AzkarDB = {')) {
    txt = txt.replace(
      'const DuasDB = {',
      'const AzkarDB = {'
    );
    if (!txt.includes('const AzkarDB = {')) {
      throw new Error('duas.js: rename DuasDB → AzkarDB failed');
    }
    needsAlias = true;
    console.log('✓ duas.js: renamed `const DuasDB =` → `const AzkarDB =`');
  }

  // For each category, find the line `id: 'X',` then a few lines below
  // is `name: 'AR string',`. We replace the name line with a multi-line
  // object literal indented to match the surrounding code (12 spaces).
  const NAME_INDENT = '            '; // 12 spaces (existing indent for name line)
  const OBJ_INDENT  = '                '; // 16 spaces (one level deeper for object props)

  function buildNameObject(cat) {
    const lines = [`name: {`];
    for (const l of REQ_LANGS) {
      const v = CATS[cat][l];
      // Escape single quotes
      const escaped = v.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      lines.push(`${OBJ_INDENT}${l}: '${escaped}',`);
    }
    lines.push(`${NAME_INDENT}},`);
    return lines.join(EOL);
  }

  // Order in which categories appear in duas.js
  const orderInFile = ['morning','evening','after-prayer','sleep','wakeup','quran','general','travel'];

  // Find each category by its id, then locate the name line within that block.
  let currentPos = 0;
  for (const cat of orderInFile) {
    const idMarker = `id: '${cat}',`;
    const idIdx = txt.indexOf(idMarker, currentPos);
    if (idIdx === -1) {
      throw new Error(`Cannot find id marker '${cat}' in duas.js`);
    }

    // Find the next `name: '...'` line (single-quoted Arabic string)
    // limited to within this category block (until next "id: 'X'" or "}").
    const nextIdIdx = txt.indexOf(`id: '`, idIdx + idMarker.length);
    const blockEnd = (nextIdIdx === -1) ? txt.length : nextIdIdx;
    const block = txt.slice(idIdx, blockEnd);

    // Match the name line — single quoted, possibly any chars
    const nameRe = /^([ \t]+)name:[ \t]*'([^']*)',[ \t]*\r?\n/m;
    const nameMatch = block.match(nameRe);
    if (!nameMatch) {
      throw new Error(`Cannot find name line for cat '${cat}'`);
    }
    if (nameMatch[2] !== CATS[cat].ar) {
      throw new Error(`Expected AR='${CATS[cat].ar}' for cat '${cat}', got '${nameMatch[2]}'`);
    }
    const indent = nameMatch[1];

    // Build replacement: indent + name object literal
    const nameObj = buildNameObject(cat);
    const newName = indent + nameObj + EOL;

    // Apply within full txt
    const absStart = idIdx + nameMatch.index;
    const absEnd   = absStart + nameMatch[0].length;
    txt = txt.slice(0, absStart) + newName + txt.slice(absEnd);

    // Advance currentPos past this category to find next id marker
    currentPos = absStart + newName.length;
    console.log(`✓ Converted name for cat='${cat}'`);
  }

  // Append backward-compat alias at EOF (after the closing `};` of the
  // AzkarDB literal). This keeps any external code that still references
  // `DuasDB` working (zero risk for missed call sites or service-worker
  // cached older app.js bundles).
  if (needsAlias && !txt.includes('const DuasDB = AzkarDB')) {
    // Trim any trailing whitespace then append alias + final newline
    txt = txt.replace(/\s*$/, '');
    txt += EOL + EOL + '// Phase D3.3c — backward-compat alias (legacy name)' + EOL +
           'const DuasDB = AzkarDB;' + EOL;
    console.log('✓ duas.js: appended alias `const DuasDB = AzkarDB;`');
  }

  writeFileSync(PATH, txt);
  console.log('✅ js/duas.js: 8 category names → 10-lang objects + DuasDB→AzkarDB rename + alias');
}

// ─────────────────────────────────────────────────────────────
// 4. js/i18n.js — add azkar.count_label per lang (anchor: tasbih.allahu_akbar)
// ─────────────────────────────────────────────────────────────
{
  const PATH = ROOT + 'js/i18n.js';
  const raw = readFileSync(PATH, 'utf8');
  const isCRLF = /\r\n/.test(raw);
  const EOL = isCRLF ? '\r\n' : '\n';
  const INDENT = '        ';

  // Anchor: tasbih.allahu_akbar (last D3.3b-inserted key per lang)
  const allMatches = [...raw.matchAll(/^[ \t]+'tasbih\.allahu_akbar': '[^']*',[ \t]*$/gm)];
  if (allMatches.length !== 10) {
    throw new Error(`Expected 10 tasbih.allahu_akbar anchors, got ${allMatches.length}`);
  }
  const fileLangOrder = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];

  let txt = raw;
  // Insert from end to start
  for (let i = fileLangOrder.length - 1; i >= 0; i--) {
    const lang = fileLangOrder[i];
    const m = allMatches[i];
    const matchEnd = m.index + m[0].length;
    const after = raw.slice(matchEnd, matchEnd + 80);
    if (/azkar\.count_label/.test(after)) {
      throw new Error(`Lang ${lang}: azkar.count_label already exists`);
    }
    const v = COUNT_LABEL[lang];
    const escaped = v.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const newLine = EOL + INDENT + `'azkar.count_label': '${escaped}',`;
    txt = txt.slice(0, matchEnd) + newLine + txt.slice(matchEnd);
    console.log(`✓ Inserted azkar.count_label for lang=${lang}`);
  }
  writeFileSync(PATH, txt);
  console.log(`✅ js/i18n.js: 10 azkar.count_label entries inserted`);
}

// ─────────────────────────────────────────────────────────────
// 5. js/app.js — refactor render to use localized name + count label
// ─────────────────────────────────────────────────────────────
{
  const PATH = ROOT + 'js/app.js';
  const raw = readFileSync(PATH, 'utf8');
  const isCRLF = /\r\n/.test(raw);
  const EOL = isCRLF ? '\r\n' : '\n';

  function replaceExact(text, name, oldChunk, newChunk) {
    const isCRLF2 = /\r\n/.test(text);
    if (isCRLF2) {
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

  // Edit A — replace initDuas() body (line 20932-20942) to use AzkarDB +
  // localized name + localized count label.
  const oldA =
`    DuasDB.categories.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'dua-category';
        div.onclick = () => showDuaCategory(cat.id);
        div.innerHTML = \`
            <span class="icon">\${cat.icon}</span>
            <div class="name">\${cat.name}</div>
            <div class="count">\${cat.duas.length} ذكر</div>
        \`;
        container.appendChild(div);
    });`;

  const newA =
`    // Phase D3.3c — pick localized category name + count label (AzkarDB)
    const _lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const _pickCatName = (cat) => {
        if (cat.name && typeof cat.name === 'object') {
            return cat.name[_lang] || cat.name.en || cat.name.ar || cat.id;
        }
        return cat.name; // legacy string fallback
    };
    const _countLabel = (n) => (typeof t === 'function')
        ? t('azkar.count_label', { count: n })
        : (n + ' ذكر');

    AzkarDB.categories.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'dua-category';
        div.onclick = () => showDuaCategory(cat.id);
        div.innerHTML = \`
            <span class="icon">\${cat.icon}</span>
            <div class="name">\${_pickCatName(cat)}</div>
            <div class="count">\${_countLabel(cat.duas.length)}</div>
        \`;
        container.appendChild(div);
    });`;

  txt = replaceExact(txt, 'app.js (A) initDuas render', oldA, newA);

  // Edit B — showDuaCategory: AzkarDB lookup + localized title
  const oldB =
`function showDuaCategory(categoryId) {
    const category = DuasDB.categories.find(c => c.id === categoryId);
    if (!category) return;

    // تحديث النشط
    document.querySelectorAll('.dua-category').forEach(c => c.classList.remove('active'));
    event.currentTarget?.classList.add('active');

    const listSection = document.getElementById('dua-list-section');
    listSection.style.display = 'block';
    document.getElementById('dua-list-title').textContent = category.icon + ' ' + category.name;`;

  const newB =
`function showDuaCategory(categoryId) {
    const category = AzkarDB.categories.find(c => c.id === categoryId);
    if (!category) return;

    // تحديث النشط
    document.querySelectorAll('.dua-category').forEach(c => c.classList.remove('active'));
    event.currentTarget?.classList.add('active');

    const listSection = document.getElementById('dua-list-section');
    listSection.style.display = 'block';
    // Phase D3.3c — localized name in detail title
    const _langB = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ar';
    const _catName = (category.name && typeof category.name === 'object')
        ? (category.name[_langB] || category.name.en || category.name.ar || category.id)
        : category.name;
    document.getElementById('dua-list-title').textContent = category.icon + ' ' + _catName;`;

  txt = replaceExact(txt, 'app.js (B) showDuaCategory title', oldB, newB);

  writeFileSync(PATH, txt);
  console.log('✅ js/app.js: 2 anchor edits — initDuas render + showDuaCategory title');
}

console.log('\n✅ Phase D3.3c — AZKAR categories + count label localization complete.');
console.log('   Next: bump asset versions, restart preview, verify 8 langs.');
