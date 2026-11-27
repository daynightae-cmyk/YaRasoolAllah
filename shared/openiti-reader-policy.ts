import {
  OPENITI_RELEASE_COMMIT,
  type DigitalVersionRecord,
} from "./knowledge-registry.js";

/**
 * The one policy shared by the browser reader and the server reading desk.
 *
 * Reading eligibility is a rights fact, not a convenience flag: only the
 * pinned OpenITI RELEASE provider, a cleared full text, and the historical
 * public-domain rights state may open the reader. Size is a separate
 * operational bound; it never upgrades an ineligible version.
 */
export const OPENITI_READER_CONTENT_AVAILABILITY = "full_text_cleared" as const;
export const OPENITI_READER_RIGHTS_STATE =
  "cleared_public_domain_openiti_historical_text" as const;

/**
 * Decoded UTF-8 budget for one in-app book.
 *
 * The largest pinned artifact in the audited registry is al-Tha'labi's
 * Kashf wa'l-bayan at 33,451,839 bytes (measured 2026-11-27 with
 * `Accept-Encoding: identity` against the immutable RELEASE commit). A 32 MiB
 * ceiling covers every governed work while still refusing an unbounded load
 * on a phone. `artifactBytes` is verified metadata, and the streaming reader
 * enforces the same ceiling even when a server omits a reliable length.
 */
export const OPENITI_READER_MAX_BYTES = 32 * 1024 * 1024;
export const OPENITI_READER_MAX_LABEL = "32 MiB";

export type OpenItiReaderVersionFacts = Pick<
  DigitalVersionRecord,
  "provider" | "contentAvailability" | "rightsState" | "artifactBytes"
>;

export function isOpenItiReaderEligible(
  version: Pick<
    DigitalVersionRecord,
    "provider" | "contentAvailability" | "rightsState"
  >,
): boolean {
  return (
    version.provider === "OpenITI" &&
    version.contentAvailability === OPENITI_READER_CONTENT_AVAILABILITY &&
    version.rightsState === OPENITI_READER_RIGHTS_STATE
  );
}

/** A verified artifact size must be present and inside the decoding budget. */
export function isOpenItiReaderWithinBudget(
  version: Pick<DigitalVersionRecord, "artifactBytes">,
): boolean {
  return (
    Number.isFinite(version.artifactBytes) &&
    version.artifactBytes > 0 &&
    version.artifactBytes <= OPENITI_READER_MAX_BYTES
  );
}

/** Eligibility for an actual reading request, including the size bound. */
export function isOpenItiReaderAvailable(
  version: OpenItiReaderVersionFacts,
): boolean {
  return isOpenItiReaderEligible(version) && isOpenItiReaderWithinBudget(version);
}

/**
 * The only artifact URL a reader may request.
 *
 * Derived from a governed version and pinned to the approved immutable
 * release. Catalog URLs and floating release tags are deliberately rejected.
 */
export function getPinnedOpenItiArtifactUrl(
  version: DigitalVersionRecord,
): string | null {
  if (!isOpenItiReaderEligible(version)) return null;
  if (version.releaseCommit !== OPENITI_RELEASE_COMMIT) return null;
  if (!version.artifactPath || version.artifactPath.includes("..")) return null;
  return `https://raw.githubusercontent.com/OpenITI/RELEASE/${version.releaseCommit}/${version.artifactPath}`;
}

/** Raised before a response can exceed the decoded-text budget. */
export class OpenItiReaderBudgetError extends Error {
  constructor() {
    super(`OpenITI text exceeds the ${OPENITI_READER_MAX_LABEL} reader budget.`);
    this.name = "OpenItiReaderBudgetError";
  }
}

interface BoundedTextResponse {
  body: ReadableStream<Uint8Array> | null;
  text(): Promise<string>;
}

/**
 * Read a response as UTF-8 while enforcing a byte ceiling on the decoded
 * stream. The server's `content-length` may describe compressed bytes, so it
 * cannot be trusted as the decoded size. This function stops reading as soon
 * as the budget is crossed and cancels the body.
 */
export async function readBoundedUtf8(
  response: BoundedTextResponse,
  maxBytes: number = OPENITI_READER_MAX_BYTES,
): Promise<string> {
  if (!response.body) {
    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > maxBytes) {
      throw new OpenItiReaderBudgetError();
    }
    return text;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let received = 0;
  let text = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > maxBytes) {
        await reader.cancel();
        throw new OpenItiReaderBudgetError();
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    reader.releaseLock();
  }

  return text;
}
