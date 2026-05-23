# MOON-SUMMARY-LABELS-I18N-POLISH-1 — Closure

**Status:** ✅ Implemented in all 10 supported languages. Moon summary bar (`#moon-summary-line`) labels are now precise + consistent across `/moon-today`, `/{lang}/moon-today`, and every `/moon-in-{city}*` page that reuses the same component.

**Date:** 2026-05-23
**Scope:** Text/i18n only. Affected element: `<div id="moon-summary-line">` and its 4 i18n keys (`moon.summary.phase` / `moon.summary.illum` / `moon.summary.age` / `moon.summary.age_suffix`).

---

## 1. Files changed

| File | Change |
|---|---|
| `js/i18n/ar.js` | 4 keys updated (phase kept, illum / age / age_suffix refined). |
| `js/i18n/en.js` | 4 keys updated (phase/illum kept, age "Age:" → "Moon age:", age_suffix "days of 29.5" → "days of the lunar cycle"). |
| `js/i18n/fr.js` | 3 keys updated + new `age_suffix` added. |
| `js/i18n/de.js` | 3 keys updated + new `age_suffix` added. |
| `js/i18n/tr.js` | 3 keys updated + new `age_suffix` added (uses Turkish genitive split: label="Ay yaşı: Ay döngüsünün", suffix="günü"). |
| `js/i18n/es.js` | 3 keys updated + new `age_suffix` added. |
| `js/i18n/id.js` | 3 keys updated + new `age_suffix` added. |
| `js/i18n/ms.js` | 3 keys updated + new `age_suffix` added. |
| `js/i18n/ur.js` | 3 keys updated + new `age_suffix` added (Urdu phrasing splits: label="چاند کی عمر: قمری دور کے", suffix="دن"). |
| `js/i18n/bn.js` | 3 keys updated + new `age_suffix` added (Bengali phrasing splits: label="চাঁদের বয়স: চন্দ্রচক্রের", suffix="দিন"). |
| `js/i18n.js` | Legacy single-bundle: all 10 lang sections mirrored. |
| `index.html` | 3 inline SSR defaults updated (illum label, age label, age_suffix); cache-buster `i18n.js?v=174` → `?v=175`. |
| `server.js` | `_i18nVersion` `'174'` → `'175'` (bundle cache-buster). |

**Files NOT touched** (verified `git diff --quiet`):
- `js/moon.js` (MoonCalc — moon math algorithm).
- `js/moon-chart.js` (chart rendering / sampling).
- `js/app.js` (no behavior changes, no cache-buster bump — pure i18n-only phase).
- `js/hijri-date.js`, `js/hijri-umm-al-qura.js`, `db/hijri/umm-al-qura.json` (Hijri logic + table).
- All `db/places/curated-places.json` / cities data files.

---

## 2. Languages updated (10/10)

| Lang | Phase label | Illum label | Age label | Age suffix |
|---|---|---|---|---|
| ar | `القمر اليوم:` | `نسبة الإضاءة:` | `عمر القمر:` | `يوم من الدورة القمرية` |
| en | `Moon today:` | `Illumination:` | `Moon age:` | `days of the lunar cycle` |
| fr | `Lune aujourd’hui :` | `Illumination :` | `Âge de la Lune :` | `jours du cycle lunaire` |
| de | `Mond heute:` | `Beleuchtung:` | `Mondalter:` | `Tage des Mondzyklus` |
| tr | `Bugünkü Ay:` | `Aydınlanma oranı:` | `Ay yaşı: Ay döngüsünün` | `günü` |
| es | `Luna de hoy:` | `Iluminación:` | `Edad lunar:` | `días del ciclo lunar` |
| id | `Bulan hari ini:` | `Persentase iluminasi:` | `Usia bulan:` | `hari dari siklus bulan` |
| ms | `Bulan hari ini:` | `Peratus pencahayaan:` | `Umur bulan:` | `hari dalam kitaran bulan` |
| ur | `آج کا چاند:` | `روشنی کا تناسب:` | `چاند کی عمر: قمری دور کے` | `دن` |
| bn | `আজকের চাঁদ:` | `আলোকিত অংশ:` | `চাঁদের বয়স: চন্দ্রচক্রের` | `দিন` |

Notes on TR / UR / BN: natural phrasing in those languages places the number mid-phrase ("X days of the lunar cycle" → "of the lunar cycle X days"). To preserve the existing `[label][number][suffix]` HTML template structure, the long prefix is folded into the `age` label slot and only the trailing noun ("günü" / "دن" / "দিন") goes into `age_suffix`. Rendered output reads naturally in each language.

---

## 3. Before / After

### Arabic — `/moon-today`

**Before:**
```
🌓 القمر اليوم: تربيع أول · الإضاءة: 49.13% · العمر: 6.8 يوم من أصل 29.5 يوم
```

**After:**
```
🌓 القمر اليوم: تربيع أول · نسبة الإضاءة: 49.13% · عمر القمر: 6.8 يوم من الدورة القمرية
```

### English — `/en/moon-today`

**Before:**
```
🌓 Moon today: First Quarter · Illumination: 49.13% · Age: 6.8 days of 29.5
```

**After:**
```
🌓 Moon today: First Quarter · Illumination: 49.13% · Moon age: 6.8 days of the lunar cycle
```

### Phase name is dynamic (rendered by MoonCalc + lang-specific phase translations) — NOT changed by this phase.
### Numeric values (49.13 %, 6.8) are dynamic (computed by MoonCalc at the Mecca-anchored canonical instant for `/moon-today`, or city-local-noon for `/moon-in-{city}`) — NOT changed by this phase.

