import { JsonConfig } from "#util/JsonConfig.js";
import { ShellCommand } from "#util/ShellCommand.js";

type PluginBinding = {
  scope: string;
  installPath: string;
  version: string;
  installedAt: string;
  lastUpdated: string;
  gitCommitSha: string;
  projectPath: string;
};

type GlobalPluginConfig = {
  version: number;
  plugins: Record<string, PluginBinding[]>;
};

const VERSION_REGEX = /^(\d+\.\d+\.\d+)\s/;

export class ClaudeCodeToolbox {
  private readonly globalConfig: JsonConfig;
  private readonly localConfig: JsonConfig;

  constructor(globalConfig: JsonConfig, localConfig: JsonConfig) {
    this.globalConfig = globalConfig;
    this.localConfig = localConfig;
  }

  /**
   * Checks whether the Claude CLI is installed by running `claude --version`.
   * Parses the output to extract the leading `X.Y.Z` version number.
   *
   * @returns The version string (e.g. `"1.0.0"`) if installed, or `false` if
   *          the CLI is not found or the output does not match the expected format.
   */
  validateInstallation(): false | string {
    try {
      const output = ShellCommand.execute("claude --version");
      const match = output.match(VERSION_REGEX);
      return match ? match[1] : false;
    } catch {
      return false;
    }
  }

  /**
   * Retrieves the plugin bindings for a given plugin from the global
   * Claude plugin configuration file (`~/.claude/plugins/installed_plugins.json`).
   *
   * @param pluginName - The plugin key in `name@marketplace` format.
   * @returns An array of {@link PluginBinding} entries, or an empty array if
   *          the plugin is not found.
   * @throws {ConfigNotFoundError} If the global config file does not exist.
   */
  getGlobalPluginConfig(pluginName: string): PluginBinding[] {
    const config = this.readGlobalConfig();
    return config.plugins[pluginName] ?? [];
  }

  /**
   * Appends a new binding to the given plugin's entry in the global
   * Claude plugin configuration. Creates the plugin entry if it does not exist.
   *
   * @param pluginName - The plugin key in `name@marketplace` format.
   * @param binding - The {@link PluginBinding} to add.
   * @throws {ConfigNotFoundError} If the global config file does not exist.
   */
  addGlobalPluginBinding(pluginName: string, binding: PluginBinding): void {
    const config = this.readGlobalConfig();
    const existing = config.plugins[pluginName] ?? [];
    existing.push(binding);
    config.plugins[pluginName] = existing;
    this.updateGlobalConfig(config);
  }

  private readGlobalConfig(): GlobalPluginConfig {
    return this.globalConfig.read() as GlobalPluginConfig;
  }

  private updateGlobalConfig(data: GlobalPluginConfig): void {
    this.globalConfig.update(data);
  }
}
