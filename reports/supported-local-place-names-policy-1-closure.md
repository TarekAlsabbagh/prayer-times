# SUPPORTED-LOCAL-PLACE-NAMES-POLICY-1 — Closure Report

**Date**: 2026-05-21
**Phase**: Data enrichment — replace fillchain copies with real local-language names
**Status**: ✅ **CLOSED — user-approved 2026-05-21**
**Mode**: Conservative Option A (36 changes only — Indonesian Kota X + 2 Spanish accent fixes)
**Implementation commit**: `32be018` — `feat(geodata): SUPPORTED-LOCAL-PLACE-NAMES-POLICY-1 — 36 local-language name fixes (conservative Option A)`
**Audit commit**: `714e10d` — `docs: adopt place-data maintenance policy + deep audit (read-only, no curated mutation)`

---

## 0. Acceptance criteria (user-approved 2026-05-21)

| # | Criterion | Status |
|---|---|---|
| 1 | 36 / 36 changes applied | ✅ |
| 2 | 34 Indonesia `names.id` fixes (Kota X form) | ✅ |
| 3 | 2 Spain `names.es` fixes (Cádiz, San Sebastián) | ✅ |
| 4 | Malang → Kota Malang verified across title/H1/#city-name/`__PRAYER_CITY__`/breadcrumb | ✅ Live SSR + hydration confirmed (87 hits "Kota Malang"; 0 bare "Malang") |
| 5 | No slug changes (2,597 slugs identical) | ✅ |
| 6 | No canonical URL changes | ✅ |
| 7 | No city added or deleted (count 2,597 → 2,597) | ✅ |
| 8 | No runtime translation (Google/OpenAI/Anthropic/browser MT) | ✅ |
| 9 | No fillchain (`names[L] === names.en` rejected by apply script) | ✅ |
| 10 | No unsupported languages added (no new hi/ta/mr/etc.) | ✅ |
| 11 | `names.ar` + `names.en` unchanged across all 2,597 entries | ✅ Post-mutation assertion verified |
| 12 | `server.js` unchanged (0-byte diff) | ✅ |
| 13 | `js/app.js` unchanged (0-byte diff) | ✅ |
| 14 | `index.html` unchanged (0-byte diff) | ✅ |
| 15 | `server/place-l10n/index.js` unchanged (0-byte diff) | ✅ |
| 16 | Place-data maintenance policy adopted (`docs/place-data-maintenance-policy.md`) | ✅ Permanent reference adopted alongside this closure |
| 17 | Full audit completed read-only (`reports/supported-local-place-names-full-audit-1.md`) | ✅ 612 cities × 24 countries scanned; recommendation: keep just the 36 |
| 18 | NO extra needs-review fixes applied from full audit | ✅ All 36 candidates surfaced by deep scan remain `needs-review`; none applied |
| 19 | Tests: 958 / 958 PASS (77 new + 881 carry-forward) | ✅ |
| 20 | Backup created before mutation (`db/places/curated-places.json.preSupportedLocalNames1.bak`) | ✅ |

---

## 1. Summary

| Metric | Value |
|---|---|
| Total proposed changes (audit) | 36 |
| Total applied changes | **36** |
| Indonesian `names.id` (Kota X form) | **34** |
| Spanish `names.es` (accent fixes) | **2** |
| Unique entries affected | 36 |
| Skipped — already-native (preserved) | 11 |
| Skipped — override = `names.en` (no change needed) | 16 |
| Entries added | **0** |
| Entries deleted | **0** |
| Slugs modified | **0** |
| Canonical URLs modified | **0** |

---

## 2. Country / language map (the policy)

