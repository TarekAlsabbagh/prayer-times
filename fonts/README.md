# Fonts

## Amiri Quran (Quran-grade Arabic text)

Used by `css/style.css → .azkar-quran-text` to render Quran verses (آية الكرسي،
الإخلاص، الفلق، الناس) inside the azkar pages with the proper Uthmanic Naskh
typography + tashkeel rendering.

### Required file (NOT committed yet — user-supplied)

```
fonts/AmiriQuran-Regular.woff2
```

### How to obtain

Download the official Amiri Quran woff2 from the Alif Type Foundry repo
(SIL Open Font License — free for redistribution):

  https://github.com/alif-type/amiri/raw/master/files/AmiriQuran-Regular.woff2

Place the downloaded file at `fonts/AmiriQuran-Regular.woff2`. The
`@font-face` rule in `css/style.css` references this path via
`url('../fonts/AmiriQuran-Regular.woff2')`.

### Fallback behavior if file missing

`font-family: 'AmiriQuran', 'Amiri', 'Scheherazade New', 'Traditional Arabic', serif;`
— the chain falls through to the next available font. So azkar pages
render correctly even before the woff2 is in place; they just won't get
the optimal Uthmanic display until the file is added.

### License

The Amiri family is licensed under SIL Open Font License v1.1. The
license text is preserved at `fonts/LICENSE-AMIRI.txt` (must ship
alongside the woff2 binary per OFL terms when redistributed).
