# بناء بيانات القرآن الكامل (114 سورة) — P1a

> تذكرة `QURAN-AR-DATA-BUILD-ALL-114-1` + بوابة النظافة `…-PRECOMMIT-HYGIENE-AND-LOCAL-COMMIT-1`
> الأساس `063fee7` · الفرع `quran-ar-data-build-all-114-1` · **بيانات فقط · لا Push · لا Merge · لم تُبدأ P1b.**

---

# PRE-COMMIT VERIFIED

## 1) الجرد المصحَّح — مطابق تمامًا لـ`git status --short`
> **تصحيح للتقرير السابق:** ذكرتُ «معدّلة (5)» ثم عدّدتُ 6، وأغفلتُ ملف التقرير. الجرد الصحيح بعد التنظيف:

| الفئة | العدد |
|------|------|
| **معدَّلة (M)** | **4** |
| **جديدة (A)** | **118** |
| **محذوفة (D)** | **0** |
| **الإجمالي** | **122** |

**المعدَّلة (4):**
1. `.gitignore`
2. `scripts/quran/build.mjs`
3. `data/quran/kfgqpc-hafs-v2-0/surahs/021.json`
4. `data/quran/kfgqpc-hafs-v2-0/metadata/basmala.json`

**الجديدة (118):** `data/quran/kfgqpc-hafs-v2-0/surahs/{001…114}.json` **عدا 021** = **113 ملفًا** · `data/quran/kfgqpc-hafs-v2-0/metadata/juz.json` · `data/quran/kfgqpc-hafs-v2-0/metadata/surah-checksums.json` · `scripts/_smoke_quran_data_all_114_1.mjs` · `scripts/_smoke_quran_data_deterministic_build_1.mjs` · `reports/quran-data-build-all-114-precommit.md`

**مستبعَدة عمدًا (خارج التغييرات النهائية):** `metadata/chapters.json` · `source-manifest.json`

## 2) نتيجة تنظيف نهايات الأسطر — والسبب الحقيقي
**تصحيح تشخيصي:** لم يكن السبب «تطبيع نهايات أسطر» كما ذكرتُ سابقًا، بل **stat-cache قديم (mtime)** بعد أن أعاد البانِي كتابة ملفين بمحتوى مطابق:
- `git ls-files --eol` → `i/lf w/lf` (المستودع LF، لا تحويل).
- `git diff` على الملفين → **فارغ** (لا فرق محتوى).
- المقارنة البايتية: `chapters.json` 19541 B و`source-manifest.json` 982 B — **متطابقان تمامًا** مع `063fee7`.
- `git update-index --refresh` أزال الـ`M` الوهمي.

**آلية موثَّقة اكتُشفت:** `core.autocrlf=true` ⇒ **`git checkout` يكتب CRLF** (مثال: `source-manifest.json` = 1004 B / 22 زوج CRLF) بينما **البانِي يكتب LF** (982 B). المحتوى واحد وgit يراهما متطابقين (مرشِّح clean)، لكن البايتات على القرص تختلف.
**الأثر:** كشف هذا خللًا في اختباري الحتمي (كان يقارن ملفًا مُستعادًا من Git بمخرَج بناء) → أُصلح ليقارن **بناءً ببناء** (بناء تطبيعي أول قبل اللقطة).

**الإجراء النهائي:** استُعيد الملفان بـ`git checkout 063fee7 --` وتُركا كما هما ⇒ **`git status` نظيف منهما، ولن يدخلا الـcommit.** لم تُلمس `.gitattributes`.

## 3) `source-manifest.json` — خارج النطاق
لم يكن ضمن قائمة الملفات المسموح تعديلها. **القرار: استُعيد من `063fee7` ولن يُدرَج.** لا حاجة لتوسيع النطاق: البانِي يعيد كتابته لكنه **يحفظ `downloadedAt` الأصلي فينتج بايتات مطابقة تمامًا** ⇒ صفر تغيير ⇒ لا شيء يُلتزم به. لا حقل تغيّر.

## 4) التحقق من الميتاداتا بعد التنظيف
| الملف | النتيجة |
|------|--------|
| `chapters.json` | **لم يتغير** — البانِي يعيد إنتاج نفس البايتات (19541 B) |
| `source-manifest.json` | **لم يتغير** — نفس البايتات (982 B) |
| `basmala.json` | **تغيّر عمدًا وحتميًا**: 902→942 B بإضافة `rawEndSeparatorCodePoint` (مطلب §4 من P1a: تسجيل الفاصل لكل آية؛ والبسملة مشتقة من 1:1) |
| `021.json` | **إضافات فقط** — انظر أدناه |

### مقارنة حقول `021.json`: `063fee7` ↔ المخرجات الجديدة
| الحقل | الفرق |
|------|------|
| `textUthmaniRaw` | **0** |
| `textUthmaniBody` | **0** |
| `textImlaei` | **0** |
| ترتيب الآيات (112) | **0** |
| الترويسة (surah/nameAr/ayahCount/firstPage/lastPage) | مطابقة |
| **الإضافات فقط** | `basmalaMode: "separate"` (مستوى السورة) + `rawEndSeparatorCodePoint` (لكل آية) — **+113/−0** |

