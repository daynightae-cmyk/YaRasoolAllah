import { createMainApiHandler } from "../server/vercel-main-api";

/**
 * The main app is imported lazily so a production configuration failure does
 * not crash the serverless module before the handler can answer with a
 * structured 503. The public content app (`api/public.ts`) deliberately does
 * not depend on database/JWT configuration and stays available.
 */
export default createMainApiHandler(async () => {
  const { createApiApp } = await import("../server/create-app");
  return createApiApp();
});
