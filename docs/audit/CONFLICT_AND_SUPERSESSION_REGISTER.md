# Conflict and Supersession Register

Evidence hierarchy used: live working tree + GitHub SHA/PR/CI/runtime + actual provider responses + current source/rights records > latest same-SHA audits > older audits/research > aspirations.

| # | Document | Status vs current reality | Key conflict / note |
|---|---|---|---|
| 1 | `docs/audit/FORENSIC_REALITY_REPORT_2026-11-02.md` | SUPERSEDED at top line by this snapshot | It audits `946daa83`; current remote is `21416a4b` (README-only PR #111). Its gate results remain valid for `946daa83`, not for current `21416a4b` until re-run. However this session re-ran tsc/test/build at rebased `655f5bc4` and they pass. |
| 2 | `docs/audit/PRODUCTION_READINESS_MATRIX.md` | PARTIALLY SUPERSEDED | Still accurate in structure; production runtime now observed: `/api/health` 500, `/api/content/quran/surahs` 404. Release gate remains BLOCKED. |
| 3 | `docs/audit/FUNCTIONAL_COMPLETENESS_MATRIX.md` | CURRENT for feature status | No product-code change since `946daa83` except README; statuses remain valid. |
| 4 | `docs/audit/EXECUTION_LEDGER.md` | SUPERSEDED by `docs/tasks/EXECUTION_LEDGER_CURRENT.md` | Historical ledger for the `946daa83` session. |
| 5 | `docs/audit/SAFE_INTEGRATION_PLAN.md` | CURRENT in policy | Still valid; add that `origin/main` advanced to `21416a4b`. |
| 6 | `docs/audit/UNIQUE_WORK_RECOVERY_REGISTER.md` | CURRENT but expanded | New `UNIQUE_WORK_PROTECTION_LEDGER.md` adds per-item detail and new remote branches. |
| 7 | `docs/audit/STORAGE_RECOVERY_REGISTER.md` | CURRENT | No cleanup executed; measurements unchanged. |
| 8 | `docs/audit/CURRENT_PRODUCT_REALITY.md` | HISTORICAL (2026-09-25) | Valuable detail, but counts/SHAs are stale. Do not treat as current truth. |
| 9 | `docs/audit/DATA_TO_EXPERIENCE_MATRIX.md` | HISTORICAL — SUPERSEDED | Pre-`946daa83` data counts; replaced by `DATA_RIGHTS_CAPABILITY_MATRIX_CURRENT.md`. |
| 10 | `docs/audit/DEEP_EXPERIENTIAL_REALITY_AUDIT.md` | HISTORICAL — SUPERSEDED | Design/experience audit before product recovery; preserve for visual history. |
| 11 | `docs/audit/YA_RASOOL_ALLAH_FOUNDATION_AUDIT.md` | HISTORICAL — SUPERSEDED | Foundation-era audit; preserve. |
| 12 | `docs/handoffs/HOST_REINSTALL_RECOVERY_20260926.md` (or in-repo equivalent) | HISTORICAL — NOT CURRENT | Host-reinstall handoff; superseded by current repository state. |

## Explicit contradictions resolved

1. **"No unblocked engineering remains"** (old forensic report) vs **TASK 010/TASK 011 ready** (ledger). Resolution: TASK 010 is partially done; TASK 011 (incremental lint) is unblocked and will be executed. Old statement is superseded.
2. **Domain** — README/docs sometimes use `yarasoolallah.org`. Live evidence: `.org` does not serve; `.it.com` apex redirects to `www.yarasoolallah.it.com`, which serves HTML. Canonical public host is `www.yarasoolallah.it.com`.
3. **`origin/main` SHA** — old report `946daa83`; current `21416a4b`. PR #111 is README-only, so product behavior is unchanged.
4. **Production deployed SHA** — unverified; production asset hashes differ from local build, and API routes fail, so production is not proven to run current `main`.
5. **QuranEnc deferred branch** — remains `DEFERRED_OWNER` (`3b26f3f1`); do not merge.
6. **PR #83** — remains closed/superseded; do not reopen.
