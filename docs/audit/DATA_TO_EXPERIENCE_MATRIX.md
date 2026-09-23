# DATA-TO-EXPERIENCE MATRIX

**Date:** 2026-09-23  
**Purpose:** Map every dataset in the repository to its current consumer, visibility, interactivity, and next action.

---

## Datasets

| Dataset | Record Count | Source | Rights | Current Consumer | Current Route | Visible? | Interactive? | Searchable? | Downloadable? | Readable? | Playable? | Multilingual? | Status | Next Action |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `quranCorpus.ts` (UTHMANI_VERSES) | 6236 verses / 114 surahs | Tanzil Uthmani-min v1.1 | Cleared (verbatim, attribution) | QuranPage via quranService | `/quran` | YES | Partial (verse nav, bookmark, copy) | NO (no full-text search) | NO | YES (Arabic) | NO | AR only (EN sample for limited verses) | CONNECTED AND USED | Add full-text Arabic search; connect audio |
| `quranAudio.ts` | Unknown | QuranicAudio/EveryAyah | Pending review | QuranAudioPage | `/quran-audio` | Unknown | Unknown | Unknown | NO | N/A | Unknown | Unknown | ADAPTER ONLY | Verify runtime; connect real recitation if rights clear |
| `seerahData.ts` (seerahChapters) | 8 chapters, ~24 timeline events | Editorial (Ibn Hisham, Ibn Kathir) | Editorial review pending | SeerahPage, GateOfLightPage | `/seerah`, `/` | YES | Partial (chapter reader, timeline, map, atlas, causes) | YES (searchChapters) | NO | YES (Arabic narrative) | NO | AR only | CONNECTED AND USED | Build synchronized workspace; add EN translation |
| `whoIsMuhammadData.ts` | 12 chapters, full AR+EN | Editorial (Bukhari, Muslim, Ibn Hisham) | Verified evidence per chapter | WhoIsMuhammadPage | `/who-is-muhammad`, `/character` | YES | Partial (chapter nav, evidence) | NO | NO | YES (AR+EN) | NO | AR+EN bilingual | CONNECTED AND USED | Add chapter journey motion; add FR/UR |
| `hadithData.ts` (HADITH_COLLECTIONS) | 6 collections | Editorial bibliographic | Reference only | SunnahPage, GateOfLightPage | `/sunnah`, `/` | YES | Partial (collection shelves) | NO | NO | NO (isAvailable: false) | NO | AR+EN metadata | CONNECTED AND USED | Build book-tree navigation; connect API when credentials ready |
| `hadithData.ts` (HADITH_DEVELOPMENT_SAMPLES) | 4 sample hadiths | Editorial development sample | Development only | SunnahPage | `/sunnah` | YES | Partial (reader) | NO | NO | YES (AR+EN) | NO | AR+EN | CONNECTED AND USED | Expand samples; separate grade/assessor display |
| `knowledge-registry.ts` (workRegistry) | 17 works | OpenITI RELEASE (pinned) | Bibliographic verified | DigitalLibraryPage, GateOfLightPage, SeerahPage, SunnahPage | `/library`, `/seerah`, `/sunnah`, `/` | YES | Partial (shelves, catalog) | NO | NO | NO (catalog_only) | NO | AR titles + EN metadata | CONNECTED AND USED | Build reading desk; add search/filter |
| `knowledge-registry.ts` (digitalVersionRegistry) | 33 versions | OpenITI RELEASE | catalog_metadata_only | DigitalLibraryPage | `/library` | YES | Partial (version register) | NO | NO | NO | NO | AR only | CONNECTED AND USED | Per-version rights review; connect text when cleared |
| `knowledge-registry.ts` (providerPolicyRegistry) | 17 policies | Editorial research | Verified | SourcesPage | `/sources` | YES | Partial (provider ledger) | NO | N/A | N/A | N/A | AR+EN | CONNECTED AND USED | Keep as infrastructure; surface via drawers |
| `knowledge-registry.ts` (childrenAdaptationRegistry) | 5 adaptations | Platform original | Editorial review pending | ChildrenTVPage | `/kids`, `/children-tv` | Unknown | Unknown | NO | NO | Unknown | NO | AR only | CONNECTED BUT NOT CONSUMED | Build story reader; age-band UI; verify visibility |
| `source-registry.ts` (sourceRegistry) | 15 sources | Editorial research | Various | SourcesPage, EvidenceDrawer | `/sources`, global | YES | Partial (ledger display) | YES (provenance search) | N/A | N/A | N/A | AR+EN | CONNECTED AND USED | Keep as infrastructure backbone |
| `source-registry.ts` (rightsLedger) | 7 rights records | Editorial research | Various | SourcesPage, evaluateResourceUsage | `/sources`, programmatic | YES | Programmatic gates | NO | N/A | N/A | N/A | AR+EN | CONNECTED AND USED | Enforce gates in all data consumers |
| `source-registry.ts` (providerResourceRegistry) | 7 resources | Editorial research | Various | SourcesPage, evaluateResourceUsage | `/sources`, programmatic | YES | Programmatic gates | NO | N/A | N/A | N/A | AR+EN | CONNECTED AND USED | Verify gates fire at consumption points |
| `azkarData.ts` | Unknown | Editorial | Unknown | DailyRemindersPage, AzkarCounter | `/daily` | Unknown | Unknown | NO | NO | Unknown | NO | AR only | CONNECTED BUT NOT CONSUMED | Verify runtime; add source attribution |
| `prayerGuideData.ts` | Unknown | Editorial | Unknown | PrayerGuidePage | `/prayer-guide` | Unknown | Unknown | NO | NO | Unknown | NO | AR only | CONNECTED BUT NOT CONSUMED | Verify runtime |
| `propheticDailyData.ts` | Unknown | Editorial | Unknown | PropheticDayPage | `/prophetic-day`, `/24-hours` | Unknown | Unknown | NO | NO | Unknown | NO | AR only | CONNECTED BUT NOT CONSUMED | Verify runtime |
| `islamicKnowledgeData.ts` | Unknown | Editorial | Unknown | IslamicKnowledgePage | `/islamic-knowledge` | Unknown | Unknown | NO | NO | Unknown | NO | AR only | CONNECTED BUT NOT CONSUMED | Verify runtime |
| `mainStructure.ts` | Unknown | Editorial | Unknown | Unknown | Unknown | Unknown | Unknown | NO | NO | Unknown | NO | AR only | NOT VERIFIED | Inspect and map |
| `islamic-content.ts` / `islamicContent.ts` | Unknown | Editorial | Unknown | Unknown | Unknown | Unknown | Unknown | NO | NO | Unknown | NO | AR only | NOT VERIFIED | Inspect; consolidate if duplicate |
| `fatwas.json` | Unknown | Editorial | Unknown | Unknown | Unknown | Unknown | Unknown | NO | NO | Unknown | NO | AR only | NOT VERIFIED | Inspect and map |
| `Tanzil source file` (data-sources/tanzil) | 114 surahs / 6236 verses | Tanzil.net | Cleared (immutable artifact) | Ingested into quranCorpus.ts via script | N/A (consumed) | NO (source file) | N/A | N/A | N/A | N/A | N/A | AR only | CONNECTED AND USED | Keep immutable; re-ingest only if corpus changes |
| `locales/` (ar, en, fr, ur) | Unknown key count | Editorial | Platform | LanguageContext / i18n | Global (UI chrome) | Partial | Language switcher | N/A | N/A | N/A | N/A | AR+EN+FR+UR (UI) | CONNECTED AND USED | Audit coverage; ensure all chrome strings translated |
| `prayerTimesService.ts` | AlAdhan API | AlAdhan | API-only (cleared) | usePrayerTimes hooks | `/daily`, prayer widgets | Unknown | Unknown | NO | N/A | N/A | N/A | AR only | ADAPTER ONLY | Verify API connectivity at runtime |
| `geminiService.ts` | Gemini API | Google | Needs credential | islamicAI service | `/ai-assistant` | Demo only | Chat UI | NO | N/A | N/A | N/A | AR only | CREDENTIAL REQUIRED | Configure API key; build source-aware responses |
| `mediaAssetRegistry` | 0 assets | N/A | N/A | N/A | N/A | NO | N/A | N/A | N/A | N/A | N/A | N/A | NOT IMPLEMENTED | Acquire rights-cleared media when available |

