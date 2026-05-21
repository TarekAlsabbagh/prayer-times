# ASIA-1H-MY-FAST-SUPPORTED-L10N — Closure Report

**Date:** 2026-05-21
**Wave:** Combined geodata + supported-L10N FAST wave (Malaysia)
**Pattern:** Dedupe-first, single-commit, no code changes

---

## Summary

Added **32 Malaysian cities** to `db/places/curated-places.json` with EXACTLY
the three supported UI languages for Malaysia:

- `names.ar` — manual:translit (Malay → Arabic phonetic)
- `names.en` — geonames:name
- `names.ms` — same-as-en (Malay proper-noun convention)

No `names.ur`, `names.bn`, `names.hi`, `names.ta`, `names.mr`, etc. —
zero forbidden-lang leakage (verified across 96 values + 32 entries).

**Counts:**
| Metric            | Before | After |
|-------------------|-------:|------:|
| Total curated     |   2728 |  2760 |
| MY entries        |     21 |    53 |

---

## 32 New Entries (population-ordered)

| # | Slug                | Pop     | Admin1 (FIPS) | Region          | names.ar              |
|---|---------------------|--------:|---------------|-----------------|-----------------------|
| 1 | subang-jaya         | 708,296 | 12            | Selangor        | سوبانغ جايا            |
| 2 | iskandar-puteri     | 575,977 | 01            | Johor           | إسكندر بوتري           |
| 3 | sungai-petani       | 544,851 | 02            | Kedah           | سونغاي بيتاني          |
| 4 | kota-kuala-muda     | 544,984 | 02            | Kedah           | كوتا كوالا مودا         |
| 5 | puchong             | 375,181 | 12            | Selangor        | بوتشونغ                |
| 6 | kluang              | 323,762 | 01            | Johor           | كلوانغ                 |
| 7 | muar                | 314,776 | 01            | Johor           | موار                  |
| 8 | klang               | 240,016 | 12            | Selangor        | كلانغ                  |
| 9 | kajang              | 236,240 | 12            | Selangor        | كاجانغ                 |
| 10 | teluk-intan        | 232,800 | 07            | Perak           | تيلوك إنتان            |
| 11 | pasir-mas          | 230,424 | 03            | Kelantan        | باسير ماس               |
| 12 | sungai-buloh       | 222,858 | 12            | Selangor        | سونغاي بولوه           |
| 13 | taiping            | 217,647 | 07            | Perak           | تايبينغ                 |
| 14 | sepang             | 212,050 | 12            | Selangor        | سيبانغ                  |
| 15 | rawang             | 199,095 | 12            | Selangor        | راوانغ                  |
| 16 | sibu               | 198,239 | 11            | Sarawak (FIPS)  | سيبو                    |
| 17 | kuala-kubu-baharu  | 194,387 | 12            | Selangor        | كوالا كوبو باهارو       |
| 18 | kulim              | 170,889 | 02            | Kedah           | كوليم                   |
| 19 | batu-pahat         | 156,236 | 01            | Johor           | باتو باهات              |
| 20 | sitiawan           | 156,234 | 07            | Perak           | سيتياوان                |
| 21 | bintulu            | 151,617 | 11            | Sarawak (FIPS)  | بينتولو                  |
| 22 | port-dickson       | 119,300 | 05            | N. Sembilan     | بورت ديكسون              |
| 23 | maran              | 111,056 | 06            | Pahang          | ماران                   |
| 24 | butterworth        | 107,591 | 09            | Penang          | بترورث                  |
| 25 | lahad-datu         | 105,622 | 16            | Sabah (FIPS)    | لاهاد داتو              |
| 26 | kuala-krai         | 105,007 | 03            | Kelantan        | كوالا كراي              |
| 27 | seri-manjung       | 100,000 | 07            | Perak           | سيري مانجونغ            |
| 28 | cyberjaya          |  79,200 | 12            | Selangor        | سايبرجايا               |
| 29 | semporna           |  62,641 | 16            | Sabah (FIPS)    | سيمبورنا                |
| 30 | temerloh           |  59,916 | 06            | Pahang          | تيميرلوه                |
| 31 | putrajaya          |  50,000 | 17            | Putrajaya FT    | بوتراجايا               |
| 32 | bentong            |  49,213 | 06            | Pahang          | بنتونغ                  |

All entries set: `priority=70`, `source=geonames`, `verified=false`,
`timezone=Asia/Kuala_Lumpur`, `countryCode=my`.

