/**
 * Sources vault browse-deck interaction smoke — proves the full-page
 * composition is genuinely interactive: review chips filter the real
 * registry, table pagination advances real rows, row selection drives the
 * details + governance panels, the view toggle swaps table/cards, and
 * "عرض السجل" opens the governed deep-linkable inspection drawer.
 */
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import WebSocket from "ws";

const origin = process.env.VISUAL_BASE_URL ?? "http://127.0.0.1:5000";
const chromePath = process.env.CHROME_PATH;
if (!chromePath) throw new Error("CHROME_PATH is required for the sources browse smoke");

const evidenceDir = resolve("artifacts", "sources-browse-smoke");
const profileDir = mkdtempSync(join(tmpdir(), "yra-sources-smoke-"));
const debuggingPort = 9344;
mkdirSync(evidenceDir, { recursive: true });

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
  `${origin}/sources`,
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
    this.events = [];
  }

  async open() {
    await new Promise((resolveOpen, rejectOpen) => {
      this.socket.once("open", resolveOpen);
      this.socket.once("error", rejectOpen);
    });
    this.socket.on("message", (raw) => {
      const message = JSON.parse(raw.toString());
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }
      this.events.push(message);
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

async function waitFor(session, expression, label, attempts = 160) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const value = await evaluate(session, expression, true);
    if (value) return value;
    await delay(150);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function screenshot(session, name) {
  const shot = await session.send("Page.captureScreenshot", {
    format: "jpeg",
    quality: 86,
    fromSurface: true,
  });
  writeFileSync(join(evidenceDir, name), Buffer.from(shot.data, "base64"));
}

const rowIds = () =>
  `[...document.querySelectorAll("[data-source-row]")].map((row) => row.getAttribute("data-source-row"))`;

const clickButtonWithText = (scope, text) => `(() => {
  const root = ${scope};
  const button = [...root.querySelectorAll("button")].find((item) => item.textContent?.includes(${JSON.stringify(text)}));
  if (!button) throw new Error("Button not found: ${text}");
  button.click();
  return true;
})()`;

let session;
try {
  session = new DevToolsSession(await waitForDebugger());
  await session.open();
  await session.send("Page.enable");
  await session.send("Runtime.enable");
  await session.send("Log.enable");
  await session.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await waitFor(
    session,
    `document.readyState === 'complete' && location.origin === ${JSON.stringify(origin)}`,
    "sources page load",
  );
  await evaluate(
    session,
    `localStorage.setItem("institution-welcome-seen", "true");
     localStorage.setItem("preferred-language", "ar");
     true;`,
  );
  await session.send("Page.navigate", { url: `${origin}/sources` });
  await waitFor(session, "document.readyState === 'complete' && location.pathname === '/sources'", "sources route");

  // 1. The deck mounts with the first real page of governed records.
  await waitFor(session, `(${rowIds()}).length === 10`, "first page of ten registry rows");
  const firstPage = await evaluate(session, rowIds());

  // 2. Pagination advances to genuinely different rows.
  await evaluate(session, `document.querySelector('button[aria-label="الصفحة التالية"]')?.click()`);
  const secondPage = await waitFor(
    session,
    `(() => {
      const ids = ${rowIds()};
      return ids.length > 0 && ids[0] !== ${JSON.stringify(firstPage[0])} ? ids : null;
    })()`,
    "second page rows",
  );
  await evaluate(session, `document.querySelector('button[aria-label="الصفحة السابقة"]')?.click()`);
  await waitFor(session, `JSON.stringify(${rowIds()}) === JSON.stringify(${JSON.stringify(firstPage)})`, "back to first page");

  // 3. Selecting a row drives the details + governance panels.
  const targetId = firstPage[2];
  await evaluate(session, `(() => {
    const row = document.querySelector('[data-source-row="${targetId}"]');
    const titleButton = row?.querySelectorAll("td")[1]?.querySelector("button");
    if (!titleButton) throw new Error("Row title button missing");
    titleButton.click();
    return true;
  })()`);
  const panels = await waitFor(
    session,
    `(() => {
      const detail = document.querySelector('[data-visual="sources-detail-panel"]');
      const govern = document.querySelector('[data-visual="sources-govern-panel"]');
      if (!detail || !govern) return null;
      const detailText = detail.textContent || "";
      const governText = govern.textContent || "";
      if (!detailText.includes(${JSON.stringify(targetId)}) && !governText.includes(${JSON.stringify(targetId)})) {
        // The panels show title/status, not necessarily the id — check the row is selected instead.
        const selected = document.querySelector('[data-source-row="${targetId}"][class*="rowOn"], tr[class*="rowOn"][data-source-row="${targetId}"]');
        if (!selected) return null;
      }
      return {
        detailHasTimeline: detailText.includes("سجل الإصدارات والمراجعة"),
        governHasRights: governText.includes("قرار الحقوق"),
        governHasHonesty: governText.includes("لا استنتاج ولا اختراع"),
      };
    })()`,
    "panels driven by row selection",
  );

  // 4. The verified chip narrows the table to recorded verified sources.
  await evaluate(session, clickButtonWithText(`document.querySelector('[data-visual="sources-search-deck"]')`, "الموثّق"));
  const verifiedIds = await waitFor(
    session,
    `(() => {
      const ids = ${rowIds()};
      if (ids.length === 0 || ids.length >= ${firstPage.length}) return null;
      return ids;
    })()`,
    "verified-filtered rows",
  );
  await evaluate(session, clickButtonWithText(`document.querySelector('[data-visual="sources-search-deck"]')`, "جميع المصادر"));
  await waitFor(session, `(${rowIds()}).length === 10`, "all sources restored");

  // 5. The view toggle swaps the table for real cards.
  await evaluate(session, clickButtonWithText(`document.querySelector('[data-visual="sources-browse-deck"]')`, "عرض البطاقات"));
  await waitFor(
    session,
    `document.querySelectorAll('[data-visual="sources-browse-deck"] table').length === 0 &&
     document.querySelectorAll('[data-visual="sources-browse-deck"] [data-visual="source-inspect"]').length > 0`,
    "card view with inspect actions",
  );
  await evaluate(session, clickButtonWithText(`document.querySelector('[data-visual="sources-browse-deck"]')`, "عرض الجدول"));
  await waitFor(session, `(${rowIds()}).length === 10`, "table view restored");

  // 6. "عرض السجل" opens the governed drawer and deep-links ?source=.
  await evaluate(session, `document.querySelector('[data-source-row="${targetId}"] [data-visual="source-inspect"]')?.click()`);
  const drawer = await waitFor(
    session,
    `(() => {
      const drawer = document.querySelector('[data-visual="source-drawer"]');
      if (!drawer) return null;
      const text = drawer.textContent || "";
      return {
        hasId: text.includes(${JSON.stringify(targetId)}),
        hasBoundary: text.includes("العلاقات المعروضة مراجع مسجلة في الفهارس المحكومة فقط — لا استنتاج ولا اختراع"),
        deepLinked: new URLSearchParams(location.search).get("source") === ${JSON.stringify(targetId)},
      };
    })()`,
    "governed inspection drawer",
  );
  await evaluate(session, `document.querySelector('[data-visual="source-drawer"] button[aria-label="إغلاق فحص السجل"]')?.click()`);
  await waitFor(session, `!document.querySelector('[data-visual="source-drawer"]')`, "drawer closes");

  await screenshot(session, "sources-browse-smoke.jpg");

  const runtimeErrors = session.events
    .filter((event) => event.method === "Runtime.exceptionThrown")
    .map((event) => event.params?.exceptionDetails?.text ?? "unknown");
  const overflow = await evaluate(session, "document.documentElement.scrollWidth > innerWidth + 1");

  const report = { origin, firstPage, secondPage, verifiedIds, panels, drawer, overflow, runtimeErrors };
  writeFileSync(join(evidenceDir, "sources-browse-report.json"), JSON.stringify(report, null, 2));
  if (overflow) throw new Error("Sources page has horizontal overflow");
  if (runtimeErrors.length) throw new Error(`Runtime errors: ${JSON.stringify(runtimeErrors)}`);
  if (!panels.detailHasTimeline || !panels.governHasRights || !panels.governHasHonesty) {
    throw new Error(`Panels lost required content: ${JSON.stringify(panels)}`);
  }
  if (!drawer.hasId || !drawer.hasBoundary || !drawer.deepLinked) {
    throw new Error(`Drawer lost governed contract: ${JSON.stringify(drawer)}`);
  }
  console.log("Sources browse smoke PASS");
  console.log(JSON.stringify(report));
} finally {
  session?.close();
  chrome.kill();
}
