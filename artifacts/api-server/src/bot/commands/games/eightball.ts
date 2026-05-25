import { SlashCommandBuilder, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import type { Command } from "../../types.js";

const RESPONSES = [
  { text: "It is certain.", positive: true },
  { text: "It is decidedly so.", positive: true },
  { text: "Without a doubt.", positive: true },
  { text: "Yes, definitely.", positive: true },
  { text: "You may rely on it.", positive: true },
  { text: "As I see it, yes.", positive: true },
  { text: "Most likely.", positive: true },
  { text: "Outlook good.", positive: true },
  { text: "Yes.", positive: true },
  { text: "Signs point to yes.", positive: true },
  { text: "Reply hazy, try again.", positive: null },
  { text: "Ask again later.", positive: null },
  { text: "Better not tell you now.", positive: null },
  { text: "Cannot predict now.", positive: null },
  { text: "Concentrate and ask again.", positive: null },
  { text: "Don't count on it.", positive: false },
  { text: "My reply is no.", positive: false },
  { text: "My sources say no.", positive: false },
  { text: "Outlook not so good.", positive: false },
  { text: "Very doubtful.", positive: false },
];

export const eightball: Command = {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Ask the magic 8-ball a question")
    .addStringOption((o) =>
      o.setName("question").setDescription("Your question").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const question = interaction.options.getString("question", true);
    const response = RESPONSES[Math.floor(Math.random() * RESPONSES.length)]!;

    const color =
      response.positive === true ? 0x22c55e :
      response.positive === false ? 0xef4444 :
      0xf59e0b;

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle("🎱 Magic 8-Ball")
      .addFields(
        { name: "Question", value: question },
        { name: "Answer", value: `*${response.text}*` }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
