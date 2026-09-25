# Current product reality

Audited against live `origin/main` after Git operations on 2026-09-25.

This document supersedes stale counts in older audit files. Historical
percentages and “17 books / demo-token / 18 sample verses” claims are **not**
current truth unless re-verified below.

## Git authority

| Item | Value |
|---|---|
| Canonical remote | `https://github.com/daynightae-cmyk/YaRasoolAllah.git` |
| Branch | `main` at audit start of this file, then this slice |
| Start SHA (after PR #87 merge) | `7dd552bef6cafe8b9ac54ffec5b22c35ea15c490` |
| PR #83 | Closed without merge: superseded by `431257d` (EN/FR/UR AlQuran Cloud translations already on main). Checks had been green; Vercel `build-rate-limit` is a hosting quota, not an application-code failure. |
| PR #87 | Merged: Vercel public content API bridge (`/api/content/*`). Application CI green. Deployment still subject to Vercel quota. |

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
| MP3Quran recitations | Catalog + governed stream URLs | MP3Quran.net | Streaming allowed per registry | `/audio`, inline `/quran` | Yes | n/a | Yes if stream allowed | Catalog | No fake ayah timings |
| OpenITI | Item-level reader when rights allow | OpenITI | Per digital version | `/library` | Yes | Conditional | n/a | Catalog | Exercise real records |
| Library catalog | Thousands of shelf works (runtime catalog builder) | Internal catalog + Open Library discovery | Per work/version | `/library` | Yes | Conditional | n/a | Yes | No fake PDF/IIIF/download |
| Kids approved YouTube catalog | Generated approved list empty; curated seeds exist; recovered queue pending | YouTube publishers + editorial pipeline | Embed/depiction pending for recovered items | `/kids` | Partial | n/a | Seed videos only | Filter | Do not auto-promote pending |
| Hadith | Small local development sample | Local samples | Not a full corpus | `/hadith` | Yes | Sample only | n/a | Sample | BLOCKED_EXTERNAL for full corpus without lawful source |
| Seerah | Chapter journey | Editorial chapters + OpenITI links | Review continues | `/seerah` | Yes | Chapters | n/a | Partial | Event graph still PARTIAL |
| Atlas | Schematic | Internal schematic | Not geographic fact | `/atlas` | Yes | Schematic | n/a | n/a | Geographic layer BLOCKED until sourced coordinates |
| Daily / Adhkar | Prayer observatory live (AlAdhan); adhkar corpus unbound | AlAdhan + honest empty adhkar | Prayer calculation ≠ worship text rights | `/daily` | Yes | Prayer yes; adhkar no | n/a | n/a | Adhkar BLOCKED pending sourced corpus |
| Basirah | Local governed index | Internal registries | Retrieval only | `/basirah` | Yes | Yes | n/a | Yes | No generative fatwa; AI credential optional |
| Quran Foundation / Sunnah.com / GeoNames / YouTube Data API | — | Credential-gated | — | Adapters only | No | No | No | No | CREDENTIAL BLOCKED |
| Qatar Digital Library | — | HTTP 403 | — | Dormant adapter | No | No | No | No | PROVIDER BLOCKED |
| Vercel production `/api/content` | Function added in #87 | — | — | Deployed APIs | BLOCKED | BLOCKED | — | — | Hosting `build-rate-limit` quota |

## Remaining unblocked engineering (not credentials)

1. Hadith: honest corpus-scope UI + adapters (no fabricated bulk copy).
2. Seerah event graph from existing sourced chapters (no invented relations).
3. Daily supporting content honesty (tasbih reward claims, daily-verse API).
4. Tafsir: real edition text only when source+rights exist.
5. Sources/Evidence drawer semantic unification.
6. Persistence: production `DATABASE_URL` required; memory fallback is not production.

## Status vocabulary for this SHA

| Slice | Status |
|---|---|
| Quran Arabic | IMPLEMENTED AND VERIFIED |
| Quran EN/FR/UR translations (AlQuran Cloud proxy) | IMPLEMENTED BUT NOT VERIFIED at production URL (Vercel quota) |
| Quran audio MP3Quran | IMPLEMENTED AND VERIFIED in CI/runtime locally |
| Library catalog + readers | IMPLEMENTED BUT NOT VERIFIED for every format combination |
| Kids theatre | IMPLEMENTED AND VERIFIED (curtain); content PARTIAL |
| Canonical public shell | This slice |
| Hadith full corpus | BLOCKED_EXTERNAL / PARTIAL sample |
| Seerah event graph | PARTIAL |
| Atlas geographic | NOT IMPLEMENTED (schematic preserved) |
| Adhkar corpus | BLOCKED (rights/editorial) |
| Production deploy | BLOCKED: Vercel `build-rate-limit` |
