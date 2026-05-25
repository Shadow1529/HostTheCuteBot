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

export const ban: Command = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((o) =>
      o.setName("user").setDescription("User to ban").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for the ban").setRequired(false)
    )
    .addIntegerOption((o) =>
      o
        .setName("delete_days")
        .setDescription("Days of messages to delete (0–7)")
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const deleteDays = interaction.options.getInteger("delete_days") ?? 0;

    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: "This command can only be used in a server.", flags: MessageFlags.Ephemeral });
      return;
    }
    if (target.id === interaction.user.id) {
      await interaction.reply({ content: "You cannot ban yourself.", flags: MessageFlags.Ephemeral });
      return;
    }
    if (target.id === interaction.client.user?.id) {
      await interaction.reply({ content: "I cannot ban myself.", flags: MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferReply();

    try {
      const member = await guild.members.fetch(target.id).catch(() => null);
      if (member) {
        const botMember = await guild.members.fetchMe();
        if (!botMember.permissions.has(PermissionFlagsBits.BanMembers)) {
          await interaction.editReply("I don't have permission to ban members.");
          return;
        }
        if (member.roles.highest.position >= botMember.roles.highest.position) {
          await interaction.editReply("I cannot ban this user — their role is equal or higher than mine.");
          return;
        }
      }

      await sendModerationDM(target, guild.name, "Ban", reason);

      await guild.members.ban(target.id, {
        reason: `${reason} | Banned by ${interaction.user.tag}`,
        deleteMessageSeconds: deleteDays * 86400,
      });

      await interaction.editReply(`✅ **${target.tag}** has been banned.\n**Reason:** ${reason}`);

      const embed = new EmbedBuilder()
        .setTitle("🔨 Member Banned")
        .setColor(0xef4444)
        .addFields(
          { name: "User", value: `${target.tag} (${target.id})`, inline: true },
          { name: "Moderator", value: interaction.user.tag, inline: true },
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
        action: "Ban",
        reason,
      });
    } catch {
      await interaction.editReply("Failed to ban that user.");
    }
  },
};
