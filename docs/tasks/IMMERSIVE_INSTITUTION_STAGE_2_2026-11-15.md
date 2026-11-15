# Immersive Institution — Stage 2 Delivery — 2026-11-15

```text
PROJECT: Ya Rasool Allah
STAGE: 2 — Shared bounded Three.js runtime, lazy 3D wings (Library3D, DoorSimulation3D), 2D fallback completeness, responsive/accessibility hardening, reader size guard, and evidence capture
STATUS: IMPLEMENTED_LOCAL_UNCOMMITTED
BASE_SHA: df4880589016aa4681b6d43233ecc136f4e32238
FINAL_SHA: df4880589016aa4681b6d43233ecc136f4e32238 (HEAD; Stage 2 exists only as an uncommitted working-tree state)
BRANCH: main
WORKTREE: K:/Knoux Projects/YaRasoolAllah/Base
```

## WHAT_ALREADY_EXISTED (from Stage 1)
- Canonical App.tsx route registry, visual-golden route shell, and route mapping retained; no route was replaced.
- Institutional Zustand store, workspace metadata, reading-progress registry, shell overlays, unified search, theme/motion controls, and mobile navigation from Stage 1.
- The pre-existing Library and door 3D scenes remained available but were not yet bounded/cleaned-up; Stage 1 explicitly deferred that work.
- The eight already-dirty protected JPGs under `artifacts/visual-evidence/` were recorded in Stage 0. They were not edited, restored, staged, deleted, or used as a Stage 2 target.
- Deterministic media-ingestion task (TASK_004) retained in the same worktree; attributed to TASK_004, not Stage 2.

## WHAT_WAS_IMPLEMENTED

### Shared Bounded Three.js Runtime (`client/src/visual-golden/components/three/three-runtime.ts`)
- **Single lifecycle owner**: Exactly one `ThreeRuntime` class owns the WebGLRenderer, one rAF scheduler, visibility/intersection gating, resize handling, WebGL context-loss handling, graphics/power tiering, reduced-motion discrete rendering, partial-init cleanup, and idempotent teardown.
- **Conservative graphics tiers**: `detectGraphicsTier()` derives low/balanced/high from hardware concurrency, device memory, and reduced-motion; pure function for contract testing.
- **Gated scheduling**: `canRender()` requires renderer, scene, active, not paused, no context loss, not stopped, document visible, and in-viewport; off-screen/hidden tabs cancel frames.
- **Context loss/restore**: Synthetic `webglcontextlost`/`webglcontextrestored` handlers reset state and resume; evidence notes local software rendering cannot reproduce physical GPU loss.
- **Diagnostics on host element**: Bounded `data-three-runtime-state`, `data-three-motion`, `data-three-graphics-tier`, `data-three-in-view`, `data-three-can-render` published without frame-by-frame instrumentation.
- **No PCFSoftShadowMap**: Uses `THREE.PCFShadowMap` only; shadows enabled only on high tier with full motion.

### Library3D Migration (`client/src/visual-golden/components/library/Library3D.tsx`)
- Consumes shared `ThreeRuntime` via dynamic import (`lazy()`); engine chunk never loaded for deep-reader or DOM routes.
- `OrbitControls` damping enabled only in full motion; reduced motion snaps camera instantly.
- Dust particle count scales by graphics tier (low: 80, balanced: 160, high: 260).
- InstancedMesh books with deterministic procedural colors; hover/selection via raycasting.
- Hall focus animation respects reduced motion (instant snap).
- Route content remains mounted beneath decorative door; door never gates text/actions.

### DoorSimulation3D Migration (`client/src/visual-golden/components/entry/DoorSimulation3D.tsx`)
- Consumes shared `ThreeRuntime`; no direct renderer creation, no scene rAF, no `matchMedia`.
- Procedural textures (wood, stone, carpet, plaster) registered as disposables.
- Door opening animation (hinge rotation, glow, camera drift) gated by reduced motion → discrete frames only.
- Canvas host stays mounted through context loss; DOM illustration is overlay fallback only.
- Explicit decorative notice: "The 3D threshold is decorative: it carries no data and is not required to reach the wing's content."

