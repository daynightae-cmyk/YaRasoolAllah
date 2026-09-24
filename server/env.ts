import { randomBytes } from "node:crypto";

const FORBIDDEN_JWT_SECRETS = new Set([
  "ya-rasool-allah-secret-key",
  "secret",
  "changeme",
]);

let ephemeralDevJwtSecret: string | undefined;

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim() ?? "";

  if (secret && FORBIDDEN_JWT_SECRETS.has(secret)) {
    throw new Error("The historical fallback JWT secret is forbidden.");
  }

  if (secret.length >= 32) {
    return secret;
  }

  if (isProduction()) {
    throw new Error("JWT_SECRET is required in production and must be at least 32 characters.");
  }

  if (!ephemeralDevJwtSecret) {
    ephemeralDevJwtSecret = randomBytes(48).toString("hex");
    console.warn(
      "[auth] JWT_SECRET is missing; using an ephemeral development secret. Tokens will not survive restart.",
    );
  }

  return ephemeralDevJwtSecret;
}

export type PersistenceMode = "postgres" | "memory";

export function getPersistenceMode(): PersistenceMode {
  if (process.env.DATABASE_URL?.trim()) {
    return "postgres";
  }

  if (isProduction() && process.env.ALLOW_EPHEMERAL_PERSISTENCE !== "1") {
    throw new Error(
      "DATABASE_URL is required in production. Set ALLOW_EPHEMERAL_PERSISTENCE=1 only for an explicit ephemeral smoke, never as a silent production default.",
    );
  }

  return "memory";
}

export function assertRuntimeConfig(): void {
  getJwtSecret();
  getPersistenceMode();
}
