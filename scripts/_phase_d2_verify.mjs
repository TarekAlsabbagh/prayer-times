// Phase D2 verification: 4 page types × multiple cities/countries × 10 langs.
// Outputs Markdown report + summary stats + fallback detection.
import fs from 'fs';
import path from 'path';

// Resolve city → {lat,lng,nameEn} from db/cities-*.json (any country file).
const DB_DIR = path.resolve('db');
const CITY_BY_SLUG = {};
const slugify = (n) => String(n).toLowerCase().trim()
  .replace(/[\s_]+/g, '-').replace(/[^\wÀ-ɏ؀-ۿঀ-৿一-鿿-]/g, '')
  .replace(/-+/g, '-');
const files = fs.readdirSync(DB_DIR).filter(f => /^cities-[a-z]{2}\.json$/.test(f));
for (const f of files) {
  try {
    const arr = JSON.parse(fs.readFileSync(path.join(DB_DIR, f), 'utf8'));
    for (const e of arr) {
      if (e && e.nameEn && typeof e.lat === 'number' && typeof e.lng === 'number') {
        const slug = slugify(e.nameEn);
        if (!CITY_BY_SLUG[slug]) CITY_BY_SLUG[slug] = { slug, lat: e.lat, lng: e.lng, nameEn: e.nameEn };
      }
    }
  } catch (_e) { /* skip */ }
}

const langs = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];
const langPath = (lang, base) => (lang === 'ar' ? '' : '/' + lang) + base;

const cities = ['makkah','riyadh','london','jakarta','new-york','kuala-lumpur','rio-de-janeiro'];
const countries = ['saudi-arabia','united-kingdom','indonesia','united-states'];

// Probe geo for each city; if found, compose /about- URL with lat/lng (rounded as the app does).
function aboutPath(slug) {
  const g = CITY_BY_SLUG[slug];
  if (!g) return null;
  // Per server.js: lat/lng usually formatted to 2 decimals or as-stored. Use 2-decimal.
  const fmt = (n) => (Math.round(n * 100) / 100).toString();
  return `/about-${slug}-${fmt(g.lat)}-${fmt(g.lng)}`;
}

async function probe(url) {
  try {
    const r = await fetch('http://localhost:3000' + url, { redirect: 'follow' });
    const html = await r.text();
    const t = (html.match(/<title>([^<]*)<\/title>/) || [,''])[1];
    const d = (html.match(/<meta name="description" content="([^"]*)"/) || [,''])[1];
    const canon = (html.match(/<link rel="canonical" href="([^"]*)"/) || [,''])[1];
    const hreflang = (html.match(/<link rel="alternate"[^>]*hreflang=/g) || []).length;
    const sep = t.includes(' | ') ? '|' :
                t.includes(' — ') ? '—' :
                t.includes(' - ') ? '-' :
                t.includes(': ') ? ':' : '?';
    return {
      status: r.status,
      titleLen: [...t].length, title: t,
      descLen: [...d].length, desc: d,
      canonical: canon.replace('http://localhost:3000',''),
      hreflang, sep,
    };
  } catch (e) { return { error: String(e.message || e) }; }
}

const rows = [];

// 1) /prayer-times-in-{city}
for (const c of cities) {
  for (const lang of langs) {
    const url = langPath(lang, '/prayer-times-in-' + c);
    const r = await probe(url);
    rows.push({ pageType: 'prayer-times-in', city: c, lang, url, ...r });
  }
}

// 2) /qibla-in-{city}
for (const c of cities) {
  for (const lang of langs) {
    const url = langPath(lang, '/qibla-in-' + c);
    const r = await probe(url);
    rows.push({ pageType: 'qibla-in', city: c, lang, url, ...r });
  }
}

// 3) /prayer-times-in-{country-slug} (country listing route)
for (const co of countries) {
  for (const lang of langs) {
    const url = langPath(lang, '/prayer-times-in-' + co);
    const r = await probe(url);
    rows.push({ pageType: 'country', city: co, lang, url, ...r });
  }
}

// 4) /about-{slug}-{lat}-{lng}
for (const c of cities) {
  const ap = aboutPath(c);
  if (!ap) {
    for (const lang of langs) rows.push({ pageType: 'about', city: c, lang, url: '(no geo)', error: 'no city in DB' });
    continue;
  }
  for (const lang of langs) {
    const url = langPath(lang, ap);
    const r = await probe(url);
    rows.push({ pageType: 'about', city: c, lang, url, ...r });
  }
}

