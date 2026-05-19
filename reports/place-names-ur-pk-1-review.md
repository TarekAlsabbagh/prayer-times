# PLACE-NAMES-UR-PK-1 — Review report (third Urdu enrichment batch)

**Phase**: Review-only (NO data mutation, NO Stage 4)
**Date**: 2026-05-19
**Status**: design — awaiting user per-row approval
**Country**: Pakistan (`pk`) only
**Scope**: 10 curated entries — **0 pipeline rows / 10 seed rows already with real Urdu**
**Predecessors**:
- `PLACE-NAMES-L10N-PIPELINE-GUARD-1` (closed `b0d5ad6`) — stops future fillchain rows
- `PLACE-NAMES-UR-AF-1` (closed) — first Urdu enrichment wave (36 AF cities)
- `PLACE-NAMES-UR-IR-1-APPLY` (closed `351f563`, 2026-05-19) — second Urdu enrichment wave (41 IR cities)

**Out-of-scope (deferred)**:
- ar/en/fr/de/tr/id/es/bn/ms names — NOT touched
- aliases.* in non-ur locales — NOT touched
- server.js / js/app.js / fillLangMap / index.html / curated_places.json data → NO changes until user approves
- Other countries' Urdu (PK→IN→BD waves to follow separately per user direction)
- Adding new PK cities to curated_places.json (out of scope — review covers only the 10 cities **currently in curated**)

---

## §0. 🟢 Headline finding — NO data mutation needed

After enumerating all PK entries in `db/places/curated-places.json`:

| Category | Count |
|---|---:|
| **Pipeline** (fillchain `names.ur === names.en` Latin) | **0** |
| **Seed** (real Urdu names already present) | **10** |
| **Total PK entries** | **10** |

**All 10 Pakistani cities currently in `curated_places.json` already have correct, native Urdu names.** This is materially different from PLACE-NAMES-UR-AF-1 (36 pipeline AF rows) and PLACE-NAMES-UR-IR-1 (41 pipeline IR rows).

The "primary work" of this wave — adding real names.ur — is **already complete via the original seed**. This review focuses on:
1. Quality audit of the existing 10 `names.ur` values against Urdu Wikipedia canonical forms (§2).
2. Optional `aliases.ur` enrichments for richer search coverage (§3).

---

## §1. Per-row audit — all 10 PK seed entries

Legend:
- 🆕 in `proposed.ur` = uses an Urdu-specific letter (ہ ٹ ڈ ڑ ں ھ ؤ ے) — strongest "actually Urdu" signal
- ✅ in `Status` = current `names.ur` matches Urdu Wikipedia canonical (no change proposed)
- 💡 in `Notes` = optional alias enrichment proposed in §3

| slug | names.en | names.ar | **current names.ur** | proposed names.ur | source | method | qualityScore | current aliases.ur | proposed extra aliases | Status | Notes |
|---|---|---|---|---|---|---|:-:|---|---|:-:|---|
| `karachi`      | Karachi      | كراتشي      | **کراچی** 🆕    | کراچی (unchanged) | Urdu Wikipedia + seed | already-canonical | 95 | `["کراچی"]` (duplicate of name — quirk) | — | ✅ | Persian چ + Persian ی. Strong Urdu form. Duplicate alias is a no-op noise. |
| `lahore`       | Lahore       | لاهور       | **لاہور** 🆕    | لاہور (unchanged) | Urdu Wikipedia + seed | already-canonical | 95 | `["لاہور"]` (duplicate) | — | ✅ | Urdu ہ heh-goal. Strong Urdu form. |
| `islamabad`    | Islamabad    | إسلام آباد | **اسلام آباد**  | اسلام آباد (unchanged) | Urdu Wikipedia + seed | already-canonical | 90 | `["اسلام آباد", "اسلام اباد"]` (duplicate + no-madda variant) | — | ✅ | Identical to names.ar (minus hamza). Good coverage with no-madda variant. |
| `rawalpindi`   | Rawalpindi   | روالبندي    | **راولپنڈی** 🆕 | راولپنڈی (unchanged) | Urdu Wikipedia + seed | already-canonical | 95 | `["راولپنڈی"]` (duplicate) | 💡 `پنڈی` (common short colloquial form) | ✅ | Persian پ + Urdu retroflex ڈ + Persian ی. Strongest Urdu form. |
| `peshawar`     | Peshawar     | بيشاور      | **پشاور** 🆕    | پشاور (unchanged) | Urdu Wikipedia + seed | already-canonical | 90 | `["پشاور"]` (duplicate) | — | ✅ | Persian پ. Matches Urdu Wikipedia. |
| `multan`       | Multan       | ملتان       | **ملتان**       | ملتان (unchanged) | seed | identical-script | 75 | `["ملتان"]` (duplicate) | — | ✅ | Identical in ar/ur (no Persian/Urdu extras). |
| `faisalabad`   | Faisalabad   | فيصل آباد   | **فیصل آباد** 🆕 | فیصل آباد (unchanged) | Urdu Wikipedia + seed | already-canonical | 90 | `["فیصل آباد"]` (duplicate) | 💡 `لائلپور` (Lyallpur — historical pre-1979 British name) | ✅ | Persian ی in فیصل. Strong Urdu form. Historical alias would help old search queries. |
| `quetta`       | Quetta       | كويتا       | **کوئٹہ** 🆕    | کوئٹہ (unchanged) | Urdu Wikipedia + seed | already-canonical | 95 | `["کوئٹہ"]` (duplicate) | — | ✅ | Persian ک + hamza + Urdu retroflex ٹ + Urdu ہ. Strongest Urdu form. |
| `hyderabad-pk` | Hyderabad    | حيدر آباد   | **حیدرآباد** 🆕  | حیدرآباد (unchanged) | Urdu Wikipedia + seed | already-canonical | 90 | `["حیدرآباد سندھ"]` (Sindh disambiguation) | 💡 `حیدر آباد` (with-space variant matches Arabic form) | ✅ | Persian ی. Note `hyderabad-pk` slug already disambiguates from Indian Hyderabad. Sindh-suffix alias is excellent. |
| `sialkot`      | Sialkot      | سيالكوت     | **سیالکوٹ** 🆕  | سیالکوٹ (unchanged) | Urdu Wikipedia + seed | already-canonical | 95 | (none) | — | ✅ | Persian ی + Persian ک + Urdu retroflex ٹ. Strong Urdu form. |

