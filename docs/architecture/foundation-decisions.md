# Foundation decisions

Status: accepted for the P0 foundation slice on 2026-09-23.

Baseline: `main` at `ca82fcfac9a5a1337b51d87c21a06a514d1b11dc`, matching `origin/main` at the start of the slice.

## Shell ownership

Pages that render `InstitutionShell` own their header, main landmark, footer, and mobile dock. `App.tsx` must not wrap those pages in `AppLayout`.

The learning-depth provider is application-scoped. This keeps page content and the shell selector in the same context rather than allowing a page to read the context before its local shell provider exists.

## Source integrity

Missing or unknown editorial status resolves to `editorial_review_pending`. It must never be presented as `verified` by default.

## Component path casing

The canonical path is `client/src/components/common/`. The former mixed `Common/` and `common/` index entries were consolidated so Linux and case-sensitive CI resolve the same files as Windows.

## Orphan pages

The four pages below had no route and duplicated or implied systems that are not active. They are archived outside `client/src` so they are not compiled as product code while remaining recoverable for reference:

- `AIAssistantPage.tsx`: superseded by the routed `AlMubeenBotPage` experience.
- `ChildrenPage.tsx`: overlaps the routed `/kids` and `/children-tv` surfaces.
- `LoginPage.tsx`: no connected authentication flow exists.
- `CalendarPage.tsx`: superseded by the routed `IslamicCalendarPage`.

Archived code is not a released feature and must not be counted in route or capability inventories.

## Atlas scope

The atlas is an independent knowledge wing with the canonical future route `/atlas`. The existing `MountainousBattlefieldMap` remains a Seerah sub-section until the independent route has an evidence-backed place/event model, uncertainty states, textual accessibility alternative, and reviewed source rights.

No handcrafted SVG point, modern map point, or generated coordinate may be promoted as historical geographic fact. Until the data contract is satisfied, navigation and search must not advertise `/atlas` as available.

## Quran and library capability truth

The Quran chapter list is navigation metadata; it is not evidence of a complete local verse corpus. Missing verse text resolves to an explicit unavailable state, never a status sentence inside the verse field. The current local records remain a development sample with editorial review pending.

The library is catalog-only in this slice. External URLs are labeled as external sources. The placeholder reader, simulated download manager, and simulated download service were archived outside active source code. In-app reading and downloading remain blocked until item-level file availability and rights evidence exist.

## Search shortcut

The active shell owns `Cmd/Ctrl+K` and opens its search dialog. Dialog components do not suppress browser shortcuts without changing visible application state.

## Global interruptions

The welcome dialog is a first-visit institutional orientation, not a daily marketing interruption. It contains no unsupported usage, authority, or certification claims.

`Bab Al-Samaa` is user-invoked from an accessible, non-pulsing control. The former random inactivity trigger is not mounted. Any future notification behavior requires an explicit preference, a deterministic reason, reduced-motion support, and a visible way to disable it.
