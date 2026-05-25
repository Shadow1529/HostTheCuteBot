import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const modActions = pgTable("mod_actions", {
  id: text("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  userId: text("user_id").notNull(),
  userTag: text("user_tag").notNull(),
  moderatorId: text("moderator_id").notNull(),
  moderatorTag: text("moderator_tag").notNull(),
  action: text("action").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ModAction = typeof modActions.$inferSelect;
