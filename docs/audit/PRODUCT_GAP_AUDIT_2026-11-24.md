# Product Gap Audit — 2026-11-24

Authority: `main` @ `eff3a6eb` (code) on `https://github.com/daynightae-cmyk/YaRasoolAllah.git`,
live production `https://yarasoolallah.it.com` → `https://www.yarasoolallah.it.com`.
Every number below was measured in this session unless the row says "declared".
Raw evidence: `artifacts/runtime-evidence/` (2026-11-24) and
`artifacts/visual-evidence/noor-20261124/`, `artifacts/visual-evidence/iiif-20261124/`.

This document supersedes the stale rows in `CURRENT_PRODUCT_REALITY.md` for the
capabilities it covers. Nothing here is a plan; it is the measured state plus
the exact gap and the exact owner action.

---

## 1. Verdict in one paragraph

The institution is a real, coherent, honestly-labelled product with a working
Quran/translation/tafsir/audio/governed-library spine and an honest empty state
everywhere content is not cleared. Two production-facing defects were found and
fixed in this session (a total public-content API outage caused by an ESM alias
inside the Vercel function, and a native-shell CORS chain that could never
pass a browser check). What still blocks the product from being *complete* is
not code: it is rights, editorial review, provider access, and two missing
production secrets.

---

## 2. What is live and proven right now

### 2.1 Live HTTP sweep (measured after the `eff3a6eb` deploy)

| Request | Status | Body / code |
|---|---|---|
| `GET /api/content/hadith/status` | 200 | `scope: local_development_samples`, 6 collections, 4 local samples, full corpus unavailable |
| `GET /api/content/quran/tafsir?surah=112` | 200 | real Muyassar tafsir rows |
| `GET /api/content/quran/translations?surah=1&language=en` | 200 | AlQuran Cloud EN |
| `GET /api/content/quran/translations?surah=1&language=fr` | 200 | AlQuran Cloud FR |
| `GET /api/content/quran/translations?surah=1&language=ur` | 200 | AlQuran Cloud UR |
| `GET /api/content/library/search?q=…` | 200 | Open Library metadata only |
| `GET /api/content/iiif/manifest?url=gallica…` | 502 | `provider_blocked` (upstream 403) |
| `GET /api/content/iiif/manifest?url=qdl…` | 502 | `provider_blocked` (upstream 403) |
| `GET /api/content/iiif/manifest?url=https://evil.example.com/…` | 400 | `provider_not_allowed` |
| `GET /api/nonexistent` | 503 | `RUNTIME_CONFIG_MISSING` (structured, not a 500) |
| `GET /`, `/noor`, `/library`, `/media-theater`, `/media-review`, `/manifest.webmanifest` | 200 | app shell + assets |

### 2.2 Native shells can now read governed content (fixed in this session)

| Origin | `GET /api/content/hadith/status` | `Access-Control-Allow-Origin` |
|---|---|---|
| `https://localhost` (Capacitor Android) | 200 | `https://localhost` |
| `http://localhost` | 200 | `http://localhost` |
| `capacitor://localhost` | 200 | `capacitor://localhost` |
| `yra://institution` (desktop) | 200 | `yra://institution` |
| `https://evil.example.com` | 200 | *(empty — not reflected)* |
| `OPTIONS` preflight (native origin) | 204 | origin + `GET, OPTIONS` |

Browser-level proof (not header inspection): the **deployed production bundle**
served from `http://localhost` requested
`https://www.yarasoolallah.it.com/api/content/hadith/status` → `200`, ACAO
`http://localhost`, zero network failures, zero console errors, and the live
corpus card rendered. Detail: `docs/evidence/NATIVE_SHELL_CORS_VERIFICATION_20261124.md`.

### 2.3 Measured content inventory

