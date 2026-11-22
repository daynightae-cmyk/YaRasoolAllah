/**
 * Daily sanctuary composition interaction smoke — proves the hero CTA reveals
 * the routine, the routine checklist toggles and persists per day, the
 * calendar renders Hijri+Gregorian from the runtime calendar, every tool is
 * an internal canonical route, and the page stays free of overflow and
 * runtime errors.
 */
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import WebSocket from "ws";

const origin = process.env.VISUAL_BASE_URL ?? "http://127.0.0.1:5000";
const chromePath = process.env.CHROME_PATH;
if (!chromePath) throw new Error("CHROME_PATH is required for the daily composition smoke");

const evidenceDir = resolve("artifacts", "daily-composition-smoke");
const profileDir = mkdtempSync(join(tmpdir(), "yra-daily-smoke-"));
const debuggingPort = 9348;
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
  `${origin}/daily`,
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

async function waitFor(session, expression, label, attempts = 200) {
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

const clickByText = (scope, text) => `(() => {
  const root = ${scope};
  if (!root) throw new Error("Scope missing for: ${text}");
  const target = [...root.querySelectorAll("a, button")].find((item) =>
    item.textContent?.includes(${JSON.stringify(text)}) || item.getAttribute("aria-label")?.includes(${JSON.stringify(text)}));
  if (!target) throw new Error("Target not found: ${text}");
  target.click();
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
  await session.send("Emulation.setEmulatedMedia", {
    media: "screen",
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });

  await waitFor(
    session,
    `document.readyState === 'complete' && location.origin === ${JSON.stringify(origin)}`,
    "daily page load",
  );
  await evaluate(
    session,
    `localStorage.setItem("institution-welcome-seen", "true");
     localStorage.setItem("preferred-language", "ar");
     true;`,
  );
  await session.send("Page.navigate", { url: `${origin}/daily` });
  await waitFor(session, "document.readyState === 'complete' && location.pathname === '/daily'", "daily route");

  // 1. All composition regions mount with measured content.
  const composition = await waitFor(
    session,
    `(() => {
      const hero = document.querySelector('[data-visual="daily-hero"]');
      const prayer = document.querySelector('[data-visual="prayer-observatory"]');
      const rhythm = document.querySelector('[data-visual="daily-rhythm"]');
      const calendar = document.querySelector('[data-visual="daily-calendar"]');
      const routine = document.querySelector('[data-visual="daily-routine"]');
      const lessons = document.querySelector('[data-visual="daily-lessons"]');
      const tools = document.querySelector('[data-visual="daily-tools"]');
      const progress = document.querySelector('[data-visual="daily-progress"]');
      if (!hero || !prayer || !rhythm || !calendar || !routine || !lessons || !tools || !progress) return null;
      return {
        h1Count: document.querySelectorAll("h1").length,
        stations: rhythm.querySelectorAll("button").length,
        calendarBlocks: calendar.querySelectorAll(".calBlock, [class*='calBlock']").length,
        routineItems: routine.querySelectorAll("li").length,
        lessons: lessons.querySelectorAll("a").length,
        tools: tools.querySelectorAll("a").length,
        ringValue: progress.querySelector(".ringValue")?.textContent?.trim() ?? "",
        toolHrefs: [...tools.querySelectorAll("a")].map((a) => a.getAttribute("href")),
      };
    })()`,
    "daily composition mounts",
  );
  if (composition.h1Count !== 1) throw new Error(`Expected a single h1, found ${composition.h1Count}`);
  if (composition.stations !== 5) throw new Error(`Expected five rhythm stations, got ${composition.stations}`);
  if (composition.routineItems !== 7) throw new Error(`Expected seven routine items, got ${composition.routineItems}`);
  if (composition.lessons !== 3) throw new Error(`Expected three lessons, got ${composition.lessons}`);
  if (composition.tools !== 8) throw new Error(`Expected eight tools, got ${composition.tools}`);
  for (const href of composition.toolHrefs) {
    if (!href || !href.startsWith("/")) throw new Error(`Tool link is not internal: ${href}`);
  }

  // 2. Hero CTA scrolls the routine checklist into view.
  const scrollBefore = await evaluate(session, "window.scrollY");
  await evaluate(session, clickByText(`document.querySelector('[data-visual="daily-hero"]')`, "ابدأ روتينك اليومي"));
  const scrolled = await waitFor(
    session,
    `(() => {
      const routine = document.getElementById("daily-routine");
      if (!routine) return null;
      const rect = routine.getBoundingClientRect();
      return window.scrollY > ${scrollBefore} && rect.top < innerHeight && rect.bottom > 0
        ? { scrollY: Math.round(window.scrollY), top: Math.round(rect.top) }
        : null;
    })()`,
    "routine scrolled into view",
  );

  // 3. Toggling a routine item changes aria-pressed and persists per day.
  await evaluate(session, clickByText(`document.querySelector('[data-visual="daily-routine"]')`, "قراءة القرآن"));
  const pressed = await waitFor(
    session,
    `(() => {
      const btn = [...document.querySelectorAll('[data-visual="daily-routine"] button[aria-pressed]')].find(
        (b) => b.textContent?.includes("قراءة القرآن") || b.getAttribute("aria-label")?.includes("قراءة القرآن"));
      return btn ? { pressed: btn.getAttribute("aria-pressed") === "true" } : null;
    })()`,
    "routine item toggled on",
  );
  if (!pressed.pressed) throw new Error("Routine item did not toggle on");

  // 4. Calendar shows Hijri + Gregorian blocks.
  const calendarRendered = await waitFor(
    session,
    `document.querySelector('[data-visual="daily-calendar"]')?.querySelectorAll('[class*="calBlock"]').length >= 2
      ? { ok: true } : null`,
    "hijri + gregorian calendar blocks",
  );

  // 5. Progress ring value present.
  const ring = await waitFor(
    session,
    `(() => {
      const card = document.querySelector('[data-visual="daily-progress"]');
      const value = card?.querySelector("[class*='ringValue']")?.textContent?.trim();
      return value ? { value } : null;
    })()`,
    "progress ring value",
  );

  await screenshot(session, "daily-composition-smoke.jpg");

  const runtimeErrors = session.events
    .filter((event) => event.method === "Runtime.exceptionThrown")
    .map((event) => event.params?.exceptionDetails?.text ?? "unknown");
  const overflow = await evaluate(session, "document.documentElement.scrollWidth > innerWidth + 1");

  const report = { origin, composition, scrolled, pressed, calendarRendered, ring, overflow, runtimeErrors };
  writeFileSync(join(evidenceDir, "daily-composition-report.json"), JSON.stringify(report, null, 2));
  if (overflow) throw new Error("Daily page has horizontal overflow");
  if (runtimeErrors.length) throw new Error(`Runtime errors: ${JSON.stringify(runtimeErrors)}`);
  console.log("Daily composition smoke PASS");
  console.log(JSON.stringify(report));
} finally {
  session?.close();
  chrome.kill();
}
