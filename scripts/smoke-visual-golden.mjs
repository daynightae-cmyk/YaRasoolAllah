import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import WebSocket from "ws";

const origin = process.env.VISUAL_BASE_URL ?? "http://127.0.0.1:3000";
const chromePath = process.env.CHROME_PATH;
if (!chromePath) throw new Error("CHROME_PATH is required for visual golden smoke");

const evidenceDir = resolve(process.env.VISUAL_EVIDENCE_DIR ?? "artifacts/visual-golden-smoke");
const profileDir = mkdtempSync(join(tmpdir(), "yra-visual-golden-smoke-"));
const debuggingPort = Number(process.env.VISUAL_DEBUG_PORT ?? 9342);
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
  { name: "kids-transport-1440-rtl", path: "/kids", width: 1440, height: 1000, assertTransportLocked: true },
  { name: "hadith-1440-rtl", path: "/hadith", width: 1440, height: 1000 },
  { name: "hadith-390-rtl", path: "/hadith", width: 390, height: 844 },
  { name: "daily-1440-rtl", path: "/daily", width: 1440, height: 1000 },
  { name: "daily-390-rtl", path: "/daily", width: 390, height: 844 },
  { name: "daily-verse-1440-rtl", path: "/daily-verse", width: 1440, height: 1000 },
  { name: "basirah-1440-rtl", path: "/basirah", width: 1440, height: 1000 },
  { name: "basirah-390-rtl", path: "/basirah", width: 390, height: 844 },
  { name: "library-1440-rtl", path: "/library", width: 1440, height: 1000 },
  { name: "library-reader-1440-ltr", path: "/library", width: 1440, height: 1000, lang: "en", openReader: true },
  { name: "sources-1440-rtl", path: "/sources", width: 1440, height: 1000 },
  { name: "sources-360-rtl", path: "/sources", width: 360, height: 844 },
  { name: "noor-1440-rtl", path: "/noor", width: 1440, height: 1000 },
  { name: "noor-768-rtl", path: "/noor", width: 768, height: 900 },
  { name: "noor-390-rtl", path: "/noor", width: 390, height: 844 },
  { name: "noor-390-ltr", path: "/noor", width: 390, height: 844, lang: "en", expectNotice: "arabic_only" },
];

// Optional targeted runs, e.g. SMOKE_CASES=seerah-1440-rtl,library-1440-rtl.
// CI runs the full set; filtering only shortens local diagnosis.
const requestedCases = (process.env.SMOKE_CASES ?? "")
  .split(",")
  .map((name) => name.trim())
  .filter(Boolean);
const selectedCases = requestedCases.length
  ? cases.filter((item) => requestedCases.includes(item.name))
  : cases;
if (selectedCases.length === 0) {
  throw new Error(`SMOKE_CASES matched no case: ${requestedCases.join(", ")}`);
}

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

