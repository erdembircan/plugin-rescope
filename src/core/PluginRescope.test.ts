import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PluginRescope } from "#core/PluginRescope.js";
import { ClaudeCodeToolbox } from "#core/ClaudeCodeToolbox.js";
import { ConfigNotFoundError } from "#util/ConfigNotFoundError.js";

vi.mock("#core/ClaudeCodeToolbox.js");
vi.mock("#util/JsonConfig.js");

describe("PluginRescope", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  /**
   * Helper: returns the mock ClaudeCodeToolbox instance created during
   * the most recent `rescope()` call.
   */
  function getToolboxInstance(): ClaudeCodeToolbox {
    const instances = vi.mocked(ClaudeCodeToolbox).mock.instances;
    return instances[instances.length - 1]!;
  }

  describe("rescope", () => {
    it("registers the plugin in global and local config when found", () => {
      vi.mocked(
        ClaudeCodeToolbox.prototype.validateInstallation,
      ).mockReturnValue("1.0.27");
      vi.mocked(
        ClaudeCodeToolbox.prototype.getGlobalPluginConfig,
      ).mockReturnValue([
        {
          scope: "global",
          installPath: "/path/to/plugin",
          version: "1.0.0",
          installedAt: "2026-02-24T12:00:00.000Z",
          lastUpdated: "2026-02-24T12:00:00.000Z",
          gitCommitSha: "abc123",
          projectPath: "/Users/test/other-project",
        },
      ]);

      const rescope = new PluginRescope("/Users/test/my-project");
      rescope.rescope(["--scope", "local", "my-plugin@owner"]);

      const mockToolbox = getToolboxInstance();
      expect(mockToolbox.addGlobalPluginBinding).toHaveBeenCalledWith(
        "my-plugin@owner",
        expect.objectContaining({
          scope: "local",
          installPath: "/path/to/plugin",
          version: "1.0.0",
          gitCommitSha: "abc123",
          projectPath: "/Users/test/my-project",
        }),
      );
      expect(mockToolbox.addLocalPlugin).toHaveBeenCalledWith(
        "my-plugin@owner",
      );
    });

    it("copies installPath, version, and gitCommitSha from the first existing binding", () => {
      vi.mocked(
        ClaudeCodeToolbox.prototype.validateInstallation,
      ).mockReturnValue("1.0.27");
      vi.mocked(
        ClaudeCodeToolbox.prototype.getGlobalPluginConfig,
      ).mockReturnValue([
        {
          scope: "local",
          installPath: "/specific/install/path",
          version: "3.2.1",
          installedAt: "2026-01-01T00:00:00.000Z",
          lastUpdated: "2026-01-15T00:00:00.000Z",
          gitCommitSha: "sha789",
          projectPath: "/Users/test/original",
        },
        {
          scope: "local",
          installPath: "/other/path",
          version: "3.2.1",
          installedAt: "2026-02-01T00:00:00.000Z",
          lastUpdated: "2026-02-15T00:00:00.000Z",
          gitCommitSha: "sha999",
          projectPath: "/Users/test/second",
        },
      ]);

      const rescope = new PluginRescope("/Users/test/new-project");
      rescope.rescope(["--scope", "local", "my-plugin@owner"]);

      const mockToolbox = getToolboxInstance();
      expect(mockToolbox.addGlobalPluginBinding).toHaveBeenCalledWith(
        "my-plugin@owner",
        expect.objectContaining({
          installPath: "/specific/install/path",
          version: "3.2.1",
          gitCommitSha: "sha789",
          installedAt: "2026-01-01T00:00:00.000Z",
        }),
      );
    });

    it("does not modify configs when plugin is absent from global config", () => {
      vi.mocked(
        ClaudeCodeToolbox.prototype.validateInstallation,
      ).mockReturnValue("1.0.27");
      vi.mocked(
        ClaudeCodeToolbox.prototype.getGlobalPluginConfig,
      ).mockReturnValue([]);

      const rescope = new PluginRescope("/Users/test/project");
      rescope.rescope(["--scope", "local", "nonexistent@owner"]);

      const mockToolbox = getToolboxInstance();
      expect(mockToolbox.addGlobalPluginBinding).not.toHaveBeenCalled();
      expect(mockToolbox.addLocalPlugin).not.toHaveBeenCalled();
    });

    it("does not query global config when Claude is not installed", () => {
      vi.mocked(
        ClaudeCodeToolbox.prototype.validateInstallation,
      ).mockReturnValue(false);

      const rescope = new PluginRescope("/Users/test/project");
      rescope.rescope(["--scope", "local", "my-plugin@owner"]);

      const mockToolbox = getToolboxInstance();
      expect(mockToolbox.getGlobalPluginConfig).not.toHaveBeenCalled();
    });

    it("does not throw when a utility class raises an error", () => {
      vi.mocked(
        ClaudeCodeToolbox.prototype.validateInstallation,
      ).mockReturnValue("1.0.27");
      vi.mocked(
        ClaudeCodeToolbox.prototype.getGlobalPluginConfig,
      ).mockImplementation(() => {
        throw new ConfigNotFoundError("/path/to/config.json");
      });

      const rescope = new PluginRescope("/Users/test/project");
      expect(() =>
        rescope.rescope(["--scope", "local", "my-plugin@owner"]),
      ).not.toThrow();
    });
  });
});
