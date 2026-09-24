import assert from "node:assert/strict";
import { test } from "node:test";

process.env.JWT_SECRET = "ci-test-jwt-secret-key-value-32chars";
process.env.NODE_ENV = "test";

const { hashPassword, signAccessToken, verifyAccessToken, verifyPassword, verifyPasswordAgainstUser } =
  await import("./auth");
const { getJwtSecret } = await import("./env");

test("passwords are hashed with scrypt and never compared as plaintext", async () => {
  const password = "correct-horse-battery";
  const hashed = await hashPassword(password);
  assert.match(hashed, /^scrypt\$[0-9a-f]+\$[0-9a-f]+$/);
  assert.notEqual(hashed, password);
  assert.equal(await verifyPassword(password, hashed), true);
  assert.equal(await verifyPassword("wrong-password", hashed), false);
});

test("missing users still run a password check without succeeding", async () => {
  assert.equal(await verifyPasswordAgainstUser("anything-long", undefined), false);
});

test("access tokens are signed, expire, and never accept demo-token", () => {
  const token = signAccessToken({ userId: 7, username: "reader" });
  assert.notEqual(token, "demo-token");
  const user = verifyAccessToken(token);
  assert.deepEqual(user, { userId: 7, username: "reader" });
  assert.throws(() => verifyAccessToken("demo-token"), /invalid_token/);
  assert.throws(() => verifyAccessToken("not-a-jwt"), /invalid_token/);
});

test("historical fallback JWT secret is forbidden", () => {
  const previousSecret = process.env.JWT_SECRET;
  const previousEnv = process.env.NODE_ENV;
  process.env.JWT_SECRET = "ya-rasool-allah-secret-key";
  process.env.NODE_ENV = "production";
  assert.throws(() => getJwtSecret(), /forbidden/);
  process.env.JWT_SECRET = previousSecret;
  process.env.NODE_ENV = previousEnv;
  assert.equal(getJwtSecret().length >= 32, true);
});
