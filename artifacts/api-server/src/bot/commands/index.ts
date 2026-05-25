import type { Command } from "../types.js";

import { ban } from "./moderation/ban.js";
import { kick } from "./moderation/kick.js";
import { timeout } from "./moderation/timeout.js";
import { untimeout } from "./moderation/untimeout.js";
import { warn } from "./moderation/warn.js";
import { warnings } from "./moderation/warnings.js";
import { clearwarnings } from "./moderation/clearwarnings.js";
import { purge } from "./moderation/purge.js";
import { lock } from "./moderation/lock.js";
import { unlock } from "./moderation/unlock.js";
import { slowmode } from "./moderation/slowmode.js";

import { coinflip } from "./games/coinflip.js";
import { rps } from "./games/rps.js";
import { eightball } from "./games/eightball.js";
import { roll } from "./games/roll.js";
import { trivia } from "./games/trivia.js";
import { guess } from "./games/guess.js";
import { tictactoe } from "./games/tictactoe.js";

import { setmessagelog } from "./utility/setmessagelog.js";
import { setmodlog } from "./utility/setmodlog.js";
import { setinvitelog } from "./utility/setinvitelog.js";
import { welcomeset } from "./utility/welcomeset.js";
import { say } from "./utility/say.js";

import { modhistory } from "./moderation/modhistory.js";
import { catdelete } from "./moderation/catdelete.js";

import { autorole } from "./utility/autorole.js";

export const commands: Command[] = [
  ban, kick, timeout, untimeout, warn, warnings, clearwarnings,
  purge, lock, unlock, slowmode, modhistory, catdelete,
  coinflip, rps, eightball, roll, trivia, guess, tictactoe,
  setmessagelog, setmodlog, setinvitelog, welcomeset, say, autorole,
];

export const commandMap = new Map<string, Command>(
  commands.map((c) => [c.data.name, c])
);
