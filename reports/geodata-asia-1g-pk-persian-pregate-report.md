# Persian Pre-Gate Report — `CURATED-GEODATA-ASIA-1G-PK`

**Country**: Pakistan (باكستان)
**Generated**: 2026-05-19T06:44:38.958Z
**Stage**: 3.4 (between Stage 3 validate and Stage 3.5 Arabic-name QA)

## Summary

| Bucket | Count |
| --- | --- |
| Total entries scanned                 | 145788 |
| Rows where Stage 3.4 made any change  | 0 |
| └─ name.ar changed                    | 0 |
| └─ aliases.ar changed                 | 0 |
| Rows unchanged                        | 567 |
| Rows with no Arabic at all (empty)    | 145221 |
| Total character substitutions         | 0 |

## Touched by tier

| Tier | Count of touched rows |
| --- | --- |
| high  | 60 |
| medium | 0 |
| low   | 495 |
| other (existing/needs_review/rejected) | 145233 |

## Top character substitutions

| Character (from) | Count |
| --- | --- |

## High-tier examples (up to 50)

| slug | before name.ar | after name.ar | subs |
| --- | --- | --- | --- |

## Alias-only changes (sample)

_(none — every alias change had a corresponding name.ar change)_

## Notes

* Stage 3.4 performs **character-level Unicode substitution only**.
  No transliteration, no wrong-city repair, no mojibake recovery.
* Strings with Latin mixed in are left unchanged; Stage 3.5 still
  classifies them as `mixed_latin` and blocks them.
* Output is **idempotent** — re-running on this candidates file
  produces zero further changes.
