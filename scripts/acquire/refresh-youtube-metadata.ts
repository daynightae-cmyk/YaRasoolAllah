import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseCsv } from "./ingest-media-catalog";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const acquisition = resolve(root, "data-sources/media/acquisition");
const reportPath = resolve(root, "artifacts/evidence/media-metadata-refresh-20261126.json");
const write = process.argv.includes("--write");
const checkedAt = "2026-11-26";
const catalogNames = ["seerah-media-catalog", "kids-media-catalog"] as const;

type CsvRow = Record<string, string> & { __sourceLine: number };
type JsonRecord = Record<string, unknown> & { video_id?: string };
type OEmbed = {
  title?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_url?: string;
  provider_name?: string;
};
type Change = {
  videoId: string;
  catalog: string;
  status: "updated" | "unchanged" | "unavailable" | "blocked";
  httpStatus?: number;
  changes?: Record<string, { before: unknown; after: unknown }>;
  error?: string;
};

function oEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`;
}

function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function writeCsv(path: string, header: string[], rows: CsvRow[]): void {
  const lines = rows.map((row) => header.map((field) => csvCell(row[field] ?? "")).join(","));
  writeFileSync(path, `\uFEFF${header.join(",")}\n${lines.join("\n")}\n`, "utf8");
}

function readCsv(path: string): { header: string[]; rows: CsvRow[] } {
  return parseCsv(readFileSync(path, "utf8"), path) as { header: string[]; rows: CsvRow[] };
}

function containsArabic(value: string): boolean {
  return /[\u0600-\u06ff]/.test(value);
}

function evidence(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item))
    : typeof value === "string"
      ? value.split("|").map((item) => item.trim()).filter(Boolean)
      : [];
}

async function fetchMetadata(videoId: string): Promise<{ metadata?: OEmbed; status: number; error?: string }> {
  const endpoint = oEmbedUrl(videoId);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        headers: { Accept: "application/json", "User-Agent": "YaRasoolAllah-Metadata-Refresh/1.0" },
        signal: AbortSignal.timeout(15_000),
      });
      if (response.ok) {
        const metadata = await response.json() as OEmbed;
        if (metadata.provider_name !== "YouTube" || !metadata.title || !metadata.author_name) {
          return { status: response.status, error: "Incomplete YouTube oEmbed response" };
        }
        return { metadata, status: response.status };
      }
      if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 2) {
        return { status: response.status, error: `YouTube oEmbed HTTP ${response.status}` };
      }
      const retryAfter = Number(response.headers.get("retry-after"));
      const delay = Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter * 1000, 5000)
        : 500 * (attempt + 1);
      await new Promise((resolveDelay) => setTimeout(resolveDelay, delay));
    } catch (error) {
      if (attempt === 2) return { status: 0, error: error instanceof Error ? error.message : String(error) };
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 500 * (attempt + 1)));
    }
  }
  return { status: 0, error: "Unreachable retry state" };
}

async function mapBounded<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const output = new Array<R>(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      output[index] = await worker(items[index]);
    }
  }));
  return output;
}

function applyMetadata(row: CsvRow, metadata: OEmbed, endpoint: string): Record<string, { before: unknown; after: unknown }> {
  const changes: Record<string, { before: unknown; after: unknown }> = {};
  const oldOriginal = row.title_original ?? "";
  const oldArabic = row.title_ar ?? "";
  const next: Record<string, string> = {
    title_original: metadata.title!,
    title_ar: containsArabic(metadata.title!) || !oldArabic || oldArabic === oldOriginal
      ? metadata.title!
      : oldArabic,
    channel_name: metadata.author_name!,
    channel_url: metadata.author_url ?? row.channel_url ?? "",
    thumbnail_url: metadata.thumbnail_url ?? row.thumbnail_url ?? "",
    source_checked_at: checkedAt,
    verification_method: row.verification_method?.includes(`YouTube oEmbed metadata refreshed ${checkedAt}`)
      ? row.verification_method
      : `${row.verification_method ? `${row.verification_method}; ` : ""}YouTube oEmbed metadata refreshed ${checkedAt}; not a copyright or runtime-embed approval`,
    verification_evidence_urls: [...new Set([
      ...evidence(row.verification_evidence_urls),
      endpoint,
      ...(metadata.author_url ? [metadata.author_url] : []),
    ])].join("|"),
  };
  for (const [field, value] of Object.entries(next)) {
    if ((row[field] ?? "") !== value) {
      changes[field] = { before: row[field] ?? null, after: value };
      row[field] = value;
    }
  }
  return changes;
}

async function main(): Promise<void> {
  const catalogs = catalogNames.map((name) => {
    const csvPath = resolve(acquisition, `${name}.csv`);
    const jsonPath = resolve(acquisition, `${name}.json`);
    const csv = readCsv(csvPath);
    const json = JSON.parse(readFileSync(jsonPath, "utf8")) as { records: JsonRecord[]; record_count?: number };
    return { name, csvPath, jsonPath, csv, json };
  });
  const pendingPath = resolve(acquisition, "media-rejected-and-pending.csv");
  const ledgerPath = resolve(acquisition, "media-rights-ledger.csv");
  const pending = readCsv(pendingPath);
  const ledger = readCsv(ledgerPath);
  const rowEntries = catalogs.flatMap((catalog) => catalog.csv.rows.map((row) => ({ catalog, row })));
  const changes = await mapBounded(rowEntries, 3, async ({ catalog, row }): Promise<Change> => {
    const videoId = row.video_id;
    if (!videoId) return { videoId: "", catalog: catalog.name, status: "unavailable", error: "Missing video ID" };
    const endpoint = oEmbedUrl(videoId);
    const result = await fetchMetadata(videoId);
    if (!result.metadata) {
      const providerStatus = [401, 403].includes(result.status)
        ? "PROVIDER_REFUSED"
        : result.status === 404
          ? "UNAVAILABLE"
          : null;
      if (write && providerStatus) {
        const beforeStatus = row.embedding_status;
        const verificationNote = `YouTube oEmbed HTTP ${result.status} on ${checkedAt}; provider playback candidate blocked pending a new explicit technical check`;
        row.embedding_status = providerStatus;
        row.source_checked_at = checkedAt;
        row.verification_method = row.verification_method?.includes(verificationNote)
          ? row.verification_method
          : `${row.verification_method ? `${row.verification_method}; ` : ""}${verificationNote}`;
        row.verification_evidence_urls = [...new Set([...evidence(row.verification_evidence_urls), endpoint])].join("|");
        const jsonRecord = catalog.json.records.find((record) => record.video_id === videoId);
        if (jsonRecord) {
          jsonRecord.embedding_status = providerStatus;
          jsonRecord.source_checked_at = checkedAt;
          jsonRecord.verification_method = row.verification_method;
          jsonRecord.verification_evidence_urls = evidence(row.verification_evidence_urls);
        }
        for (const item of ledger.rows.filter((entry) => entry.video_id === videoId)) {
          item.embedding_status = providerStatus;
        }
        return {
          videoId,
          catalog: catalog.name,
          status: "blocked",
          httpStatus: result.status,
          error: result.error,
          changes: { embedding_status: { before: beforeStatus, after: providerStatus } },
        };
      }
      return { videoId, catalog: catalog.name, status: "unavailable", httpStatus: result.status, error: result.error };
    }
    const before = { ...row };
    const rowChanges = applyMetadata(row, result.metadata, endpoint);
    const jsonRecord = catalog.json.records.find((record) => record.video_id === videoId);
    if (jsonRecord) {
      for (const field of Object.keys(rowChanges)) {
        if (field === "verification_evidence_urls") jsonRecord[field] = row[field].split("|").filter(Boolean);
        else jsonRecord[field] = row[field] || null;
      }
    }
    for (const item of pending.rows.filter((entry) => entry.video_id === videoId)) {
      item.title_original = row.title_original;
    }
    for (const item of ledger.rows.filter((entry) => entry.video_id === videoId)) {
      item.channel_name = row.channel_name;
    }
    return {
      videoId,
      catalog: catalog.name,
      status: Object.keys(rowChanges).length ? "updated" : "unchanged",
      httpStatus: result.status,
      changes: Object.fromEntries(Object.entries(rowChanges).map(([field, change]) => [field, {
        before: field === "verification_evidence_urls" ? before[field] : change.before,
        after: change.after,
      }])),
    };
  });

  const summary = {
    checkedAt,
    provider: "YouTube oEmbed",
    write,
    total: changes.length,
    updated: changes.filter((change) => change.status === "updated").length,
    unchanged: changes.filter((change) => change.status === "unchanged").length,
    unavailable: changes.filter((change) => change.status === "unavailable").length,
    blocked: changes.filter((change) => change.status === "blocked").length,
    note: "Metadata verification only. No rights, editorial, religious, publication, age-safety, or embedding approval is inferred.",
  };

  if (write) {
    for (const catalog of catalogs) {
      writeCsv(catalog.csvPath, catalog.csv.header, catalog.csv.rows);
      writeFileSync(catalog.jsonPath, `${JSON.stringify(catalog.json, null, 2)}\n`, "utf8");
    }
    writeCsv(pendingPath, pending.header, pending.rows);
    writeCsv(ledgerPath, ledger.header, ledger.rows);
  }
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify({ summary, changes }, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ ...summary, report: reportPath }, null, 2));
  for (const change of changes.filter((item) => item.status === "unavailable" || item.status === "blocked")) {
    console.log(`${change.status.toUpperCase()} ${change.videoId}: ${change.error}`);
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (invokedPath === import.meta.url) {
  await main();
}
