# Sources Treasury 3D — Browser Verification (2026-11-21)

Directive §4.J: rich immersive source archive with drawers, document desk,
manuscript inspection and genuine record details. Reference authority:
`YRA_REFERENCE_PACK/02_ENVIRONMENT_ART/02_sources.png` (card-catalog cabinets
with brass plates/ring pulls, open document drawers, inspection desk with
scroll + wax seal + brass stamp + magnifier, glowing glass verification
shield on marble pedestal) — 50/50 manifest SHA-256 verified.

Wing route: `/sources` (خزانة المصادر والتحقيق) — the governed source/rights
registry, not the Basirah research desk (which keeps its own surface).

## What was built

- `interior-scenes.ts`: `sources-treasury` scene (kind `treasury`, seed 1403,
  no mihrab) with 4 stations: entrance, catalog-wall, document-desk,
  verification-shield. Station notes carry the wing's honesty contract:
  drawer clicks filter real records, no invented counts, no invented
  approval bodies or review counts, software validation ≠ scholarly approval.
- `components/sources/SourcesTreasury3D.tsx`: furnishing over the shared
  InteriorScene3D shell — full-depth card-catalog cabinet wall (56 instanced
  drawers + brass label plates + ring pulls, two drawers open with blank
  ivory documents), inspection desk (blank unrolled manuscript + end rolls,
  wax seal + tassel, brass stamp, magnifier, inkwell + quill, stacked
  bindings), rolled-document side bench, extruded heraldic verification
  shield (glass slab + gold shield + check + laurel arcs) on an emerald
  marble pedestal, brass armillary. No document text in any texture.
  Wing reading lights (catalog face + fill, desk, shield corner) are real
  bounded PointLights driven by the lamp preference; shield glow breathes
  under full motion only.
- `SourcesPage.tsx`: opt-in entry `sources-treasury-enter`; DOM record card
  `sources-treasury-record` reads the SAME governed registry state — drawer
  chips set the real `kindFilter` (measured counts from `sourceRegistry`),
  record rail opens the real `openDrawer(sourceId)` (URL deep link), rights
  line comes from the governed `rightsLedger` with the truthful
  "no rights decision — stays closed" fallback, «فحص السجل الكامل» hands off
  to the full governed inspection drawer and exits the scene. Full registry
  stays mounted (visually hidden) for state continuity; the inspection
  drawer never stacks over the 3D scene; Escape ownership is unambiguous
  (scene exit while open, drawer close otherwise).

## Live headless CDP evidence (SwiftShader, `verify-sources-treasury.mjs`)

Route: `/sources?door=0&ceremony=0`

| Check | Result |
| --- | --- |
| Runtime | `running` / `balanced` |
| Node travel | entrance → document-desk → catalog-wall → verification-shield (arrival polled, `data-node` verified) |
| Drawer filter | «نص أصلي (4)» click → record card switched from development sample to `Tanzil Uthmani Quran Text 1.1 — acquisition candidate`, `aria-selected=true` |
| Lamp | on → off (`data-lamp=off`, shield glow + reading lights dim) → on |
| Reduced motion | emulated reduce → `motion=reduced`, instant chip jump to entrance, rail enabled |
| Inspection handoff | «فحص السجل الكامل» → scene unmounted, governed `source-drawer` open, URL `?source=src-tanzil-uthmani-1-1-candidate` |
| Escape exit | scene gone, canvas count 0, entry back, `source-cabinets` visible |
| Mobile 390×844 | scene 374×660; drawer rail scrolls (max-height + slim brass scrollbar), record card legible |
| Console errors | none |

Captures in `artifacts/sources-treasury/`: desk, catalog-wall, shield,
lamp-off, reduced-motion, 390px.

Lighting iterations verified by capture: the tall cabinet initially read as
a black slab from its own station (shared key light is mid-room) — fixed
with lamp-driven catalog reading lights + full-depth drawer grid (8×7) and
a station eye position facing the drawers; desk got its own reading light;
shield station moved back so the pedestal + glass + laurel frame the view.

## Gates

- `tsc` PASS; production build PASS (15.9s).
- 108/108 tests across sources-treasury (new), hadith-archive,
  quran-sanctuary, three-runtime-contract, institution-shell-contract,
  hadith-cross-links, seerah-terrain, atlas-terrain, quran-player,
  multilingual-closure.
- 29/29 source-governance contracts preserved: sources-inspection,
  core-wings-source-truth, external-resource-registry.