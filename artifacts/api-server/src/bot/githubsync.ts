import { readFileSync, existsSync } from "fs";
import { logger } from "../lib/logger.js";

const GITHUB_TOKEN = process.env["GITHUB_TOKEN"];
const REPO = "Shadow1529/HostTheCuteBot";
const API_BASE = "https://api.github.com";
const DEBOUNCE_MS = 15_000;

let timer: ReturnType<typeof setTimeout> | null = null;

async function getFileSha(filePath: string): Promise<string | null> {
  const res = await fetch(`${API_BASE}/repos/${REPO}/contents/${filePath}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const data = (await res.json()) as { sha: string };
  return data.sha;
}

async function push(localPath: string, repoFilePath: string): Promise<void> {
  if (!GITHUB_TOKEN) {
    logger.warn("GITHUB_TOKEN not set — skipping log sync");
    return;
  }

  const content = existsSync(localPath) ? readFileSync(localPath, "utf8") : "";
  const sha = await getFileSha(repoFilePath);

  const body: Record<string, unknown> = {
    message: "logs: auto-sync commands.log",
    content: Buffer.from(content).toString("base64"),
  };
  if (sha) body.sha = sha;

  const res = await fetch(`${API_BASE}/repos/${REPO}/contents/${repoFilePath}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    logger.info({ repoFilePath }, "Log synced to GitHub");
  } else {
    const text = await res.text();
    logger.warn({ status: res.status, text }, "GitHub sync failed");
  }
}

/**
 * Debounced — call after every log write.
 * Waits DEBOUNCE_MS after the last call before pushing.
 */
export function scheduleGitHubSync(localPath: string, repoFilePath: string): void {
  if (!GITHUB_TOKEN) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    push(localPath, repoFilePath).catch((err) =>
      logger.warn({ err }, "GitHub sync error")
    );
  }, DEBOUNCE_MS);
}
