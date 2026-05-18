// scripts/geodata/_asia_1g_af_premerge_qa.mjs
// ASIA-1G-AF-PREMERGE-QA-1 — pre-merge QA for passes-gate entries from
// ASIA-1G-AF (Afghanistan only).
//
// Inputs:
//   db/places/candidates/af-geonames-candidates.json (post-Stage-3.4 + 3.5)
//   db/places/curated-places.json
//
// Output: reports/geodata-asia-1g-af-premerge-qa.md
//
// 8 checks (same as ASIA-1G-IR pattern + AF watchlist):
//   1. Duplicate Arabic within passes-gate
//   2. Cross-set duplicate against existing curated
//   3. Incomplete compound names (-shahr, -abad, bandar, etc.)
//   4. Aliases.ar still containing Persian/Urdu/Pashto/Latin
//   5. names.ar failing clean check
//   6. Bad slug pattern
//   7. Watch-list collision review (17 Afghan cities)
//   8. Auto-derived major-cities-blocked recommendation
//
// Special AF flag: detect Stage 3.4 mechanical-but-semantically-questionable
// Arabic from پ→ب default mapping for city names (e.g. "Pul" → "بل").
import fs from 'node:fs';
import path from 'node:path';
import { pathsFor, BASE_PATHS } from './_geonames_common.mjs';

const CC = 'af';

const PERSIAN_URDU = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨۆۇۈېەڕڼ]/;
const LATIN_IN_AR  = /[A-Za-z]/;

// User-flagged watchlist (17 Afghan cities — Arabic Wikipedia common names)
const WATCHLIST = [
    'kabul', 'kandahar', 'herat', 'mazar-e-sharif', 'jalalabad',
    'kunduz', 'ghazni', 'balkh', 'baghlan', 'pul-e-khumri',
    'charikar', 'taloqan', 'sheberghan', 'shibirghan',  // sheberghan + GeoNames variant
    'farah', 'lashkar-gah', 'khost', 'bamyan', 'bamyān'
];

// Compound-name hints — AF-specific Persian/Pashto suffix patterns
const COMPOUND_HINTS = {
    'shahr':  { en: 'shahr',  ar_expected: 'شهر',  desc: '"X-shahr" suffix' },
    'abad':   { en: 'abad',   ar_expected: 'آباد', desc: '"X-abad" suffix' },
    'bandar': { en: 'bandar', ar_expected: 'بندر', desc: '"Bandar X" prefix' },
    'gah':    { en: 'gah',    ar_expected: 'گاه',  desc: '"-gah" suffix (e.g. Lashkar Gah)' },
    'koh':    { en: 'koh',    ar_expected: 'كوه',  desc: '"-koh" suffix (e.g. Fayroz Koh)' },
};

// Stage 3.4 "semantic-questionable" detector: ban specific (pu→بُل / cha→جا)
// transliterations that arise from default پ→ب / چ→ج when the source city name
// uses "Pul" or "Charikar" or "Charsadda" — these are real city names that
// lose their identity under default cleaning.
const SEMANTIC_FLAG_PATTERNS = [
    { pattern: /^بل\s/, hint: 'Persian "Pul" (bridge) → "بل" via default پ→ب default. Canonical is to keep "پل" or use compound transliteration.' },
    { pattern: /^بل-/,  hint: 'Same as above ("Pul-" prefix).' },
    { pattern: /جاريكار/, hint: 'Persian "Charikar" → "جاريكار" via چ→ج default. Canonical Arabic is "تشاريكار" or "شاريكار".' },
    { pattern: /سر\s+بل/, hint: 'Persian "Sar-e-Pul" → "سر بل" via پ→ب default. Canonical "سار-إي-بل" or keep "پل".' },
];

