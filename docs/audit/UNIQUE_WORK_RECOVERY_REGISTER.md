# Unique Work Recovery Register

This register accounts for every discovered valuable contribution and its disposition. No contribution may disappear silently.

## A. Git branches (preserved, not deleted)

All 60+ remote branches retained. Key groups:

- feat/* (real-data-wiring, supreme-product-integration, canonical-shell, seerah-event-atlas-links, quran-reading-continuation, quranenc-translations-internal [deferred], etc.) — historical slices, mostly merged into main via PRs.
- fix/* (p0-backend-truth-security, visual-golden-chrome-startup, yra-* honesty fixes) — merged.
- slice/* (2026-09-23 closure slices) — merged or superseded.
- docs/* (reality refresh, closure reports) — merged.
- research/* (library acquisition) — research artifacts committed.
- traycer/* (agent worktrees) — preserved.
- backup/* (baseline-status, uncommitted-handoffs) — preserved.
- recovery/foundation-closure-20260923 — preserved.

Disposition: PRESERVED. None deleted this session. Branch cleanup requires owner approval per directive.

## B. Worktrees

- Main checkout (K:/Knoux Projects/YaRasoolAllah/Base) @ 946daa83 — active.
- traycer/yarasoolallah-quick-badger @ e19e6ed9 — clean, preserved.

## C. Recovery patches (_recovery/)

- legacy-ChildrenTVPage-20260924-150050.patch
- legacy-index-css-20260924-150050.patch
- pre-main-sync-20260924-145406.patch + status
- pre-main-sync-20260924-145640.patch + status

Disposition: UNIQUE_WORK — preserved (potential recovery value).

## D. Archived prototypes (docs/archive/)

- orphan-pages: AIAssistantPage, CalendarPage, ChildrenPage, LoginPage + README.
- prototypes: BookReader, DownloadManager, downloadService + README.

Disposition: PRESERVED (historical reference; may contain unique visual/functional ideas).

## E. Deferred external contribution (NOT merged, owner-deferred)

- origin/feat/quranenc-translations-internal-20260925 @ 3b26f3f1 — conflict-resolved rebase keeping AlQuran Cloud AND QuranEnc side by side. Locally verified (tsc, test:p0 35/35, validate:sources, vite build, live runtime 200 on both endpoints). Do NOT merge without owner decision.

## F. Closed PR (not merged, superseded)

- PR #83 (QuranEnc translations) closed WITHOUT merge by owner (CONFLICTING); equivalent governed translation work already in 431257d. QuranEnc editions remain a later additive slice only.

## G. Backup branch handoff docs

- backup/uncommitted-handoffs-20260926 @ e19e6ed9 — preserved handoff + report docs. Its single commit is an ancestor-preserved backup; main now contains the substantive product work.

## H. Unique visual/design work

- Visual golden cases (26) + smoke screenshots in artifacts/visual-golden-smoke/ (regenerable).
- Design contract docs: docs/visual-transformation/00-11 (12 files).
- Brand assets: assets/, attached_assets/.

## I. Unique data/research work

- research/ Islamic library acquisition pack (CSV/JSON/manifests, 9,129 works).
- data-sources/ (governed).
- migrations/.

## Disposition summary

No contribution was deleted or overwritten this session. All branches, worktrees, recovery patches, archived prototypes, and deferred branches remain intact. Integration of any deferred item requires explicit owner decision.
