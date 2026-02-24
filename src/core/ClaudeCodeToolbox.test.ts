import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { ClaudeCodeToolbox } from "./ClaudeCodeToolbox.js";
import { ConfigNotFoundError } from "../util/ConfigNotFoundError.js";
import { ShellCommandError } from "../util/ShellCommandError.js";

function createMockJsonConfig(data: object = {}) {
  const readMock = vi.fn().mockReturnValue(data);
  const updateMock = vi.fn();
  const constructorSpy = vi.fn();

  class MockJsonConfig {
    read = readMock;
    update = updateMock;

    constructor(path: string) {
      constructorSpy(path);
    }
  }

  return {
    MockJsonConfig,
    readMock,
    updateMock,
    constructorSpy,
  };
}

function createMockShellCommand(returnValue: string = "/usr/local/bin/claude") {
  return {
    execute: vi.fn().mockReturnValue(returnValue),
  };
}

function createFailingShellCommand() {
  return {
    execute: vi.fn().mockImplementation(() => {
      throw new ShellCommandError("command not found: claude");
    }),
  };
}

describe("ClaudeCodeToolbox", () => {
  describe("validateInstallation", () => {
    it("returns the installation path when claude is installed", () => {
      const shellCommand = createMockShellCommand("/usr/local/bin/claude");
      const { MockJsonConfig } = createMockJsonConfig();
      const toolbox = new ClaudeCodeToolbox(shellCommand, MockJsonConfig);

      const result = toolbox.validateInstallation();

      expect(result).toBe("/usr/local/bin/claude");
    });

    it("returns false when claude is not installed", () => {
      const shellCommand = createFailingShellCommand();
      const { MockJsonConfig } = createMockJsonConfig();
      const toolbox = new ClaudeCodeToolbox(shellCommand, MockJsonConfig);

      const result = toolbox.validateInstallation();

      expect(result).toBe(false);
    });
  });

  describe("readGlobalConfig", () => {
    it("returns the parsed global plugin config", () => {
      const globalData = {
        "testing-philosophy@erdembircan-plugins": [
          {
            scope: "local",
            installPath:
              "/Users/test/.claude/plugins/cache/erdembircan-plugins/testing-philosophy/1.0.0",
            version: "1.0.0",
            installedAt: "2026-02-24T12:00:00.000Z",
            lastUpdated: "2026-02-24T12:00:00.000Z",
            gitCommitSha: "abc123",
            projectPath: "/Users/test/project",
          },
        ],
      };
      const shellCommand = createMockShellCommand();
      const { MockJsonConfig } = createMockJsonConfig(globalData);
      const toolbox = new ClaudeCodeToolbox(shellCommand, MockJsonConfig);

      const result = toolbox.readGlobalConfig();

      expect(result).toEqual(globalData);
    });

    it("propagates ConfigNotFoundError when config file is missing", () => {
      const shellCommand = createMockShellCommand();
      const { MockJsonConfig, readMock } = createMockJsonConfig();
      readMock.mockImplementation(() => {
        throw new ConfigNotFoundError(
          "~/.claude/plugins/installed_plugins.json",
        );
      });
      const toolbox = new ClaudeCodeToolbox(shellCommand, MockJsonConfig);

      expect(() => toolbox.readGlobalConfig()).toThrow(ConfigNotFoundError);
    });
  });

  describe("updateGlobalConfig", () => {
    it("writes the provided data to the global config", () => {
      const shellCommand = createMockShellCommand();
      const { MockJsonConfig, updateMock } = createMockJsonConfig();
      const toolbox = new ClaudeCodeToolbox(shellCommand, MockJsonConfig);

      const newData = {
        "my-plugin@owner": [
          {
            scope: "local",
            installPath: "/path/to/plugin",
            version: "2.0.0",
            installedAt: "2026-02-24T12:00:00.000Z",
            lastUpdated: "2026-02-24T12:00:00.000Z",
            gitCommitSha: "def456",
            projectPath: "/Users/test/project",
          },
        ],
      };

      toolbox.updateGlobalConfig(newData);

      expect(updateMock).toHaveBeenCalledWith(newData);
    });
  });

  describe("readLocalConfig", () => {
    it("returns the enabledPlugins section from local settings", () => {
      const enabledPlugins = {
        "commit-push@erdembircan-plugins": true as const,
        "testing-philosophy@erdembircan-plugins": true as const,
      };
      const shellCommand = createMockShellCommand();
      const { MockJsonConfig } = createMockJsonConfig({ enabledPlugins });
      const toolbox = new ClaudeCodeToolbox(shellCommand, MockJsonConfig);

      const result = toolbox.readLocalConfig("/Users/test/project");

      expect(result).toEqual(enabledPlugins);
    });

    it("returns empty object when enabledPlugins section is missing", () => {
      const shellCommand = createMockShellCommand();
      const { MockJsonConfig } = createMockJsonConfig({
        otherSetting: true,
      });
      const toolbox = new ClaudeCodeToolbox(shellCommand, MockJsonConfig);

      const result = toolbox.readLocalConfig("/Users/test/project");

      expect(result).toEqual({});
    });

    it("constructs JsonConfig with the correct local settings path", () => {
      const shellCommand = createMockShellCommand();
      const { MockJsonConfig, constructorSpy } = createMockJsonConfig({});
      const toolbox = new ClaudeCodeToolbox(shellCommand, MockJsonConfig);

      toolbox.readLocalConfig("/Users/test/project");

      expect(constructorSpy).toHaveBeenCalledWith(
        join("/Users/test/project", ".claude", "settings.local.json"),
      );
    });
  });

  describe("updateLocalConfig", () => {
    it("adds a plugin key to enabledPlugins", () => {
      const existingSettings = {
        enabledPlugins: {
          "existing-plugin@owner": true as const,
        },
        otherSetting: "preserved",
      };
      const shellCommand = createMockShellCommand();
      const { MockJsonConfig, updateMock } =
        createMockJsonConfig(existingSettings);
      const toolbox = new ClaudeCodeToolbox(shellCommand, MockJsonConfig);

      toolbox.updateLocalConfig("/Users/test/project", "new-plugin@owner");

      expect(updateMock).toHaveBeenCalledWith({
        enabledPlugins: {
          "existing-plugin@owner": true,
          "new-plugin@owner": true,
        },
        otherSetting: "preserved",
      });
    });

    it("creates enabledPlugins section when it does not exist", () => {
      const existingSettings = { otherSetting: "value" };
      const shellCommand = createMockShellCommand();
      const { MockJsonConfig, updateMock } =
        createMockJsonConfig(existingSettings);
      const toolbox = new ClaudeCodeToolbox(shellCommand, MockJsonConfig);

      toolbox.updateLocalConfig("/Users/test/project", "my-plugin@owner");

      expect(updateMock).toHaveBeenCalledWith({
        otherSetting: "value",
        enabledPlugins: {
          "my-plugin@owner": true,
        },
      });
    });
  });
});