function isCleanArabic(name) {
    if (!name) return false;
    const stripped = String(name).replace(/[ً-ٰٟۖ-ۭـ]/g, '')
        .replace(/[\s.,()'\-/؛؟،]/g, '')
        .replace(/[0-9٠-٩]/g, '');
    if (!stripped) return false;
    if (PERSIAN_URDU.test(stripped)) return false;
    if (LATIN_IN_AR.test(stripped))  return false;
    return /^[ء-يٰ-ٳـ]+$/.test(stripped);
}

function hasPersianOrUrduChars(name) {
    return PERSIAN_URDU.test(String(name || ''));
}

function detectIncompleteName(slug, enName, arName) {
    if (!enName || !arName) return null;
    const enLower = enName.toLowerCase();
    const issues = [];
    for (const [key, hint] of Object.entries(COMPOUND_HINTS)) {
        const enRegex = new RegExp('\\b' + key + '\\b', 'i');
        if (enRegex.test(enLower)) {
            if (!arName.includes(hint.ar_expected)) {
                issues.push({ enToken: key, expected: hint.ar_expected, found: arName });
            }
        }
    }
    return issues.length > 0 ? issues : null;
}

function detectSemanticFlag(arName) {
    if (!arName) return null;
    for (const { pattern, hint } of SEMANTIC_FLAG_PATTERNS) {
        if (pattern.test(arName)) return hint;
    }
    return null;
}

function main() {
    const entries = JSON.parse(fs.readFileSync(pathsFor(CC).candidatesJson, 'utf8'));
    const curated = JSON.parse(fs.readFileSync(pathsFor(CC).curatedPath, 'utf8'));

    const passes = entries.filter(e =>
        e.status === 'pending' && e.tier === 'high' && e.pendingAfterArGate === true
    ).map(e => ({ cc: CC, entry: e }));
    console.log('[qa] loaded ' + passes.length + ' passes-gate entries');

    const curatedByAr = new Map();
    for (const c of curated) {
        const ar = c.names && c.names.ar;
        if (ar) {
            if (!curatedByAr.has(ar)) curatedByAr.set(ar, []);
            curatedByAr.get(ar).push(c);
        }
    }

    // Check 1: dup-Arabic within passes-gate
    const arCount = new Map();
    for (const p of passes) {
        const ar = p.entry.candidate.names.ar;
        if (!arCount.has(ar)) arCount.set(ar, []);
        arCount.get(ar).push(p);
    }
    const dupsInWave = [];
    for (const [ar, list] of arCount) if (list.length > 1) dupsInWave.push({ ar, list });

    // Check 2: dup against curated
    const dupsAgainstCurated = [];
    for (const p of passes) {
        const ar = p.entry.candidate.names.ar;
        if (curatedByAr.has(ar)) {
            const matching = curatedByAr.get(ar);
            dupsAgainstCurated.push({
                wave: { cc: p.cc, slug: p.entry.slug, en: p.entry.candidate.names.en, ar },
                curated: matching.map(c => ({ cc: c.countryCode, slug: c.slug }))
            });
        }
    }

    // Check 3: incomplete compound names
    const incompleteNames = [];
    for (const p of passes) {
        const c = p.entry.candidate;
        const issues = detectIncompleteName(p.entry.slug, c.names.en, c.names.ar);
        if (issues) incompleteNames.push({
            cc: p.cc, slug: p.entry.slug, en: c.names.en, ar: c.names.ar, issues
        });
    }

    // Check 4: aliases pollution
    const dirtyAliases = [];
    for (const p of passes) {
        const aliases = (p.entry.candidate.aliases && p.entry.candidate.aliases.ar) || [];
        const dirty = aliases.filter(a => hasPersianOrUrduChars(a) || LATIN_IN_AR.test(a));
        if (dirty.length) dirtyAliases.push({
            cc: p.cc, slug: p.entry.slug, ar: p.entry.candidate.names.ar, dirty
        });
    }

    // Check 5: clean-check
    const dirtyNamesAr = [];
    for (const p of passes) {
        const ar = p.entry.candidate.names.ar;
        if (!isCleanArabic(ar)) dirtyNamesAr.push({
            cc: p.cc, slug: p.entry.slug, en: p.entry.candidate.names.en, ar
        });
    }

    // Check 6: bad slugs
    const slugPattern = /^[a-z0-9][a-z0-9-]{0,79}$/;
    const badSlugs = passes.filter(p => !slugPattern.test(p.entry.slug))
        .map(p => ({ cc: p.cc, slug: p.entry.slug }));

    // Check 7: watchlist
    const watchHits = [];
    for (const slug of WATCHLIST) {
        const inWave = passes.filter(p => p.entry.slug === slug);
        const inCurated = curated.filter(c => c.slug === slug);
        const blockedSameSlug = entries.filter(e =>
            e.slug === slug && e.status === 'pending' && e.tier === 'high'
            && e.pendingAfterArGate === false
        );
        if (inWave.length || inCurated.length || blockedSameSlug.length) {
            watchHits.push({
                slug,
                curatedOwner: inCurated.length ? inCurated[0].countryCode : null,
                curatedOwnerAr: inCurated.length ? (inCurated[0].names && inCurated[0].names.ar) : null,
                passingGateInWave: inWave.map(p => ({
                    cc: p.cc, pop: p.entry.candidate.population, ar: p.entry.candidate.names.ar
                })),
                blockedInWave: blockedSameSlug.map(b => ({
                    cc: CC, pop: b.candidate.population, ar: b.candidate.names.ar,
                    arQ: b.arQuality && b.arQuality.quality
                }))
            });
        }
    }

    // Check 8: major blocked
    const majorBlockedAutoReco = [];
    for (const e of entries) {
        if (e.status === 'pending' && e.tier === 'high' && e.pendingAfterArGate === false) {
            const c = e.candidate;
            const pop = c.population || 0;
            const isAdmin = c.featureCode === 'PPLC' || c.featureCode === 'PPLA';
            if ((pop >= 100000) || isAdmin) {
                let issue;
                if (e.collisionInWave) issue = 'wave-collision';
                else if (e.collisionAgainstCurated) issue = 'curated-collision';
                else issue = 'ar-gate ' + (e.arQuality && e.arQuality.quality);
                majorBlockedAutoReco.push({
                    cc: CC, slug: e.slug, pop, fc: c.featureCode,
                    ar: c.names.ar, en: c.names.en, issue
                });
            }
        }
    }
    majorBlockedAutoReco.sort((a, b) => b.pop - a.pop);

    // Check 9 (NEW): semantic flags for Stage 3.4 mechanical-but-questionable names
    const semanticFlags = [];
    for (const p of passes) {
        const ar = p.entry.candidate.names.ar;
        const flag = detectSemanticFlag(ar);
        if (flag) {
            semanticFlags.push({
                slug: p.entry.slug,
                pop: p.entry.candidate.population || 0,
                ar,
                en: p.entry.candidate.names.en,
                hint: flag
            });
        }
    }

    // Build report
    const L = [];
    L.push('# ASIA-1G-AF Pre-Merge QA Report');
    L.push('');
    L.push('**Wave**: `CURATED-GEODATA-ASIA-1G-AF`');
    L.push('**Country**: Afghanistan (أفغانستان)');
    L.push('**Generated**: ' + new Date().toISOString());
    L.push('**Passes-gate entries scanned**: ' + passes.length);
    L.push('');

    L.push('## Top-line counts');
    L.push('');
    L.push('| Check | Hits |');
    L.push('| --- | ---: |');
    L.push('| Duplicate Arabic within passes-gate | **' + dupsInWave.length + '** |');
    L.push('| Passes-gate Arabic matching existing curated entry | **' + dupsAgainstCurated.length + '** |');
    L.push('| Incomplete compound names | **' + incompleteNames.length + '** |');
    L.push('| Aliases.ar with Persian/Urdu/Pashto/Latin pollution | **' + dirtyAliases.length + '** |');
    L.push('| Names.ar failing clean check | **' + dirtyNamesAr.length + '** |');
    L.push('| Bad slugs | **' + badSlugs.length + '** |');
    L.push('| Watch-list slugs touched | **' + watchHits.length + '** |');
    L.push('| Major-blocked candidates (auto-derived) | **' + majorBlockedAutoReco.length + '** |');
    L.push('| **🚨 Semantic flags (Stage 3.4 mechanical default questionable)** | **' + semanticFlags.length + '** |');
    L.push('');

    L.push('## ① Duplicate Arabic within passes-gate (' + dupsInWave.length + ')');
    L.push('');
    if (!dupsInWave.length) L.push('_✅ No duplicates._');
    else {
        L.push('| name.ar | cc/slug | en |');
        L.push('| --- | --- | --- |');
        for (const dup of dupsInWave) for (const p of dup.list) {
            L.push('| `' + dup.ar + '` | ' + p.cc + '/' + p.entry.slug + ' | ' + p.entry.candidate.names.en + ' |');
        }
    }
    L.push('');

    L.push('## ② Passes-gate Arabic matches existing curated (' + dupsAgainstCurated.length + ')');
    L.push('');
    if (!dupsAgainstCurated.length) L.push('_✅ No collisions._');
    else {
        L.push('| wave cc/slug | wave en | shared ar | existing curated |');
        L.push('| --- | --- | --- | --- |');
        for (const d of dupsAgainstCurated) {
            L.push('| ' + d.wave.cc + '/' + d.wave.slug + ' | ' + d.wave.en + ' | `' + d.wave.ar + '` | ' + d.curated.map(c => c.cc + '/' + c.slug).join(', ') + ' |');
        }
    }
    L.push('');

    L.push('## ③ Incomplete compound names (' + incompleteNames.length + ')');
    L.push('');
    if (!incompleteNames.length) L.push('_✅ None._');
    else {
        L.push('| cc/slug | en | ar | missing Arabic for English token |');
        L.push('| --- | --- | --- | --- |');
        for (const item of incompleteNames) {
            const issuesStr = item.issues.map(i => '`' + i.enToken + '` → expects `' + i.expected + '`').join('; ');
            L.push('| ' + item.cc + '/' + item.slug + ' | ' + item.en + ' | `' + item.ar + '` | ' + issuesStr + ' |');
        }
    }
    L.push('');

    L.push('## ④ Aliases.ar with Persian/Urdu/Pashto/Latin pollution (' + dirtyAliases.length + ')');
    L.push('');
    if (!dirtyAliases.length) L.push('_✅ Clean._');
    else {
        L.push('| cc/slug | name.ar | dirty alias(es) |');
        L.push('| --- | --- | --- |');
        for (const item of dirtyAliases.slice(0, 30)) {
            L.push('| ' + item.cc + '/' + item.slug + ' | `' + item.ar + '` | `' + item.dirty.join('` ، `') + '` |');
        }
        if (dirtyAliases.length > 30) L.push('\n_(... ' + (dirtyAliases.length - 30) + ' more)_');
    }
    L.push('');

    L.push('## ⑤ Names.ar failing clean check (' + dirtyNamesAr.length + ')');
    L.push('');
    if (!dirtyNamesAr.length) L.push('_✅ All clean._');
    else {
        L.push('| cc/slug | en | ar |');
        L.push('| --- | --- | --- |');
        for (const item of dirtyNamesAr) L.push('| ' + item.cc + '/' + item.slug + ' | ' + item.en + ' | `' + item.ar + '` |');
    }
    L.push('');

    L.push('## ⑥ Bad slugs (' + badSlugs.length + ')');
    L.push('');
    if (!badSlugs.length) L.push('_✅ All slugs valid._');
    else for (const b of badSlugs) L.push('  - ' + b.cc + '/' + b.slug);
    L.push('');

    L.push('## ⑦ Watch-list collision review (' + watchHits.length + ')');
    L.push('');
    L.push('User-flagged Afghan cities: `' + WATCHLIST.join('`, `') + '`');
    L.push('');
    if (!watchHits.length) L.push('_(none touched)_');
    else {
        L.push('| slug | curated owner | wave passes-gate | wave blocked | note |');
        L.push('| --- | --- | --- | --- | --- |');
        for (const w of watchHits) {
            const ownerStr = w.curatedOwner ? '`' + w.curatedOwner + '` owns bare (`' + (w.curatedOwnerAr || '?') + '`)' : '_(free)_';
            const passes = w.passingGateInWave.map(p => 'pop=' + p.pop + ' ar=`' + p.ar + '`').join(' • ') || '—';
            const blocked = w.blockedInWave.map(b => 'pop=' + b.pop + ' (' + b.arQ + ')').join(' • ') || '—';
            let note = '';
            if (w.passingGateInWave.length) note = '✓ wave proposes';
            else if (w.blockedInWave.length) note = '⏭️ blocked';
            else note = '✅ already curated';
            L.push('| `' + w.slug + '` | ' + ownerStr + ' | ' + passes + ' | ' + blocked + ' | ' + note + ' |');
        }
    }
    L.push('');

    L.push('## ⑧ Major-cities-blocked auto-derived recommendation (' + majorBlockedAutoReco.length + ')');
    L.push('');
    if (!majorBlockedAutoReco.length) L.push('_✅ No major-blocked candidates._');
    else {
        L.push('Major (pop ≥ 100k OR PPLC/PPLA) high-tier entries CURRENTLY BLOCKED. Candidates for a future `ASIA-1G-AF-MCF` mini-phase.');
        L.push('');
        L.push('| slug | pop | fc | current ar | en | issue |');
        L.push('| --- | ---: | --- | --- | --- | --- |');
        for (const m of majorBlockedAutoReco) {
            L.push('| `' + m.slug + '` | ' + m.pop.toLocaleString() + ' | ' + m.fc + ' | `' + (m.ar || '(empty)') + '` | ' + m.en + ' | ' + m.issue + ' |');
        }
    }
    L.push('');

    L.push('## 🚨 ⑨ Semantic flags — Stage 3.4 mechanical-but-questionable (' + semanticFlags.length + ')');
    L.push('');
    L.push('These passed the Stage 3.5 gate (technically `arabic_only`) but the cleaned form may not be the canonical Arabic transliteration. They should be **reviewed semantically** before clean merge, similar to the kg/manas / qaem-shahr precedent.');
    L.push('');
    if (!semanticFlags.length) L.push('_✅ None detected._');
    else {
        L.push('| slug | pop | en | Stage 3.4 result | issue |');
        L.push('| --- | ---: | --- | --- | --- |');
        for (const s of semanticFlags) {
            L.push('| `' + s.slug + '` | ' + s.pop.toLocaleString() + ' | ' + s.en + ' | `' + s.ar + '` | ' + s.hint + ' |');
        }
    }
    L.push('');

    const dupCount = dupsInWave.reduce((s, d) => s + d.list.length, 0);
    const safeCount = Math.max(0, passes.length - dupCount - incompleteNames.length - dupsAgainstCurated.length - dirtyNamesAr.length - semanticFlags.length);
    L.push('## Summary');
    L.push('');
    L.push('| Outcome | Count |');
    L.push('| --- | ---: |');
    L.push('| Total passes-gate scanned | ' + passes.length + ' |');
    L.push('| **Safe-to-merge clean** | **~' + safeCount + '** |');
    L.push('| Needs manual Arabic fix (dup OR incomplete OR semantic) | ~' + (dupCount + incompleteNames.length + dupsAgainstCurated.length + semanticFlags.length) + ' |');
    L.push('| Aliases need cleaning (cosmetic) | ' + dirtyAliases.length + ' |');
    L.push('| Major blocked (deferred to MCF) | ' + majorBlockedAutoReco.length + ' |');
    L.push('');

    L.push('## Next steps');
    L.push('');
    L.push('Per user direction (avoid kg/manas repeat), any semantic flag should be reviewed before clean merge.');
    L.push('');
    L.push('Reply with one of:');
    L.push('');
    L.push('- **`approve A — clean merge ~' + safeCount + ' safe-only`** (defer semantic flags + dups to follow-up)');
    L.push('- **`fix arabic per row`** — supply (slug → correct ar) before merge');
    L.push('- **`exclude specific slugs`** — list slugs to drop');
    L.push('- **`run major-cities-fix first`** — handle ' + majorBlockedAutoReco.length + ' blocked-major before merge');
    L.push('');
    L.push('**No merge yet — Stage 4 awaits user approval.**');

    const outPath = path.join(BASE_PATHS.reportDir, 'geodata-asia-1g-af-premerge-qa.md');
    fs.writeFileSync(outPath, L.join('\n'));
    console.log('[qa] wrote ' + outPath);

    console.log('');
    console.log('═══ ASIA-1G-AF Pre-Merge QA ═══');
    console.log('Passes-gate total:           ' + passes.length);
    console.log('Dup-Arabic within wave:      ' + dupsInWave.length);
    console.log('Dup against curated:         ' + dupsAgainstCurated.length);
    console.log('Incomplete compound names:   ' + incompleteNames.length);
    console.log('Dirty aliases.ar:            ' + dirtyAliases.length);
    console.log('Bad names.ar:                ' + dirtyNamesAr.length);
    console.log('Bad slugs:                   ' + badSlugs.length);
    console.log('Watch-list hits:             ' + watchHits.length);
    console.log('Major-blocked candidates:    ' + majorBlockedAutoReco.length);
    console.log('🚨 Semantic flags:           ' + semanticFlags.length);
    console.log('');
    console.log('Estimated safe-to-merge:     ~' + safeCount);
}

main();
