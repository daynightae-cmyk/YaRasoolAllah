import { createServer } from "node:http";
import path from "node:path";
import { createApiApp } from "./create-app.js";
import { log } from "./logging.js";
import { compressedDataJson } from "./static-json.js";
import { serveStatic, setupVite } from "./vite.js";

(async () => {
  const app = createApiApp();
  const server = createServer(app);

  if (app.get("env") === "development") {
    // The 10.7 MB library catalog crosses the wire gzipped (~0.9 MB) even in
    // dev, so page-weight work is measured against what users actually fetch.
    app.use(compressedDataJson(
      path.resolve(import.meta.dirname, "..", "client", "public"),
      "no-cache",
    ));
    await setupVite(app, server);
  } else {
    app.use(compressedDataJson(
      path.resolve(import.meta.dirname, "public"),
    ));
    serveStatic(app);
  }

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();
