import type { Express } from "express";
import { z } from "zod";

const moshafSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  server: z.string().url(),
  surah_total: z.number().int().min(1).max(114),
  surah_list: z.string().min(1),
}).passthrough();

const reciterSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  moshaf: z.array(moshafSchema).optional(),
}).passthrough();

const responseSchema = z.object({ reciters: z.array(z.unknown()) });

interface ReciterStream {
  id: number;
  name: string;
  reading: string;
  moshafId: number;
  surahTotal: number;
  streamUrl: string;
  attribution: "MP3Quran.net";
}

const cache = new Map<number, { expiresAt: number; reciters: ReciterStream[] }>();
let nextRequestAt = 0;

export function buildMp3QuranStreamUrl(server: string, sura: number): string | null {
  try {
    const url = new URL(server);
    if (url.protocol !== "https:") return null;
    if (url.hostname !== "mp3quran.net" && !url.hostname.endsWith(".mp3quran.net")) return null;
    if (!url.pathname.endsWith("/")) url.pathname += "/";
    url.pathname += `${String(sura).padStart(3, "0")}.mp3`;
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * MP3Quran provider-stream adapter.
 *
 * The provider publishes API v3 server bases/surah lists and states in its
 * copyright/privacy policy that visitors and developers may copy site
 * material or use site links. We stream the provider-hosted recording inside
 * the product; no audio bytes are re-hosted by YaRasoolAllah.
 */
export function registerMp3QuranCatalogRoutes(app: Express) {
  app.get("/api/content/audio/reciters", async (req, res) => {
    const sura = z.coerce.number().int().min(1).max(114).safeParse(req.query.sura);
    if (!sura.success) {
      return res.status(400).json({ message: "رقم السورة يجب أن يكون من 1 إلى 114." });
    }

    const cached = cache.get(sura.data);
    if (cached && cached.expiresAt > Date.now()) {
      return res.json({
        source: "MP3Quran.net",
        availability: "provider_streaming_cleared",
        rightsUrl: "https://www.mp3quran.net/ar/privacy",
        reciters: cached.reciters,
      });
    }

    if (Date.now() < nextRequestAt) {
      return res.status(429).json({ message: "انتظر لحظة قبل إعادة البحث عن القراء." });
    }
    nextRequestAt = Date.now() + 1_500;

    const url = new URL("https://mp3quran.net/api/v3/reciters");
    url.searchParams.set("language", "ar");
    url.searchParams.set("sura", String(sura.data));

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(8_000),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`MP3Quran HTTP ${response.status}`);

      const body = responseSchema.parse(await response.json());
      const reciters: ReciterStream[] = body.reciters.flatMap((raw) => {
        const parsed = reciterSchema.safeParse(raw);
        if (!parsed.success) return [];

        const matching = parsed.data.moshaf?.find((moshaf) => {
          const available = new Set(
            moshaf.surah_list
              .split(",")
              .map((value) => Number(value.trim()))
              .filter(Number.isFinite),
          );
          return available.has(sura.data);
        });
        if (!matching) return [];

        const streamUrl = buildMp3QuranStreamUrl(matching.server, sura.data);
        if (!streamUrl) return [];

        return [{
          id: parsed.data.id,
          name: parsed.data.name.slice(0, 100),
          reading: matching.name.slice(0, 120),
          moshafId: matching.id,
          surahTotal: matching.surah_total,
          streamUrl,
          attribution: "MP3Quran.net" as const,
        }];
      }).slice(0, 40);

      cache.set(sura.data, { reciters, expiresAt: Date.now() + 60 * 60_000 });
      return res.json({
        source: "MP3Quran.net",
        availability: "provider_streaming_cleared",
        rightsUrl: "https://www.mp3quran.net/ar/privacy",
        reciters,
      });
    } catch {
      return res.status(503).json({ message: "خدمة تلاوات MP3Quran غير متاحة الآن." });
    }
  });
}
