import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../../types.js";
import { setConfig } from "../../config.js";

export const setmessagelog: Command = {
  data: new SlashCommandBuilder()
    .setName("setmessagelog")
    .setDescription("Set the channel where deleted/edited messages are logged")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((o) =>
      o
        .setName("channel")
        .setDescription("Channel to send message logs to")
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
    await setConfig(guild.id, "message_log", channel.id);

    await interaction.reply({
      content: `✅ Message logs will now be sent to <#${channel.id}>.`,
    });
  },
};
