# Production Source Integration Evidence

## Slice: Provider Verification — 2026-09-24

- START_MAIN_SHA: `476b7604eaa4038ad9166c02aad06d3ab2858faf`
- BRANCH: `feat/provider-verification-20260924`
- PR: #51
- MERGE_SHA: pending until this PR is merged
- EVIDENCE_ARTIFACT: `artifacts/provider-verification/2026-09-24.json`
- LIVE_WORKFLOW_RUN: `35973353289`
- ARTIFACT_DIGEST: `sha256:39591fc70e0c091acf9bec5f4389a5be6367bb6381e13c9044d5d3c0b43b6f07`

### Contract verification result

| Provider | Result | HTTP | Schema |
|---|---|---:|---|
| Open Library | PASS | 200 | PASS |
| Internet Archive | PASS | 200 | PASS |
| Qatar Digital Library | BLOCKED_PROVIDER | 403 | not parsed |
| BnF Gallica | PASS | 200 | PASS |
| MP3Quran | PASS | 200 | PASS |
| AlAdhan | PASS | 200 | PASS |
| Dorar | PASS | 200 | PASS |
| Quran Foundation | BLOCKED_CREDENTIAL | — | — |
| Sunnah.com | BLOCKED_CREDENTIAL | — | — |
| GeoNames | BLOCKED_CREDENTIAL | — | — |
| YouTube Data API | BLOCKED_CREDENTIAL | — | — |
| TimeZoneDB | BLOCKED_CREDENTIAL | — | — |

Summary from the live evidence: 12 probes, 6 PASS, 0 FAIL, 1 BLOCKED_PROVIDER, 5 BLOCKED_CREDENTIAL.

QDL is not described as verified. The GitHub runner received HTTP 403 from the documented manifest URL, so the integration remains blocked for automated verification until a permitted access path or browser/runtime-specific route is proven.

Credential-gated providers are not described as verified. Their required environment variables are recorded by the verifier and missing credentials produce `BLOCKED_CREDENTIAL`, never a synthetic PASS.

### Implemented files

- `scripts/verify-provider-endpoints.ts`
- `.github/workflows/provider-verification.yml`
- `artifacts/provider-verification/2026-09-24.json`
- `package.json` command: `npm run verify:providers`

### Verification semantics

The verifier records a redacted request URL, HTTP status, latency, response content type, schema-validation result, timestamp, and credential requirement. Public endpoint failures are blocking. Known provider-side access blocking is recorded separately as `BLOCKED_PROVIDER`. Missing credentials are recorded as `BLOCKED_CREDENTIAL`.

### QA state

- Live public contract verification: PASS with the explicit QDL provider block above.
- Credentialed contract verification: BLOCKED_CREDENTIAL where listed.
- Browser/manual provider QA: not performed in this slice because the connected Windows device is offline.
- No rights/governance state was weakened to make a provider appear ready.
