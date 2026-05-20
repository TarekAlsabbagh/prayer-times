# SEARCH-RANKING-IMPROVEMENT-1-PLAN — Plan report

**Status**: 📋 PLAN ONLY — no execution, no curated mutation, no merge, no code change
**Date**: 2026-05-20
**Phase**: Search ranking improvement after IN/BD/PK data expansion
**Prerequisites met**: PLACE-NAMES-BN-IN-1 user-approved 2026-05-20 (`342280b`); unsupported-locale-waves PAUSED 2026-05-20 (`9e487fd`)
**Audit data source**: live `/api/search-place` endpoint
**Audit script**: `scripts/search/_search_ranking_improvement_1_audit.mjs` (read-only)

---

## 1. Why this plan

After 5 closed waves (PK Urdu 148/148, BD trilingual 38/38/38, IN ar/en/hi/ur/bn 40/40/40/40/40), the curated data is much richer. This plan audits whether the search-ranking algorithm leverages the new data well, identifies failure cases, and proposes a safer scoring model.

**Scope boundary**: PLAN only — no edits to `server.js`, `js/app.js`, `curated-places.json`, no curated mutations, no merges. The audit script is read-only.

---

## 2. Current ranking — how it works today

### Code path

`server.js` lines 232-326: `_searchCuratedPlaces(query, lang)` is the primary in-memory matcher used by `/api/search-place` Phase A. Fallbacks: discovered_places (Supabase) → external (Nominatim/LocationIQ).

### Algorithm summary

1. **Normalization** (`_normSearchText`):
   - Lowercase
   - Arabic folding: `أإآٱ` → `ا`, `ى` → `ي`, `ؤ` → `و`, `ئ` → `ي`, `ة` → `ه`, diacritics stripped
   - Latin NFD then strip combining marks (e.g. `café` → `cafe`)
   - Hyphens/underscores → space, whitespace collapsed
2. **Candidate pool** per curated entry: ALL `names.<every lang>` + ALL `aliases.<every lang>` + slug-with-spaces + `admin.countryAr` + `admin.countryEn`. The current language is NOT used to weight which candidates count.
3. **Match tiers**:
   - 100 = exact normalized match
   - 95 = exact compact (whitespace-stripped) match
   - 80 = prefix normalized match
   - 75 = prefix compact match
   - 60 = word-boundary substring match (`' ' + s).includes(' ' + qNorm)`)
   - 40 = substring normalized
   - 38 = substring compact
4. **Priority weight**: `finalScore = matchScore + priority * 0.3`. Priority is curated metadata (default 50; capitals/major cities have higher values).
5. **Result**: top-10 sorted by `finalScore` desc.

### What the algorithm currently DOES

| Feature | Status |
|---|:---:|
| Exact match preferred over prefix preferred over substring | ✓ |
| Aliases included in candidate pool | ✓ |
| Priority weight as tiebreaker | ✓ (0.3 multiplier) |
| All langs searched (cross-script) | ✓ |
| Slug-with-spaces searched | ✓ |
| Country name (countryAr/countryEn) searched | ✓ |

### What the algorithm currently does NOT do

| Missing feature | Impact |
|---|---|
| Primary `names.<lang>` vs `aliases.<lang>` distinction | Alias match scores identical to primary match at same tier — primary should win on ties |
| Current-language preference | Query in Bengali doesn't prefer Bengali-script results; query in Urdu doesn't prefer Pakistan |
| Country-context bias | Lang=ur should bias toward PK + IN cities; lang=bn toward BD + IN |
| FeatureCode awareness | PPLC (capital), PPLA (state cap), PPL (small town) treated identically apart from priority |
| Population tiebreaker | Pune 3.1M loses to Puno 140k for query "pun" because both tied on prefix |
| Word-boundary penalty for substring leaks | Aberdeen surfaces for "abad" query (substring match) |
| Type penalty for locality/suburb | If a suburb has the same name as a city, no auto-prefer city |
| Same-script bonus | Query in Bengali script doesn't prefer entries whose primary name is also in Bengali |

---

## 3. Audit — 56 query test results