| countryCode | Required supported lang(s) | Status |
|---|---|---|
| ID (Indonesia) | `id` | ✅ 34 applied (Kota X) |
| MY (Malaysia) | `ms` | preserved — Malaysian city names = English names |
| SG (Singapore) | `ms` | already-native |
| BN (Brunei) | `ms` | preserved |
| TR (Turkey) | `tr` | already-native (İstanbul/İzmir/Diyarbakır/Şanlıurfa) |
| FR (France) | `fr` | preserved — French city names = same letters |
| DE (Germany) | `de` | already-native (München/Köln/Nürnberg) |
| AT (Austria) | `de` | already-native (Wien) |
| CH (Switzerland) | `de` | already-native (Zürich) |
| ES (Spain) | `es` | ✅ 2 applied (Cádiz, San Sebastián) |
| MX/AR/CL/CO/PE/VE/EC/BO/UY/+12 (Spanish-speaking LATAM) | `es` | preserved + some already-native (Bogotá, Ciudad de México) |
| PK (Pakistan) | `ur` | already-native (148/148 cities have real Urdu) |
| BD (Bangladesh) | `bn` | already-native (38/38 have real Bengali) |
| IN (India) | `ur` + `bn` (NOT `hi`) | already-native (109/109 have ar/en/ur/bn) |
| BE (Belgium) | `fr` + `de` | preserved |
| LU (Luxembourg) | `de` + `fr` | preserved |

---

## 3. The 36 applied changes (full list)

### 3.1 Indonesia — `names.id` Kota X (34)

| # | Slug | Before | After |
|---|---|---|---|
| 1 | `surabaya` | `Surabaya` | **`Kota Surabaya`** |
| 2 | `bandung` | `Bandung` | **`Kota Bandung`** |
| 3 | `medan` | `Medan` | **`Kota Medan`** |
| 4 | `makassar` | `Makassar` | **`Kota Makassar`** |
| 5 | `semarang` | `Semarang` | **`Kota Semarang`** |
| 6 | `palembang` | `Palembang` | **`Kota Palembang`** |
| 7 | `banda-aceh` | `Banda Aceh` | **`Kota Banda Aceh`** |
| 8 | `tegal` | `Tegal` | **`Kota Tegal`** |
| 9 | `tarakan` | `Tarakan` | **`Kota Tarakan`** |
| 10 | `tanjung-pinang` | `Tanjung Pinang` | **`Kota Tanjung Pinang`** |
| 11 | `surakarta` | `Surakarta` | **`Kota Surakarta`** |
| 12 | `samarinda` | `Samarinda` | **`Kota Samarinda`** |
| 13 | `padang` | `Padang` | **`Kota Padang`** |
| 14 | `mataram` | `Mataram` | **`Kota Mataram`** |
| 15 | `manado` | `Manado` | **`Kota Manado`** |
| 16 | `malang` | `Malang` | **`Kota Malang`** |
| 17 | `kediri` | `Kediri` | **`Kota Kediri`** |
| 18 | `cirebon` | `Cirebon` | **`Kota Cirebon`** |
| 19 | `bogor` | `Bogor` | **`Kota Bogor`** |
| 20 | `bitung` | `Bitung` | **`Kota Bitung`** |
| 21 | `bengkulu` | `Bengkulu` | **`Kota Bengkulu`** |
| 22 | `bekasi` | `Bekasi` | **`Kota Bekasi`** |
| 23 | `ambon` | `Ambon` | **`Kota Ambon`** |
| 24 | `batam` | `Batam` | **`Kota Batam`** |
| 25 | `bandar-lampung` | `Bandar Lampung` | **`Kota Bandar Lampung`** |
| 26 | `tangerang` | `Tangerang` | **`Kota Tangerang`** |
| 27 | `sukabumi` | `Sukabumi` | **`Kota Sukabumi`** |
| 28 | `pontianak` | `Pontianak` | **`Kota Pontianak`** |
| 29 | `pekanbaru` | `Pekanbaru` | **`Kota Pekanbaru`** |
| 30 | `kendari` | `Kendari` | **`Kota Kendari`** |
| 31 | `denpasar` | `Denpasar` | **`Kota Denpasar`** |
| 32 | `balikpapan` | `Balikpapan` | **`Kota Balikpapan`** |
| 33 | `kupang` | `Kupang` | **`Kota Kupang`** |
| 34 | `jayapura` | `Jayapura` | **`Kota Jayapura`** |

