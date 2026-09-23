# Local development notes

- Start the editable preview with `docker compose -f docker-compose.base44.yml up -d --build`; it serves the Express API and Vite middleware together on port 3000 from the bind-mounted source. The server runs under `tsx watch` for backend edits.
- The running application currently uses `MemStorage` (`server/storage.ts`), not PostgreSQL. `drizzle.config.ts` requires `DATABASE_URL` only when running the separate `db:push` script; no database, migrations, external credentials, or seeds are needed to render the preview. User records are lost on service restart.
- Verify locally with `curl http://localhost:3000/`, `curl http://localhost:3000/src/main.tsx` (live Vite module), and `curl http://localhost:3000/api/quran/surahs`.
- Authentication and AI answers in `server/routes.ts` are demo implementations, not production integrations. Do not claim the AI endpoint uses a real external provider.
