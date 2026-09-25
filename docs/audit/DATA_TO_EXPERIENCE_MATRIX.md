> **SUPERSEDED AS CURRENT TRUTH.** Counts, shells, and provider states in this file
> were recorded against an older SHA. Use `docs/audit/CURRENT_PRODUCT_REALITY.md`
> for live authority. This file remains as historical evidence only.

# Data To Experience Matrix

**Product:** Ya Rasool Allah ﷺ / يا رسول الله ﷺ  
**Audit date:** 2026-09-23  
**Base SHA:** `df5da118675ef79529b119f55e956387f501289e`  
**Branch:** `feat/deep-experiential-institution-20260923`  

This matrix inventories live datasets, registries, adapters, and source-governance records discovered in the current repository. It tracks whether each data asset is actually consumed by the user experience and whether the experience truthfully supports reading, search, download, playback, and multilingual behavior.

## Summary Counts Verified By Runtime Import

| Dataset | Count |
|---|---:|
| Source registry records | 15 |
| Rights ledger records | 7 |
| Provider resource records | 7 |
| Bibliographic works | 17 |
| Digital versions | 33 |
| Provider policies | 18 |
| Children adaptations | 5 |
| Cleared media assets | 0 |
| Quran Arabic ayahs | 6236 |
| Quran surahs | 114 |
| Seerah chapters | 8 |
| Seerah categories | 3 |
| Hadith collections | 6 |
| Hadith development samples | 4 |
| Who-is-Muhammad chapters | 12 |
| Quran recitation records | 8 |
| Quran audio categories | 5 |
| Azkar records in static module | 5 |
| Prophetic day stations | 6 |
| Prayer guide steps | 0 |

## Matrix

