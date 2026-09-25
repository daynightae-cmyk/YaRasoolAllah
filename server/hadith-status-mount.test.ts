import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { test } from "node:test";
import type { Express } from "express";

process.env.JWT_SECRET = "ci-test-jwt-secret-key-value-32chars";
process.env.NODE_ENV = "test";
delete process.env.DATABASE_URL;

const { createApiApp } = await import("./create-app");
const { createPublicContentApp } = await import("./create-public-content-app");

async function withServer(app: Express, run: (base: string) => Promise<void>): Promise<void> {
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

async function assertStatusMounted(base: string): Promise<void> {
  const response = await fetch(`${base}/api/content/hadith/status`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /application\/json/);
  const body = await response.json() as {
    scope: string;
    collectionCount: number;
    localSampleCount: number;
    fullCorpusAvailable: boolean;
    fullCorpusBlocker: string;
    providers: Array<{
      provider: string;
      integrationState: string;
      credentialsRequired: boolean;
      credentialsConfigured: boolean;
    }>;
  };
  assert.equal(body.scope, "local_development_samples");
  assert.equal(body.collectionCount, 6);
  assert.equal(body.localSampleCount, 4);
  assert.equal(body.fullCorpusAvailable, false);
  assert.equal(body.fullCorpusBlocker, "credentials_rights_editorial_review");
  assert.equal(body.providers.find((provider) => provider.provider === "Sunnah.com")?.integrationState, "credential_blocked");
  assert.equal(body.providers.find((provider) => provider.provider === "Dorar")?.integrationState, "external_reference_only");
  assert.equal(body.providers.find((provider) => provider.provider === "Sunnah.com")?.credentialsConfigured, false);
}

test("Hadith corpus status is mounted on the application server", async () => {
  await withServer(createApiApp(), assertStatusMounted);
});

test("Hadith corpus status is mounted on the public content server", async () => {
  await withServer(createPublicContentApp(), assertStatusMounted);
});
