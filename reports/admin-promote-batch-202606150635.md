# Admin Promote Batch — 2026-06-15T06:35:35.751Z

Promoted **1** reviewed discovered cities into `curated-places.json` **on a branch (NOT main)** via the admin dashboard.
They become indexable only after the branch is manually merged to main + Render redeploys.

- commit message: `feat(cities): promote 1 reviewed discovered cities from admin dashboard (al-khafsa)`
- curated entries: 2985 → 2986

## Cities

| slug | cc | names.ar | names.en |
|---|---|---|---|
| `al-khafsa` | sy | الخفسة | Al-Khafsa |

## Entries added

```json
[
  {
    "slug": "al-khafsa",
    "type": "town",
    "countryCode": "sy",
    "lat": 36.2305959,
    "lng": 38.021362,
    "timezone": "Asia/Damascus",
    "names": {
      "ar": "الخفسة",
      "de": "al-Chafsa",
      "en": "Al-Khafsa",
      "tr": "Hefse"
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
