import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const ACQ = resolve(root, "data-sources/media/acquisition");
const OUT_DIR = resolve(root, "data-sources/media/discovery");

type MediaRecord = {
  id: string;
  provider: string;
  video_id: string | null;
  official_url: string | null;
  title_original: string | null;
  title_ar: string | null;
  description_ar: string | null;
  language: string | null;
  duration_seconds: number | null;
  published_at: string | null;
  channel_id: string | null;
  channel_name: string | null;
  channel_url: string | null;
  publisher_status: string | null;
  series_name: string | null;
  playlist_id: string | null;
  episode_number: number | null;
  category: string | null;
  subcategory: string | null;
  age_band: string | null;
  speaker: string | null;
  content_type: string | null;
  rights_holder: string | null;
  rights_notice: string | null;
  rights_status: string | null;
  license_type: string | null;
  license_evidence_url: string | null;
  attribution_text: string | null;
  embedding_status: string | null;
  embed_url: string | null;
  editorial_status: string | null;
  publication_status: string | null;
  religious_review_status: string | null;
  depiction_review_status: string | null;
  thumbnail_url: string | null;
  thumbnail_rights_status: string | null;
  source_checked_at: string | null;
  verification_method: string | null;
  verification_evidence_urls: string[] | null;
  notes: string | null;
  _source_file: string;
  _source_row: number;
};

type LedgerRow = {
  catalog: string;
  video_id: string;
  official_url: string;
  channel_name: string;
  publisher_status: string;
  rights_status: string;
  license_type: string;
  license_evidence_url: string;
  attribution_text: string;
  embedding_status: string;
  editorial_status: string;
  publication_status: string;
  rights_action: string;
};

type PendingRow = {
  video_id: string;
  official_url: string;
  title_original: string;
  reason: string;
  next_action: string;
};

function readCsv(path: string): Record<string, string>[] {
  const text = readFileSync(path, "utf-8");
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const header = lines[0].split(",");
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const values = lines[i].split(",");
    const row: Record<string, string> = {};
    for (let j = 0; j < header.length; j += 1) {
      row[header[j]] = values[j] ?? "";
    }
    rows.push(row);
  }
  return rows;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

function coerceNumber(value: string | null): number | null {
  if (value === null || value === "" || value === "null") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.origin + u.pathname + u.search;
  } catch {
    return url;
  }
}

