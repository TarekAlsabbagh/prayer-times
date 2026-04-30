// Phase D3.1.2 verification — fetch each /lang/moon-today and look for visible
// english leak in the moon-edu section, OR for unrendered i18n keys like
// "moon.edu_..." appearing as raw text.
const langs = ['ar','en','fr','tr','ur','de','id','es','bn','ms'];
const langPath = (L) => (L === 'ar' ? '' : '/' + L) + '/moon-today';

// Sample English phrases that would appear if moon.edu_* fell back to English.
// We'll look for these (case-sensitive, surrounded by HTML).
const EN_FALLBACK_PHRASES = [
  'Understanding Moon Phases',           // moon.edu_title
  'The Lunar Cycle and the Eight Phases',// moon.edu_phases_title
  'Why Moon Times Differ Between Cities',// moon.edu_city_title (guess)
  'Why Moon Phases Matter in Islam',     // moon.edu_islam_title (guess)
  'Ramadan: fasting begins',             // moon.edu_islam_ramadan
  'Laylat al-Qadr (Night of Power)',     // moon.edu_islam_qadr
  'A lunar cycle takes about 29.5 days', // moon.edu_short_p1
];

console.log('## Phase D3.1.2 verification — moon.edu_* localization\n');
console.log('| Lang | URL | English-leak count | Sample heading | Status |');
console.log('|---|---|---:|---|---|');

let pass = 0, fail = 0;
for (const L of langs) {
  const url = langPath(L);
  const r = await fetch('http://localhost:3000' + url);
  const html = await r.text();
  // For non-en langs, count how many EN_FALLBACK_PHRASES appear (excluding script/JSON-LD blobs).
  // Strip <script> blocks first.
  const stripped = html.replace(/<script[\s\S]*?<\/script>/g, '');
  let leaks = 0;
  if (L !== 'en') {
    for (const ph of EN_FALLBACK_PHRASES) if (stripped.includes(ph)) leaks++;
  }
  // Look for visible h2 inside the moon-edu region. The container may be #moon-edu or class="moon-edu".
  const eduRegionMatch = stripped.match(/<section[^>]*(?:id|class)="(?:[^"]*\b)?moon-edu(?:\b[^"]*)?"[\s\S]*?<\/section>/i)
                       || stripped.match(/id="page-moon"[\s\S]*?<\/section>/i);
  let firstH = '—';
  if (eduRegionMatch) {
    const hMatch = eduRegionMatch[0].match(/<h[2-3][^>]*>([\s\S]*?)<\/h[2-3]>/);
    if (hMatch) firstH = hMatch[1].replace(/<[^>]+>/g,'').trim().slice(0, 60);
  }
  // Look for unrendered i18n key (would appear as 'moon.edu_X' literal text in DOM).
  const unrendered = (stripped.match(/moon\.edu_[a-z0-9_.]+/g) || []).length;

  const ok = (L === 'en') ? true : (leaks === 0 && unrendered === 0);
  if (ok) pass++; else fail++;
  const status = ok ? '✅' : '❌';
  console.log(`| ${L} | ${url} | ${leaks} | ${firstH} | ${status} |`);
}
console.log(`\n## Summary: ${pass}/${langs.length} pass`);
