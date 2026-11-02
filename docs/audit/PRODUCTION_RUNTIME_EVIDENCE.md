# Production Runtime Evidence — 2026-11-02

Measured with `curl.exe` from this host. Times UTC. Environment: `www.yarasoolallah.it.com` (apex redirects here).

## DNS / HTTP

| URL | Result |
|---|---|
| `https://yarasoolallah.it.com/` | `HTTP/1.1 308 Permanent Redirect` → `https://www.yarasoolallah.it.com/`; Vercel; HSTS `max-age=63072000` |
| `https://www.yarasoolallah.it.com/` | `HTTP/1.1 200 OK`; `Content-Type: text/html; charset=utf-8`; `X-Vercel-Cache: HIT`; `Last-Modified: Fri, 30 Oct 2026 23:13:14 GMT`; `Age: 179180` |
| `https://yarasoolallah.org/` | transport error — does not serve |

Production HTML references `/assets/index-dSGN6-CL.js` and `/assets/index-BYRmzwu6.css`. Local build at HEAD `655f5bc4` produces different asset hashes, so the deployed build is **not proven to match current `main`**.

## API probes (corrected after full probe set)

| Endpoint | Status | Body / meaning |
|---|---|---|
| `/api/content/quran/tafsir?surah=1&ayah=1` | **200** | Real QuranEnc Muyassar JSON with edition, attribution and rights URL |
| `/api/content/quran/translations?surah=1&language=en` | **200** | Real Saheeh International JSON with attribution/rights URL |
| `/api/content/hadith/status` | **200** | `localSampleCount: 4`, `fullCorpusAvailable: false`, truthful provider blockers |
| `/api/content/quran/translations?edition=en` | 400 | Expected validation: this route requires `surah` + `language` |
| `/api/content/quran/surahs` | 404 | Route does not exist in source and is not called by the client — not a defect |
| `/api/content/library/works?limit=1` | 404 | Route does not exist — not a defect |
| `/api/health` | **500** | `FUNCTION_INVOCATION_FAILED` |
| `/api/nonexistent` | **500** | `FUNCTION_INVOCATION_FAILED` instead of JSON 404 |
| `/api/auth/me` | 404 | Vercel platform page, not the main API JSON handler |

## Fail-safe update (local slice, not yet deployed)

After this slice, the main API entry (`api/[...path].ts`) no longer crashes at module load when `JWT_SECRET` / `DATABASE_URL` are absent. It now answers with a structured, secret-free `503` (`code: RUNTIME_CONFIG_MISSING`) and logs the startup reason for the operator. The public content app is unaffected. Production will still return `503` until the owner configures the environment; the improvement is that the failure is explicit and machine-readable instead of an opaque `FUNCTION_INVOCATION_FAILED`.

## Evidence-based architecture finding

There are two Vercel serverless apps:

1. **Public content app** — `api/public.ts` → `server/create-public-content-app.ts`. It registers Quran translations/tafsir, MP3Quran, OpenITI, Open Library and Hadith status. It does **not** call `assertRuntimeConfig()`, so it runs without database/JWT. This is why content APIs return real 200 responses.
2. **Main API app** — `api/[...path].ts` → `server/create-app.ts` → `assertRuntimeConfig()`. In production `server/env.ts` requires `JWT_SECRET` (≥32 chars) and `DATABASE_URL`; missing values throw at app creation. Every request to this app therefore fails with `FUNCTION_INVOCATION_FAILED`, including `/api/health` and the JSON 404 fallback.

## Classification

| Environment | Status |
|---|---|
| Local dev (`npm run dev`, port 3000) | VERIFIED (health 200, memory persistence, tests/smoke pass) |
| Local production build (`npm run build`) | VERIFIED (build PASS) |
| CI (GitHub Actions at `21416a4b` per prior report) | REPORTED SUCCESS 2026-10-26; not re-run from this host |
| Vercel public content API | **VERIFIED live** (Quran tafsir, translations, hadith status) |
| Vercel main API (auth/health/persistence) | **BLOCKED_OWNER / DEPLOYMENT_UNVERIFIED** — 500 due to missing production env |
| Deployed SHA | **UNKNOWN** — production asset hashes differ from local build |

## Required owner actions

1. Configure Vercel environment for the main API function: `JWT_SECRET` (≥32 random chars) and `DATABASE_URL` (Postgres), then redeploy.
2. Redeploy from current `main` (`21416a4b` + audit commit) and confirm asset hashes match the new build.
3. Re-probe `/api/health` (expect `200` with `persistence: "postgres"`) and an auth endpoint (expect `401`/validation JSON, not 500).
4. Re-probe public content routes after deploy (`/api/content/quran/tafsir`, `/api/content/quran/translations`, `/api/content/hadith/status`).
5. Verify DNS/TLS for apex → www and the production domain alias.
