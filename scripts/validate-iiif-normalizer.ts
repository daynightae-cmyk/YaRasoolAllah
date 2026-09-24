import assert from "node:assert/strict";
import {
  buildIiifImageUrl,
  normalizeIiifManifest,
} from "../shared/iiif";

const v2 = {
  "@context": "http://iiif.io/api/presentation/2/context.json",
  "@id": "https://example.org/manifest-v2",
  "@type": "sc:Manifest",
  label: "V2 manuscript",
  attribution: "Example Library",
  license: "https://creativecommons.org/publicdomain/mark/1.0/",
  sequences: [
    {
      canvases: [
        {
          "@id": "https://example.org/canvas/1",
          label: "folio 1",
          width: 1200,
          height: 1800,
          images: [
            {
              resource: {
                "@id": "https://example.org/image/full.jpg",
                service: {
                  "@id": "https://example.org/iiif/image-1",
                  profile: "http://iiif.io/api/image/2/level2.json",
                },
              },
            },
          ],
        },
      ],
    },
  ],
};

const v3 = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  id: "https://example.org/manifest-v3",
  type: "Manifest",
  label: { ar: ["مخطوط تجريبي"], en: ["Test manuscript"] },
  rights: "https://creativecommons.org/licenses/by/4.0/",
  requiredStatement: {
    label: { ar: ["الإسناد"] },
    value: { ar: ["المكتبة التجريبية"] },
  },
  items: [
    {
      id: "https://example.org/canvas/1",
      type: "Canvas",
      label: { ar: ["الورقة ١"] },
      width: 1600,
      height: 2200,
      items: [
        {
          id: "https://example.org/page/1",
          type: "AnnotationPage",
          items: [
            {
              id: "https://example.org/annotation/1",
              type: "Annotation",
              motivation: "painting",
              body: {
                id: "https://example.org/image/default.jpg",
                type: "Image",
                service: [
                  {
                    id: "https://example.org/iiif/image-v3",
                    type: "ImageService3",
                    profile: "level2",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};

const parsedV2 = normalizeIiifManifest(v2);
assert.equal(parsedV2.presentationVersion, 2);
assert.equal(parsedV2.canvases.length, 1);
assert.equal(parsedV2.canvases[0].label, "folio 1");
assert.equal(
  parsedV2.canvases[0].imageUrl,
  "https://example.org/iiif/image-1/full/1600,/0/default.jpg",
);

const parsedV3 = normalizeIiifManifest(v3);
assert.equal(parsedV3.presentationVersion, 3);
assert.equal(parsedV3.label, "مخطوط تجريبي");
assert.equal(parsedV3.canvases[0].label, "الورقة ١");
assert.equal(parsedV3.requiredStatement, "الإسناد: المكتبة التجريبية");
assert.equal(
  parsedV3.canvases[0].imageService,
  "https://example.org/iiif/image-v3",
);

assert.equal(
  buildIiifImageUrl("https://example.org/iiif/image/", 2200),
  "https://example.org/iiif/image/full/2200,/0/default.jpg",
);

assert.throws(
  () => normalizeIiifManifest({ id: "https://example.org/empty", items: [] }),
  /no playable image canvases/,
);

console.log("validate-iiif PASS: v2 + v3 normalization and image URL contract");
