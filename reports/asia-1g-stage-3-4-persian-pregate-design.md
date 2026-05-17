# ASIA-1G-STAGE-3.4-PERSIAN-PREGATE-DESIGN-1 — Design report

**Phase:** Design-only (no GeoNames download, no pipeline mutation).
**Author:** Claude (autonomous design pass).
**Date:** 2026-05-17.
**Scope:** Iran (IR) + Afghanistan (AF) ASIA-1G preparation.
**Status:** Awaiting user decision (A / B / C / D — see §11).

---

## §1. Goal of Stage 3.4

ASIA-1G targets two countries whose GeoNames Arabic-script rows are
predominantly written in **Persian-script variants**, not in canonical
Arabic letters:

- `ی` (Persian yeh) instead of `ي`
- `ک` (Persian keheh) instead of `ك`
- `پ چ ژ گ ۀ` (no Arabic equivalents — Persian-only)
- For AF: Pashto extensions like `ښ ګ څ ځ ډ ړ ڼ`

Stage 3.5 (Arabic-Quality Gate) currently classifies any string
containing one of these letters as `mixed_script` and **blocks it**.
On historical Persian-source waves (informal scan) that would push
the high-tier passes-gate rate from ~55% to near 0% — every Iran city
would land in MCF.

**Stage 3.4 is a pre-gate that mechanically translates Persian/Urdu/
Pashto/Uyghur letter variants into canonical Arabic letters BEFORE
Stage 3.5 looks at the row.** It does not "translate" names. It does
not "guess." It performs character-level Unicode substitutions that
are visually and phonetically equivalent for Arabic readers — the
same substitutions that we have been applying by hand in the last
five MCF waves (`ASIA-1H-MCF` standardised the rule for Uyghur ۆ → و,
`ASIA-1I-MCF` extended it).

Goal in one line: **make ~50-70% of IR/AF GeoNames rows pass-gate
without manual editing, while making no semantic decisions on behalf
of the user**.

---

## §2. Position in pipeline

Today (`Strategy E`):

```
Stage 1  — import_geonames.mjs          (raw download)
Stage 2  — normalize_places.mjs         (extract names + slug)
Stage 3  — validate_candidates.mjs      (tier + collisions)
Stage 3.5 — arabic_quality_check.mjs    (Arabic-name QA gate)
Stage 4  — apply_curated_candidates.mjs (merge to curated)
```

Proposed:

```
Stage 1
Stage 2
Stage 3
Stage 3.4 — persian_pregate_normalizer.mjs   ← NEW (THIS phase designs it)
Stage 3.5
Stage 4
```

**Why a separate stage and not part of 3.5?**

1. **Single responsibility.** Stage 3.5 *classifies* names; it does
   not mutate them. The current code mass-reads candidate JSON,
   computes `arQuality`, and writes back per-row annotations. If we
   slipped the normalizer in there, every re-run of 3.5 would
   silently rewrite `names.ar` — that defeats the audit trail.
2. **Opt-in per country.** Stage 3.4 will be **gated on a country
   config flag** (see §8). KZ/UZ rows that occasionally leak Uyghur
   ۆ today are NOT contaminated enough to need it; IR/AF are. A flag
   keeps the existing waves untouched.
3. **Observable.** Stage 3.4 writes a side report with `before` /
   `after` / `perCharChanges` for every row it modifies. The user
   can audit it before approving anything.
4. **Decoupled.** Stage 3.4 is implementable, testable, and shippable
   independently of the wave it unblocks. Even if ASIA-1G is later
   split or deferred, this module is reusable.

---

## §3. Characters to clean

The full map lives in `scripts/geodata/persian_pregate_normalizer.mjs`
exported as `PERSIAN_CHAR_MAP`. Summary (24 letter pairs + 7 invisible
controls):

