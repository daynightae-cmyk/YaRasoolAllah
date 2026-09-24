import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import WebSocket from "ws";

const origin = process.env.VISUAL_BASE_URL ?? "http://127.0.0.1:3000";
const chromePath = process.env.CHROME_PATH;
if (!chromePath) throw new Error("CHROME_PATH is required for visual golden smoke");

const evidenceDir = resolve("artifacts", "visual-golden-smoke");
const profileDir = mkdtempSync(join(tmpdir(), "yra-visual-golden-smoke-"));
const debuggingPort = 9342;
mkdirSync(evidenceDir, { recursive: true });

const cases = [
  { name: "home-1440-rtl", path: "/", width: 1440, height: 1000 },
  { name: "quran-1440-rtl", path: "/quran", width: 1440, height: 1000 },
  { name: "kids-360-rtl", path: "/kids", width: 360, height: 844 },
  { name: "library-1440-rtl", path: "/library", width: 1440, height: 1000 },
  { name: "sources-1440-rtl", path: "/sources", width: 1440, height: 1000 },
  { name: "sources-360-rtl", path: "/sources", width: 360, height: 844 },
];

const chrome = spawn(chromePath, [
  "--headless",
  "--disable-gpu",
  "--no-sandbox",
  "--disable-dev-shm-usage",
  "--no-first-run",
  "--no-default-browser-check",
  "--remote-debugging-address=127.0.0.1",
  "--disable-background-networking",
  "--disable-default-apps",
  "--disable-extensions",
  "--disable-sync",
  "--hide-scrollbars",
  `--remote-debugging-port=${debuggingPort}`,
  `--user-data-dir=${profileDir}`,
  `${origin}/`,
], { stdio: ["ignore", "ignore", "inherit"] });

const delay = (ms) => new Promise((resolveDelay) => setTimeout(resolveDelay, ms));

async function waitForDebugger() {
  for (let attempt = 0; attempt < 240; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debuggingPort}/json/list`);
      const pages = await response.json();
      const page = pages.find((item) => item.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome is still starting.
    }
    await delay(250);
  }
  throw new Error("Chrome DevTools endpoint did not become available");
}

class DevToolsSession {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
  }

  async open() {
    await new Promise((resolveOpen, rejectOpen) => {
      this.socket.once("open", resolveOpen);
      this.socket.once("error", rejectOpen);
    });
    this.socket.on("message", (raw) => {
      const message = JSON.parse(raw.toString());
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolveSend, rejectSend) => {
      this.pending.set(id, { resolve: resolveSend, reject: rejectSend });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.socket.close();
  }
}

async function evaluate(session, expression, awaitPromise = false) {
  const result = await session.send("Runtime.evaluate", {
    expression,
    awaitPromise,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text ?? "Browser evaluation failed");
  }
  return result.result.value;
}

async function waitFor(session, expression, label, attempts = 80) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const value = await evaluate(session, expression, true);
    if (value) return value;
    await delay(150);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

let session;
const summary = [];
try {
  session = new DevToolsSession(await waitForDebugger());
  await session.open();
  await session.send("Page.enable");
  await session.send("Runtime.enable");

  for (const item of cases) {
    await session.send("Emulation.setDeviceMetricsOverride", {
      width: item.width,
      height: item.height,
      deviceScaleFactor: 1,
      mobile: item.width < 500,
    });
    await session.send("Page.navigate", { url: `${origin}${item.path}` });
    await waitFor(
      session,
      `document.readyState === "complete" && location.pathname === "${item.path === "/" ? "/" : item.path}"`,
      item.path,
    );
    await delay(400);
    const diagnostics = await evaluate(
      session,
      `({
        title: document.title,
        text: (document.body?.innerText || "").trim().length,
        rootChildren: document.getElementById("root")?.childElementCount || 0
      })`,
    );
    if (!diagnostics.text || diagnostics.rootChildren < 1) {
      throw new Error(`${item.name} rendered without visible content`);
    }
    const shot = await session.send("Page.captureScreenshot", {
      format: "jpeg",
      quality: 80,
      fromSurface: true,
      captureBeyondViewport: false,
    });
    const file = `${item.name}.jpg`;
    writeFileSync(join(evidenceDir, file), Buffer.from(shot.data, "base64"));
    summary.push({ ...item, file, ...diagnostics });
  }

  writeFileSync(join(evidenceDir, "summary.json"), JSON.stringify({ origin, summary }, null, 2));
  console.log(JSON.stringify({ ok: true, captured: summary.length, evidenceDir }, null, 2));
} finally {
  session?.close();
  chrome.kill("SIGTERM");
}
