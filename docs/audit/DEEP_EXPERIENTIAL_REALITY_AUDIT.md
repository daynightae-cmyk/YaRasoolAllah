> **SUPERSEDED AS CURRENT TRUTH.** Counts, shells, and provider states in this file
> were recorded against an older SHA. Use `docs/audit/CURRENT_PRODUCT_REALITY.md`
> for live authority. This file remains as historical evidence only.

# Deep Experiential Reality Audit

**Product:** Ya Rasool Allah ﷺ / يا رسول الله ﷺ  
**Audit date:** 2026-09-23  
**Branch:** `feat/deep-experiential-institution-20260923`  
**Base SHA:** `df5da118675ef79529b119f55e956387f501289e`  
**Remote:** `https://github.com/daynightae-cmyk/YaRasoolAllah.git`  
**Open PRs at audit start:** 0 via `gh pr list`  

This audit records the current runtime-facing product reality before the next experiential slice. It intentionally separates route existence, visual polish, runtime verification, source integrity, rights clearance, and editorial status. A successful build or beautiful screen is not treated as completion.

## Authority

| Item | Current Evidence |
|---|---|
| `HEAD` before branch | `df5da118675ef79529b119f55e956387f501289e` |
| `origin/main` before branch | `df5da118675ef79529b119f55e956387f501289e` |
| Pull state | `Already up to date` |
| Worktree caveat | Tracked tree clean; untracked local `.codex/` exists and was preserved |
| Dedicated branch | `feat/deep-experiential-institution-20260923` |
| Scripts verified from `package.json` | `dev`, `build`, `start`, `check`, `validate:sources`, `capture:visual`, `ingest:quran`, `db:push` |

## Status Vocabulary

Only these status values are used below:

| Status | Meaning |
|---|---|
| IMPLEMENTED AND VERIFIED | Code exists and this mission has runtime/test evidence for the specific claim. |
| IMPLEMENTED BUT NOT VERIFIED | Code exists, but this mission has not yet executed the runtime or interaction gate. |
| PARTIAL | Some real data or interaction exists, but important expected behavior is missing. |
| VISUAL ONLY | The route or component has presentation without the promised underlying function/data contract. |
| NOT IMPLEMENTED | No active route or no meaningful implementation found. |
| BLOCKED | Cannot honestly complete without credential, rights clearance, editorial review, scholarly review, or deployment environment. |

## Route Reality

