# ZAKAT-CALCULATOR-I18N-EXPAND-8-LANGS-1 — Closure Report

**Date:** 2026-05-31
**Status:** ✅ READY FOR PRE-PUSH APPROVAL
**Scope:** Translate the 8 new/updated zakat keys (added in commit `87a7880`) to the remaining 8 languages — was previously AR + EN only, with EN fallback on the other 8 pages.

---

## 1. Problem

In the previous commit `87a7880` (ZAKAT-CALCULATOR-UI-CONTENT-UX-IMPROVEMENT-1), 8 zakat keys were added/updated **but only in `js/i18n/ar.js` + `js/i18n/en.js`**:
- `zakat.hero.title` (updated)
- `zakat.hero.subtitle` (updated)
- `zakat.actions.download_pdf` (new)
- `zakat.empty.subtitle` (new)
- `zakat.compact_disclaimer.text` (new)
- `zakat.edu.title` (new)
- `zakat.edu.intro` (new)
- `zakat.breadcrumb.label` (new)

The other 8 lang pages (`bn/de/fr/tr/ur/id/es/ms`) fell back to EN text for these keys — visible to user on `/bn/zakat-calculator` showing "Zakat Calculator" breadcrumb, English compact disclaimer, English "Download Zakat PDF" button, English edu intro, etc.

---

## 2. Solution

Wrote a single idempotent Node script `scripts/_zakat_i18n_expand_8_langs.mjs` that:
- Replaces 2 existing keys (`zakat.hero.title` + `zakat.hero.subtitle`) per file → 8 × 2 = 16 replacements
- Inserts 6 new keys per file (5 after `zakat.disclaimer.body` + 1 after `zakat.actions.copy`) → 8 × 6 = 48 insertions
- Total atomic mutations: **64**

Verified post-run: `replaced=16 / added=48 / skipped=0` on a fresh run. Re-running is safe (idempotent — detects already-present keys and skips).

---

## 3. Files modified (10)

| File | Lines | Change |
|---|---|---|
| `js/i18n/bn.js` | +9 / −2 | 2 replaced (hero title/subtitle) + 6 new keys with Bengali translations |
| `js/i18n/de.js` | +9 / −2 | same — German translations |
| `js/i18n/es.js` | +9 / −2 | same — Spanish translations |
| `js/i18n/fr.js` | +9 / −2 | same — French translations |
| `js/i18n/id.js` | +9 / −2 | same — Indonesian translations |
| `js/i18n/ms.js` | +9 / −2 | same — Malay translations |
| `js/i18n/tr.js` | +9 / −2 | same — Turkish translations |
| `js/i18n/ur.js` | +9 / −2 | same — Urdu translations |
| `server.js` | +1 / −1 | `_i18nVersion '188' → '189'` to invalidate cached per-lang bundles for returning visitors |
| `sw.js` | +14 / −1 | `CACHE_VERSION 'v388' → 'v389'` for SW precache invalidation + 10-line header doc-comment |

Plus untracked workflow helper: `scripts/_zakat_i18n_expand_8_langs.mjs` (NOT committed — workflow artifact; can be deleted post-merge or kept for future similar batches).

---

## 4. Translations table (8 keys × 8 langs = 64 strings)

### `zakat.hero.title`

| Lang | New value |
|---|---|
| bn | যাকাত ক্যালকুলেটর — সহজেই আপনার যাকাত হিসাব করুন |
| de | Zakat-Rechner — Berechnen Sie Ihre Zakat Einfach |
| es | Calculadora de Zakat — Calcule Su Zakat Fácilmente |
| fr | Calculateur de Zakat — Calculez Votre Zakat Facilement |
| id | Kalkulator Zakat — Hitung Zakat Anda dengan Mudah |
| ms | Kalkulator Zakat — Kira Zakat Anda dengan Mudah |
| tr | Zekât Hesaplayıcı — Zekâtınızı Kolayca Hesaplayın |
| ur | زکوٰۃ کیلکولیٹر — اپنی زکوٰۃ آسانی سے شمار کریں |

### `zakat.actions.download_pdf`