---

## 4. Calculation-integrity confirmations

| Subject | Status |
|---|---|
| MoonCalc (`js/moon.js`) source | ✅ Unchanged (`git diff --quiet` clean) |
| Illumination % value | ✅ Unchanged — still 49.13 % at Mecca canonical instant (2026-05-23T09:00:00Z), still 49.13 % across summary/chart/table on `/moon-today` and `/moon-in-riyadh` |
| Moon age value (days) | ✅ Unchanged — still computed from `MoonIllumination.phase × 29.530588`, no algorithm modification |
| Mecca canonical reference for `/moon-today` | ✅ Preserved — MOON-TODAY-MAKKAH-CANONICAL-REFERENCE-1 (commit `1b54433`) untouched |
| city-local-noon for `/moon-in-{city}` | ✅ Preserved — MOON-CITY-ILLUMINATION-UNIFICATION-1 (commit `6c64484`) untouched |
| Umm al-Qura table + Hijri logic | ✅ Unchanged |

The 4 labels are pure **text decoration around the dynamic numeric values**. The slots `id="moon-summary-phase"`, `id="moon-summary-illum"`, `id="moon-summary-age"` remain filled by the SAME JS path (unchanged) from the SAME MoonCalc instance (unchanged) at the SAME canonical instant (unchanged).

---

## 5. Test results

### 5.1 Syntax: `node -c` on all 12 modified JS files

```
OK  js/i18n.js
OK  js/i18n/ar.js
OK  js/i18n/en.js
OK  js/i18n/fr.js
OK  js/i18n/de.js
OK  js/i18n/tr.js
OK  js/i18n/es.js
OK  js/i18n/id.js
OK  js/i18n/ms.js
OK  js/i18n/ur.js
OK  js/i18n/bn.js
OK  server.js

12 / 12 PASS
```

### 5.2 Route smoke (13 routes, fresh server)

```
200  /moon-today
200  /en/moon-today
200  /fr/moon-today
200  /de/moon-today
200  /tr/moon-today
200  /ur/moon-today
200  /id/moon-today
200  /es/moon-today
200  /bn/moon-today
200  /ms/moon-today
200  /moon-in-riyadh
200  /qibla
200  /

13 / 13 PASS
```

### 5.3 SSR string verification (each lang gets the correct localized label)

Sampled the served HTML for `data-i18n="moon.summary.{phase|illum|age|age_suffix}"` on all 10 `*/moon-today` routes — every label served the **correct localized string**. No Arabic text on non-Arabic pages. No English fallback leaking onto Arabic / Urdu / Bengali pages.

Full table verified live:

```
Phase label across all 10 langs:
  ar  القمر اليوم:
  en  Moon today:
  fr  Lune aujourd’hui :
  de  Mond heute:
  tr  Bugünkü Ay:
  es  Luna de hoy:
  id  Bulan hari ini:
  ms  Bulan hari ini:
  ur  آج کا چاند:
  bn  আজকের চাঁদ:

Age suffix across all 10 langs:
  ar  يوم من الدورة القمرية
  en  days of the lunar cycle
  fr  jours du cycle lunaire
  de  Tage des Mondzyklus
  tr  günü
  es  días del ciclo lunar
  id  hari dari siklus bulan
  ms  hari dalam kitaran bulan
  ur  دن
  bn  দিন
```

(illum + age labels similarly verified — all correct.)

### 5.4 Numeric-value sanity

The `<strong id="moon-summary-illum">` slot, `<strong id="moon-summary-age">` slot, and `<strong id="moon-summary-phase">` slot are populated by the SAME JS path against the SAME MoonCalc routine — no code change in that path. The Mecca-canonical-instant verification from MOON-TODAY-MAKKAH-CANONICAL-REFERENCE-1 (Summary/Chart/Table all 49.13 % at probe `2026-05-23T09:00:00Z`) still holds because we did not touch any code feeding those slots.

`/moon-in-riyadh` similarly continues to show the unified city-local-noon values (Summary/Chart/Table all identical at Riyadh local noon) — UNIFICATION-1 logic untouched.

---

## 6. What this phase does NOT do

- 🚫 Does NOT change MoonCalc (`js/moon.js`).
- 🚫 Does NOT change moon chart logic (`js/moon-chart.js`).
- 🚫 Does NOT change moon age, illumination, phase name, or any numeric value.
- 🚫 Does NOT change Mecca-canonical logic for `/moon-today`.
- 🚫 Does NOT change city-local-noon logic for `/moon-in-{city}`.
- 🚫 Does NOT change SEO meta, canonical, hreflang, JSON-LD, or sitemap.
- 🚫 Does NOT change CSS, layout, or any UI structure.
- 🚫 Does NOT add or remove any UI element.
- 🚫 Does NOT add new dependencies.
- 🚫 Does NOT change phase-name translations (those live in different i18n keys — out of scope here).
- 🚫 Does NOT start any general UI-polish phase.

---

## 7. Verdict

✅ **10 of 10 languages updated, 0 numeric values changed, 0 calculation regressions, 0 SEO changes, 0 fallback-leak bugs.**

Every `/moon-today` and `/{lang}/moon-today` route now serves a clearer, more precise summary bar in its native language. Every `/moon-in-{city}` route automatically inherits the same refined labels (they reuse the exact same `moon-summary-line` component and i18n keys).

🛑 No further changes planned in this scope.
