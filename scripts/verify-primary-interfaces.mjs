import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const output = process.env.YRA_PRIMARY_EVIDENCE ?? "artifacts/evidence/primary-interfaces";
const base = process.env.YRA_PRIMARY_URL ?? "http://localhost:3000";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const viewport of [{ width: 1672, height: 941 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const route of ["/", "/quran", "/seerah", "/hadith"]) {
      const url = new URL(`${route}?door=0&ceremony=0`, base).href;
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
      const heading = page.locator("h1");
      await heading.first().waitFor();
      assert.equal(await heading.count(), 1, `${route}: one page heading`);
      await page.evaluate(async () => {
        const visibleImages = Array.from(globalThis.document.images).filter((image) => {
          const bounds = image.getBoundingClientRect();
          return bounds.bottom > 0 && bounds.top < globalThis.innerHeight;
        });
        await Promise.all(visibleImages.map((image) => image.decode()));
        await globalThis.document.fonts.ready;
      });
      const name = route === "/" ? "home" : route.slice(1);
      const overflow = await page.evaluate(() => globalThis.document.documentElement.scrollWidth > globalThis.innerWidth + 1);
      assert.equal(overflow, false, `${name}: horizontal document overflow`);
      await page.screenshot({ path: `${output}/${name}-${viewport.width}.png` });
      if (route === "/") {
        const portals = page.getByRole("navigation", { name: "أبواب عوالم السيرة" });
        assert.equal(await portals.getByRole("link").count(), 9);
        await portals.getByRole("link", { name: "القرآن الكريم" }).click();
        await page.waitForURL((url) => url.pathname === "/quran");
        await page.goto(url, { waitUntil: "domcontentloaded" });
      } else {
        const labels = { "/quran": "ابدأ رحلتك مع القرآن", "/seerah": "اختر طريقك في السيرة", "/hadith": "ابدأ الدراسة في دار الحديث" };
        const navigation = page.getByRole("navigation", { name: labels[route] });
        const actions = navigation.getByRole("button");
        const targets = {
          "/quran": ["quran-reader", "quran-surah-nav", "quran-listening"],
          "/seerah": ["seerah-chapters", "chapter-reading", "seerah-journey-band"],
          "/hadith": ["hadith-search", "hadith-collections", "hadith-records"],
        };
        assert.equal(await actions.count(), 3);
        for (let index = 0; index < 3; index += 1) {
          await actions.nth(index).click();
          assert.ok(await page.evaluate((target) => globalThis.document.getElementById(target)?.contains(globalThis.document.activeElement), targets[route][index]), `${name}: action ${index} must focus its own destination`);
        }
        if (route === "/quran") {
          const sheet = page.locator('[data-visual="quran-sheet"][data-quran-state="ready"]');
          const catalog = page.getByRole("complementary", { name: "فهرس القرآن" });
          await catalog.getByRole("button", { name: /البقرة/ }).first().click();
          const firstVerse = sheet.locator("#quran-ayah-2-1");
          await firstVerse.waitFor();
          assert.equal(await sheet.locator("button[id^='quran-ayah-2-']").count(), 286);
          const firstSpread = sheet.locator('[data-visual="quran-spread"]').first();
          assert.deepEqual(
            await firstSpread.locator("button[id^='quran-ayah-2-']").evaluateAll((verses) => verses.map((verse) => verse.id)),
            Array.from({ length: 8 }, (_, index) => `quran-ayah-2-${index + 1}`),
          );
          const secondVerse = sheet.locator("#quran-ayah-2-2");
          await secondVerse.click();
          assert.equal(await secondVerse.getAttribute("aria-pressed"), "true");
          assert.equal(await firstVerse.getAttribute("aria-pressed"), "false");
          await page.locator("#quran-reader").evaluate((reader) => reader.scrollIntoView({ block: "start" }));
          await page.screenshot({ path: `${output}/quran-reader-${viewport.width}.png` });
          await page.goto(url, { waitUntil: "domcontentloaded" });
          await navigation.waitFor();
        }
        if (route !== "/seerah") {
          assert.equal(await navigation.getByRole("link").count(), 3);
        } else {
          const crossroads = page.getByRole("region", { name: "السيرة النبوية" });
          // 5 route-link portals + the home link stay links; 4 world gates are Play-to-Enter buttons.
          assert.equal(await crossroads.getByRole("link").count(), 6);
          assert.equal(await crossroads.getByRole("button").count(), 4);
          await crossroads.getByRole("link", { name: "الحديث الشريف Hadith" }).click();
          await page.waitForURL((destination) => destination.pathname === "/hadith");
          await page.goto(url, { waitUntil: "domcontentloaded" });
        }
      }
      results.push({ route, viewport, title: await page.locator("h1").first().innerText(), errors: [...errors], overflow });
      assert.deepEqual(errors, []);
    }
    await context.close();
  }
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
