import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import type express from "express";

/**
 * Compressed delivery for the public JSON datasets.
 *
 * The Library catalog is 10.7 MB of UTF-8 JSON. Served raw it dominated the
 * wing's page weight; gzipped it is ~0.9 MB (−91%). This middleware answers
 * `/data/*.json` from the public directory with a cached gzip buffer, keyed
 * by mtime so a rebuilt catalog is picked up without a server restart.
 * Everything else falls through to Vite / express.static untouched.
 */

interface CachedAsset {
  mtimeMs: number;
  raw: Buffer;
  gzip: Buffer;
}

const assetCache = new Map<string, CachedAsset>();

export function compressedDataJson(
  publicDir: string,
  cacheControl = "public, max-age=3600",
): express.RequestHandler {
  const root = path.resolve(publicDir);
  return (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (!req.path.startsWith("/data/") || !req.path.endsWith(".json")) {
      return next();
    }

    let decoded: string;
    try {
      decoded = decodeURIComponent(req.path);
    } catch {
      return next();
    }
    const file = path.resolve(root, `.${path.sep}${decoded}`);
    // Traversal guard: the resolved file must stay inside the public root.
    if (file !== root && !file.startsWith(root + path.sep)) return next();

    let stat: fs.Stats;
    try {
      stat = fs.statSync(file);
      if (!stat.isFile()) return next();
    } catch {
      return next();
    }

    let asset = assetCache.get(file);
    if (!asset || asset.mtimeMs !== stat.mtimeMs) {
      const raw = fs.readFileSync(file);
      asset = { mtimeMs: stat.mtimeMs, raw, gzip: zlib.gzipSync(raw, { level: 6 }) };
      assetCache.set(file, asset);
    }

    const acceptsGzip = /\bgzip\b/.test(String(req.headers["accept-encoding"] ?? ""));
    const body = acceptsGzip ? asset.gzip : asset.raw;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Vary", "Accept-Encoding");
    res.setHeader("Cache-Control", cacheControl);
    if (acceptsGzip) res.setHeader("Content-Encoding", "gzip");
    res.setHeader("Content-Length", body.length);
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    res.end(body);
  };
}
