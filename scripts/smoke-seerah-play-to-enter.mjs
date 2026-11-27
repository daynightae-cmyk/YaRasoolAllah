/**
 * Play-to-Enter browser smoke — proves the Seerah crossroads gates really
 * enter the living world in place:
 *   1. the center portal is a Play button that mounts LivingSeerahWorld on
 *      /seerah itself (no route change),
 *   2. the portal veil expands, then the camera flies (worldEntryFlight
 *      active → done) and the player lands at the authored entry pose,
 *   3. a governed information interaction is reachable inside the world and
 *      navigates to the canonical chapter URL,
 *   4. Escape returns to the crossroads (layer unmounted),
 *   5. a second gate (hijrah-road) enters its own scene, and re-entry works,
 *   6. the same flow works on a 390px mobile viewport.
 * Real screenshots + a JSON report are written to artifacts/.
 */
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import WebSocket from "ws";

const origin = process.env.VISUAL_BASE_URL ?? "http://127.0.0.1:3000";
const chromePath = process.env.CHROME_PATH;
if (!chromePath) throw new Error("CHROME_PATH is required for the play-to-enter smoke");

const evidenceDir = resolve("artifacts", "seerah-play-to-enter-smoke");
const profileDir = mkdtempSync(join(tmpdir(), "yra-p2e-smoke-"));
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
  `${origin}/seerah?diag=1`,
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

const canvasState = `(() => {
  const host = document.querySelector('[data-visual="world-canvas"]');
  if (!host) return null;
  return {
    flight: host.dataset.worldEntryFlight ?? "",
    x: host.dataset.worldPlayerX ?? "",
    z: host.dataset.worldPlayerZ ?? "",
    yaw: host.dataset.worldPlayerYaw ?? "",
    prompt: host.dataset.worldPrompt ?? "",
  };
})()`;