| Letter | Unicode | Origin | Mapped to | Rationale |
|--:|--:|--|:-:|--|
| `ی` | U+06CC | Persian yeh | `ي` | Identical phoneme, different shape |
| `ک` | U+06A9 | Persian keheh | `ك` | Identical phoneme |
| `پ` | U+067E | Persian peh | `ب` | Closest Arabic match (`p` → `b`) |
| `گ` | U+06AF | Persian gaf | `غ` | Default; reviewer can override per row |
| `چ` | U+0686 | Persian che | `ج` | Closest Arabic match |
| `ژ` | U+0698 | Persian jeh | `ز` | Closest match |
| `ۀ` | U+06C0 | Persian heh+hamza | `ه` | Trailing form normalization |
| `ٹ` | U+0679 | Urdu retroflex t | `ت` | Standard URD→ARB transliteration |
| `ڈ` | U+0688 | Urdu retroflex d | `د` | Same |
| `ڑ` | U+0691 | Urdu retroflex r | `ر` | Same |
| `ہ` | U+06C1 | Urdu heh goal | `ه` | Same |
| `ے` | U+06D2 | Urdu bari yeh | `ي` | Same |
| `ھ` | U+06BE | Urdu heh doachashmee | `ه` | Rare, safe |
| `ښ` | U+069A | Pashto seen-dot | `ش` | Closest Arabic |
| `ګ` | U+06AB | Pashto kaf-ring | `غ` | Mirror گ default |
| `څ` | U+0685 | Pashto hah-3dots | `ج` | Closest |
| `ځ` | U+0681 | Pashto hah-hamza | `ز` | Closest |
| `ډ` | U+0689 | Pashto dal-ring | `د` | Closest |
| `ړ` | U+0693 | Pashto reh-ring | `ر` | Closest |
| `ڼ` | U+06BC | Pashto noon-ring | `ن` | Closest |
| `ۆ` | U+06C6 | Uyghur oe | `و` | **Already stable since ASIA-1I-MCF** |
| `ڕ` | U+0695 | Kurdish reh-v | `ر` | Closest |
| `ڵ` | U+06B5 | Kurdish lam-v | `ل` | Closest |
| `ۊ` | U+06CA | Kurdish waw-2dots | `و` | Closest |

Invisible characters stripped (no substitution):

| Codepoint | Name |
|--|--|
| U+200C | ZWNJ (Persian word-internal separator) |
| U+200D | ZWJ |
| U+202A-202E | LTR/RTL directional overrides |
| U+0640 | Tatweel ـ |
| U+FEFF | BOM |

The cleaner also collapses runs of 2+ spaces and trims.

---

## §4. What Stage 3.4 must NOT do automatically

The pre-gate is **mechanical, not semantic**. The following stays
manual (MCF territory):

1. **Wrong-city names.** If GeoNames has `ar="جلال آباد"` for the
   Kyrgyz town Manas (real case from ASIA-1H-MCF), the pre-gate
   cannot fix it — there are no Persian letters to clean. This stays
   a `NAME_AR_FIXES` decision.
2. **Transliteration choices.** Persian `گ` defaults to `غ`. For a
   given Iranian city the reviewer might prefer `ك` or `ج`. The
   pre-gate uses one default; the MCF script can still override per
   row.
3. **Mojibake.** Strings like `ÚÊÑÇä` (Latin garbage that looks
   Arabic if you squint) are returned unchanged. Stage 3.5 classifies
   them as `mixed_latin` and blocks them.
4. **Arabic punctuation conventions.** No spacing/hamza/ta-marbuta
   normalization. We do not rewrite `أ` ↔ `ا` ↔ `إ`.
5. **Latin co-mingling.** A row like `تهران Tehran` is left as-is;
   3.5 will still mark it `mixed_latin`. Stage 3.4 is not a substitute
   for the Latin gate.

These restrictions are **the whole point** of having Stage 3.4 be a
separate, narrowly-scoped stage.

---

## §5. Before / after examples (from the fixture)

23 cases tested in `scripts/_test_persian_pregate_design.mjs`. All
pass. Highlights:

```
Already clean         الرياض              →  الرياض              (no change)
Already clean         طهران               →  طهران               (no change)
Persian yeh           یزد                 →  يزد                 (ی → ي)
Persian kaf           کرمان               →  كرمان               (ک → ك)
Persian che           چابهار              →  جابهار              (چ → ج)
Persian gaf ×2        گرگان               →  غرغان               (گ → غ ×2)
Persian peh           پارسا               →  بارسا               (پ → ب)
Multi-letter+ZWNJ     کرمانشاه‌ی          →  كرمانشاهي           (ZWNJ + ک + ی)
AF Persian            کابل                →  كابل                (ک → ك)
AF ZWNJ               جلال‌آباد           →  جلالآباد            (ZWNJ stripped)
AF Pashto only        څاښلوال             →  جاشلوال             (څ + ښ)
Uyghur                تۆبۆل               →  توبول               (ۆ ×2)
Urdu retroflex        اسلام آباد ٹاؤن    →  اسلام آباد تاؤن    (ٹ → ت)
Mojibake              ÚÊÑÇä               →  ÚÊÑÇä               (no change — Latin)
Mixed Latin           تهران Tehran        →  تهران Tehran        (no change — Latin)
Empty                 ""                  →  ""                  (no change)
Tatweel               حـاجـي              →  حاجي                (ـ stripped)
```

---

## §6. Effect on ar-quality buckets

Stage 3.5 today buckets each row's `names.ar` into:

