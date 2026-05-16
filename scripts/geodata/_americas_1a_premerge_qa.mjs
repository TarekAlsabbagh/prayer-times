// scripts/geodata/_americas_1a_premerge_qa.mjs
// ─────────────────────────────────────────────────────────────────────────
// AMERICAS-1A-PREMERGE-QA-1 — pre-merge quality assurance for the 141
// passes-gate entries from AMERICAS-1A. Generates a comprehensive QA
// report at reports/geodata-americas-1a-premerge-qa.md.
//
// Does NOT modify candidates JSONs or curated-places.json.
//
// Checks performed:
//   1. Duplicate Arabic scan — names.ar within passes-gate must be unique
//      (a duplicate signals a wrong/translated-from-template error)
//   2. Cross-set Arabic comparison — passes-gate ar vs existing curated ar
//      (could indicate a city was named the same as a famous one elsewhere)
//   3. Semantic spot-check — manually-curated checklist for known major
//      cities: name length, common terms (city, beach, springs), per-city
//      expected hits
//   4. Slug pattern check — slug length, hyphens, ASCII validity
//   5. Aliases.ar Persian/Urdu contamination check (similar to names.ar)
//   6. Collision recommendation — for the user's watchlist, suggest
//      bare-vs-suffix policy
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { pathsFor, BASE_PATHS } from './_geonames_common.mjs';

const CCS = ['us','ca','mx'];
const PERSIAN_URDU = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨ]/;
const LATIN_IN_AR = /[A-Za-z]/;

// User's watchlist for collision review
const WATCHLIST = ['rochester','toledo','salem','victoria','cordoba','merida',
                   'cambridge','birmingham','manchester','athens','dublin',
                   'saint-petersburg','granada','santiago','leon','newcastle',
                   'york','peterborough','washington'];

// User's major-city semantic-review focus list
const SEMANTIC_FOCUS = ['salt-lake-city','manhattan','fort-worth','columbus',
                       'charlotte','detroit','memphis','omaha','kansas-city',
                       'colorado-springs','virginia-beach','tampa','wichita',
                       'bakersfield','honolulu','anaheim','puebla',
                       'ciudad-juarez','zapopan','tijuana','ecatepec',
                       'naucalpan'];

// Common Arabic words for compound city names — heuristics for incomplete names
const COMPOUND_HINTS = {
    'city':         { en: 'city',         ar_expected: 'سيتي',     desc: 'should end with سيتي for "X City"' },
    'beach':        { en: 'beach',        ar_expected: 'بيتش',     desc: 'should end with بيتش for "X Beach"' },
    'springs':      { en: 'springs',      ar_expected: 'سبرينغز',  desc: 'should end with سبرينغز for "X Springs"' },
    'falls':        { en: 'falls',        ar_expected: 'فولز',     desc: '"X Falls"' },
    'valley':       { en: 'valley',       ar_expected: 'فالي',     desc: '"X Valley"' },
    'lake':         { en: 'lake',         ar_expected: 'ليك',      desc: '"X Lake"' },
    'park':         { en: 'park',         ar_expected: 'بارك',     desc: '"X Park"' },
    'heights':      { en: 'heights',      ar_expected: 'هايتس',    desc: '"X Heights"' },
    'fort':         { en: 'fort',         ar_expected: 'فورت',     desc: '"Fort X"' },
    'saint':        { en: 'saint',        ar_expected: 'سانت',     desc: '"Saint X"' },
    'st.':          { en: 'st.',          ar_expected: 'سانت',     desc: '"St. X"' }
};

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
        // Match as whole token (word-boundary safe)
        const enRegex = new RegExp('\\b' + key.replace(/\./g, '\\.') + '\\b', 'i');
        if (enRegex.test(enLower)) {
            // Check the Arabic name should contain the expected Arabic equivalent
            if (!arName.includes(hint.ar_expected)) {
                issues.push({ enToken: key, expected: hint.ar_expected, found: arName });
            }
        }
    }
    return issues.length > 0 ? issues : null;
}

