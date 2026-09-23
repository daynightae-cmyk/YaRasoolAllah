# Ya Rasool Allah ﷺ — Final Post-PR21 Closure Evidence

**Evidence date:** 2026-09-23  
**Project:** Ya Rasool Allah ﷺ  
**Repository:** [daynightae-cmyk/YaRasoolAllah](https://github.com/daynightae-cmyk/YaRasoolAllah)

## Authority and Git delivery

The live authority was recovered from `origin/main`; the handoff SHA `93e76860c6ee49782f03160ba01f510fb0eae1ed` was still the starting main authority. The current final authority is `32a0138b7390b6590b76651a03abdae19bb583b2`, and local `HEAD` equals `origin/main` after the final synchronization.

| Item | Result |
|---|---|
| Starting main SHA | `93e76860c6ee49782f03160ba01f510fb0eae1ed` |
| Final main SHA | `32a0138b7390b6590b76651a03abdae19bb583b2` |
| HEAD | `32a0138b7390b6590b76651a03abdae19bb583b2` |
| origin/main | `32a0138b7390b6590b76651a03abdae19bb583b2` |
| HEAD == origin/main | `true` |
| Tracked worktree status | clean |
| Untracked local tooling | `.codex/` only; intentionally not committed |
| PR #21 | merged before this mission |
| PR #22 | merged; visual capture route-race fix |
| PR #23 | merged; this evidence package |

The post-PR21 `books.json` import failure was **stale local runtime state / not reproducible on current main**. The active tree contains no `books.json` import or deleted governed book dataset reference. The only remaining legacy-name matches are historical documentation, quarantined/unreferenced audio draft data, and the active `SeerahForChildrenPage` route component; none reintroduces the deleted fake catalog or orphaned children-video subsystem.

## Validation gates

All gates below were run from final merged `main`.

| Gate | Command | Result |
|---|---|---|
| Formatting / whitespace | `git diff --check` | PASS, exit 0 |
| TypeScript | `npm run check` | PASS, exit 0 |
| Source governance | `npm run validate:sources` | PASS, exit 0 |
| Production build | `npm run build` | PASS, exit 0 |
| Production start | `PORT=3001 npm start` | PASS; server reported port 3001 |
| Fresh development runtime | `PORT=3002 npm run dev` | PASS |
| Final visual capture | `VISUAL_BASE_URL=http://127.0.0.1:3002 npm run capture:visual` | PASS |

The source validator reported **15 sources, 7 rights records, 7 provider resources, 17 works, 33 digital versions, 18 provider policies, 5 children adaptations, 4 review-pending hadith samples, and 0 cleared media assets**.

## Runtime verification

The fresh current-main runtime returned HTTP 200 and an application shell for `/`, `/home`, `/library`, `/digital-library`, `/quran`, `/seerah`, `/kids`, `/children-tv`, `/sunnah`, `/sources`, `/daily`, and `/ai-assistant`. The built production start path was separately verified on port 3001 for representative deep links including `/`, `/library`, `/quran`, `/seerah`, `/sources`, `/daily`, and `/ai-assistant`; each returned HTTP 200 with the root mount.

The previous visual harness had a real evidence-quality defect: it waited for `document.readyState` but not for the requested SPA pathname, allowing one desktop Quran capture to record `/daily`. PR #22 changed the wait condition to require the requested pathname, retaining the existing `/home` to `/` redirect exception. The corrected rerun captured the intended Quran route and passed all automated conditions.

## Visual acceptance

The final matrix captured **17 cases** across 360, 768, and 1440 viewport widths; light and dark themes; Arabic, English, Urdu, and French UI settings; and RTL/LTR directions.

| Condition | Result |
|---|---:|
| Application mount failures | 0 |
| Horizontal overflow failures | 0 |
| Runtime error cases | 0 |
| Visible unnamed interactive cases | 0 |
| Captured cases | 17 |

Actual screenshots were opened and inspected for the Gate, Library, Quran, Seerah, Atlas, Children, Sources, and Daily wings. The Gate reads as an architectural entrance; Library as a governed catalog; Quran as a calm reading experience; Seerah as a narrative journey; Atlas as an explicitly interpretive documentary map; Children as warm learning rather than a video dashboard; Sources as a provenance vault; and Daily as restrained and contemplative. No engineering-fixable visual defect was found in the final matrix. The final screenshots and machine-readable report are in `artifacts/visual-evidence/`.

The accessibility checks embedded in the visual harness found no visible unnamed interactive controls. The previously recorded engineering checks remain applicable: skip link, visible focus, Radix dialog Escape/focus behavior, icon labels, reduced-motion handling, touch-target sizing, Atlas textual alternative, and semantic map labeling. A full screen-reader certification remains **NEEDS EXECUTION ENVIRONMENT** rather than being claimed from the available harness.

## Product and governance state

The governed registries remain intact: 17 bibliographic works, 33 separately registered OpenITI versions, 18 provider policies, 15 sources, 7 rights records, 7 provider resources, and 5 source-linked children adaptations. Library states distinguish catalog-only, external-link-only, full text, download, and rights state; no fake download, fake reader, or metadata-only downloadable-book claim was introduced.

OpenITI versions remain version- and rights-specific. No transcription was promoted to a critical scholarly edition. Hadith samples remain development samples with editorial review pending; Sunnah.com remains credential-gated and was not scraped; Dorar remains an external editorial reference. The Arabic Quran corpus remains the governed Tanzil-derived corpus; translations and tafsir remain separate resources with pending/unavailable states where clearance is absent. Audio remains external-link or unavailable unless rights are confirmed; no audio bundle was introduced.

## Media and manuscript acquisition pass

A first item-level acquisition pass was performed without shipping an uncleared file. The following concrete candidates were checked against primary institutional or item pages:

| Candidate | Evidence | Outcome |
|---|---|---|
| Library of Congress, *The story of a pilgrimage of Hijaz*, LCCN `44036212` | [LOC item page](https://www.loc.gov/item/44036212); [IIIF manifest](https://www.loc.gov/item/44036212/manifest.json) | The item page states that LOC is unaware of copyright or other restrictions in the World Digital Library Collection and that, absent restrictions, materials are free to use and reuse. **NEEDS ITEM-LEVEL RIGHTS REVIEW** before shipping a derivative or production asset, including review of the attached source information and intended use. |
| Wikimedia Commons, *Qur'anic Manuscript - 3 - Hijazi script.jpg*, David Collection accession `86/2003` | [Commons file page](https://commons.wikimedia.org/wiki/File:Qur%27anic_Manuscript_-_3_-_Hijazi_script.jpg); [oldid 920612443](https://commons.wikimedia.org/w/index.php?title=File:Qur%27anic_Manuscript_-_3_-_Hijazi_script.jpg&oldid=920612443) | The file page identifies a faithful photographic reproduction of a two-dimensional public-domain work and links the applicable public-domain statements. **NEEDS ITEM-LEVEL RIGHTS REVIEW** for jurisdictional and attribution handling before product shipment. |
| NYPL public-domain collection policy | [NYPL reuse policy](https://www.nypl.org/research/resources/public-domain-collections) | The collection policy says qualifying public-domain items may be reused without permission or restrictions, but no specific asset was selected and registered during this pass. **NEEDS ITEM-LEVEL RIGHTS REVIEW** for any chosen item. |

Accordingly, **cleared media asset count remains 0** and no media file was added. This is an honest rights outcome, not an omitted research step. No depiction of Prophet Muhammad ﷺ, fabricated historical scene, random AI historical evidence, watermarked stock, or modern image presented as historical proof was introduced.

## Precise remaining classifications

| Area | Classification |
|---|---|
| Full screen-reader certification | NEEDS EXECUTION ENVIRONMENT |
| Item-level media/manuscript candidates | NEEDS ITEM-LEVEL RIGHTS REVIEW |
| Media assets shipped | NOT IN CURRENT SCOPE until the item-level review is registered and approved |
| Sunnah.com integration | NEEDS CREDENTIAL |
| Hadith editorial status | NEEDS EDITORIAL REVIEW |
| Seerah claim-level scholarly authentication | NEEDS SCHOLARLY REVIEW |
| Translation rights | NEEDS RIGHTS CLEARANCE |
| Tafsir rights and review | NEEDS RIGHTS CLEARANCE; NEEDS SCHOLARLY REVIEW |
| Audio bundling/offline redistribution | NEEDS RIGHTS CLEARANCE |
| Production deployment | BLOCKED BY DEPLOYMENT ENVIRONMENT; no authorized deployment target was available for verification |
| Bundle-size optimization | NOT IN CURRENT SCOPE for closure; build warning remains non-blocking |

## Final claim

The repository closure claim allowed by the evidence is: **final merged main is validated, the post-PR21 runtime/import issue is disproven as a current-main regression, the production build/start path is verified, the corrected visual matrix passes, and no uncleared media or fake library/audio state was introduced.** This evidence does **not** claim production deployment, full scholarly authentication, full screen-reader certification, or clearance of media, translation, tafsir, or audio rights.

## Machine-readable final handoff

```text
CURRENT_MAIN_SHA=32a0138b7390b6590b76651a03abdae19bb583b2
HEAD=32a0138b7390b6590b76651a03abdae19bb583b2
ORIGIN_MAIN=32a0138b7390b6590b76651a03abdae19bb583b2
HEAD_EQUALS_ORIGIN_MAIN=true

POST_PR21_RUNTIME=STALE_LOCAL_RUNTIME_NOT_REPRODUCIBLE_ON_CURRENT_MAIN
TYPECHECK=PASS
SOURCE_VALIDATION=PASS
BUILD=PASS
PRODUCTION_START=PASS_PORT_3001
VISUAL_CAPTURE=PASS_17_CASES
ACCESSIBILITY=PASS_VISIBLE_UNNAMED_0; FULL_SCREEN_READER_NEEDS_EXECUTION_ENVIRONMENT

OPEN_PRS=0
MERGED_PRS_THIS_MISSION=2

SOURCE_RECORDS=15
WORK_RECORDS=17
DIGITAL_VERSIONS=33
PROVIDER_POLICIES=18
CHILDREN_ADAPTATIONS=5
CLEARED_MEDIA_ASSETS=0

NEEDS_CREDENTIAL=SUNNAH_COM_CREDENTIALS
NEEDS_RIGHTS_CLEARANCE=TRANSLATIONS;TAFSIR;AUDIO_BUNDLING
NEEDS_ITEM_LEVEL_RIGHTS_REVIEW=LOC_44036212;WIKIMEDIA_HIJAZI_MANUSCRIPT;NYPL_SELECTED_ITEM
NEEDS_EDITORIAL_REVIEW=HADITH_SAMPLES;SELECTED_SEERAH_CONTENT
NEEDS_SCHOLARLY_REVIEW=SEERAH_CLAIMS;TAFSIR
BLOCKED_ENVIRONMENT=FULL_SCREEN_READER_CERTIFICATION
NOT_IN_SCOPE=PRODUCTION_DEPLOYMENT_VERIFICATION_WITHOUT_AUTHORIZED_TARGET;BUNDLE_SIZE_OPTIMIZATION

NEXT_EXECUTABLE_TASK=
```
