import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import type { Command } from "../../types.js";

type Choice = "rock" | "paper" | "scissors";

const EMOJI: Record<Choice, string> = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
};

const BEATS: Record<Choice, Choice> = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

const CHOICES: Choice[] = ["rock", "paper", "scissors"];

export const rps: Command = {
  data: new SlashCommandBuilder()
    .setName("rps")
    .setDescription("Play Rock, Paper, Scissors against the bot!")
    .addStringOption((o) =>
      o
        .setName("choice")
        .setDescription("Your choice")
        .setRequired(true)
        .addChoices(
          { name: "🪨 Rock", value: "rock" },
          { name: "📄 Paper", value: "paper" },
          { name: "✂️ Scissors", value: "scissors" }
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const playerChoice = interaction.options.getString("choice", true) as Choice;
    const botChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)]!;

    const playerEmoji = EMOJI[playerChoice];
    const botEmoji = EMOJI[botChoice];

    let result: string;
    if (playerChoice === botChoice) {
      result = "🤝 It's a **tie**!";
    } else if (BEATS[playerChoice] === botChoice) {
      result = "🎉 You **win**!";
    } else {
      result = "😈 I **win**!";
    }

    await interaction.reply({
      content: `You chose ${playerEmoji} **${playerChoice}** — I chose ${botEmoji} **${botChoice}**\n\n${result}`,
    });
  },
};
