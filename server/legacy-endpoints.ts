import type { Express, Request, Response } from "express";

export const DEMO_ENDPOINT_GONE = {
  status: "quarantined",
  code: "DEMO_ENDPOINT_REMOVED",
  message: "This demo endpoint is not a production knowledge authority.",
} as const;

function gone(_req: Request, res: Response): void {
  res.status(410).json(DEMO_ENDPOINT_GONE);
}

export function registerQuarantinedDemoRoutes(app: Express): void {
  app.get("/api/quran/surahs", gone);
  app.get("/api/quran/verses/:surahId", gone);
  app.get("/api/seerah/topics", gone);
  app.get("/api/prayer-times/:city", gone);
  app.post("/api/ai/ask", gone);
  app.get("/api/azkar/:category", gone);
  app.get("/api/calendar/events", gone);
  app.get("/api/children/stories", gone);
}
