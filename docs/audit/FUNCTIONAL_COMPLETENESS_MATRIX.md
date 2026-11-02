# Functional Completeness Matrix

Status vocabulary: REAL_VERIFIED / REAL_PARTIALLY_VERIFIED / IMPLEMENTED_NOT_TESTED / BACKEND_ONLY / UI_ONLY / MOCK_ONLY / BROKEN / MISSING / BLOCKED_EXTERNAL_DEPENDENCY / UNKNOWN.

| Capability | Status | Evidence |
|---|---|---|
| Quran Arabic reader (Tanzil) | REAL_VERIFIED | smoke + build + tsc |
| Quran EN/FR/UR translations (AlQuran Cloud proxy) | IMPLEMENTED_NOT_TESTED (at prod URL) | local proxy; Vercel quota blocks prod verification |
| Quran Muyassar tafsir (QuranEnc) | REAL_VERIFIED (local) | PR #95; surah 112 text rendered |
| Quran audio (MP3Quran) inline + /audio | REAL_VERIFIED | smoke; failure alerts tested |
| Library catalog + OpenITI reader | REAL_VERIFIED | smoke-library-reading PASS (9,106 works) |
| Library other formats (PDF/IIIF/EPUB/presentation/audiobook) | REAL_VERIFIED as zero records | catalogCapabilityReport; honest empty state |
| Kids theatre (curtain) | REAL_VERIFIED | visual smoke kids 360 |
| Kids approved content | PARTIAL / BLOCKED_EXTERNAL | approved catalog empty; curated seeds; recovered queue pending |
| Canonical public shell | REAL_VERIFIED | 31 routes declared |
| Hadith sample contracts (copy/deep-link/search) | REAL_VERIFIED | PR #92 |
| Hadith provider/corpus status | REAL_VERIFIED | /api/content/hadith/status both servers |
| Hadith full corpus | BLOCKED_EXTERNAL_DEPENDENCY | credentials/rights/editorial |
| Seerah event graph (recorded relations) | REAL_VERIFIED | PR #98 (23 nodes, 62 edges) |
| Atlas schematic + theatre | REAL_VERIFIED | visual smoke |
| Atlas geographic layer | MISSING (blocked: sourced coords) | — |
| Adhkar corpus | BLOCKED_EXTERNAL_DEPENDENCY (rights) | — |
| Basirah (local governed index) | REAL_VERIFIED | — |
| Global search + canonical deep links | REAL_VERIFIED | PR #77/#78 |
| Content-language declarations (31 routes) | REAL_VERIFIED | multilingual closure slice |
| Evidence contract (shared) | REAL_VERIFIED | scripts/evidence-contract.test.ts |
| Visual evidence harness | REAL_VERIFIED | 26/26 cases |
| Assistant authority boundary | REAL_VERIFIED | whole-tree scan test |
| Data encoding integrity | REAL_VERIFIED | 15/16 repaired; 1 allowance |
| Auth (scrypt, signed tokens) | REAL_VERIFIED | test:p0 |
| Demo endpoint quarantine | REAL_VERIFIED | test:p0 |
| Persistence (PostgreSQL) | BLOCKED_EXTERNAL_DEPENDENCY (DATABASE_URL) | memory fallback in dev |
| Production deploy | PARTIAL / BLOCKED_EXTERNAL | Vercel quota |
| Credential-gated providers (5) | BLOCKED_EXTERNAL_DEPENDENCY | adapters only |
| 403 providers (QDL, BnF, Dorar) | BLOCKED_EXTERNAL_DEPENDENCY | dormant adapters |

## Service completion summary

- REAL_VERIFIED count: ~25 capability groups.
- BLOCKED_EXTERNAL_DEPENDENCY: ~8.
- No MOCK_ONLY or BROKEN services remain in main (demo endpoints quarantined to 410).