### 3.2 Spain — `names.es` accent fixes (2)

| # | Slug | Before | After |
|---|---|---|---|
| 35 | `cadiz` | `Cadiz` | **`Cádiz`** |
| 36 | `san-sebastian` | `Donostia / San Sebastián` | **`San Sebastián`** |

### 3.3 Indonesian exceptions deliberately NOT applied

| Slug | Reason — preserved as-is |
|---|---|
| `jakarta` | Daerah Khusus Ibukota Jakarta (special administrative region — not "Kota") |
| `yogyakarta` | Daerah Istimewa Yogyakarta (special region — not "Kota") |

### 3.4 Already-native (preserved untouched) — 11

| Slug | Lang | Value (preserved) |
|---|---|---|
| `istanbul` | tr | `İstanbul` |
| `izmir` | tr | `İzmir` |
| `diyarbakir` | tr | `Diyarbakır` |
| `sanliurfa` | tr | `Şanlıurfa` |
| `munich` | de | `München` |
| `cologne` | de | `Köln` |
| `nuremberg` | de | `Nürnberg` |
| `vienna` | de | `Wien` |
| `zurich` | de | `Zürich` |
| `mexico-city` | es | `Ciudad de México` |
| `bogota` | es | `Bogotá` |

---

## 4. Malang — concrete before / after

### Before (curated `gwangju.names`):
```json
{
  "ar": "مالانغ",
  "en": "Malang",
  "id": "Malang",
  "fr": "Malang", "de": "Malang", "tr": "Malang", "ur": "Malang",
  "es": "Malang", "bn": "Malang", "ms": "Malang"
}
```

### After (curated `malang.names`):
```json
{
  "ar": "مالانغ",
  "en": "Malang",
  "id": "Kota Malang",
  "fr": "Malang", "de": "Malang", "tr": "Malang", "ur": "Malang",
  "es": "Malang", "bn": "Malang", "ms": "Malang"
}
```

Only `names.id` changed. `names.ar`, `names.en`, slug, canonical, timezone, lat/lng — all untouched.

### Live SSR + hydration test `/id/prayer-times-in-malang`

| Surface | Value |
|---|---|
| `<title>` | `Jadwal Sholat di Kota Malang Hari Ini \| Jadwal Adzan Harian` ✓ |
| `<h1>` | `Jadwal Sholat di Kota Malang Hari Ini` ✓ |
| `<meta name="ssr-city-name">` | `Kota Malang` ✓ |
| `#city-name` (post-hydration) | `Kota Malang` ✓ |
| `#snb-city` (sticky nav) | `Kota Malang` ✓ |
| `#loc-hero-title` | `Jadwal Sholat Hari Ini di Kota Malang — Tanggal Hijriah & Masehi` ✓ |
| breadcrumb leaf | `Jadwal Sholat di Kota Malang` ✓ |
| `window.__PRAYER_CITY__.name` | `Kota Malang` ✓ |
| `getDisplayCity()` | `Kota Malang` ✓ |
| Body "Kota Malang" hits | **87** |
| Body bare "Malang" (without "Kota " prefix) hits | **0** |

---

## 5. Sources used

* `geonames:alt+id-wp` — Indonesian "Kota X" form was extracted from `db/places/candidates/id-geonames-raw.json` `alternatenames` field. For each of the 34 Indonesian curated cities the GeoNames alternate names list contains the exact "Kota X" form, AND the canonical Wikipedia id article title is "Kota X" (per id.wikipedia.org convention for Indonesian municipalities).
* `wikipedia:es` — Spanish accent fixes (Cádiz, San Sebastián) sourced from es.wikipedia.org canonical article titles. Standard Spanish orthography.