| Route | Active Component | Data Source | Data Volume | Interactions | Media | Source/Provenance | Multilingual Status | Mobile Status | Visual Depth | Functional Status |
|---|---|---|---:|---|---|---|---|---|---|---|
| `/` | `GateOfLightPage` inside `InstitutionShell` | `seerahChapters`, `workRegistry`, `INSTITUTION_WINGS`, local progress | 8 Seerah chapters, 17 works | Wing portals, learning-depth selector, local continuation, evidence drawer | No cleared media | Seerah teaser evidence opens pending review; library counts from registry | UI chrome follows app language context; content mostly Arabic | Prior visual matrix covered 360/768/1440; rerun pending in this mission | Architectural gate already present, still card-heavy in lower sections | IMPLEMENTED BUT NOT VERIFIED |
| `/home` | Redirect to `/` | Route redirect only | n/a | Redirect | n/a | n/a | n/a | n/a | n/a | IMPLEMENTED BUT NOT VERIFIED |
| `/library` | `DigitalLibraryPage` | `workRegistry`, `digitalVersionRegistry` | 17 works, 33 digital versions | Search, category filter, shelf/catalog modes, selectable catalog desk, external metadata links | No embedded book media | Strong: work/version/rights caveat visible; full text/download withheld | UI labels mostly Arabic; content language is bibliographic Arabic/English | Prior 360 evidence exists; rerun pending | Has shelf metaphor and desk, not only generic cards | PARTIAL |
| `/digital-library` | `DigitalLibraryPage` | Same as `/library` | 17 works, 33 digital versions | Same as `/library` | No embedded book media | Same as `/library` | Same caveat | Same caveat | Same | PARTIAL |
| `/books` | `DigitalLibraryPage` | Same as `/library` | 17 works, 33 digital versions | Same as `/library` | No embedded book media | Same as `/library` | Same caveat | Same caveat | Same | PARTIAL |
| `/quran` | `QuranPage` | `quranService` dynamic import of `UTHMANI_VERSES`, local translation sample | 6236 ayahs, 114 surahs | Surah search, ayah navigation, bookmark local storage, copy, tafsir toggle, source drawer | No in-page playable audio on this route | Strong for Arabic Tanzil text; translation/tafsir disclosed as sample/unavailable | UI chrome language available; Quran content Arabic; translation availability separated | Prior 360 evidence exists; rerun pending | Calm reading plane exists; tools still page-level rather than fully sacred workspace | PARTIAL |
| `/quran/*` | `NotFound` for arbitrary nested paths; `/quran-audio` is separate | n/a | n/a | n/a | n/a | n/a | n/a | Not verified | n/a | NOT IMPLEMENTED |
| `/quran-audio` | `QuranAudioPage` inside `AppLayout` | `quranAudio.ts` | 8 recitations, 5 categories | Reciter/category UI and audio component | External audio URL records; playback not verified in this mission | Provider policies require recording-level rights review; no bundled audio | Mixed Arabic UI; global context present | Not verified in this mission | Legacy app-layout experience, not yet Quran wing quality | IMPLEMENTED BUT NOT VERIFIED |
| `/seerah` | `SeerahPage` | `seerahChapters`, `workRegistry`, `MountainousBattlefieldMap` | 8 chapters, 3 categories, Seerah source works | Chapter selection, depth, evidence drawer, atlas subsection | No cleared video/media | Review pending; atlas is interpretive/schematic and must not imply exact coordinates | Mostly Arabic content; shell language support | Prior visual matrix covered Seerah and atlas; rerun pending | Distinct journey and atlas treatment exists | PARTIAL |
| `/seerah/*` | `NotFound` for arbitrary nested paths | n/a | n/a | n/a | n/a | n/a | n/a | Not verified | n/a | NOT IMPLEMENTED |
| `/who-is-muhammad` | `WhoIsMuhammadPage` | `WHO_IS_MUHAMMAD_CHAPTERS` | 12 chapters | Chapter reading, evidence drawer, route chapter param | No cleared media/audio | Source drawer available; chapter-level review still pending | Mostly Arabic editorial content; UI chrome global | Prior broad visual evidence, route-specific rerun pending | Guided documentary reading exists but still text-led | PARTIAL |
| `/who-is-muhammad/:chapter` | `WhoIsMuhammadPage` | Same as above | 12 chapters | Deep-link selection expected | No cleared media/audio | Same | Same | Not separately verified | Same | IMPLEMENTED BUT NOT VERIFIED |
| `/character` | `WhoIsMuhammadPage` with `defaultChapterId` | `WHO_IS_MUHAMMAD_CHAPTERS` | 12 chapters | Direct character pathway | No media | Review pending | Same | Not verified in this mission | Text-led | IMPLEMENTED BUT NOT VERIFIED |
| `/sunnah` | `SunnahPage` | `HADITH_COLLECTIONS`, `HADITH_DEVELOPMENT_SAMPLES`, provider policies | 6 collections, 4 samples | Collection/book-like navigation, hadith reader, source drawer | None | Explicit development samples; grade/source/editorial review pending | Mostly Arabic UI/content; shell supports languages | Prior visual matrix covered 768; rerun pending | Scholarly archive style present, but limited corpus | PARTIAL |
| `/sunnah/*` | `NotFound` for arbitrary nested paths | n/a | n/a | n/a | n/a | n/a | n/a | Not verified | n/a | NOT IMPLEMENTED |
| `/kids` | `ChildrenTVPage` | `childrenAdaptationRegistry` | 5 source-linked adaptations | Age-band cards/actions; no persistent favorites verified | No cleared videos | Adaptations labeled platform-original, pending review, no depiction policy | Mostly Arabic; global UI support | Prior 360 evidence exists; rerun pending | Warm family wing, still thin for story journeys/video theatre | PARTIAL |
| `/children-tv` | `ChildrenTVPage` | `childrenAdaptationRegistry` | 5 adaptations, 0 cleared media assets | Same active component as `/kids`; no actual video playback | No cleared videos; theatre not real yet | Honest no-media state required; current code needs runtime confirmation | Same | Prior desktop evidence exists; rerun pending | Visual family wing but not a true theatre | PARTIAL |
| `/daily` | `DailyRemindersPage` | Local tasbih state plus source-warning content | 5 `AZKAR_DATA` records exist globally, but this route intentionally blocks corpus claims | Counter interaction, local state | None | Daily adhkar corpus is blocked pending provenance/grade/rights review | Mostly Arabic; shell global | Prior 360 evidence exists; rerun pending | Quiet daily sanctuary | PARTIAL |
| `/daily-reminders` | Redirect to `/daily` | n/a | n/a | Redirect | n/a | n/a | n/a | Not verified | n/a | IMPLEMENTED BUT NOT VERIFIED |
| `/prophetic-day` | `PropheticDayPage` | `PROPHETIC_DAY_STATIONS` | 6 stations | Station reading/navigation | None | Needs route-level evidence/source drawer review | Mostly Arabic | Not verified in this mission | Supporting journey style | IMPLEMENTED BUT NOT VERIFIED |
| `/24-hours` | `PropheticDayPage` | Same as `/prophetic-day` | 6 stations | Same | None | Same | Same | Not verified | Same | IMPLEMENTED BUT NOT VERIFIED |
| `/sources` | `SourcesPage` | `sourceRegistry`, `rightsLedger`, `providerResourceRegistry`, `workRegistry` | 15 sources, 7 rights, 7 resources, 17 works | Search/filter-ish registry browsing, provider resource display | 0 cleared media | Strong provenance center | Mostly Arabic/English labels; global shell | Prior 360/1440 evidence exists; rerun pending | Research vault | PARTIAL |
| `/search` | No active route; global search dialog exists in institutional header | `GlobalSearchDialog` indexes Seerah, azkar, works | 8 Seerah chapters, 5 azkar, 17 works | Cmd/Ctrl+K and header search dialog | None | Mixed; search result sources vary | UI localized partly | Dialog not verified in this mission | Overlay, not route | NOT IMPLEMENTED |
| `/ai-assistant` | `AlMubeenBotPage` inside `AppLayout` | Local pages/data; server `/api/ai/ask` exists but auth/mock constraints remain | Unknown index size; uses local knowledge snippets | Chat/search UI | None | AI must remain research companion; no fatwa claim | Mixed legacy route labels | Prior HTTP evidence only; visual rerun pending | Legacy assistant layout | PARTIAL |
| `/islamic-ai-management` | `IslamicAIManagementPage` inside `AppLayout` | Management UI/static data | Unknown | Admin-like controls | None | Needs audit before product claim | Mixed | Not verified | Dashboard-like | IMPLEMENTED BUT NOT VERIFIED |
| `/al-mufti-al-mubeen` | `AlMuftiAlMubeenPage` inside `AppLayout` | Hadith samples, who-is chapters, work registry | 4 hadith samples, 12 chapters, 17 works | Search/research query UI | None | Must not be treated as issuing fatwa; old naming still user-facing in route/component | Mixed | Not verified | Legacy | PARTIAL |
| `/calendar` | `IslamicCalendarPage` inside `AppLayout` | Server `/api/calendar/events` uses hardcoded 2024-era data unless page has replacement | Unknown | Calendar browsing | None | Needs current-date and source review | Mixed | Not verified | Supporting route | PARTIAL |
| `/qibla-compass` | `QiblaCompassPage` inside `AppLayout` | Browser geolocation/math or static UI; not audited deeply yet | n/a | Compass/location interactions expected | None | Must not claim precision beyond implementation | Mixed | Not verified | Supporting route | IMPLEMENTED BUT NOT VERIFIED |
| `/digital-tasbih` | `DigitalTasbihPage` inside `AppLayout` | Local counter/persistence likely | n/a | Counter controls | None | No reward claims should be made without source | Mixed | Not verified | Supporting route | IMPLEMENTED BUT NOT VERIFIED |
| `/prayer-guide` | `PrayerGuidePage` inside `AppLayout` | `PRAYER_GUIDE_STEPS` | 0 steps | Page shell only if it depends on empty dataset | None | Needs source/content acquisition | Mixed | Not verified | Legacy/supporting | PARTIAL |
| `/daily-verse` | `DailyVersePage` inside `AppLayout` | `/api/quran/daily-verse` and static tafsir sample logic | API route not found in inspected server route list; page may error/fallback | Daily verse UI expected | None | Needs Quran source and tafsir rights separation | Mixed | Not verified | Legacy/supporting | IMPLEMENTED BUT NOT VERIFIED |
| `/five-pillars` | `FivePillarsPage` inside `AppLayout` | Static route content | Unknown | Reading/cards | None | Needs source audit | Mixed | Not verified | Legacy/supporting | IMPLEMENTED BUT NOT VERIFIED |
| `/women-in-islam` | `WomenInIslamPage` inside `AppLayout` | Static route content | Unknown | Reading/cards | None | Needs source audit | Mixed | Not verified | Legacy/supporting | IMPLEMENTED BUT NOT VERIFIED |
| `/islamic-knowledge` | `IslamicKnowledgePage` inside `AppLayout` | `ISLAMIC_KNOWLEDGE_DATA` | Small static module | Browsing | None | Needs source audit | Mixed | Not verified | Legacy/supporting | IMPLEMENTED BUT NOT VERIFIED |
| `/dashboard` | `DashboardPage` inside `AppLayout` with sidebar | Local/server progress APIs | Unknown | Dashboard interactions | None | Not primary public institution | Mixed | Not verified | Dashboard-like by design | IMPLEMENTED BUT NOT VERIFIED |
| `/bab-alsamaa-settings` | `BabAlsamaaSettingsPage` inside `AppLayout` | Local notification settings/services | Unknown | Settings controls | None | Supporting feature, not content wing | Mixed | Not verified | Legacy/supporting | IMPLEMENTED BUT NOT VERIFIED |

