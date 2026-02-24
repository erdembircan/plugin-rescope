import { ClaudeCodeToolbox } from "#core/ClaudeCodeToolbox.js";
import { FlagParser } from "#util/FlagParser.js";

/**
 * Orchestrates the plugin rescoping workflow: parses CLI arguments,
 * validates the Claude CLI installation, and registers a plugin
 * in both the global and local configuration.
 */
export class PluginRescope {
  /**
   * Class constructor.
   *
   * @param toolbox - Manages Claude CLI and configuration file interactions.
   * @param flagParser - Parses CLI arguments into flags and positional args.
   * @param projectPath - Absolute path to the current project root.
   */
  constructor(
    private readonly toolbox: ClaudeCodeToolbox,
    private readonly flagParser: FlagParser<"scope">,
    private readonly projectPath: string,
  ) {}

  /**
   * Runs the plugin rescoping workflow.
   *
   * 1. Parses `args` to extract the `--scope` flag and `plugin_name` positional arg.
   * 2. Validates that the Claude CLI is installed (throws if not).
   * 3. Looks up `plugin_name` in the global plugin config.
   * 4. If found: creates a new binding for the current project and adds the
   *    plugin to the local project settings.
   * 5. If not found: returns a message indicating no workaround is needed.
   *
   * @param args - Raw CLI argument array (e.g. `process.argv.slice(2)`).
   * @returns A status message describing what was done.
   * @throws {Error} If the Claude CLI is not installed.
   */
  rescope(args: string[]): string {
    const { flags, positional: pluginName } = this.flagParser.parse(args);
    const scope = flags.scope;

    const version = this.toolbox.validateInstallation();

    if (version === false) {
      throw new Error("Claude is not installed");
    }

    const bindings = this.toolbox.getGlobalPluginConfig(pluginName);

    if (bindings.length === 0) {
      return `Plugin "${pluginName}" not found in global config. No workaround needed.`;
    }

    const source = bindings[0];
    const now = new Date().toISOString();

    this.toolbox.addGlobalPluginBinding(pluginName, {
      scope: scope || source.scope,
      installPath: source.installPath,
      version: source.version,
      installedAt: source.installedAt,
      lastUpdated: now,
      gitCommitSha: source.gitCommitSha,
      projectPath: this.projectPath,
    });

    this.toolbox.addLocalPlugin(pluginName);

    return `Plugin "${pluginName}" rescoped to project "${this.projectPath}".`;
  }
}
