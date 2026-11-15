# Ya Rasool Allah — Current Task Index

**Baseline:** `main` at `df4880589016aa4681b6d43233ecc136f4e32238`
**Captured:** 2026-11-15 08:13 +04
**Status vocabulary:** VERIFIED means evidence exists at this SHA; NOT VERIFIED means the gate was not run; BLOCKED means an external/owner dependency prevents the task.

## Task program

| ID | Priority | Scope | Status | Dependency / next action |
|---|---|---|---|---|
| TASK 000 | P0 | Refresh repository truth, preserve dirty/unique work, rerun code gates, record baseline | `VERIFIED_LOCAL` | This checkpoint satisfies the current read-only baseline; remote/CI/runtime remain separate gates |
| TASK 001 | P0 | Production database/auth persistence and truthful health | `BLOCKED_OWNER_EXTERNAL` | Owner must provide secure production `DATABASE_URL` and `JWT_SECRET`; never commit secrets |
| TASK 002 | P0 | Production deploy/SHA/runtime verification | `NOT_VERIFIED` | Refresh remote/CI, deploy through approved process, probe current production and record deployed SHA |
| TASK 003 | P1 | Credential-gated external providers | `BLOCKED_EXTERNAL` | Obtain provider credentials and rights evidence; test each adapter honestly |
| TASK 004 | P1 | Media discovery review surface integrity | `READY` | Run ingestion determinism and add tests for 95 records / 0 approved / filter semantics; exact code scope below |
| TASK 005 | P1 | Full visual route/runtime matrix | `PARTIAL` | Capture all canonical routes at equal viewports/themes; protect existing modified evidence |
| TASK 006 | P2 | Performance follow-up for large chunks | `READY_CONDITIONAL` | Collect browser/runtime performance evidence before code splitting; likely targets `quranCorpus` and `LibraryPage` |
| TASK 007 | P2 | Storage recovery review | `REVIEW_ONLY` | Preserve all candidates; owner approval required for any exact destructive path |
| TASK 008 | P4 | Release/package/signing/deployment gate | `BLOCKED` | Requires verified production config, runtime, CI, artifact hash and rollback proof |

## TASK 004 claim contract

- **Owner:** single orchestrator / one future implementation worker only.
- **Base SHA:** `df4880589016aa4681b6d43233ecc136f4e32238`.
- **Allowed files:** `scripts/acquire/ingest-media-catalog.ts`, `scripts/*media*.test.ts` or a new narrowly named test, `package.json` only if adding the test command, and dated task evidence.
- **Protected files:** `client/src/App.tsx`, shared route registries, rights ledgers, source CSV/JSON, generated catalog, modified `artifacts/visual-evidence/*.jpg`, lockfile unless dependency changes are proven necessary.
- **Acceptance:** `npm run ingest:media` succeeds; generated counts and policy are deterministic; UI filter logic is covered without granting approval; `npm run check`, `npm run lint`, `npm run test:p0`, `npm run validate:sources`, `npm run validate:kids-youtube`, and `npm run build` all pass; no public playback/promotion claim is introduced.
- **Handoff:** update the dated ledger with SHA, exact files, commands, exit codes, and any visual/runtime evidence.

## Release gate summary

Current code gates are green at the local SHA. Remote merge, CI, deployed runtime, production config, package signing, accessibility capture, and visual approval are not established by this task index.
