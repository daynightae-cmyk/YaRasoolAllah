# Native-shell governed-content verification — 2026-11-24

Scope: prove that the packaged shells (Capacitor Android WebView, packaged
desktop shell) can actually READ the governed public-content API — not merely
receive CORS headers in a header-level check.

Evidence root: `artifacts/runtime-evidence/native-shell-20261124/`.

## What was broken

| Layer | Symptom | Root cause |
|---|---|---|
| Server | `/api/content/*` answered native origins with **no** `Access-Control-Allow-Origin` | `server/create-public-content-app.ts` never applied the native-shell allowlist that only `server/create-app.ts` had |
| Client | IIIF reader fetched `/api/content/iiif/manifest` with a **relative** path | `client/src/visual-golden/services/iiif.ts` bypassed `apiUrl()`; a relative path resolves to the shell's local origin, where no API exists |
| Browser (found by real-browser probe, not by header inspection) | A native-origin `fetch()` to `https://yarasoolallah.it.com` failed with `TypeError: Failed to fetch` | The apex host answers `308 → https://www.yarasoolallah.it.com`. The redirect response carries **no** `Access-Control-Allow-Origin`, and the Fetch spec requires every response in a CORS redirect chain to pass the CORS check, so Chrome aborts the whole request |

The third row is why a header-only check is not enough: the pre-fix response
headers looked correct on the final host, yet no browser could use them.

## Before-fix browser evidence

`before-fix-apex-redirect-blocked.json` (Chrome 158 headless, page origin
`http://localhost`):

```
Access to fetch at 'https://yarasoolallah.it.com/api/content/hadith/status'
from origin 'http://localhost' has been blocked by CORS policy: No
'Access-Control-Allow-Origin' header is present on the requested resource.
Failed to load resource: net::ERR_FAILED
```

`browser-origin-probe.json` shows the same probe run against the final host
succeeding (`status 200`, `type "cors"`), which isolates the failure to the
redirect response and not to the API itself.

## The fix

1. `server/native-shell-cors.ts` — one allowlist module
   (`https://localhost`, `http://localhost`, `capacitor://localhost`,
   `ionic://localhost`, `yra://institution`, the two institution origins),
   exact-match only, no wildcard, no credentials, `GET, OPTIONS` only.
2. `server/create-app.ts` + `server/create-public-content-app.ts` — both API
   apps apply the same middleware, so the local API and the Vercel
   public-content function cannot drift apart.
3. `client/src/visual-golden/services/iiif.ts` — the IIIF client now addresses
   the governed endpoint through `apiUrl()` like every other governed service.
4. `client/src/config/brand.ts` — new `BRAND.apiOrigin =
   "https://www.yarasoolallah.it.com"`. Native shells address the final
   deployment host directly; the apex URL stays the brand/canonical URL.
5. `client/src/lib/api-origin.ts` — native shells resolve to `BRAND.apiOrigin`
   instead of the redirecting apex.

## After-fix native-shell simulation

`native-shell-simulation.json`: the **production bundle** (`dist/public`) was
served from `http://localhost` (exactly the Capacitor WebView origin), loaded
in Chrome 158 headless, and the app was allowed to make its own governed
calls:

| Check | Result |
|---|---|
| Page origin | `http://localhost` |
| Governed request issued by the app | `GET https://www.yarasoolallah.it.com/api/content/hadith/status` |
| Response | `200` |
| `Access-Control-Allow-Origin` | `http://localhost` |
| Network failures | none |
| Console errors | none |
| Rendered state | live corpus status card: "سجلات محلية قيد المراجعة وليست مدونة كاملة" + `6` bibliographic collections / `4` local samples |

The page rendered the live provider-governed numbers, so the value was read
through the browser's CORS check — not merely received.

## Production-bundle verification (after the deploy of `eff3a6eb`)

`deployed-bundle-simulation.json`: the **deployed** production bundle (142
assets pulled from `https://www.yarasoolallah.it.com` and served from
`http://localhost` to imitate the shell) was loaded in Chrome headless:

| Check | Result |
|---|---|
| Page origin | `http://localhost` |
| Governed request | `GET https://www.yarasoolallah.it.com/api/content/hadith/status` |
| Response | `200` |
| `Access-Control-Allow-Origin` | `http://localhost` |
| Network failures / console errors | none / none |

The live bundle was also inspected directly: before the fix the deployed entry
chunk contained `https://yarasoolallah.it.com` (the redirecting apex); after
the deploy it contains `www.yarasoolallah.it.com` and no longer contains the
apex API URL.

## Live header checks (production, after deploy of the server fix)

| Origin | `GET /api/content/hadith/status` | `Access-Control-Allow-Origin` |
|---|---|---|
| `https://localhost` | 200 | `https://localhost` |
| `capacitor://localhost` | 200 | `capacitor://localhost` |
| `yra://institution` | 200 | `yra://institution` |
| `https://evil.example.com` | 200 | *(empty — not reflected)* |
| `OPTIONS` preflight, `capacitor://localhost` | 204 | `capacitor://localhost`, `GET, OPTIONS` |

## Regression gates

| Gate | Where |
|---|---|
| Public-content app answers allowed origins and refuses a foreign origin | `server/public-content-cors.test.ts` |
| Allowlist is exact, never wildcarded | `server/public-content-cors.test.ts` |
| Every governed client call site uses `apiUrl()` | `scripts/native-api-origin.test.ts` |
| Native target is the final host, never the CORS-less redirecting apex | `scripts/native-api-origin.test.ts` |
| IIIF client cannot regress to a relative fetch | `scripts/iiif-reader.test.ts` |

## Known limits (not claimed as solved)

- `yra://institution` was verified at the header level only: a custom-scheme
  page cannot be loaded by headless Chrome, so no browser-level run was made
  for the desktop shell.
- The apex → `www` 308 is a Vercel domain setting, not application code. It
  is not changed here; the client simply no longer depends on it.
- The main API (`/api/*` auth/persistence/health) still answers `503
  RUNTIME_CONFIG_MISSING` until `DATABASE_URL` and `JWT_SECRET` exist in the
  production environment. That is a separate owner decision (OD-1).
