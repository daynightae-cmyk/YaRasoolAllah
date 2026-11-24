import type { Express } from "express";
import { z } from "zod";
import { normalizeIiifManifest, type IiifManifestSummary } from "@shared/iiif";

const manifestUrlSchema = z.string().url().max(800);
const PROVIDERS = new Map<string, string>([
  ["gallica.bnf.fr", "BnF Gallica"],
  ["www.qdl.qa", "Qatar Digital Library"],
]);
const RIGHTS_HOSTS = new Set([
  "creativecommons.org",
  "www.creativecommons.org",
  "rightsstatements.org",
  "www.rightsstatements.org",
]);
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const MAX_REDIRECTS = 3;
export const MAX_MANIFEST_BYTES = 8 * 1024 * 1024;

export interface IiifSource {
  url: URL;
  provider: string;
}

export class IiifRequestError extends Error {
  constructor(
    readonly code: string,
    readonly httpStatus: number,
    readonly upstreamStatus?: number,
  ) {
    super(code);
    this.name = "IiifRequestError";
  }
}

function httpsUrl(raw: string, maxLength: number): URL | null {
  if (!raw || raw.length > maxLength) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    if (url.port && url.port !== "443") return null;
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

/** Exact-host allowlisting prevents both open-proxy use and lookalike domains. */
export function validatedIiifSource(raw: string): IiifSource | null {
  const url = httpsUrl(raw, 800);
  if (!url) return null;
  const provider = PROVIDERS.get(url.hostname.toLowerCase());
  return provider ? { url, provider } : null;
}

function resourceUrl(raw: string, source: IiifSource, rights = false): URL | null {
  const url = httpsUrl(raw, 4096);
  if (!url) return null;
  const host = url.hostname.toLowerCase();
  if (PROVIDERS.get(host) === source.provider) return url;
  return rights && RIGHTS_HOSTS.has(host) ? url : null;
}

/**
 * A manifest is active content: every URL the browser will later request or
 * open must pass the same HTTPS and exact-provider policy before it is cached.
 */
export function validateIiifManifestResources(
  manifest: IiifManifestSummary,
  source: IiifSource,
): IiifManifestSummary {
  for (const canvas of manifest.canvases) {
    if (canvas.imageService && !resourceUrl(canvas.imageService, source)) {
      throw new IiifRequestError("manifest_resource_not_allowed", 502);
    }
    if (canvas.imageUrl && !resourceUrl(canvas.imageUrl, source)) {
      throw new IiifRequestError("manifest_resource_not_allowed", 502);
    }
  }
  if (manifest.rights && !resourceUrl(manifest.rights, source, true)) {
    throw new IiifRequestError("manifest_rights_not_allowed", 502);
  }
  return manifest;
}

/** Read the streamed body incrementally; never buffer an unbounded response. */
export async function readResponseTextWithLimit(
  response: Response,
  maxBytes = MAX_MANIFEST_BYTES,
): Promise<string> {
  const declaredLength = Number(response.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    await response.body?.cancel().catch(() => undefined);
    throw new IiifRequestError("manifest_too_large", 413);
  }
  if (!response.body) throw new IiifRequestError("manifest_unavailable", 502);

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value?.byteLength) continue;
      if (total + value.byteLength > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new IiifRequestError("manifest_too_large", 413);
      }
      chunks.push(value);
      total += value.byteLength;
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, total).toString("utf8");
}

export async function fetchIiifManifestDocument(
  source: IiifSource,
  fetchImpl: typeof fetch = fetch,
): Promise<IiifManifestSummary> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  let current = source;
  try {
    for (let redirectCount = 0; ; redirectCount += 1) {
      const response = await fetchImpl(current.url, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          Accept: 'application/ld+json, application/json;q=0.9, application/ld+json;profile="http://iiif.io/api/presentation/3/context.json";q=0.8',
          "User-Agent": "YaRasoolAllah/0.1 IIIF Reader (https://github.com/daynightae-cmyk/YaRasoolAllah)",
        },
      });

      if (REDIRECT_STATUSES.has(response.status)) {
        await response.body?.cancel().catch(() => undefined);
        if (redirectCount >= MAX_REDIRECTS) {
          throw new IiifRequestError("too_many_redirects", 502);
        }
        const location = response.headers.get("location");
        if (!location) throw new IiifRequestError("provider_http_error", 502, response.status);
        const redirected = validatedIiifSource(new URL(location, current.url).toString());
        if (!redirected || redirected.provider !== source.provider) {
          throw new IiifRequestError("redirect_not_allowed", 502);
        }
        current = redirected;
        continue;
      }

      if (response.status === 403) {
        await response.body?.cancel().catch(() => undefined);
        throw new IiifRequestError("provider_blocked", 502, 403);
      }
      if (!response.ok) {
        await response.body?.cancel().catch(() => undefined);
        throw new IiifRequestError("provider_http_error", 502, response.status);
      }

      const text = await readResponseTextWithLimit(response);
      let payload: unknown;
      try {
        payload = JSON.parse(text);
      } catch {
        throw new IiifRequestError("manifest_invalid", 502);
      }
      let manifest: IiifManifestSummary;
      try {
        manifest = normalizeIiifManifest(payload);
      } catch {
        throw new IiifRequestError("manifest_invalid", 502);
      }
      return validateIiifManifestResources(manifest, source);
    }
  } finally {
    clearTimeout(timeout);
  }
}

const cache = new Map<string, {
  expiresAt: number;
  provider: string;
  manifest: IiifManifestSummary;
}>();

export interface IiifRouteOptions {
  fetchImpl?: typeof fetch;
}

export function registerIiifRoutes(app: Express, options: IiifRouteOptions = {}): void {
  const fetchImpl = options.fetchImpl ?? fetch;
  app.get("/api/content/iiif/manifest", async (req, res) => {
    const parsed = manifestUrlSchema.safeParse(req.query.url);
    if (!parsed.success) {
      return res.status(400).json({ code: "invalid_manifest_url", message: "رابط بيان IIIF غير صالح." });
    }
    const source = validatedIiifSource(parsed.data);
    if (!source) {
      return res.status(400).json({
        code: "provider_not_allowed",
        message: "يُقبل فقط رابط HTTPS من مزود IIIF معتمد.",
      });
    }

    const cacheKey = source.url.toString();
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return res.json({
        provider: cached.provider,
        availability: "external_iiif_manifest",
        cached: true,
        manifest: cached.manifest,
      });
    }

    try {
      const manifest = await fetchIiifManifestDocument(source, fetchImpl);
      if (cache.size >= 80) {
        const oldest = cache.keys().next().value;
        if (oldest) cache.delete(oldest);
      }
      cache.set(cacheKey, {
        expiresAt: Date.now() + 30 * 60_000,
        provider: source.provider,
        manifest,
      });
      return res.json({
        provider: source.provider,
        availability: "external_iiif_manifest",
        cached: false,
        manifest,
      });
    } catch (error) {
      const timedOut = error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
      const failure = error instanceof IiifRequestError
        ? error
        : new IiifRequestError(timedOut ? "provider_timeout" : "manifest_unavailable", timedOut ? 504 : 502);
      return res.status(failure.httpStatus).json({
        code: failure.code,
        provider: source.provider,
        message: "تعذر تجهيز المخطوط من المزود الآن. يمكن فتح المصدر الأصلي أو المحاولة لاحقًا.",
        ...(failure.upstreamStatus ? { upstreamStatus: failure.upstreamStatus } : {}),
      });
    }
  });
}
