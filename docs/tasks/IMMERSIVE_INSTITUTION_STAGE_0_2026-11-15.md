# Ya Rasool Allah — Immersive Institution Stage 0 Baseline

**Captured:** 2026-11-15
**Status:** `IMPLEMENTED_LOCAL_UNCOMMITTED`
**Base SHA:** `df4880589016aa4681b6d43233ecc136f4e32238`
**Final SHA at checkpoint:** `df4880589016aa4681b6d43233ecc136f4e32238`
**Branch:** `main`
**Worktree:** `K:/Knoux Projects/YaRasoolAllah/Base`

## Repository truth

- Canonical root was confirmed with `git rev-parse --show-toplevel`.
- The active branch is `main` at `df4880589016aa4681b6d43233ecc136f4e32238`.
- The locally available `origin/main` remains the observation recorded by the forensic baseline (`5d069b83`); no remote refresh or merge is claimed here.
- `App.tsx` declares 39 route path entries. `public-shell.ts` declares 36 canonical visual paths plus intentional AppLayout exceptions. Deep links remain under `/library/work/:workId` and `/who-is-muhammad/:chapter`.
- One worktree is registered. No reset, clean, checkout, prune, worktree removal, branch deletion, force push, or history rewrite was performed.

## Existing product

- Vite + React + TypeScript web client, Express/Vercel API server, shared contracts, governed source data, and an existing Three.js implementation.
- Canonical public shell: `client/src/visual-golden/components/shell/InstitutionShell.tsx`.
- Application route registry: `client/src/App.tsx`.
- Existing route/data implementations already cover substantial Quran, Hadith, Library, Seerah, Sources, Basirah, Kids, Audio, and Daily behavior. Later stages must extend and not duplicate these surfaces.

## Protected dirty evidence

The following tracked files were already modified before this work and were not edited. Their baseline SHA-256 values are recorded so any later change is detectable.

| Path | Bytes | SHA-256 |
|---|---:|---|
| `artifacts/visual-evidence/audio-1440-dark-rtl.jpg` | 182974 | `74FB2A9CD2CB62ADC171285B417A1958A7CD0985137B9FB14A14B6775F401A43` |
| `artifacts/visual-evidence/children-1440-dark-ltr.jpg` | 144618 | `AD2FE2BD2F290917DECB47FDED790365BB6BF0818183C208E4CE5AD11280D589` |
| `artifacts/visual-evidence/children-360-light-rtl.jpg` | 58409 | `6DE0FD643AD4AB959A0F9FA4F34113A5F179BC73FE737A3FB30F5038F97ECA6C` |
| `artifacts/visual-evidence/daily-360-dark-ltr.jpg` | 59465 | `1A9A0070ECC6DF76438F0C859F046A9D58933B4BEA109CAAF6F9E12466031357` |
| `artifacts/visual-evidence/daily-768-light-rtl.jpg` | 103135 | `ABF7543D2FC80A819C124697AA2392448BE532C35412BA7AD339EE95162E363E` |
| `artifacts/visual-evidence/daily-verse-honesty-1440-dark-rtl.jpg` | 151248 | `A3E8DA7BE6AFBCD58BFA8D29E9DA69B066BCCB4D4FB065A8113922954313BA85` |
| `artifacts/visual-evidence/hadith-1440-light-rtl.jpg` | 197807 | `724AB8227378A75AE9327C21722EB1E13EC553905086A4C923CF24FE2AE39BEE` |
| `artifacts/visual-evidence/seerah-1440-dark-rtl.jpg` | 212857 | `F264C2F3452F9FE8FF728439846A60E02E636AF6C3B3E98177F47B58842C4D00` |

## Baseline gates

| Gate | Command | Exit | Result |
|---|---|---:|---|
| Type | `npm run check` | 0 | TypeScript completed without diagnostics |
| Lint | `npm run lint` | 0 | ESLint completed without reported problems |
| P0 | `npm run test:p0` | 0 | 234 passed, 0 failed, 29 suites |
| Sources | `npm run validate:sources` | 0 | 21 sources, 13 rights records, 12 provider resources, 17 works, 33 digital versions, 20 provider policies, 0 rights-cleared audiobooks, 5 children adaptations, 4 review-pending hadith samples, 0 cleared media assets |
| Kids registry | `npm run validate:kids-youtube` | 0 | 2 publishers |
| Build | `npm run build` | 0 | Vite built 2252 modules; server bundle 153.4 kB |
| Diff hygiene | `git diff --check` | 0 | No whitespace errors reported |
| Unreachable Git objects | `git fsck --no-reflogs --unreachable` | 0 | 122 output lines; preserved as recovery evidence |

The build continued to report the pre-existing non-blocking large-chunk warning for `quranCorpus` and `LibraryPage`.

## Storage inspection

- Drive `K:` measurement at checkpoint: 41,729,429,504 bytes used; 9,793,396,736 bytes free.
- `.git/`, `_recovery/`, `research/`, `data-sources/`, `docs/`, `attached_assets/`, `artifacts/visual-evidence/`, worktrees, branches, and backups remain preserved.
- No storage cleanup candidate was deleted. `dist/` and `node_modules/` remain active/regenerable but were retained because the verification build and test environment depend on them.

## External boundaries

- Production persistence remains blocked on secure owner-provided `DATABASE_URL` and `JWT_SECRET`.
- Production deployment, runtime SHA, remote CI/PR state, and package signing are not established by this local checkpoint.
- Credential-gated providers remain blocked until an official credential/access path and rights evidence are supplied. No secret is requested in repository or chat.

## Exact next safe action

Implement Stage 1 as a bounded workspace-shell slice: central semantic tokens, truthful route/room metadata, breadcrumb and data-status surfaces, explicit theme/motion preferences, and accessible mobile/drawer behavior. Preserve the route registry and all protected evidence.
