# Place Data Maintenance Policy

**Status**: 🔒 Adopted — 2026-05-21
**Scope**: All future modifications to `db/places/curated-places.json` (corrections and additions)
**Supersedes / consolidates**: `reports/city-add-supported-lang-policy.md`, `reports/unsupported-locale-waves-paused-policy.md`

This document is the permanent authority for HOW we modify place data. Any phase touching curated places must comply.

---

## 1. Supported UI Languages

The site's UI ships in exactly **10 languages**:

```
ar, en, fr, de, tr, ur, id, es, bn, ms
```

This list is the closed set. **Do NOT add a `names.<X>` field to any curated entry unless `X` is in this list, OR was already present as documented legacy** (e.g., the existing `names.hi` rows from the SEED-18 + BATCH-A-22 India HI-IN-1 wave — preserved as-is, never extended).

When (and only when) a new UI language is officially launched on the site, that language joins this list and a dedicated migration phase opens.

---

## 2. Required Names Policy

Every curated place MUST have:

* `names.ar` — universal baseline (Arabic)
* `names.en` — universal baseline (English)

Additionally, if the country's native/market language is in the supported UI list, the place MUST have that language too.

### Per-country requirement table

| Country / market | Required `names.*` keys |
|---|---|
| Indonesia (ID) | `ar`, `en`, `id` |
| Malaysia (MY), Singapore (SG), Brunei (BN) | `ar`, `en`, `ms` |
| Turkey (TR) | `ar`, `en`, `tr` |
| France (FR) | `ar`, `en`, `fr` |
| Germany (DE), Austria (AT) | `ar`, `en`, `de` |
| Switzerland (CH) — German parts | `ar`, `en`, `de` |
| Luxembourg (LU) | `ar`, `en`, `de`, `fr` |
| Belgium (BE) | `ar`, `en`, `fr`, `de` |
| Spain (ES) | `ar`, `en`, `es` |
| Mexico, Argentina, Chile, Colombia, Peru, Venezuela, Ecuador, Bolivia, Paraguay, Uruguay, Guatemala, Honduras, El Salvador, Nicaragua, Costa Rica, Panama, Cuba, Dominican Republic, Puerto Rico | `ar`, `en`, `es` |
| Pakistan (PK) | `ar`, `en`, `ur` |
| Bangladesh (BD) | `ar`, `en`, `bn` |
| **India (IN)** | `ar`, `en`, `ur`, `bn` — both Urdu and Bengali because both are supported UI langs and have large Muslim audiences in India |
| Arab countries (SA, EG, IQ, SY, JO, LB, PS, YE, OM, AE, KW, QA, BH, DZ, TN, MA, LY, SD, MR, KM, DJ) | `ar`, `en` (Arabic IS the native — no extra lang) |
| English-native (US, GB, CA, AU, IE, NZ) | `ar`, `en` |
| Any other country with native lang NOT in supported list | `ar`, `en` only |

### India note (Hindi data-only legacy)

The 40 India cities from HI-IN-1 (SEED-18 + BATCH-A-22) retain their `names.hi` field as legacy data. **Hindi is NOT extended to any new India entry**, and the UI does NOT route to `/hi/` — Hindi is purely data. If Hindi becomes a supported UI lang in the future, a dedicated phase will revisit this.

---

## 3. Unsupported Languages Policy

The following languages are **PROHIBITED** from being added to `names.*` on any curated entry (regardless of GeoNames availability):

```
hi, ta, mr, te, kn, ml, gu, pa, or, as, sa
```

(and any other language not in the §1 supported set)

This applies to corrections and to new additions. The only exception is the legacy `names.hi` data already present in SEED-18 + BATCH-A-22 (40 India entries) — preserved as-is, never extended.

---

## 4. Fallback Policy

Runtime city-name rendering follows this strict chain (implemented in `server/place-l10n/index.js → getLocalizedPlaceName`):

