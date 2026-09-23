# Static vs database governance — verified 2026-09-23

Status: accepted. This document states what is schema, what is migrated,
and what is actually live, so no DB-backed claim is made without a path.

## Live today

- **Source/rights governance is a static TypeScript registry.**
  `shared/source-governance.ts` (schemas + `evaluateResourceUsage`),
  `shared/source-registry.ts` (6 sources, 6 rights records, 6 provider
  resources), validated by `npm run validate:sources`. The `/sources`
  page and all drawers read these records directly. There is no database
  behind them.
- **Server persistence is in-memory only.** `server/storage.ts` implements
  `IStorage` as `MemStorage` (plain `Map`s for users, progress, bookmarks,
  prayer settings). Data does not survive restarts and is demo-grade.
- **Drizzle (`drizzle.config.ts`, `shared/schema.ts`) is schema preparation
  only.** The table definitions and insert schemas are used for runtime
  validation shapes (e.g. `insertUserSchema` in `server/routes.ts`). No
  migration has been run, no database URL is configured, and no query
  touches a real database.

## Explicitly NOT claimed

- No "DB-backed governance".
- No migrated tables.
- No persistent user accounts, progress sync, or server prayer settings.
  Client features that persist (bookmarks, reading position, preferences)
  are `localStorage`-only and are labeled as such in the UI.

## What would change this document

Running a real migration (`npm run db:push` against a configured database),
switching `server/storage.ts` to a database backend, and re-verifying the
governance validator against the migrated store. Until then, this file is
the authority and any contrary claim in UI copy is a bug.
