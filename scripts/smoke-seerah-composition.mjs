/**
 * Seerah full-page composition interaction smoke — proves the new hero,
 * journey band, chapter-rail gateway and explore rail are genuinely wired:
 * the hero CTA scrolls the real interactive theatre into view, the
 * all-chapters gateway opens the chronological database, the battles card
 * selects the recorded chapter, every explore destination is a canonical
 * route, and the page stays free of overflow and runtime errors.
 */
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import WebSocket from "ws";

const origin = process.env.VISUAL_BASE_URL ?? "http://127.0.0.1:5000";
const chromePath = process.env.CHROME_PATH;
if (!chromePath) throw new Error("CHROME_PATH is required for the seerah composition smoke");

const CANONICAL = [
  "/", "/library", "/quran", "/tafsir", "/seerah", "/seerah/database", "/atlas",
  "/hadith", "/kids", "/daily", "/audio", "/basirah", "/sources", "/noor",
];

const evidenceDir = resolve("artifacts", "seerah-composition-smoke");
const profileDir = mkdtempSync(join(tmpdir(), "yra-seerah-smoke-"));
const debuggingPort = 9346;
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
  `${origin}/seerah`,
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

  await waitFor(
    session,
    `document.readyState === 'complete' && location.origin === ${JSON.stringify(origin)}`,
    "seerah page load",
  );
  await evaluate(
    session,
    `localStorage.setItem("institution-welcome-seen", "true");
     localStorage.setItem("preferred-language", "ar");
     sessionStorage.setItem("yra-splash", "1");
     true;`,
  );
  await session.send("Page.navigate", { url: `${origin}/seerah?ceremony=0&door=0` });
  await waitFor(session, "document.readyState === 'complete' && location.pathname === '/seerah' && location.search.includes('door=0')", "seerah route");

  // 1. Hero, journey band, chapter rail gateway and explore rail all mount.
  const composition = await waitFor(
    session,
    `(() => {
      const hero = document.querySelector('[data-visual="seerah-hero"]');
      const band = document.querySelector('[data-visual="seerah-journey-band"]');
      const rail = document.getElementById("seerah-chapters");
      const explore = document.querySelector('[data-visual="seerah-explore-rail"]');
      if (!hero || !band || !rail || !explore) return null;
      const h1s = document.querySelectorAll("h1");
      return {
        ledger: [...hero.querySelectorAll("dd")].map((item) => item.textContent?.trim()),
        services: hero.querySelectorAll("ul li a").length,
        chapters: rail.querySelectorAll("[data-chapter-id]").length,
        allChapters: Boolean(rail.querySelector('a[href="/seerah/database"]')),
        exploreCards: explore.querySelectorAll("a, button").length,
        exploreHrefs: [...explore.querySelectorAll("a")].map((a) => a.getAttribute("href")),
        h1Count: h1s.length,
        heroPlate: Boolean(hero.querySelector("img[src*='worlds/seerah']")),
      };
    })()`,
    "seerah composition mounts",
  );
  if (composition.h1Count !== 1) throw new Error(`Expected a single h1, found ${composition.h1Count}`);
  if (composition.ledger.length !== 4 || composition.ledger.some((value) => !value || value === "0")) {
    throw new Error(`Hero ledger incomplete: ${JSON.stringify(composition.ledger)}`);
  }
  if (composition.services !== 4) throw new Error(`Expected four hero services, got ${composition.services}`);
  if (composition.chapters !== 8) throw new Error(`Expected eight recorded chapters, got ${composition.chapters}`);
  if (!composition.allChapters) throw new Error("All-chapters gateway missing from the rail");
  if (!composition.heroPlate) throw new Error("Hero world plate missing");
  for (const href of composition.exploreHrefs) {
    if (!href || !href.startsWith("/")) throw new Error(`Explore link is not internal: ${href}`);
    const path = href.split("?")[0];
    if (!CANONICAL.includes(path)) throw new Error(`Explore link leaves canonical surfaces: ${href}`);
  }

  // 2. The hero CTA scrolls the real interactive theatre into view.
  const scrollBefore = await evaluate(session, "window.scrollY");
  await evaluate(session, clickByText(`document.querySelector('[data-visual="seerah-hero"]')`, "نبذة عن الرحلة السينمائية"));
  const scrolled = await waitFor(
    session,
    `(() => {
      const theatre = document.getElementById("seerah-journey-theatre");
      if (!theatre) return null;
      const rect = theatre.getBoundingClientRect();
      return window.scrollY > ${scrollBefore} && rect.top < innerHeight && rect.bottom > 0 ? { scrollY: Math.round(window.scrollY), top: Math.round(rect.top) } : null;
    })()`,
    "journey theatre scrolled into view",
  );

  // 3. The battles explore card selects the recorded chapter in the stage.
  await evaluate(session, clickByText(`document.querySelector('[data-visual="seerah-explore-rail"]')`, "الرحلات والغزوات"));
  const battles = await waitFor(
    session,
    `(() => {
      const stage = document.querySelector('[data-chapter-stage="battles-conquests"]');
      if (!stage) return null;
      return { search: location.search, title: stage.querySelector("h2")?.textContent?.trim() ?? "" };
    })()`,
    "battles chapter selected",
  );
  if (!battles.search.includes("chapter=battles-conquests")) {
    throw new Error(`Battles card did not drive the URL: ${battles.search}`);
  }

  // 4. The chapter rail gateway opens the chronological database.
  const gatewayHref = await evaluate(session, `document.querySelector('#seerah-chapters a[href="/seerah/database"]')?.getAttribute("href")`);
  await session.send("Page.navigate", { url: `${origin}${gatewayHref}` });
  const database = await waitFor(
    session,
    `location.pathname === "/seerah/database" ? (document.querySelector('[data-visual="seerah-database"]')?.textContent?.includes("نتيجة") ?? false) : null`,
    "chronological database reachable from the rail",
  );

  // 5. Deep-link ?journey= still binds the theatre stop.
  await session.send("Page.navigate", { url: `${origin}/seerah?journey=hijrah-thawr&ceremony=0&door=0` });
  const journey = await waitFor(
    session,
    `document.querySelector('[data-journey-stop="hijrah-thawr"]') !== null ? { ok: true } : null`,
    "journey deep link binds a recorded stop",
  );

  await screenshot(session, "seerah-composition-smoke.jpg");

  const runtimeErrors = session.events
    .filter((event) => event.method === "Runtime.exceptionThrown")
    .map((event) => event.params?.exceptionDetails?.text ?? "unknown");
  const overflow = await evaluate(session, "document.documentElement.scrollWidth > innerWidth + 1");

  const report = { origin, composition, scrolled, battles, database, journey, overflow, runtimeErrors };
  writeFileSync(join(evidenceDir, "seerah-composition-report.json"), JSON.stringify(report, null, 2));
  if (overflow) throw new Error("Seerah page has horizontal overflow");
  if (runtimeErrors.length) throw new Error(`Runtime errors: ${JSON.stringify(runtimeErrors)}`);
  console.log("Seerah composition smoke PASS");
  console.log(JSON.stringify(report));
} finally {
  session?.close();
  chrome.kill();
}
