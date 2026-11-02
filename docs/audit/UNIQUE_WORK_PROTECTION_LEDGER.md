# Unique Work Protection Ledger

Nothing in this ledger was deleted, merged, cherry-picked, or modified this session. Classification is based on branch age, unique commit count vs `origin/main` (`21416a4b`), and file-level inspection.

## A. Exceptional items (require explicit review before any action)

| Item | Location | SHA | Uniqueness | Owner | Risk | Safe next action |
|---|---|---|---|---|---|---|
| QuranEnc translations (additive) | branch `feat/quranenc-translations-internal-20260925` | `3b26f3f1` | 11 commits ahead / 50 behind; local checks previously verified | owner | Medium — owner-deferred | `DEFERRED_OWNER`; do not merge without authorization |
| Base44 spatial corridor / sundial | branch `base44/setup-0a1b567e` | `a19a5490` | 4 commits / 243 behind; adds `WingCorridor`, institution shell changes, 446 CSS lines, PropheticDay sundial, historical audit docs | external/base44 | Medium — visual work may be superseded by current main | Semantic diff before any salvage; preserve branch |
| Codex library availability fix | branch `codex/review-project-execution-document` | `77c9d39c` | 1 commit / 289 behind; makes library availability explicit; mostly deletes legacy components | codex/agent | Low–Medium — may be superseded by main library truth work | Semantic diff; preserve branch |
| Traycer quick-badger worktree | `C:/Users/day night/.traycer/worktrees/.../traycer-yarasoolallah-quick-badger-b277e7797955` | `e19e6ed9` | clean; branch `traycer/yarasoolallah-quick-badger` | other agent | High contention if modified | `PRESERVED_UNMERGED`; do not modify |
| Backup handoffs | branch `backup/uncommitted-handoffs-20260926` | `e19e6ed9` | 2 ahead / 124 behind; preserves handoff/report docs | project | Low | Preserve |
| Baseline status backup | branch `backup/baseline-status-20260926` | `9e961c4d` | 1 ahead / 85 behind | project | Low | Preserve |
| Recovery patches | `_recovery/*.patch` (6 files) | n/a | pre-main-sync + legacy page/CSS snapshots | project | Low | Preserve |
| Archived pages/prototypes | `docs/archive/` | n/a | orphan pages + prototypes | project | Low | Preserve |
| Research acquisition branches | `research/islamic-library-acquisition-20260923` (`df5da118` base, 15 ahead), `research/supreme-islamic-library-acquisition-20260923` (11 ahead), `research/library-acquisition-20260923-deep1` (7 ahead) | see branch | Research data/acquisition work; 243+ behind main | research | Low — research artifacts likely partly in main `research/` | Preserve; compare before any cleanup |

## B. Remote branches with unique commits vs `origin/main` (36 total, all preserved)