## Major Findings

1. The current product already has an institutional visual foundation and governed registries. The next work should extend the active pages, not resurrect archived prototype pages or parallel datasets.
2. The strongest real content foundation is the Arabic Quran text: 6236 ayahs from an acquired Tanzil artifact with rights ledger coverage for Arabic display. Translation, tafsir, and audio are separate unresolved rights/editorial tracks.
3. The library is bibliographically meaningful but still correctly catalog-first: 17 works and 33 OpenITI versions are visible, while full reading/downloading is blocked until version-level rights and edition review are registered.
4. Seerah and Who-is-Muhammad have real structured content, but claim-level scholarly review, page/edition anchoring, media, and synchronized deep-route work remain partial.
5. Children and media are intentionally constrained: 5 original adaptations exist, 0 cleared media assets exist, and no real video theatre should be claimed yet.
6. Search exists as a global dialog, not as `/search`. `/quran/*`, `/seerah/*`, `/sunnah/*`, and `/learn/*` deep paths are not implemented as families.
7. Several supporting routes still use `AppLayout` and legacy route/component names. They need later institutional-shell migration or explicit quarantine, but not at the cost of breaking verified public wings.

## Immediate Phase 1 Implications

The design-system/global-shell slice should focus on shared material depth, route truth labels, responsive shell consistency, and evidence affordances that improve the already-active institutional routes. It must not pretend to clear rights, add fake media, or turn catalog-only records into readable/downloadable content.
