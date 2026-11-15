# Unique Work and Branch/Worktree Register

**Captured:** 2026-11-15 08:13 +04
**Authority:** current local Git inspection at `df4880589016aa4681b6d43233ecc136f4e32238`

## Local worktree

| Source path | Branch | SHA | State | Classification | Safe action |
|---|---|---|---|---|---|
| `K:/Knoux Projects/YaRasoolAllah/Base` | `main` | `df488058` | 8 tracked modified visual-evidence JPGs; ignored recovery/build/dependency folders | `ACTIVE_AGENT_NO_TOUCH` / `DIRTY_PROTECT` | Preserve; inspect before any commit or cleanup |

No other worktree was registered by `git worktree list --porcelain`. This does not prove that unregistered external copies do not exist.

## Current local commits not in the locally observed origin/main

| SHA | Subject | Feature | Integration status | Risk |
|---|---|---|---|---|
| `af17e101` | `feat: complete 3D library door entry and shelf experience` | Entry door, 3D library halls, shelf/readability work, related visual evidence | `UNIQUE_NOT_INTEGRATED` relative to observed `origin/main`; local main contains it | High visual/regression surface; must be validated on target before release claim |
| `df488058` | `feat: ingest 95-record media discovery catalog with gated /media-review queue` | Acquisition inputs, rights/pending ledgers, discovery catalog, ingestion script, review-only page and route | `UNIQUE_NOT_INTEGRATED` relative to observed `origin/main`; local main contains it | Data provenance and review-state integrity; no public promotion allowed |

## Remote branches observed in local refs

The repository contains many preserved remote refs, including backup, recovery, feature, fix, slice, performance, research, and documentation branches. Examples with potentially unique value include:

- `origin/backup/baseline-status-20260926` and `origin/backup/uncommitted-handoffs-20260926`: recovery documentation and uncommitted-state preservation.
- `origin/feat/quranenc-translations-internal-20260925`, `origin/feat/iiif-manuscript-reader-20260924`, `origin/feat/kids-tv-playback-20260924`, and `origin/feat/kids-youtube-acquisition-20260924`: deferred or potentially unique product/service slices.
- `origin/research/islamic-library-acquisition-20260923`, `origin/research/library-acquisition-20260923-deep1`, and `origin/research/supreme-islamic-library-acquisition-20260923`: research and acquisition material.
- `origin/chore/audit-evidence-incremental-lint-20261102` and `origin/docs/evidence-finalize-20261102`: quality and evidence history.

These refs are **PRESERVE / NOT MERGE BY DEFAULT**. Ahead/behind counts and patch equivalence must be recomputed against a refreshed `origin/main` before any integration decision. No branch deletion or worktree pruning is authorized by this register.

## Dirty evidence protection

The eight modified JPGs listed in `FORENSIC_BASELINE_2026-11-15.md` are not classified as disposable generated output merely because they are images. They may be owner-approved visual evidence or unique captures. Preserve their bytes, record checksums before any intentional update, and require a matched before/after visual review.

## Unreachable Git objects

`git fsck --no-reflogs --unreachable` returned unreachable trees/blobs. They are recovery candidates, not garbage. No object expiry, prune, reflog deletion, or cleanup was run. A future recovery task may map them to commits/files, but only read-only inspection is safe now.

## Ownership decision

No additional agent was spawned and no shared file lease was issued. Any future implementation worker must claim exact paths, protect `client/src/App.tsx`, `package.json`, lockfiles, route registries, data schemas, and source/rights ledgers from concurrent writes.
