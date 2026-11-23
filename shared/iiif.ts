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

/** IIIF language maps and v2 literals both collapse to display-safe plain text. */
function firstString(value: unknown): string | undefined {
  const literal = stringValue(value);
  if (literal) return literal;
  if (Array.isArray(value)) {
    for (const item of value) {
      const text = firstString(item);
      if (text) return text;
    }
    return undefined;
  }

  const object = objectValue(value);
  if (!object) return undefined;
  const direct = firstString(object["@value"]);
  if (direct) return direct;
  for (const preferred of ["ar", "en", "fr", "none", "@language"]) {
    const text = firstString(object[preferred]);
    if (text && preferred !== "@language") return text;
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
  if (!object) return undefined;
  return stringValue(object.id)
    ?? stringValue(object["@id"])
    ?? serviceId(object.service);
}

export function buildIiifImageUrl(imageService: string, width = 1600): string {
  const service = imageService.trim().replace(/\/+$/, "").replace(/\/info\.json$/, "");
  const requestedWidth = Number.isFinite(width) ? Math.round(width) : 1600;
  const safeWidth = Math.min(4096, Math.max(64, requestedWidth));
  return `${service}/full/${safeWidth},/0/default.jpg`;
}

function positiveDimension(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;
}

function normalizeV2Canvas(raw: unknown, index: number): IiifCanvas | null {
  const canvas = objectValue(raw);
  if (!canvas) return null;
  const images = Array.isArray(canvas.images) ? canvas.images : [];
  for (const rawImage of images) {
    const image = objectValue(rawImage);
    const resource = objectValue(image?.resource);
    if (!resource) continue;
    const imageService = serviceId(resource.service);
    const resourceUrl = stringValue(resource["@id"]) ?? stringValue(resource.id);
    if (!imageService && !resourceUrl) continue;
    return {
      id: stringValue(canvas["@id"]) ?? stringValue(canvas.id) ?? `iiif-canvas-v2-${index + 1}`,
      label: firstString(canvas.label) ?? `Page ${index + 1}`,
      width: positiveDimension(canvas.width),
      height: positiveDimension(canvas.height),
      imageService,
      imageUrl: imageService ? buildIiifImageUrl(imageService) : resourceUrl,
    };
  }
  return null;
}

function v3ImageBodies(value: unknown): JsonObject[] {
  if (Array.isArray(value)) return value.flatMap(v3ImageBodies);
  const body = objectValue(value);
  if (!body) return [];
  const type = firstString(body.type)?.toLowerCase();
  if (type === "choice") return v3ImageBodies(body.items);
  if (type && type !== "image" && type !== "dctypes:image") return [];
  return [body];
}

function normalizeV3Canvas(raw: unknown, index: number): IiifCanvas | null {
  const canvas = objectValue(raw);
  if (!canvas) return null;
  const annotationPages = Array.isArray(canvas.items) ? canvas.items : [];
  for (const rawPage of annotationPages) {
    const page = objectValue(rawPage);
    const annotations = Array.isArray(page?.items) ? page.items : [];
    for (const rawAnnotation of annotations) {
      const annotation = objectValue(rawAnnotation);
      const motivation = firstString(annotation?.motivation);
      if (motivation && motivation.toLowerCase() !== "painting") continue;
      for (const body of v3ImageBodies(annotation?.body)) {
        const imageService = serviceId(body.service);
        const bodyUrl = stringValue(body.id) ?? stringValue(body["@id"]);
        if (!imageService && !bodyUrl) continue;
        return {
          id: stringValue(canvas.id) ?? stringValue(canvas["@id"]) ?? `iiif-canvas-v3-${index + 1}`,
          label: firstString(canvas.label) ?? `Page ${index + 1}`,
          width: positiveDimension(canvas.width),
          height: positiveDimension(canvas.height),
          imageService,
          imageUrl: imageService ? buildIiifImageUrl(imageService) : bodyUrl,
        };
      }
    }
  }
  return null;
}

function requiredStatementV3(value: unknown): string | undefined {
  const statement = objectValue(value);
  if (!statement) return undefined;
  const label = firstString(statement.label);
  const body = firstString(statement.value);
  if (label && body) return `${label}: ${body}`;
  return body ?? label;
}

export function normalizeIiifManifest(payload: unknown): IiifManifestSummary {
  const manifest = objectValue(payload);
  if (!manifest) throw new Error("IIIF manifest must be a JSON object.");

  if (Array.isArray(manifest.items)) {
    const canvases = manifest.items
      .map(normalizeV3Canvas)
      .filter((item): item is IiifCanvas => Boolean(item?.imageUrl));
    if (!canvases.length) {
      throw new Error("IIIF Presentation v3 manifest has no playable image canvases.");
    }
    const statement = requiredStatementV3(manifest.requiredStatement);
    return {
      id: stringValue(manifest.id) ?? stringValue(manifest["@id"]) ?? "iiif-manifest-v3",
      label: firstString(manifest.label) ?? "Digitized manuscript",
      attribution: statement,
      rights: firstString(manifest.rights),
      requiredStatement: statement,
      canvases,
      presentationVersion: 3,
    };
  }

  const sequences = Array.isArray(manifest.sequences) ? manifest.sequences : [];
  const firstSequence = objectValue(sequences[0]);
  const rawCanvases = Array.isArray(firstSequence?.canvases) ? firstSequence.canvases : [];
  const canvases = rawCanvases
    .map(normalizeV2Canvas)
    .filter((item): item is IiifCanvas => Boolean(item?.imageUrl));
  if (!canvases.length) {
    throw new Error("IIIF Presentation v2 manifest has no playable image canvases.");
  }
  return {
    id: stringValue(manifest["@id"]) ?? stringValue(manifest.id) ?? "iiif-manifest-v2",
    label: firstString(manifest.label) ?? "Digitized manuscript",
    attribution: firstString(manifest.attribution),
    rights: firstString(manifest.license),
    canvases,
    presentationVersion: 2,
  };
}
