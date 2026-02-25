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
        plugins: {},
      });
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      const result = toolbox.getGlobalPluginConfig("nonexistent@owner");

      expect(result).toEqual([]);
    });

    it("returns an empty array when the plugins field is absent", () => {
      vi.mocked(mockGlobalConfig.read).mockReturnValue({});
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      const result = toolbox.getGlobalPluginConfig("any-plugin@owner");

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
        plugins: {
          "my-plugin@owner": [existingBinding],
        },
      });
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      toolbox.addGlobalPluginBinding("my-plugin@owner", newBinding);

      expect(mockGlobalConfig.update).toHaveBeenCalledWith({
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
        plugins: {},
      });
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      toolbox.addGlobalPluginBinding("new-plugin@owner", newBinding);

      expect(mockGlobalConfig.update).toHaveBeenCalledWith({
        plugins: {
          "new-plugin@owner": [newBinding],
        },
      });
    });

    it("creates the plugins field when it is absent", () => {
      const newBinding = {
        scope: "local",
        installPath: "/path/to/plugin",
        version: "1.0.0",
        installedAt: "2026-02-24T12:00:00.000Z",
        lastUpdated: "2026-02-24T12:00:00.000Z",
        gitCommitSha: "abc123",
        projectPath: "/Users/test/project",
      };
      vi.mocked(mockGlobalConfig.read).mockReturnValue({});
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      toolbox.addGlobalPluginBinding("my-plugin@owner", newBinding);

      expect(mockGlobalConfig.update).toHaveBeenCalledWith({
        plugins: {
          "my-plugin@owner": [newBinding],
        },
      });
    });
  });

  describe("getEnabledPlugins", () => {
    it("returns the enabled plugins map from local config", () => {
      vi.mocked(mockLocalConfig.read).mockReturnValue({
        enabledPlugins: {
          "my-plugin@owner": true,
          "another-plugin@owner": true,
        },
      });
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      const result = toolbox.getEnabledPlugins();

      expect(result).toEqual({
        "my-plugin@owner": true,
        "another-plugin@owner": true,
      });
    });

    it("returns an empty object when enabledPlugins field is missing", () => {
      vi.mocked(mockLocalConfig.read).mockReturnValue({});
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      const result = toolbox.getEnabledPlugins();

      expect(result).toEqual({});
    });

    it("propagates ConfigNotFoundError when local config file is missing", () => {
      vi.mocked(mockLocalConfig.read).mockImplementation(() => {
        throw new ConfigNotFoundError(".claude/settings.local.json");
      });
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      expect(() => toolbox.getEnabledPlugins()).toThrow(ConfigNotFoundError);
    });
  });

  describe("addLocalPlugin", () => {
    it("adds a plugin to the enabled plugins map", () => {
      vi.mocked(mockLocalConfig.read).mockReturnValue({
        enabledPlugins: {
          "existing-plugin@owner": true,
        },
      });
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      toolbox.addLocalPlugin("new-plugin@owner");

      expect(mockLocalConfig.update).toHaveBeenCalledWith({
        enabledPlugins: {
          "existing-plugin@owner": true,
          "new-plugin@owner": true,
        },
      });
    });

    it("creates the enabledPlugins field when it is missing", () => {
      vi.mocked(mockLocalConfig.read).mockReturnValue({});
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      toolbox.addLocalPlugin("my-plugin@owner");

      expect(mockLocalConfig.update).toHaveBeenCalledWith({
        enabledPlugins: {
          "my-plugin@owner": true,
        },
      });
    });

    it("propagates ConfigNotFoundError when local config file is missing", () => {
      vi.mocked(mockLocalConfig.read).mockImplementation(() => {
        throw new ConfigNotFoundError(".claude/settings.local.json");
      });
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      expect(() => toolbox.addLocalPlugin("any-plugin@owner")).toThrow(
        ConfigNotFoundError,
      );
    });
  });

  describe("removeGlobalPluginBinding", () => {
    it("removes bindings matching the given project path", () => {
      const keepBinding = {
        scope: "local",
        installPath: "/path/to/plugin",
        version: "1.0.0",
        installedAt: "2026-02-24T12:00:00.000Z",
        lastUpdated: "2026-02-24T12:00:00.000Z",
        gitCommitSha: "abc123",
        projectPath: "/Users/test/project-a",
      };
      const removeBinding = {
        scope: "local",
        installPath: "/path/to/plugin",
        version: "1.0.0",
        installedAt: "2026-02-24T13:00:00.000Z",
        lastUpdated: "2026-02-24T13:00:00.000Z",
        gitCommitSha: "abc123",
        projectPath: "/Users/test/project-b",
      };
      vi.mocked(mockGlobalConfig.read).mockReturnValue({
        plugins: {
          "my-plugin@owner": [keepBinding, removeBinding],
        },
      });
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      toolbox.removeGlobalPluginBinding(
        "my-plugin@owner",
        "/Users/test/project-b",
      );

      expect(mockGlobalConfig.update).toHaveBeenCalledWith({
        plugins: {
          "my-plugin@owner": [keepBinding],
        },
      });
    });

    it("leaves an empty array when all bindings are removed", () => {
      const binding = {
        scope: "local",
        installPath: "/path/to/plugin",
        version: "1.0.0",
        installedAt: "2026-02-24T12:00:00.000Z",
        lastUpdated: "2026-02-24T12:00:00.000Z",
        gitCommitSha: "abc123",
        projectPath: "/Users/test/project",
      };
      vi.mocked(mockGlobalConfig.read).mockReturnValue({
        plugins: {
          "my-plugin@owner": [binding],
        },
      });
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      toolbox.removeGlobalPluginBinding(
        "my-plugin@owner",
        "/Users/test/project",
      );

      expect(mockGlobalConfig.update).toHaveBeenCalledWith({
        plugins: {
          "my-plugin@owner": [],
        },
      });
    });

    it("writes unchanged config when plugin has no matching bindings", () => {
      const binding = {
        scope: "local",
        installPath: "/path/to/plugin",
        version: "1.0.0",
        installedAt: "2026-02-24T12:00:00.000Z",
        lastUpdated: "2026-02-24T12:00:00.000Z",
        gitCommitSha: "abc123",
        projectPath: "/Users/test/project-a",
      };
      vi.mocked(mockGlobalConfig.read).mockReturnValue({
        plugins: {
          "my-plugin@owner": [binding],
        },
      });
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      toolbox.removeGlobalPluginBinding(
        "my-plugin@owner",
        "/Users/test/other-project",
      );

      expect(mockGlobalConfig.update).toHaveBeenCalledWith({
        plugins: {
          "my-plugin@owner": [binding],
        },
      });
    });

    it("handles missing plugins field gracefully", () => {
      vi.mocked(mockGlobalConfig.read).mockReturnValue({});
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      toolbox.removeGlobalPluginBinding(
        "my-plugin@owner",
        "/Users/test/project",
      );

      expect(mockGlobalConfig.update).toHaveBeenCalledWith({
        plugins: {
          "my-plugin@owner": [],
        },
      });
    });

    it("propagates ConfigNotFoundError when config file is missing", () => {
      vi.mocked(mockGlobalConfig.read).mockImplementation(() => {
        throw new ConfigNotFoundError(
          "~/.claude/plugins/installed_plugins.json",
        );
      });
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      expect(() =>
        toolbox.removeGlobalPluginBinding(
          "my-plugin@owner",
          "/Users/test/project",
        ),
      ).toThrow(ConfigNotFoundError);
    });
  });

  describe("removeLocalPlugin", () => {
    it("removes a plugin from the enabled plugins map", () => {
      vi.mocked(mockLocalConfig.read).mockReturnValue({
        enabledPlugins: {
          "keep-plugin@owner": true,
          "remove-plugin@owner": true,
        },
      });
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      toolbox.removeLocalPlugin("remove-plugin@owner");

      expect(mockLocalConfig.update).toHaveBeenCalledWith({
        enabledPlugins: {
          "keep-plugin@owner": true,
        },
      });
    });

    it("writes config unchanged when plugin is not in enabled plugins", () => {
      vi.mocked(mockLocalConfig.read).mockReturnValue({
        enabledPlugins: {
          "existing-plugin@owner": true,
        },
      });
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      toolbox.removeLocalPlugin("nonexistent@owner");

      expect(mockLocalConfig.update).toHaveBeenCalledWith({
        enabledPlugins: {
          "existing-plugin@owner": true,
        },
      });
    });

    it("handles missing enabledPlugins field gracefully", () => {
      vi.mocked(mockLocalConfig.read).mockReturnValue({});
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      toolbox.removeLocalPlugin("any-plugin@owner");

      expect(mockLocalConfig.update).toHaveBeenCalledWith({
        enabledPlugins: {},
      });
    });

    it("propagates ConfigNotFoundError when local config file is missing", () => {
      vi.mocked(mockLocalConfig.read).mockImplementation(() => {
        throw new ConfigNotFoundError(".claude/settings.local.json");
      });
      const toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);

      expect(() => toolbox.removeLocalPlugin("any-plugin@owner")).toThrow(
        ConfigNotFoundError,
      );
    });
  });
});
