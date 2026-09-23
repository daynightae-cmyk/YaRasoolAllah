# DEEP EXPERIENTIAL REALITY AUDIT

**Date:** 2026-09-23  
**Base SHA:** df5da118675ef79529b119f55e956387f501289e (origin/main)  
**Branch:** base44/setup-0a1b567e  
**Method:** Source-code reading + live runtime DOM inspection (preview panel hidden during capture; visual screenshots pending)

---

## Summary Verdict

The repository is a **genuinely advanced foundation** — not a stub. It has real Tanzil Quran corpus (114/6236), 8 Seerah chapters with timeline events, 12 "Who Is Muhammad" chapters with verified evidence, 6 hadith collection records, 17-work bibliographic registry with OpenITI version metadata, a sophisticated source-governance system (source registry + rights ledger + provider resources + usage gates), and a strong institutional CSS design language (deep obsidian / antique gold / cypress / parchment).

The primary gaps are **interactive depth and spatial differentiation** — most wings still resolve to card grids or text readers rather than wing-specific spatial interaction models. The "CARD → CARD → click to learn more" pattern is present on the home page wings grid and several sub-pages.

---

## Route-by-Route Audit

| Route | Active Component | Data Source | Data Volume | Interactions | Media | Source/Provenance | Multilingual | Mobile | Visual Depth | Functional Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `/` | GateOfLightPage | seerahChapters, workRegistry, BRAND | 4 seerah teasers, 17 works across 3 cats | EvidenceDrawer modal, continuation panel, depth selector | None | EvidenceDrawer with status | AR primary, partial EN | Responsive CSS exists | **HIGH** — gate-stage hero with arch/light, portal nav, shelf teasers | IMPLEMENTED BUT NOT VERIFIED (visual QA pending) |
| `/who-is-muhammad` | WhoIsMuhammadPage | WHO_IS_MUHAMMAD_CHAPTERS (12 chapters) | 12 chapters, full narrative AR+EN, quran connections, evidence | Chapter navigation, evidence display | None | coreEvidence array with status field per chapter | AR+EN bilingual content | Unknown | Medium — chapter reader | IMPLEMENTED BUT NOT VERIFIED |
| `/who-is-muhammad/:chapter` | WhoIsMuhammadPage (param) | Same | Single chapter deep-view | Same | None | Same | Same | Unknown | Same | IMPLEMENTED BUT NOT VERIFIED |
| `/character` | WhoIsMuhammadPage (defaultChapterId) | Same, jumps to family-and-personal-character | 1 chapter | Same | None | Same | Same | Unknown | Same | IMPLEMENTED BUT NOT VERIFIED |
| `/seerah` | SeerahPage | seerahChapters (8), seerahCategories, HISTORICAL_LOCATIONS (7), workRegistry | 8 chapters, ~24 timeline events, 7 locations, 4 cause-event chains | 5 tabs: chapters, timeline, battles (MountainousBattlefieldMap), map, causes; chapter reader with source drawer | SVG battlefield map component | SourceDrawer with provenance | AR only | Responsive | **HIGH** — most spatially diverse page; has tabs, timeline, atlas, geography | IMPLEMENTED BUT NOT VERIFIED |
| `/quran` | QuranPage | quranService → quranCorpus (Tanzil 114/6236) | 114 surahs, 6236 verses, English sample translation | Surah selector, verse navigation, bookmark (localStorage), copy, tafsir drawer (disabled), translation selector (EN only), EvidenceDrawer | None (audio is separate page) | EvidenceDrawer with Tanzil SHA-256 attribution | AR text + EN sample only; FR/UR/TR/ES explicitly disabled | Responsive grid | Medium — reading sanctuary with cartouche | IMPLEMENTED BUT NOT VERIFIED |
| `/quran-audio` | QuranAudioPage | quranAudio data | Unknown reciter list | Audio player controls, reciter selector, surah list | Audio player UI | Unknown | Unknown | Unknown | Unknown | PARTIAL — needs runtime inspection |
| `/sunnah` | SunnahPage | HADITH_COLLECTIONS (6), HADITH_DEVELOPMENT_SAMPLES (4) | 6 collections (all `isAvailable: false`), 4 sample hadiths | Collection shelves, hadith reader | None | SourceDrawer / provenance per hadith | AR+EN | Responsive | Medium — archive aesthetic with provider band | IMPLEMENTED BUT NOT VERIFIED |
| `/library` | DigitalLibraryPage | workRegistry (17), digitalVersionRegistry (33 versions) | 17 works, 33 digital versions, all `catalog_only` | Visual shelves (knowledge-spine CSS), catalog desk, version register | None | Full bibliographic provenance, rights per version | AR titles + EN metadata | Responsive | **HIGH** — living shelves CSS, catalog desk, work register | IMPLEMENTED BUT NOT VERIFIED |
| `/kids` `/children-tv` | ChildrenTVPage | childrenAdaptationRegistry (5) | 5 adaptations, all `editorial_review_pending` | Unknown — 92 lines, likely minimal | Unknown | adaptation registry with depictionPolicy | AR only | Unknown | Unknown | PARTIAL — needs runtime inspection |
| `/daily` | DailyRemindersPage | azkarData, prayerGuideData | Unknown | Azkar counter, prayer times | None | Unknown | AR only | Unknown | Unknown | PARTIAL — needs runtime inspection |
| `/sources` | SourcesPage | sourceRegistry (15), rightsLedger (7), providerResourceRegistry (7), providerPolicyRegistry (17) | 15 sources, 7 rights, 7 resources, 17 policies | Provenance search, rights summary, provider ledger, operational ledger | None | This IS the source infrastructure | AR+EN | Responsive | **HIGH** — research/provenance center with ledgers | IMPLEMENTED BUT NOT VERIFIED |
| `/prophetic-day` `/24-hours` | PropheticDayPage | propheticDailyData | Unknown | Unknown | None | Unknown | AR only | Unknown | Unknown | PARTIAL — needs runtime inspection |
| `/ai-assistant` | AlMubeenBotPage | islamicAI service, geminiService | Demo responses (no real API) | Chat interface | None | Demo only — no real AI provider connected | AR only | Unknown | Unknown | PARTIAL — demo only, no real provider |
| `/calendar` | IslamicCalendarPage | use-islamic-calendar hook | Unknown | Calendar display | None | Unknown | AR only | Unknown | Unknown | PARTIAL — needs runtime inspection |
| `/qibla-compass` | QiblaCompassPage | Unknown (geolocation) | N/A | Compass interaction | None | N/A | AR only | Unknown | Unknown | PARTIAL — needs runtime inspection |
| `/digital-tasbih` | DigitalTasbihPage | Local state | N/A | Counter interaction | None | N/A | AR only | Unknown | Unknown | PARTIAL — needs runtime inspection |
| `/daily-verse` | DailyVersePage | quranCorpus, DailyVerse components | Unknown | Verse display, widget | None | Unknown | AR+EN | Unknown | Unknown | PARTIAL — needs runtime inspection |
| `/islamic-knowledge` | IslamicKnowledgePage | islamicKnowledgeData | Unknown | Unknown | None | Unknown | AR only | Unknown | Unknown | PARTIAL — needs runtime inspection |
| `/five-pillars` | FivePillarsPage | Unknown | Unknown | Unknown | None | Unknown | AR only | Unknown | Unknown | PARTIAL — needs runtime inspection |
| `/women-in-islam` | WomenInIslamPage | Unknown | Unknown | Unknown | None | Unknown | AR only | Unknown | Unknown | PARTIAL — needs runtime inspection |
| `/prayer-guide` | PrayerGuidePage | prayerGuideData | Unknown | Unknown | None | Unknown | AR only | Unknown | Unknown | PARTIAL — needs runtime inspection |
| `/dashboard` | DashboardPage | Multiple | Unknown | Unknown | None | Unknown | AR only | Unknown | Unknown | PARTIAL — needs runtime inspection |
| `/bab-alsamaa-settings` | BabAlsamaaSettingsPage | BabAlsamaa context | Unknown | Settings | None | N/A | AR only | Unknown | Unknown | PARTIAL |
| `/islamic-ai-management` | IslamicAIManagementPage | Unknown | Unknown | Unknown | None | Unknown | AR only | Unknown | Unknown | PARTIAL |
| `/al-mufti-al-mubeen` | AlMuftiAlMubeenPage | Unknown | Unknown | Unknown | None | Unknown | AR only | Unknown | Unknown | PARTIAL |
| `/home` | Redirect to `/` | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | IMPLEMENTED (redirect) |
| `/digital-library` `/books` | Redirect to DigitalLibraryPage | Same as `/library` | Same | Same | Same | Same | Same | Same | Same | IMPLEMENTED (alias) |