let session;
const report = { origin, steps: {} };
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

  await waitFor(session, `document.readyState === 'complete' && location.origin === ${JSON.stringify(origin)}`, "initial load");
  await evaluate(
    session,
    `localStorage.setItem("institution-welcome-seen", "true");
     localStorage.setItem("preferred-language", "ar");
     sessionStorage.setItem("yra-splash", "1");
     true;`,
  );
  await session.send("Page.navigate", { url: `${origin}/seerah?diag=1` });
  await waitFor(session, "document.readyState === 'complete' && location.pathname === '/seerah'", "seerah route");

  // 1. The center gate is a Play button on /seerah (not a route link).
  const gate = await waitFor(
    session,
    `(() => {
      const el = document.querySelector('[data-visual="seerah-portal-world"]');
      if (!el) return null;
      return { tag: el.tagName, text: el.textContent?.trim() ?? "" };
    })()`,
    "center portal play button",
  );
  if (gate.tag !== "BUTTON") throw new Error(`Center portal must be a button, got ${gate.tag}`);
  report.steps.gate = gate;
  await screenshot(session, "01-portal-crossroads.jpg");

  // 2. Press Play → the world mounts in place on /seerah with the veil + flight.
  await evaluate(session, `document.querySelector('[data-visual="seerah-portal-world"]').click(); true;`);
  await waitFor(session, `document.querySelector('[data-visual="seerah-world-entry-layer"]') !== null`, "entry layer mounted in place");
  const layerInfo = await waitFor(
    session,
    `(() => {
      const layer = document.querySelector('[data-visual="seerah-world-entry-layer"]');
      const world = document.querySelector('[data-visual="living-seerah-world"]');
      if (!layer || !world) return null;
      return { scene: layer.dataset.scene, worldScene: world.dataset.scene, path: location.pathname };
    })()`,
    "living world mounted",
  );
  if (layerInfo.path !== "/seerah") throw new Error(`Play-to-Enter must stay in place on /seerah, got ${layerInfo.path}`);
  if (layerInfo.scene !== "desert-camp") throw new Error(`Center portal must enter desert-camp, got ${layerInfo.scene}`);
  report.steps.entry = layerInfo;

  // 3. The camera flight runs (active → done) and moves the player toward
  //    the authored entry pose of desert-camp (0, 2, 70).
  await waitFor(session, `window.__seerahWorldDiag !== undefined`, "diag hook installed");
  const flightSeen = await waitFor(
    session,
    `(() => { const s = ${canvasState}; return s && (s.flight === "active" || s.flight === "done") ? s : null; })()`,
    "entry flight started",
  );
  report.steps.flightStart = flightSeen;
  const samples = [];
  for (let i = 0; i < 24; i += 1) {
    const s = await evaluate(session, canvasState);
    if (s) samples.push({ flight: s.flight, z: Number(s.z) });
    if (s && s.flight === "done") break;
    await delay(250);
  }
  await waitFor(session, `(() => { const s = ${canvasState}; return s && s.flight === "done" ? s : null; })()`, "entry flight completed");
  const finalState = await evaluate(session, canvasState);
  report.steps.flightSamples = samples;
  report.steps.flightFinal = finalState;
  const moved = samples.length >= 2 && Math.abs(samples[samples.length - 1].z - samples[0].z) > 1;
  if (!moved) throw new Error(`Camera did not fly during entry: ${JSON.stringify(samples)}`);
  if (Math.abs(Number(finalState.z) - 70) > 3) throw new Error(`Landed away from the authored entry pose: z=${finalState.z}`);
  await screenshot(session, "02-inside-world.jpg");

  // 4. A governed info interaction is available inside the world, and using
  //    it navigates to the canonical chapter URL.
  await evaluate(
    session,
    `(() => {
      const diag = window.__seerahWorldDiag;
      const handle = diag.getHandle();
      handle.setPlayerPosition({ x: -5, y: 2, z: 5 }, 0);
      return true;
    })()`,
  );
  const prompt = await waitFor(
    session,
    `(() => { const s = ${canvasState}; return s && s.prompt ? s.prompt : null; })()`,
    "interaction prompt near info-camp",
  );
  if (prompt !== "info-camp") throw new Error(`Expected info-camp prompt, got ${prompt}`);
  report.steps.prompt = prompt;
  await screenshot(session, "03-world-prompt.jpg");
  const nav = await evaluate(
    session,
    `(() => {
      const diag = window.__seerahWorldDiag;
      const result = diag.interaction.tryInteract();
      return { success: result?.success, action: result?.action, url: result?.url ?? null };
    })()`,
  );
  await waitFor(
    session,
    `location.pathname === "/seerah" && location.search.includes("chapter=hijra-to-madinah")`,
    "governed chapter navigation from inside the world",
  );
  report.steps.interaction = { ...nav, search: await evaluate(session, "location.search") };
  if (!nav.success || nav.action !== "navigate" || !nav.url?.includes("/seerah?chapter=hijra-to-madinah")) {
    throw new Error(`Interaction did not navigate to governed content: ${JSON.stringify(nav)}`);
  }

  // 5. Escape returns to the crossroads; the world layer unmounts.
  await evaluate(session, `window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })); true;`);
  await waitFor(
    session,
    `document.querySelector('[data-visual="seerah-world-entry-layer"]') === null && document.querySelector('[data-visual="seerah-portal-world"]') !== null`,
    "return to crossroads after exit",
  );
  report.steps.returned = { path: await evaluate(session, "location.pathname") };
  await screenshot(session, "04-after-exit.jpg");

  // 6. The hijrah gate enters the hijrah-road scene (REF-13), and re-entry works.
  await evaluate(session, `document.querySelector('[data-visual="seerah-portal-hijrah"]').click(); true;`);
  const hijrahLayer = await waitFor(
    session,
    `(() => {
      const layer = document.querySelector('[data-visual="seerah-world-entry-layer"]');
      if (!layer) return null;
      return layer.dataset.scene === "hijrah-road" && document.querySelector('[data-visual="living-seerah-world"]') ? layer.dataset.scene : null;
    })()`,
    "hijrah-road world mounted",
  );
  await waitFor(session, `(() => { const s = ${canvasState}; return s && s.flight === "done" ? s : null; })()`, "hijrah flight completed");
  const hijrahState = await evaluate(session, canvasState);
  if (Math.abs(Number(hijrahState.z) - 150) > 4) throw new Error(`Hijrah entry pose wrong: z=${hijrahState.z}`);
  report.steps.hijrah = { scene: hijrahLayer, final: hijrahState };
  await screenshot(session, "05-hijrah-road-world.jpg");
  await evaluate(session, `window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })); true;`);
  await waitFor(session, `document.querySelector('[data-visual="seerah-world-entry-layer"]') === null`, "exit from hijrah world");
  report.steps.hijrahExited = true;

  // 7. Mobile viewport: the same Play-to-Enter works at 390px.
  await session.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await session.send("Page.navigate", { url: `${origin}/seerah?diag=1` });
  await waitFor(session, "document.readyState === 'complete' && location.pathname === '/seerah'", "mobile seerah route");
  await evaluate(
    session,
    `localStorage.setItem("institution-welcome-seen", "true");
     localStorage.setItem("preferred-language", "ar");
     sessionStorage.setItem("yra-splash", "1");
     true;`,
  );
  await session.send("Page.navigate", { url: `${origin}/seerah?diag=1` });
  await waitFor(session, `document.querySelector('[data-visual="seerah-portal-world"]') !== null`, "mobile play button");
  await evaluate(session, `document.querySelector('[data-visual="seerah-portal-world"]').click(); true;`);
  await waitFor(session, `document.querySelector('[data-visual="seerah-world-entry-layer"]') !== null`, "mobile entry layer");
  await waitFor(session, `(() => { const s = ${canvasState}; return s && s.flight === "done" ? s : null; })()`, "mobile flight completed");
  const mobileState = await evaluate(session, canvasState);
  report.steps.mobile = { final: mobileState };
  await screenshot(session, "06-mobile-world.jpg");
  const mobileOverflow = await evaluate(session, "document.documentElement.scrollWidth > innerWidth + 1");
  if (mobileOverflow) throw new Error("Mobile world view has horizontal overflow");

  // 8. Base page hygiene + no runtime errors.
  await session.send("Emulation.clearDeviceMetricsOverride");
  const baseOverflow = await evaluate(
    session,
    `(() => { window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })); return true; })()`,
  );
  await waitFor(session, `document.querySelector('[data-visual="seerah-world-entry-layer"]') === null`, "mobile exit");
  const runtimeErrors = session.events
    .filter((event) => event.method === "Runtime.exceptionThrown")
    .map((event) => event.params?.exceptionDetails?.text ?? "unknown");
  report.runtimeErrors = runtimeErrors;
  report.baseOverflow = baseOverflow;
  writeFileSync(join(evidenceDir, "report.json"), JSON.stringify(report, null, 2));
  if (runtimeErrors.length) throw new Error(`Runtime errors: ${JSON.stringify(runtimeErrors)}`);
  console.log("Play-to-Enter smoke PASS");
  console.log(JSON.stringify(report));
} finally {
  session?.close();
  chrome.kill();
}
