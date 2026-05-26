import { appendFileSync, mkdirSync } from "fs";
import { join } from "path";
import type { GuildMember, PartialGuildMember } from "discord.js";
import { scheduleGitHubSync } from "./githubsync.js";

const LOG_PATH = join(process.cwd(), "logs", "members.log");
const REPO_FILE_PATH = "logs/members.log";

mkdirSync(join(process.cwd(), "logs"), { recursive: true });

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function write(line: string): void {
  try {
    appendFileSync(LOG_PATH, line + "\n", "utf8");
    scheduleGitHubSync(LOG_PATH, REPO_FILE_PATH);
  } catch {
    // non-fatal
  }
}

export function logMemberJoin(member: GuildMember): void {
  const user = member.user;
  const guild = member.guild;
  const accountAge = Math.floor(
    (Date.now() - user.createdTimestamp) / (1000 * 60 * 60 * 24)
  );

  write(
    `[${timestamp()}] JOINED  | ${user.tag.padEnd(32)} (${user.id}) | ${guild.name} (${guild.id}) | Account age: ${accountAge}d`
  );
}

export function logMemberLeave(member: GuildMember | PartialGuildMember): void {
  const user = member.user;
  const guild = member.guild;

  write(
    `[${timestamp()}] LEFT    | ${(user?.tag ?? "Unknown").padEnd(32)} (${user?.id ?? "?"}) | ${guild.name} (${guild.id})`
  );
}
