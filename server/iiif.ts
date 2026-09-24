import type { Express } from "express";
import { z } from "zod";
import { normalizeIiifManifest, type IiifManifestSummary } from "@shared/iiif";

const manifestUrlSchema = z.string().url().max(800);
const allowedHosts = new Map<string, string>([
  ["gallica.bnf.fr", "BnF Gallica"],
  ["www.qdl.qa", "Qatar Digital Library"],
]);

const cache = new Map<
  string,
  { expiresAt: number; provider: string; manifest: IiifManifestSummary }
>();
const MAX_MANIFEST_BYTES = 8 * 1024 * 1024;

function validatedSource(raw: string): {
  url: URL;
  provider: string;
} | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const provider = allowedHosts.get(url.hostname.toLowerCase());
  if (!provider) return null;
  if (url.username || url.password) return null;
  return { url, provider };
}

export function registerIiifRoutes(app: Express): void {
  app.get("/api/content/iiif/manifest", async (req, res) => {
    const parsed = manifestUrlSchema.safeParse(req.query.url);
    if (!parsed.success) {
      return res.status(400).json({
        code: "invalid_manifest_url",
        message: "رابط بيان IIIF غير صالح.",
      });
    }

    const source = validatedSource(parsed.data);
    if (!source) {
      return res.status(400).json({
        code: "provider_not_allowed",
        message: "هذا المضيف غير موجود في قائمة مزودي IIIF المعتمدين.",
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
      const response = await fetch(source.url, {
        signal: AbortSignal.timeout(10_000),
        headers: {
          Accept:
            'application/ld+json, application/json;q=0.9, application/ld+json;profile="http://iiif.io/api/presentation/3/context.json";q=0.8',
          "User-Agent":
            "YaRasoolAllah/0.1 IIIF Reader (https://github.com/daynightae-cmyk/YaRasoolAllah)",
        },
      });

      if (response.status === 403) {
        return res.status(502).json({
          code: "provider_blocked",
          provider: source.provider,
          message:
            "المزوّد منع طلب الخادم لهذه النسخة. افتح المصدر الأصلي أو جرّب لاحقًا.",
        });
      }
      if (!response.ok) {
        return res.status(502).json({
          code: "provider_http_error",
          provider: source.provider,
          message: "تعذر جلب بيان IIIF من المزوّد.",
          upstreamStatus: response.status,
        });
      }

      const declaredLength = Number(response.headers.get("content-length") ?? 0);
      if (declaredLength > MAX_MANIFEST_BYTES) {
        return res.status(413).json({
          code: "manifest_too_large",
          message: "بيان IIIF أكبر من الحد المسموح للقارئ.",
        });
      }

      const text = await response.text();
      if (Buffer.byteLength(text, "utf8") > MAX_MANIFEST_BYTES) {
        return res.status(413).json({
          code: "manifest_too_large",
          message: "بيان IIIF أكبر من الحد المسموح للقارئ.",
        });
      }

      const payload = JSON.parse(text) as unknown;
      const manifest = normalizeIiifManifest(payload);

      if (cache.size > 80) cache.clear();
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
      const message =
        error instanceof Error && error.message.includes("IIIF")
          ? error.message
          : "تعذر تجهيز المخطوط الآن.";
      return res.status(502).json({
        code: "manifest_unavailable",
        provider: source.provider,
        message,
      });
    }
  });
}
