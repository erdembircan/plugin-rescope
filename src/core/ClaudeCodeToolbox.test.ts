import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClaudeCodeToolbox } from "./ClaudeCodeToolbox.js";
import { ConfigNotFoundError } from "../util/ConfigNotFoundError.js";
import { ShellCommandError } from "../util/ShellCommandError.js";

const { mockRead, mockUpdate, mockExecute, mockJsonConfigConstructor } =
  vi.hoisted(() => {
    const mockRead = vi.fn();
    const mockUpdate = vi.fn();
    const mockExecute = vi.fn();
    const mockJsonConfigConstructor = vi.fn();

    return { mockRead, mockUpdate, mockExecute, mockJsonConfigConstructor };
  });

vi.mock("../util/JsonConfig.js", () => ({
  JsonConfig: class MockJsonConfig {
    read = mockRead;
    update = mockUpdate;

    constructor(path: string) {
      mockJsonConfigConstructor(path);
    }
  },
}));

vi.mock("../util/ShellCommand.js", () => ({
  ShellCommand: { execute: mockExecute },
}));

describe("ClaudeCodeToolbox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateInstallation", () => {
    it("returns the installation path when claude is installed", () => {
      mockExecute.mockReturnValue("/usr/local/bin/claude");
      const toolbox = new ClaudeCodeToolbox();

      const result = toolbox.validateInstallation();

      expect(result).toBe("/usr/local/bin/claude");
    });

    it("returns false when claude is not installed", () => {
      mockExecute.mockImplementation(() => {
        throw new ShellCommandError("command not found: claude");
      });
      const toolbox = new ClaudeCodeToolbox();

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
      mockRead.mockReturnValue(globalData);
      const toolbox = new ClaudeCodeToolbox();

      const result = toolbox.readGlobalConfig();

      expect(result).toEqual(globalData);
    });

    it("propagates ConfigNotFoundError when config file is missing", () => {
      mockRead.mockImplementation(() => {
        throw new ConfigNotFoundError(
          "~/.claude/plugins/installed_plugins.json",
        );
      });
      const toolbox = new ClaudeCodeToolbox();

      expect(() => toolbox.readGlobalConfig()).toThrow(ConfigNotFoundError);
    });
  });

  describe("updateGlobalConfig", () => {
    it("writes the provided data to the global config", () => {
      const toolbox = new ClaudeCodeToolbox();

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

      expect(mockUpdate).toHaveBeenCalledWith(newData);
    });
  });

  describe("readLocalConfig", () => {
    it("returns the enabledPlugins section from local settings", () => {
      const enabledPlugins = {
        "commit-push@erdembircan-plugins": true as const,
        "testing-philosophy@erdembircan-plugins": true as const,
      };
      mockRead.mockReturnValue({ enabledPlugins });
      const toolbox = new ClaudeCodeToolbox();

      const result = toolbox.readLocalConfig("/Users/test/project");

      expect(result).toEqual(enabledPlugins);
    });

    it("returns empty object when enabledPlugins section is missing", () => {
      mockRead.mockReturnValue({ otherSetting: true });
      const toolbox = new ClaudeCodeToolbox();

      const result = toolbox.readLocalConfig("/Users/test/project");

      expect(result).toEqual({});
    });

    it("constructs JsonConfig with the correct local settings path", () => {
      mockRead.mockReturnValue({});
      const toolbox = new ClaudeCodeToolbox();

      toolbox.readLocalConfig("/Users/test/project");

      expect(mockJsonConfigConstructor).toHaveBeenCalledWith(
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
      mockRead.mockReturnValue(existingSettings);
      const toolbox = new ClaudeCodeToolbox();

      toolbox.updateLocalConfig("/Users/test/project", "new-plugin@owner");

      expect(mockUpdate).toHaveBeenCalledWith({
        enabledPlugins: {
          "existing-plugin@owner": true,
          "new-plugin@owner": true,
        },
        otherSetting: "preserved",
      });
    });

    it("creates enabledPlugins section when it does not exist", () => {
      const existingSettings = { otherSetting: "value" };
      mockRead.mockReturnValue(existingSettings);
      const toolbox = new ClaudeCodeToolbox();

      toolbox.updateLocalConfig("/Users/test/project", "my-plugin@owner");

      expect(mockUpdate).toHaveBeenCalledWith({
        otherSetting: "value",
        enabledPlugins: {
          "my-plugin@owner": true,
        },
      });
    });
  });
});
