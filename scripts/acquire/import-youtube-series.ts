import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsv } from "./ingest-media-catalog";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const acquisition = resolve(root, "data-sources/media/acquisition");
const pendingPath = resolve(acquisition, "media-rejected-and-pending.csv");
const ledgerPath = resolve(acquisition, "media-rights-ledger.csv");
const manifestPath = resolve(acquisition, "media-acquisition-manifest.json");
const write = process.argv.includes("--write");

type TargetKey = "seerah" | "kids";
type Target = {
  key: TargetKey;
  registryPath: string;
  catalogCsvPath: string;
  catalogJsonPath: string;
  otherCatalogCsvPath: string;
  reportPath: string;
  ledgerCatalog: string;
  defaultContentType: string;
  defaultLanguage: string;
  verificationMethod: string;
  note: string;
  pendingNextAction: string;
  rightsAction: string;
};

function targetFromArgv(): Target {
  const flagIndex = process.argv.indexOf("--target");
  const key: TargetKey = flagIndex >= 0 && process.argv[flagIndex + 1] === "kids" ? "kids" : "seerah";
  if (key === "kids") {
    return {
      key,
      registryPath: resolve(acquisition, "kids-media-series-registry.json"),
      catalogCsvPath: resolve(acquisition, "kids-media-catalog.csv"),
      catalogJsonPath: resolve(acquisition, "kids-media-catalog.json"),
      otherCatalogCsvPath: resolve(acquisition, "seerah-media-catalog.csv"),
      reportPath: resolve(root, "artifacts/evidence/kids-media-series-import-20261127.json"),
      ledgerCatalog: "kids",
      defaultContentType: "animation_episode",
      defaultLanguage: "en",
      verificationMethod:
        "yt-dlp flat publisher playlist enumeration (governed kids publisher); metadata only, not a copyright, age-safety, depiction, or runtime-embed approval",
      note: "الفيديو مدرج بمعرّفه في قائمة معلنة للقناة المطابقة، ويبقى مرشحًا بانتظار مراجعة المحتوى والتصوير والفئة العمرية والحقوق على مستوى الفيديو؛ لا يُستنتج ترخيص أو موافقة من الإدراج.",
      pendingNextAction:
        "verify content, depiction, age band and rights per item, test official embed, then approval gate",
      rightsAction:
        "راجع محتوى الفيديو وتصويره وفئته العمرية وحقوقه قبل أي اعتماد؛ لا يُستنتج ترخيص من مشغل المصدر",
    };
  }
  return {
    key,
    registryPath: resolve(acquisition, "media-series-registry.json"),
    catalogCsvPath: resolve(acquisition, "seerah-media-catalog.csv"),
    catalogJsonPath: resolve(acquisition, "seerah-media-catalog.json"),
    otherCatalogCsvPath: resolve(acquisition, "kids-media-catalog.csv"),
    reportPath: resolve(root, "artifacts/evidence/media-series-import-20261126.json"),
    ledgerCatalog: "seerah",
    defaultContentType: "lecture_series",
    defaultLanguage: "ar",
    verificationMethod:
      "yt-dlp flat publisher playlist enumeration; metadata only, not a copyright or runtime-embed approval",
    note: "الفيديو مدرج بمعرفه في قائمة معلنة بالقناة المطابقة. التحقق من بيانات القائمة لا يثبت المراجعة الدينية أو التحريرية أو الترخيص أو إمكانية التضمين وقت التشغيل.",
    pendingNextAction: "verify rights, review content, test official embed, then approval gate",
    rightsAction: "راجع الحقوق والمحتوى والتضمين قبل أي اعتماد تحريري؛ لا يُستنتج ترخيص من مشغل المصدر",
  };
}

const target = targetFromArgv();
const registryPath = target.registryPath;
const catalogCsvPath = target.catalogCsvPath;
const catalogJsonPath = target.catalogJsonPath;
const reportPath = target.reportPath;

type CsvRow = Record<string, string> & { __sourceLine: number };
type PlaylistDefinition = {
  id: string;
  series_name: string;
  category: string;
  subcategory: string;
  content_type?: string;
};
type PublisherDefinition = {
  channel_id: string;
  channel_name: string;
  channel_url: string;
  publisher_status: string;
  speaker: string;
  runtime_policy?: string;
  governance_publisher_id?: string;
  playlists: PlaylistDefinition[];
};
type Registry = { checked_at: string; publishers: PublisherDefinition[] };
type PlaylistEntry = {
  id?: string;
  title?: string;
  duration?: number | null;
  channel_id?: string;
  channel?: string;
  channel_url?: string;
  availability?: string | null;
};
type PlaylistPayload = {
  id?: string;
  title?: string;
  channel_id?: string;
  channel?: string;
  channel_url?: string;
  entries?: PlaylistEntry[];
};
type ImportItem = {
  publisher: PublisherDefinition;
  playlist: PlaylistDefinition;
  entry: PlaylistEntry;
  episodeNumber: number;
};

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