| DATASET | RECORD COUNT | SOURCE | RIGHTS | CURRENT CONSUMER | CURRENT ROUTE | VISIBLE? | INTERACTIVE? | SEARCHABLE? | DOWNLOADABLE? | READABLE? | PLAYABLE? | MULTILINGUAL? | STATUS | NEXT ACTION |
|---|---:|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `shared/source-registry.ts::sourceRegistry` | 15 | Internal governance registry | Mixed: verified, rights review pending, editorial review pending | `SourcesPage`, evidence drawers indirectly | `/sources`, drawers | Yes | Partial browsing | Partial | No | Metadata only | No | Labels mixed AR/EN | PARTIAL | Expose source records consistently through all major route evidence panels. |
| `shared/source-registry.ts::rightsLedger` | 7 | Internal rights ledger | Governs selected sources only | `SourcesPage`, `validate:sources` | `/sources` | Yes | Partial | Partial | No | Metadata only | No | Mostly Arabic | PARTIAL | Add rights decision lookup to route-level source drawers wherever IDs exist. |
| `shared/source-registry.ts::providerResourceRegistry` | 7 | Provider resource registry | Two production-ready resources: library catalog and Tanzil Arabic text | `SourcesPage`, validator | `/sources` | Yes | Partial | Partial | No | Metadata only | No | Mixed | PARTIAL | Surface resource readiness on Library/Quran route summaries. |
| `shared/knowledge-registry.ts::workRegistry` | 17 | OpenITI pinned metadata plus internal bibliographic registry | Bibliographic only; scholarly review often pending | `DigitalLibraryPage`, `GateOfLightPage`, `SeerahPage`, `SourcesPage`, AI/search pages | `/library`, `/`, `/seerah`, `/sources`, `/ai-assistant` | Yes | Yes | Yes in library and source/search contexts | No | Catalog record only | No | Work titles AR/EN; UI mainly Arabic | PARTIAL | Improve reading desk to show work/edition/version/rights separation more explicitly. |
| `shared/knowledge-registry.ts::digitalVersionRegistry` | 33 | OpenITI release commit `cfc4157...` | Catalog metadata only; full text needs version review | `DigitalLibraryPage` | `/library` | Yes | External metadata links | Indirect via selected work/search | No | Metadata only | No | AR/EN metadata | PARTIAL | Add version table filters and no-reader empty state to prevent expectations of full text. |
| `shared/knowledge-registry.ts::providerPolicyRegistry` | 18 | Internal policy registry from provider rights pages | Mixed: cleared-with-attribution, API-only, external-link-only, credential, item review | `SunnahPage`, possible Sources context | `/sunnah`, `/sources` | Partial | Low | No | No | Metadata only | No | Mixed | PARTIAL | Move provider-policy visibility into `/sources` filters and route evidence drawers. |
| `shared/knowledge-registry.ts::childrenAdaptationRegistry` | 5 | Platform-original adaptation registry | Editorial and scholarly review pending; no depiction policy | `ChildrenTVPage` | `/kids`, `/children-tv` | Yes | Partial | No | No | Short adaptation records | No | Mostly Arabic | PARTIAL | Build real story reader and parent/evidence drawer while preserving draft labels. |
| `shared/knowledge-registry.ts::mediaAssetRegistry` | 0 | Internal registry | No cleared assets | No media route consumer | None | No | No | No | No | No | No | n/a | BLOCKED | Do item-level rights review before adding images, manuscripts, audio, or video. |
| `client/src/data/quranCorpus.ts::UTHMANI_VERSES` | 6236 ayahs / 114 surahs | Tanzil Uthmani-min 1.1 acquired artifact | Arabic text cleared with attribution per ledger | `quranService`, `QuranPage` | `/quran` | Yes | Ayah navigation | Surah search; text search not fully exposed on page | No | Yes, Arabic ayah-by-ayah | No | Arabic text; UI language separate | PARTIAL | Add in-page Quran search, source banner, and separate translation/tafsir availability controls. |
| `data-sources/tanzil/quran-uthmani-min-1.1.txt` | 6236 lines | Tanzil downloaded immutable file | Cleared for verbatim Arabic display with attribution | `ingest:quran` source artifact | Build-time/data maintenance | Not directly | No | No | No | Source file only | No | Arabic | IMPLEMENTED BUT NOT VERIFIED | Keep checksum validation in ingestion and link evidence in docs. |
| `client/src/data/quranAudio.ts::quranRecitations` | 8 | Static audio provider records | External/recording-level rights not cleared for bundling | `QuranAudioPage`, audio components | `/quran-audio` | Yes | Intended reciter selection/playback | Category browsing | No | Metadata only | Not verified; likely external URLs | Names multilingual-ish | IMPLEMENTED BUT NOT VERIFIED | Runtime-test actual play/pause and mark every recording with provider/rights constraints. |
| `client/src/data/quranAudio.ts::quranAudioCategories` | 5 | Static taxonomy | Same as audio records | `ReciterSelector` | `/quran-audio` | Yes | Filter/category controls | Partial | No | Metadata only | n/a | Arabic labels | IMPLEMENTED BUT NOT VERIFIED | Add rights-aware category empty/error states. |
| `client/src/data/seerahData.ts::seerahChapters` | 8 | Internal structured Seerah content | Scholarly and edition review pending | `SeerahPage`, `GateOfLightPage`, `GlobalSearchDialog` | `/seerah`, `/`, global search | Yes | Chapter selection/evidence | Search dialog only | No | Yes, summaries/details | No | Arabic content | PARTIAL | Add event workspace model with date/place certainty and source evidence per event. |
| `client/src/data/seerahData.ts::seerahCategories` | 3 | Internal taxonomy | Same as Seerah content | `SeerahPage` | `/seerah` | Yes | Category navigation | Partial | No | Labels only | No | Arabic | PARTIAL | Tie categories to timeline/map/people filters. |
| `client/src/components/Seerah/MountainousBattlefieldMap.tsx` data | Component-local schematic data | Internal interpretive map layer | Must not be treated as exact geodata | `SeerahPage` | `/seerah` atlas section | Yes | Map/atlas interaction | No | No | Interpretive labels | No | Arabic | PARTIAL | Promote to governed atlas dataset with route certainty, stages, source confidence, and reduced-motion controls. |
| `client/src/data/hadithData.ts::HADITH_COLLECTIONS` | 6 | Internal collection metadata | Bibliographic/source review pending | `HadithPage`, `SunnahPage` | `/hadith`, `/sunnah` | Yes | Collection selection | Partial | No | Metadata only | No | Arabic/English fields | PARTIAL | Keep bibliographic counts separate from any future cleared corpus. |
| `client/src/data/hadithData.ts::HADITH_DEVELOPMENT_SAMPLES` | 4 | Internal development samples | Editorial review pending; grade source must remain explicit | `HadithPage`, `AlMuftiAlMubeenPage`, `BasirahPage` | `/hadith`, `/basirah` | Yes | Reader/evidence | Partial | No | Yes, limited samples | No | Arabic + translation fields | PARTIAL | Replace samples only with credentialed/rights-cleared corpus and assessor-specific grades. |
| `server/hadith.ts::getHadithCorpusStatus` | 2 provider policies / 4 local samples | Shared policy registry plus local development records | Sunnah credentials absent; Dorar external reference only | `HadithPage` | `/hadith`, `/api/content/hadith/status` | Yes | JSON status contract | n/a | n/a | Status only | No | Provider labels AR/EN | IMPLEMENTED AND VERIFIED | Keep full-corpus state blocked until credentials, rights, and editorial review exist. |
| `client/src/data/whoIsMuhammadData.ts::WHO_IS_MUHAMMAD_CHAPTERS` | 12 | Internal editorial chapters | Scholarly/source review pending | `WhoIsMuhammadPage`, `AlMuftiAlMubeenPage`, shell/search | `/who-is-muhammad`, `/character`, `/ai-assistant` | Yes | Chapter navigation | Partial | No | Yes | No | Mostly Arabic | PARTIAL | Add documentary reading chapters with evidence drawer, glossary, and clear source boundaries. |
| `client/src/data/azkarData.ts::AZKAR_DATA` | 5 | Static local module | Provenance, grade attribution, rights review incomplete | `GlobalSearchDialog`; not fully trusted for `/daily` | Search dialog; `/daily` blocks corpus claims | Partial | Search result only | Yes in dialog | No | Snippets only | No | Arabic | BLOCKED | Do source/grade/rights review before displaying as daily corpus. |
| `client/src/data/propheticDailyData.ts::PROPHETIC_DAY_STATIONS` | 6 | Internal structured daily stations | Needs source review | `PropheticDayPage` | `/prophetic-day`, `/24-hours` | Yes | Station reading | No | No | Yes | No | Arabic | IMPLEMENTED BUT NOT VERIFIED | Add evidence/status per station and verify mobile. |
| `client/src/data/prayerGuideData.ts::PRAYER_GUIDE_STEPS` | 0 | Empty module | n/a | `PrayerGuidePage` | `/prayer-guide` | Likely empty/shell | Unknown | No | No | No real guide steps | No | n/a | PARTIAL | Either implement sourced prayer guide data or show explicit unavailable state. |
| `client/src/data/islamicKnowledgeData.ts::ISLAMIC_KNOWLEDGE_DATA` | Small static module | Internal | Needs source review | `IslamicKnowledgePage` | `/islamic-knowledge` | Yes | Browsing | No | No | Yes | No | Mixed | IMPLEMENTED BUT NOT VERIFIED | Audit content provenance and decide whether route belongs in institution shell. |
| `client/src/data/fatwas.json` | Static JSON file | Legacy/prototype data | Conflicts with no-fatwa charter unless quarantined | No active import found in route scan | None | No | No | No | No | No | No | n/a | BLOCKED | Keep out of active product or remove after confirming no required evidence value. |
| `client/src/data/islamic-content.ts` | Static module | Legacy/prototype data | Unknown | No active import found | None | No | No | No | No | No | No | n/a | NOT IMPLEMENTED | Quarantine or delete only in a dedicated cleanup slice. |
| `client/src/data/islamicContent.ts` | Static module | Legacy/prototype data | Unknown | No active import found | None | No | No | No | No | No | No | n/a | NOT IMPLEMENTED | Quarantine or delete only in a dedicated cleanup slice. |
| `client/src/data/mainStructure.ts` | Static module | Legacy/prototype structure | n/a | No active import found | None | No | No | No | No | No | No | n/a | NOT IMPLEMENTED | Keep as archive evidence or remove in cleanup slice. |
| `server/routes.ts` auth/progress/bookmark APIs | Several endpoints | In-memory storage | Not production persistence | AppLayout/dashboard/support components | Dashboard/support routes | Partial | Yes | No | No | User state only | No | n/a | PARTIAL | Replace demo-token/memory storage before claiming accounts, sync, or persistence. |
| `server/routes.ts` Quran sample API | Small hardcoded sample | Server local code | Superseded by client Quran corpus for `/quran` | Legacy components may call APIs | `/daily-verse`, old search widgets | Partial | Partial | Partial | No | Partial sample | No | English/Arabic sample | PARTIAL | Align server APIs with governed Quran corpus or explicitly deprecate old endpoints. |
| `server/routes.ts` prayer times API | API/fallback logic | AlAdhan plus fallback | API-only; method attribution required | Prayer widgets/services | `/daily`, dashboard/support routes | Partial | Yes | No | No | Times only | No | n/a | PARTIAL | Runtime-test loading/error/method display and avoid universal correctness claims. |
| `server/routes.ts` AI ask endpoint | Mock/auth-gated endpoint | Local canned response | No grounded model contract | AI/support routes if authenticated | `/ai-assistant`, `/al-mufti-al-mubeen` | Partial | Chat form likely | No true index | No | Generated/mock answer | No | Mixed | BLOCKED | Implement server-side cited retrieval contract before presenting religious answers as AI research. |
| `server/routes.ts` calendar events | Hardcoded 2024-era events | Local mock dates | Date/source stale | `IslamicCalendarPage` likely | `/calendar` | Partial | Calendar browsing | No | No | Event labels | No | Mixed | PARTIAL | Replace with current, sourced Hijri calendar logic or label sample data. |

