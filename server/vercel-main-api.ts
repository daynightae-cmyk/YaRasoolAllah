import type { IncomingMessage, RequestListener, ServerResponse } from "node:http";
import type { Express } from "express";

export const RUNTIME_CONFIG_MISSING = {
  status: "unavailable",
  code: "RUNTIME_CONFIG_MISSING",
  message:
    "The API is not available because required runtime configuration is missing. Contact the operator.",
} as const;

type AppFactory = () => Express | Promise<Express>;
type MainApiHandler = (
  req: IncomingMessage,
  res: ServerResponse,
) => void | Promise<void>;

/**
 * Vercel evaluates the API entry at module load. Importing the main app pulls
 * in storage initialization, which throws in production when `JWT_SECRET` or
 * `DATABASE_URL` is absent. Without this wrapper, every request becomes an
 * opaque `FUNCTION_INVOCATION_FAILED` 500.
 *
 * The factory is therefore resolved lazily and failures are cached. A missing
 * runtime configuration becomes an explicit, secret-free 503 for every
 * request; the operator still gets the startup reason in the function log.
 */
export function createMainApiHandler(createApp: AppFactory): MainApiHandler {
  let appPromise: Promise<RequestListener> | null = null;
  let startupErrorLogged = false;

  function loadApp(): Promise<RequestListener> {
    if (!appPromise) {
      appPromise = Promise.resolve()
        .then(createApp)
        .then((app) => app as unknown as RequestListener);
    }
    return appPromise;
  }

  return async function mainApiHandler(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    try {
      const app = await loadApp();
      app(req, res);
    } catch (error) {
      if (!startupErrorLogged) {
        startupErrorLogged = true;
        console.error(
          "[api] runtime configuration rejected at startup:",
          error instanceof Error ? error.message : "unknown error",
        );
      }

      res.statusCode = 503;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.end(JSON.stringify(RUNTIME_CONFIG_MISSING));
    }
  };
}
