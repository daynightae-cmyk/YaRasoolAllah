# Acceptance evidence log — verified live on 94daf63 + evidence slice

Authority at recording time: `main` == `origin/main`. This file records
evidence actually observed. Anything not observed is marked NOT OBSERVED —
never upgraded to PASS.

## 1. Visual QA by wing (live DOM + text inspection, 1440/768/360)

- Home, Quran, Sunnah, Library, Sources, Seerah, Qibla, Calendar, Kids:
  render with content, no blank screens, zero console errors on sampled routes.
- Header at 1280: overflow defect FOUND and FIXED (densified xl bar,
  depth selector + search text deferred to 2xl, threshold documented in code).

## 2. Accessibility QA

- Skip link: present, focusable, moves focus to `#main-content` (live).
- Focus visible: `:focus-visible` outline in CSS (code).
- Dialogs/drawers: Radix defaults intact — no `onEscapeKeyDown` prevention,
  no `modal={false}` overrides found in repo (code). Escape closes, focus is
  trapped and returned by the library default.
- Labels: icon-only controls sampled carry `aria-label` (search, menu,
  Bab Al-Samaa FAB) (code + live).
- Touch targets: header buttons all >= 24px, primary controls 36–44px (live).
- Reduced motion: `prefers-reduced-motion` kill-switch in CSS (code).
- Map: `role="img"` + illustrative `aria-label` + textual phase list (code).
- Ax-tree thinness noted: app DOM exposes few implicit ARIA roles; native
  controls used throughout. NOT claimed as full screen-reader pass.

## 3. Performance QA (dev-mode numbers, not production claims)

- Navigation timing (home, dev server): domContentLoaded ~222ms, load ~230ms.
- Bundle warning unchanged: ~1.26MB JS — code-splitting remains an open
  optimization, recorded as gap, not fixed in this slice.

## 4. 200% reading zoom

- Measured via 640px-equivalent viewport: Quran page overflowX 0 after the
  header fix. Direct CSS-zoom probing is approximate and recorded as such.

## 5. Network / permission / media failures

- Geolocation denied: calendar prayer times show explicit pending/error copy
  (live). Qibla without location: pending bearing/distance (live).
- Audio with no bound media: playback blocked with rights strip (live).
- Adhkar corpus: explicit BLOCKED panel with reason (live).

## 6. Refresh, deep links, unknown routes

- `/home` redirects to `/` (live). Unknown route renders themed Arabic 404
  with Gate link (fixed this slice; was English dev text).
- Valid chapter deep link renders; unknown chapter id now shows an explicit
  fallback notice instead of silent substitution (fixed this slice).

## 7. Critical journeys exercised live

J1 home→Quran→unavailable verse state. J2 Ctrl+K→unified search→wing tab.
J3 search nonsense query→honest no-results. J4 library→record→provenance
drawer (unrecorded publisher path). J5 seerah→battles→illustrative map.
J6 qibla→pending without location. J7 calendar→live Hijri + pending prayer.
J8 kids→video (external embed labeled). J9 sunnah→grade+assessor evidence.
J10 sources→live 6/6/6 registry. J11 unknown route→Arabic 404. J12 unknown
chapter id→fallback notice. J13 /home→redirect.

## 8. Data/Editorial samples

- Book with full data: none fully complete in catalog (all 47 lack
  publisher/investigator) — the "unrecorded" path is the exercised norm.
- Missing-verse: Surah 2 ayah 100 → explicit unavailable (live).
- Hadith with grade+source: all 5 local records attributed (data).
- Hadith with missing fields: no deficient sample in the 5-record corpus.
- Approximate seerah date: timeline carries "؟" qualifiers (data).
- Atlas schematic: illustrative framing + label (live).
- Kids material: producer-labeled external embeds (live).
- Dhikr corpus: BLOCKED panel, not displayed as verified (live).
- Source without status: defaults to editorial_review_pending (code).
- Out-of-index query: honest no-results (live).

## 9. Language coverage (17/17/17/17 UI keys)

Chrome translates ar/en/fr/ur; direction follows language (live ar RTL, en
LTR). Religious content remains Arabic with local RTL containers. Full
content translation is NOT claimed — see rights blockers.

## 10. Visual mood references (10 approved)

Status: NOT OPENED. No Visual Match is claimed for any reference. Design
language was conserved from the existing implementation, not derived from
uninspected imagery.

## 11. What this log does not claim

Production deployment, full screen-reader pass, production performance
numbers, scholarly authentication, or rights clearance.
