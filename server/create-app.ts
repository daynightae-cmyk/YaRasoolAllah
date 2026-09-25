import express, { type Express } from "express";
import { registerMp3QuranCatalogRoutes } from "./mp3quran-catalog";
import { registerQuranTranslationRoutes } from "./quran-translations";
import { registerQuranTafsirRoutes } from "./quran-tafsir";
import { registerHadithStatusRoutes } from "./hadith";
import { registerOpenItiReaderRoutes } from "./openiti-reader";
import { registerOpenLibraryRoutes } from "./open-library";
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

export function createApiApp(): Express {
  assertRuntimeConfig();

  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));
  app.use(express.urlencoded({ extended: false, limit: "32kb" }));
  app.use(securityHeaders);
  app.use(requestLogging);

  registerOpenLibraryRoutes(app);
  registerMp3QuranCatalogRoutes(app);
  registerQuranTranslationRoutes(app);
  registerQuranTafsirRoutes(app);
  registerHadithStatusRoutes(app);
  registerOpenItiReaderRoutes(app);
  registerRoutes(app);
  registerApiNotFound(app);
  app.use(errorHandler);

  return app;
}
