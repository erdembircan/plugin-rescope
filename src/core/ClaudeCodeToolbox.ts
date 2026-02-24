import { homedir } from "node:os";
import { join } from "node:path";
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

const GLOBAL_CONFIG_PATH = join(
  homedir(),
  ".claude",
  "plugins",
  "installed_plugins.json",
);

const VERSION_REGEX = /^(\d+\.\d+\.\d+) \(Claude Code\)$/;

export class ClaudeCodeToolbox {
  /**
   * Checks whether the Claude CLI is installed by running `claude --version`.
   * Parses the output against the expected `X.Y.Z (Claude Code)` format.
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
    const config = new JsonConfig(GLOBAL_CONFIG_PATH);
    return config.read() as GlobalPluginConfig;
  }

  private updateGlobalConfig(data: GlobalPluginConfig): void {
    const config = new JsonConfig(GLOBAL_CONFIG_PATH);
    config.update(data);
  }
}
