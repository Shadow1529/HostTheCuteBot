import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import type { Command } from "../../types.js";

export const roll: Command = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Roll dice! (e.g. 2d6, 1d20, 3d8)")
    .addStringOption((o) =>
      o
        .setName("dice")
        .setDescription("Dice notation like 2d6 or 1d20 (default: 1d6)")
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const input = interaction.options.getString("dice") ?? "1d6";
    const match = input.toLowerCase().match(/^(\d+)d(\d+)$/);

    if (!match) {
      await interaction.reply({ content: "Invalid dice format! Use notation like `2d6` or `1d20`.", ephemeral: true });
      return;
    }

    const count = Math.min(parseInt(match[1]!, 10), 25);
    const sides = Math.min(parseInt(match[2]!, 10), 1000);

    if (count < 1 || sides < 2) {
      await interaction.reply({ content: "Invalid dice — need at least 1 die and 2 sides.", ephemeral: true });
      return;
    }

    const rolls: number[] = [];
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
    }

    const total = rolls.reduce((a, b) => a + b, 0);
    const rollsStr = count > 1 ? ` (${rolls.join(", ")})` : "";

    await interaction.reply({
      content: `🎲 Rolling **${count}d${sides}**...\n**Result: ${total}**${rollsStr}`,
    });
  },
};
