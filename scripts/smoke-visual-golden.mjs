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
  { name: "home-1024-rtl", path: "/", width: 1024, height: 900 },
  { name: "home-768-rtl", path: "/", width: 768, height: 900 },
  { name: "home-390-rtl", path: "/", width: 390, height: 844 },
  { name: "home-360-rtl", path: "/", width: 360, height: 800 },
  { name: "home-390-light", path: "/", width: 390, height: 844, theme: "light" },
  { name: "home-390-ltr", path: "/", width: 390, height: 844, lang: "en" },
  { name: "quran-1440-rtl", path: "/quran", width: 1440, height: 1000 },
  { name: "quran-768-rtl", path: "/quran", width: 768, height: 900 },
  { name: "quran-390-rtl", path: "/quran", width: 390, height: 844 },
  { name: "quran-390-light", path: "/quran", width: 390, height: 844, theme: "light" },
  { name: "quran-390-ltr", path: "/quran", width: 390, height: 844, lang: "en" },
  { name: "seerah-1440-rtl", path: "/seerah", width: 1440, height: 1000 },
  { name: "seerah-768-rtl", path: "/seerah", width: 768, height: 900 },
  { name: "seerah-390-rtl", path: "/seerah", width: 390, height: 844 },
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
  await session.send("Page.navigate", { url: `${origin}/` });
  await waitFor(session, 'document.readyState === "complete"', "initial origin");
  await evaluate(session, 'sessionStorage.setItem("yra-splash", "1")');

  for (const item of cases) {
    await evaluate(session, `(() => {
      const key = "yra-visual-golden-v1";
      const saved = JSON.parse(localStorage.getItem(key) || "{}");
      localStorage.setItem(key, JSON.stringify({ ...saved, theme: ${JSON.stringify(item.theme ?? "dark")}, lang: ${JSON.stringify(item.lang ?? "ar")} }));
      ${item.path === "/quran" ? 'localStorage.setItem("quran-last-position-v1", JSON.stringify({ surah: 1, ayah: 1 }));' : ""}
    })()`);
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
    if (item.path === "/") {
      await waitFor(session, 'document.querySelector(".vg-shell main h1") !== null', `${item.name} home`);
      const geometry = await evaluate(session, `(() => {
        const shell = document.querySelector(".vg-shell");
        const header = shell?.querySelector("header");
        const search = header?.querySelectorAll("button")[1];
        const hero = shell?.querySelector("main section");
        const copy = hero?.querySelector("h1")?.parentElement;
        const form = hero?.querySelector("form");
        const wings = [...shell.querySelectorAll("main nav[aria-label] a")];
        const rect = (element) => element?.getBoundingClientRect().toJSON() ?? null;
        return {
          direction: shell?.getAttribute("dir"),
          theme: shell?.getAttribute("data-theme"),
          lang: shell?.getAttribute("data-lang"),
          viewport: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          header: rect(header),
          search: rect(search),
          copy: rect(copy),
          form: rect(form),
          wings: wings.map((wing) => ({ href: wing.getAttribute("href"), ...rect(wing) }))
        };
      })()`);
      const expectedLang = item.lang ?? "ar";
      if (geometry.lang !== expectedLang || geometry.theme !== (item.theme ?? "dark") || geometry.direction !== (expectedLang === "ar" ? "rtl" : "ltr")) {
        throw new Error(`${item.name} language/theme did not hydrate: ${JSON.stringify(geometry)}`);
      }
      if (!geometry.search || !geometry.form || !geometry.copy || geometry.documentWidth > geometry.viewport + 1 || geometry.search.width < 32 || geometry.search.left < -1 || geometry.search.right > geometry.viewport + 1 || geometry.form.left < -1 || geometry.form.right > geometry.viewport + 1 || geometry.copy.bottom > geometry.form.top + 1) {
        throw new Error(`${item.name} clipped or overlapping shell: ${JSON.stringify(geometry)}`);
      }
      if (geometry.wings.length !== 8 || geometry.wings.some((wing) => wing.width < 80 || wing.left < -1 || wing.right > geometry.viewport + 1)) {
        throw new Error(`${item.name} knowledge wings missing or clipped: ${JSON.stringify(geometry.wings)}`);
      }
      diagnostics.geometry = geometry;
    }
    if (item.path === "/quran") {
      await waitFor(session, 'document.querySelectorAll(\'[id^="quran-ayah-1-"]\').length === 7', `${item.name} verified verses`);
      const quranGeometry = await evaluate(session, `(() => {
        const reader = document.querySelector('section[aria-label="مصحف القراءة"]');
        const catalog = document.getElementById("quran-surah-nav");
        const bounds = reader?.getBoundingClientRect().toJSON();
        return {
          viewport: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          reader: bounds,
          catalogTop: catalog?.getBoundingClientRect().top,
          verseCount: reader?.querySelectorAll('button[id^="quran-ayah-1-"]').length,
          search: Boolean(document.getElementById("quran-verse-search")),
          theme: document.querySelector(".vg-shell")?.getAttribute("data-theme"),
          lang: document.querySelector(".vg-shell")?.getAttribute("data-lang")
        };
      })()`);
      if (!quranGeometry.reader || quranGeometry.reader.left < -1 || quranGeometry.reader.right > quranGeometry.viewport + 1 || quranGeometry.documentWidth > quranGeometry.viewport + 1 || quranGeometry.verseCount !== 7 || !quranGeometry.search || quranGeometry.theme !== (item.theme ?? "dark") || quranGeometry.lang !== (item.lang ?? "ar") || (item.width <= 1100 && !(quranGeometry.reader.top < quranGeometry.catalogTop))) {
        throw new Error(`${item.name} Quran reader failed: ${JSON.stringify(quranGeometry)}`);
      }
      diagnostics.geometry = quranGeometry;
      if (item.name === "quran-1440-rtl") {
        await evaluate(session, 'document.getElementById("quran-ayah-1-2").click()');
        await waitFor(session, 'JSON.parse(localStorage.getItem("quran-last-position-v1") || "{}").ayah === 2', "saved Quran position");
        await session.send("Page.navigate", { url: `${origin}/quran` });
        await waitFor(session, 'document.getElementById("quran-ayah-1-2")?.getAttribute("aria-pressed") === "true"', "restored Quran position");
      }
    }
    if (item.path === "/seerah") {
      await waitFor(session, 'document.querySelectorAll(\'ol[aria-label="محطات الفصل"] button\').length > 1', `${item.name} events`);
      const seerahGeometry = await evaluate(session, `(() => {
        const detail = document.querySelector('article[aria-label="تفاصيل المحطة المختارة"]');
        const bounds = detail?.getBoundingClientRect().toJSON();
        const buttons = [...document.querySelectorAll('ol[aria-label="محطات الفصل"] button')];
        return {
          viewport: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          detail: bounds,
          selected: buttons.filter((button) => button.getAttribute("aria-pressed") === "true").length,
          placeLink: detail?.querySelector('a[href^="/atlas?place="]')?.getAttribute("href") ?? null,
          dateUncertainty: detail?.textContent?.includes("غير موثقة في بيانات المحطة")
        };
      })()`);
      if (!seerahGeometry.detail || seerahGeometry.detail.left < -1 || seerahGeometry.detail.right > seerahGeometry.viewport + 1 || seerahGeometry.documentWidth > seerahGeometry.viewport + 1 || seerahGeometry.selected !== 1 || !seerahGeometry.placeLink || !seerahGeometry.dateUncertainty) {
        throw new Error(`${item.name} selected Seerah event failed: ${JSON.stringify(seerahGeometry)}`);
      }
      diagnostics.geometry = seerahGeometry;
      if (item.name === "seerah-390-rtl") {
        const selected = await evaluate(session, `(() => {
          const buttons = document.querySelectorAll('ol[aria-label="محطات الفصل"] button');
          buttons[1].click();
          return document.querySelector('article[aria-label="تفاصيل المحطة المختارة"] h3')?.textContent;
        })()`);
        const link = await waitFor(session, 'document.querySelector(\'article[aria-label="تفاصيل المحطة المختارة"] a[href^="/atlas?place="]\')?.getAttribute("href")', "event place link");
        await evaluate(session, 'document.querySelector(\'article[aria-label="تفاصيل المحطة المختارة"] a[href^="/atlas?place="]\').click()');
        await waitFor(session, `location.pathname === "/atlas" && location.search === ${JSON.stringify(new URL(link, origin).search)} && document.querySelector('[data-climate="places"]') !== null`, "linked Atlas place");
        await waitFor(session, `document.querySelector('.vg-shell')?.textContent?.includes(${JSON.stringify(selected)})`, "Atlas event mention");
        const returnLink = await evaluate(session, `document.querySelector('a[href^="/seerah?chapter="]')?.getAttribute("href")`);
        if (!returnLink) throw new Error("Atlas place has no event return link");
        await evaluate(session, 'document.querySelector(\'a[href^="/seerah?chapter="]\').click()');
        await waitFor(session, `location.pathname === "/seerah" && document.querySelector('article[aria-label="تفاصيل المحطة المختارة"] h3')?.textContent === ${JSON.stringify(selected)}`, "restored Seerah event");
        diagnostics.roundTrip = { link, returnLink, selected };
      }
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