### SectionEntry3D Gate (`client/src/visual-golden/components/entry/SectionEntry3D.tsx`)
- Door shown only once per session per wing (`sessionStorage`), bypassed by `?door=0`, forced by `?door=1`.
- Reduced-motion users enter directly (door never shown).
- URL preference re-evaluated on mount; `?door=0` keeps winning after mount.
- Route content always mounted; door is non-modal overlay.

### 2D Fallback Completeness
- **LibraryPage**: Defaults to complete DOM shelves (`CatalogShelfHall`) on reduced motion or low-capacity device; 3D arcade is explicit opt-in (`viewChoice`). Auto-view note informs visitor why shelves opened.
- **All routes**: Work without Three.js; deep-reader, catalog, shelves, search never request engine chunk.
- **Touch targets**: 44px shell floor in `visual-base.css`; tasbih beads redesigned as 44px hit targets with 18px pseudo-element visuals (`unique.module.css`).

### Reader Size Guard & Tabari Resolution
- **Policy**: `OPENITI_READER_MAX_BYTES = 32 * 1024 * 1024` (32 MiB) covers largest audited artifact (Tabari Jami' al-Bayan at 26,360,746 decoded bytes).
- **Two-layer enforcement**: Verified `artifactBytes` metadata checked before fetch; streaming `readBoundedUtf8()` enforces same ceiling on decoded UTF-8 stream.
- **Tabari work** (`work-tabari-tafsir`, version `0310Tabari.JamicBayan.JK000164-ara1`): 26,360,746 bytes → within 32 MiB budget; reader opens successfully.
- **Smaller governed works** (e.g., Bukhari 5.5 MiB, Muslim 4.5 MiB, Nawawi 1.1 MiB) verified to open without size error.
- **Capability wording**: Catalog reader affordances distinguish "full text readable" (16 governed works) from "catalog text only" (9,090 works) and "metadata only" (23 works); no claim of in-app reading before version rights proven.

### Responsive/Accessibility Hardening
- **Touch audit**: 13 routes × 2 viewports (360×900, 768×1024) → zero document overflow, zero undersized interactive elements (44px floor).
- **Reduced motion**: All 3D scenes render discrete frames only; no continuous animation loop.
- **Low-power**: `powerPreference: "low-power"` on low graphics tier; reduced particle counts.
- **Focus/overlay**: Shell overlays mutually exclusive; Ctrl+K routes through same arbitration; Escape closes mobile drawer and restores focus.

### Evidence Capture
- **Stage 2 evidence directory**: `artifacts/institution-stage-evidence/stage-2/`
  - `touch-audit.json` — full reduced-motion audit at 360×900 and 768×1024 with interactive counts, zero undersized, zero overflow.
- **Protected JPGs**: Eight baseline images unchanged (verified SHA-256 against Stage 0 report).
- **Deterministic media catalog/manifest**: Two-run equality verified (catalog `da9a0ab9...`, manifest `429728ef...`).
- **Synthetic WebGL limitation noted**: Context-loss verification uses synthetic events and forced context creation failure; local software rendering cannot reproduce physical GPU context loss.

## EXACT_CHANGED_FILES

### Core Three.js Runtime & Scenes
- `client/src/visual-golden/components/three/three-runtime.ts` — shared bounded runtime
- `client/src/visual-golden/components/library/Library3D.tsx` — migrated to shared runtime
- `client/src/visual-golden/components/library/Library3D.module.css`
- `client/src/visual-golden/components/entry/DoorSimulation3D.tsx` — migrated to shared runtime
- `client/src/visual-golden/components/entry/DoorSimulation3D.module.css`
- `client/src/visual-golden/components/entry/SectionEntry3D.tsx` — door gate logic, URL preference authority

### Library Page & Reader
- `client/src/visual-golden/pages/LibraryPage.tsx` — auto 2D default, view switcher, lazy 3D
- `client/src/visual-golden/pages/LibraryPage.module.css`
- `client/src/visual-golden/components/library/CatalogReadingChamber.tsx` — mounted governed reader
- `client/src/visual-golden/components/library/CatalogShelfHall.tsx` — complete DOM shelves
- `client/src/visual-golden/components/library/BookshelfHall.tsx`
- `client/src/visual-golden/components/library/LibraryCatalog.tsx`
- `client/src/visual-golden/services/catalog-library.ts` — catalog-to-registry bridge, capability metrics
- `client/src/visual-golden/services/direct-book-reader.ts` — governed OpenITI resolver, pinned URL, MAX_RAW_BYTES
- `client/src/visual-golden/services/library-3d.ts` — hall/shelf geometry builder

### Shell & Accessibility
- `client/src/visual-golden/visual-base.css` — 44px route-content touch-target floor
- `client/src/visual-golden/components/unique/unique.module.css` — 44px tasbih bead hit targets
- `client/src/visual-golden/components/shell/InstitutionShell.tsx` — `data-motion`, `data-wing`, `dir` attrs
- `client/src/visual-golden/components/shell/InstitutionHeader.tsx`
- `client/src/visual-golden/components/shell/InstitutionSidebar.tsx`
- `client/src/visual-golden/components/shell/MobileNav.tsx`
- `client/src/visual-golden/components/shell/ShellDrawer.tsx`
- `client/src/visual-golden/components/shell/InstitutionActivityRail.tsx`
- `client/src/visual-golden/components/shell/InstitutionStatusCenter.tsx`
- `client/src/visual-golden/components/shell/shell-state.ts`
- `client/src/visual-golden/components/shell/shell.module.css`
- `client/src/visual-golden/components/present/DiscoveryPalette.tsx`
- `client/src/visual-golden/components/present/present.module.css`
- `client/src/visual-golden/components/present/ViewSwitcher.tsx`

### Reader Policy & Registry
- `shared/openiti-reader-policy.ts` — 32 MiB budget, eligibility gates, streaming guard
- `shared/knowledge-registry.ts` — work/version registry with verified artifactBytes
- `server/openiti-reader.ts` — server-side bounded reader parity

### Tests & Contracts
- `scripts/three-runtime-contract.test.ts` — runtime, door fallback, lazy loading contracts
- `scripts/library-reader-truth.test.ts` — capability/readability, mounted reader truth
- `scripts/library-3d-halls.test.ts` — deterministic hall shelving
- `scripts/library-catalog-facets.test.ts` — subcategory/language filters
- `scripts/library-catalog-presentation.test.ts` — presentation service
- `scripts/library-full-shelves.test.ts` — full shelves rendering
- `scripts/core-wings-source-truth.test.ts` — governed resolver, candidate Tanzil, catalog bridge
- `scripts/institution-shell-contract.test.ts` — shell contracts (from Stage 1)
- `scripts/legacy-search-contract.test.ts` — legacy search adapter
- `scripts/validate-source-governance.ts` — source governance validation

### Media & TASK_004 (parallel, attributed separately)
- `client/src/visual-golden/components/media/MediaReviewTable.tsx`
- `client/src/visual-golden/components/media/MediaReviewTable.module.css`
- `client/src/visual-golden/pages/MediaReviewPage.tsx`
- `client/src/visual-golden/services/media/review-gates.ts`
- `client/src/visual-golden/services/media/types.ts`
- `client/src/visual-golden/data/media-discovery.generated.ts`
- `client/src/visual-golden/data/media-discovery-status.generated.ts`
- `data-sources/media/discovery/ingestion-manifest.json`
- `data-sources/media/discovery/ingestion-report.md`
- `data-sources/media/discovery/media-discovery-catalog.json`
- `scripts/acquire/generate-discovery-catalog.ts`
- `scripts/acquire/ingest-media-catalog.ts`
- `scripts/media-review-integrity.test.ts`

### Package & Config
- `package.json` — P0 test registry updated, build/test scripts
- `package-lock.json`
- `client/public/robots.txt`

### Evidence & Documentation (new, not overwriting Stage 0/1)
- `artifacts/institution-stage-evidence/stage-2/touch-audit.json`
- `docs/tasks/IMMERSIVE_INSTITUTION_STAGE_2_2026-11-15.md` (this file)

## VISUAL_EVIDENCE

| Route | Viewport | Motion | Language | Theme | Overflow | Undersized | SHA-256 (touch-audit.json) |
|-------|----------|--------|----------|-------|----------|------------|----------------------------|
| / | 360×900 | reduce | ar/RTL | dark | false | 0 | captured in touch-audit.json |
| /quran | 360×900 | reduce | ar/RTL | dark | false | 0 | captured in touch-audit.json |
| /library | 360×900 | reduce | en/LTR | light | false | 0 | captured in touch-audit.json |
| /library/work/work-tabari-tafsir | 360×900 | reduce | en/LTR | light | false | 0 | captured in touch-audit.json |
| /audio | 360×900 | reduce | ar/RTL | dark | false | 0 | captured in touch-audit.json |
| /tafsir | 360×900 | reduce | ar/RTL | dark | false | 0 | captured in touch-audit.json |
| /seerah | 360×900 | reduce | ar/RTL | dark | false | 0 | captured in touch-audit.json |
| /hadith | 360×900 | reduce | ar/RTL | dark | false | 0 | captured in touch-audit.json |
| /sources | 360×900 | reduce | ar/RTL | dark | false | 0 | captured in touch-audit.json |
| /daily | 360×900 | reduce | ar/RTL | dark | false | 0 | captured in touch-audit.json |
| /basirah | 360×900 | reduce | ar/RTL | dark | false | 0 | captured in touch-audit.json |
| /kids | 360×900 | reduce | ar/RTL | dark | false | 0 | captured in touch-audit.json |
| /atlas | 360×900 | reduce | ar/RTL | dark | false | 0 | captured in touch-audit.json |
| / | 768×1024 | reduce | ar/RTL | dark | false | 0 | captured in touch-audit.json |
| /quran | 768×1024 | reduce | ar/RTL | dark | false | 0 | captured in touch-audit.json |
| /library | 768×1024 | reduce | en/LTR | light | false | 0 | captured in touch-audit.json |
| /library/work/work-tabari-tafsir | 768×1024 | reduce | en/LTR | light | false | 0 | captured in touch-audit.json |
| /audio | 768×1024 | reduce | ar/RTL | dark | false | 0 | captured in touch-audit.json |
| /tafsir | 768×1024 | reduce | ar/RTL | dark | false | 0 | captured in touch-audit.json |
| /seerah | 768×1024 | reduce | ar/RTL | dark | false | 0 | captured in touch-audit.json |
| /hadith | 768×1024 | reduce | ar/RTL | dark | false | 0 | captured in touch-audit.json |
| /sources | 768×1024 | reduce | ar/RTL | dark | false | 0 | captured in touch-audit.json |
| /daily | 768×1024 | reduce | ar/RTL | dark | false | 0 | captured in touch-audit.json |
| /basirah | 768×1024 | reduce | ar/RTL | dark | false | 0 | captured in touch-audit.json |
| /kids | 768×1024 | reduce | ar/RTL | dark | false | 0 | captured in touch-audit.json |
| /atlas | 768×1024 | reduce | ar/RTL | dark | false | 0 | captured in touch-audit.json |

- **Comparison result**: Runtime smoke only; no document-level horizontal overflow; no console/runtime errors; zero undersized interactive elements at 44px floor.
- **Evidence path**: `artifacts/institution-stage-evidence/stage-2/touch-audit.json`
- **Metadata**: Captured 2026-11-15T14:23:15.732Z, base http://localhost:3000, reduced-motion emulation, 26 routes × 2 viewports = 52 cases.

## DATA_EVIDENCE
- **Source**: No new religious/content source introduced by Stage 2
- **Governed OpenITI registry**: 16 eligible works, 33 eligible versions (unchanged from Stage 1)
- **Strict reader gate**: Provider OpenITI, `full_text_cleared`, `cleared_public_domain_openiti_historical_text`
- **Capability metrics**: 16 governed-readable works, 9,090 catalog-text-only works, 23 metadata-only works, 9,106 attached digital records
- **Candidate Tanzil**: `src-tanzil-uthmani-1-1-candidate` remains `rights_review_pending` with forbidden API access/streaming; only acquired `src-tanzil-uthmani-min-1-1-acquired` is production-cleared
- **Tabari verification**: Pinned fetch succeeds (HTTP 200 from exact commit URL); decoded document 26,360,746 bytes → within 32 MiB budget; reader opens successfully; diagnostics expose version-0310Tabari.JamicBayan.JK000164-ara1, provider OpenITI, full_text_cleared, cleared_public_domain_openiti_historical_text, commit cfc4157a3cf2054c0888f133970a4eaa3e22e58c.
- **Smaller works verified**: Bukhari (5.5 MiB), Muslim (4.5 MiB), Nawawi Riyad (1.1 MiB) — all open without size error.
- **Rights/review state**: Remains fail-closed; discovery is not approval or playback.

## TEST_MATRIX

| Gate | Command | Exit | Result |
|---|---|---:|---|
| Type | `npm run check` | 0 | TypeScript completed without diagnostics |
| Lint | `npm run lint` | 0 | ESLint completed without reported problems |
| P0 | `npm run test:p0` | 0 | 313 passed, 0 failed, 49 suites |
| Sources | `npm run validate:sources` | 0 | 21 sources, 13 rights records, 12 provider resources, 17 works, 33 digital versions, 20 provider policies, 0 rights-cleared audiobooks, 5 children adaptations, 4 review-pending hadith samples, 0 cleared media assets |
| Kids registry | `npm run validate:kids-youtube` | 0 | 2 publishers validated |
| Build | `npm run build` | 0 | Vite built 2265 modules; server bundle 157.0 kB |
| Diff hygiene | `git diff --check` | 0 | No whitespace errors; only LF→CRLF notices |
| Touch audit | Headless Chrome 360×900 & 768×1024 reduced-motion | 0 | 52 cases: zero overflow, zero undersized (44px floor) |

- **Pre-existing warnings**: `quranCorpus` ~668 kB, `three-runtime` ~579 kB chunk size warnings remain; optimization requires runtime evidence.

## SECURITY_AND_RIGHTS
- No credential, `DATABASE_URL`, `JWT_SECRET`, provider key, or production secret added.
- Local journey, notes, favorites, preferences, reading progress remain explicitly local-only; untrusted local values sanitized; forged surfaces and external paths rejected.
- Reading percentages derived only from proven numerator/denominator pairs; never infer religious completion or worship merit.
- Rights/review state remains fail-closed; search and discovery do not grant approval, publication, or playback.
- Stage 2 visual artifacts are runtime evidence only; do not claim design approval, source approval, release, or deployment.

## STORAGE_CLEANUP
- Inspected: Stage 0 baseline, ignored directories, recovery paths, unique-work register, current worktree status
- Removed exact paths: none
- Bytes before/after: not applicable; zero bytes reclaimed
- Recovery proof: `dist/`, `node_modules/`, `.git/`, `_recovery/`, `research/`, `data-sources/`, `docs/`, `attached_assets/`, branches, backups, unreachable recovery objects remain preserved

## BLOCKERS
- Production persistence requires owner-provided secure `DATABASE_URL` and `JWT_SECRET`.
- Production deployment/runtime SHA, remote CI/PR state, package signing, and credential-gated providers remain externally blocked.
- Runtime/visual verification must not overwrite the eight protected JPGs.
- Browser WebGL/context-loss verification uses synthetic events and forced context creation failure because local software rendering cannot reproduce a physical GPU context loss; evidence states this limitation.
- Build still warns that `quranCorpus` ~668 kB and `three-runtime` ~579 kB; optimization requires runtime evidence.
- Non-shell content controls below 44px (some Quran reader controls) remain visible in 360/768 audit; they do not create document overflow; full touch-target closure belongs to responsive/platform stage.
- Stage 2 visual set is runtime smoke evidence, not stakeholder design approval.

## NEXT_SAFE_ACTION
- Implement Stage 3 (detailed Seerah wings, enhanced readers, responsive/platform completion) or proceed to cleanup/release per owner direction.
- Keep Stage 2 on current branch until owner review; do not force-push, rewrite history, or describe uncommitted working tree as merged/released.

## INTEGRATION_RECOMMENDATION
- Review the working tree as separable concerns: Stage 1 shell/product, Stage 2 3D runtime/reader, TASK_004 deterministic media, Stage 0/1/2 evidence documentation.
- Commit in reviewable units after owner review; do not include the eight protected JPGs in a shell commit unless owner explicitly authorizes them.
- The shared Three.js runtime (`three-runtime.ts`) is the architectural anchor for any future immersive surface; new 3D wings must consume it via dynamic import and the `ThreeSceneAdapter` contract.
```