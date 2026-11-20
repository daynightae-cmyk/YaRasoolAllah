import express, { type Express } from "express";
import { registerMp3QuranCatalogRoutes } from "./mp3quran-catalog";
import { registerQuranTranslationRoutes } from "./quran-translations";
import { registerQuranTafsirRoutes } from "./quran-tafsir";
import { registerHadithStatusRoutes } from "./hadith";
import { registerOpenItiReaderRoutes } from "./openiti-reader";
import { registerOpenLibraryRoutes } from "./open-library";
import { registerQuranEncTranslationRoutes } from "./quranenc-translations";
import { registerApiNotFound } from "./api-not-found";
import { assertRuntimeConfig } from "./env";
import { errorHandler, requestLogging } from "./logging";
import { registerRoutes } from "./routes";

function securityHeaders(req: express.Request, res: express.Response, next: express.NextFunction): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  if (req.path.startsWith("/api")) {
    res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
    res.setHeader("Cache-Control", "no-store");
  }
  next();
}

/**
 * Native-shell CORS — the Capacitor Android WebView (and packaged desktop
 * shells) serve the bundled client from a local origin, so governed public
 * content endpoints must accept those exact origins. Allowlist only; no
 * credentials, no wildcard, GET/OPTIONS only.
 */
const NATIVE_SHELL_ORIGINS = new Set([
  "https://localhost",
  "http://localhost",
  "capacitor://localhost",
  "ionic://localhost",
  "yra://institution",
  "https://yarasoolallah.it.com",
  "https://yarasoolallah.org",
]);

function nativeShellCors(req: express.Request, res: express.Response, next: express.NextFunction): void {
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

export function createApiApp(): Express {
  assertRuntimeConfig();

  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));
  app.use(express.urlencoded({ extended: false, limit: "32kb" }));
  app.use(securityHeaders);
  app.use(nativeShellCors);
  app.use(requestLogging);

  registerOpenLibraryRoutes(app);
  registerMp3QuranCatalogRoutes(app);
  registerQuranTranslationRoutes(app);
  registerQuranEncTranslationRoutes(app);
  registerQuranTafsirRoutes(app);
  registerHadithStatusRoutes(app);
  registerOpenItiReaderRoutes(app);
  registerRoutes(app);
  registerApiNotFound(app);
  app.use(errorHandler);

  return app;
}
