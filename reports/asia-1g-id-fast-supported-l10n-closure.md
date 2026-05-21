# ASIA-1G-ID-FAST-SUPPORTED-L10N — Closure Report

**Date**: 2026-05-21
**Phase**: Fast combined geodata + L10N wave — Indonesian cities (ar / en / id only)
**Status**: ✅ **CLOSED — user-approved 2026-05-21**
**Implementation commit**: `c6ccbcd` — `feat(geodata): ASIA-1G-ID-FAST-SUPPORTED-L10N — +41 Indonesian cities with ar/en/id only`
**Scope**: +41 ID cities with exactly `ar/en/id`

---

## 0. Acceptance criteria

| # | Criterion | Status |
|---|---|---|
| 1 | 41 new ID cities added (within 40–60 target) | ✅ |
| 2 | ID count 41 → 82 (+41) | ✅ |
| 3 | Total curated 2,687 → 2,728 (+41) | ✅ |
| 4 | Each new entry has exactly `names.{ar, en, id}` | ✅ |
| 5 | No `names.ur/bn/hi/ta/mr/te/kn/ml/gu/pa/or/as/sa/fr/de/tr/es/ms` in any new entry | ✅ |
| 6 | All 123 (41 × 3) values pass per-lang script guards | ✅ |
| 7 | Prior 41 ID entries byte-identical (per-slug SHA-256) | ✅ |
| 8 | IN / PK / BD / non-ID byte-identical | ✅ (spot-checked 11 countries) |
| 9 | No duplicate slug / sourceId | ✅ |
| 10 | `server.js` / `js/app.js` / `index.html` / `server/place-l10n/index.js` unchanged | ✅ All 0-byte diff |
| 11 | `docs/place-data-maintenance-policy.md` unchanged | ✅ 0-byte diff |
| 12 | No search-ranking changes | ✅ |
| 13 | No runtime translation / fillchain | ✅ |
| 14 | Tests: 73/73 new + 988/988 carry-forward green | ✅ |
| 15 | Browser-verified via Preview MCP | ✅ 12 cities + 4 regression |
| 16 | Backup created before mutation | ✅ `db/places/curated-places.json.preAsia1gIdFast.bak` |
| 17 | Jakarta + Yogyakarta NOT modified (special administrative regions) | ✅ |
| 18 | Kota X form applied only where Indonesian Wikipedia confirms municipality status | ✅ 33 Kota X + 8 plain Kabupaten capitals |

---

## 1. Counts

| | Before | After | Delta |
|---|---|---|---|
| Total curated entries | 2,687 | **2,728** | **+41** |
| ID entries | 41 | **82** | **+41** |
| ID with `names.ar` | 41 | 82 | +41 |
| ID with `names.en` | 41 | 82 | +41 |
| ID with `names.id` | 41 | 82 | +41 |

---

## 2. List of 41 cities added

### 2.1 Kota X form (33) — confirmed municipalities

