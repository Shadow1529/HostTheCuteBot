import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  type ChatInputCommandInteraction,
  type TextChannel,
} from "discord.js";
import type { Command } from "../../types.js";

export const purge: Command = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete multiple messages at once")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((o) =>
      o
        .setName("amount")
        .setDescription("Number of messages to delete (1–100)")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .addUserOption((o) =>
      o.setName("user").setDescription("Only delete messages from this user").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const amount = interaction.options.getInteger("amount", true);
    const filterUser = interaction.options.getUser("user");

    if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
      await interaction.reply({ content: "This command can only be used in a text channel.", ephemeral: true });
      return;
    }

    const channel = interaction.channel as TextChannel;

    await interaction.deferReply({ ephemeral: true });

    try {
      let messages = await channel.messages.fetch({ limit: 100 });

      if (filterUser) {
        messages = messages.filter((m) => m.author.id === filterUser.id);
      }

      const toDelete = [...messages.values()].slice(0, amount);

      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const deletable = toDelete.filter((m) => m.createdTimestamp > twoWeeksAgo);

      if (deletable.length === 0) {
        await interaction.editReply("No messages to delete (messages older than 14 days cannot be bulk deleted).");
        return;
      }

      const deleted = await channel.bulkDelete(deletable, true);

      await interaction.editReply(
        `✅ Deleted **${deleted.size}** message${deleted.size !== 1 ? "s" : ""}${filterUser ? ` from **${filterUser.tag}**` : ""}.`
      );
    } catch {
      await interaction.editReply("Failed to delete messages.");
    }
  },
};
