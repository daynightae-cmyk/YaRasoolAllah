import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { test } from "node:test";
import type { Express } from "express";

process.env.JWT_SECRET = "ci-test-jwt-secret-key-value-32chars";
process.env.NODE_ENV = "test";
delete process.env.DATABASE_URL;

const { createApiApp } = await import("./create-app");
const { DEMO_ENDPOINT_GONE } = await import("./legacy-endpoints");
const { getPersistenceMode } = await import("./env");

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

test("health reports ephemeral memory persistence and quarantined demo endpoints", async () => {
  await withServer(createApiApp(), async (base) => {
    const response = await fetch(`${base}/api/health`);
    assert.equal(response.status, 200);
    assert.ok(response.headers.get("x-request-id"));
    const body = await response.json() as { persistence: string; demoEndpoints: string; auth: string };
    assert.equal(body.persistence, "memory");
    assert.equal(body.demoEndpoints, "quarantined");
    assert.equal(body.auth, "jwt-hs256");
  });
});

test("production cannot opt into ephemeral persistence", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousOverride = process.env.ALLOW_EPHEMERAL_PERSISTENCE;
  const previousCi = process.env.CI;
  try {
    process.env.NODE_ENV = "production";
    process.env.ALLOW_EPHEMERAL_PERSISTENCE = "1";
    delete process.env.CI;
    delete process.env.DATABASE_URL;
    assert.throws(() => getPersistenceMode(), /DATABASE_URL is required in production/);
    process.env.CI = "true";
    assert.equal(getPersistenceMode(), "memory");
  } finally {
    process.env.NODE_ENV = previousNodeEnv;
    if (previousOverride === undefined) delete process.env.ALLOW_EPHEMERAL_PERSISTENCE;
    else process.env.ALLOW_EPHEMERAL_PERSISTENCE = previousOverride;
    if (previousCi === undefined) delete process.env.CI;
    else process.env.CI = previousCi;
  }
});

test("demo-token is rejected and register/login persist hashed credentials", async () => {
  await withServer(createApiApp(), async (base) => {
    const demo = await fetch(`${base}/api/user/profile`, {
      headers: { authorization: "Bearer demo-token" },
    });
    assert.equal(demo.status, 403);

    const unique = `reader-${Date.now()}`;
    const registered = await fetch(`${base}/api/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: unique,
        email: `${unique}@example.com`,
        password: "long-enough-pass",
      }),
    });
    assert.equal(registered.status, 201);
    const created = await registered.json() as { token: string; user: { password?: string; email: string } };
    assert.ok(created.token);
    assert.notEqual(created.token, "demo-token");
    assert.equal(created.user.password, undefined);

    const profile = await fetch(`${base}/api/user/profile`, {
      headers: { authorization: `Bearer ${created.token}` },
    });
    assert.equal(profile.status, 200);
    const profileBody = await profile.json() as { username: string; password?: string };
    assert.equal(profileBody.username, unique);
    assert.equal(profileBody.password, undefined);

    const login = await fetch(`${base}/api/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: `${unique}@example.com`, password: "long-enough-pass" }),
    });
    assert.equal(login.status, 200);

    const wrong = await fetch(`${base}/api/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: `${unique}@example.com`, password: "nope-nope-nope" }),
    });
    assert.equal(wrong.status, 401);
  });
});

test("legacy demo knowledge endpoints are gone", async () => {
  await withServer(createApiApp(), async (base) => {
    const paths = [
      "/api/quran/surahs",
      "/api/quran/verses/1",
      "/api/seerah/topics",
      "/api/prayer-times/Makkah",
      "/api/azkar/morning",
      "/api/calendar/events",
      "/api/children/stories",
    ];

    for (const path of paths) {
      const response = await fetch(`${base}${path}`);
      assert.equal(response.status, 410, path);
      assert.deepEqual(await response.json(), DEMO_ENDPOINT_GONE);
    }

    const ai = await fetch(`${base}/api/ai/ask`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer demo-token" },
      body: JSON.stringify({ question: "what is islam" }),
    });
    assert.equal(ai.status, 410);
  });
});
