# Forensic Reality Report — Ya Rasool Allah Platform

Generated: 2026-11-02 (this audit session)
Auditor: autonomous Principal Engineering / Forensic Production Team
Canonical repository: https://github.com/daynightae-cmyk/YaRasoolAllah.git
Epic: 26fa06ca-a198-4d52-9f67-ab0002b5a960

## 1. Project identity

- Product: "يا رسول الله ﷺ" (Ya Rasool Allah) — source-first digital institution for Seerah, Quran, Sunnah, learning, verified sources.
- Domain: yarasoolallah.it.com
- Founder: Eng. Sadek Elgazar (KNOUX), UAE.
- Type: full-stack web platform (React 18 + Vite 5 + Express 4 + TypeScript 5.6), PWA-ready, mobile-first, RTL/LTR, Arabic-first content with EN/FR/UR interface.
- Database: PostgreSQL (Drizzle ORM), optional; memory fallback for dev.
- Node: >=20 (verified v24.21.0).

## 2. Environment (verified)

- OS: Windows (win32), PowerShell host.
- Node: v24.21.0; npm 11.19.0; Python 3.14.8; git available.
- Chrome: C:/Program Files/Google/Chrome/Application/chrome.exe (used for smoke).
- Disk free: K: ~5.0 GB, D: ~7.7 GB, C: ~4.8 GB (measured this session).
- node_modules present after `npm install --prefer-offline` (~451 MB on main).

## 3. Repository reality (verified)

- Canonical remote: origin = https://github.com/daynightae-cmyk/YaRasoolAllah.git
- Current branch (this session): `main`, HEAD = `946daa83ac1c78c2a6865dd775db1808b9f75dfd` ("Integration/master reconcile 20260928 (#110)"), up to date with origin/main.
- Working tree: CLEAN (no uncommitted changes) on main.
- Branches: 60+ local/remote branches (feature slices, fixes, docs, research, traycer worktrees). None deleted this session.
- Worktrees: 2 — main checkout (K:/Knoux Projects/YaRasoolAllah/Base) and one traycer worktree `traycer/yarasoolallah-quick-badger` @ e19e6ed9 (clean).
- Unique preserved work: `_recovery/` holds 6 patch files from earlier syncs (kept untouched); `docs/archive/` holds orphan pages and prototypes.

## 4. Verification gates executed this session (main @ 946daa83)

| Gate | Command | Result |
|---|---|---|
| Typecheck | npm run check (tsc) | PASS (0 errors) |
| Unit/contract tests | npm run test:p0 | PASS 207/207, 27 suites, 0 fail |
| Source governance | npm run validate:sources | PASS (17 sources, 9 rights, 9 provider resources, 17 works, 33 digital versions, 18 provider policies) |
| Kids registry | npm run validate:kids-youtube | PASS (2 publishers) |
| Provider verification | npm run verify:providers | Mixed: PASS Open Library, Internet Archive, MP3Quran, AlAdhan; 403 Qatar Digital Library, BnF Gallica, Dorar; credential-blocked Quran Foundation, Sunnah.com, GeoNames, YouTube Data API, TimeZoneDB |
| Build | npm run build | PASS (9.38s; dist/index.js 146.4kb) |
| Visual golden smoke | scripts/smoke-visual-golden.mjs (CHROME_PATH set) | PASS 6/6 captured |
| Library reading smoke | scripts/smoke-library-reading.mjs | PASS (9,106 works open in-app) |
| Dev server | npm run dev | UP on port 3000 (JWT_SECRET ephemeral dev secret warning) |

## 5. Architecture (verified)

- Monorepo single package: `client/` (React/Vite), `server/` (Express), `shared/` (contracts), `scripts/` (validation/smoke/research), `migrations/` (Drizzle), `data-sources/`, `research/`, `docs/`, `artifacts/`.
- Routing: wouter; canonical public shell `InstitutionShell` for flagship + supporting routes; legacy AppLayout for /dashboard and /bab-alsamaa-settings; redirects for /ai-assistant etc.
- State: React Query, contexts (Language, Progress, Theme), hooks.
- Persistence: PostgreSQL via Drizzle when DATABASE_URL set; memory fallback (not production) otherwise. Currently dev uses memory (JWT_SECRET ephemeral warning).
- Security: signed sessions (scrypt passwords), quarantined demo endpoints (410), CORS/headers, no client-side API keys for privileged providers.