## 5) البصمات الكاملة — الخوارزمية: **SHA-256** (64 خانة، المحتوى المعتمَد LF)
| الملف | SHA-256 |
|------|---------|
| **ROLLUP (114 ملف سورة)** | `B92C62F0A2CD695D6A9E77CB5F32C0472A4EC02804DC632504E4ACD462F79B69` |
| `surahs/001.json` | `B442ACBE65EF68144EEC2139247C3E48F2AEA7999C14C9A3C8D24A2D354351AE` |
| `surahs/002.json` | `D691127EFC52B04535D0008EEAF0603937B108EB5BB62ADA661C9B6BF1142A7E` |
| `surahs/021.json` | `83C13C3F2A5ACF23E06BE97C8759C36D44587B580BBBDC05BFA939DF6217ACD4` |
| `surahs/108.json` | `3B2E51C3D94D5AE733701C7389D0A42B4879E6B960CE87EF6425B1E9A0CE8526` |
| `surahs/114.json` | `D278CB7CCD77D7AC80121CF0A2FAE6745F541B64984717381695B412F12CA010` |
| `metadata/juz.json` | `91715DB5FABA459F17B7A8FFE6A6539783DDB04BADFF7EF4EFC4893288A0C193` |
| `metadata/basmala.json` | `E504112E8A05CDAA1FCAC196DFE430590B3DC7FF003953ED09A99F5A4370CE99` |
| `metadata/surah-checksums.json` | `89AD761177046370099CCE5A4088F7A6F5CF0DF9BDF9EB493BD1EAAF2628236F` |
| `metadata/chapters.json` *(غير مُلتزَم — لم يتغير)* | `0EF813AC506BAE8E45DE6AEE1B1BABA45FC2B32D3142591FCD49EC89D3242747` |
| `source-manifest.json` *(غير مُلتزَم — لم يتغير)* | `B5B2EE0EB285AFF264AF42CFDAFDCEF1BBCF2BF6BB009D1F34D224441A8436E8` |

**بصمات المصدر الخام (بوابة HARD):** MD5 `CF6841AEA5B1D1FD70D032B43FF08278` · SHA-1 `36EA5AB0D7EA1702F17FF43F9B50924CCCD77EBF` · SHA-256 `A7B0E5591945712EC5E4D6142938AE4D1E9B49BDC89DFF06222789BFEBDFD72C` — الثلاث طابقت.

## 6) مجموعة اختبارات القرآن الكاملة
| المقياس | القيمة |
|---------|--------|
| **ملفات الاختبار** | **32** |
| **PASS** | **574** |
| **FAIL** | **0** |
| **متخطّاة** | **لا شيء** |

تشمل: بيانات الـ114 (45) · البناء الحتمي (6) · **كامل سويت P0 (30 ملفًا)** · اختبارات المتصفح لنموذج الأنبياء — شُغّلت على خادم هذا الـworktree (server.js@063fee7 + البيانات الجديدة) لإثبات أن إضافة الحقول لم تكسر النموذج: `/quran/surah/21` يفتح · 112 آية · النص لم يتغير · Sticky Toolbar · مودال السور · البحث · وضع القراءة · نافذة اللغة · المحتوى التحريري · `pageerror=0` · `console.error=0` · لا overflow.

## 7) البناء الحتمي — **118/118** (بعد `…-SOURCE-MANIFEST-DETERMINISM-FINAL-FIX-1`)

### سبب عدم الحتمية السابق
كان البانِي **يكتب** `metadata/source-manifest.json` ويضع فيه `downloadedAt`. في البناء داخل مجلد فارغ لا يوجد ملف سابق يُحفَظ منه الوقت الأصلي ⇒ يُختم بـ`new Date()` ⇒ **مخرَج يعتمد على الساعة المحلية** ⇒ 118/119 بدل 119/119.

### التغيير في `build.mjs`
`source-manifest.json` صار **مُدخَل Provenance للقراءة فقط، ولم يعد مخرَج بناء**:
- **حُذف** كتلة الكتابة بالكامل (ومعها `new Date()` — لم يبقَ في الملف أي `Date.now()`/`new Date()`/`Math.random()`).
- **أُضيفت بوابة تحقق للقراءة فقط:** يقرأ الملف (من `<BASE>` أو `QURAN_MANIFEST_FILE` كمدخل) ويتحقق من: `archiveFile` · `packageVersion` · `md5` · `sha1` · `sha256` · `dataVersion` — وأي اختلاف = **فشل صلب**. عدد السجلات (6236) يُتحقَّق منه مستقلًا في المرحلة [2].
- **ممنوع** على البانِي لمس `downloadedAt` أو أي طابع زمني أو أي بايت في الـmanifest.
- لم تُنسخ الـmanifest إلى مجلد المخرجات المؤقت (مُرِّرت كمسار قراءة فقط).

