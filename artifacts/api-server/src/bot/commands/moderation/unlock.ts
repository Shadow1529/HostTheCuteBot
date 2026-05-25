import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
  type ChatInputCommandInteraction,
  type TextChannel,
} from "discord.js";
import type { Command } from "../../types.js";

export const unlock: Command = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlock a channel so members can send messages again")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((o) =>
      o
        .setName("channel")
        .setDescription("Channel to unlock (defaults to current channel)")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: "This command can only be used in a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    const channel = (interaction.options.getChannel("channel") ?? interaction.channel) as TextChannel;

    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.reply({ content: "Invalid channel.", flags: MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferReply();

    try {
      await channel.permissionOverwrites.edit(guild.id, { SendMessages: null });
      await interaction.editReply(`🔓 **${channel.name}** has been unlocked.`);
    } catch {
      await interaction.editReply("Failed to unlock the channel.");
    }
  },
};
