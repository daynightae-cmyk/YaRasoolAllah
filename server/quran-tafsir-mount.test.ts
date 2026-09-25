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

async function assertTafsirMounted(base: string): Promise<void> {
  const missing = await fetch(`${base}/api/content/quran/tafsir`);
  assert.equal(missing.status, 400);
  assert.match(missing.headers.get("content-type") ?? "", /application\/json/);
  const missingBody = await missing.json() as { message: string };
  assert.equal(missingBody.message, "يجب اختيار سورة من 1 إلى 114.");

  const invalid = await fetch(`${base}/api/content/quran/tafsir?surah=0`);
  assert.equal(invalid.status, 400);
  assert.match(invalid.headers.get("content-type") ?? "", /application\/json/);
}

test("tafsir route is mounted on the application server", async () => {
  await withServer(createApiApp(), assertTafsirMounted);
});

test("tafsir route is mounted on the public content server", async () => {
  await withServer(createPublicContentApp(), assertTafsirMounted);
});
