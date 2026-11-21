# Quran Sanctuary 3D — Browser Verification (2026-11-21)

Directive §4.D: «Create a peaceful luminous reading space … Add distinct
immersive reading and focused text modes.» Reference authority:
`YRA_REFERENCE_PACK/01_PRIMARY_UI/03_quran.png` +
`02_ENVIRONMENT_ART/07_quran.png` (50/50 manifest SHA-256 verified).

## What was built

- `client/src/visual-golden/services/interior-scenes.ts` — governed interior
  scene registry; `quran-sanctuary` with 4 observer stations (entrance, rehal,
  light-window, mihrab-corner), deterministic seed, Arabic artistic disclosure.
- `client/src/visual-golden/components/quran/Sanctuary3D.tsx` — genuine
  Three.js architecture on the bounded `ThreeRuntime`: extruded pointed
  arches, stone colonnade, mashrabiya lattice light window + volumetric shaft,
  mihrab niche, carved rehal + blank mushaf geometry, instanced book wall
  (220 bindings), brass lanterns, drifting dust motes, station beacons.
- `QuranPage.tsx` — explicit opt-in entry button; DOM reading overlay carries
  the governed Tanzil verse (never scene textures); full reading surface stays
  mounted (visually hidden) so recitation playback continues; lamp toggle
  drives real scene light levels; WebGL failure falls back to the plate page.

## Live evidence (in-app browser, PORT=5000)

Route: `/quran?door=0&ceremony=0&surah=1&ayah=1`

| Check | Result |
| --- | --- |
| Runtime state / tier | `running` / `balanced`, motion `full` |
| Entry opt-in | `quran-sanctuary-enter` present; scene lazy-loaded |
| Overlay canonical text | «بِسمِ اللَّهِ الرَّحمٰنِ الرَّحيمِ» — سورة الفاتحة · الآية 1 |
| Audio continuity | `[data-visual="quran-player"] audio` still mounted while scene open |
| Node travel | entrance → rehal (eased 1.5 s), `data-node` updated |
| Overlay next-ayah | verse → «الحَمدُ لِلَّهِ رَبِّ العٰلَمينَ», URL `ayah=2` |
| Drag-look | host `data-look` 0.00,-0.02 → -0.76,0.05 after pointer drag |
| Lamp toggle | `data-lamp` on → off → on; real PointLight/emissive levels |
| Escape exit | scene unmounted, `canvas` count 0, sheet visible, entry back |
| Console errors | none |

Note: synthetic `setPointerCapture` threw `NotFoundError` for injected
pointers and aborted drag-look; guarded with try/catch in **both**
`Sanctuary3D` and `TerrainTheatre3D` (real pointers unaffected).

## Headless CDP evidence (SwiftShader, `verify-quran-sanctuary.mjs`)

- `artifacts/quran-sanctuary/sanctuary-rehal-1440.png` — rehal station, lamp on.
- `artifacts/quran-sanctuary/sanctuary-lamp-off-1440.png` — lamp off state.
- `artifacts/quran-sanctuary/sanctuary-reduced-motion.png` — emulated
  `prefers-reduced-motion: reduce`: runtime `motion=reduced`, node jump
  rehal → mihrab-corner instant (<350 ms, no eased travel).
- `artifacts/quran-sanctuary/sanctuary-390.png` — 390×844 mobile: scene
  390×560, HUD wraps, overlay legible, disclosure visible.
- Console errors: none.

## Gates

- `tsc` PASS; production build PASS.
- `scripts/quran-sanctuary.test.ts` (new, 10 tests) + quran-player,
  quran-audio-failure-states, institution-shell-contract, world-plates,
  multilingual-closure, seerah-terrain, three-runtime-contract — all PASS.
