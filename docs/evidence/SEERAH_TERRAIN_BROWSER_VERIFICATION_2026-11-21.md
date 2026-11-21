# Seerah terrain theatre — browser verification evidence (2026-11-21)

Slice commits: `9ce37059` (five plateless Ghazawat terrains), `2866d245`
(chapter observer environments). Server: `npm run dev` with `PORT=5000`
(port 3000 occupied by an unrelated local app). Browser: in-app Chromium
via OpenCode desktop, tab on `http://localhost:5000`.

## Verified live (DOM/WebGL state read from the running page)

### Hira chapter terrain (`/seerah?chapter=prophethood-beginning`)
- `[data-visual="seerah-chapter-terrain-enter"]` present on the chapter
  environment; click mounts `[data-visual="seerah-terrain-theatre"]` with
  `data-terrain="first-revelation"`, `data-node="hira-approach"`,
  `data-terrain-mode="3d"`, and a real WebGL `<canvas>` inside
  `[data-visual="seerah-terrain-canvas"]`.
- Node-rail click on «داخل الغار» travelled to `data-node="hira-cave"`;
  station note updated to «داخل الغار (إعادة بناء فنية)» via `aria-live`.
- Exit button unmounted the theatre, restored `data-terrain-mode="plate"`
  and the opt-in entry; canvas count dropped (renderer disposed).
- Console errors: **0** across the whole session.

### Uhud battle terrain (`/seerah?chapter=battles-conquests&event=uhud`)
- Plate mode is the default (`data-terrain-mode="plate"`, plate `<img>`
  present); `[data-visual="seerah-terrain-enter"]` offered the opt-in.
- Click mounted `data-terrain="uhud"`, `data-node="plain-view"`, runtime
  diagnostics `state=running motion=full tier=balanced inView=true
  canRender=true`.
- Exit restored plate mode; final canvas count on page: **0**.

### Reduced-motion path (persisted `motion="reduced"` in
`yra-visual-golden-v1`, page reloaded)
- Runtime diagnostics showed `motion=reduced`.
- Node-rail click jumped **instantly** to `data-node="pass-lookout"` with
  note «مطل الممر» and correct `aria-selected` — no eased travel, no
  dependence on continuous frames.
- Preference restored to `system` after the test.

## Environmental limitation (honest record)

The OpenCode desktop Review pane throttles `requestAnimationFrame` to zero
when its window is not visibly rendered (measured: 0 ticks over 2 s while
`document.visibilityState === "visible"`). Consequences:

- Full-motion **eased** node travel could not be observed to completion in
  this environment; the travel state machine, scheduling, visibility
  gating and cleanup are covered by `scripts/three-runtime-contract.test.ts`
  and the reduced-motion instant-jump path was verified live.
- Screenshots of the WebGL surface require the desktop window to be
  visible; none were captured in this run. No visual claim is made beyond
  the DOM/WebGL state evidence above.

## Static gates (same session)

- `npm run check` (tsc): PASS
- `npm run build`: PASS (client built ~14.5 s)
- `npx tsx --test` targeted suites: 68/68 PASS, including
  `scripts/seerah-terrain.test.ts` (registry purity, per-chapter coverage,
  engine contract, both lazy mounts) and the pre-existing world-plates,
  three-runtime, atlas, database and review-checklist suites.
- Earlier full targeted run after the battle slice: 107/107 PASS.
