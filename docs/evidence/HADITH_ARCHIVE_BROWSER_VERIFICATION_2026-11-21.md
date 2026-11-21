# Hadith Archive 3D — Browser Verification (2026-11-21)

Directive §4.F: immersive study environment for the Hadith wing. Reference
authority: `YRA_REFERENCE_PACK/02_ENVIRONMENT_ART/08_hadith.png` (scholar's
study: binding walls, brass lanterns, carved desk, open rehal, quill/inkwell,
magnifier, scroll, tufted chair) — 50/50 manifest SHA-256 verified.

## What was built

- `interior-scenes.ts`: `hadith-archive` scene (kind `archive`, seed 1402,
  no mihrab — a study, not a prayer hall) with 4 stations: entrance,
  study-desk, collection-wall, verification-corner. Station notes carry the
  wing's honesty contract (bibliographic counts ≠ local corpus; no invented
  isnad or grading; development-sample labeling).
- `components/hadith/HadithArchive3D.tsx`: furnishing over the shared
  InteriorScene3D shell — scholar's desk with blank-page rehal, quill +
  inkwell, magnifier (brass ring + glass), rolled scroll + wax seal, tufted
  chair with gold studs, full-height instanced binding walls on both sides
  (720 bindings), scroll side-table, slowly rotating armillary (full motion
  only). No hadith text in any texture.
- `HadithPage.tsx`: opt-in entry `hadith-archive-enter`; DOM record card
  `hadith-archive-record` reads the SAME governed record state (matn, book/
  chapter/narrator, grade + source, «عينة تطوير — قيد المراجعة التحريرية»
  badge), record rail switches `activeId` (URL sync verified), bookmark/copy/
  lamp/dorar verification link inside the scene; full archive stays mounted
  (visually hidden) for state continuity.

## Engine fixes discovered by this verification (shared, benefit all wings)

1. **Frozen motion snapshot (real bug):** `ThreeRuntimeContext.motion` was a
   plain value captured at build; `runtime.setMotion` never reached adapter
   closures, so reduced-motion branches in travel/lamp decisions never fired
   after a preference flip (also latent in TerrainTheatre3D). Fixed with a
   live getter in `three-runtime.ts`.
2. **Stale travel state:** shell chips could stay disabled from a full-motion
   travel when motion flipped mid-travel. Shell now keeps an authoritative
   motion ref, forces discrete jumps, and only the engine's arrival callback
   publishes `data-node` (no optimistic claims).
3. **Discrete-frame completeness:** reduced-motion `goTo` publishes arrival
   synchronously; `setMotion(reduced)` snaps lamp/playback levels and clears
   travel state.
4. **Lighting:** warm bounce fill light added so walls facing the entrance
   never fall to pure black (collection wall was unreadably dark).
5. **Mobile:** scene height 82vh (660px at 390×844), overlay 40% with slim
   brass scrollbar — full matn + grade readable without clipping.

## Live evidence (in-app browser, PORT=5000)

Route: `/hadith?door=0&ceremony=0`

| Check | Result |
| --- | --- |
| Runtime | `running` / `balanced`, motion `full` |
| Record card | صحيح البخاري · حديث 1, «إنما الأعمال بالنيات…», sample badge present |
| Record switch | overlay rail → حديث 13, URL `sample=bukhari-13&collection=bukhari` |
| Node travel | entrance → study-desk (eased), `data-node` updated |
| Drag-look | `data-look` 1.38,0.13 → 2.09,0.65 |
| Lamp | on → off → on via overlay button (`data-lamp`) |
| Scope panel | `hadith-corpus-scope` stays mounted while scene open |
| Console errors | none |

## Headless CDP evidence (SwiftShader, `verify-hadith-archive.mjs`)

- `artifacts/hadith-archive/archive-desk-1440.png` — study desk station.
- `archive-collection-wall-1440.png` — binding wall station (bounce light).
- `archive-lamp-off-1440.png` — lamp off.
- `archive-reduced-motion.png` — emulated reduce: `motion=reduced`, instant
  jump collection-wall → verification-corner via chip click, rail enabled.
- Escape exit: scene unmounted, canvas count 0, entry back, scope visible.
- `archive-390.png` — 390×844: scene 390×660, full record card readable.
- Console errors: none.
- Quran sanctuary re-verified after shared-engine changes: reduced jump
  rehal → mihrab-corner instant; zero errors.

## Gates

- `tsc` PASS; production build PASS (15.3s).
- 103/103 tests across hadith-archive (new), quran-sanctuary,
  three-runtime-contract, seerah-terrain, atlas-terrain, hadith-cross-links,
  quran-player, quran-audio-failure-states, institution-shell-contract,
  multilingual-closure.