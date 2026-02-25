import { homedir } from "node:os";
import { join } from "node:path";
import { ClaudeCodeToolbox } from "#core/ClaudeCodeToolbox.js";
import { FlagParser } from "#util/FlagParser.js";
import { JsonConfig } from "#util/JsonConfig.js";

/** Valid command names for the CLI. */
type Command = "add" | "remove";

/** Known command names used to distinguish the command positional from plugin names. */
const COMMANDS: ReadonlySet<string> = new Set<Command>(["add", "remove"]);

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
   * Runs the plugin rescoping workflow for one or more plugins.
   *
   * @param args - Raw CLI argument array (e.g. `process.argv.slice(2)`).
   */
  rescope(args: string[]): void {
    const flagParser = new FlagParser<"scope">(["scope"]);
    const { flags, positionals } = flagParser.parse(args);
    const scope = flags.scope;

    const { command, pluginNames } = this.extractCommand(positionals);

    if (pluginNames.length === 0) {
      console.log(
        "Usage: plugin-rescope [add|remove] [--scope <scope>] <plugin> [<plugin> ...]",
      );
      return;
    }

    const globalConfigPath = join(
      homedir(),
      ".claude",
      "plugins",
      "installed_plugins.json",
    );
    const localConfigPath = join(".claude", "settings.local.json");

    const toolbox = new ClaudeCodeToolbox(
      new JsonConfig(globalConfigPath),
      new JsonConfig(localConfigPath),
    );

    const version = toolbox.validateInstallation();

    if (version === false) {
      console.log("Claude is not installed.");
      return;
    }

    const handler =
      command === "add"
        ? (pluginName: string) => this.rescopePlugin(toolbox, pluginName, scope)
        : (pluginName: string) => this.unscopePlugin(toolbox, pluginName);

    for (const pluginName of pluginNames) {
      try {
        handler(pluginName);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred.";
        console.log(message);
      }
    }
  }

  /**
   * Extracts the command from the positionals array. If the first positional
   * is a known command name, it is consumed; otherwise defaults to `"add"`.
   */
  private extractCommand(positionals: string[]): {
    command: Command;
    pluginNames: string[];
  } {
    if (positionals.length > 0 && COMMANDS.has(positionals[0])) {
      return {
        command: positionals[0] as Command,
        pluginNames: positionals.slice(1),
      };
    }

    return { command: "add", pluginNames: positionals };
  }

  /**
   * Rescopes a single plugin: looks it up in global config and registers it
   * in both global and local settings if needed.
   */
  private rescopePlugin(
    toolbox: ClaudeCodeToolbox,
    pluginName: string,
    scope: string,
  ): void {
    const bindings = toolbox.getGlobalPluginConfig(pluginName);

    if (bindings.length === 0) {
      console.log(
        `Plugin "${pluginName}" not found in global config. No workaround needed.`,
      );
      return;
    }

    const source = bindings[0];
    const targetScope = scope || source.scope;

    const alreadyBound = bindings.some(
      (b) => b.scope === targetScope && b.projectPath === this.projectPath,
    );

    const enabledPlugins = toolbox.getEnabledPlugins();
    const alreadyEnabled = !!enabledPlugins[pluginName];

    if (alreadyBound && alreadyEnabled) {
      console.log(
        `Plugin "${pluginName}" is already configured for this project. If it is not working, the issue may be outside the scope of this package.`,
      );
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

    console.log(
      `Plugin "${pluginName}" rescoped to project "${this.projectPath}".`,
    );
  }

  /**
   * Unscopes a single plugin: removes its project-specific binding from the
   * global config and removes it from the local project settings.
   */
  private unscopePlugin(toolbox: ClaudeCodeToolbox, pluginName: string): void {
    toolbox.removeGlobalPluginBinding(pluginName, this.projectPath);
    toolbox.removeLocalPlugin(pluginName);
    console.log(
      `Plugin "${pluginName}" removed from project "${this.projectPath}".`,
    );
  }
}
