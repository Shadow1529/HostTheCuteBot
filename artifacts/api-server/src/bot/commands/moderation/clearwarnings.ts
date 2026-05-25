import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../../types.js";
import { store } from "../../store.js";

export const clearwarnings: Command = {
  data: new SlashCommandBuilder()
    .setName("clearwarnings")
    .setDescription("Clear all warnings for a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) =>
      o.setName("user").setDescription("User to clear warnings for").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser("user", true);

    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
      return;
    }

    const count = store.clearWarnings(guild.id, target.id);

    if (count === 0) {
      await interaction.reply({ content: `**${target.tag}** had no warnings to clear.`, ephemeral: true });
      return;
    }

    await interaction.reply({
      content: `✅ Cleared **${count}** warning${count !== 1 ? "s" : ""} from **${target.tag}**.`,
    });
  },
};