**Result**: 10/10 rows already have correct, native Urdu names. **0 changes required to `names.ur`.**

---

## §2. Quality summary

| Metric | Value |
|---|---:|
| Rows with `names.ur` already correct | **10 / 10** (100%) |
| Rows using Urdu-specific letters (ہ/ٹ/ڈ/ڑ/ں/ھ/ؤ/ے) | **8 / 10** |
| Rows scoring 95 (highest confidence) | 4 (karachi, lahore, rawalpindi, quetta, sialkot — recount: **5**) |
| Rows scoring 90 | 4 (peshawar, islamabad, faisalabad, hyderabad-pk) |
| Rows scoring 75 (identical-script) | 1 (multan) |
| **Total** | **10 ✓** |

(Recount: 95 × 5 + 90 × 4 + 75 × 1 = 10 ✓)

### Observation: aliases.ur quirk

9 of 10 entries have `aliases.ur` containing the same string as `names.ur` itself (e.g. `karachi.aliases.ur = ["کراچی"]` matching `names.ur = "کراچی"`). This is a no-op duplicate — the apply layer dedups search candidates against `names.ur` first, so these aliases provide no extra search coverage.

**Recommendation**: leave as-is for this phase (no mutation to existing aliases). A future "alias hygiene" wave could optionally remove these no-op duplicates, but it's purely cosmetic and out-of-scope here.

---

## §3. Optional `aliases.ur` enrichments (3 proposals)

These are OPTIONAL — they would enrich search coverage without changing any name. **Skip them and the wave can close as a pure no-op confirmation.** Each is justified per row:

| slug | proposed extra alias | type | reason | qualityScore |
|---|---|---|---|:-:|
| `rawalpindi` | **`پنڈی`** | colloquial short form | "Pindi" is the universally-used short name in spoken Urdu for Rawalpindi. Users searching `پنڈی` should find Rawalpindi. | 90 |
| `faisalabad` | **`لائلپور`** | historical alias | "Lyallpur" was the city's name from 1898 (British era, after Sir Charles James Lyall) until 1979. Significant historical / search-recovery value. | 90 |
| `hyderabad-pk` | **`حیدر آباد`** | with-space variant | Matches Arabic form (`حيدر آباد`). Common alternative spelling in Urdu. | 85 |

All 3 are pure Urdu / Persian script (no Kurdish / Pashto / diacritics issues). All pass clean-Urdu-script check.

---

## §4. Aliases EXPLICITLY NOT proposed (audit trail of decisions)

For transparency — variants considered but NOT proposed:

| slug | variant considered | reason to skip |
|---|---|---|
| `karachi` | `کراچ` | Dialectal/rare, not standard |
| `lahore` | `لہور` | No-alif spelling — non-standard |
| `peshawar` | `پشور` | Short colloquial — rare in writing |
| `multan` | `مولتان` | Less common variant; `ملتان` is canonical |
| `quetta` | `کوئٹا` | Without final ہ — non-standard |
| `sialkot` | `سیالکوٹ سندھ` | Sialkot is in Punjab, not Sindh — would be wrong |
| All 9 with duplicate alias | — | Leave existing `aliases.ur = ["<name>"]` as-is; cleanup is purely cosmetic and out-of-scope |

