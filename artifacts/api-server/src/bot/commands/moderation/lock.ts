import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
  type ChatInputCommandInteraction,
  type TextChannel,
} from "discord.js";
import type { Command } from "../../types.js";

export const lock: Command = {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock a channel so members cannot send messages")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((o) =>
      o
        .setName("channel")
        .setDescription("Channel to lock (defaults to current channel)")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for locking").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: "This command can only be used in a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    const channel = (interaction.options.getChannel("channel") ?? interaction.channel) as TextChannel;
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.reply({ content: "Invalid channel.", flags: MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferReply();

    try {
      await channel.permissionOverwrites.edit(guild.id, { SendMessages: false });
      await interaction.editReply(`🔒 **${channel.name}** has been locked.\n**Reason:** ${reason}`);
    } catch {
      await interaction.editReply("Failed to lock the channel.");
    }
  },
};