// Print report
console.log('# Phase D2 verification report\n');
console.log(`Tested ${rows.length} (page,lang) cells.\n`);

// Detect fallbacks: collect en title per (pageType,city); flag non-en/non-ar that match.
const enTitles = {};
for (const r of rows) if (r.lang === 'en' && r.title) enTitles[`${r.pageType}|${r.city}`] = r.title;

const fallbacks = rows.filter(r => r.lang !== 'ar' && r.lang !== 'en' && r.title &&
                                    enTitles[`${r.pageType}|${r.city}`] === r.title);
const wrongSep = rows.filter(r => r.title && r.sep !== '|');
const titleHigh = rows.filter(r => r.titleLen > 70);
const titleLow  = rows.filter(r => r.titleLen && r.titleLen < 45);
const descHigh  = rows.filter(r => r.descLen > 170);
const descLow   = rows.filter(r => r.descLen && r.descLen < 100);
const canonNonSelf = rows.filter(r => r.url && r.canonical && !r.canonical.endsWith(r.url));
const wrongHreflang = rows.filter(r => r.hreflang && r.hreflang !== 11);
const errors = rows.filter(r => r.error);

console.log('## Summary');
console.log(`- 200 OK: ${rows.filter(r=>r.status===200).length}/${rows.length}`);
console.log(`- Fallback (non-en/ar = en): ${fallbacks.length}`);
console.log(`- Sep ≠ "|": ${wrongSep.length}`);
console.log(`- Title >70: ${titleHigh.length}`);
console.log(`- Title <45 (excluding hijri-date / valid short): ${titleLow.length}`);
console.log(`- Desc >170: ${descHigh.length}`);
console.log(`- Desc <100: ${descLow.length}`);
console.log(`- Canonical ≠ self: ${canonNonSelf.length}`);
console.log(`- Hreflang ≠ 11: ${wrongHreflang.length}`);
console.log(`- Errors: ${errors.length}\n`);

// Print issues with details
const showIssues = (label, list, fmt = (r) => `${r.pageType}/${r.city}/${r.lang} → ${r.titleLen||'?'}|${r.descLen||'?'} sep=${r.sep||'?'} (${r.title || r.error})`) => {
  if (!list.length) return;
  console.log(`### ${label} (${list.length})`);
  for (const r of list.slice(0, 30)) console.log('- ' + fmt(r));
  if (list.length > 30) console.log(`...${list.length - 30} more`);
  console.log('');
};
showIssues('Fallback issues', fallbacks);
showIssues('Wrong separator', wrongSep);
showIssues('Title too long (>70)', titleHigh);
showIssues('Title too short (<45)', titleLow);
showIssues('Desc too long (>170)', descHigh);
showIssues('Desc too short (<100)', descLow);
showIssues('Canonical issues', canonNonSelf, r => `${r.url} → canonical=${r.canonical}`);
showIssues('Hreflang issues', wrongHreflang, r => `${r.url} → hreflang=${r.hreflang}`);
showIssues('Errors', errors, r => `${r.pageType}/${r.city}/${r.lang}: ${r.error}`);

// Detailed table per page type — first city only as exemplar
console.log('\n## Sample renders (first city per page type)\n');
const samples = ['prayer-times-in','qibla-in','country','about'];
for (const pt of samples) {
  const first = rows.find(r => r.pageType === pt && r.title);
  if (!first) continue;
  console.log(`### ${pt} (sample: ${first.city})`);
  console.log('| Lang | TitleLen | Title | DescLen | Desc |');
  console.log('|---|---:|---|---:|---|');
  for (const lang of langs) {
    const r = rows.find(x => x.pageType === pt && x.city === first.city && x.lang === lang);
    if (!r) continue;
    const t = (r.title || '').replace(/\|/g,'\\|');
    const d = (r.desc  || '').replace(/\|/g,'\\|').slice(0, 80);
    console.log(`| ${lang} | ${r.titleLen||'?'} | ${t} | ${r.descLen||'?'} | ${d}${(r.desc||'').length>80?'…':''} |`);
  }
  console.log('');
}
