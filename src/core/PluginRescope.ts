import { homedir } from "node:os";
import { join } from "node:path";
import { ClaudeCodeToolbox } from "#core/ClaudeCodeToolbox.js";
import { FlagParser } from "#util/FlagParser.js";
import { JsonConfig } from "#util/JsonConfig.js";

/**
 * Orchestrates the plugin rescoping workflow: parses CLI arguments,
 * validates the Claude CLI installation, and registers a plugin
 * in both the global and local configuration.
 */
export class PluginRescope {
  /**
   * Class constructor.
   *
   * @param projectPath - Absolute path to the current project root.
   */
  constructor(private readonly projectPath: string) {}

  /**
   * Runs the plugin rescoping workflow.
   *
   * @param args - Raw CLI argument array (e.g. `process.argv.slice(2)`).
   */
  rescope(args: string[]): void {
    const flagParser = new FlagParser<"scope">(["scope"]);
    const { flags, positional: pluginName } = flagParser.parse(args);
    const scope = flags.scope;

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

    try {
      const bindings = toolbox.getGlobalPluginConfig(pluginName);

      if (bindings.length === 0) {
        console.log(
          `Plugin "${pluginName}" not found in global config. No workaround needed.`,
        );
        return;
      }

      const source = bindings[0];
      const now = new Date().toISOString();

      toolbox.addGlobalPluginBinding(pluginName, {
        scope: scope || source.scope,
        installPath: source.installPath,
        version: source.version,
        installedAt: source.installedAt,
        lastUpdated: now,
        gitCommitSha: source.gitCommitSha,
        projectPath: this.projectPath,
      });

      toolbox.addLocalPlugin(pluginName);

      console.log(
        `Plugin "${pluginName}" rescoped to project "${this.projectPath}".`,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred.";
      console.log(message);
    }
  }
}
