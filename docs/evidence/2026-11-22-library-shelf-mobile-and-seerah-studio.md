# Library: mobile shelf repair + Seerah studio route (2026-11-22)

Base commit: `8f04d807` (main, ahead 1 of `origin/main` at `167e95b2`).

## What this slice changes

### 1. The living shelf was broken on a phone. Now it is not.

Measured on the real runtime (`http://127.0.0.1:5000/library?ceremony=0&door=0`),
rendered inside a 390x844 frame so the media query was genuinely active:

| Before | After |
| --- | --- |
| `grid-template-columns: 117px 117px` | `grid-template-columns: 166.8px 166.8px` |
| stage `44px 240.8px 44px`: arrows ate **88px** of 372 | stage `341.6px`: arrows float over the row |
| book widths `117 117 117 117 **241**` | `167 167 167 167 167` (all equal) |
| row width 241px (65% of card) | row width 342px (**92%** of card) |

Two real root causes:

1. `.arrow` was a 34px grid column on each side of the row. On a 390px viewport
   that is 88px of permanent chrome around a 241px row.
2. `.row > li:last-child:nth-child(odd) { grid-column: span 2; }` stretched the
   fifth work to **241px** while its siblings were 117px, so the ledge read as
   four books and a billboard.

Fix: under 820px the stage collapses to one column and the arrows become 32px
translucent pucks absolutely positioned over the row's leading and trailing
edges (`inset-inline-start` / `inset-inline-end`, so RTL and LTR both stay
correct). The odd-last-child rule is `grid-column: auto` instead of `span 2`.

### 2. Study-tool reset separated from the opening sequence

`CatalogReadingChamber` used to clear `noteDraft`, `noteOpen` and
`citationCopied` inside the *opening animation* effect. That made the study
tools depend on cinematic timing and broke the contract asserted by
`scripts/library-study-tools.test.ts` ("study tools reset when a different work
opens"). They now reset in their own effect keyed on `work.id`, and the opening
effect only owns the cover animation. Both contracts hold at once.

### 3. Dead code retired, not accumulated

Four things listed as "outstanding" had **zero consumers** and were removed
instead of carried forward:

- `lib/institution/art-direction.ts`: created last session, imported by nothing,
  body contained injected junk tokens.
- `InteriorScene3D.onEngineReady`: no caller passed it.
- `InteriorHandle.invalidate()`: no caller used it.
- `interior-scenes.ts` `atlas-observatory` entry and the `"observatory"` kind:
  no page ever requested `getInteriorScene("atlas-observatory")`.

Verified with `Select-String` across `client/src` and `scripts` before removal.

### 4. Seerah Ghazawat: full-viewport studio route

The 3D terrain was rendered inside a ~479px reading column, where it read as a
corrupted postage stamp. `SeerahPage` now mounts `GhazawatEnvironment` with
`plateOnly` and a `studioHref`, and the real `TerrainTheatre3D` lives at
`/seerah/terrain?event=<id>` (`SeerahTerrainStudio`). The shell exposes a
`data-surface="cinema"` mode for that route so the studio owns the viewport
while theme, motion preference and a11y landmarks stay mounted.

## Evidence

`artifacts/seerah-ghazawat-webp/`: 35 captures, 9.11 MB total (WebP q82 of the
35 PNG originals, 91.9 MB). Originals archived outside the repo at
`D:\Temp\opencode\seerah-ghazawat-png-source-20261122`.

Browser runtime checks performed this session:

- `/library` at 1440px and 390px: shelf geometry measured with
  `getBoundingClientRect` (numbers in the table above). No horizontal overflow.
- `/library` cinematic open: DOM sampled every ~130ms across 2.6s.
  `data-opening="cover"` with overlay opacity 1 and `turning=0` until ~567ms,
  then `turning=1` through ~1283ms, then the overlay node was removed and
  `data-opening="open"` at **~1433ms**. The
  `[role="dialog"][aria-modal="true"]` label carried the real catalogue title
  `الطبقات الكبرى` for the whole sequence, and focus stayed inside the dialog.
  The cover is `aria-hidden` with `pointer-events:none`, so it never traps focus.
- `/quran` then the sanctuary gate: `data-scene="quran-sanctuary"` mounted,
  WebGL canvas **944x618** inside a 939x615 host, 4 station tabs, and
  `[data-interior-overlay]` present. A captured frame shows the arcade itself
  (columns, arches, hanging lantern, instanced book wall) with the al-Fatiha
  verse in the DOM overlay labelled Tanzil Uthmani. No scripture is rendered
  into geometry or a texture terminal.
- 12 routes return HTTP 200: `/`, `/library`, `/quran`, `/seerah`,
  `/seerah/terrain?event=badr`, `/atlas`, `/daily`, `/hadith`, `/sources`,
  `/audio`, `/kids`.

Note on canvas sampling: `gl.readPixels` immediately after `swapbuffers`
returns `(0,0,0,0)` here, as recorded in the previous session. That is a
buffer-lifetime artefact, not a blank scene, so the captured frame is the
evidence of record and the raw readPixels numbers are not.

## Gates

| Gate | Result |
| --- | --- |
| `npx tsc` | exit 0 |
| `npm run build` | exit 0: `built in 38.27s` |
| `npx tsx --test scripts/*.test.ts` | **540 / 540 pass**, 0 fail |
| `scripts/seerah-terrain.test.ts` | 9 / 9 |
| Visual evidence run (`VISUAL_CASES=living-shelf\|terrain-studio\|sanctuary-gate`) | 6 cases, 0 mount failures, 0 overflow, 0 runtime errors, 0 unnamed interactive, 0 lang/dir mismatch |

## Not verified

- Server-side `browser.screenshot` needs a visible desktop window and is
  unavailable in this environment. Every visual claim above rests on a CDP
  `Page.captureScreenshot` frame, a DOM geometry measurement, or a
  computed-style read. No claim rests on a screenshot that was not taken.
- The sanctuary was opened and structurally verified. Travelling every station
  and leaving through the exit chip was not exercised end to end this session.
- Artifacts were compressed with `ffmpeg -c:v libwebp`. Per-file sha256 values
  are not yet recorded in the manifest.
