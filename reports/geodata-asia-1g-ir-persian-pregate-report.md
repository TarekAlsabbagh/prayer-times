# Persian Pre-Gate Report — `CURATED-GEODATA-ASIA-1G-IR`

**Country**: Iran (إيران)
**Generated**: 2026-05-17T20:14:04.242Z
**Stage**: 3.4 (between Stage 3 validate and Stage 3.5 Arabic-name QA)

## Summary

| Bucket | Count |
| --- | --- |
| Total entries scanned                 | 71404 |
| Rows where Stage 3.4 made any change  | 45027 |
| └─ name.ar changed                    | 39885 |
| └─ aliases.ar changed                 | 17932 |
| Rows unchanged                        | 26377 |
| Rows with no Arabic at all (empty)    | 0 |
| Total character substitutions         | 101663 |

## Touched by tier

| Tier | Count of touched rows |
| --- | --- |
| high  | 42 |
| medium | 0 |
| low   | 63987 |
| other (existing/needs_review/rejected) | 7375 |

## Top character substitutions

| Character (from) | Count |
| --- | --- |
| `ی` (U+06CC) | 47391 |
| `ک` (U+06A9) | 19982 |
| `گ` (U+06AF) | 15374 |
| `چ` (U+0686) | 9830 |
| `پ` (U+067E) | 8049 |
| `ۀ` (U+06C0) | 648 |
| `ژ` (U+0698) | 342 |
| `ہ` (U+06C1) | 24 |
| `ھ` (U+06BE) | 7 |
| `ڈ` (U+0688) | 6 |
| `ۆ` (U+06C6) | 4 |
| `ڕ` (U+0695) | 4 |
| `ڵ` (U+06B5) | 1 |
| `ے` (U+06D2) | 1 |

## High-tier examples (up to 50)

| slug | before name.ar | after name.ar | subs |
| --- | --- | --- | --- |
| qarchak | قرچك | قرجك | چ→ج |
| golestan | شهرك گلستان | شهرك غلستان | گ→غ |
| yasuj | ياسوج | ياسوج |  |
| sirjan | سيرجان | سيرجان |  |
| sari | سارى | سارى |  |
| qazvin | قزوين | قزوين |  |
| qaem-shahr | شاه آباد | شاه آباد |  |
| neyshabur | نيسابور | نيسابور |  |
| nazarabad | نظر آباد | نظر آباد |  |
| khorramshahr | الخرمشهر | الخرمشهر |  |
| karaj | قَصَبِهِ كَرَج | قَصَبِهِ كَرَج |  |
| ilam | اِلام | اِلام |  |
| gorgan | اَستِر آباد | اَستِر آباد |  |
| bukan | بوکان | بوكان | ک→ك |
| birjand | بيرجند | بيرجند |  |
| bandar-abbas | بندر عباس | بندر عباس |  |
| ardabil | اردبيل | اردبيل |  |
| arak | اراک | اراك | ک→ك |
| khomeyni-shahr | خمینی شهر | خميني شهر | ی→ي |
| zahedan | زاهدان | زاهدان |  |
| pakdasht | مامازان | مامازان |  |

## Alias-only changes (sample)

| slug | before aliases.ar | after aliases.ar |
| --- | --- | --- |
| shahid-madani | شهرک شهید مدنی / شهید مدنی / شيخ خماط | شهرك شهيد مدني / شهيد مدني / شيخ خماط |
| rasan-dakham | رسن دخام / لخیضر | رسن دخام / لخيضر |
| boneh-ye-khan-jan | خانجان / قلعه خواجه پائین | خانجان / قلعه خواجه بائين |
| gorgiran | گرگیران | غرغيران |
| beyt-e-meskin | بیت مسکین | بيت مسكين |
| darreh-buri | دره بوری | دره بوري |
| ali-akbar | شیخ احمد / علی اکبر | شيخ احمد / علي اكبر |
| abid | عبید | عبيد |
| zavareh-bid-e-bala | زواره بید / زواره بید بالا | زواره بيد / زواره بيد بالا |
| sowdaghlian | سوداغیلان | سوداغيلان |
| siah-kolahan | سیاه کلاهان | سياه كلاهان |
| qal-eh-ye-sadat | قَلعِۀ سادات / کلین سادات | قَلعِه سادات / كلين سادات |
| akbarabad-e-kazemi | اکبر آباد / اکبر آباد کاظمی | اكبر آباد / اكبر آباد كاظمي |
| shahrak-e-ana | شهرک انا / شهرک اناء | شهرك انا / شهرك اناء |
| somakhestan | سماقستان / سماقستان علیا | سماقستان / سماقستان عليا |
| mahidasht | رباط ماهیدشت / ماهیدشت | رباط ماهيدشت / ماهيدشت |
| mehrabad | میر آباد | مير آباد |
| khersabad-e-bozorg | خرس آباد بزرگ | خرس آباد بزرغ |
| deh-e-sanan | سعدوند علیا | سعدوند عليا |
| burbur | بوربور علیا / بوربورا | بوربور عليا / بوربورا |
| azreh | ازره عبّاس آباد / ازره مکرمی | ازره عبّاس آباد / ازره مكرمي |
| hasanabad | حسین آباد | حسين آباد |
| astanakrud | آستانَك رود / آستانِ كَرود / آستانِه كَرود / آستانکرود / اِستانَك رود | آستانَك رود / آستانِ كَرود / آستانِه كَرود / آستانكرود / اِستانَك رود |
| ali-darreh | عالی دره / عالیدره | عالي دره / عاليدره |
| shahkola-kelich | شاهكلا کلیچ | شاهكلا كليج |

## Notes

* Stage 3.4 performs **character-level Unicode substitution only**.
  No transliteration, no wrong-city repair, no mojibake recovery.
* Strings with Latin mixed in are left unchanged; Stage 3.5 still
  classifies them as `mixed_latin` and blocks them.
* Output is **idempotent** — re-running on this candidates file
  produces zero further changes.
