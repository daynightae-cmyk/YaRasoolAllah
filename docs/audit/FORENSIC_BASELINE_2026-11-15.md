# Ya Rasool Allah — Forensic Baseline

**Captured:** 2026-11-15 08:13 +04
**Mode:** read-only discovery and verification followed by documentation only
**Orchestration:** `SINGLE_AGENT_MODE` — no parallel workers were started because the repository has one active worktree and all shared contracts require a single writer.

## Verified repository truth

| Item | Evidence |
|---|---|
| Canonical root | `K:/Knoux Projects/YaRasoolAllah/Base` (`git rev-parse --show-toplevel`) |
| Remote | `https://github.com/daynightae-cmyk/YaRasoolAllah.git` |
| Branch | `main` |
| Local HEAD | `df4880589016aa4681b6d43233ecc136f4e32238` |
| Local relation | `main` is ahead of the locally observed `origin/main` (`5d069b83`) by 2 commits; no behind count was observed |
| Current HEAD commits | `af17e101` 3D library door/shelf experience; `df488058` 95-record media discovery ingestion and gated `/media-review` queue |
| Worktrees | One registered worktree: the canonical root; no additional active worktree was registered |
| Stash | Empty |
| Tags | No tags returned by the inspected command |
| Reflog | Active recent commits are local and dated 2026-11-15; no reset or rewrite performed |
| Remote freshness | NOT VERIFIED in this session; refs are the locally available refs and were not refreshed |
| PR/CI state | NOT VERIFIED in this session; GitHub CLI/CI run queries were not executed |

## Worktree preservation boundary

The worktree was already dirty before verification. Eight tracked binary evidence files are modified and must be preserved exactly until their provenance and owner approval are known:

- `artifacts/visual-evidence/audio-1440-dark-rtl.jpg`
- `artifacts/visual-evidence/children-1440-dark-ltr.jpg`
- `artifacts/visual-evidence/children-360-light-rtl.jpg`
- `artifacts/visual-evidence/daily-360-dark-ltr.jpg`
- `artifacts/visual-evidence/daily-768-light-rtl.jpg`
- `artifacts/visual-evidence/daily-verse-honesty-1440-dark-rtl.jpg`
- `artifacts/visual-evidence/hadith-1440-light-rtl.jpg`
- `artifacts/visual-evidence/seerah-1440-dark-rtl.jpg`

Ignored but potentially valuable directories were observed and not touched: `.codex/`, `.vscode/`, `_recovery/`, `artifacts/library-reading-smoke/`, `artifacts/visual-golden-smoke/`, `dist/`, and `node_modules/`. No reset, clean, prune, deletion, move, merge, or force push was performed.

## Product/platform reality

This is a web application, not an Electron or Android project in the inspected checkout. The runtime is Vite + React + TypeScript in `client/`, an Express/TypeScript server in `server/`, Vercel API entry points in `api/`, shared types/services in `shared/`, and governed source data in `data-sources/`. The package manager is npm; Node requirement is `>=20`.

The application entry is `client/src/App.tsx`. The canonical visual shell wraps the public routes through `VisualRoute` and `InstitutionShell`. Routes include `/`, `/library`, `/library/work/:workId`, `/quran`, `/tafsir`, `/seerah`, `/atlas`, `/hadith`, `/kids`, `/daily`, `/audio`, `/basirah`, `/sources`, and the new `/media-review`, with redirects and legacy surfaces also declared in that file.

The media feature is deliberately discovery-only. `scripts/acquire/ingest-media-catalog.ts` merges the authoritative CSV inputs under `data-sources/media/acquisition/`, cross-checks JSON, writes `data-sources/media/discovery/`, and hard-codes the safe output policy of `approvedForPublicDisplay: 0`. `client/src/visual-golden/pages/MediaReviewPage.tsx` exposes search/filter/review visibility but explicitly cannot grant approval. This is real implementation, not proof of approved playback or public publishing.

## Current gates executed at HEAD `df488058`

| Gate | Command | Result |
|---|---|---|
| Type | `npm run check` | PASS, exit 0 |
| Lint | `npm run lint` | PASS, exit 0 |
| P0 regression | `npm run test:p0` | PASS, 234 tests / 234, 29 suites, 0 failed, 0 skipped, exit 0 |
| Source governance | `npm run validate:sources` | PASS, 21 sources, 13 rights records, 12 provider resources, 17 works, 33 digital versions, 20 provider policies, 0 rights-cleared audiobooks, 5 children adaptations, 4 review-pending hadith samples, 0 cleared media assets |
| Kids registry | `npm run validate:kids-youtube` | PASS, 2 publishers |
| Production build | `npm run build` | PASS, Vite 2252 modules, built in 19.98s; server bundle 153.4 kB |
| Diff hygiene | `git diff --check` | NOT RUN as a separate command |
| Visual/runtime/device | packaged/deployed/browser capture | NOT RUN in this session |
| CI/PR | remote checks | NOT VERIFIED in this session |

The production build reports a non-blocking chunk warning: `quranCorpus` is about 668 kB minified and `LibraryPage` about 696 kB minified. This is a performance follow-up, not a failed build.

## Top risks

1. `origin/main` and open PR/CI state were not refreshed, so local commits must not be called merged or released.
2. The eight modified visual evidence files may be unique owner work; they are protected until provenance and visual comparison are recorded.
3. Production persistence/deploy/auth remain unverified. Existing historical reports identify `DATABASE_URL`, `JWT_SECRET`, deployment SHA, and Vercel runtime as owner/external gates; those historical claims are not re-run here.
4. Media discovery is not playback. Current catalog policy reports 0 approved public records; no promotion or rights approval was attempted.
5. The build warning identifies a possible route/data chunk optimization opportunity, but no optimization should begin until runtime performance evidence and an isolated scope are defined.
6. Ignored recovery, visual-smoke, build, and dependency directories contain potentially unique or regenerable material and remain preserve/inspect-only.

## Exact next safe action

Complete a bounded `/media-review` review-surface verification task: run `npm run ingest:media`, compare generated manifest counts and hashes against the committed discovery artifacts, add deterministic regression coverage for the 95-record/0-approved policy and filter behavior, then run the complete gate set again. Do not promote media, alter rights state, or touch the protected screenshots as part of that task.