### مجموعة المخرجات الرسمية = **118 ملفًا**
`surahs/001…114.json` (**114**) + `metadata/chapters.json` + `metadata/basmala.json` + `metadata/juz.json` + `metadata/surah-checksums.json` (**4**).

| الفحص | النتيجة |
|------|--------|
| مجلدان **فارغان مستقلان** → البناء الأول = الثاني | **118/118 بايتًا ببايت** ✓ |
| مجلد المخرجات يحوي **118 ملفًا فقط** بعد البناء | ✓ (لا manifest ولا ملفات شاردة) |
| `source-manifest.json` **لم يُكتب** داخل مجلد المخرجات | ✓ |
| بناء حقيقي داخل المستودع يترك الـmanifest **مطابقًا بايتًا** | ✓ (**وحتى `mtime` لم يتغيّر**) |
| `Date.now()` / `new Date()` / `Math.random()` في البانِي | **صفر** ✓ |
| طابع زمني أو سلسلة ISO داخل الـ118 | **صفر** ✓ |
| يفشل صلبًا: مصدر مفقود · بصمة MD5 فاسدة | ✓ |
| لا ملفات جزئية عند الفشل | ✓ (0 ملف) |
| بلا اعتماد على ملف سابق أو worktree آخر | ✓ (المصدر الخام فقط) |

**SHA-256 لـ`source-manifest.json` قبل وبعد الإصلاح والبناء والسويت الكاملة — متطابق:**
`B5B2EE0EB285AFF264AF42CFDAFDCEF1BBCF2BF6BB009D1F34D224441A8436E8` ⇒ **غير مُدرَج في الـcommit.**

## 8) `.gitignore` — نتيجة `git check-ignore -v`
```
.quran-source/UthmanicHafs_v2-0.zip   → .gitignore:138  .quran-source/
.quran-source/hafsData_v2-0.json      → .gitignore:138  .quran-source/
.quran-shots/x.png                    → .gitignore:144  .quran-shots/
UthmanicHafs_v2-0.zip                 → .gitignore:140  UthmanicHafs_v2-0.zip
hafsData_v2-0.json                    → .gitignore:141  hafsData_v2-0.json
data/.../surahs/002.json              → NOT ignored ✓ (JSON مشروع)
data/.../metadata/juz.json            → NOT ignored ✓ (JSON مشروع)
```
أُضيف اسما المصدر صراحةً (سطرا 140–141) ليستحيل التزام نسخة شاردة خارج `.quran-source/`. **لا قاعدة عامة تمنع أي JSON مشروع.** مجلد المقارنة الحتمية ومخرجات القياس تعيش في مجلد مؤقت **خارج المستودع** (scratchpad) فلا تحتاج قاعدة.

## 9) قائمة Stage النهائية (Stage صريح — بلا `git add .` وبلا `git add data/quran`)
`.gitignore` · `scripts/quran/build.mjs` · `surahs/001…114.json` (114) · `metadata/basmala.json` · `metadata/juz.json` · `metadata/surah-checksums.json` · اختبارا البيانات · تقرير P1a.
**`git diff --cached --check`: نظيف** · **`git diff --cached --stat`: 122 files changed, 75,356 insertions(+), 73 deletions(-)**
**حراسة:** لا ملف Runtime/UI مُدرَج · `source-manifest.json` و`chapters.json` غير مُدرَجين · لا ملفات خام/صور/مؤقتة.

## 10) الأرقام
114 ملف سورة · 6236 آية · 30 جزءًا · صفحات 1–604 · `U+00A0`×6235 · `U+0020`×1 (البقرة 2:286 حصرًا، علامة `U+FD1D`=FC00+285) · البسملة: الفاتحة `first-ayah` · التوبة `none` · الـ112 `separate` · النمل 27:30 تحتفظ ببسملتها داخل النص · الحجم 5,373,446 B سور + 59,446 B ميتاداتا = **5,432,892 B (5.18 MB)** · أصغر `108.json` 1,660 B · أكبر `002.json` 360,785 B · البناء 112 ms · ذروة الذاكرة 85.8 MB.

---

# LOCAL COMMIT RESULT

**الأب:** `063fee7` · **الرسالة:** `feat(quran): build verified data for all 114 surahs [P1a local-only]` · **الملفات:** 122 · **الفرع:** `quran-ar-data-build-all-114-1` (ahead بـ1) · **بلا upstream · لا Push · لا Merge.**

> **hash الـcommit لا يُذكر هنا عمدًا:** هذا الملف *داخل* الـcommit، وكل `--amend` يغيّر الـhash فيجعل أي قيمة مكتوبة هنا قديمة فورًا. الـhash النهائي يُقدَّم في تقرير الإغلاق، ويُقرأ دائمًا من `git log -1`.

**البناء:** حتمي **118/118** عبر مجلدين فارغين مستقلين · `source-manifest.json` **لا يُكتب** (Provenance للقراءة فقط، `B5B2EE0E…36E8` ثابت) · **574/574 PASS · FAIL=0** عبر 32 ملف اختبار.
