# Legacy Baseline Import Status

Generated: 2026-09-23 00:59:16 +04:00

## Source
- ZIP: D:\Knoux Projects\Knoux_Project_Center\01_Ready\almubeen-main.zip
- ZIP SHA256: AA07F158328AB7639E4FA1652257639A68CBEE61A235E1E654836ED3812AFC8E
- Source root: C:\Users\day night\AppData\Local\Temp\yarasoolallah-bootstrap-20260923-005739\extract\almubeen-main

## Target
- Project: يا رسول الله ﷺ
- Domain: yarasoolallah.it.com
- Repository: daynightae-cmyk/alketab-almubeen
- Local: D:\YaRasoolAllah

## Verification
- npm ci: PASS
- npm run check: FAIL(2)
- npm run build: PASS

## Interpretation
This file records a legacy baseline import only.
A failed or skipped verification is NOT hidden and does NOT block preserving the baseline in Git.
This commit MUST NOT be described as Production Ready unless all required gates are later proven green.

## Known inherited technical debt to audit next
- Legacy branding and internal AlMubeen naming remains in code.
- Demo/placeholder server responses exist in the old source.
- Prayer-time demo data and old calendar examples require replacement.
- The client-side Gemini key pattern must be replaced by a server-side proxy.
- Memory-only backend storage is not production persistence.
- Quran/search services contain sample/fallback data paths that require provenance review.
- Duplicate component/localization structures need consolidation.
