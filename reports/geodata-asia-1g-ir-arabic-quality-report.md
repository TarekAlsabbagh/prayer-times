# IR Arabic-Quality Report (post-Stage 3.4)

**Wave**: `CURATED-GEODATA-ASIA-1G-IR`
**Country**: Iran (إيران)
**Generated**: 2026-05-17T20:19:48.396Z

## Comparison: baseline (no Stage 3.4) vs after Stage 3.4

| Bucket | Baseline | After 3.4 | Δ |
| --- | ---: | ---: | ---: |
| wikidata | 0 | 0 | 0 |
| arabic_only | 24307 | 64172 | +39865 |
| mixed_script | 39879 | 0 | -39879 |
| mixed_latin | 7204 | 7205 | +1 |
| mixed_unknown | 14 | 27 | +13 |
| empty | 0 | 0 | 0 |

## High-tier — baseline vs after 3.4

| Bucket | Baseline high | After 3.4 high |
| --- | ---: | ---: |
| wikidata | 0 | 0 |
| arabic_only | 37 | 42 |
| mixed_script | 5 | 0 |
| mixed_latin | 0 | 0 |
| mixed_unknown | 0 | 0 |
| empty | 0 | 0 |
| **passes-gate** | **37** | **42** |
| blocked-by-gate | 5 | 0 |

## High-tier rescued rows (5)

Rows that were `mixed_script` in baseline and `arabic_only` after Stage 3.4 — i.e., the Persian pre-gate did its job.

| slug | pop | baseline ar | after ar | now passes |
| --- | ---: | --- | --- | :---: |
| qarchak | 251,834 | قرچك | قرجك | ✓ |
| golestan | 240,000 | شهرك گلستان | شهرك غلستان | ✓ |
| bukan | 213,331 | بوکان | بوكان | ✓ |
| arak | 503,647 | اراک | اراك | ✓ |
| khomeyni-shahr | 277,334 | خمینی شهر | خميني شهر | ✓ |

## 27 mixed_unknown remaining (low-tier or existing)

All remaining `mixed_unknown` rows contain ﷲ ligature (U+FDF2), Persian-Indic digits (۰-۹), Kurdish ە (U+06D5), or combining marks — pre-existing artifacts unrelated to Stage 3.4. None are high-tier.

| slug | tier | fc | pop | ar |
| --- | --- | --- | ---: | --- |
| fathollah-bolaghi | low | PPL | 0 | فتح ﷲ بلاغي |
| amrollah | low | PPL | 0 | امرﷲ |
| taqcheh-jiq | low | PPL | 0 | (۲) باغجه جيق |
| abdollahabad | low | PPL | 0 | عبد ﷲ آباد |
| hajj-azizollah | low | PPL | 0 | حاج عزيزﷲ |
| qal-eh-abdollah | low | PPL | 0 | قلعه عبد ﷲ |
| kharfekol-bala | low | PPLL | 0 | خرفˇ كؤل |
| ney-pahn-e-abdollah | low | PPL | 0 | ني بهن عبدﷲ |
| mir-feyzollah | low | PPL | 0 | مير فيض ﷲ |
| ahvaz | (existing) | PPLA | 841,145 | ئەهواز |
| ney-pahn-e-seyfollah | low | PPL | 0 | ني بهن سيف ﷲ |
| zia-i | (other) | PPL | 0 | Ẕīā”ī |
| tabriz-2 | low | PPL | 0 | تبريز (۲) |
| sehrahi-ye-hezbollah | low | PPL | 0 | سه راهي حزب ﷲ |
| qeshlaq-e-azizollah | low | PPL | 0 | قشلاق عزيز ﷲ |
| mowtowr-e-ettehad-e-do | low | PPL | 0 | موتور اتحاد ۲ |
| soltan-abdollah | low | PPL | 0 | سلطان عبد ﷲ |
| towhid-e-do | low | PPL | 0 | توحيد ۲ |
| eslamabad-e-pain | low | PPL | 0 | اسلام آباد شماره ۲ |
| sorab-pardeh-ye-yek | low | PPL | 0 | سراب برده ۱ |
| sorab-pardeh-ye-do | low | PPL | 0 | سراب برده ۲ |
| sorab-pardeh-ye-seh | low | PPL | 0 | سراب برده ۳ |
| chah-e-qods-yek | low | PPL | 0 | جاه عميق قدس شماره ۱ |
| chah-e-vali-asr-shomareh-yek | low | PPL | 0 | جاه ولي عصر شماره ۱ |
| chah-e-vali-asr-shomareh-do | low | PPL | 0 | جاه ولي عصر شماره ۲ |
| chah-e-vali-asr-shomareh-seh | low | PPL | 0 | جاه موتور شماره ۳ ولي عصر |
| shahrak-e-faz-e-seh-zowb-ahan | low | PPL | 0 | شهرك فاز ۳ ذوب آهان |

## Counts

| Bucket | Value |
| --- | ---: |
| Total candidates scanned         | 71404 |
| High-tier total                  | 42 |
| High-tier passes-gate            | 42 |
| High-tier blocked by gate        | 0 |
| Cross-set collisions in wave     | 0 |
| Cross-set collisions vs curated  | 54 |
