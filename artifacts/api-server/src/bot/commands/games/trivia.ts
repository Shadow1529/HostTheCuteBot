import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../../types.js";

interface TriviaQuestion {
  question: string;
  correct: string;
  wrong: string[];
  category: string;
}

const QUESTIONS: TriviaQuestion[] = [
  { question: "What is the capital of France?", correct: "Paris", wrong: ["London", "Berlin", "Rome"], category: "Geography" },
  { question: "How many sides does a hexagon have?", correct: "6", wrong: ["5", "7", "8"], category: "Math" },
  { question: "What is the chemical symbol for gold?", correct: "Au", wrong: ["Ag", "Fe", "Cu"], category: "Science" },
  { question: "Who painted the Mona Lisa?", correct: "Leonardo da Vinci", wrong: ["Michelangelo", "Raphael", "Rembrandt"], category: "Art" },
  { question: "What planet is known as the Red Planet?", correct: "Mars", wrong: ["Venus", "Jupiter", "Saturn"], category: "Science" },
  { question: "How many bones are in the adult human body?", correct: "206", wrong: ["198", "215", "250"], category: "Science" },
  { question: "What year did World War II end?", correct: "1945", wrong: ["1943", "1947", "1944"], category: "History" },
  { question: "What is the largest ocean on Earth?", correct: "Pacific Ocean", wrong: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean"], category: "Geography" },
  { question: "What is the speed of light (km/s)?", correct: "299,792", wrong: ["150,000", "500,000", "199,792"], category: "Science" },
  { question: "Who wrote Romeo and Juliet?", correct: "William Shakespeare", wrong: ["Charles Dickens", "Jane Austen", "Mark Twain"], category: "Literature" },
  { question: "What is the smallest prime number?", correct: "2", wrong: ["1", "3", "5"], category: "Math" },
  { question: "What gas do plants absorb from the atmosphere?", correct: "Carbon dioxide", wrong: ["Oxygen", "Nitrogen", "Hydrogen"], category: "Science" },
  { question: "How many strings does a standard guitar have?", correct: "6", wrong: ["4", "5", "7"], category: "Music" },
  { question: "What is the currency of Japan?", correct: "Yen", wrong: ["Won", "Yuan", "Ringgit"], category: "Geography" },
  { question: "What is 12 × 12?", correct: "144", wrong: ["124", "132", "168"], category: "Math" },
  { question: "What is the tallest mountain in the world?", correct: "Mount Everest", wrong: ["K2", "Kangchenjunga", "Lhotse"], category: "Geography" },
  { question: "Which element has the atomic number 1?", correct: "Hydrogen", wrong: ["Helium", "Oxygen", "Carbon"], category: "Science" },
  { question: "In what country was the game of chess invented?", correct: "India", wrong: ["China", "Persia", "Egypt"], category: "History" },
  { question: "How many players are on a basketball team on the court?", correct: "5", wrong: ["6", "7", "4"], category: "Sports" },
  { question: "What is the largest continent by area?", correct: "Asia", wrong: ["Africa", "North America", "Europe"], category: "Geography" },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export const trivia: Command = {
  data: new SlashCommandBuilder()
    .setName("trivia")
    .setDescription("Answer a random trivia question!"),

  async execute(interaction: ChatInputCommandInteraction) {
    const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]!;
    const options = shuffle([q.correct, ...q.wrong]);

    const buttons = options.map((opt, i) =>
      new ButtonBuilder()
        .setCustomId(`trivia_${i}`)
        .setLabel(opt)
        .setStyle(ButtonStyle.Primary)
    );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

    const embed = new EmbedBuilder()
      .setTitle("🧠 Trivia Time!")
      .setColor(0x6366f1)
      .setDescription(q.question)
      .setFooter({ text: `Category: ${q.category} • 15 seconds to answer` });

    await interaction.reply({ embeds: [embed], components: [row] });

    const msg = await interaction.fetchReply();

    try {
      const collected = await msg.awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 15000,
      });

      const selectedIndex = parseInt(collected.customId.replace("trivia_", ""), 10);
      const selected = options[selectedIndex]!;
      const correct = selected === q.correct;

      const resultEmbed = new EmbedBuilder()
        .setTitle("🧠 Trivia Result")
        .setColor(correct ? 0x22c55e : 0xef4444)
        .setDescription(q.question)
        .addFields(
          { name: "Your Answer", value: selected, inline: true },
          { name: "Correct Answer", value: q.correct, inline: true },
          { name: "Result", value: correct ? "🎉 Correct!" : "❌ Wrong!", inline: true }
        );

      const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        options.map((opt, i) =>
          new ButtonBuilder()
            .setCustomId(`trivia_${i}`)
            .setLabel(opt)
            .setStyle(opt === q.correct ? ButtonStyle.Success : ButtonStyle.Danger)
            .setDisabled(true)
        )
      );

      await collected.update({ embeds: [resultEmbed], components: [disabledRow] });
    } catch {
      const timeoutEmbed = new EmbedBuilder()
        .setTitle("🧠 Trivia — Time's Up!")
        .setColor(0x6b7280)
        .setDescription(q.question)
        .addFields({ name: "Correct Answer", value: q.correct });

      await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
    }
  },
};
