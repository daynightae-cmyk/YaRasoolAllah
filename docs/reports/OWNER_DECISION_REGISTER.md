# Owner Decision Register — 2026-11-24

Refreshed after the `eff3a6eb` audit. Companion document:
`docs/audit/PRODUCT_GAP_AUDIT_2026-11-24.md`.

| # | Decision | Why it is blocked | Exact owner action | Safe default until then |
|---|---|---|---|---|
| OD-1 | Production `DATABASE_URL` + `JWT_SECRET` | The main Vercel API app answers `503 RUNTIME_CONFIG_MISSING`; auth, persistence and health are unavailable in production | Add `DATABASE_URL` (Postgres) and `JWT_SECRET` (≥32 random chars) to the Vercel production environment, then redeploy | Public content API stays live and governed; the app states the blocker instead of pretending |
| OD-2 | Production cutover proof | The Vercel project under scope `knuux7-3141` is not reachable from this CLI, so a deployment SHA cannot be read | (optional) Grant CLI access to the Vercel scope **or** accept the current proof: live 200s + deployed-bundle content check | Deployment is reported as "verified by behaviour and asset content", never as a claimed deployment SHA; no `RELEASED` claim |
| OD-3 | QuranEnc translations branch | `feat/quranenc-translations-internal-20260925` @ `3b26f3f1` is still deferred | Review the semantic diff, rights/attribution and whether the additive branch is still wanted | `DEFERRED_OWNER`; the EN/FR/UR translations that are already live are not replaced |
| OD-4 | Unique visual branches | `base44/setup-0a1b567e` (WingCorridor/sundial) and `codex/review-project-execution-document` (library availability) are still unmerged | Approve a semantic-diff review and, if still relevant, a scoped salvage PR | `PRESERVED_UNMERGED`; no cherry-pick |
| OD-5 | Kids approved catalog | Approved playable catalog is empty; 116 discovered records sit at rights `UNKNOWN` / `DRAFT` / embedding `UNTESTED` | Approve each item individually (provider, video ID, embed terms, rights, age, depiction policy), or fund a review pass | Kids keeps its truthful empty state; no auto-promotion, no fabricated playback |
| OD-6 | Hadith corpus | 4 local samples only; Sunnah.com/Dorar credentials, rights and editorial validation are absent | Provide lawful API access + an editorial validation plan | Keep the truthful sample status contract |
| OD-7 | `BabAlsamaa.tsx:75` U+FFFD | The corrupted character cannot be guessed | Provide a trustworthy source record or a scholar-approved correction | Leave the encoded replacement and the documented blocker |
| OD-8 | Atlas geography | No sourced coordinates or licensed GIS layer | Provide licensed coordinates/source licences | Keep the schematic/documentary framing; no inferred routes |
| OD-9 | Adhkar corpus | Rights and editorial review absent | Approve sources and the review method | Keep the honest empty state |
| OD-10 | Credential providers | Quran Foundation, Sunnah.com, GeoNames, YouTube Data API, TimeZoneDB | Provide credentials via secure env only | Adapters remain closed; no scraping |
| OD-11 | IIIF provider access (new) | Gallica and QDL both answer HTTP 403 from the runtime, so the merged IIIF reader has 0 openable manifests in production | Provide provider access (API key, institutional agreement, or another reachable public IIIF route) and confirm the reuse terms | The reader fails honestly with `provider_blocked` and links the original source; no cached or fabricated manifest |
| OD-12 | Library reading clearance (new) | Only 16 of 9,106 digital text records are cleared for in-app reading; 9,090 are catalog-text-only | Approve promotion of catalog-text rows into the governed OpenITI version registry (rights + edition review), or accept the current 16-work scope | The Library announces only what the gate functions allow; pipeline row counts are never shown as readable |
| OD-13 | Seerah human review (new) | 206 records require human/scholarly review and **0** are signed | Assign a qualified reviewer and sign the review checklist | Every record stays `pending_review`; auto-approval is disabled in code |
| OD-14 | Canonical domain (new) | The brand apex answers `308` to `www` at the Vercel domain level | Optionally make the apex the primary domain | The client addresses `www` directly, so no product request depends on the redirect |
| OD-15 | Build residue deletion (new) | `dist-desktop/` (~636 MiB, contains the built EXEs) and `android/capacitor-cordova-android-plugins/build` | Explicitly approve deletion of each path after confirming the EXEs are not the only copy | Both were **kept**; nothing was deleted |

## Owner authorization needed for destructive actions

None were performed in this session. Any future branch/worktree/stash pruning,
history rewrite, force push, production database migration, or mass deletion
requires a separate inventory + backup + impact report and explicit owner
approval.

Unrelated local work that was deliberately preserved untouched:
`android/app/capacitor.build.gradle`, `android/capacitor.settings.gradle`, and
the concurrent agent work in
`client/src/visual-golden/components/seerah/world/world-types.ts` +
`docs/prompts/NVIDIA_VISUAL_FACTORY_20261124/`.
