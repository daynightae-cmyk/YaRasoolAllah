import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import WebSocket from "ws";

const origin = process.env.VISUAL_BASE_URL ?? "http://127.0.0.1:4173";
const chromePath = process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const evidenceDir = resolve("artifacts", "visual-evidence");
const debuggingPort = 9337;

export const cases = [
  { name: "gate-1440-light-rtl", path: "/", width: 1440, height: 1000, theme: "light", language: "ar" },
  { name: "gate-360-dark-ltr", path: "/", width: 360, height: 900, theme: "dark", language: "en" },
  { name: "gate-768-dark-rtl", path: "/home", width: 768, height: 1024, theme: "dark", language: "ur" },
  { name: "library-1440-dark-rtl", path: "/library", width: 1440, height: 1000, theme: "dark", language: "ar" },
  { name: "library-360-light-ltr", path: "/library", width: 360, height: 900, theme: "light", language: "en" },
  { name: "quran-1440-light-rtl", path: "/quran", width: 1440, height: 1000, theme: "light", language: "ar" },
  { name: "quran-360-dark-ltr", path: "/quran", width: 360, height: 900, theme: "dark", language: "en" },
  { name: "seerah-1440-dark-rtl", path: "/seerah", width: 1440, height: 1000, theme: "dark", language: "ar" },
  { name: "atlas-1440-dark-rtl", path: "/atlas", width: 1440, height: 1000, theme: "dark", language: "ar", clickText: "مسرح الغزوات", scrollSelector: '[data-visual="atlas-theatre-evidence"]', scrollOffset: -80 },
  { name: "seerah-768-light-ltr", path: "/seerah", width: 768, height: 1024, theme: "light", language: "en" },
  { name: "children-360-light-rtl", path: "/kids", width: 360, height: 900, theme: "light", language: "ar" },
  { name: "children-1440-dark-ltr", path: "/children-tv", width: 1440, height: 1000, theme: "dark", language: "en" },
  { name: "hadith-768-dark-rtl", path: "/sunnah", width: 768, height: 1024, theme: "dark", language: "ar" },
  { name: "hadith-360-dark-rtl", path: "/sunnah", width: 360, height: 900, theme: "dark", language: "ar" },
  { name: "sources-1440-light-ltr", path: "/sources", width: 1440, height: 1000, theme: "light", language: "en" },
  { name: "sources-360-dark-rtl", path: "/sources", width: 360, height: 900, theme: "dark", language: "ar" },
  { name: "daily-768-light-rtl", path: "/daily", width: 768, height: 1024, theme: "light", language: "ar" },
  { name: "daily-360-dark-ltr", path: "/daily", width: 360, height: 900, theme: "dark", language: "en" },
  { name: "prophetic-day-360-light-rtl", path: "/prophetic-day", width: 360, height: 900, theme: "light", language: "ar" },
  { name: "prophetic-day-status-360-dark-rtl", path: "/prophetic-day", width: 360, height: 900, theme: "dark", language: "ar", scrollSelector: ".reflection-nook__summary", scrollOffset: -120 },
];

async function main() {
mkdirSync(evidenceDir, { recursive: true });
const profileDir = mkdtempSync(join(tmpdir(), "yra-visual-evidence-"));

const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--hide-scrollbars",
  "--disable-background-networking",
  "--disable-default-apps",
  "--disable-extensions",
  "--disable-sync",
  `--remote-debugging-port=${debuggingPort}`,
  `--user-data-dir=${profileDir}`,
  `${origin}/`,
], { stdio: "ignore", windowsHide: true });

const delay = (milliseconds) => new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));