// The player mounts only after the recitation catalog resolves, which on a cold
// dev server takes far longer than the default budget. This waits longer; it
// does not assert less. The alert must still appear or the gate still fails.
const AUDIO_GATE_ATTEMPTS = 320;

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
    AUDIO_GATE_ATTEMPTS,
  );
  if (!failed.alert || !failed.playLabel.includes("تشغيل التلاوة")) {
    throw new Error(`${label} stream error state failed: ${JSON.stringify(failed)}`);
  }
  await dispatchUntil(
    session,
    `document.querySelector("audio")?.dispatchEvent(new Event("play"));`,
    `return ${audioAlertExpression} ? null : ${playLabelExpression};`,
    `${label} stream recovery`,
    AUDIO_GATE_ATTEMPTS,
  );
  await dispatchUntil(
    session,
    `document.querySelector("audio")?.dispatchEvent(new Event("pause"));`,
    `const current = ${playLabelExpression};
     return current.includes("تشغيل التلاوة") ? current : null;`,
    `${label} stream pause`,
    AUDIO_GATE_ATTEMPTS,
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

  for (const item of selectedCases) {
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
      `document.readyState === "complete" && location.pathname === "${item.path === "/" ? "/" : item.path}" && (document.querySelector(".vg-shell main")?.innerText || "").trim().length > 0`,
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
        const wings = [...shell.querySelectorAll("main #knowledge-wings nav[aria-label] a")];
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
      if (!geometry.search || !geometry.form || !geometry.copy || geometry.documentWidth > geometry.viewport + 1 || geometry.search.width < 32 || geometry.search.left < -1 || geometry.search.right > geometry.viewport + 1 || geometry.form.width < 80 || geometry.form.left < -1 || geometry.form.right > geometry.viewport + 1 || geometry.form.top < geometry.copy.top - 1 || geometry.form.bottom > geometry.copy.bottom + 1) {
        throw new Error(`${item.name} clipped or overlapping shell: ${JSON.stringify(geometry)}`);
      }
      // The Gate of Light home renders nine distinct knowledge wings (the
      // institution map). Vertical placement below the fold is intended —
      // the hero is a full doorway entrance; the contract checks presence,
      // width and horizontal containment, not viewport height.
      const expectedWings = ["/seerah", "/quran", "/hadith", "/library", "/atlas", "/kids", "/audio", "/daily", "/sources"];
      const wingHrefs = geometry.wings.map((wing) => wing.href).sort();
      if (JSON.stringify(wingHrefs) !== JSON.stringify([...expectedWings].sort()) || geometry.wings.some((wing) => wing.width < 80 || wing.left < -1 || wing.right > geometry.viewport + 1)) {
        throw new Error(`${item.name} knowledge wings missing or clipped: ${JSON.stringify(geometry.wings)}`);
      }
      diagnostics.geometry = geometry;
    }
    if (item.openReader) {
      // The reading chamber is the Library surface, and it used to render raw
      // registry enums (CLEARED_WITH_ATTRIBUTION, TXT_MARKDOWN) straight into
      // the metadata. Opening it and reading what is actually on screen is the
      // only way that claim can be checked.
      // REF-01 flow: the LibraryHub is the entrance and the desktop default is
      // the 3D arcade, so the shelf surface is reached through the hub's own
      // baseline mode control ("Shelves"). Once the shelves view is active the
      // page mounts the domain gateway shelves itself and the complete hall
      // shows the real run of spines directly — no "enter hall" click needed.
      // Older layouts had no mode hook and needed an "enter hall" click first;
      // keep supporting both without requiring the legacy click.
      await waitFor(
        session,
        'document.querySelector(\'[data-visual="library-hub"]\') !== null',
        `${item.name} library hub`,
        200,
      );
      await evaluate(session, `(() => {
        const hub = document.querySelector('[data-visual="library-hub"]');
        const mode = hub?.querySelector('[data-visual="library-mode-shelves"]')
          ?? [...(hub?.querySelectorAll("nav button") ?? [])].find((button) =>
            /الرفوف|Shelves/.test(button.textContent || ""));
        mode?.click();
        return true;
      })()`);
      await evaluate(
        session,
        `(() => {
          const enter = [...document.querySelectorAll("button")].find((button) =>
            /ادخل القاعة|Enter hall/.test(button.textContent || ""));
          if (enter) enter.click();
          return true;
        })()`,
      );

      await waitFor(session, 'document.querySelectorAll("[data-book-spine]").length > 0', `${item.name} library spines`, 400);
      await evaluate(session, 'document.querySelector("[data-book-spine]").click()');
      const readerGate = await dispatchUntil(
        session,
        `document.querySelector('[role="dialog"]')?.querySelector("button")?.click();`,
        `const dialog = document.querySelector('[role="dialog"]');
         if (!dialog) return null;
         const text = dialog.textContent || "";
         const raw = /CLEARED_WITH_ATTRIBUTION|TXT_MARKDOWN|CAN_IMPORT_TEXT|DOWNLOAD_ALLOWED/.test(text);
         const unlabelled = [...dialog.querySelectorAll("input")].some((input) => !input.getAttribute("aria-label") && !input.getAttribute("aria-labelledby"));
         if (raw || unlabelled) return { raw, unlabelled, text: text.slice(0, 400) };
         return { ok: true, raw, unlabelled, hasRights: /Cleared with attribution/.test(text), hasFormat: /Structured digital text/.test(text) };`,
        `${item.name} reading chamber`,
        120,
      );
      if (!readerGate.ok) {
        throw new Error(`${item.name} reading chamber rendered raw enums or an unnamed input: ${JSON.stringify(readerGate)}`);
      }
      if (!readerGate.hasRights) {
        throw new Error(`${item.name} reading chamber does not state rights in a readable form: ${JSON.stringify(readerGate)}`);
      }
      if (!readerGate.hasFormat) {
        throw new Error(`${item.name} reading chamber does not state the format in a readable form: ${JSON.stringify(readerGate)}`);
      }
      diagnostics.readingChamber = readerGate;
    }    if (item.assertTransportLocked) {
      // No episode is cleared for playback, so every control that can only act
      // on a video must be disabled and must say why. An enabled "play" on an
      // empty shelf is a promise the product cannot keep.
      await waitFor(
        session,
        `(() => {
          const remote = document.querySelector('[aria-label="ريموت مسرح النور"]');
          return remote ? remote.querySelectorAll("button").length : 0;
        })()`,
        `${item.name} theatre remote`,
        200,
      );
      const remoteState = await evaluate(session, `(() => {
        const remote = document.querySelector('[aria-label="ريموت مسرح النور"]');
        if (!remote) return { error: "no remote" };
        const buttons = [...remote.querySelectorAll("button")].map((b) => ({
          label: (b.getAttribute("aria-label") || "").replace(/\\s+/g, " ").trim(),
          disabled: b.disabled,
        }));
        const navigation = new Set(["رجوع", "الرئيسية"]);
        const mustLock = buttons.filter((b) => !navigation.has(b.label));
        return {
          total: buttons.length,
          stillEnabled: mustLock.filter((b) => !b.disabled).map((b) => b.label),
          navigationLocked: buttons.filter((b) => navigation.has(b.label) && b.disabled).map((b) => b.label),
          reasonShown: mustLock.filter((b) => b.disabled).every((b) => b.label.includes("لا توجد حلقة معتمدة")),
        };
      })()`);
      if (remoteState.error) {
        throw new Error(`${item.name} theatre remote missing: ${JSON.stringify(remoteState)}`);
      }
      if (remoteState.total < 10) {
        throw new Error(`${item.name} theatre remote looks incomplete: ${JSON.stringify(remoteState)}`);
      }
      if (remoteState.stillEnabled.length) {
        throw new Error(
          `${item.name} offers playback with nothing playable: ${JSON.stringify(remoteState.stillEnabled)}`,
        );
      }
      if (remoteState.navigationLocked.length) {
        throw new Error(
          `${item.name} traps the reader: navigation must stay enabled: ${JSON.stringify(remoteState.navigationLocked)}`,
        );
      }
      if (!remoteState.reasonShown) {
        throw new Error(`${item.name} disabled controls do not state the reason: ${JSON.stringify(remoteState)}`);
      }
      diagnostics.theatreTransport = remoteState;
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
        const stage = document.querySelector('[data-visual="seerah-event-stage"]');
        const bounds = detail?.getBoundingClientRect().toJSON();
        const buttons = [...document.querySelectorAll('ol[aria-label="محطات الفصل"] button')];
        const graph = document.querySelector('[data-visual="seerah-event-graph"]');
        const graphBounds = graph?.getBoundingClientRect().toJSON();
        return {
          viewport: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          detail: bounds,
          selected: buttons.filter((button) => button.getAttribute("aria-pressed") === "true").length,
          placeLink: stage?.querySelector('a[href^="/atlas?place="]')?.getAttribute("href") ?? null,
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
          const title = document.querySelector('[data-visual="seerah-event-title"]')?.textContent || "";
          return buttons[1]?.getAttribute("aria-pressed") === "true" ? title : "";
        })()`, "selected Seerah event");
        const link = await waitFor(session, 'document.querySelector(\'[data-visual="seerah-event-stage"] a[href^="/atlas?place="]\')?.getAttribute("href")', "event place link");
        await evaluate(session, 'document.querySelector(\'[data-visual="seerah-event-stage"] a[href^="/atlas?place="]\').click()');
        await waitFor(session, `location.pathname === "/atlas" && location.search === ${JSON.stringify(new URL(link, origin).search)} && document.querySelector('[data-climate="places"]') !== null`, "linked Atlas place");
        await waitFor(session, `document.querySelector('.vg-shell')?.textContent?.includes(${JSON.stringify(selected)})`, "Atlas event mention");
        const returnLink = await evaluate(session, `document.querySelector('a[href^="/seerah?chapter="]')?.getAttribute("href")`);
        if (!returnLink) throw new Error("Atlas place has no event return link");
        await evaluate(session, 'document.querySelector(\'a[href^="/seerah?chapter="]\').click()');
        await waitFor(session, `location.pathname === "/seerah" && document.querySelector('[data-visual="seerah-event-title"]')?.textContent === ${JSON.stringify(selected)}`, "restored Seerah event");
        diagnostics.roundTrip = { link, returnLink, selected };
        const beforeGraphTitle = await evaluate(session, 'document.querySelector(\'[data-visual="seerah-event-title"]\')?.textContent || ""');
        const graphNavClicked = await evaluate(session, '(() => { const button = document.querySelector(\'[data-visual="seerah-event-graph"] button\'); if (!button) return false; button.click(); return true; })()');
        if (!graphNavClicked) throw new Error("Seerah event graph has no navigation button");
        const afterGraphTitle = await waitFor(session, `(() => { const title = document.querySelector('[data-visual="seerah-event-title"]')?.textContent || ""; return title && title !== ${JSON.stringify(beforeGraphTitle)} ? title : ""; })()`, "Seerah graph navigation");
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
        // The scope panel title renders immediately; the provider rows arrive
        // with the async status fetch, so wait for the full boundary text.
        await waitFor(
          session,
          `(() => {
            const text = document.querySelector(".vg-shell main")?.textContent || "";
            return ["نطاق المحتوى الحالي", "Sunnah.com", "Dorar", "المتن الكامل غير متاح"].every((part) => text.includes(part)) ? true : null;
          })()`,
          `${item.name} Hadith corpus scope panel`,
          100,
        );
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
    if (item.path === "/noor") {
      await waitFor(
        session,
        'document.querySelector(\'[data-visual="noor-theatre"]\') !== null',
        `${item.name} theatre mount`,
        300,
      );
      const noorBase = await evaluate(session, `(() => {
        const root = document.querySelector('[data-visual="noor-theatre"]');
        const screen = document.querySelector("[data-player-state]");
        const library = document.querySelector('section[aria-labelledby="noor-library-title"]');
        const more = [...(library?.querySelectorAll("button") ?? [])].find((b) => (b.textContent || "").includes("عرض المزيد"));
        return {
          viewport: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          approved: root?.getAttribute("data-approved-count") ?? null,
          candidates: Number(root?.getAttribute("data-playback-candidate-count") ?? "NaN"),
          results: Number(root?.getAttribute("data-result-count") ?? "NaN"),
          playerState: screen?.getAttribute("data-player-state") ?? null,
          cardCount: library?.querySelectorAll("article").length ?? 0,
          moreLabel: more ? (more.textContent || "").replace(/\\s+/g, " ").trim() : null,
          queueCount: document.querySelectorAll("#noor-playlist-panel ol li button").length,
          topicCount: document.querySelectorAll("#noor-topics-panel button").length,
          topicRows: [...document.querySelectorAll("#noor-topics-panel button")].map((b) => ({
            label: (b.querySelector("strong")?.textContent || "").trim(),
            count: Number((b.querySelector("b")?.textContent || "").trim()),
          })),
          frames: document.querySelectorAll("[data-player-state] iframe").length,
        };
      })()`);
      const allTopic = noorBase.topicRows.find((row) => row.label === "كل المواد");
      const seerahTopic = noorBase.topicRows.find((row) => row.label === "السيرة النبوية");
      if (noorBase.documentWidth > noorBase.viewport + 1) {
        throw new Error(`${item.name} noor horizontal overflow: ${JSON.stringify(noorBase)}`);
      }
      if (noorBase.approved !== "0") {
        throw new Error(`${item.name} noor must not claim approvals while the count is 0: ${JSON.stringify(noorBase)}`);
      }
      if (!(noorBase.results > 0) || !(noorBase.candidates > 0)) {
        throw new Error(`${item.name} noor catalog counts missing: ${JSON.stringify(noorBase)}`);
      }
      if (!allTopic || allTopic.count !== noorBase.results) {
        throw new Error(`${item.name} noor all-topic count must equal the result count: ${JSON.stringify(noorBase)}`);
      }
      if (noorBase.topicCount !== 8) {
        throw new Error(`${item.name} noor topic rooms incomplete: ${JSON.stringify(noorBase.topicRows)}`);
      }
      if (noorBase.cardCount !== 8 || !noorBase.moreLabel) {
        throw new Error(`${item.name} noor lazy loading must start with one page of 8 cards: ${JSON.stringify(noorBase)}`);
      }
      if (noorBase.queueCount < 1 || noorBase.queueCount > 24) {
        throw new Error(`${item.name} noor queue must be a single page of at most 24: ${JSON.stringify(noorBase)}`);
      }
      if (noorBase.frames !== 0) {
        throw new Error(`${item.name} noor mounted a player without a user action: ${JSON.stringify(noorBase)}`);
      }
      if (noorBase.playerState !== "idle" && noorBase.playerState !== "blocked") {
        throw new Error(`${item.name} noor unexpected initial player state: ${JSON.stringify(noorBase)}`);
      }
      // Lazy loading reveals the next page on demand.
      await evaluate(session, `(() => {
        const library = document.querySelector('section[aria-labelledby="noor-library-title"]');
        const more = [...(library?.querySelectorAll("button") ?? [])].find((b) => (b.textContent || "").includes("عرض المزيد"));
        if (!more) throw new Error("more button missing");
        more.click();
        return true;
      })()`);
      await waitFor(
        session,
        `document.querySelectorAll('section[aria-labelledby="noor-library-title"] article').length === 16`,
        `${item.name} noor lazy more`,
      );
      // Topic rooms narrow the catalog to their own count.
      if (!seerahTopic || !(seerahTopic.count > 0) || seerahTopic.count >= noorBase.results) {
        throw new Error(`${item.name} noor seerah topic count implausible: ${JSON.stringify(noorBase.topicRows)}`);
      }
      await evaluate(session, `(() => {
        const button = [...document.querySelectorAll("#noor-topics-panel button")].find(
          (b) => (b.querySelector("strong")?.textContent || "").trim() === "السيرة النبوية",
        );
        if (!button) throw new Error("seerah topic button missing");
        button.click();
        return true;
      })()`);
      await waitFor(
        session,
        `Number(document.querySelector('[data-visual="noor-theatre"]')?.getAttribute("data-result-count")) === ${seerahTopic.count}`,
        `${item.name} noor seerah topic filter`,
      );
      // Search narrows, a nonsense query empties the catalog honestly, reset restores.
      await evaluate(session, `(() => {
        const input = document.querySelector('input[type="search"]');
        if (!input) throw new Error("search input missing");
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        setter.call(input, "zzqq-no-such-media");
        input.dispatchEvent(new Event("input", { bubbles: true }));
        return true;
      })()`);
      await waitFor(
        session,
        `document.querySelector('[data-visual="noor-theatre"]')?.getAttribute("data-result-count") === "0" && document.body.textContent.includes("لا توجد مواد بهذا البحث")`,
        `${item.name} noor empty search state`,
      );
      await evaluate(session, `(() => {
        const button = [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === "إعادة ضبط الفلاتر");
        if (!button) throw new Error("filter reset missing");
        button.click();
        return true;
      })()`);
      await waitFor(
        session,
        `Number(document.querySelector('[data-visual="noor-theatre"]')?.getAttribute("data-result-count")) === ${noorBase.results}`,
        `${item.name} noor filter reset`,
      );
      diagnostics.noorBrowse = noorBase;
      if (item.name === "noor-1440-rtl") {
        // Select an eligible official-provider candidate; only its player may mount.
        const selectedCard = await evaluate(session, `(() => {
          const library = document.querySelector('section[aria-labelledby="noor-library-title"]');
          const card = [...(library?.querySelectorAll("article") ?? [])].find((a) => (a.textContent || "").includes("مرشح لمشغل المصدر الرسمي"));
          if (!card) return null;
          card.querySelector("button").click();
          return true;
        })()`);
        if (!selectedCard) throw new Error("noor-1440-rtl: no playback-candidate card rendered");
        const afterSelect = await waitFor(session, `(() => {
          const screen = document.querySelector("[data-player-state]");
          const play = [...document.querySelectorAll("[data-player-state] button")].find((b) => (b.textContent || "").includes("تحميل المشغل الرسمي"));
          return screen?.getAttribute("data-player-state") === "idle" && play
            ? { id: screen.getAttribute("data-media-id"), series: document.querySelector('[data-visual="noor-theatre"]')?.getAttribute("data-selected-series") }
            : null;
        })()`, "noor candidate selection");
        // Deep link round-trip keeps the same material selected.
        await session.send("Page.navigate", { url: `${origin}/noor?media=${encodeURIComponent(afterSelect.id)}` });
        await waitFor(
          session,
          `document.querySelector("[data-player-state]")?.getAttribute("data-media-id") === ${JSON.stringify(afterSelect.id)}`,
          "noor deep link",
          200,
        );
        // Mount the official provider frame explicitly; autoplay must stay off.
        await evaluate(session, `(() => {
          const play = [...document.querySelectorAll("[data-player-state] button")].find((b) => (b.textContent || "").includes("تحميل المشغل الرسمي"));
          if (!play) throw new Error("official play button missing");
          play.click();
          return true;
        })()`);
        const frameSrc = await waitFor(
          session,
          `document.querySelector("[data-player-state] iframe")?.src ?? null`,
          "noor provider frame",
          120,
        );
        const frameUrl = new URL(frameSrc);
        if (
          frameUrl.hostname !== "www.youtube-nocookie.com" ||
          frameUrl.searchParams.get("autoplay") !== "0" ||
          frameUrl.searchParams.get("enablejsapi") !== "1" ||
          !frameUrl.searchParams.get("origin")
        ) {
          throw new Error(`noor provider frame src unsafe: ${frameSrc}`);
        }
        const playerEnd = await waitFor(
          session,
          `["ready", "error"].includes(document.querySelector("[data-player-state]")?.getAttribute("data-player-state") ?? "")
            ? document.querySelector("[data-player-state]")?.getAttribute("data-player-state")
            : null`,
          "noor player settle",
          160,
        );
        if (playerEnd === "error") {
          // A cold provider load can finish after the app's error timeout and
          // flip the state back to ready; both outcomes are legitimate, the
          // error overlay must appear whenever the state stays on error.
          await waitFor(
            session,
            `(document.querySelector("[data-player-state]")?.getAttribute("data-player-state") === "ready")
              || document.body.textContent.includes("تعذر تحميل إطار المزود")
              ? true : null`,
            "noor error treatment or late ready",
            120,
          );
        }
        // A provider-refused record stays blocked: no frame, no play button, honest reason.
        await session.send("Page.navigate", { url: `${origin}/noor?media=${encodeURIComponent("youtube:wyAr0xvt43o")}` });
        const blocked = await waitFor(session, `(() => {
          const screen = document.querySelector("[data-player-state]");
          if (screen?.getAttribute("data-media-id") !== "youtube:wyAr0xvt43o") return null;
          return {
            state: screen.getAttribute("data-player-state"),
            frames: document.querySelectorAll("[data-player-state] iframe").length,
            play: [...document.querySelectorAll("[data-player-state] button")].some((b) => (b.textContent || "").includes("تحميل المشغل الرسمي")),
            reason: document.body.textContent.includes("لا يتوفر مشغل رسمي صالح"),
          };
        })()`, "noor refused record", 200);
        if (!blocked || blocked.state !== "blocked" || blocked.frames !== 0 || blocked.play || !blocked.reason) {
          throw new Error(`noor refused record not blocked correctly: ${JSON.stringify(blocked)}`);
        }
        // The refused record's own review dialog states the seven gates honestly.
        await session.send("Page.navigate", { url: `${origin}/noor` });
        await waitFor(session, 'document.querySelector(\'[data-visual="noor-theatre"]\') !== null', "noor reload for gates", 200);
        await evaluate(session, `(() => {
          const input = document.querySelector('input[type="search"]');
          if (!input) throw new Error("search input missing");
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          setter.call(input, "Conquest of Damascus");
          input.dispatchEvent(new Event("input", { bubbles: true }));
          return true;
        })()`);
        await waitFor(session, `(() => {
          const card = [...document.querySelectorAll('section[aria-labelledby="noor-library-title"] article')]
            .find((a) => (a.textContent || "").includes("Damascus"));
          if (!card) return null;
          card.querySelector("button").click();
          return true;
        })()`, "select refused card via search", 100);
        await waitFor(
          session,
          `(() => {
            const screen = document.querySelector("[data-player-state]");
            return screen?.getAttribute("data-media-id") === "youtube:wyAr0xvt43o" && screen?.getAttribute("data-player-state") === "blocked" ? true : null;
          })()`,
          "noor refused record selected and blocked via search",
        );
        await evaluate(session, `(() => {
          const card = document.querySelector('section[aria-labelledby="noor-library-title"] article[data-active="true"]');
          const button = card ? [...card.querySelectorAll("button")].find((b) => (b.textContent || "").includes("بيانات المراجعة")) : null;
          if (!button) throw new Error("active card review button missing");
          button.click();
          return true;
        })()`);
        const gates = await waitFor(session, `(() => {
          const dialog = document.querySelector('dialog[aria-labelledby="noor-review-title"]');
          const gateEls = dialog?.querySelectorAll('[aria-label="بوابات المراجعة السبع"] > div');
          if (!dialog?.open || !gateEls?.length) return null;
          return [...gateEls].map((g) => ({
            label: (g.querySelector("span")?.textContent || "").trim(),
            passed: g.getAttribute("data-passed"),
            status: (g.querySelector("b")?.textContent || "").trim(),
          }));
        })()`, "noor review gates", 60);
        const embeddingGate = gates?.find((g) => g.label === "التضمين");
        const publicationGate = gates?.find((g) => g.label === "النشر");
        if (!gates || gates.length !== 7) throw new Error(`noor gates count wrong: ${JSON.stringify(gates)}`);
        if (embeddingGate?.status !== "PROVIDER_REFUSED" || embeddingGate?.passed !== "false") {
          throw new Error(`noor embedding gate must show PROVIDER_REFUSED unpassed: ${JSON.stringify(gates)}`);
        }
        if (publicationGate?.passed === "true" || gates.every((g) => g.passed === "true")) {
          throw new Error(`noor refused record must not look approved: ${JSON.stringify(gates)}`);
        }
        diagnostics.noorPlayback = { frameSrc, playerEnd, afterSelect, blocked, gates };
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
