import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import WebSocket from "ws";

const origin = process.env.VISUAL_BASE_URL ?? "http://127.0.0.1:3000";
const chromePath = process.env.CHROME_PATH;
if (!chromePath) throw new Error("CHROME_PATH is required for the library browser smoke");

const evidenceDir = resolve("artifacts", "library-reading-smoke");
const profileDir = mkdtempSync(join(tmpdir(), "yra-library-smoke-"));
const debuggingPort = 9341;
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

async function waitFor(session, expression, label, attempts = 120) {
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
    captureBeyondViewport: false,
  });
  writeFileSync(join(evidenceDir, name), Buffer.from(shot.data, "base64"));
}

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

  await session.send("Page.navigate", { url: `${origin}/` });
  await waitFor(session, "document.readyState === 'complete'", "initial page");
  await evaluate(
    session,
    `localStorage.setItem("institution-welcome-seen", "true");
     localStorage.setItem("preferred-language", "ar");
     localStorage.setItem("divine-mode", "heaven");
     true;`,
  );

  await session.send("Page.navigate", { url: `${origin}/library` });
  await waitFor(session, "document.readyState === 'complete' && location.pathname === '/library'", "library route");
  await waitFor(
    session,
    `[...document.querySelectorAll("button")].some((button) =>
      button.textContent?.includes("السيرة النبوية")
    )`,
    "Seerah library gateway",
  );
  await evaluate(
    session,
    `(() => {
      const gateway = [...document.querySelectorAll("button")].find((button) =>
        button.textContent?.includes("السيرة النبوية")
      );
      if (!gateway) throw new Error("Seerah gateway missing");
      gateway.click();
      return true;
    })()`,
  );
  await waitFor(
    session,
    `[...document.querySelectorAll("[data-book-spine]")].some((button) =>
      button.getAttribute("aria-label")?.includes("السيرة النبوية")
    )`,
    "Ibn Hisham shelf book",
  );

  const shelfDiagnostics = await evaluate(
    session,
    `(() => {
      const books = [...document.querySelectorAll("[data-book-spine]")];
      const plates = [...document.querySelectorAll("[data-shelf-plate]")];
      const target = books.find((button) => button.getAttribute("aria-label")?.includes("السيرة النبوية"));
      const intersects = (a, b) =>
        a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      const plaqueOverlaps = plates.flatMap((plate, plateIndex) => {
        const plateRect = plate.getBoundingClientRect();
        return books.flatMap((book, bookIndex) => {
          const bookRect = book.getBoundingClientRect();
          return intersects(plateRect, bookRect)
            ? [{ plateIndex, bookIndex, plate: plate.textContent?.trim(), book: book.getAttribute("aria-label") }]
            : [];
        });
      });
      if (!target) return { clicked: false, bookCount: books.length, plaqueCount: plates.length, plaqueOverlaps };
      target.click();
      const overflow = document.documentElement.scrollWidth > innerWidth + 1;
      return {
        clicked: true,
        bookCount: books.length,
        plaqueCount: plates.length,
        plaqueOverlapCount: plaqueOverlaps.length,
        plaqueOverlaps: plaqueOverlaps.slice(0, 12),
        overflow,
        target: target.getAttribute("aria-label"),
      };
    })()`,
  );
  if (!shelfDiagnostics.clicked) throw new Error("Could not select the Ibn Hisham shelf book");
  if (shelfDiagnostics.overflow) throw new Error("Library page has horizontal page overflow");
  if (shelfDiagnostics.plaqueOverlapCount !== 0) {
    throw new Error(`Shelf plaque overlaps detected: ${JSON.stringify(shelfDiagnostics.plaqueOverlaps)}`);
  }
  await screenshot(session, "library-shelves.jpg");

  await waitFor(
    session,
    `[...document.querySelectorAll("button")].some((button) => button.textContent?.trim() === "قراءة")`,
    "reading action",
  );
  await evaluate(
    session,
    `(() => {
      const button = [...document.querySelectorAll("button")].find((item) => item.textContent?.trim() === "قراءة");
      if (!button) throw new Error("Reading action missing");
      button.click();
      return true;
    })()`,
  );

  await waitFor(session, "Boolean(document.querySelector('[role=dialog]'))", "reading chamber");
  await waitFor(
    session,
    `(() => {
      const dialog = document.querySelector("[role=dialog]");
      if (!dialog) return false;
      if (dialog.textContent?.includes("تعذر فتح النص")) throw new Error("Reader returned an error state");
      const paper = [...dialog.querySelectorAll("article")].find((article) => article.textContent?.trim().length > 180);
      return Boolean(
        paper
        && dialog.textContent?.includes("قراءة داخلية")
        && dialog.textContent?.includes("OpenITI")
      );
    })()`,
    "real governed internal reading text",
    180,
  );

  const reading = await evaluate(
    session,
    `(() => {
      const dialog = document.querySelector("[role=dialog]");
      const article = [...dialog.querySelectorAll("article")].find((item) => item.textContent?.trim().length > 180);
      const resources = performance.getEntriesByType("resource").map((entry) => entry.name);
      return {
        dialogOpen: Boolean(dialog),
        textLength: article?.textContent?.trim().length ?? 0,
        hasPinnedSource: dialog?.textContent?.includes("OpenITI") ?? false,
        hasDigitalNumberingNotice: dialog?.textContent?.includes("مقاطع رقمية") ?? false,
        usedDirectPinnedSource: resources.some((url) => url.includes("raw.githubusercontent.com/OpenITI/RELEASE/")),
        usedInternalReaderApi: resources.some((url) => url.includes("/api/content/library/read/")),
      };
    })()`,
  );
  if (
    reading.textLength < 180 ||
    !reading.hasPinnedSource ||
    !reading.hasDigitalNumberingNotice ||
    !reading.usedDirectPinnedSource ||
    reading.usedInternalReaderApi
  ) {
    throw new Error(`Direct reader evidence incomplete: ${JSON.stringify(reading)}`);
  }
  await screenshot(session, "library-reading.jpg");

  const audiobookGate = await evaluate(
    session,
    `(() => {
      const dialog = document.querySelector("[role=dialog]");
      const tabs = [...dialog.querySelectorAll('[role="tab"]')].map((item) => item.textContent?.trim());
      return {
        oldListeningTabAbsent: !tabs.includes("استماع"),
        audiobookHiddenWithoutClearedRecording: !tabs.includes("Audiobook"),
        tabs,
      };
    })()`,
  );
  if (!audiobookGate.oldListeningTabAbsent) {
    throw new Error("Legacy listening tab must not exist");
  }
  if (!audiobookGate.audiobookHiddenWithoutClearedRecording) {
    throw new Error("Audiobook appeared without a rights-cleared recording");
  }

  await waitFor(
    session,
    `Boolean(document.querySelector("[role=dialog] [data-device-tts-fallback]"))`,
    "device TTS accessibility fallback",
  );

  const ttsFallback = await evaluate(
    session,
    `(() => {
      const dialog = document.querySelector("[role=dialog]");
      const details = dialog?.querySelector("[data-device-tts-fallback]");
      if (details) details.open = true;
      const play = details?.querySelector("[data-tts-play]");
      const disclaimer = details?.textContent?.includes("ليست Audiobook") ?? false;
      if (play) play.click();
      return {
        present: Boolean(details),
        speechApi: "speechSynthesis" in window && "SpeechSynthesisUtterance" in window,
        playControl: Boolean(play),
        disclaimer,
      };
    })()`,
  );
  await delay(350);

  const ttsAfterClick = await evaluate(
    session,
    `(() => {
      const details = document.querySelector("[role=dialog] [data-device-tts-fallback]");
      return {
        speaking: "speechSynthesis" in window ? speechSynthesis.speaking : false,
        paused: "speechSynthesis" in window ? speechSynthesis.paused : false,
        hasPauseControl: [...details.querySelectorAll("button")].some((item) => item.textContent?.includes("إيقاف مؤقت")),
        handledError: details.textContent?.includes("تعذر تشغيل القراءة الآلية") ?? false,
      };
    })()`,
  );
  if (!ttsFallback.present || !ttsFallback.disclaimer) {
    throw new Error("Device TTS must be presented only as an accessibility fallback");
  }
  if (ttsFallback.speechApi && !ttsFallback.playControl) {
    throw new Error("Speech API exists but accessibility play control is missing");
  }
  if (
    ttsFallback.speechApi &&
    !ttsAfterClick.speaking &&
    !ttsAfterClick.hasPauseControl &&
    !ttsAfterClick.handledError
  ) {
    throw new Error("Accessibility TTS action produced no observable browser state");
  }

  await screenshot(session, "library-reading-accessibility.jpg");

  const runtimeErrors = session.events
    .filter((event) =>
      event.method === "Runtime.exceptionThrown" ||
      (event.method === "Log.entryAdded" && event.params?.entry?.level === "error") ||
      (event.method === "Runtime.consoleAPICalled" && event.params?.type === "error")
    )
    .map((event) => ({
      method: event.method,
      text: event.params?.entry?.text ?? event.params?.exceptionDetails?.text ?? event.params?.type ?? "unknown",
    }));

  if (runtimeErrors.length) {
    throw new Error(`Browser runtime errors: ${JSON.stringify(runtimeErrors)}`);
  }

  const report = {
    origin,
    shelf: shelfDiagnostics,
    reading,
    audiobookGate,
    ttsFallback: { ...ttsFallback, ...ttsAfterClick },
    runtimeErrors,
  };
  writeFileSync(join(evidenceDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log("Library browser smoke PASS");
  console.log(JSON.stringify(report));
} finally {
  session?.close();
  chrome.kill();
}
