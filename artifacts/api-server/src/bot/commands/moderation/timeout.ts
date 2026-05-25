import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../../types.js";
import { sendModerationDM, sendModLog } from "../../modlog.js";
import { logModAction } from "../../modactions.js";

const DURATIONS: Record<string, number> = {
  "60s": 60,
  "5m": 300,
  "10m": 600,
  "30m": 1800,
  "1h": 3600,
  "6h": 21600,
  "12h": 43200,
  "1d": 86400,
  "1w": 604800,
};

export const timeout: Command = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout (mute) a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) =>
      o.setName("user").setDescription("User to timeout").setRequired(true)
    )
    .addStringOption((o) =>
      o
        .setName("duration")
        .setDescription("Duration of the timeout")
        .setRequired(true)
        .addChoices(
          { name: "60 seconds", value: "60s" },
          { name: "5 minutes", value: "5m" },
          { name: "10 minutes", value: "10m" },
          { name: "30 minutes", value: "30m" },
          { name: "1 hour", value: "1h" },
          { name: "6 hours", value: "6h" },
          { name: "12 hours", value: "12h" },
          { name: "1 day", value: "1d" },
          { name: "1 week", value: "1w" }
        )
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for the timeout").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser("user", true);
    const durationKey = interaction.options.getString("duration", true);
    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const seconds = DURATIONS[durationKey] ?? 300;

    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: "This command can only be used in a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferReply();

    try {
      const member = await guild.members.fetch(target.id).catch(() => null);
      if (!member) {
        await interaction.editReply("That user is not in this server.");
        return;
      }
      const botMember = await guild.members.fetchMe();
      if (member.roles.highest.position >= botMember.roles.highest.position) {
        await interaction.editReply("I cannot timeout this user — their role is equal or higher than mine.");
        return;
      }

      await sendModerationDM(target, guild.name, `Timeout (${durationKey})`, reason);
      await member.timeout(seconds * 1000, `${reason} | Timed out by ${interaction.user.tag}`);

      await interaction.editReply(`✅ **${target.tag}** has been timed out for **${durationKey}**.\n**Reason:** ${reason}`);

      const embed = new EmbedBuilder()
        .setTitle("⏱️ Member Timed Out")
        .setColor(0xf59e0b)
        .addFields(
          { name: "User", value: `${target.tag} (${target.id})`, inline: true },
          { name: "Moderator", value: interaction.user.tag, inline: true },
          { name: "Duration", value: durationKey, inline: true },
          { name: "Reason", value: reason }
        )
        .setThumbnail(target.displayAvatarURL())
        .setTimestamp();

      await sendModLog(interaction.client, guild.id, embed);
      await logModAction({
        guildId: guild.id,
        userId: target.id,
        userTag: target.tag,
        moderatorId: interaction.user.id,
        moderatorTag: interaction.user.tag,
        action: "Timeout",
        reason: `${reason} (${durationKey})`,
      });
    } catch {
      await interaction.editReply("Failed to timeout that user.");
    }
  },
};