### Excluded from initial 33-city list
- **ampang** (gid 1735168, pop 126,285) — GeoNames returns `admin1=14`
  (Kuala Lumpur Federal Territory) for this entry. Per the user's "no
  districts within larger cities" policy, an entry sitting inside KL FT
  was dropped to avoid the standalone-vs-district ambiguity. Can be
  revisited if classified as Ampang Jaya (Selangor) by future audit.

### Special feature codes
- **putrajaya** uses `feature_code=PPLG` (governmental seat) instead of
  PPL/PPLA/PPLA2 — direct raw lookup required.
- **subang-jaya** uses `feature_code=PPLX` (populated place section) —
  direct raw lookup required.
- **bentong** entry chosen with name `Bentong Town` (gid 1779790,
  pop 49,213) over the smaller variant `Bentung` (gid 1732667,
  pop 40,373) at the same coordinates.

---

## admin1 — GeoNames FIPS Codes (Empirically Verified)

GeoNames uses FIPS codes for Malaysia, not ISO codes. Verified by
inspecting `db/places/candidates/my-geonames-raw.json`:

| Admin1 (FIPS) | Region                                  | Notes              |
|---------------|-----------------------------------------|--------------------|
| 01            | Johor                                   |                    |
| 02            | Kedah                                   |                    |
| 03            | Kelantan                                |                    |
| 05            | Negeri Sembilan                         |                    |
| 06            | Pahang                                  |                    |
| 07            | Perak                                   |                    |
| 09            | Penang                                  |                    |
| 11            | **Sarawak** (FIPS — differs from ISO 13)|                    |
| 12            | Selangor                                |                    |
| 16            | **Sabah** (FIPS — differs from ISO 11)  |                    |
| 17            | Putrajaya Federal Territory             |                    |

---

## names.ms Convention: Same-as-en

All 32 entries use `names.ms === names.en` because:
1. Malaysian city names ARE their canonical Malay forms (Klang, Putrajaya,
   Subang Jaya — all proper nouns shared between EN and MS).
2. No transliteration needed (both langs use Latin script).
3. Aligns with the existing 21 MY curated entries (kuala-lumpur, ipoh,
   george-town, etc. — all have `names.ms === names.en`).

Verified in Group 10 of `_test_asia_1h_my_fast.mjs`: all 32 pass.

---

## Strict Invariants (All Pass)

1. ✅ Per-slug SHA-256 byte-identity for all 2,728 pre-existing entries
   (Group 5: 21 MY + Group 6: 1,072 IN/PK/BD/SA/AF/IR/TR/ID/DE/FR/ES/KR/JP/GB/US)
2. ✅ Total count delta = exactly +32 (2728 → 2760)
3. ✅ MY count delta = exactly +32 (21 → 53)
4. ✅ No duplicate slug across all 2,760 entries
5. ✅ No duplicate sourceId across all 2,760 entries
6. ✅ No duplicate geonameId across all 2,760 entries (Group 11)
7. ✅ All 32 entries have exactly `[ar, en, ms]` lang-keys (Group 2)
8. ✅ All 96 (32×3) values pass per-lang script guards:
    - `ar` = `[؀-ۿ]` only, no Bengali/Latin/Devanagari/Tamil/Urdu-only letters
    - `en` = Latin, no Arabic/Bengali
    - `ms` = Latin, no Arabic/Bengali
9. ✅ Zero forbidden-lang leakage: ur/bn/hi/ta/mr/te/kn/ml/gu/pa/or/as/sa/fr/de/tr/es/id
10. ✅ All 32 entries have required fields: slug, countryCode=my, lat/lng,
    timezone=Asia/Kuala_Lumpur, names.{ar,en,ms}, source=geonames, sourceId

---

## Tests Run

### New ASIA-1H-MY-specific tests
- `scripts/_test_asia_1h_my_fast.mjs`: **105 passed / 0 failed** (11 groups)
- `scripts/_smoke_asia_1h_my_ssr.mjs`: **21 passed / 0 failed** (SSR for top
  10 MY × /ms/ + Arabic/EN baseline + regression: Kota Malang, Jakarta,
  Yogyakarta, Karachi /ur/, Dhaka /bn/, Gwangju /ur/ fallback)
- `scripts/_smoke_asia_1h_my_search.mjs`: **18 passed / 0 failed** (top 15
  EN-name + 3 Arabic-name queries → correct slug in top-5)

