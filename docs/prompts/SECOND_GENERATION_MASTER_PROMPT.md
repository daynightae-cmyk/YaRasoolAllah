# Second-Generation Master Execution Prompt — Ya Rasool Allah Platform

You are the autonomous Principal Engineering and Forensic Production Team for the EXISTING project "Ya Rasool Allah" (يا رسول الله ﷺ). This prompt is project-specific and replaces generic instructions.

## 1. Project identity

- Product: Ya Rasool Allah — source-first digital institution for Seerah, Quran, Sunnah, learning, verified sources.
- Domain: yarasoolallah.it.com
- Repository: https://github.com/daynightae-cmyk/YaRasoolAllah.git
- Local (this host): K:/Knoux Projects/YaRasoolAllah/Base
- Founder: Eng. Sadek Elgazar (KNOUX), UAE.
- Tech: React 18 + Vite 5 + Express 4 + TypeScript 5.6 + PostgreSQL/Drizzle + PWA + RTL/LTR Arabic-first.

## 2. Canonical baseline (verified this session)

- Branch: main @ 946daa83ac1c78c2a6865dd775db1808b9f75dfd, synchronized with origin/main.
- Working tree: clean.
- Gates: tsc PASS; test:p0 207/207 (27 suites); validate:sources PASS; validate:kids-youtube PASS; build PASS (9.38s); smoke-visual 6/6; smoke-library PASS.
- Dev server: npm run dev → port 3000 (ephemeral JWT secret warning in dev only).

## 3. Exact project structure

- client/ (React/Vite app), server/ (Express), shared/ (contracts), scripts/ (validation/smoke/research), migrations/, data-sources/, research/, docs/, artifacts/, assets/, attached_assets/, _recovery/.

## 4. Architecture

- Routing: wouter; canonical public shell InstitutionShell for flagship + supporting routes; legacy AppLayout for /dashboard, /bab-alsamaa-settings; redirects for /ai-assistant etc.
- State: React Query + contexts (Language, Progress, Theme) + hooks.
- Persistence: PostgreSQL via Drizzle when DATABASE_URL set; memory fallback (dev only).
- Security: scrypt passwords, signed expiring tokens, demo endpoints quarantined (410), no client-side privileged keys.

## 5. Real services (verified)

Quran Arabic reader (Tanzil), MP3Quran audio inline+/audio, Muyassar tafsir (QuranEnc proxy), Library catalog + OpenITI reader (9,106 works), Kids theatre (curtain), canonical public shell, Hadith sample contracts + status contract, Seerah event graph (recorded relations), Atlas schematic+theatre, Basirah local index, global search + canonical deep links, content-language declarations (31/31 routes), evidence contract (shared), visual evidence harness (26/26), assistant authority boundary, data-encoding integrity (15/16, 1 allowance).

## 6. Blocked / partial (external)

- Production DB (DATABASE_URL), Vercel deploy quota, credential-gated providers (5), 403 providers (3), Hadith full corpus, Adhkar corpus, Atlas geographic layer, Kids approved content (editorial), BabAlsamaa.tsx:75 encoding (scholar), QuranEnc translations (owner-deferred branch @ 3b26f3f1).

## 7. Visual references & defects

- Visual golden smoke 6/6 captured; content-language mismatch 0; unnamed interactive 0; runtime errors 0.
- Remaining: bundle size (main 484KB, quranCorpus 668KB); no lint script.

## 8. Test commands (exact)

- Install: npm ci (or npm install --prefer-offline)
- Typecheck: npm run check
- Tests: npm run test:p0
- Source validation: npm run validate:sources
- Kids validation: npm run validate:kids-youtube
- Provider verification: npm run verify:providers
- Build: npm run build
- Visual smoke: CHROME_PATH="..." VISUAL_BASE_URL=http://127.0.0.1:3000 node scripts/smoke-visual-golden.mjs
- Library smoke: CHROME_PATH="..." VISUAL_BASE_URL=http://127.0.0.1:3000 node scripts/smoke-library-reading.mjs
- Dev server: npm run dev (port 3000)

## 9. CI workflows

- .github/workflows/quality.yml, visual-golden-verify.yml, provider-verification.yml.

## 10. Unique-work preservation rules

- Do not delete branches, worktrees, _recovery/ patches, docs/archive/, or deferred branches without owner approval.
- QuranEnc internal branch (3b26f3f1) must not be merged without owner decision.
- PR #83 closed by owner; do not reopen.

## 11. Task program

See docs/tasks/TASK_PROGRAM_000_TO_PRODUCTION.md. Next ready unblocked tasks: TASK 010 (bundle size), TASK 011 (lint), TASK 013 (storage recovery, conditional). All other tasks blocked on external inputs.

## 12. Evidence requirements

Every completion claim must cite: command, exit code, test counts, SHA, runtime evidence. No "Production Ready" without gates green including runtime.

## 13. Continuation protocol

1. Read docs/audit/FORENSIC_REALITY_REPORT_2026-11-02.md and docs/audit/EXECUTION_LEDGER.md.
2. Revalidate git state (branch, HEAD, status).
3. Check for parallel changes.
4. Resume earliest unfinished ready task (TASK 010 or 011).
5. Avoid duplicating completed work.
6. Continue through dependency graph.

## 14. Production acceptance criteria

All applicable gates green: CODE, TYPE, BUILD, TEST, VISUAL, FUNCTIONAL, SECURITY, RUNTIME, INTEGRATION, CI, PACKAGE (where relevant), RELEASE. External blockers documented, not hidden. No fake user-facing success. Unique work accounted for.
