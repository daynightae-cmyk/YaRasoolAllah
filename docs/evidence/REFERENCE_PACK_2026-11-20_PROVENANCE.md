# حزمة المراجع المعتمدة — 2026-11-20
# Authoritative reference pack — 2026-11-20

**الحالة: شهادة أصل (provenance) محققة — لا شهادة بصرية (visual QA) في هذا الجلس.**
**Status: provenance verified — visual QA NOT performed in this session.**

## 1. المصدر المعتمد
**The authoritative package**

- Location (verified): `K:\Knoux Projects\YaRasoolAllah\YRA_ULTIMATE_MULTIPLATFORM_PACK\YRA_REFERENCE_PACK`
- The literal path given in the directive, `K:\Knoux Projects\YaRasoolAllah\YRA_REFERENCE_PACK`, does not exist.
  The pack is nested one level deeper, under `YRA_ULTIMATE_MULTIPLATFORM_PACK\`.
- Override for tooling: `YRA_REFERENCE_PACK` environment variable.
- Entry point: `START_HERE.md`; integrity authority: `manifest.json`.

## 2. التحقق من أصالة الملفات
## Source verification

`npm run verify:reference-pack` (i.e. `node scripts/verify-reference-pack.mjs`):

- `01_PRIMARY_UI` — 10/10 sources hash-verified.
- `02_ENVIRONMENT_ART` — 10/10 sources hash-verified.
- `03_IMMERSIVE_SEERAH` — 10/10 sources hash-verified.
- `04_ALTERNATIVE_REFERENCES` — 20/20 sources hash-verified.
- Total: **50/50 manifest entries match their recorded SHA-256**.
- Production plates `client/public/visual-golden/art/worlds/manifest.json`:
  **20/20 verified** — 10 wing plates from `02_ENVIRONMENT_ART`, 10 Seerah plates from
  `03_IMMERSIVE_SEERAH`; each plate's recorded source hash and output `.webp` hash match.

## 3. ما لا يُستخدم كتوسيلة بصرية في الـruntime
## What deliberately is not shipped as runtime imagery

- `01_PRIMARY_UI` is the composition authority (layout, hierarchy, typography, artwork
  placement, navigation). It is a screen-reference set, not a texture pack.
- `04_ALTERNATIVE_REFERENCES` is comparative/creative extension material.
- Per the mission contract, a full UI screenshot is not embedded as the UI, and
  reference originals stay outside the runtime bundle where practical. Production
  surfaces are reconstructed in React/CSS/3D with real data.
- `Base/attached_assets` (June 2025) is obsolete historical reference material and
  must never be substituted for the pack.

## 4. السجل التاريخي المعروف
## Known historical record (not the current authority)

- `docs/evidence/visual-reference-matrix-2026-09-23.md` records a style extraction
  from an earlier 10-reference URL set (Feb 2026 poster URLs).
- `docs/visual-transformation/00-shared-visual-engineering-contract.md` §5 still
  lists those URLs. The extraction *method* there remains useful; the URL list is
  historical and is not the current visual authority. This pack supersedes it.
- No image from this ledger is redistributed as production media.

## 5. حد الشهادة
## Evidence boundary

- Hash verification proves byte identity, not visual fit. This session could not
  open the images (no image input available to the model), so no screenshot
  comparison, visual QA, or "matches the reference" claim is made here.
- `npm run check` (tsc) and `npm run build` pass; targeted contract tests pass
  (see `scripts/world-plates.test.ts`, `scripts/institution-shell-contract.test.ts`,
  `scripts/three-runtime-contract.test.ts`, `scripts/pwa-shell.test.ts` — 41/41).
- Regenerating plates is `npm run build:worlds` and requires `ffmpeg` (libwebp).
  It is re-runnable and idempotent; it re-hashes sources itself.
- The non-plate WebP/SVG fallback art referenced by the scene components is
  tracked and served, but this session did not audit the individual provenance of
  those files; only the plate pipeline output is hash-covered by its manifest.

## 6. التنفيذ في هذا الجلس
## Implementation in this session

- Added `scripts/verify-reference-pack.mjs` + `npm run verify:reference-pack`
  (50/50 sources, 20/20 plates).
- Removed the unused `@assets` Vite alias that pointed at obsolete
  `Base/attached_assets` artwork, eliminating a latent path back into the 2025 designs.
- Corrected the fallback art registry's stale "prototype data" label; no asset path,
  route, data contract or runtime behavior was changed.
- Recorded this provenance ledger and a supersession note in
  `docs/visual-transformation/00-shared-visual-engineering-contract.md` §5.
