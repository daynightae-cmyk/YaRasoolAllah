/**
 * YA RASOOL ALLAH ﷺ — Windows desktop main process.
 *
 * One codebase, one honesty contract: the desktop window loads the exact
 * production web build (dist/public) through a privileged local protocol.
 * Local corpora (Quran, Seerah, library catalog) work fully offline; live
 * provider-governed content resolves to the canonical institution origin
 * via client/src/lib/api-origin.ts. Nothing is fabricated locally.
 */

const { app, BrowserWindow, protocol, net, shell } = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

// Packaged app: web build sits beside main.cjs inside the asar (app dir =
// desktop/). Dev runs from the repo root use the vite output directly.
const fs = require("node:fs");
const PACKAGED_WEB_ROOT = path.join(__dirname, "public");
const DEV_WEB_ROOT = path.join(__dirname, "..", "dist", "public");
const WEB_ROOT = fs.existsSync(PACKAGED_WEB_ROOT) ? PACKAGED_WEB_ROOT : DEV_WEB_ROOT;
const SCHEME = "yra";
const APP_ORIGIN = `${SCHEME}://institution`;

// Privileged scheme: behaves like https for fetch/storage, never mixed content.
protocol.registerSchemesAsPrivileged([
  {
    scheme: SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

function resolveInsideWebRoot(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const cleaned = decoded === "/" ? "/index.html" : decoded;
  const resolved = path.normalize(path.join(WEB_ROOT, cleaned));
  if (!resolved.startsWith(WEB_ROOT)) return null;
  return resolved;
}

function serveRequest(request) {
  const url = new URL(request.url);
  const file = resolveInsideWebRoot(url.pathname);
  if (!file) return new Response("Forbidden", { status: 403 });
  // SPA fallback: extensionless routes are client-side router paths and
  // must receive the app shell, exactly like the production web server.
  if (!path.extname(file)) {
    return net.fetch(pathToFileURL(path.join(WEB_ROOT, "index.html")).toString());
  }
  return net.fetch(pathToFileURL(file).toString());
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 390,
    minHeight: 700,
    backgroundColor: "#020617",
    autoHideMenuBar: true,
    title: "يا رسول الله ﷺ",
    icon: path.join(__dirname, "icon.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  // Only the bundled institution origin may navigate the window.
  window.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(APP_ORIGIN)) event.preventDefault();
  });

  // External references open in the system browser, never inside the shell.
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  window.loadURL(`${APP_ORIGIN}/`);
}

app.whenReady().then(() => {
  protocol.handle(SCHEME, serveRequest);

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