| Bucket | Meaning | Pre-gate behavior |
|--|--|--|
| `wikidata` | from `ar:` tag, pure Arabic | unchanged — already passes |
| `arabic_only` | pure Arabic, untagged | unchanged — already passes |
| `mixed_script` | has Persian/Urdu chars | **rescued** to `arabic_only` |
| `mixed_latin` | has Latin chars | unchanged — still blocked (correct) |
| `empty` | no Arabic name | unchanged — still blocked |
| `mixed_unknown` | weird mix | unchanged — still blocked |

Net effect on a hypothetical IR run (rough, pre-actual-data): roughly
all `mixed_script` rows that were Persian-script-only would migrate to
`arabic_only` and become eligible for auto-merge. Rows with Latin
mixed in stay blocked. Mojibake stays blocked. **The Stage 3.5 code
does not need any change** — it simply sees clean Arabic and
classifies it normally.

The pre-gate also writes a side audit file (proposed name
`<wave>-persian-pregate-report.json`) recording every row it touched
with `slug`, `originalAr`, `cleanedAr`, `perCharChanges`. This is the
artifact the user reviews before approving the wave.

---

## §7. False-positive prevention

Risks and mitigations:

| Risk | Mitigation |
|--|--|
| A character we map is sometimes the **correct** Arabic letter in some name | None of the chars in the map are part of the standard Arabic 28-letter set. They are exclusively from Persian, Urdu, Pashto, Kurdish, Uyghur — by definition foreign. |
| Default `گ → غ` is wrong for a particular city | MCF reviewer can override that one row via `NAME_AR_FIXES` (existing pattern, ~20 lines per fix). The pre-gate gives a sane default for the 95% case. |
| Persian formatting (ZWNJ) sometimes appears legitimately in Arabic word groupings | ZWNJ is a Persian/Pashto convention; Arabic typesetting does not use it. Safe to strip. |
| Tatweel ـ is sometimes used for emphasis in legitimate Arabic typography | We've never seen it in a GeoNames row that we'd want to preserve. Strip is safe; if a future row needs it we add an opt-out. |
| Rare Kurdish/Pashto letter unmapped — slips into final name | Stage 3.5 still runs after 3.4 and would catch any remaining non-Arabic letter as `mixed_script`. Pre-gate is **best-effort**; the post-gate is the safety net. |
| Idempotency violation (running twice mutates a second time) | The cleaner is pure: cleaned output contains only Arabic + Latin + punctuation, so the next run finds nothing in the map. Test runner asserts this on every fixture row. |

---

## §8. Config flag

The country config (`scripts/geodata/countries/<cc>.mjs`) gets an
optional flag:

```js
export default {
    cc: 'ir',
    countryAr: 'إيران',
    countryEn: 'Iran',
    // ...
    persianSource: true,   // ← NEW: enables Stage 3.4 for this country
};
```

Default is `false`/absent. When absent, the wave script behaves
exactly as today (Stage 3 → 3.5 → 4). When `true`, the wave script
inserts Stage 3.4 between 3 and 3.5.

Proposed initial flag values:

| Country | flag | Rationale |
|--|--|--|
| IR | `true` | Dense Persian script in GeoNames Arabic rows |
| AF | `true` | Persian + Pashto in GeoNames Arabic rows |
| KZ | `false` (existing) | Only occasional ۆ — already handled in MCF |
| UZ, KG, TM, TJ, MN | `false` | Same as KZ |
| All Arab states (SA/EG/…) | `false` | Already clean Arabic |

The flag is **opt-in per country**, never global. We never run 3.4
on a country whose Arabic is already canonical.

---

## §9. Reusability beyond IR/AF

The same module unblocks:

1. **Tajikistan (TJ).** TJ uses Tajik (Persian-derived Cyrillic since
   1940) but GeoNames Arabic-script alternatenames sometimes carry
   the Persian-style spelling. If we later add a TJ enrichment wave,
   `persianSource: true` would help.
2. **Future Iraq/Syria revisits.** Some Kurdish-region cities have
   Arabic rows with `ڕ` or `ڵ` which Stage 3.4 normalizes.
3. **Per-row alias cleaning.** Today the MCF scripts hand-strip ZWNJ
   and Persian chars row by row (proven 30+ times). The same logic
   can be invoked on aliases (`names.ar` + `aliases.ar[]`) in a
   future generic alias-polish pass.
4. **Repair of historical curated entries.** As a one-shot, the
   normalizer can be run against `curated-places.json` to find
   existing entries that slipped Persian chars through (we already
   know of one — `ge/sokhumi` ar contains tz=`Europe/Moscow` not a
   Persian issue, but other latent cases may exist).

The module is **standalone and pure**: no filesystem, no IO, no
project-specific imports. Anyone in the codebase can `import { persianPregateClean }`
without dragging the pipeline along.

---

## §10. Test cases

