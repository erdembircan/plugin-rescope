import { beforeEach, describe, expect, it, vi } from "vitest";
import { PluginRescope } from "#core/PluginRescope.js";
import { ClaudeCodeToolbox } from "#core/ClaudeCodeToolbox.js";
import { FlagParser } from "#util/FlagParser.js";
import { JsonConfig } from "#util/JsonConfig.js";

vi.mock("#util/JsonConfig.js");
vi.mock("#util/ShellCommand.js");

describe("PluginRescope", () => {
  let mockGlobalConfig: JsonConfig;
  let mockLocalConfig: JsonConfig;
  let toolbox: ClaudeCodeToolbox;
  let flagParser: FlagParser<"scope">;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGlobalConfig = new JsonConfig("fake-global-path");
    mockLocalConfig = new JsonConfig("fake-local-path");
    toolbox = new ClaudeCodeToolbox(mockGlobalConfig, mockLocalConfig);
    flagParser = new FlagParser(["scope"]);
  });

  describe("rescope", () => {
    it("throws when Claude is not installed", () => {
      vi.spyOn(toolbox, "validateInstallation").mockReturnValue(false);
      const rescope = new PluginRescope(
        toolbox,
        flagParser,
        "/Users/test/project",
      );

      expect(() =>
        rescope.rescope(["--scope", "local", "my-plugin@owner"]),
      ).toThrow("Claude is not installed");
    });

    it("returns a not-found message when the plugin is not in global config", () => {
      vi.spyOn(toolbox, "validateInstallation").mockReturnValue("1.0.27");
      vi.spyOn(toolbox, "getGlobalPluginConfig").mockReturnValue([]);
      const rescope = new PluginRescope(
        toolbox,
        flagParser,
        "/Users/test/project",
      );

      const result = rescope.rescope(["--scope", "local", "my-plugin@owner"]);

      expect(result).toContain("my-plugin@owner");
      expect(result).toContain("No workaround needed");
    });

    it("registers the plugin in global and local config when found", () => {
      vi.spyOn(toolbox, "validateInstallation").mockReturnValue("1.0.27");
      vi.spyOn(toolbox, "getGlobalPluginConfig").mockReturnValue([
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
      const addGlobalSpy = vi
        .spyOn(toolbox, "addGlobalPluginBinding")
        .mockImplementation(() => {});
      const addLocalSpy = vi
        .spyOn(toolbox, "addLocalPlugin")
        .mockImplementation(() => {});
      const rescope = new PluginRescope(
        toolbox,
        flagParser,
        "/Users/test/my-project",
      );

      const result = rescope.rescope(["--scope", "local", "my-plugin@owner"]);

      expect(addGlobalSpy).toHaveBeenCalledWith(
        "my-plugin@owner",
        expect.objectContaining({
          scope: "local",
          installPath: "/path/to/plugin",
          version: "1.0.0",
          gitCommitSha: "abc123",
          projectPath: "/Users/test/my-project",
        }),
      );
      expect(addLocalSpy).toHaveBeenCalledWith("my-plugin@owner");
      expect(result).toContain("my-plugin@owner");
      expect(result).toContain("/Users/test/my-project");
    });

    it("preserves the original scope when --scope is not provided", () => {
      vi.spyOn(toolbox, "validateInstallation").mockReturnValue("1.0.27");
      vi.spyOn(toolbox, "getGlobalPluginConfig").mockReturnValue([
        {
          scope: "global",
          installPath: "/path/to/plugin",
          version: "2.0.0",
          installedAt: "2026-02-24T12:00:00.000Z",
          lastUpdated: "2026-02-24T12:00:00.000Z",
          gitCommitSha: "def456",
          projectPath: "/Users/test/other-project",
        },
      ]);
      const addGlobalSpy = vi
        .spyOn(toolbox, "addGlobalPluginBinding")
        .mockImplementation(() => {});
      vi.spyOn(toolbox, "addLocalPlugin").mockImplementation(() => {});
      const rescope = new PluginRescope(
        toolbox,
        flagParser,
        "/Users/test/project",
      );

      rescope.rescope(["my-plugin@owner"]);

      expect(addGlobalSpy).toHaveBeenCalledWith(
        "my-plugin@owner",
        expect.objectContaining({
          scope: "global",
        }),
      );
    });

    it("copies installPath, version, and gitCommitSha from the first existing binding", () => {
      vi.spyOn(toolbox, "validateInstallation").mockReturnValue("1.0.27");
      vi.spyOn(toolbox, "getGlobalPluginConfig").mockReturnValue([
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
      const addGlobalSpy = vi
        .spyOn(toolbox, "addGlobalPluginBinding")
        .mockImplementation(() => {});
      vi.spyOn(toolbox, "addLocalPlugin").mockImplementation(() => {});
      const rescope = new PluginRescope(
        toolbox,
        flagParser,
        "/Users/test/new-project",
      );

      rescope.rescope(["--scope", "local", "my-plugin@owner"]);

      expect(addGlobalSpy).toHaveBeenCalledWith(
        "my-plugin@owner",
        expect.objectContaining({
          installPath: "/specific/install/path",
          version: "3.2.1",
          gitCommitSha: "sha789",
          installedAt: "2026-01-01T00:00:00.000Z",
        }),
      );
    });

    it("does not call addGlobalPluginBinding or addLocalPlugin when plugin is not found", () => {
      vi.spyOn(toolbox, "validateInstallation").mockReturnValue("1.0.27");
      vi.spyOn(toolbox, "getGlobalPluginConfig").mockReturnValue([]);
      const addGlobalSpy = vi.spyOn(toolbox, "addGlobalPluginBinding");
      const addLocalSpy = vi.spyOn(toolbox, "addLocalPlugin");
      const rescope = new PluginRescope(
        toolbox,
        flagParser,
        "/Users/test/project",
      );

      rescope.rescope(["--scope", "local", "nonexistent@owner"]);

      expect(addGlobalSpy).not.toHaveBeenCalled();
      expect(addLocalSpy).not.toHaveBeenCalled();
    });

    it("does not check the global config when Claude is not installed", () => {
      vi.spyOn(toolbox, "validateInstallation").mockReturnValue(false);
      const getConfigSpy = vi.spyOn(toolbox, "getGlobalPluginConfig");
      const rescope = new PluginRescope(
        toolbox,
        flagParser,
        "/Users/test/project",
      );

      expect(() =>
        rescope.rescope(["--scope", "local", "my-plugin@owner"]),
      ).toThrow();

      expect(getConfigSpy).not.toHaveBeenCalled();
    });
  });
});
