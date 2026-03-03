import { homedir } from "node:os";
import { basename, join } from "node:path";
import { ClaudeCodeToolbox } from "#core/ClaudeCodeToolbox.js";
import { FlagParser } from "#util/FlagParser.js";
import { positive, negative, section } from "#util/format-output.js";
import { getHelpText } from "#util/get-help-text.js";
import { JsonConfig } from "#util/JsonConfig.js";

/**
 * Orchestrates the plugin rescoping workflow: parses CLI arguments,
 * validates the Claude CLI installation, and registers or unregisters
 * one or more plugins in both the global and local configuration.
 */
export class PluginRescope {
  /**
   * Class constructor.
   *
   * @param projectPath - Absolute path to the current project root.
   */
  constructor(private readonly projectPath: string) {}

  /**
   * Returns the trailing directory name of the project path, used as a
   * short label in user-facing output instead of the full absolute path.
   */
  private get shortPath(): string {
    return basename(this.projectPath);
  }

  /**
   * Runs the plugin rescoping workflow for one or more plugins.
   *
   * @param args - Raw CLI argument array (e.g. `process.argv.slice(2)`).
   */
  rescope(args: string[]): void {
    const flagParser = new FlagParser<"scope", "add" | "remove", "help">(
      [{ name: "scope", allowed: ["local", "project"], default: "local" }],
      {
        commands: ["add", "remove"],
        default: "add",
      },
      ["help"],
    );
    const { command, flags, positionals: pluginNames } = flagParser.parse(args);

    if (flags.help) {
      console.log(getHelpText());
      return;
    }

    const scope = flags.scope;

    if (pluginNames.length === 0) {
      console.log(getHelpText());
      return;
    }

    const globalConfigPath = join(
      homedir(),
      ".claude",
      "plugins",
      "installed_plugins.json",
    );
    const settingsPath =
      scope === "project"
        ? join(".claude", "settings.json")
        : join(".claude", "settings.local.json");

    const toolbox = new ClaudeCodeToolbox(
      new JsonConfig(globalConfigPath),
      new JsonConfig(settingsPath, true),
    );

    const version = toolbox.validateInstallation();

    if (version === false) {
      console.log(negative("Claude Code not found"));
      return;
    }

    console.log(positive(`Claude Code v${version}`));

    const handler =
      command === "add"
        ? (pluginName: string) => this.rescopePlugin(toolbox, pluginName, scope)
        : (pluginName: string) => this.unscopePlugin(toolbox, pluginName);

    for (const pluginName of pluginNames) {
      for (const line of section(pluginName)) {
        console.log(line);
      }

      try {
        handler(pluginName);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred.";
        console.log(negative(message));
      }
    }
  }

  /**
   * Rescopes a single plugin at the given scope: looks it up in global config
   * and registers it in both global and scope-specific settings if needed.
   */
  private rescopePlugin(
    toolbox: ClaudeCodeToolbox,
    pluginName: string,
    scope: string,
  ): void {
    const bindings = toolbox.getGlobalPluginConfig(pluginName);

    if (bindings.length === 0) {
      console.log(
        negative("not found in global config. No workaround needed."),
      );
      return;
    }

    const source = bindings[0];
    const targetScope = scope;

    const alreadyBound = bindings.some(
      (b) => b.scope === targetScope && b.projectPath === this.projectPath,
    );

    const enabledPlugins = toolbox.getEnabledPlugins();
    const alreadyEnabled = !!enabledPlugins[pluginName];

    if (alreadyBound && alreadyEnabled) {
      console.log(positive("already configured"));
      return;
    }

    if (!alreadyBound) {
      const now = new Date().toISOString();

      toolbox.addGlobalPluginBinding(pluginName, {
        scope: targetScope,
        installPath: source.installPath,
        version: source.version,
        installedAt: source.installedAt,
        lastUpdated: now,
        gitCommitSha: source.gitCommitSha,
        projectPath: this.projectPath,
      });
    }

    if (!alreadyEnabled) {
      toolbox.addLocalPlugin(pluginName);
    }

    console.log(positive(`rescoped to ${this.shortPath} (${scope})`));
  }

  /**
   * Unscopes a single plugin: removes its project-specific binding from the
   * global config and removes it from the local project settings.
   */
  private unscopePlugin(toolbox: ClaudeCodeToolbox, pluginName: string): void {
    toolbox.removeGlobalPluginBinding(pluginName, this.projectPath);
    toolbox.removeLocalPlugin(pluginName);
    console.log(positive(`removed from ${this.shortPath}`));
  }
}
