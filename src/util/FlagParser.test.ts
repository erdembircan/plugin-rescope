import { describe, expect, it } from "vitest";
import { FlagParser } from "#util/FlagParser.js";

describe("FlagParser", () => {
  it("parses flags with their values", () => {
    const parser = new FlagParser(["scope", "output"]);
    const result = parser.parse(["--scope", "local", "--output", "dist"]);

    expect(result.flags["scope"]).toBe("local");
    expect(result.flags["output"]).toBe("dist");
  });

  it("defaults missing flags to empty string", () => {
    const parser = new FlagParser(["scope", "output"]);
    const result = parser.parse(["--scope", "local"]);

    expect(result.flags["scope"]).toBe("local");
    expect(result.flags["output"]).toBe("");
  });

  it("extracts a single positional argument", () => {
    const parser = new FlagParser(["scope"]);
    const result = parser.parse(["my-plugin"]);

    expect(result.positionals).toEqual(["my-plugin"]);
  });

  it("returns empty array when no positionals are provided", () => {
    const parser = new FlagParser(["scope"]);
    const result = parser.parse(["--scope", "local"]);

    expect(result.positionals).toEqual([]);
  });

  it("parses a mix of flags and positional argument", () => {
    const parser = new FlagParser(["scope"]);
    const result = parser.parse(["--scope", "local", "my-plugin"]);

    expect(result.flags["scope"]).toBe("local");
    expect(result.positionals).toEqual(["my-plugin"]);
  });

  it("handles positional argument before flags", () => {
    const parser = new FlagParser(["scope"]);
    const result = parser.parse(["my-plugin", "--scope", "local"]);

    expect(result.flags["scope"]).toBe("local");
    expect(result.positionals).toEqual(["my-plugin"]);
  });

  it("returns all empty values when args is empty", () => {
    const parser = new FlagParser(["scope", "output"]);
    const result = parser.parse([]);

    expect(result.flags["scope"]).toBe("");
    expect(result.flags["output"]).toBe("");
    expect(result.positionals).toEqual([]);
  });

  it("auto-corrects flag names that include the -- prefix", () => {
    const parser: FlagParser<string> = new FlagParser(["--scope"]);
    const result = parser.parse(["--scope", "local"]);

    expect(result.flags["scope"]).toBe("local");
  });

  it("trims whitespace from flag names", () => {
    const parser: FlagParser<string> = new FlagParser(["  scope  "]);
    const result = parser.parse(["--scope", "local"]);

    expect(result.flags["scope"]).toBe("local");
  });

  it("removes internal spaces from flag names", () => {
    const parser: FlagParser<string> = new FlagParser(["my flag"]);
    const result = parser.parse(["--myflag", "value"]);

    expect(result.flags["myflag"]).toBe("value");
  });

  it("collects multiple positional arguments in order", () => {
    const parser = new FlagParser(["scope"]);
    const result = parser.parse([
      "--scope",
      "local",
      "plugin-a",
      "plugin-b",
      "plugin-c",
    ]);

    expect(result.flags["scope"]).toBe("local");
    expect(result.positionals).toEqual(["plugin-a", "plugin-b", "plugin-c"]);
  });

  it("collects positionals interspersed with flags", () => {
    const parser = new FlagParser(["scope", "output"]);
    const result = parser.parse([
      "plugin-a",
      "--scope",
      "local",
      "plugin-b",
      "--output",
      "dist",
      "plugin-c",
    ]);

    expect(result.flags["scope"]).toBe("local");
    expect(result.flags["output"]).toBe("dist");
    expect(result.positionals).toEqual(["plugin-a", "plugin-b", "plugin-c"]);
  });

  it("returns empty string for command when no commands are configured", () => {
    const parser = new FlagParser(["scope"]);
    const result = parser.parse(["--scope", "local", "my-plugin"]);

    expect(result.command).toBe("");
  });

  describe("command extraction", () => {
    it("extracts a matching command from the first argument", () => {
      const parser = new FlagParser(["scope"], {
        commands: ["add", "remove"],
        default: "add",
      });
      const result = parser.parse(["add", "--scope", "local", "my-plugin"]);

      expect(result.command).toBe("add");
      expect(result.flags["scope"]).toBe("local");
      expect(result.positionals).toEqual(["my-plugin"]);
    });

    it("extracts the remove command from the first argument", () => {
      const parser = new FlagParser(["scope"], {
        commands: ["add", "remove"],
        default: "add",
      });
      const result = parser.parse(["remove", "my-plugin"]);

      expect(result.command).toBe("remove");
      expect(result.positionals).toEqual(["my-plugin"]);
    });

    it("falls back to the configured default when the first argument is not a command", () => {
      const parser = new FlagParser(["scope"], {
        commands: ["add", "remove"],
        default: "add",
      });
      const result = parser.parse(["--scope", "local", "my-plugin"]);

      expect(result.command).toBe("add");
      expect(result.flags["scope"]).toBe("local");
      expect(result.positionals).toEqual(["my-plugin"]);
    });

    it("does not consume a non-command first argument as a command", () => {
      const parser = new FlagParser(["scope"], {
        commands: ["add", "remove"],
        default: "add",
      });
      const result = parser.parse(["my-plugin"]);

      expect(result.command).toBe("add");
      expect(result.positionals).toEqual(["my-plugin"]);
    });

    it("falls back to the configured default when args is empty", () => {
      const parser = new FlagParser(["scope"], {
        commands: ["add", "remove"],
        default: "add",
      });
      const result = parser.parse([]);

      expect(result.command).toBe("add");
      expect(result.positionals).toEqual([]);
    });

    it("returns the command with no positionals when only a command is given", () => {
      const parser = new FlagParser(["scope"], {
        commands: ["add", "remove"],
        default: "add",
      });
      const result = parser.parse(["remove"]);

      expect(result.command).toBe("remove");
      expect(result.positionals).toEqual([]);
    });

    it("extracts command alongside flags and multiple positionals", () => {
      const parser = new FlagParser(["scope"], {
        commands: ["add", "remove"],
        default: "add",
      });
      const result = parser.parse([
        "add",
        "--scope",
        "local",
        "plugin-a",
        "plugin-b",
      ]);

      expect(result.command).toBe("add");
      expect(result.flags["scope"]).toBe("local");
      expect(result.positionals).toEqual(["plugin-a", "plugin-b"]);
    });

    it("uses a non-first command as the default when configured", () => {
      const parser = new FlagParser(["scope"], {
        commands: ["add", "remove"],
        default: "remove",
      });
      const result = parser.parse(["my-plugin"]);

      expect(result.command).toBe("remove");
      expect(result.positionals).toEqual(["my-plugin"]);
    });
  });
});
