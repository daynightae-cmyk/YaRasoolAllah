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
  { name: "audio-1440-rtl", path: "/audio", width: 1440, height: 1000 },
  { name: "audio-390-rtl", path: "/audio", width: 390, height: 844 },
  { name: "seerah-1440-rtl", path: "/seerah", width: 1440, height: 1000 },
  { name: "seerah-768-rtl", path: "/seerah", width: 768, height: 900 },
  { name: "seerah-390-rtl", path: "/seerah", width: 390, height: 844 },
  { name: "seerah-768-ltr", path: "/seerah", width: 768, height: 900, lang: "en", expectNotice: "arabic_only" },
  { name: "five-pillars-768-ltr", path: "/five-pillars", width: 768, height: 900, lang: "en", expectNotice: "arabic_only" },
  { name: "women-390-ltr", path: "/women-in-islam", width: 390, height: 844, lang: "en", expectNotice: "arabic_only" },
  { name: "who-768-ltr", path: "/who-is-muhammad", width: 768, height: 900, lang: "en", expectNotice: "partly_translated" },
  { name: "hadith-768-ltr", path: "/hadith", width: 768, height: 900, lang: "en", expectNotice: "partly_translated" },
  { name: "tasbih-390-ltr", path: "/digital-tasbih", width: 390, height: 844, lang: "en", expectNotice: "partly_translated" },
  { name: "library-768-ltr", path: "/library", width: 768, height: 900, lang: "en", expectNotice: "partly_translated" },
  { name: "quran-768-ltr", path: "/quran", width: 768, height: 900, lang: "en", expectNotice: "none" },
  { name: "who-1440-rtl", path: "/who-is-muhammad", width: 1440, height: 1000 },
  { name: "who-390-rtl", path: "/who-is-muhammad", width: 390, height: 844 },
  { name: "kids-360-rtl", path: "/kids", width: 360, height: 844 },
  { name: "hadith-1440-rtl", path: "/hadith", width: 1440, height: 1000 },
  { name: "hadith-390-rtl", path: "/hadith", width: 390, height: 844 },
  { name: "daily-1440-rtl", path: "/daily", width: 1440, height: 1000 },
  { name: "daily-390-rtl", path: "/daily", width: 390, height: 844 },
  { name: "daily-verse-1440-rtl", path: "/daily-verse", width: 1440, height: 1000 },
  { name: "basirah-1440-rtl", path: "/basirah", width: 1440, height: 1000 },
  { name: "basirah-390-rtl", path: "/basirah", width: 390, height: 844 },
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

/**
 * Re-runs `poke` on every poll until `check` returns something truthy.
 *
 * Dispatching a media event once is a race: if React has not attached the
 * handler yet, the event is lost and the gate times out even though the app
 * is correct. Re-dispatching until the expected state appears removes the race
 * instead of hoping the first dispatch lands.
 */
async function dispatchUntil(session, poke, check, label, attempts = 80) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const value = await evaluate(session, `(() => { ${poke} return (() => { ${check} })(); })()`, true);
    if (value) return value;
    await delay(150);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

const AUDIO_ALERT_TEXT = "تعذر تشغيل البث من MP3Quran";
const audioAlertExpression = `[...document.querySelectorAll('[role="alert"]')].find((element) => element.textContent?.includes(${JSON.stringify(
  AUDIO_ALERT_TEXT,
)}))`;
const playLabelExpression = `([...document.querySelectorAll("button")].find((button) => {
  const label = button.getAttribute("aria-label") || "";
  return label.includes("تشغيل التلاوة") || label.includes("إيقاف التلاوة");
})?.getAttribute("aria-label")) || ""`;

