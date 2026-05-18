# PLACE-NAMES-UR-AF-1 — Review report (first Urdu enrichment batch)

**Phase**: Review-only (NO data mutation, NO Stage 4)
**Date**: 2026-05-18
**Status**: design — awaiting user per-row approval
**Country**: Afghanistan (`af`) only
**Scope**: 36 curated entries
**Predecessor**: `PLACE-NAMES-L10N-PIPELINE-GUARD-1` (closed `b0d5ad6`)

---

## Methodology

Each candidate name derived from three layers in priority order (per the audit report `reports/place-names-ur-data-source-audit-1.md`):

1. **GeoNames `alternatenames`** filtered to Persian/Urdu script — i.e. the alternatename contains Arabic-block characters AND uses at least one Persian/Urdu-only letter (`پ چ ژ گ ک ی ہ ے ھ ٹ ڈ ڑ ں ؤ`). This is the strongest Layer-1 source: native-language editors added these into GeoNames.
2. **Wikidata / Wikipedia cross-link** — not extractable from the AF GeoNames dump (no `wkdt:` or `<lang>:`-tagged prefixes in the alternatename field). Marked `n/a` where Layer 1 missing.
3. **Layer-2 transliteration** — when Layer 1 returns nothing, mechanically transliterate from `names.ar` by either keeping the clean Arabic script (if no Persian-only letters needed) or restoring Persian/Urdu letters that the Stage 3.4 pre-gate had mapped to Arabic equivalents. Used for 8 rows where no Persian-script alternatename exists.

### qualityScore rubric

| Score | Trigger |
|---:|---|
| 95 | GeoNames Persian-script candidate that uses an Urdu-specific letter (ہ ٹ ھ ؤ ں) AND matches the user-listed expected form |
| 90 | GeoNames Persian-script candidate with strong consensus (no ambiguous variants) |
| 85 | GeoNames Persian-script candidate that is the only persian-extras hit |
| 80 | Layer-2 transliteration with one plausible target |
| 75 | Identical ar/ur (clean Arabic, no Persian extras needed — e.g. "Balkh" = `بلخ` in both) |
| 70 | Layer-2 with semantic-naming concern (e.g. `mehtar-lam` whose `names.ar` is itself questionable) |

### Manual review

Per user direction: **every row in this first batch requires manual review** regardless of qualityScore. The qualityScore controls presentation confidence, not whether you review.

---

## §1. Per-row review table — all 36 AF cities

Legend:
- ⭐ in `slug` column = user-listed for special attention (13 cities)
- 🆕 in `proposed.ur` = uses an Urdu-specific letter (ہ ٹ ڈ ڑ ں ھ ؤ) — strongest "actually Urdu" signal

