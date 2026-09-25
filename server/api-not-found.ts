import type { Express, Request, Response } from "express";

export const API_ROUTE_NOT_FOUND = {
  status: "not_found",
  code: "API_ROUTE_NOT_FOUND",
  message:
    "This API route does not exist. The single-page application shell is never returned for API paths, so a missing endpoint cannot look like a successful HTML response.",
} as const;

/**
 * Unknown `/api/*` paths must fail as JSON. Without this, the SPA fallback
 * answers every unmatched path with `200 text/html`, so a client parsing JSON
 * receives HTML and a missing endpoint is indistinguishable from a success.
 */
function apiNotFound(req: Request, res: Response): void {
  res.status(404).json({ ...API_ROUTE_NOT_FOUND, path: req.originalUrl });
}

export function registerApiNotFound(app: Express): void {
  app.use("/api", apiNotFound);
}
