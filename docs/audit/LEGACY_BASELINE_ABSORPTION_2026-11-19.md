# Legacy baseline absorption — 2026-11-19

Canonical branch: `main` · commit at time of writing: `4f38cea3` (media batch) and the
cleanup batch that follows it.

This register exists to prove that every byte of recoverable legacy material was
either **absorbed into a canonical module** or **provably redundant**, before any
file or folder was removed. Nothing was deleted on the strength of "it looked old".

## 1. `UPDATED_FILES/` (tracked legacy folder, removed)

| Legacy file | Canonical destination | Proof of absorption |
| --- | --- | --- |
| `islamicCalendar.ts` | `client/src/utils/islamicCalendar.ts` | Byte-identical at the time of the audit (SHA `09CA385947DE…`). Later removed with its only consumer (`hooks/use-islamic-calendar.ts`), because the live calendar page (`/calendar`) never imported it. |
| `azkarData.ts` | `client/src/data/azkarData.ts` | Canonical file is a strict superset (89 lines vs 63) and already contains the five legacy records with repaired Arabic text; the legacy copy still carried a corrupted byte sequence (`يوم القي��مة`). |
| `prayerGuideData.ts` | `client/src/data/prayerGuideData.ts` | Canonical module was **empty** (0 steps). The 10 legacy steps were absorbed verbatim, each with `sourceId: "legacy-baseline-prayer-guide"`, `reviewStatus: "pending_review"`, and a module-level `PRAYER_GUIDE_PROVENANCE`. Guarded by `scripts/legacy-baseline-absorption.test.ts`. |
| `islamicKnowledgeData.ts` | `client/src/data/islamicKnowledgeData.ts` | Canonical module was **empty**. The 2 legacy drafts were absorbed verbatim into `ISLAMIC_KNOWLEDGE_PENDING_REVIEW` with `sourceIds: []` and `reviewStatus: "pending_review"`; `ISLAMIC_KNOWLEDGE_DATA` (published) stays empty so nothing unverified is presented as published knowledge. |
| `index.css` | `client/src/index.css` | Legacy copy was a 239-line snapshot; the canonical stylesheet is 2 317 lines and already contains the repaired rules. |
| `PrayerTimesCard_fixed.tsx` | `client/src/components/PrayerTimesCard.tsx` | Canonical differs only by a newer `useEffect` dependency list (`[nextPrayer]` vs `[nextPrayer, prayerTimes]`). |
| `usePrayerTimes_fixed.ts` | `client/src/hooks/usePrayerTimes.ts` | Canonical is a strict superset (246 lines vs 207) and adds the calculation-method registry (`PRAYER_METHODS`) plus failure states. |
| `README_UPDATES.md` | this register | The README only described the above transfer; the transfer is now real and verifiable. |

## 2. `_recovery/` (untracked patch folder, removed locally)

| Patch | Content | Disposition |
| --- | --- | --- |
| `legacy-ChildrenTVPage-20260924-150050.patch` | Reworked the **legacy, unrouted** `client/src/pages/ChildrenTVPage.tsx`: parent-facing source panel that resolves `sourceIds` to work titles, previous/next adaptation navigation, Arabic review-status labels, and aria improvements. | The unique value was **ported into the live app**: `client/src/visual-golden/services/kids.ts` (`kidsAdaptationSources`, `kidsReviewStatusLabel`, `kidsAdaptationPosition`), `StoryTheatre` (source panel + navigation footer), and `KidsPage` (wiring). The legacy page itself was unrouted (already recorded as "Legacy ChildrenTVPage.tsx unrouted" in `docs/reports/VERIFICATION-RESULT-2026-09-26.md`) and duplicated the live `/kids` route, so it was removed. |
| `legacy-index-css-20260924-150050.patch` | CSS for `.children-reading-status` and friends, targeting the legacy stylesheet for the retired legacy page. | Not needed: the live shell uses CSS modules, and the parent panel shipped with its own styles in `present.module.css`. |
| `pre-main-sync-20260924-145406.patch`, `pre-main-sync-20260924-145640.patch` | Byte-identical copies of the legacy `index.css` patch. | Duplicates of the line above. |
| `pre-main-sync-status-*.txt` | `git status` snapshots from 2026-09-24 listing modified/untracked files at that moment. | Historical status only; the work they describe is covered by the rows above. |

## 3. Orphaned legacy modules removed from the live tree

Every file below was verified to have **zero import statements** pointing at it
(`client/src` + `scripts` + `server` + `api` + `shared` scanned), so none of them
was part of any rendered route.

- Legacy pages superseded by the visual-golden routes: `AlMubeenBotPage`,
  `AlMuftiAlMubeenPage`, `ChildrenTVPage`, `DailyRemindersPage`,
  `DigitalLibraryPage`, `GateOfLightPage`, `IslamicAIManagementPage`,
  `QuranAudioPage`, `SeerahForChildrenPage`, `SunnahPage`.
- Legacy duplicate components: `components/Prayer/*` (bound to the retired
  `/api/prayer-times` endpoint and to a silent Riyadh-coordinate default),
  `components/PrayerTimes/PrayerTimesCard`, `components/PrayerTimes/PrayerTimesWidget`,
  `components/Azkar/AzkarCounter`, `components/Daily/DailyVerse`,
  `components/DailyVerse/*`, `components/Features/FeatureCard`,
  `components/Homepage/SpiritualHub`, `components/IslamicAI/IslamicAIQuickCard`,
  `components/Library/BookCard`, `components/Library/LivingShelf`,
  `components/Library/ReadingDeskModal`, `components/Quran/VersCard`,
  `components/QuranAudio/ReciterSelector`, `components/Search/QuranSearch`.
- Orphan hooks: `use-islamic-calendar`, `use-prayer-times` (dead endpoint),
  `usePrayerTimes.tsx`, `useDivineMode`.
- Orphan data/util modules already flagged as prunable by
  `docs/audit/YA_RASOOL_ALLAH_FOUNDATION_AUDIT.md`: `data/islamic-content.ts`,
  `data/islamicContent.ts`, `data/mainStructure.ts`, `utils/islamicCalendar.ts`,
  `utils/bookCoverGenerator.ts`.

Tests that used deleted files as "repaired string" carriers were re-pointed at
surviving canonical files (`scripts/assistant-authority-boundary.test.ts`,
`scripts/data-encoding-integrity.test.ts`) so the encoding guarantees stay
enforced instead of disappearing with the dead files.

## 4. Guard rails added

- `scripts/legacy-baseline-absorption.test.ts` — asserts the prayer guide and
  knowledge drafts exist with pending-review labels, that every kids adaptation
  resolves to a readable source title, that review statuses render as honest
  Arabic labels, and that the retired folders/files are gone.
- `scripts/integration-audit.test.ts` — now asserts the unified discovery catalog
  (116 records, 0 approved) and that the retired duplicate catalog module
  (`client/src/data/mediaLibrary.ts`) no longer exists.