## 6. Functional status (verified against docs/audit/CURRENT_PRODUCT_REALITY.md + this session)

REAL_VERIFIED: Quran Arabic reader, MP3Quran audio (incl. inline recitation), Muyassar tafsir proxy, Library catalog + OpenITI reader (9,106 works), Kids theatre (curtain + governed catalog), canonical public shell, Hadith sample contracts + status contract, Seerah event graph (recorded relations), Atlas schematic+theatre, Basirah (local governed index), global search with canonical deep links, content-language declarations (31/31 routes), evidence contract (shared), visual evidence harness (26/26), assistant authority boundary, data-encoding integrity gate.
IMPLEMENTED_NOT_VERIFIED at production URL: Quran EN/FR/UR translations (AlQuran Cloud), QuranEnc translations (deferred branch), Vercel /api/content (quota).
BLOCKED_EXTERNAL: Hadith full corpus (credentials/rights), Adhkar corpus (rights/editorial), Atlas geographic layer (sourced coordinates), Kids approved YouTube (editorial pipeline), Quran Foundation/Sunnah.com/GeoNames/YouTube/TimeZoneDB (credentials), Qatar Digital Library/BnF Gallica/Dorar (403), production DB (DATABASE_URL), production deploy (Vercel quota).
PARTIAL: Kids content, production deploy.

## 7. Visual findings (verified)

- Visual golden smoke 6/6 (home, quran, kids 360, library, sources 1440/360) captured with content.
- Library reading smoke passes including TTS fallback, audiobook gate (hidden without cleared recording), pinned source, digital numbering notice.
- Content-language mismatch: 0 across 26 capture cases.
- Unnamed interactive: 0.
- Runtime errors in smoke: 0.
- Encoding: 15 of 16 U+FFFD losses repaired; 1 allowance remains in BabAlsamaa.tsx:75 (scholar confirmation needed).

## 8. Security & performance (verified)

- Auth: scrypt password hashing, signed expiring tokens, demo-token rejected, historical fallback JWT secret forbidden (test:p0 covers).
- Demo endpoints quarantined (410) — verified in tests.
- Ephemeral persistence confined to smoke runs (test covers).
- Production cannot opt into ephemeral persistence (test covers).
- Bundle: main chunk 484KB (gzip 160KB) warning; quranCorpus 668KB chunk. Performance optimization not yet addressed (P4).
- No lint script defined.

## 9. Storage (verified)

- K: ~5.0 GB free; D: ~7.7 GB; C: ~4.8 GB.
- Regenerable candidates (not deleted this session, documented): dist/ (13 MB), artifacts/visual-golden-smoke/ (4 MB), node_modules (451 MB, required).
- Unique preserved: _recovery/ patches (6 files), docs/archive/, all branches.

## 10. Top risks (verified)

1. Production DATABASE_URL not set → memory fallback (not production persistence).
2. Vercel deployment quota intermittent → production domain cutover unverified.
3. Credential-gated providers (5) and 403 providers (3) → features honestly degraded (not fake success).
4. BabAlsamaa.tsx:75 encoding allowance pending scholar confirmation.
5. Disk headroom low on D: (~7.7 GB) — full volume previously broke a git ref update.
6. Bundle size large (main 484KB, quranCorpus 668KB) — no code-splitting optimization yet.

## 11. Next safe action

No unblocked engineering task with a clear implementation path remains in the verified reality doc beyond external blockers. The earliest safe, ready, independent work is documentation/audit consolidation (this report and the task program) plus storage-recovery documentation. External blockers (DATABASE_URL, credentials, Vercel quota, scholar review) must be resolved by the owner before the corresponding gates can close. See TASK_PROGRAM_000_TO_PRODUCTION.md.
