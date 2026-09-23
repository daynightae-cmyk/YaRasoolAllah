# Tanzil Arabic Quran core — acquisition record

- **Artifact:** `quran-uthmani-min-1.1.txt` (verbatim download, never edited)
- **Source:** Tanzil Project, Quran text type `uthmani-min`, release 1.1
  (February 2021), output `txt-2` (text with aya numbers)
- **Acquired:** 2026-09-23 from `https://tanzil.net/pub/download/index.php`
  (`quranType=uthmani-min&outType=txt-2&agree=true`)
- **SHA-256:**
  `2F531F9B1FC886DF06297D1A9D5D521FB1FA8A777CA68B3E1CB3E2491FDAD6AC`
- **Verified content:** 114 surahs, 6236 verses, sequential ayah numbering,
  spot counts match (Al-Fatihah 7, Al-Baqarah 286, An-Nas 6)
- **Terms:** verbatim copying/distribution permitted, modification forbidden,
  Tanzil attribution required — see `https://tanzil.net/docs/Text_License`
- **In-app attribution:** "النص القرآني: مشروع تنزيل (tanzil.net)"
- **Downstream:** parsed by `scripts/ingest-tanzil-quran.ts` into
  `client/src/data/quranCorpus.ts`. Display text is never modified; search
  indexes derive from it without overwriting it.
