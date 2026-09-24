import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@shared/schema";

let dbSingleton: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is required for postgres persistence.");
  }

  if (!dbSingleton) {
    dbSingleton = drizzle(neon(url), { schema });
  }

  return dbSingleton;
}
