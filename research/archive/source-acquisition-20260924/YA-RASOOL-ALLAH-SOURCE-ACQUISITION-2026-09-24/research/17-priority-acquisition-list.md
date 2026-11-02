# Priority and provider fallback
|Domain|Primary|Secondary|Offline/cache|Failure|
|---|---|---|---|---|
|Arabic Quran|existing local Tanzil|none needed|immutable checked local artifact|show corpus load error, never substitute text|
|Translations/tafsir|QF approved resource|external edition/catalog link|only if resource permits|source-specific unavailable, retain Arabic verse|
|Hadith|Sunnah.com keyed API for approved records|Dorar search or HadeethEnc links|only reviewed records|sample remains labeled sample; no fake corpus|
|Books|OpenITI pinned catalog|Open Library/LOC|catalog metadata|external record, no invented text|
|Media|curated YouTube/Commons/QDL|institutional external reader|metadata only by default|no media cleared notice|
|Audio|MP3Quran reviewed stream|QF recitation with credentials|metadata by default|external link / disabled transport|
|Prayer|existing AlAdhan|provider only after verified alternate|last *real* response, dated, matching location/settings|unavailable, no fabricated times|
|City|curated local list + GeoNames|manual user-selected city|curated locations|ask city selection in UI|
|Qibla|local great-circle calculation|AlAdhan API comparison|local formula|bearing unavailable on invalid coordinates|
|Atlas|schematic source-backed layer|modern MapLibre contextual basemap|static schematic|keep honest schematic|
|Search|local registry index|server PostgreSQL when acquired|pinned local index|explicit no results/insufficient evidence|

P0: preserve Tanzil, activate real catalog external readers and verified manifests, strengthen existing prayer/location UX, acquire MP3Quran metadata with playback gate. P1: QF production approvals and tafsir/translation, Hadith keys, curated media. P2: OpenITI edition parsing, search database and reviewed geo overlay. P3: unclear rights or historical coordinate claims. Run P0 in small PRs: book metadata/reader, provider lists/audio, location; do not merge in one giant feature.
