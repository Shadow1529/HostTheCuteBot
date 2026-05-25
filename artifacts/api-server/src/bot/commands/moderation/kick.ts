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

export const kick: Command = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((o) =>
      o.setName("user").setDescription("User to kick").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for the kick").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: "This command can only be used in a server.", flags: MessageFlags.Ephemeral });
      return;
    }
    if (target.id === interaction.user.id) {
      await interaction.reply({ content: "You cannot kick yourself.", flags: MessageFlags.Ephemeral });
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
        await interaction.editReply("I cannot kick this user — their role is equal or higher than mine.");
        return;
      }

      await sendModerationDM(target, guild.name, "Kick", reason);
      await member.kick(`${reason} | Kicked by ${interaction.user.tag}`);

      await interaction.editReply(`✅ **${target.tag}** has been kicked.\n**Reason:** ${reason}`);

      const embed = new EmbedBuilder()
        .setTitle("👢 Member Kicked")
        .setColor(0xf97316)
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
        action: "Kick",
        reason,
      });
    } catch {
      await interaction.editReply("Failed to kick that user.");
    }
  },
};