| # | Slug | GeonameId | EN | AR | ID | Pop | Region |
|---|---|---|---|---|---|---|---|
| 1 | `depok` | 1645524 | Depok | ديبوك | **Kota Depok** | 2.1M | West Java |
| 2 | `tasikmalaya` | 1624647 | Tasikmalaya | تاسيكمالايا | Kota Tasikmalaya | 742k | West Java |
| 3 | `serang` | 1627549 | Serang | سيرانغ | Kota Serang | 692k | Banten |
| 4 | `banjarmasin` | 1650213 | Banjarmasin | بانجارماسين | Kota Banjarmasin | 658k | South Kalimantan |
| 5 | `cimahi` | 1646448 | Cimahi | جيماهي | Kota Cimahi | 591k | West Java |
| 6 | `cilegon` | 1646511 | Cilegon | جيليغون | Kota Cilegon | 450k | Banten |
| 7 | `palu` | 1633034 | Palu | بالو | Kota Palu | 373k | Central Sulawesi |
| 8 | `dumai` | 1645133 | Dumai | دوماي | Kota Dumai | 332k | Riau |
| 9 | `pekalongan` | 1631766 | Pekalongan | بيكالونغان | Kota Pekalongan | 318k | Central Java |
| 10 | `binjai` | 1215355 | Binjai | بينجاي | Kota Binjai | 279k | North Sumatra |
| 11 | `pematangsiantar` | 1214204 | Pematangsiantar | بيماتانغ سيانتار | Kota Pematangsiantar | 275k | North Sumatra |
| 12 | `sorong` | 1626542 | Sorong | سورونغ | Kota Sorong | 254k | West Papua |
| 13 | `probolinggo` | 1630634 | Probolinggo | بروبولينغو | Kota Probolinggo | 247k | East Java |
| 14 | `singkawang` | 1626916 | Singkawang | سينغكاوانغ | Kota Singkawang | 246k | West Kalimantan |
| 15 | `pasuruan` | 1632033 | Pasuruan | باسوروان | Kota Pasuruan | 212k | East Java |
| 16 | `ternate` | 1624041 | Ternate | تيرنات | Kota Ternate | 205k | North Maluku |
| 17 | `madiun` | 1636930 | Madiun | ماديون | Kota Madiun | 203k | East Java |
| 18 | `salatiga` | 1629131 | Salatiga | سالاتيغا | Kota Salatiga | 201k | Central Java |
| 19 | `gorontalo` | 1643837 | Gorontalo | غورونتالو | Kota Gorontalo | 199k | Gorontalo |
| 20 | `lhokseumawe` | 1214658 | Lhokseumawe | لوكسوماوي | Kota Lhokseumawe | 196k | Aceh |
| 21 | `langsa` | 1214724 | Langsa | لانغسا | Kota Langsa | 195k | Aceh |
| 22 | `palopo` | 1633037 | Palopo | بالوبو | Kota Palopo | 191k | South Sulawesi |
| 23 | `parepare` | 1632353 | Parepare | باريباري | Kota Parepare | 160k | South Sulawesi |
| 24 | `bima` | 1648759 | Bima | بيما | Kota Bima | 161k | West Nusa Tenggara |
| 25 | `blitar` | 1648580 | Blitar | بليتار | Kota Blitar | 150k | East Java |
| 26 | `mojokerto` | 1635111 | Mojokerto | موجوكيرتو | Kota Mojokerto | 142k | East Java |
| 27 | `payakumbuh` | 1631905 | Payakumbuh | باياكومبوه | Kota Payakumbuh | 140k | West Sumatra |
| 28 | `magelang` | 1636884 | Magelang | ماغيلانغ | Kota Magelang | 122k | Central Java |
| 29 | `sibolga` | 1213855 | Sibolga | سيبولغا | Kota Sibolga | 91k | North Sumatra |
| 30 | `subulussalam` | 6713355 | Subulussalam | سبلوسلام | Kota Subulussalam | 91k | Aceh |
| 31 | `solok` | 1626649 | Solok | سولوك | Kota Solok | 73k | West Sumatra |
| 32 | `banjarbaru` | 1650217 | Banjarbaru | بانجاربارو | Kota Banjarbaru | n/a* | South Kalimantan |
| 33 | `padang-sidempuan` | 11054666 | Padang Sidempuan | بادانغ سيديمبوان | Kota Padang Sidempuan | n/a* | North Sumatra |

\* GeoNames population field empty but city is a confirmed municipality.

### 2.2 Plain form (8) — Kabupaten capitals (NOT Kota X per id-wp)

| # | Slug | GeonameId | EN | AR | ID | Pop | Region |
|---|---|---|---|---|---|---|---|
| 34 | `cilacap` | 1646559 | Cilacap | جيلاجاب | **Cilacap** | 257k | Central Java |
| 35 | `purwokerto` | 1630328 | Purwokerto | بوروكيرتو | Purwokerto | 230k | Central Java |
| 36 | `banyuwangi` | 1650077 | Banyuwangi | بانيواانغي | Banyuwangi | 118k | East Java |
| 37 | `maumere` | 1635815 | Maumere | مومير | Maumere | 88k | East Nusa Tenggara |
| 38 | `ende` | 1644932 | Ende | إندي | Ende | 87k | East Nusa Tenggara |
| 39 | `sumbawa-besar` | 1626185 | Sumbawa Besar | سومباوا بيسار | Sumbawa Besar | 63k | West Nusa Tenggara |
| 40 | `nabire` | 1634614 | Nabire | نابيري | Nabire | 44k | Central Papua |
| 41 | `bengkalis` | 1649169 | Bengkalis | بينغكاليس | Bengkalis | n/a | Riau |

