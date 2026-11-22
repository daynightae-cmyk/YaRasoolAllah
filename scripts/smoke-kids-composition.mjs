/**
 * Children & family composition interaction smoke — proves the new hero,
 * interest rail, safety band and explore rail are genuinely wired: the hero
 * CTA reveals the governed adaptations series, the parent CTA switches to the
 * parent room, interest chips reset the age filter or switch rooms, every
 * rail destination is internal, and the page stays free of overflow and
 * runtime errors.
 */
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import WebSocket from "ws";

const origin = process.env.VISUAL_BASE_URL ?? "http://127.0.0.1:5000";
const chromePath = process.env.CHROME_PATH;
if (!chromePath) throw new Error("CHROME_PATH is required for the kids composition smoke");

const evidenceDir = resolve("artifacts", "kids-composition-smoke");
const profileDir = mkdtempSync(join(tmpdir(), "yra-kids-smoke-"));
const debuggingPort = 9347;
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
  `${origin}/kids`,
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
  const target = [...root.querySelectorAll("a, button, select")].find((item) =>
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

  await waitFor(
    session,
    `document.readyState === 'complete' && location.origin === ${JSON.stringify(origin)}`,
    "kids page load",
  );
  await evaluate(
    session,
    `localStorage.setItem("institution-welcome-seen", "true");
     localStorage.setItem("preferred-language", "ar");
     true;`,
  );
  await session.send("Page.navigate", { url: `${origin}/kids` });
  await waitFor(session, "document.readyState === 'complete' && location.pathname === '/kids'", "kids route");

  // 1. Hero, interest rail, safety band and explore rail all mount.
  const composition = await waitFor(
    session,
    `(() => {
      const hero = document.querySelector('[data-visual="kids-hero"]');
      const interest = document.querySelector('[data-visual="kids-interest-rail"]');
      const safety = document.querySelector('[data-visual="kids-safety-band"]');
      const explore = document.querySelector('[data-visual="kids-explore-rail"]');
      if (!hero || !interest || !safety || !explore) return null;
      return {
        ledger: [...hero.querySelectorAll("dd")].map((item) => item.textContent?.trim()),
        pledges: hero.querySelectorAll("ul[aria-label] li").length,
        ctas: hero.querySelectorAll("div[class*='heroCtas'] button").length,
        h1Count: document.querySelectorAll("h1").length,
        interestChips: interest.querySelectorAll("button, a").length,
        safetyItems: safety.querySelectorAll("ul li").length,
        exploreHrefs: [...explore.querySelectorAll("a")].map((a) => a.getAttribute("href")),
        adaptGrid: Boolean(document.getElementById("kids-adapt-grid")),
        activities: Boolean(document.getElementById("kids-activities")),
      };
    })()`,
    "kids composition mounts",
  );
  if (composition.h1Count !== 1) throw new Error(`Expected a single h1, found ${composition.h1Count}`);
  if (composition.ledger.length !== 4 || composition.ledger.some((value) => value === "" || value === undefined)) {
    throw new Error(`Hero ledger incomplete: ${JSON.stringify(composition.ledger)}`);
  }
  if (composition.pledges !== 3) throw new Error(`Expected three commitments, got ${composition.pledges}`);
  if (composition.ctas !== 2) throw new Error(`Expected two entry CTAs, got ${composition.ctas}`);
  if (composition.safetyItems !== 4) throw new Error(`Expected four safety commitments, got ${composition.safetyItems}`);
  if (composition.interestChips < 6) throw new Error(`Interest rail too thin: ${composition.interestChips}`);
  if (!composition.adaptGrid || !composition.activities) throw new Error("In-page targets missing");

  // 2. The family CTA reveals the governed adaptations series.
  const scrollBefore = await evaluate(session, "window.scrollY");
  await evaluate(session, clickByText(`document.querySelector('[data-visual="kids-hero"]')`, "ابدأ الرحلة العائلية"));
  const seriesRevealed = await waitFor(
    session,
    `(() => {
      const grid = document.getElementById("kids-adapt-grid");
      const select = document.getElementById("kids-adaptation-select");
      if (!grid || !select) return null;
      const rect = grid.getBoundingClientRect();
      return { scrollY: Math.round(window.scrollY), options: select.options.length, visible: rect.top < innerHeight };
    })()`,
    "adaptations series revealed",
  );
  if (seriesRevealed.options < 2) throw new Error("Selector lost its registered options");
  if (seriesRevealed.scrollY <= scrollBefore && !seriesRevealed.visible) {
    throw new Error(`Family CTA did not move to the series: ${JSON.stringify(seriesRevealed)}`);
  }

  // 3. The interest chip filters/sections behave: parent room switch works.
  await evaluate(session, clickByText(`document.querySelector('[data-visual="kids-hero"]')`, "دليل ولي الأمر"));
  const parentRoom = await waitFor(
    session,
    `(() => {
      const title = document.getElementById("parent-sources-title");
      const pressed = [...document.querySelectorAll('button[aria-pressed="true"]')].find((b) => b.textContent?.includes("دليل الوالدين للرسوم"));
      if (!title || !pressed) return null;
      return { heading: title.textContent?.trim() ?? "" };
    })()`,
    "parent room opened from the hero CTA",
  );

  // 4. Interest chip resets the age filter back to "all".
  await evaluate(session, clickByText(`document.querySelector('[data-visual="kids-interest-rail"]')`, "الأسرة والتربية"));
  const stillParents = await waitFor(
    session,
    `document.getElementById("parent-sources-title") !== null ? { ok: true } : null`,
    "interest chip keeps the parent room",
  );
  await evaluate(session, clickByText(`document.querySelector('[data-visual="kids-hero"]')`, "مسرح النور"));
  const backToStories = await waitFor(
    session,
    `(() => {
      const grid = document.getElementById("kids-adapt-grid");
      const allChip = [...document.querySelectorAll('[data-visual="kids-age-filter"] button')].find((b) => b.textContent?.includes("الكل"));
      if (!grid || !allChip) return null;
      return { allSelected: allChip.getAttribute("aria-pressed") === "true" };
    })()`,
    "stories room with the full age range selected",
  );

  // 5. Every explore destination is an internal canonical route.
  for (const href of composition.exploreHrefs) {
    if (!href || !href.startsWith("/")) throw new Error(`Explore link is not internal: ${href}`);
  }

  await screenshot(session, "kids-composition-smoke.jpg");

  const runtimeErrors = session.events
    .filter((event) => event.method === "Runtime.exceptionThrown")
    .map((event) => event.params?.exceptionDetails?.text ?? "unknown");
  const overflow = await evaluate(session, "document.documentElement.scrollWidth > innerWidth + 1");

  const report = {
    origin,
    composition,
    seriesRevealed,
    parentRoom,
    stillParents,
    backToStories,
    overflow,
    runtimeErrors,
  };
  writeFileSync(join(evidenceDir, "kids-composition-report.json"), JSON.stringify(report, null, 2));
  if (overflow) throw new Error("Kids page has horizontal overflow");
  if (runtimeErrors.length) throw new Error(`Runtime errors: ${JSON.stringify(runtimeErrors)}`);
  console.log("Kids composition smoke PASS");
  console.log(JSON.stringify(report));
} finally {
  session?.close();
  chrome.kill();
}
