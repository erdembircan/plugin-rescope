import { describe, expect, it } from "vitest";
import pc from "picocolors";
import {
  formatAddSuccess,
  formatAlreadyConfigured,
  formatError,
  formatPluginNotFound,
  formatRemoveSuccess,
  formatVersionFound,
  formatVersionNotFound,
} from "#util/format-output.js";

describe("format-output", () => {
  describe("formatVersionFound", () => {
    it("includes the version number", () => {
      const result = formatVersionFound("1.0.26");
      expect(result).toContain("1.0.26");
    });

    it("includes a green checkmark", () => {
      const result = formatVersionFound("1.0.26");
      expect(result).toContain(pc.green("\u2713"));
    });

    it("includes 'Claude Code' label", () => {
      const result = formatVersionFound("1.0.26");
      expect(result).toContain("Claude Code");
    });
  });

  describe("formatVersionNotFound", () => {
    it("includes a red cross", () => {
      const result = formatVersionNotFound();
      expect(result).toContain(pc.red("\u2717"));
    });

    it("includes 'Claude Code not found' text", () => {
      const result = formatVersionNotFound();
      expect(result).toContain("Claude Code not found");
    });

    it("includes the download URL", () => {
      const result = formatVersionNotFound();
      expect(result).toContain("https://claude.ai/download");
    });
  });

  describe("formatAddSuccess", () => {
    it("includes the plugin name in bold", () => {
      const result = formatAddSuccess(
        "my-plugin@marketplace",
        "/Users/erdem/my-project",
        "local",
      );
      expect(result).toContain(pc.bold("my-plugin@marketplace"));
    });

    it("includes the project path as dim text", () => {
      const result = formatAddSuccess(
        "my-plugin@marketplace",
        "/Users/erdem/my-project",
        "local",
      );
      expect(result).toContain(pc.dim("/Users/erdem/my-project"));
    });

    it("includes the scope as dim text", () => {
      const result = formatAddSuccess(
        "my-plugin@marketplace",
        "/Users/erdem/my-project",
        "local",
      );
      expect(result).toContain(pc.dim("Scope: local"));
    });

    it("includes green checkmarks for found and rescoped lines", () => {
      const result = formatAddSuccess(
        "my-plugin@marketplace",
        "/Users/erdem/my-project",
        "local",
      );
      const raw = pc.green("\u2713");
      const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const checkmarks = result.match(new RegExp(escaped, "g"));
      expect(checkmarks).toHaveLength(2);
    });
  });

  describe("formatAlreadyConfigured", () => {
    it("includes a yellow tilde", () => {
      const result = formatAlreadyConfigured("my-plugin@marketplace");
      expect(result).toContain(pc.yellow("~"));
    });

    it("includes the plugin name in bold", () => {
      const result = formatAlreadyConfigured("my-plugin@marketplace");
      expect(result).toContain(pc.bold("my-plugin@marketplace"));
    });

    it("includes 'already configured' text", () => {
      const result = formatAlreadyConfigured("my-plugin@marketplace");
      expect(result).toContain("already configured");
    });
  });

  describe("formatPluginNotFound", () => {
    it("includes a red cross", () => {
      const result = formatPluginNotFound("my-plugin@marketplace");
      expect(result).toContain(pc.red("\u2717"));
    });

    it("includes the plugin name in bold", () => {
      const result = formatPluginNotFound("my-plugin@marketplace");
      expect(result).toContain(pc.bold("my-plugin@marketplace"));
    });

    it("includes 'not found in global' text", () => {
      const result = formatPluginNotFound("my-plugin@marketplace");
      expect(result).toContain("not found in global");
    });

    it("includes 'No workaround needed' as dim text", () => {
      const result = formatPluginNotFound("my-plugin@marketplace");
      expect(result).toContain(pc.dim("config. No workaround needed."));
    });
  });

  describe("formatRemoveSuccess", () => {
    it("includes a green checkmark", () => {
      const result = formatRemoveSuccess(
        "my-plugin@marketplace",
        "/Users/erdem/my-project",
      );
      expect(result).toContain(pc.green("\u2713"));
    });

    it("includes the plugin name in bold", () => {
      const result = formatRemoveSuccess(
        "my-plugin@marketplace",
        "/Users/erdem/my-project",
      );
      expect(result).toContain(pc.bold("my-plugin@marketplace"));
    });

    it("includes the project path as dim text", () => {
      const result = formatRemoveSuccess(
        "my-plugin@marketplace",
        "/Users/erdem/my-project",
      );
      expect(result).toContain(pc.dim("from /Users/erdem/my-project"));
    });
  });

  describe("formatError", () => {
    it("includes a red cross", () => {
      const result = formatError(
        "my-plugin@marketplace",
        "Config file not found: /path/to/file",
      );
      expect(result).toContain(pc.red("\u2717"));
    });

    it("includes the plugin name in bold", () => {
      const result = formatError(
        "my-plugin@marketplace",
        "Config file not found: /path/to/file",
      );
      expect(result).toContain(pc.bold("my-plugin@marketplace"));
    });

    it("includes the error message as dim text", () => {
      const result = formatError(
        "my-plugin@marketplace",
        "Config file not found: /path/to/file",
      );
      const expected = pc.dim("Config file not found: /path/to/file");
      expect(result).toContain(expected);
    });
  });
});
