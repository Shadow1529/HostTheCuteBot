import { db, guildSettings } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logger } from "../lib/logger.js";

const cache = new Map<string, string>();

function cacheKey(guildId: string, key: string) {
  return `${guildId}:${key}`;
}

export async function getConfig(guildId: string, key: string): Promise<string | null> {
  const ck = cacheKey(guildId, key);
  if (cache.has(ck)) return cache.get(ck)!;

  try {
    const rows = await db
      .select()
      .from(guildSettings)
      .where(and(eq(guildSettings.guildId, guildId), eq(guildSettings.key, key)))
      .limit(1);

    const value = rows[0]?.value ?? null;
    if (value !== null) cache.set(ck, value);
    return value;
  } catch (err) {
    logger.error({ err, guildId, key }, "Failed to get guild config");
    return null;
  }
}

export async function setConfig(guildId: string, key: string, value: string): Promise<void> {
  cache.set(cacheKey(guildId, key), value);

  try {
    await db
      .insert(guildSettings)
      .values({ guildId, key, value })
      .onConflictDoUpdate({
        target: [guildSettings.guildId, guildSettings.key],
        set: { value },
      });
  } catch (err) {
    logger.error({ err, guildId, key }, "Failed to set guild config");
  }
}