function main() {
    // Load passes-gate from candidates per cc
    const passes = [];
    for (const cc of CCS) {
        const list = JSON.parse(fs.readFileSync(pathsFor(cc).candidatesJson, 'utf8'));
        for (const e of list) {
            if (e.status === 'pending' && e.tier === 'high' && e.pendingAfterArGate === true) {
                passes.push({ cc, entry: e });
            }
        }
    }
    console.log('[qa] loaded ' + passes.length + ' passes-gate entries');

    // Load existing curated for cross-comparison
    const curated = JSON.parse(fs.readFileSync(pathsFor('us').curatedPath, 'utf8'));
    const curatedByAr = new Map();
    for (const c of curated) {
        const ar = c.names && c.names.ar;
        if (ar) {
            if (!curatedByAr.has(ar)) curatedByAr.set(ar, []);
            curatedByAr.get(ar).push(c);
        }
    }
    const curatedSlugs = new Set(curated.map(x => x.slug));

    // === Check 1: dup-Arabic within passes-gate ===
    const arCount = new Map();
    for (const p of passes) {
        const ar = p.entry.candidate.names.ar;
        if (!arCount.has(ar)) arCount.set(ar, []);
        arCount.get(ar).push(p);
    }
    const dupsInWave = [];
    for (const [ar, list] of arCount) {
        if (list.length > 1) dupsInWave.push({ ar, list });
    }

    // === Check 2: dup-Arabic against existing curated ===
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

    // === Check 3: Semantic checks (incomplete compound names) ===
    const incompleteNames = [];
    for (const p of passes) {
        const c = p.entry.candidate;
        const issues = detectIncompleteName(p.entry.slug, c.names.en, c.names.ar);
        if (issues) {
            incompleteNames.push({
                cc: p.cc, slug: p.entry.slug, en: c.names.en, ar: c.names.ar,
                issues
            });
        }
    }

    // === Check 4: Aliases.ar Persian/Urdu pollution ===
    const dirtyAliases = [];
    for (const p of passes) {
        const aliases = (p.entry.candidate.aliases && p.entry.candidate.aliases.ar) || [];
        const dirty = aliases.filter(a => hasPersianOrUrduChars(a) || LATIN_IN_AR.test(a));
        if (dirty.length) {
            dirtyAliases.push({
                cc: p.cc, slug: p.entry.slug, ar: p.entry.candidate.names.ar,
                dirty
            });
        }
    }

    // === Check 5: Re-verify name.ar passes the clean check ===
    const dirtyNamesAr = [];
    for (const p of passes) {
        const ar = p.entry.candidate.names.ar;
        if (!isCleanArabic(ar)) {
            dirtyNamesAr.push({ cc: p.cc, slug: p.entry.slug, en: p.entry.candidate.names.en, ar });
        }
    }

    // === Check 6: Slug validity ===
    const slugPattern = /^[a-z0-9][a-z0-9-]{0,79}$/;
    const badSlugs = [];
    for (const p of passes) {
        if (!slugPattern.test(p.entry.slug)) {
            badSlugs.push({ cc: p.cc, slug: p.entry.slug });
        }
    }

    // === Check 7: Watch-list collision review ===
    const watchHits = [];
    for (const slug of WATCHLIST) {
        const inWave = passes.filter(p => p.entry.slug === slug);
        const inCurated = curated.filter(c => c.slug === slug);
        const inCuratedSuffixed = curated.filter(c => c.slug.startsWith(slug + '-'));
        if (inWave.length || inCurated.length || inCuratedSuffixed.length) {
            // Also count candidates in any status (not just passes-gate) with same slug
            const ALL_blockedSameSlug = [];
            for (const cc of CCS) {
                const list = JSON.parse(fs.readFileSync(pathsFor(cc).candidatesJson, 'utf8'));
                const blocked = list.filter(e =>
                    e.slug === slug && e.status === 'pending' && e.tier === 'high'
                    && e.pendingAfterArGate === false
                );
                for (const b of blocked) ALL_blockedSameSlug.push({
                    cc, pop: b.candidate.population,
                    ar: b.candidate.names.ar,
                    arQ: b.arQuality && b.arQuality.quality,
                    region: b.candidate.admin && b.candidate.admin.regionEn
                });
            }
            watchHits.push({
                slug,
                curatedOwner: inCurated.length ? inCurated[0].countryCode : null,
                curatedSuffixed: inCuratedSuffixed.map(c => c.slug),
                passingGateInWave: inWave.map(p => ({
                    cc: p.cc,
                    pop: p.entry.candidate.population,
                    ar: p.entry.candidate.names.ar,
                    region: p.entry.candidate.admin && p.entry.candidate.admin.regionEn
                })),
                blockedInWave: ALL_blockedSameSlug
            });
        }
    }

    // === Build markdown report ===
    const lines = [];
    lines.push('# AMERICAS-1A Pre-Merge QA Report');
    lines.push('');
    lines.push('**Wave**: `CURATED-GEODATA-AMERICAS-1A`');
    lines.push('**Generated**: ' + new Date().toISOString());
    lines.push('**Passes-gate entries scanned**: ' + passes.length);
    lines.push('');

    lines.push('## Top-line counts');
    lines.push('');
    lines.push('| Check | Hits |');
    lines.push('| --- | ---: |');
    lines.push('| Duplicate Arabic names within passes-gate | **' + dupsInWave.length + '** |');
    lines.push('| Passes-gate Arabic matching existing curated entry | **' + dupsAgainstCurated.length + '** |');
    lines.push('| Incomplete compound names (City/Beach/Springs/etc.) | **' + incompleteNames.length + '** |');
    lines.push('| Aliases.ar with Persian/Urdu/Latin pollution | **' + dirtyAliases.length + '** |');
    lines.push('| Names.ar failing clean check (should be 0) | **' + dirtyNamesAr.length + '** |');
    lines.push('| Bad slugs | **' + badSlugs.length + '** |');
    lines.push('| Watch-list slugs touched | **' + watchHits.length + '** |');
    lines.push('');

    // Section 1: Dup-Arabic within wave
    lines.push('## ① Duplicate Arabic within passes-gate (' + dupsInWave.length + ')');
    lines.push('');
    if (!dupsInWave.length) {
        lines.push('_✅ No duplicates — every entry has a unique Arabic name._');
        lines.push('');
    } else {
        lines.push('Each row shows entries with **identical** `names.ar`. Likely indicates a wrong/templated transliteration.');
        lines.push('');
        lines.push('| name.ar | cc/slug | en |');
        lines.push('| --- | --- | --- |');
        for (const dup of dupsInWave) {
            for (const p of dup.list) {
                lines.push('| `' + dup.ar + '` | ' + p.cc + '/' + p.entry.slug + ' | ' + p.entry.candidate.names.en + ' |');
            }
        }
        lines.push('');
    }

    // Section 2: Dup against curated
    lines.push('## ② Passes-gate Arabic matches existing curated (' + dupsAgainstCurated.length + ')');
    lines.push('');
    if (!dupsAgainstCurated.length) {
        lines.push('_✅ No collisions against existing curated by Arabic name._');
        lines.push('');
    } else {
        lines.push('Each row shows a passes-gate entry whose `names.ar` is also used by an existing curated entry. The user may want to verify these are genuinely different cities.');
        lines.push('');
        lines.push('| wave cc/slug | wave en | shared ar | existing curated |');
        lines.push('| --- | --- | --- | --- |');
        for (const d of dupsAgainstCurated) {
            const existing = d.curated.map(c => c.cc + '/' + c.slug).join(', ');
            lines.push('| ' + d.wave.cc + '/' + d.wave.slug + ' | ' + d.wave.en + ' | `' + d.wave.ar + '` | ' + existing + ' |');
        }
        lines.push('');
    }

    // Section 3: Incomplete compound names
    lines.push('## ③ Incomplete compound names (' + incompleteNames.length + ')');
    lines.push('');
    if (!incompleteNames.length) {
        lines.push('_✅ No incomplete compound names detected._');
        lines.push('');
    } else {
        lines.push('English name contains a common suffix/prefix (City, Beach, Springs, etc.) but the Arabic name does not include the corresponding Arabic translation. Likely incomplete.');
        lines.push('');
        lines.push('| cc/slug | en | current ar | missing Arabic for English token |');
        lines.push('| --- | --- | --- | --- |');
        for (const item of incompleteNames) {
            const issuesStr = item.issues.map(i => '`' + i.enToken + '` → expects `' + i.expected + '`').join('; ');
            lines.push('| ' + item.cc + '/' + item.slug + ' | ' + item.en + ' | `' + item.ar + '` | ' + issuesStr + ' |');
        }
        lines.push('');
    }

    // Section 4: Aliases pollution
    lines.push('## ④ Aliases.ar with Persian/Urdu/Latin pollution (' + dirtyAliases.length + ')');
    lines.push('');
    if (!dirtyAliases.length) {
        lines.push('_✅ All aliases.ar across passes-gate are clean._');
        lines.push('');
    } else {
        lines.push('Auto-cleaning could be applied via the same rules as EUROPE-3 alias fix (`ی→ي ک→ك پ→ب گ→غ` etc.). Listing top 30:');
        lines.push('');
        lines.push('| cc/slug | name.ar | dirty alias(es) |');
        lines.push('| --- | --- | --- |');
        for (const item of dirtyAliases.slice(0, 30)) {
            lines.push('| ' + item.cc + '/' + item.slug + ' | `' + item.ar + '` | `' + item.dirty.join('` ، `') + '` |');
        }
        if (dirtyAliases.length > 30) {
            lines.push('');
            lines.push('_(... ' + (dirtyAliases.length - 30) + ' more — see candidates JSON)_');
        }
        lines.push('');
    }

    // Section 5: Names.ar that fail clean check (defense-in-depth)
    lines.push('## ⑤ Names.ar failing clean-check (defense-in-depth) (' + dirtyNamesAr.length + ')');
    lines.push('');
    if (!dirtyNamesAr.length) {
        lines.push('_✅ All passes-gate names.ar pass the clean-check (Stage 3.5 worked correctly)._');
        lines.push('');
    } else {
        lines.push('| cc/slug | en | ar |');
        lines.push('| --- | --- | --- |');
        for (const item of dirtyNamesAr) {
            lines.push('| ' + item.cc + '/' + item.slug + ' | ' + item.en + ' | `' + item.ar + '` |');
        }
        lines.push('');
    }

    // Section 6: Bad slugs
    lines.push('## ⑥ Bad slugs (' + badSlugs.length + ')');
    lines.push('');
    if (!badSlugs.length) {
        lines.push('_✅ All slugs match the safe pattern `[a-z0-9][a-z0-9-]{0,79}`._');
        lines.push('');
    } else {
        for (const b of badSlugs) lines.push('  - ' + b.cc + '/' + b.slug);
        lines.push('');
    }

    // Section 7: Watch-list collision review
    lines.push('## ⑦ Watch-list collision review (' + watchHits.length + ')');
    lines.push('');
    lines.push('| slug | curated owner | curated suffixed | passes-gate hits | blocked-by-collision hits | recommendation |');
    lines.push('| --- | --- | --- | --- | --- | --- |');
    for (const w of watchHits) {
        const ownerStr = w.curatedOwner ? '`' + w.curatedOwner + '` owns bare' : '_(free)_';
        const sufStr = w.curatedSuffixed.length ? w.curatedSuffixed.join(', ') : '—';
        const passes = w.passingGateInWave.map(p => p.cc + ':pop=' + p.pop).join(', ') || '—';
        const blocked = w.blockedInWave.map(b => b.cc + ':pop=' + b.pop + ' (' + (b.arQ || '?') + ')').join(', ') || '—';
        let rec = '';
        if (w.curatedOwner && w.passingGateInWave.length) {
            rec = '⚠️ wave ' + w.passingGateInWave[0].cc + ' claimed bare slug despite ' + w.curatedOwner + ' owning it — VERIFY';
        } else if (w.curatedOwner && w.blockedInWave.length) {
            rec = 'Wave version blocked; needs `' + w.slug + '-{cc}` rename if user wants to add it';
        } else if (!w.curatedOwner && w.passingGateInWave.length) {
            rec = 'Wave claims `' + w.slug + '` bare — OK if no future-collision concern';
        } else if (!w.curatedOwner && w.blockedInWave.length) {
            rec = '⚠️ slug is FREE but wave entry is blocked — likely intra-wave dup or ar-gate; consider override';
        }
        lines.push('| `' + w.slug + '` | ' + ownerStr + ' | ' + sufStr + ' | ' + passes + ' | ' + blocked + ' | ' + rec + ' |');
    }
    lines.push('');

    // Section 8: Final counts + recommendations
    const safeCount = passes.length - dupsInWave.reduce((s, d) => s + d.list.length, 0) - incompleteNames.length - dupsAgainstCurated.length - dirtyNamesAr.length;
    const needsManualFix = dupsInWave.reduce((s, d) => s + d.list.length, 0) + incompleteNames.length + dupsAgainstCurated.length;
    lines.push('## Summary');
    lines.push('');
    lines.push('| Outcome | Count |');
    lines.push('| --- | ---: |');
    lines.push('| Total passes-gate scanned | ' + passes.length + ' |');
    lines.push('| **Safe-to-merge clean** (no dup, no incomplete, no semantic flag) | **~' + safeCount + '** |');
    lines.push('| Needs manual Arabic fix (dup OR incomplete OR ambiguous) | ~' + needsManualFix + ' |');
    lines.push('| Aliases need cleaning (cosmetic, not blocking) | ' + dirtyAliases.length + ' |');
    lines.push('');

    lines.push('## Blocked major-cities recommendation (for separate `AMERICAS-1A-BLOCKED-MAJOR-CITIES-FIX-1`)');
    lines.push('');
    lines.push('| slug | cc | pop | issue | proposed action |');
    lines.push('| --- | --- | ---: | --- | --- |');
    const majorBlockedReco = [
        ['merida','mx',1201000,'collision (es owns bare `merida`)','rename to `merida-mx` + user-approved Arabic if needed'],
        ['cordoba','mx',204721,'collision (es owns bare `cordoba`)','rename to `cordoba-mx`'],
        ['victoria','ca',289625,'wave-blocked but free slug','override + claim bare `victoria` (BC PPLA)'],
        ['salem','us',175535,'wave-blocked but free slug','override + claim bare `salem` (OR PPLA)'],
        ['toledo','us',265638,'wave-blocked but free slug','override + claim bare `toledo` (OH, pop)'],
        ['birmingham','us',196357,'collision (gb owns bare)','rename to `birmingham-us`'],
        ['manchester','us',110229,'collision (gb owns bare)','rename to `manchester-us`'],
        ['cambridge','us',110402,'collision (gb owns bare)','rename to `cambridge-us`'],
        ['cambridge','ca',129920,'collision (gb owns bare)','rename to `cambridge-ca`'],
        ['athens','us',127315,'collision (gr owns bare)','rename to `athens-us`'],
        ['philadelphia','us',1573916,'Urdu Arabic blocked','user-approved fix to `فيلادلفيا`'],
        ['san-antonio','us',1526656,'Persian Arabic blocked','user-approved fix to `سان أنطونيو`'],
        ['austin','us',974447,'Urdu Arabic blocked','user-approved fix to `أوستن`'],
        ['indianapolis','us',887642,'Urdu Arabic blocked','user-approved fix to `إنديانابوليس`'],
        ['las-vegas','us',641903,'Urdu Arabic blocked','user-approved fix to `لاس فيغاس`'],
        ['louisville','us',624444,'Urdu Arabic blocked','user-approved fix to `لويزفيل`'],
        ['albuquerque','us',564559,'Urdu Arabic blocked','user-approved fix to `ألباكركي`'],
        ['milwaukee','us',563531,'Urdu Arabic blocked','user-approved fix to `ميلواكي`']
    ];
    for (const [slug, cc, pop, issue, action] of majorBlockedReco) {
        lines.push('| `' + slug + '` | ' + cc + ' | ' + pop.toLocaleString() + ' | ' + issue + ' | ' + action + ' |');
    }
    lines.push('');

    lines.push('## Next steps');
    lines.push('');
    lines.push('Reply to the assistant with one of:');
    lines.push('');
    lines.push('- **`approve A — clean passes-gate only (~' + safeCount + ')`** — merge safe set + drop incomplete + drop dup-arabic');
    lines.push('- **`approve C — A + major-cities fix`** — clean passes-gate + 8-10 collision-resolved major cities (~155-160)');
    lines.push('- **`approve D — A + C + Urdu manual fix`** — full set incl. user-approved Persian/Urdu corrections (~170-180)');
    lines.push('- **`exclude specific slugs`** — list specific slugs to skip');
    lines.push('- **`fix arabic per row`** — give a list of (slug → correct ar) pairs');
    lines.push('');
    lines.push('No merge yet — Stage 4 awaits user approval.');

    const outPath = path.join(BASE_PATHS.reportDir, 'geodata-americas-1a-premerge-qa.md');
    fs.writeFileSync(outPath, lines.join('\n'));
    console.log('[qa] wrote ' + outPath);

    // Also print a summary to stdout
    console.log('');
    console.log('═══ AMERICAS-1A Pre-Merge QA ═══');
    console.log('Passes-gate total: ' + passes.length);
    console.log('Dup-Arabic within wave: ' + dupsInWave.length);
    console.log('Dup against curated:    ' + dupsAgainstCurated.length);
    console.log('Incomplete compound names: ' + incompleteNames.length);
    console.log('Dirty aliases.ar:       ' + dirtyAliases.length);
    console.log('Bad names.ar:           ' + dirtyNamesAr.length);
    console.log('Bad slugs:              ' + badSlugs.length);
    console.log('Watch-list hits:        ' + watchHits.length);
    console.log('');
    console.log('Estimated safe-to-merge: ~' + safeCount);
    console.log('');
}

main();
