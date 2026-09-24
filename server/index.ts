import { createServer } from "node:http";
import { createApiApp } from "./create-app";
import { log } from "./logging";
import { serveStatic, setupVite } from "./vite";

(async () => {
  const app = createApiApp();
  const server = createServer(app);

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
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
