import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { isProduction } from "./env";

const SENSITIVE_KEY = /(password|token|secret|authorization|cookie|note|prompt|email)/i;

export function log(message: string, source = "express"): void {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

function redact(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redact);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        SENSITIVE_KEY.test(key) ? "[redacted]" : redact(nested),
      ]),
    );
  }
  return value;
}

export function structuredLog(
  event: Record<string, unknown>,
  source = "express",
): void {
  log(JSON.stringify(redact(event)), source);
}

export function requestLogging(req: Request, res: Response, next: NextFunction): void {
  const requestId = typeof req.headers["x-request-id"] === "string"
    ? req.headers["x-request-id"]
    : randomUUID();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  const start = Date.now();
  res.on("finish", () => {
    if (!req.path.startsWith("/api")) {
      return;
    }
    structuredLog({
      requestId,
      method: req.method,
      route: req.path,
      status: res.statusCode,
      latencyMs: Date.now() - start,
    });
  });

  next();
}

export function errorHandler(
  err: { status?: number; statusCode?: number; message?: string; code?: string },
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status = err.status || err.statusCode || 500;
  const requestId = req.requestId;

  structuredLog({
    level: "error",
    requestId,
    route: req.path,
    method: req.method,
    status,
    code: err.code || "INTERNAL",
  });

  if (res.headersSent) {
    return;
  }

  res.status(status).json({
    message: isProduction() && status >= 500 ? "Internal Server Error" : err.message || "Internal Server Error",
    requestId,
  });
}
