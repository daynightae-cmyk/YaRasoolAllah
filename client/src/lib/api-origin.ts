/**
 * API origin authority for every runtime target.
 *
 * - Web (same-origin deployment): relative `/api/...` paths, unchanged.
 * - Native shells (Capacitor Android / packaged desktop) serve the bundled
 *   client from a local WebView origin, so live provider-governed endpoints
 *   must be addressed at the canonical institution origin.
 * - `VITE_API_ORIGIN` overrides both for staging/preview builds.
 *
 * The native target is `BRAND.apiOrigin` (the final deployment host), not
 * the apex brand URL: the apex answers with a CORS-less 308 redirect, and a
 * browser aborts the whole CORS request on a redirect response that has no
 * `Access-Control-Allow-Origin` header.
 *
 * Honesty: this only changes WHERE governed content is fetched from — never
 * what is fetched. Offline native runs surface the same honest failure
 * states as the web app; nothing is fabricated locally.
 */

import { BRAND } from "@/config/brand";

const LOCAL_WEBVIEW_ORIGINS = new Set([
  "https://localhost",
  "http://localhost",
  "capacitor://localhost",
  "ionic://localhost",
  // Windows desktop shell: privileged local protocol (desktop/main.cjs).
  "yra://institution",
]);

function configuredOrigin(): string {
  const override = (import.meta.env.VITE_API_ORIGIN as string | undefined)?.trim();
  if (override) return override.replace(/\/+$/, "");
  if (typeof window !== "undefined") {
    // Desktop shell marker (desktop/preload.cjs): the bundled client runs
    // from a privileged local protocol, so live content uses the canonical
    // institution origin even when the page origin looks remote.
    if ((window as { __YRA_DESKTOP__?: boolean }).__YRA_DESKTOP__) {
      return BRAND.apiOrigin;
    }
    if (LOCAL_WEBVIEW_ORIGINS.has(window.location.origin)) {
      return BRAND.apiOrigin;
    }
  }
  return "";
}

/** Absolute (native) or relative (web) URL for a governed API path. */
export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${configuredOrigin()}${normalized}`;
}