---

## Key Findings

### Strengths
1. **Real Quran corpus** — Tanzil Uthmani-min v1.1, 114 surahs / 6236 verses, SHA-256 verified, rights-cleared
2. **Source governance infrastructure** — three-layer system (source registry → rights ledger → provider resources) with programmatic usage gates (`evaluateResourceUsage`)
3. **Institutional design system** — sophisticated CSS with wing-specific hero variants, gate-stage architecture, living shelf CSS, surah cartouche, reading table, catalog desk
4. **Seerah spatial diversity** — 5 tabs (chapters, timeline, battles atlas, geography, cause-event chains) — the most wing-specific page
5. **Bilingual "Who Is Muhammad" content** — 12 chapters with AR+EN full narratives, Quran connections, verified evidence with status
6. **No fake features** — unavailable translations are explicitly disabled; hadith collections marked `isAvailable: false`; tafsir selector disabled with explanation

### Critical Gaps
1. **Card-grid pattern** — Home page wings section is a 4-column card grid; several sub-pages likely follow the same pattern
2. **No real audio playback** — Quran audio page exists but no verified provider connection; recitation player not confirmed functional
3. **No real reading desk** — Library has shelves + catalog but no in-platform reader; all versions are `catalog_only`
4. **No synchronized Seerah workspace** — Timeline, map, event, people, Quran, hadith, sources are separate tabs, not a synchronized workspace
5. **No real AI provider** — AI assistant returns demo responses; no Gemini API key configured
6. **No interactive atlas motion** — MountainousBattlefieldMap exists but route animation/journey playback unconfirmed
7. **Children section minimal** — 92-line page with 5 adaptations, no story reader, no video theatre
8. **Multilingual incomplete** — UI chrome may switch but content is primarily Arabic; EN exists only for "Who Is Muhammad" and Quran sample translation
9. **Visual QA not performed** — No screenshots captured in this session (preview panel hidden)

### Blocked Items
- **Quran Foundation API** — credentials required, not configured
- **Sunnah.com API** — credentials required, not configured  
- **Real recitation audio** — provider rights pending
- **Full book text** — OpenITI versions need per-version rights review
- **AI companion** — needs API key (Gemini or equivalent)
