import { providerPolicyRegistry } from "@shared/knowledge-registry";

export interface AudioProvider {
  providerId: string;
  provider: string;
  canonicalUrl: string;
  rightsState: string;
  productionUse: string;
}

const AUDIO_PROVIDER_IDS = ["provider-quranic-audio", "provider-everyayah", "provider-quran-foundation"];

export const AUDIO_PROVIDERS: AudioProvider[] = providerPolicyRegistry
  .filter((record) => AUDIO_PROVIDER_IDS.includes(record.providerId))
  .map((record) => ({
    providerId: record.providerId,
    provider: record.provider,
    canonicalUrl: record.canonicalUrl,
    rightsState: record.rightsState,
    productionUse: record.productionUse,
  }));

export const AUDIO_COUNTS = {
  providers: AUDIO_PROVIDERS.length,
  clearedRecordings: 0,
};

export function rightsLabel(rightsState: string): string {
  switch (rightsState) {
    case "external_link_only":
      return "رابط خارجي فقط";
    case "needs_license_review":
      return "يحتاج مراجعة ترخيص";
    case "needs_credential":
      return "يحتاج اعتمادًا";
    default:
      return rightsState;
  }
}
