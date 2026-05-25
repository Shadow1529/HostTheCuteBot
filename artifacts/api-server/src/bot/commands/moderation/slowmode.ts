import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
  type ChatInputCommandInteraction,
  type TextChannel,
} from "discord.js";
import type { Command } from "../../types.js";

export const slowmode: Command = {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Set or remove slowmode in a channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption((o) =>
      o
        .setName("seconds")
        .setDescription("Slowmode delay in seconds (0 to disable, max 21600)")
        .setMinValue(0)
        .setMaxValue(21600)
        .setRequired(true)
    )
    .addChannelOption((o) =>
      o
        .setName("channel")
        .setDescription("Channel to set slowmode in (defaults to current)")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const seconds = interaction.options.getInteger("seconds", true);
    const channel = (interaction.options.getChannel("channel") ?? interaction.channel) as TextChannel;

    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.reply({ content: "Invalid channel.", flags: MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferReply();

    try {
      await channel.setRateLimitPerUser(seconds);
      if (seconds === 0) {
        await interaction.editReply(`✅ Slowmode disabled in **${channel.name}**.`);
      } else {
        await interaction.editReply(`✅ Slowmode set to **${seconds}s** in **${channel.name}**.`);
      }
    } catch {
      await interaction.editReply("Failed to set slowmode.");
    }
  },
};
