import express, { type Express } from "express";
import { registerMp3QuranCatalogRoutes } from "./mp3quran-catalog";
import { registerOpenItiReaderRoutes } from "./openiti-reader";
import { registerOpenLibraryRoutes } from "./open-library";
import { registerQuranTranslationRoutes } from "./quran-translations";
import { errorHandler, requestLogging } from "./logging";

function publicContentHeaders(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  res.setHeader("Cache-Control", "no-store");
  next();
}

export function createPublicContentApp(): Express {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));
  app.use(express.urlencoded({ extended: false, limit: "32kb" }));
  app.use(publicContentHeaders);
  app.use(requestLogging);

  registerOpenLibraryRoutes(app);
  registerMp3QuranCatalogRoutes(app);
  registerQuranTranslationRoutes(app);
  registerOpenItiReaderRoutes(app);

  app.use(errorHandler);
  return app;
}
