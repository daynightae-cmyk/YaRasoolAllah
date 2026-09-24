# OVERNIGHT REAL-DATA WIRING REPORT — 2026-09-24

Base authority: `origin/main` refreshed at mission start to `8f3a687` (Quran slice closed),
finished at `3c05abb`. Zero open PRs at start; zero open PRs at end.
All 10 section PRs passed the `verify` (Visual Golden Verify) check before merge.
Per-section runtime QA was performed live in-browser with zero console errors and zero
horizontal overflow on every touched route.

Canonical counts (from `validate:sources`): 15 sources · 7 rights records ·
7 provider resources · 17 works · 33 digital versions · 18 provider policies ·
5 children adaptations · 4 review-pending hadith samples · 0 cleared media assets.
Quran corpus: 114 surahs · 6236 ayahs (Tanzil Uthmani-min 1.1, untouched).

## SECTION 1 — DIGITAL LIBRARY
- STARTING MAIN SHA: 8f3a687 · BRANCH: feat/library-real-data-wiring-20260924
- FILES: services/library.ts (new), BookshelfHall.tsx, ReadingChamber.tsx (rewritten),
  LibraryPage.tsx, mock/books.ts (deleted)
- MOCK REMOVED: 27 mock shelf books, fake page counts, excerpts, modes
- REAL WIRED: 17 workRegistry records + 33 digitalVersionRegistry versions; 5 shelves
  derived from real categories (fiqh/manuscript shelves hidden, no filler)
- RIGHTS: all catalog_only — chamber is catalog/version/rights desk; قراءة/استماع disabled
- VERIFIED: shelf filter, record dialog with 6 versions, search; /library + /quran regression
- GATES: check ✓ validate ✓ build ✓ · PR #28 · MERGE 3049566 · IMPLEMENTED AND VERIFIED

## SECTION 2 — TAFSIR & TADABBUR
- STARTING MAIN SHA: 3049566 · BRANCH: feat/tafsir-real-data-wiring-20260924
- FILES: services/tafsir.ts (new), TafsirPage.tsx (rewritten)
- MOCK REMOVED: hardcoded Ayat al-Kursi + invented English translation, 4 fake word
  meanings, 4 fake tafsir tabs/text, dead surah/ayah/share/copy/audio buttons
- REAL WIRED: real verse selection across 114 surahs (Tanzil corpus) with prev/next
  navigation; 5 catalogued tafsir works with version/rights metadata
- RIGHTS: full tafsir text unavailable — honest unavailable states; notes are local user notes
- VERIFIED: surah select, ayah step 256→257, tafsir tabs, no overflow
- GATES: check ✓ validate ✓ build ✓ · PR #29 · MERGE 7a4c839 · IMPLEMENTED AND VERIFIED

## SECTION 3 — HADITH & SUNNAH
- STARTING MAIN SHA: 7a4c839 · BRANCH: feat/hadith-real-data-wiring-20260924
- FILES: services/hadith.ts (new), HadithPage.tsx (rewritten), IsnadChain.tsx (rewritten honest)
- MOCK REMOVED: fake corpus counts (14,678 / 62,831…), fake topics, fake narrators,
  fake isnad chain (الراوي 02…), static Hadith-of-day presented as corpus
- REAL WIRED: 6 collection definitions shown strictly as bibliographic metadata
  (totals labeled, isAvailable=false); 4 development samples with separated fields:
  grade vs grade source vs grade assessor (null shown, never invented) vs editorial
  review vs provenance vs availability
- VERIFIED: collection filter, sample select (muslim-2577), search; no overflow
- GATES: check ✓ validate ✓ build ✓ · PR #30 · MERGE 6955df8 · IMPLEMENTED AND VERIFIED

## SECTION 4 — SEERAH
- STARTING MAIN SHA: 6955df8 · BRANCH: feat/seerah-real-data-wiring-20260924
- FILES: services/seerah.ts (new), SeerahPage.tsx (rewritten)
- MOCK REMOVED: fabricated stage years (570م/610-622…), fake 5-event list, fake figures,
  fake places, fake 60% progress, fake intro-film button
- REAL WIRED: 8 canonical chapters in narrative order (مرحلة/ترتيب سردي labels),
  per-chapter events/keywords/related from seerahData; locations labeled schematic