---

## §5. Comparison with prior Urdu waves

| Phase | Country | Pipeline (need names.ur) | Seed (already real) | Names changed | New aliases | Phase effort |
|---|---|---:|---:|---:|---:|---|
| `PLACE-NAMES-UR-AF-1` | AF | 36 | 0 | 36 set | 36 added | Heavy (manual GeoNames + Wikipedia review) |
| `PLACE-NAMES-UR-IR-1-APPLY` | IR | 41 | 12 | 41 set | 35 added | Heavy (manual GeoNames + Wikipedia review) |
| **`PLACE-NAMES-UR-PK-1`** (this) | **PK** | **0** | **10** | **0** if approved | **0–3** depending on §3 approval | **Light** (audit + optional aliases) |

The "low effort" character of PK-1 reflects the high quality of the original PK seed data — Pakistani cities were seeded with proper Urdu forms from day one, presumably because they're top-search-volume cities for the platform's primary audience.

---

## §6. Open questions for user approval

Please confirm/override per question:

1. **Confirm the no-op conclusion** — accept that **0 rows need `names.ur` changes**, and close this phase as either:
   - **Option A (no-op close)**: zero changes, just document and close.
   - **Option B (alias enrichment only)**: accept 1–3 of the alias proposals in §3.

2. **For Option B, per alias proposal**:
   - **`rawalpindi + پنڈی`** (colloquial short) — accept / reject?
   - **`faisalabad + لائلپور`** (historical Lyallpur) — accept / reject?
   - **`hyderabad-pk + حیدر آباد`** (with-space variant) — accept / reject?

3. **Duplicate aliases.ur cleanup** — there are 9 rows where `aliases.ur` contains a string equal to `names.ur`. These are no-op noise. Should we:
   - **Skip cleanup** (recommended — out of UR-PK-1 scope, no functional benefit)
   - **Clean up as bonus** (would change `karachi.aliases.ur` from `["کراچی"]` to `[]`, etc.)

4. **Adding new PK cities not in curated_places.json** — out of scope for this phase. Cities like Bahawalpur (بہاولپور), Gujranwala (گوجرانوالہ), Sargodha (سرگودھا), Sukkur (سکھر), Larkana (لاڑکانہ), Mardan (مردان), Sheikhupura (شیخوپورہ), etc. would need a separate ASIA-1D-PK or similar wave to enter curated first. **Confirm this is out of scope here.**

---

## §7. Acceptance criteria (for the apply phase, if needed)

If user picks **Option A (no-op close)**:
- ✅ Close phase with no commit needed
- ✅ Update memory documenting that PK has no Urdu work outstanding

If user picks **Option B (alias enrichment)**:
- ✅ Apply only the user-approved aliases.ur entries (1–3 max)
- ✅ Backup `curated-places.json.prePlaceNamesUrPk1.bak`
- ❌ Do NOT touch `names.ar` / `names.en` / 10 existing `names.ur` values
- ❌ Do NOT touch the existing duplicate aliases.ur
- ❌ No code changes (server.js, js/app.js, fillLangMap untouched)
- ❌ No runtime translation
- ✅ Idempotent re-run support

### Tests required post-merge (Option B only)

Spot-check the affected slugs on `/ur/` HTML to confirm:
- `names.ur` unchanged (still the original Urdu form)
- New alias.ur reachable via search-place endpoint (e.g. searching `پنڈی` returns `rawalpindi`)
- Critical regression suites stay green (UR-AF-1, UR-IR-1, cross-page-navigation, sitewide-template-consistency, homepage-default-city)

If Option A is picked, only memory + report changes are needed — no apply script, no smoke test, no commit beyond docs.

---

## Status: 🟡 AWAITING USER REVIEW

**Next steps**:
1. User confirms the no-op finding (10/10 already correct).
2. User picks Option A (no-op close) OR Option B (1–3 alias enrichments from §3).
3. User answers questions in §6.
4. After approval, a follow-up phase `PLACE-NAMES-UR-PK-1-APPLY` will either:
   - **Option A**: close with memory-only update.
   - **Option B**: run a small apply script for 1–3 aliases.

**Until approval**: NO data mutation occurs. This is a pure design document.

**Confirmed NOT touched in this review**:
- `curated_places.json` ✓
- `names.ar` ✓
- `names.en` ✓
- `server.js` ✓
- `js/app.js` ✓
- `fillLangMap` ✓
- `index.html` ✓

**No runtime translation. No translation API. No AI translation on page load. No browser auto-translate.**
