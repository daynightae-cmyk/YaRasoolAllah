# Third-party licenses — recorded 2026-09-23

## Cleared for current use

- **lucide-react** (pinned in `package.json`): ISC grant covering use, copy,
  modification and distribution; specified Feather-derived icons carry MIT
  terms. Source: `https://github.com/lucide-icons/lucide/blob/main/LICENSE`.

## Needs family-specific review before relying on it

- **react-icons** (present in manifest): aggregates multiple upstream icon
  families. The wrapper does not settle every upstream asset — review the
  exact family used before treating any icon as cleared.

## Font candidates (NOT cleared for bundling)

- Amiri Quran, Scheherazade New, Noto Nastaliq Urdu: preferred candidates
  only. Before bundling any font file: open the official repository, keep
  the LICENSE copy, record version/hash, verify glyph and diacritic
  coverage. No OFL stamp is granted by this document.

## Rule

A package being installable is not a license grant for redistributing its
assets. When in doubt, the conservative rights decision wins until
re-verified against the primary source with a recorded date.
