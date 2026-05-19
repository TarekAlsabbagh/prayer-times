# PLACE-NAMES-UR-PK-3-APPLY — Apply audit trail

**Run at**: 2026-05-19T10:24:48.773Z
**Country**: PK (17 ASIA-1D-PK-MCF entries only)
**Total rows applied**: 17
**Already-applied (skipped, idempotent)**: 0
**names.ur newly set (was absent)**: 17
**names.ur overwrote an existing value**: 0
**aliases.ur added**: 14
**10 PK seed entries touched (must be 0)**: 0
**43 ASIA-1D-PK clean entries touched (must be 0)**: 0

## Applied rows (sorted by slug)

| slug | names.ur applied | aliases.ur added |
| --- | --- | ---: |
| `badin` | بدین | 0 |
| `bannu` | بنوں | 0 |
| `chiniot` | چنیوٹ | 1 |
| `chitral` | چترال | 1 |
| `chunian` | چونیاں | 1 |
| `dera-ghazi-khan` | ڈیرہ غازی خان | 1 |
| `gujar-khan` | گجر خاں | 2 |
| `gujranwala` | گوجرانوالہ | 1 |
| `jacobabad` | جیکب آباد | 1 |
| `kharian` | کھاریاں | 1 |
| `lala-musa` | لالہ موسیٰ | 1 |
| `muzaffargarh` | مظفر گڑھ | 1 |
| `new-mirpur-city` | نیا میرپور شہر | 1 |
| `rawalakot` | راولاکوٹ | 1 |
| `rohri` | روہڑی | 0 |
| `sahiwal` | ساہیوال | 1 |
| `umarkot` | عمرکوٹ | 0 |

## Aliases explicitly NOT added (audit)

| slug | dropped alias | reason |
| --- | --- | --- |
| `bannu` | `بنّو` | shadda diacritic — not preferred |
| `sahiwal` | `ساہِيوال` | kasra diacritic-heavy variant |
| `lala-musa` | `لاله موسيٰ` | Arabic ه + alif-superscript U+0670 variant |
| `sahiwal` | `ساهیوال، پاکستان` | country suffix |
| `dera-ghazi-khan` | `دیره غازی‌خان، پاکستان` | country suffix + ZWNJ |
| `chiniot` | `چنیوت، پاکستان` | country suffix |
| `muzaffargarh` | `مظفر گره، پاکستان` | country suffix |
| `jacobabad` | `جیکب‌آباد، پاکستان` | ZWNJ + country suffix |
| `dera-ghazi-khan` | `ډېره غازي خان` | Pashto ډ + ې — fails clean-Urdu-script check |
| `chiniot` | `چنيوټ` | Pashto ټ |
| `jacobabad` | `جيڪب آباد` | Sindhi ڪ |
| `jacobabad` | `jyڪb abad` | Latin mojibake + Sindhi ڪ |
| `umarkot` | `امرڪوٽ` | Sindhi ڪ + ٽ |
| `umarkot` | `amrڪwٽ` | Latin mojibake + Sindhi |
| `rohri` | `روھڙي` | Sindhi ڙ |
| `rohri` | `rwھڙy` | Latin mojibake + Sindhi ڙ |
| `chunian` | `تصیل چونیاں` | admin prefix "تصیل" (misspelling of تحصیل) |
| `chitral` | `چھترار` | semantic mismatch (different word — was also dropped in MCF Arabic) |

## Backup

Pre-apply backup written to: `C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json.prePlaceNamesUrPk3.bak`
Restore command: `cp curated-places.json.prePlaceNamesUrPk3.bak curated-places.json`

## What this apply did NOT do

- ❌ `names.ar` not modified (preserves ASIA-1D-PK-MCF NAME_AR_FIXES)
- ❌ `names.en` not modified
- ❌ 10 PK seed entries not touched (UR-PK-1 baseline)
- ❌ 43 ASIA-1D-PK clean entries not touched (UR-PK-2 baseline)
- ❌ Other countries not touched
- ❌ No code changes (server.js, js/app.js, fillLangMap, index.html)
- ❌ No runtime translation / API / browser auto-translate
