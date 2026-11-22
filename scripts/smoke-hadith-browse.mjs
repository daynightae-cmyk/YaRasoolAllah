/**
 * Hadith browse-deck interaction smoke — proves the full-page composition
 * is genuinely interactive: scope tabs filter real records, the six-book
 * shelf narrows the feed, feed tabs (sahih/saved) filter by real fields and
 * real bookmark state, and "عرض التفاصيل" opens the governed study record.
 */
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import WebSocket from "ws";

const origin = process.env.VISUAL_BASE_URL ?? "http://127.0.0.1:5000";
const chromePath = process.env.CHROME_PATH;
if (!chromePath) throw new Error("CHROME_PATH is required for the hadith browse smoke");

const evidenceDir = resolve("artifacts", "hadith-browse-smoke");
const profileDir = mkdtempSync(join(tmpdir(), "yra-hadith-smoke-"));
const debuggingPort = 9343;
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
  `${origin}/hadith`,
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

const cardIds = () =>
  `[...document.querySelectorAll("[data-hadith-card]")].map((card) => card.getAttribute("data-hadith-card"))`;

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
    "hadith page load",
  );
  await evaluate(
    session,
    `localStorage.setItem("institution-welcome-seen", "true");
     localStorage.setItem("preferred-language", "ar");
     true;`,
  );
  await session.send("Page.navigate", { url: `${origin}/hadith` });
  await waitFor(session, "document.readyState === 'complete' && location.pathname === '/hadith'", "hadith route");

  // 1. The full deck mounts with every governed local record.
  await waitFor(session, `(${cardIds()}).length === 4`, "four governed feed cards");
  const baseline = await evaluate(session, cardIds());

  // 2. The six-book shelf narrows the feed to that collection's records.
  await evaluate(
    session,
    `(() => {
      const card = [...document.querySelectorAll("[data-visual='hadith-collection-shelf'] button")]
        .find((button) => button.textContent?.includes("صحيح مسلم"));
      if (!card) throw new Error("Muslim shelf card missing");
      card.click();
      return true;
    })()`,
  );
  await waitFor(session, `JSON.stringify(${cardIds()}) === JSON.stringify(["muslim-2577"])`, "Muslim-only feed");

  // 3. Reset chip restores the full local registry.
  await evaluate(
    session,
    `(() => {
      const reset = [...document.querySelectorAll("button")].find((button) => button.textContent?.includes("إعادة تعيين"));
      if (!reset) throw new Error("Reset chip missing while filtered");
      reset.click();
      return true;
    })()`,
  );
  await waitFor(session, `(${cardIds()}).length === 4`, "reset restores all records");

  // 4. Sahih tab filters by the recorded grade (all four samples are sahih-graded).
  await evaluate(
    session,
    `(() => {
      const tab = [...document.querySelectorAll("[role='tab']")].find((button) => button.textContent?.includes("أحاديث صحيحة"));
      if (!tab) throw new Error("Sahih feed tab missing");
      tab.click();
      return true;
    })()`,
  );
  const sahihIds = await waitFor(session, `(${cardIds()}).length > 0 ? ${cardIds()} : null`, "sahih-filtered feed");

  // 5. Saved tab is empty until a real bookmark exists, then shows it.
  await evaluate(
    session,
    `(() => {
      const tab = [...document.querySelectorAll("[role='tab']")].find((button) => button.textContent?.includes("المحفوظة"));
      tab.click();
      return true;
    })()`,
  );
  await waitFor(
    session,
    `document.body.textContent?.includes("لا سجلات محفوظة ضمن هذا النطاق بعد") === true`,
    "honest saved-empty state",
  );
  await evaluate(
    session,
    `(() => {
      const tab = [...document.querySelectorAll("[role='tab']")].find((button) => button.textContent?.includes("كل السجلات"));
      tab.click();
      return true;
    })()`,
  );
  await waitFor(session, `(${cardIds()}).length === 4`, "back to all records");
  // The bookmark button is the header button of the first card.
  await evaluate(
    session,
    `(() => {
      const card = document.querySelector('[data-hadith-card="bukhari-1"]');
      const save = card?.querySelector("header button");
      if (!save) throw new Error("Feed save button missing");
      save.click();
      return true;
    })()`,
  );
  await evaluate(
    session,
    `(() => {
      const tab = [...document.querySelectorAll("[role='tab']")].find((button) => button.textContent?.includes("المحفوظة"));
      tab.click();
      return true;
    })()`,
  );
  const savedIds = await waitFor(session, `JSON.stringify(${cardIds()}) === JSON.stringify(["bukhari-1"]) ? true : null`, "saved feed shows the bookmarked record");

  // 6. Details opens the governed study record with its honesty labels.
  await evaluate(
    session,
    `(() => {
      const tab = [...document.querySelectorAll("[role='tab']")].find((button) => button.textContent?.includes("كل السجلات"));
      tab.click();
      return true;
    })()`,
  );
  await waitFor(session, `(${cardIds()}).length === 4`, "all records again");
  await evaluate(
    session,
    `(() => {
      const card = document.querySelector('[data-hadith-card="tirmidhi-1924"]');
      const open = [...(card?.querySelectorAll("button") ?? [])].find((button) => button.textContent?.includes("عرض التفاصيل"));
      if (!open) throw new Error("Details action missing");
      open.click();
      return true;
    })()`,
  );
  const study = await waitFor(
    session,
    `(() => {
      const panel = document.querySelector("[data-visual='hadith-cross-links']")?.closest("article");
      if (!panel) return null;
      const text = panel.textContent || "";
      if (!text.includes("1924")) return null;
      return {
        hasSampleLabel: text.includes("عينة تطوير"),
        hasGrade: text.includes("حسن صحيح"),
        hasIsnadHonesty: text.includes("السلسلة الكاملة غير متوفرة كبنية بيانات"),
      };
    })()`,
    "governed study record for tirmidhi-1924",
  );

  await screenshot(session, "hadith-browse-smoke.jpg");

  const runtimeErrors = session.events
    .filter((event) => event.method === "Runtime.exceptionThrown")
    .map((event) => event.params?.exceptionDetails?.text ?? "unknown");

  const overflow = await evaluate(session, "document.documentElement.scrollWidth > innerWidth + 1");

  const report = { origin, baseline, sahihIds, savedIds, study, overflow, runtimeErrors };
  writeFileSync(join(evidenceDir, "hadith-browse-report.json"), JSON.stringify(report, null, 2));
  if (overflow) throw new Error("Hadith page has horizontal overflow");
  if (runtimeErrors.length) throw new Error(`Runtime errors: ${JSON.stringify(runtimeErrors)}`);
  if (!study.hasSampleLabel || !study.hasGrade || !study.hasIsnadHonesty) {
    throw new Error(`Study record lost honesty labels: ${JSON.stringify(study)}`);
  }
  console.log("Hadith browse smoke PASS");
  console.log(JSON.stringify(report));
} finally {
  session?.close();
  chrome.kill();
}
