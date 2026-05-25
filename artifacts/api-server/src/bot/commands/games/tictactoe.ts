import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  type ChatInputCommandInteraction,
  type ButtonInteraction,
  type Message,
} from "discord.js";
import type { Command } from "../../types.js";
import type { TicTacToeGame } from "../../store.js";
import { store } from "../../store.js";

const SYMBOLS = ["❌", "⭕"] as const;

function renderBoard(board: (string | null)[]): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let r = 0; r < 3; r++) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      const cell = board[idx];
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`ttt_${idx}`)
          .setLabel(cell ?? "⬜")
          .setStyle(cell ? ButtonStyle.Secondary : ButtonStyle.Primary)
          .setDisabled(cell !== null)
      );
    }
    rows.push(row);
  }
  return rows;
}

function checkWinner(board: (string | null)[]): string | null {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (board[a!] && board[a!] === board[b!] && board[a!] === board[c!]) {
      return board[a!]!;
    }
  }
  return null;
}

function isDraw(board: (string | null)[]): boolean {
  return board.every((cell) => cell !== null);
}

function buildEmbed(game: TicTacToeGame, status: string): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle("❌ Tic-Tac-Toe ⭕")
    .setColor(0x6366f1)
    .setDescription(status)
    .setFooter({ text: `${SYMBOLS[0]} = <@${game.players[0]}> | ${SYMBOLS[1]} = <@${game.players[1]}>` });
}

export const tictactoe: Command = {
  data: new SlashCommandBuilder()
    .setName("tictactoe")
    .setDescription("Challenge someone to Tic-Tac-Toe!")
    .addUserOption((o) =>
      o.setName("opponent").setDescription("User to challenge").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const opponent = interaction.options.getUser("opponent", true);

    if (opponent.id === interaction.user.id) {
      await interaction.reply({ content: "You can't play against yourself!", ephemeral: true });
      return;
    }
    if (opponent.bot) {
      await interaction.reply({ content: "You can't play against a bot!", ephemeral: true });
      return;
    }

    const existing = store.getTTTGame(interaction.channelId);
    if (existing) {
      await interaction.reply({ content: "A Tic-Tac-Toe game is already running in this channel!", ephemeral: true });
      return;
    }

    const game: TicTacToeGame = {
      board: Array(9).fill(null) as (string | null)[],
      players: [interaction.user.id, opponent.id],
      currentTurn: 0,
      channelId: interaction.channelId,
    };

    store.setTTTGame(interaction.channelId, game);

    const embed = buildEmbed(game, `${SYMBOLS[0]} <@${game.players[0]}>'s turn!`);
    await interaction.reply({
      content: `<@${opponent.id}>, you've been challenged to Tic-Tac-Toe by <@${interaction.user.id}>!`,
      embeds: [embed],
      components: renderBoard(game.board),
    });

    const msg = await interaction.fetchReply() as Message;

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (btn: ButtonInteraction) =>
        btn.customId.startsWith("ttt_") &&
        game.players.includes(btn.user.id),
      time: 5 * 60 * 1000,
    });

    collector.on("collect", async (btn: ButtonInteraction) => {
      const currentGame = store.getTTTGame(interaction.channelId);
      if (!currentGame) {
        await btn.reply({ content: "Game no longer active.", ephemeral: true });
        return;
      }

      if (btn.user.id !== currentGame.players[currentGame.currentTurn]) {
        await btn.reply({ content: "It's not your turn!", ephemeral: true });
        return;
      }

      const idx = parseInt(btn.customId.replace("ttt_", ""), 10);
      if (currentGame.board[idx] !== null) {
        await btn.reply({ content: "That cell is already taken!", ephemeral: true });
        return;
      }

      currentGame.board[idx] = SYMBOLS[currentGame.currentTurn];
      const winner = checkWinner(currentGame.board);

      if (winner) {
        store.deleteTTTGame(interaction.channelId);
        collector.stop("won");
        const winEmbed = buildEmbed(currentGame, `🎉 ${winner} <@${btn.user.id}> wins!`);
        const disabled = renderBoard(currentGame.board).map((r) => {
          r.components.forEach((b) => b.setDisabled(true));
          return r;
        });
        await btn.update({ embeds: [winEmbed], components: disabled });
        return;
      }

      if (isDraw(currentGame.board)) {
        store.deleteTTTGame(interaction.channelId);
        collector.stop("draw");
        const drawEmbed = buildEmbed(currentGame, "🤝 It's a draw!");
        const disabled = renderBoard(currentGame.board).map((r) => {
          r.components.forEach((b) => b.setDisabled(true));
          return r;
        });
        await btn.update({ embeds: [drawEmbed], components: disabled });
        return;
      }

      currentGame.currentTurn = currentGame.currentTurn === 0 ? 1 : 0;
      const nextSymbol = SYMBOLS[currentGame.currentTurn];
      const nextPlayer = currentGame.players[currentGame.currentTurn];
      const turnEmbed = buildEmbed(currentGame, `${nextSymbol} <@${nextPlayer}>'s turn!`);
      await btn.update({ embeds: [turnEmbed], components: renderBoard(currentGame.board) });
    });

    collector.on("end", async (_: unknown, reason: string) => {
      if (reason !== "won" && reason !== "draw") {
        store.deleteTTTGame(interaction.channelId);
        const current = store.getTTTGame(interaction.channelId);
        if (!current) {
          const timeoutEmbed = buildEmbed(game, "⏰ Game timed out due to inactivity.");
          const disabled = renderBoard(game.board).map((r) => {
            r.components.forEach((b) => b.setDisabled(true));
            return r;
          });
          await interaction.editReply({ embeds: [timeoutEmbed], components: disabled }).catch(() => null);
        }
      }
    });
  },
};