- LOCAL STATE: read-tracking progress (localStorage), clearly labeled on-device only
- VERIFIED: chapter stepping, related links, events; no overflow
- GATES: check ✓ validate ✓ build ✓ · PR #31 · MERGE 9f789c5 · IMPLEMENTED AND VERIFIED

## SECTION 5 — HISTORICAL ATLAS
- STARTING MAIN SHA: 9f789c5 · BRANCH: feat/atlas-real-data-wiring-20260924
- FILES: services/atlas.ts (new), AtlasPage.tsx (rewritten)
- MOCK REMOVED: 7 coordinate-style markers, exact-route polylines, invented inspector
  (7 هـ شوال, parties, outcomes), fake 1–10 هـ ticks, fake filters, fake compass bearing
- REAL WIRED: schematic nodes derived from seerah timeline-event locations with real
  mention lists; every node classified SCHEMATIC with legend; narrative-order links
  labeled as such; working filters, visual tour, list mode; decorative compass fixed
- Inspected (not copied): MountainousBattlefieldMap honest evidence-strip pattern
- VERIFIED: battles filter (مكة 7 mentions), marker select, tour; no overflow
- GATES: check ✓ validate ✓ build ✓ · PR #32 · MERGE 450a7af · IMPLEMENTED AND VERIFIED

## SECTION 6 — KIDS & FAMILY
- STARTING MAIN SHA: 450a7af · BRANCH: feat/kids-real-data-wiring-20260924
- FILES: services/kids.ts (new), KidsPage.tsx (rewritten), TvLounge.tsx + StoryTheatre.tsx (reading mode)
- MOCK REMOVED: 4 invented stories, fake video playback, fake counts/challenges/hours
- REAL WIRED: 5 childrenAdaptationRegistry records (title, summary, age band, source
  IDs, adaptation label, editorial/review status, depiction policy); 0 cleared media →
  TV is preview/reading mode with MEDIA NOT CLEARED notice
- LOCAL STATE: seen adaptations, coloring sessions, earned badges derived locally
- Dead buttons (puzzles/DIY/challenges/parent resources) honestly disabled as قيد الإعداد
- VERIFIED: reading-mode dialog with full provenance; coloring studio; no overflow
- GATES: check ✓ validate ✓ build ✓ · PR #33 · MERGE 251b940 · IMPLEMENTED AND VERIFIED

## SECTION 7 — DAILY / PRAYER OBSERVATORY
- STARTING MAIN SHA: 251b940 · BRANCH: feat/prayer-observatory-real-data-20260924
- FILES: services/prayerTimesService.ts (quarantined), DailyPage.tsx (adhkar honesty)
- REMOVED DANGER: legacy catch→hardcoded-Riyadh-times, geo-error→Riyadh-resolve —
  failures now throw so UI renders offline/provider-error/permission-denied states
- Golden Observatory (pre-existing AlAdhan layer) audited: provider times, city catalog
  (default Abu Dhabi), explicit-only geolocation, method attribution, tomorrow-Fajr
  next-prayer, cached/offline states — kept, not rewritten
- DailyPage: fake adhkar corpus card (1/15 counter, dead category buttons) replaced
  with source-review-pending state; tasbih (real local tool) untouched
- VERIFIED LIVE: Abu Dhabi times from provider (≠ old hardcoded set); country switch
  to UK updated all times/method; no console errors
- GATES: check ✓ validate ✓ build ✓ · PR #34 · MERGE f452f9d · IMPLEMENTED AND VERIFIED

## SECTION 8 — QURAN AUDIO
- STARTING MAIN SHA: f452f9d · BRANCH: feat/audio-real-data-wiring-20260924
- FILES: services/audio.ts (new), AudioPage.tsx (rewritten)
- MOCK REMOVED: 8 named reciters as available, simulated play/EQ/progress, fake counts
  (48 تلاوة…), fake quality tags, fake durations
- REAL WIRED: 3 provider records (QuranicAudio external-link-only, EveryAyah
  license-review, Quran Foundation credential) with rights states; real 114-surah
  metadata for browsing; 0 cleared recordings → all transport controls disabled