| Surface | Measured value | Where it comes from |
|---|---|---|
| Quran Arabic | 114 surahs / 6,236 verses, Tanzil `uthmani-min` 1.1, artifact SHA-256 `2F531F9B…FDAD6AC` | `client/src/data/quranCorpus.ts` |
| Quran translations | EN / FR / UR live through the governed proxy | `server/quran-translations.ts` |
| Quran tafsir | Muyassar live through the governed proxy | `server/quran-tafsir.ts` |
| Quran audio | 8 recitations in 5 categories, MP3Quran streaming | `client/src/data/quranAudio.ts` |
| Library works | 9,129 | `client/public/data/library-catalog.v1.json` |
| …with a digital record | 9,106 (all `TXT_MARKDOWN`) | `catalogCapabilityReport()` |
| …**readable in-app today** | **16** | same gate functions the reader uses |
| …catalog-text-only (not cleared for in-app reading) | 9,090 | same |
| …metadata-only | 23 | same |
| PDF / IIIF / presentation records | **0 / 0 / 0** | same |
| Downloadable today | 16 | same |
| Pipeline rows (never announced in the UI) | 10,695 editions / 13,679 digitalVersions | `catalog.counts` |
| IIIF reader sources | 2 curated external manifests (Gallica, QDL) | `client/src/visual-golden/services/iiif.ts` |
| IIIF manifests openable in production | **0** (both providers answer 403) | live sweep §2.1 |
| Kids approved YouTube catalog | **0** (`APPROVED_YOUTUBE_KIDS_VIDEOS` is empty) | `kids-youtube-approved.generated.ts` |
| Media discovery | 116 records: 0 approved, 116 pending | `media-discovery.generated.ts` |
| …media rights | 116 × `UNKNOWN`, 116 × `DRAFT`, 116 × embedding `UNTESTED` | same |
| …kids-scoped / non-kids (Noor) | 63 / 53 | measured |
| Seerah media acquisition | 53 records, all `DRAFT` + rights `UNKNOWN` | `data-sources/media/acquisition/seerah-media-catalog.json` |
| Seerah database | 10 eras, 101 events, 58 people, 32 places, 15 sources; 72 Quran refs, 51 hadith refs | `client/src/data/seerah/index.ts` |
| Seerah human review | **206 required, 0 signed, 206 pending** | `scripts/seerah-review-checklist.test.ts` |
| Hadith | 4 local samples, 6 bibliographic collections, 29,925 bibliographic count; full corpus absent | live status endpoint |
| Routes | 44 route paths + 6 redirects (`/media-theater` → `/noor`; `/media-review` stays editorial) | `client/src/App.tsx` |
| Visual-evidence harness | 101 cases defined; 7 captured in this session (5 Noor + 2 IIIF gallery), 0 failures | `scripts/capture-visual-evidence.mjs` |

### 2.4 Quality gates on `eff3a6eb`

| Gate | Result |
|---|---|
| `npm run check` (tsc) | PASS |
| `npm run lint` | PASS |
| `npm run test:p0` | PASS — 93 suites, 0 failures (exact count in §5) |
| `npm run build` | PASS (Vite client + esbuild server) |
| GitHub **Quality Gates** | success on `eff3a6eb` |
| GitHub **Visual Golden Verify** | success on `eff3a6eb` |
| Live deploy | production bundle serves the `eff3a6eb` client (verified by asset content, not by hash guessing) |

---

## 3. Gaps, ranked

### P0 — blocks real use, needs the owner

| # | Gap | Measured evidence | Exact owner action | Safe state today |
|---|---|---|---|---|
| P0-1 | Main API (auth, persistence, health) answers `503 RUNTIME_CONFIG_MISSING` | live `GET /api/nonexistent` → 503 | add `DATABASE_URL` (Postgres) and `JWT_SECRET` (≥32 random chars) to the Vercel production environment, then redeploy | public content API stays fully live; the app states the blocker instead of pretending |
| P0-2 | No publishable media anywhere: 116 discovered records, **0 approved**, all rights `UNKNOWN`; 53 Seerah media records all `DRAFT` | `media-discovery.generated.ts`, `seerah-media-catalog.json` | approve items individually (provider, embed terms, rights, age, depiction) or fund a review pass | Kids and Noor show truthful empty/pending states; no fabricated playback |
| P0-3 | The IIIF reader has **nothing it can open**: Gallica and QDL both answer 403 from the runtime | live 502 `provider_blocked` ×2 | provide provider access (API key / institutional agreement / a reachable public IIIF route) or authorise a different source | the reader fails honestly and links the original source |

### P1 — capability that exists but is thin

| # | Gap | Measured evidence | Exact owner action | Safe state today |
|---|---|---|---|---|
| P1-1 | Library reads only **16** works in-app although 9,106 carry a text record | `catalogCapabilityReport()` | approve promotion of catalog-text rows into the governed OpenITI version registry (rights + edition review) | 9,090 rows are labelled catalog-text-only, not "readable" |
| P1-2 | Seerah has 206 reviewable records and **0** signed by a human | `seerah-review-checklist.test.ts` | assign a qualified reviewer and sign the checklist | every record stays `pending_review`; auto-approval is disabled in code |
| P1-3 | Hadith is samples + bibliography only (no full corpus) | live status endpoint | lawful corpus source + credentials + rights | status card states the scope |
| P1-4 | Adhkar corpus is not a governed corpus | `client/src/data/azkarData.ts` | source + rights + review | daily route shows prayer times only |
| P1-5 | Credential-gated providers (Quran Foundation, Sunnah.com, GeoNames, YouTube Data API, TimeZoneDB) stay closed | `shared/knowledge-registry.ts` | supply credentials via secret env only | adapters remain closed, no scraping |
| P1-6 | Atlas geographic layer is missing (schematic only) | `/atlas` | licensed, sourced coordinates | the UI stays explicitly schematic/documentary |
| P1-7 | The brand apex redirects to `www` at the Vercel domain level | apex `308 → www` | optionally make the apex the primary domain | the client now addresses `www` directly so no request depends on the redirect |

