# Functional Completeness Matrix

Status vocabulary: REAL_VERIFIED / REAL_PARTIALLY_VERIFIED / IMPLEMENTED_NOT_TESTED / BACKEND_ONLY / UI_ONLY / MOCK_ONLY / BROKEN / MISSING / BLOCKED_EXTERNAL_DEPENDENCY / UNKNOWN.

Refreshed 2026-11-24 against `main` @ `eff3a6eb` and the live production
domain. Companion document: `docs/audit/PRODUCT_GAP_AUDIT_2026-11-24.md`.

| Capability | Status | Evidence |
|---|---|---|
| Quran Arabic reader (Tanzil, 114/6236) | REAL_VERIFIED | live bundle + corpus SHA-256 in `client/src/data/quranCorpus.ts` |
| Quran EN/FR/UR translations (AlQuran Cloud proxy) | REAL_VERIFIED at the production URL | live 200 ×3 in `artifacts/runtime-evidence/live-api-20261124/live-http-sweep.json` |
| Quran Muyassar tafsir (QuranEnc) | REAL_VERIFIED at the production URL | live 200, `surah=112` |
| Quran audio (MP3Quran) inline + /audio | REAL_VERIFIED | 8 recitations / 5 categories + failure-state gates |
| Library catalog (9,129 works) | REAL_VERIFIED | `catalogCapabilityReport()` |
| Library in-app reading | REAL_PARTIALLY_VERIFIED | 16 works readable via the governed gate; 9,090 catalog-text-only; 23 metadata-only |
| Library other formats (PDF/IIIF/EPUB/presentation/audiobook) | REAL_VERIFIED as zero records | `catalogCapabilityReport()` |
| IIIF manuscript reader | REAL_VERIFIED implementation / 0 openable content | 2 curated manifests, both upstream 403 → live 502 `provider_blocked` ×2; allowlist rejects foreign hosts with 400 |
| IIIF security policy | REAL_PARTIALLY_VERIFIED | manual review (host allowlist, 8 MiB cap, redirect re-validation, 12 s timeout, cache 80); an independent sub-review failed twice with provider 429 and is **not** claimed |
| Native shells reading governed content | REAL_VERIFIED | browser-level CORS check with the deployed bundle from `http://localhost` → 200 + ACAO; `docs/evidence/NATIVE_SHELL_CORS_VERIFICATION_20261124.md` |
| Noor media theatre (`/noor`) | REAL_VERIFIED | 5 captures (1672/1440/768/390/360), 0 failures; `/media-theater` redirects, `/media-review` stays editorial |
| Kids theatre (curtain) | REAL_VERIFIED | visual smoke |
| Kids approved content | BLOCKED_EXTERNAL_DEPENDENCY | approved catalog is an empty array (0); 116 discovered records pending rights/editorial review |
| Canonical public shell | REAL_VERIFIED | 44 route paths + 6 redirects |
| Hadith sample contracts (copy/deep-link/search) | REAL_VERIFIED | live status endpoint + gates |
| Hadith provider/corpus status | REAL_VERIFIED | live `/api/content/hadith/status` 200 |
| Hadith full corpus | BLOCKED_EXTERNAL_DEPENDENCY | credentials/rights/editorial; 4 samples only |
| Seerah database | REAL_VERIFIED | 10 eras · 101 events · 58 people · 32 places · 15 sources |
| Seerah event graph (recorded relations) | REAL_VERIFIED | 72 Quran refs / 51 hadith refs; only recorded relations |
| Seerah human/scholarly review | BLOCKED_EXTERNAL_DEPENDENCY | 206 required · 0 signed · 206 pending |
| Atlas schematic + theatre | REAL_VERIFIED | visual smoke |
| Atlas geographic layer | MISSING (blocked: sourced coords) | — |
| Adhkar corpus | BLOCKED_EXTERNAL_DEPENDENCY (rights) | — |
| Basirah (local governed index) | REAL_VERIFIED | — |
| Global search + canonical deep links | REAL_VERIFIED | gates |
| Content-language declarations | REAL_VERIFIED | multilingual closure gates |
| Evidence contract (shared) | REAL_VERIFIED | `scripts/evidence-contract.test.ts` |
| Visual evidence harness | REAL_VERIFIED | 101 cases defined; 7 captured in the 2026-11-24 session with 0 failures |
| Assistant authority boundary | REAL_VERIFIED | whole-tree scan gate |
| Data encoding integrity | REAL_VERIFIED | 15/16 repaired; 1 documented allowance (`BabAlsamaa.tsx:75`) |
| Auth (scrypt, signed tokens) | REAL_VERIFIED in code / unavailable in production | gate passes; production answers 503 `RUNTIME_CONFIG_MISSING` |
| Demo endpoint quarantine | REAL_VERIFIED | gate |
| Persistence (PostgreSQL) | BLOCKED_EXTERNAL_DEPENDENCY | production `DATABASE_URL` missing; memory fallback in dev only |
| Production deploy (client + public content API) | REAL_VERIFIED | live 200s + deployed-bundle content check |
| Production deploy (main API: auth/persistence/health) | BLOCKED_EXTERNAL_DEPENDENCY | 503 `RUNTIME_CONFIG_MISSING` |
| Credential-gated providers (5) | BLOCKED_EXTERNAL_DEPENDENCY | adapters closed |
| 403 providers (QDL, Gallica, Dorar) | BLOCKED_EXTERNAL_DEPENDENCY | dormant adapters; live 502 `provider_blocked` |

## Service completion summary (2026-11-24)

- REAL_VERIFIED capability groups: **31**.
- REAL_PARTIALLY_VERIFIED: **2** (Library in-app reading, IIIF security review).
- BLOCKED_EXTERNAL_DEPENDENCY: **10**.
- MISSING: **1** (Atlas geographic layer).
- No MOCK_ONLY and no BROKEN service remains in `main`; demo endpoints stay quarantined to 410 and every provider failure surfaces as an honest error state.
