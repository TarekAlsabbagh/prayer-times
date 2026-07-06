# Admin Promote Batch — 2026-07-06T11:01:29.775Z

Promoted **1** reviewed discovered cities into `curated-places.json` **on a branch (NOT main)** via the admin dashboard.
They become indexable only after the branch is manually merged to main + Render redeploys.

- commit message: `feat(cities): promote 1 reviewed discovered cities from admin dashboard (qubtan-al-jabal)`
- curated entries: 3109 → 3110

## Cities

| slug | cc | names.ar | names.en |
|---|---|---|---|
| `qubtan-al-jabal` | sy | قبتان الجبل | Qubtan al-Jabal |

## Entries added

```json
[
  {
    "slug": "qubtan-al-jabal",
    "type": "town",
    "countryCode": "sy",
    "lat": 36.2642792,
    "lng": 36.9494636,
    "timezone": "Asia/Damascus",
    "names": {
      "ar": "قبتان الجبل",
      "de": "Kubtan al-Dschabal",
      "en": "Qubtan al-Jabal",
      "fr": "Qubtan al-Djabal"
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
