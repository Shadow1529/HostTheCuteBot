import { useEffect, useState } from "react";

const MOD_COMMANDS = [
  { name: "/ban", desc: "Ban a member (optional: reason, message delete days)" },
  { name: "/kick", desc: "Kick a member from the server" },
  { name: "/timeout", desc: "Mute a member for 60s → 1 week" },
  { name: "/untimeout", desc: "Remove a timeout from a member" },
  { name: "/warn", desc: "Issue a formal warning to a member" },
  { name: "/warnings", desc: "View all warnings for a member" },
  { name: "/clearwarnings", desc: "Clear all warnings for a member" },
  { name: "/purge", desc: "Bulk-delete up to 100 messages (optional: filter by user)" },
  { name: "/lock", desc: "Lock a channel — members can't send messages" },
  { name: "/unlock", desc: "Unlock a previously locked channel" },
  { name: "/slowmode", desc: "Set or remove slowmode (0–21600 s)" },
  { name: "/modhistory @user", desc: "View full moderation history for a user (bans, kicks, timeouts, warns)" },
  { name: "/catdelete", desc: "Pick a category from a menu and permanently delete it with all its channels" },
];

const UTILITY_COMMANDS = [
  { name: "/setmessagelog", desc: "Set a channel for deleted/edited message logs" },
  { name: "/setmodlog", desc: "Set a channel for moderation action logs" },
  { name: "/setinvitelog", desc: "Set a channel for invite creation logs" },
  { name: "/welcomeset", desc: "Set this channel as the welcome channel for new members" },
  { name: "/say", desc: "Make the bot send a message in the current channel" },
  { name: "/autorole set|remove|status", desc: "Auto-assign a role to every new member on join" },
];

const GAME_COMMANDS = [
  { name: "/coinflip", desc: "Flip a coin — optionally guess heads or tails" },
  { name: "/rps", desc: "Rock Paper Scissors vs the bot" },
  { name: "/8ball", desc: "Ask the magic 8-ball any question" },
  { name: "/roll", desc: "Roll dice in any notation: 2d6, 1d20, 3d8…" },
  { name: "/trivia", desc: "Answer a random trivia question (15 s timer)" },
  { name: "/guess start|number|quit", desc: "Guess the secret number 1–100 in 7 tries" },
  { name: "/tictactoe @user", desc: "Challenge someone to interactive Tic-Tac-Toe" },
];

function StatusDot() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/healthz")
      .then((r) => r.ok && setOnline(true))
      .catch(() => setOnline(false));
  }, []);

  return (
    <span className="flex items-center gap-1.5 text-sm font-medium">
      <span
        className={`inline-block w-2.5 h-2.5 rounded-full ${
          online === null
            ? "bg-gray-400 animate-pulse"
            : online
            ? "bg-green-400"
            : "bg-red-400"
        }`}
      />
      <span className={online === null ? "text-gray-400" : online ? "text-green-400" : "text-red-400"}>
        {online === null ? "Checking…" : online ? "Online" : "Offline"}
      </span>
    </span>
  );
}

function CommandCard({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="command-card">
      <code className="command-name">{name}</code>
      <p className="command-desc">{desc}</p>
    </div>
  );
}

function Section({
  badge,
  badgeClass,
  note,
  commands,
}: {
  badge: string;
  badgeClass: string;
  note: string;
  commands: { name: string; desc: string }[];
}) {
  return (
    <section className="section">
      <div className="section-header">
        <span className={`section-badge ${badgeClass}`}>{badge}</span>
        <p className="section-note">{note}</p>
      </div>
      <div className="commands-grid">
        {commands.map((c) => (
          <CommandCard key={c.name} {...c} />
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const totalCommands = MOD_COMMANDS.length + UTILITY_COMMANDS.length + GAME_COMMANDS.length;

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-inner">
          <div className="avatar-ring">
            <div className="avatar-inner">🤖</div>
          </div>
          <div className="hero-text">
            <h1 className="bot-name">The Cute Bot</h1>
            <p className="bot-tagline">A powerful Discord bot packed with moderation tools, logging, and fun mini-games</p>
            <div className="hero-meta">
              <StatusDot />
              <span className="meta-sep">·</span>
              <span className="meta-item">{totalCommands} commands</span>
              <span className="meta-sep">·</span>
              <span className="meta-item">discord.js v14</span>
            </div>
          </div>
          <a
            href="https://discord.com/oauth2/authorize?scope=bot+applications.commands&permissions=1099511696391"
            target="_blank"
            rel="noopener noreferrer"
            className="invite-btn"
          >
            + Add to Server
          </a>
        </div>
      </header>

      <main className="main">
        <Section
          badge="🛡️ Moderation"
          badgeClass="mod-badge"
          note="Requires Moderator or Admin permissions"
          commands={MOD_COMMANDS}
        />
        <Section
          badge="⚙️ Utility & Logging"
          badgeClass="util-badge"
          note="Requires Manage Server permission"
          commands={UTILITY_COMMANDS}
        />
        <Section
          badge="🎮 Mini Games"
          badgeClass="game-badge"
          note="Available to everyone"
          commands={GAME_COMMANDS}
        />
      </main>

      <footer className="footer">
        Built with ❤️ using discord.js v14
      </footer>
    </div>
  );
}
