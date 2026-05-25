import { pgTable, text, primaryKey } from "drizzle-orm/pg-core";

export const guildSettings = pgTable(
  "guild_settings",
  {
    guildId: text("guild_id").notNull(),
    key: text("key").notNull(),
    value: text("value").notNull(),
  },
  (t) => [primaryKey({ columns: [t.guildId, t.key] })]
);

export type GuildSetting = typeof guildSettings.$inferSelect;