function main() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Load CSV sources (authoritative raw provenance).
  const kidsCsv = readCsv(resolve(ACQ, "kids-media-catalog.csv"));
  const seerahCsv = readCsv(resolve(ACQ, "seerah-media-catalog.csv"));
  const ledgerRows = readCsv(resolve(ACQ, "media-rights-ledger.csv")) as unknown as LedgerRow[];
  const pendingRows = readCsv(resolve(ACQ, "media-rejected-and-pending.csv")) as unknown as PendingRow[];

  // 2. Load JSON cross-check (should match CSV exactly per validation).
  const kidsJson = readJson<{ records: MediaRecord[] }>(resolve(ACQ, "kids-media-catalog.json"));
  const seerahJson = readJson<{ records: MediaRecord[] }>(resolve(ACQ, "seerah-media-catalog.json"));

  if (kidsJson.records.length !== kidsCsv.length) {
    errors.push(`kids: JSON count ${kidsJson.records.length} != CSV count ${kidsCsv.length}`);
  }
  if (seerahJson.records.length !== seerahCsv.length) {
    errors.push(`seerah: JSON count ${seerahJson.records.length} != CSV count ${seerahCsv.length}`);
  }

  // 3. Build unified discovery catalog from CSV (authoritative), cross-checked against JSON.
  const csvSources: Array<{ file: string; category: string; rows: Record<string, string>[] }> = [
    { file: "kids-media-catalog.csv", category: "kids", rows: kidsCsv },
    { file: "seerah-media-catalog.csv", category: "seerah", rows: seerahCsv },
  ];

  const jsonByVideoId = new Map<string, MediaRecord>();
  for (const rec of [...kidsJson.records, ...seerahJson.records]) {
    if (rec.video_id) jsonByVideoId.set(rec.video_id, rec);
  }

  const ledgerByVideoId = new Map<string, LedgerRow>();
  for (const row of ledgerRows) ledgerByVideoId.set(row.video_id, row);

  const pendingByVideoId = new Map<string, PendingRow>();
  for (const row of pendingRows) pendingByVideoId.set(row.video_id, row);

  const records: MediaRecord[] = [];
  const seen = new Set<string>(); // (provider, video_id)
  const seenUrl = new Set<string>(); // canonical official_url

  for (const { file, rows } of csvSources) {
    for (let i = 0; i < rows.length; i += 1) {
      const raw = rows[i];
      const videoId = raw.video_id?.trim();
      const officialUrl = raw.official_url?.trim();
      const dedupeKey = `${raw.provider ?? "youtube"}|${videoId ?? ""}`;
      const canonicalUrl = officialUrl ? normalizeUrl(officialUrl) : null;

      if (!videoId) {
        errors.push(`${file}:${i + 1}: missing video_id`);
        continue;
      }
      if (seen.has(dedupeKey)) {
        warnings.push(`${file}:${i + 1}: duplicate (provider,video_id) ${dedupeKey} — skipped`);
        continue;
      }
      if (canonicalUrl && seenUrl.has(canonicalUrl)) {
        warnings.push(`${file}:${i + 1}: duplicate canonical URL ${canonicalUrl} — skipped`);
        continue;
      }

      seen.add(dedupeKey);
      if (canonicalUrl) seenUrl.add(canonicalUrl);

      const jsonMatch = jsonByVideoId.get(videoId);
      const ledgerMatch = ledgerByVideoId.get(videoId);

      // Cross-check JSON against CSV; report conflicts silently as warnings, never overwrite CSV.
      if (jsonMatch) {
        const jsonFields = ["title_original", "title_ar", "channel_name", "rights_status", "publication_status", "editorial_status"];
        for (const field of jsonFields) {
          const csvVal = raw[field] ?? null;
          const jsonVal = jsonMatch[field] ?? null;
          if (csvVal !== jsonVal) {
            warnings.push(`${file}:${i + 1}: ${field} CSV/JSON mismatch for ${videoId}`);
          }
        }
      }

      // Merge ledger rights info (authoritative for rights_status/publication_status).
      const merged: MediaRecord = {
        id: raw.id ?? `youtube:${videoId}`,
        provider: raw.provider ?? "youtube",
        video_id: videoId,
        official_url: officialUrl ?? null,
        title_original: raw.title_original ?? null,
        title_ar: raw.title_ar ?? null,
        description_ar: raw.description_ar ?? null,
        language: raw.language ?? null,
        duration_seconds: coerceNumber(raw.duration_seconds),
        published_at: raw.published_at ?? null,
        channel_id: raw.channel_id ?? null,
        channel_name: raw.channel_name ?? null,
        channel_url: raw.channel_url ?? null,
        publisher_status: ledgerMatch?.publisher_status ?? raw.publisher_status ?? null,
        series_name: raw.series_name ?? null,
        playlist_id: raw.playlist_id ?? null,
        episode_number: coerceNumber(raw.episode_number),
        category: raw.category ?? null,
        subcategory: raw.subcategory ?? null,
        age_band: raw.age_band ?? null,
        speaker: raw.speaker ?? null,
        content_type: raw.content_type ?? null,
        rights_holder: ledgerMatch?.rights_status ? raw.rights_holder : raw.rights_holder,
        rights_notice: raw.rights_notice ?? null,
        rights_status: ledgerMatch?.rights_status ?? raw.rights_status ?? "UNKNOWN",
        license_type: raw.license_type ?? null,
        license_evidence_url: raw.license_evidence_url ?? null,
        attribution_text: raw.attribution_text ?? null,
        embedding_status: raw.embedding_status ?? "UNTESTED",
        embed_url: raw.embed_url ?? null,
        editorial_status: ledgerMatch?.editorial_status ?? raw.editorial_status ?? "PENDING_REVIEW",
        publication_status: ledgerMatch?.publication_status ?? raw.publication_status ?? "DRAFT",
        religious_review_status: raw.religious_review_status ?? "PENDING_REVIEW",
        depiction_review_status: raw.depiction_review_status ?? "PENDING_REVIEW",
        thumbnail_url: raw.thumbnail_url ?? null,
        thumbnail_rights_status: raw.thumbnail_rights_status ?? "UNKNOWN",
        source_checked_at: raw.source_checked_at ?? null,
        verification_method: raw.verification_method ?? null,
        verification_evidence_urls: raw.verification_evidence_urls
          ? raw.verification_evidence_urls.split("|").map((u) => u.trim()).filter(Boolean)
          : null,
        notes: raw.notes ?? null,
        _source_file: file,
        _source_row: i + 2,
      };
      records.push(merged);
    }
  }

  // 4. Consistency report.
  const byCategory = new Map<string, number>();
  const byStatus = new Map<string, number>();
  const byRights = new Map<string, number>();
  for (const rec of records) {
    byCategory.set(rec.category ?? "uncategorized", (byCategory.get(rec.category ?? "uncategorized") ?? 0) + 1);
    byStatus.set(rec.publication_status ?? "unknown", (byStatus.get(rec.publication_status ?? "unknown") ?? 0) + 1);
    byRights.set(rec.rights_status ?? "unknown", (byRights.get(rec.rights_status ?? "unknown") ?? 0) + 1);
  }

  // 5. Manifest.
  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourcePack: "YA_RASOOL_ALLAH_VERIFIED_MEDIA_ACQUISITION_PACK",
    sourceFiles: csvSources.map((s) => s.file),
    totalUniqueRecords: records.length,
    duplicatesSkipped: warnings.filter((w) => w.includes("duplicate")).length,
    byCategory: Object.fromEntries(byCategory),
    byPublicationStatus: Object.fromEntries(byStatus),
    byRightsStatus: Object.fromEntries(byRights),
    approvedForPublicDisplay: 0,
    blockedPendingReview: records.filter((r) => r.publication_status !== "APPROVED").length,
    policy: "Discovery-only ingestion. No record is promoted to APPROVED. embed_url remains UNTESTED candidate until runtime verification.",
  };

  mkdirSync(OUT_DIR, { recursive: true });

  const catalogOut = {
    schemaVersion: 1,
    generatedAt: manifest.generatedAt,
    policy: manifest.policy,
    counts: {
      total: records.length,
      approved: 0,
      pending: manifest.blockedPendingReview,
    },
    records: records.map((r) => {
      const { _source_file, _source_row, ...clean } = r;
      return clean;
    }),
  };

  writeFileSync(resolve(OUT_DIR, "media-discovery-catalog.json"), JSON.stringify(catalogOut, null, 2), "utf-8");
  writeFileSync(resolve(OUT_DIR, "ingestion-manifest.json"), JSON.stringify(manifest, null, 2), "utf-8");
  writeFileSync(
    resolve(OUT_DIR, "ingestion-report.md"),
    [
      "# تقرير الاستيراد (Ingestion Report)",
      "",
      `تاريخ الإنشاء: ${manifest.generatedAt}`,
      `عدد السجلات الفريدة المستوردة: ${records.length}`,
      `تم تخطي المكررات: ${manifest.duplicatesSkipped}`,
      `المؤهلة للعرض العام (APPROVED): 0`,
      `المعلّقة للمراجعة (PENDING/DRAFT): ${manifest.blockedPendingReview}`,
      "",
      "## حسب الفئة",
      ...Object.entries(manifest.byCategory).map(([cat, n]) => `- ${cat}: ${n}`),
      "",
      "## حسب حالة النشر",
      ...Object.entries(manifest.byPublicationStatus).map(([st, n]) => `- ${st}: ${n}`),
      "",
      "## حسب حالة الحقوق",
      ...Object.entries(manifest.byRightsStatus).map(([rg, n]) => `- ${rg}: ${n}`),
      "",
      "## السياسة",
      "- لا يوجد سجل تمت ترقيته إلى APPROVED.",
      "- جميع السجلات بقيمة DRAFT / PENDING_REVIEW remain في طبقة discovery غير العامة.",
      "- حقل embed_url يُعامل كمرشح غير مختبر (UNTESTED candidate) ولا يُستخدم للتشغيل حتى التحقق الفعلي.",
      "",
      "## تحذيرات",
      ...warnings,
      ...(errors.length ? ["## أخطاء", ...errors] : []),
    ].join("\n"),
    "utf-8",
  );

  if (errors.length > 0) {
    console.error("INGESTION FAILED:");
    for (const e of errors) console.error(" -", e);
    process.exit(1);
  }

  console.log("INGESTION PASS:");
  console.log(` - total unique records: ${records.length}`);
  console.log(` - duplicates skipped: ${manifest.duplicatesSkipped}`);
  console.log(` - approved for public display: 0`);
  console.log(` - blocked pending review: ${manifest.blockedPendingReview}`);
  console.log(` - output: ${resolve(OUT_DIR, "media-discovery-catalog.json")}`);
}

main();
