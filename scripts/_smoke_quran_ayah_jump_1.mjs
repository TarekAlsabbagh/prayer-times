// Smoke — QURAN ayah jump: numeric input (1..112) with JS smooth-scroll+highlight AND a no-JS
// server Form/Redirect fallback (GET ?ayah=N -> 302 /quran/surah/21#ayah-N). No innerHTML text writes.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'js', 'quran.js'), 'utf8');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const b0 = src.indexOf('function _buildQuranSurahBody(n)');
const b = src.slice(b0, src.indexOf('// ===== HTTP Server =====', b0));
// (a) the SSR form: GET, targets the route, numeric 1..112, with an error node
ok(/<form class="quran-jump quran-ayah-jump" method="get" action="\/quran\/surah\/\$\{surah\.surah\}" data-quran-ayah-jump>/.test(b), 'ayah-jump is a GET form posting to the CURRENT surah route (no-JS submits)');
ok(/name="ayah" type="number" min="1" max="\$\{surah\.ayahCount\}"/.test(b), 'numeric input name=ayah min=1 max=this surah\'s own ayahCount');
ok(/id="quran-ayah-err"[^>]*role="alert"[^>]*hidden[^>]*data-quran-ayah-errmsg/.test(b), 'error node (role=alert, hidden, server-rendered text)');
// (b) the no-JS server redirect handler
ok(/\/\(\?:\^\|&\)ayah=\(\\d\{1,3\}\)\(\?:&\|\$\)\//.test(src), 'server parses ?ayah=N from the query');
ok(/res\.writeHead\(302, \{ Location: '\/quran\/surah\/' \+ _qs\.n \+ '#ayah-' \+ a \}\)/.test(src), 'server 302-redirects a valid ayah to the #ayah-N fragment of the requested surah');
// the ceiling is read from the surah's own chapter record — a literal 112 was Al-Anbiya's and would
// have mis-validated the other 113 surahs.
ok(/a >= 1 && a <= _ch\.ayahCount/.test(src), 'server validates the ayah against the surah\'s own ayahCount (invalid -> render page, no redirect)');
// (c) the JS enhancement: submit -> smooth scroll + flash, no data, no innerHTML
ok(/data-quran-ayah-jump/.test(js) && /addEventListener\('submit'/.test(js), 'JS intercepts the ayah-jump submit');
ok(/function gotoAyah\(/.test(js) && /getElementById\('ayah-'\s*\+\s*n\)/.test(js), 'JS scrolls to #ayah-N');
ok(/classList\.add\('is-flash'\)/.test(js) && /classList\.remove\('is-flash'\)/.test(js), 'JS adds a temporary highlight (no text mutation)');
ok(/preventDefault\(\)/.test(js), 'JS preventDefault (JS path replaces the server round-trip)');
ok(!/innerHTML/.test(js), 'JS never uses innerHTML');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