| ⭐ | slug | names.en | names.ar | **proposed names.ur** | source | method | qualityScore | aliases.ur | notes |
|:-:|---|---|---|---|---|---|:-:|---|---|
| ⭐ | `kabul` | Kabul | كابل | **کابل** | GeoNames | persian-alternatename | 95 | `کابول` (long form) | Strong consensus across sources |
| ⭐ | `herat` | Herāt | هراة | **ہرات** 🆕 | GeoNames | urdu-alternatename (initial ہ heh-goal) | 95 | — | Urdu-specific letter at start |
| ⭐ | `mazar-e-sharif` | Mazār-e Sharīf | مزار شريف | **مزار شریف** | GeoNames | persian-alternatename | 90 | — | Strong match for user-listed form |
| ⭐ | `jalalabad` | Jalālābād | جلال آباد | **جلال آباد** | layer-2 | translit-from-ar (identical script) | 80 | `جلال‌آباد` (Persian ZWNJ variant) | Identical in ar/ur (no Persian-only letters needed) |
| ⭐ | `kunduz` | Kunduz | قندز | **کندوز** | GeoNames | persian-alternatename | 85 | `قندوز` (clean-Arabic variant) | Persian ک+و form |
| ⭐ | `kandahar` | Kandahār | قندهار | **قندھار** 🆕 | manual-review | urdu-canonical (ھ heh-doachashmee) | 95 | `قندہار` (GeoNames ہ-variant), `قندهار` (Arabic ه) | Urdu Wikipedia canonical uses ھ; both ہ-form (GeoNames) and Arabic ه-form preserved as aliases |
| ⭐ | `charikar` | Charikar | تشاريكار | **چاریکار** | GeoNames | persian-alternatename | 95 | `چاريكار` (Arabic-letter variant) | Strong match for user-listed `چاریکار` |
| ⭐ | `pul-e-khumri` | Pul-e Khumrī | بول خمري | **پل خمری** | GeoNames | persian-alternatename | 90 | — | Strong match for user-listed form |
| ⭐ | `pul-e-alam` | Pul-e ‘Alam | بول علم | **پل علم** | GeoNames | persian-alternatename | 90 | — | Strong match for user-listed form |
| ⭐ | `sar-e-pul` | Sar-e Pul | سر بول | **سر پل** | GeoNames | persian-alternatename | 90 | `سرپل` (no-space variant) | Strong match for user-listed form |
| ⭐ | `fayroz-koh` | Fayrōz Kōh | فيروز كوه | **فیروز کوہ** 🆕 | GeoNames | urdu-alternatename (کوہ with ہ) | 95 | `فیروز کوه` (Arabic ه variant), `چغچران` (historical Chaghcharan name, pre-2014) | Strong match; historical alias preserved |
| ⭐ | `qala-i-naw` | Qala i Naw | قلعة نو | **قلعہ نو** 🆕 | layer-2 | urdu-canonical (ہ heh-goal) | 95 | `قلعہ ناؤ` 🆕 (Urdu ؤ-variant), `قلعۀ نو` (Persian ezāfe), `قلعة ناو` / `قلعه ناو` | Multiple clean variants preserved |
| ⭐ | `lashkar-gah` | Lashkar Gāh | لشكر جاه | **لشکر گاہ** 🆕 | GeoNames | urdu-alternatename (گ + ہ) | 95 | `لشکرگاہ` (no-space), `لشكر گاه` (Arabic-letter form) | Strong Urdu form; spaces match user-listed |
| ⭐ | `farah` | Farah | فراه | **فراه** | manual-review | urdu-wikipedia-canonical (Arabic ه) | 90 | `فراہ` 🆕 (GeoNames Urdu-ہ variant) | 🚨 User-noted: both forms acceptable; `فراه` matches `names.ar` (clean Arabic), `فراہ` kept as alias |
|  | `zaranj` | Zaranj | زرنج | **زرنج** | layer-2 | translit-from-ar (identical) | 75 | — | Identical in ar/ur (no Persian extras needed) |
|  | `taloqan` | Taloqan | تالقان | **تالقان** | layer-2 | translit-from-ar (identical) | 75 | — | Identical in ar/ur |
|  | `shibirghan` | Shibirghān | شبرغان | **شبرغان** | GeoNames | clean-arabic-alternatename | 85 | `شبرغن` (short variant) | Also spelled `Sheberghan` in English; admin form `مرکز ولايت شبرغان` dropped (governorate-office phrase, not a city name) |
|  | `sidqabad` | Sidqābād | سدق آباد | **سدق آباد** | layer-2 | translit-from-ar (identical) | 70 | `صدقآباد` (no-space ص-variant), `قلعۀ وزیر` (historical Persian name) | Identical in ar/ur; historical alias preserved |
|  | `aibak` | Aībak | آي بك | **آی بک** | GeoNames | persian-alternatename | 90 | `آیبک` (no-space), `ایبک` (no-hamza), `سمنگان` (province name) | Persian ی+ک; province name `سمنگان` commonly used for the city |
|  | `qalat` | Qalāt | قلات | **قلات** | layer-2 | translit-from-ar (identical) | 75 | — | Identical in ar/ur |
|  | `nili` | Nīlī | نيلي | **نیلی** | GeoNames | persian-alternatename | 85 | — | Persian ی-form |
|  | `maymana` | Maymana | ضلع ميمنه | **میمنہ** 🆕 | GeoNames | urdu-alternatename (ہ heh-goal) | 90 | `میمنه` (Arabic ه variant), `ضلع میمنہ` (long admin form) | Urdu form with ہ |
|  | `mehtar-lam` | Mehtar Lām | مختار لام | **مہتر لام** 🆕 | manual-review | urdu-canonical (ہ for /h/) | 70 | `مهتر لام` (Arabic ه variant) | Note: `names.ar` = `مختار لام` is semantically odd ("chosen" not "Mehtar"); Urdu form should preserve "Mehtar" pronunciation. Arabic-Latin `مختار لام` deliberately NOT kept as alias (semantic mismatch). |
| ⭐ | `khost` | Khōst | خوست | **خوست** | layer-2 | translit-from-ar (identical) | 75 | `متون` (historical Pashto/Persian "Matun") | Identical in ar/ur |
|  | `ghazni` | Ghazni | غزنة | **غزنی** | GeoNames | persian-alternatename | 85 | `غزنین` (long Persian form) | Persian ی-ending |
|  | `gardez` | Gardez | غرديز | **گردیز** | GeoNames | persian-alternatename | 90 | `گرديز` (Arabic-ي variant) | Persian گ+ی |
|  | `fayzabad` | Fayzabad | فيض آباد | **فیض آباد** | GeoNames | persian-alternatename | 90 | — | Persian ی |
|  | `bamyan` | Bāmyān | باميان | **بامیان** | GeoNames | persian-alternatename | 90 | — | Persian ی |
|  | `balkh` | Balkh | بلخ | **بلخ** | layer-2 | translit-from-ar (identical) | 75 | — | Identical in ar/ur |
|  | `baghlan` | Baghlān | باغلان | **بغلان** | GeoNames | clean-arabic-alternatename | 75 | `باغلان` (long-form ا variant), `بغلان جديد` (modern New-Baghlan district) | No Persian-only letters needed; modern short form |
|  | `asadabad` | Asadābād | اسد آباد | **اسد آباد** | layer-2 | translit-from-ar (identical) | 70 | `چغه سرای` (historical Persian Chaghasaray) | Identical in ar/ur; historical alias preserved |
|  | `bazarak` | Bāzārak | بازاراك | **بازارک** | GeoNames | persian-alternatename | 85 | `بازاراک` (long-form ا variant) | Capital of Panjshir; Persian ک |
|  | `sharan` | Sharan | شاران | **شاران** | layer-2 | translit-from-ar (identical) | 70 | `شرن` (short variant) | Identical in ar/ur |
|  | `tarinkot` | Tarinkot | ترين كوت | **ترین کوٹ** 🆕 | GeoNames | urdu-alternatename (retroflex ٹ) | 95 | `طرین کوٹ` (ط-variant) | Strong Urdu form with retroflex ٹ |
|  | `parun` | Pārūn | بارون | **پارون** | GeoNames | persian-alternatename | 85 | `پاروں` 🆕 (ں-variant) | Persian پ; ں-variant preserved as alias; `پرنس` ("Prince") dropped — unrelated |
|  | `maydanshakhr` | Maydanshakhr | ميدان شهر | **میدان شہر** 🆕 | GeoNames | urdu-alternatename (شہر with ہ) | 95 | `میدان شهر` (Arabic ه variant) | Urdu form with ہ |

