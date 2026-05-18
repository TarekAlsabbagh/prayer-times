// scripts/geodata/_asia_1g_af_summary_report.mjs
// Generates reports/geodata-asia-1g-af-summary.md
// AND      reports/geodata-asia-1g-af-arabic-quality-report.md
// from the artifacts of the ASIA-1G-AF pipeline run.
import fs from 'node:fs';

const CAND = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/candidates';
const REPORTS = 'C:/Users/Tarek/Downloads/TIME PRAYER/reports';

const baseline = JSON.parse(fs.readFileSync(CAND + '/asia-1g-af-baseline-arabic-quality.json', 'utf8'));
const after = JSON.parse(fs.readFileSync(CAND + '/asia-1g-af-arabic-quality.json', 'utf8'));
const pregate = JSON.parse(fs.readFileSync(CAND + '/asia-1g-af-persian-pregate.json', 'utf8'));
const candidates = JSON.parse(fs.readFileSync(CAND + '/af-geonames-candidates.json', 'utf8'));

const passes = candidates.filter(e => e.status === 'pending' && e.tier === 'high' && e.pendingAfterArGate === true);
const stillBlocked = after.highTierEntries.filter(e => !e.pendingAfterArGate);
const baselineBlocked = baseline.highTierEntries.filter(e => !e.pendingAfterArGate);
const baselinePassSlugs = new Set(baseline.highTierEntries.filter(e => e.pendingAfterArGate).map(e => e.slug));

const PERSIAN_MAP = {
    'ی':'ي','ک':'ك','پ':'ب','گ':'غ','چ':'ج','ژ':'ز','ۀ':'ه',
    'ٹ':'ت','ڈ':'د','ڑ':'ر','ہ':'ه','ے':'ي','ھ':'ه',
    'ښ':'ش','ګ':'غ','څ':'ج','ځ':'ز','ډ':'د','ړ':'ر','ڼ':'ن',
    'ۆ':'و','ڕ':'ر','ڵ':'ل','ۊ':'و'
};

// ─── Arabic-quality report ───
{
    const L = [];
    L.push('# AF Arabic-Quality Report (post-Stage 3.4)');
    L.push('');
    L.push('**Wave**: `CURATED-GEODATA-ASIA-1G-AF`');
    L.push('**Country**: Afghanistan (أفغانستان)');
    L.push('**Generated**: ' + new Date().toISOString());
    L.push('');
    L.push('## Comparison: baseline (no Stage 3.4) vs after Stage 3.4');
    L.push('');
    L.push('| Bucket | Baseline | After 3.4 | Δ |');
    L.push('| --- | ---: | ---: | ---: |');
    const bk = baseline.summary.byArQuality;
    const ak = after.summary.byArQuality;
    for (const k of ['wikidata','arabic_only','mixed_script','mixed_latin','mixed_unknown','empty']) {
        const d = (ak[k]||0) - (bk[k]||0);
        L.push('| ' + k + ' | ' + (bk[k]||0) + ' | ' + (ak[k]||0) + ' | ' + (d > 0 ? '+' : '') + d + ' |');
    }
    L.push('');
    L.push('## High-tier — baseline vs after 3.4');
    L.push('');
    L.push('| Bucket | Baseline high | After 3.4 high |');
    L.push('| --- | ---: | ---: |');
    const bh = baseline.summary.highTierByArQuality;
    const ah = after.summary.highTierByArQuality;
    for (const k of ['wikidata','arabic_only','mixed_script','mixed_latin','mixed_unknown','empty']) {
        L.push('| ' + k + ' | ' + (bh[k]||0) + ' | ' + (ah[k]||0) + ' |');
    }
    L.push('| **passes-gate** | **' + baseline.summary.passesArGateInHigh + '** | **' + after.summary.passesArGateInHigh + '** |');
    L.push('| blocked-by-gate | ' + baseline.summary.blockedByArGateInHigh + ' | ' + after.summary.blockedByArGateInHigh + ' |');
    L.push('');
    L.push('## Per-row outcomes for the 15 baseline-blocked high-tier rows');
    L.push('');
    L.push('| slug | pop | baseline ar | after-3.4 ar | new bucket | passes? |');
    L.push('| --- | ---: | --- | --- | --- | :---: |');
    for (const b of baselineBlocked) {
        const a = after.highTierEntries.find(e => e.slug === b.slug);
        const passes = a && a.pendingAfterArGate;
        L.push('| ' + b.slug + ' | ' + (b.population||0).toLocaleString()
            + ' | `' + b.nameAr + '` | `' + (a ? a.nameAr : '?') + '`'
            + ' | ' + (a ? a.arQuality : '?') + ' | ' + (passes ? '✓' : '✗') + ' |');
    }
    L.push('');
    L.push('## 28 passes-gate rows (after Stage 3.4)');
    L.push('');
    L.push('| slug | pop | fc | ar | rescued by 3.4? |');
    L.push('| --- | ---: | --- | --- | :---: |');
    const sorted = passes.slice().sort((a, b) => (b.candidate.population||0) - (a.candidate.population||0));
    for (const p of sorted) {
        const isNew = !baselinePassSlugs.has(p.slug);
        L.push('| ' + p.slug + ' | ' + (p.candidate.population||0).toLocaleString()
            + ' | ' + p.candidate.featureCode
            + ' | ' + p.candidate.names.ar
            + ' | ' + (isNew ? '🆕' : '—') + ' |');
    }
    L.push('');
    L.push('## Counts');
    L.push('');
    L.push('| Bucket | Value |');
    L.push('| --- | ---: |');
    L.push('| Total candidates scanned         | ' + after.summary.totalCandidates.toLocaleString() + ' |');
    L.push('| High-tier total                  | ' + after.summary.highTierCount + ' |');
    L.push('| High-tier passes-gate            | ' + after.summary.passesArGateInHigh + ' |');
    L.push('| High-tier blocked by gate        | ' + after.summary.blockedByArGateInHigh + ' |');
    L.push('| Cross-set collisions in wave     | ' + after.summary.collisionsInWave + ' |');
    L.push('| Cross-set collisions vs curated  | ' + after.summary.collisionsAgainstCurated + ' |');
    L.push('');
    fs.writeFileSync(REPORTS + '/geodata-asia-1g-af-arabic-quality-report.md', L.join('\n'));
    console.log('wrote geodata-asia-1g-af-arabic-quality-report.md (' + L.length + ' lines)');
}

