import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import type { Command } from "../../types.js";
import { store } from "../../store.js";

export const guess: Command = {
  data: new SlashCommandBuilder()
    .setName("guess")
    .setDescription("Play a number guessing game!")
    .addSubcommand((sub) =>
      sub
        .setName("start")
        .setDescription("Start a new guessing game (1–100, 7 attempts)")
    )
    .addSubcommand((sub) =>
      sub
        .setName("number")
        .setDescription("Guess a number")
        .addIntegerOption((o) =>
          o
            .setName("value")
            .setDescription("Your guess (1–100)")
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("quit").setDescription("Quit the current game")
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();
    const channelId = interaction.channelId;
    const userId = interaction.user.id;

    if (sub === "start") {
      const existing = store.getGuessGame(channelId);
      if (existing) {
        await interaction.reply({
          content: `A game is already running in this channel! Use \`/guess quit\` to end it first, or \`/guess number\` to keep playing.`,
          ephemeral: true,
        });
        return;
      }

      const number = Math.floor(Math.random() * 100) + 1;
      store.setGuessGame(channelId, { number, attempts: 0, maxAttempts: 7, userId });

      await interaction.reply({
        content: `🎯 I've picked a number between **1 and 100**! You have **7 attempts** to guess it.\nUse \`/guess number <value>\` to make a guess!`,
      });
      return;
    }

    if (sub === "number") {
      const game = store.getGuessGame(channelId);
      if (!game) {
        await interaction.reply({
          content: "No game running! Start one with `/guess start`.",
          ephemeral: true,
        });
        return;
      }

      const value = interaction.options.getInteger("value", true);
      game.attempts++;

      const remaining = game.maxAttempts - game.attempts;

      if (value === game.number) {
        store.deleteGuessGame(channelId);
        await interaction.reply({
          content: `🎉 **${interaction.user.username}** guessed it! The number was **${game.number}** — got it in **${game.attempts}** attempt${game.attempts !== 1 ? "s" : ""}!`,
        });
        return;
      }

      if (game.attempts >= game.maxAttempts) {
        store.deleteGuessGame(channelId);
        await interaction.reply({
          content: `💀 Game over! The number was **${game.number}**. Better luck next time!`,
        });
        return;
      }

      const hint = value < game.number ? "📈 Too low!" : "📉 Too high!";
      await interaction.reply({
        content: `${hint} **${remaining}** attempt${remaining !== 1 ? "s" : ""} remaining.`,
      });
      return;
    }

    if (sub === "quit") {
      const game = store.getGuessGame(channelId);
      if (!game) {
        await interaction.reply({ content: "No game is currently running.", ephemeral: true });
        return;
      }
      store.deleteGuessGame(channelId);
      await interaction.reply({ content: `❌ Game ended. The number was **${game.number}**.` });
    }
  },
};