function fetchPlaylist(url: string): Promise<PlaylistPayload> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn("python", [
      "-m", "yt_dlp",
      "--flat-playlist",
      "--dump-single-json",
      "--skip-download",
      "--no-warnings",
      "--socket-timeout", "25",
      "--retries", "3",
      url,
    ], {
      cwd: root,
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      windowsHide: true,
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    const timeout = setTimeout(() => child.kill(), 120_000);
    child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timeout);
      const output = Buffer.concat(stdout).toString("utf8").replace(/^\uFEFF/, "").trim();
      const errors = Buffer.concat(stderr).toString("utf8").trim();
      if (code !== 0 || !output) {
        reject(new Error(`yt-dlp exited ${code ?? "unknown"}: ${errors.slice(-1200) || "empty playlist response"}`));
        return;
      }
      try {
        resolvePromise(JSON.parse(output) as PlaylistPayload);
      } catch (error) {
        reject(new Error(`Invalid yt-dlp JSON: ${error instanceof Error ? error.message : String(error)}`));
      }
    });
  });
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

function evidence(row: CsvRow): string[] {
  return (row.verification_evidence_urls ?? "").split("|").map((item) => item.trim()).filter(Boolean);
}

function numberCell(value: number | null): string {
  return value !== null && Number.isFinite(value) && value > 0 ? String(Math.round(value)) : "";
}