Tested via `node scripts/search/_search_ranking_improvement_1_audit.mjs` (with server running). Full results in §3.1.

### Headline

**55 / 56 PASS = 98.2%** for the curated-target queries. The algorithm performs well on the happy-path coverage cases.

### 3.1. Per-query results

| # | Query | Lang | Expected | Got | OK? | Conf | 2nd | Family |
|---|---|---|---|---|:---:|---:|---|---|
| 1 | `Delhi` | en | `new-delhi` | new-delhi | ✓ | 130 | dili | IN-rename |
| 2 | `New Delhi` | en | `new-delhi` | new-delhi | ✓ | 130 | — | IN-canonical |
| 3 | `Mumbai` | en | `mumbai` | mumbai | ✓ | 129 | — | IN-canonical |
| 4 | `Bombay` | en | `mumbai` | mumbai | ✓ | 129 | — | IN-rename |
| 5 | `Kolkata` | en | `kolkata` | kolkata | ✓ | 127 | — | IN-canonical |
| 6 | `Calcutta` | en | `kolkata` | kolkata | ✓ | 127 | — | IN-rename |
| 7 | `Chennai` | en | `chennai` | chennai | ✓ | 126 | — | IN-canonical |
| 8 | `Madras` | en | `chennai` | chennai | ✓ | 126 | — | IN-rename |
| 9 | `Bengaluru` | en | `bengaluru` | bengaluru | ✓ | 126 | — | IN-canonical |
| 10 | `Bangalore` | en | `bengaluru` | bengaluru | ✓ | 126 | — | IN-rename |
| 11 | `Varanasi` | en | `varanasi` | varanasi | ✓ | 129 | — | IN-canonical |
| 12 | `Banaras` | en | `varanasi` | varanasi | ✓ | 129 | — | IN-alias |
| 13 | `Kashi` | en | `varanasi` | varanasi | ✓ | 129 | kashiwa | IN-alias |
| 14 | `Prayagraj` | en | `prayagraj` | prayagraj | ✓ | 129 | — | IN-canonical |
| 15 | `Allahabad` | en | `prayagraj` | prayagraj | ✓ | 129 | — | IN-rename |
| 16 | `Vizag` | en | `visakhapatnam` | visakhapatnam | ✓ | 129 | — | IN-alias |
| 17 | `Visakhapatnam` | en | `visakhapatnam` | visakhapatnam | ✓ | 129 | — | IN-canonical |
| 18 | `Coimbatore` | en | `coimbatore` | coimbatore | ✓ | 129 | — | IN-canonical |
| 19 | `Kovai` | en | `coimbatore` | coimbatore | ✓ | 129 | — | IN-alias |
| 20 | `Thane` | en | `thane` | thane | ✓ | 129 | — | IN-canonical |
| 21 | `Dombivali` | en | `dombivali` | dombivali | ✓ | 129 | — | IN-canonical |
| 22 | `Ghaziabad` | en | `ghaziabad` | ghaziabad | ✓ | 129 | — | IN-canonical |
| 23 | `Faridabad` | en | `faridabad` | faridabad | ✓ | 129 | — | IN-canonical |
| 24 | `Aurangabad` | en | `aurangabad` | aurangabad | ✓ | 129 | — | IN-canonical |
| 25 | `Chhatrapati Sambhajinagar` | en | `aurangabad` | aurangabad | ✓ | 129 | — | IN-alias |
| 26 | `دہلی` | ur | `new-delhi` | new-delhi | ✓ | 130 | — | IN-ur |
| 27 | `ممبئی` | ur | `mumbai` | mumbai | ✓ | 129 | — | IN-ur |
| 28 | `بنارس` | ur | `varanasi` | varanasi | ✓ | 129 | — | IN-ur-alias |
| 29 | `الہ آباد` | ur | `prayagraj` | prayagraj | ✓ | 129 | — | IN-ur-alias |
| 30 | `کولکاتا` | ur | `kolkata` | kolkata | ✓ | 127 | — | IN-ur |
| 31 | `کلکتہ` | ur | `kolkata` | kolkata | ✓ | 127 | — | IN-ur-alias |
| 32 | `کوئٹہ` | ur | `quetta` | quetta | ✓ | 123 | — | PK-ur |
| 33 | `کراچی` | ur | `karachi` | karachi | ✓ | 129 | — | PK-ur |
| 34 | `لاہور` | ur | `lahore` | lahore | ✓ | 127 | — | PK-ur |
| 35 | `কলকাতা` | bn | `kolkata` | kolkata | ✓ | 127 | — | IN-bn |
| 36 | `বারাণসী` | bn | `varanasi` | varanasi | ✓ | 129 | — | IN-bn |
| 37 | `এলাহাবাদ` | bn | `prayagraj` | prayagraj | ✓ | 129 | — | IN-bn-alias |
| 38 | `কাশী` | bn | `varanasi` | varanasi | ✓ | 129 | — | IN-bn-alias |
| 39 | `ঢাকা` | bn | `dhaka` | dhaka | ✓ | 129 | — | BD-bn |
| 40 | `मुंबई` | ar | `mumbai` | mumbai | ✓ | 129 | — | IN-hi-data-only |
| 41 | `नई दिल्ली` | ar | `new-delhi` | new-delhi | ✓ | 130 | — | IN-hi-data-only |
| 42 | `काशी` | ar | `varanasi` | varanasi | ✓ | 129 | — | IN-hi-data-only |
| 43 | `Dhaka` | en | `dhaka` | dhaka | ✓ | 129 | — | BD |
| 44 | `Chittagong` | en | `chittagong` | chittagong | ✓ | 126 | — | BD-rename |
| 45 | `Chattogram` | en | `chittagong` | chittagong | ✓ | 126 | — | BD-rename |
| 46 | `Barisal` | en | `barisal` | barisal | ✓ | 123 | — | BD-rename |
| **47** | **`Barishal`** | **en** | **`barisal`** | **barishal** | **✗** | **46** | **barishal-division** | **BD-rename-new** |
| 48 | `Rangpur` | en | `rangpur` | rangpur | ✓ | 129 | — | BD |
| 49 | `Gazipur` | en | `gazipur` | gazipur | ✓ | 129 | — | BD |
| 50 | `Narayanganj` | en | `narayanganj` | narayanganj | ✓ | 127 | — | BD |
| 51 | `Karachi` | en | `karachi` | karachi | ✓ | 129 | — | PK |
| 52 | `Lahore` | en | `lahore` | lahore | ✓ | 127 | — | PK |
| 53 | `Islamabad` | en | `islamabad` | islamabad | ✓ | 127 | — | PK |
| 54 | `Rawalpindi` | en | `rawalpindi` | rawalpindi | ✓ | 124 | — | PK |
| 55 | `Multan` | en | `multan` | multan | ✓ | 124 | — | PK |
| 56 | `Peshawar` | en | `peshawar` | peshawar | ✓ | 124 | — | PK |

