// GLOBAL-PLACE-SEARCH-CJK-SEARCH-FIX-1 — adds native-script CJK aliases
// to existing curated CN/JP entries so raw-CJK queries (東京 / 京都市 /
// 北京市 / etc.) hit tier 1 search match WITHOUT depending on Nominatim.
//
// The existing `_searchCuratedPlaces` already iterates `aliases.*` arrays
// when building candidate strings (server.js:158-163), so simply adding
// `aliases.ja`/`aliases.zh` arrays makes them searchable. No code change
// to the search loop is needed.
//
// `_normSearchText` (server.js:82) does NOT strip CJK characters —
// lowercase is a no-op on CJK, and the NFD strip only removes combining
// marks (U+0300-U+036F), which CJK chars don't decompose into. CJK
// query → CJK normalized → ILIKE substring match → curated hit.
//
// For discovered_places (Supabase), the existing generated `search_blob`
// column concatenates `aliases::text` which JSON-stringifies ALL alias
// keys (including .ja / .zh), so the same DB-side ILIKE match works.

import fs from 'node:fs';

const PATH = './db/places/curated-places.json';
const places = JSON.parse(fs.readFileSync(PATH, 'utf8'));

const CJK_ALIASES = {
    // ── Japan: ja = both bare name and "-city/-prefecture" forms ──
    'tokyo':      { ja: ['東京', '東京都'] },
    'osaka':      { ja: ['大阪', '大阪市', '大阪府'] },
    'kyoto':      { ja: ['京都', '京都市', '京都府'] },
    'yokohama':   { ja: ['横浜', '横浜市', '横濱'] },
    'sapporo':    { ja: ['札幌', '札幌市'] },
    'nagoya':     { ja: ['名古屋', '名古屋市'] },
    'kobe':       { ja: ['神戸', '神戸市'] },
    'fukuoka':    { ja: ['福岡', '福岡市'] },
    'hiroshima':  { ja: ['広島', '広島市'] },
    'nagasaki':   { ja: ['長崎', '長崎市'] },
    // ── China: zh covers Simplified + occasionally Traditional ──
    'beijing':    { zh: ['北京', '北京市'] },
    'shanghai':   { zh: ['上海', '上海市'] },
    'guangzhou':  { zh: ['广州', '广州市', '廣州'] },
    'shenzhen':   { zh: ['深圳', '深圳市'] },
    'xian':       { zh: ['西安', '西安市'] },
    'hangzhou':   { zh: ['杭州', '杭州市'] },
    'nanjing':    { zh: ['南京', '南京市'] },
    'chengdu':    { zh: ['成都', '成都市'] },
    'wuhan':      { zh: ['武汉', '武漢', '武汉市'] },
    'chongqing':  { zh: ['重庆', '重慶', '重庆市'] }
};

let updated = 0;
for (const p of places) {
    const add = CJK_ALIASES[p.slug];
    if (!add) continue;
    if (!p.aliases || typeof p.aliases !== 'object') p.aliases = {};
    for (const [lang, arr] of Object.entries(add)) {
        const existing = Array.isArray(p.aliases[lang]) ? p.aliases[lang] : [];
        // Merge — keep unique, preserve order, add new entries.
        const merged = [...existing];
        for (const v of arr) if (!merged.includes(v)) merged.push(v);
        p.aliases[lang] = merged;
    }
    updated++;
}

fs.writeFileSync(PATH, JSON.stringify(places, null, 2) + '\n');
console.log('Updated', updated, '/', Object.keys(CJK_ALIASES).length, 'entries.');
console.log('Total places:', places.length);