async function waitForDebugger() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debuggingPort}/json/list`);
      const pages = await response.json();
      const page = pages.find((item) => item.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome has not finished opening the debugger endpoint yet.
    }
    await delay(125);
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
    const id = this.nextId;
    this.nextId += 1;
    return new Promise((resolveSend, rejectSend) => {
      this.pending.set(id, { resolve: resolveSend, reject: rejectSend });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.socket.close();
  }
}

async function waitForDocument(session, expectedPath = null) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const state = await session.send("Runtime.evaluate", {
      expression: expectedPath
        ? `({ readyState: document.readyState, pathname: location.pathname })`
        : "({ readyState: document.readyState })",
      returnByValue: true,
    });
    const value = state.result.value;
    const pathReady = !expectedPath || value.pathname === expectedPath;
    if (value.readyState === "complete" && pathReady) break;
    await delay(100);
  }
  await session.send("Runtime.evaluate", {
    expression: "document.fonts ? document.fonts.ready.then(() => true) : true",
    awaitPromise: true,
    returnByValue: true,
  });
  await delay(500);
}

const report = [];
let session;

try {
  session = new DevToolsSession(await waitForDebugger());
  await session.open();
  await session.send("Page.enable");
  await session.send("Runtime.enable");
  await session.send("Log.enable");
  await session.send("Accessibility.enable");

  await session.send("Page.navigate", { url: `${origin}/` });
  await waitForDocument(session);

  for (const testCase of cases) {
    const eventStart = session.events.length;
    await session.send("Emulation.setDeviceMetricsOverride", {
      width: testCase.width,
      height: testCase.height,
      deviceScaleFactor: 1,
      mobile: false,
      screenWidth: testCase.width,
      screenHeight: testCase.height,
    });
    await session.send("Emulation.setEmulatedMedia", {
      media: "screen",
      features: [
        { name: "prefers-reduced-motion", value: "reduce" },
        { name: "prefers-color-scheme", value: testCase.theme },
      ],
    });
    await session.send("Runtime.evaluate", {
      expression: `localStorage.setItem("divine-mode", ${JSON.stringify(testCase.theme === "dark" ? "heaven" : "earth")}); localStorage.setItem("preferred-language", ${JSON.stringify(testCase.language)}); localStorage.setItem("institution-welcome-seen", "true");`,
    });
    await session.send("Page.navigate", { url: `${origin}${testCase.path}` });
    await waitForDocument(session, testCase.path === "/home" ? "/" : testCase.path);

    if (testCase.clickText) {
      const actionResult = await session.send("Runtime.evaluate", {
        expression: `(() => {
          const target = [...document.querySelectorAll("button")].find((button) => button.textContent?.includes(${JSON.stringify(testCase.clickText)}));
          if (!target) throw new Error("Visual evidence action target not found");
          target.click();
        })()`,
      });
      if (actionResult.exceptionDetails) throw new Error(`Visual action failed for ${testCase.name}`);
      await delay(450);
    }
    if (testCase.scrollSelector) {
      await session.send("Runtime.evaluate", {
        expression: `document.querySelector(${JSON.stringify(testCase.scrollSelector)})?.scrollIntoView({ block: "start" })`,
      });
      await delay(250);
    }
    if (testCase.scrollOffset) {
      await session.send("Runtime.evaluate", { expression: `window.scrollBy(0, ${testCase.scrollOffset})` });
      await delay(150);
    }

    const diagnostics = await session.send("Runtime.evaluate", {
      expression: `(() => {
        const viewportWidth = window.innerWidth;
        const overflowElements = [...document.querySelectorAll("body *")]
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return { element, rect };
          })
          .filter(({ element, rect }) => {
            const style = getComputedStyle(element);
            return style.display !== "none" && style.visibility !== "hidden" && rect.width > 1 &&
              (rect.left < -1 || rect.right > viewportWidth + 1);
          })
          .slice(0, 12)
          .map(({ element, rect }) => ({
            tag: element.tagName.toLowerCase(),
            id: element.id,
            className: typeof element.className === "string" ? element.className.slice(0, 160) : "",
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          }));
        return {
          url: location.href,
          title: document.title,
          viewportWidth,
          viewportHeight: window.innerHeight,
          documentWidth: document.documentElement.scrollWidth,
          documentHeight: document.documentElement.scrollHeight,
          bodyWidth: document.body.scrollWidth,
          applicationMounted: Boolean(document.querySelector("#root")?.children.length),
          expectedOrigin: ${JSON.stringify(origin)},
          originMatches: location.origin === ${JSON.stringify(origin)},
          theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
          language: document.documentElement.lang,
          direction: document.documentElement.dir,
          horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + 1,
          overflowElements,
          visiblyUnnamedInteractive: [...document.querySelectorAll("button, a[href], [role='button'], [role='link']")]
            .filter((element) => {
              const style = getComputedStyle(element);
              if (style.display === "none" || style.visibility === "hidden") return false;
              const label = element.getAttribute("aria-label") || element.getAttribute("title") || element.textContent?.trim();
              const imageLabel = element.querySelector("img")?.getAttribute("alt");
              return !label && !imageLabel;
            })
            .slice(0, 12)
            .map((element) => ({
              tag: element.tagName.toLowerCase(),
              href: element.getAttribute("href"),
              className: typeof element.className === "string" ? element.className.slice(0, 160) : "",
              html: element.outerHTML.slice(0, 260),
            })),
        };
      })()`,
      returnByValue: true,
    });

    const accessibility = await session.send("Accessibility.getFullAXTree");
    const unnamedInteractive = accessibility.nodes.filter((node) => {
      const role = node.role?.value;
      return (role === "button" || role === "link") && !node.name?.value;
    }).length;

    const screenshot = await session.send("Page.captureScreenshot", {
      format: "jpeg",
      quality: 86,
      fromSurface: true,
      captureBeyondViewport: false,
    });
    const screenshotPath = join(evidenceDir, `${testCase.name}.jpg`);
    writeFileSync(screenshotPath, Buffer.from(screenshot.data, "base64"));

    const newEvents = session.events.slice(eventStart);
    const runtimeErrors = newEvents
      .filter((event) => event.method === "Runtime.exceptionThrown" ||
        (event.method === "Log.entryAdded" && ["error", "warning"].includes(event.params.entry.level)) ||
        (event.method === "Runtime.consoleAPICalled" && event.params.type === "error"))
      .map((event) => ({
        method: event.method,
        text: event.params?.entry?.text ?? event.params?.exceptionDetails?.text ?? event.params?.type ?? "unknown",
        url: event.params?.entry?.url ?? event.params?.exceptionDetails?.url ?? null,
      }));

    report.push({
      ...testCase,
      screenshot: screenshotPath.replaceAll("\\", "/"),
      ...diagnostics.result.value,
      unnamedInteractive,
      runtimeErrors,
    });
  }

  const reportPath = join(evidenceDir, "visual-evidence-report.json");
  writeFileSync(reportPath, `${JSON.stringify({ origin, reducedMotion: true, cases: report }, null, 2)}\n`);

  const failed = report.filter((item) => !item.applicationMounted || !item.originMatches || item.horizontalOverflow || item.runtimeErrors.length || item.visiblyUnnamedInteractive.length);
  console.log(`Visual evidence captured: ${report.length} cases.`);
  console.log(`Application mount failures: ${report.filter((item) => !item.applicationMounted || !item.originMatches).length}.`);
  console.log(`Horizontal overflow failures: ${report.filter((item) => item.horizontalOverflow).length}.`);
  console.log(`Runtime error cases: ${report.filter((item) => item.runtimeErrors.length).length}.`);
  console.log(`Cases with visible unnamed interactive elements: ${report.filter((item) => item.visiblyUnnamedInteractive.length).length}.`);
  if (failed.length) {
    console.log(`Review required: ${failed.map((item) => item.name).join(", ")}`);
    process.exitCode = 1;
  }
} finally {
  session?.close();
  chrome.kill();
}
}

const invokedDirectly = process.argv[1] === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  await main();
}
