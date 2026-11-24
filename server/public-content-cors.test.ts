import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { test } from "node:test";
import type { Express } from "express";

import { createPublicContentApp } from "./create-public-content-app.js";
import { NATIVE_SHELL_ORIGINS } from "./native-shell-cors.js";

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

test("public content app answers native shells with the shared CORS allowlist", async () => {
  await withServer(createPublicContentApp(), async (base) => {
    const allowed = await fetch(`${base}/api/content/hadith/status`, {
      headers: { origin: "https://localhost" },
    });
    assert.equal(allowed.status, 200);
    assert.equal(allowed.headers.get("access-control-allow-origin"), "https://localhost");
    assert.equal(allowed.headers.get("access-control-allow-credentials"), null);

    const preflight = await fetch(`${base}/api/content/iiif/manifest?url=https%3A%2F%2Fgallica.bnf.fr%2Fx`, {
      method: "OPTIONS",
      headers: { origin: "capacitor://localhost", "access-control-request-method": "GET" },
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get("access-control-allow-origin"), "capacitor://localhost");
    assert.equal(preflight.headers.get("access-control-allow-methods"), "GET, OPTIONS");

    const foreign = await fetch(`${base}/api/content/hadith/status`, {
      headers: { origin: "https://evil.example.com" },
    });
    assert.equal(foreign.status, 200);
    assert.equal(foreign.headers.get("access-control-allow-origin"), null);
  });
});

test("the native-shell allowlist stays exact and never wildcarded", () => {
  assert.equal(NATIVE_SHELL_ORIGINS.has("https://evil.example.com"), false);
  assert.equal(NATIVE_SHELL_ORIGINS.has("*"), false);
  assert.equal(NATIVE_SHELL_ORIGINS.has("https://localhost.evil.example.com"), false);
  for (const origin of ["https://localhost", "capacitor://localhost", "yra://institution"]) {
    assert.equal(NATIVE_SHELL_ORIGINS.has(origin), true, origin);
  }
});