| Lang | New value |
|---|---|
| bn | যাকাত PDF ডাউনলোড করুন |
| de | Zakat-PDF herunterladen |
| es | Descargar Zakat PDF |
| fr | Télécharger la Zakat en PDF |
| id | Unduh Zakat PDF |
| ms | Muat Turun Zakat PDF |
| tr | Zekât PDF'sini İndir |
| ur | زکوٰۃ پی ڈی ایف ڈاؤن لوڈ کریں |

### `zakat.breadcrumb.label`

| Lang | New value |
|---|---|
| bn | যাকাত ক্যালকুলেটর |
| de | Zakat-Rechner |
| es | Calculadora de Zakat |
| fr | Calculateur de Zakat |
| id | Kalkulator Zakat |
| ms | Kalkulator Zakat |
| tr | Zekât Hesaplayıcı |
| ur | زکوٰۃ کیلکولیٹر |

(Other 5 keys — subtitle, empty.subtitle, compact_disclaimer.text, edu.title, edu.intro — are similarly translated; see git diff for the full list. All 8 lang files are syntactically valid: `node --check js/i18n/{lang}.js` exits 0 for all 8.)

---

## 5. Verification results

### A. Per-lang bundle delivery (curl `localhost:8080/js/i18n/{lang}.js?v=189`)

All 8 langs serve the new keys correctly. Sample (BN, full 8 keys):
```
"zakat.hero.title":"যাকাত ক্যালকুলেটর — সহজেই আপনার যাকাত হিসাব করুন"
"zakat.hero.subtitle":"আপনার অর্থ, সঞ্চয়, সোনা, রুপা এবং বিনিয়োগের উপর যাকাত আনুমানিকভাবে হিসাব করুন — স্পষ্ট নিসাব ও ২.৫% হারে।"
"zakat.actions.download_pdf":"যাকাত PDF ডাউনলোড করুন"
"zakat.empty.subtitle":"নিচে আপনার সম্পদের মান প্রবেশ করানোর সাথে সাথে এখানে ফলাফল দেখা যাবে।"
"zakat.compact_disclaimer.text":"নোট: এই ক্যালকুলেটরটি কেবল আনুমানিক হিসাবের জন্য, কোনো ফতোয়া নয়। বিশেষ পরিস্থিতিতে বিশ্বস্ত আলেমের সাথে পরামর্শ করুন।"
"zakat.edu.title":"অর্থের যাকাত সম্পর্কে জানুন"
"zakat.edu.intro":"যখন কোনো সম্পদ নিসাবে পৌঁছায় এবং তার উপর এক চান্দ্রবর্ষ (হাওল) অতিবাহিত হয়, তখন সাধারণত নিট যাকাতযোগ্য সম্পদের ২.৫% হারে যাকাত হিসাব করা হয়।"
"zakat.breadcrumb.label":"যাকাত ক্যালকুলেটর"
```

Spot-check `zakat.actions.download_pdf` across all 7 other langs all confirm native text (de: "Zakat-PDF herunterladen", fr: "Télécharger la Zakat en PDF", tr: "Zekât PDF'sini İndir", ur: "زکوٰۃ پی ڈی ایف ڈاؤن لوڈ کریں", id: "Unduh Zakat PDF", es: "Descargar Zakat PDF", ms: "Muat Turun Zakat PDF").

### B. 15 URL regression (10 lang variants of zakat + 5 sibling pages)

```
/zakat-calculator         200  /en/zakat-calculator      200  /bn/zakat-calculator      200
/ur/zakat-calculator      200  /fr/zakat-calculator      200  /de/zakat-calculator      200
/tr/zakat-calculator      200  /id/zakat-calculator      200  /es/zakat-calculator      200
/ms/zakat-calculator      200  /prayer-times-in-riyadh   200  /moon-today               200
/qibla-in-riyadh          200  /azkar/morning-azkar      200  /hijri-calendar           200
```

### C. SSR HTML references correct i18n version per lang

`/bn/zakat-calculator` references `js/i18n/bn.js?v=189` ✓ (and similarly for the other 7 langs).

### D. Service Worker

`CACHE_VERSION="v389"` served on `/sw.js` ✓.

### E. Syntax check (all 8 lang files)

`node --check js/i18n/{lang}.js` → exit 0 for all 8 ✓.

---

## 6. What is NOT changed (scope fence)

