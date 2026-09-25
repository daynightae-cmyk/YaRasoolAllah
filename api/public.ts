import type { IncomingMessage, ServerResponse } from "node:http";
import { createPublicContentApp } from "../server/create-public-content-app";

const app = createPublicContentApp();

export function reconstructContentApiUrl(requestUrl: string | undefined): string | null {
  const url = new URL(requestUrl || "/api/public", "http://localhost");
  const path = url.searchParams.get("__content_path")?.replace(/^\/+|\/+$/g, "") ?? "";
  if (!path || path.includes("..")) return null;

  url.searchParams.delete("__content_path");
  const query = url.searchParams.toString();
  return `/api/content/${path}${query ? `?${query}` : ""}`;
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const target = reconstructContentApiUrl(req.url);
  if (!target) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ message: "مسار محتوى غير صالح." }));
    return;
  }

  req.url = target;
  return app(req, res);
}
