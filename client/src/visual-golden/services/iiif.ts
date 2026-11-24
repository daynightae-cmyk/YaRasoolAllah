import { buildIiifImageUrl, type IiifCanvas, type IiifManifestSummary } from "@shared/iiif";
import { apiUrl } from "@/lib/api-origin";

export type ManuscriptSourceState = "live_check_required" | "provider_blocked";

/** External provider entries, not additions to the governed Library catalog. */
export interface ManuscriptSource {
  id: string;
  provider: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  manifestUrl: string;
  sourceUrl: string;
  state: ManuscriptSourceState;
  lastKnownUpstreamStatus?: number;
}

export const MANUSCRIPT_SOURCES: ManuscriptSource[] = [
  {
    id: "gallica-btv1b550076223",
    provider: "BnF Gallica",
    titleAr: "مخطوط مصور من مكتبة غاليكا",
    titleEn: "A digitized manuscript from Gallica",
    descriptionAr: "بيان IIIF خارجي يُفحص مباشرة عند الفتح؛ لا يُعد متاحًا قبل نجاح الطلب، ولا يضاف إلى فهرس الكتب الداخلي.",
    descriptionEn: "An external IIIF manifest checked live on open; availability is never assumed and it is not added to the internal book catalog.",
    manifestUrl: "https://gallica.bnf.fr/iiif/ark:/12148/btv1b550076223/manifest.json",
    sourceUrl: "https://gallica.bnf.fr/ark:/12148/btv1b550076223",
    state: "live_check_required",
  },
  {
    id: "qdl-qnlhc-12933",
    provider: "Qatar Digital Library",
    titleAr: "مخطوط من مكتبة قطر الرقمية",
    titleEn: "A manuscript from Qatar Digital Library",
    descriptionAr: "سُجل حجب المزود لطلب الخادم سابقًا بHTTP 403. يمكن إعادة الفحص المباشر، مع بقاء رابط المصدر الأصلي متاحًا.",
    descriptionEn: "The provider previously refused the server request with HTTP 403. A fresh live check is available, alongside the original source link.",
    manifestUrl: "https://www.qdl.qa/en/iiif/qnlhc/12933/manifest",
    sourceUrl: "https://www.qdl.qa/",
    state: "provider_blocked",
    lastKnownUpstreamStatus: 403,
  },
];

export interface IiifManifestResponse {
  provider: string;
  availability: "external_iiif_manifest";
  cached: boolean;
  manifest: IiifManifestSummary;
}

export class IiifServiceError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    readonly upstreamStatus?: number,
  ) {
    super(code);
    this.name = "IiifServiceError";
  }
}

function errorPayload(value: unknown): { code?: string; upstreamStatus?: number } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const record = value as Record<string, unknown>;
  return {
    code: typeof record.code === "string" ? record.code : undefined,
    upstreamStatus: typeof record.upstreamStatus === "number" ? record.upstreamStatus : undefined,
  };
}

export async function fetchIiifManifest(
  manifestUrl: string,
  signal?: AbortSignal,
): Promise<IiifManifestResponse> {
  const response = await fetch(apiUrl(`/api/content/iiif/manifest?url=${encodeURIComponent(manifestUrl)}`), {
    signal,
    headers: { Accept: "application/json" },
  });
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new IiifServiceError("invalid_response", response.status);
  }
  if (!response.ok || !payload || typeof payload !== "object" || !("manifest" in payload)) {
    const error = errorPayload(payload);
    throw new IiifServiceError(error.code ?? "manifest_unavailable", response.status, error.upstreamStatus);
  }
  return payload as IiifManifestResponse;
}

export const MIN_MANUSCRIPT_ZOOM = 0.7;
export const MAX_MANUSCRIPT_ZOOM = 2.6;

export function clampManuscriptPage(index: number, total: number): number {
  if (!Number.isFinite(index) || total <= 0) return 0;
  return Math.min(Math.max(Math.floor(index), 0), total - 1);
}

export function clampManuscriptZoom(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_MANUSCRIPT_ZOOM, Math.max(MIN_MANUSCRIPT_ZOOM, value));
}

export function manuscriptPageImage(
  canvas: Pick<IiifCanvas, "imageService" | "imageUrl"> | undefined,
  zoom: number,
): string | undefined {
  if (!canvas) return undefined;
  if (!canvas.imageService) return canvas.imageUrl;
  const width = zoom >= 1.7 ? 2400 : zoom >= 1.2 ? 2000 : 1600;
  return buildIiifImageUrl(canvas.imageService, width);
}

export type ManuscriptKeyboardAction = "previous" | "next" | "zoom-in" | "zoom-out" | "zoom-reset";

export function manuscriptKeyboardAction(
  key: string,
  direction: "ltr" | "rtl",
): ManuscriptKeyboardAction | null {
  if (key === "PageDown") return "next";
  if (key === "PageUp") return "previous";
  if (key === "ArrowRight") return direction === "rtl" ? "previous" : "next";
  if (key === "ArrowLeft") return direction === "rtl" ? "next" : "previous";
  if (key === "+" || key === "=") return "zoom-in";
  if (key === "-") return "zoom-out";
  if (key === "0") return "zoom-reset";
  return null;
}
