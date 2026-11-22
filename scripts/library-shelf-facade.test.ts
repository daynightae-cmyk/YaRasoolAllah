import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";
import { compressedDataJson } from "../server/static-json";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

const shelf = read("client/src/visual-golden/components/library/LibraryLivingShelf.tsx");
const shelfCss = read("client/src/visual-golden/components/library/LibraryLivingShelf.module.css");
const domains = read("client/src/visual-golden/components/library/LibraryDomainShelves.tsx");
const domainsCss = read("client/src/visual-golden/components/library/LibraryDomainShelves.module.css");
const page = read("client/src/visual-golden/pages/LibraryPage.tsx");
const pageCss = read("client/src/visual-golden/pages/LibraryPage.module.css");

test("the living shelf is a two-row facade, not a single banner row", () => {
  assert.match(shelf, /const SHELF_ROWS = 2/);
  assert.match(shelf, /const PAGE_SIZE = SHELF_SIZE \* SHELF_ROWS/);
  assert.match(shelf, /data-shelf-row=\{rowIndex\}/);
  assert.match(shelf, /className=\{styles\.ledge\}/);
  assert.match(shelfCss, /\.facade/);
  assert.match(shelfCss, /\.ledge/);
  // Every volume is still a governed readable work — the facade cannot
  // decorate itself with invented books to fill the second row.
  assert.match(shelf, /canReadTextInside\(work\)/);
});

test("domain gateways are shelves of real catalog spines, not a flat card grid", () => {
  assert.match(page, /<LibraryDomainShelves/);
  assert.doesNotMatch(page, /gatewayGrid/);
  assert.doesNotMatch(pageCss, /\.gatewayGrid/);
  assert.match(domains, /data-domain-shelf=\{domain\.category\}/);
  assert.match(domains, /data-domain-gateway=\{domain\.category\}/);
  assert.match(domains, /hashWorkId\(work\.id\)/);
  assert.match(domains, /displayTitle\(work, lang\)/);
  assert.match(domains, /SPINES_PER_DOMAIN/);
  // The count on each plate is derived from the loaded works, never typed.
  assert.match(domains, /domainWorks\.length/);
  assert.match(domainsCss, /\.spineBay/);
  assert.match(domainsCss, /\.ledge/);
});

test("the hall suppresses its duplicate gateway grid when the page mounts domain shelves", () => {
  const hall = read("client/src/visual-golden/components/library/CatalogShelfHall.tsx");
  assert.match(hall, /hideDomainGrid/);
  assert.match(hall, /!category && !hideDomainGrid/);
  assert.match(page, /<CatalogShelfHall[\s\S]*?hideDomainGrid/);
});

test("the facade and the domain shelves keep reduced-motion fallbacks", () => {
  assert.match(shelfCss, /prefers-reduced-motion/);
  assert.match(domainsCss, /prefers-reduced-motion/);
});

test("the engine stays lazy and the reading chamber stays mounted", () => {
  assert.match(page, /const Library3D = lazy\(/);
  assert.match(page, /<CatalogReadingChamber/);
  assert.match(page, /<LibraryLivingShelf works=\{payload\.works\}/);
});

// --- compressed catalog delivery, exercised against the real file ---------

interface FakeRes {
  headers: Map<string, string | number>;
  body: Buffer | null;
  ended: boolean;
  setHeader(name: string, value: string | number): void;
  end(body?: Buffer): void;
}

function fakeRes(): FakeRes {
  return {
    headers: new Map(),
    body: null,
    ended: false,
    setHeader(name, value) { this.headers.set(name.toLowerCase(), value); },
    end(body) { this.body = body ?? null; this.ended = true; },
  };
}

const publicDir = join(repoRoot, "client", "public");
const catalogPath = "/data/library-catalog.v1.json";

test("the catalog crosses the wire gzipped and much smaller than raw", () => {
  const handler = compressedDataJson(publicDir);
  const res = fakeRes();
  let fellThrough = false;
  handler(
    { method: "GET", path: catalogPath, headers: { "accept-encoding": "gzip, deflate, br" } } as never,
    res as never,
    () => { fellThrough = true; },
  );
  assert.equal(fellThrough, false);
  assert.equal(res.ended, true);
  assert.equal(res.headers.get("content-encoding"), "gzip");
  assert.equal(res.headers.get("vary"), "Accept-Encoding");
  const raw = readFileSync(join(publicDir, "data", "library-catalog.v1.json"));
  assert.ok(res.body);
  assert.ok(res.body.length < raw.length * 0.2, "gzip must cut the catalog below a fifth of its raw size");
  assert.deepEqual(zlib.gunzipSync(res.body), raw, "the gzipped body must decompress to the exact catalog");
});

test("clients without gzip still receive the exact raw catalog", () => {
  const handler = compressedDataJson(publicDir);
  const res = fakeRes();
  handler(
    { method: "GET", path: catalogPath, headers: {} } as never,
    res as never,
    () => { throw new Error("must not fall through"); },
  );
  assert.equal(res.headers.get("content-encoding"), undefined);
  const raw = readFileSync(join(publicDir, "data", "library-catalog.v1.json"));
  assert.deepEqual(res.body, raw);
});

test("path traversal and non-data requests fall through untouched", () => {
  const handler = compressedDataJson(publicDir);
  for (const path of ["/data/../index.html", "/data/%2e%2e/server/env.ts", "/api/status", "/data/notes.txt"]) {
    const res = fakeRes();
    let fellThrough = false;
    handler(
      { method: "GET", path, headers: { "accept-encoding": "gzip" } } as never,
      res as never,
      () => { fellThrough = true; },
    );
    assert.equal(fellThrough, true, `${path} must fall through`);
    assert.equal(res.ended, false);
  }
});

test("HEAD answers headers without a body", () => {
  const handler = compressedDataJson(publicDir);
  const res = fakeRes();
  handler(
    { method: "HEAD", path: catalogPath, headers: { "accept-encoding": "gzip" } } as never,
    res as never,
    () => { throw new Error("must not fall through"); },
  );
  assert.equal(res.ended, true);
  assert.equal(res.body, null);
  assert.ok(Number(res.headers.get("content-length")) > 0);
});

test("the server mounts the compressed data route in both modes", () => {
  const index = read("server/index.ts");
  assert.match(index, /compressedDataJson\(/);
  assert.equal((index.match(/compressedDataJson\(/g) ?? []).length, 2);
});