async function verifyAudioFailureState(session, label) {
  // The player mounts only after the MP3Quran catalog resolves, so the <audio>
  // element is frequently absent on the first attempt. The poke must therefore
  // stay a no-op while it is missing and the check must require it: throwing
  // here used to abort the run before dispatchUntil could retry, which made
  // this gate fail roughly half the time while the application was correct.
  const failed = await dispatchUntil(
    session,
    `document.querySelector("audio")?.dispatchEvent(new Event("error"));`,
    `if (!document.querySelector("audio")) return null;
     const alert = ${audioAlertExpression};
     return alert ? { alert: alert.textContent || "", playLabel: ${playLabelExpression} } : null;`,
    `${label} stream error`,
  );
  if (!failed.alert || !failed.playLabel.includes("تشغيل التلاوة")) {
    throw new Error(`${label} stream error state failed: ${JSON.stringify(failed)}`);
  }
  await dispatchUntil(
    session,
    `document.querySelector("audio")?.dispatchEvent(new Event("play"));`,
    `return ${audioAlertExpression} ? null : ${playLabelExpression};`,
    `${label} stream recovery`,
  );
  await dispatchUntil(
    session,
    `document.querySelector("audio")?.dispatchEvent(new Event("pause"));`,
    `const current = ${playLabelExpression};
     return current.includes("تشغيل التلاوة") ? current : null;`,
    `${label} stream pause`,
  );
  return failed;
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
    // A cold load of a heavy route (/quran serves the bundled corpus) can take
    // well over the default budget on a dev server, and a navigation timeout
    // here says nothing about the application. This waits longer; it does not
    // wait less.
    await waitFor(
      session,
      `document.readyState === "complete" && location.pathname === "${item.path === "/" ? "/" : item.path}"`,
      item.path,
      300,
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
    if (["quran-1440-rtl", "audio-1440-rtl"].includes(item.name)) {
      diagnostics.audioFailure = await verifyAudioFailureState(session, item.name);
    }
    if (item.path === "/seerah") {
      await waitFor(session, 'document.querySelectorAll(\'ol[aria-label="محطات الفصل"] button\').length > 1', `${item.name} events`);
      const seerahGeometry = await evaluate(session, `(() => {
        const detail = document.querySelector('article[aria-label="تفاصيل المحطة المختارة"]');
        const bounds = detail?.getBoundingClientRect().toJSON();
        const buttons = [...document.querySelectorAll('ol[aria-label="محطات الفصل"] button')];
        const graph = document.querySelector('[data-visual="seerah-event-graph"]');
        const graphBounds = graph?.getBoundingClientRect().toJSON();
        return {
          viewport: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          detail: bounds,
          selected: buttons.filter((button) => button.getAttribute("aria-pressed") === "true").length,
          placeLink: detail?.querySelector('a[href^="/atlas?place="]')?.getAttribute("href") ?? null,
          dateUncertainty: detail?.textContent?.includes("غير موثقة في بيانات المحطة"),
          graph: graphBounds ?? null,
          graphRelations: graph?.querySelectorAll("[data-graph-relations] li").length ?? 0,
          graphButtons: graph?.querySelectorAll("button").length ?? 0,
          graphDeferred: graph?.querySelectorAll("[data-graph-deferred] li").length ?? 0,
          graphNarrativeNote: graph?.textContent?.includes("ترتيب سردي لا تقويم تاريخي") ?? false
        };
      })()`);
      if (!seerahGeometry.detail || seerahGeometry.detail.left < -1 || seerahGeometry.detail.right > seerahGeometry.viewport + 1 || seerahGeometry.documentWidth > seerahGeometry.viewport + 1 || seerahGeometry.selected !== 1 || !seerahGeometry.placeLink || !seerahGeometry.dateUncertainty) {
        throw new Error(`${item.name} selected Seerah event failed: ${JSON.stringify(seerahGeometry)}`);
      }
      if (!seerahGeometry.graph || seerahGeometry.graph.left < -1 || seerahGeometry.graph.right > seerahGeometry.viewport + 1 || seerahGeometry.graphRelations < 4 || seerahGeometry.graphButtons < 1 || seerahGeometry.graphDeferred < 4 || !seerahGeometry.graphNarrativeNote) {
        throw new Error(`${item.name} Seerah event graph failed: ${JSON.stringify(seerahGeometry)}`);
      }
      diagnostics.geometry = seerahGeometry;
      if (item.name === "seerah-390-rtl") {
        await evaluate(session, `(() => {
          const buttons = document.querySelectorAll('ol[aria-label="محطات الفصل"] button');
          if (!buttons[1]) throw new Error("Second Seerah event button is missing");
          buttons[1].click();
          return true;
        })()`);
        const selected = await waitFor(session, `(() => {
          const buttons = document.querySelectorAll('ol[aria-label="محطات الفصل"] button');
          const title = document.querySelector('article[aria-label="تفاصيل المحطة المختارة"] h3')?.textContent || "";
          return buttons[1]?.getAttribute("aria-pressed") === "true" ? title : "";
        })()`, "selected Seerah event");
        const link = await waitFor(session, 'document.querySelector(\'article[aria-label="تفاصيل المحطة المختارة"] a[href^="/atlas?place="]\')?.getAttribute("href")', "event place link");
        await evaluate(session, 'document.querySelector(\'article[aria-label="تفاصيل المحطة المختارة"] a[href^="/atlas?place="]\').click()');
        await waitFor(session, `location.pathname === "/atlas" && location.search === ${JSON.stringify(new URL(link, origin).search)} && document.querySelector('[data-climate="places"]') !== null`, "linked Atlas place");
        await waitFor(session, `document.querySelector('.vg-shell')?.textContent?.includes(${JSON.stringify(selected)})`, "Atlas event mention");
        const returnLink = await evaluate(session, `document.querySelector('a[href^="/seerah?chapter="]')?.getAttribute("href")`);
        if (!returnLink) throw new Error("Atlas place has no event return link");
        await evaluate(session, 'document.querySelector(\'a[href^="/seerah?chapter="]\').click()');
        await waitFor(session, `location.pathname === "/seerah" && document.querySelector('article[aria-label="تفاصيل المحطة المختارة"] h3')?.textContent === ${JSON.stringify(selected)}`, "restored Seerah event");
        diagnostics.roundTrip = { link, returnLink, selected };
        const beforeGraphTitle = await evaluate(session, 'document.querySelector(\'article[aria-label="تفاصيل المحطة المختارة"] h3\')?.textContent || ""');
        const graphNavClicked = await evaluate(session, '(() => { const button = document.querySelector(\'[data-visual="seerah-event-graph"] button\'); if (!button) return false; button.click(); return true; })()');
        if (!graphNavClicked) throw new Error("Seerah event graph has no navigation button");
        const afterGraphTitle = await waitFor(session, `(() => { const title = document.querySelector('article[aria-label="تفاصيل المحطة المختارة"] h3')?.textContent || ""; return title && title !== ${JSON.stringify(beforeGraphTitle)} ? title : ""; })()`, "Seerah graph navigation");
        diagnostics.graphNavigation = { before: beforeGraphTitle, after: afterGraphTitle };
      }
    }
    if (item.path === "/who-is-muhammad") {
      await waitFor(session, 'document.querySelector(".vg-shell main h1")?.textContent?.includes("محمد")', `${item.name} who-is-muhammad`);
      const whoGeometry = await evaluate(session, `(() => {
        const shell = document.querySelector(".vg-shell");
        const heading = shell?.querySelector("main h1");
        const rect = heading?.getBoundingClientRect().toJSON() ?? null;
        return {
          viewport: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          shellCount: document.querySelectorAll(".vg-shell").length,
          heading: rect,
          legacyShellHeaderCount: [...document.querySelectorAll("header")].filter((node) => !node.closest(".vg-shell")).length
        };
      })()`);
      if (!whoGeometry.heading || whoGeometry.shellCount !== 1 || whoGeometry.documentWidth > whoGeometry.viewport + 1 || whoGeometry.heading.left < -1 || whoGeometry.heading.right > whoGeometry.viewport + 1 || whoGeometry.legacyShellHeaderCount !== 0) {
        throw new Error(`${item.name} canonical shell failed: ${JSON.stringify(whoGeometry)}`);
      }
      diagnostics.geometry = whoGeometry;
    }
    if (item.lang === "en") {
      const languageBoundary = await evaluate(session, `(() => {
        const shell = document.querySelector(".vg-shell");
        const notice = document.querySelector('[data-visual="content-language-notice"]');
        const main = shell?.querySelector("main");
        return {
          uiLang: shell?.getAttribute("data-lang"),
          dir: shell?.getAttribute("dir"),
          notice: notice ? (notice.textContent || "") : null,
          noticeWidth: notice ? notice.getBoundingClientRect().width : 0,
          noticeShape: notice ? notice.getAttribute("data-content-shape") : null,
          noticeLanguages: notice ? notice.getAttribute("data-content-languages") : null,
          noticeAvailable: notice ? notice.getAttribute("data-available-languages") : null,
          noticeCaveat: notice
            ? (notice.querySelector('[data-visual="content-language-caveat"]')?.textContent || "")
            : "",
          viewport: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          hasMain: Boolean(main)
        };
      })()`);
      if (languageBoundary.uiLang !== "en" || languageBoundary.dir !== "ltr" || !languageBoundary.hasMain) {
        throw new Error(`${item.name} English interface shell failed: ${JSON.stringify(languageBoundary)}`);
      }
      const declaresArabicContent = languageBoundary.notice !== null;
      const expectedShape = item.expectNotice ?? null;
      if (expectedShape === "none" && declaresArabicContent) {
        throw new Error(
          `${item.name} lets the reader choose their own edition, so claiming untranslated material is false: ${JSON.stringify(languageBoundary)}`,
        );
      }
      if (expectedShape && expectedShape !== "none" && !declaresArabicContent) {
        throw new Error(
          `${item.name} must disclose its content shape (${expectedShape}): ${JSON.stringify(languageBoundary)}`,
        );
      }
      if (expectedShape && expectedShape !== "none" && languageBoundary.noticeShape !== expectedShape) {
        throw new Error(
          `${item.name} disclosed the wrong shape, ${languageBoundary.noticeShape} instead of ${expectedShape}: ${JSON.stringify(languageBoundary)}`,
        );
      }
      if (declaresArabicContent) {
        const text = languageBoundary.notice ?? "";
        if (languageBoundary.noticeWidth <= 0) {
          throw new Error(`${item.name} content language notice failed: ${JSON.stringify(languageBoundary)}`);
        }
        if (languageBoundary.noticeShape === "arabic_only") {
          if (!text.includes("recorded in Arabic only") || !text.includes("لم يُترجم")) {
            throw new Error(`${item.name} content language notice failed: ${JSON.stringify(languageBoundary)}`);
          }
          if (languageBoundary.noticeAvailable !== "") {
            throw new Error(
              `${item.name} declares no translated edition, so it must not name one: ${JSON.stringify(languageBoundary)}`,
            );
          }
        }
        if (languageBoundary.noticeShape === "partly_translated") {
          if (
            !text.includes("Part of this page appears in English") ||
            !text.includes("untranslated") ||
            !text.includes("غير مترجم")
          ) {
            throw new Error(
              `${item.name} must say which part is English and which is untranslated: ${JSON.stringify(languageBoundary)}`,
            );
          }
          if (!languageBoundary.noticeCaveat) {
            throw new Error(
              `${item.name} shows English and must say what kind of English it is: ${JSON.stringify(languageBoundary)}`,
            );
          }
        }
      } else if (languageBoundary.documentWidth > languageBoundary.viewport + 1) {
        throw new Error(`${item.name} English interface overflowed: ${JSON.stringify(languageBoundary)}`);
      }
      diagnostics.contentLanguage = { ...languageBoundary, declaresArabicContent };
    }
    if (item.path === "/daily-verse") {
      await waitFor(session, 'document.querySelectorAll(\'[role="tab"]\').length >= 4', `${item.name} daily verse tabs`);
      const honesty = await waitFor(session, `(() => {
        const claim = document.querySelector('[data-honesty="no-reward-claim"]');
        if (!claim) return null;
        const bounds = claim.getBoundingClientRect().toJSON();
        return {
          viewport: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          bounds,
          statesReward: (claim.textContent || "").includes("حسنة") || (claim.textContent || "").includes("بإذن الله"),
          statesBoundary: (claim.textContent || "").includes("لا تذكر هذه الصفحة أجرًا أو ثوابًا محددًا"),
          countLabel: (claim.textContent || "").includes("عدد مرات المشاركة")
        };
      })()`, "daily verse honesty card");
      if (!honesty || honesty.statesReward || !honesty.statesBoundary || !honesty.countLabel || honesty.documentWidth > honesty.viewport + 1 || honesty.bounds.left < -1 || honesty.bounds.right > honesty.viewport + 1) {
        throw new Error(`${item.name} daily verse reward honesty failed: ${JSON.stringify(honesty)}`);
      }
      diagnostics.dailyVerseHonesty = honesty;
    }
    if (["/hadith", "/daily", "/basirah"].includes(item.path)) {
      await waitFor(session, '(document.querySelector(".vg-shell main h1")?.textContent || "").trim().length > 0', `${item.name} supporting wing heading`);
      if (item.path === "/hadith") {
        await waitFor(session, 'document.querySelector(".vg-shell main")?.textContent?.includes("نطاق المحتوى الحالي")', `${item.name} Hadith corpus scope panel`);
      }
      const truthGeometry = await evaluate(session, `(() => {
        const shell = document.querySelector(".vg-shell");
        const main = shell?.querySelector("main");
        return {
          viewport: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          heading: main?.querySelector("h1")?.textContent || "",
          text: main?.textContent || "",
          shellCount: document.querySelectorAll(".vg-shell").length
        };
      })()`);
      if (truthGeometry.shellCount !== 1 || truthGeometry.documentWidth > truthGeometry.viewport + 1 || !truthGeometry.heading) {
        throw new Error(`${item.name} supporting wing shell failed: ${JSON.stringify(truthGeometry)}`);
      }
      if (item.path === "/hadith" && (!truthGeometry.text.includes("عينة تطوير") || !truthGeometry.text.includes("قيد المراجعة"))) {
        throw new Error(`${item.name} lost Hadith review boundary`);
      }
      if (item.path === "/hadith" && (!truthGeometry.text.includes("نطاق المحتوى الحالي") || !truthGeometry.text.includes("Sunnah.com") || !truthGeometry.text.includes("Dorar") || !truthGeometry.text.includes("المتن الكامل غير متاح"))) {
        throw new Error(`${item.name} lost Hadith corpus scope boundary`);
      }
      if (item.path === "/basirah" && !truthGeometry.text.includes("ليست مفتي")) {
        throw new Error(`${item.name} lost Basirah non-mufti boundary`);
      }
      diagnostics.geometry = truthGeometry;
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
