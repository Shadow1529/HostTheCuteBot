import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../../types.js";
import { setConfig } from "../../config.js";

export const setinvitelog: Command = {
  data: new SlashCommandBuilder()
    .setName("setinvitelog")
    .setDescription("Set the channel where invite creations are logged")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((o) =>
      o
        .setName("channel")
        .setDescription("Channel to send invite logs to")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
      return;
    }

    const channel = interaction.options.getChannel("channel", true);
    await setConfig(guild.id, "invite_log", channel.id);

    await interaction.reply({
      content: `✅ Invite logs will now be sent to <#${channel.id}>.`,
    });
  },
};
