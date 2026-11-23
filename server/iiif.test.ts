import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { describe, it } from "node:test";
import express, { type Express } from "express";
import { normalizeIiifManifest } from "../shared/iiif";
import {
  fetchIiifManifestDocument,
  IiifRequestError,
  readResponseTextWithLimit,
  registerIiifRoutes,
  validateIiifManifestResources,
  validatedIiifSource,
} from "./iiif";

const GALLICA_MANIFEST = "https://gallica.bnf.fr/iiif/ark:/12148/test/manifest.json";
const QDL_MANIFEST = "https://www.qdl.qa/en/iiif/qnlhc/12933/manifest";

function payload(imageService = "https://gallica.bnf.fr/iiif/image-1", rights = "https://creativecommons.org/publicdomain/mark/1.0/") {
  return {
    id: GALLICA_MANIFEST,
    type: "Manifest",
    label: { en: ["Governed test manuscript"] },
    rights,
    requiredStatement: { label: { en: ["Attribution"] }, value: { en: ["BnF Gallica"] } },
    items: [{
      id: "https://gallica.bnf.fr/canvas/1",
      type: "Canvas",
      label: { en: ["folio 1r"] },
      items: [{
        type: "AnnotationPage",
        items: [{
          motivation: "painting",
          body: { id: `${imageService}/full/full/0/default.jpg`, type: "Image", service: [{ id: imageService, type: "ImageService3" }] },
        }],
      }],
    }],
  };
}

function responseJson(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json" } });
}

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

async function expectIiifCode(promise: Promise<unknown>, code: string): Promise<void> {
  await assert.rejects(promise, (error) => {
    assert.ok(error instanceof IiifRequestError);
    assert.equal(error.code, code);
    return true;
  });
}

describe("IIIF URL and upstream resource policy", () => {
  it("accepts only exact HTTPS provider hosts without credentials or custom ports", () => {
    assert.equal(validatedIiifSource(GALLICA_MANIFEST)?.provider, "BnF Gallica");
    assert.equal(validatedIiifSource(QDL_MANIFEST)?.provider, "Qatar Digital Library");
    for (const rejected of [
      "http://gallica.bnf.fr/manifest",
      "https://gallica.bnf.fr.evil.example/manifest",
      "https://evil.example/manifest",
      "https://user:secret@gallica.bnf.fr/manifest",
      "https://gallica.bnf.fr:8443/manifest",
    ]) {
      assert.equal(validatedIiifSource(rejected), null, rejected);
    }
  });

  it("validates every normalized image, service, and rights URL", () => {
    const source = validatedIiifSource(GALLICA_MANIFEST)!;
    const manifest = normalizeIiifManifest(payload());
    assert.equal(validateIiifManifestResources(manifest, source), manifest);

    for (const unsafe of [
      { ...manifest, canvases: [{ ...manifest.canvases[0], imageService: "http://gallica.bnf.fr/iiif/image-1" }] },
      { ...manifest, canvases: [{ ...manifest.canvases[0], imageUrl: "https://evil.example/image.jpg" }] },
      { ...manifest, rights: "http://creativecommons.org/publicdomain/mark/1.0/" },
      { ...manifest, rights: "https://evil.example/license" },
    ]) {
      assert.throws(
        () => validateIiifManifestResources(unsafe, source),
        (error: unknown) => error instanceof IiifRequestError && /not_allowed/.test(error.code),
      );
    }
  });

  it("revalidates every redirect and never silently follows HTTP or another provider", async () => {
    const source = validatedIiifSource(GALLICA_MANIFEST)!;
    let redirects = 0;
    const unsafeFetch = (async () => {
      redirects += 1;
      return new Response(null, { status: 302, headers: { location: "http://gallica.bnf.fr/next" } });
    }) as typeof fetch;
    await expectIiifCode(fetchIiifManifestDocument(source, unsafeFetch), "redirect_not_allowed");
    assert.equal(redirects, 1);

    const calls: Array<{ url: string; redirect?: RequestRedirect }> = [];
    const safeFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(input), redirect: init?.redirect });
      if (calls.length === 1) {
        return new Response(null, { status: 302, headers: { location: "/iiif/next-manifest" } });
      }
      return responseJson(payload());
    }) as typeof fetch;
    const manifest = await fetchIiifManifestDocument(source, safeFetch);
    assert.equal(manifest.label, "Governed test manuscript");
    assert.equal(calls.length, 2);
    assert.ok(calls.every((call) => call.redirect === "manual"));
  });
});

