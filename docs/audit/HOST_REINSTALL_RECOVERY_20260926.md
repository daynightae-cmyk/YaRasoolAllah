---
kind: spec
title: "Host reinstall recovery: exact state of YaRasoolAllah at push time"
---

# Recovery state — 2026-09-26

The host is being reinstalled. Everything below is already on the remote at
`daynightae-cmyk/YaRasoolAllah`, so nothing depends on this machine.

## Canonical state

| Item | Value |
|---|---|
| `origin/main` | `f279e146` — *fix(library): stop announcing 13,679 books when 9,106 can be opened (#109)* |
| `main` worktree | synced to `origin/main`, clean |
| Open PRs | 0 |
| Latest CI on `main` | Quality Gates SUCCESS, Visual Golden Verify SUCCESS |
| Disk at push time | D: 6.28 GB free (the earlier ~0.7 GB crisis is resolved) |

## Work in progress, pushed but NOT yet merged

**Branch `feat/yra-kids-theatre-honesty-20260926` — commit `90fdfde4`**

`fix(kids): stop offering playback when no episode is cleared`

Measured on `main`: `KIDS_VIDEO_CATALOG` holds **0** playable entries,
`mediaAssetRegistry` holds **0** cleared assets, and all 5 discovered videos are
`reviewStatus: "pending"` — yet the entire theatre remote was enabled and
inert. Now 16 video-bound controls are disabled with a stated reason, while
`رجوع` and `الرئيسية` stay enabled so a locked theatre cannot trap the reader.
New gate `scripts/kids-theatre-truth.test.ts` (13 checks). Also fixed a third
instance of the cold-load budget defect: the audio gate waited 12 s for a player
that only mounts after the recitation catalog resolves, so it failed on a
healthy cold dev server; budget raised to 48 s with the assertion unchanged.

Gates at commit time: `tsc` PASS · `test:p0` **201/201** · smoke **40/40** with
3 consecutive clean runs.

**Not yet done for this branch, and the reason it was not merged:**

- `capture:visual` was interrupted by the reinstall, so the visual evidence for
  this slice was **deliberately not committed**. Re-capture before opening the
  PR, or open the PR and let CI produce the evidence.
- The PR itself was never opened.

## Backup branches created purely for this reinstall

These record work that existed only in a working tree. **No file content was
altered** — they exist so nothing is lost.

| Branch | What it preserves |
|---|---|
| `feat/autonomous-production-closure-20260925` | 5 commits that had **no remote at all**: shared shelf/catalog search query, language + subcategory filters, their `test:p0` gate, and two handoff docs. This was the single largest loss risk found. |
| `backup/uncommitted-handoffs-20260926` | Untracked `docs/handoffs/` and `docs/reports/` in the primary clone, plus its `package-lock.json` change. |
| `backup/baseline-status-20260926` | Uncommitted `docs/migration/BASELINE_STATUS.md` in the RECOVERY worktree. |
| `traycer/yarasoolallah-polite-dolphin` | 50 uncommitted files in another agent's worktree, committed onto its own existing branch. |

## Verified safe to discard

- `stash@{0}` (`pr101-merge-residue`) is a strict **subset** of `297ef350`,
  which is already an ancestor of `main`. It holds nothing unique. This is the
  residue from the earlier `Out of diskspace` ref-update failure, diagnosed in
  an earlier session.
- All other traycer worktrees were already clean.
- Six visual-evidence images that shifted only from re-running the capture were
  restored rather than committed, so no misleading evidence ships.

## To resume

1. Clone fresh. `git fetch --all --prune`.
2. Confirm `main == origin/main == f279e146`.
3. Resume the Kids slice:
   `git switch feat/yra-kids-theatre-honesty-20260926`
4. Re-capture visual evidence, open the PR, watch CI, merge on green.
5. Then continue the queue: Seerah UX closure → Atlas closure → Hadith
   mechanics → Daily/adhkar supporting routes → persistence boundary →
   Basirah/search honesty → final `CURRENT_PRODUCT_REALITY` refresh.

## Standing constraint

The rendered smoke harness needs a long budget for cold loads of heavy routes.
Three separate instances of this were found and fixed: the navigation wait
(12 s → 45 s) and the audio gate (12 s → 48 s). If a gate fails on a healthy
app, check the budget before assuming a defect — and never fix it by weakening
the assertion.

## Blocked, with exact reason

- **Hadith full corpus** — `BLOCKED_EXTERNAL`: no Sunnah.com credentials; Dorar
  is reference-only with no corpus ingestion rights; needs source, rights and
  editorial review.
- **Kids playable catalogue** — `BLOCKED_CREDENTIAL` + `BLOCKED_RIGHTS`: needs
  YouTube Data API credentials, and each item needs depiction, age and rights
  review before it may publish.
- **Adhkar corpus** — `BLOCKED_RIGHTS`: no sourced corpus.
- **Production persistence** — `BLOCKED_ENVIRONMENT`: requires a real
  `DATABASE_URL`; no production database is provisioned.
- **Production cutover** for `yarasoolallah.it.com` — `BLOCKED_ENVIRONMENT`:
  Vercel quota has been intermittent and rate-limited.
- **One hadith character** in `BabAlsamaa.tsx:75` — `BLOCKED_SCHOLARLY`: the
  lost character is either a letter or a kasra diacritic, and reconstructing
  hadith text by guessing is not acceptable.
- **Geographic Atlas layer** — `BLOCKED_SOURCE`: real QDL/British Library IIIF
  manifests exist in the research pipeline but are not wired, and no coordinate
  work is possible without source evidence.
- **QuranEnc translations** (Rowwad EN 1.0.19 / Junagarhi UR 1.1.3) — the
  adapter and rights evidence exist on a deferred branch that was never mounted
  on `create-public-content-app`. Owner-deferred; needs a decision.