- quranAudio.ts unreviewed index deliberately NOT consumed (per its own header)
- VERIFIED: surah select updates theatre header; static waveform; no overflow
- GATES: check ✓ validate ✓ build ✓ · PR #35 · MERGE 57dceaa · IMPLEMENTED AND VERIFIED

## SECTION 9 — BASIRAH
- STARTING MAIN SHA: 57dceaa · BRANCH: feat/basirah-real-search-20260924
- FILES: services/basirah.ts (new), BasirahPage.tsx, BasirahAnswer/EvidenceCard/
  SourceRail/RelatedPath/ModeSelector (rewired), mock/basirah.ts (deleted)
- REAL WIRED: local discovery index — 114 surahs + 8 seerah chapters + 4 hadith
  samples + 17 works + 15 sources, each with source/path/availability; scope search;
  answer lanes report related sources found, never generate religious answers
- Boundary preserved: not a mufti/fatwa engine
- VERIFIED: البخاري search returns real samples with availability; scope filter; no overflow
- GATES: check ✓ validate ✓ build ✓ · PR #36 · MERGE 010b785 · IMPLEMENTED AND VERIFIED

## SECTION 10 — HOME + DISCOVERY + GLOBAL SEARCH
- STARTING MAIN SHA: 010b785 · BRANCH: feat/home-real-discovery-wiring-20260924
- FILES: services/discovery.ts (new canonical adapter), HomePage.tsx (rewritten),
  HomePage.module.css (facts strip), DiscoveryPalette.tsx (unified),
  BasirahPage.tsx (?q= handoff), mock/discovery.ts (deleted)
- MOCK REMOVED: fake continue-reading (رياض الصالحين placeholder), fake hadith-of-day
  text, dead hero search, dead gear/more buttons
- REAL WIRED: registry-derived facts (114/6236 derived from chapter metadata at
  runtime + 17/33/seerah/hadith counts); real daily verse (corpus rotation);
  local continue signals + real favorites; hero search → /basirah?q=
- GlobalSearchDialog already real-indexed; documented discovery.ts as canonical adapter
- VERIFIED: facts render, daily verse loads, hero search handoff end-to-end; no overflow
- GATES: check ✓ validate ✓ build ✓ · PR #37 · MERGE 3c05abb · IMPLEMENTED AND VERIFIED

## SUPPORTING ROUTE RECONCILIATION
- KEEP ACTIVE (golden, wired): / /library (+/digital-library /books) /quran /tafsir
  /seerah /atlas /hadith (+/sunnah) /kids (+/children-tv) /daily /audio (+/quran-audio) /basirah
- REDIRECT (existing, kept): /home→/ /daily-reminders→/daily /al-mufti-al-mubeen→/basirah /ai-assistant→/basirah
- SUPPORTING TOOL (legacy AppLayout, unchanged, out of scope): /sources /prayer-guide
  /calendar /qibla-compass /digital-tasbih /daily-verse /prophetic-day /24-hours
  /dashboard /bab-alsamaa-settings /islamic-ai-management
- LEGACY CONTENT (unchanged, out of scope): /who-is-muhammad /character /five-pillars
  /women-in-islam /islamic-knowledge
- No routing inconsistencies found; no changes made here.

## FINAL ACCEPTANCE (main 3c05abb)
- npm ci ✓ · npm run check ✓ · npm run validate:sources ✓ (PASS line above) ·
  npm run build ✓ · git diff --check ✓
- Smoke (dev server, desktop): / /library /quran /tafsir /seerah /atlas /hadith
  /kids /daily /audio /basirah — all render, 0 console errors, 0 horizontal overflow.
- Quran slice untouched and healthy throughout (regressed after library + final smoke).
- One environment incident (stale dev-server file lock broke a mid-run `npm ci`) was
  recovered by stopping only this mission's orphaned processes and reinstalling;
  no other agents' processes were touched.

## KNOWN BLOCKERS (honestly unavailable, by design)
- Full book texts: catalog_only until per-version rights review.
- Full tafsir texts + licensed translations + word meanings: not cleared.
- Full hadith corpora (all 6 collections): only 4 dev samples local.
- Exact historical geo (routes/positions/distances): schematic only.
- Kids video/audio media: 0 cleared assets; adhkar daily corpus: review pending.
- Quran audio recordings: 0 cleared; provider links only.
- Basirah grounded answer engine: discovery only, no generated answers.
