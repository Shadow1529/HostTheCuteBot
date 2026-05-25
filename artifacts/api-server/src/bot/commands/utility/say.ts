import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  type ChatInputCommandInteraction,
  type TextChannel,
} from "discord.js";
import type { Command } from "../../types.js";

export const say: Command = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Make the bot send a message in this channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((o) =>
      o
        .setName("message")
        .setDescription("Message to send")
        .setRequired(true)
        .setMaxLength(2000)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const message = interaction.options.getString("message", true);

    if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
      await interaction.reply({ content: "Cannot send messages in this channel type.", ephemeral: true });
      return;
    }

    try {
      await (interaction.channel as TextChannel).send(message);
      await interaction.reply({ content: "✅ Message sent.", ephemeral: true });
    } catch {
      await interaction.reply({ content: "Failed to send the message.", ephemeral: true });
    }
  },
};
