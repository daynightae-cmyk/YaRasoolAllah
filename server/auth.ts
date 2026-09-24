import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { NextFunction, Request, Response } from "express";
import { getJwtSecret } from "./env";

const scrypt = promisify(scryptCallback);
const SCRYPT_KEYLEN = 32;
const TOKEN_TTL_SECONDS = 60 * 60 * 12;
const DUMMY_PASSWORD_HASH =
  "scrypt$00000000000000000000000000000000$0000000000000000000000000000000000000000000000000000000000000000";

export type AuthUser = {
  userId: number;
  username: string;
};

export type AuthedRequest = Request & {
  user: AuthUser;
  requestId?: string;
};

function base64UrlJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, SCRYPT_KEYLEN)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [scheme, salt, hex] = storedHash.split("$");
  if (scheme !== "scrypt" || !salt || !hex) {
    return false;
  }

  const derived = (await scrypt(password, salt, SCRYPT_KEYLEN)) as Buffer;
  const expected = Buffer.from(hex, "hex");
  if (derived.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(derived, expected);
}

export async function verifyPasswordAgainstUser(
  password: string,
  storedHash: string | undefined,
): Promise<boolean> {
  const hash = storedHash && storedHash.startsWith("scrypt$") ? storedHash : DUMMY_PASSWORD_HASH;
  const matches = await verifyPassword(password, hash);
  return Boolean(storedHash) && matches;
}

export function signAccessToken(user: AuthUser, ttlSeconds = TOKEN_TTL_SECONDS): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: String(user.userId),
    username: user.username,
    iat: now,
    exp: now + ttlSeconds,
  };
  const encodedHeader = base64UrlJson(header);
  const encodedPayload = base64UrlJson(payload);
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", getJwtSecret()).update(signingInput).digest("base64url");
  return `${signingInput}.${signature}`;
}

export function verifyAccessToken(token: string): AuthUser {
  if (!token || token === "demo-token") {
    throw new Error("invalid_token");
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("invalid_token");
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expected = createHmac("sha256", getJwtSecret()).update(signingInput).digest("base64url");
  const provided = Buffer.from(signature);
  const computed = Buffer.from(expected);
  if (provided.length !== computed.length || !timingSafeEqual(provided, computed)) {
    throw new Error("invalid_token");
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as {
    sub?: string;
    username?: string;
    exp?: number;
    alg?: string;
  };

  if (!payload.sub || !payload.username || typeof payload.exp !== "number") {
    throw new Error("invalid_token");
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("expired_token");
  }

  const userId = Number(payload.sub);
  if (!Number.isInteger(userId) || userId < 1) {
    throw new Error("invalid_token");
  }

  return { userId, username: payload.username };
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";

  if (!token) {
    res.status(401).json({ message: "Access token required", requestId: req.requestId });
    return;
  }

  try {
    (req as AuthedRequest).user = verifyAccessToken(token);
    next();
  } catch (error) {
    const code = error instanceof Error && error.message === "expired_token" ? "expired_token" : "invalid_token";
    res.status(403).json({ message: "Invalid token", code, requestId: req.requestId });
  }
}

declare module "http" {
  interface IncomingMessage {
    requestId?: string;
    user?: AuthUser;
  }
}