// ─── Wave summary report ───
{
    const L = [];
    L.push('# ASIA-1G-AF Wave Summary');
    L.push('');
    L.push('**Wave**: `CURATED-GEODATA-ASIA-1G-AF`');
    L.push('**Country**: Afghanistan (أفغانستان) — second wave to use Stage 3.4 Persian + Pashto pre-gate');
    L.push('**Generated**: ' + new Date().toISOString());
    L.push('**Status**: pipeline run complete — **awaiting user approval before Stage 4**');
    L.push('');
    L.push('## Pipeline stages executed');
    L.push('');
    L.push('| Stage | Status | Output |');
    L.push('|---|---|---|');
    L.push('| 1 — Import       | ✓ | `db/places/candidates/af-geonames-raw.json` (32,573 rows) |');
    L.push('| 2 — Normalize    | ✓ | `db/places/candidates/af-geonames-normalized.json` (30,921) |');
    L.push('| 3 — Validate     | ✓ | `db/places/candidates/af-geonames-candidates.json` |');
    L.push('| **3.4 — Persian/Pashto pre-gate** | **✓** | `db/places/candidates/asia-1g-af-persian-pregate.json` + MD report |');
    L.push('| 3.5 — Arabic-name QA | ✓ | `db/places/candidates/asia-1g-af-arabic-quality.json` |');
    L.push('| Premerge QA      | ✓ | `reports/geodata-asia-1g-af-premerge-qa.md` |');
    L.push('| 4 — Apply        | ❌ NOT RUN | awaiting user decision |');
    L.push('');

    L.push('## 1. High-tier counts before Stage 3.4');
    L.push('');
    L.push('| Bucket | High-tier count |');
    L.push('|---|---:|');
    const bh = baseline.summary.highTierByArQuality;
    L.push('| wikidata      | ' + bh.wikidata + ' |');
    L.push('| arabic_only   | ' + bh.arabic_only + ' |');
    L.push('| mixed_script (BLOCKED before 3.4) | **' + bh.mixed_script + '** |');
    L.push('| mixed_latin   | ' + bh.mixed_latin + ' |');
    L.push('| mixed_unknown | ' + bh.mixed_unknown + ' |');
    L.push('| empty         | ' + bh.empty + ' |');
    L.push('| **Total**     | **' + baseline.summary.highTierCount + '** |');
    const baselinePct = Math.round(baseline.summary.passesArGateInHigh / baseline.summary.highTierCount * 100);
    L.push('| **Passes-gate (high)** | **' + baseline.summary.passesArGateInHigh + ' = ' + baselinePct + '%** |');
    L.push('');

    L.push('## 2. Names changed in Stage 3.4');
    L.push('');
    L.push('| Metric | Count |');
    L.push('|---|---:|');
    L.push('| Total entries scanned          | ' + pregate.summary.totalRows.toLocaleString() + ' |');
    L.push('| Rows where Stage 3.4 acted     | ' + pregate.summary.rowsTouched.toLocaleString() + ' |');
    L.push('| └─ `names.ar` modified         | ' + pregate.summary.nameArChanged.toLocaleString() + ' |');
    L.push('| └─ `aliases.ar` modified       | ' + pregate.summary.aliasesArChanged.toLocaleString() + ' |');
    L.push('| Rows untouched                 | ' + pregate.summary.rowsUnchanged.toLocaleString() + ' |');
    L.push('| Rows empty                     | ' + pregate.summary.rowsEmpty.toLocaleString() + ' |');
    L.push('| **Total character substitutions** | **' + pregate.summary.totalCharsSubstituted.toLocaleString() + '** |');
    L.push('');
    L.push('Touched rows by tier:');
    L.push('');
    L.push('| Tier | Count |');
    L.push('|---|---:|');
    L.push('| high (PPLC/PPLA or pop≥100k)  | ' + pregate.byTier.high + ' |');
    L.push('| medium                        | ' + pregate.byTier.medium + ' |');
    L.push('| low                           | ' + pregate.byTier.low.toLocaleString() + ' |');
    L.push('| other (existing/needs_review) | ' + pregate.byTier.other.toLocaleString() + ' |');
    L.push('');

    L.push('## 3. Per-character substitutions');
    L.push('');
    L.push('| Character | Unicode | → | Count |');
    L.push('|---|---|:-:|---:|');
    for (const s of pregate.summary.topCharSubstitutions) {
        const u = 'U+' + s.from.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
        L.push('| `' + s.from + '` | ' + u + ' | `' + (PERSIAN_MAP[s.from] || '?') + '` | ' + s.count.toLocaleString() + ' |');
    }
    L.push('');
    L.push('**🌟 Pashto-specific firsts for AF** (vs IR): ډ (673), ړ (545), څ (255), ښ (158), ڼ (134), ځ (132), ګ (12). These exercised the Pashto extensions of the PERSIAN_CHAR_MAP — first production use.');
    L.push('');

    L.push('## 4. Passes-gate — before vs after Stage 3.4');
    L.push('');
    L.push('| Metric | Baseline | After 3.4 | Δ |');
    L.push('|---|---:|---:|---:|');
    L.push('| High-tier total          | ' + baseline.summary.highTierCount + ' | ' + after.summary.highTierCount + ' | 0 |');
    const afterPct = Math.round(after.summary.passesArGateInHigh / after.summary.highTierCount * 100);
    L.push('| **High-tier passes-gate** | **' + baseline.summary.passesArGateInHigh + ' (' + baselinePct + '%)** | **' + after.summary.passesArGateInHigh + ' (' + afterPct + '%)** | **+' + (after.summary.passesArGateInHigh - baseline.summary.passesArGateInHigh) + '** |');
    L.push('| High-tier blocked-by-gate | ' + baseline.summary.blockedByArGateInHigh + ' | ' + after.summary.blockedByArGateInHigh + ' | ' + (after.summary.blockedByArGateInHigh - baseline.summary.blockedByArGateInHigh) + ' |');
    L.push('');

    L.push('## 5. What stayed blocked and why');
    L.push('');
    L.push('**8 high-tier rows still blocked** (all `mixed_latin` after Stage 3.4) — these have Latin-script romanizations baked into `name.ar` (e.g. `qndهar`, `fraه`, `tryn kwت`). Stage 3.4 cleaned residual Persian/Urdu letters but cannot synthesize Arabic from Latin. They need MCF manual canonical Arabic.');
    L.push('');
    L.push('| slug | pop | fc | after-3.4 ar | en |');
    L.push('|---|---:|---|---|---|');
    for (const b of stillBlocked) {
        L.push('| `' + b.slug + '` | ' + (b.population||0).toLocaleString() + ' | ' + b.featureCode + ' | `' + b.nameAr + '` | ' + b.nameEn + ' |');
    }
    L.push('');
    L.push('Low-tier blocked counts (popMin=100k):');
    L.push('');
    L.push('| Bucket | Count |');
    L.push('|---|---:|');
    L.push('| mixed_latin   | ' + after.summary.byArQuality.mixed_latin.toLocaleString() + ' |');
    L.push('| mixed_unknown | ' + after.summary.byArQuality.mixed_unknown.toLocaleString() + ' |');
    L.push('| mixed_script  | ' + after.summary.byArQuality.mixed_script + ' (Stage 3.4 caught everything) |');
    L.push('| empty         | ' + after.summary.byArQuality.empty + ' |');
    L.push('');

    L.push('## 6. False positives');
    L.push('');
    L.push('**Mechanical false positives: 0** (no row demoted from a better bucket; no incorrect rescue).');
    L.push('');
    L.push('**🚨 SEMANTIC false positives: 4** — rows that passed the Stage 3.5 gate but whose cleaned Arabic is semantically questionable. Stage 3.4 did its mechanical job; the result is technically clean Arabic, but Arabic speakers would not recognise it as the canonical transliteration of the city name. Per user direction (avoid kg/manas repeat), these should be reviewed before clean merge:');
    L.push('');
    L.push('| slug | pop | before | after-3.4 | concern |');
    L.push('|---|---:|---|---|---|');
    L.push('| `charikar` | 53,676 | `چاريكار` | `جاريكار` | چ→ج default gives "Jarikar". Canonical is "شاريكار" or "تشاريكار". |');
    L.push('| `pul-e-khumri` | 56,369 | `پل خمری` | `بل خمري` | پ→ب default gives "Bul" (no meaning) instead of "Pul" (bridge). |');
    L.push('| `pul-e-alam` | 13,247 | `پل علم` | `بل علم` | Same پ→ب default issue. |');
    L.push('| `sar-e-pul` | 52,121 | `سر پل` | `سر بل` | Same پ→ب default issue. |');
    L.push('');
    L.push('Mitigation options: (a) override these 4 via `NAME_AR_FIXES`, (b) exclude them from clean merge and defer to MCF, (c) accept the mechanical defaults as good-enough and add USER_TEST_ALIASES for both forms.');
    L.push('');

    L.push('## 7. Top Afghan cities now in passes-gate (sorted by pop, all 28)');
    L.push('');
    L.push('| Rank | slug | pop | fc | name.ar | Δ from baseline |');
    L.push('|---:|---|---:|---|---|:---:|');
    const sortedPasses = passes.slice().sort((a, b) => (b.candidate.population||0) - (a.candidate.population||0));
    let rank = 0;
    for (const p of sortedPasses) {
        rank++;
        const c = p.candidate;
        const isNew = !baselinePassSlugs.has(p.slug);
        L.push('| ' + rank + ' | `' + p.slug + '` | ' + (c.population || 0).toLocaleString()
            + ' | ' + c.featureCode + ' | ' + c.names.ar
            + ' | ' + (isNew ? '🆕 rescued by 3.4' : 'unchanged') + ' |');
    }
    L.push('');

    L.push('## 8. Top Afghan cities blocked → MCF candidates');
    L.push('');
    L.push('**8 high-tier blocked** (all `mixed_latin`, all PPLA). Recommend a follow-up `ASIA-1G-AF-MCF` mini-phase per user-priority Arabic canonical names:');
    L.push('');
    L.push('| slug | pop | fc | current ar | suggested canonical Arabic |');
    L.push('|---|---:|---|---|---|');
    const canonicalSuggestions = {
        'kandahar':     'قندهار',          // user-watch — major
        'lashkar-gah':  'لشكر جاه',         // common Arabic transliteration
        'farah':        'فراه',             // standard
        'fayroz-koh':   'فيروز كوه',        // formerly Chaghcharan
        'tarinkot':     'ترين كوت',         // common
        'qala-i-naw':   'قلعة نو',          // standard
        'maydanshakhr': 'ميدان شهر',        // common (Maydan-Wardak)
        'parun':        'پارون'             // hard — keep پ as user accepts
    };
    for (const b of stillBlocked) {
        const suggest = canonicalSuggestions[b.slug] || '?';
        L.push('| `' + b.slug + '` | ' + (b.population||0).toLocaleString() + ' | ' + b.featureCode + ' | `' + b.nameAr + '` | `' + suggest + '` |');
    }
    L.push('');

    L.push('## 9. Pashto-specific fixes — are they sufficient?');
    L.push('');
    L.push('Pashto-specific letters were exercised in production for the first time:');
    L.push('');
    L.push('| Pashto letter | → | AF usage count |');
    L.push('|:-:|:-:|---:|');
    L.push('| `ډ` | `د` | 673 |');
    L.push('| `ړ` | `ر` | 545 |');
    L.push('| `څ` | `ج` | 255 |');
    L.push('| `ښ` | `ش` | 158 |');
    L.push('| `ڼ` | `ن` | 134 |');
    L.push('| `ځ` | `ز` | 132 |');
    L.push('| `ګ` | `غ` | 12 |');
    L.push('');
    L.push('**Verdict**: The 24-letter PERSIAN_CHAR_MAP covers Pashto sufficiently. No Pashto-specific fix beyond what was already designed was needed. All 7 Pashto letters mapped cleanly. **No Stage 3.4 code change required for AF.**');
    L.push('');
    L.push('**Additional letters observed in low-tier blocked rows (NOT in current map, could be added in future revisions if needed)**:');
    L.push('');
    L.push('- `ں` (U+06BA — Urdu noon ghunna): appears in `parun` ar=`barwں` (not Pashto, Urdu — Latin-mostly row anyway, no real benefit from mapping)');
    L.push('- `ʿ` (U+02BF — modifier letter left half ring): appears in `qala-i-naw` ar=`qlʿه naw` (Latin transliteration marker, would not benefit from substitution)');
    L.push('- `ې` (U+06D0 — Pashto ye-barree): appears in some low-tier rows but not in any passes-gate or blocked-major row (low priority)');
    L.push('');

    L.push('## Decision points');
    L.push('');
    L.push('Per user direction (avoid kg/manas repeat — semantic mismatches stay in review):');
    L.push('');
    L.push('1. **`approve A — clean merge ~24 safe-only`** — merge 24 entries (28 minus 4 semantic flags). Defer the 4 semantic-flag rows (charikar, pul-e-khumri, pul-e-alam, sar-e-pul) to MCF along with the 8 still-blocked.');
    L.push('2. **`approve B — clean merge 28 with overrides`** — accept Stage 3.4 mechanical defaults (`جاريكار` / `بل خمري` / `بل علم` / `سر بل`) and add USER_TEST_ALIASES for searchability.');
    L.push('3. **`fix arabic per row`** — supply (slug → correct Arabic) for the 4 semantic flags before merge.');
    L.push('4. **`run major-cities-fix first`** — handle the 8 blocked-major (kandahar / lashkar-gah / farah / etc.) before any merge.');
    L.push('');
    L.push('## Report files generated');
    L.push('');
    L.push('| File | Purpose |');
    L.push('|---|---|');
    L.push('| `reports/geodata-asia-1g-af-summary.md` | **THIS FILE** |');
    L.push('| `reports/af-geodata-import-report.md` | Stage 3 validate report |');
    L.push('| `reports/geodata-asia-1g-af-persian-pregate-report.md` | Stage 3.4 per-row audit |');
    L.push('| `reports/geodata-asia-1g-af-arabic-quality-report.md` | Stage 3.5 baseline-vs-after |');
    L.push('| `reports/geodata-asia-1g-af-premerge-qa.md` | 9-check pre-merge QA (incl. semantic flags) |');
    L.push('');
    L.push('**No merge yet — Stage 4 awaits user approval.**');
    L.push('');

    fs.writeFileSync(REPORTS + '/geodata-asia-1g-af-summary.md', L.join('\n'));
    console.log('wrote geodata-asia-1g-af-summary.md (' + L.length + ' lines)');
}
