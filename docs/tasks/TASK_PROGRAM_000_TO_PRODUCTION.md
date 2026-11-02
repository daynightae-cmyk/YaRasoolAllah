# Task Program 000 → Production

Canonical baseline: main @ 946daa83 (this session verified). Gates green: tsc PASS, test:p0 207/207, validate:sources PASS, validate:kids-youtube PASS, build PASS, smoke-visual 6/6, smoke-library PASS.

## TASK 000 — Verified baseline & forensic reality (THIS TASK)
- Status: COMPLETED (this session)
- Objective: Establish verified reality, preserve unique work, produce forensic report.
- Deliverables: docs/audit/FORENSIC_REALITY_REPORT_2026-11-02.md, UNIQUE_WORK_RECOVERY_REGISTER.md, SAFE_INTEGRATION_PLAN.md, FUNCTIONAL_COMPLETENESS_MATRIX.md, STORAGE_RECOVERY_REGISTER.md.
- Evidence: gates listed above.

## TASK 001 — Production persistence (DATABASE_URL)
- Priority: P0
- Status: BLOCKED_EXTERNAL (requires owner/infra DATABASE_URL)
- Objective: Run on PostgreSQL in production; remove memory fallback reliance.
- Scope: configure DATABASE_URL, run drizzle-kit push, verify /api/health reports db persistence, add migration smoke.
- Acceptance: /api/health persistence != ephemeral; db:push success; tests pass.
- Blocker: DATABASE_URL provision.

## TASK 002 — Production deploy verification (Vercel)
- Priority: P0
- Status: BLOCKED_EXTERNAL (Vercel quota)
- Objective: Verify production domain cutover yarasoolallah.it.com serves latest main.
- Scope: deploy, smoke /api/content/* on prod, capture evidence.
- Acceptance: production URL returns 200 for / and /api/content/quran/surahs; visual smoke on prod.
- Blocker: Vercel quota.

## TASK 003 — Credential-gated providers (5)
- Priority: P1
- Status: BLOCKED_EXTERNAL
- Providers: Quran Foundation, Sunnah.com, GeoNames, YouTube Data API, TimeZoneDB.
- Objective: obtain credentials, wire adapters, gate with tests + rights evidence.
- Acceptance: verify:providers PASS for each; no fake success.

## TASK 004 — 403 provider recovery (QDL, BnF Gallica, Dorar)
- Priority: P2
- Status: BLOCKED_EXTERNAL
- Objective: resolve 403 (proxy/auth/terms) or mark dormant with honest UI.
- Acceptance: verify:providers PASS or documented dormant.

## TASK 005 — Hadith full corpus acquisition
- Priority: P1
- Status: BLOCKED_EXTERNAL (lawful source + credentials + rights + editorial review)
- Objective: replace 4 dev samples with governed corpus.
- Acceptance: corpus endpoint returns real records; copy/deep-link/search gates pass at scale.

## TASK 006 — Adhkar corpus (rights/editorial)
- Priority: P2
- Status: BLOCKED_EXTERNAL
- Objective: bind sourced adhkar corpus to /daily.
- Acceptance: /daily renders sourced adhkar; empty state otherwise (already honest).

## TASK 007 — Atlas geographic layer
- Priority: P2
- Status: BLOCKED_EXTERNAL (sourced coordinates)
- Objective: replace schematic with sourced geographic layer; keep schematic labeled.
- Acceptance: coordinates sourced; certainty badge preserved.

## TASK 008 — Kids approved content pipeline
- Priority: P2
- Status: PARTIAL (editorial)
- Objective: promote governed approved YouTube videos through editorial pipeline; never auto-promote pending.
- Acceptance: approved catalog non-empty only after editorial sign-off; validate:kids-youtube PASS.

## TASK 009 — BabAlsamaa.tsx:75 encoding allowance (scholar confirmation)
- Priority: P3
- Status: BLOCKED_EXTERNAL (scholar review)
- Objective: confirm original character (letter vs diacritic); update allowance or repair.

## TASK 010 — Bundle size optimization
- Priority: P4
- Status: READY (unblocked)
- Objective: code-split main (484KB) and quranCorpus (668KB) chunks; reduce initial load.
- Scope: dynamic imports, manualChunks, measure before/after.
- Acceptance: build passes; main chunk < 300KB gzip; no regression in smoke.

## TASK 011 — Lint setup
- Priority: P4
- Status: READY
- Objective: add eslint config + lint script; run clean.
- Acceptance: npm run lint exists and passes.

## TASK 012 — QuranEnc translations additive slice (owner decision)
- Priority: P2
- Status: BLOCKED_EXTERNAL (owner decision)
- Branch: origin/feat/quranenc-translations-internal-20260925 @ 3b26f3f1 (verified locally).
- Acceptance: merge only after owner approval; keep AlQuran Cloud + QuranEnc side by side.

## TASK 013 — Storage recovery (when critical)
- Priority: P5
- Status: READY (conditional)
- Objective: if disk critical, delete regenerable dist/ + smoke screenshots; document recovered bytes.
- Acceptance: measured recovery logged; unique work untouched.

## TASK 014 — Second-generation master prompt
- Status: COMPLETED (this session) → docs/prompts/SECOND_GENERATION_MASTER_PROMPT.md

## Dependency order

000 → (010, 011, 013) in parallel; 001, 002, 003, 004, 005, 006, 007, 008, 009, 012 blocked on external inputs.

## Next ready task

TASK 010 (bundle size optimization) — unblocked, safe, measurable. Or TASK 011 (lint). Choose based on owner priority.
