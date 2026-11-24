import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildIiifImageUrl, normalizeIiifManifest } from "../shared/iiif";

const v2 = {
  "@context": "http://iiif.io/api/presentation/2/context.json",
  "@id": "https://example.org/manifest-v2",
  "@type": "sc:Manifest",
  label: [{ "@value": "V2 manuscript", "@language": "en" }],
  attribution: "Example Library",
  license: "https://creativecommons.org/publicdomain/mark/1.0/",
  sequences: [{
    canvases: [{
      "@id": "https://example.org/canvas/1",
      label: "folio 1",
      width: 1200,
      height: 1800,
      images: [
        { resource: { "@id": "https://example.org/image/full.jpg" } },
        { resource: {
          "@id": "https://example.org/image/ignored.jpg",
          service: { "@id": "https://example.org/iiif/image-1" },
        } },
      ],
    }],
  }],
};

const v3 = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  id: "https://example.org/manifest-v3",
  type: "Manifest",
  label: { en: ["Test manuscript"], ar: ["مخطوط تجريبي"] },
  rights: "https://creativecommons.org/licenses/by/4.0/",
  requiredStatement: {
    label: { ar: ["الإسناد"] },
    value: { ar: ["المكتبة التجريبية"] },
  },
  items: [{
    id: "https://example.org/canvas/1",
    type: "Canvas",
    label: { none: ["الورقة ١"] },
    width: 1600,
    height: 2200,
    items: [{
      type: "AnnotationPage",
      items: [
        {
          motivation: "supplementing",
          body: { id: "https://example.org/not-the-page.txt", type: "Text" },
        },
        {
          motivation: "painting",
          body: {
            type: "Choice",
            items: [{
              id: "https://example.org/image/default.jpg",
              type: "Image",
              service: [{
                id: "https://example.org/iiif/image-v3/info.json",
                type: "ImageService3",
                profile: "level2",
              }],
            }],
          },
        },
      ],
    }],
  }],
};

describe("IIIF Presentation normalization", () => {
  it("normalizes v2 literals, attribution, rights, and image resources", () => {
    const parsed = normalizeIiifManifest(v2);
    assert.equal(parsed.presentationVersion, 2);
    assert.equal(parsed.label, "V2 manuscript");
    assert.equal(parsed.attribution, "Example Library");
    assert.equal(parsed.canvases.length, 1);
    assert.equal(parsed.canvases[0].label, "folio 1");
    assert.equal(parsed.canvases[0].imageUrl, "https://example.org/image/full.jpg");
    assert.equal(parsed.canvases[0].imageService, undefined);
  });

  it("normalizes v3 language maps, required statements, painting annotations, and Choice bodies", () => {
    const parsed = normalizeIiifManifest(v3);
    assert.equal(parsed.presentationVersion, 3);
    assert.equal(parsed.label, "مخطوط تجريبي");
    assert.equal(parsed.canvases[0].label, "الورقة ١");
    assert.equal(parsed.requiredStatement, "الإسناد: المكتبة التجريبية");
    assert.equal(parsed.canvases[0].imageService, "https://example.org/iiif/image-v3/info.json");
    assert.equal(parsed.canvases[0].imageUrl, "https://example.org/iiif/image-v3/full/1600,/0/default.jpg");
  });

  it("rejects non-object and image-free manifests instead of inventing pages", () => {
    assert.throws(() => normalizeIiifManifest(null), /JSON object/);
    assert.throws(() => normalizeIiifManifest({ id: "https://example.org/empty", items: [] }), /no playable image canvases/);
    assert.throws(() => normalizeIiifManifest({ sequences: [{ canvases: [{}] }] }), /no playable image canvases/);
  });

  it("builds bounded canonical service URLs", () => {
    assert.equal(
      buildIiifImageUrl("https://example.org/iiif/image/info.json/", 2200),
      "https://example.org/iiif/image/full/2200,/0/default.jpg",
    );
    assert.match(buildIiifImageUrl("https://example.org/iiif/image", 99_999), /\/4096,\//);
    assert.match(buildIiifImageUrl("https://example.org/iiif/image", Number.NaN), /\/1600,\//);
  });
});
