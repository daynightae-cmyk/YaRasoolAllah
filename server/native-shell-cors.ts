import type { NextFunction, Request, Response } from "express";

/**
 * Native-shell CORS - the Capacitor Android WebView and the packaged desktop
 * shell serve the bundled client from a local origin, so governed public
 * content endpoints must accept those exact origins. Allowlist only; no
 * credentials, no wildcard, GET/OPTIONS only.
 *
 * The policy lives in one module because TWO serverless entry points serve
 * `/api/content/*`: the local/main API app and the Vercel public-content
 * function. A native shell that can read one but not the other would fail
 * silently in production only.
 */
export const NATIVE_SHELL_ORIGINS = new Set([
  "https://localhost",
  "http://localhost",
  "capacitor://localhost",
  "ionic://localhost",
  "yra://institution",
  "https://yarasoolallah.it.com",
  "https://yarasoolallah.org",
]);

export function nativeShellCors(req: Request, res: Response, next: NextFunction): void {
  if (!req.path.startsWith("/api")) return next();
  const origin = req.headers.origin;
  if (typeof origin === "string" && NATIVE_SHELL_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Accept, Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400");
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
  }
  next();
}
