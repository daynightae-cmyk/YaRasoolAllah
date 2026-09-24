import type { IiifManifestSummary } from "@shared/iiif";

export type ManuscriptSourceState =
  | "verified_reader"
  | "provider_blocked";

export interface ManuscriptSource {
  id: string;
  provider: string;
  titleAr: string;
  descriptionAr: string;
  manifestUrl: string;
  sourceUrl: string;
  state: ManuscriptSourceState;
}

export const MANUSCRIPT_SOURCES: ManuscriptSource[] = [
  {
    id: "gallica-btv1b550076223",
    provider: "BnF Gallica",
    titleAr: "مخطوط مصوّر من مكتبة غاليكا",
    descriptionAr:
      "نموذج IIIF موثّق حيًا لتشغيل قارئ الصفحات المصورة مع بيانات الإسناد والحقوق الواردة من البيان.",
    manifestUrl:
      "https://gallica.bnf.fr/iiif/ark:/12148/btv1b550076223/manifest.json",
    sourceUrl: "https://gallica.bnf.fr/ark:/12148/btv1b550076223",
    state: "verified_reader",
  },
  {
    id: "qdl-qnlhc-12933",
    provider: "Qatar Digital Library",
    titleAr: "مخطوط من مكتبة قطر الرقمية",
    descriptionAr:
      "بيان IIIF معروف، لكن التحقق الآلي من GitHub Actions تلقّى HTTP 403؛ لذلك لا نعرضه كقارئ داخلي موثّق بعد.",
    manifestUrl: "https://www.qdl.qa/en/iiif/qnlhc/12933/manifest",
    sourceUrl: "https://www.qdl.qa/",
    state: "provider_blocked",
  },
];

export interface IiifManifestResponse {
  provider: string;
  availability: "external_iiif_manifest";
  cached: boolean;
  manifest: IiifManifestSummary;
}

export async function fetchIiifManifest(
  manifestUrl: string,
  signal?: AbortSignal,
): Promise<IiifManifestResponse> {
  const response = await fetch(
    "/api/content/iiif/manifest?url=" + encodeURIComponent(manifestUrl),
    { signal },
  );

  const payload = (await response.json()) as
    | IiifManifestResponse
    | { message?: string; code?: string };

  if (!response.ok || !("manifest" in payload)) {
    const message =
      "message" in payload && payload.message
        ? payload.message
        : "تعذر فتح المخطوط الآن.";
    throw new Error(message);
  }

  return payload;
}
