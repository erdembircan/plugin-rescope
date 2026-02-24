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

  it("extracts the positional argument", () => {
    const parser = new FlagParser(["scope"]);
    const result = parser.parse(["my-plugin"]);

    expect(result.positional).toBe("my-plugin");
  });

  it("defaults positional to empty string when not provided", () => {
    const parser = new FlagParser(["scope"]);
    const result = parser.parse(["--scope", "local"]);

    expect(result.positional).toBe("");
  });

  it("parses a mix of flags and positional argument", () => {
    const parser = new FlagParser(["scope"]);
    const result = parser.parse(["--scope", "local", "my-plugin"]);

    expect(result.flags["scope"]).toBe("local");
    expect(result.positional).toBe("my-plugin");
  });

  it("handles positional argument before flags", () => {
    const parser = new FlagParser(["scope"]);
    const result = parser.parse(["my-plugin", "--scope", "local"]);

    expect(result.flags["scope"]).toBe("local");
    expect(result.positional).toBe("my-plugin");
  });

  it("returns all empty values when args is empty", () => {
    const parser = new FlagParser(["scope", "output"]);
    const result = parser.parse([]);

    expect(result.flags["scope"]).toBe("");
    expect(result.flags["output"]).toBe("");
    expect(result.positional).toBe("");
  });

  it("throws when a flag name includes the -- prefix", () => {
    expect(() => new FlagParser(["--scope"])).toThrow(
      'Flag "--scope" must not include the "--" prefix. Use "scope" instead.',
    );
  });
});
