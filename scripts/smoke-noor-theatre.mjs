// Noor media theatre browser smoke: browse, filter, search, lazy-load, deep
// link, mount the official provider frame, verify REAL advancing playback time
// through the app's own provider-API position sampling, verify watch
// continuation after reload, and verify provider-refused material stays
// blocked. Evidence lands in artifacts/noor-theatre-smoke/.
//
// Run locally against the dev server:
//   CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe" node scripts/smoke-noor-theatre.mjs
// Against production:
//   VISUAL_BASE_URL=https://www.yarasoolallah.it.com CHROME_PATH=... node scripts/smoke-noor-theatre.mjs
//
// The harness launches Chrome with --autoplay-policy=no-user-gesture-required
// so the official YouTube player can be started programmatically (this stands
// in for the user pressing play inside the provider frame). The product itself
// keeps autoplay=0 and never autoplays.
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import WebSocket from "ws";

const origin = process.env.VISUAL_BASE_URL ?? "http://127.0.0.1:3000";
const chromePath = process.env.CHROME_PATH;
if (!chromePath) throw new Error("CHROME_PATH is required for the Noor theatre smoke");

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const evidenceDir = resolve(root, "artifacts", "noor-theatre-smoke");
const profileDir = mkdtempSync(join(tmpdir(), "yra-noor-smoke-"));
const debuggingPort = 9342;
mkdirSync(evidenceDir, { recursive: true });

// Expected catalog facts come from the generated catalog itself, so the smoke
// can never drift from the data it verifies.
const generated = readFileSync(
  join(root, "client/src/visual-golden/data/media-discovery.generated.ts"),
  "utf8",
);
const catalogChunks = generated.split(/\n {2}\{\n/).slice(1);
const totalMatch = generated.match(/total:\s*(\d+)/);
const kidsCount = catalogChunks.filter((chunk) => chunk.includes('sourceFile: "kids-media-catalog.csv"')).length;
const expectedAdultTotal = Number(totalMatch?.[1] ?? 0) - kidsCount;
const BLOCKERS = new Set(["REJECTED", "REMOVED", "UNAUTHORIZED", "UNAVAILABLE", "UNTRUSTED"]);
function field(chunk, key) {
  return (chunk.match(new RegExp(`${key}: "([^"]*)"`)) || [])[1] ?? null;
}
const adultCandidates = [];
let refusedAdultId = null;
for (const chunk of catalogChunks) {
  const src = (chunk.match(/sourceFile: "([^"]+)"/) || [])[1];
  if (src === "kids-media-catalog.csv") continue;
  const id = field(chunk, "id");
  if (!id) continue;
  const statuses = [
    "publisher_status",
    "rights_status",
    "embedding_status",
    "editorial_status",
    "religious_review_status",
    "depiction_review_status",
    "publication_status",
  ].map((key) => field(chunk, key));
  if (field(chunk, "embedding_status") === "PROVIDER_REFUSED" && !refusedAdultId) refusedAdultId = id;
  if (
    field(chunk, "provider") === "youtube" &&
    field(chunk, "publisher_status") !== "THIRD_PARTY" &&
    field(chunk, "video_id") &&
    field(chunk, "embed_url") &&
    !statuses.some((status) => BLOCKERS.has((status ?? "").toUpperCase()))
  ) {
    adultCandidates.push(id);
  }
}
if (!refusedAdultId) throw new Error("expected exactly one provider-refused adult record in the catalog");

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
  "--autoplay-policy=no-user-gesture-required",
  `--remote-debugging-port=${debuggingPort}`,
  `--user-data-dir=${profileDir}`,
  "about:blank",
], { stdio: "ignore" });

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

async function waitFor(session, expression, label, attempts = 120, delayMs = 200) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const value = await evaluate(session, expression, true);
    if (value) return value;
    await delay(delayMs);
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

const WATCH_KEY = "noor-watch-progress-v1";

