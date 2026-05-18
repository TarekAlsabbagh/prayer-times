# PLACE-NAMES-UR-AF-1 — Apply audit trail

**Run at**: 2026-05-18T10:34:31.518Z
**Country**: AF
**Total rows applied**: 36
**Already-applied (skipped, idempotent)**: 0
**names.ur newly set (was absent)**: 0
**names.ur overwrote a fillchain value**: 36
**aliases.ur added**: 36

## Applied rows (sorted by slug)

| slug | names.ur | aliases.ur added | was fillchain? |
| --- | --- | ---: | :-: |
| `aibak` | آی بک | 3 | ✓ |
| `asadabad` | اسد آباد | 1 | ✓ |
| `baghlan` | بغلان | 2 | ✓ |
| `balkh` | بلخ | 0 | ✓ |
| `bamyan` | بامیان | 0 | ✓ |
| `bazarak` | بازارک | 1 | ✓ |
| `charikar` | چاریکار | 1 | ✓ |
| `farah` | فراه | 1 | ✓ |
| `fayroz-koh` | فیروز کوہ | 2 | ✓ |
| `fayzabad` | فیض آباد | 0 | ✓ |
| `gardez` | گردیز | 1 | ✓ |
| `ghazni` | غزنی | 1 | ✓ |
| `herat` | ہرات | 0 | ✓ |
| `jalalabad` | جلال آباد | 1 | ✓ |
| `kabul` | کابل | 1 | ✓ |
| `kandahar` | قندھار | 2 | ✓ |
| `khost` | خوست | 1 | ✓ |
| `kunduz` | کندوز | 1 | ✓ |
| `lashkar-gah` | لشکر گاہ | 2 | ✓ |
| `maydanshakhr` | میدان شہر | 1 | ✓ |
| `maymana` | میمنہ | 2 | ✓ |
| `mazar-e-sharif` | مزار شریف | 0 | ✓ |
| `mehtar-lam` | مہتر لام | 1 | ✓ |
| `nili` | نیلی | 0 | ✓ |
| `parun` | پارون | 1 | ✓ |
| `pul-e-alam` | پل علم | 0 | ✓ |
| `pul-e-khumri` | پل خمری | 0 | ✓ |
| `qala-i-naw` | قلعہ نو | 4 | ✓ |
| `qalat` | قلات | 0 | ✓ |
| `sar-e-pul` | سر پل | 1 | ✓ |
| `sharan` | شاران | 1 | ✓ |
| `shibirghan` | شبرغان | 1 | ✓ |
| `sidqabad` | سدق آباد | 2 | ✓ |
| `taloqan` | تالقان | 0 | ✓ |
| `tarinkot` | ترین کوٹ | 1 | ✓ |
| `zaranj` | زرنج | 0 | ✓ |

## Aliases explicitly NOT added (review §5 audit)

| slug | dropped alias | reason |
| --- | --- | --- |
| `shibirghan` | `مرکز ولايت شبرغان` | admin office phrase, not a city name |
| `parun` | `پرنس` | Persian/Urdu word for "Prince" — unrelated to the city |
| `lashkar-gah` | `لښکرگاه بسټ` | contains Pashto ښ + ټ — fails clean-check |
| `baghlan` | `صناعتی` | Persian for "industrial" — generic adjective, not a place name |
| `mehtar-lam` | `مختار لام` | Arabic word "chosen" — semantic mismatch (city is "Mehtar") |

## Backup

Pre-apply backup written to: `C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json.prePlaceNamesUrAf1.bak`

Restore command: `cp curated-places.json.prePlaceNamesUrAf1.bak curated-places.json`

## What this apply did NOT do

- ❌ `names.ar` not modified
- ❌ `names.en` not modified
- ❌ `namesProvenance` not added (not in user's 7-point list)
- ❌ No other country touched
- ❌ No code changes
- ❌ No runtime translation
