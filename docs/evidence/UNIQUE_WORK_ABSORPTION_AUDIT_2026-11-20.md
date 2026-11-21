# Unique-work absorption audit — 2026-11-20

Owner directive: "لا تترك شيء فريد" — absorb every unique/useful piece of work
(branches, stashes, dropped objects) before cleanup, with full merge/cleanup
authority. This ledger records what was examined, what was proven already
absorbed, and what was pinned for preservation. **Nothing unique was deleted.**

Baseline: `main` @ `0eb51e78c7304e9a36503ab7af619662b9cf6c4a` == `origin/main`.

## Method

1. Enumerated every ref (branches, remotes, tags, `refs/cline/*`,
   `refs/codex/*`, `refs/recovery/*`) and every unreachable commit/tree/blob
   via `git fsck --unreachable --no-reflogs`.
2. For each candidate, compared **content** (blob-level against `main`'s full
   reachable object set), not merge-base diffs — most branch "additions" were
   already in `main` via later commits or the documented reconcile PR #110
   (`946daa83`).
3. Where content differed, read the actual delta to decide: unique value to
   absorb, superseded intermediate, or broken merge-conflict debris.
4. Pinned all forensic commits and every unreachable blob/tree under
   `refs/recovery/*` so no object can be garbage-collected, then removed only
   local branch refs proven fully absorbed. Remote refs untouched.

## 1. `feat/seerah-production-closure-20261120` @ `24e2325f` — fully absorbed

- `git rev-parse 24e2325f^{tree}` == `git rev-parse 5136278a^{tree}`
  (`dee86c05cca2ec60c635d4a7c858d6229b58b3a7`). The branch tip's tree is
  **byte-identical** to the squash merge "Seerah production closure (#118)"
  (`5136278a`) already in `main`. All five branch commits (database, review
  checklist, smoke fixes, scene plates, gateway) are inside that squash.
- The apparent large diff vs `main` is `main` moving *forward* (2026 plates,
  WorldBackdrop, ambience, Android/desktop shells, journey theatre), not the
  branch holding unique work. Zero blobs unique vs `main`.
- Preserved as annotated tag `absorbed/seerah-production-closure-24e2325f`;
  local branch deleted. `origin/feat/seerah-production-closure-20261120` kept.

## 2. Stash-derived forensic commits ("ambience WIP") — fully absorbed

Unreachable stash merges `1e05b4d7` ("On main: ambience WIP v2") and
`04b1a9c2` ("ambience handoff WIP (unique)") on the seerah branch:

- Their untracked payload (`07e673e4`, `a795a9ac`): `audio/AmbientSound.tsx`,
  `ambience-engine.ts`, `ambience-policy.ts`, `voice-presence.ts` + 3 ambience
  tests — **byte-identical** to the versions now in `main` (zero diff).
- Their tracked deltas (voice-presence hooks in `DeviceTtsFallback.tsx`,
  `<AmbientSound />` in `InstitutionShell.tsx`, ambient toggle in
  `ShellDrawer.tsx`, `ambientEnabled` in `store.ts`) are all present in `main`.
- Remaining deltas were only reversions of later `main` work (removed
  `data-visual` smoke hooks, `useLayoutEffect` deep-link scroll replaced by an
  older rAF version, SVG trailing-whitespace churn, deleted review checklist).
  Nothing unique; `main`'s versions are strictly newer.
- `19851edc` ("candidate-fix-before-repro"): `SMOKE_CASES` filter and
  library-mode-shelves smoke click are already in `main`'s
  `scripts/smoke-visual-golden.mjs`; its `LibraryPage` hero uses the obsolete
  `art.library` where `main` uses the 2026 world plate — not absorbed by design.
- All 15 forensic commits pinned under `refs/recovery/forensic-20261120/<sha>`.

## 3. Cline/codex checkpoints — fully absorbed

All 14 `refs/cline/checkpoints/*` commits and the unreachable cline stash
commits add **zero files** not in `main` and their tracked deltas match the
ambience/seerah WIP above. `refs/codex/turn-diffs/*` and the 33
`refs/recovery/forensic-20261102/*` refs remain untouched (already pinned).

## 4. Unreachable blobs/trees (50 blobs, 105 trees) — classified, all pinned

Pinned wholesale in `refs/recovery/orphan-objects-20261120`
(commit `51d8e444`, tree `762bb322`, 142 entries). Classification:

