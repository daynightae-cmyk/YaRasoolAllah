# Page-by-page integration matrix

Current paths checked against GitHub main tree; adapter/script paths are **proposals**, not existing code. Rights gates apply before exposing text/audio/media.

|Route|Current component/service|Current data|Found source|Proposed adapter|Environment|Ingest|Cache|Fallback|Priority|
|---|---|---|---|---|---|---|---|---|---|
|/|HomePage.tsx + services/discovery.ts|registry-backed entry|verified internal registries|discovery.ts|none|none|local|honest unavailable|P0|
|/library|LibraryPage.tsx + services/library.ts + ReadingChamber.tsx|17 works/33 versions catalog-only|OpenITI/Open Library/LOC/QDL IIIF|services/library/providers.ts|none|ingest-openiti.ts, ingest-media.ts|version metadata|catalog desk|P0|
|/quran|QuranPage.tsx + services/quranService.ts|Tanzil local 114/6236|QF translations/metadata|services/quran/qf.ts|QF_CLIENT_ID,QF_CLIENT_SECRET|ingest-qf-resources.ts|by resource/verse|local Tanzil Arabic|P1|
|/tafsir|TafsirPage.tsx + services/tafsir.ts|5 work bibliography only|QF tafsir resource IDs; OpenITI bibliographic|services/tafsir/qf.ts|QF_CLIENT_ID,QF_CLIENT_SECRET|ingest-tafsir.ts|resource+verse|bibliography/unavailable|P1|
|/hadith|HadithPage.tsx + services/hadith.ts|6 collections,4 development samples|Sunnah.com/Dorar/HadeethEnc|services/hadith/providers.ts|SUNNAH_API_KEY if issued|ingest-hadith.ts|query or approved record|clearly labeled samples/external link|P1|
|/seerah|SeerahPage.tsx + services/seerah.ts|8 chapters|pinned OpenITI versions|services/seerah/references.ts|none|ingest-openiti.ts|reviewed record|existing narrative|P2|
|/atlas|AtlasPage.tsx + services/atlas.ts|schematic locations|Natural Earth/MapLibre/OpenHistoricalMap|services/atlas/modern.ts|tile provider key if required|ingest-geodata.ts|modern tiles|schematic layer|P2|
|/kids|KidsPage.tsx + services/kids.ts + TvLounge.tsx|5 adaptations,0 cleared media|curated YouTube/Commons|services/media/youtube.ts|YOUTUBE_API_KEY|ingest-media.ts|curated IDs|reading mode|P1|
|/daily|DailyPage.tsx + services/prayer/aladhan.ts|AlAdhan + curated locations|GeoNames autocomplete, existing AlAdhan|services/prayer/geonames.ts|GEONAMES_USERNAME|ingest-cities.ts optional|date+location+settings|cached real response/unavailable|P0|
|/audio|AudioPage.tsx + services/audio.ts|provider registry,0 cleared recordings|MP3Quran/QF|services/audio/mp3quran.ts|QF_CLIENT_ID,QF_CLIENT_SECRET optional|ingest-audio.ts|reciter+track|external link/unavailable|P0|
|/basirah|BasirahPage.tsx + services/basirah.ts|local discovery|reviewed search_documents + optional pgvector|services/search/provider.ts|DATABASE_URL optional|ingest-index.ts|query+index-version|existing local index|P2|
