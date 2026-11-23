import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import type { Express } from "express";

process.env.JWT_SECRET = "ci-test-jwt-secret-key-value-32chars";
process.env.NODE_ENV = "test";
delete process.env.DATABASE_URL;

const { createApiApp } = await import("./create-app");
const { createPublicContentApp } = await import("./create-public-content-app");

const manifest = {
  id: "https://gallica.bnf.fr/iiif/ark:/12148/serverless/manifest.json",
  type: "Manifest",
  label: { en: ["Serverless manuscript"] },
  items: [{
    id: "https://gallica.bnf.fr/canvas/1",
    type: "Canvas",
    label: { en: ["1r"] },
    items: [{
      type: "AnnotationPage",
      items: [{
        motivation: "painting",
        body: {
          id: "https://gallica.bnf.fr/iiif/serverless/full/full/0/default.jpg",
          type: "Image",
          service: [{ id: "https://gallica.bnf.fr/iiif/serverless", type: "ImageService3" }],
        },
      }],
    }],
  }],
};

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

test("main and public-content serverless apps both mount the governed IIIF endpoint", { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  let upstreamCalls = 0;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const raw = input instanceof Request ? input.url : String(input);
    if (new URL(raw).hostname === "gallica.bnf.fr") {
      upstreamCalls += 1;
      return new Response(JSON.stringify(manifest), { headers: { "content-type": "application/json" } });
    }
    return originalFetch(input, init);
  }) as typeof fetch;

  try {
    for (const [name, factory] of [["main", createApiApp], ["public-content", createPublicContentApp]] as const) {
      await withServer(factory(), async (base) => {
        const source = `https://gallica.bnf.fr/iiif/ark:/12148/serverless/manifest.json?mount=${name}`;
        const response = await fetch(`${base}/api/content/iiif/manifest?url=${encodeURIComponent(source)}`);
        assert.equal(response.status, 200, name);
        assert.match(response.headers.get("content-security-policy") ?? "", /default-src 'none'/);
        const body = await response.json() as { availability: string; manifest: { label: string; presentationVersion: number } };
        assert.equal(body.availability, "external_iiif_manifest");
        assert.equal(body.manifest.label, "Serverless manuscript");
        assert.equal(body.manifest.presentationVersion, 3);

        const rejected = await fetch(`${base}/api/content/iiif/manifest?url=${encodeURIComponent("http://gallica.bnf.fr/manifest")}`);
        assert.equal(rejected.status, 400, `${name} must reject insecure manifests`);
      });
    }
    assert.equal(upstreamCalls, 2, "each app should fetch its distinct uncached source once");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