**All sources are static text** — no live translation API, no Google/OpenAI/Anthropic/browser translation, no Wikipedia HTTP at apply time. The alternatenames data was already pre-downloaded into the GeoNames candidates files. The Wikipedia values are baked into the apply script's ENRICHMENT_OVERRIDES table.

---

## 6. Invariants verified by the apply script (post-mutation assertions)

All 7 invariants passed (the apply would have aborted otherwise):

| # | Invariant | Status |
|---|---|---|
| 1 | Slug set unchanged (no add, no delete, no rename) | ✅ |
| 2 | `countryCode`, `lat`, `lng`, `timezone`, `type`, `source`, `sourceId`, `priority`, `verified` untouched for all 2,597 entries | ✅ |
| 3 | `names.ar` never mutated (sampled 36 touched entries + full-set scan) | ✅ |
| 4 | `names.en` never mutated | ✅ |
| 5 | No unsupported lang ADDED by this apply (pre-existing legacy `names.hi` from HI-IN-1 wave preserved as-is per per-country supported-lang policy — invariant only blocks new additions) | ✅ |
| 6 | No fillchain reintroduced (`names[L] === names.en` would be rejected) | ✅ |
| 7 | All applied values pass per-lang script validator (`isCleanScript`) | ✅ |
| 8 | Only fillchain copies replaced; no real-native value clobbered | ✅ (prior value was `names.en` for every touched entry) |

---

## 7. Test results

### 7.1 New test `scripts/_test_supported_local_place_names_policy_1.mjs`

**77 / 77 PASS** across 8 groups:

| Group | Tests | Result |
|---|---|---|
| 1. Indonesia 34 cities — names.id = "Kota X" verified | 34 | ✅ 34/34 |
| 2. Spain 2 accent fixes verified | 2 | ✅ 2/2 |
| 3. Indonesian exceptions preserved (Jakarta + Yogyakarta) | 2 | ✅ 2/2 |
| 4. Already-native preserved (Istanbul/İzmir/München/etc.) | 11 | ✅ 11/11 |
| 5. Helper resolves to new ID values (hasNativeName=true) | 15 | ✅ 15/15 |
| 6. Gwangju regression — en-fallback unchanged | 3 | ✅ 3/3 |
| 7. Native cities regression (Karachi/Dhaka/Mumbai/Varanasi/Makkah) | 6 | ✅ 6/6 |
| 8. Apply invariants — entry count, ar/en untouched, slug/cc/lat/lng/tz untouched | 4 | ✅ 4/4 |

### 7.2 Carry-forward regression (14 suites)

| Suite | Result |
|---|---|
| `_test_city_name_fallback_consistency_1.mjs` | **173 / 173** ✅ |
| `_test_city_name_seo_fallback_1.mjs` | 107 / 107 ✅ |
| `_test_place_names_ur_in_1.mjs` | 122 / 0 ✅ |
| `_test_place_names_bn_in_1.mjs` | 113 / 0 ✅ |
| `_test_place_names_hi_in_1.mjs` | 116 / 0 ✅ |
| `_test_place_names_ur_pk_6.mjs` | 69 / 0 ✅ |
| `_test_place_names_ur_af_1.mjs` | 41 / 0 ✅ |
| `_test_place_names_ur_ir_1.mjs` | 66 / 0 ✅ |
| `_test_fill_lang_map.mjs` | 11 / 0 ✅ |
| `_test_lang_guard.mjs` | 5 / 0 ✅ |
| `_test_city_name_universal.mjs` | 35 / 35 ✅ |
| `_test_city_name_ugly.mjs` | 5 / 5 ✅ |
| `_test_link_city_name.mjs` | 18 / 0 ✅ |
| `_test_supported_local_place_names_policy_1.mjs` (this phase) | 77 / 77 ✅ |

