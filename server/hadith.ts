import type { Express } from "express";
import {
  HADITH_COLLECTIONS,
  HADITH_DEVELOPMENT_SAMPLES,
} from "../client/src/data/hadithData.js";
import { providerPolicyRegistry } from "../shared/knowledge-registry.js";
import { providerResourceRegistry } from "../shared/source-registry.js";
import type {
  HadithCorpusStatus,
  HadithProviderStatus,
} from "../shared/hadith.js";

export function getHadithCorpusStatus(): HadithCorpusStatus {
  const providers: HadithProviderStatus[] = providerPolicyRegistry
    .filter((policy) => policy.domain === "hadith")
    .map((policy) => {
      const resource = providerResourceRegistry.find(
        (candidate) => candidate.provider === policy.provider,
      );
      return {
        providerId: policy.providerId,
        provider: policy.provider,
        integrationState: policy.credentialsRequired
          ? "credential_blocked"
          : "external_reference_only",
        rightsState: policy.rightsState,
        contentAvailability: policy.contentAvailability,
        credentialsRequired: policy.credentialsRequired,
        credentialsConfigured: resource?.credentialsConfigured ?? false,
        canonicalUrl: policy.canonicalUrl,
        message: policy.productionUse,
      };
    });

  return {
    scope: "local_development_samples",
    collectionCount: HADITH_COLLECTIONS.length,
    localSampleCount: HADITH_DEVELOPMENT_SAMPLES.length,
    fullCorpusAvailable: false,
    fullCorpusBlocker: "credentials_rights_editorial_review",
    providers,
  };
}

export function registerHadithStatusRoutes(app: Express): void {
  app.get("/api/content/hadith/status", (_req, res) => {
    res.json(getHadithCorpusStatus());
  });
}
