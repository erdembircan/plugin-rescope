import { homedir } from "node:os";
import { join } from "node:path";
import { JsonConfig } from "./JsonConfig.js";
import { ShellCommand } from "./ShellCommand.js";

export type PluginBinding = {
  scope: string;
  installPath: string;
  version: string;
  installedAt: string;
  lastUpdated: string;
  gitCommitSha: string;
  projectPath: string;
};

export type GlobalPluginConfig = Record<string, PluginBinding[]>;

export type LocalPluginConfig = Record<string, true>;

const GLOBAL_CONFIG_PATH = join(
  homedir(),
  ".claude",
  "plugins",
  "installed_plugins.json",
);

const LOCAL_CONFIG_FILENAME = join(".claude", "settings.local.json");

export class ClaudeCodeToolbox {
  private readonly shellCommand: typeof ShellCommand;
  private readonly jsonConfig: typeof JsonConfig;

  constructor(
    shellCommand: typeof ShellCommand,
    jsonConfig: typeof JsonConfig,
  ) {
    this.shellCommand = shellCommand;
    this.jsonConfig = jsonConfig;
  }

  validateInstallation(): false | string {
    try {
      return this.shellCommand.execute("which claude");
    } catch {
      return false;
    }
  }

  readGlobalConfig(): GlobalPluginConfig {
    const config = new this.jsonConfig(GLOBAL_CONFIG_PATH);
    return config.read() as GlobalPluginConfig;
  }

  updateGlobalConfig(data: GlobalPluginConfig): void {
    const config = new this.jsonConfig(GLOBAL_CONFIG_PATH);
    config.update(data);
  }

  readLocalConfig(projectPath: string): LocalPluginConfig {
    const configPath = join(projectPath, LOCAL_CONFIG_FILENAME);
    const config = new this.jsonConfig(configPath);
    const settings = config.read() as { enabledPlugins?: LocalPluginConfig };
    return settings.enabledPlugins ?? {};
  }

  updateLocalConfig(projectPath: string, pluginKey: string): void {
    const configPath = join(projectPath, LOCAL_CONFIG_FILENAME);
    const config = new this.jsonConfig(configPath);
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
