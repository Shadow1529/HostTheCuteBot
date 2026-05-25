import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import type { Command } from "../../types.js";

export const coinflip: Command = {
  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Flip a coin!")
    .addStringOption((o) =>
      o
        .setName("guess")
        .setDescription("Make a guess!")
        .addChoices(
          { name: "Heads", value: "heads" },
          { name: "Tails", value: "tails" }
        )
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const guess = interaction.options.getString("guess");
    const result = Math.random() < 0.5 ? "heads" : "tails";
    const emoji = result === "heads" ? "🪙" : "🌑";

    if (!guess) {
      await interaction.reply({ content: `${emoji} The coin landed on **${result.toUpperCase()}**!` });
      return;
    }

    const won = guess === result;
    await interaction.reply({
      content: `${emoji} The coin landed on **${result.toUpperCase()}**! ${won ? "🎉 You guessed right!" : "❌ Wrong guess!"}`,
    });
  },
};
