# YaRasoolAllah / Noor Media Theatre — Verified Execution Record

Date: 2026-11-24 (Asia/Dubai)
Canonical repository: `K:\Knoux Projects\YaRasoolAllah\Base`
Starting `HEAD` and `origin/main`: `eede9208c4af225caebf6f6cacb24761201f24e5`

## Implemented

- Preserved existing world/Seerah work and the 11 curated local reference images.
- Mounted the independent `/noor` theatre and its navigation and canonical-route declarations.
- Removed the previously embedded Seerah media catalog in favor of a separate, linked wing.
- Added a complete responsive `NoorMediaTheatre.module.css` using the existing emerald/gold/black institution identity.
- Added seven Noor governance, filtering, duration, route and CSS coverage tests.
- Kept official-provider playback and third-party thumbnails fail-closed unless relevant media-review rights gates pass.
- Updated existing language and world registry contract tests for the new canonical media wing.

## Verified on the connected Windows development machine

| Verification | Command | Result |
| --- | --- | --- |
| Noor targeted tests | `node_modules/.bin/tsx.cmd --test scripts/noor-theatre.test.ts` | 14 passed; 0 failed |
| TypeScript | `npm run check` | exit 0 |
| Production web/server build | `npm run build` | exit 0 |
| P0 project suite | `npm run test:p0` | 666 passed; 0 failed; 87 suites; exit 0 |
| ESLint | `npm run lint` | exit 0 on the tested working tree |
| Browser visual captures | `VISUAL_BASE_URL=http://127.0.0.1:4273 VISUAL_CASES=^noor-theatre- node scripts/capture-visual-evidence.mjs` | 5 captures; 0 mount errors; 0 horizontal overflow; 0 runtime error cases; 0 unnamed interactive elements; 0 direction/language mismatches |

The browser capture command was executed on Windows using PowerShell environment variables. Captures were written to `artifacts/visual-evidence/noor-20261124/`, covering 1672px, 1440px, 768px, 390px dark RTL, and 360px light LTR. Visual spot checks included both mobile captures and the 1440px desktop output.

## Current catalog truth

The theatre displays 53 non-children catalog records, currently **0 approved for playback**. A displayed source URL is not evidence that embedding, permissions, or publication review passed. No fabricated progress or playback is permitted.

## Work deliberately not included in the Noor integration

- Android Capacitor Gradle changes remain in the owner working tree and are not treated as Noor changes.
- `client/public/manus-routes.json` carries the `/noor` route in the committed Noor integration; it is not presented as new design authority.
- IIIF reader recovery lives in a separate active worktree at `D:\Temp\opencode\yra-iiif-recovery`. It was committed as `7b867d8c` for independent review and must not be described as merged until its security review and integration gates pass.
- `C:\Users\day night\Downloads\04_NOOR_MEDIA_THEATRE.png` is retained as a verified *candidate* at `artifacts/visual-references/candidates/04_noor_media_theatre.png`; it is not an approved member of the curated eleven and no owner approval is claimed.
- The older temporary capture helper `scripts/.noor-capture-setup.cjs` was reviewed and removed from the working tree after its live Noor cases had already been ported into `scripts/capture-visual-evidence.mjs`; no unique capture behavior remained.
- The recovered reference candidate is documented at `docs/evidence/NOOR_REFERENCE_CANDIDATE_20261124.md` and keeps its SHA-256 provenance; it is intentionally outside the approved series.

## Remaining evidence before product release

- Verify user-driven search, dialog focus, fullscreen controls and external links in a real browser.
- Run tests/packaging on the real Android device and Windows Electron distributable as applicable.
- Inspect final GitHub CI status and deployment/runtime independently of local build success.
- Finish IIIF recovery only after its independent security review and full integration gates pass.
- Only clean confirmed disposable cache files; preserve unique work, backups and approved reference originals.

No PASS/COMPLETE claim is made here for Android device QA, IIIF, deployed runtime, GitHub CI or release.