| ❌ Untouched | Reason |
|---|---|
| `js/i18n/ar.js` + `js/i18n/en.js` | Already had the keys from commit 87a7880 — no change |
| `js/i18n.js` (server-loaded combined) | Already had the keys for AR + EN; the modular per-lang bundles loaded by the client are the runtime source of truth, server-loaded is only used for FAQPage JSON-LD generation (AR + EN entries) |
| `index.html` | No markup change |
| `css/style.css` | No styling change |
| `js/app.js` | No JS change |
| Calc logic, FSM, routing, sitemap, canonical, JSON-LD | All untouched |
| Other (non-zakat) i18n keys in the 8 lang files | Only the 2 specified keys replaced + 6 new keys appended; ALL other zakat / non-zakat keys preserved byte-for-byte |

---

## 7. Cache-busters

| Asset | Before | After |
|---|---|---|
| `js/i18n/{lang}.js` server-side cache-buster | `?v=188` | `?v=189` |
| `sw.js CACHE_VERSION` | `'v388'` | `'v389'` |
| `css/style.css` | `?v=463` | **UNCHANGED** |
| `js/app.js` | `?v=746` | **UNCHANGED** |

Only i18n bundles + SW changed — no client-side JS / CSS / HTML touched.

---

## 8. Pre-push checklist

| # | البند | الحالة |
|---|---|---|
| 1 | Single ticket scope (i18n translations only) | ✅ |
| 2 | No data mutations | ✅ |
| 3 | No JS / CSS / HTML / server.js / SSR changes (beyond _i18nVersion bump) | ✅ |
| 4 | All 8 lang files syntactically valid | ✅ |
| 5 | All 8 keys present in all 8 lang files | ✅ |
| 6 | 15 URL regression (10 zakat lang variants + 5 sibling pages) all 200 | ✅ |
| 7 | sw + i18n cache-busters bumped | ✅ |
| 8 | The workflow helper script (`scripts/_zakat_i18n_expand_8_langs.mjs`) is committed for auditability (lets a reviewer re-run + verify) | optional |
| 9 | Closure report self-contained | ✅ |
| 10 | **Awaiting user approval before push** | ⏳ |

---

## 9. Proposed commit message

```
fix(zakat-i18n): ZAKAT-CALCULATOR-I18N-EXPAND-8-LANGS-1 — translate 8 zakat keys to the remaining 8 langs

Previously bn/de/fr/tr/ur/id/es/ms fell back to EN text for the
zakat keys added/updated in 87a7880 (ZAKAT-CALCULATOR-UI-CONTENT-UX-
IMPROVEMENT-1) — visible to users as English breadcrumb / compact
disclaimer / "Download Zakat PDF" button / edu section title+intro /
empty-state subtitle / hero title+subtitle on non-AR/EN pages.

Applied via an idempotent Node script (scripts/_zakat_i18n_expand_8_
langs.mjs) that does 16 replacements (8 langs × 2 updated hero keys)
+ 48 insertions (8 langs × 6 new keys) = 64 atomic per-lang-file
mutations. Output: replaced=16 added=48 skipped=0.

Keys covered (all 8 langs):
  - zakat.hero.title          (replace)
  - zakat.hero.subtitle       (replace)
  - zakat.actions.download_pdf (new)
  - zakat.empty.subtitle       (new)
  - zakat.compact_disclaimer.text (new)
  - zakat.edu.title           (new)
  - zakat.edu.intro           (new)
  - zakat.breadcrumb.label    (new)

Bumps: server.js _i18nVersion 188->189 (forces returning visitors
to fetch fresh per-lang bundles), sw v388->v389. No css/js/html
changes — text-only.

Verified: all 8 lang bundles syntactically valid (node --check),
all 10 /zakat-calculator lang variants HTTP 200, 5 sibling regression
pages HTTP 200, /bn/zakat-calculator serves "যাকাত PDF ডাউনলোড করুন"
etc. natively from js/i18n/bn.js?v=189.

Untouched: index.html, css/style.css, js/app.js, calc logic, FSM,
routing, sitemap, canonical, JSON-LD, ar.js/en.js (already had keys),
all other zakat + non-zakat keys in the 8 lang files (byte-for-byte
preserved).
```