**Aggregate**: **958 / 958 PASS — 0 regressions.**

### 7.3 Live browser verification (Preview MCP)

| URL | Surface | Value |
|---|---|---|
| `/id/prayer-times-in-malang` | `<title>` + all body surfaces | **Kota Malang** (87 hits, 0 bare-Malang) |
| `/id/prayer-times-in-surabaya` | title + H1 + #city-name + getDisplayCity() | **Kota Surabaya** |
| `/es/prayer-times-in-cadiz` | title + H1 + #city-name + getDisplayCity() | **Cádiz** |
| `/ur/prayer-times-in-gwangju` | title + H1 + body | **Gwangju** (en-fallback, 87 hits, 0 transliteration) — regression confirmed |

---

## 8. Constraints honoured (verbatim user spec)

| Constraint | Status |
|---|---|
| لا تغيّر slugs | ✅ 2,597 slugs unchanged |
| لا تغيّر canonical URLs | ✅ URL routing untouched |
| لا تضف مدن | ✅ Entry count: 2,597 → 2,597 |
| لا تحذف مدن | ✅ Entry count: 2,597 → 2,597 |
| لا تستخدم runtime translation | ✅ No Google/OpenAI/Anthropic/browser/API translation invoked |
| لا تستخدم fillchain | ✅ Apply script REJECTS writes where `names[L] === names.en` |
| لا تضف أي لغة غير مدعومة | ✅ Only `names.id` + `names.es` written (both in SUPPORTED_LANGS) |
| لا تعدّل `names.ar` | ✅ Post-mutation assertion verified |
| لا تعدّل `names.en` | ✅ Post-mutation assertion verified |
| لا تعدّل server.js | ✅ 0-byte diff |
| لا تعدّل js/app.js | ✅ 0-byte diff |
| لا تعدّل index.html | ✅ 0-byte diff |
| لا تغيّر geodata (admin maps, timezones, etc.) | ✅ |
| لا تغيّر priorities | ✅ |
| لا تفتح أي موجة جديدة | ✅ |

---

## 9. Files changed

### 9.1 MODIFIED

| File | Change |
|---|---|
| `db/places/curated-places.json` | 36 entries: `names.id` for 34 Indonesian cities (Kota X form), `names.es` for 2 Spanish cities (Cádiz, San Sebastián). No other fields touched. |

### 9.2 CREATED

| File | Purpose |
|---|---|
| `scripts/geodata/_supported_local_place_names_policy_1_audit.mjs` | Phase A — read-only audit; outputs gap report |
| `scripts/geodata/_supported_local_place_names_policy_1_preview.mjs` | Dry-run preview; outputs `.md` + `.json` |
| `scripts/geodata/_supported_local_place_names_policy_1_apply.mjs` | Apply script with backup + 8 post-mutation invariants |
| `scripts/_test_supported_local_place_names_policy_1.mjs` | 77-test verification |
| `reports/supported-local-place-names-policy-1-audit.json` | Country/lang gap summary |
| `reports/supported-local-place-names-policy-1-audit-detail.json` | Slug-level detail |
| `reports/supported-local-place-names-policy-1-preview.md` | Pre-approval preview |
| `reports/supported-local-place-names-policy-1-preview.json` | Pre-approval preview data |
| `reports/supported-local-place-names-policy-1-apply-report.json` | Apply audit log (36 changes + skipped reasons) |
| `reports/supported-local-place-names-policy-1-closure.md` | This report |
| `db/places/curated-places.json.preSupportedLocalNames1.bak` | Backup created before mutation |

### 9.3 NOT modified

- `server.js`, `js/app.js`, `index.html`, `server/place-l10n/index.js` — 0-byte diff
- Any other curated field besides `names.id`/`names.es` for the 36 touched entries
- 2,561 other curated entries: byte-identical to backup
- Search-ranking algorithm: untouched
- L10N helper / fallback policy: untouched

