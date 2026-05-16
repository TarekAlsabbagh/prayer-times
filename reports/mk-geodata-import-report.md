# MK GeoNames Import Report — Europe-3

**Country**: North Macedonia (مقدونيا الشمالية)
**Wave**: `CURATED-GEODATA-EUROPE-3`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T08:16:13.293Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/mk-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/mk-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/mk-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-3-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 2529 |
| existing (matched, no action)     | 0 |
| **pending — high tier**           | **56** |
| pending — medium tier             | 0 |
| pending — low tier                | 6 |
| needs_review                      | 2453 |
| rejected                          | 0 |
| collisions in this wave           | 542 |
| collisions against existing curated | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 23 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 33 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 7
**Blocked by ar-gate (high-tier):** 49

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | plasnica | بلاسنيتسا | Plasnica | Plasnica | mk | PPLA | 4574 |  | 41.4679 | 21.1227 |  |  | arabic_only |  | 70 | always_include:PPLA |
| ✅ | karbinci | كاربنتسي | Karbinci | Karbinci | mk | PPLA | 3900 |  | 41.8177 | 22.2325 |  |  | arabic_only |  | 70 | always_include:PPLA |
| ✅ | valandovo | فالاندوفو | Valandovo | Valandovo | mk | PPLA | 3798 |  | 41.3176 | 22.5630 |  |  | arabic_only |  | 70 | always_include:PPLA |
| ✅ | zrnovci | زرنوفتسي | Zrnovci | Zrnovci | mk | PPLA | 3236 |  | 41.8554 | 22.4445 |  |  | arabic_only |  | 70 | always_include:PPLA |
| ✅ | lozovo | لوزوفو | Lozovo | Lozovo | mk | PPLA | 2836 |  | 41.7836 | 21.9062 |  |  | arabic_only |  | 70 | always_include:PPLA |
| ✅ | pehcevo | بيهتشيفو | Pehčevo | Pehčevo | mk | PPLA | 2440 |  | 41.7625 | 22.8898 |  |  | arabic_only |  | 70 | always_include:PPLA |
| ✅ | vevcani | فيفتشاني | Vevčani | Vevčani | mk | PPLA | 2429 |  | 41.2404 | 20.5928 |  |  | arabic_only |  | 70 | always_include:PPLA |
| ⚠️ | kumanovo | كومانوفو | Kumanovo | Kumanovo | mk | PPLA | 75051 |  | 42.1328 | 21.7158 |  |  | arabic_only | wave→kumanovo-mk | 85 | always_include:PPLA |
| ⚠️ | prilep | بريليب | Prilep | Prilep | mk | PPLA | 73814 |  | 41.3456 | 21.5537 |  |  | arabic_only | wave→prilep-mk | 85 | always_include:PPLA |
| ⚠️ | bitola | bٹwla | Bitola | Bitola | mk | PPLA | 69287 |  | 41.0323 | 21.3355 |  |  | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | tetovo | تتوفو | Tetovo | Tetovo | mk | PPLA | 63176 |  | 42.0099 | 20.9714 |  |  | arabic_only | wave→tetovo-mk | 85 | always_include:PPLA |
| ⚠️ | veles | فيليس | Veles | Veles | mk | PPLA | 57873 |  | 41.7172 | 21.7720 |  |  | arabic_only | wave→veles-mk | 85 | always_include:PPLA |
| ⚠️ | shtip | shٹp | Shtip | Shtip | mk | PPLA | 48279 |  | 41.7458 | 22.1958 |  |  | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | centar-zupa | synٹr zhwpa | Centar Župa | Centar Župa | mk | PPLA | 45412 |  | 41.4785 | 20.5594 |  |  | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | ohrid | awہrd | Ohrid | Ohrid | mk | PPLA | 42033 |  | 41.1170 | 20.8017 |  |  | mixed_script | wave→ohrid-mk | 80 | always_include:PPLA |
| ⚠️ | struga | sٹrwga | Struga | Struga | mk | PPLA | 37387 |  | 41.1779 | 20.6789 |  |  | mixed_script | wave→struga-mk | 80 | always_include:PPLA |
| ⚠️ | kochani | كوتشاني | Kochani | Kochani | mk | PPLA | 34258 |  | 41.9164 | 22.4128 |  |  | arabic_only | wave→kochani-mk | 80 | always_include:PPLA |
| ⚠️ | strumica | sٹrwmyka | Strumica | Strumica | mk | PPLA | 33825 |  | 41.4376 | 22.6429 |  |  | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | zelino | زلینو | Zelino | Zelino | mk | PPLA | 25422 |  | 41.9803 | 21.0642 |  |  | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | radovis | ryڈwfs | Radovis | Radovis | mk | PPLA | 24984 |  | 41.6383 | 22.4647 |  |  | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | tearce | tyarsے | Tearce | Tearce | mk | PPLA | 23096 |  | 42.0759 | 21.0518 |  |  | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | negotino | nygwٹynw | Negotino | Negotino | mk | PPLA | 19515 |  | 41.4846 | 22.0906 |  |  | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | studenicani | sٹwڈnykany | Studeničani | Studeničani | mk | PPLA | 18219 |  | 41.9221 | 21.5348 |  |  | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | vinica | فينيتسا | Vinica | Vinica | mk | PPLA | 18218 |  | 41.8812 | 22.5107 |  |  | arabic_only | wave→vinica-mk | 80 | always_include:PPLA |
| ⚠️ | delcevo | دلچیووو | Delcevo | Delcevo | mk | PPLA | 17415 |  | 41.9672 | 22.7694 |  |  | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | resen | رسن | Resen | Resen | mk | PPLA | 16539 |  | 41.0900 | 21.0088 |  |  | arabic_only | wave→resen-mk | 80 | always_include:PPLA |
| ⚠️ | ilinden | إيليندن | Ilinden | Ilinden | mk | PPLA | 16406 |  | 41.9930 | 21.5808 |  |  | arabic_only | wave→ilinden-mk | 80 | always_include:PPLA |
| ⚠️ | bogovinje | bwgwwnjے | Bogovinje | Bogovinje | mk | PPLA | 15166 |  | 41.9224 | 20.9153 |  |  | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | sveti-nikole | swyty nkwlے | Sveti Nikole | Sveti Nikole | mk | PPLA | 13292 |  | 41.8696 | 21.9527 |  |  | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | arachinovo | آراچینوو | Arachinovo | Арачиново | mk | PPLA | 12800 |  | 42.0268 | 21.5628 |  |  | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | probishtip | prwbshٹp | Probishtip | Probishtip | mk | PPLA | 12702 |  | 42.0031 | 22.1786 |  |  | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | vasilevo | فاسيليفو | Vasilevo | Vasilevo | mk | PPLA | 12382 |  | 41.4742 | 22.6451 |  |  | arabic_only | wave→vasilevo-mk | 80 | always_include:PPLA |
| ⚠️ | novo-selo | نوفو سيلو | Novo Selo | Novo Selo | mk | PPLA | 11818 |  | 41.4154 | 22.8834 |  |  | arabic_only | wave→novo-selo-mk | 80 | always_include:PPLA |
| ⚠️ | kratovo | كراتوفو | Kratovo | Kratovo | mk | PPLA | 10288 |  | 42.0791 | 22.1817 |  |  | arabic_only | wave→kratovo-mk | 80 | always_include:PPLA |
| ⚠️ | sopiste | swpshtے | Sopište | Sopište | mk | PPLA | 9460 |  | 41.9556 | 21.4294 |  |  | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | rostusa | rwsٹwsa | Rostusa | Rostusa | mk | PPLA | 9147 |  | 41.6100 | 20.6000 |  |  | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | vrapciste | wrapchshtے | Vrapčište | Vrapčište | mk | PPLA | 8652 |  | 41.8348 | 20.8857 |  |  | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | chucher-sandevo | chwchr-sanڈywww | Chucher-Sandevo | Chucher-Sandevo | mk | PPLA | 8646 |  | 42.1036 | 21.3822 |  |  | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | bogdanci | bwgڈanchy | Bogdanci | Bogdanci | mk | PPLA | 8636 |  | 41.2036 | 22.5759 |  |  | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | petrovec | pyٹrwwyts | Ibraimovo | Петровец | mk | PPLA | 8298 |  | 41.9389 | 21.6150 |  |  | mixed_script | wave→petrovec-mk | 75 | always_include:PPLA |
| ⚠️ | makedonska-kamenica | مقدونسکا کامنیتسا | Makedonska Kamenica | Makedonska Kamenica | mk | PPLA | 8114 |  | 42.0214 | 22.5898 |  |  | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | jegunovce | jygwnwftsے | Jegunovce | Jegunovce | mk | PPLA | 7313 |  | 42.0724 | 21.1231 |  |  | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | krusevo | كروسيفو | Krusevo | Krusevo | mk | PPLA | 5211 |  | 41.3689 | 21.2489 |  |  | arabic_only | wave→krusevo-mk | 75 | always_include:PPLA |
| ⚠️ | demir-kapija | دمیر کاپیجا | Demir Kapija | Demir Kapija | mk | PPLA | 4451 |  | 41.4063 | 22.2431 |  |  | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | mogila | موغيلا | Mogila | Mogila | mk | PPLA | 4392 |  | 41.1081 | 21.3790 |  |  | arabic_only | wave→mogila-mk | 70 | always_include:PPLA |
| ⚠️ | staro-nagorichane | sٹarw nagwrychanے | Nagorican i Vjeter | Старо Нагоричане | mk | PPLA | 4112 |  | 42.1981 | 21.8286 |  |  | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | rosoman | روسومان | Rosoman | Rosoman | mk | PPLA | 4106 |  | 41.5167 | 21.9459 |  |  | arabic_only | wave→rosoman-mk | 70 | always_include:PPLA |
| ⚠️ | rankovce | rnkwwtsے | Rankovce | Rankovce | mk | PPLA | 4071 |  | 42.1696 | 22.1162 |  |  | mixed_script | wave→rankovce-mk | 70 | always_include:PPLA |
| ⚠️ | zelenikovo | زلنیکوو | Zelenikovo | Zelenikovo | mk | PPLA | 4020 |  | 41.8838 | 21.5896 |  |  | mixed_script | wave→zelenikovo-mk | 70 | always_include:PPLA |
| ⚠️ | gradsko | غرادسكو | Gradsko | Gradsko | mk | PPLA | 3737 |  | 41.5785 | 21.9426 |  |  | arabic_only | wave→gradsko-mk | 70 | always_include:PPLA |
| ⚠️ | konce | kwntsے | Konče | Konče | mk | PPLA | 3475 |  | 41.4953 | 22.3855 |  |  | mixed_script | wave→konce-mk | 70 | always_include:PPLA |
| ⚠️ | star-dojran | sٹar ڈwjran | Star Dojran | Star Dojran | mk | PPLA | 3348 |  | 41.1869 | 22.7186 |  |  | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | caska | تشاسكا | Čaška | Čaška | mk | PPLA | 2878 |  | 41.6506 | 21.6622 |  |  | arabic_only | wave→caska-mk | 70 | always_include:PPLA |
| ⚠️ | belcista | bylssٹa | Belčišta | Belčišta | mk | PPLA | 2804 |  | 41.3035 | 20.8299 |  |  | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | novaci | نواتسی بلدیہ | Novaci | Novaci | mk | PPLA | 2357 |  | 41.0420 | 21.4587 |  |  | mixed_script | wave→novaci-mk | 70 | always_include:PPLA |
| ⚠️ | demir-hisar | دمیر حصار | Demir Hisar | Demir Hisar | mk | PPLA | 2283 |  | 41.2203 | 21.2040 |  |  | mixed_script |  | 70 | always_include:PPLA |

## Collision-watch list for MK

Cities the user pre-flagged: `pristina`, `warsaw`, `krakow`, `prague`, `budapest`, `bucharest`, `sofia`, `athens`, `zagreb`, `belgrade`, `sarajevo`, `podgorica`, `skopje`, `tirana`, `tallinn`, `riga`, `vilnius`, `valletta`, `nicosia`, `wroclaw`, `gdansk`, `poznan`, `varna`, `plovdiv`, `thessaloniki`, `split`, `rijeka`, `novi-sad`, `cluj-napoca`, `timisoara`, `kaunas`, `liepaja`.

_(no watch-list cities appear in MK candidates)_

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/mk-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-mk` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/MK.zip
