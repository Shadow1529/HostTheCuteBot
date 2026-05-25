# The Cute Bot

A feature-rich Discord bot with moderation tools and mini games built on discord.js v14.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server + Discord bot
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Required env: `DISCORD_BOT_TOKEN` — Discord bot token (set as a secret)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Discord: discord.js v14
- DB: PostgreSQL + Drizzle ORM (available but not used yet)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/api-server/src/bot/` — Discord bot entry point and command system
- `artifacts/api-server/src/bot/commands/moderation/` — Moderation commands (admin/mod only)
- `artifacts/api-server/src/bot/commands/games/` — Mini game commands (everyone)
- `artifacts/api-server/src/bot/store.ts` — In-memory store for warnings and game state
- `artifacts/api-server/src/bot/types.ts` — Command interface

## Architecture decisions

- Bot runs as a module alongside the Express server in the same process
- Slash commands are registered globally on startup (propagation takes up to 1 hour on first run)
- Warnings are stored in-memory (lost on restart); migrate to DB for persistence
- `8ball` command registered as `8ball` (discord.js handles the slash prefix)

## Product

**Moderation commands** (require Moderator/Admin permissions):
- `/ban` — Ban a member (with optional reason + message delete days)
- `/kick` — Kick a member
- `/timeout` — Timeout a member (60s to 1 week)
- `/untimeout` — Remove a timeout
- `/warn` — Warn a member
- `/warnings` — View all warnings for a member
- `/clearwarnings` — Clear all warnings for a member
- `/purge` — Bulk delete messages (1–100, optional user filter)
- `/lock` — Lock a channel (prevent messages)
- `/unlock` — Unlock a channel
- `/slowmode` — Set or remove slowmode (0–21600s)

**Mini games** (for everyone):
- `/coinflip` — Flip a coin with optional guess
- `/rps` — Rock Paper Scissors vs the bot
- `/8ball` — Magic 8-ball
- `/roll` — Roll dice with notation (e.g. `2d6`, `1d20`)
- `/trivia` — Multiple-choice trivia with 15s timer (20 questions)
- `/guess` — Number guessing game (1–100, 7 attempts, channel-wide)
- `/tictactoe` — Challenge another user to Tic-Tac-Toe (interactive buttons)

## Gotchas

- Slash commands are registered globally; Discord can take up to 1 hour to propagate them on first registration
- For instant command testing, register guild-specific commands using `Routes.applicationGuildCommands(clientId, guildId)` in bot/index.ts
- The `MESSAGE_CONTENT` intent requires enabling in the Discord Developer Portal under Privileged Gateway Intents
- Bulk delete via `/purge` only works on messages < 14 days old (Discord limitation)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._
