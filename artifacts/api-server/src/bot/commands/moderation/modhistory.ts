import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../../types.js";
import { getModHistory } from "../../modactions.js";

const ACTION_EMOJI: Record<string, string> = {
  Ban: "🔨",
  Kick: "👢",
  Warning: "⚠️",
  Timeout: "⏱️",
  "Timeout Removed": "✅",
};

export const modhistory: Command = {
  data: new SlashCommandBuilder()
    .setName("modhistory")
    .setDescription("View all moderation actions taken against a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) =>
      o.setName("user").setDescription("User to look up").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser("user", true);
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
      return;
    }

    await interaction.deferReply();

    const history = await getModHistory(guild.id, target.id);

    if (history.length === 0) {
      await interaction.editReply({ content: `✅ No moderation history found for **${target.tag}**.` });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`📋 Mod History — ${target.tag}`)
      .setColor(0x6366f1)
      .setThumbnail(target.displayAvatarURL())
      .setDescription(`**${history.length}** action${history.length !== 1 ? "s" : ""} on record`)
      .setFooter({ text: "Showing up to 25 most recent actions" });

    const fields = history.slice(0, 10).map((entry, i) => {
      const emoji = ACTION_EMOJI[entry.action] ?? "🔹";
      const ts = Math.floor(entry.createdAt.getTime() / 1000);
      return {
        name: `${emoji} #${i + 1} — ${entry.action}`,
        value: `**Reason:** ${entry.reason}\n**Moderator:** <@${entry.moderatorId}>\n**Date:** <t:${ts}:d>`,
      };
    });

    embed.addFields(fields);

    await interaction.editReply({ embeds: [embed] });
  },
};
