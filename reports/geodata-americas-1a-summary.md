# Americas-1A — Wave Summary

**Wave**: `CURATED-GEODATA-AMERICAS-1A`
**Strategy**: E (Strategy A + ar-quality gate)
**Countries**: US, CA, MX
**Generated**: 2026-05-16T11:42:22.408Z

## Filter thresholds (same as Europe-1A)

* `population ≥ 100,000`
* OR `feature_code ∈ { PPLC, PPLA }` (always include national + 1st-order admin capitals)
* Distance to nearest curated entry **> 3 km** (avoid sub-municipalities)

## Per-country numbers

| Country | raw P-class | normalized | high | medium | low | needs_review | existing | passes-gate | blocked |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| US | 193760 | 168810 | **302** | 0 | 21360 | 147032 | 110 | **105** | **197** |
| CA | 21672 | 19706 | **59** | 0 | 630 | 18999 | 17 | **12** | **47** |
| MX | 294887 | 254114 | **81** | 1 | 39 | 253929 | 64 | **24** | **57** |
| **TOTAL** | — | — | **442** | 1 | 22029 | 419960 | 191 | **141** | **301** |

## Collision-watch list (user-specified, Strategy E §6)

User pre-flagged these slugs for explicit collision check:

`granada`, `cordoba`, `valencia`, `cartagena`, `toledo`, `barcelona`, `sevilla`, `malaga`, `porto`, `braga`, `coimbra`

### Status of watch-list slugs (existing curated + current wave)

| watch-slug | existing in curated? | wave candidate(s) | resolution |
| --- | --- | --- | --- |
| `birmingham` | birmingham [gb] "برمنغهام" | us/birmingham ⚠️ | bare slug already owned by gb → no new claim possible (no conflict) |
| `manchester` | manchester [gb] "مانشستر" | us/manchester ⚠️ | bare slug already owned by gb → no new claim possible (no conflict) |
| `cambridge` | cambridge [gb] "كامبريدج" | us/cambridge ⚠️, ca/cambridge ⚠️ | bare slug already owned by gb → no new claim possible (no conflict) |
| `dublin` | dublin [ie] "دبلن" | _(not in high-tier)_ | bare slug already owned by ie → no new claim possible (no conflict) |
| `athens` | athens [gr] "أثينا" | us/athens ⚠️ | bare slug already owned by gr → no new claim possible (no conflict) |
| `saint-petersburg` | saint-petersburg [ru] "سانت بطرسبرغ" | _(not in high-tier)_ | bare slug already owned by ru → no new claim possible (no conflict) |
| `toledo` | _(none — slug is free)_ | us/toledo ⚠️ | wave candidate **claims bare slug** (no existing reservation) |
| `rochester` | _(none — slug is free)_ | us/rochester ✅, us/rochester ⚠️ | wave candidate **claims bare slug** (no existing reservation) |
| `salem` | _(none — slug is free)_ | us/salem ⚠️ | wave candidate **claims bare slug** (no existing reservation) |
| `victoria` | _(none — slug is free)_ | ca/victoria ⚠️ | wave candidate **claims bare slug** (no existing reservation) |
| `cordoba` | cordoba [es] "قرطبة" | mx/cordoba ⚠️ | bare slug already owned by es → no new claim possible (no conflict) |
| `merida` | merida [es] "ماردة" | mx/merida ⚠️ | bare slug already owned by es → no new claim possible (no conflict) |
| `leon` | leon [es] "ليون" | _(not in high-tier)_ | bare slug already owned by es → no new claim possible (no conflict) |
| `granada` | granada-es [es] | _(not in high-tier)_ | pre-reserved with `-cc` suffix → bare slug **free** for higher-pop claimant in this wave |
| `santiago` | santiago-cl [cl], santiago-de-compostela [es] | mx/santiago-de-queretaro ✅ | pre-reserved with `-cc` suffix → bare slug **free** for higher-pop claimant in this wave |
| `washington` | washington-dc [us] | _(not in high-tier)_ | pre-reserved with `-cc` suffix → bare slug **free** for higher-pop claimant in this wave |
| `new-york` | new-york [us] "نيويورك" | _(not in high-tier)_ | bare slug already owned by us → no new claim possible (no conflict) |
| `los-angeles` | los-angeles [us] "لوس أنجلوس" | _(not in high-tier)_ | bare slug already owned by us → no new claim possible (no conflict) |
| `chicago` | chicago [us] "شيكاغو" | _(not in high-tier)_ | bare slug already owned by us → no new claim possible (no conflict) |
| `montreal` | montreal [ca] "مونتريال" | _(not in high-tier)_ | bare slug already owned by ca → no new claim possible (no conflict) |
| `toronto` | toronto [ca] "تورنتو" | _(not in high-tier)_ | bare slug already owned by ca → no new claim possible (no conflict) |
| `vancouver` | vancouver [ca] "فانكوفر" | us/vancouver ⚠️ | bare slug already owned by ca → no new claim possible (no conflict) |
| `mexico-city` | mexico-city [mx] "مكسيكو سيتي" | _(not in high-tier)_ | bare slug already owned by mx → no new claim possible (no conflict) |
| `guadalajara` | guadalajara [mx] "غوادالاخارا" | _(not in high-tier)_ | bare slug already owned by mx → no new claim possible (no conflict) |
| `monterrey` | monterrey [mx] "مونتيري" | _(not in high-tier)_ | bare slug already owned by mx → no new claim possible (no conflict) |
| `newcastle` | newcastle-upon-tyne [gb] | _(not in high-tier)_ | pre-reserved with `-cc` suffix → bare slug **free** for higher-pop claimant in this wave |
| `peterborough` | _(none — slug is free)_ | _(not in high-tier)_ | slug not in this wave — remains free for future waves |
| `york` | york [gb] "يورك" | _(not in high-tier)_ | bare slug already owned by gb → no new claim possible (no conflict) |

## Strategy E decision: passes-gate vs blocked

* **Passes ar-gate (141)** — ready for `status: approved` flip.
* **Blocked by ar-gate (301)** — manual fix BEFORE approval.

## Reports produced this wave

| Report | Path |
| --- | --- |
| Wave summary (this file) | `reports/geodata-americas-1a-summary.md` |
| Arabic-quality detail   | `reports/geodata-americas-1a-arabic-quality-report.md` |
| US country report | `reports/us-geodata-import-report.md` |
| CA country report | `reports/ca-geodata-import-report.md` |
| MX country report | `reports/mx-geodata-import-report.md` |

## Next steps

1. Read this summary + the ar-quality report.
2. Open each per-country report; decide per row.
3. Reply to the assistant: `approve all` / `approve per-country` / `fix Arabic` / `exclude slugs` / `rename slugs`.
4. Assistant flips `status` flags and runs Stage 4 per country.

**Hard rule**: do NOT modify `db/places/curated-places.json` by hand.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
