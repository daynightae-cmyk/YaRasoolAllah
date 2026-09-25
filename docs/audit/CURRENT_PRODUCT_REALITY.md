# Current product reality

Audited against live `origin/main` = `f9807d31d6fb5c2ce5d2693df6fcb3161e52d762` after PR #95 merge on 2026-09-25, plus this slice's live verification.

This document supersedes stale counts in older audit files. Historical
percentages and “17 books / demo-token / 18 sample verses” claims are **not**
current truth unless re-verified below.

## Git authority

| Item | Value |
|---|---|
| Canonical remote | `https://github.com/daynightae-cmyk/YaRasoolAllah.git` |
| Branch | `main` at audit start of this file, then this slice |
| Start SHA (this refresh) | `7aebc0333de31a45e2fbb08f3869210ed997e367` (merge of PR #93) |
| PR #89 | Merged: audit-docs refresh to `5dacde1c`. |
| Tafsir direct push | `1a661c7b` “Quran: full governed Muyassar tafsir in study reader” landed WITHOUT a PR (direct push by `daynightae-cmyk`). Adds `server/quran-tafsir.ts` (QuranEnc `arabic_moyassar` proxy with governance gate), client study-reader UI, `scripts/quran-tafsir.test.ts`. |
| PR #92 | Merged `3565cd4f`: Hadith honest copy-matn/link, deep-link sync, invalid-sample notice, `scripts/hadith-share.test.ts`. Runtime-verified locally (deep links, copy success/failure, 390/768/1440 RTL/LTR dark/light, no overflow, no console errors). |
| PR #93 | Merged `7aebc033`: rewired stale `atlas-1440-dark-rtl` visual-evidence case to the real `/atlas` theatre view; harness import-safe; `scripts/visual-evidence-cases.test.ts` (22 checks) in `test:p0`. `capture:visual` back to 20/20 with zero mount/overflow/runtime/unnamed failures. |
| Vercel quota | CLEARED: Vercel preview deployments completed on PR #92 and PR #93. Production domain (`yarasoolallah.it.com`) cutover still unverified. |
| PR #83 | Closed WITHOUT merge by owner (`daynightae-cmyk`, 2026-09-25T08:55:14Z): `CONFLICTING` against current `main` because equivalent governed translation work already landed in `431257d` (EN/FR/UR AlQuran Cloud translations, French included). Code checks had been green; Vercel `build-rate-limit` is a hosting quota, not an application-code failure. QuranEnc editions (Rowwad EN / Junagarhi UR) remain a LATER ADDITIVE slice only, not a replacement of the merged AlQuran Cloud study-mode path. |
| PR #86 | Merged: Quran reader inline governed MP3Quran recitation (`bd382893`). |
| PR #87 | Merged: Vercel public content API bridge (`/api/content/*`). Application CI green. Deployment still subject to Vercel quota. |
| PR #88 | Merged: canonical public shell for supporting routes (`8c516956`). |
| QuranEnc coexistence branch (NOT merged, deferred) | `origin/feat/quranenc-translations-internal-20260925` @ `3b26f3f1` — conflict-resolved rebase of the closed PR #83 onto `d6824086`, keeping AlQuran Cloud AND QuranEnc side by side (distinct server routes `/api/content/quran/translations` + `/api/content/quran/translation`, distinct client modules, both P0 gates). Locally verified 2026-09-25: `tsc` PASS, `test:p0` 35/35 PASS, `validate:sources` PASS, `vite build` PASS, live runtime 200 on both endpoints with real Al-Fatiha translations. Do NOT merge or re-open without a new owner decision. |

## Shell

Canonical owner for public knowledge routes: `client/src/visual-golden/components/shell/InstitutionShell.tsx`.

Contract: `client/src/visual-golden/lib/public-shell.ts`.

| Route class | Shell | Notes |
|---|---|---|
| Flagship wings (`/`, library, quran, seerah, atlas, hadith, kids, daily, audio, basirah, sources, who-is-muhammad) | VisualInstitutionShell | Implemented |
| Supporting public tools (prophetic-day, daily-verse, prayer-guide, calendar, tasbih, qibla, five-pillars, women-in-islam, islamic-knowledge) | VisualInstitutionShell | This slice |
| `/dashboard`, `/bab-alsamaa-settings` | Legacy `AppLayout` | Intentional exceptions |
| `/ai-assistant`, `/al-mufti-al-mubeen`, `/islamic-ai-management` | Redirect → `/basirah` | No fake fatwa surface |

## Data-to-experience (current leads)

| Dataset / provider | Record volume (current) | Provenance | Rights | Active consumer | Visible | Readable | Playable | Searchable | Next action |
|---|---|---|---|---|---|---|---|---|---|
| Tanzil Arabic Quran | 114 surahs / 6236 ayahs | Tanzil | Governed, immutable Arabic | `/quran` | Yes | Yes | n/a | Yes (query-time) | Do not reimport |
| AlQuran Cloud translations | EN/FR/UR editions via internal proxy | AlQuran Cloud | API display; not bundled corpus | `/quran` study mode | Yes | Yes when provider reachable | n/a | No | Honest failure if provider down; French included |
| MP3Quran recitations | Catalog + governed stream URLs | MP3Quran.net | Streaming allowed per registry | `/audio`, inline `/quran` (PR #86) | Yes | n/a | Yes if stream allowed | Catalog | Stream-element failures now surface honest `role=alert` messages on both players (this slice); catalog-fetch failures already honest |
| QuranEnc Muyassar tafsir (REPAIRED PR #95) | Server proxy mounted on both servers; edition metadata served honestly without fabricated version | QuranEnc `arabic_moyassar` API | Governed (`resource-quranenc-muyassar-tafsir`), API display | `/quran` study reader | Yes | Yes when provider reachable | n/a | No | Repaired 2026-09-25: route mounted + metadata fetch removed (provider publishes no version for this edition; `version`/`lastUpdate` null with honest UI note). Runtime-verified: 200 governed JSON, real surah-112 text in study reader |
| QuranEnc translations (DEFERRED) | Rowwad EN 1.0.19 / Junagarhi UR 1.1.3, server adapter + rights evidence exist on deferred branch only | QuranEnc.com | Republication allowed with attribution/version (terms evidence on branch) | NONE on main | No | No | n/a | No | Owner-deferred additive slice; see Git authority row |
| OpenITI | Item-level reader when rights allow | OpenITI | Per digital version | `/library` | Yes | Conditional | n/a | Catalog | Exercise real records |
| Library catalog | Thousands of shelf works (runtime catalog builder) | Internal catalog + Open Library discovery | Per work/version | `/library` | Yes | Conditional | n/a | Yes | No fake PDF/IIIF/download |
| Kids approved YouTube catalog | Generated approved list empty; curated seeds exist; recovered queue pending | YouTube publishers + editorial pipeline | Embed/depiction pending for recovered items | `/kids` | Partial | n/a | Seed videos only | Filter | Do not auto-promote pending |
| Hadith | 4 local development samples, 6 bibliographic collections; copy-matn/link + deep-link contracts live (PR #92) | Local samples | Not a full corpus | `/hadith`, `/sunnah` | Yes | Sample only | n/a | Sample | BLOCKED_EXTERNAL for full corpus without lawful source; contracts runtime-verified 2026-09-25 |
| Seerah | Chapter journey | Editorial chapters + OpenITI links | Review continues | `/seerah` | Yes | Chapters | n/a | Partial | Event graph still PARTIAL |
| Atlas | Schematic + living theatre (campaign phases, certainty badge, witness citation, Seerah links) | Internal schematic + governed campaign data | Not geographic fact; schematic labeled in-UI | `/atlas` | Yes | Schematic + theatre | n/a | n/a | Geographic layer BLOCKED until sourced coordinates; visual-evidence coverage restored (PR #93) |
| Daily / Adhkar | Prayer observatory live (AlAdhan); adhkar corpus unbound | AlAdhan + honest empty adhkar | Prayer calculation ≠ worship text rights | `/daily` | Yes | Prayer yes; adhkar no | n/a | n/a | Adhkar BLOCKED pending sourced corpus |
| Basirah | Local governed index | Internal registries | Retrieval only | `/basirah` | Yes | Yes | n/a | Yes | No generative fatwa; AI credential optional |
| Quran Foundation / Sunnah.com / GeoNames / YouTube Data API | — | Credential-gated | — | Adapters only | No | No | No | No | CREDENTIAL BLOCKED |
| Qatar Digital Library | — | HTTP 403 | — | Dormant adapter | No | No | No | No | PROVIDER BLOCKED |
| Vercel `/api/content` | Function added in #87; preview deploys intermittent (passed #92/#93/#95, rate-limited #94) | — | — | Preview APIs | Yes (preview) | Preview only | — | — | Quota is intermittent, not cleared; production domain cutover unverified |

## Remaining unblocked engineering (not credentials)

1. Hadith: credential adapters + corpus-scope honesty (no fabricated bulk copy).
2. Seerah event graph from existing sourced chapters (no invented relations).
3. Daily supporting content honesty (tasbih reward claims, daily-verse API).
4. Sources/Evidence drawer semantic unification.
5. Persistence: production `DATABASE_URL` required; memory fallback is not production.
6. Multilingual closure: separate UI-language support from content-translation availability (AR/EN/FR/UR).

## Status vocabulary for this SHA

| Slice | Status |
|---|---|
| Quran Arabic | IMPLEMENTED AND VERIFIED |
| Quran EN/FR/UR translations (AlQuran Cloud proxy) | IMPLEMENTED BUT NOT VERIFIED at production URL (Vercel quota) |
| Quran Muyassar tafsir (QuranEnc proxy) | IMPLEMENTED AND VERIFIED locally (PR #95: mounted, honest null version, real surah-112 text in study reader) |
| Quran audio MP3Quran | IMPLEMENTED AND VERIFIED in CI/runtime locally (incl. inline `/quran` recitation, PR #86; stream-element failure alerts this slice) |
| Library catalog + readers | IMPLEMENTED BUT NOT VERIFIED for every format combination |
| Kids theatre | IMPLEMENTED AND VERIFIED (curtain); content PARTIAL |
| Canonical public shell | IMPLEMENTED AND VERIFIED for supporting routes (PR #88); `/dashboard`, `/bab-alsamaa-settings` intentionally legacy |
| Hadith sample contracts (copy/deep-link/search) | IMPLEMENTED AND VERIFIED locally 2026-09-25 (PR #92) |
| Hadith full corpus | BLOCKED_EXTERNAL / PARTIAL sample |
| Seerah event graph | PARTIAL |
| Atlas theatre + schematic | IMPLEMENTED AND VERIFIED locally (PR #93 evidence); geographic layer NOT IMPLEMENTED |
| Adhkar corpus | BLOCKED (rights/editorial) |
| Visual evidence harness | IMPLEMENTED AND VERIFIED: 20/20 cases, zero failures (PR #93) |
| Production deploy | PARTIAL: Vercel quota cleared, preview deploys completing; production domain cutover unverified |