| Group | Blobs | Disposition |
| --- | --- | --- |
| Merge-conflict debris (`<<<<<<< HEAD` markers) | `QuranPage` ×4, `LibraryCatalog` ×4, `quran-translations`, `source-registry` ×4, `create-app` ×4, `basirah`, `KidsPage`, `BasirahPage`, `package.json` ×10 | Broken intermediates of merges whose resolved results are in `main` (e.g. QuranEnc translations `c7bf9f4b`, reconcile #110). Not code; never shipped. Preserved in quarantine only. |
| Clean pre-merge intermediates | `LibraryPage` (`e3ed97f0`, `ee01caec`, `f9391f9e`), `App.tsx` (`0de82c6e`) | Older snapshots: missing `main`'s catalog capability report, world plates, SeerahDatabase route; `f9391f9e` still carries `ImmersiveGateway` wrappers that `main` replaced with `SectionEntry3D`/ChapterGateway thresholds. Superseded, zero unique behavior. |
| Legacy components never committed to any branch | `ReadingDeskModal` (`b31ea0b4`), `EvidenceDrawer` variant (`97528d7b`), `SourceDrawer` variant (`a0afbf56`), `BabAlsamaaFAB` variant (`a3aa1505`), legacy `DigitalLibraryPage`/`QuranPage` (`c845217d`, `136010e3`) | Covered by the documented prune `ff501ab1` ("absorb legacy baseline… prune orphaned duplicates", register: `docs/audit/LEGACY_BASELINE_ABSORPTION_2026-11-19.md`, guarded by `scripts/legacy-baseline-absorption.test.ts`). Variants differ only in styling/status-label wording superseded by PR #101's evidence-drawer labels; FAB variant uses purple where `main` standardized emerald/amber. |
| Old library-shared-query test (`0404536d`) | 1 | Explicitly dispositioned in reconcile #110 (`946daa83`): its assertions use the `controlledQuery/onQuery` spelling `main` does not use; replaced by the stronger `scripts/library-catalog-facets.test.ts` + `library-reader-truth.test.ts`. Not re-imported, per that recorded decision. |
| Desktop evidence probe (`9a16ef5c`, self-labelled "Temporary… not committed") | 1 | Superseded by committed `desktop/main.cjs` (same `yra://` protocol handler) + `scripts/desktop-packaged-evidence.mjs`. |
| JPEG screenshots (7: 1440×1000 ×6, 360×900 ×1) | 7 | Intermediate visual-evidence captures; dimensions match no committed artifact and `main` carries newer evidence sets (`artifacts/visual-evidence/*`, `artifacts/desktop-evidence/*`). Kept in quarantine; not visual authority (2026 reference pack is, per `REFERENCE_PACK_2026-11-20_PROVENANCE.md`). |

## 5. September backup/feature branches — absorbed via PR #110, local refs removed

Blob-level comparison against `main`'s reachable object set:

| Branch | Unique content vs `main` | Disposition |
| --- | --- | --- |
| `docs/vra-vercel-merge-record-20260925`, `feat/product-recovery-integration-20260925` | none | Fully absorbed. Local ref deleted. |
| `backup/baseline-status-20260926` | `BASELINE_STATUS.md` differing by one trailing blank line | `main`'s copy identical otherwise. Deleted. |
| `backup/uncommitted-handoffs-20260926` | old `package-lock.json` | Dependency snapshot, superseded. Deleted. |
| `chore/kids-youtube-blocked-credential-20260924` | `REMAINING_WORK_REGISTER.md` snapshot | Recovered into `main` **with a historical-snapshot banner** by #110 (its own commit message documents this). Deleted. |
| `feat/autonomous-production-closure-20260925` | shared-query + facet slices, handoff docs | #110 ported the language/subcategory facets onto the newer catalog (with `canonicalLanguage` fix) and recorded why the shared-query commit was not re-applied (already landed via #109). Deleted. |
| `feat/yra-kids-theatre-honesty-20260926` | old `package.json` | Kids-theatre truth work landed via #110; manifest superseded. Deleted. |
| `traycer/yarasoolallah-polite-dolphin` | 7 legacy-tree variants (`quranService`, headers, `RealisticBookshelf`, `InstitutionalSearchDialog`, legacy `QuranPage`, `source-governance`) | All superseded: `main`'s `quranService` removes sample-verse fabrication; `RealisticBookshelf` uses stable-identity spines (newer than index-based); `GlobalSearchDialog` replaced `InstitutionalSearchDialog`; `source-governance` gained 29 lines; legacy pages carry dev-sample labels `main` replaced with real corpora. Deleted. |

All corresponding `origin/*` refs remain on the remote untouched.

## 6. Result

- `git fsck --unreachable --no-reflogs` → **0 unreachable objects** after pinning.
- Local branches now: `main` only. Tags: `pre-reconcile-20261119`,
  `absorbed/seerah-production-closure-24e2325f`.
- Preservation refs: `refs/recovery/forensic-20261102/*` (33, pre-existing),
  `refs/recovery/forensic-20261120/*` (15, new),
  `refs/recovery/orphan-objects-20261120` (142 objects, new),
  `refs/cline/*`, `refs/codex/*` (pre-existing, untouched).
- No merge or cherry-pick was required: every candidate's unique value was
  already in `main` (proven byte-level or by the recorded #109/#110/#118
  dispositions). No working-tree behavior changed in this audit.

## Gates run after the audit

Recorded in `REFERENCE_PACK_2026-11-20_PROVENANCE.md` (same session):
`verify:reference-pack`, `check` (tsc), `build`, targeted test suites.
