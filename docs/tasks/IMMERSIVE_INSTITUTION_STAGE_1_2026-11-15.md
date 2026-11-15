# Immersive Institution — Stage 1 Delivery — 2026-11-15

```text
PROJECT: Ya Rasool Allah
STAGE: 1 — 2D institutional shell, unified workspace state/navigation/search, local reading progress, and shell accessibility hardening
STATUS: IMPLEMENTED_LOCAL_UNCOMMITTED
BASE_SHA: df4880589016aa4681b6d43233ecc136f4e32238
FINAL_SHA: df4880589016aa4681b6d43233ecc136f4e32238 (HEAD; Stage 1 exists only as an uncommitted working-tree state)
BRANCH: main
WORKTREE: K:/Knoux Projects/YaRasoolAllah/Base

WHAT_ALREADY_EXISTED:
- The canonical App.tsx route registry, the visual-golden route shell, and the existing route-level route mapping were retained; no route was replaced.
- The pre-existing global ThemeProvider and LanguageContext remained in place and were adapted to the institutional store instead of being duplicated or removed.
- The pre-existing Library and door 3D scenes remained available. Stage 1 did not claim that their runtime was safe or optimized; that work belongs to Stage 2.
- The eight already-dirty protected JPGs under artifacts/visual-evidence/ were owner work recorded in Stage 0. They were not edited, restored, staged, deleted, or used as a Stage 1 target.
- The same uncommitted worktree also contains the separately audited deterministic media-ingestion task (TASK_004). Its files are listed under "parallel work retained" below and are not misrepresented as shell work.

WHAT_WAS_IMPLEMENTED:
- Added canonical wing/room metadata in client/src/visual-golden/lib/institution/workspace.ts. Public aliases such as /digital-library, /sunnah, /tafsir, /quran-audio, /prayer-guide, and /islamic-knowledge resolve to the correct canonical navigation wing while preserving their local path/query.
- Added an institutional Zustand store at client/src/visual-golden/lib/institution/store.ts. It owns persisted theme, institutional UI language, motion preference, local journey, and reading-progress state. The existing global theme/language providers now adapt to that authority instead of maintaining a second persisted theme language.
- Added a sanitized local reading-progress registry at client/src/visual-golden/lib/institution/reading-progress.ts. A percentage exists only when a real numerator and denominator are both present; completed > total is rejected. Seerah, Quran, Hadith, Library, and Kids surfaces record only positions/counts they can prove.
- Completed the shell slice: breadcrumb/workspace identity, truthful wing/data status, status center, local activity rail, unified wing/book/record/Quran/Basirah search, theme/motion controls, mobile navigation, focus-trapped drawer, and explicit CSS-module state maps.
- Added Quran ?q= deep-link search initialization and made Home resume the newest proven local reading position. The former fixed 42% Home indicator was removed.
- Kept shell overlays mutually exclusive for header, keyboard, and panel entry points. Runtime testing found that Ctrl/Cmd+K could previously leave the drawer and search dialog open simultaneously; the shortcut now routes through the same arbitration as header actions.
- Hardened the shell at runtime: mobile drawer Escape handling and focus restoration, 44px primary shell touch targets, small-screen preference-menu containment, visible-label/accessibility-name alignment, sequential Quran side-panel headings, and valid client/public/robots.txt.
- Synchronized global ThemeProvider and LanguageContext with the institutional store. Institutional chrome supports ar/en/fr/ur; French and Urdu use reviewed English fallback copy where reviewed translation is not yet available. Content-language declarations remain independent and truthful.
- Added scripts/institution-shell-contract.test.ts and registered it in npm run test:p0. The suite now covers aliases, progress sanitization/percentage truth, overlay arbitration, focus trapping, touch-target CSS, provider authority, heading order, and the absence of a fixed Home progress percentage.
- Added a separate Stage 1 evidence set under artifacts/institution-stage-evidence/stage-1/. It does not overwrite or replace the protected artifacts/visual-evidence/ JPGs.

EXACT_CHANGED_FILES:
- Core institutional state and metadata:
  - client/src/visual-golden/lib/institution/store.ts
  - client/src/visual-golden/lib/institution/workspace.ts
  - client/src/visual-golden/lib/institution/reading-progress.ts
  - client/src/visual-golden/lib/i18n.ts
  - client/src/components/ThemeProvider.tsx
  - client/src/contexts/LanguageContext.tsx
- Shell and unified discovery:
  - client/src/visual-golden/components/shell/InstitutionShell.tsx
  - client/src/visual-golden/components/shell/InstitutionHeader.tsx
  - client/src/visual-golden/components/shell/InstitutionSidebar.tsx
  - client/src/visual-golden/components/shell/MobileNav.tsx
  - client/src/visual-golden/components/shell/ShellDrawer.tsx
  - client/src/visual-golden/components/shell/InstitutionActivityRail.tsx
  - client/src/visual-golden/components/shell/InstitutionStatusCenter.tsx
  - client/src/visual-golden/components/shell/shell-state.ts
  - client/src/visual-golden/components/shell/shell.module.css
  - client/src/visual-golden/components/present/DiscoveryPalette.tsx
  - client/src/visual-golden/components/present/present.module.css
- Reading surfaces and verified language fallbacks:
  - client/src/visual-golden/pages/HomePage.tsx
  - client/src/visual-golden/pages/HomePage.module.css
  - client/src/visual-golden/pages/QuranPage.tsx
  - client/src/visual-golden/pages/QuranPage.module.css
  - client/src/visual-golden/pages/SeerahPage.tsx
  - client/src/visual-golden/pages/HadithPage.tsx
  - client/src/visual-golden/pages/KidsPage.tsx
  - client/src/visual-golden/pages/LibraryPage.tsx
  - client/src/visual-golden/components/basirah/BasirahEvidenceCard.tsx
  - client/src/visual-golden/components/basirah/BasirahModeSelector.tsx
  - client/src/visual-golden/components/basirah/BasirahRelatedPath.tsx
  - client/src/visual-golden/components/basirah/BasirahSourceRail.tsx
  - client/src/visual-golden/components/ceremony/SplashCeremony.tsx
  - client/src/visual-golden/components/library/BookshelfHall.tsx
  - client/src/visual-golden/components/library/CatalogReadingChamber.tsx
  - client/src/visual-golden/components/library/Library3D.tsx
  - client/src/visual-golden/components/library/LibraryCatalog.tsx
  - client/src/visual-golden/components/prayer/PrayerCards.tsx
  - client/src/visual-golden/components/present/ViewSwitcher.tsx
  - client/src/visual-golden/components/shared/SectionHead.tsx
  - client/src/visual-golden/services/catalog-library.ts
  - client/src/visual-golden/services/content-language.ts
  - client/src/visual-golden/services/discovery.ts
  - client/src/visual-golden/services/library-catalog-presentation.ts
  - client/src/visual-golden/services/prayer/qibla.ts
  - client/src/visual-golden/visual-base.css
  - client/public/robots.txt
- Tests, package wiring, and Stage 1 evidence:
  - scripts/institution-shell-contract.test.ts
  - package.json
  - artifacts/institution-stage-evidence/stage-1/home-360-dark-ar.png
  - artifacts/institution-stage-evidence/stage-1/library-360-light-en.png
  - artifacts/institution-stage-evidence/stage-1/quran-search-768-dark-ar.png
  - artifacts/institution-stage-evidence/stage-1/digital-library-alias-1440-light-en.png
  - artifacts/institution-stage-evidence/stage-1/lighthouse-quran-1000x700-light-en.json
  - artifacts/institution-stage-evidence/stage-1/metadata.json
  - docs/tasks/IMMERSIVE_INSTITUTION_STAGE_1_2026-11-15.md
- Parallel work retained in the same worktree, attributed to TASK_004 rather than Stage 1:
  - client/src/visual-golden/components/media/MediaReviewTable.tsx
  - client/src/visual-golden/components/media/MediaReviewTable.module.css
  - client/src/visual-golden/pages/MediaReviewPage.tsx
  - client/src/visual-golden/services/media/review-gates.ts
  - client/src/visual-golden/services/media/types.ts
  - client/src/visual-golden/data/media-discovery.generated.ts
  - client/src/visual-golden/data/media-discovery-status.generated.ts
  - data-sources/media/discovery/ingestion-manifest.json
  - data-sources/media/discovery/ingestion-report.md
  - data-sources/media/discovery/media-discovery-catalog.json
  - scripts/acquire/generate-discovery-catalog.ts
  - scripts/acquire/ingest-media-catalog.ts
  - scripts/media-review-integrity.test.ts
- Preserved owner work not authored or modified by Stage 1:
  - artifacts/visual-evidence/audio-1440-dark-rtl.jpg
  - artifacts/visual-evidence/children-1440-dark-ltr.jpg
  - artifacts/visual-evidence/children-360-light-rtl.jpg
  - artifacts/visual-evidence/daily-360-dark-ltr.jpg
  - artifacts/visual-evidence/daily-768-light-rtl.jpg
  - artifacts/visual-evidence/daily-verse-honesty-1440-dark-rtl.jpg
  - artifacts/visual-evidence/hadith-1440-light-rtl.jpg
  - artifacts/visual-evidence/seerah-1440-dark-rtl.jpg

VISUAL_EVIDENCE:
- route: /
  - viewport: 360x900, device scale factor 1, reduced-motion emulation
  - language/direction: ar / RTL
  - theme: dark
  - screenshot path: artifacts/institution-stage-evidence/stage-1/home-360-dark-ar.png
  - comparison result: runtime smoke only; document width equals viewport width; no console/runtime errors; no visual-match or design-approval claim
  - SHA-256: 41e241da7992adc91620dfb852cb90cc8e1f06b00f02892288b93eed09af8336
- route: /library
  - viewport: 360x900, device scale factor 1, reduced-motion emulation
  - language/direction: en / LTR
  - theme: light
  - screenshot path: artifacts/institution-stage-evidence/stage-1/library-360-light-en.png
  - comparison result: runtime smoke only; no document-level horizontal overflow; no console/runtime errors; the shelf rail intentionally scrolls within its own bounded container
  - SHA-256: 49bc03c9fc659fb5d6245b38fc79ffd491a348f6c9af0d5dede91ca7d29a8aec
- route: /quran?q=الرحمن
  - viewport: 768x1024, device scale factor 1, reduced-motion emulation
  - language/direction: ar / RTL
  - theme: dark
  - screenshot path: artifacts/institution-stage-evidence/stage-1/quran-search-768-dark-ar.png
  - comparison result: runtime smoke only; deep-link query populated the verse search and returned governed local results; no console/runtime errors
  - SHA-256: a4756b50ce2caea13ca9db8972d7322ecf747a4d105ae226576243e2cdcae122
- route: /digital-library
  - viewport: 1440x1000, device scale factor 1, reduced-motion emulation
  - language/direction: en / LTR
  - theme: light
  - screenshot path: artifacts/institution-stage-evidence/stage-1/digital-library-alias-1440-light-en.png
  - comparison result: runtime smoke only; alias retained the route and marked the canonical Library wing active; no console/runtime errors
  - SHA-256: b96d0bbae840c433302ce5257f095483ff3ee7b9d4563c29e92e35118ee053de
- metadata: artifacts/institution-stage-evidence/stage-1/metadata.json
  - capturedAt: 2026-11-15T08:05:33.495Z
  - source HEAD: df4880589016aa4681b6d43233ecc136f4e32238
  - tracked-diff SHA-256 at capture: d2f4f72f3f3bd34b96b61299c65412c0ea2973ff5e4e05a1f1bbf46eab432767
  - note: the tracked-diff hash excludes untracked files; metadata records each untracked file's size and SHA-256 separately.
- In-app browser runtime verification (1000x700 English/light Quran):
  - Escape closed the mobile drawer and restored focus to the menu trigger.
  - Ctrl+K after opening the drawer left exactly one dialog open: the search/command center.
  - /digital-library marked the canonical Library wing active while retaining the alias URL.
  - /quran?q=الرحمن populated the search field and produced "أول 20 نتيجة من النص الموثق".
  - Theme and language survived reload in local storage and shell direction changed from RTL to LTR as expected.
  - Lighthouse: Accessibility 1.00, Best Practices 1.00, SEO 1.00; no failed audits reported by the final run.
  - No browser console errors were reported.

DATA_EVIDENCE:
- source: no new religious/content source was introduced by Stage 1
  - version: not applicable
  - retrievedAt: not applicable
  - hash: not applicable
  - records: not applicable
  - approved: not applicable
  - pending: not applicable
  - rights status: unchanged; discovery remains discovery and does not imply approval or playback
- source: deterministic media-discovery catalog retained from TASK_004
  - version: ingestion-manifest.json current working-tree version
  - retrievedAt: recorded in data-sources/media/discovery/ingestion-report.md
  - hash: catalog da9a0ab92dc4c7fa0ad6951f12f43b01ea5facc2e684d18b762b91522993a3ae; manifest 429728ef13a3251ab40d55950afea213bc42c02c7e518a285fcc2f53ce7b3dec
  - records: deterministic two-run equality was verified for the generated catalog and manifest
  - approved: 0 cleared media assets
  - pending: governed review states remain pending as recorded in the catalog
  - rights status: fail-closed and unchanged by Stage 1

TEST_MATRIX:
- command: npm run check
  - exit code: 0
  - result: TypeScript completed without diagnostics
  - logs/evidence: terminal run on the Stage 1 working tree
- command: npm run lint
  - exit code: 0
  - result: ESLint completed without reported problems
  - logs/evidence: terminal run on the Stage 1 working tree
- command: npm run test:p0
  - exit code: 0
  - result: 257 passed, 0 failed, 32 suites
  - logs/evidence: final run includes scripts/institution-shell-contract.test.ts and scripts/media-review-integrity.test.ts
- command: npm run validate:sources
  - exit code: 0
  - result: 21 sources, 13 rights records, 12 provider resources, 17 works, 33 digital versions, 20 provider policies, 0 rights-cleared audiobooks, 5 children adaptations, 4 review-pending hadith samples, 0 cleared media assets
  - logs/evidence: final source-governance run
- command: npm run validate:kids-youtube
  - exit code: 0
  - result: 2 publishers validated
  - logs/evidence: final registry validation run
- command: npm run build
  - exit code: 0
  - result: Vite built 2259 modules; server bundle 153.4 kB
  - logs/evidence: existing warnings remain for quranCorpus (668.14 kB) and LibraryPage (696.37 kB); no route was removed to hide them
- command: git diff --check
  - exit code: 0
  - result: no whitespace errors; only the repository's existing LF-to-CRLF notices were printed
  - logs/evidence: final working-tree check
- command: headless Chrome responsive/runtime capture at 360x900, 768x1024, and 1440x1000
  - exit code: 0
  - result: four cases captured with no document-level horizontal overflow and no captured console/runtime errors
  - logs/evidence: artifacts/institution-stage-evidence/stage-1/metadata.json
- command: in-app browser focus/overlay/alias/deep-link/persistence checks and final Lighthouse audit
  - exit code: 0
  - result: focus restoration, overlay exclusivity, alias ownership, Quran deep-link search, theme/language persistence, and Lighthouse 1/1/1 verified
  - logs/evidence: browser runtime session and metadata above

SECURITY_AND_RIGHTS:
- No credential, DATABASE_URL, JWT_SECRET, provider key, or production secret was added.
- Local journey, notes, favorites, preferences, and reading progress remain explicitly local-only. Untrusted local values are sanitized; forged surfaces and external paths are rejected.
- Reading percentages are derived only from proven numerator/denominator pairs and never infer religious completion or worship merit.
- Rights/review state remains fail-closed. Search and discovery do not grant approval, publication, or playback.
- The Stage 1 visual artifacts are runtime evidence only and do not claim design approval, source approval, release, or deployment.

STORAGE_CLEANUP:
- inspected: Stage 0 baseline, ignored directories, recovery paths, unique-work register, and current worktree status
- removed exact paths: none
- bytes before/after: not applicable; zero bytes reclaimed
- recovery proof: dist/, node_modules/, .git/, _recovery/, research/, data-sources/, docs/, attached_assets/, branches, backups, and unreachable recovery objects remain preserved

BLOCKERS:
- Production persistence still requires owner-provided secure DATABASE_URL and JWT_SECRET.
- Production deployment/runtime SHA, remote CI/PR state, package signing, and credential-gated providers were not verified and remain externally blocked.
- The existing Library and door 3D runtimes are not yet safe to call bounded: partial-initialization cleanup, context-loss fallback, rAF gating, renderer power policy, reduced-motion behavior, and scene-level lazy loading remain Stage 2 work.
- Non-shell content controls below 44px (for example Library hall chips and some Quran reader controls) remain visible in the 360/768 audit. They do not create document overflow, but full touch-target closure belongs to the responsive/platform stage.
- The Stage 1 visual set is runtime smoke evidence, not stakeholder design approval.

NEXT_SAFE_ACTION:
- Implement Stage 2 as a shared, bounded Three.js runtime primitive with partial-initialization cleanup, context-loss fallback, graphics/power tiering, visibility/intersection/off-screen rAF gating, live reduced-motion behavior, and a complete 2D fallback. Then migrate Library3D and DoorSimulation3D without changing route ownership or gating text/actions.

INTEGRATION_RECOMMENDATION:
- Review the working tree as three separable concerns: Stage 1 shell/product code, TASK_004 deterministic media work, and Stage 0/evidence documentation. Commit them in reviewable units after owner review; do not include the eight protected JPGs in a shell commit unless the owner explicitly authorizes them.
- Keep Stage 1 and Stage 2 on the current branch until the 3D runtime contract and 2D fallback are both verified. Do not force-push, rewrite history, or describe an uncommitted working tree as merged/released.
```
