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
  plugins?: Record<string, PluginBinding[]>;
};

/** Shape of a project settings file (`.claude/settings.local.json` or `.claude/settings.json`). */
type ProjectSettings = {
  enabledPlugins?: Record<string, boolean>;
};

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
   * @param settingsConfig - Config handle for the project settings file
   *   (either `.claude/settings.local.json` or `.claude/settings.json`).
   *   Should be constructed with `createIfMissing: true` so that missing
   *   settings files are created automatically.
   */
  constructor(
    private readonly globalConfig: JsonConfig,
    private readonly settingsConfig: JsonConfig,
  ) {}

  /**
   * Checks whether the Claude CLI is installed by running `claude --version`.
   * Parses the output to extract the leading `X.Y.Z` version number.
   *
   * @returns The version string (e.g. `"1.0.0"`) if installed, or `false` if
   *          the CLI is not found or the output does not match the expected format.
   */
  validateInstallation(): false | string {
    const VERSION_REGEX = /^(\d+\.\d+\.\d+)\s/;
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
    return config.plugins?.[pluginName] ?? [];
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
    const plugins = config.plugins ?? {};
    const existing = plugins[pluginName] ?? [];
    existing.push(binding);
    plugins[pluginName] = existing;
    config.plugins = plugins;
    this.updateGlobalConfig(config);
  }

  /**
   * Reads the enabled plugins map from the project settings file.
   * If the settings file does not exist, it is created automatically
   * and an empty map is returned.
   *
   * @returns A record mapping plugin names to their enabled state, or an
   *          empty object if the `enabledPlugins` field is missing.
   */
  getEnabledPlugins(): Record<string, boolean> {
    const config = this.readSettingsConfig();
    return config.enabledPlugins ?? {};
  }

  /**
   * Adds a plugin to the project settings by setting its enabled
   * state to `true`. If the settings file does not exist, it is
   * created automatically.
   *
   * @param pluginName - The plugin name to enable.
   */
  addLocalPlugin(pluginName: string): void {
    const config = this.readSettingsConfig();
    const enabledPlugins = config.enabledPlugins ?? {};
    enabledPlugins[pluginName] = true;
    config.enabledPlugins = enabledPlugins;
    this.updateSettingsConfig(config);
  }

  /**
   * Removes bindings that match a given project path from a plugin's entry
   * in the global plugin configuration. If no bindings remain after removal,
   * the entire plugin key is removed from the config.
   *
   * @param pluginName - The plugin key in `name@marketplace` format.
   * @param projectPath - The project path whose bindings should be removed.
   * @throws {ConfigNotFoundError} If the global config file does not exist.
   */
  removeGlobalPluginBinding(pluginName: string, projectPath: string): void {
    const config = this.readGlobalConfig();
    const plugins = config.plugins ?? {};
    const existing = plugins[pluginName] ?? [];
    const remaining = existing.filter((b) => b.projectPath !== projectPath);

    if (remaining.length > 0) {
      plugins[pluginName] = remaining;
    } else {
      delete plugins[pluginName];
    }

    config.plugins = plugins;
    this.updateGlobalConfig(config);
  }

  /**
   * Removes a plugin from the project settings by deleting its key
   * from the `enabledPlugins` map. If the settings file does not exist,
   * it is created automatically.
   *
   * @param pluginName - The plugin name to remove.
   */
  removeLocalPlugin(pluginName: string): void {
    const config = this.readSettingsConfig();
    const enabledPlugins = config.enabledPlugins ?? {};
    delete enabledPlugins[pluginName];
    config.enabledPlugins = enabledPlugins;
    this.updateSettingsConfig(config);
  }

  private readGlobalConfig(): GlobalPluginConfig {
    return this.globalConfig.read() as GlobalPluginConfig;
  }

  private updateGlobalConfig(data: GlobalPluginConfig): void {
    this.globalConfig.update(data);
  }

  private readSettingsConfig(): ProjectSettings {
    return this.settingsConfig.read() as ProjectSettings;
  }

  private updateSettingsConfig(data: ProjectSettings): void {
    this.settingsConfig.update(data);
  }
}
