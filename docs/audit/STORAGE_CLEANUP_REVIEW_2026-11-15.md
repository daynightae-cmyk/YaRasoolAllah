# Storage Cleanup Review — READ ONLY

**Captured:** 2026-11-15 08:11–08:13 +04
**Policy:** inventory and proposal only. No deletes, moves, resets, prunes, branch deletion, or cleanup scripts were run.

## Disk measurement

At capture, PowerShell reported drive `K:` with **41,731,952,640 bytes used** and **9,790,873,600 bytes free**. Folder sizes below are recursive logical byte totals measured without any cleanup action.

| Path | Bytes | Classification | Recommendation |
|---|---:|---|---|
| `node_modules/` | 377,979,679 | SAFE_REGENERABLE_CANDIDATE, but active build dependency | Preserve until all gates and follow-up work finish; only propose removal with a reinstall plan |
| `.git/` | 126,015,989 | UNIQUE_PRESERVE | Never treat as cache; preserve Git history and unreachable recovery objects |
| `research/` | 115,794,300 | UNIQUE_PRESERVE | Research/acquisition provenance; no deletion |
| `client/` | 15,379,637 | UNIQUE_PRESERVE | Product source |
| `dist/` | 15,296,976 | SAFE_REGENERABLE_CANDIDATE / current build output | Do not delete during active verification; rebuild is reproducible but current artifact may be useful evidence |
| `artifacts/` | 9,255,919 | UNIQUE_PRESERVE / ACTIVE evidence | Includes modified tracked screenshots and ignored smoke output; no deletion |
| `attached_assets/` | 7,362,442 | UNKNOWN_PRESERVE | Provenance not proven; preserve |
| `data-sources/` | 1,796,616 | UNIQUE_PRESERVE | Rights and content provenance |
| `docs/` | 609,969 | UNIQUE_PRESERVE | Audit/recovery evidence |
| `package-lock.json` | 365,019 | UNIQUE_PRESERVE | Dependency reproducibility |

## Candidate register

1. **`dist/`** — potentially regenerable, but it was refreshed by the current build and is useful for artifact comparison. **Proposal:** defer until a recorded artifact hash and release decision exist. Recovery: `npm run build`.
2. **`node_modules/`** — regenerable but required for current work. **Proposal:** defer; if approved later, verify `package-lock.json`, reinstall with `npm ci`, and rerun all gates. Recovery: npm install from lockfile.
3. **`artifacts/visual-golden-smoke/`** and **`artifacts/library-reading-smoke/`** — ignored outputs may contain unique runtime evidence. **Proposal:** inspect manifests and hashes first; no deletion.
4. **`.codex/`, `.vscode/`, `_recovery/`** — ignored metadata/recovery material. **Proposal:** preserve until ownership and reproducibility are proven.
5. **Unreachable Git objects** — recovery-critical until mapped. **Proposal:** preserve; no `git gc`, prune, reflog expiry, or deletion.

No candidate is eligible for deletion in this session because active work, unique evidence, or recovery value has not been disproven. Estimated space recovered: **0 bytes**.

## Post-approval revalidation commands

Only after exact-path owner approval, rerun `git status --short --ignored`, `git worktree list --porcelain`, `git fsck --no-reflogs --unreachable`, and the disk measurement. For any approved regenerable directory, record its checksum/size, perform the single exact operation, verify the path is gone, reinstall/rebuild if needed, and rerun the relevant gates. This document itself does not authorize those actions.
