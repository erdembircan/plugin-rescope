import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClaudeCodeToolbox } from "#core/ClaudeCodeToolbox.js";
import { JsonConfig } from "#util/JsonConfig.js";
import { ShellCommand } from "#util/ShellCommand.js";
import { ConfigNotFoundError } from "#util/ConfigNotFoundError.js";
import { ShellCommandError } from "#util/ShellCommandError.js";

vi.mock("#util/JsonConfig.js");
vi.mock("#util/ShellCommand.js");

describe("ClaudeCodeToolbox", () => {
  let mockGlobalConfig: JsonConfig;
  let mockLocalConfig: JsonConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGlobalConfig = new JsonConfig("fake-global-path");
    mockLocalConfig = new JsonConfig("fake-local-path");
  });

  describe("validateInstallation", () => {
    it("returns the version string when claude is installed", () => {
      vi.mocked(ShellCommand.execute).mockReturnValue("1.0.27 (Claude Code)");
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      const result = toolbox.validateInstallation();

      expect(result).toBe("1.0.27");
    });

    it("returns false when claude is not installed", () => {
      vi.mocked(ShellCommand.execute).mockImplementation(() => {
        throw new ShellCommandError("command not found: claude");
      });
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      const result = toolbox.validateInstallation();

      expect(result).toBe(false);
    });

    it("returns false when version output does not match expected format", () => {
      vi.mocked(ShellCommand.execute).mockReturnValue("some unexpected output");
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      const result = toolbox.validateInstallation();

      expect(result).toBe(false);
    });

    it("returns false when version is not at the start of the output", () => {
      vi.mocked(ShellCommand.execute).mockReturnValue(
        "version: 1.0.27 (Claude Code)",
      );
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      const result = toolbox.validateInstallation();

      expect(result).toBe(false);
    });

    it("returns false when there is no space after the version number", () => {
      vi.mocked(ShellCommand.execute).mockReturnValue("1.0.27(Claude Code)");
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      const result = toolbox.validateInstallation();

      expect(result).toBe(false);
    });
  });

  describe("getGlobalPluginConfig", () => {
    it("returns the plugin bindings for a known plugin", () => {
      const bindings = [
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
      ];
      vi.mocked(mockGlobalConfig.read).mockReturnValue({
        version: 2,
        plugins: {
          "testing-philosophy@erdembircan-plugins": bindings,
        },
      });
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      const result = toolbox.getGlobalPluginConfig(
        "testing-philosophy@erdembircan-plugins",
      );

      expect(result).toEqual(bindings);
    });

    it("returns an empty array when the plugin is not found", () => {
      vi.mocked(mockGlobalConfig.read).mockReturnValue({
        version: 2,
        plugins: {},
      });
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      const result = toolbox.getGlobalPluginConfig("nonexistent@owner");

      expect(result).toEqual([]);
    });

    it("propagates ConfigNotFoundError when config file is missing", () => {
      vi.mocked(mockGlobalConfig.read).mockImplementation(() => {
        throw new ConfigNotFoundError(
          "~/.claude/plugins/installed_plugins.json",
        );
      });
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      expect(() => toolbox.getGlobalPluginConfig("any-plugin@owner")).toThrow(
        ConfigNotFoundError,
      );
    });
  });

  describe("addGlobalPluginBinding", () => {
    it("appends a binding to an existing plugin entry", () => {
      const existingBinding = {
        scope: "local",
        installPath: "/path/to/plugin",
        version: "1.0.0",
        installedAt: "2026-02-24T12:00:00.000Z",
        lastUpdated: "2026-02-24T12:00:00.000Z",
        gitCommitSha: "abc123",
        projectPath: "/Users/test/project-a",
      };
      const newBinding = {
        scope: "local",
        installPath: "/path/to/plugin",
        version: "1.0.0",
        installedAt: "2026-02-24T13:00:00.000Z",
        lastUpdated: "2026-02-24T13:00:00.000Z",
        gitCommitSha: "abc123",
        projectPath: "/Users/test/project-b",
      };
      vi.mocked(mockGlobalConfig.read).mockReturnValue({
        version: 2,
        plugins: {
          "my-plugin@owner": [existingBinding],
        },
      });
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      toolbox.addGlobalPluginBinding("my-plugin@owner", newBinding);

      expect(mockGlobalConfig.update).toHaveBeenCalledWith({
        version: 2,
        plugins: {
          "my-plugin@owner": [existingBinding, newBinding],
        },
      });
    });

    it("creates a new plugin entry when the plugin does not exist", () => {
      const newBinding = {
        scope: "local",
        installPath: "/path/to/plugin",
        version: "2.0.0",
        installedAt: "2026-02-24T12:00:00.000Z",
        lastUpdated: "2026-02-24T12:00:00.000Z",
        gitCommitSha: "def456",
        projectPath: "/Users/test/project",
      };
      vi.mocked(mockGlobalConfig.read).mockReturnValue({
        version: 2,
        plugins: {},
      });
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      toolbox.addGlobalPluginBinding("new-plugin@owner", newBinding);

      expect(mockGlobalConfig.update).toHaveBeenCalledWith({
        version: 2,
        plugins: {
          "new-plugin@owner": [newBinding],
        },
      });
    });
  });
});
