import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../../types.js";
import { setConfig } from "../../config.js";

export const welcomeset: Command = {
  data: new SlashCommandBuilder()
    .setName("welcomeset")
    .setDescription("Set this channel as the welcome channel for new members")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
      return;
    }

    await setConfig(guild.id, "welcome_channel", interaction.channelId);

    await interaction.reply({
      content: `✅ This channel will now receive welcome messages when new members join!`,
    });
  },
};