## API/Provider Classification

| Provider/API | Classification | Evidence | Required Next Step |
|---|---|---|---|
| Tanzil Uthmani-min 1.1 | CONNECTED AND USED | Acquired artifact, checksum, 6236 ayahs, Quran route visible | Add route-level source banner and keep verbatim/attribution constraints. |
| OpenITI | CONNECTED BUT NOT CONSUMED AS FULL TEXT | 17 works, 33 versions visible as metadata; full text not rendered | Version-level rights/edition review before native reading desk. |
| AlAdhan | CONNECTED BUT NOT FULLY VERIFIED IN THIS MISSION | Provider policy and prayer service/routes exist | Runtime-test method display, errors, and fallback. |
| Quran Foundation | CREDENTIAL REQUIRED | Provider and source records exist; credentials false | Server-side adapter only after credential and resource terms. |
| Sunnah.com | CREDENTIAL REQUIRED | Provider/source/rights records exist; no scraping | API key, rights decision, grade assessor contract. |
| Dorar | CONNECTED AS EXTERNAL REFERENCE ONLY | Provider policy/source exists | Keep external editorial reference; no corpus ingestion without terms. |
| QuranicAudio / EveryAyah | RIGHTS REVIEW REQUIRED | Static recitation data/provider policies exist | Recording-level playback/rights verification. |
| OSM / Natural Earth / GeoNames / NASADEM | ADAPTER ONLY / RIGHTS REVIEW REQUIRED | Provider policies only; no datasets bundled | Acquire governed map datasets before geographic atlas claims. |
| QDL / Gallica / LOC / IA / Commons / BL / NYPL | RIGHTS REVIEW REQUIRED | Institution candidates only; 0 cleared assets | Item-level registration before media use. |

