import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  Events,
  ActivityType,
  EmbedBuilder,
  Partials,
} from "discord.js";
import { logger } from "../lib/logger.js";
import { commands, commandMap } from "./commands/index.js";
import { sendMessageLog, sendInviteLog } from "./modlog.js";
import { getConfig } from "./config.js";

export async function startBot(): Promise<void> {
  const token = process.env["DISCORD_BOT_TOKEN"];
  if (!token) {
    logger.warn("DISCORD_BOT_TOKEN not set — Discord bot will not start");
    return;
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildInvites,
    ],
    partials: [Partials.Message, Partials.Channel],
  });

  // ── Ready ──────────────────────────────────────────────────────────────
  client.once(Events.ClientReady, async (readyClient) => {
    logger.info({ tag: readyClient.user.tag }, "Discord bot logged in");

    readyClient.user.setPresence({
      activities: [{ name: "/help | minigames & moderation", type: ActivityType.Playing }],
      status: "online",
    });

    const rest = new REST().setToken(token);
    const commandData = commands.map((c) => c.data.toJSON());

    try {
      await rest.put(Routes.applicationCommands(readyClient.user.id), {
        body: commandData,
      });
      logger.info({ count: commandData.length }, "Slash commands registered globally");
    } catch (err) {
      logger.error({ err }, "Failed to register slash commands");
    }
  });

  // ── Slash commands ─────────────────────────────────────────────────────
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commandMap.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      logger.error({ err, command: interaction.commandName }, "Command error");
      const payload = { content: "An error occurred while running this command.", ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload).catch(() => null);
      } else {
        await interaction.reply(payload).catch(() => null);
      }
    }
  });

  // ── Message deleted ────────────────────────────────────────────────────
  client.on(Events.MessageDelete, async (message) => {
    if (!message.guild || message.author?.bot) return;

    const embed = new EmbedBuilder()
      .setTitle("🗑️ Message Deleted")
      .setColor(0xef4444)
      .addFields(
        { name: "Author", value: message.author ? `${message.author.tag} (<@${message.author.id}>)` : "Unknown", inline: true },
        { name: "Channel", value: `<#${message.channelId}>`, inline: true },
        { name: "Content", value: message.content || "*[No text content]*" }
      )
      .setTimestamp();

    await sendMessageLog(client, message.guild.id, embed);
  });

  // ── Message edited ─────────────────────────────────────────────────────
  client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
    if (!newMessage.guild || newMessage.author?.bot) return;
    if (!oldMessage.content || oldMessage.content === newMessage.content) return;

    const embed = new EmbedBuilder()
      .setTitle("✏️ Message Edited")
      .setColor(0xf59e0b)
      .addFields(
        { name: "Author", value: newMessage.author ? `${newMessage.author.tag} (<@${newMessage.author.id}>)` : "Unknown", inline: true },
        { name: "Channel", value: `<#${newMessage.channelId}>`, inline: true },
        { name: "Before", value: oldMessage.content.slice(0, 1024) || "*empty*" },
        { name: "After", value: newMessage.content?.slice(0, 1024) || "*empty*" }
      )
      .setURL(newMessage.url)
      .setTimestamp();

    await sendMessageLog(client, newMessage.guild.id, embed);
  });

  // ── Invite created ─────────────────────────────────────────────────────
  client.on(Events.InviteCreate, async (invite) => {
    if (!invite.guild) return;

    const embed = new EmbedBuilder()
      .setTitle("🔗 Invite Created")
      .setColor(0x6366f1)
      .addFields(
        { name: "Created By", value: invite.inviter ? `${invite.inviter.tag} (<@${invite.inviter.id}>)` : "Unknown", inline: true },
        { name: "Channel", value: invite.channel ? `<#${invite.channel.id}>` : "Unknown", inline: true },
        { name: "Code", value: `\`${invite.code}\``, inline: true },
        { name: "Max Uses", value: invite.maxUses ? String(invite.maxUses) : "∞", inline: true },
        { name: "Expires", value: invite.expiresAt ? `<t:${Math.floor(invite.expiresAt.getTime() / 1000)}:R>` : "Never", inline: true }
      )
      .setTimestamp();

    await sendInviteLog(client, invite.guild.id, embed);
  });

  // ── Member joined ──────────────────────────────────────────────────────
  client.on(Events.GuildMemberAdd, async (member) => {
    const guildId = member.guild.id;

    // Auto role
    const autoRoleId = await getConfig(guildId, "auto_role");
    if (autoRoleId) {
      try {
        const role =
          member.guild.roles.cache.get(autoRoleId) ??
          (await member.guild.roles.fetch(autoRoleId).catch(() => null));
        if (role) {
          await member.roles.add(role, "Auto role on join");
        } else {
          logger.warn({ guildId, autoRoleId }, "Auto role not found — was it deleted?");
        }
      } catch (err) {
        logger.warn({ err, guildId, autoRoleId }, "Failed to assign auto role");
      }
    }

    // Welcome message
    const channelId = await getConfig(guildId, "welcome_channel");
    if (!channelId) return;

    try {
      const channel = await client.channels.fetch(channelId).catch(() => null);
      if (!channel || !channel.isTextBased() || channel.isDMBased()) return;

      const memberCount = member.guild.memberCount;
      await channel.send(
        `👋 Welcome <@${member.id}>! We are now at **${memberCount}** member${memberCount !== 1 ? "s" : ""}.`
      );
    } catch (err) {
      logger.warn({ err, guildId }, "Failed to send welcome message");
    }
  });

  // ── Error ──────────────────────────────────────────────────────────────
  client.on(Events.Error, (err) => {
    logger.error({ err }, "Discord client error");
  });

  await client.login(token);
}
