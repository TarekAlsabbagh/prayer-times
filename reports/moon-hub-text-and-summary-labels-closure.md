# Moon-hub text + Moon-summary labels — Unified Closure

**Status:** ✅ **CLOSED — user-approved 2026-05-23**

Combined formal closure for two consecutive text/i18n phases on the moon hub and the moon summary bar:

1. **MOON-TODAY-HUB-TEXT-REFINEMENT-1** — implementation commit `16e3c4b`
2. **MOON-SUMMARY-LABELS-I18N-POLISH-1** — implementation commit `678fdf4`

Both phases were implementation-only text/i18n refinements with zero math/algorithm/SEO impact. This document is the docs-only closure commit; no further code changes are made here.

---

## 1. Phase 1 — MOON-TODAY-HUB-TEXT-REFINEMENT-1

Implementation commit: **`16e3c4b`** on `origin/main`.

### Goal
Keep `/moon-today` as a **generic moon Hub**, not a Mecca-specific city page, while still framing Mecca as the canonical default reference per MOON-TODAY-MAKKAH-CANONICAL-REFERENCE-1 (commit `1b54433`).

### What changed
- Page title kept generic: `حالة القمر اليوم` (no "in Mecca").
- Arabic hero copy tightened across 7 strings (subtitle, search placeholder, geo button, manual-pick button, privacy microcopy, two trust badges).
- New i18n key `moon.hub.smart_pill_prefix_default` = `المرجع الافتراضي:`.
- Smart-pill logic in `js/app.js` (`_wireMoonHubSmartPill._show`) now uses the default-reference framing **only when** `lang === 'ar' && _isMoonTodayHub && _isMeccaSlug`. For any other case (real user pick, non-AR locale) the original `آخر مدينة اخترتها:` framing is preserved.

### Files
- `js/i18n/ar.js`, `js/i18n.js` — 8 AR strings updated + 1 new key.
- `js/app.js` — smart-pill prefix logic + cache-buster `v=680→v=681`.
- `index.html` — 7 inline AR SSR defaults updated + cache-busters `app.js v=680→v=681`, `i18n.js v=173→v=174`.
- `server.js` — `_i18nVersion '172'→'174'`.

---

## 2. Phase 2 — MOON-SUMMARY-LABELS-I18N-POLISH-1

Implementation commit: **`678fdf4`** on `origin/main`.

### Goal
Polish the four labels in the moon summary bar (`#moon-summary-line`) across **all 10 supported languages**, removing the "29.5 day fixed month" implication and clarifying "Illumination percentage" / "Moon age" wording.

### What changed
Per-language final wording:

| Lang | Phase | Illum | Age | Age suffix |
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

(TR/UR/BN use a deliberate split so the natural mid-phrase number placement is preserved within the existing `[label][number][suffix]` HTML template.)

### Files
- `js/i18n/{ar,en,fr,de,tr,es,id,ms,ur,bn}.js` — per-lang bundles updated (8 added new `age_suffix` keys).
- `js/i18n.js` — legacy bundle: all 10 lang sections mirrored.
- `index.html` — 3 inline AR SSR defaults updated + cache-buster `i18n.js v=174→v=175`.
- `server.js` — `_i18nVersion '174'→'175'`.

### Side benefit
Incidentally fixed a latent **Arabic-leak bug** on `/{lang}/moon-today` for fr/de/tr/es/id/ms/ur/bn: the `age_suffix` slot used to fall back to the AR inline default because those bundles never declared the key. All 10 langs now provide their own correct value.

---

## 3. Files changed across BOTH phases (deduplicated)

| File | Phase 1 | Phase 2 |
|---|---|---|
| `index.html` | ✓ (hero copy + busters) | ✓ (summary inline + buster) |
| `server.js` | ✓ (`_i18nVersion`) | ✓ (`_i18nVersion`) |
| `js/i18n.js` | ✓ (AR hero) | ✓ (10-lang summary) |
| `js/i18n/ar.js` | ✓ (hero) | ✓ (summary) |
| `js/i18n/en.js` | — | ✓ (summary) |
| `js/i18n/fr.js` | — | ✓ (summary) |
| `js/i18n/de.js` | — | ✓ (summary) |
| `js/i18n/tr.js` | — | ✓ (summary) |
| `js/i18n/es.js` | — | ✓ (summary) |
| `js/i18n/id.js` | — | ✓ (summary) |
| `js/i18n/ms.js` | — | ✓ (summary) |
| `js/i18n/ur.js` | — | ✓ (summary) |
| `js/i18n/bn.js` | — | ✓ (summary) |
| `js/app.js` | ✓ (smart-pill prefix logic) | **NOT touched** |

