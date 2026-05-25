import { db, modActions } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { logger } from "../lib/logger.js";

export interface LogModActionOptions {
  guildId: string;
  userId: string;
  userTag: string;
  moderatorId: string;
  moderatorTag: string;
  action: string;
  reason: string;
}

export async function logModAction(opts: LogModActionOptions): Promise<void> {
  try {
    await db.insert(modActions).values({ id: randomUUID(), ...opts });
  } catch (err) {
    logger.error({ err }, "Failed to log mod action");
  }
}

export async function getModHistory(guildId: string, userId: string) {
  try {
    return await db
      .select()
      .from(modActions)
      .where(and(eq(modActions.guildId, guildId), eq(modActions.userId, userId)))
      .orderBy(desc(modActions.createdAt))
      .limit(25);
  } catch (err) {
    logger.error({ err }, "Failed to fetch mod history");
    return [];
  }
}
