# Owner Decision Register — 2026-11-02

| # | Decision | Why it is blocked | Exact owner action | Safe default until then |
|---|---|---|---|---|
| OD-1 | Production `DATABASE_URL` + `JWT_SECRET` | Main Vercel API app 500s; auth/persistence/health unavailable | Add `DATABASE_URL` (Postgres) and `JWT_SECRET` (≥32 random chars) to Vercel production env; redeploy | Public content API stays live; auth/persistence remain unavailable |
| OD-2 | Redeploy current `main` | Deployed SHA unverified; asset hashes differ; `Last-Modified` 2026-10-30 | Authorize deployment from verified `main`; confirm build SHA and asset hashes | Do not claim RELEASED; production stays `BLOCKED_OWNER` |
| OD-3 | QuranEnc translations branch | `feat/quranenc-translations-internal-20260925` @ `3b26f3f1`, 11 commits ahead / 50 behind | Review semantic diff, rights/attribution, and whether the additive branch is still wanted | `DEFERRED_OWNER`; do not merge |
| OD-4 | Unique visual branches | `base44/setup-0a1b567e` (WingCorridor/sundial), `codex/review-project-execution-document` (library availability) | Approve a semantic-diff review and, if still relevant, a scoped salvage PR | `PRESERVED_UNMERGED`; no cherry-pick |
| OD-5 | Kids approved catalog | Approved playable catalog empty; rights/depiction/age review pending | Approve each item individually with provider, video ID, embed terms, rights, age, depiction policy | Keep 16 controls disabled with honest reason |
| OD-6 | Hadith corpus | 4 samples only; Sunnah.com/Dorar credentials/rights absent | Provide lawful API access + editorial validation plan | Keep truthful sample status |
| OD-7 | `BabAlsamaa.tsx:75` U+FFFD | Corrupted character cannot be guessed | Provide trustworthy source record or scholar-approved correction | Leave encoded replacement and documented blocker |
| OD-8 | Atlas geography | No sourced coordinates/licensed GIS | Provide licensed coordinates/source licenses | Keep schematic/documentary framing; no inferred routes |
| OD-9 | Adhkar corpus | Rights/editorial review absent | Approve sources and review method | Keep empty/honest state |
| OD-10 | Credential providers | Quran Foundation, Sunnah.com, GeoNames, YouTube Data API, TimeZoneDB | Provide credentials via secure env only | Adapters remain closed |

## Owner authorization needed for destructive actions

None were performed. Any future branch/worktree/stash pruning, history rewrite, force push, database migration on production, or mass deletion requires a separate inventory + backup + impact report and explicit owner approval.