---

## 3. Rejected / skipped cities (from inspiration)

| Slug | Reason |
|---|---|
| `jambi` | Major Kota Jambi gid (Sumatran provincial capital) NOT in raw extract; candidate gid `1967022` resolves to a small place in South Sulawesi (lat -5.45, lng 119.99). Deferred until proper gid available. |
| `tangerang-selatan` | Not in candidates pool |
| `palangka-raya` | Not in candidates pool |
| `bau-bau` | Not in candidates pool |
| `manokwari` | Already in curated (existing entry preserved) |
| `jakarta` | Already in curated (special administrative region — NOT modified per policy) |
| `yogyakarta` | Already in curated (Daerah Istimewa — NOT modified per policy) |
| `bogor` / `bekasi` / `tangerang` / etc. | Already in curated from prior IN-D wave |

Also note: candidate-data lat/lng was found UNRELIABLE for many cities (gids resolved to small variants). The apply script used **raw GeoNames name-exact-match + highest-population PPL/PPLA/PPLA2** instead, manually verified for lat/lng correctness vs Wikipedia.

---

## 4. Source breakdown

| Field | Source | Count |
|---|---|---|
| `names.en` | GeoNames `name` (raw) | 41 |
| `names.ar` | Manual standard Indonesian→Arabic phonetic transliteration | 41 |
| `names.id` (Kota X) | Wikipedia id canonical title + GeoNames alternatenames where present | 33 |
| `names.id` (plain) | Wikipedia id canonical title (Kabupaten capitals) | 8 |

**No runtime translation.** **No Google/OpenAI/Anthropic/browser MT.** All values are static text in the apply script with inline source citations.

---

## 5. Script guard results

123/123 values pass per-lang script validators:
- `ar`: Arabic block, no Bengali/Latin/Devanagari, no Urdu-only letters → 41/41
- `en`: Latin only → 41/41
- `id`: Latin only → 41/41

---

## 6. Tests

| Suite | Result |
|---|---|
| **NEW** `_test_asia_1g_id_fast.mjs` | **73/73 PASS** ✅ |
| IN-D/E/F (count drifts updated to 2,728) | 105/106/57 ✅ |
| UR-IN-1 (2728) | 122/122 ✅ |
| BN-IN-1 (2728) | 113/113 ✅ |
| HI-IN-1 (2728) | 116/116 ✅ |
| supported-local-policy-1 | 78/78 ✅ |
| fallback-consistency-1 (2728) | 173/173 ✅ |
| seo-fallback-1 | 107/107 ✅ |
| fill_lang_map | 11/11 ✅ |

**Offline aggregate: 1,061/1,061 PASS, 0 regressions.**

### Browser verification (Preview MCP)

12 new ID cities + 4 regression cities verified on `/id/prayer-times-in-{slug}`:

