# YA RASOOL ALLAH — Production Source Acquisition Pack
Research checked 2026-09-24 UTC. Repo: https://github.com/daynightae-cmyk/YaRasoolAllah ; main SHA verified via GitHub branch API: `f55fe8475e882eebe1ddec1e6c7c2cb9aa7aa68c`.

Evidence notation:
- **LIVE-REPO**: current GitHub API returned the branch, tree, or file content.
- **LIVE-JSON**: retrieved and inspected a live JSON artifact.
- **OFFICIAL-DOC**: provider's current documentation inspected; production API response not obtained in this environment.
- **CANDIDATE**: discovered, item-level provenance/use still unverified.
- **NOT VERIFIED**: do not assert a payload, license, quota, CORS, or production availability.

Live API probes to AlAdhan, MP3Quran, Hugging Face dataset server, Dorar, Open Library and Internet Archive could not be fetched by the research browser; their examples are documented requests, **not passing integration tests**. Quran Foundation production credentials, YouTube key and Sunnah.com key were not present. IIIF's official book manifest was actually retrieved and inspected. Scientific literature search via scite returned monthly MCP limit (25 calls); Hugging Face app dataset search was disabled by server configuration. Their web dataset cards were examined where cited. No repository code changed.

**Current product facts from GitHub tree and docs/evidence/OVERNIGHT_REAL_DATA_WIRING_REPORT.md**: 114 surahs / 6,236 verses Tanzil Uthmani-min 1.1 local; 17 works / 33 digital versions catalog only; five tafsir works but no embedded tafsir texts; six bibliographic hadith collections / four development samples; eight seerah chapters; five children adaptations / zero cleared media; audio provider registry / zero cleared recordings; AlAdhan real prayer service and local Qibla formula; Basirah local discovery only. Existing source/rights/resource governance lives in `shared/source-governance.ts`, `shared/source-registry.ts`, `shared/knowledge-registry.ts`; visual pages in `client/src/visual-golden/pages`. Separate legacy `server/routes.ts` contains demo auth and static Quran routes: do not mistake these for the golden experience or use demo auth to secure new proxy routes.

## Acquisition order and decision gates
|Priority|Acquisition|Benefit|Gate|
|---|---|---|---|
|P0|OpenITI bibliographic metadata, Open Library/LOC item links, QDL IIIF item reader|Library gains real discoverability|Keep catalog-only unless each version cleared|
|P0|Dorar search link/API experiment; Quran Foundation resource discovery in prelive|Hadith lookup and tafsir discovery|Do not turn sample or API access into editorial verification|
|P0|MP3Quran reciter and verse-timing metadata; external audio links|Real audio listing|Streaming permission per recording before playback|
|P1|Quran Foundation translations/tafsir/audio|Verse-level enrichment|Backend credentials, production approval, resource rights|
|P1|YouTube curated embed and Commons/LOC media|Kids and media|Item-level source, attribution, embed eligibility|
|P2|OpenITI text ingest and historic graph|Seerah/books/search depth|Version/edition mapping and editorial review|
|P2|GeoNames city service and map tiles|Location and atlas|Username, attribution, tile provider terms|
|P3|Hadith corpus at scale, ambiguous historical coordinates|Comprehensive archive|Primary provenance and scholarly review|

Machine catalogs: `14-api-endpoints.json`, `15-source-registry.json`. Implementation prompt: `FINAL-INTEGRATION-PROMPT.md`. All URLs are references to original docs; exact live response and CORS checks remain agent gates where marked OFFICIAL-DOC.