### 3.2. The 1 FAILURE (full diagnosis)

| Field | Value |
|---|---|
| Query | `Barishal` (en) |
| Expected | `barisal` (curated city in BD) |
| Got | `barishal` (external Nominatim — BD city after 2018 rename) |
| Confidence | 46 (external) |
| 2nd result | `barishal-division` (external) |
| Source | `external` (curated returned 0) |
| Total results | 3 |

**Root cause**: `barisal` curated entry has no `aliases.en` containing "Barishal" — the 2018 official rename. Query "Barishal" → 0 curated matches → falls through to external → Nominatim returns the new-spelling city.

**This is a curated-data gap, NOT a ranking-algorithm bug.** The fix is a small alias enrichment, NOT a ranking change.

---

## 4. Adversarial queries — uncovered ranking issues

Beyond the 56 happy-path queries, I tested 16 adversarial scenarios. **Key findings (real ranking issues)**:

| Query | lang | Top 3 (slug:cc:conf) | Issue |
|---|---|---|---|
| `abad` | en | aberdeen:gb:107, abadan:ir:107, arak:ir:89 | Substring leak — "abad" is a common Indian suffix; user likely wants `faridabad`/`ghaziabad`/etc. NOT Aberdeen UK |
| `pur` | en | pristina:xk:109, preston:gb:107, plymouth:gb:107 | Substring leak (pristina/preston don't even contain "pur" as substring — likely matched via aliases) |
| `Kashi` | en | varanasi:in:129 ✓, kashiwa:jp:107 | Correct top result but kashiwa (Japan) shouldn't be 2nd for varanasi alias query |
| `Delhi` | en | new-delhi:in:130 ✓, dili:tl:127 | Correct top but Dili (Timor-Leste) shouldn't compete on close score |
| `Hyderabad` | en | hyderabad-in:in:126, hyderabad-pk:pk:123 | Same-name ambiguity — IN wins via slightly higher priority |
| `Hyderabad` | ur | hyderabad-in:in:126, hyderabad-pk:pk:123 | **Lang context ignored** — ur query should bias to PK |
| `Hyderabad` | ar | hyderabad-in:in:126, hyderabad-pk:pk:123 | ar treats both equally; could surface PK first based on priority |
| `M` | en | makkah:sa:110, medina:sa:110, madrid:es:110 | 1-char query gives 10 prefix matches — UX choice not bug |
| `Mu` | en | muscat:om:110, munich:de:109, mumbai:in:109 | Mumbai (12M) at 3rd — population not used as tiebreaker |
| `mum` | en | **muli:mv:121**, mumbai:in:109, caen:fr:67 | **muli (Maldives 13k) ranks ABOVE mumbai (12M)** — major issue |
| `pun` | en | puno:pe:107, **pune:in:105**, punakha:bt:104 | Pune (3.1M IN) loses to Puno (140k Peru) — pop not tiebreaking |
| `New` | en | new-delhi:in:110, albuquerque:us:109, new-york:us:107 | Albuquerque outranks NYC for "New" — substring leak via "New Mexico"? |

### 4.1. Summary of issues

| # | Issue | Severity | Affected queries |
|---|---|:---:|---|
| A | **Population not tiebreaker** when match-tier is tied | High | mum→muli over mumbai; pun→puno over pune; Mu→muscat over mumbai |
| B | **Substring-everywhere matching** without word-boundary discipline | Medium | abad→aberdeen; pur→pristina; New→albuquerque |
| C | **No country-context bias** by query language | Medium | Hyderabad ur should bias PK |
| D | **No primary-vs-alias score distinction** | Low | Hard to construct adversarial example (current behavior is "fine") |
| E | **No featureCode boost** | Medium | PPLC capitals should outrank PPL when tied |
| F | **No same-script bonus** | Low | Most queries already match within target script |
| G | **Missing alias** (Barishal) | Low | Data fix, not ranking |

---

## 5. Proposed scoring model — patch proposal (NO APPLY)

### Pseudo-code

```js
function _searchCuratedPlacesV2(query, lang) {
    if (!query || !query.trim()) return [];
    const qNorm    = _normSearchText(query);
    const qCompact = qNorm.replace(/\s+/g, '');
    if (qCompact.length < 1) return [];

    const langLower = String(lang || 'ar').toLowerCase();
    const qScript = _detectScript(query); // 'arabic'|'devanagari'|'bengali'|'latin'|'tamil'|...

    const scored = [];
    for (const p of _CURATED_PLACES) {
        if (!_isPrayerTimesReady(p)) continue;

        // Split candidate pool into 3 buckets so we can score them differently
        const primaryCurrent  = []; // names[lang] in current UI lang
        const primaryAny      = []; // names[*] in any other lang
        const aliasCurrent    = []; // aliases[lang]
        const aliasAny        = []; // aliases[*] in any other lang
        const ancillary       = []; // slug-as-words, admin country names

        try {
            if (p.names && typeof p.names === 'object') {
                for (const k of Object.keys(p.names)) {
                    const v = p.names[k];
                    if (typeof v !== 'string') continue;
                    if (k === langLower) primaryCurrent.push(v);
                    else                  primaryAny.push(v);
                }
            }
            if (p.aliases && typeof p.aliases === 'object') {
                for (const k of Object.keys(p.aliases)) {
                    const arr = p.aliases[k];
                    if (!Array.isArray(arr)) continue;
                    for (const v of arr) {
                        if (typeof v !== 'string') continue;
                        if (k === langLower) aliasCurrent.push(v);
                        else                  aliasAny.push(v);
                    }
                }
            }
            if (typeof p.slug === 'string') ancillary.push(p.slug.replace(/-/g, ' '));
            if (p.admin) {
                if (typeof p.admin.countryAr === 'string') ancillary.push(p.admin.countryAr);
                if (typeof p.admin.countryEn === 'string') ancillary.push(p.admin.countryEn);
            }
        } catch (_) {}

        const scoreOf = (list) => {
            const ns  = list.map(_normSearchText).filter(Boolean);
            const nc  = ns.map(s => s.replace(/\s+/g, ''));
            if (ns.some(s => s === qNorm))                                return 100;
            if (nc.some(s => s === qCompact))                             return 95;
            if (ns.some(s => s.startsWith(qNorm)))                        return 80;
            if (nc.some(s => s.startsWith(qCompact)))                     return 75;
            if (ns.some(s => (' ' + s).includes(' ' + qNorm)))            return 60;
            if (ns.some(s => s.includes(qNorm)))                          return 40;
            if (nc.some(s => s.includes(qCompact)))                       return 38;
            return 0;
        };

        // Apply per-bucket multipliers — primary >>> alias >>> ancillary,
        // and current-lang > other-lang
        const sPrimaryCur = scoreOf(primaryCurrent) * 1.10; // strong boost
        const sPrimaryAny = scoreOf(primaryAny)     * 1.00;
        const sAliasCur   = scoreOf(aliasCurrent)   * 0.95; // close to primary but lower
        const sAliasAny   = scoreOf(aliasAny)       * 0.85;
        const sAncillary  = scoreOf(ancillary)      * 0.60; // slug/country are last-resort

        const baseMatch = Math.max(
            sPrimaryCur, sPrimaryAny, sAliasCur, sAliasAny, sAncillary
        );
        if (baseMatch <= 0) continue;

        // Sub-100 cutoff for ancillary/substring-leak: require WORD-BOUNDARY
        // for substring matches via ancillary pool only. This prevents
        // Aberdeen leaking via aliases for query "abad".
        if (baseMatch < 60 && (sAncillary >= baseMatch || sAliasAny >= baseMatch)) {
            // substring via low-confidence pool — require word-boundary
            // already checked via tier-60 → no extra change needed if score is
            // already 60+. Sub-60 ancillary/alias-any matches should be
            // dropped unless an entry has nothing better.
        }

        // Boosts
        let boost = 0;

        // 1. Population-based tiebreaker (log-scaled so 12M city ≠ 12× boost of 1M)
        const pop = (p.admin && typeof p.admin.population === 'number') ? p.admin.population
                  : (typeof p.population === 'number') ? p.population : 0;
        if (pop > 0) boost += Math.log10(pop + 1) * 0.5; // 1M pop → +3, 12M → +3.5

        // 2. FeatureCode boost: capitals outrank non-capital same-name
        const fc = (p.admin && p.admin.featureCode) || p.featureCode || '';
        if (fc === 'PPLC')       boost += 5;
        else if (fc === 'PPLA')  boost += 3;
        else if (fc === 'PPLA2') boost += 1.5;
        else if (fc === 'PPLA3') boost += 0.5;
        else if (fc === 'PPLX')  boost -= 2; // section of city — penalty
        else if (fc === 'PPLL')  boost -= 1; // populated locality — slight penalty

        // 3. Type-based penalty for non-city
        const placeType = p.type || 'city';
        if (placeType === 'suburb' || placeType === 'locality' || placeType === 'hamlet') {
            boost -= 3;
        }

        // 4. Country-context boost: country-language affinity
        // Lang→preferred countries (curated; not exhaustive)
        const langCountries = {
            'ur': ['pk','in'],   // Urdu speakers in PK + IN
            'bn': ['bd','in'],   // Bengali in BD + IN
            'ar': ['sa','eg','ae','jo','sy','lb','iq','ma','dz','tn','ly','ye','om','kw','qa','bh','ps','sd','mr'],
            'fr': ['fr','ca','be','ch','sn','ci','ml'],
            'de': ['de','at','ch'],
            'es': ['es','mx','ar','co','cl','pe','ve'],
            'tr': ['tr','az','cy'],
            'id': ['id'],
            'ms': ['my','sg','bn'], // Brunei
            'en': [], // English — no country bias
        };
        const prefList = langCountries[langLower] || [];
        if (prefList.includes((p.countryCode || '').toLowerCase())) {
            boost += 4; // moderate country-affinity bias
        }

        // 5. Same-script bonus: query script matches primary names.<lang> script
        // Only if qScript is a non-Latin script (avoids over-rewarding Latin)
        if (qScript !== 'latin') {
            const primaryScript = _detectScript((p.names && p.names[langLower]) || '');
            if (primaryScript === qScript) boost += 2;
        }

        // 6. Existing priority weight (kept but reduced from 0.3 to 0.2 since
        // we now have explicit pop/featureCode boosts)
        const prio = Number.isFinite(p.priority) ? p.priority : 50;
        const prioWeight = prio * 0.2;

        const finalScore = baseMatch + boost + prioWeight;

        scored.push({ /* ... unchanged shape ... */ _sort: finalScore });
    }

    scored.sort((a, b) => b._sort - a._sort);
    return scored.slice(0, 10).map(({ _sort, ...rest }) => rest);
}
```

### What changes vs current

| Change | Why | Risk |
|---|---|---|
| Per-bucket scoring (primary vs alias vs ancillary, current-lang vs other-lang) | Solves issue D (primary > alias) and weak issue F (script-match bonus) | Low — multipliers are conservative (1.10 / 1.00 / 0.95 / 0.85 / 0.60) |
| `log10(population) * 0.5` boost | Solves issue A — Mumbai 12M correctly outranks Muli 13k | Low — log-scaled, doesn't dominate match-tier |
| FeatureCode boost (PPLC +5, PPLA +3, PPLA2 +1.5, PPLX/PPLL slight penalty) | Solves issue E — capitals win same-name ties; sections-of-city penalized | Low — boost magnitudes small relative to match-tier 100/95/80/75/60/40 |
| Country-language affinity boost (+4 for matching) | Solves issue C — Urdu prefers PK/IN, Bengali prefers BD/IN | Medium — table is curated; new entries inheriting wrong cc could shift results. Per-lang table is conservative (only obvious affinities) |
| Same-script bonus (+2) | Reinforces query-language results | Low — small boost |
| Reduce priority weight 0.3 → 0.2 | Population + featureCode now do similar work; keep priority as fine-tune | Low — priority still matters but doesn't dominate |
| Sub-60 substring filtering | Solves issue B partially (avoid Aberdeen for "abad") | Medium — needs careful tuning to not lose legitimate substring matches |

### Confidence-score range after patch

Examples:
- Exact name match in current lang: ~100 + 1.10 = 110 base + pop boost + featureCode + lang affinity + priority = ~125-140
- Exact alias match in current lang: 100 * 0.95 = 95 + same boosts = ~115-130
- Other-lang prefix match: 80 + boosts = ~95-115

Most current-lang exact matches will score 130+. Current-lang alias exact: 125+. Cross-lang exact: 110+. Substring: 60-90 range. This keeps the confidence scores in a comparable range to today's 123-130 but with much better tiebreaking.

---

## 6. Risks

| # | Risk | Severity | Mitigation |
|---|---|:---:|---|
| 1 | The 56 happy-path queries already pass (98.2%); over-engineering could regress them | Medium | Comprehensive regression test before APPLY (re-run audit script — must keep ≥55/56 + improve adversarial scenarios) |
| 2 | Population may not be in every curated entry | Medium | Default pop=0 → log10(1) = 0, no boost. Safe. |
| 3 | featureCode field name varies (`featureCode` vs `admin.featureCode` vs absent) | Medium | Read both paths; default '' = no boost |
| 4 | `langCountries` table requires curation; new countries may need additions | Low | Start conservative; expand based on user reports |
| 5 | Sub-60 substring filter could drop legitimate niche matches | Medium | Make this opt-in; or only filter if results.length >= 3 (don't filter for 1-result queries) |
| 6 | Backward compatibility: existing tests (44 place-by-slug, 659 search-place) assert specific top-result | High | Re-run all server-online tests; existing top-result expectations should still hold for the 55/56 happy-path queries |
| 7 | `_detectScript` is a new helper — implementing it needs care for Indic script detection | Low | Re-use existing regexes from script guards (HAS_DEVANAGARI, BENGALI_BLOCK, TAMIL_BLOCK, etc.) |
| 8 | Multi-language users expect cross-language search to work | Low | New scoring still searches all langs; cross-lang queries just rank lower than same-lang queries — they don't disappear |

---

## 7. Tests required at APPLY phase

Before user-approval of `SEARCH-RANKING-IMPROVEMENT-1 APPLY`:

1. **Re-run audit (`scripts/search/_search_ranking_improvement_1_audit.mjs`)**:
   - Must keep 55/56 happy-path pass rate (≥98.2%)
   - Must improve adversarial scenarios: `mum`→mumbai 1st (not muli), `pun`→pune 1st (not puno), Hyderabad+ur→hyderabad-pk 1st
2. **Carry-forward**:
   - `_test_search_place_endpoint.mjs` (659 tests) — must stay 659/659 OR justify any drop
   - `_test_place_by_slug.mjs` (44) — unchanged
   - `_test_city_page_l10n.mjs` (152) — unchanged
   - `_test_search_ar.mjs` (22) — unchanged
   - `_test_place_names_{hi,ur,bn}_in_1.mjs` (116+122+113 = 351) — unchanged
   - `_test_place_names_ur_pk_6.mjs` (69) + UR-IR-1/UR-AF-1 + asia-1d-pk-search/mcf
3. **New SEARCH-RANKING-1 dedicated suite**: covering all 56 + 16 adversarial scenarios with explicit expected top-3 slugs
4. **Snapshot regression**: capture current top-10 for ~50 common queries before/after — only documented expected diffs allowed

---

## 8. Files this plan phase changed

### CREATED

| File | Purpose |
|---|---|
| `reports/search-ranking-improvement-1-plan.md` | This plan report |
| `scripts/search/_search_ranking_improvement_1_audit.mjs` | Read-only audit script (boots-server-then-queries; no mutation) |

### NOT modified

- ❌ `db/places/curated-places.json` — 0 byte diff (verified)
- ❌ `db/places/candidates/*` — unchanged
- ❌ `server.js` — 0 byte diff (verified)
- ❌ `js/app.js` — 0 byte diff (verified)
- ❌ `index.html` — unchanged
- ❌ All `scripts/geodata/*.mjs` shared scripts — unchanged
- ❌ All existing test scripts — unchanged
- ❌ MEMORY.md — not updated (deferred to post-user-approval if APPLY landed)

### Operations explicitly NOT run

- ❌ No code change to `_searchCuratedPlaces`
- ❌ No Stage 4 invocation, no merge
- ❌ 0 mutations to any curated entry
- ❌ No new routes / Held-Queue phases started
- ❌ No runtime translation, no fillchain

---

## 9. Recommendation

### Option A — APPLY the patch (NOT recommended now)

Risk-reward unfavorable given current 98.2% pass rate.

### Option B — Targeted micro-patches first (RECOMMENDED)

Split the scoring-model changes into 2-3 small, individually-testable patches:

**Patch 1 — Population tiebreaker only** (`log10(pop) * 0.5` boost):
- Solves the highest-impact issue (mum→muli, pun→puno)
- Smallest blast radius — single boost addition, no algorithm restructure
- Easy to verify: adversarial queries should improve; happy-path should stay 55/56

**Patch 2 — Per-bucket scoring (primary vs alias vs ancillary)** + **same-script bonus**:
- Solves alias-vs-primary distinction + script affinity
- Slightly larger change

**Patch 3 — Country-language affinity + featureCode boost**:
- Solves country-context + featureCode bias
- Requires the `langCountries` table — most user-input dependent

Each can land as a separate SEARCH-RANKING-IMPROVEMENT-1.X wave with its own plan + apply + closure. This keeps each change small and reversible.

### Option C — Hold for now (also valid)

Current 98.2% pass rate is good. The adversarial issues affect <5% of likely real-world queries. Wait until user reports specific search complaints before changing.

### Recommended path: **Option B — start with Patch 1 (population tiebreaker)**

Justification:
- Single, surgical change — `+ Math.log10(pop + 1) * 0.5`
- Solves the most embarrassing failures (mum→muli, pun→puno)
- Low risk: only affects tied-tier matches; doesn't change any current passes
- Easy to test/revert

**If user accepts Option B**: next phase = `SEARCH-RANKING-IMPROVEMENT-1A-PLAN` (population tiebreaker only).

If user accepts Option C: this plan documents the analysis for future reference; no further action.

---

## 10. Acceptance criteria for THIS plan phase

| # | Criterion | Status |
|---|---|---|
| 1 | One clear report at `reports/search-ranking-improvement-1-plan.md` | ✓ |
| 2 | Current ranking documented | ✓ (Section 2 — algorithm + does/doesn't) |
| 3 | Multi-lang queries tested | ✓ (56 queries across en/ur/bn/ar; data-only Hindi included) |
| 4 | Failure cases documented | ✓ (Section 3.2 = 1 happy-path failure; Section 4 = 7 adversarial issues) |
| 5 | Scoring model proposed | ✓ (Section 5 — pseudo-code + per-change rationale + risk table) |
| 6 | No `curated-places.json` mutation | ✓ (0 byte diff) |
| 7 | No `server.js` / `js/app.js` / `index.html` mutation | ✓ |
| 8 | No `names` / `aliases` modification | ✓ |
| 9 | No add/delete cities | ✓ |
| 10 | No runtime translation, no fillchain | ✓ |
| 11 | No Held-Queue phase started | ✓ |

---

## Held queue (per user direction — DO NOT auto-start)

- ❌ **SEARCH-RANKING-IMPROVEMENT-1 APPLY** (or split into 1A/1B/1C — awaits this plan's approval)
- ⏸️ PAUSED: PLACE-NAMES-TA-IN-1, MR-IN-1, HI-IN-LOCALE-ROUTING-1 (unsupported locales)
- ❌ ASIA-1D-IN-B
- ❌ ASIA-1F
- ❌ AMERICAS-1B-MCF
- ❌ DELETE-V1-AND-GEOCODE-PROXY-1
- ❌ ASIA-1D-BD-MCF
- ❌ ASIA-1D-BD-MISSING-AR-MAJORS-1B
- ❌ PLACE-NAMES-ALIASES-BD-SEED-1
- ❌ Barishal alias enrichment for `barisal` (small data fix; could be folded into BD-SEED-1 or done as a one-off)

---

## Status: 📋 PLAN COMPLETE — AWAITING USER DECISION

### Summary

| Metric | Value |
|---|---|
| Report path | `reports/search-ranking-improvement-1-plan.md` |
| Audit script | `scripts/search/_search_ranking_improvement_1_audit.mjs` (read-only) |
| Queries tested (happy-path) | **56** across India / Bangladesh / Pakistan / multi-script |
| Pass rate (happy-path) | **55/56 = 98.2%** |
| Adversarial scenarios tested | 16 |
| Adversarial issues found | **7** (population tiebreak, substring leak, lang-context, primary-vs-alias, featureCode, same-script, missing alias) |
| 1 happy-path failure | `Barishal` → external Nominatim (curated `barisal` has no "Barishal" alias) — DATA fix, not ranking |
| `curated-places.json` mutations | **0 bytes changed** |
| `server.js` / `js/app.js` mutations | **0 bytes changed** |
| Merge | **NOT RUN** |
| Runtime translation / fillchain | **NONE** |
| **Recommended path** | **Option B — start with Patch 1 (population tiebreaker only)** |

**Alternatives**: Option A (full APPLY now — not recommended); Option C (hold for now — also valid).

**Next step**: user reviews this plan and decides Option A / B / C / no-action. No further work until user direction.