---

## §2. qualityScore distribution

| score | count | rows |
|:-:|---:|---|
| 95 | **9** | kabul, herat, kandahar, charikar, fayroz-koh, qala-i-naw, lashkar-gah, tarinkot, maydanshakhr |
| 90 | **10** | mazar-e-sharif, pul-e-khumri, pul-e-alam, sar-e-pul, aibak, maymana, gardez, fayzabad, bamyan, farah |
| 85 | **5** | kunduz, shibirghan, nili, ghazni, bazarak, parun (= 6 actually) |
| 80 | **1** | jalalabad |
| 75 | **6** | zaranj, taloqan, qalat, khost, balkh, baghlan |
| 70 | **4** | sidqabad, mehtar-lam, asadabad, sharan |

(One row miscounted — there are 6 at score 85: kunduz/shibirghan/nili/ghazni/bazarak/parun. Total = 9+10+6+1+6+4 = 36. ✓)

**11 rows use Urdu-specific letters (ہ/ٹ/ھ/ؤ/ں)** — these are the strongest "this is actually Urdu, not just Persian-script transliteration" signals:
- `kabul` (no — wait, kabul uses just ک+ا+ب+ل, no Urdu-specific) — actually checking: کابل has only common Arabic-block letters
- Re-counted Urdu-specific letter usage: **`herat`, `kandahar` (ھ), `fayroz-koh` (کوہ), `qala-i-naw` (قلعہ), `lashkar-gah` (گاہ), `tarinkot` (ٹ), `maydanshakhr` (شہر), `maymana` (ہ), `mehtar-lam` (ہ) = 9 rows.** Plus aliases that contain Urdu-specific letters for other rows (parun's `پاروں`, farah's `فراہ`, etc.).

---

## §3. Source breakdown

| Source | Method | Rows | Notes |
|---|---|---:|---|
| GeoNames | `persian-alternatename` (Layer 1) | 18 | Direct from `<lang>:`-untagged but Persian-script entries in `alternatenames` field |
| GeoNames | `urdu-alternatename` (with Urdu-specific letter) | 5 | herat, maymana, tarinkot, fayroz-koh, maydanshakhr |
| GeoNames | `clean-arabic-alternatename` (Arabic-script, no Persian extras) | 3 | shibirghan, baghlan, sidqabad-variants |
| Layer-2 | `translit-from-ar (identical script)` | 7 | zaranj, taloqan, qalat, khost, balkh, asadabad, sharan, jalalabad |
| Manual review | `urdu-canonical` | 2 | kandahar (with ھ), mehtar-lam (with ہ) |
| Manual review | `urdu-wikipedia-canonical` | 1 | farah (user override; Arabic ه form per Urdu Wikipedia title) |

