# Ingestion pipeline and QA
`SOURCE -> FETCH -> VALIDATE -> NORMALIZE -> SHA-256 -> STAGING -> REVIEW -> PUBLISH -> INDEX`.

|script|input -> output|resume/dedupe/failure|
|---|---|---|
|`scripts/ingest-tafsir.ts`|QF resource ID, verse pages -> `acquired_tafsir` staging JSONL|checkpoint resource/page; unique resource+verseKey+language; reject malformed verse key, raw HTML to sanitizer; on 401 refresh once, on 429 backoff|
|`scripts/ingest-hadith.ts`|keyed Sunnah.com/HadeethEnc/Dorar approved queries -> `acquired_hadith`|source+provider record ID; grade assessor nullable; do not synthesize a complete corpus from search response; checkpoint collection/book/page|
|`scripts/ingest-openiti.ts`|pinned OpenITI release metadata CSV and selected version bytes -> works/versions staging|verify tag/commit/hash, URI uniqueness; parse book text only after version rights and page marker review; file hash written in manifest|
|`scripts/ingest-media.ts`|approved Commons/LOC/QDL/YouTube item IDs -> media staging|skip duplicates by provider+external ID; verify canonical link, attribution, rights; embed checks; store URL/metadata only unless expressly cleared|
|`scripts/ingest-audio.ts`|MP3Quran reciters+timing read IDs -> track/timing staging|do not publish player until stream permission; verify surah_list + URL + timing units/monotonicity|
`scripts/ingest-geodata.ts`|modern gazetteer/tiles reference -> reviewed locations|do not infer historic location or transform schematic x/y|

Each run emits `research-run.json`: source URL, retrievedAt, HTTP status, ETag if available, source version, `sha256` of exact bytes, input/output count, rejection reasons, checkpoint, environment, anonymized timing. Fetch with timeout and bounded retries (only 429/5xx/network; never retry 400/403 indefinitely). Validate Zod schemas; preserve raw byte snapshot where allowed, otherwise hash response without retaining it. Publish only if `evaluateResourceUsage` and editorial state permit. Re-index incrementally by stable ID; compare counts and spot-check the 1st/last page and known verse/record. Existing `npm run validate:sources` is mandatory after editing governance.

Sample probes (run on an authorized agent machine; do not count the documentation response as a live API PASS):
```bash
curl -i 'https://mp3quran.net/api/v3/reciters?language=eng'
curl -i 'https://mp3quran.net/api/v3/ayat_timing?surah=2&read=5'
curl -i 'https://openlibrary.org/search.json?q=Ibn%20Hisham&limit=1'
curl -i 'https://dorar.net/dorar_api.json?skey=%D8%A7%D9%84%D8%A3%D8%B9%D9%85%D8%A7%D9%84'
curl -i 'https://iiif.io/api/cookbook/recipe/0009-book-1/manifest.json'
curl -i 'https://datasets-server.huggingface.co/first-rows?dataset=quranlab/quran-tafsir&config=tafsir-ibnkathir-ar&split=train'
```
