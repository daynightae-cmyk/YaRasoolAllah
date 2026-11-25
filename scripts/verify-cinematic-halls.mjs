import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const origin = process.env.YRA_PRIMARY_URL ?? "http://localhost:3000";
const output = process.env.YRA_PRIMARY_EVIDENCE ?? "artifacts/evidence/cinematic-halls";
const viewports = [{ width: 1672, height: 941 }, { width: 390, height: 844 }];
const results = [];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader"] });

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(new URL("/noor?ceremony=0", origin).href, { waitUntil: "domcontentloaded" });
    const theatre = page.locator('[data-visual="noor-theatre"]');
    const noorHall = theatre.locator('[data-hall="noor"][data-hall-state="running"]');
    await noorHall.locator("canvas").waitFor({ timeout: 60_000 });
    const player = theatre.locator("[data-player-state]");
    const queue = theatre.locator("#noor-playlist-panel ol button");
    assert.equal(await queue.count(), 53);
    const original = await player.getAttribute("data-media-id");
    await queue.nth(1).click();
    assert.notEqual(await player.getAttribute("data-media-id"), original);
    await theatre.getByRole("button", { name: "الأروقة", exact: true }).click();
    await theatre.locator("#noor-topics-panel").waitFor({ state: "visible" });
    await theatre.getByRole("button", { name: "الأروقة", exact: true }).click();
    await theatre.locator("#noor-topics-panel").waitFor({ state: "hidden" });
    await page.evaluate(() => globalThis.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({ path: `${output}/noor-interactive-${viewport.width}.png` });

    await theatre.getByRole("button", { name: "استكشف القاعة" }).click();
    assert.equal(await noorHall.getAttribute("data-hall-view"), "explore");
    await player.waitFor({ state: "hidden" });
    await noorHall.locator('[data-hall-frame-view="explore"]').waitFor();
    await page.screenshot({ path: `${output}/noor-explore-${viewport.width}.png` });
    await theatre.getByRole("button", { name: "إضاءة القاعة" }).click();
    assert.equal(await theatre.getByRole("button", { name: "إضاءة القاعة" }).getAttribute("aria-pressed"), "false");
    await theatre.getByRole("button", { name: "عرض سينمائي" }).click();
    await player.waitFor({ state: "visible" });
    await queue.first().waitFor({ state: "hidden" });
    await page.keyboard.press("Escape");
    assert.equal(await noorHall.getAttribute("data-hall-view"), "interactive");
    await theatre.getByRole("button", { name: "عرض مبسّط" }).click();
    await noorHall.waitFor({ state: "detached" });
    await player.waitFor({ state: "visible" });

    const approved = Number(await theatre.getAttribute("data-approved-count"));
    await theatre.getByRole("button", { name: "المعتمد فقط" }).click();
    if (approved === 0) {
      assert.equal(await player.getAttribute("data-media-id"), "none");
      assert.equal(await theatre.locator("iframe").count(), 0);
    }
    assert.equal(await page.evaluate(() => globalThis.document.documentElement.scrollWidth > globalThis.innerWidth + 1), false);

    await page.goto(new URL("/quran?studio=1&ceremony=0", origin).href, { waitUntil: "domcontentloaded" });
    const studio = page.locator('[data-visual="quran-cinematic-studio"]');
    const quranHall = studio.locator('[data-hall="quran"][data-hall-state="running"]');
    await quranHall.locator("canvas").waitFor({ timeout: 60_000 });
    await studio.getByRole("combobox", { name: "سورة الاستوديو" }).selectOption("2");
    const verse = studio.getByRole("combobox", { name: "آية الاستوديو" });
    await verse.locator('option[value="2"]').waitFor({ state: "attached" });
    await verse.selectOption("2");
    const passage = studio.locator('[aria-live="polite"]');
    assert.match(await passage.innerText(), /البقرة/);
    const verifiedText = await page.locator("#quran-ayah-2-2 > span").first().textContent();
    assert.ok(verifiedText?.trim());
    assert.equal(await passage.locator("p").textContent(), verifiedText);
    await page.screenshot({ path: `${output}/quran-studio-interactive-${viewport.width}.png` });
    await studio.getByRole("button", { name: "الآية التالية" }).click();
    assert.equal(await verse.inputValue(), "3");
    await studio.getByRole("button", { name: "استكشف الاستوديو" }).click();
    await passage.waitFor({ state: "hidden" });
    await quranHall.locator('[data-hall-frame-view="explore"]').waitFor();
    await page.screenshot({ path: `${output}/quran-studio-explore-${viewport.width}.png` });
    await studio.getByRole("button", { name: "عرض سينمائي" }).click();
    await passage.waitFor({ state: "visible" });
    await verse.waitFor({ state: "hidden" });
    await page.keyboard.press("Escape");
    await verse.waitFor({ state: "visible" });
    await studio.getByRole("button", { name: "الترجمة والتفسير" }).click();
    await studio.waitFor({ state: "hidden" });
    await page.getByRole("tab", { name: "دراسة" }).waitFor({ state: "visible" });
    assert.equal(await page.getByRole("tab", { name: "دراسة" }).getAttribute("aria-selected"), "true");
    assert.deepEqual(errors, []);
    results.push({ viewport, noorWebGL: "running", noorApproved: approved, quranWebGL: "running", verifiedSurah: 2, verifiedAyah: 2 });
    await page.close();
  }
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