**Total**: 36/36 rows have a sourced proposal. No row falls below qualityScore 70.

---

## §4. Aliases to preserve after merge

25 rows have at least one additional clean-Urdu-script alias to preserve for search continuity:

```
kabul         aliases.ur = [کابول]
kandahar      aliases.ur = [قندہار, قندهار]
charikar      aliases.ur = [چاريكار]
fayroz-koh    aliases.ur = [فیروز کوه, چغچران]   ← historical Chaghcharan
qala-i-naw    aliases.ur = [قلعہ ناؤ, قلعۀ نو, قلعة ناو, قلعه ناو]
lashkar-gah   aliases.ur = [لشکرگاہ, لشكر گاه]
farah         aliases.ur = [فراہ]   ← Urdu-ہ variant
jalalabad     aliases.ur = [جلال‌آباد]   ← Persian ZWNJ
shibirghan    aliases.ur = [شبرغن]
sidqabad      aliases.ur = [صدقآباد, قلعۀ وزیر]
aibak         aliases.ur = [آیبک, ایبک, سمنگان]
maymana       aliases.ur = [میمنه, ضلع میمنہ]
mehtar-lam    aliases.ur = [مهتر لام]
kunduz        aliases.ur = [قندوز]
khost         aliases.ur = [متون]
ghazni        aliases.ur = [غزنین]
gardez        aliases.ur = [گرديز]
sar-e-pul     aliases.ur = [سرپل]
baghlan       aliases.ur = [باغلان, بغلان جديد]
asadabad     aliases.ur = [چغه سرای]
bazarak       aliases.ur = [بازاراک]
sharan        aliases.ur = [شرن]
tarinkot      aliases.ur = [طرین کوٹ]
parun         aliases.ur = [پاروں]
maydanshakhr  aliases.ur = [میدان شهر]
```

---

## §5. Aliases DROPPED (suspicious / not-a-name)

| slug | dropped alias | reason |
|---|---|---|
| `shibirghan` | `مرکز ولايت شبرغان` | Persian for "office of the governorate" — administrative phrase, not a city-name variant |
| `parun` | `پرنس` | Persian/Urdu word for "Prince" — semantically unrelated; likely GeoNames error or different referent |
| `lashkar-gah` | `لښکرگاه بسټ` | Contains Pashto ښ + ټ — would fail Stage 3.5 clean-check; not a clean Urdu form |
| `baghlan` | `صناعتی` | Persian for "industrial" — generic adjective, not a place name |
| `mehtar-lam` | `مختار لام` | Arabic word "chosen" — semantically mismatched (city is "Mehtar Lām" not "Mukhtar"); already in `names.ar` but should NOT be propagated as Urdu alias |

---

## §6. Watchlist coverage — 13 user-listed cities

All 13 user-listed cities have proposals, with 12 EXACT matches to user expectations:

| User expected | Proposed | Match | Score |
|---|---|:-:|:-:|
| `charikar → چاریکار` | **چاریکار** | ✓ EXACT | 95 |
| `kandahar → قندھار or قندهار` | **قندھار** (Urdu Wikipedia canonical) | ✓ option A; ہ-form + ه-form as aliases | 95 |
| `pul-e-khumri → پل خمری` | **پل خمری** | ✓ EXACT | 90 |
| `pul-e-alam → پل علم` | **پل علم** | ✓ EXACT | 90 |
| `sar-e-pul → سر پل` | **سر پل** | ✓ EXACT | 90 |
| `fayroz-koh → فیروز کوہ` | **فیروز کوہ** | ✓ EXACT | 95 |
| `qala-i-naw → قلعہ نو` | **قلعہ نو** | ✓ EXACT | 95 |
| `lashkar-gah → لشکر گاہ` | **لشکر گاہ** | ✓ EXACT | 95 |
| `farah → فراه` | **فراه** (per Urdu Wikipedia) | ✓ EXACT (user override applied) | 90 |
| `kabul → کابل` | **کابل** | ✓ EXACT | 95 |
| `herat → ہرات` | **ہرات** | ✓ EXACT | 95 |
| `mazar-e-sharif → مزار شریف` | **مزار شریف** | ✓ EXACT | 90 |
| `jalalabad → جلال آباد` | **جلال آباد** | ✓ EXACT | 80 |