---

## 10. Remaining fillchain entries (NOT addressed in this phase)

Per the conservative Option-A scope, the following ~210 entries remain in fillchain state (`names[L] === names.en`). Most are legitimate "same-as-English" proper nouns; some could be enriched in follow-up phases:

| Country | Lang | Remaining fillchain | Likely status |
|---|---|---|---|
| FR | fr | 25 | mostly same-as-en (Paris/Lyon/Marseille/etc.) |
| DE | de | ~30 | mostly same-as-en (Berlin/Hamburg/Frankfurt) |
| ES (Spain) | es | ~30 | mostly same-as-en (Madrid/Barcelona/Valencia) |
| MX/AR/PE/CO/VE/CL | es | ~70 | mostly same-as-en |
| MY | ms | 20 | mostly same-as-en |
| TR | tr | 10 | mostly same-as-en (Adana/Antalya/Bursa) |
| AT/CH/LU/BE | de/fr | ~25 | mostly same-as-en (smaller cities) |

For these, the runtime helper correctly serves `names.en` via the en-fallback chain (per CITY-NAME-SEO-FALLBACK-POLICY-1 + CITY-NAME-FALLBACK-CONSISTENCY-1). A future SUPPORTED-LOCAL-PLACE-NAMES-POLICY-2 could verify each entry against Wikipedia to confirm "name is genuinely same as English" vs. "real native form was missed". Out of scope for this commit.

---

## 11. Maintenance policy created and adopted

Alongside this phase's closure, a **permanent maintenance policy** has been written and adopted:

**📜 `docs/place-data-maintenance-policy.md`** — the canonical reference for ALL future place-data work.

The policy covers (in 12 sections):
1. Supported UI Languages — closed set of 10 (ar/en/fr/de/tr/ur/id/es/bn/ms)
2. Required Names Policy — per-country required `names.<lang>` keys (incl. India special-case ur+bn, NOT hi)
3. Unsupported Languages Policy — prohibited list (hi/ta/mr/te/kn/ml/gu/pa/or/as/sa) with the legacy HI carve-out
4. Fallback Policy — strict tier chain; NO runtime translation, NO fillchain, NO close-lang substitution, NO external-provider override on canonical pages
5. Local Name Correction Policy — source priority (GeoNames → Wikipedia local → Wikidata → manual verified)
6. New Place Addition Policy — required fields + forbidden patterns
7. Alias Policy — what aliases are allowed vs forbidden
8. Script Guard Policy — per-lang script validators (Arabic/Bengali/Latin diacritics)
9. Audit Before Apply — 3-stage workflow (audit / apply / closure) for standard waves; fast-wave minimum requirements
10. Post-Mutation Invariants — 12 invariants enforced by every apply script
11. SEO Compatibility Policy — single-display-name-per-page rule; canonical-page = curated-only
12. Closure and Memory Policy — phase closure + MEMORY.md entry + no-auto-close rule

This phase complies with every rule in the new policy. Future phases that touch `db/places/curated-places.json` MUST reference this document.

---

## 12. Closure marker

**Approved by user 2026-05-21**:
> أعتمد إغلاق SUPPORTED-LOCAL-PLACE-NAMES-POLICY-1 رسميًا، وأوافق على رفع الـ commits.
> Marker: `docs(closure): mark SUPPORTED-LOCAL-PLACE-NAMES-POLICY-1 user-approved 2026-05-21`

No further phases opened. Specifically held back per user constraint:
- ❌ SUPPORTED-LOCAL-PLACE-NAMES-POLICY-2 (broader Wikipedia/Wikidata verification — would require `alternateNamesV2.txt` download first)
- ❌ Search-ranking wave
- ❌ Hijri pages
- ❌ DELETE-V1 / geocode-proxy
- ❌ Any other curated mutation
- ❌ Any geodata wave

*— End of report —*