**Files NOT touched across both phases:** `js/moon.js` (MoonCalc), `js/moon-chart.js`, `js/hijri-date.js`, `js/hijri-umm-al-qura.js`, `db/hijri/umm-al-qura.json`, all `db/places/*` curated data, CSS, sitemap, JSON-LD logic.

---

## 4. Acceptance Criteria — final check-off

| # | Criterion | Status |
|---|---|---|
| 1 | `/moon-today` remained a generic Hub (not converted into a Mecca-specific city page) | ✅ PASS |
| 2 | Mecca is shown only as `المرجع الافتراضي` (default reference), never as page identity | ✅ PASS |
| 3 | Arabic Hub copy refined (subtitle, placeholder, geo/pick buttons, privacy text, two badges) | ✅ PASS |
| 4 | Smart-pill prefix logic correct: "المرجع الافتراضي:" for Mecca-default on /moon-today AR; "آخر مدينة اخترتها:" preserved for real user picks and other locales | ✅ PASS |
| 5 | Moon summary labels updated in all 10 supported languages (ar/en/fr/de/tr/es/id/ms/ur/bn) | ✅ PASS |
| 6 | No Arabic fallback leaking onto non-Arabic pages; no English fallback leaking onto non-English pages | ✅ PASS |
| 7 | No change to any calculation pipeline (MoonCalc / moon-chart / app.js value rendering) | ✅ PASS |
| 8 | MoonCalc (`js/moon.js`) source unchanged (`git diff --quiet` clean) | ✅ PASS |
| 9 | Illumination % value unchanged (still 49.13 % at probe instant) | ✅ PASS |
| 10 | Moon age value unchanged (computed by same MoonCalc routine, unchanged) | ✅ PASS |
| 11 | `/moon-in-{city}` city pages unaffected — Riyadh still 3 × 49.13 % across Summary/Chart/Table | ✅ PASS |
| 12 | SEO / canonical / hreflang / JSON-LD / sitemap unchanged | ✅ PASS |
| 13 | No general UI polish started; no CSS / layout changes | ✅ PASS |
| 14 | No new dependency, no external API, no `npm install` | ✅ PASS |
| 15 | All tests passed (`node -c` × 12 files OK, 13 routes 200, 40 i18n strings verified) | ✅ PASS |

**15 / 15 criteria met.**

---

## 5. Test results summary (recap)

- **Syntax check:** `node -c` PASS on all 12 modified JS files across both phases.
- **HTTP route smoke:** 13/13 PASS — 10 langs of `/moon-today` + `/moon-in-riyadh` + `/qibla` + `/`.
- **SSR i18n verification:** Sampled `data-i18n="moon.summary.{phase|illum|age|age_suffix}"` on all 10 `*/moon-today` routes — every one of the 40 strings serves the correct localized value with no cross-lang leak.
- **SSR Hub copy verification:** `/moon-today` serves all 7 refined Arabic strings inline; `/en/moon-today` still serves English (no leak).
- **Numeric values:** unchanged — code paths feeding `id="moon-summary-illum"` / `id="moon-summary-age"` / `id="moon-summary-phase"` were not modified; same MoonCalc routine, same Mecca-canonical instant for `/moon-today`, same city-local-noon for `/moon-in-{city}`.

---

## 6. Closure log

- **2026-05-23** — Phase 1 (`16e3c4b`) implemented, tested, and pushed to `origin/main`.
- **2026-05-23** — Phase 2 (`678fdf4`) implemented, tested, and pushed to `origin/main`.
- **2026-05-23** — User reviewed both phases verbatim and approved unified closure. Per-phase acceptance lists confirmed: `/moon-today` stays Hub; Mecca framed as default reference only; 10-lang summary labels updated; no calculations changed; no SEO change; no UI polish started.
- **2026-05-23** — This unified closure report created. Docs-only closure commit pushed to `origin/main`.

🛑 **No new phase started.** Next chapter (UI polish on `/moon-today` or `/moon-in-{city}`) awaits explicit user direction.
