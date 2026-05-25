export interface Warning {
  id: string;
  userId: string;
  guildId: string;
  reason: string;
  moderatorId: string;
  timestamp: Date;
}

export interface GuessGame {
  number: number;
  attempts: number;
  maxAttempts: number;
  userId: string;
}

export interface TicTacToeGame {
  board: (string | null)[];
  players: [string, string];
  currentTurn: 0 | 1;
  channelId: string;
}

const warnings = new Map<string, Warning[]>();
const guessGames = new Map<string, GuessGame>();
const tttGames = new Map<string, TicTacToeGame>();

function warnKey(guildId: string, userId: string) {
  return `${guildId}:${userId}`;
}

export const store = {
  addWarning(warning: Warning): void {
    const key = warnKey(warning.guildId, warning.userId);
    const existing = warnings.get(key) ?? [];
    existing.push(warning);
    warnings.set(key, existing);
  },
  getWarnings(guildId: string, userId: string): Warning[] {
    return warnings.get(warnKey(guildId, userId)) ?? [];
  },
  clearWarnings(guildId: string, userId: string): number {
    const key = warnKey(guildId, userId);
    const count = (warnings.get(key) ?? []).length;
    warnings.delete(key);
    return count;
  },

  setGuessGame(channelId: string, game: GuessGame): void {
    guessGames.set(channelId, game);
  },
  getGuessGame(channelId: string): GuessGame | undefined {
    return guessGames.get(channelId);
  },
  deleteGuessGame(channelId: string): void {
    guessGames.delete(channelId);
  },

  setTTTGame(channelId: string, game: TicTacToeGame): void {
    tttGames.set(channelId, game);
  },
  getTTTGame(channelId: string): TicTacToeGame | undefined {
    return tttGames.get(channelId);
  },
  deleteTTTGame(channelId: string): void {
    tttGames.delete(channelId);
  },
};
