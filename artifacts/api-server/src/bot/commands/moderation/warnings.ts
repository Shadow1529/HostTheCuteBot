import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../../types.js";
import { store } from "../../store.js";

export const warnings: Command = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("View warnings for a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) =>
      o.setName("user").setDescription("User to check warnings for").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser("user", true);

    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
      return;
    }

    const userWarnings = store.getWarnings(guild.id, target.id);

    if (userWarnings.length === 0) {
      await interaction.reply({ content: `✅ **${target.tag}** has no warnings.` });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`⚠️ Warnings for ${target.tag}`)
      .setColor(0xf59e0b)
      .setThumbnail(target.displayAvatarURL())
      .setDescription(`Total warnings: **${userWarnings.length}**`)
      .addFields(
        userWarnings.slice(-10).map((w, i) => ({
          name: `Warning #${i + 1} — ${w.timestamp.toLocaleDateString()}`,
          value: `**Reason:** ${w.reason}\n**Moderator:** <@${w.moderatorId}>`,
        }))
      )
      .setFooter({ text: userWarnings.length > 10 ? `Showing last 10 of ${userWarnings.length}` : "" });

    await interaction.reply({ embeds: [embed] });
  },
};