describe("bounded manifest streaming", () => {
  it("accepts a body at the cap and cancels a chunked body as soon as it crosses the cap", async () => {
    const streamed = (chunks: string[]) => new Response(new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(new TextEncoder().encode(chunk));
        controller.close();
      },
    }));
    assert.equal(await readResponseTextWithLimit(streamed(["ab", "cde"]), 5), "abcde");
    await expectIiifCode(readResponseTextWithLimit(streamed(["abc", "def"]), 5), "manifest_too_large");
    await expectIiifCode(
      readResponseTextWithLimit(new Response("abcdef", { headers: { "content-length": "6" } }), 5),
      "manifest_too_large",
    );
  });
});

describe("IIIF manifest route", () => {
  it("blocks open-proxy requests, streams valid manifests, caches success, and reports live 403s", async () => {
    const app = express();
    let upstreamCalls = 0;
    const upstream = (async (input: RequestInfo | URL) => {
      upstreamCalls += 1;
      if (String(input).startsWith("https://www.qdl.qa/")) return new Response("blocked", { status: 403 });
      return responseJson(payload());
    }) as typeof fetch;
    registerIiifRoutes(app, { fetchImpl: upstream });

    await withServer(app, async (base) => {
      const rejected = await fetch(`${base}/api/content/iiif/manifest?url=${encodeURIComponent("https://evil.example/manifest")}`);
      assert.equal(rejected.status, 400);
      assert.equal((await rejected.json() as { code: string }).code, "provider_not_allowed");
      assert.equal(upstreamCalls, 0);

      const insecure = await fetch(`${base}/api/content/iiif/manifest?url=${encodeURIComponent("http://gallica.bnf.fr/manifest")}`);
      assert.equal(insecure.status, 400);
      assert.equal(upstreamCalls, 0);

      const query = `${GALLICA_MANIFEST}?route=success`;
      const loaded = await fetch(`${base}/api/content/iiif/manifest?url=${encodeURIComponent(query)}`);
      assert.equal(loaded.status, 200);
      const body = await loaded.json() as { cached: boolean; manifest: { label: string; canvases: unknown[] } };
      assert.equal(body.cached, false);
      assert.equal(body.manifest.label, "Governed test manuscript");
      assert.equal(body.manifest.canvases.length, 1);

      const cached = await fetch(`${base}/api/content/iiif/manifest?url=${encodeURIComponent(query)}`);
      assert.equal((await cached.json() as { cached: boolean }).cached, true);
      assert.equal(upstreamCalls, 1);

      const blocked = await fetch(`${base}/api/content/iiif/manifest?url=${encodeURIComponent(QDL_MANIFEST)}`);
      assert.equal(blocked.status, 502);
      const blockedBody = await blocked.json() as { code: string; upstreamStatus: number };
      assert.equal(blockedBody.code, "provider_blocked");
      assert.equal(blockedBody.upstreamStatus, 403);
    });
  });

  it("rejects malicious manifest-derived resources before caching or returning them", async () => {
    const app = express();
    registerIiifRoutes(app, { fetchImpl: (async () => responseJson(payload("https://evil.example/image"))) as typeof fetch });
    await withServer(app, async (base) => {
      const response = await fetch(`${base}/api/content/iiif/manifest?url=${encodeURIComponent(`${GALLICA_MANIFEST}?route=unsafe-resource`)}`);
      assert.equal(response.status, 502);
      assert.equal((await response.json() as { code: string }).code, "manifest_resource_not_allowed");
    });
  });
});
