import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const output = "artifacts/evidence/mushaf-recovery";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: "reduce", hasTouch: width === 390 });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("http://localhost:3000/quran?surah=1&ayah=1&door=0&ceremony=0");
    const mushaf = page.locator('[data-visual="quran-mushaf"]');
    await mushaf.waitFor({ timeout: 60000 });
    assert.equal(await mushaf.count(), 1);
    assert.equal(await mushaf.locator('[data-visual="quran-spread"]').count(), 1);
    assert.equal(await mushaf.locator("[data-quran-page]").count(), 2);
    assert.equal(await mushaf.locator("[data-ayah]").count(), 7);
    assert.equal(await mushaf.locator('[id^="quran-ayah-1-"]').count(), 7);
    await mushaf.scrollIntoViewIfNeeded();
    await mushaf.screenshot({ path: `${output}/opening-${width}.png` });
    await page.goto("http://localhost:3000/quran?surah=2&ayah=1&door=0&ceremony=0");
    await mushaf.waitFor({ timeout: 60000 });
    const book = mushaf.getByRole("group");
    const first = await mushaf.locator('[data-quran-page="right"] [data-ayah]').first().getAttribute("data-ayah");
    await book.focus();
    await book.press("PageDown");
    await page.waitForFunction((previous) => globalThis.document.querySelector('[data-quran-page="right"] [data-ayah]')?.getAttribute("data-ayah") !== previous, first);
    const next = await mushaf.locator('[data-quran-page="right"] [data-ayah]').first().getAttribute("data-ayah");
    assert.notEqual(first, next);
    await book.focus();
    await book.press("PageUp");
    await page.waitForFunction((expected) => globalThis.document.querySelector('[data-quran-page="right"] [data-ayah]')?.getAttribute("data-ayah") === expected, first);
    await mushaf.locator('[data-quran-page="right"] [data-ayah]').first().click();
    assert.equal(await mushaf.locator('[data-quran-page="right"] [data-ayah]').first().getAttribute("aria-pressed"), "true");
    if (width === 390) {
      const corner = mushaf.locator('[data-page-corner="next"]');
      await corner.scrollIntoViewIfNeeded();
      const bounds = await corner.boundingBox();
      assert.ok(bounds);
      const x = bounds.x + bounds.width / 2;
      const y = bounds.y + bounds.height / 2;
      const cdp = await context.newCDPSession(page);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: Math.max(0, x - 85), y }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await page.waitForFunction((expected) => globalThis.document.querySelector('[data-quran-page="right"] [data-ayah]')?.getAttribute("data-ayah") === expected, next);
      assert.equal(await mushaf.locator('[data-quran-page="right"] [data-ayah]').first().getAttribute("data-ayah"), next);
      await cdp.detach();
    }
    await mushaf.scrollIntoViewIfNeeded();
    await mushaf.screenshot({ path: `${output}/reading-${width}.png` });
    assert.deepEqual(errors, []);
    results.push({ width, singleMushaf: true, openingRecords: 7, first, next, keyboardForwardBack: true, ayahSelection: true, touchCornerSingleTurn: width === 390 ? true : "not applicable", errors });
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference" });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/quran?surah=2&ayah=1&door=0&ceremony=0");
  const mushaf = page.locator('[data-visual="quran-mushaf"]');
  await mushaf.waitFor({ timeout: 60000 });
  assert.equal(await mushaf.getAttribute("data-reduced-motion"), "false");
  const first = await mushaf.locator('[data-quran-page="right"] [data-ayah]').first().getAttribute("data-ayah");
  await mushaf.evaluate((element) => {
    globalThis.mushafRotationSamples = [];
    globalThis.mushafHiddenFocusableCount = 0;
    globalThis.mushafRotationObserver = new globalThis.MutationObserver(() => {
      const leaf = element.querySelector('[data-visual="quran-turning-leaf"]');
      if (!leaf) return;
      globalThis.mushafHiddenFocusableCount = Math.max(globalThis.mushafHiddenFocusableCount, Array.from(leaf.querySelectorAll("button")).filter((button) => button.tabIndex >= 0).length);
      const transform = globalThis.getComputedStyle(leaf).transform;
      if (Math.abs(new globalThis.DOMMatrix(transform).m13) > 0.02 && leaf.getBoundingClientRect().width > 1) globalThis.mushafRotationSamples.push(transform);
    });
    globalThis.mushafRotationObserver.observe(element, { subtree: true, attributes: true, childList: true });
  });
  await mushaf.getByRole("group").focus();
  await mushaf.getByRole("group").press("PageDown");
  const leaf = mushaf.locator('[data-visual="quran-turning-leaf"]');
  await page.waitForFunction(() => globalThis.mushafRotationSamples.length > 0);
  const transform = await page.evaluate(() => {
    globalThis.mushafRotationObserver.disconnect();
    return globalThis.mushafRotationSamples[0];
  });
  assert.ok(transform.startsWith("matrix3d("));
  assert.equal(await page.evaluate(() => globalThis.mushafHiddenFocusableCount), 0);
  await leaf.waitFor({ state: "detached" });
  const afterTurn = await mushaf.locator('[data-quran-page="right"] [data-ayah]').first().getAttribute("data-ayah");
  assert.notEqual(afterTurn, first);
  const corner = mushaf.locator('[data-page-corner="next"]');
  await corner.scrollIntoViewIfNeeded();
  const bounds = await corner.boundingBox();
  assert.ok(bounds);
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x - 220, bounds.y + bounds.height / 2, { steps: 8 });
  assert.equal(await leaf.count(), 1);
  await page.mouse.up();
  await leaf.waitFor({ state: "detached" });
  const afterDrag = await mushaf.locator('[data-quran-page="right"] [data-ayah]').first().getAttribute("data-ayah");
  assert.notEqual(afterDrag, afterTurn);
  results.push({ fullMotion: true, leafTransform: transform, first, afterTurn, afterDrag, pointerDrag: true });
  await context.close();
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