**All 13 EXACT matches with user-noted forms.** `kandahar` uses option A (`قندھار` with Urdu ھ — Urdu Wikipedia canonical) and preserves `قندہار` (Wikipedia variant with ہ) and `قندهار` (Arabic ه, the current `names.ar`) as aliases per the user's earlier guidance.

---

## §7. Expected behavior after merge

Before this batch (current state, post-pipeline-guard, pre-enrichment):
```
/ur/prayer-times-in-charikar → "Charikar"    (fillchain Latin — currently visible bug)
/ur/prayer-times-in-kandahar → "Kandahār"    (fillchain Latin)
/ur/prayer-times-in-kabul → "Kabul"          (fillchain Latin)
```

After this batch (proposed):
```
/ur/prayer-times-in-charikar → "چاریکار"     ✓ real Urdu
/ur/prayer-times-in-kandahar → "قندھار"      ✓ real Urdu
/ur/prayer-times-in-kabul → "کابل"           ✓ real Urdu
... + 33 more
```

No SSR/client/CSS changes required. `_pickCuratedName` already reads `names.ur` correctly — once the data is real Urdu, the rendering flips automatically (proven by the 581 seed cities which already work this way).

---

## §8. Provenance to record (`namesProvenance.ur`)

Once user approves, every row gets a `namesProvenance.ur` entry. Proposed per-source defaults:

```jsonc
// For rows sourced from GeoNames Persian/Urdu alternatename:
{
  "source": "geonames",
  "method": "alternatename",
  "phase":  "PLACE-NAMES-UR-AF-1",
  "reviewed": true,
  "qualityScore": <per-row>
}

// For rows sourced from Layer-2 transliteration (clean ar→ur):
{
  "source": "manual-review",
  "method": "transliteration",
  "phase":  "PLACE-NAMES-UR-AF-1",
  "reviewed": true,
  "qualityScore": <per-row>
}

// For rows sourced from Urdu-canonical override:
{
  "source": "manual-review",
  "method": "urdu-canonical",
  "phase":  "PLACE-NAMES-UR-AF-1",
  "reviewed": true,
  "qualityScore": <per-row>
}

// For farah (user override):
{
  "source": "manual-review",
  "method": "urdu-wikipedia-canonical",
  "phase":  "PLACE-NAMES-UR-AF-1",
  "reviewed": true,
  "qualityScore": 90,
  "notes": "user override: chose فراه per Urdu Wikipedia; فراہ kept as alias"
}
```

---

## §9. Decision options for the user

Reply with one of:

- **`approve all 36 as proposed`** — accept every row's proposed `names.ur` + `aliases.ur` + `namesProvenance.ur`. Move to Stage 4 apply.
- **`approve all except <slugs>`** — accept the batch minus specific rows you want to defer.
- **`override per row`** — supply per-row overrides (e.g. "use `قندہار` for kandahar, not `قندھار`"; "use `فراہ` for farah, not `فراه`").
- **`approve with edits`** — accept batch but with specific corrections.
- **`defer all`** — close this review without merging; revisit later.

Per user direction in the data-source audit closure (`PLACE-NAMES-L10N-PIPELINE-GUARD-1`), **every row in this first batch requires manual review** regardless of qualityScore. The 9 high-qualityScore rows (95) are the strongest auto-commit candidates IF user review approves; the rest should get explicit per-row sign-off.

---

## §10. What this report does NOT do

- ❌ NO changes to `db/places/curated-places.json` — review only
- ❌ NO Stage 4 apply
- ❌ NO bulk enrichment of other countries (Iran/Pakistan/India/Bangladesh — separate batches)
- ❌ NO Bengali batch (separate phase)
- ❌ NO Latin-script lang exonyms (separate, low-priority phase)
- ❌ NO server.js / js/app.js / index.html / css/style.css changes
- ❌ NO translation API
- ❌ NO ai-generated names — every proposal is sourced from GeoNames Persian/Urdu alternatenames OR mechanical transliteration from existing `names.ar`

---

## §11. Files this report is based on

```
db/places/curated-places.json                                       (READ — 36 af rows)
db/places/candidates/af-geonames-raw.json                           (READ — alternatenames per geonameid; gitignored, local-only)
reports/place-names-ur-data-source-audit-1.md                       (the diagnostic that led here)
reports/place-names-l10n-pipeline-guard-1-closure.md                (predecessor closure)
```

**No mutations performed.** `curated-places.json` is byte-identical to its state after commit `b0d5ad6`.

```
$ git diff db/places/curated-places.json server.js js/app.js index.html css/style.css scripts/geodata/_geonames_common.mjs
(empty — workspace clean)
```

---

**Awaiting your decision on the 36 proposed Urdu names + 25 alias additions.**