```
1. names[lang]   — IF present AND passes per-lang script guard
2. aliases[lang][0]   — IF present AND passes script guard (optional, via options.acceptAlias)
3. names.en   — single-tier en-fallback (untranslated proper noun)
4. legacy nameAr / nameEn   — cities-DB compatibility shim
5. any other names[k] (defensive last resort)
6. empty
```

**Forbidden fallback paths** (NEVER do these):

* ❌ Runtime translation (Google / OpenAI / Anthropic / browser MT)
* ❌ Fillchain (writing `names.<L> = names.en` to disk)
* ❌ Using a "close" language as a substitute (e.g., Arabic → Urdu, Hindi → Bengali, Indonesian → Malay)
* ❌ Using external geocoder (`Nominatim`, `LocationIQ`, etc.) `name:<lang>` annotation as the display label on a canonical curated city page
* ❌ Transliteration helpers as a runtime display source (transliterators exist only inside the AR search-ranking pipeline `pickLocalizedDisplayQ`, never for the SSR display layer)

---

## 5. Local Name Correction Policy

When correcting an existing local-language name (i.e., changing `names.<L>` for an existing entry):

### Allowed only if ALL of these are true:

1. `L` is in the supported UI lang set (§1).
2. The current value is either `fillchain` (== `names.en`) or otherwise non-localized.
3. The proposed correction is sourced from a **stable, citable** source (see priority list below).
4. NO slug change.
5. NO canonical URL change.
6. NO city added or deleted.
7. NO runtime translation involved at any stage.
8. The new value passes the per-lang script guard (§8).

### Source priority (in order)

1. **GeoNames `alternatenames`** field — pre-downloaded, deterministic, machine-readable.
2. **Wikipedia in the local language** — canonical article title (e.g., `id.wikipedia.org/wiki/Kota_Malang`).
3. **Wikidata** — official labels for the place's Q-item.
4. **Manual verified transliteration** — last resort, MUST be cited in the phase closure report with the transliteration scheme used.

---

## 6. New Place Addition Policy

When adding a new curated entry:

### Required fields

| Field | Required | Note |
|---|---|---|
| `slug` | ✅ | Stable, lowercase, hyphen-separated; matches URL slug |
| `countryCode` | ✅ | Lowercase ISO-3166 alpha-2 |
| `lat` | ✅ | -90 ≤ lat ≤ 90 |
| `lng` | ✅ | -180 ≤ lng ≤ 180 |
| `timezone` | ✅ | IANA tz database identifier |
| `names.ar` | ✅ | Universal baseline |
| `names.en` | ✅ | Universal baseline |
| `names.<localLang>` | ✅ if country in §2 table | Per the country→required-langs map |
| `geonameId` (or equivalent in `sourceId`) | ✅ if from GeoNames | Stable external ID |
| `featureCode` | ✅ if from GeoNames | PPL/PPLA/PPLA2/etc. |
| `priority` | ✅ | Search ranking priority |
| `source` | ✅ | Provenance — `curated` / `geonames` / `manual` |
| `verified` | ✅ if applicable | Boolean flag for explicitly-reviewed entries |
| `aliases` | optional | Only if documented and useful (see §7) |
| `admin` | recommended | `countryAr`/`countryEn`/`regionAr`/`regionEn` for richer SEO |

### Forbidden when adding

* ❌ Adding a place WITHOUT `names.ar` AND `names.en`.
* ❌ Adding a place WITHOUT `timezone`.
* ❌ Adding neighbourhoods / sub-localities as cities unless they are notable, documented, and the user explicitly approves.
* ❌ Adding a duplicate that is geographically close (<5 km) to an existing curated entry without explicit collision-override approval.
* ❌ Changing a slug after the entry is live without a separate REDIRECT plan phase.
* ❌ Adding `aliases` derived from external providers (Nominatim/LocationIQ) without review.

---

## 7. Alias Policy

