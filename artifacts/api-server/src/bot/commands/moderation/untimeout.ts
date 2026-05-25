import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../../types.js";
import { sendModLog } from "../../modlog.js";
import { logModAction } from "../../modactions.js";

export const untimeout: Command = {
  data: new SlashCommandBuilder()
    .setName("untimeout")
    .setDescription("Remove a timeout from a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) =>
      o.setName("user").setDescription("User to remove timeout from").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser("user", true);
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
      if (!member.isCommunicationDisabled()) {
        await interaction.editReply("That user is not currently timed out.");
        return;
      }

      await member.timeout(null, `Timeout removed by ${interaction.user.tag}`);

      await interaction.editReply(`✅ Timeout removed from **${target.tag}**.`);

      const embed = new EmbedBuilder()
        .setTitle("✅ Timeout Removed")
        .setColor(0x22c55e)
        .addFields(
          { name: "User", value: `${target.tag} (${target.id})`, inline: true },
          { name: "Moderator", value: interaction.user.tag, inline: true }
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
        action: "Timeout Removed",
        reason: "Timeout removed by moderator",
      });
    } catch {
      await interaction.editReply("Failed to remove timeout.");
    }
  },
};