```
NEW:
depok            /id/ → "Jadwal Sholat di Kota Depok Hari Ini | ..."
tasikmalaya      /id/ → "Jadwal Sholat di Kota Tasikmalaya Hari Ini | ..."
banjarmasin      /id/ → "Jadwal Sholat di Kota Banjarmasin Hari Ini | ..."
palu             /id/ → "Jadwal Sholat di Kota Palu Hari Ini | ..."
gorontalo        /id/ → "Jadwal Sholat di Kota Gorontalo Hari Ini | ..."
ternate          /id/ → "Jadwal Sholat di Kota Ternate Hari Ini | ..."
sorong           /id/ → "Jadwal Sholat di Kota Sorong Hari Ini | ..."
nabire           /id/ → "Jadwal Sholat di Nabire Hari Ini | ..."      (plain)
banyuwangi       /id/ → "Jadwal Sholat di Banyuwangi Hari Ini | ..."  (plain)
bengkalis        /id/ → "Jadwal Sholat di Bengkalis Hari Ini | ..."   (plain)
cilegon          /id/ → "Jadwal Sholat di Kota Cilegon Hari Ini | ..."
palopo           /id/ → "Jadwal Sholat di Kota Palopo Hari Ini | ..."

REGRESSION:
malang           /id/ → "Jadwal Sholat di Kota Malang Hari Ini | ..."    ✓ preserved
jakarta          /id/ → "Jadwal Sholat di Jakarta Hari Ini | ..."        ✓ plain (no Kota)
yogyakarta       /id/ → "Jadwal Sholat di Yogyakarta Hari Ini | ..."     ✓ plain (no Kota)
surabaya         /id/ → "Jadwal Sholat di Kota Surabaya Hari Ini | ..."  ✓ preserved
```

---

## 7. Files

### MODIFIED
| File | Change |
|---|---|
| `db/places/curated-places.json` | +41 ID entries appended (prior 2,687 byte-identical) |
| `scripts/_test_place_names_ur_in_1.mjs` | 2687 → 2728 |
| `scripts/_test_place_names_bn_in_1.mjs` | 2687 → 2728 |
| `scripts/_test_place_names_hi_in_1.mjs` | 2687 → 2728 |
| `scripts/_test_asia_1d_in_d_fast.mjs` | curated count updated |
| `scripts/_test_asia_1d_in_e_fast.mjs` | curated count updated |
| `scripts/_test_asia_1d_in_f_fast.mjs` | curated count updated |
| `scripts/_test_city_name_fallback_consistency_1.mjs` | 2687 → 2728 |

### CREATED
| File | Purpose |
|---|---|
| `scripts/geodata/_asia_1g_id_fast_supported_l10n_apply.mjs` | Apply script + invariants |
| `scripts/_test_asia_1g_id_fast.mjs` | 73-test verification |
| `reports/asia-1g-id-fast-supported-l10n-apply-report.json` | Apply audit log |
| `reports/asia-1g-id-fast-supported-l10n-closure.md` | This report |
| `db/places/curated-places.json.preAsia1gIdFast.bak` | Backup |

### NOT modified
- `server.js`, `js/app.js`, `index.html`, `server/place-l10n/index.js` — all 0-byte diff
- `docs/place-data-maintenance-policy.md` — 0-byte diff (followed)
- All 2,687 prior curated entries — byte-identical
- IN / PK / BD / non-ID countries — byte-identical

---

## 8. Indonesia coverage state after this phase

| | Count |
|---|---|
| **ID total** | **82** |
| ID with `names.ar` | 82/82 (100%) |
| ID with `names.en` | 82/82 (100%) |
| ID with `names.id` | 82/82 (100%) |
| Kota X form (formal municipality) | 33 + previously-applied from POLICY-1 = 67 |
| Plain form (Kabupaten capital + special regions) | 15 |

---

## 9. Closure marker

**Approved by user 2026-05-21**:
> أعتمد إغلاق ASIA-1G-ID-FAST-SUPPORTED-L10N رسميًا، وأعطي الإذن برفع commit التنفيذ والـ closure commit بعد إنشائه.
> Marker: `docs(closure): mark ASIA-1G-ID-FAST-SUPPORTED-L10N user-approved 2026-05-21`

No further phases opened. Specifically held back per user constraint:
- ❌ ASIA-1G-ID-B
- ❌ ASIA-1D-IN-G
- ❌ ASIA-1F (CN solo)
- ❌ AMERICAS waves
- ❌ SUPPORTED-LOCAL-PLACE-NAMES-POLICY-2
- ❌ Search-ranking wave
- ❌ Hijri pages
- ❌ DELETE-V1 / geocode-proxy
- ❌ Separate L10N wave
- ❌ Any modification to `docs/place-data-maintenance-policy.md`

*— End of report —*