`aliases.<lang>[]` entries are reserved for **searchability**, not display. Allowed alias types:

* ✅ Official rename (e.g., `chennai` ↔ `madras` historical)
* ✅ Well-known spelling variant (e.g., `malacca` ↔ `melaka`)
* ✅ Famous shortened/colloquial form (e.g., `پنڈی` for Rawalpindi)
* ✅ Old/historical city name (e.g., `bombay` ↔ `mumbai`)

### Forbidden aliases

* ❌ IATA airport codes that pollute search ranking (e.g., `MUM`, `SRI`, `IND` — case-by-case review)
* ❌ Aliases shorter than 3 characters unless documented as a known shortform
* ❌ Aliases harvested from external providers without manual review
* ❌ Aliases in a language not in the supported UI set (unless preserved as legacy)

When in doubt, **DROP** the alias rather than letting it pollute search candidates.

---

## 8. Script Guard Policy

Every `names.<L>` value must pass the per-lang script validator (`server/place-l10n/index.js → _isAcceptableScriptForLang`):

| Lang | Required script | Rejected |
|---|---|---|
| `ar` | Arabic block U+0600–U+06FF | Bengali, Latin, any other non-Latin non-Arabic |
| `ur` | Arabic block (Urdu = Arabic script + 14 extras) | Bengali, **Latin**, other non-Latin non-Arabic |
| `bn` | Bengali block U+0980–U+09FF | Arabic, **Latin**, other non-Latin non-Arabic |
| `en` | Latin A–Z + diacritics | Arabic, Bengali, CJK, Hangul, Cyrillic, Greek, Hebrew, Devanagari, etc. |
| `fr`, `de`, `tr`, `id`, `es`, `ms` | Latin + lang-specific diacritics (umlauts, accents, dotted-I, cedilla, ñ, etc.) | Arabic, Bengali, other non-Latin |

### Specific rejections

* ❌ Latin-only in `names.ur` or `names.bn` (e.g., `names.ur = "Gwangju"` — pollution from legacy fillchain)
* ❌ Devanagari inside `names.bn` or `names.ur`
* ❌ Arabic inside `names.bn`
* ❌ Mixed-script suspicious values (e.g., `names.de = "ميونخ"`)
* ❌ Any value that equals `names.en` for the same entry on a lang `L != en` where the local-form is documented to differ — these are fillchain copies and should be replaced with the real local form (or deleted; the runtime helper will then en-fallback)

The script guard is enforced at TWO layers:

1. **Server-side runtime** — `pickLocalizedDisplayQ` Tier 1/3/4 reject polluted values; `getLocalizedPlaceName` Tier 1 rejects them. (CITY-NAME-SEO-FALLBACK-POLICY-1)
2. **Apply-script post-mutation assertion** — every value written to curated must pass `isCleanScript(value, lang)`. Apply aborts if any fail.

---

## 9. Audit Before Apply

Standard waves (>10 entries OR new countries OR new features) MUST go through THREE stages:

1. **Audit** — read-only scan; produces `reports/<phase>-audit.json` + summary `.md`.
2. **Apply** — gated by user approval; produces `reports/<phase>-apply-report.json`.
3. **Closure** — `reports/<phase>-closure.md` + commit + user closure approval marker.

Fast waves (≤20 entries, well-defined scope) MAY combine audit + apply, but MUST still include:

1. Apply script with backup BEFORE mutation.
2. Post-mutation assertions (§10).
3. Closure report.
4. Carry-forward test regression.
5. User approval before next phase.

---

## 10. Post-Mutation Invariants

After every apply that touches curated data, the apply script MUST verify (and abort with rollback option if any fail):

