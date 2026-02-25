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
    it("shows usage message when no plugin names are provided", () => {
      const rescope = new PluginRescope("/Users/test/my-project");
      rescope.rescope(["--scope", "local"]);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Usage: plugin-rescope [--scope <scope>] <plugin> [<plugin> ...]",
      );
    });

    it("shows usage message when args is empty", () => {
      const rescope = new PluginRescope("/Users/test/my-project");
      rescope.rescope([]);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Usage: plugin-rescope [--scope <scope>] <plugin> [<plugin> ...]",
      );
    });

    it("does not create a toolbox when no plugin names are provided", () => {
      const rescope = new PluginRescope("/Users/test/my-project");
      rescope.rescope([]);

      expect(ClaudeCodeToolbox).not.toHaveBeenCalled();
    });

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
      vi.mocked(ClaudeCodeToolbox.prototype.getEnabledPlugins).mockReturnValue(
        {},
      );

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
      vi.mocked(ClaudeCodeToolbox.prototype.getEnabledPlugins).mockReturnValue(
        {},
      );

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

    it("exits without writing configs when both global binding and local plugin already exist", () => {
      vi.mocked(
        ClaudeCodeToolbox.prototype.validateInstallation,
      ).mockReturnValue("1.0.27");
      vi.mocked(
        ClaudeCodeToolbox.prototype.getGlobalPluginConfig,
      ).mockReturnValue([
        {
          scope: "local",
          installPath: "/path/to/plugin",
          version: "1.0.0",
          installedAt: "2026-02-24T12:00:00.000Z",
          lastUpdated: "2026-02-24T12:00:00.000Z",
          gitCommitSha: "abc123",
          projectPath: "/Users/test/my-project",
        },
      ]);
      vi.mocked(ClaudeCodeToolbox.prototype.getEnabledPlugins).mockReturnValue({
        "my-plugin@owner": true,
      });

      const rescope = new PluginRescope("/Users/test/my-project");
      rescope.rescope(["--scope", "local", "my-plugin@owner"]);

      const mockToolbox = getToolboxInstance();
      expect(mockToolbox.addGlobalPluginBinding).not.toHaveBeenCalled();
      expect(mockToolbox.addLocalPlugin).not.toHaveBeenCalled();
    });

    it("still adds local plugin when global binding exists but local plugin is not enabled", () => {
      vi.mocked(
        ClaudeCodeToolbox.prototype.validateInstallation,
      ).mockReturnValue("1.0.27");
      vi.mocked(
        ClaudeCodeToolbox.prototype.getGlobalPluginConfig,
      ).mockReturnValue([
        {
          scope: "local",
          installPath: "/path/to/plugin",
          version: "1.0.0",
          installedAt: "2026-02-24T12:00:00.000Z",
          lastUpdated: "2026-02-24T12:00:00.000Z",
          gitCommitSha: "abc123",
          projectPath: "/Users/test/my-project",
        },
      ]);
      vi.mocked(ClaudeCodeToolbox.prototype.getEnabledPlugins).mockReturnValue(
        {},
      );

      const rescope = new PluginRescope("/Users/test/my-project");
      rescope.rescope(["--scope", "local", "my-plugin@owner"]);

      const mockToolbox = getToolboxInstance();
      expect(mockToolbox.addGlobalPluginBinding).not.toHaveBeenCalled();
      expect(mockToolbox.addLocalPlugin).toHaveBeenCalledWith(
        "my-plugin@owner",
      );
    });

    it("still adds global binding when local plugin is already enabled but global binding is missing", () => {
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
      vi.mocked(ClaudeCodeToolbox.prototype.getEnabledPlugins).mockReturnValue({
        "my-plugin@owner": true,
      });

      const rescope = new PluginRescope("/Users/test/my-project");
      rescope.rescope(["--scope", "local", "my-plugin@owner"]);

      const mockToolbox = getToolboxInstance();
      expect(mockToolbox.addGlobalPluginBinding).toHaveBeenCalled();
      expect(mockToolbox.addLocalPlugin).not.toHaveBeenCalled();
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

    it("reflects the error message to the user when a utility class fails", () => {
      const error = new ConfigNotFoundError("/path/to/config.json");
      vi.mocked(
        ClaudeCodeToolbox.prototype.validateInstallation,
      ).mockReturnValue("1.0.27");
      vi.mocked(
        ClaudeCodeToolbox.prototype.getGlobalPluginConfig,
      ).mockImplementation(() => {
        throw error;
      });

      const rescope = new PluginRescope("/Users/test/project");
      rescope.rescope(["--scope", "local", "my-plugin@owner"]);

      expect(consoleSpy).toHaveBeenCalledWith(error.message);
    });

    it("rescopes multiple plugins in sequence", () => {
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
      vi.mocked(ClaudeCodeToolbox.prototype.getEnabledPlugins).mockReturnValue(
        {},
      );

      const rescope = new PluginRescope("/Users/test/my-project");
      rescope.rescope(["--scope", "local", "plugin-a@owner", "plugin-b@owner"]);

      const mockToolbox = getToolboxInstance();
      expect(mockToolbox.addGlobalPluginBinding).toHaveBeenCalledWith(
        "plugin-a@owner",
        expect.objectContaining({ projectPath: "/Users/test/my-project" }),
      );
      expect(mockToolbox.addGlobalPluginBinding).toHaveBeenCalledWith(
        "plugin-b@owner",
        expect.objectContaining({ projectPath: "/Users/test/my-project" }),
      );
      expect(mockToolbox.addLocalPlugin).toHaveBeenCalledWith("plugin-a@owner");
      expect(mockToolbox.addLocalPlugin).toHaveBeenCalledWith("plugin-b@owner");
    });

    it("continues rescoping remaining plugins when one is not found", () => {
      vi.mocked(
        ClaudeCodeToolbox.prototype.validateInstallation,
      ).mockReturnValue("1.0.27");
      vi.mocked(ClaudeCodeToolbox.prototype.getGlobalPluginConfig)
        .mockReturnValueOnce([])
        .mockReturnValueOnce([
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
      vi.mocked(ClaudeCodeToolbox.prototype.getEnabledPlugins).mockReturnValue(
        {},
      );

      const rescope = new PluginRescope("/Users/test/my-project");
      rescope.rescope(["--scope", "local", "missing@owner", "found@owner"]);

      const mockToolbox = getToolboxInstance();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Plugin "missing@owner" not found in global config. No workaround needed.',
      );
      expect(mockToolbox.addGlobalPluginBinding).toHaveBeenCalledWith(
        "found@owner",
        expect.objectContaining({ projectPath: "/Users/test/my-project" }),
      );
    });

    it("continues rescoping remaining plugins when one throws an error", () => {
      const error = new ConfigNotFoundError("/path/to/config.json");
      vi.mocked(
        ClaudeCodeToolbox.prototype.validateInstallation,
      ).mockReturnValue("1.0.27");
      vi.mocked(ClaudeCodeToolbox.prototype.getGlobalPluginConfig)
        .mockImplementationOnce(() => {
          throw error;
        })
        .mockReturnValueOnce([
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
      vi.mocked(ClaudeCodeToolbox.prototype.getEnabledPlugins).mockReturnValue(
        {},
      );

      const rescope = new PluginRescope("/Users/test/my-project");
      rescope.rescope(["--scope", "local", "failing@owner", "working@owner"]);

      const mockToolbox = getToolboxInstance();
      expect(consoleSpy).toHaveBeenCalledWith(error.message);
      expect(mockToolbox.addGlobalPluginBinding).toHaveBeenCalledWith(
        "working@owner",
        expect.objectContaining({ projectPath: "/Users/test/my-project" }),
      );
    });

    it("reports already-configured plugins and continues with the rest", () => {
      vi.mocked(
        ClaudeCodeToolbox.prototype.validateInstallation,
      ).mockReturnValue("1.0.27");
      vi.mocked(ClaudeCodeToolbox.prototype.getGlobalPluginConfig)
        .mockReturnValueOnce([
          {
            scope: "local",
            installPath: "/path/to/plugin",
            version: "1.0.0",
            installedAt: "2026-02-24T12:00:00.000Z",
            lastUpdated: "2026-02-24T12:00:00.000Z",
            gitCommitSha: "abc123",
            projectPath: "/Users/test/my-project",
          },
        ])
        .mockReturnValueOnce([
          {
            scope: "global",
            installPath: "/path/to/other",
            version: "2.0.0",
            installedAt: "2026-02-24T12:00:00.000Z",
            lastUpdated: "2026-02-24T12:00:00.000Z",
            gitCommitSha: "def456",
            projectPath: "/Users/test/other-project",
          },
        ]);
      vi.mocked(ClaudeCodeToolbox.prototype.getEnabledPlugins)
        .mockReturnValueOnce({ "configured@owner": true })
        .mockReturnValueOnce({});

      const rescope = new PluginRescope("/Users/test/my-project");
      rescope.rescope(["--scope", "local", "configured@owner", "new@owner"]);

      const mockToolbox = getToolboxInstance();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Plugin "configured@owner" is already configured for this project. If it is not working, the issue may be outside the scope of this package.',
      );
      expect(mockToolbox.addGlobalPluginBinding).toHaveBeenCalledWith(
        "new@owner",
        expect.objectContaining({ projectPath: "/Users/test/my-project" }),
      );
    });
  });
});
