# PLACE-NAMES-L10N-FOUNDATION-CODE-1 — Strip report

**Run at**: 2026-05-18T07:50:38.746Z
**Mode**: equality-only strip (per user direction §13 q4)
**Strip langs**: `ur`, `bn`
**Inspect-only langs**: `ar`
**Latin-script langs untouched**: `fr`, `de`, `es`, `tr`, `id`, `ms` (deferred to Phase 6-7 famous-city seeding)

## Summary

| Lang | Stripped (was === names.en) | Unchanged (explicit OR absent) |
| --- | ---: | ---: |
| `ur` | **1755** | 581 |
| `bn` | **1755** | 581 |

Total entries scanned: **2336**.
Total deletions: **3510**.

## Per-country breakdown (top 30 by total deletions)

| cc | ur stripped | bn stripped | total |
| --- | ---: | ---: | ---: |
| us | 115 | 115 | 230 |
| th | 74 | 74 | 148 |
| jp | 67 | 67 | 134 |
| az | 64 | 64 | 128 |
| dz | 54 | 54 | 108 |
| eg | 52 | 52 | 104 |
| vn | 51 | 51 | 102 |
| de | 47 | 47 | 94 |
| iq | 45 | 45 | 90 |
| gb | 44 | 44 | 88 |
| ir | 41 | 41 | 82 |
| af | 36 | 36 | 72 |
| es | 35 | 35 | 70 |
| sy | 33 | 33 | 66 |
| tn | 33 | 33 | 66 |
| id | 32 | 32 | 64 |
| ly | 28 | 28 | 56 |
| mx | 28 | 28 | 56 |
| sd | 27 | 27 | 54 |
| br | 27 | 27 | 54 |
| pl | 24 | 24 | 48 |
| ph | 24 | 24 | 48 |
| kh | 23 | 23 | 46 |
| ro | 22 | 22 | 44 |
| mn | 22 | 22 | 44 |
| bt | 21 | 21 | 42 |
| kz | 21 | 21 | 42 |
| it | 20 | 20 | 40 |
| kr | 20 | 20 | 40 |
| mm | 20 | 20 | 40 |

## §inspect: rows where `names.ar === names.en` (manual review needed)

Per user direction, ar is INSPECTED but not auto-deleted. Any matches below should be reviewed individually — these are likely pre-Stage-3.5 legacy seeds where Arabic was populated as a Latin transliteration.

_✅ No `names.ar === names.en` matches found — Arabic invariant intact._

## Backup

Pre-strip backup written to:

```
C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json.preL10NFoundationCode1.bak
```

Restore: `cp curated-places.json.preL10NFoundationCode1.bak curated-places.json`

## What this script did NOT do

- ❌ NO changes to `fr`, `de`, `es`, `tr`, `id`, `ms` — deferred to Phase 6/7 per user direction
- ❌ NO auto-deletion of `names.ar` — even rows where `ar === en` are only INSPECTED
- ❌ NO script-class cleanup (e.g. `ar` containing Latin) — that's a separate future micro-fix wave
- ❌ NO addition of new localized names — stripping only
