# Admin Promote Batch — 2026-06-15T06:47:16.501Z

Promoted **1** reviewed discovered cities into `curated-places.json` **on a branch (NOT main)** via the admin dashboard.
They become indexable only after the branch is manually merged to main + Render redeploys.

- commit message: `feat(cities): promote 1 reviewed discovered cities from admin dashboard (al-quneitra)`
- curated entries: 2986 → 2987

## Cities

| slug | cc | names.ar | names.en |
|---|---|---|---|
| `al-quneitra` | sy | القنيطرة | Al-Quneitra |

## Entries added

```json
[
  {
    "slug": "al-quneitra",
    "type": "city",
    "countryCode": "sy",
    "lat": 33.1244369,
    "lng": 35.8230108,
    "timezone": "Asia/Jerusalem",
    "names": {
      "ar": "القنيطرة",
      "de": "al-Kuneitra",
      "en": "Al-Quneitra",
      "fr": "Qouneitra",
      "tr": "Kuneytire",
      "ur": "قنیطرہ"
    },
    "aliases": {},
    "admin": {
      "countryAr": "سوريا",
      "countryEn": "Syria"
    },
    "priority": 40,
    "source": "curated",
    "verified": true
  }
]
```