## Buried Useful Data

The following data is approved enough to be visible but is not yet used to its full experiential potential:

| Data | Current Gap | Next Experience |
|---|---|---|
| 33 OpenITI version records | Library shows metadata but no rich version comparison or reading-desk unavailable state depth | Version-aware reading desk with explicit `CATALOG RECORD — DIGITAL TEXT NOT AVAILABLE`. |
| 6236 Arabic Quran ayahs | Route reads ayah-by-ayah, but no full search or audio integration on same sacred workspace | Search, bookmarks/notes, and source-aware recitation handoff. |
| 8 Seerah chapters | Experience is chapter-based, not event-workspace based | Normalize into events with date/place certainty, people, Quran/Hadith links, evidence. |
| 5 children adaptations | Route exists but not a real story journey or theatre | Story reader, parent area, favorites only after persistence truth is settled. |
| Provider policies | Mostly governance pages | Inline route affordances showing why a button is disabled or external-only. |

## Prohibited Promotions

These promotions are explicitly blocked until new evidence exists:

| Temptation | Reason Blocked |
|---|---|
| Treat OpenITI links as a full native library reader | Current rights state is catalog metadata only and version review is pending. |
| Bundle or play recitation as cleared audio | Recording-level permissions are not registered. |
| Show children videos | Cleared media asset count is 0. |
| Present hadith samples as a verified corpus | Samples are development records pending editorial review and assessor-grade attribution. |
| Make atlas coordinates from schematic SVG/component positions | Current atlas is interpretive; no acquired historical geodata supports exact movements. |
| Use AI as a mufti or religious authority | Grounded retrieval, citation contract, and editorial workflow are not implemented. |
