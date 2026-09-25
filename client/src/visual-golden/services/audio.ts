import { providerPolicyRegistry } from "@shared/knowledge-registry";

export interface AudioProvider {
  providerId: string;
  provider: string;
  canonicalUrl: string;
  rightsState: string;
  contentAvailability: string;
  productionUse: string;
  attribution: string | null;
}

const AUDIO_PROVIDER_IDS = [
  "provider-mp3quran",
  "provider-quranic-audio",
  "provider-everyayah",
  "provider-quran-foundation",
];

export const AUDIO_PROVIDERS: AudioProvider[] = providerPolicyRegistry
  .filter((record) => AUDIO_PROVIDER_IDS.includes(record.providerId))
  .map((record) => ({
    providerId: record.providerId,
    provider: record.provider,
    canonicalUrl: record.canonicalUrl,
    rightsState: record.rightsState,
    contentAvailability: record.contentAvailability,
    productionUse: record.productionUse,
    attribution: record.attribution,
  }));

export const AUDIO_COUNTS = {
  providers: AUDIO_PROVIDERS.length,
  streamingProviders: AUDIO_PROVIDERS.filter(
    (provider) =>
      provider.rightsState === "cleared_with_attribution"
      && provider.contentAvailability === "streaming_cleared",
  ).length,
};

export function rightsLabel(rightsState: string): string {
  switch (rightsState) {
    case "cleared_with_attribution":
      return "مصرّح مع نسبة المصدر";
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
