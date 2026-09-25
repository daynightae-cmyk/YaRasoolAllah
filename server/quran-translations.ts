import type { Express } from "express";
import { z } from "zod";
import { evaluateResourceUsage } from "../shared/source-governance.js";
import { getGovernanceRecord } from "../shared/source-registry.js";

export const QURAN_TRANSLATION_EDITIONS = {
  en: { edition: "en.sahih", translator: "Saheeh International", direction: "ltr" },
  fr: { edition: "fr.hamidullah", translator: "Muhammad Hamidullah", direction: "ltr" },
  ur: { edition: "ur.jalandhry", translator: "Fateh Muhammad Jalandhry", direction: "rtl" },
} as const;

export type QuranTranslationLanguage = keyof typeof QURAN_TRANSLATION_EDITIONS;

const querySchema = z.object({
  surah: z.coerce.number().int().min(1).max(114),
  language: z.enum(["en", "fr", "ur"]),
});

const providerResponseSchema = z.object({
  code: z.number(),
  status: z.string(),
  data: z.object({
    number: z.number().int(),
    ayahs: z.array(z.object({
      numberInSurah: z.number().int().positive(),
      text: z.string().min(1),
    })),
  }).passthrough(),
}).passthrough();

export function buildTranslationRequestUrl(
  surah: number,
  language: QuranTranslationLanguage,
): string | null {
  if (!Number.isInteger(surah) || surah < 1 || surah > 114) return null;
  const edition = QURAN_TRANSLATION_EDITIONS[language];
  if (!edition) return null;
  return `https://api.alquran.cloud/v1/surah/${surah}/${edition.edition}`;
}

export function registerQuranTranslationRoutes(app: Express) {
  app.get("/api/content/quran/translations", async (req, res) => {
    const query = querySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({
        message: "يجب اختيار سورة من 1 إلى 114 ولغة ترجمة مدعومة: en أو fr أو ur.",
      });
    }

    const governance = getGovernanceRecord("resource-alquran-cloud-translations");
    if (!governance) {
      return res.status(503).json({ message: "سجل حوكمة ترجمة القرآن غير متاح." });
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

    const config = QURAN_TRANSLATION_EDITIONS[query.data.language];
    const url = buildTranslationRequestUrl(query.data.surah, query.data.language);
    if (!url) return res.status(400).json({ message: "طلب الترجمة غير صالح." });

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(8_000),
        headers: {
          Accept: "application/json",
          "User-Agent": "YaRasoolAllah/1.0 Quran translation proxy",
        },
      });
      if (!response.ok) throw new Error(`AlQuran Cloud HTTP ${response.status}`);

      const parsed = providerResponseSchema.safeParse(await response.json());
      if (!parsed.success || parsed.data.code !== 200 || parsed.data.status !== "OK") {
        throw new Error("Unexpected translation provider response");
      }

      return res.json({
        source: "AlQuran Cloud / Islamic Network",
        edition: config.edition,
        translator: config.translator,
        language: query.data.language,
        direction: config.direction,
        attribution: `Translation: ${config.translator} via AlQuran Cloud`,
        rightsUrl: governance.rights.licenseUrl,
        ayahs: parsed.data.data.ayahs.map((ayah) => ({
          ayah: ayah.numberInSurah,
          text: ayah.text,
        })),
      });
    } catch {
      return res.status(503).json({
        message: "تعذر جلب ترجمة السورة الآن. يظل النص العربي المحلي متاحًا دون تغيير.",
      });
    }
  });
}