### P2 — cleanup / residue

| # | Item | Size | Action |
|---|---|---|---|
| P2-1 | `dist-desktop/` | ~636 MiB (contains the built EXEs) | **not deleted** — owner approval required |
| P2-2 | `android/capacitor-cordova-android-plugins/build` | build residue | **not deleted** — owner approval required |
| P2-3 | `client/src/components/BabAlsamaa/BabAlsamaa.tsx:75` | one U+FFFD byte | provide a trustworthy source or a scholar-approved correction; the character is deliberately not guessed |
| P2-4 | `android/app/capacitor.build.gradle`, `android/capacitor.settings.gradle` | uncommitted local edits | preserved untouched; they are not mine |

---

## 4. What is explicitly NOT claimed

- No `RELEASED` / `100%` / `PASS` claim for anything not executed in this
  session. The gates in §2.4 are the only PASS statements.
- The desktop shell's `yra://institution` origin is verified at the HTTP
  header level only — a custom-scheme page cannot be loaded by headless Chrome,
  so no browser-level run was made for it.
- The deployed bundle was proven to contain the fix by **asset content**
  (`www.yarasoolallah.it.com` present, apex API URL absent), not by a claimed
  deployment SHA: the Vercel project under scope `knuux7-3141` is not
  reachable from this CLI.
- The independent sub-review of the IIIF security policy failed twice with
  provider 429s; the policy was reviewed manually (host allowlist, 8 MiB
  streaming cap, redirect re-validation, 12 s timeout, cache 80, rights hosts)
  and the manual findings are recorded here, not as an independent sign-off.
- The concurrent in-flight work in this working tree
  (`client/src/visual-golden/components/seerah/world/world-types.ts`,
  `docs/prompts/NVIDIA_VISUAL_FACTORY_20261124/`) belongs to another agent and
  was left untouched.

---

## 5. Reproducible commands

```bash
npm ci
npm run check
npm run lint
npm run test:p0
npm run build

# live sweep (writes artifacts/runtime-evidence/live-api-20261124/live-http-sweep.json)
node D:/Temp/opencode/live-sweep-final.mjs

# native-shell simulation against the deployed bundle
node D:/Temp/opencode/download-deployed-bundle.mjs
SIM_DIST=D:/Temp/opencode/deployed-bundle-20261124 node D:/Temp/opencode/native-shell-sim.mjs
```

---

## 6. Evidence index

| Artifact | What it proves |
|---|---|
| `artifacts/runtime-evidence/live-api-20261124/live-http-sweep.json` | live statuses, codes, ACAO matrix |
| `artifacts/runtime-evidence/native-shell-20261124/before-fix-apex-redirect-blocked.json` | the browser-level CORS failure caused by the CORS-less 308 |
| `artifacts/runtime-evidence/native-shell-20261124/native-shell-simulation.json` | native-shell read of governed content after the fix (local bundle) |
| `artifacts/runtime-evidence/native-shell-20261124/deployed-bundle-simulation.json` | the same read through the **deployed** bundle |
| `artifacts/runtime-evidence/native-shell-20261124/catalog-and-seerah-measurement.log` | catalog capability + Seerah counts |
| `artifacts/runtime-evidence/native-shell-20261124/quran-and-audio-measurement.log` | Quran corpus + recitation counts |
| `artifacts/runtime-evidence/native-shell-20261124/product-measurement-routes-media.log` | route list, media split, visual case inventory |
| `artifacts/visual-evidence/noor-20261124/` | 5 Noor captures (1672 / 1440 / 768 / 390 / 360) |
| `artifacts/visual-evidence/iiif-20261124/` | 2 manuscript-gallery captures (1440 dark RTL / 390 light LTR) |
| `docs/evidence/NATIVE_SHELL_CORS_VERIFICATION_20261124.md` | the full native-shell verification narrative |
| `docs/evidence/YRA_NOOR_EXECUTION_20261124.md` | Noor implementation evidence |
| `docs/evidence/NOOR_REFERENCE_CANDIDATE_20261124.md` | Noor reference provenance (candidate, not an approved baseline) |
