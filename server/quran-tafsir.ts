import type { Express } from "express";
import { z } from "zod";
import { evaluateResourceUsage } from "../shared/source-governance.js";
import { getGovernanceRecord } from "../shared/source-registry.js";

export const QURANENC_TAFSIR_KEY = "arabic_moyassar";
const QURANENC_API = "https://quranenc.com/api/v1";

const querySchema = z.object({
  surah: z.coerce.number().int().min(1).max(114),
});

const tafsirRowSchema = z.object({
  sura: z.coerce.number().int().min(1).max(114),
  aya: z.coerce.number().int().positive(),
  translation: z.string().min(1),
  footnotes: z.string().nullable().optional(),
}).passthrough();

const metadataRowSchema = z.object({
  key: z.string().min(1),
  language_iso_code: z.string().optional(),
  version: z.union([z.string(), z.number()]).transform(String),
  last_update: z.union([z.string(), z.number()]).transform(String),
  title: z.string().optional(),
  description: z.string().optional(),
}).passthrough();

function unwrapArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  if (Array.isArray(record.result)) return record.result;
  if (Array.isArray(record.translations)) return record.translations;
  if (Array.isArray(record.data)) return record.data;
  return [];
}

export function buildQuranEncTafsirUrl(surah: number): string | null {
  if (!Number.isInteger(surah) || surah < 1 || surah > 114) return null;
  return `${QURANENC_API}/translation/sura/${QURANENC_TAFSIR_KEY}/${surah}`;
}

export function parseQuranEncTafsirPayload(value: unknown) {
  const parsed = z.array(tafsirRowSchema).safeParse(unwrapArray(value));
  return parsed.success ? parsed.data : null;
}

export function parseQuranEncMetadata(value: unknown) {
  const parsed = z.array(metadataRowSchema).safeParse(unwrapArray(value));
  if (!parsed.success) return null;
  return parsed.data.find((item) => item.key === QURANENC_TAFSIR_KEY) ?? null;
}

export function registerQuranTafsirRoutes(app: Express) {
  app.get("/api/content/quran/tafsir", async (req, res) => {
    const query = querySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ message: "يجب اختيار سورة من 1 إلى 114." });
    }

    const governance = getGovernanceRecord("resource-quranenc-muyassar-tafsir");
    if (!governance) {
      return res.status(503).json({ message: "سجل حوكمة التفسير غير متاح." });
    }

    const gate = evaluateResourceUsage(
      governance.resource,
      governance.rights,
      "api_access",
      app.get("env") === "production" ? "production" : "development",
    );
    if (!gate.allowed) {
      return res.status(503).json({ message: gate.reason });
    }

    const tafsirUrl = buildQuranEncTafsirUrl(query.data.surah);
    if (!tafsirUrl) return res.status(400).json({ message: "طلب التفسير غير صالح." });

    try {
      const headers = {
        Accept: "application/json",
        "User-Agent": "YaRasoolAllah/1.0 QuranEnc tafsir proxy",
      };
      const [tafsirResponse, metadataResponse] = await Promise.all([
        fetch(tafsirUrl, {
          signal: AbortSignal.timeout(8_000),
          headers,
          cache: "no-store",
        }),
        fetch(`${QURANENC_API}/translations/list/ar?localization=ar`, {
          signal: AbortSignal.timeout(8_000),
          headers,
          cache: "no-store",
        }),
      ]);

      if (!tafsirResponse.ok || !metadataResponse.ok) {
        throw new Error(
          `QuranEnc HTTP tafsir=${tafsirResponse.status} metadata=${metadataResponse.status}`,
        );
      }

      const tafsir = parseQuranEncTafsirPayload(await tafsirResponse.json());
      const metadata = parseQuranEncMetadata(await metadataResponse.json());
      if (!tafsir?.length || !metadata?.version || !metadata.last_update) {
        throw new Error("Unexpected QuranEnc response");
      }

      return res.json({
        source: "QuranEnc.com",
        edition: QURANENC_TAFSIR_KEY,
        title: metadata.title || "التفسير الميسر",
        version: metadata.version,
        lastUpdate: metadata.last_update,
        attribution: `QuranEnc.com · ${metadata.title || "التفسير الميسر"} · الإصدار ${metadata.version}`,
        rightsUrl: governance.rights.licenseUrl,
        ayahs: tafsir
          .filter((item) => item.sura === query.data.surah)
          .map((item) => ({
            ayah: item.aya,
            text: item.translation,
            footnotes: item.footnotes || null,
          })),
      });
    } catch {
      return res.status(503).json({
        message: "تعذر جلب التفسير الميسر الآن. يظل النص القرآني المحلي متاحًا دون تغيير.",
      });
    }
  });
}
