import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../../types.js";
import { setConfig, getConfig } from "../../config.js";
import { db, guildSettings } from "@workspace/db";
import { and, eq } from "drizzle-orm";

export const autorole: Command = {
  data: new SlashCommandBuilder()
    .setName("autorole")
    .setDescription("Automatically assign a role to every new member on join")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand((sub) =>
      sub
        .setName("set")
        .setDescription("Set the role to auto-assign on join")
        .addRoleOption((o) =>
          o.setName("role").setDescription("Role to assign").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("remove").setDescription("Disable auto role assignment")
    )
    .addSubcommand((sub) =>
      sub.setName("status").setDescription("Show the currently configured auto role")
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: "This command can only be used in a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    const sub = interaction.options.getSubcommand();

    if (sub === "set") {
      const role = interaction.options.getRole("role", true);

      const botMember = await guild.members.fetchMe();
      if (role.position >= botMember.roles.highest.position) {
        await interaction.reply({
          content: `❌ I can't assign **${role.name}** — it's equal to or higher than my highest role. Move my role above it first.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      if (role.managed) {
        await interaction.reply({
          content: `❌ **${role.name}** is a managed role (bot/integration role) and can't be assigned manually.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await interaction.deferReply();
      await setConfig(guild.id, "auto_role", role.id);
      await interaction.editReply(`✅ Auto role set to **${role.name}**. Every new member will receive it on join.`);
      return;
    }

    if (sub === "remove") {
      await interaction.deferReply();
      try {
        await db
          .delete(guildSettings)
          .where(and(eq(guildSettings.guildId, guild.id), eq(guildSettings.key, "auto_role")));
        // Also clear from cache by overwriting with empty (config.ts doesn't expose a delete, so we store empty sentinel)
        await setConfig(guild.id, "auto_role", "");
        await interaction.editReply("✅ Auto role has been disabled. New members will no longer receive an automatic role.");
      } catch {
        await interaction.editReply("❌ Failed to remove auto role. Please try again.");
      }
      return;
    }

    if (sub === "status") {
      await interaction.deferReply();
      const roleId = await getConfig(guild.id, "auto_role");
      if (!roleId) {
        await interaction.editReply("ℹ️ No auto role is currently configured. Use `/autorole set` to set one.");
        return;
      }
      const role = guild.roles.cache.get(roleId);
      if (!role) {
        await interaction.editReply("⚠️ An auto role was configured but the role no longer exists. Use `/autorole set` to set a new one.");
        return;
      }
      await interaction.editReply(`ℹ️ Auto role is currently set to **${role.name}** (<@&${role.id}>).`);
    }
  },
};
