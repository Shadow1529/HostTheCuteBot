import { appendFileSync, mkdirSync } from "fs";
import { join } from "path";
import { scheduleGitHubSync } from "./githubsync.js";

const LOG_PATH = join(process.cwd(), "logs", "errors.log");
const REPO_FILE_PATH = "logs/errors.log";

mkdirSync(join(process.cwd(), "logs"), { recursive: true });

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function extractMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export function logError(opts: {
  command?: string;
  user?: string;
  server?: string;
  err: unknown;
}): void {
  const { command = "—", user = "—", server = "—", err } = opts;

  const line = [
    `[${timestamp()}]`,
    `CMD: ${command.padEnd(20)}`,
    `USER: ${user.padEnd(32)}`,
    `SERVER: ${server}`,
    `ERR: ${extractMessage(err)}`,
  ].join(" | ") + "\n";

  try {
    appendFileSync(LOG_PATH, line, "utf8");
    scheduleGitHubSync(LOG_PATH, REPO_FILE_PATH);
  } catch {
    // non-fatal
  }
}
