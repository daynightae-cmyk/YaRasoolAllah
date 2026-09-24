import type { Express } from "express";
import { z } from "zod";

const reciterSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  moshaf: z.array(z.object({ name: z.string().min(1) }).passthrough()).optional(),
}).passthrough();
const responseSchema = z.object({ reciters: z.array(z.unknown()) });

interface ReciterSummary { id: number; name: string; reading: string | null }
const cache = new Map<number, { expiresAt: number; reciters: ReciterSummary[] }>();
let nextRequestAt = 0;

/** Browse provider metadata only. Never return stream URLs or claim cleared recordings. */
export function registerMp3QuranCatalogRoutes(app: Express) {
  app.get("/api/content/audio/reciters", async (req, res) => {
    const sura = z.coerce.number().int().min(1).max(114).safeParse(req.query.sura);
    if (!sura.success) return res.status(400).json({ message: "رقم السورة يجب أن يكون من 1 إلى 114." });

    const cached = cache.get(sura.data);
    if (cached && cached.expiresAt > Date.now()) {
      return res.json({ source: "MP3Quran", availability: "catalog_metadata_only", reciters: cached.reciters });
    }
    if (Date.now() < nextRequestAt) {
      return res.status(429).json({ message: "انتظر لحظة قبل إعادة البحث عن القراء." });
    }
    nextRequestAt = Date.now() + 1_500;

    const url = new URL("https://mp3quran.net/api/v3/reciters");
    url.searchParams.set("language", "ar");
    url.searchParams.set("sura", String(sura.data));

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(8_000), headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`MP3Quran HTTP ${response.status}`);
      const body = responseSchema.parse(await response.json());
      const reciters: ReciterSummary[] = body.reciters.flatMap((raw) => {
        const parsed = reciterSchema.safeParse(raw);
        if (!parsed.success) return [];
        return [{
          id: parsed.data.id,
          name: parsed.data.name.slice(0, 100),
          reading: parsed.data.moshaf?.[0]?.name.slice(0, 100) ?? null,
        }];
      }).slice(0, 12);
      cache.set(sura.data, { reciters, expiresAt: Date.now() + 60 * 60_000 });
      return res.json({ source: "MP3Quran", availability: "catalog_metadata_only", reciters });
    } catch {
      return res.status(503).json({ message: "فهرس القراء الخارجي غير متاح الآن." });
    }
  });
}