| # | Invariant | What it checks |
|---|---|---|
| 1 | No duplicate slugs | Every entry's `slug` is unique across the file |
| 2 | No duplicate `sourceId` / `geonameId` | Stable external IDs are unique |
| 3 | No city added/deleted unintentionally | Pre-apply count == post-apply count UNLESS phase scope is "add" or "delete" |
| 4 | No slug changes | `slug` field of every entry matches pre-apply backup |
| 5 | No canonical URL changes | Slug + countryCode pairs unchanged |
| 6 | `server.js`, `js/app.js`, `index.html`, `server/place-l10n/index.js` untouched unless phase scope is "code" | `git diff --stat` ≤ 0 for those files |
| 7 | No runtime translation invoked at apply time | Sources are static text only |
| 8 | No fillchain — apply script REFUSES to write `names[L] === names.en` | Hard precondition |
| 9 | No unsupported lang ADDED | Compare lang keys vs pre-apply backup |
| 10 | All required fields present per §6 | `names.ar` + `names.en` + per-country required langs |
| 11 | All test suites pass after apply | Carry-forward regression + phase-specific test |
| 12 | `names.ar` + `names.en` for ALL entries unmodified unless phase scope is "ar fix" or "en fix" | Post-mutation assertion |

---

## 11. SEO Compatibility Policy

For Google + general SEO health:

* ✅ A city MUST appear with EXACTLY ONE display name across all positions on a single canonical city page.
  * Positions covered: `<title>`, `<meta description>`, Open Graph (`og:title`, `og:description`, `og:image:alt`), Twitter Card, `<h1>`, breadcrumbs, JSON-LD City `name`, FAQ Q/A bodies, hero text, prayer/moon/qibla card labels, internal-link anchor text, hreflang alternates' visible labels.
  * The single source of truth is `server/place-l10n/index.js → getLocalizedPlaceName(entry, pageLang)`, routed via `_pickCuratedName` for SSR.
* ✅ Canonical city pages render names from `curated_places.json` only — external providers (Nominatim, LocationIQ) NEVER override the display label on a canonical page.
* ✅ If `names[lang]` is missing for the page's lang, `names.en` is used uniformly across all positions on the page (untranslated proper-noun fallback).
* ❌ NO machine translation of place names at any layer.
* ❌ NO mixing two different names for the same city on the same page (e.g., title says "Gwangju" but body shows "گوانگ جو").

This rule is enforced at runtime by the unconditional `__PRAYER_CITY__.slug === urlSlug` Tier-0 trust in `getDisplayCity()` and `getCurrentCityLabel()`, plus the universal short-circuit in `_syncCityNameInDom()` (CITY-NAME-FALLBACK-CONSISTENCY-1).

---

## 12. Closure and Memory Policy

Every phase MUST end with:

1. **Closure report** at `reports/<phase>-closure.md` containing:
   * `Status: CLOSED — user-approved YYYY-MM-DD` (only after explicit user approval — never auto-close)
   * Numbered acceptance criteria with ✅/❌ per criterion
   * Test results aggregate
   * Files changed / files explicitly NOT changed (byte-diff verification)
   * Rollback command (`git revert <hash>`)
2. **MEMORY.md entry** — concise (one bullet, under ~200 chars in the index header; full detail in topic files) noting status + key constraints.
3. **No new phase started** until the user explicitly directs it. Auto-mode does not relax this rule.
4. **Documentation update** if this maintenance policy itself evolves — bump a version footer and note the change.

### Trigger phrases that open new phases (for routing)

* "نشر / deploy / hosting / Supabase" → deployment
* "ASIA-1*" / "EUROPE-1*" / "AMERICAS-1*" / specific country codes → geodata waves
* "PLACE-NAMES-*" → L10N enrichment waves
* "SEARCH-RANKING-*" → ranking improvements
* "CITY-NAME-* / SEO-*" → render/fallback fixes

When a trigger phrase is spoken, the relevant policy section (this doc) is consulted FIRST before any apply.

---

## Adoption history

| Date | Note |
|---|---|
| 2026-05-21 | Initial adoption alongside SUPPORTED-LOCAL-PLACE-NAMES-POLICY-1 closure |

*— End of policy —*
