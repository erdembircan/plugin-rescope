import { homedir } from "node:os";
import { join } from "node:path";
import { JsonConfig } from "../util/JsonConfig.js";
import { ShellCommand } from "../util/ShellCommand.js";

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

type LocalPluginConfig = Record<string, true>;

const GLOBAL_CONFIG_PATH = join(
  homedir(),
  ".claude",
  "plugins",
  "installed_plugins.json",
);

const LOCAL_CONFIG_FILENAME = join(".claude", "settings.local.json");

export class ClaudeCodeToolbox {
  validateInstallation(): false | string {
    try {
      return ShellCommand.execute("which claude");
    } catch {
      return false;
    }
  }

  getGlobalPluginConfig(pluginName: string): PluginBinding[] {
    const config = this.readGlobalConfig();
    return config.plugins[pluginName] ?? [];
  }

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

  private readLocalConfig(projectPath: string): LocalPluginConfig {
    const configPath = join(projectPath, LOCAL_CONFIG_FILENAME);
    const config = new JsonConfig(configPath);
    const settings = config.read() as { enabledPlugins?: LocalPluginConfig };
    return settings.enabledPlugins ?? {};
  }

  private updateLocalConfig(projectPath: string, pluginKey: string): void {
    const configPath = join(projectPath, LOCAL_CONFIG_FILENAME);
    const config = new JsonConfig(configPath);
    const settings = config.read() as {
      enabledPlugins?: LocalPluginConfig;
      [key: string]: unknown;
    };
    settings.enabledPlugins = {
      ...settings.enabledPlugins,
      [pluginKey]: true,
    };
    config.update(settings);
  }
}
