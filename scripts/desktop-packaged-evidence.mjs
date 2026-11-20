// Packaged Windows app evidence — connects to the packaged exe via CDP.
// Run the packaged exe with --remote-debugging-port=9444 first, then:
//   node scripts/desktop-packaged-evidence.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import WebSocket from "ws";

const port = Number(process.env.YRA_DESKTOP_CDP_PORT ?? 9444);
const outDir = resolve("artifacts", "desktop-evidence");
mkdirSync(outDir, { recursive: true });

const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((t) => t.type === "page");
if (!page) throw new Error("no packaged page target found");

const ws = new WebSocket(page.webSocketDebuggerUrl);
let seq = 0;
const pending = new Map();
const send = (method, params = {}) =>
  new Promise((res, rej) => {
    const id = ++seq;
    pending.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
  });
ws.on("message", (raw) => {
  const msg = JSON.parse(raw.toString());
  if (msg.id && pending.has(msg.id)) {
    const { res, rej } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) rej(new Error(msg.error.message));
    else res(msg.result);
  }
});
await new Promise((r) => ws.on("open", r));

await send("Runtime.enable");
await send("Page.enable");
// Give the packaged app time to mount the shell and load the world plate.
await new Promise((r) => setTimeout(r, 6000));

const probeResult = await send("Runtime.evaluate", {
  expression: `(() => ({
    title: document.title,
    rootChildren: document.getElementById("root")?.children.length ?? 0,
    shellCount: document.querySelectorAll(".vg-shell").length,
    backdrop: document.querySelector("[data-world]")?.getAttribute("data-world") ?? null,
    backdropLoaded: document.querySelector("[data-world]")?.getAttribute("data-world-loaded") ?? null,
    heading: document.querySelector("h1,h2")?.textContent ?? "",
    desktopMarker: window.__YRA_DESKTOP__ === true,
    text: document.body.innerText.length,
    dir: document.documentElement.dir,
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
  }))()`,
  returnByValue: true,
});
const probe = probeResult.result.value;

await send("Emulation.setDeviceMetricsOverride", {
  width: 1440, height: 940, deviceScaleFactor: 1, mobile: false,
});
await new Promise((r) => setTimeout(r, 1500));
const shot = await send("Page.captureScreenshot", { format: "png" });
writeFileSync(join(outDir, "desktop-packaged-home-1440.png"), Buffer.from(shot.data, "base64"));

// Second evidence: the daily sanctuary with the new corpus-read adhkar.
await send("Page.navigate", { url: "yra://institution/daily" });
await new Promise((r) => setTimeout(r, 6000));
const dailyProbe = await send("Runtime.evaluate", {
  expression: `(() => ({
    adhkar: !!document.querySelector("[data-visual='quran-adhkar']"),
    adhkarCards: document.querySelectorAll("[data-adhkar]").length,
    adhkarTextRead: [...document.querySelectorAll("[data-adhkar] p")].filter((p) => p.textContent.length > 40).length,
    duas: !!document.querySelector("[data-visual='quran-duas']"),
    tasbih: document.body.innerText.includes("المسبحة"),
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
  }))()`,
  returnByValue: true,
});
const dailyShot = await send("Page.captureScreenshot", { format: "png" });
writeFileSync(join(outDir, "desktop-packaged-daily-1440.png"), Buffer.from(dailyShot.data, "base64"));

const report = {
  packaged: true,
  exe: "dist-desktop/win-unpacked/Ya Rasool Allah.exe",
  capturedAt: new Date().toISOString(),
  home: probe,
  daily: dailyProbe.result.value,
  pass:
    probe.shellCount === 1 && probe.backdropLoaded === "true" &&
    probe.desktopMarker === true && probe.dir === "rtl" && !probe.overflow &&
    dailyProbe.result.value.adhkar && dailyProbe.result.value.adhkarCards >= 6 &&
    dailyProbe.result.value.adhkarTextRead >= 6 && !dailyProbe.result.value.overflow,
};
writeFileSync(join(outDir, "packaged-probe.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
ws.close();
process.exit(report.pass ? 0 : 1);
