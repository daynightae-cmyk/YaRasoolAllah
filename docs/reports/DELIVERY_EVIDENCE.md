# Delivery Evidence — 2026-11-02

Branch/PR: see `EXECUTION_LEDGER_CURRENT.md` for the exact PR URL after publication. Local base: `origin/main` `21416a4b` (README-only PR #111), local audit commit `655f5bc4`.

## Slice 1 — truthful baseline + protected unique work (local commit `655f5bc4`)

| Gate | Command | Result |
|---|---|---|
| TypeScript | `npm run check` | exit 0 |
| P0 tests | `npm run test:p0` | 207 pass / 207, 27 suites, 0 fail, exit 0 |
| Production build | `npm run build` | exit 0, 11.59–12.06 s |
| Visual smoke | `node scripts/smoke-visual-golden.mjs` | exit 0, **40 captures**, `artifacts/visual-golden-smoke` |
| Source governance | `npm run validate:sources` | PASS (prior SHA; no source change since) |
| Kids registry | `npm run validate:kids-youtube` | PASS (prior SHA; no registry change since) |

Deliverables written:

- `docs/audit/REALITY_SNAPSHOT_2026-11-02.md`
- `docs/audit/CONFLICT_AND_SUPERSESSION_REGISTER.md`
- `docs/audit/UNIQUE_WORK_PROTECTION_LEDGER.md`
- `docs/audit/PRODUCTION_RUNTIME_EVIDENCE.md`
- `docs/audit/DATA_RIGHTS_CAPABILITY_MATRIX_CURRENT.md`
- `docs/tasks/EXECUTION_LEDGER_CURRENT.md`

## Slice 2 — incremental lint gate (TASK 011)

### Before

- No ESLint configuration, no `lint` script, no CI lint step.
- `scripts/smoke-visual-golden.mjs` contained `.replace(/\s+/g, " ")` **inside a template literal**, which JavaScript evaluates as `/s+/g` (the backslash was consumed). This silently weakened the theatre-remote label normalization.
- `scripts/verify-provider-endpoints.ts` declared an unused `root` path and unused imports.
- `client/src/components/SurahList.tsx` used `let filtered` for a value that is never reassigned.

### After

- Added flat `eslint.config.js` scoped to `client/src`, `server`, `api`, `shared`, `scripts`.
- Added `"lint"` script to `package.json` and a CI step in `.github/workflows/quality.yml`.
- Fixed the template-literal escape bug (`/\\s+/g` in source → `/\s+/g` in the page script).
- Removed unused `root` and the then-unused `fileURLToPath` import.
- Changed `let filtered` → `const filtered`.
- Client `no-unused-vars` warnings (342 at introduction) are intentionally deferred; `tsc` remains the type authority. Server/api/shared/scripts enforce the rule as warning.

### CI findings on PR #112

First CI run:

| Check | Result |
|---|---|
| Quality Gates (`quality`) | PASS — includes the new lint step |
| Visual Golden Verify (`verify`) | PASS |
| Provider Verification (`verify-public-contracts`) | **FAIL** — `ReferenceError: dirname is not defined` at output writing |
| Vercel preview | PASS |

The failure was a regression from removing `dirname` while removing the unused `root`. CI caught it before merge; the import was restored. BnF Gallica and Dorar `403` responses were also reclassified from `FAIL` to `BLOCKED_PROVIDER` (matching the existing QDL behaviour), because the verifier's own semantics distinguish provider blocks from contract failures. Local verifier run after the fix: 4 PASS, 3 BLOCKED_PROVIDER, 5 BLOCKED_CREDENTIAL, exit 0.

### Evidence

| Gate | Command | Result |
|---|---|---|
| Lint | `npm run lint` | exit 0, **0 problems** |
| TypeScript | `npm run check` | exit 0 |
| P0 tests | `npm run test:p0` | 207 pass / 207, 27 suites, 0 fail, exit 0 |
| Build | `npm run build` | exit 0, 11.59 s |
| Visual smoke | `CHROME_PATH=... VISUAL_BASE_URL=http://127.0.0.1:3000 node scripts/smoke-visual-golden.mjs` | exit 0, **40 captures** |

## Production evidence correction

Earlier in this session `/api/content/quran/surahs` was treated as a broken API. Full probing shows:

- `/api/content/quran/tafsir?surah=1&ayah=1` → **200** real QuranEnc Muyassar JSON.
- `/api/content/quran/translations?surah=1&language=en` → **200** real Saheeh International JSON.
- `/api/content/hadith/status` → **200** truthful status.
- `/api/content/quran/surahs` → 404 because the route does not exist in source and the client does not call it.
- `/api/health` and `/api/nonexistent` → **500** because the main API app (`createApiApp`) throws at startup when production `JWT_SECRET`/`DATABASE_URL` are absent.

So production **public content** is live; production **auth/health/persistence** is blocked by missing owner environment. Deployment SHA remains unverified (asset hashes differ from local build).

## Unverified / open

- No production deployment was performed.
- CI for the new branch must be observed after push; do not claim SUCCESS before it completes.
- `BabAlsamaa.tsx:75` U+FFFD remains blocked pending a trustworthy source/scholar.
- QuranEnc branch remains `DEFERRED_OWNER`.
