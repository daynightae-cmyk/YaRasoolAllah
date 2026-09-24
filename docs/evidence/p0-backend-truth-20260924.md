# P0 backend truth / kids player / visual CI — 2026-09-24

Base: `origin/main` `66a51e44d3bd27e118dc779a3e3c5438e12a910a` (PR #61 merged).
PR #53 was left open and unused.

| ID | Status | Evidence |
|---|---|---|
| P0-01 Demo authentication | IMPLEMENTED BUT NOT VERIFIED | `demo-token` rejected. JWT HS256 issued on register/login. Tests in `server/auth.test.ts` and `server/security-http.test.ts`. Production deployment of the API is not proven by this document. |
| P0-02 Plain password handling | IMPLEMENTED BUT NOT VERIFIED | scrypt hashes only. Login uses timing-safe verify. Profile responses omit `password`. |
| P0-03 Memory persistence | PARTIAL | Postgres/`DATABASE_URL` is the production authority via `PgStorage` and `migrations/0001_identity.sql`. Memory remains only for local/test or explicit `ALLOW_EPHEMERAL_PERSISTENCE=1` smoke. No live migration run is recorded here. |
| P0-04 Fallback secret | IMPLEMENTED BUT NOT VERIFIED | Historical `ya-rasool-allah-secret-key` is forbidden. Production requires `JWT_SECRET` ≥ 32 characters. |
| P0-05 Demo Islamic APIs | IMPLEMENTED BUT NOT VERIFIED | Qur'an/Seerah/prayer/azkar/calendar/children demo routes return 410 `DEMO_ENDPOINT_REMOVED`. Governed client data paths are unchanged. |
| P0-06 Mock AI endpoint | IMPLEMENTED BUT NOT VERIFIED | `POST /api/ai/ask` is 410. No replacement RAG is claimed. |
| P0-07 Backend deployment path | PARTIAL | Shared `createApiApp()` is exported as Vercel `api/[...path].ts`. Live production `/api/health` is not proven in this slice. |
| P0-08 Kids approved catalog empty | BLOCKED | Acquisition still needs `YOUTUBE_DATA_API_KEY` and item-level review. Empty approved catalog remains an honest state. |
| P0-09 YouTube overlay | IMPLEMENTED BUT NOT VERIFIED | Curtain/poster/HUD/shine are not mounted over an active player viewport. Official iframe controls are enabled. |
| P0-10 Child auto-next | IMPLEMENTED BUT NOT VERIFIED | Ended/error paths no longer auto-advance. Next play requires an explicit choice. |
| P0-11 Visual verification name | PARTIAL | `visual-golden-verify.yml` now captures real headless screenshots. Pixel-diff against golden webps is still NOT IMPLEMENTED. |
| P0-14 Server log bodies | IMPLEMENTED BUT NOT VERIFIED | API logs are method/route/status/latency/requestId only. Error middleware does not rethrow after send. |

Do not read this table as global production acceptance.
