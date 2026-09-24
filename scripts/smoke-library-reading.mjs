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
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--disable-background-networking",
  "--disable-default-apps",
  "--disable-extensions",
  "--disable-sync",
  "--hide-scrollbars",
  `--remote-debugging-port=${debuggingPort}`,
  `--user-data-dir=${profileDir}`,
  `${origin}/`,
], { stdio: "ignore" });

const delay = (ms) => new Promise((resolveDelay) => setTimeout(resolveDelay, ms));

async function waitForDebugger() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debuggingPort}/json/list`);
      const pages = await response.json();
      const page = pages.find((item) => item.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome is still starting.
    }
    await delay(120);
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
    `[...document.querySelectorAll("button[aria-label]")].some((button) =>
      button.getAttribute("aria-label")?.includes("السيرة النبوية")
    )`,
    "Ibn Hisham shelf book",
  );

  const shelfDiagnostics = await evaluate(
    session,
    `(() => {
      const books = [...document.querySelectorAll("button[aria-label]")].filter((button) =>
        button.getAttribute("aria-label")?.includes("—")
      );
      const target = books.find((button) => button.getAttribute("aria-label")?.includes("السيرة النبوية"));
      if (!target) return { clicked: false };
      target.click();
      const overflow = document.documentElement.scrollWidth > innerWidth + 1;
      return { clicked: true, bookCount: books.length, overflow, target: target.getAttribute("aria-label") };
    })()`,
  );
  if (!shelfDiagnostics.clicked) throw new Error("Could not select the Ibn Hisham shelf book");
  if (shelfDiagnostics.overflow) throw new Error("Library page has horizontal page overflow");

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
      return Boolean(paper && dialog.textContent?.includes("قراءة داخلية"));
    })()`,
    "real OpenITI reading text",
    180,
  );

  const reading = await evaluate(
    session,
    `(() => {
      const dialog = document.querySelector("[role=dialog]");
      const article = [...dialog.querySelectorAll("article")].find((item) => item.textContent?.trim().length > 180);
      return {
        dialogOpen: Boolean(dialog),
        textLength: article?.textContent?.trim().length ?? 0,
        hasPinnedSource: dialog?.textContent?.includes("OpenITI") ?? false,
        hasDigitalNumberingNotice: dialog?.textContent?.includes("مقاطع رقمية") ?? false,
      };
    })()`,
  );
  if (reading.textLength < 180 || !reading.hasPinnedSource || !reading.hasDigitalNumberingNotice) {
    throw new Error(`Reader evidence incomplete: ${JSON.stringify(reading)}`);
  }
  await screenshot(session, "library-reading.jpg");

  await evaluate(
    session,
    `(() => {
      const dialog = document.querySelector("[role=dialog]");
      const tab = [...dialog.querySelectorAll('[role="tab"]')].find((item) => item.textContent?.trim() === "استماع");
      if (!tab) throw new Error("Listening tab missing");
      tab.click();
      return true;
    })()`,
  );

  await waitFor(
    session,
    `(() => {
      const dialog = document.querySelector("[role=dialog]");
      return Boolean(dialog?.textContent?.includes("قراءة صوتية آلية من جهازك"));
    })()`,
    "listening desk",
  );

  const listening = await evaluate(
    session,
    `(() => {
      const dialog = document.querySelector("[role=dialog]");
      const play = [...dialog.querySelectorAll("button")].find((item) => item.textContent?.includes("استمع للمقطع"));
      const unsupported = dialog.textContent?.includes("لا يوفر Speech Synthesis") ?? false;
      const disclaimer = dialog.textContent?.includes("ليست نسخة صوتية أصلية") ?? false;
      if (play) play.click();
      return {
        speechApi: "speechSynthesis" in window && "SpeechSynthesisUtterance" in window,
        playControl: Boolean(play),
        unsupported,
        disclaimer,
      };
    })()`,
  );
  await delay(350);

  const listeningAfterClick = await evaluate(
    session,
    `(() => {
      const dialog = document.querySelector("[role=dialog]");
      return {
        speaking: "speechSynthesis" in window ? speechSynthesis.speaking : false,
        paused: "speechSynthesis" in window ? speechSynthesis.paused : false,
        hasPauseControl: [...dialog.querySelectorAll("button")].some((item) => item.textContent?.includes("إيقاف مؤقت")),
        handledError: dialog.textContent?.includes("تعذر تشغيل القراءة الآلية") ?? false,
      };
    })()`,
  );

  if (!listening.disclaimer) throw new Error("Listening mode is missing the automatic-speech disclaimer");
  if (listening.speechApi && !listening.playControl) throw new Error("Speech API exists but the play control is missing");
  if (!listening.speechApi && !listening.unsupported) throw new Error("Unsupported speech state is not explained");
  if (
    listening.speechApi &&
    !listeningAfterClick.speaking &&
    !listeningAfterClick.hasPauseControl &&
    !listeningAfterClick.handledError
  ) {
    throw new Error("Listening action produced no observable browser state");
  }

  await screenshot(session, "library-listening.jpg");

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
    listening: { ...listening, ...listeningAfterClick },
    runtimeErrors,
  };
  writeFileSync(join(evidenceDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log("Library browser smoke PASS");
  console.log(JSON.stringify(report));
} finally {
  session?.close();
  chrome.kill();
}
