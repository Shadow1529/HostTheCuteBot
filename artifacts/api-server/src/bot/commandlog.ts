import { appendFileSync, mkdirSync } from "fs";
import { join } from "path";
import type { ChatInputCommandInteraction } from "discord.js";
import { scheduleGitHubSync } from "./githubsync.js";

const LOG_PATH = join(process.cwd(), "logs", "commands.log");
const REPO_FILE_PATH = "logs/commands.log";

mkdirSync(join(process.cwd(), "logs"), { recursive: true });

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

export function logCommand(interaction: ChatInputCommandInteraction): void {
  const user = interaction.user;
  const guild = interaction.guild;

  const subcommand = interaction.options.getSubcommand(false);
  const fullCommand = subcommand
    ? `/${interaction.commandName} ${subcommand}`
    : `/${interaction.commandName}`;

  const server = guild ? `${guild.name} (${guild.id})` : "DM";

  const line = `[${timestamp()}] ${fullCommand.padEnd(25)} | ${user.tag.padEnd(32)} | ${server}\n`;

  try {
    appendFileSync(LOG_PATH, line, "utf8");
    scheduleGitHubSync(LOG_PATH, REPO_FILE_PATH);
  } catch {
    // non-fatal — never crash the bot over logging
  }
}
