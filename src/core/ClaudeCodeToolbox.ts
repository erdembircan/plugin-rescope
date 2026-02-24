import { homedir } from "node:os";
import { join } from "node:path";

type PluginBinding = {
  scope: string;
  installPath: string;
  version: string;
  installedAt: string;
  lastUpdated: string;
  gitCommitSha: string;
  projectPath: string;
};

type GlobalPluginConfig = Record<string, PluginBinding[]>;

type LocalPluginConfig = Record<string, true>;

interface ShellCommandLike {
  execute(command: string): string;
}

interface JsonConfigConstructor {
  new (path: string): JsonConfigLike;
}

interface JsonConfigLike {
  read(): object;
  update(data: object): void;
}

const GLOBAL_CONFIG_PATH = join(
  homedir(),
  ".claude",
  "plugins",
  "installed_plugins.json",
);

const LOCAL_CONFIG_FILENAME = join(".claude", "settings.local.json");

export class ClaudeCodeToolbox {
  constructor(
    private readonly shellCommand: ShellCommandLike,
    private readonly jsonConfig: JsonConfigConstructor,
  ) {}

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
