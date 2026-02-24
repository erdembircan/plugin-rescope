import { beforeEach, describe, expect, it, vi } from "vitest";
import { PluginRescope } from "#core/PluginRescope.js";
import { ClaudeCodeToolbox } from "#core/ClaudeCodeToolbox.js";

vi.mock("#core/ClaudeCodeToolbox.js");
vi.mock("#util/JsonConfig.js");

describe("PluginRescope", () => {
  let mockToolbox: ClaudeCodeToolbox;

  beforeEach(() => {
    vi.clearAllMocks();
    mockToolbox = vi.mocked(ClaudeCodeToolbox).mock.instances[0]!;
  });

  describe("rescope", () => {
    it("prints a message when Claude is not installed", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const rescope = new PluginRescope("/Users/test/project");
      mockToolbox = vi.mocked(ClaudeCodeToolbox).mock.instances[0]!;
      vi.mocked(mockToolbox.validateInstallation).mockReturnValue(false);

      rescope.rescope(["--scope", "local", "my-plugin@owner"]);

      expect(consoleSpy).toHaveBeenCalledWith("Claude is not installed.");
      consoleSpy.mockRestore();
    });

    it("registers the plugin in global and local config when found", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const rescope = new PluginRescope("/Users/test/my-project");
      mockToolbox = vi.mocked(ClaudeCodeToolbox).mock.instances[0]!;
      vi.mocked(mockToolbox.validateInstallation).mockReturnValue("1.0.27");
      vi.mocked(mockToolbox.getGlobalPluginConfig).mockReturnValue([
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

      rescope.rescope(["--scope", "local", "my-plugin@owner"]);

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
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("my-plugin@owner"),
      );
      consoleSpy.mockRestore();
    });

    it("copies installPath, version, and gitCommitSha from the first existing binding", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const rescope = new PluginRescope("/Users/test/new-project");
      mockToolbox = vi.mocked(ClaudeCodeToolbox).mock.instances[0]!;
      vi.mocked(mockToolbox.validateInstallation).mockReturnValue("1.0.27");
      vi.mocked(mockToolbox.getGlobalPluginConfig).mockReturnValue([
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

      rescope.rescope(["--scope", "local", "my-plugin@owner"]);

      expect(mockToolbox.addGlobalPluginBinding).toHaveBeenCalledWith(
        "my-plugin@owner",
        expect.objectContaining({
          installPath: "/specific/install/path",
          version: "3.2.1",
          gitCommitSha: "sha789",
          installedAt: "2026-01-01T00:00:00.000Z",
        }),
      );
      consoleSpy.mockRestore();
    });

    it("prints a not-found message and does not modify configs when plugin is absent", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const rescope = new PluginRescope("/Users/test/project");
      mockToolbox = vi.mocked(ClaudeCodeToolbox).mock.instances[0]!;
      vi.mocked(mockToolbox.validateInstallation).mockReturnValue("1.0.27");
      vi.mocked(mockToolbox.getGlobalPluginConfig).mockReturnValue([]);

      rescope.rescope(["--scope", "local", "nonexistent@owner"]);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("No workaround needed"),
      );
      expect(mockToolbox.addGlobalPluginBinding).not.toHaveBeenCalled();
      expect(mockToolbox.addLocalPlugin).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("prints a not-installed message and does not query global config when Claude is missing", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const rescope = new PluginRescope("/Users/test/project");
      mockToolbox = vi.mocked(ClaudeCodeToolbox).mock.instances[0]!;
      vi.mocked(mockToolbox.validateInstallation).mockReturnValue(false);

      rescope.rescope(["--scope", "local", "my-plugin@owner"]);

      expect(consoleSpy).toHaveBeenCalledWith("Claude is not installed.");
      expect(mockToolbox.getGlobalPluginConfig).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
