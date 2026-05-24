# MOON-DATED-PAGE-HERO-CONTENT-UI-CLEANUP-1 — Closure

**Date:** 2026-05-24
**Status:** 🟢 IMPLEMENTED (awaiting user approval for `git push`)
**Scope:** `/moon-in-{city}/{YYYY-MM-DD}` date pages only (AR only; other 9 langs unchanged per user-provided text scope).
**Cache-buster:** `js/app.js?v=692 → v=693`.

---

## 1 — User scope

The user requested two changes on `/moon-in-{city}/{YYYY-MM-DD}` hero:

1. **Remove the "📅 عرض حسب التاريخ الميلادي" button** — the Gregorian↔Hijri toggle that linked to broken Hijri URLs.
2. **Reword the AR description** — make the prose lighter ("يكون القمر" instead of "القمر في طور"; "يظهر القمر فلكيًا ضمن كوكبة" instead of "ويتواجد حاليًا في كوكبة"; drop the "(دائرة البروج)" parenthetical; cleaner closing clause).

---

## 2 — Button removal — ALREADY COVERED by commit `a827696`

The `#moon-cal-toggle` element + its handlers + its CSS were fully removed in the prior unpushed commit:

> `a827696` — fix(moon,ux): MOON-DATE-PAGE-HIJRI-TOGGLE-REMOVAL-1 — remove dead Gregorian↔Hijri toggle from moon date pages

That commit (still local, pushed in the same batch as this one) removes:
- `<a id="moon-cal-toggle" hidden href="#">` from `index.html`
- `_calToggleEl` setup block (43 lines) from `js/app.js`
- `.moon-cal-toggle` CSS rules from `css/style.css`

After push, the screenshot's "📅 عرض حسب التاريخ الميلادي" button will be gone from every `/moon-in-{city}/{YYYY-MM-DD}` page in every language. **No additional button removal is needed in this Phase A commit** — the present commit only adds the AR description rewording per user's "ثانيًا — مراجعة المحتوى" + "ثالثًا — الفقرة التفسيرية" sections.

---

## 3 — AR description rewording (this commit's actual change)

**Key:** `moon.intro_date_template` (Arabic only)
**Touched files (both kept in sync):**
- `js/i18n/ar.js` line 916 (per-lang module — primary)
- `js/i18n.js` line 873 (legacy consolidated bundle)

### Before
```
في {city}، يوم {date}، القمر في طور {phaseIcon} {phaseName} بنسبة إضاءة تبلغ {illum}٪، ويبلغ عمره {age} يومًا منذ آخر محاق. ويتواجد حاليًا في كوكبة {zodiacIcon} {zodiacName} وفق موقعه على المسار الظاهري للشمس (دائرة البروج). تُحسب هذه البيانات باستخدام خوارزميات فلكية دقيقة وفق منهجيات Jean Meeus، بينما يتم تحديد الكوكبة بناءً على موقع القمر ضمن الحدود المعتمدة للكوكبات فلكيًا.
```

### After
```
في {city}، يوم {date}، يكون القمر في طور {phaseIcon} {phaseName}، بنسبة إضاءة تبلغ {illum}٪، وعمره {age} يومًا منذ آخر محاق. ويظهر القمر فلكيًا ضمن كوكبة {zodiacIcon} {zodiacName} وفق موقعه على المسار الظاهري للشمس. تُحسب هذه البيانات باستخدام خوارزميات فلكية دقيقة وفق منهجيات Jean Meeus، بينما تُحدَّد الكوكبة بناءً على موقع القمر ضمن الحدود الفلكية المعتمدة للكوكبات.
```

### Changes (verbatim from user spec)

| # | Phrase | Was | Now |
|---|---|---|---|
| 1 | Lead verb | `القمر في طور` | `يكون القمر في طور` |
| 2 | Age clause | `ويبلغ عمره {age} يومًا` | `وعمره {age} يومًا` |
| 3 | Constellation verb | `ويتواجد حاليًا في كوكبة` | `ويظهر القمر فلكيًا ضمن كوكبة` |
| 4 | Zodiac parenthetical | `(دائرة البروج)` | removed |
| 5 | Closing verb form | `يتم تحديد الكوكبة` (passive periphrasis) | `تُحدَّد الكوكبة` (single short passive) |
| 6 | Closing noun phrase | `الحدود المعتمدة للكوكبات فلكيًا` | `الحدود الفلكية المعتمدة للكوكبات` |

