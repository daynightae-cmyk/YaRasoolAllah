import type { Express } from "express";
import { z } from "zod";

const querySchema = z.string().trim().min(2).max(90);
const itemSchema = z.object({
    key: z.string(),
    title: z.string(),
    author_name: z.array(z.string()).optional(),
    first_publish_year: z.number().optional(),
}).passthrough();
const responseSchema = z.object({ docs: z.array(z.unknown()) });

interface CatalogItem {
  workId: string;
  title: string;
  author: string | null;
  firstPublishYear: number | null;
  canonicalUrl: string;
}

const cache = new Map<string, { expiresAt: number; items: CatalogItem[] }>();
let nextRequestAt = 0;

function normalizeWorkId(key: string): string | null {
  const id = key.replace(/^\/works\//, "");
  return /^OL\d+W$/.test(id) ? id : null;
}

/** Only work-level metadata; no text, edition license, or readable-book claim. */
export function registerOpenLibraryRoutes(app: Express) {
  app.get("/api/content/library/search", async (req, res) => {
    const parsed = querySchema.safeParse(req.query.q);
    if (!parsed.success) return res.status(400).json({ message: "أدخل عنوانًا من حرفين إلى 90 حرفًا." });

    const query = parsed.data;
    const cacheKey = query.toLocaleLowerCase();
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return res.json({ source: "Open Library", availability: "catalog_metadata_only", items: cached.items });
    }

    // Open Library asks anonymous clients to stay within one request/second.
    // A busy deployment should use a shared limiter instead of per-process memory.
    if (Date.now() < nextRequestAt) {
      return res.status(429).json({ message: "انتظر ثانية قبل البحث في الفهرس الخارجي." });
    }
    nextRequestAt = Date.now() + 1_100;

    const url = new URL("https://openlibrary.org/search.json");
    url.searchParams.set("q", query);
    url.searchParams.set("fields", "key,title,author_name,first_publish_year");
    url.searchParams.set("limit", "8");
    url.searchParams.set("lang", "ar");

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(7_000),
        headers: { Accept: "application/json", "User-Agent": "YaRasoolAllah/0.1 (https://github.com/daynightae-cmyk/YaRasoolAllah)" },
      });
      if (!response.ok) throw new Error(`Open Library HTTP ${response.status}`);
      const data = responseSchema.parse(await response.json());
      const items: CatalogItem[] = data.docs.flatMap((raw) => {
        const parsedDoc = itemSchema.safeParse(raw);
        if (!parsedDoc.success) return [];
        const doc = parsedDoc.data;
        const workId = normalizeWorkId(doc.key);
        if (!workId) return [];
        return [{
          workId,
          title: doc.title.slice(0, 200),
          author: doc.author_name?.[0]?.slice(0, 120) ?? null,
          firstPublishYear: doc.first_publish_year ?? null,
          canonicalUrl: `https://openlibrary.org/works/${workId}`,
        }];
      });
      if (cache.size > 150) cache.clear();
      cache.set(cacheKey, { items, expiresAt: Date.now() + 15 * 60_000 });
      return res.json({ source: "Open Library", availability: "catalog_metadata_only", items });
    } catch {
      return res.status(503).json({ message: "الفهرس الخارجي غير متاح الآن؛ الرفوف المحلية باقية." });
    }
  });
}
