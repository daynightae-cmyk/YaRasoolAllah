# Storage Recovery Register

## Measured free space (this session)

- K: ~5.0 GB free (total 48.0 GB)
- D: ~7.7 GB free (total 58.6 GB)
- C: ~4.8 GB free (total 130.6 GB)

## Candidates (NOT deleted this session)

| Path | Size | Category | Notes |
|---|---|---|---|
| dist/ | 13 MB | SAFE_REGENERABLE | `npm run build` recreates |
| artifacts/visual-golden-smoke/ | 4 MB | SAFE_REGENERABLE | smoke recreates screenshots |
| node_modules/ | 451 MB | ACTIVE_IN_USE | required; do not delete |
| _recovery/ | <1 MB | UNIQUE_WORK | preserve (recovery patches) |
| docs/archive/ | small | UNIQUE_WORK | preserve |
| npm cache (C: user) | ~2.07 GB | REQUIRES_REVIEW | shared across projects; do not auto-delete |

## Actions taken this session

NONE destructive. No files deleted. All candidates documented only.

## Recovery safeguards

- No broad destructive filesystem commands issued.
- No source, branch, worktree, or recovery patch removed.
- If disk becomes critical: delete `dist/` and `artifacts/visual-golden-smoke/` first (regenerable), then consider npm cache prune (`npm cache clean --force`) with owner approval.
