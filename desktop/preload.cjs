/**
 * Desktop preload — deliberately empty surface.
 *
 * The institution client needs no native bridge: it is the same governed
 * web app. contextIsolation stays on, nodeIntegration stays off, and no
 * privileged API is exposed to page scripts.
 *
 * One environment marker only: the bundled client is served from the
 * privileged local protocol, so governed API calls resolve to the canonical
 * institution origin (client/src/lib/api-origin.ts). No data is injected.
 */

const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("__YRA_DESKTOP__", true);
