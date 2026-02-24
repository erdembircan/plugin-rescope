import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClaudeCodeToolbox } from "./ClaudeCodeToolbox.js";
import { ConfigNotFoundError } from "../util/ConfigNotFoundError.js";
import { ShellCommandError } from "../util/ShellCommandError.js";

const { mockRead, mockUpdate, mockExecute } = vi.hoisted(() => {
  const mockRead = vi.fn();
  const mockUpdate = vi.fn();
  const mockExecute = vi.fn();

  return { mockRead, mockUpdate, mockExecute };
});

vi.mock("../util/JsonConfig.js", () => ({
  JsonConfig: class MockJsonConfig {
    read = mockRead;
    update = mockUpdate;
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
      mockRead.mockReturnValue({
        version: 2,
        plugins: {
          "testing-philosophy@erdembircan-plugins": bindings,
        },
      });
      const toolbox = new ClaudeCodeToolbox();

      const result = toolbox.getGlobalPluginConfig(
        "testing-philosophy@erdembircan-plugins",
      );

      expect(result).toEqual(bindings);
    });

    it("returns an empty array when the plugin is not found", () => {
      mockRead.mockReturnValue({
        version: 2,
        plugins: {},
      });
      const toolbox = new ClaudeCodeToolbox();

      const result = toolbox.getGlobalPluginConfig("nonexistent@owner");

      expect(result).toEqual([]);
    });

    it("propagates ConfigNotFoundError when config file is missing", () => {
      mockRead.mockImplementation(() => {
        throw new ConfigNotFoundError(
          "~/.claude/plugins/installed_plugins.json",
        );
      });
      const toolbox = new ClaudeCodeToolbox();

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
      mockRead.mockReturnValue({
        version: 2,
        plugins: {
          "my-plugin@owner": [existingBinding],
        },
      });
      const toolbox = new ClaudeCodeToolbox();

      toolbox.addGlobalPluginBinding("my-plugin@owner", newBinding);

      expect(mockUpdate).toHaveBeenCalledWith({
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
      mockRead.mockReturnValue({
        version: 2,
        plugins: {},
      });
      const toolbox = new ClaudeCodeToolbox();

      toolbox.addGlobalPluginBinding("new-plugin@owner", newBinding);

      expect(mockUpdate).toHaveBeenCalledWith({
        version: 2,
        plugins: {
          "new-plugin@owner": [newBinding],
        },
      });
    });
  });
});
