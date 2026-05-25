import pino from "pino";
import { mkdirSync } from "fs";

mkdirSync("logs", { recursive: true });

const isProduction = process.env.NODE_ENV === "production";
const logLevel = process.env.LOG_LEVEL ?? "info";

const targets: pino.TransportTargetOptions[] = [
  {
    target: "pino/file",
    options: { destination: "logs/bot.log", append: true, mkdir: true },
    level: logLevel,
  },
  isProduction
    ? { target: "pino/file", options: { destination: 1 }, level: logLevel }
    : { target: "pino-pretty", options: { colorize: true, destination: 1 }, level: logLevel },
];

const transport = pino.transport({ targets });

export const logger = pino(
  {
    level: logLevel,
    redact: [
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers['set-cookie']",
    ],
  },
  transport
);
