import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
  type ChatInputCommandInteraction,
} from "discord.js";
import { randomUUID } from "crypto";
import type { Command } from "../../types.js";
import { store } from "../../store.js";
import { sendModerationDM, sendModLog } from "../../modlog.js";
import { logModAction } from "../../modactions.js";

export const warn: Command = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) =>
      o.setName("user").setDescription("User to warn").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for the warning").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: "This command can only be used in a server.", flags: MessageFlags.Ephemeral });
      return;
    }
    if (target.bot) {
      await interaction.reply({ content: "You cannot warn a bot.", flags: MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferReply();

    try {
      store.addWarning({
        id: randomUUID(),
        userId: target.id,
        guildId: guild.id,
        reason,
        moderatorId: interaction.user.id,
        timestamp: new Date(),
      });

      const totalWarnings = store.getWarnings(guild.id, target.id).length;

      await sendModerationDM(target, guild.name, "Warning", reason);

      await interaction.editReply(
        `⚠️ **${target.tag}** has been warned.\n**Reason:** ${reason}\n**Total warnings:** ${totalWarnings}`
      );

      const embed = new EmbedBuilder()
        .setTitle("⚠️ Member Warned")
        .setColor(0xf59e0b)
        .addFields(
          { name: "User", value: `${target.tag} (${target.id})`, inline: true },
          { name: "Moderator", value: interaction.user.tag, inline: true },
          { name: "Total Warnings", value: String(totalWarnings), inline: true },
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
        action: "Warning",
        reason,
      });
    } catch {
      await interaction.editReply("Failed to warn that user.");
    }
  },
};
