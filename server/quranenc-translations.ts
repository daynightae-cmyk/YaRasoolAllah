import type { Express } from "express";
import { z } from "zod";

export const QURANENC_TRANSLATIONS = {
  english_rwwad: {
    key: "english_rwwad",
    language: "en",
    label: "English · Rowwad Translation Center",
    direction: "ltr" as const,
    version: "1.0.19",
  },
  urdu_junagarhi: {
    key: "urdu_junagarhi",
    language: "ur",
    label: "اردو · محمد ابراہیم جوناگڑھی",
    direction: "rtl" as const,
    version: "1.1.3",
  },
} as const;

export type QuranEncTranslationKey = keyof typeof QURANENC_TRANSLATIONS;

const requestSchema = z.object({
  sura: z.coerce.number().int().min(1).max(114),
  translation: z.enum(["english_rwwad", "urdu_junagarhi"]),
});

const verseSchema = z.object({
  sura: z.coerce.number().int().min(1).max(114),
  aya: z.coerce.number().int().min(1),
  translation: z.string(),
  footnotes: z.union([z.string(), z.array(z.unknown()), z.record(z.unknown()), z.null()]).optional(),
}).passthrough();

const responseSchema = z.union([
  z.array(verseSchema),
  z.object({ result: z.array(verseSchema) }),
]);

interface CachedTranslation {
  expiresAt: number;
  payload: {
    provider: "QuranEnc.com";
    translation: typeof QURANENC_TRANSLATIONS[QuranEncTranslationKey];
    termsUrl: string;
    verses: Array<{
      sura: number;
      aya: number;
      translation: string;
      footnotes: unknown;
    }>;
  };
}

const cache = new Map<string, CachedTranslation>();
let nextRequestAt = 0;

function normalizeFootnotes(value: unknown): unknown {
  if (value == null || typeof value === "string") return value;
  if (Array.isArray(value)) return value.slice(0, 50);
  if (typeof value === "object") return value;
  return null;
}

export function registerQuranEncTranslationRoutes(app: Express) {
  app.get("/api/content/quran/translation", async (req, res) => {
    const parsed = requestSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        message: "حدد سورة من 1 إلى 114 وترجمة معتمدة داخل المنصة.",
      });
    }

    const key = `${parsed.data.translation}:${parsed.data.sura}`;
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return res.json(cached.payload);
    }

    if (Date.now() < nextRequestAt) {
      return res.status(429).json({ message: "انتظر لحظة قبل إعادة طلب الترجمة." });
    }
    nextRequestAt = Date.now() + 900;

    const translation = QURANENC_TRANSLATIONS[parsed.data.translation];
    const url = new URL(
      `https://quranenc.com/api/v1/translation/sura/${translation.key}/${parsed.data.sura}`,
    );

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(10_000),
        headers: {
          Accept: "application/json",
          "User-Agent": "YaRasoolAllah/1.0 (+https://yarasoolallah.it.com)",
        },
      });
      if (!response.ok) throw new Error(`QuranEnc HTTP ${response.status}`);

      const body = responseSchema.parse(await response.json());
      const rows = Array.isArray(body) ? body : body.result;
      const verses = rows
        .filter((row) => row.sura === parsed.data.sura)
        .sort((a, b) => a.aya - b.aya)
        .map((row) => ({
          sura: row.sura,
          aya: row.aya,
          translation: row.translation,
          footnotes: normalizeFootnotes(row.footnotes),
        }));

      const payload = {
        provider: "QuranEnc.com" as const,
        translation,
        termsUrl: "https://quranenc.com/en/home/api",
        verses,
      };
      cache.set(key, { expiresAt: Date.now() + 24 * 60 * 60_000, payload });
      return res.json(payload);
    } catch {
      return res.status(503).json({
        message: "تعذر تحميل ترجمة QuranEnc الآن. يبقى النص العربي المحلي متاحًا دون تأثر.",
      });
    }
  });
}