### Count-drift tests updated (2728 → 2760)
- `_test_asia_1g_id_fast.mjs`: 73/73 pass
- `_test_asia_1d_in_d_fast.mjs`: 105/105 pass
- `_test_asia_1d_in_e_fast.mjs`: 106/106 pass
- `_test_asia_1d_in_f_fast.mjs`: 57/57 pass
- `_test_place_names_hi_in_1.mjs`: 116/116 pass
- `_test_place_names_bn_in_1.mjs`: 113/113 pass
- `_test_place_names_ur_in_1.mjs`: 122/122 pass
- `_test_city_name_fallback_consistency_1.mjs`: 173/173 pass

### Carry-forward (unchanged but verified)
- `_test_supported_local_place_names_policy_1.mjs`: 78/78 pass
- `_test_search_ar.mjs`: 22/22 pass

**Grand total**: 1,109/1,109 offline + 39/39 SSR/search-endpoint = **1,148 zero
failures**.

---

## Files Untouched (Verified — `git diff HEAD --stat` Empty)

- `server.js`
- `js/app.js`
- `index.html`
- `docs/place-data-maintenance-policy.md`
- `server/place-l10n/index.js`

Zero code changes. Zero policy changes. Zero docs changes.

---

## No Runtime Translation. No Fillchain. No MT.

- **No Google Translate / OpenAI / Anthropic / browser translation** —
  all 32 `names.ar` values written manually via Malay→Arabic phonetic
  transliteration following the same conventions used in prior MY
  entries (kuala-lumpur=`كوالا لمبور`, ipoh=`إيبوه`, etc.).
- **No fillchain** — only `{ar, en, ms}` keys present per entry, never
  the wider 10-lang map.

---

## Files Created in This Wave

### Apply / test scripts (not affecting code path)
- `scripts/geodata/_asia_1h_my_fast_supported_l10n_apply.mjs` (apply)
- `scripts/_test_asia_1h_my_fast.mjs` (verification)
- `scripts/_smoke_asia_1h_my_ssr.mjs` (SSR smoke, requires server)
- `scripts/_smoke_asia_1h_my_search.mjs` (search endpoint smoke)

### Data + report artifacts
- `db/places/curated-places.json` (32 entries appended)
- `db/places/curated-places.json.preAsia1hMyFast.bak` (pre-mutation backup)
- `reports/asia-1h-my-fast-supported-l10n-apply-report.json` (machine-readable delta)
- `reports/asia-1h-my-fast-supported-l10n-closure.md` (this report)

### Count-drift refresh in existing tests
- `scripts/_test_asia_1g_id_fast.mjs`: 2728 → 2760
- `scripts/_test_asia_1d_in_d_fast.mjs`: 2728 → 2760
- `scripts/_test_asia_1d_in_e_fast.mjs`: 2728 → 2760
- `scripts/_test_asia_1d_in_f_fast.mjs`: 2728 → 2760
- `scripts/_test_place_names_hi_in_1.mjs`: 2728 → 2760
- `scripts/_test_place_names_bn_in_1.mjs`: 2728 → 2760
- `scripts/_test_place_names_ur_in_1.mjs`: 2728 → 2760
- `scripts/_test_city_name_fallback_consistency_1.mjs`: 2728 → 2760

---

## Verification Snapshot

```text
=== _test_asia_1h_my_fast.mjs ===
══════════════════════════════════════
 Results: 105 passed, 0 failed (105)
══════════════════════════════════════

=== _smoke_asia_1h_my_ssr.mjs ===
══════════════════════════════════════
 SSR Smoke: 21 passed, 0 failed (21)
══════════════════════════════════════

=== _smoke_asia_1h_my_search.mjs ===
══════════════════════════════════════
 Search Smoke: 18 passed, 0 failed (18)
══════════════════════════════════════
```

---

## Deferred (Not in Scope)

- 17 KL FT and 2 Labuan FT minor mukim — districts within KL Greater
  Area or low-pop sub-divisions.
- Sandakan/Tawau/Kota-Kinabalu already curated — Sabah remained
  uncovered for sub-100k towns (Beaufort, Keningau, Tenom, Ranau);
  consider for future ASIA-1H-MY-MCF.
- Sarawak: Limbang, Marudi, Mukah, Sri Aman — under 50k pop, deferred.
- Putrajaya admin1=17 is unique among the new entries — confirmed no
  collision with future ms-PJY-* slugs.

---

## STOP

Wave applied successfully. No code, docs, or policy changes. Waiting
for user closure approval before push to remote.
