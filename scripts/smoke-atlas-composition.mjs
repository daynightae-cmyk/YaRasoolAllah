/**
 * Atlas full-page composition interaction smoke — proves the new hero,
 * era rail and lower deck are genuinely interactive over the real
 * registries: era tabs select and deep-link the chronological database
 * (?era=), featured campaign cards switch the living theatre, specialized
 * gateways change the stage mode/filter, and the page stays free of
 * overflow and runtime errors.
 */
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import WebSocket from "ws";

const origin = process.env.VISUAL_BASE_URL ?? "http://127.0.0.1:5000";
const chromePath = process.env.CHROME_PATH;
if (!chromePath) throw new Error("CHROME_PATH is required for the atlas composition smoke");

const evidenceDir = resolve("artifacts", "atlas-composition-smoke");
const profileDir = mkdtempSync(join(tmpdir(), "yra-atlas-smoke-"));
const debuggingPort = 9345;
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
  `${origin}/atlas`,
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

const clickButtonWithText = (scope, text) => `(() => {
  const root = ${scope};
  if (!root) throw new Error("Scope missing for button: ${text}");
  const button = [...root.querySelectorAll("button, a")].find((item) =>
    item.textContent?.includes(${JSON.stringify(text)}) || item.getAttribute("aria-label")?.includes(${JSON.stringify(text)}));
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
    "atlas page load",
  );
  await evaluate(
    session,
    `localStorage.setItem("institution-welcome-seen", "true");
     localStorage.setItem("preferred-language", "ar");
     true;`,
  );
  await session.send("Page.navigate", { url: `${origin}/atlas` });
  await waitFor(session, "document.readyState === 'complete' && location.pathname === '/atlas'", "atlas route");

  // 1. Hero + era rail + lower deck all mount; ledger counts are non-empty.
  const hero = await waitFor(
    session,
    `(() => {
      const hero = document.querySelector('[data-visual="atlas-hero"]');
      const rail = document.querySelector('[data-visual="atlas-era-rail"]');
      const deck = document.querySelector('[data-visual="atlas-lower-deck"]');
      if (!hero || !rail || !deck) return null;
      const ledger = [...hero.querySelectorAll("strong")].map((item) => item.textContent?.trim());
      const eraTabs = [...rail.querySelectorAll('[role="tab"]')].length;
      return { ledger, eraTabs };
    })()`,
    "hero, era rail and lower deck",
  );
  if (hero.eraTabs !== 11) throw new Error(`Expected 11 era tabs (all + 10 eras), got ${hero.eraTabs}`);
  if (hero.ledger.some((value) => !value || value === "0")) throw new Error(`Ledger has empty/zero cells: ${JSON.stringify(hero.ledger)}`);

  // 2. Selecting a real era shows its summary and a working ?era= deep link.
  await evaluate(session, clickButtonWithText(`document.querySelector('[data-visual="atlas-era-rail"]')`, "الدفاع والغزوات"));
  const eraState = await waitFor(
    session,
    `(() => {
      const rail = document.querySelector('[data-visual="atlas-era-rail"]');
      const selected = rail?.querySelector('[role="tab"][aria-selected="true"]');
      const link = rail?.querySelector('a[href*="/seerah/database?era="]');
      if (!selected || !link) return null;
      return { selected: selected.textContent, href: link.getAttribute("href") };
    })()`,
    "era selection summary + deep link",
  );

  // 3. The era deep link actually filters the chronological database.
  await session.send("Page.navigate", { url: `${origin}${eraState.href}` });
  await waitFor(session, "document.readyState === 'complete' && location.pathname === '/seerah/database'", "database route");
  const eraFiltered = await waitFor(
    session,
    `(() => {
      const rail = document.querySelector('[aria-label="تصفية حسب المرحلة"]');
      if (!rail) return null;
      const on = [...rail.querySelectorAll("button")].find((button) => button.className.includes("eraOn"));
      const status = document.querySelector('[role="status"]');
      if (!on || !on.textContent?.includes("الدفاع والغزوات")) return null;
      return { active: on.textContent?.trim(), results: status?.textContent?.trim() ?? "" };
    })()`,
    "database filtered by era deep link",
  );

  // 4. Back on the atlas: featured campaign card switches the living theatre.
  await session.send("Page.navigate", { url: `${origin}/atlas` });
  await waitFor(session, `document.readyState === 'complete' && document.querySelector('[data-visual="atlas-lower-deck"]') !== null`, "atlas remount");
  await evaluate(session, clickButtonWithText(`document.querySelector('[data-visual="atlas-lower-deck"]')`, "فتح مسرح غزوة أحد"));
  const theatre = await waitFor(
    session,
    `(() => {
      const stageTitle = [...document.querySelectorAll("h2")].find((item) => item.textContent?.includes("غزوة أحد"));
      const pressed = [...document.querySelectorAll('[aria-pressed="true"]')].find((button) => button.textContent?.includes("غزوة أحد"));
      if (!stageTitle || !pressed) return null;
      return { stage: stageTitle.textContent?.trim() };
    })()`,
    "featured card switches theatre to Uhud",
  );

  // 5. Specialized gateway "مواضع الغزوات" flips the stage to places+battles.
  await evaluate(session, clickButtonWithText(`document.querySelector('[data-visual="atlas-lower-deck"]')`, "مواضع الغزوات"));
  const placesMode = await waitFor(
    session,
    `(() => {
      const placesTab = [...document.querySelectorAll('[role="tab"]')].find((tab) => tab.textContent?.includes("مواضع السيرة"));
      const stageTitle = [...document.querySelectorAll("h2")].find((item) => item.textContent?.includes("مواضع السيرة التخطيطية"));
      if (placesTab?.getAttribute("aria-selected") !== "true" || !stageTitle) return null;
      return { mode: "places" };
    })()`,
    "specialized gateway switches to places mode",
  );

  // 6. Latest events link deep-links a real recorded event.
  const latestHref = await waitFor(
    session,
    `document.querySelector('[data-visual="atlas-lower-deck"] a[href*="/seerah/database?event="]')?.getAttribute("href")`,
    "latest event deep link",
  );

  await screenshot(session, "atlas-composition-smoke.jpg");

  const runtimeErrors = session.events
    .filter((event) => event.method === "Runtime.exceptionThrown")
    .map((event) => event.params?.exceptionDetails?.text ?? "unknown");
  const overflow = await evaluate(session, "document.documentElement.scrollWidth > innerWidth + 1");

  const report = { origin, hero, eraState, eraFiltered, theatre, placesMode, latestHref, overflow, runtimeErrors };
  writeFileSync(join(evidenceDir, "atlas-composition-report.json"), JSON.stringify(report, null, 2));
  if (overflow) throw new Error("Atlas page has horizontal overflow");
  if (runtimeErrors.length) throw new Error(`Runtime errors: ${JSON.stringify(runtimeErrors)}`);
  console.log("Atlas composition smoke PASS");
  console.log(JSON.stringify(report));
} finally {
  session?.close();
  chrome.kill();
}
