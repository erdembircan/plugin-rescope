import { JsonConfig } from "#util/JsonConfig.js";
import { ShellCommand } from "#util/ShellCommand.js";

/** A single plugin installation record stored in the global config. */
type PluginBinding = {
  scope: string;
  installPath: string;
  version: string;
  installedAt: string;
  lastUpdated: string;
  gitCommitSha: string;
  projectPath: string;
};

/** Shape of the global plugin configuration file (`~/.claude/plugins/installed_plugins.json`). */
type GlobalPluginConfig = {
  version: number;
  plugins: Record<string, PluginBinding[]>;
};

/** Shape of the local project settings file (`.claude/settings.local.json`). */
type LocalSettings = {
  enabledPlugins?: Record<string, boolean>;
};

const VERSION_REGEX = /^(\d+\.\d+\.\d+)\s/;

/**
 * Manages interactions with the Claude Code CLI and its configuration files.
 * Provides methods to validate the CLI installation, read and write the global
 * plugin registry, and manage local project plugin settings.
 */
export class ClaudeCodeToolbox {
  /**
   * Class constructor.
   *
   * @param globalConfig - Config handle for the global plugin registry file.
   * @param localConfig - Config handle for the local project settings file.
   */
  constructor(
    private readonly globalConfig: JsonConfig,
    private readonly localConfig: JsonConfig,
  ) {}

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

  /**
   * Reads the enabled plugins map from the local project settings file
   * (`.claude/settings.local.json`).
   *
   * @returns A record mapping plugin names to their enabled state, or an
   *          empty object if the `enabledPlugins` field is missing.
   * @throws {ConfigNotFoundError} If the local config file does not exist.
   */
  getEnabledPlugins(): Record<string, boolean> {
    const config = this.readLocalConfig();
    return config.enabledPlugins ?? {};
  }

  /**
   * Adds a plugin to the local project settings by setting its enabled
   * state to `true`.
   *
   * @param pluginName - The plugin name to enable.
   * @throws {ConfigNotFoundError} If the local config file does not exist.
   */
  addLocalPlugin(pluginName: string): void {
    const config = this.readLocalConfig();
    const enabledPlugins = config.enabledPlugins ?? {};
    enabledPlugins[pluginName] = true;
    config.enabledPlugins = enabledPlugins;
    this.updateLocalConfig(config);
  }

  private readGlobalConfig(): GlobalPluginConfig {
    return this.globalConfig.read() as GlobalPluginConfig;
  }

  private updateGlobalConfig(data: GlobalPluginConfig): void {
    this.globalConfig.update(data);
  }

  private readLocalConfig(): LocalSettings {
    return this.localConfig.read() as LocalSettings;
  }

  private updateLocalConfig(data: LocalSettings): void {
    this.localConfig.update(data);
  }
}
