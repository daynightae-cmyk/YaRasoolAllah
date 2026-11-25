# Quran reader recovery — 2026-11-25

Status: implemented; local interaction checks verified. This is not acceptance of full reference fidelity or completion of the 54-reference institution mission.

## Starting reality

- Canonical main: `01ff2fd9cc9d318e2e73a3d7e74ba5c77e5ac23c`, matching live GitHub main before this recovery.
- Preview process exited after Babel rejected an uncommitted QuranMushafBook edit containing `0uta`, `falseCal`, a mismatched `diveb` tag and stray text.
- The same edit had two competing spread states, removed book keyboard/touch handlers, introduced an unwired chapterNumber prop and ornamental elements without styles.
- Unrelated Android changes, preexisting attached_assets deletions and untracked reference/evidence files are retained outside this changeset.

## Implemented

- Repaired syntax and retained the new ornamental page treatment.
- Restored one spread state, chapter identity, keyboard, pointer and touch paths.
- Connected actual CSS 3D leaf rotation to the angle and lift calculated by the existing turn controller; removed the second back-page rotation.
- Kept animated duplicate verses out of keyboard focus and prevented corner gestures from also triggering a book swipe under reduced motion.
- Restored stable `quran-ayah-SURAH-AYAH` IDs on the real pages only. The previous Visual Golden failure waited for those missing IDs; animated copies never duplicate them.
- Kept source verse objects and Arabic text unchanged, with configurable page-record limits and scrollable content for long verses.
- Bounded the book to its reading container and added mobile text margins.
- Added `test:mushaf` to Quality Gates.

## Local evidence

- `npm run check`: exit 0.
- `npm run test:mushaf`: 4 tests passed, including ordering, object/text preservation, opening spread and long-record retention.
- `npm run test:p0`: 711 passed, 0 failed.
- `npm run lint`: exit 0.
- `npm run build`: production renderer and server build verified; existing chunk-size warning remains.
- `node scripts/verify-mushaf-interactions.mjs`: Chromium at 1440px and 390px; one book, two pages, seven opening-surah verses, keyboard next/back, verse selection, reduced-motion touch corner and full-motion pointer drag verified.
- Full-motion evidence records a real matrix3d transform with a nonzero rotation component, and checks that animated hidden copies have no tab stops.
- Screenshots and machine-readable results: `artifacts/evidence/mushaf-recovery/` (local artifacts).
- Preview restarted on localhost:3000.

## Limits

- Local Chromium checks are not installed Android/Electron or physical-device acceptance.
- Generated ornament is decorative; pagination is surah-local and does not claim a printed Madani Mushaf layout.
- Exact reference composition, every institution wing, provider playback and production deployment remain outside this recovery's verified result.
- Prior Visual Golden Verify failed while waiting for seven opening-surah verse IDs on the starting SHA. Delivered-SHA CI must be checked separately.