Implemented in `scripts/_test_persian_pregate_design.mjs` with the
fixture in `scripts/geodata/_persian_pregate_fixture.mjs`.

```
═══ Stage 3.4 PERSIAN PRE-GATE — fixture run ═══
Total rows: 23
Char map size: 24

  ✓ ir/tehran                    "طهران" → "طهران"
  ✓ ir/isfahan                   "أصفهان" → "أصفهان"
  ✓ sa/riyadh                    "الرياض" → "الرياض"
  ✓ ir/mashhad                   "مشهد" → "مشهد"
  ✓ ir/yazd                      "یزد" → "يزد"
  ✓ ir/kerman                    "کرمان" → "كرمان"
  ✓ ir/chabahar                  "چابهار" → "جابهار"
  ✓ ir/gorgan                    "گرگان" → "غرغان"
  ✓ ir/parsa-multi               "پارسا" → "بارسا"
  ✓ ir/multi-letter              "کرمانشاه‌ی" → "كرمانشاهي"
  ✓ af/kabul                     "کابل" → "كابل"
  ✓ af/kandahar                  "کندهار" → "كندهار"
  ✓ af/herat                     "هرات" → "هرات"
  ✓ af/jalalabad                 "جلال‌آباد" → "جلالآباد"
  ✓ af/pashto-name               "څاښلوال" → "جاشلوال"
  ✓ kz/sample-uyghur             "تۆبۆل" → "توبول"
  ✓ ir/urdu-style                "اسلام آباد ٹاؤن" → "اسلام آباد تاؤن"
  ✓ ir/mojibake                  "ÚÊÑÇä" → "ÚÊÑÇä"
  ✓ ir/mixed-latin               "تهران Tehran" → "تهران Tehran"
  ✓ ir/empty                     "" → ""
  ✓ ir/null-row                  "null" → ""
  ✓ ir/idempotent-probe          "گرگان" → "غرغان"
  ✓ ir/tatweel                   "حـاجـي" → "حاجي"

─── persianPregateBatch report ───
  total:     23
  changed:   14
  unchanged: 7
  empty:     2
  top substitutions:
    ک → ك  ×4
    گ → غ  ×4
    ی → ي  ×2
    ۆ → و  ×2
    چ → ج  ×1
    پ → ب  ×1
    څ → ج  ×1
    ښ → ش  ×1
    ٹ → ت  ×1

Result: 23 pass / 0 fail (out of 23)
Idempotency: OK on passing rows
```

Coverage matrix:

- 3 already-clean rows → unchanged
- 6 Persian-letter rows → cleaned
- 4 AF Persian/Pashto rows → cleaned
- 1 Uyghur row → cleaned (consistency with ASIA-1H/1I-MCF)
- 1 Urdu retroflex row → cleaned
- 1 mixed Latin → unchanged (Latin not touched)
- 1 mojibake → unchanged (no Persian chars to remove)
- 2 empty/null → unchanged
- 1 idempotency probe → second pass produces no further change
- 1 tatweel → stripped

All assertions verify (cleaned text, changed flag, per-char counts,
idempotency).

---

## §11. Decision for user

Recommended path:

- **A — Approve Stage 3.4 design as proposed; proceed to ASIA-1G IR + AF together.**
  Wire the flag into IR + AF country configs and the wave scripts.
  Run import → normalize → validate → 3.4 → 3.5 → manual review
  → 4. Expect a high pass-gate rate (~50-70%) and a manageable MCF
  scope (~15-30% rows still needing semantic edits).

- **B — Approve with rule adjustments.**
  Pick alternative mappings (e.g. `گ → ك` instead of `→ غ`), or add /
  remove letters from the map. Re-run the fixture and re-submit.

- **C — Split ASIA-1G into IR solo, then AF solo.**
  Same Stage 3.4 module; two waves with a smaller blast radius each.

- **D — Defer ASIA-1G; do not integrate Stage 3.4 into the main pipeline yet.**
  Standalone module + fixture stay in the repo for future use. Move
  to the next backlog item (e.g. ASIA-1D PK+BD, or
  AMERICAS-1B-BLOCKED-MAJOR-CITIES-FIX-1).

**Nothing in the main pipeline changes until the user picks A, B, or C.**
The artifacts created in this design phase:

```
scripts/geodata/persian_pregate_normalizer.mjs   (standalone, reusable)
scripts/geodata/_persian_pregate_fixture.mjs     (in-process test data)
scripts/_test_persian_pregate_design.mjs         (test runner)
reports/asia-1g-stage-3-4-persian-pregate-design.md   (this file)
```

No edits to: `validate_candidates.mjs`, `arabic_quality_check.mjs`,
`apply_curated_candidates.mjs`, any country config, or `curated-places.json`.

—

*Awaiting user decision.*
