import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import express from "express";
import { createMainApiHandler, RUNTIME_CONFIG_MISSING } from "./vercel-main-api";

type ResponseSnapshot = {
  status: number;
  contentType: string | null;
  body: unknown;
};

async function request(
  handler: ReturnType<typeof createMainApiHandler>,
  path = "/api/health",
): Promise<ResponseSnapshot> {
  const server = createServer(handler);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("test server did not expose a TCP port");
  }

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`);
    return {
      status: response.status,
      contentType: response.headers.get("content-type"),
      body: await response.json(),
    };
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

test("main API handler returns a structured, secret-free 503 when startup config is missing", async () => {
  const originalError = console.error;
  console.error = () => {};
  try {
    const handler = createMainApiHandler(() => {
      throw new Error(
        "DATABASE_URL is required in production. JWT_SECRET is required in production.",
      );
    });

    const response = await request(handler);

    assert.equal(response.status, 503);
    assert.match(response.contentType ?? "", /application\/json/);
    assert.deepEqual(response.body, RUNTIME_CONFIG_MISSING);
    const serialized = JSON.stringify(response.body);
    assert.doesNotMatch(serialized, /DATABASE_URL/);
    assert.doesNotMatch(serialized, /JWT_SECRET/);
  } finally {
    console.error = originalError;
  }
});

test("main API handler catches a lazily imported app that throws at module load", async () => {
  const originalError = console.error;
  console.error = () => {};
  try {
    const handler = createMainApiHandler(async () => {
      throw new Error(
        "DATABASE_URL is required in production. Ephemeral persistence is allowed only for an explicit CI smoke run.",
      );
    });

    const response = await request(handler);

    assert.equal(response.status, 503);
    assert.deepEqual(response.body, RUNTIME_CONFIG_MISSING);
  } finally {
    console.error = originalError;
  }
});

test("main API handler delegates to a healthy app without changing the response", async () => {
  const app = express();
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, persistence: "memory" });
  });

  const handler = createMainApiHandler(() => app);
  const response = await request(handler);

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { ok: true, persistence: "memory" });
});
