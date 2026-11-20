import type { CapacitorConfig } from "@capacitor/cli";

/**
 * YA RASOOL ALLAH ﷺ — Android shell.
 *
 * The native app bundles the exact production web build (dist/public) —
 * one codebase, one honesty contract across Web and Android. Live
 * provider-governed content is fetched from the canonical institution
 * origin (client/src/lib/api-origin.ts); nothing is fabricated offline.
 */
const config: CapacitorConfig = {
  appId: "org.yarasoolallah.app",
  appName: "يا رسول الله",
  webDir: "dist/public",
  android: {
    allowMixedContent: false,
    backgroundColor: "#020617",
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