function main() {
  return (async () => {
    const registry = JSON.parse(readFileSync(registryPath, "utf8")) as Registry;
    const catalog = readCsv(catalogCsvPath);
    const pending = readCsv(pendingPath);
    const ledger = readCsv(ledgerPath);
    const acquisitionManifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Record<string, unknown> & {
      counts: Record<string, number>;
      files: string[];
    };
    const jobs = registry.publishers.flatMap((publisher) => publisher.playlists.map((playlist) => ({ publisher, playlist })));
    const playlistReports = await mapBounded(jobs, 2, async ({ publisher, playlist }) => {
      const url = `https://www.youtube.com/playlist?list=${encodeURIComponent(playlist.id)}`;
      try {
        const payload = await fetchPlaylist(url);
        if (payload.channel_id !== publisher.channel_id) {
          throw new Error(`Playlist channel mismatch: expected ${publisher.channel_id}, received ${payload.channel_id ?? "missing"}`);
        }
        if (!payload.entries?.length) throw new Error("Playlist contains no public flat-playlist entries");
        const items: ImportItem[] = [];
        const excluded: Array<{ id?: string; title?: string; reason: string }> = [];
        payload.entries.forEach((entry, index) => {
          const title = entry.title?.trim() ?? "";
          if (!entry.id || !/^[A-Za-z0-9_-]{11}$/.test(entry.id)) {
            excluded.push({ id: entry.id, title, reason: "missing_or_invalid_video_id" });
          } else if (entry.channel_id !== publisher.channel_id) {
            excluded.push({ id: entry.id, title, reason: `cross_channel:${entry.channel_id ?? "missing"}` });
          } else if (["private", "unavailable", "deleted"].includes(entry.availability ?? "") || /^\[(Private|Deleted) video\]$/i.test(title)) {
            excluded.push({ id: entry.id, title, reason: `unavailable:${entry.availability ?? "title"}` });
          } else if (!title) {
            excluded.push({ id: entry.id, title, reason: "missing_title" });
          } else {
            items.push({ publisher, playlist, entry, episodeNumber: index + 1 });
          }
        });
        return {
          playlistId: playlist.id,
          seriesName: playlist.series_name,
          providerTitle: payload.title ?? null,
          url,
          status: "fetched" as const,
          listed: payload.entries.length,
          eligible: items.length,
          excluded,
          items,
        };
      } catch (error) {
        return {
          playlistId: playlist.id,
          seriesName: playlist.series_name,
          url,
          status: "failed" as const,
          listed: 0,
          eligible: 0,
          excluded: [],
          items: [] as ImportItem[],
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });

    const failures = playlistReports.filter((report) => report.status === "failed");
    const existingByVideo = new Map(catalog.rows.filter((row) => row.video_id).map((row) => [row.video_id, row]));
    const seen = new Set<string>();
    const added: CsvRow[] = [];
    const updated: Array<{ videoId: string; playlistId: string }> = [];
    const duplicates: Array<{ videoId: string; playlistId: string }> = [];
    const reportItems: Array<Record<string, unknown>> = [];

    for (const report of playlistReports) {
      for (const item of report.items) {
        const videoId = item.entry.id!;
        const playlistUrl = report.url;
        if (seen.has(videoId)) {
          duplicates.push({ videoId, playlistId: item.playlist.id });
          continue;
        }
        seen.add(videoId);
        const officialUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        const existing = existingByVideo.get(videoId);
        if (existing) {
          existing.channel_id = item.publisher.channel_id;
          existing.channel_name = item.publisher.channel_name;
          existing.channel_url = item.publisher.channel_url;
          if (existing.publisher_status === "UNKNOWN" && item.publisher.publisher_status !== "UNKNOWN") {
            existing.publisher_status = item.publisher.publisher_status;
          }
          existing.series_name ||= item.playlist.series_name;
          existing.playlist_id ||= item.playlist.id;
          existing.episode_number ||= String(item.episodeNumber);
          existing.duration_seconds ||= numberCell(item.entry.duration ?? null);
          existing.category ||= item.playlist.category;
          existing.subcategory ||= item.playlist.subcategory;
          existing.speaker ||= item.publisher.speaker;
          existing.language ||= target.defaultLanguage;
          existing.content_type ||= item.playlist.content_type ?? target.defaultContentType;
          existing.thumbnail_url ||= `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
          existing.source_checked_at = registry.checked_at;
          if (!existing.verification_method?.includes("publisher playlist enumeration")) {
            existing.verification_method = `${existing.verification_method ? `${existing.verification_method}; ` : ""}publisher playlist enumeration; metadata only, not a copyright or runtime-embed approval`;
          }
          existing.verification_evidence_urls = [...new Set([...evidence(existing), playlistUrl])].join("|");
          updated.push({ videoId, playlistId: item.playlist.id });
        } else {
          const title = item.entry.title!.trim();
          const row = {
            id: `youtube:${videoId}`,
            provider: "youtube",
            video_id: videoId,
            official_url: officialUrl,
            title_original: title,
            title_ar: /[\u0600-\u06ff]/.test(title) ? title : "",
            description_ar: "",
            language: /[\u0600-\u06ff]/.test(title) ? "ar" : "en",
            duration_seconds: numberCell(item.entry.duration ?? null),
            published_at: "",
            channel_id: item.publisher.channel_id,
            channel_name: item.publisher.channel_name,
            channel_url: item.publisher.channel_url,
            publisher_status: item.publisher.publisher_status,
            series_name: item.playlist.series_name,
            playlist_id: item.playlist.id,
            episode_number: String(item.episodeNumber),
            category: item.playlist.category,
            subcategory: item.playlist.subcategory,
            age_band: "",
            speaker: item.publisher.speaker,
            content_type: item.playlist.content_type ?? target.defaultContentType,
            rights_holder: "",
            rights_notice: "حقوق النشر والمحتوى محفوظة لأصحابها؛ لا يُستنتج ترخيص من إمكانية التضمين.",
            rights_status: "UNKNOWN",
            license_type: "UNKNOWN",
            license_evidence_url: "",
            attribution_text: "",
            embedding_status: "UNTESTED",
            embed_url: embedUrl,
            editorial_status: "PENDING_REVIEW",
            publication_status: "DRAFT",
            religious_review_status: "PENDING_REVIEW",
            depiction_review_status: "PENDING_REVIEW",
            thumbnail_url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            thumbnail_rights_status: "UNKNOWN",
            source_checked_at: registry.checked_at,
            verification_method: target.verificationMethod,
            verification_evidence_urls: [officialUrl, playlistUrl].join("|"),
            notes: target.note,
            __sourceLine: 0,
          } as CsvRow;
          added.push(row);
          catalog.rows.push(row);
          existingByVideo.set(videoId, row);
        }
        reportItems.push({
          videoId,
          playlistId: item.playlist.id,
          episodeNumber: item.episodeNumber,
          titleFromPlaylist: item.entry.title,
          durationSeconds: item.entry.duration ?? null,
          status: existing ? "enriched_existing" : "added",
        });
      }
    }

    const summary = {
      checkedAt: registry.checked_at,
      write,
      playlists: jobs.length,
      fetchedPlaylists: playlistReports.length - failures.length,
      failedPlaylists: failures.length,
      added: added.length,
      enrichedExisting: updated.length,
      duplicatePlaylistEntriesSkipped: duplicates.length,
      excludedEntries: playlistReports.reduce((sum, report) => sum + report.excluded.length, 0),
      target: target.key,
      resultingRecords: catalog.rows.length,
      note: "Playlist and channel metadata only. No rights, editorial, religious, publication, age-safety, or runtime-embed approval is inferred.",
    };

    mkdirSync(dirname(reportPath), { recursive: true });
    const serializableReports = playlistReports.map(({ items: _items, ...report }) => report);
    writeFileSync(reportPath, `${JSON.stringify({ summary, playlists: serializableReports, items: reportItems, duplicates }, null, 2)}\n`, "utf8");
    console.log(JSON.stringify({ ...summary, report: reportPath }, null, 2));
    for (const failure of failures) console.error(`FAILED ${failure.playlistId}: ${failure.error}`);
    if (failures.length) {
      process.exitCode = 1;
      return;
    }
    if (!write) return;

    for (const row of added) {
      pending.rows.push({
        video_id: row.video_id,
        official_url: row.official_url,
        title_original: row.title_original,
        reason: "PENDING_REVIEW: rights UNKNOWN and/or embedding UNTESTED; no final editorial/religious review",
        next_action: target.pendingNextAction,
        __sourceLine: 0,
      });
      ledger.rows.push({
        catalog: target.ledgerCatalog,
        video_id: row.video_id,
        official_url: row.official_url,
        channel_name: row.channel_name,
        publisher_status: row.publisher_status,
        rights_status: "UNKNOWN",
        license_type: "UNKNOWN",
        license_evidence_url: "",
        attribution_text: "",
        embedding_status: "UNTESTED",
        editorial_status: "PENDING_REVIEW",
        publication_status: "DRAFT",
        rights_action: target.rightsAction,
        __sourceLine: 0,
      });
    }
    writeCsv(catalogCsvPath, catalog.header, catalog.rows);
    writeCsv(pendingPath, pending.header, pending.rows);
    writeCsv(ledgerPath, ledger.header, ledger.rows);

    const previousJson = JSON.parse(readFileSync(catalogJsonPath, "utf8")) as Record<string, unknown>;
    const records = catalog.rows.map((row) => Object.fromEntries(catalog.header.map((field) => {
      if (["episode_number", "duration_seconds"].includes(field)) return [field, row[field] ? Number(row[field]) : null];
      if (field === "verification_evidence_urls") return [field, evidence(row)];
      return [field, row[field] || null];
    })));
    writeFileSync(catalogJsonPath, `${JSON.stringify({
      ...previousJson,
      generated_at: registry.checked_at,
      record_count: records.length,
      api_verification_performed: false,
      records,
    }, null, 2)}\n`, "utf8");

    const otherRows = readCsv(target.otherCatalogCsvPath).rows;
    const seerahCount = target.key === "seerah" ? catalog.rows.length : otherRows.length;
    const kidsCount = target.key === "seerah" ? otherRows.length : catalog.rows.length;
    const seerahPlaylistEpisodes = target.key === "seerah"
      ? catalog.rows.filter((row) => Boolean(row.playlist_id)).length
      : otherRows.filter((row) => Boolean(row.playlist_id)).length;
    const kidsPlaylistEpisodes = target.key === "seerah"
      ? otherRows.filter((row) => Boolean(row.playlist_id)).length
      : catalog.rows.filter((row) => Boolean(row.playlist_id)).length;
    acquisitionManifest.generated_at = registry.checked_at;
    acquisitionManifest.counts = {
      ...acquisitionManifest.counts,
      total: seerahCount + kidsCount,
      seerah: seerahCount,
      kids: kidsCount,
      playlist_episodes: seerahPlaylistEpisodes + kidsPlaylistEpisodes,
      metadata_checked: seerahCount + kidsCount,
      permission_required_or_unknown: seerahCount + kidsCount,
      pending_editorial: seerahCount + kidsCount,
      approved: 0,
    };
    acquisitionManifest.files = [
      ...new Set([
        ...acquisitionManifest.files,
        "media-series-registry.json",
        "kids-media-series-registry.json",
      ]),
    ];
    writeFileSync(manifestPath, `${JSON.stringify(acquisitionManifest, null, 2)}\n`, "utf8");
  })();
}

await main();