---

## API/Provider Classification

| Provider | Domain | Status | Credential | Notes |
|---|---|---|---|---|
| Tanzil | Quran text | CONNECTED AND USED | No | Immutable artifact, SHA-256 verified |
| AlAdhan | Prayer times | ADAPTER ONLY | No | API available; verify runtime connectivity |
| Quran Foundation API | Quran translations/audio | CREDENTIAL REQUIRED | Yes | Not configured; OAuth2 + server keys needed |
| Sunnah.com API | Hadith | CREDENTIAL REQUIRED | Yes | Not configured; API key needed |
| OpenITI | Book metadata | CONNECTED AND USED | No | Bibliographic metadata only; full text needs per-version review |
| QuranicAudio | Recitation | RIGHTS REVIEW REQUIRED | No | External link only pending recording-level permission |
| EveryAyah | Recitation | RIGHTS REVIEW REQUIRED | No | License review per recitation |
| Google Gemini | AI companion | CREDENTIAL REQUIRED | Yes | Not configured; needs API key |
| OSM / Natural Earth / GeoNames | Maps | CLEARED (not acquired) | No | Candidate providers; no dataset bundled |
| QDL / Gallica / LoC / IA / Commons / BL / NYPL | Media | RIGHTS REVIEW REQUIRED | No | Candidate institutions; zero production assets |

---

## Priority Actions

1. **HIGH** — Verify runtime of all "PARTIAL" pages (kids, daily, quran-audio, prophetic-day, calendar, qibla, tasbih, etc.) via live preview
2. **HIGH** — Build synchronized Seerah workspace (timeline ↔ map ↔ event ↔ sources in one view)
3. **HIGH** — Add full-text Arabic Quran search across 6236 verses
4. **MEDIUM** — Build library reading desk with catalog record display
5. **MEDIUM** — Build children story reader with age-band UI
6. **MEDIUM** — Connect AlAdhan prayer-times API and verify live data
7. **MEDIUM** — Audit and consolidate duplicate data files (islamic-content.ts vs islamicContent.ts)
8. **LOW** — Configure Gemini API key for AI companion (requires user credential)
9. **LOW** — Acquire rights-cleared media assets (long-term)
