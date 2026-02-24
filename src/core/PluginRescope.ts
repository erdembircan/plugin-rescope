import { ClaudeCodeToolbox } from "#core/ClaudeCodeToolbox.js";
import { FlagParser } from "#util/FlagParser.js";
import { JsonConfig } from "#util/JsonConfig.js";

/**
 * Orchestrates the plugin rescoping workflow: parses CLI arguments,
 * validates the Claude CLI installation, and registers a plugin
 * in both the global and local configuration.
 */
export class PluginRescope {
  private readonly toolbox: ClaudeCodeToolbox;
  private readonly flagParser: FlagParser<"scope">;

  /**
   * Class constructor.
   *
   * @param projectPath - Absolute path to the current project root.
   */
  constructor(private readonly projectPath: string) {
    this.flagParser = new FlagParser(["scope"]);
    this.toolbox = new ClaudeCodeToolbox(
      new JsonConfig(ClaudeCodeToolbox.GLOBAL_CONFIG_PATH),
      new JsonConfig(ClaudeCodeToolbox.LOCAL_CONFIG_PATH),
    );
  }

  /**
   * Runs the plugin rescoping workflow.
   *
   * @param args - Raw CLI argument array (e.g. `process.argv.slice(2)`).
   */
  rescope(args: string[]): void {
    const { flags, positional: pluginName } = this.flagParser.parse(args);
    const scope = flags.scope;

    const version = this.toolbox.validateInstallation();

    if (version === false) {
      console.log("Claude is not installed.");
      return;
    }

    const bindings = this.toolbox.getGlobalPluginConfig(pluginName);

    if (bindings.length === 0) {
      console.log(
        `Plugin "${pluginName}" not found in global config. No workaround needed.`,
      );
      return;
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

    console.log(
      `Plugin "${pluginName}" rescoped to project "${this.projectPath}".`,
    );
  }
}
