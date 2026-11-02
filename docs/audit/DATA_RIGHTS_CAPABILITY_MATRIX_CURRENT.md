# Data, Rights & Capability Matrix (Current)

Source of counts: `client/public/data/library-catalog.v1.json` (read this session) and current registry/matrix docs. Status vocabulary per directive.

| Dataset / provider | Records | Provenance | Rights / editorial | Consumer | Capability | Status |
|---|---|---|---|---|---|---|
| Tanzil Arabic Quran | 114 surahs / 6,236 ayahs | Tanzil | Governed immutable Arabic | `/quran` | Read, search | REAL_VERIFIED |
| AlQuran Cloud translations | EN/FR/UR editions via internal proxy | AlQuran Cloud | API display; not bundled | `/quran` study | Read when provider reachable | IMPLEMENTED_NOT_VERIFIED at production URL |
| QuranEnc Muyassar tafsir | Server proxy | QuranEnc `arabic_moyassar` | Governed, API display | `/quran` study | Read when provider reachable | REAL_VERIFIED locally |
| MP3Quran recitations | Catalog + streams | MP3Quran.net | Streaming allowed per registry | `/audio`, inline `/quran` | Play, honest failure | REAL_VERIFIED |
| OpenITI library text | 9,106 openable works (of 9,129 catalog works) | OpenITI | Per digital version; CC BY-NC-SA 4.0 noted | `/library` | Read in-app | REAL_VERIFIED |
| Library metadata-only seeds | 23 works | Internal catalog | Metadata-only, stated | `/library` | No file | REAL_VERIFIED as metadata-only |
| PDF / IIIF / EPUB / presentation / audiobook | 0 proven readable records | — | — | `/library` | Honest empty state | REAL_VERIFIED as zero |
| Kids approved YouTube | Curated seeds; approved generated catalog empty | YouTube publishers + editorial pipeline | Embed/depiction pending | `/kids` | Curtain + governed seeds | PARTIAL / BLOCKED_EXTERNAL |
| Hadith samples | 4 development samples; 6 bibliographic collections | Local samples + provider policy | Not a corpus; Sunnah credentials absent; Dorar reference-only | `/hadith`, `/sunnah` | Sample read/copy/deep-link | REAL_VERIFIED sample; full corpus BLOCKED_EXTERNAL |
| Hadith status contract | 1 endpoint | Internal | Truthful status | `/api/content/hadith/status` | Status | REAL_VERIFIED |
| Seerah | 8 chapters, 23 event nodes, 62 recorded edges | Editorial chapters + OpenITI | Review continues | `/seerah` | Timeline + recorded relations | REAL_VERIFIED recorded relations; entity/scripture edges DEFERRED |
| Atlas schematic/theatre | Campaign phases | Internal schematic + governed data | Schematic labeled | `/atlas` | Theatre | REAL_VERIFIED; geographic layer NOT_IMPLEMENTED (sourced coords needed) |
| Daily prayer | Live AlAdhan | AlAdhan | Calculation ≠ worship text | `/daily` | Prayer times | REAL_VERIFIED |
| Adhkar | Unbound | — | Rights/editorial | `/daily` | Honest empty | BLOCKED_EXTERNAL |
| Basirah | Local governed index | Internal registries | Retrieval only; no fatwa | `/basirah` | Search/retrieve | REAL_VERIFIED |
| Global search | Canonical records | Internal registries | Per record | `/` search | Search + deep links | REAL_VERIFIED |
| Quran Foundation | — | Credential-gated | — | adapter | None | BLOCKED_EXTERNAL |
| Sunnah.com | — | Credential-gated | — | adapter | None | BLOCKED_EXTERNAL |
| GeoNames | — | Credential-gated | — | adapter | None | BLOCKED_EXTERNAL |
| YouTube Data API | — | Credential-gated | — | adapter | None | BLOCKED_EXTERNAL |
| TimeZoneDB | — | Credential-gated | — | adapter | None | BLOCKED_EXTERNAL |
| Qatar Digital Library | — | HTTP 403 | — | dormant | None | BLOCKED_EXTERNAL |
| BnF Gallica | — | HTTP 403 | — | dormant | None | BLOCKED_EXTERNAL |
| Dorar | — | HTTP 403 | Reference-only; no bulk scrape | dormant | None | BLOCKED_EXTERNAL |

## Critical distinctions

- 9,129 research catalog works ≠ 9,129 readable books. **9,106** are openable text works; 23 are metadata-only.
- Arabic Quran text is verbatim governed; translations are separate provider editions and must carry attribution.
- Hadith is **4 samples**, not a corpus; never claim full corpus.
- Kids discovery ≠ editorial approval; no auto-promotion.
- Atlas schematic points are **not** latitude/longitude; no inferred routes.
- No fabricated reward, grading, translation, or licensing.
