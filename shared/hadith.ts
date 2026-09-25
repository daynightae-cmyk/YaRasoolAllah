export type HadithProviderIntegrationState =
  | "credential_blocked"
  | "external_reference_only";

export interface HadithProviderStatus {
  providerId: string;
  provider: string;
  integrationState: HadithProviderIntegrationState;
  rightsState: string;
  contentAvailability: string;
  credentialsRequired: boolean;
  credentialsConfigured: boolean;
  canonicalUrl: string;
  message: string;
}

export interface HadithCorpusStatus {
  scope: "local_development_samples";
  collectionCount: number;
  localSampleCount: number;
  fullCorpusAvailable: false;
  fullCorpusBlocker: "credentials_rights_editorial_review";
  providers: HadithProviderStatus[];
}