let session;
const report = { origin, expectedAdultTotal, adultCandidateCount: adultCandidates.length, refusedAdultId };
try {
  await main();
} catch (error) {
  report.failure = String(error?.stack ?? error);
  try { writeFileSync(join(evidenceDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`); } catch {}
  console.error("Noor theatre smoke FAIL");
  console.error(report.failure);
  process.exitCode = 1;
} finally {
  session?.close();
  chrome.kill("SIGKILL");
}

async function main() {
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
     localStorage.setItem("yra-visual-golden-v1", JSON.stringify({ theme: "dark", lang: "ar" }));
     sessionStorage.setItem("yra-splash", "1");
     true;`,
  );

  // --- Browse the theatre -------------------------------------------------
  await session.send("Page.navigate", { url: `${origin}/noor` });
  await waitFor(
    session,
    "document.readyState === 'complete' && document.querySelector('[data-visual=\"noor-theatre\"]') !== null",
    "noor theatre mount",
    200,
  );
  const browse = await evaluate(session, `(() => {
    const root = document.querySelector('[data-visual="noor-theatre"]');
    const screen = document.querySelector("[data-player-state]");
    const library = document.querySelector('section[aria-labelledby="noor-library-title"]');
    return {
      documentWidth: document.documentElement.scrollWidth,
      viewport: innerWidth,
      approved: root?.getAttribute("data-approved-count"),
      candidates: Number(root?.getAttribute("data-playback-candidate-count")),
      results: Number(root?.getAttribute("data-result-count")),
      watchProgressCount: Number(root?.getAttribute("data-watch-progress-count")),
      playerState: screen?.getAttribute("data-player-state"),
      cardCount: library?.querySelectorAll("article").length ?? 0,
      queueCount: document.querySelectorAll("#noor-playlist-panel ol li button").length,
      topicCount: document.querySelectorAll("#noor-topics-panel button").length,
      topicRows: [...document.querySelectorAll("#noor-topics-panel button")].map((b) => ({
        label: (b.querySelector("strong")?.textContent || "").trim(),
        count: Number((b.querySelector("b")?.textContent || "").trim()),
      })),
      frames: document.querySelectorAll("[data-player-state] iframe").length,
    };
  })()`);
  report.browse = browse;
  if (browse.documentWidth > browse.viewport + 1) throw new Error(`noor overflow: ${JSON.stringify(browse)}`);
  if (browse.approved !== "0") throw new Error(`noor must not claim approvals: ${JSON.stringify(browse)}`);
  if (browse.results !== expectedAdultTotal) {
    throw new Error(`noor result count ${browse.results} != adult catalog ${expectedAdultTotal}`);
  }
  if (!(browse.candidates > 0)) throw new Error("noor has no official-provider candidates");
  if (browse.topicCount !== 8) throw new Error(`noor topic rooms: ${browse.topicCount}`);
  if (browse.cardCount !== 8) throw new Error(`noor initial lazy page must be 8 cards: ${browse.cardCount}`);
  if (browse.queueCount < 1 || browse.queueCount > 24) throw new Error(`noor queue page: ${browse.queueCount}`);
  if (browse.frames !== 0) throw new Error("player mounted before any user action");
  if (browse.playerState !== "idle" && browse.playerState !== "blocked") {
    throw new Error(`noor initial player state: ${browse.playerState}`);
  }

  // Lazy loading reveals the next page.
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
    "noor lazy more page",
  );

  // Topic rooms narrow the catalog to their own count.
  const seerah = browse.topicRows.find((row) => row.label === "السيرة النبوية");
  if (!seerah || !(seerah.count > 0) || seerah.count >= browse.results) {
    throw new Error(`seerah topic implausible: ${JSON.stringify(browse.topicRows)}`);
  }
  await evaluate(session, `(() => {
    const button = [...document.querySelectorAll("#noor-topics-panel button")].find(
      (b) => (b.querySelector("strong")?.textContent || "").trim() === "السيرة النبوية",
    );
    if (!button) throw new Error("seerah topic missing");
    button.click();
    return true;
  })()`);
  await waitFor(
    session,
    `Number(document.querySelector('[data-visual="noor-theatre"]')?.getAttribute("data-result-count")) === ${seerah.count}`,
    "noor seerah topic filter",
  );

  // Search narrows; a nonsense query empties honestly; reset restores.
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
    `document.querySelector('[data-visual="noor-theatre"]')?.getAttribute("data-result-count") === "0"
      && document.body.textContent.includes("لا توجد مواد بهذا البحث")`,
    "noor empty search state",
  );
  await evaluate(session, `(() => {
    const button = [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === "إعادة ضبط الفلاتر");
    if (!button) throw new Error("reset missing");
    button.click();
    return true;
  })()`);
  await waitFor(
    session,
    `Number(document.querySelector('[data-visual="noor-theatre"]')?.getAttribute("data-result-count")) === ${browse.results}`,
    "noor filter reset",
  );

  // Selecting a card and deep-linking to it must select the same material.
  await evaluate(session, `(() => {
    const library = document.querySelector('section[aria-labelledby="noor-library-title"]');
    const card = [...(library?.querySelectorAll("article") ?? [])].find((a) => (a.textContent || "").includes("مرشح لمشغل المصدر الرسمي"));
    if (!card) throw new Error("no candidate card rendered");
    card.querySelector("button").click();
    return true;
  })()`);
  const picked = await waitFor(session, `(() => {
    const screen = document.querySelector("[data-player-state]");
    return screen?.getAttribute("data-player-state") === "idle"
      ? { id: screen.getAttribute("data-media-id"), series: document.querySelector('[data-visual="noor-theatre"]')?.getAttribute("data-selected-series") }
      : null;
  })()`, "noor candidate selection");
  await session.send("Page.navigate", { url: `${origin}/noor?media=${encodeURIComponent(picked.id)}` });
  await waitFor(
    session,
    `document.querySelector("[data-player-state]")?.getAttribute("data-media-id") === ${JSON.stringify(picked.id)}`,
    "noor deep link",
    200,
  );
  report.deepLink = picked;
  await screenshot(session, "noor-browse.jpg");

  // --- Representative playback with real advancing time -------------------
  // Try a handful of official-provider candidates; the provider may refuse
  // individual embeds, so a refusal with the app's honest error treatment is
  // recorded, but at least one candidate must actually play with advancing
  // provider-reported time sampled by the app itself.
  const playback = { attempts: [] };
  let played = null;
  for (const candidateId of adultCandidates.slice(0, 4)) {
    await session.send("Page.navigate", { url: `${origin}/noor?media=${encodeURIComponent(candidateId)}` });
    await waitFor(
      session,
      `document.querySelector("[data-player-state]")?.getAttribute("data-media-id") === ${JSON.stringify(candidateId)}`,
      `noor select ${candidateId}`,
      200,
    );
    await evaluate(session, `(() => {
      const play = [...document.querySelectorAll("[data-player-state] button")].find((b) => (b.textContent || "").includes("تحميل المشغل الرسمي"));
      if (!play) throw new Error("official play button missing for candidate");
      play.click();
      return true;
    })()`);
    const frameSrc = await waitFor(session, `document.querySelector("[data-player-state] iframe")?.src ?? null`, "provider frame", 100);
    const frameUrl = new URL(frameSrc);
    const srcCheck = {
      host: frameUrl.hostname,
      autoplay: frameUrl.searchParams.get("autoplay"),
      rel: frameUrl.searchParams.get("rel"),
      enablejsapi: frameUrl.searchParams.get("enablejsapi"),
      origin: frameUrl.searchParams.get("origin"),
    };
    if (
      frameUrl.hostname !== "www.youtube-nocookie.com" ||
      srcCheck.autoplay !== "0" ||
      srcCheck.enablejsapi !== "1" ||
      !srcCheck.origin
    ) {
      throw new Error(`provider frame src unsafe for ${candidateId}: ${frameSrc}`);
    }
    let state = await waitFor(
      session,
      `["ready", "error"].includes(document.querySelector("[data-player-state]")?.getAttribute("data-player-state") ?? "")
        ? document.querySelector("[data-player-state]")?.getAttribute("data-player-state")
        : null`,
      "player settle",
      140,
      250,
    );
    if (state === "error") {
      // One honest retry through the app's own error treatment.
      await evaluate(session, `(() => {
        const retry = [...document.querySelectorAll("[data-player-state] button")].find((b) => (b.textContent || "").includes("إعادة المحاولة"));
        if (!retry) throw new Error("retry button missing in error treatment");
        retry.click();
        return true;
      })()`);
      state = await waitFor(
        session,
        `["ready", "error"].includes(document.querySelector("[data-player-state]")?.getAttribute("data-player-state") ?? "")
          ? document.querySelector("[data-player-state]")?.getAttribute("data-player-state")
          : null`,
        "player settle after retry",
        140,
        250,
      );
    }
    const attempt = { candidateId, frameSrc, srcCheck, state };
    playback.attempts.push(attempt);
    if (state === "error") {
      // The frame can still finish loading after the app's error timeout; a
      // late onLoad flips the state to ready, so allow that before giving up.
      state = await waitFor(
        session,
        `document.querySelector("[data-player-state]")?.getAttribute("data-player-state") === "ready" ? "ready" : null`,
        "late ready after error",
        120,
        500,
      ).catch(() => "error");
      attempt.lateState = state;
    }
    if (state !== "ready") {
      const errorShown = await evaluate(session, `document.body.textContent.includes("تعذر تحميل إطار المزود")`);
      attempt.errorTreatmentShown = errorShown;
      continue;
    }
    // Wait until the app has attached the provider API (the live region then
    // reports local progress tracking). Cold provider loads are slow.
    const apiAttached = await waitFor(
      session,
      `document.querySelector("span[aria-live]")?.textContent?.includes("يتتبع") ? true : null`,
      "provider API attached",
      120,
      500,
    ).catch(() => false);
    attempt.apiAttached = apiAttached;
    if (!apiAttached) continue;
    // Start playback inside the official provider frame (stands in for the
    // user pressing play there), then watch the app's own position sampling.
    const sendPlay = `(() => {
      const iframe = document.querySelector("[data-player-state] iframe");
      if (!iframe?.contentWindow) throw new Error("provider frame not accessible");
      iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: "playVideo", args: [] }), "https://www.youtube-nocookie.com");
      return true;
    })()`;
    await evaluate(session, sendPlay);
    await delay(5000);
    await evaluate(session, sendPlay); // harmless if the first one took effect
    const readProgress = `(() => {
      const raw = localStorage.getItem(${JSON.stringify(WATCH_KEY)});
      if (!raw) return null;
      const entry = JSON.parse(raw)[${JSON.stringify(candidateId)}];
      return entry ? { seconds: entry.seconds, duration: entry.duration, updatedAt: entry.updatedAt } : null;
    })()`;
    const first = await waitFor(session, `(() => { const p = (${readProgress}); return p && p.seconds > 0 ? p : null; })()`, "first non-zero position sample", 120, 500);
    await delay(6000);
    const second = await evaluate(session, readProgress, false);
    await delay(6000);
    const third = await evaluate(session, readProgress, false);
    attempt.samples = [first, second, third];
    attempt.advancing = Boolean(second && third && second.seconds > first.seconds && third.seconds > second.seconds);
    if (!attempt.advancing) continue;
    played = { candidateId, frameSrc, samples: [first, second, third], savedSeconds: third?.seconds ?? second?.seconds };
    break;
  }
  if (!played) {
    report.playback = playback;
    writeFileSync(join(evidenceDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
    throw new Error(`No candidate produced advancing playback: ${JSON.stringify(playback)}`);
  }
  report.playback = { ...playback, played };
  await screenshot(session, "noor-playback.jpg");

  // --- Watch continuation after a fresh load -------------------------------
  await session.send("Page.navigate", { url: `${origin}/noor?media=${encodeURIComponent(played.candidateId)}` });
  const resumeChip = await waitFor(
    session,
    `(() => {
      const chip = document.querySelector("[data-resume-seconds]");
      if (!chip) return null;
      return { seconds: Number(chip.getAttribute("data-resume-seconds")), state: document.querySelector("[data-player-state]")?.getAttribute("data-player-state") };
    })()`,
    "resume chip after reload",
    200,
  );
  if (!(resumeChip.seconds >= 15)) {
    throw new Error(`resume position too small to offer: ${JSON.stringify(resumeChip)}`);
  }
  // Playback kept running until navigation, so the stored position can only
  // have advanced past the last sample we recorded.
  if (resumeChip.seconds < (played.savedSeconds ?? 0)) {
    throw new Error(`resume position ${resumeChip.seconds} went backwards from sampled ${played.savedSeconds}`);
  }
  await evaluate(session, `document.querySelector("[data-resume-seconds]").click()`);
  await waitFor(session, `document.querySelector("[data-player-state] iframe") !== null`, "resume mounts the official frame", 120);
  let resumeState = await waitFor(
    session,
    `["ready", "error"].includes(document.querySelector("[data-player-state]")?.getAttribute("data-player-state") ?? "")
      ? document.querySelector("[data-player-state]")?.getAttribute("data-player-state")
      : null`,
    "resume player settle",
    140,
    250,
  );
  if (resumeState === "error") {
    resumeState = await waitFor(
      session,
      `document.querySelector("[data-player-state]")?.getAttribute("data-player-state") === "ready" ? "ready" : null`,
      "resume late ready",
      120,
      500,
    ).catch(() => "error");
  }
  if (resumeState !== "ready") throw new Error(`resume playback did not reach ready: ${resumeState}`);
  await waitFor(
    session,
    `document.querySelector("span[aria-live]")?.textContent?.includes("يتتبع") ? true : null`,
    "resume provider API attached",
    120,
    500,
  ).catch(() => { throw new Error("resume provider API never attached"); });
  // The app seeks to the stored position on resume; make sure playback runs.
  const sendPlay = `(() => {
    const iframe = document.querySelector("[data-player-state] iframe");
    iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: "playVideo", args: [] }), "https://www.youtube-nocookie.com");
    return true;
  })()`;
  await evaluate(session, sendPlay);
  await delay(5000);
  await evaluate(session, sendPlay);
  const readProgress2 = `(() => {
    const raw = localStorage.getItem(${JSON.stringify(WATCH_KEY)});
    if (!raw) return null;
    const entry = JSON.parse(raw)[${JSON.stringify(played.candidateId)}];
    return entry ? { seconds: entry.seconds, duration: entry.duration } : null;
  })()`;
  const afterResume = await waitFor(
    session,
    `(() => { const p = (${readProgress2}); return p && p.seconds > ${resumeChip.seconds} + 1 ? p : null; })()`,
    "playback advanced past the resume point",
    120,
    500,
  );
  report.resume = { chipSeconds: resumeChip.seconds, afterResume };
  await screenshot(session, "noor-resume.jpg");

  // --- Provider-refused material stays blocked -----------------------------
  await session.send("Page.navigate", { url: `${origin}/noor?media=${encodeURIComponent(refusedAdultId)}` });
  const blocked = await waitFor(session, `(() => {
    const screen = document.querySelector("[data-player-state]");
    if (screen?.getAttribute("data-media-id") !== ${JSON.stringify(refusedAdultId)}) return null;
    return {
      state: screen.getAttribute("data-player-state"),
      frames: document.querySelectorAll("[data-player-state] iframe").length,
      play: [...document.querySelectorAll("[data-player-state] button")].some((b) => (b.textContent || "").includes("تحميل المشغل الرسمي")),
      reason: document.body.textContent.includes("لا يتوفر مشغل رسمي صالح"),
    };
  })()`, "refused record selected", 200);
  if (!blocked || blocked.state !== "blocked" || blocked.frames !== 0 || blocked.play || !blocked.reason) {
    throw new Error(`refused record not blocked correctly: ${JSON.stringify(blocked)}`);
  }
  // Open the refused record's own review dialog (surface it through search so
  // its card is rendered, then use the active card's review button).
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
      return screen?.getAttribute("data-media-id") === ${JSON.stringify(refusedAdultId)} && screen?.getAttribute("data-player-state") === "blocked" ? true : null;
    })()`,
    "refused record selected and blocked via search",
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
  })()`, "review gates dialog", 60);
  if (!gates || gates.length !== 7) throw new Error(`gates count wrong: ${JSON.stringify(gates)}`);
  const embeddingGate = gates.find((g) => g.label === "التضمين");
  const publicationGate = gates.find((g) => g.label === "النشر");
  if (embeddingGate?.status !== "PROVIDER_REFUSED" || embeddingGate?.passed !== "false") {
    throw new Error(`embedding gate must show PROVIDER_REFUSED unpassed: ${JSON.stringify(gates)}`);
  }
  if (publicationGate?.passed === "true") {
    throw new Error(`publication gate must not pass for a DRAFT record: ${JSON.stringify(gates)}`);
  }
  if (gates.every((g) => g.passed === "true")) {
    throw new Error(`a refused record must not show all gates passed: ${JSON.stringify(gates)}`);
  }
  report.refused = { ...blocked, gates };
  await screenshot(session, "noor-refused.jpg");

  const runtimeErrors = session.events
    .filter((event) => event.method === "Runtime.exceptionThrown")
    .map((event) => ({ text: event.params?.exceptionDetails?.text ?? "unknown" }));
  const consoleErrors = session.events
    .filter((event) => event.method === "Runtime.consoleAPICalled" && event.params?.type === "error")
    .map((event) => ({ text: String(event.params?.args?.[0]?.value ?? event.params?.args?.[0]?.description ?? "") }))
    .filter((entry) => !/youtube|google|gstatic|Failed to load resource/i.test(entry.text));
  report.runtimeErrors = runtimeErrors;
  report.consoleErrors = consoleErrors;
  if (runtimeErrors.length || consoleErrors.length) {
    throw new Error(`Browser errors: ${JSON.stringify({ runtimeErrors, consoleErrors })}`);
  }

  writeFileSync(join(evidenceDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log("Noor theatre smoke PASS");
  console.log(JSON.stringify(report));
}
