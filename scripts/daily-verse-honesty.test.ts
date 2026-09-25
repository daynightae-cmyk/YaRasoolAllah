import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Express } from "express";

process.env.JWT_SECRET = "ci-test-jwt-secret-key-value-32chars";
process.env.NODE_ENV = "test";
delete process.env.DATABASE_URL;

const { createApiApp } = await import("../server/create-app");
const { createPublicContentApp } = await import("../server/create-public-content-app");
const { API_ROUTE_NOT_FOUND } = await import("../server/api-not-found");
const { DEMO_ENDPOINT_GONE } = await import("../server/legacy-endpoints");
const { dailyVerseDayKey } = await import("../client/src/services/quranService");

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const dailyVersePage = readFileSync(join(repoRoot, "client/src/pages/DailyVersePage.tsx"), "utf8");
const viteServer = readFileSync(join(repoRoot, "server/vite.ts"), "utf8");

async function withServer(app: Express, run: (base: string) => Promise<void>): Promise<void> {
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}

const apps: Array<[string, () => Express, string]> = [
  ["api", createApiApp, "/api/health"],
  ["public-content", createPublicContentApp, "/api/content/hadith/status"],
];

describe("unknown API paths fail as JSON instead of the SPA shell", () => {
  for (const [label, createApp, probePath] of apps) {
    it(`${label}: missing route returns 404 JSON`, async () => {
      await withServer(createApp(), async (base) => {
        for (const path of ["/api/does-not-exist", "/api/quran/anything", "/api/a/b/c"]) {
          const response = await fetch(`${base}${path}`);
          assert.equal(response.status, 404, `${label} ${path}`);
          assert.match(response.headers.get("content-type") ?? "", /application\/json/, path);
          const body = (await response.json()) as Record<string, unknown>;
          assert.equal(body.code, API_ROUTE_NOT_FOUND.code, path);
          assert.equal(body.status, API_ROUTE_NOT_FOUND.status, path);
          assert.equal(body.path, path, path);
        }
      });
    });

    it(`${label}: real routes are not shadowed by the 404`, async () => {
      await withServer(createApp(), async (base) => {
        const response = await fetch(`${base}${probePath}`);
        assert.equal(response.status, 200, `${label} ${probePath}`);
        const body = (await response.json()) as Record<string, unknown>;
        assert.equal(body.status !== "not_found", true, `${label} ${probePath}`);
      });
    });
  }

  it("registers the JSON 404 before the error handler on both apps", () => {
    const api = readFileSync(join(repoRoot, "server/create-app.ts"), "utf8");
    const publicContent = readFileSync(
      join(repoRoot, "server/create-public-content-app.ts"),
      "utf8",
    );
    for (const source of [api, publicContent]) {
      assert.match(source, /registerApiNotFound\(app\)/);
      assert.ok(
        source.indexOf("registerApiNotFound(app)") < source.indexOf("errorHandler)"),
        "the API 404 must be registered before the error handler",
      );
    }
  });
});

describe("legacy daily-verse endpoints are quarantined", () => {
  it("return the 410 JSON contract on the api app", async () => {
    await withServer(createApiApp(), async (base) => {
      for (const path of ["/api/quran/daily-verse", "/api/daily-verse"]) {
        const response = await fetch(`${base}${path}`);
        assert.equal(response.status, 410, path);
        assert.deepEqual(await response.json(), DEMO_ENDPOINT_GONE);
      }
    });
  });
});

describe("daily verse page makes no unsourced reward claim", () => {
  it("drops the fabricated reward arithmetic", () => {
    assert.equal(/shareStats\.total\s*\*\s*\d+/.test(dailyVersePage), false);
    assert.equal(dailyVersePage.includes("أجرك المتراكم"), false);
    assert.equal(dailyVersePage.includes("بإذن الله تعالى"), false);
    assert.equal(dailyVersePage.includes("} حسنة"), false);
  });

  it("states the boundary instead of promising a reward", () => {
    assert.match(dailyVersePage, /data-honesty="no-reward-claim"/);
    assert.match(dailyVersePage, /لا تذكر هذه الصفحة أجرًا أو ثوابًا محددًا/);
    assert.match(dailyVersePage, /دون ادعاء ثواب مضمون أو إحصاءات جمهور/);
  });

  it("keeps the verse sourced from the governed corpus, not a missing API", () => {
    assert.match(dailyVersePage, /queryKey: \["daily-verse-of-the-day", dailyVerseDayKey\(\)\]/);
    assert.match(dailyVersePage, /queryFn: getDailyVerse/);
    assert.equal(
      dailyVersePage.includes('queryKey: ["/api/quran/daily-verse"]'),
      false,
      "the page must not be labelled as if it fetched a route that never existed",
    );
  });

  it("rotates the daily verse cache per day", () => {
    const first = dailyVerseDayKey(new Date("2026-09-25T00:30:00"));
    const sameDay = dailyVerseDayKey(new Date("2026-09-25T23:30:00"));
    const nextDay = dailyVerseDayKey(new Date("2026-09-26T00:30:00"));
    assert.equal(first, sameDay);
    assert.notEqual(first, nextDay);
    assert.ok(Number.isInteger(first) && first > 0);
  });

  it("gives every switch an accessible name", () => {
    const switches = [...dailyVersePage.matchAll(/<Switch\b[\s\S]*?\/>/g)].map((match) => match[0]);
    assert.ok(switches.length >= 8, `expected the daily verse switches, found ${switches.length}`);
    for (const element of switches) {
      assert.match(element, /aria-label=/, `switch without an accessible name: ${element.slice(0, 80)}`);
    }
  });
});

describe("the SPA fallback stays a page fallback", () => {
  it("is registered after the API routes in both apps", () => {
    assert.match(viteServer, /app\.use\("\*"/);
    const api = readFileSync(join(repoRoot, "server/create-app.ts"), "utf8");
    const publicContent = readFileSync(
      join(repoRoot, "server/create-public-content-app.ts"),
      "utf8",
    );
    assert.equal(api.includes('app.use("/api"'), false, "the 404 is registered by a helper");
    assert.equal(publicContent.includes('app.use("/api"'), false, "the 404 is registered by a helper");
  });
});
