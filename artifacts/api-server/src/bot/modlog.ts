import {
  Client,
  EmbedBuilder,
  User,
  ChannelType,
  type TextChannel,
} from "discord.js";
import { getConfig } from "./config.js";
import { logger } from "../lib/logger.js";

async function getLogChannel(
  client: Client,
  guildId: string,
  configKey: string
): Promise<TextChannel | null> {
  const channelId = await getConfig(guildId, configKey);
  if (!channelId) {
    logger.debug({ guildId, configKey }, "No log channel configured");
    return null;
  }

  try {
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) {
      logger.warn({ guildId, configKey, channelId }, "Log channel not found — was it deleted?");
      return null;
    }
    if (channel.type !== ChannelType.GuildText) {
      logger.warn({ guildId, configKey, channelId }, "Log channel is not a text channel");
      return null;
    }
    return channel as TextChannel;
  } catch (err) {
    logger.warn({ err, guildId, configKey }, "Log channel fetch failed");
    return null;
  }
}

export async function sendModLog(
  client: Client,
  guildId: string,
  embed: EmbedBuilder
): Promise<void> {
  const ch = await getLogChannel(client, guildId, "mod_log");
  if (!ch) return;
  try {
    await ch.send({ embeds: [embed] });
  } catch (err) {
    logger.warn({ err, guildId }, "Failed to send mod log message");
  }
}

export async function sendMessageLog(
  client: Client,
  guildId: string,
  embed: EmbedBuilder
): Promise<void> {
  const ch = await getLogChannel(client, guildId, "message_log");
  if (!ch) return;
  try {
    await ch.send({ embeds: [embed] });
  } catch (err) {
    logger.warn({ err, guildId }, "Failed to send message log");
  }
}

export async function sendInviteLog(
  client: Client,
  guildId: string,
  embed: EmbedBuilder
): Promise<void> {
  const ch = await getLogChannel(client, guildId, "invite_log");
  if (!ch) return;
  try {
    await ch.send({ embeds: [embed] });
  } catch (err) {
    logger.warn({ err, guildId }, "Failed to send invite log");
  }
}

export async function sendModerationDM(
  user: User,
  guildName: string,
  action: string,
  reason: string
): Promise<void> {
  try {
    const embed = new EmbedBuilder()
      .setTitle("⚠️ Moderation Action")
      .setColor(0xef4444)
      .addFields(
        { name: "Server", value: guildName, inline: true },
        { name: "Action", value: action, inline: true },
        { name: "Reason", value: reason }
      )
      .setFooter({ text: "Remember that I am just a bot and this is an automatic message!" })
      .setTimestamp();

    await user.send({ embeds: [embed] });
  } catch {
    // DMs may be closed — silently ignore
  }
}