### Constraints preserved (verbatim from user spec)

- ✅ "لا تغيّر القيم" — `{phaseIcon}`, `{phaseName}`, `{illum}`, `{age}`, `{zodiacIcon}`, `{zodiacName}` placeholders all unchanged.
- ✅ "لا تغيّر اسم الكوكبة" — `{zodiacName}` interpolation flows from the same astronomy code.
- ✅ "لا تغيّر الحسابات" — no JS calculation touched.

---

## 4 — Other 9 langs (en/fr/tr/ur/de/id/es/bn/ms): UNCHANGED

The user provided AR-only rewording. Each of the other 9 langs already has a native-phrasing translation of the template in its own `js/i18n/{lang}.js` (and the consolidated `js/i18n.js`). Mechanically re-phrasing them in this commit would risk introducing translation errors without a native review.

**Deferred follow-up:** if the user later requests parallel polish for any of the other 9 langs, that becomes its own phase (e.g. `MOON-DATED-PAGE-HERO-CONTENT-UI-CLEANUP-1-EN`, etc.).

---

## 5 — Verification

### A. Static checks
- `node --check js/app.js`: OK
- `node --check server.js`: OK
- `_smoke_hijri_stage_b1_unit`: 68/68 ✅

### B. i18n key present in both files (grep)
```
$ grep -c "موقع القمر ضمن الحدود الفلكية المعتمدة للكوكبات" js/i18n.js js/i18n/ar.js
js/i18n.js:1
js/i18n/ar.js:1
```

### C. Critical preservation
| Test | Expected | Status |
|---|---|---|
| `/moon-in-jeddah/2026-05-31` HTTP | 200 | ✅ |
| `/moon-in-riyadh/1447-12-06` HTTP (strict policy) | 404 | ✅ |
| canonical on `/moon-in-jeddah/2026-05-31` | `…/moon-in-jeddah/2026-05-31` (Gregorian self) | ✅ |
| Sitemap Hijri moon URLs | 0 | ✅ |
| No new `/hijri-date/…` links added | 0 new | ✅ |
| No new query params | none | ✅ |
| Placeholder count in new AR template | 6 (city, date, phaseIcon, phaseName, illum, age, zodiacIcon, zodiacName = 8) | ✅ (matches old) |

---

## 6 — Files changed (3 source + 1 report)

| File | Change |
|---|---|
| `js/i18n/ar.js` | line 916 — `moon.intro_date_template` reworded (1 line) |
| `js/i18n.js` | line 873 — same key, same rewording (legacy bundle kept in sync) |
| `index.html` | cache-buster `js/app.js?v=692 → v=693` |
| `reports/moon-dated-page-hero-content-ui-cleanup-1-closure.md` | NEW |

---

## 7 — What was NOT changed

| Item | Touched? |
|---|---|
| MoonCalc / Umm al-Qura / calculations | NO |
| Phase / illumination / age / zodiac values | NO (placeholders preserve all astronomical data) |
| Constellation name resolution | NO |
| canonical / hreflang / sitemap / JSON-LD | NO |
| Strict Gregorian route policy | NO (still 404 on `/1447-…`) |
| `/hijri-date` / `/hijri-calendar` links | NO new ones added |
| H1 / breadcrumbs / URL | NO |
| Summary chip bar | NO (the chip "القمر في هذا اليوم: البدر · نسبة الإضاءة: 100% · عمر القمر: 14.8 يوم" already had clean spacing per user — kept as-is) |
| Other 9 langs (en/fr/tr/ur/de/id/es/bn/ms) | NO |
| Date navigation bar (covered by sibling Phase B `MOON-DATED-PAGE-DATE-NAV-CLEANUP-1`) | NO (in this commit) |

---

## 8 — Closure checklist

- [x] User spec read carefully — 5 specific AR wording changes implemented verbatim.
- [x] AR template updated in both `js/i18n.js` + `js/i18n/ar.js` (kept in sync).
- [x] All 8 placeholders preserved — no calculation/value change.
- [x] Button removal acknowledged as covered by sibling commit `a827696`.
- [x] Other 9 langs intentionally left as-is.
- [x] Strict Gregorian route policy preserved (`/1447-…` still 404).
- [x] canonical / hreflang / sitemap / JSON-LD unchanged.
- [x] Cache-buster bumped.
- [x] Carry-forward smoke 68/68.
- [x] `node --check` OK on both server.js + app.js.
- [x] Closure report written.
