import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType,
  ChannelType,
  MessageFlags,
  type ChatInputCommandInteraction,
  type CategoryChannel,
} from "discord.js";
import type { Command } from "../../types.js";

export const catdelete: Command = {
  data: new SlashCommandBuilder()
    .setName("catdelete")
    .setDescription("Delete a category and all its channels")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: "This command can only be used in a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    const categories = guild.channels.cache.filter(
      (c) => c.type === ChannelType.GuildCategory
    ) as Map<string, CategoryChannel>;

    if (categories.size === 0) {
      await interaction.reply({ content: "This server has no categories.", flags: MessageFlags.Ephemeral });
      return;
    }

    const options = [...categories.values()].slice(0, 25).map((cat) => {
      const channelCount = guild.channels.cache.filter(
        (c) => "parentId" in c && c.parentId === cat.id
      ).size;
      return new StringSelectMenuOptionBuilder()
        .setLabel(cat.name)
        .setValue(cat.id)
        .setDescription(`${channelCount} channel${channelCount !== 1 ? "s" : ""} inside`);
    });

    const menu = new StringSelectMenuBuilder()
      .setCustomId("catdelete_select")
      .setPlaceholder("Choose a category to delete…")
      .addOptions(options);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

    const reply = await interaction.reply({
      content: "⚠️ Select a category to **permanently delete** it and all its channels:",
      components: [row],
      flags: MessageFlags.Ephemeral,
    });

    try {
      const collected = await reply.awaitMessageComponent({
        componentType: ComponentType.StringSelect,
        filter: (i) => i.user.id === interaction.user.id,
        time: 30_000,
      });

      const categoryId = collected.values[0]!;
      const category = guild.channels.cache.get(categoryId) as CategoryChannel | undefined;

      if (!category) {
        await collected.update({ content: "❌ Category not found — it may have already been deleted.", components: [] });
        return;
      }

      const children = guild.channels.cache.filter(
        (c) => "parentId" in c && c.parentId === category.id
      );

      let deleted = 0;
      for (const ch of children.values()) {
        await ch.delete(`Category delete by ${interaction.user.tag}`).catch(() => null);
        deleted++;
      }

      await category.delete(`Category delete by ${interaction.user.tag}`).catch(() => null);

      await collected.update({
        content: `✅ Deleted category **${category.name}** and **${deleted}** channel${deleted !== 1 ? "s" : ""}.`,
        components: [],
      });
    } catch {
      await interaction.editReply({ content: "⏰ Timed out — no category was selected.", components: [] });
    }
  },
};
