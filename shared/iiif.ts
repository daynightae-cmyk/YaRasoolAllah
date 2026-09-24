export interface IiifCanvas {
  id: string;
  label: string;
  width?: number;
  height?: number;
  imageUrl?: string;
  imageService?: string;
}

export interface IiifManifestSummary {
  id: string;
  label: string;
  attribution?: string;
  rights?: string;
  requiredStatement?: string;
  canvases: IiifCanvas[];
  presentationVersion: 2 | 3;
}

type JsonObject = Record<string, unknown>;

function objectValue(value: unknown): JsonObject | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function firstString(value: unknown): string | undefined {
  if (typeof value === "string") return value.trim() || undefined;
  if (Array.isArray(value)) {
    for (const item of value) {
      const text = firstString(item);
      if (text) return text;
    }
    return undefined;
  }

  const object = objectValue(value);
  if (!object) return undefined;

  for (const preferred of ["ar", "en", "fr", "none"]) {
    const text = firstString(object[preferred]);
    if (text) return text;
  }
  for (const item of Object.values(object)) {
    const text = firstString(item);
    if (text) return text;
  }
  return undefined;
}

function serviceId(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    for (const item of value) {
      const id = serviceId(item);
      if (id) return id;
    }
    return undefined;
  }
  const object = objectValue(value);
  return stringValue(object?.id) ?? stringValue(object?.["@id"]);
}

export function buildIiifImageUrl(
  imageService: string,
  width = 1600,
): string {
  return imageService.replace(/\/+$/, "") + "/full/" + width + ",/0/default.jpg";
}

function normalizeV2Canvas(raw: unknown, index: number): IiifCanvas | null {
  const canvas = objectValue(raw);
  if (!canvas) return null;
  const image = Array.isArray(canvas.images) ? objectValue(canvas.images[0]) : null;
  const resource = objectValue(image?.resource);
  const imageService = serviceId(resource?.service);
  const resourceUrl = stringValue(resource?.["@id"]) ?? stringValue(resource?.id);
  const id =
    stringValue(canvas["@id"]) ??
    stringValue(canvas.id) ??
    "iiif-canvas-v2-" + String(index + 1);

  return {
    id,
    label: firstString(canvas.label) ?? "صفحة " + String(index + 1),
    width: typeof canvas.width === "number" ? canvas.width : undefined,
    height: typeof canvas.height === "number" ? canvas.height : undefined,
    imageService,
    imageUrl: imageService
      ? buildIiifImageUrl(imageService)
      : resourceUrl,
  };
}

function normalizeV3Canvas(raw: unknown, index: number): IiifCanvas | null {
  const canvas = objectValue(raw);
  if (!canvas) return null;
  const annotationPage = Array.isArray(canvas.items) ? objectValue(canvas.items[0]) : null;
  const annotation = Array.isArray(annotationPage?.items)
    ? objectValue((annotationPage!.items as unknown[])[0])
    : null;
  const bodyRaw = annotation?.body;
  const body = Array.isArray(bodyRaw)
    ? objectValue(bodyRaw[0])
    : objectValue(bodyRaw);
  const imageService = serviceId(body?.service);
  const bodyUrl = stringValue(body?.id) ?? stringValue(body?.["@id"]);
  const id =
    stringValue(canvas.id) ??
    stringValue(canvas["@id"]) ??
    "iiif-canvas-v3-" + String(index + 1);

  return {
    id,
    label: firstString(canvas.label) ?? "صفحة " + String(index + 1),
    width: typeof canvas.width === "number" ? canvas.width : undefined,
    height: typeof canvas.height === "number" ? canvas.height : undefined,
    imageService,
    imageUrl: imageService
      ? buildIiifImageUrl(imageService)
      : bodyUrl,
  };
}

function requiredStatementV3(value: unknown): string | undefined {
  const statement = objectValue(value);
  if (!statement) return undefined;
  const label = firstString(statement.label);
  const body = firstString(statement.value);
  if (label && body) return label + ": " + body;
  return body ?? label;
}

export function normalizeIiifManifest(payload: unknown): IiifManifestSummary {
  const manifest = objectValue(payload);
  if (!manifest) throw new Error("IIIF manifest must be a JSON object.");

  const v3Items = Array.isArray(manifest.items) ? manifest.items : null;
  if (v3Items) {
    const canvases = v3Items
      .map(normalizeV3Canvas)
      .filter((item): item is IiifCanvas => Boolean(item?.imageUrl));

    if (!canvases.length) {
      throw new Error("IIIF Presentation v3 manifest has no playable image canvases.");
    }

    return {
      id:
        stringValue(manifest.id) ??
        stringValue(manifest["@id"]) ??
        "iiif-manifest-v3",
      label: firstString(manifest.label) ?? "مخطوط رقمي",
      attribution: requiredStatementV3(manifest.requiredStatement),
      rights: firstString(manifest.rights),
      requiredStatement: requiredStatementV3(manifest.requiredStatement),
      canvases,
      presentationVersion: 3,
    };
  }

  const sequences = Array.isArray(manifest.sequences) ? manifest.sequences : [];
  const firstSequence = objectValue(sequences[0]);
  const v2Canvases = Array.isArray(firstSequence?.canvases)
    ? (firstSequence!.canvases as unknown[])
    : [];
  const canvases = v2Canvases
    .map(normalizeV2Canvas)
    .filter((item): item is IiifCanvas => Boolean(item?.imageUrl));

  if (!canvases.length) {
    throw new Error("IIIF Presentation v2 manifest has no playable image canvases.");
  }

  return {
    id:
      stringValue(manifest["@id"]) ??
      stringValue(manifest.id) ??
      "iiif-manifest-v2",
    label: firstString(manifest.label) ?? "مخطوط رقمي",
    attribution: firstString(manifest.attribution),
    rights: firstString(manifest.license),
    canvases,
    presentationVersion: 2,
  };
}