| Branch | Ahead | Behind | Base | Classification |
|---|---:|---:|---|---|
| research/islamic-library-acquisition-20260923 | 15 | 243 | df5da118 | PRESERVED_RESEARCH |
| feat/iiif-manuscript-reader-20260924 | 14 | 194 | 0a84fb15 | PRESERVED_UNMERGED — possible unique IIIF reader |
| feat/kids-tv-playback-20260924 | 14 | 200 | 87f39ed0 | PRESERVED_UNMERGED — possible unique playback work |
| feat/quranenc-translations-internal-20260925 | 11 | 50 | d6824086 | DEFERRED_OWNER |
| research/supreme-islamic-library-acquisition-20260923 | 11 | 245 | 32a0138b | PRESERVED_RESEARCH |
| feat/kids-youtube-acquisition-20260924 | 9 | 198 | 900ea04e | PRESERVED_UNMERGED |
| feat/quran-translations-internal-api-20260925 | 8 | 52 | 5cb60fc8 | PRESERVED_UNMERGED (likely superseded) |
| feat/grok-visual-golden-master-20260924 | 7 | 235 | 5ca72aa9 | PRESERVED_VISUAL |
| feat/provider-verification-20260924 | 7 | 195 | 476b7604 | PRESERVED |
| feat/sources-canonical-shell-20260924 | 7 | 135 | 47529d5c | PRESERVED (likely superseded) |
| fix/prayer-next-day-truth-20260924 | 7 | 203 | 9f46ba59 | PRESERVED |
| research/library-acquisition-20260923-deep1 | 7 | 243 | df5da118 | PRESERVED_RESEARCH |
| feat/source-integration-modes-20260924 | 6 | 201 | feb088da | PRESERVED |
| fix/ceremony-visual-polish-20260924 | 6 | 200 | 87f39ed0 | PRESERVED_VISUAL |
| fix/vercel-esm-content-runtime-20260925 | 6 | 39 | b8592ebe | PRESERVED (likely superseded) |
| feat/autonomous-production-closure-20260925 | 5 | 36 | 1a661c7b | PRESERVED |
| feat/living-mountain-atlas-salvage-20260924 | 5 | 136 | 617d15e6 | PRESERVED_VISUAL |
| feat/quran-reader-inline-recitation-20260925 | 5 | 50 | d6824086 | PRESERVED (likely superseded by merged recitation) |
| base44/setup-0a1b567e | 4 | 243 | df5da118 | PRESERVED_VISUAL — semantic diff needed |
| feat/quran-real-data-wiring-20260924 | 4 | 234 | 1a4cea94 | PRESERVED (likely superseded) |
| feat/universal-document-chamber-ppt-20260925 | 4 | 51 | 431257df | PRESERVED_UNMERGED |
| feat/basirah-quran-fulltext-search-20260924 | 3 | 202 | 1cfdfa24 | PRESERVED |
| feat/kids-library-discovery-20260924 | 3 | 196 | e5712505 | PRESERVED |
| feat/quranenc-tafsir-20260925 | 3 | 37 | c077e03f | PRESERVED (likely superseded by PR #95) |
| backup/uncommitted-handoffs-20260926 | 2 | 124 | de45ec0b | PRESERVED_BACKUP |
| chore/kids-youtube-blocked-credential-20260924 | 2 | 193 | 6317bd66 | PRESERVED |
| feat/yra-kids-theatre-honesty-20260926 | 2 | 2 | f279e146 | PRESERVED (likely superseded) |
| backup/baseline-status-20260926 | 1 | 85 | 4ebd33ce | PRESERVED_BACKUP |
| codex/review-project-execution-document | 1 | 289 | ca82fcfa | PRESERVED_UNMERGED — semantic diff needed |
| docs/knoux-official-contacts-20261027 | 1 | 1 | 946daa83 | INTEGRATED via PR #111 (README only) |
| docs/vra-vercel-merge-record-20260925 | 1 | 7 | a93f74e6 | PRESERVED |
| feat/library-presentation-classification-20260924 | 1 | 124 | de45ec0b | PRESERVED (likely superseded) |
| feat/yra-library-reader-truth-20260926 | 1 | 3 | 41a75d08 | SUPERSEDED by later main fixes |
| fix/spa-deep-links-20260924 | 1 | 199 | d4a2b1f8 | PRESERVED (likely superseded) |
| traycer/yarasoolallah-polite-dolphin | 1 | 289 | ca82fcfa | PRESERVED_AGENT |
| ya-rasool-allah-repository-2f795 | 1 | 134 | 5eef0f8e | PRESERVED |

## C. Local-only branches (no upstream or ahead)

`feat/quranenc-translations-internal-20260925` (`3b26f3f1`), `traycer/yarasoolallah-calm-bear` (`5ca72aa9`), `traycer/yarasoolallah-lucky-seal` (`5ca72aa9`), `traycer/yarasoolallah-quick-badger` (`e19e6ed9`), `traycer/yarasoolallah-quick-platypus` (`5ca72aa9`), `traycer/yarasoolallah-rugged-rabbit` (`ca82fcfa`), `traycer/yarasoolallah-sturdy-crane` (`5ca72aa9`), `traycer/yarasoolallah-swift-lynx` (`5ca72aa9`). All preserved.

## D. Worktrees and stashes

- 2 worktrees (main + quick-badger). Both clean.
- 0 stashes.

## E. Rules

1. No branch deletion, prune, reset, clean, or force push.
2. No merge of `DEFERRED_OWNER`, `PRESERVED_VISUAL`, or `PRESERVED_UNMERGED` items without semantic diff + tests + owner authorization.
3. Before reusing any branch's work, compare the actual current file content (not commit titles), and port only unique, still-relevant changes.
4. `_recovery/`, `docs/archive/`, and `research/` are unique-work protected.
